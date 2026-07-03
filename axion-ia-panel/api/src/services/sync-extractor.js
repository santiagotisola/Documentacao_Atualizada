/**
 * Sync Extractor
 * Extrai registros de um sistema de origem (AxHub ou AxCross)
 * para usar como dados de cadastro em um sistema de destino.
 */

import { connect as realBrowserConnect } from 'puppeteer-real-browser';

// ── Credenciais por siteId ──────────────────────────────────────
function getSiteConfig(siteId) {
  const configs = {
    'axhub-homo-admin': {
      produto: 'axhub',
      url:     process.env.AXHUB_BASE_URL || 'https://homologacao.axhub.axion.ws',
      login:   process.env.AXHUB_LOGIN_ADMIN  || 'Admin',
      senha:   process.env.AXHUB_SENHA_ADMIN  || '',
    },
    'axhub-homo-suporte': {
      produto: 'axhub',
      url:     process.env.AXHUB_BASE_URL || 'https://homologacao.axhub.axion.ws',
      login:   process.env.AXHUB_LOGIN_SUPORTE || 'suporte@axiontecnologia.com.br',
      senha:   process.env.AXHUB_SENHA_SUPORTE || '',
    },
    'axcross-homo': {
      produto: 'axcross',
      url:     process.env.AXCROSS_BASE_URL || 'https://homologacao.axcross.axion.ws',
      login:   process.env.AXCROSS_LOGIN   || 'suporte@axiontecnologia.com.br',
      senha:   process.env.AXCROSS_SENHA   || '',
    },
    'axcross-detranpi': {
      produto: 'axcross',
      url:     process.env.AXCROSS_DETRANPI_URL || process.env.AXCROSS_BASE_URL || '',
      login:   process.env.AXCROSS_LOGIN_DETRANPI || '',
      senha:   process.env.AXCROSS_SENHA_DETRANPI || '',
    },
    // Segundo ambiente AxCross (teste: aponta para homologação com perfil Admin)
    'axcross-homo-b': {
      produto: 'axcross',
      url:     process.env.AXCROSS_BASE_URL || 'https://homologacao.axcross.axion.ws',
      login:   process.env.AXCROSS_LOGIN || 'suporte@axiontecnologia.com.br',
      senha:   process.env.AXCROSS_SENHA || '',
    },
  };
  return configs[siteId] || null;
}

