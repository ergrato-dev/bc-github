# Runners: hosted, self-hosted y aislamiento

> Un runner de GitHub es una máquina que nace, ejecuta tu job y se destruye. Uno
> propio es una máquina tuya, con tu red y tu disco, ejecutando código que a
> veces no es tuyo. Toda la diferencia de seguridad está en esa frase.

## 🎯 Objetivos

- Elegir entre runner de GitHub y runner propio con criterios, no por costumbre
- Entender por qué un self-hosted en un repositorio público es un riesgo grave
- Saber qué es un runner efímero y por qué es el único modo defendible
- Seleccionar runners con labels y grupos
- Auditar los runners de un repositorio por API

## 1. Qué problema resuelve

Los runners de GitHub cubren el 95 % de los casos y no hay que administrarlos.
El 5 % restante existe: hardware que GitHub no tiene, una licencia atada a una
máquina, una base de datos que solo es accesible desde una red privada, o un
build de tres horas que sale caro.

La decisión no es técnica, es de responsabilidad: con un runner propio, la
seguridad del entorno de ejecución pasa a ser tuya.

## 2. Los runners de GitHub

Para **repositorios públicos** —el caso de este bootcamp— las máquinas estándar
son generosas:

| Etiqueta | Máquina | Recursos |
|----------|---------|----------|
| `ubuntu-latest` | Linux x64 | 4 vCPU · 16 GB RAM · 14 GB disco |
| `ubuntu-24.04-arm` | Linux arm64 | 4 vCPU · 16 GB RAM · 14 GB disco |
| `windows-latest` | Windows x64 | 4 vCPU · 16 GB RAM · 14 GB disco |
| `macos-latest` | macOS arm64 | 3 vCPU · 7 GB RAM · 14 GB disco |
| `ubuntu-slim` | Linux x64 mínimo | 1 vCPU · 5 GB RAM · 14 GB disco |

