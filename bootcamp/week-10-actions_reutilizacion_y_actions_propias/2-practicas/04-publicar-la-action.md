# Práctica 04 — Publicar y versionar la action

> La action funciona dentro de tu repositorio. Ahora se convierte en algo que
> otra persona puede usar: repositorio propio, versiones, release y consumo por
> SHA desde el hilo conductor.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 07](../1-teoria/07-versionar-publicar-y-compartir.md),
[Práctica 03](03-action-en-javascript.md) completada

## Contexto

Es la única semana del bootcamp con un **segundo repositorio**, y por un motivo
concreto: el Marketplace exige un `action.yml` en la **raíz** del repositorio, y
la raíz de tu hilo conductor ya está ocupada por tu proyecto.

> [!IMPORTANT]
> El repositorio se tiene que llamar exactamente **`accion-tamano-pr`**. Las
> comprobaciones automáticas de la semana lo buscan por ese nombre en tu cuenta.

## Paso 1: Crear el repositorio de la action

```bash
gh repo create accion-tamano-pr --public --clone \
  --description "GitHub Action que etiqueta los PR según su tamaño"
cd accion-tamano-pr
```

Copia el contenido de la action, **subiendo un nivel** los archivos:

```bash
cp -r <ruta-a-tu-hilo-conductor>/acciones/tamano-pr/. .
ls -1
```

**Verifica**: `action.yml` está en la raíz, no dentro de una carpeta.

```bash
test -f action.yml && echo "action.yml en la raíz, correcto"
```

## Paso 2: El README, que es la mitad del producto

**Por qué**: quien encuentre tu action decide en diez segundos si la usa. Lo que
necesita saber son tres cosas: cómo se llama, qué inputs tiene y qué permisos hay
que concederle.

````bash
cat > README.md <<'DOC'
# Etiquetar tamaño del PR

Añade una label (`tamano:s`, `tamano:m`, `tamano:l`, `tamano:xl`) según cuántas
líneas cambia el pull request.

## Uso

```yaml
permissions:
  contents: read
  pull-requests: write

jobs:
  tamano:
    runs-on: ubuntu-latest
    steps:
      - uses: tu-usuario/accion-tamano-pr@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Entradas

| Nombre | Obligatorio | Por defecto | Qué hace |
|--------|:-----------:|-------------|----------|
| `token` | sí | — | Token con `pull-requests: write` |
| `umbral-grande` | no | `400` | Líneas a partir de las que el PR es `xl` |

## Salidas

| Nombre | Qué devuelve |
|--------|--------------|
| `tamano` | La etiqueta aplicada: `s`, `m`, `l` o `xl` |

## Requisitos

Las labels `tamano:*` tienen que existir en el repositorio.
DOC
````

Añade también el `branding`, que es lo que se ve en el listado:

```yaml
branding:
  icon: tag
  color: blue
```

**Verifica**:

```bash
python3 -c "import yaml; d=yaml.safe_load(open('action.yml')); print(d['branding'])"
```

## Paso 3: La autoprueba

**Por qué**: publicar algo que nunca se ha ejecutado desde fuera es cómo se
publican las actions rotas.

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  unidad:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: "24"
      - run: node --test

  autoprueba:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: read
      pull-requests: write
    if: ${{ github.event_name == 'pull_request' }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - id: probar
        uses: ./
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          umbral-grande: "10"
      - shell: bash
        env:
          TAMANO: ${{ steps.probar.outputs.tamano }}
        run: : "${TAMANO:?la action no devolvió tamaño}"
```

```bash
git add -A
git commit -m "feat: primera versión de la action"
git push -u origin main
```

**Verifica** que el job `unidad` pasa:

```bash
gh run watch
```

(La autoprueba necesita un PR: se comprueba en el paso siguiente.)

## Paso 4: Probarla con un PR de verdad

```bash
gh label create "tamano:s"  --color 0e8a16 --force
gh label create "tamano:xl" --color b60205 --force

git switch -qc prueba/autoprueba
printf '\n<!-- prueba -->\n' >> README.md
git commit -am "docs: cambio mínimo para probar la action"
git push -u origin prueba/autoprueba
gh pr create --fill
gh run watch
```

