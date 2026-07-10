# ESPINHA DORSAL — ECOSSISTEMA AXION TECNOLOGIA
## Conceito, Arquitetura e Ciclos de Todos os Sistemas

> **Data**: 2026-07-03  
> **Versão**: 1.0 — Mapeamento Conceitual Completo  
> **Escopo**: AxHub + AxTon + AxCross + AxionIA Platform v4.0

---

## 1. CONCEITO CENTRAL (O "POR QUÊ")

### Missão
> *"Transformar dados de fiscalização pública em inteligência operacional, reduzindo o custo de atendimento, acelerando conformidade contratual e garantindo qualidade dos sistemas em campo — com IA como camada transversal."*

### Posicionamento
A Axion Tecnologia é uma **suíte integrada de fiscalização eletrônica inteligente** para órgãos públicos brasileiros. É a **única plataforma** que une:

| Pilar | O que faz | Mercado servido |
|---|---|---|
| **AxHub** | Fiscalização eletrônica de trânsito (radar, OCR, faixa) | IPEM, SMTT, DETRAN |
| **AxTon** | Pesagem veicular metrológica (balança) | IPEM, órgãos metrológicos |
| **AxCross** | Cruzamento de placas e monitoramento veicular | DETRAN, SEFAZ, segurança pública |
| **AxionIA** | Inteligência artificial transversal (atendimento, qualidade, conformidade) | Operações internas Axion |

**Diferencial absoluto**: Nenhum concorrente (Perkons, Gatsometer, Velsis) oferece IA generativa integrada a sistemas de fiscalização. A Axion criou isso internamente.

---

## 2. ESPINHA DORSAL — FLUXO MESTRE

```
┌─────────────────────────────────────────────────────────────────┐
│                    FONTES DE DADOS                               │
│  AxHub SQL   │   AxTon SQL   │   AxCross SQL   │   Jitbit API   │
│  (oper./equip) │  (pesagens)  │ (passagens/equip)│  (chamados)   │
└──────┬──────────────┬──────────────┬──────────────┬─────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AXION IA PLATFORM (v4.0)                      │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  INTELLIGENCE│  │   QUALIDADE  │  │   ATENDIMENTO       │   │
│  │  ENGINE     │  │   ENGINE     │  │   ENGINE            │   │
│  │             │  │              │  │                     │   │
│  │ GPT-4o      │  │ Central      │  │ Chat IA             │   │
│  │ Embeddings  │  │ Sites v3.0   │  │ WhatsApp Bot        │   │
│  │ KB + Vetores│  │ 18 módulos   │  │ Helpdesk Automação  │   │
│  │ Classificador│  │ HealthCheck  │  │ Fila de Revisão     │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  INTELIGÊNCIA│  │  VALIDAÇÃO   │  │   DOCUMENTAÇÃO      │   │
│  │  DE MERCADO │  │  ENGINE      │  │   ENGINE            │   │
│  │             │  │              │  │                     │   │
│  │ Pipeline    │  │ CUTI         │  │ Gerador de Docs     │   │
│  │ Editais PNCP│  │ VARCO        │  │ Fontes + Análise    │   │
│  │ Conformidade│  │ Visual Valid │  │ 3x Docusaurus       │   │
│  │ Roadmap+Spec│  │ Duplicidade  │  │ KB + Re-indexação   │   │
│  └─────────────┘  └──────────────┘  └─────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼
         ┌─────────────────────────────────────────┐
         │          LOOP DE MELHORIA               │
         │  Logs → Revisão → Treino → KB → Deploy  │
         └─────────────────────────────────────────┘
```

---

## 3. OS TRÊS PRODUTOS PRINCIPAIS (SaaS)

### 3.1 AxHub — Fiscalização Eletrônica de Trânsito
**Conceito**: Sistema central de operação de equipamentos de fiscalização em campo (radares, câmeras OCR, faixas exclusivas).

| Atributo | Valor |
|---|---|
| Stack | .NET + SQL Server |
| Clientes ativos | 18 sites (IBAMETRO, IMEPI, IMEQPB, IMETROPA, IPEMCE, IPEMPE, DERSE, STRANS, DETRANMA, DETRANPI, GOIANIA, IPEMMT, ITPS, SMTT, ECONOMIA, IMPERATRIZ, SETRANS + HOMOLOGAÇÃO) |
| Versão mais avançada | v1.2.4 (DERSE — 104 menus) |
| Versão mais comum | v1.2.3 (90 menus) |
| Módulos principais | Triagem, OCR, Equipamentos, Operações, Infrações, Passagens, Aferição |
| Integração AxionIA | SQL Server via mssql → `/axhub/*` (10 endpoints) |

