# 🔄 PLANO COMPLETO: FUSÃO + QUALITY PLATFORM

**Data:** 2026-06-21  
**Projeto:** AxionIA Panel - Evolução Completa

---

## 📋 VISÃO GERAL

### **ETAPA 1: FUSÃO (Portal → AxionIA Panel)**
Migrar todas as funcionalidades do "portal-cidadao" para dentro do "axion-ia-panel" como ferramentas internas de análise e suporte.

### **ETAPA 2: QUALITY ENGINEERING PLATFORM**
Implementar plataforma completa de validação inteligente de software com IA.

---

## 🎯 ETAPA 1: FUSÃO COMPLETA

### **1.1 Migração de Componentes**

#### Componentes a Migrar (do portal-cidadao):

**📁 components/consulta/**
- `FormConsulta.jsx` → `axion-ia-panel/src/components/ferramentas/FormConsulta.jsx`

**📁 components/infracoes/**
- `TabelaInfracoes.jsx` → `axion-ia-panel/src/components/ferramentas/TabelaInfracoes.jsx`
- `CardInfracao.jsx` → `axion-ia-panel/src/components/ferramentas/CardInfracao.jsx`
- `FiltrosInfracoes.jsx` → `axion-ia-panel/src/components/ferramentas/FiltrosInfracoes.jsx`

**📁 hooks/**
- `useRecaptcha.js` → `axion-ia-panel/src/hooks/useRecaptcha.js` (opcional)

**📁 services/**
- Adaptar `api.js` para usar endpoints do axion-ia-api

---

### **1.2 Novas Páginas no AxionIA Panel**

#### **📄 Ferramentas/ConsultaInfracoes.jsx** (Nova)
```jsx
// Página principal de consulta de infrações
// Usa FormConsulta + ResultadosInfracoes
```

#### **📄 Ferramentas/ResultadosInfracoes.jsx** (Nova)
```jsx
// Exibe resultados com TabelaInfracoes + FiltrosInfracoes
// Estatísticas + Exportar + Análise
```

#### **📄 Ferramentas/AnalisePesagem.jsx** (Nova)
```jsx
// Consulta e análise de pesagens (AxTon)
// Integra com SQL Server AxTon
```

#### **📄 Ferramentas/ConsultaCruzamentos.jsx** (Nova)
```jsx
// Consulta cruzamentos (AxCross)
// Integra com SQL Server AxCross
```

#### **📄 Ferramentas/Contestacoes.jsx** (Nova)
```jsx
// Gerenciar contestações e processos
```

---

### **1.3 Atualização de Rotas**

**Arquivo:** `axion-ia-panel/src/App.jsx`

```jsx
// Novas rotas
<Route path="/ferramentas/infracoes" element={<ConsultaInfracoes />} />
<Route path="/ferramentas/resultados" element={<ResultadosInfracoes />} />
<Route path="/ferramentas/pesagem" element={<AnalisePesagem />} />
<Route path="/ferramentas/cruzamentos" element={<ConsultaCruzamentos />} />
<Route path="/ferramentas/contestacoes" element={<Contestacoes />} />
```

---

### **1.4 Menu de Navegação Atualizado**

```
┌─────────────────────────────────┐
│      AxionIA Intelligence Hub    │
├─────────────────────────────────┤
│ 🏠 Dashboard                     │
│ 💬 Chat IA                       │
│ 🎯 Classifier                    │
│ 📚 Knowledge Base                │
│ 🔧 Ferramentas ▼                 │
│    ├─ 🔍 Consultar Infrações     │
│    ├─ ⚖️ Análise Pesagem         │
│    ├─ 🚦 Cruzamentos             │
│    └─ 📋 Contestações            │
│ ✅ Quality Platform ▼ (NOVO)     │
│    ├─ 📊 Dashboard Qualidade     │
│    ├─ 🧪 Validações              │
│    ├─ 🔒 Segurança               │
│    ├─ ⚡ Performance             │
│    ├─ 🏗️ Arquitetura             │
│    └─ 📈 Relatórios              │
│ 👤 Perfil                        │
└─────────────────────────────────┘
```

---

### **1.5 Backend (Mantido)**

Os endpoints `/api/portal/*` no `axion-ia-api` permanecem, mas:
- **Removido:** reCAPTCHA (interno, não precisa)
- **Adaptado:** Autenticação usa JWT interno do AxionIA
- **Mantido:** Toda lógica de consultas, validações, etc.

---

## 🚀 ETAPA 2: QUALITY ENGINEERING PLATFORM

### **2.1 Arquitetura da Plataforma**

```
┌───────────────────────────────────────────────────┐
│  AxionIA Quality Engineering Platform             │
├───────────────────────────────────────────────────┤
│                                                   │
│  📊 Dashboard de Qualidade                        │
│     └─ Scores gerais (0-100)                     │
│     └─ Tendências históricas                     │
│     └─ Alertas críticos                          │
│                                                   │
│  🧪 Módulo de Validação Universal                 │
│     ├─ Functional Tests                          │
│     ├─ Integration Tests                         │
│     ├─ Regression Tests                          │
│     ├─ E2E Tests                                 │
│     ├─ API Tests                                 │
│     └─ Database Tests                            │
│                                                   │
│  🔒 Módulo de Segurança                          │
│     ├─ SQL Injection Detection                   │
│     ├─ XSS Protection                            │
│     ├─ CSRF Validation                           │
│     ├─ Dependency Vulnerabilities                │
│     └─ Secret Detection                          │
│                                                   │
│  ⚡ Módulo de Performance                         │
│     ├─ Load Testing                              │
│     ├─ Stress Testing                            │
│     ├─ Response Time Analysis                    │
│     └─ Resource Consumption                      │
│                                                   │
│  🏗️ Análise Arquitetural                         │
│     ├─ Dependency Graph                          │
│     ├─ Circular Dependencies                     │
│     ├─ Coupling/Cohesion                         │
│     └─ Single Point of Failure                   │
│                                                   │
│  🤖 AI Engine (GPT-4)                            │
│     ├─ Root Cause Analysis                       │
│     ├─ Test Generation                           │
│     ├─ Risk Prediction                           │
│     ├─ Improvement Recommendations               │
│     └─ Failure Pattern Detection                 │
│                                                   │
│  📈 Relatórios & Governança                       │
│     ├─ Executive Summary                         │
│     ├─ Technical Details                         │
│     ├─ Compliance (ITIL, COBIT, ISO)             │
│     └─ Export (PDF, HTML, JSON, CSV)             │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

### **2.2 Modelo de Dados (MongoDB)**

#### **Collection: QualityProjects**
```javascript
{
  _id: ObjectId,
  name: String,              // "AxHub", "Portal Cidadão"
  type: String,              // "web", "api", "mobile"
  environment: String,       // "production", "staging", "dev"
  repository: String,        // URL Git
  mainLanguage: String,      // "javascript", "typescript"
  frameworks: [String],      // ["react", "node", "express"]
  createdAt: Date,
  updatedAt: Date,
  active: Boolean
}
```

#### **Collection: QualityScans**
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  scanType: String,          // "full", "quick", "scheduled"
  triggeredBy: ObjectId,     // userId
  startedAt: Date,
  completedAt: Date,
  duration: Number,          // ms
  status: String,            // "running", "completed", "failed"
  
  scores: {
    functional: Number,      // 0-20
    security: Number,        // 0-20
    performance: Number,     // 0-15
    architecture: Number,    // 0-10
    database: Number,        // 0-10
    api: Number,            // 0-10
    governance: Number,      // 0-5
    observability: Number,   // 0-5
    maintainability: Number, // 0-5
    total: Number           // 0-100
  },
  
  results: {
    functional: {...},
    security: {...},
    performance: {...},
    architecture: {...},
    database: {...},
    api: {...}
  },
  
  aiAnalysis: {
    rootCauses: [String],
    recommendations: [String],
    riskAssessment: String,
    predictedIssues: [String]
  },
  
  issues: [{
    severity: String,       // "critical", "high", "medium", "low"
    category: String,
    description: String,
    file: String,
    line: Number,
    suggestion: String
  }]
}
```

#### **Collection: QualityIssues**
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  scanId: ObjectId,
  severity: String,
  category: String,
  type: String,
  description: String,
  file: String,
  line: Number,
  code: String,
  suggestion: String,
  status: String,          // "open", "resolved", "wont_fix"
  assignedTo: ObjectId,
  resolvedAt: Date,
  createdAt: Date
}
```

---

### **2.3 Páginas Frontend (Quality Platform)**

#### **📄 Quality/Dashboard.jsx**
- Overview geral de qualidade
- Gráficos de score por módulo
- Tendências históricas
- Top issues críticos
- Últimos scans

#### **📄 Quality/Projects.jsx**
- Lista projetos
- CRUD projetos
- Configurações por projeto

#### **📄 Quality/Scan.jsx**
- Iniciar novo scan
- Configurar tipos de validação
- Visualizar scan em andamento

#### **📄 Quality/Results.jsx**
- Detalhes de um scan completo
- Visualização por módulo
- Issues encontrados
- Análise IA
- Exportar relatório

#### **📄 Quality/Issues.jsx**
- Lista todos issues
- Filtros por severity, categoria, status
- Atribuir issues
- Marcar como resolvido

#### **📄 Quality/Reports.jsx**
- Relatórios executivos
- Comparação entre scans
- Export PDF/HTML/JSON/CSV
- Compliance reports

#### **📄 Quality/AIAnalysis.jsx**
- Root cause analysis
- Recomendações IA
- Test generation
- Risk prediction

---

### **2.4 Backend API (axion-ia-api)**

#### **Novos Controllers:**

**📁 controllers/quality/**
- `projects.controller.js`
- `scans.controller.js`
- `issues.controller.js`
- `reports.controller.js`
- `ai-analysis.controller.js`

#### **Novos Endpoints:**

```javascript
// Projects
POST   /api/quality/projects
GET    /api/quality/projects
GET    /api/quality/projects/:id
PUT    /api/quality/projects/:id
DELETE /api/quality/projects/:id

// Scans
POST   /api/quality/scans/start
GET    /api/quality/scans
GET    /api/quality/scans/:id
GET    /api/quality/scans/:id/results
DELETE /api/quality/scans/:id

// Issues
GET    /api/quality/issues
GET    /api/quality/issues/:id
PUT    /api/quality/issues/:id
POST   /api/quality/issues/:id/assign
POST   /api/quality/issues/:id/resolve

// Reports
GET    /api/quality/reports/:scanId
POST   /api/quality/reports/:scanId/export
GET    /api/quality/reports/compliance/:projectId

// AI Analysis
POST   /api/quality/ai/analyze
POST   /api/quality/ai/generate-tests
POST   /api/quality/ai/recommendations
POST   /api/quality/ai/predict-risks
```

---

### **2.5 Validation Engines**

#### **📁 services/quality/engines/**

**functional.engine.js**
```javascript
// Testes funcionais
// Análise de casos de teste
// Cobertura funcional
```

**security.engine.js**
```javascript
// SQL Injection detection
// XSS detection
// CSRF validation
// Dependency vulnerabilities (npm audit, Snyk)
// Secret detection (API keys, passwords no código)
```

**performance.engine.js**
```javascript
// Load testing (Artillery, k6)
// Response time analysis
// Resource consumption
// Bottleneck detection
```

**architecture.engine.js**
```javascript
// Dependency graph (madge)
// Circular dependencies
// Coupling/cohesion metrics
// Dead code detection
```

**database.engine.js**
```javascript
// Slow query detection
// Missing indexes
// Duplicate records
// Referential integrity
```

**api.engine.js**
```javascript
// Contract validation (OpenAPI)
// HTTP status validation
// Latency analysis
// Payload validation
```

---

### **2.6 AI Integration (GPT-4)**

#### **📁 services/quality/ai/**

**analyzer.js**
```javascript
// Root cause analysis usando GPT-4
// Input: issues encontrados
// Output: análise de causa raiz + recomendações
```

**test-generator.js**
```javascript
// Geração automática de testes
// Input: código-fonte
// Output: casos de teste Jest/Playwright
```

**risk-predictor.js**
```javascript
// Predição de riscos
// Input: histórico scans + código
// Output: probabilidade falhas futuras
```

---

### **2.7 Roadmap de Implementação**

#### **FASE 1: Foundation (Dias 1-3)**
- [x] Estrutura base módulo Quality
- [ ] Models MongoDB (QualityProjects, QualityScans, QualityIssues)
- [ ] Dashboard principal
- [ ] CRUD Projetos
- [ ] Backend endpoints básicos

#### **FASE 2: Validation Engines (Dias 4-7)**
- [ ] Security Engine (SQL Injection, XSS, npm audit)
- [ ] Functional Engine (coverage, test analysis)
- [ ] API Engine (contract validation)
- [ ] Database Engine (slow queries, indexes)
- [ ] Integration com engines

#### **FASE 3: AI Analysis (Dias 8-10)**
- [ ] Root cause analysis (GPT-4)
- [ ] Test generation
- [ ] Recommendations engine
- [ ] Risk prediction

#### **FASE 4: Reports & Governance (Dias 11-12)**
- [ ] Executive reports
- [ ] Technical reports
- [ ] Compliance reports (ITIL, ISO)
- [ ] Export PDF/HTML/JSON/CSV

#### **FASE 5: Automation & CI/CD (Dias 13-14)**
- [ ] GitHub Actions integration
- [ ] Scheduled scans
- [ ] Pre-deploy validation
- [ ] Webhooks
- [ ] Slack/Email notifications

---

## 📊 MÉTRICAS ESPERADAS

### **Código Total Estimado:**

| Módulo | Linhas | Arquivos |
|--------|--------|----------|
| Fusão Portal | ~2.000 | 15 |
| Quality Dashboard | ~1.500 | 8 |
| Validation Engines | ~3.000 | 12 |
| AI Integration | ~1.000 | 4 |
| Reports | ~800 | 3 |
| Backend API | ~2.500 | 15 |
| Tests | ~1.200 | 6 |
| **TOTAL** | **~12.000** | **63** |

### **Tempo Estimado:**
- **Fusão Portal:** 2-3 dias
- **Quality Platform:** 12-14 dias
- **TOTAL:** 14-17 dias

---

## ✅ PRÓXIMOS PASSOS IMEDIATOS

1. ✅ Criar este plano
2. 🔄 Migrar componentes portal → panel
3. 🔄 Criar estrutura Quality Platform
4. 🔄 Implementar Dashboard Qualidade
5. 🔄 Implementar primeiro engine (Security)
6. 🔄 Integrar GPT-4 para análise
7. 🔄 Criar sistema de reports
8. 🔄 Deploy e testes

---

**Elaborado por:** GitHub Copilot (Claude Sonnet 4.5)  
**Data:** 2026-06-21  
**Status:** 🚀 PRONTO PARA INICIAR
