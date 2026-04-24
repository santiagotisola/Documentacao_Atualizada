/**
 * conformidade.js
 * Analisa se o AxHub/AxTon/AxCross atende os requisitos de um edital/TR.
 *
 * Fluxo:
 *  1. Extrai requisitos do edital — heurística AMPLIADA (10 padrões) + IA (merge, sem duplicatas).
 *  2. Cruza cada requisito com a documentação — scoring por palavras-chave (fase 1).
 *  3. Itens incertos (score 0.05–0.4) → avaliação semântica em lote via GPT (fase 2).
 *  4. Gera justificativas técnicas para todos os itens (fase 3).
 *  5. Monta relatório estruturado com veredicto APTO / PARCIALMENTE_APTO / INAPTO.
 *
 * ISOLAMENTO: não lê nem modifica KB, engine.js ou knowledge-base.json.
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import dotenv from "dotenv";
import Conformidade from "../models/conformidade.model.js";
import { normalizarTexto } from "./normalizador.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PORTAIS = {
  axhub:   path.resolve(__dirname, "../../../AxHub/docs-portal/docs"),
  axton:   path.resolve(__dirname, "../../../AxTon/docs-portal/docs"),
  axcross: path.resolve(__dirname, "../../../AxCross/docs-portal/docs"),
};

// ─── 1. LER DOCUMENTAÇÃO DO PRODUTO ──────────────────────────────

async function lerDocumentacao(produto) {
  const dir = PORTAIS[produto];
  const docs = [];

  async function walk(d, base = "") {
    let items;
    try { items = await fs.readdir(d, { withFileTypes: true }); }
    catch { return; }

    for (const item of items) {
      const full = path.join(d, item.name);
      const rel  = base ? `${base}/${item.name}` : item.name;
      if (item.isDirectory()) {
        await walk(full, rel);
      } else if (item.name.endsWith(".md") && !item.name.startsWith("_")) {
        try {
          const conteudo = await fs.readFile(full, "utf8");
          docs.push({ arquivo: rel, conteudo });
        } catch { /* ignora */ }
      }
    }
  }

  await walk(dir);
  return docs;
}

// ─── 2. EXTRAIR REQUISITOS DO EDITAL ─────────────────────────────

/**
 * Extração híbrida: sempre roda a heurística AMPLIADA (10 padrões) e,
 * se OpenAI estiver disponível, também roda a IA. Os resultados são mesclados
 * e deduplicados para máxima cobertura.
 */
async function extrairRequisitos(textoEdital) {
  const heuristica = extrairHeuristica(textoEdital);

  // Sempre tenta IA em paralelo se tiver chave
  let ia = [];
  if (process.env.OPENAI_API_KEY) {
    ia = await extrairViaIA(textoEdital);
  }

  // Mescla: adiciona itens da IA não cobertos pela heurística
  const heuristicaChaves = new Set(heuristica.map(r => normalizarTexto(r.texto).slice(0, 50)));
  const extras = ia.filter(r => {
    const chave = normalizarTexto(r.texto).slice(0, 50);
    return !heuristicaChaves.has(chave);
  });

  return [...heuristica, ...extras].slice(0, 150);
}

/**
 * Heurística AMPLIADA — 10 padrões para formatos de editais/contratos brasileiros.
 * Baseada nos mesmos padrões do parser.js, adaptada para extração de requisitos completos.
 */
