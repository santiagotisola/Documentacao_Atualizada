#!/usr/bin/env bash
# instalar-stack-free.sh
# Instala toda a stack gratuita na VPS em ~10 minutos
# Compatível com Ubuntu 22.04 / Debian 12
# Uso: bash instalar-stack-free.sh

set -e

echo ""
echo "============================================"
echo " AxionIA — Stack Gratuita"
echo " Custo operacional: R\$ 80/mês (apenas VPS)"
echo "============================================"
echo ""

# 1. Instalar Docker + Docker Compose
echo "📦 Instalando Docker..."
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

echo "📦 Instalando Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 2. Subir serviços
echo "🚀 Iniciando serviços (MongoDB, ChromaDB, Ollama, API, Painel)..."
docker-compose -f docker-compose-free-stack.yml up -d

# 3. Aguardar Ollama inicializar
echo "⏳ Aguardando Ollama iniciar (30s)..."
sleep 30

# 4. Baixar modelos de IA (grátis)
echo "🤖 Baixando modelos de IA (pode demorar 10-20 min na primeira vez)..."

# Modelo principal de análise (2GB)
docker exec ollama ollama pull llama3.2

# Modelo de embeddings (274MB)
docker exec ollama ollama pull nomic-embed-text

# Modelo de OCR visual (8GB — necessário para PDFs escaneados)
echo "📸 Baixando modelo de visão para OCR (llava 8GB)..."
docker exec ollama ollama pull llava:13b

# Modelo para propostas técnicas (melhor qualidade, 8GB)
echo "📄 Baixando modelo para propostas técnicas (gemma3:12b 8GB)..."
docker exec ollama ollama pull gemma3:12b

# 5. Instalar Tesseract.js (OCR de fallback, 100% free)
echo "🔤 Instalando Tesseract OCR..."
cd axion-ia-api
npm install tesseract.js pdf2pic

# 6. Configurar .env para modo free
echo "⚙️  Configurando modo gratuito..."
cat > axion-ia-api/.env << 'EOF'
# Modo de IA: free = usa Ollama (grátis) | paid = OpenAI | hybrid
IA_MODE=hybrid

# Ollama (LLM local)
OLLAMA_URL=http://localhost:11434

# ChromaDB (vector database local)
CHROMA_URL=http://localhost:8000
CHROMA_TOKEN=axiontoken123

# MongoDB local (substitui Atlas pago)
MONGO_URI=mongodb://axion:axionpass123@localhost:27017/axionia?authSource=admin

# OpenAI (opcional — apenas para fallback se Ollama falhar)
OPENAI_API_KEY=

# Porta da API
PORT=3100
EOF

echo ""
echo "✅ INSTALAÇÃO CONCLUÍDA!"
echo ""
echo "SERVIÇOS RODANDO:"
echo "  API:        http://localhost:3100"
echo "  Painel:     http://localhost:3001"
echo "  Ollama UI:  http://localhost:3002 (interface web dos modelos)"
echo "  ChromaDB:   http://localhost:8000"
echo "  Grafana:    http://localhost:3003 (monitoramento)"
echo ""
echo "CUSTO MENSAL ESTIMADO:"
echo "  VPS Hostinger:  R\$ 80/mês"
echo "  Todos os demais: R\$ 0"
echo "  TOTAL:          R\$ 80/mês"
echo ""
echo "ANTES (serviços pagos):"
echo "  OpenAI API:     R\$ 500-2.000/mês"
echo "  Pinecone:       R\$ 70/mês"
echo "  MongoDB Atlas:  R\$ 57/mês"
echo "  TOTAL:          R\$ 627-2.127/mês"
echo ""
echo "ECONOMIA:         -97% por mês 🎉"
echo ""
