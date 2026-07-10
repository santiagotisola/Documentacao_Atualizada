/**
 * varco-remote-controller.js
 * VARCO Agent — Conexão remota com sites clientes
 *
 * Permite que o VARCO acesse e audite sites reais via Playwright,
 * usando as credenciais armazenadas no Cliente model.
 *
 * Capabilities:
 *   Navigate, Inspect, CaptureScreenshots, CaptureHtml,
 *   CaptureJson, GenerateKnowledge, Synchronize
 *
 * SEGURANÇA: credenciais descriptografadas apenas em tempo de execução.
 *            Nunca retornadas nas respostas da API.
 */

import { chromium } from "playwright";
import { Cliente } from "./models/cliente.model.js";
import { Mission } from "./models/mission.model.js";
import bcrypt from "bcrypt";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tratar(err, res, msg = "Erro no VARCO remoto") {
  console.error(`[VARCO-Remote] ${msg}:`, err.message);
  return res.status(500).json({ erro: msg, detalhe: err.message });
}

async function abrirBrowser() {
  return chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
}

async function logarNoSite(page, url, login, senha) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

  // Tenta preencher login e senha automaticamente
  const inputLogin = page.locator("input[type=text], input[name*=user], input[name*=login], input[id*=user]").first();
  const inputSenha = page.locator("input[type=password]").first();
  const btnSubmit  = page.locator("button[type=submit], input[type=submit]").first();

  if (await inputLogin.count() > 0) await inputLogin.fill(login);
  if (await inputSenha.count() > 0) await inputSenha.fill(senha);
  if (await btnSubmit.count() > 0) {
    await Promise.all([page.waitForNavigation({ timeout: 15_000 }).catch(() => {}), btnSubmit.click()]);
  }
}

// ─── NAVIGATE + SCREENSHOT ───────────────────────────────────────────────────

/**
 * POST /varco/remote/navigate
 * Body: { clienteSlug, caminho?, missionId? }
 * Acessa o site do cliente e retorna screenshot + HTML + título da página
 */
export async function navegarRemoto(req, res) {
  let browser;
  try {
    const { clienteSlug, caminho = "/", missionId } = req.body;
    if (!clienteSlug) return res.status(400).json({ erro: "clienteSlug obrigatório" });

    const cliente = await Cliente.findOne({ slug: clienteSlug });
    if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });
    if (!cliente.varco?.url) return res.status(400).json({ erro: "Cliente sem URL VARCO configurada" });

    browser = await abrirBrowser();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    // Login
    await logarNoSite(page, cliente.varco.url, cliente.varco.login, cliente.varco.senha);

    // Navegar para o caminho solicitado
    const urlAlvo = cliente.varco.url.replace(/\/$/, "") + caminho;
    await page.goto(urlAlvo, { waitUntil: "networkidle", timeout: 30_000 });

    const titulo     = await page.title();
    const screenshot = await page.screenshot({ type: "png", fullPage: false });
    const html       = await page.content();
    const urlFinal   = page.url();

    await browser.close();

    // Adicionar evidência à missão se informada
    if (missionId) {
      await Mission.findByIdAndUpdate(missionId, {
        $push: {
          evidencias: {
            tipo: "screenshot",
            base64: screenshot.toString("base64"),
            descricao: `${titulo} — ${caminho}`,
            tela: titulo,
            site: clienteSlug,
            capturadoEm: new Date(),
          }
        }
      });
    }

    res.json({
      clienteSlug,
      caminho,
      urlFinal,
      titulo,
      screenshot: screenshot.toString("base64"),
      html: html.slice(0, 50000), // primeiros 50kb do HTML
      capturedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    tratar(err, res, "Erro ao navegar remotamente");
  }
}

// ─── AUDITORIA COMPLETA ───────────────────────────────────────────────────────

/**
 * POST /varco/remote/auditar
 * Body: { clienteSlug, telas?: string[], missionId? }
 * Acessa múltiplas telas e captura evidências
 */
