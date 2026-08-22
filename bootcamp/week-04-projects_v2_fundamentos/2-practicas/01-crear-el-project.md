# Práctica 01 — Crear el project

> Creas el tablero, sus campos y metes dentro todo el backlog que construiste la
> semana pasada.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-modelo-de-datos.md) y [02](../1-teoria/02-campos.md), backlog de la Semana 03

## Contexto

Tienes doce issues etiquetados y un milestone. Ahora mismo, para saber qué estás
haciendo hay que leerlos todos. Vamos a darles estructura.

## Paso 1: Conceder el scope

**Por qué**: `gh project` y todas las consultas GraphQL de Projects fallan sin
él. Es el primer tropiezo de todo el mundo.

```bash
gh auth refresh -s project
gh auth status
```

**Verifica**: en la lista de scopes aparece `project`.

## Paso 2: Crear el project

**Por qué**: un project por producto, no por sprint ni por vista.

```bash
gh project create --owner @me --title "Gestión de <tu dominio>"
gh project list --owner @me
```

Anota el **número** (no el ID): lo usarás en todos los comandos.

```bash
PROJ=<numero>
```

**Verifica**:

```bash
gh project view $PROJ --owner @me
```

## Paso 3: Vincularlo al repositorio

**Por qué**: así aparece en la pestaña *Projects* del repo y el auto-add lo tiene
fácil.

```bash
gh project link $PROJ --owner @me --repo <tu-usuario>/<tu-repo>
```

**Verifica**:

```bash
gh api graphql -F owner='<tu-usuario>' -F repo='<tu-repo>' -f query='
  query($owner:String!, $repo:String!) {
    repository(owner:$owner, name:$repo) {
      projectsV2(first:5) { nodes { number title } }
    }
  }' --jq '.data.repository.projectsV2.nodes[]'
```

## Paso 4: Crear los campos

**Por qué**: cuatro o cinco campos, no veinte. Cada uno responde una pregunta.

```bash
gh project field-create $PROJ --owner @me --name "Priority" \
  --data-type SINGLE_SELECT --single-select-options "🔴 Alta,🟠 Media,🟡 Baja"

gh project field-create $PROJ --owner @me --name "Size" \
  --data-type SINGLE_SELECT --single-select-options "XS,S,M,L,XL"

# Adapta las áreas a TU dominio
gh project field-create $PROJ --owner @me --name "Area" \
  --data-type SINGLE_SELECT --single-select-options "prestamos,socios,catalogo"

gh project field-create $PROJ --owner @me --name "Target date" --data-type DATE
```

**Verifica**:

```bash
gh project field-list $PROJ --owner @me
```

Deben aparecer los tuyos y los nativos (`Title`, `Assignees`, `Status`,
`Labels`, `Repository`, `Milestone`…).

> [!NOTE]
> `gh project field-create` **no** soporta el tipo iteración: los tipos válidos
> son `TEXT`, `SINGLE_SELECT`, `DATE` y `NUMBER`. El campo de iteración se crea
> desde la interfaz web — lo harás en la práctica 03.

## Paso 5: Ajustar el campo `Status`

**Por qué**: los tres valores por defecto no describen tu flujo real, y son las
columnas de tu tablero.

En la web: `Project → ··· → Settings → Status` y define:

`Backlog`, `Listo`, `En curso`, `En revisión`, `Hecho`

Añade descripción a cada uno: qué tiene que ser cierto para que un item esté ahí.

**Verifica**:

```bash
gh project field-list $PROJ --owner @me --format json \
  --jq '.fields[] | select(.name == "Status") | .options[].name'
```

## Paso 6: Meter el backlog

**Por qué**: el auto-add de la práctica 04 solo actúa sobre items **nuevos**. Lo
que ya existe se añade a mano, una vez.

```bash
gh issue list --state all --limit 100 --json url --jq '.[].url' \
  | while read -r url; do gh project item-add $PROJ --owner @me --url "$url"; done
```

**Verifica**:

```bash
gh project item-list $PROJ --owner @me --format json --jq '.items | length'
# >= 12
```

## Paso 7: Rellenar los campos

**Por qué**: campos vacíos hacen que las vistas de la práctica 02 no filtren
nada.

Abre la vista de tabla en la web y rellena `Priority`, `Size` y `Area` en todos
los items. Se edita como una hoja de cálculo: selecciona varias filas con
`Shift` y asigna un valor a todas.

**Verifica**:

```bash
gh project item-list $PROJ --owner @me --format json \
  --jq '[.items[] | select(.priority == null)] | length'
# 0
```

## ✅ Resultado

- [ ] Project creado, con título descriptivo
- [ ] Vinculado al repositorio
- [ ] Cuatro campos personalizados creados
- [ ] `Status` con los cinco estados de tu flujo, descritos
- [ ] 12+ items dentro
- [ ] Ningún item con `Priority` vacía

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `INSUFFICIENT_SCOPES` | Falta el scope `project` | `gh auth refresh -s project` |
| `gh project` no encuentra el project | Estás usando el ID en vez del número | `gh project list --owner @me` |
| `field-create` rechaza `ITERATION` | No es un tipo soportado por el CLI | Créalo desde la web (práctica 03) |
| Los items no se añaden | La URL no es de issue ni de PR | Usa la URL completa `https://github.com/...` |
| El bucle añade duplicados | Se ejecutó dos veces | Los duplicados se borran con `item-delete` |
| No ves el project en el repo | Falta `gh project link` | Ejecútalo |
