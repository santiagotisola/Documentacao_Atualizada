/**
 * Quality Platform Controller
 * Endpoints para a plataforma de qualidade PIEQ
 */

import {
  loadSpecification,
  getModules,
  getProjects,
  getScanHistory,
  calculateHealthScore,
  getRoadmap,
  getStats,
  startScan,
  getScanStatus,
  generateReport
} from '../services/quality-platform.service.js';

/**
 * GET /api/quality/specification
 * Retorna a especificação completa do PIEQ
 */
export async function getSpecification(req, res, next) {
  try {
    const spec = await loadSpecification();
    res.json(spec);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/quality/modules
 * Lista todos os módulos disponíveis
 */
export async function listModules(req, res, next) {
  try {
    const modules = await getModules();
    res.json({ modules });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/quality/projects
 * Lista todos os projetos/sistemas
 */
export async function listProjects(req, res, next) {
  try {
    const projects = await getProjects();
    res.json({ projects });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/quality/scans
 * Lista histórico de scans
 */
export async function listScans(req, res, next) {
  try {
    const scans = await getScanHistory();
    res.json({ scans });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/quality/stats
 * Retorna estatísticas gerais
 */
export async function getStatistics(req, res, next) {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/quality/roadmap
 * Retorna roadmap de implementação
 */
export async function getQualityRoadmap(req, res, next) {
  try {
    const roadmap = await getRoadmap();
    res.json(roadmap);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/quality/scan
 * Inicia um novo scan
 */
export async function createScan(req, res, next) {
  try {
    const { projectId, options } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }
    
    const scan = await startScan(projectId, options);
    res.status(201).json(scan);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/quality/scan/:id
 * Retorna status de um scan
 */
export async function getScan(req, res, next) {
  try {
    const { id } = req.params;
    const scan = await getScanStatus(id);
    res.json(scan);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/quality/report/:id
 * Gera relatório de um scan
 */
export async function getReport(req, res, next) {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    
    const report = await generateReport(id, format);
    
    if (format === 'json') {
      res.json(report);
    } else {
      // TODO: Implementar outros formatos (PDF, HTML)
      res.json(report);
    }
  } catch (error) {
    next(error);
  }
}
