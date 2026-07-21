/**
 * sites-versions-controller.js
 * Captura a versão atual de cada site AxHub/AxCross usando puppeteer-real-browser
 * (necessário para sites com Cloudflare Turnstile no login).
 *
 * Fluxo:
 *   1. Abre UM browser real
 *   2. Para cada site: abre nova aba, faz login, lê o footer, fecha aba
 *   3. Fecha o browser
 *   4. Retorna mapa { siteId: versão }
 */

import { connect as realBrowserConnect } from 'puppeteer-real-browser';

const LOGIN_AXHUB   = process.env.AXHUB_LOGIN_ADMIN   || 'Admin';
const SENHA_AXHUB   = process.env.AXHUB_SENHA_ADMIN   || 'Labor#5383';
const LOGIN_SUPORTE = process.env.AXHUB_LOGIN_SUPORTE  || 'suporte@axiontecnologia.com.br';
const SENHA_SUPORTE = process.env.AXHUB_SENHA_SUPORTE  || 'Axion@2026';

// ─── Extrai versão do rodapé da página ───────────────────────────────────────
async function extrairVersaoPagina(page) {
  return page.evaluate(() => {
    // Busca em todo o documento (body text + links + hidden elements)
    const allText = document.documentElement.innerText || document.documentElement.textContent || '';

    // Padrão primário: "AxHub v.1.2.5" ou "AxCross v1.2.0"
    const m1 = allText.match(/Ax(?:Hub|Cross)\s+v\.?\s*([\d]+\.[\d]+\.[\d]+)/i);
    if (m1) return `v.${m1[1]}`;

    // Padrão em atributos (data-version, title, etc.)
    const versioned = document.querySelector('[data-version], [data-ver]');
    if (versioned) {
      const v = versioned.dataset.version || versioned.dataset.ver || '';
      const m = v.match(/([\d]+\.[\d]+\.[\d]+)/);
      if (m) return `v.${m[1]}`;
    }

    // Busca em links/spans do footer
    const footerEls = document.querySelectorAll('footer *, .footer *, #footer *, [class*="footer"] *');
    for (const el of footerEls) {
      const t = el.textContent || '';
      const m = t.match(/Ax(?:Hub|Cross)\s+v\.?\s*([\d]+\.[\d]+\.[\d]+)/i)
             || t.match(/v\.?\s*([\d]+\.[\d]+\.[\d]+)/i);
      if (m) return `v.${m[1]}`;
    }

    // Busca em TODOS os elementos <a>
    const links = Array.from(document.querySelectorAll('a'));
    for (const a of links) {
      const t = a.textContent || '';
      const m = t.match(/v\.?\s*([\d]+\.[\d]+\.[\d]+)/i);
      if (m) return `v.${m[1]}`;
    }

    return null;
  });
}

