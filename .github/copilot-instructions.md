# 🤖 Instrucciones para GitHub Copilot

## 📋 Contexto del Bootcamp

Este es un **Bootcamp GitHub Zero to Master**: 21 semanas sobre **GitHub como
plataforma de ingeniería** (no sobre Git, y no sobre "subir código"). Lleva a un
desarrollador fullstack hasta un perfil **DevOps / Platform Engineering** capaz
de gobernar repositorios, automatizar la plataforma y cerrar la cadena de
suministro.

### 📊 Datos del Bootcamp

- **Duración**: 21 semanas (~5 meses)
- **Dedicación semanal**: 8 horas
- **Total de horas**: 168 horas
- **Modalidad**: autoestudio asincrónico con verificación automática por API
- **Nivel de entrada**: dev fullstack con Git básico (clonar, commit, push, ramas)
- **Nivel de salida**: dueño de plataforma — rulesets, Actions, releases firmados, seguridad
- **Plan asumido**: GitHub **Free** sobre **repositorios públicos**
- **Stack demo**: Node.js 22 + TypeScript + pnpm (para workflows, actions y publicación)

---

## 🎯 Objetivos de Aprendizaje

Al finalizar el bootcamp, los estudiantes serán capaces de:

- ✅ Operar Git con soltura quirúrgica (`rebase -i`, `reflog`, `bisect`, `worktree`)
- ✅ Convertir un repositorio en un producto (docs, plantillas, CODEOWNERS, Pages)
- ✅ Diseñar taxonomías de issues y flujos de triage que escalan
- ✅ Modelar el trabajo en Projects v2 y automatizarlo por GraphQL
- ✅ Dominar el ciclo de Pull Request completo, incluyendo merge queue y stacked PRs
- ✅ Gobernar repos con rulesets, required checks y commits firmados
- ✅ Escribir GitHub Actions de nivel producción y actions propias publicables
- ✅ Desplegar con OIDC sin secretos de larga vida
- ✅ Publicar releases con procedencia verificable en GHCR y npm
- ✅ Cerrar la cadena de suministro (Dependabot, CodeQL, secret scanning, attestations)
- ✅ Automatizar GitHub por REST, GraphQL, `gh` CLI y GitHub Apps
- ✅ Administrar organizaciones, monorepos y repos a escala
- ✅ Contribuir y mantener proyectos open source
- ✅ Trabajar con Codespaces y con la capa de IA de GitHub

---

## 📚 Estructura del Bootcamp

### Distribución por Fases

#### **Fundamentos de plataforma (Semanas 1-3)** — 24 horas

- Git quirúrgico de repaso, claves SSH, commits firmados, `gh` CLI, tokens
- El repositorio como producto: docs, Markdown GFM, CODEOWNERS, búsqueda, Pages
- Issues a fondo: forms YAML, labels, milestones, sub-issues, triage

#### **Colaboración (Semanas 4-8)** — 40 horas

- Projects v2: modelo de datos, vistas, roadmap, automatización, métricas
- Pull Requests: review, sugerencias, estrategias de merge, stacked PRs
- Cultura de code review, Conventional Commits, estrategias de ramificación
- Gobernanza: rulesets, required checks, push rules, environments, merge queue

#### **Automatización (Semanas 9-12)** — 32 horas

- Actions: eventos, contexts, expresiones, matrices, artifacts, caché, debugging
- Reutilización: reusable workflows, composite actions, actions JS/Docker
- Seguridad de workflows, OIDC, environments, self-hosted runners, CD real
- Releases y packages: SemVer, changelogs automáticos, GHCR, npm, provenance

#### **Seguridad (Semanas 13-14)** — 16 horas

- Dependabot (alerts, security updates, version updates, grouping)
- Code scanning con CodeQL, SARIF de terceros
- Secret scanning, push protection, advisories, SBOM, attestations, Scorecard

#### **Programabilidad (Semanas 15-16)** — 16 horas

- REST vs GraphQL, Octokit, `gh api --paginate --jq`, extensiones de `gh`
- Webhooks con verificación HMAC, GitHub Apps vs OAuth vs PAT, bots, ChatOps

#### **Escala y comunidad (Semanas 17-20)** — 32 horas

- Organizaciones: roles, teams, rulesets de org, audit log, políticas, billing
- Monorepos y repos gigantes: path filters, sparse-checkout, LFS, `filter-repo`
- Open source: forks, upstream, contribución real, Discussions, mantenimiento
- Codespaces, devcontainers, Copilot (code review, agentes), GitHub Models

