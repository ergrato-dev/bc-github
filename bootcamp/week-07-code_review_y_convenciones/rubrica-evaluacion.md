# Rúbrica de Evaluación — Semana 07: Code review y convenciones

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | Las reglas escritas y automatizadas del repositorio |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | Nombra tres cosas que **no** debería revisar una persona y quién las revisa |
| 2 | ¿Por qué "¿qué pasa si `dias` es negativo?" funciona mejor que "falta validar"? |
| 3 | ¿Qué comunica `Request changes` y cuándo **no** debe usarse? |
| 4 | ¿Qué incremento de SemVer produce cada tipo de commit convencional? |
| 5 | ¿De las dos formas de marcar un breaking change, cuál conviene y por qué usar ambas? |
| 6 | Con squash merge, ¿qué mensaje acaba en `main` y qué implica para la validación? |
| 7 | ¿Cuándo tiene sentido git-flow y cuándo estorba? |
| 8 | ¿Por qué una rama de dos semanas da muchos más conflictos que una de dos días? |
| 9 | En `CODEOWNERS`, ¿qué regla gana cuando varias coinciden? |
| 10 | Diferencia entre criterios de aceptación y Definition of Done |

*(Las respuestas se publican con la versión revisada de la semana.)*

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Commits | Hook versionado en `.githooks/` con `core.hooksPath` | 5 |
| 01 — Commits | Rechaza mensajes malos y deja pasar merges y `!` | 5 |
| 02 — Títulos | Workflow que valida el título del PR | 5 |
| 02 — Títulos | Comprobado en rojo y en verde, sin nuevos commits | 5 |
| 03 — CODEOWNERS/DoD | `codeowners/errors` vacío y reglas ordenadas | 5 |
| 03 — CODEOWNERS/DoD | DoD comprobable e integrada en la plantilla de PR | 5 |
| 04 — Auditoría | Script de auditoría funcionando | 5 |
| 04 — Auditoría | Conclusiones publicadas con acciones concretas | 5 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| `.githooks/commit-msg` versionado | 10 |
| `.github/workflows/validar-pr.yml` | 10 |
| `CODEOWNERS` sin errores | 10 |
| DoD en la plantilla de PR | 10 |
| `scripts/auditoria-prs.sh` | 10 |
| 3+ PRs mergeados con título convencional | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| `CONTRIBUTING.md` cubre convención, ramas, review, DoD y umbrales | 15 |
| El flujo de ramas está **justificado**, no solo nombrado | 10 |
| La DoD tiene ≤8 puntos y todos son comprobables | 10 |
| Las reglas de `CODEOWNERS` van de general a específico | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| DoD con criterios no comprobables ("código de calidad") | -10 |
| Hook en `.git/hooks` en vez de versionado | -10 |
| Validar commits locales pero no el título del PR usando squash | -15 |
| `CONTRIBUTING.md` copiado sin adaptar al proyecto | -20 |
| Auditoría sin conclusiones ni acciones | -10 |
