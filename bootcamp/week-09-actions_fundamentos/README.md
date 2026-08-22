# Semana 09 — Actions: fundamentos

> Aquí empieza la parte más grande de la plataforma. Tres semanas de Actions, y
> esta es la que evita que pases los próximos años copiando YAML sin entenderlo.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Explicar el modelo de ejecución: runner, job, step, shell, y qué se comparte
- Pasar datos entre steps y entre jobs con el mecanismo correcto
- Elegir el evento adecuado y leer su payload en vez de adivinarlo
- Declarar `permissions` mínimas y explicar por qué el defecto no basta
- Distinguir `pull_request` de `pull_request_target` y reconocer el *pwn request*
- Escribir steps inmunes a la inyección de comandos
- Usar contexts y expresiones sabiendo dónde está disponible cada uno
- Construir matrices con `include`, `exclude` y `fail-fast`, sin romper el ruleset
- Publicar y consumir **artifacts**, y configurar **caché** que acierte
- Depurar un workflow: `--log-failed`, logs de debug, `act`, re-run

## 📋 Prerrequisitos

- Semana 08 completada: ruleset en `main` con al menos un check requerido
- Semana 07: código y tests en el repositorio (`node --test` pasa en local)
- Node.js 22+ y pnpm 10 instalados (`corepack enable`)
- Repositorio **público**: los runners alojados por GitHub son gratuitos ahí

## 🗂️ Estructura de la Semana

