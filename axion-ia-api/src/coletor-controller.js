/**
 * coletor-controller.js
 * Endpoints REST para coleta de fontes externas (PNCP, etc.).
 *
 * ISOLAMENTO: fontes coletadas vão para collection "fonte" — 
 * NUNCA para kb.json, KB embeddings ou engine.js.
 *
 * Endpoints:
 *   GET  /api/coletor/pncp            → busca prévia (sem salvar)
 *   POST /api/coletor/pncp/importar   → busca e salva como fonte
 *   POST /api/coletor/pncp/coletar    → coleta completa por produto
 *   GET  /api/coletor/config          → lê config de palavras-chave
 *   POST /api/coletor/config          → salva config de palavras-chave
 *   GET  /api/coletor/status          → status da última coleta automática
 */

import { buscarContratacoes, coletarPorProduto, PALAVRAS_CHAVE_PRODUTO, OPERACOES_AXHUB } from "./services/pncp.service.js";
import { pncpParaMd, tituloPncp } from "./services/parser.js";
import { Fonte } from "./models/fonte.model.js";
import { obterDicionario } from "./services/normalizador.js";

const PRODUTOS_VALIDOS = ["axhub", "axton", "axcross"];

// Estado da última coleta automática (em memória)
export const estadoColeta = {
  ativa: false,
  ultimaColeta: null,
  totalColetados: 0,
  totalNovos: 0,
  erros: [],
  agendada: false,
};

// Config de palavras-chave adicionais por produto (em memória — persiste até reinício)
const configPalavras = {
  axhub:   [],
  axton:   [],
  axcross: [],
};

