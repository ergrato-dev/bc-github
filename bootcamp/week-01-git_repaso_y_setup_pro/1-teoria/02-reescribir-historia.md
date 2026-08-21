# Reescribir la historia

> La historia es documentación. `rebase -i` es el editor de esa documentación, y
> `--force-with-lease` el cinturón de seguridad que evita que se la pises a otro.

## 🎯 Objetivos

- Enmendar el último commit y saber qué se rompe al hacerlo
- Reescribir una serie de commits con `rebase -i` (squash, fixup, reword, drop, edit)
- Colocar los arreglos solos con `--fixup` y `--autosquash`
- Mover una rama de base con `rebase --onto`
- Empujar historia reescrita sin destruir el trabajo de nadie
- Decidir cuándo **no** reescribir

## 1. Qué problema resuelve

Un `git log` con seis commits llamados `wip`, `arreglo`, `ahora sí` no le sirve a
nadie: ni a ti dentro de tres meses, ni al revisor de tu PR, ni a `git bisect`
cuando busque un bug entre 200 commits.

Reescribir **antes de publicar** convierte el desorden de trabajar en un relato
de lo que cambió y por qué. Y no es cosmética: cada commit que compila y hace una
sola cosa es un punto de bisección, un `revert` limpio y un diff que se revisa en
dos minutos en vez de en media hora.

Recuerda el modelo mental de la [Teoría 01](01-modelo-mental-de-git.md): un
commit es inmutable. **Reescribir es siempre crear commits nuevos y mover el
puntero de la rama**; los viejos siguen ahí hasta que `git gc` los limpie.

## 2. `commit --amend`: el caso pequeño

```bash
git commit --amend                 # abre el editor: cambias el mensaje
git commit --amend --no-edit       # añade lo que esté en el índice, mismo mensaje
git commit --amend --date=now      # rehace también la fecha de autoría
```

`--amend` **no edita** el último commit: crea otro con el mismo padre y mueve la
rama. El SHA cambia siempre, aunque solo toques una coma del mensaje. Por eso, si
ese commit ya está publicado, `--amend` obliga a forzar el push igual que un
rebase.

## 3. `rebase -i`: reescribir una serie

```bash
git rebase -i HEAD~5      # los últimos 5 commits
git rebase -i main        # todo lo que tu rama tiene por encima de main
```

Se abre un editor con una línea por commit, **del más antiguo al más nuevo**
(al revés que `git log`):

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
| `drop` | Elimina el commit (borrar la línea hace lo mismo) |
| `edit` | Se detiene ahí para que enmiendes el contenido |
| `break` | Se detiene ahí sin nada que enmendar, para que mires |
| `exec` | Ejecuta un comando tras aplicar ese commit |

Reordenar no es un verbo: se mueven las líneas. Y `exec` es lo que convierte un
rebase en una verificación:

```bash
git rebase -i --exec 'npm test' main
```

Aplica los tests después de **cada** commit reescrito y se detiene en el primero
que falle. Es la forma barata de garantizar que toda la rama es biseccionable.

Resultado deseable del ejemplo de arriba: dos `pick` y tres `fixup`, y de seis
commits salen dos legibles.

### Cuando el rebase se detiene

```bash
git status              # siempre: dice en qué paso estás y qué hacer
git rebase --continue   # tras resolver el conflicto y hacer `git add`
git rebase --skip       # descarta ese commit y sigue
git rebase --abort      # vuelve exactamente al estado previo
```

`--abort` funciona siempre y no pierde nada. Es la razón por la que un rebase que
sale mal no es una emergencia.

## 4. `--fixup` y `--autosquash`

Mientras trabajas, cuando arregles algo que pertenece a un commit anterior de la
misma rama:

```bash
git commit --fixup a1b2c3d      # el mensaje será "fixup! <mensaje de a1b2c3d>"
git commit --squash a1b2c3d     # igual, pero podrás editar el mensaje al fundir
git commit --fixup=amend:a1b2c3d  # funde el contenido Y abre el mensaje para editarlo
```

Luego:

```bash
git rebase -i --autosquash HEAD~5
```

Git ya ha colocado cada `fixup!` justo debajo de su commit destino, con el verbo
puesto. Tú solo confirmas y sales del editor.

```bash
git config --global rebase.autosquash true   # que sea el comportamiento por defecto
```

> [!TIP]
> `git commit --fixup $(git log --format=%H -1 -- src/multa.ts)` marca como
> destino el último commit que tocó ese archivo. Casi siempre acierta.

## 5. `rebase --onto`: cambiar de base

El caso clásico: abriste `feature-b` encima de `feature-a`, y `feature-a` se
descarta. Quieres los commits de `feature-b` colgando de `main`.

```
main    A---B---C
             \
feature-a     D---E
                   \
feature-b           F---G
```

```bash
git rebase --onto main feature-a feature-b
```

Se lee así: **coge lo que hay en `feature-b` pero no en `feature-a`** (F y G) **y
aplícalo sobre `main`**. Resultado: `F'` y `G'` colgando de C.

Los tres argumentos son, en orden: nueva base, base vieja (exclusiva) y rama a
mover. Si te confundes de orden, `git rebase --abort` y otra vez.

### Ramas apiladas: `--update-refs`

Si tienes varias ramas apiladas (Semana 06), un rebase de la de abajo deja a las
de arriba apuntando a commits antiguos. Desde Git 2.38:

