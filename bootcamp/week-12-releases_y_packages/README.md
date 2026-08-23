# Semana 12 — Releases y packages

> Tu pipeline ya construye, ya se reutiliza y ya despliega. Esta semana produce
> **versiones**: números que significan algo, notas que se leen, artefactos que
> otra persona puede descargar, verificar y ejecutar dentro de dos años.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Distinguir commit, tag, release y versión, y mantener los cuatro alineados
- Decidir MAJOR, MINOR o PATCH por impacto y declarar cuál es tu API pública
- Generar notas de release desde los pull requests y agruparlas por categorías
- Automatizar el cálculo de versión y el changelog con `release-please`
- Elegir el token correcto cuando el `GITHUB_TOKEN` no puede hacer el trabajo
- Publicar una imagen en GHCR con etiquetas derivadas del tag, no escritas a mano
- Publicar un paquete en el registro de GitHub sin ningún secreto propio
- Firmar la procedencia de lo que publicas y **verificarla** desde fuera
- Cerrar el candado de la inmutabilidad y saber retirar una versión sin borrarla

## 📋 Prerrequisitos

- Semana 11 completada: pinning por SHA, permisos mínimos, despliegue con puerta
- Semana 08: ruleset en `main` con `required_approving_review_count: 0`
- Semana 07: Conventional Commits — `release-please` no funciona sin ellos
- `gh` autenticado con permisos de administración sobre tu repositorio, y con el
  scope extra: `gh auth refresh -s read:packages`
- `docker`, `pnpm`, `jq` y `python3` en local
  (`./scripts/verificar-semana.sh --doctor`)
- Tu repositorio del bootcamp, **público**: GHCR, GitHub Packages y las
  atestaciones son gratuitos ahí

## 🗂️ Estructura de la Semana

