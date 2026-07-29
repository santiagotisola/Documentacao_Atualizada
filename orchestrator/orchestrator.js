#!/usr/bin/env node
/**
 * AxionIA Presentation Studio Enterprise
 * Orquestrador principal — pipeline de 8 estágios para compreensão total
 * e geração automática de todos os formatos de saída.
 *
 * Uso:
 *   node orchestrator.js                        → roda com config padrão (AxHub)
 *   node orchestrator.js --project AxCross      → outro projeto
 *   node orchestrator.js --stage 3              → pular para estágio específico
 *   node orchestrator.js --resume               → continuar de checkpoint salvo
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: "../axion-ia-panel/api/.env" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ─── Configuração ─────────────────────────────────────────────────────────────
const CONFIG = {
  project: process.argv.includes("--project")
    ? process.argv[process.argv.indexOf("--project") + 1]
    : "AxHub",
  startStage: process.argv.includes("--stage")
    ? parseInt(process.argv[process.argv.indexOf("--stage") + 1])
    : 1,
  resume: process.argv.includes("--resume"),
  model: "gpt-4o",
  outputDir: path.join(__dirname, "output"),
  checkpointDir: path.join(__dirname, "checkpoints"),
};

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Utilitários ──────────────────────────────────────────────────────────────
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function saveCheckpoint(stage, data) {
  await ensureDir(CONFIG.checkpointDir);
  const file = path.join(CONFIG.checkpointDir, `stage-${stage}-${CONFIG.project}.json`);
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
  log(`💾 Checkpoint salvo: stage-${stage}`);
}

async function loadCheckpoint(stage) {
  const file = path.join(CONFIG.checkpointDir, `stage-${stage}-${CONFIG.project}.json`);
  try {
    const data = await fs.readFile(file, "utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveOutput(name, content, ext = "json") {
  await ensureDir(path.join(CONFIG.outputDir, CONFIG.project));
  const file = path.join(CONFIG.outputDir, CONFIG.project, `${name}.${ext}`);
  const data = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  await fs.writeFile(file, data, "utf8");
  log(`📄 Output salvo: ${name}.${ext}`);
}

function log(msg) {
  const ts = new Date().toLocaleTimeString("pt-BR");
  console.log(`[${ts}] ${msg}`);
}

function divider(title) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"═".repeat(60)}\n`);
}

// ─── Chamada IA com retry ─────────────────────────────────────────────────────
async function callAI(systemPrompt, userMessage, maxTokens = 4000, stage = "") {
  log(`🤖 Chamando IA... [${stage}] (~${maxTokens} tokens)`);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await client.chat.completions.create({
        model: CONFIG.model,
        temperature: 0.2,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      });
      const raw = res.choices[0].message.content;
      return JSON.parse(raw);
    } catch (err) {
      if (attempt === 3) throw err;
      log(`⚠️  Tentativa ${attempt} falhou: ${err.message}. Retentando...`);
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
}

// ─── Carregadores de conhecimento ─────────────────────────────────────────────
async function loadDocsKnowledge(project) {
  const docsDir = path.join(ROOT, project, "docs-portal", "docs");
  const files = [];

  async function walk(dir) {
    let entries;
    try { entries = await fs.readdir(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.name.endsWith(".md")) {
        try {
          const content = await fs.readFile(full, "utf8");
          files.push({
            path: full.replace(ROOT, "").replace(/\\/g, "/"),
            content: content.slice(0, 3000), // limitar por arquivo
          });
        } catch { /* ignorar */ }
      }
    }
  }
  await walk(docsDir);
  return files;
}

async function loadMasterJSON() {
  const file = path.join(ROOT, "AXION-PROJETOS-COMPLETOS-2026.json");
  const content = await fs.readFile(file, "utf8");
  return JSON.parse(content);
}

async function loadMasterPrompt() {
  const file = path.join(__dirname, "master-prompt.json");
  const content = await fs.readFile(file, "utf8");
  return JSON.parse(content);
}

