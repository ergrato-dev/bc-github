# Rúbrica de Evaluación — Semana 06: Pull requests a fondo

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | Ciclo de PRs de tu repositorio |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Dónde tiene que ir `Fixes #N` para que cierre el issue, y dónde no funciona? |
| 2 | ¿Qué hace un draft PR y en qué se diferencia de uno abierto? |
| 3 | ¿Por qué un PR de 1500 líneas recibe menos comentarios que uno de 200? |
| 4 | Diferencia entre `Comment`, `Approve` y `Request changes` |
| 5 | ¿Qué ventaja tiene una sugerencia aplicable sobre un comentario que describe el cambio? |
| 6 | ¿Qué le hace cada estrategia de merge a la historia? Describe las tres |
| 7 | ¿Por qué auto-merge sin checks obligatorios es peligroso? |
| 8 | ¿Cuándo actualizas tu rama con `merge` y cuándo con `rebase`? |
| 9 | ¿Qué muestra `zdiff3` que no muestra el estilo por defecto, y por qué ayuda? |
| 10 | Tras mergear con squash el primer PR de una pila, ¿por qué se duplica el diff del segundo y cómo se arregla? |

*(Las respuestas se publican con la versión revisada de la semana.)*

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — PR completo | Plantilla de PR creada y usada | 5 |
| 01 — PR completo | 3 PRs mergeados que cierran su issue automáticamente | 5 |
| 02 — Review | Revisión por lotes con severidades marcadas | 5 |
| 02 — Review | Sugerencia de una línea y multilínea, aplicadas | 5 |
| 03 — Estrategias | Las tres comparadas sobre la misma historia | 5 |
| 03 — Estrategias | Repositorio configurado con una sola estrategia y decisión documentada | 5 |
| 04 — Conflictos | Conflicto resuelto en local con `zdiff3`, tests pasando | 5 |
| 04 — Conflictos | Pila de dos PRs creada y mergeada sin duplicados | 5 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| `pull_request_template.md` presente | 10 |
| 3 o más PRs mergeados | 10 |
| Una sola estrategia de merge habilitada | 10 |
| Borrado automático de ramas activo | 10 |
| Comentarios de revisión de línea | 10 |
| Un PR con base distinta de la rama por defecto | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| Descripciones con qué, por qué y cómo probarlo | 10 |
| Ningún PR por encima de 400 líneas sin justificación | 10 |
| La estrategia de merge está justificada en `CONTRIBUTING.md` | 10 |
| La resolución del conflicto está explicada en el PR | 10 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Push directo a `main` durante la semana | -20 |
| PR sin descripción, solo el título | -10 |
| Commits `wip` en `main` | -10 |
| `Request changes` usado para una preferencia de estilo | -5 |
| `git push --force` (sin `--with-lease`) sobre una rama publicada | -15 |
