# 🏛️ PORTAL DO CIDADÃO - PRD (Product Requirements Document)

> **Versão:** 1.0  
> **Data:** 2026-06-21  
> **Status:** ❌ BLOCKER CRÍTICO - Exigido em 80% dos editais  
> **ROI:** R$ 80k investimento → Habilita R$ 500k pipeline

---

## 📋 EXECUTIVE SUMMARY

### Problema
Cidadãos precisam consultar multas, contestar infrações e acompanhar recursos. **80% dos editais exigem Portal do Cidadão** como requisito obrigatório, mas Axion não tem essa funcionalidade, bloqueando vendas.

### Solução
Portal web público onde cidadãos podem:
- ✅ Consultar infrações por CPF/Placa
- ✅ Contestar infrações com upload de documentos
- ✅ Acompanhar status de recursos
- ✅ Chat IA para dúvidas frequentes (GPT-4)
- ✅ Notificações via WhatsApp

### Impacto Esperado
- **Vendas:** Habilita 3 licitações bloqueadas (R$ 500k pipeline)
- **Operacional:** -60% chamados helpdesk (dados Jitbit)
- **Satisfação:** NPS +20 pontos (transparência)
- **Receita Recorrente:** +R$ 288k ARR (R$ 2k/mês × 12 clientes)

---

## 🎯 OBJETIVOS

### Objetivos de Negócio
1. ✅ **Remover blocker de vendas** — Atender requisito obrigatório em editais
2. 💰 **Gerar receita recorrente** — Módulo premium (R$ 2k/mês)
3. 📉 **Reduzir custos operacionais** — -60% chamados sobre multas
4. 📈 **Aumentar satisfação** — Transparência e autonomia ao cidadão

### Objetivos Técnicos
1. ⚡ **Performance:** < 2s carregamento (Google Lighthouse 90+)
2. 🔒 **Segurança:** LGPD compliant, dados sensíveis criptografados
3. 📱 **Responsivo:** Mobile-first (70% acessos via celular)
4. ♿ **Acessibilidade:** WCAG 2.1 AA (gov.br exige)
5. 🌐 **Multi-tenancy:** Customização por cliente (logo, cores)

---

## 👥 PERSONAS

### Persona 1: "João Silva" — Motorista Comum
- **Perfil:** 35 anos, trabalha como entregador, usa celular
- **Necessidade:** Consultar se tem multa, saber valor
- **Dor:** Não sabe onde consultar, tem que ligar para prefeitura
- **Objetivo:** Ver multas rapidamente, pagar se necessário

### Persona 2: "Maria Santos" — Cidadã Contestando
- **Perfil:** 42 anos, professora, acredita que multa está errada
- **Necessidade:** Contestar multa com foto/documento
- **Dor:** Processo burocrático, tem que ir presencialmente
- **Objetivo:** Contestar online, acompanhar processo

### Persona 3: "Pedro Oliveira" — Empresa com Frota
- **Perfil:** 50 anos, gestor de frotas, 20 veículos
- **Necessidade:** Consultar multas de múltiplas placas
- **Dor:** Tem que consultar uma por uma
- **Objetivo:** Exportar planilha de todas as multas

---

## 🎨 DESIGN & EXPERIÊNCIA

### Jornada do Usuário

#### Fluxo 1: Consulta Simples
```
1. Cidadão acessa portal público (sem login)
2. Digita CPF ou Placa
3. Resolve CAPTCHA (anti-bot)
4. Sistema busca infrações no banco AxHub
5. Exibe lista de infrações com:
   - Data, hora, local
   - Tipo de infração
   - Valor, status (paga/pendente)
   - Foto (se disponível)
6. Opção: Imprimir boleto ou baixar PDF
```

#### Fluxo 2: Contestação
```
1. Cidadão consulta infração (fluxo 1)
2. Clica em "Contestar esta infração"
3. Cria conta (email + senha) ou faz login
4. Preenche formulário:
   - Motivo da contestação (dropdown)
   - Descrição detalhada (textarea)
   - Upload de documentos (fotos, PDFs)
5. Submete contestação
6. Sistema gera protocolo
7. Notificação via email + WhatsApp
8. Acompanhamento de status (Aguardando/Deferido/Indeferido)
```

#### Fluxo 3: Chat IA
```
1. Cidadão tem dúvida (ex: "Como contestar multa?")
2. Clica no ícone de chat (canto inferior direito)
3. Chat abre com GPT-4 treinado em FAQ
4. IA responde baseada em KB (base de conhecimento)
5. Se não souber: "Deseja abrir um chamado?"
6. Transfere para atendente humano (Jitbit)
```

