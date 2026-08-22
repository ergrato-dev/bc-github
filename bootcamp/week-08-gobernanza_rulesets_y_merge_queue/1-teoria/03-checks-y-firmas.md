# Checks obligatorios y firmas

> Las dos reglas que convierten el CI y la criptografía en requisitos. Y las dos
> que más repositorios dejan bloqueados el primer día.

## 🎯 Objetivos

- Exigir status checks sabiendo de dónde sale exactamente su nombre
- Diagnosticar un PR colgado esperando un check que nunca llega
- Decidir si exigir la rama al día, sabiendo lo que cuesta
- Exigir commits firmados sin bloquearte a ti mismo

## 1. `required_status_checks`

```json
{
  "type": "required_status_checks",
  "parameters": {
    "strict_required_status_checks_policy": false,
    "do_not_enforce_on_create": false,
    "required_status_checks": [
      { "context": "validar-titulo" }
    ]
  }
}
```

| Parámetro | Qué hace |
|-----------|----------|
| `required_status_checks[].context` | El nombre exacto del check que debe estar en verde |
| `integration_id` (opcional) | Restringe qué aplicación puede publicar ese check |
| `strict_required_status_checks_policy` | Exige además que la rama esté al día con la base |
| `do_not_enforce_on_create` | No aplica al crear la rama (útil con targets amplios) |

## 2. De dónde sale el `context`

El error número uno de la semana. El `context` es el **nombre del job**, no el
del workflow ni el del archivo:

```yaml
# .github/workflows/validar-pr.yml
name: Validación de PR          # ← NO es esto
jobs:
  validar-titulo:               # ← ESTO es el context
    runs-on: ubuntu-latest
```

Y hay dos casos que cambian el nombre:

- Si el job tiene `name:`, el context es **ese** nombre, no la clave del job
- Con `strategy.matrix`, cada combinación es un check distinto y el nombre lleva
  la matriz entre paréntesis: `test (22)`, `test (24)`

La forma de no adivinar nunca:

```bash
gh pr checks <numero> --json name,state --jq '.[] | "\(.state)\t\(.name)"'
```

Ese nombre, copiado tal cual, es el que va en el ruleset.

## 3. El check que nunca corre

El fallo que deja un repositorio bloqueado: si exiges un check que **no se
dispara** en un PR concreto, ese PR se queda en *Expected — Waiting for status to
be reported* **para siempre**. No falla: espera.

Causas, por frecuencia:

| Causa | Síntoma |
|-------|---------|
| El workflow tiene `paths:` y el PR no toca esas rutas | Todos los PRs de documentación colgados |
| El job tiene un `if:` que no se cumple | Cuelga solo en algunos PRs |
| Se renombró el job y el ruleset pide el nombre viejo | Cuelgan todos, de golpe |
| El workflow solo escucha `push`, no `pull_request` | Nunca hay check en el PR |
| El PR viene de un fork y el workflow no corre | Cuelgan solo los externos |

La solución **no** es quitar el filtro: es que el job **exista siempre** y termine
en verde cuando no aplica.

```yaml
on:
  pull_request:

permissions:
  contents: read

jobs:
  validar-titulo:          # ← este nombre es el `context` del ruleset
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - run: echo "aquí la comprobación real"
```

Si de verdad necesitas filtrar por rutas, el patrón correcto es un job "portero"
que siempre corre y decide dentro, o el job agregador que verás en la
[Semana 09](../../week-09-actions_fundamentos/1-teoria/06-matrices.md) para las
matrices.

> [!TIP]
> Con una matriz que cambia (hoy Node 22 y 24, mañana 24 y 26), exigir
> `test (22)` es garantizar un bloqueo futuro. Se exige un **job agregador** con
> nombre fijo que dependa de la matriz. Es exactamente el problema de la
> Semana 09.

## 4. `strict`: la rama al día

`strict_required_status_checks_policy: true` exige que la rama del PR contenga lo
último de la base antes de mergear. Evita el conflicto semántico —dos PRs verdes
que juntos rompen `main`— y cuesta lo que cuesta:

