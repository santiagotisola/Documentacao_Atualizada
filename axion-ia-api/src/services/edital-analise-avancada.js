/**
 * edital-analise-avancada.js
 * Análise avançada de editais com:
 * - Decomposição categórica (hardware, software, infra, processos, funções, docs)
 * - De-Para: edital vs projetos + gaps
 * - Análise de concorrentes vs edital
 * - Detecção de conflito de interesses (região, contratos)
 * - Prompt de adequação para atender 100%
 * - Validação de mercado e dores do cliente
 */

import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── OPENAI COM RETRY + CHAVE SECUNDÁRIA ────────────────────────

const apiKeys = [process.env.OPENAI_API_KEY, process.env.OPENAI_API_KEY_FALLBACK].filter(Boolean);
let currentKeyIndex = 0;
let openai = new OpenAI({ apiKey: apiKeys[0] });

/**
 * Wrapper de chamada OpenAI com retry automático e rotação de chave
 * - Tenta a chave atual até 2x com backoff
 * - Se 429/401, tenta a chave secundária (OPENAI_API_KEY_FALLBACK)
 * - Retorna null se todas falharem
 */
async function chamarOpenAI(opts, label = "OpenAI") {
  const MAX_RETRIES = 2;
  const BACKOFF_MS = 2000;

  for (let keyIdx = 0; keyIdx < apiKeys.length; keyIdx++) {
    const ki = (currentKeyIndex + keyIdx) % apiKeys.length;
    const client = new OpenAI({ apiKey: apiKeys[ki] });

    for (let tentativa = 0; tentativa <= MAX_RETRIES; tentativa++) {
      try {
        const response = await client.chat.completions.create(opts);
        // Sucesso — garantir que esta chave fica como principal
        if (ki !== currentKeyIndex) {
          currentKeyIndex = ki;
          openai = client;
          console.log(`[${label}] Rotacionou para chave #${ki + 1}`);
        }
        return response;
      } catch (err) {
        const status = err?.status || err?.response?.status;
        const isQuota = status === 429 || (err.message && err.message.includes("quota"));
        const isAuth = status === 401 || status === 403;

        if (isQuota && tentativa < MAX_RETRIES) {
          const wait = BACKOFF_MS * (tentativa + 1);
          console.warn(`[${label}] 429 quota — retry ${tentativa + 1}/${MAX_RETRIES} em ${wait}ms...`);
          await new Promise(r => setTimeout(r, wait));
          continue;
        }

        if ((isQuota || isAuth) && keyIdx < apiKeys.length - 1) {
          console.warn(`[${label}] Chave #${ki + 1} falhou (${status}) — tentando próxima chave...`);
          break; // sai do loop de retry, vai para próxima chave
        }

        // Erro não recuperável
        console.error(`[${label}] Falha definitiva:`, err.message);
        return null;
      }
    }
  }

  return null;
}

// ─── CATEGORIAS DE ANÁLISE ──────────────────────────────────────

const CATEGORIAS = {
  hardware: {
    label: "Hardware",
    icon: "🖥️",
    keywords: ["equipamento", "câmera", "sensor", "radar", "laço indutivo", "balança", "semáforo", "OCR", "display", "nobreak", "rack", "switch", "roteador", "servidor físico", "detector", "módulo", "placa", "controlador", "terminal", "leitor", "antena", "CLP", "fibra", "cabo", "totem"],
  },
  software: {
    label: "Software",
    icon: "💻",
    keywords: ["sistema", "software", "plataforma", "aplicação", "app", "portal", "interface", "módulo", "funcionalidade", "tela", "relatório", "dashboard", "API", "integração", "banco de dados", "backup", "redundância", "cloud", "SaaS", "webservice", "microserviço"],
  },
  infraestrutura: {
    label: "Infraestrutura",
    icon: "🏗️",
    keywords: ["rede", "comunicação", "data center", "link", "conectividade", "VPN", "firewall", "hosting", "nuvem", "disponibilidade", "uptime", "SLA", "disaster recovery", "failover", "load balancer", "DNS", "certificado SSL", "banda", "latência"],
  },
  processos: {
    label: "Processos",
    icon: "⚙️",
    keywords: ["processo", "procedimento", "workflow", "fluxo", "operação", "rotina", "manutenção", "instalação", "calibração", "aferição", "vistoria", "homologação", "auditoria", "fiscalização", "monitoramento", "operação assistida", "plantão", "suporte", "atendimento", "chamado"],
  },
  funcoes: {
    label: "Funções/Equipe",
    icon: "👥",
    keywords: ["técnico", "engenheiro", "analista", "operador", "supervisor", "coordenador", "gerente", "equipe", "profissional", "capacitação", "treinamento", "certificação", "CREA", "ART", "responsável técnico", "plantão", "escala", "jornada"],
  },
  documentos: {
    label: "Documentos",
    icon: "📋",
    keywords: ["documento", "certidão", "atestado", "declaração", "contrato", "proposta", "planilha", "cronograma", "projeto", "manual", "norma", "resolução", "portaria", "CONTRAN", "DENATRAN", "INMETRO", "NBR", "ISO", "ABNT", "edital", "termo de referência", "memorial descritivo"],
  },
  normas: {
    label: "Normas/Regulamentações",
    icon: "📜",
    keywords: ["resolução", "portaria", "lei", "decreto", "CTB", "CONTRAN", "DENATRAN", "INMETRO", "ABNT", "NBR", "ISO", "norma", "regulamento", "legislação", "homologação", "certificação", "conformidade", "tipo aprovado"],
  },
  comercial: {
    label: "Comercial/Financeiro",
    icon: "💰",
    keywords: ["preço", "valor", "custo", "pagamento", "medição", "faturamento", "reajuste", "garantia", "seguro", "caução", "multa", "penalidade", "dotação", "orçamento", "planilha de custos", "BDI", "desconto", "lance"],
  },
};

