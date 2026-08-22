# Semana 08 — Gobernanza: rulesets y merge queue

> Todo lo que acordaste en las semanas 06 y 07 sigue siendo opcional. Esta
> semana se vuelve obligatorio, y lo hace la plataforma, no la buena voluntad.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Explicar por qué los **rulesets** sustituyen a branch protection y qué aportan
- Escribir un ruleset con targets por patrón, reglas y *bypass actors*
- Versionar la gobernanza como JSON en el repositorio, no en Settings
- Exigir status checks, revisión de code owners y commits firmados
- Distinguir qué reglas ofrece tu plan y cuáles no, sin perder una tarde
- Sustituir con un check de CI lo que la plataforma no te da como regla
- Decidir con criterio si tu repositorio necesita **merge queue**
- Proteger despliegues con **environments**, revisores y tiempos de espera

## 📋 Prerrequisitos

- Semana 07 completada: convención, DoD y CODEOWNERS en su sitio
- Semana 07: el workflow `validar-pr.yml`, que produce el primer check
- Semana 01: firma de commits funcionando (`git log -1 --format='%G?'` → `G`)
- Repositorio **público** (los rulesets en privado requieren plan de pago)

## 🗂️ Estructura de la Semana

```
week-08-gobernanza_rulesets_y_merge_queue/
├── 0-assets/     01-capas-de-gobernanza · 02-anatomia-de-un-ruleset
├── 1-teoria/     01-rulesets-vs-branch-protection · 02-la-regla-pull-request
│                 03-checks-y-firmas · 04-proteger-la-historia-y-tags
│                 05-bypass-y-auditoria · 06-merge-queue
│                 07-environments-y-despliegue
├── 2-practicas/  01-primer-ruleset · 02-checks-y-firmas-obligatorios
│                 03-proteger-la-historia · 04-environments
├── 3-proyecto/   Tu `main` protegida de verdad
├── 4-recursos/ · 5-glosario/ · checks.json · rubrica-evaluacion.md
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [`01-rulesets-vs-branch-protection.md`](1-teoria/01-rulesets-vs-branch-protection.md) | Modelo, targets, JSON, capas, disponibilidad por plan | 25 min |
| [`02-la-regla-pull-request.md`](1-teoria/02-la-regla-pull-request.md) | Cada parámetro, qué poner trabajando solo, combinaciones imposibles | 20 min |
| [`03-checks-y-firmas.md`](1-teoria/03-checks-y-firmas.md) | De dónde sale el `context`, el check que nunca corre, firmas | 25 min |
| [`04-proteger-la-historia-y-tags.md`](1-teoria/04-proteger-la-historia-y-tags.md) | `non_fast_forward`, tags inmutables, sustituto de las push rules | 25 min |
| [`05-bypass-y-auditoria.md`](1-teoria/05-bypass-y-auditoria.md) | Bypass actors, `disabled` como borrador, rule suites, historial | 20 min |
| [`06-merge-queue.md`](1-teoria/06-merge-queue.md) | Qué problema resuelve y cuándo es sobreingeniería | 25 min |
| [`07-environments-y-despliegue.md`](1-teoria/07-environments-y-despliegue.md) | Environments, revisores, wait timers, secretos | 20 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [`01-primer-ruleset.md`](2-practicas/01-primer-ruleset.md) | Ruleset versionado en JSON, de borrador a activo | 45 min |
| [`02-checks-y-firmas-obligatorios.md`](2-practicas/02-checks-y-firmas-obligatorios.md) | Status checks y firmas requeridos, vistos fallar y pasar | 45 min |
| [`03-proteger-la-historia.md`](2-practicas/03-proteger-la-historia.md) | Force push, borrado, historia lineal y el sustituto de las push rules | 40 min |
| [`04-environments.md`](2-practicas/04-environments.md) | Environment con aprobación manual y wait timer | 40 min |

### Proyecto

[`3-proyecto/`](3-proyecto/README.md) — `main` deja de aceptar pushes directos:
PR obligatorio, checks en verde, commits firmados y revisión de code owners. Y
una segunda puerta para lo que sale a producción.

## ⚠️ Qué ofrece tu plan y qué no

El bootcamp asume **GitHub Free** sobre un repositorio **público** de una cuenta
personal. Cuatro features de gobernanza no están disponibles ahí, y saberlo antes
de buscarlas es parte del contenido de la semana:

| Feature | Free · público · personal | Requiere |
|---------|:-------------------------:|----------|
| Rulesets de rama y tag | ✅ | En privado: Pro/Team/Enterprise |
| Environments con revisor y wait timer | ✅ | En privado: Pro/Team/Enterprise |
| **Push rulesets** (tamaño, rutas, extensiones) | ❌ | Team+ **y** repo privado o interno |
| **Merge queue** | ❌ | Repositorio de una **organización** |
| **Metadata rules** (`commit_message_pattern`) | ❌ | Organización en **GitHub Enterprise** |
| **Modo `evaluate`** | ❌ | **GitHub Enterprise** — usa `disabled` |

Lo que la plataforma no da como regla se cubre con un **check de CI requerido**.
Ese es el trabajo de la Práctica 03, y el puente hacia la Semana 09.

> Verificado en agosto de 2026 contra la API y
> [docs.github.com](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).
> La disponibilidad por plan cambia: compruébala antes de dar una regla por
> perdida.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (7 archivos) | 2 h 40 min |
| Prácticas (4) | 2 h 50 min |
| Proyecto | 2 h 10 min |
| Revisión y verificación | 20 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Ver las reglas efectivas de una rama | `gh api repos/{owner}/{repo}/rules/branches/main --jq '[.[].type]'` |
| El borrador que sí tienes | `enforcement: disabled` — `evaluate` requiere Enterprise |
| Los rulesets se apilan | Varios pueden aplicar a la vez; se suman, no se sustituyen |
| Versiona la gobernanza | El JSON en `.github/rulesets/`, y se envía con `--input` |
| Exportar un ruleset limpio | `gh api repos/{owner}/{repo}/rulesets/<id> --jq 'del(.id, .node_id, .created_at, .updated_at, .source, .source_type, ._links)'` |
| El check que nunca corre bloquea para siempre | Si exiges un check que no se dispara en ese PR, no se puede mergear |
| El `context` es el `name:` del job | Léelo con `gh pr checks --json name`, no lo deduzcas |
| Trabajando solo, aprobaciones a 0 | Con 1, GitHub no te deja aprobar tu propio PR y te bloqueas |
| Bypass para el bot, no para ti | Añade la App como bypass actor antes de que te bloquee un release automático |
| Escape sin bypass | `disabled` → arreglas → `active`: queda en el historial del ruleset |
| Firmas obligatorias | Comprueba `git log -1 --format='%G?'` → `G` **antes** de activarlas |
| Merge queue no es para todos | Con menos de 10 PRs al día, es complejidad sin retorno |
| El ruleset tiene historial | `gh api repos/{owner}/{repo}/rulesets/<id>/history` |
| Environments para secretos | Un secreto de environment solo existe en los jobs que lo declaran |
| `PUT` de environment reemplaza | Manda el objeto completo o pierdes los revisores |

## 📌 Entregables

1. ✅ Ruleset `active` en `main`, versionado en `.github/rulesets/`
2. ✅ PR obligatorio con revisión de code owners
3. ✅ Al menos un status check requerido
4. ✅ Commits firmados obligatorios
5. ✅ Force push y borrado de `main` bloqueados
6. ✅ Workflow `tamano-de-archivos.yml` exigido como check
7. ✅ Un environment con revisor obligatorio y política de ramas
8. ✅ La gobernanza documentada en `CONTRIBUTING.md`

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 08 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 07: Code review y convenciones](../week-07-code_review_y_convenciones/README.md) | **Semana 08: Gobernanza, rulesets y merge queue** | [Semana 09: Actions fundamentos →](../week-09-actions_fundamentos/README.md) |

← [Volver al inicio del bootcamp](../../README.md)
