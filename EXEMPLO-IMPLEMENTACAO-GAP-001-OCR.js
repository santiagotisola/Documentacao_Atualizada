/**
 * EXEMPLO DE IMPLEMENTAÇÃO: GAP-001 — OCR Avançado com GPT-4o Vision
 * 
 * Este arquivo mostra EXATAMENTE como codificar o primeiro gap
 * Você pode copiar/adaptar este padrão para os outros 7 gaps
 */

// ============================================================================
// 1️⃣ BACKEND: axion-ia-api/src/services/ocr-advanced.js
// ============================================================================

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

/**
 * Service de OCR avançado com fallback GPT-4o Vision
 * 
 * Fluxo:
 * 1. Tenta extrair texto com pdf-parse (rápido)
 * 2. Se falhar ou resultado vazio → usa GPT-4o Vision
 * 3. Retorna texto estruturado com confiança da extração
 */

export class OCRAdvancedService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.pdfParse = require("pdf-parse");
  }

  /**
   * Analisar documento PDF (nativo ou escaneado)
   * @param {Buffer|string} arquivo - Buffer do PDF ou caminho do arquivo
   * @returns {object} { texto, confianca, tipo, páginas }
   */
  async analisarDocumento(arquivo) {
    let buffer;
    let nomeArquivo = "documento.pdf";

    // Se for string, é caminho do arquivo
    if (typeof arquivo === "string") {
      nomeArquivo = path.basename(arquivo);
      buffer = fs.readFileSync(arquivo);
    } else {
      buffer = arquivo;
    }

    try {
      console.log("🔍 [OCR] Tentando extração nativa com pdf-parse...");

      // PASSO 1: Tentar extração rápida com pdf-parse
      const resultadoNativo = await this.pdfParse(buffer);
      const textoExtraido = resultadoNativo.text || "";
      const paginas = resultadoNativo.numpages || 1;

      // Se extraiu mais de 100 caracteres, é provavelmente PDF nativo
      if (textoExtraido.trim().length > 100) {
        console.log("✅ [OCR] Extração nativa bem-sucedida");
        return {
          texto: textoExtraido,
          confianca: 95, // Alta confiança em PDF nativo
          tipo: "pdf_nativo",
          paginas,
          metodo: "pdf-parse",
        };
      }

      // PASSO 2: Se falhou, usar GPT-4o Vision
      console.log("⚠️ [OCR] Extração nativa falhou. Acionando GPT-4o Vision...");
      return await this.analisarComGPTVision(buffer, nomeArquivo, paginas);
    } catch (erro) {
      console.error("❌ [OCR] Erro durante análise:", erro.message);

      // Fallback final: retornar array vazio com erro
      return {
        texto: "",
        confianca: 0,
        tipo: "erro",
        paginas: 0,
        erro: erro.message,
      };
    }
  }

  /**
   * Análise com GPT-4o Vision (para PDFs escaneados)
   * @private
   */
  async analisarComGPTVision(buffer, nomeArquivo, numPaginas) {
    try {
      // Converter PDF para imagens (usa sharp + pdf2pic ou similar)
      // Para simplificar, assumimos que temos o buffer como imagem (ou PDF de 1 página)

      const base64 = buffer.toString("base64");
      const mimeType = "application/pdf"; // ou "image/jpeg" se já convertido

      console.log("📸 [GPT Vision] Enviando para análise...");

      // Chamar OpenAI GPT-4o Vision
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Por favor, extraia TODO o texto deste documento PDF/imagem. 
                  Estruture assim:
                  
                  TÍTULO: [título do documento]
                  NÚMERO: [número/ID se houver]
                  DATA: [data se houver]
                  CONTEÚDO:
                  [texto completo, preservando estrutura e parágrafos]
                  
                  Seja o mais preciso possível.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 4000,
          temperature: 0.3, // Baixa temperatura para precisão
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const textoExtraido = response.data.choices[0].message.content;

      console.log("✅ [GPT Vision] Extração concluída");

      return {
        texto: textoExtraido,
        confianca: 85, // Ligeiramente menor que pdf-parse nativo
        tipo: "pdf_escaneado",
        paginas: numPaginas,
        metodo: "gpt-4o-vision",
        custo_api: "~$0.003 por página",
      };
    } catch (erro) {
      console.error("❌ [GPT Vision] Erro:", erro.message);
      throw erro;
    }
  }

  /**
   * Extrair seções estruturadas de um texto de edital
   * @param {string} texto - Texto completo do edital
   * @returns {object} Seções estruturadas
   */
  async estruturarEdital(texto) {
    if (!texto || texto.length < 100) {
      return { erro: "Texto insuficiente para estruturação" };
    }

    const estrutura = {
      titulo: this.extrairTitulo(texto),
      numero: this.extrairNumero(texto),
      orgao: this.extrairOrgao(texto),
      data: this.extrairData(texto),

      secoes: {
        objetivo: this.extrairSecao(texto, "objetivo"),
        requisitos: this.extrairSecao(texto, "requisito"),
        especificacoes: this.extrairSecao(texto, "especificação"),
        conformidades: this.extrairSecao(texto, "conformidade"),
        integracacoes: this.extrairSecao(texto, "integração"),
        prazos: this.extrairSecao(texto, "prazo"),
      },

      resumo: texto.substring(0, 500), // Primeiras 500 caracteres
      caracteres_totais: texto.length,
    };

    return estrutura;
  }

  // ─── Métodos Auxiliares de Parsing ───

  extrairTitulo(texto) {
    const match = texto.match(/^[A-Z][^\n]{10,100}/m);
    return match ? match[0].trim() : "Sem título";
  }

  extrairNumero(texto) {
    const match = texto.match(/(\d{4}\.\d{1,5}|\d{6,8})/);
    return match ? match[0] : "N/A";
  }

  extrairOrgao(texto) {
    const keywords = ["CONAB", "DNIT", "DETRAN", "Ministério", "Prefeitura", "Secretaria"];
    for (const keyword of keywords) {
      if (texto.includes(keyword)) return keyword;
    }
    return "Órgão não identificado";
  }

  extrairData(texto) {
    const match = texto.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    return match ? match[0] : "N/A";
  }

  extrairSecao(texto, keyword) {
    const regex = new RegExp(`${keyword}.*?(?=\\n[A-Z]|$)`, "i");
    const match = texto.match(regex);
    return match ? match[0].trim().substring(0, 300) : null;
  }
}