#### **Cierre (Semana 21)** — 8 horas

- Proyecto final: auditoría e integración de las 20 semanas sobre el repo propio

### Contenido Semana a Semana

| Semana | Slug                                      | Tema                                                          |
| ------ | ----------------------------------------- | ------------------------------------------------------------- |
| 01     | `git_repaso_y_setup_pro`                  | Git quirúrgico, SSH, commits firmados, `gh` CLI, tokens        |
| 02     | `repositorio_como_producto`               | README, LICENSE, CODEOWNERS, Markdown GFM, búsqueda, Pages     |
| 03     | `issues_y_triage`                         | Issue forms YAML, labels, milestones, sub-issues, triage       |
| 04     | `projects_v2_fundamentos`                 | Modelo de datos, campos, vistas, roadmap, workflows integrados |
| 05     | `projects_v2_automatizacion_y_metricas`   | GraphQL de Projects, insights, métricas DORA-lite              |
| 06     | `pull_requests_a_fondo`                   | Draft, review, sugerencias, merge strategies, stacked PRs      |
| 07     | `code_review_y_convenciones`              | Cultura de review, Conventional Commits, GitHub flow           |
| 08     | `gobernanza_rulesets_y_merge_queue`       | Rulesets, required checks, push rules, environments            |
| 09     | `actions_fundamentos`                     | Eventos, contexts, matrices, artifacts, caché, debugging       |
| 10     | `actions_reutilizacion_y_actions_propias` | Reusable workflows, composite, actions JS/Docker, Marketplace  |
| 11     | `actions_seguridad_entornos_y_cd`         | `permissions`, pinning SHA, OIDC, environments, runners        |
| 12     | `releases_y_packages`                     | SemVer, release-please, GHCR, npm publish, provenance          |
| 13     | `seguridad_dependabot_y_code_scanning`    | Dependabot version updates, CodeQL, SARIF de terceros          |
| 14     | `seguridad_supply_chain_y_hardening`      | Secret scanning, push protection, advisories, SBOM, attestations|
| 15     | `api_rest_graphql_y_gh_cli`               | Octokit, REST vs GraphQL, `gh api --jq`, extensiones           |
| 16     | `webhooks_apps_y_bots`                    | Webhooks + HMAC, GitHub Apps, bots de triage, ChatOps          |
| 17     | `organizaciones_teams_y_politicas`        | Roles, teams, rulesets de org, audit log, políticas            |
| 18     | `monorepos_y_repos_a_escala`              | Path filters, sparse-checkout, LFS, submódulos, `filter-repo`  |
| 19     | `oss_y_comunidad`                         | Forks, upstream, contribución real, Discussions, mantenimiento |
| 20     | `codespaces_devcontainers_y_copilot`      | devcontainers, prebuilds, Copilot code review, agentes, Models |
| 21     | `proyecto_final_repo_production_grade`    | Integración y auditoría final                                  |

---

## 🗂️ Estructura de Carpetas

Cada semana sigue esta estructura estándar:

```
bootcamp/week-XX-tema_principal/
├── README.md                 # Descripción y objetivos de la semana
├── rubrica-evaluacion.md     # Criterios de evaluación detallados
├── checks.json               # Declaración de verificaciones automáticas
├── 0-assets/                 # Imágenes, diagramas y recursos visuales
├── 1-teoria/                 # Material teórico (archivos .md)
├── 2-practicas/              # Ejercicios guiados paso a paso
├── 3-proyecto/               # Capa semanal del repo hilo conductor
│   └── README.md             # Instrucciones del entregable
├── 4-recursos/               # Recursos adicionales
│   ├── ebooks-free/
│   ├── videografia/
│   └── webgrafia/
└── 5-glosario/               # Términos clave de la semana (A-Z)
    └── README.md
```

### 📁 Carpetas Raíz

- **`assets/`**: recursos visuales globales
- **`docs/`**: documentación transversal (setup, proyecto, trucos, autograding, glosario)
- **`scripts/`**: `verificar-semana.sh` (autograding) y `verificar-enlaces.sh`
- **`bootcamp/`**: contenido semanal

---

## 🎓 Componentes de Cada Semana

### 1. **Teoría** (`1-teoria/`)

