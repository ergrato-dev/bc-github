# Práctica 03 — CodeQL en verde

> Dependabot cubre lo que instalas. Esta práctica cubre lo que escribes: vas a
> activar el análisis, meter una vulnerabilidad de verdad, ver a CodeQL seguir el
> camino del dato desde la entrada hasta la llamada peligrosa, arreglarla, y
> quedarte con un análisis avanzado que también revisa tus propios workflows.

**Duración estimada**: 55 min
**Prerrequisitos**: [Teoría 06](../1-teoria/06-code-scanning-y-codeql.md).
Tu repositorio con código TypeScript o JavaScript en la rama por defecto

## Paso 1: Activar el análisis por defecto

**Por qué**: es el montaje que GitHub mantiene por ti. Empezar por el avanzado es
heredar un workflow que hay que cuidar sin haber comprobado antes si el sencillo
te basta.

Mira primero qué lenguajes detecta:

```bash
gh api repos/{owner}/{repo}/code-scanning/default-setup
# {"state":"not-configured","languages":["javascript-typescript",...],"query_suite":"default", ...}
```

Actívalo con la suite ampliada — en un proyecto pequeño el ruido extra es
asumible y encuentra bastante más:

```bash
gh api repos/{owner}/{repo}/code-scanning/default-setup --method PATCH \
  -f state=configured \
  -f query_suite=extended \
  -f 'languages[]=javascript-typescript'
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/code-scanning/default-setup \
  --jq '{state, query_suite, languages}'
# {"state":"configured","query_suite":"extended","languages":["javascript-typescript"]}
```

## Paso 2: Esperar al primer análisis

**Por qué**: hasta que no haya un análisis, todos los endpoints de alertas
devuelven `404 no analysis found`, y eso parece un error de permisos sin serlo.

```bash
gh run list --limit 5 --json name,status,conclusion
```

Cuando termine:

```bash
gh api "repos/{owner}/{repo}/code-scanning/analyses?per_page=5" \
  --jq '.[] | {herramienta: .tool.name, categoria: .category, resultados: .results_count, fecha: .created_at}'
```

**Verifica** que aparece al menos un análisis con `tool.name` igual a `CodeQL`.

## Paso 3: Introducir la vulnerabilidad

**Por qué**: un analizador que nunca ha encontrado nada tuyo no te ha demostrado
que funcione. Y ver el camino completo de un dato contaminado enseña más sobre
seguridad que cualquier lista de buenas prácticas.

Este código construye un comando de shell concatenando un argumento de la línea
de comandos. Es el patrón que detecta la consulta
`js/shell-command-injection-from-environment`:

```bash
git switch -c feat/informe-de-carpeta
mkdir -p src
cat > src/informe.ts <<'EOF'
import { exec } from "node:child_process";

// Genera un informe del contenido de una carpeta del proyecto.
export function informeDeCarpeta(): void {
  const carpeta = process.argv[2] ?? ".";
  exec(`ls -la ${carpeta}`, (error, salida) => {
    if (error) {
      console.error(error.message);
      return;
    }
    console.log(salida);
  });
}
EOF
git add src/informe.ts
git commit -m "feat: informe del contenido de una carpeta"
git push -u origin feat/informe-de-carpeta
gh pr create --fill
```

> [!NOTE]
> Es código deliberadamente vulnerable en un repositorio público. No lo dejes
> ahí: el Paso 5 lo arregla, y el arreglo es parte del entregable de la semana.

## Paso 4: Leer la alerta

**Por qué**: la alerta aparece **en el pull request**, que es donde arreglarla
cuesta cinco minutos en vez de dos semanas.

Espera a que termine el análisis del pull request:

```bash
gh pr checks
```

**Verifica** en el pull request que hay un comentario de code scanning sobre
`src/informe.ts`. Y por API:

```bash
gh api "repos/{owner}/{repo}/code-scanning/alerts?state=open&per_page=100" \
  --jq '.[] | {
    n: .number,
    regla: .rule.id,
    severidad: .rule.security_severity_level,
    archivo: .most_recent_instance.location.path,
    linea: .most_recent_instance.location.start_line
  }'
```

Abre la alerta en la interfaz y pulsa **Show paths**. Ahí está lo que un linter
no puede hacer: el recorrido del valor desde `process.argv[2]` hasta la llamada a
`exec`, paso a paso.

Si el pull request ofrece **Copilot Autofix**, léelo antes de aplicarlo. Es un
borrador, no un botón de cerrar alertas.

## Paso 5: Arreglarlo

**Por qué**: el arreglo real no es escapar la cadena, es no construir una cadena.
`execFile` recibe los argumentos por separado y no lanza un shell, así que no hay
nada que inyectar.

```bash
cat > src/informe.ts <<'EOF'
import { execFile } from "node:child_process";
import { resolve, relative, isAbsolute } from "node:path";

// Genera un informe del contenido de una carpeta del proyecto.
export function informeDeCarpeta(): void {
  const solicitada = resolve(process.cwd(), process.argv[2] ?? ".");
  const dentroDelProyecto = relative(process.cwd(), solicitada);

  if (dentroDelProyecto.startsWith("..") || isAbsolute(dentroDelProyecto)) {
    console.error("La carpeta tiene que estar dentro del proyecto.");
    return;
  }

  execFile("ls", ["-la", solicitada], (error, salida) => {
    if (error) {
      console.error(error.message);
      return;
    }
    console.log(salida);
  });
}
EOF
git commit -am "fix: no construir el comando de shell por concatenación"
git push
```

