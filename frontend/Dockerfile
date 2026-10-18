# ---------------------------------------------------------------------------
# Red Velvet — Frontend (React + Vite), servido por Nginx.
# Vite incrusta las variables VITE_* en el build, por eso se pasan como ARG.
# ---------------------------------------------------------------------------
FROM node:18-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE
ARG VITE_IMG_BASE
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_IMG_BASE=$VITE_IMG_BASE
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
