/**
 * Controller de Credenciais — Gerenciamento de senhas AxHub/AxCross
 * 
 * Realiza login e alteração de senha nos sistemas via HTTP.
 * Os sites AxHub/AxCross são ASP.NET MVC com Identity.
 */

import axios from "axios";
import * as cheerio from "cheerio";

// Timeout padrão para requests
const TIMEOUT = 15000;

/**
 * Cria um axios instance com cookies (session) para um site específico
 */
function criarClient(baseURL) {
  const cookieJar = {};
  
  const client = axios.create({
    baseURL,
    timeout: TIMEOUT,
    maxRedirects: 5,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    validateStatus: (status) => status < 500,
  });

  // Interceptor para gerenciar cookies manualmente
  client.interceptors.response.use((response) => {
    const setCookies = response.headers['set-cookie'];
    if (setCookies) {
      setCookies.forEach(cookie => {
        const [nameValue] = cookie.split(';');
        const [name, value] = nameValue.split('=');
        if (name && value) cookieJar[name.trim()] = value.trim();
      });
    }
    return response;
  });

  client.interceptors.request.use((config) => {
    const cookieStr = Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');
    if (cookieStr) config.headers['Cookie'] = cookieStr;
    return config;
  });

  client.cookieJar = cookieJar;
  return client;
}

/**
 * Extrai token anti-forgery de um HTML
 */
function extrairToken(html) {
  const $ = cheerio.load(html);
  return $('input[name="__RequestVerificationToken"]').val() || null;
}

/**
 * POST /api/credenciais/login — Testa login em um site
 */
export async function testarLogin(req, res) {
  const { url, login, senha } = req.body;
  if (!url || !login || !senha) {
    return res.status(400).json({ erro: 'url, login e senha são obrigatórios' });
  }

  try {
    const client = criarClient(url);

    // 1. GET login page para obter token
    const loginPage = await client.get('/Home/Login');
    const token = extrairToken(loginPage.data);

    if (!token) {
      return res.json({ 
        sucesso: false, 
        erro: 'Não foi possível obter token anti-forgery (possível Cloudflare ou página indisponível)',
        status: loginPage.status 
      });
    }

    // Verificar se tem Turnstile/CAPTCHA
    const hasTurnstile = loginPage.data.includes('TurnstileToken') || loginPage.data.includes('turnstile');

    // 2. POST login - campos do ASP.NET MVC do AxHub: Username, Password, KeepConnected
    const params = new URLSearchParams();
    params.append('Username', login);
    params.append('Password', senha);
    params.append('KeepConnected', 'true');
    params.append('__RequestVerificationToken', token);
    // Turnstile: enviar token vazio (pode funcionar em ambientes sem enforcement)
    if (hasTurnstile) params.append('TurnstileToken', '');

    const loginResp = await client.post('/Home/Login', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 0,
      validateStatus: () => true,
    });

    // 302 redirect = login bem-sucedido
    const isLoggedIn = loginResp.status === 302;

    if (isLoggedIn) {
      return res.json({ sucesso: true, mensagem: 'Login válido' });
    }

    // Se retornou 200, verificar se tem erro no body
    if (loginResp.status === 200) {
      const body = loginResp.data || '';
      if (body.includes('Usuário ou senha inválidos') || body.includes('inválid')) {
        return res.json({ sucesso: false, erro: 'Usuário ou senha inválidos' });
      }
      if (hasTurnstile && (body.includes('Turnstile') || body.includes('captcha'))) {
        return res.json({ 
          sucesso: false, 
          erro: 'Site protegido por Cloudflare Turnstile (CAPTCHA). Alteração automática não disponível — use "Abrir Site" para alterar manualmente.',
          turnstile: true
        });
      }
      // Pode ter logado mas sem redirect (200 com conteúdo da home)
      if (!body.includes('/Home/Login') && !body.includes('Username')) {
        return res.json({ sucesso: true, mensagem: 'Login válido (sem redirect)' });
      }
    }

    return res.json({ 
      sucesso: false, 
      erro: hasTurnstile 
        ? 'Protegido por Cloudflare Turnstile — altere manualmente via "Abrir Site"'
        : 'Login falhou (verifique credenciais)', 
      status: loginResp.status,
      turnstile: hasTurnstile
    });

  } catch (err) {
    return res.json({ 
      sucesso: false, 
      erro: err.code === 'ECONNABORTED' ? 'Timeout — site não respondeu' : err.message 
    });
  }
}