// ─── CONCORRENTES CONHECIDOS ────────────────────────────────────

const CONCORRENTES = [
  { nome: "Perkons (Envision)", regiao: "PR/Curitiba", segmento: "Fiscalização eletrônica, radares", forca: "Líderes em radares fixos, grande base instalada", fraqueza: "Software legado, pouca inovação em IA", site: "perkons.com.br" },
  { nome: "Kapsch TrafficCom", regiao: "Internacional/SP", segmento: "ITS, free-flow, pedágio", forca: "Tecnologia global, V2X, IoT", fraqueza: "Custo alto, pouca capilaridade local", site: "kapsch.net" },
  { nome: "Conduent (Xerox)", regiao: "SP/RJ", segmento: "Processamento de infrações", forca: "Escala, processamento massivo", fraqueza: "Atendimento burocrático, custo", site: "conduent.com" },
  { nome: "Velsis (Grupo Dataprom)", regiao: "PR/Nacional", segmento: "Radares, lombadas, controladores", forca: "Hardware próprio, INMETRO", fraqueza: "Software genérico, pouca IA", site: "velsis.com.br" },
  { nome: "Pumatronix", regiao: "PR/Curitiba", segmento: "Câmeras OCR, LPR", forca: "Hardware de captura líder", fraqueza: "Não tem plataforma completa", site: "pumatronix.com.br" },
  { nome: "Getrak", regiao: "MG/Nacional", segmento: "Rastreamento, monitoramento", forca: "Plataforma de monitoramento veicular", fraqueza: "Foco em rastreamento, não fiscalização", site: "getrak.com.br" },
  { nome: "Sweda/Tacom", regiao: "SP/Nacional", segmento: "Pesagem veicular", forca: "Balanças dinâmicas, INMETRO", fraqueza: "Só pesagem, sem integração", site: "sweda.com.br" },
  { nome: "Brascontec", regiao: "GO/Centro-Oeste", segmento: "Fiscalização, videomonitoramento", forca: "Presença regional, atendimento local", fraqueza: "Tecnologia limitada", site: "brascontec.com.br" },
  { nome: "Autotrack/GTech", regiao: "SP/Nacional", segmento: "Rastreamento + OCR", forca: "Base instalada grande", fraqueza: "Plataforma legada", site: "autotrack.com.br" },
  { nome: "Iteris (Sensys)", regiao: "Internacional/SP", segmento: "ITS, detecção, analytics", forca: "Analytics de tráfego, CV", fraqueza: "Custo internacional, suporte", site: "iteris.com" },
];

// ─── FUNÇÃO PRINCIPAL: ANÁLISE COMPLETA ─────────────────────────

/**
 * Realiza análise completa de um edital com todas as dimensões
 */
