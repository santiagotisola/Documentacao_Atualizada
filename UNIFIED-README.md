# UNIFIED - README E INDICE MESTRE

**Data de Consolidacao:** 2026-06-20  
**Arquivos consolidados:** 3

---

---

## ORIGEM: INDICE-MESTRE-UNIFIED.md

# ðŸ“‘ Ãndice Mestre - Sistema Unificado Axion

**Ãšltima atualizaÃ§Ã£o:** 2026-06-20  
**VersÃ£o:** 1.0

---

## ðŸŽ¯ DOCUMENTOS PRINCIPAIS

| Documento | DescriÃ§Ã£o | LocalizaÃ§Ã£o |
|-----------|-----------|-------------|
| **[Plano Organizacional](./PLANO-ORGANIZACIONAL-UNIFICACAO.md)** | Plano completo de unificaÃ§Ã£o | Raiz |
| **[Guia RÃ¡pido](./GUIA-RAPIDO-UNIFIED.md)** | Guia de uso diÃ¡rio | Raiz |
| **[Script de MigraÃ§Ã£o](./migrar-para-unified.ps1)** | Script automÃ¡tico de migraÃ§Ã£o | Raiz |
| **[Mapeamento de Funcionalidades](./MAPEAMENTO-FUNCIONALIDADES-SISTEMA.md)** | 200+ endpoints mapeados | Raiz |
| **[Diagrama de Arquitetura](./DIAGRAMA-ARQUITETURA-REESTRUTURACAO.md)** | Arquitetura ANTES vs DEPOIS | Raiz |
| **[Checklist de ReestruturaÃ§Ã£o](./CHECKLIST-REESTRUTURACAO.md)** | Guia passo a passo | Raiz |
| **[Resumo Executivo](./ANALISE-FUNCIONALIDADES-RESUMO-EXECUTIVO.md)** | Resumo para gestÃ£o | Raiz |

---

## ðŸ“‚ ESTRUTURA APÃ“S MIGRAÃ‡ÃƒO

```
C:\Projects\Axion-Unified/
â”‚
â”œâ”€â”€ ðŸ“‚ core/                              â† CÃ“DIGO PRINCIPAL
â”‚   â”œâ”€â”€ api/                              â† Backend API
â”‚   â”‚   â””â”€â”€ src/
â”‚   â”‚       â””â”€â”€ modules/                  â† MÃ“DULOS ORGANIZADOS
â”‚   â”‚           â”œâ”€â”€ ðŸ” investigators/     (5 processos)
â”‚   â”‚           â”œâ”€â”€ ðŸ“Š analyzers/         (5 processos)
â”‚   â”‚           â”œâ”€â”€ ðŸ“„ reporters/         (4 processos)
â”‚   â”‚           â”œâ”€â”€ ðŸ¤– ai-processors/     (5 processos)
â”‚   â”‚           â”œâ”€â”€ ðŸ­ generators/        (3 processos)
â”‚   â”‚           â”œâ”€â”€ ðŸ”Œ connectors/        (6 processos)
â”‚   â”‚           â”œâ”€â”€ ðŸ“š repositories/      (3 processos)
â”‚   â”‚           â””â”€â”€ âš™ï¸ system-services/   (4 processos)
â”‚   â”‚
â”‚   â””â”€â”€ panel/                            â† Frontend React
â”‚       â””â”€â”€ src/
â”‚
â”œâ”€â”€ ðŸ“‚ products/                          â† PRODUTOS
â”‚   â”œâ”€â”€ axhub/
â”‚   â”œâ”€â”€ axton/
â”‚   â””â”€â”€ axcross/
â”‚
â”œâ”€â”€ ðŸ“‚ docs/                              â† DOCUMENTAÃ‡ÃƒO
â”‚   â”œâ”€â”€ portals/                          â† Docusaurus
â”‚   â”œâ”€â”€ guides/                           â† Guias
â”‚   â”œâ”€â”€ analysis/                         â† AnÃ¡lises
â”‚   â””â”€â”€ references/                       â† ReferÃªncias
â”‚
â”œâ”€â”€ ðŸ“‚ data/                              â† DADOS
â”‚   â”œâ”€â”€ databases/                        â† SQL schemas
â”‚   â”œâ”€â”€ knowledge-base/                   â† KB
â”‚   â”œâ”€â”€ uploads/                          â† Uploads
â”‚   â””â”€â”€ exports/                          â† RelatÃ³rios
â”‚
â”œâ”€â”€ ðŸ“‚ tools/                             â† FERRAMENTAS
â”‚   â”œâ”€â”€ scripts/
â”‚   â”œâ”€â”€ automation/
â”‚   â””â”€â”€ migration/
â”‚
â”œâ”€â”€ ðŸ“‚ resources/                         â† RECURSOS
â”‚   â”œâ”€â”€ media/
â”‚   â”œâ”€â”€ pdfs/
â”‚   â””â”€â”€ templates/
â”‚
â””â”€â”€ ðŸ“‚ config/                            â† CONFIGURAÃ‡ÃƒO
    â”œâ”€â”€ environments/
    â”œâ”€â”€ deployments/
    â””â”€â”€ backups/
```

---

## ðŸ—ºï¸ NAVEGAÃ‡ÃƒO POR TAREFA

### **Quero desenvolver...**

#### **Um Validador (Investigador)**
```
ðŸ“ Local: core/api/src/modules/investigators/
ðŸ“– Docs: PLANO-ORGANIZACIONAL-UNIFICACAO.md (seÃ§Ã£o Investigadores)
ðŸŽ¯ Exemplos: varco-monitor/, duplicity-auditor/
```

#### **Um Analisador**
```
ðŸ“ Local: core/api/src/modules/analyzers/
ðŸ“– Docs: PLANO-ORGANIZACIONAL-UNIFICACAO.md (seÃ§Ã£o Analisadores)
ðŸŽ¯ Exemplos: measurement-analyzer/, image-analyzer/
```

#### **Um Gerador de RelatÃ³rios**
```
ðŸ“ Local: core/api/src/modules/reporters/
ðŸ“– Docs: PLANO-ORGANIZACIONAL-UNIFICACAO.md (seÃ§Ã£o Geradores de RelatÃ³rios)
ðŸŽ¯ Exemplos: contract-reporter/, flow-reporter/
```

#### **Um Processador IA**
```
ðŸ“ Local: core/api/src/modules/ai-processors/
ðŸ“– Docs: PLANO-ORGANIZACIONAL-UNIFICACAO.md (seÃ§Ã£o Processadores IA)
ðŸŽ¯ Exemplos: chat-assistant/, helpdesk-ai/
```

#### **Um Gerador (Docs/Specs/Roadmaps)**
```
ðŸ“ Local: core/api/src/modules/generators/
ðŸ“– Docs: PLANO-ORGANIZACIONAL-UNIFICACAO.md (seÃ§Ã£o Geradores)
ðŸŽ¯ Exemplos: doc-generator/, roadmap-generator/
```

#### **Um Conector**
```
ðŸ“ Local: core/api/src/modules/connectors/
ðŸ“– Docs: PLANO-ORGANIZACIONAL-UNIFICACAO.md (seÃ§Ã£o Conectores)
ðŸŽ¯ Exemplos: axhub-connector/, whatsapp-connector/
```

---

### **Quero documentar...**

#### **Funcionalidade do AxHub**
```
ðŸ“ Local: docs/portals/axhub-portal/docs/
ðŸ“– Guia: GUIA-RAPIDO-UNIFIED.md (seÃ§Ã£o Adicionar DocumentaÃ§Ã£o)
ðŸŽ¯ Estrutura: cadastros/, operacoes/, infracoes/, etc.
```

