# Webgrafía — Semana 12

Todos los enlaces se comprobaron en agosto de 2026.

## Referencia (los que vas a tener abiertos)

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) | El objeto release explicado desde GitHub, con sus estados |
| [REST — Releases](https://docs.github.com/en/rest/releases/releases) | Los ocho endpoints con sus campos exactos, incluida `generate-notes` |
| [`gh release`](https://cli.github.com/manual/gh_release) | La referencia de todos los flags, incluida la sección de inmutabilidad |
| [Semantic Versioning 2.0.0](https://semver.org/lang/es/) | La especificación completa, en español, en una página |
| [Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry) | Autenticación, nombres, vinculación y permisos de GHCR |

## Versionado y changelogs

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Conventional Commits 1.0.0](https://www.conventionalcommits.org/es/v1.0.0/) | La convención que hace posible el cálculo automático de versión |
| [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) | Qué escribir en un changelog y, sobre todo, qué no |
| [Automatically generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes) | El esquema exacto de `.github/release.yml` y las reglas del comodín |
| [`release-please`](https://github.com/googleapis/release-please) | La herramienta, sus estrategias por lenguaje y sus vías de escape |
| [Manifest releaser](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md) | La configuración avanzada: monorepos, componentes, versionado independiente |
| [Changesets](https://github.com/changesets/changesets) | La alternativa cuando cada PR debe declarar a mano qué paquetes afecta |

## Packages y registros

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Configuring a package's access control and visibility](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility) | Por qué el paquete nace privado y dónde se cambia |
| [REST — Packages](https://docs.github.com/en/rest/packages/packages) | Los endpoints y el scope `read:packages` que hace falta para todos |
| [`docker/metadata-action`](https://github.com/docker/metadata-action) | Todas las reglas `type=` con ejemplos: la referencia de las etiquetas |
| [Working with the npm registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) | Scope obligatorio, `.npmrc` y autenticación para instalar |
| [`pnpm publish`](https://pnpm.io/cli/publish) | Los flags, incluido `--no-git-checks`, que es el que te salvará en CI |
| [pnpm en integración continua](https://pnpm.io/continuous-integration) | La configuración recomendada de pnpm en Actions |

## Procedencia y firma

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Using artifact attestations](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations) | El flujo completo de generar y verificar, con los permisos exactos |
| [`actions/attest-build-provenance`](https://github.com/actions/attest-build-provenance) | Los inputs y las combinaciones válidas de sujeto |
| [REST — Repository attestations](https://docs.github.com/en/rest/repos/attestations) | Para inventariar; recuerda que leerlo no es verificar |
| [Immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases) | Qué congela y qué deja fuera, y por qué cambia el modelo de riesgo |
| [npm — Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements) | Los requisitos de `--provenance`, uno a uno |
| [npm — Trusted publishers](https://docs.npmjs.com/trusted-publishers) | Publicar sin token, con la misma idea que el OIDC de la Semana 11 |
| [SLSA — Provenance](https://slsa.dev/spec/v1.0/provenance) | El formato que hay debajo de todo lo anterior |

## Cómo usar esta lista

La referencia de `gh release` y la de atestaciones son las dos que vas a volver a
abrir. La especificación de SemVer se lee una vez entera y se consulta cada vez
que haya una discusión de versión — que es más a menudo de lo que parece.

Y una advertencia sobre `release-please`: su documentación asume que ya sabes lo
que hace. Si algo no cuadra, la respuesta suele estar en el *manifest releaser*,
no en el README de la action.

---

← [Volver a la Semana 12](../../README.md)
