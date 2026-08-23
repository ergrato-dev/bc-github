# Libros gratuitos — Semana 14

| Libro | Licencia | Capítulos para esta semana |
|-------|----------|----------------------------|
| [SLSA — Especificación v1.0](https://slsa.dev/spec/v1.0/) | Creative Commons | El apartado *Levels*: qué exige cada nivel de procedencia y qué te da GitHub sin hacer nada |
| [OpenSSF — Concise Guide for Developing More Secure Software](https://best.openssf.org/Concise-Guide-for-Developing-More-Secure-Software) | Creative Commons | El apartado de distribución y verificación: cada línea se convierte en una comprobación sobre tu repositorio |
| [OpenSSF — Concise Guide for Evaluating Open Source Software](https://best.openssf.org/Concise-Guide-for-Evaluating-Open-Source-Software) | Creative Commons | Qué mirar **antes** de instalar algo. Es el uso de Scorecard que casi nadie practica |
| [NIST SP 800-218 — Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final) | Dominio público | Las prácticas PS.2 (procedencia verificable) y PS.3 (archivar y proteger cada versión): el marco del que salen las atestaciones |
| [SLSA — Threats & mitigations](https://slsa.dev/spec/v1.0/threats) | Creative Commons | Catálogo de formas de comprometer un proyecto, eslabón por eslabón. No enseña herramientas: enseña a mirar |
| [OpenSSF — Source Code Management Best Practices](https://best.openssf.org/SCM-BestPractices/) | Creative Commons | Cómo se endurece el eslabón «fuente»: permisos, ramas protegidas, firmas y CI. Está escrito con GitHub delante |
| [in-toto — Especificación de atestaciones](https://github.com/in-toto/attestation/tree/main/spec) | Apache 2.0 | Se consulta, no se lee: la forma de la declaración y la lista de tipos de predicado con sus URI |
| [SPDX — Especificación 2.3](https://spdx.github.io/spdx-spec/v2.3/) | Creative Commons | La sección de *Package Information* y la de *External References*, que es donde vive el `purl` |

## Qué leer si solo tienes una hora

La sección **Threats** de la especificación de SLSA, y luego la **guía concisa de
evaluación de la OpenSSF**.

La primera es un catálogo de formas de comprometer un proyecto ordenado por
eslabón: no enseña ninguna herramienta, enseña a mirar. Léela con tu propio
repositorio abierto y ve marcando cuáles te aplican; el resultado es tu mapa de
la Semana 14 con más resolución que la tabla del archivo 01.

La segunda contesta la pregunta que esta semana deja implícita: si todo esto
sirve para que otros confíen en ti, ¿qué debería mirar **yo** antes de confiar en
una dependencia? Es corta, es una lista, y cambia la forma de instalar paquetes.

Si te sobra media hora, las **prácticas de gestión de código fuente de la
OpenSSF**. Es la única de la lista que mira hacia atrás en la cadena, al eslabón
que ya cubriste en las Semanas 01 y 08, y sirve para comprobar que aquello sigue
en pie.

---

← [Volver a la Semana 14](../../README.md)
