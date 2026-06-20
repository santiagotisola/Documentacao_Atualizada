# UNIFIED - ARQUITETURA E PLANEJAMENTO

**Data de Consolidacao:** 2026-06-20  
**Arquivos consolidados:** 3

---

---

## ORIGEM: PLANO-ORGANIZACIONAL-UNIFICACAO.md

# ðŸ—ï¸ Plano Organizacional - UnificaÃ§Ã£o Completa do Ecossistema

**Axion Intelligence Platform**  
**Data:** 2026-06-20  
**Objetivo:** Unificar toda a estrutura em um Ãºnico local centralizado

---

## ðŸŽ¯ VISÃƒO GERAL

### **SituaÃ§Ã£o Atual: Fragmentada**

```
âŒ PROBLEMA: Dados espalhados em mÃºltiplos locais

Axion.Docs/
â”œâ”€â”€ ðŸ“ AxHub/               â† DocumentaÃ§Ã£o AxHub
â”‚   â”œâ”€â”€ docs-portal/
â”‚   â”œâ”€â”€ Database/
â”‚   â””â”€â”€ widget/
â”œâ”€â”€ ðŸ“ AxTon/               â† DocumentaÃ§Ã£o AxTon
â”‚   â”œâ”€â”€ docs-portal/
â”‚   â”œâ”€â”€ Database/
â”‚   â””â”€â”€ widget/
â”œâ”€â”€ ðŸ“ AxCross/             â† DocumentaÃ§Ã£o AxCross
â”‚   â”œâ”€â”€ docs-portal/
â”‚   â”œâ”€â”€ Database/
â”‚   â””â”€â”€ widget/
â”œâ”€â”€ ðŸ“ axion-ia-api/        â† Backend API
â”‚   â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ uploads/
â”‚   â””â”€â”€ reports/
â”œâ”€â”€ ðŸ“ axion-ia-panel/      â† Frontend React
â”‚   â”œâ”€â”€ src/
â”‚   â””â”€â”€ dist/
â”œâ”€â”€ ðŸ“ docs-portal/         â† Portal unificado (legacy)
â”œâ”€â”€ ðŸ“„ 100+ arquivos .md na raiz (anÃ¡lises, relatÃ³rios, guias)
â”œâ”€â”€ ðŸ“„ Scripts .ps1 e .mjs espalhados
â”œâ”€â”€ ðŸ“„ Dados .json e .csv espalhados
â””â”€â”€ ðŸ“„ PDFs e vÃ­deos na raiz

Problemas:
âŒ Dificuldade de encontrar arquivos
âŒ DuplicaÃ§Ã£o de estruturas (3x docs-portal)
âŒ Backup complexo (mÃºltiplos locais)
âŒ Relacionamento entre processos nÃ£o estÃ¡ claro
âŒ Mesmas funcionalidades duplicadas
```

---

### **VisÃ£o Futura: Unificada**

```
âœ… SOLUÃ‡ÃƒO: Estrutura Ãºnica e centralizada

Axion-Unified/
â”œâ”€â”€ ðŸ“‚ core/                    â† CORE: AplicaÃ§Ãµes principais
â”‚   â”œâ”€â”€ api/                    â† Backend (axion-ia-api)
â”‚   â”œâ”€â”€ panel/                  â† Frontend (axion-ia-panel)
â”‚   â””â”€â”€ shared/                 â† CÃ³digo compartilhado
â”‚
â”œâ”€â”€ ðŸ“‚ products/                â† PRODUTOS: Sistemas Axion
â”‚   â”œâ”€â”€ axhub/
â”‚   â”œâ”€â”€ axton/
â”‚   â””â”€â”€ axcross/
â”‚
â”œâ”€â”€ ðŸ“‚ docs/                    â† DOCUMENTAÃ‡ÃƒO: Ãšnica e centralizada
â”‚   â”œâ”€â”€ portals/                â† Portais Docusaurus
â”‚   â”œâ”€â”€ guides/                 â† Guias e manuais
â”‚   â”œâ”€â”€ analysis/               â† AnÃ¡lises tÃ©cnicas
â”‚   â””â”€â”€ references/             â† ReferÃªncias e specs
â”‚
â”œâ”€â”€ ðŸ“‚ data/                    â† DADOS: Base Ãºnica
â”‚   â”œâ”€â”€ databases/              â† SQL schemas
â”‚   â”œâ”€â”€ knowledge-base/         â† KB unificada
â”‚   â”œâ”€â”€ uploads/                â† Arquivos enviados
â”‚   â””â”€â”€ exports/                â† RelatÃ³rios gerados
â”‚
â”œâ”€â”€ ðŸ“‚ tools/                   â† FERRAMENTAS: Scripts e utilitÃ¡rios
â”‚   â”œâ”€â”€ scripts/                â† Scripts PowerShell/Node
â”‚   â”œâ”€â”€ automation/             â† AutomaÃ§Ãµes
â”‚   â””â”€â”€ migration/              â† Scripts de migraÃ§Ã£o
â”‚
â”œâ”€â”€ ðŸ“‚ resources/               â† RECURSOS: Assets e mÃ­dia
â”‚   â”œâ”€â”€ media/                  â† VÃ­deos e imagens
â”‚   â”œâ”€â”€ pdfs/                   â† Documentos PDF
â”‚   â””â”€â”€ templates/              â† Templates
â”‚
â””â”€â”€ ðŸ“‚ config/                  â† CONFIGURAÃ‡ÃƒO: Configs centralizadas
    â”œâ”€â”€ environments/
    â”œâ”€â”€ deployments/
    â””â”€â”€ backups/

BenefÃ­cios:
âœ… Estrutura lÃ³gica e intuitiva
âœ… FÃ¡cil localizaÃ§Ã£o de arquivos
âœ… Backup simplificado (1 pasta raiz)
âœ… Relacionamentos claros
âœ… Processos unificados
```

---

## ðŸ“‹ TAXONOMIA DE PROCESSOS

### **CritÃ©rios de ClassificaÃ§Ã£o**

#### **1. ðŸ” INVESTIGADORES (Validators)**
**DefiniÃ§Ã£o:** Processos que investigam, auditam e validam dados/sistemas

**CaracterÃ­sticas:**
- Verificam conformidade
- Identificam anomalias
- Geram relatÃ³rios de auditoria
- NÃ£o modificam dados (apenas lÃªem)

**Processos Identificados:**
```
modules/investigators/
â”œâ”€â”€ validation-manager/      â† ValidaÃ§Ã£o de sistemas web
â”œâ”€â”€ visual-validator/         â† ValidaÃ§Ã£o visual de UI
â”œâ”€â”€ varco-monitor/           â† Monitor de cÃ¢meras VARCO
â”œâ”€â”€ alert-flow-validator/    â† ValidaÃ§Ã£o de fluxo de alertas
â””â”€â”€ duplicity-auditor/       â† Auditoria de duplicidades

MÃ©tricas:
- 5 investigadores
- 28 endpoints
- LÃ³gica: read-only
- Output: RelatÃ³rios de conformidade
```

---

#### **2. ðŸ“Š ANALISADORES (Analyzers)**
**DefiniÃ§Ã£o:** Processos que processam dados e geram insights

**CaracterÃ­sticas:**
- Processam grandes volumes de dados
- Aplicam algoritmos complexos
- Geram anÃ¡lises e mÃ©tricas
- Podem usar IA/ML

**Processos Identificados:**
```
modules/analyzers/
â”œâ”€â”€ measurement-analyzer/    â† AnÃ¡lise de mediÃ§Ãµes
â”œâ”€â”€ image-analyzer/          â† AnÃ¡lise de imagens (OCR)
â”œâ”€â”€ compliance-analyzer/     â† AnÃ¡lise de conformidade
â”œâ”€â”€ tender-analyzer/         â† AnÃ¡lise de editais
â””â”€â”€ strategic-reader/        â† Leitura estratÃ©gica 80/20

MÃ©tricas:
- 5 analisadores
- 40 endpoints
- LÃ³gica: processamento intensivo
- Output: Insights e mÃ©tricas
```

---

#### **3. ðŸ“„ GERADORES DE RELATÃ“RIOS (Reporters)**
**DefiniÃ§Ã£o:** Processos que compilam dados em relatÃ³rios formatados

**CaracterÃ­sticas:**
- Agregam dados de mÃºltiplas fontes
- Formatam em layouts especÃ­ficos
- Exportam em diversos formatos
- Focados em apresentaÃ§Ã£o

**Processos Identificados:**
```
modules/reporters/
â”œâ”€â”€ contract-reporter/       â† RelatÃ³rios por contrato
â”œâ”€â”€ flow-reporter/           â† RelatÃ³rios de fluxo
â”œâ”€â”€ hours-reporter/          â† Planilha de horas
â””â”€â”€ sla-reporter/            â† RelatÃ³rio de SLA

MÃ©tricas:
- 4 geradores
- 11 endpoints
- LÃ³gica: compilaÃ§Ã£o e formataÃ§Ã£o
- Output: RelatÃ³rios prontos (PDF/Excel/CSV)
```

---

#### **4. ðŸ¤– PROCESSADORES IA (AI Processors)**
**DefiniÃ§Ã£o:** Processos que utilizam inteligÃªncia artificial

**CaracterÃ­sticas:**
- Usam modelos de linguagem (OpenAI)
- Processamento de linguagem natural
- Embeddings e classificaÃ§Ã£o
- Aprendizado e treinamento

**Processos Identificados:**
```
modules/ai-processors/
â”œâ”€â”€ chat-assistant/          â† Assistente de chat
â”œâ”€â”€ agent-orchestrator/      â† Orquestrador de agentes
â”œâ”€â”€ helpdesk-ai/            â† IA para helpdesk
â”œâ”€â”€ confidence-manager/      â† Gerenciador de confianÃ§a
â””â”€â”€ classifier/              â† Classificador de intenÃ§Ãµes

Core IA:
â”œâ”€â”€ engine/                  â† Motor de IA
â”œâ”€â”€ embeddings/              â† GeraÃ§Ã£o de embeddings
â””â”€â”€ training/                â† Sistema de treinamento

MÃ©tricas:
- 5 processadores
- 36 endpoints
- LÃ³gica: IA/ML
- Output: Respostas inteligentes
```

---

#### **5. ðŸ­ GERADORES (Generators)**
**DefiniÃ§Ã£o:** Processos que criam artefatos (docs, specs, roadmaps)

**CaracterÃ­sticas:**
- Criam documentos estruturados
- Seguem templates
- Geram cÃ³digo ou markdown
- Automatizam criaÃ§Ã£o de artefatos

**Processos Identificados:**
```
modules/generators/
â”œâ”€â”€ doc-generator/           â† Gerador de documentaÃ§Ã£o
â”œâ”€â”€ roadmap-generator/       â† Gerador de roadmaps
â””â”€â”€ spec-generator/          â† Gerador de especificaÃ§Ãµes

MÃ©tricas:
- 3 geradores
- 13 endpoints
- LÃ³gica: criaÃ§Ã£o de artefatos
- Output: Documentos/Specs/Roadmaps
```

---

#### **6. ðŸ”Œ CONECTORES (Connectors)**
**DefiniÃ§Ã£o:** Processos que integram sistemas externos

**CaracterÃ­sticas:**
- Conectam com APIs/Databases externas
- Sincronizam dados
- NÃ£o processam, apenas transportam
- Gerenciam conexÃµes

**Processos Identificados:**
```
modules/connectors/
â”œâ”€â”€ axhub-connector/         â† IntegraÃ§Ã£o AxHub SQL Server
â”œâ”€â”€ axton-connector/         â† IntegraÃ§Ã£o AxTon SQL Server
â”œâ”€â”€ axcross-connector/       â† IntegraÃ§Ã£o AxCross SQL Server
â”œâ”€â”€ whatsapp-connector/      â† IntegraÃ§Ã£o WhatsApp
â”œâ”€â”€ jitbit-connector/        â† IntegraÃ§Ã£o Jitbit Helpdesk
â””â”€â”€ pncp-connector/          â† IntegraÃ§Ã£o PNCP (gov)

MÃ©tricas:
- 6 conectores
- 56 endpoints
- LÃ³gica: transporte de dados
- Output: Dados sincronizados
```

---

#### **7. ðŸ“š REPOSITÃ“RIOS (Repositories)**
**DefiniÃ§Ã£o:** Processos que armazenam e recuperam dados estruturados

**CaracterÃ­sticas:**
- CRUD de entidades
- PersistÃªncia de dados
- Consultas estruturadas
- Gerenciamento de estado

**Processos Identificados:**
```
modules/repositories/
â”œâ”€â”€ knowledge-base/          â† Base de conhecimento
â”œâ”€â”€ sources-registry/        â† Registro de fontes
â””â”€â”€ crm-repository/          â† CRM (contatos/clientes/equipamentos)

MÃ©tricas:
- 3 repositÃ³rios
- 32 endpoints
- LÃ³gica: CRUD
- Output: Entidades persistidas
```

---

#### **8. âš™ï¸ SERVIÃ‡OS DE SISTEMA (System Services)**
**DefiniÃ§Ã£o:** Processos de infraestrutura e suporte

**CaracterÃ­sticas:**
- ConfiguraÃ§Ã£o
- Monitoramento
- Logs e auditoria
- Upload de arquivos

**Processos Identificados:**
```
modules/system-services/
â”œâ”€â”€ configuration/           â† Gerenciamento de config
â”œâ”€â”€ health-monitor/          â† Health checks
â”œâ”€â”€ log-manager/             â† Gerenciamento de logs
â””â”€â”€ upload-service/          â† Upload de arquivos

MÃ©tricas:
- 4 serviÃ§os
- 9 endpoints
- LÃ³gica: infraestrutura
- Output: OperaÃ§Ãµes de sistema
```

---