**O que o AxHub produz:**
- Registros de infrações por radar/câmera
- Triagens de imagens (aprovado/rejeitado por OCR)
- Heartbeat de equipamentos em campo
- Relatórios de passagens e monitoramentos
- Histórico de aferições metrológicas

---

### 3.2 AxTon — Pesagem Veicular Metrológica
**Conceito**: Sistema de controle de pesagem de veículos para cumprimento de normas metrológicas (INMETRO).

| Atributo | Valor |
|---|---|
| Stack | .NET + MongoDB (pesagens) + SQL Server (admin) |
| Clientes ativos | Integrados via AxionIA para todos os IPEMs |
| Módulos principais | Pesagens, Infrações de peso, Laudos, Reclassificações, Aferições |
| Integração AxionIA | SQL Server via mssql → `/axton/*` (6 endpoints) |

**O que o AxTon produz:**
- Registros de pesagens com laudo (conforme/não conforme)
- Infrações por excesso de peso (DNIT, CONTRAN)
- Estatísticas de tráfego pesado por rodovia

---

### 3.3 AxCross — Cruzamento de Placas e Monitoramento Veicular
**Conceito**: Sistema de rastreamento e cruzamento de dados veiculares em tempo real.

| Atributo | Valor |
|---|---|
| Stack | .NET + SQL Server |
| Clientes ativos | 12 sites (DERSE, DETRANPI, DETRANMA, IMPERATRIZ, IPEMCE, IPEMMT, IPEMPE, SEFAZPI, GOIANIA, ECONOMIA, SETRANS, HOMOLOGAÇÃO) |
| Versão atual | v1.2.0 (todos os sites, lançado 22/05/2026) |
| Módulos principais | Veículos Monitorados, Alertas, Passagens, Equipamentos, Relatórios |
| Integração AxionIA | SQL Server via mssql → `/axcross/*` (8 endpoints) |

**O que o AxCross produz:**
- Passagens de veículos monitorados (alertas de cruzamento)
- Rastreamento de placas com vigência de alerta
- Relatórios de circulação por rodovia

---

## 4. A CAMADA IA — AXION IA PLATFORM v4.0

### Conceito
A plataforma AxionIA é o **sistema nervoso central** que conecta os 3 produtos, automatiza atendimento, monitora qualidade e gera inteligência estratégica.

**Localização**: `axion-ia-panel/` (monorepo)
- `axion-ia-panel/` → Frontend React/Vite (porta 3017)
- `axion-ia-panel/api/` → Backend Express (porta 3100)
- `axion-ia-panel/engine/` → Motor IA (classificador + embeddings + KB)

### Os 6 Engines (Motores)

#### Engine 1 — INTELLIGENCE ENGINE (Núcleo IA)
**Propósito**: Responder perguntas, classificar tickets, gerar análises com GPT-4o.

```
Pergunta → Classificador (keywords) →
  → Se encontrado: resposta instantânea da KB
  → Se não: busca por embedding (cosine similarity)
  → Se não: GPT-4o com prompt especializado + contexto KB
  → Log da interação → Fila de revisão (se confiança < threshold)
```

- **KB**: 1000+ pares pergunta/resposta vetorizados
- **Modelos**: GPT-4o (principal), GPT-4o-mini (batch), text-embedding-ada-002
- **Contexto**: 70+ telas AxHub, 24 AxCross, 40+ AxTon documentados no prompt

---

#### Engine 2 — ATENDIMENTO ENGINE (Customer Service)
**Propósito**: Atender clientes automaticamente via Helpdesk e WhatsApp.

```
Jitbit Ticket → IA Classificação → KB Match → 
  → Confiança Alta: Resposta automática no ticket
  → Confiança Baixa: Fila de revisão humana
  → Aprovação: Envio + log de melhoria

WhatsApp → LGPD Accept → Menu → Sistema → Descrição → 
  → Foto? → Criação automática de ticket Jitbit
  → Consulta de ticket existente
```

- **Polling**: Verificação automática de tickets a cada 2-10s
- **Modos**: Automático / Revisão Humana
- **Métricas**: SLA Met vs Breached, horas/técnico, chamados/site

---

#### Engine 3 — QUALIDADE ENGINE (Central de Sites v3.0)
**Propósito**: Monitorar, auditar e comparar todos os 30 sites clientes.

