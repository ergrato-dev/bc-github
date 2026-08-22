# Glosario — Semana 11

## A

**`actionlint`** — Analizador estático de workflows: sintaxis, expresiones,
contextos inexistentes y —con `shellcheck` integrado— los `run:` mal escritos.
Se ejecuta en local y evita el ciclo push–esperar–error.

**`::add-mask::`** — Comando de workflow que le dice al runner que enmascare un
valor generado dentro del run. Debe emitirse **antes** del primer uso del valor;
después ya es tarde.

**`allowed_actions`** — Política del repositorio que decide qué procedencias de
actions se admiten: `all`, `local_only` o `selected`. Con `selected` se afina en
`actions/permissions/selected-actions`.

**Artefacto (artifact)** — Archivo o conjunto de archivos que un job produce y
otro consume. En un repositorio público es descargable por cualquiera durante el
periodo de retención.

**`aud` (audiencia)** — Claim del token OIDC que dice para quién se emitió. Un
proveedor que no lo comprueba puede aceptar tokens emitidos para otro.

## B

**Build once, deploy many** — Regla central del CD: el artefacto que se despliega
es exactamente el que se validó. Reconstruir por entorno produce un binario que
nadie ha probado.

## C

**`cancel-in-progress`** — Opción de `concurrency`. En CI conviene `true`; en un
despliegue, `false`: cancelar a mitad deja el destino en un estado que nadie ha
probado.

**Claim** — Cada uno de los campos del token OIDC (`sub`, `aud`, `repository`,
`environment`, `runner_environment`…). Es lo que el proveedor compara con su
política de confianza.

**Condición de confianza** — Regla del proveedor externo que decide qué tokens
acepta. Su calidad decide la seguridad de todo el esquema OIDC; un comodín en el
`sub` la anula.

## D

**`default_workflow_permissions`** — Permisos con los que nace el `GITHUB_TOKEN`
en un workflow que no declara `permissions:`. En `read`, un olvido deja de ser un
agujero.

**Dependabot (`github-actions`)** — Ecosistema de Dependabot que actualiza los
pines por SHA de las actions y su comentario de versión. Sin él, pinnear congela
también los parches.

**Deployment** — Registro que GitHub crea cuando un job declara `environment:`.
Tiene autor, SHA, URL y estados; es la fuente de las métricas de frecuencia de
despliegue.

## E

**Entrega continua (continuous delivery)** — Cualquier commit de `main` **puede**
publicarse en cualquier momento; la publicación la autoriza una persona. Es lo
que monta esta semana.

**Despliegue continuo (continuous deployment)** — Cada commit de `main`
**se publica** sin intervención. Se consigue quitando el revisor del environment.

**Environment** — Objeto de GitHub que agrupa secretos, variables y reglas de
protección de un destino de despliegue. Su clave `environment:` en un job abre la
puerta *antes* del primer step.

**Efímero (runner)** — Runner que se da de baja tras ejecutar un solo job
(`--ephemeral`). Único modo defendible de operar runners propios.

## G

**`github-pages` (environment)** — Environment que GitHub crea solo al activar
Pages con origen Actions. Nace sin revisores: endurecerlo es tarea del dueño del
repositorio.

## I

**`id-token: write`** — Permiso que habilita pedir un token OIDC. No concede nada
sobre el repositorio: lo que ese token abra lo decide el proveedor externo.

**Immutable release** — Release cuyos assets y tag quedan protegidos tras
publicarse, con attestations firmadas. Disponible de forma general desde octubre
de 2025; es la mitigación directa del "tag movido".

## J

**JWT** — Token firmado en tres partes (cabecera, payload, firma). El payload es
base64url legible: la garantía no es el secreto de su contenido, es la firma.

## O

**OIDC (OpenID Connect)** — Protocolo por el que GitHub emite una identidad
firmada del run y un proveedor externo la cambia por una credencial temporal. La
alternativa a guardar claves de larga vida.

## P

**`pages: write`** — Permiso que necesita el job que publica en GitHub Pages. Si
falta, `actions/deploy-pages` responde 403 con el mensaje que lo dice.

**Pinning por SHA** — Referenciar una action por su commit completo en vez de por
tag o rama. La única forma de que `uses:` signifique siempre lo mismo.

**Política de ramas de despliegue (`deployment_branch_policy`)** — Regla del
environment que limita desde qué ramas se puede desplegar: solo protegidas o
patrones a medida.

**`prevent_self_review`** — Regla del environment que impide que quien lanzó el
despliegue lo apruebe. Correcta en equipo; bloqueante en autoestudio.

**Promoción** — Llevar un artefacto ya construido de una etapa a la siguiente sin
reconstruirlo. Lo contrario de un pipeline que compila una vez por entorno.

## R

**Rollback** — Volver a la versión anterior. Con *build once*, republicar el
artefacto anterior (`gh run rerun`); su ventana depende de la retención.

**Runner group** — Agrupación de runners propios con permisos por repositorio.
Existe a nivel de organización o empresa, no en cuentas personales.

## S

**`sha_pinning_required`** — Política de repositorio, organización o empresa que
rechaza cualquier `uses:` que no sea un SHA completo. Los reusable workflows
siguen admitiendo tags.

**Self-hosted runner** — Máquina propia registrada como runner. En repositorios
públicos es un riesgo grave: un PR de un fork puede ejecutar código en ella.

**Smoke test** — Comprobación mínima posterior al despliegue: que el destino
responde. Sin ella, "verde" solo significa que la subida terminó.

**`sub` (subject)** — Claim que resume la identidad del run
(`repo:OWNER/REPO:environment:production`). Es el campo que se condiciona en el
proveedor.

## V

**Variable de environment** — Valor no secreto asociado a un environment
(`vars.NOMBRE`). Es donde viven las diferencias legítimas entre entornos, en vez
de duplicar el YAML.

## Z

**`zizmor`** — Analizador estático de seguridad para workflows: inyección de
plantillas, pines flotantes, permisos excesivos. Clasifica los hallazgos por
confianza y puede exportar SARIF.

---

← [Volver a la Semana 11](../README.md)
