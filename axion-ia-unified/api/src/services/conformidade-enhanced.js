/**
 * conformidade-enhanced.js
 * Versão melhorada de conformidade.js que integra:
 * - Extração de tabelas estruturadas
 * - Score de confiança por requisito
 * - Fila de revisão para itens incertos
 * - OCR automático para PDFs escaneados
 */

import { gerarRelatorioConformidade } from "./conformidade.js";
import { extrairEFormatarTabelas } from "./table-extractor.js";
import { avaliarConfiancaRequisito, identificarItensParaRevisao, calcularConfiancaAgregada } from "./confidence-scorer.js";
import { criarFilasDoRelatorio, resolverFilasAutomaticamente } from "./confidence-queue.js";
import Conformidade from "../models/conformidade.model.js";

/**
 * Versão enhancida de gerarRelatorioConformidade:
 * adiciona confiança, tabelas e fila de revisão automática.
 */
export async function gerarRelatorioConformidadeEnhanced({
  produto,
  tituloEdital,
  textoEdital,
  comJustificativas = true,
  extrairTabelas = true,
  calcularConfianca = true,
  criarFilaRevisao = true,
  limiarAutoResolve = 0.8,
}) {
  // Passo 0: Extrair tabelas do texto
  let metadadosTabelas = null;
  if (extrairTabelas) {
    metadadosTabelas = extrairEFormatarTabelas(textoEdital);
    console.log(`[Conformidade Enhanced] ${metadadosTabelas.total} tabelas extraídas`);
  }

  // Passo 1: Gerar relatório base (conformidade.js)
  const resultado = await gerarRelatorioConformidade({
    produto,
    tituloEdital,
    textoEdital,
    comJustificativas,
  });

  const { relatorio, stats } = resultado;

  // Passo 2: Calcular confiança para cada item (se habilitado)
  if (calcularConfianca && relatorio.itens) {
    console.log(`[Conformidade Enhanced] Calculando confiança para ${relatorio.itens.length} itens...`);

    relatorio.itens = relatorio.itens.map(item => ({
      ...item,
      confianca: avaliarConfiancaRequisito(
        {
          texto: item.requisito,
          origem: item.origem,
          secao: item.referenciaDoc,
        },
        [] // Poderia passar docsTexto se tivesse
      ),
    }));

    // Calcular confiança agregada
    relatorio.confiancaAgregada = calcularConfiancaAgregada(relatorio.itens);
    relatorio.metadadosTabelas = metadadosTabelas;

    // Salvar com os novos campos
    await Conformidade.findByIdAndUpdate(relatorio._id, {
      confiancaAgregada: relatorio.confiancaAgregada,
      metadadosTabelas: metadadosTabelas,
      itens: relatorio.itens,
    });
  }

  // Passo 3: Criar fila de revisão para itens com baixa confiança
  if (criarFilaRevisao && relatorio.itens) {
    const itensIncertos = identificarItensParaRevisao(relatorio.itens, 0.6);

    if (itensIncertos.length > 0) {
      console.log(
        `[Conformidade Enhanced] ${itensIncertos.length} itens com confiança < 0.6 adicionados à fila de revisão`
      );

      await criarFilasDoRelatorio(relatorio._id, itensIncertos);

      // Auto-resolver os que têm confiança MUITO ALTA
      const autoResolvidos = await resolverFilasAutomaticamente(relatorio._id, limiarAutoResolve);
      console.log(
        `[Conformidade Enhanced] ${autoResolvidos.total} itens auto-resolvidos (confiança >= ${limiarAutoResolve})`
      );
    }
  }

  return {
    relatorio,
    stats: {
      ...stats,
      confiancaAgregada: relatorio.confiancaAgregada,
      tabelas_encontradas: metadadosTabelas?.total || 0,
      itens_para_revisao: relatorio.itens
        ? identificarItensParaRevisao(relatorio.itens, 0.6).length
        : 0,
    },
  };
}

/**
 * Wrapper para o controller usar a versão enhancida
 */
export async function gerarRelatorioComEnhancementHandler(req, res) {
  const {
    produto,
    tituloEdital,
    textoEdital,
    comJustificativas = true,
    comConfianca = true,
    comTabelas = true,
    comFilaRevisao = true,
    limiarAutoResolve = 0.8,
  } = req.body;

  if (!produto || !textoEdital) {
    return res.status(400).json({
      erro: "Campos obrigatórios: produto, textoEdital",
    });
  }

  try {
    const resultado = await gerarRelatorioConformidadeEnhanced({
      produto: produto.toLowerCase(),
      tituloEdital,
      textoEdital,
      comJustificativas,
      extrairTabelas: comTabelas,
      calcularConfianca: comConfianca,
      criarFilaRevisao: comFilaRevisao,
      limiarAutoResolve: Number(limiarAutoResolve),
    });

    return res.status(201).json({
      sucesso: true,
      ...resultado,
    });
  } catch (err) {
    console.error("[Conformidade Enhanced] Erro:", err.message);
    return res.status(500).json({ erro: err.message });
  }
}
