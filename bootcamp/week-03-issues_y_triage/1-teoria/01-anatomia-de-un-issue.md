# Anatomía de un issue

> Un issue no es una nota: es la unidad de trabajo de tu proyecto y la memoria de
> por qué las cosas son como son.

## 🎯 Objetivos

- Describir el ciclo de vida de un issue y quién lo mueve
- Escribir issues que se puedan cerrar sin preguntar nada
- Vincular issues con PRs, commits y otros issues
- Usar las operaciones que casi nadie conoce: transferir, fijar, bloquear, convertir
- Entender qué se automatiza a partir de un issue bien escrito

## 1. Qué problema resuelve

Cuando un proyecto tiene tres issues, el orden da igual. Cuando tiene doscientos,
la diferencia entre "backlog" y "vertedero" es si cada issue responde tres
preguntas: **qué pasa**, **cómo se reproduce** y **cuándo está resuelto**.

Y hay un efecto secundario que casi nadie ve venir: dentro de dos años, cuando
alguien pregunte "¿por qué esto funciona así?", la respuesta estará en un issue,
no en el código. Es la otra mitad de la cadena que empieza en `blame`
([Semana 02, Teoría 07](../../week-02-repositorio_como_producto/1-teoria/07-blame-e-historia.md)).

## 2. Ciclo de vida

```
                triage              asignación           PR
  abierto  ──────────────►  clasificado  ────────►  en curso  ────►  cerrado
     │                           │                      │
     └── duplicado / inválido ───┴──────────────────────┴──► cerrado (not planned)
```

GitHub distingue **cómo** se cierra, y no es un detalle cosmético:

| Estado | Qué comunica |
|--------|--------------|
| **Closed as completed** | Se hizo. Es el cierre normal, el que hace un PR con `Fixes #12` |
| **Closed as not planned** | No se va a hacer: fuera de alcance, no reproducible, obsoleto |
| **Closed as duplicate** | Ya existe. GitHub deja el enlace al original en el propio estado |

Cerrar todo como *completed* falsea las métricas: parecerá que resolviste
cuarenta cosas cuando descartaste veinte.

```bash
gh issue close 42 --reason "not planned" --comment "Fuera del alcance de v1"
gh issue reopen 42
```

## 3. Las partes de un issue

| Parte | Para qué | Quién la pone |
|-------|----------|---------------|
| **Título** | Se lee en una lista de 200. Es el 90 % del valor | Autor |
| **Cuerpo** | Contexto, reproducción, criterios de aceptación | Autor (guiado por la plantilla) |
| **Labels** | Clasificación por tipo, área, prioridad, estado | Triage |
| **Assignee** | Quién lo hace. Vacío = nadie lo está haciendo | Triage |
| **Milestone** | En qué entrega cabe | Triage |
| **Type** | `Bug`, `Feature`, `Task` — definido por la organización | Triage |
| **Project** | Dónde se visualiza y prioriza | Automático |
| **Sub-issues** | Descomposición jerárquica | Autor o triage |
| **Development** | Ramas y PRs vinculados | Quien lo implementa |

### El título

- ✅ `El préstamo vencido no genera multa cuando la devolución es el mismo día`
- ❌ `Bug en préstamos`
- ❌ `No funciona`

Regla: el título debe permitir decidir si te interesa **sin abrir el issue**.

### Criterios de aceptación

Un issue sin criterios de aceptación no se puede cerrar: siempre habrá discusión
sobre si está hecho.

```markdown
## Criterios de aceptación

- [ ] Devolver el mismo día no genera multa
- [ ] Devolver con 1 día de retraso genera 300
- [ ] Existe un test que cubre ambos casos
```

Es también lo que hace posible el *Definition of Done* de la Semana 07: si los
criterios están escritos, el revisor del PR tiene contra qué comparar.

## 4. Vinculación

Es lo que convierte issues sueltos en una red navegable.

| Sintaxis | Efecto |
|----------|--------|
| `#12` | Enlace y referencia cruzada visible en ambos lados |
| `owner/repo#12` | Igual, entre repositorios |
| `Fixes #12`, `Closes #12`, `Resolves #12` | **Cierra** el issue al mergear el PR |
| `Fixes owner/repo#12` | Cierra un issue de otro repositorio |
| Pegar un SHA | Enlaza al commit |
| Pegar la URL de un issue | Se convierte en referencia con título |

Las **closing keywords** solo cierran cuando van en la **descripción del PR** (o
en el mensaje de un commit que llegue a la rama por defecto), y el PR se mergea
en la rama por defecto. En un comentario posterior no funcionan, y en un PR
contra `develop` tampoco.

Cada palabra tiene tres formas y todas valen: `close/closes/closed`,
`fix/fixes/fixed`, `resolve/resolves/resolved`.

> [!TIP]
> Escribe `#` en cualquier caja de texto de GitHub y aparece un autocompletado
> con los issues del repositorio, buscando por número y por título.

### Vincular sin cerrar

A veces el PR avanza un issue pero no lo termina. Dos formas:

- Mencionar `#12` sin keyword: queda la referencia cruzada, no se cierra
- La sección **Development** de la barra lateral del issue: enlaza rama o PR de
  forma explícita, que es lo que leen los Projects