### Wireframes (Principais Telas)

#### Tela 1: Home / Consulta
```
┌────────────────────────────────────────────┐
│  [Logo Prefeitura]    Portal do Cidadão    │
├────────────────────────────────────────────┤
│                                            │
│   🔍 Consulte suas Infrações               │
│   ─────────────────────────────────        │
│                                            │
│   Consultar por:                           │
│   ○ CPF        ● Placa                     │
│                                            │
│   [_______________]  [Consultar]           │
│    Digite seu CPF ou Placa                 │
│                                            │
│   [✓] Não sou um robô (reCAPTCHA)         │
│                                            │
│   ──────────────────────────────          │
│   ❓ Dúvidas Frequentes                    │
│   • Como contestar uma infração?          │
│   • Onde pagar a multa?                   │
│   • Prazo para recurso                    │
│                                            │
│   [💬 Chat com IA]  (canto inferior)      │
└────────────────────────────────────────────┘
```

#### Tela 2: Resultados
```
┌────────────────────────────────────────────┐
│  ← Voltar                   João Silva     │
├────────────────────────────────────────────┤
│  📋 Infrações Encontradas: 2               │
│  ──────────────────────────────────        │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 🚨 Excesso de Velocidade              │ │
│  │ Data: 15/05/2026  Local: Av. Paulista │ │
│  │ Valor: R$ 195,23  Status: Pendente   │ │
│  │ [Ver Foto] [Contestar] [Imprimir]    │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ ✅ Faixa Exclusiva                    │ │
│  │ Data: 10/04/2026  Local: Av. Brasil  │ │
│  │ Valor: R$ 195,23  Status: Paga ✓     │ │
│  │ [Ver Comprovante]                    │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [📥 Exportar Todas (PDF)]                │
└────────────────────────────────────────────┘
```

#### Tela 3: Contestação
```
┌────────────────────────────────────────────┐
│  ← Voltar        Contestar Infração        │
├────────────────────────────────────────────┤
│  📄 Auto de Infração Nº 123456             │
│  Data: 15/05/2026  Valor: R$ 195,23        │
│  ──────────────────────────────────        │
│                                            │
│  Motivo da Contestação:                    │
│  [▼ Selecione______________]               │
│   • Não era eu dirigindo                   │
│   • Placa clonada                          │
│   • Erro do equipamento                    │
│   • Sinalização inadequada                 │
│   • Outro (especificar)                    │
│                                            │
│  Descrição Detalhada:                      │
│  [________________________________]         │
│  [________________________________]         │
│  [________________________________]         │
│  [________________________________]         │
│                                            │
│  Documentos Comprobatórios:                │
│  [📎 Adicionar Arquivos]                   │
│  (PDF, JPG, PNG - máx 5MB cada)           │
│                                            │
│  ✓ Declaro que as informações são         │
│    verdadeiras                             │
│                                            │
│  [Cancelar]  [✓ Enviar Contestação]       │
└────────────────────────────────────────────┘
```

---

## 🏗️ ARQUITETURA TÉCNICA

### Stack Tecnológico

**Frontend:**
- ⚛️ **React 18** (SPA)
- 🎨 **Tailwind CSS** (styling rápido, responsivo)
- 📋 **React Hook Form** (formulários otimizados)
- 🔍 **React Query** (cache inteligente)
- 📱 **Mobile-first** (CSS Grid + Flexbox)

**Backend:**
- 🟢 **Node.js + Express** (já existe na API)
- 🔒 **JWT** (autenticação stateless)
- 📦 **Multer** (upload de arquivos)
- 📧 **Nodemailer** (emails transacionais)
- 💬 **WhatsApp Business API** (notificações)

**Banco de Dados:**
- 🗄️ **SQL Server** (infrações — já existe)
- 🍃 **MongoDB** (contestações, usuários)

