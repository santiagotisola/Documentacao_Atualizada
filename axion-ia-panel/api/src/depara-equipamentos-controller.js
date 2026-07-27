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

import { chromium as chromiumExtra } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import path from "path";
import os from "os";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { exec, execSync } from "child_process";
import { createDecipheriv } from "crypto";

function log(msg) { console.log(`[DeparaEquip] ${msg}`); }
function tratar(err, res, msg = "Erro no depara") {
  console.error(`[DeparaEquip] ${msg}:`, err.message);
  return res.status(500).json({ erro: msg, detalhe: err.message });
}

// ─── Stealth: remove sinais de automação detectados pelo Cloudflare ───────────
chromiumExtra.use(StealthPlugin());

// Alias — usa sempre o stealth
const chromium = chromiumExtra;

// ─── Leitura direta de cookies do Chrome (sem Playwright, sem Turnstile) ──────
// Funciona enquanto o usuário está logado no AxHub em seu Chrome.
// Fluxo: Local State → DPAPI (PowerShell) → AES key → Cookies SQLite → AES-GCM decrypt

function getChromePerfilDir() {
  const localApp = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
  return path.join(localApp, "Google", "Chrome", "User Data");
}

async function lerCookiesBancoChrome() {
  const perfilDir = getChromePerfilDir();
  const localStatePath  = path.join(perfilDir, "Local State");
  const cookiesPaths    = [
    path.join(perfilDir, "Default", "Network", "Cookies"),
    path.join(perfilDir, "Default", "Cookies"),
  ];

  if (!existsSync(localStatePath)) { log("Chrome Local State não encontrado"); return null; }

  // 1. Lê a chave AES criptografada com DPAPI
  const localState = JSON.parse(readFileSync(localStatePath, "utf8"));
  const encKeyB64  = localState?.os_crypt?.encrypted_key;
  if (!encKeyB64) { log("Chrome encrypted_key não encontrado"); return null; }

  const encKeyBuf  = Buffer.from(encKeyB64, "base64");
  const encKeyData = encKeyBuf.slice(5); // remove prefixo "DPAPI"
  const keyBytes   = [...encKeyData].join(",");

  // 2. Descriptografa a chave AES via PowerShell (DPAPI — só funciona no mesmo usuário/máquina)
  let aesKey;
  try {
    // Add-Type -AssemblyName System.Security é necessário no PowerShell 5.1
    const psCmd = `Add-Type -AssemblyName System.Security;$d=[System.Security.Cryptography.ProtectedData]::Unprotect([byte[]]@(${keyBytes}),$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser);([BitConverter]::ToString($d)) -replace '-',''`;
    const hex   = execSync(`powershell -NoProfile -Command "${psCmd}"`, { timeout: 15000 }).toString().trim();
    aesKey = Buffer.from(hex, "hex");
    log(`Chrome DPAPI: chave AES obtida (${aesKey.length} bytes)`);
  } catch (e) {
    log(`Chrome DPAPI erro: ${e.message.substring(0, 120)}`);
    return null;
  }

  // 3. Lê o arquivo SQLite de cookies
  let dbBuffer;
  const cookiesPath = cookiesPaths.find(existsSync);
  if (!cookiesPath) { log("Chrome Cookies não encontrado"); return null; }

  // Tenta 3a: readFileSync direto (Node.js usa FILE_SHARE_READ|WRITE|DELETE no Windows)
  try {
    dbBuffer = readFileSync(cookiesPath);
    log(`Chrome Cookies lido diretamente: ${dbBuffer.length} bytes`);
  } catch (e1) {
    log(`Chrome Cookies readFileSync falhou: ${e1.message.substring(0, 80)} — tentando PowerShell`);
    // Tenta 3b: PowerShell com FileStream (FileShare.ReadWrite)
    try {
      const psRead = `Add-Type -AssemblyName System.Security;$s=[IO.FileStream]::new('${cookiesPath.replace(/\\/g, "\\\\")}', [IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]'ReadWrite,Delete');$b=New-Object byte[] $s.Length;$s.Read($b,0,$b.Length)|Out-Null;$s.Close();[Convert]::ToBase64String($b)`;
      const b64 = execSync(`powershell -NoProfile -Command "${psRead}"`, { timeout: 15000, maxBuffer: 25 * 1024 * 1024 }).toString().trim();
      if (!b64) throw new Error("Saída vazia do PowerShell");
      dbBuffer = Buffer.from(b64, "base64");
      log(`Chrome Cookies lido via PowerShell: ${dbBuffer.length} bytes`);
    } catch (e2) {
      log(`Chrome Cookies PowerShell falhou: ${e2.message.substring(0, 80)}`);
      return null;
    }
  }

  // 4. Abre o SQLite com sql.js e descriptografa cada cookie
  try {
    const sqlJsPath = path.join(path.dirname(new URL(import.meta.url).pathname).slice(1).replace(/^\/([A-Za-z]:)/, "$1"), "..", "node_modules", "sql.js", "dist", "sql-wasm.js");
    const initSqlJs = (await import(`file://${sqlJsPath.replace(/\\/g, "/")}`)  ).default;
    const SQL       = await initSqlJs();
    const db        = new SQL.Database(new Uint8Array(dbBuffer));

    const stmt = db.prepare(
      "SELECT host_key, name, encrypted_value FROM cookies WHERE host_key LIKE '%axhub.axion.ws%'"
    );
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    db.close();

    // Descriptografa cada cookie (formato v10: 3 bytes prefixo + 12 bytes nonce + dados + 16 bytes tag)
    const cookieMap = {}; // { host: { name: value } }
    for (const row of rows) {
      const enc = Buffer.from(row.encrypted_value);
      if (enc.slice(0, 3).toString() !== "v10") continue;
      try {
        const nonce  = enc.slice(3, 15);
        const tag    = enc.slice(enc.length - 16);
        const cipher = enc.slice(15, enc.length - 16);
        const dec    = createDecipheriv("aes-256-gcm", aesKey, nonce);
        dec.setAuthTag(tag);
        const value  = Buffer.concat([dec.update(cipher), dec.final()]).toString();
        const host   = row.host_key.replace(/^\./, "");
        if (!cookieMap[host]) cookieMap[host] = {};
        cookieMap[host][row.name] = value;
      } catch {}
    }
    log(`Chrome cookies descriptografados para ${Object.keys(cookieMap).length} domínio(s) AxHub`);
    return cookieMap;
  } catch (e) {
    log(`Chrome SQLite/decrypt erro: ${e.message}`);
    return null;
  }
}

