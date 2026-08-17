# Rúbrica de Evaluación — Semana 09: Actions fundamentos

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | El CI de tu repositorio |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Qué comparten y qué no comparten dos jobs del mismo workflow? |
| 2 | Diferencia entre `pull_request` y `pull_request_target`, y por qué importa |
| 3 | ¿Qué contexts existen y cuándo se evalúa cada uno? |
| 4 | ¿Para qué sirve `needs` y qué le pasa a un job si su dependencia falla? |
| 5 | ¿Qué hace `fail-fast: false` en una matriz? |
| 6 | ¿Cuál es la diferencia entre `include` y `exclude` en una matriz? |
| 7 | ¿Por qué la `key` de una caché debe incluir el hash del lockfile? |
| 8 | ¿Qué diferencia hay entre un artifact y una caché? |
| 9 | ¿Cómo se pasa un valor de un step a otro? ¿Y de un job a otro? |
| 10 | ¿Cómo activas los logs de depuración y qué te enseñan? |

*(Las respuestas se publican con el contenido detallado de la semana.)*

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Primer CI | Workflow que corre los tests en cada PR, con `permissions` | 10 |
| 02 — Matriz | Matriz de 3+ versiones con `include`/`exclude` y `fail-fast: false` | 10 |
| 03 — Artifacts y caché | Artifact publicado y consumido; caché con acierto demostrado | 10 |
| 04 — Depuración | Run depurado con debug logging y `--log-failed` | 10 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| Workflow de CI presente y ejecutándose | 15 |
| Al menos un run con éxito sobre un PR | 15 |
| Matriz con 3 o más combinaciones | 10 |
| Artifact publicado en algún run | 10 |
| El check de CI es requerido en el ruleset | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| `permissions` declaradas explícitamente en el workflow | 15 |
| La caché acierta (se ve `Cache restored` en el log) | 10 |
| Los nombres de jobs y steps explican qué hacen | 10 |
| El CI tarda menos de 5 minutos | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Workflow sin `permissions` | -15 |
| Secreto o token escrito en el YAML | -100 (rotar y rehacer) |
| Caché con `key` fija que nunca invalida | -10 |
| `pull_request_target` usado sin necesidad | -20 |
| CI que tarda más de 15 minutos sin justificación | -5 |