Verificado en agosto de 2026;
[la tabla completa está en la documentación](https://docs.github.com/actions/reference/runners/github-hosted-runners).
En repositorios privados las mismas etiquetas dan 2 vCPU y 8 GB.

Lo importante no es la tabla, son las tres propiedades:

- **Efímero**: la máquina se destruye al terminar el job. Lo que dejes ahí no
  existe en el siguiente run
- **Aislado**: cada job, su máquina. Dos jobs del mismo workflow no comparten
  nada que no pase por artifacts o caché
- **Público**: la imagen es conocida y auditada, y las herramientas instaladas
  están documentadas

Los **larger runners** (más CPU, IP estática, red privada) existen para
organizaciones en planes Team y Enterprise Cloud; no aplican a una cuenta
personal en Free.

## 3. Cuándo un runner propio

| Motivo | ¿Justifica un self-hosted? |
|--------|----------------------------|
| Hardware específico (GPU, ARM64 concreto, macOS antiguo) | Sí |
| Acceso a una red privada sin exponerla | Sí |
| Licencia de software atada a una máquina | Sí |
| Builds muy largos y muy frecuentes con coste alto | A veces |
| "Es que en local va más rápido" | No |
| "Para no configurar la caché" | No, arregla la caché |
| Guardar estado entre runs | **No**, y ese es el problema |

Ese último motivo aparece siempre y es exactamente lo que un runner no debe
hacer: si un job depende de lo que dejó el anterior, has convertido tu CI en una
máquina artesanal irreproducible.

## 4. El riesgo del repositorio público

> [!WARNING]
> **No uses runners self-hosted en un repositorio público.** Es la recomendación
> explícita de GitHub, y el motivo es directo: cualquiera puede abrir un pull
> request desde un fork, y ese PR puede modificar el workflow o los scripts que
> el runner ejecuta. Un atacante consigue ejecución de código en **tu** máquina,
> dentro de **tu** red.

Las mitigaciones ayudan y no cierran el agujero:

- La política de aprobación de contribuidores externos
  ([teoría 01](01-superficie-de-ataque-de-un-pipeline.md)) obliga a un clic
  humano antes de ejecutar; el clic se da con prisa
- Un runner efímero limita la persistencia, no el acceso durante el job
- Restringir la red saliente reduce la exfiltración, no la ejecución

Si aun así hace falta, el runner va en una red aislada, con un usuario sin
privilegios, sin credenciales en disco y sin acceso a nada que no sea el destino
del build.

## 5. Efímero o nada

Un runner persistente conserva entre jobs el disco, la caché de paquetes, las
variables exportadas y cualquier cosa que un job anterior haya dejado —incluido
lo que dejó un job hostil.

```bash
# Registro efímero: el runner se da de baja tras un solo job
./config.sh --url https://github.com/<owner>/<repo> --token <TOKEN-DE-REGISTRO> --ephemeral
./run.sh
```

El token de registro es de un solo uso y caduca en una hora; se obtiene por API:

```bash
gh api repos/{owner}/{repo}/actions/runners/registration-token --method POST --jq .token
```

Con `--ephemeral`, cada job arranca en una máquina limpia. Escalar eso a mano no
tiene sentido: es lo que hace
[Actions Runner Controller](https://github.com/actions/actions-runner-controller),
que levanta un pod por job en Kubernetes y lo destruye al acabar.

## 6. Elegir runner desde el workflow

```yaml
permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest                 # runner de GitHub

  gpu:
    runs-on: [self-hosted, linux, x64, gpu]   # todas las labels a la vez

  privado:
    runs-on:
      group: red-interna                   # grupo (organización o empresa)
      labels: [self-hosted, linux]
```

Con una lista de labels, el job va al primer runner que las tenga **todas**. Si
ninguno encaja, el job se queda en cola hasta que aparezca uno o hasta el timeout
del workflow: un job "colgado" suele ser una label mal escrita.

Los **runner groups** solo existen a nivel de organización o empresa; en una
cuenta personal se trabaja con labels.

## 7. Auditar lo que hay

```bash
# Runners registrados en el repositorio
gh api repos/{owner}/{repo}/actions/runners \
  --jq '.runners[] | {name, status, labels: [.labels[].name]}'

# Dónde corrió realmente cada job de un run
gh api repos/{owner}/{repo}/actions/runs/<run-id>/jobs \
  --jq '.jobs[] | {name, runner: .runner_name, grupo: .runner_group_name, labels}'
```

En un repositorio que no debería tener runners propios, la salida correcta es
`{"total_count":0,"runners":[]}`. Comprobarlo de vez en cuando es barato: un
runner registrado por alguien "para una prueba" es una puerta abierta que nadie
recuerda.

## 8. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Self-hosted en repositorio público | Ejecución de código arbitrario en tu red | Runners de GitHub |
| Runner persistente reutilizado entre jobs | El job siguiente hereda lo del anterior | `--ephemeral` |
| Secretos en el disco del runner | Cualquier job los lee | Que lleguen por `secrets:` o por OIDC |
| Runner con usuario administrador | Un fallo del job es un compromiso de la máquina | Usuario sin privilegios |
| Labels genéricas (`build`, `test`) | Un job acaba en la máquina equivocada | Labels que describen la máquina |
| Dar por hecho que el runner está limpio | Solo lo está si es efímero | Verificarlo, o asumir lo contrario |
| Runner registrado "para una prueba" y olvidado | Nadie lo parchea y sigue aceptando jobs | Auditar la lista |

## 9. Trucos

- **`runs-on: ubuntu-slim`** para jobs que solo llaman a la API: arranca antes y
  gasta menos
- **Matriz de sistemas operativos**: `runs-on: ${{ matrix.os }}` con
  `os: [ubuntu-latest, windows-latest, macos-latest]` (Semana 09)
- **Un job que no arranca nunca** casi siempre es una label que ningún runner
  tiene: revisa mayúsculas y guiones
- **El disco de 14 GB se llena** con imágenes Docker: `docker system prune -af`
  al empezar da aire
- **`runner_environment` del token OIDC** ([teoría 04](04-oidc-identidad-sin-secretos.md))
  permite exigir en el proveedor que el despliegue venga de un runner de GitHub
- **Antes de montar un self-hosted, mide**: `gh run list --json databaseId,conclusion,startedAt,updatedAt`
  te dice cuánto duran de verdad tus builds

## 📚 Recursos Adicionales

- [GitHub-hosted runners — especificaciones](https://docs.github.com/actions/reference/runners/github-hosted-runners)
- [Security hardening — self-hosted runners](https://docs.github.com/actions/reference/security/secure-use#hardening-for-self-hosted-runners)
- [About self-hosted runners](https://docs.github.com/actions/concepts/runners/self-hosted-runners)
- [Actions Runner Controller](https://github.com/actions/actions-runner-controller)

## ✅ Checklist de Verificación

- [ ] Sabes qué tres propiedades tiene un runner de GitHub
- [ ] Puedes explicar por qué self-hosted + repositorio público es peligroso
- [ ] Sabes qué cambia `--ephemeral` en el registro de un runner
- [ ] Sabes seleccionar un runner por labels y qué pasa si no encaja ninguno
- [ ] Has comprobado por API que tu repositorio no tiene runners registrados
