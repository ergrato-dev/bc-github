# Práctica 03 — Panel de métricas

> Calculas las cuatro métricas de flujo de tu repositorio con `gh` y `jq`, y las
> dejas en un script reutilizable.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 04](../1-teoria/04-metricas-de-flujo.md) y [05](../1-teoria/05-calcular-metricas-con-la-api.md)

## Contexto

Tu repositorio lleva tres semanas con issues abriéndose y cerrándose. Ya hay
datos suficientes para saber si el trabajo fluye. Vamos a extraerlos.

> [!NOTE]
> Con menos de 15-20 items cerrados, los números son ruido. Si tu repositorio
> tiene pocos, haz la práctica igual: el objetivo es el método, y el script
> seguirá sirviendo cuando haya datos de verdad.

## Paso 1: Lead time de los issues cerrados

**Por qué**: es la métrica que responde "¿cuánto tarda una petición en estar
resuelta?".

```bash
cd <tu-repo>
gh issue list --state closed --limit 100 \
  --json number,title,createdAt,closedAt,stateReason \
  --jq '[.[] | select(.stateReason != "not_planned")
        | {n: .number,
           dias: (((.closedAt | fromdate) - (.createdAt | fromdate)) / 86400 | floor)}]'
```

**Verifica**: salen pares issue/días. Los descartados (`not_planned`) están
excluidos: no son entregas.

## Paso 2: Media, mediana y percentil 85

**Por qué**: la media miente en cuanto hay un issue olvidado seis meses.

```bash
gh issue list --state closed --limit 100 --json createdAt,closedAt,stateReason \
  --jq '[.[] | select(.stateReason != "not_planned")
        | ((.closedAt | fromdate) - (.createdAt | fromdate)) / 86400]
        | sort
        | {n: length,
           media: (add / length | floor),
           mediana: (.[length/2 | floor] | floor),
           p85: (.[(length * 0.85) | floor] | floor)}'
```

**Verifica**: si la media es mucho mayor que la mediana, tienes casos extremos.
Búscalos: normalmente son issues que nadie cerró a tiempo.

## Paso 3: Throughput semanal

**Por qué**: mide capacidad de entrega, no esfuerzo.

```bash
for i in 0 1 2 3; do
  DESDE=$(date -d "$((i+1)) weeks ago" +%Y-%m-%d)
  HASTA=$(date -d "$i weeks ago" +%Y-%m-%d)
  N=$(gh issue list --state closed --limit 100 \
        --search "closed:$DESDE..$HASTA" --json number --jq 'length')
  echo "$DESDE .. $HASTA : $N cerrados"
done
```

**Verifica**: cuatro líneas con el recuento de cada semana.

## Paso 4: WIP actual

**Por qué**: es el número que más rápido explica un lead time alto.

```bash
gh project item-list <numero> --owner @me --format json \
  --jq '[.items[] | select(.status != null and .status != "Hecho" and .status != "Backlog")]
        | length'
```

**Verifica**: el número coincide con lo que ves en las columnas intermedias del
tablero.

## Paso 5: Lead time de PRs

**Por qué**: es la métrica de salud del equipo, y correlaciona con el tamaño del
PR de forma muy visible.

```bash
gh pr list --state merged --limit 50 \
  --json number,createdAt,mergedAt,additions,deletions \
  --jq '[.[] | {n: .number,
                horas: (((.mergedAt | fromdate) - (.createdAt | fromdate)) / 3600 | floor),
                tam: (.additions + .deletions)}]
        | sort_by(.tam)'
```

**Verifica**: ordenado por tamaño, se ve la tendencia — los PRs grandes tardan
más en mergearse. Es el argumento para abrir PRs pequeños.

## Paso 6: El script completo

**Por qué**: la práctica 04 lo ejecutará desde un workflow.

```bash
cat > scripts/metricas.sh <<'EOF'
#!/usr/bin/env bash
# Métricas de flujo del repositorio.
# Uso: scripts/metricas.sh [owner/repo]
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
DESDE=$(date -d '7 days ago' +%Y-%m-%d)

lead=$(gh issue list --repo "$REPO" --state closed --limit 100 \
  --json createdAt,closedAt,stateReason \
  --jq '[.[] | select(.stateReason != "not_planned")
        | ((.closedAt | fromdate) - (.createdAt | fromdate)) / 86400]
        | if length == 0 then {n:0, mediana:0, p85:0}
          else sort | {n: length,
                       mediana: (.[length/2 | floor] | floor),
                       p85: (.[(length * 0.85) | floor] | floor)} end')

cerrados=$(gh issue list --repo "$REPO" --state closed --limit 100 \
  --search "closed:>=$DESDE" --json number --jq 'length')

abiertos=$(gh issue list --repo "$REPO" --state open --limit 100 \
  --search "created:>=$DESDE" --json number --jq 'length')

atascados=$(gh issue list --repo "$REPO" --state open --limit 100 \
  --search "updated:<$(date -d '14 days ago' +%Y-%m-%d)" \
  --json number,title --jq '[.[] | "#\(.number) \(.title)"]')

jq -n --argjson lead "$lead" --argjson cerrados "$cerrados" \
      --argjson abiertos "$abiertos" --argjson atascados "$atascados" \
      --arg desde "$DESDE" \
  '{desde: $desde, lead_time: $lead, cerrados_semana: $cerrados,
    abiertos_semana: $abiertos, atascados: $atascados}'
EOF

chmod +x scripts/metricas.sh
bash -n scripts/metricas.sh && echo "sintaxis OK"
./scripts/metricas.sh
```

**Verifica**: imprime un JSON con lead time, recuentos y la lista de atascados.

## Paso 7: Guardar el histórico

**Por qué**: un número suelto no dice nada; una serie de doce semanas sí.

```bash
mkdir -p metricas
./scripts/metricas.sh > /tmp/m.json
echo "fecha,lead_mediana,cerrados,abiertos" > metricas/historico.csv 2>/dev/null || true
printf '%s,%s,%s,%s\n' \
  "$(date +%Y-%m-%d)" \
  "$(jq -r '.lead_time.mediana' /tmp/m.json)" \
  "$(jq -r '.cerrados_semana' /tmp/m.json)" \
  "$(jq -r '.abiertos_semana' /tmp/m.json)" >> metricas/historico.csv

cat metricas/historico.csv
git add scripts/metricas.sh metricas/historico.csv
git commit -qm "feat: script de métricas de flujo e histórico semanal"
git push -q
```

**Verifica**: el CSV tiene cabecera y una fila.

## ✅ Resultado

- [ ] Lead time con mediana y percentil 85, excluyendo `not_planned`
- [ ] Throughput de las últimas 4 semanas
- [ ] WIP actual desde el project
- [ ] Relación entre tamaño de PR y tiempo de merge observada
- [ ] `scripts/metricas.sh` funcionando y commiteado
- [ ] `metricas/historico.csv` con su primera fila

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `fromdate` da error | Hay un `null` (issue sin cerrar) | Filtra con `select(.closedAt != null)` |
| `date -d` no funciona | macOS usa BSD `date` | `date -v-7d +%Y-%m-%d`, o instala `coreutils` |
| División por cero | No hay issues cerrados | El script ya lo contempla con `if length == 0` |
| Números absurdos | Hay un issue muy antiguo abierto y cerrado ayer | Es señal real: búscalo |
| `gh pr list` vacío | Aún no has abierto PRs | Llega en la Semana 06; repite entonces |
