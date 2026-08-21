# `gh`: la CLI de GitHub

> La interfaz web cambia cada trimestre. `gh` y la API no. Todo lo que aprendas
> aquí sigue funcionando dentro de tres años, y además se puede pegar en un
> script.

## 🎯 Objetivos

- Autenticar `gh` y saber qué credencial está usando en cada momento
- Operar issues, PRs y workflows sin salir de la terminal
- Consultar **cualquier** endpoint REST o GraphQL con `gh api`
- Convertir salidas de `gh` en datos con `--json`, `--jq` y `--template`
- Ahorrar tecleo con alias y extensiones

## 1. Qué problema resuelve

Todo lo que haces con clics es una llamada a la API. `gh` te da esa API con la
autenticación resuelta y con salidas legibles. Con ella puedes automatizar,
auditar y repetir — y es la única forma honesta de documentar un flujo: una ruta
de menú caduca en seis meses, un comando no.

En este bootcamp `gh` no es un atajo: **es el instrumento de verificación**. Los
entregables se comprueban con `gh api`, no con capturas de pantalla.

## 2. Autenticación

```bash
gh auth login          # interactivo: HTTPS o SSH, navegador o token pegado
gh auth status         # cuenta activa, protocolo y scopes
gh auth token          # imprime el token en uso (cuidado con dónde)
gh auth refresh -s workflow,read:org   # añade scopes sin volver a empezar
gh auth setup-git      # usa gh como credential helper de git
gh auth switch         # cambia entre varias cuentas ya autenticadas
```

`gh auth login` guarda el token en el llavero del sistema cuando hay uno, y si no
en `~/.config/gh/hosts.yml`. En scripts y en CI no se usa `login`: se define la
variable de entorno **`GH_TOKEN`**, que tiene prioridad sobre todo lo demás.

```bash
GH_TOKEN="$MI_TOKEN" gh api user --jq .login
```

> [!WARNING]
> `gh auth token` escribe el token en la salida estándar: no lo ejecutes en una
> sesión que estés grabando, ni lo pases por la línea de comandos de otro
> proceso. Los tokens y sus tipos son la [Teoría 07](07-credenciales-y-tokens.md).

## 3. Los subcomandos del día a día

```bash
gh repo create mi-repo --public --clone
gh repo view --web                  # abre el repo actual en el navegador
gh repo edit --description "..." --add-topic bootcamp
gh repo set-default OWNER/REPO      # cuando el clon tiene varios remotos

gh issue list --state open --limit 10
gh issue create --title "..." --body "..." --label bug
gh issue view 17 --comments

gh pr create --fill                 # título y cuerpo a partir de los commits
gh pr checkout 42                   # trae el PR #42 a una rama local
gh pr status                        # los tuyos: abiertos, para revisar, con checks rojos
gh pr checks 42
gh pr merge 42 --squash --delete-branch

gh run list --limit 5
gh run watch                        # sigue en vivo el workflow que acabas de disparar
gh run view <id> --log-failed       # solo los pasos que fallaron

gh browse src/multa.ts              # ese archivo, en tu rama, en el navegador
gh search issues "is:open label:bug" --owner ergrato-dev
gh status                           # tu bandeja: menciones, reviews pendientes
```

Dentro de un repositorio clonado, `gh` deduce el repositorio. Fuera, se lo
indicas con `--repo OWNER/REPO` o con la variable `GH_REPO`.

## 4. `gh api`: el comodín

Cuando no hay subcomando —y en la mitad de esta plataforma no lo hay— está
`gh api`:

```bash
gh api user --jq .login
gh api repos/{owner}/{repo} --jq '.stargazers_count'
gh api repos/{owner}/{repo}/labels --jq '.[].name'
```

`{owner}` y `{repo}` los rellena `gh` con el repositorio actual: los comandos se
pueden copiar entre repos sin editar.

| Flag | Para qué |
|------|----------|
| `--jq '<expr>'` | Filtra la respuesta con `jq` sin tubería |
| `--paginate` | Recorre todas las páginas y concatena los resultados |
| `--method POST` (`-X`) | Escribir en vez de leer |
| `-f campo=valor` | Campo string en el cuerpo de la petición |
| `-F campo=valor` | Campo tipado: números, booleanos, `@archivo` |
| `--input <archivo>` | Cuerpo JSON completo desde un archivo (o `-` para stdin) |
| `--include` | Muestra también las cabeceras (rate limit, `ETag`) |
| `--cache 1h` | Cachea la respuesta en disco durante ese tiempo |
| `--hostname` | Contra un GitHub Enterprise Server |

