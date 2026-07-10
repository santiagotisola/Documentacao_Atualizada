/**
 * varco-controller.js â€” Validador de integraÃ§Ã£o VARCO â†’ AxHub
 *
 * Analisa consistÃªncia de nomenclatura de equipamentos entre o sistema
 * VARCO (cÃ¢meras Pumatronix/ITSCAM) e o AxHub, validando:
 *  - Nome do dispositivo vs registro no banco AxHub
 *  - Duplicidade de IDs entre faixas
 *  - Heartbeat recente por equipamento
 *  - Estrutura de eventos (incidentes de fila/processamento)
 *
 * ROTAS:
 *  POST /api/varco/validar-dispositivo   â†’ valida um device por nome
 *  POST /api/varco/validar-lote          â†’ valida lista de devices
 *  POST /api/varco/analisar-incidente    â†’ analisa incidente estruturado
 *  GET  /api/varco/heartbeat             â†’ status de heartbeat de todos os equipamentos
 */

import { z } from "zod";
import { conectar } from "./services/axhub-db.js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Verifica se a requisiÃ§Ã£o tem permissÃ£o de admin.
 * Usa API_TOKEN do .env ou header X-Admin-Token.
 * Em produÃ§Ã£o, integrar com middleware de autenticaÃ§Ã£o real.
 */
function _isAdminRequest(req) {
  const adminToken = process.env.API_TOKEN;
  if (!adminToken) return true; // sem token configurado = desenvolvimento local
  const headerToken = req.headers["x-admin-token"] || req.headers["authorization"]?.replace("Bearer ", "");
  return headerToken === adminToken;
}

function minAtras(data) {
  if (!data) return Infinity;
  return Math.round((Date.now() - new Date(data).getTime()) / 60_000);
}

function normalizarNome(nome) {
  return (nome || "").trim().toUpperCase().replace(/\s+/g, " ");
}

// Detecta padrÃµes de nome inconsistente (nome truncado, sem faixa, etc.)
function diagnosticarNome(nomeEnviado, nomeEsperado) {
  const a = normalizarNome(nomeEnviado);
  const b = normalizarNome(nomeEsperado);

  if (a === b)                         return { ok: true, tipo: null };
  if (b.startsWith(a) && a !== b)      return { ok: false, tipo: "nome_truncado",    detalhe: `"${nomeEnviado}" Ã© prefixo de "${nomeEsperado}" â€” identificaÃ§Ã£o de faixa removida.` };
  if (a.startsWith(b) && a !== b)      return { ok: false, tipo: "sufixo_extra",     detalhe: `"${nomeEnviado}" contÃ©m sufixo a mais vs "${nomeEsperado}".` };
  if (a.replace(/[_\-\s]/g, "") === b.replace(/[_\-\s]/g, "")) {
    return { ok: false, tipo: "formatacao_diferente", detalhe: `Nomes equivalentes mas com formataÃ§Ã£o diferente. Padronizar para o formato do AxHub.` };
  }
  return { ok: false, tipo: "nome_divergente", detalhe: `"${nomeEnviado}" nÃ£o corresponde a "${nomeEsperado}" no AxHub.` };
}

// SugestÃ£o de nome padronizado
function sugerirNome(base, faixa) {
  const b = normalizarNome(base).replace(/\s/g, "");
  if (!faixa) return b;
  const f = String(faixa).replace(/[^0-9]/g, "");
  return `${b}-F${f}`;
}

// â”€â”€â”€ POST /api/varco/validar-dispositivo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const schemaDispositivo = z.object({
  varco_device_name:   z.string().min(1, "varco_device_name Ã© obrigatÃ³rio"),
  equipment_name_sent: z.string().optional(), // nome enviado na URL do ping
  faixa:               z.union([z.string(), z.number()]).optional()
});

