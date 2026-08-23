# `gh api` a fondo

> `gh api` es la navaja de esta semana: hace peticiones autenticadas sin que
> ningún token pase por tu historial de shell. Diez flags cubren el 100 % de lo
> que vas a necesitar, y tres de ellas son las que separan un comando que
> funciona de un guion que aguanta.

## 🎯 Objetivos

- Construir cualquier petición REST o GraphQL con `gh api`
- Distinguir `-f`, `-F` y `--input`, y saber cuándo cada uno rompe
- Dar forma a la salida con `--jq` y con `--template`, y saber cuál usar
- Leer cabeceras y códigos de estado sin salir del comando
- Depurar lo que `gh` manda por debajo con `GH_DEBUG=api`

## 1. Qué problema resuelve

`curl` contra la API de GitHub obliga a tres cosas incómodas: tener el token a
mano, escribir la URL base y las cabeceras de versión, y parsear la respuesta.
`gh api` resuelve las tres:

```bash
# ❌ El token queda en el historial del shell, y en los logs si esto va en CI
curl -H "Authorization: token <TOKEN>" https://api.github.com/repos/OWNER/REPO

# ✅ Toma el token del almacén de credenciales de gh, añade cabeceras y base
gh api repos/{owner}/{repo}
```

Y añade lo que de verdad hace falta en un guion: paginación, caché, plantillas y
un código de salida distinto de cero cuando la API responde con error.

## 2. La anatomía de una petición

```bash
gh api                       \
  repos/{owner}/{repo}/issues \  # endpoint (sin https://api.github.com)
  --method POST               \  # verbo; GET por defecto
  -f title='Auditoría'        \  # campo de tipo cadena
  -F labels[]=auditoria       \  # campo tipado
  -H "X-Custom: valor"        \  # cabecera extra
  --jq '.number'                 # filtro sobre la respuesta
```

Tres detalles que ahorran mucho tiempo:

- **El endpoint va sin dominio ni `/api/v3`.** `repos/cli/cli`, no la URL entera
- **`{owner}`, `{repo}` y `{branch}` son literales**: dentro de un repositorio
  clonado, `gh` los sustituye por los del remoto. Es lo que hace que un guion
  sirva en cualquier repositorio sin editarlo
- **Añadir cualquier campo cambia el método a `POST`.** Si querías un `GET` con
  query string, hay que decirlo: `--method GET -f q=...`

## 3. `-f`, `-F` y `--input`: la fuente de la mitad de los errores

| Flag | Qué hace | Cuándo |
|------|----------|--------|
| `-f`, `--raw-field` | Todo va como **cadena** | Títulos, cuerpos, nombres |
| `-F`, `--field` | Conversión mágica: `true`/`false`/`null`/enteros se vuelven JSON; `{owner}` se resuelve; `@archivo` lee un archivo | Booleanos, números, variables de GraphQL, consultas desde archivo |
| `--input` | El cuerpo entero desde un archivo JSON (o `-` para stdin) | Cuerpos complejos: rulesets, advisories |

```bash
# -f manda "true" como texto; el servidor espera un booleano
gh api repos/{owner}/{repo} --method PATCH -F has_issues=true

# Cuerpo grande: se escribe en un archivo y se manda entero
gh api repos/{owner}/{repo}/rulesets --method POST --input ruleset.json
```

> [!WARNING]
> Con `--input`, los campos que pases con `-f`/`-F` **no se mezclan en el cuerpo**:
> se añaden a la query string de la URL. Si el cuerpo va por archivo, todo el
> cuerpo va por archivo.

Y la trampa que más cuesta encontrar: **`-f query=@archivo.graphql` no lee el
archivo**. Solo `-F` interpreta el `@`:

```bash
# ❌ manda la cadena literal "@consulta.graphql" como consulta
gh api graphql -f query=@consulta.graphql

# ✅
gh api graphql -F query=@consulta.graphql -F owner=cli -F repo=cli
```

## 4. Dar forma a la salida

### `--jq`: filtrar

Es `jq` incorporado — misma sintaxis, sin tubería y sin depender de que esté
instalado:

```bash
gh api repos/{owner}/{repo} --jq '{nombre: .full_name, ramas: .default_branch}'
gh api repos/{owner}/{repo}/labels --jq '.[].name'
```

### `--template`: formatear

Plantillas de Go, para cuando la salida la va a leer una persona:

```bash
gh api repos/{owner}/{repo}/issues \
  --template '{{range .}}{{printf "#%v " .number}}{{.title}}{{"\n"}}{{end}}'
```

`gh help formatting` documenta las funciones útiles: `tablerow`, `tablerender`,
`color`, `timeago`, `truncate`.

| | `--jq` | `--template` |
|--|-------|--------------|
| Para | Extraer datos, encadenar con otros comandos | Presentar a un humano |
| Salida | JSON o texto plano | Texto formateado, con color y tablas |
| En un guion | ✅ | Solo para el informe final |

