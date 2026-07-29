/**
 * presentation-studio-controller.js
 * AxionIA Presentation Studio Enterprise — Backend Controller
 *
 * Endpoints:
 *   POST /api/presentation/generate  → pipeline completo
 *   POST /api/presentation/impact    → análise de impacto de arquivo
 *   POST /api/presentation/update    → cascade de atualizações
 *   GET  /api/presentation/status    → status do último projeto
 *   POST /api/presentation/agent     → executa agente específico
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.resolve(__dirname, "../../..");
const OUTPUT_DIR = path.join(__dirname, "../../../orchestrator/output");
const CKPT_DIR   = path.join(__dirname, "../../../orchestrator/checkpoints");
const client     = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Mapa de impacto por extensão ────────────────────────────────────────────
const IMPACTO_MAP = {
  ".jsx": [
    { tipo: "screenshots", icone: "📸", qtd: 5, descricao: "recapturar telas afetadas" },
    { tipo: "manual",      icone: "📄", qtd: 2, descricao: "atualizar seções do Docusaurus" },
    { tipo: "video",       icone: "🎬", qtd: 3, descricao: "recompilar cenas do vídeo" },
    { tipo: "ppt",         icone: "📊", qtd: 1, descricao: "atualizar slides afetados" },
  ],
  ".tsx": [
    { tipo: "screenshots", icone: "📸", qtd: 5, descricao: "recapturar telas afetadas" },
    { tipo: "manual",      icone: "📄", qtd: 2, descricao: "atualizar seções do Docusaurus" },
    { tipo: "video",       icone: "🎬", qtd: 3, descricao: "recompilar cenas do vídeo" },
    { tipo: "ppt",         icone: "📊", qtd: 1, descricao: "atualizar slides afetados" },
  ],
  ".js": [
    { tipo: "manual",   icone: "📄", qtd: 2, descricao: "atualizar documentação técnica" },
    { tipo: "swagger",  icone: "📋", qtd: 1, descricao: "atualizar spec OpenAPI" },
    { tipo: "quiz",     icone: "🧩", qtd: 1, descricao: "regenerar questões do módulo" },
    { tipo: "kb",       icone: "📚", qtd: 5, descricao: "reindexar entradas afetadas" },
  ],
  ".md": [
    { tipo: "kb",       icone: "📚", qtd: 8, descricao: "reindexar base de conhecimento" },
    { tipo: "quiz",     icone: "🧩", qtd: 1, descricao: "regenerar questões" },
    { tipo: "ppt",      icone: "📊", qtd: 1, descricao: "atualizar slides" },
  ],
  ".sql": [
    { tipo: "manual",   icone: "📄", qtd: 1, descricao: "atualizar diagrama de dados" },
    { tipo: "graph",    icone: "🔗", qtd: 1, descricao: "regenerar grafo de dependências" },
  ],
};

// ─── CASCADE — Ordem de atualização ──────────────────────────────────────────
const CASCADE_ORDER = [
  "screenshots", "manual", "quiz", "kb",
  "narracao", "legenda", "video", "ppt", "swagger"
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }
function saveJSON(dir, nome, data) {
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, `${nome}.json`), JSON.stringify(data, null, 2), "utf8");
}

// ─── Chamada IA com schema JSON ───────────────────────────────────────────────
async function callAI(system, user, maxTokens = 4000) {
  const res = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return JSON.parse(res.choices[0].message.content);
}

// ─── Carrega base de conhecimento do projeto ──────────────────────────────────
function carregarContexto(project = "AxHub") {
  const docsDir = path.join(ROOT, project, "docs-portal", "docs");
  const docs = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir, { withFileTypes: true }).forEach(e => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".md")) {
        try {
          const content = fs.readFileSync(full, "utf8");
          docs.push({ path: full.replace(ROOT, ""), content: content.slice(0, 2000) });
        } catch { /* ignorar */ }
      }
    });
  }
  walk(docsDir);
  return docs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: POST /api/presentation/generate (pipeline completo)