**Verifica**:

```bash
gh pr view --json labels --jq '[.labels[].name]'
gh pr merge --squash --delete-branch
```

## Paso 5: Publicar la versión

**Por qué**: hasta que no hay tag, nadie puede usar tu action de forma estable.

```bash
git switch main && git pull

git tag -a v1.0.0 -m "v1.0.0 — primera versión"
git push origin v1.0.0

git tag -f -a v1 -m "v1 → v1.0.0"
git push -f origin v1

gh release create v1.0.0 --title "v1.0.0" --generate-notes
```

**Verifica** que los dos tags apuntan al mismo commit:

```bash
git rev-parse v1^{} v1.0.0^{}      # las dos líneas deben ser idénticas
gh api repos/{owner}/accion-tamano-pr/git/matching-refs/tags --jq '.[].ref'
```

> [!NOTE]
> Los dos tags son **anotados**, así que cada uno es un objeto propio con su
> propio SHA: comparar `git/ref/tags/<nombre> --jq .object.sha` da valores
> distintos aunque apunten al mismo commit. El `^{}` de `git rev-parse` es lo que
> resuelve la etiqueta hasta el commit.

> [!WARNING]
> `push -f` sobre `v1` es aceptable porque es un puntero móvil por convención del
> ecosistema. Sobre `v1.0.0` **nunca**: una versión publicada que cambia de
> contenido rompe la reproducibilidad de quien la tenga pinneada.

## Paso 6: Consumirla desde el hilo conductor

**Por qué**: cerrar el círculo. Tu repositorio principal deja de tener la action
dentro y pasa a consumir la publicada, pinneada por SHA.

```bash
cd <ruta-a-tu-hilo-conductor>
git switch -qc ci/usar-action-publicada

SHA=$(gh api repos/{owner}/accion-tamano-pr/git/ref/tags/v1.0.0 --jq .object.sha)
echo "$SHA"
```

En `.github/workflows/etiquetar-pr.yml`, cambia la referencia local por la
publicada:

```yaml
      - id: etiquetar
        uses: tu-usuario/accion-tamano-pr@<SHA>   # v1.0.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

Y borra la copia local:

```bash
git rm -r --cached acciones/tamano-pr -q && rm -rf acciones
git add -A
git commit -m "ci: consume la action publicada en vez de la copia local"
git push -u origin ci/usar-action-publicada
gh pr create --fill
gh run watch
```

**Verifica** que el PR sigue recibiendo su label, ahora con la action externa:

```bash
gh pr view --json labels --jq '[.labels[].name] | map(select(startswith("tamano:")))'
gh pr merge --squash --delete-branch
```

## Paso 7: Publicar en el Marketplace (opcional)

**Por qué**: no cambia nada técnico —tu action ya se puede usar—, solo la hace
descubrible. Requisitos: repositorio público, `action.yml` en la raíz, nombre
único, 2FA activo y aceptar los términos.

En la página del repositorio aparece un banner sobre el `action.yml`:
*Draft a release* → marcar **Publish this Action to the GitHub Marketplace** →
elegir categorías → publicar.

**Verifica**: si el nombre está cogido, el formulario lo dice al momento. Cámbialo
en `action.yml` (`name:`) antes de publicar, no después.

## Paso 8: Verificación final de la semana

```bash
./scripts/verificar-semana.sh 10 --repo <tu-usuario>/<tu-repo>
```

## 🧭 Qué llevarte

- El Marketplace exige `action.yml` en la raíz: por eso la action tiene su propio
  repositorio
- `v1.2.3` es inmutable; `v1` es un puntero que se mueve en cada release
  compatible
- El README con inputs, outputs y **permisos** es la mitad del producto
- Quien consume en serio pinnea por SHA, con el tag en un comentario
- Una action que nunca se ha ejecutado desde fuera es una action sin probar

## ⬅️ Volver

[Índice de la Semana 10](../README.md)
