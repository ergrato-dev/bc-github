# Glosario — Semana 02

## B

**Badge** (*badge*) — Imagen SVG generada dinámicamente que muestra un estado
(CI, licencia, versión). Informa; no decora.

**Blame** (*blame*) — Vista que atribuye cada línea de un archivo al commit que
la introdujo. Sirve para encontrar el porqué, no al culpable.

## C

**`CODEOWNERS`** — Archivo que asigna revisores por ruta. Gana la **última**
regla que coincide. Sin un ruleset que lo exija, es una sugerencia.

**Community profile** (*community standards*) — Puntuación de GitHub sobre la
presencia de README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT y plantillas.

**Copyleft** — Cláusula que obliga a distribuir los derivados con la misma
licencia. Fuerte en GPL, extendida al uso como servicio en AGPL.

## G

**`.gitattributes`** — Configura el comportamiento de Git por patrón de archivo:
finales de línea, tratamiento binario, `linguist`, drivers de diff.

**`.git-blame-ignore-revs`** — Lista de SHAs de commits de formateo masivo que
`blame` debe saltarse. GitHub la lee automáticamente si está en la raíz.

**`.git/info/exclude`** — Equivalente local de `.gitignore` que no se commitea.

## J

**Jekyll** — Generador estático que GitHub Pages aplica por defecto. Ignora
archivos y carpetas que empiezan por `_` o `.`; se desactiva con `.nojekyll`.

## L

**Linguist** — Librería con la que GitHub detecta lenguajes. Se corrige con los
atributos `linguist-generated`, `linguist-vendored`, `linguist-documentation` y
`linguist-language`.

## M

**Mermaid** — Lenguaje de diagramas en texto que GitHub renderiza dentro de
bloques ` ```mermaid `. Se versiona con el código.

## P

**Pages** (*GitHub Pages*) — Hosting estático servido desde una rama o carpeta
del repositorio. Gratis en repos públicos.

**Permalink** — URL de un archivo fijada a un SHA en vez de a una rama. Se genera
pulsando `y`. Al pegarla en un issue o PR, GitHub incrusta el fragmento.

## S

**SPDX** — Identificador estándar de licencia (`MIT`, `Apache-2.0`,
`CC-BY-NC-SA-4.0`). Es lo que devuelve la API en `.license.spdx_id`.

## T

**Topic** (*topic*) — Etiqueta de descubrimiento del repositorio. En minúsculas y
con guiones; es el índice por el que la gente encuentra proyectos.

---

> 📚 Glosario global del bootcamp: [docs/glosario-global.md](../../../docs/glosario-global.md)
