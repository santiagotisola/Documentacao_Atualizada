# ANÁLISE DE VIABILIDADE — AXION OPERATIONS CENTER v2026.1
## Avaliação Técnica, Impacto e Plano de Operacionalização

> **Data**: 2026-07-04  
> **Contexto**: Análise da proposta Knowledge Driven Architecture vs. sistema atual AxionIA v4.0  
> **Método**: Mapeamento componente a componente — status, viabilidade, impacto e prioridade

---

## ⚡ ALERTA CRÍTICO — DISCREPÂNCIA DE STACK

> **O JSON propõe `.NET 8 + React`** mas o backend atual da plataforma IA é **Node.js + Express**.  
> Os produtos AxHub/AxTon/AxCross são .NET, mas a plataforma de inteligência é Node.js.  
> **Decisão necessária antes de tudo:** migrar o backend para .NET 8 ou manter Node.js?

| Opção | Prós | Contras | Recomendação |
|---|---|---|---|
| Manter Node.js | Zero migração, 287 endpoints funcionando | Diverge do JSON proposto | ✅ Manter Node.js por ora |
| Migrar para .NET 8 | Unifica stack com AxHub/AxTon/AxCross | 3-6 meses de reescrita, alto risco | ❌ Não agora |
| **Híbrido** | Node.js IA + .NET 8 para novos serviços | Complexidade de gateway | 🟡 Avaliar em 12 meses |

**Decisão adotada neste plano:** Manter Node.js. O JSON é tratado como **modelo conceitual**, não como restrição de stack.

---

## 1. MAPEAMENTO COMPLETO — O QUE JÁ EXISTE vs. O QUE É NOVO

### 1.1 Centers (Centros)

| Centro Proposto | Status Atual | Maturidade | Esforço p/ Formalizar |
|---|---|---|---|
| `operationsCenter` | ✅ Operations Hub (`/operations-hub`) | 80% | Baixo — renomear/reorganizar |
| `missionCenter` | 🟡 VARCO tem "missões" não formais | 30% | Médio — criar modelo Mission |
| `knowledgeCenter` | ✅ KB + Treinamento (`/kb`, `/treinamento`) | 70% | Baixo — estruturar objetos |
| `learningCenter` | 🟡 Logs + Revisão existem, sem ML real | 40% | Alto — requer ML Engine |
| `presentationCenter` | 🟡 Geração de Docs (MD/HTML), sem PPT/Video | 35% | Alto — PPT/Video são complexos |
| `approvalCenter` | ✅ ConfiançaRevisão + Approval model | 75% | Baixo — já implementado |
| `integrationCenter` | ✅ 9 integrações ativas | 90% | Mínimo — centralizar painel |
| `qualityCenter` | ✅ Central de Sites v3.0 (18 módulos) | 85% | Mínimo — já é o mais robusto |
| `helpDeskCenter` | ✅ Helpdesk completo + WhatsApp + Polling | 90% | Mínimo — centralizar |

**Resultado:** 5 de 9 centros existem com 70%+ de maturidade. Formalizar é custo baixo.

---

### 1.2 Engines (Motores)

#### Mission Engine ← **NOVO CONCEITO** — Viabilidade: ALTA

Propõe operações formais: `Audit, Deployment, Migration, Training, Support, Validation, Comparison, Monitoring, Homologation, Investigation`

**O que existe:** VARCO faz "Audit" e "Monitoring", CUTI faz "Validation", Helpdesk faz "Support" — mas sem um modelo `Mission` unificado.

**Impacto de implementar:**
- Criar modelo MongoDB: `Mission { tipo, cliente, responsavel, inicio, fim, status, evidencias[], resultado }`
- Criar rota `/missions` no painel
- Vincular VARCO, CUTI, Helpdesk como "executores de missão"
- **Risco:** baixo — é uma camada organizacional sobre o que já existe

---

#### Knowledge Engine ← **EXTENSÃO DO KB ATUAL** — Viabilidade: ALTA

Propõe 20 objetos de conhecimento:
`Client, Module, Page, Menu, Field, Workflow, API, Database, Integration, Equipment, OCR, Validator, Comparator, Document, Video, FAQ, Presentation, Test, Evidence, Issue`

