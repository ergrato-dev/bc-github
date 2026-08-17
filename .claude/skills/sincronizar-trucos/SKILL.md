---
name: sincronizar-trucos
description: Mantiene sincronizada la sección "🎩 Trucos y atajos" de cada README de semana con el cheatsheet acumulativo docs/trucos-github.md. Usar tras crear o editar la sección de trucos de cualquier semana, y antes de cerrar una semana.
allowed-tools: Read Edit Grep Glob
---

# Sincronizar trucos

`docs/trucos-github.md` es el **cheatsheet acumulativo** del bootcamp: la unión
de todas las secciones `## 🎩 Trucos y atajos` de las 21 semanas, agrupada por
semana. Se mantiene a mano; se desincroniza en cuanto alguien añade un truco y
solo lo pone en un sitio.

## Qué hacer

1. Extraer los trucos de las semanas:

   ```bash
   grep -A 40 '🎩 Trucos y atajos' bootcamp/week-*/README.md
   ```

2. Comparar con las secciones de `docs/trucos-github.md`.

3. Reportar y corregir en ambos sentidos:
   - Truco en el README de semana pero no en el cheatsheet → añadirlo al cheatsheet
   - Truco en el cheatsheet pero no en ninguna semana → o se enlaza a su semana
     o se borra (el cheatsheet no inventa contenido)
   - Redacción distinta del mismo truco → gana la del README de semana

## Criterio de admisión de un truco

- ✅ Ahorra tiempo real o revela algo que la UI esconde
- ✅ Es verificable y estable (no depende de la posición de un menú)
- ❌ No es un consejo genérico de productividad
- ❌ No depende de extensiones de terceros sin mantenimiento
- ❌ No es una feature normal disfrazada de truco

Si un "truco" no pasa el criterio, se borra de los dos sitios.

## Formato en el cheatsheet

```markdown
## Semana NN — Tema

| Truco | Cómo |
|-------|------|
| Ver el markdown en crudo | Añade `?plain=1` a la URL del archivo |
```

Cada sección del cheatsheet enlaza a su semana:
`→ [Semana NN](../bootcamp/week-NN-slug/README.md)`

## Cierre

El cheatsheet y las 21 secciones dicen exactamente lo mismo, o el skill no ha
terminado.
