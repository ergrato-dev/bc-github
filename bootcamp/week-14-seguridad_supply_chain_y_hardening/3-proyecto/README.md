# Proyecto Semana 14 — Tu repositorio se puede auditar

> Tu repositorio ya construye, publica, firma y se defiende. Esta semana añade lo
> que falta para que **alguien de fuera pueda comprobarlo sin fiarse de ti**: el
> secreto que no entra, la puerta por la que llega un reporte, el inventario
> firmado de lo que publicas y una auditoría externa que se ejecuta sola cada
> semana.

## 🎯 Objetivo

Cerrar los cuatro huecos del mapa de la cadena de suministro —fuente, reporte,
publicación y auditoría— y dejar el repositorio en un estado que se pueda
enseñar: cada control con su motivo, y cada afirmación verificable con un
comando.

## 📦 Qué añade esta capa

La Semana 13 dejó el repositorio mirándose a sí mismo. Esta contesta la pregunta
que viene después: **¿por dónde entraría alguien que quisiera meter código suyo
en lo que tú publicas, y quedaría rastro?**

Al terminar tienes:

- **Secret scanning y push protection** activos, y la experiencia de haber visto
  el bloqueo funcionar con una credencial real
- **Higiene de secretos**: `.gitignore` que cubre `.env`, `*.pem` y `*.key`, y un
  `.env.example` que documenta las variables sin filtrar ninguna
- **Un `SECURITY.md` que se puede seguir**: versiones con soporte, canal privado,
  plazos y alcance
- **El reporte privado activo**, con el formulario probado
- **Un advisory en borrador** bien formado, con paquete, rango y versión
  parcheada — y sin publicar
- **El SBOM del artefacto** generado en cada release y **atestado**
- **La verificación documentada** en el README, con el comando exacto
- **Scorecard** analizando el repositorio cada semana y publicando en code
  scanning
- **Un mapa** en el README que dice qué control cubre qué eslabón

Y prepara la siguiente:

- **Semana 15**: REST, GraphQL y `gh api` — el guion de auditoría que recorre
  todo esto de una pasada, en vez de comprobarlo a mano

## ✅ Requisitos verificables

Son exactamente los que comprueba `checks.json`:

1. [ ] `secret_scanning` está en `enabled`
2. [ ] `secret_scanning_push_protection` está en `enabled`
3. [ ] Las alertas de secret scanning son legibles por API
4. [ ] No queda ninguna alerta de secreto abierta
5. [ ] Nadie se ha saltado la protección de push
6. [ ] El `.gitignore` ignora los archivos `.env`
7. [ ] Existe `SECURITY.md` en la raíz de la rama por defecto
8. [ ] Y enlaza el formulario `security/advisories/new`
9. [ ] El reporte privado de vulnerabilidades está activo
10. [ ] Hay al menos un advisory en estado `draft`
11. [ ] Con paquete afectado y `patched_versions` declarados
12. [ ] **Ningún** advisory en estado `published`
13. [ ] El SBOM del grafo se puede exportar (`SPDX-2.x`)
14. [ ] `cadena-de-suministro.yml` genera el SBOM del artefacto
15. [ ] Y lo atesta con `actions/attest` anclada por SHA
16. [ ] Declarando `id-token: write` y `attestations: write`
17. [ ] Ese workflow no usa ninguna action por tag flotante
18. [ ] `scorecard.yml` usa `ossf/scorecard-action` anclada por SHA
19. [ ] Y sube el SARIF a code scanning con su propia `category`
20. [ ] Hay al menos un análisis de la herramienta `Scorecard`
21. [ ] El `README.md` explica la cadena de suministro

> [!IMPORTANT]
> Las comprobaciones 1 a 5 y la 20 leen ajustes y alertas de seguridad. Son
> endpoints que **solo funcionan sobre repositorios propios**: el scope `repo`
> que concede `gh auth login` los cubre, pero en un repositorio ajeno devuelven
> `403` por diseño.

