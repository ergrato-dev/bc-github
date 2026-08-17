# Semana 09 — Actions: fundamentos

> Aquí empieza la parte más grande de la plataforma. Tres semanas de Actions, y
> esta es la que evita que pases los próximos años copiando YAML sin entenderlo.

> [!NOTE]
> Contenido detallado en preparación. Esta semana ya tiene definidos objetivos,
> contenidos, tiempos, trucos y entregables.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Explicar el modelo de ejecución: runner, job, step, shell
- Elegir el evento correcto y leer su payload
- Distinguir `pull_request` de `pull_request_target` y por qué importa
- Usar contexts y expresiones (`github`, `env`, `needs`, `matrix`, `vars`)
- Construir matrices con `include`, `exclude` y `fail-fast`
- Publicar y consumir **artifacts** entre jobs
- Configurar **caché** correctamente (y saber cuándo no acierta)
- Depurar un workflow: logs de debug, `act` en local, re-run

## 📋 Prerrequisitos

- Semana 08 completada: ruleset con al menos un check requerido
- Node.js 22 y pnpm instalados

## 🗂️ Estructura de la Semana

```
week-09-actions_fundamentos/
├── 1-teoria/     01-modelo-de-ejecucion · 02-eventos-y-payloads
│                 03-contexts-y-expresiones · 04-matrices-artifacts-y-cache
├── 2-practicas/  01-primer-workflow-de-ci · 02-matriz-de-versiones
│                 03-artifacts-y-cache · 04-depurar-un-workflow
├── 3-proyecto/   El CI de tu repositorio
├── 4-recursos/ · 5-glosario/
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| `01-modelo-de-ejecucion.md` | Runner, job, step, shell, sistema de archivos | 30 min |
| `02-eventos-y-payloads.md` | `push`, `pull_request`, `workflow_dispatch`, `schedule`, filtros | 30 min |
| `03-contexts-y-expresiones.md` | Contexts, funciones, `if:`, `needs`, outputs | 30 min |
| `04-matrices-artifacts-y-cache.md` | Matrices, artifacts, caché, concurrency básica | 30 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| `01-primer-workflow-de-ci.md` | CI real que corre tus tests en cada PR | 45 min |
| `02-matriz-de-versiones.md` | Matriz de Node con `include` y `exclude` | 40 min |
| `03-artifacts-y-cache.md` | Artifacts entre jobs y caché de dependencias | 45 min |
| `04-depurar-un-workflow.md` | Debug logging, `act`, re-run y `tmate` | 40 min |

### Proyecto

Tu repositorio tiene CI de verdad: tests en matriz, caché, artifacts y el check
requerido por el ruleset de la Semana 08.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (4 archivos) | 2 h |
| Prácticas (4) | 2 h 50 min |
| Proyecto | 2 h 30 min |
| Revisión y verificación | 40 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Lanzar un workflow a mano | Añade `workflow_dispatch:` y usa `gh workflow run <archivo>` |
| Seguir la ejecución en vivo | `gh run watch` |
| Relanzar solo lo que falló | `gh run rerun <id> --failed` |
| Ver el log de lo que falló | `gh run view --log-failed` |
| Logs de depuración | Variable de repositorio `ACTIONS_STEP_DEBUG=true` |
| Probar en local antes de empujar | `act -j <job>` — no es idéntico, pero acorta el ciclo |
| Ver el payload del evento | `cat "$GITHUB_EVENT_PATH" \| jq .` dentro de un step |
| Resumen bonito del run | `echo "..." >> "$GITHUB_STEP_SUMMARY"` acepta Markdown |
| Pasar datos entre steps | `echo "clave=valor" >> "$GITHUB_OUTPUT"` |
| Avisar sin fallar | `echo "::warning file=x.js,line=3::mensaje"` |
| Caché que nunca acierta | La `key` debe incluir el hash del lockfile: `hashFiles('**/pnpm-lock.yaml')` |
| Matriz que no aborta al primer fallo | `strategy.fail-fast: false` |
| Cancelar runs viejos del mismo PR | `concurrency` con `cancel-in-progress: true` |

## 📌 Entregables

1. ✅ Workflow de CI que corre en cada PR
2. ✅ Matriz de al menos 3 versiones de Node
3. ✅ Caché de dependencias con acierto demostrado
4. ✅ Un artifact publicado y descargado
5. ✅ El check de CI marcado como requerido en el ruleset
6. ✅ Un run depurado con logs de debug

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 09 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 08: Gobernanza, rulesets y merge queue](../week-08-gobernanza_rulesets_y_merge_queue/README.md) | **Semana 09: Actions fundamentos** | [Semana 10: Reutilización y actions propias →](../week-10-actions_reutilizacion_y_actions_propias/README.md) |
