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

// Combinar todos os sites
const ALL_SITES = [
  ...AXHUB_SITES.map(s => ({ ...s, platform: "AxHub" })),
  ...AXCROSS_SITES.map(s => ({ ...s, platform: "AxCross" }))
];

const ValidationHub = () => {
  // ==================== ESTADOS ====================
  
  // Configuração Geral
  const [activeTab, setActiveTab] = useState("ui-api"); // "ui-api" | "visual"
  const [selectedSite, setSelectedSite] = useState(null);
  const [manualMode, setManualMode] = useState(false);

  // Dados do Sistema
  const [systemUrl, setSystemUrl] = useState("");
  const [systemName, setSystemName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Configuração de Validação (UI/API)
  const [validationType, setValidationType] = useState("full"); // "full" | "ui" | "api"

  // Configuração de Validação (Visual)
  const [scope, setScope] = useState("full"); // "full" | "forms-only" | "navigation-only"

  // Execução
  const [isValidating, setIsValidating] = useState(false);
  const [validationId, setValidationId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  // Resultados (UI/API)
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);

  // Resultados (Visual)
  const [report, setReport] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [issues, setIssues] = useState([]);

  // ==================== FUNÇÕES AUXILIARES ====================

  const addLog = (message, type = "info") => {
    setLogs(prev => [...prev, { 
      time: new Date().toLocaleTimeString(), 
      message, 
      type 
    }]);
  };

  const resetState = () => {
    setProgress(0);
    setCurrentStep("");
    setResults(null);
    setLogs([]);
    setReport(null);
    setScreenshots([]);
    setIssues([]);
    setSelectedScreenshot(null);
  };

  // ==================== SELEÇÃO DE SITE ====================

  const handleSelectSite = () => {
    if (!selectedSite) {
      alert("Por favor, selecione um site do dropdown!");
      return;
    }

    setSystemUrl(selectedSite.url);
    setSystemName(selectedSite.nome);
    
    // Pré-preencher credenciais se existirem
    if (selectedSite.credentials) {
      setUsername(selectedSite.credentials.username || "");
      setPassword(selectedSite.credentials.password || "");
    } else {
      setUsername("");
      setPassword("");
    }

    addLog(`Site selecionado: ${selectedSite.nome} (${selectedSite.platform})`, "info");
  };

  const handleManualModeToggle = (e) => {
    const isManual = e.target.checked;
    setManualMode(isManual);

    if (isManual) {
      setSelectedSite(null);
      addLog("Modo manual ativado - URL e credenciais podem ser editados livremente", "info");
    } else {
      addLog("Modo manual desativado - Selecione um site do dropdown", "info");
    }
  };

  // ==================== VALIDAÇÃO UI/API ====================

  const startValidationUIAPI = async () => {
    if (!systemUrl.trim()) {
      alert("Por favor, informe a URL do sistema!");
      return;
    }

    setIsValidating(true);
    resetState();
    setCurrentStep("Iniciando validação...");
    addLog("Iniciando processo de validação UI/API...", "info");

    try {
      // Fase 1: Iniciar validação
      addLog(`Conectando ao sistema: ${systemUrl}`, "info");
      const startResponse = await axios.post(`${API_URL}/api/validation/start`, {
        systemUrl,
        systemName: systemName || systemUrl,
        credentials: username && password ? { username, password } : null,
        validationType
      });

      const valId = startResponse.data.validationId;
      setValidationId(valId);
      addLog(`Validação iniciada (ID: ${valId})`, "success");

      // Fase 2: UI Discovery
      if (validationType === "ui" || validationType === "full") {
        setCurrentStep("Descobrindo elementos da interface...");
        setProgress(10);
        addLog("Iniciando descoberta de UI...", "info");

        const uiResponse = await axios.post(`${API_URL}/api/validation/discover-ui`, {
          validationId: valId,
          url: systemUrl,
          credentials: username && password ? { username, password } : null
        });

        addLog(`Descobertos ${uiResponse.data.elements?.length || 0} elementos`, "success");
        setProgress(30);
      }

      // Fase 3: API Discovery
      if (validationType === "api" || validationType === "full") {
        setCurrentStep("Analisando APIs e endpoints...");
        setProgress(40);
        addLog("Iniciando descoberta de APIs...", "info");

        const apiResponse = await axios.post(`${API_URL}/api/validation/discover-api`, {
          validationId: valId,
          url: systemUrl
        });

        addLog(`Descobertos ${apiResponse.data.endpoints?.length || 0} endpoints`, "success");
        setProgress(60);
      }

      // Fase 4: Gerar relatório
      setCurrentStep("Gerando relatório de validação...");
      setProgress(80);
      addLog("Gerando relatório completo...", "info");

      const reportResponse = await axios.get(`${API_URL}/api/validation/report/${valId}`);
      setResults(reportResponse.data);
      addLog("Validação concluída com sucesso!", "success");
      setProgress(100);
      setCurrentStep("Validação concluída!");

    } catch (error) {
      console.error("Erro na validação:", error);
      addLog(`Erro: ${error.response?.data?.error || error.message}`, "error");
      setCurrentStep("Erro na validação");
    } finally {
      setIsValidating(false);
    }
  };

  // ==================== VALIDAÇÃO VISUAL ====================

  const startValidationVisual = async () => {
    if (!systemUrl.trim()) {
      alert("Por favor, informe a URL do sistema!");
      return;
    }

    setIsValidating(true);
    resetState();
    setCurrentStep("Iniciando validação visual...");

    try {
      // Iniciar validação
      const startResponse = await axios.post(`${API_URL}/api/visual-validation/start`, {
        systemUrl,
        credentials: username && password ? { username, password } : null,
        scope
      });

      const valId = startResponse.data.validationId;
      setValidationId(valId);

      // Monitorar progresso
      const interval = setInterval(async () => {
        try {
          const statusResponse = await axios.get(`${API_URL}/api/visual-validation/status/${valId}`);
          const status = statusResponse.data;

          setProgress(status.progress);
          setCurrentStep(status.currentStep);

          if (status.status === "concluído") {
            clearInterval(interval);
            await loadVisualReport(valId);
            setIsValidating(false);
          } else if (status.status === "erro") {
            clearInterval(interval);
            setCurrentStep(`Erro: ${status.error || "Erro desconhecido"}`);
            setIsValidating(false);
          }
        } catch (error) {
          console.error("Erro ao verificar status:", error);
        }
      }, 2000);

    } catch (error) {
      console.error("Erro na validação:", error);
      setCurrentStep(`Erro: ${error.response?.data?.error || error.message}`);
      setIsValidating(false);
    }
  };

  const loadVisualReport = async (valId) => {
    try {
      const reportResponse = await axios.get(`${API_URL}/api/visual-validation/report/${valId}`);
      setReport(reportResponse.data);

      // Carregar screenshots
      if (reportResponse.data.screens) {
        const screenshotList = reportResponse.data.screens
          .map(s => s.screenshot)
          .filter(s => s);
        setScreenshots(screenshotList);
      }

      // Carregar issues
      if (reportResponse.data.issues) {
        setIssues(reportResponse.data.issues);
      }

    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    }
  };

  // ==================== CONTROLE DE VALIDAÇÃO ====================

  const handleStartValidation = () => {
    if (activeTab === "ui-api") {
      startValidationUIAPI();
    } else {
      startValidationVisual();
    }
  };

  const handleStopValidation = () => {
    if (activeTab === "ui-api") {
      setIsValidating(false);
      setCurrentStep("Validação cancelada");
      addLog("Validação cancelada pelo usuário", "warning");
    } else {
      alert("A validação visual não pode ser interrompida manualmente.");
    }
  };

  // ==================== DOWNLOAD RELATÓRIO ====================

  const downloadReport = () => {
    const data = activeTab === "ui-api" ? results : report;
    if (!data) return;

    const reportData = JSON.stringify(data, null, 2);
    const blob = new Blob([reportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-validation-report-${validationId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (activeTab === "ui-api") {
      addLog("Relatório baixado com sucesso", "success");
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="validation-hub">
      <div className="validation-container">
        
        {/* ========== HEADER ========== */}
        <div className="validation-header">
          <h1>🔬 Validation Hub</h1>
          <p>Central unificada de validação de sistemas AxHub e AxCross</p>
        </div>

        {/* ========== TAB SELECTOR ========== */}
        <div className="tab-selector">
          <button 
            className={activeTab === "ui-api" ? "active" : ""}
            onClick={() => setActiveTab("ui-api")}
            disabled={isValidating}
          >
            <Code size={20} />
            <span>Validação UI/API</span>
          </button>
          <button 
            className={activeTab === "visual" ? "active" : ""}
            onClick={() => setActiveTab("visual")}
            disabled={isValidating}
          >
            <Eye size={20} />
            <span>Validação Visual</span>
          </button>
        </div>

        {/* ========== SITE SELECTOR ========== */}
        <div className="site-selector">
          <h3>🌍 Seleção de Site</h3>
          
          <div className="selector-controls">
            <div className="selector-row">
              <label>
                <Globe size={16} />
                Selecionar Site
              </label>
              <select 
                value={selectedSite?.id || ""} 
                onChange={(e) => {
                  const site = ALL_SITES.find(s => s.id === e.target.value);
                  setSelectedSite(site);
                }}
                disabled={manualMode || isValidating}
              >
                <option value="">-- Escolha um site --</option>
                <optgroup label="AxHub">
                  {AXHUB_SITES.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.nome} - {site.estado} ({site.tipo})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="AxCross">
                  {AXCROSS_SITES.map(site => (
                    <option key={site.id} value={site.id}>
                      {site.nome} - {site.estado} ({site.tipo})
                    </option>
                  ))}
                </optgroup>
              </select>
              
              <button 
                className="btn-select-site"
                onClick={handleSelectSite}
                disabled={!selectedSite || manualMode || isValidating}
              >
                <CheckCircle size={16} />
                Selecionar Site
              </button>
            </div>
          </div>

          <label className="toggle-manual">
            <input 
              type="checkbox" 
              checked={manualMode}
              onChange={handleManualModeToggle}
              disabled={isValidating}
            />
            Modo Manual (URL customizada)
          </label>
        </div>

        {/* ========== CONFIGURATION FORM ========== */}
        <div className="validation-config">
          <h3>⚙️ Configuração da Validação</h3>
          
          <div className="config-grid">
            {/* URL do Sistema */}
            <div className="config-field full-width">
              <label>
                <Globe size={16} />
                URL do Sistema *
              </label>
              <input 
                type="url" 
                value={systemUrl}
                onChange={(e) => setSystemUrl(e.target.value)}
                disabled={!manualMode && !selectedSite && !isValidating}
                placeholder="https://economia.axhub.axion.ws/"
                required
              />
            </div>

            {/* Nome do Sistema (apenas UI/API) */}
            {activeTab === "ui-api" && (
              <div className="config-field full-width">
                <label>
                  <FileText size={16} />
                  Nome do Sistema (opcional)
                </label>
                <input 
                  type="text" 
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  disabled={isValidating}
                  placeholder="AxHub - IPEM-PE Economia"
                />
              </div>
            )}

            {/* Usuário */}
            <div className="config-field">
              <label>
                <Shield size={16} />
                Usuário {activeTab === "visual" ? "" : "(opcional)"}
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isValidating}
                placeholder="usuario"
                autoComplete="username"
              />
            </div>

            {/* Senha */}
            <div className="config-field">
              <label>
                <Shield size={16} />
                Senha {activeTab === "visual" ? "" : "(opcional)"}
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isValidating}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {/* Tipo/Escopo (dinâmico por aba) */}
            {activeTab === "ui-api" ? (
              <div className="config-field full-width">
                <label>
                  <Zap size={16} />
                  Tipo de Validação
                </label>
                <div className="validation-types">
                  <label className={validationType === "full" ? "active" : ""}>
                    <input
                      type="radio"
                      value="full"
                      checked={validationType === "full"}
                      onChange={(e) => setValidationType(e.target.value)}
                      disabled={isValidating}
                    />
                    <Code size={16} />
                    <span>Completa (UI + API)</span>
                  </label>
                  <label className={validationType === "ui" ? "active" : ""}>
                    <input
                      type="radio"
                      value="ui"
                      checked={validationType === "ui"}
                      onChange={(e) => setValidationType(e.target.value)}
                      disabled={isValidating}
                    />
                    <Eye size={16} />
                    <span>Apenas UI</span>
                  </label>
                  <label className={validationType === "api" ? "active" : ""}>
                    <input
                      type="radio"
                      value="api"
                      checked={validationType === "api"}
                      onChange={(e) => setValidationType(e.target.value)}
                      disabled={isValidating}
                    />
                    <Database size={16} />
                    <span>Apenas API</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="config-field full-width">
                <label>
                  <Zap size={16} />
                  Escopo da Validação
                </label>
                <div className="validation-types">
                  <label className={scope === "full" ? "active" : ""}>
                    <input
                      type="radio"
                      value="full"
                      checked={scope === "full"}
                      onChange={(e) => setScope(e.target.value)}
                      disabled={isValidating}
                    />
                    <CheckSquare size={16} />
                    <span>Completa (Navegação + Formulários + CRUD)</span>
                  </label>
                  <label className={scope === "forms-only" ? "active" : ""}>
                    <input
                      type="radio"
                      value="forms-only"
                      checked={scope === "forms-only"}
                      onChange={(e) => setScope(e.target.value)}
                      disabled={isValidating}
                    />
                    <FileText size={16} />
                    <span>Apenas Formulários</span>
                  </label>
                  <label className={scope === "navigation-only" ? "active" : ""}>
                    <input
                      type="radio"
                      value="navigation-only"
                      checked={scope === "navigation-only"}
                      onChange={(e) => setScope(e.target.value)}
                      disabled={isValidating}
                    />
                    <Globe size={16} />
                    <span>Apenas Navegação</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="config-actions">
            {!isValidating ? (
              <button className="btn-start" onClick={handleStartValidation}>
                <Play size={20} />
                {activeTab === "ui-api" ? "Iniciar Validação UI/API" : "Iniciar Validação Visual"}
              </button>
            ) : (
              <button 
                className="btn-stop" 
                onClick={handleStopValidation}
                disabled={activeTab === "visual"}
              >
                {activeTab === "ui-api" ? (
                  <>
                    <Pause size={20} />
                    Parar Validação
                  </>
                ) : (
                  <>
                    <Activity size={20} className="spinner" />
                    Validando...
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ========== PROGRESS ========== */}
        {(isValidating || results || report) && (
          <div className="validation-progress">
            <div className="progress-header">
              <h3>📊 Progresso da Validação</h3>
              {(results || report) && (
                <button className="btn-download" onClick={downloadReport}>
                  <Download size={16} />
                  Baixar Relatório
                </button>
              )}
            </div>
            
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}>
                <span>{progress}%</span>
              </div>
            </div>
            
            <div className="progress-step">
              <Clock size={16} />
              <span>{currentStep}</span>
            </div>
          </div>
        )}

        {/* ========== LOGS (apenas UI/API) ========== */}
        {activeTab === "ui-api" && logs.length > 0 && (
          <div className="validation-logs">
            <h3>📋 Logs da Validação</h3>
            <div className="logs-container">
              {logs.map((log, idx) => (
                <div key={idx} className={`log-entry log-${log.type}`}>
                  <span className="log-time">{log.time}</span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== RESULTS (UI/API) ========== */}
        {activeTab === "ui-api" && results && (
          <div className="validation-results">
            <h3>✅ Resultados da Validação</h3>
            
            {/* Summary Cards */}
            <div className="results-summary">
              {results.ui && (
                <div className="summary-card">
                  <div className="summary-icon">
                    <Eye size={24} />
                  </div>
                  <div className="summary-content">
                    <h4>Elementos UI</h4>
                    <p className="summary-value">{results.ui.totalElements || 0}</p>
                    <p className="summary-detail">
                      {results.ui.buttons || 0} botões, {results.ui.inputs || 0} inputs, {results.ui.forms || 0} formulários
                    </p>
                  </div>
                </div>
              )}

              {results.api && (
                <div className="summary-card">
                  <div className="summary-icon">
                    <Server size={24} />
                  </div>
                  <div className="summary-content">
                    <h4>Endpoints API</h4>
                    <p className="summary-value">{results.api.totalEndpoints || 0}</p>
                    <p className="summary-detail">
                      {results.api.getCount || 0} GET, {results.api.postCount || 0} POST
                    </p>
                  </div>
                </div>
              )}

              <div className="summary-card">
                <div className="summary-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="summary-content">
                  <h4>Status</h4>
                  <p className="summary-value">{results.status || "Concluído"}</p>
                  <p className="summary-detail">
                    Duração: {results.duration || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Results - Implementar conforme necessário */}
            <div className="results-details">
              <pre>{JSON.stringify(results, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* ========== RESULTS (VISUAL) ========== */}
        {activeTab === "visual" && report && (
          <div className="visual-validation-results">
            <h3>🎯 Resultados da Validação Visual</h3>
            
            {/* Screenshots Grid */}
            {screenshots.length > 0 && (
              <div className="screenshots-section">
                <h4>📸 Screenshots</h4>
                <div className="screenshots-grid">
                  {screenshots.map((screenshot, idx) => (
                    <div 
                      key={idx} 
                      className="screenshot-card"
                      onClick={() => setSelectedScreenshot(screenshot)}
                    >
                      <img src={screenshot} alt={`Screenshot ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues List */}
            {issues.length > 0 && (
              <div className="issues-section">
                <h4>⚠️ Issues Encontradas ({issues.length})</h4>
                <div className="issues-list">
                  {issues.map((issue, idx) => (
                    <div key={idx} className={`issue-card issue-${issue.severity || "low"}`}>
                      <div className="issue-header">
                        <AlertTriangle size={20} />
                        <span className="issue-title">{issue.title}</span>
                        <span className={`issue-badge ${issue.severity || "low"}`}>
                          {issue.severity || "low"}
                        </span>
                      </div>
                      <p className="issue-description">{issue.description}</p>
                      {issue.location && (
                        <p className="issue-location">
                          <Info size={14} />
                          {issue.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Summary */}
            <div className="report-summary">
              <pre>{JSON.stringify(report, null, 2)}</pre>
            </div>
          </div>
        )}

      </div>

      {/* ========== SCREENSHOT MODAL ========== */}
      {selectedScreenshot && (
        <div className="screenshot-modal" onClick={() => setSelectedScreenshot(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedScreenshot(null)}>
              <XCircle size={24} />
            </button>
            <img src={selectedScreenshot} alt="Screenshot Ampliado" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationHub;
