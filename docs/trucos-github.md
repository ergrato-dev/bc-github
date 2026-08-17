# 🎩 Trucos de GitHub

Cheatsheet acumulativo del bootcamp. Cada sección corresponde a la de
`## 🎩 Trucos y atajos` de su semana, y crece a medida que avanzas.

Criterio de admisión: ahorra tiempo real o revela algo que la interfaz esconde.
Los consejos genéricos de productividad no entran.

---

## Atajos de teclado (funcionan en casi toda la interfaz)

| Tecla | Qué hace |
|-------|----------|
| `s` o `/` | Foco en la búsqueda |
| `.` | Abre el repositorio en `github.dev` (VS Code en el navegador) |
| `y` | Convierte la URL del archivo en un permalink por SHA |
| `b` | Abre el `blame` del archivo que estás viendo |
| `t` | Buscador de archivos dentro del repositorio |
| `l` | Ir a una línea |
| `g` + `c` / `g` + `i` / `g` + `p` | Ir a Code / Issues / Pull requests |
| `Ctrl` + `.` | Insertar una respuesta guardada en un comentario |
| `?` | Lista todos los atajos de la página actual |

## URLs que la interfaz no enseña

| URL | Qué da |
|-----|--------|
| `?plain=1` | El Markdown en crudo, sin renderizar |
| `#L10-L20` | Un rango de líneas |
| `.diff` / `.patch` sobre un PR o commit | El diff en texto plano |
| `/compare/v1.0...main` | Diff entre dos puntos cualesquiera |
| `/issues?q=...` | Cualquier búsqueda, compartible |
| `raw.githubusercontent.com/...` | El archivo sin la interfaz |

---

## Semana 01 — Git repaso y setup pro

→ [Semana 01](../bootcamp/week-01-git_repaso_y_setup_pro/README.md)

| Truco | Cómo |
|-------|------|
| `reflog` es tu deshacer universal | `git reflog` guarda 90 días de todo movimiento de `HEAD` |
| Conflictos que se resuelven solos la segunda vez | `git config --global rerere.enabled true` |
| `push` sin `--set-upstream` | `git config --global push.autoSetupRemote true` |
| Commits de arreglo que se colocan solos | `git commit --fixup <sha>` + `git rebase -i --autosquash` |
| Deshacer un rebase entero | `git reset --hard ORIG_HEAD` |
| Diff que no miente cuando mueves código | `git config --global diff.colorMoved zebra` |
| Conflictos con el ancestro común a la vista | `git config --global merge.conflictStyle zdiff3` |
| Dos ramas abiertas sin `stash` | `git worktree add ../hotfix main` |
| Buscar cuándo apareció un texto | `git log -S "calcularMulta" --oneline` |
| Historia de una función concreta | `git log -L :calcularMulta:src/index.ts` |
| Bisect sin intervención | `git bisect start HEAD v1.0 && git bisect run npm test` |
| Abrir en el navegador lo que estás mirando | `gh browse src/index.ts` |
| Firmar sin GPG | `gpg.format = ssh`, y sube la clave **dos veces** (auth y signing) |
| Auditar qué commits van firmados | `gh api repos/{owner}/{repo}/commits --jq '.[] \| .commit.verification.verified'` |
| Ver tu rate limit | `gh api rate_limit --jq '.rate'` |
| Alias de `gh` | `gh alias set prs 'pr list --author @me'` |

## Semana 02 — El repositorio como producto

→ [Semana 02](../bootcamp/week-02-repositorio_como_producto/README.md)

| Truco | Cómo |
|-------|------|
| Ver el Markdown en crudo | `?plain=1` al final de la URL |
| Permalink que no se rompe | Pulsa `y`: la rama pasa a SHA. Pegado en un issue, incrusta el código |
| Editor completo en el navegador | Pulsa `.` en cualquier repositorio |
| Diagramas versionados | Bloque ` ```mermaid ` en cualquier `.md` |
| Avisos con severidad | `> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]` |
| Ignorar algo solo en tu máquina | `.git/info/exclude` |
| Por qué se ignora un archivo | `git check-ignore -v ruta` |
| Atributos efectivos de un archivo | `git check-attr -a ruta` |
| Arreglar los EOL de todo el repo | `git add --renormalize .` |
| Sacar generados de las estadísticas | `dist/* linguist-generated=true` |
| `blame` sin el ruido de un reformateo | `.git-blame-ignore-revs` en la raíz: GitHub lo respeta solo |
| Auditar una organización entera | `org:tu-org path:.github/workflows content:pull_request_target` |
| Búsqueda con regex | `/permissions:\s*write-all/` en la búsqueda de código |
| Comunidad centralizada | Un repo llamado `.github` da plantillas a todos tus repositorios |
| Perfil de comunidad en un comando | `gh api repos/{owner}/{repo}/community/profile --jq .health_percentage` |
| Pages sin sorpresas | `.nojekyll` evita que se ignoren carpetas que empiezan por `_` |

## Semana 03 — Issues y triage

→ [Semana 03](../bootcamp/week-03-issues_y_triage/README.md)

| Truco | Cómo |
|-------|------|
| Autocompletar issues | Escribe `#` y el número o el título en cualquier caja |
| Cerrar issues desde el PR | `Fixes #12` / `Closes #12` / `Resolves #12` |
| Cerrar issues de otro repo | `Fixes owner/repo#12` |
| Convertir un comentario en issue | Menú `···` → *Reference in new issue* |
| Etiquetar por lote | `gh issue list --json number --jq '.[].number' \| xargs -I{} gh issue edit {} --add-label triage` |
| Encontrar lo que nadie ha mirado | `is:issue is:open no:assignee no:label sort:created-asc` |
| Forzar el uso de plantillas | `blank_issues_enabled: false` en `config.yml` |
| Desviar las dudas fuera de Issues | `contact_links` hacia Discussions |
| Respuestas guardadas | `Settings → Saved replies`, se insertan con `Ctrl` + `.` |

---

> Las secciones de las semanas 04 a 21 se añaden a medida que se publica cada
> semana. Si has hecho una semana y su sección no está aquí,
> [abre un issue](https://github.com/ergrato-dev/bc-github/issues).