// ── Entidades disponíveis por produto ───────────────────────────
const ENTITIES = {
  axhub: [
    // ── Cadastros Básicos (Equipamentos)
    { id: 'fabricante',  label: 'Fabricantes',          group: 'equip', dep: [],                              path: '/fabricante',          chave: 'fab_nome' },
    { id: 'tipo',        label: 'Tipos de Equip.',      group: 'equip', dep: [],                              path: '/tipoequipamento',     chave: 'tipo_nome' },
    { id: 'modelo',      label: 'Modelos',              group: 'equip', dep: ['fabricante'],                  path: '/modeloequipamento',   chave: 'modelo_nome' },
    { id: 'grupo',       label: 'Grupos',               group: 'equip', dep: [],                              path: '/grupoequipamento',    chave: 'grupo_nome' },
    { id: 'equipamento', label: 'Equipamentos',         group: 'equip', dep: ['modelo','tipo','grupo'],        path: '/equipamento',         chave: 'equip_codigo' },
    { id: 'faixa',       label: 'Faixas',               group: 'equip', dep: ['equipamento'],                 path: '/faixa',               chave: 'faixa_codigo' },
    // ── Administração (cadastros independentes)
    { id: 'enquadramento',         label: 'Enquadramentos',        group: 'admin', dep: [],                              path: '/enquadramento',         chave: 'enq_codigo' },
    { id: 'arco',                  label: 'Arcos',                 group: 'admin', dep: [],                              path: '/arco',                  chave: 'arco_nome' },
    { id: 'motivo',                label: 'Motivos de Descarte',   group: 'admin', dep: [],                              path: '/motivodescarte',        chave: 'motivo_codigo' },
    { id: 'tip-afer',              label: 'Tipos de Aferição',    group: 'admin', dep: [],                              path: '/tipoafericao',          chave: 'tafer_codigo' },
    { id: 'tarja',                 label: 'Tarjas',                group: 'admin', dep: [],                              path: '/tarja',                 chave: 'tarja_nome' },
    { id: 'regiao',                label: 'Regiões',               group: 'admin', dep: [],                              path: '/regiao',                chave: 'reg_nome' },
    { id: 'forma-aut',             label: 'Formas de Autuação',   group: 'admin', dep: [],                              path: '/formaautuacao',         chave: 'forma_nome' },
    { id: 'sequencial',            label: 'Sequenciais',           group: 'admin', dep: [],                              path: '/sequencialinfracao',    chave: 'seq_codigo' },
    // ── Veículos
    { id: 'classif-veiculo',       label: 'Classificações',        group: 'veiculo', dep: [],   path: '/classificacaoveiculo',  chave: 'cv_codigo' },
    { id: 'modelo-veiculo',        label: 'Modelos de Veículos',   group: 'veiculo', dep: [],   path: '/modeloveiculo',         chave: 'modv_nome' },
    { id: 'marca-veiculo',         label: 'Marcas',                group: 'veiculo', dep: [],   path: '/marcaveiculo',          chave: 'mv_nome' },
    { id: 'tipo-veiculo',          label: 'Tipos',                 group: 'veiculo', dep: [],   path: '/tipoveiculo',           chave: 'tv_nome' },
    { id: 'categ-veiculo',         label: 'Categorias',            group: 'veiculo', dep: [],   path: '/categoriaveiculo',      chave: 'catv_nome' },
    { id: 'especie-veiculo',       label: 'Espécies',             group: 'veiculo', dep: [],   path: '/especieveiculo',        chave: 'espv_nome' },
    { id: 'cor-veiculo',           label: 'Cores',                 group: 'veiculo', dep: [],   path: '/cor',                   chave: 'cor_nome' },
    { id: 'municipio',             label: 'Municípios',           group: 'veiculo', dep: [],   path: '/municipio',             chave: 'mun_nome' },
    // ── Operações
    { id: 'operacao',              label: 'Operações',            group: 'operacao', dep: ['equipamento'], path: '/operacao',      chave: 'op_codigo' },
    // ── Medição
    { id: 'contrato',              label: 'Contratos',             group: 'medicao', dep: [],   path: '/contrato',              chave: 'cont_nome' },
    { id: 'recurso-op',            label: 'Recursos',              group: 'medicao', dep: [],   path: '/recursooperacao',       chave: 'rec_nome' },
    { id: 'interrupcao-op',        label: 'Interrupções',         group: 'medicao', dep: [],   path: '/interrupcaooperacao',   chave: 'int_nome' },
    { id: 'indice-perf',           label: 'Índices Performance',  group: 'medicao', dep: [],   path: '/indiceperformance',     chave: 'ind_nome' },
    // ── Controle de Acesso
    { id: 'perfil-acesso',         label: 'Perfis de Acesso',      group: 'acesso',  dep: [],   path: '/perfilacesso',          chave: 'perfil_nome' },
    { id: 'usuario',               label: 'Usuários',             group: 'acesso',  dep: [],   path: '/usuario',               chave: 'user_login' },
    { id: 'permissao',             label: 'Permissões',           group: 'acesso',  dep: ['perfil-acesso'], path: '/permissao', chave: 'perm_nome' },
    // ── Administração (dependentes / requerem atenção especial)
    { id: 'vinculo-enquadramento', label: 'Vínculos Enquadramento', group: 'admin', dep: ['enquadramento'],               path: '/vinculoenquadramento',  chave: 'enq_codigo',  manual: true },
    { id: 'layout',                label: 'Layouts de Exportação', group: 'admin', dep: ['enquadramento','forma-aut'],    path: '/layoutarquivo',         chave: 'layout_nome', manual: true },
    // Itens adicionais do menu Administração
    { id: 'configuracao',          label: 'Configurações',         group: 'admin', dep: [],                               path: '/configuracao',           chave: 'conf_nome',   manual: true },
    { id: 'num-lote',              label: 'Numeração de Lotes',    group: 'admin', dep: [],                               path: '/numeracaolote',          chave: 'lote_codigo', manual: true },
    { id: 'num-infracao',          label: 'Numeração de Infrações',group: 'admin', dep: [],                               path: '/numeracaoinfracao',      chave: 'inf_codigo',  manual: true },
    { id: 'tipo-imagem',           label: 'Tipos de Imagens',      group: 'admin', dep: [],                               path: '/tipoimagem',             chave: 'ti_nome',     manual: true },
    { id: 'powerbi',               label: 'Cadastro Power BI',     group: 'admin', dep: [],                               path: '/powerbi',                chave: 'pbi_nome',    manual: true },
    { id: 'webhook',               label: 'Webhooks',              group: 'admin', dep: [],                               path: '/webhook',                chave: 'wh_url',      manual: true },
  ],
  axcross: [
    { id: 'area',        label: 'Áreas',               path: '/equipments/area',               chave: 'area_nome' },
    { id: 'grupo',       label: 'Grupos de Equip.',    path: '/equipments/equipmentgroup',      chave: 'grupo_nome' },
    { id: 'equipamento', label: 'Equipamentos',        path: '/equipments/equipment',           chave: 'equip_codigo' },
    { id: 'faixa',       label: 'Faixas de Lane',      path: '/equipments/equipment/lane',      chave: 'faixa_codigo' },
    { id: 'veiculo',     label: 'Veículos Monitorados',path: '/occurrences/monitoredvehicle',   chave: 'veiculo_placa' },
  ],
};

