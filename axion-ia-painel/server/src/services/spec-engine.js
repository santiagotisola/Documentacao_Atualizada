/**
 * spec-engine.js
 * Gera especificações (PRD) para itens do roadmap.
 *
 * Fluxo:
 *  1. Monta contexto a partir do item do roadmap.
 *  2. Tenta enriquecer via OpenAI (gpt-4o-mini).
 *  3. Se OpenAI indisponível, usa template estruturado local.
 *  4. Persiste o Spec e cria registro de Approval.
 *
 * ISOLAMENTO: não lê nem modifica KB, engine.js ou knowledge-base.json.
 */

import OpenAI from "openai";
import Spec from "../models/spec.model.js";
import Approval from "../models/approval.model.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Template offline ─────────────────────────────────────────────

function templateLocalSpec(item) {
  const { titulo, descricao, categoria, impacto, complexidade } = item;
  return {
    objetivo:      `Documentar e implementar "${titulo}" no produto.`,
    usuarios:      ["Operador", "Supervisor", "Administrador do sistema"],
    requisitos: [
      `✏️ Descrever o fluxo principal de "${titulo}"`,
      `✏️ Listar campos e validações necessários`,
      `✏️ Definir regras de acesso por perfil`,
      `✏️ Especificar integração com módulos existentes`,
    ],
    regrasNegocio: [
      `✏️ ${descricao || `Regra principal de "${titulo}"`}`,
      "✏️ Definir comportamento em caso de exceção",
    ],
    arquitetura:  `**Módulo:** ${categoria}\n**Impacto:** ${impacto}\n**Complexidade:** ${complexidade}\n\n✏️ Descrever camadas afetadas (frontend, backend, banco).`,
    pseudoCodigo: `// ✏️ Pseudocódigo para "${titulo}"\nfunction executar${titulo.replace(/\s+/g, "")}() {\n  // 1. Validar inputs\n  // 2. Processar lógica principal\n  // 3. Persistir resultado\n  // 4. Retornar resposta\n}`,
    criteriosAceitacao: [
      `✏️ Dado que o usuário acessa "${titulo}", quando executa a ação, então o sistema deve processar corretamente`,
      "✏️ Validar comportamento com dados inválidos",
      "✏️ Confirmar que logs de auditoria são gerados",
    ],
    riscos: [
      `✏️ Avaliar impacto na performance para "${titulo}"`,
      "✏️ Verificar compatibilidade com versões anteriores",
    ],
  };
}

// ─── Geração via OpenAI ───────────────────────────────────────────

async function gerarViaOpenAI(item, produto) {
  const systemPrompt = `Você é um analista de sistemas especialista em software de fiscalização de trânsito e pesagem veicular no Brasil.
Gere uma especificação técnica (PRD) estruturada para o item solicitado.
Responda SOMENTE com JSON válido, sem markdown, no seguinte formato:
{
  "objetivo": "string",
  "usuarios": ["string"],
  "requisitos": ["string"],
  "regrasNegocio": ["string"],
  "arquitetura": "string com markdown",
  "pseudoCodigo": "string com código",
  "criteriosAceitacao": ["string em formato Gherkin resumido"],
  "riscos": ["string"]
}`;

  const userPrompt = `Produto: ${produto}
Funcionalidade: ${item.titulo}
Descrição: ${item.descricao || "—"}
Categoria: ${item.categoria}
Impacto: ${item.impacto}
Complexidade: ${item.complexidade}
Fontes de referência: ${(item.fontes || []).join(", ") || "—"}

Gere a especificação completa.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt },
    ],
    temperature: 0.4,
    max_tokens: 1500,
  });

  const texto = completion.choices[0]?.message?.content || "{}";
  return JSON.parse(texto);
}

// ─── Função principal ─────────────────────────────────────────────

/**
 * Gera a spec para um item do roadmap.
 * @param {Object} item - item do roadmap (titulo, descricao, categoria, impacto, complexidade, fontes)
 * @param {string} produto - "axhub" | "axton" | "axcross"
 * @param {string|null} roadmapItemId - ObjectId do item no roadmap (opcional)
 * @returns {Object} spec salvo
 */
export async function gerarSpec(item, produto, roadmapItemId = null) {
  let spec;
  let origem = "template";

  // Tenta OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      spec = await gerarViaOpenAI(item, produto);
      origem = "openai";
    } catch (err) {
      const isQuota = err?.status === 429 || err?.code === "insufficient_quota";
      const isSemChave = err?.status === 401;
      if (!isQuota && !isSemChave) throw err;
      // Fallback silencioso para template
      spec = templateLocalSpec(item);
    }
  } else {
    spec = templateLocalSpec(item);
  }

  // Persiste Spec
  const specDoc = await Spec.create({
    produto,
    titulo:      item.titulo,
    roadmapItem: roadmapItemId || null,
    spec,
    status:      "rascunho",
  });

  // Cria registro de aprovação
  await Approval.create({
    tipo:         "spec",
    referenciaId: specDoc._id,
    produto,
    titulo:       item.titulo,
  });

  return { spec: specDoc, origem };
}

/**
 * Lista specs, opcionalmente filtradas por produto.
 */
export async function listarSpecs(produto) {
  const filtro = produto ? { produto } : {};
  return Spec.find(filtro, { "spec.pseudoCodigo": 0 }).sort({ criadoEm: -1 }).lean();
}

/**
 * Retorna spec completa por ID.
 */
export async function obterSpec(id) {
  return Spec.findById(id).lean();
}

/**
 * Atualiza status da spec.
 */
export async function atualizarStatusSpec(id, status) {
  return Spec.findByIdAndUpdate(id, { status }, { new: true }).lean();
}
