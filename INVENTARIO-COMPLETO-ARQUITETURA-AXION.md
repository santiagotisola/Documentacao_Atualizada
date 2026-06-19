# 📊 INVENTÁRIO COMPLETO DA ARQUITETURA AXION.DOCS

> **Objetivo**: Documentação exaustiva para construção de plataforma de testes automatizados QA empresarial
> 
> **Data**: 2026-06-19  
> **Versão**: 3.0.0  
> **Workspace**: `c:\Users\Santiago\Axiondocs\Axion.Docs`

---

## 📋 SUMÁRIO EXECUTIVO

O workspace **Axion.Docs** é um ecossistema completo de sistemas de fiscalização eletrônica que integra:

- **1 Frontend React/Vite** (axion-ia-panel) com **38 páginas interativas**
- **1 Backend Node.js/Express** (axion-ia-api) com **32 controllers** e **250+ endpoints**
- **3 Portais Docusaurus** (AxHub.Docs, AxTon.Docs, AxCross.Docs)
- **3 Bancos SQL Server** (AxHub, AxTon, AxCross)
- **1 Banco MongoDB** (axion-ia) com **15+ collections**
- **50+ Scripts** de automação (PowerShell + JavaScript)
- **5+ Integrações externas** (Jitbit, OpenAI, VARCO, WhatsApp, PNCP)

---

## 🎯 FRONTEND: AXION-IA-PANEL

### 📦 Tecnologias Core

```json
{
  "framework": "React 18.3.1",
  "bundler": "Vite 6.0.0",
  "roteamento": "React Router DOM 6.28.0",
  "http": "Axios 1.7.9",
  "icones": "Lucide React 1.16.0",
  "estado": "TanStack React Query 5.100.9",
  "formularios": "React Hook Form 7.75.0",
  "graficos": "Recharts 3.8.1",
  "notificacoes": "Sonner 2.0.7"
}
```

### 🌐 TODAS AS PÁGINAS (38 total)

| # | Arquivo | Rota | Descrição |
|---|---------|------|-----------|
| 1 | `IntelligenceHub.jsx` | `/` (PADRÃO) | Hub unificado de dados, relatórios e performance |
| 2 | `HomePage.jsx` | `/home` | Página inicial do sistema |
| 3 | `Dashboard.jsx` | `/dashboard` | Visão geral dos sistemas e serviços |
| 4 | `IntelligenceDashboard.jsx` | `/intelligence-dashboard` | Dashboard de inteligência empresarial |
| 5 | `AxHubDashboard.jsx` | `/axhub-dashboard` | Dashboard específico do AxHub |
| 6 | `MapaOperacoes.jsx` | `/mapa-operacoes` | Ecossistema completo: fluxos, processos, sites |
| 7 | `PainelProcessos.jsx` | `/painel-processos` | Sites, credenciais, métricas operacionais |
| 8 | `AnalisesSites.jsx` | `/analise` | Comparativo de contratos e operações |
| 9 | `Chat.jsx` | `/chat` | Assistente inteligente AxionIA |
| 10 | `WhatsApp.jsx` | `/whatsapp` | Integração e atendimento via WhatsApp |
| 11 | `Helpdesk.jsx` | `/helpdesk` | Gestão de tickets e atendimento Jitbit |
| 12 | `SlaCompliance.jsx` | `/sla-compliance` | Relatório de conformidade SLA Jitbit |
| 13 | `AnaliseImagens.jsx` | `/analise-imagens` | OCR, validação e qualidade de capturas |
| 14 | `DiagnosticoMedicao.jsx` | `/diagnostico-medicao` | Diagnóstico inteligente de equipamentos |
| 15 | `DuplicidadeInfracoes.jsx` | `/duplicidade` | Auditoria de infrações duplicadas |
| 16 | `VarcoMonitor.jsx` | `/varco` | Monitoramento frota ITScam 450 (72 dispositivos) |
| 17 | `PipelineEditais.jsx` | `/pipeline-editais` | Buscar → Analisar → Revisar → Especificar |
| 18 | `BuscaEditaisGov.jsx` | `/busca-editais` | Busca de editais em portais governamentais |
| 19 | `AnaliseEditalAvancada.jsx` | `/analise-edital-avancada` | Análise avançada de editais com IA |
| 20 | `Conformidade.jsx` | `/conformidade` | Análise de conformidade com editais |
| 21 | `AnalisaMultiProduto.jsx` | `/analisa-multi` | Análise comparativa AxHub + AxTon + AxCross |
| 22 | `ConfidencaRevisao.jsx` | `/confianca` | Revisão de itens com baixa confiança |
| 23 | `RelatorioContrato.jsx` | `/relatorio-contrato` | Análises técnicas via IA por contrato |
| 24 | `RelatorioFluxo.jsx` | `/relatorio-fluxo` | Métricas de atendimento e fluxo operacional |
| 25 | `KnowledgeBase.jsx` | `/kb` | Base de conhecimento com embeddings |
| 26 | `GerarDoc.jsx` | `/gerar-doc` | Documentação automatizada com IA |
| 27 | `FontesPesquisa.jsx` | `/fontes` | URLs e referências de pesquisa |
| 28 | `Roadmap.jsx` | `/roadmap` | Geração de backlog a partir de lacunas |
| 29 | `Specs.jsx` | `/specs` | Especificação técnica de funcionalidades (PRD) |
| 30 | `Treinamento.jsx` | `/treinamento` | Capacitação e aprendizado da IA |
| 31 | `PlanilhaHoras.jsx` | `/planilha-horas` | Controle de tempo e atividades |
| 32 | `Logs.jsx` | `/logs` | Auditoria e rastreio de operações |
| 33 | `Configuracoes.jsx` | `/config` | Configurações do sistema e conexões |
| 34 | `ChamadosSites.jsx` | `/chamados-sites` | Gestão de tickets por site |
| 35 | `GuiaSites.jsx` | `/guia-sites` | Guia de sites operacionais |
| 36 | `DashboardWidgets.jsx` | `/widgets` | Widgets para dashboards |
| 37 | `DashboardReports.jsx` | *(implícito)* | Relatórios consolidados |
| 38 | `Processos.jsx` | *(implícito)* | Gestão de processos |