| Objeto | Status | Onde está hoje |
|---|---|---|
| `Client` | ❌ Não existe | Gap crítico — nenhum modelo Cliente |
| `Module` | ✅ Existe | sitesData.js (implícito) |
| `Page` | ✅ Existe | sitesData.js `menus` |
| `Menu` | ✅ Existe | AXHUB_MENU_COMPLETO em sitesData.js |
| `Field` | ❌ Não existe | Novo — campos por tela |
| `Workflow` | 🟡 Parcial | Processos existem mas não formalizados |
| `API` | ✅ Existe | 287 endpoints documentados |
| `Database` | ✅ Existe | 3 SQL Server + MongoDB |
| `Integration` | ✅ Existe | 9 integrações mapeadas |
| `Equipment` | ✅ Existe | SQL Server AxHub/AxCross |
| `OCR` | ✅ Existe | Pipeline de triagem |
| `Validator` | ✅ Existe | CUTI + Visual Validation |
| `Comparator` | ✅ Existe | Comparador Global (14 dimensões) |
| `Document` | ✅ Existe | Docusaurus + fonte.model.js |
| `Video` | ❌ Não existe | Novo — geração de vídeo tutorial |
| `FAQ` | ✅ Existe | KB model (pergunta/resposta) |
| `Presentation` | 🟡 Parcial | Geração de docs, sem PPT |
| `Test` | 🟡 Parcial | CUTI — scripts, sem modelo formal |
| `Evidence` | 🟡 Parcial | Job model tem resultados/screenshots |
| `Issue` | 🟡 Parcial | Helpdesk tickets, sem Issue model próprio |

**12 de 20 objetos já existem em alguma forma.** Faltam: Client, Field, Video, Test formal, Evidence formal, Issue próprio.

---

#### Learning Engine ← **MAIS NOVO E COMPLEXO** — Viabilidade: MÉDIA

Propõe: `machineLearning, patternRecognition, recommendations, predictiveAnalysis`

| Capacidade | Status | Esforço Real |
|---|---|---|
| `machineLearning` | ❌ Não existe real | Alto — requer dados históricos + modelos |
| `patternRecognition` | 🟡 GPT-4o analisa padrões por texto | Médio — estruturar prompts |
| `recommendations` | 🟡 IAInsights já recomenda | Baixo — formalizar output |
| `predictiveAnalysis` | ❌ Não existe | Alto — requer histórico + ML |

**Recomendação:** Implementar `patternRecognition` e `recommendations` com GPT-4o (rápido). `machineLearning` real fica para fase 4 quando houver dados históricos suficientes.

---

#### Presentation Engine ← **PARCIALMENTE NOVO** — Viabilidade: MÉDIA

Propõe outputs: `PDF, Word, PowerPoint, HTML, Markdown, Wiki, Video, Training, FAQ`

| Output | Status | Esforço |
|---|---|---|
| `Markdown` | ✅ Existe | Zero |
| `HTML` | ✅ Docusaurus | Zero |
| `PDF` | 🟡 Puppeteer pode gerar | Baixo — implementar |
| `Word (DOCX)` | ❌ Não existe | Médio — docx npm |
| `PowerPoint (PPTX)` | ❌ Não existe | Médio — pptxgenjs npm |
| `Wiki` | ✅ Docusaurus = wiki | Zero |
| `Video` | ❌ Não existe | Alto — muito complexo |
| `Training` | 🟡 Docs de treinamento existem | Baixo |
| `FAQ` | ✅ KB gera FAQs | Zero |

**Rota rápida:** Adicionar `docx` e `pptxgenjs` ao projeto. Video fica como fase tardia.

---

#### Approval Engine ← **JÁ EXISTE** — Viabilidade: TOTAL

Workflow `Draft → Review → Approved → Published` já implementado para:
- `spec.model.js` (status: rascunho/revisao/aprovado)
- `roadmap.model.js` (status: rascunho/publicado/arquivado)
- `approval.model.js` (tipo: roadmap/spec)
- `confianca-revisao.model.js` (status: PENDENTE/REVISADO/DESCARTADO)

**Ação:** Apenas formalizar como "Approval Engine" no painel — zero reescrita.

---

### 1.3 VARCO Agent ← **EVOLUÇÃO CRÍTICA** — Viabilidade: ALTA

| Capability Proposta | Status Atual | Gap |
|---|---|---|
| `Navigate` | 🟡 Parcial — local | Precisa conexão remota a sites reais |
| `Inspect` | ✅ Existe | — |
| `Compare` | ✅ Comparador Global | — |
| `Validate` | ✅ CUTI + Visual | — |
| `Monitor` | ✅ Heartbeat | — |
| `CaptureEvidence` | ✅ Job model | — |
| `CaptureScreenshots` | ✅ pixelmatch | — |
| `CaptureHtml` | 🟡 Parcial | Adicionar dump HTML |
| `CaptureJson` | 🟡 Parcial | Adicionar dump JSON de APIs |
| `GenerateKnowledge` | 🟡 Parcial | Precisa formalizar saída para KB |
| `Synchronize` | ❌ Não existe | Novo — sync periódico com sites |

