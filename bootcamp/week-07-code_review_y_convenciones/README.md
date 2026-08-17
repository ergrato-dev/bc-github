# Semana 07 — Code review y convenciones

> Las herramientas de la Semana 06 no sirven de nada sin acuerdos. Esta semana
> escribes las reglas: qué se revisa, cómo se nombra, cuándo está hecho.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Definir qué se revisa a mano y qué se delega a una máquina
- Escribir comentarios de revisión que no generen defensividad
- Aplicar **Conventional Commits** y entender su relación con SemVer y el changelog
- Automatizar la validación de commits y títulos de PR
- Comparar **GitHub flow**, **trunk-based** y **git-flow**, y elegir con criterio
- Usar `CODEOWNERS` como enrutador de conocimiento, no solo de permisos
- Escribir una **Definition of Done** que se pueda comprobar

## 📋 Prerrequisitos

- Semana 06 completada: PRs, revisión y estrategia de merge configurada

## 🗂️ Estructura de la Semana

```
week-07-code_review_y_convenciones/
├── 1-teoria/
│   ├── 01-cultura-de-review.md          # Qué se revisa, tiempos, desacuerdos
│   ├── 02-conventional-commits.md       # Spec, breaking changes, SemVer
│   ├── 03-estrategias-de-ramificacion.md # GitHub flow vs trunk-based vs git-flow
│   └── 04-codeowners-y-dod.md           # CODEOWNERS a escala y Definition of Done
├── 2-practicas/
│   ├── 01-commits-convencionales.md     # Convención + validación automática
│   ├── 02-validar-titulos-de-pr.md      # Workflow que rechaza títulos malos
│   ├── 03-codeowners-y-dod.md           # Enrutado y criterios de "hecho"
│   └── 04-auditoria-de-review.md        # Medir tamaño y tiempo de tus PRs
├── 3-proyecto/README.md                 # Las reglas del repositorio, escritas
├── 0-assets/01-flujos-de-ramas.svg
├── 4-recursos/ · 5-glosario/
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [01-cultura-de-review.md](1-teoria/01-cultura-de-review.md) | Qué revisar, tiempos, desacuerdos, tono | 30 min |
| [02-conventional-commits.md](1-teoria/02-conventional-commits.md) | Formato, breaking changes, SemVer, changelog | 30 min |
| [03-estrategias-de-ramificacion.md](1-teoria/03-estrategias-de-ramificacion.md) | GitHub flow, trunk-based, git-flow | 30 min |
| [04-codeowners-y-dod.md](1-teoria/04-codeowners-y-dod.md) | CODEOWNERS a escala, Definition of Done | 25 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [01-commits-convencionales.md](2-practicas/01-commits-convencionales.md) | Adoptas la convención y la validas en local | 45 min |
| [02-validar-titulos-de-pr.md](2-practicas/02-validar-titulos-de-pr.md) | Un workflow rechaza títulos que no cumplen | 40 min |
| [03-codeowners-y-dod.md](2-practicas/03-codeowners-y-dod.md) | Enrutado por área y DoD comprobable | 40 min |
| [04-auditoria-de-review.md](2-practicas/04-auditoria-de-review.md) | Mides tus propios PRs y sacas conclusiones | 45 min |

### Proyecto

Tu repositorio pasa a tener **reglas escritas y verificadas**: convención de
commits validada por CI, DoD en la plantilla de PR y `CODEOWNERS` por área.
→ [3-proyecto/README.md](3-proyecto/README.md)

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (4 archivos) | 1 h 55 min |
| Prácticas (4) | 2 h 50 min |
| Proyecto | 2 h 30 min |
| Revisión y verificación | 45 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Prefijos de severidad en la revisión | `bloqueante:` · `sugerencia:` · `nit:` — el autor sabe qué atender |
| Comenta el código, nunca a la persona | "esta función hace dos cosas", no "haces funciones que hacen dos cosas" |
| Pregunta en vez de ordenar | "¿qué pasa si `dias` es negativo?" abre conversación; "valida la entrada" la cierra |
| Breaking change | `!` tras el tipo (`feat!:`) o `BREAKING CHANGE:` en el footer |
| El scope es la parte del sistema | `feat(prestamos):`, no `feat(archivo-x):` |
| Validar commits sin instalar nada | Un hook `commit-msg` de 10 líneas con una expresión regular |
| Validar el título del PR | Con squash merge, **el título del PR es el commit**: valídalo en CI |
| Ramas que se explican solas | `feat/issue-42-calculo-multa` conecta rama, issue y tema |
| CODEOWNERS gana la última regla | No la más específica: el orden importa, y al revés de lo que parece |
| Comprobar CODEOWNERS antes de sufrirlo | `gh api repos/{owner}/{repo}/codeowners/errors --jq '.errors'` |
| Mide tus PRs antes de opinar | `gh pr list --state merged --json additions,deletions,createdAt,mergedAt` |
| La DoD va en la plantilla de PR | Una checklist que nadie ve no es una DoD |

## 📌 Entregables

1. ✅ `CONTRIBUTING.md` con convención de commits, flujo de ramas y proceso de review
2. ✅ Hook `commit-msg` que valida el formato en local
3. ✅ Workflow que valida el título de los PRs
4. ✅ `CODEOWNERS` con enrutado por área, sin errores
5. ✅ Definition of Done integrada en la plantilla de PR
6. ✅ Informe de auditoría de tus PRs (tamaño y tiempo de merge)

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 07 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 06: Pull requests a fondo](../week-06-pull_requests_a_fondo/README.md) | **Semana 07: Code review y convenciones** | [Semana 08: Gobernanza, rulesets y merge queue →](../week-08-gobernanza_rulesets_y_merge_queue/README.md) |
