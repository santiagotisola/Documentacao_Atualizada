# ═══════════════════════════════════════════════════════════════════
# AxionIA API - Backend Node.js/Express Dockerfile
# ═══════════════════════════════════════════════════════════════════

FROM node:20-alpine

WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Dependências
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Código-fonte
COPY src/ ./src/

# Documentos públicos (Política de Privacidade LGPD, etc.)
COPY public/ ./public/

# Pastas de runtime (criadas se não existirem)
RUN mkdir -p uploads logs whatsapp-auth reports screenshots

# Variáveis de ambiente padrão (sobrescritas pelo docker-compose)
ENV NODE_ENV=production
ENV PORT=3100

EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3100/api/portal/health || exit 1

# Comando sem --env-file (usa variáveis do Docker Compose)
CMD ["node", "src/app.js"]
