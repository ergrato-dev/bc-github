# Semana 02 — El repositorio como producto

> Un repositorio no es una carpeta con código: es la interfaz por la que otra
> persona decide si usa tu proyecto o cierra la pestaña.

> [!NOTE]
> Contenido detallado en preparación. Esta semana ya tiene definidos objetivos,
> contenidos, tiempos, trucos y entregables.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Escribir un README con estructura de embudo (qué es → por qué → cómo → detalle)
- Elegir una licencia con criterio y saber qué obliga a quien te use
- Configurar `.gitignore` y `.gitattributes` (EOL, `linguist`, diff drivers)
- Enrutar revisores con `CODEOWNERS`
- Usar Markdown GFM a fondo: alerts, Mermaid, footnotes, colapsables, math
- Centralizar los archivos de comunidad en el repo `.github` de tu cuenta
- Buscar código, historia y culpables con la búsqueda avanzada y `blame`
- Publicar el repositorio en GitHub Pages

## 📋 Prerrequisitos

- Semana 01 completada: repo hilo conductor creado y con commits firmados

## 🗂️ Estructura de la Semana

```
week-02-repositorio_como_producto/
├── 1-teoria/     01-anatomia-de-un-repo · 02-markdown-gfm · 03-licencias
│                 04-busqueda-y-blame
├── 2-practicas/  01-readme-que-se-lee · 02-gitattributes-y-codeowners
│                 03-markdown-avanzado · 04-pages-en-un-clic
├── 3-proyecto/   La documentación de tu repositorio
├── 4-recursos/ · 5-glosario/
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| `01-anatomia-de-un-repo.md` | README, LICENSE, topics, community profile | 30 min |
| `02-markdown-gfm.md` | Alerts, Mermaid, footnotes, colapsables, permalinks | 30 min |
| `03-licencias-y-gitattributes.md` | Elegir licencia, EOL, linguist, `.gitignore` | 30 min |
| `04-busqueda-y-blame.md` | Sintaxis de búsqueda de código, `blame`, historia | 30 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| `01-readme-que-se-lee.md` | Reescribes tu README con estructura de embudo | 50 min |
| `02-gitattributes-y-codeowners.md` | Normalizas EOL y enrutas revisores | 45 min |
| `03-markdown-avanzado.md` | Diagrama Mermaid, alerts y colapsables | 40 min |
| `04-pages-en-un-clic.md` | Publicas el proyecto en GitHub Pages | 30 min |

### Proyecto

Tu repositorio pasa el **community profile** al 100%: README, LICENSE,
CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, topics y descripción.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (4 archivos) | 2 h |
| Prácticas (4) | 2 h 45 min |
| Proyecto | 2 h 30 min |
| Revisión y verificación | 45 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Ver el Markdown en crudo | Añade `?plain=1` a la URL del archivo |
| Permalink al commit actual | Pulsa `y` mirando un archivo: la URL pasa de rama a SHA y no se rompe nunca |
| Citar un rango de líneas | Selecciona líneas y pulsa `y`, o edita la URL con `#L10-L20` |
| Editor completo en el navegador | Pulsa `.` en cualquier repo: abre `github.dev` |
| Diagramas sin imágenes | Bloque ` ```mermaid ` en cualquier `.md`: GitHub lo renderiza |
| Avisos con estilo | `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]` |
| Ignorar un fichero solo en tu máquina | `.git/info/exclude` — no se commitea, no molesta al equipo |
| Ocultar generados del diff y del lenguaje | `*.min.js linguist-generated=true` en `.gitattributes` |
| `blame` sin el ruido de un reformateo | `git blame --ignore-revs-file .git-blame-ignore-revs` (GitHub lo respeta) |
| Buscar en toda la organización | `org:ergrato-dev path:*.yml permissions:` en la búsqueda de código |
| Perfil y comunidad centralizados | Un repo llamado `.github` da CONTRIBUTING y plantillas a todos tus repos |

## 📌 Entregables

1. ✅ README con estructura de embudo, badges y un diagrama Mermaid
2. ✅ LICENSE elegida con criterio y justificada en una línea del README
3. ✅ `.gitattributes` normalizando EOL y marcando generados
4. ✅ `CODEOWNERS` enrutando al menos una ruta
5. ✅ 3 o más topics y descripción en el repositorio
6. ✅ GitHub Pages publicado y accesible

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 02 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 01: Git repaso y setup pro](../week-01-git_repaso_y_setup_pro/README.md) | **Semana 02: El repositorio como producto** | [Semana 03: Issues y triage →](../week-03-issues_y_triage/README.md) |