#### **Funcionalidade do AxTon**
```
ðŸ“ Local: docs/portals/axton-portal/docs/
ðŸ“– Guia: GUIA-RAPIDO-UNIFIED.md (seÃ§Ã£o Adicionar DocumentaÃ§Ã£o)
ðŸŽ¯ Estrutura: pesagem/, medicoes/, infracoes/, etc.
```

#### **Funcionalidade do AxCross**
```
ðŸ“ Local: docs/portals/axcross-portal/docs/
ðŸ“– Guia: GUIA-RAPIDO-UNIFIED.md (seÃ§Ã£o Adicionar DocumentaÃ§Ã£o)
ðŸŽ¯ Estrutura: operacoes/, relatorios/, cadastros/, etc.
```

#### **AnÃ¡lise TÃ©cnica**
```
ðŸ“ Local: docs/analysis/technical-analysis/
ðŸ“– Guia: GUIA-RAPIDO-UNIFIED.md (seÃ§Ã£o Adicionar DocumentaÃ§Ã£o)
ðŸŽ¯ PadrÃ£o: ANALISE-{DESCRICAO}.md
```

#### **Arquitetura do Sistema**
```
ðŸ“ Local: docs/references/architecture/
ðŸ“– Exemplos: Ver lista de documentos principais acima
ðŸŽ¯ PadrÃ£o: {TIPO}-{DESCRICAO}.md
```

---

### **Quero gerenciar dados...**

#### **Upload de Arquivos**
```
ðŸ“ Local: data/uploads/
ðŸ“‚ Estrutura:
   â”œâ”€â”€ images/ (por sistema)
   â”œâ”€â”€ documents/
   â””â”€â”€ contexts/
```

#### **RelatÃ³rios Gerados**
```
ðŸ“ Local: data/exports/reports/
ðŸ“‚ Estrutura:
   â”œâ”€â”€ contracts/
   â”œâ”€â”€ flows/
   â””â”€â”€ hours/
```

#### **Knowledge Base**
```
ðŸ“ Local: data/knowledge-base/
ðŸ“‚ Estrutura:
   â”œâ”€â”€ embeddings/
   â”œâ”€â”€ training-data/
   â””â”€â”€ kb.json
```

#### **Database Schemas**
```
ðŸ“ Locais:
   â”œâ”€â”€ products/axhub/database/schema.sql
   â”œâ”€â”€ products/axton/database/schema.sql
   â””â”€â”€ products/axcross/database/schema.sql
```

---

## ðŸ”§ OPERAÃ‡Ã•ES

### **Executar MigraÃ§Ã£o**
```powershell
# Testar (dry-run)
.\migrar-para-unified.ps1 -DryRun

# Executar
.\migrar-para-unified.ps1

# Ver detalhes
Get-Help .\migrar-para-unified.ps1 -Detailed
```

### **Fazer Backup**
```powershell
# ApÃ³s migraÃ§Ã£o
C:\Projects\Axion-Unified\tools\scripts\powershell\backup.ps1

# Backup salvo em
D:\Backups\Axion-Unified\
```

### **Iniciar Desenvolvimento**
```powershell
# API
cd C:\Projects\Axion-Unified\core\api
npm install
npm run dev

# Panel
cd C:\Projects\Axion-Unified\core\panel
npm install
npm run dev
```

---

## ðŸ“Š PROCESSOS POR CATEGORIA

### **ðŸ” Investigadores (5)**
| Processo | DescriÃ§Ã£o | Endpoints |
|----------|-----------|-----------|
| validation-manager | ValidaÃ§Ã£o sistemas web | 5 |
| visual-validator | ValidaÃ§Ã£o visual UI | 5 |
| varco-monitor | Monitor cÃ¢meras VARCO | 12 |
| alert-flow-validator | ValidaÃ§Ã£o fluxo alertas | 1 |
| duplicity-auditor | Auditoria duplicidades | 5 |

### **ðŸ“Š Analisadores (5)**
| Processo | DescriÃ§Ã£o | Endpoints |
|----------|-----------|-----------|
| measurement-analyzer | AnÃ¡lise mediÃ§Ãµes | 4 |
| image-analyzer | AnÃ¡lise imagens (OCR) | 14 |
| compliance-analyzer | AnÃ¡lise conformidade | 11 |
| tender-analyzer | AnÃ¡lise editais | 9 |
| strategic-reader | Leitura estratÃ©gica 80/20 | 2 |

### **ðŸ“„ Geradores de RelatÃ³rios (4)**
| Processo | DescriÃ§Ã£o | Endpoints |
|----------|-----------|-----------|
| contract-reporter | RelatÃ³rios por contrato | 6 |
| flow-reporter | RelatÃ³rios de fluxo | 3 |
| hours-reporter | Planilha de horas | 2 |
| sla-reporter | RelatÃ³rio SLA | 2 |

### **ðŸ¤– Processadores IA (5)**
| Processo | DescriÃ§Ã£o | Endpoints |
|----------|-----------|-----------|
| chat-assistant | Assistente chat | 7 |
| agent-orchestrator | Orquestrador agentes | 6 |
| helpdesk-ai | IA helpdesk | 16 |
| confidence-manager | Gerenciador confianÃ§a | 7 |
| classifier | Classificador intenÃ§Ãµes | - |

### **ðŸ­ Geradores (3)**
| Processo | DescriÃ§Ã£o | Endpoints |
|----------|-----------|-----------|
| doc-generator | Gerador documentaÃ§Ã£o | 4 |
| roadmap-generator | Gerador roadmaps | 5 |
| spec-generator | Gerador especificaÃ§Ãµes | 4 |

### **ðŸ”Œ Conectores (6)**
| Processo | DescriÃ§Ã£o | Endpoints |
|----------|-----------|-----------|
| axhub-connector | IntegraÃ§Ã£o AxHub | 10 |
| axton-connector | IntegraÃ§Ã£o AxTon | 6 |
| axcross-connector | IntegraÃ§Ã£o AxCross | 8 |
| whatsapp-connector | IntegraÃ§Ã£o WhatsApp | 9 |
| jitbit-connector | IntegraÃ§Ã£o Jitbit | 16 |
| pncp-connector | IntegraÃ§Ã£o PNCP | 7 |

### **ðŸ“š RepositÃ³rios (3)**
| Processo | DescriÃ§Ã£o | Endpoints |
|----------|-----------|-----------|
| knowledge-base | Base conhecimento | 8 |
| sources-registry | Registro fontes | 7 |
| crm-repository | CRM (contatos/clientes) | 17 |

### **âš™ï¸ ServiÃ§os de Sistema (4)**
| Processo | DescriÃ§Ã£o | Endpoints |
|----------|-----------|-----------|
| configuration | Gerenciamento config | 3 |
| health-monitor | Health checks | 1 |
| log-manager | Gerenciamento logs | 3 |
| upload-service | Upload arquivos | 2 |

---

## ðŸ“ˆ ESTATÃSTICAS

### **MÃ©tricas Gerais**
- **Total de Processos:** 35
- **Total de Endpoints:** ~200
- **Categorias:** 8
- **Controllers:** 30+
- **Services:** 26+
- **Models:** 17

