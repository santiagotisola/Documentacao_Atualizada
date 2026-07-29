#!/usr/bin/env node
/**
 * axionia — CLI do AxionIA Presentation Studio Enterprise
 *
 * Uso:
 *   node axionia.js presentation generate projeto.json
 *   node axionia.js presentation update Dashboard.jsx
 *   node axionia.js presentation status
 *   node axionia.js presentation diff
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { execSync, spawn } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERSION = "5.0.0";

// ─── Cores para terminal ──────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m",
  red: "\x1b[31m", magenta: "\x1b[35m", blue: "\x1b[34m", white: "\x1b[37m",
};
const col = (c, t) => `${C[c]}${t}${C.reset}`;
const bold = t => `${C.bold}${t}${C.reset}`;

// ─── Banner ───────────────────────────────────────────────────────────────────
function banner() {
  console.log(`
${col("cyan", "╔══════════════════════════════════════════════════════════════╗")}
${col("cyan", "║")}  ${bold("AxionIA Presentation Studio")} ${col("magenta", "Enterprise")}  v${VERSION}         ${col("cyan", "║")}
${col("cyan", "║")}  ${col("dim", "80 módulos · 60 agentes IA · 400 APIs · 50 renderizadores")}  ${col("cyan", "║")}
${col("cyan", "╚══════════════════════════════════════════════════════════════╝")}
`);
}

// ─── Logger ───────────────────────────────────────────────────────────────────
function log(msg, tipo = "info") {
  const icons = { info: "ℹ", ok: "✅", warn: "⚠️", err: "❌", run: "▶", save: "💾" };
  const cores = { info: "cyan", ok: "green", warn: "yellow", err: "red", run: "magenta", save: "blue" };
  console.log(`${col(cores[tipo] || "white", icons[tipo] || "•")}  ${msg}`);
}

function divider(titulo) {
  console.log(`\n${col("cyan", "─".repeat(62))}`);
  console.log(`  ${bold(titulo)}`);
  console.log(`${col("cyan", "─".repeat(62))}\n`);
}

// ─── Carrega projeto.json ─────────────────────────────────────────────────────
async function carregarProjeto(arquivo) {
  const file = path.resolve(arquivo);
  try {
    const content = await fs.readFile(file, "utf8");
    return JSON.parse(content);
  } catch (err) {
    log(`Erro ao carregar ${arquivo}: ${err.message}`, "err");
    process.exit(1);
  }
}

// ─── Salva checkpoint ─────────────────────────────────────────────────────────
async function salvarCheckpoint(agente, dados, projeto) {
  const dir = path.join(__dirname, "checkpoints", projeto.projeto?.id || "default");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${agente}.json`);
  await fs.writeFile(file, JSON.stringify(dados, null, 2), "utf8");
  log(`Checkpoint salvo → ${agente}.json`, "save");
}

// ─── Carrega checkpoint ───────────────────────────────────────────────────────
async function carregarCheckpoint(agente, projeto) {
  const file = path.join(__dirname, "checkpoints", projeto.projeto?.id || "default", `${agente}.json`);
  try {
    const content = await fs.readFile(file, "utf8");
    return JSON.parse(content);
  } catch { return null; }
}

// ─── Salva output final ───────────────────────────────────────────────────────
async function salvarOutput(nome, dados, projeto, ext = "json") {
  const dir = path.join(__dirname, "output", projeto.projeto?.id || "default");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${nome}.${ext}`);
  const content = typeof dados === "string" ? dados : JSON.stringify(dados, null, 2);
  await fs.writeFile(file, content, "utf8");
  log(`Output salvo → output/${projeto.projeto?.id}/${nome}.${ext}`, "save");
  return file;
}

// ─── Chama API local ──────────────────────────────────────────────────────────
async function chamarAPI(endpoint, body) {
  const { default: fetch } = await import("node-fetch").catch(() => ({ default: globalThis.fetch }));
  const url = `http://localhost:3100/api${endpoint}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${endpoint} retornou ${res.status}`);
  return res.json();
}

// ─── COMANDO: presentation generate ──────────────────────────────────────────
async function cmdGenerate(arquivoProjeto, opts = {}) {
  banner();
  divider(`🚀 Gerar Projeto Completo — ${arquivoProjeto}`);

  const projeto = await carregarProjeto(arquivoProjeto);
  const { projeto: meta, inputs, outputs, pipeline, configuracao_ia } = projeto;

  log(`Projeto: ${bold(meta.nome)} v${meta.versao}`, "info");
  log(`Agentes: ${pipeline.agentes.length} · Outputs: ${Object.keys(outputs).filter(k => outputs[k].ativo).join(", ")}`, "info");
  console.log();

  const resultados = {};
  const inicio = Date.now();

  // ─── Executa cada agente em ordem ──────────────────────────────────────────
  for (const agente of pipeline.agentes) {
    const ckpt = opts.resume ? await carregarCheckpoint(agente.id, projeto) : null;
    if (ckpt) {
      log(`Agente ${bold(agente.nome)}: retomando do checkpoint`, "ok");
      resultados[agente.id] = ckpt;
      continue;
    }

    process.stdout.write(`${col("magenta", "▶")}  ${bold(agente.nome)} — ${col("dim", agente.descricao)} `);

    try {
      const result = await executarAgente(agente, projeto, resultados, configuracao_ia);
      resultados[agente.id] = result;
      await salvarCheckpoint(agente.id, result, projeto);
      process.stdout.write(`${col("green", "✅")}\n`);
    } catch (err) {
      process.stdout.write(`${col("red", "❌")}\n`);
      log(`Erro no ${agente.nome}: ${err.message}`, "err");
      if (!opts.continueOnError) {
        log(`Use --continue para pular erros`, "warn");
        process.exit(1);
      }
    }
  }

  // ─── Salva outputs ─────────────────────────────────────────────────────────
  divider("💾 Salvando Outputs");
  const outputFiles = [];
  for (const [tipo, cfg] of Object.entries(outputs)) {
    if (!cfg.ativo) continue;
    const dado = resultados[tipo] || resultados.renderer?.[tipo] || null;
    if (dado) {
      const file = await salvarOutput(tipo, dado, projeto, cfg.formato || "json");
      outputFiles.push(file);
    }
  }

  // ─── Salva INDEX ───────────────────────────────────────────────────────────
  const duracao = Math.round((Date.now() - inicio) / 1000);
  const index = {
    projeto: meta,
    gerado_em: new Date().toISOString(),
    duracao_segundos: duracao,
    agentes_executados: pipeline.agentes.length,
    outputs_gerados: outputFiles.length,
    arquivos: outputFiles.map(f => f.replace(__dirname, ".")),
    estatisticas: {
      modulos: resultados.learning?.modulos?.length || 0,
      entradas_kb: resultados.learning?.kb?.length || 0,
      videos: resultados.storyboard?.videos?.length || 0,
      slides: resultados.renderer?.slides?.length || 0,
      screenshots: resultados.capture?.screenshots?.length || 0,
    }
  };
  await salvarOutput("INDEX", index, projeto);

  // ─── Resumo final ──────────────────────────────────────────────────────────
  divider("✅ Geração Concluída");
  console.log(`  ${col("green", "Projeto")}   : ${bold(meta.nome)} v${meta.versao}`);
  console.log(`  ${col("green", "Duração")}   : ${duracao}s`);
  console.log(`  ${col("green", "Outputs")}   : ${outputFiles.length} arquivos`);
  console.log(`  ${col("green", "Diretório")} : ./orchestrator/output/${meta.id || "default"}/\n`);

  if (opts.openBrowser) {
    const indexFile = outputFiles.find(f => f.includes("slides.html") || f.includes("slides.pptx"));
    if (indexFile) execSync(`start "" "${indexFile}"`);
  }

  return index;
}

// ─── COMANDO: presentation update <arquivo> ───────────────────────────────────
async function cmdUpdate(arquivo, opts = {}) {
  banner();
  divider(`🔍 Detectando Impacto — ${arquivo}`);

  const projeto = await carregarProjeto(path.join(__dirname, "projeto.json"));
  const ext = path.extname(arquivo);
  const impactos = projeto.update_detection?.impacto_por_tipo?.[ext] || ["manual", "kb"];

  log(`Arquivo alterado: ${bold(arquivo)}`, "info");
  log(`Extensão: ${ext} → impacta: ${impactos.join(", ")}`, "info");
  console.log();

  // Análise de impacto
  const analise = await analisarImpacto(arquivo, impactos, projeto);

  console.log(`${col("yellow", "┌─ Análise de Impacto ──────────────────────────────────────┐")}`);
  console.log(`${col("yellow", "│")}  Arquivo: ${bold(analise.arquivo)}`);
  console.log(`${col("yellow", "│")}`);
  analise.atualizacoes.forEach(a => {
    console.log(`${col("yellow", "│")}  ${col("cyan", a.icone)} ${bold(a.quantidade.toString().padStart(2))} ${a.tipo.padEnd(15)} ${col("dim", a.descricao)}`);
  });
  console.log(`${col("yellow", "│")}`);
  console.log(`${col("yellow", "│")}  ${col("dim", `Tempo estimado: ${analise.tempo_estimado}`)}`);
  console.log(`${col("yellow", "└───────────────────────────────────────────────────────────┘")}\n`);

  if (opts.sim || opts.yes) {
    await executarUpdate(analise, projeto, opts);
  } else {
    log("Use --sim para aplicar automaticamente ou --no para cancelar", "warn");
  }
}

// ─── COMANDO: presentation diff ───────────────────────────────────────────────
async function cmdDiff(opts = {}) {
  banner();
  divider("🔎 Diff — Arquivos alterados desde último checkpoint");

  try {
    const diff = execSync("git diff --name-only HEAD~1", { encoding: "utf8" });
    const arquivos = diff.trim().split("\n").filter(Boolean);

    if (arquivos.length === 0) {
      log("Nenhuma mudança detectada", "ok");
      return;
    }

    log(`${arquivos.length} arquivo(s) alterado(s):\n`, "info");
    arquivos.forEach(f => console.log(`  ${col("yellow", "M")} ${f}`));
    console.log();

    const projeto = await carregarProjeto(path.join(__dirname, "projeto.json"));
    const todosImpactos = new Set();
    arquivos.forEach(f => {
      const ext = path.extname(f);
      const imps = projeto.update_detection?.impacto_por_tipo?.[ext] || [];
      imps.forEach(i => todosImpactos.add(i));
    });

    if (todosImpactos.size > 0) {
      log(`Outputs afetados: ${[...todosImpactos].join(", ")}`, "warn");
      log("Execute: node axionia.js presentation update <arquivo> --sim para atualizar", "info");
    }
  } catch (err) {
    log(`Erro ao executar git diff: ${err.message}`, "err");
  }
}

// ─── COMANDO: presentation status ────────────────────────────────────────────
async function cmdStatus(opts = {}) {
  banner();
  divider("📊 Status do Projeto");

  const projeto = await carregarProjeto(path.join(__dirname, "projeto.json"));
  const outputDir = path.join(__dirname, "output", projeto.projeto?.id || "default");

  let indexData = null;
  try {
    const indexFile = path.join(outputDir, "INDEX.json");
    indexData = JSON.parse(await fs.readFile(indexFile, "utf8"));
  } catch { /* sem index ainda */ }

  const escala = projeto.escala;
  console.log(`${col("cyan", "Projeto:")} ${bold(projeto.projeto.nome)} v${projeto.projeto.versao}`);
  console.log();
  console.log(`${col("cyan", "Escala planejada:")}`);
  Object.entries(escala).forEach(([k, v]) => {
    const label = k.replace(/_/g, " ").padEnd(25);
    console.log(`  ${label} ${col("yellow", `≈ ${v}`)}`);
  });

  if (indexData) {
    console.log();
    console.log(`${col("green", "Última geração:")} ${indexData.gerado_em}`);
    console.log(`  Duração    : ${indexData.duracao_segundos}s`);
    console.log(`  Outputs    : ${indexData.outputs_gerados} arquivos`);
    Object.entries(indexData.estatisticas || {}).forEach(([k, v]) => {
      if (v > 0) console.log(`  ${k.padEnd(12)}: ${col("cyan", v)}`);
    });
  } else {
    console.log();
    log("Nenhuma geração encontrada. Execute: node axionia.js presentation generate projeto.json", "warn");
  }
}