## ðŸ”— MATRIZ DE RELACIONAMENTOS

### **Mapa de DependÃªncias entre Processos**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    CAMADA DE APRESENTAÃ‡ÃƒO                    â”‚
â”‚                   axion-ia-panel (React)                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                     â”‚
                     â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     CAMADA DE API                            â”‚
â”‚                  axion-ia-api (Express)                      â”‚
â””â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
   â”‚      â”‚      â”‚      â”‚      â”‚      â”‚      â”‚      â”‚
   â†“      â†“      â†“      â†“      â†“      â†“      â†“      â†“
â”Œâ”€â”€â”€â”€â”€â”â”Œâ”€â”€â”€â”€â”€â”â”Œâ”€â”€â”€â”€â”€â”â”Œâ”€â”€â”€â”€â”€â”â”Œâ”€â”€â”€â”€â”€â”â”Œâ”€â”€â”€â”€â”€â”â”Œâ”€â”€â”€â”€â”€â”â”Œâ”€â”€â”€â”€â”€â”
â”‚ ðŸ”  â”‚â”‚ ðŸ“Š  â”‚â”‚ ðŸ“„  â”‚â”‚ ðŸ¤–  â”‚â”‚ ðŸ­  â”‚â”‚ ðŸ”Œ  â”‚â”‚ ðŸ“š  â”‚â”‚ âš™ï¸  â”‚
â”‚INVESâ”‚â”‚ANALYâ”‚â”‚REPORâ”‚â”‚AI   â”‚â”‚GENERâ”‚â”‚CONECâ”‚â”‚REPOSâ”‚â”‚SYST â”‚
â”‚TIGA â”‚â”‚ZERS â”‚â”‚TERS â”‚â”‚PROC â”‚â”‚ATORSâ”‚â”‚TORS â”‚â”‚ITOR â”‚â”‚SERV â”‚
â”‚DORESâ”‚â”‚     â”‚â”‚     â”‚â”‚     â”‚â”‚     â”‚â”‚     â”‚â”‚IES  â”‚â”‚ICES â”‚
â””â”€â”€â”€â”€â”€â”˜â””â”€â”€â”€â”€â”€â”˜â””â”€â”€â”€â”€â”€â”˜â””â”€â”€â”¬â”€â”€â”˜â””â”€â”€â”€â”€â”€â”˜â””â”€â”€â”¬â”€â”€â”˜â””â”€â”€â”€â”€â”€â”˜â””â”€â”€â”€â”€â”€â”˜
                         â”‚              â”‚
                         â†“              â†“
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚ OpenAI  â”‚   â”‚External â”‚
                    â”‚   API   â”‚   â”‚ Systems â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                         â†‘              â†‘
                         â”‚              â”‚
                         â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜
                                â”‚
                         â”Œâ”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”
                         â”‚  DATA LAYER  â”‚
                         â”‚ MongoDB      â”‚
                         â”‚ SQL Server   â”‚
                         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### **Relacionamentos Funcionais**

#### **Investigadores â†’ Analisadores**
```
VARCO Monitor â”€â”€[envia dados]â”€â”€â†’ Measurement Analyzer
                                   â”‚
                                   â†“
                              [processa mÃ©tricas]
                                   â”‚
                                   â†“
Duplicity Auditor â†â”€â”€[recebe insights]â”€â”€â”˜
```

#### **Analisadores â†’ Geradores de RelatÃ³rios**
```
Measurement Analyzer â”€â”€â”€â”€â”€â”
Image Analyzer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
Compliance Analyzer â”€â”€â”€â”€â”€â”€â”¼â”€â”€â†’ Contract Reporter â†’ [PDF]
Tender Analyzer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
Strategic Reader â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### **AI Processors â†’ Todos**
```
Chat Assistant â”€â”€[usa]â”€â”€â†’ Knowledge Base
                          â”‚
Agent Orchestrator â”€â”€[orquestra]â”€â”€â†’ Todos os mÃ³dulos
                          â”‚
Helpdesk AI â”€â”€[usa]â”€â”€â†’ Jitbit Connector
                          â”‚
Confidence Manager â”€â”€[alimenta]â”€â”€â†’ Todos os Analisadores
```

#### **Conectores â†’ RepositÃ³rios**
```
AxHub Connector â”€â”€â”€â”€â”
AxTon Connector â”€â”€â”€â”€â”¼â”€â”€â†’ CRM Repository â†’ [MongoDB]
AxCross Connector â”€â”€â”˜
```

---

## ðŸ—ï¸ ESTRUTURA UNIFICADA PROPOSTA

### **Estrutura Completa**

```
C:/Projects/Axion-Unified/
â”‚
â”œâ”€â”€ ðŸ“‚ core/                              â† APLICAÃ‡Ã•ES PRINCIPAIS
â”‚   â”œâ”€â”€ api/                              â† Backend (ex: axion-ia-api)
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â”œâ”€â”€ modules/                  â† MÃ³dulos organizados
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ investigators/        â† ðŸ” Investigadores
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ validation-manager/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ visual-validator/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ varco-monitor/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ alert-flow-validator/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ duplicity-auditor/
â”‚   â”‚   â”‚   â”‚   â”‚
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ analyzers/            â† ðŸ“Š Analisadores
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ measurement-analyzer/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ image-analyzer/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ compliance-analyzer/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ tender-analyzer/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ strategic-reader/
â”‚   â”‚   â”‚   â”‚   â”‚
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ reporters/            â† ðŸ“„ Geradores de RelatÃ³rios
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ contract-reporter/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ flow-reporter/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ hours-reporter/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ sla-reporter/
â”‚   â”‚   â”‚   â”‚   â”‚
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ai-processors/        â† ðŸ¤– Processadores IA
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ chat-assistant/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ agent-orchestrator/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ helpdesk-ai/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ confidence-manager/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ classifier/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ core/             â† Motor IA
â”‚   â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ engine.js
â”‚   â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ embeddings/
â”‚   â”‚   â”‚   â”‚   â”‚       â””â”€â”€ training/
â”‚   â”‚   â”‚   â”‚   â”‚
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ generators/           â† ðŸ­ Geradores
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ doc-generator/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ roadmap-generator/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ spec-generator/
â”‚   â”‚   â”‚   â”‚   â”‚
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ connectors/           â† ðŸ”Œ Conectores
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axhub-connector/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axton-connector/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axcross-connector/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ whatsapp-connector/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ jitbit-connector/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ pncp-connector/
â”‚   â”‚   â”‚   â”‚   â”‚
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ repositories/         â† ðŸ“š RepositÃ³rios
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ knowledge-base/
â”‚   â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ sources-registry/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ crm-repository/
â”‚   â”‚   â”‚   â”‚   â”‚
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ system-services/      â† âš™ï¸ ServiÃ§os de Sistema
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ configuration/
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ health-monitor/
â”‚   â”‚   â”‚   â”‚       â”œâ”€â”€ log-manager/
â”‚   â”‚   â”‚   â”‚       â””â”€â”€ upload-service/
â”‚   â”‚   â”‚   â”‚
â”‚   â”‚   â”‚   â”œâ”€â”€ shared/                   â† CÃ³digo compartilhado
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ middleware/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ types/
â”‚   â”‚   â”‚   â”‚
â”‚   â”‚   â”‚   â”œâ”€â”€ database/                 â† Camada de dados
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ mongodb/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ mssql/
â”‚   â”‚   â”‚   â”‚
â”‚   â”‚   â”‚   â”œâ”€â”€ routes.js
â”‚   â”‚   â”‚   â””â”€â”€ app.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ tests/                        â† Testes
â”‚   â”‚   â”‚   â”œâ”€â”€ unit/
â”‚   â”‚   â”‚   â”œâ”€â”€ integration/
â”‚   â”‚   â”‚   â””â”€â”€ e2e/
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ package.json
â”‚   â”‚   â””â”€â”€ README.md
â”‚   â”‚
â”‚   â”œâ”€â”€ panel/                            â† Frontend (ex: axion-ia-panel)
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â””â”€â”€ App.jsx
â”‚   â”‚   â”œâ”€â”€ public/
â”‚   â”‚   â”œâ”€â”€ package.json
â”‚   â”‚   â””â”€â”€ README.md
â”‚   â”‚
â”‚   â””â”€â”€ shared/                           â† Compartilhado entre API/Panel
â”‚       â”œâ”€â”€ types/
â”‚       â”œâ”€â”€ constants/
â”‚       â””â”€â”€ utils/
â”‚
â”œâ”€â”€ ðŸ“‚ products/                          â† PRODUTOS AXION
â”‚   â”œâ”€â”€ axhub/
â”‚   â”‚   â”œâ”€â”€ docs/                         â† Docs especÃ­ficos do produto
â”‚   â”‚   â”œâ”€â”€ database/                     â† Schema SQL
â”‚   â”‚   â”‚   â””â”€â”€ AxHub.sql
â”‚   â”‚   â”œâ”€â”€ widgets/                      â† Widgets especÃ­ficos
â”‚   â”‚   â””â”€â”€ README.md
â”‚   â”‚
â”‚   â”œâ”€â”€ axton/
â”‚   â”‚   â”œâ”€â”€ docs/
â”‚   â”‚   â”œâ”€â”€ database/
â”‚   â”‚   â”‚   â””â”€â”€ AxTon.sql
â”‚   â”‚   â”œâ”€â”€ widgets/
â”‚   â”‚   â””â”€â”€ README.md
â”‚   â”‚
â”‚   â””â”€â”€ axcross/
â”‚       â”œâ”€â”€ docs/
â”‚       â”œâ”€â”€ database/
â”‚       â”‚   â””â”€â”€ AxCross.sql
â”‚       â”œâ”€â”€ widgets/
â”‚       â””â”€â”€ README.md
â”‚
â”œâ”€â”€ ðŸ“‚ docs/                              â† DOCUMENTAÃ‡ÃƒO UNIFICADA
â”‚   â”‚
â”‚   â”œâ”€â”€ portals/                          â† Portais Docusaurus
â”‚   â”‚   â”œâ”€â”€ axhub-portal/
â”‚   â”‚   â”‚   â”œâ”€â”€ docs/
â”‚   â”‚   â”‚   â”œâ”€â”€ docusaurus.config.ts
â”‚   â”‚   â”‚   â””â”€â”€ sidebars.ts
â”‚   â”‚   â”œâ”€â”€ axton-portal/
â”‚   â”‚   â””â”€â”€ axcross-portal/
â”‚   â”‚
â”‚   â”œâ”€â”€ guides/                           â† Guias e manuais
â”‚   â”‚   â”œâ”€â”€ user-guides/
â”‚   â”‚   â”‚   â”œâ”€â”€ axhub/
â”‚   â”‚   â”‚   â”œâ”€â”€ axton/
â”‚   â”‚   â”‚   â””â”€â”€ axcross/
â”‚   â”‚   â”œâ”€â”€ admin-guides/
â”‚   â”‚   â”œâ”€â”€ developer-guides/
â”‚   â”‚   â””â”€â”€ troubleshooting/
â”‚   â”‚
â”‚   â”œâ”€â”€ analysis/                         â† AnÃ¡lises tÃ©cnicas
â”‚   â”‚   â”œâ”€â”€ business-analysis/
â”‚   â”‚   â”‚   â”œâ”€â”€ mercado/
â”‚   â”‚   â”‚   â”œâ”€â”€ estrategia/
â”‚   â”‚   â”‚   â””â”€â”€ comercial/
â”‚   â”‚   â”œâ”€â”€ technical-analysis/
â”‚   â”‚   â”‚   â”œâ”€â”€ diagnosticos/
â”‚   â”‚   â”‚   â”œâ”€â”€ validacoes/
â”‚   â”‚   â”‚   â””â”€â”€ comparativos/
â”‚   â”‚   â””â”€â”€ operational-analysis/
â”‚   â”‚       â”œâ”€â”€ medicao/
â”‚   â”‚       â”œâ”€â”€ heartbeat/
â”‚   â”‚       â””â”€â”€ performance/
â”‚   â”‚
â”‚   â””â”€â”€ references/                       â† ReferÃªncias tÃ©cnicas
â”‚       â”œâ”€â”€ api/
â”‚       â”‚   â””â”€â”€ openapi.json
â”‚       â”œâ”€â”€ architecture/
â”‚       â”‚   â”œâ”€â”€ MAPEAMENTO-FUNCIONALIDADES.md
â”‚       â”‚   â”œâ”€â”€ DIAGRAMA-ARQUITETURA.md
â”‚       â”‚   â””â”€â”€ PLANO-ORGANIZACIONAL.md
â”‚       â”œâ”€â”€ specs/
â”‚       â””â”€â”€ roadmaps/
â”‚
â”œâ”€â”€ ðŸ“‚ data/                              â† BASE ÃšNICA DE DADOS
â”‚   â”‚
â”‚   â”œâ”€â”€ databases/                        â† Schemas SQL
â”‚   â”‚   â”œâ”€â”€ axhub/
â”‚   â”‚   â”‚   â”œâ”€â”€ schema.sql
â”‚   â”‚   â”‚   â””â”€â”€ migrations/
â”‚   â”‚   â”œâ”€â”€ axton/
â”‚   â”‚   â””â”€â”€ axcross/
â”‚   â”‚
â”‚   â”œâ”€â”€ knowledge-base/                   â† KB unificada
â”‚   â”‚   â”œâ”€â”€ embeddings/
â”‚   â”‚   â”œâ”€â”€ training-data/
â”‚   â”‚   â””â”€â”€ kb.json
â”‚   â”‚
â”‚   â”œâ”€â”€ uploads/                          â† Arquivos enviados
â”‚   â”‚   â”œâ”€â”€ images/
â”‚   â”‚   â”‚   â”œâ”€â”€ axhub/
â”‚   â”‚   â”‚   â”œâ”€â”€ axton/
â”‚   â”‚   â”‚   â””â”€â”€ axcross/
â”‚   â”‚   â”œâ”€â”€ documents/
â”‚   â”‚   â””â”€â”€ contexts/
â”‚   â”‚
â”‚   â”œâ”€â”€ exports/                          â† RelatÃ³rios gerados
â”‚   â”‚   â”œâ”€â”€ reports/
â”‚   â”‚   â”‚   â”œâ”€â”€ contracts/
â”‚   â”‚   â”‚   â”œâ”€â”€ flows/
â”‚   â”‚   â”‚   â””â”€â”€ hours/
â”‚   â”‚   â”œâ”€â”€ logs/
â”‚   â”‚   â””â”€â”€ screenshots/
â”‚   â”‚
â”‚   â””â”€â”€ cache/                            â† Cache de dados
â”‚       â””â”€â”€ temp/
â”‚
â”œâ”€â”€ ðŸ“‚ tools/                             â† FERRAMENTAS E SCRIPTS
â”‚   â”‚
â”‚   â”œâ”€â”€ scripts/                          â† Scripts de utilidades
â”‚   â”‚   â”œâ”€â”€ powershell/
â”‚   â”‚   â”‚   â”œâ”€â”€ iniciar.ps1
â”‚   â”‚   â”‚   â”œâ”€â”€ encerrar.ps1
â”‚   â”‚   â”‚   â”œâ”€â”€ gerar-pdf.ps1
â”‚   â”‚   â”‚   â””â”€â”€ backup.ps1
â”‚   â”‚   â””â”€â”€ node/
â”‚   â”‚       â”œâ”€â”€ gerar-kb.mjs
â”‚   â”‚       â”œâ”€â”€ analisar-equipamentos.mjs
â”‚   â”‚       â””â”€â”€ validar-credenciais.mjs
â”‚   â”‚
â”‚   â”œâ”€â”€ automation/                       â† AutomaÃ§Ãµes
â”‚   â”‚   â”œâ”€â”€ ci-cd/
â”‚   â”‚   â”œâ”€â”€ deploy/
â”‚   â”‚   â””â”€â”€ monitoring/
â”‚   â”‚
â”‚   â””â”€â”€ migration/                        â† Scripts de migraÃ§Ã£o
â”‚       â”œâ”€â”€ migrate-to-unified.ps1
â”‚       â”œâ”€â”€ consolidate-docs.ps1
â”‚       â””â”€â”€ merge-databases.ps1
â”‚
â”œâ”€â”€ ðŸ“‚ resources/                         â† RECURSOS E MÃDIA
â”‚   â”‚
â”‚   â”œâ”€â”€ media/                            â† VÃ­deos e imagens
â”‚   â”‚   â”œâ”€â”€ videos/
â”‚   â”‚   â”‚   â”œâ”€â”€ axton-apresentacao.mp4
â”‚   â”‚   â”‚   â””â”€â”€ axton-narrado.mp4
â”‚   â”‚   â””â”€â”€ images/
â”‚   â”‚       â””â”€â”€ logos/
â”‚   â”‚
â”‚   â”œâ”€â”€ pdfs/                             â† Documentos PDF
â”‚   â”‚   â”œâ”€â”€ manuais/
â”‚   â”‚   â”‚   â”œâ”€â”€ Manual-AxHub-v1.0.0.pdf
â”‚   â”‚   â”‚   â”œâ”€â”€ Manual-AxTon-v1.0.0.pdf
â”‚   â”‚   â”‚   â””â”€â”€ Manual-AxCross-v1.0.0.pdf
â”‚   â”‚   â””â”€â”€ apresentacoes/
â”‚   â”‚
â”‚   â””â”€â”€ templates/                        â† Templates
â”‚       â”œâ”€â”€ word/
â”‚       â”œâ”€â”€ excel/
â”‚       â””â”€â”€ powerpoint/
â”‚
â”œâ”€â”€ ðŸ“‚ config/                            â† CONFIGURAÃ‡Ã•ES
â”‚   â”‚
â”‚   â”œâ”€â”€ environments/                     â† Configs por ambiente
â”‚   â”‚   â”œâ”€â”€ .env.development
â”‚   â”‚   â”œâ”€â”€ .env.staging
â”‚   â”‚   â””â”€â”€ .env.production
â”‚   â”‚
â”‚   â”œâ”€â”€ deployments/                      â† ConfiguraÃ§Ãµes de deploy
â”‚   â”‚   â”œâ”€â”€ docker-compose.yml
â”‚   â”‚   â””â”€â”€ kubernetes/
â”‚   â”‚
â”‚   â””â”€â”€ backups/                          â† EstratÃ©gia de backup
â”‚       â”œâ”€â”€ backup-config.json
â”‚       â””â”€â”€ restore-procedures.md
â”‚
â”œâ”€â”€ ðŸ“„ README.md                          â† DocumentaÃ§Ã£o principal
â”œâ”€â”€ ðŸ“„ CHANGELOG.md
â”œâ”€â”€ ðŸ“„ LICENSE
â””â”€â”€ ðŸ“„ .gitignore
```

---

## ðŸ“Š PLANO DE UNIFICAÃ‡ÃƒO

### **Fase 1: PreparaÃ§Ã£o (2 dias)**

#### **Dia 1: Criar Estrutura**

**Checklist:**
- [ ] Criar pasta raiz `Axion-Unified/`
- [ ] Criar estrutura completa de pastas
- [ ] Criar README.md em cada pasta principal
- [ ] Configurar Git na nova estrutura

**Script de CriaÃ§Ã£o:**

```powershell
# tools/migration/01-create-unified-structure.ps1

