# Práctica 02 — Validar títulos de PR

> Con squash merge, el título del PR **es** el commit que llega a `main`. Si
> solo validas los commits locales, estás validando lo que no cuenta.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 03](../1-teoria/03-validar-la-convencion.md), práctica 01, estrategia de merge de la Semana 06

## Contexto

Tu repositorio usa squash. El hook de la práctica anterior valida tus commits
locales, pero todos ellos se funden en uno cuyo mensaje sale del **título del
PR**. Vamos a validarlo en CI.

## Paso 1: Confirmar que te afecta

**Por qué**: si usas merge commit o rebase, esta práctica cambia de foco.

```bash
cd <tu-repo>
gh api repos/{owner}/{repo} --jq '{squash: .allow_squash_merge, titulo: .squash_merge_commit_title}'
```

**Verifica**: `squash: true`. Si `titulo` no es `PR_TITLE`, arréglalo:

```bash
gh repo edit --squash-merge-commit-message pr-title-description
```

## Paso 2: El workflow de validación

**Por qué**: sin dependencias externas, con la misma regex del hook. Una sola
fuente de verdad.

```bash
mkdir -p .github/workflows
cat > .github/workflows/validar-pr.yml <<'YAML'
name: Validar PR

on:
  pull_request:
    types: [opened, edited, reopened, synchronize]

permissions:
  contents: read

jobs:
  titulo:
    name: Título convencional
    runs-on: ubuntu-latest
    steps:
      - name: Comprobar el formato del título
        env:
          TITULO: ${{ github.event.pull_request.title }}
        run: |
          regex='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .{1,72}$'
          if printf '%s' "$TITULO" | grep -qE "$regex"; then
            echo "✅ Título correcto: $TITULO"
          else
            echo "❌ El título del PR no sigue Conventional Commits."
            echo ""
            echo "   Recibido: $TITULO"
            echo "   Formato:  tipo(scope): descripción"
            echo "   Tipos:    feat fix docs style refactor perf test build ci chore revert"
            echo ""
            echo "   Con squash merge, este título es el mensaje del commit en main."
            exit 1
          fi
YAML
```

> [!NOTE]
> El título va por variable de entorno (`env: TITULO:`), no interpolado dentro
> del `run:`. Interpolar texto que escribe un usuario directamente en un script
> permite inyectar comandos — es uno de los antipatrones que se estudian a fondo
> en la Semana 11.

**Verifica**:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/validar-pr.yml')); print('YAML válido')"
```

## Paso 3: Probarlo con un título malo

**Por qué**: hay que ver el check en rojo antes de fiarse de él.

```bash
git add .github/workflows/validar-pr.yml
git commit -qm "ci: valida que el título del PR siga la convención"
git push -qu origin HEAD 2>/dev/null || git checkout -b ci/validar-titulos && git push -qu origin HEAD

gh pr create --title "cambios varios" --body "Título a propósito incorrecto para probar el check."
gh pr checks --watch
```

**Verifica**: el check falla, y el log explica por qué.

```bash
gh run view --log-failed | tail -12
```

## Paso 4: Arreglar el título

**Por qué**: el evento `edited` vuelve a disparar el workflow. Sin él, cambiar el
título no revalidaría nada.

```bash
gh pr edit --title "ci: valida el título del PR contra Conventional Commits"
sleep 5
gh pr checks --watch
```

**Verifica**: el check pasa a verde sin haber tocado ni un commit.

## Paso 5: Añadir la comprobación de tamaño

**Por qué**: el tamaño del PR es la variable que más afecta a la calidad de la
revisión. Un aviso automático funciona mejor que un acuerdo olvidado.

Añade un job al mismo workflow:

```yaml
  tamano:
    name: Tamaño razonable
    runs-on: ubuntu-latest
    steps:
      - name: Avisar si el PR es grande
        env:
          ADD: ${{ github.event.pull_request.additions }}
          DEL: ${{ github.event.pull_request.deletions }}
        run: |
          TOTAL=$((ADD + DEL))
          echo "Líneas cambiadas: $TOTAL"
          if [ "$TOTAL" -gt 400 ]; then
            echo "::warning::PR de $TOTAL líneas. Por encima de 400 la revisión pierde calidad — considera dividirlo."
          fi
```

```bash
git add .github/workflows/validar-pr.yml
git commit -qm "ci: avisa cuando un PR supera las 400 líneas"
git push -q
gh pr checks --watch
```

**Verifica**: el job pasa. Si tu PR supera 400 líneas, aparece un aviso en la
pestaña de checks (`::warning::` no falla el job, solo avisa).

## Paso 6: Mergear y comprobar el commit resultante

**Por qué**: es la demostración de por qué existía esta práctica.

```bash
gh pr merge --squash --delete-branch
git switch main && git pull -q
git log -1 --format='%s'
```

**Verifica**: el mensaje del commit en `main` es **el título del PR**, ya
validado.

## Paso 7: Documentarlo

```bash
cat >> CONTRIBUTING.md <<'EOF'

### Título del PR

Con squash merge, el título del PR se convierte en el mensaje del commit en
`main`. Por eso se valida automáticamente contra Conventional Commits en cada
PR (`.github/workflows/validar-pr.yml`).

Si el check falla, edita el título del PR: se revalida solo.
EOF

git add CONTRIBUTING.md
git commit -qm "docs: explica la validación del título del PR"
git push -q
```

## ✅ Resultado

- [ ] `.github/workflows/validar-pr.yml` en el repositorio
- [ ] El check falla con un título incorrecto y explica por qué
- [ ] Editar el título revalida sin nuevos commits
- [ ] Aviso automático cuando el PR supera 400 líneas
- [ ] El título va por `env:`, no interpolado en el script
- [ ] Documentado en `CONTRIBUTING.md`

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| El workflow no corre | Falta el tipo `edited` en `on: pull_request` | Añádelo |
| Pasa cualquier título | La regex no llega al script | Comprueba con `echo "$TITULO"` |
| `additions` viene vacío | Ese campo solo existe en eventos de `pull_request` | Revisa el evento |
| El aviso no se ve | `::warning::` no falla el job | Está en el resumen del run |
| El check no aparece en el PR | El workflow no está en la rama base | Mergea primero a `main` |
| Falla con títulos con acentos | La regex usa `.` — acepta cualquier carácter | Revisa que no hayas cambiado el patrón |
