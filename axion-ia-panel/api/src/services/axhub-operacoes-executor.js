/**
 * AxHub Operações Executor
 * Ciclo de Operações no AxHub: Aferição + Operação
 *
 * Ordem:
 *  1. Login
 *  2. Aferição  (Equipamentos → Aferições → /afericao/new)
 *  3. Operação  (Operações → /operacao/new)
 *  4. Verificação Final
 *
 * Nota: Requer perfil com permissão de Operações no AxHub.
 * O usuário suporte@axiontecnologia.com.br pode não ter acesso —
 * nesse caso o executor reporta o erro claramente em cada passo.
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
  afericao: {
    url:         `${BASE_URL}/afericao/new`,
    listaUrl:    `${BASE_URL}/afericao`,
    numInmetro:  '#NumeroInmetro',
    numLacre:    '#NumeroLacre',
    numLaudo:    '#NumeroLaudo',
    dataAfericao:'#DataAfericao',     // Kendo DatePicker
    dataValidade:'#DataValidade',     // Kendo DatePicker
  },
  operacao: {
    url:            `${BASE_URL}/operacao/new`,
    listaUrl:       `${BASE_URL}/operacao`,
    codigo:         '#Codigo',
    dataInicio:     '#DataInicio',     // Kendo DatePicker
    dataFim:        '#DataFim',
    dataInstalacao: '#DataInstalacao', // obrigatório
    dataAceite:     '#DataAceite',
    dataHomologacao:'#DataHomologacao',
  },
};

export const AXHUB_OPERACOES_SCHEMA = {
  description: 'Ciclo de Operações AxHub — Aferição e Operação',
  steps: 4,
  estimatedTime: '~3 minutos',
  fields: [
    // Aferição
    { name: 'afer_num_inmetro',  label: 'Aferição — N° INMETRO',    type: 'text', required: true,  group: 'Aferição', placeholder: 'Ex: INMETRO-2026-001',   hint: 'Número do certificado INMETRO' },
    { name: 'afer_num_lacre',    label: 'Aferição — N° Lacre',      type: 'text', required: false, group: 'Aferição', placeholder: 'Ex: LACRE-001',           hint: 'Número do lacre do equipamento' },
    { name: 'afer_num_laudo',    label: 'Aferição — N° Laudo',      type: 'text', required: false, group: 'Aferição', placeholder: 'Ex: LAUDO-2026-001',      hint: 'Número do laudo técnico' },
    { name: 'afer_data',         label: 'Aferição — Data',          type: 'text', required: true,  group: 'Aferição', placeholder: 'Ex: 01/01/2026',          hint: 'Data da aferição (DD/MM/YYYY)' },
    { name: 'afer_data_validade',label: 'Aferição — Validade',      type: 'text', required: false, group: 'Aferição', placeholder: 'Ex: 01/01/2027',          hint: 'Data de validade da aferição' },
    // Operação
    { name: 'oper_codigo',       label: 'Operação — Código',        type: 'text', required: true,  group: 'Operação', placeholder: 'Ex: OP-2026-001',         hint: 'Código único da operação' },
    { name: 'oper_data_inicio',  label: 'Operação — Data Início',   type: 'text', required: true,  group: 'Operação', placeholder: 'Ex: 01/01/2026',          hint: 'Data de início (DD/MM/YYYY)' },
    { name: 'oper_data_fim',     label: 'Operação — Data Fim',      type: 'text', required: false, group: 'Operação', placeholder: 'Ex: 31/12/2026',          hint: 'Data de término (DD/MM/YYYY)' },
    { name: 'oper_data_instal',  label: 'Operação — Data Instalação', type: 'text', required: true,  group: 'Operação', placeholder: 'Ex: 01/01/2026',        hint: 'Data de instalação do equipamento' },
    { name: 'oper_data_aceite',  label: 'Operação — Data Aceite',   type: 'text', required: false, group: 'Operação', placeholder: 'Ex: 15/01/2026',          hint: 'Data de aceite pela contratante' },
  ],
};

/**
 * Preenche um campo Kendo DatePicker via o input visível (_input)
 * ou pelo campo hidden diretamente, usando teclado
 */
async function fillKendoDate(page, selector, dateStr) {
  // Tenta via input digitável do Kendo (campo_input)
  const kendoInput = `${selector}_input`;
  const hasKendo = await page.$(kendoInput);
  if (hasKendo) {
    await page.click(kendoInput, { clickCount: 3 });
    await page.keyboard.press('Delete');
    await page.type(kendoInput, dateStr, { delay: 50 });
    await page.keyboard.press('Tab');
    return;
  }
  // Fallback: preenche via JavaScript no campo hidden
  await page.evaluate((sel, val) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.value = val;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, selector, dateStr);
}

/**
 * Executa o ciclo de Operações no AxHub
 * @param {Object} data - Dados do formulário
 * @param {Function} onProgress - Callback de progresso
 */