// ─── Preenche input via evaluate (evita problemas com teclado PT-BR) ─────────
async function fillInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 8000 });
  await page.evaluate((sel, val) => {
    const el = document.querySelector(sel);
    if (el) {
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, selector, value);
}

// ─── Login AxHub ──────────────────────────────────────────────────────────────
async function loginAxHub(page, url, login, senha, oidcUrl) {
  const loginPath = oidcUrl || `${url}/Home/Login`;
  await page.goto(loginPath, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await new Promise(r => setTimeout(r, 1500));
  // OIDC usa Email, AxHub padrão usa Username
  const usernameSelector = oidcUrl ? '#Input_Email, #Email, #username' : '#Username';
  await fillInput(page, usernameSelector, login);
  await fillInput(page, '#Input_Password, #Password', senha);

  // Aguarda o Turnstile resolver e o botão ficar habilitado (até 45s)
  console.log(`[versions] Aguardando Turnstile em ${url}...`);
  await page.waitForFunction(() => {
    const btn = document.querySelector('#btn-login, button[type="submit"]');
    return btn && !btn.disabled;
  }, { timeout: 45000 }).catch(() => {
    console.log('[versions] Turnstile não resolveu em 45s — tentando clicar mesmo assim');
  });

  await page.click('#btn-login, button[type="submit"]').catch(() => {});
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 35000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  const cur = page.url().toLowerCase();
  const ok = !cur.includes('/login');
  console.log(`[versions] Login ${url}: ${ok ? 'OK' : 'FALHOU'} (url=${page.url()})`);
  return ok;
}

// ─── Login AxCross ────────────────────────────────────────────────────────────
async function loginAxCross(page, url, login, senha) {
  await page.goto(`${url}/account/login`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await new Promise(r => setTimeout(r, 2000));
  // AxCross pode usar #Email (padrão), #Input_Email (OIDC ASP.NET Identity) ou #email
  const emailSel = await page.evaluate(() => {
    const sels = ['#Email', '#Input_Email', '#email', 'input[type="email"]', 'input[name="Email"]'];
    for (const s of sels) { if (document.querySelector(s)) return s; }
    return null;
  });
  if (!emailSel) {
    // Sem campo de e-mail visível: talvez seja OIDC puro ou página diferente
    console.log(`[versions] AxCross ${url}: sem campo email, tentando Username`);
    const userSel = await page.evaluate(() => {
      const sels = ['#Username', 'input[name="Username"]', 'input[type="text"]'];
      for (const s of sels) { if (document.querySelector(s)) return s; }
      return null;
    });
    if (!userSel) throw new Error('Sem campo de login na página');
    await fillInput(page, userSel, login);
  } else {
    await fillInput(page, emailSel, login);
  }
  const passSel = '#Input_Password, #Password, input[type="password"]';
  await fillInput(page, passSel, senha);
  // Aguarda botão habilitar
  await page.waitForFunction(() => {
    const btn = document.querySelector('button[type="submit"]');
    return btn && !btn.disabled;
  }, { timeout: 30000 }).catch(() => {});
  await page.click('button[type="submit"]').catch(() => {});
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));
  const cur = page.url();
  const ok = !cur.includes('/account/login') && !cur.includes('/Account/Login');
  console.log(`[versions] AxCross ${url}: ${ok ? 'OK' : 'FALHOU'} (url=${cur})`);
  return ok;
}

// ─── Lista de sites ───────────────────────────────────────────────────────────
const TODOS_SITES = [
  { id: 'ibametro',          url: 'https://ibametro.axhub.axion.ws',      produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'imepi',             url: 'https://imepi.axhub.axion.ws',         produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'imeqpb',            url: 'https://imeqpb.axhub.axion.ws',        produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'imetropa',          url: 'https://imetropa.axhub.axion.ws',      produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'ipemce',            url: 'https://ipemce.axhub.axion.ws',        produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'ipempe',            url: 'https://ipempe.axhub.axion.ws',        produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'derse',             url: 'https://derse.axhub.axion.ws',         produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'strans',            url: 'https://strans.axhub.axion.ws',        produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'detranma',          url: 'https://detranma.axhub.axion.ws',      produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'detranpi',          url: 'https://detranpi.axhub.axion.ws',      produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'goiania',      url: 'https://goiania.axhub.axion.ws',       produto: 'axhub',   login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', oidcUrl: 'https://goiania.id.axion.ws/Account/Login' },
  { id: 'ipemmt',            url: 'https://ipemmt.axhub.axion.ws',        produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'itps',              url: 'https://itps.axhub.axion.ws',          produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'smtt',              url: 'https://smtt.axhub.axion.ws',          produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'economia',     url: 'https://economia.axhub.axion.ws',     produto: 'axhub',   login: 'suporte@axiontecnologia.com.br', senha: 'Axion@2026', oidcUrl: 'https://economia.axion.ws/Account/Login' },
  { id: 'imperatriz',        url: 'https://imperatriz.axhub.axion.ws',    produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'homologacao',       url: 'https://homologacao.axhub.axion.ws',   produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'setrans',           url: 'https://setrans.axhub.axion.ws',       produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'smstrr',            url: 'https://smstrr.axhub.axion.ws',        produto: 'axhub',   login: LOGIN_AXHUB,   senha: SENHA_AXHUB },
  { id: 'derse-cross',       url: 'https://derse.axcross.axion.ws',       produto: 'axcross', login: LOGIN_SUPORTE, senha: SENHA_SUPORTE },
  { id: 'detranpi-cross',    url: 'https://detranpi.axcross.axion.ws',    produto: 'axcross', login: LOGIN_SUPORTE, senha: SENHA_SUPORTE },
  { id: 'detranma-cross',    url: 'https://detranma.axcross.axion.ws',    produto: 'axcross', login: LOGIN_SUPORTE, senha: SENHA_SUPORTE },
  { id: 'imperatriz-cross',  url: 'https://imperatriz.axcross.axion.ws',  produto: 'axcross', login: LOGIN_SUPORTE, senha: SENHA_SUPORTE },
  { id: 'ipemce-cross',      url: 'https://ipemce.axcross.axion.ws',      produto: 'axcross', login: LOGIN_SUPORTE, senha: SENHA_SUPORTE },
  { id: 'ipemmt-cross',      url: 'https://ipemmt.axcross.axion.ws',      produto: 'axcross', login: LOGIN_SUPORTE, senha: SENHA_SUPORTE },
  { id: 'ipempe-cross',      url: 'https://ipempe.axcross.axion.ws',      produto: 'axcross', login: LOGIN_SUPORTE, senha: SENHA_SUPORTE },
  { id: 'sefazpi-cross',     url: 'https://sefazpi.axcross.axion.ws',     produto: 'axcross', login: LOGIN_SUPORTE, senha: SENHA_SUPORTE },
  { id: 'goiania-cross',     url: 'https://goiania.axcross.axion.ws',     produto: 'axcross', login: LOGIN_SUPORTE, senha: 'Axion@2026' },
  { id: 'economia-cross',    url: 'https://economia.axcross.axion.ws',    produto: 'axcross', login: LOGIN_SUPORTE, senha: 'Axion@2026' },
  { id: 'setrans-cross',     url: 'https://setrans.axcross.axion.ws',     produto: 'axcross', login: LOGIN_SUPORTE, senha: SENHA_SUPORTE },
  { id: 'smtt-cross',        url: 'https://smtt.axcross.axion.ws',        produto: 'axcross', login: LOGIN_SUPORTE, senha: SENHA_SUPORTE },
  { id: 'homologacao-cross', url: 'https://homologacao.axcross.axion.ws', produto: 'axcross', login: LOGIN_SUPORTE, senha: SENHA_SUPORTE },
];

// ─── Estado do job singleton ──────────────────────────────────────────────────
let jobAtivo = null;
let ultimoResultado = null; // cache do último scan concluído

// ─── POST /api/sites/versions — inicia scraping ───────────────────────────────
export async function buscarVersoesSites(req, res) {
  if (jobAtivo) {
    return res.json({
      status: 'em_andamento',
      progresso: jobAtivo.progresso,
      resultados: jobAtivo.resultados,
    });
  }

  const sitesReq = req.body?.sites || null;
  const lista = sitesReq
    ? TODOS_SITES.filter(s => sitesReq.some(r => r.id === s.id))
    : TODOS_SITES;

  jobAtivo = {
    progresso: { atual: 0, total: lista.length, ok: 0 },
    resultados: [],
  };

  // Resposta imediata — processamento assíncrono
  res.json({
    status: 'iniciado',
    total: lista.length,
    msg: 'Scraping iniciado. Consulte GET /api/sites/versions/status para acompanhar.',
  });

  // ─── Worker assíncrono ──────────────────────────────────────────────────────
  (async () => {
    let browser = null;
    try {
      const conn = await realBrowserConnect({
        headless: false,
        args: ['--no-sandbox', '--ignore-certificate-errors'],
        customConfig: {},
        turnstile: true,
        connectOption: { defaultViewport: null },
        disableXvfb: false,
        ignoreAllFlags: false,
      });
      browser = conn.browser;
      // Usa a página principal para todos os sites (navega em vez de abrir novas abas)
      const page = conn.page;
      page.setDefaultTimeout(35000);
      // Pausa inicial para o browser estabilizar
      await new Promise(r => setTimeout(r, 2000));

      for (const site of lista) {
        const inicio = Date.now();
        let versao = null;
        let status = 'erro';
        let erro = null;

        try {
          let logado = false;
          try {
            if (site.produto === 'axhub') {
              logado = await loginAxHub(page, site.url, site.login, site.senha, site.oidcUrl);
              if (!logado) logado = await loginAxHub(page, site.url, LOGIN_SUPORTE, SENHA_SUPORTE, site.oidcUrl);
            } else {
              logado = await loginAxCross(page, site.url, site.login, site.senha);
            }
          } catch (e) {
            erro = e.message;
          }

          if (logado) {
            // Extrai versão direto da página pós-login
            await new Promise(r => setTimeout(r, 2000));
            versao = await extrairVersaoPagina(page);

            if (!versao) {
              await page.goto(`${site.url}/`, { waitUntil: 'networkidle2', timeout: 25000 }).catch(() => {});
              await new Promise(r => setTimeout(r, 2000));
              versao = await extrairVersaoPagina(page);
            }

            // Última tentativa: HTML bruto
            if (!versao) {
              versao = await page.evaluate(() => {
                const html = document.documentElement.outerHTML;
                const m = html.match(/Ax(?:Hub|Cross)\s+v\.?\s*([\d]+\.[\d]+\.[\d]+)/i)
                       || html.match(/v\.([\d]+\.[\d]+\.[\d]+)/);
                return m ? `v.${m[1]}` : null;
              }).catch(() => null);
            }

            status = versao ? 'ok' : 'sem_versao';
          }

          // Logout para não interferir no próximo site
          await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          erro = e.message;
          status = 'erro';
        }

        const resultado = {
          id: site.id,
          url: site.url,
          produto: site.produto,
          versao,
          status,
          erro: erro || undefined,
          ms: Date.now() - inicio,
        };

        jobAtivo.resultados.push(resultado);
        jobAtivo.progresso.atual++;
        if (versao) jobAtivo.progresso.ok++;


        console.log(`[versions] ${site.id}: ${versao || (erro ? `ERRO: ${erro}` : 'sem_versao')} (${resultado.ms}ms)`);
      }
    } catch (e) {
      console.error('[versions] Erro fatal no browser:', e.message);
    } finally {
      try { if (browser) await browser.close(); } catch (_) {}
      const finalJob = jobAtivo;
      const ok = finalJob.resultados.filter(r => r.versao).length;
      // Salva cache do último scan
      ultimoResultado = {
        timestamp: new Date().toISOString(),
        total: finalJob.resultados.length,
        ok,
        resultados: finalJob.resultados,
      };
      jobAtivo = null;
      console.log(`[versions] ✅ Concluído: ${ok}/${finalJob.resultados.length} versões capturadas`);
    }
  })();
}

// ─── GET /api/sites/versions/status — consulta progresso ou último resultado ──
export async function statusVersoesSites(req, res) {
  if (jobAtivo) {
    return res.json({
      status: 'em_andamento',
      progresso: jobAtivo.progresso,
      resultados: jobAtivo.resultados,
    });
  }
  if (ultimoResultado) {
    return res.json({ status: 'concluido', ...ultimoResultado });
  }
  res.json({ status: 'ocioso', resultados: [], progresso: { atual: 0, total: 0, ok: 0 } });
}