**IA & Integrações:**
- 🤖 **OpenAI GPT-4** (chat IA)
- 🔐 **Google reCAPTCHA v3** (anti-bot)
- 📊 **Google Analytics** (métricas)

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    PORTAL DO CIDADÃO                         │
│                 (React SPA - Vercel/Netlify)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS/REST
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              AXION IA API (Node.js Express)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/portal/consultar    (GET infrações)            │  │
│  │  /api/portal/contestar    (POST contestação)         │  │
│  │  /api/portal/upload       (POST documentos)          │  │
│  │  /api/portal/chat         (POST mensagem IA)         │  │
│  │  /api/portal/auth/login   (POST autenticação)        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────┬───────────────────────┬───────────────────────┘
              │                       │
    ┌─────────┴─────────┐   ┌────────┴──────────┐
    │  SQL Server       │   │   MongoDB         │
    │  (AxHub DB)       │   │  (Portal DB)      │
    │  ───────────      │   │  ──────────       │
    │  • Infrações      │   │  • Usuários       │
    │  • Veículos       │   │  • Contestações   │
    │  • Equipamentos   │   │  • Documentos     │
    └───────────────────┘   └───────────────────┘
              │                       │
              │                       │
    ┌─────────┴───────────────────────┴──────────┐
    │        SERVIÇOS EXTERNOS                    │
    │  ─────────────────────────────             │
    │  • OpenAI GPT-4 (chat IA)                  │
    │  • WhatsApp Business API (notificações)    │
    │  • SendGrid/AWS SES (emails)               │
    │  • Google reCAPTCHA (anti-bot)             │
    │  • AWS S3 (armazenamento documentos)       │
    └────────────────────────────────────────────┘
```

### Estrutura de Arquivos

```
axion-portal-cidadao/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ChatWidget.jsx
│   │   │   └── Loading.jsx
│   │   ├── consulta/
│   │   │   ├── FormConsulta.jsx
│   │   │   ├── ListaInfracoes.jsx
│   │   │   └── CardInfracao.jsx
│   │   └── contestacao/
│   │       ├── FormContestacao.jsx
│   │       └── UploadDocumentos.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Resultados.jsx
│   │   ├── Contestacao.jsx
│   │   ├── MeusProcessos.jsx
│   │   └── Login.jsx
│   │
│   ├── services/
│   │   ├── api.js          (axios config)
│   │   ├── auth.js         (JWT handling)
│   │   └── chat.js         (GPT-4 integration)
│   │
│   ├── hooks/
│   │   ├── useInfracoes.js
│   │   ├── useContestacao.js
│   │   └── useChat.js
│   │
│   ├── utils/
│   │   ├── validators.js   (CPF, Placa)
│   │   ├── formatters.js   (datas, valores)
│   │   └── constants.js
│   │
│   ├── styles/
│   │   └── tailwind.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🔌 ESPECIFICAÇÃO DA API

### Endpoint 1: Consultar Infrações

**Request:**
```http
GET /api/portal/consultar?tipo=cpf&valor=12345678900
```

**Response:**
```json
{
  "success": true,
  "total": 2,
  "infracoes": [
    {
      "id": 123456,
      "tipo": "Excesso de Velocidade",
      "data": "2026-05-15T10:30:00Z",
      "local": "Av. Paulista, 1000",
      "equipamento": "ITZ-001",
      "velocidadePermitida": 50,
      "velocidadeMedida": 72,
      "valor": 195.23,
      "status": "Pendente",
      "fotoUrl": "https://cdn.axion.ws/infracoes/123456.jpg",
      "podeContestar": true,
      "prazoContestacao": "2026-06-15"
    },
    {
      "id": 123457,
      "tipo": "Faixa Exclusiva",
      "data": "2026-04-10T14:20:00Z",
      "local": "Av. Brasil, 500",
      "valor": 195.23,
      "status": "Paga",
      "dataPagamento": "2026-04-20",
      "podeContestar": false
    }
  ]
}
```

### Endpoint 2: Enviar Contestação

**Request:**
```http
POST /api/portal/contestar
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "infracaoId": 123456,
  "motivo": "erro_equipamento",
  "descricao": "O equipamento estava desregulado...",
  "documentos": [
    "doc_1.pdf",
    "foto_1.jpg"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "protocolo": "CONT-2026-001234",
  "mensagem": "Contestação registrada com sucesso",
  "prazoResposta": "15 dias úteis",
  "proximoPasso": "Aguarde análise da autoridade competente"
}
```

### Endpoint 3: Chat IA

**Request:**
```http
POST /api/portal/chat
Content-Type: application/json

{
  "sessionId": "uuid-session",
  "mensagem": "Como contestar uma multa?"
}
```

**Response:**
```json
{
  "resposta": "Para contestar uma multa, siga estes passos:\n1. Consulte sua infração pelo CPF ou Placa\n2. Clique em 'Contestar' na infração desejada\n3. Preencha o formulário com o motivo\n4. Anexe documentos comprobatórios\n5. Envie a contestação\n\nO prazo é de 15 dias após a notificação.",
  "confianca": 0.95,
  "sugestoesRelacionadas": [
    "Prazo para recurso",
    "Documentos necessários",
    "Acompanhar processo"
  ]
}
```

