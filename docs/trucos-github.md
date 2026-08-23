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
| Bisect sin intervención | `git bisect start HEAD v1.0 && git bisect run pnpm test` |
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

## Semana 04 — Projects v2: fundamentos

→ [Semana 04](../bootcamp/week-04-projects_v2_fundamentos/README.md)

| Truco | Cómo |
|-------|------|
| Crear un project desde la terminal | `gh project create --owner @me --title "Mi tablero"` |
| Ver el número de tus projects | `gh project list --owner @me` |
| Los IDs internos que pide GraphQL | `gh project view <n> --owner @me --format json` |
| Añadir el backlog existente por lote | `gh issue list --json url --jq '.[].url' \| xargs -I{} gh project item-add <n> --owner @me --url {}` |
| Sprint actual sin mantenimiento | `iteration:@current` (también `@previous` y `@next`) |
| Encontrar el trabajo huérfano | `is:open no:assignee no:iteration` |
| Una vista, no un project nuevo | Para ver lo mismo de otra forma se duplica la **vista** |
| Reordenar las columnas del tablero | Se reordenan las **opciones del campo**, no la vista |
| Slicing en vez de una vista por área | Panel lateral *Slice* por `Area` |
| Editar en masa | La vista de tabla acepta selección múltiple y pegado |
| Convertir una nota en issue | Un draft se convierte en issue conservando los campos |
| Crear item rápido | Pulsa `c` dentro del project |

## Semana 05 — Projects v2: automatización y métricas

→ [Semana 05](../bootcamp/week-05-projects_v2_automatizacion_y_metricas/README.md)

| Truco | Cómo |
|-------|------|
| `GITHUB_TOKEN` no vale para Projects | Necesitas PAT fine-grained con `Projects: Read and write` en **Account permissions** |
| Añadir sin duplicar | `addProjectV2ItemById` es idempotente |
| Los IDs, en `vars`; el token, en `secrets` | `gh variable set PROJECT_ID` · `gh secret set PROJECT_TOKEN` |
| Probar un workflow sin esperar al cron | Añade `workflow_dispatch:` y lanza `gh workflow run <archivo>` |
| Relanzar solo lo que falló | `gh run rerun <id> --failed` |
| Lead time en una línea | `--json createdAt,closedAt` + `((.closedAt\|fromdate) - (.createdAt\|fromdate)) / 86400` |
| Mediana, no media | Un issue olvidado destroza la media; usa `sort \| .[length/2 \| floor]` |
| Excluir descartes de las métricas | `select(.stateReason != "not_planned")` |
| El rate limit de GraphQL va por puntos | `gh api graphql -f query='{ rateLimit { cost remaining } }'` |
| Exportar una vista a CSV | Vista de tabla → `···` → *Export view data* |
| El informe es un issue | Queda fechado, se comenta y se busca. Etiquétalo `type:informe` |
| Los `schedule` mueren a los 60 días | Sin actividad en el repo se desactivan solos |

## Semana 06 — Pull requests a fondo

→ [Semana 06](../bootcamp/week-06-pull_requests_a_fondo/README.md)

| Truco | Cómo |
|-------|------|
| Traer un PR a local | `gh pr checkout 42` — también con PRs de forks |
| Diff sin ruido de espacios | `?w=1` en la URL del PR |
| El diff en texto plano | `.diff` o `.patch` al final de la URL |
| Sugerencia aplicable | Bloque ` ```suggestion ` en un comentario de línea |
| Sugerencia multilínea | Selecciona el rango en el diff antes de comentar |
| Una notificación, no quince | *Start a review* en vez de *Add single comment* |
| Severidad en el comentario | `bloqueante:` · `sugerencia:` · `nit:` |
| Solo lo nuevo desde tu última revisión | *Files changed* → *Changes since your last review* |
| Qué archivos toca | `gh pr diff 42 --name-only` |
| Crear el PR con la descripción hecha | `gh pr create --fill` reutiliza tus mensajes de commit |
| Auto-merge | `gh pr merge 42 --auto --squash` |
| Draft y vuelta atrás | `gh pr ready 42` · `gh pr ready --undo 42` |
| Ver por qué no se puede mergear | `gh pr view 42 --json mergeable,mergeStateStatus` |
| Commit de squash con el título del PR | `gh repo edit --squash-merge-commit-message pr-title-description` |
| Reordenar una pila | `git rebase --onto origin/main <base-vieja> <tu-rama>` |
| Conflictos con el ancestro a la vista | `git config --global merge.conflictStyle zdiff3` |

## Semana 07 — Code review y convenciones

→ [Semana 07](../bootcamp/week-07-code_review_y_convenciones/README.md)

| Truco | Cómo |
|-------|------|
| Severidad en los comentarios | `bloqueante:` · `sugerencia:` · `nit:` |
| Pregunta en vez de ordenar | "¿qué pasa si `dias` es negativo?" abre conversación |
| Breaking change | `feat!:` o `BREAKING CHANGE:` en el footer — mejor ambos |
| Scope del dominio, no del archivo | `feat(prestamos):`, no `feat(index-js):` |
| Hooks que sí se comparten | `.githooks/` + `git config core.hooksPath .githooks` |
| Con squash, valida el título del PR | Es el mensaje que acaba en `main` |
| Revalidar sin commits | El tipo `edited` en `on: pull_request` |
| Avisar sin fallar el job | `echo "::warning::..."` |
| Nunca interpoles texto de usuario en `run:` | Pásalo por `env:` — inyección de comandos |
| CODEOWNERS: gana la última regla | General arriba, excepciones abajo |
| Comprobar CODEOWNERS | `gh api repos/{owner}/{repo}/codeowners/errors --jq '.errors'` |
| Rama desde el issue | Barra lateral del issue → *Create a branch* |
| Limpiar ramas mergeadas | `git fetch -p && git branch --merged main \| grep -v main \| xargs -r git branch -d` |
| Ramas por antigüedad | `git for-each-ref --sort=committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)'` |
| Cuántos commits incumplen | `git log --oneline -50 \| grep -vcE '^[a-f0-9]+ (feat\|fix\|docs\|chore)'` |

