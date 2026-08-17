# Glosario — Semana 07

## B

**BREAKING CHANGE** — Cambio que rompe la compatibilidad. Se marca con `!` tras
el tipo o con un footer `BREAKING CHANGE:`. Fuerza un incremento MAJOR.

**`bloqueante:`** — Prefijo convencional de un comentario de revisión que sí
impide el merge.

## C

**Conventional Commits** — Especificación de formato de mensaje de commit:
`tipo(scope)!: descripción`. Habilita changelog y versionado automáticos.

**Criterios de aceptación** — Condiciones específicas de **un** issue. Distintos
de la Definition of Done, que es transversal.

## D

**Definition of Done (DoD)** — Lista corta y comprobable de condiciones que todo
cambio debe cumplir para considerarse terminado.

## F

**Feature flag** — Interruptor que permite integrar código sin activarlo. Es lo
que hace viable el trunk-based development.

## G

**GitHub flow** — Una rama permanente (`main`, siempre desplegable) y ramas
cortas que entran por PR. El flujo por defecto de este bootcamp.

**git-flow** — Modelo con `main`, `develop`, `feature/*`, `release/*` y
`hotfix/*`. Útil solo si mantienes varias versiones en producción.

## H

**Hook** — Script que Git ejecuta en un momento del ciclo (`commit-msg`,
`pre-push`…). No se clona: se comparte con `core.hooksPath`.

## N

**`nit:`** — Prefijo de comentario menor que no bloquea el merge.

## S

**Scope** — Área del sistema entre paréntesis en un commit convencional
(`feat(prestamos):`). Del dominio, no del archivo.

**SemVer** — `MAYOR.MENOR.PARCHE`. `feat` → MENOR, `fix` → PARCHE,
breaking change → MAYOR.

## T

**Trunk-based development** — Integración en la rama principal varias veces al
día, con ramas de horas y feature flags.

---

> 📚 Glosario global del bootcamp: [docs/glosario-global.md](../../../docs/glosario-global.md)
