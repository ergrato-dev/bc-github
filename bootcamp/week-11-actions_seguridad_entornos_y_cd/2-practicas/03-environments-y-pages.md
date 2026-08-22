# Práctica 03 — Un despliegue real, detrás de una puerta

> Tu repositorio pasa a tener algo publicado en internet, construido por un
> workflow, aprobado por una persona y registrado en la API. Es la primera vez en
> el bootcamp que el pipeline toca el mundo exterior.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 05](../1-teoria/05-environments-como-puerta-de-despliegue.md)
y [07](../1-teoria/07-disenar-un-pipeline-de-cd.md);
[Práctica 01](01-endurecer-los-workflows.md) completada

## Contexto

GitHub Pages es el destino de despliegue que un repositorio público en el plan
Free tiene gratis, y usa exactamente el mismo mecanismo que un despliegue a
cualquier nube: un artefacto, un environment, un token OIDC y una API que
registra el resultado.

## Paso 1: Activar Pages con origen "GitHub Actions"

**Por qué**: hasta que Pages no sabe que lo publica un workflow, el job de
despliegue falla con un 404 cuya causa no es evidente.

```bash
gh api repos/{owner}/{repo}/pages --method POST -f build_type=workflow
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/pages --jq '{build_type, html_url, status}'
```

`build_type` debe ser `workflow`. La `html_url` es la dirección de tu sitio.

> [!NOTE]
> En los sitios publicados por workflow, el campo `status` se queda en `null`
> incluso cuando el sitio está sirviendo: ese campo es de la construcción
> clásica. La comprobación de verdad es que la URL responda `200`, y eso lo hace
> el smoke test del paso 3.

> [!NOTE]
> Si el comando devuelve `409 Conflict`, Pages ya estaba activo con otro origen.
> Cámbialo sin recrearlo:
> `gh api repos/{owner}/{repo}/pages --method PUT -f build_type=workflow`.

Activar Pages crea solo el environment `github-pages`:

```bash
gh api repos/{owner}/{repo}/environments --jq '.environments[].name'
```

## Paso 2: El contenido y el pipeline

**Por qué**: el sitio da igual —cámbialo por lo que quieras contar de tu
proyecto—. Lo que importa es que el artefacto lleve sellada la versión, para
poder comprobar después **qué** commit está publicado.

```bash
mkdir -p sitio
cp <ruta-al-bootcamp>/bootcamp/week-11-actions_seguridad_entornos_y_cd/starter/sitio/index.html sitio/index.html
cp <ruta-al-bootcamp>/.../starter/deploy-pages.yml .github/workflows/deploy-pages.yml
```

Descomenta el bloque **PASO 2** de `deploy-pages.yml` (la subida del artefacto
con `actions/upload-pages-artifact`).

**Verifica** que el YAML es válido y que los permisos siguen siendo mínimos:

```bash
python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/deploy-pages.yml')); print(d['permissions'], d['jobs']['desplegar']['permissions'])"
```

Debe imprimir `{'contents': 'read'} {'contents': 'read', 'pages': 'write', 'id-token': 'write'}`.

## Paso 3: Completar el despliegue

**Por qué**: `actions/deploy-pages` es quien crea el despliegue de verdad. Pide
`pages: write` para publicar e `id-token: write` porque el mecanismo por debajo
es el OIDC de la práctica anterior.

Descomenta los bloques **PASO 3** (el `environment:` del job `desplegar`),
**PASO 4** (la action de despliegue) y **PASO 5** (el smoke test), y borra las
dos líneas `- run: echo "Sin el PASO..."` que quedan sueltas.

```bash
git add sitio .github/workflows/deploy-pages.yml
git commit -m "feat: publicar el sitio del proyecto con Actions"
git push
gh run watch
```

**Verifica** que el sitio existe:

```bash
gh api repos/{owner}/{repo}/pages --jq '{build_type, html_url}'
curl -sS -o /dev/null -w '%{http_code}\n' "$(gh api repos/{owner}/{repo}/pages --jq .html_url)"
```

Debe responder `200`. Si responde `404`, espera un minuto: la primera
publicación tarda en propagarse.

