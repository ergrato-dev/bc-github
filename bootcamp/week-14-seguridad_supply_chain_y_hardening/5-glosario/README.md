# Glosario — Semana 14

Términos clave de esta semana, A-Z. El nombre real de la feature va en inglés
entre paréntesis cuando aplica.

## A

**Advisory de repositorio (repository security advisory)** — Aviso de seguridad
que escribes tú sobre tu propio proyecto. Nace en borrador, se arregla en
privado y, al publicarse, entra en la GitHub Advisory Database y alimenta las
alertas de Dependabot de quien te usa.

**Atestación (attestation)** — Afirmación firmada sobre un artefacto concreto,
identificado por su digest. Tiene tres partes: *subject*, *predicate type* y
*predicate*.

**Alcance (scope de una filtración)** — Cuánto tiempo estuvo viva una credencial
filtrada, qué se hizo con ella y en cuántos sitios apareció. Es el paso 3 de la
respuesta y el que casi todo el mundo se salta.

## B

**Bypass delegado (delegated bypass)** — Modelo en el que saltarse push
protection deja de ser una decisión individual y pasa a ser una solicitud que
otro aprueba. Función de GitHub Secret Protection.

## C

**Cadena de suministro (supply chain)** — Todo lo que toca tu software entre el
editor y el usuario: fuente, dependencias, build, publicación y consumo.

**CNA (CVE Numbering Authority)** — Organización autorizada a emitir
identificadores CVE. GitHub es una, y por eso puedes solicitar un CVE desde un
advisory de tu repositorio.

**Comprobación de validez (validity check)** — Consulta de solo lectura que
GitHub hace al proveedor para saber si una credencial filtrada sigue funcionando.
Rellena el campo `validity`.

**CycloneDX** — Formato de SBOM impulsado por OWASP, orientado a análisis de
seguridad. `actions/attest` lo acepta; GitHub no lo emite.

## D

**Digest** — Hash del contenido de un artefacto. Es el identificador que usa una
atestación como *subject*, porque una etiqueta puede cambiar de contenido y un
digest no.

**Divulgación coordinada (coordinated disclosure)** — Acuerdo por el que un
hallazgo se mantiene privado mientras se arregla y se publica después, en un
plazo pactado. Los plazos habituales van de 30 a 90 días.

## F

**Fork privado temporal (temporary private fork)** — Fork privado creado desde un
advisory en borrador, donde se desarrolla el arreglo durante el embargo sin que
los commits sean visibles.

**Fulcio** — Autoridad de certificación de Sigstore. Emite un certificado de vida
muy corta a partir de una identidad OIDC verificada.

## G

**GHSA** — Identificador de un aviso en la GitHub Advisory Database. Existe desde
el borrador, suele publicarse antes que el CVE, y puede haber GHSA sin CVE.

## I

**in-toto** — Especificación del formato de las atestaciones: la declaración que
ata un *subject* a un *predicate* de un tipo determinado.

## P

**Patrón de proveedor (partner pattern)** — Formato de credencial registrado por
un servicio en el programa de socios de GitHub. Incluye suma de comprobación, por
eso una cadena inventada con el prefijo correcto no dispara nada.

**Patrón no proveedor (non-provider pattern)** — Patrón genérico —claves
privadas, cadenas de conexión, contraseñas en URL— que se activa aparte por ser
más ruidoso.

**Patrón propio (custom pattern)** — Expresión regular tuya para detectar el
formato de credencial de tu propio servicio. Requiere GitHub Secret Protection.

**Predicate type** — URI que dice qué clase de afirmación hace una atestación:
`https://slsa.dev/provenance/v1` para procedencia,
`https://spdx.dev/Document/v2.3` para un SBOM en SPDX 2.3.

**Programa de socios (secret scanning partner program)** — Acuerdo por el que
GitHub avisa al proveedor cuando encuentra una credencial suya en un repositorio
público. Muchos la revocan automáticamente.

**`purl` (package URL)** — Identificador estándar de un paquete:
`pkg:npm/paquete@1.2.3`. Es el campo por el que un SBOM cruza con las bases de
vulnerabilidades.

**Push protection** — Rechazo del `push` en el servidor cuando su contenido
incluye un secreto de un patrón reconocido. Actúa antes de que el secreto exista
en GitHub.

## R

**Rekor** — Log de transparencia de Sigstore: registro público, solo de
adición, donde queda constancia de cada firma.

**Reporte privado (private vulnerability reporting)** — Ajuste que habilita un
formulario para que cualquiera te comunique un fallo de seguridad en privado. El
reporte crea un advisory en estado `triage`.

**Revocar** — Invalidar una credencial en el servicio que la emitió. Es el paso 1
de la respuesta a una filtración y el único que reduce el riesgo.

## S

**SBOM (Software Bill of Materials)** — Inventario, en formato estándar, de lo
que contiene un artefacto o un repositorio.

**Scorecard (OpenSSF Scorecard)** — Herramienta que puntúa de 0 a 10 veinte
prácticas de seguridad de un repositorio público y publica los hallazgos como
SARIF.

**Secret scanning** — Búsqueda de credenciales en todo el repositorio: historial
completo, issues, pull requests, discussions y wikis.

**Sigstore** — Infraestructura de firma sin gestión de claves: identidad OIDC,
certificado efímero de Fulcio y registro en Rekor.

**SLSA** — Marco que ordena por niveles la confianza en la procedencia de un
artefacto. Con runners de GitHub y atestaciones se alcanza el Build L2; el L3
exige que la atestación la genere un reusable workflow.

**SPDX** — Formato de SBOM de la Linux Foundation, normalizado como ISO/IEC 5962.
Es el que exporta GitHub, en su versión 2.3.

**Subject** — El artefacto del que habla una atestación, identificado por su
digest.

## T

**Tipo de crédito (credit type)** — Papel de cada persona reconocida en un
advisory: `finder`, `reporter`, `analyst`, `remediation_developer`… El crédito
queda pendiente hasta que la persona lo acepta.

---

← [Volver a la Semana 14](../README.md)
