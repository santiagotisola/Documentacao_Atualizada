/**
 * DISCOVERY ENGINE - Motor de Descoberta Automática
 * 
 * Este é o ENGINE FUNDAMENTAL que torna a plataforma 100% AUTÔNOMA!
 * Ele descobre AUTOMATICAMENTE todo o sistema sem intervenção humana.
 * 
 * Descobre:
 * - Todas as páginas/rotas
 * - Todos os menus e submenus
 * - Todos os formulários e campos
 * - Todas as tabelas e ações
 * - Todos os botões e modais
 * - Todas as chamadas de API
 * - Todas as validações
 * - Toda a estrutura de navegação
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

class DiscoveryEngine {
  constructor() {
    this.browser = null;
    this.page = null;
    this.discoveredPages = new Map();
    this.discoveredMenus = [];
    this.discoveredForms = [];
    this.discoveredTables = [];
    this.discoveredAPIs = [];
    this.discoveredRoutes = new Set();
    this.visitedURLs = new Set();
    this.pendingURLs = [];
    this.baseURL = '';
    this.maxDepth = 5;
    this.maxPages = 100;
  }

  /**
   * Inicia descoberta automática de um sistema
   */
  async discover(options = {}) {
    const {
      url,
      credentials = null,
      maxDepth = 5,
      maxPages = 100,
      headless = false,
      includeAPIs = true,
      includeForms = true,
      includeTables = true
    } = options;

    console.log('🔍 DISCOVERY ENGINE - Iniciando descoberta automática...\n');
    console.log(`🌐 URL: ${url}`);
    console.log(`📊 Max Páginas: ${maxPages} | Max Profundidade: ${maxDepth}\n`);

    this.baseURL = new URL(url).origin;
    this.maxDepth = maxDepth;
    this.maxPages = maxPages;

    // Inicia browser
    this.browser = await puppeteer.launch({
      headless,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--start-maximized', '--disable-web-security']
    });

    this.page = await this.browser.newPage();

    // Configura captura de APIs
    if (includeAPIs) {
      await this.setupAPICapture();
    }

    const startTime = Date.now();

    try {
      // Login se necessário
      if (credentials) {
        await this.performLogin(url, credentials);
      } else {
        await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      }

      // Adiciona URL inicial
      this.pendingURLs.push({ url, depth: 0 });

      // Descoberta recursiva
      while (this.pendingURLs.length > 0 && this.visitedURLs.size < this.maxPages) {
        const { url: currentURL, depth } = this.pendingURLs.shift();

        if (this.visitedURLs.has(currentURL) || depth > this.maxDepth) {
          continue;
        }

        await this.discoverPage(currentURL, depth);
      }

      // Gera mapa completo
      const discovery = this.generateDiscoveryMap();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n✅ Descoberta concluída em ${duration}s`);
      console.log(`📄 Páginas descobertas: ${this.discoveredPages.size}`);
      console.log(`🔗 Menus descobertos: ${this.discoveredMenus.length}`);
      console.log(`📝 Formulários descobertos: ${this.discoveredForms.length}`);
      console.log(`📊 Tabelas descobertas: ${this.discoveredTables.length}`);
      console.log(`🔌 APIs descobertas: ${this.discoveredAPIs.length}`);

      // Salva descoberta
      await this.saveDiscovery(discovery);

      return discovery;

    } catch (error) {
      console.error('❌ Erro na descoberta:', error.message);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * Realiza login automático
   */
  async performLogin(url, credentials) {
    console.log('🔐 Realizando login...');
    
    await this.page.goto(url, { waitUntil: 'networkidle0' });

    // Detecta campos de login automaticamente
    const loginFields = await this.page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const usernameField = inputs.find(i => 
        i.type === 'text' || i.type === 'email' || 
        i.name.toLowerCase().includes('user') ||
        i.name.toLowerCase().includes('login') ||
        i.name.toLowerCase().includes('email')
      );
      const passwordField = inputs.find(i => i.type === 'password');
      const submitButton = document.querySelector('button[type="submit"], input[type="submit"], button');
      
      return {
        username: usernameField ? usernameField.name || usernameField.id : null,
        password: passwordField ? passwordField.name || passwordField.id : null,
        hasForm: !!(usernameField && passwordField && submitButton)
      };
    });

    if (!loginFields.hasForm) {
      console.log('⚠️ Formulário de login não detectado automaticamente');
      return;
    }

    // Preenche credenciais
    if (loginFields.username) {
      await this.page.type(`[name="${loginFields.username}"], #${loginFields.username}`, credentials.username);
    }
    if (loginFields.password) {
      await this.page.type(`[name="${loginFields.password}"], #${loginFields.password}`, credentials.password);
    }

    // Submete
    await Promise.all([
      this.page.click('button[type="submit"], input[type="submit"], button'),
      this.page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {})
    ]);

    console.log('✅ Login realizado');
  }

  /**
   * Descobre uma página específica
   */
  async discoverPage(url, depth) {
    if (this.visitedURLs.has(url)) return;

    console.log(`📍 [${this.visitedURLs.size + 1}/${this.maxPages}] Descobrindo: ${url.substring(0, 80)}...`);

    this.visitedURLs.add(url);

    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle0', 
        timeout: 30000 
      });

      await this.page.waitForTimeout(1000);

      // Captura estrutura da página
      const pageData = await this.page.evaluate((currentURL) => {
        const data = {
          url: currentURL,
          title: document.title,
          timestamp: new Date().toISOString(),
          
          // Menus e navegação
          menus: [],
          links: [],
          
          // Formulários
          forms: [],
          
          // Tabelas
          tables: [],
          
          // Botões e ações
          buttons: [],
          
          // Modais
          modals: [],
          
          // Estrutura
          hasHeader: !!document.querySelector('header, .header, .navbar'),
          hasSidebar: !!document.querySelector('aside, .sidebar, .side-menu'),
          hasFooter: !!document.querySelector('footer, .footer'),
        };

        // Descobre menus
        const menuSelectors = [
          'nav a', 
          '.menu a', 
          '.navbar a', 
          'aside a',
          '.sidebar a',
          '[role="menuitem"]'
        ];

        menuSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(link => {
            if (link.href && !link.href.includes('javascript:')) {
              data.menus.push({
                text: link.innerText?.trim() || link.textContent?.trim() || '',
                href: link.href,
                selector,
                parent: link.closest('nav, .menu, .navbar, aside')?.className || ''
              });
            }
          });
        });

        // Descobre links
        document.querySelectorAll('a[href]').forEach(link => {
          if (link.href && !link.href.includes('javascript:') && !link.href.includes('#')) {
            data.links.push({
              text: link.innerText?.trim() || '',
              href: link.href,
              className: link.className
            });
          }
        });

        // Descobre formulários
        document.querySelectorAll('form').forEach((form, idx) => {
          const formData = {
            id: form.id || `form-${idx}`,
            action: form.action,
            method: form.method,
            fields: []
          };

          // Inputs
          form.querySelectorAll('input, textarea, select').forEach(field => {
            formData.fields.push({
              type: field.type || field.tagName.toLowerCase(),
              name: field.name,
              id: field.id,
              required: field.required,
              placeholder: field.placeholder,
              value: field.value,
              options: field.tagName === 'SELECT' ? 
                Array.from(field.options).map(o => ({ text: o.text, value: o.value })) : 
                null
            });
          });

          data.forms.push(formData);
        });

        // Descobre tabelas
        document.querySelectorAll('table').forEach((table, idx) => {
          const tableData = {
            id: table.id || `table-${idx}`,
            headers: [],
            rowCount: table.rows.length,
            hasActions: false
          };

          // Headers
          const headerRow = table.querySelector('thead tr, tr:first-child');
          if (headerRow) {
            headerRow.querySelectorAll('th, td').forEach(cell => {
              tableData.headers.push(cell.innerText?.trim() || '');
            });
          }

          // Verifica se tem botões de ação
          tableData.hasActions = !!table.querySelector('button, a.btn, [class*="action"]');

          data.tables.push(tableData);
        });

        // Descobre botões
        document.querySelectorAll('button, [role="button"], .btn, input[type="button"], input[type="submit"]').forEach(btn => {
          data.buttons.push({
            text: btn.innerText?.trim() || btn.value || '',
            id: btn.id,
            className: btn.className,
            type: btn.type,
            disabled: btn.disabled
          });
        });

        // Descobre modais
        document.querySelectorAll('.modal, [role="dialog"], .dialog').forEach((modal, idx) => {
          data.modals.push({
            id: modal.id || `modal-${idx}`,
            title: modal.querySelector('.modal-title, .dialog-title')?.innerText || '',
            visible: !modal.classList.contains('hidden') && 
                     modal.style.display !== 'none'
          });
        });

        return data;
      }, url);

      // Armazena descoberta da página
      this.discoveredPages.set(url, pageData);

      // Adiciona menus à lista global
      pageData.menus.forEach(menu => {
        if (!this.discoveredMenus.find(m => m.href === menu.href)) {
          this.discoveredMenus.push(menu);
        }
      });

      // Adiciona formulários
      pageData.forms.forEach(form => {
        this.discoveredForms.push({ ...form, pageURL: url });
      });

      // Adiciona tabelas
      pageData.tables.forEach(table => {
        this.discoveredTables.push({ ...table, pageURL: url });
      });

      // Adiciona novas URLs para descobrir
      if (depth < this.maxDepth) {
        const newURLs = [...pageData.menus, ...pageData.links]
          .map(item => item.href)
          .filter(href => {
            try {
              const itemURL = new URL(href);
              return itemURL.origin === this.baseURL && 
                     !this.visitedURLs.has(href) &&
                     !this.pendingURLs.find(p => p.url === href);
            } catch {
              return false;
            }
          });

        newURLs.forEach(newURL => {
          this.pendingURLs.push({ url: newURL, depth: depth + 1 });
        });
      }

    } catch (error) {
      console.error(`❌ Erro ao descobrir ${url}: ${error.message}`);
    }
  }

  /**
   * Configura captura de chamadas de API
   */
  async setupAPICapture() {
    await this.page.setRequestInterception(true);

    this.page.on('request', request => {
      const url = request.url();
      
      // Captura apenas APIs (não assets estáticos)
      if (request.resourceType() === 'xhr' || request.resourceType() === 'fetch') {
        this.discoveredAPIs.push({
          url,
          method: request.method(),
          headers: request.headers(),
          postData: request.postData(),
          timestamp: new Date().toISOString()
        });
      }
      
      request.continue();
    });
  }

  /**
   * Gera mapa completo da descoberta
   */
  generateDiscoveryMap() {
    return {
      metadata: {
        baseURL: this.baseURL,
        discoveredAt: new Date().toISOString(),
        totalPages: this.discoveredPages.size,
        totalMenus: this.discoveredMenus.length,
        totalForms: this.discoveredForms.length,
        totalTables: this.discoveredTables.length,
        totalAPIs: this.discoveredAPIs.length
      },
      pages: Array.from(this.discoveredPages.values()),
      menus: this.discoveredMenus,
      forms: this.discoveredForms,
      tables: this.discoveredTables,
      apis: this.discoveredAPIs,
      navigation: this.buildNavigationTree()
    };
  }

  /**
   * Constrói árvore de navegação
   */
  buildNavigationTree() {
    const tree = {};
    
    this.discoveredMenus.forEach(menu => {
      const pathParts = new URL(menu.href).pathname.split('/').filter(p => p);
      let current = tree;
      
      pathParts.forEach((part, idx) => {
        if (!current[part]) {
          current[part] = {
            path: '/' + pathParts.slice(0, idx + 1).join('/'),
            text: menu.text,
            children: {}
          };
        }
        current = current[part].children;
      });
    });
    
    return tree;
  }

  /**
   * Salva descoberta em arquivo
   */
  async saveDiscovery(discovery) {
    const discoveryDir = path.join(process.cwd(), 'engine', 'discoveries');
    await fs.promises.mkdir(discoveryDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `discovery-${timestamp}.json`;
    const filepath = path.join(discoveryDir, filename);

    await fs.promises.writeFile(filepath, JSON.stringify(discovery, null, 2), 'utf-8');
    
    console.log(`\n💾 Descoberta salva em: ${filepath}`);
    
    // Salva também versão simplificada para visualização rápida
    const summaryPath = path.join(discoveryDir, `discovery-summary-${timestamp}.txt`);
    const summary = this.generateTextSummary(discovery);
    await fs.promises.writeFile(summaryPath, summary, 'utf-8');
    
    console.log(`📄 Resumo salvo em: ${summaryPath}`);
  }

  /**
   * Gera resumo textual
   */
  generateTextSummary(discovery) {
    let summary = '🔍 DISCOVERY ENGINE - Resumo da Descoberta\n';
    summary += '='.repeat(60) + '\n\n';
    
    summary += `🌐 URL Base: ${discovery.metadata.baseURL}\n`;
    summary += `📅 Data: ${new Date(discovery.metadata.discoveredAt).toLocaleString('pt-BR')}\n\n`;
    
    summary += '📊 ESTATÍSTICAS:\n';
    summary += `   Páginas descobertas: ${discovery.metadata.totalPages}\n`;
    summary += `   Menus descobertos: ${discovery.metadata.totalMenus}\n`;
    summary += `   Formulários descobertos: ${discovery.metadata.totalForms}\n`;
    summary += `   Tabelas descobertas: ${discovery.metadata.totalTables}\n`;
    summary += `   APIs descobertas: ${discovery.metadata.totalAPIs}\n\n`;
    
    summary += '📄 PÁGINAS:\n';
    discovery.pages.slice(0, 20).forEach((page, idx) => {
      summary += `   ${idx + 1}. ${page.title || 'Sem título'}\n`;
      summary += `      URL: ${page.url}\n`;
    });
    if (discovery.pages.length > 20) {
      summary += `   ... e mais ${discovery.pages.length - 20} páginas\n`;
    }
    summary += '\n';
    
    summary += '📝 FORMULÁRIOS:\n';
    discovery.forms.slice(0, 10).forEach((form, idx) => {
      summary += `   ${idx + 1}. ${form.id}\n`;
      summary += `      Campos: ${form.fields.length}\n`;
      summary += `      Página: ${form.pageURL}\n`;
    });
    if (discovery.forms.length > 10) {
      summary += `   ... e mais ${discovery.forms.length - 10} formulários\n`;
    }
    summary += '\n';
    
    summary += '🔌 APIs:\n';
    const uniqueAPIs = [...new Set(discovery.apis.map(a => a.url))];
    uniqueAPIs.slice(0, 15).forEach((api, idx) => {
      summary += `   ${idx + 1}. ${api}\n`;
    });
    if (uniqueAPIs.length > 15) {
      summary += `   ... e mais ${uniqueAPIs.length - 15} APIs\n`;
    }
    
    return summary;
  }
}

export default DiscoveryEngine;
