# Glosario — Semana 01

Términos clave de esta semana, A-Z. El nombre real en inglés va entre paréntesis
cuando es como se encuentra en la documentación.

## B

**Bisect** (*bisect*) — Búsqueda binaria sobre la historia para localizar el
commit que introdujo un fallo. `git bisect run <comando>` la automatiza usando
el exit code del comando.

**Blob** — Objeto de Git que guarda el contenido de un archivo. No conoce su
propio nombre ni sus permisos: eso vive en el *tree*.

## C

**Commit** — Objeto que apunta a un *tree* (la foto del proyecto), a su padre o
padres, y añade autor, fecha y mensaje. Es inmutable: cambiar cualquier byte
produce otro commit distinto.

**Committer** — Quien creó el objeto commit, frente al *author*, que escribió el
cambio. Un rebase conserva el autor y reescribe el committer.

## D

**DAG** (*directed acyclic graph*) — El grafo dirigido acíclico que forman los
commits al apuntar a sus padres. La historia de Git es un grafo, no una lista.

**Detached HEAD** — Estado en el que `HEAD` apunta a un commit en vez de a una
rama. Es un estado normal, no un error; los commits que hagas ahí solo se
pierden si no creas una rama antes de irte.

## F

**Fine-grained token** (*fine-grained personal access token*) — PAT moderno,
acotado a repositorios y permisos concretos y con caducidad obligatoria. Es el
tipo de PAT recomendado.

**Fixup** — Commit marcado con `git commit --fixup <sha>` para fundirse
automáticamente con su destino en el siguiente `rebase -i --autosquash`.

## G

**`gh`** (*GitHub CLI*) — Cliente oficial de línea de comandos. Su subcomando
`gh api` da acceso directo a las APIs REST y GraphQL con la autenticación ya
resuelta.

**`GITHUB_TOKEN`** — Credencial efímera que GitHub Actions inyecta en cada job.
Su alcance se limita con `permissions` y caduca al terminar el job.

## H

**HEAD** — Puntero a la rama (o al commit) en el que estás trabajando.

## I

**Índice** (*index*, *staging area*) — Zona intermedia entre el directorio de
trabajo y el repositorio. `git add` escribe aquí; `git commit` convierte esto en
un commit.

## O

**`ORIG_HEAD`** — Referencia a donde estaba `HEAD` antes de la última operación
peligrosa (rebase, merge, reset). Atajo para deshacer el desastre más reciente.

## P

**PAT** (*personal access token*) — Token personal. El clásico concede scopes
sobre **toda** tu cuenta; el *fine-grained* se acota a repos y permisos
concretos.

## R

**Rebase** — Reescribir una serie de commits sobre otra base. Produce commits
nuevos (SHAs distintos) con el mismo contenido. Nunca se rebasea historia ya
publicada y compartida.

**Ref** (*reference*) — Archivo que contiene un SHA. Las ramas, los tags y
`HEAD` son refs.

**Reflog** — Registro local de todos los movimientos de `HEAD` durante ~90 días.
Es la red de seguridad de Git: recupera commits, no cambios sin commitear. No se
clona ni se empuja.

**`rerere`** (*reuse recorded resolution*) — Función que memoriza cómo
resolviste un conflicto y la reaplica si vuelve a aparecer.

## S

**SHA** — Hash del contenido de un objeto, y a la vez su nombre. Dos objetos con
el mismo contenido tienen el mismo SHA.

**Squash** — Fundir varios commits en uno. En `rebase -i`, `squash` deja editar
el mensaje combinado y `fixup` descarta el del commit absorbido.

**SSH signing** — Firmar commits con una clave SSH en vez de GPG
(`gpg.format = ssh`). La misma clave debe registrarse en GitHub dos veces: como
`authentication` y como `signing`.

## T

**Tree** — Objeto que representa una carpeta: una lista de nombres apuntando a
blobs y a otros trees.

## V

**Verified** — Etiqueta que GitHub muestra en un commit cuando la firma es
válida, la clave está registrada en la cuenta y el email del firmante está
verificado.

## W

**Worktree** — Directorio de trabajo adicional que comparte el mismo `.git`.
Permite tener dos ramas abiertas a la vez sin `stash` ni segundo clon.

---

> 📚 Glosario global del bootcamp: [docs/glosario-global.md](../../../docs/glosario-global.md)