```
sitesData.js (estático) + SQL Server (dinâmico) + Jitbit (chamados) →
  18 módulos em 5 grupos:
  
  VISÃO: Dashboard KPIs (16 cards), Visão Geral, Lista, Guia, Credenciais
  ANÁLISE: Performance, OCR, Equipamentos, APIs
  QUALIDADE: Health Check, Indicadores, Conformidade, Auditoria, Segurança
  COMPARAÇÃO: Comparar Sites, Comparador Global (14 dimensões)
  IA: IA Insights (5 tipos análise GPT-4o), Timeline (changelog)
```

- **Health Score**: Online 25pts + Versão 15pts + OCR 20pts + Equip 15pts + URL 10pts + Chamados 15pts
- **Sites monitorados**: 18 AxHub + 12 AxCross = 30 sites

---

#### Engine 4 — MERCADO ENGINE (Market Intelligence)
**Propósito**: Encontrar, analisar e responder a editais de licitação automaticamente.

```
PNCP API → Buscar editais → Importar PDF/DOC →
  Análise Heurística (keywords) + GPT-4o (semântica) →
  Score por requisito → Conformidade % → Veredicto (APTO/PARCIAL/INAPTO) →
  Lacunas identificadas → Roadmap gerado → Spec técnica →
  Aprovação → Deploy feature
```

- **Pipeline Completo**: Busca → Análise → Conformidade → Roadmap → Spec → Aprovação
- **Análise Multi-Produto**: AxHub vs AxTon vs AxCross simultâneo
- **Coleta automática**: Scheduler de coleta de editais PNCP

---

#### Engine 5 — VALIDAÇÃO ENGINE (Quality Assurance)
**Propósito**: Validar software, equipamentos e dados automaticamente.

```
Testes CUTI → Scripts de validação por site →
  VARCO: Câmeras Pumatronix → Heartbeat + Análise de incidente
  Visual Validation: Screenshots comparados por similaridade pixel
  Duplicidade: Auditoria de documentos duplicados
  Diagnóstico de medição: Detecção de anomalias em aferições
```

- **VARCO**: Integração com câmeras ITScam Pumatronix (validação de dispositivos)
- **OCR Pipeline**: Upload → OCR → Score de confiança → Aprovação/Rejeição
- **Jobs em batch**: Até 500 imagens/job com comparação por similaridade

---

#### Engine 6 — DOCUMENTAÇÃO ENGINE (Knowledge Management)
**Propósito**: Gerar, publicar e manter documentação técnica de forma semi-automática.

```
Fontes (PDFs, specs, editais, manuais) → Análise de cobertura →
  GPT-4o → Geração de seção de doc → Revisão →
  Publicação no portal Docusaurus correto (AxHub/AxTon/AxCross) →
  KB Re-indexação → Embeddings atualizados
```

- **3 portais**: AxHub (190+ docs), AxTon, AxCross — Docusaurus 3.x
- **Cobertura**: Rastreamento por produto/tópico/lacuna

---

## 5. OS 9 CICLOS DE PROCESSO

```
CICLO 1 — ATENDIMENTO AO CLIENTE
  Canais: Jitbit Helpdesk + WhatsApp
  Fluxo: Entrada → Classificação IA → Resposta → Revisão → Resolução
  KPIs: SLA, Confiança média, Chamados/dia

CICLO 2 — GESTÃO DE SITES (Central de Sites v3.0)
  Canais: SQL Server + Jitbit + sitesData.js
  Fluxo: Coleta → Health Check → Alertas → Diagnóstico → Correção
  KPIs: Score saúde, Sites online/offline, OCR médio

CICLO 3 — INTELLIGENCE DE MERCADO
  Canais: PNCP API + OpenAI
  Fluxo: Busca → Análise → Conformidade → Roadmap → Spec → Deploy
  KPIs: Editais analisados, % conformidade, Features geradas

CICLO 4 — VALIDAÇÃO E QUALIDADE
  Canais: APIs dos sites + OCR + Puppeteer
  Fluxo: Script → Execução → Score → Alertas → Correção
  KPIs: Testes passando, Anomalias detectadas

CICLO 5 — TREINAMENTO DA IA
  Canais: MongoDB + OpenAI Embeddings
  Fluxo: Nova FAQ → Embedding → KB → Deploy → Teste de resposta
  KPIs: Acertos KB, Score de confiança médio, Entradas KB

CICLO 6 — GESTÃO OPERACIONAL
  Canais: Jitbit + SQL Server AxHub
  Fluxo: Coleta dados → Relatório → SLA → Planilha horas
  KPIs: Horas técnico, SLA % met, Chamados resolvidos

CICLO 7 — ANÁLISE DE IMAGENS (OCR/IA)
  Canais: OpenAI Vision + SQL Server + ITScam Pumatronix
  Fluxo: Imagem → OCR → Score → Validação → Log
  KPIs: Triagem % aprovação, Tempo de OCR, Precisão placa

CICLO 8 — DOCUMENTAÇÃO AUTOMÁTICA
  Canais: OpenAI + Docusaurus + MongoDB
  Fluxo: Fonte → Análise → Geração → Review → Publicação
  KPIs: Docs publicados, Cobertura %, Lacunas fechadas

CICLO 9 — MONITORAMENTO WHATSAPP
  Canais: WhatsApp Web + Jitbit + MongoDB
  Fluxo: Mensagem → LGPD → Menu → Ticket → Resposta
  KPIs: Sessões ativas, Tickets criados, LGPD aceitos
```

