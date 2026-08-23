# Práctica 04 — SARIF de terceros

> Última pieza: que la pestaña de seguridad deje de ser «lo que encuentra
> GitHub» y pase a ser «lo que encuentra cualquier herramienta que uses». Y de
> paso, cerrar la puerta antes de que la dependencia mala entre: un pull request
> que introduce una vulnerabilidad no debería poder fusionarse.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-el-grafo-de-dependencias.md) y
[07](../1-teoria/07-sarif-y-herramientas-de-terceros.md).
[Práctica 03](03-codeql-en-verde.md) completada

## Paso 1: Revisar las dependencias en el pull request

**Por qué**: hasta ahora te enteras de una dependencia vulnerable **después** de
fusionarla. La revisión de dependencias compara la rama base con la del pull
request y falla si el diff introduce algo con aviso conocido.

```bash
git switch -c ci/revision-de-dependencias
cat > .github/workflows/dependency-review.yml <<'EOF'
name: Revisión de dependencias

on: pull_request

permissions:
  contents: read

jobs:
  revisar:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write     # para dejar el resumen como comentario
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

      - uses: actions/dependency-review-action@a1d282b36b6f3519aa1f3fc636f609c47dddb294 # v5.0.0
        with:
          fail-on-severity: high
          comment-summary-in-pr: on-failure
EOF
git add .github/workflows/dependency-review.yml
git commit -m "ci: revisar las dependencias que introduce cada pull request"
git push -u origin ci/revision-de-dependencias
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica** que el workflow existe y que sus permisos de escritura están en el
job:

```bash
gh api repos/{owner}/{repo}/contents/.github/workflows/dependency-review.yml \
  --jq '.content | @base64d' | grep -A3 "permissions:"
```

## Paso 2: Ver la puerta cerrarse

**Por qué**: un control que nunca ha dicho que no, no ha demostrado nada. Vamos a
intentar meter otra vez `minimist@1.2.5`, que tiene un aviso `critical`.

```bash
git switch -c chore/probar-la-revision
pnpm add minimist@1.2.5
git add package.json pnpm-lock.yaml
git commit -m "chore: probar la revisión de dependencias"
git push -u origin chore/probar-la-revision
gh pr create --fill
gh pr checks --watch
```

**Verifica** que el check falla y que hay un comentario en el pull request con el
paquete, el GHSA y la versión que lo arregla.

Ahora cierra el experimento sin fusionarlo:

```bash
gh pr close --delete-branch
```

Compara con la Práctica 01: allí la dependencia entró y **después** llegó la
alerta. Aquí no entra. Las dos capas hacen falta, porque la mayoría de los avisos
se publican cuando la dependencia lleva meses instalada.

## Paso 3: Una herramienta que no es de GitHub

**Por qué**: tu proyecto tiene un `Dockerfile` desde la Semana 12, y CodeQL no lo
mira. Trivy sí, y sabe emitir SARIF — que es todo lo que hace falta para que sus
hallazgos vivan en la misma bandeja que los de CodeQL.

```bash
git switch -c ci/analisis-estatico
cat > .github/workflows/analisis-estatico.yml <<'EOF'
name: Análisis estático de terceros

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  trivy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write     # publicar el SARIF
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

      - name: Buscar configuraciones inseguras
        uses: aquasecurity/trivy-action@ed142fd0673e97e23eac54620cfb913e5ce36c25 # v0.36.0
        continue-on-error: true
        with:
          scan-type: config
          scan-ref: .
          format: sarif
          output: trivy.sarif
          severity: MEDIUM,HIGH,CRITICAL

      - uses: github/codeql-action/upload-sarif@db488ddef3bf6cb639b32c2e9a7c0a7ea8271d28 # v4.37.8
        with:
          sarif_file: trivy.sarif
          category: trivy-config
EOF
git add .github/workflows/analisis-estatico.yml
git commit -m "ci: subir a code scanning los hallazgos de Trivy"
git push -u origin ci/analisis-estatico
gh pr create --fill
gh pr merge --squash --delete-branch
gh run watch
```

Los tres detalles que deciden si esto funciona:

- **`continue-on-error: true` en el paso que analiza**, no en el que sube: Trivy
  devuelve un código distinto de cero cuando encuentra algo y, sin esto, el SARIF
  no llegaría a subirse nunca
- **`security-events: write` en el job**: sin ese permiso la subida devuelve
  `403` al final, después de haber gastado el análisis
- **`category: trivy-config`**: sin una categoría propia, cada subida cerraría
  las alertas de CodeQL y al revés

> [!NOTE]
> Si tu repositorio no tiene `Dockerfile` ni ningún archivo de infraestructura,
> Trivy no encontrará nada y subirá un SARIF vacío. El análisis se registra
> igual, que es lo que comprueba el autograding — pero el ejercicio enseña más
> con algo que analizar.

## Paso 4: Comprobar que llegó

**Por qué**: la señal de que la integración funciona no es que el job esté verde;
es que exista un análisis con un `tool.name` que no sea `CodeQL`.

```bash
gh api "repos/{owner}/{repo}/code-scanning/analyses?per_page=100" \
  --jq 'group_by(.tool.name)
        | map({herramienta: .[0].tool.name, analisis: length, categorias: [.[].category] | unique})'