export async function analisarEditalCompleto(textoEdital, opcoes = {}) {
  const {
    titulo = "Edital Informado",
    orgao = "Não identificado",
    regiao = "Não informada",
    siteId = null,
    siteConfig = null,
    incluirConcorrentes = true,
    incluirMercado = true,
    incluirPromptAdequacao = true,
  } = opcoes;

  const produtoAlvo = siteConfig?.produto || null; // "axhub", "axcross", "axton"
  console.log(`[Análise Avançada] Iniciando análise completa: "${titulo}"${produtoAlvo ? ` (produto: ${siteConfig.produtoLabel}, site: ${siteConfig.nome})` : ""}`);

  // 1. Decomposição categórica
  const categorias = await decomporEditalPorCategoria(textoEdital);

  // 2. De-Para (edital vs projetos) — com produto alvo se selecionado
  const dePara = await gerarDeParaProjetos(textoEdital, categorias, produtoAlvo);

  // 3. Análise de concorrentes
  let concorrentes = null;
  if (incluirConcorrentes) {
    concorrentes = await analisarConcorrentes(textoEdital, categorias, regiao);
  }

  // 4. Validação de mercado
  let mercado = null;
  if (incluirMercado) {
    mercado = await validarMercadoSaaS(textoEdital, categorias);
  }

  // 5. Prompt de adequação
  let promptAdequacao = null;
  if (incluirPromptAdequacao) {
    promptAdequacao = await gerarPromptAdequacao(dePara);
  }

  return {
    titulo,
    orgao,
    regiao,
    dataAnalise: new Date().toISOString(),
    categorias,
    dePara,
    concorrentes,
    mercado,
    promptAdequacao,
    resumoExecutivo: gerarResumoExecutivo(categorias, dePara, concorrentes, mercado),
  };
}

// ─── 1. DECOMPOSIÇÃO CATEGÓRICA ────────────────────────────────

async function decomporEditalPorCategoria(textoEdital) {
  const resultado = {};

  for (const [key, cat] of Object.entries(CATEGORIAS)) {
    const itensEncontrados = extrairItensPorCategoria(textoEdital, cat.keywords);
    resultado[key] = {
      ...cat,
      total: itensEncontrados.length,
      itens: itensEncontrados,
    };
  }

  // Complementar com IA para itens ambíguos
  const complementoIA = await classificarComIA(textoEdital);
  if (complementoIA) {
    for (const [key, itens] of Object.entries(complementoIA)) {
      if (resultado[key]) {
        const existentes = new Set(resultado[key].itens.map(i => i.texto.slice(0, 40)));
        const novos = itens.filter(i => !existentes.has(i.texto.slice(0, 40)));
        resultado[key].itens.push(...novos);
        resultado[key].total = resultado[key].itens.length;
      }
    }
  }

  return resultado;
}

function extrairItensPorCategoria(texto, keywords) {
  const itens = [];
  const linhas = texto.split("\n");

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha || linha.length < 10) continue;

    const lower = linha.toLowerCase();
    const matchedKw = keywords.find(kw => lower.includes(kw.toLowerCase()));

    if (matchedKw) {
      // Evitar duplicatas
      const jaExiste = itens.some(it => it.texto.slice(0, 50) === linha.slice(0, 50));
      if (!jaExiste) {
        itens.push({
          texto: linha.slice(0, 300),
          linha: i + 1,
          keyword: matchedKw,
          contexto: linhas.slice(Math.max(0, i - 1), i + 2).join(" ").slice(0, 200),
        });
      }
    }
  }

  return itens;
}

async function classificarComIA(textoEdital) {
  try {
    const prompt = `Analise o texto de edital de licitação abaixo e classifique os requisitos nas categorias:
- hardware: equipamentos físicos, sensores, câmeras, controladores
- software: sistemas, plataformas, funcionalidades, APIs
- infraestrutura: rede, comunicação, cloud, disponibilidade
- processos: workflows, procedimentos, manutenções, operações
- funcoes: equipe necessária, qualificações, certificações
- documentos: documentação exigida, certidões, atestados
- normas: regulamentações, resoluções, leis aplicáveis
- comercial: valores, pagamentos, garantias, prazos

Para cada item, retorne em JSON:
{"categoria": [{"texto": "requisito", "criticidade": "alta|media|baixa"}]}

Texto do edital (primeiros 6000 chars):
${textoEdital.slice(0, 6000)}

Responda APENAS com JSON válido.`;

    const response = await chamarOpenAI({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 3000,
    }, "Classificação");

    if (!response) return classificarLocal(textoEdital);
    const json = JSON.parse(response.choices[0].message.content);
    return json;
  } catch (err) {
    console.warn("[Análise Avançada] IA classificação falhou:", err.message, "— usando classificação local");
    return classificarLocal(textoEdital);
  }
}

/**
 * Classificação local (fallback sem IA)
 * Usa regex e heurísticas para classificar itens com criticidade estimada
 */
