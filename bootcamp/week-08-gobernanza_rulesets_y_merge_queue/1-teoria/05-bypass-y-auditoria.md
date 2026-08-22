# Bypass y auditoría

> Una regla sin excepciones se acaba desactivando entera. El arte está en dar la
> excepción justa, a quien de verdad la necesita, y que quede escrito.

## 🎯 Objetivos

- Conceder bypass a un bot sin abrirte un agujero a ti mismo
- Distinguir los tres modos de bypass y cuándo usar cada uno
- Probar un ruleset sin bloquear a nadie usando `disabled`
- Leer las *rule suites* y el historial de un ruleset
- Salir de un bloqueo sin destruir la gobernanza

## 1. Qué problema resuelve

Hay tres situaciones legítimas en las que algo tiene que saltarse las reglas:

- El bot de releases empuja el `CHANGELOG.md` y la etiqueta a `main`
- Una migración masiva que hay que hacer una vez y con testigos
- Un incidente en producción a las tres de la mañana

Y una ilegítima, que es la que se lleva por delante la gobernanza de la mayoría
de repositorios: **tener prisa**.

## 2. Bypass actors

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

### Los tres modos

| `bypass_mode` | Qué hace | Cuándo |
|---------------|----------|--------|
| `always` | Se salta las reglas siempre | Bots que empujan a `main` por diseño |
| `pull_request` | Solo dentro de un PR — solo en rulesets de rama | Un rol que puede mergear sin todas las aprobaciones |
| `exempt` | Las reglas ni se evalúan, y **no** queda registro | Casi nunca |

`exempt` es tentador porque quita el ruido de las *rule suites*, y es justo lo que
no quieres: pierdes la auditoría, que es la mitad del valor de tener reglas.

## 3. La regla de oro

**Bypass para el bot, no para ti.**

Tu usuario con `always` convierte el ruleset en una sugerencia. El día que tengas
prisa te lo saltarás, y ese es exactamente el día en que la regla existía para
pararte.

¿Necesitas saltártelo una vez? Pon el ruleset en `disabled`, hazlo, y vuelve a
`active`. Cuesta dos comandos, y queda en el historial del ruleset, que es
precisamente el punto: la excepción se ve.

```bash
gh api repos/{owner}/{repo}/rulesets/<id> --method PUT -f enforcement=disabled
# ...la operación excepcional...
gh api repos/{owner}/{repo}/rulesets/<id> --method PUT -f enforcement=active
```

### Cómo se identifica a un bot

```bash
gh api user --jq .id                              # tu ID de usuario
gh api /users/dependabot%5Bbot%5D --jq .id        # el ID de un bot conocido
gh api repos/{owner}/{repo}/installations \
  --jq '.installations[] | {app: .app_slug, id: .app_id}'
```

Ese `app_id` es el `actor_id` de un `Integration`. Confundir el ID de la App con
el ID de la instalación es el error clásico: el bypass no funciona y no dice por
qué.

## 4. Probar sin romper: `disabled`

El estado intermedio disponible en todos los planes es `disabled`: el ruleset
existe, se lee, se revisa y no aplica nada. Es tu borrador.

El flujo completo para estrenar un ruleset sin bloquear a nadie:

```bash
# 1. Crear en disabled
gh api repos/{owner}/{repo}/rulesets --method POST --input ruleset.json

# 2. Leer lo que quedó guardado, que no siempre es lo que creías
gh api repos/{owner}/{repo}/rulesets/<id> --jq '[.rules[].type]'

# 3. Comprobar que el context existe de verdad
gh pr checks <numero> --json name --jq '.[].name'

# 4. Comprobar que firmas de verdad
git log -1 --format='%G?'

# 5. Solo entonces
gh api repos/{owner}/{repo}/rulesets/<id> --method PUT -f enforcement=active
```

El modo `evaluate` —no bloquea pero **sí registra** lo que habría bloqueado—
requiere GitHub Enterprise. `disabled` no registra intentos, pero evita el 90 %
de los bloqueos accidentales.

