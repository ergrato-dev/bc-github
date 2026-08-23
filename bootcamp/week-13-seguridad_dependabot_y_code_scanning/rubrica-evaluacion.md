# Rúbrica de Evaluación — Semana 13: Dependabot y code scanning

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | El estado de seguridad real del repositorio y las decisiones registradas |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Por qué un repositorio sin lockfile recibe menos alertas, y de qué tipo son exactamente las que pierde? |
| 2 | ¿Qué mide el CVSS, qué mide el EPSS, y por qué ordenar solo por el primero hace perder tiempo? |
| 3 | ¿Qué significa que `first_patched_version` valga `null` y en qué cambia lo que haces? |
| 4 | ¿Por qué el pull request de una actualización de seguridad sube a la versión mínima y no a la última? |
| 5 | ¿En qué se diferencian las actualizaciones de seguridad de las de versión, y qué pasa si borras el `dependabot.yml`? |
| 6 | ¿Cómo puede un bloque `ignore` acabar desactivando un arreglo de seguridad? |
| 7 | ¿Por qué un workflow disparado por Dependabot recibe un `GITHUB_TOKEN` de solo lectura, y por qué `pull_request_target` no es la solución? |
| 8 | ¿Qué encuentra CodeQL que un linter no puede encontrar, y por qué? |
| 9 | ¿Qué pasa exactamente cuando dos herramientas suben SARIF con la misma `category`? |
| 10 | ¿Qué se rompe cuando un SARIF llega sin `partialFingerprints`? |

<details>
<summary><strong>Respuestas</strong></summary>

1. Porque el grafo de dependencias se construye a partir de manifiestos y
   lockfiles. Sin lockfile, GitHub solo ve las dependencias **directas** y sus
   rangos; el árbol resuelto no existe para él. Lo que se pierde son las alertas
   de las **transitivas**, que son la mayoría de la superficie de ataque real y
   justo las que tú no elegiste.
2. El **CVSS** mide cuánto daño haría la vulnerabilidad si se explotara: es una
   propiedad del fallo. El **EPSS** estima la probabilidad de que se explote en
   los próximos 30 días: es una propiedad del mundo. Ordenar solo por CVSS lleva
   a arreglar `critical` teóricos que nadie está usando mientras un `medium` con
   EPSS alto sigue abierto.
3. Significa que **no existe arreglo**: ninguna actualización cierra esa alerta.
   Deja de ser una tarea de actualización y pasa a ser una decisión: mitigar el
   uso, sustituir el paquete, o asumir el riesgo por escrito con
   `tolerable_risk` y un comentario que diga quién lo asume.
4. Porque cuanto menor sea el salto, menor es la probabilidad de romper algo y
   mayor la de que te atrevas a fusionarlo hoy. El objetivo del pull request no
   es modernizar el proyecto, es sacarlo del rango vulnerable con el mínimo
   riesgo de regresión.
5. Las de **seguridad** las dispara una alerta, se activan con un ajuste del
   repositorio y suben a la versión mínima que parchea. Las de **versión** las
   dispara el calendario, suben a la última y existen **solo** si hay
   `.github/dependabot.yml`. Si borras el archivo, las de versión desaparecen y
   las de seguridad siguen funcionando.
6. Porque `ignore` afecta también a las actualizaciones de seguridad. Si ignoras
   los `major` de un paquete y su única versión parcheada resulta ser un `major`,
   nunca vas a recibir ese arreglo. Es la forma más silenciosa de apagar la
   seguridad creyendo que se está reduciendo ruido.
7. Porque el contenido del pull request viene de un registro público que tú no
   controlas: darle permisos de escritura y acceso a los secretos sería ejecutar
   código ajeno con privilegios. `pull_request_target` no lo arregla, lo empeora:
   ese evento corre en el contexto de la rama base **con** secretos, así que
   hacer checkout del código propuesto es la vulnerabilidad clásica de Actions.
   Lo correcto es `pull_request` pidiendo los permisos justos en el job.
8. El **camino** de un dato. Un linter mira una línea y decide si tiene mala
   pinta; CodeQL construye una base de datos del código y busca si existe una
   ruta desde una entrada controlable por un atacante hasta una operación
   peligrosa, aunque pase por tres funciones y dos archivos. Eso es taint
   tracking, y es lo que permite distinguir una concatenación peligrosa de una
   inofensiva.
9. Que se pisan. GitHub trata cada `category` como una serie independiente: al
   subir un SARIF, marca como resueltas las alertas anteriores **de esa
   categoría** que ya no aparecen. Con dos herramientas compartiéndola, cada
   subida cierra las alertas de la otra y el panel parpadea según quién terminó
   último.
10. La identidad de las alertas entre ejecuciones. Sin `partialFingerprints`,
    añadir tres líneas más arriba hace que GitHub cierre la alerta y abra otra
    idéntica — y con la vieja se pierde el descarte y el comentario que alguien
    escribió justificándolo.

</details>

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Dependabot en marcha | Alertas y actualizaciones de seguridad activas, alerta provocada y leída por API, `dependabot.yml` con `groups` y `cooldown`, sin errores en Insights | 10 |
| 02 — Triaje y auto-merge | Descarte con motivo y comentario, reapertura, alerta cerrada por fusión, auto-merge limitado a `patch` y por autor | 10 |
| 03 — CodeQL en verde | Análisis por defecto activado, vulnerabilidad provocada y arreglada de raíz, migración al avanzado con el lenguaje `actions` | 10 |
| 04 — SARIF de terceros | Revisión de dependencias bloqueando un PR real, SARIF de terceros con `category` propia, dos herramientas en la bandeja | 10 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| `dependabot.yml` con `npm`, `github-actions`, `groups` y `cooldown` | 10 |
| Alertas activas, sin ninguna `high` ni `critical` abierta | 10 |
| Actualizaciones de seguridad activas, sin pausa, y con PR en el historial | 10 |
| Auto-merge limitado a `semver-patch` y condicionado por el autor | 10 |
| CodeQL registrando análisis, incluido el lenguaje `actions`, sin alertas graves | 10 |
| Revisión de dependencias y SARIF de terceros con `category`, todo pinneado por SHA | 10 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| Cada descarte lleva `dismissed_reason` **y** un comentario que argumenta | 10 |
| El arreglo de la Práctica 03 elimina la construcción del comando, no la escapa | 10 |
| El `README.md` explica qué cubre cada control y dónde vive | 10 |
| Ningún `ignore` del `dependabot.yml` tapa un arreglo de seguridad | 5 |
| Los permisos de escritura viven en el job, nunca a nivel de workflow | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Un secreto real filtrado en un workflow o en un log | -100 (rotar y rehacer) |
| `pull_request_target` con checkout del código del pull request | -40 |
| Auto-merge activo sin ningún check obligatorio en el ruleset | -30 |
| Auto-merge que también fusiona `minor` o `major` | -25 |
| Alertas cerradas en masa sin motivo para dejar el panel limpio | -25 |
| Código deliberadamente vulnerable dejado sin arreglar en la rama por defecto | -25 |
| `ignore` que impide recibir la versión que parchea | -20 |
| Dos herramientas subiendo SARIF con la misma `category` | -20 |
| `security-events: write` declarado a nivel de workflow | -15 |
| Alguna action ajena sin pinnear por SHA en los workflows nuevos | -15 |
| Descartes con `dismissed_reason` pero sin comentario | -10 |
| El repositorio con Dependabot en pausa al entregar | -10 |
| Excluir rutas del análisis para bajar el número de alertas | -10 |

---

← [Volver a la Semana 13](README.md)
