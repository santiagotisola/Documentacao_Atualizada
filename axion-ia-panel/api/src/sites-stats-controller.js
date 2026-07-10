/**
 * 🏢 SITES STATS CONTROLLER
 * 
 * Busca dados ao vivo de equipamentos nos sites AxHub via HTTP.
 * Usa o mesmo mecanismo de login do credenciais-controller.js.
 * 
 * Estratégia:
 *   1. Login no site com axios + cookie jar
 *   2. Tenta endpoint JSON interno do AxHub (se existir)
 *   3. Faz parse da página de Status de Equipamentos
 *   4. Retorna dados estruturados ou erro detalhado
 */

import axios from "axios";
import * as cheerio from "cheerio";

const TIMEOUT = 20000;

// ─── Axios client com cookie jar por site ────────────────────────────────────

function criarClient(baseURL) {
  const cookieJar = {};

  const client = axios.create({
    baseURL,
    timeout: TIMEOUT,
    maxRedirects: 5,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8",
    },
    validateStatus: () => true,
  });

  client.interceptors.response.use((response) => {
    const setCookies = response.headers["set-cookie"];
    if (setCookies) {
      setCookies.forEach((cookie) => {
        const [nameValue] = cookie.split(";");
        const [name, value] = nameValue.split("=");
        if (name && value) cookieJar[name.trim()] = value.trim();
      });
    }
    return response;
  });

  client.interceptors.request.use((config) => {
    const cookieStr = Object.entries(cookieJar)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
    if (cookieStr) config.headers["Cookie"] = cookieStr;
    return config;
  });

  client.cookieJar = cookieJar;
  return client;
}

// ─── Extrai token anti-forgery do HTML ───────────────────────────────────────

function extrairToken(html) {
  const $ = cheerio.load(html);
  return $("input[name='__RequestVerificationToken']").val() || null;
}

// ─── Login no site AxHub ──────────────────────────────────────────────────────

async function loginSite(client, login, senha) {
  const loginPage = await client.get("/Home/Login");
  if (loginPage.status >= 400) {
    throw new Error(`Login page retornou ${loginPage.status}`);
  }

  const token = extrairToken(loginPage.data);
  const hasTurnstile =
    loginPage.data.includes("TurnstileToken") ||
    loginPage.data.includes("turnstile");

  if (!token && !hasTurnstile) {
    // Talvez já esteja logado ou page estrutura diferente
    if (!loginPage.data.includes("/Home/Login")) return true;
    throw new Error("Não foi possível obter token anti-forgery");
  }

  const params = new URLSearchParams();
  params.append("Username", login);
  params.append("Password", senha);
  params.append("KeepConnected", "true");
  if (token) params.append("__RequestVerificationToken", token);
  if (hasTurnstile) params.append("TurnstileToken", "");

  const loginResp = await client.post("/Home/Login", params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    maxRedirects: 0,
    validateStatus: () => true,
  });

  // 302 = login OK
  if (loginResp.status === 302) return true;

  // 200 mas sem form de login = também OK
  if (
    loginResp.status === 200 &&
    !loginResp.data.includes("/Home/Login") &&
    !loginResp.data.includes("Username")
  ) {
    return true;
  }

  if (hasTurnstile) {
    throw new Error(
      "Site protegido por Cloudflare Turnstile — login automático indisponível"
    );
  }

  throw new Error("Login falhou — verifique usuário/senha");
}

// ─── Parse HTML do dashboard AxHub ───────────────────────────────────────────

