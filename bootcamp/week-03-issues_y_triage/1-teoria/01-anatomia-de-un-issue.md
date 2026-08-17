# Anatomía de un issue

> Un issue no es una nota: es la unidad de trabajo de tu proyecto y la memoria de
> por qué las cosas son como son.

## 🎯 Objetivos

- Describir el ciclo de vida de un issue y quién lo mueve
- Escribir issues que se puedan cerrar sin preguntar nada
- Vincular issues con PRs, commits y otros issues
- Entender qué se automatiza a partir de un issue bien escrito

## 1. Qué problema resuelve

Cuando un proyecto tiene tres issues, el orden da igual. Cuando tiene doscientos,
la diferencia entre "backlog" y "vertedero" es si cada issue responde tres
preguntas: **qué pasa**, **cómo se reproduce** y **cuándo está resuelto**.

Y hay un efecto secundario que casi nadie ve venir: dentro de dos años, cuando
alguien pregunte "¿por qué esto funciona así?", la respuesta estará en un issue,
no en el código.

## 2. Ciclo de vida

```
                triage              asignación           PR
  abierto  ──────────────►  clasificado  ────────►  en curso  ────►  cerrado
     │                           │                      │
     └── duplicado / inválido ───┴──────────────────────┴──► cerrado (not planned)
```

GitHub distingue dos formas de cerrar:

| Estado | Qué comunica |
|--------|--------------|
| **Closed as completed** | Se hizo. Es el cierre normal, el que hace un PR con `Fixes #12` |
| **Closed as not planned** | No se va a hacer: duplicado, fuera de alcance, no reproducible |

Cerrar todo como *completed* falsea las métricas: parecerá que resolviste
cuarenta cosas cuando descartaste veinte.

## 3. Las partes de un issue

| Parte | Para qué | Quién la pone |
|-------|----------|---------------|
| **Título** | Se lee en una lista de 200. Es el 90% del valor | Autor |
| **Cuerpo** | Contexto, reproducción, criterios de aceptación | Autor (guiado por la plantilla) |
| **Labels** | Clasificación por tipo, área, prioridad, estado | Triage |
| **Assignee** | Quién lo hace. Vacío = nadie lo está haciendo | Triage |
| **Milestone** | En qué entrega cabe | Triage |
| **Type** | Bug, feature, task — a nivel de organización | Triage |
| **Project** | Dónde se visualiza y prioriza | Automático |
| **Sub-issues** | Descomposición jerárquica | Autor o triage |

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

## 4. Vinculación

Es lo que convierte issues sueltos en una red navegable.

| Sintaxis | Efecto |
|----------|--------|
| `#12` | Enlace y referencia cruzada visible en ambos lados |
| `owner/repo#12` | Igual, entre repositorios |
| `Fixes #12`, `Closes #12`, `Resolves #12` | **Cierra** el issue al mergear el PR |
| Pegar un SHA | Enlaza al commit |
| Pegar la URL de un issue | Se convierte en referencia con título |

Las **closing keywords** solo cierran si van en la **descripción del PR** (o en
el mensaje de un commit que llegue a la rama por defecto). En un comentario
posterior no funcionan.

> [!TIP]
> Escribe `#` en cualquier caja de texto de GitHub y aparece un autocompletado
> con los issues del repositorio, buscando por número y por título.

## 5. Tasklists y sub-issues

Dos formas de descomponer, con propósitos distintos:

| | Tasklist | Sub-issues |
|---|---|---|
| Sintaxis | `- [ ] tarea` en el cuerpo | Relación real entre issues |
| Se asigna | No | Sí, cada uno a alguien |
| Tiene estado propio | No | Sí, abierto/cerrado |
| Aparece en Projects | No | Sí, como items |
| Para qué | Pasos de una sola tarea | Descomponer un épico |

Regla práctica: si algo lo va a hacer **otra persona** o en **otro momento**, es
un sub-issue. Si es un paso tuyo dentro del mismo trabajo, es una tasklist.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Título genérico | La lista de issues se vuelve inútil | Título que describe el síntoma concreto |
| Issue sin criterios de aceptación | No se sabe cuándo cerrarlo | Checklist de aceptación siempre |
| Discutir el diseño en el issue y decidirlo en Slack | La decisión se pierde | La conclusión vuelve al issue |
| Cerrar todo como *completed* | Métricas falseadas | *Not planned* cuando corresponda |
| Un issue para "mejorar el proyecto" | No es accionable | Divídelo en cosas que se puedan cerrar |
| Issues asignados a cinco personas | Nadie es responsable | Un assignee; los demás, mencionados |
| Reabrir en vez de crear uno nuevo | Mezcla dos historias | Nuevo issue enlazando el anterior |

## 7. Trucos

- **Crear un issue desde la terminal**:
  ```bash
  gh issue create --title "..." --body "..." --label bug --assignee @me
  ```
- **Convertir un comentario en issue**: menú `···` del comentario →
  *Reference in new issue*. Conserva el enlace al original
- **Convertir una línea de tasklist en issue**: al pasar el ratón sobre ella
  aparece un icono que crea el issue y lo enlaza
- **Transferir un issue a otro repositorio**: `Transfer issue` en la barra
  lateral. Conserva comentarios y referencias
- **Ver un issue sin salir de la terminal**: `gh issue view 12 --comments`
- **Plantilla directa**: `gh issue create --template bug.yml`
- **Enlazar un PR a un issue sin cerrarlo**: menciona `#12` sin keyword, o usa
  *Development* en la barra lateral del PR

## 📚 Recursos Adicionales

- [GitHub Docs — About issues](https://docs.github.com/issues/tracking-your-work-with-issues/about-issues)
- [GitHub Docs — Linking a pull request to an issue](https://docs.github.com/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
- [GitHub Docs — Sub-issues](https://docs.github.com/issues/tracking-your-work-with-issues/using-issues/adding-sub-issues)

## ✅ Checklist de Verificación

- [ ] Tus títulos permiten decidir sin abrir el issue
- [ ] Todos tus issues tienen criterios de aceptación
- [ ] Sabes qué cierra un issue automáticamente y qué no
- [ ] Distingues cuándo usar tasklist y cuándo sub-issues
