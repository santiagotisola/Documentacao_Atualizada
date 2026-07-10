// Quality Platform Controllers
const { QualityProject, QualityScan, QualityIssue } = require('../models/quality.models');
const securityEngine = require('../services/quality/engines/security.engine');

// ═══════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/quality/projects
 * Lista todos os projetos
 */
exports.listProjects = async (req, res) => {
  try {
    const { status, type } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const projects = await QualityProject.find(filter)
      .populate('lastScanId')
      .sort({ updatedAt: -1 });
    
    res.json({ success: true, projects });
  } catch (error) {
    console.error('Erro ao listar projetos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/quality/projects/:id
 * Detalhes de um projeto
 */
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await QualityProject.findById(id)
      .populate('lastScanId');
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
    }
    
    // Buscar scans recentes
    const recentScans = await QualityScan.find({ projectId: id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Buscar issues abertas
    const openIssues = await QualityIssue.find({ 
      projectId: id, 
      status: 'open' 
    }).countDocuments();
    
    res.json({ 
      success: true, 
      project,
      recentScans,
      openIssues
    });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/quality/projects
 * Criar novo projeto
 */
exports.createProject = async (req, res) => {
  try {
    const projectData = req.body;
    
    // Validações básicas
    if (!projectData.name || !projectData.type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Nome e tipo são obrigatórios' 
      });
    }
    
    // Criar projeto
    const project = new QualityProject({
      ...projectData,
      createdBy: req.user?.id || 'system',
      status: 'active'
    });
    
    await project.save();
    
    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/quality/projects/:id
 * Atualizar projeto
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const project = await QualityProject.findByIdAndUpdate(
      id,
      {
        ...updates,
        updatedBy: req.user?.id || 'system'
      },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
    }
    
    res.json({ success: true, project });
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * DELETE /api/quality/projects/:id
 * Deletar projeto (soft delete)
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await QualityProject.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    );
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
    }
    
    res.json({ success: true, message: 'Projeto arquivado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════
// SCANS
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/quality/scans/start
 * Iniciar novo scan
 */
exports.startScan = async (req, res) => {
  try {
    const { projectId, scanType = 'full', engines = ['security'] } = req.body;
    
    // Validar projeto
    const project = await QualityProject.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Projeto não encontrado' });
    }
    
    // Criar scan
    const scan = new QualityScan({
      projectId,
      scanType,
      status: 'running',
      startedAt: new Date(),
      createdBy: req.user?.id || 'system',
      metadata: {
        triggeredBy: 'manual',
        gitBranch: project.repository?.branch || 'main'
      }
    });
    
    await scan.save();
    
    // Executar scan em background (não bloquear resposta)
    executeScanBackground(scan._id, project, engines);
    
    res.status(202).json({ 
      success: true, 
      scan,
      message: 'Scan iniciado. Acompanhe o progresso pelo ID.' 
    });
    
  } catch (error) {
    console.error('Erro ao iniciar scan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/quality/scans/:id
 * Status e resultados de um scan
 */
exports.getScan = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scan = await QualityScan.findById(id)
      .populate('projectId');
    
    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan não encontrado' });
    }
    
    // Buscar issues deste scan
    const issues = await QualityIssue.find({ scanId: id });
    
    res.json({ 
      success: true, 
      scan,
      issues
    });
  } catch (error) {
    console.error('Erro ao buscar scan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/quality/scans/project/:projectId
 * Listar scans de um projeto
 */
exports.getProjectScans = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 20 } = req.query;
    
    const scans = await QualityScan.find({ projectId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, scans });
  } catch (error) {
    console.error('Erro ao listar scans:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════
// ISSUES
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/quality/issues
 * Listar todas as issues
 */
exports.listIssues = async (req, res) => {
  try {
    const { projectId, status, severity, category } = req.query;
    
    const filter = {};
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (category) filter.category = category;
    
    const issues = await QualityIssue.find(filter)
      .populate('projectId')
      .populate('scanId')
      .sort({ severity: 1, createdAt: -1 })
      .limit(100);
    
    res.json({ success: true, issues });
  } catch (error) {
    console.error('Erro ao listar issues:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/quality/issues/:id
 * Detalhes de uma issue
 */
exports.getIssue = async (req, res) => {
  try {
    const { id } = req.params;
    
    const issue = await QualityIssue.findById(id)
      .populate('projectId')
      .populate('scanId');
    
    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue não encontrada' });
    }
    
    res.json({ success: true, issue });
  } catch (error) {
    console.error('Erro ao buscar issue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/quality/issues/:id/resolve
 * Resolver uma issue
 */
exports.resolveIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;
    
    const issue = await QualityIssue.findByIdAndUpdate(
      id,
      {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: req.user?.id || 'system',
        resolution
      },
      { new: true }
    );
    
    if (!issue) {
      return res.status(404).json({ success: false, error: 'Issue não encontrada' });
    }
    
    res.json({ success: true, issue });
  } catch (error) {
    console.error('Erro ao resolver issue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/quality/dashboard
 * Estatísticas gerais do dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    // Projetos ativos
    const totalProjects = await QualityProject.countDocuments({ status: 'active' });
    
    // Total de scans
    const totalScans = await QualityScan.countDocuments({ status: 'completed' });
    
    // Issues abertas
    const totalIssues = await QualityIssue.countDocuments({ status: 'open' });
    const criticalIssues = await QualityIssue.countDocuments({ 
      status: 'open', 
      severity: 'critical' 
    });
    const highIssues = await QualityIssue.countDocuments({ 
      status: 'open', 
      severity: 'high' 
    });
    
    // Score médio (últimos scans)
    const recentScans = await QualityScan.find({ status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(10);
    
    const averageScore = recentScans.length > 0
      ? Math.round(recentScans.reduce((sum, s) => sum + (s.scores?.overall || 0), 0) / recentScans.length)
      : 0;
    
    res.json({
      success: true,
      stats: {
        totalProjects,
        totalScans,
        totalIssues,
        criticalIssues,
        highIssues,
        averageScore
      },
      recentScans: recentScans.slice(0, 5)
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ═══════════════════════════════════════════════════════════
// BACKGROUND SCAN EXECUTION
// ═══════════════════════════════════════════════════════════
async function executeScanBackground(scanId, project, engines) {
  try {
    const scan = await QualityScan.findById(scanId);
    if (!scan) return;
    
    let allIssues = [];
    const results = {};
    
    // Executar security engine se habilitado
    if (engines.includes('security')) {
      const securityResults = await securityEngine.scanProject(
        project.repository?.path || './axion-ia-panel'
      );
      
      results.security = securityResults;
      
      // Salvar issues encontradas
      for (const issueData of securityResults.issues) {
        const issue = new QualityIssue({
          scanId,
          projectId: project._id,
          ...issueData
        });
        await issue.save();
        allIssues.push(issue._id.toString());
      }
    }
    
    // Calcular score geral (simplificado)
    const securityScore = results.security
      ? Math.max(0, 100 - (results.security.criticalCount * 10) - (results.security.highCount * 5))
      : 100;
    
    // Atualizar scan
    await QualityScan.findByIdAndUpdate(scanId, {
      status: 'completed',
      completedAt: new Date(),
      duration: Math.floor((new Date() - scan.startedAt) / 1000),
      scores: {
        overall: securityScore,
        security: securityScore
      },
      results,
      statistics: {
        totalIssues: allIssues.length,
        newIssues: allIssues.length,
        filesAnalyzed: 50 // TODO: contar real
      }
    });
    
    // Atualizar projeto
    await QualityProject.findByIdAndUpdate(project._id, {
      lastScanId: scanId,
      $inc: { 'statistics.totalScans': 1 }
    });
    
  } catch (error) {
    console.error('Erro ao executar scan:', error);
    await QualityScan.findByIdAndUpdate(scanId, {
      status: 'failed',
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
}

module.exports = exports;
