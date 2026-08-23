# Práctica 04 — Tu extensión de `gh`

> El guion de la Práctica 03 audita **tu** repositorio desde CI. Esta práctica
> convierte la parte rápida en algo que se escribe `gh auditoria` y funciona
> sobre cualquier repositorio, desde cualquier máquina donde tengas `gh`.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 07](../1-teoria/07-extensiones-de-gh.md). Prácticas 01
y 02 terminadas. `jq` instalado

> [!NOTE]
> Esta es la única práctica de la semana que crea un **repositorio auxiliar**:
> una extensión de `gh` *es* un repositorio, y su nombre forma parte del
> contrato. Tu repositorio del bootcamp sigue siendo el hilo conductor.

## Paso 1: El esqueleto

**Por qué**: `gh` genera la estructura mínima que cumple el contrato — nombre con
prefijo `gh-` y un ejecutable con ese mismo nombre en la raíz.

```bash
cd <donde-guardas-tus-repos>
gh extension create auditoria
cd gh-auditoria
ls -la
```

**Verifica** que existe el archivo `gh-auditoria` con permiso de ejecución:

```bash
test -x gh-auditoria && echo "ejecutable ✅"
```

Pruébala tal cual, antes de escribir nada:

```bash
gh extension install .
gh auditoria
```

**Verifica** que imprime el saludo de ejemplo. Ya es una extensión instalada: el
`install .` crea un enlace simbólico al directorio, así que **cada cambio que
guardes se aplica al instante**.

## Paso 2: El guion de verdad

**Por qué**: la extensión hereda la autenticación de `gh`. Cero gestión de
tokens: lo que tú puedes ver, ella lo ve.

```bash
cp <ruta-al-bootcamp>/bootcamp/week-15-api_rest_graphql_y_gh_cli/starter/gh-auditoria ./gh-auditoria
chmod +x gh-auditoria

gh auditoria --help
gh auditoria
```

**Verifica** que la salida de texto trae el nombre del repositorio, la licencia y
los rulesets. Ojo: `gh auditoria` sin `--repo` audita el repositorio del
directorio actual, y ahora mismo estás dentro de `gh-auditoria`, así que se está
auditando a sí misma.

Apúntala a tu repositorio del bootcamp:

```bash
gh auditoria --repo <tu-usuario>/<tu-repo>
gh auditoria --repo <tu-usuario>/<tu-repo> --formato json | jq '.rulesets_activos'
```

Lo que hace que eso funcione con una sola línea de código es `GH_REPO`: la
variable que cambia a qué repositorio apuntan `{owner}` y `{repo}` en **todas**
las llamadas del guion.

## Paso 3: Completar los bloques

Descomenta en orden y prueba después de cada uno:

**PASO 2** — los workflows, que solo existen en REST:

```bash
gh auditoria --repo <tu-usuario>/<tu-repo> --formato json | jq '.workflows_activos'
```

**PASO 2 (segundo bloque)** — Dependabot, el endpoint que contesta con el estado:

```bash
gh auditoria --repo <tu-usuario>/<tu-repo> --formato json | jq '.dependabot'
```

**Verifica** que dice `activo` o `desactivado`, nunca `desconocido`. Si sale
`desconocido`, el `case` no está viendo el código de estado: comprueba que la
llamada lleva `-i --silent` y termina en `|| true`.

**PASO 4** — el código de salida:

```bash
gh auditoria --repo <tu-usuario>/<tu-repo> > /dev/null; echo "código: $?"
```

**Verifica** que sale `0` si tu repositorio es público, tiene licencia y algún
ruleset activo, y `1` si le falta alguna. Eso es lo que la hace utilizable dentro
de otro guion o de un workflow.

## Paso 4: Que no dé pena usarla

**Por qué**: la diferencia entre un guion y una herramienta son cinco detalles
baratos, y el primero es el que vas a agradecer tú mismo dentro de seis meses.

Comprueba los cinco:

```bash
gh auditoria --help                       # 1. ayuda
gh auditoria --repo cli/cli               # 2. argumentos con nombre
gh auditoria --formato json | jq .        # 3. salida encadenable
gh auditoria --formato xml; echo "código: $?"   # 4. errores a stderr, código 2
gh auditoria --repo no/existe; echo "código: $?" # 5. falla claro, no en silencio
```

**Verifica** que el formato desconocido sale con código `2` y el mensaje va a
`stderr` (`gh auditoria --formato xml 2>/dev/null` no debe imprimir nada).

Escribe el `README.md` de la extensión con lo único que decide si alguien la
instala — un ejemplo de salida real:

````bash
cat > README.md <<'FIN'
# gh-auditoria

Resume el estado de configuración de un repositorio de GitHub: visibilidad,
licencia, rulesets activos, alertas de dependencias y workflows.

## Instalación

```bash
gh extension install <tu-usuario>/gh-auditoria
```

## Uso

```bash
gh auditoria                              # el repositorio actual
gh auditoria --repo OWNER/REPO            # otro repositorio
gh auditoria --formato json | jq .        # para encadenar
```

