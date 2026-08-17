---
name: "Nueva teoría"
description: "Genera un archivo de teoría del Bootcamp GitHub siguiendo la estructura fija: qué problema resuelve, cómo se configura, antipatrones, trucos. Máximo 200 líneas, con comandos gh reales y verificables."
argument-hint: "Semana (ej: 11), nombre del archivo (ej: 03-oidc.md) y la feature de GitHub a explicar"
mode: "agent"
---

# Nuevo archivo de teoría — Bootcamp GitHub

## Estructura obligatoria

```markdown
# Título del Tema

> Una línea: qué resuelve esto y por qué te importa.

## 🎯 Objetivos

- Objetivo verificable 1
- Objetivo verificable 2

## 1. Qué problema resuelve

El dolor concreto que existía antes de la feature. Con un ejemplo real, no
abstracto: "sin esto, cualquiera con permiso de escritura puede…".

## 2. Cómo se configura

### Con `gh` CLI

\`\`\`bash
gh api repos/OWNER/REPO/... --jq '...'
\`\`\`

### Con la UI web

`Settings → ... → ...` (la ruta de menú, fechada si es volátil)

### Qué significa cada opción

| Opción | Qué hace | Cuándo la quieres |
|--------|----------|-------------------|

## 3. Antipatrones

| Antipatrón | Por qué duele | Qué hacer en su lugar |
|------------|---------------|-----------------------|

## 4. Trucos

- Truco concreto y verificable

## 📚 Recursos Adicionales

- [Documentación oficial](https://docs.github.com/...)

## ✅ Checklist de Verificación

- [ ] Afirmación comprobable sobre tu propio repo
```

## Reglas

- **Longitud**: objetivo ~150 líneas, máximo duro 200. Si no cabe, divide en dos
  archivos temáticos (`03-oidc.md`, `04-oidc-en-la-nube.md`), no comprimas.
- **Español** en la prosa; inglés en comandos, identificadores y nombres de features.
- **Cada comando debe ser ejecutable tal cual**. Nada de `gh api <endpoint>`.
- **Muestra la salida esperada** cuando ayude a verificar.
- **`--jq`** para recortar respuestas grandes en vez de volcar JSON de 200 líneas.
- **No inventes endpoints, flags ni nombres de features.** Si no estás seguro de
  que exista, enlaza la documentación en vez de escribir el comando.
- **Nunca un token con formato válido**, ni de ejemplo.
- **Workflows de ejemplo**: siempre con `permissions` explícitas y actions de
  terceros pinneadas por SHA con el tag en comentario.
- **Advierte antes de lo destructivo**: reescritura de historia, borrado de
  rulesets, `--force`. La advertencia va **antes** del bloque de código.
- **Fecha lo volátil**: features en beta/preview llevan la fecha de verificación.
- Diagramas en SVG dentro de `0-assets/`, enlazados con
  `![Descripción](../0-assets/NN-nombre.svg)`. Nunca ASCII art.

## Antes de entregar

- [ ] Menos de 200 líneas
- [ ] Las 4 secciones numeradas presentes y en orden
- [ ] Todos los comandos ejecutados de verdad, no deducidos
- [ ] El checklist final es verificable sobre el repo del estudiante
- [ ] Enlaces relativos correctos (`bash scripts/verificar-enlaces.sh`)

## Datos del archivo a crear

$input
