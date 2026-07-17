/**
 * itscam-automation.js
 * Serviço de automação Playwright para login e correção de equipamentos ITSCAM
 * 
 * Usa chromium headless para:
 * 1. Abrir a interface web do ITSCAM via túnel VARCO
 * 2. Fazer login automático com credenciais padrão
 * 3. Extrair o JWT da cookie 'auth'
 * 4. Aplicar correções via API REST do dispositivo
 */

import { chromium } from "playwright";

const ITSCAM_USER = "admin";
const ITSCAM_PASS = "#econocr@";

let browser = null;

async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  }
  return browser;
}

/**
 * Faz login no ITSCAM via Playwright e retorna o JWT token
 */
async function loginItscam(tunnelBase) {
  const br = await getBrowser();
  const ctx = await br.newContext({ ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  
  try {
    await page.goto(`${tunnelBase}/login`, { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1500);
    
    // Usar React native setter para inputs controlados
    await page.evaluate((creds) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
      const inputs = document.querySelectorAll("input");
      const userInput = [...inputs].find(i => i.type !== "password");
      const passInput = [...inputs].find(i => i.type === "password");
      if (userInput) { setter.call(userInput, creds.user); userInput.dispatchEvent(new Event("input", { bubbles: true })); }
      if (passInput) { setter.call(passInput, creds.pass); passInput.dispatchEvent(new Event("input", { bubbles: true })); }
    }, { user: ITSCAM_USER, pass: ITSCAM_PASS });
    
    await page.waitForTimeout(800);
    
    // Clicar no botão Entrar (método JS para evitar bloqueio)
    await page.evaluate(() => {
      const btn = document.querySelector("button[type='submit']:not([disabled])");
      if (btn) btn.click();
    });
    
    await page.waitForTimeout(4000);
    
    // Extrair token do cookie auth
    const token = await page.evaluate(() => {
      try {
        return JSON.parse(decodeURIComponent(document.cookie.match(/auth=([^;]+)/)[1])).token;
      } catch { return null; }
    });
    
    return token;
  } finally {
    await ctx.close();
  }
}

/**
 * Aplica correções CR-01 e CR-02 em um equipamento ITSCAM
 * @param {string} tunnelBase - URL base do túnel (ex: https://uuid-80.tunnel.varco.cloud)
 * @param {object} opts - { minProbability: 60, useClassifierResult: true }
 */
export async function corrigirEquipamento(tunnelBase, opts = {}) {
  const { minProbability = 60, useClassifierResult = true } = opts;
  
  const token = await loginItscam(tunnelBase);
  if (!token) {
    return { ok: false, erro: "Login falhou — token não obtido" };
  }
  
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  
  const resultados = {};
  
  // CR-01: minProbability
  try {
    const r1 = await fetch(`${tunnelBase}/api/equipment/classifier`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ classifier: { minProbability } }),
    });
    const d1 = await r1.json();
    resultados.cr01 = {
      ok: r1.ok && d1.classifier?.minProbability === minProbability,
      status: r1.status,
      valor: d1.classifier?.minProbability,
    };
  } catch (e) {
    resultados.cr01 = { ok: false, erro: e.message };
  }
  
  // CR-02: useClassifierResult
  try {
    const r2 = await fetch(`${tunnelBase}/api/equipment/ocr`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ ocr: { useClassifierResult } }),
    });
    const d2 = await r2.json();
    resultados.cr02 = {
      ok: r2.ok && d2.ocr?.useClassifierResult === useClassifierResult,
      status: r2.status,
      valor: d2.ocr?.useClassifierResult,
    };
  } catch (e) {
    resultados.cr02 = { ok: false, erro: e.message };
  }
  
  return {
    ok: resultados.cr01?.ok && resultados.cr02?.ok,
    token: token.substring(0, 20) + "...",
    cr01: resultados.cr01,
    cr02: resultados.cr02,
  };
}

/**
 * Lê a configuração atual de um equipamento ITSCAM
 */
export async function lerConfigEquipamento(tunnelBase) {
  const token = await loginItscam(tunnelBase);
  if (!token) return { ok: false, erro: "Login falhou" };
  
  const headers = { "Authorization": `Bearer ${token}` };
  
  const [rCls, rOcr, rSrv] = await Promise.all([
    fetch(`${tunnelBase}/api/equipment/classifier`, { headers }).then(r => r.json()).catch(() => null),
    fetch(`${tunnelBase}/api/equipment/ocr`, { headers }).then(r => r.json()).catch(() => null),
    fetch(`${tunnelBase}/api/equipment/servers`, { headers }).then(r => r.json()).catch(() => null),
  ]);
  
  return {
    ok: true,
    classificador: rCls?.classifier || null,
    ocr: rOcr?.ocr || null,
    servers: rSrv?.servers || {},
  };
}

/**
 * Aplica configurações específicas (De-Para) em um equipamento
 * @param {string} tunnelBase
 * @param {object} campos - campos a aplicar: { minProbability, useClassifierResult, sceneType, enableCharacteristics, maxPlates }
 */
export async function aplicarConfigEquipamento(tunnelBase, campos = {}) {
  const token = await loginItscam(tunnelBase);
  if (!token) return { ok: false, erro: "Login falhou" };
  
  const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };
  const resultados = {};
  
  // Separar campos por endpoint
  const clsFields = ["minProbability", "sceneType", "enableCharacteristics", "enabled", "modelType", "processingThreads", "processingQueue"];
  const ocrFields = ["useClassifierResult", "maxPlates", "processingMode", "processingThreads", "processingQueue", "processingTimeout"];
  
  const clsBody = {}, ocrBody = {};
  for (const [k, v] of Object.entries(campos)) {
    if (clsFields.includes(k)) clsBody[k] = v;
    if (ocrFields.includes(k)) ocrBody[k] = v;
  }
  
  if (Object.keys(clsBody).length > 0) {
    try {
      const r = await fetch(`${tunnelBase}/api/equipment/classifier`, { method: "PUT", headers, body: JSON.stringify({ classifier: clsBody }) });
      const d = await r.json();
      resultados.classifier = { ok: r.ok, status: r.status, data: d.classifier };
    } catch (e) { resultados.classifier = { ok: false, erro: e.message }; }
  }
  
  if (Object.keys(ocrBody).length > 0) {
    try {
      const r = await fetch(`${tunnelBase}/api/equipment/ocr`, { method: "PUT", headers, body: JSON.stringify({ ocr: ocrBody }) });
      const d = await r.json();
      resultados.ocr = { ok: r.ok, status: r.status, data: d.ocr };
    } catch (e) { resultados.ocr = { ok: false, erro: e.message }; }
  }
  
  const allOk = Object.values(resultados).every(r => r.ok);
  return { ok: allOk, resultados, token: token.substring(0, 20) + "..." };
}

export async function closeBrowser() {
  if (browser) { await browser.close(); browser = null; }
}
