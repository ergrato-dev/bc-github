# Labels, milestones y tipos

> Una taxonomía de labels mal diseñada es peor que no tener ninguna: da la
> ilusión de orden mientras esconde el trabajo real.

## 🎯 Objetivos

- Diseñar una taxonomía de labels por familias
- Distinguir milestone, iteración e issue type
- Descomponer un épico con sub-issues
- Automatizar el etiquetado sin convertirlo en burocracia

## 1. Qué problema resuelve

Con 200 issues, la única forma de responder "¿qué hay pendiente de decidir en el
área de pagos y es urgente?" es que cada issue lleve esa información en labels
consistentes. Sin taxonomía, la respuesta es leerlos todos.

## 2. Familias de labels

El truco es **prefijar por familia**. Al escribir `prio:` en el filtro, GitHub te
ofrece solo las de prioridad.

| Familia | Prefijo | Ejemplos | Cuántas |
|---------|---------|----------|:-------:|
| Tipo | `type:` | `bug`, `feature`, `docs`, `chore` | 4-6 |
| Área | `area:` | `prestamos`, `socios`, `api`, `ci` | 3-8 |
| Prioridad | `prio:` | `alta`, `media`, `baja` | 3 |
| Estado | `status:` | `triage`, `bloqueado`, `en-revision` | 3-5 |
| Comunidad | — | `good first issue`, `help wanted` | 2 |

**Regla de oro**: una label de cada familia por issue, como mucho. Si un issue
lleva `type:bug` y `type:feature`, son dos issues.

### Colores con criterio

El color es información, no decoración. Un esquema que funciona:

| Familia | Color | Hex |
|---------|-------|-----|
| Tipo | Azul | `#1D76DB` |
| Área | Morado | `#5319E7` |
| Prioridad alta | Rojo | `#B60205` |
| Prioridad media | Naranja | `#D93F0B` |
| Prioridad baja | Amarillo | `#FBCA04` |
| Estado | Gris | `#BFDADC` |
| Comunidad | Verde | `#0E8A16` |

Una label **sin descripción** es una label que cada uno interpreta a su manera.
Descríbelas todas.

## 3. Crear labels en bloque

```bash
gh label create "type:bug"    --color B60205 --description "Algo no funciona como debería"
gh label create "type:feature" --color 1D76DB --description "Funcionalidad nueva"
gh label create "prio:alta"   --color B60205 --description "Bloquea o afecta a usuarios ahora"
gh label list --limit 50
```

Borrar las de fábrica que no vas a usar:

```bash
gh label delete "duplicate" --yes
gh label delete "wontfix" --yes
```

Clonar la taxonomía a otro repositorio:

```bash
gh label clone OWNER/REPO-ORIGEN
```

## 4. Milestone, iteración y type

Tres cosas distintas que la gente confunde:

| | Milestone | Iteración (Projects) | Type |
|---|---|---|---|
| Vive en | El repositorio | Un Project v2 | La organización |
| Responde a | ¿En qué entrega? | ¿En qué sprint? | ¿Qué clase de trabajo es? |
| Tiene fecha | Sí, una | Sí, recurrente | No |
| Cuántos por issue | Uno | Uno | Uno |
| Progreso | Barra automática | Vistas y métricas | — |

- **Milestone** para versiones y entregas: `v1.0`, `MVP`.
- **Iteración** para sprints (Semana 04).
- **Type** (`Bug`, `Feature`, `Task`) para clasificar de forma homogénea entre
  todos los repositorios de una organización, sin depender de labels.

```bash
gh api repos/{owner}/{repo}/milestones --method POST \
  -f title="v1.0 — Reglas de negocio" \
  -f due_on="2026-12-31T23:59:59Z" \
  -f description="Primera versión utilizable"
```

## 5. Sub-issues

Un épico se parte en sub-issues, no en una lista de tareas. Cada sub-issue es un
issue completo: se asigna, se etiqueta, se cierra por su cuenta, y aparece en el
Project.

El padre muestra el progreso automáticamente (`3 de 7 completados`).

Cuándo partir:

- El trabajo lo van a hacer **personas distintas** → sub-issues
- Va a durar **más de una iteración** → sub-issues
- Son pasos tuyos de la misma tarea → tasklist en el cuerpo

> [!NOTE]
> Las sub-issues solo se consultan por **GraphQL**; la API REST no las expone.
> Lo veremos en la Semana 15.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| 40 labels sin familias | Nadie recuerda cuál usar | Prefijos y máximo ~20 |
| Labels sin descripción | Cada uno interpreta distinto | Descríbelas todas |
| Prioridad en todos los issues = alta | La prioridad deja de significar nada | Como mucho un 20% en alta |
| Labels de estado que duplican el Project | Dos fuentes de verdad que se contradicen | El estado vive en el Project |
| Milestone sin fecha | No crea urgencia ni sirve para planificar | Siempre con fecha |
| Milestones eternos que se van moviendo | Deja de significar entrega | Cierra y crea otro |
| Épico gigante sin partir | No se puede repartir ni estimar | Sub-issues |

## 7. Trucos

- **Etiquetar por lote**:
  ```bash
  gh issue list --search "no:label" --json number --jq '.[].number' \
    | xargs -I{} gh issue edit {} --add-label "status:triage"
  ```
- **Ver el reparto de labels de un vistazo**:
  ```bash
  gh issue list --state all --json labels \
    --jq '[.[].labels[].name] | group_by(.) | map({label: .[0], n: length}) | sort_by(-.n)'
  ```
- **Progreso de un milestone por API**:
  ```bash
  gh api repos/{owner}/{repo}/milestones --jq '.[] | "\(.title): \(.closed_issues)/\(.open_issues + .closed_issues)"'
  ```
- **`good first issue` no es decorativo**: GitHub lo usa para recomendar tu repo
  a gente que busca su primera contribución. Es tráfico gratis
- **Renombrar una label**: `gh label edit "bug" --name "type:bug"` — se aplica a
  todos los issues que ya la tienen
- **Filtrar por familia en la UI**: escribe `label:prio:` en la búsqueda y el
  autocompletado hace el resto

## 📚 Recursos Adicionales

- [GitHub Docs — Managing labels](https://docs.github.com/issues/using-labels-and-milestones-to-track-work/managing-labels)
- [GitHub Docs — About milestones](https://docs.github.com/issues/using-labels-and-milestones-to-track-work/about-milestones)
- [GitHub Docs — Issue types](https://docs.github.com/issues/tracking-your-work-with-issues/configuring-issues/managing-issue-types-in-an-organization)

## ✅ Checklist de Verificación

- [ ] Tus labels usan prefijos de familia y todas tienen descripción
- [ ] Ningún issue lleva dos labels de la misma familia
- [ ] Tienes un milestone con fecha y varios issues asignados
- [ ] Has partido al menos un épico en sub-issues
