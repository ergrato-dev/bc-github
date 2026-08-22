# Práctica 04 — Informe semanal automático

> Cada lunes a las 8:00 aparece un issue con el estado del proyecto. Nadie lo
> escribe.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 06](../1-teoria/06-insights.md) y [07](../1-teoria/07-informes-automaticos.md), práctica 03

## Contexto

Ya sabes calcular las métricas. Si hay que ejecutar un script a mano cada lunes,
no se hará más de tres semanas. Vamos a que llegue solo.

## Paso 1: El generador del informe

**Por qué**: separar "calcular" (práctica 03) de "redactar" mantiene las dos
piezas simples.

```bash
cd <tu-repo>
cat > scripts/informe-semanal.sh <<'EOF'
#!/usr/bin/env bash
# Publica un informe semanal como issue y actualiza el histórico.
# Uso: scripts/informe-semanal.sh
set -euo pipefail

M=$(./scripts/metricas.sh)
HOY=$(date +%Y-%m-%d)
LEAD=$(jq -r '.lead_time.mediana' <<<"$M")
P85=$(jq -r '.lead_time.p85' <<<"$M")
CERR=$(jq -r '.cerrados_semana' <<<"$M")
ABIE=$(jq -r '.abiertos_semana' <<<"$M")

# Fila anterior del histórico, para comparar
PREV_LEAD=$(tail -1 metricas/historico.csv 2>/dev/null | cut -d, -f2 || echo "—")
PREV_CERR=$(tail -1 metricas/historico.csv 2>/dev/null | cut -d, -f3 || echo "—")

ATASCADOS=$(jq -r '.atascados | if length == 0 then "- Ninguno 🎉"
                   else map("- " + .) | join("\n") end' <<<"$M")

BODY=$(cat <<TXT
## Semana del $HOY

| Métrica | Ahora | Anterior |
|---------|------:|---------:|
| Cerrados (7 d) | $CERR | $PREV_CERR |
| Abiertos nuevos (7 d) | $ABIE | — |
| Lead time mediana (d) | $LEAD | $PREV_LEAD |
| Lead time p85 (d) | $P85 | — |

### Atascados (>14 días sin actividad)

$ATASCADOS

---
Generado automáticamente por \`scripts/informe-semanal.sh\`.
TXT
)

gh issue create --title "Informe semanal — $HOY" --body "$BODY" --label "type:informe"

# Histórico
mkdir -p metricas
[ -f metricas/historico.csv ] || echo "fecha,lead_mediana,cerrados,abiertos" > metricas/historico.csv
echo "$HOY,$LEAD,$CERR,$ABIE" >> metricas/historico.csv
EOF

chmod +x scripts/informe-semanal.sh
bash -n scripts/informe-semanal.sh && echo "sintaxis OK"
```

**Verifica**: `bash -n` sin errores.

## Paso 2: La label del informe

**Por qué**: sin ella, `gh issue create --label` falla y los informes no se
pueden filtrar después.

```bash
gh label create "type:informe" --color 0E8A16 \
  --description "Informe automático de métricas" --force
```

**Verifica**:

```bash
gh label list --json name --jq '.[] | select(. == "type:informe")' 2>/dev/null || \
  gh label list | grep informe
```

## Paso 3: Probarlo en local

**Por qué**: nunca estrenes un script directamente dentro de un workflow: los
logs de Actions son peores para depurar.

```bash
./scripts/informe-semanal.sh
gh issue list --label "type:informe"
```

**Verifica**: existe un issue "Informe semanal — <fecha>" con la tabla.

## Paso 4: El workflow programado

**Por qué**: es el objetivo de la práctica.

```bash
cat > .github/workflows/informe-semanal.yml <<'YAML'
name: Informe semanal

on:
  schedule:
    - cron: "0 8 * * 1"      # lunes 08:00 UTC
  workflow_dispatch:

permissions:
  contents: write
  issues: write

jobs:
  informe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - name: Generar y publicar el informe
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: bash scripts/informe-semanal.sh

      - name: Guardar el histórico
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add metricas/historico.csv
          git diff --staged --quiet || git commit -m "chore: actualiza el histórico de métricas"
          git push
YAML

git add .github/workflows/informe-semanal.yml scripts/informe-semanal.sh
git commit -qm "feat: informe semanal automático de métricas"
git push -q
```

Aquí `GITHUB_TOKEN` **sí** basta: escribir issues y hacer push están dentro del
alcance del repositorio. Solo Projects queda fuera.

**Verifica**:

```bash
gh workflow list
```

## Paso 5: Lanzarlo a mano

**Por qué**: `workflow_dispatch` existe justo para no esperar al lunes.

```bash
gh workflow run informe-semanal.yml
sleep 10
gh run list --workflow informe-semanal.yml --limit 3
gh run watch
```

**Verifica**:

```bash
gh issue list --label "type:informe" --json number,title --jq '.[] | .title'
git pull -q && tail -3 metricas/historico.csv
```

Debe haber un informe nuevo y una fila más en el CSV.

## Paso 6: Cerrar el informe anterior

**Por qué**: si no, la lista de issues abiertos se llena de informes viejos.

Añade al final de `scripts/informe-semanal.sh`, **antes** de crear el nuevo:

```bash
gh issue list --label "type:informe" --state open --json number --jq '.[].number' \
  | while read -r n; do gh issue close "$n" --comment "Sustituido por el informe de esta semana."; done
```

**Verifica**: tras dos ejecuciones, solo hay un informe abierto.

## Paso 7: Un gráfico de Insights

**Por qué**: los números del informe dicen "cuánto"; el gráfico dice "hacia
dónde".

`Project → Insights → New chart`:

| Ajuste | Valor |
|--------|-------|
| Nombre | `Carga por área` |
| Filtro | `is:open -status:Hecho` |
| Eje X | `Area` |
| Group by | `Priority` |
| Tipo | Barras apiladas |

**Verifica**: el gráfico muestra qué área acumula más trabajo pendiente y con
qué prioridad.

## ✅ Resultado

- [ ] `scripts/informe-semanal.sh` funcionando en local
- [ ] Label `type:informe` creada
- [ ] Workflow con `schedule` y `workflow_dispatch`
- [ ] Al menos un informe generado por el workflow
- [ ] `metricas/historico.csv` actualizado desde Actions
- [ ] Un gráfico de Insights con campos propios

```bash
./scripts/verificar-semana.sh 05 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| El workflow falla en `git push` | Falta `contents: write` | Añádelo a `permissions` |
| `label not found` | La label no existe | Créala antes |
| El `schedule` no dispara | Los cron de Actions se retrasan, y a veces bastante | Comprueba con `workflow_dispatch` |
| Dejó de llegar tras dos meses | Los `schedule` se desactivan a los 60 días sin actividad | Reactívalo en la pestaña Actions |
| `git push` rechazado | El workflow corrió sobre un commit viejo | `actions/checkout` con `fetch-depth: 0`, o reintenta |
| El informe sale vacío | No hay issues cerrados aún | Correcto: vuelve cuando haya datos |
