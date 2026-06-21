// Quality Platform Routes
const express = require('express');
const router = express.Router();
const qualityController = require('../controllers/quality.controller');

// ═══════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════
router.get('/dashboard', qualityController.getDashboard);

// ═══════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════
router.get('/projects', qualityController.listProjects);
router.get('/projects/:id', qualityController.getProject);
router.post('/projects', qualityController.createProject);
router.put('/projects/:id', qualityController.updateProject);
router.delete('/projects/:id', qualityController.deleteProject);

// ═══════════════════════════════════════════════════════════
// SCANS
// ═══════════════════════════════════════════════════════════
router.post('/scans/start', qualityController.startScan);
router.get('/scans/:id', qualityController.getScan);
router.get('/scans/project/:projectId', qualityController.getProjectScans);

// ═══════════════════════════════════════════════════════════
// ISSUES
// ═══════════════════════════════════════════════════════════
router.get('/issues', qualityController.listIssues);
router.get('/issues/:id', qualityController.getIssue);
router.put('/issues/:id/resolve', qualityController.resolveIssue);

module.exports = router;
