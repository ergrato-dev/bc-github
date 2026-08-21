# Glosario — Semana 08

## B

**Branch protection** — Mecanismo clásico de protección de una rama, anterior a
los rulesets. Sigue funcionando y **se suma** a los rulesets que apliquen a la
misma rama. No se escriben nuevas: se leen las que ya existen.

**Bypass actor** — Usuario, equipo, rol o GitHub App autorizado a saltarse un
ruleset. Se declara en `bypass_actors` con un `actor_type`, un `actor_id` y un
`bypass_mode`.

**`bypass_mode`** — Cuándo aplica el bypass: `always` (siempre), `pull_request`
(solo en PRs, solo en rulesets de rama) o `exempt` (las reglas ni se ejecutan y
**no** se registra auditoría).

## C

**Candidato (merge queue)** — Rama temporal `gh-readonly-queue/<base>/pr-<n>-<sha>`
que contiene la base más los PRs anteriores de la cola más este PR. CI corre
sobre el candidato, no sobre el PR.

**Conflicto semántico** — Dos cambios que pasan CI por separado y rompen la rama
al juntarse, sin que Git detecte ningún conflicto de texto. Es el problema que
justifica un merge queue.

**`context`** — Nombre exacto de un status check tal y como GitHub lo reporta. Es
el `name:` del job si está declarado; si no, el ID del job. Con `strategy.matrix`
incluye la matriz: `test (22)`.

## D

**`deletion` (regla)** — Prohíbe borrar las refs que coincidan con el target.

**Deployment branch policy** — Regla de environment que limita desde qué ramas se
puede desplegar. `protected_branches: true` (solo ramas protegidas) o
`custom_branch_policies: true` (patrones propios). Mutuamente excluyentes.

## E

**`enforcement`** — Con cuánta fuerza se aplica un ruleset: `disabled` (borrador,
sin efecto), `evaluate` (registra sin bloquear, **solo GitHub Enterprise**) o
`active` (bloquea).

**Environment** — Destino de despliegue con nombre (`staging`, `production`) que
lleva asociados secretos propios, reglas de protección e historial de
despliegues.

**`evaluate`** — Modo de `enforcement` que registra lo que habría bloqueado sin
bloquear nada. Requiere GitHub Enterprise; en otros planes, el borrador
equivalente es `disabled`.

## G

**GH013** — Código del error que devuelve GitHub cuando un push viola un ruleset:
`Repository rule violations found for refs/heads/<rama>`.

**`gh-readonly-queue/*`** — Prefijo de las ramas temporales que crea y borra el
merge queue. No se tocan ni se protegen.

## M

**Merge queue** — Cola que serializa los merges construyendo candidatos en
paralelo, de forma que ningún PR entre en la rama base sin haberse probado junto
a los que van delante. Disponible solo en repositorios de una organización.

**`merge_group`** — Evento de workflow que dispara CI sobre un candidato del
merge queue. Un workflow que solo escucha `pull_request` deja la cola colgada.

**Merge starvation** — Situación en la que todos los PRs quedan permanentemente
desactualizados porque cada merge invalida el resto. Es lo que produce exigir
rama al día con muchos PRs simultáneos.

**Metadata rules** — Reglas de ruleset que exigen un patrón en el mensaje de
commit, el email del autor o el nombre de la rama o el tag. Solo para
organizaciones en GitHub Enterprise.

## N

**`non_fast_forward` (regla)** — Prohíbe el `push --force` sobre las refs que
coincidan con el target.

## P

**Push ruleset** — Ruleset con `target: "push"` que bloquea pushes por tamaño de
archivo, ruta o extensión, en el repositorio y en toda su red de forks. Requiere
GitHub Team o superior **y** un repositorio privado o interno.

**`prevent_self_review`** — Regla de environment que impide que quien lanzó un
despliegue lo apruebe. En `true` bloquea a quien trabaja solo.

## R

**`required_deployments` (regla)** — Exige que un cambio se haya desplegado con
éxito a environments concretos antes de poder mergearse.

**`required_linear_history` (regla)** — Prohíbe los commits de merge.
Incompatible con `allowed_merge_methods: ["merge"]`.

**`required_signatures` (regla)** — Exige que **todos** los commits estén
firmados y verificados, no solo el último.

**`required_status_checks` (regla)** — Exige que los `context` declarados estén
en verde. Un `context` que ningún check reporta bloquea el PR indefinidamente.

**Rule suite** — Registro de una evaluación de reglas sobre un push o un PR. Es
la salida que hace útil el modo `evaluate`. Endpoint:
`repos/{owner}/{repo}/rulesets/rule-suites`.

**Ruleset** — Lista con nombre de reglas que se aplica a las refs que describen
sus `conditions`. Ejes: `target`, `enforcement` y `rules`.

## S

**Secreto de environment** — Secreto que solo existe para los jobs que declaran
`environment: <nombre>`. Es la forma correcta de guardar una credencial de
producción.

**`strict_required_status_checks_policy`** — Parámetro que exige tener la rama al
día con la base antes de mergear. Correcto en equipos pequeños; con muchos PRs
simultáneos produce merge starvation.

## T

**Target** — A qué se aplica un ruleset: `branch`, `tag` o `push`.

## W

**Wait timer** — Minutos (0 a 43 200) que un despliegue espera antes de
ejecutarse. Es la ventana para cancelar un despliegue lanzado por error.

## Símbolos

**`~ALL` / `~DEFAULT_BRANCH`** — Valores especiales de `conditions.ref_name`:
todas las refs, o la rama por defecto sea cual sea su nombre.

---

← [Volver a la Semana 08](../README.md)
