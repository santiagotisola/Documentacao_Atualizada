/**
 * 🔍 AXCROSS URL INVESTIGATOR
 *
 * Investiga dados do AxCross via URL de produção, sem depender do banco local.
 * Fluxo:
 *  1. Detecta a URL do Identity Server para o site alvo
 *  2. Faz login por formulário (antiforgery token + POST)
 *  3. Segue o redirect OIDC com cookies de sessão
 *  4. Chama endpoints internos da aplicação AxCross
 *  5. Retorna análise de passagens, equipamentos e campo classificação
 */

import https from "https";
import http  from "http";

// ─── HTTP helpers ─────────────────────────────────────────────────
function doRequest(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const driver = parsed.protocol === "https:" ? https : http;
    const options = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method:   opts.method || "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AxionIA/1.0",
        Accept:       "text/html,application/json,*/*",
        ...(opts.headers || {}),
      },
    };

    const req = driver.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => resolve({
        status:   res.statusCode,
        headers:  res.headers,
        location: res.headers.location || "",
        cookies:  res.headers["set-cookie"] || [],
        body,
      }));
    });

    req.on("error", reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

/** Merge cookies: array de strings "Nome=valor; Path=..." → objeto */
function parseCookies(arr) {
  const map = {};
  for (const raw of arr) {
    const kv = raw.split(";")[0].trim();
    const [k, v] = kv.split("=");
    if (k) map[k.trim()] = v?.trim() || "";
  }
  return map;
}

function serializeCookies(obj) {
  return Object.entries(obj).map(([k, v]) => `${k}=${v}`).join("; ");
}

// ─── Buscar dados do site autenticado ────────────────────────────
async function loginOIDC(siteUrl, login, senha) {
  const logs = [];
  let cookieJar = {};

  // 1. Hit URL protegida → recebe redirect para OIDC authorize (URL completa com params)
  const r0 = await doRequest(`${siteUrl.replace(/\/$/, "")}/monitoringonline`);
  Object.assign(cookieJar, parseCookies(r0.cookies));
  const oidcAuthorizeUrl = r0.location;
  if (!oidcAuthorizeUrl) throw new Error("Site não redirecionou para autenticação OIDC. Verifique a URL do site.");
  logs.push(`🔍 OIDC authorize: ${oidcAuthorizeUrl.slice(0, 80)}...`);

  // 2. Seguir o authorize URL → Identity Server redireciona para login page
  const r1 = await doRequest(oidcAuthorizeUrl, { headers: { Cookie: serializeCookies(cookieJar) } });
  Object.assign(cookieJar, parseCookies(r1.cookies));
  let loginPageUrl = r1.location;
  if (!loginPageUrl) throw new Error("Identity Server não redirecionou para a página de login.");
  // Resolver URL relativa
  if (loginPageUrl.startsWith("/")) {
    const base = new URL(oidcAuthorizeUrl);
    loginPageUrl = `${base.protocol}//${base.host}${loginPageUrl}`;
  }
  logs.push(`🔑 Login page: ${loginPageUrl.slice(0, 80)}...`);

  // 3. GET login page → obter antiforgery token + cookies
  const loginPage = await doRequest(loginPageUrl, { headers: { Cookie: serializeCookies(cookieJar) } });
  Object.assign(cookieJar, parseCookies(loginPage.cookies));
  const tokenMatch = loginPage.body.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
  const returnUrlMatch = loginPage.body.match(/name="ReturnUrl"[^>]*value="([^"]+)"/);
  const token = tokenMatch?.[1];
  const returnUrl = returnUrlMatch ? returnUrlMatch[1].replace(/&amp;/g, "&") : "";
  logs.push(`🔐 Antiforgery token: ${token ? "obtido ✅" : "NÃO encontrado ❌"}`);

  if (!token) {
    // Debug: mostrar início da resposta
    const snippet = loginPage.body.slice(0, 200).replace(/\s+/g, " ");
    throw new Error(`Não foi possível obter o token de autenticação. Resposta (${loginPage.status}): ${snippet}`);
  }

  // 4. POST credenciais com campos corretos: Username / Password
  const baseLoginUrl = new URL(loginPageUrl);
  const postUrl = `${baseLoginUrl.protocol}//${baseLoginUrl.host}${baseLoginUrl.pathname}`;
  const postBody = new URLSearchParams({
    Username: login,
    Password: senha,
    RememberLogin: "true",
    __RequestVerificationToken: token,
    ReturnUrl: returnUrl,
  }).toString();

  const loginResp = await doRequest(postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postBody),
      Cookie: serializeCookies(cookieJar),
      Referer: loginPageUrl,
    },
    body: postBody,
  });
  Object.assign(cookieJar, parseCookies(loginResp.cookies));

  if (loginResp.status === 200) {
    // POST retornou 200 = credenciais inválidas ou erro de validação
    const errorMatch = loginResp.body.match(/class="[^"]*text-danger[^"]*"[^>]*>\s*([^<]{3,100})/i);
    const errMsg = errorMatch ? errorMatch[1].trim() : "Credenciais inválidas ou usuário não encontrado";
    throw new Error(`Login falhou: ${errMsg}`);
  }

  logs.push(`📨 POST login: ${loginResp.status} → ${loginResp.location?.slice(0, 70) || "sem redirect"}`);

  // 5. Seguir redirects de volta ao AxCross
  let currentUrl = loginResp.location || "";
  let redirectCount = 0;
  let accessDenied = false;
  while (currentUrl && redirectCount < 8) {
    if (currentUrl.startsWith("/")) {
      const base = new URL(postUrl);
      currentUrl = `${base.protocol}//${base.host}${currentUrl}`;
    }
    const r = await doRequest(currentUrl, { headers: { Cookie: serializeCookies(cookieJar) } });
    Object.assign(cookieJar, parseCookies(r.cookies));
    const shortUrl = currentUrl.slice(0, 70);
    logs.push(`↩ Redirect ${redirectCount + 1}: ${shortUrl} → ${r.status}${r.location ? " → " + r.location.slice(0, 50) : ""}`);
    // Detectar access_denied no redirect
    if (currentUrl.includes("access_denied") || r.location?.includes("access_denied")) {
      accessDenied = true;
      logs.push(`⛔ access_denied — a conta não tem permissão no cliente OIDC deste site`);
      break;
    }
    if (!r.location || r.status < 300 || r.status >= 400) break;
    currentUrl = r.location;
    redirectCount++;
  }

  if (accessDenied) {
    throw new Error("ACCESS_DENIED: Credenciais válidas mas conta sem permissão no cliente OIDC deste site. Solicite ao administrador que adicione o usuário ao cliente AxCross correspondente.");
  }

  const hasAxCrossCookie = Object.keys(cookieJar).some(k => k.includes(".AspNetCore") && !k.includes("Antiforgery"));
  logs.push(`${hasAxCrossCookie ? "✅" : "⚠️"} Sessão AxCross: ${Object.keys(cookieJar).length} cookies`);

  return { cookieJar, logs };
}

