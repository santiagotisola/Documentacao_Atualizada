/**
 * Sync Registrator
 * Cadastra registros individuais por entidade num sistema de destino.
 *
 * Regras:
 *  - Mesmo sistema apenas: axcross→axcross, axhub→axhub, axton→axton
 *  - Abre o browser UMA vez, faz login UMA vez, processa todos os registros
 *  - Suporte a: AxCross (area, grupo, equipamento, faixa, veiculo)
 *               AxHub   (fabricante, tipo, modelo, grupo, equipamento, faixa)
 */

import { connect as realBrowserConnect } from 'puppeteer-real-browser';

// ── Utilitários ─────────────────────────────────────────────────

// Helper: preenche campo SELECT por texto da opção
async function selectByText(page, selector, text) {
  if (!text) return;
  await page.$eval(selector, (sel, t) => {
    const opt = Array.from(sel.options).find(o =>
      o.text.toLowerCase().includes(t.toLowerCase()) ||
      o.value.toLowerCase().includes(t.toLowerCase())
    );
    if (opt) {
      sel.value = opt.value;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, String(text)).catch(() => {});
}

async function makeFillInput(page) {
  return async (selector, value) => {
    await page.waitForSelector(selector, { timeout: 8000 });
    await page.click(selector, { clickCount: 3 });
    // Usa evaluate para evitar problemas com caracteres especiais (#, @, etc.) no teclado PT-BR
    await page.evaluate((sel, val) => {
      const el = document.querySelector(sel);
      if (el) {
        el.value = String(val ?? '');
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, selector, String(value ?? ''));
  };
}

async function clickSave(page) {
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
    page.waitForSelector('.alert, .swal2-popup, .toast, .validation-summary-errors, .alert-danger', { timeout: 5000 }).catch(() => {}),
    new Promise(r => setTimeout(r, 3000)),
  ]);
  // Verifica erro de validação
  const errMsg = await page.$eval('.validation-summary-errors li, .alert-danger', el => el.textContent.trim()).catch(() => null);
  if (errMsg) throw new Error(`Erro de validação: ${errMsg.slice(0, 200)}`);
}

async function existeNaLista(page, listUrl, texto) {
  const checkPage = async () => {
    await page.goto(listUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    return page.evaluate((t) => {
      const cells = Array.from(document.querySelectorAll('td, .table td'));
      return cells.some(c => c.textContent.trim().toLowerCase().includes(t.toLowerCase()));
    }, texto);
  };
  try {
    return await checkPage();
  } catch (e) {
    if (e.message.includes('context') || e.message.includes('navigation') || e.message.includes('destroyed')) {
      // Navegação ainda em andamento — aguarda e tenta novamente
      await new Promise(r => setTimeout(r, 2500));
      return await checkPage();
    }
    throw e;
  }
}

// Helper: tenta preencher campo por múltiplos seletores; fallback posicional
async function smartFill(page, fillInput, value, ...selectors) {
  for (const sel of selectors) {
    if (!sel) continue;
    const el = await page.$(sel).catch(() => null);
    if (el) { await fillInput(sel, value); return; }
  }
  // Fallback posicional: primeiro input text visível
  const filled = await page.evaluate((val) => {
    const inputs = Array.from(document.querySelectorAll(
      'input[type="text"], input:not([type]), input[type="number"], textarea'
    )).filter(i => {
      const s = window.getComputedStyle(i);
      return s.display !== 'none' && s.visibility !== 'hidden' && !i.readOnly && !i.disabled && i.offsetParent !== null;
    });
    if (!inputs[0]) return null;
    inputs[0].focus();
    inputs[0].value = val;
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[0].dispatchEvent(new Event('change', { bubbles: true }));
    return inputs[0].id || inputs[0].name || 'first-input';
  }, value);
  if (!filled) throw new Error(`Campo não encontrado. Seletores tentados: ${selectors.filter(Boolean).join(', ')}`);
}

async function loginAxCross(page, config) {
  const fillInput = await makeFillInput(page);
  await page.goto(`${config.url}/account/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 1500));
  await fillInput('#Email', config.login);
  await fillInput('#Password', config.senha);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  if (page.url().includes('/account/login')) throw new Error('Login falhou — verifique as credenciais do AxCross');
}

async function loginAxHub(page, config) {
  const fillInput = await makeFillInput(page);
  await page.goto(`${config.url}/Home/Login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000)); // aguarda Cloudflare Turnstile inicializar
  await page.$eval('#Username', el => { el.value = ''; }).catch(() => {});
  await fillInput('#Username', config.login);
  await fillInput('#Password', config.senha);
  // Aguarda o botão ser habilitado (Cloudflare Turnstile pode manter disabled até validar)
  await page.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 30000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 500));
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  if (page.url().toLowerCase().includes('/home/login')) throw new Error('Login falhou — verifique as credenciais do AxHub');
}

// ── AxCross — cadastro individual por entidade ───────────────────