function extrairHeuristica(texto) {
  const vistos = new Set();
  const requisitos = [];
  const linhas = texto.split("\n");

  // ── Padrões de início de linha que indicam requisito numerado/listado ──
  const PADROES_ESTRUTURA = [
    /^(\d+(?:\.\d+)*)\s+(.{15,})/,            // 1.2.3 texto
    /^([a-zA-Z]\))\s+(.{15,})/,               // a) texto
    /^[-•]\s+(.{15,})/,                       // - texto ou • texto
    /^(REQUISITO[\s\-#]*\d*)[:\s]+(.{10,})/i, // REQUISITO 1: texto
    /^(CL[AÁ]USULA\s+[IVXLCDM\d]+.{0,50})/i, // CLÁUSULA X
    /^(ART(?:IGO|\.)\s*\d+[ºª°]?\s*.{3,60})/i,// Art. 1º
  ];

  // ── Verbos que indicam obrigação funcional ──
  const VERBOS_REQ = /\b(dever[áa]|dever[ãa]o|deve\s+(?:possuir|ter|conter|incluir|contemplar|realizar|suportar|permitir|garantir|gerar|registrar|emitir|controlar|monitorar|gerenciar|processar|calcular|validar|integrar|exportar|importar)|precisa\s+(?:ter|possuir)|é\s+(?:obrigatório|necessário|requerido)|possibilitar[áa]|disponibilizar[áa])/i;

  function add(texto, origem = "heuristica") {
    const t = texto.trim().substring(0, 350);
    if (t.length < 15) return;

    // ── FILTROS: descarta linhas que NÃO são requisitos funcionais do sistema ──

    // 1. Stub de cabeçalho sem conteúdo funcional (curto + termina em ":")
    if (t.length < 60 && /:\s*$/.test(t) && !/deve|deverá|precisa|sistema|software/.test(t.toLowerCase())) return;

    // 2. Planilha de preços/quantitativos: "ME 5.500,0000 330.000", "UN 5,3000 95.400"
    if (/^[A-Z]{1,4}\s+[\d.,]+\s+[\d.,]+/.test(t)) return;

    // 3. Linha predominantemente numérica (tabela de preços, CNPJ, CEP)
    const naoNumericos = t.replace(/[\d.,\s\-R$%/()]/g, "").length;
    if (naoNumericos < t.length * 0.35 && t.length < 80) return;

    // 4. Cabeçalhos de colunas de tabela
    if (/^(cpf|cnpj|rg|crea|oab|item\s*$|valor\s+unit|valor\s+total|qtd\.?|quant\.?|und\.?|un\.?|descri[çc][aã]o do (item|servi))/i.test(t)) return;

    // 5. Assinaturas / testemunhas / data de assinatura
    if (/^(assinado\s+por|assinatura|testemunha|local\s+e\s+data|data\s+de\s+assinatura)/i.test(t)) return;

    // 6. Fragmentos de frase sem verbo principal (começa com número + texto muito curto)
    if (/^\d+[\.\d]*\s+/.test(t) && t.split(" ").length < 5) return;

    // 7. CLÁUSULAS JURÍDICAS/FINANCEIRAS — NÃO são requisitos de software
    // Estes itens são obrigações contratuais da empresa (caução, seguro, garantia financeira)
    // e NÃO representam funcionalidades que o sistema precisa ter
    const CLAUSULAS_JURIDICAS = /seguro[\s-]garantia|ap[oó]lice|cauc[íi]o|garantia\s+(em\s+dinheiro|financeira|contratual|de\s+proposta)|t[íi]tulo\s+da\s+d[íi]vida|fundo\s+de\s+garantia|fgts|inss|rescis[aã]o\s+(contratual|unilateral)|foro\s+(eleito|competente|desta)|vigência\s+do\s+contrato|prazo\s+de\s+vigência|multa\s+contratual|penalidade|sanção\s+administrativa|notificação\s+prévia|dias\s+(corridos|[uú]teis)\s+para|reajuste\s+(anual|contratual|pelo\s+[íi]ndice)|equil[íi]brio\s+econ[oô]mico|reequil[íi]brio|subconta|empenho\s+orçament|dotação\s+orçament|nota\s+de\s+empenho|ordem\s+de\s+servi[çc]o|aceite\s+definitivo|aceite\s+provis[oó]rio|recebimento\s+(definitivo|provis[oó]rio)|adjudicação|homologa[çc][aã]o\s+da\s+licita|comiss[aã]o\s+(pregoeira|julgadora)|pregoeiro|edital\s+de\s+licitação/i;
    if (CLAUSULAS_JURIDICAS.test(t)) return;

    // 8. Referências a atos/resoluções sem conteúdo funcional
    // Ex: "000001/2025, realizada em 04/06/2025, homologada pelo Sr. Diretor Geral"
    if (/\d{4,6}\/\d{4}.*(realizada|homologada|publicada|expedida|emitida)\s+em/i.test(t)) return;
    if (/(art\.|artigo)\s*\d+\s*(da|do|°)\s*(lei|decreto|resolu[çc][aã]o|portaria|instrução\s+normativa)/i.test(t)) return;

    const chave = normalizarTexto(t).slice(0, 60);
    if (!vistos.has(chave)) {
      vistos.add(chave);
      requisitos.push({ texto: t, origem });
    }
  }

  for (const linha of linhas) {
    const l = linha.trim();
    if (l.length < 15 || l.length > 600) continue;

    // Tenta padrões estruturados primeiro
    let matched = false;
    for (const padrao of PADROES_ESTRUTURA) {
      const m = l.match(padrao);
      if (m) {
        add(m[2] || m[1] || l);
        matched = true;
        break;
      }
    }

    // Linhas com verbos de requisito (mesmo que não comecem com numeração)
    if (!matched && VERBOS_REQ.test(l)) {
      add(l);
    }
  }

  // ── Linhas em CAIXA ALTA (títulos de módulo em contratos) ──
  for (const linha of linhas) {
    const l = linha.trim();
    if (l.length > 10 && l.length < 100 && l === l.toUpperCase() && /[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]{5,}/.test(l)) {
      add(l);
    }
  }

  // ── Palavras-chave de domínio (fallback para documentos mistos) ──
  const DOMINIO = /pesagem|infra[çc][aã]o|radar|equipamento|balan[çc]a|semáforo|monitoramento|fiscalização|cronotacógrafo|aferi[çc][aã]o|relatório|integra[çc][aã]o|funcionalidade|módulo|tela|cadastro|permissão|perfil|usuário|auditoria|exportar|importar|dashboard/i;
  for (const linha of linhas) {
    const l = linha.trim();
    if (l.length >= 15 && l.length <= 200 && DOMINIO.test(l) && !vistos.has(normalizarTexto(l).slice(0, 60))) {
      add(l);
    }
  }

  return requisitos.slice(0, 150);
}

async function extrairViaIA(textoEdital) {
  // Divide o texto em janelas de 8000 chars para cobrir documentos mais longos
  const janelas = [];
  for (let i = 0; i < Math.min(textoEdital.length, 24000); i += 8000) {
    janelas.push(textoEdital.slice(i, i + 8000));
  }

  const todos = [];
  for (const janela of janelas) {
    try {
      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Você é um especialista em editais e termos de referência para contratação pública de software.
Extraia TODOS os requisitos funcionais e técnicos do texto.
Inclua: funcionalidades, módulos, relatórios, integrações, regras de negócio e requisitos técnicos.
Responda APENAS com JSON: { "requisitos": ["requisito 1", "requisito 2", ...] }
Máximo de 60 requisitos por chamada. Cada requisito deve ser uma frase clara (não fragmentos).`,
          },
          {
            role: "user",
            content: `Extraia os requisitos:\n\n${janela}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 2500,
      });

      const texto = resp.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(texto);
      (parsed.requisitos || []).forEach(t => {
        if (typeof t === "string" && t.length > 10) {
          todos.push({ texto: t.trim(), origem: "openai" });
        }
      });
    } catch { /* ignora falhas de janela individual */ }
  }

  return todos;
}

