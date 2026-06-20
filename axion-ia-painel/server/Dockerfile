FROM node:20-alpine

WORKDIR /app

# Dependências
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Código-fonte
COPY src/ ./src/

# Documentos públicos (Política de Privacidade LGPD, etc.)
COPY public/ ./public/

# Pastas de runtime (criadas se não existirem)
RUN mkdir -p uploads logs whatsapp-auth

EXPOSE 3100

CMD ["node", "--env-file=.env", "src/app.js"]