// ─── ESTÁGIO 1: Compreensão Total do Sistema ─────────────────────────────────
async function stage1_Compreensao(docs, masterJSON, project) {
  divider("ESTÁGIO 1 — Compreensão Total do Sistema");

  const projectData = masterJSON.projetos_core?.[project] || {};
  const sampleDocs = docs.slice(0, 20).map(d => `## ${d.path}\n${d.content}`).join("\n\n---\n\n");

  const result = await callAI(
    `Você é o AxionIA Presentation Studio Enterprise.
Sua missão é compreender TOTALMENTE um sistema de software antes de gerar qualquer documentação.
Analise todos os dados fornecidos e construa um mapa completo do sistema.
Responda APENAS em JSON válido e completo.`,
    `Analise o projeto "${project}" com base nos dados abaixo.

# DADOS DO PROJETO
${JSON.stringify(projectData, null, 2)}

# DOCUMENTAÇÃO EXISTENTE (amostra de ${docs.length} arquivos)
${sampleDocs}

Retorne um JSON com este schema:
{
  "sistema": {
    "nome": "string",
    "versao": "string",
    "proposito": "string — o que o sistema faz em 2 frases",
    "usuarios_principais": ["array de perfis de usuário"],
    "problema_que_resolve": "string"
  },
  "modulos": [{
    "id": "string",
    "nome": "string",
    "descricao": "string",
    "quem_alimenta": ["array — de onde vêm os dados"],
    "quem_depende": ["array — o que depende deste módulo"],
    "processos_principais": ["array de processos"],
    "configuracoes": ["array de configurações necessárias"],
    "permissoes_necessarias": ["array de permissões"],
    "erros_comuns": ["array de erros/problemas frequentes"],
    "melhores_praticas": ["array de boas práticas"]
  }],
  "fluxos_principais": [{
    "nome": "string",
    "atores": ["array"],
    "passos": ["array de strings — passo a passo"]
  }],
  "integracoes": [{
    "sistema": "string",
    "tipo": "string",
    "dados_compartilhados": "string",
    "direcao": "entrada|saida|bidirecional"
  }],
  "apis": [{
    "grupo": "string",
    "endpoints": [{"metodo":"string","rota":"string","descricao":"string"}]
  }],
  "banco_dados": [{
    "banco": "string",
    "tabelas_principais": ["array"],
    "entidade_central": "string"
  }],
  "arvore_dependencias": {
    "descricao": "string",
    "nos": [{"id":"string","nome":"string","dependencias":["array de ids"]}]
  },
  "mapa_navegacao": [{
    "secao": "string",
    "paginas": [{"nome":"string","rota":"string","descricao":"string"}]
  }],
  "total_telas": "number",
  "total_permissoes": "number",
  "complexidade": "baixa|media|alta|muito_alta"
}`,
    6000, "stage-1"
  );

  await saveCheckpoint(1, result);
  await saveOutput("01-compreensao-sistema", result);
  log(`✅ Estágio 1 concluído: ${result.modulos?.length || 0} módulos mapeados`);
  return result;
}

// ─── ESTÁGIO 2: Grafo do Sistema + Árvore de Dependências ────────────────────
async function stage2_Grafo(compreensao) {
  divider("ESTÁGIO 2 — Grafo do Sistema e Árvore de Dependências");

  const result = await callAI(
    `Você é o AxionIA Graph Engine. Gere grafos e diagramas estruturados do sistema.
Responda APENAS em JSON válido.`,
    `Com base na compreensão do sistema abaixo, gere o grafo completo.

${JSON.stringify(compreensao, null, 2)}

Retorne:
{
  "grafo_sistema": {
    "nos": [{"id":"string","label":"string","tipo":"modulo|integracao|banco|usuario|api","cor":"string","descricao":"string"}],
    "arestas": [{"de":"string","para":"string","label":"string","tipo":"dados|depende|configura|autentica"}]
  },
  "arvore_dependencias": {
    "raiz": "string",
    "arvore": "string — representação em texto da árvore com recuo"
  },
  "mapa_navegacao_visual": {
    "menu_lateral": [{"secao":"string","itens":[{"nome":"string","rota":"string","requer_permissao":"string"}]}]
  },
  "diagrama_fluxo_principal": {
    "titulo": "string",
    "passos": [{"id":"string","tipo":"inicio|processo|decisao|fim","texto":"string","proximo":["array de ids"]}]
  },
  "diagrama_ascii": "string — diagrama ASCII da arquitetura geral",
  "mermaid_grafo": "string — código Mermaid para o grafo",
  "mermaid_fluxo": "string — código Mermaid para o fluxo principal"
}`,
    4000, "stage-2"
  );

  await saveCheckpoint(2, result);
  await saveOutput("02-grafo-sistema", result);
  log(`✅ Estágio 2 concluído: ${result.grafo_sistema?.nos?.length || 0} nós no grafo`);
  return result;
}

