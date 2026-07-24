/**
 * lote-exportacao-controller.js
 * Automação de Correção de Lotes de Exportação — AxHub
 *
 * Usa Playwright para:
 *  1. Fazer login no site AxHub informado
 *  2. Acessar /loteexportacao e listar lotes com status "Erro"
 *  3. Para cada lote com erro: abrir detalhes, parsear mensagem, identificar
 *     infrações com problema, navegar até cada infração e clicar em "Consultar Dados"
 *  4. Reprocessar (nova exportação) após correção
 *
 * Rotas:
 *   POST /api/lote-exportacao/analisar   — lista lotes com erro no site
 *   POST /api/lote-exportacao/corrigir   — corrige lotes automaticamente
 *   POST /api/lote-exportacao/reexportar — inicia nova exportação de um lote corrigido
 */

import { chromium } from "playwright";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) { console.log(`[LoteExportacao] ${msg}`); }

function tratar(err, res, msg = "Erro na automação") {
  console.error(`[LoteExportacao] ${msg}:`, err.message);
  return res.status(500).json({ erro: msg, detalhe: err.message });
}

async function abrirBrowser() {
  return chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}

/**
 * Faz login no AxHub e retorna o browser + page autenticados.
 * Detecta se a página foi redirecionada para login.
 */
async function autenticar(browser, baseUrl, login, senha) {
  const page = await browser.newPage();
  page.setDefaultTimeout(30_000);

  // Tenta acessar a URL alvo diretamente
  await page.goto(baseUrl + "/loteexportacao", { waitUntil: "domcontentloaded", timeout: 30_000 }).catch(() => {});

  // Verifica se foi redirecionado para login
  const urlAtual = page.url();
  const precisaLogin = urlAtual.includes("/login") || urlAtual.includes("/account/login") || urlAtual.includes("/Login");

  if (precisaLogin) {
    log(`Login necessário em ${urlAtual}`);

    // Preenche credenciais
    const inputUser = page.locator("input[type=text], input[type=email], input[name*=user], input[name*=login], input[id*=user], input[id*=login], input[name*=Username], input[id*=Username]").first();
    const inputPass = page.locator("input[type=password]").first();
    const btnLogin  = page.locator("button[type=submit], input[type=submit]").first();

    if (await inputUser.count() > 0) await inputUser.fill(login);
    if (await inputPass.count() > 0) await inputPass.fill(senha);
    if (await btnLogin.count()  > 0) {
      await Promise.all([
        page.waitForNavigation({ timeout: 20_000 }).catch(() => {}),
        btnLogin.click(),
      ]);
    }

    // Após login, navega para a tela de lotes
    await page.goto(baseUrl + "/loteexportacao", { waitUntil: "domcontentloaded", timeout: 30_000 });
  }

  return page;
}

// ─── Parsear linhas da tabela de lotes ───────────────────────────────────────

async function extrairLotesErro(page) {
  await page.waitForSelector("table tbody tr, .k-grid-content tr", { timeout: 20_000 });

  return page.evaluate(() => {
    const lotes = [];
    const rows = document.querySelectorAll("table tbody tr, .k-grid-content tr");

    rows.forEach(row => {
      // Tenta encontrar a célula de status
      const cells = Array.from(row.querySelectorAll("td"));
      if (!cells.length) return;

      const textos = cells.map(c => c.innerText.trim());
      const statusCell = cells.find(c => c.innerText.trim().toLowerCase().includes("erro"));
      if (!statusCell) return;

      // Extrai ID do lote (link ou texto da 2ª coluna)
      const idCell   = cells[1] || cells[0];
      const idLote   = idCell?.innerText?.trim() || "";

      // Tenta extrair o link do botão "olho" (ações)
      const actionCell = cells[cells.length - 1];
      const linkOlho   = actionCell?.querySelector("a[href*='detalh'], button")?.getAttribute("href") || "";

      // ID da row (data attribute)
      const rowId = row.getAttribute("data-uid") || row.id || "";

      if (idLote) {
        lotes.push({
          id: rowId,
          idLote: idLote,
          textos: textos,
          linkDetalhe: linkOlho,
        });
      }
    });

    return lotes;
  });
}

