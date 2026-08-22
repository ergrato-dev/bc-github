# Práctica 02 — El tablero se llena solo

> Cada issue nuevo entra en el project sin que nadie lo arrastre, con su estado
> inicial puesto.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 02](../1-teoria/02-credenciales-para-projects.md) y [03](../1-teoria/03-automatizacion-con-actions.md), práctica 01

## Contexto

En la Semana 04 añadiste el backlog a mano. Eso no escala: en cuanto haya
issues nuevos, el tablero empezará a mentir. Vamos a automatizarlo.

## Paso 1: Crear el PAT fine-grained

**Por qué**: `GITHUB_TOKEN` no tiene alcance sobre projects. Es **la** causa de
fallo de esta práctica.

En la web: `Settings → Developer settings → Personal access tokens →
Fine-grained tokens → Generate new token`.

| Ajuste | Valor |
|--------|-------|
| Token name | `bc-github-projects` |
| Expiration | 90 días — **apunta la fecha** |
| Resource owner | Tu usuario |
| Repository access | Only select repositories → tu repo |
| Repository permissions | `Issues: Read`, `Metadata: Read` |
| Account permissions | **`Projects: Read and write`** |

> [!IMPORTANT]
> El permiso de Projects está en **Account permissions**, no en Repository
> permissions: los projects son de la cuenta, no del repositorio. Ese es el
> apartado que todo el mundo se salta.

**Verifica**: copia el token. Solo se muestra una vez.

## Paso 2: Guardarlo como secreto

**Por qué**: en el workflow nunca va el valor, solo la referencia.

```bash
cd <tu-repo>
gh secret set PROJECT_TOKEN
# pega el token cuando lo pida (no queda en el historial del shell)

gh secret list
```

**Verifica**: `PROJECT_TOKEN` aparece en la lista, sin su valor.

## Paso 3: Guardar los IDs como variables

**Por qué**: los IDs no son secretos. Como variables se leen en los logs, se
depuran y se cambian sin rotar nada.

```bash
gh variable set PROJECT_ID --body "<PVT_...>"
gh variable set PRIORITY_FIELD_ID --body "<PVTSSF_...>"
gh variable set PRIORITY_ALTA_ID --body "<id-opcion-alta>"
gh variable list
```

**Verifica**: las tres variables con sus valores visibles.

## Paso 4: El workflow

**Por qué**: `actions/add-to-project` resuelve el caso general sin escribir
lógica.

```bash
mkdir -p .github/workflows
cat > .github/workflows/project-automation.yml <<'YAML'
name: Automatización del project

on:
  issues:
    types: [opened, reopened]
  pull_request:
    types: [opened, reopened]

permissions:
  contents: read

jobs:
  add-to-project:
    runs-on: ubuntu-latest
    steps:
      - name: Añadir al project
        uses: actions/add-to-project@5afcf98fcd03f1c2f92c3c83f58ae24323cc57fd # v2.0.0
        with:
          project-url: https://github.com/users/<tu-usuario>/projects/<numero>
          github-token: ${{ secrets.PROJECT_TOKEN }}
YAML

git add .github/workflows/project-automation.yml
git commit -qm "feat: añade automáticamente issues y PRs al project"
git push -q
```

**Verifica**:

```bash
gh workflow list
```

## Paso 5: Probarlo

**Por qué**: un workflow que no se ha visto correr no está terminado.

```bash
gh issue create --title "Prueba de automatización del tablero" \
  --body "Debe aparecer solo en el project."

gh run list --limit 3
gh run watch
```

**Verifica**:

```bash
gh project item-list <numero> --owner @me --format json \
  --jq '[.items[] | select(.content.title | contains("Prueba de automatización"))] | length'
# 1
```

## Paso 6: Filtrar por label

**Por qué**: no todo tiene por qué entrar al tablero. El ruido también se
automatiza.

Añade al paso del workflow:

```yaml
        with:
          project-url: https://github.com/users/<tu-usuario>/projects/<numero>
          github-token: ${{ secrets.PROJECT_TOKEN }}
          labeled: type:bug, type:feature
          label-operator: OR
```

> [!NOTE]
> El evento `opened` se dispara **antes** de que se apliquen labels manuales. Si
> las labels las pone el issue form (como en la Semana 03), llegan a tiempo; si
> las pones tú después, añade `types: [labeled]` al disparador.

```bash
git commit -qam "feat: filtra qué issues entran al project por label"
git push -q
```

**Verifica**: crea un issue sin esas labels y comprueba que **no** entra.

## Paso 7: Poner el estado inicial

**Por qué**: un item sin `Status` no aparece en ninguna columna del tablero.

Esto lo resuelve mejor el **workflow integrado** de la Semana 04 (`Item added to
project → Status = Backlog`) que un paso de Actions. Compruébalo:

`Project → ··· → Workflows → Item added to project → Status: Backlog → Enable`

**Verifica**: crea otro issue y comprueba que llega al tablero **con** estado.

## Paso 8: Anotar la caducidad del token

**Por qué**: el día que el PAT caduque, el tablero dejará de llenarse sin avisar.

```bash
gh issue create --title "Rotar PROJECT_TOKEN antes del <fecha>" \
  --body "El PAT fine-grained de la automatización del project caduca el <fecha>.

Al rotarlo:
1. Generar uno nuevo con los mismos permisos (Projects: Read and write)
2. \`gh secret set PROJECT_TOKEN\`
3. Verificar con un issue de prueba" \
  --label "type:chore"
```

**Verifica**: el issue existe. Es la forma más barata de recordatorio.

## ✅ Resultado

- [ ] PAT fine-grained con `Projects: Read and write`, con caducidad
- [ ] `PROJECT_TOKEN` como secreto y tres IDs como variables
- [ ] Workflow que añade issues y PRs al project
- [ ] Filtrado por label funcionando
- [ ] Workflow integrado poniendo el estado inicial
- [ ] Issue recordatorio de rotación del token

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `Resource not accessible by integration` | Se está usando `GITHUB_TOKEN` | Usa `secrets.PROJECT_TOKEN` |
| `Could not resolve to a ProjectV2` | Falta `Projects: Read and write` en **Account permissions** | Regenera el token con ese permiso |
| El workflow no se dispara | El archivo no está en la rama por defecto | Haz push a `main` |
| Entra todo pese al filtro | Las labels llegan después del evento | Añade `types: [labeled]` |
| El item aparece sin estado | Falta el workflow integrado `Item added` | Actívalo en el project |
| `gh run list` vacío | Actions desactivado en el repositorio | `Settings → Actions → Allow all actions` |
