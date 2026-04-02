/**
 * doc-controller.js
 * Controladores para geração e salvamento de documentação via AxionIA.
 */

import { gerarDocumento, salvarDocumentoNoPortal, listarImagensProduto, SECOES } from "./doc-generator.js";

// POST /api/doc/gerar
export async function gerarDoc(req, res) {
  try {
    const { produto, tema, secao, tipo, detalhes, sidebar_position } = req.body;

    if (!produto || !tema || !secao) {
      return res.status(400).json({ erro: "Campos obrigatórios: produto, tema, secao" });
    }

    const produtosValidos = ["axhub", "axton", "axcross"];
    if (!produtosValidos.includes(produto.toLowerCase())) {
      return res.status(400).json({ erro: `Produto inválido. Use: ${produtosValidos.join(", ")}` });
    }

    const secoesValidas = SECOES[produto.toLowerCase()] || [];
    if (!secoesValidas.includes(secao)) {
      return res.status(400).json({
        erro: `Seção inválida para ${produto}. Disponíveis: ${secoesValidas.join(", ")}`,
      });
    }

    const resultado = await gerarDocumento({
      produto: produto.toLowerCase(),
      tema,
      secao,
      tipo: tipo || "Guia Analítico",
      detalhes,
      sidebar_position: sidebar_position || 1,
    });

    return res.json({
      sucesso: true,
      conteudo: resultado.conteudo,
      nomeArquivo: resultado.nomeArquivo,
      caminho: resultado.caminho,
      produto: resultado.produto,
      secao: resultado.secao,
      tokens_estimados: Math.ceil(resultado.conteudo.length / 4),
    });
  } catch (err) {
    console.error("[doc-generator] Erro ao gerar documento:", err.message);

    if (err.message?.includes("API key")) {
      return res.status(503).json({
        erro: "OpenAI API key não configurada. Configure OPENAI_API_KEY no .env",
      });
    }

    return res.status(500).json({ erro: err.message });
  }
}

// POST /api/doc/salvar
export async function salvarDoc(req, res) {
  try {
    const { conteudo, produto, secao, nomeArquivo } = req.body;

    if (!conteudo || !produto || !secao || !nomeArquivo) {
      return res.status(400).json({ erro: "Campos obrigatórios: conteudo, produto, secao, nomeArquivo" });
    }

    // Sanitiza o nome do arquivo para evitar path traversal
    const nomeSanitizado = nomeArquivo
      .replace(/\.\./g, "")
      .replace(/[/\\]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-");

    if (!nomeSanitizado.endsWith(".md")) {
      return res.status(400).json({ erro: "Nome do arquivo deve terminar em .md" });
    }

    const resultado = await salvarDocumentoNoPortal({
      conteudo,
      produto: produto.toLowerCase(),
      secao,
      nomeArquivo: nomeSanitizado,
    });

    return res.json({
      sucesso: true,
      filePath: resultado.filePath,
      mensagem: `Documento salvo em ${produto}/${secao}/${nomeSanitizado}. O portal atualiza automaticamente.`,
    });
  } catch (err) {
    console.error("[doc-generator] Erro ao salvar documento:", err.message);
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/doc/imagens/:produto
export async function listarImagens(req, res) {
  const { produto } = req.params;
  const imagens = listarImagensProduto(produto.toLowerCase());

  if (imagens.length === 0) {
    return res.status(404).json({ erro: `Produto não encontrado: ${produto}` });
  }

  return res.json({ produto, total: imagens.length, imagens });
}

// GET /api/doc/secoes/:produto
export async function listarSecoes(req, res) {
  const { produto } = req.params;
  const secoes = SECOES[produto.toLowerCase()];

  if (!secoes) {
    return res.status(404).json({ erro: `Produto não encontrado: ${produto}` });
  }

  return res.json({ produto, secoes });
}
