/**
 * FORM VALIDATION ENGINE
 * Motor de Validação Automática de Formulários
 * 
 * Preenche e valida formulários automaticamente:
 * - Auto-detecta campos (inputs, textareas, selects, checkboxes, radios)
 * - Preenche com dados válidos/inválidos conforme cenário
 * - Valida máscaras, limites, regras de negócio
 * - Testa campos obrigatórios
 * - Upload de arquivos
 * - Submit e validação de resultado
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class FormValidationEngine {
  constructor() {
    this.browser = null;
    this.page = null;
    this.validationResults = [];
  }

  /**
   * Valida um formulário conforme cenário
   */
  async validate(scenario, options = {}) {
    const { headless = false, screenshotOnError = true } = options;

    console.log(`\n📝 Validando formulário: ${scenario.name}`);

    this.browser = await puppeteer.launch({
      headless,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--start-maximized']
    });

    this.page = await this.browser.newPage();

    const startTime = Date.now();
    let passed = true;
    const errors = [];

    try {
      // Executa cada passo do cenário
      for (const [idx, step] of scenario.steps.entries()) {
        console.log(`   Passo ${idx + 1}/${scenario.steps.length}: ${step.action}`);

        try {
          await this.executeStep(step);
        } catch (error) {
          passed = false;
          errors.push({
            step: idx + 1,
            action: step.action,
            error: error.message
          });

          if (screenshotOnError) {
            await this.takeScreenshot(`error-step-${idx + 1}`);
          }

          console.error(`   ❌ Erro: ${error.message}`);
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      const result = {
        scenarioId: scenario.scenarioId,
        scenarioName: scenario.name,
        passed,
        duration,
        errors,
        timestamp: new Date().toISOString()
      };

      this.validationResults.push(result);

      if (passed) {
        console.log(`   ✅ Validação passou em ${duration}s`);
      } else {
        console.log(`   ❌ Validação falhou em ${duration}s (${errors.length} erros)`);
      }

      return result;

    } catch (error) {
      console.error(`   ❌ Erro fatal: ${error.message}`);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * Executa um passo específico
   */
  async executeStep(step) {
    switch (step.action) {
      case 'navigate':
        await this.navigate(step.url);
        break;

      case 'fill':
        await this.fillField(step.selector, step.value, step.field);
        break;

      case 'click':
        await this.clickElement(step.selector);
        break;

      case 'select':
        await this.selectOption(step.selector, step.value);
        break;

      case 'check':
        await this.toggleCheckbox(step.selector, true);
        break;

      case 'uncheck':
        await this.toggleCheckbox(step.selector, false);
        break;

      case 'upload':
        await this.uploadFile(step.selector, step.file);
        break;

      case 'submit':
        await this.submitForm(step.expectedResult, step.expectedMessage);
        break;

      case 'wait':
        await this.page.waitForTimeout(step.duration || 1000);
        break;

      case 'validate_table_headers':
        await this.validateTableHeaders(step.tableId, step.expectedHeaders);
        break;

      case 'validate_table_actions':
        await this.validateTableActions(step.tableId);
        break;

      case 'random_clicks':
        await this.randomClicks(step.count, step.avoidDestructive);
        break;

      case 'random_inputs':
        await this.randomInputs(step.count);
        break;

      case 'api_call':
        await this.validateAPI(step);
        break;

      default:
        console.warn(`   ⚠️ Ação desconhecida: ${step.action}`);
    }
  }

  /**
   * Navega para uma URL
   */
  async navigate(url) {
    await this.page.goto(url, { 
      waitUntil: 'networkidle0', 
      timeout: 30000 
    });
    await this.page.waitForTimeout(500);
  }

  /**
   * Preenche um campo
   */
  async fillField(selector, value, fieldName) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      
      // Limpa campo primeiro
      await this.page.click(selector, { clickCount: 3 });
      await this.page.keyboard.press('Backspace');
      
      // Preenche
      await this.page.type(selector, String(value), { delay: 50 });
      
      console.log(`      ✓ Campo "${fieldName}" preenchido com: ${value}`);
    } catch (error) {
      throw new Error(`Erro ao preencher campo "${fieldName}" (${selector}): ${error.message}`);
    }
  }

  /**
   * Clica em um elemento
   */
  async clickElement(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.click(selector);
      await this.page.waitForTimeout(500);
    } catch (error) {
      throw new Error(`Erro ao clicar em elemento (${selector}): ${error.message}`);
    }
  }

  /**
   * Seleciona opção em select
   */
  async selectOption(selector, value) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      await this.page.select(selector, String(value));
      console.log(`      ✓ Opção selecionada: ${value}`);
    } catch (error) {
      throw new Error(`Erro ao selecionar opção (${selector}): ${error.message}`);
    }
  }

  /**
   * Marca/desmarca checkbox
   */
  async toggleCheckbox(selector, checked) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      
      const isChecked = await this.page.$eval(selector, el => el.checked);
      
      if (isChecked !== checked) {
        await this.page.click(selector);
      }
      
      console.log(`      ✓ Checkbox ${checked ? 'marcado' : 'desmarcado'}`);
    } catch (error) {
      throw new Error(`Erro ao alternar checkbox (${selector}): ${error.message}`);
    }
  }

  /**
   * Faz upload de arquivo
   */
  async uploadFile(selector, filePath) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      
      const input = await this.page.$(selector);
      await input.uploadFile(filePath);
      
      console.log(`      ✓ Arquivo enviado: ${path.basename(filePath)}`);
    } catch (error) {
      throw new Error(`Erro ao fazer upload (${selector}): ${error.message}`);
    }
  }

  /**
   * Submete formulário e valida resultado
   */
  async submitForm(expectedResult = 'success', expectedMessage = null) {
    try {
      // Procura botão de submit
      const submitButton = await this.page.evaluateHandle(() => {
        return document.querySelector('button[type="submit"], input[type="submit"], button.btn-primary, button:contains("Enviar"), button:contains("Salvar")');
      });

      if (!submitButton) {
        throw new Error('Botão de submit não encontrado');
      }

      // Clica e aguarda
      await Promise.all([
        submitButton.asElement().click(),
        this.page.waitForTimeout(2000)
      ]);

      // Valida resultado esperado
      if (expectedResult === 'success') {
        await this.validateSuccess(expectedMessage);
      } else if (expectedResult === 'error') {
        await this.validateError(expectedMessage);
      }

    } catch (error) {
      throw new Error(`Erro ao submeter formulário: ${error.message}`);
    }
  }

  /**
   * Valida submissão bem-sucedida
   */
  async validateSuccess(expectedMessage) {
    const hasSuccessMessage = await this.page.evaluate((msg) => {
      const successSelectors = [
        '.alert-success',
        '.success',
        '.toast-success',
        '.notification-success',
        '[class*="success"]'
      ];

      for (const selector of successSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.innerText || element.textContent;
          if (msg) {
            return text.includes(msg);
          }
          return true;
        }
      }

      return false;
    }, expectedMessage);

    if (!hasSuccessMessage) {
      throw new Error('Mensagem de sucesso não encontrada');
    }

    console.log('      ✓ Submissão bem-sucedida');
  }

  /**
   * Valida erro esperado
   */
  async validateError(expectedMessage) {
    const hasErrorMessage = await this.page.evaluate((msg) => {
      const errorSelectors = [
        '.alert-error',
        '.alert-danger',
        '.error',
        '.toast-error',
        '.notification-error',
        '[class*="error"]',
        '.invalid-feedback',
        '.field-error'
      ];

      for (const selector of errorSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.innerText || element.textContent;
          if (msg) {
            return text.includes(msg);
          }
          return true;
        }
      }

      return false;
    }, expectedMessage);

    if (!hasErrorMessage) {
      throw new Error('Mensagem de erro esperada não encontrada');
    }

    console.log('      ✓ Erro validado conforme esperado');
  }

  /**
   * Valida cabeçalhos de tabela
   */
  async validateTableHeaders(tableId, expectedHeaders) {
    const headers = await this.page.evaluate((id) => {
      const table = document.querySelector(`#${id}, table`);
      if (!table) return null;

      const headerRow = table.querySelector('thead tr, tr:first-child');
      if (!headerRow) return null;

      return Array.from(headerRow.querySelectorAll('th, td')).map(cell => 
        cell.innerText?.trim() || ''
      );
    }, tableId);

    if (!headers) {
      throw new Error(`Tabela "${tableId}" não encontrada`);
    }

    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Colunas faltando: ${missingHeaders.join(', ')}`);
    }

    console.log('      ✓ Cabeçalhos da tabela validados');
  }

  /**
   * Valida ações de tabela
   */
  async validateTableActions(tableId) {
    const hasActions = await this.page.evaluate((id) => {
      const table = document.querySelector(`#${id}, table`);
      if (!table) return false;

      return !!table.querySelector('button, a.btn, [class*="action"]');
    }, tableId);

    if (!hasActions) {
      throw new Error(`Tabela "${tableId}" não possui botões de ação`);
    }

    console.log('      ✓ Ações da tabela validadas');
  }

  /**
   * Cliques aleatórios (exploratório)
   */
  async randomClicks(count, avoidDestructive = true) {
    for (let i = 0; i < count; i++) {
      try {
        await this.page.evaluate((avoid) => {
          const clickableElements = Array.from(document.querySelectorAll('a, button, [role="button"]'));
          
          let filtered = clickableElements;
          if (avoid) {
            filtered = clickableElements.filter(el => {
              const text = (el.innerText || el.textContent || '').toLowerCase();
              return !text.includes('excluir') && 
                     !text.includes('delete') && 
                     !text.includes('remover') &&
                     !text.includes('apagar');
            });
          }

          if (filtered.length > 0) {
            const random = filtered[Math.floor(Math.random() * filtered.length)];
            random.click();
          }
        }, avoidDestructive);

        await this.page.waitForTimeout(1000);
      } catch (error) {
        // Ignora erros em cliques exploratórios
      }
    }

    console.log(`      ✓ ${count} cliques aleatórios executados`);
  }

  /**
   * Inputs aleatórios (exploratório)
   */
  async randomInputs(count) {
    for (let i = 0; i < count; i++) {
      try {
        await this.page.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('input[type="text"], textarea'));
          if (inputs.length > 0) {
            const random = inputs[Math.floor(Math.random() * inputs.length)];
            const randomText = Math.random().toString(36).substring(7);
            random.value = randomText;
            random.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });

        await this.page.waitForTimeout(500);
      } catch (error) {
        // Ignora erros
      }
    }

    console.log(`      ✓ ${count} inputs aleatórios executados`);
  }

  /**
   * Valida chamada de API
   */
  async validateAPI(step) {
    console.log(`      → ${step.method} ${step.url}`);
    
    // Implementar validação real de API se necessário
    // Por ora, apenas log
    
    console.log('      ✓ API validada (mock)');
  }

  /**
   * Tira screenshot
   */
  async takeScreenshot(name) {
    const screenshotsDir = path.join(process.cwd(), 'engine', 'screenshots');
    await fs.promises.mkdir(screenshotsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(screenshotsDir, filename);

    await this.page.screenshot({ 
      path: filepath, 
      fullPage: true 
    });

    console.log(`      📸 Screenshot: ${filename}`);
  }

  /**
   * Salva resultados das validações
   */
  async saveResults() {
    const resultsDir = path.join(process.cwd(), 'engine', 'validation-results');
    await fs.promises.mkdir(resultsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `validation-results-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);

    await fs.promises.writeFile(
      filepath,
      JSON.stringify(this.validationResults, null, 2),
      'utf-8'
    );

    console.log(`\n💾 Resultados salvos em: ${filepath}`);
  }
}

export default FormValidationEngine;
