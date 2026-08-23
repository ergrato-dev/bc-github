# Guiones de auditoría que se pueden dejar solos

> Catorce semanas de configuración se deshacen en una tarde: alguien desactiva un
> check, expira un secreto, se borra un ruleset «un momento» y nadie lo vuelve a
> poner. Un guion de auditoría es lo que convierte tu configuración en algo que se
> comprueba solo, como los tests.

## 🎯 Objetivos

- Diseñar una auditoría que otro pueda leer y ampliar
- Separar recogida, evaluación y presentación
- Elegir códigos de salida que sirvan en CI
- Ejecutarla en Actions con los permisos mínimos
- Publicar el resultado donde alguien lo vea

## 1. Qué problema resuelve

`verificar-semana.sh` audita **tu repositorio del bootcamp** contra las
comprobaciones de una semana. Lo que construyes aquí es lo mismo aplicado a tu
propio criterio, corriendo solo y avisando cuando algo se cae.

La diferencia entre un guion que se abandona y uno que sobrevive:

| | Guion de una tarde | Auditoría que dura |
|--|-------------------|--------------------|
| Salida | Texto con colores | JSON, y encima el texto |
| Reglas | Mezcladas con las llamadas | Declaradas, en una lista |
| Fallos | `exit 1` en la primera | Recoge todo y falla al final |
| Ejecución | Cuando alguien se acuerda | `schedule` semanal |
| Resultado | La terminal de quien lo lanzó | Un issue, un resumen de job, un artifact |

## 2. Las tres capas

```
recoger        →   evaluar        →   presentar
(llamadas API)     (reglas puras)      (json, markdown, exit code)
```

Separarlas no es ceremonia: es lo que te deja **testear las reglas sin red** y
cambiar la presentación sin tocar la lógica.

```ts
// 1. Recoger: todo lo que la API sabe, sin juzgar nada
const estado = {
  repo: (await octokit.rest.repos.get({ owner, repo })).data,
  rulesets: (await octokit.request("GET /repos/{owner}/{repo}/rulesets", { owner, repo })).data,
  workflows: (await octokit.rest.actions.listRepoWorkflows({ owner, repo })).data.workflows,
};

// 2. Evaluar: funciones puras, fáciles de testear
type Regla = { id: string; descripcion: string; ok: (e: typeof estado) => boolean };
const reglas: Regla[] = [
  { id: "repo-publico", descripcion: "El repositorio es público", ok: (e) => !e.repo.private },
  { id: "ruleset-activo", descripcion: "Hay un ruleset activo", ok: (e) => e.rulesets.some((r) => r.enforcement === "active") },
];

// 3. Presentar: JSON primero; el markdown se deriva de él
const hallazgos = reglas.map((r) => ({ ...r, cumple: r.ok(estado) }));
console.log(JSON.stringify({ repo: `${owner}/${repo}`, hallazgos }, null, 2));
```

## 3. JSON primero, humano después

Si la salida nativa es JSON, todo lo demás es una transformación:

```bash
./auditoria.sh --formato json | jq -r '
  .hallazgos[] | select(.cumple | not) | "- \(.descripcion)"'
```

Si la salida nativa es texto con emojis, para reutilizarla hay que parsearla, y
eso se rompe el día que cambias un icono. **La regla: una bandera `--formato`,
`json` como ciudadano de primera.**

## 4. Códigos de salida

En CI el código de salida es la interfaz. Uno solo para todo no vale:

| Código | Significa | Efecto deseado |
|:------:|-----------|----------------|
| `0` | Todo cumple | Verde |
| `1` | Hay hallazgos | Rojo, pero informativo |
| `2` | Uso incorrecto (falta `--repo`) | Rojo, y es culpa de quien llama |
| `3` | No se pudo auditar (sin permisos, API caída) | Distinto de «hay hallazgos» |

Distinguir el `1` del `3` es lo que evita el peor final posible: una auditoría que
lleva tres semanas fallando al conectarse y todo el mundo cree que está verde.

## 5. Recoger todo antes de fallar

```bash
# ❌ set -e mata el guion en la primera comprobación que no pasa
set -euo pipefail
gh api repos/{owner}/{repo}/vulnerability-alerts     # 404 legítimo = fin del guion

# ✅ capturar, anotar y seguir
estado=$(gh api repos/{owner}/{repo}/vulnerability-alerts -i --silent 2>/dev/null | head -1 || true)
case "$estado" in
  *204*) anotar "dependabot" "ok" ;;
  *404*) anotar "dependabot" "falla" ;;
  *)     anotar "dependabot" "desconocido" ;;
esac
```

