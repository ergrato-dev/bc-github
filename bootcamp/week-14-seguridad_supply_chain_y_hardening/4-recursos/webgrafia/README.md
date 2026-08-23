# Webgrafía — Semana 14

Todos los enlaces se comprobaron en agosto de 2026.

## Referencia (los que vas a tener abiertos)

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [REST — Secret scanning](https://docs.github.com/en/rest/secret-scanning/secret-scanning) | Todos los campos de una alerta y todos los filtros: `validity`, `is_bypassed`, `is_publicly_leaked` |
| [REST — Repository security advisories](https://docs.github.com/en/rest/security-advisories/repository-advisories) | El cuerpo exacto para crear un advisory, con los ecosistemas válidos |
| [REST — Repository attestations](https://docs.github.com/en/rest/repos/attestations) | Recuperar atestaciones por digest y filtrar por `predicate_type` |
| [REST — Dependency graph SBOM](https://docs.github.com/en/rest/dependency-graph/sboms) | El endpoint del SBOM y la forma de la respuesta |
| [Scorecard — Documentación de los checks](https://github.com/ossf/scorecard/blob/main/docs/checks.md) | Los veinte checks con su riesgo y qué mira cada uno. Es *la* página del Paso 3 de la Práctica 04 |

## Secretos

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [About secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning) | Qué se escanea, dónde, y qué es gratis en repositorios públicos |
| [Supported secret scanning patterns](https://docs.github.com/en/code-security/secret-scanning/introduction/supported-secret-scanning-patterns) | La lista de proveedores; útil para saber si tu credencial está cubierta |
| [About push protection](https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection) | Los tres motivos de excepción y qué alerta deja cada uno |
| [Working with push protection from the command line](https://docs.github.com/en/code-security/secret-scanning/working-with-secret-scanning-and-push-protection/working-with-push-protection-from-the-command-line) | Cómo se lee el bloqueo y cómo se sale de él sin saltárselo |
| [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) | La página que hay que leer entera antes de tocar la historia — y que empieza diciendo que rotes |
| [Secret scanning partner program](https://docs.github.com/en/code-security/secret-scanning/secret-scanning-partnership-program/secret-scanning-partner-program) | Qué hace GitHub con el proveedor cuando aparece un token suyo |

## Reportes y advisories

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Adding a security policy to your repository](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository) | Dónde busca GitHub el `SECURITY.md` y qué hace con él |
| [Configuring private vulnerability reporting for a repository](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/configuring-private-vulnerability-reporting-for-a-repository) | El ajuste y lo que ve quien reporta |
| [About repository security advisories](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/about-repository-security-advisories) | Los estados y quién ve cada uno |
| [Creating a repository security advisory](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/creating-a-repository-security-advisory) | Campo a campo, incluida la sintaxis de los rangos de versiones |
| [Collaborating in a temporary private fork](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/collaborating-in-a-temporary-private-fork-to-resolve-a-repository-security-vulnerability) | Cómo se arregla sin publicar el fallo |
| [GitHub Advisory Database](https://github.com/advisories) | Dónde acaba tu advisory. Léete uno bien escrito antes de escribir el tuyo |

## SBOM y atestaciones

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Exporting a software bill of materials for your repository](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/exporting-a-software-bill-of-materials-for-your-repository) | Los dos caminos, interfaz y API, y qué incluye |
| [SPDX — Especificación](https://spdx.github.io/spdx-spec/) | Para cuando tengas que depurar un archivo, no para leerla entera |
| [package-url — Especificación del `purl`](https://github.com/package-url/purl-spec) | Corta y muy útil: el identificador por el que cruza todo |
| [`anchore/sbom-action`](https://github.com/anchore/sbom-action) | Los inputs reales: `path`, `file`, `image`, `format` |
| [`actions/attest`](https://github.com/actions/attest) | La action genérica; `sbom-path` y `predicate-type` son mutuamente excluyentes |
| [Using artifact attestations to establish provenance for builds](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations) | El flujo completo, con los permisos que hacen falta |
| [in-toto Attestation Framework](https://github.com/in-toto/attestation) | Los tipos de predicado estándar, con sus URI exactas |
| [Sigstore](https://www.sigstore.dev/) | Qué es Fulcio, qué es Rekor y por qué no hay clave privada |

## SLSA y Scorecard

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [SLSA — Build levels](https://slsa.dev/spec/v1.0/levels) | Los niveles con sus requisitos exactos, en dos páginas |
| [Using artifact attestations and reusable workflows to achieve SLSA v1 Build Level 3](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/increase-security-rating) | Qué falta exactamente para el L3, que es un reusable workflow de la Semana 10 |
| [OpenSSF Scorecard](https://github.com/ossf/scorecard) | El proyecto: cómo se ejecuta en local si quieres probar antes de publicar |
| [`ossf/scorecard-action`](https://github.com/ossf/scorecard-action) | Los inputs y los permisos del workflow del Paso 2 |
| [Visor público de Scorecard](https://scorecard.dev/) | La puntuación de cualquier proyecto público, y la tuya cuando publiques |

## Cómo usar esta lista

La **documentación de los checks de Scorecard** es la única que vas a abrir
varias veces: cada hallazgo del Paso 3 de la Práctica 04 se entiende ahí, con lo
que mide y cómo se arregla.

Y una advertencia que ahorra una tarde: casi toda la documentación de seguridad
de GitHub está escrita desde **GitHub Advanced Security**, **Secret Protection**
o **Code Security**, que son productos de pago para repositorios privados. Todo
lo de esta semana es gratuito en repositorios **públicos**. Si una página insiste
en licencias, comprueba a qué tipo de repositorio se refiere antes de darte por
vencido.

---

← [Volver a la Semana 14](../../README.md)
