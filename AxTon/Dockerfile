# ═══════════════════════════════════════════════════════════════════
# AxTon.Docs - Portal Docusaurus Dockerfile
# ═══════════════════════════════════════════════════════════════════

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências (--legacy-peer-deps por plugin de busca que ainda não declara suporte a React 19)
RUN npm ci --legacy-peer-deps

# Copiar código-fonte
COPY . .

# Build do Docusaurus
RUN npm run build

# Stage 2: Production com Nginx
FROM nginx:alpine

# Copiar build do Docusaurus
COPY --from=builder /app/build /usr/share/nginx/html

# Configurar Nginx para servir o site no baseUrl /AxTon.Docs/
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
  location = / { \
    return 302 /AxTon.Docs/; \
  } \
  location /AxTon.Docs/ { \
    rewrite ^/AxTon\.Docs/(.*)$ /$1 break; \
    try_files $uri $uri/ /index.html; \
  } \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/AxTon.Docs/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