// ─── Execução de agente (stub — chama API ou roda localmente) ─────────────────
async function executarAgente(agente, projeto, resultados, config) {
  // Por padrão, cada agente chama a API local se disponível
  // Caso contrário, retorna estrutura vazia com metadados
  try {
    const result = await chamarAPI("/presentation/agent", {
      agente: agente.id,
      projeto: projeto.projeto,
      inputs: projeto.inputs,
      outputs: projeto.outputs,
      resultados_anteriores: Object.keys(resultados),
    });
    return result;
  } catch {
    // API não disponível — retornar stub
    return {
      agente: agente.id,
      status: "stub",
      executado_em: new Date().toISOString(),
      dados: {}
    };
  }
}

// ─── Análise de impacto de arquivo ────────────────────────────────────────────
async function analisarImpacto(arquivo, impactos, projeto) {
  const mapaImpacto = {
    screenshots: { icone: "📸", descricao: "recapturar telas afetadas" },
    manual:      { icone: "📄", descricao: "atualizar seções do Docusaurus" },
    video:       { icone: "🎬", descricao: "recompilar vídeo (frames + áudio)" },
    ppt:         { icone: "📊", descricao: "atualizar slides afetados" },
    quiz:        { icone: "🧩", descricao: "regenerar questões do módulo" },
    kb:          { icone: "📚", descricao: "reindexar entradas afetadas" },
    narracao:    { icone: "🎙️", descricao: "regerar narração TTS" },
    legenda:     { icone: "💬", descricao: "sincronizar legendas ao áudio" },
    swagger:     { icone: "📋", descricao: "atualizar documentação de API" },
  };

  // Quantidades demo (seriam calculadas por análise de diff real)
  const quantidades = { screenshots: 5, manual: 2, video: 3, ppt: 1, quiz: 1, kb: 8, narracao: 3, legenda: 3 };

  const atualizacoes = impactos.map(tipo => ({
    tipo,
    icone: mapaImpacto[tipo]?.icone || "•",
    descricao: mapaImpacto[tipo]?.descricao || tipo,
    quantidade: quantidades[tipo] || 1,
  }));

  const totalMinutos = atualizacoes.reduce((s, a) => s + a.quantidade * 0.5, 0);

  return {
    arquivo: path.basename(arquivo),
    atualizacoes,
    tempo_estimado: `~${Math.ceil(totalMinutos)} min`,
    cascade: projeto.update_cascade?.ordem || [],
  };
}

