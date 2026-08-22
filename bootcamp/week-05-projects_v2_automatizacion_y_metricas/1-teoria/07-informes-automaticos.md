# Informes automáticos

> Alguien pregunta "¿cómo va?" cada semana. Si la respuesta cuesta media hora,
> se deja de dar. Si llega sola cada lunes, se lee.

## 🎯 Objetivos

- Publicar un informe periódico como issue, con un workflow programado
- Elegir qué va dentro: cuatro números, los atascos y el estado del sprint
- Guardar la serie histórica para poder ver tendencias
- Reconocer por qué los informes automáticos dejan de llegar

## 1. Qué problema resuelve

Un informe manual es trabajo repetitivo, mecánico y perfectamente automatizable.
Y automatizado gana tres cosas que el manual no tiene: llega siempre, queda
**fechado** y se puede comparar con el anterior.

La forma correcta en GitHub es un **issue**: queda archivado, se comenta, se
busca y se enlaza. Un correo se pierde; un panel hay que ir a mirarlo.

## 2. El workflow

```yaml
name: Informe semanal

on:
  schedule:
    - cron: "0 8 * * 1"     # lunes 08:00 UTC
  workflow_dispatch:

permissions:
  contents: write           # para commitear el histórico
  issues: write             # para publicar el informe

jobs:
  informe:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - name: Calcular métricas y publicar
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: bash scripts/informe-semanal.sh
```

Aquí **sí** basta `GITHUB_TOKEN`: escribir un issue está dentro del alcance del
repositorio. Solo los datos del project quedan fuera, y para eso hace falta la
credencial de la [Teoría 02](02-credenciales-para-projects.md).

> [!NOTE]
> `cron` en Actions va en **UTC** y no es puntual: en horas de carga puede
> retrasarse bastante. Para un informe semanal da igual; para algo con hora
> exacta, no uses `schedule`.

## 3. Qué poner dentro

Corto y accionable:

```markdown
## Semana del 17 al 23 de agosto

| Métrica | Esta semana | Anterior |
|---------|------------:|---------:|
| Cerrados | 7 | 5 |
| Abiertos nuevos | 4 | 9 |
| Lead time (mediana) | 6 d | 8 d |
| WIP | 3 | 6 |

### Atascados (>14 días sin actividad)

- #42 Cálculo de multa — sin asignar

### Sprint actual

12 items · 5 hechos · 4 en curso · 3 sin empezar
```

Cuatro números, una lista de atascos y el estado del sprint. Las reglas que hacen
que se lea:

- **Toda métrica va comparada** con la semana anterior. Un número suelto no dice
  nada
- **Los atascos con enlace**: el informe debe permitir actuar sin buscar nada
- **Cabe en una pantalla.** Un informe de dos pantallas no lo lee nadie
- **Sin adjetivos.** "Bajó el lead time" lo interpreta quien lo lee

## 4. La serie histórica

La API te da el estado de **hoy**. La tendencia la construyes tú, y es lo único
que de verdad se interpreta:

```bash
echo "$(date +%Y-%m-%d),$LEAD_TIME,$THROUGHPUT,$WIP" >> metricas/historico.csv
```

Commitear ese CSV desde el mismo workflow:

```yaml
      - name: Guardar el histórico
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add metricas/historico.csv
          git diff --staged --quiet || git commit -m "chore(metricas): informe semanal"
          git push
```

Ese `git diff --staged --quiet ||` evita que el workflow falle las semanas en que
no cambia nada. En seis meses tienes veintiséis puntos y una tendencia legible —
y como está en el repositorio, se versiona y se puede graficar con cualquier cosa.

## 5. Por qué dejan de llegar

Es lo más común de todo esto: el informe funciona tres meses y un día deja de
aparecer, sin que nadie se entere.

| Causa | Síntoma | Prevención |
|-------|---------|------------|
| **`schedule` desactivado** tras 60 días sin actividad en el repositorio | Silencio total | Actividad periódica, o revisarlo |
| PAT caducado | Falla el paso del project | Caducidad apuntada |
| El script asume datos que ya no existen | Falla al calcular | `set -euo pipefail` y un mensaje claro |
| Nadie mira `gh run list` | Lleva semanas roto | Revisarlo al empezar la semana |

```bash
gh run list --workflow informe-semanal.yml --limit 5
gh workflow view informe-semanal.yml
```

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Informe de dos pantallas | Nadie lo lee | 4 métricas y los atascos |
| Métrica sin comparación | Un número suelto no dice nada | Contra la semana anterior |
| Informe por correo | Se pierde y no se busca | Issue: queda, se comenta, se busca |
| Sin `workflow_dispatch` | Para probarlo hay que esperar al lunes | Añádelo siempre |
| No guardar el histórico | Nunca podrás ver una tendencia | CSV commiteado |
| Informe que no dispara nada | Se convierte en ruido semanal | Umbrales y acciones ([Teoría 04](04-metricas-de-flujo.md)) |
| Dejar veinte informes abiertos | La lista de issues se vuelve inútil | Cierra el anterior al publicar |

## 7. Trucos

- **`workflow_dispatch` junto a `schedule`**: te deja lanzarlo a mano para
  probarlo sin esperar
- **Etiqueta los informes** (`type:informe`) y tendrás la serie navegable con un
  filtro
- **Cierra el informe anterior** al publicar el nuevo: la lista de abiertos se
  mantiene limpia
- **Enlaza el informe desde el README** con un enlace a la búsqueda:
  `../../issues?q=label%3A%22type%3Ainforme%22`
- **Publica desde la CLI**:
  `gh issue create --title "Informe semana $(date +%V)" --body-file informe.md --label "type:informe"`
- **Prueba el script en local** con tu token antes de meterlo en el workflow: el
  90 % de los fallos son de `jq`, no de Actions
- **Un resumen en `$GITHUB_STEP_SUMMARY`** además del issue: así el propio run
  muestra las cifras sin abrir nada

## 📚 Recursos Adicionales

- [GitHub Docs — Events that trigger workflows: `schedule`](https://docs.github.com/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- [GitHub Docs — Disabling and enabling a workflow](https://docs.github.com/actions/how-tos/manage-workflow-runs/disable-and-enable-a-workflow)
- [`github/issue-metrics`](https://github.com/github/issue-metrics)

## ✅ Checklist de Verificación

- [ ] Tu informe semanal se publica solo y cabe en una pantalla
- [ ] Cada métrica se compara con la semana anterior
- [ ] Guardas el histórico en un CSV commiteado
- [ ] Tienes `workflow_dispatch` para poder lanzarlo a mano
- [ ] Sabes por qué un `schedule` puede dejar de dispararse
