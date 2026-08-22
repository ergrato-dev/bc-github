# Pinning y dependencias del workflow

> Cada línea `uses:` de tus workflows es una dependencia de código ejecutable con
> acceso a tus secretos. Un tag no es una versión: es un puntero que su autor
> puede mover esta noche.

## 🎯 Objetivos

- Explicar por qué un tag flotante es una promesa que el otro puede romper
- Pinnear cualquier action por SHA y mantener el pin al día con Dependabot
- Activar y sobrevivir a la política `sha_pinning_required`
- Revisar una action de terceros antes de meterla en tu pipeline
- Detectar problemas antes del push con `actionlint` y `zizmor`

## 1. Qué problema resuelve

En marzo de 2025, alguien obtuvo permisos sobre `tj-actions/changed-files` y
**reescribió los tags existentes** para que apuntaran a un commit con un script
que volcaba la memoria del proceso del runner en el log. Más de veinte mil
repositorios ejecutaron ese código sin cambiar una sola línea de sus workflows.
Los que tenían logs públicos publicaron sus secretos
([GHSA-mrrh-fwg8-r2c3](https://github.com/advisories/GHSA-mrrh-fwg8-r2c3)).

Nadie mergeó nada. Nadie aprobó nada. El `uses: tj-actions/changed-files@v35`
que llevaba dos años ahí, un día, significó otra cosa.

## 2. Qué significa cada forma de referenciar

```yaml
uses: actions/checkout@main                                        # una rama
uses: actions/checkout@v7                                          # tag mayor, se mueve
uses: actions/checkout@v7.0.1                                      # tag exacto… movible
uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1    # un commit
```

| Referencia | Quién decide qué código corre | Cuándo cambia |
|------------|-------------------------------|---------------|
| Rama | El mantenedor | En cada push suyo |
| Tag mayor (`v7`) | El mantenedor | En cada release menor o de parche |
| Tag exacto (`v7.0.1`) | El mantenedor | Cuando quiera: **un tag se puede mover** |
| SHA completo | La criptografía | Nunca |

Las tres primeras filas son la misma fila con distinta frecuencia. Solo la cuarta
es una versión de verdad.

## 3. Pinnear por SHA, con el tag en el comentario

```yaml
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
```

El comentario no es decorativo: es lo único legible del par. Sin él, revisar un
PR que sube un pin es comparar dos cadenas de cuarenta caracteres.

Obtener el SHA de un tag, sin abrir el navegador:

```bash
gh api repos/actions/checkout/tags \
  --jq '.[] | select(.name == "v7.0.1") | .commit.sha'
```

Auditar lo que ya tienes:

```bash
grep -rn "uses:" .github/workflows .github/actions \
  | grep -v "@[0-9a-f]\{40\}" \
  | grep -v "uses: *\./"
```

Lo que salga son tus dependencias sin pinnear. Las locales (`./…`) no cuentan:
ya viven en tu commit.

## 4. `sha_pinning_required`: que no dependa de tu memoria

```bash
gh api repos/{owner}/{repo}/actions/permissions --method PUT \
  -F enabled=true -f allowed_actions=all -F sha_pinning_required=true
```

A partir de ese momento, cualquier workflow con un `uses:` que no sea un SHA
completo **falla al arrancar**. No avisa, no degrada: falla. Es exactamente lo
que quieres, y por eso conviene activarlo después de haber pinneado, no antes.

Disponible a nivel de repositorio, organización y empresa
([changelog, agosto 2025](https://github.blog/changelog/2025-08-15-github-actions-policy-now-supports-blocking-and-sha-pinning-actions/)).
Verificado en agosto de 2026.

### El caso de las actions del propio repositorio

La Semana 10 usó `uses: ./.github/actions/preparar-entorno`, que no lleva ref
porque siempre es la del commit en curso. Desde julio de 2026 existe además la
sintaxis `$/`, que resuelve al **mismo repositorio y al mismo commit** que está
ejecutando el workflow:

```yaml
      - uses: $/.github/actions/preparar-entorno      # sin checkout previo
```

La diferencia práctica con `./` es que `$/` no necesita un `checkout` antes, y
que funciona también cuando el workflow se invoca desde otro repositorio pinneado
por SHA. Requiere runner 2.336.0 o superior
([changelog](https://github.blog/changelog/2026-07-30-reference-same-repository-actions-with-self-repository-syntax/)).

## 5. Mantener los pines: Dependabot

Un SHA no caduca, pero se queda viejo, y un pin viejo es una vulnerabilidad sin
parchear. Dependabot entiende `github-actions` como ecosistema y abre los PR con
el SHA nuevo y el comentario actualizado:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: github-actions
    directory: "/"
    schedule:
      interval: weekly
    groups:
      actions:
        patterns: ["*"]
    commit-message:
      prefix: "ci"
```

Tres detalles que ahorran ruido:

- **`directory: "/"`** cubre `.github/workflows/`. Las composite actions propias
  se declaran con su propia ruta si quieres que también las revise
- **`groups`** junta todas las subidas en un PR semanal en vez de siete
- **`commit-message.prefix`** encaja con los Conventional Commits de la Semana 07,
  y hace que el PR pase tu propio `validar-pr.yml`

## 6. Elegir una action de terceros

Antes del primer `uses:`, cinco minutos de revisión:

| Señal | Qué mirar | Por qué importa |
|-------|-----------|-----------------|
| Mantenimiento | Último commit, issues abiertos, quién puede publicar | Un repo abandonado es un repo secuestrable |
| Superficie | ¿Qué `permissions` pide su README? | Si pide `write` para leer, sospecha |
| `dist/` | ¿El empaquetado corresponde al fuente? | Es el código que de verdad corre |
| Releases inmutables | ¿Sus tags están protegidos? | Un tag que no se puede mover cambia el riesgo |
| Alternativa | ¿Son diez líneas de `run:`? | La mejor dependencia es la que no añades |

Las **releases inmutables** (disponibles de forma general desde octubre de 2025)
protegen assets y tags de una release publicada y le añaden attestations
firmadas. Cuando el autor de una action las usa, mover un tag deja de ser
posible: es la mitigación exacta del incidente de la sección 1
([docs](https://docs.github.com/actions/how-tos/create-and-publish-actions/using-immutable-releases-and-tags-to-manage-your-actions-releases)).
Aun así, se pinnea por SHA: no todas las actions las tienen.

## 7. Analizar los workflows antes de que corran

Dos herramientas, dos trabajos distintos:

```bash
# Errores de sintaxis, expresiones, contextos inexistentes, shellcheck integrado
actionlint

# Problemas de seguridad: inyección, pines flotantes, permisos excesivos
zizmor .github/workflows/
```

[`actionlint`](https://github.com/rhysd/actionlint) te evita el ciclo
"commit → push → esperar → error de sintaxis". [`zizmor`](https://github.com/zizmorcore/zizmor)
busca patrones peligrosos y clasifica los hallazgos por confianza; su salida
SARIF se puede subir a code scanning, que es la Semana 13.

Ninguna de las dos sustituye a leer el YAML. Las dos encuentran cosas que tú no.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `@main` en cualquier action ajena | Ejecutas lo que empujaron hace diez minutos | SHA |
| `@v4` "porque es la versión estable" | Un tag es un puntero mutable | SHA + comentario |
| SHA sin comentario | Nadie sabe qué versión es al revisar | `# v4.2.2` |
| Pinnear y no actualizar nunca | Congelas también los parches de seguridad | Dependabot semanal |
| Aceptar el PR de Dependabot sin mirar el diff del SHA | Es exactamente el vector del ataque | Comprobar que el SHA es el del tag anunciado |
| Añadir una action para tres líneas de bash | Una dependencia más con acceso a secretos | `run:` |
| Activar `sha_pinning_required` antes de pinnear | Se rompe todo a la vez | Pinnear, verificar, activar |

## 9. Trucos

- **Resolver un tag a SHA sin salir del editor**:
  `gh api repos/OWNER/REPO/tags --jq '.[] | select(.name=="TAG") | .commit.sha'`
- **Comprobar que un SHA es realmente el de ese tag** antes de aceptar un PR:
  el mismo comando, comparando la salida
- **`gh api repos/OWNER/REPO/commits/SHA --jq .commit.committer.date`** te dice
  qué antigüedad tiene el pin que vas a poner
- **Un job de CI que corre `actionlint` sobre `.github/`** cuesta veinte segundos
  y detecta el 90 % de los fallos de YAML antes del merge
- **Los pines locales no existen**: `./` y `$/` van al commit actual, no hay nada
  que pinnear ahí
- **Si una action te pide `secrets: inherit`**, no la uses; declara lo que
  necesita, uno a uno

## 📚 Recursos Adicionales

- [Using third-party actions securely](https://docs.github.com/actions/reference/security/secure-use#using-third-party-actions)
- [Dependabot — `github-actions` ecosystem](https://docs.github.com/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot)
- [Immutable releases](https://docs.github.com/code-security/concepts/supply-chain-security/immutable-releases)
- [`actionlint`](https://github.com/rhysd/actionlint) · [`zizmor`](https://github.com/zizmorcore/zizmor)

## ✅ Checklist de Verificación

- [ ] Puedes explicar por qué `@v4` no es una versión
- [ ] Todos los `uses:` ajenos de tu repositorio están pinneados por SHA
- [ ] Cada pin lleva el tag en un comentario
- [ ] Tienes `.github/dependabot.yml` con el ecosistema `github-actions`
- [ ] Sabes qué hace `sha_pinning_required` y en qué orden se activa
- [ ] Has pasado `actionlint` sobre tus workflows al menos una vez
