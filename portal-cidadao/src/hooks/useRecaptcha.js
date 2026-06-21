import { useState, useEffect } from 'react';

/**
 * Hook personalizado para usar Google reCAPTCHA v3
 * @returns {Object} { ready, execute }
 */
export const useRecaptcha = () => {
  const [ready, setReady] = useState(false);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    // Verificar se o script do reCAPTCHA já foi carregado
    const checkRecaptcha = setInterval(() => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          setReady(true);
          clearInterval(checkRecaptcha);
        });
      }
    }, 100);

    // Timeout após 10 segundos
    const timeout = setTimeout(() => {
      clearInterval(checkRecaptcha);
      if (!ready) {
        console.error('reCAPTCHA failed to load');
      }
    }, 10000);

    return () => {
      clearInterval(checkRecaptcha);
      clearTimeout(timeout);
    };
  }, []);

  /**
   * Executa o reCAPTCHA e retorna um token
   * @param {string} action - Ação a ser registrada (ex: 'consultar', 'login', 'registrar')
   * @returns {Promise<string>} Token do reCAPTCHA
   */
  const execute = async (action = 'submit') => {
    if (!ready || !window.grecaptcha) {
      throw new Error('reCAPTCHA not loaded. Please check your internet connection.');
    }

    if (!siteKey || siteKey === 'YOUR_RECAPTCHA_SITE_KEY') {
      console.warn('reCAPTCHA site key not configured. Using placeholder.');
      return 'PLACEHOLDER_TOKEN_FOR_DEVELOPMENT';
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution error:', error);
      throw new Error('Failed to execute reCAPTCHA. Please try again.');
    }
  };

  return { ready, execute };
};
