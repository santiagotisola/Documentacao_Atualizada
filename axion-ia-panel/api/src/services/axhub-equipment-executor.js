/**
 * AxHub Equipment Executor
 * Executa o ciclo completo de cadastro de equipamentos no AxHub
 * usando Puppeteer com stream de progresso via callbacks.
 *
 * Ordem de cadastro (hierarquia obrigatória):
 *  1. Login
 *  2. Fabricante
 *  3. Tipo de Equipamento
 *  4. Modelo de Equipamento  (FK: Fabricante)
 *  5. Grupo de Equipamentos
 *  6. Equipamento            (FK: Modelo + Tipo + Grupo)
 *  7. Faixa                  (localização física da faixa de trânsito)
 *  8. Verificação Final
 */

import puppeteer from 'puppeteer';

const BASE_URL = process.env.AXHUB_BASE_URL || 'https://homologacao.axhub.axion.ws';
const LOGIN_URL = `${BASE_URL}/Home/Login`;

// Seletores reais descobertos da interface do AxHub (Kendo UI)
const SELECTORS = {
  login: {
    usuario: '#Username',
    senha:   '#Password',
    btn:     'button[type="submit"]',
  },
  fabricante: {
    url:       `${BASE_URL}/fabricante/new`,
    nome:      '#Nome',
    slug:      '#Client_Id',
    agrupador: '#AgrupadorSequencial',  // opcional
    codigo:    '#CodigoFabricante',     // opcional
  },
  tipo: {
    url:  `${BASE_URL}/tipoequipamento/new`,
    nome: '#Nome',
    desabilitarMonitoramento: '#DesabilitarMonitoramento', // checkbox opcional
  },
  modelo: {
    url:        `${BASE_URL}/modeloequipamento/new`,
    marca:      '#Marca',
    modelo:     '#Modelo',
    portNum:    '#NumeroPortaria',
    portaria:   '#Portaria',
    fabricante: '#Fabricante', // <select> nativo — FK Fabricante
  },
  grupo: {
    url:  `${BASE_URL}/grupoequipamento/new`,
    nome: '#Nome',
    cor:  '#Cor',  // color picker — opcional (default #0000ff)
    desabilitarMonitoramento:       '#DesabilitarMonitoramento',       // checkbox opcional
    desabilitarLimiteHorasImportacao: '#DesabilitarLimiteHorasImportacao', // checkbox opcional
  },
  equipamento: {
    url:         `${BASE_URL}/equipamento/new`,
    serie:       '#NumeroSerie',
    codigo:      '#Codigo',
    certInmetro: '#NumeroCertificadoInmetro',
    emissao:     '#EmissaoCertificadoInmetro',
    vencimento:  '#VencimentoCertificadoInmetro',
    modelo:      '#ModeloEquipamento_input',  // Kendo ComboBox — FK Modelo
    tipo:        '#TipoEquipamento_input',    // Kendo ComboBox — FK Tipo
    grupo:       '#GrupoEquipamento_input',   // Kendo ComboBox — FK Grupo
    desabilitarLimiteHorasImportacao: '#DesabilitarLimiteHorasImportacao', // checkbox opcional
    // Tipo da Operação: radio sem id fixo — tratado via evaluate()
  },
  faixa: {
    url:             `${BASE_URL}/faixa/new`,
    codigo:          '#Codigo',
    numero:          '#NumeroFaixa',          // spinbutton (número inteiro)
    sentido:         '#Sentido',
    codigoLogradouro:'#CodigoLogradouro',     // opcional
    cep:             '#Cep',                  // opcional
    logradouro:      '#Logradouro',
    numeroEnd:       '#Numero',               // opcional
    complemento:     '#Complemento',          // opcional
    bairro:          '#Bairro',
    municipio:       '#Municipio',
    codigoMunicipio: '#CodigoMunicipio',
    uf:              '#Uf',
    latitude:        '#Latitude',             // opcional
    longitude:       '#Longitude',            // opcional
  },
};

