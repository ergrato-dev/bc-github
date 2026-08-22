# Proyecto Semana 11 — Tu repositorio despliega, y con permiso

> Hasta ahora el pipeline terminaba cuando los tests pasaban. Esta semana
> termina cuando hay algo publicado en internet, se sabe qué versión es, quién
> autorizó su publicación y cómo se vuelve atrás.

## 🎯 Objetivo

Convertir el CI de las semanas 09 y 10 en un pipeline de entrega continua con
permisos mínimos, dependencias pinneadas, una identidad OIDC comprendida y un
despliegue real detrás de una puerta con revisor.

## 📦 Qué añade esta capa

La Semana 10 dejó el CI repartido en piezas reutilizables. Esta responde a las
cuatro preguntas que nadie contesta hasta que hay un incidente: **qué código
corre**, **con qué permisos**, **quién autoriza el despliegue** y **cómo se
deshace**.

Al terminar tienes:

- **Políticas de repositorio**: token de solo lectura por defecto, pinning por
  SHA obligatorio, aprobación para contribuidores externos, retención acotada
- **`.github/dependabot.yml`** manteniendo los pines al día
- **`.github/workflows/oidc-claims.yml`** y `docs/confianza-oidc.md`: sabes qué
  dice tu identidad y qué condición la ataría a un proveedor cloud
- **`.github/workflows/deploy-pages.yml`**: construir, validar, desplegar,
  verificar
- **Un sitio publicado** con la versión sellada, detrás del environment
  `github-pages` con revisor
- **`docs/despliegue.md`** con el procedimiento y el rollback

Y prepara las dos siguientes:

- **Semana 12**: el mismo pipeline, disparado por un tag, publicando releases y
  paquetes con procedencia verificable
- **Semana 13**: Dependabot deja de cubrir solo las actions y pasa a cubrir las
  dependencias del proyecto, con CodeQL encima

## ✅ Requisitos verificables

Son exactamente los que comprueba `checks.json`:

1. [ ] `default_workflow_permissions` es `read`
2. [ ] `can_approve_pull_request_reviews` es `false`
3. [ ] `sha_pinning_required` es `true`
4. [ ] La política de forks es `all_external_contributors`
5. [ ] `.github/dependabot.yml` declara el ecosistema `github-actions`
6. [ ] `oidc-claims.yml` declara `id-token: write`
7. [ ] La personalización del `sub` está en `use_default: true`
8. [ ] Existe `.github/workflows/deploy-pages.yml`
9. [ ] El job de despliegue declara `pages: write` e `id-token: write`
10. [ ] Ninguna action del workflow de despliegue va por tag o rama
11. [ ] El despliegue usa `cancel-in-progress: false`
12. [ ] Pages se publica con `build_type: workflow`
13. [ ] Existe `sitio/index.html`, el contenido que se publica
14. [ ] El environment `github-pages` exige revisores
15. [ ] Solo despliega desde ramas protegidas
16. [ ] Existe el environment `staging`
17. [ ] Hay al menos un despliegue registrado en `github-pages`
18. [ ] Existe `docs/despliegue.md`

## 🎨 Criterios de calidad

Lo que la API no ve:

- **Los permisos se piden donde se usan.** `permissions: contents: read` en el
  workflow y la ampliación **solo** en el job que despliega. Un `pages: write` a
  nivel de workflow es un permiso regalado a cuatro jobs que no lo necesitan
- **El job de despliegue no hace `checkout`.** Si lo hace, es que reconstruye; si
  reconstruye, despliega algo que nadie validó
- **La `url` del environment sale de un output**, no escrita a mano
- **El comentario de aprobación dice qué comprobaste.** "ok" no es una revisión;
  "el artefacto sella el SHA correcto" sí
- **La condición OIDC de `docs/confianza-oidc.md` es estrecha**: `StringEquals`,
  con `aud` y con `sub` atado a un environment. Un `*` en el `sub` invalida el
  ejercicio entero
- **`docs/despliegue.md` se puede seguir sin ti**: comando exacto de rollback,
  cómo se verifica y cuánto dura la ventana
- **Los pines llevan el tag en comentario.** Cuarenta caracteres sin contexto son
  irrevisables en un PR

## 📐 Cómo se ve al terminar

```
<tu-repo>/
├── .github/
│   ├── dependabot.yml              # los pines, al día
│   ├── actions/preparar-entorno/   # de la Semana 10
│   └── workflows/
│       ├── ci.yml                  # Semana 09-10
│       ├── ci-reutilizable.yml     # Semana 10
│       ├── etiquetar-pr.yml        # Semana 10
│       ├── oidc-claims.yml         # ← identidad, sin secretos
│       └── deploy-pages.yml        # ← construir · validar · desplegar · verificar
├── docs/
│   ├── confianza-oidc.md           # ← la condición y por qué es estrecha
│   └── despliegue.md               # ← procedimiento y rollback
├── sitio/index.html                # ← lo que se publica
└── ...

Ajustes que no viven en el repositorio (y por eso se documentan):
  actions/permissions            → sha_pinning_required: true
  actions/permissions/workflow   → read, sin aprobar PR
  environments/github-pages      → revisor + ramas protegidas
  environments/staging           → variable SITE_ENTORNO
```

## 🔍 Autoevaluación

Antes de dar la semana por cerrada, contesta sin mirar:

1. ¿Qué pasa exactamente cuando un job declara `environment:` y hay revisores?
2. ¿Por qué `id-token: write` no es un permiso peligroso sobre tu repositorio?
3. ¿Qué permitiría de más una condición de confianza con `sub: repo:OWNER/REPO:*`?
4. ¿Por qué el job de despliegue no debe hacer `checkout`?
5. ¿Cuánto dura tu ventana de rollback rápido y de qué ajuste depende?
6. ¿Qué se rompería si activaras `sha_pinning_required` antes de pinnear?

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 11 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 11](../README.md)
