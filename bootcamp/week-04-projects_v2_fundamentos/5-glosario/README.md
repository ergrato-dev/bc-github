# Glosario — Semana 04

## B

**Board** (*board layout*) — Vista en columnas. Las columnas son los valores del
campo elegido en `Group by`; no son una estructura propia.

**Break** (*iteration break*) — Periodo sin iteración dentro de un campo de
iteración: vacaciones, congelación de código.

## C

**Campo** (*field*) — Dato asociado a cada item del project. Tipos: `Text`,
`Number`, `Date`, `Single select`, `Iteration`.

**Cursor** — Marcador de paginación en GraphQL. `pageInfo.endCursor` se pasa como
`after:` para pedir la siguiente página.

## D

**Draft** (*draft issue*) — Item que solo existe en el project: sin URL, sin
repositorio, no aparece en búsquedas. Se convierte en issue conservando los
valores de sus campos.

## F

**Fragmento** (*inline fragment*) — Sintaxis `... on Tipo { campos }` de GraphQL.
Necesaria cuando un campo puede devolver varios tipos, como los valores de campo
de un item.

## G

**Group by** — Palanca de una vista que parte los items en columnas o secciones.
Cambiarla no modifica ningún dato.

## I

**Item** — Una fila del project: un issue, un PR o un draft.

**Iteration** (*iteration field*) — Campo con periodos fechados. Admite los
filtros relativos `@current`, `@previous` y `@next`.

## P

**`PVT_`** — Prefijo del ID interno de un Project v2 en GraphQL. Distinto del
número que usa `gh project`.

**ProjectV2** — Tipo GraphQL del project. Obligatorio como fragmento tras
`node(id:)`.

## R

**Roadmap** (*roadmap layout*) — Vista en línea temporal. Necesita un campo de
fecha o de iteración configurado como *date field*.

## S

**Single select** — Campo de opción única con color y descripción. El orden de
sus opciones define el orden de las columnas del tablero.

**Slice** — Panel lateral que parte la vista por un campo y permite saltar entre
sus valores sin editar el filtro.

**`Status`** — Campo nativo de tipo single select, editable, por el que agrupa el
tablero por defecto.

## V

**Vista** (*view*) — Configuración guardada de filtro, agrupación, orden y campos
visibles. Hasta 50 por project.

## W

**Workflow integrado** (*built-in automation*) — Automatización nativa del
project ("cuando se cierra, pasa a Hecho"). No puede escribir en campos distintos
de `Status`.

---

> 📚 Glosario global del bootcamp: [docs/glosario-global.md](../../../docs/glosario-global.md)
