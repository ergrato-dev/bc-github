# Rúbrica de Evaluación — Semana 02: El repositorio como producto

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | Documentación del repositorio hilo conductor |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Qué obliga a hacer la licencia GPL a quien distribuya un derivado, y en qué se diferencia de MIT? |
| 2 | ¿Para qué sirve `linguist-generated=true` en `.gitattributes`? |
| 3 | ¿Qué diferencia hay entre `.gitignore` y `.git/info/exclude`? |
| 4 | ¿Cómo se convierte una URL de un archivo en un permalink que no se rompe? |
| 5 | ¿Qué hace un repositorio llamado `.github` en tu cuenta? |
| 6 | ¿Qué pasa cuando alguien abre un PR que toca una ruta con `CODEOWNERS`? |
| 7 | ¿Qué es el *community profile* y qué archivos revisa? |
| 8 | ¿Cómo normalizas los finales de línea entre Windows y Linux? |
| 9 | ¿Qué sintaxis busca la palabra `permissions` en los YAML de toda una organización? |
| 10 | ¿Cómo se ignora un commit de reformateo masivo en `git blame`? |

*(Las respuestas se publican con el contenido detallado de la semana.)*

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — README que se lee | Estructura de embudo: qué es, por qué, cómo empezar, detalle | 10 |
| 02 — `.gitattributes` y CODEOWNERS | EOL normalizado, generados marcados, al menos una ruta enrutada | 10 |
| 03 — Markdown avanzado | Diagrama Mermaid renderizando, alerts y bloque colapsable | 10 |
| 04 — Pages | Sitio publicado y accesible desde la URL de Pages | 10 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT y SECURITY presentes | 20 |
| `.gitattributes` y `.gitignore` en la rama por defecto | 10 |
| `CODEOWNERS` presente y válido | 10 |
| 3 o más topics en el repositorio | 10 |
| GitHub Pages activo | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| El README explica el proyecto a alguien que no lo conoce, en los primeros 5 renglones | 15 |
| La licencia elegida es coherente con la intención del proyecto y está justificada | 10 |
| El diagrama Mermaid aporta información, no decora | 10 |
| Los topics son buscables y reales, no relleno | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| README generado sin adaptar al dominio | -20 |
| LICENSE copiada sin entender qué obliga | -10 |
| Badges rotos o que apuntan a otro repositorio | -10 |
| Archivos de comunidad vacíos o con la plantilla sin rellenar | -15 |
