# Historia quirúrgica

> Reescribir, rescatar y bisecar. Los tres comandos que separan a quien sufre
> Git de quien lo usa.

## 🎯 Objetivos

- Reescribir la historia local con `rebase -i` (squash, fixup, reword, drop)
- Recuperar cualquier commit "perdido" con `reflog`
- Localizar el commit que introdujo un bug con `bisect`, automatizado
- Trabajar en dos ramas simultáneas con `worktree`

## 1. Qué problema resuelve

Tu historia es documentación. Un `git log` con seis commits llamados `wip`,
`arreglo`, `ahora sí` no le dice nada a nadie — ni a ti dentro de tres meses, ni
al revisor de tu PR, ni a `git bisect` cuando busques un bug.

Reescribir historia **antes de publicarla** convierte el desorden de trabajar en
un relato de lo que cambió y por qué.

## 2. `rebase -i`: reescribir antes de publicar

```bash
git rebase -i HEAD~5      # los últimos 5 commits
git rebase -i main        # todo lo que tu rama tiene por encima de main
```

Se abre un editor con una línea por commit, del más antiguo al más nuevo:

```
pick a1b2c3d feat: añade cálculo de multa
pick d4e5f6a wip
pick 7g8h9i0 arreglo del wip
pick j1k2l3m feat: añade validación de socio
pick n4o5p6q typo
```

| Verbo | Qué hace |
|-------|----------|
| `pick` | Deja el commit tal cual |
| `reword` | Mantiene los cambios, edita el mensaje |
| `squash` | Funde con el anterior y **te deja editar** el mensaje combinado |
| `fixup` | Funde con el anterior y **descarta** su mensaje |
| `drop` | Elimina el commit |
| `edit` | Se detiene ahí para que enmiendes el contenido |
| `reorder` | No es un verbo: reordena moviendo las líneas |

Resultado deseable del ejemplo: dos `pick` y tres `fixup`, y de seis commits
salen dos legibles.

### `--autosquash`: que se coloquen solos

Mientras trabajas, cuando arregles algo de un commit anterior:

```bash
git commit --fixup a1b2c3d      # marca el commit destino
git commit --squash a1b2c3d     # igual, pero conservando el mensaje
```

Luego:

```bash
git rebase -i --autosquash HEAD~5
```

Git ya ha colocado cada `fixup!` justo debajo de su commit destino, con el verbo
puesto. Solo confirmas.

Actívalo por defecto:

```bash
git config --global rebase.autosquash true
```

> [!WARNING]
> Reescribir historia **ya publicada** obliga a `push --force` y rompe el clon de
> todos los demás. Regla: reescribe solo lo que aún no has subido, o lo que solo
> tú tienes (tu rama de feature antes del PR). Si te toca forzar, usa
> `--force-with-lease`: aborta si alguien empujó algo mientras tanto.

## 3. `reflog`: nada se pierde

`reflog` registra **cada movimiento de `HEAD`** durante 90 días: commits,
checkouts, resets, rebases, merges.

```bash
git reflog
```

```
a1b2c3d HEAD@{0}: reset: moving to HEAD~3
9f8e7d6 HEAD@{1}: commit: feat: añade validación de socio
3c2b1a0 HEAD@{2}: commit: wip
```

Volver a donde estabas antes del desastre:

```bash
git reset --hard HEAD@{1}
```

O rescatar solo un commit sin mover la rama:

```bash
git cherry-pick 9f8e7d6
```

Reglas:

- **Es local.** No se clona, no se empuja. El reflog de tu compañero no te salva.
- **Cubre lo commiteado.** Los cambios que nunca llegaron a un commit ni al
  índice no están ahí.
- **Caduca**: 90 días los alcanzables, 30 los no alcanzables, y `git gc` los
  limpia. No es un backup.

## 4. `bisect`: búsqueda binaria del bug

Sabes que en `v1.0` funcionaba y hoy no. Entre medias hay 200 commits. `bisect`
los reduce a ~8 pruebas.

```bash
git bisect start
git bisect bad                  # el actual está roto
git bisect good v1.0            # aquí funcionaba
# Git te deja en un commit intermedio: pruebas y respondes
git bisect good   # o  git bisect bad
# ... repites ~log2(n) veces
git bisect reset                # vuelve a donde estabas
```

### Automatizado, que es como se usa de verdad

```bash
git bisect start HEAD v1.0
git bisect run npm test
```

`bisect run` ejecuta el comando en cada paso: **exit 0 = bueno, exit 1-124 =
malo, exit 125 = sáltate este commit** (no compila, por ejemplo). Al terminar
imprime `<sha> is the first bad commit`.

El comando puede ser cualquier cosa:

```bash
git bisect run bash -c 'grep -q "calcularMulta" src/index.ts'
```

> [!TIP]
> `bisect` es la razón práctica de tener commits pequeños y que compilen. Una
> historia de commits gigantes convierte el resultado en "el bug está en algún
> punto de estos 900 archivos".

## 5. `worktree`: dos ramas a la vez

`stash` para arreglar un bug urgente y volver es fricción innecesaria:

```bash
git worktree add ../proyecto-hotfix main
cd ../proyecto-hotfix     # otro directorio, MISMO repositorio
# arreglas, commiteas, empujas
cd -
git worktree remove ../proyecto-hotfix
```

Comparten `.git`: los objetos no se duplican y los commits que hagas en uno son
visibles al instante en el otro. Una rama solo puede estar activa en un worktree
a la vez.

```bash
git worktree list
```

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `push --force` a una rama compartida | Borras commits de otros | `--force-with-lease`, y solo en tu rama |
| Rebasear `main` | Reescribes la historia de todo el equipo | `main` nunca se rebasea |
| Commits `wip` que llegan al PR | El revisor lee ruido | `rebase -i` antes de abrir el PR |
| Usar `reflog` como backup | Es local y caduca | Empuja tu rama a un remoto |
| Bisecar a mano 200 commits | Media hora tirada | `git bisect run <comando>` |
| `stash` como archivador | Se acumula y se olvida | Rama temporal o `worktree` |

## 7. Trucos

- **Deshacer un `rebase` entero**: `git reset --hard ORIG_HEAD`
- **Conflicto resuelto una vez, resuelto siempre**:
  `git config --global rerere.enabled true`
- **Ver el diff de un merge conflictivo con las tres versiones**:
  `git config --global merge.conflictStyle zdiff3` — añade el ancestro común, y
  la mitad de los conflictos se resuelven solos al verlo
- **Buscar en qué commit apareció o desapareció un texto**:
  `git log -S "calcularMulta" --oneline` (pickaxe)
- **Ver la historia de una función concreta**: `git log -L :calcularMulta:src/index.ts`
- **Saltar commits rotos en un bisect**: `git bisect skip`

## 📚 Recursos Adicionales

- [Pro Git — Reescribiendo la historia](https://git-scm.com/book/es/v2/Herramientas-de-Git-Reescribiendo-la-Historia)
- [`git bisect` — documentación](https://git-scm.com/docs/git-bisect)
- [`git worktree` — documentación](https://git-scm.com/docs/git-worktree)

## ✅ Checklist de Verificación

- [ ] Has convertido 5 commits en 2 con `rebase -i` sin perder cambios
- [ ] Has recuperado un commit tras un `reset --hard` usando `reflog`
- [ ] Has ejecutado `git bisect run` y ha señalado el commit culpable
- [ ] Tienes `rerere` y `zdiff3` activados globalmente