### **DistribuiÃ§Ã£o por Categoria**
| Categoria | Processos | Endpoints | % |
|-----------|-----------|-----------|---|
| Conectores | 6 | 56 | 28% |
| Analisadores | 5 | 40 | 20% |
| IA Processors | 5 | 36 | 18% |
| RepositÃ³rios | 3 | 32 | 16% |
| Investigadores | 5 | 28 | 14% |
| Geradores | 3 | 13 | 6.5% |
| Reporters | 4 | 11 | 5.5% |
| Sistema | 4 | 9 | 4.5% |

---

## ðŸŽ¯ FLUXOS DE TRABALHO

### **Fluxo 1: ValidaÃ§Ã£o â†’ AnÃ¡lise â†’ RelatÃ³rio**
```
VARCO Monitor â†’ Measurement Analyzer â†’ Flow Reporter â†’ PDF
```

### **Fluxo 2: IntegraÃ§Ã£o â†’ IA â†’ Resposta**
```
Jitbit Connector â†’ Helpdesk AI â†’ Knowledge Base â†’ Confidence Manager â†’ Resposta
```

### **Fluxo 3: Coleta â†’ AnÃ¡lise â†’ Conformidade â†’ RelatÃ³rio**
```
PNCP Connector â†’ Tender Analyzer â†’ Compliance Analyzer â†’ Contract Reporter â†’ RelatÃ³rio
```

---

## âœ… CHECKLIST DE VALIDAÃ‡ÃƒO

### **ApÃ³s MigraÃ§Ã£o**
- [ ] Estrutura criada corretamente
- [ ] Arquivos migrados (cÃ³digo, docs, dados)
- [ ] API inicia sem erros
- [ ] Panel inicia sem erros
- [ ] Portais Docusaurus buildables
- [ ] Testes passam
- [ ] Git configurado
- [ ] Backup funcionando

### **Desenvolvimento DiÃ¡rio**
- [ ] Backup antes de mudanÃ§as grandes
- [ ] Commits frequentes
- [ ] Testes para cÃ³digo novo
- [ ] DocumentaÃ§Ã£o atualizada
- [ ] Code review

---

## ðŸ“ž SUPORTE E RECURSOS

### **DocumentaÃ§Ã£o TÃ©cnica**
- [Plano Organizacional Completo](./PLANO-ORGANIZACIONAL-UNIFICACAO.md)
- [Mapeamento de Funcionalidades](./MAPEAMENTO-FUNCIONALIDADES-SISTEMA.md)
- [Diagrama de Arquitetura](./DIAGRAMA-ARQUITETURA-REESTRUTURACAO.md)
- [Checklist de ReestruturaÃ§Ã£o](./CHECKLIST-REESTRUTURACAO.md)

### **Guias de Uso**
- [Guia RÃ¡pido](./GUIA-RAPIDO-UNIFIED.md)
- [Resumo Executivo](./ANALISE-FUNCIONALIDADES-RESUMO-EXECUTIVO.md)

### **Scripts**
- [MigraÃ§Ã£o Completa](./migrar-para-unified.ps1)
- Outros scripts em: `tools/scripts/`

---

## ðŸš€ INÃCIO RÃPIDO

```powershell
# 1. Executar migraÃ§Ã£o
.\migrar-para-unified.ps1

# 2. Navegar para estrutura unificada
cd C:\Projects\Axion-Unified

# 3. Iniciar API
cd core\api
npm install
npm run dev

# 4. Iniciar Panel (novo terminal)
cd core\panel
npm install
npm run dev

# 5. Acessar
# API: http://localhost:3100
# Panel: http://localhost:3017
```

---

**Preparado por:** Axion IA  
**Data:** 2026-06-20  
**VersÃ£o:** 1.0  
**Status:** âœ… Pronto para Uso


---

## ORIGEM: README-UNIFICACAO.md

# ðŸ—ï¸ Plano de UnificaÃ§Ã£o - Axion Intelligence Platform

**Data:** 2026-06-20  
**VersÃ£o:** 1.0  
**Status:** âœ… Pronto para ExecuÃ§Ã£o

---

## ðŸŽ¯ OBJETIVO

Unificar toda a estrutura do ecossistema Axion em um Ãºnico local centralizado, com:
- âœ… Relacionamentos claros entre processos
- âœ… Processos unificados por critÃ©rios
- âœ… Base Ãºnica de pesquisas
- âœ… Estrutura Ãºnica para facilitar manutenÃ§Ã£o e backup

---

## ðŸ“š DOCUMENTAÃ‡ÃƒO COMPLETA

Este repositÃ³rio contÃ©m o **plano completo de unificaÃ§Ã£o** com 7 documentos principais:

### **1. ðŸ“‹ [Ãndice Mestre](./INDICE-MESTRE-UNIFIED.md)** â­
**Comece aqui!** NavegaÃ§Ã£o completa de toda a estrutura.

### **2. ðŸ—ï¸ [Plano Organizacional](./PLANO-ORGANIZACIONAL-UNIFICACAO.md)**
Plano detalhado de unificaÃ§Ã£o com:
- Taxonomia de processos (8 categorias)
- Estrutura unificada proposta
- Matriz de relacionamentos
- Fases de migraÃ§Ã£o

### **3. ðŸš€ [Guia RÃ¡pido](./GUIA-RAPIDO-UNIFIED.md)**
Guia prÃ¡tico para uso diÃ¡rio:
- InÃ­cio rÃ¡pido
- Onde estÃ¡ cada coisa
- OperaÃ§Ãµes comuns
- Troubleshooting

### **4. ðŸ”§ [Script de MigraÃ§Ã£o](./migrar-para-unified.ps1)**
Script PowerShell automÃ¡tico para migraÃ§Ã£o completa.

### **5. ðŸ—ºï¸ [Mapeamento de Funcionalidades](./MAPEAMENTO-FUNCIONALIDADES-SISTEMA.md)**
InventÃ¡rio completo:
- 200+ endpoints mapeados
- 30+ controllers
- 8 categorias funcionais

### **6. ðŸ›ï¸ [Diagrama de Arquitetura](./DIAGRAMA-ARQUITETURA-REESTRUTURACAO.md)**
Comparativo visual:
- Estrutura ANTES vs DEPOIS
- Fluxos de requisiÃ§Ã£o
- Exemplos de cÃ³digo refatorado

### **7. âœ… [Checklist de ReestruturaÃ§Ã£o](./CHECKLIST-REESTRUTURACAO.md)**
Guia passo a passo:
- Templates de cÃ³digo
- Checklist por fase
- Tracking de progresso

---

## ðŸš€ INÃCIO RÃPIDO

### **Passo 1: Revisar DocumentaÃ§Ã£o**
```powershell
# Abrir Ã­ndice mestre
code INDICE-MESTRE-UNIFIED.md

# Revisar plano organizacional
code PLANO-ORGANIZACIONAL-UNIFICACAO.md

# Ler guia rÃ¡pido
code GUIA-RAPIDO-UNIFIED.md
```

### **Passo 2: Testar MigraÃ§Ã£o (Dry Run)**
```powershell
# Testar sem fazer alteraÃ§Ãµes
.\migrar-para-unified.ps1 -DryRun

# Ver o que serÃ¡ feito
```

### **Passo 3: Executar MigraÃ§Ã£o**
```powershell
# Executar migraÃ§Ã£o real
.\migrar-para-unified.ps1

# Destino padrÃ£o: C:\Projects\Axion-Unified
```

### **Passo 4: Validar Estrutura**
```powershell
# Navegar para estrutura unificada
cd C:\Projects\Axion-Unified

# Verificar estrutura
tree /F /A

# Iniciar serviÃ§os
cd core\api && npm install && npm run dev
cd core\panel && npm install && npm run dev
```

