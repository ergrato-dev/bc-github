# Semana 10 — Actions: reutilización y actions propias

> El CI de la Semana 09 funciona. Esta semana deja de ser un archivo que se
> copia y pasa a ser algo que se llama, se versiona y se publica.

## 🎯 Objetivos de la Semana

Al finalizar esta semana serás capaz de:

- Elegir entre starter workflow, reusable workflow, composite action y action propia
- Escribir un workflow invocable con `workflow_call`, con inputs, outputs y secretos
- Entender por qué los permisos solo se pueden reducir en una cadena de llamadas
- Empaquetar steps repetidos en una **composite action** y evitar sus tres trampas
- Escribir una **action de JavaScript** que lee el evento, llama a la API y devuelve un output
- Saber cuándo una action debe ser de **Docker** y por qué casi nunca lo es
- Probar y mantener una action: autoprueba, `dist/` al día, deprecaciones
- **Versionar y publicar** una action con `v1.0.0` y tag mayor móvil

## 📋 Prerrequisitos

- Semana 09 completada: `ci.yml` con matriz, caché y artifacts, en verde
- Semana 08: ruleset en `main` exigiendo un check con nombre estable
- Node.js 24 en local (`node --version`) para ejecutar los tests de la action
- Una cuenta con **2FA activo**, si vas a publicar en el Marketplace

## 🗂️ Estructura de la Semana

```
week-10-actions_reutilizacion_y_actions_propias/
├── 0-assets/     01-donde-vive-la-reutilizacion · 02-reusable-vs-composite
│                 03-ciclo-de-vida-de-una-action
├── 1-teoria/     01-que-reutilizar-y-como-elegir · 02-reusable-workflows
│                 03-composite-actions · 04-actions-en-javascript
│                 05-actions-en-docker · 06-probar-y-mantener-una-action
│                 07-versionar-publicar-y-compartir
├── 2-practicas/  01-reusable-workflow · 02-composite-action
│                 03-action-en-javascript · 04-publicar-la-action
├── starter/      ci-reutilizable.yml · accion-preparar-entorno/ · accion-tamano-pr/
├── 3-proyecto/   CI factorizado + una action publicada en v1
├── 4-recursos/ · 5-glosario/ · checks.json · rubrica-evaluacion.md
```

## 📝 Contenidos

### Teoría

| Archivo | Tema | Duración |
|---------|------|:--------:|
| [`01-que-reutilizar-y-como-elegir.md`](1-teoria/01-que-reutilizar-y-como-elegir.md) | Los cuatro mecanismos, granularidad, dónde vive cada uno | 25 min |
| [`02-reusable-workflows.md`](1-teoria/02-reusable-workflows.md) | `workflow_call`, inputs, secretos, permisos, límites | 25 min |
| [`03-composite-actions.md`](1-teoria/03-composite-actions.md) | `using: composite`, `shell`, sin `secrets`, `action_path` | 25 min |
| [`04-actions-en-javascript.md`](1-teoria/04-actions-en-javascript.md) | `node24`, inputs y outputs, toolkit, `dist/`, `pre` y `post` | 25 min |
| [`05-actions-en-docker.md`](1-teoria/05-actions-en-docker.md) | Contenedor, coste de arranque, tres limitaciones duras | 20 min |
| [`06-probar-y-mantener-una-action.md`](1-teoria/06-probar-y-mantener-una-action.md) | Autoprueba con `uses: ./`, `dist` al día, deprecar | 20 min |
| [`07-versionar-publicar-y-compartir.md`](1-teoria/07-versionar-publicar-y-compartir.md) | Tags `v1`/`v1.0.0`, Marketplace, starter workflows | 20 min |

### Prácticas

| Práctica | Qué haces | Duración |
|----------|-----------|:--------:|
| [`01-reusable-workflow.md`](2-practicas/01-reusable-workflow.md) | Extraes el CI a un workflow invocable, y ves cómo rompe el ruleset | 45 min |
| [`02-composite-action.md`](2-practicas/02-composite-action.md) | Composite action propia, con el error de `shell` provocado a propósito | 40 min |
| [`03-action-en-javascript.md`](2-practicas/03-action-en-javascript.md) | Action que etiqueta cada PR por tamaño, sin dependencias | 45 min |
| [`04-publicar-la-action.md`](2-practicas/04-publicar-la-action.md) | Repositorio propio, `v1.0.0`, tag móvil, release y consumo por SHA | 40 min |

### Starter

[`starter/`](starter/README.md) — un workflow reutilizable a medias, una
composite action a medias y una action de JavaScript cuyos tests **fallan a
propósito** hasta que completas la lógica. `permissions`, pines por SHA y
`shell:` vienen puestos desde el principio: no son opcionales.