// ─── Buscar dados do site autenticado ────────────────────────────
async function buscarDados(siteUrl, cookieJar, opts = {}) {
  const base = siteUrl.replace(/\/$/, "");
  const cookieStr = serializeCookies(cookieJar);
  const headers = { Cookie: cookieStr, Accept: "application/json, text/html", "X-Requested-With": "XMLHttpRequest" };
  const results = {};

  // Endpoints a tentar (ordem de preferência)
  const endpointsCandidatos = [
    { key: "passages",    paths: ["/monitoringonline/api/passages?pageSize=10", "/api/passages?pageSize=10", "/Passages/GetList?page=1&pageSize=10"] },
    { key: "equipments",  paths: ["/monitoringonline/api/equipments?pageSize=20", "/api/equipments", "/Equipment/GetList?page=1&pageSize=20"] },
    { key: "locals",      paths: ["/monitoringonline/api/locals", "/api/locals", "/Local/GetList"] },
    { key: "dashboard",   paths: ["/monitoringonline/api/dashboard", "/api/dashboard/summary", "/Dashboard/Summary"] },
  ];

  for (const ep of endpointsCandidatos) {
    for (const path of ep.paths) {
      try {
        const r = await doRequest(`${base}${path}`, { headers });
        const ct = r.headers["content-type"] || "";
        if (r.status === 200 && ct.includes("application/json")) {
          try { results[ep.key] = { ok: true, path, data: JSON.parse(r.body) }; }
          catch { results[ep.key] = { ok: true, path, data: r.body.slice(0, 500) }; }
          break;
        } else if (r.status === 200 && ct.includes("text/html") && !r.body.includes("DOCTYPE")) {
          results[ep.key] = { ok: true, path, data: r.body.slice(0, 1000) };
          break;
        } else if (r.status === 302 || r.status === 301 || r.status === 401 || r.status === 403) {
          // Protegido por autenticação — endpoint existe mas sessão inválida/expirada
          const isAuth = r.location?.includes("login") || r.location?.includes("authorize") || r.location?.includes("connect");
          results[ep.key] = results[ep.key] || { ok: false, protegido: true, tentativas: [] };
          results[ep.key].tentativas = results[ep.key].tentativas || [];
          results[ep.key].tentativas.push(`${path} → ${r.status}${isAuth ? " (redirect OIDC)" : ""}`);
          results[ep.key].motivo = "Sessão não estabelecida — conta sem permissão OIDC ou credenciais inválidas";
        } else {
          results[ep.key] = results[ep.key] || { ok: false, tentativas: [] };
          results[ep.key].tentativas = results[ep.key].tentativas || [];
          results[ep.key].tentativas.push(`${path} → ${r.status}`);
        }
      } catch (e) {
        results[ep.key] = results[ep.key] || { ok: false, erro: e.message };
      }
    }
  }

  return results;
}