// ── Mapeamento header → chave do executor ───────────────────────
// Normaliza o header e retorna a chave do executor correspondente
function mapHeader(header, entityId, produto) {
  const h = header.toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')  // remove acentos
    .replace(/[^a-z0-9\s]/g, '').trim();

  const maps = {
    axcross: {
      area:        { nome: 'area_nome', codigo: 'area_codigo', cor: 'area_cor' },
      grupo:       { nome: 'grupo_nome' },
      equipamento: { codigo: 'equip_codigo', 'numero de serie': 'equip_serie', 'codigo externo': 'equip_codigo_externo', lat: 'equip_lat', lng: 'equip_lng' },
      faixa:       { codigo: 'faixa_codigo', numero: 'faixa_numero', logradouro: 'faixa_logradouro', complemento: 'faixa_complemento', bairro: 'faixa_bairro', cidade: 'faixa_cidade', estado: 'faixa_uf', uf: 'faixa_uf' },
      veiculo:     { placa: 'veiculo_placa', 'tipo de ocorrencia': 'veiculo_tipo_ocorrencia', vigencia: 'veiculo_vigencia' },
    },
    axhub: {
      // Cadastros básicos — Equipamentos
      fabricante:              { nome: 'fab_nome', slug: 'fab_slug', codigo: 'fab_slug' },
      tipo:                    { nome: 'tipo_nome' },
      modelo:                  { modelo: 'modelo_nome', marca: 'fab_nome', portaria: 'modelo_portaria', 'numero portaria': 'modelo_portaria' },
      grupo:                   { nome: 'grupo_nome' },
      equipamento:             { codigo: 'equip_codigo', 'numero de serie': 'equip_serie', serie: 'equip_serie' },
      faixa:                   { codigo: 'faixa_codigo', numero: 'faixa_numero', logradouro: 'faixa_logradouro', bairro: 'faixa_bairro', municipio: 'faixa_cidade', uf: 'faixa_uf' },
      // Administração
      enquadramento:           { codigo: 'enq_codigo', descricao: 'enq_descricao', velocidade: 'enq_velocidade', 'velocidade permitida': 'enq_velocidade', 'vel permitida': 'enq_velocidade' },
      'vinculo-enquadramento': { enquadramento: 'enq_codigo', modelo: 'modelo_nome', fabricante: 'fab_nome', codigo: 'enq_codigo', 'enquadramento codigo': 'enq_codigo' },
      arco:                    { nome: 'arco_nome', localizacao: 'arco_localizacao', codigo: 'arco_nome', logradouro: 'arco_localizacao' },
      motivo:                  { codigo: 'motivo_codigo', descricao: 'motivo_descricao', nome: 'motivo_codigo' },
      'tip-afer':              { codigo: 'tafer_codigo', descricao: 'tafer_descricao', validade: 'tafer_validade', 'validade meses': 'tafer_validade', 'validade em meses': 'tafer_validade' },
      tarja:                   { nome: 'tarja_nome', codigo: 'tarja_codigo', largura: 'tarja_largura', altura: 'tarja_altura', 'tamanho fonte': 'tarja_tamanho_fonte', 'tamanho da fonte': 'tarja_tamanho_fonte', template: 'tarja_template', 'posicao tarja': 'tarja_posicao', posicao: 'tarja_posicao' },
      regiao:                  { nome: 'reg_nome', uf: 'reg_uf', descricao: 'reg_descricao', estado: 'reg_uf' },
      'forma-aut':             { nome: 'forma_nome', descricao: 'forma_descricao', tipo: 'forma_tipo' },
      layout:                  { nome: 'layout_nome', tipo: 'layout_tipo', descricao: 'layout_nome' },
      sequencial:              { codigo: 'seq_codigo', prefixo: 'seq_prefixo', 'numero inicial': 'seq_num_inicial', 'proximo numero': 'seq_num_inicial', 'numero atual': 'seq_num_inicial' },
      // Itens adicionais do menu Administração
      configuracao:            { nome: 'conf_nome', valor: 'conf_valor', descricao: 'conf_descricao', chave: 'conf_nome', tipo: 'conf_tipo' },
      'num-lote':              { codigo: 'lote_codigo', numero: 'lote_numero', prefixo: 'lote_prefixo', descricao: 'lote_codigo', 'numero atual': 'lote_numero' },
      'num-infracao':          { codigo: 'inf_codigo', numero: 'inf_numero', prefixo: 'inf_prefixo', descricao: 'inf_codigo', 'numero atual': 'inf_numero' },
      'tipo-imagem':           { nome: 'ti_nome', codigo: 'ti_codigo', descricao: 'ti_descricao' },
      powerbi:                 { nome: 'pbi_nome', url: 'pbi_url', descricao: 'pbi_descricao', relatorio: 'pbi_nome', 'nome relatorio': 'pbi_nome' },
      webhook:                 { url: 'wh_url', uri: 'wh_url', nome: 'wh_nome', evento: 'wh_evento', descricao: 'wh_nome', 'url destino': 'wh_url', 'uniform resource identifier': 'wh_url', ativo: 'wh_ativo' },
      'classif-veiculo':       { codigo: 'cv_codigo', descricao: 'cv_descricao', 'label rede neural': 'cv_label', pbt: 'cv_pbt', uvp: 'cv_uvp', 'comprimento minimo': 'cv_comp_min', 'comprimento maximo': 'cv_comp_max', 'comprimento minimo do veiculo': 'cv_comp_min', 'comprimento maximo do veiculo': 'cv_comp_max' },
      'modelo-veiculo':        { nome: 'modv_nome', codigo: 'modv_codigo', descricao: 'modv_descricao' },
      'marca-veiculo':         { nome: 'mv_nome', codigo: 'mv_codigo', descricao: 'mv_nome' },
      'tipo-veiculo':          { nome: 'tv_nome', codigo: 'tv_codigo', descricao: 'tv_descricao' },
      'categ-veiculo':         { nome: 'catv_nome', codigo: 'catv_codigo', descricao: 'catv_descricao' },
      'especie-veiculo':       { nome: 'espv_nome', codigo: 'espv_codigo', descricao: 'espv_descricao' },
      'cor-veiculo':           { nome: 'cor_nome', codigo: 'cor_codigo', descricao: 'cor_descricao' },
      'municipio':             { nome: 'mun_nome', codigo: 'mun_codigo', estado: 'mun_estado', uf: 'mun_estado' },
      operacao:                { codigo: 'op_codigo', nome: 'op_nome', 'data inicio': 'op_data_inicio', 'data fim': 'op_data_fim', inicio: 'op_data_inicio', fim: 'op_data_fim', equipamento: 'equip_codigo' },
      contrato:                { nome: 'cont_nome', codigo: 'cont_codigo', 'data inicio': 'cont_data_inicio', 'data fim': 'cont_data_fim', descricao: 'cont_descricao' },
      'recurso-op':            { nome: 'rec_nome', codigo: 'rec_codigo', descricao: 'rec_descricao' },
      'interrupcao-op':        { nome: 'int_nome', codigo: 'int_codigo', descricao: 'int_descricao', motivo: 'int_motivo' },
      'indice-perf':           { nome: 'ind_nome', codigo: 'ind_codigo', descricao: 'ind_descricao', formula: 'ind_formula' },
      'perfil-acesso':         { nome: 'perfil_nome', codigo: 'perfil_codigo', descricao: 'perfil_desc' },
      usuario:                 { login: 'user_login', nome: 'user_nome', email: 'user_email', perfil: 'user_perfil', senha: 'user_senha' },
      permissao:               { nome: 'perm_nome', codigo: 'perm_codigo', descricao: 'perm_descricao' },
    },
  };
  const entityMap = maps[produto]?.[entityId] || {};
  return entityMap[h] || null;
}

