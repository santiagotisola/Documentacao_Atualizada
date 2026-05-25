# 🚀 PROJETO: SISTEMA UNIFICADO DE ATENDIMENTO — AXION HELPDESK 2.0

## Status: ANÁLISE E LEVANTAMENTO CONCLUÍDO
**Data:** 19/05/2026  
**Autor:** IA Copilot + Santiago  
**Objetivo:** Criar um sistema único que centraliza TUDO em um só ecossistema de atendimento

---

## PARTE 1 — ANÁLISE DO ECOSSISTEMA ATUAL

### 1.1 Plataformas em Uso

| Plataforma | Função | Canais | Limitações |
|-----------|--------|--------|-----------|
| **Jitbit** (desk.axiontecnologia.com.br) | Tickets de suporte AxHub/AxTon/AxCross | Email, Portal Web, API | Pouco omnichannel, sem WhatsApp nativo, IA básica |
| **Milvus** (app.milvus.com.br) | ITSM/atendimento multi-canal | WhatsApp, Chat, Email, Telefone | Sem integração com sistemas Axion |
| **Zendesk** (santiagosolaneto.zendesk.com) | Referência enterprise | Todos os canais | Custo elevado, complexidade |

### 1.2 Ecossistema Axion Atual (Backend IA)

**Integração Jitbit já implementada (`axion-ia-api/src/jitbit.js`):**
- ✅ Buscar tickets (filtros: mode, seção, técnico, data, status, prioridade)
- ✅ Buscar detalhes de ticket
- ✅ Buscar/postar comentários
- ✅ Listar técnicos
- ✅ Listar categorias
- ✅ Anexar arquivos
- ✅ Criar tickets via API
- ✅ Polling automático (scheduler)
- ✅ Análise de duplicados
- ✅ Mapeamento site ↔ categoria

**Módulos do Painel (`axion-ia-panel`):**
- ✅ ChamadosSites — Ranking, KPIs, duplicados, insights
- ✅ Helpdesk — Gestão de tickets
- ✅ Intelligence Hub — Análise cruzada
- ✅ Dashboard — Visão geral

**O que FALTA no ecossistema atual:**
- ❌ Canais: WhatsApp, Instagram, Facebook, Telegram, SMS
- ❌ Chat em tempo real (WebChat)
- ❌ IA Conversacional (chatbot autônomo)
- ❌ SLA Management automatizado
- ❌ Roteamento inteligente por skills
- ❌ Knowledge Base pública com deflection
- ❌ Portal do cliente com self-service
- ❌ Workforce management
- ❌ Quality assurance / scoring
- ❌ Customer 360° (perfil unificado)
- ❌ Análise de sentimento em tempo real
- ❌ Relatórios preditivos

---

## PARTE 2 — ANÁLISE COMPARATIVA DE MERCADO

### 2.1 O Que Há de Melhor no Mercado (2025-2026)

#### Top 10 Funcionalidades Essenciais

| # | Feature | Jitbit | Milvus | Zendesk | NOSSO SISTEMA |
|---|---------|--------|--------|---------|---------------|
| 1 | AI Routing Inteligente | Básico | Bom | Avançado | **AVANÇADO** |
| 2 | Omnichannel Unificado | Parcial | Forte | Robusto | **TOTAL** |
| 3 | Knowledge Base + Deflection | Sim | Sim | Avançado | **COM IA** |
| 4 | Agentes IA Autônomos | Não | Parcial | Sim | **SIM + RAG** |
| 5 | Automação/Workflows | Regras | Bom | Avançado | **VISUAL** |
| 6 | Analytics Real-time | CSV | Dashboard | Avançado | **PREDITIVO** |
| 7 | Portal Self-Service | Sim | Sim | Sim | **SIM** |
| 8 | Integração Completa | API | API | 1000+ | **NATIVA** |
| 9 | SLA Management | Sim | Sim | Avançado | **AUTOMÁTICO** |
| 10 | QA & Compliance | Não | Parcial | Sim | **SIM + LGPD** |

### 2.2 Canais a Centralizar