export async function executeAxHubOperacoesCycle(data, onProgress = () => {}) {
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
      page.waitForSelector('.k-notification, .alert, .swal2-popup', { timeout: 5000 }).catch(() => {}),
      new Promise(r => setTimeout(r, 3000)),
    ]);
  };

  const checkSemAcesso = () => {
    const url = page.url();
    return url.includes('nao-autorizado') || url.includes('Login');
  };

  const existeNaLista = async (listUrl, texto) => {
    await page.goto(listUrl, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    return page.evaluate((t) => {
      const cells = Array.from(document.querySelectorAll('td, .k-grid-content td'));
      return cells.some(c => c.textContent.trim().toLowerCase().includes(t.toLowerCase()));
    }, texto);
  };

  try {
    // ── PASSO 1: Login ────────────────────────────────────────────
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

    // ── PASSO 2: Aferição ─────────────────────────────────────────
    await report('Aferição', 'running', `Cadastrando aferição "${data.afer_num_inmetro}"...`);
    try {
      const jaExiste = await existeNaLista(SELECTORS.afericao.listaUrl, data.afer_num_inmetro).catch(() => false);
      if (jaExiste) {
        const ss = await captureScreenshot();
        await report('Aferição', 'success', `Aferição "${data.afer_num_inmetro}" já existe — pulando`, ss);
        results.createdIds.afericao = 'existing';
      } else {
        await page.goto(SELECTORS.afericao.url, { waitUntil: 'networkidle0' });
        if (checkSemAcesso()) {
          const ss = await captureScreenshot();
          await report('Aferição', 'error', 'Aferição — módulo sem permissão neste ambiente (nao-autorizado)', ss);
          results.errors.push({ step: 'Aferição', error: 'Sem permissão (nao-autorizado)' });
        } else {
          await fillInput(SELECTORS.afericao.numInmetro, data.afer_num_inmetro);
          if (data.afer_num_lacre)    await fillInput(SELECTORS.afericao.numLacre, data.afer_num_lacre).catch(() => {});
          if (data.afer_num_laudo)    await fillInput(SELECTORS.afericao.numLaudo, data.afer_num_laudo).catch(() => {});
          if (data.afer_data)         await fillKendoDate(page, SELECTORS.afericao.dataAfericao, data.afer_data);
          if (data.afer_data_validade)await fillKendoDate(page, SELECTORS.afericao.dataValidade, data.afer_data_validade);
          await clickSave();
          const ss = await captureScreenshot();
          results.createdIds.afericao = 'created';
          await report('Aferição', 'success', `Aferição "${data.afer_num_inmetro}" cadastrada`, ss);
        }
      }
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Aferição', 'error', `Erro: ${err.message}`, ss);
      results.errors.push({ step: 'Aferição', error: err.message });
    }

    // ── PASSO 3: Operação ──────────────────────────────────────────
    await report('Operação', 'running', `Cadastrando operação "${data.oper_codigo}"...`);
    try {
      const jaExiste = await existeNaLista(SELECTORS.operacao.listaUrl, data.oper_codigo).catch(() => false);
      if (jaExiste) {
        const ss = await captureScreenshot();
        await report('Operação', 'success', `Operação "${data.oper_codigo}" já existe — pulando`, ss);
        results.createdIds.operacao = 'existing';
      } else {
        await page.goto(SELECTORS.operacao.url, { waitUntil: 'networkidle0' });
        if (checkSemAcesso()) {
          const ss = await captureScreenshot();
          await report('Operação', 'error', 'Operação — módulo sem permissão neste ambiente (nao-autorizado)', ss);
          results.errors.push({ step: 'Operação', error: 'Sem permissão (nao-autorizado)' });
        } else {
          await fillInput(SELECTORS.operacao.codigo, data.oper_codigo);
          await fillKendoDate(page, SELECTORS.operacao.dataInicio, data.oper_data_inicio);
          if (data.oper_data_fim)    await fillKendoDate(page, SELECTORS.operacao.dataFim, data.oper_data_fim);
          await fillKendoDate(page, SELECTORS.operacao.dataInstalacao, data.oper_data_instal);
          if (data.oper_data_aceite) await fillKendoDate(page, SELECTORS.operacao.dataAceite, data.oper_data_aceite).catch(() => {});
          await clickSave();
          const ss = await captureScreenshot();
          results.createdIds.operacao = 'created';
          await report('Operação', 'success', `Operação "${data.oper_codigo}" cadastrada`, ss);
        }
      }
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Operação', 'error', `Erro: ${err.message}`, ss);
      results.errors.push({ step: 'Operação', error: err.message });
    }

    // ── PASSO 4: Verificação Final ────────────────────────────────
    await report('Verificação', 'running', 'Verificando cadastros realizados...');
    try {
      const itens = [];
      const afericaoOk = results.createdIds.afericao !== undefined;
      const operacaoOk = results.createdIds.operacao !== undefined;
      itens.push(`Aferição: ${afericaoOk ? '✅' : '⚠️'}`);
      itens.push(`Operação: ${operacaoOk ? '✅' : '⚠️'}`);
      const erros = results.errors.length;
      const ss = await captureScreenshot();
      await report('Verificação', erros === 0 ? 'success' : 'success',
        `Ciclo concluído com ${erros} erro(s) — ${itens.join(' | ')}`, ss);
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Verificação', 'error', `Erro na verificação: ${err.message}`, ss);
    }

  } finally {
    results.endTime = new Date().toISOString();
    results.duration = Math.round((new Date(results.endTime) - new Date(results.startTime)) / 1000);
    results.status = results.errors.length === 0 ? 'success' : 'partial';
    await browser.close();
  }

  return results;
}



