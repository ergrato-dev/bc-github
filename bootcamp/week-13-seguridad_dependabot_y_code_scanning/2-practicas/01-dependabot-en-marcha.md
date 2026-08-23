# Práctica 01 — Dependabot en marcha

> Al terminar, tu repositorio sabe qué tiene instalado, te avisa cuando algo de
> eso resulta ser vulnerable, y abre él solo el pull request que lo arregla. Y lo
> vas a ver funcionar de verdad: vas a instalar una dependencia vulnerable a
> propósito.

**Duración estimada**: 50 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-el-grafo-de-dependencias.md),
[02](../1-teoria/02-alertas-de-dependabot.md),
[03](../1-teoria/03-actualizaciones-de-seguridad.md) y
[04](../1-teoria/04-version-updates-y-dependabot-yml.md). Tu repositorio del
bootcamp con `package.json` y `pnpm-lock.yaml` commiteados

## Paso 0: Comprobar que el grafo te ve

**Por qué**: si GitHub no encuentra tus manifiestos, todo lo demás se activa y no
pasa nada. Es el fallo más frustrante de la semana porque no da ningún error.

```bash
gh api repos/{owner}/{repo}/dependency-graph/sbom --jq '.sbom.packages | length'
```

**Verifica**: un número mayor que 1. Si sale `404`, tu `package.json` o tu
lockfile no están en la rama por defecto — arréglalo antes de seguir:

```bash
git ls-files | grep -E 'package.json|pnpm-lock.yaml'
```

## Paso 1: Activar las alertas

**Por qué**: sin ellas no hay nada que comparar contra la base de avisos. Es el
interruptor del que cuelga toda la semana.

```bash
gh api repos/{owner}/{repo}/vulnerability-alerts --method PUT
```

**Verifica** — este endpoint contesta con un código de estado, no con JSON:

```bash
gh api repos/{owner}/{repo}/vulnerability-alerts --include --silent 2>&1 | head -1
# HTTP/2.0 204 No Content
```

Un `404` significa que siguen desactivadas.

## Paso 2: Activar las actualizaciones de seguridad

**Por qué**: enterarte no es arreglarlo. Esto es lo que convierte la alerta en un
pull request sin que tú hagas nada.

```bash
gh api repos/{owner}/{repo}/automated-security-fixes --method PUT
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/automated-security-fixes
# {"enabled":true,"paused":false}
```

Si `paused` sale `true` en un repositorio recién configurado, avisa: no debería.

## Paso 3: Instalar una vulnerabilidad a propósito

**Por qué**: un sistema de alertas que nunca has visto dispararse es una
suposición. Vamos a comprobarlo con un caso real, conocido y con arreglo
disponible: `minimist@1.2.5` tiene el aviso `GHSA-xvch-5gv4-984h`
(*Prototype Pollution*, severidad `critical`), parcheado en `1.2.6`.

```bash
git switch -c chore/dependencia-de-prueba
pnpm add minimist@1.2.5
git add package.json pnpm-lock.yaml
git commit -m "chore: añadir minimist para probar las alertas de Dependabot"
git push -u origin chore/dependencia-de-prueba
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica** que la dependencia llegó a la rama por defecto:

```bash
gh api repos/{owner}/{repo}/contents/package.json --jq '.content | @base64d' | grep minimist
```

## Paso 4: Ver la alerta

**Por qué**: es el momento de leer una alerta de verdad, con sus campos, en vez
de una captura de pantalla.

Tarda unos minutos. Cuando llegue:

```bash
gh api "repos/{owner}/{repo}/dependabot/alerts?state=open&per_page=100" \
  --jq '.[] | {
    n: .number,
    paquete: .dependency.package.name,
    donde: .dependency.scope,
    relacion: .dependency.relationship,
    severidad: .security_advisory.severity,
    ghsa: .security_advisory.ghsa_id,
    arregla: .security_vulnerability.first_patched_version.identifier
  }'