| Canal | Protocolo/API | Prioridade |
|-------|--------------|-----------|
| **WhatsApp Business** | Cloud API (Meta) / Evolution API | 🔴 Alta |
| **Email** | IMAP/SMTP + parsing automático | 🔴 Alta |
| **WebChat** | WebSocket (próprio) | 🔴 Alta |
| **Telegram** | Bot API | 🟡 Média |
| **Instagram** | Instagram Messaging API | 🟡 Média |
| **Facebook Messenger** | Graph API | 🟡 Média |
| **SMS** | Twilio / Vonage | 🟢 Baixa |
| **Telefone/VoIP** | SIP / Twilio Voice | 🟢 Futura |

---

## PARTE 3 — REGRAS DE NEGÓCIO DO NOVO SISTEMA

### 3.1 Ciclo de Vida do Ticket
```
[ENTRADA] → Qualquer canal
     ↓
[PARSING + CLASSIFICAÇÃO] → IA identifica: assunto, urgência, cliente, sistema
     ↓
[ROTEAMENTO] → Skill-based routing → Agent correto
     ↓
[ATENDIMENTO] → Agent + IA assistente (sugestões, KB, macros)
     ↓
[RESOLUÇÃO] → Resposta + Knowledge capture
     ↓
[FEEDBACK] → CSAT/NPS automático
     ↓
[ANALYTICS] → Métricas + aprendizado contínuo
```

### 3.2 Regras de Automação

**Priorização Automática:**
- Se cliente = contrato ativo → prioridade mínima = Alta
- Se assunto contém "fora do ar" / "sistema parado" → Crítico
- Se canal = WhatsApp e sem resposta > 2h → Escalar

**Roteamento:**
- AxHub → Equipe AxHub
- AxTon/Pesagem → Equipe AxTon
- AxCross/Cruzamento → Equipe AxCross
- Financeiro/Comercial → Gerência
- Não identificado → Fila geral com IA sugerindo

**SLA:**
| Prioridade | 1ª Resposta | Resolução | Escalação |
|-----------|------------|-----------|-----------|
| Crítica | 30min | 4h | Gerência imediata |
| Alta | 2h | 8h | Supervisor em 4h |
| Normal | 4h | 24h | Alerta em 16h |
| Baixa | 8h | 72h | Alerta em 48h |

**Auto-ações:**
- Ticket sem atividade 7 dias → Notificar → 14 dias → Auto-fechar
- Ticket reaberto 3x → Escalar para supervisor
- CSAT < 3 → Notificar gerência
- Duplicado detectado → Merge automático + notificar

### 3.3 Inteligência Artificial

**Motor IA (já existente + expansão):**
- Classificação por embeddings (cosine similarity) ← JÁ TEMOS
- Knowledge Base com RAG ← JÁ TEMOS
- Sugestão de respostas ← JÁ TEMOS
- **NOVO:** Chatbot autônomo Tier-1 (resolve 30% dos tickets)
- **NOVO:** Análise de sentimento em tempo real
- **NOVO:** Predição de escalonamento
- **NOVO:** Auto-geração de KB articles de tickets resolvidos
- **NOVO:** Detecção de tendências e alertas proativos

---

## PARTE 4 — PROMPT DE LEVANTAMENTO DE DADOS (EXTRAÇÃO)

### 4.1 Prompt para Extração de Dados do Jitbit

```
OBJETIVO: Extrair e mapear todos os dados do Jitbit para migração/integração

ENDPOINTS A EXPLORAR:
1. GET /api/Tickets?mode=1&count=1000 → Todos os tickets
2. GET /api/Categories → Todas as categorias/departamentos
3. GET /api/Users → Todos os usuários (clientes + técnicos)
4. GET /api/KBArticles → Artigos da base de conhecimento
5. GET /api/CustomFields → Campos personalizados
6. GET /api/Assets → Ativos de TI
7. Para cada ticket: GET /api/Comments?id={ID} → Histórico completo

DADOS A EXTRAIR POR TICKET:
- ID, Assunto, Corpo, Status, Prioridade
- Data criação, atualização, resolução
- Categoria, Subcategoria
- Cliente (nome, email, empresa)
- Técnico responsável
- Todos os comentários (internos e públicos)
- Anexos (URLs)
- Tags e campos customizados
- Tempo de primeira resposta
- Tempo total de resolução

FORMATO DE SAÍDA:
JSON estruturado compatível com importação em:
- MongoDB (nosso padrão)
- Zendesk (API de importação)
- Milvus (API de importação)
- Qualquer sistema futuro (JSON genérico)
```

