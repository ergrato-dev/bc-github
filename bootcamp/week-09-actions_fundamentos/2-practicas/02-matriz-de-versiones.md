# Práctica 02 — Matriz de versiones

> Tres versiones de Node en paralelo, y el efecto secundario que rompe el
> ruleset de la Semana 08 si no lo ves venir.

**Duración estimada**: 40 min
**Prerrequisitos**: [Práctica 01](01-primer-workflow-de-ci.md),
[Teoría 06](../1-teoria/06-matrices.md)

## Contexto

Tu CI corre en una sola versión de Node: la que tengas instalada tú. Eso no
prueba que el proyecto funcione en las versiones que dices soportar. Al terminar
correrá en tres a la vez.

## Paso 1: Elegir las versiones, no copiarlas

**Por qué**: una matriz con versiones sin soporte es trabajo de CI tirado.

```bash
curl -s https://nodejs.org/dist/index.json \
  | jq -r '[.[] | select(.lts != false)
            | {major: (.version|ltrimstr("v")|split(".")[0]|tonumber), lts}]
           | group_by(.major) | map(.[0]) | .[-3:][]
           | "Node \(.major) — \(.lts)"'
```

**Verifica**: te salen las líneas LTS recientes. Elige **las dos LTS vivas más
recientes y la Current**. En agosto de 2026 eso es `22`, `24` y `26`; cuando
hagas esta práctica puede ser otra cosa, y el criterio es lo que importa, no la
lista.

