/**
 * depara-equipamentos-controller.js  v3
 *
 * Estratégia otimizada baseada em inspeção real das páginas:
 *
 * AxHub  → /operacao
 *   Login: /Home/Login — botão #btn-login fica disabled por validação JS reativa
 *   Dados: GET /operacao/datahandler → JSON { Data: [{Equipamento:{Descricao:"PA001C"}, ...}], Total: N }
 *   Sem paginação necessária — retorna TODOS os registros de uma vez
 *
 * AxCross → /equipments/equipment/equipment
 *   Login: /account/login — e-mail + senha, botão habilitado imediatamente
 *   Dados: Kendo Grid HTML (tabela) — até confirmar endpoint JSON
 */

import { chromium } from "playwright";
import path from "path";
import os from "os";
import { existsSync } from "fs";

function log(msg) { console.log(`[DeparaEquip] ${msg}`); }
function tratar(err, res, msg = "Erro no depara") {
  console.error(`[DeparaEquip] ${msg}:`, err.message);
  return res.status(500).json({ erro: msg, detalhe: err.message });
}

// ─── Perfil Chrome real do usuário ────────────────────────────────────────────
function getChromePerfilDir() {
  if (process.platform === "win32") {
    // Usa LOCALAPPDATA se disponível (mais confiável no Windows)
    const localApp = process.env.LOCALAPPDATA;
    if (localApp) return path.join(localApp, "Google", "Chrome", "User Data");
    const user = os.userInfo().username;
    return `C:\\Users\\${user}\\AppData\\Local\\Google\\Chrome\\User Data`;
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", "Google", "Chrome");
  }
  return path.join(os.homedir(), ".config", "google-chrome");
}