export async function validarDispositivo(req, res) {
  const parse = schemaDispositivo.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ erro: parse.error.errors[0].message });
  }

  const { varco_device_name, equipment_name_sent, faixa } = parse.data;
  const nomeEnviado = equipment_name_sent || varco_device_name;

  const resultado = {
    varco_device_name,
    equipment_name_sent: nomeEnviado,
    faixa: faixa || null
  };

  try {
    const pool = await conectar();

    // Buscar equipamento no AxHub pelo nome exato
    const exactMatch = await pool
      .request()
      .input("nome", normalizarNome(nomeEnviado))
      .query(`
        SELECT TOP 5
          e.IdEquipamento,
          e.Descricao,
          e.NumeroSerie,
          te.Descricao AS Tipo,
          h.DataHora   AS UltimoHeartbeat
        FROM TBEquipamentos e
        LEFT JOIN TBTipoEquipamentos  te ON e.IdTipoEquipamento  = te.IdTipoEquipamento
        LEFT JOIN TBHeartbeatEquipamentos h ON h.IdEquipamento = e.IdEquipamento
        WHERE UPPER(LTRIM(RTRIM(e.Descricao))) = @nome
        ORDER BY h.DataHora DESC
      `);

    // Busca parcial â€” para detectar truncagem
    const partialMatch = await pool
      .request()
      .input("like", `%${normalizarNome(nomeEnviado).split(" ")[0]}%`)
      .query(`
        SELECT TOP 10
          e.IdEquipamento,
          e.Descricao,
          h.DataHora AS UltimoHeartbeat
        FROM TBEquipamentos e
        LEFT JOIN TBHeartbeatEquipamentos h ON h.IdEquipamento = e.IdEquipamento
        WHERE UPPER(e.Descricao) LIKE @like
        ORDER BY e.Descricao
      `);

    // Verificar duplicidade de ID entre faixas
    const duplicatas = partialMatch.recordset.filter(r => {
      const n = normalizarNome(r.Descricao);
      return n !== normalizarNome(nomeEnviado) && n.startsWith(normalizarNome(nomeEnviado.split(" ")[0]));
    });

    const encontrou = exactMatch.recordset.length > 0;
    const equipamento = encontrou ? exactMatch.recordset[0] : null;

    // DiagnÃ³stico de nome
    const nomeCorreto = encontrou
      ? normalizarNome(equipamento.Descricao)
      : (partialMatch.recordset[0]?.Descricao || null);

    const diagNome = nomeCorreto
      ? diagnosticarNome(nomeEnviado, nomeCorreto)
      : { ok: false, tipo: "equipamento_nao_encontrado", detalhe: `Equipamento "${nomeEnviado}" nÃ£o encontrado no AxHub.` };

    // Heartbeat
    let heartbeat = null;
    if (equipamento?.UltimoHeartbeat) {
      const minutos = minAtras(equipamento.UltimoHeartbeat);
      heartbeat = {
        ultimo_sinal: equipamento.UltimoHeartbeat,
        minutos_atras: minutos,
        status: minutos <= 5  ? "online"
               : minutos <= 15 ? "atencao"
               : "offline"
      };
    }

    // ClassificaÃ§Ã£o geral
    const categoria = !encontrou              ? "configuracao"
                    : !diagNome.ok            ? "configuracao"
                    : duplicatas.length > 0   ? "modelagem"
                    : heartbeat?.status === "offline" ? "comunicacao"
                    : "ok";

    const nomeSugerido = faixa
      ? sugerirNome(nomeEnviado.split(/[-_\s]/)[0], faixa)
      : null;

    return res.json({
      ...resultado,
      status_integracao:  categoria === "ok" ? "OK" : "ERRO",
      categoria,
      nome_encontrado_axhub: nomeCorreto,
      diagnostico_nome: diagNome,
      equipamento_axhub: equipamento || null,
      heartbeat,
      similares_encontrados: partialMatch.recordset.length,
      similares: partialMatch.recordset.slice(0, 5),
      duplicidade_faixas: duplicatas.length > 0,
      possiveis_duplicatas: duplicatas.map(d => d.Descricao),
      nome_sugerido: nomeSugerido,
      correcoes: _gerarCorrecoes(diagNome, duplicatas, heartbeat, encontrou, nomeEnviado, nomeSugerido)
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

function _gerarCorrecoes(diagNome, duplicatas, heartbeat, encontrou, nomeEnviado, nomeSugerido) {
  const lista = [];

  if (!encontrou) {
    lista.push({
      prioridade: "alta",
      acao: `Cadastrar equipamento "${nomeEnviado}" no AxHub ou corrigir o VARCO_DEVICE_NAME para corresponder ao nome jÃ¡ cadastrado.`
    });
  }

  if (!diagNome.ok && diagNome.tipo === "nome_truncado") {
    lista.push({
      prioridade: "alta",
      acao: `Corrigir script de heartbeat: usar o VARCO_DEVICE_NAME completo na URL. Trocar /ping/${nomeEnviado.split(" ")[0]} por /ping/${encodeURIComponent(nomeEnviado)}.`
    });
  }

  if (!diagNome.ok && diagNome.tipo === "formatacao_diferente") {
    lista.push({
      prioridade: "media",
      acao: `Padronizar formato: usar exatamente "${nomeSugerido || nomeEnviado}" tanto no VARCO quanto no AxHub.`
    });
  }

  if (duplicatas.length > 0) {
    lista.push({
      prioridade: "alta",
      acao: `Cada faixa deve ter ID Ãºnico. Renomear dispositivos com padrÃ£o EQUIPAMENTO-F1, EQUIPAMENTO-F2. Ex: ${nomeSugerido || nomeEnviado + "-F1"}.`
    });
  }

  if (heartbeat?.status === "offline") {
    lista.push({
      prioridade: "alta",
      acao: `Equipamento offline hÃ¡ ${heartbeat.minutos_atras} minutos. Verificar conectividade da cÃ¢mera e configuraÃ§Ã£o do heartbeat no VARCO.`
    });
  }

  return lista;
}

// â”€â”€â”€ POST /api/varco/validar-lote â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const schemaLote = z.object({
  dispositivos: z.array(z.object({
    varco_device_name:   z.string().min(1),
    equipment_name_sent: z.string().optional(),
    faixa:               z.union([z.string(), z.number()]).optional()
  })).min(1).max(50)
});

export async function validarLote(req, res) {
  const parse = schemaLote.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ erro: parse.error.errors[0].message });
  }

  const { dispositivos } = parse.data;
  const resultados = [];
  let erros = 0;
  let ok = 0;

  for (const d of dispositivos) {
    // Reusar lÃ³gica do validar-dispositivo sem HTTP (chamada interna)
    const fakeReq = { body: d };
    let resposta = null;
    const fakeRes = {
      json: (data) => { resposta = data; },
      status: () => ({ json: (data) => { resposta = data; } })
    };
    await validarDispositivo(fakeReq, fakeRes);
    resultados.push(resposta);
    if (resposta?.status_integracao === "OK") ok++; else erros++;
  }

  // Detectar padrÃ£o de erro repetido
  const tiposErro = resultados
    .filter(r => r?.categoria && r.categoria !== "ok")
    .map(r => r.categoria);
  const padraoErro = tiposErro.length > 0
    ? tiposErro.sort().reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {})
    : null;

  return res.json({
    total: dispositivos.length,
    ok,
    erros,
    padrao_erro: padraoErro,
    resultados
  });
}

