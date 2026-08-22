# Insights de Projects

> GitHub trae gráficos hechos. Sirven para lo que sirven: conviene saber dónde
> acaban, porque el día que necesites "cuánto tardamos" no vas a encontrarlo ahí.

## 🎯 Objetivos

- Configurar gráficos actuales e históricos sobre tus propios campos
- Elegir los cuatro gráficos que se miran de verdad
- Conocer los límites de los Insights nativos y por qué existen
- Decidir cuándo basta con Insights y cuándo hace falta informe propio

## 1. Qué problema resuelve

Antes de escribir un solo script, el project ya sabe contar: cuántos items hay en
cada estado, cuánta carga tiene cada persona, cómo evoluciona el sprint. Todo eso
está a dos clics y no hay que mantenerlo.

Empezar por aquí evita el error clásico de construir un panel a medida para
responder preguntas que la plataforma ya responde.

## 2. Los dos tipos de gráfico

`Project → Insights`.

| Tipo | Qué muestra | Bueno para |
|------|-------------|------------|
| **Current chart** | Foto de ahora, agrupada por un campo | "¿Cuánto hay en cada estado?" |
| **Historical chart** | Evolución en el tiempo (tipo burn-up) | "¿Cerramos más de lo que abrimos?" |

De cada uno se configura: **filtro** (la misma sintaxis de las vistas,
[Semana 04, Teoría 05](../../week-04-projects_v2_fundamentos/1-teoria/05-filtros.md)),
**eje X**, **agrupación** y **tipo** (barras, líneas, apiladas).

Un detalle que cambia la lectura: el eje Y puede ser el **recuento de items** o
la **suma de un campo numérico**. Con `Estimate`, el mismo gráfico pasa de
"cuántas tarjetas" a "cuánto trabajo", que casi nunca es lo mismo.

## 3. Los cuatro que merece la pena tener

1. **Items por estado** — barras, agrupado por `Status`, filtro `is:open`
2. **Carga por persona** — barras, agrupado por `Assignees`, filtro
   `is:open -status:Hecho`
3. **Burn-up del sprint** — histórico, filtro `iteration:@current`
4. **Deuda por área** — barras, agrupado por `Area`, filtro
   `is:open label:"type:bug"`

Con esos cuatro se cubren las preguntas de una reunión de seguimiento. El quinto
gráfico se añade cuando alguien pregunte algo que ninguno responde — y casi
nunca pasa.

> [!TIP]
> Los gráficos por defecto agrupan por `Status` y poco más. Un Insight sin
> configurar no dice nada que no se vea en el tablero: la utilidad aparece al
> agruparlo por **tus** campos.

## 4. Dónde acaban

| Límite | Consecuencia |
|--------|--------------|
| Solo datos del project | Lo que no está en el tablero no se ve |
| Sin métricas de tiempo | No calculan lead time ni cycle time |
| Sin exportación programada | No hay serie temporal descargable |
| Histórico según el plan | En cuentas Free la ventana de datos es corta |
| No se pueden incrustar | No hay imagen que pegar en un README |
| No se pueden combinar con datos de fuera | Ni CI, ni despliegues, ni incidencias |

Traducción operativa:

| La pregunta | Dónde se responde |
|-------------|-------------------|
| ¿Cuánto hay de cada cosa? | Insights |
| ¿Cómo va el sprint? | Insights (histórico) |
| ¿Cuánto tardamos? | Script propio ([Teoría 05](05-calcular-metricas-con-la-api.md)) |
| ¿Cómo evolucionamos en seis meses? | Informe propio ([Teoría 07](07-informes-automaticos.md)) |
| ¿Qué se despliega y cuándo falla? | DORA, con CI/CD (Semanas 11-12) |

## 5. Exportar

La vista de tabla tiene `···` → *Export view data*, que descarga un CSV con los
campos visibles de los items filtrados. Es lo más rápido para un análisis puntual
en una hoja de cálculo.

Lo que **no** es: una fuente de datos automatizable. No hay descarga programada
ni endpoint equivalente, así que si el análisis se va a repetir cada semana, el
camino es GraphQL en un script y no un CSV descargado a mano.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Gráficos por defecto sin configurar | Repiten lo que ya ves en el tablero | Agrupa por tus campos |
| Ocho gráficos en el panel | Nadie mira ninguno | Cuatro, con una pregunta cada uno |
| Contar tarjetas en vez de sumar el esfuerzo | Diez tarjetas pequeñas parecen más que dos enormes | Eje Y = suma de `Estimate` |
| Buscar lead time en Insights | No está y perderás media hora | Script propio |
| Exportar a CSV cada semana a mano | Trabajo repetido y no reproducible | GraphQL en un script |
| Panel que nadie abre | Trabajo tirado | Que el número llegue donde ya miras |

## 7. Trucos

- **Duplica un gráfico** para hacer la variante en vez de reconfigurarlo desde
  cero
- **Nombra los gráficos por la pregunta**, igual que las vistas
- **Filtro `-status:Hecho`** en casi todos: lo cerrado desvirtúa cualquier lectura
  de carga actual
- **Un gráfico histórico por iteración** (`iteration:@current`) es un burn-up
  gratis, sin herramienta externa
- **Comparte el enlace del Insight** en el informe semanal: quien quiera el
  detalle lo tiene a un clic
- **Si un gráfico lleva un mes sin mirarse, bórralo**: mantener un panel limpio es
  lo que hace que se mire

## 📚 Recursos Adicionales

- [GitHub Docs — About insights for Projects](https://docs.github.com/issues/planning-and-tracking-with-projects/viewing-insights-from-your-project/about-insights-for-projects)
- [GitHub Docs — Creating charts](https://docs.github.com/issues/planning-and-tracking-with-projects/viewing-insights-from-your-project/creating-charts)
- [GitHub Docs — Exporting project data](https://docs.github.com/issues/planning-and-tracking-with-projects/managing-items-in-your-project/exporting-your-projects-data)

## ✅ Checklist de Verificación

- [ ] Tienes al menos un gráfico configurado con un campo propio
- [ ] Sabes qué preguntas **no** puede responder Insights
- [ ] Alguno de tus gráficos suma un campo numérico en vez de contar items
- [ ] Has exportado una vista a CSV al menos una vez
