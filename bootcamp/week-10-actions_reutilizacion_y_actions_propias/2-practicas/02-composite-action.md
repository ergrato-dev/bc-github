# Práctica 02 — Tu primera composite action

> Los cinco steps que se repiten en todos tus jobs, convertidos en un `uses:`. Y
> el error de `shell` provocado a propósito, para reconocerlo cuando aparezca de
> verdad.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 03](../1-teoria/03-composite-actions.md),
[Práctica 01](01-reusable-workflow.md) completada

## Contexto

Tu `ci-reutilizable.yml` empieza con checkout, Node y la instalación de
dependencias. Cuando añadas un segundo job —lint, build, lo que sea— vas a copiar
esos tres pasos. En esta práctica se convierten en una action local que vive en
tu propio repositorio.

## Paso 1: Crear la action

**Por qué**: una composite action es un directorio con un `action.yml`. No hace
falta publicar nada ni versionar nada para usarla dentro del repositorio.

```bash
git switch -qc ci/composite-action
mkdir -p .github/actions/preparar-entorno
cp <ruta-al-bootcamp>/bootcamp/week-10-actions_reutilizacion_y_actions_propias/starter/accion-preparar-entorno/action.yml \
   .github/actions/preparar-entorno/action.yml
```

**Verifica**:

```bash
python3 -c "import yaml; d=yaml.safe_load(open('.github/actions/preparar-entorno/action.yml')); print(d['runs']['using'])"
```

Debe imprimir `composite`.

## Paso 2: Rellenar los inputs y los steps

**Por qué**: la action tiene que hacer exactamente lo que hoy hacen tus steps, ni
más ni menos. Factorizar no es rediseñar.

Descomenta el bloque **PASO 1** del starter y ajusta el gestor de paquetes al que
uses de verdad. Debe quedar algo así:

```yaml
name: Preparar entorno
description: Instala Node y las dependencias del proyecto, con caché

inputs:
  node-version:
    description: Versión de Node
    required: false
    default: "24"
  instalar:
    description: Si se ejecuta la instalación de dependencias
    required: false
    default: "true"

outputs:
  cache-hit:
    description: Si la caché de dependencias acertó
    value: ${{ steps.node.outputs.cache-hit }}

runs:
  using: composite
  steps:
    - id: node
      uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
      with:
        node-version: ${{ inputs.node-version }}
        cache: npm

    - if: ${{ inputs.instalar == 'true' }}
      shell: bash
      run: npm ci
```

**Verifica** que ningún `run:` se ha quedado sin `shell:`:

```bash
grep -A1 "run:" .github/actions/preparar-entorno/action.yml | grep -c "shell:" || true
```

## Paso 3: Provocar el error de `shell` a propósito

**Por qué**: es el fallo número uno de las composite actions, y el mensaje no
dice "te falta `shell`" de forma obvia. Verlo una vez ahorra media hora la
próxima.

Quita temporalmente la línea `shell: bash` del step de instalación y empuja:

```bash
git add .github/actions/
git commit -m "ci: composite action de preparación del entorno"
git push -u origin ci/composite-action
gh pr create --fill
gh run watch
```

**Verifica** el mensaje exacto que aparece:

```bash
gh run list --branch ci/composite-action --limit 1 --json databaseId --jq '.[0].databaseId' \
  | xargs -I{} gh run view {} --log-failed | head -20
```

Habla de que falta `shell` en el step, pero enterrado entre otras líneas.
Devuelve la línea a su sitio antes de seguir.

## Paso 4: Usarla desde el workflow reutilizable

**Por qué**: la action no sirve de nada hasta que sustituye a los steps que
copiaba.

En `ci-reutilizable.yml`, cambia los steps de Node e instalación por:

```yaml
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - id: entorno
        uses: ./.github/actions/preparar-entorno
        with:
          node-version: ${{ inputs.node-version }}
```

> [!IMPORTANT]
> El `checkout` va **antes**. Una action local no existe en el runner hasta que
> el repositorio está clonado: sin él, el error es
> `Can't find 'action.yml' … under '/home/runner/work/...'`.

**Verifica** en el log del run que los pasos de la action aparecen anidados bajo
el step `Preparar entorno`.

## Paso 5: Usar el output

**Por qué**: exponer `cache-hit` permite que quien la use decida, y de paso
demuestra que el mapeo de outputs funciona.

Añade un step después:

```yaml
      - name: Informar del estado de la caché
        shell: bash
        env:
          ACIERTO: ${{ steps.entorno.outputs.cache-hit }}
        run: |
          echo "Caché: ${ACIERTO:-desconocido}"
          echo "- Caché de dependencias: \`${ACIERTO:-desconocido}\`" >> "$GITHUB_STEP_SUMMARY"
```

**Verifica**: lanza el run **dos veces** (empuja un commit vacío) y comprueba que
la primera dice `false` y la segunda `true`.

```bash
git commit --allow-empty -m "ci: segunda ejecución para comprobar la caché"
git push
gh run watch
```

## Paso 6: Comprobar que un input opcional hace algo

**Por qué**: `instalar: false` debe saltarse la instalación. Si no cambia nada, el
`if:` está mal escrito — casi siempre por comparar contra el booleano `true` en
vez de contra la cadena `'true'`.

Añade temporalmente un job de prueba en el workflow reutilizable:

```yaml
  sin-instalar:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: ./.github/actions/preparar-entorno
        with:
          instalar: "false"
      - shell: bash
        run: test ! -d node_modules && echo "No se instaló nada, correcto"
```

**Verifica** que ese job pasa. Luego bórralo: era una comprobación, no parte del
CI.

## Paso 7: Documentar y mergear

**Por qué**: una action sin README es una action que se lee entera antes de
usarse.

````bash
cat > .github/actions/preparar-entorno/README.md <<'DOC'
# `preparar-entorno`

Instala Node y las dependencias del proyecto, con caché.

## Uso

```yaml
- uses: actions/checkout@<sha>  # imprescindible antes
- uses: ./.github/actions/preparar-entorno
  with:
    node-version: "24"
```

| Input | Obligatorio | Por defecto | Qué hace |
|-------|:-----------:|-------------|----------|
| `node-version` | no | `24` | Versión de Node |
| `instalar` | no | `true` | Si ejecuta la instalación de dependencias |

| Output | Qué devuelve |
|--------|--------------|
| `cache-hit` | `true` si la caché de dependencias acertó |
DOC

git add .github/actions/
git commit -m "docs: documenta la action preparar-entorno"
git push
gh pr merge --squash --delete-branch
````

**Verifica**:

```bash
./scripts/verificar-semana.sh 10 --repo <tu-usuario>/<tu-repo>
```

## 🧭 Qué llevarte

- Una composite action corre **dentro** del job de quien la llama
- `shell:` es obligatorio en todo `run:`, y el error no lo dice claro
- Los inputs son cadenas: se comparan con `== 'true'`
- Los outputs hay que mapearlos a mano desde un step con `id:`
- Una action local necesita `checkout` antes, siempre

## ➡️ Siguiente

[Práctica 03 — Una action en JavaScript](03-action-en-javascript.md)
