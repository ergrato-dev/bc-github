# Libros y guías gratuitas — Semana 15

| Libro | Licencia | Capítulos para esta semana |
|-------|----------|----------------------------|
| [GraphQL — Especificación oficial](https://spec.graphql.org/) | Open Web Foundation Agreement | Las secciones *Language* y *Execution*: qué es exactamente una operación, una variable y un fragmento, sin la capa de GitHub encima |
| [Introduction to GraphQL (graphql.org — Learn)](https://graphql.org/learn/) | Creative Commons | La guía canónica del lenguaje. Léela hasta *Pagination* y tendrás el archivo 05 desde otra voz |
| [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm) | BSD | De dónde salen `edges`, `nodes`, `pageInfo` y `endCursor`. Corta, y explica por qué la paginación de GitHub tiene esa forma |
| [GitHub REST API — documentación completa](https://docs.github.com/en/rest) | Creative Commons | No es un libro, es *el* manual. La sección *Using the REST API* se lee entera en una tarde y cubre paginación, límites y buenas prácticas |
| [Manual de `jq`](https://jqlang.org/manual/) | Creative Commons | Se consulta, no se lee. Busca `to_entries`, `group_by`, `//` y `@base64d`, que son los que aparecen en todo el bootcamp |
| [GitHub CLI — Manual](https://cli.github.com/manual/) | MIT | El manual completo de `gh`, incluido `gh help formatting`, que casi nadie abre y resuelve la mitad de las dudas de salida |
| [`octokit.js` — documentación](https://github.com/octokit/octokit.js#readme) | MIT | El README es la documentación oficial del SDK: autenticación, paginación, GraphQL y plugins, con ejemplos ejecutables |
| [The Twelve-Factor App — *Config* y *Backing services*](https://12factor.net/) | Creative Commons | Dos capítulos cortos que explican por qué el token va en el entorno y nunca en el código |

## Qué leer si solo tienes una hora

La sección ***Using the REST API*** de la documentación de GitHub, entera.

Son seis páginas cortas —autenticación, paginación, límites, peticiones
condicionales, buenas prácticas y solución de problemas— y contienen
prácticamente todo lo que decide si un guion de automatización sobrevive al
segundo mes. Está escrita por quien opera la API: cuando dice «un segundo entre
escrituras», no es una recomendación de estilo.

Si te sobra media hora, la **guía de `graphql.org` hasta *Pagination***. Explica
el lenguaje sin las particularidades de GitHub, y eso hace que luego distingas
qué es GraphQL y qué es una decisión de esta plataforma — una distinción que
ahorra confusión el día que uses otra API GraphQL.

Y ten el **manual de `jq`** abierto en una pestaña toda la semana. No se lee: se
consulta veinte veces.

---

← [Volver a la Semana 15](../../README.md)
