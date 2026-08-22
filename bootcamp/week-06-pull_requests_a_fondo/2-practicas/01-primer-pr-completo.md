# Práctica 01 — Un PR de principio a fin

> Del issue al merge, con plantilla, descripción y cierre automático.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-anatomia-de-un-pr.md) y [02](../1-teoria/02-abrir-buenos-prs.md), backlog de la Semana 03

## Contexto

Hasta ahora has empujado a `main` directamente. A partir de esta semana, todo
entra por PR — que es como se trabaja en cualquier equipo y lo que exigirá el
ruleset de la Semana 08.

## Paso 1: La plantilla de PR

**Por qué**: precarga la estructura para no depender de la memoria.

```bash
cd <tu-repo>
mkdir -p .github
cat > .github/pull_request_template.md <<'EOF'
## Qué cambia

<!-- Una o dos frases. Qué hace este PR. -->

## Por qué

<!-- Fixes #N -->

## Cómo probarlo

```bash
node --test
```

## Notas para quien revise

<!-- Decisiones dudosas, alternativas descartadas, dónde mirar primero. -->

---

- [ ] Probado en local
- [ ] Documentación actualizada si hacía falta
EOF

git add .github/pull_request_template.md
git commit -qm "docs: añade plantilla de pull request"
git push -q
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/contents/.github/pull_request_template.md --jq .type
# "file"
```

## Paso 2: Elegir un issue y crear la rama

**Por qué**: la rama nombrada por el issue conecta el trabajo con su motivo.

```bash
gh issue list --state open --limit 10
ISSUE=<numero>

git switch main && git pull -q
git switch -c "feat/issue-$ISSUE-calculo-multa"
```

**Verifica**:

```bash
git branch --show-current
```

## Paso 3: El cambio, en commits que se leen

**Por qué**: si eliges squash da igual el número de commits, pero el revisor
mira el diff **por commits** cuando el PR es grande.

```bash
cat >> src/index.js <<'EOF'

// Calcula la multa por retraso en la devolución.
// Los importes están en centavos.
function calcularMulta(diasRetraso) {
  if (diasRetraso <= 0) return 0;
  return diasRetraso * 300;
}
module.exports.calcularMulta = calcularMulta;
EOF

git add src/index.js
git commit -qm "feat: calcula la multa por retraso de devolución

El reglamento fija 300 por día de retraso. Devolver el mismo día no
genera multa."
```

**Verifica**:

```bash
git log --oneline -1
```

## Paso 4: Abrir el PR

**Por qué**: `--fill` reutiliza tus mensajes de commit. Si escribiste buenos
mensajes, la descripción ya está medio hecha.

```bash
git push -qu origin HEAD
gh pr create --fill --draft
```

Edita la descripción para completar la plantilla y **añade `Fixes #N`**:

```bash
gh pr edit --body "$(cat <<EOF
## Qué cambia

Añade \`calcularMulta(diasRetraso)\` con la tarifa del reglamento.

## Por qué

Fixes #$ISSUE. Hasta ahora los retrasos no generaban ningún cargo.

## Cómo probarlo

\`\`\`bash
node --test
\`\`\`

Casos: 0 días → 0 · 1 día → 300 · 10 días → 3000.

## Notas para quien revise

Los importes van en centavos, por eso no hay decimales.
EOF
)"
```

**Verifica**:

```bash
gh pr view --json number,isDraft,body --jq '{n: .number, draft: .isDraft}'
```

## Paso 5: Comprobar el enlace con el issue

**Por qué**: si el enlace no aparece, `Fixes` está mal escrito o en el sitio
equivocado, y el issue no se cerrará.

```bash
gh pr view --json closingIssuesReferences --jq '.closingIssuesReferences'
```

**Verifica**: aparece el issue. Si sale vacío, revisa que `Fixes #N` esté en la
**descripción** del PR.

## Paso 6: De draft a listo

**Por qué**: un draft no notifica a los revisores. Pasarlo a listo es el gesto
que pide revisión.

```bash
gh pr ready
gh pr view --json isDraft --jq .isDraft
# false
```

## Paso 7: Mergear y comprobar el cierre

**Por qué**: es el momento en que se ve si toda la cadena funciona.

```bash
gh pr merge --squash --delete-branch
```

**Verifica**:

```bash
gh issue view "$ISSUE" --json state,stateReason --jq '{state, stateReason}'
# {"state": "CLOSED", "stateReason": "COMPLETED"}

git switch main && git pull -q
git log --oneline -3
```

El issue se cerró **solo** y la rama desapareció.

## Paso 8: Repetir dos veces más

**Por qué**: la práctica 03 necesita tres PRs para comparar estrategias, y el
proyecto pide tres mergeados.

Repite los pasos 2-7 con otros dos issues, con cambios pequeños y reales.

**Verifica**:

```bash
gh pr list --state merged --json number,title --jq 'length'
# >= 3
```

## ✅ Resultado

- [ ] `.github/pull_request_template.md` en el repositorio
- [ ] 3 PRs mergeados, cada uno cerrando un issue
- [ ] `closingIssuesReferences` no vacío en todos
- [ ] Las ramas se borraron al mergear
- [ ] `main` con historia legible

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| El issue no se cierra al mergear | `Fixes #N` en un comentario, no en la descripción | `gh pr edit --body` |
| `no commits between main and ...` | No hiciste commit, o estás en `main` | Comprueba `git branch --show-current` |
| La plantilla no aparece | No está en la rama por defecto | Push a `main` primero |
| `--delete-branch` falla | La rama es la actual | `git switch main` antes |
| `gh pr create` no encuentra el remoto | La rama no está publicada | `git push -u origin HEAD` |
