# Rúbrica de Evaluación — Semana 01: Git repaso y setup pro

## 📊 Distribución de Evidencias

| Tipo | Peso | Instrumento |
|------|:----:|-------------|
| Conocimiento 🧠 | 30% | Cuestionario de autoevaluación (10 preguntas) |
| Desempeño 💪 | 40% | Prácticas 01-04, verificadas por `verificar-semana.sh` |
| Producto 📦 | 30% | Repositorio hilo conductor creado |

**Nota mínima para aprobar**: 70% en cada tipo de evidencia.

---

## 🧠 Conocimiento (30%)

10 preguntas, 10 puntos cada una. Respóndelas **antes** de mirar las respuestas
del final.

| # | Pregunta |
|---|----------|
| 1 | ¿Cuáles son los cuatro tipos de objeto de Git y qué guarda cada uno? |
| 2 | ¿Qué es exactamente una rama en Git? ¿Y `HEAD`? |
| 3 | ¿Qué diferencia hay entre `reset --soft`, `--mixed` y `--hard`? |
| 4 | ¿Qué tipo de pérdida NO puede recuperar `reflog`? |
| 5 | ¿Por qué un `rebase` cambia los SHA de los commits si el contenido es el mismo? |
| 6 | ¿Qué hace `git commit --fixup <sha>` y con qué comando se aprovecha después? |
| 7 | ¿Qué significa el exit code 125 en `git bisect run`? |
| 8 | ¿Por qué el campo `author` de un commit no prueba quién lo escribió? |
| 9 | ¿Por qué hay que subir la clave SSH dos veces a GitHub? |
| 10 | ¿En qué situación usarías `GITHUB_TOKEN` en vez de un PAT fine-grained? |

**Total**: 100 puntos → 30% de la nota final

---

## 💪 Desempeño (40%)

### Práctica 01 — Rescate con reflog (10 puntos)

| Criterio | Puntos |
|----------|:------:|
| Recupera 3 commits tras un `reset --hard` usando `reflog` | 3 |
| Resucita una rama borrada con `branch -D` | 3 |
| Deshace un rebase completo con `ORIG_HEAD` | 2 |
| Explica qué pérdida no cubre `reflog` | 2 |

### Práctica 02 — Historia limpia (10 puntos)

| Criterio | Puntos |
|----------|:------:|
| Reduce 7 commits a 3 con `rebase -i` | 3 |
| `git diff backup HEAD` está vacío (contenido intacto) | 3 |
| Un commit tiene cuerpo explicando el porqué | 2 |
| `--autosquash` funciona con `commit --fixup` | 2 |

### Práctica 03 — Bisect y worktree (10 puntos)

| Criterio | Puntos |
|----------|:------:|
| Encuentra el commit culpable con `bisect` manual | 3 |
| Lo encuentra con `bisect run`, sin interacción | 3 |
| Usa `worktree` para trabajar en dos ramas a la vez | 2 |
| Limpia el worktree correctamente | 2 |

### Práctica 04 — Firmas y `gh` (10 puntos)

| Criterio | Puntos |
|----------|:------:|
| Clave registrada como `authentication` y como `signing` | 3 |
| Un commit aparece como `verified: true` en la API | 3 |
| Crea y cierra un issue solo con `gh` | 2 |
| Tiene al menos un alias de `gh` configurado | 2 |

---

## 📦 Producto (30%)

### Repositorio hilo conductor

Verificable por API (`./scripts/verificar-semana.sh 01`) — 60 puntos:

| Criterio | Puntos |
|----------|:------:|
| El repositorio existe y es público | 10 |
| Tiene una descripción de más de 10 caracteres | 10 |
| Su rama por defecto se llama `main` | 10 |
| Tiene al menos 3 commits firmados (`verified`) | 20 |
| Tu perfil README existe | 10 |

Calidad, no automatizable — 40 puntos:

| Criterio | Puntos |
|----------|:------:|
| La descripción dice qué es el proyecto, no "repo del bootcamp" | 10 |
| Los mensajes de commit están en imperativo y explican el cambio | 10 |
| El código inicial es coherente con el dominio elegido | 10 |
| El perfil README tiene contenido real, no la plantilla vacía | 10 |

**Total**: 100 puntos

### Penalizaciones

| Situación | Deducción |
|-----------|:---------:|
| Algún secreto, token o clave privada en el historial | -100 (rehacer) |
| Tres commits vacíos para cumplir el mínimo | -20 |
| Repositorio privado | -20 |
| Historia con commits `wip` sin limpiar | -10 |
| Email personal filtrado teniendo la privacidad activada | -10 |

---

<details>
<summary><strong>✅ Respuestas del cuestionario</strong> (mira solo después de responder)</summary>

1. **blob** (contenido de un archivo), **tree** (una carpeta: nombres → blobs y
   trees), **commit** (un tree + padres + autor + mensaje) y **tag anotado** (un
   puntero con mensaje y firma).
2. Una rama es un **archivo con un SHA dentro**: un puntero móvil a un commit.
   `HEAD` es un puntero a la rama en la que estás (o directamente a un commit,
   en *detached HEAD*).
3. Los tres mueven el puntero de la rama. `--soft` no toca nada más; `--mixed`
   (por defecto) también resetea el índice; `--hard` resetea además el directorio
   de trabajo y **destruye los cambios sin commitear**.
4. Los cambios que **nunca llegaron a ser un commit**. `reflog` registra
   movimientos de `HEAD`, es decir, commits. (Lo que sí pasó por `git add`
   todavía puede rescatarse con `git fsck --lost-found`.)
5. Porque el SHA de un commit es el hash de todo su contenido, **incluido el
   padre**. Al cambiar la base, cambia el padre, y con él el hash. Un commit es
   inmutable: rebasear no lo edita, lo **copia**.
6. Crea un commit marcado como `fixup! <mensaje del commit destino>`. Después,
   `git rebase -i --autosquash` lo coloca automáticamente debajo de su destino
   con el verbo `fixup` ya puesto.
7. "Sáltate este commit": no se puede probar (no compila, faltan dependencias).
   `bisect` lo excluye en vez de marcarlo bueno o malo.
8. Porque `user.name` y `user.email` son **texto libre** que cualquiera puede
   configurar. Solo una firma criptográfica prueba autoría.
9. Porque GitHub trata **autenticación** y **firma** como usos distintos. Una
   clave registrada solo como `authentication` sirve para `push`, pero los
   commits firmados con ella aparecen como `Unverified`.
10. Siempre que estés **dentro de un workflow de GitHub Actions**:
    `GITHUB_TOKEN` se inyecta solo, caduca al terminar el job y su alcance se
    limita con `permissions`. Un PAT ahí es un secreto de larga vida innecesario.

</details>
