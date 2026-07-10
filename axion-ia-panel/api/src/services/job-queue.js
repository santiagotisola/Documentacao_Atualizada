/**
 * job-queue.js
 * Fila de processamento em lote para comparação de imagens.
 *
 * Usa p-queue para controle de concorrência (sem Redis).
 * Jobs são persistidos no MongoDB — sobrevivem a reinicializações.
 *
 * Fluxo:
 *   1. POST /api/jobs/comparar-pasta  → cria Job no Mongo → enfileira
 *   2. Worker processa cada imagem, atualiza progresso no Mongo em tempo real
 *   3. GET /api/jobs/:id             → retorna status + progresso + resultados parciais
 *   4. GET /api/jobs                 → lista jobs recentes
 */

import PQueue from "p-queue";
import { Job } from "../models/job.model.js";
import {
  resolverPastaSegura,
  gerarAHashPublico,
  distanciaHammingPublica,
  hammingParaScorePublico,
} from "./analise-imagem.js";
import { analisarImagem } from "./analise-imagem.js";
import fs from "fs";
import path from "path";

// Concorrência: processa 4 imagens simultaneamente no modo local
// No modo IA: 2 (respeita rate-limit do OpenAI)
const queueLocal = new PQueue({ concurrency: 4 });
const queueIA    = new PQueue({ concurrency: 2 });

const EXTENSOES_VALIDAS = [".jpg", ".jpeg", ".png", ".webp", ".bmp"];

/**
 * Cria um job no MongoDB e o enfileira para processamento.
 * Retorna o objeto Job criado (com _id).
 */
export async function criarJob({ pasta, modo, sistema, contexto, maxImagens, refBuffer, refMime, refNome }) {
  const refImageBase64 = refBuffer.toString("base64");

  const job = await Job.create({
    pasta,
    modo,
    sistema,
    contexto,
    maxImagens,
    refImageBase64,
    refImageMime: refMime,
    refImageNome: refNome,
    status: "pendente",
  });

  // Enfileira sem aguardar
  const fila = modo === "ia" ? queueIA : queueLocal;
  fila.add(() => processarJob(job._id.toString()));

  return job;
}

/**
 * Processa um job: carrega do Mongo, varre a pasta, atualiza progresso.
 */
async function processarJob(jobId) {
  const job = await Job.findById(jobId);
  if (!job) return;

  await Job.findByIdAndUpdate(jobId, {
    status: "processando",
    iniciadoEm: new Date(),
    processadas: 0,
    resultados: [],
  });

  try {
    const pastaAbsoluta = resolverPastaSegura(job.pasta);

    const arquivos = fs.readdirSync(pastaAbsoluta)
      .filter((f) => EXTENSOES_VALIDAS.includes(path.extname(f).toLowerCase()))
      .slice(0, job.maxImagens);

    const total = fs.readdirSync(pastaAbsoluta)
      .filter((f) => EXTENSOES_VALIDAS.includes(path.extname(f).toLowerCase()))
      .length;

    await Job.findByIdAndUpdate(jobId, { totalEncontradas: total });

    const refBuffer = Buffer.from(job.refImageBase64, "base64");

    // Hash de referência (modo local)
    let hashRef = null;
    if (job.modo === "local") {
      hashRef = await gerarAHashPublico(refBuffer);
    }

    // Processa em lotes de 10 para atualizar progresso frequentemente
    const LOTE = 10;
    for (let i = 0; i < arquivos.length; i += LOTE) {
      const lote = arquivos.slice(i, i + LOTE);

      const resultadosLote = await Promise.all(
        lote.map(async (nomeArq) => {
          const caminhoArq = path.join(pastaAbsoluta, nomeArq);
          try {
            const bufArq = fs.readFileSync(caminhoArq);

            if (job.modo === "local") {
              const hashArq = await gerarAHashPublico(bufArq);
              const distancia = distanciaHammingPublica(hashRef, hashArq);
              const similaridade = hammingParaScorePublico(distancia);

              return {
                nome: nomeArq,
                similaridade,
                distanciaHamming: distancia,
                modo: "local",
              };
            } else {
              // modo IA
              const ext = path.extname(nomeArq).toLowerCase();
              const mimeMap = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
              const mime = mimeMap[ext] ?? "image/jpeg";

              const resultado = await analisarImagem(
                bufArq,
                mime,
                job.sistema ?? "axhub",
                job.contexto ?? ""
              );

              return {
                nome: nomeArq,
                similaridade: resultado?.similaridade ?? null,
                placa_referencia: resultado?.placa_referencia,
                placa_candidato: resultado?.placa,
                mesmo_veiculo: resultado?.mesmo_veiculo,
                observacoes: resultado?.observacoes,
                modo: "ia",
              };
            }
          } catch (err) {
            return { nome: nomeArq, similaridade: 0, erro: err.message, modo: job.modo };
          }
        })
      );

      // Atualiza progresso no Mongo a cada lote
      await Job.findByIdAndUpdate(jobId, {
        $push: { resultados: { $each: resultadosLote } },
        $inc:  { processadas: lote.length },
      });
    }

    // Ordena resultados finais por similaridade desc
    const jobFinal = await Job.findById(jobId);
    const resultadosOrdenados = [...(jobFinal.resultados ?? [])]
      .sort((a, b) => (b.similaridade ?? 0) - (a.similaridade ?? 0));

    await Job.findByIdAndUpdate(jobId, {
      status: "concluido",
      concluidoEm: new Date(),
      resultados: resultadosOrdenados,
    });
  } catch (err) {
    await Job.findByIdAndUpdate(jobId, {
      status: "erro",
      erroMensagem: err.message,
      concluidoEm: new Date(),
    });
  }
}

/**
 * Status da fila em memória (tamanho + concorrência ativa).
 */
export function statusFila() {
  return {
    local: { pendentes: queueLocal.size, ativos: queueLocal.pending },
    ia:    { pendentes: queueIA.size,    ativos: queueIA.pending },
  };
}
