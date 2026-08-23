# GraphQL a fondo

> Escribir GraphQL a mano parece incómodo hasta que descubres que el esquema se
> puede preguntar a sí mismo y que el explorador autocompleta. A partir de ahí es
> el camino corto: una consulta contesta lo que en REST son veinte llamadas.

## 🎯 Objetivos

- Escribir consultas con variables, alias y fragmentos
- Entender qué es un `node_id` y por qué lo necesitas para mutar
- Ejecutar mutaciones desde `gh api graphql`
- Leer un error de GraphQL, que llega con `HTTP 200`
- Explorar el esquema sin salir de la terminal

## 1. Qué problema resuelve

REST te da recursos; GraphQL te da **el grafo**. Preguntas por un repositorio y
sigues las aristas —sus issues, el autor de cada uno, sus labels, el PR que lo
cerró— en la misma petición y con la forma que tú decidas.

Tres cosas que solo se pueden hacer aquí:

- **Projects v2**, entero: campos, vistas, items, valores
- **Discussions**: crearlas, responderlas, marcar la respuesta aceptada
- **Sub-issues** y el estado agregado de checks de un commit
  (`statusCheckRollup`)

## 2. Anatomía de una consulta

```graphql
query AuditoriaRepo($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    nameWithOwner
    isPrivate
    defaultBranchRef { name }
    abiertos: issues(states: OPEN) { totalCount }
    cerrados: issues(states: CLOSED) { totalCount }
    licenseInfo { spdxId }
  }
}
```

| Pieza | Qué es |
|-------|--------|
| `query AuditoriaRepo` | Operación con nombre. Obligatorio si mandas varias; útil siempre para depurar |
| `($owner: String!)` | Variable tipada. El `!` significa obligatoria |
| `repository(...)` | Campo raíz con argumentos |
| `abiertos:` | **Alias**: renombra el resultado y permite pedir el mismo campo dos veces con argumentos distintos |
| `{ totalCount }` | Subselección. En GraphQL no hay campos implícitos: lo que no pides, no viene |

Ejecutarlo:

```bash
gh api graphql -F owner=cli -F repo=cli -F query=@auditoria.graphql \
  --jq '.data.repository'
```

Las variables se pasan como campos normales: **todo lo que no se llame `query` u
`operationName` se interpreta como variable de GraphQL**. Y recuerda del
[archivo 02](02-gh-api-a-fondo.md): la consulta desde archivo va con `-F`, nunca
con `-f`.

## 3. Fragmentos: dejar de repetirse

Cuando pides los mismos campos en varios sitios —o cuando un campo devuelve una
unión de tipos— los fragmentos evitan copiar y pegar:

```graphql
fragment DatosDeIssue on Issue {
  number
  title
  author { login }
  labels(first: 10) { nodes { name } }
}

query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    recientes: issues(first: 5, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes { ...DatosDeIssue }
    }
    viejos: issues(first: 5, orderBy: {field: CREATED_AT, direction: ASC}) {
      nodes { ...DatosDeIssue }
    }
  }
}
```

El **fragmento en línea** (`... on Tipo`) es obligatorio cuando el campo devuelve
varios tipos posibles. Es el caso de `object` en un repositorio, que puede ser un
`Blob`, un `Tree`, un `Commit` o un `Tag`:

```graphql
query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    object(expression: "HEAD:README.md") {
      ... on Blob { byteSize isBinary }
    }
  }
}
```

## 4. Los identificadores de nodo

Casi toda mutación pide un `id`, y no es el número que ves en la interfaz: es un
**`node_id`**, una cadena opaca que identifica al objeto en todo GitHub.

```bash
# Por GraphQL
gh api graphql -F owner=cli -F repo=cli -f query='
query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) { id }
}' --jq '.data.repository.id'

# Por REST: casi todas las respuestas lo traen en .node_id
gh api repos/cli/cli --jq '.node_id'
```

Ese `.node_id` de REST es el puente entre las dos APIs: buscas por REST, mutas
por GraphQL. Y al revés, `node(id: "...")` recupera cualquier objeto por su
identificador sin saber de qué tipo es.

## 5. Mutaciones

```bash
gh api graphql -f query='
mutation($repoId: ID!, $titulo: String!, $cuerpo: String!) {
  createIssue(input: {repositoryId: $repoId, title: $titulo, body: $cuerpo}) {
    issue { number url }
  }
}' -F repoId="$(gh api repos/{owner}/{repo} --jq .node_id)" \
   -f titulo='Informe de auditoría' \
   -f cuerpo='Generado por el guion de la Semana 15.'
```

Tres reglas de las mutaciones de GitHub:

