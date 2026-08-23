# Actualizaciones de versión y el `dependabot.yml`

> Las actualizaciones de seguridad te sacan del agujero. Las de versión evitan
> que caigas. Son un sistema distinto, con activación distinta, y todo su
> comportamiento vive en un solo archivo que casi todo el mundo copia de un
> tutorial y no vuelve a mirar.

## 🎯 Objetivos

- Distinguir actualizaciones de versión de actualizaciones de seguridad
- Escribir un `dependabot.yml` que no genere ruido
- Usar `groups`, `ignore`, `allow` y `cooldown` para controlar cuántos PR llegan
- Elegir `schedule` y `open-pull-requests-limit` con criterio
- Saber qué opción resuelve cada síntoma cuando el archivo no hace lo esperado

## 1. Qué problema resuelve

Un proyecto que solo actualiza cuando salta una alerta acumula deuda en silencio.
Cuando por fin haya que subir esa librería tres versiones mayores para cerrar un
`critical`, la migración durará una semana — y el `critical` seguirá abierto
mientras tanto.

Las **actualizaciones de versión** mantienen el proyecto cerca del presente para
que el día que llegue la urgencia el salto sea corto. Ese es todo el argumento, y
es suficiente.

| | Actualizaciones de seguridad | Actualizaciones de versión |
|---|---|---|
| **Se activan** | Con un ajuste del repositorio | Solo con `.github/dependabot.yml` |
| **Disparador** | Una alerta con parche | El calendario |
| **Sube hasta** | La versión mínima que parchea | La última disponible |
| **Sin el archivo** | Funcionan | No existen |

## 2. El archivo, de arriba abajo

Vive en `.github/dependabot.yml` de la rama por defecto.

```yaml
version: 2

updates:
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
```

| Clave | Obligatoria | Qué hace |
|-------|:-----------:|----------|
| `version` | sí | Siempre `2` |
| `package-ecosystem` | sí | `npm`, `github-actions`, `docker`, `pip`, `gomod`, `maven`… |
| `directory` / `directories` | sí | Dónde están los manifiestos; una ruta o una lista |
| `schedule.interval` | sí | `daily`, `weekly`, `monthly`, `quarterly`, `semiannually`, `yearly` o `cron` |
| `open-pull-requests-limit` | no | Cuántos PR simultáneos como máximo (por defecto 5) |
| `labels` | no | Etiquetas del PR — enlaza con la taxonomía de la Semana 03 |
| `commit-message` | no | `prefix`, `prefix-development`, `include: scope` |
| `target-branch` | no | Otra rama base; también **desactiva las de seguridad** en ese bloque |

El límite de pull requests abiertos **solo cuenta las actualizaciones de
versión**: las de seguridad ni cuentan ni se ven limitadas por él. Es coherente
con lo que hace cada sistema, pero explica por qué el número de PR abiertos puede
pasar de cinco sin que hayas tocado nada.

`daily` significa de lunes a viernes, no siete días. Y con `interval: "cron"` hay
que añadir `cronjob`, que acepta expresión cron o lenguaje natural
(`"every day at 5pm"`).

> [!IMPORTANT]
> `commit-message.prefix` es lo que hace que los PR de Dependabot encajen con los
> Conventional Commits de la Semana 07 y con el `release-please` de la Semana 12.
> Sin prefijo, cada merge de Dependabot ensucia el changelog o directamente no
> aparece en él.

## 3. Un bloque por ecosistema

Cada `package-ecosystem` es una entrada distinta de la lista. Lo más habitual en
este bootcamp son dos:

```yaml
updates:
  - package-ecosystem: "github-actions"
    directory: "/"                    # siempre "/" para actions
    schedule:
      interval: "weekly"

  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

El bloque de `github-actions` viene de la Semana 11: es lo que mantiene al día
los pines por SHA. Sin él, pinnear por SHA congela versiones antiguas para
siempre — y un pin desactualizado es tan malo como un tag flotante, solo que en
la otra dirección.

Para un monorepo, `directories` acepta una lista y patrones:

```yaml
    directories:
      - "/paquetes/api"
      - "/paquetes/web"
```

## 4. Agrupar: la opción que más ruido quita

Sin `groups`, cada dependencia es un pull request. Con veinte dependencias
directas, un lunes cualquiera te encuentras siete.

```yaml
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
```

Las reglas de `groups`, en orden de importancia:

- **Una dependencia entra en el primer grupo que casa**, no en todos
- Lo que no casa con ningún grupo sigue teniendo su propio pull request
- `applies-to` vale `version-updates` (por defecto) o `security-updates`
- `update-types` acepta `major`, `minor` y `patch`
- `dependency-type` acepta `production` o `development`
- `patterns` y `exclude-patterns` admiten `*`; si algo casa con ambos, queda fuera

Fíjate en lo que **no** está agrupado arriba: los `major`. Es deliberado. Una
subida mayor necesita leer un changelog y probablemente tocar código; meterla en
un grupo con otras catorce garantiza que nadie la lea.

## 5. Ignorar y permitir

`ignore` filtra lo que no quieres que se mueva:

```yaml
    ignore:
      - dependency-name: "typescript"
        update-types: ["version-update:semver-major"]
      - dependency-name: "@types/node"
        versions: ["^25.0.0"]