// ─── ESTÁGIO 3: Manual Completo ───────────────────────────────────────────────
async function stage3_Manual(compreensao, docs) {
  divider("ESTÁGIO 3 — Manual Completo do Sistema");

  const allDocsText = docs.map(d => `### ${d.path}\n${d.content}`).join("\n\n");

  const result = await callAI(
    `Você é um Technical Writer sênior da Axion Tecnologia.
Gere um manual completo, organizado e em português brasileiro.
Nunca documente apenas uma tela — sempre explique o contexto, dependências e processos completos.
Responda APENAS em JSON válido.`,
    `Gere o manual completo do sistema com base nos dados abaixo.

COMPREENSÃO DO SISTEMA:
${JSON.stringify(compreensao.sistema, null, 2)}
${JSON.stringify(compreensao.modulos?.slice(0, 8), null, 2)}

DOCUMENTAÇÃO EXISTENTE:
${allDocsText.slice(0, 15000)}

Retorne:
{
  "manual": {
    "titulo": "string",
    "versao": "string",
    "capitulos": [{
      "numero": "number",
      "titulo": "string",
      "descricao": "string",
      "secoes": [{
        "titulo": "string",
        "conteudo": "string — texto completo da seção em Markdown",
        "modulo_relacionado": "string",
        "quem_usa": ["array de perfis"],
        "pre_requisitos": ["array"],
        "passo_a_passo": ["array de strings numeradas"],
        "dicas": ["array"],
        "alertas": ["array"],
        "permissoes_necessarias": ["array de códigos de permissão"]
      }]
    }],
    "glossario": [{"termo":"string","definicao":"string"}],
    "indice_remissivo": [{"termo":"string","pagina_conceitual":"string"}]
  }
}`,
    8000, "stage-3"
  );

  await saveCheckpoint(3, result);
  await saveOutput("03-manual-completo", result);
  log(`✅ Estágio 3 concluído: ${result.manual?.capitulos?.length || 0} capítulos`);
  return result;
}

// ─── ESTÁGIO 4: Knowledge Base ────────────────────────────────────────────────
async function stage4_KnowledgeBase(compreensao, manual) {
  divider("ESTÁGIO 4 — Knowledge Base (KB)");

  const result = await callAI(
    `Você é o AxionIA KB Engine. Gere uma base de conhecimento estruturada para alimentar a IA de atendimento.
Cada entrada deve ser independente, clara e pesquisável.
Responda APENAS em JSON válido.`,
    `Gere a Knowledge Base completa do sistema.

SISTEMA: ${JSON.stringify(compreensao.sistema, null, 2)}
MÓDULOS: ${JSON.stringify(compreensao.modulos?.slice(0, 6), null, 2)}
FLUXOS: ${JSON.stringify(compreensao.fluxos_principais, null, 2)}

Retorne:
{
  "knowledge_base": {
    "total_entradas": "number",
    "categorias": ["array de categorias"],
    "entradas": [{
      "id": "string — ex: KB-AH-001",
      "categoria": "string",
      "titulo": "string",
      "pergunta": "string — pergunta que esta entrada responde",
      "resposta": "string — resposta completa e clara",
      "tags": ["array de palavras-chave"],
      "modulo": "string",
      "perfil_alvo": ["array de perfis"],
      "relacionados": ["array de ids KB relacionados"],
      "confianca": "number 0-100"
    }]
  }
}`,
    6000, "stage-4"
  );

  await saveCheckpoint(4, result);
  await saveOutput("04-knowledge-base", result);
  log(`✅ Estágio 4 concluído: ${result.knowledge_base?.entradas?.length || 0} entradas KB`);
  return result;
}

