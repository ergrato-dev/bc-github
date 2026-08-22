# Práctica 02 — Vistas que responden preguntas

> Cuatro vistas, cuatro preguntas reales. Si una vista no responde una pregunta
> que alguien se hace, sobra.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 04](../1-teoria/04-vistas-y-layouts.md) y [05](../1-teoria/05-filtros.md), práctica 01

## Contexto

Tu project tiene doce items y una sola vista de tabla con todo mezclado. Vamos a
crear las cuatro vistas que usa un equipo de verdad.

Las vistas se crean desde la web (el CLI no las gestiona). En cada paso tienes
la configuración exacta y una consulta para comprobar el resultado.

## Paso 1: Vista "Backlog"

**Pregunta que responde**: ¿qué hay pendiente y sin planificar, por prioridad?

| Palanca | Valor |
|---------|-------|
| Nombre | `Backlog` |
| Layout | Table |
| Filter | `is:open -status:Hecho` |
| Group by | `Priority` |
| Sort by | `Title` ascendente |
| Fields | Title, Status, Priority, Size, Area, Assignees |

**Verifica**: los grupos son las tres prioridades y no aparece nada cerrado.

## Paso 2: Vista "En curso"

**Pregunta que responde**: ¿qué se está haciendo ahora mismo y quién lo hace?

| Palanca | Valor |
|---------|-------|
| Nombre | `En curso` |
| Layout | Board |
| Filter | `is:open -status:Backlog` |
| Group by | `Status` |
| Sort by | `Priority` descendente |

**Verifica**: las columnas son tus estados, en el orden que definiste en el
campo `Status`. Si el orden no te gusta, reordena las opciones del campo — no la
vista.

## Paso 3: Vista "Mi trabajo"

**Pregunta que responde**: ¿qué me toca a mí?

| Palanca | Valor |
|---------|-------|
| Nombre | `Mi trabajo` |
| Layout | Board |
| Filter | `assignee:@me is:open` |
| Group by | `Status` |

**Por qué así**: `@me` se resuelve por usuario. La misma vista sirve para todo el
equipo sin duplicarla por persona.

**Verifica**: asígnate dos issues y comprueba que aparecen.

```bash
gh issue edit <n> --add-assignee @me
```

## Paso 4: Vista "Sin dueño"

**Pregunta que responde**: ¿qué está abierto y no lo está haciendo nadie?

| Palanca | Valor |
|---------|-------|
| Nombre | `Sin dueño` |
| Layout | Table |
| Filter | `is:open no:assignee` |
| Group by | `Priority` |

Es la vista más incómoda y la más útil: enseña el trabajo que todo el mundo cree
que alguien está haciendo.

**Verifica**:

```bash
gh issue list --search "is:open no:assignee" --json number --jq 'length'
```

El número debe coincidir con el de la vista (contando solo los que están en el
project).

## Paso 5: Ocultar campos por vista

**Por qué**: doce columnas obligan a hacer scroll horizontal y nadie lee la
duodécima.

En cada vista, `···` → `Fields` y deja solo lo que esa pregunta necesita:

- `Backlog`: Title, Priority, Size, Area
- `En curso`: Title, Assignees, Priority
- `Mi trabajo`: Title, Priority, Target date
- `Sin dueño`: Title, Priority, Area

**Verifica**: ninguna vista necesita scroll horizontal en una pantalla normal.

## Paso 6: Probar el slicing

**Por qué**: evita crear una vista por área.

En la vista `Backlog`, abre el panel de *slice* y elige `Area`. Aparece la lista
de áreas con su recuento; al pulsar una, la vista se filtra.

**Verifica**: puedes ver el backlog de cada área sin crear vistas nuevas.

## Paso 7: Comprobar que la agrupación no mueve datos

**Por qué**: es el concepto central de la semana.

En la vista `En curso`, cambia `Group by` de `Status` a `Area`. Las columnas
cambian por completo.

```bash
gh project item-list <numero> --owner @me --format json \
  --jq '[.items[] | {title, status}] | .[0:3]'
```

Vuelve a poner `Group by: Status` y repite el comando.

**Verifica**: la salida es idéntica. Cambiar la agrupación **no** modifica
ningún dato: solo la pregunta.

## ✅ Resultado

- [ ] Cuatro vistas, cada una con nombre de pregunta
- [ ] Ninguna muestra todos los items sin filtrar
- [ ] Cada vista muestra solo los campos que necesita
- [ ] Has usado slicing para revisar por área
- [ ] Has comprobado que `Group by` no altera los datos

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| El filtro no devuelve nada | El valor lleva espacios sin comillas | `status:"En curso"` |
| El board sale con una sola columna | Falta `Group by` | Configúralo |
| `assignee:@me` no filtra | No hay nadie asignado | `gh issue edit <n> --add-assignee @me` |
| Las columnas salen en orden raro | Es el orden de las opciones del campo | Reordénalas en `Settings → Status` |
| La vista se borró | `···` → *Delete view*, sin confirmación fuerte | Vuelve a crearla; la configuración no se recupera |