---

## 🗄️ MODELO DE DADOS

### MongoDB Collections

#### usuarios
```javascript
{
  _id: ObjectId,
  cpf: String (criptografado),
  email: String,
  senha: String (bcrypt hash),
  nome: String,
  telefone: String,
  criadoEm: Date,
  ultimoAcesso: Date,
  ativo: Boolean
}
```

#### contestacoes
```javascript
{
  _id: ObjectId,
  protocolo: String, // "CONT-2026-001234"
  usuarioId: ObjectId,
  infracaoId: Number, // referência SQL Server
  cpfCidadao: String,
  placaVeiculo: String,
  motivo: String,
  descricao: String,
  documentos: [{
    nome: String,
    url: String, // AWS S3
    tipo: String, // pdf, jpg, png
    tamanhoKB: Number
  }],
  status: String, // "Aguardando" | "Em Análise" | "Deferido" | "Indeferido"
  resposta: String,
  criadoEm: Date,
  atualizadoEm: Date,
  analisadoPor: String, // usuário admin
  analisadoEm: Date
}
```

#### chat_sessoes
```javascript
{
  _id: ObjectId,
  sessionId: String,
  mensagens: [{
    tipo: String, // "user" | "ia"
    conteudo: String,
    timestamp: Date,
    confianca: Number
  }],
  cpfCidadao: String (opcional),
  resolvido: Boolean,
  criadoEm: Date
}
```

---

## 🔒 SEGURANÇA & LGPD

### Requisitos de Segurança

1. **Autenticação:**
   - JWT com expiração 24h
   - Refresh token (7 dias)
   - 2FA opcional (SMS/Email)

2. **Criptografia:**
   - HTTPS obrigatório (TLS 1.3)
   - CPFs criptografados em repouso (AES-256)
   - Senhas com bcrypt (custo 12)

3. **Rate Limiting:**
   - Consultas: 10 req/min por IP
   - Contestações: 5 req/hora por usuário
   - Chat IA: 20 mensagens/5min

4. **CAPTCHA:**
   - Google reCAPTCHA v3 (score > 0.5)
   - Fallback para v2 (checkbox) se score baixo

5. **Upload:**
   - Scan antivírus (ClamAV)
   - Tamanho máx: 5MB por arquivo
   - Tipos permitidos: PDF, JPG, PNG
   - Sem execução de scripts

### Conformidade LGPD

1. **Consentimento:**
   - Checkbox explícito para armazenar dados
   - Link para Política de Privacidade

2. **Direitos do Titular:**
   - Exportar dados (JSON/PDF)
   - Deletar conta (anonimização)
   - Retificar informações

3. **Logs de Auditoria:**
   - Quem acessou qual dado, quando
   - Retenção: 6 meses

4. **Data Retention:**
   - Contestações: 5 anos (obrigatório legal)
   - Logs de acesso: 6 meses
   - Chat IA: 90 dias (anonimizado)

---

## 🎨 CUSTOMIZAÇÃO (Multi-tenancy)

Cada cliente (prefeitura/IPEM) terá:

```javascript
{
  clienteId: "ipempe",
  branding: {
    logo: "https://cdn.axion.ws/logos/ipempe.png",
    cores: {
      primaria: "#0066CC",
      secundaria: "#00994D",
      background: "#FFFFFF"
    },
    titulo: "Portal do Cidadão - IPEM/PE",
    rodape: "© 2026 IPEM/PE - Todos os direitos reservados"
  },
  contato: {
    telefone: "(81) 3183-7500",
    email: "atendimento@ipempe.gov.br",
    horario: "Seg-Sex: 8h-17h"
  },
  regrasNegocio: {
    prazoContestacao: 15, // dias
    valorMinimoInfracao: 50.00,
    permitirContestacaoOnline: true
  }
}
```

---

## 📊 MÉTRICAS DE SUCESSO

### KPIs Técnicos
- ⚡ **Performance:** Lighthouse score > 90
- 🔒 **Segurança:** 0 vulnerabilidades críticas (Snyk)
- 🐛 **Bugs:** < 2 bugs críticos/mês
- ⏱️ **Uptime:** > 99,5% (SLA)