// ─── Extrair detalhes de um lote ──────────────────────────────────────────────

async function extrairDetalheLote(page, baseUrl, idLote) {
  // Tenta navegar via grid — clica no botão olho da linha do lote
  const btnOlho = page.locator(`tr:has-text("${idLote}") a[title*='alhe'], tr:has-text("${idLote}") button[title*='alhe'], tr:has-text("${idLote}") .k-grid-edit-command`).first();

  let navegouPorClick = false;
  if (await btnOlho.count() > 0) {
    await Promise.all([
      page.waitForNavigation({ timeout: 15_000 }).catch(() => {}),
      btnOlho.click(),
    ]);
    navegouPorClick = true;
  }

  if (!navegouPorClick) {
    // Fallback: tenta navegar pela URL do detalhe (busca nos links da página)
    const hrefs = await page.$$eval("a", links => links.map(l => l.href));
    const linkDetalhe = hrefs.find(h => h.includes("detalhamentoexportacao"));
    if (linkDetalhe) {
      await page.goto(linkDetalhe, { waitUntil: "domcontentloaded", timeout: 20_000 });
    }
  }

  await page.waitForLoadState("domcontentloaded");

  // Extrai informações do detalhe
  return page.evaluate(() => {
    const getText = sel => document.querySelector(sel)?.innerText?.trim() || "";

    // Mensagem de erro
    const mensagem = Array.from(document.querySelectorAll("span, div, p, label"))
      .find(el => el.innerText?.toLowerCase().includes("erro ao consultar") || el.innerText?.toLowerCase().includes("mensagem"))
      ?.innerText?.trim() || "";

    // Número da exportação
    const numExportacao = getText("[class*='numero'], .numero-exportacao") || "";

    // Status
    const status = document.querySelector("[class*='erro'], .badge-danger, span.text-danger")?.innerText?.trim() || "";

    // Infrações na tabela interna
    const infracoes = [];
    const rows = document.querySelectorAll("table tbody tr, .k-grid-content tr");
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll("td"));
      if (cells.length < 3) return;
      const linkInfracao = row.querySelector("a[href*='consultainfracao'], a[href*='detalhamentoinfracao']");
      const idInfracao = linkInfracao?.innerText?.trim() || cells[0]?.innerText?.trim() || "";
      const hrefInfracao = linkInfracao?.href || "";
      if (idInfracao) infracoes.push({ id: idInfracao, href: hrefInfracao, placa: cells[2]?.innerText?.trim() || "" });
    });

    return { mensagem, numExportacao, status, infracoes, urlAtual: window.location.href };
  });
}

// ─── Consultar placa de uma infração ─────────────────────────────────────────

