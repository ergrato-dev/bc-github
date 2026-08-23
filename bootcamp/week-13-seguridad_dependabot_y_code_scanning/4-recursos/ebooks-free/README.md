# Libros gratuitos — Semana 13

| Libro | Licencia | Capítulos para esta semana |
|-------|----------|----------------------------|
| [OpenSSF — Concise Guide for Developing More Secure Software](https://best.openssf.org/Concise-Guide-for-Developing-More-Secure-Software) | Creative Commons | El apartado de dependencias y el de análisis estático: dos páginas que se auditan contra tu propio repositorio |
| [OpenSSF — Concise Guide for Evaluating Open Source Software](https://best.openssf.org/Concise-Guide-for-Evaluating-Open-Source-Software) | Creative Commons | Qué mirar **antes** de añadir una dependencia. La alerta que no llega es la que no instalaste |
| [OWASP Top 10](https://owasp.org/Top10/) | Creative Commons | A06 *Vulnerable and Outdated Components* y A03 *Injection*: las dos categorías que cubren, respectivamente, Dependabot y CodeQL |
| [OWASP — Vulnerable Dependency Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html) | Creative Commons | Qué hacer cuando `first_patched_version` es `null`, que es el caso que la documentación de GitHub no cubre |
| [NIST SP 800-218 — Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final) | Dominio público | Las prácticas PW.4 (reutilizar software) y RV.1 (identificar vulnerabilidades): el marco del que salen estos controles |
| [CodeQL documentation](https://codeql.github.com/docs/) | Documentación pública | *CodeQL for JavaScript* si quieres entender qué es una fuente y qué un sumidero, en vez de solo activar el análisis |
| [OASIS — SARIF 2.1.0](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html) | Estándar abierto | Se consulta, no se lee: la sección de `results` y la de `partialFingerprints` |

## Qué leer si solo tienes una hora

La **guía concisa de la OpenSSF**, y luego el capítulo **A06** del OWASP Top 10.

La guía cabe en quince minutos y tiene una propiedad rara: cada línea se puede
convertir en una comprobación sobre tu repositorio. Léela con la pestaña de
seguridad abierta y ve marcando.

A06 sirve para lo contrario: para entender por qué esto ocupa una semana entera.
«Componentes vulnerables y desactualizados» lleva más de una década en el Top 10
sin moverse mucho, no porque nadie sepa arreglarlo, sino porque arreglarlo es una
rutina sostenida y no un proyecto. Todo lo que has montado esta semana —las
alertas, los grupos, el auto-merge de parches, el ritmo semanal— existe para
convertir esa rutina en algo que sobrevive a que se te olvide.

Y si te sobra media hora, el *cheat sheet* de OWASP sobre dependencias
vulnerables. Es el único de la lista que responde a la pregunta incómoda: qué
haces cuando no hay parche.

---

← [Volver a la Semana 13](../../README.md)
