# Proyecto Semana 09 — El CI de tu repositorio

> Tu repositorio deja de confiar en que alguien ejecute los tests antes de
> mergear. Los ejecuta la plataforma, en tres versiones, y el ruleset no deja
> pasar nada si fallan.

## 🎯 Objetivo

Montar el CI real del proyecto: tests en matriz, caché de dependencias,
artifacts descargables y un check estable que la Semana 08 pueda exigir.

## 📦 Qué añade esta capa

La Semana 08 dejó `main` protegida, pero el único check que exigía validaba el
**título** del PR. Eso comprueba la forma, no el fondo. Esta semana el check pasa
a ser lo que importa.

Y prepara las tres siguientes:

- **Semana 10**: este `ci.yml` es lo que vas a factorizar en un *reusable
  workflow* y en una action propia. Sin él no hay nada que reutilizar
- **Semana 11**: los `permissions` mínimos y el job agregador son la base del
  workflow de despliegue con OIDC y environment
- **Semana 12**: el artifact de build es lo que acabará adjunto a un release
  firmado

## ✅ Requisitos verificables

Estos son exactamente los que comprueba `checks.json`:

1. [ ] Existe `.github/workflows/ci.yml`
2. [ ] El workflow declara `permissions` explícitas
3. [ ] Las actions de terceros van pinneadas por SHA
4. [ ] El workflow está activo en el repositorio
5. [ ] Hay al menos un run con conclusión `success`
6. [ ] Hay al menos un run disparado por un `pull_request`
7. [ ] La matriz produce 3 o más checks sobre el último commit de `main`
8. [ ] Hay un check con nombre estable (`CI`) que agrega la matriz
9. [ ] Se ha publicado al menos un artifact
10. [ ] Existe al menos una entrada de caché
11. [ ] El check `CI` es requerido por el ruleset
12. [ ] `CONTRIBUTING.md` documenta cómo depurar un workflow

## 🎨 Criterios de calidad

Lo que la API no ve:

- **`permissions` es el mínimo real, no el que copiaste.** Si tu CI solo lee el
  repositorio, `contents: read` y nada más. Comprobación honesta: ponlo a
  `permissions: {}` y mira qué falla de verdad
- **Ninguna interpolación `${{ github.event.* }}` dentro de un `run:`.** Los
  datos del payload van por `env:`. Compruébalo:
  ```bash
  grep -rnE '\$\{\{ *github\.(event|head_ref)' .github/workflows/
  ```
- **Todo `run:` con una tubería lleva `shell: bash`.** Si no, tienes tests que
  pueden fallar en verde y no lo sabes
- **El check requerido tiene nombre estable.** Si el ruleset exige contexts con
  la matriz entre paréntesis, el siguiente cambio de matriz te bloquea
- **Las versiones de la matriz están vivas.** Node 20 en 2026 es gastar runners
  en algo que nadie usa
- **El CI tarda menos de cinco minutos.** Si tarda más, mira dónde se va el
  tiempo antes de añadir nada
- **Los nombres de jobs y steps explican qué hacen.** Un log que es una lista de
  comandos crudos no lo lee nadie

## 💡 Adaptación a tu dominio

El CI es de las capas menos dependientes del dominio, pero lo que **comprueba**
sí cambia. Un CI que solo ejecuta `node --test` sobre tres funciones triviales no
demuestra gran cosa: aprovecha para añadir los casos límite que tu dominio tiene
de verdad.

| Dominio | Un caso límite que merece un test en CI |
|---------|------------------------------------------|
| 📖 Biblioteca | Devolver el mismo día del préstamo: ¿multa de 0 o error? |
| 🏋️ Gimnasio | Dos reservas simultáneas para la última plaza |
| 🎥 Cine | Butaca vendida entre que se muestra y se confirma |
| 💊 Farmacia | Lote que caduca hoy: ¿se puede dispensar? |

Ese es el test que hace que el CI signifique algo, y el que la Semana 13 usará
como base cuando entre CodeQL.

## 🚦 Cómo entregarlo

```bash
./scripts/verificar-semana.sh 09 --repo <tu-usuario>/<tu-repo>
```

## 🧯 Errores comunes

| Error | Por qué pasa | Solución |
|-------|--------------|----------|
| El PR no se puede mergear con los tests en verde | La matriz renombró los checks y el ruleset pide el nombre viejo | Job agregador con nombre fijo |
| El CI sale verde sin probar nada | Tubería sin `pipefail` | `shell: bash` |
| Un valor llega vacío y el job sigue | Las expresiones sin resolver dan cadena vacía | `: "${VAR:?mensaje}"` |
| El segundo job de la matriz falla al subir el artifact | Nombre repetido | `${{ matrix.node }}` en el nombre |
| La caché nunca acierta | Sin lockfile, o `key` sin `hashFiles` | Versiona el lockfile |
| El workflow no aparece en el botón *Run workflow* | `workflow_dispatch` exige rama por defecto | Mergéalo primero |
| Runs duplicados por cada push | `on: [push, pull_request]` sin filtros | `push` a `main`, `pull_request` al resto |
| Los logs son ilegibles | `ACTIONS_STEP_DEBUG` se quedó activo | `gh variable delete ACTIONS_STEP_DEBUG` |

## 🔗 Navegación

← [Volver a la Semana 09](../README.md)
