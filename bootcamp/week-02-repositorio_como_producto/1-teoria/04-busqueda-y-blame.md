# Búsqueda de código, `blame` e historia

> Saber buscar en GitHub es una habilidad de plataforma. La mayoría de la gente
> usa `Ctrl+F` en un archivo; la búsqueda real cubre millones de repositorios.

## 🎯 Objetivos

- Escribir queries de búsqueda de código con calificadores
- Usar `blame` para saber por qué existe una línea, no solo quién la escribió
- Rastrear la historia de un archivo, una función o un texto
- Aplicar la búsqueda a auditorías reales sobre varios repositorios

## 1. Qué problema resuelve

Dos preguntas que aparecen todas las semanas:

- "¿Cómo usa la gente esta librería en proyectos reales?"
- "¿Por qué está esta línea aquí y quién decidió esto?"

La primera la responde la búsqueda de código; la segunda, `blame` con la
historia. Las dos ahorran horas y evitan romper cosas por no saber su origen.

## 2. Búsqueda de código

Calificadores que se usan a diario:

| Calificador | Ejemplo | Qué hace |
|-------------|---------|----------|
| `repo:` | `repo:ergrato-dev/bc-github` | Un repositorio |
| `org:` / `user:` | `org:vercel` | Toda una organización |
| `path:` | `path:.github/workflows` | Solo en esa ruta |
| `language:` | `language:yaml` | Por lenguaje detectado |
| `symbol:` | `symbol:calcularMulta` | Definición del símbolo, no menciones |
| `content:` | `content:TODO` | Solo en el contenido |
| `is:archived` | `org:x is:archived` | Filtra archivados |
| `NOT` | `permissions NOT read-all` | Excluye |
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

> [!TIP]
> La búsqueda de código indexa la **rama por defecto**. Si algo está en otra
> rama, no aparece.

## 3. Búsqueda de issues y PRs

```
is:pr is:open review-requested:@me
is:issue is:open no:assignee label:bug sort:created-asc
is:pr is:merged merged:>2026-01-01 author:@me
repo:owner/repo is:pr base:main is:merged sort:updated-desc
```

| Calificador | Uso |
|-------------|-----|
| `is:` | `pr`, `issue`, `open`, `closed`, `merged`, `draft` |
| `author:` `assignee:` `mentions:` | Personas. `@me` funciona |
| `review-requested:` `reviewed-by:` | Revisión |
| `label:` `milestone:` `project:` | Clasificación |
| `created:` `updated:` `closed:` `merged:` | Fechas: `>2026-01-01`, `2026-01-01..2026-03-01` |
| `no:` | `no:label`, `no:assignee`, `no:milestone` |
| `sort:` | `created-asc`, `updated-desc`, `comments-desc`, `reactions-+1-desc` |

Desde la terminal:

```bash
gh search code 'org:ergrato-dev pull_request_target' --limit 20
gh search issues 'is:open label:bug' --repo OWNER/REPO
gh search prs --review-requested=@me --state=open
```

## 4. `blame`: por qué existe esta línea

`blame` no sirve para buscar culpables, sino contexto: qué PR introdujo la línea
y qué issue lo motivó.

```bash
git blame src/index.js
git blame -L 10,20 src/index.js        # solo un rango
git blame -w src/index.js              # ignora cambios de espacios
git blame -C src/index.js              # detecta código movido de otro archivo
```

En la web: botón `Blame`, y desde ahí el icono de las flechas retrocede a la
versión **anterior** a ese cambio. Encadenándolo llegas al commit original de una
línea que se ha reformateado cinco veces.

### Ignorar reformateos masivos

Un `prettier` sobre todo el repo destroza el `blame`. Solución:

```bash
# .git-blame-ignore-revs
# Formateo con prettier, sin cambios funcionales
a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0
```

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

GitHub lee ese archivo **automáticamente** si está en la raíz.

## 5. Historia

```bash
# Todos los commits que tocaron un archivo, incluso renombrado
git log --follow -- src/index.js

# En qué commit apareció o desapareció un texto (pickaxe)
git log -S "calcularMulta" --oneline

# Igual, pero con expresión regular sobre el diff
git log -G "calcular.*Multa" --oneline

# La historia de una función concreta
git log -L :calcularMulta:src/index.js

# Quién ha tocado más un archivo
git shortlog -sn -- src/index.js
```

En la web: el botón `History` de un archivo, y `Compare` para el diff entre dos
puntos cualesquiera: `github.com/OWNER/REPO/compare/v1.0...main`.

## 6. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Clonar un repo para buscar una cadena | Minutos por algo de dos segundos | Búsqueda de código con `repo:` |
| Usar `blame` para señalar personas | Envenena al equipo y no resuelve nada | Busca el PR y el porqué |
| Reformatear sin `.git-blame-ignore-revs` | Rompes el `blame` de todo el repo | Añade el SHA al archivo |
| Buscar sin `path:` ni `language:` | Miles de falsos positivos | Acota siempre |
| `git log` plano para rastrear un cambio | No encuentras cuándo entró | `-S` o `-L` |

## 7. Trucos

- **Buscar dentro de un repo sin salir**: pulsa `s` o `/` en la página del repo
- **Ver el `blame` desde el propio archivo**: pulsa `b`
- **Saltar a la definición de un símbolo**: haz clic en él (GitHub indexa
  símbolos en los lenguajes soportados)
- **Comparar dos puntos cualesquiera**: `/compare/v1.0...main` en la URL
- **Los tres puntos importan**: `a...b` compara desde el ancestro común;
  `a..b` compara punta contra punta
- **Auditar toda una organización**:
  ```bash
  gh search code 'org:tu-org path:.github/workflows permissions' --json repository --jq '.[].repository.nameWithOwner' | sort -u
  ```
- **Buscar en los commits, no en el código**: `gh search commits 'fix: memoria' --repo OWNER/REPO`

## 📚 Recursos Adicionales

- [GitHub Docs — Understanding GitHub Code Search syntax](https://docs.github.com/search-github/github-code-search/understanding-github-code-search-syntax)
- [GitHub Docs — Searching issues and pull requests](https://docs.github.com/search-github/searching-on-github/searching-issues-and-pull-requests)
- [`git blame` — documentación](https://git-scm.com/docs/git-blame)

## ✅ Checklist de Verificación

- [ ] Sabes buscar una cadena en toda una organización, acotando por ruta
- [ ] Has usado `blame` para llegar al PR que originó una línea
- [ ] Sabes qué hace `git log -S` y en qué se diferencia de `-G`
- [ ] Entiendes la diferencia entre `a..b` y `a...b`
