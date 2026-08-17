# Proyecto Semana 03 — El backlog real de tu dominio

> Al terminar, tu repositorio tiene un backlog que se puede leer, filtrar y
> repartir. No una lista de recordatorios.

## 🎯 Objetivo

Construir el backlog inicial de tu proyecto: formularios de entrada, taxonomía
de labels, issues reales de tu dominio, un épico partido y un milestone con
fecha.

## 📦 Qué añade esta capa

La Semana 02 dejó el repositorio presentable; esta le da **trabajo dentro**. Sin
issues reales, el Project de la Semana 04 estaría vacío, los PRs de la Semana 06
no tendrían nada que cerrar y las métricas de la Semana 05 no medirían nada.

Es la semana que convierte el repositorio en un proyecto vivo.

## ✅ Requisitos verificables

Estos son exactamente los que comprueba `checks.json`:

1. [ ] Existen 2 o más formularios de issue en `.github/ISSUE_TEMPLATE/`
2. [ ] Existe `config.yml` con al menos un contact link
3. [ ] Hay 10 o más labels propias, todas con descripción
4. [ ] Hay 12 o más issues creados
5. [ ] Ningún issue abierto se queda sin ninguna label
6. [ ] Existe un milestone con fecha y 5 o más issues asignados

## 🎨 Criterios de calidad

Lo que la API no ve:

- **Los issues describen problemas reales de tu dominio.** "Tarea 1", "Tarea 2"
  y "arreglar cosas" no cuentan. Un lector externo debe entender qué falla.
- **Cada issue tiene criterios de aceptación verificables.** Si no se puede
  decidir objetivamente si está hecho, faltan criterios.
- **La taxonomía discrimina.** Si el 80% de los issues llevan las mismas tres
  labels, la taxonomía no aporta información.
- **Las prioridades reflejan una decisión.** Todo en `prio:alta` es lo mismo que
  no priorizar.
- **Los cierres usan la razón correcta.** *Not planned* para duplicados y
  descartes; *completed* solo para lo que se hizo.

## 💡 Adaptación a tu dominio

| Dominio | Áreas (`area:`) | Ejemplo de bug creíble |
|---------|-----------------|------------------------|
| 📖 Biblioteca | `prestamos`, `socios`, `catalogo` | "Devolver el mismo día genera multa" |
| 🏋️ Gimnasio | `reservas`, `socios`, `clases` | "Se puede reservar una clase con el aforo lleno" |
| 🎥 Cine | `butacas`, `funciones`, `ventas` | "Dos compras simultáneas cogen el mismo asiento" |
| 💊 Farmacia | `inventario`, `lotes`, `ventas` | "No avisa de lotes que caducan esta semana" |
| 🛠️ Taller | `ordenes`, `piezas`, `clientes` | "El historial no muestra las piezas sustituidas" |

## 🚦 Cómo entregarlo

```bash
./scripts/verificar-semana.sh 03 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Errores comunes

| Error | Por qué pasa | Solución |
|-------|--------------|----------|
| El formulario no aplica labels | La label no existía al crear el form | Crea las labels primero |
| El selector de plantillas no aparece | Los archivos no están en la rama por defecto | Haz push a `main` |
| Issues sin label tras el triage | Se respondió sin clasificar | `gh issue list --search "is:open no:label"` |
| El milestone no acepta issues | El título no coincide exactamente | Cópialo de la API |
| 12 issues creados en 5 minutos, todos vacíos | Se cumplió el número, no el objetivo | Reescríbelos: el backlog es tuyo |
| Sub-issues que no muestran progreso | Se enlazaron por mención, no como sub-issue | Añádelas desde la barra lateral del épico |
