/**
 * 🔗 ODOO PROXY ROUTES
 * Proxy server-side para chamadas Odoo RPC — contorna CORS
 * Autentica via XML-RPC e usa sessão por requisição
 */
import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const ODOO_BASE = process.env.ODOO_URL || "https://santiago-sola-neto.odoo.com";
const ODOO_DB   = process.env.ODOO_DB  || "santiago-sola-neto";

// Cache de sessão (em memória — sem persistência)
let sessaoCache = null;

// ── Autenticar no Odoo ────────────────────────────────────────────
async function autenticarOdoo(usuario, senha) {
  const res = await fetch(`${ODOO_BASE}/web/session/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0", method: "call", id: 1,
      params: { db: ODOO_DB, login: usuario, password: senha }
    })
  });
  const data = await res.json();
  if (!data.result?.uid) throw new Error("Credenciais inválidas");
  const cookies = res.headers.get("set-cookie");
  return { uid: data.result.uid, cookies, sessionId: data.result.session_id };
}

// ── Chamada RPC com sessão ────────────────────────────────────────
async function odooRpcProxy(sessao, model, method, args, kwargs) {
  const res = await fetch(`${ODOO_BASE}/web/dataset/call_kw/${model}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": sessao.cookies || "",
    },
    body: JSON.stringify({
      jsonrpc: "2.0", method: "call", id: Date.now(),
      params: { model, method, args: args || [], kwargs: kwargs || {} }
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.data?.message || data.error.message);
  return data.result;
}

// ─────────────────────────────────────────────────────────────────
// POST /odoo/login — autenticar e salvar sessão
// ─────────────────────────────────────────────────────────────────
router.post("/odoo/login", async (req, res) => {
  try {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) return res.status(400).json({ erro: "usuario e senha obrigatórios" });
    const sessao = await autenticarOdoo(usuario, senha);
    sessaoCache = sessao;
    res.json({ ok: true, uid: sessao.uid, mensagem: `Autenticado como UID ${sessao.uid}` });
  } catch (e) {
    res.status(401).json({ erro: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /odoo/rpc — chamada RPC genérica
// ─────────────────────────────────────────────────────────────────
router.post("/odoo/rpc", async (req, res) => {
  try {
    if (!sessaoCache) return res.status(401).json({ erro: "Não autenticado. Use POST /api/odoo/login primeiro." });
    const { model, method, args, kwargs } = req.body;
    const result = await odooRpcProxy(sessaoCache, model, method, args, kwargs);
    res.json({ ok: true, result });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /odoo/status — verificar sessão ativa
// ─────────────────────────────────────────────────────────────────
router.get("/odoo/status", (req, res) => {
  res.json({
    conectado: !!sessaoCache,
    uid: sessaoCache?.uid || null,
    base: ODOO_BASE
  });
});

// ─────────────────────────────────────────────────────────────────
// GET /odoo/canais — listar canais Discuss
// ─────────────────────────────────────────────────────────────────
router.get("/odoo/canais", async (req, res) => {
  try {
    if (!sessaoCache) return res.status(401).json({ erro: "Não autenticado" });
    const result = await odooRpcProxy(sessaoCache, "discuss.channel", "search_read",
      [[["channel_member_ids.partner_id.user_ids", "!=", false]]],
      { fields: ["id","name","channel_type","message_unread_counter","description","last_interest_dt"], limit: 30 }
    );
    res.json({ ok: true, canais: result });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /odoo/mensagens/:canalId — mensagens de um canal
// ─────────────────────────────────────────────────────────────────
router.get("/odoo/mensagens/:canalId", async (req, res) => {
  try {
    if (!sessaoCache) return res.status(401).json({ erro: "Não autenticado" });
    const canalId = parseInt(req.params.canalId);
    const result = await odooRpcProxy(sessaoCache, "mail.message", "search_read",
      [[["res_id","=",canalId], ["model","=","discuss.channel"]]],
      { fields: ["id","body","author_id","date","message_type"], limit: 50, order: "id asc" }
    );
    res.json({ ok: true, mensagens: result });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /odoo/mensagens/:canalId — enviar mensagem
// ─────────────────────────────────────────────────────────────────
router.post("/odoo/mensagens/:canalId", async (req, res) => {
  try {
    if (!sessaoCache) return res.status(401).json({ erro: "Não autenticado" });
    const canalId = parseInt(req.params.canalId);
    const { body } = req.body;
    await odooRpcProxy(sessaoCache, "discuss.channel", "message_post",
      [canalId],
      { body, message_type: "comment", subtype_xmlid: "mail.mt_comment" }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /odoo/notificacoes — notificações não lidas
// ─────────────────────────────────────────────────────────────────
router.get("/odoo/notificacoes", async (req, res) => {
  try {
    if (!sessaoCache) return res.status(401).json({ erro: "Não autenticado" });
    const result = await odooRpcProxy(sessaoCache, "mail.notification", "search_read",
      [[["notification_type","=","inbox"],["is_read","=",false]]],
      { fields: ["id","mail_message_id","notification_status","res_partner_id"], limit: 20 }
    );
    res.json({ ok: true, notificacoes: result });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

export default router;
