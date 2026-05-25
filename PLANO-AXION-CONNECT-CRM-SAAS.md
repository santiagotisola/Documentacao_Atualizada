# 🚀 PLANO DE IMPLEMENTAÇÃO: Axion Connect — SaaS + CRM + Helpdesk + IA

**Data:** 19/05/2026  
**Produto:** Axion Connect (nome proposto para o SaaS de atendimento)  
**Base:** Análise Multi360 + Ecossistema Axion existente  

---

## 1. MODELO DE DADOS CRM (MongoDB)

### 1.1 Collection: `contatos` (CRM)

```javascript
{
  _id: ObjectId,
  nome: String,
  telefone: String,           // Formato: 5562XXXXXXXX
  email: String,
  cpf: String,
  origem: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'WEBCHAT' | 'EMAIL' | 'TELEGRAM',
  canal: String,              // ID do canal/número
  
  // CRM Fields
  empresa: String,
  cargo: String,
  cidade: String,
  tags: [String],
  score: Number,              // Lead scoring (0-100)
  etapaPipeline: 'novo' | 'contato' | 'qualificado' | 'proposta' | 'negociacao' | 'ganho' | 'perdido',
  
  // Campos customizados (dinâmico)
  camposCustom: {
    dataNascimento: Date,
    sexo: String,
    idade: Number,
    // ... campos definidos pelo admin
  },
  
  // Relacionamentos
  atendente: ObjectId,        // ref: atendentes
  departamento: String,
  
  // Histórico
  totalAtendimentos: Number,
  ultimoAtendimento: Date,
  mediaAvaliacao: Number,
  ticketsAbertos: [String],   // IDs Jitbit
  
  // Controle
  blacklist: Boolean,
  consentimento: Boolean,     // LGPD
  dataCriacao: Date,
  dataAtualizacao: Date,
  importadoDe: String         // 'multi360', 'jitbit', 'manual'
}
```

### 1.2 Collection: `atendimentos`

```javascript
{
  _id: ObjectId,
  protocolo: String,          // Gerado sequencial
  
  // Canal
  canal: String,              // whatsapp, instagram, webchat, email
  canalId: String,            // Número/ID do canal
  
  // Participantes
  contato: ObjectId,          // ref: contatos
  atendente: ObjectId,        // ref: atendentes
  departamento: String,
  
  // Status
  status: 'aguardando' | 'ativo' | 'finalizado' | 'cancelado',
  origem: 'reativo' | 'ativo' | 'potencial' | 'integracao' | 'bot',
  prioridade: 'baixa' | 'normal' | 'alta' | 'critica',
  
  // SLA
  sla: {
    primeiraResposta: { limite: Date, cumprido: Boolean },
    resolucao: { limite: Date, cumprido: Boolean }
  },
  
  // IA
  classificacaoIA: {
    categoria: String,
    confianca: Number,
    sentimento: 'positivo' | 'neutro' | 'negativo',
    sugestaoResposta: String
  },
  
  // Mensagens
  mensagens: [{
    remetente: 'contato' | 'atendente' | 'bot' | 'sistema',
    texto: String,
    tipo: 'texto' | 'imagem' | 'audio' | 'video' | 'documento',
    mediaUrl: String,
    timestamp: Date
  }],
  
  // Resolução
  motivo: String,
  tags: [String],
  avaliacao: Number,          // 1-10
  feedbackTexto: String,
  
  // Datas
  dataCriacao: Date,
  dataUltimaMensagem: Date,
  dataFinalizacao: Date,
  
  // Jitbit (integração)
  ticketJitbit: Number,
  
  // Metadata
  camposCustom: Object
}
```

### 1.3 Collection: `atendentes`

```javascript
{
  _id: ObjectId,
  nome: String,
  email: String,
  telefone: String,
  perfil: 'admin' | 'supervisor' | 'atendente',
  departamentos: [String],
  skills: [String],
  status: 'online' | 'offline' | 'ausente',
  limiteAtendimentos: Number,
  atendimentosAtivos: Number,
  mediaAvaliacao: Number,
  totalAtendimentos: Number
}
```

### 1.4 Collection: `bots`

```javascript
{
  _id: ObjectId,
  nome: String,
  tipo: 'chatbot' | 'ura' | 'ia',
  canal: String,
  status: 'ativo' | 'inativo',
  fluxo: [{
    id: String,
    tipo: 'mensagem' | 'menu' | 'input' | 'condicao' | 'acao' | 'ia',
    conteudo: Object,
    proximos: [String]  // IDs dos próximos nós
  }],
  mensagemInicial: String,
  departamentoPadrao: String,
  horarioFuncionamento: {
    inicio: String,
    fim: String,
    diasSemana: [Number]
  }
}
```

---

## 2. ENDPOINTS API (Novos)

### 2.1 CRM

