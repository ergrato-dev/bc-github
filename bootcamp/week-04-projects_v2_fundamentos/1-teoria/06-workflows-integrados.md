# Workflows integrados

> Antes de escribir automatización, agota la que ya viene hecha. Son ocho
> interruptores y cubren casi todo el mantenimiento del tablero.

## 🎯 Objetivos

- Activar y configurar los workflows nativos de un project
- Saber qué cubren y dónde está su límite
- Evitar la automatización que da más problemas de los que resuelve
- Reconocer cuándo hace falta un workflow de Actions

## 1. Qué problema resuelve

Un tablero se desactualiza en dos semanas si mantenerlo es trabajo manual:
alguien cierra un issue y su tarjeta se queda en "En curso" para siempre. Los
workflows integrados mantienen la coherencia mínima sin que nadie se acuerde.

## 2. Los workflows disponibles

`Project → ··· → Workflows`. Todos son "cuando pasa X, haz Y":

| Workflow | Disparador | Efecto |
|----------|-----------|--------|
| **Item added to project** | Se añade un item | Le pone un valor de campo (típico: `Status = Backlog`) |
| **Item reopened** | Se reabre un issue o PR | Vuelve a `En curso` o al estado que elijas |
| **Item closed** | Se cierra | Pasa a `Hecho` |
| **Code changes requested** | Un revisor pide cambios | Pasa a `En curso` |
| **Code review approved** | Se aprueba el PR | Pasa a `Listo para mergear` |
| **Pull request merged** | Se mergea | Pasa a `Hecho` |
| **Auto-add to project** | Un issue o PR nuevo cumple un filtro | Lo añade solo al project |
| **Auto-archive items** | Un item cumple un filtro | Lo archiva |

## 3. Los dos que de verdad cambian la vida

### Auto-add

Filtro tipo `is:issue is:open label:"type:bug"` sobre un repositorio: cada bug
nuevo aparece en el tablero sin que nadie lo arrastre.

Es lo que hace que el project no dependa de que la gente se acuerde.

> [!NOTE]
> `Auto-add` mira **un repositorio** por regla. Para un project multi-repo,
> añade una regla por repositorio.

### Item closed → Hecho

Elimina el desfase clásico entre "el issue está cerrado" y "la tarjeta sigue en
curso". Sin esto, cualquier métrica que saques del tablero miente.

## 4. Auto-archive: útil y peligroso

Archivar saca items del tablero sin borrarlos. Un filtro razonable:

```
is:closed updated:<@today-3w
```

Lo cerrado hace más de tres semanas deja de ocupar sitio.

> [!WARNING]
> Un filtro de auto-archive mal escrito puede vaciarte el tablero. Antes de
> activarlo, **pega el mismo filtro en una vista** y comprueba qué items
> aparecen. Eso es exactamente lo que se va a archivar.

Lo archivado se recupera desde `··· → Archived items`, pero recuperar cien items
uno a uno no es agradable.

## 5. Cómo se activan, y qué conviene saber antes

`Project → ··· → Workflows`. Cada workflow tiene su interruptor, su filtro (los
que lo admiten) y su acción. Cuatro detalles que ahorran desconcierto:

- **Solo aplican de aquí en adelante.** Activar `Auto-add` no trae los issues que
  ya existían: eso se hace a mano o por CLI (ver los trucos)
- **Se pueden desactivar sin borrar**, y conviene: así no pierdes el filtro que te
  costó escribir
- **Son del project**, no del repositorio. Se configuran una vez aunque el
  project cubra cinco repositorios
- **El filtro de `Auto-add` usa la sintaxis de búsqueda de issues**, no la de
  filtros de project: ahí se escribe `is:issue is:open label:"type:bug"`, y no
  existen `status:` ni `iteration:` porque el item aún no está en el tablero

### El orden en que conviene activarlos

1. `Item added to project` → `Status = Backlog`. Sin esto, los items entran sin
   estado y no aparecen en ninguna columna del tablero
2. `Item closed` → `Hecho`, y `Pull request merged` → `Hecho`
3. `Auto-add`, con un filtro estrecho
4. El resto, uno cada vez, comprobando el efecto antes del siguiente

## 6. Dónde está el límite

Los workflows integrados **no** pueden:

- Poner valores en campos que no sean `Status` (no ajustan prioridad ni
  iteración)
- Reaccionar a un comentario o a una label añadida después
- Copiar datos entre campos
- Calcular nada
- Tocar items de otro project

Todo eso necesita Actions + GraphQL, que es la Semana 05. Regla: si el
integrado lo cubre, úsalo — menos piezas que mantener.

| Necesidad | Herramienta |
|-----------|-------------|
| Estado según se abre, cierra o mergea | Workflow integrado |
| Meter en el tablero lo que cumple un filtro | Workflow integrado (`Auto-add`) |
| Poner iteración, prioridad o estimación al entrar | Actions + GraphQL (Semana 05) |
| Reaccionar a una label añadida después | Actions (Semana 05) |
| Copiar un valor de un campo a otro | Actions + GraphQL |
| Avisar en otro sitio cuando algo cambia de estado | Actions |

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Escribir un workflow de Actions para "cerrado → Hecho" | Ya existe hecho | Interruptor integrado |
| Auto-archive sin probar el filtro | Tablero vaciado | Pruébalo antes en una vista |
| Auto-add sin filtro | Entra todo, incluido el ruido | Filtra por label o por tipo |
| Activar los ocho workflows el primer día | No sabes cuál causó qué | Uno cada vez |
| Confiar en el auto-add para el histórico | Solo aplica a items **nuevos** | Los antiguos se añaden a mano |

## 8. Trucos

- **Añadir en bloque lo que ya existe** (auto-add no mira hacia atrás):
  ```bash
  gh issue list --state all --limit 100 --json url --jq '.[].url' \
    | xargs -I{} gh project item-add <n> --owner @me --url {}
  ```
- **Probar un filtro de archivado**: crea una vista temporal con ese filtro, mira
  qué sale, bórrala
- **`Item added` con `Status = Backlog`** evita el limbo de items sin estado, que
  no aparecen en ninguna columna del tablero
- **Los workflows son del project**, no del repositorio: se configuran una vez
  aunque el project cubra cinco repos
- **Desactivar temporalmente** en vez de borrar: los workflows tienen
  interruptor, y así no pierdes el filtro que te costó escribir

## 📚 Recursos Adicionales

- [GitHub Docs — Using the built-in automations](https://docs.github.com/issues/planning-and-tracking-with-projects/automating-your-project/using-the-built-in-automations)
- [GitHub Docs — Archiving items](https://docs.github.com/issues/planning-and-tracking-with-projects/managing-items-in-your-project/archiving-items-from-your-project)
- [`actions/add-to-project`](https://github.com/actions/add-to-project) — el paso siguiente, en la Semana 05

## ✅ Checklist de Verificación

- [ ] Tienes al menos un workflow integrado activo
- [ ] `Item closed` mueve las tarjetas a `Hecho`
- [ ] Si usas auto-archive, has probado el filtro en una vista antes
- [ ] Sabes decir qué **no** puede hacer un workflow integrado
- [ ] Los items nuevos entran con un `Status` puesto, no vacíos