---

## ðŸ“Š VISÃƒO GERAL DA UNIFICAÃ‡ÃƒO

### **De: Estrutura Fragmentada** âŒ
```
âŒ 100+ arquivos .md espalhados na raiz
âŒ 3 portais Docusaurus duplicados
âŒ Dados em mÃºltiplos locais
âŒ Scripts espalhados
âŒ Relacionamentos obscuros
```

### **Para: Estrutura Unificada** âœ…
```
âœ… Tudo em um Ãºnico local centralizado
âœ… 8 categorias claras de processos
âœ… Base Ãºnica de dados
âœ… Scripts organizados
âœ… Relacionamentos explÃ­citos
```

---

## ðŸ—‚ï¸ ESTRUTURA APÃ“S UNIFICAÃ‡ÃƒO

```
Axion-Unified/
â”œâ”€â”€ ðŸ“‚ core/                    â† AplicaÃ§Ãµes (API + Panel)
â”‚   â”œâ”€â”€ api/                    â† Backend
â”‚   â”‚   â””â”€â”€ src/modules/        â† 8 categorias de processos
â”‚   â””â”€â”€ panel/                  â† Frontend React
â”‚
â”œâ”€â”€ ðŸ“‚ products/                â† Produtos (AxHub, AxTon, AxCross)
â”‚   â”œâ”€â”€ axhub/
â”‚   â”œâ”€â”€ axton/
â”‚   â””â”€â”€ axcross/
â”‚
â”œâ”€â”€ ðŸ“‚ docs/                    â† DocumentaÃ§Ã£o unificada
â”‚   â”œâ”€â”€ portals/                â† Docusaurus
â”‚   â”œâ”€â”€ guides/                 â† Guias
â”‚   â”œâ”€â”€ analysis/               â† AnÃ¡lises
â”‚   â””â”€â”€ references/             â† ReferÃªncias
â”‚
â”œâ”€â”€ ðŸ“‚ data/                    â† Base Ãºnica de dados
â”‚   â”œâ”€â”€ databases/
â”‚   â”œâ”€â”€ knowledge-base/
â”‚   â”œâ”€â”€ uploads/
â”‚   â””â”€â”€ exports/
â”‚
â”œâ”€â”€ ðŸ“‚ tools/                   â† Scripts e ferramentas
â”‚   â”œâ”€â”€ scripts/
â”‚   â”œâ”€â”€ automation/
â”‚   â””â”€â”€ migration/
â”‚
â”œâ”€â”€ ðŸ“‚ resources/               â† MÃ­dia e templates
â”‚   â”œâ”€â”€ media/
â”‚   â”œâ”€â”€ pdfs/
â”‚   â””â”€â”€ templates/
â”‚
â””â”€â”€ ðŸ“‚ config/                  â† ConfiguraÃ§Ãµes
    â”œâ”€â”€ environments/
    â”œâ”€â”€ deployments/
    â””â”€â”€ backups/
```

---

## ðŸ“‹ TAXONOMIA DE PROCESSOS

### **8 Categorias Organizadas**

| Categoria | DescriÃ§Ã£o | Processos | Endpoints |
|-----------|-----------|-----------|-----------|
| **ðŸ” Investigadores** | Validam e auditam (read-only) | 5 | 28 |
| **ðŸ“Š Analisadores** | Processam dados e geram insights | 5 | 40 |
| **ðŸ“„ Reporters** | Compilam relatÃ³rios formatados | 4 | 11 |
| **ðŸ¤– IA Processors** | Utilizam inteligÃªncia artificial | 5 | 36 |
| **ðŸ­ Geradores** | Criam artefatos (docs/specs) | 3 | 13 |
| **ðŸ”Œ Conectores** | Integram sistemas externos | 6 | 56 |
| **ðŸ“š RepositÃ³rios** | Armazenam dados (CRUD) | 3 | 32 |
| **âš™ï¸ Sistema** | Infraestrutura e suporte | 4 | 9 |

**Total:** 35 processos, ~200 endpoints

---

## ðŸ”— RELACIONAMENTOS

### **Exemplo: Fluxo VARCO**
```
VARCO Monitor (Investigador)
    â†“ coleta dados
Measurement Analyzer (Analisador)
    â†“ processa mÃ©tricas
Flow Reporter (Reporter)
    â†“ gera relatÃ³rio
PDF Exportado
```

### **Exemplo: Fluxo Helpdesk IA**
```
Jitbit Connector (Conector)
    â†“ busca tickets
Helpdesk AI (IA Processor)
    â†“ classifica e consulta
Knowledge Base (Repository)
    â†“ gera resposta
Confidence Manager valida
    â†“ envia resposta
Ticket respondido
```

---

## âœ… BENEFÃCIOS DA UNIFICAÃ‡ÃƒO

| Aspecto | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| **LocalizaÃ§Ã£o** | 2-5 min | < 30s | ðŸ“‰ -83% |
| **Backup** | 30 min (mÃºltiplos) | 5 min (Ãºnico) | ðŸ“‰ -83% |
| **DuplicaÃ§Ã£o** | Alta (3x portais) | Zero | ðŸ“‰ -100% |
| **Relacionamentos** | Obscuros | Claros | ðŸ“ˆ +100% |
| **ManutenÃ§Ã£o** | DifÃ­cil | FÃ¡cil | ðŸ“ˆ +200% |
| **Onboarding** | 2-3 dias | < 1 dia | ðŸ“‰ -66% |

---

## ðŸ“… TIMELINE

### **Estimativa: 10-15 minutos** (migraÃ§Ã£o automÃ¡tica)

| Fase | AÃ§Ã£o | Tempo |
|------|------|-------|
| **1** | Criar estrutura | ~2 min |
| **2** | Migrar cÃ³digo | ~3 min |
| **3** | Migrar produtos | ~1 min |
| **4** | Migrar documentaÃ§Ã£o | ~3 min |
| **5** | Migrar dados | ~2 min |
| **6** | Migrar scripts/recursos | ~2 min |
| **7** | ConfiguraÃ§Ãµes | ~1 min |

---

## ðŸŽ¯ CASOS DE USO

### **Preciso encontrar...**
âœ… Consulte: [Guia RÃ¡pido - SeÃ§Ã£o "Onde estÃ¡ cada coisa"](./GUIA-RAPIDO-UNIFIED.md)

### **Preciso criar um novo processo**
âœ… Consulte: [Plano Organizacional - Taxonomia](./PLANO-ORGANIZACIONAL-UNIFICACAO.md)

### **Preciso documentar uma funcionalidade**
âœ… Consulte: [Guia RÃ¡pido - SeÃ§Ã£o "Adicionar DocumentaÃ§Ã£o"](./GUIA-RAPIDO-UNIFIED.md)

### **Preciso fazer backup**
âœ… Consulte: [Guia RÃ¡pido - SeÃ§Ã£o "Fazer Backup"](./GUIA-RAPIDO-UNIFIED.md)

---

## ðŸ”§ SUPORTE

### **Problemas durante migraÃ§Ã£o?**
1. Execute com `-DryRun` primeiro
2. Verifique logs do script
3. Consulte: [Guia RÃ¡pido - Troubleshooting](./GUIA-RAPIDO-UNIFIED.md)

### **DÃºvidas sobre estrutura?**
1. Consulte: [Ãndice Mestre](./INDICE-MESTRE-UNIFIED.md)
2. Consulte: [Plano Organizacional](./PLANO-ORGANIZACIONAL-UNIFICACAO.md)