> [!CAUTION]
> La comprobación 12 no es un descuido: es un entregable. Publicar un advisory de
> práctica lo mete en la GitHub Advisory Database, que es una base de datos real
> y global. Genera alertas falsas a terceros y hay que retirarlo a mano.

## 🎨 Criterios de calidad

Lo que la API no ve:

- **El bloqueo se probó con una credencial real y no se saltó.** Un token
  inventado no dispara los patrones de GitHub: quien «lo probó» con
  `ghp_1234...` no ha probado nada
- **Se revocó antes de limpiar.** El orden es el entregable de verdad de la
  Práctica 01; el commit borrado es lo de menos
- **El `SECURITY.md` promete plazos que puedes cumplir tú solo.** Un compromiso
  de 24 horas en un proyecto de una persona es una mentira educada
- **El advisory tiene un rango de versiones comprobado.** Inventar `< 1.1.0` sin
  saber desde cuándo existe el fallo es lo que produce alertas inútiles al otro
  lado
- **El SBOM describe el artefacto, no el repositorio.** Si aparecen tus
  dependencias de desarrollo, se escaneó lo que no era
- **La atestación apunta al archivo exacto que se publica.** Reempaquetar después
  cambia el digest y deja la firma sin sujeto
- **Los permisos de escritura viven en el job.** `attestations: write` e
  `id-token: write` nunca a nivel de workflow
- **Los checks de Scorecard se atacaron por riesgo, no por número.** Cerrar
  `Token-Permissions` vale más que subir dos décimas persiguiendo `Contributors`
- **El mapa del README lo entiende alguien que no hizo el bootcamp.** Es el
  documento que justifica trece semanas de trabajo en una tabla

## 📐 Cómo se ve al terminar

```
<tu-repo>/
├── .github/
│   ├── dependabot.yml                                         # Semana 13
│   ├── RESPUESTA-SEGURIDAD.md         # ← plantilla de primera respuesta
│   └── workflows/
│       ├── ci.yml · ci-reutilizable.yml · etiquetar-pr.yml    # Semanas 09-10
│       ├── oidc-claims.yml · deploy-pages.yml                 # Semana 11
│       ├── release.yml · publicar-imagen.yml · publicar-npm.yml  # Semana 12
│       ├── dependabot-automerge.yml · dependency-review.yml   # Semana 13
│       ├── codeql.yml · analisis-estatico.yml                 # Semana 13
│       ├── cadena-de-suministro.yml   # ← SBOM del artefacto + atestación
│       └── scorecard.yml              # ← auditoría externa semanal
├── .env.example                       # ← variables documentadas, sin valores
├── .gitignore                         # ← .env, *.pem, *.key
├── SECURITY.md                        # ← política real con canal privado
└── README.md                          # ← insignia + mapa de la cadena

Ajustes que no viven en el repositorio (y por eso se documentan):
  secret_scanning                        → enabled
  secret_scanning_push_protection        → enabled
  private-vulnerability-reporting        → enabled: true
  security-advisories                    → 1 en draft, 0 en published
```

## 🔍 Autoevaluación

Antes de dar la semana por cerrada, contesta sin mirar:

1. ¿Por qué revocar va antes que limpiar la historia?
2. ¿Qué queda registrado cuando alguien se salta push protection, y dónde se consulta?
3. ¿Por qué una cadena inventada con formato de token no dispara el bloqueo?
4. ¿Qué tres campos de un advisory deciden si la alerta llega a tus usuarios?
5. ¿Qué diferencia hay entre el SBOM del grafo y el SBOM del build?
6. ¿Qué firma exactamente Sigstore si no hay clave privada guardada?
7. ¿Por qué `--signer-workflow` da más garantía que `--owner`?
8. ¿En qué nivel de SLSA te dejó la Semana 12 y qué falta para el siguiente?
9. ¿Por qué publicar un advisory de práctica es un problema para terceros?

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 14 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 14](../README.md)
