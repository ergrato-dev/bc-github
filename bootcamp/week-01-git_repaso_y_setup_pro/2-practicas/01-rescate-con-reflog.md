# Práctica 01 — Rescate con reflog

> Vas a destruir trabajo a propósito, tres veces, y a recuperarlo las tres. Al
> terminar, `reset --hard` deja de dar miedo.

**Duración estimada**: 50 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-modelo-mental-de-git.md) y [02](../1-teoria/02-historia-quirurgica.md)

## Contexto

Son las 18:40, llevas tres horas de trabajo en una rama y ejecutas
`git reset --hard HEAD~3` en la terminal equivocada. Esto le pasa a todo el
mundo una vez. La diferencia entre perder la tarde y perder treinta segundos es
saber que existe `reflog`.

Trabajaremos en un repositorio de laboratorio, no en tu proyecto.

## Paso 1: Montar el laboratorio

**Por qué**: necesitas una historia con la que romper cosas sin consecuencias.

```bash
mkdir -p ~/sandbox/lab-reflog && cd ~/sandbox/lab-reflog
git init -b main
for i in 1 2 3 4 5; do
  echo "línea $i" >> notas.txt
  git add notas.txt
  git commit -q -m "feat: añade línea $i"
done
git log --oneline
```

**Verifica**:

```bash
git log --oneline | wc -l
# 5
```

## Paso 2: Desastre 1 — `reset --hard` de más

**Por qué**: es el error más común y el más recuperable.

```bash
git reset --hard HEAD~3
git log --oneline
# solo quedan 2 commits: los 3 últimos "desaparecieron"
```

Ahora míralos donde siguen estando:

```bash
git reflog
```

```
a1b2c3d HEAD@{0}: reset: moving to HEAD~3
9f8e7d6 HEAD@{1}: commit: feat: añade línea 5
...
```

**Recupera**:

```bash
git reset --hard HEAD@{1}
```

**Verifica**:

```bash
git log --oneline | wc -l
# 5
```

## Paso 3: Desastre 2 — borrar una rama sin mergear

**Por qué**: `git branch -D` no pide confirmación y no manda nada a ninguna
papelera.

```bash
git switch -c experimento
echo "idea brillante" >> notas.txt
git commit -qam "feat: idea brillante"
git switch main
git branch -D experimento
# Deleted branch experimento (was 4f5g6h7).
```

Git te ha dicho el SHA al borrarla. Si no lo copiaste:

```bash
git reflog | grep experimento
```

**Recupera** la rama entera:

```bash
git switch -c experimento 4f5g6h7   # usa TU sha
git log --oneline -1
```

**Verifica**:

```bash
git show --stat HEAD | head -5
# debe aparecer "idea brillante"
```

## Paso 4: Desastre 3 — un rebase que sale mal

**Por qué**: un rebase interactivo mal resuelto puede dejarte una historia
irreconocible. `ORIG_HEAD` la devuelve entera.

```bash
git switch main
git rebase -i HEAD~4
```

En el editor, cambia **todos** los `pick` menos el primero por `drop`, guarda y
sal. Acabas de eliminar 3 commits.

```bash
git log --oneline
```

**Recupera**:

```bash
git reset --hard ORIG_HEAD
git log --oneline | wc -l
# 5
```

`ORIG_HEAD` es donde estaba `HEAD` antes de la última operación peligrosa
(rebase, merge, reset). Es el atajo cuando el desastre es el más reciente.

## Paso 5: El límite — lo que reflog NO salva

**Por qué**: hay que saber exactamente dónde acaba la red de seguridad.

```bash
echo "cambio sin commitear que me importa" >> notas.txt
git reset --hard HEAD
cat notas.txt      # el cambio no está
git reflog         # tampoco está aquí
```

**Regla**: `reflog` recupera **commits**. Lo que nunca llegó a ser un commit ni
a estar en el índice, no existe para Git.

Excepción parcial: si habías hecho `git add`, el blob sigue en la base de datos
y puede rescatarse:

```bash
echo "esto sí lo añadí al índice" >> notas.txt
git add notas.txt
git reset --hard HEAD
git fsck --lost-found | head
# dangling blob <sha>
git cat-file -p <sha>
```

**Verifica**: entiendes por qué el primer caso es irrecuperable y el segundo no.

## ✅ Resultado

- [ ] Has recuperado 3 commits tras un `reset --hard`
- [ ] Has resucitado una rama borrada con `-D`
- [ ] Has deshecho un rebase completo con `ORIG_HEAD`
- [ ] Puedes explicar qué tipo de pérdida `reflog` no cubre

Guarda la salida como evidencia:

```bash
git reflog > ~/sandbox/lab-reflog/evidencia-reflog.txt
wc -l ~/sandbox/lab-reflog/evidencia-reflog.txt
```

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `git reflog` sale vacío | Repo recién clonado: el reflog es local y no se clona | Trabaja en el laboratorio que creaste |
| `HEAD@{1}` no es lo que esperabas | Los índices se desplazan con cada operación | Lee la lista y usa el SHA directamente |
| `ORIG_HEAD` no existe | No hubo rebase/merge/reset previo | Usa `git reflog` |
| Rebase a medias, terminal confusa | Quedó una operación abierta | `git rebase --abort` |
| No encuentras un commit "perdido" | Puede estar colgando sin ref | `git fsck --lost-found` |
