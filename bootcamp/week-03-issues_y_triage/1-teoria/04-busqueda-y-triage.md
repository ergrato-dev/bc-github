# Búsqueda y triage

> El triage no es "leer los issues nuevos": es un proceso con reglas, que se
> puede hacer en veinte minutos a la semana si tienes las queries correctas.

## 🎯 Objetivos

- Escribir queries de issues que aíslen exactamente lo que buscas
- Ejecutar una sesión de triage con criterios explícitos
- Usar respuestas guardadas para lo repetitivo
- Automatizar la parte mecánica sin automatizar la decisión

## 1. Qué problema resuelve

La bandeja de issues crece más rápido de lo que se vacía. Sin proceso, pasa una
de dos cosas: o se ignoran (y la gente deja de reportar), o se responden en
caliente sin criterio (y el backlog se llena de cosas que nadie va a hacer).

El triage separa las dos decisiones que importan: **¿es válido?** y **¿lo vamos
a hacer?**

## 2. Sintaxis de búsqueda

| Calificador | Valores | Ejemplo |
|-------------|---------|---------|
| `is:` | `issue`, `pr`, `open`, `closed`, `merged`, `draft` | `is:issue is:open` |
| `no:` | `label`, `assignee`, `milestone`, `project` | `no:assignee` |
| `label:` | Nombre exacto (comillas si lleva espacios) | `label:"type:bug"` |
| `-label:` | Excluye | `-label:"status:triage"` |
| `author:` `assignee:` `mentions:` `commenter:` | Usuario o `@me` | `assignee:@me` |
| `created:` `updated:` `closed:` | `>`, `<`, rangos | `created:>2026-06-01` |
| `comments:` `reactions:` | Números y rangos | `comments:>10` |
| `sort:` | `created-asc/desc`, `updated-*`, `comments-*`, `reactions-+1-desc` | `sort:reactions-+1-desc` |
| `involves:` | Autor, asignado, comentarista o mencionado | `involves:@me` |
| `linked:pr` | Issues con PR vinculado | `is:open linked:pr` |

### Queries que se usan de verdad

```
# Sin triar: el punto de partida de cada sesión
is:issue is:open no:label sort:created-asc

# Abandonados: abiertos, sin actividad en 60 días
is:issue is:open updated:<2026-06-17

# Lo que la gente pide más
is:issue is:open sort:reactions-+1-desc

# Ya hay alguien trabajando: no lo toques
is:issue is:open linked:pr

# Listo para que entre alguien nuevo
is:issue is:open label:"good first issue" no:assignee

# Lo mío
is:open involves:@me
```

Desde la terminal:

```bash
gh issue list --search "is:open no:label sort:created-asc" --limit 20
gh search issues "is:open label:bug" --owner ergrato-dev --limit 30
```

## 3. El proceso de triage

Cuatro preguntas, en orden. En cuanto una falla, se para.

```
1. ¿Se entiende?     → no: pedir información, label status:necesita-info
2. ¿Es válido?       → no: cerrar como not planned (duplicado, fuera de alcance)
3. ¿Qué es?          → labels de tipo y área
4. ¿Cuándo?          → prioridad + milestone, o backlog
```

Reglas que evitan discusiones:

- **Duplicado**: se cierra el más nuevo, enlazando al viejo. La discusión vive en
  uno solo.
- **Sin respuesta 14 días** tras pedir información: se cierra como *not planned*,
  invitando a reabrir con los datos.
- **Nadie lo va a hacer**: se cierra. Un backlog honesto vale más que uno largo.

Tiempo objetivo: **menos de 2 minutos por issue**. Si tardas más, el issue está
mal escrito o la decisión no es de triage.

## 4. Respuestas guardadas

Las mismas cuatro respuestas se escriben mil veces. `Settings → Saved replies`, y
se insertan con `Ctrl` + `.`.

Las que valen la pena tener:

- **Falta información**: qué datos concretos hacen falta
- **Duplicado**: enlace al original + por qué se cierra este
- **Fuera de alcance**: qué sí cubre el proyecto
- **Bienvenida a primera contribución**: enlace a CONTRIBUTING

Son globales de tu cuenta, no del repositorio: las escribes una vez y sirven en
todos.

## 5. Qué automatizar y qué no

| Automatizable | Manual |
|---------------|--------|
| Etiquetar por ruta modificada | Decidir prioridad |
| Añadir al Project | Decidir si es duplicado |
| Marcar como stale a los 60 días | Cerrar algo que alguien pidió |
| Pedir información con plantilla | Valorar si la información recibida basta |
| Agradecer la primera contribución | Responder a un caso ambiguo |

> [!WARNING]
> Cerrar issues automáticamente por inactividad es la automatización que más
> comunidad ha destruido en open source. Si la usas, que avise antes, que dé
> plazo largo (60-90 días) y que nunca toque los que ya están priorizados.

En la Semana 16 construirás un bot de triage; el criterio de qué delegarle se
decide ahora.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Triar por la vista por defecto | Siempre ves los mismos de arriba | Query `no:label sort:created-asc` |
| Dejar issues sin responder semanas | La gente deja de reportar | Sesión fija semanal |
| Responder sin etiquetar | El issue vuelve a estar sin clasificar | Responder y etiquetar en el mismo gesto |
| Backlog infinito "por si acaso" | Esconde lo que sí importa | Cierra lo que no vas a hacer |
| Bot de stale agresivo | Cierra cosas importantes y quema a la comunidad | Plazos largos y excepciones por label |
| Prioridad decidida por quien grita más | El backlog deja de reflejar valor | Criterio escrito en CONTRIBUTING |

## 7. Trucos

- **Guarda las queries como marcadores**: la URL de una búsqueda es
  compartible. Un marcador "triage pendiente" ahorra teclear cada vez
- **Filtro rápido en la UI**: escribe `label:` y el autocompletado ofrece las
  existentes; con familias prefijadas es instantáneo
- **Cerrar como *not planned* desde la terminal**:
  ```bash
  gh issue close 42 --reason "not planned" --comment "Duplicado de #12"
  ```
- **Ver todo el hilo sin abrir el navegador**: `gh issue view 42 --comments`
- **Issues que llevan mucho parados**:
  ```bash
  gh issue list --search "is:open updated:<$(date -d '60 days ago' +%Y-%m-%d)" --limit 50
  ```
- **Reacciones como señal de demanda**: `sort:reactions-+1-desc` es la forma más
  honesta de saber qué quiere la gente, mejor que el volumen de comentarios
- **Contar sin abrir nada**: `gh issue list --state open --json number --jq 'length'`

## 📚 Recursos Adicionales

- [GitHub Docs — Searching issues and pull requests](https://docs.github.com/search-github/searching-on-github/searching-issues-and-pull-requests)
- [GitHub Docs — Saved replies](https://docs.github.com/get-started/writing-on-github/working-with-saved-replies/about-saved-replies)
- [Open Source Guides — Best practices for maintainers](https://opensource.guide/best-practices/)

## ✅ Checklist de Verificación

- [ ] Tienes al menos tres queries guardadas como marcador
- [ ] Sabes cerrar como *not planned* y por qué importa
- [ ] Tienes al menos dos respuestas guardadas
- [ ] Puedes triar un issue en menos de dos minutos