### 🧩 COMPONENTES COMPARTILHADOS

| Componente | Arquivo | Uso |
|------------|---------|-----|
| **Credenciais Manager** | `CredenciaisManager.jsx` | Gerenciamento seguro de credenciais de sites |

### 🔌 SERVICES

| Service | Arquivo | Descrição |
|---------|---------|-----------|
| **API Client** | `api.js` | Cliente HTTP centralizado (Axios) com interceptors |

### 📊 DATA

| Arquivo | Descrição |
|---------|-----------|
| `sitesData.js` | Dados consolidados de todos os sites AxHub e AxCross (IBAMETRO, IMEPI, IPEM-PE, etc.) |
| `sitesCredentials.js` | Credenciais de acesso aos sites operacionais |

### 🗺️ ESTRUTURA DE MENU (App.jsx)

```javascript
const MENU_SECTIONS = {
  "Operação": [
    "Intelligence Hub",
    "Mapa de Operações", 
    "Dashboard",
    "Análise de Sites"
  ],
  "Atendimento": [
    "Chat IA",
    "WhatsApp",
    "Helpdesk"
  ],
  "Qualidade": [
    "Análise de Imagens",
    "Diagnóstico Medição",
    "Auditoria Duplicidades",
    "VARCO Monitor",
    "Relatório por Contrato",
    "Relatório de Fluxo"
  ],
  "Inteligência": [
    "Pipeline de Editais"
  ],
  "Recursos": [
    "Knowledge Base",
    "Gerador de Docs",
    "Fontes de Pesquisa",
    "Treinamento",
    "Planilha de Horas",
    "Logs do Sistema"
  ],
  "Sistema": [
    "Configurações"
  ]
}
```

### 🚀 COMANDOS

```bash
# Desenvolvimento
npm run dev          # Inicia Vite dev server na porta 3017

# Build
npm run build        # Build de produção

# Preview
npm run preview      # Preview do build
```

---

## ⚙️ BACKEND: AXION-IA-API

### 📦 Tecnologias Core

```json
{
  "runtime": "Node.js 20+",
  "framework": "Express 4.18.2",
  "mongodb": "Mongoose 9.3.3",
  "sqlserver": "MSSQL 12.2.1",
  "ia": "OpenAI 4.0.0",
  "whatsapp": "@whiskeysockets/baileys 7.0.0",
  "scraping": "Cheerio 1.2.0",
  "uploads": "Multer 2.1.1",
  "imagens": "Sharp 0.34.5",
  "seguranca": "Helmet 8.1.0",
  "rateLimit": "Express-Rate-Limit 8.4.1",
  "scheduler": "Node-Cron 4.2.1",
  "queue": "p-queue 9.2.0"
}
```

### 🎮 TODOS OS CONTROLLERS (32 total)