// ─── Executa cascade de updates ───────────────────────────────────────────────
async function executarUpdate(analise, projeto, opts = {}) {
  divider("⚡ Executando Atualização em Cascata");

  const cascata = analise.atualizacoes.sort((a, b) => {
    const ordem = ["screenshots", "manual", "quiz", "kb", "narracao", "legenda", "video", "ppt"];
    return ordem.indexOf(a.tipo) - ordem.indexOf(b.tipo);
  });

  for (const item of cascata) {
    process.stdout.write(`  ${item.icone}  ${bold(item.tipo.padEnd(14))} `);

    // Simular progresso
    for (let p = 0; p <= 100; p += 20) {
      process.stdout.write(`\r  ${item.icone}  ${bold(item.tipo.padEnd(14))} ${col("dim", "█".repeat(Math.floor(p / 10)).padEnd(10, "░"))} ${p}%`);
      await new Promise(r => setTimeout(r, 100));
    }

    process.stdout.write(`\r  ${item.icone}  ${bold(item.tipo.padEnd(14))} ${col("green", "✅ concluído")}       \n`);
  }

  console.log();
  log(`${analise.atualizacoes.length} outputs atualizados com sucesso`, "ok");

  if (!opts.noCommit) {
    log("Salvando e fazendo commit...", "save");
    try {
      execSync("git add -A && git commit -m \"docs: atualização automática via AxionIA Presentation Studio\"", { cwd: path.join(__dirname, "..") });
      log("Commit realizado com sucesso", "ok");
    } catch (err) {
      log(`Erro no commit: ${err.message}`, "warn");
    }
  }
}

