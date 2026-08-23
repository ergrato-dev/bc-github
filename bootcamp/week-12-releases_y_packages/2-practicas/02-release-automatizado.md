# Práctica 02 — Release automatizado

> Dejas de escribir versiones. A partir de esta práctica, publicar consiste en
> fusionar un pull request que alguien —una action— ha preparado leyendo tus
> mensajes de commit.

**Duración estimada**: 50 min
**Prerrequisitos**: [Teoría 02](../1-teoria/02-semver-en-la-practica.md) y
[04](../1-teoria/04-release-please-y-el-pr-de-release.md);
[Práctica 01](01-tu-primer-release.md) completada, con `v1.0.0` publicado

## Contexto

`release-please` lee los commits desde el último release, calcula la versión
siguiente y abre un pull request con el `package.json` y el `CHANGELOG.md` ya
actualizados. Fusionarlo crea el tag y el release.

## Paso 1: El token, y por qué no vale el del run

**Por qué**: `release-please` necesita **crear pull requests**, y en la Semana 11
dejaste eso desactivado para los workflows. Compruébalo:

```bash
gh api repos/{owner}/{repo}/actions/permissions/workflow \
  --jq '.can_approve_pull_request_reviews'
# false
```

Reactivarlo devolvería a **todos** los workflows del repositorio la capacidad de
aprobar pull requests. La alternativa es un token propio con el alcance mínimo.

La creación de un token fine-grained no tiene API: se hace en la interfaz, en
**Settings → Developer settings → Personal access tokens → Fine-grained tokens →
Generate new token**, con exactamente esto:

| Campo | Valor |
|-------|-------|
| Resource owner | Tu cuenta |
| Expiration | 90 días |
| Repository access | *Only select repositories* → **solo tu repo del bootcamp** |
| Repository permissions → Contents | Read and write |
| Repository permissions → Pull requests | Read and write |

Nada más. Si añades `Administration` o lo apuntas a todos tus repositorios, has
construido justo lo que querías evitar.

Guárdalo como secreto **sin que pase por la línea de comandos**:

```bash
gh secret set RELEASE_PLEASE_TOKEN
# pega el token cuando lo pida y pulsa Enter
```

**Verifica** que existe (la API nunca devuelve el valor):

```bash
gh api repos/{owner}/{repo}/actions/secrets/RELEASE_PLEASE_TOKEN \
  --jq '{name, created_at}'
```

> [!IMPORTANT]
> Anota la fecha de caducidad donde la vayas a ver. Un token caducado hace que
> `release-please` falle con un `403` que no menciona la caducidad, y el
> diagnóstico se lleva media tarde.

## Paso 2: Configuración y manifiesto

**Por qué**: el manifiesto es la fuente de verdad de la versión actual. Tiene que
arrancar en la versión que ya publicaste, o el primer cálculo saldrá mal.

```bash
RUTA=<ruta-al-bootcamp>/bootcamp/week-12-releases_y_packages/starter
cp "$RUTA/release-please-config.json" release-please-config.json
cp "$RUTA/release-please.yml" .github/workflows/release.yml

echo '{".": "1.0.0"}' > .release-please-manifest.json
```

Ajusta `release-please-config.json` si tu proyecto no es Node. Descomenta el
**PASO 2** del workflow (el bloque de `googleapis/release-please-action`).

**Verifica** que el YAML es válido y que el `GITHUB_TOKEN` sigue en solo lectura:

```bash
python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/release.yml')); print(d['permissions'])"
# {'contents': 'read'}
```

Los permisos del run se quedan en `read` a propósito: quien escribe es el token
del secreto, no el token del workflow.

```bash
git add release-please-config.json .release-please-manifest.json .github/workflows/release.yml
git commit -m "ci: automatizar los releases con release-please"
git push
gh run watch
```

Ese push no crea ningún pull request: `chore:` y `ci:` no producen versión.

## Paso 3: Provocar el primer PR de release

**Por qué**: hasta que no haya un `feat:` o un `fix:` sin publicar, no hay nada
que versionar. Es la comprobación de que el cálculo funciona, no un trámite.

Haz un cambio real en tu proyecto y entra por pull request, como manda el ruleset
de la Semana 08:

