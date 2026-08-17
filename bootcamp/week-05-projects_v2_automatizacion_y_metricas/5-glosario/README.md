# Glosario — Semana 05

## C

**`contentId`** — ID GraphQL del issue o PR que se añade a un project. Empieza
por `I_` o `PR_`. Distinto del ID del **item**, que empieza por `PVTI_`.

**Cron** — Expresión de programación de un `schedule:`. En Actions va en **UTC**
y no es puntual: puede retrasarse.

**Cycle time** — Tiempo desde que se empieza a trabajar en un item hasta que se
entrega. Es la métrica que refleja al equipo.

## D

**DORA** — Cuatro métricas de entrega de software: frecuencia de despliegue,
lead time for changes, change failure rate y time to restore.

## G

**Goodhart (ley de)** — Cuando una métrica se convierte en objetivo, deja de ser
buena métrica. Es la razón de no evaluar personas con métricas de flujo.

## I

**Idempotente** — Operación que produce el mismo resultado se ejecute una o mil
veces. `addProjectV2ItemById` lo es: no duplica items.

**Insights** — Gráficos nativos de un project. Muestran cantidades, no tiempos.

## L

**Lead time** — Tiempo desde que se crea un item hasta que se cierra. Incluye la
espera en backlog.

**Little (ley de)** — `lead time ≈ WIP / throughput`. Bajar el WIP reduce el lead
time sin trabajar más rápido.

## M

**Mediana** — Valor central de una serie. Preferible a la media en métricas de
tiempo: un caso extremo no la distorsiona.

**Mutación** (*mutation*) — Operación GraphQL de escritura.

## P

**PAT fine-grained** — Token acotado. Para Projects necesita
`Projects: Read and write` en **Account permissions**, no en las de repositorio.

**Percentil 85** — El valor que supera al 85% de la serie. El "casi peor caso",
sin el dato absurdo del máximo.

## S

**`schedule:`** — Disparador de workflow por cron. Se **desactiva
automáticamente** tras 60 días sin actividad en el repositorio.

**Secret** vs **Variable** — Los secretos se ocultan en los logs; las variables
(`vars`) se leen. Los IDs de project van en variables, el token en secreto.

## T

**Throughput** — Cantidad de trabajo terminado por unidad de tiempo. Mide
capacidad de entrega, no esfuerzo.

## W

**WIP** (*work in progress*) — Items empezados y sin terminar. El número que más
rápido explica un lead time alto.

**`workflow_dispatch`** — Disparador manual de un workflow. Se pone junto a
`schedule` para poder probarlo sin esperar.

---

> 📚 Glosario global del bootcamp: [docs/glosario-global.md](../../../docs/glosario-global.md)
