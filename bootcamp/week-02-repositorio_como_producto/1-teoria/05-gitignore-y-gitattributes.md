# `.gitignore` y `.gitattributes`

> Dos archivos pequeños que deciden qué entra en la historia para siempre y cómo
> se comporta Git con cada tipo de archivo. Se escriben una vez — por eso conviene
> escribirlos bien.

## 🎯 Objetivos

- Escribir un `.gitignore` que no arrastre basura ni oculte lo importante
- Diagnosticar por qué un archivo se ignora (o por qué no)
- Dejar de ignorar algo que ya está trackeado
- Usar `.gitattributes` para EOL, `linguist`, diffs y merges
- Saber cuándo un archivo no debería estar en Git en absoluto

## 1. Qué problema resuelve

`.gitignore` responde a "esto no debería viajar con el proyecto". `.gitattributes`
responde a "esto es texto, esto es binario, esto es generado, y así se compara".

Los dos evitan la misma clase de problema: diffs ilegibles, repositorios que pesan
gigabytes y secretos que acaban en la historia.

## 2. `.gitignore`

### La sintaxis, entera

```gitignore
node_modules/        # una carpeta (la barra final lo deja claro)
*.log                # por extensión, en cualquier nivel
/dist                # solo en la raíz del repositorio
build/**/temp        # ** cruza varios niveles
.env                 # el archivo
!.env.example        # ...pero este no
doc?.txt             # un carácter cualquiera
[0-9]*.bak           # rangos
\#importante.md      # un nombre que empieza por # de verdad
```

Cuatro reglas que explican casi todos los "no me funciona":

1. **Gana la última regla que coincide.** Por eso las negaciones (`!`) van después
2. **No puedes designorar dentro de una carpeta ignorada.** Si ignoras `build/`,
   `!build/importante.txt` no sirve: Git ni siquiera entra en la carpeta. Ignora
   `build/*` y luego niega
3. **Solo afecta a archivos no trackeados.** Lo que ya está en el índice sigue ahí
4. Un `.gitignore` en una subcarpeta aplica desde ahí hacia abajo

### Dónde poner cada regla

| Regla | Sitio | Por qué |
|-------|-------|---------|
| Artefactos del proyecto (`dist/`, `node_modules/`) | `.gitignore` del repo | Le sirven a todo el equipo |
| Tu editor y tu sistema operativo (`.idea/`, `.DS_Store`) | Global: `git config --global core.excludesFile ~/.gitignore_global` | Es cosa tuya, no del proyecto |
| Pruebas tuyas en este repositorio (`notas.md`, `scratch/`) | `.git/info/exclude` | No se commitea y no molesta a nadie |

Y qué ignorar: **artefactos, no configuración**. `node_modules/`, `dist/`,
`coverage/`, `*.log`, `.env`. El `.env.example` **sí** se commitea: documenta qué
variables hacen falta sin filtrar ninguna.

### Diagnóstico

```bash
git check-ignore -v ruta/al/archivo    # qué regla, de qué archivo, en qué línea
git status --ignored                   # ver también lo ignorado
git ls-files --others --ignored --exclude-standard | head
```

`git check-ignore -v` es la respuesta a "no sé por qué no me sube este archivo".
Te dice el archivo y la línea exacta de la regla culpable.

### Ya está trackeado y quiero dejar de seguirlo

```bash
git rm --cached archivo          # lo saca del índice, lo deja en tu disco
git rm -r --cached carpeta/
git commit -m "chore: deja de trackear los artefactos de build"
```

> [!WARNING]
> Esto **no lo borra de la historia**: el archivo sigue en todos los commits
> anteriores y en todos los clones. Si lo que se te coló es un secreto, lo urgente
> es **revocarlo** ([Semana 01, Teoría 07](../../week-01-git_repaso_y_setup_pro/1-teoria/07-credenciales-y-tokens.md)); limpiar la historia viene después y no
> sustituye a la revocación.

### Lo que no debería estar en Git

Git guarda cada versión completa de cada archivo. Un binario de 50 MB que cambia
diez veces son 500 MB en cada clon, para siempre. Para eso está **Git LFS**, que
guarda un puntero en el repositorio y el archivo en otro sitio. Y para artefactos
de build, la respuesta correcta suele ser no versionarlos: se publican como
release o como artifact (Semanas 09 y 14).

## 3. `.gitattributes`

Es el archivo menos conocido y el que más problemas evita.

```gitattributes
# Normaliza finales de línea: LF en el repositorio, nativo al hacer checkout
* text=auto

# Archivos que siempre son LF, aunque el equipo trabaje en Windows
*.sh   text eol=lf
*.yml  text eol=lf

# Binarios: sin conversión ni diff textual
*.png  binary
*.pdf  binary

# Excluir generados de las estadísticas de lenguaje y colapsarlos en el diff
dist/*   linguist-generated=true
*.lock   linguist-generated=true
docs/*   linguist-documentation=true

# El CHANGELOG se funde sin conflictos: se quedan las dos versiones
CHANGELOG.md merge=union

# Diffs de Markdown por párrafo, no por línea
*.md   diff=markdown

# Fuera del tarball de release
.github/     export-ignore
tests/       export-ignore
```

