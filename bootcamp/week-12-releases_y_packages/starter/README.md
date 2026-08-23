# `starter/` — Semana 12

> Cuarta y última semana con código. Lo que escribes aquí no toca un servidor:
> deja artefactos publicados, con nombre, versión y firma, que otra persona podrá
> descargar y verificar dentro de dos años.

Aquí hay **cinco piezas**. Tres están a medias —los bloques `# PASO N` están
comentados— y dos están completas porque son contenido, no ejercicio.

| Pieza | Se completa en | Qué acaba siendo |
|-------|----------------|------------------|
| [`release-please.yml`](release-please.yml) | Práctica 02 | El PR de release, el tag y el release, calculados desde los commits |
| [`publicar-imagen.yml`](publicar-imagen.yml) | Práctica 03 | La imagen en GHCR, atestiguada y verificada |
| [`publicar-npm.yml`](publicar-npm.yml) | Práctica 04 | El paquete en GitHub Packages, atestiguado |
| [`release-please-config.json`](release-please-config.json) | — | La configuración de versionado; ajústala a tu proyecto |
| [`Dockerfile`](Dockerfile) | — | Imagen mínima con pnpm, usuario no-root y etiquetas OCI |

## Cómo se usa

```bash
cd <tu-repo>
RUTA=<ruta-al-bootcamp>/bootcamp/week-12-releases_y_packages/starter

# Práctica 02
cp "$RUTA/release-please.yml"        .github/workflows/release.yml
cp "$RUTA/release-please-config.json" release-please-config.json

# Práctica 03
cp "$RUTA/publicar-imagen.yml" .github/workflows/publicar-imagen.yml
cp "$RUTA/Dockerfile"          Dockerfile

# Práctica 04
cp "$RUTA/publicar-npm.yml" .github/workflows/publicar-npm.yml
```

A partir de ahí trabajas **en tu repositorio**. El entregable es el estado de tus
releases y tus paquetes, no estos archivos.

## Lo que ya viene puesto (y por qué)

Cinco cosas están escritas desde el principio porque son el temario de la semana,
no un detalle de implementación:

- **`permissions: contents: read`** a nivel de workflow. Los permisos de
  escritura (`packages`, `id-token`, `attestations`) se conceden **solo** en el
  job que los usa
- **Disparador `release: published`**, no `push`. Se publica una versión, no un
  commit
- **`concurrency` con `cancel-in-progress: false`**: dos releases a la vez dejan
  el manifiesto en un estado incoherente
- **Actions de terceros pinneadas por SHA** con el tag en comentario, verificadas
  en agosto de 2026 (tabla abajo)
- **El sujeto de la atestación de la imagen es el digest**, nunca la etiqueta:
  la etiqueta se mueve, el digest no

## Dos trampas que valen media práctica

**El release creado por el `GITHUB_TOKEN` no dispara workflows.** Es una
protección contra bucles infinitos, y significa que `publicar-imagen.yml` no
arrancaría si `release-please` usara el token del run. Arranca porque usa el
token fine-grained de `RELEASE_PLEASE_TOKEN`, que es un token de usuario.

**`pnpm publish` aborta en CI sin `--no-git-checks`.** Comprueba que la rama sea
la de publicación y que el árbol esté limpio; con el checkout en un tag, no se
cumple.

## Versiones

Verificadas en agosto de 2026:

| Action | Versión | SHA |
|--------|---------|-----|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node` | v7.0.0 | `820762786026740c76f36085b0efc47a31fe5020` |
| `actions/upload-artifact` | v7.0.1 | `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a` |
| `actions/attest-build-provenance` | v4.2.2 | `4d101475d8b20a2381f78447822ac1eab6504dd8` |
| `pnpm/action-setup` | v6.0.10 | `0977fd99725f1db4007ccb2928dbb4e90d06cc86` |
| `docker/login-action` | v4.6.0 | `dbcb813823bdd20940b903addbd779551569679f` |
| `docker/metadata-action` | v6.2.0 | `dc802804100637a589fabce1cb79ff13a1411302` |
| `docker/build-push-action` | v7.3.0 | `53b7df96c91f9c12dcc8a07bcb9ccacbed38856a` |
| `googleapis/release-please-action` | v5.0.0 | `45996ed1f6d02564a971a2fa1b5860e934307cf7` |

Compruébalo tú mismo antes de copiar cualquiera:

```bash
gh api repos/docker/metadata-action/git/ref/tags/v6.2.0 --jq '.object.sha'
```

---

← [Volver a la Semana 12](../README.md)
