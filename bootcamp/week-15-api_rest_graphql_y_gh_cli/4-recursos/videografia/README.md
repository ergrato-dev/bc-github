# Videografía — Semana 15

Todos los enlaces se comprobaron en agosto de 2026. El canal y la fecha aparecen
en la propia página del vídeo.

## La línea de comandos como cliente de la API

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Take GitHub to the command line — GitHub CLI](https://www.youtube.com/watch?v=Somvl-qh2dk) | Presentación de `gh` por quien lo construyó, con la parte que importa aquí: usar la API para guionizar issues, PRs, checks y releases |
| [Customise GitHub from the CLI: Create your own commands](https://www.youtube.com/watch?v=bfKRziEMMx0) | El camino de la Práctica 04 en vídeo: de los alias a una extensión propia |
| [Finding extensions for the GitHub CLI](https://www.youtube.com/watch?v=uygPDcXztw0) | Corto y práctico: cómo se busca e instala lo que ya existe antes de escribir lo tuyo |
| [Open Source Friday with GitHub CLI!](https://www.youtube.com/watch?v=0G9DP0oa9i0) | Conversación con el equipo de `gh`: qué entra en el core y qué esperan que sea una extensión |

## GraphQL

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Implementing and Using GraphQL at GitHub — Universe 2016](https://www.youtube.com/watch?v=wPPFhcqGcvk) | Por qué GitHub añadió una segunda API en vez de versionar la primera. Explica decisiones que sigues notando hoy |
| [Advanced patterns for GitHub's GraphQL API](https://www.youtube.com/watch?v=i5pIszu9MeM) | Fragmentos, alias, paginación por cursores y coste: los cuatro temas del archivo 05, con ejemplos reales |
| [Using GitHub's GraphQL API to manage open source projects — Universe 2017](https://www.youtube.com/watch?v=SQImqxe7WfY) | Consultas de mantenimiento sobre proyectos grandes; la misma idea que tu guion de auditoría, a otra escala |
| [GitHub's GraphQL API to effectively track the health of projects and communities](https://www.youtube.com/watch?v=_YkwDnstjVs) | Métricas de salud de un repositorio en una consulta. Buena fuente de reglas para el Paso 4 de la Práctica 03 |

## Octokit y automatización

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [GitHub Automation with Octokit (con Gregor Martynus) — Learn With Jason](https://www.youtube.com/watch?v=H1TupRbbjSI) | Sesión larga con el mantenedor de Octokit: autenticación, paginación y plugins, escribiendo código en directo |
| [Open Source Friday with Octokit — los SDK de GitHub](https://www.youtube.com/watch?v=qP4h7GP5kfM) | Panorámica de los SDK por lenguaje; útil para saber qué existe cuando el guion no es JavaScript |
| [Open Source automation and maintenance with bots & Octokit](https://www.youtube.com/watch?v=HLhN2MxgWEM) | El salto de «guion que corre solo» a «bot», que es exactamente la Semana 16 |

## Extensiones, paso a paso

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Building a GitHub CLI extension in Go (Parte 1)](https://www.youtube.com/watch?v=sXa6UI8xyRg) | Serie en directo construyendo una extensión precompilada desde cero. Míralo si tu extensión va a salir de bash |
| [Building a GitHub CLI extension in Go (Parte final)](https://www.youtube.com/watch?v=lttOcyu2B7Q) | El cierre: publicación, releases por plataforma y mantenimiento |

## Cómo verlos

1. **Take GitHub to the command line**, antes de la Práctica 01. Sitúa `gh` como
   cliente de la API y no como una interfaz alternativa.
2. **Advanced patterns for GitHub's GraphQL API**, entre la teoría 05 y la
   Práctica 02. Es el que más rendimiento da de la lista.
3. **GitHub Automation with Octokit**, antes de la Práctica 03, si nunca has
   usado el SDK. Si ya lo has usado, sáltatelo y ve al código.
4. **Customise GitHub from the CLI**, antes de la Práctica 04.
5. La serie en **Go** solo si vas a precompilar. Para una extensión en bash no
   hace falta nada de eso.

> [!NOTE]
> Los vídeos de antes de 2023 usan la interfaz antigua y, en algún caso, `hub` en
> vez de `gh`. Los conceptos siguen en pie; los comandos, compruébalos contra
> [cli.github.com/manual](https://cli.github.com/manual/).
>
> Si un enlace se rompe, [abre un issue](https://github.com/ergrato-dev/bc-github/issues)
> proponiendo el reemplazo.

---

← [Volver a la Semana 15](../../README.md)
