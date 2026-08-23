# Práctica 01 — La API en la mano

> Al terminar esta práctica vas a haber leído tu repositorio por la API, contado
> bien lo que hay dentro, visto lo que gastas al hacerlo y escrito en él sin tocar
> la interfaz. Es la base de todo lo demás de la semana.

**Duración estimada**: 55 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-rest-y-graphql.md),
[02](../1-teoria/02-gh-api-a-fondo.md), [03](../1-teoria/03-paginacion.md) y
[04](../1-teoria/04-limites-y-cortesia.md). `gh` autenticado y tu repositorio del
bootcamp clonado (`./scripts/verificar-semana.sh --doctor`)

> [!IMPORTANT]
> Ejecuta todo desde **dentro de tu repositorio clonado**. Es lo que hace que
> `{owner}` y `{repo}` se resuelvan solos y que puedas copiar los comandos tal
> cual.

## Paso 1: Con quién estás hablando

**Por qué**: la mitad de los `404` de esta semana no son «no existe», son «tu
token no lo ve». Antes de nada, comprueba la identidad y el alcance.

```bash
gh api user --jq '{login, id, node_id}'
gh auth status
```

**Verifica** que el `login` es el tuyo y que entre los *scopes* aparece `repo`.

Ahora el repositorio, y la diferencia entre pedirlo todo y pedir lo que usas:

```bash
# 120 claves para leer una
gh api repos/{owner}/{repo} --jq 'keys | length'

# Lo que de verdad querías
gh api repos/{owner}/{repo} --jq '{
  nombre: .full_name,
  visibilidad: .visibility,
  rama: .default_branch,
  issues: .open_issues_count,
  licencia: .license.spdx_id,
  topics: .topics
}'
```

**Verifica** que `visibilidad` es `public`. Si no lo es, el resto del bootcamp no
funciona: la mayoría de features son gratuitas solo en repositorios públicos.

## Paso 2: Contar bien

**Por qué**: es el error silencioso de la semana. Un informe con 30 de 217
elementos no falla, miente.

```bash
# Lo que devuelve por defecto
gh api repos/{owner}/{repo}/labels --jq 'length'

# Todas las páginas... pero la longitud se imprime por página
gh api 'repos/{owner}/{repo}/labels?per_page=100' --paginate --jq 'length'
```

Si tu repositorio tiene más de 100 labels verás dos números. Las tres formas
correctas de contar:

```bash
# 1. Aplanar y contar líneas
gh api 'repos/{owner}/{repo}/labels?per_page=100' --paginate --jq '.[].name' | wc -l

# 2. Juntar las páginas y contar fuera
gh api 'repos/{owner}/{repo}/labels?per_page=100' --paginate --slurp | jq 'add | length'

# 3. Preguntarle al servidor cuando hay total_count
gh api --method GET search/issues \
  -f q="repo:$(gh repo view --json nameWithOwner --jq .nameWithOwner) is:issue" \
  -f per_page=1 --jq '.total_count'
```

**Verifica** que 1 y 2 dan el mismo número. Y comprueba de paso la
incompatibilidad que te va a morder en el guion:

```bash
gh api 'repos/{owner}/{repo}/labels?per_page=100' --paginate --slurp --jq 'length'
```

```
the --slurp option is not supported with --jq or --template
```

No es un fallo tuyo: `--slurp` y `--jq` no conviven. La tubería a `jq` es la
salida.

> [!NOTE]
> `--slurp | jq 'length'` cuenta **páginas**. El `add` de la opción 2 concatena
> los arrays antes de contar. Con dos páginas, la diferencia entre `2` y `182`.

## Paso 3: Lo que cuesta preguntar

**Por qué**: un guion que no mira el cupo funciona hasta que un día no. Verlo
ahora es lo que hace que lo pongas en el guion después.

```bash
# Consultar el cupo no gasta cupo
gh api rate_limit --jq '.resources | {
  core: .core.remaining, graphql: .graphql.remaining,
  search: .search.remaining, code_search: .code_search.remaining
}'
```

**Verifica** que `search` es mucho más pequeño que `core`: 30 por minuto frente a
5 000 por hora. Es el cubo que se agota primero en cualquier bucle.

Las mismas cifras vienen en cada respuesta:

```bash
gh api repos/{owner}/{repo} -i --silent | grep -iE '^x-ratelimit'
date -d "@$(gh api rate_limit --jq '.resources.core.reset')"
```

Y ahora la petición que **no gasta**:

```bash
ETAG=$(gh api repos/{owner}/{repo} -i --silent | grep -i '^etag:' | cut -d' ' -f2 | tr -d '\r')
echo "ETag: $ETAG"

gh api repos/{owner}/{repo} -H "If-None-Match: $ETAG" -i --silent | head -1
```

**Verifica** que la segunda respuesta es `HTTP/2.0 304 Not Modified`. Compara el
`X-RateLimit-Used` de antes y de después: no subió.

> [!TIP]
> `gh api ... --cache 10m` es la versión perezosa: ni siquiera pregunta. Úsala
> mientras afinas un `--jq` para no gastar una petición por intento.

## Paso 4: Lo que responde con el estado, no con el cuerpo

**Por qué**: hay endpoints cuyo cuerpo está vacío a propósito. Si esperas JSON,
crees que están rotos.

```bash
gh api repos/{owner}/{repo}/vulnerability-alerts -i --silent 2>/dev/null | head -1
echo "código de salida: $?"
```

`204` significa que las alertas de Dependabot están activas; `404`, que no. Los
dos son respuestas correctas, pero `gh api` sale con código 1 en el `404`: en un
guion con `set -e`, eso mata la ejecución en un caso perfectamente normal. La
Práctica 03 lo resuelve capturando el estado.

