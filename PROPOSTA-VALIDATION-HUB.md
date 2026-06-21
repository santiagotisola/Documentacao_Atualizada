# 📋 Proposta: ValidationHub.jsx

## 🎯 Objetivo
Unificar `ValidationManager.jsx` (validação UI/API) e `VisualValidationManager.jsx` (validação visual/CRUD) em uma única interface integrada com seleção de sites.

---

## 📦 1. Estados Necessários

```javascript
// === Configuração Geral ===
const [activeTab, setActiveTab] = useState("ui-api"); // "ui-api" | "visual"
const [selectedSite, setSelectedSite] = useState(null); // site object do dropdown
const [manualMode, setManualMode] = useState(false); // toggle URL manual vs site selecionado

// === Dados do Sistema ===
const [systemUrl, setSystemUrl] = useState("");
const [systemName, setSystemName] = useState("");
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

// === Configuração de Validação (UI/API) ===
const [validationType, setValidationType] = useState("full"); // "full" | "ui" | "api"

// === Configuração de Validação (Visual) ===
const [scope, setScope] = useState("full"); // "full" | "forms-only" | "navigation-only"

// === Execução ===
const [isValidating, setIsValidating] = useState(false);
const [validationId, setValidationId] = useState(null);
const [progress, setProgress] = useState(0);
const [currentStep, setCurrentStep] = useState("");

// === Resultados (UI/API) ===
const [results, setResults] = useState(null);
const [logs, setLogs] = useState([]);

// === Resultados (Visual) ===
const [report, setReport] = useState(null);
const [screenshots, setScreenshots] = useState([]);
const [selectedScreenshot, setSelectedScreenshot] = useState(null);
const [issues, setIssues] = useState([]);
```

---

## 🏗️ 2. Estrutura de Componentes

```
ValidationHub
├── Header (comum)
├── TabSelector (UI/API vs Visual)
├── SiteSelector (dropdown + toggle manual)
│   ├── Dropdown de sites (ALL_SITES)
│   ├── Toggle "Modo Manual"
│   └── Botão "Selecionar Site" (preenche campos)
├── ConfigurationForm (dinâmico por aba)
│   ├── [Tab: UI/API]
│   │   ├── URL do Sistema
│   │   ├── Nome do Sistema
│   │   ├── Credenciais
│   │   └── Tipo de Validação (Full/UI/API)
│   └── [Tab: Visual]
│       ├── URL do Sistema
│       ├── Credenciais
│       └── Escopo (Full/Forms/Navigation)
├── ProgressSection (comum)
├── LogsSection (apenas UI/API)
└── ResultsSection (dinâmico por aba)
    ├── [Tab: UI/API] → Summary Cards + Details
    └── [Tab: Visual] → Screenshots + Issues
```

---

## 🔄 3. Fluxo de Interação

### 3.1 Seleção de Site
```
1. Usuário seleciona site no dropdown
   → selectedSite = { nome, url, estado, tipo, ... }

2. Usuário clica em "Selecionar Site"
   → systemUrl = selectedSite.url
   → systemName = selectedSite.nome
   → username = "" (ou pré-preencher se houver no objeto)
   → password = "" (ou pré-preencher se houver no objeto)

3. [Opcional] Usuário ativa "Modo Manual"
   → Desabilita dropdown
   → Permite edição livre de URL/Nome
```

### 3.2 Iniciar Validação (UI/API)
```
1. Validar campos obrigatórios
2. POST /api/validation/start
3. [Se validationType === "ui" ou "full"]
   → POST /api/validation/discover-ui
4. [Se validationType === "api" ou "full"]
   → POST /api/validation/discover-api
5. GET /api/validation/report/:id
6. Atualizar results + logs
```

### 3.3 Iniciar Validação (Visual)
```
1. Validar campos obrigatórios
2. POST /api/visual-validation/start
3. Polling de status:
   → GET /api/visual-validation/status/:id (a cada 2s)
4. Quando concluído:
   → GET /api/visual-validation/report/:id
5. Atualizar report + screenshots + issues
```

---

## 📥 4. Props e Imports

### Imports Necessários