**O GAP MAIS IMPORTANTE:** O VARCO atual não se conecta remotamente aos sites clientes com login/senha. Adicionar `url + login + password` por site no MongoDB desbloquearia todas as capabilities remotas.

---

### 1.4 Knowledge Graph ← **NOVO E ALTO VALOR** — Viabilidade: MÉDIA

Relacionamentos propostos:
```
Client → Module → Page → Field → API → Integration → Equipment
Issue → Knowledge → Document / Video / Presentation
```

**Impacto:** Isso é a base para:
- "Qual cliente usa qual módulo?" 
- "Qual tela depende de qual API?"
- "Qual problema gerou qual documento?"

**Implementação sugerida:** MongoDB com referências por ObjectId (não requer Neo4j). Pode ser feito com os modelos atuais estendidos.

**Esforço:** Médio — 2-4 semanas para modelo básico funcional.

---

### 1.5 Event Bus ← **NOVO** — Viabilidade: MÉDIA

`OperationalKnowledgeBus` com publishers (Validator, Comparator, Mission, HelpDesk, OCR, VARCO) e subscribers (Knowledge, Presentation, Learning, Dashboard, AI).

**Implementação sugerida (Node.js):**
- Usar `EventEmitter` nativo (já disponível, zero dependência)
- Ou `Socket.io` (já usado para SignalR pattern) para eventos em tempo real
- **Não** requer Kafka/RabbitMQ — escala atual não justifica

---

## 2. SCORE DE VIABILIDADE CONSOLIDADO

| Componente | Existe? | Viabilidade | Esforço | Disruption | Prioridade |
|---|---|---|---|---|---|
| operationsCenter | ✅ 80% | 🟢 ALTA | Mínimo | Zero | P1 |
| helpDeskCenter | ✅ 90% | 🟢 ALTA | Mínimo | Zero | P1 |
| qualityCenter | ✅ 85% | 🟢 ALTA | Mínimo | Zero | P1 |
| approvalCenter | ✅ 75% | 🟢 ALTA | Mínimo | Zero | P1 |
| integrationCenter | ✅ 90% | 🟢 ALTA | Mínimo | Zero | P1 |
| knowledgeCenter | ✅ 70% | 🟢 ALTA | Baixo | Baixa | P1 |
| approvalEngine | ✅ 90% | 🟢 ALTA | Mínimo | Zero | P1 |
| VARCO Agent (remoto) | 🟡 60% | 🟢 ALTA | Médio | Baixa | P2 |
| missionCenter | 🟡 30% | 🟢 ALTA | Médio | Baixa | P2 |
| missionEngine | 🟡 30% | 🟢 ALTA | Médio | Baixa | P2 |
| knowledgeEngine (objetos) | 🟡 60% | 🟢 ALTA | Médio | Baixa | P2 |
| presentationEngine (PDF/DOCX/PPTX) | 🟡 20% | 🟢 ALTA | Médio | Baixa | P2 |
| knowledgeGraph | ❌ 0% | 🟡 MÉDIA | Médio | Média | P3 |
| eventBus | ❌ 0% | 🟡 MÉDIA | Médio | Média | P3 |
| learningCenter | 🟡 40% | 🟡 MÉDIA | Alto | Baixa | P3 |
| learningEngine (ML real) | ❌ 0% | 🔴 BAIXA | Muito Alto | Alta | P4 |
| presentationEngine (Video) | ❌ 0% | 🔴 BAIXA | Muito Alto | Baixa | P4 |
| .NET 8 backend | ❌ 0% | 🔴 BAIXA | Crítico | Extrema | ❌ Cancelar |

---

## 3. PLANO DE OPERACIONALIZAÇÃO — 7 FASES AJUSTADAS

> Cada fase entrega valor imediato sem quebrar o que funciona.

### FASE 1 — Formalizar o que Existe (2 semanas)
**Conceito:** Nomear, organizar e documentar os centers já funcionais.

