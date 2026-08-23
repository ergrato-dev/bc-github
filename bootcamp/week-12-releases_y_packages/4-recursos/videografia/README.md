# Videografía — Semana 12

Todos los enlaces se comprobaron en agosto de 2026. El canal y la fecha aparecen
en la propia página del vídeo.

## Automatizar el release

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Automated GitHub release with Release Please GitHub action](https://www.youtube.com/watch?v=70YgbPh6pXA) | El montaje completo de la Práctica 02, de principio a fin |
| [What is Release Please and how it can help you automate releases](https://www.youtube.com/watch?v=zFvBT4m-FCU) | La idea del pull request de release, antes de tocar YAML |
| [Automate releases #DevOpsDemystified](https://www.youtube.com/watch?v=amSoROjgJfU) | Versiones, changelogs y borradores automatizados, vistos en conjunto |
| [Auto-Bump Versions & Changelogs Like a Pro! Changesets + GitHub Actions](https://www.youtube.com/watch?v=UoCCAamB69Q) | La alternativa Changesets, útil para ver qué elige cada enfoque |

## Imágenes y GHCR

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [GitHub Action to build and push Docker images to ghcr.io](https://www.youtube.com/watch?v=HWm9PCkj5hg) | El workflow de la Práctica 03, con la interfaz actual |
| [Pushing Docker Images to GitHub Container Registry](https://www.youtube.com/watch?v=eupw4r_6H3g) | Incluye la parte que más se atasca: la visibilidad del paquete |
| [Use GHCR images in Actions without a personal access token](https://www.youtube.com/watch?v=pcM9zsfmMig) | Corto y directo: por qué el `GITHUB_TOKEN` basta |

## Procedencia y firma

| Recurso | Por qué vale la pena |
|---------|----------------------|
| [Secure your cloud-native deployments with Artifact Attestations](https://www.youtube.com/watch?v=zTIHb-9c868) | Generar y verificar atestaciones, con el porqué delante |
| [GitHub's Built-In Attestation Capabilities](https://www.youtube.com/watch?v=aikxOoJZCBE) | Recorrido por lo que GitHub trae de serie, sin herramientas extra |
| [npm and Sigstore: Provenance Comes to the World's Largest OSS Ecosystem](https://www.youtube.com/watch?v=w1hgRapM-Q8) | De dónde sale `--provenance` y qué problema resolvía |
| [Enhancing Artifact Security with GitHub's Build Provenance](https://www.youtube.com/watch?v=KDIKj65EB9I) | La procedencia dentro de una política de admisión, que es su destino natural |
| [Building SLSA 3 Conformant Attestors for Artifacts Generated on GitHub](https://www.youtube.com/watch?v=Aq3ND6xmkyU) | El fondo teórico: qué nivel de garantía da cada pieza |

## Cómo verlos

1. Uno de los dos de `release-please` **antes** de la Práctica 02. Ver el pull
   request de release en movimiento ahorra media hora de confusión.
2. El de artifact attestations **después** de la Práctica 03, cuando ya has
   firmado algo tuyo. Antes es abstracto.
3. Los de SLSA y npm+Sigstore, solo si quieres el fondo. No hacen falta para
   completar la semana.

> [!NOTE]
> El vídeo envejece más rápido que la documentación. En estos verás versiones
> antiguas de las actions, `release-please-action@v3` y menús que ya se han
> movido. Los conceptos siguen; las versiones y la interfaz, no. La fuente de
> verdad es la [webgrafía](../webgrafia/README.md).
>
> Si un enlace se rompe, [abre un issue](https://github.com/ergrato-dev/bc-github/issues)
> proponiendo el reemplazo.

---

← [Volver a la Semana 12](../../README.md)