// ─────────────────────────────────────────────────────────────────
// GET /api/coletor/pncp?produto=axhub&q=radar&pagina=1
// Busca prévia sem salvar (para prévia na tela)
// ─────────────────────────────────────────────────────────────────
export async function buscarPNCP(req, res) {
  try {
    const { q = "", produto = "axhub", pagina = 1, tamanhoPagina = 10 } = req.query;

    if (!PRODUTOS_VALIDOS.includes(produto)) {
      return res.status(400).json({ erro: "Produto inválido" });
    }

    const items = await buscarContratacoes({
      palavraChave: q,
      pagina: Number(pagina),
      tamanhoPagina: Number(tamanhoPagina),
    });

    // Detecta qual operação AxHub se relaciona com cada resultado
    const operacoes = produto === "axhub" ? OPERACOES_AXHUB : [];
    const qtermoBusca = q.toLowerCase();

    return res.json({
      total: items.length,
      pagina: Number(pagina),
      produto,
      items: items.map(i => {
        const texto = `${i.titulo || ""} ${i.resumo || ""}`.toLowerCase();
        const operacaoRelacionada = operacoes.find(op =>
          op.palavras.some(p => texto.includes(p.toLowerCase())) ||
          op.palavras.some(p => qtermoBusca.includes(p.toLowerCase()))
        ) || null;

        return {
          numero: i.numero,
          titulo: i.titulo,
          orgao: i.orgao,
          uf: i.uf,
          modalidade: i.modalidade,
          valor: i.valor,
          dataPublicacao: i.dataPublicacao,
          link: i.link,
          operacao: operacaoRelacionada
            ? { id: operacaoRelacionada.id, nome: operacaoRelacionada.nome, icone: operacaoRelacionada.icone }
            : null,
        };
      }),
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/coletor/operacoes?produto=axhub
// Retorna as operações disponíveis com suas palavras-chave
// ─────────────────────────────────────────────────────────────────
export async function listarOperacoes(req, res) {
  const { produto = "axhub" } = req.query;
  if (!PRODUTOS_VALIDOS.includes(produto)) {
    return res.status(400).json({ erro: "Produto inválido" });
  }
  const operacoes = produto === "axhub" ? OPERACOES_AXHUB : [];
  return res.json({ operacoes });
}

// ─────────────────────────────────────────────────────────────────
// POST /api/coletor/pncp/importar
// Body: { numeros: ["123", "456"], produto: "axhub" }
// Importa itens selecionados como fontes
// ─────────────────────────────────────────────────────────────────
export async function importarSelecionados(req, res) {
  try {
    const { itens = [], produto = "axhub" } = req.body;

    if (!PRODUTOS_VALIDOS.includes(produto)) {
      return res.status(400).json({ erro: "Produto inválido" });
    }
    if (!itens.length) {
      return res.status(400).json({ erro: "Envie pelo menos um item para importar" });
    }

    const salvos = [];
    const duplicados = [];

    for (const item of itens) {
      const md = pncpParaMd({ ...item, produto });
      const titulo = tituloPncp(item);

      // Evita duplicatas por número do edital
      const existe = await Fonte.findOne({ titulo: { $regex: item.numero, $options: "i" } });
      if (existe) {
        duplicados.push(item.numero);
        continue;
      }

      const fonte = await Fonte.create({
        produto,
        titulo,
        tipo: "requisito",
        conteudo: md,
        arquivo: `PNCP-${item.numero}`,
        status: "pendente",
      });
      salvos.push(fonte._id);
    }

    return res.json({
      sucesso: true,
      salvos: salvos.length,
      duplicados: duplicados.length,
      ids: salvos,
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// POST /api/coletor/pncp/coletar
// Body: { produto: "axhub" }
// Coleta automática completa por produto (todas as palavras-chave)
// ─────────────────────────────────────────────────────────────────
export async function coletarProduto(req, res) {
  try {
    const { produto = "axhub" } = req.body;

    if (!PRODUTOS_VALIDOS.includes(produto)) {
      return res.status(400).json({ erro: "Produto inválido" });
    }

    estadoColeta.ativa = true;

    const items = await coletarPorProduto(produto, configPalavras[produto]);

    let novos = 0;
    for (const item of items) {
      const titulo = tituloPncp(item);
      const existe = await Fonte.findOne({ titulo: { $regex: item.numero, $options: "i" } });
      if (!existe) {
        await Fonte.create({
          produto,
          titulo,
          tipo: "requisito",
          conteudo: pncpParaMd(item),
          arquivo: `PNCP-${item.numero}`,
          status: "pendente",
        });
        novos++;
      }
    }

    estadoColeta.ativa = false;
    estadoColeta.ultimaColeta = new Date().toISOString();
    estadoColeta.totalColetados += items.length;
    estadoColeta.totalNovos += novos;

    return res.json({
      sucesso: true,
      produto,
      totalEncontrados: items.length,
      novasFontes: novos,
    });
  } catch (err) {
    estadoColeta.ativa = false;
    estadoColeta.erros.push({ ts: new Date().toISOString(), erro: err.message });
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/coletor/config
// ─────────────────────────────────────────────────────────────────
export async function obterConfig(req, res) {
  return res.json({
    padrao: PALAVRAS_CHAVE_PRODUTO,
    adicionais: configPalavras,
    dicionarioNormalizador: obterDicionario(),
  });
}

// ─────────────────────────────────────────────────────────────────
// POST /api/coletor/config
// Body: { produto: "axhub", palavras: ["novo termo", ...] }
// ─────────────────────────────────────────────────────────────────
export async function salvarConfig(req, res) {
  try {
    const { produto, palavras = [] } = req.body;

    if (!PRODUTOS_VALIDOS.includes(produto)) {
      return res.status(400).json({ erro: "Produto inválido" });
    }

    configPalavras[produto] = palavras.filter(p => typeof p === "string" && p.trim());

    return res.json({ sucesso: true, produto, total: configPalavras[produto].length });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────
// GET /api/coletor/status
// ─────────────────────────────────────────────────────────────────
export async function statusColetor(req, res) {
  return res.json(estadoColeta);
}
