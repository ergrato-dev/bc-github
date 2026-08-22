# Webgrafía — Semana 10

Todos los enlaces se comprobaron en agosto de 2026.

## Referencia (los que vas a tener abiertos)

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Metadata syntax for GitHub Actions](https://docs.github.com/actions/reference/workflows-and-actions/metadata-syntax) | La referencia del `action.yml`: `inputs`, `outputs`, `runs`, `branding`, `deprecationMessage` |
| [Reuse workflows](https://docs.github.com/actions/how-tos/reuse-automations/reuse-workflows) | `workflow_call` de punta a punta, con los límites documentados |
| [Workflow syntax — `jobs.<job_id>.uses`](https://docs.github.com/actions/reference/workflows-and-actions/workflow-syntax) | Qué claves admite un job que llama a un reusable workflow |
| [Contexts](https://docs.github.com/actions/reference/workflows-and-actions/contexts) | Dónde está disponible cada contexto — incluida la nota de que `secrets` no existe en composite actions |

## Crear actions

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Create a composite action](https://docs.github.com/actions/tutorials/create-actions/create-a-composite-action) | El tutorial oficial, corto y suficiente |
| [Create a JavaScript action](https://docs.github.com/actions/tutorials/create-actions/create-a-javascript-action) | Con el toolkit y con el empaquetado explicado |
| [Create a Docker container action](https://docs.github.com/actions/tutorials/create-actions/create-a-docker-container-action) | Entrypoint, args y el montaje de `/github/workspace` |
| [`actions/toolkit`](https://github.com/actions/toolkit) | `core`, `github`, `exec`, `cache`: el código que usan casi todas las actions del Marketplace |
| [`@vercel/ncc`](https://github.com/vercel/ncc) | El empaquetador estándar para el `dist/` |

## Publicar y compartir

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Publish an action in GitHub Marketplace](https://docs.github.com/actions/how-tos/create-and-publish-actions/publish-in-github-marketplace) | Los requisitos exactos, que es lo que se olvida |
| [Release and maintain actions](https://docs.github.com/actions/how-tos/create-and-publish-actions/manage-custom-actions) | Convención de tags y mantenimiento a largo plazo |
| [Create starter workflows](https://docs.github.com/actions/how-tos/reuse-automations/create-workflow-templates) | `workflow-templates/` y su `.properties.json` |
| [Share actions and workflows from private repositories](https://docs.github.com/actions/how-tos/reuse-automations/share-across-private-repositories) | El ajuste de acceso que hace falta y que nadie encuentra |

## Ejemplos que merece la pena leer

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [`actions/checkout`](https://github.com/actions/checkout) | La action más usada del mundo: mira su `action.yml`, su README y su esquema de tags |
| [`actions/setup-node`](https://github.com/actions/setup-node) | Un caso claro de action con `post` y con caché |
| [`actions/cache`](https://github.com/actions/cache) | Para entender qué hace un `post` de verdad |
| [`actions/starter-workflows`](https://github.com/actions/starter-workflows) | El repositorio del que salen las plantillas que ves al crear un workflow |

## Cómo usar esta lista

La referencia de `metadata-syntax` es la que se consulta a diario; los tutoriales
se leen una vez. Y los tres repositorios de ejemplo enseñan más sobre cómo se
escribe una action de verdad que cualquier artículo: están mantenidos, tienen
tests y su README es exactamente el que se espera de una action publicada.

---

← [Volver a la Semana 10](../../README.md)