// ─── 3. VERIFICAR COBERTURA (fase 1: keyword scoring) ───────────

/**
 * Scoring por palavras-chave entre um requisito e toda a documentação.
 * Rápido e sem custo de API. Itens com score 0.05–0.40 serão reavaliados
 * semanticamente pela fase 2 (reavaliarIncertosIA).
 */
function verificarCobertura(requisito, docs) {
  const textoNorm = normalizarTexto(requisito.texto);
  const palavras  = textoNorm.split(/\s+/).filter(p => p.length > 4);

  if (palavras.length === 0) {
    return { status: "nao_atendido", score: 0, referenciaDoc: null, topDocs: [], _incerto: false };
  }

  const resultados = docs.map(doc => {
    const docNorm = normalizarTexto(doc.conteudo.substring(0, 3000));
    const hits    = palavras.filter(p => docNorm.includes(p)).length;
    const score   = hits / palavras.length;
    return { arquivo: doc.arquivo, score };
  });

  resultados.sort((a, b) => b.score - a.score);
  const melhor  = resultados[0];
  const topDocs = resultados.slice(0, 3).filter(r => r.score > 0).map(r => r.arquivo);

  // Zona incerta: ativa reavaliação semântica pela IA
  const incerto = melhor.score >= 0.05 && melhor.score < 0.40;

  let status;
  if (melhor.score >= 0.40)      status = "atendido";
  else if (melhor.score >= 0.10) status = "parcial";
  else                            status = "nao_atendido";

  return {
    status,
    score:        melhor.score,
    referenciaDoc: melhor.score > 0.05 ? melhor.arquivo : null,
    topDocs,
    _incerto:     incerto,
  };
}

