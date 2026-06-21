# 🔄 Diagramas - ValidationHub.jsx

## 📐 Arquitetura de Componentes

```
ValidationHub
│
├── Header
│   └── Título + Descrição
│
├── TabSelector
│   ├── Tab: UI/API
│   └── Tab: Visual
│
├── SiteSelector
│   ├── Dropdown (ALL_SITES)
│   ├── Botão "Selecionar Site"
│   └── Toggle "Modo Manual"
│
├── ConfigurationForm
│   ├── URL do Sistema (input)
│   ├── Nome do Sistema (input, apenas UI/API)
│   ├── Credenciais (username + password)
│   ├── Tipo/Escopo (radio buttons, dinâmico)
│   └── Botão Iniciar/Parar
│
├── ProgressSection (condicional)
│   ├── Barra de Progresso (0-100%)
│   └── Step Atual (texto)
│
├── LogsSection (condicional, apenas UI/API)
│   └── Lista de Logs (time + message + type)
│
└── ResultsSection (condicional, dinâmico)
    ├── [UI/API] Summary Cards + Details
    │   ├── Card: Elementos UI
    │   ├── Card: Endpoints API
    │   ├── Card: Status
    │   └── JSON Details
    │
    └── [Visual] Screenshots + Issues
        ├── Grid de Screenshots
        ├── Lista de Issues
        └── Report Summary
```

---

## 🔀 Fluxo de Dados

### Fluxo 1: Seleção de Site

```mermaid
graph LR
    A[Usuário seleciona site no dropdown] --> B[selectedSite atualizado]
    B --> C[Usuário clica em Selecionar Site]
    C --> D{Site tem credenciais?}
    D -->|Sim| E[Pré-preenche username/password]
    D -->|Não| F[Deixa campos vazios]
    E --> G[systemUrl e systemName atualizados]
    F --> G
    G --> H[Log adicionado: Site selecionado]
```

### Fluxo 2: Validação UI/API

```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as ValidationHub
    participant A as API Backend
    
    U->>C: Clica em "Iniciar Validação UI/API"
    C->>C: Valida campos obrigatórios
    C->>A: POST /api/validation/start
    A-->>C: { validationId: "abc123" }
    C->>C: Atualiza validationId + Log
    
    alt validationType === "ui" ou "full"
        C->>A: POST /api/validation/discover-ui
        A-->>C: { elements: [...] }
        C->>C: Atualiza progress (30%) + Log
    end
    
    alt validationType === "api" ou "full"
        C->>A: POST /api/validation/discover-api
        A-->>C: { endpoints: [...] }
        C->>C: Atualiza progress (60%) + Log
    end
    
    C->>A: GET /api/validation/report/:id
    A-->>C: { results: {...} }
    C->>C: Atualiza results + progress (100%)
    C->>U: Exibe resultados
```

### Fluxo 3: Validação Visual

```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as ValidationHub
    participant A as API Backend
    
    U->>C: Clica em "Iniciar Validação Visual"
    C->>C: Valida campos obrigatórios
    C->>A: POST /api/visual-validation/start
    A-->>C: { validationId: "xyz789" }
    C->>C: Inicia polling (interval 2s)
    
    loop A cada 2 segundos
        C->>A: GET /api/visual-validation/status/:id
        A-->>C: { status, progress, currentStep }
        C->>C: Atualiza progress + currentStep
        
        alt status === "concluído"
            C->>A: GET /api/visual-validation/report/:id
            A-->>C: { report, screens, issues }
            C->>C: Atualiza report + screenshots + issues
            C->>C: Encerra polling
            C->>U: Exibe resultados
        end
        
        alt status === "erro"
            C->>C: Encerra polling
            C->>U: Exibe erro
        end
    end
```

---

## 🎛️ Máquina de Estados

