# Glosario — Semana 15

Términos clave de esta semana, A-Z. El nombre real de la feature va en inglés
entre paréntesis cuando aplica.

## A

**Alias (alias)** — Nombre que le pones al resultado de un campo en GraphQL:
`abiertos: issues(states: OPEN)`. Permite pedir el mismo campo varias veces con
argumentos distintos en una sola consulta.

**API v3 / API v4** — Los nombres antiguos de REST y GraphQL. Siguen apareciendo
en la documentación; no son versiones sucesivas, son dos APIs vivas.

## B

**Backoff exponencial (exponential backoff)** — Estrategia de reintento en la que
cada espera dobla a la anterior. Lo que hace `@octokit/plugin-retry` ante un
`5xx`.

## C

**Coste (cost)** — Puntos que gasta una consulta de GraphQL, calculados sobre el
número de nodos que podría devolver, entre 100. Se consulta con
`rateLimit { cost }` dentro de la propia consulta.

**Cubo de límite (rate limit resource)** — Cada API tiene el suyo: `core`,
`graphql`, `search`, `code_search`. Agotar uno no afecta a los demás. El campo
`X-RateLimit-Resource` dice cuál estás gastando.

**Cursor (cursor)** — Puntero opaco a una posición dentro de una conexión de
GraphQL. No es un número de página y no se puede fabricar: lo devuelve el
servidor en `endCursor`.

## E

**ETag** — Identificador de la versión de un recurso. Devolverlo en
`If-None-Match` provoca un `304 Not Modified`, que **no consume cupo**.

**Extensión de `gh` (gh extension)** — Repositorio llamado `gh-<algo>` con un
ejecutable homónimo en la raíz. Se instala con `gh extension install` y hereda la
autenticación de `gh`.

## F

**Fragmento (fragment)** — Bloque de campos reutilizable en GraphQL. El
**fragmento en línea** (`... on Tipo`) es obligatorio cuando un campo puede
devolver varios tipos, como `object` en un repositorio.

## G

**`GH_REPO`** — Variable de entorno que decide a qué repositorio apuntan los
marcadores `{owner}` y `{repo}`. Es lo que hace que un guion sirva para cualquier
repositorio sin editarlo.

**`GITHUB_TOKEN`** — Token efímero que Actions crea por job. Sus permisos se
declaran con `permissions` y su cupo es de **1 000 peticiones por hora y
repositorio**, no las 5 000 de un usuario.

## I

**Introspección (introspection)** — Capacidad de un esquema GraphQL de
describirse a sí mismo. `__type(name: "Repository") { fields { name } }` contesta
«¿cómo se llamaba ese campo?» sin abrir el navegador.

## L

**Límite primario (primary rate limit)** — Cuántas peticiones por hora. Se ve
venir en las cabeceras `X-RateLimit-*`.

**Límite secundario (secondary rate limit)** — Cómo pides: ráfagas, concurrencia,
escrituras seguidas. No tiene número público y avisa con `Retry-After`.

**Link (cabecera `Link`)** — Cabecera de paginación de REST. `rel="next"` indica
que hay más páginas; su ausencia, que era la última.

## M

**Mutación (mutation)** — Operación de escritura en GraphQL. Sus argumentos van
dentro de `input:` y obliga a pedir algo de vuelta.

## N

**`node_id`** — Identificador global y opaco de cualquier objeto de GitHub. Es lo
que piden las mutaciones, y viene en casi toda respuesta REST: el puente entre
las dos APIs.

## O

**Octokit** — SDK oficial de GitHub. El paquete `octokit` trae REST, GraphQL,
paginación y autenticación de App; `@octokit/rest` solo REST.

**Over-fetching** — Traer muchos más campos de los que vas a usar. Es el vicio
menor: una petición, mucho ruido.

## P

**`--paginate`** — Flag de `gh api` que recorre todas las páginas. En REST sigue
la cabecera `Link`; en GraphQL necesita `$endCursor` y `pageInfo`.

**`paginate` (Octokit)** — `octokit.paginate()` devuelve el array ya concatenado;
`paginate.iterator()` recorre página a página sin cargarlo todo en memoria.

**`per_page`** — Tamaño de página en REST. Máximo 100, por defecto 30: la
optimización más barata de la semana.

**Placeholder de `gh`** — Los literales `{owner}`, `{repo}` y `{branch}`, que `gh`
sustituye por los del repositorio actual.

## R

**`rateLimit`** — Campo raíz de GraphQL que informa del coste y del cupo
restante. Su equivalente REST es el endpoint `rate_limit`, que **no gasta cupo**.

**`Retry-After`** — Cabecera que dice cuántos segundos esperar tras un límite
secundario. Reintentar antes empeora el bloqueo.

## S

**`--slurp`** — Flag de `gh api` que junta todas las páginas en un array. **No se
puede combinar con `--jq` ni con `--template`**: la salida se pasa a `jq` por
tubería.

## T

**`--template`** — Plantilla de Go para formatear la salida de `gh api`. Para
personas; el `--jq`, para encadenar.

**`totalCount`** — Campo de las conexiones de GraphQL que da el número de
elementos sin traer ninguno.

## U

**Under-fetching** — Necesitar varias peticiones para contestar una pregunta. Es
el vicio que de verdad frena: multiplica latencia y cupo.

---

← [Volver a la Semana 15](../README.md)
