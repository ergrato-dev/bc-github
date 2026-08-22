# Iteraciones

> Un campo de iteración es lo único de Projects que entiende el calendario. Bien
> configurado, tu vista de "sprint actual" no hay que tocarla nunca más.

## 🎯 Objetivos

- Configurar un campo de iteración con duración, inicio y descansos
- Usar los filtros relativos `@current`, `@previous` y `@next`
- Planificar con iteraciones sin convertirlas en un compromiso falso
- Decidir la cadencia y cuántas iteraciones generar de golpe
- Saber qué hacer con lo que no cabe en la iteración

## 1. Qué problema resuelve

Sin iteraciones, "este sprint" es una label que alguien renombra cada dos semanas
y una vista que hay que editar cada vez. Con un campo de iteración, el periodo
tiene **fechas reales**, y todo lo que se apoya en él —vistas, roadmap,
métricas— se actualiza solo al pasar el tiempo.

## 2. Cómo se configura

Un campo de tipo `Iteration` se crea desde la interfaz (`+` → *New field* →
*Iteration*) con tres decisiones:

| Decisión | Opciones | Recomendación |
|----------|----------|---------------|
| **Duración** | Días o semanas | 1 o 2 semanas; 4 solo si tu entrega es mensual |
| **Fecha de inicio** | Un día concreto | El día que de verdad empieza tu semana de trabajo |
| **Cuántas generar** | Las que quieras | Un trimestre (6 iteraciones de 2 semanas) |

GitHub crea `Iteration 1`, `Iteration 2`… y se pueden renombrar (`Sprint 24-01`,
`Ciclo de marzo`). Un nombre con la fecha dentro ahorra explicaciones en los
informes.

> [!TIP]
> Genera iteraciones para **un trimestre**, no para el año. Las fechas cambian y
> renombrar veinticuatro iteraciones es peor que crear seis cada trimestre.

## 3. Los filtros relativos

Es la razón entera de usar este tipo de campo:

| Filtro | Qué devuelve |
|--------|--------------|
| `iteration:@current` | La iteración que contiene la fecha de hoy |
| `iteration:@previous` | La anterior |
| `iteration:@next` | La siguiente |
| `no:iteration` | Backlog sin planificar |
| `iteration:"Sprint 24-03"` | Una concreta, por nombre |

Una vista filtrada por `iteration:@current` es tu sprint actual **para siempre**,
sin tocarla cada dos semanas. Y una con `iteration:@previous status:Hecho` es el
resumen del sprint pasado, sin trabajo extra el día de la retrospectiva.

## 4. Descansos (*breaks*)

Se puede insertar un periodo sin iteración: vacaciones, congelación de código,
semana de mantenimiento o de formación.

Qué cambia al declararlo, en vez de dejar una iteración vacía:

- El roadmap lo muestra como hueco, y se ve por qué no hay entregas
- `@current` durante un descanso no devuelve nada, en vez de devolver una
  iteración que nadie está trabajando
- La capacidad del periodo no se cuenta al mirar hacia atrás

## 5. Planificar con iteraciones

La iteración responde **cuándo**, no **cuánto**. Combinada con un campo de talla
o estimación ([Teoría 02](02-campos.md)) da la única señal fiable de
planificación: cuánto entró de verdad en las tres últimas iteraciones.

Tres reglas que evitan que se convierta en teatro:

1. **Lo que no cabe, se queda sin iteración.** Meter quince items en un sprint de
   cinco no acelera nada; solo borra la información
2. **Al acabar la iteración, lo no terminado vuelve al backlog o pasa a la
   siguiente, a propósito**, no por inercia
3. **La iteración no se estira.** Si la fecha llega y falta trabajo, es un dato
   sobre la estimación, no un problema del calendario

### Qué hacer con lo que se arrastra

Un item que lleva tres iteraciones saltando de una a otra no es un item: es un
síntoma. O está mal partido ([Semana 03, Teoría 05](../../week-03-issues_y_triage/1-teoria/05-sub-issues-y-descomposicion.md)),
o está bloqueado y nadie lo ha dicho, o no importa lo suficiente como para
hacerlo. Las tres respuestas son mejores que moverlo otra vez.

## 6. Iteraciones o milestones

Se parecen y no son lo mismo ([Semana 03, Teoría 04](../../week-03-issues_y_triage/1-teoria/04-milestones-y-tipos.md)):

| | Iteración | Milestone |
|---|---|---|
| Vive en | El project | El repositorio |
| Cadencia | Recurrente, automática | Una entrega concreta |
| Se repite | Sí, cada N semanas | No |
| Responde | ¿En qué sprint se trabaja? | ¿En qué versión sale? |

Un issue puede tener las dos: `Sprint 24-03` (cuándo se trabaja) y `v1.0` (dónde
se entrega). No compiten.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Sprint como label o campo de texto | Hay que editarlo a mano cada dos semanas | Campo de iteración |
| Filtrar la vista por el nombre del sprint | Caduca en dos semanas | `iteration:@current` |
| Iteraciones de un año generadas de golpe | Renombrarlas es un trabajo en sí | Un trimestre por tanda |
| Meter en la iteración todo el backlog | La iteración deja de significar nada | Solo lo que cabe |
| Estirar la iteración para que "quepa" | Pierdes la única medida de capacidad que tienes | Cierra y mide |
| Vacaciones como iteración vacía | `@current` devuelve algo que nadie trabaja | Declara un descanso |
| Arrastrar el mismo item cinco iteraciones | Esconde un problema real | Pártelo, desbloquéalo o ciérralo |

## 8. Trucos

- **Nombra las iteraciones con la fecha dentro**: `S24-03 (11-24 mar)` se entiende
  en cualquier informe sin abrir el project
- **La vista de retrospectiva**: `iteration:@previous` agrupada por `Status` —
  qué entró, qué salió, qué se quedó
- **Capacidad real**: en un board agrupado por iteración, muestra la **suma** del
  campo de estimación por columna
- **Encontrar lo no planificado**: `is:open no:iteration -status:Hecho`
- **Roadmap por iteración**: el layout de roadmap acepta el campo de iteración
  como eje temporal, sin necesidad de fechas por item
- **Un item en dos iteraciones no existe**: el campo guarda una sola; si el
  trabajo abarca dos, son dos items

## 📚 Recursos Adicionales

- [GitHub Docs — About iteration fields](https://docs.github.com/issues/planning-and-tracking-with-projects/understanding-fields/about-iteration-fields)
- [GitHub Docs — Filtering projects](https://docs.github.com/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects)
- [GitHub Docs — Roadmap layout](https://docs.github.com/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/changing-the-layout-of-a-view)

## ✅ Checklist de Verificación

- [ ] Tu campo de iteración cubre al menos un trimestre
- [ ] Tu vista de sprint usa `iteration:@current`, no un nombre fijo
- [ ] Sabes qué es un descanso y cuándo declararlo
- [ ] Distingues iteración de milestone
- [ ] Ningún item lleva tres iteraciones arrastrándose