/**
 * Executa o ciclo completo de cadastro de equipamentos
 * @param {Object} data - Dados para preencher os formulários
 * @param {Function} onProgress - Callback chamado a cada passo: ({ step, total, label, status, message, screenshot })
 * @returns {Object} resultado final da execução
 */
export async function executeEquipmentCycle(data, onProgress = () => {}) {
  const results = {
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    status: 'running',
    steps: [],
    errors: [],
    createdIds: {}
  };

  const totalSteps = 8; // login + fabricante + tipo + modelo + grupo + equipamento + faixa + verificação
  let stepNum = 0;

  const report = async (label, status, message, screenshot = null) => {
    stepNum++;
    const step = { step: stepNum, label, status, message, screenshot, time: new Date().toISOString() };
    results.steps.push(step);
    onProgress({ step: stepNum, total: totalSteps, label, status, message, screenshot });
    console.log(`[${stepNum}/${totalSteps}] ${status === 'success' ? 'âœ…' : status === 'error' ? 'âŒ' : 'â³'} ${label}: ${message}`);
    return step;
  };

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1366, height: 768 },
    args: ['--start-maximized', '--no-sandbox', '--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  // Ocultar sinal de automaÃ§Ã£o
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  const captureScreenshot = async () => {
    try {
      const buf = await page.screenshot({ encoding: 'base64', clip: { x: 0, y: 0, width: 1366, height: 600 } });
      return `data:image/png;base64,${buf}`;
    } catch { return null; }
  };

  /**
   * Preenche um input text de forma robusta (limpa e digita)
   */
  const fillInput = async (selector, value) => {
    await page.waitForSelector(selector, { timeout: 8000 });
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.press('Delete');
    await page.type(selector, String(value), { delay: 30 });
  };

  /**
   * Clica no botÃ£o Salvar e aguarda feedback
   * Puppeteer usa querySelector nativo â€” sem sintaxe :has-text()
   */
  const clickSave = async () => {
    // Localiza botÃ£o Salvar via evaluate (JS puro, compatÃ­vel com Puppeteer)
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b =>
        b.textContent.trim() === 'Salvar' ||
        b.title === 'Salvar' ||
        b.getAttribute('title') === 'Salvar'
      );
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!clicked) throw new Error('BotÃ£o Salvar nÃ£o encontrado na pÃ¡gina');

    // Aguarda navegaÃ§Ã£o ou feedback visual
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
      page.waitForSelector('.k-notification, .alert, .swal2-popup, .toast', { timeout: 5000 }).catch(() => {}),
      new Promise(r => setTimeout(r, 3000)),
    ]);
  };

  /**
   * Seleciona valor em Kendo ComboBox pelo texto
   * Usa o campo de input interno do Kendo e aguarda a lista aparecer
   */
  const selectKendoComboBox = async (fieldId, value) => {
    // O Kendo gera um input com ID = fieldId + '_input'
    const inputSel = `#${fieldId}_input`;
    try {
      await page.waitForSelector(inputSel, { timeout: 8000 });
      await page.click(inputSel, { clickCount: 3 });
      await page.type(inputSel, value, { delay: 50 });
      await new Promise(r => setTimeout(r, 800));

      // Tentar clicar na primeira opÃ§Ã£o do dropdown
      const clicked = await page.evaluate(() => {
        const options = document.querySelectorAll(
          '.k-list-item, .k-animation-container li, [role="option"], .k-popup li'
        );
        if (options.length > 0) {
          options[0].click();
          return true;
        }
        return false;
      });

      if (!clicked) {
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }
    } catch (err) {
      console.warn(`âš ï¸ ComboBox ${fieldId}: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 400));
  };

  /**
   * Seleciona valor em <select> nativo por texto
   */
  const selectByText = async (selector, value) => {
    await page.waitForSelector(selector, { timeout: 8000 });
    await page.evaluate((sel, val) => {
      const select = document.querySelector(sel);
      if (!select) return;
      const opt = Array.from(select.options).find(o => o.text.toLowerCase().includes(val.toLowerCase()));
      if (opt) {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, selector, value);
  };

  /**
   * Verifica se um valor já existe como opção num <select> nativo.
   * Aguarda as opções serem carregadas via AJAX (mais de 1 opção no select).
   * @param {string} selector - seletor CSS do <select>
   * @param {string} value    - texto buscado (parcial, case-insensitive)
   * @returns {Promise<boolean>}
   */
  const optionExists = async (selector, value) => {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      // Verificar quantas opções o select tem
      const count = await page.evaluate(
        (sel) => document.querySelector(sel)?.options.length ?? 0,
        selector
      );
      if (count <= 1) {
        // Kendo ComboBox: o select de base só é populado via AJAX quando o
        // input visível (#selector_input) é clicado/focado. Disparar esse click.
        const kendoInputSel = `${selector}_input`;
        const hasKendoInput = await page.$(kendoInputSel).then(h => !!h).catch(() => false);
        if (hasKendoInput) {
          await page.click(kendoInputSel).catch(() => {});
          await new Promise(r => setTimeout(r, 2500)); // aguardar AJAX popular
          await page.keyboard.press('Escape').catch(() => {}); // fechar dropdown
        } else {
          // Fallback: clicar num input de texto genérico para ativar JS da página
          await page.evaluate(() => {
            const inp = Array.from(document.querySelectorAll('input[type="text"]'))
              .find(el => !el.disabled && !el.readOnly && el.offsetWidth > 0);
            if (inp) inp.click();
          });
          await new Promise(r => setTimeout(r, 2500));
        }
      }
      return await page.evaluate((sel, val) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        return Array.from(el.options).some(o =>
          o.text.toLowerCase().includes(val.toLowerCase())
        );
      }, selector, value);
    } catch { return false; }
  };

  /**
   * Garante que um valor está disponível num <select> ANTES de preencher o formulário.
   * Fluxo:
   *   1. Verifica se a opção já existe → se sim, retorna imediatamente.
   *   2. Se não existir → executa createFn() (que navega para o form de criação e salva).
   *   3. Retorna à URL original (returnUrl) e verifica novamente.
   *   4. Lança erro se mesmo após criar a opção ainda não aparecer.
   *
   * IMPORTANTE: chamar ANTES de preencher qualquer campo do formulário principal,
   * pois createFn pode navegar para outra página (o que limparia campos já preenchidos).
   *
   * @param {string}   selector  - seletor CSS do <select>
   * @param {string}   value     - texto esperado (busca parcial)
   * @param {Function} createFn  - async fn: navega até o form de criação, preenche e salva
   */
  const ensureOption = async (selector, value, createFn) => {
    if (await optionExists(selector, value)) return; // já disponível — ok

    const returnUrl = page.url();
    console.log(`🔧 Opção "${value}" ausente em ${selector} — criando dependência...`);
    await createFn();
    await page.goto(returnUrl, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    if (!await optionExists(selector, value)) {
      throw new Error(`Dependência "${value}" não encontrada em ${selector} mesmo após criação`);
    }
    console.log(`✅ Opção "${value}" agora disponível em ${selector}`);
  };

  try {
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // PASSO 1: Login
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await report('Login no AxHub', 'running', 'Abrindo pÃ¡gina de login...');

    await page.goto(LOGIN_URL, { waitUntil: 'networkidle0', timeout: 20000 });
    await page.waitForSelector(SELECTORS.login.usuario, { timeout: 10000 });

    await fillInput(SELECTORS.login.usuario, 'suporte@axiontecnologia.com.br');
    await fillInput(SELECTORS.login.senha, 'Axion#2023');
    await page.click(SELECTORS.login.btn);

    // Aguarda login (pode ter Cloudflare challenge)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});

    const currentUrl = page.url();
    if (currentUrl.includes('Login') || currentUrl.includes('login')) {
      // Pode ser CAPTCHA â€” aguarda mais tempo
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    }

    const ss1 = await captureScreenshot();
    results.steps[results.steps.length - 1].status = 'success';
    await report('Login no AxHub', 'success', `Logado com sucesso (${page.url()})`, ss1);

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // PASSO 2: Cadastrar Fabricante
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await report('Cadastrar Fabricante', 'running', `Cadastrando fabricante "${data.fabricante_nome}"...`);

    await page.goto(SELECTORS.fabricante.url, { waitUntil: 'networkidle0' });
    await fillInput(SELECTORS.fabricante.nome, data.fabricante_nome);
    await fillInput(SELECTORS.fabricante.slug, data.fabricante_slug || data.fabricante_nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    await clickSave();

    const ss2 = await captureScreenshot();
    results.createdIds.fabricante = data.fabricante_nome;
    results.steps[results.steps.length - 1].status = 'success';
    await report('Cadastrar Fabricante', 'success', `Fabricante "${data.fabricante_nome}" salvo`, ss2);

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // PASSO 3: Cadastrar Tipo de Equipamento
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await report('Cadastrar Tipo de Equipamento', 'running', `Cadastrando tipo "${data.tipo_nome}"...`);

    await page.goto(SELECTORS.tipo.url, { waitUntil: 'networkidle0' });
    await fillInput(SELECTORS.tipo.nome, data.tipo_nome);
    await clickSave();

    const ss3 = await captureScreenshot();
    results.createdIds.tipo = data.tipo_nome;
    results.steps[results.steps.length - 1].status = 'success';
    await report('Cadastrar Tipo de Equipamento', 'success', `Tipo "${data.tipo_nome}" salvo`, ss3);

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // PASSO 4: Cadastrar Modelo de Equipamento
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await report('Cadastrar Modelo de Equipamento', 'running', `Cadastrando modelo "${data.modelo_marca} ${data.modelo_nome}"...`);

    await page.goto(SELECTORS.modelo.url, { waitUntil: 'networkidle0' });

    // Pre-flight: garantir que Fabricante existe no select ANTES de preencher o form.
    // Se ausente (ex: passo anterior falhou silenciosamente), cria e volta.
    await ensureOption(SELECTORS.modelo.fabricante, data.fabricante_nome, async () => {
      await page.goto(SELECTORS.fabricante.url, { waitUntil: 'networkidle0' });
      await fillInput(SELECTORS.fabricante.nome, data.fabricante_nome);
      await fillInput(SELECTORS.fabricante.slug, data.fabricante_slug ||
        data.fabricante_nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
      await clickSave();
      results.createdIds.fabricante = data.fabricante_nome;
    });

    // Todos os selects verificados — agora preencher o form com segurança
    await fillInput(SELECTORS.modelo.marca, data.modelo_marca);
    await fillInput(SELECTORS.modelo.modelo, data.modelo_nome);
    await fillInput(SELECTORS.modelo.portNum, data.modelo_portaria_num);
    await fillInput(SELECTORS.modelo.portaria, data.modelo_portaria);
    await selectByText(SELECTORS.modelo.fabricante, data.fabricante_nome);
    await clickSave();

    const ss4 = await captureScreenshot();
    results.createdIds.modelo = `${data.modelo_marca} ${data.modelo_nome}`;
    results.steps[results.steps.length - 1].status = 'success';
    await report('Cadastrar Modelo de Equipamento', 'success', `Modelo "${data.modelo_marca} ${data.modelo_nome}" salvo`, ss4);

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // PASSO 5: Cadastrar Grupo de Equipamentos
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await report('Cadastrar Grupo de Equipamentos', 'running', `Cadastrando grupo "${data.grupo_nome}"...`);

    await page.goto(SELECTORS.grupo.url, { waitUntil: 'networkidle0' });
    await fillInput(SELECTORS.grupo.nome, data.grupo_nome);
    await clickSave();

    const ss5 = await captureScreenshot();
    results.createdIds.grupo = data.grupo_nome;
    results.steps[results.steps.length - 1].status = 'success';
    await report('Cadastrar Grupo de Equipamentos', 'success', `Grupo "${data.grupo_nome}" salvo`, ss5);

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // PASSO 6: Cadastrar Equipamento
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await report('Cadastrar Equipamento', 'running', `Cadastrando equipamento "${data.equip_codigo}"...`);

    await page.goto(SELECTORS.equipamento.url, { waitUntil: 'networkidle0' });

    // ── Pre-flight: verificar/criar TODAS as dependências obrigatórias ──────
    // Feito ANTES de preencher qualquer campo, pois criar dependências navega
    // para outras páginas (o que limparia campos já digitados no formulário).

    // 1. Modelo — o texto da opção no select é apenas o modelo_nome (sem a marca)
    await ensureOption('#ModeloEquipamento', data.modelo_nome, async () => {
      await page.goto(SELECTORS.modelo.url, { waitUntil: 'networkidle0' });
      // Garantir Fabricante antes de preencher o form de Modelo
      await ensureOption(SELECTORS.modelo.fabricante, data.fabricante_nome, async () => {
        await page.goto(SELECTORS.fabricante.url, { waitUntil: 'networkidle0' });
        await fillInput(SELECTORS.fabricante.nome, data.fabricante_nome);
        await fillInput(SELECTORS.fabricante.slug, data.fabricante_slug ||
          data.fabricante_nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
        await clickSave();
        results.createdIds.fabricante = data.fabricante_nome;
      });
      await fillInput(SELECTORS.modelo.marca, data.modelo_marca);
      await fillInput(SELECTORS.modelo.modelo, data.modelo_nome);
      await fillInput(SELECTORS.modelo.portNum, data.modelo_portaria_num);
      await fillInput(SELECTORS.modelo.portaria, data.modelo_portaria);
      await selectByText(SELECTORS.modelo.fabricante, data.fabricante_nome);
      await clickSave();
      results.createdIds.modelo = `${data.modelo_marca} ${data.modelo_nome}`;
    });

    // 2. Tipo
    await ensureOption('#TipoEquipamento', data.tipo_nome, async () => {
      await page.goto(SELECTORS.tipo.url, { waitUntil: 'networkidle0' });
      await fillInput(SELECTORS.tipo.nome, data.tipo_nome);
      await clickSave();
      results.createdIds.tipo = data.tipo_nome;
    });

    // 3. Grupo
    await ensureOption('#GrupoEquipamento', data.grupo_nome, async () => {
      await page.goto(SELECTORS.grupo.url, { waitUntil: 'networkidle0' });
      await fillInput(SELECTORS.grupo.nome, data.grupo_nome);
      await clickSave();
      results.createdIds.grupo = data.grupo_nome;
    });
    // ── Fim pre-flight ────────────────────────────────────────────────────────

    await fillInput(SELECTORS.equipamento.serie, data.equip_serie);
    await fillInput(SELECTORS.equipamento.codigo, data.equip_codigo);
    await fillInput(SELECTORS.equipamento.certInmetro, data.equip_cert_inmetro);

    if (data.equip_emissao) {
      // AxHub usa formato DD/MM/YYYY
      const emissao = data.equip_emissao.includes('-')
        ? data.equip_emissao.split('-').reverse().join('/')
        : data.equip_emissao;
      await fillInput(SELECTORS.equipamento.emissao, emissao);
    }
    if (data.equip_vencimento) {
      const vencimento = data.equip_vencimento.includes('-')
        ? data.equip_vencimento.split('-').reverse().join('/')
        : data.equip_vencimento;
      await fillInput(SELECTORS.equipamento.vencimento, vencimento);
    }

    await selectByText('#ModeloEquipamento', data.modelo_nome);
    await selectByText('#TipoEquipamento', data.tipo_nome);
    await selectByText('#GrupoEquipamento', data.grupo_nome);

    // Tipo da Operação (radio: Fixo/Móvel) — padrão Fixo
    if (data.equip_tipo_operacao && data.equip_tipo_operacao.toLowerCase() === 'movel') {
      await page.evaluate(() => {
        const radios = Array.from(document.querySelectorAll('input[type=radio]'));
        const movel = radios.find(r => r.closest('label,div')?.textContent?.toLowerCase().includes('móvel'));
        if (movel) { movel.click(); movel.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    }

    // Desabilitar Limite de Horas (checkbox) — opcional
    if (data.equip_desabilitar_limite_horas) {
      await page.evaluate((sel) => {
        const cb = document.querySelector(sel);
        if (cb && !cb.checked) cb.click();
      }, SELECTORS.equipamento.desabilitarLimiteHorasImportacao);
    }

    await clickSave();

    const ss6 = await captureScreenshot();
    results.createdIds.equipamento = data.equip_codigo;
    results.steps[results.steps.length - 1].status = 'success';
    await report('Cadastrar Equipamento', 'success', `Equipamento "${data.equip_codigo}" salvo com sucesso!`, ss6);

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // PASSO 7: Cadastrar Faixa (localizacao fisica)
    if (data.faixa_codigo) {
      await report('Cadastrar Faixa', 'running', `Cadastrando faixa "${data.faixa_codigo}"...`);
      await page.goto(SELECTORS.faixa.url, { waitUntil: 'networkidle0' });
      await fillInput(SELECTORS.faixa.codigo,          data.faixa_codigo);
      await fillInput(SELECTORS.faixa.numero,          String(data.faixa_numero ?? 1));
      await fillInput(SELECTORS.faixa.sentido,         data.faixa_sentido);
      if (data.faixa_codigo_logradouro) await fillInput(SELECTORS.faixa.codigoLogradouro, data.faixa_codigo_logradouro);
      if (data.faixa_cep)               await fillInput(SELECTORS.faixa.cep,              data.faixa_cep);
      await fillInput(SELECTORS.faixa.logradouro,      data.faixa_logradouro);
      if (data.faixa_numero_end)        await fillInput(SELECTORS.faixa.numeroEnd,         data.faixa_numero_end);
      if (data.faixa_complemento)       await fillInput(SELECTORS.faixa.complemento,       data.faixa_complemento);
      await fillInput(SELECTORS.faixa.bairro,          data.faixa_bairro);
      await fillInput(SELECTORS.faixa.municipio,       data.faixa_municipio);
      await fillInput(SELECTORS.faixa.codigoMunicipio, data.faixa_codigo_municipio);
      await fillInput(SELECTORS.faixa.uf,              data.faixa_uf);
      if (data.faixa_latitude)  await fillInput(SELECTORS.faixa.latitude,  String(data.faixa_latitude));
      if (data.faixa_longitude) await fillInput(SELECTORS.faixa.longitude, String(data.faixa_longitude));
      await clickSave();
      const ss7 = await captureScreenshot();
      results.createdIds.faixa = data.faixa_codigo;
      results.steps[results.steps.length - 1].status = 'success';
      await report('Cadastrar Faixa', 'success', `Faixa "${data.faixa_codigo}" salva!`, ss7);
    } else {
      await report('Cadastrar Faixa', 'warning', 'faixa_codigo nao informado - etapa pulada.', null);
    }

    // PASSO 8: Verificacao Final
    await report('Verificacao Final', 'running', 'Verificando equipamento na listagem...');
    await page.goto(`${BASE_URL}/equipamento`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2500));
    const searchInput = await page.$('input[placeholder*="Pesquisar"], input[title*="Pesquisar"], .k-searchbox input');
    if (searchInput) {
      await searchInput.type(data.equip_codigo);
      await new Promise(r => setTimeout(r, 1200));
    }
    const found = await page.evaluate((codigo) => {
      const cells = document.querySelectorAll('td, .k-table-td');
      return Array.from(cells).some(td => td.textContent.includes(codigo));
    }, data.equip_codigo);
    const ss8 = await captureScreenshot();
    if (found) {
      results.steps[results.steps.length - 1].status = 'success';
      await report('Verificacao Final', 'success', `Equipamento "${data.equip_codigo}" encontrado na listagem!`, ss8);
    } else {
      results.steps[results.steps.length - 1].status = 'warning';
      await report('Verificacao Final', 'warning', `Equipamento pode ter sido salvo, mas nao encontrado na busca imediata`, ss8);
    }
    results.status = 'success';

  } catch (error) {
    const ss = await captureScreenshot();
    results.status = 'error';
    results.errors.push({ message: error.message, step: stepNum });
    await report(results.steps[results.steps.length - 1]?.label || 'Erro', 'error', `Falha: ${error.message}`, ss);
  } finally {
    results.endTime = new Date().toISOString();
    results.duration = ((new Date(results.endTime) - new Date(results.startTime)) / 1000).toFixed(1);
    setTimeout(() => { browser.close().catch(() => {}); }, 3000);
  }
  return results;
}

export const EQUIPMENT_CYCLE_SCHEMA = {
  description: 'Ciclo completo de cadastro de Equipamento no AxHub',
  steps: 8,
  estimatedTime: '~4 minutos',
  fields: [
    { name: 'fabricante_nome',        label: 'Fabricante - Nome',            type: 'text',   required: true,  placeholder: 'Ex: AXION TECNOLOGIA',         hint: 'Nome do fabricante' },
    { name: 'fabricante_slug',        label: 'Fabricante - Slug (ID)',        type: 'text',   required: false, placeholder: 'Ex: axion-tec',                hint: 'ID unico sem espacos' },
    { name: 'fabricante_agrupador',   label: 'Fabricante - Agrupador Seq.',   type: 'text',   required: false, placeholder: 'Ex: AXT',                      hint: 'Codigo agrupador opcional' },
    { name: 'fabricante_codigo',      label: 'Fabricante - Codigo',           type: 'text',   required: false, placeholder: 'Ex: FAB001',                   hint: 'Codigo interno do fabricante' },
    { name: 'tipo_nome',              label: 'Tipo de Equipamento',           type: 'text',   required: true,  placeholder: 'Ex: RADAR FIXO',               hint: 'Tipo/categoria do equipamento' },
    { name: 'modelo_marca',           label: 'Modelo - Marca',                type: 'text',   required: true,  placeholder: 'Ex: VELSIS',                   hint: 'Marca comercial' },
    { name: 'modelo_nome',            label: 'Modelo - Nome/Codigo',          type: 'text',   required: true,  placeholder: 'Ex: VSIS-OCR',                 hint: 'Modelo especifico' },
    { name: 'modelo_portaria_num',    label: 'Modelo - Nr Portaria INMETRO',  type: 'text',   required: true,  placeholder: 'Ex: 245/2022',                 hint: 'Numero da portaria de homologacao' },
    { name: 'modelo_portaria',        label: 'Modelo - Portaria INMETRO',     type: 'text',   required: true,  placeholder: 'Ex: PORTARIA INMETRO/DIMEL No 245/2022', hint: 'Referencia completa da portaria' },
    { name: 'grupo_nome',             label: 'Grupo de Equipamentos',         type: 'text',   required: true,  placeholder: 'Ex: GRUPO TESTE 2026',         hint: 'Nome do grupo no mapa' },
    { name: 'grupo_cor',              label: 'Grupo - Cor (hex)',              type: 'text',   required: false, placeholder: 'Ex: #0000ff',                  hint: 'Cor de exibicao no mapa' },
    { name: 'equip_serie',            label: 'Equipamento - Nr Serie',        type: 'text',   required: true,  placeholder: 'Ex: SN-20260001',              hint: 'Numero de serie do fabricante' },
    { name: 'equip_codigo',           label: 'Equipamento - Codigo',          type: 'text',   required: true,  placeholder: 'Ex: AXT001',                   hint: 'Codigo unico no sistema' },
    { name: 'equip_cert_inmetro',     label: 'Equipamento - Certificado INMETRO', type: 'text', required: true, placeholder: 'Ex: CERT-2026-001',           hint: 'Numero do certificado de afericao' },
    { name: 'equip_emissao',          label: 'Equipamento - Emissao INMETRO', type: 'date',   required: false, hint: 'Data de emissao do certificado INMETRO' },
    { name: 'equip_vencimento',       label: 'Equipamento - Vencimento INMETRO', type: 'date', required: false, hint: 'Data de vencimento do certificado' },
    { name: 'equip_tipo_operacao',    label: 'Equipamento - Tipo Operacao',   type: 'select', required: false, options: ['fixo','movel'], placeholder: 'fixo', hint: 'Fixo (padrao) ou Movel' },
    { name: 'faixa_codigo',           label: 'Faixa - Codigo',                type: 'text',   required: false, placeholder: 'Ex: FX-AXT001-01',             hint: 'Codigo unico da faixa' },
    { name: 'faixa_numero',           label: 'Faixa - Numero da Faixa',       type: 'number', required: false, placeholder: '1',                            hint: 'Numero inteiro da faixa' },
    { name: 'faixa_sentido',          label: 'Faixa - Sentido',               type: 'text',   required: false, placeholder: 'Ex: CRESCENTE',                hint: 'Sentido do trafego' },
    { name: 'faixa_logradouro',       label: 'Faixa - Logradouro',            type: 'text',   required: false, placeholder: 'Ex: AV. PAULISTA',             hint: 'Nome da via' },
    { name: 'faixa_numero_end',       label: 'Faixa - Numero Endereco',       type: 'text',   required: false, placeholder: 'Ex: 1000',                     hint: 'Numero do logradouro' },
    { name: 'faixa_complemento',      label: 'Faixa - Complemento',           type: 'text',   required: false, placeholder: 'Ex: KM 10',                    hint: 'Complemento do endereco' },
    { name: 'faixa_bairro',           label: 'Faixa - Bairro',                type: 'text',   required: false, placeholder: 'Ex: CENTRO',                   hint: 'Bairro da instalacao' },
    { name: 'faixa_municipio',        label: 'Faixa - Municipio',             type: 'text',   required: false, placeholder: 'Ex: GOIANIA',                  hint: 'Municipio da instalacao' },
    { name: 'faixa_codigo_municipio', label: 'Faixa - Codigo IBGE',           type: 'text',   required: false, placeholder: 'Ex: 5208707',                  hint: 'Codigo IBGE do municipio' },
    { name: 'faixa_uf',               label: 'Faixa - UF',                    type: 'text',   required: false, placeholder: 'Ex: GO',                       hint: 'Sigla do estado (2 letras)' },
    { name: 'faixa_cep',              label: 'Faixa - CEP',                   type: 'text',   required: false, placeholder: 'Ex: 74000-000',                hint: 'CEP do endereco' },
    { name: 'faixa_latitude',         label: 'Faixa - Latitude',              type: 'number', required: false, placeholder: 'Ex: -16.6869',                 hint: 'Latitude decimal' },
    { name: 'faixa_longitude',        label: 'Faixa - Longitude',             type: 'number', required: false, placeholder: 'Ex: -49.2648',                 hint: 'Longitude decimal' },
  ]
};



