# ═══════════════════════════════════════════════════════════════════════════════
# PROMPT DE ANÁLISE E EXTRAÇÃO DE DADOS — ECOSSISTEMA HELPDESK UNIFICADO
# ═══════════════════════════════════════════════════════════════════════════════
# 
# USO: Este prompt deve ser utilizado em plataformas de IA (ChatGPT, Claude, etc.)
# para analisar dados extraídos e gerar inteligência operacional.
#
# CONTEXTO: Axion Tecnologia opera 3 sistemas (AxHub, AxTon, AxCross) atendendo
# órgãos públicos de trânsito/metrologia em todo Brasil. O helpdesk precisa
# centralizar TODOS os canais em um único ecossistema inteligente.
# ═══════════════════════════════════════════════════════════════════════════════

---

## PROMPT 1 — ANÁLISE DE QUALIDADE DO ATENDIMENTO ATUAL

```
Você é um analista sênior de Customer Success e Help Desk Operations. 
Analise os dados extraídos do nosso sistema de atendimento (Jitbit Helpdesk) e forneça:

CONTEXTO DA EMPRESA:
- Axion Tecnologia — desenvolve sistemas de fiscalização de trânsito e metrologia
- 3 produtos: AxHub (gestão de equipamentos), AxTon (pesagem veicular), AxCross (cruzamentos)
- Atende órgãos públicos: DETRANs, IPEMs, prefeituras em ~20 estados
- Canais atuais: Email e Portal Web (Jitbit)

DADOS DISPONÍVEIS:
[INSERIR JSON DOS TICKETS EXTRAÍDOS]

ANÁLISE SOLICITADA:

1. **VOLUME & DISTRIBUIÇÃO**
   - Total de tickets por período (dia/semana/mês)
   - Distribuição por sistema (AxHub/AxTon/AxCross)
   - Distribuição por site/cliente
   - Horários de pico
   - Tendências (crescendo/estável/reduzindo)

2. **PERFORMANCE DE SLA**
   - Tempo médio de primeira resposta (FRT)
   - Tempo médio de resolução (ART)
   - % tickets resolvidos em <4h, <24h, <72h
   - Tickets em breach (sem resposta adequada)
   - Performance por técnico

3. **QUALIDADE DO ATENDIMENTO**
   - % tickets resolvidos no primeiro contato (FCR)
   - Taxa de reabertura
   - Categorias mais frequentes
   - Complexidade média (por nº de interações)
   - Padrões de problemas recorrentes

4. **OPORTUNIDADES DE AUTOMAÇÃO**
   - Top 10 tipos de ticket que podem ser automatizados
   - % estimado de deflection possível com KB
   - Respostas repetitivas que podem virar macros/templates
   - Tickets que poderiam ser resolvidos por chatbot

5. **BENCHMARKING**
   Compare nossos números com benchmarks de mercado:
   - Zendesk Benchmark Report
   - Freshdesk State of Customer Support
   - HDI (Help Desk Institute) standards
   - ITIL best practices

6. **RECOMENDAÇÕES PRIORIZADAS**
   Lista de ações com impacto estimado e esforço:
   - Quick wins (implementar em < 1 semana)
   - Melhorias de médio prazo (1-4 semanas)
   - Transformações estratégicas (1-3 meses)

FORMATO: Relatório executivo com gráficos ASCII, tabelas e conclusões acionáveis.
```

---

## PROMPT 2 — MAPEAMENTO DE PROCESSOS E REGRAS DE NEGÓCIO

