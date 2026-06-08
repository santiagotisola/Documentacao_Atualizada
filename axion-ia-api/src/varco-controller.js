/**
 * varco-controller.js — Validador de integração VARCO → AxHub
 *
 * Analisa consistência de nomenclatura de equipamentos entre o sistema
 * VARCO (câmeras Pumatronix/ITSCAM) e o AxHub, validando:
 *  - Nome do dispositivo vs registro no banco AxHub
 *  - Duplicidade de IDs entre faixas
 *  - Heartbeat recente por equipamento
 *  - Estrutura de eventos (incidentes de fila/processamento)
 *
 * ROTAS:
 *  POST /api/varco/validar-dispositivo   → valida um device por nome
 *  POST /api/varco/validar-lote          → valida lista de devices
 *  POST /api/varco/analisar-incidente    → analisa incidente estruturado
 *  GET  /api/varco/heartbeat             → status de heartbeat de todos os equipamentos
 */

import { z } from "zod";
import { conectar } from "./services/axhub-db.js";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function minAtras(data) {
  if (!data) return Infinity;
  return Math.round((Date.now() - new Date(data).getTime()) / 60_000);
}

function normalizarNome(nome) {
  return (nome || "").trim().toUpperCase().replace(/\s+/g, " ");
}

// Detecta padrões de nome inconsistente (nome truncado, sem faixa, etc.)
function diagnosticarNome(nomeEnviado, nomeEsperado) {
  const a = normalizarNome(nomeEnviado);
  const b = normalizarNome(nomeEsperado);

  if (a === b)                         return { ok: true, tipo: null };
  if (b.startsWith(a) && a !== b)      return { ok: false, tipo: "nome_truncado",    detalhe: `"${nomeEnviado}" é prefixo de "${nomeEsperado}" — identificação de faixa removida.` };
  if (a.startsWith(b) && a !== b)      return { ok: false, tipo: "sufixo_extra",     detalhe: `"${nomeEnviado}" contém sufixo a mais vs "${nomeEsperado}".` };
  if (a.replace(/[_\-\s]/g, "") === b.replace(/[_\-\s]/g, "")) {
    return { ok: false, tipo: "formatacao_diferente", detalhe: `Nomes equivalentes mas com formatação diferente. Padronizar para o formato do AxHub.` };
  }
  return { ok: false, tipo: "nome_divergente", detalhe: `"${nomeEnviado}" não corresponde a "${nomeEsperado}" no AxHub.` };
}

// Sugestão de nome padronizado
function sugerirNome(base, faixa) {
  const b = normalizarNome(base).replace(/\s/g, "");
  if (!faixa) return b;
  const f = String(faixa).replace(/[^0-9]/g, "");
  return `${b}-F${f}`;
}

// ─── POST /api/varco/validar-dispositivo ─────────────────────────────────────

const schemaDispositivo = z.object({
  varco_device_name:   z.string().min(1, "varco_device_name é obrigatório"),
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

    // Busca parcial — para detectar truncagem
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

    // Diagnóstico de nome
    const nomeCorreto = encontrou
      ? normalizarNome(equipamento.Descricao)
      : (partialMatch.recordset[0]?.Descricao || null);

    const diagNome = nomeCorreto
      ? diagnosticarNome(nomeEnviado, nomeCorreto)
      : { ok: false, tipo: "equipamento_nao_encontrado", detalhe: `Equipamento "${nomeEnviado}" não encontrado no AxHub.` };

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

    // Classificação geral
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
      acao: `Cadastrar equipamento "${nomeEnviado}" no AxHub ou corrigir o VARCO_DEVICE_NAME para corresponder ao nome já cadastrado.`
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
      acao: `Cada faixa deve ter ID único. Renomear dispositivos com padrão EQUIPAMENTO-F1, EQUIPAMENTO-F2. Ex: ${nomeSugerido || nomeEnviado + "-F1"}.`
    });
  }

  if (heartbeat?.status === "offline") {
    lista.push({
      prioridade: "alta",
      acao: `Equipamento offline há ${heartbeat.minutos_atras} minutos. Verificar conectividade da câmera e configuração do heartbeat no VARCO.`
    });
  }

  return lista;
}

// ─── POST /api/varco/validar-lote ─────────────────────────────────────────────

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
    // Reusar lógica do validar-dispositivo sem HTTP (chamada interna)
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

  // Detectar padrão de erro repetido
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

