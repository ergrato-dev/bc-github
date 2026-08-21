# `bisect` y `worktree`

> Dos comandos que casi nadie usa y que ahorran tardes enteras: uno encuentra el
> commit culpable en ocho pruebas, el otro te deja abrir dos ramas a la vez sin
> tocar lo que tienes a medias.

## 🎯 Objetivos

- Encontrar el commit que introdujo un bug con `git bisect`, a mano y automatizado
- Interpretar los códigos de salida que espera `bisect run`
- Saltar commits que no compilan y reanudar una bisección interrumpida
- Trabajar en varias ramas simultáneas con `git worktree`, sin `stash` de por medio
- Reconocer qué historia hace que `bisect` funcione y cuál lo inutiliza

## 1. Qué problema resuelve

"En la versión 1.0 funcionaba y hoy no." Entre medias hay 200 commits. Probarlos
uno a uno son 200 pruebas; una búsqueda binaria son **ocho**: log₂(200) ≈ 7,6.

`bisect` hace esa búsqueda por ti. Y `worktree` resuelve el problema de al lado:
para probar el commit intermedio necesitas un árbol de trabajo limpio, y tú
tienes cambios a medias.

## 2. `bisect` a mano

```bash
git bisect start
git bisect bad                  # el commit actual está roto
git bisect good v1.0            # aquí funcionaba
```

Git te deja en un commit intermedio y te dice cuántos pasos quedan:

```
Bisecting: 97 revisions left to test after this (roughly 7 steps)
```

Pruebas y respondes:

```bash
git bisect good     # o
git bisect bad      # o
git bisect skip     # este no compila / no se puede probar
```

Al final:

```
a1b2c3d is the first bad commit
```

Y siempre, para volver a donde estabas:

```bash
git bisect reset
```

## 3. `bisect run`: automatizado, que es como se usa de verdad

```bash
git bisect start HEAD v1.0      # <bad> <good> en la misma línea
git bisect run npm test
```

Git ejecuta el comando en cada paso y decide solo. Los códigos de salida no son
arbitrarios:

| Código de salida | Significado para `bisect` |
|------------------|---------------------------|
| `0` | Commit **bueno** |
| `1`–`127`, **excepto `125`** | Commit **malo** |
| `125` | **No se puede probar** — equivale a `git bisect skip` |
| `128`–`255` | Aborta la bisección |

El `125` es la pieza que se olvida: sirve para los commits que no compilan, donde
tu script no puede opinar.

```bash
#!/usr/bin/env bash
# probar.sh — devuelve 125 si ni siquiera compila
npm ci --silent || exit 125
npm run build --silent || exit 125
npm test --silent
```

```bash
git bisect start HEAD v1.0
git bisect run ./probar.sh
```

El comando puede ser cualquier cosa que devuelva un código de salida:

```bash
git bisect run bash -c 'grep -q "calcularMulta" src/multa.ts'
git bisect run bash -c '! ./app --version | grep -q "NaN"'
```

> [!IMPORTANT]
> El script de prueba **no puede vivir dentro del repositorio que estás
> biseccionando**: al cambiar de commit, el script cambia con él (o desaparece).
> Guárdalo fuera: `git bisect run ../probar.sh`.

## 4. Afinar la bisección

### Limitar por ruta

Si el bug está claramente en un subsistema, solo se biseccionan los commits que
lo tocan:

```bash
git bisect start HEAD v1.0 -- src/multa.ts src/socio.ts
```

### `good`/`bad` no siempre son las palabras correctas

Cuando lo que buscas no es un bug sino un cambio de comportamiento (algo que
antes era lento y ahora es rápido), `good`/`bad` confunde:

```bash
git bisect start --term-old=rapido --term-new=lento
git bisect lento
git bisect rapido v1.0
```

Git también acepta el par genérico `old`/`new` sin configurar nada.

### Guardar, revisar y repetir

```bash
git bisect log              # el registro de lo que has respondido
git bisect log > sesion.txt
git bisect replay sesion.txt   # reproduce la sesión (p. ej. tras equivocarte)
git bisect visualize           # abre gitk/log con los candidatos restantes
```

Si respondiste mal en un paso, `git bisect log`, editas el archivo quitando la
respuesta equivocada, y `git bisect replay`.

> [!TIP]
> `bisect` es la razón práctica de que los commits sean pequeños y compilen. Una
> historia de commits gigantes convierte el resultado en "el bug está en algún
> punto de estos 900 archivos", que es como no tener resultado. Es el argumento
> de peso de la [Teoría 02](02-reescribir-historia.md).

