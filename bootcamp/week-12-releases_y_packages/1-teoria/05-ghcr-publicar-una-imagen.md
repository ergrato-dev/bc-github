# GHCR: publicar una imagen

> GitHub Packages son cinco registros distintos con la misma factura y reglas
> diferentes. El de contenedores, `ghcr.io`, es el único que no está atado a un
> repositorio, el único con permisos granulares y el que vas a usar. Los otros
> cuatro se comportan como el registro npm de la práctica siguiente.

## 🎯 Objetivos

- Situar GHCR entre los registros de GitHub Packages y saber por qué es distinto
- Publicar una imagen desde un workflow con el `GITHUB_TOKEN`
- Derivar las etiquetas de la imagen del tag de Git, sin escribirlas
- Vincular el paquete a su repositorio y controlar su visibilidad

## 1. Qué problema resuelve

Un release con un `.tar.gz` adjunto obliga a quien lo consume a saber
descomprimirlo, instalar el runtime correcto y configurarlo. Una imagen de
contenedor entrega **lo mismo que probaste**, con su runtime dentro, y se ejecuta
con un comando.

GHCR añade lo que un registro genérico no da: vive junto al código, se autentica
con el `GITHUB_TOKEN` del propio workflow y no cuesta nada en repositorios
públicos.

| Registro | Host | Atado a un repo | Permisos granulares |
|----------|------|:---------------:|:-------------------:|
| **Container** | `ghcr.io` | No | Sí |
| npm | `npm.pkg.github.com` | Sí | No |
| Maven | `maven.pkg.github.com` | Sí | No |
| NuGet | `nuget.pkg.github.com` | Sí | No |
| RubyGems | `rubygems.pkg.github.com` | Sí | No |

«Atado a un repo» significa que el permiso sobre el paquete es el permiso sobre
el repositorio. En GHCR el paquete es una entidad propia: se le dan permisos a
personas y a repositorios de forma independiente.

## 2. El nombre de la imagen

```
ghcr.io/<propietario>/<nombre>:<etiqueta>
        └── tu usuario u organización, en minúsculas
```

El `<nombre>` es libre: no tiene por qué coincidir con el repositorio, aunque
mantenerlo igual ahorra explicaciones. El propietario **debe ir en minúsculas** o
el push falla con un error de referencia inválida. Por eso se usa
`${{ github.repository_owner }}` pasado por `tr '[:upper:]' '[:lower:]'`, o
directamente `docker/metadata-action`, que ya lo hace.

## 3. Publicar desde un workflow

Tres actions y un permiso:

```yaml
permissions:
  contents: read

jobs:
  publicar:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write        # el único añadido
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - uses: docker/login-action@dbcb813823bdd20940b903addbd779551569679f # v4.6.0
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - id: meta
        uses: docker/metadata-action@dc802804100637a589fabce1cb79ff13a1411302 # v6.2.0
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha

      - uses: docker/build-push-action@53b7df96c91f9c12dcc8a07bcb9ccacbed38856a # v7.3.0
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

`packages: write` se concede **solo en ese job**. Es el mismo criterio de la
Semana 11: el permiso se pide donde se usa.

## 4. Las etiquetas salen del tag de Git

Escribir las etiquetas a mano es donde aparecen los `latest` que apuntan a
cualquier cosa. `docker/metadata-action` las deriva del evento:

| Regla | Con el tag `v1.2.3` produce |
|-------|-----------------------------|
| `type=semver,pattern={{version}}` | `1.2.3` |
| `type=semver,pattern={{major}}.{{minor}}` | `1.2` |
| `type=semver,pattern={{major}}` | `1` |
| `type=sha` | `sha-a1b2c3d` |
| `type=raw,value=latest` | `latest` |

La `v` desaparece: la convención de imágenes es `1.2.3`, no `v1.2.3`.

Las etiquetas móviles (`1`, `1.2`, `latest`) son un servicio para quien quiere
recibir parches sin tocar nada, y una trampa para quien necesita reproducir un
despliegue. Publica las dos clases y **consume siempre por digest**:

```bash
docker pull ghcr.io/OWNER/REPO@sha256:<digest>
```

> [!TIP]
> `type=semver` solo produce etiquetas cuando el evento es un tag. Con el
> workflow disparado por `release: published` funciona; con `push` a `main`, no
> genera nada y el push falla por falta de etiquetas. Añade `type=sha` siempre.

## 5. Vincular el paquete a su repositorio

Un paquete sin vincular aparece huérfano: sin README, sin enlace al código y sin
heredar permisos. La vinculación se hace con una etiqueta OCI en el `Dockerfile`:

```dockerfile
LABEL org.opencontainers.image.source="https://github.com/OWNER/REPO"
LABEL org.opencontainers.image.description="Servicio de préstamos de la biblioteca"
LABEL org.opencontainers.image.licenses="MIT"
```

`docker/metadata-action` genera esas tres etiquetas solo con pasarle
`labels: ${{ steps.meta.outputs.labels }}`, así que en la práctica basta con no
olvidar esa línea.

## 6. Visibilidad

Un paquete de GHCR **nace privado**, aunque el repositorio sea público. Es la
sorpresa número uno de la semana: el workflow sale verde, la imagen está ahí, y
un `docker pull` desde fuera devuelve `denied`.

Cambiarlo es lo único de esta semana que **no tiene API**: se hace en la interfaz,
en la página del paquete → *Package settings* → *Danger Zone* → *Change
visibility*. Comprobarlo sí es API:

```bash
gh api users/{owner}/packages/container/<nombre> --jq '{visibility, repository: .repository.name}'
```

> [!IMPORTANT]
> Ese endpoint —y cualquiera de `packages`— exige el scope `read:packages`, que
> `gh auth login` no concede por defecto. Añádelo una vez:
> `gh auth refresh -s read:packages`. Sin eso responde `403` aunque el paquete
> sea público.

## 7. Limpiar versiones viejas

Cada push crea una versión nueva y las de `sha-…` se acumulan. En repositorios
públicos el almacenamiento es gratis, pero la lista se vuelve inservible.

```bash
# ver qué hay
gh api users/{owner}/packages/container/<nombre>/versions \
  --jq '.[] | {id, tags: .metadata.container.tags, created_at}'
