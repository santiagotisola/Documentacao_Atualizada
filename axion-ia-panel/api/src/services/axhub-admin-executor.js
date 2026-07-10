/**
 * AxHub Admin Executor
 * Ciclo de cadastros administrativos: Arco + Motivo de Descarte
 *
 * Ordem:
 *  1. Login
 *  2. Arco            (Configurações → Arcos → /arco/new)
 *  3. Motivo Descarte (Configurações → Motivos de Descarte → /motivodescarte/new)
 *  4. Verificação Final
 */

import puppeteer from 'puppeteer';

const BASE_URL = process.env.AXHUB_BASE_URL || 'https://homologacao.axhub.axion.ws';
const LOGIN_URL = `${BASE_URL}/Home/Login`;

const SELECTORS = {
  login: {
    usuario: '#Username',
    senha:   '#Password',
    btn:     'button[type="submit"]',
  },
  arco: {
    url:         `${BASE_URL}/arco/new`,
    listaUrl:    `${BASE_URL}/arco`,
    nome:        '#Nome',
    localizacao: '#Localizacao',
  },
  motivoDescarte: {
    url:      `${BASE_URL}/motivodescarte/new`,
    listaUrl: `${BASE_URL}/motivodescarte`,
    codigo:   '#Codigo',
    descricao:'#Descricao',
  },
};

export const ADMIN_CYCLE_SCHEMA = {
  description: 'Ciclo de cadastros administrativos — Arco e Motivo de Descarte',
  steps: 4,
  estimatedTime: '~2 minutos',
  fields: [
    { name: 'arco_nome',         label: 'Arco — Nome',                 type: 'text', required: true,  placeholder: 'Ex: ARCO TESTE 2026',          hint: 'Nome do arco de fiscalização' },
    { name: 'arco_localizacao',  label: 'Arco — Localização',          type: 'text', required: false, placeholder: 'Ex: AV. PAULISTA, KM 10',       hint: 'Endereço ou referência do arco' },
    { name: 'motivo_codigo',     label: 'Motivo Descarte — Código',    type: 'text', required: true,  placeholder: 'Ex: MOT-TEST-001',             hint: 'Código único do motivo' },
    { name: 'motivo_descricao',  label: 'Motivo Descarte — Descrição', type: 'text', required: true,  placeholder: 'Ex: Imagem ilegível (teste)',   hint: 'Descrição do motivo de descarte' },
  ],
};

/**
 * Executa o ciclo de cadastros administrativos no AxHub
 * @param {Object} data - Dados do formulário
 * @param {Function} onProgress - Callback de progresso: ({ step, total, label, status, message, screenshot })
 */
