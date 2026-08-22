# Práctica 04 — Conflictos y stacked PRs

> Provocas un conflicto, lo resuelves con el ancestro común a la vista, y montas
> una pila de dos PRs encadenados.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 07](../1-teoria/07-conflictos-y-stacked.md)

## Contexto

Dos cosas que van a pasarte y conviene que pasen por primera vez en un ejercicio
controlado, no con una entrega encima.

## Paso 1: Preparar el terreno

```bash
cd <tu-repo>
git config --global merge.conflictStyle zdiff3
git config --global rerere.enabled true
git switch main && git pull -q
```

**Verifica**:

```bash
git config --get merge.conflictStyle
# zdiff3
```

`zdiff3` añade el **ancestro común** al marcador de conflicto. Cambia mucho la
experiencia: ves de dónde partían los dos lados.

## Paso 2: Provocar el conflicto

**Por qué**: dos ramas tocando la misma línea es el caso real.

```bash
git switch -qc fix/tarifa-a
sed -i 's/diasRetraso \* 300/diasRetraso * 350/' src/index.js
git commit -qam "fix: sube la tarifa de multa a 350"
git push -qu origin HEAD
gh pr create --fill

git switch -q main
git switch -qc fix/tarifa-b
sed -i 's/diasRetraso \* 300/diasRetraso * 250/' src/index.js
git commit -qam "fix: baja la tarifa de multa a 250"
git push -qu origin HEAD
gh pr create --fill
```

**Verifica**: dos PRs abiertos tocando la misma línea.

## Paso 3: Mergear el primero

```bash
PR_A=$(gh pr list --head fix/tarifa-a --json number --jq '.[0].number')
gh pr merge "$PR_A" --squash --delete-branch
```

**Verifica**:

```bash
PR_B=$(gh pr list --head fix/tarifa-b --json number --jq '.[0].number')
gh pr view "$PR_B" --json mergeable,mergeStateStatus --jq '{mergeable, mergeStateStatus}'
# mergeable: "CONFLICTING"
```

## Paso 4: Resolverlo en local

**Por qué**: en el editor web no puedes ejecutar los tests.

```bash
git switch fix/tarifa-b
git fetch -q origin
git rebase origin/main
```

Verás el conflicto con tres bloques:

```
<<<<<<< HEAD
  return diasRetraso * 350;
||||||| parent of ...
  return diasRetraso * 300;
=======
  return diasRetraso * 250;
>>>>>>> fix: baja la tarifa de multa a 250
```

El bloque del medio es lo que había antes. Con eso a la vista, la decisión es
informada: ambas ramas partían de 300, una subió y otra bajó. Decide y edita:

```bash
sed -i '/^<<<<<<<\|^|||||||\|^=======\|^>>>>>>>/d' src/index.js   # elimina marcadores
# deja SOLO la línea que quieres; revisa el archivo a mano
grep -n "diasRetraso \*" src/index.js
```

> [!WARNING]
> Ese `sed` borra los marcadores pero **deja las tres versiones**. Abre el
> archivo y quédate con una sola. No hay atajo: resolver un conflicto es una
> decisión humana.

```bash
node --test 2>/dev/null || node -e "require('./src/index.js')"
git add src/index.js
git rebase --continue
git push --force-with-lease
```

**Verifica**:

```bash
gh pr view "$PR_B" --json mergeable --jq .mergeable
# "MERGEABLE"
```

## Paso 5: Documentar la resolución

**Por qué**: quien revise necesita saber por qué se quedó ese valor.

```bash
gh pr comment "$PR_B" --body "Conflicto con #$PR_A resuelto: ambos partíamos de 300. Me quedo con 250 porque es lo que fija el reglamento vigente; abro un issue para revisar el 350."
gh pr merge "$PR_B" --squash --delete-branch
```

**Verifica**: `main` tiene un único valor de tarifa.

## Paso 6: Montar una pila de dos PRs

**Por qué**: es la alternativa a un PR de 900 líneas.

