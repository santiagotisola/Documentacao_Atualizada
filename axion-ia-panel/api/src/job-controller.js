/**
 * job-controller.js
 * Endpoints para gerenciamento de jobs de processamento em lote.
 *
 * ROTAS:
 *   POST   /api/jobs/comparar-pasta   → cria job e enfileira
 *   GET    /api/jobs                  → lista jobs recentes (últimos 50)
 *   GET    /api/jobs/:id              → status + progresso + resultados
 *   DELETE /api/jobs/:id              → cancela/remove job
 */

import multer from "multer";
import { Job } from "./models/job.model.js";
import { criarJob, statusFila } from "./services/job-queue.js";
import { validarImagem } from "./services/analise-imagem.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
export const uploadJobMiddleware = upload.single("imagem");

// ── Criar novo job ────────────────────────────────────────────────────────────
export async function criarJobHandler(req, res) {
  try {
    validarImagem(req.file);

    const {
      pasta,
      modo       = "local",
      sistema    = "axhub",
      contexto   = "",
      maxImagens = 500,
    } = req.body;

    if (!pasta) {
      return res.status(400).json({ erro: 'Parâmetro "pasta" obrigatório.' });
    }

    const job = await criarJob({
      pasta,
      modo,
      sistema,
      contexto,
      maxImagens: Number(maxImagens) || 500,
      refBuffer: req.file.buffer,
      refMime:   req.file.mimetype,
      refNome:   req.file.originalname,
    });

    return res.status(201).json({
      sucesso: true,
      jobId:   job._id,
      status:  job.status,
      fila:    statusFila(),
    });
  } catch (err) {
    return res.status(422).json({ erro: err.message });
  }
}

// ── Listar jobs recentes ──────────────────────────────────────────────────────
export async function listarJobs(req, res) {
  try {
    const jobs = await Job.find(
      {},
      {
        tipo: 1, modo: 1, pasta: 1, status: 1,
        totalEncontradas: 1, processadas: 1,
        refImageNome: 1,
        iniciadoEm: 1, concluidoEm: 1,
        createdAt: 1,
        erroMensagem: 1,
      }
    )
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.json({ jobs, fila: statusFila() });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ── Status / resultado de um job ─────────────────────────────────────────────
export async function obterJob(req, res) {
  try {
    const job = await Job.findById(req.params.id)
      .select("-refImageBase64") // não retorna a imagem serializada
      .lean();

    if (!job) return res.status(404).json({ erro: "Job não encontrado." });

    // Calcula progresso percentual
    const progresso = job.totalEncontradas > 0
      ? Math.round((job.processadas / job.totalEncontradas) * 100)
      : 0;

    return res.json({ ...job, progresso });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ── Remover job ───────────────────────────────────────────────────────────────
export async function removerJob(req, res) {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ erro: "Job não encontrado." });

    // Só permite remover se não estiver processando
    if (job.status === "processando") {
      return res.status(409).json({ erro: "Não é possível remover um job em execução." });
    }

    await Job.findByIdAndDelete(req.params.id);
    return res.json({ sucesso: true });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