```bash
# Todos los issues cerrados, de todas las páginas, solo fecha y título
gh api --paginate 'repos/{owner}/{repo}/issues?state=closed&per_page=100' \
  --jq '.[] | "\(.closed_at[0:10]) \(.title)"'

# Crear una etiqueta
gh api repos/{owner}/{repo}/labels --method POST \
  -f name='needs-triage' -f color='d93f0b' -f description='Sin clasificar'
```

### GraphQL, cuando REST no llega

Projects v2, Discussions y las sub-issues **solo** existen en GraphQL:

```bash
gh api graphql -f query='query { viewer { login createdAt } }'

gh api graphql -F owner=ergrato-dev -F repo=bc-github -f query='
  query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      issues(first: 5, states: OPEN) { nodes { number title } }
    }
  }'
```

Ojo al par de flags: en GraphQL las variables van con `-F` (tipadas) y la query
con `-f`. Se profundiza en las Semanas 05 y 16.

## 5. Salidas en JSON: `--json`, `--jq`, `--template`

Los subcomandos de listado tienen su propio modo máquina, que es más rápido que
`gh api` y no gasta la paciencia de nadie:

```bash
gh pr list --json number,title,author,createdAt
gh pr list --json number,title --jq '.[] | "\(.number) \(.title)"'
gh issue list --json number,title,labels \
  --template '{{range .}}{{.number}}\t{{.title}}{{"\n"}}{{end}}'
```

`gh pr view 42 --json` **sin argumento** lista todos los campos disponibles. Es
el atajo para no adivinar nombres de campo.

## 6. Configuración, alias y extensiones

```bash
gh config set editor "code --wait"
gh config set git_protocol ssh
gh config list
```

```bash
gh alias set prs 'pr list --author @me'
gh alias set bugs 'issue list --label bug --state open'
gh alias set --shell limpia 'git branch --merged | grep -v main | xargs -r git branch -d'
gh alias list
```

`@me` funciona en todos los filtros de `gh` y en la búsqueda de GitHub:
`gh issue list --assignee @me`.

```bash
gh extension install dlvhdr/gh-dash    # panel de PRs e issues en la terminal
gh extension list
gh extension upgrade --all
```

Una extensión es un repositorio con un ejecutable llamado `gh-<algo>`. Escribirás
la tuya en la Semana 15.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Documentar un flujo con rutas de menú | La interfaz cambia y la guía miente | Documenta el comando |
| Volcar `gh api` sin `--jq` | 300 líneas de JSON para leer un campo | `--jq` desde el principio |
| Recorrer páginas a mano con `?page=2` | Te dejas resultados sin enterarte | `--paginate` |
| `curl` con el token en la línea de comandos | Queda en el historial y en los logs | `gh api`, que gestiona la credencial |
| Parsear la salida de texto de `gh` con `grep`/`awk` | Se rompe en cuanto cambia el formato | `--json` + `--jq` |
| `gh auth login` dentro de un workflow | No hay navegador ni persona | `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` |
| Guardar el token en un script | Se commitea antes o después | Variable de entorno o el llavero |

## 8. Trucos

- **Ver tu límite de peticiones**: `gh api rate_limit --jq '.rate'`
- **Repetir una llamada cara sin gastar cuota**: `gh api --cache 10m <endpoint>`
- **Salida con colores dentro de una tubería**: `GH_FORCE_TTY=100% gh pr list | less -R`
- **Clonar poco profundo**: `gh repo clone OWNER/REPO -- --depth=1`
- **Abrir el PR asociado a tu rama actual**: `gh pr view --web`
- **Qué campos tiene un objeto**: `gh pr view 42 --json` sin más argumentos
- **Descubrir subcomandos que no sabías que existían**: `gh help` y
  `gh <comando> --help` — `gh cache`, `gh variable`, `gh secret`, `gh ruleset`,
  `gh label`, `gh project` salen ahí

## 📚 Recursos Adicionales

- [Manual de `gh`](https://cli.github.com/manual/)
- [GitHub Docs — REST API](https://docs.github.com/rest)
- [GitHub Docs — GraphQL API](https://docs.github.com/graphql)
- [`jq` — manual](https://jqlang.github.io/jq/manual/)

## ✅ Checklist de Verificación

- [ ] `gh auth status` muestra tu cuenta y los scopes esperados
- [ ] Sabes leer un campo concreto de la API con `gh api ... --jq`
- [ ] Has recorrido más de una página con `--paginate`
- [ ] Tienes al menos un alias de `gh` configurado
- [ ] Sabes cómo autenticar `gh` en un script sin `gh auth login`
