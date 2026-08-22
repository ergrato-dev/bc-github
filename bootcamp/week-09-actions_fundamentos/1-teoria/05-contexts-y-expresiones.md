# Contexts y expresiones

> `${{ }}` no es interpolación de shell. Se evalúa **antes** de que el runner
> exista, y eso explica todas sus rarezas.

## 🎯 Objetivos

- Saber qué context contiene qué y dónde está disponible cada uno
- Escribir condiciones `if:` que hagan lo que crees que hacen
- Usar las funciones de estado sin bloquear las cancelaciones
- Distinguir un secreto de una variable, y saber cuándo el enmascarado falla

## 1. Qué problema resuelve

Un workflow necesita datos: quién disparó esto, en qué rama, con qué versión de
la matriz, qué devolvió el step anterior. Los **contexts** son esos datos y las
**expresiones** la forma de leerlos.

Lo importante: `${{ }}` lo resuelve GitHub al **preparar** el workflow, no el
shell al ejecutarlo. Para cuando tu `run:` arranca, esa expresión ya es texto
plano dentro del script. De ahí sale la inyección de comandos de la
[Teoría 04](04-seguridad-de-los-eventos.md), y también la razón de que ciertos
contexts no existan en ciertos sitios.

## 2. Los contexts

| Context | Contiene | Ejemplo |
|---------|----------|---------|
| `github` | Evento, repo, ref, actor, SHA | `github.event_name`, `github.ref_name` |
| `env` | Variables `env:` de cualquier nivel | `env.NODE_ENV` |
| `vars` | Variables de configuración del repo, entorno u organización | `vars.REGION` |
| `secrets` | Secretos | `secrets.GITHUB_TOKEN` |
| `job` | El job actual | `job.status` |
| `jobs` | Outputs de jobs, en reusable workflows | Semana 10 |
| `steps` | Outputs de steps con `id:` | `steps.build.outputs.ruta` |
| `runner` | La máquina | `runner.os`, `runner.temp`, `runner.arch` |
| `strategy` / `matrix` | La matriz | `matrix.node`, `strategy.job-index` |
| `needs` | Resultado y outputs de las dependencias | `needs.build.result` |
| `inputs` | Entradas de `workflow_dispatch` o de un reusable | `inputs.entorno` |

Los campos de `github` que se usan a diario:

```yaml
github.event_name       # push, pull_request, workflow_dispatch...
github.repository       # owner/repo
github.repository_owner # owner
github.ref              # refs/heads/main, refs/pull/42/merge
github.ref_name         # main
github.sha              # el commit
github.actor            # quién lo disparó
github.triggering_actor # quién relanzó el run, si se relanzó
github.run_id           # ID del run: nombres únicos de artifact
github.run_attempt      # 1, 2, 3… cuántas veces se ha relanzado
github.workspace        # la raíz del checkout
```

> [!NOTE]
> `github.ref` y `github.ref_name` valen cosas distintas según el evento. En un
> `pull_request`, `github.ref` es `refs/pull/<n>/merge` y `github.ref_name` es
> `<n>/merge`, **no** el nombre de la rama. La rama del PR es
> `github.head_ref`, y la de destino `github.base_ref`.

## 3. Disponibilidad: la tabla que evita una hora perdida

No todos los contexts están disponibles en todas partes, porque algunos no
existen todavía cuando se evalúa la expresión.

| Dónde | Contexts **no** disponibles |
|-------|-----------------------------|
| `if:` de un job | `job`, `runner`, `env`, `steps`, `secrets` |
| `runs-on:` | `job`, `runner`, `env`, `secrets`, `steps` |
| `env:` de workflow | `job`, `runner`, `steps`, `needs`, `strategy`, `matrix` |

La consecuencia que más sorprende: **no puedes usar `secrets` en el `if:` de un
job**. El patrón para condicionar por un secreto es comprobarlo dentro de un
step y exponerlo como output:

```yaml
jobs:
  comprobar:
    runs-on: ubuntu-latest
    outputs:
      hay_token: ${{ steps.c.outputs.hay_token }}
    steps:
      - id: c
        env:
          TOKEN: ${{ secrets.TOKEN_DESPLIEGUE }}
        run: echo "hay_token=${TOKEN:+true}" >> "$GITHUB_OUTPUT"

  desplegar:
    needs: comprobar
    if: needs.comprobar.outputs.hay_token == 'true'
    runs-on: ubuntu-latest
    steps: [...]
```

Ese `${TOKEN:+true}` imprime `true` solo si la variable no está vacía, sin
revelar nada del valor.

## 4. Operadores y funciones

Operadores: `==`, `!=`, `<`, `<=`, `>`, `>=`, `&&`, `||`, `!`. Las comparaciones
de cadenas **no distinguen mayúsculas**.

| Función | Qué hace |
|---------|----------|
| `contains(busca_en, valor)` | Subcadena, o pertenencia si el primero es un array |
| `startsWith` / `endsWith` | Prefijo y sufijo |
| `format('{0} de {1}', a, b)` | Plantilla |
| `join(array, ', ')` | Une un array en una cadena |
| `toJSON(x)` / `fromJSON(x)` | Serializa y deserializa |
| `hashFiles('**/pnpm-lock.yaml')` | Hash de archivos — la base de la clave de caché |

`toJSON` es la forma más rápida de depurar un context entero:

```yaml
- name: Ver el context github
  env:
    CTX: ${{ toJSON(github) }}
  run: echo "$CTX"
```

`fromJSON` sirve para dos cosas muy distintas: convertir texto a número
(`fromJSON('10') > 5`) y construir **matrices dinámicas** a partir de un job
anterior, que se ve en la [Teoría 06](06-matrices.md).

