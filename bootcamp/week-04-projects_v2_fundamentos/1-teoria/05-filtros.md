# Filtros

> El filtro es el lenguaje del project. Cinco expresiones bien escritas sustituyen
> a diez vistas y a media reunión de seguimiento.

## 🎯 Objetivos

- Escribir filtros con la sintaxis completa de Projects
- Combinar campos, estados, fechas y valores relativos
- Traducir una pregunta del equipo a un filtro concreto
- Reconocer las diferencias con la búsqueda de Issues
- Depurar un filtro que no devuelve lo que esperabas

## 1. Qué problema resuelve

"¿Qué queda para cerrar el sprint?" es una pregunta que alguien hace todas las
semanas. Si la respuesta es abrir el tablero y contar tarjetas a ojo, cada
persona da un número distinto. Si la respuesta es un filtro guardado, es siempre
el mismo número y se comprueba en dos segundos.

## 2. La sintaxis

| Filtro | Qué hace |
|--------|----------|
| `is:issue` · `is:pr` · `is:draft` | Tipo de item |
| `is:open` · `is:closed` · `is:merged` | Estado del issue o PR |
| `status:"En curso"` | Valor de un campo (comillas si lleva espacios) |
| `priority:Alta,Media` | Varios valores del mismo campo (**OR**) |
| `-status:Hecho` | Negación |
| `no:assignee` · `no:iteration` · `no:priority` | Campo vacío |
| `has:assignee` | Campo con cualquier valor |
| `assignee:@me` | Lo tuyo |
| `iteration:@current` · `@previous` · `@next` | Iteración relativa |
| `label:"type:bug"` | Labels del issue |
| `milestone:"v1.0"` | Milestone del issue |
| `repo:owner/nombre` | Un repositorio, en projects multi-repo |
| `reviewers:@me` | PRs que te toca revisar |
| `updated:<2026-06-01` | Por fecha absoluta |
| `updated:>@today-7d` | Por fecha relativa |
| `estimate:>3` | Comparación numérica |

Los términos se combinan con espacios, que significan **Y**:

```
is:open iteration:@current -status:Hecho no:assignee
```

= lo que hay que repartir en este sprint.

### Las tres reglas que evitan la mayoría de errores

1. **Espacio es Y, coma es O.** `priority:Alta,Media` es "alta o media";
   `priority:Alta priority:Media` no devuelve nada
2. **Los nombres de campo son los tuyos**, con el nombre exacto que les pusiste,
   en minúsculas y sin espacios: un campo `Target date` se filtra como
   `target-date`
3. **Comillas** siempre que el valor lleve espacios: `status:"En revisión"`

## 3. Fechas relativas

Es lo que hace que un filtro no caduque:

| Expresión | Significa |
|-----------|-----------|
| `@today` | Hoy |
| `@today-7d` | Hace una semana |
| `@today+1m` | Dentro de un mes |
| `updated:>@today-14d` | Actualizado en las dos últimas semanas |
| `target-date:<@today` | Fecha objetivo ya pasada — lo que va tarde |

Combinadas con `@current` cubren casi toda la planificación sin escribir una sola
fecha literal.

## 4. De la pregunta al filtro

| La pregunta | El filtro |
|-------------|-----------|
| ¿Qué queda del sprint? | `iteration:@current -status:Hecho` |
| ¿Qué se quedó sin hacer el sprint pasado? | `iteration:@previous -status:Hecho` |
| ¿Qué está sin repartir? | `is:open no:assignee -status:Hecho` |
| ¿Qué no está planificado? | `is:open no:iteration` |
| ¿Qué va tarde? | `target-date:<@today -status:Hecho` |
| ¿Qué lleva dos semanas parado? | `is:open updated:<@today-14d -status:Hecho` |
| ¿Qué hay sin estimar en este sprint? | `iteration:@current no:estimate` |
| ¿Qué me toca revisar? | `is:pr is:open reviewers:@me` |
| ¿Qué entró esta semana sin planificar? | `no:iteration updated:>@today-7d` |
| ¿Qué hay bloqueado? | `label:"status:bloqueado" is:open` |

Esa tabla es, literalmente, el guion de una reunión de seguimiento de diez
minutos.

## 5. En qué se diferencia de la búsqueda de Issues

Se parecen lo justo para confundir:

| | Filtros de Projects | Búsqueda de Issues |
|---|---|---|
| Alcance | Los items del project | Todo el repositorio o GitHub |
| Campos propios (`estimate`, `iteration`) | ✅ | ❌ No existen fuera del project |
| Texto libre en el cuerpo | ❌ | ✅ |
| `sort:` | Se configura en la vista, no en el filtro | ✅ En la propia consulta |
| Fechas relativas `@today-7d` | ✅ | ❌ Hay que poner la fecha |

Traducción: si la pregunta es sobre planificación, filtro de project; si es sobre
contenido, búsqueda de issues ([Semana 03, Teoría 06](../../week-03-issues_y_triage/1-teoria/06-consultas-y-bandeja.md)).

## 6. Depurar un filtro

Cuando no devuelve lo que esperabas, en este orden:

1. **Quita términos hasta que aparezca lo que buscas.** El último que quitaste es
   el culpable
2. **Comprueba el nombre del campo** tal y como está escrito en `field-list`
3. **Mira si el valor tiene espacios** y le faltan las comillas
4. **Recuerda que `is:open` no filtra los drafts**: un draft no está abierto ni
   cerrado
5. **Los items archivados no aparecen** en ninguna vista, por mucho que el filtro
   case

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Filtrar por el nombre del sprint | Caduca en dos semanas | `iteration:@current` |
| Fechas literales en filtros recurrentes | Hay que editarlos cada mes | `@today-Nd` |
| `priority:Alta priority:Media` | No devuelve nada (es Y) | `priority:Alta,Media` |
| Una vista por cada valor de un campo | Diez vistas casi iguales | Slice |
| Filtros de veinte términos | Nadie los entiende ni los mantiene | Divide en dos vistas |
| Buscar texto del cuerpo en el project | No lo soporta | Búsqueda de issues |
| Olvidar `-status:Hecho` | Los cerrados ensucian todos los recuentos | Añádelo por defecto |

## 8. Trucos

- **Empieza por el filtro más amplio y ve restando**: es más rápido que
  construirlo entero y adivinar por qué sale vacío
- **`has:` es el complemento de `no:`**: `has:estimate` para lo ya estimado
- **La URL guarda el filtro**: cualquier filtro que escribas se puede compartir
  pegando el enlace
- **Filtro para la revisión de backlog**: `is:open no:iteration -status:Hecho`
  ordenado por prioridad
- **Detectar el trabajo no planificado**: `no:iteration updated:>@today-7d` —
  todo lo que entró esta semana por la puerta de atrás
- **Guarda las preguntas, no los filtros**: nombra la vista con la pregunta y el
  filtro se explica solo

## 📚 Recursos Adicionales

- [GitHub Docs — Filtering projects](https://docs.github.com/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects)
- [GitHub Docs — Understanding fields](https://docs.github.com/issues/planning-and-tracking-with-projects/understanding-fields)

## ✅ Checklist de Verificación

- [ ] Sabes la diferencia entre espacio y coma en un filtro
- [ ] Usas fechas relativas en los filtros que se repiten
- [ ] Puedes traducir tres preguntas de tu proyecto a filtros
- [ ] Sabes por qué un filtro correcto puede no devolver un item archivado
- [ ] Ninguna de tus vistas filtra por el nombre literal de una iteración
