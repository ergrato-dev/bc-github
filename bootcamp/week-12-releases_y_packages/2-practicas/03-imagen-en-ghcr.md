# Práctica 03 — La imagen en GHCR

> Tu proyecto pasa a ser algo que otra persona puede ejecutar sin instalar nada:
> una imagen publicada, etiquetada con la versión que acabas de publicar, firmada
> por tu pipeline y comprobable desde fuera.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 05](../1-teoria/05-ghcr-publicar-una-imagen.md) y
[07](../1-teoria/07-procedencia-verificable.md);
[Práctica 02](02-release-automatizado.md) completada

## Paso 0: El scope que falta

**Por qué**: los endpoints de `packages` devuelven `403` con el token que crea
`gh auth login`, incluso para paquetes públicos. Sin esto, la mitad de las
verificaciones de esta práctica y el autograding de la semana fallan sin decir
por qué.

```bash
gh auth refresh -s read:packages
```

**Verifica**:

```bash
gh auth status | grep -i "token scopes"
# ... 'read:packages' ...
```

## Paso 1: El `Dockerfile`

**Por qué**: la etiqueta `org.opencontainers.image.source` es lo que vincula el
paquete con el repositorio. Sin ella el paquete nace huérfano, sin README y sin
heredar permisos.

```bash
RUTA=<ruta-al-bootcamp>/bootcamp/week-12-releases_y_packages/starter
cp "$RUTA/Dockerfile" Dockerfile
```

Cambia `OWNER/REPO` por los tuyos y ajusta el `CMD` al punto de entrada real.

**Verifica** en local que construye (si tienes Docker; si no, lo dirá el CI):

```bash
docker build -t prueba-local .
docker run --rm prueba-local --help || true
```

## Paso 2: El workflow

**Por qué**: publicar a mano desde tu portátil deja una imagen que nadie puede
reproducir y sin nada que atestiguar.

```bash
cp "$RUTA/publicar-imagen.yml" .github/workflows/publicar-imagen.yml
```

Descomenta los bloques **PASO 2** (login), **PASO 3** (metadata) y **PASO 4**
(build y push), y borra la línea `- run: echo "Sin los PASOS 2-5..."`.

**Verifica** que los permisos de escritura están solo en el job que publica:

```bash
python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/publicar-imagen.yml')); print(d['permissions'], d['jobs']['publicar']['permissions'])"
```

Debe imprimir `{'contents': 'read'}` y, en el job, `packages`, `id-token` y
`attestations` en `write`.

```bash
git add Dockerfile .github/workflows/publicar-imagen.yml
git commit -m "feat: publicar la imagen del proyecto en GHCR"
git push
```

## Paso 3: La primera publicación, a mano

**Por qué**: `workflow_dispatch` permite probar el pipeline sin gastar una
versión. Ojo al detalle que enseña: con un disparo manual **no hay tag**, así que
`type=semver` no genera nada y la imagen sale solo con la etiqueta `sha-…`.

```bash
gh workflow run publicar-imagen.yml
gh run watch
```

**Verifica** que el paquete existe:

```bash
gh api users/{owner}/packages/container/<nombre-del-repo> \
  --jq '{name, visibility, repository: .repository.full_name}'
```

`visibility` dirá `private`. Es lo esperado: **un paquete de GHCR nace privado
aunque el repositorio sea público**.

## Paso 4: Hacerlo público

**Por qué**: es el único ajuste de la semana sin API. Y es el que separa «la
imagen está publicada» de «alguien puede descargarla».

En la página del paquete —`https://github.com/users/<tu-usuario>/packages/container/package/<nombre>`—
→ **Package settings** → *Danger Zone* → **Change visibility** → *Public*.

**Verifica** por API y, sobre todo, sin credenciales:

```bash
gh api users/{owner}/packages/container/<nombre-del-repo> --jq '.visibility'
# public

docker logout ghcr.io
docker pull ghcr.io/<tu-usuario>/<nombre-del-repo>:sha-<los-7-primeros>
```

Un `pull` anónimo que funciona es la prueba de que está publicado de verdad.

## Paso 5: Publicar con una versión