```
Você é um Business Process Analyst especializado em ITIL e Service Management.
A partir dos dados do nosso helpdesk, mapeie todos os processos operacionais:

DADOS DISPONÍVEIS:
- Tickets com histórico completo (assunto, corpo, comentários, status, datas)
- Categorias/departamentos configurados
- Técnicos e suas atribuições
- Regras de automação existentes

DELIVERABLES:

1. **MAPA DE PROCESSOS (AS-IS)**
   Para cada tipo de atendimento identificado, documente:
   - Trigger (o que inicia o processo)
   - Steps (passos do atendimento)
   - Decision points (onde há decisões)
   - Actors (quem participa)
   - SLA implícito (tempo observado)
   - Output (resultado final)

2. **REGRAS DE NEGÓCIO IMPLÍCITAS**
   Identifique regras que estão sendo aplicadas mas não documentadas:
   - Critérios de priorização
   - Lógica de atribuição
   - Condições de escalonamento
   - Padrões de resolução por tipo

3. **GAPS E INEFICIÊNCIAS**
   - Processos sem dono definido
   - Handoffs desnecessários
   - Bottlenecks identificados
   - Informações faltantes no ticket
   - Retrabalho evitável

4. **MAPA DE PROCESSOS (TO-BE)**
   Proponha o fluxo ideal com:
   - Automação onde possível
   - IA onde agrega valor
   - Self-service onde o cliente pode resolver sozinho
   - Escalação clara e medida
   - Feedback loops

FORMATO: Fluxogramas em Mermaid.js + tabelas de decisão + narrativa explicativa.
```

---

## PROMPT 3 — ANÁLISE DA ESTRUTURA DE INTELIGÊNCIA

```
Você é um AI/ML Engineer especializado em NLP e sistemas conversacionais.
Analise nosso motor de IA existente e proponha expansões:

SISTEMA ATUAL (axion-ia-api):
- Classificador por keywords (classifier.js)
- Busca semântica por embeddings OpenAI (engine.js)
- Knowledge Base em JSON + MongoDB (kb.json + embedding model)
- System prompts customizados por contexto (prompt.js)
- Integração com 3 SQL Servers (dados operacionais reais)

DADOS DISPONÍVEIS:
[INSERIR: kb.json, exemplos de perguntas/respostas, logs de chat]

ANÁLISE SOLICITADA:

1. **AVALIAÇÃO DO MOTOR ATUAL**
   - Precisão da classificação (estimada por padrões de fallback)
   - Cobertura da KB (% de perguntas respondidas diretamente)
   - Qualidade das respostas (consistência, completude)
   - Gaps de conhecimento identificados

2. **PROPOSTA DE EXPANSÃO**
   a) **Chatbot Autônomo Tier-1**
      - Arquitetura: Intent detection + Entity extraction + Response generation
      - Fluxos conversacionais para top 20 perguntas
      - Fallback com escalação elegante para humano
      - Aprendizado contínuo (feedback loop)
   
   b) **Análise de Sentimento**
      - Real-time sentiment scoring (positivo/neutro/negativo)
      - Trigger de escalonamento quando negativo
      - Dashboard de humor do cliente
   
   c) **Roteamento Inteligente**
      - Modelo: ticket features → best agent
      - Features: assunto, sistema, complexidade, idioma, histórico
      - Output: agente com melhor fit + confidence score
   
   d) **Auto-geração de KB**
      - Input: ticket resolvido com CSAT > 4
      - Pipeline: summarize → structure → review → publish
      - Aumenta deflection progressivamente

3. **MÉTRICAS DE IA**
   - Accuracy target: > 85% classificação correta
   - Deflection target: > 30% tickets Tier-1 resolvidos por chatbot
   - CSAT impact: manter > 4.0 com chatbot
   - Response time: < 3 segundos para sugestão

FORMATO: Documento técnico com diagramas de arquitetura e exemplos concretos.
```

---

## PROMPT 4 — EXTRAÇÃO DE DADOS PARA MIGRAÇÃO

```
Você é um Data Engineer. Crie scripts de extração para migrar dados entre sistemas.

ORIGEM: Jitbit Helpdesk (REST API)
DESTINO: MongoDB (novo sistema unificado)

SCRIPT DE EXTRAÇÃO (Node.js):

// Extrair TODOS os dados relevantes
const ENDPOINTS = {
  tickets:    '/api/Tickets?mode=1&count=1000',
  categories: '/api/Categories',
  users:      '/api/Users',
  kb:         '/api/KBArticles',
  customFields: '/api/CustomFields'
};

// Para cada ticket, extrair também:
// - Comentários: /api/Comments?id={ticketId}
// - Anexos: /api/Attachments?id={ticketId}

TRANSFORMAÇÃO NECESSÁRIA:
1. Ticket Jitbit → Ticket MongoDB (nosso schema)
2. User Jitbit → Customer MongoDB (com enrichment)
3. Technician Jitbit → Agent MongoDB
4. Category Jitbit → Category MongoDB
5. Comment Jitbit → Message MongoDB
6. KBArticle Jitbit → KnowledgeArticle MongoDB

REGRAS DE MAPEAMENTO:
- Status: New(1)→new, InProgress(2)→open, OnHold(3)→pending, Closed(5)→closed
- Priority: Low(0)→low, Normal(1)→normal, High(2)→high, Critical(3)→critical
- Preservar IDs antigos em campo 'legacyId' para referência cruzada
- Gerar novo ticketNumber sequencial: "AX-2026-XXXX"

VALIDAÇÃO:
- Total de tickets extraídos == total no Jitbit
- Todos os comentários preservados
- Anexos com URLs válidas
- Nenhuma perda de dados

FORMATO: Script Node.js completo com error handling e logging.
```