## Paso 4: Poner la puerta

**Por qué**: ahora mismo cualquier merge a `main` publica sin que nadie mire. El
environment `github-pages` nace sin revisores; endurecerlo es lo que convierte el
despliegue continuo en entrega continua.

```bash
TU_ID=$(gh api user --jq .id)

gh api repos/{owner}/{repo}/environments/github-pages --method PUT --input - <<JSON
{
  "wait_timer": 0,
  "prevent_self_review": false,
  "reviewers": [{ "type": "User", "id": $TU_ID }],
  "deployment_branch_policy": {
    "protected_branches": true,
    "custom_branch_policies": false
  }
}
JSON
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/environments/github-pages \
  --jq '{reglas: [.protection_rules[].type], ramas: .deployment_branch_policy}'
```

Deben aparecer `required_reviewers` y la política de ramas protegidas.

> [!NOTE]
> `prevent_self_review` va en `false` a propósito: en autoestudio eres el único
> revisor, y con `true` nadie podría aprobar nunca. En un equipo, `true`.

## Paso 5: Ver el despliegue detenido y aprobarlo por API

**Por qué**: la puerta no está dentro del job, está **antes**. Un job en espera
todavía no ha visto tus secretos ni ejecutado un solo step.

Cambia algo del sitio y empuja:

```bash
sed -i 's/Plataforma operativa/Plataforma operativa · v2/' sitio/index.html
git commit -am "feat: actualizar el titular del sitio"
git push
```

El run se queda en *Waiting*. Averigua qué espera:

```bash
RUN=$(gh run list --workflow deploy-pages.yml --limit 1 --json databaseId --jq '.[0].databaseId')
gh api repos/{owner}/{repo}/actions/runs/$RUN/pending_deployments \
  --jq '.[] | {environment: .environment.name, id: .environment.id, puedo_aprobar: .current_user_can_approve}'
```

Y apruébalo desde la terminal:

```bash
ENV_ID=$(gh api repos/{owner}/{repo}/actions/runs/$RUN/pending_deployments --jq '.[0].environment.id')
gh api repos/{owner}/{repo}/actions/runs/$RUN/pending_deployments --method POST \
  -F "environment_ids[]=$ENV_ID" \
  -f state=approved \
  -f comment="Artefacto revisado: sella el SHA correcto"
gh run watch
```

**Verifica** que el despliegue quedó registrado con su autor y su comentario:

```bash
gh api "repos/{owner}/{repo}/deployments?environment=github-pages" \
  --jq '.[0] | {id, sha: .sha[0:7], created_at, creator: .creator.login}'
```

## Paso 6: Comprobar que se publicó lo que se validó

**Por qué**: el objetivo del sellado del paso 2. Sin esto, "está desplegado" es
una creencia.

```bash
URL=$(gh api repos/{owner}/{repo}/pages --jq .html_url)
curl -sS "$URL" | grep -o '<dd>[a-f0-9]\{7\}</dd>'
git rev-parse --short=7 HEAD
```

Las dos salidas deben coincidir.

## Paso 7 (opcional): el 403 que todo el mundo se come

**Por qué**: es el error más común de un despliegue a Pages y su mensaje es
claro solo si lo has visto antes.

En una rama desechable, quita `pages: write` del job `desplegar` y empuja. El run
falla con:

```text
Failed to create deployment (status: 403) ... Ensure GITHUB_TOKEN has permission "pages: write".
```

Devuelve el permiso, cierra el PR y borra la rama.

## ✅ Resultado

- [ ] Pages activo con `build_type: workflow`
- [ ] `deploy-pages.yml` construye, valida, despliega y verifica
- [ ] El job de despliegue solo tiene `pages: write` e `id-token: write`
- [ ] El environment `github-pages` exige revisor y ramas protegidas
- [ ] Has aprobado un despliegue por API, con comentario
- [ ] La versión publicada coincide con el commit de `main`
- [ ] El smoke test comprueba que el sitio responde 200

## 🔗 Siguiente

[Práctica 04 — CD con promoción](04-cd-con-promocion.md)

---

← [Volver a la Semana 11](../README.md)
