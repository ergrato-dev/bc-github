# `gh` CLI y credenciales

> La UI de GitHub cambia cada trimestre. `gh` y la API no. Todo lo que aprendas
> aquí sigue funcionando dentro de tres años.

## 🎯 Objetivos

- Operar GitHub desde la terminal con `gh`
- Consultar cualquier endpoint de la API sin escribir código
- Elegir el tipo de credencial correcto para cada situación
- Entender por qué un token de más scope es un riesgo, no una comodidad

## 1. Qué problema resuelve

Todo lo que haces con clics es una llamada a la API. `gh` te da esa API con
autenticación resuelta, y con ella puedes automatizar, auditar y repetir. Además
es la única forma honesta de documentar un flujo: una ruta de menú caduca, un
comando no.

## 2. `gh` en cinco minutos

```bash
gh auth login          # SSH o HTTPS, navegador o token
gh auth status         # cuenta activa y scopes
gh repo create mi-repo --public --clone
gh repo view --web     # abre el repo actual en el navegador
gh issue list --state open --limit 10
gh pr create --fill    # usa los commits como título y cuerpo
gh pr checkout 42      # trae el PR #42 a una rama local
gh run watch           # sigue en vivo el workflow que acabas de disparar
gh browse src/index.ts # abre ese archivo, en tu rama, en el navegador
```

Dentro de un repositorio clonado, `gh` deduce el repo. Fuera, se lo indicas con
`--repo OWNER/REPO`.

### `gh api`: el comodín

Cuando no hay subcomando, está `gh api`:

```bash
gh api user --jq .login
gh api repos/{owner}/{repo} --jq '.stargazers_count'
gh api repos/{owner}/{repo}/labels --jq '.[].name'
```

`{owner}` y `{repo}` los rellena `gh` con el repositorio actual.

Flags que se usan a diario:

| Flag | Para qué |
|------|----------|
| `--jq '<expr>'` | Filtra la respuesta con `jq` sin tubería |
| `--paginate` | Recorre todas las páginas y las concatena |
| `--method POST` | Escribir en vez de leer |
| `-f campo=valor` | Campo string en el cuerpo |
| `-F campo=valor` | Campo tipado (números, booleanos, variables GraphQL) |
| `--include` | Muestra las cabeceras (rate limit, ETag) |

```bash
# Todos los issues cerrados, de todas las páginas, solo título y fecha
gh api --paginate 'repos/{owner}/{repo}/issues?state=closed' \
  --jq '.[] | "\(.closed_at[0:10]) \(.title)"'
```

Y GraphQL cuando REST no llega (Projects v2, Discussions, sub-issues):

```bash
gh api graphql -f query='query { viewer { login createdAt } }'
```

## 3. Los cuatro tipos de credencial

Este es el mapa que hay que memorizar:

| Credencial | Vive | Alcance | Cuándo |
|------------|------|---------|--------|
| **`GITHUB_TOKEN`** | Solo durante un job de Actions | El repo del workflow, con los `permissions` que declares | Siempre que estés dentro de un workflow |
| **Fine-grained PAT** | Hasta su caducidad | Repos concretos, permisos concretos | Scripts locales, automatización personal |
| **PAT clásico** | Hasta que lo revoques | **Todo lo que tú puedes hacer** | Solo si algo no soporta fine-grained |
| **GitHub App** | Token de instalación, ~1 h | Los repos instalados, permisos declarados | Automatización de equipo/organización |

Orden de preferencia: **App > `GITHUB_TOKEN` > fine-grained > clásico**.

### `GITHUB_TOKEN`

Se inyecta solo en cada job. No lo creas ni lo guardas:

```yaml
permissions:
  contents: read
  issues: write
```

Por defecto tiene los permisos que configure el repo — que pueden ser de
escritura. Declararlos explícitamente en cada workflow es la práctica correcta
(Semana 11).

### Fine-grained PAT

`Settings → Developer settings → Personal access tokens → Fine-grained tokens`

- Caducidad **obligatoria**: ponla corta (30-90 días)
- Selecciona **solo los repos** que necesita
- Permisos por recurso (`Contents: read`, `Issues: write`), no scopes globales

### PAT clásico

Un solo scope, `repo`, da acceso de lectura y escritura a **todos** tus repos
privados. Si se filtra, se filtró todo. Úsalo solo donde no haya alternativa, y
con caducidad.

> [!WARNING]
> Nunca pongas un token en la línea de comandos (`curl -H "Authorization: token
> ghp_..."`): queda en el historial del shell, en los logs y en las capturas.
> Usa `gh api`, que gestiona la credencial por ti.

## 4. Scopes: pedir lo mínimo

```bash
gh auth status                       # qué scopes tienes ahora
gh auth refresh -s workflow,read:org # añade solo lo que falte
```

Para este bootcamp: `repo`, `read:org`, `workflow`, `gist`. Nada más hasta que
algo falle con 403 — y entonces añades **ese** scope, no todos.

## 5. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| PAT clásico con todos los scopes | Una filtración compromete tu cuenta entera | Fine-grained acotado a un repo |
| Tokens sin caducidad | Un secreto eterno es un secreto que se olvida | Caducidad de 30-90 días |
| Token en `.env` commiteado | Repo público = token público en segundos | Gestor de secretos o `gh` |
| PAT dentro de un workflow | `GITHUB_TOKEN` ya está ahí | Usa `GITHUB_TOKEN` y declara `permissions` |
| Compartir un PAT en el equipo | No sabes quién hizo qué | GitHub App con permisos propios |
| Volcar `gh api` sin `--jq` | 300 líneas de JSON para leer un campo | `--jq` desde el principio |

## 6. Trucos

- **Alias de `gh`**: `gh alias set prs 'pr list --author @me'` → luego `gh prs`
- **`@me` funciona en las búsquedas**: `gh issue list --assignee @me`
- **Ver tu rate limit**: `gh api rate_limit --jq '.rate'`
- **Clonar y entrar en un paso**: `gh repo clone OWNER/REPO -- --depth=1`
- **Editar el repo sin abrir el navegador**:
  `gh repo edit --description "..." --add-topic bootcamp`
- **Ver el JSON completo que devuelve un subcomando**: `gh pr view 42 --json`
  (sin argumento, lista todos los campos disponibles)
- **`gh` en un script**: `GH_TOKEN` como variable de entorno lo autentica sin
  `gh auth login` — útil dentro de Actions
- **Extensiones**: `gh extension install dlvhdr/gh-dash` te da un panel de PRs e
  issues en la terminal. Escribirás la tuya en la Semana 15

## 📚 Recursos Adicionales

- [Manual de `gh`](https://cli.github.com/manual/)
- [GitHub Docs — Tipos de tokens](https://docs.github.com/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)
- [GitHub Docs — REST API](https://docs.github.com/rest)

## ✅ Checklist de Verificación

- [ ] `gh auth status` muestra tu cuenta y los scopes esperados
- [ ] Sabes leer un campo concreto de la API con `gh api ... --jq`
- [ ] Puedes explicar cuándo NO usar un PAT clásico
- [ ] Tienes al menos un alias de `gh` configurado
- [ ] `gh api rate_limit` te responde
