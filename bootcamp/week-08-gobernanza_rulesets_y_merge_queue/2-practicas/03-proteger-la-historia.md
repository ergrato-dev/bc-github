# Práctica 03 — Proteger la historia (y qué hacer sin push rules)

> La regla que impide reescribir `main`, la que impide borrarla, y el sustituto
> real de las push rules cuando tu plan no las incluye.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 04](../1-teoria/04-proteger-la-historia-y-tags.md), [Práctica 02](02-checks-y-firmas-obligatorios.md)

## Contexto

Ya tienes `non_fast_forward` y `deletion` desde la Práctica 01, pero no las has
visto actuar. Y falta lo que el esqueleto de esta semana prometía como push
rules: bloquear archivos gigantes. Spoiler del Paso 4: no puedes, y hay una
salida que además te prepara la Semana 09.

## Paso 1: Ver el force push rechazado

**Por qué**: es la regla que evita el desastre más caro del repositorio — un
`push --force` a `main` que borra trabajo ajeno sin dejar rastro en la interfaz.

```bash
git switch -q main && git pull -q
git commit -q --allow-empty -m "chore: commit local que no debería llegar"
git push --force
```

Salida esperada:

```
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - Cannot force-push to this branch
```

Limpia tu copia local:

```bash
git reset --hard origin/main
```

> [!WARNING]
> `git reset --hard` descarta cambios sin guardar. Aquí solo hay un commit vacío
> de prueba. Ejecuta `git status` antes si no estás seguro.

## Paso 2: Ver el borrado rechazado

```bash
git push origin --delete main
```

Salida esperada: `GH013` otra vez, con `Cannot delete this branch`.

**Verifica**: `gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'`
sigue diciendo `main`.

## Paso 3: Añadir `required_linear_history`

**Por qué**: en la Semana 06 elegiste squash como método de merge. Esta regla
convierte esa decisión en algo que no se puede saltar: prohíbe que entre un
commit de merge en `main`.

```bash
jq '.rules += [{ "type": "required_linear_history" }]' \
  .github/rulesets/main-proteccion.json > tmp.json \
  && mv tmp.json .github/rulesets/main-proteccion.json

RULESET_ID=$(gh api repos/{owner}/{repo}/rulesets \
  --jq '.[] | select(.name=="main-proteccion") | .id')

gh api repos/{owner}/{repo}/rulesets/$RULESET_ID \
  --method PUT --input .github/rulesets/main-proteccion.json \
  --jq '[.rules[].type]'
```

> [!IMPORTANT]
> `required_linear_history` es **incompatible** con
> `allowed_merge_methods: ["merge"]`. Si en la Semana 06 elegiste merge commits,
> no añadas esta regla: elige una de las dos cosas y déjalo escrito en
> `CONTRIBUTING.md`.

**Verifica**:

```bash
gh api repos/{owner}/{repo}/rules/branches/main --jq '[.[].type]'
```

## Paso 4: Las push rules que no tienes

**Por qué**: saber qué no puedes hacer con tu plan vale tanto como saber lo que
sí, y evita una tarde buscando un botón que no existe.

Las push rules (`target: "push"`) bloquean pushes por **tamaño de archivo**,
**ruta** o **extensión**, en todo el repositorio y en toda su red de forks.

```bash
gh api repos/{owner}/{repo}/rulesets --jq '[.[] | select(.target=="push")] | length'
# 0
```

> [!NOTE]
> Las push rules requieren **GitHub Team o superior** y solo funcionan en
> repositorios **privados o internos**. Un repositorio público con plan Free —
> el caso de este bootcamp — no las tiene. Verificado en agosto de 2026:
> [Available rules for rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).

Lo que la plataforma no te da como regla, te lo das tú como **check requerido**.
No es equivalente (un check mira el PR, una push rule mira cada push, incluso
directo), pero cubre el caso real: que un `.zip` de 80 MB no entre en la historia
por un PR.

## Paso 5: El check que sustituye a la push rule de tamaño