// ─── Analisar campo classificação na resposta ─────────────────────
function analisarClassificacao(dados) {
  const analise = { temCampo: false, campo: null, exemplos: [], percentualPreenchido: null };
  if (!dados?.passages?.ok || !dados.passages.data) return analise;

  const raw = dados.passages.data;
  const lista = Array.isArray(raw) ? raw : (raw?.items || raw?.data || raw?.passages || []);
  if (!lista.length) return analise;

  const camposCandidatos = ["classificacaoVeiculo","classificacao","vehicleClass","tipoVeiculo","vehicleType","classification","type"];
  for (const campo of camposCandidatos) {
    if (lista[0] && campo in lista[0]) {
      analise.temCampo = true;
      analise.campo = campo;
      analise.exemplos = lista.slice(0, 5).map(p => ({
        placa: p.placa || p.plate || p.Placa,
        classificacao: p[campo],
        data: p.dataPassagem || p.passedDate || p.DataPassagem,
      }));
      const preenchidos = lista.filter(p => p[campo] != null && p[campo] !== "").length;
      analise.percentualPreenchido = Math.round((preenchidos / lista.length) * 100);
      break;
    }
  }

  if (!analise.temCampo) {
    analise.camposDisponiveis = lista[0] ? Object.keys(lista[0]) : [];
  }

  return analise;
}

// ─── Endpoint principal ───────────────────────────────────────────
export async function investigarViaSite(siteUrl, login, senha) {
  const resultado = {
    site: siteUrl,
    timestamp: new Date().toISOString(),
    logs: [],
    autenticado: false,
    dados: null,
    analiseClassificacao: null,
    erro: null,
  };

  try {
    const { cookieJar, logs } = await loginOIDC(siteUrl, login, senha);
    resultado.logs = logs;
    resultado.autenticado = true;
    const dados = await buscarDados(siteUrl, cookieJar);
    resultado.dados = dados;
    resultado.analiseClassificacao = analisarClassificacao(dados);
    resultado.logs.push(`🔬 Análise de classificação: campo ${resultado.analiseClassificacao.temCampo ? `"${resultado.analiseClassificacao.campo}" ENCONTRADO` : "NÃO encontrado"}`);
  } catch (err) {
    resultado.erro = err.message;
    resultado.logs.push(`❌ Erro: ${err.message}`);
  }

  return resultado;
}

