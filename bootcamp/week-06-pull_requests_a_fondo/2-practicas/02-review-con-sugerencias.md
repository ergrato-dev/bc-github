# Práctica 02 — Revisar con sugerencias

> Revisas un PR con comentarios de línea, sugerencias aplicables y revisión por
> lotes. Aunque el PR sea tuyo.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 03](../1-teoria/03-review-a-fondo.md) y [04](../1-teoria/04-responder-a-la-review.md), práctica 01

## Contexto

En autoestudio no hay un compañero que revise. Da igual: la mecánica se aprende
igual revisando tu propio PR, y el hábito de releerse antes de mergear es de las
cosas que más mejoran el código.

> [!NOTE]
> GitHub no permite aprobar tu propio PR. Podrás comentar, sugerir y resolver
> hilos, que es lo que se practica aquí. El veredicto `Approve` lo verás cuando
> contribuyas a un repo ajeno (Semana 19).

## Paso 1: Un PR con defectos a propósito

**Por qué**: hace falta algo que revisar de verdad.

```bash
cd <tu-repo>
git switch main && git pull -q
git switch -c "feat/historial-socio"

cat >> src/index.js <<'EOF'

function historial(socio, prestamos) {
  var resultado = []
  for (var i = 0; i < prestamos.length; i++) {
    if (prestamos[i].socio == socio) {
      resultado.push(prestamos[i])
    }
  }
  return resultado
}
module.exports.historial = historial;
EOF

git add src/index.js
git commit -qm "feat: añade consulta de historial por socio"
git push -qu origin HEAD
gh pr create --fill
PR=$(gh pr view --json number --jq .number)
echo "PR #$PR"
```

**Verifica**: el PR existe y el diff tiene el código nuevo.

Defectos plantados: `var` en vez de `const`, `==` en vez de `===`, sin validar
entradas, y un bucle donde iría `filter`.

## Paso 2: Empezar una revisión por lotes

**Por qué**: comentar de uno en uno manda una notificación por comentario.

En la web: pestaña **Files changed** → clic en el `+` de una línea → escribe el
comentario → **Start a review** (no *Add single comment*).

**Verifica**: el botón superior derecho muestra *Finish your review* con un
contador de comentarios pendientes.

## Paso 3: Una sugerencia aplicable

**Por qué**: si puedes escribir la corrección, escríbela. Ahorra una ronda
entera.

Comenta sobre la línea del `==`:

````markdown
bloqueante: comparación no estricta. Con `==`, el id numérico 3 y la cadena
"3" se consideran iguales.

```suggestion
    if (prestamos[i].socio === socio) {
```
````

**Verifica**: el bloque se ve como una propuesta de cambio, con botón
*Commit suggestion*.

## Paso 4: Una sugerencia multilínea

**Por qué**: el caso más útil, y el que casi nadie conoce.

Selecciona **todo el bucle** en el diff (clic en la primera línea, `Shift`+clic
en la última) y comenta:

````markdown
sugerencia: `filter` expresa la intención y elimina el índice manual.

```suggestion
function historial(socio, prestamos) {
  if (!socio) throw new Error("socio es obligatorio");
  return prestamos.filter((p) => p.socio === socio);
}
```
````

**Verifica**: la sugerencia cubre varias líneas.

## Paso 5: Marcar la severidad

**Por qué**: el autor tiene que saber qué es obligatorio y qué es opinión.

Añade un tercer comentario, con prefijo:

```
nit: `resultado` no aporta nada como nombre. `prestamosDelSocio` se lee mejor.
No bloquea.
```

Convención: `bloqueante:`, `sugerencia:`, `nit:`.

**Verifica**: tres comentarios pendientes en el lote.

## Paso 6: Cerrar la revisión

**Por qué**: es el momento en que se manda **una** notificación con todo.

*Finish your review* → **Comment** → resumen:

```
Tres cosas: la comparación no estricta es bloqueante, el filter es una mejora
clara y el nombre es opinable. Con lo primero arreglado, entra.
```

**Verifica**:

```bash
gh pr view $PR --json reviews --jq '.reviews[] | {estado: .state, autor: .author.login}'
```

## Paso 7: Aplicar las sugerencias

**Por qué**: es el flujo que hace que las sugerencias merezcan la pena.

En **Files changed**, en cada sugerencia: *Add suggestion to batch*. Al terminar,
**Commit suggestions** — un solo commit con todas.

**Verifica**:

```bash
gh pr view $PR --json commits --jq '.commits | length'
git pull -q
gh pr diff $PR | head -30
```

## Paso 8: Resolver las conversaciones

**Por qué**: un hilo sin resolver es algo pendiente. Cuando no queda ninguno, el
PR está listo.

Marca **Resolve conversation** en los hilos atendidos. El de `nit:` puedes
resolverlo con una respuesta ("lo dejo así por ahora") — resolver no significa
obedecer.

**Verifica**:

```bash
gh api graphql -F owner='<tu-usuario>' -F repo='<tu-repo>' -F pr=$PR -f query='
  query($owner:String!, $repo:String!, $pr:Int!) {
    repository(owner:$owner, name:$repo) {
      pullRequest(number:$pr) {
        reviewThreads(first:20) { nodes { isResolved } }
      }
    }
  }' --jq '[.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false)] | length'
# 0
```

## Paso 9: Mergear

```bash
gh pr merge $PR --squash --delete-branch
```

**Verifica**: `main` tiene el código ya corregido, no la versión con defectos.

## ✅ Resultado

- [ ] Una revisión por lotes con 3 comentarios y un resumen
- [ ] Una sugerencia de una línea y otra multilínea
- [ ] Severidades marcadas (`bloqueante:`, `sugerencia:`, `nit:`)
- [ ] Sugerencias aplicadas en un solo commit
- [ ] Cero hilos sin resolver
- [ ] PR mergeado con el código corregido

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| No puedes aprobar tu PR | GitHub no lo permite | Usa `Comment`; `Approve` llega en la Semana 19 |
| La sugerencia no se puede aplicar | El código cambió desde el comentario | Reescríbela sobre el diff actual |
| La sugerencia sale como texto | Falta el lenguaje `suggestion` en el bloque | ` ```suggestion ` exacto |
| No aparece *Add suggestion to batch* | Solo lo ve quien puede escribir en la rama | Correcto: es tu repo, revisa que sea tu PR |
| La consulta GraphQL falla | `pullRequest` necesita `Int!` | Usa `-F pr=42`, no `-f` |