$root = "C:\Projects\Axion-Unified"

Write-Host "ðŸ—ï¸  Criando estrutura unificada..." -ForegroundColor Cyan

# Core
$coreDirs = @(
    "core\api\src\modules\investigators",
    "core\api\src\modules\analyzers",
    "core\api\src\modules\reporters",
    "core\api\src\modules\ai-processors\core",
    "core\api\src\modules\generators",
    "core\api\src\modules\connectors",
    "core\api\src\modules\repositories",
    "core\api\src\modules\system-services",
    "core\api\src\shared",
    "core\api\src\database\mongodb",
    "core\api\src\database\mssql",
    "core\api\tests",
    "core\panel\src",
    "core\shared"
)

# Products
$productDirs = @(
    "products\axhub\docs",
    "products\axhub\database",
    "products\axhub\widgets",
    "products\axton\docs",
    "products\axton\database",
    "products\axton\widgets",
    "products\axcross\docs",
    "products\axcross\database",
    "products\axcross\widgets"
)

# Docs
$docsDirs = @(
    "docs\portals\axhub-portal",
    "docs\portals\axton-portal",
    "docs\portals\axcross-portal",
    "docs\guides\user-guides",
    "docs\guides\admin-guides",
    "docs\guides\developer-guides",
    "docs\analysis\business-analysis",
    "docs\analysis\technical-analysis",
    "docs\analysis\operational-analysis",
    "docs\references\api",
    "docs\references\architecture",
    "docs\references\specs"
)

# Data
$dataDirs = @(
    "data\databases\axhub",
    "data\databases\axton",
    "data\databases\axcross",
    "data\knowledge-base\embeddings",
    "data\uploads\images",
    "data\uploads\documents",
    "data\exports\reports",
    "data\exports\logs",
    "data\cache"
)

# Tools
$toolsDirs = @(
    "tools\scripts\powershell",
    "tools\scripts\node",
    "tools\automation",
    "tools\migration"
)

# Resources
$resourcesDirs = @(
    "resources\media\videos",
    "resources\media\images",
    "resources\pdfs\manuais",
    "resources\templates"
)

# Config
$configDirs = @(
    "config\environments",
    "config\deployments",
    "config\backups"
)

$allDirs = $coreDirs + $productDirs + $docsDirs + $dataDirs + $toolsDirs + $resourcesDirs + $configDirs

foreach ($dir in $allDirs) {
    $fullPath = Join-Path $root $dir
    New-Item -Path $fullPath -ItemType Directory -Force | Out-Null
    Write-Host "âœ… Criado: $dir" -ForegroundColor Green
}

Write-Host "`nâœ… Estrutura criada com sucesso!" -ForegroundColor Green
Write-Host "ðŸ“‚ Local: $root" -ForegroundColor Cyan
```

---

#### **Dia 2: Mapear Arquivos**

**Criar mapa de migraÃ§Ã£o:**

```powershell
# tools/migration/02-map-files.ps1

$source = "C:\Users\Santiago\Axiondocs\Axion.Docs"
$target = "C:\Projects\Axion-Unified"

# Criar arquivo de mapeamento
$mapFile = "$target\tools\migration\migration-map.json"

$map = @{
    # Core API
    "axion-ia-api\src" = "core\api\src"
    "axion-ia-api\package.json" = "core\api\package.json"
    
    # Core Panel
    "axion-ia-panel\src" = "core\panel\src"
    "axion-ia-panel\package.json" = "core\panel\package.json"
    
    # Products
    "AxHub\Database\AxHub.sql" = "products\axhub\database\schema.sql"
    "AxTon\Database" = "products\axton\database"
    "AxCross\Database\AxCross.sql" = "products\axcross\database\schema.sql"
    
    # Docs Portals
    "AxHub\docs-portal" = "docs\portals\axhub-portal"
    "AxTon\docs-portal" = "docs\portals\axton-portal"
    "AxCross\docs-portal" = "docs\portals\axcross-portal"
    
    # AnÃ¡lises
    "ANALISE-*.md" = "docs\analysis\technical-analysis"
    "DIAGNOSTICO-*.md" = "docs\analysis\operational-analysis"
    "VALIDACAO-*.md" = "docs\analysis\technical-analysis"
    
    # Guias
    "GUIA-*.md" = "docs\guides\user-guides"
    "MANUAL-*.md" = "docs\guides\user-guides"
    
    # Scripts
    "*.ps1" = "tools\scripts\powershell"
    "*.mjs" = "tools\scripts\node"
    "*.cjs" = "tools\scripts\node"
    
    # Recursos
    "*.mp4" = "resources\media\videos"
    "*.pdf" = "resources\pdfs\manuais"
    
    # Data
    "axion-ia-api\uploads" = "data\uploads"
    "axion-ia-api\reports" = "data\exports\reports"
    "axion-ia-api\logs" = "data\exports\logs"
}

$map | ConvertTo-Json -Depth 10 | Out-File $mapFile -Encoding UTF8

Write-Host "âœ… Mapa de migraÃ§Ã£o criado: $mapFile" -ForegroundColor Green
```

---

### **Fase 2: MigraÃ§Ã£o de CÃ³digo (3-5 dias)**

#### **Ordem de MigraÃ§Ã£o:**

```
1. Core API (3 dias)
   â”œâ”€â”€ Dia 1: Estrutura modular + shared
   â”œâ”€â”€ Dia 2: MÃ³dulos (investigators, analyzers, reporters)
   â””â”€â”€ Dia 3: MÃ³dulos (ai-processors, generators, connectors)

2. Core Panel (1 dia)
   â””â”€â”€ Dia 1: Migrar src/ completo

3. Products (1 dia)
   â””â”€â”€ Dia 1: Databases + docs especÃ­ficos
```

**Script de MigraÃ§Ã£o de CÃ³digo:**

```powershell
# tools/migration/03-migrate-code.ps1

param(
    [string]$Source = "C:\Users\Santiago\Axiondocs\Axion.Docs",
    [string]$Target = "C:\Projects\Axion-Unified"
)

function Migrate-API {
    Write-Host "ðŸ”„ Migrando API..." -ForegroundColor Cyan
    
    # Copiar src/
    Copy-Item "$Source\axion-ia-api\src\*" "$Target\core\api\src\" -Recurse -Force
    
    # Copiar package.json
    Copy-Item "$Source\axion-ia-api\package.json" "$Target\core\api\" -Force
    
    # Copiar .env.example
    Copy-Item "$Source\axion-ia-api\.env.example" "$Target\core\api\" -Force
    
    Write-Host "âœ… API migrada" -ForegroundColor Green
}

function Migrate-Panel {
    Write-Host "ðŸ”„ Migrando Panel..." -ForegroundColor Cyan
    
    Copy-Item "$Source\axion-ia-panel\src\*" "$Target\core\panel\src\" -Recurse -Force
    Copy-Item "$Source\axion-ia-panel\package.json" "$Target\core\panel\" -Force
    Copy-Item "$Source\axion-ia-panel\vite.config.js" "$Target\core\panel\" -Force
    
    Write-Host "âœ… Panel migrado" -ForegroundColor Green
}

function Migrate-Products {
    Write-Host "ðŸ”„ Migrando Products..." -ForegroundColor Cyan
    
    # AxHub
    Copy-Item "$Source\AxHub\Database\AxHub.sql" "$Target\products\axhub\database\schema.sql" -Force
    
    # AxTon
    Copy-Item "$Source\AxTon\Database\*" "$Target\products\axton\database\" -Recurse -Force
    
    # AxCross
    Copy-Item "$Source\AxCross\Database\AxCross.sql" "$Target\products\axcross\database\schema.sql" -Force
    
    Write-Host "âœ… Products migrados" -ForegroundColor Green
}

# Executar migraÃ§Ãµes
Migrate-API
Migrate-Panel
Migrate-Products

Write-Host "`nâœ… MigraÃ§Ã£o de cÃ³digo concluÃ­da!" -ForegroundColor Green
```

---

### **Fase 3: MigraÃ§Ã£o de DocumentaÃ§Ã£o (2 dias)**

**Script de MigraÃ§Ã£o de Docs:**

```powershell
# tools/migration/04-migrate-docs.ps1

param(
    [string]$Source = "C:\Users\Santiago\Axiondocs\Axion.Docs",
    [string]$Target = "C:\Projects\Axion-Unified"
)

