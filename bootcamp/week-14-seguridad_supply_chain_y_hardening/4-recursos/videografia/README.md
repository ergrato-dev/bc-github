# Videografía — Semana 14

Todos los enlaces se comprobaron en agosto de 2026. El canal y la fecha aparecen
en la propia página del vídeo.

## Cadena de suministro: el panorama

| Recurso | Canal | Por qué vale la pena |
|---------|-------|----------------------|
| [Mitigate software supply chain risks in Github Actions \| ODSP938](https://www.youtube.com/watch?v=FPjvL-No46E) | Microsoft Developer | Recorre el eslabón que más se ataca —el build— con los controles que montaste en las Semanas 11 y 13 |
| [Linux Supply Chain Attack Discovered in SSH CVE-2024-3094](https://www.youtube.com/watch?v=VsCTp9yH6iQ) | Lawrence Systems | El caso `xz` contado con calma: años de reputación construida para colar una puerta trasera en el artefacto, no en el código |
| [Introduction to GitHub Advanced Security](https://www.youtube.com/watch?v=lf7bltxaTHQ) | Microsoft Reactor | Panorámica de todas las piezas; útil para separar lo gratuito en repos públicos de lo que es de pago |

## Secretos

| Recurso | Canal | Por qué vale la pena |
|---------|-------|----------------------|
| [Webinar: GitHub Secret Scanning and Push Protection](https://www.youtube.com/watch?v=h060IS4bgLA) | Charlton Trezevant | Sesión larga con las dos capas en movimiento y el bloqueo real, no una captura |
| [GitHub: Enabling and Disabling Secret Scanning Push Protection](https://www.youtube.com/watch?v=e8OY8JeAl4I) | Kavitha Suresh Kumar | Corto y concreto: el ajuste del Paso 2 de la Práctica 01, en la interfaz actual |
| [Improving security vulnerability reporting — GitHub Universe 2021](https://www.youtube.com/watch?v=SJqYgw2Hm3M) | GitHub | Por qué existe el canal privado de reporte, contado por quien lo diseñó |

## SBOM

| Recurso | Canal | Por qué vale la pena |
|---------|-------|----------------------|
| [gh-sbom \| Utilize GitHub's Dependency Graph to Make SBOMs!](https://www.youtube.com/watch?v=3F3j_x50d00) | LearnSBOM | El SBOM del grafo, que es el que exportas en el Paso 1 de la Práctica 03 |
| [Generate SBOMs with Trivy & Scan SBOMs for vulnerabilities](https://www.youtube.com/watch?v=Kibk6qq7ZCs) | Aqua Security Open Source | La otra mitad: generar el SBOM del artefacto y usarlo para buscar, que es para lo que sirve |
| [Creating an SBOM Attestation with Trivy and Cosign from Sigstore](https://www.youtube.com/watch?v=nF15vzo5Gts) | Aqua Security Open Source | El mismo flujo de la Práctica 03 con herramientas de fuera de GitHub: ayuda a ver qué es estándar y qué es de la plataforma |

## Firmas y atestaciones

| Recurso | Canal | Por qué vale la pena |
|---------|-------|----------------------|
| [Secure your cloud-native deployments with Artifact Attestations](https://www.youtube.com/watch?v=zTIHb-9c868) | GitHub | La función explicada desde la fuente, con el caso de uso de verificar antes de desplegar |
| [WHAT IS SIGSTORE KEYLESS SIGNING?](https://www.youtube.com/watch?v=oM1RKsNReqo) | Cloud Security Podcast | La idea de firmar sin claves, en formato corto. Míralo si el archivo 08 te dejó con la duda |
| [From Cosign to an Ecosystem: The Evolution of Sigstore](https://www.youtube.com/watch?v=hsHeZRFj5jc) | OpenSSF | Charla de un ingeniero de GitHub sobre cómo encaja Sigstore debajo de todo esto |
| [Sigstore: A Wax Seal of Security for the Digital Era](https://www.youtube.com/watch?v=m5eTw4x33kU) | OpenSSF | Fulcio y Rekor explicados por el proyecto, sin dar por sabido nada |

## SLSA y Scorecard

| Recurso | Canal | Por qué vale la pena |
|---------|-------|----------------------|
| [What Is SLSA? Understanding Supply Chain Levels for Software Artifacts](https://www.youtube.com/watch?v=K_G10zywoTs) | Harness | Los niveles en diez minutos, que es lo que necesitas para situar dónde te dejó la Semana 12 |
| [Enhancing Artifact Security with GitHub's Build Provenance](https://www.youtube.com/watch?v=KDIKj65EB9I) | The Linux Foundation | Charla con un ingeniero de GitHub sobre procedencia y verificación en el consumo |
| [OpenSSF Tech Talk: Building a Stronger Open Source Ecosystem — OpenSSF Scorecard](https://www.youtube.com/watch?v=hKPsu72ol4s) | OpenSSF | Qué mide Scorecard y cómo lo usan organizaciones grandes para elegir dependencias |
| [Reviewing NuGet Packages security easily using OpenSSF Scorecard](https://www.youtube.com/watch?v=4B8LcAlMbsE) | NDC Conferences | Scorecard usado en la dirección que menos se practica: evaluar lo que vas a instalar |
| [Implementing the OpenSSF Best Practices Badges & Scorecards Into Your Project](https://www.youtube.com/watch?v=Hw3LbIXeZ2k) | The Linux Foundation | Qué hacer con el informe una vez lo tienes, por gente que mantiene proyectos grandes |

## Cómo verlos

1. El de **`xz`** antes de la Teoría 01. Es el que convierte «cadena de
   suministro» de concepto abstracto en una historia con fechas.
2. El **webinar de secret scanning** justo antes de la Práctica 01: es el mismo
   montaje que vas a hacer.
3. El de **Artifact Attestations** después de la Práctica 03, cuando ya has visto
   tu propia atestación verificarse.
4. Los de **Sigstore**, solo si te quedaste con la duda de qué se firma cuando no
   hay clave. No hacen falta para completar la semana.

> [!NOTE]
> Buena parte de este material habla de **GitHub Advanced Security**, **Secret
> Protection** o **Code Security**, que son de pago en repositorios privados. En
> repositorios **públicos** —los del bootcamp— secret scanning, push protection,
> code scanning, los advisories y el reporte privado son gratuitos.
>
> Si un enlace se rompe, [abre un issue](https://github.com/ergrato-dev/bc-github/issues)
> proponiendo el reemplazo.

---

← [Volver a la Semana 14](../../README.md)
