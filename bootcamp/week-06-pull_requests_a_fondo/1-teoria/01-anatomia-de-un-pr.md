# Anatomía de un pull request

> Un PR no es "subir código": es una propuesta con contexto, una conversación y
> una decisión. Las tres cosas quedan escritas para siempre.

## 🎯 Objetivos

- Describir el ciclo de vida de un PR y sus estados
- Distinguir checks de reviews y saber qué bloquea de verdad
- Leer el estado de mergeabilidad sin abrir el navegador
- Entender qué cambia cuando el PR viene de un fork
- Situar el PR en la cadena que da memoria al proyecto

## 1. Qué problema resuelve

Sin PR, un cambio llega a `main` sin que nadie lo mire, sin CI y sin rastro de
por qué se hizo. Con PR, el cambio trae contexto (descripción), verificación
(checks) y una decisión registrada (review).

Y el efecto de largo plazo: dentro de dos años, `git blame` te lleva a un commit,
el commit a un PR, y el PR a la conversación donde se decidió
([Semana 02, Teoría 07](../../week-02-repositorio_como_producto/1-teoria/07-blame-e-historia.md)).
Esa cadena es la memoria del proyecto, y el PR es su eslabón central.

## 2. Las cuatro partes

| Parte | Para qué |
|-------|----------|
| **Rama base ← rama de trabajo** | Qué se integra y dónde |
| **Descripción** | Qué cambia, por qué, cómo se prueba ([Teoría 02](02-abrir-buenos-prs.md)) |
| **Checks** | Verificación automática (CI, seguridad, cobertura) |
| **Reviews** | El juicio humano y la decisión |

Y una quinta que se usa poco: el panel **Development** de la barra lateral, que
enlaza el issue que cierra. Es lo que leen los Projects para mover la tarjeta.

## 3. Estados

```
draft ──► open ──► [review] ──► approved ──► merged
   │        │
   └────────┴──► closed (sin mergear)
```

| Estado | Qué significa |
|--------|---------------|
| **Draft** | Trabajo en curso. No se puede mergear y **no notifica a los revisores** |
| **Open** | Listo para revisión |
| **Approved / Changes requested** | Veredicto de un revisor |
| **Merged** | Integrado |
| **Closed** | Descartado sin integrar |

Un PR cerrado sin mergear se puede reabrir mientras la rama exista; si la rama se
borró, hay que abrir otro. Y `merged` es definitivo: no hay "desmergear", solo
revertir ([Teoría 05](05-estrategias-de-merge.md)).

```bash
gh pr view 42 --json state,isDraft,mergedAt,closedAt
```

## 4. Checks: qué son y qué bloquean

Un **check** es un resultado publicado sobre el commit de cabeza del PR: CI,
análisis de seguridad, cobertura, linters.

| Estado | Significado |
|--------|-------------|
| ⏳ Pending | Corriendo |
| ✅ Success | Pasó |
| ❌ Failure | Falló |
| ⚪ Neutral / Skipped | No aplica |

Por sí solos **no bloquean nada**: bloquean cuando un ruleset los marca como
obligatorios (Semana 08). Hasta entonces son informativos, y un PR con el CI en
rojo se puede mergear con un clic.

```bash
gh pr checks 42
gh pr checks 42 --watch
gh pr checks 42 --json name,state,link --jq '.[] | select(.state != "SUCCESS")'
```

> [!NOTE]
> Conviven dos mecanismos: los **check runs** modernos (los que publica Actions,
> con logs y anotaciones) y los antiguos **commit statuses** que usan algunos
> servicios externos. En la interfaz se ven juntos; en la API son endpoints
> distintos, y el nombre que exige un ruleset es el del check, no el del
> workflow.

## 5. Mergeabilidad: leer el semáforo

La pregunta "¿por qué no me deja mergear?" tiene respuesta en dos campos:

```bash
gh pr view 42 --json mergeable,mergeStateStatus
```

| `mergeStateStatus` | Qué pasa |
|--------------------|----------|
| `CLEAN` | Todo en orden |
| `BLOCKED` | Falta una revisión o un check obligatorio |
| `BEHIND` | La rama está desactualizada y el ruleset lo exige al día |
| `DIRTY` | Hay conflictos ([Teoría 07](07-conflictos-y-stacked.md)) |
| `UNSTABLE` | Hay checks fallando, pero no son obligatorios |
| `DRAFT` | Es un borrador |

Con esos dos campos se diagnostica en segundos lo que en la interfaz obliga a
bajar por toda la página.

## 6. PRs desde un fork

Cuando el PR viene de un fork —lo normal en open source— cambian tres cosas:

- **El workflow corre con permisos de solo lectura** y sin acceso a los secretos.
  Es una protección deliberada, y la razón de que exista `pull_request_target`,
  que es peligroso y se estudia en la Semana 09
- **Puedes empujar a la rama del PR** solo si quien lo abrió dejó marcada la
  casilla *Allow edits by maintainers*
- **`gh pr checkout 42` funciona igual**, y es mucho más cómodo que añadir el
  remoto del fork a mano

```bash
gh pr checkout 42          # también con forks
gh pr view 42 --json headRepositoryOwner,maintainerCanModify
```

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Tratar los checks como obligatorios sin ruleset | Se puede mergear en rojo y pasa | Hazlos obligatorios (Semana 08) |
| Mergear con `UNSTABLE` sin mirar | El check que falla puede ser el importante | `gh pr checks` antes |
| Cerrar un PR y borrar la rama para "empezar de cero" | Pierdes la conversación y el historial | Reabre o enlaza el nuevo |
| Draft eterno | Nadie sabe si esperar | Draft mientras trabajas, no como parking |
| Preguntar en el chat por qué no se puede mergear | La API lo dice exactamente | `mergeStateStatus` |
| Añadir el remoto del fork a mano | Fricción y errores | `gh pr checkout` |

## 8. Trucos

- **Estado de todo lo tuyo de un vistazo**: `gh pr status`
- **Solo los checks que fallan**:
  `gh pr checks 42 --json name,state --jq '.[] | select(.state=="FAILURE") | .name'`
- **El diff como texto plano**: añade `.diff` o `.patch` a la URL del PR — sirve
  para `git apply` en otro sitio
- **Diff sin ruido de espacios**: `?w=1` en la URL
- **Qué archivos toca sin abrir nada**: `gh pr diff 42 --name-only`
- **Cambiar la rama base sin cerrar nada**: *Edit* junto al título; el diff se
  recalcula solo
- **Bloquear la conversación** de un PR que se ha desmadrado: `gh pr lock 42`

## 📚 Recursos Adicionales

- [GitHub Docs — About pull requests](https://docs.github.com/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [GitHub Docs — About status checks](https://docs.github.com/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [GraphQL API — `mergeStateStatus`](https://docs.github.com/graphql/reference/enums#mergestatestatus)

## ✅ Checklist de Verificación

- [ ] Sabes qué diferencia un check de una review
- [ ] Sabes diagnosticar por qué un PR no se puede mergear desde la CLI
- [ ] Entiendes por qué un PR de un fork no ve los secretos
- [ ] Sabes cuándo un PR debe ser draft
