---
name: "Nuevo proyecto semanal"
description: "Genera el 3-proyecto/README.md de una semana: la capa que se añade al repositorio hilo conductor del estudiante, con requisitos verificables y criterios de calidad."
argument-hint: "Semana (ej: 12) y la capa que debe añadir al repo (ej: primer release v1.0.0 con changelog y GHCR)"
mode: "agent"
---

# Nuevo proyecto semanal — Bootcamp GitHub

## Principio

Cada semana añade **una capa al mismo repositorio del estudiante**. Nunca un
repo desechable. Ver [`docs/proyecto-hilo-conductor.md`](../../docs/proyecto-hilo-conductor.md)
para la tabla completa de capas por semana.

## Estructura

```markdown
# Proyecto Semana XX — [Capa que se añade]

> Qué tendrá tu repositorio al terminar que no tenía al empezar.

## 🎯 Objetivo

Una frase. El estado final del repo, no la actividad.

## 📦 Qué añade esta capa

Cómo encaja con lo que ya construiste (semanas anteriores) y qué desbloquea
(semanas siguientes).

## ✅ Requisitos verificables

Los que comprueba `checks.json`, uno por línea, con el mismo texto:

1. [ ] ...
2. [ ] ...

## 🎨 Criterios de calidad

Lo que la API no puede ver y sí evalúa la rúbrica:

- ...

## 💡 Adaptación a tu dominio

Ejemplos para 3-4 dominios distintos. Genéricos: el estudiante eligió su dominio
en la Semana 01 y puede ser cualquiera.

| Dominio | Cómo se ve esta capa |
|---------|----------------------|

## 🚦 Cómo entregarlo

\`\`\`bash
./scripts/verificar-semana.sh XX --repo <tu-usuario>/<tu-repo>
\`\`\`

## 🧯 Errores comunes

| Error | Por qué pasa | Solución |
|-------|--------------|----------|
```

## Reglas

- **Los requisitos verificables son literalmente las descripciones de
  `checks.json`.** Si no coinciden palabra por palabra, el estudiante no sabe
  qué le falta cuando falla una comprobación.
- **Sin dominios asignados**: los ejemplos cubren varios dominios, nunca uno
  impuesto.
- **Nada irreversible sin backup**: si la capa reescribe historia o borra
  configuración, el primer paso es el respaldo.
- **Coste cero**: todo debe funcionar en plan Free sobre repo público. Si algo
  requiere plan de pago, va como sección "Si tienes plan Team" claramente
  separada y **no** entra en `checks.json`.
- **Acumulativo**: no pidas rehacer lo de semanas anteriores; pide construir
  encima. Si una capa invalida algo previo, dilo explícitamente.

## Datos del proyecto a crear

$input
