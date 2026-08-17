# 📖 Glosario Global

Términos de toda la plataforma, A-Z. Cada semana tiene además su glosario propio
en `bootcamp/week-XX-*/5-glosario/`.

El nombre real de la feature va en inglés entre paréntesis: es como lo
encontrarás en `docs.github.com` y en la API.

## A

**Action** (*action*) — Unidad reutilizable que se invoca desde un `step` con
`uses:`. Puede ser JavaScript, Docker o *composite*. No confundir con **GitHub
Actions**, que es la plataforma de CI/CD entera.

**Attestation** (*artifact attestation*) — Declaración firmada de qué workflow,
en qué commit, produjo un artefacto. Se verifica con `gh attestation verify`.

**Audit log** — Registro de acciones administrativas de una organización.
Consultable por API.

## B

**Blame** — Vista que atribuye cada línea al commit que la introdujo.

**Branch protection** — Mecanismo **legado** de protección de ramas. Sustituido
por los **rulesets**; sigue existiendo para leer repositorios antiguos.

## C

**Check** (*status check*) — Resultado publicado sobre un commit. Un ruleset
puede exigir que determinados checks estén en verde antes de mergear.

**CodeQL** — Motor de análisis estático de GitHub. Es uno de los motores de
**code scanning**, no un sinónimo.

**`CODEOWNERS`** — Archivo que asigna revisores por ruta.

**Codespace** — Entorno de desarrollo en la nube definido por `devcontainer.json`.

**Community profile** — Puntuación de la documentación de comunidad de un repo.

## D

**Dependabot** — Servicio que abre PRs para actualizar dependencias, por
seguridad (*security updates*) o por versión (*version updates*, con
`dependabot.yml`).

**Devcontainer** — Definición reproducible de un entorno de desarrollo
(`.devcontainer/devcontainer.json`).

**Discussion** — Foro del repositorio, con categorías y modo pregunta/respuesta.

## E

**Environment** — Destino de despliegue con reglas propias: revisores
obligatorios, tiempo de espera, secretos exclusivos.

## F

**Fine-grained token** — PAT acotado a repos y permisos concretos, con caducidad
obligatoria. Es el tipo recomendado.

**Fork** — Copia de un repositorio bajo otra cuenta, con enlace al *upstream*.

## G

**`GITHUB_TOKEN`** — Credencial efímera que Actions inyecta en cada job. Su
alcance se controla con `permissions`.

**GitHub App** — Identidad propia de automatización con permisos declarados y
tokens de instalación efímeros. Preferible a un PAT compartido.

**GHCR** (*GitHub Container Registry*) — Registro de imágenes de contenedor en
`ghcr.io`.

**GraphQL API** — La segunda API de GitHub. Única vía para Projects v2,
Discussions y sub-issues.

## L

**Linguist** — Detección de lenguajes. Se corrige desde `.gitattributes`.

## M

**Merge queue** — Cola que prueba cada PR contra el estado resultante de los
anteriores antes de integrarlo. Evita que dos PRs verdes rompan `main` al
juntarse.

**Milestone** — Agrupación de issues y PRs con fecha objetivo.

## O

**OIDC** (*OpenID Connect*) — Mecanismo por el que un workflow obtiene
credenciales temporales de un proveedor cloud sin secretos de larga vida.

## P

**PAT** (*personal access token*) — Token personal. El clásico concede scopes
sobre toda la cuenta; el fine-grained se acota.

**Permissions** — Bloque de un workflow que limita lo que puede hacer
`GITHUB_TOKEN`. Se declara siempre.

**Projects v2** — Base de datos de items con vistas configurables. Reemplaza a
Projects classic, retirado.

**Provenance** (*npm provenance*) — Metadatos verificables de qué repo y
workflow publicaron un paquete.

**Pull request** — Propuesta de integrar una rama en otra, con revisión y checks.

**`pull_request_target`** — Evento que corre en el contexto del repositorio base
**con acceso a secretos**. Hacer checkout del código del PR en ese contexto es
una puerta trasera.

## R

**Reusable workflow** — Workflow invocable desde otro con `workflow_call`.

**Ruleset** — Mecanismo actual de gobierno de ramas y tags: reglas, objetivos por
patrón, actores con excepción y modo de evaluación.

**Runner** — Máquina que ejecuta un job. Alojado por GitHub o *self-hosted*.

## S

**SARIF** — Formato estándar de resultados de análisis estático. Es como se
suben a code scanning los hallazgos de herramientas de terceros.

**SBOM** (*software bill of materials*) — Inventario de dependencias de un
proyecto.

**Scorecard** (*OpenSSF Scorecard*) — Auditoría automatizada de prácticas de
seguridad de un repositorio.

**Secret scanning** — Detección de credenciales en el código. Con **push
protection**, bloquea el push antes de que el secreto entre.

**SemVer** — `MAYOR.MENOR.PARCHE`: rotura, funcionalidad, corrección.

## T

**Topic** — Etiqueta de descubrimiento del repositorio.

**Triage** — Proceso de clasificar issues entrantes: reproducir, etiquetar,
priorizar, asignar o cerrar. También es un nivel de permiso.

## W

**Webhook** — Notificación HTTP que GitHub envía ante un evento. Se verifica con
firma HMAC.

**Workflow** — Automatización definida en `.github/workflows/*.yml`, compuesta de
jobs y steps.

---

> Glosarios por semana: `bootcamp/week-XX-*/5-glosario/README.md`
