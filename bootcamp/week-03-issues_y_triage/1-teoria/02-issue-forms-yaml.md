# Issue forms en YAML

> La diferencia entre "no funciona" y un reporte reproducible es un formulario
> con campos obligatorios.

## 🎯 Objetivos

- Escribir formularios de issue en YAML con validación
- Elegir el tipo de campo adecuado para cada dato
- Configurar el selector de plantillas y dirigir el tráfico con `config.yml`
- Prellenar un formulario desde una URL
- Saber cuándo una plantilla Markdown sigue siendo mejor

## 1. Qué problema resuelve

Una plantilla Markdown es una sugerencia: quien abre el issue puede borrarla
entera. Un **issue form** es un formulario de verdad, con campos que el navegador
no deja enviar vacíos.

El resultado no es burocracia: es que dejas de escribir "¿qué versión usas?" en
cada issue, y que el triage de la [Teoría 07](07-triage.md) empieza con la
información ya puesta.

## 2. Dónde vive

```
.github/
└── ISSUE_TEMPLATE/
    ├── config.yml          # El selector: qué se ofrece y qué se desvía
    ├── bug.yml             # Formulario de bug
    └── feature.yml         # Formulario de feature
```

Un archivo por tipo. GitHub muestra un selector cuando hay más de uno, y **solo
lee la rama por defecto**: una plantilla en una rama de trabajo no existe para
nadie.

Si tu cuenta u organización tiene un repositorio `.github`, sus plantillas valen
para todos los repos que no traigan las suyas
([Semana 02, Teoría 01](../../week-02-repositorio_como_producto/1-teoria/01-anatomia-de-un-repo.md)).

## 3. Estructura de un formulario

```yaml
name: 🐛 Reporte de bug
description: Algo no funciona como debería
title: "[Bug]: "
labels: ["type:bug", "status:triage"]
type: Bug                      # issue type de la organización, si los usas
assignees: ["tu-usuario"]
projects: ["ergrato-dev/3"]    # lo añade al Project directamente
body:
  - type: markdown
    attributes:
      value: |
        Gracias por reportar. Rellena los campos: sin ellos no podemos reproducirlo.

  - type: input
    id: version
    attributes:
      label: Versión
      description: Salida de `node src/index.js --version`
      placeholder: "1.2.0"
    validations:
      required: true

  - type: textarea
    id: reproduccion
    attributes:
      label: Pasos para reproducir
      description: Qué hiciste, qué esperabas, qué pasó
      value: |
        1.
        2.
        3.

        **Esperado**:
        **Real**:
    validations:
      required: true

  - type: dropdown
    id: severidad
    attributes:
      label: Severidad
      options:
        - Bloquea el uso
        - Molesto pero hay alternativa
        - Cosmético
      default: 1
    validations:
      required: true

  - type: checkboxes
    id: comprobaciones
    attributes:
      label: Antes de enviar
      options:
        - label: He buscado si ya existe un issue igual
          required: true
        - label: Estoy en la última versión
```

Las claves de arriba (`labels`, `type`, `assignees`, `projects`, `title`) hacen
trabajo de triage **antes** de que el issue exista. Cada una que rellenes es una
decisión que nadie tendrá que tomar después.

## 4. Tipos de campo

| `type` | Para qué | Soporta `required` |
|--------|----------|:------------------:|
| `markdown` | Texto fijo de ayuda. **No se envía** con el issue | No |
| `input` | Una línea: versión, URL, entorno | Sí |
| `textarea` | Varias líneas. Admite `render:` para bloque de código | Sí |
| `dropdown` | Lista cerrada. `multiple: true` para varias, `default:` para preseleccionar | Sí |
| `checkboxes` | Confirmaciones. Cada opción tiene su propio `required` | Por opción |

`render:` en un `textarea` mete la respuesta en un bloque de código con
resaltado. Para logs y trazas es lo correcto: nadie pega los acentos graves.

```yaml
  - type: textarea
    id: logs
    attributes:
      label: Salida del error
      render: shell
```

Dos límites que conviene conocer antes de diseñar: **no hay campos
condicionales** (nada de "si eliges X, muestra Y") y **no hay validación de
formato** más allá de obligatorio o no. Si necesitas comprobar el contenido, se
hace después con un workflow (Semana 10).

## 5. `config.yml`: el selector

```yaml
blank_issues_enabled: false
contact_links:
  - name: 💬 Preguntas y dudas
    url: https://github.com/OWNER/REPO/discussions
    about: Para preguntas usa Discussions, no Issues
  - name: 🔒 Vulnerabilidad de seguridad
    url: https://github.com/OWNER/REPO/security/advisories/new
    about: Repórtala en privado, nunca en un issue público
```

