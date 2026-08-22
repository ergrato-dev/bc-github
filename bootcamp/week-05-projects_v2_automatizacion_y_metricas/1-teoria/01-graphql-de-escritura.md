# GraphQL de escritura

> Leer un project es fácil. Escribir en él exige conocer tres IDs distintos y
> saber que una mutación mal hecha no da error: hace algo que no querías.

## 🎯 Objetivos

- Ejecutar las mutaciones básicas de Projects v2
- Localizar los tres IDs que hacen falta: project, campo y opción
- Entender qué mutaciones son idempotentes y cuáles no
- Manejar errores y límites de la API

## 1. Qué problema resuelve

Todo lo que se puede hacer con el ratón en un project se puede hacer por API. Y
solo lo que se puede hacer por API se puede automatizar. Si quieres que un issue
etiquetado como `prio:alta` entre en el tablero con la prioridad ya puesta,
necesitas mutaciones.

## 2. Los tres IDs

Ninguna mutación acepta nombres: todo va por ID interno.

| ID | Aspecto | De dónde sale |
|----|---------|---------------|
| Project | `PVT_kwHOA...` | `projectsV2 { id }` |
| Campo | `PVTSSF_lADO...` | `fields { ... on ProjectV2FieldCommon { id } }` |
| Opción de single select | `47fc9ee4` | `options { id name }` |
| Item dentro del project | `PVTI_lADO...` | `items { id }` |
| Contenido (issue/PR) | `I_kwDO...` | `repository { issue { id } }` |

Ojo con la distinción más confusa: el **item** es la fila del project; el
**issue** es el contenido. Son objetos distintos con IDs distintos.

```bash
gh project view <n> --owner @me --format json --jq '{id, number, title}'
gh project field-list <n> --owner @me --format json \
  --jq '.fields[] | {name, id, opciones: (.options // [] | map({name, id}))}'
```

## 3. Añadir un item

```graphql
mutation($project: ID!, $content: ID!) {
  addProjectV2ItemById(input: { projectId: $project, contentId: $content }) {
    item { id }
  }
}
```

```bash
gh api graphql -F project="$PROJ_ID" -F content="$ISSUE_ID" -f query='...'
```

**Es idempotente**: si el issue ya estaba en el project, devuelve el item
existente en vez de duplicarlo. Puedes ejecutarla mil veces sin ensuciar nada.

Para obtener el `contentId` de un issue:

```bash
gh api graphql -F owner=OWNER -F repo=REPO -F num=12 -f query='
  query($owner:String!, $repo:String!, $num:Int!) {
    repository(owner:$owner, name:$repo) { issue(number:$num) { id } }
  }' --jq '.data.repository.issue.id'
```

## 4. Escribir un campo

```graphql
mutation($project: ID!, $item: ID!, $field: ID!, $option: String!) {
  updateProjectV2ItemFieldValue(input: {
    projectId: $project
    itemId: $item
    fieldId: $field
    value: { singleSelectOptionId: $option }
  }) { projectV2Item { id } }
}
```

El `value` cambia según el tipo del campo:

| Tipo de campo | `value` |
|---------------|---------|
| Text | `{ text: "..." }` |
| Number | `{ number: 3 }` |
| Date | `{ date: "2026-12-31" }` |
| Single select | `{ singleSelectOptionId: "47fc9ee4" }` |
| Iteration | `{ iterationId: "..." }` |

> [!WARNING]
> Si mandas el `value` que no corresponde al tipo del campo, la API responde con
> error — eso es lo bueno. Lo peligroso es mandar un `singleSelectOptionId` de
> **otro campo**: es un ID válido y la mutación puede aceptarlo dejando el campo
> en un estado incoherente. Verifica siempre de qué campo sacaste la opción.

## 5. Otras mutaciones útiles

| Mutación | Para qué |
|----------|----------|
| `addProjectV2DraftIssue` | Crear una nota sin issue asociado |
| `deleteProjectV2Item` | Sacar un item del project (no borra el issue) |
| `archiveProjectV2Item` | Archivarlo |
| `updateProjectV2` | Cambiar título, descripción o visibilidad |
| `convertProjectV2DraftIssueItemToIssue` | Convertir un draft en issue real |

## 6. Escribir varios items de una vez

GraphQL permite **alias**: varias mutaciones en una sola petición, cada una con
su nombre. Es la forma correcta de actualizar diez items sin hacer diez llamadas.

