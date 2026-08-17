# Práctica 03 — Iteraciones y roadmap

> Das al tablero un eje temporal: qué entra en este sprint, qué en el siguiente y
> cómo se ve todo en una línea de tiempo.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 02](../1-teoria/02-campos-e-iteraciones.md) y [03](../1-teoria/03-vistas-y-filtros.md), prácticas 01-02

## Contexto

Tu tablero sabe *qué* hay que hacer y *cuánto* importa. No sabe *cuándo*. El
campo de iteración es lo que convierte un backlog en un plan.

## Paso 1: Crear el campo de iteración

**Por qué**: es el único campo con semántica temporal relativa (`@current`), y
por eso las vistas de sprint no hay que tocarlas cada dos semanas.

> [!NOTE]
> El CLI no crea campos de tipo iteración (`--data-type` solo acepta `TEXT`,
> `SINGLE_SELECT`, `DATE` y `NUMBER`). Este paso va por la web.

`Project → ··· → Settings → + New field`:

| Ajuste | Valor |
|--------|-------|
| Name | `Iteration` |
| Type | Iteration |
| Duration | 2 semanas |
| Starts on | El próximo lunes |

Crea **6 iteraciones** (un trimestre). Renómbralas si tu equipo usa nombres:
`Sprint 1`, `Sprint 2`…

**Verifica**:

```bash
gh project field-list <numero> --owner @me --format json \
  --jq '.fields[] | select(.name == "Iteration") | {name, type: .type}'
```

## Paso 2: Añadir un descanso

**Por qué**: si no modelas las semanas sin sprint, la planificación miente.

En el mismo campo, `··· → Insert break` después de la tercera iteración. Ponle
una semana.

**Verifica**: en la configuración del campo aparece el hueco entre iteraciones.

## Paso 3: Asignar trabajo a las dos primeras iteraciones

**Por qué**: una iteración vacía no demuestra nada.

En la vista `Backlog`, asigna:

- 4-5 items a la iteración **actual**
- 3-4 items a la **siguiente**
- El resto sin iteración (eso es el backlog)

Se hace por lote: selecciona varias filas con `Shift` y asigna el valor.

**Verifica**:

```bash
gh project item-list <numero> --owner @me --format json \
  --jq '[.items[] | select(.iteration != null)] | length'
# >= 8
```

## Paso 4: La vista de sprint

**Por qué**: es la vista que el equipo mira todos los días.

| Palanca | Valor |
|---------|-------|
| Nombre | `Sprint actual` |
| Layout | Board |
| Filter | `iteration:@current` |
| Group by | `Status` |
| Sort by | `Priority` descendente |

**Verifica**: aparecen exactamente los items que asignaste a la iteración en
curso. Dentro de dos semanas, esta vista mostrará los del sprint siguiente sin
que la toques.

## Paso 5: La vista de roadmap

**Por qué**: es la que se enseña a alguien que no está en el día a día.

| Palanca | Valor |
|---------|-------|
| Nombre | `Roadmap` |
| Layout | Roadmap |
| Filter | `is:open` |
| Group by | `Area` |
| Date fields | `Iteration` (y `Target date` si lo usas) |
| Zoom | Month |

**Verifica**: cada item aparece como una barra sobre la línea temporal, agrupado
por área. Los items sin iteración ni fecha no aparecen: eso es señal, no fallo.

## Paso 6: Los filtros relativos

**Por qué**: son la razón de ser del campo de iteración.

Prueba en la barra de filtro de cualquier vista:

```
iteration:@current
iteration:@next
iteration:@previous
no:iteration
```

**Verifica**: `no:iteration` te da exactamente el backlog sin planificar. Ese
número es tu deuda de planificación.

## Paso 7: Vista de cierre de sprint

**Por qué**: al terminar el sprint necesitas contar qué se hizo, sin recopilar a
mano.

| Palanca | Valor |
|---------|-------|
| Nombre | `Sprint anterior — cerrado` |
| Layout | Table |
| Filter | `iteration:@previous status:Hecho` |
| Fields | Title, Assignees, Size, Area |

**Verifica**: hoy puede salir vacía (aún no ha pasado ninguna iteración). Es
correcto: la vista está lista para cuando toque.

## ✅ Resultado

- [ ] Campo `Iteration` con 6 iteraciones de 2 semanas
- [ ] Un descanso insertado
- [ ] 8+ items repartidos entre la iteración actual y la siguiente
- [ ] Vista `Sprint actual` con `iteration:@current`
- [ ] Vista `Roadmap` mostrando barras temporales
- [ ] Vista de cierre con `iteration:@previous`

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| No existe el tipo Iteration | Lo buscas en el CLI | Se crea desde la web |
| `iteration:@current` sale vacío | Hoy no cae dentro de ninguna iteración | Ajusta la fecha de inicio |
| El roadmap sale vacío | Falta un campo de fecha o iteración configurado | `···` → *Date fields* |
| Las barras son de un día | Está usando solo `Target date` | Añade `Iteration` como campo de fecha |
| Renombraste iteraciones y los filtros fallan | Escribiste el nombre en el filtro | Usa `@current`, no el nombre |
