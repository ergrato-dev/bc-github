# Práctica 02 — Triaje y auto-merge

> Tienes alertas y tienes pull requests. Ahora toca lo que decide si el sistema
> sirve o se abandona en tres semanas: separar lo que exige una persona de lo que
> no, y automatizar lo segundo sin abrirle la puerta a lo primero.

**Duración estimada**: 40 min
**Prerrequisitos**: [Práctica 01](01-dependabot-en-marcha.md) completada, con el
pull request de `minimist` todavía abierto.
[Teoría 02](../1-teoria/02-alertas-de-dependabot.md) y
[05](../1-teoria/05-convivir-con-los-pr-de-dependabot.md). Un ruleset en `main`
con al menos un check obligatorio (Semana 08)

## Paso 1: Ordenar por lo que importa

**Por qué**: la interfaz ordena por severidad. Severidad no es urgencia. Lo que
decide qué se toca hoy es si hay arreglo, si se ejecuta en producción y si el
mundo lo está explotando.

```bash
gh api "repos/{owner}/{repo}/dependabot/alerts?state=open&per_page=100" \
  --jq '[.[] | {
          n: .number,
          paquete: .dependency.package.name,
          sev: .security_advisory.severity,
          scope: .dependency.scope,
          epss: (.security_advisory.epss.percentage // 0),
          parche: .security_vulnerability.first_patched_version.identifier
        }]
        | sort_by(-.epss)'
```

La API también filtra por sí sola, sin `jq`:

```bash
# Solo lo que tiene arreglo disponible y corre en producción
gh api "repos/{owner}/{repo}/dependabot/alerts?state=open&scope=runtime&has=patch&per_page=100" \
  --jq 'length'
```

**Verifica** que ves tu alerta de `minimist` con su `epss` y su versión
parcheada.

## Paso 2: Descartar con un motivo que signifique algo

**Por qué**: descartar sin comentario es indistinguible de descartar por pereza,
y dentro de un año tú tampoco los vas a distinguir. Vamos a hacerlo bien una vez
para saber cómo se ve.

Coge el número de tu alerta y descártala temporalmente:

```bash
N=<numero-de-la-alerta>

gh api repos/{owner}/{repo}/dependabot/alerts/$N --method PATCH \
  -f state=dismissed \
  -f dismissed_reason=fix_started \
  -f dismissed_comment="Hay un PR de Dependabot abierto; se cierra al fusionarlo."
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/dependabot/alerts/$N \
  --jq '{state, dismissed_reason, dismissed_comment, quien: .dismissed_by.login}'
```

Los cinco motivos válidos son `fix_started`, `inaccurate`, `no_bandwidth`,
`not_used` y `tolerable_risk`. Cualquier otro devuelve `422`.

Ahora reábrela, porque la vamos a arreglar de verdad:

```bash
gh api repos/{owner}/{repo}/dependabot/alerts/$N --method PATCH -f state=open
```

**Verifica** que vuelve a `open`.

## Paso 3: Hablar con Dependabot

**Por qué**: los comandos por comentario son la forma más rápida de dirigir el
bot, y hay uno que resuelve el 90 % de los pull requests raros.

En el pull request de `minimist`:

```bash
PR=$(gh pr list --app dependabot --json number --jq '.[0].number')
gh pr comment "$PR" --body "@dependabot rebase"
```

**Verifica** en el pull request que Dependabot reacciona con 👍 y rebasa la rama.
Tarda menos de un minuto.

> [!WARNING]
> No pruebes aquí `@dependabot ignore this dependency`. Cierra el pull request y
> guarda una condición de ignorado **del lado de GitHub**, no en tu
> `dependabot.yml` — y entonces no vuelve a proponerte esa actualización. Si lo
> haces por error, se deshace con `@dependabot unignore minimist`.

## Paso 4: Cerrar el círculo

**Por qué**: una alerta se cierra sola cuando el arreglo llega a la rama por
defecto. Verlo pasar es lo que convierte esto en un sistema y no en un panel.

```bash
gh pr checks "$PR"          # que el CI esté en verde
gh pr merge "$PR" --squash --delete-branch
```

**Verifica**, tras un par de minutos:

```bash
gh api repos/{owner}/{repo}/dependabot/alerts/$N --jq '{state, fixed_at}'
# {"state":"fixed","fixed_at":"..."}

gh api "repos/{owner}/{repo}/dependabot/alerts?state=open&per_page=100" --jq 'length'
# 0
```

La alerta no desaparece: queda como `fixed`. Ese registro es lo que enseña una
auditoría.

## Paso 5: Auto-merge de lo aburrido

**Por qué**: los `patch` son la mayoría de los pull requests y casi nunca
requieren criterio. Que los revise una persona es gastar atención donde no hace
falta — y la atención es justo lo que va a faltar cuando llegue el que sí
importa.

