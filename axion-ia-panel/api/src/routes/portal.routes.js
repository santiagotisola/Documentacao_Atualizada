import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticatePortalJWT, optionalPortalJWT } from '../middleware/portal-auth.middleware.js';

// Controllers
import { 
  registrar, 
  login, 
  perfil, 
  atualizarPerfil, 
  alterarSenha 
} from '../controllers/portal/auth.controller.js';

import { 
  consultarInfracoes, 
  buscarInfracao 
} from '../controllers/portal/consulta.controller.js';

import { 
  criarContestacao, 
  listarContestacoes, 
  buscarContestacao, 
  cancelarContestacao, 
  adicionarDocumento 
} from '../controllers/portal/contestacao.controller.js';

const router = express.Router();

// ─── Rate Limiters Específicos ────────────────────────────────────────────────

// Limite para consultas (anti-scraping)
const consultaLimiter = rateLimit({
  windowMs: 60_000, // 1 minuto
  max: 10, // 10 consultas por minuto
  message: { erro: 'Muitas consultas. Aguarde 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite para registro/login (anti-brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60_000, // 15 minutos
  max: 5, // 5 tentativas
  message: { erro: 'Muitas tentativas. Aguarde 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite para contestações (anti-spam)
const contestacaoLimiter = rateLimit({
  windowMs: 60 * 60_000, // 1 hora
  max: 5, // 5 contestações por hora
  message: { erro: 'Limite de contestações atingido. Aguarde 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Rotas Públicas (sem autenticação) ─────────────────────────────────────────

/**
 * @route   POST /api/portal/consultar
 * @desc    Consulta infrações por CPF ou Placa
 * @access  Público (com rate limit + reCAPTCHA)
 */
router.post('/consultar', consultaLimiter, consultarInfracoes);

/**
 * @route   GET /api/portal/infracao/:autoInfracao
 * @desc    Busca detalhes de uma infração
 * @access  Público
 */
router.get('/infracao/:autoInfracao', buscarInfracao);

/**
 * @route   POST /api/portal/auth/registrar
 * @desc    Registra novo usuário
 * @access  Público (com rate limit)
 */
router.post('/auth/registrar', authLimiter, registrar);

/**
 * @route   POST /api/portal/auth/login
 * @desc    Realiza login
 * @access  Público (com rate limit)
 */
router.post('/auth/login', authLimiter, login);

// ─── Rotas Privadas (requerem autenticação JWT) ────────────────────────────────

/**
 * @route   GET /api/portal/auth/perfil
 * @desc    Retorna dados do usuário logado
 * @access  Privado
 */
router.get('/auth/perfil', authenticatePortalJWT, perfil);

/**
 * @route   PUT /api/portal/auth/perfil
 * @desc    Atualiza dados do usuário
 * @access  Privado
 */
router.put('/auth/perfil', authenticatePortalJWT, atualizarPerfil);

/**
 * @route   PUT /api/portal/auth/senha
 * @desc    Altera senha do usuário
 * @access  Privado
 */
router.put('/auth/senha', authenticatePortalJWT, alterarSenha);

/**
 * @route   POST /api/portal/contestar
 * @desc    Cria nova contestação
 * @access  Privado (com rate limit)
 */
router.post('/contestar', authenticatePortalJWT, contestacaoLimiter, criarContestacao);

/**
 * @route   GET /api/portal/contestacoes
 * @desc    Lista contestações do usuário
 * @access  Privado
 */
router.get('/contestacoes', authenticatePortalJWT, listarContestacoes);

/**
 * @route   GET /api/portal/contestacoes/:id
 * @desc    Busca detalhes de uma contestação
 * @access  Privado
 */
router.get('/contestacoes/:id', authenticatePortalJWT, buscarContestacao);

/**
 * @route   DELETE /api/portal/contestacoes/:id
 * @desc    Cancela contestação
 * @access  Privado
 */
router.delete('/contestacoes/:id', authenticatePortalJWT, cancelarContestacao);

/**
 * @route   POST /api/portal/contestacoes/:id/documentos
 * @desc    Adiciona documento à contestação
 * @access  Privado
 */
router.post('/contestacoes/:id/documentos', authenticatePortalJWT, adicionarDocumento);

// ─── Rotas Futuras (TODO) ──────────────────────────────────────────────────────

/**
 * @route   POST /api/portal/upload
 * @desc    Upload de arquivo para S3
 * @access  Privado
 * @todo    Implementar upload S3 + antivirus scan
 */
// router.post('/upload', authenticatePortalJWT, uploadArquivo);

/**
 * @route   POST /api/portal/chat
 * @desc    Envia mensagem para chat IA (GPT-4)
 * @access  Público (opcional JWT para histórico)
 * @todo    Implementar integração OpenAI
 */
// router.post('/chat', optionalPortalJWT, enviarMensagemChat);

/**
 * @route   GET /api/portal/chat/:sessionId
 * @desc    Busca histórico de chat
 * @access  Privado
 * @todo    Implementar busca de sessões
 */
// router.get('/chat/:sessionId', authenticatePortalJWT, buscarChatSessao);

// ─── Health Check ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/portal/health
 * @desc    Health check do Portal
 * @access  Público
 */
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Portal do Cidadão',
    version: '1.0.0',
    timestamp: new Date(),
  });
});

export default router;