| Ação | O que fazer | Arquivos afetados |
|---|---|---|
| Renomear Operations Hub | Adicionar label "Operations Center" na UI | App.jsx |
| Renomear Central de Sites | Adicionar label "Quality Center" | App.jsx, CentralSites/index.jsx |
| Renomear Helpdesk | Adicionar label "HelpDesk Center" | App.jsx |
| Renomear KB | Adicionar label "Knowledge Center" | App.jsx |
| Formalizar Approval Engine | Unificar fila de revisão + specs + roadmap em uma view | nova página /approval-center |
| Formalizar Integration Center | Criar página de status consolidado das 9 integrações | nova página /integration-center |

**Resultado:** Sistema atual com nomenclatura alinhada ao schema. Zero breaking change.

---

### FASE 2 — Mission Engine + VARCO Remoto (3-4 semanas)
**Conceito:** Criar o conceito formal de Missão e habilitar VARCO com acesso remoto.

#### 2a. Modelo Mission no MongoDB
```javascript
// mission.model.js
{
  tipo: Enum['Audit','Deployment','Migration','Training','Support',
             'Validation','Comparison','Monitoring','Homologation','Investigation'],
  titulo: String,
  cliente: String,        // ex: 'ibametro', 'ipemce'
  produto: Enum['axhub','axton','axcross'],
  responsavel: String,
  inicio: Date,
  fim: Date,
  status: Enum['planejada','em_execucao','concluida','cancelada'],
  evidencias: [{ tipo, url, capturedAt }],
  resultado: { sucesso: Boolean, observacoes: String, documentoGerado: ObjectId },
  linkedTicketId: Number,  // Jitbit
  linkedVarcoJobId: ObjectId
}
```

#### 2b. VARCO Agent — Conexão Remota
```javascript
// Adicionar ao sitesData.js → migrar para MongoDB
{
  siteId: 'ibametro',
  varco: {
    url: 'https://ibametro.axhub.com.br',
    login: 'admin',
    password: '***encrypted***'  // bcrypt na DB
  }
}
```

Capacidades que se desbloqueiam:
- Navigate: acessar tela real do site
- CaptureScreenshots: screenshot automático de qualquer tela
- CaptureHtml: dump do HTML da tela
- GenerateKnowledge: criar KB item a partir do que foi capturado

**Resultado:** VARCO pode auditar sites reais automaticamente e criar conhecimento.

---

### FASE 3 — Knowledge Engine + Assets Catalog (3-4 semanas)
**Conceito:** Estruturar o repositório de conhecimento com os 20 objetos formais.

#### 3a. Novos modelos MongoDB necessários
```javascript
// client.model.js ← O GAP MAIS CRÍTICO
{ nome, codigo, produto, url, versao, credenciais, contatos[], siteId }

// knowledge-object.model.js
{ tipo: Enum[20 tipos], titulo, conteudo, produto, cliente, 
  relacionamentos: [{ tipo, referenciaId }], tags[], versao }

// issue.model.js
{ titulo, descricao, produto, cliente, severity, status,
  linkedTicketId, linkedKnowledgeIds[], evidencias[], resolucao }
```

#### 3b. Asset Catalog — View no painel
Criar página `/asset-catalog` que lista, filtra e busca por:
`Clients, Pages, Menus, Modules, Reports, APIs, OCR, Equipment, Databases, Dashboards, Integrations, Documents, Videos, Presentations, Tests`

A maioria dos dados já existe no sistema (SQL Server, sitesData.js, endpoints documentados). É apenas uma view agregadora.

---

### FASE 4 — Presentation Engine (2-3 semanas)
**Conceito:** Expandir a geração de documentos para PDF, DOCX e PPTX.

#### Dependências a adicionar:
```bash
npm install pptxgenjs docx puppeteer-pdf
```

#### Novos endpoints:
```
POST /presentation/gerar-pdf      → Puppeteer → PDF
POST /presentation/gerar-docx     → docx npm → Word
POST /presentation/gerar-pptx     → pptxgenjs → PowerPoint
POST /presentation/gerar-faq      → KB → HTML/PDF FAQ
```

**Templates a criar:**
- Relatório de Auditoria de Site (PDF)
- Relatório de Conformidade de Edital (DOCX)
- Apresentação Executiva do Sistema (PPTX)
- FAQ por produto (PDF/HTML)

**Video:** Adiar para fase tardia. Complexidade extrema, baixo ROI imediato.

---

### FASE 5 — Event Bus Interno (2 semanas)
**Conceito:** `OperationalKnowledgeBus` via Node.js EventEmitter nativo.

