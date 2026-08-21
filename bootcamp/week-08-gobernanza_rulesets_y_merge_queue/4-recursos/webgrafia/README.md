# Webgrafía — Semana 08

## Rulesets

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [About rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) | El modelo entero: targets, capas, jerarquía. Empieza aquí |
| [Available rules for rulesets](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) | Regla por regla, con las notas de disponibilidad por plan que evitan perder una tarde |
| [Creating rulesets for a repository](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository) | El flujo por la UI, útil para entender qué campo corresponde a qué parámetro del JSON |
| [Managing rulesets for a repository](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository) | Rule insights e historial: dónde se ve quién cambió qué |
| [REST API — Repository rules](https://docs.github.com/rest/repos/rules) | El esquema exacto de `bypass_actors`, `conditions` y cada `parameters` |

## Branch protection (legado)

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [About protected branches](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) | Para leer repositorios anteriores a 2023 y entender qué se sumó a qué |

## Merge queue

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Managing a merge queue](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue) | Requisitos reales y disponibilidad por plan |
| [Merging a pull request with a merge queue](https://docs.github.com/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request-with-a-merge-queue) | Qué ve quien mergea: candidatos, expulsión de la cola, `merge_group` |
| [About merge methods on GitHub](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/about-merge-methods-on-github) | Por qué `required_linear_history` y los merge commits son incompatibles |

## Environments y despliegue

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Managing environments for deployment](https://docs.github.com/actions/deployment/targeting-different-environments/using-environments-for-deployment) | Revisores, wait timers, políticas de rama y secretos, con las notas de plan |
| [Reviewing deployments](https://docs.github.com/actions/managing-workflow-runs/reviewing-deployments) | Qué ve quien aprueba, y qué pasa a los 30 días |
| [REST API — Deployment environments](https://docs.github.com/rest/deployments/environments) | El esquema de `PUT`, que reemplaza el objeto entero |
| [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions) | Diferencia entre secreto de repositorio, de environment y de organización |

## Firma de commits

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [About commit signature verification](https://docs.github.com/authentication/managing-commit-signature-verification/about-commit-signature-verification) | Qué significa cada estado (`G`, `U`, `N`) y por qué GitHub firma tus merges web |

---

← [Volver a la Semana 08](../../README.md)
