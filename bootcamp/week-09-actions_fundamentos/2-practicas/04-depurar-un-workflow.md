# Práctica 04 — Depurar un workflow

> Cuatro fallos deliberados, dos en rojo y dos en verde. Los dos que salen en
> verde son los que de verdad importan.

**Duración estimada**: 40 min
**Prerrequisitos**: Prácticas 01-03; teorías
[01](../1-teoria/01-modelo-de-ejecucion.md),
[02](../1-teoria/02-datos-entre-steps-y-jobs.md) y
[05](../1-teoria/05-contexts-y-expresiones.md)

## Contexto

Hasta ahora los workflows los has escrito bien a la primera porque venían
escritos. En la vida real llegas a un YAML ajeno que hace algo raro. Esta
práctica es eso: un workflow roto y las herramientas para desmontarlo.

> [!IMPORTANT]
> No mires la lista de fallos del final hasta haber encontrado al menos tres.
> El objetivo no es arreglar `roto.yml`, es adquirir el reflejo de mirar en el
> orden correcto.

## Paso 1: Instalar el workflow roto

```bash
cd <tu-repo>
git switch -qc ci/depuracion
cp <ruta-al-bootcamp>/bootcamp/week-09-actions_fundamentos/starter/roto.yml \
   .github/workflows/roto.yml
git add .github/workflows/roto.yml
git commit -qm "ci: añade un workflow de prácticas de depuración"
git push -qu origin HEAD
gh pr create --fill && gh pr merge --squash --delete-branch
git switch -q main && git pull -q
```

**Verifica**: `workflow_dispatch` **solo funciona desde la rama por defecto**,
por eso hay que mergearlo antes de poder lanzarlo.

```bash
gh workflow list | grep -i roto
```

## Paso 2: Lanzarlo y leer solo lo que falló

```bash
gh workflow run roto.yml
gh run list --workflow=roto.yml --limit 1
RUN_ID=$(gh run list --workflow=roto.yml --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$RUN_ID"
```

Cuando termine:

```bash
gh run view "$RUN_ID" --log-failed
```

**Verifica**: la salida trae **solo** los steps fallidos. Compárala con el log
entero para ver la diferencia:

```bash
gh run view "$RUN_ID" --log | wc -l
gh run view "$RUN_ID" --log-failed | wc -l
```

Ese es el primer reflejo: `--log-failed` antes que `--log`.

## Paso 3: El primer fallo — leer el mensaje, no adivinarlo

El step *Ejecutar los tests del repositorio* falla. Léelo entero antes de tocar
nada.

**Verifica**: el error habla de archivos que no encuentra. Contrasta con lo que
sabes del [modelo de ejecución](../1-teoria/01-modelo-de-ejecucion.md): ¿qué hay
en `GITHUB_WORKSPACE` al empezar un job?

Confírmalo tú, en vez de suponerlo. Añade al principio del job:

```yaml
      - name: Qué hay en el workspace
        run: |
          pwd
          ls -la
          echo "GITHUB_WORKSPACE=$GITHUB_WORKSPACE"
```

Arregla el fallo, empuja y vuelve a lanzarlo:

```bash
gh run rerun "$RUN_ID" --failed
```

> [!NOTE]
> `--failed` relanza **solo los jobs fallidos y sus dependencias**, no el run
> entero. Con una matriz de doce jobs y uno roto, la diferencia es de minutos.

## Paso 4: El segundo fallo — activar los logs de depuración

El step *Usar la versión calculada* falla porque una variable llega vacía. El log
normal no dice por qué.

```bash
gh variable set ACTIONS_STEP_DEBUG --body "true"
gh workflow run roto.yml
```

> [!NOTE]
> `ACTIONS_STEP_DEBUG` se puede poner como **variable o como secreto**; si están
> los dos, gana el secreto. Como variable es más cómodo: se puede leer y borrar
> sin dudas.
>
> Existe además `ACTIONS_RUNNER_DEBUG`, que activa los logs del propio runner.
> Esos no salen en la web: hay que descargar el archivo de logs del run y mirar
> en la carpeta `runner-diagnostic-logs`.

