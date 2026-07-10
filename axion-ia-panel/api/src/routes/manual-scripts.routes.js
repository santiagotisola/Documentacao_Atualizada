import express from 'express';
import ManualParser from '../services/manual-parser.js';
import { executeEquipmentCycle, EQUIPMENT_CYCLE_SCHEMA } from '../services/axhub-equipment-executor.js';
import { executeAdminCycle, ADMIN_CYCLE_SCHEMA } from '../services/axhub-admin-executor.js';
import { executeAxCrossCycle, AXCROSS_CYCLE_SCHEMA } from '../services/axcross-executor.js';
import { executeAxHubOperacoesCycle, AXHUB_OPERACOES_SCHEMA } from '../services/axhub-operacoes-executor.js';
import { executeAxHubAdminFullCycle, AXHUB_ADMIN_FULL_SCHEMA } from '../services/axhub-admin-full-executor.js';
import { extractFromSite, peekSite, buildExecutorData, getEntitiesForProduct, getSiteConfig } from '../services/sync-extractor.js';
import { registerInDest } from '../services/sync-registrator.js';

const router = express.Router();
const parser = new ManualParser();

/**
 * GET /api/manual-scripts/products
 * Retorna produtos disponíveis (AxHub, AxTon, AxCross)
 */
router.get('/products', async (req, res) => {
  try {
    const products = await parser.getProducts();
    res.json({ success: true, products });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/manual-scripts/:product/modules
 * Retorna módulos de um produto
 */
router.get('/:product/modules', async (req, res) => {
  try {
    const { product } = req.params;
    const modules = await parser.getModules(product);
    res.json({ success: true, modules });
  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/manual-scripts/:product/:module/scripts
 * Retorna scripts de um módulo
 */
router.get('/:product/:module/scripts', async (req, res) => {
  try {
    const { product, module } = req.params;
    const scripts = await parser.getScripts(product, module);
    res.json({ success: true, scripts });
  } catch (error) {
    console.error('Erro ao buscar scripts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/manual-scripts/special/equipment-cycle/schema
 * Retorna o schema do ciclo completo de equipamentos
 */
router.get('/special/equipment-cycle/schema', (req, res) => {
  res.json({
    success: true,
    script: {
      id: 'axhub-equipment-cycle',
      name: 'Ciclo Completo — Cadastro de Equipamentos',
      description: 'Executa o ciclo completo: Fabricante → Tipo → Modelo → Grupo → Equipamento → Faixa',
      product: 'axhub',
      module: 'cadastros-basicos',
      source: 'special',
      steps: EQUIPMENT_CYCLE_SCHEMA.steps,
      estimatedTime: EQUIPMENT_CYCLE_SCHEMA.estimatedTime,
      dataSchema: EQUIPMENT_CYCLE_SCHEMA,
    }
  });
});

/**
 * POST /api/manual-scripts/execute/equipment-cycle
 * Inicia execução do ciclo completo de equipamentos via SSE (Server-Sent Events)
 * O cliente recebe eventos em tempo real conforme cada passo é executado.
 */
router.post('/execute/equipment-cycle', async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ success: false, error: 'Dados não fornecidos' });
  }

  // Configurar SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (event, payload) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  sendEvent('start', { message: 'Iniciando execução...', timestamp: new Date().toISOString() });

  try {
    const results = await executeEquipmentCycle(data, (progress) => {
      sendEvent('progress', progress);
    });

    sendEvent('complete', { success: results.status !== 'error', results });
  } catch (error) {
    console.error('Erro no ciclo de equipamentos:', error);
    sendEvent('error', { message: error.message });
  } finally {
    res.end();
  }
});

/**
 * GET /api/manual-scripts/special/admin-cycle/schema
 */
router.get('/special/admin-cycle/schema', (req, res) => {
  res.json({
    success: true,
    script: {
      id: 'axhub-admin-cycle',
      name: 'Ciclo Admin — Arco e Motivo de Descarte',
      description: 'Cadastra Arco e Motivo de Descarte no AxHub (cadastros de configuração)',
      product: 'axhub',
      module: 'administracao',
      source: 'special',
      steps: ADMIN_CYCLE_SCHEMA.steps,
      estimatedTime: ADMIN_CYCLE_SCHEMA.estimatedTime,
      dataSchema: ADMIN_CYCLE_SCHEMA,
    }
  });
});

/**
 * POST /api/manual-scripts/execute/admin-cycle
 * Inicia execução do ciclo admin via SSE
 */
router.post('/execute/admin-cycle', async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ success: false, error: 'Dados não fornecidos' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (event, payload) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  sendEvent('start', { message: 'Iniciando ciclo admin...', timestamp: new Date().toISOString() });

  try {
    const results = await executeAdminCycle(data, (progress) => {
      sendEvent('progress', progress);
    });
    sendEvent('complete', { success: results.status !== 'error', results });
  } catch (error) {
    console.error('Erro no ciclo admin:', error);
    sendEvent('error', { message: error.message });
  } finally {
    res.end();
  }
});

/**
 * GET /api/manual-scripts/special/axcross-cycle/schema
 */
router.get('/special/axcross-cycle/schema', (req, res) => {
  res.json({
    success: true,
    script: {
      id: 'axcross-cycle',
      name: 'Ciclo AxCross — Área, Grupo, Equipamento, Veículo',
      description: 'Executa o ciclo completo de cadastros no AxCross: Área → Grupo → Equipamento → Veículo Monitorado',
      product: 'axcross',
      module: 'cadastros',
      source: 'special',
      steps: AXCROSS_CYCLE_SCHEMA.steps,
      estimatedTime: AXCROSS_CYCLE_SCHEMA.estimatedTime,
      dataSchema: AXCROSS_CYCLE_SCHEMA,
    }
  });
});

/**
 * POST /api/manual-scripts/execute/axcross-cycle
 * Inicia execução do ciclo AxCross via SSE
 */
router.post('/execute/axcross-cycle', async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ success: false, error: 'Dados não fornecidos' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (event, payload) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  sendEvent('start', { message: 'Iniciando ciclo AxCross...', timestamp: new Date().toISOString() });

  try {
    const results = await executeAxCrossCycle(data, (progress) => {
      sendEvent('progress', progress);
    });
    sendEvent('complete', { success: results.status !== 'error', results });
  } catch (error) {
    console.error('Erro no ciclo AxCross:', error);
    sendEvent('error', { message: error.message });
  } finally {
    res.end();
  }
});

/**
 * GET /api/manual-scripts/special/operacoes-cycle/schema
 */
router.get('/special/operacoes-cycle/schema', (req, res) => {
  res.json({
    success: true,
    script: {
      id: 'operacoes-cycle',
      name: 'Ciclo Operações — Aferição e Operação',
      description: 'Cadastra Aferição e Operação no AxHub. Requer perfil com permissão de Operações.',
      product: 'axhub',
      module: 'operacoes',
      source: 'special',
      steps: AXHUB_OPERACOES_SCHEMA.steps,
      estimatedTime: AXHUB_OPERACOES_SCHEMA.estimatedTime,
      dataSchema: AXHUB_OPERACOES_SCHEMA,
    }
  });
});

/**
 * POST /api/manual-scripts/execute/operacoes-cycle
 * Inicia execução do ciclo de Operações via SSE
 */
router.post('/execute/operacoes-cycle', async (req, res) => {
  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ success: false, error: 'Dados não fornecidos' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (event, payload) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  sendEvent('start', { message: 'Iniciando ciclo de Operações...', timestamp: new Date().toISOString() });

  try {
    const results = await executeAxHubOperacoesCycle(data, (progress) => {
      sendEvent('progress', progress);
    });
    sendEvent('complete', { success: results.status !== 'error', results });
  } catch (error) {
    console.error('Erro no ciclo de Operações:', error);
    sendEvent('error', { message: error.message });
  } finally {
    res.end();
  }
});

/**
 * GET /api/manual-scripts/special/admin-full-cycle/schema
 */
router.get('/special/admin-full-cycle/schema', (req, res) => {
  res.json({
    success: true,
    script: {
      id: 'admin-full-cycle',
      name: 'Ciclo Admin Completo — Tipo Aferição, Tarja, Enquadramento, Região, Forma Autuação, Sequencial',
      description: 'Cadastra todos os itens de configuração administrativa do AxHub.',
      product: 'axhub',
      module: 'admin',
      source: 'special',
      steps: AXHUB_ADMIN_FULL_SCHEMA.steps,
      estimatedTime: AXHUB_ADMIN_FULL_SCHEMA.estimatedTime,
      dataSchema: AXHUB_ADMIN_FULL_SCHEMA,
    }
  });
});

/**
 * POST /api/manual-scripts/execute/admin-full-cycle
 */
router.post('/execute/admin-full-cycle', async (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ success: false, error: 'Dados não fornecidos' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (event, payload) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
  };

  sendEvent('start', { message: 'Iniciando ciclo admin completo...', timestamp: new Date().toISOString() });

  try {
    const results = await executeAxHubAdminFullCycle(data, (progress) => {
      sendEvent('progress', progress);
    });
    sendEvent('complete', { success: results.status !== 'error', results });
  } catch (error) {
    console.error('Erro no ciclo admin completo:', error);
    sendEvent('error', { message: error.message });
  } finally {
    res.end();
  }
});

// ── GET /special/sites — lista de ambientes configurados
router.get('/special/sites', (req, res) => {
  const sites = [
    // AxHub
    {
      id: 'axhub-homo-admin',
      nome: 'AxHub Homologação',
      perfil: 'Admin',
      produto: 'axhub',
      ambiente: 'homologacao',
      url: process.env.AXHUB_BASE_URL || 'https://homologacao.axhub.axion.ws',
      login: process.env.AXHUB_LOGIN_ADMIN || 'Admin',
      temSenha: !!(process.env.AXHUB_SENHA_ADMIN),
    },
    {
      id: 'axhub-homo-suporte',
      nome: 'AxHub Homologação',
      perfil: 'Suporte',
      produto: 'axhub',
      ambiente: 'homologacao',
      url: process.env.AXHUB_BASE_URL || 'https://homologacao.axhub.axion.ws',
      login: process.env.AXHUB_LOGIN_SUPORTE || 'suporte@axiontecnologia.com.br',
      temSenha: !!(process.env.AXHUB_SENHA_SUPORTE),
    },
    // AxCross
    {
      id: 'axcross-homo',
      nome: 'AxCross Homologação',
      perfil: 'Suporte',
      produto: 'axcross',
      ambiente: 'homologacao',
      url: process.env.AXCROSS_BASE_URL || 'https://homologacao.axcross.axion.ws',
      login: process.env.AXCROSS_LOGIN || process.env.AXCROSS_LOGIN_SUPORTE || 'suporte@axiontecnologia.com.br',
      temSenha: !!(process.env.AXCROSS_SENHA || process.env.AXCROSS_SENHA_SUPORTE),
    },
    {
      id: 'axcross-detranpi',
      nome: 'AxCross DETRAN-PI',
      perfil: 'Suporte',
      produto: 'axcross',
      ambiente: 'producao',
      url: process.env.AXCROSS_DETRANPI_URL || 'https://detranpi.axcross.axion.ws',
      login: process.env.AXCROSS_LOGIN_DETRANPI || 'suporte@axiontecnologia.com.br',
      temSenha: !!(process.env.AXCROSS_SENHA_DETRANPI),
    },
    // Ambiente de teste: segundo AxCross (aponta para homologação, id diferente)
    {
      id: 'axcross-homo-b',
      nome: 'AxCross Homologação',
      perfil: 'Admin',
      produto: 'axcross',
      ambiente: 'homologacao',
      url: process.env.AXCROSS_BASE_URL || 'https://homologacao.axcross.axion.ws',
      login: process.env.AXCROSS_LOGIN || process.env.AXCROSS_LOGIN_SUPORTE || 'suporte@axiontecnologia.com.br',
      temSenha: !!(process.env.AXCROSS_SENHA || process.env.AXCROSS_SENHA_SUPORTE),
    },
  ].filter(s => s.login); // só retorna sites com login configurado
  res.json(sites);
});

// ── POST /special/sites/apply — aplica credenciais + URL de um site
router.post('/special/sites/apply', (req, res) => {
  const { id, url, login, senha } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id obrigatório' });

  const presets = {
    'axhub-homo-admin':    { urlKey: 'AXHUB_BASE_URL',   loginKey: 'AXHUB_LOGIN_ADMIN',   senhaKey: 'AXHUB_SENHA_ADMIN' },
    'axhub-homo-suporte':  { urlKey: 'AXHUB_BASE_URL',   loginKey: 'AXHUB_LOGIN_SUPORTE', senhaKey: 'AXHUB_SENHA_SUPORTE' },
    'axcross-homo':        { urlKey: 'AXCROSS_BASE_URL',  loginKey: 'AXCROSS_LOGIN',        senhaKey: 'AXCROSS_SENHA' },
    'axcross-detranpi':    { urlKey: 'AXCROSS_BASE_URL',  loginKey: 'AXCROSS_LOGIN',        senhaKey: 'AXCROSS_SENHA' },
  };
  const preset = presets[id];
  if (!preset) return res.status(404).json({ error: 'Site não encontrado' });

  if (url)   process.env[preset.urlKey]   = url;
  if (login) process.env[preset.loginKey] = login;
  if (senha) process.env[preset.senhaKey] = senha;

  // Aplica senha do preset do .env se não foi fornecida manualmente
  if (!senha) {
    const presetSenhas = {
      'axhub-homo-admin':   process.env.AXHUB_SENHA_ADMIN,
      'axhub-homo-suporte': process.env.AXHUB_SENHA_SUPORTE,
      'axcross-homo':       process.env.AXCROSS_SENHA || process.env.AXCROSS_SENHA_SUPORTE,
      'axcross-detranpi':   process.env.AXCROSS_SENHA_DETRANPI,
    };
    const presetSenha = presetSenhas[id];
    if (presetSenha) process.env[preset.senhaKey] = presetSenha;
  }

  // Para AxCross DETRAN-PI: aplica login preset se não foi informado manualmente
  if (id === 'axcross-detranpi' && !login) {
    if (process.env.AXCROSS_LOGIN_DETRANPI) process.env.AXCROSS_LOGIN = process.env.AXCROSS_LOGIN_DETRANPI;
    if (process.env.AXCROSS_DETRANPI_URL)   process.env.AXCROSS_BASE_URL = process.env.AXCROSS_DETRANPI_URL;
  }

  console.log(`🔑 Site aplicado: ${id} → URL=${process.env[preset.urlKey]}, login=${process.env[preset.loginKey]}`);
  res.json({ success: true, message: `Site "${id}" aplicado com sucesso` });
});

// ── GET /special/credentials — retorna credenciais atuais (logins, sem senhas)
router.get('/special/credentials', (req, res) => {
  res.json({
    axhub_admin_login:   process.env.AXHUB_LOGIN_ADMIN    || '',
    axhub_suporte_login: process.env.AXHUB_LOGIN_SUPORTE  || 'suporte@axiontecnologia.com.br',
    axcross_login:       process.env.AXCROSS_LOGIN         || 'suporte@axiontecnologia.com.br',
    axton_login:         process.env.AXTON_LOGIN           || '',
  });
});

// ── POST /special/credentials — atualiza credenciais em runtime
router.post('/special/credentials', (req, res) => {
  const {
    axhub_admin_login, axhub_admin_senha,
    axhub_suporte_login, axhub_suporte_senha,
    axcross_login, axcross_senha,
    axton_login, axton_senha,
  } = req.body || {};
  if (axhub_admin_login)   process.env.AXHUB_LOGIN_ADMIN   = axhub_admin_login;
  if (axhub_admin_senha)   process.env.AXHUB_SENHA_ADMIN   = axhub_admin_senha;
  if (axhub_suporte_login) process.env.AXHUB_LOGIN_SUPORTE = axhub_suporte_login;
  if (axhub_suporte_senha) process.env.AXHUB_SENHA_SUPORTE = axhub_suporte_senha;
  if (axcross_login)       process.env.AXCROSS_LOGIN        = axcross_login;
  if (axcross_senha)       process.env.AXCROSS_SENHA        = axcross_senha;
  if (axton_login)         process.env.AXTON_LOGIN          = axton_login;
  if (axton_senha)         process.env.AXTON_SENHA          = axton_senha;
  console.log('🔑 Credenciais atualizadas em runtime');
  res.json({ success: true, message: 'Credenciais atualizadas com sucesso' });
});

// ═══════════════════════════════════════════════════════════════
// SYNC — Integração entre sistemas (Extração + Cadastro)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /sync/entities/:siteId
 * Lista as entidades disponíveis para extração de um site.
 * Para sites de produção não pré-configurados, aceita query: ?produto=axhub&url=https://...
 */
router.get('/sync/entities/:siteId', (req, res) => {
  const { produto: produtoQuery, url: urlQuery } = req.query;
  let config = getSiteConfig(req.params.siteId);

  // Fallback para sites de produção não pré-configurados
  if (!config && produtoQuery && urlQuery) {
    config = { produto: produtoQuery, url: urlQuery };
  }

  if (!config) return res.status(404).json({ error: 'Site não encontrado. Informe ?produto=axhub&url=... para sites de produção' });

  const entities = getEntitiesForProduct(config.produto);
  res.json({ produto: config.produto, url: config.url, entities });
});

/**
 * POST /sync/extract  (SSE)
 * Extrai registros do site de origem.
 * Body:
 *   { sourceId: 'axcross-homo', entityIds: ['equipamento'] }   ← sites pré-configurados
 *   ou
 *   { sourceCredentials: { produto, url, login, senha }, entityIds: [...] }  ← sites de produção
 */
router.post('/sync/extract', async (req, res) => {
  const { sourceId, entityIds, sourceCredentials } = req.body || {};

  if (!sourceId && !sourceCredentials) {
    return res.status(400).json({ error: 'sourceId ou sourceCredentials obrigatório' });
  }

  // Para sites de produção, valida campos mínimos
  if (sourceCredentials) {
    const { produto, url, login, senha } = sourceCredentials;
    if (!produto || !url || !login || !senha) {
      return res.status(400).json({ error: 'sourceCredentials requer: produto, url, login, senha' });
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (event, payload) => res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);

  const label = sourceId || sourceCredentials?.url || 'origem';
  sendEvent('start', { message: `Iniciando extração de "${label}"...`, timestamp: new Date().toISOString() });

  try {
    const result = await extractFromSite(
      sourceId || '_inline_',
      entityIds || null,
      (progress) => {
        sendEvent('progress', progress);
        if (progress.data) sendEvent('entity_data', progress.data);
      },
      sourceCredentials || null,   // inlineConfig passado para sites de produção
    );
    sendEvent('complete', { success: true, result });
  } catch (err) {
    console.error('Erro na extração sync:', err);
    sendEvent('error', { message: err.message });
  } finally {
    res.end();
  }
});

/**
 * POST /sync/peek
 * Conta os registros existentes no destino para cada entidade solicitada.
 * Body (site pré-configurado): { destId, entityIds }
 * Body (produção):             { destCredentials: { produto, url, login, senha }, entityIds }
 * Retorna: { [entityId]: { count, sample, label } }
 */
router.post('/sync/peek', async (req, res) => {
  const { destId, destCredentials, entityIds } = req.body || {};
  if (!destId && !destCredentials) {
    return res.status(400).json({ error: 'destId ou destCredentials obrigatório' });
  }
  const inlineConfig = destCredentials || (destId ? getSiteConfig(destId) : null);
  if (!inlineConfig) return res.status(404).json({ error: `Site não encontrado: ${destId}` });
  if (!inlineConfig.login || !inlineConfig.senha) return res.status(400).json({ error: 'Credenciais incompletas' });
  try {
    const counts = await peekSite(entityIds || null, inlineConfig);
    return res.json({ counts });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * POST /sync/register  (SSE)
 * Cadastra registros extraídos no site de destino.
 * Body (site pré-configurado):
 *   { destId: 'axhub-homo-suporte', records: [...], extraData: {} }
 * Body (site de produção — credenciais inline):
 *   { destCredentials: { produto, url, login, senha }, records: [...] }
 */
router.post('/sync/register', async (req, res) => {
  const { destId, destCredentials, sourceId, records = [], extraData = {} } = req.body || {};

  if (!destId && !destCredentials) {
    return res.status(400).json({ error: 'destId ou destCredentials obrigatório' });
  }
  if (!records.length) return res.status(400).json({ error: 'Nenhum registro para cadastrar' });

  let destConfig = destId ? getSiteConfig(destId) : null;

  // Para sites de produção não pré-configurados, usa credenciais inline
  if (!destConfig && destCredentials) {
    const { produto, url, login, senha } = destCredentials;
    if (!produto || !url || !login || !senha) {
      return res.status(400).json({ error: 'destCredentials requer: produto, url, login, senha' });
    }
    destConfig = { produto, url, login, senha };
  }

  if (!destConfig) return res.status(404).json({ error: `Destino não encontrado: ${destId}` });

  // Valida: mesmo produto (apenas quando ambos os ids são conhecidos)
  if (sourceId && destId) {
    const srcConfig = getSiteConfig(sourceId);
    if (srcConfig && srcConfig.produto !== destConfig.produto) {
      return res.status(400).json({
        error: `Integração cross-sistema não permitida: origem="${srcConfig.produto}" destino="${destConfig.produto}". Use apenas ${destConfig.produto}→${destConfig.produto}.`,
      });
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (event, payload) => res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);

  sendEvent('start', {
    step: 0, total: records.length, label: 'Iniciando',
    status: 'running',
    message: `Cadastrando ${records.length} registro(s) em "${destConfig.url}" (${destConfig.produto})...`,
  });

  try {
    // Mescla extraData em cada registro
    const enriched = records.map(r => ({ ...extraData, ...r }));

    const results = await registerInDest(destConfig, enriched, (p) => {
      if (p.entityId === 'login') {
        sendEvent('progress', {
          step: 0, total: records.length,
          label: `Login no ${destConfig.produto.toUpperCase()}`,
          status: p.status,
          message: p.message,
        });
      } else {
        sendEvent('progress', {
          step: p.item, total: p.total,
          label: `Registro ${p.item}/${p.total} — ${p.entityId}`,
          status: p.status,
          message: p.message,
        });
      }
    });

    const successCount = results.filter(r => r.status === 'created' || r.status === 'skipped').length;
    const errorCount   = results.filter(r => r.status === 'error').length;

    sendEvent('complete', {
      success: errorCount === 0,
      summary: `${successCount}/${records.length} registros processados (${errorCount} erros)`,
      results,
    });
  } catch (err) {
    console.error('Erro no registro sync:', err);
    sendEvent('error', { message: err.message });
  } finally {
    res.end();
  }
});

export default router;