function Migrate-Portals {
    Write-Host "ðŸ”„ Migrando Portais Docusaurus..." -ForegroundColor Cyan
    
    Copy-Item "$Source\AxHub\docs-portal\*" "$Target\docs\portals\axhub-portal\" -Recurse -Force
    Copy-Item "$Source\AxTon\docs-portal\*" "$Target\docs\portals\axton-portal\" -Recurse -Force
    Copy-Item "$Source\AxCross\docs-portal\*" "$Target\docs\portals\axcross-portal\" -Recurse -Force
    
    Write-Host "âœ… Portais migrados" -ForegroundColor Green
}

function Migrate-Analysis {
    Write-Host "ðŸ”„ Migrando AnÃ¡lises..." -ForegroundColor Cyan
    
    # AnÃ¡lises tÃ©cnicas
    Get-ChildItem "$Source\ANALISE-*.md" | ForEach-Object {
        Copy-Item $_.FullName "$Target\docs\analysis\technical-analysis\" -Force
    }
    
    # DiagnÃ³sticos
    Get-ChildItem "$Source\DIAGNOSTICO-*.md" | ForEach-Object {
        Copy-Item $_.FullName "$Target\docs\analysis\operational-analysis\" -Force
    }
    
    # ValidaÃ§Ãµes
    Get-ChildItem "$Source\VALIDACAO-*.md" | ForEach-Object {
        Copy-Item $_.FullName "$Target\docs\analysis\technical-analysis\" -Force
    }
    
    Write-Host "âœ… AnÃ¡lises migradas" -ForegroundColor Green
}

function Migrate-Guides {
    Write-Host "ðŸ”„ Migrando Guias..." -ForegroundColor Cyan
    
    Get-ChildItem "$Source\GUIA-*.md" | ForEach-Object {
        Copy-Item $_.FullName "$Target\docs\guides\user-guides\" -Force
    }
    
    Get-ChildItem "$Source\MANUAL-*.md" | ForEach-Object {
        Copy-Item $_.FullName "$Target\docs\guides\user-guides\" -Force
    }
    
    Write-Host "âœ… Guias migrados" -ForegroundColor Green
}

function Migrate-References {
    Write-Host "ðŸ”„ Migrando ReferÃªncias..." -ForegroundColor Cyan
    
    # Arquitetura
    $arquivos = @(
        "MAPEAMENTO-FUNCIONALIDADES-SISTEMA.md",
        "DIAGRAMA-ARQUITETURA-REESTRUTURACAO.md",
        "CHECKLIST-REESTRUTURACAO.md",
        "ANALISE-FUNCIONALIDADES-RESUMO-EXECUTIVO.md",
        "PLANO-ORGANIZACIONAL-UNIFICACAO.md"
    )
    
    foreach ($arquivo in $arquivos) {
        if (Test-Path "$Source\$arquivo") {
            Copy-Item "$Source\$arquivo" "$Target\docs\references\architecture\" -Force
        }
    }
    
    # OpenAPI
    if (Test-Path "$Source\openapi.json") {
        Copy-Item "$Source\openapi.json" "$Target\docs\references\api\" -Force
    }
    
    Write-Host "âœ… ReferÃªncias migradas" -ForegroundColor Green
}

# Executar migraÃ§Ãµes
Migrate-Portals
Migrate-Analysis
Migrate-Guides
Migrate-References

Write-Host "`nâœ… MigraÃ§Ã£o de documentaÃ§Ã£o concluÃ­da!" -ForegroundColor Green
```

---

### **Fase 4: MigraÃ§Ã£o de Dados (1 dia)**

**Script de MigraÃ§Ã£o de Dados:**

```powershell
# tools/migration/05-migrate-data.ps1

param(
    [string]$Source = "C:\Users\Santiago\Axiondocs\Axion.Docs",
    [string]$Target = "C:\Projects\Axion-Unified"
)

function Migrate-Uploads {
    Write-Host "ðŸ”„ Migrando Uploads..." -ForegroundColor Cyan
    
    if (Test-Path "$Source\axion-ia-api\uploads") {
        Copy-Item "$Source\axion-ia-api\uploads\*" "$Target\data\uploads\" -Recurse -Force
    }
    
    Write-Host "âœ… Uploads migrados" -ForegroundColor Green
}

function Migrate-Reports {
    Write-Host "ðŸ”„ Migrando RelatÃ³rios..." -ForegroundColor Cyan
    
    if (Test-Path "$Source\axion-ia-api\reports") {
        Copy-Item "$Source\axion-ia-api\reports\*" "$Target\data\exports\reports\" -Recurse -Force
    }
    
    Write-Host "âœ… RelatÃ³rios migrados" -ForegroundColor Green
}

function Migrate-KnowledgeBase {
    Write-Host "ðŸ”„ Migrando Knowledge Base..." -ForegroundColor Cyan
    
    if (Test-Path "$Source\axion-ia-api\src\kb.json") {
        Copy-Item "$Source\axion-ia-api\src\kb.json" "$Target\data\knowledge-base\" -Force
    }
    
    Write-Host "âœ… Knowledge Base migrada" -ForegroundColor Green
}

# Executar migraÃ§Ãµes
Migrate-Uploads
Migrate-Reports
Migrate-KnowledgeBase

Write-Host "`nâœ… MigraÃ§Ã£o de dados concluÃ­da!" -ForegroundColor Green
```

---

### **Fase 5: MigraÃ§Ã£o de Scripts e Recursos (1 dia)**

**Script Completo:**

```powershell
# tools/migration/06-migrate-tools-resources.ps1

param(
    [string]$Source = "C:\Users\Santiago\Axiondocs\Axion.Docs",
    [string]$Target = "C:\Projects\Axion-Unified"
)

function Migrate-Scripts {
    Write-Host "ðŸ”„ Migrando Scripts..." -ForegroundColor Cyan
    
    # PowerShell
    Get-ChildItem "$Source\*.ps1" | ForEach-Object {
        Copy-Item $_.FullName "$Target\tools\scripts\powershell\" -Force
    }
    
    # Node.js
    Get-ChildItem "$Source\*.mjs" | ForEach-Object {
        Copy-Item $_.FullName "$Target\tools\scripts\node\" -Force
    }
    
    Get-ChildItem "$Source\*.cjs" | ForEach-Object {
        Copy-Item $_.FullName "$Target\tools\scripts\node\" -Force
    }
    
    Write-Host "âœ… Scripts migrados" -ForegroundColor Green
}

function Migrate-Media {
    Write-Host "ðŸ”„ Migrando MÃ­dia..." -ForegroundColor Cyan
    
    # VÃ­deos
    Get-ChildItem "$Source\*.mp4" | ForEach-Object {
        Copy-Item $_.FullName "$Target\resources\media\videos\" -Force
    }
    
    # PDFs
    Get-ChildItem "$Source\*.pdf" | ForEach-Object {
        Copy-Item $_.FullName "$Target\resources\pdfs\manuais\" -Force
    }
    
    Write-Host "âœ… MÃ­dia migrada" -ForegroundColor Green
}

# Executar migraÃ§Ãµes
Migrate-Scripts
Migrate-Media

Write-Host "`nâœ… MigraÃ§Ã£o de ferramentas e recursos concluÃ­da!" -ForegroundColor Green
```

---

### **Fase 6: ConfiguraÃ§Ã£o e FinalizaÃ§Ã£o (1 dia)**

**Checklist Final:**
- [ ] Atualizar todos os caminhos nos arquivos de configuraÃ§Ã£o
- [ ] Atualizar imports em cÃ³digo
- [ ] Configurar .gitignore
- [ ] Criar README.md principal
- [ ] Testar build da API
- [ ] Testar build do Panel
- [ ] Validar todos os portais Docusaurus

---

## ðŸ“Š ESTRATÃ‰GIA DE BACKUP

### **Backup Unificado**

```powershell
# tools/scripts/powershell/backup.ps1

$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$source = "C:\Projects\Axion-Unified"
$backupDir = "D:\Backups\Axion-Unified"
$backupFile = "$backupDir\axion-unified-$timestamp.zip"

# Criar diretÃ³rio de backup
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

# Comprimir
Compress-Archive -Path $source -DestinationPath $backupFile -Force

Write-Host "âœ… Backup criado: $backupFile" -ForegroundColor Green

# Limpar backups antigos (manter Ãºltimos 30)
Get-ChildItem $backupDir -Filter "*.zip" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -Skip 30 | 
    Remove-Item -Force

Write-Host "âœ… Backups antigos limpos" -ForegroundColor Green
```

---

## ðŸŽ¯ BENEFÃCIOS DA UNIFICAÃ‡ÃƒO

| Aspecto | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **LocalizaÃ§Ã£o de Arquivos** | 2-5 min | < 30s | ðŸ“‰ -83% |
| **Backup** | 30 min (mÃºltiplos locais) | 5 min (1 local) | ðŸ“‰ -83% |
| **DuplicaÃ§Ã£o** | Alta (3x portais) | Zero | ðŸ“‰ -100% |
| **Relacionamentos** | Obscuros | Claros | ðŸ“ˆ +100% |
| **ManutenÃ§Ã£o** | DifÃ­cil | FÃ¡cil | ðŸ“ˆ +200% |
| **Onboarding** | 2-3 dias | < 1 dia | ðŸ“‰ -66% |

---

## âœ… CHECKLIST DE VALIDAÃ‡ÃƒO

### **ApÃ³s MigraÃ§Ã£o, Verificar:**

- [ ] Todos os arquivos foram migrados
- [ ] Estrutura de pastas estÃ¡ correta
- [ ] API inicia sem erros
- [ ] Panel inicia sem erros
- [ ] Portais Docusaurus buildamcorretamente
- [ ] Testes passam
- [ ] Backup funciona
- [ ] Git estÃ¡ configurado
- [ ] README.md estÃ¡ atualizado
- [ ] Equipe foi treinada na nova estrutura

---

**Documento gerado em:** 2026-06-20  
**Status:** âœ… Pronto para ExecuÃ§Ã£o  
**PrÃ³ximo passo:** Executar Fase 1 - Criar estrutura unificada


---

## ORIGEM: DIAGRAMA-ARQUITETURA-REESTRUTURACAO.md

# ðŸ—ï¸ Diagrama de Arquitetura - ReestruturaÃ§Ã£o

**Axion Intelligence Platform**  
**Data:** 2026-06-20

---

## ðŸ“Š ARQUITETURA ATUAL vs PROPOSTA

### **ATUAL (Flat Structure)** âŒ

```
axion-ia-api/src/
â”œâ”€â”€ admin-controller.js (84 linhas)
â”œâ”€â”€ agent-controller.js (113 linhas)
â”œâ”€â”€ analise-imagem-controller.js (446 linhas)
â”œâ”€â”€ axcross-controller.js (154 linhas)
â”œâ”€â”€ axhub-controller.js (230 linhas)
â”œâ”€â”€ axton-controller.js (110 linhas)
â”œâ”€â”€ coletor-controller.js (245 linhas)
â”œâ”€â”€ confidence-controller.js (207 linhas)
â”œâ”€â”€ config-controller.js (150 linhas)
â”œâ”€â”€ conformidade-controller.js (226 linhas)
â”œâ”€â”€ controller.js (processarMensagem, etc)
â”œâ”€â”€ credenciais-controller.js (372 linhas)
â”œâ”€â”€ crm-controller.js (195 linhas)
â”œâ”€â”€ doc-controller.js (136 linhas)
â”œâ”€â”€ duplicidade-controller.js (366 linhas)
â”œâ”€â”€ edital-controller.js (378 linhas)
â”œâ”€â”€ equipamento-controller.js (117 linhas)
â”œâ”€â”€ fontes-controller.js (147 linhas)
â”œâ”€â”€ health-controller.js (58 linhas)
â”œâ”€â”€ helpdesk-controller.js (417 linhas)
â”œâ”€â”€ job-controller.js (104 linhas)
â”œâ”€â”€ leitura-controller.js (209 linhas)
â”œâ”€â”€ medicao-controller.js (332 linhas)
â”œâ”€â”€ relatorio-contrato-controller.js (101 linhas)
â”œâ”€â”€ relatorio-controller.js (166 linhas)
â”œâ”€â”€ roadmap-controller.js (63 linhas)
â”œâ”€â”€ sites-helpdesk-controller.js (230 linhas)
â”œâ”€â”€ spec-controller.js (43 linhas)
â”œâ”€â”€ upload-controller.js (62 linhas)
â”œâ”€â”€ validate-controller.js (439 linhas)
â”œâ”€â”€ validation-manager-controller.js (407 linhas)
â”œâ”€â”€ varco-controller.js (641 linhas) âš ï¸ MUITO GRANDE
â”œâ”€â”€ visual-validation-controller.js (720 linhas) âš ï¸ MUITO GRANDE
â”œâ”€â”€ whatsapp-controller.js (...)
â”œâ”€â”€ agent/ (4 arquivos)
â”‚   â”œâ”€â”€ agent.js
â”‚   â”œâ”€â”€ orchestrator.js
â”‚   â”œâ”€â”€ state.js
â”‚   â””â”€â”€ tasks.js
â”œâ”€â”€ services/ (26 arquivos desorganizados)
â”‚   â”œâ”€â”€ analise-imagem.js
â”‚   â”œâ”€â”€ axhub-db.js
â”‚   â”œâ”€â”€ confidence-scorer.js
â”‚   â”œâ”€â”€ conformidade.js
â”‚   â”œâ”€â”€ ia-adapter.js
â”‚   â”œâ”€â”€ ocr-processor.js
â”‚   â”œâ”€â”€ whatsapp.service.js
â”‚   â””â”€â”€ ... (mais 19 services)
â”œâ”€â”€ models/ (17 models MongoDB)
â”œâ”€â”€ engine.js (Motor IA)
â”œâ”€â”€ classifier.js
â”œâ”€â”€ prompt.js
â”œâ”€â”€ kb.json
â”œâ”€â”€ routes.js (350+ linhas, TODAS as rotas)
â””â”€â”€ app.js