---

## 6. ARQUITETURA TÉCNICA CONSOLIDADA

### Stack Completa

| Camada | Tecnologia | Versão | Uso |
|---|---|---|---|
| **Frontend** | React + Vite | 18 + 6.x | 132 páginas, 59 rotas |
| **Roteamento** | React Router | v6 | URL sync + searchParams |
| **UI Icons** | Lucide React | latest | Outline, 1.5px stroke |
| **HTTP Client** | Axios | latest | Chamadas à API |
| **Charts** | Recharts | latest | KPIs e gráficos |
| **Forms** | React Hook Form | latest | Formulários |
| **Toasts** | Sonner | latest | Notificações |
| **Backend** | Node.js + Express | 18/20 LTS | 287 endpoints |
| **IA Engine** | OpenAI API | GPT-4o | Chat, análise, imagens |
| **Embeddings** | OpenAI Embeddings | ada-002 | KB vetorial |
| **DB Principal** | MongoDB + Mongoose | 7.x | Logs, KB, modelos |
| **DB AxHub** | SQL Server + mssql | 2019 | Fiscalização eletrônica |
| **DB AxTon** | SQL Server + mssql | 2019 | Pesagem veicular |
| **DB AxCross** | SQL Server + mssql | 2019 | Cruzamento placas |
| **Docs** | Docusaurus | 3.x | 3 portais (190 docs) |
| **WhatsApp** | whatsapp-web.js | latest | Bot atendimento |
| **Estilo CSS** | CSS Variables | — | Windows 11 Fluent Dark |

### Design System (Tokens CSS)
```css
--bg: #202020          /* Fundo principal */
--surface: #2d2d2d     /* Superfície de cards */
--accent: #60cdff      /* Azul acento Fluent */
--border: #3d3d3d      /* Bordas */
--text: #f3f3f3        /* Texto primário */
--text-muted: #8b8b8b  /* Texto secundário */
```

---

## 7. NÚMEROS DO SISTEMA (2026-07-03)

| Métrica | Valor |
|---|---|
| Total de páginas React | **132** |
| Rotas registradas | **59** |
| Endpoints da API | **287** |
| Modelos MongoDB | **19** |
| Docs publicados | **190** |
| Sites monitorados | **30** (18 AxHub + 12 AxCross) |
| Ciclos de processo | **9** |
| Integrações externas | **9** |
| Linhas de código (painel) | **~55.900** |
| Versão da plataforma | **v4.0** |
| Módulos Central de Sites | **18** |

---

## 8. MAPA DE INTEGRAÇÕES

```
AxionIA Platform v4.0
│
├── INBOUND (dados chegam)
│   ├── SQL Server AxHub ────────► Equipamentos, Operações, Passagens, OCR
│   ├── SQL Server AxTon ────────► Pesagens, Infrações, Heartbeat
│   ├── SQL Server AxCross ──────► Passagens, Veículos, Alertas, Locais
│   ├── Jitbit Helpdesk API ─────► Tickets, Categorias, Técnicos, SLA
│   ├── PNCP API ────────────────► Editais de Licitação
│   └── ITScam Pumatronix ───────► Câmeras VARCO (heartbeat, incidentes)
│
├── OUTBOUND (ação acontece)
│   ├── Jitbit Helpdesk API ─────► Responder tickets, criar chamados
│   ├── OpenAI API ──────────────► GPT-4o chat, embeddings, visão
│   └── WhatsApp Web ────────────► Enviar mensagens, criar tickets
│
└── BIDIRECTIONAL
    └── MongoDB ─────────────────► Logs, KB, Roadmap, Spec, Jobs, WA Sessions
```

