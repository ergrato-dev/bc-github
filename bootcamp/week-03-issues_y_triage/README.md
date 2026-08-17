# Semana 03 — Issues y triage

> Los issues son la base de datos de tu proyecto. Si no los diseñas, tendrás 200
> tickets titulados "no funciona".

> [!NOTE]
> Contenido detallado en preparación. Esta semana ya tiene definidos objetivos,
> contenidos, tiempos, trucos y entregables.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Diseñar **issue forms** en YAML con campos obligatorios y validación
- Construir una taxonomía de labels que escale (tipo / área / prioridad / estado)
- Distinguir milestone de iteración y usar cada uno donde toca
- Estructurar trabajo con **issue types**, sub-issues y tasklists
- Vincular issues y PRs con closing keywords
- Escribir queries de búsqueda avanzada para triar sin abrir 40 pestañas
- Automatizar el triage inicial con labels y plantillas

## 📋 Prerrequisitos

- Semana 02 completada: repositorio con documentación de comunidad

## 🗂️ Estructura de la Semana

```
week-03-issues_y_triage/
├── 1-teoria/     01-anatomia-de-un-issue · 02-issue-forms-yaml
│                 03-labels-milestones-y-tipos · 04-busqueda-y-triage
├── 2-practicas/  01-issue-forms · 02-taxonomia-de-labels
│                 03-sub-issues-y-tasklists · 04-triage-con-queries
├── 3-proyecto/   El backlog real de tu dominio
├── 4-recursos/ · 5-glosario/
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| `01-anatomia-de-un-issue.md` | Ciclo de vida, asignación, referencias cruzadas | 25 min |
| `02-issue-forms-yaml.md` | `.github/ISSUE_TEMPLATE/*.yml`, tipos de campo, `config.yml` | 35 min |
| `03-labels-milestones-y-tipos.md` | Taxonomías, issue types, sub-issues, tasklists | 30 min |
| `04-busqueda-y-triage.md` | Sintaxis de búsqueda, saved replies, proceso de triage | 30 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| `01-issue-forms.md` | Creas dos formularios: bug y feature | 50 min |
| `02-taxonomia-de-labels.md` | Diseñas y aplicas labels por lote con `gh` | 40 min |
| `03-sub-issues-y-tasklists.md` | Partes un épico en sub-issues | 40 min |
| `04-triage-con-queries.md` | Triás 15 issues con búsquedas guardadas | 40 min |

### Proyecto

Tu repositorio pasa a tener un **backlog real**: 12-15 issues de tu dominio,
etiquetados, priorizados y agrupados en un milestone.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (4 archivos) | 2 h |
| Prácticas (4) | 2 h 50 min |
| Proyecto | 2 h 30 min |
| Revisión y verificación | 40 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Autocompletar issues en cualquier caja | Escribe `#` y el número o el título |
| Cerrar issues desde el PR | `Fixes #12`, `Closes #12`, `Resolves #12` en la descripción |
| Cerrar issues de otro repo | `Fixes owner/repo#12` |
| Convertir un comentario en issue | Menú `···` del comentario → *Reference in new issue* |
| Crear un issue sin salir del editor | `gh issue create --title "..." --body "..." --label bug` |
| Plantillas desde la terminal | `gh issue create --template bug.yml` |
| Etiquetar 20 issues de golpe | `gh issue list --json number --jq '.[].number' \| xargs -I{} gh issue edit {} --add-label triage` |
| Búsquedas que ahorran horas | `is:issue is:open no:assignee no:label sort:created-asc` |
| Ver solo lo que te toca | `is:open assignee:@me` |
| Plantilla obligatoria | `blank_issues_enabled: false` en `config.yml` fuerza a usar los formularios |
| Enlazar fuera de GitHub | `contact_links` en `config.yml` manda las dudas a Discussions y deja Issues para bugs |
| Respuestas guardadas | `Settings → Saved replies` — se insertan con `Ctrl+.` |

## 📌 Entregables

1. ✅ Dos issue forms en YAML con campos obligatorios
2. ✅ `config.yml` con `blank_issues_enabled: false` y un contact link
3. ✅ Taxonomía de al menos 10 labels con colores y descripciones coherentes
4. ✅ 12+ issues reales de tu dominio, etiquetados
5. ✅ Un milestone con fecha y al menos 5 issues asignados
6. ✅ Un épico partido en sub-issues

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 03 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 02: El repositorio como producto](../week-02-repositorio_como_producto/README.md) | **Semana 03: Issues y triage** | [Semana 04: Projects v2 fundamentos →](../week-04-projects_v2_fundamentos/README.md) |
