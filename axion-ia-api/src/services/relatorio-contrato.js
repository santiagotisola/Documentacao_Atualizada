/**
 * relatorio-contrato.js
 * Gera relatórios técnicos por contrato usando IA.
 * 
 * Tipos de relatório suportados:
 *   - viabilidade-integracao: Analisa se a infra atual atende requisitos externos
 *   - gap-analysis: Identifica lacunas entre o que existe e o que é necessário
 *   - resumo-operacional: Panorama geral do contrato
 */

import OpenAI from "openai";
import RelatorioContrato from "../models/relatorio-contrato.model.js";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ─── Dados dos sites (espelho do panel sitesData) ──────────────────────────────
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITES_PATH = path.resolve(__dirname, "../../../axion-ia-panel/src/data/sitesData.js");

let _sitesCache = null;

async function carregarSites() {
  if (_sitesCache) return _sitesCache;
  try {
    // Importa dinamicamente o módulo ES
    const mod = await import(`file://${SITES_PATH.replace(/\\/g, "/")}`);
    _sitesCache = {
      axhub: mod.AXHUB_SITES || [],
      axcross: mod.AXCROSS_SITES || [],
    };
  } catch {
    _sitesCache = { axhub: [], axcross: [] };
  }
  return _sitesCache;
}

// ─── Schema do banco AxHub por tabela ──────────────────────────────────────────
const SCHEMA_AXHUB = {
  TBPassagens: {
    campos: ["Id", "DataCriacao", "DataAtualizacao", "DataHoraPassagem", "Operacao_id", "Equipamento_id", "Faixa_id", "ClassificacaoVeiculo_id", "PlacaVeiculo", "VelocidadeMedida", "VelocidadeConsiderada", "TamanhoVeiculo", "QuantidadeEixo", "Infracao_id", "LoteImportacao_id", "PesoBrutoTotal", "DistanciaPorEixo", "DistanciaEntreEixos", "IntervaloEntreVeiculos", "CaminhoImagem"],
    joins: ["TBEquipamentos (via Equipamento_id)", "TBFaixas (via Faixa_id)", "TBOperacoes (via Operacao_id)"],
  },
  TBEquipamentos: {
    campos: ["Id", "Codigo", "ModeloEquipamento_id", "TipoEquipamento_id", "ModoOperacao", "NumeroSerie", "NumeroCertificadoInmetro", "EmissaoCertificadoInmetro", "VencimentoCertificadoInmetro"],
    joins: ["TBModelosEquipamento", "TBTiposEquipamento", "TBGruposEquipamento"],
  },
  TBFaixas: {
    campos: ["Id", "NumeroFaixa", "Sentido", "Codigo", "Logradouro", "Numero", "Complemento", "Bairro", "Municipio", "CodigoMunicipio", "Uf", "Latitude", "Longitude", "CepFaixa"],
    joins: [],
  },
  TBLocais: {
    campos: ["Id", "Latitude", "Longitude", "Codigo", "Centroide", "Regiao_id"],
    joins: ["TBRegioes"],
  },
};

