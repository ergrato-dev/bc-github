# Práctica 02 — Checks y firmas obligatorios

> Las dos reglas que más bloquean si te equivocas, y por eso las dos que hay que
> comprobar antes de exigir.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 03](../1-teoria/03-checks-y-firmas.md), [Práctica 01](01-primer-ruleset.md), Semana 07 (workflow
`validar-pr.yml`), Semana 01 (firma de commits)

## Contexto

Tu ruleset ya obliga a pasar por PR. Un PR con CI en rojo, sin embargo, se puede
mergear igual. Y cualquiera puede subir commits sin firmar. Esta práctica cierra
las dos puertas — en el orden correcto, que es comprobar antes de exigir.

## Paso 1: Averiguar el `context` exacto de tu check

**Por qué**: es el error número uno de la semana. El `context` no es el nombre
del archivo del workflow, ni siempre el ID del job: si el job declara `name:`,
el context es **ese texto**.

```yaml
jobs:
  titulo:                       # ID del job
    name: Título convencional   # ← si existe, ESTE es el context
```

No lo deduzcas: léelo de un PR real.

```bash
git switch -qc chore/leer-contexts
git commit -q --allow-empty -m "chore: PR de sondeo para leer los contexts"
git push -qu origin HEAD
gh pr create --fill

gh pr checks --watch
gh pr checks --json name,state --jq '.[] | "\(.name)\t\(.state)"'
```

**Verifica**: copia el nombre **literal** que sale, tildes incluidas. Ese es el
valor que va en `context`.

## Paso 2: Comprobar que firmas de verdad

**Por qué**: si activas `required_signatures` sin firmar, tu siguiente push se
rechaza y no podrás arreglarlo con otro push.

```bash
gh api user/ssh_signing_keys --jq 'length'     # > 0
git config --global commit.gpgsign             # true
git log -1 --format='%G? %h %s'                # empieza por G
```

**Verifica**: los tres. `%G?` devuelve `G` (firma buena). Si devuelve `N`, no
estás firmando: vuelve a [Semana 01, setup de firmas](../../week-01-git_repaso_y_setup_pro/README.md)
antes de continuar. Si devuelve `U`, la firma es válida pero la clave no es de
confianza — súbela a GitHub como clave de tipo *signing*.

> [!CAUTION]
> No sigas al Paso 3 si `%G?` no devuelve `G`. Es el único paso de la semana que
> te puede dejar sin poder pushear a tu propio repositorio.

## Paso 3: Añadir las dos reglas al archivo

**Por qué**: el JSON versionado sigue siendo la fuente de verdad; se edita ahí y
se envía, nunca al revés.

```bash
CONTEXT="Título convencional"   # ← el que copiaste en el Paso 1

jq --arg ctx "$CONTEXT" '
  .rules += [
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "do_not_enforce_on_create": false,
        "required_status_checks": [{ "context": $ctx }]
      }
    },
    { "type": "required_signatures" }
  ]
' .github/rulesets/main-proteccion.json > tmp.json && mv tmp.json .github/rulesets/main-proteccion.json
```

**Verifica** antes de enviarlo:

```bash
jq '[.rules[].type]' .github/rulesets/main-proteccion.json
# ["pull_request","non_fast_forward","deletion","required_status_checks","required_signatures"]
```

`strict_required_status_checks_policy: false` a propósito: en `true` obliga a
tener la rama al día con `main` antes de mergear, y trabajando solo eso es
fricción sin beneficio. Es exactamente el problema del que habla la
[Teoría 06](../1-teoria/06-merge-queue.md).

## Paso 4: Enviarlo

```bash
RULESET_ID=$(gh api repos/{owner}/{repo}/rulesets \
  --jq '.[] | select(.name=="main-proteccion") | .id')

gh api repos/{owner}/{repo}/rulesets/$RULESET_ID \
  --method PUT \
  --input .github/rulesets/main-proteccion.json \
  --jq '{name, enforcement, reglas: [.rules[].type]}'
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/rules/branches/main \
  --jq '.[] | select(.type=="required_status_checks") | .parameters.required_status_checks'
```