```

**Verifica** que ves dos herramientas distintas. Y que la bandeja está
unificada:

```bash
gh api "repos/{owner}/{repo}/code-scanning/alerts?state=open&per_page=100" \
  --jq 'group_by(.tool.name) | map({herramienta: .[0].tool.name, alertas: length})'
```

## Paso 5: Triar una alerta de terceros

**Por qué**: la ventaja de tenerlo todo en la misma bandeja es que se descarta
igual, con motivo y comentario, y queda registrado. Si Trivy no encontró nada,
sáltate este paso.

```bash
N=<numero-de-una-alerta-de-trivy>

gh api repos/{owner}/{repo}/code-scanning/alerts/$N --method PATCH \
  -f state=dismissed \
  -f dismissed_reason="won't fix" \
  -f dismissed_comment="La imagen corre como usuario no-root; el hallazgo aplica a la etapa de build."
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/code-scanning/alerts/$N \
  --jq '{state, dismissed_reason, dismissed_comment, herramienta: .tool.name}'
```

Los motivos de code scanning son distintos de los de Dependabot: `false
positive`, `won't fix`, `used in tests` y `mitigated`, con espacios y apóstrofo
tal cual.

## Paso 6: Documentarlo

**Por qué**: quien llegue al repositorio dentro de un año tiene que saber qué
analiza cada workflow y por qué. Un `.github/workflows/` con seis archivos sin
explicación es tan opaco como no tener ninguno.

Añade al `README.md` una sección corta:

```bash
cat >> README.md <<'EOF'

## Seguridad

| Control | Dónde | Qué cubre |
| --- | --- | --- |
| Dependabot alerts + security updates | Ajustes del repositorio | Vulnerabilidades de dependencias ya instaladas |
| Dependabot version updates | `.github/dependabot.yml` | Mantener dependencias y pines de actions al día |
| Revisión de dependencias | `.github/workflows/dependency-review.yml` | Bloquear dependencias vulnerables en el pull request |
| CodeQL | `.github/workflows/codeql.yml` | Código propio y workflows de Actions |
| Trivy | `.github/workflows/analisis-estatico.yml` | Configuración de contenedores e infraestructura |

Las alertas de todas las herramientas se ven en la pestaña **Security** del
repositorio.
EOF

git switch -c docs/seccion-de-seguridad
git commit -am "docs: documentar los controles de seguridad del repositorio"
git push -u origin docs/seccion-de-seguridad
gh pr create --fill
gh pr merge --squash --delete-branch
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/contents/README.md --jq '.content | @base64d' | grep -A5 "## Seguridad"
```

## ⚠️ Problemas frecuentes

| Síntoma | Causa | Arreglo |
|---------|-------|---------|
| El SARIF no se sube nunca | El paso que analiza falla primero | `continue-on-error: true` en ese paso |
| `403` al subir el SARIF | Falta `security-events: write` | En el job, no en el workflow |
| Las alertas de CodeQL desaparecen | Misma `category` en las dos subidas | Una categoría por herramienta |
| `dependency-review` falla siempre | El repo ya tenía dependencias vulnerables | Solo mira lo que **añade** el PR; revisa el diff |
| El resumen no aparece en el PR | Falta `pull-requests: write` | Añadirlo al job |
| Las alertas se recrean en cada análisis | SARIF sin `partialFingerprints` | Problema de la herramienta, no de GitHub |
| `422` al descartar | Motivo mal escrito | `won't fix`, `used in tests`, con espacios |

## ✅ Resultado

- [ ] `dependency-review.yml` revisando cada pull request
- [ ] Has visto el check fallar con una dependencia vulnerable de verdad
- [ ] `analisis-estatico.yml` subiendo SARIF con su propia `category`
- [ ] Hay análisis de dos herramientas distintas en `code-scanning/analyses`
- [ ] Sabes descartar una alerta de terceros con motivo
- [ ] Todas las actions van pinneadas por SHA con el tag en comentario
- [ ] El `README.md` explica qué cubre cada control

## ✅ Verificación de la semana

```bash
./scripts/verificar-semana.sh 13 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 13](../README.md)
