# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: runtime (Nginx sirve el SPA) ────────────────────────────────────
FROM nginx:alpine AS runner

# Elimina config default de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Config para SPA Angular: todas las rutas caen en index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia el build de Angular
COPY --from=builder /app/dist/ops.jocoso.cl/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
