# Práctica 02 — Taxonomía de labels

> Diseñas una taxonomía por familias, la creas por lote y compruebas que
> responde preguntas reales.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 03](../1-teoria/03-labels-milestones-y-tipos.md)

## Contexto

GitHub trae nueve labels de fábrica que no dicen nada de tu proyecto:
`bug`, `duplicate`, `enhancement`, `wontfix`... Vamos a sustituirlas por una
taxonomía que sirva para filtrar.

## Paso 1: Ver lo que hay y limpiarlo

**Por qué**: mantener labels que nadie usa hace que el selector sea ruido.

```bash
cd <tu-repo>
gh label list --limit 50
```

> [!WARNING]
> `gh label delete` elimina la label **de todos los issues que la tengan**. Como
> tu repositorio aún tiene pocos issues, ahora es el momento barato de hacerlo.

```bash
for l in duplicate wontfix invalid question "help wanted" enhancement; do
  gh label delete "$l" --yes 2>/dev/null || true
done
gh label list
```

**Verifica**: solo quedan las que creaste en la práctica 01 y, quizá,
`documentation` y `good first issue`.

## Paso 2: Diseñar la taxonomía en papel

**Por qué**: crear labels sobre la marcha produce solapamientos que luego cuesta
deshacer.

Rellena esta tabla **para tu dominio** antes de tocar la terminal:

| Familia | Labels | Cuántas |
|---------|--------|:-------:|
| `type:` | bug, feature, docs, chore | 4 |
| `area:` | (3 áreas de **tu** dominio) | 3 |
| `prio:` | alta, media, baja | 3 |
| `status:` | triage, bloqueado, necesita-info | 3 |
| comunidad | good first issue | 1 |

Ejemplo de áreas por dominio: biblioteca → `prestamos`, `socios`, `catalogo`;
gimnasio → `reservas`, `socios`, `clases`.

**Verifica**: ningún par de labels responde la misma pregunta.

## Paso 3: Crearlas por lote

**Por qué**: catorce `gh label create` a mano son catorce oportunidades de error.

```bash
cat > /tmp/labels.tsv <<'EOF'
type:bug	B60205	Algo no funciona como debería
type:feature	1D76DB	Funcionalidad nueva
type:docs	0075CA	Solo documentación
type:chore	CFD3D7	Mantenimiento, sin cambio funcional
area:prestamos	5319E7	Área: préstamos
area:socios	5319E7	Área: socios
area:catalogo	5319E7	Área: catálogo
prio:alta	B60205	Bloquea o afecta a usuarios ahora
prio:media	D93F0B	Importante, no urgente
prio:baja	FBCA04	Cuando haya hueco
status:triage	BFDADC	Pendiente de clasificar
status:bloqueado	000000	Esperando algo externo
status:necesita-info	D4C5F9	Falta información del autor
good first issue	0E8A16	Buen punto de entrada para empezar
EOF

# Adapta las tres area: a TU dominio antes de ejecutar esto
while IFS=$'\t' read -r name color desc; do
  gh label create "$name" --color "$color" --description "$desc" --force
done < /tmp/labels.tsv
```

**Verifica**:

```bash
gh label list --limit 50 --json name,description \
  --jq '.[] | select(.description == "") | .name'
```

No debe salir nada: **todas** las labels tienen descripción.

## Paso 4: Comprobar que la taxonomía responde preguntas

**Por qué**: una taxonomía se valida con las preguntas que tendrás que responder,
no con lo bonita que queda.

Etiqueta a mano 4 o 5 issues y prueba:

```bash
# ¿Qué es urgente en el área de préstamos?
gh issue list --search 'is:open label:"prio:alta" label:"area:prestamos"'

# ¿Qué falta por clasificar?
gh issue list --search 'is:open label:"status:triage"'

# ¿Por dónde puede empezar alguien nuevo?
gh issue list --search 'is:open label:"good first issue" no:assignee'
```

**Verifica**: las tres devuelven exactamente lo que esperas. Si alguna devuelve
de más o de menos, la taxonomía tiene un hueco.

## Paso 5: Detectar solapamientos

**Por qué**: dos labels de la misma familia en un issue significa que la
taxonomía no discrimina.

```bash
gh issue list --state all --limit 100 --json number,labels \
  --jq '.[] | {n: .number, tipos: [.labels[].name | select(startswith("type:"))]}
        | select(.tipos | length > 1)'
```

**Verifica**: sin salida. Si algo aparece, decide cuál corresponde y quita la
otra.

## Paso 6: Reparto de labels

**Por qué**: si el 80% de tus issues son `prio:alta`, la prioridad no significa
nada.

```bash
gh issue list --state all --limit 100 --json labels \
  --jq '[.[].labels[].name] | group_by(.) | map({label: .[0], n: length}) | sort_by(-.n) | .[]'
```

**Verifica**: `prio:alta` no supera el 20-25% del total.

## Paso 7: Guardar la taxonomía para reutilizarla

**Por qué**: la vas a querer en tus próximos repositorios.

```bash
gh label list --limit 50 --json name,color,description > labels-taxonomia.json
git add labels-taxonomia.json
git commit -qm "docs: guarda la taxonomía de labels del proyecto"
git push -q
```

En otro repositorio, más adelante: `gh label clone <tu-usuario>/<tu-repo>`.

**Verifica**:

```bash
jq 'length' labels-taxonomia.json
# >= 10
```

## ✅ Resultado

- [ ] Labels de fábrica innecesarias eliminadas
- [ ] 10+ labels propias con prefijo de familia
- [ ] Todas tienen color coherente y descripción
- [ ] Ningún issue con dos labels de la misma familia
- [ ] `prio:alta` por debajo del 25%
- [ ] Taxonomía exportada a JSON

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `label already exists` | Ya existía con otro color | Añade `--force` |
| Borraste una label en uso | Se quitó de todos sus issues | Vuelve a crearla y re-etiqueta |
| Los colores se ven mal | Llevan `#` | El hex va **sin** almohadilla |
| El bucle no lee bien las líneas | El separador no es tabulador real | Usa `$'\t'` como IFS |
| Las labels con espacios fallan en las búsquedas | Faltan comillas | `label:"good first issue"` |
