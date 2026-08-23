# Práctica 02 — Una consulta en vez de veinte

> El inventario de la Práctica 01 costó varias peticiones REST. Aquí lo pides
> entero con **una** consulta, la guardas en un archivo versionado y creas por
> mutación el issue que la auditoría automática irá actualizando cada semana.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 05](../1-teoria/05-graphql-a-fondo.md) y la Práctica
01 terminada (el label `auditoria` tiene que existir)

## Paso 1: La consulta más corta que existe

**Por qué**: comprobar que el endpoint contesta y ver la forma de la respuesta
—todo cuelga de `data`— antes de escribir nada largo.

```bash
gh api graphql -f query='query { viewer { login name } }'
```

**Verifica** que la respuesta viene envuelta en `{"data": {...}}`. Ese envoltorio
es la razón de que todos los `--jq` de GraphQL empiecen por `.data`.

```bash
gh api graphql -f query='query { viewer { login } }' --jq '.data.viewer.login'
```

## Paso 2: El inventario, en una sola consulta

**Por qué**: es la comparación que justifica aprender GraphQL. Lo que en la
Práctica 01 fueron tres llamadas, aquí es una — y trae más datos.

```bash
gh api graphql -F owner='{owner}' -F repo='{repo}' -f query='
query($owner: String!, $repo: String!) {
  rateLimit { cost remaining }
  repository(owner: $owner, name: $repo) {
    nameWithOwner
    isPrivate
    licenseInfo { spdxId }
    defaultBranchRef { name }
    abiertos: issues(states: OPEN) { totalCount }
    cerrados: issues(states: CLOSED) { totalCount }
    prsAbiertos: pullRequests(states: OPEN) { totalCount }
    rulesets(first: 10) { nodes { name enforcement } }
    vulnerabilityAlerts(states: OPEN) { totalCount }
    releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes { tagName publishedAt }
    }
  }
}'
```

**Verifica** tres cosas en la respuesta:

1. Los **alias** (`abiertos`, `cerrados`, `prsAbiertos`) permiten pedir el mismo
   campo tres veces con argumentos distintos
2. `rulesets` y `vulnerabilityAlerts` **existen en GraphQL**, aunque las alertas
   de secret scanning y los workflows de Actions no
3. `rateLimit.cost` es **1**. Todo eso costó un punto

> [!TIP]
> `-F owner='{owner}'` funciona porque `-F` resuelve los marcadores del
> repositorio actual. Con `-f` llegarían como texto literal y la consulta
> devolvería `NOT_FOUND`.

## Paso 3: La consulta, a un archivo versionado

**Por qué**: una consulta de treinta líneas dentro de comillas no se revisa en un
PR ni la colorea el editor. En un archivo `.graphql` sí, y la Práctica 03 la
reutiliza desde TypeScript.

```bash
cd <ruta-a-tu-repo>
git switch -c feat/consulta-de-auditoria
mkdir -p tools/consultas

cat > tools/consultas/auditoria.graphql <<'CONSULTA'
# Estado general del repositorio para el informe de auditoría.
# Variables: $owner, $repo
query AuditoriaRepositorio($owner: String!, $repo: String!) {
  rateLimit { cost remaining }
  repository(owner: $owner, name: $repo) {
    nameWithOwner
    isPrivate
    description
    licenseInfo { spdxId }
    defaultBranchRef { name }
    issuesAbiertos: issues(states: OPEN) { totalCount }
    prsAbiertos: pullRequests(states: OPEN) { totalCount }
    rulesets(first: 10) { nodes { name enforcement } }
    vulnerabilityAlerts(states: OPEN) { totalCount }
    releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes { tagName publishedAt }
    }
    ultimoCommit: defaultBranchRef {
      target {
        ... on Commit {
          committedDate
          statusCheckRollup { state }
        }
      }
    }
  }
}
CONSULTA
```

Ejecútala desde el archivo — y fíjate en el flag:

```bash
# ❌ -f manda la ruta como si fuera la consulta
gh api graphql -f query=@tools/consultas/auditoria.graphql

# ✅ solo -F interpreta el @
gh api graphql -F query=@tools/consultas/auditoria.graphql \
  -F owner='{owner}' -F repo='{repo}' --jq '.data.repository | {nameWithOwner, issuesAbiertos: .issuesAbiertos.totalCount}'
```

**Verifica** que la versión con `-f` falla con un error de sintaxis de GraphQL
(está intentando ejecutar la cadena `@tools/...`) y que la de `-F` funciona.

El `... on Commit` del final es un **fragmento en línea**: `target` puede ser un
commit, una etiqueta o un blob, y hay que decir de qué tipo quieres los campos.

## Paso 4: Paginar con cursores

**Por qué**: `totalCount` te da el número, pero cuando necesitas los elementos hay
que recorrer la conexión. En GraphQL eso son cursores, no páginas.

```bash
cat > /tmp/labels.graphql <<'CONSULTA'
query($owner: String!, $repo: String!, $endCursor: String) {
  repository(owner: $owner, name: $repo) {
    labels(first: 50, after: $endCursor) {
      totalCount
      nodes { name }
      pageInfo { hasNextPage endCursor }
    }
  }
}
CONSULTA

gh api graphql -F query=@/tmp/labels.graphql -F owner='{owner}' -F repo='{repo}' \
  --paginate --jq '.data.repository.labels.nodes[].name' | wc -l
```

**Verifica** que el número coincide con el de la Práctica 01. Ahora quita
`pageInfo` del archivo y vuelve a ejecutarlo: `--paginate` deja de paginar,
porque necesita `hasNextPage` y `endCursor` para saber si continuar y por dónde.