function classificarLocal(textoEdital) {
  const CRITICIDADE_KEYWORDS = {
    alta: ["obrigatório", "obrigatoriamente", "deverá", "imprescindível", "eliminatório", "desclassific", "indispensável", "essencial", "sob pena"],
    media: ["recomend", "preferencialmente", "desejável", "conveniente", "quando possível", "importante"],
    baixa: ["poderá", "facultat", "sugestão", "opcional", "complementar"],
  };

  const resultado = {};
  const linhas = textoEdital.split("\n");

  for (const [key, cat] of Object.entries(CATEGORIAS)) {
    const itens = [];
    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i].trim();
      if (!linha || linha.length < 15) continue;
      const lower = linha.toLowerCase();

      const kw = cat.keywords.find(k => lower.includes(k.toLowerCase()));
      if (!kw) continue;

      const jaExiste = itens.some(it => it.texto.slice(0, 50) === linha.slice(0, 50));
      if (jaExiste) continue;

      let criticidade = "media";
      for (const [nivel, palavras] of Object.entries(CRITICIDADE_KEYWORDS)) {
        if (palavras.some(p => lower.includes(p))) { criticidade = nivel; break; }
      }

      itens.push({ texto: linha.slice(0, 300), criticidade });
    }
    if (itens.length > 0) resultado[key] = itens;
  }

  return resultado;
}

// ─── 2. DE-PARA (EDITAL vs PROJETOS) ───────────────────────────

async function gerarDeParaProjetos(textoEdital, categorias, produtoAlvo = null) {
  // Ler documentação dos 3 produtos
  const docsAxHub = await lerDocsRapido("axhub");
  const docsAxTon = await lerDocsRapido("axton");
  const docsAxCross = await lerDocsRapido("axcross");

  const todosRequisitos = [];
  for (const [catKey, catData] of Object.entries(categorias)) {
    for (const item of catData.itens) {
      todosRequisitos.push({ ...item, categoria: catKey });
    }
  }

  const focoProduto = produtoAlvo
    ? `\n\nFOCO DA ANÁLISE: Priorize a validação para o produto ${produtoAlvo === "axhub" ? "AxHub" : produtoAlvo === "axton" ? "AxTon" : "AxCross"}. Analise especificamente o que este produto atende e onde há gaps.`
    : "";

  // Usar IA para fazer o mapeamento De-Para
  const prompt = `Você é um analista técnico de licitações de fiscalização eletrônica veicular.

CONTEXTO: Tenho 3 produtos:
- AxHub: Sistema de gestão de infrações, passagens, monitoramento de equipamentos, relatórios de fluxo
- AxTon: Sistema de pesagem veicular (balanças dinâmicas e estáticas)
- AxCross: Sistema de cruzamento de placas e monitoramento veicular em tempo real${focoProduto}

DOCUMENTAÇÃO RESUMIDA:
AxHub: ${docsAxHub.slice(0, 2000)}
AxTon: ${docsAxTon.slice(0, 1500)}
AxCross: ${docsAxCross.slice(0, 1500)}

REQUISITOS DO EDITAL (${todosRequisitos.length} itens):
${todosRequisitos.slice(0, 60).map((r, i) => `${i + 1}. [${r.categoria}] ${r.texto}`).join("\n")}

Gere o DE-PARA em JSON com a seguinte estrutura:
{
  "itens": [
    {
      "requisito": "texto do requisito",
      "categoria": "categoria",
      "statusAxHub": "atende|parcial|nao_atende|n/a",
      "statusAxTon": "atende|parcial|nao_atende|n/a",
      "statusAxCross": "atende|parcial|nao_atende|n/a",
      "ondeAtende": "descrição de onde/como o produto atende",
      "lacuna": "o que falta implementar (se não atende)",
      "esforco": "baixo|medio|alto",
      "prioridade": "critica|alta|media|baixa"
    }
  ],
  "resumo": {
    "totalRequisitos": N,
    "atendeCompleto": N,
    "atendeParcial": N,
    "naoAtende": N,
    "percentualCobertura": N
  }
}

Responda APENAS com JSON válido.`;

  try {
    const response = await chamarOpenAI({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.15,
      max_tokens: 4000,
    }, "De-Para");

    if (!response) return gerarDeParaLocal(todosRequisitos, produtoAlvo);
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("[De-Para] IA falhou:", err.message, "— usando mapeamento local");
    return gerarDeParaLocal(todosRequisitos, produtoAlvo);
  }
}

/**
 * De-Para local (fallback sem IA)
 * Mapeia requisitos aos produtos por heurísticas de keywords
 */