### Proyecto

[`3-proyecto/`](3-proyecto/README.md) — tu CI repartido en llamador, workflow
reutilizable y composite action, más un segundo repositorio con tu primera
action publicada en `v1` y consumida por SHA desde el hilo conductor.

## ⏱️ Distribución del Tiempo (8 horas)

| Actividad | Tiempo |
|-----------|-------:|
| Teoría (7 archivos) | 2 h 40 min |
| Prácticas (4) | 2 h 50 min |
| Proyecto | 2 h |
| Revisión y verificación | 30 min |
| **Total** | **8 h** |

## ⚠️ La única semana con dos repositorios

Todo el bootcamp trabaja sobre un repositorio hilo conductor. Esta semana crea
uno auxiliar, y por un motivo concreto: **el Marketplace exige `action.yml` en la
raíz del repositorio**, y la raíz del tuyo ya está ocupada por tu proyecto.

| Repositorio | Qué contiene |
|-------------|--------------|
| `<tu-repo>` | El CI factorizado y la composite action local |
| `accion-tamano-pr` | La action publicada, con su `action.yml` en la raíz |

El nombre `accion-tamano-pr` no es decorativo: las comprobaciones automáticas lo
buscan por ese nombre exacto en tu cuenta.

## 🎩 Trucos y atajos

| Truco | Cómo |
|-------|------|
| La regla del tercer uso | La primera vez lo escribes, la segunda lo copias, la tercera lo factorizas |
| Empieza dentro del repositorio | `./.github/actions/<nombre>`: reutilizas sin publicar ni versionar nada |
| Una action local necesita `checkout` antes | Si no, `Can't find 'action.yml'` |
| Nombres de check al anidar | Pasan a ser `llamador / job (matriz)`: el ruleset necesita un agregador estable |
| Agregador honesto | `if: always()` **más** comprobar `needs.<job>.result` a mano |
| El job que llama no lleva `runs-on` | Solo `uses`, `with`, `secrets`, `needs`, `if`, `permissions`, `strategy` |
| `env:` no se hereda al reusable | Lo que necesite, como `input` |
| Los permisos solo se reducen | Si el reusable necesita `write`, lo concede el llamador |
| `shell:` obligatorio en composite | Es el fallo número uno, y el error no lo dice claro |
| Los inputs son cadenas | `if: ${{ inputs.x == 'true' }}`, nunca contra el booleano |
| Sin `secrets` en composite | El token se pasa como input explícito |
| Scripts propios de una action | `${{ github.action_path }}/scripts/x.sh` |
| Sin dependencias, sin empaquetador | `main: src/index.mjs` funciona; con toolkit hace falta `dist/` |
| Comprobar que `dist/` está al día | Job de CI que rebuild y hace `git diff --quiet dist` |
| Autoprueba de una action | `uses: ./` en su propio workflow, en los tres sistemas operativos |
| El SHA de un tag | `gh api repos/OWNER/REPO/tags --jq '.[] \| select(.name=="v1") \| .commit.sha'` |
| Tag mayor móvil | `git tag -f -a v1 -m "v1 → v1.2.3" && git push -f origin v1` |
| Nunca muevas `v1.2.3` | Rompe los builds de quien la tenga pinneada por SHA |
| Notas de release automáticas | `gh release create v1.0.0 --generate-notes` |
| Depurar la lógica sin runner | Sepárala del acceso a la API y ejecútala con `node --test` |

## 📌 Entregables

1. ✅ `.github/workflows/ci-reutilizable.yml` con `workflow_call` e inputs
2. ✅ `ci.yml` reducido a eventos, llamada y job agregador con nombre estable
3. ✅ El check `CI` sigue siendo el requerido por el ruleset de la Semana 08
4. ✅ Composite action `preparar-entorno` en uso, con su README y su output
5. ✅ Action de JavaScript que etiqueta los PR, con tests en verde
6. ✅ Repositorio `accion-tamano-pr` público, con `action.yml` en la raíz
7. ✅ Tags `v1.0.0` y `v1`, y una release publicada
8. ✅ El hilo conductor consume la action publicada **pinneada por SHA**

## ✅ Verificación

```bash
./scripts/verificar-semana.sh 10 --repo <tu-usuario>/<tu-repo>
```

## 🔗 Navegación

| Anterior | Actual | Siguiente |
|----------|--------|-----------|
| [← Semana 09: Actions fundamentos](../week-09-actions_fundamentos/README.md) | **Semana 10: Reutilización y actions propias** | [Semana 11: Seguridad, entornos y CD →](../week-11-actions_seguridad_entornos_y_cd/README.md) |

← [Volver al inicio del bootcamp](../../README.md)
