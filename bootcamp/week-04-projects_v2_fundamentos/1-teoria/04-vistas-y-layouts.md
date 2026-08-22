# Vistas y layouts

> Una vista no es una pestaña bonita: es una pregunta que alguien se hace todas
> las semanas, guardada.

## 🎯 Objetivos

- Elegir el layout adecuado para cada pregunta
- Combinar filtro, agrupación, ordenación y campos visibles
- Usar el panel de *slice* y las sumas por columna
- Diseñar el conjunto mínimo de vistas que necesita un equipo
- Compartir una vista sin que nadie tenga que reconfigurar nada

## 1. Qué problema resuelve

Cada persona mira el proyecto buscando algo distinto: quien desarrolla quiere "lo
mío", quien coordina quiere "qué está bloqueado", quien reporta quiere "qué sale
este trimestre". Sin vistas guardadas, cada uno refiltra a mano cada día — y cada
uno obtiene un número distinto.

## 2. Los tres layouts

| Layout | Muestra | Bueno para |
|--------|---------|------------|
| **Table** | Filas y columnas, editable como una hoja de cálculo | Edición masiva, revisar campos vacíos, backlog |
| **Board** | Tarjetas agrupadas en columnas por un campo | Flujo diario: qué está en curso |
| **Roadmap** | Barras en una línea temporal | Planificación: qué cae en qué fecha o iteración |

El **roadmap** necesita un campo de fecha o de iteración para tener eje temporal;
con dos campos de fecha (inicio y fin) dibuja barras de duración real, y admite
zoom por mes, trimestre o año.

La **tabla** es la que más se infrautiliza: es la única donde se ve de un vistazo
qué campos están vacíos, y donde se corrigen cincuenta items en dos minutos.

## 3. Las cuatro palancas

Toda vista se define con cuatro cosas:

| Palanca | Qué hace | Ejemplo |
|---------|----------|---------|
| **Filter** | Qué items entran | `is:open iteration:@current` |
| **Group by** | Cómo se parten en columnas o secciones | `Status`, `Assignees`, `Priority` |
| **Sort by** | Orden dentro de cada grupo | `Priority`, descendente |
| **Fields** | Qué columnas se ven | Ocultar lo que no se usa en esa vista |

En un **board**, `Group by` **define las columnas**. Cambiarlo reorganiza el
tablero entero sin mover ningún dato: las columnas no existen como tales
([Teoría 01](01-modelo-de-datos.md)).

Y dos ajustes menos conocidos que cambian mucho la lectura:

- **Suma por columna**: en el menú de una columna del board, mostrar la suma de
  un campo numérico. Una columna con nueve tarjetas y 40 puntos dice más que
  "nueve tarjetas"
- **Ordenación por un single select**: sigue el orden en que definiste las
  opciones, no el alfabético. Por eso el orden importa al crear el campo

## 4. Slicing

El panel lateral de *slice* parte la vista por un campo y deja saltar entre
valores sin tocar el filtro: eliges `Area` y aparece la lista de áreas con su
recuento; al pulsar una, la vista se filtra sola.

Es la forma rápida de revisar "¿cómo va cada área?" en una sola vista, en vez de
crear una vista por área. Regla práctica: **si ibas a duplicar una vista
cambiando solo un valor del filtro, lo que quieres es un slice**.

## 5. El conjunto mínimo de vistas

Cuatro vistas cubren el 90 % de los casos:

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

## 6. Compartir y mantener

- **La URL de una vista es la vista**: pégala en un issue, en el README o en el
  canal del equipo y todos ven exactamente lo mismo
- **Duplicar** (`···` → *Duplicate view*) crea una variante sin reconfigurar los
  campos visibles
- **Las vistas son del project**: lo que cambies lo ven todos. Si necesitas una
  vista personal para trastear, duplícala y nómbrala con tu nombre
- **Revisa las vistas cada trimestre**: la que nadie abre, se borra. Una vista
  muerta no es gratis — confunde sobre cuál es la buena

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Una vista por persona | Se multiplican y se abandonan | Una vista con `assignee:@me` |
| Una vista por valor de un campo | Diez vistas casi idénticas | Un slice |
| Vistas sin filtro | Muestran 300 items y no las usa nadie | Toda vista filtra algo |
| Board agrupado por nada | Una sola columna gigante | Siempre `Group by` |
| Mostrar los doce campos en todas las vistas | Ruido y scroll horizontal | Oculta lo que no aplica |
| Nombres tipo "Vista 3" | Nadie sabe para qué es | Nómbralas por la pregunta |
| Roadmap sin campo temporal | Sale vacío y parece roto | Fecha o iteración |
| Duplicar el project para "ver otra cosa" | Dos fuentes de verdad | Una vista más |

## 8. Trucos

- **Vista de retrospectiva sin trabajo**: `iteration:@previous` agrupada por
  `Status`
- **Encontrar el trabajo huérfano**: `is:open no:assignee no:iteration`
- **`Ctrl` + clic** en una tarjeta abre el issue en pestaña nueva sin perder el
  tablero
- **Atajo `c`** dentro de un project: crea un item nuevo sin tocar el ratón
- **Pegar desde una hoja de cálculo**: la vista de tabla acepta pegar una columna
  entera
- **Ocultar el campo `Repository`** en projects de un solo repositorio: ocupa
  sitio y no dice nada
- **Vista para el informe semanal**: `updated:>@today-7d` agrupada por `Status`
  es el resumen de la semana sin escribir nada

## 📚 Recursos Adicionales

- [GitHub Docs — Customizing a view](https://docs.github.com/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-a-view)
- [GitHub Docs — Changing the layout of a view](https://docs.github.com/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/changing-the-layout-of-a-view)
- [GitHub Docs — Slicing by field](https://docs.github.com/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/slicing-by-field)

## ✅ Checklist de Verificación

- [ ] Tienes cuatro vistas, cada una con nombre de pregunta
- [ ] Ninguna vista muestra todos los items sin filtrar
- [ ] Sabes qué hace `Group by` en un board
- [ ] Has usado el panel de slice al menos una vez
- [ ] Tu board muestra la suma de un campo numérico por columna