function gerarDeParaLocal(requisitos, produtoAlvo = null) {
  const KW_AXHUB = ["infração", "autuação", "multa", "penalidade", "talonário", "equipamento de fiscalização", "radar", "lombada", "semáforo", "barreira", "fotossensor", "velocidade", "passagem", "fluxo", "veicular", "avanço de sinal", "parada sobre faixa", "faixa exclusiva", "detran", "sne", "equipamento", "câmera", "sensor", "OCR", "display", "nobreak", "sistema", "software", "plataforma", "dashboard", "relatório", "SLA", "manutenção", "calibração", "suporte", "operação", "monitoramento"];
  const KW_AXTON = ["pesagem", "balança", "peso", "tonelada", "eixo", "pbt", "cmt", "sobrepeso", "veículo de carga", "caminhão", "pesagem dinâmica", "pesagem estática", "reclassificação", "pórtico", "pit stop"];
  const KW_AXCROSS = ["cruzamento", "monitoramento", "placa", "alerta", "roubo", "furto", "localização", "rastreamento", "veículo monitorado", "cerco eletrônico", "lpr", "anpr", "reconhecimento", "tempo real", "vigilância"];

  const classificar = (texto) => {
    const lower = texto.toLowerCase();
    const hub = KW_AXHUB.some(k => lower.includes(k));
    const ton = KW_AXTON.some(k => lower.includes(k));
    const cross = KW_AXCROSS.some(k => lower.includes(k));

    // Se há produto alvo, priorizar classificação para ele
    if (produtoAlvo === "axhub") {
      return { axhub: hub ? "parcial" : "n/a", axton: "n/a", axcross: "n/a" };
    } else if (produtoAlvo === "axton") {
      return { axhub: "n/a", axton: ton ? "parcial" : "n/a", axcross: "n/a" };
    } else if (produtoAlvo === "axcross") {
      return { axhub: "n/a", axton: "n/a", axcross: cross ? "parcial" : "n/a" };
    }

    return {
      axhub: hub ? "parcial" : "n/a",
      axton: ton ? "parcial" : "n/a",
      axcross: cross ? "parcial" : "n/a",
    };
  };

  const produtoLabel = produtoAlvo === "axhub" ? "AxHub" : produtoAlvo === "axton" ? "AxTon" : produtoAlvo === "axcross" ? "AxCross" : null;
  let atende = 0, parcial = 0, naoAtende = 0;
  const itens = requisitos.slice(0, 80).map(r => {
    const st = classificar(r.texto);
    const algumAtende = [st.axhub, st.axton, st.axcross].some(s => s !== "n/a");
    if (algumAtende) parcial++; else naoAtende++;
    return {
      requisito: r.texto.slice(0, 200),
      categoria: r.categoria,
      statusAxHub: st.axhub,
      statusAxTon: st.axton,
      statusAxCross: st.axcross,
      ondeAtende: algumAtende ? `Identificado por heurística${produtoLabel ? ` (foco: ${produtoLabel})` : ""} — revisar manualmente` : "",
      lacuna: algumAtende ? "" : `Não identificado automaticamente${produtoLabel ? ` no ${produtoLabel}` : " nos produtos"}`,
      esforco: "medio",
      prioridade: "media",
    };
  });

  return {
    itens,
    resumo: {
      totalRequisitos: requisitos.length,
      atendeCompleto: atende,
      atendeParcial: parcial,
      naoAtende: naoAtende,
      percentualCobertura: requisitos.length > 0 ? Math.round((parcial / requisitos.length) * 100) : 0,
    },
    _fallback: true,
    _nota: "Análise gerada por heurísticas locais (IA indisponível). Revise manualmente.",
  };
}

async function lerDocsRapido(produto) {
  const dir = path.resolve(__dirname, `../../../${produto === "axhub" ? "AxHub" : produto === "axton" ? "AxTon" : "AxCross"}/docs-portal/docs`);
  try {
    const files = await fs.readdir(dir);
    const mds = files.filter(f => f.endsWith(".md")).slice(0, 5);
    let conteudo = "";
    for (const f of mds) {
      const txt = await fs.readFile(path.join(dir, f), "utf8");
      conteudo += txt.slice(0, 500) + "\n";
    }
    return conteudo;
  } catch {
    return "Documentação não disponível";
  }
}

// ─── 3. ANÁLISE DE CONCORRENTES ─────────────────────────────────

async function analisarConcorrentes(textoEdital, categorias, regiaoEdital) {
  const prompt = `Você é um analista de mercado de fiscalização eletrônica e ITS no Brasil.

EDITAL (resumo dos requisitos por categoria):
${Object.entries(categorias).map(([k, v]) => `- ${v.label}: ${v.total} requisitos`).join("\n")}

Requisitos principais do edital:
${Object.values(categorias).flatMap(c => c.itens.slice(0, 3)).map(i => `• ${i.texto.slice(0, 100)}`).join("\n")}

REGIÃO DO EDITAL: ${regiaoEdital}

CONCORRENTES NO MERCADO:
${CONCORRENTES.map(c => `- ${c.nome} (${c.regiao}): ${c.segmento}. Força: ${c.forca}. Fraqueza: ${c.fraqueza}`).join("\n")}

Analise e retorne em JSON:
{
  "ranking": [
    {
      "empresa": "nome",
      "percentualAtendimento": 0-100,
      "pontosFortes": ["..."],
      "pontosFracos": ["..."],
      "conflitoPotencial": true/false,
      "motivoConflito": "mesma região, contrato vigente, etc",
      "distanciaRegional": "local|estadual|nacional|internacional"
    }
  ],
  "alertasConflito": [
    {
      "empresa": "nome",
      "tipo": "mesma_regiao|contrato_vigente|desenvolveu_edital|relacao_orgao",
      "descricao": "explicação",
      "risco": "alto|medio|baixo"
    }
  ],
  "quemAtende100": {
    "empresa": "nome ou nenhum",
    "justificativa": "por que atende 100%",
    "suspeitaDirecionamento": true/false,
    "evidencias": ["..."]
  },
  "posicaoAxion": {
    "percentualAtendimento": 0-100,
    "vantagensCompetitivas": ["..."],
    "gapsVsConcorrentes": ["..."]
  }
}

Responda APENAS com JSON válido.`;

  try {
    const response = await chamarOpenAI({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 3000,
    }, "Concorrentes");

    if (!response) return gerarConcorrentesLocal(categorias, regiaoEdital);
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("[Concorrentes] IA falhou:", err.message, "— usando análise local");
    return gerarConcorrentesLocal(categorias, regiaoEdital);
  }
}

