# Automatización con Actions

> El objetivo no es automatizarlo todo: es que nadie tenga que acordarse de
> mantener el tablero.

## 🎯 Objetivos

- Usar `actions/add-to-project` con la credencial correcta
- Escribir un workflow que ejecute GraphQL propio
- Decidir qué automatizar y qué dejar en manos de una persona
- Reconocer los fallos silenciosos de la automatización de projects

## 1. Qué problema resuelve

Los workflows integrados de la Semana 04 cubren el ciclo básico, pero no pueden
escribir en campos distintos de `Status`. En cuanto quieras que la prioridad del
issue llegue al tablero, o que un item se mueva al cerrarse un PR de otro repo,
hace falta Actions.

## 2. Anatomía mínima de un workflow

Lo justo para esta semana (el detalle, en las semanas 09-11):

```yaml
name: Añadir al project

on:
  issues:
    types: [opened, reopened]

permissions:
  contents: read

jobs:
  add:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/add-to-project@5afcf98fcd03f1c2f92c3c83f58ae24323cc57fd # v2.0.0
        with:
          project-url: https://github.com/users/<tu-usuario>/projects/<n>
          github-token: ${{ secrets.PROJECT_TOKEN }}
```

| Parte | Qué hace |
|-------|----------|
| `on:` | Cuándo se dispara |
| `permissions:` | Qué puede hacer `GITHUB_TOKEN`. Se declara siempre |
| `jobs:` | Trabajos, cada uno en una máquina limpia |
| `steps:` | Pasos: `uses:` invoca una action, `run:` ejecuta comandos |
| `secrets.X` | Secreto del repositorio |

## 3. La credencial, en una línea

`actions/add-to-project` y cualquier mutación de project **fallan con
`GITHUB_TOKEN`**: hace falta un PAT fine-grained con `Projects: Read and write` o
un token de GitHub App. El porqué, el montaje y el diagnóstico de cada error
están en la [Teoría 02](02-credenciales-para-projects.md).

## 4. `actions/add-to-project`

La action oficial. Sabe filtrar sin que escribas lógica:

```yaml
      - uses: actions/add-to-project@5afcf98fcd03f1c2f92c3c83f58ae24323cc57fd # v2.0.0
        with:
          project-url: https://github.com/users/<tu-usuario>/projects/<n>
          github-token: ${{ secrets.PROJECT_TOKEN }}
          labeled: bug, prio:alta      # solo si tiene alguna de estas labels
          label-operator: OR           # OR (por defecto), AND o NOT
```

Cubre "que entre en el tablero". Para rellenar campos hace falta GraphQL propio.

| Entrada | Para qué |
|---------|----------|
| `project-url` | El project destino (usuario u organización) |
| `github-token` | La credencial: PAT o token de App |
| `labeled` | Lista de labels que filtran qué entra |
| `label-operator` | `OR` (por defecto), `AND` o `NOT` |

Y una salida que se aprovecha poco: `itemId`, el ID del item recién creado, que
es justo lo que necesita la mutación del paso siguiente.

```yaml
      - uses: actions/add-to-project@5afcf98fcd03f1c2f92c3c83f58ae24323cc57fd # v2.0.0
        id: add
        with: { ... }
      - run: echo "El item es ${{ steps.add.outputs.itemId }}"
```

### Qué eventos disparan qué

| Evento | Uso típico |
|--------|------------|
| `issues: [opened, reopened]` | Meter el issue en el tablero |
| `issues: [labeled]` | Reaccionar a una clasificación posterior |
| `pull_request: [opened, ready_for_review]` | Meter PRs en el tablero |
| `schedule:` | Informes y limpiezas periódicas |
| `workflow_dispatch:` | Lanzarlo a mano para probar |

`issues: [labeled]` es el que suele faltar: el `Auto-add` integrado y el evento
`opened` solo ven el issue **al crearse**, así que lo que se etiqueta después no
entra nunca.

## 5. GraphQL dentro de un workflow

```yaml
      - name: Poner prioridad alta en el project
        env:
          GH_TOKEN: ${{ secrets.PROJECT_TOKEN }}
          PROJECT_ID: ${{ vars.PROJECT_ID }}
          FIELD_ID: ${{ vars.PRIORITY_FIELD_ID }}
          OPTION_ID: ${{ vars.PRIORITY_ALTA_ID }}
          ITEM_ID: ${{ steps.add.outputs.itemId }}
        run: |
          gh api graphql -F project="$PROJECT_ID" -F item="$ITEM_ID" \
            -F field="$FIELD_ID" -F option="$OPTION_ID" -f query='
            mutation($project: ID!, $item: ID!, $field: ID!, $option: String!) {
              updateProjectV2ItemFieldValue(input: {
                projectId: $project, itemId: $item,
                fieldId: $field, value: { singleSelectOptionId: $option }
              }) { projectV2Item { id } }
            }'
```

