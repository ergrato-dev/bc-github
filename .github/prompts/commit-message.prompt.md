---
name: "Mensaje de commit"
description: "Genera un mensaje de commit con Conventional Commits para cambios en el material del bootcamp. Usar antes de commitear cualquier cambio en este repositorio."
argument-hint: "Descripción de los cambios o salida de git diff --staged"
mode: "agent"
---

# Mensaje de commit — Bootcamp GitHub

Este repo enseña Conventional Commits (Semana 07); su propia historia tiene que
predicar con el ejemplo.

## Formato

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
```

- **Descripción**: imperativo, minúscula inicial, sin punto final, ≤ 72 caracteres
- **Idioma**: español en la descripción; nombres de features y archivos en inglés
- **Cuerpo**: explica el **porqué**, no el qué (el diff ya dice el qué)

## Tipos

| Tipo | Cuándo |
|------|--------|
| `docs` | Teoría, README, glosario, recursos, rúbricas |
| `feat` | Contenido nuevo: una semana, una práctica, un script, una comprobación |
| `fix` | Un comando, endpoint, workflow o enlace que estaba mal |
| `chore` | Mantenimiento: estructura, CI del repo, dependencias |
| `refactor` | Reorganizar contenido sin cambiar lo que enseña |
| `style` | Formato de markdown sin cambio de contenido |

## Alcances

- La semana: `week-01` … `week-21`
- El área transversal: `docs`, `scripts`, `prompts`, `skills`, `assets`, `readme`

## Ejemplos

```
feat(week-09): añade teoría de contexts y expresiones de Actions

Cubre github/env/needs/matrix y las funciones contains, fromJSON y hashFiles.
Separado de 01-modelo-ejecucion.md porque ese archivo ya pasaba de 200 líneas.
```

```
fix(week-15): corrige el endpoint de rulesets en la práctica 02

El ejemplo usaba repos/{repo}/rules, que devuelve las reglas efectivas de una
rama, no los rulesets del repo. La comprobación de checks.json fallaba siempre.
```

```
docs(week-08): aclara que branch protection clásica es legado

Un estudiante puede encontrarse repos antiguos con branch protection; se explica
para leerla, no para configurarla.
```

```
chore(scripts): valida que jq esté instalado antes de correr las comprobaciones
```

## Reglas

- **Un commit, un cambio lógico.** No mezcles una semana nueva con un arreglo de enlaces.
- **Nada de `wip`, `cambios`, `update`.** Si no sabes resumirlo, el commit es demasiado grande.
- Si el cambio corrige algo reportado: `Closes #NN` en el footer.
- Si el cambio rompe algo para quien ya venía usando el material (renombrar una
  carpeta de semana, cambiar el formato de `checks.json`): `BREAKING CHANGE:` en
  el footer explicando la migración.
- **Nunca** menciones rutas locales, nombres de usuario o tokens en el mensaje.

## Cambios a describir

$input