// â”€â”€â”€ POST /api/varco/analisar-incidente â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const schemaIncidente = z.object({
  equipamento:      z.string().min(1),
  data_referencia:  z.string().optional(),
  problema:         z.string().min(1),
  acoes_realizadas: z.array(z.string()).optional(),
  efeitos_observados: z.array(z.string()).optional(),
  incertezas:       z.array(z.string()).optional()
});

export async function analisarIncidente(req, res) {
  const parse = schemaIncidente.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ erro: parse.error.errors[0].message });
  }

  const incidente = parse.data;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ erro: "OPENAI_API_KEY nÃ£o configurada â€” anÃ¡lise de incidente requer OpenAI." });
  }

  const prompt = `
VocÃª Ã© um especialista em integraÃ§Ã£o de sistemas IoT com cÃ¢meras OCR (Pumatronix/ITSCAM), plataforma VARCO e API AxHub.

Analise o seguinte incidente operacional e retorne um diagnÃ³stico tÃ©cnico em JSON.

INCIDENTE:
- Equipamento: ${incidente.equipamento}
- Data de referÃªncia: ${incidente.data_referencia || "nÃ£o informada"}
- Problema relatado: ${incidente.problema}
- AÃ§Ãµes realizadas: ${(incidente.acoes_realizadas || []).join("; ") || "nenhuma informada"}
- Efeitos observados apÃ³s aÃ§Ãµes: ${(incidente.efeitos_observados || []).join("; ") || "nenhum informado"}
- Incertezas: ${(incidente.incertezas || []).join("; ") || "nenhuma"}

Retorne SOMENTE um JSON vÃ¡lido com esta estrutura:
{
  "classificacao": "comunicacao | configuracao | payload | modelagem | bug_sistemico",
  "causa_raiz": "descriÃ§Ã£o tÃ©cnica da causa raiz",
  "hipoteses_tecnicas": ["hipÃ³tese 1", "hipÃ³tese 2"],
  "impacto": "descriÃ§Ã£o do impacto no sistema",
  "correlacoes": ["possÃ­vel correlaÃ§Ã£o entre sintomas"],
  "correcoes_recomendadas": [
    {"prioridade": "alta | media | baixa", "acao": "aÃ§Ã£o especÃ­fica", "resultado_esperado": "resultado"}
  ],
  "checklist_validacao": ["item 1", "item 2"],
  "observabilidade_necessaria": ["log ou mÃ©trica necessÃ¡ria para confirmar diagnÃ³stico"]
}
`.trim();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }]
    });

    let diagnostico;
    try {
      diagnostico = JSON.parse(response.choices[0].message.content);
    } catch {
      diagnostico = { erro_parse: "Resposta da IA nÃ£o Ã© JSON vÃ¡lido", raw: response.choices[0].message.content };
    }

    return res.json({
      incidente_estruturado: {
        evento: "INCIDENTE_OPERACIONAL",
        equipamento: incidente.equipamento,
        dataReferencia: incidente.data_referencia,
        problema: incidente.problema,
        acoes: incidente.acoes_realizadas || [],
        efeitos: incidente.efeitos_observados || [],
        incertezas: incidente.incertezas || []
      },
      diagnostico,
      analisado_em: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// â”€â”€â”€ GET /api/varco/heartbeat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function heartbeatGeral(req, res) {
  try {
    const pool = await conectar();

    const result = await pool.request().query(`
      SELECT
        e.IdEquipamento,
        e.Descricao        AS Equipamento,
        e.NumeroSerie,
        te.Descricao       AS Tipo,
        h.DataHora         AS UltimoHeartbeat,
        l.Descricao        AS Local
      FROM TBEquipamentos e
      LEFT JOIN TBTipoEquipamentos te ON e.IdTipoEquipamento = te.IdTipoEquipamento
      LEFT JOIN TBHeartbeatEquipamentos h ON h.IdEquipamento = e.IdEquipamento
      LEFT JOIN TBLocais l ON e.IdLocal = l.IdLocal
      WHERE e.IdTipoEquipamento IS NOT NULL
      ORDER BY h.DataHora DESC
    `);

    const equipamentos = result.recordset.map(e => {
      const min = minAtras(e.UltimoHeartbeat);
      return {
        ...e,
        minutos_desde_sinal: min === Infinity ? null : min,
        status: min <= 5 ? "online" : min <= 15 ? "atencao" : "offline"
      };
    });

    const online  = equipamentos.filter(e => e.status === "online").length;
    const atencao = equipamentos.filter(e => e.status === "atencao").length;
    const offline = equipamentos.filter(e => e.status === "offline").length;

    return res.json({
      total: equipamentos.length,
      online,
      atencao,
      offline,
      saude_geral: offline === 0 ? "OK" : offline > equipamentos.length / 2 ? "CRITICO" : "DEGRADADO",
      equipamentos
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// â”€â”€â”€ GET /api/varco/frota â€” Lista todos dispositivos direto do VARCO â”€â”€â”€â”€â”€â”€â”€â”€â”€

let cachedToken = null;
let tokenExpiry = 0;

async function getVarcoToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const email = process.env.VARCO_EMAIL;
  const password = process.env.VARCO_PASSWORD;
  if (!email || !password) throw new Error("VARCO_EMAIL e VARCO_PASSWORD nÃ£o configurados no .env");

  const res = await fetch("https://varco.io/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error("Falha login VARCO: " + res.status);
  const data = await res.json();
  cachedToken = data.token;
  tokenExpiry = Date.now() + 3600_000; // 1h
  return cachedToken;
}

export async function listarFrota(req, res) {
  try {
    // Tentar buscar do VARCO Cloud se credenciais disponÃ­veis
    if (process.env.VARCO_EMAIL && process.env.VARCO_PASSWORD) {
      try {
        const token = await getVarcoToken();
        const devRes = await fetch("https://varco.io/api/devices?limit=100&offset=0", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (devRes.ok) {
          const raw = await devRes.json();
          const devices = Object.values(raw).map(d => ({
            name: d.commonName,
            uuid: d.uuid,
            ip: d.lastSeenIP,
            status: d.status,
            connected: d.connected,
            lastSeen: d.lastSeenAt,
            registeredAt: d.registeredAt,
            availability: d.todayAvailability,
            tunnel: `https://${d.uuid}-80.tunnel.varco.cloud`
          }));
          devices.sort((a, b) => a.name.localeCompare(b.name));

          const online = devices.filter(d => d.connected).length;
          return res.json({
            total: devices.length,
            online,
            offline: devices.length - online,
            devices
          });
        }
      } catch (varcoErr) {
        console.warn("[VARCO] Falha ao buscar do cloud, usando dados locais:", varcoErr.message);
      }
    }

    // Fallback: usar dados do arquivo local analise-dados.json
    const dataFile = resolve(process.cwd(), "../../auditoria-itscam/analise-dados.json");
    if (!existsSync(dataFile)) {
      return res.status(404).json({ erro: "Dados de frota nÃ£o disponÃ­veis. Execute a anÃ¡lise primeiro ou configure VARCO_EMAIL/VARCO_PASSWORD.", caminhoEsperado: dataFile });
    }

    const data = JSON.parse(readFileSync(dataFile, "utf8"));
    const devices = (data.devices || data).map(d => ({
      name: d.nome,
      uuid: d.uuid,
      ip: d.ip,
      status: d.raw ? "online" : "offline",
      connected: !!d.raw,
      lastSeen: null,
      registeredAt: null,
      availability: null,
      tunnel: d.uuid ? `https://${d.uuid}-80.tunnel.varco.cloud` : null
    }));
    devices.sort((a, b) => a.name.localeCompare(b.name));

    const online = devices.filter(d => d.connected).length;
    return res.json({
      total: devices.length,
      online,
      offline: devices.length - online,
      devices,
      fonte: "cache_local"
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// â”€â”€â”€ GET /api/varco/auditoria â€” Status da auditoria de configuraÃ§Ã£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
const execFileAsync = promisify(execFile);

export function auditoriaStatus(req, res) {
  try {
    // Corrigido: caminho relativo correto (../ para subir um nÃ­vel)
    const dataFile = resolve(process.cwd(), "../../auditoria-itscam/analise-dados.json");

    if (!existsSync(dataFile)) {
      return res.status(404).json({ erro: "Dados de auditoria nÃ£o encontrados. Execute a anÃ¡lise primeiro.", caminhoEsperado: dataFile });
    }

    const data = JSON.parse(readFileSync(dataFile, "utf8"));

    // Suporta formato antigo (array puro) e novo (objeto com .devices)
    if (data.devices) {
      return res.json(data);
    }
    // Fallback: array direto
    return res.json({
      total: data.length,
      inventario: data.length,
      ultimaAtualizacao: new Date().toISOString(),
      devices: data
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message, stack: err.stack });
  }
}

// â”€â”€â”€ GET /api/varco/auditoria-aprimorada â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function auditoriaAprimorada(req, res) {
  try {
    const dataFile = resolve(process.cwd(), "../../auditoria-itscam/analise-aprimorada.json");

    if (!existsSync(dataFile)) {
      return res.status(404).json({ erro: "AnÃ¡lise aprimorada nÃ£o encontrada. Execute: node auditoria-itscam/analise-aprimorada.mjs" });
    }

    const data = JSON.parse(readFileSync(dataFile, "utf8"));
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// â”€â”€â”€ POST /api/varco/recoleta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function recoletaVarco(req, res) {
  if (!_isAdminRequest(req)) return res.status(403).json({ erro: "Acesso restrito a administradores." });
  try {
    const cwd = resolve(process.cwd(), "../..");
    const scriptRecoleta = resolve(cwd, "auditoria-itscam/recoletar-dados.mjs");
    const scriptValidar  = resolve(cwd, "auditoria-itscam/validar-config.mjs");

    if (!existsSync(scriptRecoleta)) return res.status(404).json({ erro: "Script recoletar-dados.mjs nao encontrado." });
    if (!existsSync(scriptValidar))  return res.status(404).json({ erro: "Script validar-config.mjs nao encontrado." });

    console.log(`[AUDIT] varco/recoleta executado por ${req.ip} em ${new Date().toISOString()}`);

    // Passo 1: coletar dados frescos de todos equipamentos -> analise-dados.json
    await execFileAsync("node", [scriptRecoleta], {
      cwd,
      timeout: 360000,
      maxBuffer: 10 * 1024 * 1024,
    });

    // Passo 2: validar contra config padrao usando dados locais -> validacao-config.json
    await execFileAsync("node", [scriptValidar, "--local"], {
      cwd,
      timeout: 60000,
      maxBuffer: 10 * 1024 * 1024,
    });

    const resultFile = resolve(cwd, "auditoria-itscam/validacao-config.json");
    if (existsSync(resultFile)) {
      const data = JSON.parse(readFileSync(resultFile, "utf8"));
      return res.json({ ok: true, geradoEm: data.geradoEm, resumo: data.resumo });
    }
    return res.json({ ok: true, msg: "Coleta concluida." });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export function configPadrao(req, res) {
  try {
    const faixa = req.query.faixa === "2" ? "2" : "1";
    const padFile = resolve(process.cwd(), `../../auditoria-itscam/config-padrao/padrao-faixa-${faixa}.json`);

    if (!existsSync(padFile)) {
      return res.status(404).json({ erro: `Config padrÃ£o faixa ${faixa} nÃ£o encontrada.` });
    }

    const data = JSON.parse(readFileSync(padFile, "utf8"));
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// â”€â”€â”€ GET /api/varco/relatorio â€” Dados do relatÃ³rio de erros â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function relatorioErros(req, res) {
  try {
    const validFile = resolve(process.cwd(), "../../auditoria-itscam/validacao-config.json");
    if (!existsSync(validFile)) {
      return res.status(404).json({ erro: "validacao-config.json nÃ£o encontrado. Execute: node auditoria-itscam/validar-config.mjs" });
    }
    const data = JSON.parse(readFileSync(validFile, "utf8"));
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// â”€â”€â”€ GET /api/varco/relatorio/download â€” Baixa o relatÃ³rio como .doc ou abre para impressÃ£o â”€â”€
function buildRelatorioHtml(data) {
  const { resumo, grupos, offline } = data;
  const geradoEm = new Date(data.geradoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const perc  = resumo.percentConformes;
  const barra = "â–ˆ".repeat(Math.round(perc / 5)) + "â–‘".repeat(20 - Math.round(perc / 5));
  const SEV   = { alto: "Alta ðŸ”´", medio: "MÃ©dia ðŸŸ¡", baixo: "Baixa ðŸŸ¢" };
  const fmtV  = v => Array.isArray(v) ? v.join(", ") : typeof v === "boolean" ? (v ? "Sim" : "NÃ£o") : String(v ?? "â€”");

  const INSTRUCOES = {
    SNMP_OFF:   ["Acesse a UI web do equipamento (http://IP)", "Navegue atÃ© Sistema &gt; SNMP", "Desmarque <b>Habilitar SNMP</b>", "Clique em <b>Salvar</b>"],
    NTP_SERVER: ["Acesse a UI web do equipamento (http://IP)", "Navegue atÃ© Equipamento &gt; Data e Hora", "Substitua <code>200.160.0.8</code> por <code>time.google.com</code>", "Clique em <b>Salvar</b>"],
  };

  const gruposHtml = grupos.map((g, idx) => {
    const altsHtml = g.alteracoes.map(a => `
      <tr>
        <td style="padding:7px 10px;border:1px solid #dee2e6;font-weight:600">${a.titulo}</td>
        <td style="padding:7px 10px;border:1px solid #dee2e6">${SEV[a.severidade] || a.severidade}</td>
        <td style="padding:7px 10px;border:1px solid #dee2e6">${a.menu}</td>
        <td style="padding:7px 10px;border:1px solid #dee2e6;color:#dc3545">${fmtV(a.valorAtual)}</td>
        <td style="padding:7px 10px;border:1px solid #dee2e6;color:#198754">${fmtV(a.valorEsperado)}</td>
      </tr>`).join("");
    const instrKey = g.alteracoes[0]?.id;
    const steps    = (INSTRUCOES[instrKey] || ["Acesse a UI web e ajuste o valor conforme esperado"]).map((s,i) => `<li style="margin:3px 0">${i+1}. ${s}</li>`).join("");
    const devsHtml = g.dispositivos.map(d => `
      <tr>
        <td style="padding:6px 10px;border:1px solid #dee2e6">${d.nome}</td>
        <td style="padding:6px 10px;border:1px solid #dee2e6;text-align:center">F${d.faixa}</td>
        <td style="padding:6px 10px;border:1px solid #dee2e6;text-align:center">${d.score}%</td>
      </tr>`).join("");
    return `
    <div style="margin-bottom:24px;border:1px solid #dee2e6;border-radius:6px;overflow:hidden;page-break-inside:avoid">
      <div style="background:#f8f9fa;padding:9px 14px;font-weight:700;font-size:13px;border-bottom:1px solid #dee2e6">
        Grupo ${idx+1} â€” ${g.alteracoes.map(a=>a.titulo).join(" + ")}
      </div>
      <div style="padding:14px">
        <p style="font-size:11px;color:#6c757d;text-transform:uppercase;font-weight:700;margin:0 0 6px">DivergÃªncias</p>
        <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:14px">
          <thead><tr style="background:#e9ecef">
            <th style="padding:7px 10px;border:1px solid #dee2e6;text-align:left">ParÃ¢metro</th>
            <th style="padding:7px 10px;border:1px solid #dee2e6;text-align:left">Severidade</th>
            <th style="padding:7px 10px;border:1px solid #dee2e6;text-align:left">LocalizaÃ§Ã£o na UI</th>
            <th style="padding:7px 10px;border:1px solid #dee2e6;text-align:left">Valor Atual</th>
            <th style="padding:7px 10px;border:1px solid #dee2e6;text-align:left">Valor Esperado</th>
          </tr></thead>
          <tbody>${altsHtml}</tbody>
        </table>
        <p style="font-size:11px;color:#6c757d;text-transform:uppercase;font-weight:700;margin:0 0 6px">Como corrigir</p>
        <ul style="margin:0 0 14px;padding-left:0;list-style:none;font-size:12px;background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:10px 14px">${steps}
          <li style="margin-top:8px;color:#856404;font-size:11px">âš ï¸ CorreÃ§Ã£o manual via UI web â€” endpoint REST sem suporte a escrita para este campo</li>
        </ul>
        <p style="font-size:11px;color:#6c757d;text-transform:uppercase;font-weight:700;margin:0 0 6px">Equipamentos afetados (${g.dispositivos.length})</p>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr style="background:#e9ecef">
            <th style="padding:6px 10px;border:1px solid #dee2e6;text-align:left">Equipamento</th>
            <th style="padding:6px 10px;border:1px solid #dee2e6;text-align:center">Faixa</th>
            <th style="padding:6px 10px;border:1px solid #dee2e6;text-align:center">Score</th>
          </tr></thead>
          <tbody>${devsHtml}</tbody>
        </table>
      </div>
    </div>`;
  }).join("");

  const offlineHtml = offline.map(d => `
    <tr>
      <td style="padding:7px 10px;border:1px solid #dee2e6">${d.nome}</td>
      <td style="padding:7px 10px;border:1px solid #dee2e6;font-family:monospace">${d.ip || "â€”"}</td>
      <td style="padding:7px 10px;border:1px solid #dee2e6;font-size:10px;color:#6c757d">${d.uuid}</td>
      <td style="padding:7px 10px;border:1px solid #dee2e6;color:#dc3545">ðŸ”§ Verificar fisicamente</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>RelatÃ³rio de Erros â€” Frota ITScam 450</title>
<style>
  @page { size: A4; margin: 20mm 15mm; }
  *{box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#212529;margin:0;padding:20px}
  @media print{body{padding:0}.no-print{display:none}}
  h1{font-size:20px;border-bottom:2px solid #0d6efd;padding-bottom:8px;margin-bottom:4px}
  h2{font-size:15px;color:#0d6efd;margin:24px 0 10px;border-left:4px solid #0d6efd;padding-left:10px}
  .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:14px 0 20px}
  .stat-box{border:1px solid #dee2e6;border-radius:6px;padding:12px;text-align:center}
  .stat-num{font-size:26px;font-weight:700}
  .stat-lbl{font-size:11px;color:#6c757d;text-transform:uppercase}
  .progress{background:#e9ecef;border-radius:4px;height:18px;margin:6px 0 4px;overflow:hidden}
  .progress-bar{height:100%;background:#198754;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700}
  code{background:#f8f9fa;padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px}
  .footer-note{margin-top:28px;padding:10px;background:#f8f9fa;border:1px solid #dee2e6;border-radius:6px;font-size:11px;color:#6c757d;text-align:center}
  .no-print{margin:0 0 16px;padding:10px 14px;background:#e7f3ff;border:1px solid #b8d9f8;border-radius:5px;font-size:12px}
</style>
</head>
<body>
<div class="no-print">
  <strong>ðŸ’¡ Para salvar como PDF:</strong> use Ctrl+P (Imprimir) â†’ selecione "Salvar como PDF" como impressora.
</div>
<h1>ðŸ“‹ RelatÃ³rio de Erros â€” Frota ITScam 450</h1>
<p style="color:#6c757d;font-size:12px;margin:4px 0 20px">
  <strong>Gerado em:</strong> ${geradoEm} &nbsp;|&nbsp;
  <strong>Script padrÃ£o:</strong> config-padrao/padrao-faixa-{1,2}.json &nbsp;|&nbsp;
  <strong>Regras validadas:</strong> ${data.totalRegras}
</p>

<h2>ðŸ“Š Resumo Executivo</h2>
<div class="stat-grid">
  <div class="stat-box"><div class="stat-num" style="color:#0d6efd">${resumo.total}</div><div class="stat-lbl">Total</div></div>
  <div class="stat-box"><div class="stat-num" style="color:#198754">${resumo.conformes}</div><div class="stat-lbl">âœ… Conformes</div></div>
  <div class="stat-box"><div class="stat-num" style="color:#ffc107">${resumo.alterados}</div><div class="stat-lbl">âš ï¸ Com erros</div></div>
  <div class="stat-box"><div class="stat-num" style="color:#dc3545">${resumo.offline}</div><div class="stat-lbl">ðŸ“¡ Offline</div></div>
</div>
<div class="progress"><div class="progress-bar" style="width:${perc}%">${perc}%</div></div>
<p style="font-size:11px;color:#6c757d;margin:0 0 20px">Conformidade: <code>[${barra}] ${perc}%</code></p>

${grupos.length === 0
  ? '<div style="padding:14px;background:#d1e7dd;border:1px solid #a3cfbb;border-radius:6px;color:#0f5132">âœ… Todos os equipamentos online estÃ£o em conformidade com o script padrÃ£o.</div>'
  : `<h2>âŒ Erros a Corrigir</h2>
     <p style="font-size:12px;margin:0 0 16px"><strong>${resumo.alterados}</strong> equipamento(s) com divergÃªncias em <strong>${grupos.length}</strong> grupo(s).</p>
     ${gruposHtml}`}

<h2>ðŸ“¡ Equipamentos Offline</h2>
${offline.length === 0
  ? '<p style="font-size:12px;color:#198754">Nenhum equipamento offline.</p>'
  : `<p style="font-size:12px;margin:0 0 10px"><strong>${offline.length}</strong> equipamento(s) sem comunicaÃ§Ã£o. VerificaÃ§Ã£o fÃ­sica necessÃ¡ria.</p>
     <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px">
       <thead><tr style="background:#e9ecef">
         <th style="padding:7px 10px;border:1px solid #dee2e6;text-align:left">Equipamento</th>
         <th style="padding:7px 10px;border:1px solid #dee2e6;text-align:left">IP</th>
         <th style="padding:7px 10px;border:1px solid #dee2e6;text-align:left">UUID</th>
         <th style="padding:7px 10px;border:1px solid #dee2e6;text-align:left">AÃ§Ã£o</th>
       </tr></thead>
       <tbody>${offlineHtml}</tbody>
     </table>
     <p style="font-size:11px;color:#6c757d">
       <strong>VerificaÃ§Ã£o:</strong> Checar energia â†’ rede/4G â†’ LED: ðŸŸ¢ verde = OK | ðŸ”´ vermelho = falha | âš« apagado = sem energia
     </p>`}

<div class="footer-note">
  RelatÃ³rio gerado automaticamente pelo sistema de auditoria ITScam â€” Axion Tecnologia
</div>
</body>
</html>`;
}

export function relatorioDownload(req, res) {
  try {
    const validFile = resolve(process.cwd(), "../../auditoria-itscam/validacao-config.json");
    if (!existsSync(validFile)) {
      return res.status(404).json({ erro: "validacao-config.json nÃ£o encontrado." });
    }
    const data = JSON.parse(readFileSync(validFile, "utf8"));
    const html = buildRelatorioHtml(data);
    const fmt  = req.query.format === "print" ? "print" : "doc";
    const dt   = new Date(data.geradoEm).toISOString().slice(0, 10);

    if (fmt === "print") {
      // Retorna HTML puro para abrir no browser e imprimir
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(html);
    }

    // Word (.doc via HTML)
    res.setHeader("Content-Type", "application/msword; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="relatorio-erros-itscam-${dt}.doc"`);
    return res.send("\ufeff" + html);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// â”€â”€â”€ GET /api/varco/plano-correcao â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function planoCorrecao(req, res) {
  try {
    const dataFile = resolve(process.cwd(), "../../auditoria-itscam/plano-correcao.json");
    if (!existsSync(dataFile)) {
      return res.status(404).json({ erro: "Plano de correÃ§Ã£o nÃ£o encontrado. Execute: node auditoria-itscam/corrigir-frota.mjs --plano" });
    }
    const data = JSON.parse(readFileSync(dataFile, "utf8"));
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// â”€â”€â”€ POST /api/varco/plano-correcao/gerar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function gerarPlano(req, res) {
  if (!_isAdminRequest(req)) return res.status(403).json({ erro: "Acesso restrito a administradores." });
  try {
    const script = resolve(process.cwd(), "../../auditoria-itscam/corrigir-frota.mjs");
    if (!existsSync(script)) {
      return res.status(404).json({ erro: "Script corrigir-frota.mjs nÃ£o encontrado." });
    }
    console.log(`[AUDIT] varco/gerar-plano executado por ${req.ip} em ${new Date().toISOString()}`);
    const { stdout } = await execFileAsync("node", [script, "--plano"], {
      cwd: resolve(process.cwd(), "../.."),
      timeout: 360000,
      maxBuffer: 10 * 1024 * 1024,
    });
    const dataFile = resolve(process.cwd(), "../../auditoria-itscam/plano-correcao.json");
    if (existsSync(dataFile)) {
      const data = JSON.parse(readFileSync(dataFile, "utf8"));
      return res.json({ ok: true, plano: data });
    }
    return res.json({ ok: true, msg: "Plano gerado" });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// â”€â”€â”€ POST /api/varco/plano-correcao/aplicar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function aplicarCorrecao(req, res) {
  if (!_isAdminRequest(req)) return res.status(403).json({ erro: "Acesso restrito a administradores." });
  try {
    const { caso } = req.body || {};
    // Sanitize: caso deve ser alfanumÃ©rico simples (previne command injection)
    if (caso && !/^[a-zA-Z0-9_-]+$/.test(caso)) {
      return res.status(400).json({ erro: "ParÃ¢metro 'caso' contÃ©m caracteres invÃ¡lidos." });
    }
    const script = resolve(process.cwd(), "../../auditoria-itscam/corrigir-frota.mjs");
    if (!existsSync(script)) {
      return res.status(404).json({ erro: "Script corrigir-frota.mjs nÃ£o encontrado." });
    }
    console.log(`[AUDIT] varco/aplicar-correcao caso=${caso || 'todos'} por ${req.ip} em ${new Date().toISOString()}`);
    const args = ["--aplicar"];
    if (caso) args.push(`--caso=${caso}`);
    const { stdout } = await execFileAsync("node", [script, ...args], {
      cwd: resolve(process.cwd(), "../.."),
      timeout: 360000,
      maxBuffer: 10 * 1024 * 1024,
    });
    const dataFile = resolve(process.cwd(), "../../auditoria-itscam/plano-correcao.json");
    if (existsSync(dataFile)) {
      const data = JSON.parse(readFileSync(dataFile, "utf8"));
      return res.json({ ok: true, resultado: data });
    }
    return res.json({ ok: true, msg: "CorreÃ§Ã£o aplicada" });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// â”€â”€â”€ Helpers ITScam REST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ITSCAM_USER = "admin";
const ITSCAM_PASS = "#econocr@";
const ITSCAM_TIMEOUT = 20_000;

async function autenticarItscam(baseUrl) {
  const res = await fetch(`${baseUrl}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ params: { username: ITSCAM_USER, password: ITSCAM_PASS } }),
    signal: AbortSignal.timeout(ITSCAM_TIMEOUT),
  });
  if (!res.ok) throw new Error(`Auth ITScam falhou: HTTP ${res.status}`);
  const data = await res.json();
  const token = data.token || data.accessToken || data.access_token;
  if (!token) throw new Error("Token nÃ£o retornado pelo ITScam");
  return token;
}

async function lerItscam(baseUrl, endpoint) {
  const token = await autenticarItscam(baseUrl);
  const res = await fetch(`${baseUrl}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(ITSCAM_TIMEOUT),
  });
  if (!res.ok) throw new Error(`Leitura ITScam falhou: HTTP ${res.status}`);
  return res.json();
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === "object" && !Array.isArray(source[key])
        && target[key] !== null && typeof target[key] === "object") {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * Envia payload via PUT ou POST dependendo do endpoint.
 * Para POST faz GET-deepMerge-POST para preservar campos nao alterados.
 */
async function escreverItscam(baseUrl, endpoint, payload, method = "PUT") {
  const token = await autenticarItscam(baseUrl);

  let finalPayload = payload;
  if (method === "POST") {
    const current = await lerItscam(baseUrl, endpoint).catch(() => null);
    if (current && typeof current === "object") finalPayload = deepMerge(current, payload);
  }

  const res = await fetch(
`${baseUrl}${endpoint}`
, {
    method,
    headers: { Authorization: 
`Bearer ${token}`
, 
"Content-Type": "application/json"
 },
    body: JSON.stringify(finalPayload),
    signal: AbortSignal.timeout(ITSCAM_TIMEOUT),
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(
`Escrita ITScam falhou: HTTP ${res.status}`
);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : { ok: true };
}

// â”€â”€â”€ POST /api/varco/itscam/ler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * LÃª a configuraÃ§Ã£o atual de um equipamento ITScam via REST API
 * Body: { uuid, endpoint }
 * ex: { uuid: "abc123", endpoint: "/api/equipment/misc" }
 */
export async function itscamLer(req, res) {
  if (!_isAdminRequest(req)) return res.status(403).json({ erro: "Acesso negado" });
  try {
    const { uuid, endpoint } = req.body;
    if (!uuid || !endpoint) return res.status(400).json({ erro: "uuid e endpoint sÃ£o obrigatÃ³rios" });

    // Valida endpoint: apenas caminhos /api/...
    if (!/^\/api\/[a-zA-Z0-9/_-]+$/.test(endpoint)) {
      return res.status(400).json({ erro: "endpoint invÃ¡lido" });
    }

    const baseUrl = `https://${uuid}-80.tunnel.varco.cloud`;
    const data = await lerItscam(baseUrl, endpoint);
    console.log(`[ITScam] Leitura ${uuid} ${endpoint}`);
    return res.json({ ok: true, uuid, endpoint, data });
  } catch (err) {
    console.error("[ITScam] Erro leitura:", err.message);
    return res.status(502).json({ erro: "Falha na comunicaÃ§Ã£o com o equipamento", detalhe: err.message });
  }
}

// â”€â”€â”€ POST /api/varco/itscam/aplicar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * Aplica uma configuraÃ§Ã£o num equipamento ITScam via REST API
 * Body: { uuid, endpoint, payload }
 * ex: { uuid: "abc123", endpoint: "/api/equipment/misc", payload: { snapshotCrop: { enable: false, mode: "static" } } }
 */
export async function itscamAplicar(req, res) {
  if (!_isAdminRequest(req)) return res.status(403).json({ erro: "Acesso negado" });
  try {
    const { uuid, endpoint, payload, method = "PUT" } = req.body;
    if (!uuid || !endpoint || !payload) {
      return res.status(400).json({ erro: "uuid, endpoint e payload sÃ£o obrigatÃ³rios" });
    }

    // Valida endpoint: apenas caminhos /api/...
    if (!/^\/api\/[a-zA-Z0-9/_-]+$/.test(endpoint)) {
      return res.status(400).json({ erro: "endpoint invÃ¡lido" });
    }

    const baseUrl = `https://${uuid}-80.tunnel.varco.cloud`;

    // LÃª valor atual para retornar comparaÃ§Ã£o
    const antes = await lerItscam(baseUrl, endpoint).catch(() => null);

    // Aplica
    const resultado = await escreverItscam(baseUrl, endpoint, payload, method);

    // LÃª apÃ³s para confirmar
    await new Promise(r => setTimeout(r, 800));
    const depois = await lerItscam(baseUrl, endpoint).catch(() => null);

    console.log(`[ITScam] AplicaÃ§Ã£o ${uuid} ${endpoint}`, JSON.stringify(payload));
    return res.json({ ok: true, uuid, endpoint, antes, depois, resultado });
  } catch (err) {
    console.error("[ITScam] Erro aplicaÃ§Ã£o:", err.message);
    return res.status(502).json({ erro: "Falha ao aplicar configuraÃ§Ã£o no equipamento", detalhe: err.message });
  }
}

// â”€â”€â”€ POST /api/varco/itscam/aplicar-lote â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * Aplica a mesma configuraÃ§Ã£o em mÃºltiplos equipamentos
 * Body: { devices: [{ uuid, nome }], endpoint, payload }
 */
export async function itscamAplicarLote(req, res) {
  if (!_isAdminRequest(req)) return res.status(403).json({ erro: "Acesso negado" });
  try {
    const { devices, endpoint, payload, method = "PUT" } = req.body;
    if (!devices?.length || !endpoint || !payload) {
      return res.status(400).json({ erro: "devices, endpoint e payload sÃ£o obrigatÃ³rios" });
    }
    if (!/^\/api\/[a-zA-Z0-9/_-]+$/.test(endpoint)) {
      return res.status(400).json({ erro: "endpoint invÃ¡lido" });
    }

    const resultados = [];
    for (const dev of devices) {
      const baseUrl = `https://${dev.uuid}-80.tunnel.varco.cloud`;
      try {
        await escreverItscam(baseUrl, endpoint, payload, method);
        resultados.push({ nome: dev.nome, uuid: dev.uuid, ok: true });
        console.log(`[ITScam] Lote OK: ${dev.nome}`);
      } catch (err) {
        resultados.push({ nome: dev.nome, uuid: dev.uuid, ok: false, erro: err.message });
        console.error(`[ITScam] Lote FALHOU: ${dev.nome}:`, err.message);
      }
    }

    const total = resultados.length;
    const ok    = resultados.filter(r => r.ok).length;
    return res.json({ ok: ok === total, total, sucesso: ok, falha: total - ok, resultados });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}


