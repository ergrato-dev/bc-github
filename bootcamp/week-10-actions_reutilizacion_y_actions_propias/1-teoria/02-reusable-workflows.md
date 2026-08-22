# Reusable workflows

> Un job que en vez de tener `steps:` tiene `uses:`. Con esa frase se entiende el
> 80 %; el otro 20 % son los inputs, los secretos y los límites, que es donde se
> atasca todo el mundo.

## 🎯 Objetivos

- Escribir un workflow invocable con `workflow_call`
- Declarar y consumir `inputs`, `secrets` y `outputs`
- Llamarlo desde otro workflow, con matriz y con `needs`
- Manejar permisos y secretos sin abrir agujeros
- Conocer los límites reales: anidamiento, entorno y qué **no** se hereda

## 1. Qué problema resuelve

El `ci.yml` de la Semana 09 tiene tres jobs, una matriz y una caché bien
afinada. En el segundo proyecto lo quieres igual, cambiando dos cosas: la versión
de Node y si se publica o no un artifact.

Un reusable workflow es ese `ci.yml` convertido en función: mismo cuerpo,
parámetros distintos.

## 2. El workflow invocable

```yaml
# .github/workflows/ci-reutilizable.yml
name: CI reutilizable

on:
  workflow_call:
    inputs:
      node-version:
        description: Versión de Node con la que ejecutar los tests
        type: string
        required: false
        default: "24"
      publicar-cobertura:
        description: Si se sube el informe de cobertura como artifact
        type: boolean
        required: false
        default: false
    secrets:
      TOKEN_INFORMES:
        description: Token para publicar el informe. Opcional
        required: false
    outputs:
      cobertura:
        description: Porcentaje de líneas cubiertas
        value: ${{ jobs.test.outputs.cobertura }}

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    outputs:
      cobertura: ${{ steps.medir.outputs.pct }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci
      - id: medir
        shell: bash
        run: |
          npm test
          echo "pct=87" >> "$GITHUB_OUTPUT"
```

Tres cosas de las que casi nadie se acuerda a la primera:

- Los tipos válidos de `inputs` son **`string`, `number` y `boolean`**. No hay
  `choice` aquí (eso es de `workflow_dispatch`)
- Los `secrets` se **declaran** uno a uno, con su nombre y si son obligatorios
- Los `outputs` del workflow salen de los `outputs` de un job, que a su vez salen
  de un step con `id`

## 3. La llamada

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
  ci:
    uses: ./.github/workflows/ci-reutilizable.yml
    with:
      node-version: "24"
      publicar-cobertura: true
    secrets:
      TOKEN_INFORMES: ${{ secrets.TOKEN_INFORMES }}

  avisar:
    needs: ci
    runs-on: ubuntu-latest
    steps:
      - run: echo "Cobertura ${{ needs.ci.outputs.cobertura }} %"
```

El job que llama **no tiene `steps:` ni `runs-on:`**. Solo admite estas claves:

| Clave | Para qué |
|-------|----------|
| `uses` | Qué workflow se llama |
| `with` | Los `inputs` |
| `secrets` | Los secretos, uno a uno o `inherit` |
| `needs`, `if` | Igual que en cualquier job |
| `permissions` | Los permisos con los que corre el workflow llamado |
| `strategy` | Matriz: el workflow se llama una vez por combinación |
| `concurrency` | Igual que en cualquier job |

Cualquier otra clave (`runs-on`, `container`, `services`, `env`) es un error de
sintaxis, y el mensaje no siempre lo deja claro.

### Referencias

```yaml
uses: ./.github/workflows/ci-reutilizable.yml          # mismo repo, misma ref
uses: otro-owner/repo/.github/workflows/ci.yml@v1      # otro repo, por tag
uses: otro-owner/repo/.github/workflows/ci.yml@<SHA>   # otro repo, por SHA
```

Con `./` se usa **siempre la versión del propio commit** del workflow llamador:
no se puede pedir otra ref. Es cómodo dentro de un repositorio y es justo lo que
no quieres al compartir entre repositorios, donde el pin por SHA es la práctica
correcta (Semana 11).

## 4. Secretos: `inherit` y el caso de los environments

```yaml
    secrets: inherit          # pasa todos los secretos del llamador
