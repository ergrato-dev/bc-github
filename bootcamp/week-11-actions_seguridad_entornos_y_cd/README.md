# Semana 11 — Actions: seguridad, entornos y CD

> Tu pipeline ya construye y ya se reutiliza. Esta semana decide **qué código
> corre dentro**, **con qué permisos** y **quién autoriza que salga a internet**.
> Al final hay algo publicado, y se sabe quién dijo que sí.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Nombrar la superficie de ataque real de un run y cerrarla con políticas de repositorio
- Pinnear toda dependencia de workflow por SHA y mantenerla al día con Dependabot
- Activar `sha_pinning_required` sin romper tu CI
- Elegir el alcance correcto de un secreto y rotarlo en el orden que sirve
- Explicar el intercambio OIDC y **leer los claims** de tu propio token
- Escribir una condición de confianza estrecha, atada a un environment
- Montar un pipeline de CD completo: construir, validar, desplegar, verificar
- Aprobar y auditar despliegues por API, y volver atrás en un comando
- Decidir con criterio si un runner propio tiene sentido (casi nunca lo tiene)

## 📋 Prerrequisitos

- Semana 10 completada: CI repartido en llamador, reusable workflow y composite action
- Semana 08: ruleset activo en `main` (la política de ramas del environment se apoya en él)
- `gh` autenticado con permisos de administración sobre tu repositorio
- `jq`, `python3` y `curl` en local (`./scripts/verificar-semana.sh --doctor`)
- Tu repositorio del bootcamp, **público**: los environments con revisores y
  Pages son gratuitos en repos públicos

## 🗂️ Estructura de la Semana