**Verifica**: el log trae ahora líneas `::debug::` con la evaluación de las
expresiones y el entorno de cada step.

La causa está en la [Teoría 02](../1-teoria/02-datos-entre-steps-y-jobs.md): un
`export` en un `run:` no sobrevive al step siguiente. Arréglalo con el mecanismo
correcto y comprueba que la variable llega.

**Acuérdate de apagarlo al terminar la práctica**, o cada run futuro será
ilegible:

```bash
gh variable delete ACTIONS_STEP_DEBUG
```

## Paso 5: El tercer fallo — el que sale en VERDE

Este es el importante. El step *Comprobar el linter y guardar la salida* ejecuta
un comando que devuelve código de salida 1, y aun así el step sale en verde.

**Verifica** que es cierto antes de creerlo:

```bash
gh run view "$RUN_ID" --log | grep -A5 "Comprobar el linter"
```

El comando imprime el error, y el step pasa. Piensa en qué código de salida
recibe realmente el shell cuando hay una tubería.

Reprodúcelo en local, que es la forma más rápida de convencerse:

```bash
node -e "process.exit(1)" | tee /dev/null ; echo "sin pipefail: $?"
set -o pipefail
node -e "process.exit(1)" | tee /dev/null ; echo "con pipefail: $?"
set +o pipefail
```

Arréglalo con `shell: bash`, y comprueba que ahora el step se pone rojo. Un CI
en verde que no comprueba nada es peor que no tener CI: da confianza falsa.

## Paso 6: El cuarto fallo — la expresión que no existe

El step *Resumen* imprime `Total de comprobaciones:` seguido de nada. No hay
error, no hay aviso.

**Verifica**:

```bash
gh run view "$RUN_ID" --log | grep "Total de comprobaciones"
```

Las expresiones `${{ }}` que no resuelven **no dan error: dan cadena vacía**.
Mira a qué `id` apunta esa expresión y busca si algún step lo declara.

La lección que hay que llevarse: comprobar siempre lo que se recibe.

```yaml
      - name: Resumen
        env:
          TOTAL: ${{ steps.calcular.outputs.total }}
        run: |
          : "${TOTAL:?el output llegó vacío: revisa el id: del step que lo emite}"
          echo "Total de comprobaciones: $TOTAL"
```

## Paso 7: `act` — acortar el ciclo en local

**Por qué**: cada iteración contra GitHub son commit, push y espera. `act`
ejecuta workflows en contenedores locales.

```bash
# Instalación: https://github.com/nektos/act#installation
act --version
act -l                                   # lista los jobs sin ejecutarlos
act workflow_dispatch -j investigar      # ejecuta ese job
```

> [!WARNING]
> `act` es un proyecto de terceros y **no es GitHub**: usa imágenes de contenedor
> distintas a los runners, no tiene los mismos secretos ni el mismo
> `GITHUB_TOKEN`, y algunas actions no funcionan. Sirve para iterar sobre la
> lógica de tu YAML, no para dar por bueno un workflow. La comprobación final
> siempre es en GitHub.

**Verifica**: `act -l` lista los jobs de tus workflows. Si `act` no está
instalado, sáltate el paso — no es un entregable.

## Paso 8: `tmate` — la última bala

Cuando un fallo solo ocurre en el runner y ningún log lo explica, se puede abrir
una sesión SSH interactiva **dentro** del job:

```yaml
      - name: Sesión de depuración
        if: failure()
        uses: mxschmitt/action-tmate@35b54afac29c97fb54faba5b513f8fbd1882f113 # v3.24
        with:
          limit-access-to-actor: true
```

> [!CAUTION]
> Esto abre acceso remoto a una máquina que tiene tu `GITHUB_TOKEN` y tus
> secretos en el entorno.
>
> - `limit-access-to-actor: true` restringe la conexión a tus claves SSH de
>   GitHub. El valor por defecto es `auto`, que **solo** restringe si tu perfil
>   de GitHub tiene una clave SSH pública; si no la tiene, el acceso queda
>   abierto y la dirección de conexión está en el log del run, que en un
>   repositorio público lee cualquiera. Ponlo a `true` explícitamente
> - `if: failure()` para que no se abra en runs correctos
> - El job se queda esperando y consume runner hasta que cierras la sesión o
>   salta el `timeout-minutes`
> - **Quítalo del workflow en cuanto termines.** No es un step que se deje puesto

