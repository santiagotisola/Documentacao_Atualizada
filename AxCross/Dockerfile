# ═══════════════════════════════════════════════════════════════════
# AxCross.Docs - Portal Docusaurus Dockerfile
# ═══════════════════════════════════════════════════════════════════

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte
COPY . .

# Build do Docusaurus
RUN npm run build

# Stage 2: Production com Nginx
FROM nginx:alpine

# Copiar build do Docusaurus
COPY --from=builder /app/build /usr/share/nginx/html

# Configurar Nginx para SPA (Docusaurus)
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