// Cache em memória (validade 5 min) para não ler SQLite a cada depara
let _cookieCache = null;
let _cookieCacheTs = 0;
async function getCookiesChrome() {
  if (_cookieCache && Date.now() - _cookieCacheTs < 5 * 60 * 1000) return _cookieCache;
  _cookieCache  = await lerCookiesBancoChrome();
  _cookieCacheTs = Date.now();
  return _cookieCache;
}

// ─── Busca dados do AxHub usando cookies reais do Chrome ──────────────────────
async function buscarAxHubComPerfilChrome(baseUrl) {
  const base   = baseUrl.replace(/\/$/, "");
  const domain = base.replace(/https?:\/\//, "");

  const cookieMap = await getCookiesChrome();
  if (!cookieMap) return null;

  // Procura cookies para este domínio AxHub
  const cookies = cookieMap[domain] || cookieMap[domain.replace(/^www\./, "")];
  if (!cookies || !Object.keys(cookies).length) {
    log(`Chrome cookies: nenhum cookie para ${domain}`);
    return null;
  }

  const cookieStr = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
  log(`Chrome cookies: ${Object.keys(cookies).length} cookie(s) para ${domain}`);

  // Faz requisição server-side com os cookies reais
  try {
    const resp = await fetch(`${base}/operacao/datahandler?pageSize=500&page=1&skip=0&take=500`, {
      headers: {
        "Cookie":            cookieStr,
        "X-Requested-With": "XMLHttpRequest",
        "Accept":            "application/json",
        "User-Agent":        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Referer":           `${base}/operacao`,
      },
    });

    if (!resp.ok) {
      log(`Chrome cookies fetch: HTTP ${resp.status} para ${domain}`);
      return null;
    }

    const data  = await resp.json();
    const raw   = data?.Data || [];
    const equips = raw.map(e => ({
      codigo:     e.Equipamento?.Descricao || e.CodigoEquipamento || "",
      grupo:      e.GrupoEquipamento || "",
      fabricante: e.FabricanteNome || "",
      sistema:    "AxHub",
    })).filter(e => e.codigo);

    log(`Chrome cookies: ${equips.length} equipamentos de ${domain}`);
    return equips.length > 0 ? equips : null;
  } catch (e) {
    log(`Chrome cookies fetch erro: ${e.message}`);
    return null;
  }
}

async function abrirBrowser(headless = true) {
  try {
    return await chromiumExtra.launch({
      channel: "chrome",
      headless,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--ignore-certificate-errors",          // AxCross sites com SSL inválido
        "--ignore-certificate-errors-spki-list",
        "--allow-insecure-localhost",
      ],
      ignoreDefaultArgs: ["--enable-automation"],
    });
  } catch {
    return chromiumExtra.launch({
      headless,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--ignore-certificate-errors",
        "--allow-insecure-localhost",
        "--disable-dev-shm-usage",
      ],
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

  // AxCross usa e-mail + senha — botão habilitado imediatamente
  // Suporta /account/login, /login (padrão) E Axion Reverse Proxy (id="username", id="password")
  const emailInput = page.locator([
    'input#username',                    // Axion Reverse Proxy
    'input[type="email"]',
    'input[placeholder*="mail" i]',
    'input[placeholder*="usu" i]',
    'input[placeholder*="user" i]',
    'input[type="text"]',
  ].join(', ')).first();
  const passInput  = page.locator([
    'input#password',                    // Axion Reverse Proxy
    'input[type="password"]',
  ].join(', ')).first();
  const btnLogin   = page.locator([
    'button:has-text("Sign In")',         // Axion Reverse Proxy
    'button:has-text("Entrar")',
    'button:has-text("Login")',
    'button:has-text("Acessar")',
    'button[type="submit"]',
  ].join(', ')).first();

  if (await emailInput.count() > 0) {
    // Para React/Angular: dispara evento nativo de input para ativar o state do framework
    await page.evaluate((val) => {
      const el = document.querySelector('input#username, input[type="email"], input[type="text"]');
      if (!el) return;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      if (setter) setter.call(el, val);
      el.dispatchEvent(new Event("input",   { bubbles: true }));
      el.dispatchEvent(new Event("change",  { bubbles: true }));
    }, context._login || "");
    await emailInput.fill(context._login || "").catch(() => {});
  }
  if (await passInput.count() > 0) {
    await page.evaluate((val) => {
      const el = document.querySelector('input#password, input[type="password"]');
      if (!el) return;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      if (setter) setter.call(el, val);
      el.dispatchEvent(new Event("input",  { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, context._senha || "");
    await passInput.fill(context._senha || "").catch(() => {});
  }
  await page.waitForTimeout(500);

  if (await btnLogin.count() > 0) {
    await btnLogin.click();
  } else {
    await page.keyboard.press("Enter");
  }

  // Aguarda redirect pós-login — suporta SPAs (React/Angular) que usam router.navigate()
  // não disparam waitForNavigation
  await Promise.race([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 15_000 }).catch(() => {}),
    page.waitForURL("**/equipment*", { timeout: 15_000 }).catch(() => {}),
    new Promise(r => setTimeout(r, 5000)), // fallback: espera 5s
  ]);
  await page.waitForTimeout(1_500);

  const urlAposLogin = page.url();
  log(`AxCross: URL após login: ${urlAposLogin}`);

  if (!urlAposLogin.includes("/equipment")) {
    log(`AxCross: login falhou ou redirecionou — tentando goto ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(2000);
    log(`AxCross: URL final: ${page.url()}`);
  }

  return page;
}

// ─── Busca equipamentos AxCross ────────────────────────────────────────────────
async function buscarEquipamentosAxCross(page, base) {
  // Aguarda a grid carregar completamente
  await page.waitForSelector("table tbody tr, .k-grid-content tr, .k-grid td", { timeout: 25_000 }).catch(() => {});
  await page.waitForTimeout(2_000);

  // Tenta endpoint JSON — múltiplos caminhos (Kendo Read, datahandler, REST)
  const resultado = await page.evaluate(async () => {
    const headers = { "X-Requested-With": "XMLHttpRequest", "Content-Type": "application/x-www-form-urlencoded" };
    const jsonHdr = { "X-Requested-With": "XMLHttpRequest", "Content-Type": "application/json" };

    // Kendo Grid server-side Read endpoint (POST com pageSize grande)
    const kendoEndpoints = [
      "/equipments/equipment/equipment/Read",
      "/equipments/equipment/Read",
      "/equipments/Read",
      "/equipment/Read",
    ];
    for (const ep of kendoEndpoints) {
      try {
        const r = await fetch(ep, {
          method: "POST",
          credentials: "include",
          headers,
          body: "sort=&group=&filter=&skip=0&take=500&page=1&pageSize=500",
        });
        if (!r.ok) continue;
        const d = await r.json();
        const items = d?.Data || d?.data || (Array.isArray(d) ? d : d?.Items || d?.items || []);
        if (items.length > 0) return { ok: true, ep, data: d, count: items.length };
      } catch { /* continua */ }
    }

    // Kendo datahandler (GET)
    const getEndpoints = [
      "/equipments/equipment/equipment/datahandler",
      "/equipments/equipment/datahandler",
      "/equipment/datahandler",
      "/equipments/datahandler",
      "/api/equipment",
      "/api/equipments",
    ];
    for (const ep of getEndpoints) {
      try {
        const r = await fetch(ep, { credentials: "include", headers: { "X-Requested-With": "XMLHttpRequest" } });
        if (!r.ok) continue;
        const d = await r.json();
        const items = d?.Data || d?.data || (Array.isArray(d) ? d : d?.Items || d?.items || []);
        if (items.length > 0) return { ok: true, ep, data: d, count: items.length };
      } catch { /* continua */ }
    }
    return { ok: false };
  });

  if (resultado.ok) {
    const raw = resultado.data?.Data || resultado.data?.data ||
      (Array.isArray(resultado.data) ? resultado.data : resultado.data?.Items || resultado.data?.items || []);
    log(`AxCross datahandler (${resultado.ep}): ${raw.length} registros`);
    return raw.map(e => ({
      codigo:    e.EquipmentCode || e.Codigo || e.CodigoEquipamento || e.Code ||
                 (e.Equipamento?.Descricao) || e.Nome || e.name || e.Name || "",
      descricao: e.Local || e.Localizacao || e.Location || e.Descricao ||
                 e.Description || e.GrupoEquipamento || e.Address || "",
      sistema:   "AxCross",
    })).filter(e => e.codigo);
  }

  // Fallback HTML — extrai da grid Kendo renderizada no browser
  log("AxCross: usando extração HTML");
  return await extrairEquipamentosHtmlCross(page);
}

async function extrairEquipamentosHtmlCross(page) {
  // Antes de extrair, tenta mudar o pageSize para 500 para pegar tudo de uma vez
  await page.evaluate(() => {
    try {
      const selects = document.querySelectorAll('.k-pager-sizes select, select.k-dropdown');
      selects.forEach(s => {
        // Tenta setar para o maior valor disponível
        const opts = Array.from(s.options).map(o => parseInt(o.value)).filter(v => !isNaN(v)).sort((a,b) => b-a);
        if (opts.length) s.value = String(opts[0]);
        s.dispatchEvent(new Event('change', { bubbles: true }));
      });
    } catch {}
  }).catch(() => {});
  await page.waitForTimeout(1_500);

  const todos = [];
  let pagina = 1;
  while (pagina <= 30) {
    await page.waitForTimeout(500);
    const linhas = await page.evaluate(() => {
      // Tenta detectar qual célula tem o código (padrão: CE001C, PE001C, etc.)
      const codigoRegex = /^[A-Z]{2,4}\d{3,4}[A-Z]?$/;
      const rows = Array.from(document.querySelectorAll("table tbody tr, .k-grid-content tr"));
      return rows.map(r => {
        const cells = Array.from(r.querySelectorAll("td"));
        if (!cells.length) return null;
        // Procura o código em qualquer uma das primeiras 3 células
        let codigo = "";
        let descricao = "";
        for (let i = 0; i < Math.min(cells.length, 4); i++) {
          const txt = cells[i]?.innerText?.trim().split('\n')[0].trim() || "";
          if (codigoRegex.test(txt)) {
            codigo = txt;
            descricao = cells[i + 1]?.innerText?.trim().split('\n')[0].trim() || "";
            break;
          }
        }
        // Fallback: usa a primeira célula não vazia
        if (!codigo) {
          const txt = cells[0]?.innerText?.trim().split('\n')[0].trim() || "";
          if (txt && txt.length >= 3 && txt.length <= 20 && !/^\d+$/.test(txt)) {
            codigo = txt;
            descricao = cells[1]?.innerText?.trim().split('\n')[0].trim() || "";
          }
        }
        return codigo ? { codigo, descricao, sistema: "AxCross" } : null;
      }).filter(Boolean);
    });
    todos.push(...linhas);
    log(`AxCross HTML página ${pagina}: ${linhas.length} linhas extraídas`);

    const next = page.locator(".k-pager-next:not(.k-state-disabled):not([disabled])").first();
    if (!await next.count() || await next.isDisabled().catch(() => true) || !linhas.length) break;
    await next.click();
    await page.waitForTimeout(1_200);
    pagina++;
  }
  const vistos = new Set();
  return todos.filter(e => { if (vistos.has(e.codigo)) return false; vistos.add(e.codigo); return true; });
}

// ─── ENDPOINT: Comparar ────────────────────────────────────────────────────────
export async function compararEquipamentos(req, res) {
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

    // ── AxHub — usa Chrome VISÍVEL (headless:false) para Turnstile auto-verificar ─
    let equipsAxHub = [];
    let browserHub;
    try {
      // Tenta 1: perfil Chrome real do usuário (cookies já autenticados)
      const hubComPerfil = await buscarAxHubComPerfilChrome(baseHub);
      if (hubComPerfil && hubComPerfil.length > 0) {
        equipsAxHub = hubComPerfil;
        push("ok", `AxHub (perfil Chrome): ${equipsAxHub.length} equipamento(s)`);
      } else {
        // Tenta 2: Chrome visível — Turnstile managed challenge auto-verifica
        push("info", `Iniciando Chrome visível para AxHub (Turnstile)...`);
        browserHub = await abrirBrowser(false); // headless:false obrigatório para Turnstile
        const ctxHub = await criarContexto(browserHub);
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
    } finally {
      if (browserHub) await browserHub.close().catch(() => {});
    }

    // ── AxCross — headless:true (sem Turnstile) ────────────────────────────────
    let equipsAxCross = [];
    let browserCross;
    try {
      browserCross = await abrirBrowser(true);
      const ctxCross = await criarContexto(browserCross);
      ctxCross._login = axcrossLogin;
      ctxCross._senha = axcrossSenha;
      const pageCross = await loginAxCross(ctxCross, baseCross);
      equipsAxCross = await buscarEquipamentosAxCross(pageCross, baseCross);
      await ctxCross.close();
      push("ok", `AxCross: ${equipsAxCross.length} equipamento(s) extraído(s)`);
    } catch (e) {
      push("erro", `AxCross: ${e.message}`);
    } finally {
      if (browserCross) await browserCross.close().catch(() => {});
    }

    // ── Depara ────────────────────────────────────────────────────────────────
    const codsHub   = new Map(equipsAxHub.map(e    => [e.codigo.toLowerCase().trim(), e]));
    const codsCross = new Map(equipsAxCross.map(e   => [e.codigo.toLowerCase().trim(), e]));
    const apenasHub   = equipsAxHub.filter(e    => !codsCross.has(e.codigo.toLowerCase().trim()));
    const apenasCross = equipsAxCross.filter(e   => !codsHub.has(e.codigo.toLowerCase().trim()));
    const emAmbos     = equipsAxHub.filter(e    =>  codsCross.has(e.codigo.toLowerCase().trim()));

    push("ok", `Depara: ${emAmbos.length} em ambos · ${apenasHub.length} só AxHub · ${apenasCross.length} só AxCross`);

    // Detecta falha silenciosa de AxHub (Turnstile bloqueou ou login falhou)
    const axhubSemDados = equipsAxHub.length === 0;

    return res.json({
      ok: true, nome, axhubUrl: baseHub, axcrossUrl: baseCross,
      axhub_sem_dados: axhubSemDados,
      totais: { axhub: equipsAxHub.length, axcross: equipsAxCross.length, emAmbos: emAmbos.length, apenasHub: apenasHub.length, apenasCross: apenasCross.length },
      emAmbos:     emAmbos.map(e    => ({ codigo: e.codigo, descricao: e.grupo || e.fabricante || "" })),
      apenasHub:   apenasHub.map(e  => ({ codigo: e.codigo, descricao: e.grupo || e.fabricante || "" })),
      apenasCross: apenasCross.map(e => ({ codigo: e.codigo, descricao: e.descricao || "" })),
      listaAxHub:  equipsAxHub,
      listaAxCross: equipsAxCross,
      passos,
    });
  } catch (err) {
    passos.push({ tipo: "erro", msg: err.message, ts: new Date().toISOString() });
    return tratar(err, res, "Erro ao comparar equipamentos");
  }
}

// ─── Store PERSISTENTE em arquivo JSON ───────────────────────────────────────
import { fileURLToPath } from "url";
const __storeDir = path.dirname(fileURLToPath(import.meta.url));
const STORE_FILE  = path.join(__storeDir, "..", "depara-hub-store.json");

function carregarStore() {
  try {
    if (existsSync(STORE_FILE)) {
      const data = JSON.parse(readFileSync(STORE_FILE, "utf8"));
      const agora = Date.now();
      Object.keys(data).forEach(k => { if (agora - data[k].ts > 7 * 86_400_000) delete data[k]; }); // expira 7 dias
      return new Map(Object.entries(data));
    }
  } catch { /* inicia vazio se arquivo corrompido */ }
  return new Map();
}

function salvarStore(store) {
  try {
    writeFileSync(STORE_FILE, JSON.stringify(Object.fromEntries(store.entries()), null, 2), "utf8");
  } catch (e) { log(`Store save warning: ${e.message}`); }
}

const hubDataStore = carregarStore();
log(`Store persistente carregado: ${hubDataStore.size} entrada(s)`);

export function receberHubData(req, res) {
  try {
    const { url, equipamentos, key } = req.body;
    if (!Array.isArray(equipamentos) || !url) {
      return res.status(400).json({ erro: "url e equipamentos[] são obrigatórios" });
    }
    const storeKey = key || url.replace(/https?:\/\//, "").split("/")[0];
    hubDataStore.set(storeKey, { equipamentos, url, ts: Date.now() });
    salvarStore(hubDataStore);
    log(`Dados AxHub recebidos: ${equipamentos.length} equipamentos (chave: ${storeKey})`);
    return res.json({ ok: true, total: equipamentos.length, key: storeKey });
  } catch (err) {
    return tratar(err, res, "Erro ao receber dados do hub");
  }
}

export function obterHubData(req, res) {
  const { key } = req.params;
  const entry = hubDataStore.get(key);
  if (!entry) return res.status(404).json({ erro: "Dados não encontrados. Use o bookmarklet na página do AxHub." });
  if (Date.now() - entry.ts > 7 * 24 * 3_600_000) { // expira em 7 dias
    hubDataStore.delete(key);
    return res.status(410).json({ erro: "Dados expirados (> 7 dias). Use o bookmarklet novamente." });
  }
  return res.json({ ok: true, ...entry });
}

/**
 * GET /api/depara-equipamentos/store-status
 * Retorna status de todos os stores ativos (para o frontend exibir quais sites têm dados)
 */
export function statusStore(req, res) {
  const status = [];
  for (const [key, entry] of hubDataStore.entries()) {
    const ageMin = Math.round((Date.now() - entry.ts) / 60000);
    status.push({ key, url: entry.url, total: entry.equipamentos.length, idadeMin: ageMin });
  }
  return res.json({ total: status.length, sites: status });
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

// ─── ENDPOINT: Captura equipamentos de TODOS os sites AxHub em lote ─────────
/**
 * POST /api/depara-equipamentos/capturar-todos
 * Body: { sites: [{nome, axhubUrl, login, senha}] }
 * Para cada site: tenta login + datahandler e armazena no hubDataStore.
 * Retorna resumo de quais sites tiveram sucesso/falha.
 */
export async function capturarTodosAxHub(req, res) {
  const { sites } = req.body;
  if (!Array.isArray(sites) || !sites.length) {
    return res.status(400).json({ erro: "sites[] é obrigatório" });
  }

  const resultados = [];
  // Processa em série para não sobrecarregar
  for (const site of sites) {
    const base = site.axhubUrl.replace(/\/$/, "");
    const key  = base.replace(/https?:\/\//, "").split("/")[0];
    log(`Capturando: ${site.nome} (${base})`);

    // 1. Tenta via perfil Chrome
    const comPerfil = await buscarAxHubComPerfilChrome(base);
    if (comPerfil && comPerfil.length > 0) {
      hubDataStore.set(key, { equipamentos: comPerfil, url: base, ts: Date.now() });
      resultados.push({ nome: site.nome, key, total: comPerfil.length, metodo: "perfil_chrome", ok: true });
      log(`  OK via perfil Chrome: ${comPerfil.length} equipamentos`);
      continue;
    }

    // 2. Tenta via Playwright headless
    let browser;
    try {
      browser = await abrirBrowser(true);
      const ctx  = await criarContexto(browser);
      ctx._login = site.login;
      ctx._senha = site.senha;
      const page = await loginAxHub(ctx, base);
      const urlAtual = page.url();

      if (!urlAtual.includes("login") && !urlAtual.includes("nao-autorizado")) {
        const equips = await buscarEquipamentosAxHub(page, base);
        if (equips.length > 0) {
          hubDataStore.set(key, { equipamentos: equips, url: base, ts: Date.now() });
          resultados.push({ nome: site.nome, key, total: equips.length, metodo: "playwright", ok: true });
          log(`  OK via Playwright: ${equips.length} equipamentos`);
        } else {
          resultados.push({ nome: site.nome, key, total: 0, metodo: "playwright", ok: false, erro: "Sem equipamentos" });
        }
      } else {
        resultados.push({ nome: site.nome, key, total: 0, metodo: "playwright", ok: false, erro: "Login falhou (Turnstile?)" });
        log(`  Falhou: login não realizado. URL: ${urlAtual}`);
      }
      await ctx.close();
    } catch (e) {
      resultados.push({ nome: site.nome, key, total: 0, ok: false, erro: e.message });
      log(`  Erro: ${e.message}`);
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  const ok = resultados.filter(r => r.ok).length;
  log(`Captura em lote: ${ok}/${sites.length} sites com sucesso`);
  return res.json({ ok: true, total: sites.length, sucesso: ok, falha: sites.length - ok, resultados });
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

      // ─── Tenta 1: Store persistente (dados enviados pelo bookmarklet) ───────
      const baseHub = c.axhubUrl.replace(/\/$/, "");
      const hubKey  = baseHub.replace(/https?:\/\//, "").split("/")[0];
      const storeEntry = hubDataStore.get(hubKey);
      const hubDoStore = storeEntry?.equipamentos || [];

      if (hubDoStore.length > 0) {
        log(`  → usando store persistente para AxHub: ${hubDoStore.length} equipamentos`);
        let equipsAxCross = [];
        let browser;
        try {
          browser = await abrirBrowser(true);
          const ctxCross = await criarContexto(browser);
          ctxCross._login = c.axcrossLogin;
          ctxCross._senha = c.axcrossSenha;
          const pageCross = await loginAxCross(ctxCross, c.axcrossUrl.replace(/\/$/, ""));
          equipsAxCross   = await buscarEquipamentosAxCross(pageCross, c.axcrossUrl.replace(/\/$/, ""));
          await ctxCross.close();
        } catch (e) { log(`  AxCross erro: ${e.message}`); }
        finally { if (browser) await browser.close().catch(() => {}); }

        const codsHub   = new Map(hubDoStore.map(e    => [e.codigo.toLowerCase().trim(), e]));
        const codsCross = new Map(equipsAxCross.map(e => [e.codigo.toLowerCase().trim(), e]));
        resultados.push({
          ok: true, nome: c.nome, axhubUrl: c.axhubUrl, axcrossUrl: c.axcrossUrl,
          totais: { axhub: hubDoStore.length, axcross: equipsAxCross.length, emAmbos: hubDoStore.filter(e => codsCross.has(e.codigo.toLowerCase().trim())).length, apenasHub: hubDoStore.filter(e => !codsCross.has(e.codigo.toLowerCase().trim())).length, apenasCross: equipsAxCross.filter(e => !codsHub.has(e.codigo.toLowerCase().trim())).length },
          emAmbos:     hubDoStore.filter(e => codsCross.has(e.codigo.toLowerCase().trim())).map(e => ({ codigo: e.codigo, descricao: e.grupo || e.fabricante || "" })),
          apenasHub:   hubDoStore.filter(e => !codsCross.has(e.codigo.toLowerCase().trim())).map(e => ({ codigo: e.codigo, descricao: e.grupo || e.fabricante || "" })),
          apenasCross: equipsAxCross.filter(e => !codsHub.has(e.codigo.toLowerCase().trim())).map(e => ({ codigo: e.codigo, descricao: e.descricao || "" })),
          passos: [
            { tipo: "ok", msg: `AxHub (store): ${hubDoStore.length} equipamentos`, ts: new Date().toISOString() },
            { tipo: equipsAxCross.length > 0 ? "ok" : "alerta", msg: `AxCross: ${equipsAxCross.length} equipamentos`, ts: new Date().toISOString() },
          ],
        });
        continue;
      }

      // ─── Tenta 2: Perfil Chrome (cookies do usuário) ─────────────────────────
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

// ─── Abre URLs do AxHub no Chrome real do usuário (com sessão ativa) ──────────
// A extensão Chrome envia os dados automaticamente ao detectar a página
export function abrirAxHubNoChrome(req, res) {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || !urls.length) {
      return res.status(400).json({ erro: "urls[] é obrigatório" });
    }
    let abertas = 0;
    for (const url of urls) {
      const operacaoUrl = url.replace(/\/$/, "") + "/operacao";
      if (process.platform === "win32") exec(`start "" "${operacaoUrl}"`);
      else if (process.platform === "darwin") exec(`open "${operacaoUrl}"`);
      else exec(`xdg-open "${operacaoUrl}"`);
      abertas++;
      log(`Abrindo no Chrome: ${operacaoUrl}`);
    }
    return res.json({ ok: true, abertas, mensagem: `${abertas} site(s) AxHub abertos no Chrome.` });
  } catch (err) {
    return tratar(err, res, "Erro ao abrir Chrome");
  }
}

// ─── Captura AxHub via Chrome CDP (Remote Debugging Protocol) ────────────────
// Relança o Chrome com --remote-debugging-port=9222, conecta via CDP,
// navega para cada site AxHub (já autenticado), extrai dados e salva no store.
export async function capturarViaChromeCDP(req, res) {
  const { urls, contratos = [] } = req.body || {};
  if (!Array.isArray(urls) || !urls.length) {
    return res.status(400).json({ erro: "urls[] é obrigatório" });
  }

  // Mapa de credenciais: { "ibametro.axhub.axion.ws": {login, senha} }
  const credMap = {};
  for (const c of contratos) {
    if (c.axhubUrl && c.axhubLogin) {
      credMap[c.axhubUrl.replace(/https?:\/\//, "").replace(/\/$/, "")] = { login: c.axhubLogin, senha: c.axhubSenha };
    }
  }

  const CDP_URL = "http://localhost:9222";
  const resultados = [];
  let browser;

  try {
    // ── Passo 1: verifica se CDP já está ativo ────────────────────────────
    let cdpAtivo = false;
    try {
      const r = await fetch(`${CDP_URL}/json/version`, { signal: AbortSignal.timeout(2000) });
      if (r.ok) cdpAtivo = true;
    } catch {}

    if (!cdpAtivo) {
      // ── Passo 2: relança Chrome com CDP usando perfil temporário ─────────
      log("Chrome CDP não ativo — iniciando Chrome com remote debugging...");

      const chromePaths = [
        `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
      ].filter(p => existsSync(p));

      if (!chromePaths.length) {
        return res.status(500).json({ erro: "Chrome não encontrado. Instale o Google Chrome." });
      }

      // Usa perfil temporário (evita conflito de lock com Chrome principal)
      const tmpProfile = path.join(os.tmpdir(), "axhub-chrome-cdp");
      
      // Lança Chrome com perfil temp + CDP (NÃO mata o Chrome principal)
      exec(`"${chromePaths[0]}" --remote-debugging-port=9222 --user-data-dir="${tmpProfile}" --no-first-run --no-default-browser-check about:blank`);

      // Aguarda Chrome estar pronto (até 30s)
      let pronto = false;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 1000));
        try {
          const r = await fetch(`${CDP_URL}/json/version`, { signal: AbortSignal.timeout(1500) });
          if (r.ok) { pronto = true; log(`Chrome CDP pronto após ${i + 1}s`); break; }
        } catch {}
      }
      if (!pronto) return res.status(500).json({ erro: "Chrome não respondeu ao CDP após 30s. Tente novamente." });

      // Aguarda mais um pouco para sessões carregarem
      await new Promise(r => setTimeout(r, 3000));
    } else {
      log("Chrome CDP já está ativo!");
    }

    // ── Passo 3: conecta ao Chrome existente via CDP ──────────────────────
    // Usa chromium diretamente (sem stealth) — o browser já está rodando normalmente
    const { chromium: chromiumRaw } = await import("playwright");
    browser = await chromiumRaw.connectOverCDP(CDP_URL);
    const contexts = browser.contexts();
    const ctx = contexts.length > 0
      ? contexts[0]
      : await browser.newContext({ ignoreHTTPSErrors: true });

    // ── Passo 4: para cada site AxHub: login + captura ────────────────────
    for (const axhubUrl of urls) {
      const base = axhubUrl.replace(/\/$/, "");
      const key  = base.replace(/https?:\/\//, "");

      try {
        const page = await ctx.newPage();
        page.setDefaultTimeout(30_000);

        // Navega para /operacao — se já tem sessão, vai direto; senão redireciona para login
        await page.goto(`${base}/operacao`, { waitUntil: "domcontentloaded", timeout: 15_000 });
        await page.waitForTimeout(1000);

        let urlAtual = page.url();
        
        // Se redirecionou para login, tenta fazer login (Chrome real → Turnstile deve passar)
        if (urlAtual.includes("login") || urlAtual.includes("Login")) {
          log(`CDP: ${key} — fazendo login via POST (Turnstile no Chrome real)`);

          // Usa credenciais do request ou padrão Admin/Labor#5383
          const cred = credMap[key] || { login: "Admin", senha: "Labor#5383" };
          const login = cred.login;
          const senha = cred.senha;
          
          // Aguarda Turnstile resolver automaticamente (até 30s no Chrome real)
          let csrfToken = "";
          let turnstileToken = "";
          for (let t = 0; t < 50; t++) {
            await page.waitForTimeout(600);
            const tokens = await page.evaluate(() => ({
              turnstile: document.querySelector('[name="cf-turnstile-response"]')?.value || "",
              csrf:      document.querySelector('[name="__RequestVerificationToken"]')?.value || "",
            }));
            if (tokens.turnstile) {
              turnstileToken = tokens.turnstile;
              csrfToken = tokens.csrf;
              log(`CDP: Turnstile resolvido em ${(t * 0.6).toFixed(1)}s`);
              break;
            }
          }

          if (!turnstileToken) {
            log(`CDP: Turnstile não resolveu para ${key} — tentando POST sem token`);
          }

          // POST direto (mesmo método do loginAxHub — bypassa botão disabled)
          const loginUrl = `${base}/Home/Login`;
          const postResult = await page.evaluate(async ({ user, pass, turnstile, csrf, url }) => {
            const body = new URLSearchParams({ Username: user, Password: pass, KeepConnected: "true" });
            if (turnstile) { body.set("cf-turnstile-response", turnstile); body.set("TurnstileToken", turnstile); }
            if (csrf) body.set("__RequestVerificationToken", csrf);
            try {
              const r = await fetch(url, { method: "POST", credentials: "include", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString(), redirect: "follow" });
              return { status: r.status, url: r.url };
            } catch (e) { return { error: e.message }; }
          }, { user: login, pass: senha, turnstile: turnstileToken, csrf: csrfToken, url: loginUrl });

          log(`CDP: POST login ${key}: status=${postResult.status} url=${postResult.url}`);
          await page.goto(`${base}/operacao`, { waitUntil: "domcontentloaded", timeout: 15_000 });
          await page.waitForTimeout(1000);
          urlAtual = page.url();
        }

        if (urlAtual.includes("login") || urlAtual.includes("nao-autorizado")) {
          log(`CDP: não autenticado em ${key} — URL: ${urlAtual}`);
          await page.close();
          resultados.push({ key, ok: false, erro: "Sessão expirada — faça login no AxHub no Chrome" });
          continue;
        }

        log(`CDP: autenticado em ${key} — capturando dados`);

        // Executa fetch no contexto da página (contorna CORS — está dentro do domínio)
        const data = await page.evaluate(async (b) => {
          try {
            const r = await fetch(`${b}/operacao/datahandler?pageSize=500&page=1&skip=0&take=500`, {
              credentials: "include",
              headers: { "X-Requested-With": "XMLHttpRequest", "Accept": "application/json" },
            });
            return r.ok ? r.json() : null;
          } catch { return null; }
        }, base);

        await page.close();

        if (!data?.Data?.length) {
          log(`CDP: sem dados para ${key}`);
          resultados.push({ key, ok: false, erro: "Nenhum equipamento retornado" });
          continue;
        }

        const equips = data.Data.map(e => ({
          codigo:    e.Equipamento?.Descricao || e.CodigoEquipamento || "",
          grupo:     e.GrupoEquipamento || "",
          fabricante: e.FabricanteNome || "",
        })).filter(e => e.codigo);

        // Salva no store persistente
        hubDataStore.set(key, { equipamentos: equips, url: axhubUrl, ts: Date.now() });
        salvarStore(hubDataStore);

        log(`CDP: ${equips.length} equipamentos de ${key} salvos no store`);
        resultados.push({ key, ok: true, total: equips.length });

      } catch (e) {
        log(`CDP erro em ${key}: ${e.message}`);
        resultados.push({ key, ok: false, erro: e.message });
      }
    }

    // ── Passo 5: desconecta e fecha Chrome temporário ────────────────────
    await browser.close(); // fecha o Chrome temporário (não é o Chrome principal)

    const salvos = resultados.filter(r => r.ok).length;
    return res.json({
      ok: true,
      salvos,
      total: resultados.length,
      mensagem: `${salvos}/${resultados.length} sites capturados via Chrome. ${salvos > 0 ? "Execute o Depara agora." : ""}`,
      resultados,
    });

  } catch (err) {
    if (browser) await browser.disconnect().catch(() => {});
    return tratar(err, res, "Erro no captura CDP");
  }
}