// ── Extrai tabela de uma página ─────────────────────────────────
async function extractPageTable(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await new Promise(r => setTimeout(r, 2500)); // aguarda Kendo/Bootstrap renderizar

  // Extrai headers
  const headers = await page.evaluate(() => {
    const ths = document.querySelectorAll('th, .k-header');
    return Array.from(ths)
      .map(th => th.innerText.trim())
      .filter(t => t && t !== '' && t.toLowerCase() !== 'ações' && t.toLowerCase() !== 'actions');
  });

  // Extrai linhas da tabela
  const rows = await page.evaluate(() => {
    const tbodies = document.querySelectorAll('table tbody');
    const allRows = [];
    for (const tbody of tbodies) {
      for (const tr of tbody.querySelectorAll('tr')) {
        const cells = Array.from(tr.querySelectorAll('td'))
          .map(td => td.innerText.trim())
          .filter((_, i, arr) => i < arr.length - 1); // remove última coluna (ações)
        if (cells.some(c => c !== '')) allRows.push(cells);
      }
    }
    return allRows;
  });

  return { headers, rows, count: rows.length };
}

// ── Login por sistema ───────────────────────────────────────────
async function doLogin(page, config) {
  // Usa evaluate para preencher campos — evita problemas com teclado PT-BR e caracteres especiais (#, @, etc.)
  const fillInput = async (selector, value) => {
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.click(selector, { clickCount: 3 });
    await page.evaluate((sel, val) => {
      const el = document.querySelector(sel);
      if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, selector, value);
  };

  if (config.produto === 'axhub') {
    await page.goto(`${config.url}/Home/Login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.$eval('#Username', el => { el.value = ''; }).catch(() => {});
    await fillInput('#Username', config.login);
    await fillInput('#Password', config.senha);
    // Log do valor preenchido (sem expor a senha completa)
    const filledUser = await page.$eval('#Username', el => el.value).catch(() => '?');
    const filledPassLen = await page.$eval('#Password', el => el.value.length).catch(() => 0);
    console.log(`[doLogin] Preenchido: usuário="${filledUser}", senha=${filledPassLen} chars`);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1000));
    const url = page.url();
    console.log(`[doLogin] URL após submit: ${url}`);
    if (url.toLowerCase().includes('/home/login') || url.toLowerCase().includes('/login')) {
      // Captura mensagem de erro da página
      const errMsg = await page.evaluate(() => {
        const el = document.querySelector('.validation-summary-errors, .alert-danger, .text-danger, [class*="error"], [class*="Error"]');
        return el ? el.innerText.trim() : '';
      }).catch(() => '');
      throw new Error(`Login falhou — URL: ${url}${errMsg ? ` | Mensagem: ${errMsg}` : ''}`);
    }
  } else {
    // AxCross
    await page.goto(`${config.url}/account/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await new Promise(r => setTimeout(r, 1500));
    await fillInput('#Email', config.login);
    await fillInput('#Password', config.senha);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));
    const url = page.url();
    if (url.includes('/account/login')) {
      throw new Error('Login falhou — verifique as credenciais do AxCross');
    }
  }
}