```
POST   /api/crm/contatos              → Criar contato
GET    /api/crm/contatos              → Listar contatos (filtros)
GET    /api/crm/contatos/:id          → Detalhes do contato
PUT    /api/crm/contatos/:id          → Atualizar contato
DELETE /api/crm/contatos/:id          → Remover contato
POST   /api/crm/contatos/importar     → Importar CSV/JSON
GET    /api/crm/contatos/exportar     → Exportar CSV/JSON
GET    /api/crm/pipeline              → Pipeline de leads
PUT    /api/crm/contatos/:id/etapa    → Mover no pipeline
POST   /api/crm/contatos/:id/tags     → Adicionar tags
```

### 2.2 Atendimento

```
GET    /api/atendimentos              → Listar atendimentos
POST   /api/atendimentos              → Iniciar atendimento
GET    /api/atendimentos/:id          → Detalhes
PUT    /api/atendimentos/:id/assumir  → Atendente assume
PUT    /api/atendimentos/:id/transferir → Transferir
PUT    /api/atendimentos/:id/finalizar  → Finalizar
POST   /api/atendimentos/:id/mensagens → Enviar mensagem
GET    /api/atendimentos/:id/mensagens → Histórico
POST   /api/atendimentos/:id/avaliar  → CSAT
```

### 2.3 Broadcast

```
POST   /api/broadcast                 → Criar campanha
GET    /api/broadcast                 → Listar campanhas
POST   /api/broadcast/:id/enviar     → Disparar
GET    /api/broadcast/:id/status     → Status de entrega
POST   /api/broadcast/agendar        → Agendar envio
```

### 2.4 Analytics

```
GET    /api/analytics/dashboard       → Métricas gerais
GET    /api/analytics/atendentes     → Performance atendentes
GET    /api/analytics/canais         → Métricas por canal
GET    /api/analytics/sla            → Compliance SLA
GET    /api/analytics/ia             → Métricas da IA
GET    /api/analytics/leads          → Funil de conversão
```

---

## 3. PÁGINAS DO PAINEL (React)

### 3.1 Novas Páginas Necessárias

| Página | Rota | Prioridade |
|--------|------|-----------|
| Chat (Live) | `/atendimentos` | 🔴 P1 |
| CRM - Contatos | `/crm/contatos` | 🔴 P1 |
| CRM - Pipeline | `/crm/pipeline` | 🟡 P2 |
| Broadcast | `/broadcast` | 🟡 P2 |
| Bot Builder | `/bots/editor` | 🟡 P2 |
| Analytics Live | `/analytics` | 🔴 P1 |
| Configurações | `/config` | 🟡 P2 |
| Enquetes | `/enquetes` | 🟢 P3 |
| Retornos | `/retornos` | 🟢 P3 |

### 3.2 Wireframe Chat (Principal)

```
┌────────────────────────────────────────────────────────────────┐
│ 🔍 Buscar atendimento...              [Online ●] Santiago      │
├──────────┬─────────────────────────────┬───────────────────────┤
│          │                             │                       │
│ FILA     │     CONVERSA ATIVA         │  PERFIL CONTATO       │
│          │                             │                       │
│ ● João   │  João Silva (WhatsApp)     │  Nome: João Silva     │
│   14:30  │  ─────────────────────     │  Tel: +55 62 9...     │
│          │                             │  Último: hoje 14:30   │
│ ● Maria  │  [14:30] Olá, preciso      │  Tags: #AxHub #VIP    │
│   14:25  │  de ajuda com o sistema     │  Score: 85/100        │
│          │                             │                       │
│ ● Pedro  │  🤖 IA sugere:             │  ─── HISTÓRICO ───    │
│   14:20  │  "Pode me informar qual    │  Tickets: 3           │
│          │   módulo está com problema?"│  Atendimentos: 12     │
│ ● Ana    │                             │  Avaliação: 9.2       │
│   14:15  │  ┌─────────────────────┐   │                       │
│          │  │ Digite sua mensagem  │   │  ─── AÇÕES ───       │
│ ──────── │  │                      │   │  [Criar Ticket]       │
│ TOTAL:25 │  │ 📎 😊     [Enviar]  │   │  [Transferir]         │
│ MEUS: 4  │  └─────────────────────┘   │  [Finalizar]          │
│          │                             │  [Blacklist]          │
└──────────┴─────────────────────────────┴───────────────────────┘
```

---

## 4. INTEGRAÇÃO WhatsApp → CRM → HELPDESK

### 4.1 Fluxo Unificado

```
CLIENTE envia mensagem WhatsApp
          │
          ▼
[1] BOT RECEBE (Baileys/Cloud API)
          │
          ▼
[2] IDENTIFICA CONTATO (CRM lookup por telefone)
    ├── Contato existe? → Carrega perfil + histórico
    └── Novo? → Cria contato CRM + marca como "Novo Lead"
          │
          ▼
[3] IA CLASSIFICA (Engine.js)
    ├── Assunto/Categoria
    ├── Urgência/Prioridade  
    ├── Sentimento (positivo/neutro/negativo)
    └── Confiança da resposta (0-100%)
          │
          ▼
[4] DECISÃO AUTOMÁTICA
    ├── Confiança > 80%? → Responde automaticamente
    ├── Confiança 50-80%? → Sugere ao atendente
    └── Confiança < 50%? → Encaminha para humano
          │
          ▼
[5] ROTEAMENTO INTELIGENTE
    ├── Skill-based: melhor atendente para o tema
    ├── Load-based: atendente com menos carga
    ├── History-based: atendente que já atendeu este cliente
    └── Fallback: fila do departamento
          │
          ▼
[6] ATENDIMENTO (Chat real-time)
    ├── Atendente recebe sugestões IA em tempo real
    ├── KB articles relevantes sugeridos
    ├── Macros/mensagens rápidas disponíveis
    └── Se preciso: cria ticket no Jitbit (helpdesk)
          │
          ▼
[7] FINALIZAÇÃO
    ├── CSAT automático enviado ao cliente
    ├── Tags aplicadas (auto + manual)
    ├── Score do lead atualizado
    └── KB article gerado (se resolução foi nova)
```

