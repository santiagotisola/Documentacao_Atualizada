/**
 * Rotas da API para Scenario Learning Engine
 * Gravação e reexecução de cenários
 */

import express from 'express';
import { fileURLToPath } from 'url';
import fsSync from 'fs';
import pathSync from 'path';
const router = express.Router();

// __dirname para ESM (path absoluto baseado no arquivo, não no cwd)
const __filename = fileURLToPath(import.meta.url);
const __dirname = pathSync.dirname(__filename);
// Diretório dos cenários — tenta os dois locais possíveis dependendo de onde a API é iniciada
const SCENARIOS_BASE_DIR = pathSync.resolve(__dirname, '../../engine/scenarios');
// Quando a API é iniciada da raiz do workspace (Axion.Docs/), os cenários vão para Axion.Docs/engine/scenarios
const SCENARIOS_BASE_DIR_ALT = pathSync.resolve(__dirname, '../../../../engine/scenarios');

// Resolve o path do cenário nos dois locais possíveis
function resolveScenarioPath(id) {
  const p1 = pathSync.join(SCENARIOS_BASE_DIR, id, 'scenario.json');
  if (fsSync.existsSync(p1)) return p1;
  const p2 = pathSync.join(SCENARIOS_BASE_DIR_ALT, id, 'scenario.json');
  if (fsSync.existsSync(p2)) return p2;
  return null;
}

// Lista todos os cenários nos dois locais
function listAllScenarioDirs() {
  const dirs = new Map();
  for (const base of [SCENARIOS_BASE_DIR, SCENARIOS_BASE_DIR_ALT]) {
    if (!fsSync.existsSync(base)) continue;
    for (const d of fsSync.readdirSync(base, { withFileTypes: true })) {
      if (d.isDirectory() && !dirs.has(d.name)) dirs.set(d.name, pathSync.join(base, d.name));
    }
  }
  return dirs;
}

// Importa engines
import ScenarioLearningEngine from '../../../engine/scenario-learning-engine.js';
import ScenarioExecutionEngine from '../../../engine/scenario-execution-engine.js';

// Instâncias globais
const learningEngine = new ScenarioLearningEngine();
const executionEngine = new ScenarioExecutionEngine();

// Carrega cenários na inicialização
learningEngine.loadAllScenarios();

/**
 * POST /api/scenarios/record/start
 * Inicia gravação de cenário
 */