```graphql
mutation($project: ID!, $field: ID!, $option: String!,
         $i1: ID!, $i2: ID!) {
  a: updateProjectV2ItemFieldValue(input: {
        projectId: $project, itemId: $i1, fieldId: $field,
        value: { singleSelectOptionId: $option } }) { projectV2Item { id } }
  b: updateProjectV2ItemFieldValue(input: {
        projectId: $project, itemId: $i2, fieldId: $field,
        value: { singleSelectOptionId: $option } }) { projectV2Item { id } }
}
```

Dos avisos: la respuesta trae un bloque por alias, así que hay que comprobarlos
todos; y **no hay transacción** — si la tercera falla, las dos primeras ya se
aplicaron.

Para vaciar un campo no sirve mandar `null`: hay una mutación propia,
`clearProjectV2ItemFieldValue`.

## 7. Verificar después de escribir

Una mutación con IDs válidos pero equivocados **no da error**. La única defensa
es leer lo que acabas de escribir:

```bash
gh api graphql -F item="$ITEM_ID" -f query='
  query($item: ID!) {
    node(id: $item) {
      ... on ProjectV2Item {
        fieldValues(first: 20) {
          nodes {
            ... on ProjectV2ItemFieldSingleSelectValue {
              name field { ... on ProjectV2SingleSelectField { name } }
            }
          }
        }
      }
    }
  }'
```

En un script, esa comprobación es la diferencia entre "el tablero está mal desde
hace tres semanas" y "el workflow falló el martes".

## 8. La credencial

Aquí es donde se atasca todo el mundo: **`GITHUB_TOKEN` no puede escribir en un
Project v2**, porque el project no pertenece al repositorio. Hace falta un PAT
fine-grained con `Projects: Read and write` o un token de GitHub App. Está
entero, con el diagnóstico de cada error, en la
[Teoría 02](02-credenciales-para-projects.md).

## 9. Límites y errores

| Error | Causa | Solución |
|-------|-------|----------|
| `INSUFFICIENT_SCOPES` | Falta `project` | `gh auth refresh -s project` |
| `Could not resolve to a node` | ID de otro tipo o mal copiado | Verifica el prefijo (`PVT_`, `PVTI_`, `I_`) |
| `Resource not accessible by integration` | `GITHUB_TOKEN` sobre un project | Usa un PAT o una App |
| `RATE_LIMITED` | Demasiadas mutaciones seguidas | El límite de GraphQL es por puntos: `gh api graphql --jq .data.rateLimit` |
| Campo que no cambia y sin error | `fieldId` de otro campo | Vuelve a listar los campos |

## 10. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| IDs a fuego en el script | Cambian si recreas el project | Resuélvelos al arrancar, o guárdalos como variables del repo |
| Usar `GITHUB_TOKEN` para projects | Falla siempre, con un error poco claro | PAT fine-grained o GitHub App |
| Un bucle de mutaciones sin control | Rate limit y tablero a medio actualizar | Agrupa y comprueba el resultado |
| Automatizar la prioridad | La prioridad es una decisión humana | Automatiza lo mecánico, no el criterio |
| No verificar tras mutar | Las mutaciones fallan en silencio si el ID es válido pero de otro objeto | Consulta el item después de escribir |

## 11. Trucos

- **Explorador con autocompletado**: el [GraphQL Explorer](https://docs.github.com/graphql/overview/explorer)
  usa tu sesión y descubre campos sin adivinar
- **Guarda los IDs como variables del repo**, no como secretos: no son sensibles
  y se leen desde el workflow con `${{ vars.PROJECT_ID }}`
- **Consulta el rate limit de GraphQL**, que se cuenta en puntos, no en llamadas:
  ```bash
  gh api graphql -f query='{ rateLimit { limit cost remaining resetAt } }'
  ```
- **`-F` frente a `-f`**: `-F` interpreta el valor (números, booleanos,
  variables), `-f` lo manda como string. Para IDs, ambos valen; para `Int!`,
  necesitas `-F`
- **Prueba con un item de mentira** antes de lanzar un bucle sobre cincuenta

## 📚 Recursos Adicionales

- [GitHub Docs — Using the API to manage Projects](https://docs.github.com/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)
- [GraphQL API — Mutations](https://docs.github.com/graphql/reference/mutations)
- [GraphQL API — Rate limits](https://docs.github.com/graphql/overview/resource-limitations)

## ✅ Checklist de Verificación

- [ ] Sabes obtener los IDs de project, campo y opción
- [ ] Has ejecutado `addProjectV2ItemById` y `updateProjectV2ItemFieldValue`
- [ ] Puedes explicar por qué `GITHUB_TOKEN` no sirve aquí
- [ ] Verificas el resultado después de cada mutación
- [ ] Sabes escribir varios items en una sola petición con alias
- [ ] Sabes cómo se vacía un campo (no es mandando `null`)
