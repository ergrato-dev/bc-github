# Rúbrica de Evaluación — Semana 12: Releases y packages

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | Releases, imagen y paquete publicados y verificables |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Qué cuatro objetos distintos se confunden bajo la palabra «versión» y quién crea cada uno? |
| 2 | ¿Qué congela exactamente la inmutabilidad de releases y qué deja fuera? |
| 3 | ¿Por qué una refactorización enorme puede ser un `PATCH` y renombrar un parámetro un `MAJOR`? |
| 4 | ¿Qué pasa con un PR sin etiquetas si `.github/release.yml` tiene el comodín `"*"` el primero? |
| 5 | ¿Por qué el `GITHUB_TOKEN` no puede abrir el pull request de `release-please` en tu repositorio? |
| 6 | ¿Qué gana y qué pierde el repositorio al usar un token fine-grained en vez de reactivar el ajuste? |
| 7 | ¿Por qué `type=sha` debe estar siempre entre las reglas de `docker/metadata-action`? |
| 8 | ¿Por qué un paquete de GHCR nace privado aunque el repositorio sea público? |
| 9 | ¿Qué afirma una atestación de procedencia y qué **no** afirma? |
| 10 | ¿Por qué leer `repos/{owner}/{repo}/attestations/...` no es verificar? |

<details>
<summary><strong>Respuestas</strong></summary>

1. El **commit** (lo crea quien programa; su SHA es el contenido y no se mueve),
   el **tag** (una ref de Git, movible salvo protección), el **release** (un
   objeto de la base de datos de GitHub que apunta al tag) y la **versión**
   escrita en un archivo como `package.json`. Cuando no coinciden, nadie sabe qué
   se publicó.
2. Una vez **publicado** un release: el tag no se puede mover ni borrar, y los
   adjuntos no se pueden añadir, modificar ni borrar. Quedan fuera los borradores
   —editables y borrables, tag incluido— y el **cuerpo** del release, que sí se
   puede editar.
3. Porque el número lo decide el impacto en quien consume, no el esfuerzo de
   quien programa. Una refactorización que no toca ninguna firma pública no
   obliga a nadie a cambiar nada; renombrar un parámetro rompe todo el código que
   lo usaba.
4. Se lo traga **todo**: cada PR cae en la primera categoría que casa y solo en
   una. El comodín va al final o las demás categorías quedan vacías.
5. Porque en la Semana 11 se desactivó *Allow GitHub Actions to create and
   approve pull requests* (`can_approve_pull_request_reviews: false`), y ese
   ajuste cubre crear y aprobar. El error es explícito: `GitHub Actions is not
   permitted to create or approve pull requests`.
6. Gana que ningún workflow del repositorio recupera la capacidad de **aprobar**
   pull requests, y que el permiso queda acotado a dos scopes, un repositorio y
   una fecha de caducidad. Pierde que vuelve a haber un secreto de larga vida que
   hay que rotar — el precio, hasta que sea una GitHub App (Semana 16).
7. Porque `type=semver` solo produce etiquetas cuando el evento trae un tag. En
   un `workflow_dispatch` no genera ninguna, y un push sin etiquetas falla.
8. Porque la visibilidad del paquete es independiente de la del repositorio: un
   paquete con ámbito de cuenta personal nace privado. Cambiarlo es lo único de
   la semana que no tiene API.
9. Afirma que un workflow concreto, de un repositorio concreto, en un commit
   concreto, produjo un artefacto con ese digest exacto. **No** afirma que el
   código sea correcto, que no tenga vulnerabilidades ni que el autor sea de
   fiar.
10. Porque el JSON no comprueba ninguna firma: solo dice que existe un registro.
    La validación criptográfica —firma, certificado, identidad del firmante— la
    hace `gh attestation verify` y nada más. El endpoint sirve para inventariar.

</details>

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Primer release | Tag anotado y firmado, release con notas propias, inmutabilidad activa y rechazo del movimiento de tag comprobado | 10 |
| 02 — Automatizado | Token con alcance mínimo, PR de release revisado, `v1.1.0` y `CHANGELOG.md` creados por la automatización | 10 |
| 03 — Imagen | Imagen pública en GHCR, etiquetas derivadas del tag, `pull` anónimo y atestación verificada | 10 |
| 04 — Paquete | Paquete publicado, instalación comprobada, `.tgz` atestiguado y verificado en local | 10 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| Release `latest` publicado, con notas, y al menos dos releases en total | 10 |
| `.github/release.yml` con categorías e inmutabilidad activa | 10 |
| `release-please`: config, manifiesto, `CHANGELOG.md`, workflow y secreto | 10 |
| Workflow de imagen con los tres permisos en su job y sin tags flotantes | 10 |
| Imagen en GHCR, pública y vinculada al repositorio | 10 |
| Paquete publicado, con `publishConfig` y atestación en su workflow | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| El `README.md` declara la API pública y el procedimiento de verificación | 10 |
| Las entradas del `CHANGELOG.md` se entienden sin abrir el commit | 10 |
| El token de `release-please` tiene dos permisos y un solo repositorio | 10 |
| Los permisos de escritura solo en el job que publica | 5 |
| El sujeto de la atestación de la imagen es el digest, no la etiqueta | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Un token impreso en un log o commiteado en un `.npmrc` | -100 (rotar y rehacer) |
| Token de `release-please` con acceso a todos tus repositorios | -25 |
| Reactivar «Actions puede crear y aprobar pull requests» en vez de usar el token | -25 |
| Un `MAJOR` publicado sin guía de migración enlazada en las notas | -20 |
| `permissions` de escritura a nivel de workflow «para simplificar» | -20 |
| Alguna action ajena sin pinnear por SHA en los workflows nuevos | -15 |
| Versión editada a mano estando `release-please` activo | -15 |
| Atestación cuyo sujeto es una etiqueta móvil en vez del digest | -15 |
| Imagen publicada solo como `latest` | -10 |
| Paquete publicado sin `files` ni `.npmignore` | -10 |
| Una versión republicada con contenido distinto | -20 |
| Borrar un release o una versión de paquete para «arreglar» una publicación mala | -20 |

---

← [Volver a la Semana 12](README.md)