export async function executeAdminCycle(data, onProgress = () => {}) {
  const results = {
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    status: 'running',
    steps: [],
    errors: [],
    createdIds: {},
  };

  const totalSteps = 4;
  let stepNum = 0;

  const report = async (label, status, message, screenshot = null) => {
    stepNum++;
    const step = { step: stepNum, label, status, message, screenshot, time: new Date().toISOString() };
    results.steps.push(step);
    onProgress({ step: stepNum, total: totalSteps, label, status, message, screenshot });
    const icon = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';
    console.log(`[${stepNum}/${totalSteps}] ${icon} ${label}: ${message}`);
    return step;
  };

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1366, height: 768 },
    args: ['--start-maximized', '--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const captureScreenshot = async () => {
    try {
      const buf = await page.screenshot({ encoding: 'base64', clip: { x: 0, y: 0, width: 1366, height: 600 } });
      return `data:image/png;base64,${buf}`;
    } catch { return null; }
  };

  const fillInput = async (selector, value) => {
    await page.waitForSelector(selector, { timeout: 8000 });
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.press('Delete');
    await page.type(selector, String(value), { delay: 30 });
  };

  const clickSave = async () => {
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent.trim() === 'Salvar' ||
        b.getAttribute('title') === 'Salvar'
      );
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!clicked) throw new Error('Botão Salvar não encontrado');
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
      page.waitForSelector('.k-notification, .alert, .swal2-popup, .toast', { timeout: 5000 }).catch(() => {}),
      new Promise(r => setTimeout(r, 3000)),
    ]);
  };

  /**
   * Verifica se um item já existe na listagem buscando pelo texto
   */
  const existeNaLista = async (listUrl, texto) => {
    await page.goto(listUrl, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    return page.evaluate((t) => {
      const cells = Array.from(document.querySelectorAll('td, .k-grid-content td'));
      return cells.some(c => c.textContent.trim().toLowerCase().includes(t.toLowerCase()));
    }, texto);
  };

  try {
    // ── PASSO 1: Login ──────────────────────────────────────────────
    await report('Login', 'running', 'Autenticando no AxHub...');
    try {
      await page.goto(LOGIN_URL, { waitUntil: 'networkidle0', timeout: 30000 });
      await fillInput(SELECTORS.login.usuario, process.env.AXHUB_LOGIN_ADMIN || 'Admin');
      await fillInput(SELECTORS.login.senha, process.env.AXHUB_SENHA_ADMIN || 'labor5383');
      await page.click(SELECTORS.login.btn);
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      const ss = await captureScreenshot();
      await report('Login', 'success', 'Login realizado com sucesso', ss);
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Login', 'error', `Falha no login: ${err.message}`, ss);
      throw err;
    }

    // ── PASSO 2: Arco ───────────────────────────────────────────────
    await report('Arco', 'running', `Cadastrando arco "${data.arco_nome}"...`);
    try {
      // Verifica se já existe
      const jaExiste = await existeNaLista(SELECTORS.arco.listaUrl, data.arco_nome);
      if (jaExiste) {
        const ss = await captureScreenshot();
        await report('Arco', 'success', `Arco "${data.arco_nome}" já existe — pulando criação`, ss);
        results.createdIds.arco = 'existing';
      } else {
        await page.goto(SELECTORS.arco.url, { waitUntil: 'networkidle0' });
        const urlAtual = page.url();
        if (urlAtual.includes('nao-autorizado') || urlAtual.includes('Login')) {
          const ss = await captureScreenshot();
          await report('Arco', 'error', 'Arco — sem permissão ou módulo não disponível neste ambiente', ss);
          results.errors.push({ step: 'Arco', error: 'nao-autorizado' });
        } else {
          await fillInput(SELECTORS.arco.nome, data.arco_nome);
          if (data.arco_localizacao) {
            await fillInput(SELECTORS.arco.localizacao, data.arco_localizacao).catch(() => {});
          }
          await clickSave();
          const ss = await captureScreenshot();
          results.createdIds.arco = 'created';
          await report('Arco', 'success', `Arco "${data.arco_nome}" cadastrado com sucesso`, ss);
        }
      }
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Arco', 'error', `Erro ao cadastrar arco: ${err.message}`, ss);
      results.errors.push({ step: 'Arco', error: err.message });
    }

    // ── PASSO 3: Motivo de Descarte ─────────────────────────────────
    await report('Motivo de Descarte', 'running', `Cadastrando motivo "${data.motivo_codigo}"...`);
    try {
      const jaExiste = await existeNaLista(SELECTORS.motivoDescarte.listaUrl, data.motivo_codigo);
      if (jaExiste) {
        const ss = await captureScreenshot();
        await report('Motivo de Descarte', 'success', `Motivo "${data.motivo_codigo}" já existe — pulando criação`, ss);
        results.createdIds.motivoDescarte = 'existing';
      } else {
        await page.goto(SELECTORS.motivoDescarte.url, { waitUntil: 'networkidle0' });
        const urlAtual = page.url();
        if (urlAtual.includes('nao-autorizado') || urlAtual.includes('Login')) {
          const ss = await captureScreenshot();
          await report('Motivo de Descarte', 'error', 'Motivo de Descarte — sem permissão ou módulo não disponível neste ambiente', ss);
          results.errors.push({ step: 'Motivo de Descarte', error: 'nao-autorizado' });
        } else {
          await fillInput(SELECTORS.motivoDescarte.codigo, data.motivo_codigo);
          await fillInput(SELECTORS.motivoDescarte.descricao, data.motivo_descricao);
          await clickSave();
          const ss = await captureScreenshot();
          results.createdIds.motivoDescarte = 'created';
          await report('Motivo de Descarte', 'success', `Motivo "${data.motivo_codigo}" cadastrado com sucesso`, ss);
        }
      }
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Motivo de Descarte', 'error', `Erro ao cadastrar motivo: ${err.message}`, ss);
      results.errors.push({ step: 'Motivo de Descarte', error: err.message });
    }

    // ── PASSO 4: Verificação Final ──────────────────────────────────
    await report('Verificação Final', 'running', 'Confirmando cadastros na listagem...');
    try {
      const arcoOk = await existeNaLista(SELECTORS.arco.listaUrl, data.arco_nome);
      const motivoOk = await existeNaLista(SELECTORS.motivoDescarte.listaUrl, data.motivo_codigo);
      const ss = await captureScreenshot();
      if (arcoOk && motivoOk) {
        await report('Verificação Final', 'success', 'Arco e Motivo de Descarte confirmados na listagem', ss);
      } else {
        const faltando = [!arcoOk && 'Arco', !motivoOk && 'Motivo'].filter(Boolean).join(', ');
        await report('Verificação Final', 'warning', `Não encontrado na listagem: ${faltando}`, ss);
      }
    } catch (err) {
      await report('Verificação Final', 'warning', `Verificação inconclusiva: ${err.message}`);
    }

    results.status = results.errors.length === 0 ? 'success' : 'partial';
  } catch (err) {
    results.status = 'error';
    results.errors.push({ step: 'geral', error: err.message });
    console.error('❌ Ciclo Admin — erro fatal:', err);
  } finally {
    results.endTime = new Date().toISOString();
    results.duration = Math.round((new Date(results.endTime) - new Date(results.startTime)) / 1000);
    await browser.close();
  }

  return results;
}



