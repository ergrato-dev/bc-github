# Práctica 03 — Sub-issues y tasklists

> Partes un épico en piezas que se pueden asignar, cerrar y medir por separado.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 03](../1-teoria/03-labels-milestones-y-tipos.md)

## Contexto

Tienes en la cabeza "hacer el módulo de préstamos". Eso no es un issue: es un
mes de trabajo. Como issue único no se puede estimar, ni repartir, ni saber si
va bien. Vamos a partirlo.

## Paso 1: Crear el épico

**Por qué**: el padre es el que da contexto; los hijos, el que da progreso.

```bash
cd <tu-repo>
gh issue create \
  --title "[Épico]: Módulo de préstamos" \
  --label "type:feature" \
  --body "$(cat <<'EOF'
## Contexto

El sistema debe permitir prestar ejemplares a socios, controlar devoluciones y
calcular multas por retraso.

## Alcance

- Registro de préstamo con fecha de devolución
- Devolución con cálculo de multa
- Consulta del historial de un socio

## Fuera de alcance

- Reservas anticipadas (otro épico)
- Notificaciones por email (Semana futura)

## Criterios de aceptación del épico

- [ ] Todas las sub-issues cerradas
- [ ] Reglas de negocio con tests
EOF
)"
```

**Verifica**:

```bash
EPIC=$(gh issue list --search "Épico" --json number --jq '.[0].number')
echo "Épico: #$EPIC"
```

## Paso 2: Crear las sub-issues

**Por qué**: cada pieza debe poder cerrarse por su cuenta, con su propio dueño.

```bash
gh issue create --title "Registrar préstamo con fecha de devolución" \
  --label "type:feature,area:prestamos" \
  --body "Parte del épico #$EPIC

## Criterios de aceptación
- [ ] Se registra socio, ejemplar y fecha
- [ ] La fecha de devolución son 15 días naturales
- [ ] No se presta si el ejemplar no está disponible"

gh issue create --title "Calcular multa por retraso en la devolución" \
  --label "type:feature,area:prestamos" \
  --body "Parte del épico #$EPIC

## Criterios de aceptación
- [ ] Devolver el mismo día no genera multa
- [ ] Cada día de retraso suma 300
- [ ] Test para 0, 1 y 10 días"

gh issue create --title "Consultar historial de préstamos de un socio" \
  --label "type:feature,area:socios" \
  --body "Parte del épico #$EPIC

## Criterios de aceptación
- [ ] Devuelve préstamos ordenados por fecha
- [ ] Marca los que siguen abiertos"
```

**Verifica**:

```bash
gh issue list --label "type:feature" --json number,title --jq '.[] | "\(.number) \(.title)"'
```

## Paso 3: Enlazarlas como sub-issues

**Por qué**: mencionar `#12` crea una referencia; una **sub-issue** crea una
relación jerárquica real, con barra de progreso automática.

**Con la UI** (la vía soportada): abre el épico → barra lateral →
`Sub-issues` → `Add sub-issue` → busca cada issue por número.

**Verifica** por GraphQL, que es la única API que las expone:

```bash
gh api graphql -F owner='<tu-usuario>' -F repo='<tu-repo>' -F num=$EPIC -f query='
  query($owner:String!, $repo:String!, $num:Int!) {
    repository(owner:$owner, name:$repo) {
      issue(number:$num) {
        title
        subIssues(first:10) { totalCount nodes { number title state } }
      }
    }
  }' --jq '.data.repository.issue | {titulo: .title, total: .subIssues.totalCount}'
```

Debe devolver `total: 3`.

## Paso 4: Ver el progreso

**Por qué**: es la razón de ser de la jerarquía.

Cierra una sub-issue:

```bash
SUB=$(gh issue list --search "Calcular multa" --json number --jq '.[0].number')
gh issue close "$SUB" --comment "Implementado en src/index.js"
```

Abre el épico en el navegador:

```bash
gh issue view "$EPIC" --web
```

**Verifica**: el épico muestra `1 of 3 completed` sin que hayas tocado nada.

## Paso 5: Tasklist para los pasos internos

**Por qué**: no todo merece un issue. Los pasos de **una misma** tarea van en el
cuerpo.

Edita una sub-issue abierta y añade:

```markdown
## Pasos

- [x] Definir la firma de la función
- [ ] Implementar la regla
- [ ] Añadir tests
- [ ] Actualizar el README
```

**Verifica**: en la lista de issues aparece el contador de tareas (`1/4`).

## Paso 6: Milestone que agrupa el épico

**Por qué**: las sub-issues dicen *qué*; el milestone dice *para cuándo*.

```bash
gh api repos/{owner}/{repo}/milestones --method POST \
  -f title="v1.0 — Préstamos" \
  -f description="Primera versión con préstamos y multas" \
  -f due_on="2026-12-31T23:59:59Z" --jq '.number'
```

Asigna el épico y sus sub-issues:

```bash
for n in $EPIC $(gh issue list --label "area:prestamos" --json number --jq '.[].number'); do
  gh issue edit "$n" --milestone "v1.0 — Préstamos"
done
```

**Verifica**:

```bash
gh api repos/{owner}/{repo}/milestones \
  --jq '.[] | "\(.title): \(.closed_issues)/\(.open_issues + .closed_issues)"'
```

## ✅ Resultado

- [ ] Un épico con alcance y fuera de alcance explícitos
- [ ] 3 sub-issues enlazadas, cada una con criterios de aceptación
- [ ] La consulta GraphQL devuelve `subIssues.totalCount = 3`
- [ ] El épico muestra progreso automático
- [ ] Una sub-issue con tasklist interna
- [ ] Un milestone con fecha agrupando el trabajo

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| No encuentras "Sub-issues" en la barra lateral | Estás en el issue equivocado o la vista es estrecha | Ábrelo en pantalla completa |
| `subIssues` no existe en GraphQL | Error de tipeo: es `subIssues`, camelCase | Revisa la query |
| El progreso no se actualiza | La sub-issue está enlazada por mención, no como sub-issue | Añádela desde la barra lateral |
| `--milestone` falla | El título debe coincidir exactamente | Cópialo de `gh api .../milestones` |
| `due_on` rechazado | Formato incorrecto | ISO 8601 con `Z`: `2026-12-31T23:59:59Z` |