```bash
git switch -c feat/exportar-catalogo
# ... el cambio ...
git commit -m "feat: exportar el catálogo a CSV"
git push -u origin feat/exportar-catalogo
gh pr create --fill --label enhancement
gh pr merge --squash --delete-branch
```

**Verifica** que apareció el pull request de release:

```bash
gh pr list --search "in:title release" --json number,title,headRefName
# chore(main): release 1.1.0
```

Si no aparece, mira el run:

```bash
gh run list --workflow release.yml --limit 1
gh run view --log-failed
```

## Paso 4: Revisar el PR de release

**Por qué**: es un pull request, no un botón. El diff del `CHANGELOG.md` es la
única revisión que vas a hacer de tus propios mensajes de commit.

```bash
PR=$(gh pr list --search "in:title release" --json number --jq '.[0].number')
gh pr diff "$PR"
```

Comprueba tres cosas:

1. La versión sube a `1.1.0` y no a `1.0.1` — fue un `feat:`
2. La entrada del `CHANGELOG.md` se entiende sin abrir el commit
3. El `package.json` y `.release-please-manifest.json` cambian juntos

Si una entrada no se entiende, el problema estaba en el mensaje de commit y esta
es la última oportunidad de verlo.

## Paso 5: Fusionar y ver nacer el release

**Por qué**: aquí es donde `release-please` crea el tag y el release.

```bash
gh pr merge "$PR" --squash
gh run watch
```

> [!NOTE]
> **Squash, no merge commit.** Los commits que crea `release-please` no van
> firmados, y tu ruleset de la Semana 08 exige firmas en `main`. Con `--squash`,
> el único commit que aterriza en `main` lo crea GitHub, que sí lo firma. Con un
> merge commit, la fusión se rechaza.

**Verifica** los tres efectos:

```bash
gh api repos/{owner}/{repo}/releases --jq 'length'          # 2
gh release list --limit 2 --json tagName,isLatest,isImmutable
gh api repos/{owner}/{repo}/contents/CHANGELOG.md --jq '.type'
```

Y que el manifiesto quedó al día:

```bash
gh api repos/{owner}/{repo}/contents/.release-please-manifest.json \
  --jq '.content | @base64d'
# {".": "1.1.0"}
```

## Paso 6: Encadenar lo que viene después

**Por qué**: las prácticas 03 y 04 se disparan con `release: published`. Este
paso deja el workflow preparado para saber **cuándo** ha publicado de verdad.

Descomenta el **PASO 4** (los `outputs` del job) y el **PASO 5** (el resumen) de
`.github/workflows/release.yml`, y empuja por pull request.

**Verifica** en la siguiente ejecución que el resumen dice lo correcto:

```bash
gh run list --workflow release.yml --limit 1 --json databaseId --jq '.[0].databaseId'
gh run view <id>   # el resumen aparece al final
```

En un push que no publica, `release_created` está vacío y el resumen lo dice.

## Paso 7 (opcional): El fallo que se ahorra media tarde

**Por qué**: conviene haber visto el error del token antes de encontrártelo con
prisa.

En una rama desechable, cambia `token: ${{ secrets.RELEASE_PLEASE_TOKEN }}` por
`token: ${{ secrets.GITHUB_TOKEN }}` y empuja un `fix:`. El run falla con:

```text
GitHub Actions is not permitted to create or approve pull requests
```

Devuelve el token bueno, cierra el PR y borra la rama.

## ✅ Resultado

- [ ] `RELEASE_PLEASE_TOKEN` existe como secreto, con alcance de un solo repositorio
- [ ] `release-please-config.json` y `.release-please-manifest.json` en el repositorio
- [ ] `.github/workflows/release.yml` con el `GITHUB_TOKEN` en `contents: read`
- [ ] Un pull request de release apareció solo y lo has revisado
- [ ] `v1.1.0` publicado, con `CHANGELOG.md` en el repositorio
- [ ] El manifiesto refleja la versión publicada
- [ ] El workflow expone `release_created` y `tag_name`

## 🔗 Siguiente

[Práctica 03 — Imagen en GHCR](03-imagen-en-ghcr.md)

---

← [Volver a la Semana 12](../README.md)
