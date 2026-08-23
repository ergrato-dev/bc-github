# Semana 13 — Seguridad: Dependabot y code scanning

> Tu repositorio ya publica versiones firmadas. Esta semana aprende a mirarse a
> sí mismo: qué dependencias arrastra, cuáles resultaron ser vulnerables después
> de instalarlas, y qué caminos peligrosos hay en el código que tú escribiste.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Explicar cómo construye GitHub el grafo de dependencias y por qué el lockfile decide qué ve
- Leer una alerta de Dependabot campo a campo y ordenar el trabajo por lo que de verdad urge
- Distinguir severidad de probabilidad, y `runtime` de `development`, al priorizar
- Descartar una alerta con un motivo que siga significando algo dentro de un año
- Activar las actualizaciones de seguridad y saber exactamente qué **no** pueden arreglar
- Escribir un `dependabot.yml` que mantenga el proyecto al día sin generar ruido
- Automatizar la fusión de los parches sin abrirle la puerta a lo que exige criterio
- Detectar en tu propio código el camino de un dato contaminado hasta una llamada peligrosa
- Elegir entre el análisis por defecto y el avanzado con un motivo, no por costumbre
- Meter cualquier herramienta de terceros en la misma bandeja de alertas vía SARIF

## 📋 Prerrequisitos

- Semana 12 completada: releases, imagen en GHCR y `Dockerfile` en el repositorio
- Semana 11: pinning por SHA, permisos mínimos por job y el bloque `github-actions` de Dependabot
- Semana 08: un ruleset activo en `main` con al menos un check obligatorio — el auto-merge depende de él
- Tu repositorio del bootcamp, **público**, con `package.json` y `pnpm-lock.yaml` commiteados
- `gh` autenticado con permisos de administración sobre tu repositorio
  (`./scripts/verificar-semana.sh --doctor`)

> [!NOTE]
> Todo lo de esta semana es **gratuito en repositorios públicos**. Buena parte de
> la documentación oficial está escrita desde GitHub Advanced Security, que es de
> pago en repositorios privados: si una página insiste en licencias, comprueba a
> qué tipo de repositorio se refiere.

## 🗂️ Estructura de la Semana

