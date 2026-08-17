# Práctica 04 — Auditoría de tus PRs

> Mides tus propios pull requests: tamaño, tiempo hasta el merge y cuántos
> recibieron revisión de verdad. Los datos suelen sorprender.

**Duración estimada**: 45 min
**Prerrequisitos**: [Teoría 01](../1-teoria/01-cultura-de-review.md), prácticas de la Semana 06

## Contexto

Los acuerdos de review ("PRs por debajo de 400 líneas", "primera respuesta en un
día") solo sirven si alguien comprueba si se cumplen. Vamos a comprobarlo con la
API, y a dejarlo automatizado.

## Paso 1: Tamaño de tus PRs

**Por qué**: es la variable que más afecta a la calidad de la revisión.

```bash
cd <tu-repo>
gh pr list --state merged --limit 50 \
  --json number,title,additions,deletions \
  --jq '[.[] | {n: .number, titulo: .title, lineas: (.additions + .deletions)}]
        | sort_by(-.lineas)'
```

**Verifica**: tienes la lista ordenada de mayor a menor.

Reparto por tramos:

```bash
gh pr list --state merged --limit 50 --json additions,deletions \
  --jq '[.[] | (.additions + .deletions)]
        | {n: length,
           pequenos: (map(select(. < 100)) | length),
           medianos: (map(select(. >= 100 and . < 400)) | length),
           grandes:  (map(select(. >= 400)) | length)}'
```

**Verifica**: la mayoría deberían caer en `pequenos` o `medianos`.

## Paso 2: Tiempo hasta el merge

**Por qué**: un PR parado bloquea a su autor y envejece contra `main`.

```bash
gh pr list --state merged --limit 50 --json number,createdAt,mergedAt \
  --jq '[.[] | {n: .number,
                horas: (((.mergedAt | fromdate) - (.createdAt | fromdate)) / 3600 | floor)}]
        | sort_by(-.horas)'
```

Mediana:

```bash
gh pr list --state merged --limit 50 --json createdAt,mergedAt \
  --jq '[.[] | ((.mergedAt | fromdate) - (.createdAt | fromdate)) / 3600]
        | sort
        | {n: length, mediana_horas: (.[length/2 | floor] | floor)}'
```

**Verifica**: tienes un número. Si es mayor de 48 horas, hay algo que arreglar
en el proceso, no en las personas.

## Paso 3: ¿Tamaño y tiempo van juntos?

**Por qué**: es el argumento con datos para abrir PRs pequeños.

```bash
gh pr list --state merged --limit 50 \
  --json number,additions,deletions,createdAt,mergedAt \
  --jq '[.[] | {lineas: (.additions + .deletions),
                horas: (((.mergedAt | fromdate) - (.createdAt | fromdate)) / 3600 | floor)}]
        | group_by(.lineas < 100)
        | map({pequenos: (.[0].lineas < 100),
               n: length,
               horas_medias: ((map(.horas) | add) / length | floor)})'
```

**Verifica**: normalmente los PRs pequeños se mergean bastante antes. Si en tu
caso no, mira por qué: puede que el cuello de botella esté en el CI, no en la
revisión.

## Paso 4: ¿Cuántos PRs recibieron revisión?

**Por qué**: un PR mergeado sin comentarios no fue revisado, fue aprobado.

```bash
for n in $(gh pr list --state merged --limit 20 --json number --jq '.[].number'); do
  C=$(gh api "repos/{owner}/{repo}/pulls/$n/comments" --jq 'length')
  R=$(gh api "repos/{owner}/{repo}/pulls/$n/reviews" --jq 'length')
  echo "PR #$n — comentarios de línea: $C · revisiones: $R"
done
```

**Verifica**: sabes qué proporción de tus PRs pasó por revisión real.

## Paso 5: El script de auditoría

**Por qué**: para repetirlo sin reescribir las consultas.

```bash
cat > scripts/auditoria-prs.sh <<'EOF'
#!/usr/bin/env bash
# Auditoría de pull requests: tamaño, tiempo hasta el merge y revisión.
# Uso: scripts/auditoria-prs.sh [owner/repo]
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"

datos=$(gh pr list --repo "$REPO" --state merged --limit 100 \
  --json number,additions,deletions,createdAt,mergedAt \
  --jq '[.[] | {n: .number,
                lineas: (.additions + .deletions),
                horas: (((.mergedAt | fromdate) - (.createdAt | fromdate)) / 3600 | floor)}]')

echo "$datos" | jq '
  if length == 0 then {aviso: "sin PRs mergeados todavía"}
  else
    {
      total: length,
      tamano: {
        pequenos_lt100:  (map(select(.lineas < 100)) | length),
        medianos_100_400:(map(select(.lineas >= 100 and .lineas < 400)) | length),
        grandes_gt400:   (map(select(.lineas >= 400)) | length),
        mediana:         ([.[].lineas] | sort | .[length/2 | floor])
      },
      tiempo_horas: {
        mediana: ([.[].horas] | sort | .[length/2 | floor]),
        p85:     ([.[].horas] | sort | .[(length * 0.85) | floor]),
        max:     ([.[].horas] | max)
      },
      mas_grandes: (sort_by(-.lineas) | .[0:3] | map({pr: .n, lineas}))
    }
  end'
EOF

chmod +x scripts/auditoria-prs.sh
bash -n scripts/auditoria-prs.sh && ./scripts/auditoria-prs.sh
```

**Verifica**: imprime un JSON con el reparto de tamaños, los tiempos y los tres
PRs más grandes.

## Paso 6: Publicar las conclusiones

**Por qué**: una auditoría que no cambia nada es tiempo perdido.

```bash
git add scripts/auditoria-prs.sh
git commit -qm "feat: script de auditoría de pull requests"
git push -q

gh issue create --title "Auditoría de PRs — conclusiones" \
  --label "type:chore" \
  --body "$(cat <<EOF
Resultado de \`scripts/auditoria-prs.sh\`:

\`\`\`json
$(./scripts/auditoria-prs.sh)
\`\`\`

## Qué cambio a partir de ahora

1. <acción concreta 1>
2. <acción concreta 2>

## Qué mantengo

- <lo que ya funciona>
EOF
)"
```

**Verifica**: el issue existe con datos reales y **acciones concretas**, no
observaciones genéricas.

## Paso 7: Fijar los umbrales

**Por qué**: una métrica sin umbral no dispara ninguna decisión.

```bash
cat >> CONTRIBUTING.md <<'EOF'

### Umbrales de review

| Métrica | Umbral | Qué hacemos si se pasa |
|---------|-------:|------------------------|
| Líneas por PR | 400 | Dividir en varios PRs, o apilarlos |
| Horas hasta el merge (mediana) | 48 | Revisar por qué: ¿CI lento? ¿nadie revisa? |
| PRs sin ningún comentario | 50% | Revisar de verdad, no solo aprobar |

Se auditan con `scripts/auditoria-prs.sh` una vez al mes.
EOF

git add CONTRIBUTING.md
git commit -qm "docs: fija umbrales de review y su auditoría mensual"
git push -q
```

## ✅ Resultado

- [ ] Conoces el reparto de tamaños de tus PRs
- [ ] Conoces la mediana de horas hasta el merge
- [ ] Has comprobado si tamaño y tiempo están relacionados
- [ ] Sabes qué proporción de tus PRs recibió revisión real
- [ ] `scripts/auditoria-prs.sh` commiteado y funcionando
- [ ] Issue con conclusiones y acciones concretas
- [ ] Umbrales documentados

```bash
./scripts/verificar-semana.sh 07 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `sin PRs mergeados todavía` | El script lo contempla | Completa la Semana 06 primero |
| `fromdate` falla | Algún `mergedAt` es `null` | `--state merged` ya los filtra; revisa el filtro |
| Números raros | Muy pocos PRs | Con menos de 10, la mediana es anecdótica |
| `jq: error: max/0` | Array vacío | La rama `if length == 0` lo cubre |
| El bucle del paso 4 es lento | Una llamada por PR | Bájalo a 10 PRs |