// ─── Tenta buscar dados do AxHub usando o perfil Chrome real (com cookies) ────
async function buscarAxHubComPerfilChrome(baseUrl) {
  const perfilDir = getChromePerfilDir();
  if (!existsSync(perfilDir)) {
    log("Perfil Chrome não encontrado");
    return null;
  }

  log(`Tentando perfil Chrome: ${perfilDir}`);
  let ctx;
  const launchOpts = {
    headless: true,
    channel: "chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
    ignoreDefaultArgs: ["--enable-automation"],
    ignoreHTTPSErrors: true,
  };
  try {
    ctx = await chromium.launchPersistentContext(perfilDir, launchOpts);
  } catch (e1) {
    // Chrome pode estar aberto — usa tmpdir sem o SingletonLock
    log(`Perfil bloqueado (${e1.message.substring(0, 60)}) — copiando perfil`);
    try {
      const { mkdtempSync, cpSync, rmSync } = await import("fs");
      const tmpBase = path.join(os.tmpdir(), "axhub-profile-");
      const tmpDir  = mkdtempSync(tmpBase);
      cpSync(perfilDir, tmpDir, { recursive: true, filter: (s) => !s.includes("SingletonLock") && !s.includes("lockfile") });
      ctx = await chromium.launchPersistentContext(tmpDir, { ...launchOpts, channel: undefined });
    } catch (e2) {
      log(`Cópia também falhou: ${e2.message}`);
      return null;
    }
  }

  try {
    const page = await ctx.newPage();
    page.setDefaultTimeout(20_000);

    // Acessa /operacao — se já tem sessão, carrega direto
    await page.goto(baseUrl.replace(/\/$/, "") + "/operacao", { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForTimeout(2_000);

    const urlAtual = page.url();
    if (urlAtual.includes("login") || urlAtual.includes("nao-autorizado")) {
      log("Perfil Chrome: sessão expirada, não autenticado");
      await ctx.close();
      return null;
    }

    log(`Perfil Chrome: autenticado! URL: ${urlAtual}`);

    // Busca via datahandler JSON
    const resultado = await page.evaluate(async (base) => {
      try {
        const resp = await fetch(`${base}/operacao/datahandler`, {
          credentials: "include",
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
        if (!resp.ok) return { erro: `HTTP ${resp.status}` };
        const data = await resp.json();
        return { ok: true, data };
      } catch (e) {
        return { erro: e.message };
      }
    }, baseUrl.replace(/\/$/, ""));

    await ctx.close();

    if (!resultado.ok) {
      log(`Perfil Chrome: datahandler erro: ${resultado.erro}`);
      return null;
    }

    const raw = resultado.data?.Data || [];
    const equips = raw.map(e => ({
      codigo:      e.Equipamento?.Descricao || "",
      grupo:       e.GrupoEquipamento || "",
      fabricante:  e.FabricanteNome || "",
      homologacao: e.Homologacao ? "Homologado" : "",
      sistema:     "AxHub",
    })).filter(e => e.codigo);

    log(`Perfil Chrome: ${equips.length} equipamentos extraídos (total: ${resultado.data?.Total})`);
    return equips;
  } catch (e) {
    log(`Perfil Chrome erro: ${e.message}`);
    if (ctx) await ctx.close().catch(() => {});
    return null;
  }
}

async function abrirBrowser(headless = true) {
  try {
    return await chromium.launch({
      channel: "chrome",
      headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"],
      ignoreDefaultArgs: ["--enable-automation"],
    });
  } catch {
    return chromium.launch({
      headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage"],
    });
  }
}

// ─── Cria contexto de browser com cookies de sessão ──────────────────────────
async function criarContexto(browser) {
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    extraHTTPHeaders: { "Accept-Language": "pt-BR,pt;q=0.9" },
    viewport: { width: 1280, height: 720 },
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  });

  // Remove sinais de automação que o Cloudflare Turnstile detecta
  await ctx.addInitScript(() => {
    // Remove navigator.webdriver
    Object.defineProperty(navigator, "webdriver", { get: () => undefined, configurable: true });

    // Remove propriedades do Chrome que denunciam automação
    if (window.chrome) {
      window.chrome.runtime = {};
    } else {
      Object.defineProperty(window, "chrome", {
        writable: true, configurable: true,
        value: { runtime: {}, loadTimes: () => {}, csi: () => {}, app: {} },
      });
    }

    // Mascara plugins (browsers reais têm plugins, headless não)
    Object.defineProperty(navigator, "plugins", {
      get: () => ({ length: 3, item: () => null, namedItem: () => null }),
      configurable: true,
    });

    // Mascara languages
    Object.defineProperty(navigator, "languages", {
      get: () => ["pt-BR", "pt", "en-US", "en"],
      configurable: true,
    });

    // Remove sinais de automação no Permissions
    const originalQuery = window.navigator.permissions?.query?.bind(navigator.permissions);
    if (originalQuery) {
      navigator.permissions.query = (parameters) => {
        if (parameters.name === "notifications") {
          return Promise.resolve({ state: Notification.permission });
        }
        return originalQuery(parameters);
      };
    }
  });

  return ctx;
}

// ─── Login AxHub (ASP.NET MVC com botão reativo) ──────────────────────────────
/**
 * O formulário AxHub tem botão disabled até os campos serem preenchidos.
 * A validação é ativada por keydown/keyup events nativos.
 * Usa page.keyboard.type() que dispara todos os eventos de teclado.
 */
async function loginAxHub(context, base) {
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  const loginUrl = `${base}/Home/Login`;
  log(`AxHub: acessando ${loginUrl}`);
  await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.waitForTimeout(1_500);

  const urlAtual = page.url();

  // Detecta OIDC (Goiânia, Economia)
  if (urlAtual.includes(".id.axion.ws") || urlAtual.includes("identity")) {
    log("AxHub OIDC detectado");
    await page.locator('input[placeholder="Nome de usuário"], input[id="Input_Email"], input[type="text"]').first().fill(context._login || "").catch(() => {});
    await page.locator('input[type="password"]').first().fill(context._senha || "").catch(() => {});
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Fazer login"), button[type="submit"]').first().click();
    await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20_000 }).catch(() => {});
    return page;
  }

  // Login padrão ASP.NET com Cloudflare Turnstile
  // Estratégia:
  //  1. Aguarda o Turnstile resolver automaticamente (até 12 segundos)
  //  2. Extrai o token e o CSRF
  //  3. Faz POST direto via fetch (dentro do contexto do browser, com os cookies)
  log("AxHub ASP.NET: aguardando Cloudflare Turnstile (até 20s)...");

  let turnstileToken = "";
  let csrfToken      = "";
  for (let i = 0; i < 33; i++) {
    await page.waitForTimeout(600);
    const tokens = await page.evaluate(() => ({
      turnstile: document.querySelector('[name="cf-turnstile-response"]')?.value || "",
      csrf:      document.querySelector('[name="__RequestVerificationToken"]')?.value || "",
      btnEnabled: !document.querySelector('#btn-login')?.disabled,
      url: location.href,
    }));
    log(`  Turnstile [${i * 0.6}s]: token="${tokens.turnstile.substring(0, 15)}" btn=${tokens.btnEnabled}`);
    if (tokens.turnstile) {
      turnstileToken = tokens.turnstile;
      csrfToken      = tokens.csrf;
      break;
    }
  }

  if (!turnstileToken) {
    log("AxHub: Turnstile não resolveu — tentando sem token");
  } else {
    log(`AxHub: Turnstile resolvido (${turnstileToken.substring(0, 20)}...)`);
  }

  // POST direto com todos os campos obrigatórios
  const postResult = await page.evaluate(async ({ user, pass, turnstile, csrf, loginUrl }) => {
    const body = new URLSearchParams({
      Username: user,
      Password: pass,
      KeepConnected: "true",
    });
    if (turnstile) {
      body.set("cf-turnstile-response", turnstile);
      body.set("TurnstileToken", turnstile);
    }
    if (csrf) body.set("__RequestVerificationToken", csrf);

    try {
      const resp = await fetch(loginUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        redirect: "follow",
      });
      return { status: resp.status, url: resp.url, ok: resp.ok };
    } catch (e) {
      return { error: e.message };
    }
  }, { user: context._login, pass: context._senha, turnstile: turnstileToken, csrf: csrfToken, loginUrl });

  log(`AxHub POST login: status=${postResult.status} url=${postResult.url}`);

  // Navega para /operacao após o POST
  await page.goto(`${base}/operacao`, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.waitForTimeout(1_500);

  const urlFinal = page.url();
  if (urlFinal.includes("login") || urlFinal.includes("nao-autorizado")) {
    log(`AVISO: login pode ter falhado. URL: ${urlFinal}`);
  } else {
    log(`Login OK! URL: ${urlFinal}`);
  }

  return page;
}

