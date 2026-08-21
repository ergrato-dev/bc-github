# Rescate y arqueología

> Todo lo que llegó a ser un commit sigue en `.git/objects`. La pregunta nunca es
> "¿se perdió?", sino "¿con qué comando lo encuentro?".

## 🎯 Objetivos

- Recuperar cualquier commit "perdido" con `reflog`, incluso tras un `reset --hard`
- Distinguir qué se puede rescatar y qué no se puede rescatar de ninguna manera
- Encontrar objetos huérfanos con `git fsck` cuando el reflog no llega
- Usar `stash` sin convertirlo en un archivador de cosas olvidadas
- Buscar en la historia: cuándo apareció una línea, quién la tocó, dónde estaba un archivo borrado

## 1. Qué problema resuelve

Los comandos que dan miedo (`reset --hard`, `rebase`, `checkout` de una rama
equivocada) dan miedo porque parecen irreversibles. No lo son. Git lleva un
registro privado de cada movimiento de `HEAD` y no borra objetos hasta que pasa
el recolector de basura, semanas después.

La otra mitad de este archivo es lo contrario del rescate: **arqueología**.
Buscar en una historia de miles de commits cuándo entró una línea, por qué, y
qué había antes.

## 2. `reflog`: el deshacer universal

`reflog` registra cada movimiento de `HEAD`: commits, checkouts, resets,
rebases, merges, cherry-picks.

```bash
git reflog
```

```
a1b2c3d HEAD@{0}: reset: moving to HEAD~3
9f8e7d6 HEAD@{1}: commit: feat: añade validación de socio
3c2b1a0 HEAD@{2}: commit: wip
7d6c5b4 HEAD@{3}: checkout: moving from main to feature/socios
```

Volver a donde estabas antes del desastre:

```bash
git reset --hard HEAD@{1}
```

O rescatar solo un commit, sin mover la rama:

```bash
git cherry-pick 9f8e7d6
```

### El reflog de cada rama

`HEAD@{n}` no es lo único que hay. Cada rama tiene el suyo:

```bash
git reflog show main                 # solo los movimientos de main
git log -g --oneline feature/socios  # lo mismo, en formato log
```

Y acepta expresiones de tiempo, que es lo que usarás cuando no sepas el número:

```bash
git diff main@{yesterday} main
git show 'HEAD@{2 hours ago}'
git reset --hard 'main@{1 week ago}'
```

### `ORIG_HEAD`

Antes de una operación grande (`merge`, `rebase`, `reset`, `pull`), Git guarda
dónde estabas en `ORIG_HEAD`:

```bash
git reset --hard ORIG_HEAD    # deshace el merge o el rebase que acabas de hacer
```

Es un solo nivel de deshacer, pero es el que se usa el 90 % de las veces.

### Los límites, que son los que importan

| Qué | Se rescata |
|-----|:----------:|
| Un commit que hiciste y luego "borraste" | ✅ Con `reflog` |
| Una rama borrada con `git branch -D` | ✅ El SHA está en el reflog |
| Un rebase que salió mal | ✅ `ORIG_HEAD` |
| Cambios que solo estuvieron en el índice (`git add` sin commit) | ⚠️ Sí, pero con `git fsck` (§3) |
| Cambios en el directorio de trabajo, sin `add` ni `commit` | ❌ **No.** No existen para Git |
| Un archivo que nunca estuvo en Git | ❌ No |

Y tres reglas más:

- **Es local.** El reflog no se clona ni se empuja. El de tu compañero no te salva
- **Caduca**: 90 días para los commits alcanzables, 30 para los inalcanzables
- **`git gc` lo limpia.** No es un backup. El backup es empujar tu rama a un remoto

> [!WARNING]
> `git gc --prune=now` y `git reflog expire --expire=now --all` destruyen justo lo
> que este archivo te enseña a recuperar. No los ejecutes "para limpiar" sin saber
> exactamente qué estás borrando.

## 3. `git fsck`: cuando el reflog no llega

Los objetos que nunca estuvieron apuntados por `HEAD` —lo que hiciste `git add` y
luego perdiste, o un commit de un rebase abortado— no aparecen en el reflog, pero
sí están en `.git/objects`:

```bash
git fsck --lost-found
```

```
dangling commit 4b825dc642cb6eb9a060e54bf8d69288fbee4904
dangling blob 7d8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f
```

Y se inspeccionan como cualquier otro objeto:

```bash
git show 4b825dc            # ¿es este el commit que buscabas?
git cat-file -p 7d8f9a0     # el contenido del archivo suelto
git cat-file -p 7d8f9a0 > recuperado.ts
```

Para no leerlos de uno en uno:

```bash
git fsck --lost-found --no-reflogs | awk '/dangling commit/ {print $3}' \
  | xargs -I{} git show --oneline -s {}
```

## 4. `stash`: sí, pero con fecha de caducidad

```bash
git stash push -m "wip: validación de socio"   # con mensaje, siempre
git stash push -u                              # incluye archivos sin trackear
git stash push -- src/multa.ts                 # solo esa ruta
git stash list
git stash show -p stash@{0}                    # el diff completo
git stash apply stash@{0}                      # aplica y lo conserva
git stash pop                                  # aplica y lo borra
git stash branch arreglo-urgente stash@{0}     # rama nueva desde el stash
```