### **Preciso de exemplos?**
1. Consulte: [Diagrama de Arquitetura](./DIAGRAMA-ARQUITETURA-REESTRUTURACAO.md)
2. Consulte: [Checklist](./CHECKLIST-REESTRUTURACAO.md)

---

## ðŸ“ˆ MÃ‰TRICAS DE SUCESSO

### **KPIs Esperados**

| MÃ©trica | Objetivo | Como Medir |
|---------|----------|------------|
| Tempo de localizaÃ§Ã£o | < 30s | Survey |
| Tempo de backup | < 5 min | CronÃ´metro |
| DuplicaÃ§Ã£o | 0% | AnÃ¡lise manual |
| SatisfaÃ§Ã£o equipe | > 90% | Survey |

---

## âœ¨ PRÃ“XIMOS PASSOS

1. âœ… **Ler [Ãndice Mestre](./INDICE-MESTRE-UNIFIED.md)**
2. âœ… **Revisar [Plano Organizacional](./PLANO-ORGANIZACIONAL-UNIFICACAO.md)**
3. âœ… **Ler [Guia RÃ¡pido](./GUIA-RAPIDO-UNIFIED.md)**
4. âœ… **Executar migraÃ§Ã£o (dry-run):** `.\migrar-para-unified.ps1 -DryRun`
5. âœ… **Executar migraÃ§Ã£o real:** `.\migrar-para-unified.ps1`
6. âœ… **Validar estrutura**
7. âœ… **Iniciar desenvolvimento**

---

## ðŸ“ž CONTATO

Para dÃºvidas ou suporte, consulte a documentaÃ§Ã£o completa ou abra uma issue.

---

## ðŸ“ CHANGELOG

### **v1.0 - 2026-06-20**
- âœ… CriaÃ§Ã£o do plano organizacional completo
- âœ… Taxonomia de 8 categorias de processos
- âœ… Script de migraÃ§Ã£o automÃ¡tica
- âœ… DocumentaÃ§Ã£o completa (7 documentos)
- âœ… Guias de uso e troubleshooting

---

**Preparado por:** Axion IA  
**Data:** 2026-06-20  
**Status:** âœ… Pronto para ExecuÃ§Ã£o  
**LicenÃ§a:** Interno Axion Tecnologia

---

## ðŸŽ¯ RESUMO EXECUTIVO

Este projeto unifica **toda a estrutura do ecossistema Axion** em um Ãºnico local, organizando **35 processos** em **8 categorias claras**, com **200+ endpoints** mapeados, facilitando:
- âœ… LocalizaÃ§Ã£o de arquivos (reduÃ§Ã£o de 83% no tempo)
- âœ… Backup simplificado (reduÃ§Ã£o de 83% no tempo)
- âœ… EliminaÃ§Ã£o de duplicaÃ§Ã£o (100%)
- âœ… Relacionamentos claros entre processos
- âœ… ManutenÃ§Ã£o facilitada (melhoria de 200%)

**Execute `.\migrar-para-unified.ps1` para iniciar!**


---

## ORIGEM: CHECKLIST-REESTRUTURACAO.md

# âœ… Checklist de ReestruturaÃ§Ã£o - Guia PrÃ¡tico

**Axion Intelligence Platform**  
**Data:** 2026-06-20  
**Objetivo:** Guia passo a passo para migraÃ§Ã£o modular

---

## ðŸ“‹ FASE 1: PREPARAÃ‡ÃƒO (1 dia)

### âœ… 1.1 Criar Estrutura de Pastas

```bash
# Executar na raiz do axion-ia-api
mkdir -p src/modules/validation/{controllers,services,repositories,models,types,utils}
mkdir -p src/modules/analysis/{controllers,services,repositories,models,types,utils}
mkdir -p src/modules/reporting/{controllers,services,repositories,models,types,utils}
mkdir -p src/modules/ai/{controllers,services,core,agent,models}
mkdir -p src/modules/generators/{controllers,services,models}
mkdir -p src/modules/integrations/{axhub,axton,axcross,whatsapp,jitbit,pncp}
mkdir -p src/modules/resources/{kb,fontes,crm}
mkdir -p src/modules/system/{config,health,logs,upload}
mkdir -p src/shared/{middleware,utils,constants,types}
mkdir -p src/database/{mongodb,mssql}
```

**Checklist:**
- [ ] Pastas criadas
- [ ] Estrutura validada
- [ ] README.md criado em cada mÃ³dulo

---

### âœ… 1.2 Criar Templates de Arquivos

#### **Template: Controller**

```javascript
// modules/{module}/controllers/{name}.controller.js
import { {service}Service } from '../services/{service}.service.js';
import { AppError } from '../../../shared/utils/app-error.js';

/**
 * {Description}
 * @module {Module}Controller
 */

/**
 * {Action description}
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {NextFunction} next - Express next
 */
export async function {actionName}(req, res, next) {
  try {
    const { param1, param2 } = req.body;
    
    // ValidaÃ§Ã£o bÃ¡sica (pode usar validator service)
    if (!param1) {
      throw new AppError('param1 Ã© obrigatÃ³rio', 400);
    }
    
    // Delegar para service
    const result = await {service}Service.{action}(param1, param2);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export default {
  {actionName}
};
```

---

#### **Template: Service**

```javascript
// modules/{module}/services/{name}.service.js
import { {model}Repository } from '../repositories/{model}.repository.js';
import { AppError } from '../../../shared/utils/app-error.js';
import { logger } from '../../../shared/utils/logger.js';

/**
 * {Description}
 * @class {Name}Service
 */
export class {Name}Service {
  
  constructor(repository) {
    this.repository = repository || {model}Repository;
  }
  
  /**
   * {Action description}
   * @param {type} param1 - Description
   * @returns {Promise<Object>} Result
   */
  async {action}(param1, param2) {
    try {
      logger.info(`{Action} initiated with param1: ${param1}`);
      
      // 1. ValidaÃ§Ãµes de negÃ³cio
      await this.validate(param1, param2);
      
      // 2. Processar lÃ³gica
      const data = await this.process(param1, param2);
      
      // 3. Persistir se necessÃ¡rio
      const result = await this.repository.save(data);
      
      logger.info(`{Action} completed successfully`);
      return result;
      
    } catch (error) {
      logger.error(`Error in {action}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * ValidaÃ§Ãµes de negÃ³cio
   * @private
   */
  async validate(param1, param2) {
    // ValidaÃ§Ãµes especÃ­ficas do domÃ­nio
    if (!param1) {
      throw new AppError('param1 Ã© obrigatÃ³rio', 400);
    }
  }
  
  /**
   * Processamento principal
   * @private
   */
  async process(param1, param2) {
    // LÃ³gica de negÃ³cio isolada e testÃ¡vel
    return {
      // resultado processado
    };
  }
}

// Singleton export
export const {name}Service = new {Name}Service();

// Named export para testes com DI
export default {Name}Service;
```

---

#### **Template: Repository**

```javascript
// modules/{module}/repositories/{name}.repository.js
import { {Model} } from '../models/{model}.model.js';
import { AppError } from '../../../shared/utils/app-error.js';

/**
 * {Description}
 * @class {Name}Repository
 */
export class {Name}Repository {
  
  constructor(model) {
    this.model = model || {Model};
  }
  