> [!NOTE]
> Las versiones de este material están fechadas en agosto de 2026. La fuente de
> verdad es [nodejs.org/about/previous-releases](https://nodejs.org/en/about/previous-releases),
> no este archivo.

## Paso 2: Descomentar el PASO 3

**Por qué**: es el bloque de la matriz del starter.

```bash
git switch -qc ci/matriz-de-versiones
```

En `.github/workflows/ci.yml`, descomenta el bloque `PASO 3` y ajusta las
versiones a las que elegiste:

```yaml
    strategy:
      fail-fast: false
      matrix:
        node: [22, 24, 26]
        include:
          - node: 24
            principal: true
        exclude: []
```

Y en el step de Node, cambia la versión fija por la de la matriz:

```yaml
        with:
          node-version: ${{ matrix.node }}
          package-manager-cache: false
```

**Verifica** antes de empujar nada:

```bash
python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml')); print('YAML válido')"
```

## Paso 3: Entender los dos comportamientos de `include`

**Por qué**: es lo que más confunde de las matrices, y se ve en un minuto.

La matriz de arriba genera **tres** jobs, no cuatro: `include` con `node: 24`
**no** creó nada nuevo, porque `24` ya estaba en la lista — le añadió la
propiedad `principal` al job que ya existía.

GitHub compone el nombre del check con los valores de la matriz de cada job, así
que un job enriquecido cambia de nombre. No lo deduzcas, léelo:

```bash
gh pr checks --json name --jq '[.[].name]'
```

Ahora prueba lo contrario — añade temporalmente al `include`:

```yaml
          - node: 20
            legado: true
```

Eso **sí** crea un cuarto job, porque `20` no estaba en la lista. Es la regla
entera: encaja → enriquece; no encaja → job nuevo.

**Verifica**: quítalo antes de seguir. Node 20 no tiene soporte y no queremos
CI gastando runners en él.

## Paso 4: Comprobar `fail-fast`

**Por qué**: es la diferencia entre "el CI falla" y "el CI te dice **dónde**
falla".

```bash
git add .github/workflows/ci.yml
git commit -qm "ci: ejecuta los tests en una matriz de versiones de Node"
git push -qu origin HEAD
gh pr create --fill
gh pr checks --watch
```

**Verifica**: aparecen tres checks, uno por versión. Con `fail-fast: false`, si
una versión falla las otras dos terminan igualmente y sabes si el problema es de
esa versión o de tu código.

## Paso 5: El efecto secundario que rompe el ruleset

**Por qué**: este es el paso importante de la práctica. Ahora mismo tu PR **no
se puede mergear**, y no por culpa de los tests.

```bash
gh pr view --json statusCheckRollup \
  --jq '[.statusCheckRollup[] | {nombre: .name, estado: .conclusion}]'
```

**Verifica**: el check `Tests` a secas, el que exige el ruleset, **ya no
existe**. La matriz lo ha convertido en un check por combinación, con los valores
entre paréntesis, y el ruleset sigue esperando un nombre que nadie va a reportar
nunca.

Es exactamente el fallo que anticipaba la [Teoría 02 de la Semana 08](../../week-08-gobernanza_rulesets_y_merge_queue/1-teoria/03-checks-y-firmas.md):
un check requerido que no se dispara bloquea el PR para siempre.

## Paso 6: Arreglar el ruleset

**Por qué**: hay dos formas y solo una escala.

- ❌ Exigir los tres contexts con paréntesis. Funciona hasta que cambies la
  matriz, y entonces vuelves a estar bloqueado
- ✅ Añadir un job **agregador** con nombre fijo que dependa de la matriz. El
  ruleset exige ese, y la matriz puede cambiar cuanto quiera

Añade al final de `ci.yml`:

```yaml
  ci-ok:
    name: CI
    needs: test
    if: ${{ !cancelled() }}
    runs-on: ubuntu-latest
    steps:
      - name: Comprobar el resultado de la matriz
        env:
          RESULTADO: ${{ needs.test.result }}
        run: |
          echo "La matriz terminó con: $RESULTADO"
          [ "$RESULTADO" = "success" ]
```

Tres detalles que no son decorativos:

| Detalle | Por qué |
|---------|---------|
| `needs: test` | Espera a **todos** los jobs de la matriz, no a uno |
| `if: ${{ !cancelled() }}` | Sin esto, el `if: success()` implícito lo saltaría cuando la matriz falla, y el check quedaría *skipped* en vez de rojo |
| `needs.test.result` por `env:` | Nunca interpolar dentro de un `run:` |

Ahora cambia el ruleset para que exija `CI` en vez de `Tests`:

```bash
RULESET_ID=$(gh api repos/{owner}/{repo}/rulesets \
  --jq '.[] | select(.name=="main-proteccion") | .id')

jq '(.rules[] | select(.type=="required_status_checks")
     | .parameters.required_status_checks)
    |= (map(select(.context != "Tests")) + [{"context": "CI"}])' \
  .github/rulesets/main-proteccion.json > tmp.json \
  && mv tmp.json .github/rulesets/main-proteccion.json

gh api repos/{owner}/{repo}/rulesets/$RULESET_ID \
  --method PUT --input .github/rulesets/main-proteccion.json \
  --jq '.rules[] | select(.type=="required_status_checks")
        | [.parameters.required_status_checks[].context]'
```

```bash
git add -A
git commit -qm "ci: añade un job agregador y lo exige en el ruleset"
git push -q
gh pr checks --watch
gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

**Verifica**: cuatro checks (tres de matriz más `CI`), y el PR se mergea.

## ✅ Resultado

- [ ] Matriz de 3 versiones elegidas con criterio, no copiadas
- [ ] `fail-fast: false`
- [ ] Sabes cuándo `include` enriquece y cuándo crea un job
- [ ] Has visto el ruleset bloquear el PR por el renombrado de los checks
- [ ] Job agregador `CI` con nombre estable, exigido por el ruleset

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| El PR no se puede mergear y los tests están verdes | El ruleset pide un context que ya no existe | Paso 6 |
| `ci-ok` sale *skipped* en vez de rojo | Falta `if: ${{ !cancelled() }}` | Añádelo |
| `ci-ok` sale verde con la matriz roja | Falta el `[ "$RESULTADO" = "success" ]` | `needs` no hereda el fallo si hay `if:` |
| Aparecen más jobs de los esperados | `include` con un valor que no estaba en la lista | Es el comportamiento correcto |
| Un job falla solo en una versión | Es justo para lo que sirve la matriz | Mira `gh run view --log-failed` |
| YAML inválido tras descomentar | Indentación | `yaml.safe_load` antes de empujar |
