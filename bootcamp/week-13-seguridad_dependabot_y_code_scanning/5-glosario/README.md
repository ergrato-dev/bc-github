# Glosario — Semana 13

Términos clave de esta semana, A-Z. El nombre real de la feature va en inglés
entre paréntesis cuando aplica.

## A

**Alerta de code scanning** — Hallazgo de una herramienta de análisis estático
anclado a un archivo y una línea. Tiene ciclo propio: `open`, `dismissed`,
`fixed`. Se descarta con cuatro motivos distintos de los de Dependabot.

**Alerta de Dependabot** — Intersección entre tu grafo de dependencias y la base
de avisos: una versión que tienes instalada está en el rango vulnerable de un
aviso publicado. No es una tarea; es una afirmación.

**Análisis avanzado (advanced setup)** — Code scanning configurado con un
workflow tuyo. Necesario para consultas propias, rutas excluidas, compilaciones
no estándar o control del disparador. Desactiva el análisis por defecto.

**Análisis por defecto (default setup)** — Code scanning configurado con un
ajuste, sin workflow. Lo mantiene GitHub. Se controla con `state`, `languages`,
`query_suite`, `threat_model` y `runner_type`.

**`auto_dismissed`** — Estado de una alerta de Dependabot descartada por una
regla de auto-triage, no por una persona. Se distingue de `dismissed` justo para
poder auditar la diferencia.

## C

**`category`** — Etiqueta que identifica una serie de resultados de code
scanning. Al subir un SARIF, las alertas anteriores **de esa misma categoría**
que ya no aparecen se marcan como resueltas. Dos herramientas compartiéndola se
cierran las alertas mutuamente.

**CodeQL** — Motor de análisis que convierte el código en una base de datos
relacional y lanza consultas contra ella. Encuentra caminos entre una entrada no
confiable y una operación peligrosa, no patrones de texto.

**Code scanning** — La bandeja de alertas de análisis estático del repositorio.
No es CodeQL: es el sitio donde aterrizan los resultados de cualquier herramienta
que sepa emitir SARIF.

**`cooldown`** — Retraso en días antes de proponer una versión recién publicada.
Solo aplica a actualizaciones de **versión**, nunca a las de seguridad. Por
defecto Dependabot ya aplica 3 días.

**CVE** — Identificador global de una vulnerabilidad. Estable entre herramientas,
pero lento: el GHSA suele existir antes, y hay GHSA sin CVE.

**CVSS** — Puntuación de **cuánto daño** haría una vulnerabilidad. Propiedad del
fallo, no del mundo. En la API se expresa como `low`, `medium`, `high` o
`critical`; la interfaz escribe *Moderate* donde la API dice `medium`.

## D

**`dependency-review-action`** — Action que compara la rama base con la del pull
request y falla si el diff introduce una dependencia vulnerable o con una
licencia rechazada. Actúa **antes** de fusionar; Dependabot, después.

**Descarte (dismissal)** — Cerrar una alerta declarando por qué no se va a
arreglar. En Dependabot: `fix_started`, `inaccurate`, `no_bandwidth`, `not_used`,
`tolerable_risk`. En code scanning: `false positive`, `won't fix`,
`used in tests`, `mitigated`.

## E

**EPSS** — Estimación de la **probabilidad** de que una vulnerabilidad se explote
en los próximos 30 días. Propiedad del mundo, no del fallo. Complementa al CVSS y
no lo sustituye.

## F

**`first_patched_version`** — La versión que cierra la alerta. Cuando vale
`null`, **no existe arreglo**: ninguna actualización la cierra, y toda la energía
que gastes ahí es energía perdida.

## G

**GHSA** — Identificador de un aviso del GitHub Advisory Database. Añade lo que
el CVE no trae: los rangos afectados por ecosistema y la versión parcheada exacta.

**Grafo de dependencias (dependency graph)** — El inventario de lo que usa tu
proyecto, calculado a partir de manifiestos y lockfiles. Sin lockfile solo ve las
dependencias directas, y las transitivas quedan fuera de las alertas.

**`groups`** — Agrupación de actualizaciones en un solo pull request. Una
dependencia entra en el **primer** grupo que casa, no en todos. `applies-to`
decide si el grupo cubre `version-updates` o `security-updates`.

## I

**`ignore`** — Filtro que excluye dependencias o versiones de las
actualizaciones. Afecta **también** a las de seguridad: es la forma más
silenciosa de desactivar la seguridad creyendo que se reduce ruido.

## L

**Lockfile** — Archivo con las versiones exactas resueltas, transitivas
incluidas. Commitearlo es lo que hace que el grafo vea el árbol completo.

## P

**`partialFingerprints`** — Campo del SARIF que da identidad a una alerta entre
ejecuciones. Sin él, un cambio de líneas cierra la alerta y abre otra idéntica, y
con ella se pierde el descarte que alguien escribió.

**Pausa (paused)** — Estado en el que GitHub deja de generar actualizaciones
porque nadie interactúa con los pull requests. No es un ajuste tuyo: es un
síntoma de que el flujo de trabajo no está funcionando.

## Q

**Query suite** — Conjunto de consultas de CodeQL. `default` es preciso y
silencioso; `extended` encuentra más y se equivoca más. En el workflow los mismos
conjuntos se llaman `security-extended` y `security-and-quality`.

## R

**`relationship`** — Si la dependencia es `direct` o `transitive`. Decide si el
arreglo está en tu mano o depende de otro paquete.

## S

**SARIF (2.1.0)** — Formato estándar de resultados de análisis estático. Es el
pasaporte que permite a cualquier herramienta entrar en la bandeja de code
scanning y heredar el histórico, los descartes y los checks obligatorios.

**`scope`** — Si la dependencia es de `runtime` o de `development`. Una
vulnerabilidad en algo que solo corre en CI no tiene la misma urgencia que una
que sirve peticiones.

**`security-events: write`** — Permiso del `GITHUB_TOKEN` que permite publicar
resultados en code scanning. Se concede en el job que sube, nunca a nivel de
workflow.

**Secretos de Dependabot** — Almacén de secretos aparte del de Actions. Un
workflow disparado por Dependabot **solo** ve estos. Se gestionan con
`gh secret set --app dependabot`.

## T

**Taint tracking** — Seguir el recorrido de un dato desde una fuente controlable
por un atacante hasta una operación peligrosa. Es lo que un linter no puede hacer
y CodeQL sí.

**`threat_model`** — Qué se considera entrada no confiable: `remote` solo lo que
llega por red; `remote_and_local` añade argumentos, variables de entorno,
ficheros y bases de datos.

## U

**`update-type`** — El nivel semántico de una actualización. Con prefijo en
`ignore` y en la salida de `fetch-metadata`
(`version-update:semver-patch`); sin prefijo en `groups` (`patch`). Confundirlos
hace que el bloque se ignore en silencio.

## V

**Actualizaciones de seguridad (security updates)** — Pull requests generados por
una alerta, que suben a la **versión mínima** que parchea. Se activan con un
ajuste del repositorio y no necesitan `dependabot.yml`.

**Actualizaciones de versión (version updates)** — Pull requests generados por el
calendario, que suben a la última versión. Existen **solo** si hay
`.github/dependabot.yml`.

---

> 📚 Glosario global: [docs/glosario-global.md](../../../docs/glosario-global.md)

← [Volver a la Semana 13](../README.md)