---

## 9. GAPS ESTRATÉGICOS IDENTIFICADOS

### Não existe ainda (oportunidades)
| Gap | Impacto | Esforço |
|---|---|---|
| CRM (modelo Cliente/Contato/Empresa) | ALTO | Médio |
| Portal do Cliente (autoatendimento) | ALTO | Alto |
| Billing / Controle de contratos SaaS | ALTO | Alto |
| Notificações proativas (email/push) | MÉDIO | Baixo |
| App Mobile para fiscais em campo | ALTO | Alto |
| Dashboard por contrato/cliente | MÉDIO | Médio |
| Integração Multi360 CRM | MÉDIO | Médio |
| Exportação de dados (CSV/Excel unificado) | BAIXO | Baixo |

### Débitos técnicos existentes
| Débito | Severidade |
|---|---|
| Duplicação de páginas (Dashboard/Hub) | ALTA |
| Falta de componentização (apenas 2 components compartilhados em jun/2026) | ALTA |
| Controllers axhub/axton/axcross com código 90% idêntico | MÉDIA |
| sitesData.js ainda estático (deveria ser DB) | MÉDIA |

---

## 10. LINHA DO TEMPO DOS SISTEMAS

```
2023-2024
  │
  ├── AxHub v1.0 → Fiscalização eletrônica lançada
  ├── AxTon v1.0 → Pesagem veicular lançada  
  └── AxCross v1.0 → Cruzamento de placas lançado

Jan-Mar 2026
  ├── AxionIA v1.0 → Engine de chat + KB + Jitbit
  ├── AxCross v1.0.0 (31/03/2026)
  └── WhatsApp Bot v1.0

Abr-Mai 2026
  ├── AxCross v1.1.0 (29/04/2026)
  ├── AxCross v1.2.0 (22/05/2026) — versão atual todos os sites
  ├── AxionIA v2.0 → PNCP Editais + Conformidade
  ├── Pipeline de Editais completo
  └── Análise Multi-Produto (AxHub vs AxTon vs AxCross)

Jun 2026
  ├── AxHub v1.2.4 → DERSE (104 menus, mais avançado)
  ├── AxionIA v3.0 → VARCO + Validação Visual + Roadmap + Spec
  ├── Central de Qualidade v1.0
  └── Central de Sites v2.0

Jul 2026
  ├── AxionIA v4.0 → 22 Engines ativos
  ├── Central de Sites v3.0 → 18 módulos unificados
  └── Gerar-Analise-JSON.mjs → Inventário completo do sistema
```

---

## 11. VISÃO FUTURA (Próximos Passos)

### Curto Prazo (1-3 meses)
1. **CRM básico** — Modelos Cliente/Contato/Empresa no MongoDB
2. **Notificações** — Email automático para alertas críticos de sites
3. **Consolidar Dashboards** — Unificar Intelligence Hub + Operations Hub + Dashboard
4. **sitesData.js → DB** — Migrar configuração estática de sites para MongoDB

### Médio Prazo (3-6 meses)
1. **Portal do Cliente** — Área de autoatendimento para órgãos públicos
2. **App Mobile** — React Native para fiscais em campo
3. **Multi360 CRM** — Integração com CRM existente
4. **Billing** — Controle de contratos e vigências

### Longo Prazo (6-12 meses)
1. **AxHub v2.0** — Full rewrite com nova arquitetura
2. **IA Preditiva** — Previsão de falhas de equipamento por ML
3. **Marketplace de Módulos** — Órgãos compram engines individualmente
4. **Expansão** — Outros países América Latina (Chile, Colômbia, México)

---

## 12. PRINCÍPIOS ARQUITETURAIS

1. **IA como Serviço Transversal** — Todo sistema tem acesso ao GPT-4o via `/agent/run`
2. **Dados em Loop Fechado** — Cada ação gera log → log alimenta KB → KB melhora IA
3. **Dark Mode Windows 11** — UI consistente com design Fluent em todo o painel
4. **SQL Server para Produtos, MongoDB para IA** — Separação clara de responsabilidades
5. **URL como estado** — Navegação via `?tab=` para deep-linking e compartilhamento
6. **Portais de Documentação separados por produto** — AxHub/AxTon/AxCross cada um no seu Docusaurus

---

*Documento gerado automaticamente com base na análise estrutural do workspace Axion.Docs em 2026-07-03.*
*Arquivo de dados: ANALISE-SISTEMA-COMPLETA-2026-07-03T11-35-18.json*