```javascript
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Play, Pause, Download, FileText, CheckCircle, XCircle, AlertCircle,
  Globe, Code, Zap, Shield, Clock, Server, Eye, Database, Image,
  List, CheckSquare, AlertTriangle, Info, Activity, ChevronDown
} from "lucide-react";
import { AXHUB_SITES, AXCROSS_SITES } from "../data/sitesData";
import "./ValidationHub.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3100";

// Combinar sites
const ALL_SITES = [
  ...AXHUB_SITES.map(s => ({ ...s, platform: "AxHub" })),
  ...AXCROSS_SITES.map(s => ({ ...s, platform: "AxCross" }))
];
```

### Props (Caso seja usado como componente filho)
```javascript
// Caso precise receber preset externo:
ValidationHub.propTypes = {
  defaultSite: PropTypes.object, // site pré-selecionado
  defaultTab: PropTypes.oneOf(["ui-api", "visual"]), // aba inicial
  onValidationComplete: PropTypes.func, // callback ao concluir
};
```

---

## 🎨 5. Estrutura JSX Resumida

```jsx
<div className="validation-hub">
  <div className="validation-container">
    
    {/* Header */}
    <div className="validation-header">
      <h1>🔬 Validation Hub</h1>
      <p>Central unificada de validação de sistemas</p>
    </div>

    {/* Tab Selector */}
    <div className="tab-selector">
      <button 
        className={activeTab === "ui-api" ? "active" : ""}
        onClick={() => setActiveTab("ui-api")}
      >
        <Code size={20} />
        Validação UI/API
      </button>
      <button 
        className={activeTab === "visual" ? "active" : ""}
        onClick={() => setActiveTab("visual")}
      >
        <Eye size={20} />
        Validação Visual
      </button>
    </div>

    {/* Site Selector */}
    <div className="site-selector">
      <div className="selector-controls">
        <label>
          <Globe size={16} />
          Selecionar Site
        </label>
        <div className="selector-row">
          <select 
            value={selectedSite?.id || ""} 
            onChange={(e) => {
              const site = ALL_SITES.find(s => s.id === e.target.value);
              setSelectedSite(site);
            }}
            disabled={manualMode || isValidating}
          >
            <option value="">-- Escolha um site --</option>
            {ALL_SITES.map(site => (
              <option key={site.id} value={site.id}>
                {site.platform} - {site.nome} ({site.estado})
              </option>
            ))}
          </select>
          
          <button 
            className="btn-select-site"
            onClick={handleSelectSite}
            disabled={!selectedSite || manualMode || isValidating}
          >
            Selecionar Site
          </button>
        </div>
      </div>

      <label className="toggle-manual">
        <input 
          type="checkbox" 
          checked={manualMode}
          onChange={(e) => setManualMode(e.target.checked)}
          disabled={isValidating}
        />
        Modo Manual (URL customizada)
      </label>
    </div>

    {/* Configuration Form (dinâmico) */}
    <div className="validation-config">
      <h3>⚙️ Configuração</h3>
      
      {/* Campos comuns */}
      <div className="config-grid">
        <div className="config-field full-width">
          <label><Globe size={16} /> URL do Sistema *</label>
          <input 
            type="url" 
            value={systemUrl}
            onChange={(e) => setSystemUrl(e.target.value)}
            disabled={!manualMode && isValidating}
            placeholder="https://economia.axhub.axion.ws/"
          />
        </div>

        {activeTab === "ui-api" && (
          <div className="config-field full-width">
            <label><FileText size={16} /> Nome do Sistema</label>
            <input 
              type="text" 
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              disabled={isValidating}
            />
          </div>
        )}

        <div className="config-field">
          <label><Shield size={16} /> Usuário</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isValidating}
            autoComplete="username"
          />
        </div>

        <div className="config-field">
          <label><Shield size={16} /> Senha</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isValidating}
            autoComplete="current-password"
          />
        </div>

        {/* Tipo/Escopo (dinâmico por aba) */}
        {activeTab === "ui-api" ? (
          <div className="config-field full-width">
            <label><Zap size={16} /> Tipo de Validação</label>
            <div className="validation-types">
              {/* Radio buttons: Full, UI Only, API Only */}
            </div>
          </div>
        ) : (
          <div className="config-field full-width">
            <label><Zap size={16} /> Escopo da Validação</label>
            <div className="validation-types">
              {/* Radio buttons: Full, Forms Only, Navigation Only */}
            </div>
          </div>
        )}
      </div>

      {/* Botão de Ação */}
      <div className="config-actions">
        {!isValidating ? (
          <button className="btn-start" onClick={handleStartValidation}>
            <Play size={20} />
            {activeTab === "ui-api" ? "Iniciar Validação" : "Iniciar Validação Visual"}
          </button>
        ) : (
          <button className="btn-stop" onClick={handleStopValidation}>
            <Pause size={20} />
            {activeTab === "ui-api" ? "Parar Validação" : "Validando..."}
          </button>
        )}
      </div>
    </div>

    {/* Progress (comum) */}
    {(isValidating || results || report) && (
      <div className="validation-progress">
        {/* Barra de progresso + current step */}
      </div>
    )}

    {/* Logs (apenas UI/API) */}
    {activeTab === "ui-api" && logs.length > 0 && (
      <div className="validation-logs">
        {/* Lista de logs */}
      </div>
    )}

    {/* Results (dinâmico) */}
    {activeTab === "ui-api" && results && (
      <div className="validation-results">
        {/* Summary cards + Details */}
      </div>
    )}

    {activeTab === "visual" && report && (
      <div className="visual-validation-results">
        {/* Screenshots grid + Issues list */}
      </div>
    )}

  </div>
</div>
```