// ─── ESTÁGIO 5: Quiz + Treinamento ───────────────────────────────────────────
async function stage5_Quiz(compreensao, manual) {
  divider("ESTÁGIO 5 — Quiz e Material de Treinamento");

  const result = await callAI(
    `Você é um Instructional Designer sênior da Axion Tecnologia.
Crie quizzes e materiais de treinamento didáticos e práticos.
Responda APENAS em JSON válido.`,
    `Crie o material de treinamento completo para o sistema.

SISTEMA: ${compreensao.sistema?.nome} — ${compreensao.sistema?.proposito}
MÓDULOS: ${compreensao.modulos?.map(m => m.nome).join(", ")}
PERFIS DE USUÁRIO: ${compreensao.sistema?.usuarios_principais?.join(", ")}

Retorne:
{
  "treinamento": {
    "trilhas": [{
      "id": "string",
      "nome": "string",
      "perfil_alvo": "string",
      "duracao_estimada": "string",
      "modulos": [{"numero":"number","titulo":"string","objetivo":"string","duracao":"string"}]
    }],
    "quiz": [{
      "id": "string — ex: Q-AH-001",
      "modulo": "string",
      "nivel": "basico|intermediario|avancado",
      "pergunta": "string",
      "tipo": "multipla_escolha|verdadeiro_falso|correspondencia",
      "opcoes": ["array de strings (para multipla escolha)"],
      "resposta_correta": "string",
      "explicacao": "string — por que esta é a resposta correta",
      "pontos": "number"
    }],
    "certificacao": {
      "titulo": "string",
      "criterios": ["array de critérios para obter certificado"],
      "nota_minima": "number",
      "validade_meses": "number"
    },
    "flashcards": [{"frente":"string","verso":"string","categoria":"string"}]
  }
}`,
    6000, "stage-5"
  );

  await saveCheckpoint(5, result);
  await saveOutput("05-quiz-treinamento", result);
  log(`✅ Estágio 5 concluído: ${result.treinamento?.quiz?.length || 0} questões de quiz`);
  return result;
}

// ─── ESTÁGIO 6: Roteiros de Vídeo + Storyboard ───────────────────────────────
async function stage6_Video(compreensao, manual, grafo) {
  divider("ESTÁGIO 6 — Roteiros de Vídeo e Storyboards");

  const result = await callAI(
    `Você é um Video Producer sênior da Axion Tecnologia.
Crie roteiros de vídeo completos e storyboards detalhados.
NUNCA gere um vídeo antes de compreender totalmente o sistema.
Você JÁ compreendeu o sistema — agora gere os roteiros.
Responda APENAS em JSON válido.`,
    `Crie os roteiros de vídeo completos para o sistema.

SISTEMA: ${JSON.stringify(compreensao.sistema, null, 2)}
MÓDULOS: ${compreensao.modulos?.map(m => `${m.nome}: ${m.descricao}`).join(" | ")}
PERFIS: ${compreensao.sistema?.usuarios_principais?.join(", ")}

Retorne:
{
  "videos": [{
    "id": "string — ex: V01",
    "titulo": "string",
    "perfil_alvo": "string",
    "duracao_estimada": "string",
    "objetivo": "string — o que o usuário aprenderá",
    "pre_requisitos": ["array"],
    "cenas": [{
      "numero": "number",
      "timestamp_inicio": "string",
      "timestamp_fim": "string",
      "titulo": "string",
      "narracao": "string — texto completo para narrar",
      "acao_tela": "string — o que mostrar/fazer na tela",
      "legenda": "string — legenda exibida no vídeo",
      "tipo_visual": "screencast|slide|animacao|zoom|highlight",
      "dica_edicao": "string — sugestão para o editor de vídeo"
    }],
    "storyboard": [{
      "frame": "number",
      "descricao_visual": "string",
      "texto_sobreposicao": "string",
      "transicao": "string"
    }],
    "checklist_producao": ["array de itens para verificar antes de gravar"],
    "timeline": "string — linha do tempo em texto"
  }]
}`,
    8000, "stage-6"
  );

  await saveCheckpoint(6, result);
  await saveOutput("06-videos-storyboard", result);
  log(`✅ Estágio 6 concluído: ${result.videos?.length || 0} vídeos roteirizados`);
  return result;
}

