# Proyecto Semana 10 — Tu CI factorizado y tu primera action publicada

> El pipeline de la Semana 09 deja de ser un archivo copiable y pasa a ser algo
> que se llama con parámetros. Y publicas la primera pieza de software que otra
> persona puede usar en su CI.

## 🎯 Objetivo

Convertir el CI en tres piezas con responsabilidades separadas —llamador,
workflow reutilizable y actions— y publicar una de ellas con versiones de verdad.

## 📦 Qué añade esta capa

La Semana 09 dejó un CI que funciona. Esta semana responde a la pregunta
siguiente: **¿y cuando haya un segundo proyecto?**

Al terminar tienes:

- `ci.yml` — solo dice **cuándo** corre el pipeline
- `ci-reutilizable.yml` — dice **qué** hace, con `inputs` y `outputs`
- `.github/actions/preparar-entorno/` — los steps comunes, en una composite
- `accion-tamano-pr` — un repositorio aparte con una action publicada en `v1`

Y prepara las dos siguientes:

- **Semana 11**: el pin por SHA que has empezado a usar aquí se convierte en
  regla, junto con OIDC y los permisos mínimos
- **Semana 12**: la action versionada es el ensayo del release firmado de tu
  proyecto — mismos tags, mismo changelog, más garantías

## ✅ Requisitos verificables

Son exactamente los que comprueba `checks.json`:

1. [ ] Existe `.github/workflows/ci-reutilizable.yml`
2. [ ] Declara `on: workflow_call` con al menos un input
3. [ ] `ci.yml` lo invoca con `uses:`
4. [ ] Existe un check con nombre estable (`CI`) sobre el último commit de `main`
5. [ ] Ese check `CI` sigue siendo el requerido por el ruleset
6. [ ] Existe `.github/actions/preparar-entorno/action.yml`
7. [ ] Es una composite action (`runs.using: composite`)
8. [ ] El workflow reutilizable usa esa action local
9. [ ] Existe el repositorio `accion-tamano-pr`, público
10. [ ] Tiene `action.yml` en la raíz con `runs.using: node24`
11. [ ] Tiene los tags `v1.0.0` y `v1`, y ambos apuntan al mismo commit
12. [ ] Tiene al menos una release publicada
13. [ ] Un workflow de tu repositorio consume la action publicada pinneada por SHA
14. [ ] Hay al menos un PR etiquetado con una label `tamano:*`

## 🎨 Criterios de calidad

Lo que la API no ve:

- **Los `inputs` tienen `default` y `description`.** Un parámetro sin valor por
  defecto obliga a leerse el archivo antes de usarlo; uno sin descripción no
  aparece en el mensaje de error cuando falta
- **El job agregador comprueba `needs.<job>.result` a mano.** Con `if: always()`
  y sin esa comprobación, el check sale verde con el CI en rojo
- **La composite action no hace de más.** Si además de preparar el entorno
  ejecuta los tests, ya no es reutilizable: es el pipeline con otro nombre
- **El README de la action publicada trae inputs, outputs y `permissions`.** El
  bloque de permisos es lo que evita que todos tus usuarios descubran el 403 por
  su cuenta
- **La versión mayor de la action está justificada.** Si publicas `v1`, es que te
  comprometes a no romper su contrato sin subir a `v2`
- **Nada apunta a `@main`.** Ni tus workflows a actions ajenas, ni tu README
  recomendándolo

## 📐 Cómo se ve al terminar

```
<tu-repo>/
├── .github/
│   ├── actions/
│   │   └── preparar-entorno/
│   │       ├── action.yml
│   │       └── README.md
│   └── workflows/
│       ├── ci.yml                  # cuándo: eventos + llamada + agregador
│       ├── ci-reutilizable.yml     # qué: workflow_call, inputs, outputs
│       ├── etiquetar-pr.yml        # usa la action publicada, por SHA
│       └── validar-pr.yml          # de la Semana 07
└── ...

<tu-usuario>/accion-tamano-pr/      # repositorio aparte
├── action.yml                      # en la raíz: lo exige el Marketplace
├── README.md                       # inputs, outputs y permisos
├── src/{index.mjs,tamano.mjs}
├── test/tamano.test.mjs
└── .github/workflows/ci.yml        # tests + autoprueba con `uses: ./`
```

## 🔍 Autoevaluación

Antes de dar la semana por cerrada, contesta sin mirar:

1. ¿Por qué el nombre del check cambió al extraer el reusable workflow?
2. ¿Qué pasa si tu composite action tiene un `run:` sin `shell:`?
3. ¿Por qué tu action de JavaScript no necesita `dist/` y cuándo lo necesitaría?
4. ¿Qué rompes si mueves el tag `v1.0.0` en vez del `v1`?
5. ¿Qué le falta a alguien que copia tu ejemplo del README y recibe un 403?

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 10 --repo <tu-usuario>/<tu-repo>
```

---

← [Volver a la Semana 10](../README.md)