// ─── Tipos de relatório ──────────────────────────────────────────────────────
const TIPOS_RELATORIO = {
  "viabilidade-integracao": {
    label: "Viabilidade de Integração",
    descricao: "Analisa se a infraestrutura existente pode atender requisitos de um sistema externo",
    promptSistema: `Você é um engenheiro de integração sênior da Axion Tecnologia. 
Sua tarefa é analisar se a infraestrutura de dados existente no AxHub pode atender os requisitos de integração com um sistema externo.

Para cada campo solicitado, você deve:
1. Identificar se o campo existe no schema do AxHub
2. Indicar a tabela e coluna de origem
3. Indicar se precisa de JOIN e qual
4. Classificar como: DISPONIVEL, PARCIAL (precisa mapeamento/transformação), ou INDISPONIVEL (gap)
5. Propor solução para gaps

Responda SEMPRE em JSON estruturado com o formato:
{
  "resumo": "texto resumo executivo",
  "score_viabilidade": 0-100,
  "campos_analise": [
    {
      "campo_solicitado": "nome",
      "tipo_solicitado": "tipo",
      "obrigatorio": true/false,
      "status": "DISPONIVEL|PARCIAL|INDISPONIVEL",
      "fonte_axhub": "Tabela.Coluna ou null",
      "join_necessario": "descrição do join ou null",
      "transformacao": "descrição da transformação necessária ou null",
      "observacao": "nota adicional"
    }
  ],
  "gaps": ["lista de gaps críticos"],
  "solucao_proposta": "descrição da solução recomendada",
  "query_sql": "VIEW SQL proposta (se viável)",
  "opcoes_entrega": [
    {"opcao": "A", "titulo": "...", "esforco": "Baixo|Medio|Alto", "descricao": "..."}
  ],
  "proximos_passos": ["lista de ações recomendadas"]
}`,
  },
  "gap-analysis": {
    label: "Análise de Gaps",
    descricao: "Identifica lacunas entre requisitos e capacidades atuais do contrato",
    promptSistema: `Você é um analista técnico da Axion Tecnologia.
Analise os requisitos fornecidos e identifique gaps em relação às capacidades atuais do contrato/site AxHub.

Responda em JSON:
{
  "resumo": "texto resumo",
  "score_cobertura": 0-100,
  "requisitos_atendidos": [{"requisito": "...", "como": "..."}],
  "gaps_identificados": [{"requisito": "...", "severidade": "critico|medio|baixo", "proposta": "..."}],
  "recomendacoes": ["..."],
  "estimativa_esforco": "Baixo|Medio|Alto"
}`,
  },
  "resumo-operacional": {
    label: "Resumo Operacional",
    descricao: "Panorama geral do contrato com métricas e status",
    promptSistema: `Você é um gestor de contratos da Axion Tecnologia.
Gere um resumo operacional completo do contrato/site baseado nos dados fornecidos.

Responda em JSON:
{
  "resumo": "texto resumo executivo",
  "metricas": {"equipamentos": N, "fabricantes": [...], "passagens_dia": N, "bi_reports": N},
  "status_geral": "operacional|atencao|critico",
  "pontos_destaque": ["..."],
  "riscos": ["..."],
  "oportunidades": ["..."]
}`,
  },
};

