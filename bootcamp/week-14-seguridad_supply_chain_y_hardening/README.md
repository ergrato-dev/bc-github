# Semana 14 — Seguridad: cadena de suministro y hardening

> Tu repositorio ya se mira a sí mismo. Esta semana aprende a **demostrar** lo
> que dice: que el secreto no entró, que el fallo se puede reportar en privado,
> que el artefacto trae su inventario firmado, y que todo eso lo puede comprobar
> alguien que no te conoce.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Situar cualquier control de seguridad en el eslabón de la cadena que defiende
- Distinguir prevenir, detectar y demostrar, y saber qué te falta de cada caja
- Activar secret scanning y push protection, y probar el bloqueo con una credencial real
- Responder a una filtración en el orden correcto, empezando por revocar
- Explicar por qué reescribir la historia no elimina un secreto de GitHub
- Escribir un `SECURITY.md` que alguien pueda seguir, con plazos sostenibles
- Recibir reportes en privado y convertirlos en un advisory bien formado
- Exportar el SBOM del repositorio y generar el del artefacto que publicas
- Firmar ese inventario con una atestación y verificarlo por tipo de predicado
- Auditar el conjunto con Scorecard y priorizar por riesgo, no por puntuación

## 📋 Prerrequisitos

- Semana 13 completada: Dependabot, CodeQL en verde y SARIF de terceros
- Semana 12: al menos un release publicado y la atestación de procedencia funcionando
- Semana 11: `permissions` mínimas por job, OIDC y actions ancladas por SHA
- Semana 08: un ruleset activo en `main` — Scorecard lo puntúa
- Tu repositorio del bootcamp, **público**, con `package.json` y `pnpm-lock.yaml`
- `gh` autenticado con permisos de administración sobre tu repositorio
  (`./scripts/verificar-semana.sh --doctor`)

> [!NOTE]
> Todo lo de esta semana es **gratuito en repositorios públicos**. La
> documentación oficial está escrita desde GitHub Advanced Security, Secret
> Protection y Code Security, que son de pago en repositorios privados: si una
> página insiste en licencias, comprueba a qué tipo de repositorio se refiere.

## 🗂️ Estructura de la Semana