## Paso 5: Escribir por la API

**Por qué**: leer es la mitad. Vas a crear el label que usará el informe
automático de la Práctica 03.

```bash
gh api repos/{owner}/{repo}/labels --method POST \
  -f name='auditoria' \
  -f color='0e8a16' \
  -f description='Informe automático del estado del repositorio'
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/labels/auditoria --jq '{name, color, description}'
```

Fíjate en tres cosas del comando anterior:

- **No hizo falta `--method POST`**: añadir campos ya lo convierte en `POST`. Se
  escribe igualmente, porque un guion se lee mejor con el verbo explícito
- **`-f` manda cadenas.** Si el campo fuera booleano o numérico, haría falta `-F`
- **Es idempotente-ish**: repetirlo devuelve `422 already_exists`. Un guion que
  crea labels tiene que contemplarlo

Prueba la diferencia entre `-f` y `-F` sin romper nada:

```bash
gh api repos/{owner}/{repo} --method PATCH -F has_issues=true --jq '.has_issues'
```

**Verifica** que devuelve `true`. Con `-f has_issues=true` el valor viajaría como
la cadena `"true"`; con algunos campos GitHub lo tolera, con otros devuelve `422`.

## Paso 6: Una salida para humanos

**Por qué**: el JSON es para encadenar; cuando el destinatario es una persona,
`--template` produce algo legible sin salir del comando.

```bash
gh api 'repos/{owner}/{repo}/issues?state=open&per_page=100' --paginate \
  --template '{{range .}}{{printf "#%v" .number}}  {{.title}}{{"\n"}}{{end}}'
```

Y una tabla de verdad:

```bash
gh api repos/{owner}/{repo}/labels \
  --template '{{tablerow "LABEL" "DESCRIPCIÓN"}}{{range .}}{{tablerow .name .description}}{{end}}{{tablerender}}'
```

**Verifica** que sale una tabla alineada con tus labels, incluida `auditoria`.

> [!NOTE]
> Los nombres de campo son los de **REST**: `.stargazers_count`, no
> `.stargazerCount`. Si te equivocas, `--template` imprime `<no value>` sin
> quejarse — es la forma silenciosa de equivocarse.

## Paso 7: Tu primer inventario

**Por qué**: junta todo lo anterior en algo que se pueda repetir y comparar.

```bash
mkdir -p /tmp/auditoria

gh api repos/{owner}/{repo} --jq '{
  repo: .full_name,
  visibilidad: .visibility,
  rama: .default_branch,
  licencia: (.license.spdx_id // "sin licencia"),
  topics: .topics,
  descripcion: (.description // "sin descripción")
}' > /tmp/auditoria/repo.json

gh api repos/{owner}/{repo}/rulesets --jq '[.[] | {name, enforcement, target}]' \
  > /tmp/auditoria/rulesets.json

gh api repos/{owner}/{repo}/actions/workflows --jq '[.workflows[] | {name, state, path}]' \
  > /tmp/auditoria/workflows.json

jq -s '{repo: .[0], rulesets: .[1], workflows: .[2]}' \
  /tmp/auditoria/repo.json /tmp/auditoria/rulesets.json /tmp/auditoria/workflows.json
```

**Verifica** que el JSON final trae las tres secciones y que los rulesets que
creaste en la Semana 08 aparecen con `enforcement: "active"`.

Esas tres llamadas son **tres peticiones REST**. En la Práctica 02 vas a pedir
casi lo mismo con una sola consulta, y a medir la diferencia.

## Paso 8: Cuánto costó

```bash
gh api rate_limit --jq '.resources.core | {usado: .used, restante: .remaining}'
```

**Verifica** que el número de peticiones usadas se parece a la cantidad de
comandos que has ejecutado. Ese número es el que un guion mal escrito multiplica
por cien sin que te enteres.

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `{owner}` sale literal en la URL | No estás dentro del repositorio clonado | `cd` al repositorio, o `GH_REPO=owner/repo` |
| El conteo no cuadra | `--paginate --jq 'length'` cuenta por página | `--slurp` + `jq 'add \| length'` |
| `the --slurp option is not supported...` | `--slurp` con `--jq` | Tubería a `jq` |
| `404` en `vulnerability-alerts` | Es la respuesta normal cuando está desactivado | Mirar el estado, no el cuerpo |
| `422 already_exists` al crear el label | Ya existe | Ignorarlo o comprobar antes |
| `<no value>` en `--template` | Nombre de campo de GraphQL en respuesta REST | `.stargazers_count` |
| `403` con `X-RateLimit-Remaining: 0` | Límite primario agotado | Esperar al `reset`; medir con `rate_limit` |
| `HTTP 200` en vez de `304` | El recurso cambió, o el ETag se copió mal | Comprobar que no quedó un `\r` al final |

## ✅ Resultado

- [ ] Sabes qué identidad usa `gh` y qué scopes tiene
- [ ] Cuentas colecciones de tres formas y sabes cuál falla y por qué
- [ ] Has visto la incompatibilidad de `--slurp` con `--jq` en tu terminal
- [ ] Has leído el cupo en las cabeceras y provocado un `304`
- [ ] Sabes qué endpoints contestan con el código de estado
- [ ] Has creado el label `auditoria` por API
- [ ] Tienes un inventario en JSON de tu repositorio
- [ ] Sabes cuántas peticiones costó todo esto

## ✅ Verificación de la semana

```bash
./scripts/verificar-semana.sh 15 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 15](../README.md)