  /**
   * Buscar por ID
   */
  async findById(id) {
    try {
      const result = await this.model.findById(id);
      if (!result) {
        throw new AppError('Registro nÃ£o encontrado', 404);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Buscar todos com filtros
   */
  async findAll(filters = {}, options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    
    return await this.model
      .find(filters)
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .exec();
  }
  
  /**
   * Criar novo registro
   */
  async create(data) {
    try {
      const entity = new this.model(data);
      return await entity.save();
    } catch (error) {
      throw new AppError(`Erro ao criar: ${error.message}`, 400);
    }
  }
  
  /**
   * Atualizar registro
   */
  async update(id, data) {
    try {
      const result = await this.model.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );
      
      if (!result) {
        throw new AppError('Registro nÃ£o encontrado', 404);
      }
      
      return result;
    } catch (error) {
      throw new AppError(`Erro ao atualizar: ${error.message}`, 400);
    }
  }
  
  /**
   * Remover registro
   */
  async delete(id) {
    try {
      const result = await this.model.findByIdAndDelete(id);
      if (!result) {
        throw new AppError('Registro nÃ£o encontrado', 404);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}

// Singleton export
export const {name}Repository = new {Name}Repository();

// Named export para testes
export default {Name}Repository;
```

---

#### **Template: Routes**

```javascript
// modules/{module}/{module}.routes.js
import express from 'express';
import {controller}Controller from './controllers/{controller}.controller.js';
import { authMiddleware } from '../../shared/middleware/auth.middleware.js';
import { validateRequest } from '../../shared/middleware/validation.middleware.js';

const router = express.Router();

/**
 * {Module} Routes
 * Base path: /{module}
 */

// Public routes
router.get('/', {controller}Controller.list);
router.get('/:id', {controller}Controller.get);

// Protected routes (require auth)
router.post('/', authMiddleware, validateRequest, {controller}Controller.create);
router.put('/:id', authMiddleware, validateRequest, {controller}Controller.update);
router.delete('/:id', authMiddleware, {controller}Controller.delete);

export default router;
```

---

#### **Template: Module README**

```markdown
# {Module} Module

{Description}

## Estrutura

\`\`\`
{module}/
â”œâ”€â”€ controllers/     â† HTTP handlers
â”œâ”€â”€ services/        â† Business logic
â”œâ”€â”€ repositories/    â† Data access
â”œâ”€â”€ models/          â† Data schemas
â”œâ”€â”€ types/           â† TypeScript interfaces
â”œâ”€â”€ utils/           â† Module utilities
â””â”€â”€ {module}.routes.js
\`\`\`

## Endpoints

### GET /{module}
Lista todos os registros

### GET /{module}/:id
Busca por ID

### POST /{module}
Cria novo registro

### PUT /{module}/:id
Atualiza registro

### DELETE /{module}/:id
Remove registro

## Uso

\`\`\`javascript
import { {service}Service } from './modules/{module}/services/{service}.service.js';

const result = await {service}Service.{action}(params);
\`\`\`

## Testes

\`\`\`bash
npm test -- {module}
\`\`\`
```

---

## ðŸ“‹ FASE 2: MIGRAÃ‡ÃƒO POR MÃ“DULO

### âœ… 2.1 MÃ³dulo VALIDATION (5 dias)

#### **Dia 1: Estrutura e Services**

**Checklist:**
- [ ] Criar estrutura de pastas
- [ ] Criar `validation.service.js` (extrair de validation-manager-controller.js)
- [ ] Criar `visual-validation.service.js` (extrair de visual-validation-controller.js)
- [ ] Criar `varco-validation.service.js` (extrair de varco-controller.js)

**Exemplo de MigraÃ§Ã£o: VARCO**

```javascript
// ANTES: varco-controller.js (linha 77-240)
export async function validarDispositivo(req, res) {
  try {
    const { alias } = req.body;
    
    // 164 linhas de lÃ³gica misturada
    const pool = await sql.connect(config.axhub);
    // ... queries SQL
    // ... validaÃ§Ãµes
    // ... processamento
    
    res.json(diagnostico);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

```javascript
// DEPOIS: modules/validation/controllers/varco.controller.js
import { varcoValidationService } from '../services/varco-validation.service.js';

export async function validarDispositivo(req, res, next) {
  try {
    const { alias } = req.body;
    const diagnostico = await varcoValidationService.validarDispositivo(alias);
    res.json(diagnostico);
  } catch (error) {
    next(error);
  }
}
```

```javascript
// DEPOIS: modules/validation/services/varco-validation.service.js
import { equipamentoRepository } from '../../integrations/axhub/repositories/equipamento.repository.js';
import { AppError } from '../../../shared/utils/app-error.js';

export class VarcoValidationService {
  
  async validarDispositivo(alias) {
    // Toda a lÃ³gica extraÃ­da e organizada
    const equipamento = await equipamentoRepository.findByAlias(alias);
    
    if (!equipamento) {
      throw new AppError('Equipamento nÃ£o encontrado', 404);
    }
    
    // ... resto da lÃ³gica
    return this.gerarDiagnostico(equipamento);
  }
  
  private gerarDiagnostico(equipamento) {
    // LÃ³gica isolada e testÃ¡vel
  }
}

export const varcoValidationService = new VarcoValidationService();
```

---

#### **Dia 2: Refatorar Controllers**

**Checklist:**
- [ ] Criar `modules/validation/controllers/validation-manager.controller.js`
- [ ] Criar `modules/validation/controllers/visual-validation.controller.js`
- [ ] Criar `modules/validation/controllers/varco.controller.js`
- [ ] Criar `modules/validation/controllers/alert-flow.controller.js`
- [ ] Criar `modules/validation/controllers/duplicidade.controller.js`

**Tarefas:**
1. Copiar cÃ³digo dos controllers antigos
2. Remover toda lÃ³gica de negÃ³cio
3. Delegar para services
4. Simplificar error handling

---

#### **Dia 3: Routes e IntegraÃ§Ã£o**

**Checklist:**
- [ ] Criar `modules/validation/validation.routes.js`
- [ ] Integrar rotas no `routes.js` principal
- [ ] Testar endpoints manualmente
- [ ] Verificar backward compatibility

```javascript
// modules/validation/validation.routes.js
import express from 'express';
import validationManagerController from './controllers/validation-manager.controller.js';
import visualValidationController from './controllers/visual-validation.controller.js';
import varcoController from './controllers/varco.controller.js';
import alertFlowController from './controllers/alert-flow.controller.js';
import duplicidadeController from './controllers/duplicidade.controller.js';

const router = express.Router();

// Validation Manager
router.post('/start', validationManagerController.startValidation);
router.post('/discover-ui', validationManagerController.discoverUI);
router.post('/discover-api', validationManagerController.discoverAPI);
router.get('/report/:id', validationManagerController.getReport);
router.get('/list', validationManagerController.listValidations);

// Visual Validation
router.post('/visual/start', visualValidationController.startVisualValidation);
router.get('/visual/status/:id', visualValidationController.getVisualValidationStatus);
router.get('/visual/report/:id', visualValidationController.getVisualValidationReport);

// VARCO
router.post('/varco/dispositivo', varcoController.validarDispositivo);
router.post('/varco/lote', varcoController.validarLote);
router.get('/varco/frota', varcoController.listarFrota);

// Alert Flow
router.post('/alert-flow', alertFlowController.validarFluxoAlerta);

// Duplicidade
router.get('/duplicidade/buscar', duplicidadeController.buscarInfracoes);
router.get('/duplicidade/varredura', duplicidadeController.varreduraDuplicidades);

export default router;
```

```javascript
// src/routes.js (atualizar)
import validationRoutes from './modules/validation/validation.routes.js';

// ... outras imports

router.use('/validation', validationRoutes);

// Manter rotas antigas para backward compatibility (deprecar apÃ³s)
router.post('/validation/start', startValidation); // DEPRECATED
```

---

#### **Dia 4: Testes UnitÃ¡rios**

**Checklist:**
- [ ] Criar `modules/validation/__tests__/`
- [ ] Testar todos os services
- [ ] Testar controllers
- [ ] Cobertura > 80%

```javascript
// modules/validation/__tests__/varco-validation.service.test.js
import { VarcoValidationService } from '../services/varco-validation.service.js';
import { equipamentoRepository } from '../../integrations/axhub/repositories/equipamento.repository.js';

jest.mock('../../integrations/axhub/repositories/equipamento.repository.js');

describe('VarcoValidationService', () => {
  let service;
  
  beforeEach(() => {
    service = new VarcoValidationService();
    jest.clearAllMocks();
  });
  
  describe('validarDispositivo', () => {
    test('deve validar dispositivo com sucesso', async () => {
      // Arrange
      const mockEquipamento = {
        Alias: 'CAM001',
        Status: 1
      };
      equipamentoRepository.findByAlias.mockResolvedValue(mockEquipamento);
      
      // Act
      const result = await service.validarDispositivo('CAM001');
      
      // Assert
      expect(result).toBeDefined();
      expect(result.alias).toBe('CAM001');
      expect(equipamentoRepository.findByAlias).toHaveBeenCalledWith('CAM001');
    });
    
    test('deve lanÃ§ar erro se equipamento nÃ£o existir', async () => {
      // Arrange
      equipamentoRepository.findByAlias.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.validarDispositivo('INVALID'))
        .rejects
        .toThrow('Equipamento nÃ£o encontrado');
    });
  });
});
```

---

#### **Dia 5: DocumentaÃ§Ã£o e Limpeza**

**Checklist:**
- [ ] Criar README.md do mÃ³dulo
- [ ] Documentar services (JSDoc)
- [ ] Atualizar documentaÃ§Ã£o principal
- [ ] Marcar controllers antigos como DEPRECATED
- [ ] Code review

---

### âœ… 2.2 MÃ³dulo ANALYSIS (5 dias)

**Checklist Geral:**
- [ ] Dia 1: Services (medicao, image, conformidade, edital, leitura)
- [ ] Dia 2: Controllers refatorados
- [ ] Dia 3: Routes e integraÃ§Ã£o
- [ ] Dia 4: Testes
- [ ] Dia 5: DocumentaÃ§Ã£o

**Controllers a Migrar:**
1. `medicao.controller.js` (extrair de medicao-controller.js)
2. `image.controller.js` (extrair de analise-imagem-controller.js)
3. `conformidade.controller.js` (extrair de conformidade-controller.js)
4. `edital.controller.js` (extrair de edital-controller.js)
5. `leitura.controller.js` (extrair de leitura-controller.js)

---

### âœ… 2.3 MÃ³dulo REPORTING (3 dias)

**Checklist Geral:**
- [ ] Dia 1: Services
- [ ] Dia 2: Controllers e routes
- [ ] Dia 3: Testes e documentaÃ§Ã£o

**Controllers a Migrar:**
1. `contract-report.controller.js`
2. `flow-report.controller.js`
3. `hours-report.controller.js`

---

### âœ… 2.4 MÃ³dulo AI (5 dias)

**Checklist Especial:**
- [ ] Dia 1: Reorganizar core/ (engine, classifier, prompt, kb.json)
- [ ] Dia 2: Services (ia-adapter, agent, confidence, embedding)
- [ ] Dia 3: Controllers refatorados
- [ ] Dia 4: Testes
- [ ] Dia 5: DocumentaÃ§Ã£o

**Estrutura Especial:**
```
modules/ai/
â”œâ”€â”€ core/                 â† Motor IA (mover arquivos atuais)
â”‚   â”œâ”€â”€ engine.js
â”‚   â”œâ”€â”€ classifier.js
â”‚   â”œâ”€â”€ prompt.js
â”‚   â””â”€â”€ kb.json
â”œâ”€â”€ agent/                â† Sistema de agentes (mover pasta)
â”‚   â”œâ”€â”€ agent.js
â”‚   â”œâ”€â”€ orchestrator.js
â”‚   â”œâ”€â”€ state.js
â”‚   â””â”€â”€ tasks.js
â”œâ”€â”€ controllers/
â”œâ”€â”€ services/
â””â”€â”€ models/
```

---

### âœ… 2.5 MÃ³dulo GENERATORS (3 dias)

**Checklist Geral:**
- [ ] Dia 1: Services (doc, roadmap, spec)
- [ ] Dia 2: Controllers e routes
- [ ] Dia 3: Testes e documentaÃ§Ã£o

---

### âœ… 2.6 MÃ³dulo INTEGRATIONS (4 dias)

**Checklist Geral:**
- [ ] Dia 1: AxHub + AxTon
- [ ] Dia 2: AxCross + WhatsApp
- [ ] Dia 3: Jitbit + PNCP
- [ ] Dia 4: Testes e documentaÃ§Ã£o

**Estrutura por IntegraÃ§Ã£o:**
```
integrations/axhub/
â”œâ”€â”€ axhub.controller.js
â”œâ”€â”€ axhub-db.service.js
â”œâ”€â”€ repositories/
â”‚   â”œâ”€â”€ equipamento.repository.js
â”‚   â”œâ”€â”€ operacao.repository.js
â”‚   â””â”€â”€ infracao.repository.js
â””â”€â”€ axhub.routes.js
```

---

### âœ… 2.7 MÃ³dulo RESOURCES (2 dias)

**Checklist Geral:**
- [ ] Dia 1: KB + Fontes
- [ ] Dia 2: CRM (contatos, clientes, equipamentos)

---

### âœ… 2.8 MÃ³dulo SYSTEM (2 dias)

**Checklist Geral:**
- [ ] Dia 1: Config + Health + Logs
- [ ] Dia 2: Upload + Admin

---

## ðŸ“‹ FASE 3: SHARED E DATABASE (2 dias)

### âœ… 3.1 Shared Utilities

**Checklist:**
- [ ] Criar `shared/middleware/error.middleware.js`
- [ ] Criar `shared/middleware/auth.middleware.js`
- [ ] Criar `shared/middleware/validation.middleware.js`
- [ ] Criar `shared/utils/logger.js`
- [ ] Criar `shared/utils/app-error.js`
- [ ] Criar `shared/constants/index.js`

**Template: Error Middleware**

```javascript
// shared/middleware/error.middleware.js
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}

export default errorHandler;
```

**Template: AppError**

```javascript
// shared/utils/app-error.js
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso nÃ£o encontrado') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Dados invÃ¡lidos') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'NÃ£o autorizado') {
    super(message, 401);
  }
}
```

---

### âœ… 3.2 Database Layer

**Checklist:**
- [ ] Criar `database/mongodb/connection.js`
- [ ] Criar `database/mssql/connection.js`
- [ ] Criar connection pools
- [ ] Implementar retry logic

---

## ðŸ“‹ FASE 4: ATUALIZAR APP.JS (1 dia)

**Checklist:**
- [ ] Importar todas as rotas modulares
- [ ] Remover imports antigos
- [ ] Aplicar error middleware
- [ ] Testar aplicaÃ§Ã£o completa

```javascript
// src/app.js (refatorado)
import express from 'express';
import cors from 'cors';
import { errorHandler } from './shared/middleware/error.middleware.js';

