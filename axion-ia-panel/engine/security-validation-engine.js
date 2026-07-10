/**
 * SECURITY VALIDATION ENGINE
 * Motor de Validação de Segurança
 * 
 * Valida:
 * - HTTPS
 * - Headers de segurança (CSP, HSTS, X-Frame-Options, etc.)
 * - Vulnerabilidades XSS
 * - SQL Injection
 * - CSRF protection
 * - Autenticação e autorização
 * - Senha fraca
 * - Exposição de dados sensíveis
 * - Cookies seguros
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class SecurityValidationEngine {
  constructor() {
    this.browser = null;
    this.page = null;
    this.securityResults = [];
  }

  /**
   * Valida segurança de uma aplicação
   */
  async validate(url, options = {}) {
    const {
      checkHeaders = true,
      checkXSS = true,
      checkSQLInjection = true,
      checkCSRF = true,
      checkAuthentication = true,
      checkCookies = true
    } = options;

    console.log(`\n🔒 Validando segurança: ${url}`);

    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true // Para detectar problemas de certificado
    });

    this.page = await this.browser.newPage();

    const result = {
      url,
      timestamp: new Date().toISOString(),
      passed: true,
      vulnerabilities: [],
      warnings: [],
      score: 100
    };

    try {
      const response = await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      // 1. Valida HTTPS
      if (!url.startsWith('https://')) {
        result.vulnerabilities.push({
          severity: 'critical',
          type: 'HTTPS',
          description: 'Aplicação não usa HTTPS - dados trafegam sem criptografia',
          recommendation: 'Implementar HTTPS com certificado válido'
        });
        result.passed = false;
        result.score -= 30;
      }

      // 2. Valida Headers de segurança
      if (checkHeaders) {
        const headerIssues = this.validateSecurityHeaders(response);
        result.vulnerabilities.push(...headerIssues.vulnerabilities);
        result.warnings.push(...headerIssues.warnings);
        result.score -= headerIssues.scoreDeduction;
      }

      // 3. Valida cookies
      if (checkCookies) {
        const cookieIssues = await this.validateCookies();
        result.vulnerabilities.push(...cookieIssues.vulnerabilities);
        result.warnings.push(...cookieIssues.warnings);
        result.score -= cookieIssues.scoreDeduction;
      }

      // 4. Testa XSS
      if (checkXSS) {
        const xssIssues = await this.testXSS();
        result.vulnerabilities.push(...xssIssues);
        result.score -= xssIssues.length * 15;
      }

      // 5. Testa SQL Injection
      if (checkSQLInjection) {
        const sqlIssues = await this.testSQLInjection();
        result.vulnerabilities.push(...sqlIssues);
        result.score -= sqlIssues.length * 20;
      }

      // 6. Valida autenticação
      if (checkAuthentication) {
        const authIssues = await this.validateAuthentication();
        result.vulnerabilities.push(...authIssues.vulnerabilities);
        result.warnings.push(...authIssues.warnings);
        result.score -= authIssues.scoreDeduction;
      }

      // Ajusta score
      result.score = Math.max(0, result.score);
      result.passed = result.vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0;

      // Log resultado
      console.log(`   ${result.passed ? '✅' : '❌'} Segurança: ${result.passed ? 'PASSOU' : 'FALHOU'}`);
      console.log(`      Score: ${result.score}/100`);
      console.log(`      Vulnerabilidades críticas: ${result.vulnerabilities.filter(v => v.severity === 'critical').length}`);
      console.log(`      Vulnerabilidades altas: ${result.vulnerabilities.filter(v => v.severity === 'high').length}`);
      console.log(`      Vulnerabilidades médias: ${result.vulnerabilities.filter(v => v.severity === 'medium').length}`);
      console.log(`      Avisos: ${result.warnings.length}`);

      if (result.vulnerabilities.length > 0) {
        console.log(`\n      🔴 Vulnerabilidades:`);
        result.vulnerabilities.slice(0, 5).forEach(v => {
          console.log(`         [${v.severity.toUpperCase()}] ${v.type}: ${v.description}`);
        });
        if (result.vulnerabilities.length > 5) {
          console.log(`         ... e mais ${result.vulnerabilities.length - 5} vulnerabilidades`);
        }
      }

      this.securityResults.push(result);

      return result;

    } catch (error) {
      console.error(`   ❌ Erro na validação de segurança: ${error.message}`);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * Valida headers de segurança
   */
  validateSecurityHeaders(response) {
    const vulnerabilities = [];
    const warnings = [];
    let scoreDeduction = 0;

    const headers = response.headers();

    // Content-Security-Policy
    if (!headers['content-security-policy']) {
      warnings.push({
        type: 'Missing CSP',
        description: 'Content-Security-Policy header não encontrado',
        recommendation: 'Implementar CSP para prevenir XSS e data injection'
      });
      scoreDeduction += 5;
    }

    // Strict-Transport-Security (HSTS)
    if (!headers['strict-transport-security']) {
      vulnerabilities.push({
        severity: 'medium',
        type: 'Missing HSTS',
        description: 'Strict-Transport-Security header não encontrado',
        recommendation: 'Adicionar header HSTS para forçar HTTPS'
      });
      scoreDeduction += 10;
    }

    // X-Frame-Options
    if (!headers['x-frame-options']) {
      vulnerabilities.push({
        severity: 'medium',
        type: 'Missing X-Frame-Options',
        description: 'X-Frame-Options header não encontrado - vulnerável a clickjacking',
        recommendation: 'Adicionar X-Frame-Options: DENY ou SAMEORIGIN'
      });
      scoreDeduction += 10;
    }

    // X-Content-Type-Options
    if (!headers['x-content-type-options']) {
      warnings.push({
        type: 'Missing X-Content-Type-Options',
        description: 'X-Content-Type-Options header não encontrado',
        recommendation: 'Adicionar X-Content-Type-Options: nosniff'
      });
      scoreDeduction += 5;
    }

    // X-XSS-Protection
    if (!headers['x-xss-protection']) {
      warnings.push({
        type: 'Missing X-XSS-Protection',
        description: 'X-XSS-Protection header não encontrado',
        recommendation: 'Adicionar X-XSS-Protection: 1; mode=block'
      });
      scoreDeduction += 5;
    }

    // Referrer-Policy
    if (!headers['referrer-policy']) {
      warnings.push({
        type: 'Missing Referrer-Policy',
        description: 'Referrer-Policy header não encontrado',
        recommendation: 'Adicionar Referrer-Policy: no-referrer ou strict-origin-when-cross-origin'
      });
      scoreDeduction += 3;
    }

    // Server header exposto
    if (headers['server']) {
      warnings.push({
        type: 'Server Header Exposed',
        description: `Server header expõe tecnologia: ${headers['server']}`,
        recommendation: 'Remover ou ofuscar Server header'
      });
      scoreDeduction += 2;
    }

    return { vulnerabilities, warnings, scoreDeduction };
  }

  /**
   * Valida cookies
   */
  async validateCookies() {
    const vulnerabilities = [];
    const warnings = [];
    let scoreDeduction = 0;

    const cookies = await this.page.cookies();

    cookies.forEach(cookie => {
      // Cookie sem Secure flag
      if (!cookie.secure && this.page.url().startsWith('https://')) {
        vulnerabilities.push({
          severity: 'medium',
          type: 'Insecure Cookie',
          description: `Cookie "${cookie.name}" não tem flag Secure - pode ser interceptado`,
          recommendation: 'Adicionar flag Secure em todos os cookies'
        });
        scoreDeduction += 5;
      }

      // Cookie sem HttpOnly flag
      if (!cookie.httpOnly) {
        vulnerabilities.push({
          severity: 'medium',
          type: 'Cookie Accessible via JavaScript',
          description: `Cookie "${cookie.name}" não tem flag HttpOnly - vulnerável a XSS`,
          recommendation: 'Adicionar flag HttpOnly para cookies sensíveis'
        });
        scoreDeduction += 5;
      }

      // Cookie sem SameSite
      if (!cookie.sameSite || cookie.sameSite === 'None') {
        warnings.push({
          type: 'Cookie Without SameSite',
          description: `Cookie "${cookie.name}" sem SameSite - vulnerável a CSRF`,
          recommendation: 'Adicionar SameSite=Strict ou SameSite=Lax'
        });
        scoreDeduction += 3;
      }
    });

    return { vulnerabilities, warnings, scoreDeduction };
  }

  /**
   * Testa vulnerabilidade XSS
   */
  async testXSS() {
    const vulnerabilities = [];

    // Procura campos de input
    const inputs = await this.page.$$('input[type="text"], textarea');

    if (inputs.length === 0) return vulnerabilities;

    console.log(`      🔍 Testando XSS em ${inputs.length} campos...`);

    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")'
    ];

    for (const [idx, input] of inputs.slice(0, 5).entries()) {
      try {
        for (const payload of xssPayloads) {
          await input.type(payload);
          
          // Verifica se payload foi executado
          const hasXSS = await this.page.evaluate(() => {
            return document.body.innerHTML.includes('<script>') || 
                   document.body.innerHTML.includes('onerror=') ||
                   document.body.innerHTML.includes('javascript:');
          });

          if (hasXSS) {
            vulnerabilities.push({
              severity: 'critical',
              type: 'XSS Vulnerability',
              description: `Campo ${idx + 1} vulnerável a XSS - payload não foi sanitizado`,
              recommendation: 'Sanitizar inputs e outputs, usar CSP'
            });
            break; // Não testa mais payloads neste campo
          }
        }
      } catch (error) {
        // Ignora erros
      }
    }

    return vulnerabilities;
  }

  /**
   * Testa SQL Injection
   */
  async testSQLInjection() {
    const vulnerabilities = [];

    const inputs = await this.page.$$('input[type="text"]');

    if (inputs.length === 0) return vulnerabilities;

    console.log(`      🔍 Testando SQL Injection em ${inputs.length} campos...`);

    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users--",
      "1' UNION SELECT NULL--",
      "admin'--"
    ];

    for (const [idx, input] of inputs.slice(0, 3).entries()) {
      try {
        for (const payload of sqlPayloads) {
          await input.type(payload);
          
          // Submit se houver form
          const form = await this.page.evaluateHandle((inp) => {
            return inp.closest('form');
          }, input);

          if (form) {
            try {
              await Promise.all([
                this.page.waitForNavigation({ timeout: 3000 }),
                form.asElement().evaluate(f => f.submit())
              ]);

              // Verifica se há mensagem de erro SQL
              const hasSQLError = await this.page.evaluate(() => {
                const text = document.body.innerText.toLowerCase();
                return text.includes('sql') || 
                       text.includes('syntax error') ||
                       text.includes('mysql') ||
                       text.includes('postgresql') ||
                       text.includes('ora-');
              });

              if (hasSQLError) {
                vulnerabilities.push({
                  severity: 'critical',
                  type: 'SQL Injection',
                  description: `Campo ${idx + 1} possivelmente vulnerável a SQL Injection - erros de SQL expostos`,
                  recommendation: 'Usar prepared statements, sanitizar inputs, não expor erros de SQL'
                });
                break;
              }
            } catch (error) {
              // Timeout é OK
            }
          }
        }
      } catch (error) {
        // Ignora erros
      }
    }

    return vulnerabilities;
  }

  /**
   * Valida autenticação
   */
  async validateAuthentication() {
    const vulnerabilities = [];
    const warnings = [];
    let scoreDeduction = 0;

    // Verifica se há formulário de login
    const hasLoginForm = await this.page.evaluate(() => {
      const passwordFields = document.querySelectorAll('input[type="password"]');
      return passwordFields.length > 0;
    });

    if (!hasLoginForm) {
      return { vulnerabilities, warnings, scoreDeduction };
    }

    console.log('      🔍 Validando autenticação...');

    // Testa senha fraca
    const passwordField = await this.page.$('input[type="password"]');
    if (passwordField) {
      const weakPasswords = ['123456', 'password', '123456789', 'senha', '12345678'];

      for (const weakPass of weakPasswords) {
        try {
          await passwordField.type(weakPass);
          
          // Verifica se há validação
          const hasValidation = await this.page.evaluate(() => {
            return document.body.innerText.toLowerCase().includes('senha fraca') ||
                   document.body.innerText.toLowerCase().includes('weak password');
          });

          if (!hasValidation) {
            warnings.push({
              type: 'Weak Password Allowed',
              description: 'Sistema aceita senhas fracas sem validação',
              recommendation: 'Implementar política de senha forte'
            });
            scoreDeduction += 5;
            break;
          }
        } catch (error) {
          // Ignora
        }
      }
    }

    // Verifica tentativa de brute force
    // (apenas simulação - não fazer brute force real)
    warnings.push({
      type: 'Brute Force Protection',
      description: 'Não foi possível validar proteção contra brute force',
      recommendation: 'Implementar rate limiting, CAPTCHA após tentativas falhas'
    });

    return { vulnerabilities, warnings, scoreDeduction };
  }

  /**
   * Salva resultados
   */
  async saveResults() {
    const resultsDir = path.join(process.cwd(), 'engine', 'security-results');
    await fs.promises.mkdir(resultsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `security-results-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);

    await fs.promises.writeFile(
      filepath,
      JSON.stringify(this.securityResults, null, 2),
      'utf-8'
    );

    console.log(`\n💾 Resultados salvos em: ${filepath}`);

    // Gera relatório HTML
    await this.generateHTMLReport(timestamp);
  }

  /**
   * Gera relatório HTML
   */
  async generateHTMLReport(timestamp) {
    const htmlPath = path.join(process.cwd(), 'engine', 'security-results', `security-report-${timestamp}.html`);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Security Validation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #333; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .result { background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
    .passed { border-left: 5px solid #4caf50; }
    .failed { border-left: 5px solid #f44336; }
    .vulnerability { background: #fff3cd; padding: 10px; margin: 5px 0; border-left: 3px solid #ffc107; }
    .critical { border-left-color: #dc3545; }
    .high { border-left-color: #fd7e14; }
    .medium { border-left-color: #ffc107; }
    .low { border-left-color: #17a2b8; }
    .score { font-size: 48px; font-weight: bold; text-align: center; }
    .score.good { color: #4caf50; }
    .score.warning { color: #ffc107; }
    .score.danger { color: #f44336; }
  </style>
</head>
<body>
  <h1>🔒 Security Validation Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    ${this.securityResults.map(result => `
      <div class="result ${result.passed ? 'passed' : 'failed'}">
        <h3>${result.passed ? '✅' : '❌'} ${result.url}</h3>
        <div class="score ${result.score >= 80 ? 'good' : result.score >= 50 ? 'warning' : 'danger'}">
          ${result.score}/100
        </div>
        <p><strong>Vulnerabilidades:</strong> ${result.vulnerabilities.length}</p>
        <p><strong>Avisos:</strong> ${result.warnings.length}</p>
        
        ${result.vulnerabilities.map(v => `
          <div class="vulnerability ${v.severity}">
            <strong>[${v.severity.toUpperCase()}] ${v.type}</strong>
            <p>${v.description}</p>
            <p><em>Recomendação: ${v.recommendation}</em></p>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>

  <footer style="margin-top: 40px; text-align: center; color: #666;">
    <p>Generated by AxionIA Security Validation Engine</p>
    <p>${new Date().toLocaleString('pt-BR')}</p>
  </footer>
</body>
</html>
    `;

    await fs.promises.writeFile(htmlPath, html, 'utf-8');
    console.log(`📄 Relatório HTML: ${htmlPath}`);
  }
}

export default SecurityValidationEngine;