| # | Controller | Endpoints | Descrição |
|---|------------|-----------|-----------|
| 1 | `controller.js` | 7 | Chat IA, histórico, estatísticas, treinamento, KB |
| 2 | `helpdesk-controller.js` | 20+ | Integração Jitbit completa (tickets, polling, SLA) |
| 3 | `axhub-controller.js` | 10 | Integração SQL Server AxHub |
| 4 | `axton-controller.js` | 6 | Integração SQL Server AxTon |
| 5 | `axcross-controller.js` | 8 | Integração SQL Server AxCross |
| 6 | `medicao-controller.js` | 4 | Diagnóstico inteligente de medição |
| 7 | `analise-imagem-controller.js` | 15+ | OCR, classificação, comparação de imagens |
| 8 | `doc-controller.js` | 4 | Geração de documentação com IA |
| 9 | `relatorio-controller.js` | 3 | Relatórios de fluxo diário |
| 10 | `relatorio-contrato-controller.js` | 6 | Relatórios técnicos por contrato |
| 11 | `config-controller.js` | 3 | Gerenciamento de configurações |
| 12 | `coletor-controller.js` | 7 | Coleta automática de editais (PNCP) |
| 13 | `fontes-controller.js` | 7 | Análise de usabilidade de fontes |
| 14 | `roadmap-controller.js` | 5 | Geração de backlog |
| 15 | `spec-controller.js` | 4 | Especificações técnicas (PRD) |
| 16 | `conformidade-controller.js` | 10 | Análise de conformidade com editais |
| 17 | `whatsapp-controller.js` | 8 | Integração WhatsApp completa |
| 18 | `job-controller.js` | 4 | Processamento em lote |
| 19 | `admin-controller.js` | 4 | Administração da KB |
| 20 | `agent-controller.js` | 6 | Orquestrador central AxionAgent |
| 21 | `varco-controller.js` | 11 | Validador integração câmeras VARCO |
| 22 | `leitura-controller.js` | 2 | Agente 80/20 de leitura estratégica |
| 23 | `confidence-controller.js` | 7 | Fila de revisão de baixa confiança |
| 24 | `edital-controller.js` | 8 | Busca, importação, análise de editais |
| 25 | `crm-controller.js` | 9 | Gestão de contatos e clientes |
| 26 | `equipamento-controller.js` | 6 | Gestão de equipamentos CRM |
| 27 | `credenciais-controller.js` | 3 | Teste de login, alteração de senha |
| 28 | `duplicidade-controller.js` | 5 | Detecção de infrações duplicadas |
| 29 | `sites-helpdesk-controller.js` | 5 | Mapa sites × categorias Jitbit |
| 30 | `upload-controller.js` | 2 | Upload de contexto para docs |
| 31 | `validate-controller.js` | 1 | Validação de fluxo de alertas |
| 32 | `health-controller.js` | 1 | Health check para monitoramento |

### 🗂️ TODOS OS MODELS MONGODB (17 total)

| # | Model | Collection | Descrição |
|---|-------|------------|-----------|
| 1 | `kb.model.js` | `kbs` | Knowledge Base (embeddings) |
| 2 | `log.model.js` | `logs` | Logs do sistema |
| 3 | `whatsapp-sessao.model.js` | `whatsappsessaos` | Sessões WhatsApp |
| 4 | `conformidade.model.js` | `conformidades` | Análises de conformidade |
| 5 | `conformidade-multi.model.js` | `conformidademultis` | Análises multi-produto |
| 6 | `spec.model.js` | `specs` | Especificações técnicas (PRD) |
| 7 | `roadmap.model.js` | `roadmaps` | Roadmaps de backlog |
| 8 | `job.model.js` | `jobs` | Jobs de processamento |
| 9 | `confianca-revisao.model.js` | `confiancarevisaos` | Fila de revisão |
| 10 | `fonte.model.js` | `fontes` | Fontes de pesquisa |
| 11 | `relatorio-contrato.model.js` | `relatoriocontratos` | Relatórios por contrato |
| 12 | `approval.model.js` | `aprovacoes` | Aprovações de pedidos |
| 13 | `pedido-compra.model.js` | `pedidocompras` | Pedidos de compra |
| 14 | `contato.model.js` | `contatos` | Contatos CRM |
| 15 | `cliente.model.js` | `clientes` | Clientes CRM |
| 16 | `equipamento.model.js` | `equipamentos` | Equipamentos CRM |
| 17 | *(implícito)* | `editais` | Editais importados |

### 🔧 TODOS OS SERVICES (30 total)

| # | Service | Descrição |
|---|---------|-----------|
| 1 | `axhub-db.js` | Conexão SQL Server AxHub |
| 2 | `axton-db.js` | Conexão SQL Server AxTon |
| 3 | `axcross-db.js` | Conexão SQL Server AxCross |
| 4 | `ia-adapter.js` | Adaptador OpenAI |
| 5 | `embedding.js` | Geração de embeddings |
| 6 | `search.js` | Motor de busca semântica |
| 7 | `analise.js` | Motor de análise IA |
| 8 | `analise-imagem.js` | Análise de imagens com Vision |
| 9 | `ocr-processor.js` | Processamento OCR |
| 10 | `conformidade.js` | Motor de conformidade |
| 11 | `conformidade-enhanced.js` | Conformidade aprimorada |
| 12 | `multi-product-analysis.js` | Análise multi-produto |
| 13 | `edital-analise-avancada.js` | Análise avançada de editais |
| 14 | `requirement-classifier.js` | Classificador de requisitos |
| 15 | `roadmap-engine.js` | Motor de roadmap |
| 16 | `spec-engine.js` | Motor de especificações |
| 17 | `relatorio-contrato.js` | Geração de relatórios |
| 18 | `whatsapp.service.js` | Serviço WhatsApp |
| 19 | `whatsapp-flows.js` | Fluxos WhatsApp |
| 20 | `whatsapp-transport.js` | Transporte WhatsApp |
| 21 | `pncp.service.js` | Serviço PNCP |
| 22 | `pncp-scraper.js` | Scraper PNCP |
| 23 | `confidence-queue.js` | Fila de confiança |
| 24 | `confidence-scorer.js` | Pontuação de confiança |
| 25 | `job-queue.js` | Fila de jobs |
| 26 | `training.js` | Treinamento da IA |
| 27 | `comparador.js` | Comparação de dados |
| 28 | `extrator.js` | Extração de dados |
| 29 | `normalizador.js` | Normalização de dados |
| 30 | `parser.js` | Parser de documentos |