/**
 * POST /api/credenciais/alterar-senha — Altera senha em um site AxHub/AxCross
 */
export async function alterarSenha(req, res) {
  const { url, login, senhaAtual, novaSenha } = req.body;
  if (!url || !login || !senhaAtual || !novaSenha) {
    return res.status(400).json({ erro: 'url, login, senhaAtual e novaSenha são obrigatórios' });
  }

  try {
    const client = criarClient(url);

    // 1. GET login page
    const loginPage = await client.get('/Home/Login');
    const loginToken = extrairToken(loginPage.data);
    const hasTurnstile = loginPage.data.includes('TurnstileToken') || loginPage.data.includes('turnstile');

    if (!loginToken) {
      return res.json({ 
        sucesso: false, 
        etapa: 'login-page',
        erro: 'Não foi possível obter token anti-forgery da página de login' 
      });
    }

    // 2. POST login com campos corretos do AxHub
    const loginParams = new URLSearchParams();
    loginParams.append('Username', login);
    loginParams.append('Password', senhaAtual);
    loginParams.append('KeepConnected', 'true');
    loginParams.append('__RequestVerificationToken', loginToken);
    if (hasTurnstile) loginParams.append('TurnstileToken', '');

    const loginResp = await client.post('/Home/Login', loginParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 5,
      validateStatus: () => true,
    });

    // Verificar se logou - tentar acessar página autenticada
    const homeResp = await client.get('/');
    const isLoggedIn = homeResp.status === 200 && 
      !homeResp.data?.includes?.('/Home/Login') &&
      !homeResp.data?.includes?.('name="Username"');

    if (!isLoggedIn) {
      // Se tem Turnstile, o login automático não funciona
      if (hasTurnstile) {
        return res.json({ 
          sucesso: false, 
          etapa: 'login',
          erro: 'Site protegido por Cloudflare Turnstile (CAPTCHA). Use "Abrir Site" para alterar manualmente.',
          turnstile: true
        });
      }
      return res.json({ 
        sucesso: false, 
        etapa: 'login',
        erro: 'Login falhou — credenciais incorretas ou site protegido' 
      });
    }

    // 3. GET página de alteração de senha
    const rotasSenha = [
      '/Account/ChangePassword',
      '/Home/AlterarSenha',
      '/Manage/ChangePassword',
      '/Account/Manage',
      '/Usuario/AlterarSenha',
      '/Configuracao/AlterarSenha',
      '/Home/TrocarSenha',
    ];

    let changePwdPage = null;
    let changePwdUrl = null;

    for (const rota of rotasSenha) {
      try {
        const resp = await client.get(rota);
        if (resp.status === 200 && (resp.data?.includes?.('Password') || resp.data?.includes?.('Senha'))) {
          changePwdPage = resp;
          changePwdUrl = rota;
          break;
        }
      } catch { /* try next */ }
    }

    if (!changePwdPage) {
      // Procurar links no HTML
      const $ = cheerio.load(homeResp.data);
      const possibleLinks = [];
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && (href.toLowerCase().includes('senha') || href.toLowerCase().includes('password') || href.toLowerCase().includes('alterar') || href.toLowerCase().includes('change'))) {
          possibleLinks.push(href);
        }
      });

      for (const link of possibleLinks) {
        try {
          const resp = await client.get(link);
          if (resp.status === 200) {
            changePwdPage = resp;
            changePwdUrl = link;
            break;
          }
        } catch { /* skip */ }
      }
    }

    if (!changePwdPage) {
      return res.json({ 
        sucesso: false, 
        etapa: 'buscar-pagina-senha',
        erro: 'Login OK mas não foi possível encontrar a página de alteração de senha.',
        loginOk: true
      });
    }

    // 4. POST alteração de senha
    const changePwdToken = extrairToken(changePwdPage.data);
    
    // Descobrir campos do formulário
    const $pwd = cheerio.load(changePwdPage.data);
    const formFieldNames = [];
    $pwd('input').each((_, el) => {
      const name = $pwd(el).attr('name');
      if (name) formFieldNames.push(name);
    });

    // Montar payload
    const changeParams = new URLSearchParams();
    if (changePwdToken) changeParams.append('__RequestVerificationToken', changePwdToken);
    
    // Mapear campos encontrados
    const senhaAtualCampos = ['OldPassword', 'CurrentPassword', 'SenhaAtual', 'senhaAtual', 'Senha'];
    const novaSenhaCampos = ['NewPassword', 'NovaSenha', 'novaSenha', 'SenhaNova', 'Password'];
    const confirmaCampos = ['ConfirmPassword', 'ConfirmNewPassword', 'ConfirmacaoSenha', 'confirmaSenha', 'ConfirmaNovaSenha'];

    const senhaAtualField = formFieldNames.find(f => senhaAtualCampos.some(s => f.includes(s))) || 'OldPassword';
    const novaSenhaField = formFieldNames.find(f => novaSenhaCampos.some(s => f.includes(s)) && !f.includes('Old') && !f.includes('Current') && !f.includes('Confirm')) || 'NewPassword';
    const confirmaField = formFieldNames.find(f => confirmaCampos.some(s => f.includes(s))) || 'ConfirmPassword';

    changeParams.append(senhaAtualField, senhaAtual);
    changeParams.append(novaSenhaField, novaSenha);
    changeParams.append(confirmaField, novaSenha);

    const changeResp = await client.post(changePwdUrl, changeParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      maxRedirects: 5,
      validateStatus: () => true,
    });

    // Verificar resultado
    if (changeResp.status === 302) {
      return res.json({ 
        sucesso: true, 
        mensagem: 'Senha alterada com sucesso',
        etapa: 'completo'
      });
    }

    if (changeResp.status === 200) {
      const respBody = changeResp.data || '';
      
      if (respBody.includes('sucesso') || respBody.includes('alterada') || respBody.includes('changed')) {
        return res.json({ 
          sucesso: true, 
          mensagem: 'Senha alterada com sucesso',
          etapa: 'completo'
        });
      }
      
      // Extrair mensagem de erro
      const $resp = cheerio.load(respBody);
      const errorText = $resp('.validation-summary-errors li, .text-danger, .alert-danger, .field-validation-error').text().trim();
      
      if (errorText) {
        return res.json({ 
          sucesso: false, 
          etapa: 'alterar-senha',
          erro: errorText,
          loginOk: true
        });
      }

      // Verificar se a página retornada ainda tem form de senha (= não alterou)
      if (respBody.includes('OldPassword') || respBody.includes('NewPassword') || respBody.includes('SenhaAtual')) {
        return res.json({ 
          sucesso: false, 
          etapa: 'alterar-senha',
          erro: 'Formulário retornado sem confirmação — possível erro de validação não capturado',
          loginOk: true
        });
      }

      // Pode ter funcionado
      return res.json({ 
        sucesso: true, 
        mensagem: 'Alteração enviada (verifique fazendo login com a nova senha)',
        etapa: 'completo',
        verificar: true
      });
    }

    return res.json({ 
      sucesso: false, 
      etapa: 'alterar-senha',
      erro: `Resposta inesperada: HTTP ${changeResp.status}`,
      loginOk: true
    });

  } catch (err) {
    return res.json({ 
      sucesso: false, 
      etapa: 'erro-geral',
      erro: err.code === 'ECONNABORTED' ? 'Timeout — site não respondeu' : err.message 
    });
  }
}

/**
 * POST /api/credenciais/validar — Valida se credenciais funcionam (tenta login)
 */
export async function validarAcesso(req, res) {
  // Reutiliza lógica do testarLogin
  return testarLogin(req, res);
}
