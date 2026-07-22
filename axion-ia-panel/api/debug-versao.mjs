/**
 * debug-versao.mjs
 * Abre o browser, faz login na homologação e captura o texto do footer
 */
import { connect as realBrowserConnect } from 'puppeteer-real-browser';
import { readFileSync, writeFileSync } from 'fs';

const URL    = 'https://ipempe.axhub.axion.ws';  // produção (homologação tem senha diferente)
const LOGIN  = 'Admin';
const SENHA  = 'Labor#5383';

console.log('[debug] Conectando browser...');
const { browser, page } = await realBrowserConnect({
  headless: false,
  args: ['--no-sandbox', '--ignore-certificate-errors'],
  customConfig: {},
  turnstile: true,
  connectOption: { defaultViewport: null },
  disableXvfb: false,
  ignoreAllFlags: false,
});

page.setDefaultTimeout(30000);

console.log('[debug] Navegando para login...');
await page.goto(`${URL}/Home/Login`, { waitUntil: 'domcontentloaded', timeout: 25000 });
await new Promise(r => setTimeout(r, 2000));

// Preencher login
await page.evaluate((l, s) => {
  document.querySelector('#Username').value = l;
  document.querySelector('#Password').value = s;
  document.querySelector('#Username').dispatchEvent(new Event('input', { bubbles: true }));
  document.querySelector('#Password').dispatchEvent(new Event('input', { bubbles: true }));
}, LOGIN, SENHA);

console.log('[debug] Aguardando Turnstile (até 45s)...');
await page.waitForFunction(() => {
  const btn = document.querySelector('#btn-login, button[type="submit"]');
  return btn && !btn.disabled;
}, { timeout: 45000 }).catch(() => console.log('[debug] Turnstile timeout'));

console.log('[debug] Clicando submit...');
await page.click('#btn-login, button[type="submit"]').catch(() => {});
await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 35000 }).catch(() => {});
await new Promise(r => setTimeout(r, 3000));

const urlAtual = page.url();
console.log('[debug] URL atual:', urlAtual);
console.log('[debug] Título:', await page.title());

// Captura footer
const footer = await page.evaluate(() => {
  const f = document.querySelector('footer, .footer, #footer');
  return f ? f.innerText : null;
});
console.log('[debug] Footer:', footer);

// Busca versão
const versaoTexto = await page.evaluate(() => {
  const txt = document.documentElement.innerText;
  // Busca padrão AxHub
  const m = txt.match(/Ax(?:Hub|Cross)\s+v\.?\s*([\d]+\.[\d]+\.[\d]+)/i);
  if (m) return `FOUND: v.${m[1]}`;
  // Busca genérica
  const m2 = txt.match(/v\.([\d]+\.[\d]+\.[\d]+)/);
  if (m2) return `GENERIC: v.${m2[1]}`;
  return 'NOT FOUND';
});
console.log('[debug] Versão:', versaoTexto);

// Salva primeiros 2000 chars do body text para análise
const bodyText = await page.evaluate(() => document.documentElement.innerText?.substring(0, 3000) || '');
writeFileSync('./debug-body.txt', bodyText);
console.log('[debug] Body salvo em debug-body.txt');

// Salva HTML do footer se existir
const footerHtml = await page.evaluate(() => {
  const f = document.querySelector('footer');
  return f ? f.outerHTML : 'NENHUM FOOTER';
});
writeFileSync('./debug-footer.html', footerHtml);
console.log('[debug] Footer HTML:', footerHtml.substring(0, 300));

await browser.close();
console.log('[debug] Concluído!');
