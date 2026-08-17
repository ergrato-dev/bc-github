# Issue forms en YAML

> La diferencia entre "no funciona" y un reporte reproducible es un formulario
> con campos obligatorios.

## 🎯 Objetivos

- Escribir formularios de issue en YAML con validación
- Elegir el tipo de campo adecuado para cada dato
- Configurar `config.yml` para dirigir el tráfico
- Saber cuándo una plantilla Markdown sigue siendo mejor

## 1. Qué problema resuelve

Una plantilla Markdown es una sugerencia: el usuario puede borrarla entera. Un
**issue form** es un formulario de verdad, con campos que el navegador **no deja
enviar vacíos**.

El resultado no es burocracia: es que dejas de escribir "¿qué versión usas?" en
cada issue.

## 2. Dónde vive

```
.github/
└── ISSUE_TEMPLATE/
    ├── config.yml          # Configuración general
    ├── bug.yml             # Formulario de bug
    └── feature.yml         # Formulario de feature
```

Un archivo por tipo. GitHub muestra un selector cuando hay más de uno.

## 3. Estructura de un formulario

```yaml
name: 🐛 Reporte de bug
description: Algo no funciona como debería
title: "[Bug]: "
labels: ["bug", "triage"]
assignees: ["tu-usuario"]
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

## 4. Tipos de campo

| `type` | Para qué | Soporta `required` |
|--------|----------|:------------------:|
| `markdown` | Texto fijo de ayuda. No se envía | No |
| `input` | Una línea: versión, URL, entorno | Sí |
| `textarea` | Varias líneas. Admite `render: shell` para bloque de código | Sí |
| `dropdown` | Opción de una lista cerrada. `multiple: true` para varias | Sí |
| `checkboxes` | Confirmaciones. Cada opción tiene su propio `required` | Por opción |

`render:` en un `textarea` mete la respuesta en un bloque de código con
resaltado. Para logs y trazas es lo correcto: nadie pega los backticks.

```yaml
  - type: textarea
    id: logs
    attributes:
      label: Salida del error
      render: shell
```

## 5. `config.yml`

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

- `blank_issues_enabled: false` **obliga** a usar un formulario. Úsalo cuando el
  proyecto recibe reportes de gente ajena; en un repo interno puede estorbar.
- `contact_links` redirige lo que no debería ser un issue. El de seguridad es el
  más importante: evita que alguien publique una vulnerabilidad en abierto.

## 6. Cuándo NO usar un formulario

| Situación | Mejor opción |
|-----------|--------------|
| Repo de uso interno, equipo pequeño | Plantilla Markdown, menos fricción |
| Necesitas que se pueda editar libremente | Markdown |
| El issue lo crea un bot desde la API | Ninguna: el bot rellena el cuerpo |
| Plantilla de PR | Markdown: **`PULL_REQUEST_TEMPLATE.md` no soporta forms** |

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| 15 campos obligatorios | La gente no reporta y se va | 3-5 obligatorios como mucho |
| Pedir datos que puedes deducir | Fricción inútil | Deduce lo que puedas del entorno |
| `blank_issues_enabled: false` sin `contact_links` | La gente no tiene dónde preguntar | Ofrece siempre una salida |
| Un formulario por cada matiz | Selector con ocho opciones, parálisis | Dos o tres: bug, feature, y poco más |
| `labels` sin que la label exista | Se ignora en silencio | Crea las labels primero |
| Copiar un form de otro proyecto | Pide datos que tu proyecto no usa | Adáptalo a lo que de verdad necesitas |

## 8. Trucos

- **Probar el formulario sin publicarlo**: en la rama por defecto es lo único
  que GitHub lee, pero puedes previsualizar el YAML en `github.dev` con la
  extensión de validación de esquema
- **Prellenar campos por URL**:
  `/issues/new?template=bug.yml&version=1.2.0&title=[Bug]:%20...`
  Útil para poner un "Reportar bug" en tu web con datos ya rellenos
- **Etiquetar automáticamente por tipo**: `labels: ["bug", "triage"]` en el
  propio formulario, y tu triage empieza filtrado
- **Título prefijado**: `title: "[Bug]: "` deja el prefijo puesto y la lista de
  issues se lee mucho mejor
- **Crear desde la terminal con plantilla**: `gh issue create --template bug.yml`
- **Comprobar qué plantillas ve GitHub**:
  ```bash
  gh api repos/{owner}/{repo}/contents/.github/ISSUE_TEMPLATE --jq '.[].name'
  ```

## 📚 Recursos Adicionales

- [GitHub Docs — Syntax for issue forms](https://docs.github.com/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)
- [GitHub Docs — Configuring the template chooser](https://docs.github.com/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)
- [Esquema JSON de los issue forms](https://json.schemastore.org/github-issue-forms.json)

## ✅ Checklist de Verificación

- [ ] Tienes al menos dos formularios en `.github/ISSUE_TEMPLATE/`
- [ ] Cada uno tiene entre 3 y 5 campos obligatorios, no más
- [ ] `config.yml` ofrece al menos un `contact_link`
- [ ] Las labels que aplican los formularios existen en el repositorio