### 4.2 Prompt para Extração de Dados do Milvus

```
OBJETIVO: Mapear funcionalidades e dados do Milvus para consolidação

VIA API (developers.milvus.com.br):
1. Listar todos os tickets/chamados
2. Listar clientes e organizações
3. Listar canais configurados
4. Listar regras de automação
5. Listar base de conhecimento
6. Listar SLAs configurados
7. Extrair relatórios de performance

DADOS DE INTERESSE:
- Configuração de canais (WhatsApp, Chat, etc.)
- Regras de roteamento existentes
- Templates de resposta
- Macros e automações
- Horários de atendimento
- Métricas históricas
```

### 4.3 Prompt para Análise do Zendesk

```
OBJETIVO: Capturar as melhores práticas do Zendesk como referência

VIA API (zendesk.com/api/v2):
1. GET /api/v2/tickets.json → Estrutura de tickets
2. GET /api/v2/triggers.json → Regras de automação
3. GET /api/v2/automations.json → Automações temporais
4. GET /api/v2/macros.json → Macros/templates
5. GET /api/v2/views.json → Visualizações configuradas
6. GET /api/v2/slas/policies.json → Políticas de SLA
7. GET /api/v2/help_center/articles.json → KB

APRENDIZADOS A CAPTURAR:
- Como organizam categorias e tags
- Fluxos de automação configurados
- Templates de resposta
- Triggers de escalonamento
- Configurações de SLA
- Layout do portal do cliente
```

---

## PARTE 5 — ARQUITETURA DO NOVO SISTEMA

### 5.1 Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend** | React + Vite + Tailwind | Já temos expertise, rápido |
| **Backend API** | Node.js + Express | Já temos, escalar horizontalmente |
| **Real-time** | Socket.IO / WebSocket | Chat ao vivo, notificações |
| **Database** | MongoDB (principal) + Redis (cache/sessions) | Flexibilidade + performance |
| **IA Engine** | OpenAI GPT + RAG + Embeddings | Já temos base, expandir |
| **Queue** | BullMQ (Redis) | Jobs assíncronos, filas de mensagens |
| **WhatsApp** | Evolution API / Meta Cloud API | Open-source ou oficial |
| **Email** | Nodemailer + IMAP Listener | Bidirecional |
| **Storage** | S3/MinIO | Anexos e arquivos |
| **Auth** | JWT + RBAC | Multi-tenant |
| **Deploy** | Docker + Docker Compose | Portabilidade |

### 5.2 Módulos do Sistema

```
axion-helpdesk/
├── packages/
│   ├── core/              # Entidades, regras de negócio, types
│   ├── api/               # Express API (REST + WebSocket)
│   ├── web/               # Painel do Agente (React)
│   ├── portal/            # Portal do Cliente (React)
│   ├── widget/            # Widget embarcável (JS vanilla)
│   ├── ai-engine/         # Motor IA (classificação, RAG, chatbot)
│   ├── channels/          # Adaptadores: WhatsApp, Email, Telegram, etc.
│   ├── scheduler/         # Jobs (polling, SLA checks, auto-close)
│   └── analytics/         # Relatórios, dashboards, export
├── infra/
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── scripts/
└── docs/
    ├── architecture.md
    ├── api-reference.md
    └── deployment.md
```

### 5.3 Entidades Principais (MongoDB)

