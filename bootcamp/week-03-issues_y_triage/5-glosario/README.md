# Glosario — Semana 03

## C

**Closing keyword** — Palabra (`Fixes`, `Closes`, `Resolves`) que, en la
**descripción de un PR**, cierra el issue referenciado al mergear. En un
comentario posterior no funciona.

**`config.yml`** — Archivo de `.github/ISSUE_TEMPLATE/` que controla el selector
de plantillas: `blank_issues_enabled` y `contact_links`.

**Contact link** — Entrada del selector que lleva fuera de Issues (Discussions,
reporte privado de seguridad). No crea un issue.

## E

**Épico** (*epic*) — Issue paraguas que agrupa trabajo grande y se descompone en
sub-issues. No es un tipo nativo de GitHub: es una convención.

## I

**Issue form** — Plantilla de issue en YAML con campos tipados y validación. A
diferencia de una plantilla Markdown, el usuario **no puede** saltarse los
campos obligatorios.

**Issue type** (*type*) — Clasificación a nivel de organización (`Bug`,
`Feature`, `Task`) homogénea entre repositorios, independiente de las labels.

## L

**Label** (*label*) — Etiqueta de clasificación del repositorio. Conviene
agruparlas por familias con prefijo (`type:`, `area:`, `prio:`, `status:`).

## M

**Milestone** — Agrupación de issues y PRs con una fecha objetivo. Uno por issue,
con barra de progreso automática.

## N

**Not planned** (*closed as not planned*) — Razón de cierre para lo que no se va
a hacer: duplicado, fuera de alcance, no reproducible. Distinta de *completed*.

## R

**Render** (`render: shell`) — Atributo de un `textarea` de un issue form que
mete la respuesta en un bloque de código con resaltado.

## S

**Saved reply** (*respuesta guardada*) — Texto reutilizable de tu cuenta,
insertable con `Ctrl` + `.` en cualquier caja de comentario.

**Stale** — Etiqueta o bot que marca issues sin actividad. Mal calibrado, es la
automatización que más comunidades ha destruido.

**Sub-issue** — Issue hijo de otro, con relación jerárquica real: se asigna, se
cierra y cuenta para el progreso del padre. Solo accesible por GraphQL.

## T

**Tasklist** — Lista de casillas (`- [ ]`) en el cuerpo de un issue. Pasos de una
misma tarea, sin identidad propia. Genera contador de progreso.

**Triage** — Proceso de clasificar issues entrantes. También es un nivel de
permiso del repositorio: permite etiquetar y cerrar, no escribir código.

---

> 📚 Glosario global del bootcamp: [docs/glosario-global.md](../../../docs/glosario-global.md)
