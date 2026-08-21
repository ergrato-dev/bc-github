# `blame` e historia en GitHub

> `blame` no sirve para buscar culpables. Sirve para contestar la única pregunta
> que el código no contesta solo: **por qué está esta línea aquí**.

## 🎯 Objetivos

- Llegar del "quién escribió esto" al "qué PR lo introdujo y qué issue lo pedía"
- Usar `blame` sin que un reformateo masivo lo inutilice
- Recorrer la historia de un archivo en la interfaz y desde la terminal
- Comparar dos puntos cualesquiera del repositorio con `compare`
- Leer las vistas de Insights sin sacar conclusiones falsas

## 1. Qué problema resuelve

Vas a borrar una condición rara. Parece muerta. La pregunta correcta no es quién
la escribió, sino **qué caso la puso ahí** — porque si el caso sigue existiendo,
tu limpieza es un incidente.

`blame` es la puerta de entrada a esa cadena: línea → commit → PR → review →
issue. En un repositorio bien llevado, esa cadena está entera, y por eso las
Semanas 03, 06 y 07 insisten tanto en enlazar issues y PRs.

## 2. `blame`: de la línea al porqué

```bash
git blame src/multa.ts
git blame -L 10,20 src/multa.ts        # solo un rango
git blame -w src/multa.ts              # ignora cambios de espacios
git blame -C src/multa.ts              # detecta código movido desde otro archivo
git blame -CCC src/multa.ts            # se esfuerza más en encontrar el origen
git blame --since=6.months src/multa.ts
```

En la interfaz: botón **Blame**, y desde ahí el icono de las flechas retrocede a
la versión **anterior** a ese cambio. Encadenándolo llegas al commit original de
una línea que se ha reformateado cinco veces.

La cadena completa, desde la terminal:

```bash
git blame -L 42,42 src/multa.ts        # → el SHA
git log -1 <sha>                        # → el mensaje, que debería citar el PR
gh pr list --search <sha> --state merged   # → el PR
gh pr view <numero> --comments             # → la discusión y el issue
```

### Que un reformateo no lo destruya

Un `prettier` sobre todo el repositorio deja el `blame` señalando el mismo commit
en cada línea. Solución, y es de las cosas con mejor relación coste-beneficio del
repositorio:

```bash
# .git-blame-ignore-revs
# Formateo con prettier, sin cambios funcionales
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
# Renormalización de finales de línea
b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1
```

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

GitHub lee ese archivo **automáticamente** si está en la raíz del repositorio: el
`blame` de la web también salta esos commits. La configuración de arriba es para
tu terminal.

Cada vez que hagas un cambio masivo sin efecto funcional (formateo, renombrado de
carpetas, renormalización de EOL), lo suyo es hacerlo **en un commit solo** y
apuntar su SHA ahí.

## 3. La historia de un archivo

```bash
git log --follow -- src/multa.ts          # sigue el rastro a través de renombrados
git log --oneline --stat -- src/multa.ts  # qué cambió en cada commit
git log -p --follow -- src/multa.ts       # con el diff entero
git shortlog -sn --no-merges -- src/multa.ts   # quién lo tocó y cuánto
git log --first-parent --oneline main     # solo los merges a main: el resumen de releases
```

Filtros que se combinan con todo lo anterior:

```bash
git log --since=2026-01-01 --until=2026-03-01
git log --author="ergrato"
git log --grep="multa"                    # en el mensaje del commit
git log --name-status --diff-filter=D     # solo borrados
```

En la interfaz, el botón **History** de un archivo hace lo mismo, y cada entrada
lleva al commit y de ahí al PR.

> [!TIP]
> Las búsquedas por contenido del diff —`git log -S` (pickaxe) y `git log -L` para
> una función— están en la [Semana 01, Teoría 03](../../week-01-git_repaso_y_setup_pro/1-teoria/03-rescate-y-arqueologia.md).
> Son la herramienta cuando no sabes en qué archivo mirar.

## 4. `compare`: dos puntos cualesquiera

```
https://github.com/OWNER/REPO/compare/v1.0...main
https://github.com/OWNER/REPO/compare/main...feature/multa
https://github.com/OWNER/REPO/compare/2026-01-01...main
```

