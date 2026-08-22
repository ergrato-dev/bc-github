# `starter/` — Semana 11

> Tercera semana con código, y la primera en la que lo que escribes toca algo
> fuera de GitHub: un sitio publicado, una identidad federada y una puerta con
> revisor.

Aquí hay **cuatro piezas**. Tres están a medias —los bloques `# PASO N` están
comentados— y una está completa porque es contenido, no ejercicio.

| Pieza | Se completa en | Qué acaba siendo |
|-------|----------------|------------------|
| [`deploy-pages.yml`](deploy-pages.yml) | Prácticas 03 y 04 | El pipeline de CD: construir, validar, desplegar, verificar |
| [`oidc-claims.yml`](oidc-claims.yml) | Práctica 02 | Un workflow que enseña los claims de tu token OIDC |
| [`dependabot.yml`](dependabot.yml) | Práctica 01 | Los pines por SHA, al día, en un PR semanal |
| [`sitio/index.html`](sitio/index.html) | — | El contenido mínimo que se publica; cámbialo por el tuyo |

## Cómo se usa

```bash
cd <tu-repo>

# Práctica 01
cp <ruta-al-bootcamp>/bootcamp/week-11-actions_seguridad_entornos_y_cd/starter/dependabot.yml \
   .github/dependabot.yml

# Práctica 02
cp <ruta-al-bootcamp>/.../starter/oidc-claims.yml .github/workflows/oidc-claims.yml

# Prácticas 03 y 04
cp <ruta-al-bootcamp>/.../starter/deploy-pages.yml .github/workflows/deploy-pages.yml
mkdir -p sitio && cp <ruta-al-bootcamp>/.../starter/sitio/index.html sitio/index.html
```

A partir de ahí trabajas **en tu repositorio**. El entregable es el estado de tu
repositorio y de su sitio publicado, no estos archivos.

## Lo que ya viene puesto (y por qué)

Seis cosas están escritas desde el principio porque son el temario de la semana,
no un detalle de implementación:

- **`permissions: contents: read`** a nivel de workflow, ampliadas **solo** en el
  job que despliega, y solo con `pages: write` e `id-token: write`
- **Actions de terceros pinneadas por SHA** con el tag en comentario. Verificados
  en agosto de 2026 (tabla abajo)
- **`concurrency` con `cancel-in-progress: false`**: en CD, cancelar a la mitad
  deja el destino en un estado que nadie ha probado
- **`timeout-minutes` en todos los jobs**: el defecto son seis horas, y un
  despliegue colgado bloquea la cola
- **El artefacto se construye una vez** y los jobs siguientes lo descargan. El
  job de despliegue no hace `checkout`
- **El token OIDC se enmascara con `::add-mask::`** antes de tocarlo, y viaja por
  variable de entorno, nunca por la línea de comandos

## Un detalle del artefacto de Pages

`actions/upload-pages-artifact` no sube tus archivos sueltos: sube un
**`artifact.tar`** dentro de un artefacto llamado `github-pages`. Por eso el job
de validación lo descarga y lo abre con `tar -xf` antes de mirar dentro. Si
esperas encontrar `index.html` directamente, el paso falla y el mensaje no lo
explica.

## Versiones

Verificadas en agosto de 2026:

| Action | Versión | SHA |
|--------|---------|-----|
| `actions/checkout` | v7.0.1 | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/upload-pages-artifact` | v5.0.0 | `fc324d3547104276b827a68afc52ff2a11cc49c9` |
| `actions/download-artifact` | v8.0.1 | `3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c` |
| `actions/deploy-pages` | v5.0.0 | `cd2ce8fcbc39b97be8ca5fce6e763baed58fa128` |

Compruébalo tú mismo antes de copiar cualquiera:

```bash
gh api repos/actions/deploy-pages/tags \
  --jq '.[] | select(.name == "v5.0.0") | .commit.sha'
```

---

← [Volver a la Semana 11](../README.md)
