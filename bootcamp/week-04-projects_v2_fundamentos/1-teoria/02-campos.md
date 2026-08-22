# Campos

> Los campos son el vocabulario de tu planificación. Con cuatro bien elegidos se
> gestiona un producto; con veinte, no se rellena ninguno.

## 🎯 Objetivos

- Elegir el tipo de campo adecuado para cada dato
- Saber qué campos existen sin que los crees y cuáles se pueden editar
- Diseñar un *single select* que siga siendo útil dentro de seis meses
- Decidir cuántos campos necesita de verdad tu proyecto
- Crear y consultar campos desde la terminal

## 1. Qué problema resuelve

Un backlog sin campos solo se puede ordenar por fecha. Con campos puedes
responder "¿qué queda para cerrar el sprint?" o "¿cuánto trabajo sin estimar
tenemos?" — que son las preguntas que hacen que un tablero sirva para algo.

Y hay un motivo estructural: **filtros, agrupaciones y automatización se escriben
sobre campos**. Un dato que vive en el título o en un comentario no se puede
filtrar; el mismo dato en un campo, sí.

## 2. Tipos de campo

| Tipo | Guarda | Para qué |
|------|--------|----------|
| **Text** | Texto libre | Notas cortas. Úsalo poco: no se agrupa bien |
| **Number** | Número | Estimación, puntos, coste |
| **Date** | Fecha | Fecha objetivo, fecha de entrega |
| **Single select** | Una opción de una lista cerrada, con color y descripción | Estado, prioridad, área, talla |
| **Iteration** | Un periodo con fechas ([Teoría 03](03-iteraciones.md)) | Sprints, ciclos |

El techo es de **50 campos por project, contando los de fábrica**. Parece mucho
hasta que alguien crea uno por cada matiz.

### Campos que ya existen

No hace falta crearlos y no se pueden borrar:

`Title`, `Assignees`, `Status`, `Labels`, `Linked pull requests`, `Milestone`,
`Repository`, `Reviewers`, `Parent issue`, `Sub-issues progress`.

Dos consecuencias que se olvidan:

- Los que vienen del issue (`Labels`, `Assignees`, `Milestone`) **se editan en el
  issue**, aunque los veas en la tabla: el project los refleja, no los posee
- `Status` es un *single select* especial: trae `Todo`, `In Progress` y `Done`,
  **sí** se puede editar, y es el campo por el que agrupa el tablero por defecto

## 3. Single select: el caballo de batalla

Es el tipo que más vas a usar. Cada opción admite color y descripción:

| Campo | Opciones sugeridas |
|-------|--------------------|
| `Status` | `Backlog`, `Listo`, `En curso`, `En revisión`, `Hecho` |
| `Priority` | `🔴 Alta`, `🟠 Media`, `🟡 Baja` |
| `Area` | Las áreas de **tu** dominio |
| `Size` | `XS`, `S`, `M`, `L`, `XL` |

Reglas:

- **Entre 3 y 6 opciones.** Más de eso y nadie distingue `Media-alta` de `Alta`
- **La descripción no es opcional.** Escribe el criterio, no un sinónimo:
  `En revisión` → "tiene PR abierto esperando a alguien", no "en revisión"
- **El orden importa**: define el orden de las columnas del tablero y el de la
  ordenación (que **no** es alfabética). Ponlas en el orden real del flujo

Renombrar una opción actualiza todos los items que la tenían. Borrarla, en
cambio, deja esos items **sin valor** en ese campo: primero reasigna, luego borra.

## 4. Number y Date, con criterio

**Number** sirve para estimación, puntos o coste. Su valor real aparece en las
vistas: un tablero puede mostrar la **suma** del campo por columna, así que
`Estimate` convierte cada columna en una carga de trabajo, no en un recuento de
tarjetas.

Estimar en **horas** es la trampa clásica: se lee como compromiso y siempre
falla. Tallas (`S`/`M`/`L`) o puntos comunican incertidumbre, que es de lo que se
trata.

**Date** solo tiene sentido si alguien va a mirar esa fecha: `Target date` para
compromisos externos, sí; `Fecha de creación`, no — eso ya lo sabe GitHub.

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
una pregunta que no puedes responder — y quita cualquiera que lleve un mes vacío.

## 6. Desde la terminal

```bash
gh project field-list <n> --owner @me
gh project field-list <n> --owner @me --format json --jq '.fields[] | "\(.id) \(.name) \(.type)"'

gh project field-create <n> --owner @me --name "Area" \
  --data-type SINGLE_SELECT --single-select-options "prestamos,socios,catalogo"

gh project field-create <n> --owner @me --name "Estimate" --data-type NUMBER
gh project field-delete --id <ID_DEL_CAMPO>
```

Los tipos válidos son `TEXT`, `NUMBER`, `DATE` y `SINGLE_SELECT`. Los campos de
**iteración no se crean por CLI**: se configuran en la interfaz.

Ese `field-list --format json` es además de donde salen los IDs que necesitas
para escribir por GraphQL ([Teoría 07](07-projects-por-graphql.md)).

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Campo de texto para lo que es una lista | No se filtra ni se agrupa | Single select |
| Estimación en horas | Se lee como compromiso y siempre falla | Tallas o puntos |
| Opciones sin descripción | Cada uno interpreta lo suyo | Descríbelas todas, con criterio |
| Diez opciones en un select | Nadie distingue las de en medio | 3-6 |
| Duplicar labels como campos | Dos fuentes de verdad que se contradicen | Labels clasifican, campos planifican |
| Campos que nadie rellena | Ruido en todas las vistas y consumen del techo de 50 | Bórralos |
| Borrar una opción sin reasignar | Los items se quedan sin valor y desaparecen de las agrupaciones | Reasigna antes |
| Un campo `Fecha de creación` | Ya existe como metadato | Usa lo que GitHub ya sabe |

## 8. Trucos

- **Emoji en las opciones** (`🔴 Alta`): se distinguen de un vistazo, mejor que
  solo el color
- **Suma por columna**: en un board, el menú de la columna permite mostrar la
  suma de un campo numérico — carga real por estado
- **Editar en masa**: en la vista de tabla, selecciona varias filas con `Shift` y
  asigna el valor a todas de una vez; también se puede pegar una columna entera
- **`no:` para encontrar huecos**: `no:iteration`, `no:estimate`, `no:assignee`
  son las tres consultas que revelan un backlog mal mantenido
- **Los campos son del project, no del repositorio**: en un project multi-repo se
  aplican a todos por igual
- **Antes de crear un campo, pregúntate qué vista lo va a usar.** Si no hay
  respuesta, no lo crees

## 📚 Recursos Adicionales

- [GitHub Docs — Understanding fields](https://docs.github.com/issues/planning-and-tracking-with-projects/understanding-fields)
- [GitHub Docs — About projects (límites)](https://docs.github.com/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)
- [Manual de `gh project`](https://cli.github.com/manual/gh_project)

## ✅ Checklist de Verificación

- [ ] Tienes entre 4 y 6 campos, todos con datos en la mayoría de items
- [ ] Cada opción de single select tiene descripción con criterio
- [ ] El orden de las opciones de `Status` es el orden real de tu flujo
- [ ] Sabes listar los campos y sus IDs desde la CLI
- [ ] Ningún campo lleva un mes vacío
