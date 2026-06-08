# ═══════════════════════════════════════════════════════════════════════════════
# CONSOLIDAÇÃO COMPLETA — PROJETO HELPDESK UNIFICADO + ANÁLISE DE ECOSSISTEMA
# ═══════════════════════════════════════════════════════════════════════════════
#
# Data de consolidação: 05/06/2026
# Fonte: Sessões de análise 19/05/2026 + 02/06/2026 + 05/06/2026
# Autor: Santiago Neto + IA Copilot
# Repositório: Axion-Tecnologia/Documentacao_Atualizada (branch: melhorias-documentacao)
#
# ÍNDICE:
# ═══════
# PARTE A — De-Para Ecossistema (4 plataformas comparadas)
# PARTE B — Projeto Helpdesk Unificado (Axion Helpdesk 2.0)
# PARTE C — Plano Axion Connect CRM + SaaS
# PARTE D — Script de Integração Universal (13 módulos JSON)
# PARTE E — Análise Estratégica SaaS 3.0 (Gaps + Roadmap)
# PARTE F — Prompts de Análise e Extração
# PARTE G — Decisão Estratégica Final
# ═══════════════════════════════════════════════════════════════════════════════

---

# ═══════════════════════════════════════════════════════════════════════════════
# PARTE A — DE-PARA: ANÁLISE COMPARATIVA DO ECOSSISTEMA
# ═══════════════════════════════════════════════════════════════════════════════
# Sessão: 19/05/2026 (f9352a71)
# Objetivo: Comparar todos os sistemas de helpdesk analisados

## A.1 MAPA DOS 4 SISTEMAS ANALISADOS

| Dimensão | **Axion IA (Atual)** | **Jitbit (desk.axion)** | **Milvus** | **Zendesk** |
|----------|---------------------|------------------------|------------|------------|
| **Tipo** | Custom (Node.js) | SaaS Helpdesk | SaaS ITSM/Omnichannel | SaaS Enterprise CX |
| **Foco** | IA + Suporte + Compliance | Tickets básicos | Helpdesk + IT Management | CX Completo |
| **Preço** | Custo infra próprio | ~$29/agente/mês | R$95-205/agente/mês | $55-115/agente/mês |
| **IA** | GPT-4o embeddings + KB | Zero nativo | ChatGPT integrado | Agentes IA nativos |
| **Canais** | WhatsApp (Baileys) | Email + Portal Web | WA, Telegram, Chat, Email, Messenger | Todos + Voz + SMS |
| **Empresas** | 1 (Axion) | Milhares (SaaS global) | 3.000+ | 100.000+ |
| **Base BR** | Sim | Global (sem foco BR) | 100% brasileira | Global |

---

## A.2 DE-PARA POR FUNCIONALIDADE

### 📨 CANAIS DE ATENDIMENTO

| Canal | Axion IA | Jitbit | Milvus | Zendesk |
|-------|----------|--------|--------|---------|
| WhatsApp | ✅ Baileys (não-oficial) | ❌ | ✅ Oficial + Não-oficial | ✅ API Oficial |
| Telegram | ❌ (planejado) | ❌ | ✅ | ✅ |
| Instagram/Facebook | ❌ | ❌ | ✅ Messenger | ✅ |
| Email | ❌ | ✅ | ✅ | ✅ |
| WebChat | ❌ | ✅ (widget) | ✅ | ✅ |
| SMS | ❌ | ❌ | ❌ | ✅ |
| Voz/Telefone | ❌ | ❌ | ❌ | ✅ |
| Portal do Cliente | ❌ | ✅ | ✅ | ✅ |
| App Mobile | ❌ | ❌ | ✅ | ✅ |

### 🎫 GESTÃO DE TICKETS

| Recurso | Axion IA | Jitbit | Milvus | Zendesk |
|---------|----------|--------|--------|---------|
| Criação de ticket | ✅ (via WA/API) | ✅ | ✅ | ✅ |
| Categorias/Filas | ✅ (via Jitbit) | ✅ | ✅ Múltiplas filas | ✅ |
| SLA/Prazos | ✅ (monitoramento) | ✅ básico | ✅ Completo | ✅ Enterprise |
| Priorização | ✅ | ✅ | ✅ | ✅ |
| Atribuição automática | ✅ (regras próprias) | ✅ básico | ✅ Regras distribuição | ✅ |
| Campos customizáveis | ❌ | ✅ | ✅ | ✅ |
| Workflow/Gatilhos | ❌ | ✅ básico | ✅ Completo | ✅ Enterprise |
| Aprovação | ✅ (fila revisão) | ❌ | ✅ Fluxo aprovação | ✅ |
| Apontamento horas | ✅ (planilha) | ✅ | ✅ | ✅ |
| Edição em massa | ❌ | ✅ | ✅ | ✅ |
| Merge de tickets | ❌ | ✅ | ✅ | ✅ |
| Sub-tickets | ❌ | ❌ | ❌ | ✅ |
| Catálogo de serviços | ❌ | ❌ | ✅ | ✅ |
| Segmentação de equipes | ❌ | ✅ | ✅ | ✅ |

### 🤖 INTELIGÊNCIA ARTIFICIAL