// ─── ESTÁGIO 7: Slides + Timeline ────────────────────────────────────────────
async function stage7_Slides(compreensao, grafo) {
  divider("ESTÁGIO 7 — Apresentação de Slides e Timeline");

  const result = await callAI(
    `Você é um especialista em apresentações corporativas da Axion Tecnologia.
Crie slides executivos e timeline de implementação.
Responda APENAS em JSON válido.`,
    `Crie a apresentação completa do sistema.

SISTEMA: ${JSON.stringify(compreensao.sistema, null, 2)}
GRAFO (nos): ${JSON.stringify(grafo.grafo_sistema?.nos, null, 2)}
MERMAID FLUXO: ${grafo.mermaid_fluxo || "não disponível"}

Retorne:
{
  "apresentacao": {
    "titulo": "string",
    "subtitulo": "string",
    "slides": [{
      "numero": "number",
      "layout": "titulo|conteudo|dois_paineis|comparativo|timeline|diagrama|encerramento",
      "titulo": "string",
      "subtitulo": "string",
      "conteudo": ["array de bullets ou texto"],
      "notas_apresentador": "string",
      "visual_sugerido": "string — descrição do visual/imagem",
      "destaque": "string — dado ou frase de destaque"
    }],
    "paleta_cores": {"primaria":"string","secundaria":"string","destaque":"string","fundo":"string"},
    "fonte_recomendada": "string"
  },
  "timeline_implantacao": {
    "titulo": "string",
    "fases": [{
      "numero": "number",
      "nome": "string",
      "semanas": "string",
      "atividades": ["array"],
      "entregavel": "string",
      "responsavel": "string",
      "dependencias": ["array de fases anteriores"]
    }],
    "marcos": [{"semana":"number","evento":"string","tipo":"inicio|entrega|validacao|producao"}],
    "total_semanas": "number"
  },
  "html_slides": "string — HTML completo da apresentação (estilo reveal.js simples)"
}`,
    6000, "stage-7"
  );

  await saveCheckpoint(7, result);
  await saveOutput("07-slides-timeline", result);
  // Salvar HTML separado se disponível
  if (result.html_slides) {
    await saveOutput("slides-apresentacao", result.html_slides, "html");
  }
  log(`✅ Estágio 7 concluído: ${result.apresentacao?.slides?.length || 0} slides gerados`);
  return result;
}

