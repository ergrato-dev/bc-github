# Videografía — Semana 11

Todos los enlaces se comprobaron en agosto de 2026. El canal y la fecha aparecen
en la propia página del vídeo.

## Seguridad de la cadena de suministro del CI

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [DEF CON 32 — Grand Theft Actions: Abusing Self Hosted GitHub Runners](https://www.youtube.com/watch?v=5P7KatZBr_I) | La charla que explica, con casos reales, por qué un runner propio en un repositorio público es una puerta abierta |
| [Pwning the CI (GitHub Actions Edition)](https://www.youtube.com/watch?v=Rn9VuC0jQRQ) | El pipeline visto por quien lo ataca: es el mejor orden para entender qué defender primero |
| [Mitigate software supply chain risks in GitHub Actions](https://www.youtube.com/watch?v=FPjvL-No46E) | Pinning, permisos y políticas explicados como mitigaciones concretas, no como buenas prácticas genéricas |
| [Self-Hosted GitHub CI/CD Runners: Continuous Integration, Continuous Destruction](https://www.youtube.com/watch?v=GJhab1qXNig) | Qué queda en un runner que no es efímero, y qué hace el siguiente job con ello |

## OIDC

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [GitHub Actions: Learn OpenID Connect (OIDC) and deploy securely to AWS](https://www.youtube.com/watch?v=k2Tv-EJl7V4) | El intercambio completo, con la política de confianza escrita paso a paso |
| [Securely deploy to AWS with GitHub Actions and OIDC](https://www.youtube.com/watch?v=Io5UFJlEJKc) | Versión corta y actual del mismo montaje |
| [Setup OIDC Provider to enable keyless authentication from GitHub Actions (GCP)](https://www.youtube.com/watch?v=9EVb0bH3SrI) | El equivalente en Google Cloud: se ve que cambia el nombre de la action, no el mecanismo |

## Environments y despliegue

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [GitHub Actions — Environments](https://www.youtube.com/watch?v=WDW1QrJRS4c) | Configuración de environments y reglas de protección, con la interfaz actual |
| [Introduction to Deployment Protection Rules](https://www.youtube.com/watch?v=10J40Euwu7I) | Qué son las reglas de protección y cómo encajan en un pipeline de CD |
| [GitHub Actions: Approvals, Environments and Visualization DEEP DIVE](https://www.youtube.com/watch?v=w_37LDOy4sI) | Aprobaciones vistas desde la interfaz: útil para reconocer lo que la API devuelve |

## Cómo verlos

1. La charla de DEF CON, entera, antes de la Práctica 01. Cambia el orden en el
   que te tomas en serio cada ajuste.
2. Uno de los vídeos de OIDC **después** de la Práctica 02: con los claims de tu
   repositorio ya vistos, la política de confianza se lee sola.
3. Los de environments, solo si te atascas: la Práctica 03 hace lo mismo por API.

> [!NOTE]
> El vídeo envejece más rápido que la documentación. Al ver estos, verás
> `node16`, `v3` de las actions y menús que ya no están donde salen. Los
> conceptos siguen; las versiones y la interfaz, no. La fuente de verdad es la
> [webgrafía](../webgrafia/README.md).
>
> Si un enlace se rompe, [abre un issue](https://github.com/ergrato-dev/bc-github/issues)
> proponiendo el reemplazo.

---

← [Volver a la Semana 11](../../README.md)