```
week-12-releases_y_packages/
├── 0-assets/     01-anatomia-de-un-release · 02-flujo-release-please
│                 03-cadena-de-publicacion
├── 1-teoria/     01-tag-release-y-version · 02-semver-en-la-practica
│                 03-notas-de-release-automaticas · 04-release-please-y-el-pr-de-release
│                 05-ghcr-publicar-una-imagen · 06-registro-npm-y-github-packages
│                 07-procedencia-verificable
├── 2-practicas/  01-tu-primer-release · 02-release-automatizado
│                 03-imagen-en-ghcr · 04-paquete-con-procedencia
├── starter/      release-please.yml · publicar-imagen.yml · publicar-npm.yml
│                 release-please-config.json · Dockerfile
├── 3-proyecto/   v1.0.0 publicado, imagen en GHCR, paquete atestiguado
├── 4-recursos/ · 5-glosario/ · checks.json · rubrica-evaluacion.md
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [`01-tag-release-y-version.md`](1-teoria/01-tag-release-y-version.md) | Los cuatro objetos, draft/prerelease/latest, releases inmutables | 25 min |
| [`02-semver-en-la-practica.md`](1-teoria/02-semver-en-la-practica.md) | API pública, la zona `0.x`, prerreleases, de commits a versiones | 25 min |
| [`03-notas-de-release-automaticas.md`](1-teoria/03-notas-de-release-automaticas.md) | `generate-notes`, `.github/release.yml`, notas frente a changelog | 20 min |
| [`04-release-please-y-el-pr-de-release.md`](1-teoria/04-release-please-y-el-pr-de-release.md) | El PR de release, manifiesto y config, el token que hace falta | 25 min |
| [`05-ghcr-publicar-una-imagen.md`](1-teoria/05-ghcr-publicar-una-imagen.md) | GHCR frente al resto, etiquetas desde el tag, vinculación, visibilidad | 25 min |
| [`06-registro-npm-y-github-packages.md`](1-teoria/06-registro-npm-y-github-packages.md) | Qué registro elegir, publicar con `pnpm`, `--provenance`, trusted publishing | 25 min |
| [`07-procedencia-verificable.md`](1-teoria/07-procedencia-verificable.md) | Atestaciones, `gh attestation verify`, la cadena, retirar una versión | 25 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [`01-tu-primer-release.md`](2-practicas/01-tu-primer-release.md) | Publicas `v1.0.0` a mano y cierras el candado de la inmutabilidad | 50 min |
| [`02-release-automatizado.md`](2-practicas/02-release-automatizado.md) | Dejas de escribir versiones: el PR de release las calcula | 50 min |
| [`03-imagen-en-ghcr.md`](2-practicas/03-imagen-en-ghcr.md) | Publicas, haces pública y verificas una imagen de contenedor | 45 min |
| [`04-paquete-con-procedencia.md`](2-practicas/04-paquete-con-procedencia.md) | Publicas el paquete, lo atestiguas y compruebas la firma desde fuera | 45 min |

### Starter

[`starter/`](starter/README.md) — los tres workflows de publicación a medias, la
configuración de `release-please` y un `Dockerfile` con pnpm y usuario no-root.
Los permisos mínimos por job, el disparador `release: published`, los pines por
SHA y el digest como sujeto de la atestación vienen puestos: son el temario, no
un detalle de implementación.

### Proyecto

[`3-proyecto/`](3-proyecto/README.md) — tu repositorio publicando versiones sin
que nadie escriba un número, con una imagen y un paquete que cualquiera puede
descargar y verificar.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (7 archivos) | 2 h 50 min |
| Prácticas (4) | 3 h 10 min |
| Proyecto | 1 h 30 min |
| Revisión y verificación | 30 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Saber si un tag es anotado | `git cat-file -t v1.0.0` — `tag` sí, `commit` no |
| Firmar también los tags | `git config --global tag.gpgSign true` |
| Empujar solo los tags que viajan | `git push --follow-tags`, no `--tags` |
| Abortar si el tag no existe en remoto | `gh release create v1.0.0 --verify-tag` |
| Previsualizar las notas sin crear nada | `gh api repos/{owner}/{repo}/releases/generate-notes --method POST -f tag_name=vX --jq .body` |
| Cambiar el punto de partida de las notas | `--notes-start-tag v1.0.0` |
| Anteponer un resumen a lo generado | `--generate-notes` **más** `--notes-file` |
| Montar el release antes de publicarlo | `--draft`, `gh release upload`, `--draft=false` |
| Radiografía del estado de publicación | `gh release list --json tagName,isLatest,isDraft` |
| Cerrar el candado | `gh api repos/{owner}/{repo}/immutable-releases --method PUT` |
| Borrar release y tag a la vez | `gh release delete v1.0.0 --cleanup-tag` |
| Ordenar tags como versiones | `git tag --sort=-v:refname` |
| Forzar la versión que calcula release-please | `Release-As: 1.5.0` en el cuerpo del commit |
| Encadenar solo cuando publica | `if: needs.release.outputs.publicado == 'true'` (cadena, con comillas) |
| Un release del `GITHUB_TOKEN` no dispara workflows | Por eso `release-please` usa un token de usuario |
| El PR de release, con squash | Los commits de `release-please` no van firmados; el squash lo firma GitHub |
| Etiquetas de imagen desde el tag | `type=semver,pattern={{version}}` en `docker/metadata-action` |
| No quedarse sin etiquetas | `type=sha` siempre, porque `type=semver` calla si no hay tag |
| Vincular el paquete al repositorio | `LABEL org.opencontainers.image.source` |
| El paquete nace privado | Se cambia solo en la interfaz; se comprueba con `gh api users/{owner}/packages/...` |
| El scope que falta | `gh auth refresh -s read:packages` o todo `packages` da 403 |
| Comprobar que es público de verdad | `docker logout ghcr.io` y luego `docker pull` |
| Inspeccionar una imagen sin bajarla | `docker buildx imagetools inspect ghcr.io/OWNER/REPO:1.2.3` |
| `pnpm publish` en CI | `--no-git-checks`, o aborta por rama y árbol sucio |
| Ver qué entra en el paquete | `pnpm pack` y `tar -tzf ./*.tgz` |
| El sujeto de la atestación de una imagen | El digest del `build-push-action`, nunca la etiqueta |
| Verificación estrecha | `--signer-workflow OWNER/REPO/.github/workflows/x.yml` |
| Leer el JSON no es verificar | Solo `gh attestation verify` comprueba firmas |
| Retirar una versión sin borrarla | `gh release edit vX --prerelease` y publicar el arreglo |

## 📌 Entregables

1. ✅ `v1.0.0` publicado desde un tag anotado y firmado, con notas propias
2. ✅ `.github/release.yml` con categorías alineadas con tus etiquetas
3. ✅ Releases inmutables activos
4. ✅ `RELEASE_PLEASE_TOKEN` con alcance de un solo repositorio
5. ✅ `release-please-config.json`, `.release-please-manifest.json` y `CHANGELOG.md`
6. ✅ Al menos un release creado por el pull request de release
7. ✅ `Dockerfile` vinculado al repositorio y con usuario no-root
8. ✅ Imagen en GHCR, **pública**, etiquetada desde el tag y atestiguada
9. ✅ Paquete en GitHub Packages con `publishConfig` y atestación del `.tgz`
10. ✅ `README.md` con el procedimiento de verificación para quien lo consume

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 12 --repo <tu-usuario>/<tu-repo>
```

> [!NOTE]
> Dos comprobaciones consultan la API de packages y necesitan un scope que
> `gh auth login` no concede: `gh auth refresh -s read:packages`. Además dan por
> hecho que el paquete se llama igual que el repositorio.

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 11: Seguridad, entornos y CD](../week-11-actions_seguridad_entornos_y_cd/README.md) | **Semana 12: Releases y packages** | [Semana 13: Dependabot y code scanning →](../week-13-seguridad_dependabot_y_code_scanning/README.md) |

← [Volver al inicio del bootcamp](../../README.md)
