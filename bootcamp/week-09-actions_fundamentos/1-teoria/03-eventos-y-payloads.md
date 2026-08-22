# Eventos y payloads

> El evento decide tres cosas a la vez: **cuándo** corre el workflow, **qué
> datos** recibe y **cuánto poder** tiene su token. Las dos primeras son esta
> teoría; la tercera, la siguiente.

## 🎯 Objetivos

- Elegir el evento adecuado y sus activity types
- Filtrar por rama y por ruta sin dejar checks colgados
- Leer el payload en vez de adivinar sus campos
- Conocer las reglas de `schedule` y `workflow_dispatch` que se olvidan siempre

## 1. Qué problema resuelve

Un workflow sin evento no existe: `on:` es, junto con `jobs:`, lo único
obligatorio. Y el evento no es solo un disparador — trae consigo un **payload**
(el JSON de lo que ocurrió) que es de dónde salen casi todos los datos que un
workflow necesita.

## 2. Los eventos que vas a usar

| Evento | Cuándo dispara | Uso típico |
|--------|----------------|------------|
| `push` | Commits empujados a una rama o tag | CI en `main`, releases por tag |
| `pull_request` | Actividad en un PR | El CI que exige tu ruleset |
| `workflow_dispatch` | Botón *Run workflow* o `gh workflow run` | Tareas manuales, despliegues |
| `schedule` | Expresión `cron` | Informes, limpiezas, auditorías |
| `issues` / `issue_comment` | Actividad en issues | Bots de triage (Semana 16) |
| `release` | Publicación de un release | Publicar paquetes (Semana 12) |
| `workflow_run` | Otro workflow terminó | Encadenar workflows con permisos distintos |
| `merge_group` | Candidato de merge queue | Semana 08 |
| `repository_dispatch` | Llamada a la API desde fuera | Integraciones externas |

Un workflow puede escuchar varios:

```yaml
on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:
```

Con eso, `github.event_name` te dice cuál lo disparó, y puedes condicionar steps
según el caso.

## 3. Activity types

Muchos eventos tienen subtipos. Por defecto, `pull_request` solo escucha tres:

> "By default, a workflow only runs when a `pull_request` event's activity type
> is `opened`, `synchronize`, or `reopened`."

`synchronize` significa "llegaron commits nuevos al PR". Ojo con lo que **no**
está en esa lista: editar el título, poner una etiqueta o marcar un draft como
listo **no** disparan nada por defecto.

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened, edited, ready_for_review]
```

| Type | Cuándo sirve |
|------|--------------|
| `edited` | Revalidar el título o el cuerpo sin empujar un commit vacío |
| `ready_for_review` | Arrancar el CI caro solo cuando el draft deja de serlo |
| `labeled` / `unlabeled` | Disparar algo al etiquetar (`deploy-preview`) |
| `closed` | Limpiar recursos; combínalo con `github.event.pull_request.merged` |

Ese `edited` es exactamente el que hace falta para revalidar el título de un PR
sin empujar un commit vacío — el truco de la Semana 07.

### Draft PRs

Un PR en borrador dispara `pull_request` igual. Si quieres ahorrar runners:

```yaml
jobs:
  test:
    if: github.event.pull_request.draft == false
```

> [!WARNING]
> Si ese check es **requerido** por el ruleset, saltarlo deja el check en
> *skipped* y el PR bloqueado hasta que salga del borrador. Es el
> comportamiento correcto, pero conviene saberlo antes de que pase.

## 4. Filtros

```yaml
on:
  push:
    branches: [main]
    tags: ['v*']
    paths-ignore: ['**.md', 'docs/**']
  pull_request:
    branches: [main]
    paths: ['src/**', 'package.json']
```

| Filtro | Qué hace |
|--------|----------|
| `branches` / `branches-ignore` | Filtra por rama (patrones glob) |
| `tags` / `tags-ignore` | Filtra por tag |
| `paths` / `paths-ignore` | Filtra por archivos tocados |

No se pueden combinar la versión positiva y la `-ignore` del mismo filtro en el
mismo evento. Los patrones admiten `*` (no cruza `/`), `**` (sí lo cruza) y `!`
para negar.

> [!WARNING]
> **`paths` y los checks requeridos no se llevan bien.** Si el ruleset de la
> Semana 08 exige un check y el workflow que lo produce está filtrado por
> `paths`, un PR que no toque esas rutas deja el check *Expected* para siempre y
> **no se puede mergear jamás**.
>
> La solución no es quitar el filtro: es que el job **exista siempre** y decida
> dentro si hay algo que hacer. En monorepos esto se hace con path filters
> calculados en un job previo — Semana 18.

### `push` y `pull_request` a la vez: runs duplicados

`on: [push, pull_request]` sin filtros ejecuta **dos** runs por cada push a una
rama con PR abierto. La combinación que casi siempre quieres:

```yaml
on:
  push:
    branches: [main]        # solo la rama por defecto
  pull_request:             # el resto de ramas, vía su PR
```

## 5. El payload

Cada evento trae su JSON. Está en `GITHUB_EVENT_PATH` y accesible por el context
`github.event`:

```yaml
- name: Ver el payload entero
  run: jq . "$GITHUB_EVENT_PATH"

