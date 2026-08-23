# Rúbrica de Evaluación — Semana 15: API REST, GraphQL y `gh` CLI

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | El guion de auditoría, su workflow y la extensión publicada |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Qué es el under-fetching y por qué pesa más que el over-fetching a la hora de elegir API? |
| 2 | Nombra tres cosas que solo estén en REST y tres que solo estén en GraphQL. ¿Qué consecuencia tiene eso para un guion de auditoría? |
| 3 | ¿Por qué `gh api --paginate --jq 'length'` no devuelve el total, y cuáles son las tres formas correctas de contar? |
| 4 | ¿Qué dos condiciones tiene que cumplir una consulta GraphQL para que `gh api graphql --paginate` la recorra entera? |
| 5 | ¿En qué se diferencian `-f`, `-F` y `--input`, y por qué `-f query=@archivo.graphql` no funciona? |
| 6 | ¿Cómo se calcula el coste de una consulta en GraphQL y por qué 100 issues con sus comentarios cuestan 1 punto? |
| 7 | ¿Qué diferencia hay entre el límite primario y el secundario, cómo avisa cada uno y qué cupo tiene el `GITHUB_TOKEN` de un job? |
| 8 | ¿Por qué un `304` es una buena noticia y cómo se provoca? |
| 9 | ¿Por qué un error de GraphQL llega con `HTTP 200` y qué implica para un cliente que no sea `gh`? |
| 10 | ¿Qué tres reglas definen una extensión de `gh` y qué riesgo asumes al instalar la de otra persona? |

<details>
<summary><strong>Respuestas</strong></summary>

1. El **over-fetching** es traer 120 campos para usar uno: gasta ancho de banda,
   pero una sola petición. El **under-fetching** es necesitar varias llamadas
   para contestar una pregunta —el issue, luego sus reviews, luego su autor—, y
   ahí lo que se multiplica son las peticiones: latencia y cupo. Por eso la
   pregunta útil no es «¿cuántos campos sobran?» sino «¿cuántos viajes hacen
   falta?».
2. Solo en REST: rulesets, todo lo de Actions (workflows, runs, artifacts), las
   alertas de secret scanning, code scanning, releases, packages, SBOM y
   attestations. Solo en GraphQL: Projects v2 entero, Discussions, los
   sub-issues, `statusCheckRollup` y campos calculados como
   `viewerCanAdminister`. La consecuencia es que **una auditoría realista usa las
   dos**: no es una elección de estilo, es dónde vive el dato.
3. Porque `gh` no fusiona las páginas antes de aplicar el filtro: se lo aplica a
   cada una, así que imprime una longitud por página. Las tres formas correctas
   son aplanar y contar líneas (`--paginate --jq '.[].name' | wc -l`), juntar con
   `--slurp` y contar fuera (`| jq 'add | length'`, porque `length` a secas
   cuenta **páginas**), o pedirle el total al servidor cuando existe
   (`total_count` en búsqueda, `totalCount` en GraphQL).
4. Declarar la variable `$endCursor: String` y usarla en `after:`, y pedir
   `pageInfo { hasNextPage endCursor }` en la colección que se pagina. Sin las
   dos, obtienes la primera página y **ningún aviso** de que faltan las demás.
5. `-f` manda todo como cadena; `-F` hace conversión de tipos —`true`, `null`,
   enteros—, resuelve `{owner}`/`{repo}` y, si el valor empieza por `@`, lee el
   archivo; `--input` manda un cuerpo JSON entero desde un archivo. `-f
   query=@consulta.graphql` no funciona porque `-f` no interpreta el `@`: manda
   la cadena literal `@consulta.graphql` como consulta, y el servidor responde
   con un error de sintaxis.
6. Se calcula sobre el **número de nodos que la consulta podría devolver**,
   dividido entre 100 y redondeado, con un mínimo de 1. Cien issues con diez
   comentarios cada uno son 1 100 nodos potenciales, que en puntos sigue siendo
   una cifra baja: `cost: 1`. Las 101 peticiones REST equivalentes gastan 101 del
   cubo `core`.