**Por qué**: ahora el disparador real. Al publicar un release, `type=semver`
produce `1.1.1`, `1.1` y `1`, que es lo que consume la gente.

Haz un `fix:` y déjalo llegar hasta el release, como en la práctica anterior:

```bash
git switch -c fix/mensaje-de-error
# ... el cambio ...
git commit -m "fix: mensaje de error cuando el catálogo está vacío"
git push -u origin fix/mensaje-de-error
gh pr create --fill --label bug
gh pr merge --squash --delete-branch

# espera al PR de release y fusiónalo
PR=$(gh pr list --search "in:title release" --json number --jq '.[0].number')
gh pr merge "$PR" --squash
gh run watch
```

**Verifica** que el release disparó la publicación y que las etiquetas son las
esperadas:

```bash
gh run list --workflow publicar-imagen.yml --limit 1 --json event,conclusion
# {"event":"release","conclusion":"success"}

gh api users/{owner}/packages/container/<nombre-del-repo>/versions \
  --jq '.[0].metadata.container.tags'
# ["1","1.1","1.1.1","sha-..."]
```

> [!NOTE]
> Esto funciona porque el release lo creó `release-please` con un token de
> usuario. Un release creado por el `GITHUB_TOKEN` **no dispara workflows**, y
> este job no habría arrancado.

## Paso 6: Firmar y verificar

**Por qué**: hasta aquí tienes una imagen publicada de la que nadie puede
demostrar el origen.

Descomenta el **PASO 5** (la atestación) y el **PASO 6** (el job `verificar`), y
borra la línea `- run: echo "Sin el PASO 6..."`. Empuja por pull request y
publica otra versión, o lanza el workflow a mano.

**Verifica** en el run que el job `verificar` pasa, y compruébalo tú desde
local:

```bash
gh auth token | docker login ghcr.io -u "$(gh api user --jq .login)" --password-stdin
gh attestation verify oci://ghcr.io/<tu-usuario>/<nombre-del-repo>:1.1.1 \
  --repo <tu-usuario>/<nombre-del-repo> \
  --signer-workflow <tu-usuario>/<nombre-del-repo>/.github/workflows/publicar-imagen.yml
echo "código de salida: $?"
```

Código de salida `0`. Ese número es lo que se pone en un script de despliegue; el
texto en verde es para las personas.

## Paso 7 (opcional): Ver fallar la verificación

**Por qué**: una verificación que nunca ha dicho que no, no ha demostrado nada.

```bash
gh attestation verify oci://ghcr.io/<tu-usuario>/<nombre-del-repo>:1.1.1 \
  --repo <tu-usuario>/otro-repo-cualquiera
echo "código de salida: $?"
```

Falla, y el código de salida no es `0`. Esa es la diferencia entre firmar y
verificar.

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `invalid reference format` | Mayúsculas en el propietario | `docker/metadata-action` lo normaliza; comprueba que lo usas |
| `denied: installation not allowed` | Falta `packages: write` en el job | Está en el job `publicar`, no en el workflow |
| El push falla por «no tags» | Disparo manual y solo reglas `type=semver` | `type=sha` siempre presente |
| `403` en cualquier `gh api .../packages/...` | Falta el scope | `gh auth refresh -s read:packages` |
| `docker pull` anónimo denegado | El paquete sigue privado | Paso 4, es un ajuste de interfaz |
| La atestación no verifica | Identidad del firmante distinta | Repite con `--repo` a secas para aislar |

## ✅ Resultado

- [ ] Tienes el scope `read:packages`
- [ ] `Dockerfile` con la etiqueta OCI de origen y usuario no-root
- [ ] `publicar-imagen.yml` con los tres permisos de escritura solo en su job
- [ ] La imagen existe en GHCR y es **pública**
- [ ] Un `docker pull` sin autenticarse funciona
- [ ] Las etiquetas `1`, `1.1` y `1.1.1` salen del tag, no de una constante
- [ ] `gh attestation verify` devuelve 0 con `--signer-workflow`
- [ ] Has visto la verificación fallar con una identidad equivocada

## 🔗 Siguiente

[Práctica 04 — El paquete y su procedencia](04-paquete-con-procedencia.md)

---

← [Volver a la Semana 12](../README.md)