// ─── Comparação de equipamentos via URL de produção ───────────────
export async function compararViaUrl(siteUrl, login, senha, equipamentos, filtros = {}) {
  const logs = [];
  const resultado = {
    ok: false, site: siteUrl, timestamp: new Date().toISOString(),
    logs, autenticado: false, equipamentos,
    resultados: {}, analise: null, erro: null,
  };

  try {
    // 1. Login OIDC
    logs.push(`🔐 Iniciando login em ${siteUrl}`);
    const { cookieJar, logs: loginLogs } = await loginOIDC(siteUrl, login, senha);
    logs.push(...loginLogs);
    resultado.autenticado = true;
    logs.push(`✅ Autenticado — buscando dados por equipamento`);

    const base = siteUrl.replace(/\/$/, "");
    const hdrs = {
      Cookie: serializeCookies(cookieJar),
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    };

    // 2. Para cada equipamento, tentar diferentes endpoints
    for (const equip of equipamentos) {
      logs.push(`\n📡 Buscando dados: ${equip}`);
      const equipResult = { passagens: [], statsClassif: [], statsFaixa: [], statsGeral: null, endpointUsado: null, erro: null };

      // Lista de endpoints candidatos
      const endpointCandidates = [
        `/monitoringonline/api/passages?equipmentCode=${encodeURIComponent(equip)}&pageSize=${filtros.pageSize || 50}`,
        `/monitoringonline/api/passages?equipment=${encodeURIComponent(equip)}&pageSize=${filtros.pageSize || 50}`,
        `/reports/api/passages?equipmentCode=${encodeURIComponent(equip)}&pageSize=${filtros.pageSize || 50}`,
        `/monitoringonline/api/passages?code=${encodeURIComponent(equip)}&pageSize=${filtros.pageSize || 50}`,
        // Com datas
        ...(filtros.dataInicio && filtros.dataFim ? [
          `/monitoringonline/api/passages?equipmentCode=${encodeURIComponent(equip)}&startDate=${filtros.dataInicio}&endDate=${filtros.dataFim}&pageSize=${filtros.pageSize || 50}`,
        ] : []),
      ];

      for (const ep of endpointCandidates) {
        try {
          const r = await doRequest(`${base}${ep}`, { headers: hdrs });
          if (r.status === 200 && r.headers["content-type"]?.includes("application/json")) {
            const data = JSON.parse(r.body);
            const list = Array.isArray(data) ? data : (data.items || data.data || data.passages || data.result || []);
            if (list.length > 0) {
              equipResult.passagens = list;
              equipResult.endpointUsado = ep;
              logs.push(`  ✅ ${ep} → ${list.length} passagens`);

              // Computar stats localmente a partir dos dados
              const classifField = Object.keys(list[0]).find(k => /classif|vehicleType|tipoVeiculo/i.test(k)) || null;
              if (classifField) {
                const counter = {};
                list.forEach(p => {
                  const v = p[classifField] || "(sem classif.)";
                  counter[v] = (counter[v] || 0) + 1;
                });
                equipResult.statsClassif = Object.entries(counter).map(([Tipo, Total]) => ({ Tipo, Total })).sort((a, b) => b.Total - a.Total);
              }

              // Stats por faixa
              const faixaCounter = {};
              list.forEach(p => {
                const f = p.faixa || p.lane || p.Faixa || "(sem faixa)";
                if (!faixaCounter[f]) faixaCounter[f] = { Faixa: f, Total: 0, ComClassif: 0, SemClassif: 0 };
                const classif = p[classifField || "classif"] || "";
                faixaCounter[f].Total++;
                if (classif && classif.trim()) faixaCounter[f].ComClassif++;
                else faixaCounter[f].SemClassif++;
              });
              equipResult.statsFaixa = Object.values(faixaCounter).sort((a, b) => b.Total - a.Total);

              // Stats gerais
              const comClassif = list.filter(p => {
                const v = classifField ? p[classifField] : null;
                return v && String(v).trim() !== "";
              }).length;
              equipResult.statsGeral = {
                Total: list.length,
                ComClassif: comClassif,
                VelocidadeMedia: list.reduce((s, p) => s + (parseFloat(p.velocidade || p.speed || p.Velocidade) || 0), 0) / list.length,
                UltimaPassagem: list[0]?.dataPassagem || list[0]?.passedDate || list[0]?.DataPassagem,
                PrimeiraPassagem: list[list.length - 1]?.dataPassagem || list[list.length - 1]?.DataPassagem,
                classifField,
              };
              break; // Endpoint funcional encontrado
            }
          } else if (r.status !== 302) {
            logs.push(`  ❌ ${ep} → ${r.status}`);
          }
        } catch (e) {
          logs.push(`  ⚠ ${ep} → ${e.message.slice(0, 60)}`);
        }
      }

      if (!equipResult.endpointUsado) {
        equipResult.erro = "Nenhum endpoint retornou dados para este equipamento";
        logs.push(`  ❌ Nenhum endpoint funcionou para ${equip}`);
      }

      resultado.resultados[equip] = equipResult;
    }

    // 3. Análise comparativa
    const eqs = Object.entries(resultado.resultados);
    const comDados = eqs.filter(([, r]) => r.passagens.length > 0);
    const semClassif = eqs.filter(([, r]) => r.statsGeral && r.statsGeral.ComClassif === 0);
    const comClassif = eqs.filter(([, r]) => r.statsGeral && r.statsGeral.ComClassif > 0);

    resultado.analise = {
      totalEquipamentos: equipamentos.length,
      comDados: comDados.length,
      semDados: eqs.length - comDados.length,
      semClassifTotal: semClassif.map(([e]) => e),
      comClassifTotal: comClassif.map(([e]) => e),
      diagnostico: semClassif.length > 0 && comClassif.length > 0
        ? `Comportamento inconsistente detectado: ${comClassif.map(([e]) => e).join(", ")} classificam; ${semClassif.map(([e]) => e).join(", ")} não classificam`
        : semClassif.length === eqs.length
        ? "Nenhum equipamento retornou classificação — possível problema de configuração global"
        : "Todos os equipamentos com dados retornam classificação",
      causasProvaveis: semClassif.length > 0 ? [
        "Classificador ITSCAM 450 desabilitado (Classificador.enabled = false) no equipamento sem classif.",
        "DTO do SignalR/PassageHub não inclui ClassificacaoVeiculo para este equipamento",
        "Firmware diferente entre os equipamentos — verificar versão no VARCO Monitor",
        "Configuração do classificador (sceneType, minProbability) inadequada para o local",
      ] : [],
    };

    resultado.ok = true;
    logs.push(`\n📊 Análise concluída: ${resultado.analise.diagnostico}`);

  } catch (err) {
    resultado.erro = err.message;
    logs.push(`❌ Erro fatal: ${err.message}`);
  }

  return resultado;
}