1. Los argumentos van dentro de un objeto **`input:`**
2. Hay que **pedir algo de vuelta**: una mutación sin subselección no compila
3. Aceptan `clientMutationId` para correlacionar peticiones en tus logs

Para lo normal —crear un issue, cerrarlo, comentar— REST es más corto. La
mutación se gana el sitio en Projects v2, Discussions y en todo lo que no tiene
endpoint REST.

## 6. Los errores llegan con `200`

Esto rompe la intuición de todo el mundo: en GraphQL, una consulta que falla
devuelve **HTTP 200** con un array `errors` en el cuerpo, y a veces con `data`
parcialmente relleno.

```bash
gh api graphql -f query='query { repository(owner:"cli", name:"no-existe-xyz") { name } }'
```

```json
{"data":{"repository":null},"errors":[{"type":"NOT_FOUND","message":"Could not resolve to a Repository with the name 'cli/no-existe-xyz'."}]}
```

`gh` es amable y **sale con código 1** imprimiendo el mensaje, pero si consumes
la respuesta desde otro cliente —Octokit, `curl`, `fetch`— comprobar el código
HTTP no basta: hay que mirar `errors`.

| `type` | Qué significa |
|--------|---------------|
| `NOT_FOUND` | No existe, o tu token no puede verlo. La API no distingue a propósito |
| `FORBIDDEN` | Existe y no tienes permiso |
| `RATE_LIMITED` | Cupo agotado (archivo 04) |
| `MAX_NODE_LIMIT_EXCEEDED` | La consulta pide demasiado: baja los `first:` |

## 7. Explorar el esquema

- **El explorador**: `docs.github.com/graphql/overview/explorer` — autocompletado
  y documentación en la propia página. Media hora aquí ahorra un día
- **La referencia**: `docs.github.com/graphql/reference` — objetos, mutaciones y
  tipos de entrada, uno a uno
- **Introspección desde la terminal**, cuando dudas de un nombre de campo:

```bash
gh api graphql -f query='
query {
  __type(name: "Repository") {
    fields { name description }
  }
}' --jq '.data.__type.fields[].name' | head -30
```

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Interpolar valores en la cadena de la consulta | Rompe con comillas y se presta a inyección | Variables (`-F`) |
| Comprobar solo el código HTTP | Los errores vienen con `200` | Mirar `errors` |
| Pedir `first: 100` en cada nivel anidado | `MAX_NODE_LIMIT_EXCEEDED` | Bajar los `first:` interiores |
| Usar el número del issue como `id` | Las mutaciones quieren `node_id` | `.node_id` de REST, o `id` en GraphQL |
| Consultas gigantes «por si acaso» | Coste y lentitud | Pedir lo que se va a usar |
| Repetir bloques de campos | Ilegible y difícil de mantener | Fragmentos |
| `-f query=@archivo` | Manda la ruta como consulta | `-F query=@archivo` |

## 9. Trucos

- **Alias para comparar**: `abiertos: issues(states: OPEN) { totalCount }` y
  `cerrados: issues(states: CLOSED) { totalCount }` en la misma consulta
- **`rateLimit { cost }` dentro de la consulta** mide lo que cuesta sin una
  llamada aparte
- **`.node_id` de REST** es el atajo para no escribir una consulta solo para
  conseguir un identificador
- **Guarda las consultas en `.graphql`**: se versionan, se revisan en PR y el
  editor las colorea. Un `-f query='...'` de treinta líneas no se revisa
- **`__type(name: "...")`** contesta «¿cómo se llamaba ese campo?» en dos
  segundos y sin abrir el navegador
- **El explorador acepta variables** en su panel inferior: prueba ahí la consulta
  antes de meterla en un guion

## 📚 Recursos Adicionales

- [GraphQL API — Reference](https://docs.github.com/en/graphql/reference)
- [Forming calls with GraphQL](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql)
- [GraphQL Explorer](https://docs.github.com/en/graphql/overview/explorer)
- [Using global node IDs](https://docs.github.com/en/graphql/guides/using-global-node-ids)
- [Introduction to GraphQL — Discovering the schema](https://docs.github.com/en/graphql/guides/introduction-to-graphql#discovering-the-graphql-api)

## ✅ Checklist de Verificación

- [ ] Escribes consultas con variables en vez de interpolar cadenas
- [ ] Sabes cuándo hace falta un fragmento en línea (`... on Tipo`)
- [ ] Puedes conseguir el `node_id` de cualquier objeto por dos caminos
- [ ] Has ejecutado una mutación desde `gh api graphql`
- [ ] Sabes que un error de GraphQL llega con `HTTP 200`
- [ ] Puedes consultar el esquema sin abrir el navegador