---

## PROMPT 5 — GERAÇÃO DE ESPECIFICAÇÃO TÉCNICA DO NOVO SISTEMA

```
Você é um Software Architect. Gere a especificação técnica completa do novo sistema 
de helpdesk unificado baseado na análise prévia.

REQUISITOS:
- Substituir Jitbit + Milvus + Zendesk por plataforma única
- Stack: Node.js + React + MongoDB + Redis + Socket.IO
- Multi-canal: WhatsApp, Email, WebChat, Telegram, Instagram, Facebook, SMS
- IA: Classificação, roteamento, chatbot, sentimento, sugestões
- Integração nativa: AxHub SQL Server, AxTon SQL Server, AxCross SQL Server
- Multi-tenant: separação por site/órgão
- Self-hosted: zero custo de SaaS

DELIVERABLES:
1. Diagrama de arquitetura (C4 model - Context, Container, Component)
2. API Specification (OpenAPI 3.0)
3. Database Schema (MongoDB collections)
4. Event-driven architecture (events + handlers)
5. Deployment diagram (Docker Compose)
6. Security model (auth, authorization, data privacy)
7. Scalability plan (horizontal scaling strategy)
8. Integration contracts (channel adapters interface)
9. Testing strategy (unit, integration, e2e)
10. MVP definition (minimum viable features for Phase 1)

FORMATO: Documento técnico com Mermaid diagrams, code snippets e decision records.
```

---

## PROMPT 6 — ANÁLISE DE VIABILIDADE E ROI

```
Você é um Product Manager e Business Analyst. 
Analise a viabilidade de construir o sistema vs. manter ferramentas existentes.

CENÁRIO A — MANTER STATUS QUO:
- Jitbit: ~R$ 300/mês (self-hosted, custo de servidor)
- Milvus: ~R$ 800/mês (SaaS por agentes)
- Zendesk: ~R$ 1.500/mês (Suite Team)
- Total: ~R$ 2.600/mês = R$ 31.200/ano
- Limitações: sistemas desconectados, sem IA especializada, sem integração nativa

CENÁRIO B — SISTEMA PRÓPRIO:
- Custo de desenvolvimento: X horas de dev
- Infraestrutura: MongoDB Atlas free tier + VPS R$ 100/mês
- APIs externas: OpenAI ~R$ 50/mês, WhatsApp Cloud API (free for now)
- Total operacional: ~R$ 150/mês = R$ 1.800/ano

CALCULE:
1. Break-even point (meses para o investimento se pagar)
2. TCO (Total Cost of Ownership) em 3 anos para cada cenário
3. Valor intangível (integração nativa, IA especializada, dados próprios)
4. Riscos de cada cenário
5. Recomendação final com justificativa

FORMATO: Executive summary + tabelas comparativas + gráfico de payback.
```

---

## USO DOS PROMPTS

### Ordem de Execução:
1. **Prompt 4** → Extrair dados do Jitbit (script técnico)
2. **Prompt 1** → Analisar qualidade do atendimento (com dados extraídos)
3. **Prompt 2** → Mapear processos e regras de negócio
4. **Prompt 3** → Analisar e expandir IA
5. **Prompt 5** → Gerar especificação técnica
6. **Prompt 6** → Validar viabilidade e ROI

### Alimentação de Dados:
- Executar script de extração via `axion-ia-api` (endpoint já existe)
- Exportar JSON dos tickets: `GET /api/helpdesk/tickets?mode=all&count=1000`
- Exportar KB: `GET /api/kb`
- Exportar logs de chat: `GET /api/logs/historico`
