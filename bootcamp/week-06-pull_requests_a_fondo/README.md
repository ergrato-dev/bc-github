# Semana 06 — Pull requests a fondo

> El PR es donde se concentra casi todo lo que GitHub aporta a un equipo: es
> revisión, es CI, es documentación de por qué se hizo algo. Y casi nadie lo usa
> ni a la mitad.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Abrir PRs que se revisan rápido: pequeños, descritos y en draft cuando toca
- Revisar con comentarios de línea, **sugerencias aplicables** y revisión por lotes
- Distinguir `Comment`, `Approve` y `Request changes`, y cuándo usar cada uno
- Elegir estrategia de merge sabiendo qué le hace a la historia
- Usar **auto-merge** y entender cuándo conviene
- Resolver conflictos en local y en la web sin romper nada
- Trabajar con **stacked PRs** sin sufrirlos

## 📋 Prerrequisitos

- Semana 05 completada
- Semana 01: `rebase -i`, `reflog` y resolución de conflictos

## 🗂️ Estructura de la Semana

```
week-06-pull_requests_a_fondo/
├── 1-teoria/
│   ├── 01-anatomia-de-un-pr.md          # Estados, checks, mergeabilidad, forks
│   ├── 02-abrir-buenos-prs.md           # Tamaño, descripción, draft, plantilla
│   ├── 03-review-a-fondo.md             # Comentarios, sugerencias, lotes, veredictos
│   ├── 04-responder-a-la-review.md      # Aplicar cambios, hilos, desacuerdos
│   ├── 05-estrategias-de-merge.md       # Merge, squash, rebase, revertir
│   ├── 06-auto-merge-y-rama-al-dia.md   # Auto-merge, update-branch, Dependabot
│   └── 07-conflictos-y-stacked.md       # Conflictos y PRs apilados
├── 2-practicas/
│   ├── 01-primer-pr-completo.md     # Del issue al merge
│   ├── 02-review-con-sugerencias.md # Revisar como un profesional
│   ├── 03-comparar-estrategias.md   # Ver qué hace cada merge a la historia
│   └── 04-conflictos-y-stacked.md   # Conflictos y una pila de dos PRs
├── 3-proyecto/README.md             # Tu primer ciclo completo de PRs
├── 0-assets/01-estrategias-merge.svg
├── 4-recursos/ · 5-glosario/
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [01-anatomia-de-un-pr.md](1-teoria/01-anatomia-de-un-pr.md) | Ciclo de vida, checks, `mergeStateStatus`, PRs de forks | 20 min |
| [02-abrir-buenos-prs.md](1-teoria/02-abrir-buenos-prs.md) | Tamaño, descripción, draft, plantilla, `gh pr create` | 25 min |
| [03-review-a-fondo.md](1-teoria/03-review-a-fondo.md) | Sugerencias, lotes, veredictos, revisar un PR grande | 25 min |
| [04-responder-a-la-review.md](1-teoria/04-responder-a-la-review.md) | Aplicar cambios sin romper la revisión, hilos, desacuerdos | 20 min |
| [05-estrategias-de-merge.md](1-teoria/05-estrategias-de-merge.md) | Merge, squash, rebase y cómo se revierte cada uno | 25 min |
| [06-auto-merge-y-rama-al-dia.md](1-teoria/06-auto-merge-y-rama-al-dia.md) | Auto-merge, rama al día, `update-branch`, Dependabot | 20 min |
| [07-conflictos-y-stacked.md](1-teoria/07-conflictos-y-stacked.md) | Conflictos, `zdiff3`, `rerere` y PRs apilados | 20 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [01-primer-pr-completo.md](2-practicas/01-primer-pr-completo.md) | Un PR de principio a fin, cerrando un issue | 45 min |
| [02-review-con-sugerencias.md](2-practicas/02-review-con-sugerencias.md) | Revisas tu propio PR con sugerencias aplicables | 45 min |
| [03-comparar-estrategias.md](2-practicas/03-comparar-estrategias.md) | Mergeas tres PRs con tres estrategias y comparas | 45 min |
| [04-conflictos-y-stacked.md](2-practicas/04-conflictos-y-stacked.md) | Provocas un conflicto y montas una pila de PRs | 40 min |

### Proyecto

Todo el trabajo de tu repositorio pasa a entrar por PR: plantilla, revisión,
estrategia de merge elegida y justificada, y los issues cerrándose solos.
→ [3-proyecto/README.md](3-proyecto/README.md)

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (7 archivos) | 2 h 35 min |
| Prácticas (4) | 2 h 55 min |
| Proyecto | 2 h 10 min |
| Revisión y verificación | 20 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Traer un PR a local en un comando | `gh pr checkout 42` — funciona también con PRs de forks |
| Ignorar cambios de espacios en el diff | Añade `?w=1` a la URL del PR |
| El diff en texto plano | Añade `.diff` o `.patch` a la URL del PR |
| Sugerencias aplicables | Bloque ` ```suggestion ` en un comentario de línea: el autor lo aplica con un clic |
| Revisión por lotes | *Start a review* en vez de *Add single comment*: no notificas 20 veces |
| Qué archivos toca sin abrir nada | `gh pr diff 42 --name-only` |
| Ver el PR completo en la terminal | `gh pr view 42 --comments` |
| Auto-merge desde la terminal | `gh pr merge 42 --auto --squash` |
| Marcar listo un draft | `gh pr ready 42` |
| Revisar solo lo nuevo desde tu última visita | Menú *Files changed* → *Changes since your last review* |
| Ocultar los archivos generados del diff | `dist/* linguist-generated=true` en `.gitattributes` (Semana 02) |
| Ver PRs que te toca revisar | `gh pr list --search "review-requested:@me"` |
| Convertir en draft si aún no está listo | `gh pr ready --undo 42` |
| Reordenar una pila de PRs | Cambia la rama base en la web: se recalcula el diff solo |

## 📌 Entregables

1. ✅ `.github/pull_request_template.md` con secciones útiles
2. ✅ Al menos 3 PRs mergeados, cada uno cerrando un issue con `Fixes #N`
3. ✅ Un PR revisado con comentarios de línea y una sugerencia aplicada
4. ✅ Estrategia de merge decidida y configurada en el repositorio
5. ✅ Un conflicto real resuelto y documentado
6. ✅ Una pila de dos PRs encadenados

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 06 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 05: Projects v2 automatización y métricas](../week-05-projects_v2_automatizacion_y_metricas/README.md) | **Semana 06: Pull requests a fondo** | [Semana 07: Code review y convenciones →](../week-07-code_review_y_convenciones/README.md) |
