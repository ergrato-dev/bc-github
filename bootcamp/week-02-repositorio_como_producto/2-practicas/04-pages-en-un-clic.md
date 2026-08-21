# Práctica 04 — GitHub Pages en un clic

> Tu repositorio pasa a tener una web pública, gratis, servida desde la misma
> historia que el código.

**Duración estimada**: 30 min
**Prerrequisitos**: [Teoría 02](../1-teoria/02-readme-y-documentacion.md), repositorio público de la Semana 01

## Contexto

Pages sirve contenido estático desde una rama o una carpeta del repositorio. Es
la forma más barata de tener documentación publicada, y en la Semana 11 lo
convertiremos en un despliegue automático desde Actions.

Hoy lo haremos por la vía simple: servir desde una carpeta.

## Paso 1: Crear el contenido

**Por qué**: Pages sirve archivos, y el `index.html` es la puerta.

```bash
cd <tu-repo>
mkdir -p docs
cat > docs/index.html <<'EOF'
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gestión de mi dominio</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.6; }
    code { background: #8884; padding: .1rem .3rem; border-radius: .2rem; }
  </style>
</head>
<body>
  <h1>Gestión de &lt;mi dominio&gt;</h1>
  <p>Proyecto del Bootcamp GitHub Zero to Master.</p>
  <p>Código en <a href="https://github.com/<tu-usuario>/<tu-repo>">GitHub</a>.</p>
</body>
</html>
EOF

git add docs/index.html
git commit -qm "docs: añade la página de inicio para GitHub Pages"
git push -q
```

**Verifica**:

```bash
git ls-files docs/
# docs/index.html
```

## Paso 2: Activar Pages

**Por qué**: hay que decirle a GitHub desde dónde servir.

**Con la UI**: `Settings → Pages → Source: Deploy from a branch → Branch: main,
carpeta /docs → Save`.

**Con `gh`**:

```bash
gh api repos/{owner}/{repo}/pages --method POST \
  -f 'source[branch]=main' -f 'source[path]=/docs'
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/pages --jq '{estado: .status, url: .html_url, origen: .source}'
```

El primer despliegue tarda 1-2 minutos. `status` pasa de `null` a `built`.

## Paso 3: Comprobar que responde

**Por qué**: "activado" no es lo mismo que "sirviendo".

```bash
URL=$(gh api repos/{owner}/{repo}/pages --jq .html_url)
echo "$URL"
curl -sI "$URL" | head -1
# HTTP/2 200
```

**Verifica**: `curl` devuelve 200 y ves tu página en el navegador.

## Paso 4: Enlazarla desde el repositorio

**Por qué**: una web que no se enlaza no la encuentra nadie.

```bash
gh repo edit --homepage "$URL"
gh api repos/{owner}/{repo} --jq .homepage
```

Añade también el enlace al README.

**Verifica**: la URL aparece en la barra lateral del repositorio, junto a *About*.

## Paso 5: Entender el historial de despliegues

**Por qué**: en la Semana 11 lo automatizarás; conviene saber dónde mirar.

```bash
gh api repos/{owner}/{repo}/pages/builds/latest \
  --jq '{estado: .status, duracion_ms: .duration, error: .error.message}'
```

Cada push a `main` que toque `docs/` dispara una reconstrucción. La verás también
en la pestaña *Actions* como despliegue de `pages build and deployment`.

**Verifica**:

```bash
gh api repos/{owner}/{repo}/pages/builds/latest --jq .status
# built
```

## Paso 6: Jekyll, y cómo desactivarlo

**Por qué**: Pages pasa el contenido por Jekyll por defecto, que **ignora los
archivos y carpetas que empiezan por `_` o `.`**. Es la causa número uno de
"mi CSS no carga".

```bash
touch docs/.nojekyll
git add docs/.nojekyll
git commit -qm "chore: desactiva el procesado de Jekyll en Pages"
git push -q
```

**Verifica**: la página sigue sirviéndose y tus carpetas con guion bajo ya no
desaparecen.

## ✅ Resultado

- [ ] `gh api repos/{owner}/{repo}/pages` devuelve `status: built`
- [ ] La URL responde 200
- [ ] El homepage del repositorio apunta a esa URL
- [ ] `.nojekyll` presente
- [ ] El README enlaza a la web

```bash
./scripts/verificar-semana.sh 02 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| 404 tras activar | El primer build aún no terminó | Espera 2 minutos y reintenta |
| 404 permanente | No hay `index.html` en la carpeta origen | Compruébalo con `git ls-files docs/` |
| CSS o imágenes que no cargan | Rutas absolutas (`/estilos.css`) | Usa rutas relativas, o añade `.nojekyll` |
| `POST /pages` responde 409 | Pages ya estaba activado | Consúltalo con `GET`, no lo crees otra vez |
| Los cambios no se ven | Caché del navegador o build en curso | Recarga forzada y mira `pages/builds/latest` |
| El repo es privado | Pages en privados requiere plan de pago | Hazlo público |