---

## Semana 08 — Gobernanza: rulesets y merge queue

→ [Semana 08](../bootcamp/week-08-gobernanza_rulesets_y_merge_queue/README.md)

| Truco | Cómo |
|-------|------|
| Reglas efectivas de una rama | `gh api repos/{owner}/{repo}/rules/branches/main --jq '[.[].type]'` |
| El borrador que sí tienes | `enforcement: disabled` — `evaluate` requiere Enterprise |
| Los rulesets se apilan | Varios pueden aplicar a la vez; se suman, no se sustituyen |
| Versiona la gobernanza | El JSON en `.github/rulesets/`, y se envía con `--input` |
| Exportar un ruleset limpio | `gh api repos/{owner}/{repo}/rulesets/<id> --jq 'del(.id, .node_id, .created_at, .updated_at, .source, .source_type, ._links)'` |
| El `context` es el `name:` del job | Léelo con `gh pr checks --json name`, no lo deduzcas |
| Trabajando solo, aprobaciones a 0 | Con 1, GitHub no te deja aprobar tu propio PR |
| Escape sin bypass | `disabled` → arreglas → `active`: queda en el historial |
| Bypass para el bot, no para ti | Un `always` para tu usuario invalida el ruleset |
| Antes de exigir firmas | `git log -1 --format='%G?'` tiene que devolver `G` |
| El ruleset tiene historial | `gh api repos/{owner}/{repo}/rulesets/<id>/history` |
| Rule suites, el log del ruleset | `gh api repos/{owner}/{repo}/rulesets/rule-suites` |
| Tu ID numérico | `gh api user --jq .id` — lo piden bypass actors y environments |
| Reglas de todos tus environments | `gh api repos/{owner}/{repo}/environments --jq '.environments[] \| {name, reglas: [.protection_rules[].type]}'` |
| `PUT` de environment reemplaza | Manda el objeto completo o pierdes los revisores |
| Secretos por la entrada estándar | `printf '<valor>' \| gh secret set NOMBRE --env production` |
| Aprobar un despliegue por API | `POST repos/{owner}/{repo}/actions/runs/<id>/pending_deployments` |
| Las ramas `gh-readonly-queue/*` | Son del merge queue: no las toques ni las protejas |
| Sin push rules, check requerido | Un workflow que falla + `required_status_checks` |

---

## Semana 09 — Actions: fundamentos

→ [Semana 09](../bootcamp/week-09-actions_fundamentos/README.md)

