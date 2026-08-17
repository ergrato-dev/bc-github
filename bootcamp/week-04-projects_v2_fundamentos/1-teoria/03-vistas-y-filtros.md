# Vistas y filtros

> Una vista no es una pestaña bonita: es una pregunta que el equipo se hace
> todas las semanas, guardada.

## 🎯 Objetivos

- Elegir el layout adecuado para cada pregunta
- Combinar filtro, agrupación, ordenación y campos visibles
- Escribir filtros con la sintaxis de Projects
- Diseñar el conjunto mínimo de vistas que necesita un equipo

## 1. Qué problema resuelve

Cada persona mira el proyecto buscando algo distinto: quien desarrolla quiere
"lo mío", quien coordina quiere "qué está bloqueado", quien reporta quiere "qué
sale este trimestre". Sin vistas guardadas, cada uno refiltra a mano cada día.

## 2. Los tres layouts

| Layout | Muestra | Bueno para |
|--------|---------|------------|
| **Table** | Filas y columnas, editable como una hoja de cálculo | Edición masiva, revisar campos vacíos, backlog |
| **Board** | Tarjetas agrupadas en columnas por un campo | Flujo diario: qué está en curso |
| **Roadmap** | Barras en una línea temporal | Planificación: qué cae en qué fecha o iteración |

El **roadmap** necesita al menos un campo de fecha o de iteración: sin eso no
tiene eje temporal.

## 3. Las cuatro palancas de una vista

Toda vista se define con cuatro cosas:

| Palanca | Qué hace | Ejemplo |
|---------|----------|---------|
| **Filter** | Qué items entran | `is:open iteration:@current` |
| **Group by** | Cómo se parten en columnas o secciones | `Status`, `Assignees`, `Priority` |
| **Sort by** | Orden dentro de cada grupo | `Priority` descendente |
| **Fields** | Qué columnas se ven | Ocultar lo que no se usa en esa vista |

En un **board**, `Group by` **define las columnas**. Cambiarlo reorganiza el
tablero entero sin mover ningún dato.

## 4. Sintaxis de filtros

Parecida a la de Issues, con lo propio de los campos del project:

| Filtro | Qué hace |
|--------|----------|
| `is:issue` / `is:pr` / `is:open` / `is:closed` | Tipo y estado |
| `status:"En curso"` | Valor de un campo (comillas si lleva espacios) |
| `priority:Alta,Media` | Varios valores del mismo campo (OR) |
| `-status:Hecho` | Negación |
| `no:assignee`, `no:iteration` | Campo vacío |
| `assignee:@me` | Lo tuyo |
| `iteration:@current` | Iteración actual (también `@previous`, `@next`) |
| `label:"type:bug"` | Labels del issue |
| `repo:owner/nombre` | Un repositorio, en projects multi-repo |
| `updated:<2026-06-01` | Por fecha |

Se combinan con espacios (AND):

```
is:open iteration:@current -status:Hecho no:assignee
```

= lo que hay que repartir en este sprint.

## 5. El conjunto mínimo de vistas

Cuatro vistas cubren el 90% de los casos:

| Vista | Layout | Filtro | Group by |
|-------|--------|--------|----------|
| **Backlog** | Table | `is:open no:iteration` | `Priority` |
| **Sprint actual** | Board | `iteration:@current` | `Status` |
| **Roadmap** | Roadmap | `is:open` | `Area` |
| **Mi trabajo** | Board | `assignee:@me is:open` | `Status` |

Añade una quinta solo cuando alguien pregunte algo que ninguna responde. Un
project con quince vistas es un project donde nadie encuentra la suya.

> [!TIP]
> Nombra las vistas por la **pregunta** que responden, no por su configuración.
> "Sprint actual" se entiende; "Board 2" no.

## 6. Slicing

El panel lateral de *slice* parte la vista por un campo y te deja saltar entre
valores sin tocar el filtro: eliges `Area` y aparece una lista con cada área y su
recuento; al pulsar una, la vista se filtra sola.

Es la forma rápida de revisar "¿cómo va cada área?" en una sola vista, en vez de
crear una vista por área.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Una vista por persona | Se multiplican y se abandonan | Una vista con `assignee:@me` |
| Vistas sin filtro | Muestran 300 items y no se usan | Toda vista filtra algo |
| Filtrar por sprint escribiendo el nombre | Hay que editarla cada dos semanas | `iteration:@current` |
| Board agrupado por nada | Una sola columna gigante | Siempre `Group by` |
| Mostrar los 12 campos en todas las vistas | Ruido y scroll horizontal | Oculta lo que no aplica |
| Nombres tipo "Vista 3" | Nadie sabe para qué es | Nómbralas por la pregunta |

## 8. Trucos

- **Duplicar una vista** (`···` → *Duplicate view*) es la forma rápida de crear
  una variante sin reconfigurar los campos visibles
- **`@current` también sirve para reportar**: una vista `iteration:@previous`
  con `status:Hecho` es tu resumen de sprint, sin trabajo extra
- **Encontrar el trabajo huérfano**: `is:open no:assignee no:iteration` — todo
  proyecto tiene más del que cree
- **Ordenar por prioridad respeta el orden de las opciones**, no el alfabético:
  por eso el orden en que defines el single select importa
- **La URL de una vista es compartible**: pégala en un issue y todos ven lo mismo
- **Editar en masa desde la tabla**: selecciona varias filas con `Shift` y
  asigna un valor a todas
- **`Ctrl` + clic en una tarjeta** abre el issue en pestaña nueva sin perder el
  tablero

## 📚 Recursos Adicionales

- [GitHub Docs — Customizing a view](https://docs.github.com/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-a-view)
- [GitHub Docs — Filtering projects](https://docs.github.com/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects)
- [GitHub Docs — Roadmap layout](https://docs.github.com/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/changing-the-layout-of-a-view#roadmap-layout)

## ✅ Checklist de Verificación

- [ ] Tienes cuatro vistas, cada una con nombre de pregunta
- [ ] Ninguna vista muestra todos los items sin filtrar
- [ ] Tu vista de sprint usa `iteration:@current`, no un nombre fijo
- [ ] Sabes qué hace `Group by` en un board
