# Consultas, vistas y bandeja de notificaciones

> Triar no es leer issues: es aplicar cinco consultas guardadas. Si cada sesión
> empieza mirando la lista por defecto, siempre trabajarás sobre los mismos
> veinte de arriba.

## 🎯 Objetivos

- Escribir consultas de issues que aíslen exactamente lo que buscas
- Montar el juego de consultas con el que empieza cada sesión de triage
- Guardar y compartir vistas para no teclear lo mismo cada semana
- Domar la bandeja de notificaciones con filtros y suscripciones

## 1. Qué problema resuelve

La bandeja de issues crece más rápido de lo que se vacía, y la vista por defecto
—abiertos, por fecha de actualización— es exactamente la peor para triar: pone
arriba lo que ya tiene actividad y esconde lo que nadie ha mirado nunca.

La solución no es más disciplina: es tener escritas las consultas que sacan a la
superficie lo que hay que decidir hoy.

## 2. Los calificadores que se usan en triage

La referencia completa de la sintaxis está en la
[Semana 02, Teoría 06](../../week-02-repositorio_como_producto/1-teoria/06-busqueda-de-codigo.md).
Aquí van los que de verdad se usan al triar:

| Calificador | Valores | Ejemplo |
|-------------|---------|---------|
| `is:` | `issue`, `open`, `closed` | `is:issue is:open` |
| `no:` | `label`, `assignee`, `milestone`, `project` | `no:assignee` |
| `label:` / `-label:` | Nombre exacto, comillas si lleva espacios | `-label:"status:triage"` |
| `author:` `assignee:` `commenter:` `involves:` | Usuario o `@me` | `involves:@me` |
| `created:` `updated:` `closed:` | `>`, `<`, rangos | `updated:<2026-06-17` |
| `comments:` `reactions:` `interactions:` | Números y rangos | `reactions:>5` |
| `linked:pr` | Issues con PR vinculado | `is:open linked:pr` |
| `type:` | Issue type de la organización | `type:Bug` |
| `sort:` | `created-asc`, `updated-desc`, `reactions-+1-desc` | `sort:reactions-+1-desc` |

Dos detalles que ahorran desconcierto: varios `label:` se combinan con **Y**
lógica (no con O), y las fechas admiten tanto absolutas (`>2026-06-01`) como
rangos (`2026-01-01..2026-03-01`).

## 3. El juego de consultas del triage

```
# 1. Sin triar: el punto de partida de cada sesión, lo más viejo primero
is:issue is:open no:label sort:created-asc

# 2. Esperando respuesta desde hace demasiado
is:issue is:open label:"status:necesita-info" updated:<2026-06-17

# 3. Lo que la gente pide más (demanda real, no volumen de ruido)
is:issue is:open sort:reactions-+1-desc

# 4. Ya hay alguien trabajando: no lo toques
is:issue is:open linked:pr

# 5. Listo para quien llega nuevo
is:issue is:open label:"good first issue" no:assignee

# 6. Abandonados: sin actividad en 60 días
is:issue is:open updated:<2026-06-17 -label:"prio:alta"

# 7. Lo mío
is:open involves:@me
```

Desde la terminal, con el mismo lenguaje:

```bash
gh issue list --search "is:open no:label sort:created-asc" --limit 20
gh issue list --search "is:open updated:<$(date -d '60 days ago' +%Y-%m-%d)" --limit 50
gh search issues "is:open label:bug" --owner ergrato-dev --limit 30
```

## 4. Guardar lo que repites

| Forma | Dónde | Se comparte |
|-------|-------|:-----------:|
| Marcador del navegador | Tu equipo | No |
| Vista guardada en la lista de issues | El repositorio | Sí |
| Vista de un Project v2 | El Project (Semana 04) | Sí |
| Alias de `gh` | Tu máquina | No |
| Enlace en `CONTRIBUTING.md` | El repositorio | Sí, y además se documenta |

```bash
gh alias set triage 'issue list --search "is:open no:label sort:created-asc" --limit 20'
gh alias set mios   'issue list --search "is:open assignee:@me"'
```