/**
 * Análise de concorrentes local (fallback sem IA)
 */
function gerarConcorrentesLocal(categorias, regiaoEdital) {
  const regLower = (regiaoEdital || "").toLowerCase();
  const ranking = CONCORRENTES.map(c => {
    const mesmaRegiao = regLower && c.regiao.toLowerCase().split("/").some(r => regLower.includes(r.trim()));
    return {
      empresa: c.nome,
      percentualAtendimento: null,
      pontosFortes: [c.forca],
      pontosFracos: [c.fraqueza],
      conflitoPotencial: mesmaRegiao,
      motivoConflito: mesmaRegiao ? `Opera na mesma região (${c.regiao})` : "",
      distanciaRegional: mesmaRegiao ? "local" : "nacional",
    };
  });

  return {
    ranking,
    alertasConflito: ranking.filter(r => r.conflitoPotencial).map(r => ({
      empresa: r.empresa,
      tipo: "mesma_regiao",
      descricao: r.motivoConflito,
      risco: "medio",
    })),
    quemAtende100: { empresa: "Não determinado (IA indisponível)", justificativa: "Análise por heurísticas", suspeitaDirecionamento: false, evidencias: [] },
    posicaoAxion: { percentualAtendimento: null, vantagensCompetitivas: ["SaaS unificado", "IA integrada", "Análise de editais automatizada"], gapsVsConcorrentes: ["Requer análise com IA para detalhamento"] },
    _fallback: true,
    _nota: "Análise gerada por heurísticas locais (IA indisponível). Revise manualmente.",
  };
}

// ─── 4. VALIDAÇÃO DE MERCADO SaaS ───────────────────────────────

async function validarMercadoSaaS(textoEdital, categorias) {
  const prompt = `Você é um consultor de mercado especializado em SaaS para gestão de trânsito, fiscalização eletrônica e cidades inteligentes no Brasil.

MEU PRODUTO (Axion Tecnologia SaaS):
- Analisador inteligente de editais com IA (extrai requisitos, compara conformidade, identifica gaps)
- Gestão de conformidade multi-produto (AxHub + AxTon + AxCross)
- Chat IA com Knowledge Base e embeddings vetoriais
- Análise de imagens com GPT-4o Vision (OCR, classificação)
- Helpdesk com auto-classificação e auto-resposta
- Pipeline: Edital → Conformidade → Roadmap → Specs
- Intelligence Hub unificado
- WhatsApp integrado
- Relatórios de fluxo e SLA

PERGUNTAS:
1. Existe no mercado brasileiro outro SaaS que entregue essa combinação de funcionalidades (analisador de editais + gestão de conformidade + IA + chat + helpdesk + análise de imagens) para o segmento de fiscalização eletrônica?
2. Quais são as maiores DOREs dos clientes (prefeituras, DETRANs, concessionárias) ao adquirir ou operar sistemas similares?
3. Quais são as melhores práticas e tendências do mercado para esse tipo de sistema em 2025-2026?
4. O que preciso para ficar 100% operacional e atender qualquer demanda dessa natureza?
5. O raciocínio lógico do meu SaaS (edital → análise → conformidade → roadmap → specs) é consistente e validado pelo mercado?

Responda em JSON:
{
  "concorrenteDireto": {
    "existe": true/false,
    "empresas": ["..."],
    "comparacao": "análise comparativa"
  },
  "doresCliente": [
    {"dor": "descrição", "impacto": "alto|medio|baixo", "nossoSaaS_resolve": true/false, "como": "explicação"}
  ],
  "tendenciasMercado": [
    {"tendencia": "descrição", "maturidade": "emergente|crescendo|consolidada", "nossoSaaS_tem": true/false, "recomendacao": "..."}
  ],
  "paraFicar100": [
    {"funcionalidade": "o que falta", "prioridade": "critica|alta|media", "esforco": "dias estimados", "impactoMercado": "explicação"}
  ],
  "validacaoLogica": {
    "pipelineValido": true/false,
    "pontosFortesLogica": ["..."],
    "melhorias": ["..."],
    "benchmarkMercado": "como se compara com práticas do mercado"
  }
}

Responda APENAS com JSON válido.`;

  try {
    const response = await chamarOpenAI({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000,
    }, "Mercado");

    if (!response) return gerarMercadoLocal(categorias);
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("[Mercado] Erro:", err.message, "— usando análise local");
    return gerarMercadoLocal(categorias);
  }
}