> [!NOTE]
> Los nombres de campo son **los de la API que llamaste**. En una respuesta REST
> es `.stargazers_count`; en GraphQL es `.data.repository.stargazerCount`.
> Mezclarlos devuelve `<no value>` sin error, que es la forma silenciosa de
> equivocarse.

## 5. Ver lo que no es el cuerpo

```bash
# Estado + cabeceras + cuerpo
gh api repos/{owner}/{repo} -i

# Solo cabeceras: útil para límites y ETag
gh api repos/{owner}/{repo} -i --silent | grep -iE "^(etag|x-ratelimit-remaining|link)"
```

Hay endpoints cuya **respuesta es el código de estado**, no el cuerpo:

```bash
# 204 = Dependabot activo · 404 = desactivado. El cuerpo está vacío en los dos
gh api repos/{owner}/{repo}/vulnerability-alerts -i --silent | head -1
```

`gh api` devuelve **código de salida 1** cuando la respuesta es 4xx o 5xx. En un
guion con `set -e` eso te para en seco cuando esperabas un `404` legítimo: hay
que capturarlo (`|| true`) y mirar el estado.

## 6. Caché local

```bash
gh api repos/{owner}/{repo} --cache 1h --jq .full_name
```

La primera llamada va a la red; las siguientes salen de disco hasta que expira.
Dos usos reales:

- **Iterar sobre un `--jq`** sin gastar una petición por intento
- **Guiones que consultan lo mismo varias veces** en la misma ejecución

No sirve para escrituras (solo cachea `GET`) y no se invalida sola: si acabas de
cambiar algo, salta el caché o usa una duración corta.

## 7. Depurar

```bash
# La petición y la respuesta completas, cabeceras incluidas
gh api repos/{owner}/{repo} --verbose

# Qué manda gh por debajo cuando usas un comando de alto nivel
GH_DEBUG=api gh pr list --limit 1
```

`GH_DEBUG=api` es la forma más rápida de aprender un endpoint que no encuentras
en la documentación: haz que `gh` haga el trabajo y copia la petición.

> [!CAUTION]
> `--verbose` y `GH_DEBUG=api` imprimen las cabeceras de la petición, y ahí va la
> de autorización. Nunca los dejes activos en un workflow: el log de Actions es
> público en un repositorio público.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `-f campo=true` para un booleano | Llega como la cadena `"true"` | `-F campo=true` |
| `-f query=@archivo` en GraphQL | Manda la ruta como consulta | `-F query=@archivo` |
| Mezclar `--input` con `-f` | Los campos se van a la query string | Todo en el archivo |
| `--verbose` en CI | Imprime la cabecera de autorización | Quitarlo antes de commitear |
| `set -e` sin capturar el `404` esperado | El guion muere en un caso normal | `\|\| true` y mirar el estado con `-i` |
| Escribir la URL completa | Rompe en GitHub Enterprise | Ruta relativa; `--hostname` si hace falta |
| Cachear una escritura | No pasa: `--cache` solo aplica a `GET` | Nada que hacer, pero no lo esperes |

## 9. Trucos

- **`--silent` con `-i`** deja solo las cabeceras: la forma más limpia de leer
  `X-RateLimit-Remaining` sin volcar el cuerpo entero
- **`--method GET -f q='...'`** manda parámetros como query string en vez de
  convertir la petición en `POST`. Es lo que necesita `search/issues`
- **`-F clave[]=uno -F clave[]=dos`** construye arrays; `-F clave[]` sin valor
  manda un array vacío, que es como se borran labels
- **`--jq` acepta funciones de `jq` completas**: `map`, `group_by`, `to_entries`.
  No hace falta la tubería salvo que quieras `-r` o `-s`
- **`gh api --cache 10m`** convierte una sesión de exploración en algo que no
  gasta cupo: se nota cuando estás afinando un filtro

## 📚 Recursos Adicionales

- [`gh api` — manual](https://cli.github.com/manual/gh_api)
- [`gh help formatting`](https://cli.github.com/manual/gh_help_formatting)
- [REST API — Making a request](https://docs.github.com/en/rest/using-the-rest-api/getting-started-with-the-rest-api#making-a-request)
- [Manual de `jq`](https://jqlang.org/manual/)
- [Variables de entorno de `gh`](https://cli.github.com/manual/gh_help_environment)

## ✅ Checklist de Verificación

- [ ] Sabes cuándo usar `-f`, `-F` y `--input`
- [ ] Sabes por qué `-f query=@archivo.graphql` no funciona
- [ ] Puedes leer el ETag y el cupo restante sin imprimir el cuerpo
- [ ] Sabes qué endpoints contestan con el código de estado y no con el cuerpo
- [ ] Has usado `--cache` mientras afinabas un filtro
- [ ] Sabes por qué `--verbose` no debe acabar en un workflow