### 🤖 AGENTE AXION (Orchestrator)

| Arquivo | Descrição |
|---------|-----------|
| `agent/agent.js` | Agente principal AxionIA |
| `agent/orchestrator.js` | Orquestrador de tarefas |
| `agent/state.js` | Gerenciamento de estado |
| `agent/tasks.js` | Definição de tarefas |
| `agent/config.js` | Configuração do agente |

### 📝 SCRIPTS DE SEED

| Script | Descrição |
|--------|-----------|
| `seed-kb.js` | Seed geral da Knowledge Base |
| `seed-docs.js` | Seed de documentação na KB |
| `seed-jitbit.js` | Seed de tickets Jitbit na KB |

### 🔐 VARIÁVEIS DE AMBIENTE (.env)

#### ✅ Obrigatórias

```bash
PORT=3100
OPENAI_API_KEY=sk-proj-...
MONGO_URI=mongodb://localhost:27017/axion-ia
JITBIT_URL=https://desk.axiontecnologia.com.br/helpdesk
JITBIT_USER=admin@empresa.com.br
JITBIT_PASS="SuaSenha"
```

#### 🔹 Opcionais (SQL Server)

```bash
# AxHub
AXHUB_DB_HOST=localhost
AXHUB_DB_PORT=1433
AXHUB_DB_NAME=AxHub
AXHUB_DB_USER=
AXHUB_DB_PASS=
AXHUB_DB_ENCRYPT=false

# AxTon
AXTON_DB_HOST=localhost
AXTON_DB_PORT=1433
AXTON_DB_NAME=AxTon
AXTON_DB_USER=
AXTON_DB_PASS=
AXTON_DB_ENCRYPT=false

# AxCross
AXCROSS_DB_HOST=localhost
AXCROSS_DB_PORT=1433
AXCROSS_DB_NAME=AxCross
AXCROSS_DB_USER=
AXCROSS_DB_PASS=
AXCROSS_DB_ENCRYPT=false
```

#### 🔹 Opcionais (Outros)

```bash
CORS_ORIGIN=http://localhost:3001
API_TOKEN=
VARCO_EMAIL=suporte@axiontecnologia.com.br
VARCO_PASSWORD=
TELEGRAM_TOKEN=
TELEGRAM_CHAT_ID=
```

### 🚀 COMANDOS

```bash
# Desenvolvimento
npm start                    # Inicia API na porta 3100 (com .env)
node --env-file=.env src/app.js

# Seed
npm run seed                # Popula Knowledge Base

# Produção
PM2 start src/app.js --name axion-ia-api
```

---

## 📚 PORTAIS DOCUSAURUS (3 portais)

### 1. AxHub.Docs (Fiscalização Eletrônica)

| Item | Valor |
|------|-------|
| **Porta** | 3010 |
| **URL** | http://localhost:3010/AxHub.Docs |
| **Comando** | `npm run serve -- --port 3010` |

**Estrutura de Diretórios**:
```
docs/
├── administracao/
├── balanca/
├── cadastros-basicos/
├── controle-acesso/
├── cronotacografo/
├── glossario/
├── img/
├── infracoes/
├── medicoes/
├── operacoes/
├── pesagem/
├── Planilhas/
├── primeiros-passos/
├── referencia-tecnica/
├── relatorios/
├── veiculos/
└── intro.md
```

### 2. AxTon.Docs (Pesagem de Veículos)

| Item | Valor |
|------|-------|
| **Porta** | 3011 |
| **URL** | http://localhost:3011/AxTon.Docs |
| **Comando** | `npm run serve -- --port 3011` |

**Estrutura de Diretórios**:
```
docs/
├── administracao/
├── cadastros/
├── cadastros-basicos/
├── controle-acesso/
├── glossario/
├── img/
├── infracoes/
├── medicoes/
├── operacoes/
├── pesagem/
├── primeiros-passos/
├── referencia-tecnica/
├── relatorios/
├── sistema/
├── veiculos/
└── intro.md
```

### 3. AxCross.Docs (Controle de Acesso)

| Item | Valor |
|------|-------|
| **Porta** | 3012 |
| **URL** | http://localhost:3012/AxCross.Docs |
| **Comando** | `npm run serve -- --port 3012` |

