# Semana 04 — Projects v2: fundamentos

> Projects v2 no es un tablero con columnas: es una base de datos de items con
> vistas encima. Entender eso cambia por completo cómo lo usas.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Explicar el modelo de datos de Projects v2: items, campos y vistas
- Crear campos personalizados, incluidas **iteraciones**
- Construir vistas de tabla, tablero y **roadmap**, con agrupación y filtros
- Escribir filtros que respondan preguntas concretas del proyecto
- Configurar los **workflows integrados** que mueven items solos
- Consultar tu project por **GraphQL**, que es su única API

## 📋 Prerrequisitos

- Semana 03 completada: backlog con 12+ issues etiquetados y un milestone
- `gh auth refresh -s read:project` — sin ese scope, GraphQL responde
  `INSUFFICIENT_SCOPES`

## 🗂️ Estructura de la Semana

```
week-04-projects_v2_fundamentos/
├── 1-teoria/
│   ├── 01-modelo-de-datos.md         # Items, campos, vistas: por qué no es un tablero
│   ├── 02-campos-e-iteraciones.md    # Tipos de campo, iteraciones, campos calculados
│   ├── 03-vistas-y-filtros.md        # Tabla, board, roadmap, agrupación, slicing
│   └── 04-workflows-integrados.md    # Automatización sin escribir código
├── 2-practicas/
│   ├── 01-crear-el-project.md        # Project, campos y primeros items
│   ├── 02-vistas-que-responden.md    # Una vista por pregunta real
│   ├── 03-iteraciones-y-roadmap.md   # Planificación temporal
│   └── 04-graphql-del-project.md     # Consultar el project por API
├── 3-proyecto/README.md              # El tablero de tu dominio
├── 0-assets/01-modelo-projects-v2.svg
├── 4-recursos/ · 5-glosario/
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [01-modelo-de-datos.md](1-teoria/01-modelo-de-datos.md) | Items, campos, vistas y por qué importa la diferencia | 30 min |
| [02-campos-e-iteraciones.md](1-teoria/02-campos-e-iteraciones.md) | Tipos de campo, iteraciones, buenas prácticas | 30 min |
| [03-vistas-y-filtros.md](1-teoria/03-vistas-y-filtros.md) | Vistas, agrupación, ordenación, sintaxis de filtros | 30 min |
| [04-workflows-integrados.md](1-teoria/04-workflows-integrados.md) | Automatización nativa y sus límites | 30 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [01-crear-el-project.md](2-practicas/01-crear-el-project.md) | Creas el project y sus campos | 45 min |
| [02-vistas-que-responden.md](2-practicas/02-vistas-que-responden.md) | Cuatro vistas, cuatro preguntas | 45 min |
| [03-iteraciones-y-roadmap.md](2-practicas/03-iteraciones-y-roadmap.md) | Iteraciones y planificación visual | 40 min |
| [04-graphql-del-project.md](2-practicas/04-graphql-del-project.md) | Consultas GraphQL sobre tu project | 40 min |

### Proyecto

Tu backlog pasa a estar **gestionado**: un Project v2 con campos propios,
iteraciones, cuatro vistas y todos los issues dentro.
→ [3-proyecto/README.md](3-proyecto/README.md)

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (4 archivos) | 2 h |
| Prácticas (4) | 2 h 50 min |
| Proyecto | 2 h 30 min |
| Revisión y verificación | 40 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Crear un project desde la terminal | `gh project create --owner @me --title "Mi tablero"` |
| Listar tus projects con su número | `gh project list --owner @me` |
| Añadir un issue sin salir de la terminal | `gh project item-add <n> --owner @me --url <url-del-issue>` |
| Un project, muchas vistas | No dupliques projects para ver lo mismo distinto: duplica la **vista** |
| Filtrar por iteración actual | `iteration:@current` — y `@previous` / `@next` |
| Filtrar por lo tuyo | `assignee:@me` funciona igual que en Issues |
| Campos vacíos | `no:assignee`, `no:iteration`, `no:estimate` para encontrar huecos |
| Agrupar por cualquier campo | Cambia `Group by` y el tablero se reorganiza; las columnas **son** un campo |
| Vista de tabla editable | Se edita como una hoja de cálculo, incluido pegar desde el portapapeles |
| Ver el ID interno de todo | `gh project view <n> --owner @me --format json` — necesario para GraphQL |
| Convertir una nota en issue | Un item de tipo *draft* se convierte en issue real sin perder los campos |
| Atajo de creación rápida | Pulsa `c` en un project para crear un item nuevo |

## 📌 Entregables

1. ✅ Un Project v2 con título descriptivo y descripción
2. ✅ Campos personalizados: prioridad, estimación y área
3. ✅ Un campo de iteración con al menos 3 iteraciones definidas
4. ✅ Cuatro vistas: tabla, tablero por estado, roadmap y "mi trabajo"
5. ✅ Todos los issues del repositorio añadidos al project
6. ✅ Al menos un workflow integrado activo

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 04 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 03: Issues y triage](../week-03-issues_y_triage/README.md) | **Semana 04: Projects v2 fundamentos** | [Semana 05: Projects v2 automatización y métricas →](../week-05-projects_v2_automatizacion_y_metricas/README.md) |