// Module routes
import validationRoutes from './modules/validation/validation.routes.js';
import analysisRoutes from './modules/analysis/analysis.routes.js';
import reportingRoutes from './modules/reporting/reporting.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import generatorsRoutes from './modules/generators/generators.routes.js';
import integrationsRoutes from './modules/integrations/integrations.routes.js';
import resourcesRoutes from './modules/resources/resources.routes.js';
import systemRoutes from './modules/system/system.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Module routes
app.use('/validation', validationRoutes);
app.use('/analysis', analysisRoutes);
app.use('/reporting', reportingRoutes);
app.use('/ai', aiRoutes);
app.use('/generators', generatorsRoutes);
app.use('/integrations', integrationsRoutes);
app.use('/resources', resourcesRoutes);
app.use('/system', systemRoutes);

// Error handler (deve ser o Ãºltimo middleware)
app.use(errorHandler);

export default app;
```

---

## ðŸ“‹ FASE 5: TESTES E2E (2 dias)

**Checklist:**
- [ ] Testar todos os endpoints
- [ ] Testar fluxos completos
- [ ] Testar casos de erro
- [ ] Performance testing

---

## ðŸ“‹ FASE 6: DEPRECAÃ‡ÃƒO (1 dia)

**Checklist:**
- [ ] Marcar arquivos antigos como DEPRECATED
- [ ] Adicionar warnings em controllers antigos
- [ ] Atualizar documentaÃ§Ã£o
- [ ] Criar migration guide

```javascript
// Exemplo: src/varco-controller.js (deprecado)
/**
 * @deprecated Use modules/validation/controllers/varco.controller.js instead
 * This file will be removed in v4.0.0
 */