// ============================================================================
// 2️⃣ BACKEND: axion-ia-api/src/ocr-controller.js
// ============================================================================

import express from "express";
import multer from "multer";
import { OCRAdvancedService } from "./services/ocr-advanced.js";

const ocr = new OCRAdvancedService();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/ocr/analisar
 * Upload PDF → OCR (nativo ou GPT-4o Vision) → Retorna texto estruturado
 */
export async function analisarPDFHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Arquivo PDF não fornecido" });
    }

    console.log(`📄 [OCR] Analisando: ${req.file.originalname}`);

    // Executar OCR
    const resultado = await ocr.analisarDocumento(req.file.buffer);

    if (resultado.erro) {
      return res.status(500).json({
        sucesso: false,
        erro: "Falha na análise OCR",
        detalhes: resultado.erro,
      });
    }

    // Estruturar edital se solicitado
    const estruturado = await ocr.estruturarEdital(resultado.texto);

    res.json({
      sucesso: true,
      arquivo: req.file.originalname,
      metodo_extracao: resultado.metodo,
      confianca: resultado.confianca + "%",
      tipo_documento: resultado.tipo,
      paginas: resultado.paginas,

      texto: {
        completo: resultado.texto.substring(0, 2000), // Primeiros 2000 caracteres
        caracteres_totais: resultado.texto.length,
      },

      estrutura: estruturado,

      tempo_processamento_ms: Date.now() - req.startTime,
    });
  } catch (erro) {
    console.error("❌ Erro em analisarPDFHandler:", erro);
    res.status(500).json({ erro: "Erro ao processar PDF" });
  }
}

