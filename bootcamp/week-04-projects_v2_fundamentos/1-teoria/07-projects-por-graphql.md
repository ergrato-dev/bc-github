# Projects por GraphQL

> La API REST no conoce Projects v2. Todo lo que quieras leer, medir o exportar
> de tu tablero pasa por GraphQL — y por un puñado de IDs que hay que saber
> pedir.

## 🎯 Objetivos

- Autorizar correctamente el acceso a projects y reconocer el error de scope
- Obtener el ID de un project, de sus campos y de sus opciones
- Leer items y valores de campo, incluidos los tipos que no son texto
- Paginar sin dejarte la mitad de los items por el camino
- Saber cuándo basta con `gh project` y cuándo hace falta GraphQL

## 1. Qué problema resuelve

Todo lo que la interfaz muestra se puede sacar por API: el estado del sprint, los
items sin estimar, el histórico para un informe. Pero Projects v2 **no está en la
API REST**, y su modelo en GraphQL usa uniones e IDs internos que no se parecen a
nada de lo que has usado hasta ahora.

Esta teoría es la parte de lectura. Escribir —crear items, mover campos desde un
workflow— es la Semana 05.

## 2. Antes de nada: el scope

```bash
gh auth refresh -s read:project     # leer
gh auth refresh -s project          # leer y escribir
gh auth status
```

Sin eso, cualquier consulta responde:

```
INSUFFICIENT_SCOPES: Your token has not been granted the required scopes
```

Es el primer tropiezo de todo el mundo con Projects, y no se parece a un problema
de permisos porque el project se ve perfectamente en el navegador.

## 3. Los IDs, que es lo que todo el mundo busca

Casi cualquier consulta o mutación necesita el ID interno (`PVT_…`, `PVTF_…`,
`PVTI_…`). La vía corta es la CLI:

```bash
gh project list --owner @me
gh project view 3 --owner @me --format json --jq '.id'
gh project field-list 3 --owner @me --format json \
  --jq '.fields[] | "\(.id)\t\(.type)\t\(.name)"'
```

Y la vía completa, GraphQL, que además da las **opciones** de cada single select
y las iteraciones:

```bash
gh api graphql -F owner=ergrato-dev -F numero=3 -f query='
  query($owner: String!, $numero: Int!) {
    user(login: $owner) {
      projectV2(number: $numero) {
        id
        title
        fields(first: 50) {
          nodes {
            ... on ProjectV2Field            { id name dataType }
            ... on ProjectV2SingleSelectField { id name options { id name } }
            ... on ProjectV2IterationField    { id name
              configuration { iterations { id title startDate duration } } }
          }
        }
      }
    }
  }'
```

Ese `... on` es lo que más choca al principio: `fields` devuelve una **unión**, y
hay que decir qué quieres de cada tipo. Lo mismo pasa con los items y con los
valores de campo.

> [!NOTE]
> Si el project es de una organización, `user(login:)` se cambia por
> `organization(login:)`. Es el segundo tropiezo clásico, y el error que devuelve
> no lo dice claro.

## 4. Leer los items

```bash
gh api graphql -F owner=ergrato-dev -F numero=3 -f query='
  query($owner: String!, $numero: Int!) {
    user(login: $owner) {
      projectV2(number: $numero) {
        items(first: 50) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            content {
              ... on Issue        { number title state url }
              ... on PullRequest  { number title state url }
              ... on DraftIssue   { title }
            }
            fieldValues(first: 20) {
              nodes {
                ... on ProjectV2ItemFieldTextValue         { text  field { ... on ProjectV2Field { name } } }
                ... on ProjectV2ItemFieldNumberValue       { number field { ... on ProjectV2Field { name } } }
                ... on ProjectV2ItemFieldDateValue         { date  field { ... on ProjectV2Field { name } } }
                ... on ProjectV2ItemFieldSingleSelectValue { name  field { ... on ProjectV2SingleSelectField { name } } }
                ... on ProjectV2ItemFieldIterationValue    { title startDate
                                                            field { ... on ProjectV2IterationField { name } } }
              }
            }
          }
        }
      }
    }
  }'
```

Parece mucho, y lo es: cada tipo de valor es un tipo distinto. La buena noticia es
que esta consulta se escribe una vez y se reutiliza para siempre — guárdala en
`scripts/`.