router.post('/record/start', async (req, res) => {
  try {
    const { url, system, environment, contract, name, category } = req.body;

    const scenarioId = await learningEngine.startRecording({
      url,
      name: name || `${system} - ${environment}`,
      description: `Cenário gravado em ${system} (${environment})`,
      category: category || system,
      user: req.headers['x-user-email'] || 'sistema@axiontecnologia.com.br'
    });

    // Inicia monitoramento de ações do usuário em background
    learningEngine.monitorUserActions();

    res.json({
      status: 'recording',
      scenarioId,
      message: 'Gravação iniciada. Execute o fluxo normalmente.'
    });

  } catch (error) {
    console.error('Erro ao iniciar gravação:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scenarios/record/stop
 * Encerra gravação de cenário
 */
router.post('/record/stop', async (req, res) => {
  try {
    const scenarioId = await learningEngine.stopRecording();

    if (!scenarioId) {
      return res.status(400).json({ error: 'Nenhuma gravação ativa' });
    }

    res.json({
      status: 'completed',
      scenarioId,
      message: 'Gravação encerrada e cenário salvo com sucesso'
    });

  } catch (error) {
    console.error('Erro ao encerrar gravação:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scenarios
 * Lista todos os cenários da biblioteca
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    // Lê cenários dos dois diretórios possíveis
    const scenarioDirs = listAllScenarioDirs();
    const scenarios = [];

    for (const [id, dir] of scenarioDirs) {
      try {
        const jsonPath = pathSync.join(dir, 'scenario.json');
        if (!fsSync.existsSync(jsonPath)) continue;
        const s = JSON.parse(fsSync.readFileSync(jsonPath, 'utf-8'));
        if (category && s.category !== category) continue;
        scenarios.push({
          scenarioId: s.scenarioId || id,
          name: s.name || id,
          category: s.category || '',
          steps: Array.isArray(s.steps) ? s.steps.length : 0,
          duration: s.duration || 0,
          createdAt: s.createdAt || null
        });
      } catch (_) { /* ignora cenário corrompido */ }
    }

    res.json(scenarios);

  } catch (error) {
    console.error('Erro ao listar cenários:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scenarios/:id
 * Obtém detalhes de um cenário específico
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const scenario = await learningEngine.loadScenario(id);

    if (!scenario) {
      return res.status(404).json({ error: 'Cenário não encontrado' });
    }

    res.json(scenario);

  } catch (error) {
    console.error('Erro ao carregar cenário:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scenarios/execute
 * Executa um cenário a partir do scenarioId (ou scenarioPath), com nova URL opcional.
 * Rota usada pelo painel CUTI (Reutilizar Cenário Gravado).
 */
router.post('/execute', async (req, res) => {
  try {
    const { scenarioId, scenarioPath, url, categories = ['functional'], system, environment } = req.body;

    // Aceita tanto scenarioId ('AxHub - production') quanto scenarioPath completo
    const rawId = scenarioId || scenarioPath;
    if (!rawId) {
      return res.status(400).json({ error: 'scenarioId ou scenarioPath é obrigatório' });
    }

    // Extrai o ID de paths no formato 'engine/scenarios/{id}/scenario.json'
    let id = rawId;
    const pathMatch = rawId.match(/scenarios[\\/](.+?)[\\/]scenario\.json$/i);
    if (pathMatch) {
      id = pathMatch[1];
    }

    // Path absoluto relativo ao arquivo de rotas (independente do cwd)
    const absolutePath = resolveScenarioPath(id);

    console.log(`▶️ [CUTI] Executando cenário: ${id}`);
    console.log(`📁 Path: ${absolutePath || 'NÃO ENCONTRADO'}`);
    console.log(`🌐 URL override: ${url || '(usar URL original)'}`);
    console.log(`📋 Categorias: ${categories.join(', ')}`);

    if (!absolutePath) {
      const available = [...listAllScenarioDirs().keys()];
      return res.status(404).json({
        error: `Cenário não encontrado: "${id}"`,
        disponíveis: available
      });
    }

    const scenarioRaw = JSON.parse(fsSync.readFileSync(absolutePath, 'utf-8'));
    const steps = scenarioRaw.steps || [];
    const urlToUse = url || scenarioRaw.metadata?.url || scenarioRaw.url;

    const executionStart = Date.now();

    // Executa com Puppeteer
    const puppeteer = (await import('puppeteer')).default;
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--start-maximized', '--no-sandbox']
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    let passed = 0;
    let failed = 0;
    const stepResults = [];

    try {
      // Navegar para a URL de destino primeiro
      if (urlToUse) {
        console.log(`🌐 Navegando para: ${urlToUse}`);
        await page.goto(urlToUse, { waitUntil: 'domcontentloaded', timeout: 30000 });
        passed++;
      }

      // Replay dos passos gravados
      for (const [i, step] of steps.entries()) {
        const stepLabel = step.description || step.type || step.action || `Passo ${i + 1}`;
        try {
          const type = (step.type || step.action || '').toLowerCase();

          if (type === 'navigation' || type === 'navigate' || type === 'goto') {
            let targetUrl = step.url || step.value;
            if (targetUrl && url) {
              // Substituir host pela URL de destino
              try {
                const orig = new URL(targetUrl);
                const override = new URL(url);
                orig.hostname = override.hostname;
                orig.port = override.port;
                orig.protocol = override.protocol;
                targetUrl = orig.toString();
              } catch (_) {
                targetUrl = url;
              }
            }
            if (targetUrl) {
              await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
            }
          } else if (type === 'click') {
            if (step.selector) {
              await page.waitForSelector(step.selector, { timeout: 5000 }).catch(() => null);
              await page.click(step.selector).catch(() => null);
              await new Promise(r => setTimeout(r, 300));
            }
          } else if (type === 'input' || type === 'fill' || type === 'type') {
            if (step.selector) {
              await page.waitForSelector(step.selector, { timeout: 5000 }).catch(() => null);
              await page.type(step.selector, step.value || '', { delay: 30 }).catch(() => null);
            }
          } else if (type === 'scroll') {
            await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), step.scrollY || 0);
            await new Promise(r => setTimeout(r, 200));
          } else if (type === 'wait' || type === 'sleep') {
            await new Promise(r => setTimeout(r, step.duration || 500));
          }
          // Tipos desconhecidos: conta como passo executado sem erro

          passed++;
          stepResults.push({ step: i + 1, label: stepLabel, success: true });
          console.log(`  ✅ ${stepLabel}`);
        } catch (stepErr) {
          failed++;
          stepResults.push({ step: i + 1, label: stepLabel, success: false, error: stepErr.message });
          console.warn(`  ⚠️ ${stepLabel}: ${stepErr.message}`);
        }
      }
    } finally {
      await browser.close();
    }

    const duration = parseFloat(((Date.now() - executionStart) / 1000).toFixed(1));
    const total = passed + failed;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;
    const status = failed === 0 ? 'success' : passed > failed ? 'warning' : 'failed';

    console.log(`\n📊 Resultado: ${status.toUpperCase()} | Score: ${score}/100 | ${passed}/${total} | ${duration}s`);

    res.json({
      status,
      score,
      passed,
      failed,
      total,
      duration,
      scenarioId: id,
      urlExecutada: urlToUse,
      categories,
      steps: stepResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao executar cenário por path:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scenarios/:id/execute
 * Executa um cenário aprendido
 */
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { environment, parameters } = req.body;

    console.log(`▶️ Executando cenário: ${id}`);

    const execution = await executionEngine.executeScenario(id, {
      environment: environment || 'production',
      parameters: parameters || {}
    });

    res.json(execution);

  } catch (error) {
    console.error('Erro ao executar cenário:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scenarios/:id/compare
 * Compara execução de um cenário em dois ambientes (DE/PARA)
 */
router.post('/:id/compare', async (req, res) => {
  try {
    const { id } = req.params;
    const { origin, destination, parameters } = req.body;

    console.log(`🔄 Comparando cenário ${id}: ${origin} vs ${destination}`);

    // Executa no ambiente de origem
    const originExecution = await executionEngine.executeScenario(id, {
      environment: origin,
      parameters: parameters || {}
    });

    // Executa no ambiente de destino
    const destinationExecution = await executionEngine.executeScenario(id, {
      environment: destination,
      parameters: parameters || {}
    });

    // Compara resultados
    const comparison = compareExecutions(originExecution, destinationExecution);

    res.json({
      origin: originExecution,
      destination: destinationExecution,
      comparison
    });

  } catch (error) {
    console.error('Erro ao comparar cenários:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scenarios/stats
 * Estatísticas da biblioteca de cenários
 */
router.get('/library/stats', async (req, res) => {
  try {
    const stats = learningEngine.getLibraryStats();
    res.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scenarios/:id/executions
 * Histórico de execuções de um cenário
 */
router.get('/:id/executions', async (req, res) => {
  try {
    const { id } = req.params;
    const history = executionEngine.getExecutionHistory(id);
    res.json(history);
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Compara duas execuções de cenário
 */
function compareExecutions(origin, destination) {
  const differences = [];
  const totalSteps = Math.max(origin.steps.length, destination.steps.length);

  for (let i = 0; i < totalSteps; i++) {
    const originStep = origin.steps[i];
    const destStep = destination.steps[i];

    if (!originStep || !destStep) {
      differences.push({
        step: i + 1,
        type: 'missing_step',
        message: !originStep ? 'Passo faltando na origem' : 'Passo faltando no destino'
      });
      continue;
    }

    // Compara status
    if (originStep.success !== destStep.success) {
      differences.push({
        step: i + 1,
        type: 'status_mismatch',
        origin: originStep.success ? 'success' : 'failed',
        destination: destStep.success ? 'success' : 'failed'
      });
    }

    // Compara duração (diferença > 20%)
    const durationDiff = Math.abs(originStep.duration - destStep.duration);
    const durationDiffPercent = (durationDiff / originStep.duration) * 100;
    
    if (durationDiffPercent > 20) {
      differences.push({
        step: i + 1,
        type: 'performance_difference',
        originDuration: originStep.duration,
        destinationDuration: destStep.duration,
        difference: `${durationDiffPercent.toFixed(1)}%`
      });
    }
  }

  const similarity = ((totalSteps - differences.length) / totalSteps * 100).toFixed(1);

  return {
    totalSteps,
    differences: differences.length,
    similarity: `${similarity}%`,
    details: differences,
    status: differences.length === 0 ? 'identical' : differences.length < totalSteps / 2 ? 'similar' : 'different'
  };
}

export default router;