```

`inherit` es cómodo y es exactamente lo que **no** conviene si el workflow
llamado es de otro repositorio: le estás entregando todos tus secretos a código
que no controlas. Para lo propio, pasa; para lo ajeno, declara uno a uno.

Y el detalle documentado que sorprende: **los secretos de environment no se
pasan** con `inherit`. Si el job llamado necesita el secreto de `production`,
ese job tiene que declarar el `environment`
([Semana 08](../../week-08-gobernanza_rulesets_y_merge_queue/1-teoria/07-environments-y-despliegue.md)).

## 5. Permisos: solo se pueden reducir

El `GITHUB_TOKEN` del workflow llamado hereda los permisos del llamador, y a lo
largo de una cadena de llamadas **solo se pueden mantener o recortar, nunca
ampliar**.

Consecuencia práctica: si tu reusable workflow necesita `pull-requests: write`,
no basta con declararlo dentro — el llamador tiene que concederlo:

```yaml
jobs:
  ci:
    permissions:
      contents: read
      pull-requests: write
    uses: ./.github/workflows/ci-reutilizable.yml
```

Es una protección deliberada: nadie puede subirse los permisos escondiéndose
detrás de una llamada.

## 6. Matrices y varias llamadas

```yaml
jobs:
  ci:
    strategy:
      fail-fast: false
      matrix:
        node: ["22", "24"]
    uses: ./.github/workflows/ci-reutilizable.yml
    with:
      node-version: ${{ matrix.node }}
```

Cada combinación es una invocación completa del workflow, con todos sus jobs. En
la interfaz aparecen anidados bajo el job llamador, y en `gh run view` se ven
como jobs con el nombre compuesto.

Ojo con el efecto sobre los checks requeridos: los nombres pasan a ser
`ci / test (22)`. Si tu ruleset exige un context concreto, se rompe — por eso el
job agregador con nombre fijo de la Semana 09 sigue siendo necesario.

## 7. Los límites

| Límite | Valor |
|--------|-------|
| Profundidad de anidamiento | Hasta **diez niveles**: el llamador y nueve reusables |
| Bucles | Prohibidos: un workflow no puede acabar llamándose a sí mismo |
| Permisos | Se mantienen o se reducen; nunca se amplían |
| Secretos de environment | No se pasan con `inherit` |
| Ubicación | Solo `.github/workflows/`, sin subcarpetas |
| `env` del llamador | **No** llega al workflow llamado: pásalo como `input` |

Ese último es el que más tiempo cuesta: un `env:` global en el llamador
simplemente no existe dentro del reusable.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `steps:` dentro del job que llama | Error de sintaxis poco claro | El job solo lleva `uses`, `with`, `secrets` |
| `secrets: inherit` hacia un repositorio ajeno | Le das todos tus secretos | Declara uno a uno |
| Esperar que `env:` se herede | Llega vacío y el fallo es raro | `inputs` |
| Diez inputs booleanos | Es un workflow que hace diez cosas | Divídelo |
| Referenciar por `@main` | Un cambio ajeno te rompe el CI sin avisar | Tag o SHA |
| Reusable workflow para un solo step | Traes un job entero para nada | Composite action |
| Exigir en el ruleset el nombre de un job anidado | Cambia al cambiar la matriz | Job agregador con nombre estable |
| Declarar `pull-requests: write` solo dentro del reusable | No se puede ampliar: sigue sin permiso | Concédelo en el llamador |

## 9. Trucos

- **Los inputs con `default` son la clave de la adopción**: si llamarlo sin
  `with:` ya funciona, la gente lo usa
- **`inputs` booleanos se comparan como booleanos**: `if: ${{ inputs.publicar }}`,
  sin comillas
- **Ver la cadena de llamadas de un run**: `gh run view <id>` muestra los jobs
  anidados con su origen
- **Empieza extrayendo el job entero y sin parámetros**; añade `inputs` solo
  cuando el segundo consumidor necesite algo distinto
- **Documenta el contrato en el propio archivo**: cada `input` con su
  `description`, que es lo que se ve en el error cuando falta
- **Un reusable puede llamar a otro**: útil para tener un `ci-base` y variantes,
  pero recuerda el techo de diez niveles

## 📚 Recursos Adicionales

- [GitHub Docs — Reuse workflows](https://docs.github.com/actions/how-tos/reuse-automations/reuse-workflows)
- [GitHub Docs — `on.workflow_call`](https://docs.github.com/actions/reference/workflows-and-actions/workflow-syntax#onworkflow_call)
- [GitHub Docs — `jobs.<job_id>.uses`](https://docs.github.com/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_iduses)

## ✅ Checklist de Verificación

- [ ] Tu `ci.yml` llama a un workflow con `workflow_call`
- [ ] Sabes qué claves admite el job que llama y cuáles no
- [ ] Sabes por qué `env:` del llamador no llega al reusable
- [ ] Sabes qué pasa con los permisos a lo largo de la cadena
- [ ] Has leído un output del workflow llamado desde el llamador
