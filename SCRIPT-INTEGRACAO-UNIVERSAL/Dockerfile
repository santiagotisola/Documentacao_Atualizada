FROM node:20-alpine

WORKDIR /app

# Instalar dependências primeiro (cache de layers)
COPY src/package.json ./
RUN npm install --omit=dev

# Copiar código
COPY src/ ./

# Porta padrão
EXPOSE 3100

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3100/api/status || exit 1

# Iniciar
CMD ["node", "--env-file=.env", "app.js"]