```mermaid
stateDiagram-v2
    [*] --> Idle: Componente montado
    
    Idle --> Configuring: Usuário seleciona site ou preenche campos
    Configuring --> Validating_UIAPI: Clica em "Iniciar" (aba UI/API)
    Configuring --> Validating_Visual: Clica em "Iniciar" (aba Visual)
    
    Validating_UIAPI --> Completed: Validação concluída
    Validating_UIAPI --> Error: Erro durante validação
    Validating_UIAPI --> Cancelled: Usuário clica em "Parar"
    
    Validating_Visual --> Completed: Validação concluída
    Validating_Visual --> Error: Erro durante validação
    note right of Validating_Visual: Não permite cancelamento manual
    
    Completed --> Configuring: Usuário inicia nova validação
    Error --> Configuring: Usuário corrige e tenta novamente
    Cancelled --> Configuring: Usuário reconfigura
    
    Configuring --> [*]: Usuário sai da página
    Completed --> [*]: Usuário sai da página
```

---

## 🗂️ Estrutura de Dados

### ALL_SITES (Array de Sites)

```typescript
interface Site {
  id: string;                // "economia-ipempe"
  nome: string;             // "IPEM-PE Economia"
  url: string;              // "https://economia.axhub.axion.ws"
  estado: string;           // "PE"
  orgao: string;            // "Instituto de Pesos e Medidas de PE"
  tipo: string;             // "Metrologia"
  platform: string;         // "AxHub" ou "AxCross"
  status: string;           // "ativo"
  credentials?: {           // Opcional
    username: string;
    password: string;
  };
  // ... outros campos específicos
}
```

### Results (UI/API)

```typescript
interface ValidationResults {
  validationId: string;
  status: string;           // "Concluído", "Em andamento", "Erro"
  duration: string;         // "45s"
  ui?: {
    totalElements: number;
    buttons: number;
    inputs: number;
    forms: number;
  };
  api?: {
    totalEndpoints: number;
    getCount: number;
    postCount: number;
  };
}
```

### Report (Visual)

```typescript
interface VisualValidationReport {
  validationId: string;
  status: string;
  screens: Array<{
    name: string;           // "Login", "Dashboard"
    screenshot: string;     // Base64 ou URL
  }>;
  issues: Array<{
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    location?: string;
  }>;
}
```

### Logs (UI/API)

```typescript
interface Log {
  time: string;             // "10:23:45"
  message: string;          // "Validação iniciada (ID: abc123)"
  type: "info" | "success" | "warning" | "error";
}
```

---

## 🔄 Ciclo de Vida do Componente

```mermaid
graph TD
    A[Montagem do Componente] --> B[Importa AXHUB_SITES + AXCROSS_SITES]
    B --> C[Cria ALL_SITES combinado]
    C --> D[Inicializa estados vazios]
    D --> E[Renderiza UI inicial]
    
    E --> F{Usuário interage}
    
    F --> G[Seleciona site]
    F --> H[Preenche campos manualmente]
    F --> I[Troca de aba]
    F --> J[Inicia validação]
    
    G --> K[Atualiza selectedSite]
    H --> L[Atualiza estados de input]
    I --> M[Atualiza activeTab]
    J --> N[Chama startValidationUIAPI ou startValidationVisual]
    
    K --> E
    L --> E
    M --> E
    
    N --> O{Qual validação?}
    O -->|UI/API| P[Executa fases sequenciais]
    O -->|Visual| Q[Inicia polling]
    
    P --> R[Atualiza results + logs]
    Q --> S[Atualiza report + screenshots]
    
    R --> E
    S --> E
    
    E --> T[Usuário baixa relatório]
    T --> E
    
    E --> U[Desmontagem do Componente]
```

---

## 📊 Fluxo de Decisão: Tipo de Validação

```mermaid
graph TD
    A[Usuário clica em Iniciar] --> B{Qual aba ativa?}
    
    B -->|UI/API| C{validationType?}
    B -->|Visual| D{scope?}
    
    C -->|full| E[Executa UI + API]
    C -->|ui| F[Executa apenas UI]
    C -->|api| G[Executa apenas API]
    
    D -->|full| H[Navegação + Formulários + CRUD]
    D -->|forms-only| I[Apenas Formulários]
    D -->|navigation-only| J[Apenas Navegação]
    
    E --> K[Gera relatório UI/API]
    F --> K
    G --> K
    
    H --> L[Gera relatório Visual]
    I --> L
    J --> L
    
    K --> M[Exibe resultados]
    L --> M
```