**Estrutura de Diretórios**:
```
docs/
├── administracao/
├── cadastros/
├── glossario/
├── img/
├── intro.md
├── operacoes/
├── primeiros-passos/
├── referencia-tecnica/
├── relatorios/
└── sistema/
```

---

## 🗄️ BANCOS DE DADOS

### 🍃 MongoDB: axion-ia

| Collection | Model | Descrição |
|------------|-------|-----------|
| `kbs` | kb.model.js | Knowledge Base (embeddings OpenAI) |
| `logs` | log.model.js | Logs do sistema |
| `whatsappsessaos` | whatsapp-sessao.model.js | Sessões WhatsApp |
| `conformidades` | conformidade.model.js | Análises de conformidade |
| `conformidademultis` | conformidade-multi.model.js | Análises multi-produto |
| `specs` | spec.model.js | Especificações técnicas (PRD) |
| `roadmaps` | roadmap.model.js | Roadmaps de backlog |
| `jobs` | job.model.js | Jobs de processamento |
| `confiancarevisaos` | confianca-revisao.model.js | Fila de revisão |
| `fontes` | fonte.model.js | Fontes de pesquisa |
| `relatoriocontratos` | relatorio-contrato.model.js | Relatórios por contrato |
| `aprovacoes` | approval.model.js | Aprovações de pedidos |
| `pedidocompras` | pedido-compra.model.js | Pedidos de compra |
| `contatos` | contato.model.js | Contatos CRM |
| `clientes` | cliente.model.js | Clientes CRM |
| `equipamentos` | equipamento.model.js | Equipamentos CRM |

### 🗂️ SQL Server: AxHub (Fiscalização)

**Tabelas Principais**:
- `dbo.Equipamentos` - Equipamentos de fiscalização
- `dbo.Infracoes` - Infrações registradas
- `dbo.Operacoes` - Operações do sistema
- `dbo.Passagens` - Passagens de veículos
- `dbo.Triagens` - Triagens de infrações
- `dbo.Monitoramentos` - Monitoramentos em tempo real
- `dbo.Usuarios` - Usuários do sistema
- `dbo.Imagens` - Imagens das infrações
- `dbo.Medicoes` - Medições de equipamentos
- `dbo.Afericoes` - Aferições metrológicas

### 🗂️ SQL Server: AxTon (Pesagem)

**Tabelas Principais**:
- `dbo.Pesagens` - Pesagens de veículos
- `dbo.Infracoes` - Infrações de peso
- `dbo.Equipamentos` - Equipamentos de pesagem
- `dbo.Usuarios` - Usuários do sistema
- `dbo.Operacoes` - Operações do sistema
- `dbo.Veiculos` - Veículos cadastrados

### 🗂️ SQL Server: AxCross (Controle de Acesso)

**Tabelas Principais**:
- `dbo.Passagens` - Passagens de controle de acesso
- `dbo.Equipamentos` - Equipamentos de controle
- `dbo.Locais` - Locais de acesso
- `dbo.Operacoes` - Operações do sistema
- `dbo.Usuarios` - Usuários do sistema

---

## 🔌 INTEGRAÇÕES EXTERNAS

### 1. Jitbit Helpdesk

| Item | Valor |
|------|-------|
| **Tipo** | REST API |
| **URL** | https://desk.axiontecnologia.com.br/helpdesk |
| **Auth** | Basic Auth (user + password) |
| **Features** | Tickets, Categorias, Comentários, Status, SLA |
| **Polling** | Automático via scheduler (tickets fechados) |

**Endpoints Usados**:
- `/api/tickets` - Listar tickets
- `/api/ticket/{id}` - Detalhe do ticket
- `/api/comments` - Adicionar comentário
- `/api/categories` - Listar categorias
- `/api/users` - Listar técnicos

### 2. OpenAI API

| Item | Valor |
|------|-------|
| **Tipo** | REST API |
| **Modelos** | GPT-4o, text-embedding-ada-002, GPT-4 Vision |
| **Uso** | Chat IA, Embeddings, OCR, Análise de documentos |

**Use Cases**:
- **Chat IA**: Assistente inteligente para usuários
- **Embeddings**: Busca semântica na Knowledge Base
- **Vision**: OCR e análise de imagens operacionais
- **Classificação**: Tickets, requisitos, conformidade
- **Geração**: Documentação, especificações, relatórios

### 3. VARCO IoT Platform

| Item | Valor |
|------|-------|
| **Tipo** | REST API |
| **Frota** | 72 dispositivos ITScam 450 (SETRANS-GO) |
| **Features** | Heartbeat, Auditoria, Validação, Recoleta |

**Endpoints**:
- `/frota` - Listar frota completa
- `/validar-dispositivo` - Validar dispositivo
- `/heartbeat` - Status de saúde
- `/auditoria` - Auditoria de status

### 4. WhatsApp Business (Baileys)

