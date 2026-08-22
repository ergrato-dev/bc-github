# Actions en Docker

> El tercer tipo de action existe por una razón concreta: cuando la herramienta
> que necesitas no es JavaScript. Fuera de ese caso, casi siempre es la opción
> equivocada.

## 🎯 Objetivos

- Escribir una action de contenedor con su `Dockerfile`
- Pasar entradas y recuperar salidas desde dentro del contenedor
- Entender el coste de arranque y cómo eliminarlo con una imagen preconstruida
- Conocer sus tres limitaciones duras
- Decidir con criterio entre Docker, JavaScript y composite

## 1. Qué problema resuelve

Tu comprobación depende de una herramienta que no está en el runner y cuya
instalación es lenta o frágil: un binario de Go, un intérprete de Python con
paquetes del sistema, un linter que trae media distribución detrás.

Una action de Docker empaqueta **el entorno entero**. Quien la usa no instala
nada: el runner descarga la imagen y ejecuta el contenedor.

## 2. La forma mínima

```yaml
# action.yml
name: Comprobar enlaces
description: Verifica los enlaces relativos del repositorio
author: tu-usuario

inputs:
  ruta:
    description: Carpeta que se comprueba
    required: false
    default: "."

outputs:
  rotos:
    description: Número de enlaces rotos encontrados

runs:
  using: docker
  image: Dockerfile
  args:
    - ${{ inputs.ruta }}
```

```dockerfile
# Dockerfile
FROM alpine:3.22

RUN apk add --no-cache bash grep coreutils
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
```

```bash
#!/usr/bin/env bash
# entrypoint.sh
set -euo pipefail

ruta="${1:-.}"
rotos=$(grep -rlE '\]\((\.\./|\./)' "$ruta" | wc -l)

# Los outputs se escriben en el archivo que apunta $GITHUB_OUTPUT
echo "rotos=$rotos" >> "$GITHUB_OUTPUT"
[ "$rotos" -eq 0 ] || { echo "::error::$rotos enlaces rotos"; exit 1; }
```

## 3. Cómo llegan los datos al contenedor

| Dato | Cómo llega |
|------|-----------|
| Inputs | Variables `INPUT_<NOMBRE>` **y**, si los declaras, como `args` del entrypoint |
| El repositorio | Montado en `/github/workspace`, que es el directorio de trabajo |
| Variables del runner | `GITHUB_SHA`, `GITHUB_REF`, `GITHUB_EVENT_PATH`… disponibles dentro |
| Outputs | Escribiendo en el archivo al que apunta `$GITHUB_OUTPUT` |
| Fallo del step | Código de salida distinto de cero |

Dos avisos prácticos:

- El contenedor corre **como `root`** por defecto, así que los archivos que cree
  quedan con ese propietario. Un step posterior que los toque desde el usuario
  del runner puede fallar con *permission denied*
- `args` sustituye a `CMD`, no a `ENTRYPOINT`. Si el entrypoint ignora sus
  argumentos, los `args` del `action.yml` no hacen nada

## 4. El coste de arranque, y cómo quitarlo

Con `image: Dockerfile`, el runner **construye la imagen en cada ejecución del
job**. Para una imagen sencilla son entre 30 y 90 segundos añadidos a cada run —
más que lo que suele tardar el trabajo real.

La alternativa es publicar la imagen una vez y referenciarla:

```yaml
runs:
  using: docker
  image: docker://ghcr.io/tu-usuario/comprobar-enlaces:1.2.0
```

| | `image: Dockerfile` | `image: docker://…` |
|---|---------------------|---------------------|
| Arranque | Build en cada job | Solo descarga |
| Reproducibilidad | Depende del `FROM` y de la red | Fija si usas digest |
| Publicación | Ninguna | Hay que publicar en un registro |
| Bueno para | Desarrollo de la action | Uso real |