export async function validarDispositivo(req, res) {
  console.warn('DEPRECATED: Use /validation/varco/dispositivo endpoint instead');
  // ... cÃ³digo antigo
}
```

---

## ðŸ“‹ FASE 7: DOCUMENTAÃ‡ÃƒO FINAL (2 dias)

**Checklist:**
- [ ] Atualizar README principal
- [ ] Criar README por mÃ³dulo
- [ ] Atualizar diagramas
- [ ] Criar guias de desenvolvimento
- [ ] Training da equipe

---

## ðŸŽ¯ CHECKLIST DIÃRIO

### **Todo Dia de Desenvolvimento:**

- [ ] Pull latest changes
- [ ] Rodar testes existentes (garantir que nÃ£o quebrou nada)
- [ ] Implementar features do dia
- [ ] Escrever testes unitÃ¡rios
- [ ] Code review prÃ³prio
- [ ] Commit com mensagem descritiva
- [ ] Push e criar PR

---

## ðŸš¨ RED FLAGS (Parar e Revisar)

- âš ï¸ Controller com mais de 200 linhas
- âš ï¸ Service sem testes
- âš ï¸ LÃ³gica de negÃ³cio no controller
- âš ï¸ Queries SQL diretas no controller
- âš ï¸ Chamadas externas sem try/catch
- âš ï¸ CÃ³digo duplicado
- âš ï¸ FunÃ§Ãµes com mais de 50 linhas
- âš ï¸ Mais de 3 nÃ­veis de indentaÃ§Ã£o

---

## âœ… DEFINIÃ‡ÃƒO DE PRONTO (DoD)

**Um mÃ³dulo estÃ¡ pronto quando:**

- [ ] Estrutura de pastas criada
- [ ] Services implementados e testados
- [ ] Controllers refatorados (< 200 linhas)
- [ ] Routes configuradas
- [ ] Testes unitÃ¡rios (> 80% cobertura)
- [ ] Testes de integraÃ§Ã£o
- [ ] README.md do mÃ³dulo
- [ ] JSDoc em todas as funÃ§Ãµes pÃºblicas
- [ ] Sem lÃ³gica de negÃ³cio em controllers
- [ ] Error handling padronizado
- [ ] Code review aprovado
- [ ] Backward compatibility mantida

---

## ðŸ“Š TRACKING DE PROGRESSO

### **MÃ³dulo Validation**
- [ ] Estrutura criada
- [ ] Services implementados
- [ ] Controllers refatorados
- [ ] Routes configuradas
- [ ] Testes implementados
- [ ] DocumentaÃ§Ã£o completa
- **Status:** ðŸ”´ NÃ£o iniciado

### **MÃ³dulo Analysis**
- [ ] Estrutura criada
- [ ] Services implementados
- [ ] Controllers refatorados
- [ ] Routes configuradas
- [ ] Testes implementados
- [ ] DocumentaÃ§Ã£o completa
- **Status:** ðŸ”´ NÃ£o iniciado

### **MÃ³dulo Reporting**
- [ ] Estrutura criada
- [ ] Services implementados
- [ ] Controllers refatorados
- [ ] Routes configuradas
- [ ] Testes implementados
- [ ] DocumentaÃ§Ã£o completa
- **Status:** ðŸ”´ NÃ£o iniciado

### **MÃ³dulo AI**
- [ ] Estrutura criada
- [ ] Core reorganizado
- [ ] Services implementados
- [ ] Controllers refatorados
- [ ] Routes configuradas
- [ ] Testes implementados
- [ ] DocumentaÃ§Ã£o completa
- **Status:** ðŸ”´ NÃ£o iniciado

### **MÃ³dulo Generators**
- [ ] Estrutura criada
- [ ] Services implementados
- [ ] Controllers refatorados
- [ ] Routes configuradas
- [ ] Testes implementados
- [ ] DocumentaÃ§Ã£o completa
- **Status:** ðŸ”´ NÃ£o iniciado

### **MÃ³dulo Integrations**
- [ ] Estrutura criada
- [ ] Services implementados
- [ ] Controllers refatorados
- [ ] Routes configuradas
- [ ] Testes implementados
- [ ] DocumentaÃ§Ã£o completa
- **Status:** ðŸ”´ NÃ£o iniciado

### **MÃ³dulo Resources**
- [ ] Estrutura criada
- [ ] Services implementados
- [ ] Controllers refatorados
- [ ] Routes configuradas
- [ ] Testes implementados
- [ ] DocumentaÃ§Ã£o completa
- **Status:** ðŸ”´ NÃ£o iniciado

### **MÃ³dulo System**
- [ ] Estrutura criada
- [ ] Services implementados
- [ ] Controllers refatorados
- [ ] Routes configuradas
- [ ] Testes implementados
- [ ] DocumentaÃ§Ã£o completa
- **Status:** ðŸ”´ NÃ£o iniciado

---

## ðŸŽ¯ PRIORIZAÃ‡ÃƒO

### **Alta Prioridade (Fazer Primeiro)**
1. âœ… Validation (muitos validadores, cÃ³digo complexo)
2. âœ… Analysis (lÃ³gica crÃ­tica de negÃ³cio)
3. âœ… AI (core do sistema, precisa estar bem organizado)

### **MÃ©dia Prioridade**
4. âœ… Reporting (funcionalidade importante mas menos complexa)
5. âœ… Integrations (pode ser feito em paralelo)

### **Baixa Prioridade (Fazer Por Ãšltimo)**
6. âœ… Generators (funcionalidade auxiliar)
7. âœ… Resources (principalmente CRUD)
8. âœ… System (baixa complexidade)

---

**Documento gerado em:** 2026-06-20  
**PrÃ³ximo passo:** Executar Fase 1 e iniciar MÃ³dulo Validation