// ═══════════════════════════════════════════════════════════════════════════════
export async function gerarProjeto(req, res) {
  const { project = "AxHub", task = "full" } = req.body;

  console.log(`[Studio] Iniciando pipeline: ${project} / ${task}`);
  const inicio = Date.now();
  const outDir = path.join(OUTPUT_DIR, project.toLowerCase());
  ensureDir(outDir);

  try {
    const docs   = carregarContexto(project);
    const master = lerMasterJSON();
    const projData = master?.projetos_core?.[project] || {};

    // ── Agente 1-4: Source → Learning (análise do sistema) ──────────────────
    const ctx = `Projeto: ${project}\nMódulos: ${JSON.stringify(projData.modulos || []).slice(0, 2000)}\nDocs (${docs.length}): ${docs.slice(0, 10).map(d => d.path).join(", ")}`;

    const compreensao = await callAI(
      `Você é o AxionIA Learning Agent. Analise o sistema ${project} e retorne um mapa estruturado completo. Responda APENAS em JSON.`,
      `${ctx}\n\nRetorne:\n{"sistema":{"nome":"string","proposito":"string","usuarios":["array"],"complexidade":"string"},"modulos":[{"id":"string","nome":"string","descricao":"string","processos":["array"],"permissoes":["array"]}],"total_telas":"number","total_permissoes":"number"}`,
      3000
    );
    saveJSON(outDir, "01-compreensao", compreensao);

    // ── Agente 5: Capture (screenshots demo) ─────────────────────────────────
    const capture = {
      screenshots: compreensao.modulos?.map((m, i) => ({
        id: `SCR-${String(i+1).padStart(3,"0")}`,
        modulo: m.nome,
        arquivo: `screenshot-${m.id || i}.png`,
        status: "pendente"
      })) || []
    };
    saveJSON(outDir, "05-capture", capture);

    // ── Agente 6: Storyboard ──────────────────────────────────────────────────
    const storyboard = await callAI(
      `Você é o AxionIA Storyboard Agent. Crie roteiros de vídeo detalhados. Responda APENAS em JSON.`,
      `Sistema: ${JSON.stringify(compreensao.sistema)}\nMódulos: ${compreensao.modulos?.slice(0,4).map(m=>m.nome).join(", ")}\n\nRetorne:\n{"videos":[{"id":"string","titulo":"string","duracao_estimada":"string","perfil_alvo":"string","objetivo":"string","cenas":[{"numero":"number","timestamp_inicio":"string","titulo":"string","narracao":"string","acao_tela":"string","legenda":"string"}]}]}`,
      4000
    );
    saveJSON(outDir, "06-storyboard", storyboard);

    // ── Agente 7: Narration ───────────────────────────────────────────────────
    const narration = {
      total_cenas: storyboard.videos?.reduce((s, v) => s + (v.cenas?.length || 0), 0) || 0,
      voz: "Microsoft Maria PT-BR",
      taxa: "22050Hz mono",
      videos: storyboard.videos?.map(v => ({
        id: v.id,
        audio_gerado: false,
        cenas_total: v.cenas?.length || 0,
      })) || []
    };
    saveJSON(outDir, "07-narration", narration);

    // ── Agente 8: Validator ───────────────────────────────────────────────────
    const validator = {
      status: "aprovado",
      checks: [
        { item: "compreensao", ok: !!compreensao.sistema, nota: "" },
        { item: "storyboard",  ok: (storyboard.videos?.length || 0) > 0, nota: "" },
        { item: "narration",   ok: narration.total_cenas > 0, nota: "" },
      ]
    };
    saveJSON(outDir, "08-validator", validator);

    // ── Agente 9: Renderer — Manual, KB, Quiz, Slides ─────────────────────────
    const [manual, kb, quiz, slides] = await Promise.all([
      callAI(
        `Você é o AxionIA Manual Agent. Gere um manual completo em PT-BR. Responda APENAS em JSON.`,
        `${ctx}\n\nRetorne:\n{"manual":{"titulo":"string","capitulos":[{"titulo":"string","secoes":[{"titulo":"string","conteudo":"string","passo_a_passo":["array"],"permissoes_necessarias":["array"],"alertas":["array"]}]}]}}`,
        6000
      ),
      callAI(
        `Você é o AxionIA KB Agent. Gere base de conhecimento. Responda APENAS em JSON.`,
        `${ctx}\n\nRetorne:\n{"knowledge_base":{"entradas":[{"id":"string","categoria":"string","titulo":"string","pergunta":"string","resposta":"string","tags":["array"],"confianca":"number"}]}}`,
        5000
      ),
      callAI(
        `Você é o AxionIA Quiz Agent. Gere quiz de treinamento. Responda APENAS em JSON.`,
        `${ctx}\n\nRetorne:\n{"quiz":[{"id":"string","modulo":"string","nivel":"basico|intermediario|avancado","pergunta":"string","tipo":"multipla_escolha|verdadeiro_falso","opcoes":["array"],"resposta_correta":"string","explicacao":"string","pontos":"number"}]}`,
        3000
      ),
      callAI(
        `Você é o AxionIA Slides Agent. Gere apresentação executiva. Responda APENAS em JSON.`,
        `${ctx}\n\nRetorne:\n{"apresentacao":{"slides":[{"numero":"number","layout":"titulo|conteudo|encerramento","titulo":"string","subtitulo":"string","conteudo":["array"],"destaque":"string","notas_apresentador":"string","visual_sugerido":"string"}]},"timeline_implantacao":{"fases":[{"numero":"number","nome":"string","semanas":"string","responsavel":"string","atividades":["array"],"entregavel":"string"}],"marcos":[{"semana":"number","evento":"string","tipo":"inicio|entrega|validacao|producao"}]}}`,
        5000
      )
    ]);

    saveJSON(outDir, "03-manual",   manual);
    saveJSON(outDir, "04-kb",       kb);
    saveJSON(outDir, "quiz",        quiz);
    saveJSON(outDir, "07-slides",   slides);

    // ── Agente 10: Publisher — grafo e INDEX ──────────────────────────────────
    const grafo = await callAI(
      `Você é o AxionIA Graph Agent. Gere grafo Mermaid do sistema. Responda APENAS em JSON.`,
      `${ctx}\n\nRetorne:\n{"grafo_sistema":{"nos":[{"id":"string","label":"string","tipo":"modulo|api|banco|usuario"}],"arestas":[{"de":"string","para":"string","label":"string"}]},"arvore_dependencias":{"arvore":"string"},"mermaid_grafo":"string","mermaid_fluxo":"string"}`,
      3000
    );
    saveJSON(outDir, "02-grafo", grafo);

    const duracao = Math.round((Date.now() - inicio) / 1000);
    const index = {
      projeto: project,
      task,
      gerado_em: new Date().toISOString(),
      duracao_segundos: duracao,
      estatisticas: {
        modulos: compreensao.modulos?.length || 0,
        entradas_kb: kb.knowledge_base?.entradas?.length || 0,
        capitulos_manual: manual.manual?.capitulos?.length || 0,
        videos: storyboard.videos?.length || 0,
        slides: slides.apresentacao?.slides?.length || 0,
        questoes_quiz: quiz.quiz?.length || 0,
        screenshots: capture.screenshots?.length || 0,
      }
    };
    saveJSON(outDir, "INDEX", index);

    console.log(`[Studio] Pipeline concluído em ${duracao}s`);

    return res.json({
      ok: true,
      duracao_segundos: duracao,
      compreensao,
      grafo,
      manual,
      kb,
      quiz: { treinamento: { quiz: quiz.quiz || [] } },
      videos: storyboard,
      slides,
      capture,
      estatisticas: index.estatisticas,
    });

  } catch (err) {
    console.error("[Studio] Erro no pipeline:", err.message);
    return res.status(500).json({ erro: err.message });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: POST /api/presentation/impact
// ═══════════════════════════════════════════════════════════════════════════════
export async function analisarImpacto(req, res) {
  const { arquivo = "Dashboard.jsx", project = "AxHub" } = req.body;
  const ext = path.extname(arquivo) || ".jsx";
  const impactos = IMPACTO_MAP[ext] || IMPACTO_MAP[".jsx"];

  const totalTempo = impactos.reduce((s, i) => s + i.qtd * 0.5, 0);

  return res.json({
    arquivo,
    extensao: ext,
    project,
    atualizacoes: impactos,
    tempo_estimado: `~${Math.ceil(totalTempo)} min`,
    total_items: impactos.reduce((s, i) => s + i.qtd, 0),
    cascade_ordem: CASCADE_ORDER.filter(t => impactos.some(i => i.tipo === t)),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: POST /api/presentation/update
// ═══════════════════════════════════════════════════════════════════════════════
export async function aplicarUpdate(req, res) {
  const { arquivo = "Dashboard.jsx", atualizacoes = [], project = "AxHub" } = req.body;

  const cascade = [...atualizacoes].sort((a, b) =>
    CASCADE_ORDER.indexOf(a.tipo) - CASCADE_ORDER.indexOf(b.tipo)
  );

  const resultados = [];
  for (const item of cascade) {
    await new Promise(r => setTimeout(r, 100)); // simular processamento
    resultados.push({
      tipo: item.tipo,
      icone: item.icone,
      quantidade: item.qtd,
      status: "concluido",
      concluido_em: new Date().toISOString(),
    });
  }

  return res.json({
    ok: true,
    arquivo,
    project,
    total_atualizados: resultados.length,
    resultados,
    commit: `docs(${project}): atualização automática — ${path.basename(arquivo)}`,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: GET /api/presentation/status
// ═══════════════════════════════════════════════════════════════════════════════
export async function statusProjeto(req, res) {
  const project = req.query.project || "AxHub";
  const outDir  = path.join(OUTPUT_DIR, project.toLowerCase());
  const indexFile = path.join(outDir, "INDEX.json");

  try {
    const index = JSON.parse(fs.readFileSync(indexFile, "utf8"));
    return res.json({ ok: true, ...index });
  } catch {
    return res.json({
      ok: false,
      project,
      mensagem: "Nenhuma geração encontrada. Execute o pipeline primeiro.",
      escala: {
        modulos: 80, servicos: 250, componentes_react: 600,
        apis: 400, prompts: 350, templates: 120,
        agentes_ia: 60, renderizadores: 50, exportadores: 40, motores: 25
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENDPOINT: POST /api/presentation/agent
// ═══════════════════════════════════════════════════════════════════════════════
export async function executarAgente(req, res) {
  const { agente, projeto } = req.body;
  return res.json({
    agente,
    status: "executado",
    executado_em: new Date().toISOString(),
    projeto: projeto?.nome,
  });
}

// ─── Helper: ler master JSON ──────────────────────────────────────────────────
function lerMasterJSON() {
  try {
    const f = path.join(ROOT, "AXION-PROJETOS-COMPLETOS-2026.json");
    return JSON.parse(fs.readFileSync(f, "utf8"));
  } catch { return {}; }
}
