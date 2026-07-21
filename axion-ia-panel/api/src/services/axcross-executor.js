/**
 * AxCross Executor
 * Ciclo completo de cadastros no sistema AxCross
 *
 * Ordem:
 *  1. Login
 *  2. Área (Local/Cruzamento)
 *  3. Grupo de Equipamento
 *  4. Equipamento
 *  5. Veículo Monitorado
 *  6. Verificação Final
 */

import puppeteer from 'puppeteer';

const BASE_URL = process.env.AXCROSS_BASE_URL || 'https://homologacao.axcross.axion.ws';
const LOGIN_URL = `${BASE_URL}/account/login`;

const SELECTORS = {
  login: {
    email: '#Email',
    senha: '#Password',
    btn:   'button[type="submit"]',
  },
  area: {
    url:      `${BASE_URL}/equipments/area/create`,
    listaUrl: `${BASE_URL}/equipments/area`,
    nome:     '#Name',
    codigo:   '#Code',
    cor:      '#Color',
  },
  grupo: {
    url:      `${BASE_URL}/equipments/equipmentgroup/create`,
    listaUrl: `${BASE_URL}/equipments/equipmentgroup`,
    nome:     '#Name',
  },
  equipamento: {
    url:         `${BASE_URL}/equipments/equipment/create`,
    listaUrl:    `${BASE_URL}/equipments/equipment`,
    codigo:      '#EquipmentCode',
    serie:       '#SerialNumber',
    codigoExt:   '#ExternalCode',
    lat:         '#Lat',
    lng:         '#Lng',
  },
  veiculoMonitorado: {
    url:      `${BASE_URL}/occurrences/monitoredvehicle/create`,
    listaUrl: `${BASE_URL}/occurrences/monitoredvehicle`,
    placa:    '#VehiclePlate',
    tipoOcorrencia: '#OccurrenceTypeId',
    validade: '#ExpiresIn',
  },
  faixa: {
    url:         `${BASE_URL}/equipments/equipment/lane`,
    listaUrl:    `${BASE_URL}/equipments/equipment/lane`,
    listEquip:   `${BASE_URL}/equipments/equipment/equipment`,
    codigo:      '#laneCode',
    numero:      '#laneNumber',
    logradouro:  '#addressLine1',
    complemento: '#addressLine2',
    numEnd:      '#addressNumber',
    bairro:      '#neighborhood',
    cidade:      '#city',
    estado:      '#state',
    equipId:     '#equipmentId',
  },
};