Y para que sea de verdad reproducible, la referencia va **por digest**, no por
tag: `ghcr.io/tu-usuario/comprobar-enlaces@sha256:…`. Publicar en GHCR es la
Semana 12.

## 5. Las tres limitaciones duras

1. **Solo runners Linux.** Una action de Docker no corre en `windows-latest` ni
   en `macos-latest`. Si tu action tiene que servir para todos, no puede ser de
   contenedor
2. **Arranque lento** frente a JavaScript, que empieza a ejecutar de inmediato
3. **Aísla el sistema de archivos**: solo ves lo montado en `/github/workspace`,
   y las herramientas preinstaladas del runner no están dentro del contenedor

## 6. Cuál de los tres

| Situación | Tipo |
|-----------|------|
| Secuencia de steps que ya funcionan | Composite |
| Lógica, API de GitHub, multiplataforma | JavaScript |
| Herramienta que no es JS, dependencias del sistema | Docker |
| Herramienta que ya existe como imagen publicada | Docker con `docker://` |
| Algo que solo usas tú, una vez | Ninguno: un `run:` |

Regla honesta: **si dudas entre JavaScript y Docker, es JavaScript**. Casi todo
lo que hay en el Marketplace lo es, y por buenas razones.

## 7. Antipatrones

| Antipatrón | Por qué duele | Qué hacer |
|------------|---------------|-----------|
| Docker para lo que hace un `run:` | Un minuto de build por dos comandos | `run:` o composite |
| `image: Dockerfile` en una action de uso real | Build en cada job, para todos los que la usen | Imagen publicada |
| `FROM ubuntu:latest` | La imagen cambia bajo tus pies y el arranque es lento | Base pequeña y fijada |
| Referenciar la imagen por tag móvil | Deja de ser reproducible | Digest `@sha256:…` |
| Ignorar el propietario de los archivos creados | *Permission denied* en el step siguiente | `chown`, o crear en `/tmp` |
| Escribir el output por salida estándar | No se lee así | `$GITHUB_OUTPUT` |
| Prometer soporte multiplataforma | Solo funciona en Linux | Dilo en el README |
| Instalar dependencias en el entrypoint | Cada run repite la instalación | En el `Dockerfile` |

## 8. Trucos

- **Prueba el contenedor en local** antes de subirlo:
  ```bash
  docker build -t mi-action .
  docker run --rm -v "$PWD:/github/workspace" -w /github/workspace \
    -e GITHUB_OUTPUT=/dev/stdout mi-action .
  ```
- **Base pequeña**: `alpine` o `-slim` bajan la descarga a segundos
- **`docker://` con digest** para la versión publicada, `Dockerfile` mientras
  desarrollas
- **Declara en el README que es una action de contenedor**: quien la use en
  `macos-latest` lo agradecerá antes de perder media hora
- **Las variables `GITHUB_*` están dentro**: no hace falta pasarlas como inputs
- **Si el arranque duele y el trabajo es simple**, reescribirla en Node suele
  costar menos que optimizar la imagen

## 📚 Recursos Adicionales

- [GitHub Docs — Create a Docker container action](https://docs.github.com/actions/tutorials/create-actions/create-a-docker-container-action)
- [GitHub Docs — Metadata syntax: `runs` para Docker](https://docs.github.com/actions/reference/workflows-and-actions/metadata-syntax)
- [GitHub Docs — Dockerfile support for GitHub Actions](https://docs.github.com/actions/sharing-automations/creating-actions/dockerfile-support-for-github-actions)

## ✅ Checklist de Verificación

- [ ] Sabes cómo llegan los inputs y cómo salen los outputs de un contenedor
- [ ] Sabes qué cuesta `image: Dockerfile` en cada job
- [ ] Conoces las tres limitaciones duras de este tipo de action
- [ ] Sabes por qué la imagen publicada se referencia por digest
- [ ] Sabes decidir entre Docker y JavaScript sin dudar