Poner el enlace de "issues sin triar" y el de "good first issue" en el
`CONTRIBUTING.md` tiene un efecto de segundo orden: quien quiere ayudar encuentra
por dónde empezar sin preguntarte.

## 5. La bandeja de notificaciones

El otro sitio donde se acumula trabajo. Los filtros de `github.com/notifications`
usan su propia sintaxis:

```
is:unread reason:mention
is:unread reason:assign
repo:owner/repo is:unread
is:unread reason:review-requested
```

| `reason` | Por qué te llegó |
|----------|------------------|
| `mention` | Te mencionaron con `@` |
| `team_mention` | Mencionaron a tu equipo |
| `assign` | Te asignaron |
| `review_requested` | Te pidieron revisión |
| `author` | Eres quien abrió el hilo |
| `comment` | Comentaste y sigues suscrito |
| `subscribed` | Vigilas el repositorio entero |
| `ci_activity` | Un workflow tuyo terminó |

```bash
gh api notifications --jq '.[] | "\(.reason)\t\(.repository.full_name)\t\(.subject.title)"'
gh api notifications --method PUT -F read=true    # marcar todo como leído
```

Y la decisión que más ruido quita: en `Watch` de cada repositorio, cambiar de
**All Activity** a **Participating and @mentions**, o elegir eventos concretos
(solo releases, solo issues). Vigilar un repositorio activo entero garantiza que
dejes de leer las notificaciones en dos semanas.

> [!TIP]
> `reason:mention` y `reason:review_requested` son las dos que casi nunca pueden
> esperar. Si solo vas a mirar dos filtros al día, que sean esos.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Triar por la vista por defecto | Siempre ves los mismos de arriba | `no:label sort:created-asc` |
| Consultas tecleadas de memoria cada semana | Cambian sin querer y los resultados no son comparables | Vistas guardadas o alias |
| Vigilar todo con **All Activity** | Trescientas notificaciones y dejas de leerlas | *Participating and @mentions* |
| Marcar todo como leído sin mirar | Pierdes menciones reales | Filtra por `reason:` y luego limpia |
| Buscar sin `sort:` | El orden por defecto esconde lo viejo | Ordena a propósito |
| Guardar consultas solo en tu navegador | El equipo no las tiene | Vista guardada o enlace en CONTRIBUTING |
| Contar issues abiertos como métrica | Sube y baja por motivos que no controlas | Métricas de flujo (Semana 05) |

## 7. Trucos

- **La URL es la consulta**: cualquier búsqueda se comparte pegando el enlace
- **Contar sin abrir nada**:
  `gh issue list --state open --json number --jq 'length'`
- **Los que llevan más tiempo parados**:
  `gh issue list --search "is:open sort:updated-asc" --limit 10`
- **Todo lo que te involucra en toda la cuenta**:
  `gh search issues "involves:@me is:open" --limit 30`
- **Bandeja en la terminal**: la extensión `gh extension install meiji163/gh-notify`
  hace navegable lo que `gh api notifications` devuelve en crudo
- **Silenciar un hilo concreto** sin dejar de vigilar el repositorio: el botón
  *Unsubscribe* del propio issue
- **Filtrar por lo que no tiene nada**: `no:label no:assignee no:milestone` es la
  definición operativa de "sin triar"

## 📚 Recursos Adicionales

- [GitHub Docs — Searching issues and pull requests](https://docs.github.com/search-github/searching-on-github/searching-issues-and-pull-requests)
- [GitHub Docs — Managing notifications from your inbox](https://docs.github.com/account-and-profile/managing-subscriptions-and-notifications-on-github/viewing-and-triaging-notifications/managing-notifications-from-your-inbox)
- [GitHub Docs — Filtering and searching issues](https://docs.github.com/issues/tracking-your-work-with-issues/filtering-and-searching-issues-and-pull-requests)

## ✅ Checklist de Verificación

- [ ] Tienes al menos tres consultas guardadas y accesibles sin teclearlas
- [ ] Sabes sacar los issues sin triar ordenados del más viejo al más nuevo
- [ ] Has configurado el nivel de *Watch* de tu repositorio a conciencia
- [ ] Sabes filtrar la bandeja por `reason:`
- [ ] Tu `CONTRIBUTING.md` enlaza la consulta de `good first issue`