- `blank_issues_enabled: false` **obliga** a usar un formulario. Tiene sentido
  cuando el proyecto recibe reportes de gente ajena; en un repositorio interno
  puede estorbar más que ayudar
- `contact_links` redirige lo que no debería ser un issue. El de seguridad es el
  más importante: evita que alguien publique una vulnerabilidad en abierto

## 6. Prellenar desde una URL

Los `id` de los campos son parámetros de consulta:

```
https://github.com/OWNER/REPO/issues/new?template=bug.yml&version=1.2.0&title=%5BBug%5D%3A+
```

Con eso puedes poner un botón "Reportar un fallo" en tu aplicación o en tu web
que llegue con la versión, el sistema operativo y el identificador de build ya
rellenos. Es la forma más barata que existe de subir la calidad de los reportes.

## 7. Formularios o Markdown

| Situación | Mejor opción |
|-----------|--------------|
| Reportes de gente ajena al proyecto | **Form**: campos obligatorios |
| Repositorio interno, equipo pequeño | Markdown: menos fricción |
| Se necesita editar el cuerpo libremente | Markdown |
| El issue lo crea un bot desde la API | Ninguna: el bot compone el cuerpo |
| Plantilla de PR | Markdown: **`PULL_REQUEST_TEMPLATE.md` no admite forms** |

Una plantilla Markdown también acepta metadatos, en un frontmatter:

```markdown
---
name: Tarea
about: Trabajo planificado del equipo
title: "[Tarea]: "
labels: ["type:task"]
---

## Contexto

## Criterios de aceptación
- [ ]
```

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| 15 campos obligatorios | La gente no reporta y se va | 3-5 obligatorios como mucho |
| Pedir datos que puedes deducir | Fricción inútil | Dedúcelos del entorno o prellénalos por URL |
| `blank_issues_enabled: false` sin `contact_links` | La gente no tiene dónde preguntar | Ofrece siempre una salida |
| Un formulario por cada matiz | Selector con ocho opciones, parálisis | Dos o tres: bug, feature y poco más |
| `labels` que no existen en el repositorio | Se ignoran en silencio | Crea las labels primero ([Teoría 03](03-labels.md)) |
| Editar la plantilla en una rama y esperar verla | Solo cuenta la rama por defecto | Mergea antes de probar |
| Copiar un formulario de otro proyecto | Pide datos que tu proyecto no usa | Adáptalo |
| Campos de texto libre para lo que es una lista | Cada respuesta se escribe distinto y no se puede filtrar | `dropdown` |

## 9. Trucos

- **Validar el YAML antes de mergear**: existe un esquema JSON oficial
  ([`github-issue-forms.json`](https://json.schemastore.org/github-issue-forms.json));
  los editores lo aplican solos y en CI se puede comprobar con cualquier
  validador de esquemas
- **Título prefijado**: `title: "[Bug]: "` deja el prefijo puesto y la lista de
  issues se lee mucho mejor
- **Etiquetar desde el propio formulario**: `labels: ["type:bug", "status:triage"]`
  y tu triage empieza filtrado
- **Añadir al Project desde el formulario**: `projects: ["ORG/NUMERO"]`
- **Crear desde la terminal con plantilla**: `gh issue create --template bug.yml`
- **Ver qué plantillas ve GitHub**:
  ```bash
  gh api repos/{owner}/{repo}/contents/.github/ISSUE_TEMPLATE --jq '.[].name'
  ```
- **Un formulario para el equipo y otro para fuera**: el interno con dos campos,
  el externo con los cinco que necesitas para reproducir

## 📚 Recursos Adicionales

- [GitHub Docs — Syntax for issue forms](https://docs.github.com/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)
- [GitHub Docs — Configuring the template chooser](https://docs.github.com/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)
- [GitHub Docs — Using query parameters to create an issue](https://docs.github.com/issues/tracking-your-work-with-issues/using-issues/creating-an-issue)
- [Esquema JSON de los issue forms](https://json.schemastore.org/github-issue-forms.json)

## ✅ Checklist de Verificación

- [ ] Tienes al menos dos formularios en `.github/ISSUE_TEMPLATE/`
- [ ] Cada uno tiene entre 3 y 5 campos obligatorios, no más
- [ ] `config.yml` ofrece al menos un `contact_link`
- [ ] Las labels que aplican los formularios existen en el repositorio
- [ ] Sabes prellenar un formulario desde una URL
