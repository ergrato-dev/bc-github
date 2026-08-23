# Semana 15 — API REST, GraphQL y `gh` CLI

> Catorce semanas configurando la plataforma a golpe de comando y de interfaz.
> Esta semana pasas al otro lado: **la plataforma es una API**, y todo lo que has
> hecho se puede leer, escribir y comprobar desde un guion tuyo. Al terminar, tu
> repositorio se audita solo todos los lunes.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Elegir entre REST y GraphQL por dónde vive el dato, no por moda
- Construir cualquier petición con `gh api` y dar forma a la salida con `--jq`
- Distinguir `-f`, `-F` y `--input`, y saber cuál rompe en cada caso
- Paginar sin informes incompletos, en REST y con cursores en GraphQL
- Leer el cupo, provocar un `304` y saber qué dispara el límite secundario
- Escribir consultas con variables, alias y fragmentos, y ejecutar mutaciones
- Saber en qué punto un guion deja de ser trabajo para `gh api` y pasa a Octokit
- Montar una auditoría con reglas puras, dos formatos de salida y códigos de
  salida que significan cosas distintas
- Ejecutarla cada semana en Actions con permisos mínimos y publicar el informe
- Publicar una extensión de `gh` que cualquiera pueda instalar

## 📋 Prerrequisitos

- Semana 14 completada: la cadena de suministro cerrada y documentada
- Semana 11: `permissions` mínimas por job y actions ancladas por SHA
- Semana 08: al menos un ruleset activo — la auditoría lo comprueba
- Semana 03: labels e issues en tu repositorio
- `gh` **2.60 o superior**, `jq` 1.6+, Node 22 y `pnpm`
- Tu repositorio del bootcamp clonado y `gh` autenticado con scope `repo`
  (`./scripts/verificar-semana.sh --doctor`)

> [!NOTE]
> Esta semana crea **un repositorio auxiliar**: la extensión `gh-auditoria`. Es
> la excepción justificada de la regla del repo único —una extensión de `gh` *es*
> un repositorio, y su nombre forma parte del contrato de la herramienta.

## 🗂️ Estructura de la Semana

