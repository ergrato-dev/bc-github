# Glosario — Semana 09

## A

**`act`** — Herramienta de terceros que ejecuta workflows en contenedores
locales. Acorta el ciclo de iteración, pero **no es GitHub**: imágenes distintas,
sin tus secretos, y algunas actions no funcionan.

**`ACTIONS_STEP_DEBUG`** — Variable o secreto de repositorio que, puesto a
`true`, añade líneas `::debug::` con la evaluación de expresiones y el entorno de
cada step. Si existen la variable y el secreto, gana el secreto.

**`ACTIONS_RUNNER_DEBUG`** — Lo mismo para los logs del propio runner. No salen
en la web: hay que descargar el archivo de logs del run y mirar en
`runner-diagnostic-logs`.

**Action** — Unidad reutilizable que se invoca con `uses:`. Puede ser JavaScript,
Docker o *composite*. Ejecuta código ajeno dentro de tu job, con tus permisos: se
pinnea por SHA.

**Activity type** — Subtipo de un evento (`opened`, `synchronize`, `edited`…).
`pull_request` solo escucha `opened`, `synchronize` y `reopened` por defecto.

**`allow-unsafe-pr-checkout`** — Input de `actions/checkout` que reactiva el
checkout de código de un fork bajo `pull_request_target`, bloqueado por defecto
desde junio de 2026. Su nombre es deliberadamente llamativo: si aparece en un
workflow, alguien desactivó una protección a propósito.

**Artifact** — Archivos que sobreviven al job y se descargan desde la interfaz.
Es el canal correcto cuando el job siguiente **no puede funcionar sin ellos**.

## C

**Caché** — Almacén que acelera un paso repetido. Si no acierta, el job hace lo
mismo, más despacio. 10 GB por repositorio, y se borra lo no usado en 7 días.

**`cache-hit`** — Output de `actions/cache` y de `setup-node`. Vale `'true'`
—cadena, no booleano— **solo** con acierto exacto de `key`. Un acierto por
`restore-keys` lo deja en `'false'` aunque haya restaurado algo.

**`cancel-in-progress`** — Opción de `concurrency` que cancela el run anterior del
mismo grupo. Correcta en CI, peligrosa en despliegues.

**`concurrency`** — Agrupa runs para que no se acumulen. Se declara por workflow
o por job.

**Context** — Objeto de datos accesible desde una expresión: `github`, `env`,
`vars`, `secrets`, `job`, `steps`, `runner`, `strategy`, `matrix`, `needs`,
`inputs`, `jobs`. No todos están disponibles en todas partes.

**`continue-on-error`** — Hace que el fallo de un step o job no tumbe el job o el
run. En un job de matriz, además lo excluye de `fail-fast`.

## E

**`env:`** — Bloque de variables de entorno. Es también **la** defensa contra la
inyección de comandos: los datos del payload se pasan por aquí, nunca
interpolados dentro de un `run:`.

**Evento** — Lo que dispara un workflow. Determina cuándo corre, qué payload
recibe y qué permisos tiene su token.

**Expresión** — `${{ ... }}`. La evalúa GitHub **antes** de que exista el runner;
para cuando el `run:` arranca, ya es texto dentro del script. Una expresión que
no resuelve **no da error: da cadena vacía**.

## F

**`fail-fast`** — Si un job de la matriz falla, cancela los demás. Vale `true`
por defecto; en CI casi siempre interesa `false`.

**`fromJSON` / `toJSON`** — Deserializa y serializa. `fromJSON` es la base de las
matrices dinámicas; `toJSON` es la forma rápida de depurar un context entero.

## G

**`GITHUB_ENV`** — Archivo al que se añaden variables de entorno para los steps
**siguientes** del mismo job.

**`GITHUB_OUTPUT`** — Archivo al que un step escribe outputs, legibles como
`steps.<id>.outputs.<clave>`. Requiere que el step tenga `id:`.

**`GITHUB_PATH`** — Archivo al que se añaden directorios al `PATH` de los steps
siguientes.

**`GITHUB_STEP_SUMMARY`** — Archivo Markdown que se muestra en la portada del
run. Acepta tablas, listas y Mermaid.

**`GITHUB_TOKEN`** — Token efímero por job, con alcance a ese repositorio. Nace y
muere con el job. Sus permisos los fija `permissions:`, y en PRs de un fork es
**siempre de solo lectura**.

