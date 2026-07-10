import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Play, Pause, Download, FileText, CheckCircle, XCircle, AlertCircle,
  Globe, Code, Zap, Shield, Clock, Server, Eye, Database, Image, List,
  CheckSquare, AlertTriangle, Info, Activity
} from "lucide-react";
import "./VisualValidationManager.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3100";

const VisualValidationManager = () => {
  const [systemUrl, setSystemUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [scope, setScope] = useState("full");
  const [isValidating, setIsValidating] = useState(false);
  const [validationId, setValidationId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [report, setReport] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [issues, setIssues] = useState([]);

  const startValidation = async () => {
    if (!systemUrl.trim()) {
      alert("Por favor, informe a URL do sistema!");
      return;
    }

    setIsValidating(true);
    setProgress(0);
    setCurrentStep("Iniciando validação visual...");
    setReport(null);
    setScreenshots([]);
    setIssues([]);

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
            await loadReport(valId);
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

  const loadReport = async (valId) => {
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

  const downloadReport = () => {
    if (!report) return;

    const reportData = JSON.stringify(report, null, 2);
    const blob = new Blob([reportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visual-validation-report-${validationId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="visual-validation-manager">
      <div className="visual-validation-container">
        {/* Header */}
        <div className="visual-validation-header">
          <h1>🎯 Gerenciador de Validação</h1>
          <p>Teste CRUD, navegação, formulários, ortografia e dependências com screenshots automáticos</p>
        </div>

        {/* Configuration Form */}
        <div className="visual-validation-config">
          <h3>### Configuração da Validação</h3>
          
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

            <div className="config-field">
              <label>
                <Shield size={16} />
                Usuário
              </label>
              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isValidating}
                autoComplete="username"
              />
            </div>

            <div className="config-field">
              <label>
                <Shield size={16} />
                Senha
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
          </div>

          <div className="config-actions">
            {!isValidating ? (
              <button className="btn-start" onClick={startValidation}>
                <Play size={20} />
                Iniciar Validação Visual
              </button>
            ) : (
              <button className="btn-stop" disabled>
                <Activity size={20} className="spinner" />
                Validando...
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        {(isValidating || report) && (
          <div className="visual-validation-progress">
            <div className="progress-header">
              <h3>📊 Progresso da Validação</h3>
              {report && (
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

        {/* Results */}
        {report && report.summary && (
          <>
            {/* Summary Cards - Only show if has data */}
            {(report.summary.totalScreens > 0 || report.summary.totalForms > 0 || report.summary.totalTests > 0) && (
              <div className="visual-validation-summary">
                <h3>✅ Resumo da Validação</h3>
                
                <div className="summary-cards">
                  {report.summary.totalScreens > 0 && (
                    <div className="summary-card">
                      <div className="summary-icon">
                        <Image size={24} />
                      </div>
                      <div className="summary-content">
                        <h4>Telas Validadas</h4>
                        <p className="summary-value">{report.summary.totalScreens}</p>
                        <p className="summary-detail">Screenshots capturados</p>
                      </div>
                    </div>
                  )}

                  {report.summary.totalForms > 0 && (
                    <div className="summary-card">
                      <div className="summary-icon">
                        <FileText size={24} />
                      </div>
                      <div className="summary-content">
                        <h4>Formulários</h4>
                        <p className="summary-value">{report.summary.totalForms}</p>
                        <p className="summary-detail">Com Validação CRUD</p>
                      </div>
                    </div>
                  )}

                  {report.summary.totalTests > 0 && (
                    <div className="summary-card">
                      <div className="summary-icon">
                        <CheckCircle size={24} />
                      </div>
                      <div className="summary-content">
                        <h4>Testes Executados</h4>
                        <p className="summary-value">{report.summary.totalTests}</p>
                        <p className="summary-detail">Validações de campo</p>
                      </div>
                    </div>
                  )}

                  {report.summary.totalIssues > 0 && (
                    <div className="summary-card">
                      <div className="summary-icon alert">
                        <AlertTriangle size={24} />
                      </div>
                      <div className="summary-content">
                        <h4>Issues Encontradas</h4>
                        <p className="summary-value">{report.summary.totalIssues}</p>
                        <p className="summary-detail">Erros de ortografia e Validação</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Screenshots Gallery */}
            {screenshots.length > 0 && (
              <div className="screenshots-section">
                <h3>📸 Screenshots Capturados</h3>
                <div className="screenshots-grid">
                  {screenshots.map((screenshot, idx) => (
                    <div
                      key={idx}
                      className="screenshot-thumb"
                      onClick={() => setSelectedScreenshot(screenshot)}
                    >
                      <img
                        src={`${API_URL}/api/visual-validation/screenshot/${screenshot}`}
                        alt={`Screenshot ${idx + 1}`}
                      />
                      <span>Tela {idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues List */}
            {issues.length > 0 && (
              <div className="issues-section">
                <h3>⚠️ Issues Encontradas</h3>
                <div className="issues-list">
                  {issues.map((issue, idx) => (
                    <div key={idx} className={`issue-item issue-${issue.type}`}>
                      <AlertCircle size={20} />
                      <div className="issue-content">
                        <strong>{issue.type === "spelling" ? "Erro de Ortografia" : issue.type}</strong>
                        <p>Campo: {issue.field}</p>
                        {issue.issues && (
                          <ul>
                            {issue.issues.map((i, iidx) => (
                              <li key={iidx}>
                                "{i.wrong}" → "{i.correct}"
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <div className="recommendations-section">
                <h3>💡 Recomendações</h3>
                <div className="recommendations-list">
                  {report.recommendations.map((rec, idx) => (
                    <div key={idx} className={`recommendation-item priority-${rec.priority}`}>
                      <Info size={20} />
                      <div className="recommendation-content">
                        <strong>{rec.category}</strong>
                        <p>{rec.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Box */}
        <div className="visual-validation-info">
          <AlertCircle size={20} />
          <div>
            <h4>O que é validado?</h4>
            <ul>
              <li>🔍 <strong>Navegação:</strong> Todas as páginas e rotas do sistema</li>
              <li>📝 <strong>Formulários:</strong> Campos, tipos, Validações limites</li>
              <li>✅ <strong>CRUD:</strong> Create, Read, Update, Delete operations</li>
              <li>📸 <strong>Screenshots:</strong> Captura visual de cada tela</li>
              <li>🔤 <strong>Ortografia:</strong> Verifica erros em labels e placeholders</li>
              <li>🔗 <strong>Dependências:</strong> Mapeia relações entre formulários</li>
              <li>📊 <strong>Fluxo:</strong> Documenta fluxo de dados entre telas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="screenshot-modal" onClick={() => setSelectedScreenshot(null)}>
          <div className="screenshot-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedScreenshot(null)}>×</button>
            <img
              src={`${API_URL}/api/visual-validation/screenshot/${selectedScreenshot}`}
              alt="Screenshot"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualValidationManager;