// ─── POST /api/varco/analisar-incidente ──────────────────────────────────────

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
    return res.status(503).json({ erro: "OPENAI_API_KEY não configurada — análise de incidente requer OpenAI." });
  }

  const prompt = `
Você é um especialista em integração de sistemas IoT com câmeras OCR (Pumatronix/ITSCAM), plataforma VARCO e API AxHub.

Analise o seguinte incidente operacional e retorne um diagnóstico técnico em JSON.

INCIDENTE:
- Equipamento: ${incidente.equipamento}
- Data de referência: ${incidente.data_referencia || "não informada"}
- Problema relatado: ${incidente.problema}
- Ações realizadas: ${(incidente.acoes_realizadas || []).join("; ") || "nenhuma informada"}
- Efeitos observados após ações: ${(incidente.efeitos_observados || []).join("; ") || "nenhum informado"}
- Incertezas: ${(incidente.incertezas || []).join("; ") || "nenhuma"}

Retorne SOMENTE um JSON válido com esta estrutura:
{
  "classificacao": "comunicacao | configuracao | payload | modelagem | bug_sistemico",
  "causa_raiz": "descrição técnica da causa raiz",
  "hipoteses_tecnicas": ["hipótese 1", "hipótese 2"],
  "impacto": "descrição do impacto no sistema",
  "correlacoes": ["possível correlação entre sintomas"],
  "correcoes_recomendadas": [
    {"prioridade": "alta | media | baixa", "acao": "ação específica", "resultado_esperado": "resultado"}
  ],
  "checklist_validacao": ["item 1", "item 2"],
  "observabilidade_necessaria": ["log ou métrica necessária para confirmar diagnóstico"]
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
      diagnostico = { erro_parse: "Resposta da IA não é JSON válido", raw: response.choices[0].message.content };
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

// ─── GET /api/varco/heartbeat ─────────────────────────────────────────────────

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

// ─── GET /api/varco/frota — Lista todos dispositivos direto do VARCO ─────────

const VARCO_CREDENTIALS = {
  email: "suporte@axiontecnologia.com.br",
  password: "Axiontecnologia@2026"
};

let cachedToken = null;
let tokenExpiry = 0;

async function getVarcoToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const res = await fetch("https://varco.io/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(VARCO_CREDENTIALS)
  });
  if (!res.ok) throw new Error("Falha login VARCO: " + res.status);
  const data = await res.json();
  cachedToken = data.token;
  tokenExpiry = Date.now() + 3600_000; // 1h
  return cachedToken;
}

export async function listarFrota(req, res) {
  try {
    const token = await getVarcoToken();
    const devRes = await fetch("https://varco.io/api/devices?limit=100&offset=0", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!devRes.ok) throw new Error("Falha ao buscar dispositivos: " + devRes.status);
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
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─── GET /api/varco/auditoria — Status da auditoria de configuração ──────────

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export function auditoriaStatus(req, res) {
  try {
    const dataFile = resolve(process.cwd(), "../auditoria-itscam/analise-dados.json");

    if (!existsSync(dataFile)) {
      return res.status(404).json({ erro: "Dados de auditoria não encontrados. Execute a análise primeiro." });
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
    return res.status(500).json({ erro: err.message });
  }
}

// ─── GET /api/varco/auditoria-aprimorada ─────────────────────────────────────
export function auditoriaAprimorada(req, res) {
  try {
    const dataFile = resolve(process.cwd(), "../auditoria-itscam/analise-aprimorada.json");

    if (!existsSync(dataFile)) {
      return res.status(404).json({ erro: "Análise aprimorada não encontrada. Execute: node auditoria-itscam/analise-aprimorada.mjs" });
    }

    const data = JSON.parse(readFileSync(dataFile, "utf8"));
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─── GET /api/varco/config-padrao ────────────────────────────────────────────
export function configPadrao(req, res) {
  try {
    const faixa = req.query.faixa === "2" ? "2" : "1";
    const padFile = resolve(process.cwd(), `../auditoria-itscam/config-padrao/padrao-faixa-${faixa}.json`);

    if (!existsSync(padFile)) {
      return res.status(404).json({ erro: `Config padrão faixa ${faixa} não encontrada.` });
    }

    const data = JSON.parse(readFileSync(padFile, "utf8"));
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
