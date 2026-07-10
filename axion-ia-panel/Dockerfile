# ═══════════════════════════════════════════════════════════════════
# AxionIA Panel - Frontend React/Vite Dockerfile
# ═══════════════════════════════════════════════════════════════════

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte (excluindo api/ e engine/)
COPY index.html ./
COPY vite.config.js ./
COPY src/ ./src/
COPY public/ ./public/

# Build da aplicação React/Vite
RUN npm run build

# Stage 2: Production com Nginx
FROM nginx:alpine

# Copiar build da aplicação
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx (se necessário)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# Nginx roda automaticamente
CMD ["nginx", "-g", "daemon off;"]