---

## ⚙️ 6. Funções Principais

### 6.1 Seleção de Site
```javascript
const handleSelectSite = () => {
  if (!selectedSite) return;
  
  setSystemUrl(selectedSite.url);
  setSystemName(selectedSite.nome);
  
  // Se houver credenciais padrão no objeto site:
  if (selectedSite.credentials) {
    setUsername(selectedSite.credentials.username || "");
    setPassword(selectedSite.credentials.password || "");
  } else {
    setUsername("");
    setPassword("");
  }
  
  addLog(`Site selecionado: ${selectedSite.nome}`, "info");
};
```

### 6.2 Iniciar Validação
```javascript
const handleStartValidation = () => {
  if (activeTab === "ui-api") {
    startValidationUIAPI();
  } else {
    startValidationVisual();
  }
};

const startValidationUIAPI = async () => {
  // Lógica do ValidationManager.jsx
  // (código já existente)
};

const startValidationVisual = async () => {
  // Lógica do VisualValidationManager.jsx
  // (código já existente)
};
```

### 6.3 Parar Validação
```javascript
const handleStopValidation = () => {
  if (activeTab === "ui-api") {
    // UI/API permite parar manualmente
    setIsValidating(false);
    setCurrentStep("Validação cancelada");
    addLog("Validação cancelada pelo usuário", "warning");
  } else {
    // Visual não permite parar (continua até o fim)
    alert("A validação visual não pode ser interrompida manualmente.");
  }
};
```

---

## 🔗 7. Integração com APIs

### UI/API
```
POST /api/validation/start
POST /api/validation/discover-ui
POST /api/validation/discover-api
GET  /api/validation/report/:id
```

### Visual
```
POST /api/visual-validation/start
GET  /api/visual-validation/status/:id (polling)
GET  /api/visual-validation/report/:id
```

---

## 🎨 8. Estilos CSS (sugestão de classes)

```css
.validation-hub { }
.validation-container { }
.validation-header { }
.tab-selector { }
.site-selector { }
  .selector-controls { }
  .selector-row { }
  .toggle-manual { }
.validation-config { }
  .config-grid { }
  .config-field { }
  .validation-types { }
  .config-actions { }
.validation-progress { }
.validation-logs { }
.validation-results { }
.visual-validation-results { }
```

---

## 📌 9. Observações e Melhorias

### Remoção de Presets Hardcoded
- ✅ Os presets do `ValidationManager.jsx` são **removidos**
- ✅ Substituídos pelo dropdown de sites dinâmico