```

> [!WARNING]
> Borrar una versión de un paquete es **irreversible pasados 30 días** y rompe a
> cualquiera que la tenga referenciada por digest. Comprueba primero qué
> despliegues la usan; hay `POST .../restore` solo dentro de esa ventana.

Automatizarlo es trabajo de la Semana 14; aquí basta con saber que se acumulan.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Etiquetas escritas a mano | `latest` acaba apuntando a un build roto | `docker/metadata-action` |
| Solo `latest` | Imposible reproducir un despliegue | Publicar también versión y `sha-` |
| Consumir por etiqueta móvil en producción | La imagen cambia bajo tus pies | Por digest |
| Propietario en mayúsculas | `invalid reference format`, sin más pistas | Minúsculas siempre |
| Sin `org.opencontainers.image.source` | Paquete huérfano, sin permisos heredados | La etiqueta en el `Dockerfile` |
| `packages: write` a nivel de workflow | Cuatro jobs con permiso de escritura sin usarlo | Solo en el job que publica |
| Un PAT para autenticarse contra GHCR | Secreto de larga vida para algo que el `GITHUB_TOKEN` cubre | `secrets.GITHUB_TOKEN` |

## 9. Trucos

- **`docker/metadata-action` deja el digest en un output**: `${{ steps.build.outputs.digest }}`
  del `build-push-action` es lo que hace falta para atestiguar la imagen
- **`--attest` no hace falta aquí**: la procedencia la genera
  `actions/attest-build-provenance` (teoría 07)
- **Inspeccionar sin descargar**: `docker buildx imagetools inspect ghcr.io/OWNER/REPO:1.2.3`
  enseña digest, plataformas y anotaciones
- **`platforms: linux/amd64,linux/arm64`** en `build-push-action` publica un
  índice multiarquitectura; cuesta tiempo de build, no complejidad
- **Cachear entre builds**: `cache-from: type=gha` y `cache-to: type=gha,mode=max`
  usan la misma caché de Actions de la Semana 09
- **Un paquete público en un repo público** es descargable sin autenticación:
  compruébalo con `docker logout ghcr.io` antes del `pull`

## 📚 Recursos Adicionales

- [Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Configuring a package's access control and visibility](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility)
- [`docker/metadata-action`](https://github.com/docker/metadata-action)
- [REST — Packages](https://docs.github.com/en/rest/packages/packages)

## ✅ Checklist de Verificación

- [ ] Sabes por qué GHCR no está atado a un repositorio y los otros registros sí
- [ ] Puedes publicar una imagen con `packages: write` solo en un job
- [ ] Tus etiquetas salen del tag, no de una constante
- [ ] Sabes vincular el paquete a su repositorio con una etiqueta OCI
- [ ] Sabes que el paquete nace privado y dónde se cambia
- [ ] Tienes el scope `read:packages` para poder verificarlo por API
