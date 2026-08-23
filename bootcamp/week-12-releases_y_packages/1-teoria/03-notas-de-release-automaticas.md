# Notas de release automáticas

> Las notas de un release las lee alguien que está decidiendo si actualizar.
> Escribirlas a mano el viernes por la tarde produce «varias mejoras y
> correcciones»; generarlas desde los pull requests produce una lista que se
> puede leer en treinta segundos. GitHub lo hace gratis y casi nadie lo configura.

## 🎯 Objetivos

- Generar el cuerpo de un release desde los pull requests fusionados
- Configurar `.github/release.yml` para agrupar por categorías y excluir ruido
- Saber qué rango de commits usa GitHub y cómo cambiarlo
- Distinguir las notas generadas de un `CHANGELOG.md` versionado

## 1. Qué problema resuelve

El cuerpo de un release contesta tres preguntas: qué cambió, qué se rompe y a
quién hay que agradecérselo. Todas están ya en los pull requests fusionados desde
el release anterior — título, etiquetas y autor.

GitHub tiene una API que hace justo eso:

```bash
gh api repos/{owner}/{repo}/releases/generate-notes \
  --method POST -f tag_name=v1.1.0 --jq .body
```

No crea nada: devuelve el texto. Es el mismo motor que usa el botón *Generate
release notes* de la interfaz y el flag `--generate-notes` de `gh`.

## 2. Qué entra en las notas

GitHub recorre los **pull requests fusionados** entre el release anterior y el
tag nuevo, no los commits. Consecuencia práctica: lo que se empuja directo a
`main` sin PR **no aparece**. Con el ruleset de la Semana 08 exigiendo pull
request, eso deja de ser un problema y pasa a ser una garantía.

De cada PR toma el **título** y el **autor**. El título del PR es el que acaba en
las notas de release que leerán tus usuarios — un buen motivo más para cuidarlo.

El punto de partida se puede mover:

```bash
gh release create v1.2.0 --generate-notes --notes-start-tag v1.0.0
```

Útil cuando se publican varias versiones a la vez o cuando la anterior fue un
prerelease que no quieres usar de referencia.

## 3. `.github/release.yml`

Sin configuración, todas las entradas caen en una lista plana. El archivo
`.github/release.yml` agrupa por etiquetas y filtra:

```yaml
changelog:
  exclude:
    labels:
      - sin-changelog
    authors:
      - dependabot
  categories:
    - title: ⚠️ Cambios incompatibles
      labels:
        - breaking-change
    - title: ✨ Novedades
      labels:
        - enhancement
        - feature
    - title: 🐛 Correcciones
      labels:
        - bug
    - title: 📦 Dependencias
      labels:
        - dependencies
    - title: 🧹 Otros
      labels:
        - "*"
```

Reglas del formato:

- `title` y `labels` son obligatorios en cada categoría
- **El orden importa**: cada PR cae en la primera categoría que casa, y solo en
  una
- `"*"` es el comodín de recogida; va **al final** o se traga todo lo demás
- `exclude` existe a nivel global y dentro de cada categoría
- Una categoría sin PR que la llenen no aparece en las notas

Esto ata las notas de release a la taxonomía de etiquetas de la Semana 03. Si
esas etiquetas no se aplican, el archivo no sirve: todo cae en `"*"`.

## 4. Notas generadas frente a `CHANGELOG.md`

Son dos cosas distintas y conviene tener las dos:

| | Notas del release | `CHANGELOG.md` |
|---|-------------------|----------------|
| Dónde vive | Base de datos de GitHub | El repositorio, versionado |
| Se genera de | Pull requests fusionados | Mensajes de commit |
| Se lee | Al decidir si actualizar | Al investigar cuándo cambió algo |
| Funciona sin GitHub | No | Sí |
| Quién lo escribe aquí | La API de notas | `release-please` (teoría 04) |

El `CHANGELOG.md` es el que sobrevive a una migración de plataforma y el que se
puede leer sin conexión. Las notas del release son la portada.

## 5. Escribir el resumen a mano encima

Lo generado no contesta «¿debo actualizar?». Añade dos párrafos delante:

```bash
cat > notas.md <<'TXT'
Esta versión cambia el formato de salida de `exportar` de CSV a JSON.
Si automatizas el comando, lee la [guía de migración](docs/migracion-v2.md).

Actualiza si necesitas la exportación por lotes; si no, la 1.x sigue con soporte
de seguridad hasta diciembre de 2026.
TXT

gh release create v2.0.0 --generate-notes --notes-file notas.md
```

Con `--notes-file` (o `--notes`) junto a `--generate-notes`, el texto propio se
**antepone** a la lista generada. Es el único trozo que merece la pena escribir a
mano.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Notas escritas a mano cada vez | Se degradan a «mejoras varias» | Generar y añadir el resumen |
| `"*"` en la primera categoría | Se traga todos los PR | Comodín al final |
| Categorías con etiquetas que nadie aplica | Notas vacías o todo en «Otros» | Alinear con la taxonomía de la Semana 03 |
| Títulos de PR tipo `fix stuff` | Acaban tal cual en las notas públicas | Revisar el título antes de fusionar |
| Solo `CHANGELOG.md` | Nadie lo encuentra desde la portada | Los dos, con propósitos distintos |
| Cambios incompatibles sin guía enlazada | El usuario se entera al romperse | Enlace en el primer párrafo |

## 7. Trucos

- **Previsualiza antes de publicar**: `gh api .../releases/generate-notes --method POST -f tag_name=vX --jq .body`
  no crea nada y enseña exactamente lo que saldrá
- **`--notes-from-tag`** reutiliza el mensaje del tag anotado como cuerpo del
  release: útil en proyectos que ya escriben tags con detalle
- **`previous_tag_name`** es un campo del cuerpo de la petición a
  `generate-notes`: el equivalente de `--notes-start-tag` por API
- **Una etiqueta `sin-changelog`** para PR de mantenimiento mantiene las notas
  legibles sin renunciar a los PR pequeños
- **`exclude.authors` con los bots** evita que veinte PR de dependencias tapen
  las dos novedades reales

## 📚 Recursos Adicionales

- [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes)
- [REST — Generate release notes](https://docs.github.com/en/rest/releases/releases#generate-release-notes-content-for-a-release)
- [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)

## ✅ Checklist de Verificación

- [ ] Sabes generar el cuerpo de un release sin escribirlo
- [ ] Tienes `.github/release.yml` con el comodín al final
- [ ] Sabes por qué un push directo a `main` no aparece en las notas
- [ ] Puedes explicar para qué sirve el `CHANGELOG.md` si ya hay notas
- [ ] Sabes anteponer un resumen propio a lo generado
