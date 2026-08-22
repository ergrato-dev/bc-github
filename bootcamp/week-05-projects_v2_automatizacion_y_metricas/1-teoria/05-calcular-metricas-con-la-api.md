# Calcular las métricas con la API

> Las definiciones son la mitad. La otra mitad es sacar los números sin abrir el
> navegador, de forma que el cálculo del mes que viene sea el mismo que el de
> hoy.

## 🎯 Objetivos

- Calcular lead time, cycle time, throughput y WIP con `gh` y `jq`
- Sacar el momento en que un item **empezó**, que no está en ningún campo obvio
- Usar mediana y percentiles en vez de medias
- Reutilizar `github/issue-metrics` cuando no merezca la pena escribirlo
- Dejar el cálculo en un script que cualquiera pueda repetir

## 1. Qué problema resuelve

Un número calculado a mano no se puede comparar con el del mes pasado, porque
nadie recuerda exactamente cómo se contó. Un script sí: es la definición de la
métrica, escrita de forma ejecutable.

La pieza que hace posible todo lo que sigue es `fromdate` de `jq`, que convierte
una fecha ISO 8601 en segundos desde epoch y permite restar.

## 2. Lead time

```bash
gh issue list --state closed --limit 100 --json number,createdAt,closedAt,stateReason \
  --jq '[.[] | select(.closedAt != null and .stateReason != "not_planned")
        | {n: .number,
           dias: (((.closedAt | fromdate) - (.createdAt | fromdate)) / 86400 | floor)}]'
```

Media, mediana y percentil 85 en una sola pasada:

```bash
gh issue list --state closed --limit 100 --json createdAt,closedAt,stateReason \
  --jq '[.[] | select(.stateReason != "not_planned")
        | ((.closedAt | fromdate) - (.createdAt | fromdate)) / 86400]
        | sort
        | {n: length,
           media:   (add / length | floor),
           mediana: (.[(length / 2)   | floor] | floor),
           p85:     (.[(length * 0.85)| floor] | floor)}'
```

La mediana informa mejor que la media: un issue olvidado durante un año destroza
la media y no cambia la mediana. El p85 es el que puedes prometer.

## 3. Cycle time: encontrar cuándo empezó

`createdAt` y `closedAt` los da la API; "cuándo se empezó" no existe como campo.
Hay tres formas de aproximarlo, de más fiel a más barata:

| Fuente | Precisión | Coste |
|--------|:---------:|-------|
| El evento de cambio de `Status` en el project | Alta | GraphQL sobre el project |
| El evento `assigned` del issue | Media | Una llamada REST |
| El primer commit de la rama vinculada | Alta para desarrollo | Requiere rama por issue |

La vía del **timeline** del issue, que es la que casi siempre basta:

```bash
gh api repos/{owner}/{repo}/issues/42/timeline \
  --jq '[.[] | select(.event == "assigned") | .created_at] | first'
```

Y con eso, el cycle time de un issue:

```bash
inicio=$(gh api repos/{owner}/{repo}/issues/42/timeline \
  --jq '[.[] | select(.event=="assigned") | .created_at] | first')
fin=$(gh issue view 42 --json closedAt --jq .closedAt)
python3 -c "
from datetime import datetime as d
i=d.fromisoformat('$inicio'.replace('Z','+00:00')); f=d.fromisoformat('$fin'.replace('Z','+00:00'))
print(round((f-i).total_seconds()/86400, 1), 'días')"
```

> [!NOTE]
> El endpoint de *timeline* devuelve muchos tipos de evento (`labeled`,
> `assigned`, `cross-referenced`, `moved_columns_in_project`…). Míralo entero una
> vez —`gh api .../timeline --jq '[.[].event] | unique'`— y elige el que
> represente "empezó" en **tu** proceso.

## 4. Throughput

```bash
# Cerrados en los últimos 7 días
gh issue list --state closed --limit 200 \
  --search "closed:>=$(date -d '7 days ago' +%Y-%m-%d)" \
  --json number --jq 'length'

# Serie por semana, de los últimos 100 cerrados
gh issue list --state closed --limit 100 --json closedAt \
  --jq 'group_by(.closedAt[0:7]) | map({mes: .[0].closedAt[0:7], n: length})'
```

