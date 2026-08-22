# Videografía — Semana 09

Todos los enlaces se comprobaron en agosto de 2026.

## Primer contacto

| Recurso | Autor | Por qué vale la pena |
|---------|-------|----------------------|
| [How to use GitHub Actions \| GitHub for Beginners](https://www.youtube.com/watch?v=BQrohJ3PT7I) | GitHub | La versión oficial: workflow, job, step y evento, sin rodeos |
| [Introduction to GitHub Actions — Part 1: Your First Workflow](https://www.youtube.com/watch?v=ljINpvCvHnQ) | Mickey Gousset | Serie larga y ordenada; si te enganchas, las partes siguientes cubren media semana |
| [Complete GitHub Actions Course — From Beginner to Pro](https://www.youtube.com/watch?v=Xwpi0ITkL3U) | DevOps Directive | El curso entero de un tirón. Útil como repaso después de las prácticas, no antes |

## Pull requests y eventos

| Recurso | Autor | Por qué vale la pena |
|---------|-------|----------------------|
| [Run a Workflow Against a Pull Request](https://www.youtube.com/watch?v=ClLKbB_59Ec) | Mickey Gousset | El caso concreto de la Práctica 01 |
| [How to Run GitHub Actions on Forks — pull_request_target](https://www.youtube.com/watch?v=cz9SOKCzNzQ) | bdougie (GitHub) | El porqué del evento, contado por alguien de GitHub. Míralo **junto** a la teoría 04, no en su lugar |

## Matrices

| Recurso | Autor | Por qué vale la pena |
|---------|-------|----------------------|
| [Mastering Matrix Jobs in GitHub Actions](https://www.youtube.com/watch?v=Ijz_6vPa8RI) | Mickey Gousset | Matrices de varias dimensiones con el grafo del run a la vista |
| [How to Include and Exclude Matrix configuration](https://www.youtube.com/watch?v=tVZN1aRBu78) | DevOps Hint | Los dos comportamientos de `include`, que es lo que más confunde |
| [Matrix Strategy: Run Jobs Faster & Smarter](https://www.youtube.com/watch?v=FSQDtRMtSHo) | Techi Nik | `fail-fast` y `max-parallel` con criterio |

## Artifacts y caché

| Recurso | Autor | Por qué vale la pena |
|---------|-------|----------------------|
| [Artifacts & Caching Explained](https://www.youtube.com/watch?v=tw9e61Bct-E) | Cloud With VarJosh | Los dos comparados en el mismo pipeline, que es como se entiende la diferencia |
| [Caching Dependencies to Speed Up Workflows](https://www.youtube.com/watch?v=BDQivAobxKA) | CoderDave | La `key` y las `restore-keys` explicadas despacio |
| [GitHub Actions Cache FAILS — Don't Make This Mistake](https://www.youtube.com/watch?v=CwqKtNpY_58) | Techi Nik | Por qué tu caché no acierta. Es el vídeo que ahorra la tarde |
| [Cache Management with GitHub Actions](https://www.youtube.com/watch?v=7PVUjRXUY0o) | Mickey Gousset | Ver, medir y borrar cachés — la parte operativa |
| [Uploading artifacts in a workflow](https://www.youtube.com/watch?v=eeXquypcZxM) | Microsoft DevRadio | Corto y al grano, para el paso 6 de la Práctica 03 |

## Seguridad

| Recurso | Autor | Por qué vale la pena |
|---------|-------|----------------------|
| [Limit workflow runs & control permissions for GITHUB_TOKEN](https://www.youtube.com/watch?v=JMHs5lYpvAM) | GitHub | `permissions` explicado por quien lo diseñó |
| [GitHub Actions vulnerability, or "why bug bounties are a scam"](https://www.youtube.com/watch?v=_fpXyS_i1xE) | anthonywritescode | Una vulnerabilidad real de Actions, encontrada y explicada paso a paso. **El vídeo de la semana si solo ves uno** |

## Cómo verlos

1. Míralo una vez sin tocar el teclado.
2. Haz la práctica correspondiente.
3. Vuelve solo al minuto donde te atascaste.

> [!NOTE]
> Actions cambia rápido: en junio de 2026, sin ir más lejos, `actions/checkout`
> cambió su comportamiento por defecto ante `pull_request_target`. Un vídeo de
> hace dos años puede seguir siendo correcto en los conceptos y estar desfasado
> en los detalles. La fuente de verdad es la
> [webgrafía](../webgrafia/README.md).
>
> Si un enlace se rompe, [abre un issue](https://github.com/ergrato-dev/bc-github/issues)
> proponiendo el reemplazo.

---

← [Volver a la Semana 09](../../README.md)