// ─── 5. PROMPT DE ADEQUAÇÃO ─────────────────────────────────────

async function gerarPromptAdequacao(dePara) {
  const naoAtende = (dePara.itens || []).filter(i =>
    i.statusAxHub === "nao_atende" || i.statusAxTon === "nao_atende" || i.statusAxCross === "nao_atende"
  );

  const parciais = (dePara.itens || []).filter(i =>
    i.statusAxHub === "parcial" || i.statusAxTon === "parcial" || i.statusAxCross === "parcial"
  );

  const prompt = `Com base nos gaps identificados na análise De-Para, gere um PROMPT DE CORREÇÃO/ADEQUAÇÃO estruturado que pode ser usado para orientar o desenvolvimento de funcionalidades faltantes.

GAPS CRÍTICOS (não atende):
${naoAtende.slice(0, 15).map(i => `- [${i.categoria}] ${i.requisito}: ${i.lacuna}`).join("\n")}

GAPS PARCIAIS (atende parcialmente):
${parciais.slice(0, 15).map(i => `- [${i.categoria}] ${i.requisito}: ${i.lacuna}`).join("\n")}

Gere um JSON com:
{
  "promptCorrecao": "texto completo do prompt de adequação formatado em markdown",
  "acoesPrioritarias": [
    {"acao": "o que fazer", "produto": "axhub|axton|axcross|todos", "prazo": "imediato|curto|medio", "complexidade": "baixa|media|alta"}
  ],
  "estimativaEsforco": {
    "totalHoras": N,
    "porPrioridade": {"critica": N, "alta": N, "media": N, "baixa": N}
  }
}

Responda APENAS com JSON válido.`;

  try {
    const response = await chamarOpenAI({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 3000,
    }, "Adequação");

    if (!response) return gerarAdequacaoLocal(naoAtende, parciais);
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("[Prompt Adequação] Erro:", err.message, "— usando análise local");
    return gerarAdequacaoLocal(naoAtende, parciais);
  }
}

// ─── RESUMO EXECUTIVO ───────────────────────────────────────────

/**
 * Validação de mercado local (fallback sem IA)
 */
function gerarMercadoLocal(categorias) {
  const totalReqs = Object.values(categorias).reduce((s, c) => s + c.total, 0);
  return {
    concorrenteDireto: {
      existe: false,
      empresas: [],
      comparacao: "Não existe no mercado brasileiro um SaaS que combine análise de editais + IA + gestão de conformidade + helpdesk para o segmento de fiscalização eletrônica (análise local — sem validação IA).",
    },
    doresCliente: [
      { dor: "Análise manual de editais demanda dias de trabalho especializado", impacto: "alto", nossoSaaS_resolve: true, como: "Extração automática e decomposição categórica em minutos" },
      { dor: "Falta de rastreabilidade entre requisitos do edital e funcionalidades existentes", impacto: "alto", nossoSaaS_resolve: true, como: "De-Para automático edital vs produtos (AxHub/AxTon/AxCross)" },
      { dor: "Dificuldade em identificar gaps técnicos antes de montar a proposta", impacto: "alto", nossoSaaS_resolve: true, como: "Pipeline: análise → gaps → roadmap → adequação" },
      { dor: "Suporte técnico reativo e lento", impacto: "medio", nossoSaaS_resolve: true, como: "Helpdesk com IA, auto-classificação e resposta automatizada" },
      { dor: "Sem visibilidade da posição competitiva", impacto: "medio", nossoSaaS_resolve: true, como: "Análise automática de concorrentes por edital" },
    ],
    tendenciasMercado: [
      { tendencia: "IA generativa aplicada a licitações públicas", maturidade: "emergente", nossoSaaS_tem: true, recomendacao: "Manter investimento em GPT-4o e embeddings" },
      { tendencia: "SaaS multi-tenant para gestão de trânsito", maturidade: "crescendo", nossoSaaS_tem: true, recomendacao: "Ampliar cobertura de funcionalidades" },
      { tendencia: "Integração com portais de compras públicas (ComprasNet, PNCP)", maturidade: "consolidada", nossoSaaS_tem: true, recomendacao: "Coleta PNCP já implementada" },
    ],
    paraFicar100: [
      { funcionalidade: "Integração direta com ComprasNet/PNCP para download automático de editais", prioridade: "alta", esforco: "5-10 dias", impactoMercado: "Agiliza captação de oportunidades" },
      { funcionalidade: "Geração automática de proposta técnica", prioridade: "alta", esforco: "15-20 dias", impactoMercado: "Reduz ciclo de resposta a editais" },
      { funcionalidade: "Dashboard de pipeline comercial (editais em andamento)", prioridade: "media", esforco: "5-8 dias", impactoMercado: "Visibilidade gerencial" },
    ],
    validacaoLogica: {
      pipelineValido: true,
      pontosFortesLogica: ["Fluxo Edital→Análise→Conformidade→Roadmap é consistente", "Decomposição categórica cobre 8 dimensões relevantes", "De-Para multi-produto identifica gaps específicos"],
      melhorias: ["Adicionar scoring automático de viabilidade", "Incluir estimativa de custo/prazo por gap"],
      benchmarkMercado: "Nenhum concorrente identificado oferece pipeline automatizado equivalente (análise local)",
    },
    _fallback: true,
    _nota: `Análise gerada por heurísticas locais (IA indisponível). ${totalReqs} requisitos identificados no edital.`,
  };
}

