# Labels: diseñar una taxonomía

> Una taxonomía de labels mal diseñada es peor que no tener ninguna: da la
> ilusión de orden mientras esconde el trabajo real.

## 🎯 Objetivos

- Diseñar una taxonomía por familias que siga funcionando con 200 issues
- Elegir colores y descripciones que informen
- Crear, renombrar y clonar labels desde la terminal
- Automatizar el etiquetado sin automatizar la decisión
- Saber qué **no** debe ser una label

## 1. Qué problema resuelve

Con 200 issues, la única forma de responder "¿qué hay pendiente de decidir en el
área de préstamos y es urgente?" es que cada issue lleve esa información en
labels consistentes. Sin taxonomía, la respuesta es leerlos todos.

Y hay un segundo uso, menos evidente: las labels son la entrada de casi toda la
automatización posterior. Un workflow que asigna revisores, un Project que mueve
tarjetas o un informe semanal se escriben sobre labels.

## 2. Familias

El truco es **prefijar por familia**. Al escribir `prio:` en el filtro, GitHub
ofrece solo las de prioridad, y nadie tiene que recordar la lista entera.

| Familia | Prefijo | Ejemplos | Cuántas |
|---------|---------|----------|:-------:|
| Tipo | `type:` | `bug`, `feature`, `docs`, `chore` | 4-6 |
| Área | `area:` | `prestamos`, `socios`, `api`, `ci` | 3-8 |
| Prioridad | `prio:` | `alta`, `media`, `baja` | 3 |
| Estado | `status:` | `triage`, `bloqueado`, `necesita-info` | 3-5 |
| Comunidad | — | `good first issue`, `help wanted` | 2 |

**Regla de oro**: una label de cada familia por issue, como mucho. Si un issue
lleva `type:bug` y `type:feature`, son dos issues.

Y un techo: **veinte labels** en total es mucho para un proyecto personal. Si
pasas de treinta, ya nadie las usa bien.

### Qué no debería ser una label

| Lo que parece una label | Dónde va de verdad |
|-------------------------|--------------------|
| El sprint o la iteración | Un campo de iteración en el Project (Semana 04) |
| La versión de entrega | Un milestone ([Teoría 04](04-milestones-y-tipos.md)) |
| El estado del tablero (`en curso`, `hecho`) | El campo Status del Project |
| Quién lo hace | El assignee |
| La estimación | Un campo numérico del Project |

La regla: si un dato tiene un sitio propio en la plataforma, ponerlo también como
label crea dos fuentes de verdad que se contradicen a la semana.

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
La descripción se ve al pasar el ratón y en el autocompletado: descríbelas todas,
y en la descripción escribe el criterio, no un sinónimo del nombre.

- ✅ `prio:alta` — "Bloquea a un usuario ahora mismo y no tiene alternativa"
- ❌ `prio:alta` — "Prioridad alta"

## 3. Gestionarlas desde la terminal

```bash
gh label create "type:bug"     --color B60205 --description "Algo no funciona como debería"
gh label create "type:feature" --color 1D76DB --description "Funcionalidad nueva"
gh label create "prio:alta"    --color B60205 --description "Bloquea o afecta a usuarios ahora"
gh label list --limit 50
gh label edit "bug" --name "type:bug"     # renombrar: se aplica a los issues que ya la tienen
gh label delete "duplicate" --yes
gh label clone OWNER/REPO-ORIGEN          # copiar la taxonomía a otro repositorio
```

Las labels de fábrica (`duplicate`, `wontfix`, `invalid`, `question`) son
razonables como punto de partida, pero casi siempre sobran una vez tienes
familias: `duplicate` y `wontfix` ya son estados de cierre
([Teoría 01](01-anatomia-de-un-issue.md)), no clasificaciones.

Un script idempotente para reconstruir la taxonomía en cualquier repositorio:

```bash
while IFS='|' read -r nombre color desc; do
  gh label create "$nombre" --color "$color" --description "$desc" --force
done <<'LABELS'
type:bug|B60205|Algo no funciona como debería
type:feature|1D76DB|Funcionalidad nueva
prio:alta|B60205|Bloquea a usuarios ahora mismo
LABELS
```

`--force` actualiza la label si ya existe, así que el script se puede ejecutar
las veces que haga falta.

## 4. Etiquetar sin hacerlo a mano

| Mecanismo | Qué etiqueta | Dónde se define |
|-----------|--------------|-----------------|
| Issue forms | Tipo y estado inicial | `labels:` de la plantilla ([Teoría 02](02-issue-forms-yaml.md)) |
| Etiquetado por rutas en PRs | Área, según qué archivos toca | Un workflow con `actions/labeler` (Semana 10) |
| Workflow propio | Lo que decidas: palabras clave, autor, plantilla | Semana 10 |
| Por lote, desde la CLI | Arreglar el pasado | `gh issue edit --add-label` |

Lo que **no** se automatiza: la prioridad. La prioridad es una decisión sobre el
valor y el coste, y ninguna heurística la acierta.

## 5. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| 40 labels sin familias | Nadie recuerda cuál usar | Prefijos y un techo de ~20 |
| Labels sin descripción | Cada uno interpreta distinto | Descripción con el criterio |
| Todo en `prio:alta` | La prioridad deja de significar nada | Como mucho un 20 % en alta |
| Labels de estado que duplican el Project | Dos fuentes de verdad | El estado vive en el Project |
| Una label por persona | Es lo que hace el assignee | Assignee |
| Colores al azar | Se pierde la lectura rápida de la lista | Un color por familia |
| Crear labels sobre la marcha en cada issue | Acabas con `bug`, `Bug` y `bugs` | Taxonomía cerrada, y se amplía a propósito |
| Renombrar borrando y creando | Pierdes la label en todos los issues | `gh label edit --name` |

## 6. Trucos

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
- **Encontrar labels muertas**: si una label no aparece en el reparto anterior,
  sobra
- **`good first issue` no es decorativa**: GitHub la usa para recomendar tu
  repositorio a quien busca su primera contribución. Es tráfico gratis
- **Filtrar por familia en la interfaz**: escribe `label:prio:` y el
  autocompletado hace el resto
- **Excluir en las búsquedas**: `-label:"status:bloqueado"` quita de la lista lo
  que no puedes tocar hoy
- **Migrar una taxonomía**: `gh label clone` a un repositorio nuevo y ajustas

## 📚 Recursos Adicionales

- [GitHub Docs — Managing labels](https://docs.github.com/issues/using-labels-and-milestones-to-track-work/managing-labels)
- [Manual de `gh label`](https://cli.github.com/manual/gh_label)
- [GitHub Docs — Encouraging helpful contributions](https://docs.github.com/communities/setting-up-your-project-for-healthy-contributions/encouraging-helpful-contributions-to-your-project-with-labels)

## ✅ Checklist de Verificación

- [ ] Tus labels usan prefijos de familia y todas tienen descripción
- [ ] Ningún issue lleva dos labels de la misma familia
- [ ] Has borrado las labels de fábrica que no usas
- [ ] Sabes reconstruir tu taxonomía en otro repositorio con un comando
- [ ] Ningún dato que tenga campo propio está duplicado como label