## 5. Funciones de estado

Solo cuatro, y son las que gobiernan `if:`.

| Función | Cuándo devuelve `true` |
|---------|------------------------|
| `success()` | Todo lo anterior fue bien — **es el `if:` implícito** |
| `failure()` | Algo anterior falló |
| `cancelled()` | Se canceló el run |
| `always()` | Siempre, pase lo que pase |

Todo step y todo job llevan un `if: success()` invisible. Por eso un step que va
después de un fallo no se ejecuta salvo que digas otra cosa.

```yaml
- name: Publicar el informe de tests
  if: ${{ !cancelled() }}
  uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7.0.1
  with:
    name: informe
    path: informe/
```

> [!WARNING]
> `always()` también se ejecuta cuando **cancelas** el run a mano, así que un
> step con `always()` puede impedir que un run se detenga cuando se lo pides.
> Cuando lo que quieres es "aunque haya fallado, pero no si lo cancelo", lo
> correcto es `if: ${{ !cancelled() }}`. Es casi siempre lo que quieres.

### El `if:` de un job con `needs`

Cuidado con esta interacción, que es la fuente del job agregador que sale verde
con la matriz roja:

```yaml
resumen:
  needs: test
  if: ${{ !cancelled() }}    # ← anula el success() implícito
```

Al poner un `if:` explícito, el job **deja de heredar el fallo de sus `needs`**.
Se ejecuta igual, y sale verde salvo que compruebe `needs.test.result` a mano.

## 6. `if:` sin llaves, y la trampa del `!`

En `if:` las llaves son opcionales, porque el valor ya se evalúa como expresión:

```yaml
if: github.event_name == 'push'                      # ✅
if: ${{ github.event_name == 'push' }}               # ✅ equivalente
```

Pero en YAML, un escalar que empieza por `!` es una etiqueta de tipo, no texto:

```yaml
if: ${{ !cancelled() }}     # ✅
if: !cancelled()            # ❌ error de parseo de YAML
```

La regla práctica: si la expresión empieza por `!`, va con llaves.

## 7. Secretos y variables

| | `secrets` | `vars` |
|---|---|---|
| Se ve el valor una vez guardado | ❌ Nunca | ✅ Sí |
| Aparece enmascarado en los logs | ✅ Sí | ❌ No |
| Disponible en `if:` de job | ❌ No | ✅ Sí |
| Para qué | Tokens, claves, credenciales | Regiones, nombres, flags |

```bash
gh secret set TOKEN_NPM                      # lee de la entrada estándar
gh variable set REGION --body "eu-west-1"
gh secret list --env production              # los de un environment (Semana 08)
```

### El enmascarado es literal

GitHub sustituye por `***` las cadenas que coinciden **exactamente** con un
secreto. Si imprimes el secreto transformado, ya no lo reconoce:

```yaml
# ❌ Todas estas formas imprimen el secreto en claro en el log
- run: echo "$TOKEN" | base64
- run: echo "${TOKEN:0:10}"
- run: echo "$TOKEN" | rev
```

Para depurar sin filtrar, comprueba propiedades, no contenido:

```yaml
- env:
    TOKEN: ${{ secrets.TOKEN_DESPLIEGUE }}
  run: echo "longitud del token: ${#TOKEN}"
```

Un secreto multilínea (una clave privada) se enmascara línea a línea, y las
líneas vacías o muy cortas pueden no enmascararse. Otra razón para no imprimirlo.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| `${{ github.event.* }}` dentro de un `run:` | Inyección de comandos | `env:` |
| `secrets` en el `if:` de un job | No está disponible ahí | Output de un job previo |
| `if: always()` por costumbre | Impide cancelar el run | `if: ${{ !cancelled() }}` |
| `echo "${{ secrets.X }}"` para depurar | Un `base64` y ya está en claro | `${#TOKEN}` |
| Job con `if:` que no comprueba `needs.*.result` | Verde con la dependencia roja | Compruébalo |
| Usar `github.ref_name` en un PR esperando la rama | Ahí vale `<n>/merge` | `github.head_ref` |
| Un secreto donde bastaba una variable | No lo puedes ni leer para depurar | `vars` |

## 9. Trucos

- **Depurar un context entero**: `${{ toJSON(needs) }}` pasado por `env:`
- **`github.run_attempt`** distingue el primer intento de un *re-run*
- **`github.triggering_actor`** dice quién relanzó, no quién empujó
- **`fromJSON` para números**: `if: fromJSON(inputs.reintentos) > 3`
- **`runner.os`** condiciona por sistema operativo sin duplicar jobs
- **`vars` por environment**: igual que los secretos, se pueden definir por
  entorno (Semana 08)
- **`contains(github.event.pull_request.labels.*.name, 'urgente')`** — la
  sintaxis `*` recorre un array de objetos

## 📚 Recursos Adicionales

- [GitHub Docs — Contexts](https://docs.github.com/actions/reference/workflows-and-actions/contexts)
- [GitHub Docs — Expressions](https://docs.github.com/actions/reference/workflows-and-actions/expressions)
- [GitHub Docs — Variables reference](https://docs.github.com/actions/reference/workflows-and-actions/variables)

## ✅ Checklist de Verificación

- [ ] Sabes por qué `secrets` no funciona en el `if:` de un job
- [ ] Distingues `always()` de `!cancelled()`
- [ ] Sabes cuál es el `if:` implícito de todo step y qué lo anula
- [ ] Sabes por qué un secreto transformado deja de estar enmascarado