> [!IMPORTANT]
> Este workflow **fusiona código sin que nadie lo lea**. Solo es aceptable si tu
> ruleset de la Semana 08 exige al menos un check obligatorio: la fusión
> automática espera a que pase. Sin required checks, esto fusiona sin CI.
> Compruébalo antes de continuar:
>
> ```bash
> gh api repos/{owner}/{repo}/rulesets --jq '.[] | select(.enforcement=="active") | .name'
> ```

Primero, la fusión automática tiene que estar permitida en el repositorio:

```bash
gh api repos/{owner}/{repo} --method PATCH -F allow_auto_merge=true
gh api repos/{owner}/{repo} --jq '.allow_auto_merge'
# true
```

Ahora el workflow:

```bash
cat > .github/workflows/dependabot-automerge.yml <<'EOF'
name: Auto-merge de Dependabot

on: pull_request

permissions:
  contents: read

jobs:
  automerge:
    runs-on: ubuntu-latest
    if: github.event.pull_request.user.login == 'dependabot[bot]'
    permissions:
      contents: write
      pull-requests: write
    steps:
      - id: meta
        uses: dependabot/fetch-metadata@25dd0e34f4fe68f24cc83900b1fe3fe149efef98 # v3.1.0

      - name: Activar la fusión automática solo para parches
        if: steps.meta.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --squash "$PR_URL"
        env:
          PR_URL: ${{ github.event.pull_request.html_url }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
EOF
```

Los tres detalles que hacen que esto sea seguro:

- El `if` mira `github.event.pull_request.user.login`, no el título ni el nombre
  de la rama: esos los puede falsificar cualquiera que abra un pull request
- `--auto` no fusiona, **activa** la fusión automática: espera a los checks
- Solo `version-update:semver-patch`. Los `minor` y `major` siguen pasando por
  una persona

```bash
git switch -c ci/automerge-dependabot
git add .github/workflows/dependabot-automerge.yml
git commit -m "ci: fusionar automáticamente los parches de Dependabot"
git push -u origin ci/automerge-dependabot
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica** que los permisos de escritura están en el job y no en el workflow:

```bash
gh api repos/{owner}/{repo}/contents/.github/workflows/dependabot-automerge.yml \
  --jq '.content | @base64d' | python3 -c "import sys, yaml; d=yaml.safe_load(sys.stdin); print('workflow:', d['permissions']); print('job:', d['jobs']['automerge']['permissions'])"
# workflow: {'contents': 'read'}
# job: {'contents': 'write', 'pull-requests': 'write'}
```

## Paso 6: Verlo actuar

**Por qué**: un workflow que nunca has visto ejecutarse es una suposición con
formato YAML.

Espera al próximo pull request de Dependabot —o fuérzalo desde **Insights →
Dependency graph → Dependabot → Check for updates**— y observa:

```bash
gh run list --workflow dependabot-automerge.yml --limit 3 \
  --json event,conclusion,headBranch
```

**Verifica** que en un pull request de `patch` el job activa la fusión
automática, y que en uno de `minor` el paso se salta. Ese salto es la mitad del
valor del ejercicio: la automatización sabe cuándo no actuar.

> [!NOTE]
> Si tu rama `main` usa **merge queue**, el `GITHUB_TOKEN` no puede añadir el
> pull request a la cola. Hace falta un token de usuario o una GitHub App
> (Semana 16), igual que con `release-please` en la Semana 12.

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `422` al descartar | Motivo no válido | Solo los cinco de la lista |
| La alerta no pasa a `fixed` | El arreglo no llegó a la rama por defecto | Comprobar que el PR se fusionó en `main` |
| `gh pr merge --auto` falla | La fusión automática no está permitida | `allow_auto_merge=true` |
| El job no arranca nunca | El `if` compara con el actor equivocado | `github.event.pull_request.user.login` |
| El job arranca y no fusiona | El PR no es de tipo `patch` | Es lo esperado |
| `Resource not accessible by integration` | Faltan permisos en el job | `contents: write` y `pull-requests: write` |
| Se fusiona sin CI | El ruleset no exige checks | Semana 08, antes que esto |

## ✅ Resultado

- [ ] Has ordenado tus alertas por EPSS y por `scope`, no solo por severidad
- [ ] Has descartado una alerta con motivo y comentario, y la has reabierto
- [ ] Has usado un comando `@dependabot` y has visto la reacción
- [ ] La alerta de `minimist` está en `fixed` y no queda ninguna abierta
- [ ] `allow_auto_merge` está activo en el repositorio
- [ ] El workflow de auto-merge existe y limita la automatización a `patch`
- [ ] Los permisos de escritura viven en el job, no en el workflow
- [ ] Has visto el paso saltarse en un pull request que no era `patch`

## 🔗 Siguiente

[Práctica 03 — CodeQL en verde](03-codeql-en-verde.md)

---

← [Volver a la Semana 13](../README.md)