```
week-09-actions_fundamentos/
├── 0-assets/     01-anatomia-de-un-workflow · 02-flujo-de-datos
│                 03-pull-request-target · 04-matriz · 05-artifact-vs-cache
├── 1-teoria/     01-modelo-de-ejecucion · 02-datos-entre-steps-y-jobs
│                 03-eventos-y-payloads · 04-seguridad-de-los-eventos
│                 05-contexts-y-expresiones · 06-matrices · 07-artifacts-y-cache
├── 2-practicas/  01-primer-workflow-de-ci · 02-matriz-de-versiones
│                 03-artifacts-y-cache · 04-depurar-un-workflow
├── starter/      ci.yml (se completa en 3 prácticas) · roto.yml (4 fallos)
├── 3-proyecto/   El CI de tu repositorio
├── 4-recursos/ · 5-glosario/ · checks.json · rubrica-evaluacion.md
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [`01-modelo-de-ejecucion.md`](1-teoria/01-modelo-de-ejecucion.md) | Runner, job, step, shell, timeouts, `concurrency` | 25 min |
| [`02-datos-entre-steps-y-jobs.md`](1-teoria/02-datos-entre-steps-y-jobs.md) | `$GITHUB_OUTPUT`, `$GITHUB_ENV`, `needs`, resúmenes | 20 min |
| [`03-eventos-y-payloads.md`](1-teoria/03-eventos-y-payloads.md) | Eventos, activity types, filtros, `schedule` | 25 min |
| [`04-seguridad-de-los-eventos.md`](1-teoria/04-seguridad-de-los-eventos.md) | `permissions`, forks, `pull_request_target`, inyección | 25 min |
| [`05-contexts-y-expresiones.md`](1-teoria/05-contexts-y-expresiones.md) | Contexts, disponibilidad, funciones, `if:`, secretos | 25 min |
| [`06-matrices.md`](1-teoria/06-matrices.md) | `include`, `exclude`, `fail-fast`, matrices dinámicas | 20 min |
| [`07-artifacts-y-cache.md`](1-teoria/07-artifacts-y-cache.md) | Artifacts, caché, límites y cuál usar | 25 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [`01-primer-workflow-de-ci.md`](2-practicas/01-primer-workflow-de-ci.md) | CI real que corre tus tests en cada PR, visto en verde y en rojo | 45 min |
| [`02-matriz-de-versiones.md`](2-practicas/02-matriz-de-versiones.md) | Matriz de Node, y el job agregador que salva el ruleset | 40 min |
| [`03-artifacts-y-cache.md`](2-practicas/03-artifacts-y-cache.md) | Artifacts entre jobs y caché con acierto **medido** | 45 min |
| [`04-depurar-un-workflow.md`](2-practicas/04-depurar-un-workflow.md) | Cuatro fallos deliberados, dos de ellos en verde | 40 min |

### Starter

[`starter/`](starter/README.md) — dos workflows con bloques comentados que se van
descomentando práctica a práctica. `permissions`, pines por SHA y el paso de
datos por `env:` vienen puestos desde el principio: no son opcionales.

### Proyecto

[`3-proyecto/`](3-proyecto/README.md) — el CI real de tu repositorio: tests en
matriz, caché, artifacts y un check con nombre estable que el ruleset de la
Semana 08 puede exigir sin romperse en el siguiente cambio.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (7 archivos) | 2 h 45 min |
| Prácticas (4) | 2 h 50 min |
| Proyecto | 1 h 45 min |
| Revisión y verificación | 40 min |
| **Total** | **8 h** |

## ⚠️ Los tres fallos que salen en verde

Un CI en rojo es un problema; un CI en verde que no comprueba nada es un
desastre, porque nadie lo mira. Los tres que esta semana enseña a cazar:

| Fallo | Síntoma | Arreglo |
|-------|---------|---------|
| Tubería sin `pipefail` | Tests rojos, step verde | `shell: bash` en todo `run:` con `\|` |
| Expresión que no resuelve | Valor vacío, sin error ni aviso | `: "${VAR:?mensaje}"` |
| Job agregador con `if:` propio | Verde con la matriz roja | Comprobar `needs.<job>.result` a mano |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Ver solo lo que falló | `gh run view <id> --log-failed` — el primer reflejo, siempre |
| Relanzar solo los jobs rotos | `gh run rerun <id> --failed` |
| Seguir la ejecución en vivo | `gh run watch` |
| Logs de depuración | Variable de repositorio `ACTIONS_STEP_DEBUG=true` — y borrarla al acabar |
| Ver el payload del evento | `jq . "$GITHUB_EVENT_PATH"` dentro de un step |
| Depurar un context entero | `${{ toJSON(needs) }}` pasado por `env:` |
| Resumen bonito del run | `echo "..." >> "$GITHUB_STEP_SUMMARY"` acepta Markdown y tablas |
| Pasar datos entre steps | `echo "clave=valor" >> "$GITHUB_OUTPUT"` (el step necesita `id:`) |
| Empezar por lo mínimo | `permissions: {}` y añadir solo lo que falle |
| Buscar interpolaciones peligrosas | `grep -rnE '\$\{\{ *github\.(event\|head_ref)' .github/workflows/` |
| Comprobar un pin por SHA | `gh api repos/<o>/<r>/tags --jq '.[] \| select(.name=="<tag>") \| .commit.sha'` |
| El `context` es el `name:` del job | Léelo con `gh pr checks --json name`, no lo deduzcas |
| Check estable con matriz variable | Job agregador con `needs` y nombre fijo |
| Caché que nunca acierta | La `key` debe llevar `hashFiles('**/pnpm-lock.yaml')` |
| Sin lockfile no hay caché | `package-manager-cache: false` hasta que lo haya |
| `pnpm/action-setup` antes de `setup-node` | Al revés, no encuentra el store |
| Ver y borrar cachés | `gh cache list` · `gh cache delete --all` |
| Artifact por combinación | Mete `${{ matrix.node }}` en el `name:`, o el segundo falla |
| Subir el informe aunque falle | `if: ${{ !cancelled() }}`, no `always()` |
| Matriz que no aborta al primer fallo | `strategy.fail-fast: false` |
| Un job experimental sin tumbar la matriz | `continue-on-error: true` lo excluye de `fail-fast` |
| Cancelar runs viejos del mismo PR | `concurrency` con `cancel-in-progress: true` |
| Ningún run zombi | `timeout-minutes: 10` — el defecto son 6 horas |
| Reactivar un `schedule` dormido | `gh workflow enable <archivo>` |
| Probar en local antes de empujar | `act -j <job>` — aproximado, no idéntico |

## 📌 Entregables

1. ✅ `.github/workflows/ci.yml` con `permissions` explícitas y actions pinneadas
2. ✅ El CI corre en cada PR y se ha visto en verde y en rojo
3. ✅ Matriz de 3 versiones de Node elegidas con criterio
4. ✅ Job agregador con nombre estable, requerido por el ruleset
5. ✅ Caché de dependencias con acierto demostrado y **medido**
6. ✅ Un artifact por combinación, publicado y descargado
7. ✅ Un run depurado con `--log-failed` y logs de debug
8. ✅ El procedimiento de depuración documentado en `CONTRIBUTING.md`

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 09 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 08: Gobernanza, rulesets y merge queue](../week-08-gobernanza_rulesets_y_merge_queue/README.md) | **Semana 09: Actions fundamentos** | [Semana 10: Reutilización y actions propias →](../week-10-actions_reutilizacion_y_actions_propias/README.md) |

← [Volver al inicio del bootcamp](../../README.md)