Una auditoría que se para en el primer fallo obliga a arreglar de uno en uno.
Recoge todos los hallazgos y preséntalos juntos.

## 6. Correrla en Actions

```yaml
name: Auditoría del repositorio

on:
  schedule:
    - cron: "0 6 * * 1"     # lunes a las 06:00 UTC
  workflow_dispatch:

permissions:
  contents: read            # leer el código del guion
  issues: write             # publicar el informe

jobs:
  auditar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      - run: ./scripts/auditoria.sh --formato markdown > informe.md
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Cuatro decisiones que hay que tomar a propósito:

- **`permissions` mínimas y explícitas**, como desde la Semana 11. `issues: write`
  solo si de verdad publicas un issue
- **El `GITHUB_TOKEN` no lo ve todo.** Las alertas de Dependabot y de secret
  scanning necesitan permisos que ese token no tiene por defecto: si tu auditoría
  las mira, o los declaras (`security-events: read`) o asumes el hueco
- **El cupo es de 1 000 peticiones por hora y repositorio**, no 5 000
- **`schedule` en un repositorio sin actividad se desactiva** a los 60 días de
  inactividad: GitHub avisa por correo antes

> [!TIP]
> No pongas el cron a las 00:00 UTC. Es la hora que elige todo el mundo y los
> `schedule` se encolan; unos minutos más tarde arranca antes.

## 7. Dónde dejar el resultado

| Destino | Cuándo | Cómo |
|---------|--------|------|
| **Resumen del job** | Siempre. Es gratis y se ve al abrir la ejecución | `>> "$GITHUB_STEP_SUMMARY"` |
| **Issue** | Cuando alguien tiene que actuar | Uno solo, actualizado — no uno por semana |
| **Artifact** | El JSON crudo, para comparar entre semanas | `actions/upload-artifact` |
| **Commit al repositorio** | Casi nunca | Ensucia la historia con ruido automático |

El patrón que no acaba en 52 issues al año: **buscar un issue abierto con la
etiqueta de la auditoría; si existe, actualizar su cuerpo; si no, crearlo.**

```bash
EXISTENTE=$(gh issue list --label auditoria --state open --limit 1 --json number --jq '.[0].number // empty')
if [ -n "$EXISTENTE" ]; then
  gh issue edit "$EXISTENTE" --body-file informe.md
else
  gh issue create --title "Auditoría del repositorio" --label auditoria --body-file informe.md
fi
```

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Un issue nuevo cada ejecución | 52 issues al año y nadie los lee | Actualizar el que ya está abierto |
| `exit 1` en el primer hallazgo | Arreglas de uno en uno | Recoger todo, fallar al final |
| Un solo código de salida | «Roto» y «no cumple» se confunden | Códigos distintos |
| Salida solo para humanos | No se puede comparar ni encadenar | JSON primero |
| Reglas mezcladas con llamadas | No se pueden testear | Funciones puras |
| Auditar sin declarar `permissions` | Token con más poder del necesario | Mínimo explícito |
| Auditar cosas que no vas a arreglar | Ruido que enseña a ignorar el informe | Reglas accionables |

## 9. Trucos

- **`$GITHUB_STEP_SUMMARY`** acepta Markdown y aparece en la portada de la
  ejecución: el sitio más barato para dejar un informe
- **`gh issue list --json number --jq '.[0].number // empty'`** devuelve vacío en
  vez de `null` cuando no hay nada: es lo que hace que el `if` de arriba funcione
- **Guarda el JSON como artifact** aunque no lo mires: el día que quieras saber
  desde cuándo está roto algo, lo agradeces
- **`gh api rate_limit` al principio y al final** convierte el coste de tu
  auditoría en un número que puedes vigilar
- **Reglas con `id` estable**: es lo que permite comparar dos ejecuciones y decir
  «esto se rompió esta semana»
- **`workflow_dispatch` siempre**, junto al `schedule`: probar sin esperar al lunes

## 📚 Recursos Adicionales

- [Workflow syntax — `schedule`](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- [Job summaries](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/add-job-summaries)
- [Automatic token authentication](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication)
- [`gh issue` — manual](https://cli.github.com/manual/gh_issue)
- [Autograding de este bootcamp](../../../docs/autograding.md)

## ✅ Checklist de Verificación

- [ ] Tu guion separa recoger, evaluar y presentar
- [ ] La salida nativa es JSON y el Markdown se deriva de ella
- [ ] Distingues «hay hallazgos» de «no pude auditar» por código de salida
- [ ] Recoges todos los hallazgos antes de fallar
- [ ] El workflow declara `permissions` mínimas y tiene `workflow_dispatch`
- [ ] El informe acaba donde alguien lo ve, sin crear un issue por semana