Un stash es un commit de verdad (con dos o tres padres) que no cuelga de ninguna
rama. Por eso `git stash drop` es recuperable con `git fsck`, y por eso un stash
de hace cuatro meses aplica mal: su base ya no se parece a `main`.

> [!TIP]
> Si vas a tardar más de unas horas en volver, no uses `stash`: haz un commit
> `wip` en una rama y luego lo reescribes con
> [`rebase -i`](02-reescribir-historia.md). Un commit tiene nombre, se empuja y se
> ve; un stash no aparece en ningún sitio y se olvida.

## 5. `cherry-pick`: traer un commit concreto

```bash
git cherry-pick 9f8e7d6
git cherry-pick 9f8e7d6 -x            # añade "(cherry picked from commit ...)"
git cherry-pick a1b2c3d^..d4e5f6a     # un rango
git cherry-pick -n 9f8e7d6            # aplica sin commitear, para editar antes
```

`-x` es importante en cualquier `cherry-pick` a una rama de release: deja escrito
de dónde vino el cambio, que es lo único que permite auditar después qué se
llevó a producción por la vía rápida.

Si hay conflicto: se resuelve, `git add`, y `git cherry-pick --continue` (o
`--abort` para volver atrás).

## 6. Arqueología: buscar en la historia

### `-S` y `-G`: el pico y la pala

```bash
git log -S "calcularMulta" --oneline        # commits donde cambia el NÚMERO de apariciones
git log -G "calcularMulta\(.*socio" --oneline  # commits cuyo diff casa con la regex
git log -S "API_KEY" --all --oneline        # ¿en qué commit entró ese secreto?
```

`-S` responde "¿cuándo se añadió o se eliminó esto?" y `-G` responde "¿en qué
commits se tocó una línea que casa con esto?". Con `-p` ves además el diff.

### La historia de una función

```bash
git log -L :calcularMulta:src/multa.ts     # todas las versiones de esa función
git log -L 40,60:src/multa.ts              # de ese rango de líneas
```

### Archivos borrados

```bash
git log --diff-filter=D --name-only --oneline    # qué se borró y en qué commit
git show a1b2c3d^:src/viejo.ts                   # el contenido antes del borrado
git checkout a1b2c3d^ -- src/viejo.ts            # y recuperarlo
```

El `^` es imprescindible: en el commit que borra el archivo, el archivo ya no
está. Hay que mirar a su padre.

### Otras dos que se usan mucho

```bash
git log --follow -- src/multa.ts     # sigue el rastro a través de los renombrados
git show a1b2c3d --stat              # qué tocó ese commit, sin leer el diff entero
```

`git blame` y la búsqueda de código en la interfaz de GitHub son la
[Semana 02](../../week-02-repositorio_como_producto/1-teoria/04-busqueda-y-blame.md).

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Usar `reflog` como backup | Es local y caduca a los 90 días | Empuja tu rama a un remoto |
| `git gc --prune=now` "para limpiar" | Destruye justo lo rescatable | No lo ejecutes salvo que sepas por qué |
| Rehacer el trabajo tras un `reset --hard` | Media tarde tirada; estaba en el reflog | `git reflog` **antes** de rehacer nada |
| `stash` como archivador | Se acumula, se olvida y aplica mal meses después | Rama temporal con commit `wip` |
| `git stash pop` con conflictos sin mirar | Puedes quedarte sin stash y con el árbol a medias | `apply` primero; `drop` cuando esté claro |
| `cherry-pick` a release sin `-x` | Nadie sabe de dónde salió ese cambio | `-x` siempre en ramas de release |
| Buscar un cambio leyendo `git log -p` entero | No escala pasados 50 commits | `git log -S` |

## 8. Trucos

- **Ver el reflog con fechas legibles**: `git reflog --date=iso`
- **Qué cambió entre ayer y hoy en `main`**: `git diff main@{yesterday} main`
- **Recuperar un archivo de hace N commits**: `git show HEAD~5:ruta/archivo.ts`
- **Ver todos los commits, incluidos los huérfanos**:
  `git log --oneline --graph --all --reflog`
- **Quién tocó más un archivo**:
  `git log --format='%an' -- src/multa.ts | sort | uniq -c | sort -rn`
- **Cuánto ocupa tu repo y cuántos objetos sueltos hay**:
  `git count-objects -vH`
- **El commit que borró una línea concreta**: `git log -S "la línea exacta" -p`

## 📚 Recursos Adicionales

- [`git reflog` — documentación](https://git-scm.com/docs/git-reflog)
- [`git fsck` — documentación](https://git-scm.com/docs/git-fsck)
- [Pro Git — Herramientas de Git: rescate y búsqueda](https://git-scm.com/book/es/v2/Herramientas-de-Git-Guardado-r%C3%A1pido-Stashing-y-Limpieza)

## ✅ Checklist de Verificación

- [ ] Has recuperado un commit tras un `reset --hard` usando `reflog`
- [ ] Sabes qué tipo de cambio **no** se puede recuperar de ninguna forma
- [ ] Has listado objetos huérfanos con `git fsck --lost-found`
- [ ] Has encontrado con `git log -S` el commit donde apareció un texto
- [ ] Sabes recuperar el contenido de un archivo borrado hace 20 commits
