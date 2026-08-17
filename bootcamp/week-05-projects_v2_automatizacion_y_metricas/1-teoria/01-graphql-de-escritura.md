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

## 6. Credenciales

Este es el punto donde se atasca todo el mundo al automatizar:

> [!IMPORTANT]
> **`GITHUB_TOKEN` no funciona con Projects v2.** El token que Actions inyecta
> tiene alcance sobre el repositorio, y los projects viven fuera de él (en el
> usuario o la organización). Necesitas un **PAT fine-grained** con permiso de
> Projects, o un token de **GitHub App**.

Para automatizar:

1. Crea un PAT fine-grained con `Projects: Read and write`
2. Guárdalo como secreto del repositorio (`PROJECT_TOKEN`)
3. Úsalo en el workflow en lugar de `GITHUB_TOKEN`

Un PAT tiene caducidad: apúntala. El día que el tablero deje de llenarse solo, la
causa será esa.

## 7. Límites y errores

| Error | Causa | Solución |
|-------|-------|----------|
| `INSUFFICIENT_SCOPES` | Falta `project` | `gh auth refresh -s project` |
| `Could not resolve to a node` | ID de otro tipo o mal copiado | Verifica el prefijo (`PVT_`, `PVTI_`, `I_`) |
| `Resource not accessible by integration` | `GITHUB_TOKEN` sobre un project | Usa un PAT o una App |
| `RATE_LIMITED` | Demasiadas mutaciones seguidas | El límite de GraphQL es por puntos: `gh api graphql --jq .data.rateLimit` |
| Campo que no cambia y sin error | `fieldId` de otro campo | Vuelve a listar los campos |

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| IDs a fuego en el script | Cambian si recreas el project | Resuélvelos al arrancar, o guárdalos como variables del repo |
| Usar `GITHUB_TOKEN` para projects | Falla siempre, con un error poco claro | PAT fine-grained o GitHub App |
| Un bucle de mutaciones sin control | Rate limit y tablero a medio actualizar | Agrupa y comprueba el resultado |
| Automatizar la prioridad | La prioridad es una decisión humana | Automatiza lo mecánico, no el criterio |
| No verificar tras mutar | Las mutaciones fallan en silencio si el ID es válido pero de otro objeto | Consulta el item después de escribir |

## 9. Trucos

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