| Recurso | Axion IA | Jitbit | Milvus | Zendesk |
|---------|----------|--------|--------|---------|
| Auto-resposta IA | ✅ (score ≥0.85) | ❌ | ✅ ChatGPT | ✅ Agentes IA |
| Base de conhecimento | ✅ (KB + embeddings) | ✅ básico | ✅ + ChatGPT | ✅ + IA |
| Classificação IA | ✅ (classifier.js) | ❌ | ❌ | ✅ |
| Sugestão ao agente | ✅ (score 0.65-0.84) | ❌ | ❌ | ✅ Copilot |
| Chatbot builder | ❌ (fluxo fixo) | ❌ | ✅ Drag&Drop | ✅ |
| Embeddings/Semântica | ✅ (OpenAI) | ❌ | ❌ | ✅ |
| Treinamento contínuo | ✅ | ❌ | Via base | ✅ |
| Análise de sentimento | ❌ | ❌ | ❌ | ✅ |
| Roteamento por IA | ❌ | ❌ | ❌ | ✅ |
| Chatbot WhatsApp | ✅ (estado/menu) | ❌ | ✅ | ✅ |
| OCR com scoring | ✅ | ❌ | ❌ | ❌ |

### 📊 ANALYTICS & DASHBOARDS

| Recurso | Axion IA | Jitbit | Milvus | Zendesk |
|---------|----------|--------|--------|---------|
| Dashboard tempo real | ✅ (painel custom) | ✅ básico | ✅ Gestão canais | ✅ |
| Relatórios SLA | ✅ (compliance) | ✅ | ✅ | ✅ Enterprise |
| Métricas agente | ✅ (horas) | ✅ | ✅ Status operador | ✅ WFM |
| CSAT/Satisfação | ❌ | ✅ | ✅ | ✅ |
| NPS | ❌ | ❌ | ❌ | ✅ |
| Relatórios custom | ❌ | ✅ | ✅ White-label | ✅ |
| Exportação dados | ✅ (JSON) | ✅ CSV | ✅ | ✅ |
| Workforce Management | ❌ | ❌ | ❌ | ✅ |
| Quality Assurance | ❌ | ❌ | ❌ | ✅ |

### 🔧 INTEGRAÇÕES & INFRAESTRUTURA

| Recurso | Axion IA | Jitbit | Milvus | Zendesk |
|---------|----------|--------|--------|---------|
| API REST | ✅ (40+ endpoints) | ✅ | ✅ | ✅ |
| Webhooks | ❌ | ✅ | ✅ | ✅ |
| SQL Server | ✅ (3 databases) | ❌ | ❌ | ❌ |
| MongoDB | ✅ | ❌ | ❌ | ❌ |
| OpenAI | ✅ | ❌ | ✅ | ✅ |
| Zapier/Make | ❌ | ✅ | ✅ | ✅ |
| ITIL/COBIT | ❌ | ❌ | ✅ | ✅ |
| Inventário TI | ❌ | ❌ | ✅ Completo | ❌ |
| Acesso remoto | ❌ | ❌ | ✅ | ❌ |
| Multi-tenant | ❌ | ✅ | ✅ | ✅ |
| White-label | ❌ | ❌ | ✅ | ❌ |
| Docker/K8s | ✅ | N/A (SaaS) | N/A | N/A |

### 💰 PREÇOS E MODELOS (Milvus detalhado)

| Plano Milvus | Preço/agente | Inclui |
|------|------|--------|
| **Talk** | R$95/mês | WhatsApp + Chat + Telegram + Filas |
| **Ticket** | R$160/mês | Talk + Email + Portal + Gestão tickets + Workflow |
| **TI** | R$205/mês | Ticket + Inventário + Acesso remoto + SNMP + Monitoramento |

| Pacote | Preço | Para quem |
|--------|-------|-----------|
| Starter | R$449/mês | 3 usuários, 1 WhatsApp |
| Business | R$799/mês | 5 usuários, 2 canais |
| Premium | R$1.599/mês | 10 usuários, 3 canais, 1 chatbot |

---

## A.3 FUNCIONALIDADES EXCLUSIVAS DO AXION (NÃO EXISTEM NOS OUTROS)

| # | Recurso Exclusivo | Descrição | Valor Competitivo |
|---|-------------------|-----------|-------------------|
| 1 | **Conformidade de Editais** | Análise 3 fases de editais gov → APTO/INAPTO | Nenhum helpdesk faz isso |
| 2 | **Pipeline PNCP** | Coleta automática de licitações gov.br | Único no mercado |
| 3 | **Multi-product analysis** | Compara edital vs AxHub/AxTon/AxCross | Diferencial total |
| 4 | **Roadmap from gaps** | Gera backlog de desenvolvimento a partir de lacunas | Automação de produto |
| 5 | **Spec generator** | Gera PRDs automáticos | Dev automático |
| 6 | **SQL Server bridges** | Consulta dados operacionais (trânsito, pesagem, cruzamento) | Dados reais em tempo real |
| 7 | **OCR pipeline** | Análise de imagens com confiança (0-100%) | Exclusivo |
| 8 | **Agent autônomo** | Scheduler que monitora e age (heartbeat, alertas) | Proativo vs reativo |
| 9 | **IA para fiscalização** | KB treinada em metrologia, trânsito, pesagem | Domínio especializado |
| 10 | **Intelligence Hub** | Health Score por site, heatmap, fluxo | BI especializado |

---

