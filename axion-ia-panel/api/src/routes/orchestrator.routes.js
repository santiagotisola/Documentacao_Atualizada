/**
 * ROTAS DO ORCHESTRATOR ENGINE
 * Endpoints para orquestração autônoma
 */

import express from 'express';
import OrchestratorEngine from '../../../engine/orchestrator-engine.js';

const router = express.Router();
const orchestrator = new OrchestratorEngine();

/**
 * POST /api/orchestrator/execute
 * Executa modo autônomo
 * 
 * Body:
 * {
 *   "mode": "discover_only" | "full_validation" | "continuous_monitoring" | "regression" | "exploratory" | "comparison" | "learning",
 *   "config": {
 *     "name": "AxHub",
 *     "url": "http://localhost:3010",
 *     "credentials": { "username": "admin", "password": "senha" },
 *     "maxPages": 50,
 *     ...
 *   }
 * }
 */
router.post('/execute', async (req, res) => {
  try {
    const { mode, config } = req.body;

    if (!mode) {
      return res.status(400).json({
        error: 'Campo "mode" é obrigatório',
        validModes: ['discover_only', 'full_validation', 'continuous_monitoring', 'regression', 'exploratory', 'comparison', 'learning']
      });
    }

    if (!config || !config.url) {
      return res.status(400).json({
        error: 'Campo "config" com "url" é obrigatório'
      });
    }

    console.log(`\n📥 API: Recebida requisição de orquestração`);
    console.log(`   Modo: ${mode}`);
    console.log(`   URL: ${config.url}`);

    // Executa em background se for modo longo
    if (mode === 'full_validation' || mode === 'continuous_monitoring') {
      // Responde imediatamente
      res.json({
        message: 'Orquestração iniciada em background',
        mode,
        status: 'running',
        estimatedTime: mode === 'full_validation' ? '10-30 minutos' : 'contínuo'
      });

      // Executa em background
      orchestrator.execute(mode, config).catch(error => {
        console.error(`❌ Erro na orquestração em background: ${error.message}`);
      });

    } else {
      // Executa e aguarda resultado
      const result = await orchestrator.execute(mode, config);

      res.json({
        message: 'Orquestração concluída',
        mode,
        result
      });
    }

  } catch (error) {
    console.error(`❌ Erro na orquestração: ${error.message}`);
    res.status(500).json({
      error: 'Erro na orquestração',
      message: error.message
    });
  }
});

/**
 * GET /api/orchestrator/modes
 * Lista modos disponíveis e suas descrições
 */
router.get('/modes', (req, res) => {
  res.json({
    modes: [
      {
        id: 'discover_only',
        name: 'Discovery Only',
        description: 'Descobre automaticamente todo o sistema sem executar testes',
        duration: '5-10 minutos',
        use: 'Mapeamento inicial do sistema'
      },
      {
        id: 'full_validation',
        name: 'Full Validation',
        description: 'Validação completa: discovery + geração + execução + performance + security + coverage',
        duration: '10-30 minutos',
        use: 'Validação completa e autônoma'
      },
      {
        id: 'continuous_monitoring',
        name: 'Continuous Monitoring',
        description: 'Monitora sistema 24/7 executando validações periódicas',
        duration: 'contínuo',
        use: 'Monitoramento de produção'
      },
      {
        id: 'regression',
        name: 'Regression Suite',
        description: 'Executa suite de regressão com cenários críticos',
        duration: '5-15 minutos',
        use: 'Antes de deploys, verificação de builds'
      },
      {
        id: 'exploratory',
        name: 'Exploratory Testing',
        description: 'Testes exploratórios, fuzzing, random inputs',
        duration: '10-20 minutos',
        use: 'Descobrir bugs inesperados'
      },
      {
        id: 'comparison',
        name: 'Environment Comparison',
        description: 'Compara dois ambientes (dev vs prod, v1 vs v2)',
        duration: '5-10 minutos',
        use: 'Validar que ambientes estão iguais'
      },
      {
        id: 'learning',
        name: 'Scenario Learning',
        description: 'Grava novos cenários de usuários reais',
        duration: 'sob demanda',
        use: 'Criar novos cenários a partir de uso real'
      }
    ]
  });
});

/**
 * GET /api/orchestrator/status
 * Retorna status atual das orquestrações
 */
router.get('/status', (req, res) => {
  res.json({
    totalExecutions: orchestrator.orchestrationResults.length,
    lastExecution: orchestrator.orchestrationResults[orchestrator.orchestrationResults.length - 1] || null,
    history: orchestrator.orchestrationResults.slice(-10) // Últimas 10
  });
});

/**
 * POST /api/orchestrator/discover
 * Endpoint específico para discovery
 */
router.post('/discover', async (req, res) => {
  try {
    const result = await orchestrator.execute('discover_only', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orchestrator/validate
 * Endpoint específico para validação completa
 */
router.post('/validate', async (req, res) => {
  try {
    // Inicia em background
    res.json({
      message: 'Validação completa iniciada',
      status: 'running'
    });

    orchestrator.execute('full_validation', req.body).catch(error => {
      console.error(`Erro na validação: ${error.message}`);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orchestrator/regression
 * Endpoint específico para regressão
 */
router.post('/regression', async (req, res) => {
  try {
    const result = await orchestrator.execute('regression', req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