## 5. Paginar

Un project real pasa de 100 items, y GraphQL nunca devuelve más de 100 por
página. `gh` sabe paginar solo si la consulta declara la variable `$endCursor`:

```bash
gh api graphql --paginate -F owner=ergrato-dev -F numero=3 -f query='
  query($owner: String!, $numero: Int!, $endCursor: String) {
    user(login: $owner) {
      projectV2(number: $numero) {
        items(first: 100, after: $endCursor) {
          pageInfo { hasNextPage endCursor }
          nodes { id content { ... on Issue { number title } } }
        }
      }
    }
  }' --jq '.data.user.projectV2.items.nodes[] | "\(.number // "draft")\t\(.title)"'
```

Sin `$endCursor` en la firma, `--paginate` no hace nada y te quedas con la
primera página **sin ningún aviso**. Es el fallo silencioso de la semana.

### Cuánto cuesta

GraphQL no cuenta peticiones, cuenta **puntos**: una consulta que pide muchos
nodos anidados vale más que una sencilla.

```bash
gh api graphql -f query='{ rateLimit { cost remaining resetAt } }'
```

Añadir `rateLimit { cost remaining }` a tus propias consultas mientras las
desarrollas evita sorpresas cuando las pongas en un bucle.

## 6. `gh project` o GraphQL

| Necesitas | Usa |
|-----------|-----|
| Listar projects, ver campos, añadir un item | `gh project …` |
| Un volcado rápido de items | `gh project item-list 3 --owner @me --format json` |
| Valores de campo por item, filtrados y cruzados | GraphQL |
| Iteraciones con sus fechas | GraphQL |
| Métricas e informes reproducibles | GraphQL en un script |
| Automatizar desde un workflow | GraphQL (Semana 05) |

Regla: empieza por `gh project`; baja a GraphQL cuando necesites algo que la CLI
no expone o cuando quieras cruzar campos.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Buscar Projects v2 en la API REST | No existe | GraphQL |
| Olvidar el scope `read:project` | `INSUFFICIENT_SCOPES` sin pista clara | `gh auth refresh -s read:project` |
| `--paginate` sin `$endCursor` | Te quedas con 100 items y no te enteras | Declara la variable |
| Copiar IDs a mano de la URL | Los `PVT_` no están en la URL | `field-list --format json` |
| `user(login:)` con un project de organización | Devuelve nulo y parece que no existe | `organization(login:)` |
| Consultas gigantes en bucle | Agotas los puntos de GraphQL | Pide solo los campos que uses |
| Guardar los IDs en el script a fuego | Cambian al recrear el project | Resuélvelos al principio del script |

## 8. Trucos

- **Explorar la API sin escribir queries a ciegas**: el
  [explorador de GraphQL](https://docs.github.com/graphql/overview/explorer) tiene
  autocompletado y documentación del esquema al lado
- **Volcado rápido a CSV**:
  ```bash
  gh project item-list 3 --owner @me --format json \
    --jq '.items[] | [.content.number, .title, .status] | @csv'
  ```
- **Guarda las consultas en archivos** y pásalas con
  `gh api graphql -F query=@consulta.graphql`
- **Empieza siempre por `rateLimit`** cuando una consulta vaya a ir en un bucle
- **Un alias para el ID del project**:
  `gh alias set pid 'project view 3 --owner @me --format json --jq .id'`
- **Si algo no aparece en la respuesta**, casi siempre falta un `... on` para ese
  tipo concreto

## 📚 Recursos Adicionales

- [GitHub Docs — Using the API to manage Projects](https://docs.github.com/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)
- [GraphQL API — ProjectV2](https://docs.github.com/graphql/reference/objects#projectv2)
- [GitHub Docs — Resource limitations de GraphQL](https://docs.github.com/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api)
- [Explorador de GraphQL](https://docs.github.com/graphql/overview/explorer)

## ✅ Checklist de Verificación

- [ ] `gh auth status` incluye el scope `read:project`
- [ ] Sabes obtener el ID de tu project y el de sus campos
- [ ] Has leído los valores de un single select por GraphQL
- [ ] Tu consulta paginada declara `$endCursor`
- [ ] Sabes cuándo basta con `gh project` y cuándo no