`gh` está preinstalado en los runners y usa `GH_TOKEN` del entorno. Los IDs van
en **variables** del repositorio (`vars`), no en secretos: no son sensibles.

```bash
gh variable set PROJECT_ID --body "PVT_kwHOA..."
```

## 6. Qué automatizar y qué no

| Automatiza | Deja a una persona |
|------------|--------------------|
| Añadir al project | Decidir la prioridad |
| Estado inicial `Backlog` | Decidir la iteración |
| Mover a `Hecho` al cerrar | Decidir si algo se descarta |
| Etiquetar por ruta modificada | Decidir el tamaño |
| Informes y recuentos | Interpretar lo que dicen |

La regla: automatiza lo que **siempre** se hace igual. Si hay un caso en el que
harías otra cosa, no lo automatices — acabarías deshaciendo la automatización a
mano, que es peor que no tenerla.

## 7. Los fallos silenciosos

La automatización de projects falla de formas discretas:

| Fallo | Síntoma | Detección |
|-------|---------|-----------|
| PAT caducado | El tablero deja de llenarse | Alerta en el calendario + revisar `gh run list` |
| Workflow desactivado por inactividad | Los `schedule:` dejan de correr a los 60 días sin commits | Un commit periódico, o revisarlo |
| ID de campo obsoleto | La mutación "funciona" sin efecto | Verificar tras mutar |
| Filtro de `labeled:` mal escrito | No entra nada, sin error | Prueba con un issue de verdad |

> [!NOTE]
> Los workflows con `schedule:` se **desactivan automáticamente** tras 60 días
> sin actividad en el repositorio. Es la causa más común de "mi informe semanal
> dejó de llegar".

## 8. Higiene del workflow

Tres líneas que no cuestan nada y evitan la mayoría de sustos, y que se
justifican a fondo en las Semanas 09-11:

```yaml
permissions: {}                 # y añade solo lo que falle
concurrency:
  group: ${{ github.workflow }}-${{ github.event.issue.number }}
  cancel-in-progress: true
jobs:
  add:
    timeout-minutes: 5
```

Y la versión de las actions de terceros **fijada por SHA**: un tag se puede
mover, un commit no. El SHA se saca del propio repositorio de la action:

```bash
gh api repos/actions/add-to-project/tags --jq '.[] | select(.name=="v2.0.0") | .commit.sha'
```

```yaml
      - uses: actions/add-to-project@5afcf98fcd03f1c2f92c3c83f58ae24323cc57fd # v2.0.0
```

## 9. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `GITHUB_TOKEN` para projects | Falla con un error confuso | PAT fine-grained o GitHub App |
| PAT sin caducidad "para que no falle" | Secreto eterno en un repo público | Caducidad y recordatorio |
| Automatizar la prioridad | Sustituye criterio por reglas ciegas | Automatiza lo mecánico |
| Workflow sin `permissions` | Permisos por defecto, más de los necesarios | Decláralos siempre |
| Action sin versión fija (`@main`) | Un cambio de terceros rompe tu tablero | Tag o SHA (Semana 11) |
| No comprobar `gh run list` | Los fallos pasan desapercibidos semanas | Revísalo al empezar cada semana |

## 10. Trucos

- **Ver si tus workflows están corriendo**: `gh run list --limit 10`
- **Relanzar solo lo que falló**: `gh run rerun <id> --failed`
- **Depurar sin esperar al evento**: añade `workflow_dispatch:` al `on:` y
  lánzalo con `gh workflow run <archivo>`
- **Los IDs como `vars`**, no como `secrets`: se leen en los logs sin problema y
  se cambian sin rotar nada
- **`gh secret set` desde la terminal**: `gh secret set PROJECT_TOKEN` te lo pide
  por entrada estándar, sin dejarlo en el historial
- **Probar la mutación en local primero**, con tu propio token, y solo después
  llevarla al workflow

## 📚 Recursos Adicionales

- [`actions/add-to-project`](https://github.com/actions/add-to-project)
- [GitHub Docs — Automating Projects using Actions](https://docs.github.com/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions)
- [GitHub Docs — Disabling and enabling a workflow](https://docs.github.com/actions/using-workflows/disabling-and-enabling-a-workflow)

## ✅ Checklist de Verificación

- [ ] Tienes `PROJECT_TOKEN` como secreto, con caducidad apuntada
- [ ] Un issue nuevo entra solo en el tablero
- [ ] Sabes por qué `GITHUB_TOKEN` no sirve aquí
- [ ] Sabes qué le pasa a un `schedule:` tras 60 días sin actividad
- [ ] Tus workflows declaran `permissions` y fijan las actions de terceros
