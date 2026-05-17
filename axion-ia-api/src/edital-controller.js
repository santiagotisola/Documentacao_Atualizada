/**
 * Busca e Análise de Editais — Controller
 * Endpoints para buscar editais gov, importar, e gerar análise automática
 */

import express from "express";
import { buscarEditaisPNCP, extrairEspecificacoes, normalizarEdital, verificarDuplicata, sugerirProdutos } from "./services/pncp-scraper.js";
import { Fonte } from "./models/fonte.model.js";
import { gerarRelatorioConformidadeEnhanced } from "./services/conformidade-enhanced.js";
import { analisarEditalCompleto } from "./services/edital-analise-avancada.js";
import { extrairTexto } from "./services/extrator.js";
import { listarSites, getSiteConfig } from "./config/sites.js";
import multer from "multer";

// ─── Multer para upload de editais (PDF, DOCX, TXT) ────────────────
const uploadEdital = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "text/plain", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx?|txt|xlsx?)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Formato não suportado. Use PDF, DOCX, TXT ou XLSX."));
    }
  },
});

export const uploadEditalMiddleware = (req, res, next) => {
  uploadEdital.single("arquivo")(req, res, (err) => {
    if (err) return res.status(400).json({ erro: err.message });
    next();
  });
};

/**
 * GET /api/edital/buscar?q=90.021
 * Buscar editais na plataforma governamental
 */
export async function buscarEditaisGovHandler(req, res) {
  try {
    const { q, tipo, orgao, status } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ erro: "Termo de busca inválido" });
    }

    // Buscar editais
    const editais = await buscarEditaisPNCP(q, { tipo, orgao, status });

    if (!editais || editais.length === 0) {
      return res.json({
        sucesso: true,
        total: 0,
        termo: q,
        editais: [],
        mensagem: "Nenhum edital encontrado",
      });
    }

    // Normalizar dados
    const editaisNormalizados = editais.map(e => normalizarEdital(e));

    res.json({
      sucesso: true,
      total: editaisNormalizados.length,
      termo: q,
      editais: editaisNormalizados,
    });
  } catch (erro) {
    console.error("❌ Erro ao buscar editais:", erro);
    res.status(500).json({ erro: "Erro ao buscar editais" });
  }
}

/**
 * POST /api/edital/importar
 * Importar edital para base de dados (Fontes)
 */
export async function importarEditalHandler(req, res) {
  try {
    const { numero, titulo, descricao, link, orgao, tipo, conteudo } = req.body;

    if (!numero || !titulo) {
      return res.status(400).json({ erro: "Número e título são obrigatórios" });
    }

    // Verificar duplicata
    const existe = await Fonte.findOne({ numero });
    if (existe) {
      return res.status(409).json({
        erro: "Edital já importado",
        id: existe._id,
      });
    }

    // Criar entrada em Fontes
    const novaFonte = new Fonte({
      numero,
      titulo,
      tipo: tipo || "Pregão",
      produto: "não-determinado", // Será atualizado após análise
      conteudo: conteudo || descricao || titulo,
      link,
      orgao,
      fonte: "PNCP/GOV.BR",
      importadoEm: new Date(),
    });

    await novaFonte.save();

    // Sugerir produtos baseado em conteúdo
    const produtosSugeridos = sugerirProdutos(conteudo || descricao || titulo);

    res.status(201).json({
      sucesso: true,
      id: novaFonte._id,
      mensagem: "Edital importado com sucesso",
      produtosSugeridos,
    });
  } catch (erro) {
    console.error("❌ Erro ao importar edital:", erro);
    res.status(500).json({ erro: "Erro ao importar edital" });
  }
}

/**
 * POST /api/edital/analisar-rapido
 * Buscar + Importar + Gerar análise em uma única chamada
 */
export async function analisarEditalRapidoHandler(req, res) {
  try {
    const {
      numero,
      titulo,
      conteudo,
      produtos = ["axhub", "axton", "axcross"],
      comConfianca = true,
      comTabelas = true,
    } = req.body;

    if (!numero || !conteudo) {
      return res.status(400).json({
        erro: "Número do edital e conteúdo são obrigatórios",
      });
    }

    // 1. Verificar se já existe
    let fonte = await Fonte.findOne({ numero });

    if (!fonte) {
      // 2. Importar novo edital
      fonte = new Fonte({
        numero,
        titulo: titulo || `Edital ${numero}`,
        tipo: "Pregão",
        produto: "multi",
        conteudo,
        fonte: "PNCP/GOV.BR",
        importadoEm: new Date(),
      });
      await fonte.save();
    }

    // 3. Gerar análise multi-produto
    const analise = await gerarRelatorioConformidadeEnhanced({
      tituloEdital: fonte.titulo,
      textoEdital: conteudo,
      produtos,
      comConfianca,
      comTabelas,
      limiarAutoResolve: 0.8,
    });

    res.status(201).json({
      sucesso: true,
      editalId: fonte._id,
      analiseId: analise._id,
      resumo: analise.resumo,
      stats: analise.stats,
    });
  } catch (erro) {
    console.error("❌ Erro ao analisar edital:", erro);
    res.status(500).json({ erro: "Erro ao analisar edital" });
  }
}

/**
 * GET /api/edital/historico
 * Listar todos os editais importados
 */