Funciona con ramas, tags, SHAs y hasta fechas. Y admite comparar entre forks:
`compare/main...otro-usuario:su-rama`.

**Los tres puntos importan**, y aquí es donde casi todo el mundo se confunde:

| Sintaxis | Qué compara |
|----------|-------------|
| `a..b` | Punta contra punta: todo lo que difiere entre las dos |
| `a...b` | Desde el **ancestro común**: solo lo que ha entrado en `b` |

Para "qué llevo yo de nuevo respecto a `main`", lo correcto es `main...mi-rama`.
Es exactamente lo que muestra la pestaña *Files changed* de un PR — por eso un PR
no te enseña como tuyos los cambios que otros hicieron en `main` mientras tanto.

```bash
git log --oneline main..mi-rama      # mis commits
git diff main...mi-rama              # mi diff, como lo verá el revisor
```

## 5. Insights, y qué no significan

`Insights` trae vistas ya montadas: *Pulse* (actividad reciente), *Contributors*,
*Commit activity*, *Code frequency*, *Network* y *Forks*.

Sirven para ver tendencias y para responder "¿esto está vivo?". No sirven como
medida de productividad: el número de commits mide cómo alguien parte su trabajo,
y las líneas añadidas premian a quien pega dependencias. Las métricas que sí
significan algo —lead time, throughput— son la Semana 05.

```bash
gh api repos/{owner}/{repo}/stats/participation --jq '.all | add'
gh api repos/{owner}/{repo}/commits --jq 'length'
```

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Usar `blame` para señalar personas | Envenena al equipo y no resuelve nada | Busca el PR y el porqué |
| Reformatear sin `.git-blame-ignore-revs` | Rompes el `blame` de todo el repositorio | Añade el SHA al archivo |
| Formateo y cambio funcional en el mismo commit | Ni se revisa ni se puede ignorar en `blame` | Dos commits |
| Borrar código raro sin buscar su origen | El caso que lo motivó sigue existiendo | `blame` → PR → issue |
| Mensajes de commit tipo "arreglos" | La cadena se corta en el primer eslabón | Convenciones de la Semana 07 |
| Confundir `a..b` con `a...b` | Comparas cosas distintas y decides mal | `...` para "qué aporto yo" |
| Medir productividad con Insights | Mide lo que es fácil contar, no lo que importa | Métricas de flujo (Semana 05) |

## 7. Trucos

- **Ver el `blame` desde el archivo**: pulsa `b`
- **Volver a antes de un cambio en el `blame` web**: el icono de flechas a la
  izquierda de cada bloque
- **Saltar a la definición de un símbolo**: haz clic en él; GitHub indexa símbolos
  en los lenguajes soportados
- **Comparar sin salir de la URL**: `/compare/v1.0...main`
- **Quién sabe de este archivo** (a quién preguntar):
  `git shortlog -sn --no-merges -- ruta/al/archivo | head -3`
- **El PR que introdujo un commit**:
  `gh api repos/{owner}/{repo}/commits/<sha>/pulls --jq '.[].number'`
- **Los archivos que más cambian** (candidatos a refactor o a más tests):
  ```bash
  git log --since=1.year --format= --name-only | sort | uniq -c | sort -rn | head
  ```

## 📚 Recursos Adicionales

- [`git blame` — documentación](https://git-scm.com/docs/git-blame)
- [GitHub Docs — Comparing commits](https://docs.github.com/pull-requests/committing-changes-to-your-project/viewing-and-understanding-commits/comparing-commits)
- [GitHub Docs — Viewing a file's history](https://docs.github.com/repositories/working-with-files/using-files/viewing-and-understanding-files)
- [GitHub Docs — Repository insights](https://docs.github.com/repositories/viewing-activity-and-data-for-your-repository)

## ✅ Checklist de Verificación

- [ ] Has usado `blame` para llegar al PR que originó una línea
- [ ] Tu repositorio tiene `.git-blame-ignore-revs` (o sabes cuándo lo necesitará)
- [ ] Entiendes la diferencia entre `a..b` y `a...b`
- [ ] Sabes ver la historia de un archivo renombrado
- [ ] Sabes por qué el número de commits no mide nada útil