### Credenciais Opcionais
- Se o site selecionado tiver credenciais padrão (admin/admin, etc.), pré-preencher
- Caso contrário, deixar vazio para o usuário preencher manualmente

### Modo Manual
- Quando ativado, desabilita o dropdown e permite edição livre de URL/Nome
- Útil para testar URLs não catalogadas ou ambientes de dev/staging

### Salvamento de Histórico
- **Futuro**: salvar no localStorage os últimos 5 sites testados
- **Futuro**: botão "Repetir última validação"

### Notificações
- Adicionar toasts/snackbars para feedback visual (sucesso/erro)
- Usar biblioteca como `react-toastify` ou componente customizado

---

## ✅ 10. Checklist de Implementação

- [ ] Criar arquivo `ValidationHub.jsx` em `axion-ia-panel/src/pages/`
- [ ] Criar arquivo `ValidationHub.css` em `axion-ia-panel/src/pages/`
- [ ] Importar `AXHUB_SITES` e `AXCROSS_SITES` de `sitesData.js`
- [ ] Criar array `ALL_SITES` combinando ambos com campo `platform`
- [ ] Implementar estrutura de estados
- [ ] Implementar TabSelector (UI/API vs Visual)
- [ ] Implementar SiteSelector (dropdown + toggle manual)
- [ ] Implementar ConfigurationForm (dinâmico por aba)
- [ ] Implementar funções de validação (reutilizar lógica existente)
- [ ] Implementar ProgressSection (comum)
- [ ] Implementar LogsSection (apenas UI/API)
- [ ] Implementar ResultsSection (dinâmico)
- [ ] Adicionar rota no router (`/validation-hub`)
- [ ] Adicionar link no menu lateral
- [ ] Testar fluxo completo (UI/API + Visual)
- [ ] Testar seleção de sites (AxHub + AxCross)
- [ ] Testar modo manual
- [ ] Validar responsividade
- [ ] Documentar no README ou docs

---

## 🚀 11. Próximos Passos

1. **Implementar ValidationHub.jsx** com a estrutura proposta
2. **Testar isoladamente** cada funcionalidade (tabs, site selector, validações)
3. **Migrar gradualmente** usuários de ValidationManager/VisualValidationManager para ValidationHub
4. **Deprecar** os componentes antigos após validação completa
5. **Adicionar analytics/telemetria** para rastrear uso (opcional)

---

## 📊 12. Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Componentes** | 2 separados (ValidationManager + VisualValidationManager) | 1 unificado (ValidationHub) |
| **Navegação** | Usuário precisa saber qual usar | Tabs claras na mesma interface |
| **Seleção de Sites** | Presets hardcoded (apenas 4 sites AxHub) | Dropdown dinâmico com todos os sites (AxHub + AxCross) |
| **Flexibilidade** | Apenas presets ou 100% manual | Dropdown + modo manual |
| **Credenciais** | Sempre manual | Pré-preenchimento opcional |
| **Manutenção** | 2 arquivos para atualizar | 1 arquivo centralizado |
| **UX** | Fragmentada | Unificada e intuitiva |

---

## 📝 13. Notas Técnicas

### Polling vs WebSocket
- Atualmente, a validação visual usa **polling** (GET a cada 2s)
- **Futuro**: migrar para WebSocket/SignalR para atualizações em tempo real

### Gerenciamento de Estado
- Atualmente usa `useState` local
- **Futuro**: considerar Context API ou Zustand para estado global (caso tenha múltiplas abas abertas)

### Validação de Formulário
- Adicionar validação mais robusta (Formik, React Hook Form, ou validação manual)
- Exibir erros inline nos campos

### Timeout/Retry
- Adicionar timeout para chamadas de API (ex: 30s)
- Implementar retry automático em caso de erro de rede

---

## 📚 14. Referências

- [ValidationManager.jsx](C:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel\src\pages\ValidationManager.jsx)
- [VisualValidationManager.jsx](C:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel\src\pages\VisualValidationManager.jsx)
- [sitesData.js](C:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel\src\data\sitesData.js)

---

**Autor**: GitHub Copilot  
**Data**: 2026-06-20  
**Status**: ✅ Proposta Completa
