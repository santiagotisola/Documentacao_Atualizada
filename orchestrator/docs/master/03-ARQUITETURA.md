# 03 — ARQUITETURA DE AGENTES
## AXIONIA KNOWLEDGE PLATFORM — 12+ Agentes Cognitivos Especializados

---

## Princípio Arquitetural

A AKP **não é uma única IA**. É um ecossistema de agentes cognitivos com responsabilidades claramente separadas:

- Cada agente tem um domínio específico
- Nenhum agente conhece todo o sistema
- Toda comunicação ocorre via **AI Orchestrator** através de **eventos**
- Nenhum agente modifica diretamente outro agente
- Toda saída é validada antes de ser aceita

---

## Diagrama de Agentes

```
                    ┌──────────────────────────────┐
                    │      AI ORCHESTRATOR          │
                    │  (Roteamento via Eventos)     │
                    └──────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
   ┌──────┴──────┐         ┌──────┴──────┐        ┌──────┴──────┐
   │  Knowledge  │         │ Engineering │        │    Video    │
   │   Agents   │         │   Agents   │        │   Agents   │
   │             │         │             │        │             │
   │ • Extractor │         │ • Screen    │        │ • Storyboard│
   │ • Relation  │         │ • Database  │        │ • Capture   │
   │ • Project   │         │ • API       │        │ • Narrator  │
   │   Manager  │         │ • Code      │        │ • Renderer  │
   └─────────────┘         └─────────────┘        └─────────────┘
          │                       │                       │
   ┌──────┴──────┐         ┌──────┴──────┐        ┌──────┴──────┐
   │    Docs     │         │  Learning   │        │  Support    │
   │   Agents   │         │   Agents   │        │   Agents   │
   │             │         │             │        │             │
   │ • Document  │         │ • Micro     │        │ • FAQ       │
   │   Agent    │         │   learning  │        │ • Quiz      │
   │             │         │ • Quiz      │        │ • Analytics │
   └─────────────┘         └─────────────┘        └─────────────┘
```

---

## Catálogo de Agentes

### 🧠 AI Orchestrator
| Campo | Valor |
|-------|-------|
| ID | AKP-ORCH |
| Missão | Rotear eventos entre agentes. Nunca executa domínio. |
| Nunca faz | Produzir conteúdo, analisar negócio |

---

### 📋 Project Manager Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-PM |
| Missão | Controlar ciclo de vida dos projetos AKP |
| Entradas | Novo Projeto, Atualização, JSON, Repositório |
| Saídas | Projeto Estruturado, Eventos, Knowledge |
| Nunca faz | Produzir vídeos, documentação, alterar código |

---

### 📥 Knowledge Extractor Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-KE |
| Missão | Transformar qualquer fonte em Knowledge Objects estruturados |
| Entradas | PDF, Word, HTML, Markdown, URL, Swagger, DB, Código, OCR, Vídeos, Áudios |
| Saídas | Knowledge Objects, Knowledge Graph, Glossário, Relacionamentos |
| Nunca faz | Produzir documentação final, renderizar vídeos |

**Fluxo interno:**
```
Receber → Analisar tipo → Extrair entidades → 
Normalizar para AKP → Detectar relacionamentos → 
Aplicar 10 perguntas semânticas → Registrar no Graph → Emitir KNOWLEDGE_READY
```

---

### 🔗 Relationship Mapper Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-RM |
| Missão | Descobrir automaticamente todos os relacionamentos |
| Perguntas | Quem utiliza? Quem depende? Quem chama? Quem atualiza? Quem consome? Quem publica? Quem documenta? Quem explica? Quem valida? |
| Resultado | Knowledge Graph 100% conectado |

---

### 🖥️ Screen Analyzer Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-SA |
| Missão | Criar modelo completo de qualquer interface |
| Detecta | Botões, Campos, Menus, Cards, Widgets, Gráficos, Permissões, Alertas, Breadcrumb, Sidebar, Header, Footer, Modais, Tooltips, Grids, Filtros |
| Saída | Modelo estruturado da tela com XPath, CSS, ações e permissões |