```
week-11-actions_seguridad_entornos_y_cd/
├── 0-assets/     01-superficie-de-ataque · 02-oidc-handshake · 03-pipeline-de-cd
├── 1-teoria/     01-superficie-de-ataque-de-un-pipeline · 02-pinning-y-dependencias-del-workflow
│                 03-secretos-y-su-ciclo-de-vida · 04-oidc-identidad-sin-secretos
│                 05-environments-como-puerta-de-despliegue · 06-runners-hosted-y-self-hosted
│                 07-disenar-un-pipeline-de-cd
├── 2-practicas/  01-endurecer-los-workflows · 02-oidc-y-claims
│                 03-environments-y-pages · 04-cd-con-promocion
├── starter/      deploy-pages.yml · oidc-claims.yml · dependabot.yml · sitio/
├── 3-proyecto/   Pipeline de CD con puerta + sitio publicado + rollback documentado
├── 4-recursos/ · 5-glosario/ · checks.json · rubrica-evaluacion.md
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [`01-superficie-de-ataque-de-un-pipeline.md`](1-teoria/01-superficie-de-ataque-de-un-pipeline.md) | Qué corre en un run, qué se lleva quien lo controla, políticas del repositorio | 25 min |
| [`02-pinning-y-dependencias-del-workflow.md`](1-teoria/02-pinning-y-dependencias-del-workflow.md) | El tag es mutable, pin por SHA, Dependabot, `sha_pinning_required` | 25 min |
| [`03-secretos-y-su-ciclo-de-vida.md`](1-teoria/03-secretos-y-su-ciclo-de-vida.md) | Alcances, enmascarado y sus agujeros, fugas típicas, rotación | 25 min |
| [`04-oidc-identidad-sin-secretos.md`](1-teoria/04-oidc-identidad-sin-secretos.md) | El intercambio, los claims, el `sub` y las condiciones demasiado anchas | 25 min |
| [`05-environments-como-puerta-de-despliegue.md`](1-teoria/05-environments-como-puerta-de-despliegue.md) | Qué provoca `environment:`, deployments API, aprobar por terminal | 20 min |
| [`06-runners-hosted-y-self-hosted.md`](1-teoria/06-runners-hosted-y-self-hosted.md) | Especificaciones, el riesgo del repo público, runners efímeros | 20 min |
| [`07-disenar-un-pipeline-de-cd.md`](1-teoria/07-disenar-un-pipeline-de-cd.md) | Build once, cuatro etapas, disparadores, rollback, métricas | 20 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [`01-endurecer-los-workflows.md`](2-practicas/01-endurecer-los-workflows.md) | Auditas y cierras lo que ya tienes; provocas el fallo de la política de pinning | 50 min |
| [`02-oidc-y-claims.md`](2-practicas/02-oidc-y-claims.md) | Lees los claims de tu identidad y escribes la condición de confianza | 40 min |
| [`03-environments-y-pages.md`](2-practicas/03-environments-y-pages.md) | Publicas de verdad, con revisor, y apruebas el despliegue por API | 45 min |
| [`04-cd-con-promocion.md`](2-practicas/04-cd-con-promocion.md) | Validas el artefacto, ves la cola de despliegues y haces un rollback | 45 min |

### Starter

[`starter/`](starter/README.md) — el pipeline de CD a medias, el workflow de
claims OIDC y la configuración de Dependabot. Los permisos mínimos, los pines por
SHA, el `concurrency` sin cancelación y el `::add-mask::` vienen puestos: son el
temario, no un detalle de implementación.

### Proyecto

[`3-proyecto/`](3-proyecto/README.md) — tu repositorio con políticas endurecidas,
un sitio publicado detrás de una puerta con revisor, y el procedimiento de
despliegue y rollback escrito para que otra persona pueda ejecutarlo.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (7 archivos) | 2 h 40 min |
| Prácticas (4) | 3 h |
| Proyecto | 1 h 50 min |
| Revisión y verificación | 30 min |
| **Total** | **8 h** |

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| Auditar las políticas del repositorio | `gh api repos/{owner}/{repo}/actions/permissions` y sus tres hermanas |
| La red que salva del olvido | `default_workflow_permissions=read`: el workflow que no declara permisos nace de lectura |
| Que ningún bot apruebe PR | `can_approve_pull_request_reviews=false` |
| Encontrar lo que no está pinneado | `grep -rn "uses:" .github \| grep -v "@[0-9a-f]\{40\}"` |
| El SHA de un tag | `gh api repos/OWNER/REPO/tags --jq '.[] \| select(.name=="v1") \| .commit.sha'` |
| Hacer obligatorio el pinning | `-F sha_pinning_required=true` — pinnea antes, activa después |
| Actions del propio repo sin `checkout` | `uses: $/.github/actions/<nombre>` (julio 2026, runner 2.336.0+) |
| Los reusable workflows quedan fuera de la política | Siguen admitiendo tags |
| Enmascarar un valor generado en el run | `echo "::add-mask::$VALOR"` **antes** de usarlo |
| Comprobar un secreto sin imprimirlo | `[ -z "$TOKEN" ] && exit 1` |
| Rotar antes de limpiar | Revocar, reemitir, comprobar y **luego** borrar logs |
| Ver tus claims OIDC | Pedir el token y decodificar el payload al `$GITHUB_STEP_SUMMARY` |
| El claim que vale oro | `environment`: solo existe si el job pasó por la puerta |
| Condición estrecha | `sub: repo:OWNER/REPO:environment:production`, nunca con `*` |
| Consultar el formato de tu `sub` | `gh api repos/{owner}/{repo}/actions/oidc/customization/sub` |
| Aprobar un despliegue sin navegador | `POST .../actions/runs/<id>/pending_deployments` con `state=approved` |
| Saber si puedes aprobar tú | El campo `current_user_can_approve` de ese mismo endpoint |
| Despliegues que no se pisan | `concurrency` con `cancel-in-progress: false` |
| Rollback en un comando | `gh run rerun <id-del-run-bueno>` |
| Cuánto dura tu rollback rápido | `gh api repos/{owner}/{repo}/actions/permissions/artifact-and-log-retention` |
| Frecuencia de despliegue | `gh api --paginate "repos/{owner}/{repo}/deployments?environment=github-pages" --jq 'length'` |
| Comprobar que no hay runners propios | `gh api repos/{owner}/{repo}/actions/runners --jq .total_count` |
| Analizar los workflows antes del push | `actionlint` para sintaxis, `zizmor` para seguridad |

## 📌 Entregables

1. ✅ Token por defecto en `read` y workflows que no pueden aprobar PR
2. ✅ Cero actions ajenas sin pinnear, con `sha_pinning_required` activo
3. ✅ `.github/dependabot.yml` manteniendo los pines
4. ✅ Aprobación obligatoria para contribuidores externos
5. ✅ `oidc-claims.yml` y `docs/confianza-oidc.md` con la condición justificada
6. ✅ `deploy-pages.yml` con las cuatro etapas y permisos mínimos por job
7. ✅ Sitio publicado con Pages en modo `workflow`, con la versión sellada
8. ✅ Environment `github-pages` con revisor y ramas protegidas, y `staging` creado
9. ✅ Al menos un despliegue aprobado por API y registrado
10. ✅ `docs/despliegue.md` con el procedimiento y el rollback

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 11 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 10: Reutilización y actions propias](../week-10-actions_reutilizacion_y_actions_propias/README.md) | **Semana 11: Seguridad, entornos y CD** | [Semana 12: Releases y packages →](../week-12-releases_y_packages/README.md) |

← [Volver al inicio del bootcamp](../../README.md)
