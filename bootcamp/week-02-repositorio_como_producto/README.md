# Semana 02 — El repositorio como producto

> Un repositorio no es una carpeta con código: es la interfaz por la que otra
> persona decide si usa tu proyecto o cierra la pestaña.

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
├── 1-teoria/
│   ├── 01-anatomia-de-un-repo.md        # Archivos especiales, repo .github, CODEOWNERS, ajustes
│   ├── 02-readme-y-documentacion.md     # Embudo, badges, docs/ vs wiki vs Pages
│   ├── 03-markdown-gfm.md               # Alerts, Mermaid, colapsables, permalinks, HTML
│   ├── 04-licencias.md                  # Elegir licencia, SPDX, dependencias, DCO/CLA
│   ├── 05-gitignore-y-gitattributes.md  # Ignorar, EOL, linguist, diff y merge drivers
│   ├── 06-busqueda-de-codigo.md         # Calificadores, regex, gh search, auditorías
│   └── 07-blame-e-historia.md           # blame, ignore-revs, compare, Insights
├── 2-practicas/
│   ├── 01-readme-que-se-lee.md          # README de embudo + comunidad al 100%
│   ├── 02-gitattributes-y-codeowners.md # EOL, linguist y enrutado de revisores
│   ├── 03-markdown-avanzado.md          # Mermaid, alerts, permalinks
│   └── 04-pages-en-un-clic.md           # Publicar en GitHub Pages
├── 3-proyecto/README.md                 # Tu repositorio, presentable
├── 0-assets/01-anatomia-repositorio.svg
├── 4-recursos/ · 5-glosario/
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [01-anatomia-de-un-repo.md](1-teoria/01-anatomia-de-un-repo.md) | Archivos especiales, repo `.github`, `CODEOWNERS`, ajustes, community profile | 25 min |
| [02-readme-y-documentacion.md](1-teoria/02-readme-y-documentacion.md) | README de embudo, badges, dónde vive la doc, GitHub Pages | 25 min |
| [03-markdown-gfm.md](1-teoria/03-markdown-gfm.md) | Alerts, Mermaid, colapsables, permalinks, qué HTML sobrevive | 25 min |
| [04-licencias.md](1-teoria/04-licencias.md) | Permisiva vs copyleft, SPDX, dependencias, DCO y CLA | 20 min |
| [05-gitignore-y-gitattributes.md](1-teoria/05-gitignore-y-gitattributes.md) | Ignorar bien, EOL, `linguist`, diff y merge drivers | 25 min |
| [06-busqueda-de-codigo.md](1-teoria/06-busqueda-de-codigo.md) | Calificadores, regex, `gh search`, auditar una organización | 25 min |
| [07-blame-e-historia.md](1-teoria/07-blame-e-historia.md) | De la línea al PR, `.git-blame-ignore-revs`, `compare` | 20 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [01-readme-que-se-lee.md](2-practicas/01-readme-que-se-lee.md) | Reescribes tu README con estructura de embudo | 50 min |
| [02-gitattributes-y-codeowners.md](2-practicas/02-gitattributes-y-codeowners.md) | Normalizas EOL y enrutas revisores | 45 min |
| [03-markdown-avanzado.md](2-practicas/03-markdown-avanzado.md) | Diagrama Mermaid, alerts y colapsables | 40 min |
| [04-pages-en-un-clic.md](2-practicas/04-pages-en-un-clic.md) | Publicas el proyecto en GitHub Pages | 30 min |

### Proyecto

Tu repositorio pasa el **community profile** al 100%: README, LICENSE,
CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, topics y descripción.
→ [3-proyecto/README.md](3-proyecto/README.md)

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (7 archivos) | 2 h 45 min |
| Prácticas (4) | 2 h 45 min |
| Proyecto | 2 h |
| Revisión y verificación | 30 min |
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