---

### 📸 Capture Agent (Playwright)
| Campo | Valor |
|-------|-------|
| ID | AKP-CA |
| Missão | Navegar e capturar — NUNCA interpretar |
| Entradas | URL, Credenciais, Fluxos |
| Captura | Screenshots, Vídeos, XPath, CSS, Menus, Loading, Toast, Modal, Tooltip, Grid |
| Nunca faz | Interpretar regras de negócio, modificar dados |

---

### 🗄️ Database Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-DB |
| Missão | Mapear banco de dados completamente |
| Detecta | Schemas, Tabelas, Views, Procedures, Functions, Triggers, FK, PK, Índices |
| Nunca faz | Alterar banco, executar DML, deletar dados |

---

### 🔌 API Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-API |
| Missão | Mapear todas as APIs do sistema |
| Detecta | Swagger, OpenAPI, REST, GraphQL, WebSocket, Endpoints, DTOs, Auth, Rate Limit |

---

### 💻 Code Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-CODE |
| Linguagens | React, Angular, Vue, .NET, Java, Node, Python, Go, Rust, Delphi, PHP |
| Detecta | Arquitetura, DDD, SOLID, Padrões, Bugs, Melhorias, Riscos |

---

### 📄 Documentation Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-DOC |
| Missão | Produzir documentação corporativa via Template A |
| Outputs | Manual Técnico, Manual Admin, Manual Usuário, FAQ, Release Notes, Catálogo API, Fluxogramas (Mermaid, PlantUML), PDF, Word, HTML |
| Regra | **Sempre** obedecer Template A (16 seções). Nunca "clique aqui". |

---

### 🎬 Storyboard Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-SB |
| Missão | Planejar vídeos. NUNCA renderizar. |
| Pipeline cena | Capítulos → Cenas → Objetivo → Narrativa → Imagem → Zoom → Cursor → Callout → Legenda → Transição → Áudio → Tempo → Validação |
| Cria | Capítulos, Narrativas, Objetivos, Sequências, Callouts, Zoom, Transições |

---

### 🎙️ Narrator Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-NAR |
| Missão | Produzir narrativa corporativa |
| Regras | Nunca "clique aqui". Sempre "O usuário deverá selecionar..." |
| Nunca faz | Ler telas, capturar elementos, renderizar |

---

### 🎥 Video Renderer Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-VR |
| Entradas | Storyboard validado, Capturas, Narração TTS, Assets |
| Saídas | MP4 (1280x720), SRT, Timeline, Cursor, Zoom, Callouts |
| Tecnologia | FFmpeg + TTS Microsoft Maria PT-BR |
| Nunca faz | Produzir conhecimento, analisar negócio |

---

### ⚡ Microlearning Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-ML |
| Missão | Fragmentar conhecimento nos 9 níveis AKP (15s a Curso Completo) |
| Template | Template C obrigatório para cápsulas 15-90s |

---

### ✅ Validator Agent
| Campo | Valor |
|-------|-------|
| ID | AKP-VAL |
| Missão | Validar toda saída antes de aceitar no Knowledge Graph |
| Verifica | Schema AKP completo, min. 3 relacionamentos, narrativa corporativa, template correto, sem duplicatas |
| Ações | APROVADO / REPROVADO (com feedback) / PENDENTE |

---

## Pipelines Principais

### Pipeline de Vídeo (7 etapas)
```
1. Knowledge Extractor  → Knowledge Objects
2. Screen Analyzer      → Modelo da tela
3. Capture Agent        → Screenshots + vídeos brutos
4. Storyboard Agent     → Plano completo (Capítulos → Cenas)
5. Narrator Agent       → Narrativas corporativas
6. Validator Agent      → Aprovação ou feedback
7. Video Renderer       → MP4 final + SRT
```

### Pipeline Knowledge First (9 etapas — Princípio #1)
```
Entrada → Análise → Extração → Normalização →
Relacionamentos → Knowledge Graph →
Planejamento → Validação → Resultado
```
