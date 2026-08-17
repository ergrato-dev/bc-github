# Práctica 01 — Mutaciones GraphQL

> Escribes en tu project desde la terminal: añades un item y le pones prioridad,
> sin tocar el ratón.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-graphql-de-escritura.md), project de la Semana 04

## Contexto

Todo lo que automatices en las prácticas siguientes son estas dos mutaciones
dentro de un workflow. Primero hay que saber ejecutarlas a mano.

## Paso 1: Scope de escritura

**Por qué**: `read:project` deja leer; para escribir hace falta `project`.

```bash
gh auth refresh -s project
gh auth status | grep -i "token scopes"
```

**Verifica**: aparece `project` (sin el prefijo `read:`).

## Paso 2: Reunir los IDs

**Por qué**: ninguna mutación acepta nombres.

```bash
OWNER=<tu-usuario>
REPO=<tu-repo>
PROJ_NUM=<numero-del-project>

PROJ_ID=$(gh project view "$PROJ_NUM" --owner "$OWNER" --format json --jq '.id')
echo "project: $PROJ_ID"

gh project field-list "$PROJ_NUM" --owner "$OWNER" --format json \
  --jq '.fields[] | select(.name == "Priority") | {id, opciones: (.options | map({name, id}))}'
```

Guarda:

```bash
FIELD_ID=<PVTSSF_...>
OPTION_ALTA=<id-de-la-opcion-alta>
```

**Verifica**: `$PROJ_ID` empieza por `PVT_` y `$FIELD_ID` por `PVTSSF_`.

## Paso 3: Crear un issue de prueba y obtener su ID

**Por qué**: el `contentId` de una mutación es el ID GraphQL del issue, no su
número.

```bash
gh issue create --title "Prueba de mutación GraphQL" \
  --body "Issue temporal para la práctica 01 de la Semana 05." \
  --label "type:chore"

NUM=$(gh issue list --search "Prueba de mutación" --json number --jq '.[0].number')

ISSUE_ID=$(gh api graphql -F owner="$OWNER" -F repo="$REPO" -F num="$NUM" -f query='
  query($owner: String!, $repo: String!, $num: Int!) {
    repository(owner: $owner, name: $repo) { issue(number: $num) { id } }
  }' --jq '.data.repository.issue.id')

echo "issue: $ISSUE_ID"
```

**Verifica**: `$ISSUE_ID` empieza por `I_`.

## Paso 4: Añadir el item al project

**Por qué**: es la mutación que usará el workflow de la práctica 02.

```bash
ITEM_ID=$(gh api graphql -F project="$PROJ_ID" -F content="$ISSUE_ID" -f query='
  mutation($project: ID!, $content: ID!) {
    addProjectV2ItemById(input: { projectId: $project, contentId: $content }) {
      item { id }
    }
  }' --jq '.data.addProjectV2ItemById.item.id')

echo "item: $ITEM_ID"
```

**Verifica**: `$ITEM_ID` empieza por `PVTI_`, y el issue aparece en el tablero.

## Paso 5: Comprobar la idempotencia

**Por qué**: es lo que permite ejecutar la automatización sin miedo a duplicar.

```bash
gh api graphql -F project="$PROJ_ID" -F content="$ISSUE_ID" -f query='
  mutation($project: ID!, $content: ID!) {
    addProjectV2ItemById(input: { projectId: $project, contentId: $content }) {
      item { id }
    }
  }' --jq '.data.addProjectV2ItemById.item.id'
```

**Verifica**: devuelve **el mismo** `PVTI_`. No se ha creado un duplicado.

## Paso 6: Escribir el campo `Priority`

**Por qué**: es lo que los workflows integrados no pueden hacer.

```bash
gh api graphql -F project="$PROJ_ID" -F item="$ITEM_ID" \
  -F field="$FIELD_ID" -F option="$OPTION_ALTA" -f query='
  mutation($project: ID!, $item: ID!, $field: ID!, $option: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $project
      itemId: $item
      fieldId: $field
      value: { singleSelectOptionId: $option }
    }) { projectV2Item { id } }
  }'
```

**Verifica** — nunca des por buena una mutación sin comprobarla:

```bash
gh project item-list "$PROJ_NUM" --owner "$OWNER" --format json \
  --jq ".items[] | select(.content.number == $NUM) | {title: .content.title, priority}"
```

Debe mostrar la prioridad alta.

## Paso 7: Guardar el script

**Por qué**: en la práctica 02 este mismo código va dentro de un workflow.

```bash
cat > scripts/project-add-item.sh <<'EOF'
#!/usr/bin/env bash
# Añade un issue al project y le pone una prioridad.
# Uso: scripts/project-add-item.sh <owner> <repo> <numero-issue> <project-id> <field-id> <option-id>
set -euo pipefail

OWNER=$1; REPO=$2; NUM=$3; PROJ_ID=$4; FIELD_ID=$5; OPTION_ID=$6

ISSUE_ID=$(gh api graphql -F owner="$OWNER" -F repo="$REPO" -F num="$NUM" -f query='
  query($owner: String!, $repo: String!, $num: Int!) {
    repository(owner: $owner, name: $repo) { issue(number: $num) { id } }
  }' --jq '.data.repository.issue.id')

ITEM_ID=$(gh api graphql -F project="$PROJ_ID" -F content="$ISSUE_ID" -f query='
  mutation($project: ID!, $content: ID!) {
    addProjectV2ItemById(input: { projectId: $project, contentId: $content }) { item { id } }
  }' --jq '.data.addProjectV2ItemById.item.id')

gh api graphql -F project="$PROJ_ID" -F item="$ITEM_ID" \
  -F field="$FIELD_ID" -F option="$OPTION_ID" -f query='
  mutation($project: ID!, $item: ID!, $field: ID!, $option: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $project, itemId: $item, fieldId: $field,
      value: { singleSelectOptionId: $option }
    }) { projectV2Item { id } }
  }' > /dev/null

echo "item $ITEM_ID actualizado"
EOF

chmod +x scripts/project-add-item.sh
bash -n scripts/project-add-item.sh && echo "sintaxis OK"
git add scripts/project-add-item.sh
git commit -qm "feat: script para añadir issues al project con prioridad"
git push -q
```

**Verifica**: `bash -n` no da errores y el script está commiteado.

## Paso 8: Limpiar

```bash
gh issue close "$NUM" --reason "not planned" --comment "Issue de prueba de la práctica."
```

## ✅ Resultado

- [ ] Scope `project` concedido
- [ ] Has obtenido los IDs de project, campo y opción
- [ ] `addProjectV2ItemById` ejecutada y comprobada como idempotente
- [ ] `updateProjectV2ItemFieldValue` ejecutada y **verificada** con una consulta
- [ ] `scripts/project-add-item.sh` commiteado

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `INSUFFICIENT_SCOPES` | Solo tienes `read:project` | `gh auth refresh -s project` |
| `Could not resolve to a node` | ID mal copiado o de otro tipo | Comprueba el prefijo: `PVT_`, `PVTI_`, `I_`, `PVTSSF_` |
| El campo no cambia y no hay error | `fieldId` u `option` de otro campo | Vuelve a listar los campos y copia los IDs de nuevo |
| `Variable $num of type Int!` | `-f` manda string | Usa `-F` para enteros |
| El project es de una organización | La consulta usa `user(login:)` | Cambia a `organization(login:)` |
