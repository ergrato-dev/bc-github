# Webgrafía — Semana 11

Todos los enlaces se comprobaron en agosto de 2026.

## Referencia (los que vas a tener abiertos)

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Security hardening for GitHub Actions](https://docs.github.com/actions/reference/security/secure-use) | La página que resume todo el temario de la semana; se relee cada seis meses |
| [OIDC reference](https://docs.github.com/actions/reference/security/oidc) | La lista completa de claims y la personalización del `sub` |
| [REST — Actions permissions](https://docs.github.com/rest/actions/permissions) | Los cuatro endpoints de política del repositorio, con sus campos exactos |
| [REST — Deployments](https://docs.github.com/rest/deployments/deployments) | La historia de despliegues, que es la evidencia de que el pipeline funcionó |
| [GitHub-hosted runners](https://docs.github.com/actions/reference/runners/github-hosted-runners) | Especificaciones y etiquetas actuales, que cambian más de lo que parece |

## Permisos, secretos y pinning

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Assigning permissions to jobs](https://docs.github.com/actions/security-for-github-actions/security-guides/automatic-token-authentication) | Los scopes del `GITHUB_TOKEN`, uno a uno |
| [Secrets reference](https://docs.github.com/actions/reference/security/secrets) | Límites, nombres y reglas de alcance |
| [Keeping your actions up to date with Dependabot](https://docs.github.com/code-security/dependabot/working-with-dependabot/keeping-your-actions-up-to-date-with-dependabot) | La configuración exacta del ecosistema `github-actions` |
| [Changelog — SHA pinning policy](https://github.blog/changelog/2025-08-15-github-actions-policy-now-supports-blocking-and-sha-pinning-actions/) | Qué hace la política, y a qué niveles se puede activar |
| [Immutable releases](https://docs.github.com/code-security/concepts/supply-chain-security/immutable-releases) | Por qué un tag que no se puede mover cambia el modelo de riesgo |
| [GHSA-mrrh-fwg8-r2c3 — `tj-actions/changed-files`](https://github.com/advisories/ghsa-mrrh-fwg8-r2c3) | El incidente de marzo de 2025, en la fuente: léelo antes de discutir si pinnear merece la pena |

## OIDC en la práctica

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [OIDC in cloud providers](https://docs.github.com/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-cloud-providers) | El índice de todas las integraciones oficiales |
| [OIDC en AWS](https://docs.github.com/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws) | El caso más documentado; sirve de plantilla mental para los demás |
| [Changelog — immutable subject claims (abril 2026)](https://github.blog/changelog/2026-04-23-immutable-subject-claims-for-github-actions-oidc-tokens/) | Qué cambia en el `sub` de los repositorios nuevos y por qué |
| [`aws-actions/configure-aws-credentials`](https://github.com/aws-actions/configure-aws-credentials) | Su README es, de facto, la guía de OIDC para AWS |

## Environments y despliegue

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Managing environments for deployment](https://docs.github.com/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) | Reglas de protección y políticas de rama, con sus nombres de API |
| [Reviewing deployments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/review-deployments) | Aprobar y rechazar, y qué queda registrado de cada decisión |
| [Publishing with a custom GitHub Actions workflow (Pages)](https://docs.github.com/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow) | El origen "GitHub Actions" de Pages, que es el que usa la práctica 03 |
| [`actions/deploy-pages`](https://github.com/actions/deploy-pages) | Inputs, outputs y los mensajes de error exactos que verás |

## Herramientas

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [`actionlint`](https://github.com/rhysd/actionlint) | Sintaxis, expresiones y `shellcheck` sobre tus `run:` |
| [`zizmor`](https://github.com/zizmorcore/zizmor) | Análisis de seguridad de workflows, con salida SARIF |
| [`step-security/harden-runner`](https://github.com/step-security/harden-runner) | Monitoriza la red saliente del runner; útil cuando ya tienes lo básico hecho |
| [Actions Runner Controller](https://github.com/actions/actions-runner-controller) | Runners efímeros en Kubernetes, si algún día te toca operarlos |

## Cómo usar esta lista

La referencia de *secure use* y la de OIDC son las dos que vas a volver a abrir.
El resto se lee una vez. Y el advisory del incidente de 2025 no es material de
relleno: es la diferencia entre pinnear porque lo dice un checklist y pinnear
porque sabes qué pasa cuando no lo haces.

---

← [Volver a la Semana 11](../../README.md)