## A.4 GAPS IDENTIFICADOS NO AXION IA ATUAL

| # | Gap | Presente em | Impacto | Prioridade |
|---|-----|-------------|---------|------------|
| 1 | **Sem omnichannel real** (só WA) | Milvus, Zendesk | ALTO | P1 |
| 2 | **Sem email** como canal | Todos os 3 | ALTO | P1 |
| 3 | **Sem portal do cliente** | Jitbit, Milvus, Zendesk | ALTO | P1 |
| 4 | **Sem chatbot builder** visual | Milvus, Zendesk | MÉDIO | P2 |
| 5 | **Sem CSAT/NPS** | Todos os 3 | MÉDIO | P2 |
| 6 | **Sem gestão de contratos** | Milvus | MÉDIO | P2 |
| 7 | **Sem workflow builder** | Milvus, Zendesk | ALTO | P2 |
| 8 | **Sem multi-tenant** | Todos os 3 | ALTO | P1 |
| 9 | **Sem webhooks** outbound | Jitbit, Milvus, Zendesk | MÉDIO | P2 |
| 10 | **Sem inventário TI** | Milvus | BAIXO | P4 |
| 11 | **Sem white-label** | Milvus | MÉDIO | P3 |
| 12 | **Sem app mobile** | Milvus, Zendesk | MÉDIO | P3 |

---

## A.5 VANTAGENS COMPETITIVAS ÚNICAS

| # | Vantagem | Nenhum concorrente tem | Impacto Comercial |
|---|----------|------------------------|-------------------|
| 1 | **IA especializada em fiscalização** | ✅ | Alto — nicho dominado |
| 2 | **Análise de conformidade de editais** | ✅ | Alto — decisão de vendas |
| 3 | **Integração nativa com SQL Server operacional** | ✅ | Alto — dados reais |
| 4 | **Auto-scoring com revisão humana** (0.85/0.65) | Parcial Zendesk | Médio — qualidade |
| 5 | **Pipeline licitações PNCP** | ✅ | Alto — oportunidades |
| 6 | **Geração automática de PRD/Roadmap** | ✅ | Médio — velocidade |

---

# ═══════════════════════════════════════════════════════════════════════════════
# PARTE B — PROJETO HELPDESK UNIFICADO (AXION HELPDESK 2.0)
# ═══════════════════════════════════════════════════════════════════════════════
# Arquivo fonte: PROJETO-HELPDESK-UNIFICADO.md (19/05/2026)

## B.1 VISÃO DO PROJETO

> **Substituir Jitbit + Milvus + Zendesk por um ÚNICO sistema próprio**
> que é mais inteligente, mais integrado, mais barato e comercializável como SaaS.

### Decisão Estratégica Confirmada:
- ✅ Deixar de usar desk.axiontecnologia.com.br (Jitbit)
- ✅ Sistema 100% proprietário
- ✅ Uso interno + comercialização no mercado
- ✅ Multi-tenant com white-label

---

## B.2 REGRAS DE NEGÓCIO

### Ciclo de Vida do Ticket
```
[ENTRADA] → Qualquer canal (WA, Email, Chat, Telegram, IG, FB, SMS, Portal)
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

### Priorização Automática
- Cliente com contrato ativo → prioridade mínima = Alta
- Assunto "fora do ar" / "sistema parado" → Crítico
- Canal WhatsApp sem resposta > 2h → Escalar
- Ticket reaberto 3x → Escalar supervisor
- CSAT < 3 → Notificar gerência

### SLA Policies
| Prioridade | 1ª Resposta | Resolução | Escalação |
|-----------|------------|-----------|-----------|
| Crítica | 30min | 4h | Gerência imediata |
| Alta | 2h | 8h | Supervisor em 4h |
| Normal | 4h | 24h | Alerta em 16h |
| Baixa | 8h | 72h | Alerta em 48h |

### Auto-ações
- Ticket sem atividade 7 dias → Notificar → 14 dias → Auto-fechar
- Duplicado detectado → Merge automático + notificar
- CSAT > 4 + resolução nova → Auto-gerar KB article

### Motor IA (expansão do existente)
- ✅ JÁ TEMOS: Classificação embeddings, KB RAG, Sugestão de respostas
- **NOVO:** Chatbot autônomo Tier-1 (resolve 30% tickets)
- **NOVO:** Análise de sentimento em tempo real
- **NOVO:** Predição de escalonamento
- **NOVO:** Auto-geração de KB articles
- **NOVO:** Detecção de tendências proativa

---

## B.3 STACK TECNOLÓGICA

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend** | React + Vite + Tailwind | Expertise existente |
| **Backend API** | Node.js + Express/Fastify | Expertise existente |
| **Real-time** | Socket.IO / WebSocket | Chat ao vivo, notificações |
| **Database** | MongoDB (principal) + Redis (cache) | Flexibilidade + performance |
| **IA Engine** | OpenAI GPT + RAG + Embeddings | Base existente, expandir |
| **Queue** | BullMQ (Redis) | Jobs assíncronos |
| **WhatsApp** | Evolution API / Meta Cloud API | Oficial + open-source |
| **Email** | Nodemailer + IMAP Listener | Bidirecional |
| **Storage** | S3/MinIO | Anexos |
| **Auth** | JWT + RBAC | Multi-tenant |
| **Deploy** | Docker + Docker Compose | Portabilidade |

---

## B.4 ESTRUTURA DO MONOREPO

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

---

## B.5 ENTIDADES PRINCIPAIS (MongoDB)

### Ticket
```javascript
{
  _id: ObjectId,
  number: "AX-2026-0001",
  subject: String,
  body: String,
  status: "new|open|pending|resolved|closed",
  priority: "low|normal|high|critical",
  channel: "email|whatsapp|webchat|telegram|instagram|facebook|sms|phone|portal",
  customerId: ObjectId,
  companyId: ObjectId,
  assignedAgentId: ObjectId,
  categoryId: ObjectId,
  sourceSystem: "axhub|axton|axcross|geral",
  sourceSiteId: String,
  slaPolicy: ObjectId,
  slaStatus: "on-track|at-risk|breached",
  firstResponseDue: Date,
  resolutionDue: Date,
  aiClassification: { category: String, confidence: Number },
  aiSentiment: "positive|neutral|negative",
  aiSuggestedResponse: String,
  tags: [String],
  customFields: Map,
  attachments: [{ name, url, size, type }],
  linkedTickets: [ObjectId],
  history: [{ action, by, at, details }],
  createdAt: Date,
  updatedAt: Date,
  closedAt: Date
}
```

### Customer (360°)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  company: ObjectId,
  channels: { whatsapp, telegram, instagram, facebook },
  tier: "free|basic|pro|enterprise",
  healthScore: Number,
  totalTickets: Number,
  avgSatisfaction: Number,
  tags: [String],
  lastContact: Date
}
```