### KPIs de Negócio
- 👥 **Usuários Ativos:** > 1.000/mês (por cliente)
- 📊 **Taxa de Sucesso:** > 95% consultas bem-sucedidas
- 🎫 **Redução Helpdesk:** -60% chamados sobre multas
- 😊 **Satisfação:** CSAT > 4,5/5

### KPIs de IA
- 🤖 **Chat IA:** > 80% dúvidas resolvidas sem humano
- ⚡ **Tempo Resposta:** < 3s por mensagem
- 🎯 **Precisão:** > 90% respostas corretas (manual review)

---

## 🚀 ROADMAP DE DESENVOLVIMENTO

### MVP (2 meses) — Prioridade MÁXIMA

**Sprint 1 (2 semanas):**
- ✅ Setup projeto (React + Vite + Tailwind)
- ✅ Tela Home com formulário de consulta
- ✅ API: GET /consultar (integração SQL Server)
- ✅ Tela de Resultados (lista de infrações)

**Sprint 2 (2 semanas):**
- ✅ Sistema de autenticação (JWT)
- ✅ Tela de Contestação (formulário)
- ✅ API: POST /contestar (MongoDB)
- ✅ Upload de documentos (AWS S3)

**Sprint 3 (2 semanas):**
- ✅ Chat IA (GPT-4 integration)
- ✅ WhatsApp notifications (API Business)
- ✅ CAPTCHA (reCAPTCHA v3)
- ✅ Responsive design (mobile-first)

**Sprint 4 (2 semanas):**
- ✅ Multi-tenancy (customização por cliente)
- ✅ Testes E2E (Playwright)
- ✅ Deploy (Vercel + CI/CD)
- ✅ Documentação

### V2 (3-6 meses) — Evolutivo

- 📱 App Mobile (React Native)
- 📊 Dashboard Admin (gestão contestações)
- 🔔 Notificações Push
- 💳 Pagamento Online (PIX/Cartão)
- 📈 Analytics Avançado (BI)
- 🌍 Multi-idioma (EN, ES)

---

## 💰 MODELO DE RECEITA

**Pricing:**
- **Módulo Base:** R$ 2.000/mês por cliente
- **Add-ons:**
  - Chat IA ilimitado: +R$ 500/mês
  - WhatsApp Business API: +R$ 300/mês
  - Customização avançada: +R$ 500/mês (one-time)

**Projeção ARR:**
- 12 clientes × R$ 2.000 = R$ 24k/mês
- ARR: **R$ 288k/ano**

---

## ✅ CRITÉRIOS DE ACEITE

### Funcionais
- ✅ Cidadão consegue consultar infrações sem login
- ✅ Sistema valida CPF/Placa corretamente
- ✅ reCAPTCHA bloqueia bots
- ✅ Contestação gera protocolo único
- ✅ Upload aceita PDF, JPG, PNG (máx 5MB)
- ✅ Chat IA responde em < 3s
- ✅ WhatsApp envia notificação em < 30s
- ✅ Email confirmação enviado após contestação

### Não-Funcionais
- ✅ Lighthouse score > 90 (Performance)
- ✅ Mobile-first (responsivo 360px-1920px)
- ✅ WCAG 2.1 AA (acessibilidade)
- ✅ HTTPS obrigatório (TLS 1.3)
- ✅ Zero vulnerabilidades críticas (Snyk)
- ✅ Uptime > 99,5% (SLA)

### Compliance
- ✅ LGPD: Política de Privacidade visível
- ✅ LGPD: Opt-in para armazenar dados
- ✅ LGPD: Direito à portabilidade (exportar JSON)
- ✅ LGPD: Direito ao esquecimento (deletar conta)
- ✅ Logs de auditoria (6 meses retenção)

---

## 📚 REFERÊNCIAS

### Benchmarking (Portais Similares)
- **DetranNET (SP):** https://www.detran.sp.gov.br/
- **Portal Multas BH:** https://portalmultas.pbh.gov.br/
- **DETRAN/RJ:** https://www.detran.rj.gov.br/

### Regulamentação
- **CTB (Código de Trânsito Brasileiro):** Lei 9.503/1997
- **LGPD:** Lei 13.709/2018
- **e-Gov:** Padrões de Interoperabilidade de Governo Eletrônico

---

**Status:** ✅ Aprovado para desenvolvimento  
**Próximo Passo:** Iniciar Sprint 1

---

**Elaborado por:** GitHub Copilot (Claude Sonnet 4.5)  
**Aprovado por:** [Pending]  
**Data:** 2026-06-21