// ─── 4. REAVALIAÇÃO SEMÂNTICA DOS INCERTOS (fase 2) ──────────────

/**
 * Para os itens com score incerto, usa GPT para avaliar semanticamente
 * se o trecho do documento mais relevante cobre o requisito.
 * Processa em lotes de 8 para minimizar custo/latência.
 */
async function reavaliarIncertosIA(itens, docs) {
  if (!process.env.OPENAI_API_KEY) {
    // Remove a flag antes de retornar
    return itens.map(({ _incerto, ...r }) => r);
  }

  const incertos = itens.filter(i => i._incerto);
  if (incertos.length === 0) {
    return itens.map(({ _incerto, ...r }) => r);
  }

  const resultado = itens.map(i => ({ ...i }));
  const LOTE = 8;

  for (let i = 0; i < incertos.length; i += LOTE) {
    const lote = incertos.slice(i, i + LOTE);

    const contexto = lote.map((item, idx) => {
      const docRef  = item.topDocs?.[0] || item.referenciaDoc;
      const docObj  = docs.find(d => d.arquivo === docRef);
      const trecho  = docObj ? docObj.conteudo.substring(0, 700) : "(sem documentação relacionada)";
      return `${idx + 1}. Requisito: "${item.requisito}"\n   Trecho da documentação: "${trecho}"`;
    }).join("\n\n");

    try {
      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Você é um auditor técnico avaliando se a documentação de um sistema de software cobre requisitos de um edital.
Para cada par (requisito, trecho de documentação), decida:
- "atendido": a documentação explicitamente cobre o requisito
- "parcial": a documentação menciona o tema mas não detalha o requisito
- "nao_atendido": a documentação não cobre este requisito
Responda APENAS com JSON: {"resultados": [{"status": "atendido"|"parcial"|"nao_atendido"}]}
Matenha a mesma quantidade e ordem dos itens recebidos.`,
          },
          {
            role: "user",
            content: contexto,
          },
        ],
        temperature: 0.1,
        max_tokens: 400,
      });

      const parsed  = JSON.parse(resp.choices[0]?.message?.content || "{}");
      const results = parsed.resultados || [];

      lote.forEach((item, idx) => {
        const res = results[idx];
        if (res?.status) {
          const globalIdx = resultado.findIndex(r => r.requisito === item.requisito);
          if (globalIdx !== -1) {
            resultado[globalIdx].status = res.status;
          }
        }
      });
    } catch { /* mantém status keyword */ }
  }

  // Remove a flag temporária
  return resultado.map(({ _incerto, ...r }) => r);
}

// ─── 5. GERAR JUSTIFICATIVAS VIA IA (fase 3, opcional) ───────────

async function gerarJustificativasIA(itens, produto) {
  if (!process.env.OPENAI_API_KEY) return itens;

  // Processa em lotes de 15 para não estourar tokens
  const LOTE = 15;
  const resultado = [...itens];

  for (let i = 0; i < itens.length; i += LOTE) {
    const lote = itens.slice(i, i + LOTE);
    const prompt = lote.map((item, idx) =>
      `${idx + 1}. [${item.status.toUpperCase()}] Requisito: "${item.requisito}". Referência: ${item.referenciaDoc || "nenhuma"}.`
    ).join("\n");

    try {
      const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um consultor técnico da empresa Axion Tecnologia analisando se o sistema ${produto.toUpperCase()} atende requisitos de um edital.
Para cada item, forneça uma justificativa técnica breve (1-2 frases).
Responda APENAS com JSON: { "justificativas": ["justificativa 1", "justificativa 2", ...] }
Mantenha a mesma quantidade e ordem dos itens recebidos.`,
          },
          {
            role: "user",
            content: `Gere justificativas para:\n${prompt}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const texto = resp.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(texto);
      const justificativas = parsed.justificativas || [];

      lote.forEach((item, idx) => {
        const idxGlobal = i + idx;
        if (justificativas[idx]) {
          resultado[idxGlobal].justificativa = justificativas[idx];
        }
      });
    } catch { /* mantém sem justificativa */ }
  }

  return resultado;
}

// ─── 6. FUNÇÃO PRINCIPAL ─────────────────────────────────────────

/**
 * Gera relatório de conformidade com 3 fases de análise:
 *  Fase 1 — extração híbrida (heurística 10 padrões + IA)
 *  Fase 2 — scoring por palavras-chave + reavaliação semântica (GPT) dos incertos
 *  Fase 3 — geração de justificativas técnicas (GPT, opcional)
 */
export async function gerarRelatorioConformidade({ produto, tituloEdital, textoEdital, comJustificativas = true }) {
  // 1. Ler documentação
  const docs = await lerDocumentacao(produto);
  if (docs.length === 0) {
    throw new Error(`Nenhum arquivo .md encontrado para o produto "${produto}".`);
  }

  // 2. Extrair requisitos (heurística + IA, mesclados)
  const requisitosRaw = await extrairRequisitos(textoEdital);
  if (requisitosRaw.length === 0) {
    throw new Error("Nenhum requisito pôde ser extraído do texto fornecido. Verifique o conteúdo do edital.");
  }

  // 3. Fase 1: scoring por palavras-chave para todos os requisitos
  const itensKeyword = requisitosRaw.map((req, idx) => {
    const cobertura = verificarCobertura(req, docs);
    return {
      numero:        idx + 1,
      requisito:     req.texto,
      origem:        req.origem,
      status:        cobertura.status,
      score:         cobertura.score,
      referenciaDoc: cobertura.referenciaDoc,
      topDocs:       cobertura.topDocs,
      justificativa: null,
      _incerto:      cobertura._incerto,
    };
  });

  // 4. Fase 2: reavaliação semântica dos itens incertos via GPT
  const itensFase2 = await reavaliarIncertosIA(itensKeyword, docs);

  // 5. Fase 3: gerar justificativas via IA (opcional)
  const itensFinais = comJustificativas ? await gerarJustificativasIA(itensFase2, produto) : itensFase2;

  // 6. Calcular estatísticas
  const total        = itensFinais.length;
  const atendidos    = itensFinais.filter(i => i.status === "atendido").length;
  const parciais     = itensFinais.filter(i => i.status === "parcial").length;
  const naoAtendidos = itensFinais.filter(i => i.status === "nao_atendido").length;
  const percentual   = total > 0 ? Math.round((atendidos + parciais * 0.5) / total * 100) : 0;

  // 7. Veredicto geral
  let veredicto;
  if (percentual >= 80)      veredicto = "APTO";
  else if (percentual >= 50) veredicto = "PARCIALMENTE_APTO";
  else                        veredicto = "INAPTO";

  // 8. Persistir
  const relatorio = await Conformidade.create({
    produto,
    tituloEdital: tituloEdital || "Edital sem título",
    totalRequisitos: total,
    atendidos,
    parciais,
    naoAtendidos,
    percentualConformidade: percentual,
    veredicto,
    itens: itensFinais,
    totalDocumentosAnalisados: docs.length,
  });

  return { relatorio, stats: { total, atendidos, parciais, naoAtendidos, percentual, veredicto } };
}

// ─── 6. LISTAR / OBTER ───────────────────────────────────────────

export async function listarRelatorios(produto) {
  const filtro = produto ? { produto } : {};
  return Conformidade.find(filtro)
    .select("-itens")
    .sort({ createdAt: -1 });
}

export async function obterRelatorio(id) {
  return Conformidade.findById(id);
}

export async function removerRelatorio(id) {
  return Conformidade.findByIdAndDelete(id);
}
