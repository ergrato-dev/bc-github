---
name: "Nueva semana"
description: "Crea la estructura completa de una semana del Bootcamp GitHub: carpetas, README con las 10 secciones obligatorias, rúbrica con cuestionario, checks.json, teoría, prácticas, proyecto, recursos y glosario. Usar al empezar cualquier semana nueva."
argument-hint: "Número de semana (ej: 08), slug del tema (ej: gobernanza_rulesets_y_merge_queue), objetivos y features de GitHub que se cubren"
mode: "agent"
---

# Scaffold de nueva semana — Bootcamp GitHub

Crea la estructura completa de una semana siguiendo estrictamente
`.github/copilot-instructions.md`. Lee ese archivo antes de empezar.

## Estructura que debes crear

```
bootcamp/week-XX-tema_principal/
├── README.md                 ← 10 secciones obligatorias
├── rubrica-evaluacion.md     ← 30/40/30 + cuestionario con respuestas
├── checks.json               ← verificaciones automáticas
├── 0-assets/                 ← SVG (crear .gitkeep si aún no hay ninguno)
├── 1-teoria/
│   ├── 01-tema.md            ← ~150 líneas, máx 200
│   └── 02-tema.md
├── 2-practicas/
│   ├── 01-nombre-practica.md
│   └── 02-nombre-practica.md
├── 3-proyecto/
│   └── README.md             ← capa semanal del repo hilo conductor
├── 4-recursos/
│   ├── ebooks-free/README.md
│   ├── videografia/README.md
│   └── webgrafia/README.md
└── 5-glosario/README.md
```

> ⚠️ Las prácticas de este bootcamp son **operaciones sobre GitHub**, no código.
> Solo las semanas 09-12 (Actions) y 15-16 (API) llevan `starter/` con YAML o
> TypeScript. En el resto, cada práctica es un `.md` con pasos verificables.

## Convenciones obligatorias

- **Idioma**: español en documentación; inglés en código, ramas, commits e identificadores
- **`gh` CLI como forma canónica**; la UI web se documenta como alternativa
- **Todo paso termina con un comando de verificación** que el estudiante puede correr
- **Teoría**: orden fijo — qué problema resuelve → cómo se configura → antipatrones → trucos
- **Nunca** tokens con formato válido, ni falsos
- **Todo workflow de ejemplo** declara `permissions` y pinnea actions de terceros por SHA
- **SVG**: dark (`#0d1117`), sin degradados, sans-serif, enlazado desde algún `.md`
- **Sin dominios asignados**: ejemplos genéricos, adaptables al dominio del estudiante

## README.md de la semana — 10 secciones en este orden

```markdown
# Semana XX — [Título]

> Una o dos líneas: qué se domina al terminar la semana.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- ...

## 📋 Prerrequisitos

- Semana XX-1 completada
- ...

## 🗂️ Estructura de la Semana

(árbol de archivos real de la semana)

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|

### Proyecto

(1-2 líneas + enlace a 3-proyecto/README.md)

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| **Total** | **8 h** |

## 🎩 Trucos y atajos

(3-6 trucos con el criterio de admisión de copilot-instructions.md)

## 📌 Entregables

1. ✅ ...

## ✅ Verificación

\`\`\`bash
./scripts/verificar-semana.sh XX --repo <tu-usuario>/<tu-repo>
\`\`\`

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
```

## rubrica-evaluacion.md

30% conocimiento / 40% desempeño / 30% producto, mínimo 70% en cada uno.

Al ser autoestudio, el cuestionario de conocimiento incluye **las respuestas** en
un bloque `<details>` al final del archivo. 10 preguntas, 10 puntos cada una.

El desempeño se puntúa con las comprobaciones de `checks.json` (una comprobación
= una fila de la tabla). El producto se puntúa con criterios de calidad que la
API no puede ver.

Incluye tabla de penalizaciones (entrega tardía, secretos filtrados, etc.).

## checks.json

Formato completo en [`docs/autograding.md`](../../docs/autograding.md). Reglas:
una comprobación = un hecho; la expresión `jq` devuelve booleano; cero lógica
bash por semana. Prueba cada llamada con `gh api` antes de escribirla.

## 5-glosario/README.md

```markdown
# Glosario — Semana XX

Términos clave de esta semana, A-Z. El nombre real de la feature va en inglés
entre paréntesis cuando aplica.

## A

**Término** (*term*) — Definición en una o dos líneas.

> 📚 Glosario global: [docs/glosario-global.md](../../../docs/glosario-global.md)
```

## Instrucciones para el agente

1. Crear la estructura de carpetas completa
2. `README.md` con las 10 secciones y la navegación anterior/siguiente correcta
3. `rubrica-evaluacion.md` con cuestionario + respuestas en `<details>`
4. `checks.json` con las comprobaciones de la semana (probadas con `gh api`)
5. Teoría en `1-teoria/`, un archivo por concepto (~250 líneas), sin cupo de archivos
6. Prácticas en `2-practicas/`, cada paso con su comando de verificación
7. `3-proyecto/README.md` con la capa que se añade al repo hilo conductor
8. Recursos en las tres subcarpetas, cada uno con su justificación
9. Glosario A-Z
10. Replicar los trucos nuevos en `docs/trucos-github.md`
11. Correr `bash scripts/verificar-enlaces.sh` y dejarlo en verde

## Datos de la semana a crear

$input
