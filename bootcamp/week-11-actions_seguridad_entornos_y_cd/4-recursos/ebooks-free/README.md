# Libros gratuitos — Semana 11

| Libro | Licencia | Capítulos para esta semana |
|-------|----------|----------------------------|
| [Securing the Software Supply Chain: Recommended Practices for Developers](https://www.cisa.gov/resources-tools/resources/securing-software-supply-chain-recommended-practices-guide-developers) — CISA/NSA | Dominio público | Las secciones de integridad del build y de gestión de credenciales: es el marco del que salen el pinning y OIDC |
| [SLSA — Supply-chain Levels for Software Artifacts](https://slsa.dev/spec/v1.0/) | Creative Commons | Los requisitos de *build integrity*. Explica por qué "construir una vez" no es una manía sino un nivel de garantía |
| [The Twelve-Factor App](https://12factor.net/es/) | Artículos públicos | *Config*, *Build, release, run* y *Dev/prod parity*: la separación entre construir y desplegar, escrita antes de que existiera Actions |
| [Google SRE Book — capítulo *Release Engineering*](https://sre.google/sre-book/release-engineering/) | Lectura online gratuita | Builds herméticos, promoción de artefactos y por qué los despliegues se hacen aburridos a propósito |
| [OpenSSF — Concise Guide for Developing More Secure Software](https://best.openssf.org/Concise-Guide-for-Developing-More-Secure-Software) | Creative Commons | Lista corta y sin humo; el apartado de CI/CD cabe en una página y se puede auditar contra tu repositorio |

## Qué leer si solo tienes una hora

El capítulo **Release Engineering** del libro de SRE de Google. Está escrito
desde una infraestructura que no es la tuya y aun así contesta las preguntas de
esta semana mejor que cualquier tutorial: qué es un release, por qué el artefacto
no se reconstruye, qué significa que un despliegue sea reproducible y por qué la
vuelta atrás se diseña antes que la ida.

La idea que más cuesta aceptar es que **el despliegue debe ser aburrido**. Si
publicar produce adrenalina, es que falta automatización, falta registro o falta
una forma barata de volver atrás. Las tres se arreglan esta semana.

---

← [Volver a la Semana 11](../../README.md)
