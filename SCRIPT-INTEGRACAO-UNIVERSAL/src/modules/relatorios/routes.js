import { Router } from "express";
import { dbAdapter } from "../database/adapter.js";
import fs from "fs/promises";
import path from "path";

export const relatorioRouter = Router();

// ============================================
// TEMPLATES DE RELATÓRIO (PERSONALIZE AQUI)
// ============================================
const templates = {
  vendas_diarias: {
    nome: "Vendas do Dia",
    tipo: "operacional",
    query: "SELECT * FROM vendas WHERE DATE(data_venda) = CURDATE() ORDER BY data_venda DESC",
    sistema: "erp_principal"
  },
  estoque_critico: {
    nome: "Estoque Crítico",
    tipo: "operacional",
    query: "SELECT codigo, nome, estoque_atual, estoque_minimo FROM produtos WHERE estoque_atual < estoque_minimo AND ativo = 1",
    sistema: "erp_principal"
  },
  tickets_abertos: {
    nome: "Tickets Abertos",
    tipo: "operacional",
    fonte: "mongodb",
    collection: "tickets",
    filtro: { status: { $in: ["aberto", "em_andamento"] } }
  },
  sla_compliance: {
    nome: "Compliance SLA",
    tipo: "gerencial",
    fonte: "mongodb",
    collection: "tickets",
    aggregation: [
      { $match: { createdAt: { $gte: "{{data_inicio}}" } } },
      { $group: { _id: "$prioridade", total: { $sum: 1 }, violados: { $sum: { $cond: ["$sla.violado", 1, 0] } } } }
    ]
  }
};

// GET /api/relatorio/templates — Listar templates disponíveis
relatorioRouter.get("/templates", (req, res) => {
  const lista = Object.entries(templates).map(([id, t]) => ({
    id, nome: t.nome, tipo: t.tipo
  }));
  res.json(lista);
});

// POST /api/relatorio/gerar — Gerar relatório
relatorioRouter.post("/gerar", async (req, res) => {
  try {
    const { template_id, parametros = {}, formato = "json" } = req.body;
    
    if (!template_id) return res.status(400).json({ erro: "template_id é obrigatório" });
    
    const template = templates[template_id];
    if (!template) return res.status(404).json({ erro: `Template '${template_id}' não encontrado` });

    let dados;

    if (template.fonte === "mongodb") {
      // Busca no MongoDB via Mongoose
      const mongoose = (await import("mongoose")).default;
      const collection = mongoose.connection.collection(template.collection);
      
      if (template.aggregation) {
        dados = await collection.aggregate(template.aggregation).toArray();
      } else {
        dados = await collection.find(template.filtro || {}).sort({ createdAt: -1 }).limit(500).toArray();
      }
    } else {
      // Busca no banco SQL
      dados = await dbAdapter.executarQuery(template.sistema, template.query);
    }

    // Formato de saída
    if (formato === "json") {
      return res.json({
        relatorio: template.nome,
        tipo: template.tipo,
        gerado_em: new Date().toISOString(),
        total_registros: dados.length,
        dados
      });
    }

    if (formato === "csv") {
      const csv = gerarCSV(dados);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${template_id}_${Date.now()}.csv"`);
      return res.send(csv);
    }

    if (formato === "html") {
      const html = gerarHTML(template.nome, dados);
      return res.send(html);
    }

    res.json({ relatorio: template.nome, dados });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/relatorio/custom — Relatório com query custom
relatorioRouter.post("/custom", async (req, res) => {
  try {
    const { sistema_id, query, titulo = "Relatório Custom" } = req.body;
    if (!sistema_id || !query) {
      return res.status(400).json({ erro: "sistema_id e query são obrigatórios" });
    }

    // Segurança: apenas SELECT permitido
    if (!query.trim().toUpperCase().startsWith("SELECT")) {
      return res.status(403).json({ erro: "Apenas queries SELECT são permitidas" });
    }

    const dados = await dbAdapter.executarQuery(sistema_id, query);
    res.json({
      relatorio: titulo,
      gerado_em: new Date().toISOString(),
      total_registros: dados.length,
      dados
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ============================================
// GERADORES DE FORMATO
// ============================================

function gerarCSV(dados) {
  if (!dados.length) return "";
  const headers = Object.keys(dados[0]);
  const linhas = dados.map(row => headers.map(h => {
    const val = row[h] ?? "";
    return typeof val === "string" && val.includes(",") ? `"${val}"` : val;
  }).join(","));
  return [headers.join(","), ...linhas].join("\n");
}

function gerarHTML(titulo, dados) {
  if (!dados.length) return `<html><body><h1>${titulo}</h1><p>Sem dados.</p></body></html>`;
  
  const headers = Object.keys(dados[0]);
  const thHtml = headers.map(h => `<th>${h}</th>`).join("");
  const trHtml = dados.map(row => {
    const tds = headers.map(h => `<td>${row[h] ?? ""}</td>`).join("");
    return `<tr>${tds}</tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${titulo}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .meta { color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${titulo}</h1>
  <p class="meta">Gerado em: ${new Date().toLocaleString("pt-BR")} | Total: ${dados.length} registros</p>
  <table>
    <thead><tr>${thHtml}</tr></thead>
    <tbody>${trHtml}</tbody>
  </table>
</body>
</html>`;
}