| Item | Valor |
|------|-------|
| **Tipo** | Socket Connection (não-oficial) |
| **Biblioteca** | @whiskeysockets/baileys 7.0.0 |
| **Auth** | QR Code |

**Features**:
- Conexão via QR Code
- Envio de mensagens
- Botões interativos
- Gestão de sessões
- Fluxos conversacionais

### 5. PNCP (Portal Nacional de Contratações)

| Item | Valor |
|------|-------|
| **Tipo** | Web Scraping |
| **Tecnologia** | Cheerio + Axios |
| **Features** | Busca, Importação, Análise automática |

---

## 🛠️ SCRIPTS DE AUTOMAÇÃO

### PowerShell (11 scripts)

| # | Script | Descrição |
|---|--------|-----------|
| 1 | `iniciar.ps1` | ⭐ Inicia TODOS os serviços do workspace |
| 2 | `encerrar.ps1` | 🛑 Encerra TODOS os serviços |
| 3 | `analisar-documentacao-helpdesk.ps1` | Análise de documentação helpdesk |
| 4 | `converter-md-para-word.ps1` | Conversor MD → Word v1 |
| 5 | `converter-md-para-word-v2.ps1` | Conversor MD → Word v2 |
| 6 | `gerar-analise.ps1` | Gerador de análises |
| 7 | `gerar-codigo.ps1` | Gerador de código |
| 8 | `gerar-diagnostico-imepi.ps1` | Diagnóstico IMEPI |
| 9 | `gerar-prompt-analise.ps1` | Geração de prompts IA |
| 10 | `novo-projeto-docs.ps1` | Scaffolding de projetos docs |
| 11 | `SCRIPT-INTEGRACAO-UNIVERSAL/gerar-pacote-cliente.ps1` | Pacote de integração |

### JavaScript/Node.js (39+ scripts)

#### Scripts de Análise

| Script | Descrição |
|--------|-----------|
| `analisar-equipamentos-faixas.mjs` | Análise de equipamentos e faixas |
| `analisar-xlsx.mjs` | Análise de planilhas Excel |
| `analise-envios.mjs` | Análise de envios |
| `compare-002-007.mjs` | Comparação equipamentos 002/007 |
| `compare-faixas-007.mjs` | Comparação de faixas 007 |

#### Scripts de Geração

| Script | Descrição |
|--------|-----------|
| `gerar-knowledge-base.mjs` | Geração da KB |
| `gerar-pdf.mjs` | Gerador de PDFs |
| `gerar-pdf-lgpd.mjs` | PDFs LGPD |
| `gerar-pdf-portais.mjs` | PDFs dos portais |
| `gerar-pdf-portais-win11.cjs` | PDFs Win11 |
| `gerar-video-axton.cjs` | Vídeo AxTon |
| `gerar-video-narrado-axton.cjs` | Vídeo narrado AxTon |
| `gerar-word.mjs` | Gerador de Word |

#### Scripts de Validação

| Script | Descrição |
|--------|-----------|
| `validar-credenciais.mjs` | Validador de credenciais |
| `validate-pipeline.js` | Validação de pipeline |
| `AxTon/validar-infracoes-lei14229.mjs` | Validação Lei 14.229 |
| `auditoria-itscam/validar.mjs` | Validador ITScam |
| `auditoria-itscam/validar-config.mjs` | Validador config ITScam |
| `auditoria-itscam/verificar-equipamento.mjs` | Verificação equipamento |

#### Scripts de Importação/Exportação

| Script | Descrição |
|--------|-----------|
| `exportar-contatos-multi360.mjs` | Exportação Multi360 |
| `axion-ia-api/importar-contatos-multi360.mjs` | Importação Multi360 |
| `axion-ia-api/importar-equipamentos-zerotier.mjs` | Importação ZeroTier |
| `axion-ia-api/import-axton-backup.cjs` | Importação backup AxTon |

#### Scripts de Correção

| Script | Descrição |
|--------|-----------|
| `fix-encoding.js` | Correção de encoding |
| `axion-ia-api/fix-encoding.js` | Correção encoding API |
| `axion-ia-api/fix-aprovador.mjs` | Correção de aprovador |
| `axion-ia-api/cleanup-duplicates.js` | Limpeza de duplicidades |
| `auditoria-itscam/reverter-ocr.mjs` | Reversão de OCR |
| `auditoria-itscam/reverter-ocr-dinamico.mjs` | Reversão OCR dinâmica |

#### Scripts de Query

| Script | Descrição |
|--------|-----------|
| `axion-ia-api/query-placas.cjs` | Query de placas |
| `axion-ia-api/query-ambas-placas.cjs` | Query ambas placas |

#### Scripts de Seed

| Script | Descrição |
|--------|-----------|
| `axion-ia-api/seed.mjs` | Seed de dados |
| `axion-ia-api/validar-completo.cjs` | Validação completa |

---

