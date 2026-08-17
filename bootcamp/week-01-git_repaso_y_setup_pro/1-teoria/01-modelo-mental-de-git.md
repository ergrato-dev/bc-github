# Modelo mental de Git

> Casi todo el miedo a Git viene de creer que la historia es una lista. Es un
> grafo, y los comandos que dan pánico solo mueven punteros.

## 🎯 Objetivos

- Describir los cuatro tipos de objeto de Git y para qué sirve cada uno
- Distinguir entre commit, rama y `HEAD`
- Explicar qué hace exactamente `reset` en sus tres modos
- Leer el grafo de commits desde la terminal

## 1. Qué problema resuelve

Git no guarda diferencias: guarda **fotos completas** del árbol de archivos,
direccionadas por el hash de su contenido. Esa decisión explica casi todo su
comportamiento: por qué es rápido, por qué no puede perder nada que hayas
commiteado, y por qué reescribir historia crea commits nuevos en vez de editar
los viejos.

## 2. Los cuatro objetos

Todo lo que Git almacena en `.git/objects` es uno de estos cuatro:

| Objeto | Qué contiene | Analogía |
|--------|--------------|----------|
| **blob** | El contenido de un archivo. Sin nombre, sin permisos | El archivo desnudo |
| **tree** | Una lista de nombres → blobs y otros trees | Una carpeta |
| **commit** | Un tree + padre(s) + autor + fecha + mensaje | Una foto fechada y firmada |
| **tag** (anotado) | Un puntero a un objeto + mensaje + firma | Una etiqueta con acta |

Míralos de verdad:

```bash
git cat-file -t HEAD          # commit
git cat-file -p HEAD          # tree, parent, author, committer, mensaje
git cat-file -p HEAD^{tree}   # el contenido de la carpeta raíz en ese commit
```

El nombre del objeto **es** el SHA-1 de su contenido. Dos archivos idénticos en
cien commits distintos son un solo blob. Y cambiar cualquier byte de un commit
—incluida su fecha o su padre— produce un SHA distinto: **un commit es
inmutable**.

## 3. Refs: los punteros

Un **ref** es un archivo de texto con un SHA dentro:

```bash
cat .git/refs/heads/main       # el SHA al que apunta la rama main
cat .git/HEAD                  # ref: refs/heads/main
```

De ahí salen las tres ideas que la gente confunde:

- Una **rama** es un puntero móvil a un commit. Nada más. Crear una rama cuesta
  41 bytes, por eso Git anima a crearlas sin pensar.
- **`HEAD`** es un puntero a la rama en la que estás. En *detached HEAD* apunta
  directamente a un commit, sin rama de por medio.
- Un **tag** ligero es un puntero que no se mueve.

![Grafo de commits, ramas y HEAD](../0-assets/01-grafo-commits.svg)

## 4. El grafo (DAG)

Cada commit apunta a su padre (o padres, si es un merge). El resultado es un
**grafo acíclico dirigido**: se avanza hacia atrás en el tiempo, nunca en
círculo.

```bash
git log --oneline --graph --all --decorate
```

Con eso en la cabeza, los comandos se vuelven traducibles:

| Comando | En términos del grafo |
|---------|-----------------------|
| `git commit` | Crea un nodo hijo del actual y mueve la rama ahí |
| `git merge` | Crea un nodo con **dos** padres |
| `git rebase` | **Copia** commits sobre otra base — SHAs nuevos, contenido igual |
| `git cherry-pick` | Copia **un** commit a otro sitio |
| `git reset` | Mueve el puntero de la rama a otro nodo |
| `git revert` | Crea un nodo nuevo que deshace otro. No borra nada |

## 5. Las tres zonas y `reset`

```
working tree  →  index (staging)  →  repositorio
   git add ──────────┘                    │
   git commit ────────────────────────────┘
```

`reset` mueve la rama y, según el modo, arrastra las otras dos zonas:

| Modo | Mueve la rama | Toca el índice | Toca tus archivos |
|------|:-------------:|:--------------:|:-----------------:|
| `--soft` | sí | no | no |
| `--mixed` *(por defecto)* | sí | sí | no |
| `--hard` | sí | sí | **sí — destruye cambios sin commitear** |

`--hard` es el único que puede perder trabajo de verdad, y solo el que **nunca
estuvo commiteado**. Todo lo que llegó a ser un commit sigue en `.git/objects` y
lo encuentras con `reflog` (teoría 02).

> [!WARNING]
> `git reset --hard` descarta los cambios del directorio de trabajo sin pasar por
> la papelera. Antes de ejecutarlo, `git stash` o `git commit` lo que te importe.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Ver la historia solo con `git log` plano | Escondes los merges y las ramas paralelas | `--graph --all --decorate` |
| Usar `checkout` para todo | Hace dos cosas distintas y confunde | `git switch` para ramas, `git restore` para archivos |
| Miedo a *detached HEAD* | Es un estado normal, no un error | `git switch -c rama-nueva` para quedarte donde estás |
| `commit -am` siempre | Te lleva ficheros que no querías | Revisa con `git add -p` |
| Ramas de vida larga | El merge final es una noche de conflictos | Ramas cortas, integración frecuente |

## 7. Trucos

- **Ver el diff que vas a commitear**: `git diff --staged`
- **Commitear por trozos, no por archivo**: `git add -p` — te enseña cada hunk y
  eliges. Produce commits que se explican solos
- **Grafo compacto y legible**:
  ```bash
  git config --global alias.lg "log --oneline --graph --all --decorate -20"
  ```
- **Diff que detecta código movido**: `git config --global diff.colorMoved zebra`
  distingue "esto se movió" de "esto se reescribió"
- **Algoritmo de diff mejor**: `git config --global diff.algorithm histogram`
- **Qué archivo cambió más**: `git log --format= --name-only | sort | uniq -c | sort -rn | head`

## 📚 Recursos Adicionales

- [Pro Git — Cap. 10: Git Internals](https://git-scm.com/book/es/v2/Los-entresijos-internos-de-Git-Fontanería-y-porcelana)
- [`git cat-file` — documentación](https://git-scm.com/docs/git-cat-file)
- [Visualizing Git (interactivo)](https://git-school.github.io/visualizing-git/)

## ✅ Checklist de Verificación

- [ ] Puedes mostrar el tree de `HEAD` con `git cat-file -p HEAD^{tree}`
- [ ] Sabes decir a qué SHA apunta tu rama actual sin usar `git log`
- [ ] Explicas la diferencia entre `reset --soft` y `reset --hard` sin dudar
- [ ] Tu `git lg` (o equivalente) muestra el grafo con ramas y tags
