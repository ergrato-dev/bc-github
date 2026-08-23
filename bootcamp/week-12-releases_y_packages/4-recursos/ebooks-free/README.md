# Libros gratuitos — Semana 12

| Libro | Licencia | Capítulos para esta semana |
|-------|----------|----------------------------|
| [Google SRE Book — *Release Engineering*](https://sre.google/sre-book/release-engineering/) | Lectura online gratuita | El capítulo entero: qué es un release, por qué el artefacto no se reconstruye y por qué la vuelta atrás se diseña antes que la ida |
| [SLSA — Supply-chain Levels for Software Artifacts](https://slsa.dev/spec/v1.0/) | Creative Commons | Los requisitos de *provenance*: qué nivel de garantía da exactamente una atestación y qué le falta |
| [Securing the Software Supply Chain: Recommended Practices for Developers](https://www.cisa.gov/resources-tools/resources/securing-software-supply-chain-recommended-practices-guide-developers) — CISA/NSA | Dominio público | Las secciones de firma de artefactos y distribución: el marco del que salen las atestaciones y los releases inmutables |
| [The Twelve-Factor App](https://12factor.net/es/) | Artículos públicos | *Build, release, run*: la separación entre construir, versionar y ejecutar, escrita antes de que existiera nada de esto |
| [Pro Git — *Git Basics: Tagging*](https://git-scm.com/book/es/v2/Fundamentos-de-Git-Etiquetado) | Creative Commons | Tags anotados y ligeros, firma y `push` de tags, en el capítulo original y en español |
| [OpenSSF — Concise Guide for Developing More Secure Software](https://best.openssf.org/Concise-Guide-for-Developing-More-Secure-Software) | Creative Commons | El apartado de distribución cabe en media página y se puede auditar contra tu repositorio |

## Qué leer si solo tienes una hora

El capítulo **Release Engineering** del libro de SRE de Google, otra vez —ya
apareció en la Semana 11 y aquí se lee distinto—. Entonces contestaba «cómo se
despliega»; ahora contesta «qué es exactamente lo que se despliega».

La idea que más cuesta aceptar sigue siendo la misma, con otra cara: **un release
no es un evento, es un objeto**. Tiene identidad, contenido fijo y procedencia
demostrable. Todo lo que esta semana automatiza —el número, las notas, la firma,
el candado— existe para que ese objeto siga significando lo mismo dentro de dos
años, cuando ni tú ni el repositorio recordéis cómo se construyó.

---

← [Volver a la Semana 12](../../README.md)
