# Campos e iteraciones

> Los campos son el vocabulario de tu planificación. Con cuatro bien elegidos se
> gestiona un producto; con veinte, no se rellena ninguno.

## 🎯 Objetivos

- Elegir el tipo de campo adecuado para cada dato
- Configurar un campo de iteración con duración y descansos
- Entender qué campos existen sin que los crees
- Decidir cuántos campos necesita de verdad tu proyecto

## 1. Qué problema resuelve

Un backlog sin campos solo se puede ordenar por fecha. Con campos puedes
responder "¿qué queda para cerrar el sprint?" o "¿cuánto trabajo sin estimar
tenemos?" — que son las preguntas que hacen que un tablero sirva para algo.

## 2. Tipos de campo

| Tipo | Guarda | Para qué |
|------|--------|----------|
| **Text** | Texto libre | Notas cortas. Úsalo poco: no se filtra bien |
| **Number** | Número | Estimación, puntos, coste |
| **Date** | Fecha | Fecha objetivo, fecha de entrega |
| **Single select** | Una opción de una lista cerrada, con color y descripción | Estado, prioridad, área |
| **Iteration** | Un periodo con fechas | Sprints, ciclos |

### Campos que ya existen

No hace falta crearlos y no se pueden borrar:

`Title`, `Assignees`, `Status`, `Labels`, `Linked pull requests`, `Milestone`,
`Repository`, `Reviewers`, `Parent issue`, `Sub-issues progress`.

`Status` es un *single select* especial: viene con `Todo`, `In Progress` y
`Done`, y **sí** se puede editar. Es el campo por el que agrupa el tablero por
defecto.

## 3. Single select: el caballo de batalla

Es el tipo que más vas a usar. Cada opción admite color y descripción:

| Campo | Opciones sugeridas |
|-------|--------------------|
| `Status` | `Backlog`, `Listo`, `En curso`, `En revisión`, `Hecho` |
| `Priority` | `🔴 Alta`, `🟠 Media`, `🟡 Baja` |
| `Area` | Las áreas de **tu** dominio |
| `Size` | `XS`, `S`, `M`, `L`, `XL` |

Reglas:

- **Entre 3 y 6 opciones.** Más de eso y nadie distingue `Media-alta` de `Alta`.
- **La descripción no es opcional.** Escribe qué significa cada valor o cada
  persona usará el suyo.
- **El orden importa**: define el orden de las columnas en el tablero. Ponlas en
  el orden real del flujo.

## 4. Iteraciones

Un campo de iteración no guarda un texto: guarda **periodos con fechas**.

Configuración: duración (1, 2 o 4 semanas es lo habitual), fecha de inicio y
número de iteraciones a generar. GitHub crea `Iteration 1`, `Iteration 2`… y
puedes renombrarlas.

Lo que lo hace útil son los filtros relativos:

| Filtro | Qué devuelve |
|--------|--------------|
| `iteration:@current` | La iteración que contiene la fecha de hoy |
| `iteration:@previous` | La anterior |
| `iteration:@next` | La siguiente |
| `no:iteration` | Backlog sin planificar |

Una vista filtrada por `iteration:@current` es tu sprint actual **para siempre**,
sin tocarla cada dos semanas.

### Descansos (*breaks*)

Puedes insertar un periodo sin iteración: vacaciones, congelación de código,
semana de mantenimiento. El roadmap lo muestra como hueco, y las métricas no
cuentan ese tiempo como capacidad.

> [!TIP]
> Genera iteraciones para **un trimestre**, no para el año. Las fechas cambian y
> renombrar veinticuatro iteraciones es peor que crear seis cada trimestre.

## 5. Cuántos campos

El error habitual es crear todos los campos que se te ocurren el primer día. La
señal de que sobran es simple: **campos vacíos en la mayoría de items**.

Conjunto mínimo que funciona:

1. `Status` — dónde está (ya existe)
2. `Priority` — cuánto importa
3. `Iteration` — cuándo
4. `Size` o `Estimate` — cuánto cuesta
5. `Area` — de qué parte del sistema es

Con esos cinco se planifica y se mide. Añade un sexto solo cuando eches de menos
una pregunta que no puedes responder.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Campo de texto para lo que es una lista | No se filtra ni se agrupa | Single select |
| Estimación en horas | Se convierte en compromiso y siempre falla | Tallas (`S`, `M`, `L`) o puntos |
| Opciones sin descripción | Cada uno interpreta lo suyo | Descríbelas todas |
| Iteraciones de un año | Renombrarlas es un trabajo en sí | Un trimestre por tanda |
| Duplicar labels como campos | Dos fuentes de verdad | Labels clasifican, campos planifican |
| Campos que nadie rellena | Ruido en todas las vistas | Bórralos: se puede |

## 7. Trucos

- **Ver todos los campos y sus IDs**:
  ```bash
  gh project field-list <n> --owner @me
  ```
- **Crear un campo desde la terminal**:
  ```bash
  gh project field-create <n> --owner @me --name "Area" \
    --data-type SINGLE_SELECT --single-select-options "prestamos,socios,catalogo"
  ```
- **Emoji en las opciones** (`🔴 Alta`): se distinguen de un vistazo en el
  tablero, mejor que solo el color
- **Editar en masa**: la vista de tabla permite seleccionar varias filas y
  asignar un valor a todas a la vez
- **`no:` para encontrar huecos**: `no:iteration`, `no:estimate`, `no:assignee`
  son las tres consultas que revelan un backlog mal mantenido
- **Los campos son del project, no del repositorio**: si trabajas con varios
  repos en un project, los campos aplican a todos por igual

## 📚 Recursos Adicionales

- [GitHub Docs — Understanding fields](https://docs.github.com/issues/planning-and-tracking-with-projects/understanding-fields)
- [GitHub Docs — Managing iterations](https://docs.github.com/issues/planning-and-tracking-with-projects/understanding-fields/about-iteration-fields)
- [Manual de `gh project`](https://cli.github.com/manual/gh_project)

## ✅ Checklist de Verificación

- [ ] Tienes entre 4 y 6 campos, todos con datos en la mayoría de items
- [ ] Cada opción de single select tiene descripción
- [ ] Tu campo de iteración cubre al menos un trimestre
- [ ] Sabes filtrar por `iteration:@current`
