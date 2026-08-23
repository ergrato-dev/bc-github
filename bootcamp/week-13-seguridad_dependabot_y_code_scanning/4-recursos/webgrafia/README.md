# Webgrafía — Semana 13

Todos los enlaces se comprobaron en agosto de 2026.

## Referencia (los que vas a tener abiertos)

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference) | Cada opción del `dependabot.yml` con sus valores exactos. Es *la* página de la semana |
| [REST — Dependabot alerts](https://docs.github.com/en/rest/dependabot/alerts) | Todos los campos de una alerta y todos los filtros de la consulta |
| [REST — Code scanning](https://docs.github.com/en/rest/code-scanning/code-scanning) | Alertas, análisis, `default-setup` y subida de SARIF, con sus esquemas |
| [Dependabot pull request comment commands](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-pull-request-comment-commands) | La lista completa de comandos, incluidos los de grupos |
| [SARIF support for code scanning](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning) | Qué campos usa GitHub, y los límites de tamaño y de resultados |

## Grafo de dependencias y avisos

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [About the dependency graph](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-the-dependency-graph) | Qué archivos lee GitHub y qué ecosistemas cubre |
| [GitHub Advisory Database](https://github.com/advisories) | Buscable por paquete y ecosistema; útil para leer un aviso entero |
| [`actions/dependency-review-action`](https://github.com/actions/dependency-review-action) | Todas las opciones, incluidas las de licencias |
| [EPSS — Exploit Prediction Scoring System](https://www.first.org/epss/) | Qué mide exactamente y por qué no sustituye al CVSS |
| [CVSS v3.1 Specification](https://www.first.org/cvss/v3-1/specification-document) | Cómo se calcula la severidad que ordena tu bandeja |

## Dependabot

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [About Dependabot alerts](https://docs.github.com/en/code-security/dependabot/dependabot-alerts/about-dependabot-alerts) | El modelo mental completo antes de tocar nada |
| [About Dependabot security updates](https://docs.github.com/en/code-security/dependabot/dependabot-security-updates/about-dependabot-security-updates) | Qué puede arreglar y, sobre todo, qué no |
| [About Dependabot version updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/about-dependabot-version-updates) | La otra mitad, la que depende del archivo de configuración |
| [Optimizing PR creation for version updates](https://docs.github.com/en/code-security/tutorials/secure-your-dependencies/optimizing-pr-creation-version-updates) | Ejemplos reales de `groups` y `cooldown`, que es donde se atasca todo el mundo |
| [Automating Dependabot with GitHub Actions](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions) | El auto-merge oficial, con sus advertencias |
| [Troubleshooting Dependabot on GitHub Actions](https://docs.github.com/en/code-security/reference/supply-chain-security/troubleshoot-dependabot/dependabot-on-actions) | Por qué el token es de solo lectura y por qué no ve tus secretos |
| [About Dependabot auto-triage rules](https://docs.github.com/en/code-security/dependabot/dependabot-auto-triage-rules/about-dependabot-auto-triage-rules) | Automatizar el descarte del ruido estructural sin taparlo todo |

## Code scanning y CodeQL

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [About code scanning](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning) | La bandeja, antes que la herramienta |
| [Configuring default setup](https://docs.github.com/en/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning) | Lo que se activa con un botón, y sus límites |
| [Configuring advanced setup](https://docs.github.com/en/code-security/code-scanning/enabling-code-scanning/configuring-advanced-setup-for-code-scanning) | Cuándo pasar al workflow propio y cómo se convive con el otro |
| [CodeQL query suites](https://docs.github.com/en/code-security/code-scanning/managing-your-code-scanning-configuration/codeql-query-suites) | Qué añade `security-extended` y qué cuesta |
| [CodeQL — Supported languages and frameworks](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/) | Qué analiza de verdad, por lenguaje y por librería |
| [Responsible use of Copilot Autofix](https://docs.github.com/en/code-security/code-scanning/managing-code-scanning-alerts/responsible-use-autofix-code-scanning) | Qué garantiza y qué sigue siendo tuyo. Léelo antes de aceptar una sugerencia |
| [`github/codeql-action`](https://github.com/github/codeql-action) | Los inputs reales de `init`, `analyze` y `upload-sarif` |

## SARIF y terceros

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Uploading a SARIF file to GitHub](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/uploading-a-sarif-file-to-github) | Las dos vías: la action y la API, con sus requisitos |
| [OASIS — SARIF 2.1.0](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html) | El estándar entero, para cuando tengas que depurar un archivo |
| [`aquasecurity/trivy-action`](https://github.com/aquasecurity/trivy-action) | Los inputs de la Práctica 04, incluido `scan-type` |
| [`@microsoft/eslint-formatter-sarif`](https://github.com/microsoft/sarif-js-sdk) | Convertir la salida de ESLint en SARIF sin escribir nada |
| [Third-party code scanning tools](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/about-integration-with-code-scanning) | Qué herramientas ya vienen integradas antes de montar la tuya |

## Cómo usar esta lista

La **referencia de opciones de Dependabot** es la única que vas a abrir varias
veces: casi todos los problemas de la semana son un valor mal escrito en ese
archivo. Ténla a mano mientras haces la Práctica 01.

Y una advertencia que ahorra una tarde: buena parte de la documentación de code
scanning está escrita desde **GitHub Advanced Security**, que es de pago en
repositorios privados. Todo lo de esta semana es gratuito en repositorios
**públicos**. Si una página insiste en licencias, comprueba a qué tipo de
repositorio se refiere antes de darte por vencido.

---

← [Volver a la Semana 13](../../README.md)