## 📊 ARQUIVOS SQL (10 scripts)

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | `COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql` | Comparação de medições |
| 2 | `SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql` | Diagnóstico Goiânia |
| 3 | `SCRIPT-DIAGNOSTICO-PARAMETRIZAVEL.sql` | Diagnóstico parametrizável |
| 4 | `SCRIPT-DIAGNOSTICO-PORTARIA-492-2012.sql` | Diagnóstico Portaria 492 |
| 5 | `SCRIPTS-CORRECAO-HEARTBEAT-IPEMPE.sql` | Correção heartbeat IPEM-PE |
| 6 | `VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql` | Validação contratos Goiânia |
| 7 | `scripts-validacao-T1051.sql` | Validação T1051 |
| 8 | `diagnostico-imagem-imepi.sql` | Diagnóstico imagens IMEPI |
| 9 | `AxHub/Database/AxHub.sql` | Schema completo AxHub |
| 10 | `AxCross/Database/AxCross.sql` | Schema completo AxCross |

---

## 🚀 DEPLOYMENT E INICIALIZAÇÃO

### 🎬 Script Principal: iniciar.ps1

```powershell
# O que faz:
1. Limpa portas 3017, 3010, 3011, 3012, 3100
2. Inicia axion-ia-api (:3100) e aguarda resposta (health check)
3. Inicia axion-ia-panel (:3017)
4. Inicia AxHub.Docs (:3010)
5. Inicia AxTon.Docs (:3011)
6. Inicia AxCross.Docs (:3012)
7. Verifica status de todos os serviços
8. Abre navegador em todas as URLs
```

### 🎭 Portas do Sistema

| Porta | Serviço | URL |
|-------|---------|-----|
| **3100** | axion-ia-api | http://localhost:3100 |
| **3017** | axion-ia-panel | http://localhost:3017 |
| **3010** | AxHub.Docs | http://localhost:3010/AxHub.Docs |
| **3011** | AxTon.Docs | http://localhost:3011/AxTon.Docs |
| **3012** | AxCross.Docs | http://localhost:3012/AxCross.Docs |

### 🏁 Comandos Rápidos

```powershell
# Iniciar tudo
.\iniciar.ps1

# Encerrar tudo
.\encerrar.ps1

# Apenas API
cd axion-ia-api
node --env-file=.env src/app.js

# Apenas Painel
cd axion-ia-panel
npm run dev
```

---

## 🧪 ESTRATÉGIA DE TESTES AUTOMATIZADOS

### 1️⃣ Testes de API (Backend)

**Ferramenta**: Jest + Supertest

**Cobertura**:
- ✅ 250+ endpoints REST
- ✅ Autenticação e autorização
- ✅ Validação de entrada (Zod)
- ✅ Tratamento de erros
- ✅ Rate limiting (120 req/min)

**Exemplo de Teste**:
```javascript
describe('POST /api/chat', () => {
  it('deve processar mensagem IA', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ mensagem: 'Olá' })
      .expect(200);
    
    expect(res.body.resposta).toBeDefined();
  });
});
```

### 2️⃣ Testes E2E (Frontend)

**Ferramenta**: Playwright ou Cypress

**Cobertura**:
- ✅ Fluxo de login
- ✅ Navegação entre 38 páginas
- ✅ Formulários de criação
- ✅ Visualização de dados
- ✅ Interações com dashboards

**Exemplo de Teste**:
```javascript
test('deve navegar para helpdesk', async ({ page }) => {
  await page.goto('http://localhost:3017');
  await page.click('text=Helpdesk');
  await expect(page).toHaveURL('/helpdesk');
});
```

### 3️⃣ Testes de Banco de Dados

**Cobertura**:
- ✅ Queries SQL Server (3 bancos)
- ✅ Operações MongoDB (15+ collections)
- ✅ Embeddings e busca semântica
- ✅ Integridade referencial

### 4️⃣ Testes de Integrações

**Cobertura**:
- ✅ Jitbit API (tickets, categorias)
- ✅ OpenAI API (chat, embeddings, vision)
- ✅ VARCO IoT (frota, heartbeat)
- ✅ WhatsApp Baileys (conexão, envio)
- ✅ PNCP Scraper (busca, importação)

### 5️⃣ Testes de Performance

**Cenários**:
- ✅ Rate limiting (120 req/min)
- ✅ Processamento de imagens em lote
- ✅ Busca semântica com 10.000+ embeddings
- ✅ Relatórios com grandes volumes de dados

---

## 📋 ÁREAS CRÍTICAS PARA TESTES

### 🔴 PRIORIDADE MÁXIMA

1. **Criação e classificação de tickets** (helpdesk-controller.js)
2. **Análise de imagens OCR** (analise-imagem-controller.js)
3. **Consultas SQL Server** (axhub-controller.js, axton-controller.js, axcross-controller.js)
4. **Autenticação e autorização** (auth.js)
5. **Upload e processamento de arquivos** (upload-controller.js, multer)

### 🟡 PRIORIDADE ALTA

