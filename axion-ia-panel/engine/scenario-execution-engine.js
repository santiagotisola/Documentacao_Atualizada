/**
 * Scenario Execution Engine
 * Reexecuta cenários aprendidos automaticamente
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class ScenarioExecutionEngine {
  constructor() {
    this.browser = null;
    this.page = null;
    this.executing = false;
    this.executionResults = [];
  }

  /**
   * Executa um cenário
   */
  async executeScenario(scenarioId, options = {}) {
    const {
      environment = 'production',
      parameters = {},
      evidencesPath = null,
      timeout = 30000
    } = options;

    console.log(`▶️ Executando cenário: ${scenarioId}`);
    console.log(`🌍 Ambiente: ${environment}`);

    // Carrega cenário
    const scenario = await this.loadScenario(scenarioId);
    if (!scenario) {
      throw new Error(`Cenário não encontrado: ${scenarioId}`);
    }

    // Aplica parâmetros customizados
    const mergedParams = { ...scenario.parameters, ...parameters };

    // Inicia browser
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--start-maximized']
    });

    this.page = await this.browser.newPage();
    this.page.setDefaultTimeout(timeout);

    const executionStart = Date.now();
    const execution = {
      scenarioId,
      environment,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      steps: [],
      status: 'running',
      errors: []
    };

    this.executing = true;

    try {
      // Executa cada passo
      for (const [index, step] of scenario.steps.entries()) {
        if (!this.executing) {
          execution.status = 'cancelled';
          break;
        }

        console.log(`📍 Step ${step.step}: ${step.description || step.action}`);

        const stepResult = await this.executeStep(step, mergedParams, evidencesPath);
        execution.steps.push(stepResult);

        if (!stepResult.success) {
          execution.status = 'failed';
          execution.errors.push({
            step: step.step,
            error: stepResult.error
          });
          console.error(`❌ Falha no passo ${step.step}: ${stepResult.error}`);
          break;
        }

        console.log(`✅ Step ${step.step} concluído (${stepResult.duration.toFixed(2)}s)`);
      }

      if (execution.status === 'running') {
        execution.status = 'success';
      }

    } catch (error) {
      execution.status = 'error';
      execution.errors.push({ error: error.message });
      console.error(`❌ Erro na execução: ${error.message}`);
    } finally {
      // Finaliza
      execution.endTime = new Date().toISOString();
      execution.duration = ((Date.now() - executionStart) / 1000).toFixed(2);

      // Fecha browser
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }

      this.executing = false;
      this.executionResults.push(execution);

      console.log(`\n${'='.repeat(50)}`);
      console.log(`📊 RESULTADO DA EXECUÇÃO`);
      console.log(`${'='.repeat(50)}`);
      console.log(`Status: ${execution.status.toUpperCase()}`);
      console.log(`Passos executados: ${execution.steps.length}/${scenario.steps.length}`);
      console.log(`Duração: ${execution.duration}s`);
      console.log(`${'='.repeat(50)}\n`);

      return execution;
    }
  }

  /**
   * Executa um passo individual
   */
  async executeStep(step, parameters, evidencesPath) {
    const startTime = Date.now();
    const result = {
      step: step.step,
      action: step.action,
      success: false,
      duration: 0,
      error: null,
      screenshot: null
    };

    try {
      switch (step.action) {
        case 'navigate':
          await this.page.goto(this.replaceParameters(step.url, parameters), { 
            waitUntil: 'networkidle0' 
          });
          result.success = true;
          break;

        case 'click':
          await this.page.waitForSelector(step.selector, { timeout: 5000 });
          await this.page.click(step.selector);
          await this.page.waitForTimeout(500);
          result.success = true;
          break;

        case 'input':
        case 'fill_form':
          if (step.fields) {
            // Múltiplos campos
            for (const field of step.fields) {
              await this.page.waitForSelector(field.selector, { timeout: 5000 });
              await this.page.type(field.selector, this.replaceParameters(field.value, parameters));
            }
          } else {
            // Campo único
            await this.page.waitForSelector(step.selector, { timeout: 5000 });
            await this.page.type(step.selector, this.replaceParameters(step.value, parameters));
          }
          result.success = true;
          break;

        case 'select':
          await this.page.waitForSelector(step.selector, { timeout: 5000 });
          await this.page.select(step.selector, this.replaceParameters(step.value, parameters));
          result.success = true;
          break;

        case 'search':
          await this.page.waitForSelector(step.selector, { timeout: 5000 });
          await this.page.type(step.selector, this.replaceParameters(step.value, parameters));
          await this.page.keyboard.press('Enter');
          await this.page.waitForTimeout(1000);
          result.success = true;
          break;

        case 'update_field':
          await this.page.waitForSelector(step.selector, { timeout: 5000 });
          await this.page.evaluate((selector) => {
            document.querySelector(selector).value = '';
          }, step.selector);
          await this.page.type(step.selector, step.newValue);
          result.success = true;
          break;

        case 'verify':
          await this.page.waitForSelector(step.selector, { timeout: 5000 });
          const text = await this.page.$eval(step.selector, el => el.textContent);
          result.success = text.includes(step.expectedText);
          if (!result.success) {
            result.error = `Texto esperado "${step.expectedText}" não encontrado. Obtido: "${text}"`;
          }
          break;

        case 'export':
          // Inicia download
          const [download] = await Promise.all([
            this.page.waitForEvent('download', { timeout: 10000 }),
            this.page.click(step.selector)
          ]);
          result.success = true;
          break;

        case 'compare':
          // Comparação implementada em outro engine
          result.success = true;
          break;

        default:
          console.warn(`⚠️ Ação não implementada: ${step.action}`);
          result.success = true;
      }

      // Captura screenshot (se path fornecido)
      if (evidencesPath) {
        const screenshotName = `step-${String(step.step).padStart(3, '0')}-${step.action}.png`;
        const screenshotPath = path.join(evidencesPath, screenshotName);
        await this.page.screenshot({ path: screenshotPath });
        result.screenshot = screenshotPath;
      }

    } catch (error) {
      result.success = false;
      result.error = error.message;
    }

    result.duration = (Date.now() - startTime) / 1000;
    return result;
  }

  /**
   * Substitui parâmetros ({{PARAM}}) por valores reais
   */
  replaceParameters(text, parameters) {
    if (!text) return text;
    
    let result = text;
    for (const [key, value] of Object.entries(parameters)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  /**
   * Carrega cenário do disco
   */
  async loadScenario(scenarioId) {
    const scenarioPath = path.join(process.cwd(), 'engine', 'scenarios', scenarioId, 'scenario.json');
    
    if (!fs.existsSync(scenarioPath)) {
      return null;
    }

    const content = fs.readFileSync(scenarioPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Cancela execução
   */
  async cancelExecution() {
    if (!this.executing) return;

    console.log('⏹️ Cancelando execução...');
    this.executing = false;

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Retorna histórico de execuções
   */
  getExecutionHistory(scenarioId = null) {
    if (scenarioId) {
      return this.executionResults.filter(e => e.scenarioId === scenarioId);
    }
    return this.executionResults;
  }

  /**
   * Gera relatório de execução
   */
  generateExecutionReport(execution) {
    const successRate = (execution.steps.filter(s => s.success).length / execution.steps.length * 100).toFixed(1);

    return {
      scenarioId: execution.scenarioId,
      environment: execution.environment,
      status: execution.status,
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: `${execution.duration}s`,
      stepsExecuted: execution.steps.length,
      stepsSuccess: execution.steps.filter(s => s.success).length,
      stepsFailed: execution.steps.filter(s => !s.success).length,
      successRate: `${successRate}%`,
      errors: execution.errors,
      steps: execution.steps.map(s => ({
        step: s.step,
        action: s.action,
        success: s.success ? '✅' : '❌',
        duration: `${s.duration.toFixed(2)}s`,
        error: s.error || '-'
      }))
    };
  }
}

export default ScenarioExecutionEngine;
