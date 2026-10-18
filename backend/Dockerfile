# ---------------------------------------------------------------------------
# Red Velvet — Backend (Node.js + Express)
# Build multi-etapa: compila dependencias nativas (bcrypt) en "deps" y copia
# solo lo necesario a la imagen final para mantenerla ligera.
# ---------------------------------------------------------------------------
FROM node:18-slim AS deps
WORKDIR /app
# Herramientas para compilar bcrypt si no hay binario precompilado para el SO.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:18-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /app/uploads
EXPOSE 3000
CMD ["node", "src/server.js"]