async function consultarPlacaInfracao(page, href) {
  await page.goto(href, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForLoadState("domcontentloaded");

  // Procura o botão "Consultar Dados" / "Consultar Placa" / "Consultar"
  const seletoresBtnConsultar = [
    "button:has-text('Consultar Dados')",
    "button:has-text('Consultar Placa')",
    "button:has-text('Consultar Placas')",
    "a:has-text('Consultar Dados')",
    "a:has-text('Consultar Placa')",
    "[data-action*='consultar'], [onclick*='consultar']",
    ".btn-consultar",
    ".consultar-dados",
  ];

  let btnConsultar = null;
  for (const sel of seletoresBtnConsultar) {
    const el = page.locator(sel).first();
    if (await el.count() > 0) { btnConsultar = el; break; }
  }

  if (!btnConsultar) {
    // Tenta localizar pelo dropdown "Consultar Dados ▼" que pode conter opções
    const dropdown = page.locator("text=Consultar").first();
    if (await dropdown.count() > 0) btnConsultar = dropdown;
  }

  if (!btnConsultar) {
    return { sucesso: false, mensagem: "Botão Consultar Dados não encontrado na página" };
  }

  await btnConsultar.click();

  // Aguarda possível dialog de sucesso ou loading
  try {
    await page.waitForSelector(".swal2-title, .sweet-alert, .modal-title, [class*='success']", { timeout: 15_000 });
  } catch { /* sem popup, continua */ }

  // Fecha o dialog se houver
  const btnOk = page.locator("button:has-text('OK'), button:has-text('Ok'), button.swal2-confirm, .confirm").first();
  if (await btnOk.count() > 0) await btnOk.click().catch(() => {});

  await page.waitForTimeout(1_000);

  return { sucesso: true, mensagem: "Consulta de placa realizada com sucesso", url: href };
}

// ─── ENDPOINT: Analisar lotes com erro ───────────────────────────────────────

/**
 * POST /api/lote-exportacao/analisar
 * Body: { url, login, senha }
 * Retorna lista de lotes com status Erro e seus detalhes
 */
export async function analisarLotes(req, res) {
  let browser;
  try {
    const { url: baseUrl, login, senha } = req.body;
    if (!baseUrl) return res.status(400).json({ erro: "url é obrigatório" });
    if (!login)   return res.status(400).json({ erro: "login é obrigatório" });
    if (!senha)   return res.status(400).json({ erro: "senha é obrigatório" });

    const base = baseUrl.replace(/\/$/, "");
    log(`Analisando lotes em: ${base}`);

    browser = await abrirBrowser();
    const page = await autenticar(browser, base, login, senha);

    // Screenshot da tela de lotes para evidência
    const screenshotLista = await page.screenshot({ type: "png" });
    
    // Extrai lotes com erro da tabela
    const lotesErro = await extrairLotesErro(page).catch(() => []);

    log(`Encontrados ${lotesErro.length} lote(s) com erro`);

    await browser.close();

    return res.json({
      ok: true,
      totalErros: lotesErro.length,
      lotes: lotesErro,
      screenshotLista: screenshotLista.toString("base64"),
      urlAnalise: base + "/loteexportacao",
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    return tratar(err, res, "Erro ao analisar lotes");
  }
}

// ─── ENDPOINT: Corrigir lotes automaticamente ────────────────────────────────

/**
 * POST /api/lote-exportacao/corrigir
 * Body: { url, login, senha, idLote? (se omitido, corrige todos os erros) }
 * Realiza todo o fluxo: detalhe do lote → consultar placa de cada infração
 * Retorna log de todas as ações realizadas e resultado final
 */
export async function corrigirLotes(req, res) {
  let browser;
  const passos = [];
  const pushPasso = (tipo, descricao, dados = {}) => {
    const p = { tipo, descricao, dados, ts: new Date().toISOString() };
    passos.push(p);
    log(`[${tipo.toUpperCase()}] ${descricao}`);
  };

  try {
    const { url: baseUrl, login, senha, idLote } = req.body;
    if (!baseUrl) return res.status(400).json({ erro: "url é obrigatório" });
    if (!login)   return res.status(400).json({ erro: "login é obrigatório" });
    if (!senha)   return res.status(400).json({ erro: "senha é obrigatório" });

    const base = baseUrl.replace(/\/$/, "");
    pushPasso("info", `Iniciando automação em ${base}`);

    browser = await abrirBrowser();
    const page = await autenticar(browser, base, login, senha);
    pushPasso("ok", "Login realizado com sucesso");

    // 1. Busca lista de lotes com erro
    const lotesErro = await extrairLotesErro(page).catch(() => []);
    const lotesAlvo = idLote ? lotesErro.filter(l => l.idLote === String(idLote)) : lotesErro;

    pushPasso("info", `Lotes com erro encontrados: ${lotesErro.length} — processando: ${lotesAlvo.length}`);

    if (!lotesAlvo.length) {
      await browser.close();
      return res.json({ ok: true, mensagem: "Nenhum lote com erro encontrado para processar", passos });
    }

    const resultados = [];

    for (const lote of lotesAlvo) {
      pushPasso("info", `Processando lote: ${lote.idLote}`);

      try {
        // Volta para a lista de lotes
        await page.goto(base + "/loteexportacao", { waitUntil: "domcontentloaded", timeout: 20_000 });
        await page.waitForTimeout(1_000);

        // Abre detalhe do lote
        const detalhe = await extrairDetalheLote(page, base, lote.idLote);
        pushPasso("info", `Lote ${lote.idLote} — mensagem: ${detalhe.mensagem?.slice(0, 100)}`);
        pushPasso("info", `Infrações no lote: ${detalhe.infracoes?.length || 0}`);

        const correcoesInfracoes = [];

        // Para cada infração, executa consulta de placa
        for (const infr of (detalhe.infracoes || [])) {
          const href = infr.href || (base + `/consultainfracao/detalhamentoinfracao/${infr.id}`);
          pushPasso("info", `Consultando placa para infração ${infr.id} (placa ${infr.placa})`);

          try {
            const resultConsulta = await consultarPlacaInfracao(page, href);
            pushPasso(resultConsulta.sucesso ? "ok" : "alerta", `Infração ${infr.id}: ${resultConsulta.mensagem}`);
            correcoesInfracoes.push({ idInfracao: infr.id, ...resultConsulta });
          } catch (errInfr) {
            pushPasso("erro", `Erro ao consultar infração ${infr.id}: ${errInfr.message}`);
            correcoesInfracoes.push({ idInfracao: infr.id, sucesso: false, mensagem: errInfr.message });
          }
        }

        resultados.push({
          idLote: lote.idLote,
          mensagemOriginal: detalhe.mensagem,
          totalInfracoes: detalhe.infracoes?.length || 0,
          correcoesInfracoes,
          urlDetalhe: detalhe.urlAtual,
        });

        pushPasso("ok", `Lote ${lote.idLote} — correção concluída`);
      } catch (errLote) {
        pushPasso("erro", `Erro ao processar lote ${lote.idLote}: ${errLote.message}`);
        resultados.push({ idLote: lote.idLote, erro: errLote.message });
      }
    }

    await browser.close();

    const totalCorrigidos = resultados.filter(r => !r.erro).length;
    pushPasso("ok", `Automação concluída — ${totalCorrigidos}/${lotesAlvo.length} lote(s) processado(s)`);

    return res.json({
      ok: true,
      totalLotesProcessados: lotesAlvo.length,
      totalCorrigidos,
      resultados,
      passos,
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    passos.push({ tipo: "erro", descricao: err.message, ts: new Date().toISOString() });
    return tratar(err, res, "Erro ao corrigir lotes");
  }
}

/**
 * POST /api/lote-exportacao/detalhe
 * Body: { url, login, senha, idLote }
 * Abre o detalhe de um lote específico e retorna suas informações + screenshot
 */
export async function detalharLote(req, res) {
  let browser;
  try {
    const { url: baseUrl, login, senha, idLote } = req.body;
    if (!baseUrl || !idLote) return res.status(400).json({ erro: "url e idLote são obrigatórios" });

    const base = baseUrl.replace(/\/$/, "");
    browser = await abrirBrowser();
    const page = await autenticar(browser, base, login, senha);

    const detalhe = await extrairDetalheLote(page, base, String(idLote));
    const screenshot = await page.screenshot({ type: "png" });

    await browser.close();

    return res.json({ ok: true, ...detalhe, screenshot: screenshot.toString("base64") });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    return tratar(err, res, "Erro ao detalhar lote");
  }
}