```javascript
// Ticket
{
  _id: ObjectId,
  number: "AX-2026-0001",  // Sequencial
  subject: String,
  body: String,             // HTML sanitizado
  status: "new|open|pending|resolved|closed",
  priority: "low|normal|high|critical",
  channel: "email|whatsapp|webchat|telegram|instagram|facebook|sms|phone|portal",
  
  // Relacionamentos
  customerId: ObjectId,
  companyId: ObjectId,
  assignedAgentId: ObjectId,
  categoryId: ObjectId,
  
  // Sistema de origem (para migração)
  sourceSystem: "axhub|axton|axcross|geral",
  sourceSiteId: String,
  
  // SLA
  slaPolicy: ObjectId,
  slaStatus: "on-track|at-risk|breached",
  firstResponseDue: Date,
  resolutionDue: Date,
  firstResponseAt: Date,
  resolvedAt: Date,
  
  // IA
  aiClassification: { category: String, confidence: Number },
  aiSentiment: "positive|neutral|negative",
  aiSuggestedAgent: ObjectId,
  aiSuggestedResponse: String,
  
  // Metadados
  tags: [String],
  customFields: Map,
  attachments: [{ name, url, size, type }],
  linkedTickets: [ObjectId],
  parentTicketId: ObjectId,  // Sub-tickets
  
  // Auditoria
  createdAt: Date,
  updatedAt: Date,
  closedAt: Date,
  createdBy: ObjectId,
  history: [{ action, by, at, details }]
}

// Customer (360°)
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  company: ObjectId,
  channels: {
    whatsapp: "+55...",
    telegram: "@...",
    instagram: "...",
    facebook: "..."
  },
  tier: "free|basic|pro|enterprise",
  healthScore: Number,       // 0-100 calculado automaticamente
  totalTickets: Number,
  avgSatisfaction: Number,
  tags: [String],
  notes: String,
  lastContact: Date,
  createdAt: Date
}

// Agent
{
  _id: ObjectId,
  name: String,
  email: String,
  role: "admin|supervisor|agent|viewer",
  department: String,
  skills: [String],         // "axhub", "axton", "axcross", "financeiro"
  status: "available|busy|away|offline",
  maxConcurrent: Number,
  currentLoad: Number,
  metrics: {
    csat: Number,
    avgResponseTime: Number,
    avgResolutionTime: Number,
    ticketsHandled: Number
  }
}

// Message (unificada para todos os canais)
{
  _id: ObjectId,
  ticketId: ObjectId,
  type: "reply|internal_note|system|ai_suggestion",
  channel: "email|whatsapp|webchat|...",
  author: { id: ObjectId, type: "customer|agent|system|ai", name: String },
  body: String,
  bodyHtml: String,
  attachments: [{ name, url, size, type }],
  isInternal: Boolean,       // Nota privada
  sentiment: String,
  createdAt: Date,
  readAt: Date,
  deliveredAt: Date
}

// Automation Rule
{
  _id: ObjectId,
  name: String,
  trigger: {
    event: "ticket_created|status_changed|time_elapsed|message_received",
    conditions: [{ field, operator, value }]
  },
  actions: [{ type, params }],
  isActive: Boolean,
  executionCount: Number,
  lastExecuted: Date
}

// SLA Policy
{
  _id: ObjectId,
  name: String,
  conditions: { priority: String, category: ObjectId, companyTier: String },
  responseTime: Number,     // minutos
  resolutionTime: Number,   // minutos
  escalation: [{ percentElapsed: Number, action: String, target: String }],
  businessHours: { start: "08:00", end: "18:00", days: [1,2,3,4,5] }
}
```

### 5.4 APIs Principais

```
# Tickets
POST   /api/v1/tickets              → Criar ticket (qualquer canal)
GET    /api/v1/tickets              → Listar (filtros, paginação)
GET    /api/v1/tickets/:id          → Detalhe + mensagens
PATCH  /api/v1/tickets/:id          → Atualizar (status, assignee, etc.)
POST   /api/v1/tickets/:id/messages → Nova mensagem/resposta
POST   /api/v1/tickets/:id/merge    → Merge com outro ticket
POST   /api/v1/tickets/:id/assign   → Atribuir agente

# Channels (webhooks de entrada)
POST   /api/v1/channels/whatsapp/webhook  → Mensagens WhatsApp
POST   /api/v1/channels/email/webhook     → Email recebido
POST   /api/v1/channels/telegram/webhook  → Telegram
POST   /api/v1/channels/instagram/webhook → Instagram
POST   /api/v1/channels/facebook/webhook  → Messenger
POST   /api/v1/channels/webchat/message   → WebChat

# Customers
GET    /api/v1/customers           → Listar
GET    /api/v1/customers/:id       → Profile 360°
POST   /api/v1/customers           → Criar
PATCH  /api/v1/customers/:id       → Atualizar

# AI
POST   /api/v1/ai/classify         → Classificar mensagem
POST   /api/v1/ai/suggest-response → Sugerir resposta
POST   /api/v1/ai/chatbot          → Chatbot autônomo Tier-1
GET    /api/v1/ai/insights         → Insights operacionais

# Knowledge Base
GET    /api/v1/kb/articles          → Listar artigos
POST   /api/v1/kb/articles          → Criar artigo
GET    /api/v1/kb/search?q=...     → Busca semântica
POST   /api/v1/kb/auto-generate    → Gerar artigo de ticket resolvido

# Analytics
GET    /api/v1/analytics/kpis       → KPIs real-time
GET    /api/v1/analytics/reports    → Relatórios customizados
GET    /api/v1/analytics/sla        → SLA compliance
GET    /api/v1/analytics/agents     → Performance por agente
GET    /api/v1/analytics/channels   → Métricas por canal

# Config
GET    /api/v1/config/sla-policies  → Políticas SLA
POST   /api/v1/config/automations   → Criar automação
GET    /api/v1/config/categories    → Categorias
POST   /api/v1/config/channels      → Configurar canal
```