```bash
git switch main && git pull -q

# PR 1/2 — la base
git switch -qc feat/1-modelo-prestamo
cat >> src/index.js <<'EOF'

// Modelo de préstamo del dominio.
function crearPrestamo(socio, ejemplar, fecha) {
  return { socio, ejemplar, fecha, devuelto: false };
}
module.exports.crearPrestamo = crearPrestamo;
EOF
git commit -qam "feat: añade el modelo de préstamo"
git push -qu origin HEAD
gh pr create --base main --title "1/2: modelo de préstamo" \
  --body "Primero de una pila de 2. El siguiente (#siguiente) construye encima."

# PR 2/2 — encima del anterior
git switch -qc feat/2-devolucion feat/1-modelo-prestamo
cat >> src/index.js <<'EOF'

// Marca un préstamo como devuelto y calcula la multa.
function devolver(prestamo, diasRetraso) {
  return { ...prestamo, devuelto: true, multa: calcularMulta(diasRetraso) };
}
module.exports.devolver = devolver;
EOF
git commit -qam "feat: añade la devolución con cálculo de multa"
git push -qu origin HEAD
gh pr create --base feat/1-modelo-prestamo --draft \
  --title "2/2: devolución con multa" \
  --body "Segundo de la pila. Base: \`feat/1-modelo-prestamo\`. En draft hasta que se mergee el primero."
```

**Verifica**:

```bash
gh pr list --json number,title,baseRefName --jq '.[] | "\(.number) \(.title) ← base: \(.baseRefName)"'
```

El segundo PR tiene como base la rama del primero, **no** `main`. Su diff
muestra solo su parte.

## Paso 7: Mergear la pila

```bash
PR1=$(gh pr list --head feat/1-modelo-prestamo --json number --jq '.[0].number')
gh pr merge "$PR1" --squash --delete-branch
```

**Verifica**:

```bash
PR2=$(gh pr list --head feat/2-devolucion --json number --jq '.[0].number')
gh pr view "$PR2" --json baseRefName --jq .baseRefName
# "main"  ← GitHub cambió la base sola
```

Con **squash**, el commit de `main` no existe en la historia de `feat/2`, así que
su diff puede aparecer duplicado. Se arregla con:

```bash
git switch feat/2-devolucion
git fetch -q origin
git rebase --onto origin/main feat/1-modelo-prestamo feat/2-devolucion
git push --force-with-lease
```

Se lee: reaplica sobre `origin/main` los commits de `feat/2-devolucion` que no
estén en `feat/1-modelo-prestamo`.

```bash
gh pr ready "$PR2"
gh pr merge "$PR2" --squash --delete-branch
```

**Verifica**:

```bash
git switch main && git pull -q
git log --oneline -4
grep -c "crearPrestamo\|devolver" src/index.js
```

Los dos cambios están, sin duplicados.

## ✅ Resultado

- [ ] `zdiff3` y `rerere` configurados
- [ ] Un conflicto real resuelto en local, con los tests pasando
- [ ] La resolución documentada en un comentario del PR
- [ ] Una pila de dos PRs con bases encadenadas
- [ ] La pila mergeada con `rebase --onto`, sin duplicados en `main`

```bash
./scripts/verificar-semana.sh 06 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| No ves el bloque del ancestro | Falta `zdiff3` | `git config --global merge.conflictStyle zdiff3` |
| `push` rechazado tras el rebase | Reescribiste la historia | `--force-with-lease` |
| `--force-with-lease` rechazado | Alguien empujó a esa rama | `git fetch` y revisa antes de forzar |
| El PR 2 muestra el diff del PR 1 | Base equivocada | `gh pr edit --base feat/1-...` |
| Diff duplicado tras mergear el primero | Squash reescribió el commit | `git rebase --onto origin/main <base-vieja> <tu-rama>` |
| Te pierdes en el rebase | Estado intermedio | `git rebase --abort` y empieza otra vez |
