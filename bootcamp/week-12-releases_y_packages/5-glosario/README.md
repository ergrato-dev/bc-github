# Glosario — Semana 12

## A

**Adjunto (release asset)** — Archivo arbitrario asociado a un release y servido
sin autenticación en un repositorio público. Con la inmutabilidad activa no se
puede añadir ni sustituir después de publicar.

**API pública** — El conjunto de cosas de tu proyecto que otros consumen y que,
por tanto, decide cuándo un cambio es incompatible. Si no está escrita, cada
decisión de versión se toma por intuición.

**Atestación (attestation)** — Declaración firmada sobre un artefacto,
identificado por su digest, que dice qué repositorio, qué commit y qué workflow
lo produjeron. No dice nada sobre la calidad del código.

**`attestations: write`** — Permiso del `GITHUB_TOKEN` que permite guardar una
atestación en GitHub. Acompaña siempre a `id-token: write`, que es el que firma.

## B

**Borrador (draft)** — Release que existe pero no está publicado: solo lo ve
quien tiene escritura, no dispara `release: published` y se puede editar y borrar
con su tag. Es la vía para montar un release con adjuntos antes de congelarlo.

**Build metadata** — Lo que va tras el `+` en una versión SemVer (`1.0.0+abc`).
**No cuenta para la precedencia**: publicar `1.0.0+a` y `1.0.0+b` es publicar dos
veces la misma versión.

## C

**Changelog** — Archivo versionado con la historia de cambios por versión.
Sobrevive a un cambio de plataforma y se lee sin conexión, al contrario que las
notas del release.

**Conventional Commits** — Convención de mensajes (`feat:`, `fix:`, `feat!:`) que
`release-please` traduce a incrementos de versión. Sin ella no hay cálculo
automático posible.

**Corepack** — Herramienta de Node que instala la versión de `pnpm` declarada en
`packageManager`. Es lo que hace que el CI, la imagen y tu portátil usen la misma.

## D

**Digest** — Hash SHA-256 del contenido de una imagen. Es el único identificador
que no se mueve: las etiquetas sí. El sujeto correcto de una atestación.

**Deprecación** — Aviso de que algo se va a retirar, publicado **una versión
antes** de retirarlo y con el reemplazo en el propio mensaje. Un `MAJOR` sin
deprecación previa es una sorpresa.

## E

**Etiqueta móvil** — Etiqueta de imagen que se reasigna con cada versión
(`latest`, `1`, `1.2`). Comodidad para quien quiere parches; trampa para quien
necesita reproducir un despliegue.

## G

**GHCR (`ghcr.io`)** — Registro de contenedores de GitHub. El único de GitHub
Packages que no está atado a un repositorio y el único con permisos granulares.

**GitHub Packages** — Los cinco registros de GitHub (container, npm, Maven,
NuGet, RubyGems). Todos salvo GHCR heredan los permisos del repositorio, y todos
exigen autenticarse para instalar, aunque el paquete sea público.

## I

**Inmutabilidad de releases** — Ajuste por repositorio que, tras publicar, impide
mover o borrar el tag y modificar los adjuntos. Se consulta y se activa en
`repos/{owner}/{repo}/immutable-releases`.

## L

**`latest`** — Marca del release que la portada del repositorio enseña. No es «el
más reciente por fecha»: GitHub lo calcula por versión semántica entre los
releases publicados y no prerelease, y se puede forzar con `--latest`.

## M

**Manifiesto (`.release-please-manifest.json`)** — Archivo que guarda la versión
actual de cada paquete. Es la **fuente de verdad**: editar el `package.json` sin
tocarlo hace que el cálculo siguiente salga mal.

## N

**Notas generadas** — Cuerpo del release construido por GitHub a partir de los
**pull requests fusionados** desde el release anterior. Lo que entró sin pull
request no aparece.

**`--no-git-checks`** — Flag de `pnpm publish` que salta la comprobación de rama
y árbol limpio. Obligatorio en CI: el runner tiene el checkout en un tag.

## O

**OCI (`org.opencontainers.image.source`)** — Etiqueta estándar que vincula una
imagen con su repositorio. Sin ella el paquete nace huérfano, sin README y sin
heredar permisos.

## P

**`packages: write`** — Permiso del `GITHUB_TOKEN` para empujar a un registro de
GitHub Packages. Se concede en el job que publica, nunca a nivel de workflow.

**Prerelease** — Release publicado y marcado como no estable. Siempre es **menor**
que la versión final: `1.0.0-rc.1 < 1.0.0`. Nunca es `latest`.

**Procedencia (provenance)** — La cadena artefacto → build → fuente, demostrada
criptográficamente. En npmjs se genera con `--provenance`; en cualquier otro
artefacto, con `actions/attest-build-provenance`.

**PR de release (release PR)** — Pull request que `release-please` abre y
actualiza con la versión y el changelog de lo que se publicaría ahora. Se
acumula: hay uno abierto, no uno por cambio.

**`publishConfig.registry`** — Campo del `package.json` que fija el registro de
destino. Sin él se publica en el registro por defecto, que rara vez es el que
querías.

## R

**`release-please`** — Action que lee los Conventional Commits, calcula la
versión, escribe el `CHANGELOG.md` y, al fusionar su pull request, crea el tag y
el release.

**`release_created`** — Output de `release-please` que vale `'true'`, como
**cadena**, solo en la ejecución que sigue a fusionar el PR de release.

**Release** — Objeto de la base de datos de GitHub que apunta a un tag y añade
título, notas, adjuntos y estado. No es Git: borrarlo no borra el tag.

## S

**SemVer (`MAJOR.MINOR.PATCH`)** — Contrato con quien consume: el número dice
cuánto cuesta actualizarse. El incremento lo decide el impacto, nunca el esfuerzo.

**Sigstore** — Infraestructura de firma con certificados de vida corta y registro
público de transparencia sobre la que se apoyan las atestaciones y la procedencia
de npm.

**`--signer-workflow`** — Flag de `gh attestation verify` que exige que quien
firmó sea un workflow concreto. Es la verificación estrecha; `--owner` a secas
acepta cualquier repositorio tuyo.

## T

**Tag anotado** — Objeto de Git con autor, fecha y mensaje propios, firmable. Un
tag **ligero** es solo un puntero: si alguien lo mueve, no queda rastro.

**Token fine-grained** — Token de acceso personal acotado a repositorios y
permisos concretos, con caducidad. Aquí, el único con permiso para abrir el pull
request de release.

**Trusted publishing** — Registrar en npmjs qué repositorio y workflow pueden
publicar un paquete, identificándose por OIDC. No hay token que robar ni rotar, y
la procedencia se genera sola.

## V

**`--verify-tag`** — Flag de `gh release create` que aborta si el tag no existe ya
en el remoto. Convierte un error silencioso —crear el release desde una rama— en
un fallo inmediato.

---

← [Volver a la Semana 12](../README.md)