| Truco | Cómo |
|-------|------|
| Ver solo lo que falló | `gh run view <id> --log-failed` — el primer reflejo, siempre |
| Relanzar solo los jobs rotos | `gh run rerun <id> --failed` |
| Seguir la ejecución en vivo | `gh run watch` |
| Logs de depuración | Variable de repositorio `ACTIONS_STEP_DEBUG=true` — y borrarla al acabar |
| Ver el payload del evento | `jq . "$GITHUB_EVENT_PATH"` dentro de un step |
| Depurar un context entero | `${{ toJSON(needs) }}` pasado por `env:` |
| Resumen bonito del run | `echo "..." >> "$GITHUB_STEP_SUMMARY"` acepta Markdown y tablas |
| Pasar datos entre steps | `echo "clave=valor" >> "$GITHUB_OUTPUT"` (el step necesita `id:`) |
| Empezar por lo mínimo | `permissions: {}` y añadir solo lo que falle |
| Tuberías que no mienten | `shell: bash` fuerza `pipefail`: sin él, un test rojo sale en verde |
| Ningún run zombi | `timeout-minutes: 10` — el defecto son 6 horas |
| Cancelar runs viejos del mismo PR | `concurrency` con `cancel-in-progress: true` |
| Matriz que no aborta al primer fallo | `strategy.fail-fast: false` |
| Check estable con matriz variable | Job agregador con `needs` y nombre fijo |
| Caché que nunca acierta | La `key` debe llevar `hashFiles('**/lockfile')` |
| Ver y borrar cachés | `gh cache list` · `gh cache delete --all` |
| Reactivar un `schedule` dormido | `gh workflow enable <archivo>` |

---

## Semana 10 — Actions: reutilización y actions propias

→ [Semana 10](../bootcamp/week-10-actions_reutilizacion_y_actions_propias/README.md)

| Truco | Cómo |
|-------|------|
| La regla del tercer uso | Escribes, copias, y a la tercera factorizas |
| Empieza dentro del repositorio | `./.github/actions/<nombre>`: sin publicar ni versionar |
| Una action local necesita `checkout` antes | Si no, `Can't find 'action.yml'` |
| Nombres de check al anidar | Pasan a ser `llamador / job (matriz)` |
| Agregador honesto | `if: always()` **más** comprobar `needs.<job>.result` a mano |
| El job que llama no lleva `runs-on` | Solo `uses`, `with`, `secrets`, `needs`, `if`, `permissions`, `strategy` |
| `env:` no se hereda al reusable | Lo que necesite, como `input` |
| Los permisos solo se reducen | Si el reusable necesita `write`, lo concede el llamador |
| `shell:` obligatorio en composite | Es el fallo número uno, y el error no lo dice claro |
| Los inputs son cadenas | `if: ${{ inputs.x == 'true' }}`, nunca contra el booleano |
| Sin `secrets` en composite | El token se pasa como input explícito |
| Scripts propios de una action | `${{ github.action_path }}/scripts/x.sh` |
| Sin dependencias, sin empaquetador | `main: src/index.mjs`; con toolkit hace falta `dist/` |
| Comprobar que `dist/` está al día | Rebuild en CI + `git diff --quiet dist` |
| Autoprueba de una action | `uses: ./` en su propio workflow, en los tres sistemas |
| El SHA de un tag | `gh api repos/OWNER/REPO/tags --jq '.[] \| select(.name=="v1") \| .commit.sha'` |
| Tag mayor móvil | `git tag -f -a v1 -m "v1 → v1.2.3" && git push -f origin v1` |
| Nunca muevas `v1.2.3` | Rompe los builds de quien la tenga pinneada por SHA |
| Notas de release automáticas | `gh release create v1.0.0 --generate-notes` |
| Deprecar un input sin romper | `deprecationMessage:` y retirarlo en la versión mayor |

---

## Semana 11 — Actions: seguridad, entornos y CD

→ [Semana 11](../bootcamp/week-11-actions_seguridad_entornos_y_cd/README.md)