- name: Un campo concreto
  env:
    TITULO: ${{ github.event.pull_request.title }}
  run: echo "$TITULO"
```

Volcar el payload la primera vez que tocas un evento nuevo ahorra media hora de
adivinar nombres de campo. No los deduzcas: míralos.

Campos que se usan constantemente:

```yaml
github.event.pull_request.number        # el número del PR
github.event.pull_request.merged        # true solo si se mergeó
github.event.pull_request.base.sha      # el commit base, para diffs
github.event.pull_request.head.sha      # el commit de la rama del PR
github.event.pull_request.draft         # borrador o no
github.event.issue.number               # en eventos de issue
github.event.comment.body               # ChatOps, Semana 16
```

> [!CAUTION]
> Ese `env:` del ejemplo no es decorativo. Interpolar
> `${{ github.event.pull_request.title }}` **directamente dentro de un `run:`**
> es una inyección de comandos. Lo desarrolla la
> [Teoría 04](04-seguridad-de-los-eventos.md), y es la parte de la semana que
> más importa.

## 6. `workflow_dispatch`

```yaml
on:
  workflow_dispatch:
    inputs:
      entorno:
        description: 'Dónde desplegar'
        type: choice
        options: [staging, production]
        default: staging
      forzar:
        description: 'Ignorar comprobaciones previas'
        type: boolean
        default: false
```

Se lanza con `gh workflow run desplegar.yml -f entorno=production`, y los valores
llegan por el context `inputs`.

> [!IMPORTANT]
> `workflow_dispatch` **solo dispara si el archivo existe en la rama por
> defecto**: *"This event will only trigger a workflow run if the workflow file
> exists on the default branch."* Un workflow nuevo en una rama de feature no
> aparece en el botón, y la primera vez esto desconcierta a todo el mundo.

Los tipos de input son `string`, `choice`, `boolean` y `environment`. Los
booleanos llegan como **texto**: compara con `== 'true'`.

## 7. `schedule`

```yaml
on:
  schedule:
    - cron: '17 6 * * 1'    # lunes a las 06:17 UTC
```

Cuatro reglas que la documentación deja claras y que se olvidan siempre:

- `cron` es **UTC**, sin horario de verano. Tu "las nueve" se mueve dos veces al año
- El intervalo mínimo es de **5 minutos**
- Las ejecuciones **se retrasan en horas punta**, y la documentación señala que
  *"high load times include the start of every hour"*: el minuto 0 es la peor
  elección posible
- En un repositorio público, los workflows programados **se desactivan solos tras
  60 días sin actividad** en el repositorio

Ese último punto explica el misterio de "mi informe semanal dejó de llegar". Se
reactiva desde la pestaña Actions o con `gh workflow enable <archivo>`.

> [!NOTE]
> Un `schedule` corre siempre sobre la **rama por defecto**, y solo si el archivo
> está ahí. No hay forma de programar un workflow desde otra rama.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `on: [push, pull_request]` sin filtros | Dos runs por push | `push` a `main`, `pull_request` al resto |
| `paths` en un workflow con check requerido | PRs imposibles de mergear | Job que siempre corre |
| Adivinar los campos del payload | Media hora perdida | `jq . "$GITHUB_EVENT_PATH"` |
| `cron: '0 * * * *'` | Hora punta: retrasos garantizados | Un minuto cualquiera menos el 0 |
| Esperar que `edited` funcione sin declararlo | No está en los types por defecto | Declara `types:` |
| Crear el workflow solo en una rama y buscar el botón | `workflow_dispatch` exige rama por defecto | Mergéalo primero |
| Comparar un input booleano con `true` | Los inputs son texto | `== 'true'` |

## 9. Trucos

- **Volcar el payload** la primera vez que usas un evento: `jq . "$GITHUB_EVENT_PATH"`
- **`types: [..., edited]`** revalida un PR sin empujar commits
- **`github.event_name`** distingue qué evento disparó un workflow con varios `on:`
- **Detectar un merge de verdad**: `github.event.pull_request.merged == true` en
  el type `closed`; un PR cerrado sin mergear también dispara `closed`
- **Reactivar un `schedule` dormido**: `gh workflow enable <archivo>`
- **Lanzar con inputs desde la terminal**: `gh workflow run x.yml -f clave=valor`
- **El payload de cada evento** está documentado campo a campo en
  [webhook events and payloads](https://docs.github.com/webhooks/webhook-events-and-payloads)

## 📚 Recursos Adicionales

- [GitHub Docs — Events that trigger workflows](https://docs.github.com/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [GitHub Docs — Webhook events and payloads](https://docs.github.com/webhooks/webhook-events-and-payloads)
- [crontab.guru](https://crontab.guru/) — para no equivocarte con las cinco cifras

## ✅ Checklist de Verificación

- [ ] Sabes los tres activity types por defecto de `pull_request`
- [ ] Sabes por qué `paths` rompe un check requerido
- [ ] Sabes por qué tu `workflow_dispatch` no aparece en el botón
- [ ] Has volcado el payload de un evento al menos una vez
