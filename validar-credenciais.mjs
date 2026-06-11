// Valida credenciais de todos os sites AxHub e AxCross via HTTP POST
const SITES_AXHUB = [
  { nome: 'IBAMETRO', url: 'https://ibametro.axhub.axion.ws', login: 'admin', senha: 'Labor#5383' },
  { nome: 'IMEPI', url: 'https://imepi.axhub.axion.ws', login: 'admin', senha: 'Labor#5383' },
  { nome: 'IMEQPB', url: 'https://imeqpb.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
  { nome: 'IMETROPA', url: 'https://imetropa.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
  { nome: 'IPEMCE', url: 'https://ipemce.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
  { nome: 'IPEMPE', url: 'https://ipempe.axhub.axion.ws', login: 'admin', senha: 'Labor#5383' },
  { nome: 'DERSE', url: 'https://derse.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
  { nome: 'STRANS', url: 'https://strans.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
  { nome: 'DETRANMA', url: 'https://detranma.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
  { nome: 'DETRANPI', url: 'https://detranpi.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
  { nome: 'GOIÂNIA', url: 'https://goiania.axhub.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Labor#5383' },
  { nome: 'IPEMMT', url: 'https://ipemmt.axhub.axion.ws', login: 'admin', senha: 'Labor#5383' },
  { nome: 'ITPS', url: 'https://itps.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
  { nome: 'SMTT', url: 'https://smtt.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
  { nome: 'IMPERATRIZ', url: 'https://imperatriz.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
  { nome: 'HOMOLOGAÇÃO', url: 'https://homologacao.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
  { nome: 'SETRANS', url: 'https://setrans.axhub.axion.ws', login: 'Admin', senha: 'Labor#5383' },
];

const SITES_AXCROSS = [
  { nome: 'DERSE', url: 'https://derse.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
  { nome: 'DETRANPI', url: 'https://detranpi.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
  { nome: 'DETRANMA', url: 'https://detranma.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
  { nome: 'IMPERATRIZ', url: 'https://imperatriz.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
  { nome: 'IPEMCE', url: 'https://ipemce.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
  { nome: 'IPEMMT', url: 'https://ipemmt.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
  { nome: 'IPEMPE', url: 'https://ipempe.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
  { nome: 'SEFAZPI', url: 'https://sefazpi.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
  { nome: 'GOIÂNIA', url: 'https://goiania.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
  { nome: 'ECONOMIA', url: 'https://economia.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
  { nome: 'SETRANS', url: 'https://setrans.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
  { nome: 'HOMOLOGAÇÃO', url: 'https://homologacao.axcross.axion.ws', login: 'suporte@axiontecnologia.com.br', senha: 'Axion#2026' },
];

async function getVerificationToken(url) {
  try {
    const resp = await fetch(`${url}/Home/Login`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      redirect: 'follow',
    });
    const html = await resp.text();
    const match = html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
    const cookies = resp.headers.getSetCookie?.() || [];
    return { token: match?.[1] || '', cookies };
  } catch (e) {
    return { token: '', cookies: [], error: e.message };
  }
}

async function tryLogin(site) {
  const { nome, url, login, senha } = site;
  try {
    // Step 1: Get anti-forgery token
    const { token, cookies, error } = await getVerificationToken(url);
    if (error) return { nome, status: '❌ OFFLINE', detail: error };

    // Build cookie header
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

    // Step 2: POST login
    const body = new URLSearchParams({
      Username: login,
      Password: senha,
      KeepConnected: 'true',
      TurnstileToken: '',
      __RequestVerificationToken: token,
    });

    const resp = await fetch(`${url}/Home/Login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cookie': cookieHeader,
        'Origin': url,
        'Referer': `${url}/Home/Login`,
      },
      body: body.toString(),
      redirect: 'manual',
    });

    const status = resp.status;
    const location = resp.headers.get('location') || '';

    // 302 redirect to / or /Home = login OK
    if (status === 302 && !location.includes('Login')) {
      return { nome, status: '✅ OK', detail: `Redirect → ${location}` };
    }
    // 302 back to Login = failed
    if (status === 302 && location.includes('Login')) {
      return { nome, status: '❌ FALHOU', detail: 'Redirect de volta ao login' };
    }
    // 200 = stayed on login page (probably failed or Turnstile)
    if (status === 200) {
      const text = await resp.text();
      if (text.includes('inválidos') || text.includes('Invalid')) {
        return { nome, status: '❌ SENHA INVÁLIDA', detail: 'Credencial incorreta — sem Turnstile, senha errada' };
      }
      if (text.includes('cf-turnstile') || text.includes('Turnstile') || text.includes('turnstile') || text.includes('challenges.cloudflare.com')) {
        return { nome, status: '⚠️ TURNSTILE', detail: 'Bloqueado por CAPTCHA (não indica erro de senha)' };
      }
      // Verificar se botão está disabled (indica Turnstile não resolvido)
      if (text.includes('disabled') && text.includes('Entrar')) {
        return { nome, status: '⚠️ TURNSTILE', detail: 'Botão desabilitado — aguardando CAPTCHA' };
      }
      return { nome, status: '⚠️ INCERTO', detail: `HTTP 200 sem erro claro — verificar manualmente` };
    }
    // 401
    if (status === 401) {
      return { nome, status: '❌ 401', detail: 'Unauthorized' };
    }

    return { nome, status: `⚠️ HTTP ${status}`, detail: location || 'Resposta inesperada' };
  } catch (e) {
    return { nome, status: '❌ ERRO', detail: e.message };
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  VALIDAÇÃO DE CREDENCIAIS — Axion (11/06/2026)');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  console.log('🔐 AxHub — Nova senha: Labor#2026');
  console.log('-'.repeat(70));
  console.log('Site'.padEnd(15), 'Status'.padEnd(22), 'Detalhe');
  console.log('-'.repeat(70));

  const resultsAxHub = [];
  for (const site of SITES_AXHUB) {
    const result = await tryLogin(site);
    console.log(result.nome.padEnd(15), result.status.padEnd(22), result.detail);
    resultsAxHub.push(result);
  }

  console.log('\n🔐 AxCross — Nova senha: Axion@2026');
  console.log('-'.repeat(70));
  console.log('Site'.padEnd(15), 'Status'.padEnd(22), 'Detalhe');
  console.log('-'.repeat(70));

  const resultsAxCross = [];
  for (const site of SITES_AXCROSS) {
    const result = await tryLogin(site);
    console.log(result.nome.padEnd(15), result.status.padEnd(22), result.detail);
    resultsAxCross.push(result);
  }

  // Resumo
  const allResults = [...resultsAxHub, ...resultsAxCross];
  const ok = allResults.filter(r => r.status.includes('OK')).length;
  const falhou = allResults.filter(r => r.status.includes('INVÁLIDA') || r.status.includes('FALHOU')).length;
  const turnstile = allResults.filter(r => r.status.includes('TURNSTILE') || r.status.includes('INCERTO')).length;
  const offline = allResults.filter(r => r.status.includes('OFFLINE') || r.status.includes('ERRO')).length;

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('  RESUMO');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`  ✅ Login OK:         ${ok}`);
  console.log(`  ❌ Senha inválida:   ${falhou}`);
  console.log(`  ⚠️  Turnstile/Incerto: ${turnstile} (precisa teste manual)`);
  console.log(`  💀 Offline/Erro:     ${offline}`);
  console.log(`  📊 Total testados:   ${allResults.length}`);
  console.log('═══════════════════════════════════════════════════════════════════');
}

main();