6. **Geração de documentação** (doc-controller.js)
7. **Relatórios e dashboards** (relatorio-controller.js, relatorio-contrato-controller.js)
8. **Análise de conformidade** (conformidade-controller.js)
9. **Busca semântica na KB** (embedding.js, search.js)
10. **Integração WhatsApp** (whatsapp-controller.js)

### 🟢 PRIORIDADE MÉDIA

11. **Configurações do sistema** (config-controller.js)
12. **Logs e auditoria** (logs.js, logger.js)
13. **Pipeline de editais** (coletor-controller.js, edital-controller.js)
14. **VARCO Monitor** (varco-controller.js)
15. **Duplicidade de infrações** (duplicidade-controller.js)

---

## 📖 DOCUMENTAÇÃO COMPLEMENTAR

### 📄 Guias e Manuais

| Tipo | Quantidade | Exemplos |
|------|------------|----------|
| **Análises** | 15+ | ANALISE-COMPLETA-DASHBOARD-AXHUB-IPEMPE.md |
| **Guias** | 12+ | GUIA-PRATICO-ATUALIZAR-DADOS-TARJA-INFRACAO.md |
| **Relatórios** | 8+ | RELATORIO-ABNT-CICLO-MEDICAO-AXHUB.md |
| **Diagnósticos** | 5+ | DIAGNOSTICO-T4129-FAIXA-VERMELHA.md |

### 🎥 Recursos Multimídia

- `Apresentacao-AxTon-Narrada.mp4`
- `Apresentacao-Manual-AxTon.mp4`
- `Manual-Axion-Completo-v1.0.0.pdf`
- `Manual-AxHub-v1.0.0.pdf`
- `Manual-AxTon-v1.0.0.pdf`
- `Manual-AxCross-v1.0.0.pdf`

---

## ⚠️ PONTOS CRÍTICOS E OBSERVAÇÕES

### 🔴 Segurança

1. **Rate Limiting**: 120 req/min por IP (ajustar em produção)
2. **MongoDB**: URI deve usar autenticação em produção
3. **Senhas Jitbit**: Senhas com `#` devem estar entre aspas duplas no .env
4. **API Token**: Implementar autenticação JWT
5. **CORS**: Configurar origins permitidas

### 🟡 Performance

1. **Embeddings**: Consomem tokens OpenAI - implementar cache
2. **SQL Server**: Usar connection pooling em produção
3. **Uploads**: Arquivos em `uploads/` - configurar limpeza periódica
4. **Logs MongoDB**: Implementar rotação automática
5. **Imagens**: Adicionar compressão no upload

### 🟢 Integrações

1. **WhatsApp Baileys**: Pode requerer re-autenticação (QR Code)
2. **OpenAI API**: Implementar retry logic para rate limits
3. **VARCO IoT**: Credenciais específicas para SETRANS-GO
4. **Jitbit**: URL deve incluir `/helpdesk` (não a página de login)

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

### Para Plataforma de Testes QA

1. ✅ **Inventário Completo** - ✔️ CONCLUÍDO
2. ⏳ **Definir Suite de Testes**
   - Criar spec de testes para cada controller
   - Definir cenários E2E para cada página
   - Mapear queries críticas de SQL Server
3. ⏳ **Setup de Ferramentas**
   - Configurar Jest + Supertest
   - Configurar Playwright ou Cypress
   - Configurar MongoDB de testes
   - Configurar SQL Server de testes
4. ⏳ **Implementação Incremental**
   - Fase 1: Testes de API (controllers críticos)
   - Fase 2: Testes E2E (fluxos principais)
   - Fase 3: Testes de integração
   - Fase 4: Testes de performance
5. ⏳ **CI/CD**
   - GitHub Actions para execução automática
   - Coverage reports
   - Integration com PRs

---

## 📞 CONTATOS E LINKS

| Item | Valor |
|------|-------|
| **Workspace** | `c:\Users\Santiago\Axiondocs\Axion.Docs` |
| **Jitbit** | https://desk.axiontecnologia.com.br/helpdesk |
| **Site** | https://axiontecnologia.com.br |
| **GitHub** | https://github.com/Axion-Tecnologia |

---

## 📊 ESTATÍSTICAS FINAIS

| Categoria | Quantidade |
|-----------|------------|
| **Páginas Frontend** | 38 |
| **Controllers Backend** | 32 |
| **Endpoints API** | 250+ |
| **Models MongoDB** | 17 |
| **Services** | 30 |
| **Scripts PowerShell** | 11 |
| **Scripts JavaScript** | 39+ |
| **Scripts SQL** | 10 |
| **Portais Docusaurus** | 3 |
| **Bancos de Dados** | 4 (1 MongoDB + 3 SQL Server) |
| **Integrações Externas** | 5 |
| **Portas Utilizadas** | 5 |

---

**FIM DO INVENTÁRIO**

*Documentação gerada em 2026-06-19 por GitHub Copilot*
