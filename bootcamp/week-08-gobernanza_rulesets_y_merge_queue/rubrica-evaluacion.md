# Rúbrica de Evaluación — Semana 08: Gobernanza, rulesets y merge queue

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | `main` protegida y el environment configurado |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

| # | Pregunta |
|---|----------|
| 1 | ¿Qué aportan los rulesets frente a branch protection clásica? |
| 2 | ¿Qué hace cada valor de `enforcement` y cuál puedes usar con tu plan? |
| 3 | ¿Qué pasa si exiges un status check que no se dispara en un PR concreto? |
| 4 | ¿Qué es un *bypass actor* y por qué concederte uno a ti mismo invalida el ruleset? |
| 5 | ¿Cómo se comportan dos rulesets que aplican a la misma rama? |
| 6 | ¿Qué problema resuelve merge queue que no resuelve "rama al día"? |
| 7 | ¿Cuándo merge queue es sobreingeniería? |
| 8 | ¿Qué diferencia hay entre un secreto de repositorio y uno de environment? |
| 9 | ¿Para qué sirve un *wait timer* en un environment? |
| 10 | Las push rules no están en tu plan: ¿qué las sustituye y qué caso deja fuera? |

<details>
<summary>📝 Respuestas</summary>

1. **Patrones en vez de ramas sueltas** (`~DEFAULT_BRANCH`, `release/*`), estados
   de borrador y prueba, targets de rama, tag y push, historial de versiones
   consultable por API, y varias capas que se suman. Branch protection es una
   regla por rama, sin borrador ni historial. No está retirada: convive y **se
   suma** a los rulesets.

2. `disabled` guarda el ruleset sin efecto (es un borrador). `evaluate` no
   bloquea pero registra lo que habría bloqueado. `active` bloquea. Con GitHub
   Free solo tienes `disabled` y `active`: `evaluate` requiere GitHub
   Enterprise, y el sustituto es crear en `disabled`, revisar el JSON y pasar a
   `active`.

3. El PR se queda en *Expected — Waiting for status to be reported*
   **indefinidamente**: no se puede mergear y no hay nada que ponga el check en
   verde. Pasa con `paths:` filtrados, con un `if:` de job que no se cumple, o
   cuando el `context` no coincide con el `name:` real del job. La solución es
   que el job corra siempre y decida dentro si hay algo que comprobar.

4. Un usuario, equipo, rol o GitHub App autorizado a saltarse el ruleset, con
   `bypass_mode` `always`, `pull_request` o `exempt`. Concedértelo a ti mismo
   convierte la regla en una sugerencia: el día que tengas prisa te la saltarás,
   y ese es justo el día en que existía para pararte. Si necesitas saltártela una
   vez, pon el ruleset en `disabled` y vuelve a `active`: queda en el historial.

5. **Se suman.** La rama queda sujeta a la unión de todas las reglas y gana la
   más restrictiva. No hay prioridad ni "gana el último" como en `CODEOWNERS`.
   Por eso conviene separar los rulesets por intención, no por rama.

6. El **conflicto semántico**: dos PRs que pasan CI por separado y rompen la rama
   al juntarse, sin conflicto de texto. "Rama al día"
   (`strict_required_status_checks_policy`) obliga a reconstruir cada PR después
   de cada merge, lo que produce *merge starvation* con muchos PRs simultáneos.
   La cola construye candidatos acumulativos en paralelo y prueba las
   combinaciones antes de mergear.

7. Con menos de ~10 PRs al día, con CI de menos de 5 minutos, o trabajando solo o
   en pareja. Cada candidato es una ejecución de CI: la cola cambia tiempo de
   personas por minutos de runner. Si nadie ha pulsado *Update branch* dos veces
   seguidas esta semana, no hace falta.

8. Un secreto de repositorio lo puede usar **cualquier** job de cualquier
   workflow desde cualquier rama. Uno de environment solo existe para los jobs
   que declaran `environment: <nombre>`, y por tanto pasa antes por los revisores
   y el wait timer. Las credenciales de producción van siempre en el environment.

9. Es la ventana para cancelar un despliegue lanzado por error, sobre todo cuando
   el disparador es automático (un tag, un release). Va de 0 a 43 200 minutos. En
   la práctica, entre 0 y 5: más y la gente aprende a lanzarlo con antelación
   "para que ya esté", que es lo contrario de lo que se busca.

10. Un **status check requerido**: un workflow que falla si un archivo del PR
    supera el límite, declarado en `required_status_checks`. Deja fuera el push
    **directo** a una rama no protegida y los pushes de la red de forks: un check
    mira PRs, una push rule mira todos los pushes. Cubre el caso real (que un
    `.zip` de 80 MB no entre por un PR), no el caso completo.

</details>

---

## 💪 Desempeño (40%)

| Práctica | Criterio | Puntos |
|----------|----------|:------:|
| 01 — Primer ruleset | Ruleset versionado en `.github/rulesets/main-proteccion.json` | 5 |
| 01 — Primer ruleset | Creado en `disabled`, revisado y luego activado | 5 |
| 02 — Checks y firmas | `context` leído con `gh pr checks`, no deducido | 5 |
| 02 — Checks y firmas | Firmas comprobadas (`%G?` → `G`) **antes** de exigirlas | 5 |
| 03 — Historia | Force push y borrado vistos rechazados con `GH013` | 5 |
| 03 — Historia | Workflow de tamaño con `permissions` y action pinneada por SHA | 5 |
| 04 — Environments | Environment con revisor y política de ramas | 5 |
| 04 — Environments | Despliegue visto en `Waiting` y aprobado | 5 |

---

## 📦 Producto (30%)

Verificable por API — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| Ruleset `active` y versionado en `.github/rulesets/` | 10 |
| PR obligatorio con revisión de code owners | 10 |
| Al menos un status check requerido | 10 |
| Commits firmados obligatorios | 10 |
| Force push y borrado de `main` bloqueados | 5 |
| `tamano-de-archivos.yml` en el repositorio | 5 |
| Environment con revisor y política de ramas | 5 |
| `CONTRIBUTING.md` documenta la gobernanza | 5 |

Calidad — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| Las reglas corresponden a los acuerdos de la Semana 07, no a una lista copiada | 15 |
| `bypass_actors` vacío, o cada entrada justificada por escrito | 10 |
| `CONTRIBUTING.md` explica **qué** se exige y **por qué** | 10 |
| Sabes decir, con datos de tu repo, por qué no has activado merge queue | 5 |

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Bypass genérico para tu propio usuario "por comodidad" | -20 |
| Ruleset configurado solo por la UI, sin versionar | -15 |
| Ruleset activado sin revisar, dejando el repositorio bloqueado | -10 |
| Exigir checks que nunca se ejecutan | -10 |
| Un secreto real (aunque sea de prueba) visible en un log o en el historial del shell | -20 |
| Workflow de ejemplo sin `permissions` o con action sin pinnear | -10 |