// ─── ESTÁGIO 8: Consolidação Final ───────────────────────────────────────────
async function stage8_Consolidacao(all) {
  divider("ESTÁGIO 8 — Consolidação Final e Índice Master");

  const summary = {
    meta: {
      projeto: CONFIG.project,
      gerado_em: new Date().toISOString(),
      total_estagios: 8,
      modelo: CONFIG.model,
    },
    sistema: all.compreensao?.sistema,
    estatisticas: {
      modulos: all.compreensao?.modulos?.length || 0,
      permissoes: all.compreensao?.total_permissoes || 0,
      telas: all.compreensao?.total_telas || 0,
      nos_grafo: all.grafo?.grafo_sistema?.nos?.length || 0,
      capitulos_manual: all.manual?.manual?.capitulos?.length || 0,
      entradas_kb: all.kb?.knowledge_base?.entradas?.length || 0,
      questoes_quiz: all.quiz?.treinamento?.quiz?.length || 0,
      videos_roteirizados: all.videos?.videos?.length || 0,
      slides: all.slides?.apresentacao?.slides?.length || 0,
    },
    arquivos_gerados: [
      "01-compreensao-sistema.json",
      "02-grafo-sistema.json",
      "03-manual-completo.json",
      "04-knowledge-base.json",
      "05-quiz-treinamento.json",
      "06-videos-storyboard.json",
      "07-slides-timeline.json",
      "08-consolidacao-final.json",
      "slides-apresentacao.html",
    ],
    proximos_passos: [
      "Exportar manual para PDF/DOCX usando os dados do estágio 3",
      "Importar KB (estágio 4) para o MongoDB da AxionIA via /api/kb",
      "Gravar vídeos usando os roteiros do estágio 6",
      "Apresentar slides do estágio 7 para stakeholders",
      "Configurar quiz no LMS interno usando dados do estágio 5",
    ],
  };

  await saveOutput("08-consolidacao-final", summary);
  await saveOutput("INDEX", summary);
  return summary;
}

// ─── Pipeline Principal ───────────────────────────────────────────────────────
async function run() {
  divider(`AxionIA PRESENTATION STUDIO ENTERPRISE — ${CONFIG.project} v5`);
  log(`🚀 Iniciando pipeline | Projeto: ${CONFIG.project} | Estágio inicial: ${CONFIG.startStage}`);

  // Carregar inputs
  log("📂 Carregando base de conhecimento...");
  const [docs, masterJSON, masterPrompt] = await Promise.all([
    loadDocsKnowledge(CONFIG.project),
    loadMasterJSON(),
    loadMasterPrompt(),
  ]);
  log(`  → ${docs.length} arquivos de documentação carregados`);
  log(`  → Master JSON: ${Object.keys(masterJSON.projetos_core || {}).join(", ")}`);

  const results = {};

  // Carregar checkpoints existentes se --resume
  if (CONFIG.resume) {
    for (let s = 1; s <= 8; s++) {
      const ck = await loadCheckpoint(s);
      if (ck) {
        const key = ["compreensao", "grafo", "manual", "kb", "quiz", "videos", "slides"][s - 1];
        if (key) results[key] = ck;
        log(`♻️  Checkpoint estágio ${s} carregado`);
      }
    }
  }

  // Executar estágios
  if (CONFIG.startStage <= 1 && !results.compreensao)
    results.compreensao = await stage1_Compreensao(docs, masterJSON, CONFIG.project);

  if (CONFIG.startStage <= 2 && !results.grafo)
    results.grafo = await stage2_Grafo(results.compreensao);

  if (CONFIG.startStage <= 3 && !results.manual)
    results.manual = await stage3_Manual(results.compreensao, docs);

  if (CONFIG.startStage <= 4 && !results.kb)
    results.kb = await stage4_KnowledgeBase(results.compreensao, results.manual);

  if (CONFIG.startStage <= 5 && !results.quiz)
    results.quiz = await stage5_Quiz(results.compreensao, results.manual);

  if (CONFIG.startStage <= 6 && !results.videos)
    results.videos = await stage6_Video(results.compreensao, results.manual, results.grafo);

  if (CONFIG.startStage <= 7 && !results.slides)
    results.slides = await stage7_Slides(results.compreensao, results.grafo);

  const consolidacao = await stage8_Consolidacao(results);

  // Resumo final
  divider("✅ PIPELINE CONCLUÍDO");
  console.log(JSON.stringify(consolidacao.estatisticas, null, 2));
  console.log(`\n📁 Outputs em: ${path.join(CONFIG.outputDir, CONFIG.project)}`);
}

run().catch(err => {
  console.error("❌ ERRO FATAL:", err.message);
  process.exit(1);
});
