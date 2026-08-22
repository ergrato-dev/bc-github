# Práctica 03 — Una action en JavaScript

> Una action que lee el evento, decide y llama a la API: etiqueta cada PR según
> cuántas líneas cambia. Sin dependencias, sin empaquetador, sin `node_modules`.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 04](../1-teoria/04-actions-en-javascript.md),
[Práctica 02](02-composite-action.md) completada, Node 24 en local

## Contexto

La Semana 06 dejó claro que el tamaño de un PR predice cuánto tarda en
revisarse. Esta práctica automatiza la medición: cada PR recibe una label
`tamano:s`, `tamano:m`, `tamano:l` o `tamano:xl`, puesta por código tuyo.

Es una action de JavaScript **sin dependencias**: usa `fetch` y el sistema de
archivos del runner, así que no hay que empaquetar nada.

## Paso 1: Las labels

**Por qué**: una action que aplica labels inexistentes falla con un 404 poco
descriptivo. Las labels primero.

```bash
git switch -qc ci/action-tamano-pr

for par in "s:0e8a16:Menos de 30 líneas" \
           "m:fbca04:Entre 30 y 100 líneas" \
           "l:d93f0b:Entre 100 y 400 líneas" \
           "xl:b60205:Más de 400 líneas — divídelo"; do
  nombre="tamano:${par%%:*}"; resto="${par#*:}"
  gh label create "$nombre" --color "${resto%%:*}" --description "${resto#*:}" --force
done

gh label list --search "tamano" --limit 10
```

**Verifica**: las cuatro labels aparecen listadas.

## Paso 2: Copiar el esqueleto

**Por qué**: el starter trae el `action.yml` y la lógica separada de la parte que
habla con GitHub, que es lo que la hace testeable.

```bash
mkdir -p acciones/tamano-pr/src acciones/tamano-pr/test
cp -r <ruta-al-bootcamp>/bootcamp/week-10-actions_reutilizacion_y_actions_propias/starter/accion-tamano-pr/. \
      acciones/tamano-pr/
find acciones/tamano-pr -type f | sort
```

Deberías tener `action.yml`, `src/tamano.mjs`, `src/index.mjs` y
`test/tamano.test.mjs`.

## Paso 3: Completar la lógica y probarla en local

**Por qué**: la parte que decide el tamaño no necesita GitHub para nada, así que
se prueba en dos segundos y sin abrir un PR.

Abre `src/tamano.mjs` y completa el bloque **PASO 1** con los umbrales que
quieras. Luego:

```bash
cd acciones/tamano-pr
node --test
cd -
```

**Verifica**: los tests pasan. Si fallan, el mensaje te dice qué umbral no
cuadra — arréglalo antes de seguir; depurar esto dentro de un runner cuesta
veinte veces más.

## Paso 4: Entender el `action.yml`

**Por qué**: es el contrato. Lo que declares aquí es lo que otros tendrán que
pasarte.

```yaml
name: Etiquetar tamaño del PR
description: Añade una label según cuántas líneas cambia el pull request

inputs:
  token:
    description: Token con permiso de escritura sobre pull requests
    required: true
  umbral-grande:
    description: Líneas a partir de las cuales el PR se considera xl
    required: false
    default: "400"

outputs:
  tamano:
    description: La etiqueta aplicada

runs:
  using: node24
  main: src/index.mjs
```

**Verifica** que `runs.main` apunta a un archivo que existe:

```bash
python3 - <<'PY'
import yaml, os
d = yaml.safe_load(open("acciones/tamano-pr/action.yml"))
main = os.path.join("acciones/tamano-pr", d["runs"]["main"])
print(main, "existe" if os.path.exists(main) else "NO EXISTE")
PY
```

> [!NOTE]
> `main: src/index.mjs` funciona porque esta action **no tiene dependencias**.
> En cuanto importes `@actions/core`, el runner no instalará nada por ti y habrá
> que empaquetar en `dist/` — la [Teoría 04](../1-teoria/04-actions-en-javascript.md)
> explica el porqué.

