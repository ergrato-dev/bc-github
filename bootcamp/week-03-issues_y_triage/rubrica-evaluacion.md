# Rúbrica de Evaluación — Semana 03: Issues y triage

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | Backlog real del repositorio hilo conductor |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Qué ventaja tiene un issue form YAML sobre una plantilla Markdown? |
| 2 | ¿Cómo se hace obligatorio un campo en un issue form? |
| 3 | ¿Qué hace `blank_issues_enabled: false` y cuándo NO lo querrías? |
| 4 | ¿Qué diferencia hay entre un milestone y una iteración de Projects? |
| 5 | ¿Qué closing keywords cierran un issue al mergear un PR? |
| 6 | ¿Cómo se cierra un issue de **otro** repositorio desde un PR? |
| 7 | ¿Qué diferencia hay entre una tasklist y sub-issues? |
| 8 | Escribe la query que lista issues abiertos, sin asignar y sin labels |
| 9 | ¿Para qué sirven los `contact_links` de `config.yml`? |
| 10 | ¿Qué criterio usarías para decidir el color de una label? |

*(Las respuestas se publican con el contenido detallado de la semana.)*

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Issue forms | Dos formularios con campos obligatorios y validación | 10 |
| 02 — Taxonomía de labels | 10+ labels con prefijo de familia, color y descripción | 10 |
| 03 — Sub-issues y tasklists | Un épico partido en al menos 3 sub-issues enlazadas | 10 |
| 04 — Triage con queries | 15 issues triados usando búsquedas, no la vista por defecto | 10 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| Existen 2 o más issue forms en `.github/ISSUE_TEMPLATE/` | 15 |
| `config.yml` presente con `blank_issues_enabled: false` | 5 |
| 10 o más labels propias (excluyendo las de fábrica) | 15 |
| 12 o más issues creados | 15 |
| Un milestone con fecha y 5+ issues asignados | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| Los issues describen problemas reales del dominio, no "tarea 1, tarea 2" | 15 |
| La taxonomía de labels es coherente y no se solapa | 10 |
| Cada issue tiene criterios de aceptación verificables | 10 |
| Las prioridades reflejan una decisión, no todo es alta | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Issues de relleno sin contenido real | -25 |
| Labels de fábrica sin adaptar ni describir | -10 |
| Issue forms sin ningún campo obligatorio | -10 |
| Milestone sin fecha | -5 |
