# Manual AxionIA — Painel, API e Módulos Integrados

**Versão:** 2.0 | **Data:** Abril/2026 | **Produto:** Plataforma AxionIA  
**Empresa:** Axion Tecnologia

---

## Índice

1. [Visão Geral do Ecossistema](#1-visão-geral-do-ecossistema)
2. [Arquitetura e Componentes](#2-arquitetura-e-componentes)
3. [Instalação e Configuração](#3-instalação-e-configuração)
4. [Iniciando os Serviços](#4-iniciando-os-serviços)
5. [Painel AxionIA — Telas e Funcionalidades](#5-painel-axionia--telas-e-funcionalidades)
   - 5.1 [Dashboard](#51-dashboard)
   - 5.2 [Chat](#52-chat)
   - 5.3 [Helpdesk](#53-helpdesk)
   - 5.4 [Gerar Documentação](#54-gerar-documentação)
   - 5.5 [Fontes de Pesquisa](#55-fontes-de-pesquisa)
   - 5.6 [Roadmap](#56-roadmap)
   - 5.7 [Especificações (PRD)](#57-especificações-prd)
   - 5.8 [Treinamento](#58-treinamento)
   - 5.9 [Logs de Interações](#59-logs-de-interações)
   - 5.10 [Knowledge Base](#510-knowledge-base)
   - 5.11 [Configurações](#511-configurações)
6. [Motor de Inteligência — Como a IA Responde](#6-motor-de-inteligência--como-a-ia-responde)
7. [Widget de Suporte Embutido](#7-widget-de-suporte-embutido)
8. [Portais de Documentação Docusaurus](#8-portais-de-documentação-docusaurus)
9. [API REST — Referência de Endpoints](#9-api-rest--referência-de-endpoints)
10. [Variáveis de Ambiente (.env)](#10-variáveis-de-ambiente-env)
11. [Fluxo de Trabalho Completo](#11-fluxo-de-trabalho-completo)
12. [Solução de Problemas](#12-solução-de-problemas)

---

## 1. Visão Geral do Ecossistema

O AxionIA é uma **plataforma de inteligência artificial** construída para:

- **Atender automaticamente** chamados do helpdesk Jitbit usando IA (keywords + embeddings + GPT)
- **Gerar documentação técnica** para os três produtos Axion (AxHub, AxTon, AxCross) com auxílio de IA
- **Analisar cobertura** da documentação existente comparando com fontes externas (editais, manuais, PNCP)
- **Gerar backlogs priorizados** (roadmaps) a partir de lacunas identificadas
- **Especificar automaticamente** funcionalidades do roadmap em formato PRD (Product Requirements Document)
- **Exibir um assistente embutido** (widget) dentro dos sistemas AxHub, AxTon e AxCross

### Produtos Suportados

| Produto | Descrição | Banco SQL |
|---|---|---|
| **AxHub** | Sistema de fiscalização de trânsito (radar, câmera, infrações) | `AxHub` (SQL Server) |
| **AxTon** | Sistema de pesagem veicular (balança, cronotacógrafo) | `AxTon` (SQL Server) |
| **AxCross** | Monitoramento de cruzamentos semaforizados | `AxCross` (SQL Server) |

---

## 2. Arquitetura e Componentes

```
┌─────────────────────────────────────────────────────────┐
│                  axion-ia-panel (React)                  │
│                   http://localhost:3001                  │
│    Dashboard │ Chat │ Helpdesk │ Docs │ Fontes │ ...     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  axion-ia-api (Node.js)                  │
│                   http://localhost:3100                  │
│                                                          │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────────┐ │
│  │  engine.js   │  │ scheduler  │  │  doc-generator  │ │
│  │  (IA: KB +   │  │ (Jitbit    │  │  (GPT-4o-mini   │ │
│  │  embeddings  │  │  polling + │  │   + template)   │ │
│  │  + GPT)      │  │  PNCP cron)│  └─────────────────┘ │
│  └──────────────┘  └────────────┘                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  comparador  │  │ roadmap-     │  │  spec-engine  │  │
│  │  (análise    │  │ engine       │  │  (PRD via IA) │  │
│  │   cobertura) │  │ (backlog)    │  │               │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────┬──────────────────┬──────────────────────────────┘
        │                  │
   ┌────▼────┐       ┌─────▼─────┐
   │ MongoDB │       │ SQL Server│
   │(embeddings│     │(AxHub /   │
   │  logs    │      │ AxTon /   │
   │  fontes  │      │ AxCross)  │
   │  roadmap │      └───────────┘
   │  specs)  │
   └──────────┘

      + Portais Docusaurus (portas 3010, 3011, 3012)
      + Widget JS embutido nos sistemas
      + API pública PNCP (coleta automática)
```

### Diretórios do Projeto

```
Axion.Docs/
├── axion-ia-api/         ← API Node.js (porta 3100)
│   └── src/
│       ├── app.js              starter principal
│       ├── engine.js           motor de IA (3 camadas)
│       ├── classifier.js       keywords → resposta direta
│       ├── scheduler.js        cron Jitbit + PNCP
│       ├── routes.js           todos os endpoints REST
│       ├── models/             MongoDB (kb, log, fonte, roadmap, spec, approval)
│       └── services/           lógica de negócio isolada
├── axion-ia-panel/       ← Painel React/Vite (porta 3001)
│   └── src/pages/              12 telas do painel
├── AxHub/
│   ├── docs-portal/            Docusaurus (porta 3010)
│   └── widget/                 axhub-suporte.js + knowledge-base.json
├── AxTon/
│   ├── docs-portal/            Docusaurus (porta 3011)
│   └── widget/                 axton-suporte.js + knowledge-base.json
└── AxCross/
    ├── docs-portal/            Docusaurus (porta 3012)
    └── widget/                 axcross-suporte.js + knowledge-base.json
```

---

## 3. Instalação e Configuração

### 3.1 Pré-requisitos

- Node.js 18 ou superior
- MongoDB Community 6+ (local ou URI remota)
- SQL Server 2016+ (opcional — necessário apenas para dados live dos produtos)
- npm 9+

### 3.2 Instalar Dependências

```powershell
# API
cd axion-ia-api
npm install

# Painel React
cd ../axion-ia-panel
npm install
```

Os portais Docusaurus já têm `node_modules` prontos. Caso precise reinstalar:

```powershell
cd AxHub/docs-portal;   npm install
cd AxTon/docs-portal;   npm install
cd AxCross/docs-portal; npm install
```

### 3.3 Criar o arquivo `.env` da API

Crie o arquivo `axion-ia-api/.env` com o conteúdo abaixo, preenchendo os valores:

```env
# ─── API ─────────────────────────────────────────────
PORT=3100
CORS_ORIGIN=http://localhost:3001

# ─── MongoDB ─────────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/axion-ia

# ─── OpenAI (opcional — há fallback por template) ────
OPENAI_API_KEY=sk-...

# ─── Jitbit Helpdesk (opcional) ──────────────────────
JITBIT_URL=https://sua-empresa.jitbit.com
JITBIT_TOKEN=token-bearer-aqui
# alternativa Basic Auth:
# JITBIT_USER=seu-usuario
# JITBIT_PASS=sua-senha

# ─── Intervalo de polling em minutos (padrão: 2) ─────
POLLING_INTERVAL=2

# ─── Modo revisão: true = aguarda aprovação humana ───
# false = respostas com score ≥ 0.85 são enviadas diretamente
MODO_REVISAO=true

# ─── AxHub SQL Server ─────────────────────────────────
AXHUB_DB_HOST=seu-servidor
AXHUB_DB_PORT=1433
AXHUB_DB_NAME=AxHub
AXHUB_DB_USER=usuario
AXHUB_DB_PASS=senha
AXHUB_DB_ENCRYPT=false

# ─── AxTon SQL Server ─────────────────────────────────
AXTON_DB_HOST=seu-servidor
AXTON_DB_PORT=1433
AXTON_DB_NAME=AxTon
AXTON_DB_USER=usuario
AXTON_DB_PASS=senha
AXTON_DB_ENCRYPT=false

# ─── AxCross SQL Server ───────────────────────────────
AXCROSS_DB_HOST=seu-servidor
AXCROSS_DB_PORT=1433
AXCROSS_DB_NAME=AxCross
AXCROSS_DB_USER=usuario
AXCROSS_DB_PASS=senha
AXCROSS_DB_ENCRYPT=false

# ─── Coleta PNCP (opcional) ───────────────────────────
PNCP_COLETA_ATIVA=true
```

### 3.4 Carregar a Knowledge Base inicial

Após instalar e configurar, popule o MongoDB com as perguntas/respostas base:

```powershell
cd axion-ia-api
npm run seed
```

---

## 4. Iniciando os Serviços

### Ordem recomendada

**1. MongoDB** — verifique se está rodando:
```powershell
# Checar se MongoDB está ativo
Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
# ou iniciar manualmente:
mongod --dbpath C:\data\db
```

**2. API AxionIA:**
```powershell
cd axion-ia-api
npm start
# Saída esperada:
# 📦 MongoDB conectado: mongodb://localhost:27017/axion-ia
# 🚀 AxionIA API rodando na porta 3100
```

**3. Painel React:**
```powershell
cd axion-ia-panel
npm run dev
# Acessar: http://localhost:3001
```

**4. Portais de Documentação (opcional):**
```powershell
# AxHub (porta 3010)
cd AxHub/docs-portal
npx docusaurus serve --port 3010 --host 0.0.0.0

# AxTon (porta 3011)
cd AxTon/docs-portal
npx docusaurus serve --port 3011 --host 0.0.0.0

# AxCross (porta 3012)
cd AxCross/docs-portal
npx docusaurus serve --port 3012 --host 0.0.0.0
```

> **Dica:** Use abas separadas do terminal para cada serviço, ou adapte o script `iniciar.ps1` da raiz do projeto.

---

## 5. Painel AxionIA — Telas e Funcionalidades

Acesse o painel em: **http://localhost:3001**

O painel possui barra de navegação lateral com as seguintes seções:

```
Dashboard
Chat
Helpdesk
📄 Gerar Doc
🔎 Fontes de Pesquisa
🗺️ Roadmap
📐 Specs
Treinamento
Logs
Knowledge Base
──────────────
⚙️ Configurações
```

---

### 5.1 Dashboard

**Rota:** `/`

O Dashboard é organizado em **5 abas**:

#### Aba "📊 Visão Geral"
Exibe métricas gerais da IA de suporte:

| Indicador | Descrição |
|---|---|
| **Total Interações** | Total de mensagens processadas pelo motor (KB + embeddings + OpenAI) |
| **Entradas KB** | Quantidade de registros na Knowledge Base no MongoDB |
| **Taxa Resolução KB** | Percentual respondido diretamente por keywords sem acionar IA pesada |
| **Via KB (keywords)** | Respostas diretas por palavras-chave |
| **Via Embeddings** | Respostas encontradas por similaridade semântica |
| **Via OpenAI (fallback)** | Perguntas que escalaram para o GPT |
| **Volume últimos 7 dias** | Tabela de interações diárias |
| **Top Módulos** | Módulos mais consultados pelos usuários |

#### Aba "🖥️ AxHub"
- Status da conexão SQL Server AxHub
- Resumo: quantidade de equipamentos, operações, infrações, passagens, triagens, usuários
- Listagem completa de tabelas do banco com contagem de registros

#### Aba "⚖️ AxTon"
- Status da conexão SQL Server AxTon
- Resumo: equipamentos, operações, pesagens, infrações, usuários
- Listagem de tabelas

#### Aba "🚦 AxCross"
- Status da conexão SQL Server AxCross
- Resumo: equipamentos, operações, passagens, locais, usuários
- Listagem de tabelas

#### Aba "⚙️ Configurações" (no Dashboard)
- URL da API AxionIA (padrão: `http://localhost:3100/api`)
- Botão "Testar" para verificar conectividade
- Blocos de referência das variáveis de ambiente por banco

> **Ponto de atenção:** Se a Visão Geral mostrar "API indisponível", a API não está rodando. Inicie com `npm start` na pasta `axion-ia-api`.

---

### 5.2 Chat

**Rota:** `/chat`

Interface de chat para testar o motor de IA diretamente no painel.

**Como usar:**
1. Digite uma pergunta no campo de texto (ex: `"como cadastrar um equipamento"`)
2. Pressione **Enter** ou clique em **Enviar**
3. A IA responde usando o motor de 3 camadas (KB → embeddings → GPT)

**Indicadores de origem** (visíveis apenas via API, não na tela):
- `kb` — respondido por keywords
- `embedding` — respondido por similaridade
- `openai` — respondido pelo GPT

> **Uso típico:** Validar se uma nova entrada adicionada via Treinamento está sendo reconhecida corretamente.

---

### 5.3 Helpdesk

**Rota:** `/helpdesk`

Integração completa com o **Jitbit Helpdesk**. Esta tela possui 4 visualizações:

#### Visualização "Lista de Tickets"
- Exibe tickets do Jitbit filtrados por modo: Abertos / Não respondidos / Todos / Encerrados
- Clicar em um ticket abre o detalhe

#### Visualização "Detalhe do Ticket"
- Exibe assunto, histórico de mensagens e troca
- Ações disponíveis:
  - **Classificar** — a IA analisa o ticket e sugere categoria/resposta
  - **Responder com IA** — envia resposta gerada pelo motor diretamente ao Jitbit

#### Visualização "Polling Automático"
Controla o **robô de atendimento automático**:

| Campo | Descrição |
|---|---|
| **Status** | Ativo / Inativo / Pausado |
| **Intervalo** | Frequência de verificação em minutos (padrão: 2 min) |
| **Última execução** | Timestamp da última rodada |
| **Auto-respondidos** | Quantidade de tickets respondidos automaticamente |
| **Sugeridos** | Tickets na fila aguardando aprovação humana |
| **Escalados** | Tickets com confiança baixa (sem resposta automática) |

**Ações:**
- **Iniciar** — ativa o cron de polling
- **Pausar** — suspende sem perder estado
- **Retomar** — reativa de onde parou
- **Limpar** — zera as estatísticas

**Lógica de score:**
```
Score ≥ 0.85  → MODO_REVISAO=false: envia direto | MODO_REVISAO=true: vai para fila
Score ≥ 0.65  → Registrado como sugestão na fila
Score < 0.65  → Escalado (sem resposta automática)
```

#### Visualização "Fila de Revisão"
Lista todas as respostas pendentes de aprovação (quando `MODO_REVISAO=true`):

- Ver resposta sugerida pela IA
- Editar o texto antes de aprovar
- **Aprovar** — envia para o Jitbit
- **Rejeitar** — descarta com motivo opcional

> **Boas práticas:** Manter `MODO_REVISAO=true` nos primeiros 30 dias para calibrar a confiança do motor antes de habilitar envio automático.

#### Novo Ticket
- Formulário para criar um chamado diretamente pelo painel, sem abrir o Jitbit

---

### 5.4 Gerar Documentação

**Rota:** `/gerar-doc`

Ferramenta para **criar páginas de documentação com IA** e salvá-las diretamente nos portais Docusaurus.

**Campos do formulário:**

| Campo | Obrigatório | Descrição |
|---|---|---|
| **Produto** | Sim | AxHub, AxTon ou AxCross |
| **Tema** | Sim | Assunto do documento (ex: "Configuração de câmera PTZ") |
| **Seção** | Sim | Seção do portal onde será salvo (ex: `operacoes`, `primeiros-passos`) |
| **Tipo** | Sim | Guia Analítico / Manual do Usuário / Tutorial / Referência Rápida / etc. |
| **Detalhes** | Não | Contexto adicional para a IA gerar conteúdo mais específico |
| **Posição na sidebar** | Não | Número de ordem no menu lateral |

**Fluxo:**
1. Preencher o formulário e clicar em **Gerar**
2. A API usa GPT-4o-mini para escrever o documento em Markdown estruturado
3. Caso a OpenAI esteja indisponível (sem chave ou quota esgotada), um **template offline** é gerado com marcações `✏️` indicando onde revisar
4. O documento aparece no editor com abas **Editor** e **Preview**
5. Clicar em **Salvar no Portal** → o arquivo `.md` é gravado na pasta `docs/` do portal correspondente
6. Ao reiniciar o Docusaurus, a nova página aparece no menu

> **Atenção:** O Docusaurus precisa ser reiniciado (ou refeito o build) para que páginas novas apareçam no portal.

---

### 5.5 Fontes de Pesquisa

**Rota:** `/fontes`

> ⚠️ **Estas fontes NÃO alimentam a KB de suporte.** São usadas exclusivamente para análise de cobertura e planejamento de documentação.

Módulo para importar documentos externos (manuais, editais, especificações) e compará-los com a documentação já existente nos portais.

**Seletor de produto:** AxHub / AxTon / AxCross (filtra tudo por produto)

#### Aba "📋 Fontes Cadastradas"
Lista todas as fontes adicionadas para o produto selecionado, com:
- Título, tipo, data de adição, status (pendente / analisado)
- Botão **Analisar** — processa o conteúdo contra a documentação existente
- Botão **Remover**

#### Aba "🔎 Coletar do PNCP"
Busca e importa licitações públicas da **API do PNCP (Portal Nacional de Contratações Públicas)**:

- **Busca manual** — pesquisa por palavra-chave e exibe resultados
- **Coletar produto completo** — aciona todas as palavras-chave configuradas para o produto
- **Seleção e importação** — marque os editais de interesse e importe como fontes
- **Configuração de palavras-chave** — edite as palavras usadas para cada produto (ex: "radar", "pesagem veicular")
- **Status do agendador** — exibe se a coleta automática (a cada 6h) está ativa

> Para ativar a coleta automática PNCP, defina `PNCP_COLETA_ATIVA=true` no `.env`.

#### Aba "+ Adicionar Fonte"
Formulário para cadastrar uma fonte manualmente:
- Título, tipo, produto
- Conteúdo em texto livre (cole o texto do manual, edital, etc.)

#### Aba "📊 Análise de Cobertura"
Mostra visualmente quais seções do portal já têm documentação coberta e quais têm lacunas, baseado nas fontes analisadas.

#### Aba "💡 Sugestões de Melhoria"
Lista consolidada de tópicos identificados nas fontes que **não têm documentação correspondente** no portal, com:
- Título sugerido do documento
- Seção recomendada
- Motivo (baseado na fonte que originou a sugestão)

---

### 5.6 Roadmap

**Rota:** `/roadmap`

Gera um **backlog priorizado automaticamente** a partir das lacunas identificadas pelas fontes analisadas.

**Como gerar:**
1. Selecione o produto (AxHub / AxTon / AxCross)
2. Clique em **⚙️ Gerar Roadmap**
3. O motor consulta todas as fontes com status "analisado" do produto
4. Agrupa sugestões similares (algoritmo Jaccard ≥ 0.45)
5. Calcula prioridade, complexidade e impacto de cada item
6. Salva o roadmap no MongoDB e exibe na tela

**Colunas da tabela:**

| Coluna | Descrição |
|---|---|
| **Funcionalidade** | Nome do item + descrição breve |
| **Prioridade** | 🔴 Alta / 🟡 Média / 🟢 Baixa |
| **Complexidade** | Baixa / Média / Alta (estimativa automática por palavras-chave) |
| **Categoria** | Seção do portal onde o item se enquadra |
| **Status** | Pendente / Especificado / Aprovado / Descartado |
| **Ações** | Botão "📐 Spec" para gerar especificação técnica |

**Filtros:**
- Por produto
- Por status do item
- Seletor de versão do roadmap (histórico de geração)

**Atualizar status de um item:**
Use o seletor de status na linha do item. Itens marcados como "Descartado" ficam ocultos por padrão.

---

### 5.7 Especificações (PRD)

**Rota:** `/specs`

Exibe e gerencia as **especificações técnicas (PRD — Product Requirements Document)** geradas para os itens do roadmap.

#### Lista lateral
Mostra todas as specs com:
- Título da funcionalidade
- Produto (AxHub / AxTon / AxCross)
- Status: 🟡 Rascunho / 🔵 Em Revisão / ✅ Aprovado
- Data de criação

#### Painel de visualização
Ao clicar em uma spec, exibe todas as seções:

| Seção | Conteúdo |
|---|---|
| **🎯 Objetivo** | Descrição do propósito da funcionalidade |
| **👥 Usuários / Personas** | Perfis que usarão o recurso |
| **✅ Requisitos Funcionais** | Lista de o que o sistema deve fazer |
| **📋 Regras de Negócio** | Lógica e restrições |
| **🏗️ Arquitetura** | Camadas afetadas, módulos, integrações |
| **💻 Pseudocódigo** | Esboço de implementação |
| **🧪 Critérios de Aceite** | Cenários de validação (formato Gherkin resumido) |
| **⚠️ Riscos** | Pontos de atenção e impactos |

**Gerar uma spec:**
- Na tela Roadmap, clique em **📐 Spec** em qualquer item
- A IA (GPT-4o-mini) gera o PRD completo
- Se OpenAI indisponível, um template com marcações `✏️` é gerado para preenchimento manual

**Atualizar status:**
Use o seletor no canto superior direito da spec (Rascunho → Em Revisão → Aprovado).

---

### 5.8 Treinamento

**Rota:** `/treinamento`

Adiciona novas entradas à Knowledge Base do motor de IA.

**Campos:**

| Campo | Descrição |
|---|---|
| **Pergunta / Cenário** | Texto que o usuário pode digitar |
| **Resposta esperada** | Como a IA deve responder |
| **Módulo** | Categoria (Infrações, Pesagem, Veículos, Operações, etc.) |

**Ao submeter:**
1. A API gera o embedding (vetor numérico) da pergunta via OpenAI
2. Salva no MongoDB com o vetor
3. A partir deste momento, perguntas semanticamente similares serão respondidas com este conteúdo

**Módulos disponíveis:**
`geral`, `infracoes`, `equipamentos`, `operacoes`, `pesagem`, `balanca`, `controle_acesso`, `veiculos`, `administracao`, `relatorios`, `medicoes`, `cronotacografo`

> **Dica:** Para entradas sem OpenAI (sem chave), o embedding não é gerado — o item fica apenas como keyword na KB estática.

---

### 5.9 Logs de Interações

**Rota:** `/logs`

Tabela de histórico de todas as interações processadas pelo motor.

**Colunas:**
- **Data** — timestamp da interação
- **Mensagem** — texto enviado pelo usuário
- **Origem** — `kb` / `embedding` / `openai`
- **Score** — grau de confiança da resposta (% de similaridade)

**Filtros:**
- Todas as origens
- Apenas KB (keywords)
- Apenas Embeddings
- Apenas OpenAI

> **Monitoramento:** Perguntas com origem `openai` frequentes indicam lacunas na KB que devem ser preenchidas via Treinamento.

---

### 5.10 Knowledge Base

**Rota:** `/kb`

Listagem de todas as entradas cadastradas na KB (MongoDB), com:
- Pergunta
- Módulo
- Data de criação

> **Seed inicial:** Execute `npm run seed` na pasta `axion-ia-api` para carregar as perguntas e respostas base do arquivo `src/scripts/seed-kb.js`.

---

### 5.11 Configurações

**Rota:** `/config`

> Disponível também dentro do Dashboard na aba "⚙️ Configurações".

Permite alterar a **URL base da API** sem recompilar o painel. Útil para ambientes remotos ou de produção.

- Campo de URL + botão Salvar + botão Testar
- A URL é salva no `localStorage` do navegador

---

## 6. Motor de Inteligência — Como a IA Responde

O motor de IA opera em **3 camadas cascata** (fallback automático):

```
Mensagem do usuário
        │
        ▼
┌───────────────────────────────────┐
│ CAMADA 1: Keywords (kb.json)      │
│ Normaliza texto → busca keywords  │
│ em todas as entradas da KB estát. │
│ Retorna se score = 1 (match exato)│
└──────────────┬────────────────────┘
               │ sem match
               ▼
┌───────────────────────────────────┐
│ CAMADA 2: Embeddings (MongoDB)    │
│ Gera vetor da mensagem via OpenAI │
│ Calcula cosine similarity com     │
│ todos os vetores no MongoDB       │
│ Retorna se similarity ≥ 0.75      │
└──────────────┬────────────────────┘
               │ abaixo do threshold
               ▼
┌───────────────────────────────────┐
│ CAMADA 3: GPT-4o-mini (fallback)  │
│ System prompt especializado em    │
│ AxHub/AxTon/AxCross               │
│ Sempre retorna uma resposta       │
└───────────────────────────────────┘
```

**Threshold de confiança para o Helpdesk:**
- `≥ 0.85` → Auto-responde (ou vai para fila se `MODO_REVISAO=true`)
- `≥ 0.65` → Sugere para revisão humana
- `< 0.65` → Escala (sem resposta automática)

---

## 7. Widget de Suporte Embutido

O **widget** é um botão flutuante de suporte que pode ser inserido diretamente nos sistemas AxHub, AxTon e AxCross, sem dependências externas.

### 7.1 Como funciona

- Ao clicar no botão, abre um painel de chat lateral
- Processa as perguntas localmente usando o `knowledge-base.json`
- Funciona sem conexão com a API (standalone)
- Suporta filtro por módulo, sugestões automáticas e histórico de conversa

### 7.2 Inserir no AxHub (.NET)

Adicione **uma linha** antes do `</body>` no arquivo de layout principal:

**Via GitHub Pages (recomendado — sempre atualizado):**
```html
<script src="https://axion-tecnologia.github.io/AxHub.Docs/widget/axhub-suporte.js"></script>
```

**Via hospedagem local:**
```html
<script src="/widget/axhub-suporte.js"></script>
```

### 7.3 Para AxTon e AxCross

Mesma lógica, trocando o arquivo:
```html
<!-- AxTon -->
<script src="/widget/axton-suporte.js"></script>

<!-- AxCross -->
<script src="/widget/axcross-suporte.js"></script>
```

### 7.4 Estrutura do `knowledge-base.json`

O widget consome o arquivo `knowledge-base.json` na mesma pasta do script. Estrutura:

```json
{
  "entradas": [
    {
      "id": "equipamentos-1",
      "modulo": "equipamentos",
      "pergunta": "Como cadastrar um novo equipamento?",
      "palavrasChave": ["cadastrar", "equipamento", "novo"],
      "resposta": "Para cadastrar um equipamento...",
      "tags": ["cadastro", "setup"]
    }
  ]
}
```

### 7.5 Atualizar a Knowledge Base do Widget

Após adicionar entradas via Treinamento no painel, o `knowledge-base.json` deve ser atualizado. O processo pode ser automatizado via script ou feito manualmente copiando as entradas da KB do MongoDB para o JSON.

---

## 8. Portais de Documentação Docusaurus

Cada produto tem um portal Docusaurus independente com documentação completa para usuários finais.

| Portal | URL Local | Produto |
|---|---|---|
| AxHub Docs | http://localhost:3010 | Fiscalização de trânsito |
| AxTon Docs | http://localhost:3011 | Pesagem veicular |
| AxCross Docs | http://localhost:3012 | Monitoramento de cruzamentos |

### Estrutura de seções (AxHub como exemplo)

```
docs/
├── primeiros-passos/    Instalação, login, configuração inicial
├── operacoes/           Operações do dia a dia
├── infracoes/           Gerenciamento de infrações e autuações
├── pesagem/             Controle de peso veicular
├── veiculos/            Cadastro e consulta de veículos
├── relatorios/          Exportações e relatórios
├── medicoes/            Aferição de equipamentos
├── controle-acesso/     Usuários, perfis e permissões
├── cronotacografo/      Jornada e cronotacógrafo
├── balanca/             Módulo balança
├── administracao/       Configurações do sistema
└── referencia-tecnica/  APIs e integrações
```

### Adicionar Documentação

**Via painel (automático):**
1. Use a tela **📄 Gerar Doc** do painel
2. Escolha produto, tema e seção
3. Gere e salve — o arquivo `.md` é gravado automaticamente

**Manual:**
1. Crie um arquivo `.md` na pasta de seção correta
2. Adicione o frontmatter:
```markdown
---
sidebar_position: 5
title: "Título da Página"
---

# Título da Página

Conteúdo aqui.
```
3. Reinicie o portal Docusaurus

---

## 9. API REST — Referência de Endpoints

Base URL: `http://localhost:3100/api`

### Motor de IA

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/chat` | Processa mensagem e retorna resposta da IA |
| `POST` | `/treinar` | Adiciona entrada à KB com embedding |
| `GET` | `/kb` | Lista entradas da Knowledge Base |
| `GET` | `/analise` | Métricas de uso e resolução |
| `GET` | `/logs` | Histórico de interações (MongoDB) |
| `GET` | `/logs/historico` | Histórico de interações (arquivo) |
| `GET` | `/logs/pendentes` | Perguntas não respondidas |
| `GET` | `/logs/estatisticas` | Estatísticas agregadas |

### Helpdesk Jitbit

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/helpdesk/tickets` | Lista tickets (`?mode=0/1/2/3&count=50`) |
| `GET` | `/helpdesk/ticket/:id` | Detalhe de um ticket |
| `POST` | `/helpdesk/classificar/:id` | Classifica ticket com IA |
| `POST` | `/helpdesk/responder/:id` | Responde ticket via IA |
| `POST` | `/helpdesk/processar` | Processa fila de pendentes |
| `GET` | `/helpdesk/categorias` | Lista categorias do Jitbit |
| `POST` | `/helpdesk/criar` | Cria novo ticket |
| `GET` | `/helpdesk/polling` | Status do polling automático |
| `POST` | `/helpdesk/polling/iniciar` | Ativa polling |
| `POST` | `/helpdesk/polling/pausar` | Pausa polling |
| `POST` | `/helpdesk/polling/retomar` | Retoma polling |
| `POST` | `/helpdesk/polling/limpar` | Zera stats do polling |
| `GET` | `/helpdesk/fila` | Itens aguardando revisão humana |
| `POST` | `/helpdesk/fila/modo` | Alterna modo revisão |
| `POST` | `/helpdesk/fila/:id/aprovar` | Aprova resposta da fila |
| `POST` | `/helpdesk/fila/:id/rejeitar` | Rejeita resposta da fila |

### Dados Live (SQL Server)

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/axhub/status` | Status conexão AxHub |
| `GET` | `/axhub/resumo` | Totais gerais AxHub |
| `GET` | `/axhub/equipamentos` | Lista equipamentos |
| `GET` | `/axhub/operacoes` | Lista operações |
| `GET` | `/axhub/infracoes` | Stats de infrações |
| `GET` | `/axhub/heartbeat` | Heartbeat equipamentos |
| `GET` | `/axhub/passagens` | Últimas passagens |
| `GET` | `/axhub/tabelas` | Lista tabelas do banco |
| `GET` | `/axton/status` | Status conexão AxTon |
| `GET` | `/axton/resumo` | Totais gerais AxTon |
| `GET` | `/axton/pesagens` | Últimas pesagens |
| `GET` | `/axton/infracoes` | Stats infrações AxTon |
| `GET` | `/axton/tabelas` | Tabelas AxTon |
| `GET` | `/axcross/status` | Status conexão AxCross |
| `GET` | `/axcross/resumo` | Totais gerais AxCross |
| `GET` | `/axcross/equipamentos` | Equipamentos AxCross |
| `GET` | `/axcross/passagens` | Stats passagens |
| `GET` | `/axcross/tabelas` | Tabelas AxCross |

### Geração de Documentação

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/doc/gerar` | Gera documento Markdown com IA |
| `POST` | `/doc/salvar` | Salva documento no portal Docusaurus |
| `GET` | `/doc/imagens/:produto` | Lista imagens disponíveis |
| `GET` | `/doc/secoes/:produto` | Lista seções do portal |

### Fontes de Pesquisa

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/fontes` | Adicionar fonte |
| `GET` | `/fontes` | Listar fontes (`?produto=axhub`) |
| `GET` | `/fontes/:id` | Detalhe de fontes |
| `POST` | `/fontes/:id/analisar` | Analisar fonte vs documentação |
| `DELETE` | `/fontes/:id` | Remover fonte |
| `GET` | `/fontes/mapa/:produto` | Mapa de cobertura do produto |
| `GET` | `/fontes/sugestoes/:produto` | Sugestões consolidadas |

### Coletor PNCP

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/coletor/pncp` | Busca manual no PNCP |
| `POST` | `/coletor/pncp/importar` | Importa editais selecionados |
| `POST` | `/coletor/pncp/coletar` | Coleta completa de um produto |
| `GET` | `/coletor/config` | Configuração de palavras-chave |
| `POST` | `/coletor/config` | Salvar palavras-chave |
| `GET` | `/coletor/status` | Status do agendador PNCP |

### Roadmap

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/roadmap/gerar` | Gera roadmap de um produto |
| `GET` | `/roadmap` | Lista roadmaps (`?produto=axhub`) |
| `GET` | `/roadmap/:id` | Detalhe completo |
| `PATCH` | `/roadmap/:id/item/:itemId` | Atualiza status de item |

### Especificações (PRD)

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/spec/gerar` | Gera spec para um item do roadmap |
| `GET` | `/spec` | Lista specs (`?produto=axhub`) |
| `GET` | `/spec/:id` | Spec completa |
| `PATCH` | `/spec/:id/status` | Atualiza status da spec |

### Configuração do Sistema

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/config` | Lê o `.env` atual (valores sensíveis mascarados) |
| `POST` | `/config` | Salva alterações no `.env` |
| `POST` | `/config/testar-mongo` | Testa conexão com MongoDB |

---

## 10. Variáveis de Ambiente (.env)

Arquivo localizado em: `axion-ia-api/.env`

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta da API (use 3100) |
| `CORS_ORIGIN` | `*` | Origem permitida no CORS |
| `MONGO_URI` | `mongodb://localhost:27017/axion-ia` | String de conexão MongoDB |
| `OPENAI_API_KEY` | — | Chave da API OpenAI (sk-...) |
| `JITBIT_URL` | — | URL base do Jitbit |
| `JITBIT_TOKEN` | — | Token Bearer do Jitbit |
| `JITBIT_USER` | — | Usuário Jitbit (Basic Auth) |
| `JITBIT_PASS` | — | Senha Jitbit (Basic Auth) |
| `POLLING_INTERVAL` | `2` | Intervalo de polling em minutos |
| `MODO_REVISAO` | `true` | true = fila humana / false = envio automático |
| `AXHUB_DB_HOST` | — | Servidor SQL Server AxHub |
| `AXHUB_DB_PORT` | `1433` | Porta SQL Server AxHub |
| `AXHUB_DB_NAME` | — | Nome do banco AxHub |
| `AXHUB_DB_USER` | — | Usuário SQL AxHub |
| `AXHUB_DB_PASS` | — | Senha SQL AxHub |
| `AXHUB_DB_ENCRYPT` | `false` | TLS/SSL na conexão |
| `AXTON_DB_*` | — | Mesmo padrão para AxTon |
| `AXCROSS_DB_*` | — | Mesmo padrão para AxCross |
| `PNCP_COLETA_ATIVA` | `false` | Ativa coleta automática PNCP a cada 6h |

---

## 11. Fluxo de Trabalho Completo

### Fluxo 1: Atendimento Automático de Helpdesk

```
1. Configurar JITBIT_TOKEN no .env
2. Iniciar API: npm start (axion-ia-api)
3. Abrir painel: http://localhost:3001/helpdesk
4. Ir em "Polling Automático"
5. Clicar "Iniciar" (intervalo padrão: 2 min)
6. Novos tickets não respondidos são processados automaticamente
7. Com MODO_REVISAO=true: respostas vão para "Fila de Revisão"
8. Revisar, editar e aprovar cada resposta
9. Após 30 dias: avaliar se pode mudar para MODO_REVISAO=false
```

### Fluxo 2: Gerar Documentação com IA

```
1. Acessar: http://localhost:3001/gerar-doc
2. Selecionar produto (ex: AxHub)
3. Preencher tema (ex: "Relatório de Infrações")
4. Selecionar seção (ex: "relatorios")
5. Selecionar tipo (ex: "Manual do Usuário")
6. Clicar "Gerar"
7. Revisar no editor (corrigir marcações ✏️ se offline)
8. Clicar "Salvar no Portal"
9. Reiniciar o portal Docusaurus da porta correspondente
```

### Fluxo 3: Análise de Lacunas → Roadmap → Spec

```
1. FONTES DE PESQUISA (/fontes)
   a. Coletar editais do PNCP (aba "🔎 Coletar do PNCP")
      OU adicionar manualmente um manual (aba "+ Adicionar Fonte")
   b. Clicar "Analisar" em cada fonte adicionada
   c. Visualizar lacunas na aba "💡 Sugestões de Melhoria"

2. ROADMAP (/roadmap)
   a. Selecionar produto
   b. Clicar "⚙️ Gerar Roadmap"
   c. Revisar os itens gerados
   d. Marcar como "Aprovado" os que serão desenvolvidos
   e. Marcar como "Descartado" os irrelevantes

3. SPECS (/specs)
   a. No Roadmap, clicar "📐 Spec" em um item aprovado
   b. A IA gera o PRD completo automaticamente
   c. Revisar cada seção (especialmente se gerado por template)
   d. Atualizar status para "Em Revisão" → "Aprovado"

4. GERAR DOC (/gerar-doc)
   a. Usar a spec aprovada como base de contexto
   b. Gerar o documento de usuário final
   c. Salvar no portal Docusaurus
```

### Fluxo 4: Treinar a IA com Novas Respostas

```
1. Identificar perguntas não respondidas: /logs (filtrar por "openai")
2. Para cada pergunta frequente:
   a. Ir em /treinamento
   b. Preencher a pergunta e a resposta ideal
   c. Selecionar o módulo correto
   d. Clicar "Treinar"
3. Verificar em /kb se a entrada foi criada
4. Testar no /chat: faça a mesma pergunta
5. Confirmar que a origem na resposta é "embedding" ou "kb" (não "openai")
```

---

## 12. Solução de Problemas

### API não inicia

```
Erro: Cannot find module './services/...'
→ Execute: npm install na pasta axion-ia-api

Erro: EADDRINUSE (porta 3100 em uso)
→ Execute: netstat -ano | findstr :3100
→ Identifique o PID e encerre: taskkill /PID <pid> /F

Erro: Cannot connect to MongoDB
→ Verifique se o MongoDB está rodando
→ Teste: mongosh mongodb://localhost:27017
```

### Painel React não abre

```
Erro ao rodar npm run dev
→ Execute: npm install na pasta axion-ia-panel
→ Verifique se a porta 3001 está livre

Tela mostra "API indisponível"
→ Verifique se a API está na porta 3100
→ No painel, confirme a URL em Dashboard → Configurações
```

### Helpdesk não conecta ao Jitbit

```
Erro 401 Unauthorized
→ Verifique JITBIT_TOKEN no .env
→ O token deve ser gerado no Jitbit em Perfil → API Token

Tickets não aparecem
→ Confira que o usuário tem permissão de API no Jitbit
→ Tente curl.exe "http://localhost:3100/api/helpdesk/tickets"
```

### IA respondendo sempre via OpenAI (nunca via KB/embedding)

```
→ Execute npm run seed para carregar a KB inicial
→ Verifique em /kb se há entradas
→ Se não há entradas com embeddings: OPENAI_API_KEY precisa estar configurado
  para que embeddings sejam gerados durante o Treinamento
→ Adicione entradas via /treinamento com a chave configurada
```

### Portais Docusaurus não iniciam

```
Erro: command not found: docusaurus
→ Execute npm install dentro da pasta do portal

Erro de build
→ Execute: npx docusaurus build --no-minify
  para ver o erro detalhado
```

### Coleta PNCP não funciona

```
Erro de timeout na API PNCP
→ A API pública do PNCP pode ter instabilidade — tente novamente
→ URL padrão: https://pncp.gov.br/api/consulta/v1

Coleta automática não executa
→ Certifique-se que PNCP_COLETA_ATIVA=true no .env
→ Reinicie a API após alterar o .env
→ Verifique: curl.exe "http://localhost:3100/api/coletor/status"
```

---

*Manual gerado em 03/04/2026 — Axion Tecnologia*  
*Para atualizar este manual, edite o arquivo `MANUAL-AXIONIA.md` na raiz do projeto.*
