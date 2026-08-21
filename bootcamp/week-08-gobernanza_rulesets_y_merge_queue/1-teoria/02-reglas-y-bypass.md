# Las reglas una por una, y quién puede saltárselas

> Un ruleset mal escrito no protege: bloquea. Esta es la diferencia entre
> "`main` está protegida" y "nadie puede mergear nada desde el martes".

## 🎯 Objetivos

- Configurar cada regla sabiendo qué hace cada parámetro
- Entender por qué un status check requerido puede bloquear un PR para siempre
- Conceder bypass a un bot sin abrirte un agujero a ti mismo
- Usar `disabled` como borrador cuando `evaluate` no está disponible

## 1. `pull_request` — la regla central

```json
{
  "type": "pull_request",
  "parameters": {
    "required_approving_review_count": 1,
    "require_code_owner_review": true,
    "dismiss_stale_reviews_on_push": true,
    "require_last_push_approval": false,
    "required_review_thread_resolution": true,
    "allowed_merge_methods": ["squash"]
  }
}
```

| Parámetro | Qué hace | Cuándo |
|-----------|----------|--------|
| `required_approving_review_count` | Aprobaciones necesarias | 1 en equipo; **0 si trabajas solo** |
| `require_code_owner_review` | Exige al dueño del área (Semana 07) | Con `CODEOWNERS` |
| `dismiss_stale_reviews_on_push` | Invalida aprobaciones al llegar commits nuevos | Siempre |
| `require_last_push_approval` | Quien pushea el último no aprueba su propio push | Equipos amplios |
| `required_review_thread_resolution` | No se mergea con hilos abiertos | Siempre |
| `allowed_merge_methods` | `merge`, `squash`, `rebase` | Según la Semana 06 |

> [!WARNING]
> `required_approving_review_count: 1` en un repositorio donde eres la única
> persona **bloquea todos tus PRs**: GitHub no te deja aprobar el tuyo. En
> autoestudio, ponlo a `0` y mantén el resto. La regla `pull_request` sigue
> haciendo su trabajo: obliga a pasar por un PR, que es lo que importa.

Poner el contador a 0 no vacía la regla: sigues teniendo prohibido pushear a
`main`, hilos resueltos, checks en verde y revisión de code owners en cuanto haya
un segundo colaborador.

## 2. `required_status_checks` — la que más bloquea

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

El `context` es el **nombre del job**, no el del workflow ni el del archivo: si
`validar-pr.yml` contiene `jobs: validar-titulo:`, el context es
`validar-titulo`. Con `strategy.matrix` incluye la matriz: `test (22)`.

### El check que nunca corre

El error que deja un repositorio bloqueado: si exiges un check que **no se
dispara** en un PR concreto, ese PR se queda en *Expected — Waiting for status to
be reported* **para siempre**. Pasa con `paths:` filtrados que el PR no toca, con
un `if:` de job que no se cumple, o cuando renombras el job y el ruleset sigue
pidiendo el nombre viejo. La solución no es quitar el filtro: es que el job
**exista siempre** y termine en verde cuando no aplica.

```yaml
# El job siempre corre; decide dentro si hay algo que hacer.
permissions:
  contents: read
jobs:
  validar-titulo:          # ← este nombre es el `context` del ruleset
    runs-on: ubuntu-latest
    steps:
      - run: echo "aquí la comprobación real"
```

`strict_required_status_checks_policy: true` exige además que la rama esté al día
con la base. Es correcto, y es justo el problema que resuelve el merge queue
(Teoría 03).

## 3. `required_signatures` — firmas obligatorias

Sin parámetros — `{ "type": "required_signatures" }`: o está o no está.

> [!CAUTION]
> Actívala **después** de comprobar que firmas de verdad (Semana 01), o te
> bloqueas a ti mismo en el siguiente commit:
>
> ```bash
> gh api user/ssh_signing_keys --jq 'length'   # > 0
> git log -1 --format='%G?'                    # G = firma buena
> ```

Detalle que sorprende: los commits que crea **GitHub** por ti (merge desde la
web, edición en el navegador, squash) van firmados por GitHub y pasan la regla.
Los de tu máquina, no, salvo que los firmes.

## 4. Las reglas de historia