| Truco | Cómo |
|-------|------|
| Auditar las políticas del repositorio | `gh api repos/{owner}/{repo}/actions/permissions` y sus tres hermanas |
| La red que salva del olvido | `default_workflow_permissions=read`: el workflow sin `permissions:` nace de lectura |
| Que ningún bot apruebe PR | `can_approve_pull_request_reviews=false` |
| Encontrar lo que no está pinneado | `grep -rn "uses:" .github \| grep -v "@[0-9a-f]\{40\}"` |
| El SHA de un tag | `gh api repos/OWNER/REPO/tags --jq '.[] \| select(.name=="v1") \| .commit.sha'` |
| Hacer obligatorio el pinning | `-F sha_pinning_required=true` — pinnea antes, activa después |
| Actions del propio repo sin `checkout` | `uses: $/.github/actions/<nombre>` (julio 2026, runner 2.336.0+) |
| Los reusable workflows quedan fuera de esa política | Siguen admitiendo tags |
| Enmascarar un valor generado en el run | `echo "::add-mask::$VALOR"` **antes** de usarlo |
| Comprobar un secreto sin imprimirlo | `[ -z "$TOKEN" ] && exit 1` |
| Rotar antes de limpiar | Revocar, reemitir, comprobar y **luego** borrar logs |
| Ver tus claims OIDC | Pedir el token y volcar el payload al `$GITHUB_STEP_SUMMARY` |
| El claim que vale oro | `environment`: solo existe si el job pasó por la puerta |
| Condición de confianza estrecha | `sub: repo:OWNER/REPO:environment:production`, nunca con `*` |
| Consultar el formato de tu `sub` | `gh api repos/{owner}/{repo}/actions/oidc/customization/sub` |
| Aprobar un despliegue sin navegador | `POST .../actions/runs/<id>/pending_deployments` con `state=approved` |
| Saber si puedes aprobar tú | El campo `current_user_can_approve` de ese endpoint |
| Despliegues que no se pisan | `concurrency` con `cancel-in-progress: false` |
| Rollback en un comando | `gh run rerun <id-del-run-bueno>` |
| Cuánto dura tu rollback rápido | `gh api repos/{owner}/{repo}/actions/permissions/artifact-and-log-retention` |
| Frecuencia de despliegue | `gh api --paginate "repos/{owner}/{repo}/deployments?environment=github-pages" --jq 'length'` |
| Comprobar que no hay runners propios | `gh api repos/{owner}/{repo}/actions/runners --jq .total_count` |
| Analizar los workflows antes del push | `actionlint` para sintaxis, `zizmor` para seguridad |

---

## Semana 12 — Releases y packages

→ [Semana 12](../bootcamp/week-12-releases_y_packages/README.md)

| Truco | Cómo |
|-------|------|
| Saber si un tag es anotado | `git cat-file -t v1.0.0` — `tag` sí, `commit` no |
| Firmar también los tags | `git config --global tag.gpgSign true` |
| Empujar solo los tags que viajan | `git push --follow-tags`, no `--tags` |
| Abortar si el tag no existe en remoto | `gh release create v1.0.0 --verify-tag` |
| Previsualizar las notas sin crear nada | `gh api repos/{owner}/{repo}/releases/generate-notes --method POST -f tag_name=vX --jq .body` |
| Cambiar el punto de partida de las notas | `--notes-start-tag v1.0.0` |
| Anteponer un resumen a lo generado | `--generate-notes` **más** `--notes-file` |
| Montar el release antes de publicarlo | `--draft`, `gh release upload`, `--draft=false` |
| Radiografía del estado de publicación | `gh release list --json tagName,isLatest,isDraft` |
| Cerrar el candado | `gh api repos/{owner}/{repo}/immutable-releases --method PUT` |
| Borrar release y tag a la vez | `gh release delete v1.0.0 --cleanup-tag` |
| Ordenar tags como versiones | `git tag --sort=-v:refname` |
| Forzar la versión que calcula release-please | `Release-As: 1.5.0` en el cuerpo del commit |
| Encadenar solo cuando publica | `if: needs.release.outputs.publicado == 'true'` (cadena, con comillas) |
| Un release del `GITHUB_TOKEN` no dispara workflows | Por eso `release-please` usa un token de usuario |
| El PR de release, con squash | Los commits de `release-please` no van firmados; el squash lo firma GitHub |
| Etiquetas de imagen desde el tag | `type=semver,pattern={{version}}` en `docker/metadata-action` |
| No quedarse sin etiquetas | `type=sha` siempre, porque `type=semver` calla si no hay tag |
| Vincular el paquete al repositorio | `LABEL org.opencontainers.image.source` |
| El paquete nace privado | Se cambia solo en la interfaz; se comprueba con `gh api users/{owner}/packages/...` |
| El scope que falta | `gh auth refresh -s read:packages` o todo `packages` da 403 |
| Comprobar que es público de verdad | `docker logout ghcr.io` y luego `docker pull` |
| Inspeccionar una imagen sin bajarla | `docker buildx imagetools inspect ghcr.io/OWNER/REPO:1.2.3` |
| `pnpm publish` en CI | `--no-git-checks`, o aborta por rama y árbol sucio |
| Ver qué entra en el paquete | `pnpm pack` y `tar -tzf ./*.tgz` |
| El sujeto de la atestación de una imagen | El digest del `build-push-action`, nunca la etiqueta |
| Verificación estrecha | `--signer-workflow OWNER/REPO/.github/workflows/x.yml` |
| Leer el JSON no es verificar | Solo `gh attestation verify` comprueba firmas |
| Retirar una versión sin borrarla | `gh release edit vX --prerelease` y publicar el arreglo |

---

> Las secciones de las semanas 13 a 21 se añaden a medida que se publica cada
> semana. Si has hecho una semana y su sección no está aquí,
> [abre un issue](https://github.com/ergrato-dev/bc-github/issues).