// ── Peek: conta registros por entidade no destino (sem extrair tudo) ───
export async function peekSite(entityIds, inlineConfig) {
  if (!inlineConfig?.login || !inlineConfig?.senha) throw new Error('Credenciais obrigatórias para peek');

  const config = inlineConfig;
  const allEntities = ENTITIES[config.produto] || [];
  const entities = entityIds
    ? allEntities.filter(e => entityIds.includes(e.id))
    : allEntities;

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

  try {
    await doLogin(page, config);

    const counts = {};
    for (const entity of entities) {
      try {
        await page.goto(`${config.url}${entity.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await new Promise(r => setTimeout(r, 500));
        const count = await page.evaluate(() => {
          const tbodies = document.querySelectorAll('table tbody');
          let total = 0;
          for (const tbody of tbodies) {
            total += Array.from(tbody.querySelectorAll('tr'))
              .filter(tr => tr.querySelectorAll('td').length > 1).length;
          }
          return total;
        });
        // Pega os primeiros 3 nomes/códigos para referência visual
        const sample = await page.evaluate(() => {
          const firstTbody = document.querySelector('table tbody');
          if (!firstTbody) return [];
          return Array.from(firstTbody.querySelectorAll('tr'))
            .slice(0, 3)
            .map(tr => {
              const tds = tr.querySelectorAll('td');
              return tds[0]?.innerText?.trim() || '';
            })
            .filter(Boolean);
        });
        counts[entity.id] = { count, sample, label: entity.label };
      } catch (e) {
        counts[entity.id] = { count: 0, sample: [], label: entity.label, error: e.message };
      }
    }
    return counts;
  } finally {
    await browser.close();
  }
}

// ── Extração principal ──────────────────────────────────────────
export async function extractFromSite(siteId, entityIds = null, onProgress = () => {}, inlineConfig = null) {
  // Aceita config inline (para sites de produção) com prioridade sobre env
  const config = inlineConfig || getSiteConfig(siteId);
  if (!config) throw new Error(`Site não encontrado: ${siteId}. Informe as credenciais manualmente.`);
  if (!config.login || !config.senha) throw new Error(`Credenciais não configuradas para ${siteId}`);

  const allEntities = ENTITIES[config.produto] || [];
  const entities = entityIds
    ? allEntities.filter(e => entityIds.includes(e.id))
    : allEntities;

  const total = entities.length + 1;
  let step = 0;
  const extracted = {};

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

  try {
    // Login
    onProgress({ step: ++step, total, label: 'Login', status: 'running', message: `Conectando a ${config.url}...` });
    await doLogin(page, config);
    onProgress({ step, total, label: 'Login', status: 'success', message: `Autenticado como ${config.login}` });

    // Extrai cada entidade
    for (const entity of entities) {
      onProgress({ step: ++step, total, label: entity.label, status: 'running', message: 'Carregando lista...' });
      try {
        const { headers, rows, count } = await extractPageTable(page, `${config.url}${entity.path}`);

        // Deep-extract para entidades que precisam de dados da página de edição
        let enrichedRows = rows;
        if (entity.id === 'tarja' && rows.length > 0) {
          try {
            // Busca edit links para capturar Template de cada tarja
            const editLinks = await page.evaluate((baseUrl) => {
              return Array.from(document.querySelectorAll('table tbody tr')).map(tr => {
                const link = tr.querySelector('td:last-child a[href*="edit"], td:last-child a[href*="Edit"]');
                return link ? (link.href.startsWith('http') ? link.href : `${baseUrl}${link.getAttribute('href')}`) : '';
              });
            }, config.url);
            enrichedRows = [];
            for (let ri = 0; ri < rows.length; ri++) {
              const editUrl = editLinks[ri];
              let extraTemplate = '', extraPosicaoText = '', extraLargura = '', extraAltura = '', extraFonte = '';
              if (editUrl) {
                await page.goto(editUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
                await new Promise(r => setTimeout(r, 600));
                const formData = await page.evaluate(() => ({
                  template:     document.querySelector('#Template')?.value || '',
                  posicaoText:  document.querySelector('#PosicaoTarja option:checked')?.text || '',
                  largura:      document.querySelector('#Largura')?.value || '',
                  altura:       document.querySelector('#Altura')?.value || '',
                  fonte:        document.querySelector('#TamanhoFonte')?.value || '',
                })).catch(() => ({}));
                extraTemplate = formData.template || '';
                extraPosicaoText = formData.posicaoText || '';
                extraLargura = formData.largura || '';
                extraAltura = formData.altura || '';
                extraFonte = formData.fonte || '';
              }
              enrichedRows.push([...rows[ri], extraTemplate, extraPosicaoText, extraLargura, extraAltura, extraFonte]);
            }
            // Navega de volta para a lista após deep-extract
            await page.goto(`${config.url}${entity.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
          } catch (deepErr) {
            console.warn(`[tarja] Deep-extract falhou: ${deepErr.message}`);
          }
        }

        // Cabeçalhos enriquecidos para tarja
        const fullHeaders = entity.id === 'tarja'
          ? [...headers, 'Template', 'PosicaoTarjaTexto', 'Largura', 'Altura', 'TamanhoFonte']
          : headers;
        const records = enrichedRows.map(cells => {
          const rec = { _raw: cells };
          fullHeaders.forEach((h, i) => {
            const key = mapHeader(h, entity.id, config.produto);
            if (key) rec[key] = cells[i] || '';
            else rec[`col_${i}`] = cells[i] || '';
          });
          return rec;
        });

        extracted[entity.id] = { headers: fullHeaders, rows: enrichedRows, records, count: enrichedRows.length, label: entity.label };
        onProgress({
          step, total, label: entity.label, status: 'success',
          message: `${count} registro(s) encontrado(s)`,
          data: { entityId: entity.id, headers, rows: rows.slice(0, 20), count },
        });
      } catch (e) {
        onProgress({ step, total, label: entity.label, status: 'warning', message: `Não extraído: ${e.message}` });
        extracted[entity.id] = { headers: [], rows: [], records: [], count: 0, label: entity.label, error: e.message };
      }
    }

    return { siteId, produto: config.produto, url: config.url, entities: extracted };
  } finally {
    await browser.close();
  }
}

// ── Constrói data para executor a partir de um record extraído ──
export function buildExecutorData(record, sourceProduto, destProduto, entityId, baseData = {}) {
  // Começa com defaults do destino
  const data = { ...baseData };

  // Copia todos os campos do record que são chaves de executor (não _raw, não col_X)
  for (const [k, v] of Object.entries(record)) {
    if (k.startsWith('_') || k.startsWith('col_')) continue;
    data[k] = v;
  }

  return data;
}

// ── Exporta lista de entidades por produto ──────────────────────
export function getEntitiesForProduct(produto) {
  return ENTITIES[produto] || [];
}

export { getSiteConfig, ENTITIES };