---

## PARTE 6 — PLANO DE IMPLEMENTAÇÃO

### Fase 1: Core (4-6 semanas)
- [ ] Setup projeto monorepo
- [ ] Banco de dados MongoDB + models
- [ ] API base (tickets CRUD, auth JWT)
- [ ] Painel do agente (lista tickets, responder)
- [ ] Motor IA (migrar do axion-ia-api existente)
- [ ] Migração de dados do Jitbit

### Fase 2: Canais (4-6 semanas)
- [ ] Integração WhatsApp (Evolution API)
- [ ] Integração Email (IMAP listener)
- [ ] WebChat widget
- [ ] Unificação de inbox

### Fase 3: Inteligência (3-4 semanas)
- [ ] Chatbot autônomo Tier-1
- [ ] Roteamento inteligente por skills
- [ ] SLA management automático
- [ ] Análise de sentimento
- [ ] Sugestão de respostas

### Fase 4: Portal & Self-Service (3-4 semanas)
- [ ] Portal do cliente
- [ ] Knowledge Base pública
- [ ] Ticket tracking pelo cliente
- [ ] CSAT/NPS automático

### Fase 5: Analytics & Operações (2-3 semanas)
- [ ] Dashboard real-time
- [ ] Relatórios customizados
- [ ] Workforce management
- [ ] Quality assurance

### Fase 6: Canais Extras (2-3 semanas)
- [ ] Telegram
- [ ] Instagram
- [ ] Facebook Messenger
- [ ] SMS (Twilio)

---

## PARTE 7 — MÉTRICAS DE SUCESSO

| Métrica | Situação Atual | Meta com Novo Sistema |
|---------|---------------|----------------------|
| First Response Time | Não medido | < 2h (normal), < 30min (crítico) |
| Resolution Time | Não medido | < 24h (normal) |
| Ticket Deflection | 0% | > 30% (KB + chatbot) |
| CSAT Score | Não medido | > 85% |
| SLA Compliance | Não medido | > 95% |
| Canais ativos | 2 (email + portal) | 7+ canais |
| Automação | ~10% | > 40% |
| Cost per Ticket | Não calculado | -30% em 6 meses |

---

## PARTE 8 — DIFERENCIAL vs CONCORRENTES

| Aspecto | Jitbit/Milvus/Zendesk | NOSSO SISTEMA |
|---------|----------------------|---------------|
| Integração com AxHub/AxTon/AxCross | Nenhuma | **NATIVA** (acesso direto aos DBs) |
| IA treinada no nosso domínio | Genérica | **ESPECIALIZADA** (metrologia, trânsito, pesagem) |
| Knowledge Base | Genérica | **COM DOCS** dos 3 portais |
| Custo mensal | R$ 500-5000+/mês | **ZERO** (self-hosted) |
| Customização | Limitada | **TOTAL** |
| Dados | No provedor | **NOSSO** (compliance LGPD) |
| Multi-tenant | Limitado | **SIM** (por site/orgão) |

---

## CONCLUSÃO

Este projeto substitui 3 plataformas (Jitbit + Milvus + Zendesk) por um único sistema:
- **Mais inteligente** (IA especializada no domínio)
- **Mais integrado** (acesso nativo aos sistemas AxHub/AxTon/AxCross)
- **Mais barato** (sem mensalidades SaaS)
- **Mais completo** (omnichannel total)
- **Mais seguro** (dados internos, LGPD compliance)

**Próximo passo:** Iniciar Fase 1 — Setup do projeto e migração do core.
