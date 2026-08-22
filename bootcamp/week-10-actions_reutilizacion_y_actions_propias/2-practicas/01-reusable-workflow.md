# Práctica 01 — Extraer el CI a un reusable workflow

> El `ci.yml` de la Semana 09 pasa a ser dos archivos: uno que dice **qué** se
> ejecuta y otro que dice **cuándo**. Y por el camino aparece el efecto
> secundario que rompe el ruleset.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 02](../1-teoria/02-reusable-workflows.md), el
`ci.yml` de la Semana 09 funcionando y en verde

## Contexto

Tu CI funciona, pero está soldado a un repositorio: los `on:`, los jobs y los
pasos viven en el mismo archivo. En esta práctica lo separas en un workflow
**invocable** con parámetros, que es la forma en que se comparte un pipeline
entre proyectos.

## Paso 1: Rama y punto de partida

**Por qué**: todo entra por PR desde la Semana 08, y esta práctica tiene que
verse fallar antes de verse pasar.

```bash
git switch -qc ci/reusable-workflow
cp <ruta-al-bootcamp>/bootcamp/week-10-actions_reutilizacion_y_actions_propias/starter/ci-reutilizable.yml \
   .github/workflows/ci-reutilizable.yml
```

**Verifica**:

```bash
ls -1 .github/workflows/
```

Deben aparecer `ci.yml` (el de la Semana 09) y `ci-reutilizable.yml` (el nuevo).

## Paso 2: Convertir el CI en invocable

**Por qué**: un workflow es invocable cuando declara `on: workflow_call`. Todo lo
demás —jobs, steps, matriz— se queda igual.

En `ci-reutilizable.yml`, descomenta el bloque **PASO 1** (los `inputs`) y copia
dentro los jobs de tu `ci.yml` actual, sustituyendo la versión fija de Node por
el input:

```yaml
on:
  workflow_call:
    inputs:
      node-version:
        description: Versión de Node con la que ejecutar los tests
        type: string
        required: false
        default: "24"
```

```yaml
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: ${{ inputs.node-version }}
```

**Verifica** que el YAML sigue siendo válido antes de empujar nada:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci-reutilizable.yml')); print('YAML válido')"
```

## Paso 3: Dejar `ci.yml` como llamador

**Por qué**: el archivo que escucha los eventos deja de tener lógica. Solo dice
qué se llama y con qué parámetros.

`ci.yml` completo queda así de corto:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  ci:
    uses: ./.github/workflows/ci-reutilizable.yml
    with:
      node-version: "24"
```

> [!IMPORTANT]
> El job que llama **no lleva `runs-on:` ni `steps:`**. Si los dejas por
> costumbre, el error que devuelve GitHub habla de claves no válidas y no señala
> la línea evidente.

**Verifica**:

```bash
grep -c "runs-on" .github/workflows/ci.yml     # debe ser 0
```

## Paso 4: Verlo fallar por el ruleset

**Por qué**: este es el aprendizaje real de la práctica. Al anidar el workflow,
**los nombres de los checks cambian**, y el ruleset de la Semana 08 exige un
nombre que ya no existe.

```bash
git add .github/workflows/
git commit -m "ci: extrae el pipeline a un workflow reutilizable"
git push -u origin ci/reusable-workflow
gh pr create --fill
gh pr checks --watch
```

**Verifica** cómo se llaman ahora los checks:

```bash
gh pr checks --json name,state --jq '.[] | "\(.state)\t\(.name)"'
```

Verás nombres compuestos del tipo `ci / test (24)`: el job del llamador, una
barra, y el job del workflow llamado. Si tu ruleset exigía `test (24)`, el PR se
queda esperando un check que ya no existe.

```bash
gh api repos/{owner}/{repo}/rules/branches/main \
  --jq '.[] | select(.type=="required_status_checks") | .parameters.required_status_checks[].context'
```

## Paso 5: Recuperar el nombre estable

**Por qué**: la solución no es cambiar el ruleset cada vez que reorganices los
workflows. Es tener un check cuyo nombre **no dependa** de la estructura interna,
igual que en la Semana 09.

Añade al final de `ci.yml` el job agregador:

```yaml
  CI:
    if: ${{ always() }}
    needs: [ci]
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Comprobar el resultado del pipeline
        env:
          RESULTADO: ${{ needs.ci.result }}
        run: |
          echo "Resultado del workflow reutilizable: $RESULTADO"
          [ "$RESULTADO" = "success" ] || exit 1
```

> [!WARNING]
> El `if: always()` es imprescindible para que el agregador corra aunque el
> pipeline falle — y por eso mismo **tiene que comprobar el resultado a mano**.
> Sin la comprobación de `needs.ci.result`, el check sale en verde con el CI en
> rojo: el fallo silencioso más caro de estas dos semanas.

```bash
git commit -am "ci: añade job agregador con nombre estable"
git push
gh pr checks --watch
```

**Verifica** que el check `CI` existe y está en verde:

```bash
gh pr checks --json name,state --jq '.[] | select(.name=="CI")'
```

## Paso 6: Añadir un output y consumirlo

**Por qué**: un reusable workflow que solo ejecuta cosas es la mitad; devolver
datos al llamador es lo que permite encadenar.

En `ci-reutilizable.yml`, descomenta el bloque **PASO 2** (el `outputs:` del
`workflow_call` y el del job). En `ci.yml`, léelo desde el agregador:

```yaml
        env:
          RESULTADO: ${{ needs.ci.result }}
          COBERTURA: ${{ needs.ci.outputs.cobertura }}
        run: |
          echo "Resultado: $RESULTADO — cobertura declarada: ${COBERTURA:-sin dato}"
          [ "$RESULTADO" = "success" ] || exit 1
```

**Verifica** en el log del job `CI` que la cobertura aparece con un valor.

## Paso 7: Comprobar que el input hace algo

**Por qué**: un parámetro que nadie cambia nunca no es un parámetro.

```bash
gh workflow run ci.yml --ref ci/reusable-workflow 2>/dev/null || true
```

Cambia temporalmente el `with: node-version:` a `"22"`, empuja, y comprueba en el
log del step de Node que la versión instalada es la otra:

```bash
gh run list --branch ci/reusable-workflow --limit 1 --json databaseId --jq '.[0].databaseId' \
  | xargs -I{} gh run view {} --log | grep -m1 -i "node.*v2"
```

Deja el valor que quieras como definitivo antes de mergear.

## Paso 8: Mergear y verificar

```bash
gh pr merge --squash --delete-branch
./scripts/verificar-semana.sh 10 --repo <tu-usuario>/<tu-repo>
```

**Verifica** que estas dos comprobaciones pasan:

- `Existe .github/workflows/ci-reutilizable.yml con workflow_call`
- `ci.yml llama al workflow reutilizable`

## 🧭 Qué llevarte

- Un reusable workflow es un job con `uses:` en vez de `steps:`
- Anidar cambia los nombres de los checks: `llamador / job (matriz)`
- Un check requerido tiene que tener nombre estable, y el agregador debe
  comprobar `needs.<job>.result` a mano
- Los `inputs` con `default` son lo que hace que otro repositorio lo adopte sin
  leerse el archivo

## ➡️ Siguiente

[Práctica 02 — Tu primera composite action](02-composite-action.md)