**Verifica** que el análisis del pull request vuelve en verde y que, tras
fusionar, la alerta se cierra sola:

```bash
gh pr merge --squash --delete-branch

# un par de minutos después
gh api "repos/{owner}/{repo}/code-scanning/alerts?state=open&per_page=100" --jq 'length'
# 0

gh api "repos/{owner}/{repo}/code-scanning/alerts?state=fixed&per_page=100" \
  --jq '.[] | {n: .number, regla: .rule.id, state}'
```

Una alerta `fixed` no desaparece. Es el registro de que llegaste a tenerla y de
que la cerraste.

## Paso 6: Pasar al análisis avanzado

**Por qué**: el montaje por defecto no analiza tus workflows, y después de la
Semana 11 tienes bastantes. El lenguaje `actions` de CodeQL busca justo eso:
inyecciones en `run`, expresiones peligrosas, `pull_request_target` mal usado.

Los dos montajes **no conviven**. Hay que apagar el primero:

```bash
gh api repos/{owner}/{repo}/code-scanning/default-setup --method PATCH \
  -f state=not-configured

gh api repos/{owner}/{repo}/code-scanning/default-setup --jq '.state'
# not-configured
```

Ahora el workflow:

```bash
git switch -c ci/codeql-avanzado
cat > .github/workflows/codeql.yml <<'EOF'
name: CodeQL

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "24 5 * * 1"

permissions:
  contents: read

jobs:
  analizar:
    name: Analizar ${{ matrix.language }}
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read
    strategy:
      fail-fast: false
      matrix:
        language: [javascript-typescript, actions]
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

      - uses: github/codeql-action/init@db488ddef3bf6cb639b32c2e9a7c0a7ea8271d28 # v4.37.8
        with:
          languages: ${{ matrix.language }}
          queries: security-extended

      - uses: github/codeql-action/analyze@db488ddef3bf6cb639b32c2e9a7c0a7ea8271d28 # v4.37.8
        with:
          category: "/language:${{ matrix.language }}"
EOF
git add .github/workflows/codeql.yml
git commit -m "ci: analizar el código y los workflows con CodeQL"
git push -u origin ci/codeql-avanzado
gh pr create --fill
```

Cuatro cosas que están ahí por el temario y no por casualidad:

- `security-events: write` **en el job**, que es el permiso que publica los
  resultados; el workflow se queda en `contents: read`
- Las dos actions **pinneadas por SHA** con el tag en comentario (Semana 11)
- `fail-fast: false`, para que el fallo de un lenguaje no cancele el otro
- Una `category` distinta por lenguaje: sin eso, un análisis cierra las alertas
  del otro

```bash
gh pr merge --squash --delete-branch
gh run watch
```

**Verifica** que ahora hay análisis de los dos lenguajes:

```bash
gh api "repos/{owner}/{repo}/code-scanning/analyses?per_page=100" \
  --jq 'group_by(.category) | map({categoria: .[0].category, analisis: length})'
```

## Paso 7 (opcional): Que el análisis bloquee

**Por qué**: una alerta que no impide fusionar es información. Un check
obligatorio es una regla.

Añade el check de CodeQL a los required checks de tu ruleset de la Semana 08. A
partir de ahí, un pull request que introduzca una alerta no se puede fusionar.

**Verifica**:

```bash
gh api repos/{owner}/{repo}/rulesets --jq '.[].id' | while read -r id; do
  gh api "repos/{owner}/{repo}/rulesets/$id" \
    --jq '.rules[] | select(.type=="required_status_checks") | .parameters.required_status_checks[].context'
done
```

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| `404 no analysis found` | Todavía no ha corrido ningún análisis | Esperar al primero |
| `403` al listar alertas | Sin permiso de escritura sobre el repo | Se leen solo en repos propios |
| El workflow falla con «default setup is enabled» | Los dos montajes no conviven | Apagar el por defecto primero |
| No aparece la alerta esperada | La suite `default` es más estrecha | `extended` / `security-extended` |
| El análisis de `actions` no encuentra nada | Es buena señal | Comprobar que el análisis existe |
| Las alertas del segundo lenguaje cierran las del primero | Misma `category` | Una por lenguaje |
| `Resource not accessible by integration` | Falta `security-events: write` | En el job, no en el workflow |

## ✅ Resultado

- [ ] Has activado el análisis por defecto por API y lo has comprobado
- [ ] Has visto tu primer análisis de CodeQL en `code-scanning/analyses`
- [ ] Has provocado una alerta real y has leído su camino en la interfaz
- [ ] La has arreglado sin construir la orden por concatenación
- [ ] La alerta está en `fixed` y no queda ninguna abierta
- [ ] Has migrado al análisis avanzado apagando antes el por defecto
- [ ] El workflow analiza también el lenguaje `actions`
- [ ] Las actions van pinneadas por SHA y los permisos viven en el job

## 🔗 Siguiente

[Práctica 04 — SARIF de terceros](04-sarif-de-terceros.md)

---

← [Volver a la Semana 13](../README.md)
