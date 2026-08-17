---
name: verificar-estructura
description: Verifica que la estructura del bootcamp (nombres de carpeta week-NN-slug, enlaces relativos, navegación anterior/siguiente, secciones obligatorias del README de semana, SVG huérfanos, checks.json válido) sea consistente. Usar antes de cerrar cualquier cambio que cree, mueva o renombre contenido de una semana, o cuando se sospeche de un enlace roto.
allowed-tools: Bash(bash scripts/verificar-enlaces.sh) Bash(jq*) Read Grep Glob
---

# Verificar estructura del bootcamp

Repo single-track, **21 semanas fijas** (`bootcamp/week-01-...` a `week-21-...`).
Un enlace desde `bootcamp/week-NN-*/README.md` a la raíz es siempre
`../../README.md` (2 niveles).

## Qué hacer

### 1. Script mecánico

```bash
bash scripts/verificar-enlaces.sh
```

Verifica:

- Carpetas bajo `bootcamp/` con formato `week-NN-slug` (NN de 2 dígitos, slug en
  minúsculas con `_` y dígitos).
- Enlaces relativos `[texto](ruta)` en cualquier `.md` que resuelvan a algo real
  (ignora `http`, `mailto:`, anclas y el contenido dentro de bloques ` ``` `).
- Que cada `bootcamp/week-XX/README.md` tenga sección "Navegación".
- Que todo SVG de `0-assets/` esté enlazado desde algún `.md`.
- Que cada `checks.json` sea JSON válido.

Falso positivo conocido: URLs con paréntesis anidados (`(book)`). Cualquier otra
cosa que reporte es un problema real.

### 2. Lo que el script no ve (revisar a mano)

- **Las 10 secciones obligatorias** del README de semana, en orden:
  Objetivos, Prerrequisitos, Estructura, Contenidos, Distribución del Tiempo,
  Trucos y atajos, Entregables, Verificación, Navegación (más el título).
  Falta la sección de Trucos con más frecuencia que ninguna otra.
- **Cadena de navegación completa**: la semana N apunta a N-1 y N+1 con los
  slugs reales. La 01 no tiene anterior; la 21 no tiene siguiente.
- **Sincronía de las tablas de la malla**: `README.md`, `README_EN.md` y
  `.github/copilot-instructions.md` tienen cada uno la tabla de 21 semanas. Si
  cambia un slug o un tema, cambian los tres. Usa el agente
  `curriculo-coherencia-reviewer` para esto.
- **Coherencia `checks.json` ↔ `3-proyecto/README.md`**: las descripciones de
  las comprobaciones deben aparecer literalmente como requisitos del proyecto.
- **Trucos replicados** en `docs/trucos-github.md` (skill `sincronizar-trucos`).

### 3. Profundidad de `../`

| Desde | A la raíz | A `docs/` |
|-------|-----------|-----------|
| `bootcamp/week-NN/README.md` | `../../README.md` | `../../docs/x.md` |
| `bootcamp/week-NN/1-teoria/x.md` | `../../../README.md` | `../../../docs/x.md` |
| `bootcamp/week-NN/4-recursos/webgrafia/README.md` | `../../../../README.md` | `../../../../docs/x.md` |
| `.github/prompts/x.prompt.md` | `../../README.md` | `../../docs/x.md` |

Regla: un `../` por cada carpeta de profundidad.

## Cierre

No des el cambio por cerrado hasta que `verificar-enlaces.sh` imprima
`OK: sin problemas detectados.`
