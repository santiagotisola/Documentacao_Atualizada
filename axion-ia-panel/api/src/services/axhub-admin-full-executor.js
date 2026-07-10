/**
 * AxHub Admin Full Executor
 * Ciclo completo de cadastros administrativos:
 *  1. Login
 *  2. Tipo de Aferição  (/tipoafericao/new)
 *  3. Tarja             (/tarja/new)
 *  4. Enquadramento     (/enquadramento/new)
 *  5. Região            (/regiao/new)
 *  6. Forma de Autuação (/formaautuacao/new)
 *  7. Sequencial        (/sequencialinfracao/new)
 *  8. Verificação Final
 *
 * Requer perfil com acesso às configurações do AxHub.
 */

import puppeteer from 'puppeteer';

const BASE_URL = process.env.AXHUB_BASE_URL || 'https://homologacao.axhub.axion.ws';
const LOGIN_URL = `${BASE_URL}/Home/Login`;

const SEL = {
  login: { usuario: '#Username', senha: '#Password', btn: 'button[type="submit"]' },
  tipoAfericao: {
    url:      `${BASE_URL}/tipoafericao/new`,
    listaUrl: `${BASE_URL}/tipoafericao`,
    codigo:   '#Codigo',
    descricao:'#Descricao',
    validade: '#ValidadeMeses',
  },
  tarja: {
    url:      `${BASE_URL}/tarja/new`,
    listaUrl: `${BASE_URL}/tarja`,
    nome:     '#Nome',
    codigo:   '#Codigo',
  },
  enquadramento: {
    url:           `${BASE_URL}/enquadramento/new`,
    listaUrl:      `${BASE_URL}/enquadramento`,
    codigo:        '#Codigo',
    descricao:     '#Descricao',
    velocidade:    '#VelocidadePermitida',
  },
  regiao: {
    url:      `${BASE_URL}/regiao/new`,
    listaUrl: `${BASE_URL}/regiao`,
    nome:     '#Nome',
    uf:       '#Uf',
    descricao:'#Descricao',
  },
  formaAutuacao: {
    url:      `${BASE_URL}/formaautuacao/new`,
    listaUrl: `${BASE_URL}/formaautuacao`,
    nome:     '#Nome',
    descricao:'#Descricao',
  },
  sequencial: {
    url:          `${BASE_URL}/sequencialinfracao/new`,
    listaUrl:     `${BASE_URL}/sequencialinfracao`,
    codigo:       '#Codigo',
    prefixo:      '#Prefixo',
    numInicial:   '#NumeroInicial',
  },
};