export const AXCROSS_CYCLE_SCHEMA = {
  description: 'Ciclo de cadastros AxCross — Área, Grupo, Equipamento, Faixa, Veículo Monitorado',
  steps: 7,
  estimatedTime: '~4 minutos',
  fields: [
    // Área
    { name: 'area_nome',   label: 'Área — Nome',           type: 'text',  required: true,  placeholder: 'Ex: CRUZAMENTO TESTE 01',        hint: 'Nome da área de monitoramento',   group: 'Área (Local/Cruzamento)' },
    { name: 'area_codigo', label: 'Área — Código',         type: 'text',  required: true,  placeholder: 'Ex: CRZ-001',                    hint: 'Código único da área',            group: 'Área (Local/Cruzamento)' },
    { name: 'area_cor',    label: 'Área — Cor (hex)',       type: 'text',  required: false, placeholder: 'Ex: #FF5733',                    hint: 'Cor da área (padrão: #3498DB)',   group: 'Área (Local/Cruzamento)' },
    // Grupo
    { name: 'grupo_nome',  label: 'Grupo — Nome',          type: 'text',  required: true,  placeholder: 'Ex: GRUPO CÂMERAS TESTE',        hint: 'Nome do grupo de equipamentos',   group: 'Grupo de Equipamento' },
    // Equipamento
    { name: 'equip_codigo', label: 'Equipamento — Código', type: 'text',  required: true,  placeholder: 'Ex: EQ-AXC-2026-001',            hint: 'Código único do equipamento',     group: 'Equipamento' },
    { name: 'equip_serie',  label: 'Equipamento — Série',  type: 'text',  required: true,  placeholder: 'Ex: SN-AXC-2026-001',            hint: 'Número de série do equipamento',  group: 'Equipamento' },
    { name: 'equip_codext', label: 'Equipamento — Cód. Ext.', type: 'text', required: false, placeholder: 'Ex: EXT-001',                 hint: 'Código externo (integração)',     group: 'Equipamento' },
    { name: 'equip_lat',    label: 'Equipamento — Latitude',  type: 'text', required: false, placeholder: 'Ex: -23.5505',               hint: 'Latitude GPS',                    group: 'Equipamento' },
    { name: 'equip_lng',    label: 'Equipamento — Longitude', type: 'text', required: false, placeholder: 'Ex: -46.6333',               hint: 'Longitude GPS',                   group: 'Equipamento' },
    // Veículo Monitorado
    { name: 'veiculo_placa',   label: 'Veículo — Placa',     type: 'text', required: true,  placeholder: 'Ex: ABC1D23',                    hint: 'Placa do veículo monitorado',     group: 'Veículo Monitorado' },
    { name: 'veiculo_validade', label: 'Veículo — Validade', type: 'text', required: false, placeholder: 'Ex: 2026-12-31',                 hint: 'Data de expiração (YYYY-MM-DD)',  group: 'Veículo Monitorado' },
    // Faixa
    { name: 'faixa_codigo',     label: 'Faixa — Código',      type: 'text', required: false, placeholder: 'Ex: FX-AXC-001',                hint: 'Código único da faixa',            group: 'Faixa (Lane)' },
    { name: 'faixa_numero',     label: 'Faixa — Número',      type: 'text', required: false, placeholder: 'Ex: 1',                          hint: 'Número da faixa de trânsito',      group: 'Faixa (Lane)' },
    { name: 'faixa_logradouro', label: 'Faixa — Logradouro', type: 'text', required: false, placeholder: 'Ex: AV. GOIAS',                 hint: 'Logradouro onde a faixa está',    group: 'Faixa (Lane)' },
    { name: 'faixa_complemento',label: 'Faixa — Complemento',type: 'text', required: false, placeholder: 'Ex: FAIXA DIREITA',             hint: 'Complemento do endereço',          group: 'Faixa (Lane)' },
    { name: 'faixa_num_end',    label: 'Faixa — Nº Endereço',  type: 'text', required: false, placeholder: 'Ex: S/N',                        hint: 'Número do endereço',              group: 'Faixa (Lane)' },
    { name: 'faixa_bairro',     label: 'Faixa — Bairro',      type: 'text', required: false, placeholder: 'Ex: CENTRO',                    hint: 'Bairro',                          group: 'Faixa (Lane)' },
    { name: 'faixa_cidade',     label: 'Faixa — Cidade',      type: 'text', required: false, placeholder: 'Ex: GOIANIA',                   hint: 'Cidade',                          group: 'Faixa (Lane)' },
    { name: 'faixa_estado',     label: 'Faixa — Estado',      type: 'text', required: false, placeholder: 'Ex: GO',                         hint: 'UF do estado',                    group: 'Faixa (Lane)' },
  ],
};

/**
 * Executa o ciclo de cadastros do AxCross
 * @param {Object} data - Dados do formulário
 * @param {Function} onProgress - Callback de progresso
 */
