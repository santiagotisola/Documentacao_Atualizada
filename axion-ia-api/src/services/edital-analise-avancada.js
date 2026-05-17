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

// ─── CONCORRENTES CONHECIDOS (com funcionalidades no formato matchRequisito) ──

const CONCORRENTES = [
  { nome: "Perkons (Envision)", regiao: "PR/Curitiba", segmento: "Fiscalização eletrônica, radares", forca: "Líderes em radares fixos, grande base instalada", fraqueza: "Software legado, pouca inovação em IA", site: "perkons.com.br",
    diferencial: "Maior base instalada de radares fixos no Brasil. Hardware próprio homologado INMETRO.",
    funcionalidades: [
      { termo: ["radar", "medidor de velocidade", "controlador de velocidade", "equipamento fixo", "equipamento estático"], nivel: "atende" },
      { termo: ["lombada eletrônica", "redutor de velocidade"], nivel: "atende" },
      { termo: ["semáforo", "avanço de sinal", "sinal vermelho", "controlador semafórico"], nivel: "atende" },
      { termo: ["câmera", "fotossensor", "registro fotográfico", "captura de imagem"], nivel: "atende" },
      { termo: ["ocr", "leitura de placa", "reconhecimento de placa", "lpr", "anpr"], nivel: "atende" },
      { termo: ["laço indutivo", "detector de presença", "sensor indutivo"], nivel: "atende" },
      { termo: ["equipamento", "cadastro de equipamento", "inventário de equipamento"], nivel: "atende" },
      { termo: ["infração", "auto de infração", "registro de infração"], nivel: "atende" },
      { termo: ["triagem", "validar infração", "análise de infração"], nivel: "atende" },
      { termo: ["exportação", "exportar infração", "lote de exportação", "gerar lote"], nivel: "atende" },
      { termo: ["renainf", "envio infração", "denatran", "senatran"], nivel: "atende" },
      { termo: ["relatório", "relatório gerencial", "relatório de infração"], nivel: "atende" },
      { termo: ["manutenção", "manutenção preventiva", "manutenção corretiva", "assistência técnica"], nivel: "atende" },
      { termo: ["aferição", "inmetro", "certificado inmetro", "calibração", "metrologia"], nivel: "atende" },
      { termo: ["monitoramento online", "tempo real", "status online"], nivel: "atende" },
      { termo: ["operação", "operação de campo", "ponto de fiscalização"], nivel: "atende" },
      { termo: ["enquadramento", "artigo", "código de infração", "tipo de infração"], nivel: "atende" },
      { termo: ["tarja", "marca d'água", "proteção de imagem"], nivel: "atende" },
      { termo: ["faixa", "faixa de velocidade", "pista"], nivel: "atende" },
      { termo: ["contran", "resolução contran", "ctb", "código de trânsito"], nivel: "atende" },
      { termo: ["instalação", "implantação"], nivel: "atende" },
      { termo: ["treinamento", "capacitação"], nivel: "parcial" },
      { termo: ["suporte", "atendimento", "chamado", "help desk"], nivel: "parcial" },
      { termo: ["sistema", "software", "plataforma"], nivel: "parcial" },
      { termo: ["integração", "api", "webservice"], nivel: "parcial" },
      { termo: ["pórtico", "arco", "portal eletrônico"], nivel: "atende" },
      { termo: ["nobreak", "energia", "ups"], nivel: "parcial" },
      { termo: ["servidor", "rack"], nivel: "parcial" },
    ] },
  { nome: "Kapsch TrafficCom", regiao: "Internacional/SP", segmento: "ITS, free-flow, pedágio, smart city", forca: "Tecnologia global, V2X, IoT, analytics", fraqueza: "Custo alto, pouca capilaridade local", site: "kapsch.net",
    diferencial: "Referência global em ITS e V2X. Forte em projetos de smart city internacionais.",
    funcionalidades: [
      { termo: ["câmera", "câmera fixa", "câmera ptz", "captura de imagem", "fotossensor", "cftv"], nivel: "atende" },
      { termo: ["ocr", "leitura de placa", "reconhecimento de placa", "lpr", "anpr"], nivel: "atende" },
      { termo: ["monitoramento online", "tempo real", "status online", "monitoramento de tráfego"], nivel: "atende" },
      { termo: ["relatório", "relatório gerencial", "dashboard", "painel", "analytics"], nivel: "atende" },
      { termo: ["equipamento", "cadastro de equipamento", "sensor"], nivel: "atende" },
      { termo: ["semáforo", "controlador semafórico", "sinal", "gestão semafórica"], nivel: "atende" },
      { termo: ["mapa", "georreferenciamento", "localização", "gis", "geoespacial"], nivel: "atende" },
      { termo: ["integração", "api", "webservice", "rest", "web service"], nivel: "atende" },
      { termo: ["radar", "medidor de velocidade", "detector"], nivel: "atende" },
      { termo: ["pórtico", "arco", "portal eletrônico", "free-flow", "pedágio"], nivel: "atende" },
      { termo: ["servidor", "rack", "data center", "infraestrutura"], nivel: "atende" },
      { termo: ["switch", "rede", "conectividade", "fibra óptica", "link"], nivel: "atende" },
      { termo: ["analítico", "inteligência artificial", "ia", "análise de vídeo", "computer vision", "reconhecimento facial"], nivel: "atende" },
      { termo: ["monitoramento de veículos", "fluxo de veículos", "contagem veicular", "mobilidade"], nivel: "atende" },
      { termo: ["sistema", "software", "plataforma", "solução"], nivel: "atende" },
      { termo: ["nuvem", "cloud", "saas", "hospedagem"], nivel: "atende" },
      { termo: ["manutenção", "manutenção preventiva", "manutenção corretiva"], nivel: "atende" },
      { termo: ["instalação", "implantação", "projeto executivo"], nivel: "atende" },
      { termo: ["treinamento", "capacitação", "operação assistida"], nivel: "atende" },
      { termo: ["nobreak", "energia"], nivel: "parcial" },
      { termo: ["suporte", "atendimento", "help desk"], nivel: "parcial" },
      { termo: ["contran", "resolução contran", "ctb"], nivel: "parcial" },
    ] },
  { nome: "Conduent (Xerox)", regiao: "SP/RJ", segmento: "Processamento massivo de infrações", forca: "Escala, processamento massivo, grandes contratos", fraqueza: "Atendimento burocrático, custo elevado", site: "conduent.com",
    diferencial: "Processamento massivo de infrações. Experiência com grandes contratos estaduais.",
    funcionalidades: [
      { termo: ["infração", "auto de infração", "registro de infração"], nivel: "atende" },
      { termo: ["triagem", "validar infração", "análise de infração", "auditoria de infração"], nivel: "atende" },
      { termo: ["exportação", "exportar infração", "lote de exportação", "gerar lote"], nivel: "atende" },
      { termo: ["renainf", "envio infração", "denatran", "senatran"], nivel: "atende" },
      { termo: ["relatório", "relatório gerencial", "relatório de infração"], nivel: "atende" },
      { termo: ["câmera", "fotossensor", "registro fotográfico", "captura de imagem"], nivel: "atende" },
      { termo: ["ocr", "leitura de placa", "reconhecimento de placa", "lpr"], nivel: "atende" },
      { termo: ["equipamento", "cadastro de equipamento"], nivel: "atende" },
      { termo: ["enquadramento", "artigo", "código de infração"], nivel: "atende" },
      { termo: ["manutenção", "manutenção preventiva", "manutenção corretiva"], nivel: "atende" },
      { termo: ["operação", "operação de campo", "ponto de fiscalização"], nivel: "atende" },
      { termo: ["sistema", "software", "plataforma"], nivel: "atende" },
      { termo: ["instalação", "implantação"], nivel: "atende" },
      { termo: ["faixa", "faixa de velocidade"], nivel: "atende" },
      { termo: ["aferição", "inmetro", "calibração"], nivel: "atende" },
      { termo: ["tarja", "marca d'água", "proteção de imagem"], nivel: "atende" },
      { termo: ["contran", "resolução contran", "ctb"], nivel: "atende" },
      { termo: ["suporte", "atendimento", "chamado"], nivel: "parcial" },
      { termo: ["integração", "api", "webservice"], nivel: "parcial" },
      { termo: ["treinamento", "capacitação"], nivel: "parcial" },
    ] },
  { nome: "Velsis (Grupo Dataprom)", regiao: "PR/Nacional", segmento: "Radares, lombadas, controladores semafóricos", forca: "Hardware próprio, INMETRO, controladores", fraqueza: "Software genérico, pouca IA", site: "velsis.com.br",
    diferencial: "Hardware + software integrado com homologação INMETRO. Controladores semafóricos.",
    funcionalidades: [
      { termo: ["radar", "medidor de velocidade", "controlador de velocidade", "equipamento fixo"], nivel: "atende" },
      { termo: ["lombada eletrônica", "redutor de velocidade"], nivel: "atende" },
      { termo: ["semáforo", "avanço de sinal", "sinal vermelho", "controlador semafórico"], nivel: "atende" },
      { termo: ["câmera", "fotossensor", "registro fotográfico", "captura de imagem"], nivel: "atende" },
      { termo: ["ocr", "leitura de placa", "reconhecimento de placa", "lpr"], nivel: "atende" },
      { termo: ["laço indutivo", "detector de presença", "sensor indutivo"], nivel: "atende" },
      { termo: ["equipamento", "cadastro de equipamento"], nivel: "atende" },
      { termo: ["infração", "auto de infração", "registro de infração"], nivel: "atende" },
      { termo: ["triagem", "validar infração"], nivel: "atende" },
      { termo: ["exportação", "exportar infração", "gerar lote"], nivel: "atende" },
      { termo: ["renainf", "denatran", "senatran"], nivel: "atende" },
      { termo: ["relatório", "relatório gerencial"], nivel: "atende" },
      { termo: ["monitoramento online", "tempo real", "status online"], nivel: "atende" },
      { termo: ["aferição", "inmetro", "calibração", "metrologia"], nivel: "atende" },
      { termo: ["manutenção", "manutenção preventiva", "manutenção corretiva"], nivel: "atende" },
      { termo: ["operação", "operação de campo"], nivel: "atende" },
      { termo: ["enquadramento", "artigo", "código de infração"], nivel: "atende" },
      { termo: ["faixa", "faixa de velocidade", "pista"], nivel: "atende" },
      { termo: ["pórtico", "arco", "portal eletrônico"], nivel: "atende" },
      { termo: ["contran", "resolução contran", "ctb"], nivel: "atende" },
      { termo: ["instalação", "implantação"], nivel: "atende" },
      { termo: ["sistema", "software", "plataforma"], nivel: "parcial" },
      { termo: ["treinamento", "capacitação"], nivel: "parcial" },
      { termo: ["suporte", "atendimento"], nivel: "parcial" },
      { termo: ["nobreak", "energia"], nivel: "parcial" },
    ] },
  { nome: "Pumatronix", regiao: "PR/Curitiba", segmento: "Câmeras OCR, LPR, hardware de captura", forca: "Hardware de captura líder no Brasil", fraqueza: "Não tem plataforma de gestão completa", site: "pumatronix.com.br",
    diferencial: "Líder em câmeras OCR/LPR. Fornece hardware para integradores.",
    funcionalidades: [
      { termo: ["câmera", "fotossensor", "captura de imagem", "câmera fixa", "câmera ptz"], nivel: "atende" },
      { termo: ["ocr", "leitura de placa", "reconhecimento de placa", "lpr", "anpr"], nivel: "atende" },
      { termo: ["equipamento", "cadastro de equipamento", "sensor"], nivel: "atende" },
      { termo: ["monitoramento online", "tempo real"], nivel: "parcial" },
      { termo: ["pórtico", "arco", "portal eletrônico"], nivel: "atende" },
      { termo: ["instalação", "implantação"], nivel: "parcial" },
      { termo: ["manutenção", "assistência técnica"], nivel: "parcial" },
    ] },
  { nome: "Getrak", regiao: "MG/Nacional", segmento: "Rastreamento, monitoramento veicular, cerco eletrônico", forca: "Plataforma de monitoramento veicular robusta", fraqueza: "Foco em rastreamento, não fiscalização", site: "getrak.com.br",
    diferencial: "Plataforma robusta de monitoramento veicular e cerco eletrônico.",
    funcionalidades: [
      { termo: ["monitoramento de veículos", "rastreamento", "monitoramento veicular"], nivel: "atende" },
      { termo: ["cerco eletrônico", "cerco inteligente", "bloqueio veicular"], nivel: "atende" },
      { termo: ["alerta", "alerta de placa", "notificação automática"], nivel: "atende" },
      { termo: ["mapa", "georreferenciamento", "localização"], nivel: "atende" },
      { termo: ["relatório", "relatório gerencial"], nivel: "atende" },
      { termo: ["equipamento", "cadastro de equipamento"], nivel: "parcial" },
      { termo: ["câmera", "captura de imagem"], nivel: "parcial" },
      { termo: ["ocr", "leitura de placa", "lpr"], nivel: "parcial" },
      { termo: ["sistema", "software", "plataforma"], nivel: "atende" },
      { termo: ["integração", "api", "webservice"], nivel: "atende" },
    ] },
  { nome: "Sweda/Tacom", regiao: "SP/Nacional", segmento: "Pesagem veicular, balanças", forca: "Balanças dinâmicas e estáticas, INMETRO", fraqueza: "Só pesagem, sem integração com fiscalização", site: "sweda.com.br",
    diferencial: "Especialista em pesagem veicular com balanças homologadas INMETRO.",
    funcionalidades: [
      { termo: ["pesagem", "pesagem veicular", "balança dinâmica", "balança estática", "balança"], nivel: "atende" },
      { termo: ["pbt", "peso bruto total", "excesso de peso", "sobrepeso"], nivel: "atende" },
      { termo: ["classificação de veículo", "eixo", "cmt"], nivel: "atende" },
      { termo: ["ticket", "ticket de pesagem", "registro de pesagem"], nivel: "atende" },
      { termo: ["relatório", "relatório de pesagem"], nivel: "atende" },
      { termo: ["equipamento", "cadastro de equipamento"], nivel: "atende" },
      { termo: ["manutenção", "assistência técnica"], nivel: "atende" },
      { termo: ["aferição", "inmetro", "calibração"], nivel: "atende" },
      { termo: ["instalação", "implantação"], nivel: "atende" },
    ] },
  { nome: "Brascontec", regiao: "GO/Centro-Oeste", segmento: "Fiscalização, videomonitoramento regional", forca: "Presença regional, atendimento local", fraqueza: "Tecnologia limitada, sem inovação", site: "brascontec.com.br",
    diferencial: "Presença forte no Centro-Oeste (GO). Atendimento local e relação com órgãos regionais.",
    funcionalidades: [
      { termo: ["radar", "medidor de velocidade"], nivel: "atende" },
      { termo: ["câmera", "fotossensor", "captura de imagem", "cftv", "vídeo monitoramento"], nivel: "atende" },
      { termo: ["equipamento", "cadastro de equipamento"], nivel: "atende" },
      { termo: ["manutenção", "manutenção preventiva", "manutenção corretiva"], nivel: "atende" },
      { termo: ["operação", "operação de campo"], nivel: "atende" },
      { termo: ["monitoramento online", "tempo real"], nivel: "atende" },
      { termo: ["instalação", "implantação"], nivel: "atende" },
      { termo: ["pórtico", "arco"], nivel: "parcial" },
      { termo: ["suporte", "atendimento"], nivel: "atende" },
      { termo: ["nobreak", "energia"], nivel: "parcial" },
    ] },
  { nome: "Autotrack/GTech", regiao: "SP/Nacional", segmento: "Rastreamento + OCR + monitoramento", forca: "Base instalada grande, capilaridade", fraqueza: "Plataforma legada", site: "autotrack.com.br",
    diferencial: "Grande base instalada de rastreamento. Capilaridade nacional.",
    funcionalidades: [
      { termo: ["rastreamento", "monitoramento veicular", "monitoramento de veículos"], nivel: "atende" },
      { termo: ["ocr", "leitura de placa", "reconhecimento de placa"], nivel: "atende" },
      { termo: ["câmera", "captura de imagem"], nivel: "atende" },
      { termo: ["alerta", "alerta de placa", "notificação"], nivel: "atende" },
      { termo: ["mapa", "georreferenciamento"], nivel: "atende" },
      { termo: ["relatório", "relatório gerencial"], nivel: "atende" },
      { termo: ["equipamento", "cadastro de equipamento"], nivel: "atende" },
      { termo: ["sistema", "software", "plataforma"], nivel: "parcial" },
      { termo: ["integração", "api"], nivel: "parcial" },
    ] },
  { nome: "Iteris (Sensys)", regiao: "Internacional/SP", segmento: "ITS, detecção, analytics de tráfego", forca: "Analytics de tráfego, computer vision", fraqueza: "Custo internacional, suporte limitado", site: "iteris.com",
    diferencial: "Analytics de tráfego avançado com computer vision. Forte em detecção e contagem.",
    funcionalidades: [
      { termo: ["radar", "medidor de velocidade", "detector"], nivel: "atende" },
      { termo: ["câmera", "câmera fixa", "câmera ptz", "captura de imagem", "cftv"], nivel: "atende" },
      { termo: ["ocr", "leitura de placa", "reconhecimento de placa", "lpr"], nivel: "atende" },
      { termo: ["relatório", "dashboard", "painel", "analytics"], nivel: "atende" },
      { termo: ["mapa", "georreferenciamento", "gis"], nivel: "atende" },
      { termo: ["monitoramento online", "tempo real", "monitoramento de tráfego"], nivel: "atende" },
      { termo: ["equipamento", "sensor", "detector"], nivel: "atende" },
      { termo: ["integração", "api", "webservice"], nivel: "atende" },
      { termo: ["analítico", "inteligência artificial", "ia", "computer vision", "análise de vídeo"], nivel: "atende" },
      { termo: ["fluxo de veículos", "contagem veicular", "volume de tráfego"], nivel: "atende" },
      { termo: ["servidor", "infraestrutura"], nivel: "parcial" },
      { termo: ["sistema", "software", "plataforma"], nivel: "atende" },
      { termo: ["instalação", "implantação"], nivel: "parcial" },
    ] },
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
    concorrentes = await analisarConcorrentes(textoEdital, categorias, regiao, dePara);
  }

  // 4. Validação de mercado
  let mercado = null;
  if (incluirMercado) {
    mercado = await validarMercadoSaaS(textoEdital, categorias, dePara, concorrentes);
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

// ─── MAPA DE CAPACIDADES REAIS DOS PRODUTOS ────────────────────
// Baseado na documentação, KB e telas reais do sistema

const CAPACIDADES_AXHUB = {
  modulos: ["Dashboard", "Infrações", "Cronotacógrafo", "Balança", "Operações", "Veículos", "Equipamentos", "Medição", "Relatórios", "Controle de Acesso", "Configurações"],
  totalTelas: 70,
  funcionalidades: [
    // Software/Sistema
    { termo: ["sistema de gestão", "plataforma", "software de fiscalização", "sistema de infrações", "sistema de trânsito", "gerenciamento de infrações"], modulo: "Infrações", path: "/infracoes", nivel: "atende", desc: "AxHub é plataforma SaaS completa de gestão de infrações" },
    { termo: ["dashboard", "painel", "painel sinótico", "visão geral", "indicadores", "kpi"], modulo: "Dashboard", path: "/", nivel: "atende", desc: "Dashboard com ícones de atalho, painel sinótico, status equipamentos, mapa, alertas aferição, triagem mensal" },
    { termo: ["triagem", "validar infração", "análise de infração", "auditoria de infração", "revisar infração"], modulo: "Infrações", path: "/infracoes/triagem", nivel: "atende", desc: "Triagem com validar/descartar/reabrir + auditoria confirmar/rejeitar" },
    { termo: ["auditoria", "auditor", "segunda verificação", "dupla verificação", "revisão de infração"], modulo: "Infrações", path: "/infracoes/auditoria", nivel: "atende", desc: "Fluxo auditor: confirmar/rejeitar infrações já triadas" },
    { termo: ["exportação", "exportar infração", "renainf", "lote de exportação", "envio infração", "gerar lote"], modulo: "Infrações", path: "/infracoes/exportacao", nivel: "atende", desc: "Exportação com RENAINF/XML/TXT/CSV, SFTP/API/download, 7 validações automáticas" },
    { termo: ["consulta de infração", "buscar infração", "pesquisar infração", "localizar infração"], modulo: "Infrações", path: "/infracoes/consulta", nivel: "atende", desc: "Consulta com filtros: período, status, equipamento, placa" },
    { termo: ["descarte", "descartar", "motivo de descarte", "infração descartada"], modulo: "Infrações", path: "/infracoes/descartadas", nivel: "atende", desc: "Infrações descartadas com motivo obrigatório + reabrir" },
    { termo: ["exceções", "exceção de infração", "regra especial"], modulo: "Infrações", path: "/infracoes/excecoes", nivel: "atende", desc: "Cadastro de exceções de infrações" },
    // Equipamentos & Hardware
    { termo: ["equipamento", "cadastro de equipamento", "equipamento de fiscalização", "registrar equipamento", "inventário de equipamento"], modulo: "Equipamentos", path: "/equipamentos", nivel: "atende", desc: "Cadastro com Nº série, código, certificado INMETRO, modelo, tipo, grupo, tipo operação" },
    { termo: ["fabricante", "marca de equipamento", "fornecedor"], modulo: "Equipamentos", path: "/equipamentos/fabricantes", nivel: "atende", desc: "Cadastro de fabricantes com tokens de integração" },
    { termo: ["modelo de equipamento", "tipo de equipamento", "grupo de equipamento"], modulo: "Equipamentos", path: "/equipamentos/modelos", nivel: "atende", desc: "Modelos e tipos de equipamentos com agrupamento" },
    { termo: ["câmera", "captura de imagem", "fotossensor", "registro fotográfico", "imagem da infração", "foto da placa"], modulo: "Infrações", path: "/infracoes/triagem", nivel: "atende", desc: "Captura automática: imagem, placa OCR, data/hora, velocidade, local" },
    { termo: ["radar", "medidor de velocidade", "sensor de velocidade", "controlador de velocidade", "equipamento fixo", "equipamento estático"], modulo: "Operações", path: "/operacoes", nivel: "atende", desc: "Gestão de radares fixos, portáteis e estáticos com aferição INMETRO" },
    { termo: ["lombada eletrônica", "redutor de velocidade"], modulo: "Operações", path: "/operacoes", nivel: "atende", desc: "Suporte a lombadas eletrônicas como tipo de equipamento" },
    { termo: ["semáforo", "avanço de sinal", "sinal vermelho", "controlador semafórico"], modulo: "Operações", path: "/operacoes", nivel: "atende", desc: "Fiscalização de avanço de sinal vermelho" },
    { termo: ["laço indutivo", "detector de presença", "sensor indutivo", "loop"], modulo: "Operações", path: "/operacoes", nivel: "atende", desc: "Integração com laços indutivos via equipamento" },
    { termo: ["display", "painel de mensagem", "pmv", "mensagem variável"], modulo: "Operações", path: "/operacoes", nivel: "parcial", desc: "Suporte via integração de equipamentos — sem módulo dedicado PMV" },
    { termo: ["ocr", "leitura de placa", "reconhecimento de placa", "lpr", "anpr", "captura automática de placa"], modulo: "Infrações", path: "/infracoes/triagem", nivel: "atende", desc: "OCR automático na captura + consulta de placas" },
    { termo: ["nobreak", "energia", "estabilizador", "ups"], modulo: "Equipamentos", path: "/equipamentos", nivel: "parcial", desc: "Cadastro como acessório de equipamento — sem monitoramento dedicado" },
    // Operações
    { termo: ["operação", "cadastro de operação", "ponto de fiscalização", "local de fiscalização", "operação de campo"], modulo: "Operações", path: "/operacoes/cadastro", nivel: "atende", desc: "Cadastro completo de operações com local, equipamento, faixa" },
    { termo: ["aferição", "inmetro", "certificado inmetro", "calibração", "certificado de aferição", "metrologia"], modulo: "Operações", path: "/operacoes/afericoes", nivel: "atende", desc: "Gestão de aferições com alerta de vencimento, histórico de certificados" },
    { termo: ["faixa", "faixa de velocidade", "faixa de via", "faixa de trânsito", "pista"], modulo: "Operações", path: "/operacoes/faixas", nivel: "atende", desc: "Cadastro de faixas por operação" },
    { termo: ["monitoramento online", "tempo real", "status online", "equipamento online", "signalr"], modulo: "Operações", path: "/operacoes/monitoramento", nivel: "atende", desc: "Monitoramento online via SignalR com status em tempo real" },
    { termo: ["evento de equipamento", "log de equipamento", "histórico equipamento"], modulo: "Operações", path: "/operacoes/eventos", nivel: "atende", desc: "Eventos de equipamentos com filtros e histórico" },
    { termo: ["consulta de placa", "buscar placa", "pesquisar placa", "verificar placa"], modulo: "Operações", path: "/operacoes/consulta-placas", nivel: "atende", desc: "Consulta de placas com histórico de passagens" },
    // Relatórios
    { termo: ["relatório", "relatório de infração", "relatório gerencial", "emitir relatório", "gerar relatório"], modulo: "Relatórios", path: "/relatorios", nivel: "atende", desc: "12+ relatórios: infrações, passagens, fluxo, discrepâncias, equipamentos, Power BI" },
    { termo: ["relatório de passagem", "fluxo de veículos", "contagem de veículos", "volume de tráfego", "fluxo diário", "contagem veicular"], modulo: "Relatórios", path: "/relatorios/passagens", nivel: "atende", desc: "Relatório de passagens com filtros por data, equipamento, faixa" },
    { termo: ["power bi", "business intelligence", "bi", "painel analítico"], modulo: "Relatórios", path: "/relatorios/power-bi", nivel: "atende", desc: "Integração nativa com Power BI" },
    { termo: ["mapa de fluxo", "mapa de calor", "mapa de passagens", "georreferenciamento", "google maps", "mapa"], modulo: "Relatórios", path: "/relatorios/mapa-fluxo", nivel: "atende", desc: "Mapa de fluxo com Google Maps integrado" },
    { termo: ["discrepância", "falha sequencial", "processamento de imagem"], modulo: "Relatórios", path: "/relatorios/discrepancias", nivel: "atende", desc: "Relatórios de discrepâncias e falhas sequenciais" },
    // Medições / SLA
    { termo: ["medição", "contrato", "índice de performance", "desempenho", "performance de equipamento", "disponibilidade", "uptime"], modulo: "Medição", path: "/medicoes", nivel: "atende", desc: "Gestão de contratos, índices de performance, interrupções, geração de medição" },
    { termo: ["sla", "nível de serviço", "acordo de nível", "tempo de resposta", "tempo de atendimento"], modulo: "Medição", path: "/medicoes/indices-performance", nivel: "atende", desc: "Índices de performance por contrato com metas de SLA" },
    { termo: ["interrupção", "indisponibilidade", "parada", "tempo inoperante"], modulo: "Medição", path: "/medicoes/interrupcoes", nivel: "atende", desc: "Registro e controle de interrupções por equipamento" },
    // Controle de Acesso / Segurança
    { termo: ["usuário", "login", "autenticação", "controle de acesso", "senha", "credencial"], modulo: "Controle de Acesso", path: "/controle-acesso/usuarios", nivel: "atende", desc: "OAuth2+PKCE, gestão de usuários, perfis, permissões, logs" },
    { termo: ["perfil de acesso", "permissão", "nível de acesso", "autorização", "grupo de usuário"], modulo: "Controle de Acesso", path: "/controle-acesso/perfis", nivel: "atende", desc: "Perfis com permissões granulares por módulo" },
    { termo: ["log de acesso", "auditoria de acesso", "rastreabilidade", "trilha de auditoria"], modulo: "Controle de Acesso", path: "/controle-acesso/logs", nivel: "atende", desc: "Logs completos de acesso com restrição por IP" },
    // Veículos
    { termo: ["veículo", "tipo de veículo", "marca de veículo", "modelo de veículo", "categoria veicular", "classificação veicular", "espécie de veículo"], modulo: "Veículos", path: "/veiculos", nivel: "atende", desc: "Cadastros: tipos, espécies, marcas, modelos, cores, classificações, municípios" },
    { termo: ["placa", "leitura de placa", "registro de placa", "identificação veicular"], modulo: "Veículos", path: "/veiculos", nivel: "atende", desc: "Captura e gestão de placas integrada ao fluxo de infrações" },
    // Pesagem (módulo Balança do AxHub)
    { termo: ["pesagem", "balança", "ticket de pesagem", "posto de pesagem", "peso"], modulo: "Balança", path: "/balanca/pesagem", nivel: "atende", desc: "Módulo de pesagem: postos, tickets abertos/fechados, reclassificar, liberar" },
    { termo: ["reclassificação", "reclassificar pesagem", "alterar classificação"], modulo: "Balança", path: "/balanca/reclassificar", nivel: "atende", desc: "Reclassificação de veículos pesados" },
    // Administração
    { termo: ["enquadramento", "artigo", "código de infração", "tipo de infração", "natureza da infração"], modulo: "Administração", path: "/admin/enquadramentos", nivel: "atende", desc: "Cadastro de enquadramentos com formas de autuação" },
    { termo: ["tarja", "marca d'água", "imagem protegida", "proteção de imagem"], modulo: "Administração", path: "/admin/tarjas", nivel: "atende", desc: "Tarjas e proteção de imagens de infrações" },
    { termo: ["webhook", "integração", "api", "notificação automática", "webservice", "web service"], modulo: "Administração", path: "/admin/webhooks", nivel: "atende", desc: "Webhooks para integração com sistemas externos" },
    { termo: ["arco", "portal eletrônico", "pórtico"], modulo: "Administração", path: "/admin/arcos", nivel: "atende", desc: "Cadastro de arcos/pórticos de fiscalização" },
    { termo: ["layout de arquivo", "formato de exportação", "layout renainf"], modulo: "Administração", path: "/admin/layouts", nivel: "atende", desc: "Layouts configuráveis de arquivos de exportação" },
    // Cronotacógrafo
    { termo: ["cronotacógrafo", "tacógrafo", "jornada de motorista", "tempo de direção"], modulo: "Cronotacógrafo", path: "/cronotacografo", nivel: "atende", desc: "Triagem e consulta de cronotacógrafo" },
    // Normas e conformidade
    { termo: ["contran", "resolução contran", "ctb", "código de trânsito"], modulo: "Glossário", path: "/glossario", nivel: "atende", desc: "Sistema construído conforme CTB, CONTRAN, DENATRAN" },
    { termo: ["denatran", "senatran", "renainf"], modulo: "Infrações", path: "/infracoes/exportacao", nivel: "atende", desc: "Exportação RENAINF conforme DENATRAN/SENATRAN" },
    // Infraestrutura
    { termo: ["backup", "redundância", "alta disponibilidade", "disaster recovery", "contingência"], modulo: "Referência Técnica", path: null, nivel: "atende", desc: "Hospedagem cloud Azure com backups automáticos" },
    { termo: ["nuvem", "cloud", "saas", "hospedagem"], modulo: "Referência Técnica", path: null, nivel: "atende", desc: "Plataforma SaaS hospedada em cloud (Azure)" },
    { termo: ["ssl", "https", "criptografia", "certificado digital", "segurança da informação", "lgpd"], modulo: "Referência Técnica", path: null, nivel: "atende", desc: "HTTPS com certificado SSL, OIDC/OAuth2+PKCE" },
    // Manutenção e Suporte
    { termo: ["manutenção", "manutenção preventiva", "manutenção corretiva", "assistência técnica"], modulo: "Operações", path: "/operacoes", nivel: "parcial", desc: "Monitoramento de status online — sem módulo dedicado de ordens de serviço" },
    { termo: ["suporte", "atendimento", "chamado", "help desk", "helpdesk", "central de atendimento"], modulo: "Referência Técnica", path: null, nivel: "atende", desc: "Helpdesk Jitbit + AxionIA com auto-classificação" },
    { termo: ["treinamento", "capacitação", "operação assistida"], modulo: "Referência Técnica", path: null, nivel: "parcial", desc: "Documentação online + helpdesk — sem módulo de e-learning" },
  ],
};

const CAPACIDADES_AXCROSS = {
  modulos: ["Dashboard", "Veículos Monitorados", "Equipamentos", "Monitoramento Online", "Relatórios", "Configurações"],
  totalTelas: 24,
  funcionalidades: [
    { termo: ["cruzamento", "cruzamento de dados", "cruzamento de placas", "comparação de placas"], modulo: "Veículos Monitorados", path: "/occurrences/monitoredvehicle", nivel: "atende", desc: "Cruzamento automático de placas detectadas vs base de monitorados" },
    { termo: ["veículo monitorado", "monitoramento de veículo", "placa monitorada", "placa de interesse", "veículo de interesse"], modulo: "Veículos Monitorados", path: "/occurrences/monitoredvehicle", nivel: "atende", desc: "Cadastro com placa, tipo de ocorrência, habilitado, expiração" },
    { termo: ["alerta", "alerta de placa", "notificação de placa", "alerta em tempo real", "aviso automático"], modulo: "Veículos Monitorados", path: "/occurrences/monitoredvehicle", nivel: "atende", desc: "Alertas automáticos quando veículo monitorado é detectado" },
    { termo: ["cerco eletrônico", "cerco inteligente", "bloqueio veicular"], modulo: "Veículos Monitorados", path: "/occurrences/monitoredvehicle", nivel: "atende", desc: "Funciona como cerco eletrônico via rede de equipamentos" },
    { termo: ["tipo de ocorrência", "categoria de alerta", "classificação de ocorrência"], modulo: "Veículos Monitorados", path: "/occurrences/monitoredvehicle", nivel: "atende", desc: "Classificação com prazo de expiração automática" },
    { termo: ["vigência", "expiração", "prazo de monitoramento", "validade do alerta"], modulo: "Veículos Monitorados", path: "/occurrences/monitoredvehicle", nivel: "atende", desc: "Controle de vigência: data início/fim, expiração automática" },
    { termo: ["importação", "importar placas", "carga em lote", "arquivo de placas"], modulo: "Veículos Monitorados", path: "/occurrences/monitoredvehicle", nivel: "atende", desc: "Importação em lote via .txt (uma placa por linha)" },
    { termo: ["monitoramento online", "tempo real", "monitoramento em tempo real", "mapa ao vivo", "signalr"], modulo: "Monitoramento Online", path: "/monitoringonline/monitoring", nivel: "atende", desc: "Monitoramento em tempo real via SignalR + mapa Google Maps" },
    { termo: ["mapa de equipamento", "localização de equipamento", "georreferenciamento"], modulo: "Monitoramento Online", path: "/monitoringonline/monitoring", nivel: "atende", desc: "Mapa de equipamentos com Google Maps" },
    { termo: ["rastreamento", "rastrear placa", "histórico de placa", "rota de veículo", "mapeamento de rota"], modulo: "Relatórios", path: "/reports/reports", nivel: "atende", desc: "Rastreamento de placas + mapeamento de rotas" },
    { termo: ["relatório de passagem", "consulta de passagem", "histórico de passagem"], modulo: "Relatórios", path: "/reports/reports", nivel: "atende", desc: "Relatórios: passagens, mapeamento rotas, rastreamento, ocorrências" },
    { termo: ["ocorrência", "relatório de ocorrência", "relatório de alerta"], modulo: "Relatórios", path: "/reports/reports", nivel: "atende", desc: "Relatório de ocorrências e alertas gerados" },
    { termo: ["pdf", "gerar pdf", "relatório em pdf"], modulo: "Relatórios", path: "/reports/reports", nivel: "atende", desc: "Geração de PDF a partir dos relatórios" },
    { termo: ["sincronização", "sincronizar passagens", "sincronização de dados"], modulo: "Configurações", path: "/settings/systemsettings", nivel: "atende", desc: "Sincronização de passagens configurável" },
    { termo: ["equipamento", "cadastro de equipamento"], modulo: "Equipamentos", path: "/equipments/equipment", nivel: "atende", desc: "Gestão de equipamentos com grupos e áreas" },
    { termo: ["área", "zona de monitoramento", "região monitorada"], modulo: "Equipamentos", path: "/equipments/equipment", nivel: "atende", desc: "Cadastro de áreas para agrupamento de equipamentos" },
    { termo: ["roubo", "furto", "veículo roubado", "veículo furtado", "veículo clonado"], modulo: "Veículos Monitorados", path: "/occurrences/monitoredvehicle", nivel: "atende", desc: "Monitoramento de veículos com alerta tipo roubo/furto" },
    { termo: ["reconhecimento", "lpr", "anpr", "ocr", "leitura automática de placa"], modulo: "Equipamentos", path: "/equipments/equipment", nivel: "atende", desc: "Integração com câmeras LPR/ANPR" },
  ],
};

const CAPACIDADES_AXTON = {
  modulos: ["Iniciar Pesagem", "Operações", "Tickets", "Exportação", "Sistema", "Relatórios", "Cadastros", "Administração"],
  totalTelas: 58,
  funcionalidades: [
    { termo: ["pesagem", "pesagem veicular", "pesagem de veículo", "balança dinâmica", "balança estática"], modulo: "Pesagem", path: "/pesagem", nivel: "atende", desc: "Fluxo: passagem → pesagem → classificação → verificação excesso → infração" },
    { termo: ["ticket", "ticket de pesagem", "registro de pesagem"], modulo: "Tickets", path: "/tickets", nivel: "atende", desc: "Tickets abertos e fechados com reclassificação" },
    { termo: ["reclassificação", "reclassificar", "alterar classificação veicular"], modulo: "Pesagem", path: "/pesagem/reclassificar", nivel: "atende", desc: "Reclassificação de veículos pesados" },
    { termo: ["liberar pesagem", "liberar veículo", "dispensar pesagem"], modulo: "Pesagem", path: "/pesagem/liberar", nivel: "atende", desc: "Liberação de pesagem com motivo registrado" },
    { termo: ["pbt", "peso bruto total", "excesso de peso", "sobrepeso", "sobrecarga"], modulo: "Pesagem", path: "/pesagem", nivel: "atende", desc: "PBT: Art. 99 CTB, Resolução CONTRAN 803/2021" },
    { termo: ["classificação de veículo", "2c", "3c", "2s1", "2s2", "2s3", "2i2", "eixo", "cmt"], modulo: "Cadastros", path: "/cadastros/classificacao-veiculos", nivel: "atende", desc: "Classificações: 2C(16t), 2CC(12t), 3C(23t), 3CD(19.5t), 4C(31.5t), etc." },
    { termo: ["local de pesagem", "posto de pesagem", "ponto de pesagem"], modulo: "Cadastros", path: "/cadastros/locais", nivel: "atende", desc: "Locais cadastrados com rodovia, km, município" },
    { termo: ["exportação", "exportar infração de pesagem", "lote de pesagem"], modulo: "Infrações", path: "/infracoes/exportacao", nivel: "atende", desc: "Exportação de infrações de pesagem por lote" },
    { termo: ["sequencial de infração", "numeração de infração"], modulo: "Cadastros", path: "/cadastros/sequencial-infracao", nivel: "atende", desc: "Sequenciais: PBT(212-99999), Eixo(1060-99999)" },
    { termo: ["nota fiscal", "nfe", "mdfe", "manifesto"], modulo: "Relatórios", path: "/relatorios/nfe", nivel: "atende", desc: "Relatório de notas fiscais e MDF-e" },
    { termo: ["câmera ip", "vídeo monitoramento"], modulo: "Sistema", path: "/sistema/camera-ip", nivel: "atende", desc: "Configuração de câmeras IP integradas" },
    { termo: ["operação", "monitoramento online", "eventos"], modulo: "Operações", path: "/operacoes", nivel: "atende", desc: "Monitoramento online, eventos, consulta placas, alertas" },
    { termo: ["relatório", "relatório de pesagem", "fluxo diário"], modulo: "Relatórios", path: "/relatorios", nivel: "atende", desc: "Relatórios: infrações, fluxo, discrepâncias, NF-e, Power BI, mapa" },
  ],
};

// Keywords genéricas que se aplicam a QUALQUER dos 3 sistemas
const CAPACIDADES_COMUNS = [
  { termo: ["internet", "link dedicado", "conectividade", "banda larga", "comunicação de dados"], nivel: "atende", desc: "Todos os sistemas operam via web (SaaS) com qualquer link internet" },
  { termo: ["vpn", "rede privada", "túnel"], nivel: "parcial", desc: "Operação via HTTPS/TLS — VPN site-to-site sob demanda" },
  { termo: ["disponibilidade", "uptime", "99%", "99,5%", "99,9%"], nivel: "atende", desc: "Hospedagem cloud com alta disponibilidade" },
  { termo: ["certidão", "atestado de capacidade técnica", "atestado técnico"], nivel: "n/a", desc: "Documentação administrativa — não é funcionalidade do sistema" },
  { termo: ["garantia", "garantia contratual", "seguro garantia"], nivel: "n/a", desc: "Termos contratuais — não é funcionalidade do sistema" },
  { termo: ["proposta", "planilha de preços", "bdi", "orçamento", "custo", "valor mensal", "valor global"], nivel: "n/a", desc: "Termos comerciais — não é funcionalidade do sistema" },
  { termo: ["cnpj", "certidão negativa", "débitos trabalhistas", "fazenda", "inss", "fgts"], nivel: "n/a", desc: "Documentação jurídica/fiscal — não é funcionalidade do sistema" },
  { termo: ["contrato social", "habilitação jurídica", "qualificação técnica", "documentação de habilitação"], nivel: "n/a", desc: "Documentação de habilitação — não é funcionalidade do sistema" },
];

// ─── MAPA DE SOLUÇÕES PARA GAPS ─────────────────────────────────
// Para cada tipo de gap, define a ação recomendada

const SOLUCOES_POR_CATEGORIA = {
  hardware: {
    nao_atende: { tipo: "adquirir", icon: "🛒", label: "Adquirir/Integrar", cor: "#f97316",
      template: (req) => `Adquirir equipamento compatível ou integrar hardware de terceiro via API. O AxHub suporta cadastro de novos tipos de equipamentos e integração via fabricante.`,
      acao: "Solicitar ao fornecedor de hardware a especificação técnica e validar compatibilidade com a API de integração do AxHub.",
      responsavel: "Engenharia + Comercial" },
    parcial: { tipo: "adaptar", icon: "🔧", label: "Adaptar/Configurar", cor: "#f59e0b",
      template: (req) => `Funcionalidade parcialmente coberta. Configurar parâmetros existentes ou solicitar customização pontual ao time de desenvolvimento.`,
      acao: "Abrir chamado interno de customização com especificação do requisito do edital.",
      responsavel: "Suporte + Desenvolvimento" },
  },
  software: {
    nao_atende: { tipo: "desenvolver", icon: "💻", label: "Desenvolver", cor: "#8b5cf6",
      template: (req) => `Desenvolver funcionalidade no roadmap do produto. Avaliar se é feature genérica (beneficia todos os clientes) ou customização específica para este contrato.`,
      acao: "Criar task no backlog de desenvolvimento com requisito detalhado e prazo alinhado ao cronograma do edital.",
      responsavel: "Produto + Desenvolvimento" },
    parcial: { tipo: "evoluir", icon: "📐", label: "Evoluir Feature", cor: "#f59e0b",
      template: (req) => `Feature existe mas precisa de evolução para atender 100% do requisito. Mapear gaps específicos e estimar esforço de desenvolvimento.`,
      acao: "Documentar o que já atende vs o que falta e estimar sprint de desenvolvimento.",
      responsavel: "Desenvolvimento" },
  },
  infraestrutura: {
    nao_atende: { tipo: "provisionar", icon: "☁️", label: "Provisionar Infra", cor: "#06b6d4",
      template: (req) => `Provisionar infraestrutura necessária (cloud, rede, certificados). Os sistemas Axion operam em Azure com escalabilidade sob demanda.`,
      acao: "Solicitar ao time de infra o provisionamento do recurso e documentar na proposta técnica.",
      responsavel: "Infraestrutura + DevOps" },
    parcial: { tipo: "configurar", icon: "⚙️", label: "Configurar", cor: "#f59e0b",
      template: (req) => `Infraestrutura base existe. Ajustar configurações (DNS, SSL, backup, SLA) conforme requisito específico do edital.`,
      acao: "Revisar configurações atuais e ajustar para atender o requisito.",
      responsavel: "DevOps" },
  },
  processos: {
    nao_atende: { tipo: "implantar", icon: "📋", label: "Implantar Processo", cor: "#ec4899",
      template: (req) => `Definir e documentar o processo operacional conforme requisito. Pode envolver criação de POP (Procedimento Operacional Padrão) e treinamento da equipe.`,
      acao: "Elaborar POP específico e incluir na proposta como compromisso de implantação.",
      responsavel: "Operações + Qualidade" },
    parcial: { tipo: "adequar", icon: "📝", label: "Adequar Processo", cor: "#f59e0b",
      template: (req) => `Processo existe mas precisa de ajustes para conformidade total. Revisar POP atual e adaptar ao requisito do edital.`,
      acao: "Revisar processo existente e documentar as adequações necessárias.",
      responsavel: "Operações" },
  },
  funcoes: {
    nao_atende: { tipo: "contratar", icon: "👤", label: "Alocar Equipe", cor: "#14b8a6",
      template: (req) => `Alocar profissional com a qualificação exigida. Avaliar se é possível via equipe atual ou se precisa contratação/terceirização.`,
      acao: "Verificar disponibilidade na equipe atual ou iniciar processo seletivo/terceirização.",
      responsavel: "RH + Operações" },
    parcial: { tipo: "capacitar", icon: "🎓", label: "Capacitar Equipe", cor: "#f59e0b",
      template: (req) => `Equipe existe mas precisa de capacitação específica. Planejar treinamento ou certificação complementar.`,
      acao: "Agendar treinamento/certificação para a equipe designada.",
      responsavel: "RH + Gestão" },
  },
  documentos: {
    nao_atende: { tipo: "providenciar", icon: "📄", label: "Providenciar Doc", cor: "#64748b",
      template: (req) => `Providenciar documentação exigida. Verificar prazos de emissão e validade junto aos órgãos competentes.`,
      acao: "Solicitar emissão do documento junto ao órgão competente com antecedência.",
      responsavel: "Jurídico + Administrativo" },
    parcial: { tipo: "atualizar", icon: "🔄", label: "Atualizar Doc", cor: "#f59e0b",
      template: (req) => `Documento existe mas pode estar desatualizado ou incompleto. Verificar validade e solicitar atualização se necessário.`,
      acao: "Verificar validade dos documentos existentes e renovar se necessário.",
      responsavel: "Administrativo" },
  },
  normas: {
    nao_atende: { tipo: "adequar", icon: "📜", label: "Adequar à Norma", cor: "#a855f7",
      template: (req) => `Verificar conformidade com a norma/resolução citada. Pode exigir homologação, certificação ou atualização do sistema.`,
      acao: "Consultar a norma específica e mapear os ajustes necessários no produto.",
      responsavel: "Engenharia + Qualidade" },
    parcial: { tipo: "complementar", icon: "📎", label: "Complementar", cor: "#f59e0b",
      template: (req) => `Conformidade parcial com a norma. Identificar cláusulas específicas não atendidas e planejar adequação.`,
      acao: "Detalhar os pontos da norma não cobertos e estimar esforço de adequação.",
      responsavel: "Engenharia" },
  },
  comercial: {
    nao_atende: { tipo: "negociar", icon: "💰", label: "Tratar Comercial", cor: "#eab308",
      template: (req) => `Requisito comercial/financeiro que precisa de análise pela área comercial. Avaliar viabilidade de atendimento na proposta.`,
      acao: "Encaminhar para análise comercial e incluir na composição de preços.",
      responsavel: "Comercial + Financeiro" },
    parcial: { tipo: "ajustar", icon: "📊", label: "Ajustar Proposta", cor: "#f59e0b",
      template: (req) => `Proposta cobre parcialmente. Revisar composição de custos e ajustar para atender o requisito.`,
      acao: "Revisar planilha de custos e ajustar a proposta comercial.",
      responsavel: "Comercial" },
  },
};

// Soluções específicas para capacidades "parcial" conhecidas
const SOLUCOES_PARCIAIS_ESPECIFICAS = {
  "display": { descricao: "Integrar com módulo de PMV (Painel de Mensagem Variável) via API de equipamentos. O AxHub suporta cadastro de tipos de equipamento customizados.", acao: "Configurar tipo de equipamento PMV e integrar via API do fabricante.", prazo: "2-4 semanas" },
  "nobreak": { descricao: "Cadastrar nobreaks como acessórios vinculados ao equipamento principal. Para monitoramento dedicado, integrar via SNMP ou API.", acao: "Criar categoria de acessório 'Nobreak' e configurar alertas de status.", prazo: "1-2 semanas" },
  "manutenção": { descricao: "O monitoramento online detecta equipamentos offline. Para ordens de serviço formais, integrar com sistema de OS ou usar Jitbit como helpdesk de campo.", acao: "Configurar alertas de indisponibilidade + workflow de OS via Jitbit.", prazo: "1-2 semanas" },
  "treinamento": { descricao: "Documentação completa no portal AxHub Docs + AxionIA para dúvidas. Para e-learning formal, gravar videoaulas das operações principais.", acao: "Gravar série de vídeos tutoriais (triagem, exportação, relatórios) e disponibilizar no portal.", prazo: "2-4 semanas" },
  "vpn": { descricao: "Operação via HTTPS/TLS com certificado SSL. VPN site-to-site pode ser configurada sob demanda para clientes com requisito específico.", acao: "Provisionar VPN site-to-site se exigido pelo edital.", prazo: "1 semana" },
};

/**
 * Gera solução recomendada para um item "nao_atende" ou "parcial"
 */
function gerarSolucao(item, matchInfo) {
  const cat = item.categoria || "software";
  const stats = [item.statusAxHub, item.statusAxTon, item.statusAxCross];
  const temParcial = stats.some(s => s === "parcial");
  const todosNA = stats.every(s => s === "n/a");

  // Se todos N/A (doc/comercial), não precisa de solução técnica
  if (todosNA) return null;

  const nivelGap = temParcial ? "parcial" : "nao_atende";
  const templateCat = SOLUCOES_POR_CATEGORIA[cat]?.[nivelGap] || SOLUCOES_POR_CATEGORIA.software[nivelGap];

  // Verificar se há solução específica para capacidade parcial
  let solucaoEspecifica = null;
  if (matchInfo && matchInfo.nivel === "parcial") {
    const lower = item.requisito?.toLowerCase() || "";
    for (const [key, sol] of Object.entries(SOLUCOES_PARCIAIS_ESPECIFICAS)) {
      if (lower.includes(key)) {
        solucaoEspecifica = sol;
        break;
      }
    }
  }

  return {
    tipo: templateCat.tipo,
    icon: templateCat.icon,
    label: templateCat.label,
    cor: templateCat.cor,
    descricao: solucaoEspecifica?.descricao || templateCat.template(item.requisito),
    acao: solucaoEspecifica?.acao || templateCat.acao,
    prazo: solucaoEspecifica?.prazo || (nivelGap === "parcial" ? "1-2 semanas" : "2-6 semanas"),
    responsavel: templateCat.responsavel,
    complexidade: nivelGap === "parcial" ? "baixa" : (cat === "software" ? "alta" : "media"),
  };
}

// ─── 2. DE-PARA (EDITAL vs PROJETOS) ───────────────────────────

async function gerarDeParaProjetos(textoEdital, categorias, produtoAlvo = null) {
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

  const prompt = `Você é um analista técnico de licitações de fiscalização eletrônica veicular.

CONTEXTO: Tenho 3 produtos:
- AxHub: ${CAPACIDADES_AXHUB.modulos.join(", ")} (${CAPACIDADES_AXHUB.totalTelas} telas)
- AxTon: ${CAPACIDADES_AXTON.modulos.join(", ")} (${CAPACIDADES_AXTON.totalTelas} telas)
- AxCross: ${CAPACIDADES_AXCROSS.modulos.join(", ")} (${CAPACIDADES_AXCROSS.totalTelas} telas)${focoProduto}

DOCUMENTAÇÃO RESUMIDA:
AxHub: ${docsAxHub.slice(0, 2000)}
AxTon: ${docsAxTon.slice(0, 1500)}
AxCross: ${docsAxCross.slice(0, 1500)}

REQUISITOS DO EDITAL (${todosRequisitos.length} itens):
${todosRequisitos.slice(0, 60).map((r, i) => `${i + 1}. [${r.categoria}] ${r.texto}`).join("\n")}

Gere o DE-PARA em JSON:
{
  "itens": [
    {
      "requisito": "texto do requisito",
      "categoria": "categoria",
      "statusAxHub": "atende|parcial|nao_atende|n/a",
      "statusAxTon": "atende|parcial|nao_atende|n/a",
      "statusAxCross": "atende|parcial|nao_atende|n/a",
      "ondeAtende": "módulo/tela específica onde atende",
      "lacuna": "o que falta implementar (se não atende)",
      "esforco": "baixo|medio|alto",
      "prioridade": "critica|alta|media|baixa",
      "validacao": { "modulo": "nome", "path": "/caminho", "teste": "como validar" }
    }
  ],
  "resumo": {
    "totalRequisitos": N,
    "atendeCompleto": N,
    "atendeParcial": N,
    "naoAtende": N,
    "percentualCobertura": N
  },
  "diagnosticoPorCategoria": {
    "nomeCategoria": { "atende": N, "parcial": N, "naoAtende": N, "total": N, "cobertura": N }
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
    const parsed = JSON.parse(response.choices[0].message.content);
    if (!parsed.diagnosticoPorCategoria) {
      parsed.diagnosticoPorCategoria = calcularDiagnosticoPorCategoria(parsed.itens);
    }
    return parsed;
  } catch (err) {
    console.error("[De-Para] IA falhou:", err.message, "— usando mapeamento local avançado");
    return gerarDeParaLocal(todosRequisitos, produtoAlvo);
  }
}

/**
 * Matching avançado: pontua um requisito contra as capacidades de um produto
 * Retorna { nivel, score, match, modulo, path, desc }
 */
function matchRequisito(texto, capacidades) {
  const lower = texto.toLowerCase();
  let melhorMatch = null;
  let melhorScore = 0;

  for (const cap of capacidades) {
    for (const t of cap.termo) {
      if (lower.includes(t.toLowerCase())) {
        // Score: match exato com termo longo vale mais
        const score = t.length + (cap.nivel === "atende" ? 20 : cap.nivel === "parcial" ? 10 : 0);
        if (score > melhorScore) {
          melhorScore = score;
          melhorMatch = cap;
        }
      }
    }
  }

  // Segundo pass: verificar capacidades comuns
  if (!melhorMatch) {
    for (const cap of CAPACIDADES_COMUNS) {
      for (const t of cap.termo) {
        if (lower.includes(t.toLowerCase())) {
          return { nivel: cap.nivel, score: t.length, match: t, modulo: "Comum", path: null, desc: cap.desc };
        }
      }
    }
  }

  if (melhorMatch) {
    return {
      nivel: melhorMatch.nivel,
      score: melhorScore,
      match: melhorMatch.termo[0],
      modulo: melhorMatch.modulo,
      path: melhorMatch.path,
      desc: melhorMatch.desc,
    };
  }

  return null;
}

/**
 * De-Para local AVANÇADO (fallback sem IA)
 * Usa mapa de capacidades reais dos 3 produtos com scoring
 */
function gerarDeParaLocal(requisitos, produtoAlvo = null) {
  let atende = 0, parcial = 0, naoAtende = 0;
  const diagnostico = {};

  const itens = requisitos.slice(0, 120).map(r => {
    const matchHub = matchRequisito(r.texto, CAPACIDADES_AXHUB.funcionalidades);
    const matchTon = matchRequisito(r.texto, CAPACIDADES_AXTON.funcionalidades);
    const matchCross = matchRequisito(r.texto, CAPACIDADES_AXCROSS.funcionalidades);

    // Determinar status de cada produto
    const getStatus = (match, produto) => {
      if (produtoAlvo && produto !== produtoAlvo) {
        // Ainda mostrar se atende, mas não é o foco
        return match ? match.nivel : "n/a";
      }
      return match ? match.nivel : "nao_atende";
    };

    let statusAxHub = getStatus(matchHub, "axhub");
    let statusAxTon = getStatus(matchTon, "axton");
    let statusAxCross = getStatus(matchCross, "axcross");

    // Se nenhum match e temos capacidades comuns
    const matchComum = matchRequisito(r.texto, []);
    if (!matchHub && !matchTon && !matchCross && matchComum) {
      if (matchComum.nivel === "n/a") {
        statusAxHub = "n/a";
        statusAxTon = "n/a";
        statusAxCross = "n/a";
      }
    }

    // Determinar o melhor match para "ondeAtende" e "validacao"
    const matches = [
      { prod: "AxHub", match: matchHub, status: statusAxHub },
      { prod: "AxTon", match: matchTon, status: statusAxTon },
      { prod: "AxCross", match: matchCross, status: statusAxCross },
    ].filter(m => m.match);

    const melhor = matches.sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0))[0];

    let ondeAtende = "";
    let lacuna = "";
    let validacao = null;

    if (melhor) {
      ondeAtende = `${melhor.prod} → ${melhor.match.modulo}: ${melhor.match.desc}`;
      if (melhor.match.path) {
        validacao = {
          modulo: melhor.match.modulo,
          path: melhor.match.path,
          produto: melhor.prod,
          teste: `Acessar ${melhor.prod} → ${melhor.match.modulo} (${melhor.match.path}) e verificar funcionalidade`,
        };
      }
    }

    // Contar status geral (considerando produto alvo ou todos)
    const statsArr = produtoAlvo
      ? [produtoAlvo === "axhub" ? statusAxHub : produtoAlvo === "axton" ? statusAxTon : statusAxCross]
      : [statusAxHub, statusAxTon, statusAxCross];

    const temAtende = statsArr.some(s => s === "atende");
    const temParcial = statsArr.some(s => s === "parcial");
    const todosNA = statsArr.every(s => s === "n/a");

    if (temAtende) atende++;
    else if (temParcial) parcial++;
    else if (!todosNA) naoAtende++;
    // Se todos n/a, não conta em nenhuma categoria (é irrelevante)

    if (!lacuna && !temAtende && !temParcial && !todosNA) {
      lacuna = `Funcionalidade não mapeada nos produtos${produtoAlvo ? ` (${produtoAlvo})` : ""}. Avaliar se é gap real ou se o requisito está coberto indiretamente.`;
    }

    // Criticidade baseada em palavras do texto
    const lower = r.texto.toLowerCase();
    let prioridade = "media";
    if (lower.match(/obrigatório|obrigatoriamente|deverá|imprescindível|eliminatório|desclassific/)) prioridade = "critica";
    else if (lower.match(/importante|necessário|indispensável|essencial/)) prioridade = "alta";
    else if (lower.match(/poderá|facultat|opcional|complementar/)) prioridade = "baixa";

    let esforco = "medio";
    if (temAtende) esforco = "baixo";
    else if (temParcial) esforco = "medio";
    else if (!todosNA) esforco = "alto";

    // Agregar diagnóstico por categoria
    const cat = r.categoria || "geral";
    if (!diagnostico[cat]) diagnostico[cat] = { atende: 0, parcial: 0, naoAtende: 0, naPuro: 0, total: 0 };
    diagnostico[cat].total++;
    if (temAtende) diagnostico[cat].atende++;
    else if (temParcial) diagnostico[cat].parcial++;
    else if (todosNA) diagnostico[cat].naPuro++;
    else diagnostico[cat].naoAtende++;

    // Gerar solução para itens que não atendem ou atendem parcialmente
    const itemPreliminar = {
      requisito: r.texto.slice(0, 250),
      categoria: r.categoria,
      statusAxHub, statusAxTon, statusAxCross,
    };
    const solucao = (!temAtende && !todosNA)
      ? gerarSolucao(itemPreliminar, melhor?.match || null)
      : null;

    return {
      requisito: r.texto.slice(0, 250),
      categoria: r.categoria,
      statusAxHub,
      statusAxTon,
      statusAxCross,
      ondeAtende,
      lacuna,
      esforco,
      prioridade,
      validacao,
      solucao,
    };
  });

  const totalRelevantes = atende + parcial + naoAtende;
  const pctCobertura = totalRelevantes > 0 ? Math.round(((atende + parcial * 0.5) / totalRelevantes) * 100) : 0;

  // Diagnóstico formatado
  const diagnosticoPorCategoria = {};
  for (const [cat, d] of Object.entries(diagnostico)) {
    const catLabel = CATEGORIAS[cat]?.label || cat;
    const relevantes = d.atende + d.parcial + d.naoAtende;
    diagnosticoPorCategoria[cat] = {
      label: catLabel,
      icon: CATEGORIAS[cat]?.icon || "📌",
      atende: d.atende,
      parcial: d.parcial,
      naoAtende: d.naoAtende,
      naPuro: d.naPuro,
      total: d.total,
      cobertura: relevantes > 0 ? Math.round(((d.atende + d.parcial * 0.5) / relevantes) * 100) : 100,
    };
  }

  return {
    itens,
    resumo: {
      totalRequisitos: requisitos.length,
      atendeCompleto: atende,
      atendeParcial: parcial,
      naoAtende: naoAtende,
      percentualCobertura: pctCobertura,
    },
    diagnosticoPorCategoria,
    _fallback: true,
    _nota: `Análise por matching avançado: ${CAPACIDADES_AXHUB.funcionalidades.length} capacidades AxHub, ${CAPACIDADES_AXCROSS.funcionalidades.length} AxCross, ${CAPACIDADES_AXTON.funcionalidades.length} AxTon mapeadas. Valide nos links fornecidos.`,
  };
}

function calcularDiagnosticoPorCategoria(itens) {
  const diagnostico = {};
  for (const item of itens || []) {
    const cat = item.categoria || "geral";
    if (!diagnostico[cat]) diagnostico[cat] = { atende: 0, parcial: 0, naoAtende: 0, naPuro: 0, total: 0 };
    diagnostico[cat].total++;
    const stats = [item.statusAxHub, item.statusAxTon, item.statusAxCross];
    if (stats.some(s => s === "atende")) diagnostico[cat].atende++;
    else if (stats.some(s => s === "parcial")) diagnostico[cat].parcial++;
    else if (stats.every(s => s === "n/a")) diagnostico[cat].naPuro++;
    else diagnostico[cat].naoAtende++;
  }
  const result = {};
  for (const [cat, d] of Object.entries(diagnostico)) {
    const label = CATEGORIAS[cat]?.label || cat;
    const relevantes = d.atende + d.parcial + d.naoAtende;
    result[cat] = { label, icon: CATEGORIAS[cat]?.icon || "📌", atende: d.atende, parcial: d.parcial, naoAtende: d.naoAtende, naPuro: d.naPuro, total: d.total, cobertura: relevantes > 0 ? Math.round(((d.atende + d.parcial * 0.5) / relevantes) * 100) : 100 };
  }
  return result;
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

async function analisarConcorrentes(textoEdital, categorias, regiaoEdital, dePara = null) {
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

    if (!response) return gerarConcorrentesLocal(categorias, regiaoEdital, dePara);
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("[Concorrentes] IA falhou:", err.message, "— usando análise local");
    return gerarConcorrentesLocal(categorias, regiaoEdital, dePara);
  }
}

/**
 * Matching de requisito contra capacidades de concorrente (mesmo algoritmo da Axion)
 */
function matchRequisitoConcorrente(texto, funcionalidades) {
  const lower = texto.toLowerCase();
  let melhorMatch = null;
  let melhorScore = 0;

  for (const cap of funcionalidades) {
    for (const t of cap.termo) {
      if (lower.includes(t.toLowerCase())) {
        const score = t.length + (cap.nivel === "atende" ? 20 : cap.nivel === "parcial" ? 10 : 0);
        if (score > melhorScore) {
          melhorScore = score;
          melhorMatch = cap;
        }
      }
    }
  }

  return melhorMatch ? { nivel: melhorMatch.nivel, score: melhorScore } : null;
}

/**
 * Análise de concorrentes local AVANÇADA (fallback sem IA)
 * Usa o MESMO algoritmo de matching da Axion para todos os concorrentes
 * Gera comparativo por categoria
 */
function gerarConcorrentesLocal(categorias, regiaoEdital, dePara = null) {
  const regLower = (regiaoEdital || "").toLowerCase();

  // Extrair requisitos POR CATEGORIA para comparativo
  const reqPorCategoria = {};
  let totalReqs = 0;
  for (const [catKey, catData] of Object.entries(categorias)) {
    const itens = (catData.itens || []).map(item => item.texto);
    reqPorCategoria[catKey] = itens;
    totalReqs += itens.length;
  }
  if (totalReqs === 0) totalReqs = 1;

  // Dados do dePara para Axion
  const axionPct = dePara?.resumo?.percentualCobertura || null;
  const axionAtende = dePara?.resumo?.atendeCompleto || 0;
  const axionParcial = dePara?.resumo?.atendeParcial || 0;
  const axionNaoAtende = dePara?.resumo?.naoAtende || 0;

  // Calcular score da Axion por categoria (do dePara)
  const axionPorCategoria = {};
  const diagSource = dePara?.diagnosticoPorCategoria || dePara?.diagnostico || {};
  for (const [catKey, catDiag] of Object.entries(diagSource)) {
    axionPorCategoria[catKey] = {
      atende: catDiag.atende || 0,
      parcial: catDiag.parcial || 0,
      naoAtende: catDiag.naoAtende || 0,
      total: (catDiag.atende || 0) + (catDiag.parcial || 0) + (catDiag.naoAtende || 0),
    };
    const tot = axionPorCategoria[catKey].total || 1;
    axionPorCategoria[catKey].pct = catDiag.cobertura != null
      ? catDiag.cobertura
      : Math.round(((catDiag.atende || 0) + (catDiag.parcial || 0) * 0.5) / tot * 100);
  }

  // Score de cada concorrente — usando matchRequisito real por categoria
  const ranking = CONCORRENTES.map(c => {
    let atendeTotal = 0;
    let parcialTotal = 0;
    let naoAtendeTotal = 0;
    const porCategoria = {};
    const categoriasFortes = [];
    const categoriasFracas = [];

    for (const [catKey, itens] of Object.entries(reqPorCategoria)) {
      let catAtende = 0, catParcial = 0, catNao = 0;

      for (const textoReq of itens) {
        const m = matchRequisitoConcorrente(textoReq, c.funcionalidades || []);
        if (m && m.nivel === "atende") { catAtende++; atendeTotal++; }
        else if (m && m.nivel === "parcial") { catParcial++; parcialTotal++; }
        else { catNao++; naoAtendeTotal++; }
      }

      const catTotal = itens.length || 1;
      const catPct = Math.round(((catAtende + catParcial * 0.5) / catTotal) * 100);
      porCategoria[catKey] = { atende: catAtende, parcial: catParcial, naoAtende: catNao, total: itens.length, pct: catPct };

      // Marcar categorias fortes e fracas
      if (catPct >= 50) categoriasFortes.push({ cat: catKey, pct: catPct });
      if (catPct < 20 && itens.length > 3) categoriasFracas.push({ cat: catKey, pct: catPct });
    }

    const pctGlobal = Math.round(((atendeTotal + parcialTotal * 0.5) / totalReqs) * 100);

    // Região
    const regioesConcorrente = c.regiao.toLowerCase().split("/").map(r => r.trim());
    const isLocal = regLower && regioesConcorrente.some(r => r !== "nacional" && r !== "internacional" && regLower.includes(r));
    const isInternacional = regioesConcorrente.some(r => r === "internacional");
    const mesmaRegiao = regLower && regioesConcorrente.some(r => regLower.includes(r) || r.includes("nacional"));

    let distancia = "nacional";
    if (isLocal) distancia = "local";
    else if (isInternacional) distancia = "internacional";
    else if (mesmaRegiao) distancia = "estadual";

    // Comparar contra Axion por categoria — identificar onde concorrente é MELHOR
    const superaAxionEm = [];
    const inferiorAxionEm = [];
    for (const [catKey, catScore] of Object.entries(porCategoria)) {
      const axionCat = axionPorCategoria[catKey];
      if (axionCat) {
        if (catScore.pct > axionCat.pct + 5) {
          superaAxionEm.push({ cat: catKey, concPct: catScore.pct, axionPct: axionCat.pct, diff: catScore.pct - axionCat.pct });
        } else if (catScore.pct < axionCat.pct - 10) {
          inferiorAxionEm.push({ cat: catKey, concPct: catScore.pct, axionPct: axionCat.pct });
        }
      }
    }

    // Pontos fortes e fracos contextuais
    const fortes = [c.forca];
    if (c.diferencial) fortes.push(c.diferencial);
    if (isLocal) fortes.push("Presença local na região do edital");
    if (categoriasFortes.length > 0) fortes.push(`Forte em: ${categoriasFortes.map(cf => `${CATEGORIAS[cf.cat]?.label || cf.cat} (${cf.pct}%)`).join(", ")}`);
    if (superaAxionEm.length > 0) fortes.push(`Supera Axion em: ${superaAxionEm.map(s => `${CATEGORIAS[s.cat]?.label || s.cat} (+${s.diff}pp)`).join(", ")}`);

    const fracos = [c.fraqueza];
    if (categoriasFracas.length > 0) fracos.push(`Fraco em: ${categoriasFracas.map(cf => `${CATEGORIAS[cf.cat]?.label || cf.cat} (${cf.pct}%)`).join(", ")}`);
    if (isInternacional) fracos.push("Custo e suporte internacional dificultam");

    // Nível de ameaça
    let nivelAmeaca = "baixo";
    if (pctGlobal >= 40 || superaAxionEm.length >= 2) nivelAmeaca = "alto";
    else if (pctGlobal >= 25 || superaAxionEm.length >= 1) nivelAmeaca = "medio";
    if (isLocal && pctGlobal >= 20) nivelAmeaca = nivelAmeaca === "baixo" ? "medio" : "alto";

    return {
      empresa: c.nome,
      percentualAtendimento: pctGlobal,
      pontosFortes: fortes,
      pontosFracos: fracos,
      conflitoPotencial: isLocal || nivelAmeaca === "alto",
      motivoConflito: isLocal ? `Concorrente local na mesma região (${c.regiao})` : nivelAmeaca === "alto" ? `Alta aderência ao edital (${pctGlobal}%)` : "",
      distanciaRegional: distancia,
      segmento: c.segmento,
      site: c.site,
      nivelAmeaca,
      porCategoria,
      superaAxionEm,
      categoriasFortes: categoriasFortes.map(cf => cf.cat),
      reqAtende: atendeTotal,
      reqParcial: parcialTotal,
      reqNaoAtende: naoAtendeTotal,
    };
  });

  // Ordenar por % de atendimento (maior primeiro)
  ranking.sort((a, b) => b.percentualAtendimento - a.percentualAtendimento);

  // Quem é mais aderente
  const melhor = ranking[0];
  const suspeitaDirecionamento = melhor && melhor.percentualAtendimento > 60;
  const concorrentesMaisAderentes = ranking.filter(r => axionPct !== null && r.percentualAtendimento > axionPct);

  // Alertas
  const alertas = [];
  ranking.forEach(r => {
    if (r.nivelAmeaca === "alto") {
      alertas.push({ empresa: r.empresa, tipo: "alta_aderencia", descricao: `${r.empresa} tem ${r.percentualAtendimento}% de aderência — ameaça forte`, risco: "alto" });
    }
    if (r.superaAxionEm.length > 0) {
      alertas.push({ empresa: r.empresa, tipo: "supera_axion", descricao: `Supera Axion em ${r.superaAxionEm.map(s => CATEGORIAS[s.cat]?.label || s.cat).join(", ")}`, risco: r.superaAxionEm.length >= 2 ? "alto" : "medio" });
    }
    if (r.distanciaRegional === "local") {
      alertas.push({ empresa: r.empresa, tipo: "mesma_regiao", descricao: `Concorrente local — ${r.empresa} (${r.distanciaRegional})`, risco: "medio" });
    }
  });

  // Gerar matriz comparativa por categoria
  const matrizCategoria = {};
  for (const catKey of Object.keys(reqPorCategoria)) {
    matrizCategoria[catKey] = {
      label: CATEGORIAS[catKey]?.label || catKey,
      icon: CATEGORIAS[catKey]?.icon || "📌",
      totalReqs: reqPorCategoria[catKey].length,
      axion: axionPorCategoria[catKey] || { pct: 0, atende: 0 },
      concorrentes: ranking.slice(0, 5).map(r => ({
        empresa: r.empresa,
        pct: r.porCategoria[catKey]?.pct || 0,
        atende: r.porCategoria[catKey]?.atende || 0,
      })),
    };
  }

  // Posição Axion
  const vantagensAxion = ["SaaS unificado (AxHub + AxTon + AxCross)", "IA integrada com análise de editais", "Helpdesk automatizado com AxionIA"];
  const gapsAxion = [];

  if (axionPct !== null) {
    vantagensAxion.push(`${axionPct}% de cobertura confirmada por De-Para`);
    if (axionAtende > 0) vantagensAxion.push(`${axionAtende} requisitos atendidos integralmente`);
    if (axionNaoAtende > 0) gapsAxion.push(`${axionNaoAtende} requisito(s) não atendido(s) — ver Plano de Ação`);
    if (axionParcial > 0) gapsAxion.push(`${axionParcial} parcialmente atendido(s)`);
  }

  if (concorrentesMaisAderentes.length > 0) {
    gapsAxion.push(`⚠️ ${concorrentesMaisAderentes.length} concorrente(s) com aderência superior: ${concorrentesMaisAderentes.map(c => `${c.empresa} (${c.percentualAtendimento}%)`).join(", ")}`);
  } else if (axionPct !== null && melhor) {
    vantagensAxion.push(`Cobertura superior a todos os concorrentes mapeados (melhor: ${melhor.empresa} ${melhor.percentualAtendimento}%)`);
  }

  if (gapsAxion.length === 0) gapsAxion.push("Sem gaps críticos identificados");

  return {
    ranking,
    alertasConflito: alertas,
    matrizCategoria,
    quemAtende100: {
      empresa: suspeitaDirecionamento ? melhor.empresa : "Nenhum concorrente atende 100%",
      justificativa: suspeitaDirecionamento
        ? `${melhor.empresa} atende ${melhor.percentualAtendimento}% — maior aderência entre concorrentes`
        : "Nenhum concorrente mapeado cobre integralmente os requisitos",
      suspeitaDirecionamento,
      evidencias: suspeitaDirecionamento
        ? [`Cobertura de ${melhor.percentualAtendimento}%`, `Segmento: ${melhor.segmento}`, `Forte em: ${melhor.categoriasFortes.map(c => CATEGORIAS[c]?.label || c).join(", ")}`, melhor.distanciaRegional === "local" ? "Concorrente local" : ""].filter(Boolean)
        : [],
    },
    posicaoAxion: {
      percentualAtendimento: axionPct,
      vantagensCompetitivas: vantagensAxion,
      gapsVsConcorrentes: gapsAxion,
    },
    _nota: `Análise competitiva: ${totalReqs} requisitos do edital analisados com o mesmo algoritmo de matching para Axion e ${CONCORRENTES.length} concorrentes. Comparativo por ${Object.keys(reqPorCategoria).length} categorias.`,
  };
}

// ─── 4. VALIDAÇÃO DE MERCADO SaaS ───────────────────────────────

async function validarMercadoSaaS(textoEdital, categorias, dePara = null, concorrentes = null) {
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

    if (!response) return gerarMercadoLocal(categorias, dePara, concorrentes);
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("[Mercado] Erro:", err.message, "— usando análise local");
    return gerarMercadoLocal(categorias, dePara, concorrentes);
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
function gerarMercadoLocal(categorias, dePara = null, concorrentes = null) {
  const totalReqs = Object.values(categorias).reduce((s, c) => s + c.total, 0);

  // Percentuais da Axion (do dePara)
  const axPct = dePara?.resumo?.percentualCobertura || 0;
  const axAtende = dePara?.resumo?.atendeCompleto || 0;
  const axParcial = dePara?.resumo?.atendeParcial || 0;
  const axNao = dePara?.resumo?.naoAtende || 0;
  const axTotal = axAtende + axParcial + axNao;

  // Melhor concorrente
  const ranking = concorrentes?.ranking || [];
  const melhor = ranking[0];
  const melhorPct = melhor?.percentualAtendimento || 0;
  const concComAmeaca = ranking.filter(r => r.nivelAmeaca === "alto").length;

  // Mensagem comparativa dinâmica
  let comparacao = "";
  if (axTotal > 0 && melhor) {
    comparacao = `Nenhum concorrente mapeado atende 100% dos ${axTotal} requisitos do edital. `
      + `A Axion Tecnologia cobre ${axPct}% dos requisitos (${axAtende} atende, ${axParcial} parcial, ${axNao} não atende). `
      + `O concorrente mais aderente é ${melhor.empresa} com ${melhorPct}%`
      + (melhorPct < axPct ? ` — ${axPct - melhorPct}pp abaixo da Axion.` : melhorPct === axPct ? ` — empatado com Axion.` : ` — ${melhorPct - axPct}pp acima da Axion.`)
      + (concComAmeaca > 0 ? ` ${concComAmeaca} concorrente(s) com nível de ameaça alto.` : "");
  } else if (axTotal > 0) {
    comparacao = `A Axion Tecnologia cobre ${axPct}% dos ${axTotal} requisitos do edital: ${axAtende} atendido(s), ${axParcial} parcial(is), ${axNao} não atendido(s). Nenhum concorrente mapeado cobre integralmente todos os requisitos.`;
  } else {
    comparacao = "Nenhum sistema mapeado no mercado atende integralmente todos os requisitos deste edital (análise local — sem validação IA).";
  }

  return {
    concorrenteDireto: {
      existe: concComAmeaca > 0,
      empresas: ranking.filter(r => r.nivelAmeaca === "alto").map(r => r.empresa),
      comparacao,
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