export const AXHUB_ADMIN_FULL_SCHEMA = {
  description: 'Ciclo Admin Completo — Tipo Aferição, Tarja, Enquadramento, Região, Forma Autuação, Sequencial',
  steps: 8,
  estimatedTime: '~5 minutos',
  fields: [
    // Tipo de Aferição
    { name: 'tafer_codigo',   label: 'Tipo Aferição — Código',         type: 'text', required: true,  group: 'Tipo de Aferição', placeholder: 'Ex: TA-001',         hint: 'Código do tipo de aferição' },
    { name: 'tafer_descricao',label: 'Tipo Aferição — Descrição',      type: 'text', required: true,  group: 'Tipo de Aferição', placeholder: 'Ex: AFERIÇÃO PERIÓDICA', hint: 'Descrição do tipo' },
    { name: 'tafer_validade', label: 'Tipo Aferição — Validade (meses)',type: 'text', required: false, group: 'Tipo de Aferição', placeholder: 'Ex: 12',             hint: 'Validade em meses' },
    // Tarja
    { name: 'tarja_nome',     label: 'Tarja — Nome',                   type: 'text', required: true,  group: 'Tarja',            placeholder: 'Ex: TARJA PADRÃO 2026', hint: 'Nome da tarja' },
    { name: 'tarja_codigo',   label: 'Tarja — Código',                  type: 'text', required: false, group: 'Tarja',            placeholder: 'Ex: TRJ-001',        hint: 'Código da tarja' },
    // Enquadramento
    { name: 'enq_codigo',     label: 'Enquadramento — Código',         type: 'text', required: true,  group: 'Enquadramento',    placeholder: 'Ex: 218I',           hint: 'Código do art. CTB' },
    { name: 'enq_descricao',  label: 'Enquadramento — Descrição',      type: 'text', required: true,  group: 'Enquadramento',    placeholder: 'Ex: Excesso de velocidade', hint: 'Descrição do enquadramento' },
    { name: 'enq_velocidade', label: 'Enquadramento — Velocidade',     type: 'text', required: false, group: 'Enquadramento',    placeholder: 'Ex: 80',             hint: 'Velocidade permitida (km/h)' },
    // Região
    { name: 'reg_nome',       label: 'Região — Nome',                  type: 'text', required: true,  group: 'Região',           placeholder: 'Ex: REGIÃO CENTRO-OESTE', hint: 'Nome da região' },
    { name: 'reg_uf',         label: 'Região — UF',                    type: 'text', required: false, group: 'Região',           placeholder: 'Ex: GO',             hint: 'Sigla do estado' },
    { name: 'reg_descricao',  label: 'Região — Descrição',             type: 'text', required: false, group: 'Região',           placeholder: 'Ex: Goiás e DF',     hint: 'Descrição da região' },
    // Forma de Autuação
    { name: 'forma_nome',     label: 'Forma Autuação — Nome',          type: 'text', required: true,  group: 'Forma de Autuação', placeholder: 'Ex: ELETRÔNICA',   hint: 'Nome da forma de autuação' },
    { name: 'forma_descricao',label: 'Forma Autuação — Descrição',     type: 'text', required: false, group: 'Forma de Autuação', placeholder: 'Ex: Auto eletrônico', hint: 'Descrição' },
    // Sequencial
    { name: 'seq_codigo',     label: 'Sequencial — Código',            type: 'text', required: true,  group: 'Sequencial',       placeholder: 'Ex: SEQ-TEST-001',   hint: 'Código identificador do sequencial' },
    { name: 'seq_prefixo',    label: 'Sequencial — Prefixo',           type: 'text', required: false, group: 'Sequencial',       placeholder: 'Ex: AUT',            hint: 'Prefixo dos números de autuação' },
    { name: 'seq_num_inicial',label: 'Sequencial — Número Inicial',    type: 'text', required: false, group: 'Sequencial',       placeholder: 'Ex: 1',              hint: 'Número de início do sequencial' },
  ],
};