```
week-15-api_rest_graphql_y_gh_cli/
├── 0-assets/     01-rest-frente-a-graphql · 02-la-paginacion
│                 03-los-dos-limites · 04-del-comando-a-la-extension
├── 1-teoria/     01-rest-y-graphql · 02-gh-api-a-fondo · 03-paginacion
│                 04-limites-y-cortesia · 05-graphql-a-fondo · 06-octokit
│                 07-extensiones-de-gh · 08-guiones-de-auditoria
├── 2-practicas/  01-la-api-en-la-mano · 02-una-consulta-en-vez-de-veinte
│                 03-el-guion-de-auditoria · 04-tu-extension-de-gh
├── starter/      auditoria.ts · auditoria.yml · gh-auditoria
├── 3-proyecto/   el repositorio que se audita solo, y la extensión que lo mira
├── 4-recursos/ · 5-glosario/ · checks.json · rubrica-evaluacion.md
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [`01-rest-y-graphql.md`](1-teoria/01-rest-y-graphql.md) | Dos APIs, over/under-fetching, qué solo está en cada una, cómo elegir | 25 min |
| [`02-gh-api-a-fondo.md`](1-teoria/02-gh-api-a-fondo.md) | Anatomía de una petición, `-f`/`-F`/`--input`, `--jq`, `--template`, caché, depuración | 25 min |
| [`03-paginacion.md`](1-teoria/03-paginacion.md) | `--paginate`, la trampa de `length`, `--slurp`, cursores y `totalCount` | 20 min |
| [`04-limites-y-cortesia.md`](1-teoria/04-limites-y-cortesia.md) | Límite primario y secundario, coste en GraphQL, ETag y `304`, backoff | 25 min |
| [`05-graphql-a-fondo.md`](1-teoria/05-graphql-a-fondo.md) | Variables, alias, fragmentos, `node_id`, mutaciones, errores con `200` | 25 min |
| [`06-octokit.md`](1-teoria/06-octokit.md) | Cuándo saltar de `gh api` al SDK, paginación, plugins, autenticación, `github-script` | 20 min |
| [`07-extensiones-de-gh.md`](1-teoria/07-extensiones-de-gh.md) | El contrato en tres reglas, bash o precompilada, publicación y riesgo | 20 min |
| [`08-guiones-de-auditoria.md`](1-teoria/08-guiones-de-auditoria.md) | Recoger/evaluar/presentar, códigos de salida, `schedule`, dónde dejar el informe | 20 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [`01-la-api-en-la-mano.md`](2-practicas/01-la-api-en-la-mano.md) | Lees tu repositorio por REST, cuentas bien lo que hay, provocas un `304` y escribes por API | 55 min |
| [`02-una-consulta-en-vez-de-veinte.md`](2-practicas/02-una-consulta-en-vez-de-veinte.md) | Pides el inventario entero en una consulta, la versionas y creas el issue con una mutación | 45 min |
| [`03-el-guion-de-auditoria.md`](2-practicas/03-el-guion-de-auditoria.md) | Montas la auditoría con Octokit y la programas para que corra sola cada lunes | 60 min |
| [`04-tu-extension-de-gh.md`](2-practicas/04-tu-extension-de-gh.md) | Publicas `gh-auditoria`, con ayuda, salida en JSON, release y topic | 40 min |

### Proyecto

[`3-proyecto/`](3-proyecto/README.md) — tu repositorio con una consulta GraphQL
versionada, un guion de auditoría en TypeScript, un workflow semanal que publica
el informe en un issue que se actualiza, y una extensión de `gh` publicada que
resume cualquier repositorio.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (8 archivos) | 3 h 00 min |
| Prácticas (4) | 3 h 20 min |
| Proyecto | 1 h 10 min |
| Revisión y verificación | 30 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Guiones portables sin editar una línea | `{owner}`, `{repo}` y `{branch}` se resuelven dentro del repo clonado |
| Apuntar cualquier guion a otro repositorio | `GH_REPO=owner/repo gh …` |
| Aprender un endpoint que no encuentras | `GH_DEBUG=api gh pr list` y copia la petición que manda `gh` |
| Explorar sin gastar cupo | `gh api … --cache 10m` mientras afinas el `--jq` |
| Consultar el cupo es gratis | `gh api rate_limit` no cuenta contra ningún límite |
| Saber a qué hora vuelves a tener cupo | `date -d "@$(gh api rate_limit --jq '.resources.core.reset')"` |
| Preguntar sin gastar | Guarda el `ETag` y mándalo en `If-None-Match`: un `304` no consume cupo |
| Ver solo las cabeceras | `-i --silent` |
| Saber qué cubo estás gastando | `X-RateLimit-Resource` en la respuesta |
| Contar bien una colección | `--paginate --slurp \| jq 'add \| length'` |
| `--slurp` no admite `--jq` ni `--template` | La salida se pasa a `jq` por tubería |
| `--paginate --jq 'length'` miente | Cuenta por página, no en total |
| Tres veces menos peticiones, gratis | `?per_page=100` |
| El total sin traer nada | `totalCount` en GraphQL, `total_count` en búsqueda |
| Booleanos y números en `gh api` | `-F campo=true`, no `-f` |
| Consulta desde archivo | `-F query=@consulta.graphql` — con `-f` manda la ruta como texto |
| Que `--paginate` recorra una consulta GraphQL | `$endCursor: String` en `after:` y `pageInfo { hasNextPage endCursor }` |
| Medir lo que cuesta una consulta | `rateLimit { cost remaining }` dentro de la propia consulta |
| El puente entre las dos APIs | `.node_id` de cualquier respuesta REST |
| «¿Cómo se llamaba ese campo?» | `__type(name: "Repository") { fields { name } }` |
| Un error de GraphQL llega con `200` | Hay que mirar `errors`, no el código HTTP |
| Tabla alineada sin salir de `gh` | `--template '{{tablerow …}}{{tablerender}}'` |
| Octokit con tu sesión, sin crear un PAT | `export GITHUB_TOKEN=$(gh auth token)` |
| Paginar sin escribir el bucle | `octokit.paginate(…)`, y `paginate.iterator()` si es enorme |
| Endpoint sin método tipado en el SDK | `octokit.request("GET /repos/{owner}/{repo}/rulesets", …)` |
| El cupo en Actions no son 5 000 | El `GITHUB_TOKEN` tiene 1 000/hora y repositorio |
| Informe visible sin descargar nada | `cat informe.md >> "$GITHUB_STEP_SUMMARY"` |
| Un issue actualizado en vez de 52 al año | `gh issue list --json number --jq '.[0].number // empty'` |
| Probar una extensión sin publicarla | `gh extension install .` desde su directorio |
| Que tu extensión se pueda encontrar | El topic `gh-extension` |
| Fijar la versión de una extensión ajena | `gh extension install owner/gh-x --pin v1.2.0` |
| Ver qué actualizaría antes de hacerlo | `gh extension upgrade --all --dry-run` |

## 📌 Entregables

1. ✅ `tools/consultas/auditoria.graphql` con variables tipadas
2. ✅ `tools/auditoria.ts` con Octokit, `paginate` y los plugins de límites
3. ✅ Recogida desde las dos APIs y reglas evaluadas como funciones puras
4. ✅ Salida en `--formato json` y `--formato markdown`
5. ✅ Códigos de salida `0/1/2/3` con significados distintos
6. ✅ `.github/workflows/auditoria.yml` semanal, con `permissions` mínimas
7. ✅ El informe en el resumen del job, en un artifact y en **un** issue
8. ✅ El label `auditoria` y un único issue abierto con él
9. ✅ `gh-auditoria` publicada: topic, ejecutable, release y README
10. ✅ Tu `README.md` explicando cómo se audita el repositorio

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 15 --repo <tu-usuario>/<tu-repo>
```

> [!NOTE]
> Cinco comprobaciones leen el repositorio **`gh-auditoria`**, que se crea en la
> Práctica 04 y tiene que llamarse exactamente así. Y una de ellas se declara con
> `graphql` en vez de `api`: es el ejemplo, dentro de tu propio autograding, de
> que las dos APIs conviven.

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 14: Cadena de suministro y hardening](../week-14-seguridad_supply_chain_y_hardening/README.md) | **Semana 15: API REST, GraphQL y `gh` CLI** | [Semana 16: Webhooks, Apps y bots →](../week-16-webhooks_apps_y_bots/) |

← [Volver al inicio del bootcamp](../../README.md)
