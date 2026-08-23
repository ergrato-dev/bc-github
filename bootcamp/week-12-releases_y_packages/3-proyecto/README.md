# Proyecto Semana 12 — Tu repositorio publica versiones

> Hasta ahora tu repositorio tenía un sitio y un historial. Esta semana pasa a
> tener **producto**: versiones numeradas, una imagen que se ejecuta, un paquete
> que se instala, y una firma que demuestra de dónde salió cada cosa.

## 🎯 Objetivo

Convertir el pipeline de las semanas 09-11 en una cadena de publicación completa:
del mensaje de commit al artefacto verificable, sin que nadie escriba un número
de versión a mano.

## 📦 Qué añade esta capa

La Semana 11 dejó el despliegue detrás de una puerta. Esta contesta las preguntas
que empiezan cuando alguien de fuera quiere usar lo que has hecho: **qué versión
es**, **qué cambió**, **de dónde salió** y **cómo se comprueba**.

Al terminar tienes:

- **`v1.0.0` publicado a mano** y el candado de la inmutabilidad cerrado
- **`.github/release.yml`** agrupando las notas por tus propias etiquetas
- **`release-please`** calculando versión y `CHANGELOG.md` en un pull request
- **Un token fine-grained** con dos permisos sobre un solo repositorio
- **Una imagen en GHCR**, pública, etiquetada desde el tag y atestiguada
- **Un paquete en GitHub Packages**, con `publishConfig` y su `.tgz` firmado
- **Un `README.md`** que explica cómo verificar antes de instalar

Y prepara las dos siguientes:

- **Semana 13**: Dependabot deja de cubrir solo las actions y pasa a las
  dependencias del proyecto, con CodeQL sobre el código que ahora publicas
- **Semana 14**: SBOM, advisories, Scorecard — el resto de la cadena de
  suministro alrededor de estos mismos artefactos

## ✅ Requisitos verificables

Son exactamente los que comprueba `checks.json`:

1. [ ] Hay un release publicado, marcado como `latest` y no borrador
2. [ ] Sus notas tienen contenido, no un cuerpo vacío
3. [ ] Hay al menos dos releases: el manual y el automatizado
4. [ ] `.github/release.yml` declara categorías
5. [ ] Los releases publicados son inmutables
6. [ ] Existe `CHANGELOG.md`
7. [ ] Existe `release-please-config.json`
8. [ ] `.release-please-manifest.json` declara una versión SemVer
9. [ ] El workflow de release usa `release-please` pinneado y `RELEASE_PLEASE_TOKEN`
10. [ ] El secreto `RELEASE_PLEASE_TOKEN` existe
11. [ ] El `Dockerfile` declara `org.opencontainers.image.source`
12. [ ] El workflow de la imagen declara `packages`, `id-token` y `attestations`
13. [ ] Ninguna action del workflow de la imagen va por tag o rama
14. [ ] La imagen existe en GHCR y es **pública**
15. [ ] El workflow del paquete pide `id-token: write` y atestigua
16. [ ] El `package.json` declara `publishConfig.registry`
17. [ ] El paquete está publicado en GitHub Packages
18. [ ] El `README.md` explica cómo verificar la procedencia

> [!IMPORTANT]
> Las comprobaciones 14 y 17 llaman a la API de packages: hace falta
> `gh auth refresh -s read:packages` y que el paquete se llame igual que el
> repositorio. Sin el scope devuelven `403` y el script las cuenta como fallo.

## 🎨 Criterios de calidad

Lo que la API no ve:

- **La versión la decide el impacto, no el esfuerzo.** Si un `feat:` tuyo rompe
  la compatibilidad y no lleva `!`, el número miente, aunque todos los checks
  pasen
- **El `README.md` declara cuál es la API pública.** Sin esa frase, ninguna
  decisión de versión es defendible
- **Las notas empiezan por un resumen que contesta «¿debo actualizar?»**. La
  lista generada dice qué cambió; no dice si te afecta
- **Las entradas del `CHANGELOG.md` se entienden sin abrir el commit.** Si una no
  se entiende, el mensaje de commit estaba mal y el PR de release era el momento
  de verlo
- **El token de `release-please` tiene dos permisos y un repositorio.** Con
  `Administration` o apuntando a toda tu cuenta, el ejercicio queda invalidado
- **Los permisos de escritura viven en el job que los usa**, nunca a nivel de
  workflow: `packages`, `id-token` y `attestations` solo donde se publica
- **El sujeto de la atestación de la imagen es el digest.** Con la etiqueta,
  firmas algo que se puede mover
- **La verificación está documentada y la has ejecutado tú.** Una atestación que
  nadie comprueba es un adorno

## 📐 Cómo se ve al terminar

```
<tu-repo>/
├── .github/
│   ├── release.yml                 # ← categorías de las notas
│   ├── dependabot.yml              # Semana 11
│   └── workflows/
│       ├── ci.yml · ci-reutilizable.yml · etiquetar-pr.yml   # Semanas 09-10
│       ├── oidc-claims.yml · deploy-pages.yml                # Semana 11
│       ├── release.yml             # ← el PR de release, el tag y el release
│       ├── publicar-imagen.yml     # ← GHCR + atestación + verificación
│       └── publicar-npm.yml        # ← paquete + atestación
├── release-please-config.json      # ← cómo se versiona
├── .release-please-manifest.json   # ← la versión actual, fuente de verdad
├── CHANGELOG.md                    # ← lo escribe release-please
├── Dockerfile                      # ← pnpm, no-root, etiquetas OCI
├── package.json                    # ← scope, files, publishConfig
└── README.md                       # ← versionado y cómo verificar

Ajustes que no viven en el repositorio (y por eso se documentan):
  immutable-releases           → enabled: true
  actions/secrets              → RELEASE_PLEASE_TOKEN (fine-grained, 1 repo)
  packages/container/<repo>    → visibility: public (solo por interfaz)
```

## 🔍 Autoevaluación

Antes de dar la semana por cerrada, contesta sin mirar:

1. ¿Qué pasa si borras un release y no su tag? ¿Y al revés?
2. ¿Por qué una refactorización de tres semanas puede ser un `PATCH`?
3. ¿Por qué un push directo a `main` no aparece en las notas generadas?
4. ¿Por qué el `GITHUB_TOKEN` no puede abrir el pull request de release?
5. ¿Por qué el paquete de GHCR nace privado si el repositorio es público?
6. ¿Qué afirma exactamente una atestación de procedencia, y qué no afirma?
7. ¿Cómo retirarías una versión mala sin borrar nada?

## ✅ Verificación

```bash
gh auth refresh -s read:packages
./scripts/verificar-semana.sh 12 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 12](../README.md)