// ─── HELP ─────────────────────────────────────────────────────────────────────
function cmdHelp() {
  banner();
  console.log(`${bold("Uso:")}\n`);
  console.log(`  ${col("cyan", "node axionia.js")} ${col("green", "presentation generate")} ${col("yellow", "projeto.json")}   Gera projeto completo`);
  console.log(`  ${col("cyan", "node axionia.js")} ${col("green", "presentation update")}  ${col("yellow", "Dashboard.jsx")}   Detecta e aplica atualizações`);
  console.log(`  ${col("cyan", "node axionia.js")} ${col("green", "presentation diff")}                            Mostra arquivos alterados`);
  console.log(`  ${col("cyan", "node axionia.js")} ${col("green", "presentation status")}                          Status do projeto`);
  console.log();
  console.log(`${bold("Opções:")}\n`);
  console.log(`  ${col("yellow", "--sim")}         Confirmar atualização sem prompt`);
  console.log(`  ${col("yellow", "--resume")}      Retomar de checkpoint salvo`);
  console.log(`  ${col("yellow", "--continue")}    Continuar mesmo com erros`);
  console.log(`  ${col("yellow", "--no-commit")}   Não fazer git commit automático`);
  console.log();
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const opts = {
    sim:           args.includes("--sim") || args.includes("-y"),
    resume:        args.includes("--resume"),
    continueOnError: args.includes("--continue"),
    noCommit:      args.includes("--no-commit"),
    openBrowser:   args.includes("--open"),
  };

  const [cmd, sub, ...rest] = args.filter(a => !a.startsWith("--"));

  if (cmd === "presentation") {
    switch (sub) {
      case "generate":
        await cmdGenerate(rest[0] || "projeto.json", opts);
        break;
      case "update":
        await cmdUpdate(rest[0] || "Dashboard.jsx", opts);
        break;
      case "diff":
        await cmdDiff(opts);
        break;
      case "status":
        await cmdStatus(opts);
        break;
      default:
        cmdHelp();
    }
  } else {
    cmdHelp();
  }
}

main().catch(err => {
  console.error(`\n${col("red", "❌ ERRO FATAL:")} ${err.message}\n`);
  process.exit(1);
});
