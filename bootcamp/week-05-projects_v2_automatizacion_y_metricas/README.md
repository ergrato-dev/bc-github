# Semana 05 — Projects v2: automatización y métricas

> Un tablero que hay que mantener a mano se abandona en tres semanas. Esta
> semana el tablero se mantiene solo y, además, te dice cómo va el proyecto.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Escribir **mutaciones GraphQL** para añadir items y rellenar campos
- Automatizar el project con `actions/add-to-project` y con GraphQL propio
- Elegir la credencial correcta: por qué `GITHUB_TOKEN` **no** sirve para Projects
- Calcular métricas de flujo estilo **DORA-lite** desde la API
- Leer los **Insights** nativos y saber qué no te cuentan
- Publicar un informe semanal automático de tu proyecto

## 📋 Prerrequisitos

- Semana 04 completada: project con campos, iteraciones y cuatro vistas
- Scope `project` (escritura), no solo `read:project`

> [!NOTE]
> Esta semana usa workflows de GitHub Actions **como receta**: se explican lo
> justo para que funcionen. El modelo de ejecución, los eventos, los contexts y
> la seguridad se estudian a fondo en las **semanas 09 a 11**. Si algo del YAML
> te resulta opaco ahora, es esperado.

## 🗂️ Estructura de la Semana

```
week-05-projects_v2_automatizacion_y_metricas/
├── 1-teoria/
│   ├── 01-graphql-de-escritura.md    # Mutaciones, IDs, idempotencia
│   ├── 02-automatizacion-con-actions.md # add-to-project, credenciales, límites
│   ├── 03-metricas-de-flujo.md       # Lead time, cycle time, throughput, WIP
│   └── 04-insights-y-reportes.md     # Insights nativos, exportar, informar
├── 2-practicas/
│   ├── 01-mutaciones-graphql.md      # Escribir en el project por API
│   ├── 02-workflow-add-to-project.md # Que el tablero se llene solo
│   ├── 03-panel-de-metricas.md       # Calcular lead time y throughput
│   └── 04-informe-semanal.md         # Informe automático en un issue
├── 3-proyecto/README.md              # Tu tablero, automatizado y medido
├── 0-assets/01-metricas-de-flujo.svg
├── 4-recursos/ · 5-glosario/
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [01-graphql-de-escritura.md](1-teoria/01-graphql-de-escritura.md) | Mutaciones, IDs, cómo no duplicar items | 30 min |
| [02-automatizacion-con-actions.md](1-teoria/02-automatizacion-con-actions.md) | `add-to-project`, credenciales, qué automatizar | 30 min |
| [03-metricas-de-flujo.md](1-teoria/03-metricas-de-flujo.md) | Lead time, cycle time, throughput, WIP y DORA | 30 min |
| [04-insights-y-reportes.md](1-teoria/04-insights-y-reportes.md) | Insights nativos, sus límites, informes propios | 30 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [01-mutaciones-graphql.md](2-practicas/01-mutaciones-graphql.md) | Añades items y rellenas campos por API | 45 min |
| [02-workflow-add-to-project.md](2-practicas/02-workflow-add-to-project.md) | El tablero se llena solo con cada issue | 45 min |
| [03-panel-de-metricas.md](2-practicas/03-panel-de-metricas.md) | Calculas lead time y throughput reales | 45 min |
| [04-informe-semanal.md](2-practicas/04-informe-semanal.md) | Un informe automático cada lunes | 40 min |

### Proyecto

Tu project pasa a **mantenerse solo** y a producir un informe semanal con las
métricas de flujo de tu repositorio.
→ [3-proyecto/README.md](3-proyecto/README.md)

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (4 archivos) | 2 h |
| Prácticas (4) | 2 h 55 min |
| Proyecto | 2 h 25 min |
| Revisión y verificación | 40 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| `GITHUB_TOKEN` no vale para Projects | No tiene alcance sobre projects: usa un PAT fine-grained o un token de GitHub App |
| Añadir un item sin duplicarlo | `addProjectV2ItemById` es idempotente: devuelve el item existente si ya estaba |
| Los IDs se sacan una vez | `gh project view <n> --owner @me --format json` y guárdalos como variables del repo |
| Ver una mutación antes de lanzarla | Pruébala en el [GraphQL Explorer](https://docs.github.com/graphql/overview/explorer) con tu propio token |
| Fechas de cierre sin abrir nada | `gh issue list --state closed --json number,createdAt,closedAt` |
| Lead time en una línea | `jq` sobre esa salida: `(closedAt - createdAt)` en días |
| Throughput por semana | `gh issue list --search "closed:>2026-08-01" --json number --jq 'length'` |
| Métricas de PRs | `gh pr list --state merged --json createdAt,mergedAt,additions,deletions` |
| Exportar el project a CSV | Vista de tabla → `···` → *Export view data* |
| Un informe es un issue | `gh issue create` desde un workflow con `schedule:` deja histórico navegable |
| Insights sin configurar mienten | Los gráficos por defecto agrupan por `Status`; cámbialo a lo que de verdad quieras medir |
| Evita medir lo que no controlas | El lead time incluye el tiempo en backlog: si quieres medir al equipo, mide *cycle time* |

## 📌 Entregables

1. ✅ Una mutación GraphQL que rellena un campo del project, ejecutada
2. ✅ Workflow `add-to-project` funcionando con cada issue nuevo
3. ✅ Script de métricas que calcula lead time, cycle time y throughput
4. ✅ Workflow programado que publica un informe semanal
5. ✅ Al menos un informe generado y visible en el repositorio
6. ✅ Un gráfico de Insights configurado con un campo propio

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 05 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 04: Projects v2 fundamentos](../week-04-projects_v2_fundamentos/README.md) | **Semana 05: Projects v2 automatización y métricas** | [Semana 06: Pull requests a fondo →](../week-06-pull_requests_a_fondo/README.md) |