Sale con código 1 si el repositorio no cumple lo mínimo: público, con licencia y
con al menos un ruleset activo.
FIN
````

## Paso 5: Publicarla

```bash
git init -b main
git add .
git commit -m "feat: extension gh-auditoria"

gh repo create gh-auditoria --public --source=. --push \
  --description "Resumen del estado de configuración de un repositorio"

gh repo edit --add-topic gh-extension
gh repo edit --add-topic gh-cli
```

**Verifica** que el topic está puesto — sin él la extensión existe pero no
aparece en el catálogo:

```bash
gh api repos/{owner}/gh-auditoria --jq '{visibilidad: .visibility, topics: .topics}'
```

Y publica una versión, para que quien la instale pueda fijarla:

```bash
gh release create v1.0.0 --generate-notes
```

**Verifica**:

```bash
gh api repos/{owner}/gh-auditoria/releases/latest --jq '.tag_name'
```

## Paso 6: Instalarla como lo haría otra persona

**Por qué**: hasta ahora la estabas usando desde el directorio local. Esto
comprueba que el repositorio publicado se basta solo.

```bash
gh extension remove auditoria
gh extension install <tu-usuario>/gh-auditoria
gh extension list
gh auditoria --repo <tu-usuario>/<tu-repo>
```

**Verifica** que `gh extension list` la lista con su versión y su origen.

Y mira el catálogo del que ahora formas parte:

```bash
gh extension search auditoria
gh extension upgrade --all --dry-run
```

> [!CAUTION]
> `gh extension install` descarga y ejecuta código de un tercero **con tu sesión
> de `gh` disponible**. No hay revisión ni firma: el propio `gh` lo advierte.
> Antes de instalar una extensión ajena, lee el ejecutable —suelen ser cien
> líneas—, mira quién la mantiene, y en un equipo fija la versión con
> `--pin v1.2.0`.

## Paso 7: Documentarla en tu repositorio

**Por qué**: la extensión vive en otro repositorio, pero forma parte de la capa
que añade esta semana. Quien lea tu repo tiene que poder llegar a ella.

```bash
cd <ruta-a-tu-repo>
git switch -c docs/auditoria
```

Añade al `README.md` una sección con las dos herramientas:

````bash
cat >> README.md <<'FIN'

## Auditoría del repositorio

Este repositorio se audita solo. Cada lunes, el workflow
[`auditoria.yml`](.github/workflows/auditoria.yml) ejecuta `tools/auditoria.ts` y
actualiza el issue etiquetado con `auditoria`.

Para lanzarlo a mano:

```bash
export GITHUB_TOKEN=$(gh auth token)
pnpm auditoria -- --repo <tu-usuario>/<tu-repo> --formato json
```

Y para un vistazo rápido a cualquier repositorio, con la extensión de `gh`:

```bash
gh extension install <tu-usuario>/gh-auditoria
gh auditoria --repo <tu-usuario>/<tu-repo>
```
FIN

git add README.md
git commit -m "docs: documentar la auditoria automatica y la extension de gh"
git push -u origin docs/auditoria
gh pr create --fill
gh pr merge --squash --delete-branch
````

**Verifica**:

```bash
gh api repos/{owner}/{repo}/contents/README.md --jq '.content | @base64d' \
  | grep -A3 "Auditoría del repositorio"
```

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `unknown command "auditoria"` | El repositorio no se llama `gh-auditoria` | Renombrarlo: el prefijo es el contrato |
| Instala pero no arranca | El ejecutable no tiene permiso de ejecución | `chmod +x gh-auditoria` y commitear |
| Funciona en local y no instalada | El bit de ejecución no llegó al repositorio | `git update-index --chmod=+x gh-auditoria` |
| Audita el repositorio equivocado | Estás dentro del repo de la extensión | `--repo`, o `GH_REPO` |
| `jq: command not found` en otra máquina | La extensión en bash depende de `jq` | Documentarlo, o precompilar (teoría 07) |
| No aparece en `gh extension search` | Falta el topic `gh-extension` | `gh repo edit --add-topic gh-extension` |
| `set -e` mata el guion en el `404` | Falta el `\|\| true` en la llamada | Capturar y mirar el estado |
| El nombre choca con un comando de `gh` | Los nativos ganan siempre | Renombrar, o `gh extension exec` |

## ✅ Resultado

- [ ] `gh-auditoria` existe, es público y tiene el topic `gh-extension`
- [ ] El ejecutable está en la raíz, con el bit de ejecución en el repositorio
- [ ] `gh auditoria --help` explica el uso
- [ ] Funciona sobre cualquier repositorio con `--repo`
- [ ] `--formato json` sale por stdout y los errores por stderr
- [ ] Los códigos de salida son `0`, `1` y `2` según el caso
- [ ] Tiene un release `v1.0.0` y un README con ejemplo de salida
- [ ] La instalaste desde GitHub, no desde el directorio local
- [ ] Tu repositorio del bootcamp la documenta

## ✅ Verificación de la semana

```bash
./scripts/verificar-semana.sh 15 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 15](../README.md)