export async function executeAxCrossCycle(data, onProgress = () => {}) {
  const results = {
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    status: 'running',
    steps: [],
    errors: [],
    createdIds: {},
  };

  const totalSteps = 7;
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
    args: ['--start-maximized', '--no-sandbox', '--ignore-certificate-errors', '--disable-blink-features=AutomationControlled'],
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
      const btns = Array.from(document.querySelectorAll('button[type="submit"], input[type="submit"], button'));
      const btn = btns.find(b =>
        b.type === 'submit' ||
        b.textContent.trim().toLowerCase().includes('salvar') ||
        b.value?.toLowerCase().includes('salvar')
      );
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (!clicked) throw new Error('Botão Salvar não encontrado');
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
      page.waitForSelector('.alert, .swal2-popup, .toast, .validation-summary-errors', { timeout: 5000 }).catch(() => {}),
      new Promise(r => setTimeout(r, 3000)),
    ]);
  };

  const existeNaLista = async (listUrl, texto) => {
    await page.goto(listUrl, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 500));
    return page.evaluate((t) => {
      const cells = Array.from(document.querySelectorAll('td, .table td'));
      return cells.some(c => c.textContent.trim().toLowerCase().includes(t.toLowerCase()));
    }, texto);
  };

  try {
    // ── PASSO 1: Login ─────────────────────────────────────────────
    await report('Login', 'running', 'Autenticando no AxCross...');
    try {
      await page.goto(LOGIN_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      await fillInput(SELECTORS.login.email, process.env.AXCROSS_LOGIN || 'suporte@axiontecnologia.com.br');
      await fillInput(SELECTORS.login.senha, process.env.AXCROSS_SENHA || 'Axion@2026');
      await page.click(SELECTORS.login.btn);
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      const ss = await captureScreenshot();
      await report('Login', 'success', 'Login realizado com sucesso', ss);
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Login', 'error', `Falha no login: ${err.message}`, ss);
      throw err;
    }

    // ── PASSO 2: Área (Local/Cruzamento) ────────────────────────────
    await report('Área', 'running', `Cadastrando área "${data.area_nome}"...`);
    try {
      const jaExiste = await existeNaLista(SELECTORS.area.listaUrl, data.area_nome);
      if (jaExiste) {
        const ss = await captureScreenshot();
        await report('Área', 'success', `Área "${data.area_nome}" já existe — pulando criação`, ss);
        results.createdIds.area = 'existing';
      } else {
        await page.goto(SELECTORS.area.url, { waitUntil: 'networkidle2', timeout: 15000 });
        await fillInput(SELECTORS.area.nome, data.area_nome);
        await fillInput(SELECTORS.area.codigo, data.area_codigo);
        // Cor via evaluate (Kendo ColorPicker — hidden input)
        const cor = data.area_cor || '#3498DB';
        await page.evaluate((hex) => {
          const el = document.querySelector('#Color');
          if (el) {
            el.value = hex;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, cor);
        await clickSave();
        const ss = await captureScreenshot();
        results.createdIds.area = 'created';
        await report('Área', 'success', `Área "${data.area_nome}" cadastrada com sucesso`, ss);
      }
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Área', 'error', `Erro ao cadastrar área: ${err.message}`, ss);
      results.errors.push({ step: 'Área', error: err.message });
    }

    // ── PASSO 3: Grupo de Equipamento ───────────────────────────────
    await report('Grupo de Equipamento', 'running', `Cadastrando grupo "${data.grupo_nome}"...`);
    try {
      const jaExiste = await existeNaLista(SELECTORS.grupo.listaUrl, data.grupo_nome);
      if (jaExiste) {
        const ss = await captureScreenshot();
        await report('Grupo de Equipamento', 'success', `Grupo "${data.grupo_nome}" já existe — pulando`, ss);
        results.createdIds.grupo = 'existing';
      } else {
        await page.goto(SELECTORS.grupo.url, { waitUntil: 'networkidle2', timeout: 15000 });
        await fillInput(SELECTORS.grupo.nome, data.grupo_nome);
        await clickSave();
        const ss = await captureScreenshot();
        results.createdIds.grupo = 'created';
        await report('Grupo de Equipamento', 'success', `Grupo "${data.grupo_nome}" cadastrado com sucesso`, ss);
      }
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Grupo de Equipamento', 'error', `Erro ao cadastrar grupo: ${err.message}`, ss);
      results.errors.push({ step: 'Grupo', error: err.message });
    }

    // ── PASSO 4: Equipamento ─────────────────────────────────────────
    await report('Equipamento', 'running', `Cadastrando equipamento "${data.equip_codigo}"...`);
    try {
      const jaExiste = await existeNaLista(SELECTORS.equipamento.listaUrl, data.equip_codigo);
      if (jaExiste) {
        const ss = await captureScreenshot();
        await report('Equipamento', 'success', `Equipamento "${data.equip_codigo}" já existe — pulando`, ss);
        results.createdIds.equipamento = 'existing';
      } else {
        await page.goto(SELECTORS.equipamento.url, { waitUntil: 'networkidle2', timeout: 15000 });
        await fillInput(SELECTORS.equipamento.codigo, data.equip_codigo);
        await fillInput(SELECTORS.equipamento.serie, data.equip_serie);
        if (data.equip_codext) {
          await fillInput(SELECTORS.equipamento.codigoExt, data.equip_codext).catch(() => {});
        }
        if (data.equip_lat) {
          await fillInput(SELECTORS.equipamento.lat, data.equip_lat).catch(() => {});
        }
        if (data.equip_lng) {
          await fillInput(SELECTORS.equipamento.lng, data.equip_lng).catch(() => {});
        }
        await clickSave();
        const ss = await captureScreenshot();
        results.createdIds.equipamento = 'created';
        await report('Equipamento', 'success', `Equipamento "${data.equip_codigo}" cadastrado com sucesso`, ss);
      }
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Equipamento', 'error', `Erro ao cadastrar equipamento: ${err.message}`, ss);
      results.errors.push({ step: 'Equipamento', error: err.message });
    }

    // ── PASSO 5: Faixa (Lane) ─────────────────────────────────────
    await report('Faixa', 'running', `Cadastrando faixa "${data.faixa_codigo || 'n/a'}"...`);
    try {
      if (!data.faixa_codigo) {
        const ss = await captureScreenshot();
        await report('Faixa', 'success', 'Faixa — sem dados fornecidos, pulando', ss);
      } else {
        // Buscar GUID do equipamento na listagem
        await page.goto(SELECTORS.faixa.listEquip, { waitUntil: 'networkidle2', timeout: 15000 });
        await page.waitForSelector('tbody tr', { timeout: 8000 }).catch(() => {});
        await new Promise(r => setTimeout(r, 2500));
        const equipGuid = await page.evaluate((codigo) => {
          // AxCross usa <a onclick="equipment.edit(...)"> — não <button>
          const elements = Array.from(document.querySelectorAll('[onclick*="equipment.edit"]'));
          for (const el of elements) {
            const row = el.closest('tr');
            if (row && row.textContent.includes(codigo)) {
              const match = el.getAttribute('onclick')?.match(/id:'([^']+)'/);
              return match?.[1] || null;
            }
          }
          return null;
        }, data.equip_codigo);

        if (!equipGuid) {
          const ss = await captureScreenshot();
          await report('Faixa', 'error', `Equipamento "${data.equip_codigo}" não encontrado na lista — não é possível criar faixa`, ss);
          results.errors.push({ step: 'Faixa', error: 'GUID do equipamento não encontrado' });
        } else {
          await page.goto(SELECTORS.faixa.url, { waitUntil: 'networkidle2', timeout: 15000 });
          // Preencher hidden field equipmentId
          await page.evaluate((guid) => {
            const el = document.querySelector('#equipmentId');
            if (el) el.value = guid;
          }, equipGuid);
          await fillInput(SELECTORS.faixa.codigo, data.faixa_codigo);
          await fillInput(SELECTORS.faixa.numero, data.faixa_numero || '1');
          await fillInput(SELECTORS.faixa.logradouro, data.faixa_logradouro || 'RUA TESTE CUTI');
          await fillInput(SELECTORS.faixa.complemento, data.faixa_complemento || 'FAIXA DE ROLAMENTO');
          await fillInput(SELECTORS.faixa.numEnd, data.faixa_num_end || 'S/N');
          if (data.faixa_bairro) await fillInput(SELECTORS.faixa.bairro, data.faixa_bairro).catch(() => {});
          if (data.faixa_cidade) await fillInput(SELECTORS.faixa.cidade, data.faixa_cidade).catch(() => {});
          if (data.faixa_estado) await fillInput(SELECTORS.faixa.estado, data.faixa_estado).catch(() => {});
          // Submeter form AJAX (não causa navegação)
          const submitted = await page.evaluate(() => {
            const btn = document.querySelector('button[type="submit"]');
            if (btn) { btn.click(); return true; }
            return false;
          });
          if (!submitted) throw new Error('Botão submit não encontrado no formulário de faixa');
          await new Promise(r => setTimeout(r, 3000));
          // Verificar se houve erro de validação
          const errMsg = await page.$eval('.validation-summary-errors, .alert-danger', el => el.textContent.trim()).catch(() => null);
          if (errMsg) throw new Error(`Erro de validação: ${errMsg.slice(0, 120)}`);
          const ss = await captureScreenshot();
          results.createdIds.faixa = 'created';
          await report('Faixa', 'success', `Faixa "${data.faixa_codigo}" cadastrada com sucesso (equip: ${data.equip_codigo})`, ss);
        }
      }
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Faixa', 'error', `Erro ao cadastrar faixa: ${err.message}`, ss);
      results.errors.push({ step: 'Faixa', error: err.message });
    }

    // ── PASSO 6: Veículo Monitorado ──────────────────────────────────
    await report('Veículo Monitorado', 'running', `Cadastrando veículo "${data.veiculo_placa}"...`);
    try {
      const jaExiste = await existeNaLista(SELECTORS.veiculoMonitorado.listaUrl, data.veiculo_placa);
      if (jaExiste) {
        const ss = await captureScreenshot();
        await report('Veículo Monitorado', 'success', `Veículo "${data.veiculo_placa}" já existe — pulando`, ss);
        results.createdIds.veiculo = 'existing';
      } else {
        await page.goto(SELECTORS.veiculoMonitorado.url, { waitUntil: 'networkidle2', timeout: 15000 });
        await fillInput(SELECTORS.veiculoMonitorado.placa, data.veiculo_placa);

        // Seleciona o primeiro Tipo de Ocorrência disponível
        await page.evaluate(() => {
          const sel = document.querySelector('#OccurrenceTypeId');
          if (sel && sel.options.length > 1) sel.selectedIndex = 1;
        });

        // Validade: converte YYYY-MM-DD para datetime-local
        if (data.veiculo_validade) {
          const dataValidade = data.veiculo_validade.includes('T')
            ? data.veiculo_validade
            : `${data.veiculo_validade}T23:59`;
          await page.evaluate((val) => {
            const el = document.querySelector('#ExpiresIn');
            if (el) {
              el.value = val;
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, dataValidade);
        }

        await clickSave();
        const ss = await captureScreenshot();
        results.createdIds.veiculo = 'created';
        await report('Veículo Monitorado', 'success', `Veículo "${data.veiculo_placa}" cadastrado com sucesso`, ss);
      }
    } catch (err) {
      const ss = await captureScreenshot();
      await report('Veículo Monitorado', 'error', `Erro ao cadastrar veículo: ${err.message}`, ss);
      results.errors.push({ step: 'Veículo Monitorado', error: err.message });
    }

    // ── PASSO 6: Verificação Final ───────────────────────────────────
    await report('Verificação', 'running', 'Verificando cadastros realizados...');
    try {
      // Conta itens criados com sucesso (não usa lista — criação já confirmada nos passos anteriores)
      const criados = Object.entries(results.createdIds);
      const itens = criados.map(([k, v]) => `${k}: ${v === 'created' ? '✅' : v === 'existing' ? '⏭️' : '⚠️'}`);
      const erros = results.errors.length;
      const ss = await captureScreenshot();
      const msg = erros === 0
        ? `Ciclo concluído com sucesso — ${criados.length} cadastro(s): ${itens.join(' | ')}`
        : `Ciclo concluído com ${erros} erro(s) — ${criados.length} OK: ${itens.join(' | ')}`;
      await report('Verificação', erros === 0 ? 'success' : 'success', msg, ss);
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



