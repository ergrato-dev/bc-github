# Práctica 01 — Tu primer CI de verdad

> El check que la Semana 08 exige a tus PRs deja de ser un `grep` del título y
> pasa a ser lo que importa: tus tests.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-modelo-de-ejecucion.md) y
[Teoría 03](../1-teoria/03-eventos-y-payloads.md); repositorio con código y
tests (Semanas 06-07)

## Contexto

Tu repositorio tiene `src/`, tests con `node --test` y un ruleset que exige un
check. Hasta hoy ese check solo validaba el título del PR. Al terminar, la
plataforma ejecutará tus tests en cada PR y bloqueará el merge si fallan.

## Paso 0: Comprobar que tienes tests que fallan

**Por qué**: un CI que siempre sale verde no demuestra nada. Necesitas al menos
un test que puedas romper a propósito.

```bash
cd <tu-repo>
node --test
echo "salida: $?"
```

**Verifica**: sale `0` y se ejecuta al menos un test. Si no tienes tests, este
es el momento — el proyecto los necesita desde la Semana 06.

## Paso 1: Copiar el starter

```bash
mkdir -p .github/workflows
cp <ruta-al-bootcamp>/bootcamp/week-09-actions_fundamentos/starter/ci.yml \
   .github/workflows/ci.yml
```

Ábrelo y localiza los bloques `PASO 1` a `PASO 5`. Hoy solo tocas los dos
primeros, que ya vienen descomentados: léelos y entiende qué hace cada línea
antes de seguir.

**Verifica**:

```bash
grep -c "PASO" .github/workflows/ci.yml   # 5 bloques marcados
```

## Paso 2: Entender lo que ya viene puesto

**Por qué**: son las tres líneas que la mitad de los workflows del mundo no
tiene, y las tres que más caras salen.

| Línea | Qué evita |
|-------|-----------|
| `permissions: contents: read` | Que un workflow comprometido pueda escribir en tu repo |
| `uses: ...@<sha> # v7.0.1` | Que alguien mueva el tag `v7` a otro commit |
| `concurrency` + `cancel-in-progress` | Cinco runs inútiles por cinco pushes seguidos |

Comprueba el pin tú mismo, que es la clase de cosa que hay que saber verificar:

```bash
gh api repos/actions/checkout/tags \
  --jq '.[] | select(.name=="v7.0.1") | .commit.sha'
# 3d3c42e5aac5ba805825da76410c181273ba90b1
```

**Verifica**: el SHA de la salida es el mismo que el del archivo.

## Paso 3: Abrirlo por PR

**Por qué**: `main` está protegida desde la Semana 08. El propio workflow entra
por el proceso que el workflow va a defender.

```bash
git switch -qc ci/anadir-workflow-de-tests
git add .github/workflows/ci.yml
git commit -qm "ci: ejecuta los tests en cada pull request"
git push -qu origin HEAD
gh pr create --fill
gh pr checks --watch
```

**Verifica**: aparece un check nuevo llamado `Tests`, en verde.

> [!NOTE]
> El workflow se ejecuta **desde la rama del PR**, no desde `main`. Por eso el
> check aparece en este mismo PR, antes de mergear. Es lo que hace que un CI
> roto se detecte en el PR que lo rompe.

## Paso 4: Verlo en rojo

**Por qué**: un CI que no has visto fallar no sabes si funciona.

```bash
mkdir -p test
cat > test/comprobacion-ci.test.js <<'EOF'
const { test } = require('node:test');
const assert = require('node:assert');

// Test deliberadamente roto: sirve para comprobar que el CI
// detecta un fallo y bloquea el PR. Se borra en el paso siguiente.
test('el CI debe ponerse en rojo por esto', () => {
  assert.strictEqual(1, 2);
});
EOF

git add test/comprobacion-ci.test.js
git commit -qm "test: añade un test que falla a propósito"
git push -q
gh pr checks --watch
```

No toca tu código de dominio a propósito: el test falla solo, así que esto
funciona igual sea cual sea la estructura de tu `src/`.

**Verifica**: el check `Tests` sale en rojo y el PR no se puede mergear.

```bash
gh run view --log-failed | tail -20
```

Ese `--log-failed` te da solo los steps que fallaron, no las 400 líneas del run
entero. Es el comando que más vas a usar el resto del bootcamp.

## Paso 5: Arreglarlo y mergear

```bash
git rm -q test/comprobacion-ci.test.js
git commit -qm "test: retira el test de comprobación del CI"
git push -q
gh pr checks --watch
gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

**Verifica**: el mismo PR, sin cambiar el workflow, pasa de rojo a verde. Lo que
falló fue el código, que es exactamente el trabajo del CI.

## Paso 6: Exigir el nuevo check

**Por qué**: un check que falla pero no bloquea es una sugerencia. Aquí es donde
la Semana 08 y la 09 se conectan.

```bash
RULESET_ID=$(gh api repos/{owner}/{repo}/rulesets \
  --jq '.[] | select(.name=="main-proteccion") | .id')

jq '(.rules[] | select(.type=="required_status_checks")
     | .parameters.required_status_checks) += [{"context": "Tests"}]' \
  .github/rulesets/main-proteccion.json > tmp.json \
  && mv tmp.json .github/rulesets/main-proteccion.json

gh api repos/{owner}/{repo}/rulesets/$RULESET_ID \
  --method PUT --input .github/rulesets/main-proteccion.json \
  --jq '.rules[] | select(.type=="required_status_checks")
        | [.parameters.required_status_checks[].context]'
```

> [!IMPORTANT]
> El `context` es `Tests` porque el job declara `name: Tests`. Si tu job no
> lleva `name:`, el context es el ID del job (`test`, en minúscula). No lo
> deduzcas — compruébalo:
>
> ```bash
> gh api repos/{owner}/{repo}/commits/main/check-runs --jq '[.check_runs[].name]'
> ```

Commitea el JSON, que sigue siendo la fuente de verdad:

```bash
git switch -qc chore/exigir-check-de-tests
git add .github/rulesets/main-proteccion.json
git commit -qm "chore(gobernanza): exige el check de tests en main"
git push -qu origin HEAD
gh pr create --fill && gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/rules/branches/main \
  --jq '.[] | select(.type=="required_status_checks")
        | [.parameters.required_status_checks[].context]'
```

## ✅ Resultado

- [ ] `.github/workflows/ci.yml` en `main`
- [ ] `permissions: contents: read` declaradas
- [ ] Las actions van pinneadas por SHA con el tag en comentario
- [ ] Has visto el check en verde y en rojo
- [ ] Sabes usar `gh run view --log-failed`
- [ ] El check `Tests` es requerido por el ruleset

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| El workflow no aparece | No está en la rama del PR | `git push` y recarga |
| `node: command not found` | Falta `setup-node` | Está en el PASO 2, no lo borres |
| `Cannot find module` | Falta `actions/checkout` | El workspace está vacío sin él |
| El check se llama distinto | Es el `name:` del job, no el del archivo | `gh pr checks --json name` |
| Nada se puede mergear tras el Paso 6 | El `context` no coincide | Léelo con `check-runs` y corrige el JSON |
| El run tarda muchísimo | Sin caché todavía | Llega en la Práctica 03 |