```bash
git rebase -i --update-refs main
git config --global rebase.updateRefs true
```

Las ramas intermedias se mueven solas al commit reescrito equivalente.

## 6. Publicar historia reescrita

```bash
git push --force-with-lease
git push --force-with-lease --force-if-includes   # aún más estricto
```

| Forma | Qué comprueba | Cuándo |
|-------|---------------|--------|
| `--force` | Nada. Sobrescribe | Nunca en una rama que otro pueda tener |
| `--force-with-lease` | Que el remoto siga donde tú creías | Tu rama de feature, siempre |
| `--force-if-includes` | Que además hayas visto localmente lo que hay arriba | Cuando compartes rama con alguien |

> [!WARNING]
> `--force-with-lease` **no protege** si acabas de hacer `git fetch`: el fetch
> actualiza tu referencia del remoto y la comprobación pasa aunque no hayas
> mirado los commits nuevos. Por eso existe `--force-if-includes`, que exige que
> esos commits estén integrados en tu rama local.

Alias que ahorra sustos:

```bash
git config --global alias.pushf 'push --force-with-lease --force-if-includes'
```

## 7. Cuándo NO reescribir

| Situación | Por qué |
|-----------|---------|
| `main` o cualquier rama protegida | Rompes el clon de todo el equipo; el ruleset de la Semana 08 lo impedirá |
| Una rama que otra persona tiene checkouteada | Su `git pull` creará un merge duplicando todo |
| Un PR ya revisado, con comentarios en líneas | GitHub pierde el anclaje de los comentarios al cambiar los SHAs |
| Un commit ya etiquetado o desplegado | El tag apunta a un SHA que dejará de estar en la rama |
| Para borrar un secreto ya publicado | Reescribir **no basta**: el blob sigue accesible por SHA y en los forks. Revoca el secreto primero — es lo único que funciona |

Para el último caso existe
[`git filter-repo`](https://github.com/newren/git-filter-repo) (y para repos de
GitHub, además hay que pedir la purga de la caché), pero la regla es la misma:
**revocar primero, limpiar después**. Se trata en la Semana 13.

## 8. Rebase o merge

No es una guerra religiosa, son dos usos distintos:

| | Rebase | Merge |
|---|--------|-------|
| Historia | Lineal, legible | Conserva el contexto real de las ramas |
| SHAs | Nuevos | Se preservan |
| Conflictos | Uno por commit, varias veces | Uno solo, al final |
| Bueno para | Limpiar **tu** rama antes del PR | Integrar una rama publicada |

La combinación que usa este bootcamp: **rebase en tu rama, nunca en `main`**. Las
estrategias de integración del PR (merge commit, squash, rebase merge) son la
Semana 06.

### `rerere`: resolver el mismo conflicto una sola vez

```bash
git config --global rerere.enabled true
```

Git guarda cómo resolviste cada conflicto y lo reaplica si vuelve a aparecer —
que es exactamente lo que pasa al rebasear la misma rama varias veces.

## 9. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `push --force` a secas | Borras commits de otros sin enterarte | `--force-with-lease` |
| Rebasear `main` | Reescribes la historia de todo el equipo | `main` nunca se rebasea |
| Commits `wip` que llegan al PR | El revisor lee ruido | `rebase -i` antes de abrir el PR |
| Aplastar 40 commits en uno "para que quede limpio" | Pierdes toda capacidad de bisecar y revertir por partes | Un commit por cambio coherente |
| `rebase -i` sobre una rama con conflictos sin `rerere` | Resuelves lo mismo cinco veces | `rerere.enabled true` |
| Reescribir para tapar un secreto | El blob sigue accesible; el secreto sigue vivo | Revócalo, luego limpia |
| Enmendar un commit ya revisado en el PR | Los comentarios pierden su ancla | Commit nuevo, y `squash` al mergear |

## 10. Trucos

- **Deshacer un rebase entero**: `git reset --hard ORIG_HEAD` — `ORIG_HEAD`
  guarda dónde estabas antes de la última operación grande
- **Ver qué va a reescribir el rebase antes de lanzarlo**:
  `git log --oneline main..HEAD`
- **Conflictos más fáciles de leer**:
  `git config --global merge.conflictStyle zdiff3` añade el ancestro común al
  bloque del conflicto, y la mitad se resuelven solo con verlo
- **Rebasear sin abrir el editor** (útil con `--autosquash`):
  `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash main`
- **Comprobar que todos los commits de tu rama compilan**:
  `git rebase -i --exec 'npm test' main`
- **Firmar de nuevo toda la rama tras reescribirla**:
  `git rebase --exec 'git commit --amend --no-edit -S' -i main`

## 📚 Recursos Adicionales

- [Pro Git — Reescribiendo la historia](https://git-scm.com/book/es/v2/Herramientas-de-Git-Reescribiendo-la-Historia)
- [`git rebase` — documentación](https://git-scm.com/docs/git-rebase)
- [`git push` — `--force-with-lease` y `--force-if-includes`](https://git-scm.com/docs/git-push)

## ✅ Checklist de Verificación

- [ ] Has convertido 5 commits en 2 con `rebase -i` sin perder cambios
- [ ] Sabes qué hacen `--fixup` y `--autosquash` juntos
- [ ] Explicas la diferencia entre `--force` y `--force-with-lease`
- [ ] Sabes por qué reescribir no elimina un secreto publicado
- [ ] Tienes `rerere` y `zdiff3` activados globalmente
