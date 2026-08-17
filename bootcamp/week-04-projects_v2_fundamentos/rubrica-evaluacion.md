# Rúbrica de Evaluación — Semana 04: Projects v2 fundamentos

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | El Project v2 de tu dominio |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Por qué se dice que las columnas de un tablero de Projects v2 no existen? |
| 2 | ¿Qué tres tipos de item admite un project y qué limita a los *draft*? |
| 3 | ¿Qué datos van en el issue y cuáles en el project? Da el criterio, no una lista |
| 4 | ¿Qué tipos de campo existen y cuál elegirías para una estimación? |
| 5 | ¿Qué ventaja tiene `iteration:@current` frente a filtrar por el nombre del sprint? |
| 6 | ¿Qué hace `Group by` en una vista de tablero y qué **no** hace? |
| 7 | Escribe el filtro que devuelve el trabajo abierto del sprint actual sin asignar |
| 8 | ¿Qué puede y qué no puede hacer un workflow integrado? |
| 9 | ¿Por qué Projects v2 no se puede consultar por la API REST? |
| 10 | ¿Qué scope necesita `gh` para leer un project, y cuál para escribir? |

*(Las respuestas se publican con la versión revisada de la semana.)*

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Crear el project | Project creado, vinculado al repo y con 4 campos propios | 5 |
| 01 — Crear el project | 12+ items dentro y campos rellenos | 5 |
| 02 — Vistas | Cuatro vistas nombradas por su pregunta, todas filtradas | 5 |
| 02 — Vistas | Campos visibles ajustados por vista | 5 |
| 03 — Iteraciones | Campo de iteración con 6 iteraciones y un descanso | 5 |
| 03 — Iteraciones | Vista de sprint con `iteration:@current` y roadmap con barras | 5 |
| 04 — GraphQL | Consulta de campos e items con fragmentos correctos | 5 |
| 04 — GraphQL | `scripts/project-resumen.sh` funcionando y commiteado | 5 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| Project con 12+ items | 15 |
| Campos `Priority`, `Size` y `Area` | 15 |
| Campo de iteración con 3+ iteraciones | 15 |
| 4 o más vistas | 10 |
| `scripts/project-resumen.sh` en el repositorio | 5 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| `Status` refleja tu flujo real, con descripciones | 10 |
| Cada vista responde una pregunta y su nombre lo dice | 10 |
| La iteración actual tiene una carga de trabajo realista | 10 |
| Las áreas son las de tu dominio, no genéricas | 10 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Un project por sprint en vez de campo de iteración | -20 |
| Campos creados y vacíos en la mayoría de items | -15 |
| Vistas sin filtro que muestran todo | -10 |
| Vistas nombradas "Board 1", "Table 2" | -5 |
| Auto-archive activado sin probar el filtro, con items perdidos | -10 |