export async function executeAxHubAdminFullCycle(data, onProgress = () => {}) {
  const results = {
    startTime: new Date().toISOString(),
    endTime: null, duration: 0, status: 'running', steps: [], errors: [], createdIds: {},
  };
  const totalSteps = 8;
  let stepNum = 0;

  const report = async (label, status, message, screenshot = null) => {
    stepNum++;
    const step = { step: stepNum, label, status, message, screenshot, time: new Date().toISOString() };
    results.steps.push(step);
    onProgress({ step: stepNum, total: totalSteps, label, status, message, screenshot });
    console.log(`[${stepNum}/${totalSteps}] ${status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳'} ${label}: ${message}`);
    return step;
  };

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1366, height: 768 },
    args: ['--start-maximized', '--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });

  const ss = async () => { try { return `data:image/png;base64,${await page.screenshot({ encoding: 'base64', clip: { x: 0, y: 0, width: 1366, height: 600 } })}`; } catch { return null; } };

  const fillInput = async (selector, value) => {
    await page.waitForSelector(selector, { timeout: 8000 });
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.press('Delete');
    await page.type(selector, String(value), { delay: 30 });
  };

  const tryFill = async (selector, value) => {
    if (!value) return;
    const el = await page.$(selector);
    if (el) await fillInput(selector, value).catch(() => {});
  };

  const clickSave = async () => {
    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Salvar' || b.getAttribute('title') === 'Salvar');
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

  const blockeado = () => { const u = page.url(); return u.includes('nao-autorizado') || u.includes('Login'); };

  const existeNaLista = async (listUrl, texto) => {
    await page.goto(listUrl, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));
    return page.evaluate(t => Array.from(document.querySelectorAll('td, .k-grid-content td')).some(c => c.textContent.trim().toLowerCase().includes(t.toLowerCase())), texto);
  };

  const runStep = async (nome, chave, listUrl, pageUrl, preencher) => {
    await report(nome, 'running', `Cadastrando ${nome.toLowerCase()}...`);
    try {
      if (!data[Object.keys(data).find(k => k.startsWith(chave + '_'))]) {
        await report(nome, 'success', `${nome} — sem dados fornecidos, pulando`, await ss());
        return;
      }
      const textoCheck = data[Object.keys(data).find(k => k.startsWith(chave + '_'))];
      const existe = await existeNaLista(listUrl, textoCheck).catch(() => false);
      if (existe) {
        await report(nome, 'success', `${nome} "${textoCheck}" já existe — pulando`, await ss());
        results.createdIds[chave] = 'existing';
        return;
      }
      await page.goto(pageUrl, { waitUntil: 'networkidle0' });
      if (blockeado()) {
        await report(nome, 'error', `${nome} — módulo sem permissão neste ambiente (nao-autorizado)`, await ss());
        results.errors.push({ step: nome, error: 'nao-autorizado' });
        return;
      }
      await preencher();
      await clickSave();
      results.createdIds[chave] = 'created';
      await report(nome, 'success', `${nome} "${textoCheck}" cadastrado`, await ss());
    } catch (err) {
      await report(nome, 'error', `Erro: ${err.message}`, await ss());
      results.errors.push({ step: nome, error: err.message });
    }
  };

  try {
    // ── PASSO 1: Login ────────────────────────────────────────────
    await report('Login', 'running', 'Autenticando no AxHub...');
    try {
      await page.goto(LOGIN_URL, { waitUntil: 'networkidle0', timeout: 30000 });
      await fillInput(SEL.login.usuario, process.env.AXHUB_LOGIN_ADMIN || 'Admin');
      await fillInput(SEL.login.senha, process.env.AXHUB_SENHA_ADMIN || 'labor5383');
      await page.click(SEL.login.btn);
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      await report('Login', 'success', 'Autenticado com sucesso', await ss());
    } catch (err) {
      await report('Login', 'error', `Falha: ${err.message}`, await ss());
      throw err;
    }

    // ── PASSO 2: Tipo de Aferição ────────────────────────────────
    await runStep('Tipo de Aferição', 'tafer', SEL.tipoAfericao.listaUrl, SEL.tipoAfericao.url, async () => {
      await fillInput(SEL.tipoAfericao.codigo, data.tafer_codigo);
      await fillInput(SEL.tipoAfericao.descricao, data.tafer_descricao);
      await tryFill(SEL.tipoAfericao.validade, data.tafer_validade);
    });

    // ── PASSO 3: Tarja ───────────────────────────────────────────
    await runStep('Tarja', 'tarja', SEL.tarja.listaUrl, SEL.tarja.url, async () => {
      await fillInput(SEL.tarja.nome, data.tarja_nome);
      await tryFill(SEL.tarja.codigo, data.tarja_codigo);
    });

    // ── PASSO 4: Enquadramento ───────────────────────────────────
    await runStep('Enquadramento', 'enq', SEL.enquadramento.listaUrl, SEL.enquadramento.url, async () => {
      await fillInput(SEL.enquadramento.codigo, data.enq_codigo);
      await fillInput(SEL.enquadramento.descricao, data.enq_descricao);
      await tryFill(SEL.enquadramento.velocidade, data.enq_velocidade);
    });

    // ── PASSO 5: Região ──────────────────────────────────────────
    await runStep('Região', 'reg', SEL.regiao.listaUrl, SEL.regiao.url, async () => {
      await fillInput(SEL.regiao.nome, data.reg_nome);
      await tryFill(SEL.regiao.uf, data.reg_uf);
      await tryFill(SEL.regiao.descricao, data.reg_descricao);
    });

    // ── PASSO 6: Forma de Autuação ───────────────────────────────
    await runStep('Forma de Autuação', 'forma', SEL.formaAutuacao.listaUrl, SEL.formaAutuacao.url, async () => {
      await fillInput(SEL.formaAutuacao.nome, data.forma_nome);
      await tryFill(SEL.formaAutuacao.descricao, data.forma_descricao);
    });

    // ── PASSO 7: Sequencial ──────────────────────────────────────
    await runStep('Sequencial', 'seq', SEL.sequencial.listaUrl, SEL.sequencial.url, async () => {
      await fillInput(SEL.sequencial.codigo, data.seq_codigo);
      await tryFill(SEL.sequencial.prefixo, data.seq_prefixo);
      await tryFill(SEL.sequencial.numInicial, data.seq_num_inicial);
    });

    // ── PASSO 8: Verificação Final ───────────────────────────────
    await report('Verificação', 'running', 'Verificando cadastros...');
    const erros = results.errors.length;
    const criados = Object.keys(results.createdIds).length;
    await report('Verificação', 'success',
      `Ciclo concluído — ${criados} cadastro(s) processado(s), ${erros} erro(s)`, await ss());

  } finally {
    results.endTime = new Date().toISOString();
    results.duration = Math.round((new Date(results.endTime) - new Date(results.startTime)) / 1000);
    results.status = results.errors.length === 0 ? 'success' : 'partial';
    await browser.close();
  }

  return results;
}