```bash
gh issue develop 12 --name feature/multa-mismo-dia --checkout
```

Ese comando crea la rama **ya vinculada** al issue y te cambia a ella. Es la
forma más limpia de empezar a trabajar en algo.

## 5. Listas de tareas y sub-issues

Dos formas de descomponer, con propósitos distintos:

| | Lista de tareas | Sub-issues |
|---|---|---|
| Sintaxis | `- [ ] tarea` en el cuerpo | Relación real entre issues |
| Se asigna | No | Sí, cada uno a alguien |
| Tiene estado propio | No | Sí, abierto/cerrado |
| Aparece en Projects | No | Sí, como items |
| Para qué | Pasos de una sola tarea | Descomponer un épico |

Regla práctica: si algo lo va a hacer **otra persona** o en **otro momento**, es
un sub-issue. Si es un paso tuyo dentro del mismo trabajo, es una casilla.

La descomposición a fondo está en la [Teoría 05](05-sub-issues-y-descomposicion.md).

## 6. Operaciones que casi nadie usa

| Operación | Para qué | Cómo |
|-----------|----------|------|
| **Transferir** | El issue es de otro repositorio | Barra lateral → *Transfer issue* · `gh issue transfer 42 OWNER/REPO` |
| **Fijar** | Destacar hasta tres issues en la portada (roadmap, aviso) | *Pin issue* · `gh issue pin 42` |
| **Bloquear** | Una discusión se ha ido de las manos | *Lock conversation*, con motivo · `gh issue lock 42` |
| **Convertir a discusión** | Era una pregunta, no un bug | Barra lateral → *Convert to discussion* |
| **Convertir comentario en issue** | Del hilo sale trabajo nuevo | Menú `···` del comentario |

Detalles que importan: al transferir se conservan comentarios, labels y
asignados, pero **cambia el número**; y un issue bloqueado sigue visible, solo
impide comentar a quien no tenga permisos de escritura.

## 7. Notificaciones y participación

Cada issue tiene una lista de participantes y una suscripción implícita. Te
suscribes al comentar, al ser mencionado, al ser asignado o al pulsar
*Subscribe*.

```bash
gh api notifications --jq '.[] | "\(.reason)\t\(.subject.title)"'
```

El campo `reason` (`mention`, `assign`, `subscribed`, `author`, `team_mention`…)
es lo que te permite decidir qué mirar primero. Filtrar la bandeja por `is:unread
reason:mention` es la diferencia entre leer diez notificaciones y leer doscientas.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Título genérico | La lista de issues se vuelve inútil | Título que describe el síntoma concreto |
| Issue sin criterios de aceptación | No se sabe cuándo cerrarlo | Checklist de aceptación siempre |
| Discutir el diseño en el issue y decidirlo en el chat | La decisión se pierde | La conclusión vuelve al issue |
| Cerrar todo como *completed* | Métricas falseadas | *Not planned* o *duplicate* cuando toque |
| Un issue para "mejorar el proyecto" | No es accionable | Divídelo en cosas que se puedan cerrar |
| Issues asignados a cinco personas | Nadie es responsable | Un assignee; los demás, mencionados |
| Reabrir para una cosa distinta | Mezcla dos historias en un hilo | Issue nuevo enlazando el anterior |
| `Fixes #12` en un comentario | No cierra nada y nadie se entera | En la descripción del PR |

## 9. Trucos

- **Crear un issue desde la terminal**:
  ```bash
  gh issue create --title "..." --body "..." --label "type:bug" --assignee @me
  ```
- **Empezar a trabajar en un issue con la rama vinculada**:
  `gh issue develop 12 --checkout`
- **Convertir una casilla de tarea en issue**: al pasar el ratón sobre ella
  aparece un icono que crea el issue y lo enlaza
- **Ver un issue entero sin navegador**: `gh issue view 12 --comments`
- **Plantilla directa**: `gh issue create --template bug.yml`
- **Editar en bloque desde la lista**: en la interfaz, marca varios issues y
  aparece la barra de acciones (labels, assignee, milestone, cerrar)
- **Ver quién participa**:
  `gh api repos/{owner}/{repo}/issues/12 --jq '[.assignees[].login]'`

## 📚 Recursos Adicionales

- [GitHub Docs — About issues](https://docs.github.com/issues/tracking-your-work-with-issues/about-issues)
- [GitHub Docs — Linking a pull request to an issue](https://docs.github.com/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
- [GitHub Docs — Transferring an issue](https://docs.github.com/issues/tracking-your-work-with-issues/administering-issues/transferring-an-issue-to-another-repository)
- [Manual de `gh issue`](https://cli.github.com/manual/gh_issue)

## ✅ Checklist de Verificación

- [ ] Tus títulos permiten decidir sin abrir el issue
- [ ] Todos tus issues tienen criterios de aceptación
- [ ] Sabes qué cierra un issue automáticamente y qué no
- [ ] Has usado `gh issue develop` para empezar un trabajo
- [ ] Distingues cuándo usar una casilla y cuándo un sub-issue