## Paso 5: El workflow que la usa

**Por qué**: la action no se dispara sola. Y necesita un permiso que el CI no
tiene.

```yaml
# .github/workflows/etiquetar-pr.yml
name: Etiquetar PR

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write      # ← sin esto, la API responde 403

jobs:
  tamano:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - id: etiquetar
        uses: ./acciones/tamano-pr
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          umbral-grande: "400"
      - shell: bash
        env:
          TAMANO: ${{ steps.etiquetar.outputs.tamano }}
        run: echo "Este PR es de tamaño ${TAMANO:?la action no devolvió nada}"
```

**Verifica** antes de empujar:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/etiquetar-pr.yml')); print('YAML válido')"
```

## Paso 6: Verla funcionar en un PR real

```bash
git add acciones/ .github/workflows/etiquetar-pr.yml
git commit -m "feat(ci): action propia que etiqueta el tamaño del PR"
git push -u origin ci/action-tamano-pr
gh pr create --fill
gh run watch
```

**Verifica** que el PR ha recibido su label y que el output llegó:

```bash
gh pr view --json labels --jq '[.labels[].name] | map(select(startswith("tamano:")))'
gh run list --branch ci/action-tamano-pr --limit 1 --json databaseId --jq '.[0].databaseId' \
  | xargs -I{} gh run view {} --log | grep -m1 "Este PR es de tamaño"
```

## Paso 7: Provocar el 403

**Por qué**: es el error que van a tener todos los que usen tu action sin leer el
README. Verlo una vez explica por qué la [Teoría 06](../1-teoria/06-probar-y-mantener-una-action.md)
insiste en documentar los permisos.

Cambia temporalmente `pull-requests: write` por `pull-requests: read`, empuja y
mira el run:

```bash
gh run list --branch ci/action-tamano-pr --limit 1 --json databaseId --jq '.[0].databaseId' \
  | xargs -I{} gh run view {} --log-failed | grep -i "403\|Resource not accessible"
```

**Verifica** que el mensaje de error de tu action es comprensible. Si solo dice
`403`, mejóralo: quien lo lea tiene que saber qué permiso le falta.

Devuelve el permiso a `write` antes de seguir.

## Paso 8: Que el evento equivocado no rompa nada

**Por qué**: una action que falla cuando no hay PR es una action que no se puede
reutilizar en otro workflow.

```bash
gh workflow run etiquetar-pr.yml 2>&1 | head -2
```

Ese workflow no tiene `workflow_dispatch`, así que no se puede lanzar a mano — y
esa es justo la comprobación: tu `index.mjs` debe salir **en verde** si
`GITHUB_EVENT_PATH` no trae `pull_request`, no reventar. Compruébalo en local:

```bash
echo '{}' > /tmp/evento.json
GITHUB_EVENT_PATH=/tmp/evento.json GITHUB_OUTPUT=/tmp/salida.txt \
GITHUB_REPOSITORY=owner/repo INPUT_TOKEN=x \
  node acciones/tamano-pr/src/index.mjs; echo "código de salida: $?"
```

**Verifica**: código de salida `0` y un mensaje explicando que no hay PR.

## Paso 9: Mergear

```bash
gh pr merge --squash --delete-branch
./scripts/verificar-semana.sh 10 --repo <tu-usuario>/<tu-repo>
```

## 🧭 Qué llevarte

- Una action de JavaScript sin dependencias no necesita empaquetador
- Los inputs llegan como `INPUT_<NOMBRE>`; los outputs se escriben en
  `$GITHUB_OUTPUT`
- El permiso que necesita tu action es parte de su contrato: documéntalo
- La lógica separada del acceso a la API se prueba con `node --test` en segundos
- Una action robusta sale en verde cuando el evento no le aplica

## ➡️ Siguiente

[Práctica 04 — Publicar y versionar la action](04-publicar-la-action.md)
