# Métricas de flujo

> Medir es fácil; medir lo que importa, no. La mitad de los paneles que verás
> miden productividad aparente y empeoran al equipo que miden.

## 🎯 Objetivos

- Definir lead time, cycle time, throughput, WIP y eficiencia de flujo
- Relacionarlas entre sí con la ley de Little y saber qué palanca tocar
- Situarlas frente a las cuatro métricas DORA
- Reconocer las métricas que hacen daño y por qué
- Fijar umbrales que disparen una acción, no una conversación

## 1. Qué problema resuelve

"¿Vamos bien?" no se responde con una sensación. Cuatro números bastan para saber
si el trabajo fluye o se atasca, y para detectar el atasco **antes** de la fecha
de entrega, que es cuando todavía se puede hacer algo.

## 2. Las cuatro métricas

| Métrica | Qué mide | En una frase |
|---------|----------|--------------|
| **Lead time** | Desde que se pide hasta que se entrega | Lo que percibe quien lo pidió |
| **Cycle time** | Desde que se empieza hasta que se entrega | Lo que controla el equipo |
| **Throughput** | Cuánto se termina por unidad de tiempo | La capacidad real, medida |
| **WIP** | Cuánto hay empezado a la vez | La causa de casi todos los retrasos |

La diferencia entre lead time y cycle time es **el tiempo en backlog**. Un lead
time enorme con cycle time pequeño no significa que el equipo sea lento:
significa que las cosas esperan mucho antes de empezarse. Son dos problemas
distintos y se arreglan de forma distinta — el primero priorizando, el segundo
mejorando el proceso.

![Lead time, cycle time y WIP sobre la vida de un item](../0-assets/01-metricas-de-flujo.svg)

### Definir "empieza" y "termina"

Sin esto, cualquier número es discutible. Elige y escríbelo:

| Momento | Definición operativa razonable |
|---------|-------------------------------|
| **Se pide** | Se crea el issue (`createdAt`) |
| **Se empieza** | El item pasa a `En curso`, o aparece el primer commit de su rama |
| **Se termina** | El issue se cierra como *completed*, o el PR se mergea |

Lo importante no es cuál elijas, sino que no cambie entre una medición y la
siguiente.

## 3. La ley de Little

```
Lead time medio ≈ WIP / Throughput
```

De ahí sale la consecuencia más contraintuitiva de la gestión del trabajo: **para
entregar antes, empieza menos cosas a la vez**. Bajar el WIP reduce el lead time
sin trabajar más rápido y sin contratar a nadie.

Es también el único argumento que funciona contra "empiézalo ya, aunque no puedas
terminarlo": cada cosa empezada aumenta el WIP y, por tanto, el tiempo de espera
de todo lo demás.

### Eficiencia de flujo

```
Eficiencia = tiempo trabajando / tiempo total del ciclo
```

En la mayoría de equipos está por debajo del 25 %: casi todo el ciclo es espera
—esperando revisión, esperando despliegue, esperando una decisión—. Ese dato
cambia el foco: no hay que trabajar más rápido, hay que **esperar menos**, y las
esperas se ven en las transiciones, no en el trabajo.

### Aging WIP: la métrica que más se olvida

La edad de lo que está **abierto ahora mismo**, no la de lo que ya se cerró. Las
otras métricas miran al pasado; el *aging* es la única que te deja intervenir
sobre un item concreto hoy, cuando todavía se puede desbloquear.

Regla práctica: si un item lleva más del percentil 85 de tu cycle time histórico
en curso, es un problema, no una tarea.

## 4. Relación con DORA

Las cuatro métricas DORA miden **entrega de software**, no gestión de tareas:

| Métrica DORA | Qué es | Se saca de |
|--------------|--------|------------|
| **Frecuencia de despliegue** | Cada cuánto llega algo a producción | Releases o deployments (Semanas 11-12) |
| **Lead time for changes** | De commit a producción | Commit → deployment |
| **Change failure rate** | Qué porcentaje de despliegues rompe algo | Releases con hotfix posterior |
| **Time to restore** | Cuánto se tarda en recuperarse | Incidente → despliegue de arreglo |

Sin CI/CD aún no puedes medir las cuatro; con lo de esta semana tienes las dos
primeras en versión aproximada. Se completan en la Semana 12.