// ─── Gerar relatório ──────────────────────────────────────────────────────────
export async function gerarRelatorio({ contrato, produto, tipo, contexto }) {
  const inicio = Date.now();

  if (!TIPOS_RELATORIO[tipo]) {
    throw new Error(`Tipo inválido. Use: ${Object.keys(TIPOS_RELATORIO).join(", ")}`);
  }

  const sites = await carregarSites();
  const site = [...sites.axhub, ...sites.axcross].find(s => s.id === contrato);
  
  const tipoConfig = TIPOS_RELATORIO[tipo];

  let resultado;
  let geradoPorIA = false;

  // Tentar gerar com OpenAI, senão usar fallback com dados do site
  if (openai) {
    try {
      // Monta contexto do site para o prompt
      const contextoSite = site ? JSON.stringify(site, null, 2) : `Site "${contrato}" — sem dados detalhados disponíveis`;
      const schemaInfo = JSON.stringify(SCHEMA_AXHUB, null, 2);

      const userPrompt = `## Contrato/Site: ${site?.nome || contrato} (${site?.estado || "?"})
## Órgão: ${site?.orgao || "Não identificado"}
## Produto: ${produto}
## Tipo de Análise: ${tipoConfig.label}

### Dados do Site:
${contextoSite}

### Schema do Banco AxHub (tabelas principais):
${schemaInfo}

### Contexto/Requisitos fornecidos pelo usuário:
${contexto}

Gere a análise completa no formato JSON especificado.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: tipoConfig.promptSistema },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      });

      const resultadoRaw = response.choices[0]?.message?.content || "{}";
      try {
        resultado = JSON.parse(resultadoRaw);
      } catch {
        resultado = { resumo: resultadoRaw, erro_parse: true };
      }
      geradoPorIA = true;
    } catch (err) {
      console.warn(`⚠️ [Relatório] OpenAI falhou (${err.message}), usando fallback local.`);
    }
  }

  // Fallback: gerar relatório básico com dados disponíveis do site
  if (!resultado) {
    resultado = gerarRelatorioLocal(site, contrato, produto, tipo, contexto);
  }

  // Gera markdown a partir do resultado
  const markdown = gerarMarkdown(resultado, tipo, site, contrato);

  const tempoMs = Date.now() - inicio;

  // Salva no MongoDB
  const doc = await RelatorioContrato.create({
    contrato,
    produto,
    tipo,
    titulo: `${tipoConfig.label} — ${site?.nome || contrato}`,
    contexto: contexto.substring(0, 5000),
    resultado,
    markdown,
    status: "concluido",
    metadados: {
      campos_disponiveis: resultado.campos_analise?.filter(c => c.status === "DISPONIVEL").length || 0,
      campos_faltantes: resultado.campos_analise?.filter(c => c.status === "INDISPONIVEL").length || 0,
      score_viabilidade: resultado.score_viabilidade || resultado.score_cobertura || 0,
      tempo_geracao_ms: tempoMs,
      gerado_por_ia: geradoPorIA,
    },
  });

  return doc;
}

// ─── Fallback: gerar relatório sem IA ─────────────────────────────────────────
function gerarRelatorioLocal(site, contrato, produto, tipo, contexto) {
  const nome = site?.nome || contrato;
  const orgao = site?.orgao || "Não identificado";
  const estado = site?.estado || "?";

  if (tipo === "resumo-operacional") {
    return {
      resumo: `Resumo operacional do contrato ${nome} (${estado}) — ${orgao}. Produto: ${produto}. ${site?.status === "ativo" ? "Contrato ativo e operacional." : `Status atual: ${site?.status || "indefinido"}.`}`,
      metricas: {
        equipamentos: site?.equipamentos?.total || site?.equipamentos || 0,
        fabricantes: site?.fabricantes || [],
        passagens_dia: site?.passagensDia || null,
        bi_reports: site?.bi?.length || 0,
        ocr: site?.ocr || null,
      },
      status_geral: site?.status === "ativo" ? "operacional" : "atencao",
      pontos_destaque: [
        site?.equipamentos?.total ? `${site.equipamentos.total} equipamentos ativos` : null,
        site?.fabricantes?.length ? `Fabricantes: ${site.fabricantes.join(", ")}` : null,
        site?.ocr ? `Índice de OCR: ${site.ocr}%` : null,
        site?.bi?.length ? `${site.bi.length} relatórios BI disponíveis` : null,
      ].filter(Boolean),
      riscos: [
        site?.status !== "ativo" ? `Site com status "${site?.status}" — pode requerer atenção` : null,
        !site?.ocr ? "Índice de OCR não disponível" : site.ocr < 80 ? `OCR abaixo de 80% (${site.ocr}%)` : null,
      ].filter(Boolean),
      oportunidades: [
        "Expansão de relatórios BI personalizados",
        "Automação de alertas operacionais",
      ],
      score_viabilidade: site?.status === "ativo" ? 80 : 50,
    };
  }

  if (tipo === "gap-analysis") {
    return {
      resumo: `Análise de gaps do contrato ${nome} (${estado}). Requisitos informados pelo usuário analisados em relação às capacidades existentes.`,
      score_cobertura: 60,
      requisitos_atendidos: [
        { requisito: "Monitoramento de equipamentos", como: "Dados disponíveis em TBEquipamentos" },
        { requisito: "Registro de passagens", como: "Disponível em TBPassagens com joins" },
      ],
      gaps_identificados: [
        { requisito: "Campos personalizados do contexto", severidade: "medio", proposta: "Avaliar mapeamento com IA quando disponível" },
      ],
      recomendacoes: [
        "Executar análise completa com IA para mapeamento detalhado de campos",
        "Verificar requisitos específicos manualmente no schema",
      ],
      estimativa_esforco: "Medio",
      score_viabilidade: 60,
    };
  }

  // viabilidade-integracao (padrão)
  return {
    resumo: `Análise de viabilidade de integração para ${nome} (${estado}) — ${orgao}. Dados do site disponíveis para consulta. Análise detalhada requer IA (OpenAI).`,
    score_viabilidade: site ? 65 : 30,
    campos_analise: [
      { campo_solicitado: "Passagens/Registros", tipo_solicitado: "dados", status: "DISPONIVEL", fonte_axhub: "TBPassagens", observacao: "Tabela principal de passagens" },
      { campo_solicitado: "Equipamentos", tipo_solicitado: "cadastro", status: "DISPONIVEL", fonte_axhub: "TBEquipamentos", observacao: `${site?.equipamentos?.total || 0} equipamentos` },
      { campo_solicitado: "Faixas/Locais", tipo_solicitado: "cadastro", status: "DISPONIVEL", fonte_axhub: "TBFaixas / TBLocais", observacao: "Dados georreferenciados" },
      { campo_solicitado: "Campos específicos do contexto", tipo_solicitado: "variável", status: "PARCIAL", fonte_axhub: "—", observacao: "Requer análise IA para mapeamento detalhado" },
    ],
    gaps: site ? [] : ["Dados do site não encontrados na base"],
    proximos_passos: [
      "Verificar quota da OpenAI para análise completa",
      "Validar campos específicos no banco de dados",
    ],
  };
}

// ─── Gerar Markdown legível ─────────────────────────────────────────────────
function gerarMarkdown(resultado, tipo, site, contrato) {
  const linhas = [];
  linhas.push(`# ${TIPOS_RELATORIO[tipo].label} — ${site?.nome || contrato}`);
  linhas.push(`**Gerado em:** ${new Date().toLocaleString("pt-BR")}`);
  linhas.push(`**Contrato:** ${site?.orgao || contrato} (${site?.estado || "?"})`);
  linhas.push(`**Produto:** ${site?.produto || "axhub"}`);
  linhas.push(`**URL:** ${site?.url || "—"}`);
  linhas.push("");

  if (resultado.resumo) {
    linhas.push("## Resumo Executivo");
    linhas.push(resultado.resumo);
    linhas.push("");
  }

  if (resultado.score_viabilidade != null) {
    linhas.push(`**Score de Viabilidade:** ${resultado.score_viabilidade}/100`);
    linhas.push("");
  }
  if (resultado.score_cobertura != null) {
    linhas.push(`**Score de Cobertura:** ${resultado.score_cobertura}/100`);
    linhas.push("");
  }
  if (resultado.status_geral) {
    const statusIcon = resultado.status_geral === "operacional" ? "🟢" : resultado.status_geral === "atencao" ? "🟡" : "🔴";
    linhas.push(`**Status Geral:** ${statusIcon} ${resultado.status_geral.toUpperCase()}`);
    linhas.push("");
  }

  // Métricas operacionais
  if (resultado.metricas) {
    linhas.push("## Métricas Operacionais");
    linhas.push("| Indicador | Valor |");
    linhas.push("|---|---|");
    const m = resultado.metricas;
    if (m.equipamentos != null) linhas.push(`| Equipamentos | ${m.equipamentos} |`);
    if (m.fabricantes?.length) linhas.push(`| Fabricantes | ${m.fabricantes.join(", ")} |`);
    if (m.passagens_dia != null) linhas.push(`| Passagens/dia | ${m.passagens_dia.toLocaleString("pt-BR")} |`);
    if (m.bi_reports != null) linhas.push(`| Relatórios BI | ${m.bi_reports} |`);
    if (m.ocr != null) linhas.push(`| Índice OCR | ${m.ocr}% |`);
    linhas.push("");
  }

  // Dados completos do site
  if (site) {
    linhas.push("## Dados do Contrato");
    linhas.push("| Campo | Valor |");
    linhas.push("|---|---|");
    linhas.push(`| Nome | ${site.nome} |`);
    linhas.push(`| Órgão | ${site.orgao} |`);
    linhas.push(`| Estado | ${site.estado} |`);
    linhas.push(`| Tipo | ${site.tipo || "—"} |`);
    linhas.push(`| Versão | ${site.versao || "—"} |`);
    linhas.push(`| Status | ${site.status || "—"} |`);
    if (site.menuCount) linhas.push(`| Menus | ${site.menuCount} |`);
    if (site.ocr) linhas.push(`| OCR | ${site.ocr}% |`);
    if (site.passagensDia) linhas.push(`| Passagens/dia | ${site.passagensDia.toLocaleString("pt-BR")} |`);
    if (site.equipamentos?.total) linhas.push(`| Equipamentos | ${site.equipamentos.total} |`);
    if (site.equipamentos?.grupos?.length) linhas.push(`| Grupos | ${site.equipamentos.grupos.join(", ")} |`);
    if (site.fabricantes?.length) linhas.push(`| Fabricantes | ${site.fabricantes.join(", ")} |`);
    linhas.push("");

    if (site.bi?.length) {
      linhas.push("## Relatórios BI Disponíveis");
      for (const bi of site.bi) linhas.push(`- ${bi}`);
      linhas.push("");
    }

    if (site.extras?.length) {
      linhas.push("## Módulos Extras");
      for (const ex of site.extras) linhas.push(`- ${ex}`);
      linhas.push("");
    }

    if (site.observacoes) {
      linhas.push("## Observações");
      linhas.push(site.observacoes);
      linhas.push("");
    }
  }

  // Pontos de destaque
  if (resultado.pontos_destaque?.length) {
    linhas.push("## Pontos de Destaque");
    for (const p of resultado.pontos_destaque) linhas.push(`- ✅ ${p}`);
    linhas.push("");
  }

  // Riscos
  if (resultado.riscos?.length) {
    linhas.push("## Riscos Identificados");
    for (const r of resultado.riscos) linhas.push(`- ⚠️ ${r}`);
    linhas.push("");
  }

  // Oportunidades
  if (resultado.oportunidades?.length) {
    linhas.push("## Oportunidades");
    for (const o of resultado.oportunidades) linhas.push(`- 💡 ${o}`);
    linhas.push("");
  }

  // Requisitos atendidos (gap-analysis)
  if (resultado.requisitos_atendidos?.length) {
    linhas.push("## Requisitos Atendidos");
    linhas.push("| Requisito | Como |");
    linhas.push("|---|---|");
    for (const r of resultado.requisitos_atendidos) {
      linhas.push(`| ${r.requisito} | ${r.como} |`);
    }
    linhas.push("");
  }

  // Gaps identificados (gap-analysis)
  if (resultado.gaps_identificados?.length) {
    linhas.push("## Gaps Identificados");
    linhas.push("| Requisito | Severidade | Proposta |");
    linhas.push("|---|---|---|");
    for (const g of resultado.gaps_identificados) {
      const icon = g.severidade === "critico" ? "🔴" : g.severidade === "medio" ? "🟡" : "🟢";
      linhas.push(`| ${g.requisito} | ${icon} ${g.severidade} | ${g.proposta} |`);
    }
    linhas.push("");
  }

  // Recomendações
  if (resultado.recomendacoes?.length) {
    linhas.push("## Recomendações");
    for (const r of resultado.recomendacoes) linhas.push(`- 📌 ${r}`);
    linhas.push("");
  }

  if (resultado.estimativa_esforco) {
    linhas.push(`**Estimativa de Esforço:** ${resultado.estimativa_esforco}`);
    linhas.push("");
  }

  // Mapeamento de campos (viabilidade)
  if (resultado.campos_analise?.length) {
    linhas.push("## Mapeamento de Campos");
    linhas.push("| Campo | Tipo | Status | Fonte AxHub | Observação |");
    linhas.push("|---|---|---|---|---|");
    for (const c of resultado.campos_analise) {
      const icon = c.status === "DISPONIVEL" ? "✅" : c.status === "PARCIAL" ? "⚠️" : "❌";
      linhas.push(`| ${c.campo_solicitado} | ${c.tipo_solicitado || "-"} | ${icon} ${c.status} | ${c.fonte_axhub || "-"} | ${c.observacao || "-"} |`);
    }
    linhas.push("");
  }

  if (resultado.gaps?.length) {
    linhas.push("## Gaps");
    for (const g of resultado.gaps) linhas.push(`- ❌ ${g}`);
    linhas.push("");
  }

  if (resultado.solucao_proposta) {
    linhas.push("## Solução Proposta");
    linhas.push(resultado.solucao_proposta);
    linhas.push("");
  }

  if (resultado.query_sql) {
    linhas.push("## Query SQL");
    linhas.push("```sql");
    linhas.push(resultado.query_sql);
    linhas.push("```");
    linhas.push("");
  }

  if (resultado.opcoes_entrega?.length) {
    linhas.push("## Opções de Entrega");
    linhas.push("| Opção | Título | Esforço | Descrição |");
    linhas.push("|---|---|---|---|");
    for (const o of resultado.opcoes_entrega) {
      linhas.push(`| ${o.opcao} | ${o.titulo} | ${o.esforco} | ${o.descricao} |`);
    }
    linhas.push("");
  }

  if (resultado.proximos_passos?.length) {
    linhas.push("## Próximos Passos");
    for (const p of resultado.proximos_passos) linhas.push(`- [ ] ${p}`);
    linhas.push("");
  }

  return linhas.join("\n");
}

// ─── Listar relatórios ────────────────────────────────────────────────────────
export async function listarRelatorios({ contrato, tipo, limite = 20 }) {
  const filtro = {};
  if (contrato) filtro.contrato = contrato;
  if (tipo) filtro.tipo = tipo;

  return RelatorioContrato.find(filtro)
    .sort({ createdAt: -1 })
    .limit(limite)
    .select("-resultado -markdown")
    .lean();
}

// ─── Obter relatório completo ─────────────────────────────────────────────────
export async function obterRelatorio(id) {
  return RelatorioContrato.findById(id).lean();
}

// ─── Remover relatório ────────────────────────────────────────────────────────
export async function removerRelatorio(id) {
  return RelatorioContrato.findByIdAndDelete(id);
}

// ─── Listar contratos disponíveis ─────────────────────────────────────────────
export async function listarContratos() {
  const sites = await carregarSites();
  const contratos = sites.axhub.map(s => ({
    id: s.id,
    nome: s.nome,
    estado: s.estado,
    orgao: s.orgao,
    tipo: s.tipo,
    produto: "axhub",
    status: s.status,
    equipamentos: s.equipamentos?.total || 0,
    fabricantes: s.fabricantes || [],
    ocr: s.ocr || null,
    bi_reports: s.bi?.length || 0,
    passagens_dia: s.passagensDia || null,
    versao: s.versao || null,
  }));

  for (const s of sites.axcross) {
    contratos.push({
      id: s.id,
      nome: s.nome,
      estado: s.estado,
      orgao: s.orgao,
      tipo: s.tipo,
      produto: "axcross",
      status: s.status,
      equipamentos: s.equipamentos || 0,
      ocr: null,
      bi_reports: 0,
      passagens_dia: null,
      versao: null,
    });
  }

  return contratos;
}

// ─── Tipos disponíveis ────────────────────────────────────────────────────────
export function listarTiposRelatorio() {
  return Object.entries(TIPOS_RELATORIO).map(([key, val]) => ({
    id: key,
    label: val.label,
    descricao: val.descricao,
  }));
}
