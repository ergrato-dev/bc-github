# Rúbrica de Evaluación — Semana 05: Projects v2 automatización y métricas

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | Tablero automatizado + circuito de métricas |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Por qué `GITHUB_TOKEN` no sirve para escribir en un Project v2? |
| 2 | ¿Qué tres IDs necesitas para poner un valor en un campo single select? |
| 3 | ¿Qué significa que `addProjectV2ItemById` sea idempotente y por qué importa? |
| 4 | ¿Cuál es la diferencia entre lead time y cycle time, y qué indica cada caso? |
| 5 | Enuncia la ley de Little y su consecuencia práctica |
| 6 | ¿Por qué se usa la mediana y no la media en métricas de tiempo? |
| 7 | Nombra tres métricas que no deberías usar y explica el incentivo perverso de una |
| 8 | ¿Qué le pasa a un workflow con `schedule:` tras 60 días sin actividad? |
| 9 | ¿Qué va en `secrets` y qué en `vars`, y por qué? |
| 10 | ¿Qué pueden mostrar los Insights nativos y qué no? |

*(Las respuestas se publican con la versión revisada de la semana.)*

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Mutaciones | IDs obtenidos y `addProjectV2ItemById` ejecutada | 5 |
| 01 — Mutaciones | Campo escrito y **verificado** con una consulta posterior | 5 |
| 02 — Workflow | PAT fine-grained con permisos correctos, como secreto | 5 |
| 02 — Workflow | Un issue nuevo entra solo en el tablero, con estado | 5 |
| 03 — Métricas | Lead time con mediana y p85, excluyendo `not_planned` | 5 |
| 03 — Métricas | `scripts/metricas.sh` funcionando y commiteado | 5 |
| 04 — Informe | Workflow programado con `workflow_dispatch` | 5 |
| 04 — Informe | Informe publicado e histórico actualizado desde Actions | 5 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| `project-automation.yml` presente | 10 |
| `informe-semanal.yml` presente | 10 |
| `scripts/metricas.sh` presente | 10 |
| Secreto `PROJECT_TOKEN` configurado | 10 |
| Al menos una ejecución de workflow con éxito | 10 |
| Al menos un issue con label `type:informe` | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| El informe cabe en una pantalla y compara con la semana anterior | 15 |
| La automatización no decide prioridad ni iteración | 10 |
| El PAT tiene caducidad y existe recordatorio de rotación | 10 |
| Los IDs están en `vars`, no en `secrets` | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| PAT pegado en el YAML en vez de en un secreto | -100 (rotar el token y rehacer) |
| PAT sin caducidad | -15 |
| Informe de más de una pantalla, sin comparación | -10 |
| Métricas calculadas incluyendo issues `not_planned` | -10 |
| Workflow sin `permissions` declaradas | -10 |