- Archivos markdown con explicaciones conceptuales **en español**
- **Extensión objetivo: ~150 líneas por archivo** (máximo duro: 200 — dividir si no cabe)
- Cada feature se explica en este orden: **qué problema resuelve → cómo se
  configura → antipatrones → trucos**
- Ejemplos con `gh` CLI y con la UI web (la UI cambia; el CLI es estable)
- Diagramas SVG cuando aporten (nunca ASCII art)
- Referencias a `docs.github.com` como fuente de verdad

### 2. **Prácticas** (`2-practicas/`)

> ⚠️ **Diferencia clave con los bootcamps hermanos**: aquí las prácticas son
> **operaciones sobre GitHub**, no código en un `starter/`. El entregable es el
> **estado real de un repositorio**, verificable por API.

Formato de ejercicio:

```markdown
### Paso 3: Exigir revisión de CODEOWNERS

**Por qué**: sin esto, cualquiera puede mergear cambios en `infra/` sin que la
persona responsable se entere.

**Con la UI**: Settings → Rules → Rulesets → `main-protection` → Require review
from Code Owners.

**Con `gh`**:

\`\`\`bash
gh api repos/{owner}/{repo}/rulesets --method POST --input ruleset.json
\`\`\`

**Verifica**:

\`\`\`bash
gh api repos/{owner}/{repo}/rulesets --jq '.[].name'
\`\`\`
```

Reglas:

- Todo paso termina con un **comando de verificación** que el estudiante puede correr
- Los pasos destructivos llevan advertencia explícita antes del comando
- Nunca usar `{owner}/{repo}` literal sin explicar que `gh` lo resuelve solo
  dentro de un repo clonado

En las semanas de **Actions (09-12)** y **API (15-16)** sí hay código
(YAML/TypeScript) en `starter/`. Ahí sí aplica el formato de **descomentar
código** de los bootcamps hermanos:

```yaml
# ============================================
# PASO 2: matriz de versiones de Node
# ============================================
# Descomenta las siguientes líneas:
# strategy:
#   fail-fast: false
#   matrix:
#     node: [20, 22, 24]
```

❌ No usar `# TODO:` en prácticas — eso es formato de proyecto.

### 3. **Proyecto** (`3-proyecto/`)

Cada semana añade **una capa nueva al mismo repositorio del estudiante** (ver
`docs/proyecto-hilo-conductor.md`). Nunca un repo desechable por semana.

El README del proyecto incluye:

1. Qué capa se añade esta semana y por qué
2. Requisitos verificables (los mismos que declara `checks.json`)
3. Cómo verificarlo: `./scripts/verificar-semana.sh NN --repo <usuario>/<repo>`
4. Criterios de calidad más allá de lo automatizable

**No hay dominios únicos asignados**: es autoestudio, el estudiante elige su
dominio en la Semana 01 y lo mantiene las 21 semanas. Los ejemplos deben ser
genéricos y adaptables a cualquier dominio.

### 4. **Recursos** (`4-recursos/`)