### 4.2 Grupo WhatsApp de Atendimento (Interno)

**Número:** 556294357076 (disponível — offline no Multi360)

**Configuração:**
1. Conectar número ao nosso Baileys (scan QR)
2. Criar grupo "Axion - Central de Atendimento"
3. Adicionar equipe técnica
4. Bot notifica no grupo: novos chamados urgentes, escalações, SLA em risco
5. Atendentes podem responder diretamente do grupo (bot encaminha)

**Fluxo de Notificação:**
```
[Novo chamado urgente]
    ↓
Bot posta no grupo:
  "🚨 NOVO CHAMADO URGENTE
   Cliente: João Silva (+55 62 9...)
   Assunto: Sistema AxHub fora do ar
   Classificação IA: Infraestrutura (95%)
   SLA: 30min p/ primeira resposta
   
   Quem assume? Responda ✅"
    ↓
Atendente responde ✅
    ↓
Chamado atribuído automaticamente
```

---

## 5. O QUE PEDIR À IA (Acréscimos para SaaS + CRM)

### 5.1 Features de IA que Transformam o Produto

| Feature | Como Funciona | Valor para SaaS |
|---------|--------------|-----------------|
| **Smart Scoring** | IA analisa interações e pontua leads automaticamente | Prioriza quem está mais quente para vendas |
| **Predictive Routing** | ML aprende qual atendente resolve melhor cada tipo | Reduz tempo de resolução em 40% |
| **Auto-Summary** | IA resume conversas longas em 3 bullets | Handoff perfeito entre turnos |
| **Intent Detection** | NLP identifica intenção sem menus | UX superior ao Multi360 (que usa URA fixa) |
| **Churn Predictor** | Analisa padrões de reclamação e inatividade | Retenção proativa |
| **Campaign Optimizer** | IA sugere melhor horário/público para broadcast | Taxa de abertura +35% |
| **Compliance Guard** | Detecta dados sensíveis (CPF, cartão) em chats | LGPD automático |
| **Agent Assist** | Co-pilot para atendente com sugestões em tempo real | Produtividade +50% |
| **Auto-Escalation** | Detecta que cliente está irritado e escala | NPS +15 pontos |
| **Multi-language** | Detecta idioma e responde automaticamente | Atende turistas/estrangeiros |

### 5.2 Integrações Estratégicas

| Integração | Propósito | Prioridade |
|-----------|-----------|-----------|
| **Google Contacts** | Sincronização bidirecional de contatos | 🔴 Alta |
| **Google Calendar** | Agendamentos de retorno/follow-up | 🟡 Média |
| **Jitbit** | Tickets de suporte (já temos) | ✅ Pronto |
| **WhatsApp Cloud API** | Canal oficial (Meta) | 🔴 Alta |
| **OpenAI GPT** | Motor IA conversacional | ✅ Pronto |
| **Stripe/Pagar.me** | Cobranças no chat | 🟡 Média |
| **RD Station/Pipedrive** | CRM externo (integração) | 🟢 Baixa |
| **Webhooks** | Qualquer sistema externo | 🟡 Média |

---

## 6. DIFERENCIAL COMPETITIVO FINAL

### Multi360 cobra por:
- Número de atendentes (R$ ~100/atendente)
- Canais adicionais
- Limite de mensagens
- Sem IA real

### Axion Connect oferecerá:
- IA que resolve 30-50% sem humano
- CRM integrado (não precisa de outro sistema)
- Helpdesk com SLA (não precisa de Zendesk/Jitbit)
- Knowledge Base (não precisa de Notion/Confluence)
- Tudo no mesmo ecossistema

### Posicionamento:
> **"O Multi360 é um telefone com secretária. O Axion Connect é um funcionário inteligente que atende, classifica, resolve e aprende."**

---

## 7. AÇÃO IMEDIATA: SCRIPT DE MIGRAÇÃO

Execute o script de exportação para migrar os 52.032 contatos:
```bash
node exportar-contatos-multi360.mjs
```

O arquivo `contatos-multi360-google.csv` será gerado no formato:
- Compatível com Google Contacts (importação direta)
- Campos: Name, Phone, Organization, Group Membership, Notes
- Grupo: "Multi360 - WHATSAPP"

---

*Plano criado com base na análise real do sistema Multi360 + ecossistema Axion existente.*
