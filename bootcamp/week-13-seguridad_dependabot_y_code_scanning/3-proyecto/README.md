# Proyecto Semana 13 — Tu repositorio se defiende

> Tu repositorio ya construye, publica y firma. Esta semana empieza a
> **defenderse**: sabe qué tiene instalado, se entera cuando algo de eso resulta
> ser vulnerable, abre él solo el pull request que lo arregla, y revisa el código
> que escribes antes de que llegue a `main`.

## 🎯 Objetivo

Cerrar las dos mitades del mismo problema —las dependencias que instalas y el
código que escribes— dejando todas las alertas en la misma bandeja y todas las
decisiones registradas con un motivo.

## 📦 Qué añade esta capa

La Semana 12 dejó una cadena de publicación verificable. Esta contesta la
pregunta que viene justo después: **qué se publica exactamente**. Un artefacto
firmado que arrastra una dependencia con un `critical` está perfectamente
firmado y perfectamente roto.

Al terminar tienes:

- **Alertas de Dependabot** activas, y la costumbre de leerlas por API
- **Actualizaciones de seguridad** abriendo pull requests sin que nadie las pida
- **`.github/dependabot.yml`** con `npm` y `github-actions`, agrupado y con
  enfriamiento
- **Auto-merge de parches**, condicionado por el autor y por los checks
  obligatorios del ruleset
- **Revisión de dependencias** bloqueando el pull request que introduce una
  dependencia vulnerable
- **CodeQL** analizando tu código **y tus workflows**, en el montaje avanzado
- **Una herramienta de terceros** publicando en la misma bandeja vía SARIF
- **Un `README.md`** que explica qué cubre cada control

Y prepara la siguiente:

- **Semana 14**: secret scanning, push protection, `SECURITY.md`, advisories,
  SBOM y Scorecard — el resto de la cadena de suministro alrededor de este mismo
  repositorio

## ✅ Requisitos verificables

Son exactamente los que comprueba `checks.json`:

1. [ ] `.github/dependabot.yml` declara el ecosistema `npm`
2. [ ] Y el ecosistema `github-actions`
3. [ ] Las actualizaciones se agrupan con `groups`
4. [ ] Hay un `cooldown` configurado
5. [ ] Las alertas de Dependabot están activas y son legibles por API
6. [ ] No queda ninguna alerta de dependencias abierta `high` o `critical`
7. [ ] Las actualizaciones de seguridad están activas y **no en pausa**
8. [ ] Dependabot ha abierto al menos un pull request
9. [ ] El auto-merge se limita a `version-update:semver-patch`
10. [ ] Y se condiciona por el autor del pull request, no por el título
11. [ ] Hay al menos un análisis de CodeQL registrado
12. [ ] CodeQL analiza también el lenguaje `actions`
13. [ ] El workflow de CodeQL declara `security-events: write`
14. [ ] No queda ninguna alerta de code scanning abierta `high` o `critical`
15. [ ] `dependency-review.yml` revisa cada pull request
16. [ ] Hay análisis de una herramienta que no es CodeQL
17. [ ] El SARIF de terceros se sube con su propia `category`
18. [ ] El workflow de análisis estático no usa ninguna action por tag flotante

> [!IMPORTANT]
> Las comprobaciones 5, 6, 11, 12, 14 y 16 leen alertas y análisis de seguridad.
> Son endpoints que **solo funcionan sobre repositorios propios**: el token de
> `gh auth login` los cubre con el scope `repo`, pero en un repositorio ajeno
> devuelven `403` por diseño.

## 🎨 Criterios de calidad

Lo que la API no ve:

- **Cero alertas accionables, no cero alertas.** Un panel limpio a base de
  descartes masivos es peor que uno con tres alertas que alguien está mirando
- **Cada descarte lleva su motivo y su comentario.** Un `dismissed_reason` sin
  `dismissed_comment` es una decisión sin argumento; dentro de un año no vas a
  poder reconstruirla
- **Ningún `ignore` tapa un arreglo de seguridad.** Ignorar los `major` de un
  paquete cuya única versión parcheada es un `major` es apagar la seguridad
  creyendo que se reduce ruido
- **El auto-merge no sustituye al criterio.** Solo `patch`, solo con checks
  obligatorios, y con los `minor` y `major` pasando por una persona
- **Los permisos de escritura viven en el job.** `security-events: write` y
  `pull-requests: write` nunca a nivel de workflow
- **Una `category` por herramienta.** Dos análisis compartiéndola se cierran las
  alertas mutuamente y el panel parpadea
- **El arreglo de la vulnerabilidad de la Práctica 03 es real.** Escapar la
  cadena no es arreglarlo: no construir la cadena, sí
- **El `README.md` explica qué cubre cada control**, para quien llegue dentro de
  un año y encuentre seis workflows sin contexto

## 📐 Cómo se ve al terminar

```
<tu-repo>/
├── .github/
│   ├── dependabot.yml              # ← npm + github-actions, groups, cooldown
│   ├── release.yml                                            # Semana 12
│   └── workflows/
│       ├── ci.yml · ci-reutilizable.yml · etiquetar-pr.yml    # Semanas 09-10
│       ├── oidc-claims.yml · deploy-pages.yml                 # Semana 11
│       ├── release.yml · publicar-imagen.yml · publicar-npm.yml  # Semana 12
│       ├── dependabot-automerge.yml   # ← solo parches, por autor
│       ├── dependency-review.yml      # ← bloquea en el pull request
│       ├── codeql.yml                 # ← código propio + lenguaje actions
│       └── analisis-estatico.yml      # ← SARIF de terceros con su category
├── src/                            # ← la vulnerabilidad de la Práctica 03, arreglada
├── Dockerfile                                                 # Semana 12
└── README.md                       # ← sección «Seguridad»

Ajustes que no viven en el repositorio (y por eso se documentan):
  vulnerability-alerts         → activas (204)
  automated-security-fixes     → enabled: true, paused: false
  code-scanning/default-setup  → not-configured (lo sustituye codeql.yml)
  allow_auto_merge             → true
```

## 🔍 Autoevaluación

Antes de dar la semana por cerrada, contesta sin mirar:

1. ¿Por qué sin lockfile no te llegan alertas de dependencias transitivas?
2. ¿Qué significa que `first_patched_version` sea `null` y qué haces entonces?
3. ¿Por qué el pull request de seguridad sube a la versión mínima y no a la última?
4. ¿En qué se diferencian las actualizaciones de seguridad de las de versión?
5. ¿Por qué el `GITHUB_TOKEN` llega de solo lectura en un workflow de Dependabot?
6. ¿Por qué `pull_request_target` no es la forma de arreglar eso?
7. ¿Qué encuentra CodeQL que un linter no puede encontrar?
8. ¿Qué pasa si dos herramientas suben SARIF con la misma `category`?
9. ¿Qué se rompe cuando un SARIF no trae `partialFingerprints`?

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 13 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 13](../README.md)
