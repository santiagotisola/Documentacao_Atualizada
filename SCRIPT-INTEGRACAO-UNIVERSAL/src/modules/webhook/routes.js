import { Router } from "express";
import crypto from "crypto";
import { logger } from "../middlewares/logger.js";

/**
 * WEBHOOK RECEIVER
 * Recebe eventos de sistemas externos (Helpdesks, ERPs, pagamentos, etc.)
 * Valida assinatura HMAC quando configurado e encaminha para processamento.
 */

export const webhookRouter = Router();

// Armazenar handlers registrados por tipo
const handlers = new Map();

// ============================================
// REGISTRO DE HANDLERS (usado pelos módulos)
// ============================================
export function registrarWebhook(tipo, callback) {
  handlers.set(tipo, callback);
  logger.info(`Webhook registrado: ${tipo}`);
}

// ============================================
// VALIDAÇÃO DE ASSINATURA HMAC
// ============================================
function validarAssinatura(req, secret) {
  if (!secret) return true; // Se não há secret, aceitar (dev mode)

  const assinatura = req.headers["x-webhook-signature"] 
    || req.headers["x-hub-signature-256"]
    || req.headers["x-signature"];

  if (!assinatura) return false;

  const payload = JSON.stringify(req.body);
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const esperado = `sha256=${hmac}`;

  return crypto.timingSafeEqual(Buffer.from(assinatura), Buffer.from(esperado));
}

// ============================================
// ROTAS
// ============================================

// POST /api/webhook/:tipo — Receber evento externo
webhookRouter.post("/:tipo", async (req, res) => {
  const { tipo } = req.params;
  const secret = process.env.WEBHOOK_SECRET;

  // Validar assinatura se configurado
  if (secret && !validarAssinatura(req, secret)) {
    logger.warn("Webhook rejeitado: assinatura inválida", { tipo, ip: req.ip });
    return res.status(401).json({ erro: "Assinatura inválida" });
  }

  // Verificar se há handler para este tipo
  const handler = handlers.get(tipo);
  if (!handler) {
    logger.warn(`Webhook sem handler: ${tipo}`);
    return res.status(404).json({ erro: `Tipo de webhook '${tipo}' não registrado` });
  }

  try {
    logger.info(`Webhook recebido: ${tipo}`, { payload_keys: Object.keys(req.body) });
    
    const resultado = await handler(req.body, req.headers);
    
    res.json({ recebido: true, tipo, resultado });
  } catch (err) {
    logger.error(`Erro processando webhook ${tipo}`, { erro: err.message });
    res.status(500).json({ erro: "Erro ao processar webhook" });
  }
});

// GET /api/webhook/status — Listar webhooks registrados
webhookRouter.get("/status", (req, res) => {
  const registrados = Array.from(handlers.keys());
  res.json({
    total: registrados.length,
    tipos: registrados,
    secret_configurado: !!process.env.WEBHOOK_SECRET
  });
});

// ============================================
// HANDLERS PRÉ-DEFINIDOS (exemplos)
// ============================================

// Helpdesk: novo ticket criado externamente
registrarWebhook("helpdesk_novo_ticket", async (payload) => {
  // Importar dinamicamente para evitar circular
  const { criarTicketExterno } = await import("../modules/helpdesk/service.js");
  return criarTicketExterno?.(payload) || { acao: "recebido", processado: false };
});

// ERP: estoque atualizado
registrarWebhook("erp_estoque", async (payload) => {
  const { produto_id, quantidade, tipo_movimento } = payload;
  logger.info("Estoque atualizado via webhook", { produto_id, quantidade, tipo_movimento });
  return { acao: "estoque_registrado" };
});

// Pagamento: confirmação
registrarWebhook("pagamento_confirmado", async (payload) => {
  const { pedido_id, valor, metodo } = payload;
  logger.info("Pagamento confirmado", { pedido_id, valor, metodo });
  return { acao: "pagamento_processado" };
});

// WhatsApp: status de mensagem (entregue, lida)
registrarWebhook("whatsapp_status", async (payload) => {
  const { message_id, status } = payload;
  logger.debug("Status WhatsApp", { message_id, status });
  return { acao: "status_atualizado" };
});
