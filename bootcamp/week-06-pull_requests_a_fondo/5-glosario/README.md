# Glosario — Semana 06

## A

**Auto-merge** — Mergea el PR automáticamente en cuanto se cumplen los
requisitos (checks y aprobaciones). Sin checks obligatorios, puede mergear con
CI en rojo.

**Approve** — Veredicto de revisión que autoriza el merge.

## B

**Base** (*base branch*) — Rama donde se integrará el PR. En una pila, la base es
la rama del PR anterior, no `main`.

## C

**Check** (*status check*) — Resultado publicado sobre el commit de cabeza del
PR. Solo bloquea si un ruleset lo exige.

**Conflicto** — Dos ramas modifican la misma región de un archivo. Git no puede
decidir: lo decide una persona.

## D

**Draft PR** — PR marcado como no terminado. No se puede mergear y no notifica a
los revisores.

## F

**`--force-with-lease`** — Push forzado que aborta si el remoto tiene commits que
no conoces. La versión segura de `--force`.

## M

**Merge commit** — Commit con dos padres que integra una rama conservando su
historia.

**`mergeStateStatus`** — Campo que indica por qué un PR no se puede mergear:
conflicto, checks pendientes, revisión requerida.

## N

**`nit:`** — Prefijo convencional para un comentario de revisión menor que no
bloquea.

## R

**Rebase and merge** — Reaplica los commits del PR sobre la base, sin commit de
merge. Cambia los SHAs.

**`rebase --onto`** — Reaplica un rango de commits sobre otra base. La
herramienta para reordenar pilas de PRs.

**`rerere`** — Reutiliza resoluciones de conflicto ya hechas.

**Request changes** — Veredicto que bloquea el PR hasta que ese mismo revisor lo
levante.

**Revisión por lotes** (*batch review*) — Acumular comentarios y publicarlos
juntos con un veredicto, en vez de uno a uno.

## S

**Squash** — Funde todos los commits del PR en uno solo sobre la base.

**Stacked PRs** — Pila de PRs encadenados, cada uno con base en el anterior.

**Sugerencia** (*suggested change*) — Bloque ` ```suggestion ` en un comentario
de línea. El autor lo aplica con un clic y se convierte en commit.

## Z

**`zdiff3`** — Estilo de conflicto que muestra también el **ancestro común**.
Resuelve por sí solo buena parte de los conflictos.

---

> 📚 Glosario global del bootcamp: [docs/glosario-global.md](../../../docs/glosario-global.md)