âŒ Problemas:
- 30+ arquivos controllers na raiz
- Controllers muito grandes (600-700 linhas)
- LÃ³gica de negÃ³cio nos controllers
- Services desorganizados
- Rotas centralizadas em 1 arquivo
- DifÃ­cil encontrar cÃ³digo relacionado
```

---

### **PROPOSTA (Modular Structure)** âœ…

```
axion-ia-api/
â”œâ”€â”€ src/
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ modules/                    â† MÃ“DULOS POR DOMÃNIO
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ” validation/             â† VALIDADORES
â”‚   â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ validation-manager.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ visual-validation.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ varco.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ alert-flow.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ duplicidade.controller.js
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ validation.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ visual-validation.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ varco-validation.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ duplicidade-analyzer.service.js
â”‚   â”‚   â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ validation.model.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ duplicidade.model.js
â”‚   â”‚   â”‚   â”œâ”€â”€ types/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ validation.types.js
â”‚   â”‚   â”‚   â””â”€â”€ validation.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“Š analysis/               â† ANALISADORES
â”‚   â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ medicao.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ image.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ conformidade.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ edital.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ leitura.controller.js
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ medicao-analyzer.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ image-analyzer.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ocr-processor.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ conformidade-analyzer.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ edital-analyzer.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ requirement-classifier.service.js
â”‚   â”‚   â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ conformidade.model.js
â”‚   â”‚   â”‚   â””â”€â”€ analysis.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“„ reporting/              â† RELATÃ“RIOS
â”‚   â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ contract-report.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ flow-report.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ hours-report.controller.js
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ report-generator.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ contract-report.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ flow-report.service.js
â”‚   â”‚   â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ relatorio-contrato.model.js
â”‚   â”‚   â”‚   â””â”€â”€ reporting.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ¤– ai/                     â† INTELIGÃŠNCIA ARTIFICIAL
â”‚   â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ chat.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ agent.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ confidence.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ helpdesk-ai.controller.js
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ia-adapter.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ agent.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ confidence.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ embedding.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ training.service.js
â”‚   â”‚   â”‚   â”œâ”€â”€ core/                  â† MOTOR IA
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ engine.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ classifier.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ prompt.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ kb.json
â”‚   â”‚   â”‚   â”œâ”€â”€ agent/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ agent.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ orchestrator.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ state.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ tasks.js
â”‚   â”‚   â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ confianca-revisao.model.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ kb.model.js
â”‚   â”‚   â”‚   â””â”€â”€ ai.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ­ generators/             â† GERADORES
â”‚   â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ doc.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ roadmap.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ spec.controller.js
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ doc-generator.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ roadmap-engine.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ spec-engine.service.js
â”‚   â”‚   â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ roadmap.model.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ spec.model.js
â”‚   â”‚   â”‚   â””â”€â”€ generators.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ”Œ integrations/          â† INTEGRAÃ‡Ã•ES
â”‚   â”‚   â”‚   â”œâ”€â”€ axhub/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axhub.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axhub-db.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ axhub.routes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ axton/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axton.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axton-db.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ axton.routes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ axcross/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axcross.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axcross-db.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ axcross.routes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ whatsapp/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ whatsapp.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ whatsapp.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ whatsapp-transport.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ whatsapp-flows.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ whatsapp-sessao.model.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ whatsapp.routes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ jitbit/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ helpdesk.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ jitbit.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ sites-helpdesk.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ helpdesk.routes.js
â”‚   â”‚   â”‚   â””â”€â”€ pncp/
â”‚   â”‚   â”‚       â”œâ”€â”€ coletor.controller.js
â”‚   â”‚   â”‚       â”œâ”€â”€ pncp-scraper.service.js
â”‚   â”‚   â”‚       â””â”€â”€ coletor.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ðŸ“š resources/             â† RECURSOS
â”‚   â”‚   â”‚   â”œâ”€â”€ kb/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ kb.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ kb.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ admin.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ kb.routes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ fontes/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ fontes.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ fontes.service.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”‚   â”‚   â”‚   â””â”€â”€ fonte.model.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ fontes.routes.js
â”‚   â”‚   â”‚   â””â”€â”€ crm/
â”‚   â”‚   â”‚       â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ contato.controller.js
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ cliente.controller.js
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ equipamento.controller.js
â”‚   â”‚   â”‚       â”œâ”€â”€ services/
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ crm.service.js
â”‚   â”‚   â”‚       â”œâ”€â”€ models/
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ contato.model.js
â”‚   â”‚   â”‚       â”‚   â”œâ”€â”€ cliente.model.js
â”‚   â”‚   â”‚       â”‚   â””â”€â”€ equipamento.model.js
â”‚   â”‚   â”‚       â””â”€â”€ crm.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ âš™ï¸ system/                â† SISTEMA
â”‚   â”‚       â”œâ”€â”€ config/
â”‚   â”‚       â”‚   â”œâ”€â”€ config.controller.js
â”‚   â”‚       â”‚   â””â”€â”€ config.routes.js
â”‚   â”‚       â”œâ”€â”€ health/
â”‚   â”‚       â”‚   â”œâ”€â”€ health.controller.js
â”‚   â”‚       â”‚   â””â”€â”€ health.routes.js
â”‚   â”‚       â”œâ”€â”€ logs/
â”‚   â”‚       â”‚   â”œâ”€â”€ logs.controller.js
â”‚   â”‚       â”‚   â””â”€â”€ logs.routes.js
â”‚   â”‚       â””â”€â”€ upload/
â”‚   â”‚           â”œâ”€â”€ upload.controller.js
â”‚   â”‚           â””â”€â”€ upload.routes.js
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ shared/                     â† COMPARTILHADO
â”‚   â”‚   â”œâ”€â”€ middleware/
â”‚   â”‚   â”‚   â”œâ”€â”€ auth.middleware.js
â”‚   â”‚   â”‚   â”œâ”€â”€ error.middleware.js
â”‚   â”‚   â”‚   â””â”€â”€ upload.middleware.js
â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”‚   â”œâ”€â”€ logger.js
â”‚   â”‚   â”‚   â”œâ”€â”€ validator.js
â”‚   â”‚   â”‚   â””â”€â”€ normalizer.js
â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â”‚   â””â”€â”€ index.js
â”‚   â”‚   â””â”€â”€ types/
â”‚   â”‚       â””â”€â”€ common.types.js
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ database/                   â† BANCO DE DADOS
â”‚   â”‚   â”œâ”€â”€ mongodb/
â”‚   â”‚   â”‚   â”œâ”€â”€ connection.js
â”‚   â”‚   â”‚   â””â”€â”€ base-repository.js
â”‚   â”‚   â””â”€â”€ mssql/
â”‚   â”‚       â”œâ”€â”€ connection.js
â”‚   â”‚       â”œâ”€â”€ axhub-pool.js
â”‚   â”‚       â”œâ”€â”€ axton-pool.js
â”‚   â”‚       â””â”€â”€ axcross-pool.js
â”‚   â”‚
â”‚   â”œâ”€â”€ routes.js                      â† AGREGADOR DE ROTAS
â”‚   â””â”€â”€ app.js                         â† ENTRY POINT
â”‚
â””â”€â”€ package.json

âœ… BenefÃ­cios:
- MÃ³dulos organizados por domÃ­nio
- Controllers focados (100-200 linhas)
- LÃ³gica de negÃ³cio em services
- Rotas por mÃ³dulo
- FÃ¡cil localizaÃ§Ã£o de cÃ³digo
- Testabilidade melhorada
- Escalabilidade garantida
```

---

## ðŸŽ¯ FLUXO DE REQUISIÃ‡ÃƒO

### **ATUAL (MonolÃ­tico)**

```mermaid
graph LR
    A[Cliente] --> B[routes.js]
    B --> C[controller.js]
    C --> D[service.js?]
    C --> E[DB direto]
    C --> F[OpenAI]
    C --> G[Resposta]
    
    style C fill:#ff6b6b
    style E fill:#ff6b6b
    style F fill:#ff6b6b
```

**Problemas:**
- âŒ Controller faz tudo (lÃ³gica + dados + API externa)
- âŒ DifÃ­cil testar
- âŒ DifÃ­cil reutilizar

---

### **PROPOSTA (Modular)**

```mermaid
graph LR
    A[Cliente] --> B[module.routes.js]
    B --> C[controller.js]
    C --> D[service.js]
    D --> E[repository.js]
    E --> F[DB]
    D --> G[external-api.js]
    G --> H[OpenAI/Jitbit/etc]
    C --> I[Resposta]
    
    style C fill:#51cf66
    style D fill:#51cf66
    style E fill:#51cf66
    style G fill:#51cf66
```

**BenefÃ­cios:**
- âœ… Controller apenas coordena
- âœ… Service contÃ©m lÃ³gica de negÃ³cio
- âœ… Repository gerencia dados
- âœ… External API isolado
- âœ… FÃ¡cil testar cada camada
- âœ… FÃ¡cil reutilizar services

---

## ðŸ“¦ ORGANIZAÃ‡ÃƒO DE MÃ“DULOS

### **MÃ³dulo Validation (Exemplo Completo)**

```
modules/validation/
â”œâ”€â”€ controllers/
â”‚   â”œâ”€â”€ validation-manager.controller.js   (150 linhas)
â”‚   â”œâ”€â”€ visual-validation.controller.js    (180 linhas)
â”‚   â”œâ”€â”€ varco.controller.js                (200 linhas)
â”‚   â”œâ”€â”€ alert-flow.controller.js           (100 linhas)
â”‚   â””â”€â”€ duplicidade.controller.js          (150 linhas)
â”‚
â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ validation.service.js              â† LÃ³gica validation manager
â”‚   â”œâ”€â”€ visual-validation.service.js       â† LÃ³gica visual validation
â”‚   â”œâ”€â”€ varco-validation.service.js        â† LÃ³gica VARCO
â”‚   â”œâ”€â”€ alert-flow-validation.service.js   â† LÃ³gica alert flow
â”‚   â””â”€â”€ duplicidade-analyzer.service.js    â† LÃ³gica duplicidade
â”‚
â”œâ”€â”€ repositories/
â”‚   â”œâ”€â”€ validation.repository.js           â† Acesso MongoDB
â”‚   â””â”€â”€ duplicidade.repository.js          â† Queries SQL Server
â”‚
â”œâ”€â”€ models/
â”‚   â”œâ”€â”€ validation.model.js                â† Schema MongoDB
â”‚   â””â”€â”€ duplicidade.model.js
â”‚
â”œâ”€â”€ types/
â”‚   â””â”€â”€ validation.types.js                â† Interfaces TypeScript
â”‚
â”œâ”€â”€ utils/
â”‚   â””â”€â”€ validation.helpers.js
â”‚
â””â”€â”€ validation.routes.js                   â† Rotas do mÃ³dulo

Resultado:
- 5 controllers focados (100-200 linhas cada)
- 5 services testÃ¡veis
- 2 repositories para dados
- LÃ³gica isolada e reutilizÃ¡vel
```

---

## ðŸ”„ ESTRATÃ‰GIA DE MIGRAÃ‡ÃƒO

### **Abordagem: Incremental (Strangler Fig Pattern)**

```
FASE 1: Criar estrutura modules/
â”œâ”€â”€ Criar pasta modules/
â”œâ”€â”€ Definir padrÃ£o de mÃ³dulo
â””â”€â”€ Criar templates

FASE 2: Migrar mÃ³dulo por mÃ³dulo
â”œâ”€â”€ MÃ³dulo 1: validation/ (5 dias)
â”‚   â”œâ”€â”€ Criar services
â”‚   â”œâ”€â”€ Refatorar controllers
â”‚   â”œâ”€â”€ Criar testes
â”‚   â””â”€â”€ Manter compatibilidade
â”‚
â”œâ”€â”€ MÃ³dulo 2: analysis/ (5 dias)
â”‚   â”œâ”€â”€ Criar services
â”‚   â”œâ”€â”€ Refatorar controllers
â”‚   â”œâ”€â”€ Criar testes
â”‚   â””â”€â”€ Manter compatibilidade
â”‚
â”œâ”€â”€ MÃ³dulo 3: reporting/ (3 dias)
â”œâ”€â”€ MÃ³dulo 4: ai/ (5 dias)
â”œâ”€â”€ MÃ³dulo 5: generators/ (3 dias)
â”œâ”€â”€ MÃ³dulo 6: integrations/ (4 dias)
â”œâ”€â”€ MÃ³dulo 7: resources/ (2 dias)
â””â”€â”€ MÃ³dulo 8: system/ (2 dias)

FASE 3: Deprecar arquivos antigos
â”œâ”€â”€ Redirecionar imports
â”œâ”€â”€ Remover arquivos deprecated
â””â”€â”€ Atualizar documentaÃ§Ã£o

