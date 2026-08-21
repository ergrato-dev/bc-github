# Búsqueda de código, issues y PRs

> Saber buscar en GitHub es una habilidad de plataforma. La mayoría de la gente
> usa `Ctrl+F` en un archivo; la búsqueda real cubre millones de repositorios y
> convierte una auditoría en una línea de texto.

## 🎯 Objetivos

- Escribir queries de búsqueda de código con calificadores y expresiones regulares
- Filtrar issues y PRs con la sintaxis completa, no solo con los botones
- Buscar desde la terminal con `gh search`
- Conocer los límites del índice: qué **no** vas a encontrar nunca
- Convertir una búsqueda en una auditoría de toda una organización

## 1. Qué problema resuelve

Dos preguntas que aparecen todas las semanas:

- "¿Cómo usa la gente esta librería en proyectos reales?"
- "¿En cuántos de nuestros repositorios hemos hecho esta barbaridad?"

La primera la responde la búsqueda de código de GitHub, que indexa el código
público y el tuyo. La segunda la responde la misma búsqueda con `org:`, y es la
forma más barata que existe de auditar una organización entera.

## 2. Búsqueda de código

| Calificador | Ejemplo | Qué hace |
|-------------|---------|----------|
| `repo:` | `repo:ergrato-dev/bc-github` | Un repositorio |
| `org:` / `user:` | `org:vercel` | Toda una organización o cuenta |
| `path:` | `path:.github/workflows` | Solo en esa ruta |
| `language:` | `language:yaml` | Por lenguaje detectado |
| `symbol:` | `symbol:calcularMulta` | La **definición** del símbolo, no las menciones |
| `content:` | `content:TODO` | Solo en el contenido, ignorando rutas |
| `is:archived` / `is:fork` | `org:x is:archived` | Filtra archivados y forks |
| `NOT`, `AND`, `OR` | `permissions NOT read-all` | Lógica booleana |
| `"…"` | `"pull_request_target"` | Frase exacta |
| `/regex/` | `/permissions:\s*write-all/` | Expresión regular |

```
org:ergrato-dev path:.github/workflows content:pull_request_target
```

Encuentra en segundos todos los workflows potencialmente peligrosos de una
organización. Es una auditoría de seguridad escrita en una línea.

```
language:yaml path:.github/workflows /uses:\s*actions\/checkout@v[123]/
```

Todas las actions desactualizadas.

### Lo que el índice no ve

Esto ahorra media hora de desconcierto:

- Solo se indexa la **rama por defecto**. Lo que esté en otra rama no aparece
- Los **forks** no se indexan salvo que tengan más estrellas que el original
- Los archivos muy grandes y algunos binarios quedan fuera
- Se busca sobre el **estado actual**, no sobre la historia: para "cuándo entró
  esto" está la [Teoría 07](07-blame-e-historia.md)
- La búsqueda de código exige estar autenticado

> [!TIP]
> `symbol:` es el calificador más infravalorado: `symbol:calcularMulta` te lleva a
> la definición y se salta las cien llamadas. Funciona en los lenguajes que GitHub
> indexa con su analizador de símbolos.

## 3. Búsqueda de issues y PRs

```
is:pr is:open review-requested:@me
is:issue is:open no:assignee label:bug sort:created-asc
is:pr is:merged merged:>2026-01-01 author:@me
repo:owner/repo is:pr base:main is:merged sort:updated-desc
is:issue is:open comments:>10 reactions:>5
```

| Calificador | Uso |
|-------------|-----|
| `is:` | `pr`, `issue`, `open`, `closed`, `merged`, `draft`, `locked` |
| `author:` `assignee:` `mentions:` `commenter:` | Personas. `@me` funciona en todos |
| `review-requested:` `reviewed-by:` `review:` | Revisión (`review:required`, `review:approved`) |
| `label:` `milestone:` `project:` | Clasificación (varios `label:` se combinan con Y) |
| `created:` `updated:` `closed:` `merged:` | Fechas: `>2026-01-01`, `2026-01-01..2026-03-01` |
| `no:` | `no:label`, `no:assignee`, `no:milestone`, `no:project` |
| `comments:` `reactions:` `interactions:` | Números: `>10`, `<3`, `5..20` |
| `head:` `base:` | Ramas de un PR |
| `status:` | `success`, `failure`, `pending` — el estado del CI |
| `sort:` | `created-asc`, `updated-desc`, `comments-desc`, `reactions-+1-desc` |

