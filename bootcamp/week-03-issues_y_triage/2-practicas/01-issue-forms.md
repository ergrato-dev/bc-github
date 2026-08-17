# Práctica 01 — Issue forms

> Dos formularios que obligan a dar la información necesaria, y un `config.yml`
> que manda cada cosa a su sitio.

**Duración estimada**: 50 min
**Prerrequisitos**: [Teoría 02](../1-teoria/02-issue-forms-yaml.md)

## Contexto

Tu repositorio ya es presentable (Semana 02). Si alguien encuentra un fallo, hoy
te escribiría "no funciona". Vamos a hacer que eso sea imposible.

## Paso 1: Crear las labels que usarán los formularios

**Por qué**: un formulario que aplica una label inexistente la ignora **en
silencio**. Primero las labels.

```bash
cd <tu-repo>
gh label create "type:bug"     --color B60205 --description "Algo no funciona como debería" --force
gh label create "type:feature" --color 1D76DB --description "Funcionalidad nueva" --force
gh label create "status:triage" --color BFDADC --description "Pendiente de clasificar" --force
```

**Verifica**:

```bash
gh label list --json name --jq '.[].name' | grep -E 'type:|status:'
```

## Paso 2: El formulario de bug

**Por qué**: cada campo obligatorio es una pregunta que no tendrás que hacer.

```bash
mkdir -p .github/ISSUE_TEMPLATE
cat > .github/ISSUE_TEMPLATE/bug.yml <<'EOF'
name: 🐛 Reporte de bug
description: Algo no funciona como debería
title: "[Bug]: "
labels: ["type:bug", "status:triage"]
body:
  - type: markdown
    attributes:
      value: |
        Gracias por reportar. Los campos marcados son necesarios para reproducirlo.

  - type: input
    id: version
    attributes:
      label: Versión
      description: Commit o tag donde ocurre
      placeholder: "v1.0.0 o el SHA corto"
    validations:
      required: true

  - type: textarea
    id: reproduccion
    attributes:
      label: Pasos para reproducir
      value: |
        1.
        2.
        3.

        **Esperado**:
        **Real**:
    validations:
      required: true

  - type: textarea
    id: logs
    attributes:
      label: Salida del error
      description: Se formatea como bloque de código automáticamente
      render: shell

  - type: dropdown
    id: severidad
    attributes:
      label: Severidad
      options:
        - Bloquea el uso
        - Molesto, pero hay alternativa
        - Cosmético
    validations:
      required: true

  - type: checkboxes
    id: previo
    attributes:
      label: Antes de enviar
      options:
        - label: He buscado si ya existe un issue igual
          required: true
EOF
```

**Verifica**:

```bash
python3 -c "import yaml,sys; yaml.safe_load(open('.github/ISSUE_TEMPLATE/bug.yml')); print('YAML válido')"
```

## Paso 3: El formulario de feature

**Por qué**: una petición sin el problema detrás es una solución sin causa.

```bash
cat > .github/ISSUE_TEMPLATE/feature.yml <<'EOF'
name: ✨ Propuesta de funcionalidad
description: Sugiere algo nuevo o una mejora
title: "[Feature]: "
labels: ["type:feature", "status:triage"]
body:
  - type: textarea
    id: problema
    attributes:
      label: Qué problema resuelve
      description: Describe el problema, no la solución que ya tienes en mente
    validations:
      required: true

  - type: textarea
    id: propuesta
    attributes:
      label: Propuesta
    validations:
      required: true

  - type: textarea
    id: alternativas
    attributes:
      label: Alternativas consideradas
      description: Qué otras formas descartaste y por qué

  - type: textarea
    id: aceptacion
    attributes:
      label: Criterios de aceptación
      value: |
        - [ ]
        - [ ]
    validations:
      required: true
EOF
```

**Verifica**:

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/ISSUE_TEMPLATE/feature.yml')); print('YAML válido')"
```

## Paso 4: `config.yml`

**Por qué**: hay dos cosas que **no** deben ser un issue público: las preguntas
(saturan) y las vulnerabilidades (se divulgan).

```bash
cat > .github/ISSUE_TEMPLATE/config.yml <<'EOF'
blank_issues_enabled: false
contact_links:
  - name: 💬 Preguntas y dudas
    url: https://github.com/<tu-usuario>/<tu-repo>/discussions
    about: Para preguntas usa Discussions, no Issues
  - name: 🔒 Vulnerabilidad de seguridad
    url: https://github.com/<tu-usuario>/<tu-repo>/security/advisories/new
    about: Repórtala en privado, nunca en un issue público
EOF

git add .github/ISSUE_TEMPLATE
git commit -qm "feat: añade formularios de issue y configuración del selector"
git push -q
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/contents/.github/ISSUE_TEMPLATE --jq '.[].name'
# bug.yml, config.yml, feature.yml
```

## Paso 5: Probarlo de verdad

**Por qué**: el YAML puede ser válido y el formulario no funcionar.

```bash
gh browse --branch main .github/ISSUE_TEMPLATE
```

Abre `https://github.com/<tu-usuario>/<tu-repo>/issues/new/choose`. Debes ver:

- Los dos formularios, con nombre y descripción
- Los dos contact links
- **Ningún** botón de issue en blanco

Crea un bug de prueba desde el formulario. Intenta enviarlo sin rellenar la
versión: no debe dejarte.

**Verifica**:

```bash
gh issue list --label "type:bug" --json number,title,labels \
  --jq '.[] | "\(.number) \(.title) [\([.labels[].name] | join(", "))]"'
```

Las labels deben haberse aplicado solas.

## Paso 6: Prellenar por URL

**Por qué**: para poner un "Reportar un bug" desde tu web o tu documentación con
la mitad del formulario ya rellena.

```
https://github.com/<tu-usuario>/<tu-repo>/issues/new?template=bug.yml&version=v1.0.0
```

Los `id` de los campos son los nombres de parámetro. Ábrela y comprueba que el
campo *Versión* llega relleno.

**Verifica**: el campo aparece con el valor de la URL.

## ✅ Resultado

- [ ] Dos formularios en `.github/ISSUE_TEMPLATE/`, YAML válido
- [ ] Ambos aplican labels que existen
- [ ] `config.yml` con `blank_issues_enabled: false` y dos contact links
- [ ] Un issue creado desde el formulario, etiquetado automáticamente
- [ ] La URL con parámetros prellena el campo

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| El selector no aparece | Los archivos no están en la rama por defecto | Haz push a `main` |
| El formulario no aplica labels | La label no existe | Créala con `gh label create` |
| "There is a problem with this template" | YAML inválido o `type` desconocido | Valida el YAML y revisa los tipos permitidos |
| Sigue apareciendo el issue en blanco | `blank_issues_enabled` mal escrito o en otro archivo | Debe estar en `config.yml`, en minúsculas |
| `render: shell` no formatea | Está en un `input` en vez de un `textarea` | Solo funciona en `textarea` |
| El contact link no aparece | URL mal formada | Debe ser absoluta, con `https://` |