```
week-13-seguridad_dependabot_y_code_scanning/
├── 0-assets/     01-de-la-dependencia-a-la-alerta · 02-dos-momentos-de-defensa
│                 03-bandeja-unificada-sarif
├── 1-teoria/     01-el-grafo-de-dependencias · 02-alertas-de-dependabot
│                 03-actualizaciones-de-seguridad · 04-version-updates-y-dependabot-yml
│                 05-convivir-con-los-pr-de-dependabot · 06-code-scanning-y-codeql
│                 07-sarif-y-herramientas-de-terceros
├── 2-practicas/  01-dependabot-en-marcha · 02-triaje-y-automerge
│                 03-codeql-en-verde · 04-sarif-de-terceros
├── 3-proyecto/   alertas en cero, CodeQL en verde y dos herramientas en la misma bandeja
├── 4-recursos/ · 5-glosario/ · checks.json · rubrica-evaluacion.md
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [`01-el-grafo-de-dependencias.md`](1-teoria/01-el-grafo-de-dependencias.md) | Manifiesto y lockfile, GHSA frente a CVE, CVSS frente a EPSS, revisión en el PR | 25 min |
| [`02-alertas-de-dependabot.md`](1-teoria/02-alertas-de-dependabot.md) | Anatomía de una alerta, priorización, descartes con motivo, auto-triage | 20 min |
| [`03-actualizaciones-de-seguridad.md`](1-teoria/03-actualizaciones-de-seguridad.md) | La versión mínima que parchea, límites reales, agrupación, la pausa | 20 min |
| [`04-version-updates-y-dependabot-yml.md`](1-teoria/04-version-updates-y-dependabot-yml.md) | El archivo entero: `schedule`, `groups`, `ignore`, `allow`, `cooldown` | 30 min |
| [`05-convivir-con-los-pr-de-dependabot.md`](1-teoria/05-convivir-con-los-pr-de-dependabot.md) | Comandos, token de solo lectura, secretos aparte, auto-merge seguro | 25 min |
| [`06-code-scanning-y-codeql.md`](1-teoria/06-code-scanning-y-codeql.md) | Taint tracking, análisis por defecto y avanzado, suites, Copilot Autofix | 30 min |
| [`07-sarif-y-herramientas-de-terceros.md`](1-teoria/07-sarif-y-herramientas-de-terceros.md) | El formato, la `category`, los límites, qué merece estar en la bandeja | 25 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [`01-dependabot-en-marcha.md`](2-practicas/01-dependabot-en-marcha.md) | Instalas una vulnerabilidad a propósito y ves llegar la alerta y su arreglo | 50 min |
| [`02-triaje-y-automerge.md`](2-practicas/02-triaje-y-automerge.md) | Descartas, reabres, cierras el círculo y automatizas solo los parches | 40 min |
| [`03-codeql-en-verde.md`](2-practicas/03-codeql-en-verde.md) | Escribes código vulnerable, ves el camino del dato, lo arreglas y migras al análisis avanzado | 55 min |
| [`04-sarif-de-terceros.md`](2-practicas/04-sarif-de-terceros.md) | Bloqueas la dependencia mala en el PR y metes otra herramienta en la bandeja | 45 min |

### Proyecto

[`3-proyecto/`](3-proyecto/README.md) — tu repositorio con cero alertas
accionables, CodeQL analizando también sus propios workflows, y todas las
decisiones de seguridad registradas con un motivo.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (7 archivos) | 2 h 55 min |
| Prácticas (4) | 3 h 10 min |
| Proyecto | 1 h 30 min |
| Revisión y verificación | 25 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Ver el inventario real sin abrir la interfaz | `gh api repos/{owner}/{repo}/dependency-graph/sbom --jq '.sbom.packages[].name'` |
| Saber quién instaló esa transitiva | `pnpm why <paquete>` |
| Qué dependencias añade un PR | `gh api repos/{owner}/{repo}/dependency-graph/compare/main...mi-rama` |
| Comprobar si las alertas están activas | `gh api repos/{owner}/{repo}/vulnerability-alerts --include --silent` — `204` sí, `404` no |
| Lo único que hay que mirar hoy | `?state=open&scope=runtime&has=patch` en la consulta de alertas |
| Filtrar por lo que el mundo explota | `?epss_percentage=>0.01` |
| Resumen por severidad en una línea | `--jq 'group_by(.security_advisory.severity) \| map({sev: .[0].security_advisory.severity, n: length})'` |
| Ver qué tapa tu regla de auto-triage | `?state=auto_dismissed` |
| Saber por qué dejaron de llegar PR | `gh api repos/{owner}/{repo}/automated-security-fixes --jq '.paused'` |
| Listar solo los PR del bot | `gh pr list --app dependabot` — hay flag para apps; `--author` no sirve |
| Arreglar un PR raro de Dependabot | `@dependabot recreate` en un comentario |
| Ver las condiciones de ignorado guardadas | `@dependabot show <paquete> ignore conditions` |
| Pausar un ecosistema sin borrar su bloque | `open-pull-requests-limit: 0` |
| Dónde falla un `dependabot.yml` inválido | Insights → Dependency graph → Dependabot, con **Check for updates** |
| Secreto que Dependabot pueda leer | `gh secret set NOMBRE --app dependabot` — los de Actions no los ve |
| Lenguaje `actions` de CodeQL | Analiza tus propios workflows, no solo tu código |
| Ver si tienes cien alertas o una regla cien veces | `--jq 'group_by(.rule.id) \| map({regla: .[0].rule.id, n: length}) \| sort_by(-.n)'` |
| Qué herramientas están publicando de verdad | `--jq 'group_by(.tool.name) \| map({t: .[0].tool.name, n: length})'` sobre `code-scanning/analyses` |
| Que el SARIF se suba aunque la herramienta falle | `continue-on-error: true` en el paso que analiza, no en el que sube |
| Que un SARIF inválido ponga el job en rojo | `wait-for-processing` de `upload-sarif`, activado por defecto |
| Subir SARIF sin Actions | `gzip -c x.sarif \| base64 -w0` y `POST code-scanning/sarifs` |

## 📌 Entregables

1. ✅ Alertas de Dependabot activas y sin ninguna `high` ni `critical` abierta
2. ✅ Actualizaciones de seguridad activas y **no en pausa**
3. ✅ `.github/dependabot.yml` con `npm` y `github-actions`, `groups` y `cooldown`
4. ✅ Al menos un pull request de Dependabot en el historial del repositorio
5. ✅ `dependabot-automerge.yml` limitado a `semver-patch` y condicionado por el autor
6. ✅ `dependency-review.yml` revisando cada pull request
7. ✅ `codeql.yml` analizando tu código **y** el lenguaje `actions`
8. ✅ Ninguna alerta de code scanning `high` ni `critical` abierta
9. ✅ `analisis-estatico.yml` subiendo SARIF de terceros con su propia `category`
10. ✅ `README.md` con una sección que explica qué cubre cada control

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 13 --repo <tu-usuario>/<tu-repo>
```

> [!NOTE]
> Seis comprobaciones leen alertas y análisis de seguridad. Son endpoints que
> **solo funcionan sobre repositorios propios**: el scope `repo` que concede
> `gh auth login` los cubre, pero en un repositorio ajeno devuelven `403` por
> diseño.

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 12: Releases y packages](../week-12-releases_y_packages/README.md) | **Semana 13: Dependabot y code scanning** | [Semana 14: Supply chain y hardening →](../week-14-seguridad_supply_chain_y_hardening/README.md) |

← [Volver al inicio del bootcamp](../../README.md)
