# Práctica 02 — Historia limpia

> Seis commits que nadie puede leer se convierten en dos que se explican solos.

**Duración estimada**: 50 min
**Prerrequisitos**: [Práctica 01](01-rescate-con-reflog.md) completada

## Contexto

Vas a abrir tu primer Pull Request y tu rama tiene esto:

```
feat: añade cálculo de multa
wip
arreglo del wip
feat: añade validación de socio
typo
ya
```

Nadie va a revisar eso. Y cuando dentro de seis meses `git bisect` te deje en el
commit `ya`, no sabrás qué hacía. Vamos a arreglarlo antes de publicar.

## Paso 1: Reproducir la historia sucia

**Por qué**: necesitas exactamente el desastre típico, no uno inventado.

```bash
mkdir -p ~/sandbox/lab-rebase && cd ~/sandbox/lab-rebase
git init -b main
echo "# Biblioteca" > README.md
git add . && git commit -qm "chore: inicializa proyecto"

echo "function calcularMulta(dias) { return dias * 500 }" > multa.js
git add . && git commit -qm "feat: añade cálculo de multa"

echo "// probando" >> multa.js
git add . && git commit -qm "wip"

sed -i 's/500/300/' multa.js
git add . && git commit -qm "arreglo del wip"

echo "function puedePrestar(socio) { return socio.activo }" > socio.js
git add . && git commit -qm "feat: añade validación de socio"

sed -i 's/activo/estaActivo/' socio.js
git add . && git commit -qm "typo"

echo "// listo" >> socio.js
git add . && git commit -qm "ya"

git log --oneline
```

**Verifica**:

```bash
git log --oneline | wc -l
# 7
```

## Paso 2: Red de seguridad antes de reescribir

**Por qué**: `rebase -i` reescribe. Si te equivocas, quieres volver en un
comando y no depender de leer bien el reflog con prisa.

```bash
git branch backup-antes-de-rebase
git branch
```

**Verifica**:

```bash
git rev-parse backup-antes-de-rebase HEAD
# los dos SHAs deben ser iguales
```

## Paso 3: El rebase interactivo

**Por qué**: agrupar cada arreglo con el commit al que pertenece.

```bash
git rebase -i HEAD~6
```

Deja el editor así — `wip` y `arreglo del wip` se funden en el commit de la
multa; `typo` y `ya` en el de socio:

```
pick <sha> feat: añade cálculo de multa
fixup <sha> wip
fixup <sha> arreglo del wip
pick <sha> feat: añade validación de socio
fixup <sha> typo
fixup <sha> ya
```

Guarda y sal.

**Verifica**:

```bash
git log --oneline
# 3 commits: chore + 2 feat
git show --stat HEAD~1 | grep multa.js
# el contenido de los fixup sigue ahí
grep 300 multa.js
# el valor final es el correcto
```

## Paso 4: Mejorar los mensajes con `reword`

**Por qué**: un mensaje de commit tiene un cuerpo donde cabe el *porqué*. El
título dice qué cambió; el cuerpo, por qué.

```bash
git rebase -i HEAD~2
```

Cambia el primer `pick` por `reword`, guarda. En el editor del mensaje:

```
feat: calcula la multa por retraso de préstamo

500 era el valor del enunciado inicial; el reglamento vigente fija 300 por día.
```

**Verifica**:

```bash
git log -1 --format='%s%n%n%b' HEAD~1
```

## Paso 5: `--autosquash`, que es como se hace de verdad

**Por qué**: en vez de recolocar líneas a mano, marcas cada arreglo en el
momento de hacerlo y el rebase se ordena solo.

```bash
git config --global rebase.autosquash true

# Un arreglo al commit de la multa
TARGET=$(git log --oneline | grep multa | head -1 | cut -d' ' -f1)
echo "// valida entrada" >> multa.js
git add . && git commit -q --fixup "$TARGET"

git log --oneline
# aparece "fixup! feat: calcula la multa..."

git rebase -i --autosquash HEAD~3
# el editor ya trae el fixup colocado y con el verbo puesto: guarda y sal
```

**Verifica**:

```bash
git log --oneline
# vuelven a ser 3 commits, sin rastro del "fixup!"
grep "valida entrada" multa.js
# el cambio sigue ahí
```

## Paso 6: Comparar con el backup

**Por qué**: reescribir historia debe cambiar la **forma**, nunca el
**contenido**.

```bash
git diff backup-antes-de-rebase HEAD
# sin salida: el árbol final es idéntico
```

Si ese diff no está vacío, has perdido algo en el camino: vuelve con
`git reset --hard backup-antes-de-rebase` y repite.

**Verifica**:

```bash
git diff backup-antes-de-rebase HEAD --stat | wc -l
# 0
```

## ✅ Resultado

- [ ] 7 commits reducidos a 3, sin cambiar el contenido final
- [ ] Un commit con cuerpo que explica el porqué
- [ ] `--autosquash` funcionando con `commit --fixup`
- [ ] `git diff backup HEAD` vacío
- [ ] `rebase.autosquash` activo globalmente

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Conflicto durante el rebase | Dos commits tocan la misma línea | Resuelve, `git add`, `git rebase --continue` |
| Te has perdido a mitad | Estado intermedio | `git rebase --abort` y empiezas de nuevo |
| Historia irreconocible | Verbos mal puestos | `git reset --hard backup-antes-de-rebase` |
| El editor no es el que quieres | `core.editor` sin configurar | `git config --global core.editor "code --wait"` |
| `fixup!` no se coloca solo | Falta `--autosquash` o el título no coincide | Usa `git commit --fixup <sha>`, no escribas el prefijo a mano |
| Ya habías empujado la rama | Reescribir lo publicado rompe a los demás | `git push --force-with-lease`, y solo si la rama es tuya |