> [!IMPORTANT]
> Las dos condiciones para que `gh api graphql --paginate` funcione son la
> variable `$endCursor: String` usada en `after:` y el bloque
> `pageInfo { hasNextPage endCursor }`. Sin las dos, obtienes la primera página y
> ningún aviso.

## Paso 5: Los errores llegan con `200`

**Por qué**: es la trampa que rompe los guiones que solo miran el código HTTP.

```bash
gh api graphql -f query='query { repository(owner: "cli", name: "no-existe-xyz") { name } }'
echo "código de salida: $?"
```

**Verifica** que el cuerpo trae `"data":{"repository":null}` **y** un array
`errors` con `"type":"NOT_FOUND"`, y que `gh` sale con código 1 pese a que la
respuesta HTTP fue un `200`. Desde Octokit (Práctica 03) esto llega como
excepción; desde `curl`, como un `200` que hay que inspeccionar a mano.

## Paso 6: Mutar — el issue que se irá actualizando

**Por qué**: la auditoría automática de la Práctica 03 no creará un issue nuevo
cada semana: actualizará este. Lo creas ahora, con una mutación, para ver cómo
funcionan los identificadores de nodo.

```bash
REPO_ID=$(gh api repos/{owner}/{repo} --jq '.node_id')
LABEL_ID=$(gh api repos/{owner}/{repo}/labels/auditoria --jq '.node_id')
echo "$REPO_ID / $LABEL_ID"
```

Esos `node_id` son el puente entre las dos APIs: los sacas de REST y los gastas
en GraphQL.

```bash
gh api graphql -f query='
mutation($repoId: ID!, $labelId: ID!, $titulo: String!, $cuerpo: String!) {
  createIssue(input: {
    repositoryId: $repoId,
    labelIds: [$labelId],
    title: $titulo,
    body: $cuerpo
  }) {
    issue { number url }
  }
}' -F repoId="$REPO_ID" -F labelId="$LABEL_ID" \
   -f titulo='Auditoría del repositorio' \
   -f cuerpo='Informe pendiente de la primera ejecución automática.' \
   --jq '.data.createIssue.issue'
```

**Verifica**:

```bash
gh issue list --label auditoria --state open --json number,title,labels
```

Tres reglas de las mutaciones que acabas de usar sin darte cuenta: los argumentos
van dentro de `input:`, hay que **pedir algo de vuelta** (`issue { number url }`)
y los identificadores son `node_id`, no el número que ves en la interfaz.

## Paso 7: Medir la diferencia

**Por qué**: la comparación es el argumento. Guárdala, porque es lo que vas a
poner en el README.

```bash
ANTES=$(gh api rate_limit --jq '.resources.core.used')
gh api repos/{owner}/{repo} --silent
gh api repos/{owner}/{repo}/rulesets --silent
gh api repos/{owner}/{repo}/actions/workflows --silent
DESPUES=$(gh api rate_limit --jq '.resources.core.used')
echo "REST gastó $((DESPUES - ANTES)) peticiones del cubo core"

gh api graphql -F query=@tools/consultas/auditoria.graphql \
  -F owner='{owner}' -F repo='{repo}' --jq '.data.rateLimit.cost'
```

**Verifica** que REST gastó tres y la consulta de GraphQL costó **1 punto** de un
cubo distinto — con la salvedad honesta de que la consulta no trae los workflows,
que no existen en GraphQL. Esa es exactamente la razón por la que el guion de la
Práctica 03 usa las dos APIs.

## Paso 8: Publicar la consulta

```bash
git add tools/consultas/auditoria.graphql
git commit -m "feat(tools): consulta GraphQL de auditoria del repositorio"
git push -u origin feat/consulta-de-auditoria
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica** que el archivo está en la rama por defecto:

```bash
gh api repos/{owner}/{repo}/contents/tools/consultas/auditoria.graphql \
  --jq '.content | @base64d' | head -5
```

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `Expected one of SCHEMA, SCALAR...` | `-f query=@archivo` | `-F query=@archivo` |
| `NOT_FOUND` con el repo correcto | `{owner}` pasado con `-f`, llega literal | `-F owner='{owner}'` |
| `--paginate` trae solo 50 | Falta `pageInfo` o `$endCursor` | Añadir las dos cosas |
| `MAX_NODE_LIMIT_EXCEEDED` | Demasiados `first: 100` anidados | Bajar los `first:` interiores |
| `Field 'X' doesn't exist on type 'Y'` | Nombre de campo REST en GraphQL | `__type(name: "Y") { fields { name } }` |
| La mutación no compila | Falta la subselección de retorno | Pedir algo dentro de `createIssue { ... }` |
| `Variable $repoId of type ID! was provided invalid value` | Se pasó el número del issue | Usar `.node_id` |
| El `cost` sale mayor que 1 | Muchos nodos pedidos | Bajar los `first:`, o aceptarlo |

## ✅ Resultado

- [ ] Sabes que toda respuesta GraphQL cuelga de `data`
- [ ] Has pedido el inventario entero en una consulta con alias
- [ ] La consulta vive en `tools/consultas/auditoria.graphql`, en la rama por defecto
- [ ] Sabes por qué `-f query=@archivo` no funciona
- [ ] Has paginado con `$endCursor` y visto qué pasa sin `pageInfo`
- [ ] Has visto un error de GraphQL llegar con `HTTP 200`
- [ ] Has creado el issue `Auditoría del repositorio` con una mutación
- [ ] Puedes decir cuánto costó cada camino

## ✅ Verificación de la semana

```bash
./scripts/verificar-semana.sh 15 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 15](../README.md)
