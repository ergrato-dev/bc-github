---
name: "Diagrama SVG"
description: "Genera un diagrama SVG para 0-assets/ con el estándar visual del bootcamp: tema dark de GitHub, sin degradados, sans-serif, accesible. Usar cuando un concepto se entienda mejor viéndolo que leyéndolo."
argument-hint: "Semana, nombre del archivo (ej: 02-flujo-ruleset.svg) y qué debe mostrar el diagrama"
mode: "agent"
---

# Diagrama SVG — Bootcamp GitHub

## Cuándo hacer un diagrama

- ✅ Un flujo con ramificaciones (qué pasa cuando un PR toca `main` protegida)
- ✅ Una jerarquía o relación (org → teams → repos → rulesets)
- ✅ Una secuencia temporal (OIDC: runner → GitHub → cloud → credencial efímera)
- ✅ Una comparación estructural (reusable workflow vs composite action)
- ❌ Una lista de pasos — eso es una lista
- ❌ Una tabla de opciones — eso es una tabla
- ❌ Decoración

## Paleta obligatoria (GitHub dark)

| Rol | Color |
|-----|-------|
| Fondo | `#0d1117` |
| Superficie / caja | `#161b22` |
| Borde | `#30363d` |
| Texto principal | `#f0f6fc` |
| Texto secundario | `#8b949e` |
| Acento / enlace | `#58a6ff` |
| Éxito | `#3fb950` |
| Advertencia | `#d29922` |
| Error / bloqueo | `#f85149` |
| Morado (Actions/automatización) | `#a371f7` |

**Sin degradados.** Colores sólidos, contraste alto.

## Reglas técnicas

- `viewBox` siempre, `width`/`height` coherentes, escala limpia
- `role="img"` + `<title>` para accesibilidad
- Estilos en un bloque `<style>` con clases, no atributos repetidos
- Tipografía: `Inter, Roboto, "Segoe UI", system-ui, sans-serif`. Nunca serif
- Tamaño mínimo de texto: 12px al tamaño natural
- Flechas con `<marker>` definido una vez y reutilizado
- Sin fuentes externas, sin imágenes embebidas, sin JavaScript
- Ancho objetivo 800px: es lo que se ve legible en GitHub sin zoom

## Plantilla

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400" role="img" aria-label="Descripción del diagrama">
  <title>Título del diagrama</title>
  <style>
    .bg   { fill: #0d1117; }
    .box  { fill: #161b22; stroke: #30363d; stroke-width: 1.5; }
    .ok   { stroke: #3fb950; }
    .err  { stroke: #f85149; }
    .t    { font-family: Inter, Roboto, "Segoe UI", system-ui, sans-serif; }
    .h    { font-size: 15px; font-weight: 600; fill: #f0f6fc; }
    .s    { font-size: 12px; font-weight: 400; fill: #8b949e; }
    .line { stroke: #58a6ff; stroke-width: 1.5; fill: none; }
  </style>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#58a6ff"/>
    </marker>
  </defs>
  <rect class="bg" width="800" height="400"/>
  <!-- contenido -->
</svg>
```

## Reglas de contenido

- **Un diagrama, una idea.** Si necesita leyenda de seis entradas, son dos diagramas.
- Texto en **español**; nombres de features en inglés (`ruleset`, `merge queue`)
- Numera el orden de lectura cuando importe (`1`, `2`, `3` en círculos)
- Nombra el archivo por orden de aparición: `01-...svg`, `02-...svg`
- **Enlázalo** desde el `.md` correspondiente:
  `![Descripción accesible](../0-assets/01-nombre.svg)` — un SVG no enlazado es
  un error que reporta `verificar-enlaces.sh`

## Antes de entregar

- [ ] Abre el SVG en el navegador: se ve completo, sin texto cortado
- [ ] Legible al 100% sin zoom
- [ ] Contraste suficiente sobre `#0d1117`
- [ ] `<title>` y `aria-label` presentes y descriptivos
- [ ] Enlazado desde al menos un `.md`

## Datos del diagrama

$input