---

## 🎨 Hierarquia Visual de Componentes

```
╔═══════════════════════════════════════════════════════════╗
║                 🔬 Validation Hub                        ║
║          Central unificada de validação                  ║
╚═══════════════════════════════════════════════════════════╝
╔═════════════════════════╦═════════════════════════════════╗
║  📋 Validação UI/API   ║  👁️ Validação Visual          ║
╚═════════════════════════╩═════════════════════════════════╝
╔═══════════════════════════════════════════════════════════╗
║ 🌍 Seleção de Site                                       ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ [AxHub - IPEM-PE Economia ▼]  [✓ Selecionar Site] │  ║
║ └─────────────────────────────────────────────────────┘  ║
║ ☐ Modo Manual                                            ║
╚═══════════════════════════════════════════════════════════╝
╔═══════════════════════════════════════════════════════════╗
║ ⚙️ Configuração                                          ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ 🌐 URL: [https://economia.axhub.axion.ws          ]│  ║
║ │ 📄 Nome: [AxHub - IPEM-PE Economia                ]│  ║
║ │ 🛡️ User: [admin     ]  🛡️ Pass: [********        ]│  ║
║ │                                                      │  ║
║ │ ⚡ Tipo: ( ) Completa (●) Apenas UI ( ) Apenas API │  ║
║ └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║               [▶️ Iniciar Validação UI/API]              ║
╚═══════════════════════════════════════════════════════════╝
╔═══════════════════════════════════════════════════════════╗
║ 📊 Progresso                              [⬇ Download]  ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ ████████████████████░░░░░░░░░░░░░  75%            │  ║
║ └─────────────────────────────────────────────────────┘  ║
║ ⏱️ Analisando APIs e endpoints...                       ║
╚═══════════════════════════════════════════════════════════╝
╔═══════════════════════════════════════════════════════════╗
║ 📋 Logs                                                  ║
║ ┌─────────────────────────────────────────────────────┐  ║
║ │ 10:23:45 | ℹ️ Iniciando validação...                │  ║
║ │ 10:23:50 | ✓ Validação iniciada (ID: abc123)       │  ║
║ │ 10:24:10 | ✓ Descobertos 120 elementos UI          │  ║
║ │ 10:24:25 | ✓ Descobertos 25 endpoints API          │  ║
║ └─────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════╝
╔═══════════════════════════════════════════════════════════╗
║ ✅ Resultados                                            ║
║ ┌──────────┐ ┌──────────┐ ┌──────────┐                  ║
║ │ 👁️ UI   │ │ 🌐 API  │ │ ✅ Status │                  ║
║ │ 120 elem.│ │ 25 endp. │ │ Concluído │                  ║
║ └──────────┘ └──────────┘ └──────────┘                  ║
║                                                           ║
║ [JSON Details...]                                        ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🧩 Dependências de Estados

```mermaid
graph TD
    A[selectedSite] -->|Preenche| B[systemUrl]
    A -->|Preenche| C[systemName]
    A -->|Preenche| D[username/password]
    
    E[manualMode] -->|Desabilita| F[selectedSite]
    E -->|Habilita edição| B
    E -->|Habilita edição| C
    
    G[activeTab] -->|Controla visibilidade| H[validationType]
    G -->|Controla visibilidade| I[scope]
    G -->|Controla visibilidade| J[LogsSection]
    
    K[isValidating] -->|Desabilita| L[Todos os inputs]
    K -->|Desabilita| M[TabSelector]
    K -->|Habilita| N[Botão Parar]
    
    O[validationId] -->|Necessário para| P[Polling status]
    O -->|Necessário para| Q[Download relatório]
    
    R[results] -->|Exibe| S[ResultsSection UI/API]
    T[report] -->|Exibe| U[ResultsSection Visual]
```

---

**Última atualização**: 2026-06-20  
**Ferramenta**: Mermaid + Markdown  
**Status**: ✅ Completo
