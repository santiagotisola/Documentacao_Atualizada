/**
 * Controller de administração da KB — re-indexação de docs e Jitbit.
 * Executa os scripts seed-docs.js e seed-jitbit.js como processos filhos.
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { KB } from "./models/kb.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function executarScript(nomeScript) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "scripts", nomeScript);
    const processo = spawn("node", [scriptPath], {
      cwd: path.join(__dirname, ".."),
      env: process.env,
    });

    const linhas = [];

    processo.stdout.on("data", (data) => {
      const texto = data.toString();
      linhas.push(texto);
    });

    processo.stderr.on("data", (data) => {
      linhas.push(`[stderr] ${data.toString()}`);
    });

    processo.on("close", (code) => {
      const saida = linhas.join("").trim();
      if (code === 0) {
        resolve(saida);
      } else {
        reject(new Error(`Script ${nomeScript} saiu com código ${code}.\n${saida}`));
      }
    });
  });
}

/** POST /api/admin/reindexar-docs */
export async function reindexarDocs(req, res) {
  try {
    const saida = await executarScript("seed-docs.js");
    const totalLine = saida.match(/Importados\s*:\s*(\d+)/);
    const total = totalLine ? parseInt(totalLine[1]) : null;
    res.json({ ok: true, total, saida });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
}

/** POST /api/admin/reindexar-jitbit */
export async function reindexarJitbit(req, res) {
  try {
    const saida = await executarScript("seed-jitbit.js");
    const totalLine = saida.match(/Importados\s*:\s*(\d+)/);
    const total = totalLine ? parseInt(totalLine[1]) : null;
    res.json({ ok: true, total, saida });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
}

/** GET /api/admin/kb/stats — estatísticas da KB por módulo */
export async function statsKB(req, res) {
  try {
    const agrupado = await KB.aggregate([
      { $group: { _id: "$modulo", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const totalGeral = agrupado.reduce((s, g) => s + g.total, 0);

    res.json({
      totalGeral,
      porModulo: agrupado.map((g) => ({ modulo: g._id, total: g.total })),
    });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
}

/** DELETE /api/admin/kb/:modulo — remove todas as entradas de um módulo */
export async function limparModuloKB(req, res) {
  const { modulo } = req.params;
  const modulosValidos = ["axhub", "axton", "axcross", "jitbit"];

  if (!modulosValidos.includes(modulo)) {
    return res.status(400).json({ ok: false, erro: `Módulo inválido. Use: ${modulosValidos.join(", ")}` });
  }

  try {
    const resultado = await KB.deleteMany({ modulo });
    res.json({ ok: true, removidos: resultado.deletedCount });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
}
