# Práctica 01 — Tu primer ruleset, sin bloquearte

> Escribes la gobernanza de `main` como un archivo JSON versionado, la creas
> como borrador, la revisas y solo entonces la activas.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-rulesets-vs-branch-protection.md)
y [Teoría 02](../1-teoria/02-la-regla-pull-request.md)

## Contexto

Hasta ahora `main` acepta cualquier `git push`. Al terminar esta práctica solo
aceptará merges de pull requests, y la configuración que lo consigue estará en tu
repositorio como código, no escondida en Settings.

> [!IMPORTANT]
> Los rulesets están disponibles en repositorios **públicos** con GitHub Free.
> Si tu repositorio del bootcamp es privado, hazlo público antes de empezar:
> `gh repo edit --visibility public --accept-visibility-change-consequences`.

## Paso 1: Fotografía del estado inicial

**Por qué**: para poder comparar, y para tener a mano tu ID de usuario, que hace
falta si algún día necesitas un bypass.

```bash
cd <tu-repo>
gh api repos/{owner}/{repo}/rulesets --jq 'length'
gh api repos/{owner}/{repo}/rules/branches/main --jq 'length'
gh api user --jq '{login, id}'
```

**Verifica**: las dos primeras líneas dan `0`. Si no, ya tienes reglas: léelas
antes de añadir más.

## Paso 2: Escribir el ruleset como archivo versionado

**Por qué**: un ruleset que solo existe en Settings no se revisa, no se copia a
otro repositorio y no deja rastro de por qué está así. Como archivo, sí.

```bash
mkdir -p .github/rulesets
cat > .github/rulesets/main-proteccion.json <<'JSON'
{
  "name": "main-proteccion",
  "target": "branch",
  "enforcement": "disabled",
  "conditions": {
    "ref_name": {
      "include": ["~DEFAULT_BRANCH"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "require_code_owner_review": true,
        "dismiss_stale_reviews_on_push": true,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "allowed_merge_methods": ["squash"]
      }
    },
    { "type": "non_fast_forward" },
    { "type": "deletion" }
  ],
  "bypass_actors": []
}
JSON
```

Tres decisiones que conviene entender antes de seguir:

| Decisión | Por qué |
|----------|---------|
| `enforcement: "disabled"` | Nace como borrador. Nada se aplica todavía |
| `required_approving_review_count: 0` | Trabajas solo: con 1, GitHub no te deja aprobar tu propio PR y te quedas sin poder mergear |
| `allowed_merge_methods: ["squash"]` | Coherente con lo decidido en la Semana 06 — ajústalo si elegiste otro |

> [!NOTE]
> El modo `evaluate`, que registra lo que habría bloqueado sin bloquear, **solo
> está disponible con GitHub Enterprise**. `disabled` es el borrador que sí
> tienes: no registra intentos, pero te deja revisar la configuración antes de
> que muerda.

**Verifica**:

```bash
jq -e '.rules | length == 3' .github/rulesets/main-proteccion.json
```

## Paso 3: Crearlo en GitHub

**Por qué**: el archivo no hace nada por sí solo; hay que enviarlo a la API.

```bash
gh api repos/{owner}/{repo}/rulesets \
  --method POST \
  --input .github/rulesets/main-proteccion.json \
  --jq '{id, name, enforcement}'
```

Guarda el ID, que lo vas a necesitar:

```bash
RULESET_ID=$(gh api repos/{owner}/{repo}/rulesets \
  --jq '.[] | select(.name=="main-proteccion") | .id')
echo "$RULESET_ID"
```

**Verifica**:

```bash
gh ruleset list
gh api repos/{owner}/{repo}/rules/branches/main --jq 'length'
# 0 — está en disabled, todavía no aplica nada
```

## Paso 4: Revisar el borrador

**Por qué**: este es el paso que sustituye a `evaluate`. Lees lo que GitHub ha
entendido, que no siempre es lo que escribiste.

