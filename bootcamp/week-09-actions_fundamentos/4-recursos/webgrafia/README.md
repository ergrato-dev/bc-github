# Webgrafía — Semana 09

Todos los enlaces se comprobaron en agosto de 2026.

## Referencia (los cinco que vas a tener abiertos)

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Workflow syntax](https://docs.github.com/actions/reference/workflows-and-actions/workflow-syntax) | La referencia completa del YAML. Cuando dudes de una clave, es aquí |
| [Events that trigger workflows](https://docs.github.com/actions/reference/workflows-and-actions/events-that-trigger-workflows) | Cada evento con sus activity types y su payload |
| [Contexts](https://docs.github.com/actions/reference/workflows-and-actions/contexts) | Qué contiene cada context y —lo que casi nadie lee— **dónde está disponible** |
| [Expressions](https://docs.github.com/actions/reference/workflows-and-actions/expressions) | Operadores, funciones y funciones de estado |
| [Workflow commands](https://docs.github.com/actions/reference/workflows-and-actions/workflow-commands) | `$GITHUB_OUTPUT`, `$GITHUB_ENV`, `::error::`, `$GITHUB_STEP_SUMMARY` |

## Seguridad (la parte que más importa de la semana)

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Security hardening for GitHub Actions](https://docs.github.com/actions/reference/security/secure-use) | La guía oficial: permisos, secretos, código de terceros |
| [Automatic token authentication](https://docs.github.com/actions/security-for-github-actions/security-guides/automatic-token-authentication) | Qué es el `GITHUB_TOKEN`, qué puede hacer y cómo recortarlo |
| [GitHub Security Lab — Preventing pwn requests](https://securitylab.github.com/resources/github-actions-preventing-pwn-requests/) | El ataque de `pull_request_target` explicado por quien lo investiga |
| [GitHub Security Lab — Untrusted input](https://securitylab.github.com/resources/github-actions-untrusted-input/) | Inyección de comandos vía payload, con casos reales |
| [OpenSSF — Scorecard checks: Token-Permissions](https://github.com/ossf/scorecard/blob/main/docs/checks.md#token-permissions) | Por qué esto se audita, y cómo. Adelanto de la Semana 14 |

## Matrices, artifacts y caché

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Running variations of jobs in a workflow](https://docs.github.com/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations) | `include`, `exclude`, `fail-fast` y `max-parallel` con ejemplos |
| [Store and share data with workflow artifacts](https://docs.github.com/actions/how-tos/write-workflows/choose-what-workflows-do/store-artifacts) | Retención, nombres y descarga |
| [Dependency caching reference](https://docs.github.com/actions/reference/workflows-and-actions/dependency-caching) | Límites, expulsión y las reglas de rama que explican por qué no acierta |
| [actions/cache — ejemplos](https://github.com/actions/cache/blob/main/examples.md) | La `key` correcta para cada lenguaje, ya escrita |

## Depuración y límites

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Enable debug logging](https://docs.github.com/actions/how-tos/monitor-workflows/enable-debug-logging) | `ACTIONS_STEP_DEBUG` y `ACTIONS_RUNNER_DEBUG` |
| [Actions limits](https://docs.github.com/actions/reference/limits) | Los 256 jobs de matriz, tiempos máximos y demás techos |
| [Billing for GitHub Actions](https://docs.github.com/billing/concepts/product-billing/github-actions) | Cuánto cuesta cada sistema operativo, y por qué macOS no es gratis |
| [actions/runner-images](https://github.com/actions/runner-images) | Qué trae exactamente cada imagen, versión a versión |
| [nektos/act](https://github.com/nektos/act) | Ejecutar workflows en local. Lee la sección de limitaciones antes de fiarte |
| [rhysd/actionlint](https://github.com/rhysd/actionlint) | Linter de workflows: detecta expresiones inválidas y contexts mal usados |

## Cuando el error no aparece en ningún log

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [GitHub Actions — Community discussions](https://github.com/orgs/community/discussions/categories/actions) | Donde se responden los casos raros, incluidos los del propio equipo |
| [actions/runner — issues](https://github.com/actions/runner/issues) | Si es un fallo del runner, está aquí antes que en ningún blog |

---

← [Volver a la Semana 09](../../README.md)
