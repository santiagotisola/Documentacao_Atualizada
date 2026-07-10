/**
 * 🛡️ QUALITY PLATFORM ROUTES
 * 
 * Rotas para a plataforma de qualidade PIEQ
 * - Especificação PIEQ
 * - Módulos e capabilities
 * - Projetos e sistemas
 * - Scans e relatórios
 * - Health scoring
 * - Roadmap
 */

import express from 'express';
import {
  getSpecification,
  listModules,
  listProjects,
  listScans,
  getStatistics,
  getQualityRoadmap,
  createScan,
  getScan,
  getReport
} from '../controllers/quality-platform.controller.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// QUALITY PLATFORM - PIEQ
// ═══════════════════════════════════════════════════════════════════

// Especificação completa
router.get('/quality/specification', getSpecification);

// Módulos disponíveis
router.get('/quality/modules', listModules);

// Projetos/sistemas
router.get('/quality/projects', listProjects);

// Histórico de scans
router.get('/quality/scans', listScans);

// Estatísticas gerais
router.get('/quality/stats', getStatistics);

// Roadmap de implementação
router.get('/quality/roadmap', getQualityRoadmap);

// Criar novo scan
router.post('/quality/scan', createScan);

// Status de scan específico
router.get('/quality/scan/:id', getScan);

// Relatório de scan
router.get('/quality/report/:id', getReport);

export default router;