Total: 10-15 dias Ãºteis
```

---

## ðŸ“Š COMPARATIVO DE COMPLEXIDADE

### **ANTES (Complexidade Alta)**

| MÃ©trica | Valor | Status |
|---------|-------|--------|
| Controllers na raiz | 30+ | âŒ Muito |
| Linhas por controller | 200-700 | âŒ Inconsistente |
| LÃ³gica em controller | 70% | âŒ Alto |
| Services organizados | 30% | âŒ Baixo |
| Testabilidade | Baixa | âŒ Ruim |
| Tempo para encontrar cÃ³digo | Alto | âŒ Ruim |
| Reusabilidade | Baixa | âŒ Ruim |

---

### **DEPOIS (Complexidade Baixa)**

| MÃ©trica | Valor | Status |
|---------|-------|--------|
| MÃ³dulos | 8 | âœ… Organizado |
| Linhas por controller | 100-200 | âœ… Consistente |
| LÃ³gica em controller | 10% | âœ… Baixo |
| Services organizados | 95% | âœ… Alto |
| Testabilidade | Alta | âœ… Ã“timo |
| Tempo para encontrar cÃ³digo | Baixo | âœ… Ã“timo |
| Reusabilidade | Alta | âœ… Ã“timo |

---

## ðŸŽ¯ EXEMPLO DE CÃ“DIGO

### **ANTES: Controller com tudo**

```javascript
// varco-controller.js (641 linhas)
export async function validarDispositivo(req, res) {
  try {
    const { alias } = req.body;
    
    // âŒ LÃ³gica de negÃ³cio no controller
    const pool = await sql.connect(config.axhub);
    const result = await pool.request()
      .input('alias', sql.VarChar, alias)
      .query('SELECT * FROM Equipamentos WHERE Alias = @alias');
    
    // âŒ ValidaÃ§Ãµes complexas no controller
    if (!result.recordset[0]) {
      return res.status(404).json({ error: 'Equipamento nÃ£o encontrado' });
    }
    
    // âŒ Chamadas externas no controller
    const response = await fetch(`http://api.varco.com/validate/${alias}`);
    const data = await response.json();
    
    // âŒ Processamento complexo no controller
    const diagnostico = {
      status: data.online ? 'OK' : 'OFFLINE',
      // ... mais 50 linhas de processamento
    };
    
    res.json(diagnostico);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

---

### **DEPOIS: Controller focado**

```javascript
// modules/validation/controllers/varco.controller.js (50 linhas)
import { varcoValidationService } from '../services/varco-validation.service.js';

export async function validarDispositivo(req, res) {
  try {
    const { alias } = req.body;
    
    // âœ… Controller apenas coordena
    const diagnostico = await varcoValidationService.validarDispositivo(alias);
    
    res.json(diagnostico);
  } catch (error) {
    // âœ… Error handling centralizado em middleware
    next(error);
  }
}
```

```javascript
// modules/validation/services/varco-validation.service.js
import { equipamentoRepository } from '../../integrations/axhub/repositories/equipamento.repository.js';
import { varcoApiClient } from '../clients/varco-api.client.js';

export class VarcoValidationService {
  
  async validarDispositivo(alias) {
    // âœ… LÃ³gica de negÃ³cio no service
    const equipamento = await equipamentoRepository.findByAlias(alias);
    
    if (!equipamento) {
      throw new NotFoundError('Equipamento nÃ£o encontrado');
    }
    
    // âœ… Chamada externa isolada
    const statusVarco = await varcoApiClient.validateDevice(alias);
    
    // âœ… Processamento no service
    return this.gerarDiagnostico(equipamento, statusVarco);
  }
  
  private gerarDiagnostico(equipamento, statusVarco) {
    return {
      alias: equipamento.Alias,
      status: statusVarco.online ? 'OK' : 'OFFLINE',
      ultimaPassagem: equipamento.UltimaPassagem,
      // ... processamento isolado e testÃ¡vel
    };
  }
}

export const varcoValidationService = new VarcoValidationService();
```

---

## ðŸ§ª TESTABILIDADE

### **ANTES: DifÃ­cil testar**

```javascript
// âŒ ImpossÃ­vel testar sem banco de dados real
// âŒ ImpossÃ­vel testar sem API externa
// âŒ ImpossÃ­vel testar lÃ³gica isoladamente
test('validarDispositivo', async () => {
  // Precisa de banco de dados rodando
  // Precisa de API externa disponÃ­vel
  // NÃ£o consigo mockar dependÃªncias
});
```

---

### **DEPOIS: FÃ¡cil testar**

```javascript
// âœ… Service isolado, fÃ¡cil de testar
import { VarcoValidationService } from './varco-validation.service.js';

describe('VarcoValidationService', () => {
  let service;
  let mockRepository;
  let mockApiClient;
  
  beforeEach(() => {
    // âœ… Mock das dependÃªncias
    mockRepository = {
      findByAlias: jest.fn()
    };
    mockApiClient = {
      validateDevice: jest.fn()
    };
    
    service = new VarcoValidationService(mockRepository, mockApiClient);
  });
  
  test('deve validar dispositivo com sucesso', async () => {
    // âœ… Arrange
    mockRepository.findByAlias.mockResolvedValue({ Alias: 'CAM001' });
    mockApiClient.validateDevice.mockResolvedValue({ online: true });
    
    // âœ… Act
    const resultado = await service.validarDispositivo('CAM001');
    
    // âœ… Assert
    expect(resultado.status).toBe('OK');
    expect(resultado.alias).toBe('CAM001');
  });
});
```

---

## ðŸ“ˆ MÃ‰TRICAS DE SUCESSO

| MÃ©trica | Meta | Como Medir |
|---------|------|------------|
| Cobertura de Testes | > 80% | Jest coverage |
| Tempo para encontrar cÃ³digo | < 30s | Survey equipe |
| Linhas por arquivo | < 250 | ESLint |
| Complexidade ciclomÃ¡tica | < 10 | SonarQube |
| DuplicaÃ§Ã£o de cÃ³digo | < 5% | SonarQube |
| Tempo de build | < 30s | CI/CD |
| Bugs por deploy | < 2 | Tracking |

---

## ðŸš€ ROADMAP DE IMPLEMENTAÃ‡ÃƒO

```
Semana 1-2: Validation Module
- Consolidar 5 validadores
- Criar services
- Testes unitÃ¡rios
- DocumentaÃ§Ã£o

Semana 3-4: Analysis Module
- Consolidar 5 analisadores
- Criar services
- Testes unitÃ¡rios

Semana 5: Reporting Module
- Consolidar 3 geradores
- Padronizar saÃ­da

Semana 6-7: AI Module
- Reorganizar core IA
- Extrair services

Semana 8: Integrations Module
- Reorganizar integraÃ§Ãµes
- Padronizar conexÃµes

Semana 9: Resources + System
- MigraÃ§Ã£o direta
- Limpeza final

Semana 10: Testes e DocumentaÃ§Ã£o
- Testes E2E
- DocumentaÃ§Ã£o completa
- Training da equipe
```

---

**Documento gerado em:** 2026-06-20  
**PrÃ³ximo passo:** Aprovar e iniciar Fase 1


---

## ORIGEM: MAPEAMENTO-FUNCIONALIDADES-SISTEMA.md

# ðŸ—ºï¸ Mapeamento Completo de Funcionalidades do Sistema

**Axion Intelligence Platform**  
**Data:** 2026-06-20  
**Objetivo:** AnÃ¡lise estrutural para reestruturaÃ§Ã£o

---

## ðŸ“Š VISÃƒO GERAL

O sistema possui **~200+ endpoints** distribuÃ­dos em **30+ controllers**, organizados funcionalmente mas com oportunidades de melhor modularizaÃ§Ã£o.

---

## ðŸŽ¯ CATEGORIAS FUNCIONAIS IDENTIFICADAS

### 1. ðŸ” **VALIDADORES E AUDITORIA**

#### **1.1 Validation Manager** (validation-manager-controller.js)
**PropÃ³sito:** ValidaÃ§Ã£o automatizada de sistemas web (UI + API)

**Endpoints:**
```
POST /validation/start             â†’ Iniciar validaÃ§Ã£o completa
POST /validation/discover-ui        â†’ Descobrir elementos UI
POST /validation/discover-api       â†’ Descobrir endpoints API
GET  /validation/report/:id         â†’ RelatÃ³rio de validaÃ§Ã£o
GET  /validation/list               â†’ Listar validaÃ§Ãµes
```

**Services Relacionados:** Nenhum service dedicado (lÃ³gica no controller)

---

#### **1.2 Visual Validation** (visual-validation-controller.js)
**PropÃ³sito:** ValidaÃ§Ã£o visual completa (CRUD + Screenshots + Ortografia)

**Endpoints:**
```
POST /visual-validation/start               â†’ Iniciar validaÃ§Ã£o visual
GET  /visual-validation/status/:id          â†’ Status da validaÃ§Ã£o
GET  /visual-validation/report/:id          â†’ RelatÃ³rio visual
GET  /visual-validation/screenshot/:filename â†’ Screenshot especÃ­fico
GET  /visual-validation/list                â†’ Listar validaÃ§Ãµes visuais
```

**Services Relacionados:** Nenhum service dedicado (lÃ³gica no controller)

---

#### **1.3 VARCO Validator** (varco-controller.js)
**PropÃ³sito:** ValidaÃ§Ã£o de integraÃ§Ã£o cÃ¢meras ITScam â†’ AxHub (72 dispositivos SETRANS-GO)

**Endpoints:**
```
POST /varco/validar-dispositivo      â†’ Validar dispositivo individual
POST /varco/validar-lote             â†’ Validar lote de dispositivos
POST /varco/analisar-incidente       â†’ Analisar incidente especÃ­fico
GET  /varco/heartbeat                â†’ Heartbeat geral da frota
GET  /varco/frota                    â†’ Listar frota completa
GET  /varco/auditoria                â†’ Status de auditoria
GET  /varco/auditoria-aprimorada     â†’ Auditoria avanÃ§ada
GET  /varco/config-padrao            â†’ ConfiguraÃ§Ã£o padrÃ£o
POST /varco/recoleta                 â†’ Recoletar dados
GET  /varco/plano-correcao           â†’ Obter plano de correÃ§Ã£o
POST /varco/gerar-plano              â†’ Gerar novo plano
POST /varco/aplicar-correcao         â†’ Aplicar correÃ§Ãµes
```

**Services Relacionados:** Nenhum service dedicado (lÃ³gica no controller)

---

#### **1.4 Alert Flow Validator** (validate-controller.js)
**PropÃ³sito:** ValidaÃ§Ã£o de fluxo de alertas AxCross

**Endpoints:**
```
POST /validate-alert-flow  â†’ Validar fluxo completo de alerta
```

**Services Relacionados:** Nenhum service dedicado

---

#### **1.5 Duplicidade Auditor** (duplicidade-controller.js)
**PropÃ³sito:** DetecÃ§Ã£o e anÃ¡lise de infraÃ§Ãµes duplicadas no AxHub

**Endpoints:**
```
GET /duplicidade/buscar          â†’ Buscar infraÃ§Ãµes
GET /duplicidade/varredura       â†’ Varredura de duplicidades
GET /duplicidade/detalhe/:id     â†’ Detalhe de infraÃ§Ã£o
GET /duplicidade/comparar        â†’ Comparar infraÃ§Ãµes
GET /duplicidade/estatisticas    â†’ EstatÃ­sticas de duplicidades
```

**Services Relacionados:** Nenhum service dedicado (queries SQL diretas)

---

#### **1.6 Credenciais Validator** (credenciais-controller.js)
**PropÃ³sito:** Gerenciamento e validaÃ§Ã£o de credenciais de acesso a sistemas

**Endpoints:**
```
POST /credenciais/login          â†’ Testar login em sistema
POST /credenciais/alterar-senha  â†’ Alterar senha
POST /credenciais/validar        â†’ Validar acesso
```

**Services Relacionados:** Playwright para automaÃ§Ã£o de testes

---

### 2. ðŸ“Š **ANALISADORES**

#### **2.1 Medicao Analyzer** (medicao-controller.js)
**PropÃ³sito:** AnÃ¡lise inteligente de equipamentos com valores zerados no relatÃ³rio de mediÃ§Ã£o

**Endpoints:**
```
GET /medicao/sistemas           â†’ Listar sistemas com mediÃ§Ã£o
GET /medicao/equipamentos       â†’ Listar equipamentos
GET /medicao/diagnostico        â†’ Gerar diagnÃ³stico de zerados
GET /medicao/analise-sistema    â†’ AnÃ¡lise profunda de sistema
```

**Services Relacionados:** 
- Queries SQL complexas com anÃ¡lise de faixas/equipamentos
- LÃ³gica integrada no controller

---

#### **2.2 Analise Imagem** (analise-imagem-controller.js)
**PropÃ³sito:** OCR, validaÃ§Ã£o e qualidade de capturas operacionais

**Endpoints:**
```
POST   /analise-imagem/analisar                  â†’ Analisar sem salvar
POST   /analise-imagem/salvar-e-analisar         â†’ Salvar e analisar
POST   /analise-imagem/comparar-pasta            â†’ Comparar pasta
POST   /analise-imagem/comparar-pasta-local      â†’ Comparar pasta local
GET    /analise-imagem/imagem-externa            â†’ Servir imagem
POST   /analise-imagem/gerar-caracteristicas     â†’ Gerar caracterÃ­sticas
POST   /analise-imagem/classificar-ocupacao      â†’ Classificar ocupaÃ§Ã£o
POST   /analise-imagem/classificar-roda          â†’ Classificar roda
POST   /analise-imagem/classificar-cor-camisa    â†’ Classificar cor
POST   /analise-imagem/classificar-mochila       â†’ Classificar mochila
POST   /analise-imagem/classificar-calca         â†’ Classificar calÃ§a
POST   /analise-imagem/ler-placa                 â†’ OCR de placa
GET    /analise-imagem/listar                    â†’ Listar todas
GET    /analise-imagem/listar/:sistema           â†’ Listar por sistema
GET    /analise-imagem/listar-pasta              â†’ Listar pasta
DELETE /analise-imagem/:sistema/:nome            â†’ Remover imagem
```

**Services Relacionados:**
- `analise-imagem.js` (service)
- `ocr-processor.js` (service)

---

#### **2.3 Conformidade Analyzer** (conformidade-controller.js)
**PropÃ³sito:** AnÃ¡lise de conformidade com editais/licitaÃ§Ãµes

**Endpoints:**
```
# AnÃ¡lise Multi-Produto
POST /conformidade/multi/gerar                    â†’ Gerar anÃ¡lise multi
GET  /conformidade/multi                          â†’ Listar anÃ¡lises multi
GET  /conformidade/multi/:id                      â†’ Obter anÃ¡lise multi
GET  /conformidade/multi/:id/comparacao           â†’ ComparaÃ§Ã£o multi
GET  /conformidade/multi/:id/lacunas              â†’ Lacunas multi
GET  /conformidade/multi/:id/recomendacoes        â†’ RecomendaÃ§Ãµes multi

# AnÃ¡lise Simples
POST   /conformidade/gerar    â†’ Gerar conformidade
GET    /conformidade          â†’ Listar conformidades
GET    /conformidade/:id      â†’ Obter conformidade
DELETE /conformidade/:id      â†’ Remover conformidade
```

**Services Relacionados:**
- `conformidade.js` (service)
- `conformidade-enhanced.js` (service)

---

#### **2.4 Edital Analyzer** (edital-controller.js)
**PropÃ³sito:** Busca, importaÃ§Ã£o e anÃ¡lise automÃ¡tica de editais gov

**Endpoints:**
```
GET  /edital/buscar                â†’ Buscar editais gov
POST /edital/importar              â†’ Importar edital
POST /edital/analisar-rapido       â†’ AnÃ¡lise rÃ¡pida
POST /edital/analise-avancada      â†’ AnÃ¡lise avanÃ§ada
POST /edital/upload                â†’ Upload de edital
GET  /edital                       â†’ Listar editais
GET  /edital/historico             â†’ HistÃ³rico
POST /edital/auto-analisar-todos   â†’ Auto-analisar todos
GET  /sites                        â†’ Listar sites
```

**Services Relacionados:**
- `edital-analise-avancada.js` (service)
- `pncp-scraper.js` (service)
- `pncp.service.js` (service)
- `requirement-classifier.js` (service)

---

#### **2.5 Leitura EstratÃ©gica** (leitura-controller.js)
**PropÃ³sito:** Agente 80/20 - AnÃ¡lise estratÃ©gica de textos/documentos

**Endpoints:**
```
POST /leitura/analisar  â†’ Analisar texto
POST /leitura/upload    â†’ Analisar arquivo
```

**Services Relacionados:**
- LÃ³gica de anÃ¡lise 80/20 no controller
- OpenAI integration

---

#### **2.6 Sites Helpdesk Analyzer** (sites-helpdesk-controller.js)
**PropÃ³sito:** AnÃ¡lise operacional de sites e mapeamento com helpdesk

**Endpoints:**
```
GET    /helpdesk/sites-overview          â†’ Overview de sites
GET    /helpdesk/mapa-sites              â†’ Mapa de sites
POST   /helpdesk/mapa-sites              â†’ Associar site
DELETE /helpdesk/mapa-sites/:categoriaId â†’ Desassociar site
GET    /helpdesk/site/:siteId/tickets    â†’ Tickets por site
```

**Services Relacionados:** Nenhum service dedicado

---

### 3. ðŸ“„ **GERADORES DE RELATÃ“RIOS**

#### **3.1 Relatorio Contrato** (relatorio-contrato-controller.js)
**PropÃ³sito:** AnÃ¡lises tÃ©cnicas e viabilidade via IA por site/contrato

**Endpoints:**
```
GET    /relatorio-contrato/contratos  â†’ Listar contratos
GET    /relatorio-contrato/tipos      â†’ Listar tipos
POST   /relatorio-contrato/gerar      â†’ Gerar relatÃ³rio
GET    /relatorio-contrato            â†’ Listar relatÃ³rios
GET    /relatorio-contrato/:id        â†’ Obter relatÃ³rio
DELETE /relatorio-contrato/:id        â†’ Remover relatÃ³rio
```

**Services Relacionados:**
- `relatorio-contrato.js` (service)

---

#### **3.2 Relatorio Fluxo** (relatorio-controller.js)
**PropÃ³sito:** MÃ©tricas de atendimento e fluxo operacional (AxHub)

**Endpoints:**
```
GET /relatorio/passagens     â†’ RelatÃ³rio de passagens
GET /relatorio/imagens       â†’ RelatÃ³rio de imagens
GET /relatorio/equipamentos  â†’ Listar equipamentos
```

**Services Relacionados:** SQL queries diretas

---

#### **3.3 Planilha de Horas** (helpdesk-controller.js)
**PropÃ³sito:** Controle de tempo e atividades de tÃ©cnicos

**Endpoints:**
```
GET /helpdesk/tecnicos        â†’ Listar tÃ©cnicos
GET /helpdesk/planilha-horas  â†’ Gerar planilha de horas
```

**Services Relacionados:** Jitbit API integration

---

#### **3.4 SLA Compliance** (helpdesk-controller.js)
**PropÃ³sito:** RelatÃ³rio de conformidade com SLA

**Endpoints:**
```
GET /helpdesk/sla-compliance  â†’ RelatÃ³rio SLA
GET /helpdesk/relatorio-sla   â†’ RelatÃ³rio SLA (alias)
```

**Services Relacionados:** Jitbit API integration

---

### 4. ðŸ¤– **IA E AUTOMAÃ‡ÃƒO**

#### **4.1 AxionIA Chat** (controller.js)
**PropÃ³sito:** Assistente inteligente principal

**Endpoints:**
```
POST /chat  â†’ Processar mensagem
```

**Core IA:**
- `engine.js` - Motor de IA
- `classifier.js` - Classificador de intenÃ§Ãµes
- `prompt.js` - Prompts do sistema
- `kb.json` - Knowledge base

**Services:**
- `embedding.js` - Embeddings
- `ia-adapter.js` - Adapter OpenAI
- `training.js` - Treinamento

---

#### **4.2 AxionAgent** (agent-controller.js)
**PropÃ³sito:** Orquestrador central de tarefas

**Endpoints:**
```
POST /agent/run               â†’ Executar agente
POST /agent/run/:mode         â†’ Executar modo especÃ­fico
GET  /agent/state             â†’ Estado do agente
GET  /agent/scheduler         â†’ Status do scheduler
POST /agent/scheduler/start   â†’ Iniciar scheduler
POST /agent/scheduler/stop    â†’ Parar scheduler
```

**Agent System:**
- `agent/agent.js` - Agente principal
- `agent/orchestrator.js` - Orquestrador
- `agent/state.js` - Gerenciamento de estado
- `agent/tasks.js` - DefiniÃ§Ã£o de tarefas

---

#### **4.3 Helpdesk IA** (helpdesk-controller.js)
**PropÃ³sito:** GestÃ£o inteligente de tickets Jitbit

**Endpoints:**
```
# Tickets
GET  /helpdesk/tickets          â†’ Listar tickets
GET  /helpdesk/ticket/:id       â†’ Detalhe ticket
POST /helpdesk/classificar/:id  â†’ Classificar ticket
POST /helpdesk/responder/:id    â†’ Responder com IA
POST /helpdesk/processar        â†’ Processar pendentes
POST /helpdesk/criar            â†’ Criar chamado
GET  /helpdesk/categorias       â†’ Listar categorias

# Polling AutomÃ¡tico
GET  /helpdesk/polling          â†’ Status polling
POST /helpdesk/polling/iniciar  â†’ Iniciar polling
POST /helpdesk/polling/pausar   â†’ Pausar polling
POST /helpdesk/polling/retomar  â†’ Retomar polling
POST /helpdesk/polling/limpar   â†’ Limpar polling

# Fila de RevisÃ£o
GET  /helpdesk/fila             â†’ Obter fila
POST /helpdesk/fila/modo        â†’ Modo revisÃ£o
POST /helpdesk/fila/:id/aprovar â†’ Aprovar
POST /helpdesk/fila/:id/rejeitar â†’ Rejeitar
```

**Services:**
- `jitbit.js` - IntegraÃ§Ã£o Jitbit
- `ticket-closed-poller.js` - Poller de tickets

---

#### **4.4 ConfianÃ§a Queue** (confidence-controller.js)
**PropÃ³sito:** Fila de revisÃ£o de itens com baixa confianÃ§a

**Endpoints:**
```
GET  /confianca/fila                                      â†’ Listar fila
GET  /confianca/estatisticas                              â†’ EstatÃ­sticas
GET  /confianca/:id                                       â†’ Obter item
POST /confianca/:id/revisar                               â†’ Revisar
POST /confianca/:id/descartar                             â†’ Descartar
POST /confianca/conformidade/:conformidadeId/auto-resolver â†’ Auto-resolver
GET  /confianca/exportar/csv                              â†’ Exportar CSV
```

**Services:**
- `confidence-queue.js` (service)
- `confidence-scorer.js` (service)

---

### 5. ðŸ”§ **GERADORES E PROCESSADORES**

#### **5.1 Doc Generator** (doc-controller.js)
**PropÃ³sito:** DocumentaÃ§Ã£o automatizada com IA

**Endpoints:**
```
POST /doc/gerar                  â†’ Gerar documentaÃ§Ã£o
POST /doc/salvar                 â†’ Salvar documentaÃ§Ã£o
GET  /doc/imagens/:produto       â†’ Listar imagens
GET  /doc/secoes/:produto        â†’ Listar seÃ§Ãµes
POST /doc/upload-contexto        â†’ Upload contexto
```

**Services:**
- `doc-generator.js` (service)

---

#### **5.2 Roadmap Generator** (roadmap-controller.js)
**PropÃ³sito:** GeraÃ§Ã£o de backlog a partir de lacunas

**Endpoints:**
```
POST  /roadmap/gerar              â†’ Gerar roadmap
GET   /roadmap                    â†’ Listar roadmaps
GET   /roadmap/:id                â†’ Obter roadmap
PATCH /roadmap/:id/item/:itemId   â†’ Atualizar item
POST  /roadmap/:id/item           â†’ Adicionar item
```

**Services:**
- `roadmap-engine.js` (service)

---

#### **5.3 Spec Generator** (spec-controller.js)
**PropÃ³sito:** EspecificaÃ§Ã£o tÃ©cnica de funcionalidades (PRD)

**Endpoints:**
```
POST  /spec/gerar          â†’ Gerar spec
GET   /spec                â†’ Listar specs
GET   /spec/:id            â†’ Obter spec
PATCH /spec/:id/status     â†’ Atualizar status
```

**Services:**
- `spec-engine.js` (service)

---

#### **5.4 Job Processor** (job-controller.js)
**PropÃ³sito:** Processamento em lote

**Endpoints:**
```
POST   /jobs/comparar-pasta  â†’ Criar job
GET    /jobs                 â†’ Listar jobs
GET    /jobs/:id             â†’ Obter job
DELETE /jobs/:id             â†’ Remover job
```

**Services:**
- `job-queue.js` (service)

---

### 6. ðŸ’¾ **INTEGRAÃ‡Ã•ES E CONECTORES**

#### **6.1 AxHub Connector** (axhub-controller.js)
**PropÃ³sito:** IntegraÃ§Ã£o com SQL Server AxHub

**Endpoints:**
```
GET /axhub/status          â†’ Status conexÃ£o
GET /axhub/resumo          â†’ Resumo geral
GET /axhub/equipamentos    â†’ Listar equipamentos
GET /axhub/operacoes       â†’ Listar operaÃ§Ãµes
GET /axhub/infracoes       â†’ Stats infraÃ§Ãµes
GET /axhub/heartbeat       â†’ Heartbeat equipamentos
GET /axhub/monitoramentos  â†’ Listar monitoramentos
GET /axhub/passagens       â†’ Ãšltimas passagens
GET /axhub/triagens        â†’ Stats triagens
GET /axhub/tabelas         â†’ Listar tabelas
```

**Services:**
- `axhub-db.js` (service)

---

#### **6.2 AxTon Connector** (axton-controller.js)
**PropÃ³sito:** IntegraÃ§Ã£o com SQL Server AxTon

**Endpoints:**
```
GET /axton/status       â†’ Status conexÃ£o
GET /axton/resumo       â†’ Resumo geral
GET /axton/pesagens     â†’ Ãšltimas pesagens
GET /axton/infracoes    â†’ Ãšltimas infraÃ§Ãµes
GET /axton/heartbeat    â†’ Heartbeat equipamentos
GET /axton/tabelas      â†’ Listar tabelas
```

**Services:**
- `axton-db.js` (service)

---

#### **6.3 AxCross Connector** (axcross-controller.js)
**PropÃ³sito:** IntegraÃ§Ã£o com SQL Server AxCross

**Endpoints:**
```
GET /axcross/status        â†’ Status conexÃ£o
GET /axcross/resumo        â†’ Resumo geral
GET /axcross/equipamentos  â†’ Listar equipamentos
GET /axcross/locais        â†’ Listar locais
GET /axcross/operacoes     â†’ Listar operaÃ§Ãµes
GET /axcross/passagens     â†’ Stats passagens
GET /axcross/heartbeat     â†’ Heartbeat equipamentos
GET /axcross/tabelas       â†’ Listar tabelas
```

**Services:**
- `axcross-db.js` (service)

---

#### **6.4 WhatsApp Connector** (whatsapp-controller.js)
**PropÃ³sito:** IntegraÃ§Ã£o e atendimento via WhatsApp

**Endpoints:**
```
POST   /whatsapp/iniciar           â†’ Iniciar conexÃ£o
GET    /whatsapp/status            â†’ Status conexÃ£o
GET    /whatsapp/sessoes           â†’ Listar sessÃµes
GET    /whatsapp/sessao/:telefone  â†’ Detalhes sessÃ£o
DELETE /whatsapp/sessao/:telefone  â†’ Encerrar sessÃ£o
POST   /whatsapp/send              â†’ Enviar mensagem
POST   /whatsapp/send-buttons      â†’ Enviar com botÃµes
POST   /whatsapp/desconectar       â†’ Desconectar
POST   /whatsapp/restart           â†’ Reiniciar
```

**Services:**
- `whatsapp.service.js` (service)
- `whatsapp-transport.js` (service)
- `whatsapp-flows.js` (service)

---

#### **6.5 Coletor PNCP** (coletor-controller.js)
**PropÃ³sito:** Coletor de fontes externas (PNCP + portais gov)

**Endpoints:**
```
GET  /coletor/operacoes      â†’ Listar operaÃ§Ãµes
GET  /coletor/pncp           â†’ Buscar PNCP
POST /coletor/pncp/importar  â†’ Importar selecionados
POST /coletor/pncp/coletar   â†’ Coletar produto
GET  /coletor/config         â†’ Obter config
POST /coletor/config         â†’ Salvar config
GET  /coletor/status         â†’ Status coletor
```

**Services:**
- `pncp-scraper.js` (service)

---

### 7. ðŸ“š **RECURSOS E CONHECIMENTO**

#### **7.1 Knowledge Base** (controller.js)
**PropÃ³sito:** Base de conhecimento com embeddings

**Endpoints:**
```
POST /treinar        â†’ Treinar IA
GET  /logs           â†’ Consultar logs MongoDB
GET  /analise        â†’ Consultar anÃ¡lise
GET  /kb             â†’ Listar entradas KB
```

**Admin KB:**
```
GET    /admin/kb/stats          â†’ EstatÃ­sticas KB
POST   /admin/reindexar-docs    â†’ Reindexar docs
POST   /admin/reindexar-jitbit  â†’ Reindexar Jitbit
DELETE /admin/kb/:modulo        â†’ Limpar mÃ³dulo
```

---

#### **7.2 Fontes de Pesquisa** (fontes-controller.js)
**PropÃ³sito:** URLs e referÃªncias de pesquisa

**Endpoints:**
```
POST   /fontes                    â†’ Adicionar fonte
GET    /fontes                    â†’ Listar fontes
GET    /fontes/mapa/:produto      â†’ Mapa cobertura
GET    /fontes/sugestoes/:produto â†’ SugestÃµes por produto
GET    /fontes/:id                â†’ Obter fonte
POST   /fontes/:id/analisar       â†’ Analisar fonte
DELETE /fontes/:id                â†’ Remover fonte
```

**Services:** Nenhum service dedicado

---

#### **7.3 CRM** (crm-controller.js + equipamento-controller.js)
**PropÃ³sito:** GestÃ£o de contatos, clientes e equipamentos

**Endpoints Contatos:**
```
GET /crm/contatos              â†’ Listar contatos
GET /crm/contatos/stats        â†’ Stats contatos
GET /crm/contatos/:telefone    â†’ Detalhe contato
PUT /crm/contatos/:telefone    â†’ Atualizar contato
```

**Endpoints Clientes:**
```
GET  /crm/clientes                  â†’ Listar clientes
POST /crm/clientes                  â†’ Criar cliente
PUT  /crm/clientes/:slug            â†’ Atualizar cliente
GET  /crm/clientes/:slug/contatos   â†’ Contatos do cliente
GET  /crm/clientes/:slug/equipamentos â†’ Equipamentos do cliente
```

**Endpoints Equipamentos:**
```
GET /crm/equipamentos         â†’ Listar equipamentos
GET /crm/equipamentos/stats   â†’ Stats equipamentos
GET /crm/equipamentos/busca   â†’ Busca equipamento
GET /crm/equipamentos/:alias  â†’ Detalhe equipamento
PUT /crm/equipamentos/:alias  â†’ Atualizar equipamento
```

**Busca Geral:**
```
GET /crm/busca  â†’ Busca CRM unificada
```

---

### 8. âš™ï¸ **SISTEMA E CONFIG**

#### **8.1 Config** (config-controller.js)
**Endpoints:**
```
GET  /config              â†’ Obter configuraÃ§Ã£o
POST /config              â†’ Salvar configuraÃ§Ã£o
POST /config/testar-mongo â†’ Testar MongoDB
```

---

#### **8.2 Health Check** (health-controller.js)
**Endpoints:**
```
GET /health  â†’ Health check
```

---

#### **8.3 Logs** (controller.js)
**Endpoints:**
```
GET /logs/historico      â†’ HistÃ³rico
GET /logs/pendentes      â†’ Pendentes
GET /logs/estatisticas   â†’ EstatÃ­sticas
```

---

## ðŸ—ï¸ PROPOSTA DE REESTRUTURAÃ‡ÃƒO

### **PROBLEMA ATUAL:**

1. âŒ **Controllers muito grandes** (varco-controller.js com ~641 linhas)
2. âŒ **LÃ³gica de negÃ³cio nos controllers** (deveria estar em services)
3. âŒ **Services desorganizados** (26 services sem padrÃ£o claro)
4. âŒ **DuplicaÃ§Ã£o de funcionalidades** (validadores espalhados)
5. âŒ **Falta de camada de domÃ­nio** (models apenas MongoDB)

---

### **ESTRUTURA PROPOSTA:**

```
axion-ia-api/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ ðŸ“‚ modules/                    â† NOVO: MÃ³dulos por domÃ­nio
â”‚   â”‚   â”œâ”€â”€ validation/
â”‚   â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ validation-manager.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ visual-validation.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ varco-validation.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ alert-flow-validation.controller.js
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ validation.service.js      â† NOVO
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ visual-validation.service.js â† NOVO
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ varco-validation.service.js  â† NOVO
â”‚   â”‚   â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ validation.model.js
â”‚   â”‚   â”‚   â””â”€â”€ routes/
â”‚   â”‚   â”‚       â””â”€â”€ validation.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ analysis/
â”‚   â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ medicao.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ image.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ conformidade.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ edital.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ duplicidade.controller.js
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ medicao-analyzer.service.js     â† NOVO
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ image-analyzer.service.js       â† REFACTOR
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ conformidade-analyzer.service.js â† REFACTOR
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ edital-analyzer.service.js      â† REFACTOR
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ duplicidade-analyzer.service.js â† NOVO
â”‚   â”‚   â”‚   â””â”€â”€ routes/
â”‚   â”‚   â”‚       â””â”€â”€ analysis.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ reporting/
â”‚   â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ relatorio-contrato.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ relatorio-fluxo.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ planilha-horas.controller.js
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ report-generator.service.js  â† NOVO
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ contract-report.service.js   â† REFACTOR
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ flow-report.service.js       â† NOVO
â”‚   â”‚   â”‚   â””â”€â”€ routes/
â”‚   â”‚   â”‚       â””â”€â”€ reporting.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ai/
â”‚   â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ chat.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ agent.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ confidence.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ helpdesk-ai.controller.js
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ia-adapter.service.js    â† REFACTOR
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ agent.service.js         â† NOVO
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ confidence.service.js    â† REFACTOR
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ helpdesk-ai.service.js   â† NOVO
â”‚   â”‚   â”‚   â”œâ”€â”€ core/                        â† Core IA
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ engine.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ classifier.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ prompt.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ kb.json
â”‚   â”‚   â”‚   â””â”€â”€ routes/
â”‚   â”‚   â”‚       â””â”€â”€ ai.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ generators/
â”‚   â”‚   â”‚   â”œâ”€â”€ controllers/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ doc.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ roadmap.controller.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ spec.controller.js
â”‚   â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ doc-generator.service.js    â† REFACTOR
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ roadmap-generator.service.js â† REFACTOR
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ spec-generator.service.js   â† REFACTOR
â”‚   â”‚   â”‚   â””â”€â”€ routes/
â”‚   â”‚   â”‚       â””â”€â”€ generators.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ integrations/
â”‚   â”‚   â”‚   â”œâ”€â”€ axhub/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axhub.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axhub-db.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ axhub.routes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ axton/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axton.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axton-db.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ axton.routes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ axcross/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axcross.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ axcross-db.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ axcross.routes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ whatsapp/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ whatsapp.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ whatsapp.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ whatsapp.routes.js
â”‚   â”‚   â”‚   â””â”€â”€ jitbit/
â”‚   â”‚   â”‚       â”œâ”€â”€ helpdesk.controller.js
â”‚   â”‚   â”‚       â”œâ”€â”€ jitbit.service.js
â”‚   â”‚   â”‚       â””â”€â”€ helpdesk.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ resources/
â”‚   â”‚   â”‚   â”œâ”€â”€ kb/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ kb.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ kb.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ kb.routes.js
â”‚   â”‚   â”‚   â”œâ”€â”€ fontes/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ fontes.controller.js
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ fontes.service.js
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ fontes.routes.js
â”‚   â”‚   â”‚   â””â”€â”€ crm/
â”‚   â”‚   â”‚       â”œâ”€â”€ crm.controller.js
â”‚   â”‚   â”‚       â”œâ”€â”€ crm.service.js
â”‚   â”‚   â”‚       â””â”€â”€ crm.routes.js
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ system/
â”‚   â”‚       â”œâ”€â”€ config/
â”‚   â”‚       â”œâ”€â”€ health/
â”‚   â”‚       â””â”€â”€ logs/
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ shared/                     â† Componentes compartilhados
â”‚   â”‚   â”œâ”€â”€ middleware/
â”‚   â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”œâ”€â”€ constants/
â”‚   â”‚   â””â”€â”€ types/
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“‚ database/                   â† Camada de dados
â”‚   â”‚   â”œâ”€â”€ mongodb/
â”‚   â”‚   â”‚   â””â”€â”€ connection.js
â”‚   â”‚   â””â”€â”€ mssql/
â”‚   â”‚       â””â”€â”€ connection.js
â”‚   â”‚
â”‚   â””â”€â”€ app.js                         â† Entry point
```

---

### **BENEFÃCIOS DA REESTRUTURAÃ‡ÃƒO:**

1. âœ… **ModularizaÃ§Ã£o por domÃ­nio** (validation, analysis, reporting, etc.)
2. âœ… **SeparaÃ§Ã£o clara de responsabilidades** (controller â†’ service â†’ model)
3. âœ… **Roteamento organizado** (cada mÃ³dulo tem suas rotas)
4. âœ… **Testabilidade** (services isolados, fÃ¡ceis de testar)
5. âœ… **Escalabilidade** (adicionar novos mÃ³dulos sem afetar existentes)
6. âœ… **Manutenibilidade** (cÃ³digo organizado, fÃ¡cil localizaÃ§Ã£o)
7. âœ… **Reusabilidade** (services podem ser usados por mÃºltiplos controllers)

---

### **PLANO DE MIGRAÃ‡ÃƒO:**

#### **Fase 1: PreparaÃ§Ã£o (1 dia)**
- [ ] Criar estrutura de pastas `modules/`
- [ ] Definir interfaces de services
- [ ] Criar templates de mÃ³dulos

#### **Fase 2: MigraÃ§Ã£o por MÃ³dulo (1-2 dias por mÃ³dulo)**
1. **Validation** (Alta prioridade)
   - Consolidar 4 validadores em 1 mÃ³dulo
   - Extrair lÃ³gica para services
   - Criar testes unitÃ¡rios

2. **Analysis** (Alta prioridade)
   - Consolidar 5 analisadores
   - Padronizar interface de anÃ¡lise
   - Criar pipeline de anÃ¡lise comum

3. **Reporting** (MÃ©dia prioridade)
   - Consolidar 3 geradores de relatÃ³rio
   - Padronizar formato de saÃ­da
   - Criar templates reutilizÃ¡veis

4. **AI** (Alta prioridade)
   - Reorganizar core IA
   - Extrair services de agent e confidence
   - Melhorar orchestrator

5. **Integrations** (Baixa prioridade)
   - Reorganizar em subpastas
   - Padronizar conexÃµes
   - Criar connection pool

6. **Resources** (Baixa prioridade)
   - MigraÃ§Ã£o direta (pouca mudanÃ§a)

#### **Fase 3: RefatoraÃ§Ã£o de Services (3-5 dias)**
- [ ] Extrair lÃ³gica de negÃ³cio dos controllers
- [ ] Criar services dedicados
- [ ] Implementar injeÃ§Ã£o de dependÃªncia

#### **Fase 4: Testes e ValidaÃ§Ã£o (2-3 dias)**
- [ ] Testes unitÃ¡rios de services
- [ ] Testes de integraÃ§Ã£o de mÃ³dulos
- [ ] Testes E2E das APIs

#### **Fase 5: DocumentaÃ§Ã£o (1-2 dias)**
- [ ] Documentar cada mÃ³dulo
- [ ] Atualizar README
- [ ] Criar diagramas de arquitetura

---

### **ESTIMATIVA TOTAL:**
**10-15 dias Ãºteis** para migraÃ§Ã£o completa

---

## ðŸ“ˆ MÃ‰TRICAS DO SISTEMA

### Controllers
- **Total:** 30 controllers
- **Linhas mÃ©dias:** ~200-300 linhas
- **Maior:** varco-controller.js (~641 linhas)

### Services
- **Total:** 26 services
- **PadrÃ£o:** Baixo (alguns services, muita lÃ³gica em controllers)

### Endpoints
- **Total:** ~200+ endpoints
- **REST:** ~95%
- **Verbos:** GET (60%), POST (30%), PUT/PATCH (5%), DELETE (5%)

### Models
- **MongoDB:** 17 models
- **SQL Server:** Queries diretas (sem ORM)

---

## ðŸŽ¯ PRÃ“XIMOS PASSOS

1. **Aprovar proposta de reestruturaÃ§Ã£o**
2. **Definir prioridade de mÃ³dulos**
3. **Iniciar migraÃ§Ã£o gradual**
4. **Manter funcionalidades operando durante migraÃ§Ã£o**
5. **Implementar testes progressivamente**

---

**Documento gerado em:** 2026-06-20  
**Autor:** AnÃ¡lise Automatizada - Axion Intelligence Platform