async function registerAxCrossArea(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.area_nome || record['Nome'] || '';
  const codigo = record.area_codigo || record['Código'] || '';
  const cor = record.area_cor || record['Cor'] || '#3498DB';

  if (!nome) throw new Error('area_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/equipments/area`, nome);
  if (jaExiste) return { status: 'skipped', message: `Área "${nome}" já existe` };

  await page.goto(`${baseUrl}/equipments/area/create`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Name', nome);
  if (codigo) await fillInput('#Code', codigo).catch(() => {});
  // Cor (hidden input ou colorpicker)
  await page.evaluate((hex) => {
    const el = document.querySelector('#Color');
    if (el) { el.value = hex; el.dispatchEvent(new Event('change', { bubbles: true })); }
  }, cor.startsWith('#') ? cor : `#${cor}`);
  await clickSave(page);
  return { status: 'created', message: `Área "${nome}" cadastrada` };
}

async function registerAxCrossGrupo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.grupo_nome || record['Nome'] || '';
  if (!nome) throw new Error('grupo_nome é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/equipments/equipmentgroup`, nome);
  if (jaExiste) return { status: 'skipped', message: `Grupo "${nome}" já existe` };

  await page.goto(`${baseUrl}/equipments/equipmentgroup/create`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Name', nome);
  await clickSave(page);
  return { status: 'created', message: `Grupo "${nome}" cadastrado` };
}

async function registerAxCrossEquipamento(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo = record.equip_codigo || record['Código'] || record['Codigo'] || '';
  const serie = record.equip_serie || record['Número de Série'] || record['Numero de Serie'] || '';
  if (!codigo) throw new Error('equip_codigo é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/equipments/equipment`, codigo);
  if (jaExiste) return { status: 'skipped', message: `Equipamento "${codigo}" já existe` };

  await page.goto(`${baseUrl}/equipments/equipment/create`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#EquipmentCode', codigo);
  if (serie) await fillInput('#SerialNumber', serie).catch(() => {});
  if (record.equip_codigo_externo || record['Código Externo'])
    await fillInput('#ExternalCode', record.equip_codigo_externo || record['Código Externo']).catch(() => {});
  if (record.equip_lat || record['Lat'])
    await fillInput('#Lat', record.equip_lat || record['Lat']).catch(() => {});
  if (record.equip_lng || record['Lng'])
    await fillInput('#Lng', record.equip_lng || record['Lng']).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Equipamento "${codigo}" cadastrado` };
}

async function registerAxCrossFaixa(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo = record.faixa_codigo || record['Código'] || '';
  const equipCodigo = record.equip_codigo || record['Equipamento'] || '';
  if (!codigo) throw new Error('faixa_codigo é obrigatório');
  if (!equipCodigo) throw new Error('equip_codigo é obrigatório para criar faixa');

  // Busca GUID do equipamento
  await page.goto(`${baseUrl}/equipments/equipment/equipment`, { waitUntil: 'networkidle2', timeout: 15000 });
  await page.waitForSelector('tbody tr', { timeout: 8000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));
  const equipGuid = await page.evaluate((cod) => {
    const elements = Array.from(document.querySelectorAll('[onclick*="equipment.edit"]'));
    for (const el of elements) {
      const row = el.closest('tr');
      if (row && row.textContent.includes(cod)) {
        const m = el.getAttribute('onclick')?.match(/id:'([^']+)'/);
        return m?.[1] || null;
      }
    }
    return null;
  }, equipCodigo);
  if (!equipGuid) throw new Error(`Equipamento "${equipCodigo}" não encontrado — crie o equipamento primeiro`);

  await page.goto(`${baseUrl}/equipments/equipment/lane`, { waitUntil: 'networkidle2', timeout: 15000 });
  await page.evaluate((guid) => {
    const el = document.querySelector('#equipmentId');
    if (el) el.value = guid;
  }, equipGuid);
  await fillInput('#laneCode', codigo);
  await fillInput('#laneNumber', record.faixa_numero || record['Número'] || '1');
  await fillInput('#addressLine1', record.faixa_logradouro || record['Logradouro'] || 'A DEFINIR');
  await fillInput('#addressLine2', record.faixa_complemento || record['Complemento'] || '');
  await fillInput('#addressNumber', record.faixa_num_end || 'S/N');
  if (record.faixa_bairro) await fillInput('#neighborhood', record.faixa_bairro).catch(() => {});
  if (record.faixa_cidade) await fillInput('#city', record.faixa_cidade).catch(() => {});
  if (record.faixa_uf || record.faixa_estado) await fillInput('#state', record.faixa_uf || record.faixa_estado).catch(() => {});
  // Form AJAX — só clica submit, sem waitForNavigation
  await page.evaluate(() => { document.querySelector('button[type="submit"]')?.click(); });
  await new Promise(r => setTimeout(r, 3000));
  const errMsg = await page.$eval('.validation-summary-errors, .alert-danger', el => el.textContent.trim()).catch(() => null);
  if (errMsg) throw new Error(`Erro de validação: ${errMsg.slice(0, 200)}`);
  return { status: 'created', message: `Faixa "${codigo}" cadastrada (equip: ${equipCodigo})` };
}

async function registerAxCrossVeiculo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const placa = record.veiculo_placa || record['Placa'] || '';
  if (!placa) throw new Error('veiculo_placa é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/occurrences/monitoredvehicle`, placa);
  if (jaExiste) return { status: 'skipped', message: `Veículo "${placa}" já existe` };

  await page.goto(`${baseUrl}/occurrences/monitoredvehicle/create`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#VehiclePlate', placa);
  await page.evaluate(() => {
    const sel = document.querySelector('#OccurrenceTypeId');
    if (sel && sel.options.length > 1) sel.selectedIndex = 1;
  });
  if (record.veiculo_validade || record['Vigência']) {
    const val = (record.veiculo_validade || record['Vigência']).includes('T')
      ? record.veiculo_validade || record['Vigência']
      : `${record.veiculo_validade || record['Vigência']}T23:59`;
    await page.evaluate((v) => {
      const el = document.querySelector('#ExpiresIn');
      if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }
    }, val);
  }
  await clickSave(page);
  return { status: 'created', message: `Veículo "${placa}" cadastrado` };
}

// ── AxHub — cadastro individual por entidade ─────────────────────

async function registerAxHubFabricante(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.fab_nome || record['Nome'] || record['Fabricante'] || '';
  if (!nome) throw new Error('fab_nome é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/fabricante`, nome);
  if (jaExiste) return { status: 'skipped', message: `Fabricante "${nome}" já existe` };

  await page.goto(`${baseUrl}/fabricante/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Nome', nome);
  const slug = record.fab_slug || nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  await fillInput('#Client_Id', slug);
  await clickSave(page);
  return { status: 'created', message: `Fabricante "${nome}" cadastrado` };
}

async function registerAxHubTipo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.tipo_nome || record['Nome'] || record['Tipo'] || '';
  if (!nome) throw new Error('tipo_nome é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/tipoequipamento`, nome);
  if (jaExiste) return { status: 'skipped', message: `Tipo "${nome}" já existe` };

  await page.goto(`${baseUrl}/tipoequipamento/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Nome', nome);
  await clickSave(page);
  return { status: 'created', message: `Tipo "${nome}" cadastrado` };
}

async function registerAxHubModelo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const modelo = record.modelo_nome || record['Modelo'] || '';
  const fabricante = record.fab_nome || record['Fabricante'] || record['Marca'] || '';
  if (!modelo) throw new Error('modelo_nome é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/modeloequipamento`, modelo);
  if (jaExiste) return { status: 'skipped', message: `Modelo "${modelo}" já existe` };

  await page.goto(`${baseUrl}/modeloequipamento/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Modelo', modelo);
  if (fabricante) await fillInput('#Marca', fabricante).catch(() => {});
  if (record.modelo_portaria) {
    await fillInput('#NumeroPortaria', record.modelo_portaria).catch(() => {});
    await fillInput('#Portaria', record.modelo_portaria).catch(() => {});
  }
  // Seleciona fabricante no <select>
  if (fabricante) {
    await page.evaluate((fab) => {
      const sel = document.querySelector('#Fabricante');
      if (sel) {
        const opt = Array.from(sel.options).find(o => o.text.toLowerCase().includes(fab.toLowerCase()));
        if (opt) sel.value = opt.value;
      }
    }, fabricante);
  }
  await clickSave(page);
  return { status: 'created', message: `Modelo "${modelo}" cadastrado` };
}

async function registerAxHubGrupo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.grupo_nome || record['Nome'] || record['Grupo'] || '';
  if (!nome) throw new Error('grupo_nome é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/grupoequipamento`, nome);
  if (jaExiste) return { status: 'skipped', message: `Grupo "${nome}" já existe` };

  await page.goto(`${baseUrl}/grupoequipamento/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Nome', nome);
  await clickSave(page);
  return { status: 'created', message: `Grupo "${nome}" cadastrado` };
}

async function registerAxHubEquipamento(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo = record.equip_codigo || record['Código'] || '';
  const serie = record.equip_serie || record['Número de Série'] || record['Serie'] || '';
  if (!codigo) throw new Error('equip_codigo é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/equipamento`, codigo);
  if (jaExiste) return { status: 'skipped', message: `Equipamento "${codigo}" já existe` };

  await page.goto(`${baseUrl}/equipamento/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Codigo', codigo);
  if (serie) await fillInput('#NumeroSerie', serie).catch(() => {});
  // Kendo ComboBox — preenche por texto
  for (const [key, sel] of [['modelo_nome', '#ModeloEquipamento_input'], ['tipo_nome', '#TipoEquipamento_input'], ['grupo_nome', '#GrupoEquipamento_input']]) {
    const val = record[key] || record[key.replace('_nome', '')] || '';
    if (val) {
      await page.click(sel, { clickCount: 3 }).catch(() => {});
      await page.type(sel, val, { delay: 30 }).catch(() => {});
      await page.keyboard.press('Enter').catch(() => {});
      await new Promise(r => setTimeout(r, 800));
    }
  }
  await clickSave(page);
  return { status: 'created', message: `Equipamento "${codigo}" cadastrado` };
}

async function registerAxHubFaixa(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo = record.faixa_codigo || record['Código'] || '';
  if (!codigo) throw new Error('faixa_codigo é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/faixa`, codigo);
  if (jaExiste) return { status: 'skipped', message: `Faixa "${codigo}" já existe` };

  await page.goto(`${baseUrl}/faixa/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Codigo', codigo);
  await fillInput('#NumeroFaixa', record.faixa_numero || record['Número'] || '1');
  await fillInput('#Logradouro', record.faixa_logradouro || record['Logradouro'] || 'A DEFINIR');
  if (record.faixa_bairro) await fillInput('#Bairro', record.faixa_bairro).catch(() => {});
  if (record.faixa_cidade) await fillInput('#Municipio', record.faixa_cidade).catch(() => {});
  if (record.faixa_uf || record.faixa_estado) await fillInput('#Uf', record.faixa_uf || record.faixa_estado).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Faixa "${codigo}" cadastrada` };
}

// ── Dispatcher de entidades ──────────────────────────────────────

// ── AxHub Admin — cadastro individual por entidade ───────────────

async function registerAxHubEnquadramento(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo   = record.enq_codigo   || record['Código']    || record['Codigo']    || '';
  const descricao= record.enq_descricao|| record['Descrição'] || record['Descricao'] || '';
  if (!codigo)    throw new Error('enq_codigo é obrigatório');
  if (!descricao) throw new Error('enq_descricao é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/enquadramento`, codigo);
  if (jaExiste) return { status: 'skipped', message: `Enquadramento "${codigo}" já existe` };

  await page.goto(`${baseUrl}/enquadramento/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Codigo',   codigo);
  await fillInput('#Descricao', descricao);
  const vel = record.enq_velocidade || record['Velocidade'] || record['VelocidadePermitida'] || '';
  if (vel) await fillInput('#VelocidadePermitida', vel).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Enquadramento "${codigo}" cadastrado` };
}

async function registerAxHubVinculoEnquadramento(page, record, baseUrl) {
  // Vínculo de Enquadramento requer selects dropdown encadeados (Enquadramento + Modelo)
  // É cadastrado de forma semi-automática
  const fillInput = await makeFillInput(page);
  const enqCodigo    = record.enq_codigo    || record['Enquadramento'] || record['Código'] || '';
  const modeloNome   = record.modelo_nome   || record['Modelo']        || '';

  if (!enqCodigo) throw new Error('enq_codigo (Enquadramento) é obrigatório para vínculo');

  await page.goto(`${baseUrl}/vinculoenquadramento/new`, { waitUntil: 'networkidle2', timeout: 15000 });

  // Seleciona Enquadramento no Kendo ComboBox/Select
  const enqSelecionado = await page.evaluate((cod) => {
    // Tenta <select id="EnquadramentoId"> ou Kendo ComboBox
    const sel = document.querySelector('#EnquadramentoId, #Enquadramento');
    if (sel) {
      const opt = Array.from(sel.options).find(o => o.text.includes(cod) || o.value === cod);
      if (opt) { sel.value = opt.value; sel.dispatchEvent(new Event('change', { bubbles: true })); return true; }
    }
    // Tenta Kendo input
    const input = document.querySelector('#EnquadramentoId_input, #Enquadramento_input');
    if (input) { input.value = cod; input.dispatchEvent(new Event('input', { bubbles: true })); return true; }
    return false;
  }, enqCodigo);

  if (!enqSelecionado) return { status: 'skipped', message: `Vínculo para "${enqCodigo}" — selecione manualmente (dropdown não encontrado)` };

  if (modeloNome) {
    await page.evaluate((mod) => {
      const sel = document.querySelector('#ModeloEquipamentoId, #ModeloEquipamento');
      if (sel) {
        const opt = Array.from(sel.options).find(o => o.text.toLowerCase().includes(mod.toLowerCase()));
        if (opt) { sel.value = opt.value; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      }
    }, modeloNome);
  }

  await new Promise(r => setTimeout(r, 500));
  await clickSave(page);
  return { status: 'created', message: `Vínculo para enquadramento "${enqCodigo}" cadastrado` };
}

async function registerAxHubArco(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome       = record.arco_nome       || record['Nome']        || '';
  const localizacao= record.arco_localizacao|| record['Localização'] || record['Localizacao'] || '';
  if (!nome) throw new Error('arco_nome é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/arco`, nome);
  if (jaExiste) return { status: 'skipped', message: `Arco "${nome}" já existe` };

  await page.goto(`${baseUrl}/arco/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Nome', nome);
  if (localizacao) await fillInput('#Localizacao', localizacao).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Arco "${nome}" cadastrado` };
}

async function registerAxHubMotivo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo  = record.motivo_codigo  || record['Código']    || record['Codigo']    || '';
  const descricao=record.motivo_descricao||record['Descrição'] || record['Descricao'] || '';
  if (!codigo)    throw new Error('motivo_codigo é obrigatório');
  if (!descricao) throw new Error('motivo_descricao é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/motivodescarte`, codigo);
  if (jaExiste) return { status: 'skipped', message: `Motivo "${codigo}" já existe` };

  await page.goto(`${baseUrl}/motivodescarte/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Codigo',   codigo);
  await fillInput('#Descricao', descricao);
  await clickSave(page);
  return { status: 'created', message: `Motivo de descarte "${codigo}" cadastrado` };
}

// ── Helper: primeiro valor não-vazio do record (exclui metadados) ─
function firstField(record, ...prefer) {
  // tenta chaves preferidas primeiro
  for (const k of prefer) {
    if (record[k]) return record[k];
  }
  // fallback: primeiro campo não-metadata com valor
  for (const [k, v] of Object.entries(record)) {
    if (!k.startsWith('_') && !k.startsWith('col_') && v && String(v).trim()) return String(v).trim();
  }
  return '';
}

async function registerAxHubTipoAfericao(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo   = record.tafer_codigo
    || record['Código']        || record['Codigo']
    || record['Nome']          || record['Tipo Aferição']
    || record['Tipo Afericao'] || record['Tipo']
    || firstField(record);
  const descricao = record.tafer_descricao
    || record['Descrição']    || record['Descricao']
    || record['Tipo Aferição']|| record['Nome']
    || codigo;
  if (!codigo) throw new Error('tafer_codigo é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/tipoafericao`, codigo);
  if (jaExiste) return { status: 'skipped', message: `Tipo de aferição "${codigo}" já existe` };

  await page.goto(`${baseUrl}/tipoafericao/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, codigo,
    '#Codigo', 'input[name="Codigo"]', '#TipoCodigo', 'input[name="TipoCodigo"]',
    '#Descricao', 'input[name="Descricao"]'
  );
  await smartFill(page, fillInput, descricao,
    '#Descricao', 'input[name="Descricao"]', 'textarea[name="Descricao"]',
    '#TipoDescricao', '#Descricao'
  ).catch(() => {});
  const validade = record.tafer_validade || record['Validade'] || record['ValidadeMeses'] || '';
  if (validade) await smartFill(page, fillInput, String(validade),
    '#ValidadeMeses', 'input[name="ValidadeMeses"]', '#Validade'
  ).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Tipo de aferição "${codigo}" cadastrado` };
}

async function registerAxHubTarja(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome     = record.tarja_nome         || record['Nome']          || '';
  const largura  = record.tarja_largura      || record['Largura']       || '0';
  const altura   = record.tarja_altura       || record['Altura']        || '0';
  const fonte    = record.tarja_tamanho_fonte|| record['Tamanho Fonte'] || record['TamanhoFonte'] || '';
  const posicao  = record.tarja_posicao      || record['Posição Tarja'] || record['Posicao Tarja'] || record['PosicaoTarjaTexto'] || '';
  const template = record.tarja_template     || record['Template']      || '';
  if (!nome) throw new Error('tarja_nome é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/tarja`, nome);
  if (jaExiste) return { status: 'skipped', message: `Tarja "${nome}" já existe` };

  await page.goto(`${baseUrl}/tarja/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await fillInput('#Nome', nome);
  if (largura) await fillInput('#Largura', largura).catch(() => {});
  if (altura)  await fillInput('#Altura', altura).catch(() => {});
  if (fonte)   await fillInput('#TamanhoFonte', fonte).catch(() => {});
  if (posicao) await selectByText(page, '#PosicaoTarja', posicao);
  if (template) {
    await page.evaluate((val) => {
      const el = document.querySelector('#Template');
      if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
    }, template).catch(() => {});
  }
  await clickSave(page);
  return { status: 'created', message: `Tarja "${nome}" cadastrada` };
}

async function registerAxHubRegiao(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome    = record.reg_nome     || record['Nome']      || '';
  const uf      = record.reg_uf       || record['UF']        || record['Estado'] || '';
  const descricao=record.reg_descricao|| record['Descrição'] || '';
  if (!nome) throw new Error('reg_nome é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/regiao`, nome);
  if (jaExiste) return { status: 'skipped', message: `Região "${nome}" já existe` };

  await page.goto(`${baseUrl}/regiao/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Nome', nome);
  if (uf)       await fillInput('#Uf',      uf).catch(() => {});
  if (descricao)await fillInput('#Descricao',descricao).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Região "${nome}" cadastrada` };
}

async function registerAxHubFormaAutuacao(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome    = record.forma_nome    || record['Nome']      || '';
  const descricao=record.forma_descricao||record['Descrição'] || '';
  if (!nome) throw new Error('forma_nome é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/formaautuacao`, nome);
  if (jaExiste) return { status: 'skipped', message: `Forma de autuação "${nome}" já existe` };

  await page.goto(`${baseUrl}/formaautuacao/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Nome', nome);
  if (descricao) await fillInput('#Descricao', descricao).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Forma de autuação "${nome}" cadastrada` };
}

async function registerAxHubSequencial(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo   = record.seq_codigo
    || record['Código']     || record['Codigo']
    || record['Descrição']  || record['Descricao']
    || record['Nome']       || record['Prefixo']
    || firstField(record);
  const prefixo    = record.seq_prefixo    || record['Prefixo']         || '';
  const numInicial = record.seq_num_inicial|| record['Número Inicial']   || record['Numero Inicial'] || '';
  if (!codigo) throw new Error('seq_codigo é obrigatório');

  const jaExiste = await existeNaLista(page, `${baseUrl}/sequencialinfracao`, codigo);
  if (jaExiste) return { status: 'skipped', message: `Sequencial "${codigo}" já existe` };

  await page.goto(`${baseUrl}/sequencialinfracao/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Codigo', codigo);
  if (prefixo)    await fillInput('#Prefixo',       prefixo).catch(() => {});
  if (numInicial) await fillInput('#NumeroInicial',  String(numInicial)).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Sequencial "${codigo}" cadastrado` };
}

async function registerAxHubLayout(page, record, baseUrl) {
  // Layout de arquivo requer upload de arquivo — não automatizável de forma simples
  const nome = record.layout_nome || record['Nome'] || record['Layout'] || '';
  return {
    status: 'skipped',
    message: `Layout "${nome}" — requer upload de arquivo. Cadastre manualmente em ${baseUrl}/layoutarquivo`,
  };
}

async function registerAxHubConfiguracao(page, record, baseUrl) {
  // Configurações geralmente são chave→valor — automação limitada, recomenda revisão manual
  const nome  = record.conf_nome  || record['Nome']  || record['Chave'] || '';
  const valor = record.conf_valor || record['Valor'] || '';
  if (!nome) throw new Error('conf_nome é obrigatório');
  await page.goto(`${baseUrl}/configuracao`, { waitUntil: 'networkidle2', timeout: 15000 });
  return { status: 'skipped', message: `Configuração "${nome}" — verifique manualmente em ${baseUrl}/configuracao (valor: ${valor || 'n/a'})` };
}

async function registerAxHubNumLote(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo = record.lote_codigo || record['Código'] || '';
  const prefixo= record.lote_prefixo|| record['Prefixo']|| '';
  if (!codigo) throw new Error('lote_codigo é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/numeracaolote`, codigo);
  if (jaExiste) return { status: 'skipped', message: `Numeração de Lote "${codigo}" já existe` };
  await page.goto(`${baseUrl}/numeracaolote/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Codigo', codigo);
  if (prefixo) await fillInput('#Prefixo', prefixo).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Numeração de Lote "${codigo}" cadastrada` };
}

async function registerAxHubNumInfracao(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo = record.inf_codigo || record['Código'] || '';
  const prefixo= record.inf_prefixo|| record['Prefixo']|| '';
  if (!codigo) throw new Error('inf_codigo é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/numeracaoinfracao`, codigo);
  if (jaExiste) return { status: 'skipped', message: `Numeração de Infração "${codigo}" já existe` };
  await page.goto(`${baseUrl}/numeracaoinfracao/new`, { waitUntil: 'networkidle2', timeout: 15000 });
  await fillInput('#Codigo', codigo);
  if (prefixo) await fillInput('#Prefixo', prefixo).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Numeração de Infração "${codigo}" cadastrada` };
}

async function registerAxHubTipoImagem(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.ti_nome
    || record['Nome']          || record['Tipo']
    || record['Tipo Imagem']   || record['Tipo de Imagem']
    || record['Código']        || record['Codigo']
    || firstField(record);
  if (!nome) throw new Error('ti_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/tipoimagem`, nome);
  if (jaExiste) return { status: 'skipped', message: `Tipo de Imagem "${nome}" já existe` };
  await page.goto(`${baseUrl}/tipoimagem/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, nome,
    '#Nome', 'input[name="Nome"]', '#TipoImagem', 'input[name="TipoImagem"]',
    '#Descricao', 'input[name="Descricao"]'
  );
  const codigo = record.ti_codigo || record['Código'] || '';
  if (codigo) await smartFill(page, fillInput, codigo,
    '#Codigo', 'input[name="Codigo"]'
  ).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Tipo de Imagem "${nome}" cadastrado` };
}

async function registerAxHubPowerBI(page, record, baseUrl) {
  // Power BI requer URL de embed e configurações específicas — orientar revisão manual
  const nome = record.pbi_nome || record['Nome'] || record['Relatório'] || '';
  const url  = record.pbi_url  || record['URL']  || '';
  return {
    status: 'skipped',
    message: `Cadastro Power BI "${nome}" — requer URL de embed. Configure manualmente em ${baseUrl}/powerbi (URL: ${url || 'n/a'})`,
  };
}

async function registerAxHubWebhook(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const uri   = record.wh_url   || record['URL']   || record['Url Destino'] || record['URI'] || '';
  const nome  = record.wh_nome  || record['Nome']  || uri || '';
  const evento= record.wh_evento|| record['Evento']|| '';
  if (!uri) throw new Error('URL/URI do webhook é obrigatória');
  const jaExiste = await existeNaLista(page, `${baseUrl}/webhook`, uri);
  if (jaExiste) return { status: 'skipped', message: `Webhook "${uri}" já existe` };
  await page.goto(`${baseUrl}/webhook/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  // O campo URI tem o id "UniformResourceIdentifier" no AxHub
  await smartFill(page, fillInput, uri,
    '#UniformResourceIdentifier', '#Url', '#UrlDestino', '#URI'
  );
  if (nome && nome !== uri) await fillInput('#Nome', nome).catch(() => {});
  if (evento) await selectByText(page, '#Evento', evento);
  await clickSave(page);
  return { status: 'created', message: `Webhook "${uri}" cadastrado` };
}

// ── Veículos ────────────────────────────────────────────────────

async function registerAxHubClassifVeiculo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo  = record.cv_codigo  || record['Código']    || record['Codigo'] || firstField(record);
  const descricao=record.cv_descricao|| record['Descrição']|| record['Descricao'] || '';
  const label   = record.cv_label   || record['Label Rede Neural'] || '';
  if (!codigo) throw new Error('cv_codigo é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/classificacaoveiculo`, codigo);
  if (jaExiste) return { status: 'skipped', message: `Classif. Veículo "${codigo}" já existe` };
  await page.goto(`${baseUrl}/classificacaoveiculo/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, codigo,   '#Codigo', 'input[name="Codigo"]');
  await smartFill(page, fillInput, descricao,'#Descricao', 'input[name="Descricao"]').catch(() => {});
  if (label)   await smartFill(page, fillInput, label,  '#LabelRedeNeural', 'input[name="LabelRedeNeural"]').catch(() => {});
  if (record.cv_pbt)      await fillInput('#PBT', record.cv_pbt).catch(() => {});
  if (record.cv_uvp)      await fillInput('#UVP', record.cv_uvp).catch(() => {});
  if (record.cv_comp_min) await fillInput('#ComprimentoMinimo', record.cv_comp_min).catch(() => {});
  if (record.cv_comp_max) await fillInput('#ComprimentoMaximo', record.cv_comp_max).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Classif. Veículo "${codigo}" cadastrada` };
}

async function registerAxHubMarcaVeiculo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.mv_nome || record['Nome'] || firstField(record);
  if (!nome) throw new Error('mv_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/marcaveiculo`, nome);
  if (jaExiste) return { status: 'skipped', message: `Marca de Veículo "${nome}" já existe` };
  await page.goto(`${baseUrl}/marcaveiculo/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, nome, '#Nome', 'input[name="Nome"]', '#Descricao');
  await clickSave(page);
  return { status: 'created', message: `Marca de Veículo "${nome}" cadastrada` };
}

async function registerAxHubTipoVeiculo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.tv_nome || record['Nome'] || firstField(record);
  if (!nome) throw new Error('tv_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/tipoveiculo`, nome);
  if (jaExiste) return { status: 'skipped', message: `Tipo de Veículo "${nome}" já existe` };
  await page.goto(`${baseUrl}/tipoveiculo/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, nome, '#Nome', 'input[name="Nome"]', '#Descricao');
  if (record.tv_codigo) await fillInput('#Codigo', record.tv_codigo).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Tipo de Veículo "${nome}" cadastrado` };
}

async function registerAxHubCategVeiculo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome  = record.catv_nome  || record['Nome']   || firstField(record);
  const codigo= record.catv_codigo|| record['Código'] || '';
  if (!nome && !codigo) throw new Error('catv_nome é obrigatório');
  const chave = codigo || nome;
  const jaExiste = await existeNaLista(page, `${baseUrl}/categoriaveiculo`, chave);
  if (jaExiste) return { status: 'skipped', message: `Categoria de Veículo "${chave}" já existe` };
  await page.goto(`${baseUrl}/categoriaveiculo/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  if (codigo) await smartFill(page, fillInput, codigo, '#Codigo', 'input[name="Codigo"]').catch(() => {});
  await smartFill(page, fillInput, nome, '#Nome', '#Descricao', 'input[name="Nome"]').catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Categoria de Veículo "${chave}" cadastrada` };
}

async function registerAxHubEspecieVeiculo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome  = record.espv_nome  || record['Nome']   || firstField(record);
  const codigo= record.espv_codigo|| record['Código'] || '';
  if (!nome && !codigo) throw new Error('espv_nome é obrigatório');
  const chave = codigo || nome;
  const jaExiste = await existeNaLista(page, `${baseUrl}/especieveiculo`, chave);
  if (jaExiste) return { status: 'skipped', message: `Espécie de Veículo "${chave}" já existe` };
  await page.goto(`${baseUrl}/especieveiculo/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  if (codigo) await smartFill(page, fillInput, codigo, '#Codigo', 'input[name="Codigo"]').catch(() => {});
  await smartFill(page, fillInput, nome, '#Nome', '#Descricao', 'input[name="Nome"]').catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Espécie de Veículo "${chave}" cadastrada` };
}

async function registerAxHubModeloVeiculo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.modv_nome || record['Nome'] || firstField(record);
  if (!nome) throw new Error('modv_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/modeloveiculo`, nome);
  if (jaExiste) return { status: 'skipped', message: `Modelo de Veículo "${nome}" já existe` };
  await page.goto(`${baseUrl}/modeloveiculo/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, nome, '#Nome', 'input[name="Nome"]', '#Descricao');
  if (record.modv_codigo) await fillInput('#Codigo', record.modv_codigo).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Modelo de Veículo "${nome}" cadastrado` };
}

async function registerAxHubCorVeiculo(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.cor_nome || record['Nome'] || firstField(record);
  if (!nome) throw new Error('cor_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/cor`, nome);
  if (jaExiste) return { status: 'skipped', message: `Cor "${nome}" já existe` };
  await page.goto(`${baseUrl}/cor/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, nome, '#Nome', 'input[name="Nome"]', '#Descricao');
  if (record.cor_codigo) await fillInput('#Codigo', record.cor_codigo).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Cor "${nome}" cadastrada` };
}

async function registerAxHubMunicipio(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome   = record.mun_nome   || record['Nome']   || firstField(record);
  const codigo = record.mun_codigo || record['Código'] || '';
  if (!nome && !codigo) throw new Error('mun_nome é obrigatório');
  const chave = codigo || nome;
  const jaExiste = await existeNaLista(page, `${baseUrl}/municipio`, chave);
  if (jaExiste) return { status: 'skipped', message: `Município "${chave}" já existe` };
  await page.goto(`${baseUrl}/municipio/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  if (codigo) await smartFill(page, fillInput, codigo, '#Codigo', 'input[name="Codigo"]').catch(() => {});
  await smartFill(page, fillInput, nome, '#Nome', 'input[name="Nome"]', '#Descricao').catch(() => {});
  if (record.mun_estado) await smartFill(page, fillInput, record.mun_estado, '#UF', '#Estado', '#Uf').catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Município "${chave}" cadastrado` };
}

async function registerAxHubOperacao(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const codigo = record.op_codigo || record['Código'] || record['Codigo'] || firstField(record);
  if (!codigo) throw new Error('op_codigo é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/operacao`, codigo);
  if (jaExiste) return { status: 'skipped', message: `Operação "${codigo}" já existe` };
  await page.goto(`${baseUrl}/operacao/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, codigo, '#Codigo', '#Nome', 'input[name="Codigo"]');
  if (record.op_nome) await smartFill(page, fillInput, record.op_nome, '#Nome', 'input[name="Nome"]').catch(() => {});
  if (record.op_data_inicio) await fillInput('#DataInicio', record.op_data_inicio).catch(() => {});
  if (record.op_data_fim)    await fillInput('#DataFim', record.op_data_fim).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Operação "${codigo}" cadastrada` };
}

async function registerAxHubContrato(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.cont_nome || record['Nome'] || firstField(record);
  if (!nome) throw new Error('cont_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/contrato`, nome);
  if (jaExiste) return { status: 'skipped', message: `Contrato "${nome}" já existe` };
  await page.goto(`${baseUrl}/contrato/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, nome, '#Nome', 'input[name="Nome"]', '#Descricao');
  if (record.cont_codigo)     await fillInput('#Codigo', record.cont_codigo).catch(() => {});
  if (record.cont_data_inicio)await fillInput('#DataInicio', record.cont_data_inicio).catch(() => {});
  if (record.cont_data_fim)   await fillInput('#DataFim', record.cont_data_fim).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Contrato "${nome}" cadastrado` };
}

async function registerAxHubRecursoOp(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.rec_nome || record['Nome'] || firstField(record);
  if (!nome) throw new Error('rec_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/recursooperacao`, nome);
  if (jaExiste) return { status: 'skipped', message: `Recurso "${nome}" já existe` };
  await page.goto(`${baseUrl}/recursooperacao/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, nome, '#Nome', 'input[name="Nome"]', '#Descricao');
  await clickSave(page);
  return { status: 'created', message: `Recurso "${nome}" cadastrado` };
}

async function registerAxHubInterrupcaoOp(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.int_nome || record['Nome'] || firstField(record);
  if (!nome) throw new Error('int_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/interrupcaooperacao`, nome);
  if (jaExiste) return { status: 'skipped', message: `Interrupção "${nome}" já existe` };
  await page.goto(`${baseUrl}/interrupcaooperacao/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, nome, '#Nome', 'input[name="Nome"]', '#Descricao', '#Motivo');
  if (record.int_motivo) await smartFill(page, fillInput, record.int_motivo, '#Motivo', '#Descricao').catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Interrupção "${nome}" cadastrada` };
}

async function registerAxHubIndicePerf(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.ind_nome || record['Nome'] || firstField(record);
  if (!nome) throw new Error('ind_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/indiceperformance`, nome);
  if (jaExiste) return { status: 'skipped', message: `Índice "${nome}" já existe` };
  await page.goto(`${baseUrl}/indiceperformance/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, nome, '#Nome', 'input[name="Nome"]', '#Descricao');
  if (record.ind_formula) await fillInput('#Formula', record.ind_formula).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Índice de Performance "${nome}" cadastrado` };
}

async function registerAxHubPerfilAcesso(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.perfil_nome || record['Nome'] || firstField(record);
  if (!nome) throw new Error('perfil_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/perfilacesso`, nome);
  if (jaExiste) return { status: 'skipped', message: `Perfil "${nome}" já existe` };
  await page.goto(`${baseUrl}/perfilacesso/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, nome, '#Nome', 'input[name="Nome"]', '#Descricao');
  if (record.perfil_desc) await fillInput('#Descricao', record.perfil_desc).catch(() => {});
  await clickSave(page);
  return { status: 'created', message: `Perfil de Acesso "${nome}" cadastrado` };
}

async function registerAxHubUsuario(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const login = record.user_login || record['Login'] || firstField(record);
  const nome  = record.user_nome  || record['Nome']  || login;
  if (!login) throw new Error('user_login é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/usuario`, login);
  if (jaExiste) return { status: 'skipped', message: `Usuário "${login}" já existe` };
  await page.goto(`${baseUrl}/usuario/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, login, '#Login', 'input[name="Login"]', '#Usuario');
  await smartFill(page, fillInput, nome,  '#Nome',  'input[name="Nome"]',  '#NomeCompleto').catch(() => {});
  if (record.user_email) await fillInput('#Email', record.user_email).catch(() => {});
  if (record.user_perfil) await selectByText(page, '#Perfil', record.user_perfil).catch(() => {});
  if (record.user_senha) {
    await fillInput('#Senha', record.user_senha).catch(() => {});
    await fillInput('#ConfirmarSenha', record.user_senha).catch(() => {});
  }
  await clickSave(page);
  return { status: 'created', message: `Usuário "${login}" cadastrado` };
}

async function registerAxHubPermissao(page, record, baseUrl) {
  const fillInput = await makeFillInput(page);
  const nome = record.perm_nome || record['Nome'] || firstField(record);
  if (!nome) throw new Error('perm_nome é obrigatório');
  const jaExiste = await existeNaLista(page, `${baseUrl}/permissao`, nome);
  if (jaExiste) return { status: 'skipped', message: `Permissão "${nome}" já existe` };
  await page.goto(`${baseUrl}/permissao/new`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await smartFill(page, fillInput, nome, '#Nome', 'input[name="Nome"]', '#Descricao');
  await clickSave(page);
  return { status: 'created', message: `Permissão "${nome}" cadastrada` };
}

const AXCROSS_HANDLERS = {
  area:        registerAxCrossArea,
  grupo:       registerAxCrossGrupo,
  equipamento: registerAxCrossEquipamento,
  faixa:       registerAxCrossFaixa,
  veiculo:     registerAxCrossVeiculo,
};

const AXHUB_HANDLERS = {
  // Cadastros básicos (equipamentos)
  fabricante:  registerAxHubFabricante,
  tipo:        registerAxHubTipo,
  modelo:      registerAxHubModelo,
  grupo:       registerAxHubGrupo,
  equipamento: registerAxHubEquipamento,
  faixa:       registerAxHubFaixa,
  // Administração — independentes (registrar antes dos dependentes)
  enquadramento: registerAxHubEnquadramento,
  arco:          registerAxHubArco,
  motivo:        registerAxHubMotivo,
  'tip-afer':    registerAxHubTipoAfericao,
  tarja:         registerAxHubTarja,
  regiao:        registerAxHubRegiao,
  'forma-aut':   registerAxHubFormaAutuacao,
  sequencial:    registerAxHubSequencial,
  // Administração — dependentes
  'vinculo-enquadramento': registerAxHubVinculoEnquadramento,
  layout:                  registerAxHubLayout,
  // Administração — adicionais do menu
  configuracao:            registerAxHubConfiguracao,
  'num-lote':              registerAxHubNumLote,
  'num-infracao':          registerAxHubNumInfracao,
  'tipo-imagem':           registerAxHubTipoImagem,
  powerbi:                 registerAxHubPowerBI,
  webhook:                 registerAxHubWebhook,
  // Veículos
  'classif-veiculo':       registerAxHubClassifVeiculo,
  'modelo-veiculo':        registerAxHubModeloVeiculo,
  'marca-veiculo':         registerAxHubMarcaVeiculo,
  'tipo-veiculo':          registerAxHubTipoVeiculo,
  'categ-veiculo':         registerAxHubCategVeiculo,
  'especie-veiculo':       registerAxHubEspecieVeiculo,
  'cor-veiculo':           registerAxHubCorVeiculo,
  municipio:               registerAxHubMunicipio,
  // Operações
  operacao:                registerAxHubOperacao,
  // Medição
  contrato:                registerAxHubContrato,
  'recurso-op':            registerAxHubRecursoOp,
  'interrupcao-op':        registerAxHubInterrupcaoOp,
  'indice-perf':           registerAxHubIndicePerf,
  // Controle de Acesso
  'perfil-acesso':         registerAxHubPerfilAcesso,
  usuario:                 registerAxHubUsuario,
  permissao:               registerAxHubPermissao,
};

// Ordem de registro respeitando dependências para AxHub
// (entidades dependentes devem ser registradas depois das suas dependências)
const AXHUB_REGISTER_ORDER = [
  // Cadastros básicos (Equipamentos)
  'fabricante', 'tipo', 'grupo', 'modelo', 'equipamento', 'faixa',
  // Veículos
  'classif-veiculo', 'modelo-veiculo', 'marca-veiculo', 'tipo-veiculo', 'categ-veiculo', 'especie-veiculo', 'cor-veiculo', 'municipio',
  // Administração — independentes
  'enquadramento', 'arco', 'motivo', 'tip-afer', 'tarja', 'regiao', 'forma-aut', 'sequencial',
  'configuracao', 'num-lote', 'num-infracao', 'tipo-imagem', 'powerbi', 'webhook',
  // Operações (depois dos equipamentos)
  'operacao',
  // Medição
  'contrato', 'recurso-op', 'interrupcao-op', 'indice-perf',
  // Controle de Acesso (perfil antes de permissão e usuário)
  'perfil-acesso', 'permissao', 'usuario',
  // Admin — dependentes
  'vinculo-enquadramento', 'layout',
];

function sortByDependency(records, orderList) {
  return [...records].sort((a, b) => {
    const ia = orderList.indexOf(a._entityId);
    const ib = orderList.indexOf(b._entityId);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

// ── Entrada principal ────────────────────────────────────────────

/**
 * Registra múltiplos registros no sistema de destino.
 *
 * @param {Object} destConfig  - { produto, url, login, senha }
 * @param {Array}  records     - Lista de { _entityId, ...campos }
 * @param {Function} onProgress - callback({ item, total, entityId, status, message })
 * @returns {Array} results    - [ { item, entityId, status, message } ]
 */
export async function registerInDest(destConfig, records, onProgress = () => {}) {
  const { produto, url } = destConfig;

  const handlers = produto === 'axcross' ? AXCROSS_HANDLERS : AXHUB_HANDLERS;
  const loginFn  = produto === 'axcross' ? loginAxCross : loginAxHub;

  // Ordenar registros por dependência antes de processar
  const orderedRecords = produto === 'axhub'
    ? sortByDependency(records, AXHUB_REGISTER_ORDER)
    : records;

  const { browser, page } = await realBrowserConnect({
    headless: false,
    args: ['--no-sandbox', '--ignore-certificate-errors'],
    customConfig: {},
    turnstile: true,
    connectOption: { defaultViewport: null },
    disableXvfb: false,
    ignoreAllFlags: false,
  });
  page.setDefaultTimeout(20000);

  const results = [];

  try {
    // Login único
    onProgress({ item: 0, total: orderedRecords.length, entityId: 'login', status: 'running', message: `Login em ${url}...` });
    await loginFn(page, destConfig);
    onProgress({ item: 0, total: orderedRecords.length, entityId: 'login', status: 'success', message: `Autenticado como ${destConfig.login}` });

    // Processa cada registro na ordem de dependência
    for (let i = 0; i < orderedRecords.length; i++) {
      const record = orderedRecords[i];
      const entityId = record._entityId || 'desconhecido';
      const handler = handlers[entityId];
      const itemNum = i + 1;

      if (!handler) {
        const msg = `Entidade "${entityId}" não suportada em ${produto} — ignorado`;
        onProgress({ item: itemNum, total: orderedRecords.length, entityId, status: 'skipped', message: msg });
        results.push({ item: itemNum, entityId, status: 'skipped', message: msg });
        continue;
      }

      // Identifica o valor principal do registro para o log
      const displayVal =
        record.enq_codigo || record.arco_nome || record.motivo_codigo ||
        record.tafer_codigo || record.tarja_nome || record.reg_nome ||
        record.forma_nome || record.seq_codigo || record.layout_nome ||
        record.area_nome || record.grupo_nome || record.equip_codigo ||
        record.faixa_codigo || record.veiculo_placa || record.fab_nome ||
        record.tipo_nome || record.modelo_nome ||
        record['Nome'] || record['Código'] || record['Placa'] || '...';

      onProgress({ item: itemNum, total: orderedRecords.length, entityId, status: 'running',
        message: `Cadastrando ${entityId}: "${displayVal}"...` });

      try {
        const result = await handler(page, record, url);
        onProgress({ item: itemNum, total: orderedRecords.length, entityId, status: result.status, message: result.message });
        results.push({ item: itemNum, entityId, status: result.status, message: result.message });
      } catch (err) {
        const msg = err.message;
        onProgress({ item: itemNum, total: records.length, entityId, status: 'error', message: msg });
        results.push({ item: itemNum, entityId, status: 'error', message: msg });
      }

      // Pausa entre registros
      // Pausa entre registros
      if (i < orderedRecords.length - 1) await new Promise(r => setTimeout(r, 1500));
    }
  } finally {
    await browser.close().catch(() => {});
  }

  return results;
}
