import axios from 'axios';

/**
 * Verifica token reCAPTCHA v3 com a API do Google
 * @param {string} token - Token gerado pelo frontend
 * @param {string} remoteIp - IP do cliente (opcional)
 * @returns {Promise<Object>} Resultado da verificação
 */
export async function verifyRecaptcha(token, remoteIp = null) {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY not configured in environment variables');
      throw new Error('reCAPTCHA not configured');
    }

    // Em desenvolvimento, aceitar token placeholder
    if (process.env.NODE_ENV === 'development' && token === 'PLACEHOLDER_TOKEN_FOR_DEVELOPMENT') {
      console.warn('⚠️  Using placeholder reCAPTCHA token in development mode');
      return {
        success: true,
        score: 0.9,
        action: 'development',
        challenge_ts: new Date().toISOString(),
        hostname: 'localhost'
      };
    }

    const params = new URLSearchParams({
      secret: secretKey,
      response: token
    });

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const result = response.data;

    // Log para debug (remover em production)
    console.log('reCAPTCHA verification:', {
      success: result.success,
      score: result.score,
      action: result.action,
      hostname: result.hostname
    });

    return result;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);
    return {
      success: false,
      'error-codes': ['verification-failed'],
      message: error.message
    };
  }
}

/**
 * Valida o score do reCAPTCHA
 * @param {number} score - Score retornado pelo Google (0.0-1.0)
 * @param {number} threshold - Score mínimo aceitável (default: 0.5)
 * @returns {boolean}
 */
export function isValidScore(score, threshold = 0.5) {
  if (typeof score !== 'number' || score < 0 || score > 1) {
    console.warn('Invalid reCAPTCHA score:', score);
    return false;
  }
  
  return score >= threshold;
}

/**
 * Obtém o threshold configurado no ambiente
 * @returns {number} Threshold padrão 0.5
 */
export function getThreshold() {
  const threshold = parseFloat(process.env.RECAPTCHA_THRESHOLD || '0.5');
  
  if (threshold < 0 || threshold > 1) {
    console.warn('Invalid RECAPTCHA_THRESHOLD in env, using default 0.5');
    return 0.5;
  }
  
  return threshold;
}
