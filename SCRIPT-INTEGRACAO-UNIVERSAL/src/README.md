# 🚀 Integração Universal — Framework Modular

Framework Node.js para criar **assistentes inteligentes com integração completa** a ERPs, Helpdesks, WhatsApp e CRM. Projetado para ser adaptado a qualquer negócio.

---

## ⚡ Quick Start

### Opção 1: Docker (Recomendado)
```bash
# Copiar e configurar variáveis
cp src/.env.example src/.env
# Editar src/.env com suas credenciais

# Subir tudo
docker compose up -d

# Verificar
curl http://localhost:3100/api/status
```

### Opção 2: Local
```bash
cd src
cp .env.example .env
npm install
npm run dev
```

**Requisitos:** Node.js 20+, MongoDB 6+ (local ou Atlas)

---

## 📦 Módulos

| Módulo | Rota | Função |
|--------|------|--------|
| IA Engine | `/api/ia` | Motor de respostas (keywords → embeddings → LLM) |
| WhatsApp | `/api/whatsapp` | Atendimento via Baileys (gratuito) |
| Helpdesk | `/api/helpdesk` | Gestão de tickets multi-plataforma |
| ERP | `/api/erp` | Consultas ao sistema de gestão |
| CRM | `/api/crm` | Contatos, histórico, segmentação |
| Relatórios | `/api/relatorio` | Geração JSON/CSV/HTML |
| Scheduler | `/api/scheduler` | Polling + auto-resposta por cron |
| Webhooks | `/api/webhook` | Receber eventos de sistemas externos |

---

## 🔧 Configuração (.env)

### Obrigatórios
```env
MONGO_URI=mongodb://localhost:27017/integracao-universal
OPENAI_API_KEY=sk-...
```

### Opcionais (ativar módulos)
```env
# WhatsApp
WHATSAPP_ENABLED=true

# Helpdesk
HELPDESK_PLATFORM=proprio|jitbit|zendesk|freshdesk
HELPDESK_URL=https://...
HELPDESK_TOKEN=...

# ERP
ERP_MODO=banco_direto|api
ERP_DB_TYPE=mysql|sql_server|postgresql
ERP_DB_HOST=...

# Scheduler
POLLING_ENABLED=true
POLLING_INTERVAL=2

# Segurança
API_TOKEN=seu-token-aqui
WEBHOOK_SECRET=hmac-secret
RATE_LIMIT_MAX=100
```

---

## 🏗️ Arquitetura

```
src/
├── app.js                    ← Entry point
├── middlewares/
│   ├── seguranca.js          ← Rate limit, headers, sanitização
│   ├── logger.js             ← Log estruturado (JSON em prod)
│   └── error-handler.js      ← Tratamento centralizado de erros
├── modules/
│   ├── ia-engine/            ← 3 camadas: keyword → embedding → LLM
│   ├── whatsapp/             ← Baileys + máquina de estados
│   ├── helpdesk/             ← Adapter pattern multi-plataforma
│   ├── erp/                  ← Conector banco direto ou API REST
│   ├── database/             ← Adapter SQL Server/MySQL/PostgreSQL
│   ├── scheduler/            ← Cron polling automático
│   ├── relatorios/           ← Templates + query custom
│   ├── crm/                  ← CRUD + histórico + segmentação
│   └── webhook/              ← Receptor de eventos com HMAC
```

---

## 🔒 Segurança

- **Rate Limiting**: 100 req/min geral, 20 req/min para IA
- **Headers**: X-Content-Type-Options, HSTS, CSP, X-Frame-Options
- **NoSQL Injection**: Sanitização automática de operadores `$`
- **Autenticação**: Bearer token por API_TOKEN
- **Webhooks**: Validação HMAC-SHA256
- **SQL Injection**: Queries parametrizadas em todos os adaptadores

---

## 🎯 Casos de Uso

| Negócio | Módulos usados |
|---------|----------------|
| **Farmácia** | IA + WhatsApp + ERP (estoque) + CRM |
| **Clínica** | IA + WhatsApp + Helpdesk + Agendamento |
| **Restaurante** | IA + WhatsApp + ERP (pedidos) |
| **E-commerce** | IA + Helpdesk + CRM + Webhooks (pagamento) |
| **SaaS/Suporte** | IA + Helpdesk + Scheduler + Relatórios |

---

## 📡 API Endpoints Principais

### IA Engine
```bash
POST /api/ia/perguntar     # Pergunta com resposta inteligente
POST /api/ia/treinar       # Adicionar conhecimento à base
GET  /api/ia/base          # Ver knowledge base
```

### WhatsApp
```bash
POST /api/whatsapp/conectar    # Gerar QR Code
GET  /api/whatsapp/status      # Estado da conexão
POST /api/whatsapp/enviar      # Enviar mensagem
```

### CRM
```bash
GET  /api/crm/contatos         # Listar (paginado, busca, filtros)
POST /api/crm/contatos         # Criar contato
GET  /api/crm/buscar-telefone/:tel  # Busca por telefone
GET  /api/crm/stats            # Dashboard estatísticas
```

### Webhooks
```bash
POST /api/webhook/:tipo        # Receber evento externo
GET  /api/webhook/status       # Ver handlers registrados
```

---

## 🐳 Deploy em Produção

```bash
# Build e subir
docker compose -f docker-compose.yml up -d --build

# Ver logs
docker logs -f integracao-universal

# Escalar (se necessário)
docker compose up -d --scale app=3
```

### Variáveis de Produção
```env
NODE_ENV=production
LOG_LEVEL=warn
CORS_ORIGIN=https://meusite.com.br
API_TOKEN=token-forte-gerado
WEBHOOK_SECRET=secret-hmac-256
```

---

## 📋 Checklist de Implantação

- [ ] Configurar `.env` com credenciais reais
- [ ] Testar conexão MongoDB (`/api/status`)
- [ ] Configurar knowledge base via `/api/ia/treinar`
- [ ] Conectar WhatsApp (escanear QR via `/api/whatsapp/conectar`)
- [ ] Configurar ERP (banco direto ou API)
- [ ] Definir templates de relatório
- [ ] Configurar webhooks nos sistemas externos
- [ ] Ativar scheduler para auto-resposta
- [ ] Definir CORS para domínios de produção
- [ ] Configurar backup do MongoDB

---

## 📄 Licença

Uso interno — adaptar conforme necessidade do cliente.
