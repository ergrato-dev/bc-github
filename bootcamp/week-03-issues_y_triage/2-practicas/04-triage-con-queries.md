# Práctica 04 — Triage con queries

> Una sesión de triage real: entras con una query, sales con el backlog
> clasificado y sin issues huérfanos.

**Duración estimada**: 40 min
**Prerrequisitos**: [Teoría 04](../1-teoria/04-busqueda-y-triage.md), prácticas 01-03

## Contexto

Tienes issues creados en las prácticas anteriores y los que crearás ahora. Vamos
a triarlos con criterio y a dejar el proceso montado para repetirlo cada semana
en veinte minutos.

## Paso 1: Generar material que triar

**Por qué**: necesitas issues variados, incluidos algunos malos, para practicar
el descarte.

```bash
cd <tu-repo>
gh issue create --title "no funciona" --body "cuando lo uso falla"
gh issue create --title "Añadir modo oscuro a todo" --body "sería bonito"
gh issue create --title "La multa se calcula mal con devolución el mismo día" \
  --body "Devolviendo el mismo día genera multa de 300. Debería ser 0."
gh issue create --title "Duplicado: la multa se calcula mal" \
  --body "Mismo problema que el anterior."
gh issue create --title "Documentar la regla de cálculo de multa en el README" \
  --body "El README no explica la tarifa."
```

**Verifica**:

```bash
gh issue list --state open --json number --jq 'length'
```

## Paso 2: La query de entrada

**Por qué**: la vista por defecto ordena por actualización y siempre ves lo
mismo. El triage se hace por **antigüedad y falta de clasificación**.

```bash
gh issue list --search "is:open no:label sort:created-asc" \
  --json number,title --jq '.[] | "#\(.number) \(.title)"'
```

**Verifica**: aparecen los issues sin etiquetar, del más viejo al más nuevo.

## Paso 3: Triar aplicando las cuatro preguntas

**Por qué**: sin criterio explícito, el triage es opinión del día.

Recuerda el orden: ¿se entiende? → ¿es válido? → ¿qué es? → ¿cuándo?

**"no funciona"** — no se entiende:

```bash
N=<número>
gh issue edit $N --add-label "status:necesita-info"
gh issue comment $N --body "Gracias por reportar. Para poder reproducirlo necesito:

1. Qué comando ejecutaste
2. Qué esperabas que ocurriera
3. Qué ocurrió

Sin esos datos no puedo avanzar. Vuelve a abrirlo cuando los tengas."
gh issue close $N --reason "not planned"
```

**"Duplicado"** — no es válido:

```bash
D=<número-duplicado>; O=<número-original>
gh issue close $D --reason "not planned" --comment "Duplicado de #$O. La discusión sigue allí."
```

**"La multa se calcula mal"** — válido, es un bug:

```bash
B=<número>
gh issue edit $B --add-label "type:bug,area:prestamos,prio:alta" --milestone "v1.0 — Préstamos"
```

**"Documentar la regla"** — válido, docs, prioridad baja:

```bash
gh issue edit <número> --add-label "type:docs,prio:baja"
```

**"Modo oscuro"** — válido pero fuera de alcance:

```bash
gh issue close <número> --reason "not planned" \
  --comment "Fuera del alcance actual: el proyecto no tiene interfaz gráfica. Si la tuviera, lo retomamos."
```

**Verifica**:

```bash
gh issue list --search "is:open no:label" --json number --jq 'length'
# 0
```

## Paso 4: Comprobar que no quedan huérfanos

**Por qué**: un issue abierto sin label ni milestone es un issue que nadie va a
mirar nunca.

```bash
echo "Sin label:"     && gh issue list --search "is:open no:label"     --json number --jq 'length'
echo "Sin milestone:" && gh issue list --search "is:open no:milestone" --json number --jq 'length'
echo "Sin asignar:"   && gh issue list --search "is:open no:assignee"  --json number --jq 'length'
```

Sin label debe ser 0. Sin milestone y sin asignar pueden no serlo: el backlog
puede tener cosas sin fecha ni dueño, siempre que estén clasificadas.

## Paso 5: Guardar las queries de trabajo

**Por qué**: si hay que teclear la query, no se hace.

Guarda estas URLs como marcadores del navegador (sustituye usuario y repo):

```
.../issues?q=is:issue+is:open+no:label+sort:created-asc     ← triage pendiente
.../issues?q=is:issue+is:open+label:"prio:alta"             ← urgente
.../issues?q=is:issue+is:open+updated:<2026-06-17           ← abandonados
.../issues?q=is:issue+is:open+label:"good first issue"+no:assignee
```

Y como alias de `gh`:

```bash
gh alias set triage 'issue list --search "is:open no:label sort:created-asc"'
gh alias set urgente 'issue list --search "is:open label:prio:alta"'
gh triage
```

**Verifica**:

```bash
gh alias list | grep -E 'triage|urgente'
```

## Paso 6: Respuestas guardadas

**Por qué**: las mismas tres respuestas se escriben decenas de veces.

`Settings → Saved replies` (son de tu cuenta, valen para todos tus repos).
Crea al menos:

1. **Falta información** — el texto del paso 3
2. **Duplicado** — "Duplicado de #N. La discusión sigue allí."
3. **Fuera de alcance** — qué sí cubre el proyecto

**Verifica**: en un comentario nuevo, `Ctrl` + `.` las ofrece.

## Paso 7: Medir la sesión

**Por qué**: el triage se sostiene si es corto. Si tardas dos horas, no lo harás
la semana que viene.

```bash
gh issue list --state all --limit 100 --json number,state,stateReason \
  --jq 'group_by(.state + (.stateReason // "")) | map({estado: .[0].state, razon: .[0].stateReason, n: length})'
```

**Verifica**: hay issues cerrados con `NOT_PLANNED`, no todos como completados.

## ✅ Resultado

- [ ] Ningún issue abierto sin label
- [ ] Al menos dos cerrados como *not planned*, con motivo comentado
- [ ] Un duplicado cerrado enlazando al original
- [ ] Dos alias de `gh` para las queries de triage
- [ ] Tres respuestas guardadas
- [ ] La sesión completa te ha llevado menos de 20 minutos

```bash
./scripts/verificar-semana.sh 03 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Si algo sale mal

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `--reason` no se acepta | Solo vale al cerrar | `gh issue close N --reason "not planned"` |
| La búsqueda con label de dos palabras no filtra | Faltan comillas | `label:"good first issue"` |
| `sort:created-asc` se ignora | Va dentro de `--search`, no como flag | Todo dentro de la cadena de búsqueda |
| Cerraste un issue por error | — | `gh issue reopen N` |
| Las respuestas guardadas no aparecen | Son de cuenta, no de repo | `Settings` personal, no del repositorio |