```
week-14-seguridad_supply_chain_y_hardening/
├── 0-assets/     01-eslabones-de-la-cadena · 02-el-secreto-filtrado
│                 03-el-circulo-del-advisory · 04-de-la-firma-a-la-verificacion
├── 1-teoria/     01-la-cadena-de-suministro · 02-secret-scanning
│                 03-push-protection · 04-la-vida-de-un-secreto-filtrado
│                 05-recibir-un-reporte-de-vulnerabilidad
│                 06-los-advisories-del-repositorio · 07-sbom
│                 08-attestations · 09-scorecard
├── 2-practicas/  01-secretos-que-no-entran · 02-la-puerta-de-los-reportes
│                 03-sbom-y-attestations · 04-scorecard-y-hardening
├── 3-proyecto/   el secreto que no entra, la puerta que se abre y el inventario firmado
├── 4-recursos/ · 5-glosario/ · checks.json · rubrica-evaluacion.md
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [`01-la-cadena-de-suministro.md`](1-teoria/01-la-cadena-de-suministro.md) | Los cinco eslabones, prevenir/detectar/demostrar, niveles de SLSA, el mapa | 25 min |
| [`02-secret-scanning.md`](1-teoria/02-secret-scanning.md) | Qué se escanea, los tres tipos de patrón, la alerta campo a campo, validez | 25 min |
| [`03-push-protection.md`](1-teoria/03-push-protection.md) | El bloqueo en el servidor, los tres motivos de excepción, lo que no cubre | 20 min |
| [`04-la-vida-de-un-secreto-filtrado.md`](1-teoria/04-la-vida-de-un-secreto-filtrado.md) | Revocar, emitir, evaluar, limpiar — y por qué la historia no es el remedio | 20 min |
| [`05-recibir-un-reporte-de-vulnerabilidad.md`](1-teoria/05-recibir-un-reporte-de-vulnerabilidad.md) | `SECURITY.md` real, reporte privado, divulgación coordinada | 15 min |
| [`06-los-advisories-del-repositorio.md`](1-teoria/06-los-advisories-del-repositorio.md) | Estados, campos que hacen funcionar la alerta, fork privado, CVE | 20 min |
| [`07-sbom.md`](1-teoria/07-sbom.md) | SPDX y CycloneDX, el `purl`, el SBOM del grafo frente al del build | 20 min |
| [`08-attestations.md`](1-teoria/08-attestations.md) | Subject, predicado, Sigstore sin claves, verificar por tipo | 15 min |
| [`09-scorecard.md`](1-teoria/09-scorecard.md) | Los veinte checks, montarlo, y por qué el 10 no es el objetivo | 15 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [`01-secretos-que-no-entran.md`](2-practicas/01-secretos-que-no-entran.md) | Ves el bloqueo con una credencial real, la revocas y dejas el repo sin dónde resbalar | 50 min |
| [`02-la-puerta-de-los-reportes.md`](2-practicas/02-la-puerta-de-los-reportes.md) | Abres el canal privado y escribes tu primer advisory, sin publicarlo | 40 min |
| [`03-sbom-y-attestations.md`](2-practicas/03-sbom-y-attestations.md) | Generas el inventario del artefacto, lo firmas, lo verificas y lo publicas | 50 min |
| [`04-scorecard-y-hardening.md`](2-practicas/04-scorecard-y-hardening.md) | Dejas que te auditen desde fuera y cierras los dos huecos más baratos | 40 min |

### Proyecto

[`3-proyecto/`](3-proyecto/README.md) — tu repositorio con las dos capas de
secretos activas, una puerta de reporte que funciona, un artefacto con su
inventario firmado y una auditoría externa corriendo cada semana.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (9 archivos) | 2 h 55 min |
| Prácticas (4) | 3 h 00 min |
| Proyecto | 1 h 30 min |
| Revisión y verificación | 35 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Ver de un vistazo qué seguridad tienes activa | `gh api repos/{owner}/{repo} --jq '.security_and_analysis'` |
| Encender las dos capas de secretos por API | `-F 'security_and_analysis[secret_scanning][status]=enabled'` |
| Lo único que es una emergencia | `?validity=active` en la consulta de alertas de secretos |
| Quién se saltó la protección y cuándo | `?is_bypassed=true` — primera consulta de cualquier auditoría |
| Qué secretos ya están fuera | `?is_publicly_leaked=true` |
| Dónde está el secreto exactamente | `secret-scanning/alerts/N/locations`, el endpoint que nadie llama |
| Un token inventado no dispara nada | Los patrones llevan suma de comprobación: hay que probar con uno real |
| El bloqueo se comprueba por push, no por commit | Un secreto en un commit tumba el push entero |
| Saber si tu puerta de reportes está abierta | `gh api repos/{owner}/{repo}/private-vulnerability-reporting --jq '.enabled'` |
| El enlace que ahorra el paso que todos abandonan | `https://github.com/OWNER/REPO/security/advisories/new` |
| Crear el advisory ya con su fork privado | `"start_private_fork": true` al crearlo |
| Encontrar borradores olvidados | `gh api repos/{owner}/{repo}/security-advisories?state=draft` |
| El GHSA existe antes de publicar | Sirve para nombrar la rama del arreglo sin decir qué arregla |
| El SBOM del repositorio, en un comando | `gh api repos/{owner}/{repo}/dependency-graph/sbom` |
| Convertirlo en algo que se pueda `grep` | `--jq '.sbom.packages[].name'` |
| Ver qué dependencias entraron entre dos versiones | `diff` entre los SBOM de dos releases |
| `404` en el SBOM no es un permiso | Significa que no hay manifiestos reconocidos |
| `actions/attest-sbom` está deprecada | Usa `actions/attest` con `sbom-path` |
| Verificar el SBOM, no la procedencia | `--predicate-type https://spdx.dev/Document/v2.3` |
| Verificación estrecha de verdad | `--signer-workflow OWNER/REPO/.github/workflows/x.yml` |
| Rechazar lo firmado en runners ajenos | `--deny-self-hosted-runners` |
| Verificar sin conexión | `gh attestation download` y `gh attestation trusted-root` |
| Un artefacto puede tener varias atestaciones | Filtra con `?predicate_type=` en el endpoint |
| La puntuación de cualquier proyecto, sin autenticarse | `curl -s https://api.scorecard.dev/projects/github.com/OWNER/REPO` |
| Lo que más sube con menos trabajo | `Token-Permissions` y `Pinned-Dependencies` |
| Puntúa y es gratis | `persist-credentials: false` en cada `checkout` |

## 📌 Entregables

1. ✅ Secret scanning y push protection activos, sin alertas abiertas ni bypasses
2. ✅ `.gitignore` cubriendo `.env`, `*.pem` y `*.key`, con un `.env.example`
3. ✅ `SECURITY.md` en la raíz, enlazando `/security/advisories/new`
4. ✅ Reporte privado de vulnerabilidades activado
5. ✅ Un advisory en `draft` con paquete, rango y `patched_versions` — y ninguno publicado
6. ✅ SBOM del repositorio exportable en SPDX
7. ✅ `cadena-de-suministro.yml` generando y atestando el SBOM del artefacto
8. ✅ El SBOM adjunto al último release
9. ✅ `scorecard.yml` publicando sus hallazgos en code scanning
10. ✅ `README.md` con la insignia y el mapa de la cadena de suministro

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 14 --repo <tu-usuario>/<tu-repo>
```

> [!NOTE]
> Seis comprobaciones leen ajustes y alertas de seguridad. Son endpoints que
> **solo funcionan sobre repositorios propios**: el scope `repo` que concede
> `gh auth login` los cubre, pero en un repositorio ajeno devuelven `403` por
> diseño.

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 13: Dependabot y code scanning](../week-13-seguridad_dependabot_y_code_scanning/README.md) | **Semana 14: Cadena de suministro y hardening** | [Semana 15: API REST, GraphQL y `gh` CLI →](../week-15-api_rest_graphql_y_gh_cli/) |

← [Volver al inicio del bootcamp](../../README.md)
