# Merge queue: el problema que casi nadie tiene

> Esta teoría acaba con una recomendación incómoda: **probablemente no lo
> necesitas**. Saber por qué es más valioso que saber activarlo.

## 🎯 Objetivos

- Explicar el *semantic conflict* y por qué CI en verde no lo detecta
- Entender cómo lo resuelve una cola de merge
- Reconocer cuándo merge queue es sobreingeniería
- Saber qué exige un repositorio para poder usarlo

## 1. El problema: dos PRs verdes que juntos rompen

No hablamos de conflictos de texto — esos Git los detecta. Hablamos de un
conflicto **semántico**:

```
main:  function calcularMulta(dias)

PR #1: renombra calcularMulta → calcularRecargo          ✅ CI en verde
PR #2: añade una llamada nueva a calcularMulta(dias)     ✅ CI en verde
```

Los dos pasan CI, porque cada uno se probó contra `main` **antes** del otro. Se
mergean. `main` queda rota: el PR #2 llama a una función que ya no existe. Y
nadie lo ve hasta el siguiente push.

## 2. Por qué "rama al día" no basta

`strict_required_status_checks_policy: true` exige que la rama esté actualizada
con la base antes de mergear. Suena a solución, y crea otro problema:

```
09:00  PR #1, #2 y #3 al día con main, todos en verde
09:05  se mergea #1
09:05  #2 y #3 quedan desactualizados → CI otra vez → 12 min
09:17  se mergea #2
09:17  #3 queda desactualizado otra vez → CI otra vez → 12 min
```

Con N PRs listos, hacen falta N pasadas secuenciales de CI. El equipo pasa el día
pulsando *Update branch*. A esto se le llama, con cariño, *merge starvation*.

## 3. Qué hace la cola

Merge queue toma los PRs aprobados y construye **candidatos**: ramas temporales
`gh-readonly-queue/<base>/pr-<n>-<sha>` que contienen `main` + los PRs anteriores
de la cola + este PR. CI corre sobre el candidato, no sobre el PR.

```
main ──┬── candidato A = main + #1
       ├── candidato B = main + #1 + #2
       └── candidato C = main + #1 + #2 + #3
```

Los tres candidatos se construyen **en paralelo**. Si el C está en verde, los
tres PRs entran de una vez. Si el B falla, se expulsa el #2 de la cola y se
reconstruye lo que quedaba. Nadie pulsa *Update branch*.

El coste es visible: cada candidato es una ejecución de CI. Merge queue cambia
tiempo de personas por minutos de runner.

### Lo que hay que tocar en tus workflows

El evento es distinto. Un workflow que solo escucha `pull_request` **no corre
sobre el candidato**, y la cola se queda esperando un check que nunca llega:

```yaml
on:
  pull_request:
  merge_group:        # ← sin esto, la cola se cuelga
```

## 4. Los parámetros que importan

```json
{
  "type": "merge_queue",
  "parameters": {
    "merge_method": "SQUASH",
    "grouping_strategy": "ALLGREEN",
    "max_entries_to_build": 5,
    "min_entries_to_merge": 1,
    "max_entries_to_merge": 5,
    "min_entries_to_merge_wait_minutes": 5,
    "check_response_timeout_minutes": 60
  }
}
```

| Parámetro | Qué controla |
|-----------|--------------|
| `merge_method` | `MERGE`, `SQUASH` o `REBASE` |
| `grouping_strategy` | `ALLGREEN`: todo el grupo verde. `HEADGREEN`: basta el candidato de cabeza |
| `max_entries_to_build` | Cuántos candidatos en paralelo — es tu factura de CI |
| `min_entries_to_merge` | Espera a tener N antes de mergear el lote |
| `min_entries_to_merge_wait_minutes` | Cuánto espera como mucho a completar el lote |
| `check_response_timeout_minutes` | Cuánto espera un check antes de darlo por perdido |

## 5. Cuándo sí y cuándo no

| Señal | Merge queue |
|-------|:-----------:|
| Menos de 10 PRs mergeados al día | ❌ Sobreingeniería |
| CI de menos de 5 minutos | ❌ *Update branch* es más barato |
| Trabajas solo o en pareja | ❌ No hay cola que ordenar |
| 20+ PRs al día y CI de 20 minutos | ✅ Es exactamente el caso |
| `main` se rompe por conflictos semánticos | ✅ La razón de existir |
| Presupuesto de runners ajustado | ⚠️ Cada candidato cuesta |

Regla corta: **si nadie ha pulsado *Update branch* dos veces seguidas esta
semana, no lo necesitas.**

Antes de llegar a la cola, las alternativas baratas casi siempre bastan: PRs más
pequeños (Semana 06), CI más rápido con caché (Semana 09) y mergear varias veces
al día en vez de acumular.

## 6. Disponibilidad

> [!IMPORTANT]
> Merge queue está disponible en **repositorios públicos de una organización**;
> en privados requiere GitHub Enterprise Cloud. **No** está disponible en un
> repositorio de cuenta personal, que es el caso de este bootcamp.
>
> Por eso esta semana merge queue es teoría y decisión, no práctica. Verificado
> en agosto de 2026:
> [Managing a merge queue](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue).

Requisitos, cuando llegue el día: un ruleset de rama con `pull_request` y
`required_status_checks`, y los workflows escuchando `merge_group`.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Activarlo con 3 PRs a la semana | Complejidad sin retorno y CI x3 | Espera a tener el problema |
| Olvidar `merge_group` en los workflows | La cola se cuelga esperando un check | Añade el evento |
| `max_entries_to_build` alto "por si acaso" | Factura de runners | Empieza en 5 |
| Usarlo para tapar un CI lento | El problema es el CI | Caché y paralelismo primero |
| Usarlo para tapar PRs enormes | El problema es el tamaño | PRs pequeños |

## 8. Trucos

- **Las ramas `gh-readonly-queue/*` son de la cola**: no las toques ni las
  protejas; se crean y se borran solas
- **`gh pr merge --auto`** mergea en cuanto se cumplen los requisitos; en un repo
  con cola, mete el PR en ella
- **`HEADGREEN` es más rápido y más arriesgado** que `ALLGREEN`: mergea lotes con
  el grupo entero no verificado
- **El primer síntoma de que te hace falta** es alguien pidiendo por chat "no
  mergeéis nada, que estoy actualizando la rama"

## 📚 Recursos Adicionales

- [GitHub Docs — Managing a merge queue](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)
- [GitHub Docs — Merging a pull request with a merge queue](https://docs.github.com/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request-with-a-merge-queue)
- [GitHub Docs — Configuring pull request merges](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges)

## ✅ Checklist de Verificación

- [ ] Puedes explicar un conflicto semántico con un ejemplo propio
- [ ] Sabes por qué "rama al día" produce *merge starvation*
- [ ] Sabes qué evento hay que añadir a los workflows
- [ ] Has decidido, con datos de tu repo, que **no** lo necesitas todavía