### Agent
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  role: "admin|supervisor|agent|viewer",
  skills: [String],
  status: "available|busy|away|offline",
  maxConcurrent: Number,
  currentLoad: Number,
  metrics: { csat, avgResponseTime, avgResolutionTime, ticketsHandled }
}
```

### Message (unificada todos os canais)
```javascript
{
  _id: ObjectId,
  ticketId: ObjectId,
  type: "reply|internal_note|system|ai_suggestion",
  channel: String,
  author: { id, type: "customer|agent|system|ai", name },
  body: String,
  attachments: [{ name, url, size, type }],
  isInternal: Boolean,
  sentiment: String,
  createdAt: Date
}
```

### Automation Rule
```javascript
{
  _id: ObjectId,
  name: String,
  trigger: { event, conditions: [{ field, operator, value }] },
  actions: [{ type, params }],
  isActive: Boolean
}
```

### SLA Policy
```javascript
{
  _id: ObjectId,
  name: String,
  conditions: { priority, category, companyTier },
  responseTime: Number,  // minutos
  resolutionTime: Number,
  escalation: [{ percentElapsed, action, target }],
  businessHours: { start, end, days }
}
```

---

## B.6 APIs PRINCIPAIS

```
# ═══ Tickets ═══
POST   /api/v1/tickets              → Criar ticket (qualquer canal)
GET    /api/v1/tickets              → Listar (filtros, paginação)
GET    /api/v1/tickets/:id          → Detalhe + mensagens
PATCH  /api/v1/tickets/:id          → Atualizar
POST   /api/v1/tickets/:id/messages → Nova mensagem
POST   /api/v1/tickets/:id/merge    → Merge
POST   /api/v1/tickets/:id/assign   → Atribuir

# ═══ Channels (webhooks de entrada) ═══
POST   /api/v1/channels/whatsapp/webhook
POST   /api/v1/channels/email/webhook
POST   /api/v1/channels/telegram/webhook
POST   /api/v1/channels/instagram/webhook
POST   /api/v1/channels/facebook/webhook
POST   /api/v1/channels/webchat/message

# ═══ Customers ═══
GET    /api/v1/customers
GET    /api/v1/customers/:id        → Profile 360°
POST   /api/v1/customers
PATCH  /api/v1/customers/:id

# ═══ AI ═══
POST   /api/v1/ai/classify          → Classificar mensagem
POST   /api/v1/ai/suggest-response  → Sugerir resposta
POST   /api/v1/ai/chatbot           → Chatbot autônomo Tier-1
GET    /api/v1/ai/insights          → Insights operacionais

# ═══ Knowledge Base ═══
GET    /api/v1/kb/articles
POST   /api/v1/kb/articles
GET    /api/v1/kb/search?q=...      → Busca semântica
POST   /api/v1/kb/auto-generate     → Gerar de ticket

# ═══ Analytics ═══
GET    /api/v1/analytics/kpis
GET    /api/v1/analytics/reports
GET    /api/v1/analytics/sla
GET    /api/v1/analytics/agents
GET    /api/v1/analytics/channels