export async function listarEditaisImportadosHandler(req, res) {
  try {
    const { pagina = 1, limite = 20, filtro = "todos" } = req.query;

    const skip = (pagina - 1) * limite;

    let query = { fonte: "PNCP/GOV.BR" };

    const editais = await Fonte.find(query)
      .sort({ importadoEm: -1 })
      .skip(skip)
      .limit(parseInt(limite))
      .lean();

    const total = await Fonte.countDocuments(query);

    res.json({
      sucesso: true,
      total,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      editais,
    });
  } catch (erro) {
    console.error("❌ Erro ao listar editais:", erro);
    res.status(500).json({ erro: "Erro ao listar editais" });
  }
}

/**
 * POST /api/edital/auto-analisar-todos
 * Analisar automaticamente todos os editais importados (batch)
 */
export async function autoAnalisarTodosHandler(req, res) {
  try {
    const { limite = 10 } = req.body;

    // Buscar editais ainda não analisados
    const editaisNaoAnalisados = await Fonte.find({
      fonte: "PNCP/GOV.BR",
      analisado: { $ne: true },
    })
      .limit(parseInt(limite))
      .lean();

    if (editaisNaoAnalisados.length === 0) {
      return res.json({
        sucesso: true,
        analisados: 0,
        mensagem: "Nenhum edital pendente de análise",
      });
    }

    const resultados = [];

    for (const edital of editaisNaoAnalisados) {
      try {
        const analise = await gerarRelatorioConformidadeEnhanced({
          tituloEdital: edital.titulo,
          textoEdital: edital.conteudo,
          produtos: ["axhub", "axton", "axcross"],
          comConfianca: true,
          comTabelas: true,
        });

        // Marcar como analisado
        await Fonte.updateOne(
          { _id: edital._id },
          { analisado: true, ultimaAnaliseEm: new Date() }
        );

        resultados.push({
          id: edital._id,
          titulo: edital.titulo,
          status: "✅ Analisado",
          analiseId: analise._id,
        });
      } catch (err) {
        resultados.push({
          id: edital._id,
          titulo: edital.titulo,
          status: "❌ Erro",
          erro: err.message,
        });
      }
    }

    res.json({
      sucesso: true,
      analisados: resultados.length,
      resultados,
    });
  } catch (erro) {
    console.error("❌ Erro ao auto-analisar editais:", erro);
    res.status(500).json({ erro: "Erro ao auto-analisar editais" });
  }
}

/**
 * POST /api/edital/analise-avancada
 * Análise completa: decomposição categórica + de-para + concorrentes + mercado + prompt adequação
 */
export async function analiseAvancadaHandler(req, res) {
  try {
    const {
      textoEdital,
      titulo = "Edital Informado",
      orgao = "Não identificado",
      regiao = "Não informada",
      siteId = null,
      incluirConcorrentes = true,
      incluirMercado = true,
      incluirPromptAdequacao = true,
    } = req.body;

    if (!textoEdital || textoEdital.trim().length < 50) {
      return res.status(400).json({
        erro: "Texto do edital é obrigatório (mínimo 50 caracteres)",
      });
    }

    // Resolver site selecionado (se houver)
    let siteConfig = null;
    if (siteId) {
      siteConfig = getSiteConfig(siteId);
      console.log(`[Análise Avançada] Site selecionado: ${siteConfig?.produtoLabel} — ${siteConfig?.nome} (${siteConfig?.url})`);
    }

    const resultado = await analisarEditalCompleto(textoEdital, {
      titulo,
      orgao,
      regiao,
      siteId,
      siteConfig,
      incluirConcorrentes,
      incluirMercado,
      incluirPromptAdequacao,
    });

    res.status(201).json({
      sucesso: true,
      siteValidado: siteConfig ? { id: siteId, produto: siteConfig.produtoLabel, nome: siteConfig.nome, url: siteConfig.url } : null,
      ...resultado,
    });
  } catch (erro) {
    console.error("❌ Erro na análise avançada:", erro);
    res.status(500).json({ erro: "Erro ao processar análise avançada do edital" });
  }
}

/**
 * GET /api/sites
 * Lista todos os sites/instâncias disponíveis (sem credenciais)
 */
export function listarSitesHandler(req, res) {
  res.json(listarSites());
}

/**
 * POST /api/edital/upload
 * Upload de arquivo (PDF/DOCX/TXT) → extrai texto → retorna para o frontend preencher
 */
export async function uploadEditalHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    console.log(`[Edital Upload] Extraindo texto de: ${originalname} (${(size / 1024).toFixed(1)} KB)`);

    const texto = await extrairTexto(buffer, mimetype, originalname);

    if (!texto || texto.trim().length < 10) {
      return res.status(422).json({
        erro: "Não foi possível extrair texto do arquivo. Verifique se o PDF não é apenas imagem escaneada.",
      });
    }

    res.json({
      sucesso: true,
      arquivo: originalname,
      tamanho: size,
      caracteres: texto.length,
      linhas: texto.split("\n").length,
      texto,
    });
  } catch (erro) {
    console.error("❌ Erro ao extrair texto do edital:", erro);
    res.status(500).json({ erro: "Erro ao processar arquivo do edital" });
  }
}