```javascript
// eventBus.js — sem dependências externas
import { EventEmitter } from 'events';
export const bus = new EventEmitter();

// Publishers existentes emitem eventos
bus.emit('varco:evidence-captured', { missionId, siteId, data });
bus.emit('helpdesk:ticket-resolved', { ticketId, produto, resolucao });
bus.emit('ocr:triagem-completed', { siteId, aprovadas, rejeitadas });

// Subscribers reagem
bus.on('varco:evidence-captured', async (data) => {
  await knowledgeService.createFromEvidence(data);
  await dashboardService.updateStats(data);
});

bus.on('helpdesk:ticket-resolved', async (data) => {
  await aiService.updateKBFromResolution(data);
  await learningService.recordPattern(data);
});
```

**Resultado:** Desacopla os sistemas internamente. Cada ação propaga conhecimento automaticamente.

---

### FASE 6 — Knowledge Graph (3-4 semanas)
**Conceito:** Grafo de relacionamentos Client→Module→Page→Field→API→Integration→Equipment

```javascript
// Relações via MongoDB referências
// Na página /knowledge-graph: visualização com React Flow ou D3.js

// Queries úteis:
// "Quais equipamentos o cliente IBAMETRO usa?"
db.knowledge.aggregate([
  { $match: { tipo: 'Client', clienteId: 'ibametro' } },
  { $graphLookup: { from: 'knowledge', 
    startWith: '$_id', connectFromField: '_id',
    connectToField: 'relacionamentos.referenciaId', as: 'grafo' }}
])
```

**Não usar Neo4j** — MongoDB com `$graphLookup` resolve o caso de uso atual sem adicionar infra.

---

### FASE 7 — Learning Engine com GPT-4o (contínuo)
**Conceito:** Pattern Recognition e Recommendations com IA (sem ML real ainda).

| Capacidade | Implementação |
|---|---|
| `patternRecognition` | GPT-4o analisa logs e identifica padrões de chamados recorrentes |
| `recommendations` | IAInsights já existe — formalizar como "Learning Recommendations" |
| `predictiveAnalysis` | Após 6 meses de dados: usar histórico de heartbeat para prever falhas |
| `machineLearning` | Apenas quando houver 10k+ registros históricos — use Prophet/sklearn via Python microservice |

---

## 4. MATRIZ DE IMPACTO × DISRUPTION

```
Alto Impacto
    │
    │  [VARCO Remoto]    [Knowledge Graph]
    │  [Mission Engine]  [Event Bus]
    │  [Client Model]    
    │                         [ML Real]
    ├──────────────────────────────────────
    │  [Approval Center] [Presentation]   
    │  [Asset Catalog]   [.NET 8]
    │  [Centers Label]   
    │
Baixo Impacto
    └──────────────────────────────────────
    Zero Disruption               Alta Disruption
```

### Quadrante Ideal (Alto Impacto + Zero Disruption) — FAZER AGORA:
1. Formalizar labels dos Centers
2. Criar modelo Client (MongoDB)
3. VARCO Agent remoto
4. Mission Engine
5. Approval Center unificado

### Quadrante Planejado (Alto Impacto + Média Disruption) — PLANEJAR:
1. Knowledge Graph (Fase 6)
2. Event Bus (Fase 5)

### Quadrante Evitar (Baixo Impacto + Alta Disruption) — NÃO FAZER:
1. Migração para .NET 8 backend

---

## 5. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Credenciais dos sites no MongoDB | Média | Alto | Criptografar com bcrypt/AES-256, acesso apenas via VARCO Agent |
| Event Bus sobrecarregar servidor | Baixa | Médio | Usar `setImmediate` para listeners pesados, não bloquear event loop |
| Knowledge Graph crescer demais | Baixa | Médio | Paginar `$graphLookup`, índices em `relacionamentos.referenciaId` |
| Presentation Engine (PDF) lento | Média | Baixo | Gerar em background job, notificar quando pronto |
| ML Engine com dados insuficientes | Alta | Médio | Só habilitar após 6 meses de histórico coletado |
| sitesData.js ficando desatualizado | Alta | Alto | Fase 3: migrar para MongoDB (Client model) |

---

## 6. QUICK WINS — O QUE FAZER NA PRÓXIMA SEMANA