/**
 * POST /api/edital/ocr-analisar
 * Wrapper: Upload PDF → OCR → Importar para Fonte DB → Análise de conformidade
 */
export async function ocrEditaiAutoHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "PDF do edital não fornecido" });
    }

    // 1. OCR
    const resultadoOCR = await ocr.analisarDocumento(req.file.buffer);

    if (resultadoOCR.erro) {
      return res.status(500).json({ erro: "Falha no OCR" });
    }

    // 2. Estruturar
    const estrutura = await ocr.estruturarEdital(resultadoOCR.texto);

    // 3. Importar para banco (Fonte collection)
    const novaFonte = new Fonte({
      numero: estrutura.numero,
      titulo: estrutura.titulo,
      conteudo: resultadoOCR.texto,
      orgao: estrutura.orgao,
      fonte: "EDITAL_OCR",
      importadoEm: new Date(),
    });

    await novaFonte.save();

    // 4. Gerar análise automática
    const analise = await gerarRelatorioConformidadeEnhanced({
      tituloEdital: estrutura.titulo,
      textoEdital: resultadoOCR.texto,
      produtos: ["axhub", "axton", "axcross"],
    });

    res.json({
      sucesso: true,
      edital: {
        id: novaFonte._id,
        numero: estrutura.numero,
        titulo: estrutura.titulo,
        orgao: estrutura.orgao,
      },
      ocr: {
        metodo: resultadoOCR.metodo,
        confianca: resultadoOCR.confianca + "%",
      },
      analise: {
        id: analise._id,
        veredicto: analise.resumo.veredicto,
        conformidade: analise.stats.percentual + "%",
      },
    });
  } catch (erro) {
    console.error("❌ Erro em ocrEditaiAutoHandler:", erro);
    res.status(500).json({ erro: "Erro ao processar edital" });
  }
}

// ============================================================================
// 3️⃣ INTEGRAÇÃO: axion-ia-api/src/routes.js
// ============================================================================

// Adicionar essas linhas em routes.js:

import { analisarPDFHandler, ocrEditaiAutoHandler } from "./ocr-controller.js";

// ... dentro da definição de rotas ...

// OCR Endpoints
router.post("/ocr/analisar", upload.single("pdf"), analisarPDFHandler);
router.post(
  "/edital/ocr-analisar",
  upload.single("edital_pdf"),
  ocrEditaiAutoHandler
);

// ============================================================================
// 4️⃣ FRONTEND: axion-ia-panel/src/pages/OCRAnalyzer.jsx
// ============================================================================

import React, { useState } from "react";
import { api } from "../services/api";
import "./OCRAnalyzer.css";

