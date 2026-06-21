import { verifyToken } from '../utils/portal.utils.js';

/**
 * Middleware de autenticação JWT para rotas do Portal
 * Valida token no header Authorization: Bearer <token>
 */
export function authenticatePortalJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
    
    // Adiciona dados do usuário ao request
    req.user = {
      id: payload.id,
      cpfHash: payload.cpfHash,
      nome: payload.nome,
      email: payload.email,
    };
    
    next();
    
  } catch (erro) {
    console.error('Erro na autenticação JWT:', erro);
    res.status(401).json({ erro: 'Falha na autenticação' });
  }
}

/**
 * Middleware opcional de autenticação
 * Se token estiver presente, valida e adiciona user ao req
 * Se não estiver, apenas continua (permite acesso anônimo)
 */
export function optionalPortalJWT(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      
      if (payload) {
        req.user = {
          id: payload.id,
          cpfHash: payload.cpfHash,
          nome: payload.nome,
          email: payload.email,
        };
      }
    }
    
    next();
    
  } catch (erro) {
    // Em caso de erro, continua sem autenticação
    next();
  }
}