## 5. `worktree`: varias ramas a la vez

Estás a mitad de una feature y entra un bug urgente. La respuesta habitual es
`stash`, cambiar de rama, arreglar, volver, `stash pop`. La alternativa es no
moverte:

```bash
git worktree add ../proyecto-hotfix main
cd ../proyecto-hotfix        # otro directorio, MISMO repositorio
# arreglas, commiteas, empujas
cd -
git worktree remove ../proyecto-hotfix
```

Comandos completos:

```bash
git worktree add ../revision-pr-42 -b revision/pr-42   # crea la rama a la vez
git worktree add --detach ../pruebas v1.0              # en un tag, sin rama
git worktree list                                       # todos, con su rama
git worktree remove ../revision-pr-42
git worktree prune                                      # limpia los borrados a mano
```

### Qué comparten y qué no

| Comparten | No comparten |
|-----------|--------------|
| Objetos y refs (`.git/objects`, ramas, tags) | Directorio de trabajo |
| El reflog y la configuración del repo | Índice y `HEAD` (cada worktree tiene el suyo) |
| Los remotos y lo que traigas con `fetch` | `node_modules`, `.env`, artefactos de build |

Un commit hecho en un worktree es visible al instante en el otro: no hay que
empujar ni traer nada. Y `.git` en el worktree no es una carpeta, es un archivo
que apunta a `.git/worktrees/<nombre>` del repositorio principal.

### Las dos reglas que sorprenden

- **Una rama solo puede estar activa en un worktree.** `git worktree add ../x main`
  falla si `main` ya está checkouteada en otro sitio. Es una protección, no un
  fallo: evita dos árboles moviendo la misma rama
- **Los archivos ignorados no viajan.** Cada worktree necesita su propio
  `npm ci` y su propio `.env`. Es el precio de tener un árbol limpio de verdad

```bash
git worktree lock ../revision-pr-42    # evita que `prune` lo elimine (p. ej. en un USB)
git worktree move ../revision-pr-42 ../otro-sitio
```

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Bisecar 200 commits a mano | Media tarde tirada | `git bisect run <comando>` |
| Script de bisect dentro del repo | Cambia en cada commit probado | Guárdalo fuera del repositorio |
| Devolver `1` cuando el commit no compila | Marca como culpable un commit inocente | `exit 125` |
| Olvidar `git bisect reset` | Te quedas en *detached HEAD* y no entiendes por qué | `reset` siempre al terminar |
| Commits gigantes | El culpable señala 900 archivos | Commits pequeños que compilan |
| `stash` para un hotfix de 10 minutos | Fricción y riesgo de perder el stash | `git worktree add` |
| Clonar el repo otra vez para revisar un PR | Duplicas objetos y remotos | Un worktree comparte `.git` |
| Borrar la carpeta de un worktree a mano | Deja metadatos huérfanos | `git worktree remove` o `prune` |

## 7. Trucos

- **Revisar un PR sin tocar tu rama**:
  `gh pr checkout 42` dentro de un worktree nuevo
- **Bisecar con un test que aún no existía**: escribe el test hoy, guárdalo fuera
  del repo y cópialo dentro en cada paso desde el script de `bisect run`
- **Ver los candidatos que quedan**: `git bisect visualize --oneline`
- **Bisecar solo commits de merge o solo de una rama**: limita el rango con
  `git bisect start HEAD v1.0 -- <ruta>` en vez de con filtros de log
- **Un worktree por PR en revisión**: `git worktree list` se convierte en tu lista
  de trabajo abierto
- **Repo bare + worktrees**: `git clone --bare` y un worktree por rama es el
  esquema más limpio para quien mantiene varias versiones vivas
- **Recuperar worktrees tras mover el repo**: `git worktree repair`

## 📚 Recursos Adicionales

- [`git bisect` — documentación](https://git-scm.com/docs/git-bisect)
- [`git worktree` — documentación](https://git-scm.com/docs/git-worktree)
- [Pro Git — Depuración con Git](https://git-scm.com/book/es/v2/Herramientas-de-Git-Depurando-con-Git)

## ✅ Checklist de Verificación

- [ ] Has ejecutado `git bisect run` y ha señalado el commit culpable
- [ ] Sabes qué código de salida significa "sáltate este commit"
- [ ] Has salido de una bisección con `git bisect reset`
- [ ] Has creado y eliminado un worktree con `add` y `remove`
- [ ] Explicas por qué una rama no puede estar activa en dos worktrees