```bash
gh api repos/{owner}/{repo}/rulesets/$RULESET_ID \
  --jq '{nombre: .name, modo: .enforcement, condiciones: .conditions,
         reglas: [.rules[].type]}'
```

Comprueba tres cosas:

- `reglas` contiene exactamente `pull_request`, `non_fast_forward` y `deletion`
- `condiciones.ref_name.include` es `["~DEFAULT_BRANCH"]`, no `refs/heads/main`
- No hay `bypass_actors`

## Paso 5: Activarlo

**Por qué**: hasta aquí no ha cambiado nada. Ahora sí.

Cambias el archivo, lo commiteas y lo envías con `PUT`. El archivo sigue siendo
la fuente de verdad.

```bash
jq '.enforcement = "active"' .github/rulesets/main-proteccion.json > tmp.json \
  && mv tmp.json .github/rulesets/main-proteccion.json

git add .github/rulesets/main-proteccion.json
git commit -qm "feat(gobernanza): protege main con un ruleset"
git push -q

gh api repos/{owner}/{repo}/rulesets/$RULESET_ID \
  --method PUT \
  --input .github/rulesets/main-proteccion.json \
  --jq '{name, enforcement}'
```

> [!TIP]
> Ese `git push` es el último directo a `main` que vas a poder hacer. Es
> deliberado: haz el commit **antes** de activar.

**Verifica**:

```bash
gh api repos/{owner}/{repo}/rules/branches/main --jq '[.[].type]'
# ["pull_request","non_fast_forward","deletion"]
```

## Paso 6: Comprobar que de verdad bloquea

**Por qué**: una regla que no has visto fallar no sabes si funciona.

```bash
echo "prueba" >> README.md
git commit -qam "chore: intento de push directo"
git push
```

Salida esperada:

```
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - Changes must be made through a pull request.
```

Ahora deshaz el intento y hazlo bien:

```bash
git switch -qc chore/probar-ruleset
git push -qu origin HEAD
gh pr create --fill
gh pr merge --squash --delete-branch
```

Y limpia tu `main` local, que se quedó con el commit rechazado:

```bash
git switch -q main
git reset --hard origin/main
```

> [!WARNING]
> `git reset --hard` descarta cambios sin guardar de tu copia local. Aquí es
> seguro porque el único commit local es el intento fallido, y el trabajo real ya
> está mergeado. Comprueba `git status` antes de ejecutarlo.

## Paso 7: Verificar

```bash
gh ruleset check main
./scripts/verificar-semana.sh 08 --repo <tu-usuario>/<tu-repo>
```

## ✅ Resultado

- [ ] `.github/rulesets/main-proteccion.json` versionado en el repositorio
- [ ] Ruleset `main-proteccion` en `active`
- [ ] `rules/branches/main` devuelve las tres reglas
- [ ] Has visto el error `GH013` con tus propios ojos
- [ ] Tu `main` local está sincronizada con `origin/main`

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `404` al crear el ruleset | Repositorio privado con plan Free | `gh repo edit --visibility public --accept-visibility-change-consequences` |
| `422 Invalid request` | Falta un parámetro obligatorio de `pull_request` | Los seis del Paso 2 son necesarios |
| No puedes mergear tu propio PR | `required_approving_review_count` a 1 | Ponlo a 0 y `PUT` otra vez |
| `rules/branches/main` sigue vacío | El ruleset está en `disabled` | Repite el Paso 5 |
| `$RULESET_ID` vacío | El nombre no coincide | `gh api repos/{owner}/{repo}/rulesets --jq '.[].name'` |
| El PR pide revisión de code owner y eres tú | GitHub no se pide review a sí mismo: el requisito se cumple solo | Si aun así bloquea, pon `require_code_owner_review: false` y `PUT` de nuevo |
| Te has bloqueado del todo | Regla mal puesta | Vuelve al borrador: `jq '.enforcement="disabled"' .github/rulesets/main-proteccion.json > tmp.json && mv tmp.json .github/rulesets/main-proteccion.json` y repite el `PUT` del Paso 5 |