// ─── Investigação rápida (sem login, endpoints públicos) ──────────
export async function investigarPublico(siteUrl) {
  const resultado = { site: siteUrl, timestamp: new Date().toISOString(), logs: [], endpoints: {} };

  const base = siteUrl.replace(/\/$/, "");
  const parsed = new URL(siteUrl);
  const sub = parsed.hostname.split(".")[0];
  const apiBase = `https://${sub}.axcross-api.axion.ws`;

  const swaggerUrls = [
    `${apiBase}/swagger/v1/swagger.json`,
    `${base}/swagger/v1/swagger.json`,
    `${base}/api/swagger/v1/swagger.json`,
    `${base}/monitoringonline/swagger/v1/swagger.json`,
  ];

  for (const u of swaggerUrls) {
    try {
      const r = await doRequest(u, { headers: { Accept: "application/json" } });

      if (r.status === 200 && r.headers["content-type"]?.includes("application/json")) {
        // ✅ Swagger público encontrado
        const spec = JSON.parse(r.body);
        resultado.endpoints[u] = {
          ok: true,
          status: 200,
          tipo: "publico",
          title: spec.info?.title,
          version: spec.info?.version,
          paths: Object.keys(spec.paths || {}),
          auth: Object.keys(spec.components?.securitySchemes || {}),
        };
        resultado.logs.push(`✅ Swagger público: ${u} — ${Object.keys(spec.paths || {}).length} endpoints`);

      } else if (r.status === 302 || r.status === 301) {
        // 🔒 Protegido por OIDC/autenticação — endpoint EXISTS mas requer login
        const redirectsToLogin = r.location?.includes("login") || r.location?.includes("authorize") || r.location?.includes("connect");
        resultado.endpoints[u] = {
          ok: false,
          status: r.status,
          tipo: "protegido",
          protegido: true,
          redirectPara: r.location?.slice(0, 100) || "",
          mensagem: redirectsToLogin
            ? "Protegido por OIDC — endpoint existe mas requer autenticação"
            : `Redirecionamento HTTP ${r.status}`,
        };
        resultado.logs.push(`🔒 Protegido (${r.status}): ${u} → ${r.location?.slice(0, 60) || ""}`);

      } else if (r.status === 401 || r.status === 403) {
        resultado.endpoints[u] = { ok: false, status: r.status, tipo: "protegido", protegido: true, mensagem: `Autenticação necessária (${r.status})` };
        resultado.logs.push(`🔒 Auth necessária (${r.status}): ${u}`);

      } else if (r.status === 404) {
        resultado.endpoints[u] = { ok: false, status: 404, tipo: "nao_encontrado", mensagem: "Endpoint não existe neste servidor" };
        resultado.logs.push(`❌ Não encontrado (404): ${u}`);

      } else {
        resultado.endpoints[u] = { ok: false, status: r.status, tipo: "outro", mensagem: `HTTP ${r.status}` };
        resultado.logs.push(`⚠ HTTP ${r.status}: ${u}`);
      }
    } catch (e) {
      resultado.endpoints[u] = { ok: false, tipo: "erro_rede", mensagem: e.message.slice(0, 100) };
      resultado.logs.push(`⚠ Erro de rede: ${u} — ${e.message.slice(0, 60)}`);
    }
  }

  // Resumo
  const publicos   = Object.values(resultado.endpoints).filter(e => e.tipo === "publico").length;
  const protegidos = Object.values(resultado.endpoints).filter(e => e.tipo === "protegido").length;
  resultado.resumo = { publicos, protegidos, total: swaggerUrls.length };

  return resultado;
}
