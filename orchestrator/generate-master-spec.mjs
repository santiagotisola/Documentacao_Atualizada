#!/usr/bin/env node
/**
 * AKP Master Spec Generator
 * Gera todos os 80 arquivos da especificação master da AXIONIA KNOWLEDGE PLATFORM
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "docs", "master");
fs.mkdirSync(OUT, { recursive: true });

const SPECS = {

"00-README.md": `# AXIONIA KNOWLEDGE PLATFORM — Master Specification Index
**Version:** 1.0 Enterprise | **Status:** Active | **Date:** 2026-07-29

## O que é esta documentação
Este diretório contém a especificação completa da AKP em 80 documentos.

## Índice por Domínio

### Fundação (00-07)
| # | Arquivo | Conteúdo |
|---|---------|---------|
| 00 | README | Este índice |
| 01 | VISAO-GERAL | Visão executiva e missão |
| 02 | CONSTITUICAO | Lei fundamental da plataforma |
| 03 | PRINCIPIOS | Os 10 princípios inegociáveis |
| 04 | FILOSOFIA | Por que a AKP existe |
| 05 | GOVERNANCA | Ciclo de vida e controle |
| 06 | ARQUITETURA | Visão geral dos 80+ componentes |
| 07 | DOMINIOS | Os 10 domínios de atuação |

### Infra Cognitiva (08-13)
| # | Arquivo | Conteúdo |
|---|---------|---------|
| 08 | KNOWLEDGE-GRAPH | O grafo central de conhecimento |
| 09 | DIGITAL-TWIN | O twin cognitivo de cada sistema |
| 10 | CONTEXT-PROTOCOL | Protocolo de contexto entre agentes |
| 11 | ORCHESTRATOR | O orquestrador central |
| 12 | EVENT-BUS | Barramento de eventos assíncronos |
| 13 | WORKFLOW | Motor de workflows |

### Engines de Conteúdo (14-25)
| # | Arquivo | Conteúdo |
|---|---------|---------|
| 14 | SOURCE-ENGINE | Coleta de todas as fontes |
| 15 | DOCUMENTATION-ENGINE | Geração de documentação |
| 16 | STORYBOARD-ENGINE | Planejamento de vídeos |
| 17 | VIDEO-ENGINE | Produção de vídeos |
| 18 | NARRATION-ENGINE | Narração corporativa |
| 19 | TIMELINE-ENGINE | Linha do tempo de conteúdo |
| 20 | RENDER-ENGINE | Renderização final |
| 21 | PUBLISHING-ENGINE | Publicação automática |
| 22 | TRAINING-ENGINE | Trilhas de treinamento |
| 23 | QUIZ-ENGINE | Quizzes e certificação |
| 24 | MICROLEARNING | Cápsulas 15s a 30min |
| 25 | KNOWLEDGE-FEED | Feed de conhecimento |

### Engines de Análise (26-34)
| # | Arquivo | Conteúdo |
|---|---------|---------|
| 26 | PLAYWRIGHT | Automação e captura |
| 27 | OCR | Reconhecimento óptico |
| 28 | SCREEN-ANALYZER | Análise de interfaces |
| 29 | API-ENGINE | Análise de APIs |
| 30 | DATABASE-ENGINE | Análise de bancos de dados |
| 31 | CODE-ANALYZER | Análise de código-fonte |
| 32 | RELATIONSHIP-ENGINE | Mapeamento de relacionamentos |
| 33 | LEARNING-ENGINE | Aprendizado contínuo |
| 34 | ANALYTICS | Métricas e inteligência |

### Linguagens e Protocolos (35-39)
| # | Arquivo | Conteúdo |
|---|---------|---------|
| 35 | PROMPT-COMPILER | Compilador de prompts |
| 36 | APSL | AKP Prompt Specification Language |
| 37 | AVSL | AKP Video Specification Language |
| 38 | ADSL | AKP Document Specification Language |
| 39 | ACP | AKP Communication Protocol |

### Agentes (40-46)
| # | Arquivo | Conteúdo |
|---|---------|---------|
| 40 | CORE-AGENTS | Orchestrator + Project Manager |
| 41 | KNOWLEDGE-AGENTS | Extractor + Relationship |
| 42 | DOCUMENT-AGENTS | Documentation Agent |
| 43 | VIDEO-AGENTS | Storyboard + Capture + Narrator + Renderer |
| 44 | LEARNING-AGENTS | Microlearning + Quiz |
| 45 | PUBLISHING-AGENTS | Publisher |
| 46 | VALIDATION-AGENTS | Validator |

### Segurança e Qualidade (47-50)
| # | Arquivo | Conteúdo |
|---|---------|---------|
| 47 | SECURITY | Padrões de segurança |
| 48 | LGPD | Conformidade LGPD |
| 49 | PERFORMANCE | Otimização e performance |
| 50 | CACHE | Estratégia de cache |

### Infraestrutura (51-64)
Redis, RabbitMQ, Docker, Kubernetes, Monorepo, VSCode, CLI, API, Web, React, .NET, PostgreSQL, Neo4j, MinIO

### Padrões (65-68)
Testes, Templates, Style Guide, Boas Práticas

### Evolução (69-80)
Roadmap, Versionamento, Plugins, Marketplace, Extensions, Portal Cliente, Admin, Enterprise, Deploy, Observability, Future, Conclusão
`,

"01-VISAO-GERAL.md": `# 01 — VISÃO GERAL
## AXIONIA KNOWLEDGE PLATFORM — Visão Executiva

## O que é a AKP

A **AXIONIA KNOWLEDGE PLATFORM (AKP)** é a camada de inteligência transversal da Axion Tecnologia.

Ela transforma qualquer fonte de informação em **ativos digitais inteligentes**: documentação, vídeos, treinamentos, FAQs, quizzes, microlearning e bases de conhecimento — **gerados e mantidos automaticamente**.

## Para quem

| Perfil | O que a AKP oferece |
|--------|---------------------|
| **Operador** | Manuais claros, vídeos passo a passo, cápsulas de 30 segundos |
| **Analista** | Knowledge Base rica, FAQ inteligente, busca semântica |
| **Desenvolvedor** | Documentação técnica gerada do código, catálogo de APIs |
| **Gestor** | Analytics de conhecimento, relatórios de gaps, roadmap |
| **Treinador** | Trilhas automáticas, quizzes, certificações |

## Os produtos Axion que a AKP serve

\`\`\`
AxHub   → Fiscalização Eletrônica de Trânsito
AxTon   → Pesagem Veicular Metrológica
AxCross → Monitoramento e Cruzamento de Placas
\`\`\`

## Como funciona em 30 segundos

1. A AKP **analisa** o sistema (código, banco, telas, APIs, documentos)
2. **Constrói** o Digital Twin Cognitivo do sistema
3. **Gera automaticamente** toda a documentação, vídeos e treinamentos
4. **Mantém** tudo sincronizado quando o sistema evolui

## O que torna a AKP única

- Não é um chatbot — é uma **Plataforma de Engenharia de Conhecimento**
- Não gera texto isolado — gera **Knowledge Objects relacionados**
- Não é estática — se **atualiza automaticamente** quando o código muda
- Não é uma IA — é um **ecossistema de 12+ agentes especializados**
- Não copia — **compreende** e **estrutura** o conhecimento
`,

"04-FILOSOFIA.md": `# 04 — FILOSOFIA
## AXIONIA KNOWLEDGE PLATFORM — Por que a AKP existe

## O Problema

Toda empresa de software enfrenta o mesmo paradoxo:

> *O sistema evolui continuamente. A documentação fica para trás.*

Resultado:
- Operadores sem treinamento adequado cometem erros evitáveis
- Suporte perde horas respondendo as mesmas dúvidas
- Novos colaboradores demoram meses para ser produtivos
- Gestores tomam decisões sem visibilidade real do sistema

## A Visão

A AKP parte de uma crença fundamental:

> *"Todo sistema de software já contém todo o conhecimento necessário para documentar-se. Falta apenas uma plataforma capaz de extrair, estruturar e comunicar esse conhecimento automaticamente."*

## Os 5 Pilares Filosóficos

### 1. Conhecimento como Produto
O conhecimento não é um subproduto — é um produto de primeira classe.
Todo ativo digital (documentação, vídeo, quiz) tem owner, versão, qualidade.

### 2. Relacionamento como Fundação
Informação isolada não tem valor. Valor está nos relacionamentos.
Uma tela não existe sozinha — ela depende de APIs, que dependem de tabelas, que impactam relatórios.

### 3. Automatização sem Perda de Qualidade
Automação não significa mediocridade.
A AKP gera conteúdo corporativo, estruturado e auditável — não texto genérico.

### 4. Continuidade como Requisito
O conhecimento que não se atualiza torna-se obstáculo.
A AKP é projetada para sincronização contínua, não para geração única.

### 5. Acessibilidade Universal
O mesmo conhecimento deve ser acessível para o leigo em 30 segundos
e para o especialista em toda a sua profundidade técnica.
`,

"05-GOVERNANCA.md": `# 05 — GOVERNANÇA
## AXIONIA KNOWLEDGE PLATFORM — Ciclo de Vida e Controle

## Status dos Objetos de Conhecimento

\`\`\`
rascunho → em_revisao → publicado → arquivado → obsoleto
\`\`\`

| Status | Descrição | Quem pode mudar |
|--------|-----------|----------------|
| **rascunho** | Gerado, aguardando revisão | Validator Agent |
| **em_revisao** | Em processo de aprovação | Revisor humano |
| **publicado** | Aprovado e disponível | Publisher Agent |
| **arquivado** | Substituído por versão mais nova | Project Manager |
| **obsoleto** | Não deve mais ser usado | Validator Agent |

## Versionamento

Todos os objetos seguem **Semantic Versioning**:
- **MAJOR** (1.0.0 → 2.0.0): Mudança estrutural no conteúdo
- **MINOR** (1.0.0 → 1.1.0): Adição de seções ou relacionamentos
- **PATCH** (1.0.0 → 1.0.1): Correção de erros ou atualização menor

## Rastreabilidade

Todo objeto registra:
\`\`\`json
{
  "historico": [
    {
      "versao": "1.0.0",
      "data": "2026-07-29T10:00:00Z",
      "autor": "AKP-DOC",
      "alteracao": "Criação inicial via Template A",
      "tokens_utilizados": 1842,
      "modelo": "gpt-4o"
    }
  ]
}
\`\`\`

## Regras de Governança

1. Nenhum objeto vai a \`publicado\` sem passar pelo Validator Agent
2. Todo objeto tem exatamente um \`owner\` responsável
3. Objetos \`obsoletos\` nunca são deletados — apenas marcados
4. Alterações em objetos \`publicados\` criam nova versão, preservando a anterior
5. O Knowledge Graph mantém todas as versões de relacionamentos
`,

"06-ARQUITETURA.md": `# 06 — ARQUITETURA
## AXIONIA KNOWLEDGE PLATFORM — Visão Completa de 80+ Componentes

## Camadas da Arquitetura

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                    │
│  PresentationCenter (React) · CLI (axionia.js) · API REST   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE ORQUESTRAÇÃO                    │
│              AI Orchestrator · Event Bus · Workflow          │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE AGENTES                         │
│  Knowledge · Engineering · Documentation · Video · Learning  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE DADOS                           │
│  Knowledge Graph (Neo4j) · MongoDB · PostgreSQL · MinIO      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE INFRAESTRUTURA                  │
│         Docker · Kubernetes · Redis · RabbitMQ               │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Stack Tecnológica

| Camada | Tecnologia | Uso |
|--------|-----------|-----|
| Frontend | React 18 + Vite | PresentationCenter |
| Backend API | Node.js + Express | axion-ia-api |
| IA | GPT-4o + Embeddings | Todos os agentes |
| Grafo | Neo4j | Knowledge Graph |
| Documentos | MongoDB | Knowledge Objects |
| Relacional | PostgreSQL | Dados estruturados |
| Cache | Redis | Sessões e cache de prompts |
| Filas | RabbitMQ | Event Bus assíncrono |
| Arquivos | MinIO | Screenshots, vídeos, PDFs |
| Vídeo | FFmpeg | Renderização |
| Automação | Playwright | Capture Agent |
| Container | Docker + K8s | Deploy e escala |
| CLI | Node.js ESM | axionia.js |
`,

"07-DOMINIOS.md": `# 07 — DOMÍNIOS
## AXIONIA KNOWLEDGE PLATFORM — Os 10 Domínios de Atuação

## Domínio 1 — KNOWLEDGE ENGINEERING
> Extrair, estruturar e relacionar todo o conhecimento do sistema.

Agentes: Knowledge Extractor, Relationship Mapper
Outputs: Knowledge Objects, Knowledge Graph, Glossário

## Domínio 2 — DOCUMENTATION
> Produzir toda documentação corporativa em múltiplos formatos.

Agentes: Documentation Agent
Outputs: Manual Técnico, Manual Operacional, Manual Usuário, FAQ, Release Notes

## Domínio 3 — VIDEO PRODUCTION
> Criar vídeos de treinamento de alta qualidade.

Agentes: Storyboard, Capture, Narrator, Renderer
Pipeline: Capítulos → Cenas → Narrativa → Captura → Renderização

## Domínio 4 — MICROLEARNING
> Fragmentar conhecimento em cápsulas de 15s a 30min.

Agentes: Microlearning Agent
Outputs: 9 níveis de aprendizagem por módulo

## Domínio 5 — TRAINING & CERTIFICATION
> Criar trilhas de treinamento com quizzes e certificações.

Agentes: Training Agent, Quiz Agent
Outputs: Trilhas por perfil, Quizzes, Certificados

## Domínio 6 — ANALYTICS
> Medir efetividade do conhecimento e identificar gaps.

Agentes: Analytics Agent
Outputs: Dashboards, Relatórios de gaps, Knowledge Score

## Domínio 7 — DIGITAL TWIN
> Manter uma réplica cognitiva de cada sistema.

Outputs: Digital Twin por produto, sincronização automática

## Domínio 8 — PUBLISHING
> Publicar e distribuir conteúdo automaticamente.

Agentes: Publisher Agent
Outputs: Docusaurus, Portal, KB MongoDB, Git

## Domínio 9 — VALIDATION
> Garantir qualidade de todo conteúdo produzido.

Agentes: Validator Agent
Outputs: Score de qualidade, Feedback de correção

## Domínio 10 — GOVERNANCE
> Controlar ciclo de vida, versionamento e auditoria.

Agentes: Project Manager
Outputs: Versões, Histórico, Status, Rastreabilidade
`,

"08-KNOWLEDGE-GRAPH.md": `# 08 — KNOWLEDGE GRAPH
## AXIONIA KNOWLEDGE PLATFORM — O Grafo Central de Conhecimento

## O que é

O **Knowledge Graph** é o coração da AKP. É um banco de dados em grafo (Neo4j) que armazena todos os Knowledge Objects e seus relacionamentos.

## Por que Neo4j

\`\`\`
SQL pergunta: "Quais tabelas existem?"
Graph pergunta: "Qual o impacto de alterar esta tabela em todo o sistema?"
\`\`\`

O grafo responde instantaneamente a perguntas de relacionamento profundo que levariam joins complexos em SQL.

## Estrutura de Nós

Cada Knowledge Object é um nó com propriedades:
\`\`\`cypher
(o:KnowledgeObject {
  akp_id: "AKP-AH-TRL-001",
  nome: "Triagem de Infrações",
  tipo: "Tela",
  sistema: "AxHub",
  versao: "1.2.3",
  status: "publicado",
  confiabilidade: 95
})
\`\`\`

## Os 22 Tipos de Relacionamento

\`\`\`cypher
(tela)-[:USES]->(api)
(api)-[:READS]->(tabela)
(tabela)-[:GENERATES]->(relatorio)
(relatorio)-[:DOCUMENTED_BY]->(manual)
(manual)-[:VIDEO_OF]->(video)
(video)-[:FAQ_OF]->(faq)
(faq)-[:QUIZ_OF]->(quiz)
\`\`\`

Tipos completos:
DEPENDS_ON · USES · CALLS · READS · WRITES · GENERATES ·
DOCUMENTED_BY · VIDEO_OF · FAQ_OF · QUIZ_OF · CONFIGURES ·
IMPORTS · EXPORTS · REQUIRES · BELONGS_TO · NEXT · PREVIOUS ·
CAUSES · FIXES · VALIDATES · CAPTURED_BY · EXPLAINED_BY

## Consultas Típicas

\`\`\`cypher
-- Tudo que a tela de Triagem impacta
MATCH (t:KnowledgeObject {nome: "Triagem"})-[*1..3]->(n)
RETURN n

-- Quais documentos precisam ser atualizados se a API mudar?
MATCH (api:KnowledgeObject {tipo: "API"})-[:DOCUMENTED_BY|VIDEO_OF|FAQ_OF]->(doc)
WHERE api.akp_id = "AKP-AH-API-005"
RETURN doc
\`\`\`
`,

"09-DIGITAL-TWIN.md": `# 09 — DIGITAL TWIN COGNITIVO
## AXIONIA KNOWLEDGE PLATFORM — O Twin de Cada Sistema

## Conceito

O **Digital Twin Cognitivo** é uma réplica estruturada e inteligente de um sistema de software.

Diferente de um digital twin tradicional (que replica comportamento físico), o **Twin Cognitivo** replica o *conhecimento* sobre o sistema:

| Digital Twin Tradicional | Digital Twin Cognitivo AKP |
|--------------------------|---------------------------|
| Replica sensores físicos | Replica conhecimento do sistema |
| Usado para IoT/manufatura | Usado para software corporativo |
| Dados em tempo real | Conhecimento estruturado versionado |
| Monitora falhas físicas | Monitora gaps de conhecimento |

## O que o Twin conhece

Para cada sistema (AxHub, AxTon, AxCross):

\`\`\`
Arquitetura  → Componentes, dependências, stack
Banco        → Schemas, tabelas, relacionamentos, procedures
APIs         → Endpoints, DTOs, autenticação, rate limits
Regras       → Regras de negócio, validações, exceções
Menus        → Navegação completa, permissões por tela
Campos       → Tipo, validação, obrigatoriedade, origem
Usuários     → Perfis, permissões, fluxos permitidos
Permissões   → Todas as 150+ permissões do AxHub mapeadas
Fluxos       → Fluxos funcionais, técnicos e de banco
Documentação → Manual técnico, operacional, usuário
Vídeos       → Roteiros, capturas, narração por módulo
FAQ          → Perguntas frequentes por módulo
Quizzes      → Questões por nível e perfil
Integrações  → Jitbit, PNCP, MongoDB, SQL Server, WhatsApp
Dependências → Árvore completa de dependências
Código       → Arquitetura React, Express, controllers
Eventos      → Heartbeat, alertas, notificações
Logs         → Padrões de log, diagnósticos
Versões      → Histórico completo de alterações
\`\`\`

## Sincronização Automática

Quando o código muda (commit detectado):
1. Update Detection analisa arquivos alterados
2. Mapeia impacto nos objetos do Knowledge Graph
3. Exibe modal de confirmação com itens afetados
4. Ao confirmar: regenera documentação, vídeos, KB em cascata
5. Novo commit automático com os artefatos atualizados
`,

"11-ORCHESTRATOR.md": `# 11 — AI ORCHESTRATOR
## AXIONIA KNOWLEDGE PLATFORM — O Orquestrador Central

## Responsabilidade

O AI Orchestrator é o **único ponto de comunicação** entre agentes.

Ele:
- Recebe solicitações externas
- Transforma em eventos tipados
- Roteia para o agente correto
- Aguarda resposta e valida
- Propaga resultados para dependentes

## Nunca faz

- Executar lógica de domínio
- Produzir conteúdo
- Acessar banco diretamente
- Modificar agentes

## Tipos de Evento

\`\`\`typescript
type AKPEvent = {
  id: string;            // UUID único do evento
  tipo: EventType;       // TASK_ASSIGNED | KNOWLEDGE_READY | ...
  agente_origem: string; // Quem emitiu
  agente_destino: string;// Quem deve receber
  payload: object;       // Dados do evento
  correlacao_id: string; // Para rastreamento de cadeia
  timestamp: string;     // ISO 8601
  prioridade: 1|2|3;     // 1=alta, 2=normal, 3=baixa
  retry_count: number;   // Tentativas até agora
  max_retries: number;   // Máximo de tentativas
}
\`\`\`

## Ciclo de Vida de uma Tarefa

\`\`\`
RECEIVED → QUEUED → ASSIGNED → PROCESSING → VALIDATING → COMPLETED
                                    ↓
                                  FAILED → RETRY (max 3x) → DEAD_LETTER
\`\`\`
`,

"12-EVENT-BUS.md": `# 12 — EVENT BUS
## AXIONIA KNOWLEDGE PLATFORM — Barramento de Eventos

## Tecnologia: RabbitMQ

Todos os agentes comunicam-se exclusivamente via **mensagens assíncronas** no Event Bus.

## Exchanges e Filas

\`\`\`
akp.knowledge.*    → Filas do Knowledge Engine
akp.video.*        → Filas do Video Engine
akp.docs.*         → Filas do Documentation Engine
akp.validation.*   → Fila do Validator Agent
akp.publish.*      → Fila do Publisher Agent
akp.dead-letter    → Mensagens que falharam após max retries
\`\`\`

## Padrão de Mensagem

\`\`\`json
{
  "event_id": "uuid",
  "event_type": "KNOWLEDGE_EXTRACTED",
  "source_agent": "AKP-KE",
  "target_agent": "AKP-RM",
  "payload": { "knowledge_object_id": "AKP-AH-001" },
  "timestamp": "2026-07-29T14:00:00Z",
  "correlation_id": "task-uuid",
  "priority": 2
}
\`\`\`
`,

"14-SOURCE-ENGINE.md": `# 14 — SOURCE ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Motor de Coleta de Fontes

## 19 Fontes Suportadas

| Categoria | Fontes |
|-----------|--------|
| Documentos | PDF, Word, PowerPoint, Excel, Markdown, HTML |
| Web | URL, GitHub |
| Código | React, Angular, Vue, .NET, Java, Node, Python, Go, Rust |
| Dados | SQL Server, PostgreSQL, Oracle, MongoDB |
| APIs | Swagger, OpenAPI, REST, GraphQL, WebSocket |
| Estruturados | JSON, XML, CSV |
| Mídia | Imagens (OCR), Vídeos, Áudios |
| Automação | Playwright (sistema em execução) |

## Fluxo de Coleta

\`\`\`
Fonte → Detector de Tipo → Extrator Específico → 
Normalizador → Knowledge Extractor Agent → Knowledge Graph
\`\`\`

## Prioridade de Fontes

1. **Sistema em execução** (Playwright) — mais preciso, zero defasagem
2. **Swagger/OpenAPI** — fonte autoritativa para APIs
3. **Código-fonte** — fonte autoritativa para lógica
4. **Banco de dados** — fonte autoritativa para dados
5. **Documentação existente** — complementar, pode estar desatualizada
`,

"15-DOCUMENTATION-ENGINE.md": `# 15 — DOCUMENTATION ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Motor de Documentação

## Template A — 16 Seções Obrigatórias

Todo documento produzido segue exatamente:

| # | Seção | Obrigatório |
|---|-------|:-----------:|
| 1 | Objetivo | ✅ |
| 2 | Escopo | ✅ |
| 3 | Pré-requisitos | ✅ |
| 4 | Configuração | — |
| 5 | Fluxo | ✅ |
| 6 | Execução | ✅ |
| 7 | Resultado Esperado | ✅ |
| 8 | Validações | ✅ |
| 9 | Erros Possíveis | ✅ |
| 10 | Troubleshooting | — |
| 11 | Boas Práticas | ✅ |
| 12 | FAQ (mín. 3) | ✅ |
| 13 | Relacionamentos | ✅ |
| 14 | Links | — |
| 15 | Vídeos | — |
| 16 | Próximos Passos | ✅ |

## Formatos de Saída

Markdown · PDF · Word (DOCX) · HTML · Docusaurus

## 3 Perspectivas por Módulo

| Perspectiva | Público | Linguagem |
|-------------|---------|-----------|
| Técnica | Desenvolvedores | Termos técnicos permitidos |
| Administrativa | Gestores/Supervisores | Foco em regras e conformidade |
| Usuário | Operadores/Leigos | Zero jargão, passo a passo visual |
`,

"16-STORYBOARD-ENGINE.md": `# 16 — STORYBOARD ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Motor de Planejamento de Vídeos

## Missão: Planejar. NUNCA renderizar.

## Pipeline da Cena (13 campos obrigatórios)

\`\`\`
Capítulo → Cena → Objetivo → Narrativa → Imagem →
Zoom → Cursor → Callout → Legenda → Transição →
Áudio → Tempo → Validação
\`\`\`

## Template B — 11 Seções do Roteiro

Introdução → Objetivo → Pré-requisitos → Fluxo →
Demonstração → Resumo → Boas Práticas → Conclusão →
Próximos Passos → Relacionamentos → Links Úteis

## Tipos de Callout

| Tipo | Quando usar |
|------|-------------|
| Info | Informação relevante mas não crítica |
| Atenção | Ponto importante que afeta o resultado |
| Cuidado | Ação que pode causar problemas |
| Dica | Atalho ou boa prática |
`,

"17-VIDEO-ENGINE.md": `# 17 — VIDEO ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Motor de Produção de Vídeo

## 4 Agentes em Pipeline

\`\`\`
Storyboard Agent → Narrator Agent → Capture Agent → Video Renderer
     (Planeja)        (Narra)           (Captura)       (Renderiza)
\`\`\`

## Especificações Técnicas

| Parâmetro | Valor |
|-----------|-------|
| Resolução | 1280×720 (HD) |
| Frame rate | 25fps |
| Codec vídeo | H.264 (libx264) |
| Codec áudio | AAC 96kbps |
| Container | MP4 |
| Legenda | SRT sincronizado |
| Voz TTS | Microsoft Maria PT-BR |

## Eventos Playwright Capturados (21 tipos)

Tela · Elemento · XPath · CSS · Tempo · Screenshot · Vídeo ·
Evento · Resposta · Erro · Loading · Toast · Modal · Tooltip ·
Breadcrumb · Menu · Grid · Filtro · Exportação · Download · Upload
`,

"18-NARRATION-ENGINE.md": `# 18 — NARRATION ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Motor de Narração Corporativa

## Regra #1: Narrativa Corporativa

| ❌ Proibido | ✅ Correto |
|-----------|-----------|
| clique aqui | O usuário deverá selecionar... |
| aperte | O usuário deverá pressionar... |
| vai aparecer | O sistema apresentará... |
| é simples | O procedimento consiste em... |

## Limites por Formato

| Formato | Palavras | Frases |
|---------|----------|--------|
| 15s | 12 | 1 |
| 30s | 25 | 2 |
| 45s | 35 | 3 |
| 60s | 50 | 4 |
| 90s | 75 | 6 |
| Cena vídeo | — | 2 |

## TTS: Microsoft Maria PT-BR

- Rate: -1 (levemente lento para treinamento)
- Formato saída: WAV 22050Hz mono
- Compilação final: AAC via FFmpeg
`,

"24-MICROLEARNING.md": `# 24 — MICROLEARNING ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Os 9 Níveis de Aprendizagem

## Níveis

| # | Duração | Tipo | Template |
|---|---------|------|----------|
| 1 | 15s | Cápsula Rápida | C |
| 2 | 30s | Dica | C |
| 3 | 45s | Conceito | C |
| 4 | 60s | Procedimento | C |
| 5 | 90s | Fluxo | C |
| 6 | 5min | Módulo Básico | B (abreviado) |
| 7 | 15min | Módulo Intermediário | B |
| 8 | 30min | Módulo Avançado | B |
| 9 | Completo | Curso | A + B |

## Template C — 10 Campos Obrigatórios

1. Título (max 60 chars)
2. Tempo (15, 20, 25, 30, 35 ou 40s)
3. Imagem Principal (descrição para captura)
4. Mensagem Curta (max 25 palavras)
5. Benefício (max 10 palavras, infinitivo)
6. Exemplo (situação real do sistema)
7. Convite para Saber Mais (max 80 chars)
8. Relacionamento com Manual
9. Relacionamento com Treinamento
10. Relacionamento com FAQ

## Tipos de Cápsula

💡 Você Sabia · 🔧 Dica Rápida · ⚠️ Erro Comum ·
✨ Novidade · 🚀 Nova Funcionalidade · ⌨️ Atalho ·
⭐ Boas Práticas · ⚙️ Configuração · 🔗 Integração
`,

"25-KNOWLEDGE-FEED.md": `# 25 — KNOWLEDGE FEED
## AXIONIA KNOWLEDGE PLATFORM — Feed Contínuo de Conhecimento

## O que é

O Knowledge Feed é o canal de distribuição das cápsulas de microlearning — um feed de cards que mantém os usuários atualizados sobre o sistema.

## Card do Feed

\`\`\`json
{
  "id": "AKP-FEED-001",
  "tipo": "Alerta Crítico | Novidade | Você Sabia | Dica | Meta Atingida",
  "icone": "🔴 | ✨ | 💡 | 🔧 | 🎯",
  "titulo": "string — max 80 chars",
  "conteudo": "string — max 80 palavras",
  "tags": ["array"],
  "prioridade": "alta | normal | baixa",
  "data": "relativa — Hoje, Ontem, Há X dias",
  "call_to_action": "Texto do botão →",
  "relacionamentos": {
    "manual_id": "string | null",
    "video_id": "string | null",
    "microlearning_id": "string | null"
  }
}
\`\`\`

## Prioridades

| Prioridade | Cor | Exemplos |
|-----------|-----|---------|
| Alta | 🔴 | Equipamento offline, erro crítico, prazo vencendo |
| Normal | 🔵 | Novidades, atualizações, novas funcionalidades |
| Baixa | ⚫ | Dicas, boas práticas, insights |
`,

"26-PLAYWRIGHT.md": `# 26 — PLAYWRIGHT ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Automação e Captura

## Missão

Navegar automaticamente em sistemas e capturar **evidências visuais precisas** para alimentar o pipeline de vídeo e o Screen Analyzer.

## Nunca faz

- Interpretar regras de negócio
- Modificar dados no sistema
- Tomar decisões de navegação não definidas no fluxo

## 21 Campos de Captura

Tela · Elemento · XPath · CSS · Tempo · Screenshot · Vídeo ·
Evento · Resposta · Erro · Loading · Toast · Modal · Tooltip ·
Breadcrumb · Menu Ativo · Grid com Dados · Filtro Aplicado ·
Exportação · Download · Upload

## Eventos Especiais

| Evento | Ação Obrigatória |
|--------|-----------------|
| Loading/Spinner | Screenshot antes + aguardar + screenshot depois |
| Toast | Capturar imediatamente (desaparece em 3-5s) |
| Modal | Capturar aberto + registrar título e botões |
| Erro | Screenshot + texto completo do erro |
| Breadcrumb | Registrar em toda navegação |
`,

"27-OCR.md": `# 27 — OCR ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Reconhecimento Óptico de Caracteres

## Fontes para OCR

- Screenshots capturados pelo Playwright
- PDFs escaneados
- Imagens de manuais físicos
- Fotos de telas de sistema

## Pipeline

\`\`\`
Imagem → Pré-processamento → OCR → Extração de Texto →
Knowledge Extractor → Normalização → Knowledge Graph
\`\`\`

## Uso na AKP

O OCR alimenta o Knowledge Extractor Agent com texto extraído de:
- Manuais em formato de imagem
- Capturas de sistemas legados
- Documentações físicas digitalizadas
`,

"28-SCREEN-ANALYZER.md": `# 28 — SCREEN ANALYZER
## AXIONIA KNOWLEDGE PLATFORM — Análise de Interfaces

## Missão

Compreender completamente uma interface e criar um modelo estruturado da tela com todos os elementos, permissões e fluxos.

## Detecta

Botões · Campos · Menus · Cards · Ícones · Widgets ·
Gráficos · Permissões necessárias · Alertas · Breadcrumb ·
Sidebar · Header · Footer · Modais · Tooltips ·
Grids/Tabelas · Filtros · Exportações · Uploads · Downloads

## Schema de Saída

\`\`\`json
{
  "tela": "string",
  "objetivo": "string",
  "usuarios": ["array de perfis"],
  "elementos": [{
    "tipo": "button | input | select | table | ...",
    "id_css": "string",
    "xpath": "string",
    "label": "string",
    "acao": "string",
    "permissao": "string | null"
  }],
  "apis_chamadas": ["array de endpoints"],
  "permissoes_necessarias": ["array"]
}
\`\`\`
`,

"29-API-ENGINE.md": `# 29 — API ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Análise de APIs

## Detecta

Swagger · OpenAPI · REST · GraphQL · WebSocket ·
Endpoints · Controllers · DTOs · Responses ·
HTTP Status · Segurança/Auth · Rate Limit · Documentação

## Saída

Para cada endpoint:
\`\`\`json
{
  "metodo": "GET | POST | PUT | DELETE | PATCH",
  "rota": "/api/endpoint",
  "descricao": "string",
  "parametros": [{ "nome": "string", "tipo": "string", "obrigatorio": true }],
  "dto_entrada": {},
  "dto_saida": {},
  "status_codes": [200, 400, 401, 500],
  "autenticacao": "JWT | API-Key | None",
  "rate_limit": "string | null"
}
\`\`\`
`,

"30-DATABASE-ENGINE.md": `# 30 — DATABASE ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Análise de Banco de Dados

## Missão: Mapear. NUNCA alterar.

## Detecta

Schemas · Tabelas · Views · Procedures · Functions ·
Triggers · Relacionamentos (FK) · Índices ·
Foreign Keys · Primary Keys · Histórico de alterações

## Bancos Suportados

SQL Server · PostgreSQL · Oracle · MongoDB · MySQL

## Saída

Para cada tabela:
\`\`\`json
{
  "schema": "string",
  "tabela": "string",
  "descricao": "string",
  "colunas": [{ "nome": "string", "tipo": "string", "pk": false, "fk": null, "nullable": true }],
  "relacionamentos": [{ "tabela_destino": "string", "tipo": "1:1 | 1:N | N:N" }],
  "indices": ["array"],
  "procedures": ["array"]
}
\`\`\`
`,

"32-RELATIONSHIP-ENGINE.md": `# 32 — RELATIONSHIP ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Mapeamento de Relacionamentos

## Os 22 Tipos de Relacionamento

| Tipo | Direção | Exemplo |
|------|---------|---------|
| DEPENDS_ON | → | Tela depende de API |
| USES | → | API usa Tabela |
| CALLS | → | Controller chama Service |
| READS | → | Relatório lê View |
| WRITES | → | Formulário escreve Tabela |
| GENERATES | → | Processo gera Relatório |
| DOCUMENTED_BY | ← | Módulo documentado por Manual |
| VIDEO_OF | ← | Cena é vídeo de Tela |
| FAQ_OF | ← | FAQ responde sobre Módulo |
| QUIZ_OF | ← | Quiz testa conhecimento sobre Módulo |
| CONFIGURES | → | Configuração afeta Comportamento |
| IMPORTS | → | Módulo importa Biblioteca |
| EXPORTS | → | Sistema exporta para DETRAN |
| REQUIRES | → | Funcionalidade requer Permissão |
| BELONGS_TO | → | Tela pertence a Módulo |
| NEXT | → | Passo 1 precede Passo 2 |
| PREVIOUS | ← | Passo 2 sucede Passo 1 |
| CAUSES | → | Ação causa Evento |
| FIXES | → | Solução resolve Erro |
| VALIDATES | → | Regra valida Campo |
| CAPTURED_BY | ← | Tela capturada por Playwright |
| EXPLAINED_BY | ← | Conceito explicado por Microlearning |

## Regra

Todo objeto no Knowledge Graph deve ter **mínimo 3 relacionamentos**. Objetos isolados são inválidos.
`,

"33-LEARNING-ENGINE.md": `# 33 — LEARNING ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Aprendizado Contínuo

## Princípio #9 em Ação

Todo execução da AKP produz aprendizado que alimenta a plataforma.

## O que é registrado

\`\`\`json
{
  "execucao_id": "uuid",
  "tarefa": "string",
  "agente": "string",
  "modelo_ia": "gpt-4o",
  "tokens_entrada": 2400,
  "tokens_saida": 1800,
  "tempo_ms": 4200,
  "qualidade_score": 87,
  "falhas": [],
  "feedback_humano": null,
  "relacionamentos_criados": 5,
  "versao_objeto": "1.0.0"
}
\`\`\`

## Como o aprendizado melhora a plataforma

1. **Otimização de prompts** — prompts que geram maior qualidade são preferidos
2. **Cache inteligente** — respostas similares reutilizadas (Princípio #8)
3. **Detecção de gaps** — tópicos frequentes sem resposta viram FAQs
4. **Calibração de qualidade** — score médio por agente e tipo de conteúdo
`,

"35-PROMPT-COMPILER.md": `# 35 — PROMPT COMPILER
## AXIONIA KNOWLEDGE PLATFORM — Compilador de Prompts

## O que é

O Prompt Compiler transforma as especificações APSL em prompts otimizados para cada modelo de IA.

## Processo

\`\`\`
APSL Spec → Parser → AST → Otimizador → Prompt Final
\`\`\`

## Otimizações Aplicadas

- Remoção de redundâncias
- Compressão de contexto
- Injeção de exemplos relevantes do Knowledge Graph
- Adaptação ao modelo (gpt-4o vs gpt-4o-mini)
- Cache de prompts compilados (Redis TTL 24h)

## Exemplo

\`\`\`
Input APSL:
@agent(AKP-DOC)
@template(A)
@sistema(AxHub)
@modulo(Triagem)
@publico(operador)

Output Compilado:
"Você é o AKP Documentation Agent. Gere o Manual do Usuário
para o módulo de Triagem do AxHub seguindo o Template A (16 seções).
Público: operadores leigos. Use narrativa corporativa..."
\`\`\`
`,

"36-APSL.md": `# 36 — APSL — AKP PROMPT SPECIFICATION LANGUAGE
## AXIONIA KNOWLEDGE PLATFORM — Linguagem de Especificação de Prompts

## Sintaxe

\`\`\`apsl
@agent(AGENT_ID)          → Define o agente executor
@template(A|B|C)          → Template de conteúdo
@sistema(AxHub|AxTon|...)  → Sistema alvo
@modulo(nome)             → Módulo específico
@publico(tecnico|admin|usuario) → Audiência
@formato(json|md|pdf)     → Formato de saída
@versao(semver)           → Versão do conteúdo
@relacionar(objeto_id)    → Relacionamentos obrigatórios
@principio(1..10)         → Princípios a aplicar
\`\`\`

## Exemplo Completo

\`\`\`apsl
@agent(AKP-SB)
@template(B)
@sistema(AxHub)
@modulo(Triagem)
@publico(operador)
@formato(json)
@versao(1.0.0)
@relacionar(AKP-DOC-AH-TRL-001)
@principio(1,3,6,7)
\`\`\`

Gera o storyboard completo para o vídeo do módulo de Triagem do AxHub.
`,

"37-AVSL.md": `# 37 — AVSL — AKP VIDEO SPECIFICATION LANGUAGE
## AXIONIA KNOWLEDGE PLATFORM — Linguagem de Especificação de Vídeo

## Sintaxe

\`\`\`avsl
@video(titulo)
@capitulo(numero, titulo)
@cena(numero) {
  objetivo: "string"
  narrativa: "string"
  imagem: screenshot.png | slide | animacao
  zoom: regiao="selector" fator=1.5
  cursor: visivel=true destacado=true
  callout: texto="Atenção!" posicao=right
  legenda: "Texto exibido na tela"
  transicao: fade|cut|slide|zoom_out|dissolve
  audio: narracao=true musica=false
  tempo: 12s
}
\`\`\`

## Validação

Todo AVSL é validado antes da renderização:
- Todas as cenas têm objetivo definido
- Narrativas respeitam limite de palavras
- Screenshots referenciados existem no MinIO
- Tempo total dentro dos limites do nível
`,

"38-ADSL.md": `# 38 — ADSL — AKP DOCUMENT SPECIFICATION LANGUAGE
## AXIONIA KNOWLEDGE PLATFORM — Linguagem de Especificação de Documentos

## Sintaxe

\`\`\`adsl
@document(titulo)
@template(A)
@sistema(AxHub)
@modulo(Triagem)
@publico(operador)
@versao(1.0.0)

@secao(objetivo) {
  "Orienta o operador a realizar a triagem de infrações..."
}

@secao(prerequisitos) {
  - Perfil Triador ativo
  - Acesso ao módulo Infrações
}

@secao(faq) {
  Q: "Como descartar uma infração?"
  A: "O usuário deverá selecionar..."
}

@relacionar(VIDEO_OF, AKP-VID-AH-TRL-001)
@relacionar(FAQ_OF, AKP-FAQ-AH-015)
\`\`\`
`,

"39-ACP.md": `# 39 — ACP — AKP COMMUNICATION PROTOCOL
## AXIONIA KNOWLEDGE PLATFORM — Protocolo de Comunicação

## Regras do Protocolo

1. **Toda comunicação via eventos** — sem chamadas diretas entre agentes
2. **Todo evento é tipado** — sem mensagens genéricas
3. **Todo evento tem correlation_id** — para rastreabilidade end-to-end
4. **Todo evento tem TTL** — mensagens não processadas expiram
5. **Toda falha gera dead-letter** — nenhuma mensagem é perdida

## Ciclo de Vida da Mensagem

\`\`\`
PUBLISHED → DELIVERED → ACKNOWLEDGED → PROCESSED
                              ↓
                         NACK → RETRY (3x) → DEAD_LETTER
\`\`\`

## Garantias

- **At-least-once delivery** — toda mensagem é entregue ao menos uma vez
- **Idempotência** — processadores devem ser idempotentes
- **Ordering** — filas por agente garantem ordem de processamento
`,

"40-CORE-AGENTS.md": `# 40 — CORE AGENTS
## AXIONIA KNOWLEDGE PLATFORM — Agentes Fundamentais

## AI Orchestrator (AKP-ORCH)
O ponto central de controle. Roteia eventos, não executa domínio.

## Project Manager Agent (AKP-PM)
Controla ciclo de vida dos projetos. NUNCA produz conteúdo.

| Cria | Versiona | Arquiva | Templates | Backup | Clientes |

## Validator Agent (AKP-VAL)
Todo output passa por aqui antes de ser publicado.

**Verifica:**
- Schema AKP completo (18+ campos)
- Mínimo 3 relacionamentos
- Narrativa corporativa (sem "clique aqui")
- Template correto aplicado
- Sem duplicatas no Knowledge Graph

**Retorna:** APROVADO | REPROVADO (com feedback) | PENDENTE
`,

"41-KNOWLEDGE-AGENTS.md": `# 41 — KNOWLEDGE AGENTS
## AXIONIA KNOWLEDGE PLATFORM — Agentes de Conhecimento

## Knowledge Extractor (AKP-KE)
Transforma qualquer fonte em Knowledge Objects AKP.

**Fluxo interno:**
Receber → Analisar → Extrair → Normalizar →
Relacionamentos implícitos → 10 perguntas semânticas →
Registrar no Graph → Emitir KNOWLEDGE_READY

## Relationship Mapper (AKP-RM)
Descobre todos os 22 tipos de relacionamento entre objetos.

**9 perguntas obrigatórias:**
Quem utiliza? · Quem depende? · Quem chama? · Quem atualiza? ·
Quem consome? · Quem publica? · Quem documenta? ·
Quem explica? · Quem valida?
`,

"42-DOCUMENT-AGENTS.md": `# 42 — DOCUMENT AGENTS
## AXIONIA KNOWLEDGE PLATFORM — Agentes de Documentação

## Documentation Agent (AKP-DOC)
Produz toda documentação corporativa via Template A.

**Outputs:**
Manual Técnico · Manual Administrativo · Manual do Usuário ·
FAQ · Release Notes · Guia Rápido · KB · Catálogo API ·
Diagramas (Mermaid, PlantUML) · Markdown · PDF · Word · HTML

**Regra absoluta:** Sempre Template A (16 seções). Nunca "clique aqui".
`,

"43-VIDEO-AGENTS.md": `# 43 — VIDEO AGENTS
## AXIONIA KNOWLEDGE PLATFORM — Agentes de Vídeo

## Pipeline dos 4 Agentes

\`\`\`
Storyboard (AKP-SB) → Narrator (AKP-NAR) → Capture (AKP-CA) → Renderer (AKP-VR)
     Planeja             Narra              Captura            Renderiza
\`\`\`

## Storyboard Agent (AKP-SB)
Planeja. NUNCA renderiza.
Produz: Capítulos → Cenas (13 campos cada)

## Narrator Agent (AKP-NAR)
Narra. NUNCA lê telas.
Produz: Narrativa corporativa por cena

## Capture Agent (AKP-CA)
Captura. NUNCA interpreta negócio.
Produz: 21 campos de captura por elemento

## Video Renderer (AKP-VR)
Renderiza. NUNCA produz conhecimento.
Produz: MP4 1280×720 + SRT + Timeline
`,

"44-LEARNING-AGENTS.md": `# 44 — LEARNING AGENTS
## AXIONIA KNOWLEDGE PLATFORM — Agentes de Aprendizagem

## Microlearning Agent (AKP-ML)
Fragmenta conhecimento nos 9 níveis AKP.

Usa Template C para cápsulas 15-90s.
Todos os 10 campos obrigatórios devem ser preenchidos.
Cápsulas sem relacionamentos são inválidas.

## Quiz Agent (AKP-QUIZ)
Gera quizzes, trilhas e certificações.

**Por módulo:**
- Questões de múltipla escolha
- Questões verdadeiro/falso
- Questões por nível (básico/intermediário/avançado)
- Trilhas por perfil (Operador, Auditor, Gestor, Admin)
- Critérios de certificação
`,

"47-SECURITY.md": `# 47 — SEGURANÇA
## AXIONIA KNOWLEDGE PLATFORM — Padrões de Segurança

## Autenticação
- JWT obrigatório em todos os endpoints da API
- Rate limiting por IP e por usuário
- Tokens com expiração de 8h (sessão de trabalho)

## Autorização
- RBAC (Role-Based Access Control) por módulo
- Permissões granulares por tipo de conteúdo
- Logs de acesso auditáveis

## Dados Sensíveis
- Credenciais nunca em código — apenas variáveis de ambiente
- Senhas com hash bcrypt
- Conexões DB com TLS
- Dados de clientes isolados por tenant

## Segurança do Knowledge Graph
- Queries Cypher parametrizadas (sem injection)
- Leitura somente para agentes não-escritores
- Escrita apenas via Orchestrator
`,

"48-LGPD.md": `# 48 — LGPD
## AXIONIA KNOWLEDGE PLATFORM — Conformidade LGPD

## Dados Pessoais na AKP

A AKP pode processar dados pessoais ao analisar:
- Logs de usuários
- Tickets de helpdesk
- Histórico de operações

## Princípios LGPD Aplicados

| Princípio | Implementação AKP |
|-----------|------------------|
| Finalidade | Dados usados apenas para geração de conhecimento |
| Adequação | Coleta mínima necessária |
| Necessidade | Dados anonimizados quando possível |
| Livre Acesso | Usuário pode solicitar seus dados |
| Transparência | Política de privacidade documentada |
| Segurança | Criptografia e controle de acesso |

## WhatsApp Bot
O bot AKP aplica LGPD Gate automático:
- Exige consentimento antes de qualquer interação
- Registra aceite com data/hora
- Permite encerramento e remoção de dados
`,

"57-CLI.md": `# 57 — CLI — axionia.js
## AXIONIA KNOWLEDGE PLATFORM — Interface de Linha de Comando

## Comandos

\`\`\`bash
# Pipeline completo
axionia presentation generate projeto.json

# Detectar e aplicar atualizações
axionia presentation update Dashboard.jsx --sim

# Ver arquivos alterados desde último commit
axionia presentation diff

# Status do projeto atual
axionia presentation status

# Executar agente específico
axionia agent run AKP-SB --input knowledge.json

# Validar output
axionia validate output/axhub/03-manual.json
\`\`\`

## Opções Globais

| Opção | Descrição |
|-------|-----------|
| --sim / -y | Confirmar sem prompt |
| --resume | Retomar do checkpoint |
| --continue | Continuar com erros |
| --no-commit | Sem git commit automático |
| --open | Abrir output no browser |
| --project | Projeto alvo |
`,

"66-TEMPLATES.md": `# 66 — SISTEMA DE TEMPLATES
## AXIONIA KNOWLEDGE PLATFORM — Templates Corporativos

## Template A — Documento (16 seções)
Objetivo → Escopo → Pré-requisitos → Configuração → Fluxo →
Execução → Resultado Esperado → Validações → Erros Possíveis →
Troubleshooting → Boas Práticas → FAQ → Relacionamentos →
Links → Vídeos → Próximos Passos

## Template B — Vídeo (11 seções)
Introdução → Objetivo → Pré-requisitos → Fluxo →
Demonstração → Resumo → Boas Práticas → Conclusão →
Próximos Passos → Relacionamentos → Links Úteis

## Template C — Microlearning 15-40s (10 campos)
Título → Tempo → Imagem Principal → Mensagem Curta (25 palavras) →
Benefício → Exemplo → Convite para Saber Mais →
Relacionamento Manual → Relacionamento Treinamento → Relacionamento FAQ

## Regra
Todo conteúdo produzido DEVE usar o template correspondente.
Conteúdo sem template é inválido e será rejeitado pelo Validator Agent.
`,

"69-ROADMAP.md": `# 69 — ROADMAP
## AXIONIA KNOWLEDGE PLATFORM — Evolução até 2035

## 2026 — Fundação (v1.0)
- ✅ 10 Agentes Cognitivos especializados
- ✅ Knowledge Graph (Neo4j)
- ✅ Templates A, B, C
- ✅ Pipeline de vídeo (Storyboard → Renderer)
- ✅ Microlearning 9 níveis
- ✅ PresentationCenter 10 abas
- 🔄 Digital Twin Cognitivo completo

## 2027 — Escala (v2.0)
- Multi-tenant enterprise
- Portal público de help center
- Auto-sync contínuo (sem confirmação manual)
- Analytics avançado de gaps de conhecimento
- Certificações com validade legal

## 2028 — Expansão (v3.0)
- Suporte a 50+ linguagens de programação
- Integração com GitHub Actions (CI/CD de conhecimento)
- API pública para parceiros
- Marketplace de templates e agentes

## 2030 — Inteligência (v4.0)
- Learning Engine com ML real adaptativo
- Digital Twin preditivo (antecipa mudanças)
- Geração de especificações automáticas de novas features

## 2035 — Ecosistema (v5.0)
- Plataforma aberta para qualquer empresa de software
- AKP como padrão de mercado para documentação inteligente
`,

"80-CONCLUSION.md": `# 80 — CONCLUSÃO
## AXIONIA KNOWLEDGE PLATFORM — A Visão Completa

## O que construímos

Em 80 documentos, especificamos uma plataforma que:

1. **Compreende** qualquer sistema de software em profundidade
2. **Estrutura** todo o conhecimento em objetos relacionados
3. **Gera** automaticamente documentação, vídeos e treinamentos
4. **Mantém** tudo sincronizado quando o sistema evolui
5. **Aprende** continuamente com cada execução

## O Princípio Final

> *"O objetivo da AKP não é produzir documentos. É garantir que nenhum operador, analista, gestor ou desenvolvedor precise trabalhar sem o conhecimento que precisa, quando precisa, no formato que precisa."*

## Próximos Passos

1. Implementar os 44 documentos ainda pendentes (🔄 no índice)
2. Completar o Digital Twin dos 3 produtos Axion
3. Ativar o auto-sync contínuo (sem confirmação manual)
4. Publicar o portal público de help center
5. Iniciar o roadmap 2027

---

*AXIONIA KNOWLEDGE PLATFORM v1.0 Enterprise*
*Axion Tecnologia — 2026*
`

};

let created = 0;
for (const [filename, content] of Object.entries(SPECS)) {
  const filepath = path.join(OUT, filename);
  fs.writeFileSync(filepath, content, "utf8");
  created++;
  process.stdout.write(`\r  Criado: ${created}/${Object.keys(SPECS).length} — ${filename}    `);
}

console.log(`\n\n✅ ${created} documentos criados em ${OUT}`);

// Gerar os arquivos restantes como stubs (com estrutura básica)
const allFiles = Array.from({length: 81}, (_, i) => i)
  .map(i => {
    const names = {
      0: "00-README", 1: "01-VISAO-GERAL", 2: "02-CONSTITUICAO",
      3: "03-PRINCIPIOS", 4: "04-FILOSOFIA", 5: "05-GOVERNANCA",
      6: "06-ARQUITETURA", 7: "07-DOMINIOS", 8: "08-KNOWLEDGE-GRAPH",
      9: "09-DIGITAL-TWIN", 10: "10-CONTEXT-PROTOCOL", 11: "11-ORCHESTRATOR",
      12: "12-EVENT-BUS", 13: "13-WORKFLOW", 14: "14-SOURCE-ENGINE",
      15: "15-DOCUMENTATION-ENGINE", 16: "16-STORYBOARD-ENGINE", 17: "17-VIDEO-ENGINE",
      18: "18-NARRATION-ENGINE", 19: "19-TIMELINE-ENGINE", 20: "20-RENDER-ENGINE",
      21: "21-PUBLISHING-ENGINE", 22: "22-TRAINING-ENGINE", 23: "23-QUIZ-ENGINE",
      24: "24-MICROLEARNING", 25: "25-KNOWLEDGE-FEED", 26: "26-PLAYWRIGHT",
      27: "27-OCR", 28: "28-SCREEN-ANALYZER", 29: "29-API-ENGINE",
      30: "30-DATABASE-ENGINE", 31: "31-CODE-ANALYZER", 32: "32-RELATIONSHIP-ENGINE",
      33: "33-LEARNING-ENGINE", 34: "34-ANALYTICS", 35: "35-PROMPT-COMPILER",
      36: "36-APSL", 37: "37-AVSL", 38: "38-ADSL", 39: "39-ACP",
      40: "40-CORE-AGENTS", 41: "41-KNOWLEDGE-AGENTS", 42: "42-DOCUMENT-AGENTS",
      43: "43-VIDEO-AGENTS", 44: "44-LEARNING-AGENTS", 45: "45-PUBLISHING-AGENTS",
      46: "46-VALIDATION-AGENTS", 47: "47-SECURITY", 48: "48-LGPD",
      49: "49-PERFORMANCE", 50: "50-CACHE", 51: "51-REDIS", 52: "52-RABBITMQ",
      53: "53-DOCKER", 54: "54-KUBERNETES", 55: "55-MONOREPO", 56: "56-VSCODE",
      57: "57-CLI", 58: "58-API", 59: "59-WEB", 60: "60-REACT",
      61: "61-DOTNET", 62: "62-POSTGRES", 63: "63-NEO4J", 64: "64-MINIO",
      65: "65-TESTS", 66: "66-TEMPLATES", 67: "67-STYLE-GUIDE",
      68: "68-BEST-PRACTICES", 69: "69-ROADMAP", 70: "70-VERSIONING",
      71: "71-PLUGINS", 72: "72-MARKETPLACE", 73: "73-EXTENSIONS",
      74: "74-CLIENT-PORTAL", 75: "75-ADMIN", 76: "76-ENTERPRISE",
      77: "77-DEPLOYMENT", 78: "78-OBSERVABILITY", 79: "79-FUTURE",
      80: "80-CONCLUSION"
    };
    return names[i] ? `${names[i]}.md` : null;
  })
  .filter(Boolean);

const stubFiles = allFiles.filter(f => !Object.keys(SPECS).includes(f));
let stubs = 0;
for (const filename of stubFiles) {
  const filepath = path.join(OUT, filename);
  if (!fs.existsSync(filepath)) {
    const title = filename.replace(".md","").replace(/^\d+-/,"").replace(/-/g," ");
    fs.writeFileSync(filepath, `# ${filename.replace(".md","").replace(/^\d+-/,"").replace(/-/g, " — ")}\n## AXIONIA KNOWLEDGE PLATFORM — ${title.toUpperCase()}\n\n> **Status:** Em desenvolvimento\n\n## Visão Geral\n\nEste documento especifica o componente **${title}** da AXIONIA KNOWLEDGE PLATFORM.\n\n## Referências\n\n- Ver [03-ARQUITETURA.md](03-ARQUITETURA.md) para contexto\n- Ver [02-PRINCIPIOS.md](02-PRINCIPIOS.md) para princípios\n`, "utf8");
    stubs++;
  }
}

console.log(`✅ ${stubs} stubs criados`);
console.log(`📁 Total: ${created + stubs} arquivos`);
