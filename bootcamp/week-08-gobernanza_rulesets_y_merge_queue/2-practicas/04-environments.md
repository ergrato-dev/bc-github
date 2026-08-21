# Práctica 04 — Un environment con revisor obligatorio

> El ruleset controla lo que entra en `main`. El environment controla lo que sale
> a producción. Aquí cierras la segunda puerta.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 04](../1-teoria/04-environments-y-despliegue.md)

## Contexto

Vas a crear un environment `production` que exige aprobación humana, meterle un
secreto que solo existe ahí, y ver un despliegue detenido esperándote. El
despliegue es simulado: lo real llega en la Semana 11.

## Paso 1: Tu ID de usuario

**Por qué**: la API de environments quiere IDs numéricos, no logins.

```bash
MI_ID=$(gh api user --jq '.id')
echo "$MI_ID"
```

## Paso 2: Crear el environment con sus reglas

**Por qué**: si no lo creas tú, lo crea el workflow al vuelo **sin ninguna
protección** — y entonces no protege nada.

```bash
gh api repos/{owner}/{repo}/environments/production \
  --method PUT \
  --input - <<JSON
{
  "wait_timer": 0,
  "prevent_self_review": false,
  "reviewers": [{ "type": "User", "id": $MI_ID }],
  "deployment_branch_policy": {
    "protected_branches": true,
    "custom_branch_policies": false
  }
}
JSON
```

| Campo | Por qué así |
|-------|-------------|
| `prevent_self_review: false` | Trabajas solo: en `true` nunca podrías aprobar tu propio despliegue |
| `protected_branches: true` | Solo se despliega desde ramas cubiertas por el ruleset de la Práctica 01 |
| `wait_timer: 0` | De momento. Lo cambias en el Paso 7 |

**Verifica**:

```bash
gh api repos/{owner}/{repo}/environments \
  --jq '.environments[] | {nombre: .name, reglas: [.protection_rules[].type]}'
# {"nombre":"production","reglas":["required_reviewers","branch_policy"]}
```

## Paso 3: Un secreto que solo existe en ese environment

**Por qué**: es la diferencia práctica entre "protegido" y "protegido de verdad".
Un secreto de repositorio lo usa cualquier workflow desde cualquier rama.

```bash
printf 'valor-simulado-de-prueba' | gh secret set TOKEN_DESPLIEGUE --env production
gh secret list --env production
```

> [!CAUTION]
> Nunca escribas un secreto real como argumento en la línea de comandos: queda en
> el historial del shell. `printf | gh secret set` lo lee por la entrada estándar,
> que no se guarda.

**Verifica**: `gh secret list` (sin `--env`) **no** debe mostrar
`TOKEN_DESPLIEGUE`.

## Paso 4: El workflow que lo usa

```bash
git switch -qc ci/despliegue-simulado
cat > .github/workflows/desplegar.yml <<'EOF'
name: Desplegar

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  desplegar:
    name: Desplegar a producción
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - name: Comprobar que el secreto del environment llegó
        env:
          TOKEN: ${{ secrets.TOKEN_DESPLIEGUE }}
        run: |
          if [ -z "$TOKEN" ]; then
            echo "::error::El secreto no llegó: ¿falta 'environment:' en el job?"
            exit 1
          fi
          echo "Secreto recibido (${#TOKEN} caracteres). Despliegue simulado."
EOF

git add .github/workflows/desplegar.yml
git commit -qm "ci: workflow de despliegue simulado con environment protegido"
git push -qu origin HEAD
gh pr create --fill && gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

**Verifica**: el workflow nunca imprime el secreto, solo su longitud. Imprimir un
secreto lo enmascara en el log, pero es una costumbre que un día falla.

## Paso 5: Lanzarlo y verlo detenido

```bash
gh workflow run desplegar.yml
sleep 5
RUN_ID=$(gh run list --workflow=desplegar.yml --limit 1 --json databaseId --jq '.[0].databaseId')
gh run view "$RUN_ID"
```

**Verifica**: el job aparece como `Waiting`, no como `in_progress`. Nadie está
gastando runner: esperar es gratis.

```bash
gh api repos/{owner}/{repo}/actions/runs/$RUN_ID/pending_deployments \
  --jq '.[] | {environment: .environment.name,
               puedes_aprobar: .current_user_can_approve,
               espera_desde: .wait_timer_started_at}'
