# Práctica 03 — El guion que se audita solo

> Hasta aquí has preguntado tú. Al terminar esta práctica, tu repositorio se
> pregunta a sí mismo todos los lunes por la mañana y deja el resultado en un
> issue que se actualiza en vez de multiplicarse.

**Duración estimada**: 60 min
**Prerrequisitos**: [Teoría 06](../1-teoria/06-octokit.md) y
[08](../1-teoria/08-guiones-de-auditoria.md). Prácticas 01 y 02 terminadas: el
label `auditoria`, el issue abierto y `tools/consultas/auditoria.graphql` en la
rama por defecto. Node 22 y `pnpm`

## Paso 1: Traer el starter y las dependencias

**Por qué**: el guion crece más allá de lo que se sostiene en bash — hay
condiciones, agregación y una consulta desde archivo. Es justo el punto en el que
Octokit gana.

```bash
cd <ruta-a-tu-repo>
git switch -c feat/auditoria-automatica

cp <ruta-al-bootcamp>/bootcamp/week-15-api_rest_graphql_y_gh_cli/starter/auditoria.ts tools/auditoria.ts

pnpm add octokit
pnpm add -D tsx @octokit/plugin-throttling @octokit/plugin-retry
```

Añade el atajo en `package.json`:

```bash
npm pkg set scripts.auditoria="tsx tools/auditoria.ts"
```

**Verifica** que arranca aunque todavía no haga casi nada:

```bash
export GITHUB_TOKEN=$(gh auth token)
pnpm auditoria -- --repo <tu-usuario>/<tu-repo> --formato json
```

Deben salir dos reglas evaluadas. Y comprueba el código de salida de un uso
incorrecto, que es el `2` de la [teoría 08](../1-teoria/08-guiones-de-auditoria.md):

```bash
pnpm auditoria -- --formato json > /dev/null; echo "código: $?"
```

> [!IMPORTANT]
> `export GITHUB_TOKEN=$(gh auth token)` mete el token en el entorno de esta
> sesión y **en ningún archivo**. Nunca lo escribas en el código ni en un `.env`
> que acabe commiteado: la Semana 14 te enseñó lo que pasa después.

## Paso 2: El cliente educado

**Por qué**: un guion que corre solo cada semana se topa antes o después con los
límites. Los dos plugins implementan el archivo
[04](../1-teoria/04-limites-y-cortesia.md) entero sin escribir una línea de
espera.

Descomenta en `tools/auditoria.ts` los bloques **PASO 1** y **PASO 2**, y borra
la línea que crea el cliente sin plugins:

```ts
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });   // ← fuera
```

**Verifica** que el guion sigue funcionando igual:

```bash
pnpm auditoria -- --repo <tu-usuario>/<tu-repo> --formato json | head -5
```

Lo que acabas de activar: reintento con *backoff* en los `5xx`, respeto de
`Retry-After` en el límite secundario, y un `userAgent` que identifica a tu guion
en los logs de GitHub.

## Paso 3: Recoger de las dos APIs

**Por qué**: ninguna de las dos APIs contesta sola. Los workflows solo están en
REST; los rulesets y el conteo de alertas, en la consulta que ya escribiste.

Descomenta el bloque **PASO 3** —los workflows y el bloque de Dependabot— y
sustituye el `return` de relleno por:

```ts
return { grafo, workflows, dependabot };
```

**Verifica** que la consulta de la Práctica 02 se está leyendo de verdad:

```bash
mv tools/consultas/auditoria.graphql /tmp/consulta-escondida.graphql
pnpm auditoria -- --repo <tu-usuario>/<tu-repo>; echo "código: $?"
mv /tmp/consulta-escondida.graphql tools/consultas/auditoria.graphql
```

Debe salir `No se pudo auditar: ...` y **código 3**, no 1. Esa distinción es el
entregable invisible de esta práctica: «no cumple» y «está roto» no son lo
mismo, y un `1` en los dos casos es cómo una auditoría lleva tres semanas
fallando sin que nadie se entere.

Fíjate en cómo se lee Dependabot:

```ts
const r = await octokit.request("GET /repos/{owner}/{repo}/vulnerability-alerts", { owner, repo });
dependabot = r.status === 204;
```

Es el endpoint que contesta con el estado y no con el cuerpo — el mismo del Paso
4 de la Práctica 01. Octokit lanza excepción en el `404`, y por eso va dentro de
un `try`.

## Paso 4: Las reglas

**Por qué**: son funciones puras sobre el estado ya recogido. Sin red, sin
condiciones anidadas, y por eso se pueden leer de un vistazo y testear.

Descomenta las cinco reglas comentadas del bloque **PASO 4** y ejecuta:

```bash
pnpm auditoria -- --repo <tu-usuario>/<tu-repo> --formato json | jq '{
  total, cumplidas,
  fallan: [.hallazgos[] | select(.cumple | not) | .id]
}'
```

**Verifica** que las siete reglas se evalúan y que las que fallan son fallos
reales de tu repositorio, no del guion. Añade **una regla propia** que audite
algo que a ti te importe: un topic obligatorio, la existencia de `SECURITY.md`,
que el último release no tenga más de tres meses.

```ts
{
  id: "descripcion-presente",
  descripcion: "El repositorio tiene descripción",
  ok: (e) => Boolean(e.grafo.repository.description),
},
```