Estas consultas son la materia prima de las Semanas 03 y 05: un triaje es una
consulta guardada, y una métrica es una consulta con fechas.

## 4. Desde la terminal

```bash
gh search code 'org:ergrato-dev pull_request_target' --limit 20
gh search code 'path:.github/workflows permissions' --owner ergrato-dev \
  --json repository,path --jq '.[] | "\(.repository.nameWithOwner) \(.path)"'

gh search issues 'is:open label:bug' --repo OWNER/REPO
gh search prs --review-requested=@me --state=open
gh search commits 'fix: memoria' --repo OWNER/REPO
gh search repos --topic bootcamp --language typescript --sort stars
```

Y contra la API, cuando quieras el JSON crudo:

```bash
gh api '/search/issues?q=repo:{owner}/{repo}+is:pr+is:merged&per_page=100' \
  --jq '.total_count'
```

Dos cosas que conviene tener presentes en scripts:

- La API de búsqueda tiene su **propio límite** de peticiones, mucho más bajo que
  el resto: del orden de 30 por minuto autenticado. Un bucle sin pausa se bloquea
- El endpoint REST `/search/code` usa el motor antiguo y **exige acotar** por
  repositorio, usuario u organización; la búsqueda de la interfaz es más potente

## 5. Guardar lo que repites

- **Bookmarks de búsquedas**: la URL de una búsqueda es la búsqueda. Guárdala
- **Filtros guardados en la barra de issues**: `Settings` de la lista → guardar la
  consulta con nombre
- **Alias de `gh`** para lo que consultas a diario:
  ```bash
  gh alias set revisar 'search prs --review-requested=@me --state=open'
  ```

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Clonar un repositorio para buscar una cadena | Minutos para algo de dos segundos | Búsqueda con `repo:` |
| Buscar sin `path:` ni `language:` | Miles de falsos positivos | Acota siempre |
| Suponer que la búsqueda ve todas las ramas | Solo indexa la rama por defecto | Cambia la rama por defecto o clona |
| Usar la búsqueda para saber cuándo entró algo | El índice es del estado actual | `git log -S` (Semana 01) |
| Bucle de `gh search` sin pausa | Te bloquea el límite de la API de búsqueda | Menos consultas, más `--limit` |
| Revisar la seguridad repo a repo | No escala pasados tres repositorios | Una consulta `org:` |
| Filtrar issues a mano por la interfaz | Irrepetible y lento | Consulta guardada o alias de `gh` |

## 7. Trucos

- **Buscar dentro del repositorio que estás mirando**: pulsa `s` o `/`
- **Auditar toda una organización en una línea**:
  ```bash
  gh search code 'org:tu-org path:.github/workflows permissions' \
    --json repository --jq '.[].repository.nameWithOwner' | sort -u
  ```
- **Encontrar repos abandonados**: `org:tu-org pushed:<2025-01-01` en la búsqueda
  de repositorios
- **Ver quién te espera**: `is:pr is:open review-requested:@me` como página de
  inicio del navegador
- **Los PRs que abriste y siguen abiertos**: `is:pr is:open author:@me`
- **Buscar en los commits, no en el código**:
  `gh search commits 'revert' --repo OWNER/REPO`
- **Regex en la interfaz**: se escribe entre barras, `/…/`, y respeta el resto de
  calificadores

## 📚 Recursos Adicionales

- [GitHub Docs — Understanding GitHub Code Search syntax](https://docs.github.com/search-github/github-code-search/understanding-github-code-search-syntax)
- [GitHub Docs — Searching issues and pull requests](https://docs.github.com/search-github/searching-on-github/searching-issues-and-pull-requests)
- [GitHub Docs — Rate limits](https://docs.github.com/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- [Manual de `gh search`](https://cli.github.com/manual/gh_search)

## ✅ Checklist de Verificación

- [ ] Sabes buscar una cadena en toda una organización, acotando por ruta
- [ ] Has usado una expresión regular en la búsqueda de código
- [ ] Conoces tres calificadores de issues que no sean `is:` ni `label:`
- [ ] Sabes por qué algo que existe en una rama no aparece en la búsqueda
- [ ] Tienes al menos una búsqueda guardada o un alias de `gh search`