```

Los `update-types` de `ignore` llevan prefijo y son solo tres:
`version-update:semver-patch`, `version-update:semver-minor` y
`version-update:semver-major`. Es un nombre distinto del de `groups`, que usa
`patch`/`minor`/`major` a secas: copiar uno en el sitio del otro es el error de
sintaxis más común del archivo.

`allow` funciona al revés, como lista blanca, y se combina con `ignore`:
Dependabot resuelve primero lo permitido y después filtra lo ignorado. **Si algo
casa con ambos, gana `ignore`.**

> [!WARNING]
> `ignore` afecta también a las actualizaciones de seguridad de esa dependencia.
> Ignorar los `major` de un paquete y que su única versión parcheada sea un
> `major` significa no recibir nunca el arreglo. Es la forma más silenciosa de
> desactivar la seguridad creyendo que se está reduciendo ruido.

## 6. Enfriamiento

`cooldown` retrasa las actualizaciones de versión unos días desde que se publica
la versión nueva. Sirve para no ser quien descubre que la `4.2.0` estaba rota:

```yaml
    cooldown:
      default-days: 7
      semver-major-days: 30
      semver-minor-days: 7
      semver-patch-days: 3
```

- Solo aplica a **actualizaciones de versión**, nunca a las de seguridad — que es
  justo lo que quieres: los arreglos no esperan
- `include` y `exclude` acotan a qué dependencias se aplica, con comodines, y
  `exclude` gana sobre `include`
- Si no defines nada, Dependabot ya aplica un enfriamiento por defecto de 3 días
  a las de versión

Un `semver-major-days` alto es la forma barata de que los mayores lleguen cuando
ya hay parches de sus propios fallos.

## 7. Qué opción resuelve qué síntoma

| Síntoma | Opción |
|---------|--------|
| «Demasiados PR el lunes» | `groups` y `open-pull-requests-limit` |
| «Actualiza cosas que no me importan» | `allow` con `dependency-type: direct` |
| «Ese paquete lo subimos a mano» | `ignore` |
| «Nos llegan versiones recién salidas y rotas» | `cooldown` |
| «Los PR ensucian el changelog» | `commit-message.prefix` |
| «No toca el monorepo entero» | `directories` |
| «Los pines por SHA se quedan viejos» | Bloque `github-actions` |
| «Las de seguridad también llegan de una en una» | `groups` con `applies-to: security-updates` |

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `interval: "daily"` sin grupos | Cinco PR al día que nadie mira | `weekly` y `groups` |
| Copiar el archivo sin `github-actions` | Los pines por SHA se fosilizan | Añadir el bloque |
| Agrupar los `major` con todo | Nadie lee el changelog de la que rompe | `major` fuera de los grupos |
| `ignore` para silenciar ruido | Tapa también su arreglo de seguridad | `cooldown` o `groups`, que no ciegan |
| Confundir `patch` con `version-update:semver-patch` | El bloque se ignora en silencio | `groups` sin prefijo, `ignore` con él |
| Subir el límite de PR abiertos | El problema no era el límite | Agrupar |
| `target-branch` sin saber qué hace | Desactiva las de seguridad en ese bloque | Usarlo solo para ramas de mantenimiento |

## 9. Trucos

- **La pestaña Insights → Dependency graph → Dependabot** muestra la última
  ejecución por ecosistema y el error exacto si el archivo no valida
- **`gh api repos/{owner}/{repo}/contents/.github/dependabot.yml --jq '.content | @base64d'`**
  te enseña el archivo que GitHub está leyendo de verdad, no el de tu portátil
- **Un `dependabot.yml` inválido no avisa por correo**: falla en silencio y deja
  de haber PR. Si dejan de llegar, míralo ahí antes que nada
- **`labels` con tus etiquetas de la Semana 03** hace que los PR de Dependabot
  entren en las mismas vistas del Project v2 que el resto del trabajo
- **`open-pull-requests-limit: 0`** desactiva las actualizaciones de versión de
  ese bloque sin borrarlo — útil para pausar sin perder la configuración
- **El orden de los grupos importa**: pon los específicos arriba y el comodín
  abajo, igual que en el `.github/release.yml` de la Semana 12

## 📚 Recursos Adicionales

- [Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)
- [About Dependabot version updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates)
- [Optimizing PR creation for version updates](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/optimizing-pr-creation-version-updates)
- [Controlling which dependencies are updated](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/controlling-dependencies-updated)
- [Keeping your actions up to date with Dependabot](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot)

## ✅ Checklist de Verificación

- [ ] Sabes qué se activa con el archivo y qué se activa sin él
- [ ] Tienes un bloque `npm` y otro `github-actions`
- [ ] Sabes agrupar por `dependency-type` y por `applies-to`
- [ ] Distingues los `update-types` de `groups` de los de `ignore`
- [ ] Entiendes por qué `ignore` puede cegar una actualización de seguridad
- [ ] Sabes dónde mirar cuando el archivo deja de generar pull requests