function parseDashboardHTML(html) {
  const $ = cheerio.load(html);

  // Mapa de contadores para variações de texto nos cards de status
  const resultado = {
    total: null,
    monitorados: null,
    online: null,
    offline_menos1h: null,
    offline_mais1h: null,
    desabMonitoramento: null,
    ocr: null,
    fonte: "dashboard_html",
  };

  // Estratégia 1: elementos com classes conhecidas do AxHub
  const textos = [];
  $("body").find("*").each(function () {
    const txt = $(this).text().trim();
    if (txt && !$(this).children().length) textos.push(txt);
  });

  // Procura pares "rótulo → número" no DOM
  $("[class*='status'], [class*='equip'], [class*='card'], [class*='count'], [class*='total'], [id*='equip'], [id*='status']").each(
    function () {
      const text = $(this).text().trim();
      const num = parseInt(text.replace(/\D/g, ""), 10);
      const classStr = ($(this).attr("class") || "").toLowerCase();
      const idStr = ($(this).attr("id") || "").toLowerCase();
      const combined = classStr + " " + idStr + " " + text.toLowerCase();

      if (!isNaN(num)) {
        if (combined.includes("online") && resultado.online === null)
          resultado.online = num;
        else if (
          (combined.includes("offline") || combined.includes("desconect")) &&
          resultado.offline_mais1h === null
        )
          resultado.offline_mais1h = num;
        else if (combined.includes("total") && resultado.total === null)
          resultado.total = num;
        else if (
          (combined.includes("monit") || combined.includes("dashboard")) &&
          resultado.monitorados === null
        )
          resultado.monitorados = num;
      }
    }
  );

  // Estratégia 2: regex no HTML bruto para padrões numéricos conhecidos
  const onlineMatch = html.match(
    /online[^<]*?(\d+)|(\d+)[^<]*?online/i
  );
  if (onlineMatch && resultado.online === null) {
    resultado.online = parseInt(onlineMatch[1] || onlineMatch[2], 10);
  }

  const totalMatch = html.match(
    /total[^<]*?(\d+)|(\d+)[^<]*?equipamentos/i
  );
  if (totalMatch && resultado.total === null) {
    resultado.total = parseInt(totalMatch[1] || totalMatch[2], 10);
  }

  // Estratégia 3: dados embutidos em JSON dentro de <script>
  const scriptTags = $("script")
    .map((_, el) => $(el).html())
    .get();
  for (const script of scriptTags) {
    if (!script) continue;

    // Padrões: { online: 235, offline: 358 }
    const jsonMatch = script.match(/\{[^{}]*"?online"?\s*:\s*(\d+)[^{}]*\}/i);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.online != null && resultado.online === null)
          resultado.online = parsed.online;
        if (parsed.offline != null && resultado.offline_mais1h === null)
          resultado.offline_mais1h = parsed.offline;
        if (parsed.total != null && resultado.total === null)
          resultado.total = parsed.total;
        if (parsed.monitorados != null && resultado.monitorados === null)
          resultado.monitorados = parsed.monitorados;
        break;
      } catch (_) {}
    }

    // Array data: [[235, 229, 358]]
    const arrayMatch = script.match(/data\s*:\s*\[[\s\d,]+\]/i);
    if (arrayMatch) {
      const nums = arrayMatch[0].match(/\d+/g);
      if (nums && nums.length >= 2 && resultado.online === null) {
        resultado.online = parseInt(nums[0], 10);
        resultado.offline_menos1h = parseInt(nums[1], 10);
        if (nums[2]) resultado.offline_mais1h = parseInt(nums[2], 10);
      }
    }
  }

  return resultado;
}

// ─── Tenta endpoints JSON internos do AxHub ──────────────────────────────────

async function tentarEndpointsJSON(client) {
  // Endpoints conhecidos ou prováveis do AxHub (ASP.NET MVC)
  const endpoints = [
    "/api/Equipamentos/HeartbeatStats",
    "/api/equipamentos/heartbeat",
    "/api/Dashboard/EquipamentosStatus",
    "/Dashboard/EquipamentosStatusJson",
    "/Equipamentos/HeartbeatJson",
    "/Home/DashboardData",
    "/api/home/dashboard",
  ];

  for (const endpoint of endpoints) {
    try {
      const resp = await client.get(endpoint, {
        headers: { Accept: "application/json" },
        timeout: 8000,
      });

      if (
        resp.status === 200 &&
        resp.headers["content-type"]?.includes("json")
      ) {
        const data = resp.data;

        // Tenta mapear resposta para nosso formato
        if (typeof data === "object" && data !== null) {
          const online =
            data.online ??
            data.Online ??
            data.totalOnline ??
            data.TotalOnline;
          const total =
            data.total ?? data.Total ?? data.totalEquipamentos;
          const offline =
            data.offline ?? data.Offline ?? data.totalOffline;
          const monitorados =
            data.monitorados ?? data.Monitorados ?? data.totalMonitorados;

          if (online != null || total != null) {
            return {
              total: total ?? null,
              monitorados: monitorados ?? total ?? null,
              online: online ?? null,
              offline_mais1h: offline ?? null,
              offline_menos1h: null,
              desabMonitoramento: null,
              ocr: data.ocr ?? data.Ocr ?? data.taxaOcr ?? null,
              fonte: `json:${endpoint}`,
            };
          }
        }
      }
    } catch (_) {
      // Ignorar erros individuais por endpoint
    }
  }

  return null;
}

// ─── Tenta página de Status de Equipamentos ──────────────────────────────────