| Equipo | Efecto |
|--------|--------|
| 1-3 personas | Casi ninguno |
| 5-10 personas | Actualizas la rama varias veces al día |
| Más | *Merge starvation*: nadie llega a mergear ([Teoría 06](06-merge-queue.md)) |

En este bootcamp, trabajando solo, ponerlo en `true` es barato y enseña la
mecánica. En un equipo grande, la respuesta correcta ya no es esta regla: es la
cola de merge.

## 5. `required_signatures`

Sin parámetros: `{ "type": "required_signatures" }`. O está o no está.

> [!CAUTION]
> Actívala **después** de comprobar que firmas de verdad
> ([Semana 01, Teoría 05](../../week-01-git_repaso_y_setup_pro/1-teoria/05-identidad-y-firmas.md)),
> o te bloqueas a ti mismo en el siguiente commit:
>
> ```bash
> gh api user/ssh_signing_keys --jq 'length'   # > 0
> git log -1 --format='%G?'                    # G = firma buena
> ```

Detalles que sorprenden:

- Los commits que crea **GitHub** por ti (merge desde la web, edición en el
  navegador, squash) van firmados con la clave de GitHub y **pasan la regla**
- Un `git rebase` **pierde las firmas** de los commits reescritos: hay que
  refirmar (`git rebase --exec 'git commit --amend --no-edit -S'`)
- Los commits de un bot deben ir firmados también, o el bot necesita bypass
  ([Teoría 05](05-bypass-y-auditoria.md))

Lo que esta regla te da, y es más de lo que parece: a partir de aquí, la historia
de `main` es **atribuible criptográficamente**. Es el primer eslabón de la cadena
de suministro que se trabaja en la Semana 13.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Adivinar el `context` | El PR se cuelga esperando algo que no existe | `gh pr checks --json name` |
| Exigir un check con `paths:` filtrado | PRs colgados para siempre | Job que siempre corre |
| Exigir un nombre de matriz (`test (22)`) | Se rompe al cambiar las versiones | Job agregador con nombre fijo |
| Renombrar un job sin tocar el ruleset | Todos los PRs colgados a la vez | Cambia los dos juntos |
| `strict` en un equipo grande sin cola | *Merge starvation* | Merge queue |
| Firmas obligatorias antes de tener clave | Te bloqueas tú | Comprueba `%G?` primero |
| Exigir el check del linter y el del formateador por separado | Dos nombres frágiles | Un job que corre los dos |

## 7. Trucos

- **Comprueba antes de exigir**:
  `gh pr checks <n> --json name --jq '.[].name'`
- **Ver qué checks exige hoy tu rama**:
  ```bash
  gh api repos/{owner}/{repo}/rules/branches/main \
    --jq '.[] | select(.type=="required_status_checks") | .parameters.required_status_checks[].context'
  ```
- **Un PR colgado te lo dice la API**:
  `gh pr view <n> --json statusCheckRollup --jq '.statusCheckRollup[] | {name, status, conclusion}'`
- **Refirmar toda una rama tras un rebase**:
  `git rebase --exec 'git commit --amend --no-edit -S' -i main`
- **Empieza exigiendo un solo check.** Añadir el segundo cuesta una línea; salir
  de un bloqueo, una tarde

## 📚 Recursos Adicionales

- [GitHub Docs — About status checks](https://docs.github.com/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [GitHub Docs — Available rules for rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [GitHub Docs — Signature verification](https://docs.github.com/authentication/managing-commit-signature-verification/about-commit-signature-verification)

## ✅ Checklist de Verificación

- [ ] Sabes de dónde sale exactamente el `context` de un status check
- [ ] Sabes diagnosticar un PR colgado en *Expected*
- [ ] Sabes qué cuesta `strict` según el tamaño del equipo
- [ ] Has comprobado `git log -1 --format='%G?'` antes de exigir firmas
- [ ] Sabes por qué un rebase puede dejarte fuera de la regla de firmas