## Paso 5: Verlo bloquear en rojo

**Por qué**: la regla que no has visto fallar es una regla que no sabes si
funciona.

Vuelve al PR de sondeo del Paso 1 y dale un título que **incumple** la
convención:

```bash
gh pr edit --title "arreglos varios"
gh pr checks --watch
```

**Verifica**: el check sale en rojo y el PR no se puede mergear.

```bash
gh pr merge --squash
# Salida esperada: el merge se rechaza por los checks requeridos
```

## Paso 6: Verlo pasar en verde

```bash
gh pr edit --title "chore: PR de sondeo para leer los contexts"
gh pr checks --watch
gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

**Verifica**: el mismo PR, sin un solo commit nuevo, ahora sí entra.

## Paso 7: Verlo bloquear un commit sin firmar

**Por qué**: comprobar que `required_signatures` mira **todos** los commits del
PR, no solo el último.

```bash
git switch -qc chore/probar-firmas
git commit -q --allow-empty --no-gpg-sign -m "chore: commit deliberadamente sin firmar"
git push -qu origin HEAD
gh pr create --fill
gh pr view --json mergeable,mergeStateStatus
```

**Verifica**: el PR aparece bloqueado por la regla de firmas. Ahora arréglalo sin
crear un commit nuevo:

```bash
git commit -q --amend --no-edit -S
git push -qf
gh pr checks --watch
```

> [!NOTE]
> Ese `push --force` funciona porque `non_fast_forward` protege
> `~DEFAULT_BRANCH`, no tus ramas de trabajo. Si quisieras protegerlas también,
> sería otro ruleset con `include: ["~ALL"]` — y entonces esta operación dejaría
> de ser posible.

```bash
gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

## Paso 8: Documentarlo

**Por qué**: quien llegue al repositorio tiene que saber qué se le va a exigir
antes de que se lo rechacen.

```bash
git switch -qc docs/gobernanza
cat >> CONTRIBUTING.md <<'EOF'

## Gobernanza de `main`

`main` está protegida por el ruleset `main-proteccion`, versionado en
[`.github/rulesets/main-proteccion.json`](.github/rulesets/main-proteccion.json).
Exige:

- Pull request: nada entra por push directo
- Revisión de code owners (`.github/CODEOWNERS`)
- Hilos de revisión resueltos
- Merge por squash
- Check `Título convencional` en verde
- **Todos** los commits firmados
- Prohibidos el force push y el borrado de la rama

Si un cambio de estas reglas es necesario, se hace en el JSON y por PR, no desde
Settings: así queda revisado y con historial.
EOF

git commit -qam "docs: documenta la gobernanza de main"
git push -qu origin HEAD
gh pr create --fill && gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

## ✅ Resultado

- [ ] Sabes de dónde sale el `context` y lo has leído, no deducido
- [ ] `required_status_checks` con tu check real
- [ ] `required_signatures` activa, después de comprobar `%G?`
- [ ] Has visto un PR bloqueado en rojo y el mismo PR pasar en verde
- [ ] Has visto un commit sin firmar rechazado
- [ ] `CONTRIBUTING.md` explica las reglas

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| *Expected — Waiting for status to be reported* eterno | El `context` no coincide con ningún check | Léelo con `gh pr checks --json name` |
| El check no aparece en el PR | El workflow filtra por `paths:` o el job tiene `if:` | Que el job corra siempre y decida dentro |
| Todos tus pushes rechazados por firma | Activaste `required_signatures` sin firmar | `disabled` el ruleset, arregla la firma, reactiva |
| `%G?` devuelve `U` | La clave no está en GitHub como clave de firma | `gh ssh-key add <clave.pub> --type signing` |
| Commits viejos del PR sin firmar | La regla los mira todos | `git rebase --exec 'git commit --amend --no-edit -S' main` |
| `422` al hacer `PUT` | El JSON no valida | `jq . .github/rulesets/main-proteccion.json` |