- **ebooks-free/**: libros y guías gratuitas (Pro Git, guías de OpenSSF, etc.)
- **videografia/**: charlas y tutoriales
- **webgrafia/**: `docs.github.com` primero, luego blogs de calidad

Cada recurso lleva una línea de por qué vale la pena, no solo el enlace.

### 5. **Glosario** (`5-glosario/`)

Términos A-Z en español, con el término en inglés entre paréntesis cuando es el
nombre real de la feature (`ruleset`, `merge queue`, `attestation`).

### 6. **`checks.json`**

Declaración de las verificaciones automáticas de la semana. Formato en
`docs/autograding.md`. Regla: **si un entregable se puede verificar por API, se
declara aquí**. Nunca lógica bash específica de una semana.

---

## 🎩 Sección de Trucos

**Obligatoria en el README de cada semana**: `## 🎩 Trucos y atajos`.

Criterio de admisión de un truco:

- ✅ Ahorra tiempo real o revela algo que la UI esconde
- ✅ Es verificable y estable (no depende de una posición del menú)
- ❌ No es un "tip" genérico de productividad
- ❌ No depende de extensiones de terceros no mantenidas

Todo truco nuevo se replica en `docs/trucos-github.md`, agrupado por semana.

---

## 📝 Convenciones

### Comandos

- ✅ `gh` CLI como forma canónica; la UI se documenta como alternativa
- ✅ Comandos completos y ejecutables (nada de `gh api <endpoint>` sin endpoint)
- ✅ Mostrar la salida esperada cuando ayude a verificar
- ✅ Usar `--jq` para extraer solo lo relevante de respuestas grandes
- ❌ Nunca `curl` con un token en la línea de comandos (queda en el historial)

```bash
# ✅ BIEN
gh api repos/ergrato-dev/bc-github/rulesets --jq '.[] | {name, enforcement}'

# ❌ MAL — token expuesto en el historial del shell
curl -H "Authorization: token ghp_xxx" https://api.github.com/user
```

### YAML de workflows

```yaml
# ✅ BIEN — permisos mínimos, action pinneada por SHA, versión de Node explícita
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

# ❌ MAL — permisos por defecto (escritura), tag flotante sin comentario de versión
jobs:
  test:
    steps:
      - uses: actions/checkout@main
```

### Nomenclatura

- **Carpetas de semana**: `week-XX-tema_en_snake_case`
- **Archivos de teoría**: `NN-tema-en-kebab-case.md`
- **Ramas de ejemplo**: inglés, kebab-case (`feature/user-authentication`)
- **Workflows**: `.github/workflows/nombre-en-kebab-case.yml`
- **Idioma**: inglés para código, identificadores, ramas y commits; español para
  documentación y comentarios educativos

### Placeholders

- `<tu-usuario>` para el usuario de GitHub del estudiante
- `<tu-repo>` para su repositorio del bootcamp
- `OWNER/REPO` solo en ejemplos genéricos de la API
- ❌ Nunca usar un usuario o repo real de terceros como placeholder

---

## 🔐 Reglas de Seguridad del Contenido

Este bootcamp enseña seguridad; el material tiene que predicar con el ejemplo:

- ❌ **Nunca** un token, secreto o clave con aspecto de real, ni siquiera falso
  con formato válido (`ghp_` + 36 caracteres dispara secret scanning)
- ✅ Usar `<TOKEN>` o `${{ secrets.MI_SECRETO }}`
- ✅ Toda action de terceros en un ejemplo de producción va pinneada por SHA con
  el tag en comentario
- ✅ Todo workflow de ejemplo declara `permissions` explícitas
- ✅ `pull_request_target` solo aparece acompañado de su advertencia de riesgo
- ✅ Los pasos destructivos (`git filter-repo`, borrar rulesets, forzar push)
  llevan advertencia y mención del backup previo
- ✅ Al enseñar rotación de secretos: **rotar primero, limpiar historia después**

---

## 🎨 Recursos Visuales

- ✅ **SVG** para todos los diagramas (nunca ASCII art)
- ✅ PNG/JPG solo para capturas de la UI de GitHub
- 🌙 **Tema dark**, **sin degradados**, colores sólidos
- ✅ Paleta GitHub: fondo `#0d1117`, superficie `#161b22`, borde `#30363d`,
  texto `#f0f6fc` / `#8b949e`, acento `#58a6ff`, éxito `#3fb950`, alerta `#d29922`,
  error `#f85149`
- ✅ Tipografía sans-serif exclusivamente (Inter, Roboto, System UI)
- ✅ Nombrar en orden de lectura: `01-ruleset-flow.svg`, `02-merge-queue.svg`
- ✅ Todo SVG debe estar enlazado desde al menos un `.md`
- ⚠️ Las capturas de UI envejecen rápido: usarlas solo cuando el flujo no se
  puede describir con `gh`, y fecharlas en el pie

---

## 📖 Documentación

### README.md de Semana

Debe incluir, en este orden:

1. Título `# Semana NN — Tema`
2. `## 🎯 Objetivos de la Semana`
3. `## 📋 Prerrequisitos`
4. `## 🗂️ Estructura de la Semana` (árbol de archivos)
5. `## 📝 Contenidos` (tablas de teoría y prácticas con duración)
6. `## ⏱️ Distribución del Tiempo (8 horas)`
7. `## 🎩 Trucos y atajos`
8. `## 📌 Entregables`
9. `## ✅ Verificación`  (comando de `verificar-semana.sh`)
10. `## 🔗 Navegación` (anterior / actual / siguiente)

### Archivos de Teoría

```markdown
# Título del Tema

## 🎯 Objetivos

## 📋 Contenido

### 1. Qué problema resuelve

### 2. Cómo se configura

### 3. Antipatrones

### 4. Trucos

## 📚 Recursos Adicionales

## ✅ Checklist de Verificación
```

---

## 📊 Evaluación

Cada semana incluye **tres tipos de evidencias**:

1. **Conocimiento 🧠** (30%): cuestionario de autoevaluación con respuestas al final
2. **Desempeño 💪** (40%): prácticas verificadas por `verificar-semana.sh`
3. **Producto 📦** (30%): la capa semanal del repositorio propio

Mínimo **70%** en cada tipo. Al ser autoestudio, el cuestionario incluye sus
respuestas en una sección colapsable (`<details>`) al final de la rúbrica.

---

## 🤖 Instrucciones para Copilot

### Límites de Respuesta

1. **Divide respuestas largas**
   - ❌ Nunca generar respuestas que superen los límites de tokens
   - ✅ Dividir por carpetas: teoría → prácticas → proyecto → recursos
   - ✅ Indicar siempre qué parte se entregó y qué falta

2. **Una semana por tanda**, usando la Semana 01 como plantilla de calidad

### Generación de Contenido

1. **Profundidad sobre cobertura**: es preferible explicar bien tres flags que
   listar veinte. El bootcamp existe porque los tutoriales superficiales sobran.
2. **Siempre el porqué**: ninguna instrucción de configuración sin el problema
   que resuelve y qué pasa si no se hace.
3. **Verificable**: todo entregable debe poder comprobarse con `gh api`. Si no
   se puede, replantear el entregable.
4. **Fechar lo volátil**: features en beta o preview se marcan con la fecha de
   verificación y un enlace a la documentación oficial.
5. **No inventar endpoints, flags ni nombres de features.** Si hay duda, decirlo
   y enlazar la documentación en lugar de improvisar una API plausible.

### Estado de la plataforma

- Rulesets son el mecanismo actual; branch protection clásica se menciona como
  legado y para leer repos antiguos
- Los fine-grained tokens son el default recomendado; los PAT clásicos solo
  cuando algo no está soportado todavía
- Projects (classic) está retirado: solo Projects v2

---

## 📚 Referencias Oficiales

- **GitHub Docs**: https://docs.github.com/
- **GitHub CLI**: https://cli.github.com/manual/
- **REST API**: https://docs.github.com/rest
- **GraphQL API**: https://docs.github.com/graphql
- **Actions**: https://docs.github.com/actions
- **Rulesets**: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets
- **CodeQL**: https://codeql.github.com/docs/
- **Dependabot**: https://docs.github.com/code-security/dependabot
- **Octokit**: https://github.com/octokit/octokit.js
- **Pro Git (libro)**: https://git-scm.com/book/es/v2
- **OpenSSF Scorecard**: https://github.com/ossf/scorecard

---

## 🔗 Enlaces Importantes

- **Repositorio**: https://github.com/ergrato-dev/bc-github
- **Documentación general**: [docs/README.md](../docs/README.md)
- **Primera semana**: [bootcamp/week-01-git_repaso_y_setup_pro/README.md](../bootcamp/week-01-git_repaso_y_setup_pro/README.md)

---

## ✅ Checklist para Nuevas Semanas

- [ ] Estructura de carpetas completa
- [ ] `README.md` con las 10 secciones obligatorias (incluida `🎩 Trucos y atajos`)
- [ ] Teoría en `1-teoria/`, archivos bajo 200 líneas
- [ ] Prácticas con comando de verificación en cada paso
- [ ] Proyecto que añade una capa al repo hilo conductor
- [ ] `checks.json` con las verificaciones automáticas
- [ ] Recursos en las tres subcarpetas
- [ ] Glosario A-Z
- [ ] `rubrica-evaluacion.md` con cuestionario + respuestas en `<details>`
- [ ] Trucos replicados en `docs/trucos-github.md`
- [ ] Navegación anterior/siguiente correcta
- [ ] `./scripts/verificar-enlaces.sh` sin errores
- [ ] Comandos `gh` ejecutados de verdad, no deducidos

---

## 💡 Notas Finales

- **Prioridad**: profundidad sobre cobertura
- **Enfoque**: operar la plataforma, no leer sobre ella
- **Objetivo**: formar dueños de plataforma, no usuarios de plataforma
- **Filosofía**: si no se puede verificar por API, no es un entregable

---

_Última actualización: Agosto 2026_
_Versión: 1.0_
