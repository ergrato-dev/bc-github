# Rúbrica de Evaluación — Semana 08: Gobernanza, rulesets y merge queue

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | `main` protegida y environments configurados |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Qué aportan los rulesets frente a branch protection clásica? |
| 2 | ¿Qué hace el modo `evaluate` y cuándo lo usarías? |
| 3 | ¿Qué pasa si exiges un status check que no se dispara en un PR concreto? |
| 4 | ¿Qué es un *bypass actor* y qué riesgo tiene concederlo? |
| 5 | ¿Cómo se comportan dos rulesets que aplican a la misma rama? |
| 6 | ¿Qué problema resuelve merge queue que no resuelve "rama al día"? |
| 7 | ¿Cuándo merge queue es sobreingeniería? |
| 8 | ¿Qué diferencia hay entre un secreto de repositorio y uno de environment? |
| 9 | ¿Para qué sirve un *wait timer* en un environment? |
| 10 | ¿Qué push rules existen y qué problema real evita cada una? |

*(Las respuestas se publican con el contenido detallado de la semana.)*

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Primer ruleset | Creado en modo `evaluate` y revisado antes de activar | 10 |
| 02 — Checks y firmas | Status check y firmas requeridos, comprobados con un PR real | 10 |
| 03 — Push rules | Regla de tamaño o ruta configurada y probada | 10 |
| 04 — Environments | Environment con revisor obligatorio, despliegue detenido a la espera | 10 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| Ruleset activo en `main` | 10 |
| PR obligatorio antes de mergear | 10 |
| Al menos un status check requerido | 10 |
| Commits firmados obligatorios | 10 |
| Revisión de code owners requerida | 10 |
| Un environment con revisor | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| Las reglas corresponden a los acuerdos de la Semana 07, no a una lista copiada | 15 |
| Los bypass actors están justificados y son los mínimos | 10 |
| La configuración está documentada en `CONTRIBUTING.md` | 10 |
| Se probó en `evaluate` antes de activar | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Bypass genérico para tu propio usuario "por comodidad" | -20 |
| Ruleset activado sin probar, dejando el repositorio bloqueado | -10 |
| Exigir checks que nunca se ejecutan | -10 |
| Merge queue activado sin justificación de volumen | -5 |
