# Práctica 04 — GraphQL del project

> Projects v2 no existe en la API REST. Aprendes a consultarlo por GraphQL, que
> es lo que necesitarás para automatizarlo la semana que viene.

**Duración estimada**: 40 min
**Prerrequisitos**: prácticas 01-03, scope `project`

## Contexto

Todo lo que has configurado a mano se puede consultar y modificar por API. Esta
práctica es de **lectura**: la escritura llega en la Semana 05, y para
escribir hace falta conocer los IDs internos que vas a sacar aquí.

## Paso 1: Localizar tu project

**Por qué**: el número que usa el CLI y el `ID` que usa GraphQL no son lo mismo.

```bash
OWNER=<tu-usuario>

gh api graphql -F owner="$OWNER" -f query='
  query($owner: String!) {
    user(login: $owner) {
      projectsV2(first: 10) {
        nodes { id number title items { totalCount } }
      }
    }
  }' --jq '.data.user.projectsV2.nodes[] | "\(.number)  \(.id)  \(.title) — \(.items.totalCount) items"'
```

Guarda el `id` (empieza por `PVT_`):

```bash
PROJ_ID=<PVT_...>
```

**Verifica**: el número de items coincide con lo que ves en la web.

> [!NOTE]
> Si tu project pertenece a una organización, cambia `user(login:$owner)` por
> `organization(login:$owner)`. Es el error más frecuente en estas consultas.

## Paso 2: Listar los campos y sus IDs

**Por qué**: para escribir en un campo hace falta su ID, y para un single select
también el ID de la **opción**.

```bash
gh api graphql -F id="$PROJ_ID" -f query='
  query($id: ID!) {
    node(id: $id) {
      ... on ProjectV2 {
        fields(first: 30) {
          nodes {
            ... on ProjectV2FieldCommon { id name dataType }
            ... on ProjectV2SingleSelectField {
              id name options { id name }
            }
          }
        }
      }
    }
  }' --jq '.data.node.fields.nodes[] | {name, id, opciones: (.options // [] | map(.name))}'
```

**Verifica**: aparecen `Status`, `Priority`, `Size`, `Area`, `Iteration` con sus
IDs y opciones.

Aquí se ven los **fragmentos** de GraphQL (`... on Tipo`): un campo puede ser de
varios tipos y cada uno expone datos distintos. Sin el fragmento de
`ProjectV2SingleSelectField` no verías las opciones.

## Paso 3: Listar items con sus valores

**Por qué**: es la consulta base de cualquier métrica.

```bash
gh api graphql -F id="$PROJ_ID" -f query='
  query($id: ID!) {
    node(id: $id) {
      ... on ProjectV2 {
        items(first: 50) {
          totalCount
          nodes {
            id
            content {
              ... on Issue { number title state }
              ... on PullRequest { number title state }
            }
            fieldValues(first: 10) {
              nodes {
                ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2FieldCommon { name } } }
                ... on ProjectV2ItemFieldIterationValue { title field { ... on ProjectV2FieldCommon { name } } }
              }
            }
          }
        }
      }
    }
  }' --jq '.data.node.items.nodes[] | {
      issue: .content.number,
      titulo: .content.title,
      campos: [.fieldValues.nodes[] | select(.field != null) | "\(.field.name)=\(.name // .title)"]
    }'
```

**Verifica**: cada item muestra su número de issue y los valores de sus campos.

## Paso 4: Responder preguntas con `--jq`

**Por qué**: la potencia está en combinar la consulta con el filtrado local.

Cuántos items hay por prioridad:

```bash
gh api graphql -F id="$PROJ_ID" -f query='
  query($id: ID!) {
    node(id: $id) { ... on ProjectV2 { items(first: 100) { nodes {
      fieldValues(first: 10) { nodes {
        ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2FieldCommon { name } } }
      } }
    } } } }
  }' --jq '[.data.node.items.nodes[].fieldValues.nodes[]
            | select(.field.name == "Priority") | .name]
           | group_by(.) | map({prioridad: .[0], n: length})'
```

**Verifica**: los recuentos coinciden con la vista `Backlog` agrupada por
prioridad.

## Paso 5: Paginación

**Por qué**: `first: 100` es el máximo por página. Con más items hay que
paginar, y esto se te olvidará justo cuando importe.

```bash
gh api graphql -F id="$PROJ_ID" -f query='
  query($id: ID!) {
    node(id: $id) { ... on ProjectV2 {
      items(first: 5) {
        pageInfo { hasNextPage endCursor }
        nodes { id }
      }
    } }
  }' --jq '.data.node.items.pageInfo'
```

**Verifica**: si tienes más de 5 items, `hasNextPage` es `true` y hay un
`endCursor`. La siguiente página se pide con `after: "<endCursor>"`.

## Paso 6: Guardar la consulta como script

**Por qué**: la vas a repetir muchas veces, y en la Semana 05 la reutilizarás
dentro de un workflow.

```bash
mkdir -p scripts
cat > scripts/project-resumen.sh <<'EOF'
#!/usr/bin/env bash
# Resumen del project: items por estado.
# Uso: scripts/project-resumen.sh <PROJECT_ID>
set -eu
gh api graphql -F id="$1" -f query='
  query($id: ID!) {
    node(id: $id) { ... on ProjectV2 { title items(first: 100) { totalCount nodes {
      fieldValues(first: 10) { nodes {
        ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2FieldCommon { name } } }
      } }
    } } } }
  }' --jq '{
    proyecto: .data.node.title,
    total: .data.node.items.totalCount,
    por_estado: ([.data.node.items.nodes[].fieldValues.nodes[]
                  | select(.field.name == "Status") | .name]
                 | group_by(.) | map({estado: .[0], n: length}))
  }'
EOF
chmod +x scripts/project-resumen.sh
./scripts/project-resumen.sh "$PROJ_ID"
```

**Verifica**: el script imprime el título, el total y el reparto por estado.

Commitéalo en tu repositorio:

```bash
git add scripts/project-resumen.sh
git commit -qm "feat: añade script de resumen del project por GraphQL"
git push -q
```

## ✅ Resultado

- [ ] Conoces el `PVT_` de tu project
- [ ] Has listado campos y opciones con sus IDs
- [ ] Has listado items con sus valores de campo
- [ ] Has calculado un reparto con `--jq`
- [ ] Entiendes `pageInfo` y la paginación por cursor
- [ ] `scripts/project-resumen.sh` commiteado y funcionando

```bash
./scripts/verificar-semana.sh 04 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `INSUFFICIENT_SCOPES` | Falta `read:project` o `project` | `gh auth refresh -s project` |
| `Could not resolve to a User` | El project es de una organización | Usa `organization(login:$owner)` |
| Los `fieldValues` salen vacíos | Falta el fragmento del tipo correcto | Añade `... on ProjectV2ItemFieldSingleSelectValue` |
| `Field 'items' doesn't exist on type 'Node'` | Falta `... on ProjectV2` | El fragmento es obligatorio tras `node(id:)` |
| Solo ves 100 items | Es el máximo por página | Pagina con `after: endCursor` |
| `-F` frente a `-f` | `-F` tipa el valor, `-f` lo manda como string | Para IDs y strings de GraphQL, `-F` funciona bien |
