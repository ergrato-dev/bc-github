# Libros gratuitos — Semana 10

| Libro | Licencia | Capítulos para esta semana |
|-------|----------|----------------------------|
| [Software Engineering at Google](https://abseil.io/resources/swe-book) | Lectura online gratuita | **Cap. 16** (Version Control and Branch Management) y **Cap. 21** (Dependency Management): qué significa que otros dependan de tu código y por qué versionar es un compromiso, no una etiqueta |
| [Semantic Versioning 2.0.0](https://semver.org/lang/es/) | Creative Commons | La especificación entera se lee en quince minutos. Es el contrato que firmas al publicar tu `v1` |
| [The Twelve-Factor App](https://12factor.net/es/) | Artículos públicos | *Dependencies* y *Config*: por qué una action declara sus entradas en vez de leerlas del entorno por su cuenta |
| [Securing the Software Supply Chain](https://www.cisa.gov/resources-tools/resources/securing-software-supply-chain-recommended-practices-guide-developers) — CISA/NSA | Dominio público | La sección de dependencias de terceros: qué asume quien ejecuta tu action en su CI. Adelanto de las Semanas 11 y 13 |
| [Martin Fowler — Refactoring (catálogo online)](https://refactoring.com/catalog/) | Catálogo público | *Extract Function* aplicado a otra cosa: extraer un reusable workflow tiene los mismos criterios y los mismos riesgos que extraer una función |

## Qué leer si solo tienes una hora

**La especificación de SemVer**, entera. Es corta y responde exactamente la
pregunta que decide todo lo demás de esta semana: qué cambios puedes hacer en tu
action sin romper a quien la usa.

El apartado que más cuesta interiorizar es el que dice que la versión mayor se
sube por **cualquier** cambio incompatible, por pequeño que sea el diff. Añadir
un permiso obligatorio al `GITHUB_TOKEN` son dos palabras en un YAML y rompe a
todo el que declare permisos mínimos.

---

← [Volver a la Semana 10](../../README.md)
