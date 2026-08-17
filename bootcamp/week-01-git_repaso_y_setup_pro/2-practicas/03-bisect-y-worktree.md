# Práctica 03 — Bisect y worktree

> Un bug entró hace 30 commits y nadie sabe cuál. Lo vas a encontrar en 5
> pruebas, automáticas.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 02](../1-teoria/02-historia-quirurgica.md)

## Contexto

"En la versión de la semana pasada esto funcionaba." Es el reporte de bug más
frecuente que existe, y también el más fácil de resolver: si sabes un punto
bueno y uno malo, `bisect` hace el resto por búsqueda binaria — 30 commits son 5
pruebas, no 30.

## Paso 1: Montar un repo con un bug enterrado

**Por qué**: necesitas una historia larga con un fallo introducido en un punto
que no recuerdas.

```bash
mkdir -p ~/sandbox/lab-bisect && cd ~/sandbox/lab-bisect
git init -b main

cat > multa.js <<'EOF'
function calcularMulta(dias) {
  if (dias <= 0) return 0;
  return dias * 300;
}
module.exports = { calcularMulta };
EOF

cat > test.js <<'EOF'
const { calcularMulta } = require('./multa.js');
const casos = [[0, 0], [1, 300], [10, 3000]];
for (const [entrada, esperado] of casos) {
  const real = calcularMulta(entrada);
  if (real !== esperado) {
    console.error(`FALLO: calcularMulta(${entrada}) = ${real}, esperado ${esperado}`);
    process.exit(1);
  }
}
console.log('OK');
EOF

git add . && git commit -qm "feat: cálculo de multa con tests"
git tag v1.0

# 20 commits de ruido, y en uno de ellos se cuela el bug
for i in $(seq 1 20); do
  echo "// cambio $i" >> multa.js
  if [ "$i" -eq 13 ]; then
    sed -i 's/dias \* 300/dias * 30/' multa.js   # 👈 el bug
  fi
  git add . && git commit -qm "chore: cambio $i"
done

node test.js
# FALLO: calcularMulta(1) = 30, esperado 300
```

**Verifica**:

```bash
git log --oneline | wc -l
# 21
node test.js; echo "exit: $?"
# exit: 1
```

## Paso 2: Bisect manual (para entender el mecanismo)

**Por qué**: antes de automatizarlo hay que ver qué hace.

```bash
git bisect start
git bisect bad            # HEAD está roto
git bisect good v1.0      # aquí funcionaba
```

Git te deja en un commit intermedio y te dice cuántos quedan:

```
Bisecting: 9 revisions left to test after this (roughly 3 steps)
```

En cada parada:

```bash
node test.js && git bisect good || git bisect bad
```

Repite hasta que imprima `<sha> is the first bad commit`.

**Verifica**:

```bash
git bisect log | tail -3
git bisect reset
```

## Paso 3: Bisect automático

**Por qué**: así se usa en la vida real. Un comando, cero interacción.

```bash
git bisect start HEAD v1.0
git bisect run node test.js
```

Salida final:

```
<sha> is the first bad commit
chore: cambio 13
```

**Verifica**:

```bash
git bisect reset
git show <sha> --stat
git show <sha> | grep 'dias \*'
# se ve el cambio de 300 a 30
```

Códigos de salida que interpreta `bisect run`:

| Exit code | Significado |
|-----------|-------------|
| `0` | Commit bueno |
| `1`-`124` (menos 125) | Commit malo |
| `125` | Sáltate este commit (no compila, no se puede probar) |
| `128`+ | Aborta el bisect |

## Paso 4: `worktree` — arreglarlo sin abandonar lo que hacías

**Por qué**: ya sabes cuál es el commit culpable, pero estás a medias de otra
cosa. `stash` funciona; `worktree` es mejor.

```bash
# Simula trabajo a medias, sin commitear
echo "// estoy en mitad de otra cosa" >> multa.js

# Segundo directorio de trabajo, mismo repositorio
git worktree add ../lab-bisect-fix -b fix/multa
cd ../lab-bisect-fix

sed -i 's/dias \* 30;/dias * 300;/' multa.js
node test.js
# OK
git commit -qam "fix: restaura la tarifa de multa a 300 por día"
```

**Verifica**:

```bash
git worktree list
# dos rutas, misma base .git
cd ../lab-bisect
git status --short
# tu trabajo a medias sigue intacto
```

## Paso 5: Limpiar

**Por qué**: los worktrees quedan registrados aunque borres la carpeta a mano.

```bash
cd ~/sandbox/lab-bisect
git worktree remove ../lab-bisect-fix
git worktree list
# solo queda el principal
```

**Verifica**:

```bash
git worktree list | wc -l
# 1
```

## ✅ Resultado

- [ ] Has encontrado el commit culpable a mano con `git bisect`
- [ ] Lo has encontrado otra vez con `git bisect run`, sin interacción
- [ ] Sabes qué significa el exit code 125
- [ ] Has trabajado en dos ramas a la vez con `worktree`, sin `stash`
- [ ] Has eliminado el worktree correctamente

Evidencia:

```bash
git bisect log > ~/sandbox/lab-bisect/evidencia-bisect.txt 2>/dev/null || true
```

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `bisect run` marca todo como malo | Tu comando falla siempre, también en el bueno | Pruébalo primero en el commit `good` |
| Un commit intermedio no compila | Historia con commits rotos | `git bisect skip` o exit 125 en el script |
| Terminas en un commit raro tras bisecar | Te dejaste el bisect abierto | `git bisect reset` |
| `worktree add` falla | Esa rama ya está activa en otro worktree | Usa `-b <rama-nueva>` |
| Borraste la carpeta del worktree a mano | Queda registrado | `git worktree prune` |
| `bisect` señala un merge | El bug entró en una rama fusionada | `git bisect --first-parent` para acotar |
