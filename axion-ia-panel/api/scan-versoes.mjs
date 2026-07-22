/**
 * scan-versoes.mjs
 * Varre os sites que falharam no scan automático para capturar versões corretas.
 * Usa puppeteer-real-browser com Admin / Labor#5383
 */
import { connect as realBrowserConnect } from 'puppeteer-real-browser';
import { writeFileSync } from 'fs';

// Sites que falharam no scan automático (versões potencialmente desatualizadas)
const SITES = [
  { id: 'ibametro',   url: 'https://ibametro.axhub.axion.ws',   versaoAtual: 'v.1.2.3' },
  { id: 'imepi',      url: 'https://imepi.axhub.axion.ws',      versaoAtual: 'v.1.2.3' },
  { id: 'imeqpb',     url: 'https://imeqpb.axhub.axion.ws',     versaoAtual: 'v.1.2.3' },
  { id: 'imetropa',   url: 'https://imetropa.axhub.axion.ws',   versaoAtual: 'v.1.2.3' },
  { id: 'ipemce',     url: 'https://ipemce.axhub.axion.ws',     versaoAtual: 'v.1.2.1' },
  { id: 'smtt',       url: 'https://smtt.axhub.axion.ws',       versaoAtual: 'v.1.2.1' },
  { id: 'imperatriz', url: 'https://imperatriz.axhub.axion.ws', versaoAtual: 'v.1.2.0' },
  { id: 'goiania',    url: 'https://goiania.axhub.axion.ws',    versaoAtual: 'v.1.2.0' },
  { id: 'economia',   url: 'https://economia.axhub.axion.ws',   versaoAtual: 'v.1.1.1' },
];

const CREDENCIAIS = [
  { login: 'Admin',                          senha: 'Labor#5383' },
  { login: 'admin',                          senha: 'Labor#5383' },
  { login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026' },
];

async function extrairVersao(page) {
  return page.evaluate(() => {
    const txt = document.documentElement.innerText || '';
    const m = txt.match(/Ax(?:Hub|Cross)\s+v\.?\s*([\d]+\.[\d]+\.[\d]+)/i)
           || txt.match(/\bv([\d]+\.[\d]+\.[\d]+)\b/);
    return m ? `v.${m[1]}` : null;
  });
}

async function fillInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 8000 });
  await page.evaluate((sel, val) => {
    const el = document.querySelector(sel);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }, selector, value);
}

async function tentarLogin(page, url, login, senha) {
  await page.goto(`${url}/Home/Login`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await new Promise(r => setTimeout(r, 1500));
  await fillInput(page, '#Username', login);
  await fillInput(page, '#Password', senha);
  await page.waitForFunction(() => {
    const btn = document.querySelector('#btn-login, button[type="submit"]');
    return btn && !btn.disabled;
  }, { timeout: 35000 }).catch(() => {});
  await page.click('#btn-login, button[type="submit"]').catch(() => {});
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  return !page.url().toLowerCase().includes('/login');
}

console.log('🔍 Iniciando scan de versões para sites não verificados...\n');

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

const resultados = [];

for (const site of SITES) {
  const inicio = Date.now();
  let versao = null;
  let credUsada = null;

  for (const cred of CREDENCIAIS) {
    try {
      console.log(`  ${site.id}: tentando ${cred.login}...`);
      const ok = await tentarLogin(page, site.url, cred.login, cred.senha);
      if (ok) {
        await new Promise(r => setTimeout(r, 2000));
        versao = await extrairVersao(page);
        if (!versao) {
          await page.goto(`${site.url}/`, { waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {});
          await new Promise(r => setTimeout(r, 2000));
          versao = await extrairVersao(page);
        }
        credUsada = cred.login;
        break;
      }
    } catch(e) {
      console.log(`    falhou: ${e.message.substring(0, 60)}`);
    }
  }

  const ms = Date.now() - inicio;
  const status = versao ? '✅' : '❌';
  const mudou = versao && versao !== site.versaoAtual ? ' ⚠️  MUDOU!' : '';
  console.log(`${status} ${site.id}: ${versao || 'NÃO ENCONTRADO'} (era ${site.versaoAtual})${mudou} [${ms}ms]`);

  resultados.push({ ...site, versaoNova: versao, credUsada, ms });

  // Limpar antes do próximo
  await page.goto('about:blank', { timeout: 5000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 500));
}

await browser.close();

console.log('\n═══════════════════════════════════════════');
console.log('RESULTADO DO SCAN:');
resultados.forEach(r => {
  const mudou = r.versaoNova && r.versaoNova !== r.versaoAtual;
  console.log(`${mudou ? '⚠️  ' : '   '}${r.id}: ${r.versaoAtual} → ${r.versaoNova || 'FALHOU'}`);
});

// Salvar resultado
writeFileSync('./resultado-scan.json', JSON.stringify(resultados, null, 2));
console.log('\nResultado salvo em resultado-scan.json');