Para el throughput de ingeniería, lo mismo con PRs:

```bash
gh pr list --state merged --limit 100 --json number,createdAt,mergedAt,additions,deletions \
  --jq '[.[] | {n: .number,
                horas: (((.mergedAt|fromdate) - (.createdAt|fromdate)) / 3600 | floor),
                tam: (.additions + .deletions)}]'
```

Esa última salida, ordenada por `tam`, es la prueba empírica de que los PRs
grandes tardan más en mergearse.

## 5. WIP y aging, desde el project

```bash
# WIP actual
gh project item-list <n> --owner @me --format json \
  --jq '[.items[] | select(.status == "En curso")] | length'

# Aging: qué lleva más tiempo abierto y en curso
gh issue list --state open --limit 100 --json number,title,createdAt,updatedAt \
  --jq '[.[] | {n: .number, titulo: .title,
                dias_sin_tocar: ((now - (.updatedAt | fromdate)) / 86400 | floor)}]
        | sort_by(-.dias_sin_tocar) | .[0:10]'
```

`now` en `jq` da el epoch actual, así que el aging se calcula sin pasar fechas
por parámetro.

## 6. Cuándo no escribirlo tú

[`github/issue-metrics`](https://github.com/github/issue-metrics) es una action
oficial que calcula tiempo hasta la primera respuesta, tiempo hasta el cierre y
sus medianas sobre una consulta de búsqueda, y publica el resultado como issue.

| Usa la action | Escribe tu script |
|---------------|-------------------|
| Métricas estándar de issues y PRs | Métricas que dependen de tus campos del project |
| Informe periódico ya formateado | Cálculo que alimenta otra cosa |
| No quieres mantener `jq` | Necesitas control exacto de las definiciones |

Empezar por la action y sustituirla cuando se quede corta es una decisión
perfectamente razonable.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Contar a mano en el tablero | Irrepetible y distinto cada vez | Script |
| `--limit` por defecto | La CLI devuelve 30 y crees que ese es tu total | Pon `--limit` explícito |
| Incluir los *not planned* | Parece que entregas más cuanto más descartas | `select(.stateReason != "not_planned")` |
| Media sin mirar la distribución | Un outlier la manda al garete | Mediana y p85 |
| Recalcular el histórico cada vez | La API solo te da el estado de hoy | Guarda la serie ([Teoría 07](07-informes-automaticos.md)) |
| Cambiar el criterio entre mediciones | Los números dejan de ser comparables | Fija las definiciones en el script |
| Bucle de una llamada por issue | Lento y te comes el rate limit | `--json` con muchos items y `jq` |

## 8. Trucos

- **`fromdate` es la clave**: `((.closedAt|fromdate) - (.createdAt|fromdate))/86400`
- **`now` para todo lo relativo**: evita pasar la fecha de hoy como argumento
- **Percentil sin dependencias**: `sort | .[(length * 0.85) | floor]`
- **Guarda el JSON crudo** antes de agregarlo: si mañana cambias la definición,
  no hace falta volver a llamar a la API
- **Empieza por `--json` a secas** para ver qué campos hay disponibles:
  `gh issue list --json` sin argumento los lista todos
- **Comprueba el tamaño de la muestra** en la misma salida (`n:`): un número sin
  su `n` no se puede interpretar
- **Un script por métrica**, en `scripts/`, con el criterio escrito en un
  comentario en la primera línea

## 📚 Recursos Adicionales

- [`jq` — manual](https://jqlang.github.io/jq/manual/)
- [REST API — Issue timeline events](https://docs.github.com/rest/issues/timeline)
- [`github/issue-metrics`](https://github.com/github/issue-metrics)
- [Manual de `gh issue list`](https://cli.github.com/manual/gh_issue_list)

## ✅ Checklist de Verificación

- [ ] Has calculado la mediana del lead time de tu repositorio
- [ ] Sabes de dónde sacar el momento en que un item empezó
- [ ] Tus cálculos excluyen los cerrados como *not planned*
- [ ] Cada número que publicas va acompañado del tamaño de la muestra
- [ ] El cálculo vive en un script, no en tu historial de shell
