# Semana 08 — Gobernanza: rulesets y merge queue

> Todo lo que acordaste en las semanas 06 y 07 sigue siendo opcional. Esta
> semana se vuelve obligatorio, y lo hace la plataforma, no la buena voluntad.

> [!NOTE]
> Contenido detallado en preparación. Esta semana ya tiene definidos objetivos,
> contenidos, tiempos, trucos y entregables.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Explicar por qué los **rulesets** sustituyen a branch protection y qué aportan
- Escribir un ruleset con targets por patrón, reglas y *bypass actors*
- Usar el modo **evaluate** para probar una regla sin romper a nadie
- Exigir status checks, revisión de code owners y commits firmados
- Configurar **push rules**: bloquear archivos por tamaño o por ruta
- Decidir con criterio si tu repositorio necesita **merge queue**
- Proteger despliegues con **environments**, revisores y tiempos de espera

## 📋 Prerrequisitos

- Semana 07 completada: convención, DoD y CODEOWNERS en su sitio
- Semana 05: al menos un workflow que produzca un check

## 🗂️ Estructura de la Semana

```
week-08-gobernanza_rulesets_y_merge_queue/
├── 1-teoria/     01-rulesets-vs-branch-protection · 02-reglas-y-bypass
│                 03-merge-queue · 04-environments-y-despliegue
├── 2-practicas/  01-primer-ruleset · 02-checks-y-firmas-obligatorios
│                 03-push-rules · 04-environments
├── 3-proyecto/   Tu `main` protegida de verdad
├── 4-recursos/ · 5-glosario/
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| `01-rulesets-vs-branch-protection.md` | Modelo, targets, capas, por qué el reemplazo | 30 min |
| `02-reglas-y-bypass.md` | Cada regla, bypass actors, modo evaluate | 35 min |
| `03-merge-queue.md` | Qué problema resuelve y cuándo es sobreingeniería | 25 min |
| `04-environments-y-despliegue.md` | Environments, revisores, wait timers, secretos | 30 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| `01-primer-ruleset.md` | Ruleset en `main` en modo evaluate y luego activo | 45 min |
| `02-checks-y-firmas-obligatorios.md` | Status checks y firmas requeridos | 45 min |
| `03-push-rules.md` | Bloqueo de archivos grandes y rutas sensibles | 35 min |
| `04-environments.md` | Environment con aprobación manual | 35 min |

### Proyecto

`main` deja de aceptar pushes directos: PR obligatorio, checks en verde, commits
firmados y revisión de code owners.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (4 archivos) | 2 h |
| Prácticas (4) | 2 h 40 min |
| Proyecto | 2 h 30 min |
| Revisión y verificación | 50 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Probar una regla sin romper nada | `enforcement: evaluate` — registra lo que habría bloqueado |
| Los rulesets se apilan | Varios pueden aplicar a la vez; se suman, no se sustituyen |
| Exportar e importar un ruleset | `gh api repos/{owner}/{repo}/rulesets --jq '.[0]'` y `--method POST --input` |
| El check que nunca corre bloquea para siempre | Si exiges un check que no se dispara en ese PR, no se puede mergear |
| Bypass para el bot, no para ti | Añade la App como bypass actor antes de que te bloquee un release automático |
| Ver qué reglas afectan a una rama | `gh api repos/{owner}/{repo}/rules/branches/main` |
| Bloquear archivos gigantes | Push rule de tamaño máximo: evita que un `.zip` entre a la historia |
| Firmas obligatorias | Recuerda subir la clave como `signing` (Semana 01) o te bloqueas a ti |
| Merge queue no es para todos | Con menos de 10 PRs al día, es complejidad sin retorno |
| Environments para secretos | Un secreto de environment solo existe en los jobs que lo declaran |

## 📌 Entregables

1. ✅ Ruleset activo en `main` con PR obligatorio
2. ✅ Al menos un status check requerido
3. ✅ Commits firmados obligatorios
4. ✅ Revisión de code owners requerida
5. ✅ Una push rule configurada
6. ✅ Un environment con revisor obligatorio

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 08 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 07: Code review y convenciones](../week-07-code_review_y_convenciones/README.md) | **Semana 08: Gobernanza, rulesets y merge queue** | [Semana 09: Actions fundamentos →](../week-09-actions_fundamentos/README.md) |