/**
 * Prompt de adequação local (fallback sem IA)
 */
function gerarAdequacaoLocal(naoAtende, parciais) {
  const gaps = [...naoAtende.slice(0, 10), ...parciais.slice(0, 10)];

  const acoes = gaps.map((item, i) => {
    const cat = item.categoria || "geral";
    let produto = "todos";
    if (cat === "hardware" || cat === "normas") produto = "axhub";
    else if (cat === "comercial" || cat === "documentos") produto = "todos";

    return {
      acao: item.lacuna || `Implementar/adequar: ${item.requisito?.slice(0, 100)}`,
      produto,
      prazo: i < 3 ? "imediato" : i < 7 ? "curto" : "medio",
      complexidade: item.esforco === "alto" ? "alta" : item.esforco === "baixo" ? "baixa" : "media",
    };
  });

  const promptMd = `# Prompt de Adequação — Gerado Automaticamente\n\n## Gaps Críticos (${naoAtende.length} itens)\n${naoAtende.slice(0, 10).map(i => `- **[${i.categoria}]** ${i.requisito?.slice(0, 150)}\n  - Lacuna: ${i.lacuna || "Não identificada"}`).join("\n")}\n\n## Gaps Parciais (${parciais.length} itens)\n${parciais.slice(0, 10).map(i => `- **[${i.categoria}]** ${i.requisito?.slice(0, 150)}\n  - Lacuna: ${i.lacuna || "Precisa complementar"}`).join("\n")}\n\n## Ações Recomendadas\n${acoes.map((a, i) => `${i + 1}. [${a.prazo}/${a.produto}] ${a.acao}`).join("\n")}\n\n> ⚠️ Análise gerada por heurísticas locais (IA indisponível). Revise manualmente.`;

  return {
    promptCorrecao: promptMd,
    acoesPrioritarias: acoes,
    estimativaEsforco: {
      totalHoras: gaps.length * 8,
      porPrioridade: {
        critica: acoes.filter(a => a.prazo === "imediato").length * 12,
        alta: acoes.filter(a => a.prazo === "curto").length * 8,
        media: acoes.filter(a => a.prazo === "medio").length * 6,
        baixa: 0,
      },
    },
    _fallback: true,
    _nota: "Prompt gerado por heurísticas locais. Revise manualmente.",
  };
}

function gerarResumoExecutivo(categorias, dePara, concorrentes, mercado) {
  const totalReqs = Object.values(categorias).reduce((s, c) => s + c.total, 0);
  const cobertura = dePara?.resumo?.percentualCobertura || 0;

  return {
    totalRequisitosIdentificados: totalReqs,
    distribuicaoCategoria: Object.entries(categorias).map(([k, v]) => ({
      categoria: v.label,
      icon: v.icon,
      total: v.total,
      percentual: totalReqs > 0 ? ((v.total / totalReqs) * 100).toFixed(1) : 0,
    })),
    coberturaGeral: cobertura,
    posicaoMercado: concorrentes?.posicaoAxion?.percentualAtendimento || null,
    temConcorrenteDireto: mercado?.concorrenteDireto?.existe || false,
    alertasConflito: concorrentes?.alertasConflito?.length || 0,
    pipelineValidado: mercado?.validacaoLogica?.pipelineValido || false,
  };
}
