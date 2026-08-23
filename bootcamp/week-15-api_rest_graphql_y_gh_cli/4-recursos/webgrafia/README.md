# Webgrafía — Semana 15

Todos los enlaces se comprobaron en agosto de 2026.

## Referencia (los que vas a tener abiertos)

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [REST API — Referencia completa](https://docs.github.com/en/rest) | El buscador de endpoints. Cada uno con sus parámetros, su respuesta de ejemplo y los permisos que exige |
| [GraphQL API — Referencia](https://docs.github.com/en/graphql/reference) | Objetos, mutaciones y tipos de entrada. Lento de leer, imprescindible de consultar |
| [GraphQL Explorer](https://docs.github.com/en/graphql/overview/explorer) | Autocompletado sobre el esquema real y panel de variables. Media hora aquí ahorra un día de prueba y error |
| [`gh api` — manual](https://cli.github.com/manual/gh_api) | Los diez flags de la semana, con el detalle de `-f` frente a `-F` |
| [`gh help formatting`](https://cli.github.com/manual/gh_help_formatting) | Las funciones de `--template`: `tablerow`, `tablerender`, `timeago`, `color` |

## Elegir y usar cada API

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Comparing GitHub's REST API and GraphQL API](https://docs.github.com/en/rest/about-the-rest-api/comparing-githubs-rest-api-and-graphql-api) | La página oficial que dice cuándo cada una, sin vender ninguna |
| [Migrating from REST to GraphQL](https://docs.github.com/en/graphql/guides/migrating-from-rest-to-graphql) | Traduce patrones concretos: lo que en REST son N llamadas, aquí es una consulta |
| [Forming calls with GraphQL](https://docs.github.com/en/graphql/guides/forming-calls-with-graphql) | Variables, alias, fragmentos y mutaciones, con ejemplos ejecutables |
| [Using global node IDs](https://docs.github.com/en/graphql/guides/using-global-node-ids) | Por qué las mutaciones piden `node_id` y cómo conseguirlo desde REST |
| [Using pagination in the REST API](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api) | La cabecera `Link` explicada, que es lo que `--paginate` sigue por debajo |
| [Paginating with the GraphQL API](https://docs.github.com/en/graphql/guides/using-pagination-in-the-graphql-api) | Cursores, `pageInfo` y por qué no se pueden guardar para mañana |

## Límites y buenas maneras

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Rate limits for the REST API](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api) | Los cupos por tipo de token, incluido el del `GITHUB_TOKEN` de Actions |
| [Best practices for using the REST API](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api) | La lista corta: peticiones condicionales, sin concurrencia, un segundo entre escrituras |
| [Resource limitations (GraphQL)](https://docs.github.com/en/graphql/overview/resource-limitations) | La fórmula del coste, el límite de nodos y por qué tu consulta gigante falla |
| [Troubleshooting rate limit errors](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api#rate-limit-errors) | Cómo distinguir el límite primario del secundario cuando los dos son un `403` |

## Octokit y automatización

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [`octokit.js`](https://github.com/octokit/octokit.js) | El README es la documentación: paginación, GraphQL, autenticación y plugins |
| [Scripting with the REST API and JavaScript](https://docs.github.com/en/rest/guides/scripting-with-the-rest-api-and-javascript) | Guía oficial paso a paso, con el mismo enfoque que la Práctica 03 |
| [`@octokit/plugin-throttling`](https://github.com/octokit/plugin-throttling.js) | Los dos manejadores (`onRateLimit`, `onSecondaryRateLimit`) y qué devolver en cada uno |
| [`actions/github-script`](https://github.com/actions/github-script) | Octokit dentro de un workflow sin instalar nada. Ideal por debajo de veinte líneas |
| [Job summaries](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/add-job-summaries) | Dónde dejar el informe para que se vea sin descargar nada |

## Extensiones de `gh`

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Creating GitHub CLI extensions](https://docs.github.com/en/github-cli/github-cli/creating-github-cli-extensions) | El contrato completo y el flujo de publicación |
| [Using GitHub CLI extensions](https://docs.github.com/en/github-cli/github-cli/using-github-cli-extensions) | Instalar, fijar versión, actualizar y quitar |
| [`cli/gh-extension-precompile`](https://github.com/cli/gh-extension-precompile) | La action que compila para todas las plataformas y adjunta los binarios al release |
| [Topic `gh-extension`](https://github.com/topics/gh-extension) | El catálogo. Léete dos o tres antes de escribir la tuya: son cien líneas cada una |

## Herramientas

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Manual de `jq`](https://jqlang.org/manual/) | La referencia. Busca `to_entries`, `group_by` y `//` (valor por defecto) |
| [jq play](https://jqplay.org/) | Probar un filtro contra un JSON pegado, sin gastar peticiones |
| [GitHub Changelog](https://github.blog/changelog/) | Dónde se anuncian los endpoints nuevos y las deprecaciones, antes de que te enteres por un `410` |

---

← [Volver a la Semana 15](../../README.md)
