import React, { useState } from "react";
import axios from "axios";
import {
  Play, Pause, Download, FileText, CheckCircle, XCircle, AlertCircle,
  Globe, Code, Zap, Shield, Clock, Server, Eye, Database
} from "lucide-react";
import "./ValidationManager.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3100";

const ValidationManager = () => {
  const [systemUrl, setSystemUrl] = useState("");
  const [systemName, setSystemName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validationType, setValidationType] = useState("full"); // full, ui, api
  const [isValidating, setIsValidating] = useState(false);
  const [validationId, setValidationId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);

  // Sistemas pré-configurados
  const presets = [
    {
      name: "AxHub (IPEM-PE Economia)",
      url: "https://economia.axhub.axion.ws/",
      type: "full"
    },
    {
      name: "AxHub (IPEM-PE Portaria)",
      url: "https://portaria.axhub.axion.ws/",
      type: "full"
    },
    {
      name: "AxHub (SMTT Arapiraca)",
      url: "https://arapiraca.axhub.axion.ws/",
      type: "full"
    },
    {
      name: "AxHub (IMEPI)",
      url: "https://imepi.axhub.axion.ws/",
      type: "full"
    }
  ];

  const loadPreset = (preset) => {
    setSystemName(preset.name);
    setSystemUrl(preset.url);
    setValidationType(preset.type);
  };

  const addLog = (message, type = "info") => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message, type }]);
  };

  const startValidation = async () => {
    if (!systemUrl.trim()) {
      alert("Por favor, informe a URL do sistema!");
      return;
    }

    setIsValidating(true);
    setProgress(0);
    setCurrentStep("Iniciando validação...");
    setResults(null);
    setLogs([]);
    addLog("Iniciando processo de validação...", "info");

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

  const stopValidation = () => {
    setIsValidating(false);
    setCurrentStep("Validação cancelada");
    addLog("Validação cancelada pelo usuário", "warning");
  };

  const downloadReport = () => {
    if (!results) return;

    const reportData = JSON.stringify(results, null, 2);
    const blob = new Blob([reportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `validation-report-${validationId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog("Relatório baixado com sucesso", "success");
  };

  return (
    <div className="validation-manager">
      <div className="validation-container">
        {/* Header */}
        <div className="validation-header">
          <h1>🧪 Gerenciador de Validação de Sistemas</h1>
          <p>Configure e execute Validação automatizada de sistemas web</p>
        </div>

        {/* Presets */}
        <div className="validation-presets">
          <h3>⚡ Sistemas Pré-configurados</h3>
          <div className="presets-grid">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                className="preset-card"
                onClick={() => loadPreset(preset)}
                disabled={isValidating}
              >
                <Globe size={20} />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Form */}
        <div className="validation-config">
          <h3>⚙️ Configuração da Validação</h3>
          
          <div className="config-grid">
            <div className="config-field full-width">
              <label>
                <Globe size={16} />
                URL do Sistema *
              </label>
              <input
                type="url"
                placeholder="https://economia.axhub.axion.ws/"
                value={systemUrl}
                onChange={(e) => setSystemUrl(e.target.value)}
                disabled={isValidating}
                required
              />
            </div>

            <div className="config-field full-width">
              <label>
                <FileText size={16} />
                Nome do Sistema (opcional)
              </label>
              <input
                type="text"
                placeholder="AxHub - IPEM-PE Economia"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                disabled={isValidating}
              />
            </div>

            <div className="config-field">
              <label>
                <Shield size={16} />
                Usuário (opcional)
              </label>
              <input
                type="text"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isValidating}
                autoComplete="username"
              />
            </div>

            <div className="config-field">
              <label>
                <Shield size={16} />
                Senha (opcional)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isValidating}
                autoComplete="current-password"
              />
            </div>

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
          </div>

          <div className="config-actions">
            {!isValidating ? (
              <button className="btn-start" onClick={startValidation}>
                <Play size={20} />
                Iniciar Validação
              </button>
            ) : (
              <button className="btn-stop" onClick={stopValidation}>
                <Pause size={20} />
                Parar Validação
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        {(isValidating || results) && (
          <div className="validation-progress">
            <div className="progress-header">
              <h3>📊 Progresso da Validação</h3>
              {results && (
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

        {/* Logs */}
        {logs.length > 0 && (
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

        {/* Results */}
        {results && (
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

            {/* Detailed Results */}
            <div className="results-details">
              <h4>📄 Relatório Detalhado</h4>
              <pre className="results-json">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="validation-info">
          <AlertCircle size={20} />
          <div>
            <h4>Como funciona?</h4>
            <ul>
              <li>🔍 <strong>UI Discovery:</strong> Analisa interface, botões, formulários e elementos interativos</li>
              <li>🔌 <strong>API Discovery:</strong> Detecta endpoints, métodos HTTP e estrutura de dados</li>
              <li>📊 <strong>Relatório</strong> Gera documentação completa dos elementos descobertos</li>
              <li>🧪 <strong>Testes:</strong> Prepara base para geração automática de testes (integração PIEQ)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationManager;
