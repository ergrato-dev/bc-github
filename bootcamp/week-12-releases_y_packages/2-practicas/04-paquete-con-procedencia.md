# Práctica 04 — El paquete y su procedencia

> Última pieza: lo que se instala como dependencia. Al terminar, tu proyecto está
> publicado en el registro de GitHub, con una declaración firmada de qué commit y
> qué workflow lo construyeron, y sabes verificarla desde fuera.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 06](../1-teoria/06-registro-npm-y-github-packages.md)
y [07](../1-teoria/07-procedencia-verificable.md);
[Práctica 03](03-imagen-en-ghcr.md) completada, con el scope `read:packages`

## Contexto

Se publica en `npm.pkg.github.com` porque no hace falta ninguna cuenta externa ni
ningún secreto propio. El registro de GitHub no genera declaraciones de
procedencia —eso es exclusivo de npmjs—, así que aquí se atestigua el `.tgz` a
mano, que es el mecanismo genérico y el que sirve para cualquier artefacto.

## Paso 1: Preparar el `package.json`

**Por qué**: tres campos deciden dónde acaba el paquete y qué lleva dentro. Los
tres se equivocan con facilidad y ninguno se puede corregir después de publicar.

```jsonc
{
  "name": "@tu-usuario/tu-repo",          // scope obligatorio, en minúsculas
  "version": "1.1.1",                      // la gestiona release-please
  "packageManager": "pnpm@11.22.0",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/tu-usuario/tu-repo.git"
  },
  "files": ["src", "README.md", "LICENSE"],
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

**Verifica** qué archivos entrarían en el paquete, antes de que sea irreversible:

```bash
pnpm pack
tar -tzf ./*.tgz
rm ./*.tgz
```

Si ahí aparece un `.env`, un directorio de tests o el `node_modules`, arregla
`files` ahora.

> [!IMPORTANT]
> El `name` con scope no es opcional en GitHub Packages, y el scope tiene que ser
> tu propietario en minúsculas. Si tu usuario tiene mayúsculas, el paquete las
> lleva en minúsculas y el `repository` **no**: esa comparación distingue
> mayúsculas.

## Paso 2: El workflow

**Por qué**: publicar desde tu portátil produce un paquete que no se puede
atestiguar, porque no hay build del que hablar.

```bash
RUTA=<ruta-al-bootcamp>/bootcamp/week-12-releases_y_packages/starter
cp "$RUTA/publicar-npm.yml" .github/workflows/publicar-npm.yml
```

Descomenta los bloques **PASO 2** (pnpm, Node y registro), **PASO 3** (mirar el
contenido) y **PASO 4** (publicar), y borra la línea
`- run: echo "Sin los PASOS 2-5..."`.

**Verifica** el orden de las actions y los permisos:

```bash
python3 - <<'PY'
import yaml
d = yaml.safe_load(open('.github/workflows/publicar-npm.yml'))
pasos = [s.get('uses', s.get('run', ''))[:40] for s in d['jobs']['publicar']['steps']]
print(*pasos, sep='\n')
print(d['jobs']['publicar']['permissions'])
PY
```

`pnpm/action-setup` tiene que aparecer **antes** que `actions/setup-node`, como
en la Semana 09.

## Paso 3: Publicar

**Por qué**: el evento es `release: published`. Lo que se publica es una versión,
no un commit.

Lleva un cambio hasta el release, como en las prácticas anteriores:

```bash
git switch -c feat/exportar-json
# ... el cambio ...
git commit -m "feat: exportar el catálogo también a JSON"
git push -u origin feat/exportar-json
gh pr create --fill --label enhancement
gh pr merge --squash --delete-branch

PR=$(gh pr list --search "in:title release" --json number --jq '.[0].number')
gh pr merge "$PR" --squash
gh run watch
```

**Verifica** que el paquete llegó al registro:

```bash
gh api users/{owner}/packages/npm/<nombre-del-repo> \
  --jq '{name, visibility, version_count: .version_count}'

gh api users/{owner}/packages/npm/<nombre-del-repo>/versions \
  --jq '.[0].name'
# 1.2.0
```

## Paso 4: Instalarlo desde fuera

**Por qué**: publicar no es lo mismo que ser instalable. Y aquí aparece la
diferencia real entre los dos registros.

En un directorio vacío, **fuera** de tu repositorio:

```bash
mkdir /tmp/prueba-instalacion && cd /tmp/prueba-instalacion
pnpm init
pnpm add @tu-usuario/tu-repo
```

Falla con un `401` o un `404`. **GitHub Packages exige autenticación siempre**,
aunque el paquete sea público. Configúrala y repite:

```bash
{
  echo "@tu-usuario:registry=https://npm.pkg.github.com"
  echo "//npm.pkg.github.com/:_authToken=$(gh auth token)"
} > .npmrc

pnpm add @tu-usuario/tu-repo
```

**Verifica** que se instaló:

```bash
cat node_modules/@tu-usuario/tu-repo/package.json | head -5
```

> [!WARNING]
> Ese `.npmrc` contiene un token. Está en `/tmp` y fuera de ningún repositorio a
> propósito. Bórralo al terminar: `rm -rf /tmp/prueba-instalacion`. Nunca
> commitees un `.npmrc` con la línea `_authToken`.

Esta fricción es exactamente el motivo por el que una librería pensada para
público abierto va a npmjs y no aquí.

## Paso 5: La procedencia

**Por qué**: sin ella, el paquete no dice de dónde salió. Con ella, cualquiera
puede comprobar el commit y el workflow que lo construyeron.

Descomenta el **PASO 5** de `publicar-npm.yml` (la atestación) y publica otra
versión.

Descomenta también el bloque de `actions/upload-artifact` que va justo debajo:
sin él no tendrías en local el `.tgz` exacto que se atestiguó.

**Verifica** desde local, sobre ese tarball:

```bash
cd /tmp && rm -rf verificacion && mkdir verificacion && cd verificacion
RUN=$(gh run list --workflow publicar-npm.yml --limit 1 --json databaseId --jq '.[0].databaseId' -R <tu-usuario>/<tu-repo>)
gh run download "$RUN" -n paquete -R <tu-usuario>/<tu-repo>

gh attestation verify ./*.tgz \
  --repo <tu-usuario>/<tu-repo> \
  --signer-workflow <tu-usuario>/<tu-repo>/.github/workflows/publicar-npm.yml
echo "código de salida: $?"
```

Código de salida `0`.

**Verifica** también que la atestación quedó registrada en GitHub:

```bash
DIGEST=$(sha256sum ./*.tgz | cut -d' ' -f1)
gh api repos/{owner}/{repo}/attestations/sha256:$DIGEST --jq '.attestations | length'
# 1
```

> [!NOTE]
> Leer ese JSON **no es verificar**: no comprueba ninguna firma. La verificación
> criptográfica la hace `gh attestation verify` y nada más. El endpoint sirve
> para inventariar.

## Paso 6: Documentar cómo se consume

**Por qué**: una atestación que nadie comprueba es un adorno. Si no está escrito
en el README, nadie la va a comprobar.

Añade a tu `README.md`:

```markdown
## Instalación y verificación

    pnpm add @tu-usuario/tu-repo     # requiere .npmrc con el registro de GitHub

Para comprobar de dónde salió el paquete antes de usarlo:

    gh attestation verify <paquete>.tgz \
      --repo tu-usuario/tu-repo \
      --signer-workflow tu-usuario/tu-repo/.github/workflows/publicar-npm.yml

La imagen equivalente:

    docker pull ghcr.io/tu-usuario/tu-repo:1.2.0
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/readme --jq '.content | @base64d' | grep -c "attestation verify"
# al menos 1
```

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `401 Unauthorized` al publicar | `NODE_AUTH_TOKEN` fuera del `env` del step | Va en el `env` de `pnpm publish` |
| `ERR_PNPM_GIT_UNCLEAN` o aborta por rama | Faltan los `--no-git-checks` | El checkout está en un tag, no en `main` |
| `404` al publicar | El scope del `name` no es tu propietario | `@tu-usuario/…`, en minúsculas |
| Se publica en npmjs por error | Falta `publishConfig.registry` | Declararlo siempre |
| `403` en `gh api .../packages/...` | Falta el scope | `gh auth refresh -s read:packages` |
| La atestación no verifica | `--signer-workflow` apunta a otro archivo | Ruta completa `OWNER/REPO/.github/workflows/x.yml` |

## ✅ Resultado

- [ ] `package.json` con scope, `files`, `repository` y `publishConfig.registry`
- [ ] `publicar-npm.yml` con `pnpm/action-setup` antes de `setup-node`
- [ ] El paquete existe en GitHub Packages con al menos dos versiones
- [ ] Has visto fallar la instalación sin autenticación y funcionar con ella
- [ ] El `.tgz` publicado tiene atestación y la has verificado en local
- [ ] El `README.md` explica cómo verificar antes de usar
- [ ] Has borrado el `.npmrc` de prueba con el token dentro

## 🔗 Siguiente

[Proyecto de la semana](../3-proyecto/README.md)

---

← [Volver a la Semana 12](../README.md)