## 5. Rule suites: el log del ruleset

Cada vez que alguien empuja o abre un PR contra una rama con reglas, queda una
entrada. El endpoint existe en cualquier plan, aunque en Free salga poco poblado:

```bash
gh api repos/{owner}/{repo}/rulesets/rule-suites \
  --jq '.[] | {actor: .actor_name, ref: .ref, resultado: .result}'

gh api repos/{owner}/{repo}/rulesets/rule-suites/<id> \
  --jq '.rule_evaluations[] | {regla: .rule_type, resultado: .result}'
```

`result` vale `pass`, `fail` o `bypass`. Ese último valor es el que interesa
auditar: **cada bypass es una decisión que alguien tomó**, y verlos juntos dice
más del estado real de la gobernanza que leer las reglas.

## 6. El historial del ruleset

Los rulesets se versionan, y eso es lo que branch protection nunca tuvo:

```bash
gh api repos/{owner}/{repo}/rulesets/<id>/history \
  --jq '.[] | {version: .version_id, actor: .actor.login, fecha: .updated_at}'

gh api repos/{owner}/{repo}/rulesets/<id>/history/<version_id> --jq '[.rules[].type]'
```

Con eso se responde la pregunta que siempre aparece después de un incidente:
**¿desde cuándo esto no estaba protegido, y quién lo cambió?**

Y por eso conviene además versionar el ruleset como JSON en el propio
repositorio: el historial de GitHub dice qué cambió; el del repositorio dice
**por qué**, en el PR que lo cambió.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Bypass `always` para tu usuario | La regla deja de existir | Bypass solo para Apps |
| `exempt` "para no ver ruido" | Pierdes también la auditoría | `always` si hace falta |
| Desactivar el ruleset y olvidarse de reactivarlo | La protección se evapora en silencio | Reactívalo en el mismo rato |
| Bypass a un equipo entero | Es lo mismo que no tener regla | Al bot concreto |
| Confundir App ID con installation ID | El bypass no funciona y no explica por qué | `installations --jq .app_id` |
| Ruleset solo en la interfaz | Nadie sabe por qué está así | JSON versionado en el repositorio |
| No mirar nunca las rule suites | No sabes cuántas veces se ha saltado | Revísalo cada trimestre |

## 8. Trucos

- **Tu propio ID**: `gh api user --jq .id`
- **`disabled` es tu escape**, siempre mejor que un bypass permanente
- **Exportar un ruleset** para versionarlo o copiarlo:
  ```bash
  gh api repos/{owner}/{repo}/rulesets/<id> \
    --jq 'del(.id, .node_id, .created_at, .updated_at, .source, .source_type, ._links)' \
    > .github/rulesets/main.json
  ```
- **Auditar los bypass del último trimestre**:
  `gh api repos/{owner}/{repo}/rulesets/rule-suites --jq '[.[] | select(.result=="bypass")] | length'`
- **Un PR para cambiar la gobernanza**: si el ruleset vive como JSON en el repo,
  cambiarlo pasa por revisión como cualquier otro cambio
- **Apunta en el propio JSON por qué existe cada bypass**: un campo de
  descripción o un comentario en el PR que lo introdujo

## 📚 Recursos Adicionales

- [GitHub Docs — Managing rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository)
- [REST API — Repository rules](https://docs.github.com/rest/repos/rules)
- [REST API — Rule suites](https://docs.github.com/rest/repos/rule-suites)

## ✅ Checklist de Verificación

- [ ] Distingues `always`, `pull_request` y `exempt`
- [ ] Ningún bypass de tus rulesets apunta a tu usuario
- [ ] Has estrenado un ruleset pasando por `disabled` antes de `active`
- [ ] Sabes leer las rule suites y el historial de un ruleset
- [ ] Tu ruleset está versionado como JSON en el repositorio