# ═══ Config ═══
GET    /api/v1/config/sla-policies
POST   /api/v1/config/automations
GET    /api/v1/config/categories
POST   /api/v1/config/channels
```

---

## B.7 PLANO DE IMPLEMENTAÇÃO

| Fase | Escopo | Estimativa |
|------|--------|-----------|
| **Fase 1: Core** | Projeto, DB, API CRUD, Painel agente, Motor IA migrado | 4-6 semanas |
| **Fase 2: Canais** | WhatsApp, Email, WebChat, Inbox unificado | 4-6 semanas |
| **Fase 3: Inteligência** | Chatbot T1, Routing IA, SLA auto, Sentimento | 3-4 semanas |
| **Fase 4: Portal** | Portal cliente, KB pública, Ticket tracking, CSAT | 3-4 semanas |
| **Fase 5: Analytics** | Dashboard real-time, Relatórios, WFM, QA | 2-3 semanas |
| **Fase 6: Extras** | Telegram, Instagram, Facebook, SMS | 2-3 semanas |

**Total estimado: 18-26 semanas** (MVP funcional na Fase 2: ~8-12 semanas)

---

## B.8 MÉTRICAS DE SUCESSO

| Métrica | Situação Atual | Meta |
|---------|---------------|------|
| First Response Time | Não medido | < 2h (normal), < 30min (crítico) |
| Resolution Time | Não medido | < 24h (normal) |
| Ticket Deflection | 0% | > 30% (KB + chatbot) |
| CSAT Score | Não medido | > 85% |
| SLA Compliance | Não medido | > 95% |
| Canais ativos | 2 (email + portal) | 7+ canais |
| Automação | ~10% | > 40% |
| Cost per Ticket | Não calculado | -30% em 6 meses |

---

# ═══════════════════════════════════════════════════════════════════════════════
# PARTE C — PLANO AXION CONNECT (CRM + SaaS + ATENDIMENTO)
# ═══════════════════════════════════════════════════════════════════════════════
# Arquivo fonte: PLANO-AXION-CONNECT-CRM-SAAS.md (19/05/2026)

## C.1 MODELO CRM

### Collection: `contatos`
```javascript
{
  _id: ObjectId,
  nome: String,
  telefone: String,          // 5562XXXXXXXX
  email: String,
  cpf: String,
  origem: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'WEBCHAT' | 'EMAIL' | 'TELEGRAM',
  empresa: String,
  cargo: String,
  tags: [String],
  score: Number,             // Lead scoring (0-100)
  etapaPipeline: 'novo' | 'contato' | 'qualificado' | 'proposta' | 'negociacao' | 'ganho' | 'perdido',
  camposCustom: Object,
  totalAtendimentos: Number,
  ultimoAtendimento: Date,
  mediaAvaliacao: Number,
  blacklist: Boolean,
  consentimento: Boolean,    // LGPD
  importadoDe: String        // 'multi360', 'jitbit', 'manual'
}
```

### Collection: `atendimentos`
```javascript
{
  _id: ObjectId,
  protocolo: String,
  canal: String,
  contato: ObjectId,
  atendente: ObjectId,
  departamento: String,
  status: 'aguardando' | 'ativo' | 'finalizado' | 'cancelado',
  prioridade: 'baixa' | 'normal' | 'alta' | 'critica',
  sla: { primeiraResposta: { limite, cumprido }, resolucao: { limite, cumprido } },
  classificacaoIA: { categoria, confianca, sentimento, sugestaoResposta },
  mensagens: [{ remetente, texto, tipo, mediaUrl, timestamp }],
  avaliacao: Number,
  ticketJitbit: Number
}
```

### Collection: `bots`
```javascript
{
  _id: ObjectId,
  nome: String,
  tipo: 'chatbot' | 'ura' | 'ia',
  canal: String,
  fluxo: [{ id, tipo, conteudo, proximos }],  // Nós do fluxo visual
  mensagemInicial: String,
  departamentoPadrao: String,
  horarioFuncionamento: { inicio, fim, diasSemana }
}
```

---

## C.2 ENDPOINTS CRM

```
# ═══ Contatos ═══
POST   /api/crm/contatos              → Criar
GET    /api/crm/contatos              → Listar (filtros)
GET    /api/crm/contatos/:id          → Detalhes
PUT    /api/crm/contatos/:id          → Atualizar
POST   /api/crm/contatos/importar     → CSV/JSON
GET    /api/crm/contatos/exportar     → CSV/JSON
GET    /api/crm/pipeline              → Pipeline leads
PUT    /api/crm/contatos/:id/etapa    → Mover no pipeline

# ═══ Atendimento ═══
GET    /api/atendimentos
POST   /api/atendimentos
PUT    /api/atendimentos/:id/assumir
PUT    /api/atendimentos/:id/transferir
PUT    /api/atendimentos/:id/finalizar
POST   /api/atendimentos/:id/mensagens
POST   /api/atendimentos/:id/avaliar

# ═══ Broadcast ═══
POST   /api/broadcast                 → Criar campanha
POST   /api/broadcast/:id/enviar      → Disparar
POST   /api/broadcast/agendar         → Agendado
GET    /api/broadcast/:id/status      → Status entrega

# ═══ Analytics ═══
GET    /api/analytics/dashboard
GET    /api/analytics/atendentes
GET    /api/analytics/canais
GET    /api/analytics/sla
GET    /api/analytics/ia
GET    /api/analytics/leads           → Funil conversão
```

---

## C.3 FLUXO UNIFICADO WhatsApp → CRM → HELPDESK

```
CLIENTE envia mensagem WhatsApp
     ↓
[1] BOT RECEBE (Baileys/Cloud API)
     ↓
[2] IDENTIFICA CONTATO (CRM lookup por telefone)
    ├── Existe? → Carrega perfil + histórico
    └── Novo? → Cria contato + marca "Novo Lead"
     ↓
[3] IA CLASSIFICA (Engine.js)
    ├── Assunto/Categoria
    ├── Urgência/Prioridade
    ├── Sentimento
    └── Confiança (0-100%)
     ↓