```bash
git switch -qc ci/tamano-de-archivos
cat > .github/workflows/tamano-de-archivos.yml <<'EOF'
name: Tamaño de archivos

on:
  pull_request:

permissions:
  contents: read

jobs:
  tamano:
    name: Tamaño de archivos
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          fetch-depth: 0

      - name: Buscar archivos por encima del límite
        env:
          BASE: ${{ github.event.pull_request.base.sha }}
          HEAD: ${{ github.event.pull_request.head.sha }}
          MAX_BYTES: 5242880          # 5 MiB
        run: |
          fallo=0
          while IFS= read -r archivo; do
            [ -f "$archivo" ] || continue
            bytes=$(stat -c%s "$archivo")
            if [ "$bytes" -gt "$MAX_BYTES" ]; then
              echo "::error file=$archivo::ocupa $bytes bytes (máximo $MAX_BYTES)"
              fallo=1
            fi
          done < <(git diff --name-only "$BASE" "$HEAD")
          exit "$fallo"
EOF

git add .github/workflows/tamano-de-archivos.yml
git commit -qm "ci: bloquea archivos de más de 5 MiB en los PRs"
git push -qu origin HEAD
gh pr create --fill
```

Cuatro detalles que no son decorativos:

| Detalle | Por qué |
|---------|---------|
| `permissions: contents: read` | El mínimo. Sin esta línea, el token es de escritura |
| `actions/checkout` pinneada por SHA | Un tag se puede mover; un SHA no |
| `fetch-depth: 0` | Sin la historia completa, `git diff BASE HEAD` falla |
| Los SHAs por `env:`, no interpolados en `run:` | Interpolar texto de un PR en `run:` es inyección de comandos |

**Verifica**:

```bash
gh pr checks --watch
gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

## Paso 6: Probar que bloquea de verdad

```bash
git switch -qc test/archivo-grande
head -c 6000000 /dev/urandom > grande.bin
git add grande.bin
git commit -qm "test: archivo de 6 MB para probar el límite"
git push -qu origin HEAD
gh pr create --fill --title "test: archivo grande" --body "Debe fallar."
gh pr checks --watch
```

**Verifica**: el check sale en rojo con el mensaje del `::error`. Cierra el PR y
borra la rama sin mergear:

```bash
gh pr close --delete-branch
git switch -q main
```

## Paso 7: Exigir el nuevo check

**Por qué**: un check que falla pero no bloquea es una sugerencia.

```bash
jq '(.rules[] | select(.type=="required_status_checks")
     | .parameters.required_status_checks) += [{"context": "Tamaño de archivos"}]' \
  .github/rulesets/main-proteccion.json > tmp.json \
  && mv tmp.json .github/rulesets/main-proteccion.json

gh api repos/{owner}/{repo}/rulesets/$RULESET_ID \
  --method PUT --input .github/rulesets/main-proteccion.json \
  --jq '.rules[] | select(.type=="required_status_checks")
        | [.parameters.required_status_checks[].context]'
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/rules/branches/main \
  --jq '.[] | select(.type=="required_status_checks")
        | [.parameters.required_status_checks[].context]'
# ["Título convencional","Tamaño de archivos"]
```

Y commitea el JSON, que sigue siendo la fuente de verdad:

```bash
git switch -qc chore/ruleset-tamano
git add .github/rulesets/main-proteccion.json
git commit -qm "chore(gobernanza): exige el check de tamaño de archivos"
git push -qu origin HEAD
gh pr create --fill && gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

## ✅ Resultado

- [ ] Has visto `GH013` al forzar un push y al intentar borrar `main`
- [ ] `required_linear_history` activa (o justificado por qué no)
- [ ] Sabes por qué no tienes push rules y qué requieren
- [ ] `.github/workflows/tamano-de-archivos.yml` en `main`
- [ ] Has visto el check fallar con un archivo de 6 MB
- [ ] El check `Tamaño de archivos` es requerido por el ruleset

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| El force push funciona | `non_fast_forward` no está o el ruleset está `disabled` | `gh api repos/{owner}/{repo}/rules/branches/main --jq '[.[].type]'` |
| `git diff BASE HEAD` falla en CI | Falta `fetch-depth: 0` | Añádelo al `checkout` |
| El check no encuentra archivos grandes | `git diff --name-only` incluye archivos borrados | El `[ -f "$archivo" ]` ya los salta |
| `stat: illegal option -- c` | Runner que no es Linux | `runs-on: ubuntu-latest` |
| No puedes mergear nada tras el Paso 7 | El `context` no coincide con el `name:` del job | Léelo con `gh pr checks --json name` |
| El PR de prueba se quedó abierto | Es lo esperado | `gh pr close --delete-branch` |