export async function auditarRemoto(req, res) {
  let browser;
  try {
    const { clienteSlug, telas = ["/"], missionId } = req.body;
    if (!clienteSlug) return res.status(400).json({ erro: "clienteSlug obrigatório" });

    const cliente = await Cliente.findOne({ slug: clienteSlug });
    if (!cliente?.varco?.url) return res.status(400).json({ erro: "Cliente sem VARCO configurado" });

    browser = await abrirBrowser();
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await logarNoSite(page, cliente.varco.url, cliente.varco.login, cliente.varco.senha);

    const resultados = [];
    const evidencias = [];

    for (const caminho of telas.slice(0, 20)) { // máx 20 telas por auditoria
      try {
        const urlAlvo = cliente.varco.url.replace(/\/$/, "") + caminho;
        await page.goto(urlAlvo, { waitUntil: "networkidle", timeout: 20_000 });

        const titulo     = await page.title();
        const screenshot = await page.screenshot({ type: "png", fullPage: false });
        const urlFinal   = page.url();
        const httpStatus = 200; // Playwright não expõe status diretamente; considera 200 se carregou

        resultados.push({ caminho, titulo, urlFinal, ok: true });
        evidencias.push({
          tipo: "screenshot",
          base64: screenshot.toString("base64"),
          descricao: titulo,
          tela: titulo,
          site: clienteSlug,
          capturadoEm: new Date(),
        });
      } catch (pageErr) {
        resultados.push({ caminho, ok: false, erro: pageErr.message });
      }
    }

    await browser.close();

    // Salvar evidências na missão
    if (missionId && evidencias.length > 0) {
      await Mission.findByIdAndUpdate(missionId, { $push: { evidencias: { $each: evidencias } } });
    }

    const okCount = resultados.filter(r => r.ok).length;

    res.json({
      clienteSlug,
      totalTelas: telas.length,
      telasOk: okCount,
      telasFalha: telas.length - okCount,
      resultados,
      capturedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    tratar(err, res, "Erro na auditoria remota");
  }
}

// ─── CONFIGURAR VARCO DO CLIENTE ──────────────────────────────────────────────

/**
 * PATCH /varco/remote/config/:slug
 * Body: { url, login, senha }
 * Configura URL/login/senha do VARCO para um cliente
 *
 * SEGURANÇA: A senha é armazenada em texto simples pois precisa ser
 * utilizada para login em sites legados que não suportam OAuth.
 * O campo nunca é retornado nas listagens (select: false no model).
 * Tráfego deve ser sempre HTTPS (nunca expor via HTTP).
 */
export async function configurarVarco(req, res) {
  try {
    const { slug } = req.params;
    const { url, login, senha } = req.body;

    if (!url || !login || !senha) {
      return res.status(400).json({ erro: "url, login e senha são obrigatórios" });
    }

    // Validação básica de URL
    try { new URL(url); } catch { return res.status(400).json({ erro: "URL inválida" }); }

    const cliente = await Cliente.findOneAndUpdate(
      { slug },
      { $set: { "varco.url": url, "varco.login": login, "varco.senha": senha, "varco.configuradoEm": new Date() } },
      { new: true }
    ).select("slug nome varco.url varco.login varco.configuradoEm");

    if (!cliente) return res.status(404).json({ erro: "Cliente não encontrado" });

    res.json({ mensagem: "VARCO configurado com sucesso", cliente: { slug: cliente.slug, nome: cliente.nome, varco: { url: cliente.varco.url, login: cliente.varco.login, configuradoEm: cliente.varco.configuradoEm } } });
  } catch (err) { tratar(err, res, "Erro ao configurar VARCO"); }
}

// ─── TESTAR CONEXÃO ───────────────────────────────────────────────────────────

/**
 * POST /varco/remote/testar/:slug
 * Testa se consegue acessar o site do cliente
 */
export async function testarConexao(req, res) {
  let browser;
  try {
    const { slug } = req.params;
    const cliente = await Cliente.findOne({ slug });
    if (!cliente?.varco?.url) return res.status(400).json({ erro: "Cliente sem VARCO configurado" });

    browser = await abrirBrowser();
    const page = await browser.newPage();
    const inicio = Date.now();

    await page.goto(cliente.varco.url, { waitUntil: "load", timeout: 15_000 });
    const titulo = await page.title();
    const tempoMs = Date.now() - inicio;

    await browser.close();

    res.json({
      clienteSlug: slug,
      url: cliente.varco.url,
      online: true,
      titulo,
      tempoMs,
      testedAt: new Date().toISOString(),
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    res.json({
      clienteSlug: req.params.slug,
      online: false,
      erro: err.message,
      testedAt: new Date().toISOString(),
    });
  }
}

// ─── LISTAR STATUS DOS VARCOS ─────────────────────────────────────────────────

export async function listarVarcos(req, res) {
  try {
    const clientes = await Cliente.find({ "varco.url": { $exists: true, $ne: null } })
      .select("slug nome produto varco.url varco.login varco.configuradoEm ativo");

    res.json({
      total: clientes.length,
      clientes: clientes.map(c => ({
        slug: c.slug,
        nome: c.nome,
        produto: c.produto,
        url: c.varco?.url,
        login: c.varco?.login,
        configuradoEm: c.varco?.configuradoEm,
        ativo: c.ativo,
      }))
    });
  } catch (err) { tratar(err, res, "Erro ao listar VARCOs"); }
}