> [!NOTE]
> Audita solo lo que vas a arreglar. Una lista con quince hallazgos que nadie
> atiende enseña a ignorar el informe entero — y entonces el que importaba pasa
> desapercibido.

## Paso 5: Las dos salidas

**Por qué**: el JSON es el formato nativo; el Markdown se deriva de él. Al revés
—texto bonito primero— el resultado no se puede comparar ni encadenar.

```bash
pnpm auditoria -- --repo <tu-usuario>/<tu-repo> --formato markdown
pnpm auditoria -- --repo <tu-usuario>/<tu-repo> --formato json > /tmp/informe.json
jq -r '.hallazgos[] | select(.cumple | not) | "- \(.descripcion)"' /tmp/informe.json
```

**Verifica** que el Markdown sale como una tabla legible y que el JSON se deja
filtrar sin parsear texto.

## Paso 6: El workflow

**Por qué**: un guion que solo corre cuando te acuerdas no es una auditoría.

```bash
cp <ruta-al-bootcamp>/bootcamp/week-15-api_rest_graphql_y_gh_cli/starter/auditoria.yml \
   .github/workflows/auditoria.yml
```

Descomenta los bloques **PASO 3** (resumen del job, artifact e issue) y **PASO 4**
(el fallo real). Repasa antes de guardar:

- **`permissions`**: `contents: read` e `issues: write`. Nada más
- **`GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`**: el token efímero del job, no un
  PAT tuyo. Un PAT en un secreto tiene tus permisos sobre **todos** tus
  repositorios; el del job, solo los declarados sobre este
- **Todas las actions ancladas por SHA** con el tag en comentario (Semana 11)
- **`workflow_dispatch`** junto al `schedule`, para no esperar al lunes

```bash
git add tools/ .github/workflows/auditoria.yml package.json pnpm-lock.yaml
git commit -m "feat(tools): auditoria automatica del repositorio con Octokit"
git push -u origin feat/auditoria-automatica
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/contents/.github/workflows/auditoria.yml \
  --jq '.content | @base64d' | grep -E "cron|permissions|issues: write|GITHUB_TOKEN"
```

## Paso 7: Ejecutarlo y ver el informe

```bash
git pull
gh workflow run auditoria.yml
gh run watch
```

**Verifica** las tres salidas:

```bash
# 1. El resumen del job (ábrelo en el navegador)
gh run view --web

# 2. El issue actualizado, no uno nuevo
gh issue list --label auditoria --state open --json number,title,updatedAt

# 3. El JSON como artifact
gh run download --name auditoria --dir /tmp/artefacto && jq '.cumplidas' /tmp/artefacto/informe.json
```

**Verifica** sobre todo la número 2: tiene que seguir habiendo **un solo issue**,
el que creaste con la mutación en la Práctica 02, con el cuerpo cambiado. Vuelve
a lanzar el workflow y compruébalo otra vez — si aparece un segundo issue, el
paso de publicación no está buscando el existente.

## Paso 8: Lo que costó

**Por qué**: el `GITHUB_TOKEN` de Actions tiene **1 000 peticiones por hora y
repositorio**, no las 5 000 de tu usuario. Conviene saber cuánto gasta tu
auditoría antes de añadirle veinte reglas.

Añade al final del guion, temporalmente:

```ts
const { data: limite } = await octokit.rest.rateLimit.get();
console.error(`Cupo restante: ${limite.resources.core.remaining}`);
```

**Verifica** que la auditoría entera cuesta un puñado de peticiones. Si al crecer
se acerca a las decenas, la solución no es esperar: es mover más datos a la
consulta de GraphQL, que cuesta 1 punto de otro cubo.

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `Cannot find module 'octokit'` | Falta la dependencia | `pnpm add octokit` |
| Código 3 nada más arrancar | No encuentra `tools/consultas/auditoria.graphql` | Práctica 02, paso 8 |
| `Bad credentials` en local | `GITHUB_TOKEN` sin exportar o caducado | `export GITHUB_TOKEN=$(gh auth token)` |
| Todo `false` en las reglas del grafo | La consulta no trae esos campos | Comparar con `tools/consultas/auditoria.graphql` |
| El workflow sale verde con hallazgos | Es lo esperado: los hallazgos no rompen el build | El rojo se reserva para el código 3 |
| Un issue nuevo cada ejecución | El paso de publicación no busca el existente | `gh issue list --json number --jq '.[0].number // empty'` |
| `Resource not accessible by integration` | Falta `issues: write` en `permissions` | Declararlo en el workflow |
| `403` al leer alertas de seguridad en CI | El `GITHUB_TOKEN` no las ve por defecto | `security-events: read`, o dejar esa regla fuera de CI |

## ✅ Resultado

- [ ] `tools/auditoria.ts` usa Octokit con `throttling` y `retry`
- [ ] Recoge de GraphQL y de REST, y lee la consulta desde archivo
- [ ] Al menos siete reglas, una de ellas tuya
- [ ] `--formato json` y `--formato markdown` funcionan
- [ ] Los códigos de salida distinguen hallazgos (1) de fallo real (3)
- [ ] `.github/workflows/auditoria.yml` corre semanalmente y a mano
- [ ] El informe llega al resumen del job, al artifact y al issue
- [ ] El issue se **actualiza**: sigue habiendo uno solo

## ✅ Verificación de la semana

```bash
./scripts/verificar-semana.sh 15 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 15](../README.md)