Y un matiz que se pierde a menudo: DORA mide el **sistema de entrega**, no a las
personas. Las cuatro mejoran juntas cuando el sistema mejora, y ninguna se
optimiza aisladamente sin empeorar otra.

## 5. Métricas que hacen daño

| Métrica | Por qué hace daño |
|---------|-------------------|
| Commits por persona | Se optimiza troceando commits. Mide ruido |
| Líneas de código | Premia el código largo. Lo contrario de lo que quieres |
| Issues cerrados por persona | Incentiva coger lo fácil y evitar lo difícil |
| Velocity comparada entre equipos | Los puntos no son comparables; se inflan y ya |
| Horas dedicadas | Mide presencia, no resultado |
| Porcentaje de cobertura como objetivo | Se llega con tests que no comprueban nada |

Regla: **mide el flujo del trabajo, no el rendimiento de las personas.** En
cuanto una métrica se usa para evaluar a alguien, deja de medir la realidad
(ley de Goodhart), y además se tarda muy poco en aprender a moverla sin mejorar
nada.

## 6. Umbrales y acciones

Una métrica sin umbral es un adorno. Cada número del panel debería tener escrito
qué pasa cuando se cruza:

| Métrica | Umbral de ejemplo | Acción |
|---------|-------------------|--------|
| WIP | > 2 items por persona | No se empieza nada nuevo hasta cerrar algo |
| Aging de un item | > percentil 85 del cycle time | Se habla de ese item en la siguiente reunión |
| Lead time (mediana) | Sube dos semanas seguidas | Se revisa el tamaño de los items |
| Throughput | Cae a la mitad | Se busca el bloqueo, no el culpable |
| Items sin estimar en el sprint | > 20 % | Sesión de refinamiento |

Los números concretos son tuyos: se fijan mirando tu propio histórico, no
copiando los de un artículo.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Usar la media en vez de la mediana | Un dato extremo la destroza | Mediana, y percentil 85 para el peor caso |
| Medir sobre 5 items | No hay señal, solo ruido | Mínimo 20-30 items cerrados |
| Panel con 15 gráficos | Nadie mira ninguno | 4 métricas, 4 números |
| Medir sin decidir nada | Trabajo tirado | Cada métrica con umbral y acción |
| Comparar equipos | Contextos distintos, incentivos perversos | Compara un equipo consigo mismo |
| Medir lead time y culpar al equipo | Incluye el tiempo en backlog, que no controlan | Para el equipo, cycle time |
| Cambiar la definición de "hecho" a mitad | La serie deja de ser comparable | Fija las definiciones y déjalas |
| Mirar solo lo cerrado | No ves lo que se está pudriendo ahora | Aging WIP |

## 8. Trucos

- **Percentil 85 en vez de máximo**: da el "casi peor caso" sin el dato absurdo,
  y es el número que se puede prometer a alguien de fuera
- **Cuenta issues para el throughput de producto** y **PRs para el de
  ingeniería**: responden preguntas distintas
- **Excluye los cerrados como *not planned***: no son entregas, y si los cuentas
  parecerá que entregas más cuanto más descartas
- **Tamaño de PR contra tiempo de merge**: correlacionarlos es la forma más
  rápida de convencer a un equipo de que abra PRs pequeños
- **Empieza midiendo una sola cosa**: el WIP. Es la que más cambia el resultado y
  la más fácil de contar
- **Guarda el histórico**: la API te da el estado de hoy; la serie temporal la
  construyes tú ([Teoría 07](07-informes-automaticos.md))

## 📚 Recursos Adicionales

- [DORA — Métricas](https://dora.dev/guides/dora-metrics-four-keys/)
- [`github/issue-metrics`](https://github.com/github/issue-metrics) — action oficial de métricas
- [Kanban — WIP limits](https://www.atlassian.com/agile/kanban/wip-limits)

## ✅ Checklist de Verificación

- [ ] Sabes la diferencia entre lead time y cycle time, y qué implica cada una
- [ ] Tienes escritas tus definiciones de "se empieza" y "se termina"
- [ ] Sabes por qué la ley de Little recomienda bajar el WIP
- [ ] Puedes nombrar tres métricas que no deberías usar
- [ ] Cada métrica de tu panel tiene un umbral y una acción asociada
