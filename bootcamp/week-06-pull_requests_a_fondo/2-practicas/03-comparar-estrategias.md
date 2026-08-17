# Práctica 03 — Comparar estrategias de merge

> Mergeas el mismo tipo de cambio con las tres estrategias y miras qué le hace
> cada una a la historia. Luego eliges la tuya.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 03](../1-teoria/03-estrategias-de-merge.md)

## Contexto

Leer que "squash aplana la historia" no convence a nadie. Verlo en tu propio
`git log`, sí. Trabajaremos en un repositorio de laboratorio para no ensuciar el
tuyo.

## Paso 1: Laboratorio con tres ramas

**Por qué**: necesitas tres PRs equivalentes para que la comparación sea justa.

```bash
gh repo create lab-merge --public --clone -y
cd lab-merge

echo "# Laboratorio de estrategias de merge" > README.md
git add . && git commit -qm "chore: commit inicial"
git push -qu origin main

for est in merge squash rebase; do
  git switch -qc "feat/$est" main
  echo "linea 1 de $est" >> notas.txt
  git add . && git commit -qm "feat($est): primer paso"
  echo "linea 2 de $est" >> notas.txt
  git add . && git commit -qm "wip"
  echo "linea 3 de $est" >> notas.txt
  git add . && git commit -qm "fix: corrige el paso anterior"
  git push -qu origin "feat/$est"
  gh pr create --base main --head "feat/$est" --title "Cambio con $est" --body "Tres commits, uno de ellos wip."
done

git switch -q main
gh pr list
```

**Verifica**: tres PRs abiertos, cada uno con tres commits.

## Paso 2: Habilitar las tres estrategias (solo aquí)

**Por qué**: en un repo real solo se deja una. En el laboratorio hacen falta las
tres.

```bash
gh repo edit --enable-merge-commit --enable-squash-merge --enable-rebase-merge
gh api repos/{owner}/{repo} --jq '{merge: .allow_merge_commit, squash: .allow_squash_merge, rebase: .allow_rebase_merge}'
```

## Paso 3: Merge commit

```bash
PR=$(gh pr list --head feat/merge --json number --jq '.[0].number')
gh pr merge "$PR" --merge --delete-branch
git switch main && git pull -q
git log --oneline --graph --all | head -12
```

**Verifica**: aparece un commit `Merge pull request #N` con la bifurcación
visible, y **los tres** commits originales, `wip` incluido.

## Paso 4: Squash

```bash
PR=$(gh pr list --head feat/squash --json number --jq '.[0].number')
gh pr merge "$PR" --squash --delete-branch
git pull -q
git log --oneline --graph | head -8
```

**Verifica**: **un solo** commit nuevo. Los tres originales no están en `main`.

Mira el título del commit:

```bash
git log -1 --format='%s%n%n%b'
```

Con la configuración por defecto el título puede ser `Cambio con squash (#N)` o
el del primer commit, según cómo esté el repositorio. Eso es exactamente lo que
se arregla en el paso 6.

## Paso 5: Rebase

```bash
PR=$(gh pr list --head feat/rebase --json number --jq '.[0].number')
gh pr merge "$PR" --rebase --delete-branch
git pull -q
git log --oneline --graph | head -10
```

**Verifica**: los tres commits aparecen en `main`, **sin** commit de merge y con
SHAs distintos a los originales. El `wip` está ahí, en la rama principal, para
siempre.

## Paso 6: Comparar

```bash
git log --oneline --graph --all
```

Contesta en tu cuaderno:

| Pregunta | Merge | Squash | Rebase |
|----------|-------|--------|--------|
| ¿Cuántos commits añade a `main`? | | | |
| ¿Llega el `wip` a `main`? | | | |
| ¿Se ve que existió una rama? | | | |
| ¿Es fácil revertir el PR entero? | | | |
| ¿`git bisect` es sencillo? | | | |

**Verifica**: puedes justificar una elección con datos, no con opinión.

## Paso 7: Configurar tu repositorio de verdad

**Por qué**: es el entregable. Una estrategia, las demás desactivadas.

```bash
cd ../<tu-repo>

gh repo edit \
  --enable-squash-merge \
  --enable-merge-commit=false \
  --enable-rebase-merge=false \
  --squash-merge-commit-message pr-title-description \
  --delete-branch-on-merge \
  --enable-auto-merge
```

> [!NOTE]
> `--squash-merge-commit-message pr-title-description` hace que el commit de
> `main` lleve el **título y el cuerpo del PR**. Con el valor por defecto acabas
> con commits titulados `wip` en la rama principal.

**Verifica**:

```bash
gh api repos/{owner}/{repo} --jq '{
  squash: .allow_squash_merge, merge: .allow_merge_commit, rebase: .allow_rebase_merge,
  auto: .allow_auto_merge, borrar: .delete_branch_on_merge,
  titulo: .squash_merge_commit_title, cuerpo: .squash_merge_commit_message}'
```

Solo `squash` en `true`.

## Paso 8: Documentar la decisión

**Por qué**: dentro de un año alguien preguntará por qué. Que la respuesta esté
escrita.

Añade a `CONTRIBUTING.md`:

```markdown
## Estrategia de merge

Este repositorio usa **squash merge** exclusivamente.

- Un PR = un commit en `main`: la historia se lee y `git bisect` es trivial
- El título del commit es el del PR, así que enlaza a la conversación
- Los commits intermedios quedan en el PR, que no se borra

Las ramas se eliminan automáticamente al mergear.
```

```bash
git add CONTRIBUTING.md
git commit -qm "docs: documenta la estrategia de merge del repositorio"
git push -q
```

## Paso 9: Probar auto-merge

```bash
git switch -qc chore/probar-auto-merge
echo "" >> README.md
git commit -qam "chore: prueba de auto-merge"
git push -qu origin HEAD
gh pr create --fill
gh pr merge --auto --squash
gh pr view --json autoMergeRequest --jq '.autoMergeRequest'
```

**Verifica**: al no haber checks obligatorios todavía, se mergea casi al
instante. En la Semana 08, con checks requeridos, esperará a que estén en verde.

## Paso 10: Limpiar el laboratorio

> [!WARNING]
> El siguiente comando **elimina permanentemente** el repositorio `lab-merge`.
> Comprueba el nombre antes de ejecutarlo.

```bash
gh repo delete <tu-usuario>/lab-merge --yes
```

## ✅ Resultado

- [ ] Has visto las tres estrategias sobre la misma historia
- [ ] Puedes justificar tu elección con la tabla del paso 6
- [ ] Tu repositorio tiene **una** estrategia habilitada
- [ ] El commit de squash usa título y cuerpo del PR
- [ ] Las ramas se borran solas y auto-merge está activo
- [ ] La decisión está documentada en `CONTRIBUTING.md`

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `--merge` rechazado | Esa estrategia está desactivada | Habilítala solo en el laboratorio |
| `gh repo edit` no cambia nada | Falta permiso de administración | Debe ser tu repositorio |
| Auto-merge no se puede activar | No está habilitado en el repositorio | `gh repo edit --enable-auto-merge` |
| El commit de squash sigue con mal título | El flag es `--squash-merge-commit-message` | Comprueba con `gh api` |
| Historia confusa tras el laboratorio | Es el objetivo del ejercicio | Por eso se hace en un repo desechable |