// ─── Busca equipamentos AxHub via JSON API ────────────────────────────────────
/**
 * Usa o endpoint /operacao/datahandler que retorna JSON com TODOS os equipamentos.
 * Não precisa de paginação.
 */
async function buscarEquipamentosAxHub(page, base) {
  // Navega para /operacao para garantir que estamos no contexto certo
  const opUrl = `${base}/operacao`;
  if (!page.url().includes("/operacao")) {
    await page.goto(opUrl, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForTimeout(1_500);
  }

  // Chama o endpoint JSON via fetch (usa os cookies da sessão atual)
  const resultado = await page.evaluate(async (dataUrl) => {
    try {
      const resp = await fetch(dataUrl, { credentials: "include", headers: { "X-Requested-With": "XMLHttpRequest" } });
      if (!resp.ok) return { erro: `HTTP ${resp.status}`, url: resp.url };
      const data = await resp.json();
      return { ok: true, data };
    } catch (e) {
      return { erro: e.message };
    }
  }, `${base}/operacao/datahandler`);

  if (!resultado.ok) {
    log(`AxHub datahandler erro: ${resultado.erro} — fallback para HTML`);
    return await extrairEquipamentosHTML(page);
  }

  const raw = resultado.data?.Data || resultado.data?.data || [];
  log(`AxHub datahandler: ${raw.length} registros (total declarado: ${resultado.data?.Total})`);

  return raw.map(e => ({
    codigo:     e.Equipamento?.Descricao || e.CodigoEquipamento || e.Codigo || "",
    grupo:      e.GrupoEquipamento || e.Grupo || "",
    fabricante: e.FabricanteNome   || e.Fabricante || "",
    homologacao: e.Homologacao ? "Homologado" : "",
    sistema:    "AxHub",
  })).filter(e => e.codigo);
}

// ─── Fallback: extração HTML do Kendo Grid (paginado) ────────────────────────
async function extrairEquipamentosHTML(page) {
  await page.waitForSelector("table tbody tr", { timeout: 15_000 }).catch(() => {});

  // Tenta expandir para 100 por página via Kendo dropdown
  try {
    const dd = page.locator(".k-pager-sizes .k-dropdownlist").first();
    if (await dd.count() > 0) {
      await dd.click();
      await page.waitForTimeout(400);
      const opt100 = page.locator(".k-popup li:has-text('100'), .k-list-ul li:has-text('100')").first();
      if (await opt100.count() > 0) { await opt100.click(); await page.waitForTimeout(1_500); }
    }
  } catch { /* ignora */ }

  const todos = [];
  let pagina = 1;

  while (pagina <= 30) {
    await page.waitForTimeout(400);
    const linhas = await page.evaluate(() =>
      Array.from(document.querySelectorAll("table tbody tr")).map(r => {
        const cells = Array.from(r.querySelectorAll("td"));
        return cells[0]?.innerText?.trim()
          ? { codigo: cells[0].innerText.trim(), grupo: cells[1]?.innerText?.trim() || "", fabricante: cells[2]?.innerText?.trim() || "", sistema: "AxHub" }
          : null;
      }).filter(Boolean)
    );
    todos.push(...linhas);

    const next = page.locator(".k-pager-next:not(.k-state-disabled):not([disabled])").first();
    if (!await next.count() || await next.isDisabled().catch(() => true) || !linhas.length) break;
    await next.click();
    await page.waitForTimeout(1_000);
    pagina++;
  }

  const vistos = new Set();
  return todos.filter(e => { if (vistos.has(e.codigo)) return false; vistos.add(e.codigo); return true; });
}

// ─── Login AxCross ─────────────────────────────────────────────────────────────
/**
 * AxCross usa /account/login com e-mail + senha.
 * Botão "Entrar" está habilitado — login simples sem problema.
 */
async function loginAxCross(context, base) {
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  const targetUrl = `${base}/equipments/equipment/equipment`;
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.waitForTimeout(1_000);

  const urlAtual = page.url();
  if (!urlAtual.includes("login") && !urlAtual.includes("Login") && !urlAtual.includes("signin")) {
    log(`AxCross: já autenticado`);
    return page;
  }

  log(`AxCross: login em ${urlAtual}`);

  // AxCross usa e-mail + senha, botão habilitado
  const emailInput = page.locator('input[type="email"], input[type="text"]').first();
  const passInput  = page.locator('input[type="password"]').first();
  const btnLogin   = page.locator('button:has-text("Entrar"), button[type="submit"]').first();

  if (await emailInput.count() > 0) await emailInput.fill(context._login || "");
  if (await passInput.count()  > 0) await passInput.fill(context._senha || "");
  await page.waitForTimeout(300);

  if (await btnLogin.count() > 0) {
    await btnLogin.click();
  } else {
    await page.keyboard.press("Enter");
  }

  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1_500);

  if (!page.url().includes("/equipment")) {
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 20_000 }).catch(() => {});
  }

  return page;
}