```

## Paso 6: Aprobarlo

**Por qué**: aprobar por API es lo que luego se automatiza; por la UI es un botón
verde en la pestaña *Actions*.

```bash
ENV_ID=$(gh api repos/{owner}/{repo}/environments/production --jq '.id')

gh api repos/{owner}/{repo}/actions/runs/$RUN_ID/pending_deployments \
  --method POST \
  -F "environment_ids[]=$ENV_ID" \
  -f state=approved \
  -f comment="Aprobado desde la Práctica 04"

gh run watch "$RUN_ID"
```

**Verifica**: el job termina en verde y el log dice `Secreto recibido`. Si dice
que el secreto no llegó, al job le falta el bloque `environment:`.

## Paso 7: Añadir un wait timer

**Por qué**: la ventana para cancelar un despliegue lanzado por error. Con
disparadores automáticos (un tag, un release) es lo único que te salva.

```bash
gh api repos/{owner}/{repo}/environments/production \
  --method PUT \
  --input - <<JSON
{
  "wait_timer": 2,
  "prevent_self_review": false,
  "reviewers": [{ "type": "User", "id": $MI_ID }],
  "deployment_branch_policy": {
    "protected_branches": true,
    "custom_branch_policies": false
  }
}
JSON
```

> [!IMPORTANT]
> `PUT` **reemplaza** la configuración del environment: manda siempre el objeto
> completo. Si envías solo `wait_timer`, pierdes los revisores.

**Verifica**:

```bash
gh api repos/{owner}/{repo}/environments/production \
  --jq '[.protection_rules[] | {type, wait_timer}]'
```

Dos minutos es deliberadamente corto para que puedas comprobarlo hoy. En un
proyecto real, entre 0 y 5 minutos: más de eso y la gente aprende a lanzarlo con
antelación "para que ya esté", que es justo lo contrario de lo que buscas.

## Paso 8: Documentarlo

```bash
git switch -qc docs/environments
cat >> CONTRIBUTING.md <<'EOF'

## Despliegues

Los despliegues a producción pasan por el environment `production`:

- Aprobación de un revisor antes de ejecutarse
- Espera de 2 minutos como ventana de cancelación
- Solo desde ramas protegidas por el ruleset `main-proteccion`
- Las credenciales son secretos **del environment**, no del repositorio: un
  workflow sin `environment: production` no puede usarlas
EOF

git commit -qam "docs: documenta la política de despliegues"
git push -qu origin HEAD
gh pr create --fill && gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

## ✅ Resultado

- [ ] Environment `production` con `required_reviewers` y `branch_policy`
- [ ] `TOKEN_DESPLIEGUE` existe solo en el environment
- [ ] `.github/workflows/desplegar.yml` en `main`
- [ ] Has visto un job en `Waiting` y lo has aprobado
- [ ] `wait_timer` configurado
- [ ] La política de despliegues está en `CONTRIBUTING.md`

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| El secreto llega vacío | Al job le falta `environment: production` | Añádelo |
| `current_user_can_approve: false` | `prevent_self_review: true` y lanzaste tú | Ponlo en `false` y repite el `PUT` |
| El job arranca sin esperar | El environment se creó al vuelo, sin reglas | Repite el Paso 2 |
| Perdiste los revisores al tocar el timer | `PUT` reemplaza el objeto entero | Manda siempre el JSON completo |
| `404` al crear el environment | Repo privado con plan Free | `gh repo edit --visibility public --accept-visibility-change-consequences` |
| El despliegue no arranca desde tu rama | `protected_branches: true` y la rama no está protegida | Lánzalo desde `main` |
