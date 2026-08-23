# ✅ Autograding

En autoestudio nadie revisa tus entregables. Los revisa la API de GitHub.

Cada semana declara sus comprobaciones en un `checks.json`. El script
`scripts/verificar-semana.sh` las traduce a llamadas reales contra **tu**
repositorio y te dice qué falta.

---

## Uso

```bash
# Diagnóstico del entorno (antes de empezar)
./scripts/verificar-semana.sh --doctor

# Verificar una semana
./scripts/verificar-semana.sh 08 --repo <tu-usuario>/<tu-repo>

# Guardar el repo para no repetirlo cada vez
echo "REPO=<tu-usuario>/<tu-repo>" > ~/.bc-github
./scripts/verificar-semana.sh 08
```

Salida:

```
== Semana 08 — Gobernanza: rulesets y merge queue ==
✅ Existe al menos un ruleset activo
✅ El ruleset exige pull request antes de mergear
❌ El ruleset no exige commits firmados
   → 2-practicas/03-firmas-obligatorias.md, paso 4
✅ El ruleset exige al menos un status check

3 de 4 verificaciones superadas.
```

Código de salida: `0` si todas pasan, `1` si falla alguna. Sirve para meterlo en
tu propio CI si quieres.

---

## Formato de `checks.json`

```json
{
  "semana": "08",
  "titulo": "Gobernanza: rulesets y merge queue",
  "checks": [
    {
      "id": "ruleset-activo",
      "descripcion": "Existe al menos un ruleset activo",
      "api": "repos/{repo}/rulesets",
      "jq": "map(select(.enforcement == \"active\")) | length > 0",
      "pista": "2-practicas/01-primer-ruleset.md, paso 3"
    },
    {
      "id": "project-existe",
      "descripcion": "Tienes un Project v2 con al menos 5 items",
      "graphql": "query($owner:String!){ user(login:$owner){ projectsV2(first:1){ nodes{ items{ totalCount } } } } }",
      "jq": ".data.user.projectsV2.nodes[0].items.totalCount >= 5",
      "pista": "3-proyecto/README.md"
    }
  ]
}
```

### Campos

| Campo | Obligatorio | Qué hace |
| --- | :--: | --- |
| `id` | sí | Identificador estable, kebab-case |
| `descripcion` | sí | Lo que se imprime al estudiante |
| `api` | sí* | Endpoint REST. `{repo}`, `{owner}` y `{name}` se sustituyen |
| `graphql` | sí* | Query GraphQL. Recibe `$owner` y `$repo` como variables |
| `jq` | sí | Expresión que debe evaluar a `true` sobre la respuesta |
| `pista` | no | Dónde está el paso que arregla el fallo |

\* Exactamente uno de `api` o `graphql`.

Los tres marcadores del endpoint, con `--repo ana/mi-proyecto`:

| Marcador | Se sustituye por |
| --- | --- |
| `{repo}` | `ana/mi-proyecto` |
| `{owner}` | `ana` |
| `{name}` | `mi-proyecto` |

`{name}` hace falta en los endpoints que no llevan el repositorio completo, como
los de packages: `users/{owner}/packages/container/{name}`.

> [!NOTE]
> **Scopes del token.** Casi todo funciona con lo que concede `gh auth login`.
> La excepción son los endpoints de `packages` (Semana 12), que devuelven `403`
> incluso para paquetes públicos sin el scope `read:packages`. Se añade una vez:
> `gh auth refresh -s read:packages`.

### Reglas de diseño

1. **Una comprobación, un hecho.** Si la descripción lleva "y", divídela en dos.
2. **La expresión `jq` devuelve un booleano**, nunca un valor. `length > 0`, no `length`.
3. **Cero lógica bash por semana.** Si una comprobación necesita código
   imperativo, replantea el entregable — probablemente no es verificable y por
   tanto no debería ser obligatorio.
4. **Un 404 es un fallo**, no un error del script. Si el endpoint no existe para
   tu repo (por ejemplo, no hay rulesets), la comprobación simplemente no pasa.
5. **Nunca escribe.** El script solo hace `GET`. No arregla nada por ti.

---

## Lo que NO se puede verificar por API

Bastante, y es importante saberlo:

| No verificable | Por qué | Cómo se evalúa |
| --- | --- | --- |
| Calidad de un mensaje de commit | La API ve el texto, no si es bueno | Rúbrica manual |
| Utilidad de un comentario de review | Idem | Rúbrica manual |
| Si entendiste el porqué de un ruleset | No hay endpoint para eso | Cuestionario de la rúbrica |
| Que tu contribución OSS aporte valor | La juzga el mantenedor | Que la mergeen |

El autograding cubre el **40% de desempeño**. El 30% de conocimiento sale del
cuestionario y el 30% de producto de la rúbrica. Pasar las verificaciones no es
aprobar la semana.

---

## Escribir una comprobación nueva

Prueba la llamada a mano primero:

```bash
gh api repos/<tu-usuario>/<tu-repo>/rulesets --jq '.'
```

Luego reduce a un booleano:

```bash
gh api repos/<tu-usuario>/<tu-repo>/rulesets \
  --jq 'map(select(.enforcement == "active")) | length > 0'
# true
```

Y esa misma expresión va literal al campo `jq` del `checks.json`.

Para GraphQL:

```bash
gh api graphql -F owner=<tu-usuario> -F repo=<tu-repo> -f query='
  query($owner:String!, $repo:String!) {
    repository(owner:$owner, name:$repo) { discussions { totalCount } }
  }' --jq '.data.repository.discussions.totalCount > 0'
```

---

## Trampa

Puedes hacer trampa: las comprobaciones miran el estado final, no cómo llegaste.
Puedes crear un ruleset a mano sin entender qué protege.

Y da exactamente igual, porque nadie te va a contratar por el `checks.json`. Las
verificaciones son un detector de humo, no un examen.