// ─── Busca equipamentos AxCross ────────────────────────────────────────────────
async function buscarEquipamentosAxCross(page, base) {
  await page.waitForSelector("table tbody tr, .k-grid-content tr", { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1_000);

  // Tenta endpoint JSON
  const resultado = await page.evaluate(async () => {
    const endpoints = [
      "/equipments/equipment/equipment/datahandler",
      "/equipments/equipment/datahandler",
      "/equipment/datahandler",
    ];
    for (const ep of endpoints) {
      try {
        const r = await fetch(ep, { credentials: "include", headers: { "X-Requested-With": "XMLHttpRequest" } });
        if (r.ok) {
          const d = await r.json();
          if (d?.Data || d?.data || Array.isArray(d)) return { ok: true, ep, data: d };
        }
      } catch { /* continua */ }
    }
    return { ok: false };
  });

  if (resultado.ok) {
    const raw = resultado.data?.Data || resultado.data?.data || (Array.isArray(resultado.data) ? resultado.data : resultado.data?.Items || []);
    log(`AxCross datahandler (${resultado.ep}): ${raw.length} registros`);
    return raw.map(e => ({
      // AxCross usa EquipmentCode (confirmado via inspeção ao vivo)
      codigo:     e.EquipmentCode || e.Equipamento?.Descricao || e.CodigoEquipamento || e.Codigo || e.Nome || "",
      descricao:  e.Local || e.Descricao || e.GrupoEquipamento || "",
      sistema:    "AxCross",
    })).filter(e => e.codigo);
  }

  // Fallback HTML
  log("AxCross: usando extração HTML");
  return await extrairEquipamentosHtmlCross(page);
}

async function extrairEquipamentosHtmlCross(page) {
  const todos = [];
  let pagina = 1;
  while (pagina <= 30) {
    await page.waitForTimeout(400);
    const linhas = await page.evaluate(() =>
      Array.from(document.querySelectorAll("table tbody tr, .k-grid-content tr")).map(r => {
        const cells = Array.from(r.querySelectorAll("td"));
        const codigo = cells[0]?.innerText?.trim() || "";
        return codigo ? { codigo, descricao: cells[1]?.innerText?.trim() || "", sistema: "AxCross" } : null;
      }).filter(Boolean)
    );
    todos.push(...linhas);

    const next = page.locator(".k-pager-next:not(.k-state-disabled):not([disabled])").first();
    if (!await next.count() || await next.isDisabled().catch(() => true) || !linhas.length) break;
    await next.click();
    await page.waitForTimeout(1_000);
    pagina++;
  }
  const vistos = new Set();
  return todos.filter(e => { if (vistos.has(e.codigo)) return false; vistos.add(e.codigo); return true; });
}

// ─── ENDPOINT: Comparar ────────────────────────────────────────────────────────
export async function compararEquipamentos(req, res) {
  let browser;
  const passos = [];
  const push   = (tipo, msg) => { passos.push({ tipo, msg, ts: new Date().toISOString() }); log(`[${tipo}] ${msg}`); };

  try {
    const { axhubUrl, axhubLogin, axhubSenha, axcrossUrl, axcrossLogin, axcrossSenha, nome = "Contrato" } = req.body;
    if (!axhubUrl)   return res.status(400).json({ erro: "axhubUrl é obrigatório" });
    if (!axcrossUrl) return res.status(400).json({ erro: "axcrossUrl é obrigatório" });

    const baseHub   = axhubUrl.replace(/\/$/, "");
    const baseCross = axcrossUrl.replace(/\/$/, "");

    push("info", `Iniciando depara: ${nome}`);
    push("info", `AxHub: ${baseHub}/operacao`);
    push("info", `AxCross: ${baseCross}/equipments/equipment/equipment`);

    browser = await abrirBrowser(true); // headless:true para jobs em background

    // ── AxHub ──────────────────────────────────────────────────────────────────
    let equipsAxHub = [];
    try {
      // Tenta 1: perfil Chrome real do usuário (cookies já autenticados)
      const hubComPerfil = await buscarAxHubComPerfilChrome(baseHub);
      if (hubComPerfil && hubComPerfil.length > 0) {
        equipsAxHub = hubComPerfil;
        push("ok", `AxHub (perfil Chrome): ${equipsAxHub.length} equipamento(s)`);
      } else {
        // Tenta 2: Playwright headless com login
        push("info", `Perfil Chrome sem sessão — tentando Playwright`);
        const ctxHub = await criarContexto(browser);
        ctxHub._login = axhubLogin;
        ctxHub._senha = axhubSenha;
        const pageHub = await loginAxHub(ctxHub, baseHub);
        const urlPosLogin = pageHub.url();
        if (urlPosLogin.includes("login") || urlPosLogin.includes("nao-autorizado")) {
          push("alerta", `AxHub: login pode ter falhado (Turnstile). URL: ${urlPosLogin}`);
        } else {
          push("ok", `AxHub: login OK. URL: ${urlPosLogin}`);
        }
        equipsAxHub = await buscarEquipamentosAxHub(pageHub, baseHub);
        await ctxHub.close();
        push("ok", `AxHub: ${equipsAxHub.length} equipamento(s) extraído(s)`);
      }
    } catch (e) {
      push("erro", `AxHub: ${e.message}`);
    }

    // ── AxCross ────────────────────────────────────────────────────────────────
    let equipsAxCross = [];
    try {
      const ctxCross = await criarContexto(browser);
      ctxCross._login = axcrossLogin;
      ctxCross._senha = axcrossSenha;
      const pageCross = await loginAxCross(ctxCross, baseCross);
      equipsAxCross = await buscarEquipamentosAxCross(pageCross, baseCross);
      await ctxCross.close();
      push("ok", `AxCross: ${equipsAxCross.length} equipamento(s) extraído(s)`);
    } catch (e) {
      push("erro", `AxCross: ${e.message}`);
    }

    await browser.close();

    // ── Depara ────────────────────────────────────────────────────────────────
    const codsHub   = new Map(equipsAxHub.map(e    => [e.codigo.toLowerCase().trim(), e]));
    const codsCross = new Map(equipsAxCross.map(e   => [e.codigo.toLowerCase().trim(), e]));
    const apenasHub   = equipsAxHub.filter(e    => !codsCross.has(e.codigo.toLowerCase().trim()));
    const apenasCross = equipsAxCross.filter(e   => !codsHub.has(e.codigo.toLowerCase().trim()));
    const emAmbos     = equipsAxHub.filter(e    =>  codsCross.has(e.codigo.toLowerCase().trim()));

    push("ok", `Depara: ${emAmbos.length} em ambos · ${apenasHub.length} só AxHub · ${apenasCross.length} só AxCross`);

    return res.json({
      ok: true, nome, axhubUrl: baseHub, axcrossUrl: baseCross,
      totais: { axhub: equipsAxHub.length, axcross: equipsAxCross.length, emAmbos: emAmbos.length, apenasHub: apenasHub.length, apenasCross: apenasCross.length },
      emAmbos:     emAmbos.map(e    => ({ codigo: e.codigo, descricao: e.grupo || e.fabricante || "" })),
      apenasHub:   apenasHub.map(e  => ({ codigo: e.codigo, descricao: e.grupo || e.fabricante || "" })),
      apenasCross: apenasCross.map(e => ({ codigo: e.codigo, descricao: e.descricao || "" })),
      listaAxHub:  equipsAxHub,
      listaAxCross: equipsAxCross,
      passos,
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    passos.push({ tipo: "erro", msg: err.message, ts: new Date().toISOString() });
    return tratar(err, res, "Erro ao comparar equipamentos");
  }
}

// ─── ENDPOINT: Busca direta AxHub via cookie (sem Playwright/Turnstile) ──────

/**
 * POST /api/depara-equipamentos/axhub-direto
 * Body: { axhubUrl, cookie, nome? }
 * Usa o cookie de sessão do usuário para chamar /operacao/datahandler diretamente.
 * Não precisa de Playwright nem login — ideal para sites com Cloudflare Turnstile.
 */
export async function buscarAxHubDireto(req, res) {
  try {
    const { axhubUrl, cookie, nome = "AxHub" } = req.body;
    if (!axhubUrl) return res.status(400).json({ erro: "axhubUrl é obrigatório" });
    if (!cookie)   return res.status(400).json({ erro: "cookie é obrigatório" });

    const base = axhubUrl.replace(/\/$/, "");
    const url  = `${base}/operacao/datahandler`;
    log(`Buscando AxHub direto: ${url}`);

    const resp = await fetch(url, {
      headers: {
        "Cookie": cookie,
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json, text/javascript, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": `${base}/operacao`,
      },
    });

    if (!resp.ok) {
      const text = await resp.text();
      if (text.includes("login") || text.includes("Login")) {
        return res.status(401).json({ erro: "Cookie de sessão inválido ou expirado. Faça login no AxHub e copie o cookie novamente." });
      }
      return res.status(resp.status).json({ erro: `HTTP ${resp.status}`, detalhe: text.substring(0, 200) });
    }

    const data   = await resp.json();
    const raw    = data?.Data || data?.data || [];
    const equips = raw.map(e => ({
      codigo:      e.Equipamento?.Descricao || e.CodigoEquipamento || e.Codigo || "",
      grupo:       e.GrupoEquipamento || e.Grupo || "",
      fabricante:  e.FabricanteNome   || e.Fabricante || "",
      homologacao: e.Homologacao ? "Homologado" : "",
      sistema:     "AxHub",
    })).filter(e => e.codigo);

    log(`AxHub direto: ${equips.length} equipamentos (total: ${data?.Total})`);
    return res.json({ ok: true, nome, total: equips.length, equipamentos: equips });
  } catch (err) {
    return tratar(err, res, "Erro ao buscar AxHub direto");
  }
}

// ─── ENDPOINT: Compara com lista pré-buscada do AxHub ────────────────────────
/**
 * POST /api/depara-equipamentos/com-lista-hub
 * Body: { nome, axhubEquipamentos: [{codigo, grupo, fabricante}], axcrossUrl, axcrossLogin, axcrossSenha }
 * Recebe lista de equipamentos do AxHub já buscada pelo frontend e compara com o AxCross.
 * Solução para sites AxHub com Cloudflare Turnstile (IMETROPA, etc.).
 */
export async function compararComListaHub(req, res) {
  let browser;
  const passos = [];
  const push   = (tipo, msg) => { passos.push({ tipo, msg, ts: new Date().toISOString() }); log(`[${tipo}] ${msg}`); };

  try {
    const { nome = "Contrato", axhubEquipamentos, axcrossUrl, axcrossLogin, axcrossSenha, axhubUrl = "" } = req.body;
    if (!Array.isArray(axhubEquipamentos)) return res.status(400).json({ erro: "axhubEquipamentos[] é obrigatório" });
    if (!axcrossUrl) return res.status(400).json({ erro: "axcrossUrl é obrigatório" });

    const equipsAxHub = axhubEquipamentos.map(e => ({ ...e, sistema: "AxHub" }));
    push("ok", `AxHub (lista pré-buscada): ${equipsAxHub.length} equipamento(s)`);

    // Busca AxCross via Playwright
    let equipsAxCross = [];
    browser = await abrirBrowser(true);
    try {
      const ctxCross = await criarContexto(browser);
      ctxCross._login = axcrossLogin;
      ctxCross._senha = axcrossSenha;
      const pageCross = await loginAxCross(ctxCross, axcrossUrl.replace(/\/$/, ""));
      equipsAxCross   = await buscarEquipamentosAxCross(pageCross, axcrossUrl.replace(/\/$/, ""));
      await ctxCross.close();
      push("ok", `AxCross: ${equipsAxCross.length} equipamento(s)`);
    } catch (e) {
      push("erro", `AxCross: ${e.message}`);
    } finally {
      await browser.close().catch(() => {});
    }

    // Depara
    const codsHub   = new Map(equipsAxHub.map(e    => [e.codigo.toLowerCase().trim(), e]));
    const codsCross = new Map(equipsAxCross.map(e   => [e.codigo.toLowerCase().trim(), e]));
    const apenasHub   = equipsAxHub.filter(e    => !codsCross.has(e.codigo.toLowerCase().trim()));
    const apenasCross = equipsAxCross.filter(e   => !codsHub.has(e.codigo.toLowerCase().trim()));
    const emAmbos     = equipsAxHub.filter(e    =>  codsCross.has(e.codigo.toLowerCase().trim()));

    push("ok", `Depara: ${emAmbos.length} em ambos · ${apenasHub.length} só AxHub · ${apenasCross.length} só AxCross`);

    return res.json({
      ok: true, nome, axhubUrl, axcrossUrl,
      totais: { axhub: equipsAxHub.length, axcross: equipsAxCross.length, emAmbos: emAmbos.length, apenasHub: apenasHub.length, apenasCross: apenasCross.length },
      emAmbos:     emAmbos.map(e    => ({ codigo: e.codigo, descricao: e.grupo || e.fabricante || "" })),
      apenasHub:   apenasHub.map(e  => ({ codigo: e.codigo, descricao: e.grupo || e.fabricante || "" })),
      apenasCross: apenasCross.map(e => ({ codigo: e.codigo, descricao: e.descricao || "" })),
      passos,
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    return tratar(err, res, "Erro ao comparar com lista hub");
  }
}

// ─── ENDPOINT: Multi-contratos ────────────────────────────────────────────────
export async function compararMultiContratos(req, res) {
  try {
    const { contratos } = req.body;
    if (!Array.isArray(contratos) || !contratos.length) {
      return res.status(400).json({ erro: "contratos[] é obrigatório com pelo menos 1 item" });
    }
    const resultados = [];
    for (const c of contratos) {
      log(`Multi: ${c.nome}`);

      // Sempre tenta perfil Chrome primeiro (tem cookies do usuário logado)
      // Fallback para cookie fornecido ou Playwright
      const hubComPerfil = await buscarAxHubComPerfilChrome(c.axhubUrl.replace(/\/$/, ""));
      const temDadosHub  = hubComPerfil && hubComPerfil.length > 0;

      if (temDadosHub || c.axhubCookie) {
        // Obtém dados do AxHub
        let hubData = hubComPerfil || [];
        
        if (!hubData.length && c.axhubCookie) {
          log(`  → usando cookie de sessão para AxHub`);
          try {
            const base = c.axhubUrl.replace(/\/$/, "");
            const resp = await fetch(`${base}/operacao/datahandler`, {
              headers: {
                "Cookie": c.axhubCookie,
                "X-Requested-With": "XMLHttpRequest",
                "Accept": "application/json",
                "Referer": `${base}/operacao`,
              },
            });
            if (resp.ok) {
              const data = await resp.json();
              const raw  = data?.Data || [];
              hubData = raw.map(e => ({
                codigo:    e.Equipamento?.Descricao || e.CodigoEquipamento || "",
                grupo:     e.GrupoEquipamento || "",
                fabricante: e.FabricanteNome || "",
                sistema:   "AxHub",
              })).filter(e => e.codigo);
            }
          } catch (cookieErr) {
            log(`  Erro no cookie: ${cookieErr.message}`);
          }
        }

        try {
          // Busca AxCross normalmente via Playwright
          let equipsAxCross = [];
          let browser;
          try {
            browser = await abrirBrowser(true); // headless:true — AxCross não tem Turnstile
            const ctxCross = await criarContexto(browser);
            ctxCross._login = c.axcrossLogin;
            ctxCross._senha = c.axcrossSenha;
            const pageCross = await loginAxCross(ctxCross, c.axcrossUrl.replace(/\/$/, ""));
            equipsAxCross   = await buscarEquipamentosAxCross(pageCross, c.axcrossUrl.replace(/\/$/, ""));
            await ctxCross.close();
          } catch (crossErr) {
            log(`  Erro AxCross no modo cookie: ${crossErr.message}`);
          } finally {
            if (browser) await browser.close().catch(() => {});
          }

          // Depara
          const codsHub   = new Map(hubData.map(e      => [e.codigo.toLowerCase().trim(), e]));
          const codsCross = new Map(equipsAxCross.map(e => [e.codigo.toLowerCase().trim(), e]));
          const apenasHub   = hubData.filter(e      => !codsCross.has(e.codigo.toLowerCase().trim()));
          const apenasCross = equipsAxCross.filter(e => !codsHub.has(e.codigo.toLowerCase().trim()));
          const emAmbos     = hubData.filter(e      =>  codsCross.has(e.codigo.toLowerCase().trim()));

          resultados.push({
            ok: true, nome: c.nome, axhubUrl: c.axhubUrl, axcrossUrl: c.axcrossUrl,
            totais: { axhub: hubData.length, axcross: equipsAxCross.length, emAmbos: emAmbos.length, apenasHub: apenasHub.length, apenasCross: apenasCross.length },
            emAmbos:     emAmbos.map(e    => ({ codigo: e.codigo, descricao: e.grupo || e.fabricante || "" })),
            apenasHub:   apenasHub.map(e  => ({ codigo: e.codigo, descricao: e.grupo || e.fabricante || "" })),
            apenasCross: apenasCross.map(e => ({ codigo: e.codigo, descricao: e.descricao || "" })),
            passos: [
              { tipo: "ok",   msg: `AxHub (cookie): ${hubData.length} equipamentos`, ts: new Date().toISOString() },
              { tipo: "ok",   msg: `AxCross: ${equipsAxCross.length} equipamentos`,  ts: new Date().toISOString() },
              { tipo: "ok",   msg: `Depara: ${emAmbos.length} ambos · ${apenasHub.length} só Hub · ${apenasCross.length} só Cross`, ts: new Date().toISOString() },
            ],
          });
          continue;
        } catch (cookieErr) {
          log(`  Erro no modo cookie: ${cookieErr.message} — fallback para Playwright`);
        }
      }

      // Sem cookie: usa Playwright
      const resultado = await new Promise(resolve => {
        const mock = { status: () => ({ json: resolve }), json: resolve };
        compararEquipamentos({ body: c }, mock);
      });
      resultados.push(resultado);
    }
    return res.json({ ok: true, total: resultados.length, resultados });
  } catch (err) {
    return tratar(err, res, "Erro no multi-depara");
  }
}