export default function OCRAnalyzer() {
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArquivo(file);
    setErro(null);
    setResultado(null);
    setProcessando(true);

    const formData = new FormData();
    formData.append("edital_pdf", file);

    try {
      const response = await api.post("/edital/ocr-analisar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResultado(response.data);
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao processar PDF");
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="ocr-analyzer">
      <h2>📄 Análise OCR de Edital</h2>

      {/* Upload */}
      <div className="upload-area">
        <input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          disabled={processando}
        />
        <p>Selecione um PDF (nativo ou escaneado)</p>
      </div>

      {/* Processando */}
      {processando && (
        <div className="spinner">
          <p>🔄 Processando OCR...</p>
          <p className="small">Pode levar até 1 minuto para PDFs escaneados</p>
        </div>
      )}

      {/* Erro */}
      {erro && <div className="error">{erro}</div>}

      {/* Resultado */}
      {resultado && (
        <div className="resultado">
          <h3>✅ Análise Concluída</h3>

          <div className="info-box">
            <p>
              <strong>Método:</strong> {resultado.ocr.metodo}
            </p>
            <p>
              <strong>Confiança:</strong> {resultado.ocr.confianca}
            </p>
            <p>
              <strong>Número:</strong> {resultado.edital.numero}
            </p>
            <p>
              <strong>Título:</strong> {resultado.edital.titulo}
            </p>
          </div>

          <div className="analise-box">
            <h4>📊 Análise de Conformidade</h4>
            <p>
              <strong>{resultado.analise.veredicto}</strong>
            </p>
            <p>Conformidade: {resultado.analise.conformidade}</p>
          </div>

          <div className="texto-box">
            <h4>📝 Texto Extraído (preview)</h4>
            <pre>{resultado.texto_preview}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 5️⃣ PACKAGE.JSON — Dependências Novas
// ============================================================================

// Adicionar ao package.json do axion-ia-api:
{
  "dependencies": {
    "openai": "^4.0.0",  // Já tem
    "pdf-parse": "^1.1.4", // Já tem
    "form-data": "^4.0.0", // NOVO
    "axios": "^1.7.9"  // Já tem
  }
}

// Adicionar variável ambiente:
// .env:
OPENAI_API_KEY=sk-proj-xxxxxxxx

// ============================================================================
// 6️⃣ TESTES — test/ocr.test.js
// ============================================================================

import { OCRAdvancedService } from "../src/services/ocr-advanced.js";
import fs from "fs";

describe("OCRAdvancedService", () => {
  const ocr = new OCRAdvancedService();

  test("Extrair PDF nativo com sucesso", async () => {
    const buffer = fs.readFileSync("./test/fixtures/edital-nativo.pdf");
    const resultado = await ocr.analisarDocumento(buffer);

    expect(resultado.confianca).toBeGreaterThan(90);
    expect(resultado.tipo).toBe("pdf_nativo");
    expect(resultado.texto.length).toBeGreaterThan(100);
  });

  test("Extrair PDF escaneado com GPT-4o Vision", async () => {
    const buffer = fs.readFileSync("./test/fixtures/edital-escaneado.pdf");
    const resultado = await ocr.analisarDocumento(buffer);

    expect(resultado.metodo).toBe("gpt-4o-vision");
    expect(resultado.confianca).toBeGreaterThan(80);
  });

  test("Estruturar edital corretamente", async () => {
    const texto = fs.readFileSync("./test/fixtures/edital-texto.txt", "utf8");
    const estrutura = await ocr.estruturarEdital(texto);

    expect(estrutura.numero).toBeTruthy();
    expect(estrutura.titulo).toBeTruthy();
    expect(estrutura.secoes).toBeDefined();
  });
});

// ============================================================================
// 7️⃣ DEPLOY CHECKLIST
// ============================================================================

/*
 * [ ] Copiar arquivos:
 *     - src/services/ocr-advanced.js
 *     - src/ocr-controller.js
 *     - Atualizar src/routes.js
 *     - Criar src/pages/OCRAnalyzer.jsx
 *
 * [ ] Instalar dependências:
 *     npm install openai form-data
 *
 * [ ] Configurar variáveis:
 *     OPENAI_API_KEY=sk-proj-xxxxxxxx
 *
 * [ ] Testar endpoints:
 *     POST http://localhost:3100/api/edital/ocr-analisar (com PDF)
 *     POST http://localhost:3100/api/ocr/analisar (com PDF)
 *
 * [ ] Testar UI:
 *     Abrir http://localhost:3001 → OCRAnalyzer
 *     Upload PDF escaneado → Verificar se OCR funciona
 *
 * [ ] Monitorar custos:
 *     GPT-4o Vision = ~$0.003/página
 *     Configure alertas de limite de API em OpenAI dashboard
 *
 * [ ] Deploy:
 *     git push → CI/CD pipeline
 *     Verificar logs em produção
 */