```

**Verifica** que ves `minimist`, `critical` y `1.2.6` como versión que lo
arregla. Si el comando devuelve `403`, las alertas no están activas: vuelve al
Paso 1.

## Paso 5: El pull request que no pediste

**Por qué**: aquí se ve la diferencia entre saber y arreglar.

```bash
gh pr list --app dependabot
```

**Verifica** que hay un pull request que sube `minimist` a `1.2.6` —la versión
mínima que parchea, no la última—. Ábrelo y lee el cuerpo: trae el aviso, el
rango vulnerable, los commits que entran y la puntuación de compatibilidad.

No lo fusiones todavía: es el material de la Práctica 02.

## Paso 6: El `dependabot.yml`

**Por qué**: hasta ahora todo era seguridad reactiva. Este archivo es lo que
mantiene el proyecto cerca del presente para que el próximo salto sea corto.

```bash
mkdir -p .github
cat > .github/dependabot.yml <<'EOF'
version: 2

updates:
  # Los pines por SHA de los workflows (Semana 11) también caducan
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
      timezone: "Europe/Madrid"
    labels:
      - "dependencies"
    commit-message:
      prefix: "chore"

  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
      timezone: "Europe/Madrid"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
    commit-message:
      prefix: "chore"
      include: "scope"
    cooldown:
      default-days: 7
      semver-major-days: 30
      semver-minor-days: 7
      semver-patch-days: 3
    groups:
      produccion:
        dependency-type: "production"
        update-types: ["minor", "patch"]
      desarrollo:
        dependency-type: "development"
        update-types: ["minor", "patch"]
      seguridad-npm:
        applies-to: security-updates
        patterns: ["*"]
EOF
```

Ajusta `timezone` a la tuya y `labels` a las etiquetas que existan de verdad en
tu repositorio — las creaste en la Semana 03. Una etiqueta inexistente no rompe
nada, pero deja el pull request sin clasificar.

Fíjate en lo que **no** está agrupado: los `major`. Cada uno merece su propia
conversación.

```bash
git switch -c chore/configurar-dependabot
git add .github/dependabot.yml
git commit -m "chore: configurar las actualizaciones de versión de Dependabot"
git push -u origin chore/configurar-dependabot
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica** que GitHub lee el archivo que tú crees:

```bash
gh api repos/{owner}/{repo}/contents/.github/dependabot.yml --jq '.content | @base64d' | head -20
```

## Paso 7: Comprobar que se ejecuta

**Por qué**: un `dependabot.yml` con un error de sintaxis no avisa por correo.
Falla en silencio y simplemente dejan de llegar pull requests.

En la interfaz: **Insights → Dependency graph → Dependabot**. Ahí ves una fila
por ecosistema con la última comprobación y, si algo va mal, el error exacto.
Puedes forzar una ejecución con **Check for updates**.

**Verifica** que las dos filas —`npm` y `github-actions`— aparecen sin error.

> [!NOTE]
> Los pull requests de versión no llegan al instante: siguen el `schedule` que
> acabas de escribir. Los de **seguridad** sí son inmediatos, y por eso el del
> Paso 5 ya estaba ahí.

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `404` en `dependency-graph/sbom` | No hay manifiesto en la rama por defecto | Commitear `package.json` y el lockfile |
| `403` al listar alertas | Las alertas están desactivadas | Paso 1 |
| No llega ninguna alerta | Sin lockfile solo se ven las directas | Commitear `pnpm-lock.yaml` |
| Ningún PR de seguridad | Las actualizaciones de seguridad están apagadas | Paso 2 |
| Ningún PR de versión | Es normal: siguen el `schedule` | Forzar con **Check for updates** |
| El archivo no se aplica | Error de sintaxis | Mirar el error en Insights → Dependabot |
| `paused: true` | PR anteriores abandonados | Reactivar en la interfaz y cerrar los viejos |

## ✅ Resultado

- [ ] El grafo de dependencias ve tu proyecto
- [ ] Las alertas están activas (`204` en `vulnerability-alerts`)
- [ ] Las actualizaciones de seguridad están activas y no en pausa
- [ ] Has provocado una alerta real y la has leído por API
- [ ] Dependabot ha abierto el pull request que la arregla
- [ ] `.github/dependabot.yml` con los bloques `npm` y `github-actions`
- [ ] La configuración incluye `groups` y `cooldown`
- [ ] Las dos filas aparecen sin error en Insights → Dependabot

## 🔗 Siguiente

[Práctica 02 — Triaje y auto-merge](02-triaje-y-automerge.md)

---

← [Volver a la Semana 13](../README.md)