[4] DECISÃO AUTOMÁTICA
    ├── Confiança > 80%? → Responde automaticamente
    ├── Confiança 50-80%? → Sugere ao atendente
    └── Confiança < 50%? → Encaminha para humano
     ↓
[5] ROTEAMENTO INTELIGENTE
    ├── Skill-based → melhor atendente
    ├── Load-based → menos carga
    ├── History-based → quem já atendeu
    └── Fallback → fila departamento
     ↓
[6] ATENDIMENTO (Chat real-time)
    ├── Sugestões IA em tempo real
    ├── KB articles relevantes
    ├── Macros/mensagens rápidas
    └── Cria ticket helpdesk se necessário
     ↓
[7] FINALIZAÇÃO
    ├── CSAT automático
    ├── Tags aplicadas
    ├── Score lead atualizado
    └── KB article gerado (se resolução nova)
```

---

## C.4 FEATURES IA PARA SaaS

| Feature | Valor |
|---------|-------|
| **Smart Scoring** | Pontua leads automaticamente |
| **Predictive Routing** | ML escolhe melhor atendente |
| **Auto-Summary** | Resume conversas longas em 3 bullets |
| **Intent Detection** | NLP identifica intenção sem menus |
| **Churn Predictor** | Detecta risco de cancelamento |
| **Campaign Optimizer** | Melhor horário/público para broadcast |
| **Compliance Guard** | Detecta dados sensíveis (LGPD) |
| **Agent Assist** | Co-pilot com sugestões tempo real |
| **Auto-Escalation** | Detecta cliente irritado e escala |
| **Multi-language** | Responde no idioma do cliente |

---

## C.5 POSICIONAMENTO vs MULTI360

> **"O Multi360 é um telefone com secretária.**
> **O Axion Connect é um funcionário inteligente que atende, classifica, resolve e aprende."**

| Multi360 cobra | Axion Connect oferece |
|---------|---------|
| R$100/atendente | IA resolve 30-50% sem humano |
| Canais extras pagos | CRM integrado nativo |
| Sem IA real | Helpdesk com SLA (sem Zendesk) |
| Limite de mensagens | KB integrada (sem Notion) |

---

# ═══════════════════════════════════════════════════════════════════════════════
# PARTE D — SCRIPT DE INTEGRAÇÃO UNIVERSAL (13 MÓDULOS JSON)
# ═══════════════════════════════════════════════════════════════════════════════
# Sessão: 02/06/2026 (4acc35c6)
# Pasta: SCRIPT-INTEGRACAO-UNIVERSAL/

## D.1 ESTRUTURA DOS MÓDULOS

| # | Arquivo | Função |
|---|---------|--------|
| 00 | `00-visao-geral-framework.json` | Entry point — arquitetura, custos, stack |
| 01 | `01-nucleo-ia-engine.json` | Motor IA 3 camadas (keywords → embeddings → LLM) |
| 02 | `02-whatsapp-completo.json` | WhatsApp: Baileys, máquina de estados, LGPD, menus |
| 03 | `03-helpdesk-integrador.json` | Helpdesk genérico (Jitbit/Zendesk/etc) + criar próprio |
| 04 | `04-erp-conector.json` | Conector ERP universal (farmácia, varejo, indústria) |
| 05 | `05-gerador-relatorios.json` | Relatórios (PDF/Word/Excel) + agendamento |
| 06 | `06-banco-dados-adaptador.json` | Multi-banco (SQL Server, MySQL, Mongo, APIs) |
| 07 | `07-tabela-relacionamento-sistemas.json` | **HUB CENTRAL** — dados de acesso |
| 08 | `08-scheduler-automacao.json` | Automação (cron, polling, jobs) |
| 09 | `09-crm-contatos.json` | CRM e contatos unificados |
| 10 | `10-conformidade-analise.json` | Compliance e conformidade |
| 11 | `11-documentacao-gerador.json` | Gerador de manuais/docs via IA |
| 12 | `12-exemplo-farmacia-tekfarma.json` | Exemplo prático completo |

## D.2 CÓDIGO-FONTE IMPLEMENTADO (src/)

```
SCRIPT-INTEGRACAO-UNIVERSAL/src/
├── app.js                         (entry point)
├── package.json                   (dependências)
├── .env.example                   (variáveis documentadas)
├── modules/
│   ├── ia-engine/                 (motor IA 3 camadas)
│   │   ├── engine.js
│   │   ├── openai.service.js
│   │   ├── routes.js
│   │   └── models/
│   ├── whatsapp/                  (Baileys + máquina de estados)
│   │   ├── connection.js
│   │   ├── flow.js
│   │   ├── routes.js
│   │   └── models/
│   ├── helpdesk/                  (multi-plataforma adapter)
│   │   ├── routes.js
│   │   ├── service.js
│   │   └── models/
│   ├── erp/                       (conector banco_direto + api)
│   │   ├── routes.js
│   │   └── service.js
│   ├── database/adapter.js        (SQL Server/MySQL/PostgreSQL)
│   ├── scheduler/index.js         (polling cron + auto-resposta)
│   ├── relatorios/routes.js       (JSON/CSV/HTML + templates)
│   ├── crm/routes.js              (CRUD, histórico, segmentação)
│   └── webhook/routes.js          (recebimento webhooks externos)
├── middlewares/
│   ├── error-handler.js
│   ├── logger.js
│   └── seguranca.js               (rate-limit, headers, sanitização)
├── Dockerfile
├── docker-compose.yml
└── .gitignore
```

## D.3 PACOTE DE ENTREGA

```
entrega/
├── AxionIA-Integracao-Universal-v1.0.0.zip  (32 arquivos)
└── ENTREGA-INFO.txt                          (hash SHA256 + instruções)
```

**Para rodar:** `cp .env.example .env` → preencher credenciais → `npm run dev`

---

# ═══════════════════════════════════════════════════════════════════════════════
# PARTE E — ANÁLISE ESTRATÉGICA SaaS 3.0 (GAPS + ROADMAP)
# ═══════════════════════════════════════════════════════════════════════════════
# Arquivo fonte: ANALISE-ESTRATEGICA-SAAS-COMPLETA.md (17/05/2026)

## E.1 SCORE DE MATURIDADE ATUAL

| Domínio | Cobertura | Nota | vs Mercado |
|---|---|---|---|
| Monitoramento Eletrônico | 85% | ⭐⭐⭐⭐ | Acima |
| Gestão de Chamados | 80% | ⭐⭐⭐⭐ | Acima |
| Análise de Contratos/Editais | 95% | ⭐⭐⭐⭐⭐ | **Líder** |
| Business Intelligence | 70% | ⭐⭐⭐ | Par |
| Inteligência Artificial | 90% | ⭐⭐⭐⭐⭐ | **Líder** |
| Gestão de Equipamentos | 60% | ⭐⭐⭐ | Abaixo |
| Gestão de Processos | 40% | ⭐⭐ | Abaixo |
| Portal do Cliente | 0% | ❌ | Crítico |
| Medições Contratuais | 50% | ⭐⭐ | Abaixo |
| Multi-tenancy | 30% | ⭐ | Abaixo |

**Score Geral: 67/100** → Com GAPs resolvidos: **89/100**

---

## E.2 GAPS CRÍTICOS (12 identificados)

| # | Gap | Inspiração | Impacto | Prioridade |
|---|---|---|---|---|
| GAP-001 | Zero-Touch Tickets (60% auto) | ServiceNow | 🔴 | **P1** |
| GAP-002 | Asset Management/CMDB | Iteris | 🟡 | P2 |
| GAP-003 | Portal Self-Service | Zendesk/Freshworks | 🔴 | P1 |
| GAP-004 | Change Management | ServiceNow | 🟢 | P3 |
| GAP-005 | Análise Preditiva | Iteris | 🟡 | P2 |
| GAP-006 | Dashboards por Perfil | ServiceNow | 🟡 | P2 |
| GAP-007 | Workflow Engine Visual | ServiceNow Flow | 🟢 | P3 |
| GAP-008 | Intelligence Digest Auto | Nenhum concorrente | 🔴 | **P1** |
| GAP-009 | De-Para Processual | Process Mining | 🟢 | P3 |
| GAP-010 | Marketplace Integrações | ServiceNow Hub | 🟢 | P4 |
| GAP-011 | Gamificação Agentes | Freshworks | 🟢 | P4 |
| GAP-012 | Medições Inteligentes | Exclusivo | 🔴 | **P1** |

---

## E.3 ROADMAP DE CRESCIMENTO (3 cenários)

### Cenário A: Intelligence Hub 2.0 (6 meses)
```
HOJE                          →  HUB 2.0
───────────────────────────────────────────
Chat IA manual                →  Zero-Touch L1 (60% auto)
Relatórios sob demanda        →  Intelligence Digest semanal
Heartbeat reativo             →  Análise preditiva proativa
Medições manuais              →  Medição automática
Dashboard único               →  Multi-perfil (4 visões)
KB estático                   →  KB auto-enriquecido
```

### Cenário B: Plataforma Cidade Digital (12 meses)
```
HUB 2.0                       →  CIDADE DIGITAL
───────────────────────────────────────────
Painel interno                →  Portal multi-tenant
Análise de editais            →  Processo completo licitação
Agente autônomo               →  Workflow engine visual
Relatórios IA                 →  Assinatura digital + envio
Integração Jitbit             →  Marketplace conectores
```

### Cenário C: Absorvedor de Inteligências (18 meses)
```
CIDADE DIGITAL                →  ABSORVEDOR
───────────────────────────────────────────
Compara com editais           →  Monitora features concorrentes
Roadmap por lacuna            →  Roadmap por tendência mercado
IA responde chamados          →  IA prevê problemas antes
Asset management              →  Digital Twin equipamentos
KPIs operacionais             →  Score maturidade municipal
```

---

## E.4 BENCHMARKING COMPETITIVO

| Empresa | Força | Fraqueza vs Axion |
|---|---|---|
| **Perkons** (líder BR) | 34 anos, hardware próprio | Sem IA/helpdesk, software legacy |
| **Velsis** | Hardware robusto, presença nacional | Sem SaaS unificado, sem BI |
| **Kapsch** (global) | Tolling, V2X, 25+ países | Foco pedágio, não fiscalização BR |
| **Conduent** (global) | 50+ anos, 190 patentes | Foco pagamento, não BR |

---

# ═══════════════════════════════════════════════════════════════════════════════
# PARTE F — PROMPTS DE ANÁLISE E EXTRAÇÃO
# ═══════════════════════════════════════════════════════════════════════════════
# Arquivo fonte: PROMPT-ANALISE-HELPDESK.md

## F.1 PROMPT 1 — Análise de Qualidade do Atendimento
**Uso:** Com dados extraídos do Jitbit
**Output:** Volume, SLA, qualidade, automação, benchmarking, recomendações

## F.2 PROMPT 2 — Mapeamento de Processos
**Uso:** Com histórico de tickets
**Output:** Mapa AS-IS, regras implícitas, gaps, mapa TO-BE (Mermaid.js)

## F.3 PROMPT 3 — Análise da IA
**Uso:** Com kb.json, logs, engine.js
**Output:** Avaliação motor atual, chatbot T1, sentimento, routing, auto-KB

## F.4 PROMPT 4 — Extração de Dados para Migração
**Uso:** Script Node.js para extrair Jitbit → MongoDB
**Mapeamento:**
- Ticket Jitbit → Ticket MongoDB
- User → Customer
- Technician → Agent
- Category → Category
- Comment → Message
- KBArticle → KnowledgeArticle

## F.5 PROMPT 5 — Especificação Técnica
**Output:** C4 model, OpenAPI 3.0, DB Schema, Events, Docker, Security, Testing, MVP

## F.6 PROMPT 6 — Viabilidade e ROI
**Cenário A (manter):** ~R$2.600/mês = R$31.200/ano
**Cenário B (próprio):** ~R$150/mês = R$1.800/ano
**Break-even:** Rápido (infra própria é 17x mais barato em custo mensal)

---

# ═══════════════════════════════════════════════════════════════════════════════
# PARTE G — DECISÃO ESTRATÉGICA FINAL
# ═══════════════════════════════════════════════════════════════════════════════

## G.1 RESUMO DA DECISÃO

| Pergunta | Resposta |
|----------|---------|
| Criar sistema próprio de helpdesk? | **SIM** |
| Substituir Jitbit completamente? | **SIM** |
| Sistema comercializável como SaaS? | **SIM** |
| Nome do produto? | **Axion Connect** / **AxionDesk** |
| Multi-tenant + White-label? | **SIM** |
| Mercado-alvo? | Empresas de trânsito, concessionárias, MSPs, órgãos públicos |
| Diferencial? | IA especializada + Compliance + Dados operacionais reais |

## G.2 O QUE MANTER / INCORPORAR / DESCARTAR

| Decisão | Detalhe |
|---------|---------|
| **Manter do Axion IA** | Motor IA, Conformidade, SQL bridges, Agent autônomo, KB |
| **Incorporar do Milvus** | Omnichannel, Chatbot builder, Contratos, White-label |
| **Incorporar do Zendesk** | Workflow, Analytics, CSAT, Portal, WFM |
| **Incorporar do Multi360** | CRM, Pipeline leads, Broadcast, Enquetes |
| **Descartar Jitbit** | Substituído completamente pelo novo ticket engine |
| **Descartar Multi360** | Substituído pelo CRM nativo |

## G.3 CUSTO ESTIMADO

| Item | Custo Mensal |
|------|------|
| Infra (VPS/MongoDB Atlas free) | R$100-200 |
| OpenAI API | R$50-100 |
| WhatsApp Cloud API | R$0 (grátis até volume) |
| Total operacional | **~R$150-300/mês** |

vs Custo atual (Jitbit + Milvus + Zendesk + Multi360): **~R$3.000-5.000/mês**

## G.4 POTENCIAL COMERCIAL

| Modelo | Preço Sugerido | Target |
|--------|------|--------|
| **Starter** | R$299/mês | 3 agentes, 1 canal, IA básica |
| **Business** | R$799/mês | 5 agentes, 3 canais, IA completa |
| **Enterprise** | R$1.999/mês | Ilimitado, multi-tenant, white-label |

**Receita potencial com 10 clientes Business:** R$7.990/mês = R$95.880/ano

---

## G.5 ARQUIVOS DE REFERÊNCIA NO REPOSITÓRIO

| Arquivo | Conteúdo |
|---------|----------|
| `PROJETO-HELPDESK-UNIFICADO.md` | Projeto completo detalhado |
| `PLANO-AXION-CONNECT-CRM-SAAS.md` | CRM + SaaS + WhatsApp |
| `ANALISE-ESTRATEGICA-SAAS-COMPLETA.md` | Gaps + Roadmap + Benchmarking |
| `PROMPT-ANALISE-HELPDESK.md` | 6 prompts de análise |
| `SCRIPT-INTEGRACAO-UNIVERSAL/` | 13 JSONs + código implementado |
| `ANALISE-MULTI360-VS-AXION-CRM.md` | Comparativo Multi360 |
| `PITCH-COMERCIAL-AXIONIA-2.0-VENDA.md` | Material comercial |

---

# ═══════════════════════════════════════════════════════════════════════════════
# FIM DA CONSOLIDAÇÃO
# ═══════════════════════════════════════════════════════════════════════════════
# 
# Próximo passo: Iniciar implementação Fase 1 do novo sistema.
# Comando sugerido: Criar repositório `axion-helpdesk` e setup monorepo.
# ═══════════════════════════════════════════════════════════════════════════════
