# ============================================================
# Dockerfile — imagen mínima del proyecto
# ============================================================
# Completo a propósito: es contenido, no ejercicio. Cámbialo por lo que
# tu proyecto necesite ejecutar.
#
# Tres cosas NO son opcionales y por eso están aquí:
#   · la etiqueta org.opencontainers.image.source, que vincula el paquete
#     con su repositorio
#   · el usuario no-root, porque una imagen que corre como root es una
#     decisión, no un descuido
#   · --frozen-lockfile, para que la imagen no dependa de lo que haya
#     publicado el registro esta mañana
# ============================================================

FROM node:22-alpine

# Corepack instala la versión de pnpm que declara `packageManager` en el
# package.json: la misma del CI y la de tu portátil.
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Dependencias primero: esta capa solo se reconstruye si cambia el lockfile.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY src ./src

# La imagen base trae ya un usuario `node` sin privilegios.
USER node

# Sustituye por el punto de entrada real de tu proyecto.
CMD ["node", "src/index.js"]

# Las tres etiquetas OCI que GitHub usa para vincular y describir el paquete.
# docker/metadata-action las genera también; se dejan aquí para que la imagen
# siga vinculada aunque se construya a mano.
LABEL org.opencontainers.image.source="https://github.com/OWNER/REPO"
LABEL org.opencontainers.image.description="Sustituye por una frase que describa el proyecto"
LABEL org.opencontainers.image.licenses="MIT"