| Dia | Ação | Resultado |
|---|---|---|
| Dia 1 | Criar `client.model.js` no MongoDB | Base do Knowledge Engine |
| Dia 1 | Criar `mission.model.js` no MongoDB | Base do Mission Engine |
| Dia 2 | Criar endpoint `POST /missions` e `GET /missions` | API de Missões |
| Dia 2 | Criar página `/mission-center` no painel | UI de Missões |
| Dia 3 | Adicionar campos `varco.url/login/password` ao client model | VARCO remoto |
| Dia 3 | Implementar `Navigate + CaptureScreenshots` remoto no VARCO | Auditoria automática |
| Dia 4 | Criar `/asset-catalog` — view de todos os assets | Catálogo unificado |
| Dia 5 | Criar `/integration-center` — status das 9 integrações | Dashboard de integrações |

---

## 7. ALINHAMENTO COM ROADMAP DO SCHEMA

| Fase Proposta | Descrição | Status | Timeline Ajustado |
|---|---|---|---|
| Phase 1: Knowledge Center | Estruturar objetos de conhecimento | 🟡 70% existe | 1-2 semanas |
| Phase 2: Mission Engine | Criar modelo formal de Missões | ❌ Novo | 2-3 semanas |
| Phase 3: Presentation Engine | PDF + DOCX + PPTX | 🟡 20% existe | 2-3 semanas |
| Phase 4: Learning Engine | Pattern + Recommendations | 🟡 40% via GPT | 3-4 semanas |
| Phase 5: Operational Knowledge Bus | Event Bus interno | ❌ Novo | 2 semanas |
| Phase 6: Knowledge Graph | Grafo de relacionamentos | ❌ Novo | 3-4 semanas |
| Phase 7: AI Orchestration | Orquestração completa | 🟡 Agent/run existe | 4-6 semanas |

**Total estimado**: 4-5 meses para implementação completa do schema, em paralelo com operação atual.

---

## 8. PRINCÍPIOS DE OPERACIONALIDADE (Como manter fácil)

### 8.1 Zero Downtime
- Todas as fases usam **adição**, nunca remoção do que existe
- Novos modelos MongoDB não quebram os existentes
- Novos endpoints adicionados ao Express (não substituem)
- Novas páginas React adicionadas ao App.jsx (novas rotas)

### 8.2 Single Source of Truth — Migração gradual
```
Hoje:  sitesData.js (estático, 30 sites)
Fase 3: MongoDB Client model (sites migrados)
Fase 5: Event Bus notifica mudanças automaticamente
Fase 6: Knowledge Graph conecta tudo
```

### 8.3 Documentação automática de cada fase
- Cada fase gera uma entrada no Knowledge Center
- O Mission Engine registra a fase como uma `Missão tipo: Migration`
- O Presentation Engine gera o release note automaticamente

### 8.4 Rollback simples
- Cada fase é uma feature flag: `centers.missionCenter.enabled = true/false`
- MongoDB collections novas não afetam collections existentes
- React routes novas não removem rotas existentes

---

## 9. CONCLUSÃO EXECUTIVA

| Métrica | Valor |
|---|---|
| % do schema já implementado | **~62%** |
| Componentes que existem (70%+ maturidade) | **6 de 9 Centers** / **1 de 5 Engines completo** |
| Componentes que precisam de criação do zero | **Mission Engine, Knowledge Graph, Event Bus, Client Model** |
| Componentes inviáveis no curto prazo | **Video generation, ML real, migração .NET 8** |
| Esforço total para 80% do schema | **~3 meses** |
| Esforço para 100% do schema | **~6-8 meses** (excluindo .NET 8 e Video) |
| Maior quick win | **Client Model + Mission Engine** (1-2 semanas, alto impacto) |
| Principal risco | **VARCO com credenciais — requer criptografia obrigatória** |

### Ordem de Execução Recomendada:
```
[SEMANA 1-2]  → Fase 1: Formalizar Centers + Client Model + Mission Model
[SEMANA 3-5]  → Fase 2: Mission Engine + VARCO Remoto
[SEMANA 6-9]  → Fase 3: Knowledge Engine + Asset Catalog  
[SEMANA 10-12] → Fase 4: Presentation Engine (PDF/DOCX/PPTX)
[SEMANA 13-14] → Fase 5: Event Bus Interno
[SEMANA 15-18] → Fase 6: Knowledge Graph
[MÊS 5+]       → Fase 7: Learning Engine + AI Orchestration
```

---

*Análise gerada em 2026-07-04 — baseada no schema v2026.1 vs. AxionIA Platform v4.0*  
*Referência: ESPINHA-DORSAL-AXION-SISTEMAS-2026.md / ANALISE-SISTEMA-COMPLETA-2026-07-03T11-35-18.json*