7. El **primario** mide volumen: 5 000 peticiones/hora autenticado, 30/minuto en
   búsqueda, y **1 000/hora por repositorio** para el `GITHUB_TOKEN` de Actions.
   Se ve venir en las cabeceras `X-RateLimit-*`. El **secundario** mide
   comportamiento —ráfagas, concurrencia, escrituras sin pausa—, no tiene número
   público y avisa con un `403`/`429` con `Retry-After`. El primero se arregla
   esperando al `reset`; el segundo, bajando el ritmo.
8. Porque una respuesta `304 Not Modified` **no consume cupo primario**:
   preguntaste y el servidor confirmó que tu copia sigue vigente. Se provoca
   guardando el `ETag` de una respuesta y mandándolo en la siguiente petición con
   `If-None-Match`. Es lo que permite a un bot sondear cada minuto sin agotar
   nada.
9. Porque en GraphQL el transporte y la validación son capas distintas: la
   petición se procesó correctamente, así que HTTP dice `200`, y el problema se
   informa en el array `errors` del cuerpo, a veces con `data` parcialmente
   relleno. `gh` es amable y sale con código 1, pero un cliente que solo mire el
   código HTTP dará por buena una respuesta vacía. Octokit lanza excepción; con
   `curl` hay que inspeccionar `errors` a mano.
10. El repositorio se llama `gh-<algo>`, contiene un ejecutable con **ese mismo
    nombre** en la raíz, y ese ejecutable recibe los argumentos que siguen a
    `gh <algo>`. Al instalar una ajena estás descargando y ejecutando código de un
    tercero en tu máquina, con tu sesión de `gh` disponible: no hay revisión,
    firma ni sandbox. Por eso se lee el ejecutable antes y, en equipo, se fija la
    versión con `--pin`.

</details>

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — La API en la mano | Lectura con placeholders y `--jq`, conteo correcto de una colección paginada, cabeceras de límite y un `304` provocado, label creado por API | 10 |
| 02 — Una consulta en vez de veinte | Consulta con variables y alias versionada en `tools/consultas/`, paginación por cursor comprobada, error de GraphQL con `200` observado, issue creado por mutación | 10 |
| 03 — El guion de auditoría | Octokit con throttling y retry, recogida de las dos APIs, reglas propias, dos formatos de salida, códigos de salida distintos, workflow ejecutado y issue actualizado | 10 |
| 04 — Tu extensión de `gh` | Extensión publicada con topic, release y README, `--help` y `--formato json`, instalada desde GitHub y documentada en el repo del bootcamp | 10 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| Consulta GraphQL versionada, con variables tipadas | 10 |
| `tools/auditoria.ts` con Octokit, paginación y las dos APIs | 10 |
| Plugins de límites, salida JSON y código de salida `3` diferenciado | 10 |
| Workflow con `cron`, `workflow_dispatch`, `permissions` mínimas y SHA anclados | 10 |
| Label, issue único de auditoría y ejecución registrada del workflow | 10 |
| Extensión pública con topic, ejecutable, release y README | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| Las reglas auditan cosas accionables, no ruido | 10 |
| Cada API se usa para lo que solo ella resuelve | 10 |
| El guion no da por bueno un fallo: distingue «no cumple» de «no pude» | 10 |
| La extensión se usa sin leer su código (`--help`, argumentos, `stderr`) | 5 |
| El informe llega a un sitio donde alguien lo lee | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Un token real commiteado en el guion o en un `.env` | -100 (rotar y rehacer) |
| Un PAT clásico en un secreto donde bastaba el `GITHUB_TOKEN` | -30 |
| El guion devuelve `0` cuando no pudo auditar | -25 |
| Un issue de auditoría nuevo en cada ejecución | -20 |
| Workflow sin `permissions` declaradas | -20 |
| Actions sin anclar por SHA en el workflow nuevo | -15 |
| Informe incompleto por no paginar (conteo por página) | -15 |
| Consulta GraphQL con valores interpolados en vez de variables | -10 |
| Extensión sin `--help` ni salida en JSON | -10 |
| Bucle REST donde cabía una consulta GraphQL | -10 |
| `--verbose` o `GH_DEBUG=api` dejados en el workflow | -10 |

---

← [Volver a la Semana 15](README.md)