Es la última herramienta, no la primera. Si llegas aquí antes de haber mirado
`--log-failed` y los logs de debug, has ido demasiado rápido.

## Paso 9: Documentar lo aprendido y limpiar

```bash
git switch -qc docs/depuracion
cat >> CONTRIBUTING.md <<'EOF'

## Depurar un workflow

En este orden, que es de menos a más coste:

1. `gh run view <id> --log-failed` — solo lo que falló
2. `gh run rerun <id> --failed` — relanza solo los jobs rotos
3. Variable `ACTIONS_STEP_DEBUG=true` — evaluación de expresiones paso a paso
4. `act -j <job>` — iterar en local (aproximado, no idéntico)
5. `action-tmate` con `limit-access-to-actor: true` — SSH al runner, y se retira
   del workflow al terminar

Dos fallos que salen en VERDE y hay que buscar a mano:

- Tuberías sin `pipefail`: usa `shell: bash` en todo `run:` con un `|`
- Expresiones que no resuelven: dan cadena vacía, no error. Comprueba con
  `: "${VAR:?mensaje}"`
EOF

git rm -q .github/workflows/roto.yml
git add CONTRIBUTING.md
git commit -qm "docs: documenta el procedimiento de depuración de workflows"
git push -qu origin HEAD
gh pr create --fill && gh pr merge --squash --delete-branch
git switch -q main && git pull -q

gh variable delete ACTIONS_STEP_DEBUG 2>/dev/null || true
```

**Verifica**:

```bash
gh variable list                       # ACTIONS_STEP_DEBUG ya no está
gh workflow list | grep -i roto || echo "workflow de prácticas retirado"
```

## 🔍 Los cuatro fallos

<details>
<summary>Ábrelo solo cuando hayas encontrado al menos tres</summary>

| # | Step | Fallo | Por qué |
|---|------|-------|---------|
| 1 | *Ejecutar los tests* | Falta `actions/checkout` | El workspace está vacío hasta que clonas. Sale en **rojo** |
| 2 | *Usar la versión calculada* | `export VERSION=` en el step anterior | Cada `run:` es un shell nuevo. Va a `$GITHUB_ENV`. Sale en **rojo** |
| 3 | *Comprobar el linter* | Tubería sin `pipefail` | El código de salida es el de `tee`. Sale en **verde** |
| 4 | *Resumen* | `steps.calcular.outputs.total` no existe | Ningún step declara `id: calcular`. Una expresión sin resolver da cadena vacía. Sale en **verde** |

Los dos primeros los encuentra el log. Los dos últimos solo los encuentra quien
sabe que existen — por eso son los que importan.

</details>

## ✅ Resultado

- [ ] Has usado `--log-failed` y sabes cuánto ruido te ahorra
- [ ] Has relanzado solo los jobs fallidos con `--failed`
- [ ] Has activado y **desactivado** `ACTIONS_STEP_DEBUG`
- [ ] Has encontrado los dos fallos que salen en verde
- [ ] Sabes qué es `act` y en qué no puedes confiar
- [ ] Sabes por qué `tmate` sin `limit-access-to-actor` es peligroso
- [ ] `CONTRIBUTING.md` documenta el procedimiento
- [ ] `roto.yml` retirado del repositorio

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `gh workflow run` no encuentra el workflow | No está en la rama por defecto | Mergéalo primero |
| No aparecen líneas `::debug::` | La variable no está, o se llama mal | `gh variable list` |
| `--log-failed` sale vacío | El run terminó en verde | Es la pista: mira los fallos silenciosos |
| Los logs siguen siendo ilegibles | `ACTIONS_STEP_DEBUG` sigue activo | `gh variable delete ACTIONS_STEP_DEBUG` |
| `act` falla con actions que en GitHub funcionan | Imagen distinta a la del runner | Es esperable; comprueba en GitHub |
| El job con `tmate` no termina | Espera a que te conectes | Cancela el run, o `timeout-minutes` |