**`GITHUB_WORKSPACE`** — Raíz donde `actions/checkout` deja el repositorio. Está
**vacía** hasta que ese step corre.

## H

**`hashFiles(patrón)`** — Función que devuelve el hash de unos archivos. Es lo
que hace que una `key` de caché **invalide** cuando cambian las dependencias.

## I

**`include`** — Añadido a una matriz. Si sus claves **encajan** con una
combinación existente, la enriquece; si aportan un valor que no estaba, **crean
un job aparte**. Se aplica después de `exclude`.

**Inyección de comandos** — Ejecutar código del atacante por interpolar en un
`run:` un dato que él controla (título de PR, cuerpo de un comentario, nombre de
rama). Las comillas no protegen; `env:` sí.

## J

**Job** — Unidad de ejecución con su propio runner limpio. Los jobs de un
workflow corren en paralelo salvo que `needs` diga otra cosa, y **no comparten
nada** entre sí.

## M

**Matriz** — Estrategia que genera un job por combinación de valores. Máximo 256
jobs por run. Cambia el nombre de los checks, con lo que puede romper un ruleset.

**`max-parallel`** — Límite de jobs de matriz simultáneos. Útil cuando comparten
un recurso que no escala.

**`merge_group`** — Evento que dispara CI sobre un candidato de merge queue. Un
workflow que solo escucha `pull_request` deja la cola colgada (Semana 08).

## N

**`needs`** — Hace **dos cosas**: ordena los jobs y da acceso a
`needs.<job>.outputs` y `needs.<job>.result`. Un job con `if:` propio deja de
heredar el fallo de sus `needs`.

## P

**`permissions`** — Recorta lo que puede hacer el `GITHUB_TOKEN`. Declarar **una
sola** entrada pone todas las demás a `none`. Sin este bloque se aplica el
defecto del repositorio, que puede ser escritura.

**`pipefail`** — Opción de shell que propaga el fallo a través de una tubería.
Sin ella, `node --test | tee x` sale en verde con los tests rojos. `shell: bash`
la activa.

**`pull_request`** — Evento que se ejecuta con el token en solo lectura y sin
secretos cuando el PR viene de un fork. Es el que hay que usar.

**`pull_request_target`** — Igual, pero con contexto y credenciales del
repositorio base. Combinado con un checkout del código del PR es la vulnerabilidad
conocida como *pwn request*.

**Pwn request** — El ataque anterior: código ajeno ejecutado con el token de
escritura y los secretos del repositorio base.

## R

**`restore-keys`** — Claves de respaldo de una caché, para acierto parcial. Mejor
una caché algo vieja que ninguna.

**`retention-days`** — Días que se conserva un artifact. Hasta 90; para informes
de CI, 7 sobran.

**Runner** — La máquina que ejecuta un job. Los alojados por GitHub son gratuitos
en repositorios públicos, se crean limpios y se destruyen al terminar.

**Rule suite** — Ver Semana 08. No confundir con los runs de Actions.

## S

**`schedule`** — Evento de `cron`, en **UTC**, con intervalo mínimo de 5 minutos.
Se retrasa en horas punta y **se desactiva solo tras 60 días sin actividad** en
un repositorio público.

**Step** — Un `run:` o un `uses:`. Los steps de un job comparten disco pero
**no** proceso: cada `run:` es un shell nuevo.

**`success()` / `failure()` / `cancelled()` / `always()`** — Funciones de estado.
`success()` es el `if:` implícito de todo step y todo job. `always()` se ejecuta
también al cancelar; casi siempre lo que quieres es `!cancelled()`.

## T

**`timeout-minutes`** — Límite de tiempo de un job o un step. El defecto de un
job son **360 minutos** (6 horas).

**`tmate`** — Action de terceros que abre una sesión SSH dentro del runner. Se
usa como último recurso, con `limit-access-to-actor: true`, y se retira del
workflow al terminar.

## W

**Workflow** — Un archivo `.yml` en `.github/workflows/` con sus eventos y sus
jobs.

**`workflow_dispatch`** — Evento manual. Solo dispara si el archivo **existe en
la rama por defecto**.

**`workflow_run`** — Evento que dispara al terminar otro workflow. Sirve para
separar "compilar sin credenciales" de "procesar con permisos".

---

← [Volver a la Semana 09](../README.md)
