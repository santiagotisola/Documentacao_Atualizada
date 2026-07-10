import React, { useState } from "react";
import { 
  Play, CheckCircle, XCircle, AlertTriangle, Info, 
  FileText, Code, Search, Download, RefreshCw,
  BookOpen, CheckSquare, Edit3, Zap, Globe, Link as LinkIcon
} from "lucide-react";
import axios from "axios";
import "./ValidacaoLinguistica.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3100";

const ValidacaoLinguistica = () => {
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════
  // Modo de operação (projetos ou URLs)
  const [mode, setMode] = useState("projects"); // "projects" | "urls"
  
  // Estados para projetos
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [scope, setScope] = useState("all");
  
  // Estados para URLs
  const [urlInput, setUrlInput] = useState("");
  const [selectedUrls, setSelectedUrls] = useState([]);
  const [urlResults, setUrlResults] = useState(null);
  
  // Estados para Scan Completo de Site
  const [crawlMode, setCrawlMode] = useState(false); // Se true, faz crawl completo
  const [maxPages, setMaxPages] = useState(50);
  const [maxDepth, setMaxDepth] = useState(3);
  const [siteResults, setSiteResults] = useState(null);
  
  // Estados comuns
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [filter, setFilter] = useState({
    severity: "all",
    category: "all",
    project: "all"
  });
  const [expandedFiles, setExpandedFiles] = useState(new Set());
  const [selectedIssues, setSelectedIssues] = useState(new Set());
  const [isApplyingBatch, setIsApplyingBatch] = useState(false);

  // Projetos disponíveis
  const PROJECTS = [
    { id: "axion-ia-panel", name: "axion-ia-panel", desc: "Painel React" },
    { id: "axion-ia-api", name: "axion-ia-api", desc: "API Node.js" },
    { id: "AxHub/docs-portal", name: "AxHub.Docs", desc: "Documentação AxHub" },
    { id: "AxTon/docs-portal", name: "AxTon.Docs", desc: "Documentação AxTon" },
    { id: "AxCross/docs-portal", name: "AxCross.Docs", desc: "Documentação AxCross" }
  ];

  // URLs pré-configuradas (sites AxHub conhecidos)
  const PREDEFINED_URLS = [
    { id: "economia-axhub", url: "https://economia.axhub.axion.ws/", name: "AxHub Economia" },
    { id: "ipempe-axhub", url: "https://ipempe.axhub.axion.ws/", name: "AxHub IPEM-PE" },
    { id: "goec6-axhub", url: "https://goec6.axhub.axion.ws/", name: "AxHub GOE C6" },
    { id: "demo-axhub", url: "https://demo.axhub.axion.ws/", name: "AxHub Demo" }
  ];

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════
  const toggleProject = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const selectAllProjects = () => {
    setSelectedProjects(PROJECTS.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedProjects([]);
  };

  const startScan = async () => {
    if (selectedProjects.length === 0) {
      alert("Selecione pelo menos um projeto!");
      return;
    }

    setIsScanning(true);
    setResults(null);

    try {
      const response = await axios.post(`${API_URL}/api/linguistic/scan`, {
        projects: selectedProjects,
        scope
      });

      setResults(response.data);
    } catch (error) {
      console.error("Erro no scan:", error);
      alert(`Erro: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const applyFix = async (filePath, line, original, suggestion) => {
    if (!confirm(`Aplicar correção:\n"${original}" → "${suggestion}"\n\nArquivo: ${filePath}\nLinha: ${line}`)) {
      return;
    }

    try {
      await axios.post(`${API_URL}/api/linguistic/fix`, {
        filePath,
        line,
        original,
        suggestion
      });

      alert("✅ Correção aplicada com sucesso!");
      // Reescanear para atualizar
      startScan();
    } catch (error) {
      console.error("Erro ao aplicar correção:", error);
      alert(`Erro: ${error.response?.data?.error || error.message}`);
    }
  };

  const toggleIssueSelection = (issueId) => {
    const newSelected = new Set(selectedIssues);
    if (newSelected.has(issueId)) {
      newSelected.delete(issueId);
    } else {
      newSelected.add(issueId);
    }
    setSelectedIssues(newSelected);
  };

  const selectAllInFile = (projectIdx, fileIdx) => {
    if (!results) return;

    const project = results.projects[projectIdx];
    const file = project.files[fileIdx];
    const newSelected = new Set(selectedIssues);

    file.issues.forEach((issue, issueIdx) => {
      const issueId = `${projectIdx}-${fileIdx}-${issueIdx}`;
      newSelected.add(issueId);
    });

    setSelectedIssues(newSelected);
  };

  const deselectAllInFile = (projectIdx, fileIdx) => {
    if (!results) return;

    const project = results.projects[projectIdx];
    const file = project.files[fileIdx];
    const newSelected = new Set(selectedIssues);

    file.issues.forEach((issue, issueIdx) => {
      const issueId = `${projectIdx}-${fileIdx}-${issueIdx}`;
      newSelected.delete(issueId);
    });

    setSelectedIssues(newSelected);
  };

  // ═══════════════════════════════════════════════════════════════
  // SELEÇÃO E APLICAÇÃO GLOBAL (TODOS OS ISSUES)
  // ═══════════════════════════════════════════════════════════════
  const selectAllIssuesGlobal = () => {
    if (!results) return;

    const newSelected = new Set();
    results.projects.forEach((project, pIdx) => {
      project.files.forEach((file, fIdx) => {
        file.issues.forEach((issue, iIdx) => {
          const issueId = `${pIdx}-${fIdx}-${iIdx}`;
          newSelected.add(issueId);
        });
      });
    });

    setSelectedIssues(newSelected);
    alert(`✅ ${newSelected.size} issues selecionados globalmente!`);
  };

  const deselectAllIssuesGlobal = () => {
    setSelectedIssues(new Set());
  };

  const applyAllFixesAtOnce = async () => {
    if (!results || !results.total_issues) {
      alert("Nenhum resultado de scan disponível!");
      return;
    }

    const totalIssues = results.total_issues;

    if (!confirm(
      `⚠️ ATENÇÃO: Aplicar TODAS as ${totalIssues} correções de uma vez?\n\n` +
      `Isso vai modificar ${results.total_files} arquivos automaticamente.\n\n` +
      `✅ Recomendado: Faça um commit Git antes de continuar!\n\n` +
      `Deseja prosseguir?`
    )) {
      return;
    }

    setIsApplyingBatch(true);

    try {
      // Coletar TODOS os fixes de TODOS os projetos
      const fixes = [];
      results.projects.forEach((project, pIdx) => {
        project.files.forEach((file, fIdx) => {
          file.issues.forEach((issue, iIdx) => {
            fixes.push({
              filePath: file.full_path,
              line: issue.line,
              original: issue.original,
              suggestion: issue.suggestion
            });
          });
        });
      });

      console.log(`[Aplicação Global] Enviando ${fixes.length} correções para API...`);

      const response = await axios.post(`${API_URL}/api/linguistic/fix-batch`, {
        fixes
      });

      const { success, failed } = response.data.results;

      alert(
        `🎉 Aplicação Global Concluída!\n\n` +
        `✅ Sucesso: ${success} correções\n` +
        `${failed > 0 ? `❌ Falhas: ${failed}\n` : ''}` +
        `\nTotal processado: ${success + failed} de ${fixes.length}`
      );
      
      // Limpar seleção e reescanear
      setSelectedIssues(new Set());
      startScan();
    } catch (error) {
      console.error("Erro ao aplicar todas as correções:", error);
      alert(`❌ Erro na aplicação global:\n${error.response?.data?.error || error.message}`);
    } finally {
      setIsApplyingBatch(false);
    }
  };

  const applySelectedFixes = async () => {
    if (selectedIssues.size === 0) {
      alert("Nenhum issue selecionado!");
      return;
    }

    if (!confirm(`Aplicar ${selectedIssues.size} correções selecionadas?`)) {
      return;
    }

    setIsApplyingBatch(true);

    try {
      // Coletar fixes dos issues selecionados
      const fixes = [];
      results.projects.forEach((project, pIdx) => {
        project.files.forEach((file, fIdx) => {
          file.issues.forEach((issue, iIdx) => {
            const issueId = `${pIdx}-${fIdx}-${iIdx}`;
            if (selectedIssues.has(issueId)) {
              fixes.push({
                filePath: file.full_path,
                line: issue.line,
                original: issue.original,
                suggestion: issue.suggestion
              });
            }
          });
        });
      });

      const response = await axios.post(`${API_URL}/api/linguistic/fix-batch`, {
        fixes
      });

      alert(`✅ ${response.data.results.success} correções aplicadas!\n${response.data.results.failed > 0 ? `⚠️ ${response.data.results.failed} falharam` : ''}`);
      
      // Limpar seleção e reescanear
      setSelectedIssues(new Set());
      startScan();
    } catch (error) {
      console.error("Erro ao aplicar correções em lote:", error);
      alert(`Erro: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsApplyingBatch(false);
    }
  };

  const countSimilarIssues = (original, suggestion) => {
    if (!results) return 0;

    let count = 0;
    results.projects.forEach(project => {
      project.files.forEach(file => {
        file.issues.forEach(issue => {
          if (issue.original === original && issue.suggestion === suggestion) {
            count++;
          }
        });
      });
    });

    return count;
  };

  const applyToAllSimilar = async (original, suggestion) => {
    const count = countSimilarIssues(original, suggestion);

    if (count === 0) {
      alert("Nenhuma ocorrência similar encontrada!");
      return;
    }

    if (!confirm(`Aplicar correção "${original}" → "${suggestion}" em ${count} ocorrências?`)) {
      return;
    }

    setIsApplyingBatch(true);

    try {
      const response = await axios.post(`${API_URL}/api/linguistic/fix-all-similar`, {
        original,
        suggestion,
        scanResults: results
      });

      alert(`✅ Correção aplicada em ${count} ocorrências!`);
      
      // Reescanear para atualizar
      startScan();
    } catch (error) {
      console.error("Erro ao aplicar em todos similares:", error);
      alert(`Erro: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsApplyingBatch(false);
    }
  };

  const toggleFileExpand = (fileId) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId);
    } else {
      newExpanded.add(fileId);
    }
    setExpandedFiles(newExpanded);
  };

  const downloadReport = () => {
    if (!results) return;

    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linguistic-report-${results.scan_id}.json`;
    a.click();
  };

  // ═══════════════════════════════════════════════════════════════
  // HANDLERS PARA URLS
  // ═══════════════════════════════════════════════════════════════
  const addManualUrl = () => {
    if (!urlInput.trim()) {
      alert("Digite uma URL!");
      return;
    }

    // Validar formato de URL
    try {
      new URL(urlInput);
    } catch {
      alert("URL inválida! Use formato: https://exemplo.com");
      return;
    }

    if (selectedUrls.some(u => u.url === urlInput)) {
      alert("Esta URL já foi adicionada!");
      return;
    }

    setSelectedUrls([
      ...selectedUrls,
      { id: `manual-${Date.now()}`, url: urlInput, name: urlInput, manual: true }
    ]);
    setUrlInput("");
  };

  const toggleUrl = (urlObj) => {
    setSelectedUrls(prev => 
      prev.some(u => u.url === urlObj.url)
        ? prev.filter(u => u.url !== urlObj.url)
        : [...prev, urlObj]
    );
  };

  const removeUrl = (urlToRemove) => {
    setSelectedUrls(prev => prev.filter(u => u.url !== urlToRemove));
  };

  const startUrlScan = async () => {
    if (selectedUrls.length === 0) {
      alert("Adicione pelo menos uma URL!");
      return;
    }

    setIsScanning(true);
    setUrlResults(null);

    try {
      const urls = selectedUrls.map(u => u.url);
      const response = await axios.post(`${API_URL}/api/linguistic/scan-urls`, {
        urls
      });

      setUrlResults(response.data);
    } catch (error) {
      console.error("Erro no scan de URLs:", error);
      alert(`Erro: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const downloadUrlReport = () => {
    if (!urlResults) return;

    const blob = new Blob([JSON.stringify(urlResults, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `url-linguistic-report-${new Date().toISOString()}.json`;
    a.click();
  };

  const startSiteCompleteScan = async () => {
    if (selectedUrls.length === 0) {
      alert("Adicione pelo menos uma URL!");
      return;
    }

    const url = selectedUrls[0].url; // Pega primeira URL selecionada

    if (!confirm(`Scan completo do site ${url}?\n\n` +
      `Isso vai:\n` +
      `• Descobrir até ${maxPages} páginas (profundidade ${maxDepth})\n` +
      `• Validar cada página encontrada\n` +
      `• Pode levar alguns minutos\n\n` +
      `Continuar?`)) {
      return;
    }

    setIsScanning(true);
    setSiteResults(null);
    setUrlResults(null);

    try {
      const response = await axios.post(`${API_URL}/api/linguistic/scan-site-complete`, {
        url,
        crawl: crawlMode,
        maxPages: parseInt(maxPages),
        maxDepth: parseInt(maxDepth)
      });

      setSiteResults(response.data);
    } catch (error) {
      console.error("Erro no scan completo do site:", error);
      alert(`Erro: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const downloadSiteReport = () => {
    if (!siteResults) return;

    const blob = new Blob([JSON.stringify(siteResults, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `site-linguistic-report-${new Date().toISOString()}.json`;
    a.click();
  };

  // ═══════════════════════════════════════════════════════════════
  // FILTROS
  // ═══════════════════════════════════════════════════════════════
  const getFilteredIssues = () => {
    if (!results) return [];

    let issues = [];

    for (const project of results.projects) {
      if (filter.project !== "all" && project.name !== filter.project) continue;

      for (const file of project.files) {
        for (const issue of file.issues) {
          if (filter.severity !== "all" && issue.severity !== filter.severity) continue;
          if (filter.category !== "all" && issue.category !== filter.category) continue;

          issues.push({
            ...issue,
            projectName: project.name,
            filePath: file.path,
            fullPath: file.full_path
          });
        }
      }
    }

    return issues;
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: SELEÇÃO DE PROJETOS
  // ═══════════════════════════════════════════════════════════════
  const renderProjectSelection = () => (
    <div className="ling-section">
      <div className="ling-section-header">
        <h3><Code size={20} /> Seleção de Projetos</h3>
        <div className="ling-selection-actions">
          <button onClick={selectAllProjects} className="ling-btn-link">
            Selecionar Todos
          </button>
          <button onClick={clearSelection} className="ling-btn-link">
            Limpar
          </button>
        </div>
      </div>

      <div className="ling-projects-grid">
        {PROJECTS.map(project => (
          <div
            key={project.id}
            className={`ling-project-card ${selectedProjects.includes(project.id) ? 'selected' : ''}`}
            onClick={() => toggleProject(project.id)}
          >
            <div className="ling-project-check">
              {selectedProjects.includes(project.id) ? (
                <CheckCircle size={20} />
              ) : (
                <div className="ling-project-check-empty" />
              )}
            </div>
            <div className="ling-project-info">
              <div className="ling-project-name">{project.name}</div>
              <div className="ling-project-desc">{project.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ling-scope-selection">
        <label className="ling-label">Escopo do Scan:</label>
        <div className="ling-scope-options">
          <label className="ling-radio">
            <input
              type="radio"
              value="all"
              checked={scope === "all"}
              onChange={(e) => setScope(e.target.value)}
            />
            <span>Completo (código + docs + Use Configuração</span>
          </label>
          <label className="ling-radio">
            <input
              type="radio"
              value="code"
              checked={scope === "code"}
              onChange={(e) => setScope(e.target.value)}
            />
            <span>Apenas código (.jsx, .js)</span>
          </label>
        </div>
      </div>

      <button
        className="ling-btn-primary"
        onClick={startScan}
        disabled={isScanning || selectedProjects.length === 0}
      >
        {isScanning ? (
          <>
            <RefreshCw size={18} className="spinning" />
            Escaneando... Aguarde
          </>
        ) : (
          <>
            <Play size={18} />
            Iniciar Scan Linguístico
          </>
        )}
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER: RESUMO DOS RESULTADOS
  // ═══════════════════════════════════════════════════════════════
  const renderSummary = () => {
    if (!results) return null;

    const { summary } = results;

    return (
      <div className="ling-section">
        <div className="ling-section-header">
          <h3><FileText size={20} /> Resumo do Scan</h3>
          <div className="ling-scan-id">ID: {results.scan_id}</div>
        </div>

        <div className="ling-metrics-grid">
          <div className="ling-metric-card">
            <div className="ling-metric-icon">
              <Code size={24} />
            </div>
            <div className="ling-metric-content">
              <div className="ling-metric-value">{summary.total_files}</div>
              <div className="ling-metric-label">Arquivos Escaneados</div>
            </div>
          </div>

          <div className="ling-metric-card">
            <div className="ling-metric-icon">
              <FileText size={24} />
            </div>
            <div className="ling-metric-content">
              <div className="ling-metric-value">{summary.total_texts}</div>
              <div className="ling-metric-label">Textos Analisados</div>
            </div>
          </div>

          <div className="ling-metric-card alert">
            <div className="ling-metric-icon">
              <AlertTriangle size={24} />
            </div>
            <div className="ling-metric-content">
              <div className="ling-metric-value">{summary.total_issues}</div>
              <div className="ling-metric-label">Issues Encontrados</div>
            </div>
          </div>

          <div className="ling-metric-card success">
            <div className="ling-metric-icon">
              <CheckSquare size={24} />
            </div>
            <div className="ling-metric-content">
              <div className="ling-metric-value">
                {summary.total_texts > 0 
                  ? Math.round((1 - summary.total_issues / summary.total_texts) * 100)
                  : 100}%
              </div>
              <div className="ling-metric-label">Taxa de Qualidade</div>
            </div>
          </div>
        </div>

        <div className="ling-breakdown">
          <div className="ling-breakdown-col">
            <h4>Por Severidade</h4>
            <div className="ling-breakdown-items">
              <div className="ling-breakdown-item severity-high">
                <span>Alta</span>
                <span>{summary.by_severity.high || 0}</span>
              </div>
              <div className="ling-breakdown-item severity-medium">
                <span>Média</span>
                <span>{summary.by_severity.medium || 0}</span>
              </div>
              <div className="ling-breakdown-item severity-low">
                <span>Baixa</span>
                <span>{summary.by_severity.low || 0}</span>
              </div>
            </div>
          </div>

          <div className="ling-breakdown-col">
            <h4>Por Categoria</h4>
            <div className="ling-breakdown-items">
              <div className="ling-breakdown-item">
                <span>Ortografia</span>
                <span>{summary.by_category.orthography || 0}</span>
              </div>
              <div className="ling-breakdown-item">
                <span>Gramática</span>
                <span>{summary.by_category.grammar || 0}</span>
              </div>
              <div className="ling-breakdown-item">
                <span>Terminologia</span>
                <span>{summary.by_category.terminology || 0}</span>
              </div>
              <div className="ling-breakdown-item">
                <span>Estilo</span>
                <span>{summary.by_category.style || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ling-actions">
          <button className="ling-btn-secondary" onClick={downloadReport}>
            <Download size={18} />
            Exportar JSON
          </button>
          
          <div className="ling-divider"></div>
          
          <button 
            className="ling-btn-primary" 
            onClick={selectAllIssuesGlobal}
            disabled={isApplyingBatch}
          >
            <CheckSquare size={18} />
            Selecionar TODOS ({summary.total_issues} issues)
          </button>
          
          <button 
            className="ling-btn-danger" 
            onClick={applyAllFixesAtOnce}
            disabled={isApplyingBatch || !results}
          >
            {isApplyingBatch ? (
              <>
                <RefreshCw size={18} className="spinning" />
                Aplicando...
              </>
            ) : (
              <>
                <Zap size={18} />
                Aplicar TODAS as Correções
              </>
            )}
          </button>

          {selectedIssues.size > 0 && selectedIssues.size < summary.total_issues && (
            <button 
              className="ling-btn-warning" 
              onClick={deselectAllIssuesGlobal}
            >
              <XCircle size={18} />
              Desselecionar Todos
            </button>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: PROJETOS COM ISSUES
  // ═══════════════════════════════════════════════════════════════
  const renderProjects = () => {
    if (!results || results.projects.length === 0) return null;

    return (
      <div className="ling-section">
        <div className="ling-section-header">
          <h3><BookOpen size={20} /> Projetos Analisados</h3>
          {selectedIssues.size > 0 && (
            <div className="ling-batch-actions">
              <span className="ling-selected-count">{selectedIssues.size} selecionado{selectedIssues.size !== 1 ? 's' : ''}</span>
              <button 
                className="ling-btn-batch"
                onClick={applySelectedFixes}
                disabled={isApplyingBatch}
              >
                {isApplyingBatch ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Aplicar Selecionados
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="ling-projects-list">
          {results.projects.map((project, idx) => (
            <div key={idx} className="ling-project-result">
              <div className="ling-project-result-header">
                <div className="ling-project-result-name">
                  {project.name}
                </div>
                <div className="ling-project-result-score">
                  <span className={`ling-score ${project.score >= 90 ? 'good' : project.score >= 70 ? 'ok' : 'bad'}`}>
                    {Math.round(project.score)}
                  </span>
                  <span className="ling-score-label">Qualidade</span>
                </div>
              </div>

              <div className="ling-project-result-stats">
                <span>{project.files.length} arquivo{project.files.length !== 1 ? 's' : ''} com issues</span>
                <span>•</span>
                <span>{project.issues_count} issue{project.issues_count !== 1 ? 's' : ''} encontrado{project.issues_count !== 1 ? 's' : ''}</span>
              </div>

              {project.files.map((file, fileIdx) => {
                const fileId = `${idx}-${fileIdx}`;
                const isExpanded = expandedFiles.has(fileId);
                
                // Verificar quantos issues deste arquivo estão selecionados
                const selectedInFile = file.issues.filter((issue, issueIdx) => 
                  selectedIssues.has(`${idx}-${fileIdx}-${issueIdx}`)
                ).length;
                const allSelected = selectedInFile === file.issues.length;

                return (
                  <div key={fileIdx} className="ling-file-item">
                    <div 
                      className="ling-file-header"
                      onClick={() => toggleFileExpand(fileId)}
                    >
                      <Code size={16} />
                      <span className="ling-file-path">{file.path}</span>
                      <span className="ling-file-count">{file.issues_count}</span>
                      {selectedInFile > 0 && (
                        <span className="ling-file-selected">{selectedInFile} sel.</span>
                      )}
                      <span className={`ling-expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                    </div>

                    {isExpanded && (
                      <>
                        <div className="ling-file-actions">
                          <button 
                            className="ling-btn-select-all"
                            onClick={() => allSelected ? deselectAllInFile(idx, fileIdx) : selectAllInFile(idx, fileIdx)}
                          >
                            <CheckSquare size={14} />
                            {allSelected ? 'Desselecionar Todos' : 'Selecionar Todos'}
                          </button>
                        </div>

                        <div className="ling-issues-list">
                          {file.issues.map((issue, issueIdx) => {
                            const issueId = `${idx}-${fileIdx}-${issueIdx}`;
                            const isSelected = selectedIssues.has(issueId);
                            const similarCount = countSimilarIssues(issue.original, issue.suggestion);

                            return (
                              <div key={issueIdx} className={`ling-issue severity-${issue.severity}`}>
                                <div className="ling-issue-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleIssueSelection(issueId)}
                                  />
                                </div>

                                <div className="ling-issue-content">
                                  <div className="ling-issue-header">
                                    <span className={`ling-issue-badge ${issue.severity}`}>
                                      {issue.severity === 'high' && <XCircle size={14} />}
                                      {issue.severity === 'medium' && <AlertTriangle size={14} />}
                                      {issue.severity === 'low' && <Info size={14} />}
                                      {issue.severity.toUpperCase()}
                                    </span>
                                    <span className="ling-issue-category">{issue.category}</span>
                                    {issue.line > 0 && <span className="ling-issue-line">Linha {issue.line}</span>}
                                    {similarCount > 1 && (
                                      <span className="ling-issue-similar">{similarCount} similares</span>
                                    )}
                                  </div>

                                  <div className="ling-issue-message">{issue.message}</div>

                                  <div className="ling-issue-diff">
                                    <div className="ling-diff-row">
                                      <span className="ling-diff-label">Encontrado:</span>
                                      <span className="ling-diff-value ling-diff-old">{issue.original}</span>
                                    </div>
                                    <div className="ling-diff-row">
                                      <span className="ling-diff-label">Sugestão:</span>
                                      <span className="ling-diff-value ling-diff-new">{issue.suggestion}</span>
                                    </div>
                                  </div>

                                  <div className="ling-issue-actions">
                                    <button
                                      className="ling-btn-fix"
                                      onClick={() => applyFix(file.full_path, issue.line, issue.original, issue.suggestion)}
                                    >
                                      <Zap size={14} />
                                      Aplicar Correção
                                    </button>
                                    {similarCount > 1 && (
                                      <button
                                        className="ling-btn-fix-all"
                                        onClick={() => applyToAllSimilar(issue.original, issue.suggestion)}
                                        disabled={isApplyingBatch}
                                      >
                                        <Zap size={14} />
                                        Aplicar em Todos ({similarCount})
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER - SELEÇÃO DE URLS
  // ═══════════════════════════════════════════════════════════════
  const renderUrlSelection = () => (
    <div className="ling-section">
      <div className="ling-section-header">
        <h3>
          <LinkIcon size={20} />
          Seleção de URLs
        </h3>
      </div>

      {/* Input Manual */}
      <div className="ling-url-input-group">
        <input
          type="url"
          className="ling-url-input"
          placeholder="https://exemplo.axhub.axion.ws/"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addManualUrl()}
        />
        <button className="ling-btn-add-url" onClick={addManualUrl}>
          <LinkIcon size={16} />
          Adicionar URL
        </button>
      </div>

      {/* URLs Pré-definidas */}
      <div className="ling-predefined-urls">
        <h4>Sites AxHub Conhecidos:</h4>
        <div className="ling-url-grid">
          {PREDEFINED_URLS.map(urlObj => (
            <div
              key={urlObj.id}
              className={`ling-url-card ${selectedUrls.some(u => u.url === urlObj.url) ? 'selected' : ''}`}
              onClick={() => toggleUrl(urlObj)}
            >
              <Globe size={16} />
              <div className="ling-url-card-info">
                <span className="ling-url-card-name">{urlObj.name}</span>
                <span className="ling-url-card-url">{urlObj.url}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* URLs Selecionadas */}
      {selectedUrls.length > 0 && (
        <div className="ling-selected-urls">
          <h4>URLs Selecionadas ({selectedUrls.length}):</h4>
          <div className="ling-url-list">
            {selectedUrls.map(urlObj => (
              <div key={urlObj.id} className="ling-url-item">
                <Globe size={14} />
                <span className="ling-url-text">{urlObj.name}</span>
                <button
                  className="ling-btn-remove-url"
                  onClick={() => removeUrl(urlObj.url)}
                  title="Remover"
                >
                  <XCircle size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opções de Scan Completo */}
      {selectedUrls.length > 0 && (
        <div className="ling-scan-options">
          <div className="ling-scan-mode">
            <label className="ling-checkbox-label">
              <input
                type="checkbox"
                checked={crawlMode}
                onChange={(e) => setCrawlMode(e.target.checked)}
              />
              <span>
                <strong>Scan Completo do Site</strong> - Descobre e valida todas as páginas automaticamente
              </span>
            </label>
          </div>

          {crawlMode && (
            <div className="ling-crawler-settings">
              <div className="ling-setting-item">
                <label>Máximo de Páginas:</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={maxPages}
                  onChange={(e) => setMaxPages(e.target.value)}
                />
              </div>
              <div className="ling-setting-item">
                <label>Profundidade Máxima:</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botões Scan */}
      <div className="ling-scan-buttons">
        {!crawlMode ? (
          <button
            className="ling-btn-scan"
            onClick={startUrlScan}
            disabled={isScanning || selectedUrls.length === 0}
          >
            {isScanning ? (
              <>
                <RefreshCw size={18} className="spinning" />
                Escaneando URLs...
              </>
            ) : (
              <>
                <Play size={18} />
                Iniciar Scan de URLs
              </>
            )}
          </button>
        ) : (
          <button
            className="ling-btn-scan ling-btn-scan-complete"
            onClick={startSiteCompleteScan}
            disabled={isScanning || selectedUrls.length === 0}
          >
            {isScanning ? (
              <>
                <RefreshCw size={18} className="spinning" />
                Escaneando site completo...
              </>
            ) : (
              <>
                <Globe size={18} />
                Iniciar Scan Completo do Site
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // RENDER - SUMÁRIO DE URLS
  // ═══════════════════════════════════════════════════════════════
  const renderUrlSummary = () => {
    if (!urlResults && !siteResults) return null;

    // Se tem site results (scan completo), renderiza sumário diferente
    if (siteResults) {
      const { stats, breakdown, pages_with_most_issues, common_issues } = siteResults;

      return (
        <div className="ling-summary">
          <div className="ling-summary-header">
            <h2>Resultados do Scan Completo</h2>
            <button className="ling-btn-export" onClick={downloadSiteReport}>
              <Download size={16} />
              Exportar JSON
            </button>
          </div>

          <div className="ling-metrics-grid">
            <div className="ling-metric-card">
              <div className="ling-metric-icon" style={{ color: '#3498db' }}>
                <Globe size={24} />
              </div>
              <div className="ling-metric-value">{stats.total_pages}</div>
              <div className="ling-metric-label">Páginas Analisadas</div>
            </div>

            <div className="ling-metric-card">
              <div className="ling-metric-icon" style={{ color: '#27ae60' }}>
                <CheckCircle size={24} />
              </div>
              <div className="ling-metric-value">{stats.successful}</div>
              <div className="ling-metric-label">Sucesso</div>
            </div>

            <div className="ling-metric-card">
              <div className="ling-metric-icon" style={{ color: '#e74c3c' }}>
                <XCircle size={24} />
              </div>
              <div className="ling-metric-value">{stats.failed}</div>
              <div className="ling-metric-label">Falhas</div>
            </div>

            <div className="ling-metric-card">
              <div className="ling-metric-icon" style={{ color: '#f39c12' }}>
                <AlertTriangle size={24} />
              </div>
              <div className="ling-metric-value">{stats.total_issues}</div>
              <div className="ling-metric-label">Issues Encontrados</div>
            </div>

            <div className="ling-metric-card">
              <div className="ling-metric-icon" style={{ color: '#9b59b6' }}>
                <FileText size={24} />
              </div>
              <div className="ling-metric-value">{stats.total_texts}</div>
              <div className="ling-metric-label">Textos Analisados</div>
            </div>

            <div className="ling-metric-card quality-score">
              <div className="ling-metric-icon" style={{ color: '#2ecc71' }}>
                <CheckCircle size={24} />
              </div>
              <div className="ling-metric-value">{stats.avg_quality_score}%</div>
              <div className="ling-metric-label">Qualidade Média</div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="ling-breakdown-section">
            <h3>Distribuição de Issues</h3>
            <div className="ling-breakdown-grid">
              <div className="ling-breakdown-card">
                <h4>Por Severidade</h4>
                <div className="ling-breakdown-items">
                  <div className="ling-breakdown-item high">
                    <span className="ling-breakdown-label">HIGH:</span>
                    <span className="ling-breakdown-value">{breakdown.by_severity.high}</span>
                  </div>
                  <div className="ling-breakdown-item medium">
                    <span className="ling-breakdown-label">MEDIUM:</span>
                    <span className="ling-breakdown-value">{breakdown.by_severity.medium}</span>
                  </div>
                  <div className="ling-breakdown-item low">
                    <span className="ling-breakdown-label">LOW:</span>
                    <span className="ling-breakdown-value">{breakdown.by_severity.low}</span>
                  </div>
                </div>
              </div>

              <div className="ling-breakdown-card">
                <h4>Por Categoria</h4>
                <div className="ling-breakdown-items">
                  <div className="ling-breakdown-item">
                    <span className="ling-breakdown-label">Ortografia:</span>
                    <span className="ling-breakdown-value">{breakdown.by_category.orthography}</span>
                  </div>
                  <div className="ling-breakdown-item">
                    <span className="ling-breakdown-label">Gramática:</span>
                    <span className="ling-breakdown-value">{breakdown.by_category.grammar}</span>
                  </div>
                  <div className="ling-breakdown-item">
                    <span className="ling-breakdown-label">Terminologia:</span>
                    <span className="ling-breakdown-value">{breakdown.by_category.terminology}</span>
                  </div>
                  <div className="ling-breakdown-item">
                    <span className="ling-breakdown-label">Estilo:</span>
                    <span className="ling-breakdown-value">{breakdown.by_category.style}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Páginas com mais problemas */}
          {pages_with_most_issues.length > 0 && (
            <div className="ling-pages-ranking">
              <h3>Páginas com Mais Issues</h3>
              <div className="ling-ranking-list">
                {pages_with_most_issues.map((page, idx) => (
                  <div key={idx} className="ling-ranking-item">
                    <span className="ling-ranking-position">{idx + 1}</span>
                    <div className="ling-ranking-info">
                      <span className="ling-ranking-url">{page.url}</span>
                      <span className="ling-ranking-stats">
                        {page.issues} issues • {page.quality}% qualidade • {page.texts} textos
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issues mais comuns */}
          {common_issues.length > 0 && (
            <div className="ling-common-issues">
              <h3>Issues Mais Comuns no Site</h3>
              <div className="ling-common-issues-list">
                {common_issues.slice(0, 10).map((issue, idx) => (
                  <div key={idx} className="ling-common-issue-item">
                    <div className="ling-common-issue-header">
                      <span className={`ling-issue-badge severity-${issue.severity}`}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <span className="ling-issue-category">{issue.category}</span>
                      <span className="ling-common-issue-count">
                        {issue.count}x em {issue.pages_count} páginas
                      </span>
                    </div>
                    <div className="ling-common-issue-diff">
                      <span className="ling-diff-old">{issue.original}</span>
                      <span> → </span>
                      <span className="ling-diff-new">{issue.suggestion}</span>
                    </div>
                    <div className="ling-common-issue-pages">
                      Exemplos: {issue.pages.slice(0, 2).map(p => new URL(p).pathname).join(', ')}
                      {issue.pages.length > 2 && ` +${issue.pages.length - 2} páginas`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Sumário normal para URLs individuais
    if (!urlResults) return null;

    const { stats } = urlResults;

    return (
      <div className="ling-summary">
        <div className="ling-summary-header">
          <h2>Resultados do Scan</h2>
          <button className="ling-btn-export" onClick={downloadUrlReport}>
            <Download size={16} />
            Exportar JSON
          </button>
        </div>

        <div className="ling-metrics-grid">
          <div className="ling-metric-card">
            <div className="ling-metric-icon" style={{ color: '#3498db' }}>
              <Globe size={24} />
            </div>
            <div className="ling-metric-value">{stats.total_urls}</div>
            <div className="ling-metric-label">URLs Analisadas</div>
          </div>

          <div className="ling-metric-card">
            <div className="ling-metric-icon" style={{ color: '#27ae60' }}>
              <CheckCircle size={24} />
            </div>
            <div className="ling-metric-value">{stats.successful}</div>
            <div className="ling-metric-label">Sucesso</div>
          </div>

          <div className="ling-metric-card">
            <div className="ling-metric-icon" style={{ color: '#e74c3c' }}>
              <XCircle size={24} />
            </div>
            <div className="ling-metric-value">{stats.failed}</div>
            <div className="ling-metric-label">Falhas</div>
          </div>

          <div className="ling-metric-card">
            <div className="ling-metric-icon" style={{ color: '#f39c12' }}>
              <AlertTriangle size={24} />
            </div>
            <div className="ling-metric-value">{stats.total_issues}</div>
            <div className="ling-metric-label">Issues Encontrados</div>
          </div>

          <div className="ling-metric-card">
            <div className="ling-metric-icon" style={{ color: '#9b59b6' }}>
              <FileText size={24} />
            </div>
            <div className="ling-metric-value">{stats.total_texts}</div>
            <div className="ling-metric-label">Textos Analisados</div>
          </div>

          <div className="ling-metric-card quality-score">
            <div className="ling-metric-icon" style={{ color: '#2ecc71' }}>
              <CheckCircle size={24} />
            </div>
            <div className="ling-metric-value">{stats.avg_quality_score}%</div>
            <div className="ling-metric-label">Qualidade Média</div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER - RESULTADOS DE URLS
  // ═══════════════════════════════════════════════════════════════
  const renderUrlResults = () => {
    // Se tem siteResults, mostra as páginas do site
    if (siteResults) {
      const resultsToShow = siteResults.pages || [];
      
      return (
        <div className="ling-results">
          <div className="ling-results-header">
            <h2>Mapa do Site ({resultsToShow.length} páginas)</h2>
          </div>

          <div className="ling-url-results-list">
            {resultsToShow.map((result, idx) => (
              <div key={idx} className="ling-url-result-card">
                <div className="ling-url-result-header">
                  <div className="ling-url-result-title">
                    {result.status === 'success' ? (
                      <CheckCircle size={20} style={{ color: '#27ae60' }} />
                    ) : (
                      <XCircle size={20} style={{ color: '#e74c3c' }} />
                    )}
                    <span className="ling-url-result-url">{result.url}</span>
                  </div>
                  <div className="ling-url-result-stats">
                    {result.status === 'success' ? (
                      <>
                        <span className="ling-url-stat">
                          <FileText size={14} />
                          {result.texts_analyzed} textos
                        </span>
                        <span className="ling-url-stat">
                          <AlertTriangle size={14} />
                          {result.issues.length} issues
                        </span>
                        <span className="ling-url-stat quality">
                          {result.quality_score}% qualidade
                        </span>
                      </>
                    ) : (
                      <span className="ling-url-error">Erro: {result.error}</span>
                    )}
                  </div>
                </div>

                {result.status === 'success' && result.issues.length > 0 && (
                  <div className="ling-url-issues">
                    {result.issues.map((issue, issueIdx) => (
                      <div key={issueIdx} className={`ling-issue severity-${issue.severity}`}>
                        <div className="ling-issue-content">
                          <div className="ling-issue-header">
                            <span className={`ling-issue-badge severity-${issue.severity}`}>
                              {issue.severity.toUpperCase()}
                            </span>
                            <span className="ling-issue-category">{issue.category}</span>
                            <span className="ling-issue-element">{issue.element_type || issue.type}</span>
                            {issue.selector && (
                              <span className="ling-issue-selector" title={issue.selector}>
                                <Code size={12} />
                                {issue.selector}
                              </span>
                            )}
                          </div>
                          <div className="ling-issue-message">{issue.message}</div>
                          {issue.context && (
                            <div className="ling-issue-context">
                              <Info size={14} />
                              <span>Contexto: {issue.context}</span>
                            </div>
                          )}
                          {issue.section && (
                            <div className="ling-issue-section">
                              Seção: {issue.section}
                            </div>
                          )}
                          <div className="ling-issue-diff">
                            <div className="ling-diff-item">
                              <span className="ling-diff-label">Encontrado:</span>
                              <span className="ling-diff-old">{issue.original}</span>
                            </div>
                            <div className="ling-diff-item">
                              <span className="ling-diff-label">Sugestão:</span>
                              <span className="ling-diff-new">{issue.suggestion}</span>
                            </div>
                          </div>
                          {issue.attributes && Object.keys(issue.attributes).length > 0 && (
                            <div className="ling-issue-attributes">
                              Atributos: {JSON.stringify(issue.attributes)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Renderização normal para URLs individuais
    if (!urlResults) return null;

    return (
      <div className="ling-results">
        <div className="ling-results-header">
          <h2>Detalhes por URL</h2>
        </div>

        <div className="ling-url-results-list">
          {urlResults.results.map((result, idx) => (
            <div key={idx} className="ling-url-result-card">
              <div className="ling-url-result-header">
                <div className="ling-url-result-title">
                  {result.status === 'success' ? (
                    <CheckCircle size={20} style={{ color: '#27ae60' }} />
                  ) : (
                    <XCircle size={20} style={{ color: '#e74c3c' }} />
                  )}
                  <span className="ling-url-result-url">{result.url}</span>
                </div>
                <div className="ling-url-result-stats">
                  {result.status === 'success' ? (
                    <>
                      <span className="ling-url-stat">
                        <FileText size={14} />
                        {result.texts_analyzed} textos
                      </span>
                      <span className="ling-url-stat">
                        <AlertTriangle size={14} />
                        {result.issues.length} issues
                      </span>
                      <span className="ling-url-stat quality">
                        {result.quality_score}% qualidade
                      </span>
                    </>
                  ) : (
                    <span className="ling-url-error">Erro: {result.error}</span>
                  )}
                </div>
              </div>

              {result.status === 'success' && result.issues.length > 0 && (
                <div className="ling-url-issues">
                  {result.issues.map((issue, issueIdx) => (
                    <div key={issueIdx} className={`ling-issue severity-${issue.severity}`}>
                      <div className="ling-issue-content">
                        <div className="ling-issue-header">
                          <span className={`ling-issue-badge severity-${issue.severity}`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="ling-issue-category">{issue.category}</span>
                          <span className="ling-issue-element">{issue.element_type}</span>
                        </div>
                        <div className="ling-issue-message">{issue.message}</div>
                        {issue.context && (
                          <div className="ling-issue-context">
                            <Info size={14} />
                            <span>Contexto: {issue.context}</span>
                          </div>
                        )}
                        <div className="ling-issue-diff">
                          <div className="ling-diff-item">
                            <span className="ling-diff-label">Encontrado:</span>
                            <span className="ling-diff-old">{issue.original}</span>
                          </div>
                          <div className="ling-diff-item">
                            <span className="ling-diff-label">Sugestão:</span>
                            <span className="ling-diff-new">{issue.suggestion}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="validacao-linguistica">
      <div className="ling-header">
        <div className="ling-header-content">
          <h1>🔤 Validação Linguística</h1>
          <p>Scanner de ortografia, gramática e terminologia corporativa</p>
        </div>
      </div>

      {/* Seletor de Modo */}
      <div className="ling-mode-selector">
        <button
          className={`ling-mode-btn ${mode === 'projects' ? 'active' : ''}`}
          onClick={() => setMode('projects')}
        >
          <Code size={18} />
          Projetos Locais
        </button>
        <button
          className={`ling-mode-btn ${mode === 'urls' ? 'active' : ''}`}
          onClick={() => setMode('urls')}
        >
          <Globe size={18} />
          Sites / URLs
        </button>
      </div>

      <div className="ling-container">
        {mode === 'projects' ? (
          <>
            {renderProjectSelection()}
            {renderSummary()}
            {renderProjects()}
          </>
        ) : (
          <>
            {renderUrlSelection()}
            {renderUrlSummary()}
            {renderUrlResults()}
          </>
        )}
      </div>
    </div>
  );
};

export default ValidacaoLinguistica;
