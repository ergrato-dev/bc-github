# Conflictos y stacked PRs

> Los conflictos no son un error: son dos personas trabajando a la vez. Los
> stacked PRs son la respuesta a "esto es demasiado grande para un solo PR".

## 🎯 Objetivos

- Resolver conflictos en local y saber cuándo usar el editor web
- Elegir entre `merge` y `rebase` para actualizar tu rama
- Montar una pila de PRs encadenados
- Sobrevivir al merge de una pila sin rehacerlo todo

## 1. Qué problema resuelve

Dos problemas distintos con la misma raíz — el tiempo:

- Tu rama lleva días abierta y `main` ha avanzado → conflictos
- Tu cambio es demasiado grande para revisarlo de una vez → apílalo

## 2. Actualizar tu rama: merge o rebase

Cuando GitHub dice "This branch is out-of-date":

### `merge` de `main` en tu rama

```bash
git switch mi-rama
git fetch origin
git merge origin/main
```

| A favor | En contra |
|---------|-----------|
| Seguro: no reescribe nada | Añade commits de merge a tu rama |
| Los conflictos se resuelven una vez | Historia de la rama más ruidosa |
| Funciona con la rama ya publicada | |

### `rebase` sobre `main`

```bash
git switch mi-rama
git fetch origin
git rebase origin/main
git push --force-with-lease
```

| A favor | En contra |
|---------|-----------|
| Historia lineal y limpia | Reescribe: obliga a forzar el push |
| El diff del PR es exacto | Puedes resolver el mismo conflicto varias veces |
| | Rompe a quien tenga tu rama descargada |

Regla: **rebase mientras la rama es solo tuya; merge cuando ya hay alguien más
encima.** Y siempre `--force-with-lease`, nunca `--force`: aborta si alguien
empujó algo mientras tanto.

> [!TIP]
> Si el mismo conflicto reaparece en cada rebase, activa
> `git config --global rerere.enabled true` (Semana 01). Git recuerda cómo lo
> resolviste y lo reaplica solo.

## 3. Resolver el conflicto

```
<<<<<<< HEAD
return dias * 300;
||||||| ancestro común
return dias * 500;
=======
return dias * 250;
>>>>>>> main
```

Ese bloque del medio (el ancestro común) solo aparece con:

```bash
git config --global merge.conflictStyle zdiff3
```

Y cambia mucho las cosas: ver de dónde partían **ambos** lados suele resolver el
conflicto solo.

Después:

```bash
git add archivo-resuelto
git rebase --continue      # o git merge --continue
```

### El editor web

GitHub permite resolver conflictos en el navegador. Úsalo solo para conflictos
triviales (un `import`, una línea de `CHANGELOG`). Para lógica, en local: en la
web no puedes ejecutar los tests, y un conflicto resuelto sin probar es un bug
sin descubrir.

## 4. Stacked PRs

Un cambio grande dividido en PRs encadenados, cada uno con la **base** en el
anterior:

```
main ◄── PR #1 (modelo)  ◄── PR #2 (API)  ◄── PR #3 (docs)
```

Cada uno se revisa por separado y solo muestra **su** diff.

```bash
git switch -c feat/modelo main
# ... trabajo, commit
git push -u origin feat/modelo
gh pr create --base main --title "1/3: modelo de datos"

git switch -c feat/api feat/modelo    # ← la base es la rama anterior
# ... trabajo, commit
git push -u origin feat/api
gh pr create --base feat/modelo --title "2/3: API sobre el modelo"
```

Convenciones que ayudan mucho:

- Numera los títulos: `1/3`, `2/3`, `3/3`
- Enlaza la pila en la descripción de cada PR
- Deja los de arriba en **draft** hasta que se mergee el de abajo

## 5. Mergear una pila

El orden es de abajo arriba. Al mergear `#1` en `main`, GitHub **cambia
automáticamente** la base de `#2` a `main`. Ahí es donde aparece el problema:

- Con **merge commit** o **rebase**, el rebase de `#2` suele ser limpio.
- Con **squash**, `#1` se convierte en un commit nuevo que no existe en la
  historia de `#2`: el diff de `#2` puede aparecer duplicado.

Solución con squash:

```bash
git switch feat/api
git fetch origin
git rebase --onto origin/main feat/modelo feat/api
git push --force-with-lease
```

Se lee así: reaplica sobre `origin/main` los commits de `feat/api` que **no**
están en `feat/modelo`.

> [!WARNING]
> `--force-with-lease` sobre una rama que otra persona esté usando le reescribe
> la historia. En una pila, avisa antes de reordenar.

## 6. Cuándo NO apilar

| Situación | Mejor |
|-----------|-------|
| Las partes son independientes | PRs paralelos desde `main` |
| La pila pasa de 3-4 PRs | Divide el trabajo, no el PR |
| Vas a cambiar el diseño a mitad | Un PR grande en draft |
| Nadie va a revisar hasta el final | Un PR con commits bien separados |

Una pila de siete PRs es más difícil de mantener que el PR grande que intentabas
evitar.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `push --force` a secas | Puede borrar el trabajo de otro | `--force-with-lease` |
| Resolver conflictos de lógica en la web | No puedes ejecutar tests | En local |
| Rebasear una rama compartida | Reescribes la historia de otros | Merge, o avisa |
| Pilas de 6+ PRs | Cada merge exige rebasear el resto | Máximo 3-4 |
| No enlazar la pila | El revisor no sabe qué mira | Enlace y numeración en cada descripción |
| Descartar el conflicto quedándose "el suyo" | Pierdes cambios sin darte cuenta | Lee las dos versiones y el ancestro |

## 8. Trucos

- **`zdiff3`** muestra el ancestro común en el conflicto: resuelve la mitad de
  ellos por sí solo
- **`rerere`** recuerda resoluciones repetidas
- **`git rebase --onto`** es la herramienta específica para pilas
- **Cambiar la base desde la web**: *Edit* junto al título del PR; el diff se
  recalcula solo
- **Ver si tu rama está al día**: `gh pr view 42 --json mergeable,mergeStateStatus`
- **`gh pr checkout 42`** funciona también con PRs de forks, que es donde el
  `git remote` a mano se complica
- **Abortar sin miedo**: `git rebase --abort` o `git merge --abort` te devuelven
  al estado anterior

## 📚 Recursos Adicionales

- [GitHub Docs — Resolving a merge conflict](https://docs.github.com/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/about-merge-conflicts)
- [Pro Git — Rebasing](https://git-scm.com/book/es/v2/Ramificaciones-en-Git-Reorganizar-el-Trabajo-Realizado)
- [Stacked PRs (Graphite)](https://graphite.dev/guides/stacked-prs)

## ✅ Checklist de Verificación

- [ ] Tienes `merge.conflictStyle = zdiff3` y `rerere` activados
- [ ] Has resuelto un conflicto en local, con tests después
- [ ] Sabes cuándo rebase y cuándo merge para actualizar tu rama
- [ ] Has montado y mergeado una pila de dos PRs