async function buscarStatusEquipamentos(client) {
  // Páginas candidatas para status de equipamentos no AxHub
  const paginas = [
    "/Equipamentos/Status",
    "/Equipamentos/Heartbeat",
    "/Dashboard/Status",
    "/Home/Index",
    "/",
  ];

  for (const pagina of paginas) {
    try {
      const resp = await client.get(pagina, { timeout: 12000 });
      if (
        resp.status === 200 &&
        resp.headers["content-type"]?.includes("html")
      ) {
        const dados = parseDashboardHTML(resp.data);
        if (dados.online !== null || dados.total !== null) {
          dados.fonte = `html:${pagina}`;
          return dados;
        }
      }
    } catch (_) {}
  }

  return null;
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────

/**
 * GET /api/sites/live-stats
 * 
 * Query params:
 *   url    — URL base do site (ex: https://ipemmt.axhub.axion.ws)
 *   login  — usuário de acesso
 *   senha  — senha de acesso
 *   siteId — identificador do site (para o frontend mapear)
 */
export async function buscarLiveStats(req, res) {
  const { url, login, senha, siteId } = req.query;

  if (!url || !login || !senha) {
    return res.status(400).json({
      erro: "url, login e senha são obrigatórios",
    });
  }

  const siteUrl = url.replace(/\/$/, ""); // remove trailing slash

  try {
    const client = criarClient(siteUrl);

    // 1. Login
    try {
      await loginSite(client, login, senha);
    } catch (loginErr) {
      return res.json({
        sucesso: false,
        siteId: siteId || null,
        url: siteUrl,
        erro: loginErr.message,
        dados: null,
      });
    }

    // 2. Tenta endpoints JSON primeiro (mais confiável)
    let dados = await tentarEndpointsJSON(client);

    // 3. Se não encontrou, faz parse do HTML
    if (!dados) {
      dados = await buscarStatusEquipamentos(client);
    }

    if (!dados) {
      return res.json({
        sucesso: false,
        siteId: siteId || null,
        url: siteUrl,
        erro: "Não foi possível extrair dados de equipamentos do site",
        dados: null,
      });
    }

    return res.json({
      sucesso: true,
      siteId: siteId || null,
      url: siteUrl,
      timestamp: new Date().toISOString(),
      dados,
    });
  } catch (err) {
    return res.json({
      sucesso: false,
      siteId: siteId || null,
      url: siteUrl,
      erro:
        err.code === "ECONNABORTED"
          ? "Timeout — site não respondeu em tempo hábil"
          : err.message,
      dados: null,
    });
  }
}

/**
 * POST /api/sites/live-stats-batch
 * 
 * Body: { sites: [{ siteId, url, login, senha }] }
 * 
 * Busca dados ao vivo para múltiplos sites em paralelo.
 * Limita a 5 requisições simultâneas para evitar sobrecarga.
 */
export async function buscarLiveStatsBatch(req, res) {
  const { sites } = req.body;

  if (!Array.isArray(sites) || sites.length === 0) {
    return res.status(400).json({ erro: "sites[] é obrigatório" });
  }

  if (sites.length > 20) {
    return res.status(400).json({ erro: "Máximo 20 sites por requisição" });
  }

  // Valida cada item
  for (const s of sites) {
    if (!s.url || !s.login || !s.senha) {
      return res
        .status(400)
        .json({ erro: `Site ${s.siteId || s.url}: url, login e senha são obrigatórios` });
    }
  }

  // Processa em lotes de 5 (evita abrir muitas conexões simultâneas)
  const BATCH = 5;
  const resultados = [];

  for (let i = 0; i < sites.length; i += BATCH) {
    const lote = sites.slice(i, i + BATCH);
    const promessas = lote.map(async (s) => {
      const siteUrl = s.url.replace(/\/$/, "");
      try {
        const client = criarClient(siteUrl);
        await loginSite(client, s.login, s.senha);

        let dados = await tentarEndpointsJSON(client);
        if (!dados) dados = await buscarStatusEquipamentos(client);

        return {
          sucesso: dados !== null,
          siteId: s.siteId || null,
          url: siteUrl,
          timestamp: new Date().toISOString(),
          dados,
          erro: dados ? null : "Dados não extraídos",
        };
      } catch (err) {
        return {
          sucesso: false,
          siteId: s.siteId || null,
          url: siteUrl,
          dados: null,
          erro:
            err.code === "ECONNABORTED"
              ? "Timeout"
              : err.message,
        };
      }
    });

    const lotResults = await Promise.all(promessas);
    resultados.push(...lotResults);
  }

  return res.json({
    total: resultados.length,
    sucesso: resultados.filter((r) => r.sucesso).length,
    falhas: resultados.filter((r) => !r.sucesso).length,
    resultados,
  });
}