| Atributo | Para qué |
|----------|----------|
| `text=auto` | Fin de la guerra CRLF/LF entre Windows y Linux |
| `eol=lf` | Fuerza LF — obligatorio en scripts que corren en runners Linux |
| `binary` | Atajo de `-text -diff`: ni conversión ni diff textual |
| `linguist-generated` | Fuera de las estadísticas y colapsado en el diff del PR |
| `linguist-vendored` | Igual, para dependencias incluidas en el repo |
| `linguist-language=X` | Corrige la detección de lenguaje |
| `diff=<driver>` | Diffs con contexto de función para un lenguaje concreto |
| `merge=union` | Fusiona conservando ambas partes (listas, changelogs) |
| `export-ignore` | Excluye del `git archive` y del tarball de release |
| `filter=lfs` | Lo pone Git LFS al trackear un tipo de archivo |

### Los finales de línea, en concreto

Sin `text=auto`, un equipo mixto produce diffs de archivos enteros cada vez que
alguien guarda: Windows escribe CRLF, Linux LF, y Git ve todas las líneas
cambiadas. Con `* text=auto`, el repositorio guarda LF siempre y cada quien ve en
su disco lo que su sistema espera.

Al añadirlo a un repositorio que ya existe, hay que renormalizar una vez:

```bash
git add --renormalize .
git commit -m "chore: normaliza los finales de línea"
```

Sale un commit gigante que toca medio repositorio. Es normal, se hace una sola
vez, y conviene apuntar su SHA en `.git-blame-ignore-revs`
([Teoría 07](07-blame-e-historia.md)).

### Comprobar qué atributos se aplican

```bash
git check-attr -a ruta/al/archivo
git check-attr linguist-generated -- dist/app.js
```

> [!TIP]
> Si tu repositorio dice que es 78 % HTML por culpa de una carpeta `coverage/`,
> `coverage/* linguist-generated=true` lo arregla. La barra de lenguajes es lo
> primero que mira mucha gente.

## 4. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `.env` commiteado | Secretos públicos para siempre | `.gitignore` + **revocar** lo filtrado |
| `.gitignore` global con reglas del proyecto | El resto del equipo no las tiene | Reglas del proyecto en el repositorio |
| Ignorar `package-lock.json` | Builds irreproducibles | Se commitea siempre |
| Añadir al `.gitignore` algo ya trackeado y esperar que desaparezca | Sigue en el índice | `git rm --cached` |
| Negar dentro de una carpeta ignorada | Git no entra en la carpeta | Ignora `carpeta/*` y luego niega |
| Sin `text=auto` en equipos mixtos | Diffs de archivos enteros por CRLF | `* text=auto` desde el día 1 |
| Binarios grandes versionados | Cada clon carga con toda la historia | Git LFS o fuera del repositorio |
| Marcar como `linguist-generated` código que sí se revisa | Se colapsa en el PR y nadie lo mira | Solo lo generado de verdad |

## 5. Trucos

- **Por qué se ignora un archivo**: `git check-ignore -v ruta`
- **Ver los atributos efectivos**: `git check-attr -a ruta`
- **Plantillas por lenguaje**: [github/gitignore](https://github.com/github/gitignore)
- **Ignorar cambios locales de un archivo trackeado** (configuración de ejemplo que
  todos tocan): `git update-index --skip-worktree config.local.json` — y recuérdalo,
  porque un `git pull` que lo cambie fallará de forma críptica
- **Ver cuánto ocupa cada cosa en la historia**:
  `git count-objects -vH` y `git rev-list --objects --all | wc -l`
- **Un `.gitattributes` mínimo que sirve para el 90 % de los repos**:
  `* text=auto` más dos líneas de `linguist-generated`

## 📚 Recursos Adicionales

- [Pro Git — Git Attributes](https://git-scm.com/book/en/v2/Customizing-Git-Git-Attributes)
- [`gitignore` — documentación](https://git-scm.com/docs/gitignore)
- [github/gitignore](https://github.com/github/gitignore) — plantillas
- [GitHub Docs — Git LFS](https://docs.github.com/repositories/working-with-files/managing-large-files/about-git-large-file-storage)

## ✅ Checklist de Verificación

- [ ] `.gitattributes` con `* text=auto` y los generados marcados
- [ ] `git check-ignore -v` te explica cualquier archivo ignorado
- [ ] `.env` ignorado y `.env.example` commiteado
- [ ] Sabes sacar del índice algo que se coló, y qué **no** arregla eso
- [ ] La barra de lenguajes de tu repositorio dice la verdad