| Regla | Qué prohíbe | Por qué importa |
|-------|-------------|-----------------|
| `non_fast_forward` | `push --force` sobre la rama | Borra trabajo ajeno sin dejar rastro en la UI |
| `deletion` | Borrar la rama | Evita el `-X DELETE` accidental |
| `required_linear_history` | Commits de merge | Coherente con `squash` o `rebase` |
| `creation` / `update` | Crear / mover refs que coincidan | Tags inmutables: nadie mueve `v1.2.3` |

`required_linear_history` y `allowed_merge_methods: ["merge"]` son
**incompatibles**: el merge commit del segundo lo rechaza el primero.

## 5. Bypass actors

Un *bypass actor* es quien puede saltarse el ruleset.

```json
"bypass_actors": [
  { "actor_type": "Integration", "actor_id": 15368, "bypass_mode": "always" }
]
```

| `actor_type` | `actor_id` | Uso típico |
|--------------|------------|------------|
| `Integration` | ID de la GitHub App | El bot de releases que pushea el changelog |
| `User` | ID numérico (`gh api user --jq .id`) | Excepción puntual y documentada |
| `Team` / `RepositoryRole` | ID del equipo o del rol | Organizaciones |
| `OrganizationAdmin` | se ignora | Administradores de la organización |
| `DeployKey` | `null` | Claves de despliegue |

`bypass_mode`: `always` (siempre), `pull_request` (solo en PRs; solo rulesets de
rama) o `exempt` (las reglas ni se ejecutan y **no** se registra la auditoría).

### La regla de oro del bypass

**Bypass para el bot, no para ti.** Tu usuario con `always` convierte el ruleset
en una sugerencia: el día que tengas prisa te lo saltarás, y ese es justo el día
en que la regla existía para pararte. ¿Necesitas saltártelo una vez? Pon el
ruleset en `disabled`, hazlo, y vuelve a `active`: queda en el historial, que es
precisamente el punto.

## 6. Probar sin romper: `disabled` y las rule suites

El estado intermedio que tienes disponible es `disabled`: el ruleset existe, se
puede leer y revisar, y no aplica nada. Es tu borrador.

```bash
gh api repos/{owner}/{repo}/rulesets/<id> --jq '[.rules[].type]'
```

El estado `evaluate` (no bloquea pero **sí registra** lo que habría bloqueado)
requiere GitHub Enterprise. Su registro son las *rule suites*, y el endpoint
existe en cualquier plan aunque salga vacío:

```bash
gh api repos/{owner}/{repo}/rulesets/rule-suites \
  --jq '.[] | {actor: .actor_name, ref: .ref, resultado: .result}'
```

La operación completa está en la
[Práctica 01](../2-practicas/01-primer-ruleset.md).

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `required_approving_review_count: 1` trabajando solo | Nada se puede mergear | 0, y el resto igual |
| Bypass `always` para tu usuario | La regla deja de existir | Bypass solo para Apps |
| `exempt` "para no ver ruido" | Pierdes también la auditoría | `always` si hace falta |
| Exigir un check con `paths:` filtrado | PRs colgados para siempre | Job que siempre corre |
| Firmas obligatorias antes de tener clave | Te bloqueas tú | Comprueba `%G?` primero |

## 8. Trucos

- **El `context` es el nombre del job**; con matriz lleva la matriz: `test (22)`
- **Comprueba antes de exigir**: `gh pr checks <n> --json name --jq '.[].name'`
- **`disabled` es tu escape**, mejor que un bypass permanente
- **Rule suites es el log del ruleset**: `gh api repos/{owner}/{repo}/rulesets/rule-suites`
- **Tu propio ID**: `gh api user --jq .id`

## 📚 Recursos Adicionales

- [GitHub Docs — Available rules for rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets)
- [REST API — Repository rules](https://docs.github.com/rest/repos/rules)

## ✅ Checklist de Verificación

- [ ] Sabes por qué `required_approving_review_count: 1` te bloquea trabajando solo
- [ ] Sabes de dónde sale el `context` de un status check
- [ ] Distingues `always`, `pull_request` y `exempt`
- [ ] Has comprobado `git log -1 --format='%G?'` antes de exigir firmas
