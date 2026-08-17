---
name: "Nueva práctica"
description: "Genera una práctica guiada del Bootcamp GitHub. Las prácticas son operaciones reales sobre GitHub verificables por API, no código en un starter (salvo semanas 09-12 y 15-16)."
argument-hint: "Semana (ej: 08), número y nombre de la práctica, y la operación sobre GitHub que se ejecuta"
mode: "agent"
---

# Nueva práctica — Bootcamp GitHub

## Qué es una práctica aquí

Una secuencia de **operaciones reales sobre un repositorio de GitHub**, cada una
con su comando de verificación. El entregable es el **estado del repo**, no un
archivo de código.

Excepción: semanas **09-12** (Actions) y **15-16** (API) sí llevan `starter/`
con YAML o TypeScript, y ahí aplica el patrón de **descomentar código**.

## Estructura del archivo

```markdown
# Práctica NN — Título

> Qué vas a conseguir, en una línea.

**Duración estimada**: XX min
**Prerrequisitos**: qué debe estar hecho antes

## Contexto

El escenario concreto. Por qué alguien haría esto en un equipo real.

## Paso 1: Título del paso

**Por qué**: el problema que resuelve este paso. Sin esto, el paso es un clic
sin sentido.

**Con `gh`**:

\`\`\`bash
gh ...
\`\`\`

**Con la UI**: `Settings → ... → ...`

**Verifica**:

\`\`\`bash
gh api ... --jq '...'
# salida esperada
\`\`\`

## Paso 2: ...

## ✅ Resultado

Qué debe ser cierto sobre tu repositorio al terminar:

- [ ] Afirmación verificable 1
- [ ] Afirmación verificable 2

\`\`\`bash
./scripts/verificar-semana.sh XX --repo <tu-usuario>/<tu-repo>
\`\`\`

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
```

## Reglas

- **Cada paso termina con verificación.** Un paso sin comando de comprobación no
  está terminado.
- **Cada paso empieza por el porqué.** Sin eso el estudiante memoriza clics.
- **Placeholders**: `<tu-usuario>`, `<tu-repo>`. En ejemplos genéricos de la API,
  `OWNER/REPO`. Nunca un usuario o repo real de terceros.
- **`gh` resuelve el repo solo** cuando estás dentro del clon: explícalo la
  primera vez que aparezca `{owner}/{repo}`.
- **Advertencia antes de lo destructivo**, no después.
- **Sección "Si algo sale mal"** obligatoria: los errores de permisos y scopes
  son el 80% de los atascos en este bootcamp.
- **Nada que gaste dinero** sin avisar (minutos de Actions en repos privados,
  Codespaces, almacenamiento de packages).
- Las prácticas deben poder repetirse: si un paso crea algo con nombre fijo,
  explica cómo borrarlo o hazlo idempotente.

### Semanas con código (09-12, 15-16)

Patrón de descomentar, nunca `# TODO:`:

```yaml
# ============================================
# PASO 2: matriz de versiones de Node
# ============================================
# Descomenta las siguientes líneas:
# strategy:
#   fail-fast: false
#   matrix:
#     node: [20, 22, 24]
```

El README de la práctica explica el concepto con el bloque ya completo; el
`starter/` lo tiene comentado para que el estudiante lo descomente.

## Datos de la práctica a crear

$input
