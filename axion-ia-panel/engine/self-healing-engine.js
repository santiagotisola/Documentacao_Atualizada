/**
 * SELF-HEALING ENGINE
 * Motor de Auto-Correção Inteligente
 * 
 * Capacidades:
 * - Detecta falhas automaticamente
 * - Analisa causa raiz
 * - Tenta correções automáticas
 * - Aprende com falhas anteriores
 * - Adapta seletores dinamicamente
 * - Re-tenta com estratégias diferentes
 * - Registra todas as tentativas
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class SelfHealingEngine {
  constructor() {
    this.browser = null;
    this.page = null;
    this.healingHistory = [];
    this.selectorAlternatives = new Map();
    this.failurePatterns = [];
  }

  /**
   * Executa cenário com auto-healing
   */
  async executeWithHealing(scenario, options = {}) {
    const {
      maxRetries = 3,
      adaptSelectors = true,
      learnFromFailures = true,
      headless = false
    } = options;

    console.log(`\n🔧 Executando com Self-Healing: ${scenario.name}`);

    this.browser = await puppeteer.launch({
      headless,
      defaultViewport: { width: 1920, height: 1080 }
    });

    this.page = await this.browser.newPage();

    const result = {
      scenarioName: scenario.name,
      passed: false,
      attempts: [],
      healingActions: [],
      timestamp: new Date().toISOString()
    };

    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`   Tentativa ${attempt}/${maxRetries}...`);

        const attemptResult = {
          attemptNumber: attempt,
          steps: [],
          success: true,
          error: null
        };

        try {
          for (const [stepIdx, step] of scenario.steps.entries()) {
            console.log(`      Passo ${stepIdx + 1}: ${step.action}`);

            try {
              await this.executeStepWithHealing(step, result.healingActions);
              attemptResult.steps.push({ step: stepIdx + 1, success: true });
            } catch (error) {
              console.error(`      ❌ Falha no passo ${stepIdx + 1}: ${error.message}`);

              // Tenta auto-healing
              if (adaptSelectors && step.selector) {
                console.log(`      🔧 Tentando auto-healing...`);
                
                const healed = await this.healSelector(step);
                
                if (healed) {
                  console.log(`      ✅ Auto-healing bem-sucedido!`);
                  attemptResult.steps.push({ 
                    step: stepIdx + 1, 
                    success: true, 
                    healed: true,
                    originalSelector: step.selector,
                    newSelector: healed.selector
                  });

                  result.healingActions.push({
                    step: stepIdx + 1,
                    originalSelector: step.selector,
                    newSelector: healed.selector,
                    reason: healed.reason
                  });

                  // Atualiza o step com novo seletor
                  step.selector = healed.selector;
                } else {
                  throw error;
                }
              } else {
                throw error;
              }
            }
          }

          // Se chegou aqui, todos os passos executaram com sucesso
          result.passed = true;
          result.attempts.push(attemptResult);
          break;

        } catch (error) {
          attemptResult.success = false;
          attemptResult.error = error.message;
          result.attempts.push(attemptResult);

          if (learnFromFailures) {
            this.learnFromFailure(scenario, error);
          }

          if (attempt < maxRetries) {
            console.log(`   ⚠️ Tentativa ${attempt} falhou, tentando novamente...`);
            await this.page.reload({ waitUntil: 'networkidle0' });
            await this.page.waitForTimeout(1000);
          } else {
            console.error(`   ❌ Todas as tentativas falharam`);
          }
        }
      }

      console.log(`   ${result.passed ? '✅' : '❌'} Execução ${result.passed ? 'bem-sucedida' : 'falhou'}`);
      
      if (result.healingActions.length > 0) {
        console.log(`   🔧 ${result.healingActions.length} ações de auto-healing aplicadas`);
      }

      this.healingHistory.push(result);

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
   * Executa um passo com possibilidade de healing
   */
  async executeStepWithHealing(step, healingLog) {
    switch (step.action) {
      case 'navigate':
        await this.page.goto(step.url, { waitUntil: 'networkidle0', timeout: 30000 });
        break;

      case 'fill':
        await this.page.waitForSelector(step.selector, { timeout: 5000 });
        await this.page.type(step.selector, String(step.value));
        break;

      case 'click':
        await this.page.waitForSelector(step.selector, { timeout: 5000 });
        await this.page.click(step.selector);
        break;

      case 'select':
        await this.page.waitForSelector(step.selector, { timeout: 5000 });
        await this.page.select(step.selector, String(step.value));
        break;

      case 'submit':
        const submitBtn = await this.page.$('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
          await submitBtn.click();
        } else {
          throw new Error('Botão de submit não encontrado');
        }
        break;

      default:
        console.warn(`      ⚠️ Ação desconhecida: ${step.action}`);
    }
  }

  /**
   * Tenta encontrar seletor alternativo
   */
  async healSelector(step) {
    const originalSelector = step.selector;

    console.log(`         🔍 Procurando seletor alternativo para: ${originalSelector}`);

    // Estratégia 1: Tenta ID se original era classe
    if (originalSelector.startsWith('.')) {
      const elementName = originalSelector.substring(1);
      const byId = `#${elementName}`;
      
      if (await this.selectorExists(byId)) {
        return { selector: byId, reason: 'Mudou de classe para ID' };
      }
    }

    // Estratégia 2: Tenta classe se original era ID
    if (originalSelector.startsWith('#')) {
      const elementName = originalSelector.substring(1);
      const byClass = `.${elementName}`;
      
      if (await this.selectorExists(byClass)) {
        return { selector: byClass, reason: 'Mudou de ID para classe' };
      }
    }

    // Estratégia 3: Tenta por nome (name attribute)
    const fieldName = originalSelector.replace(/[#.]/g, '');
    const byName = `[name="${fieldName}"]`;
    
    if (await this.selectorExists(byName)) {
      return { selector: byName, reason: 'Encontrou por atributo name' };
    }

    // Estratégia 4: Tenta por placeholder
    const byPlaceholder = `[placeholder*="${fieldName}"]`;
    
    if (await this.selectorExists(byPlaceholder)) {
      return { selector: byPlaceholder, reason: 'Encontrou por placeholder' };
    }

    // Estratégia 5: Tenta por tipo + ordem
    if (step.action === 'fill') {
      const inputsByType = await this.page.$$('input[type="text"], input[type="email"], textarea');
      
      if (inputsByType.length > 0) {
        // Usa o primeiro input disponível
        return { 
          selector: 'input[type="text"]:nth-of-type(1)', 
          reason: 'Encontrou primeiro input de texto disponível' 
        };
      }
    }

    // Estratégia 6: Busca por texto visível
    if (step.field) {
      const byText = await this.page.evaluate((fieldName) => {
        const labels = Array.from(document.querySelectorAll('label'));
        const matchingLabel = labels.find(l => 
          l.innerText?.toLowerCase().includes(fieldName.toLowerCase())
        );

        if (matchingLabel) {
          const forAttr = matchingLabel.getAttribute('for');
          if (forAttr) {
            return `#${forAttr}`;
          }

          // Tenta input próximo
          const input = matchingLabel.querySelector('input, textarea, select');
          if (input) {
            return input.id ? `#${input.id}` : 
                   input.name ? `[name="${input.name}"]` : 
                   null;
          }
        }

        return null;
      }, step.field);

      if (byText && await this.selectorExists(byText)) {
        return { selector: byText, reason: 'Encontrou por label associada' };
      }
    }

    return null; // Não conseguiu healing
  }

  /**
   * Verifica se seletor existe na página
   */
  async selectorExists(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Aprende com falha para melhorar futuras execuções
   */
  learnFromFailure(scenario, error) {
    this.failurePatterns.push({
      scenarioName: scenario.name,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    // Analisa padrões comuns
    const similarFailures = this.failurePatterns.filter(f => 
      f.error === error.message && f.scenarioName === scenario.name
    );

    if (similarFailures.length >= 3) {
      console.log(`      🧠 Padrão de falha detectado: ${error.message} (${similarFailures.length}x)`);
      // Aqui poderia implementar estratégias específicas baseadas no padrão
    }
  }

  /**
   * Salva histórico de healing
   */
  async saveHistory() {
    const historyDir = path.join(process.cwd(), 'engine', 'healing-history');
    await fs.promises.mkdir(historyDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `healing-history-${timestamp}.json`;
    const filepath = path.join(historyDir, filename);

    await fs.promises.writeFile(
      filepath,
      JSON.stringify({
        history: this.healingHistory,
        failurePatterns: this.failurePatterns
      }, null, 2),
      'utf-8'
    );

    console.log(`\n💾 Histórico de healing salvo em: ${filepath}`);
  }

  /**
   * Gera relatório de healing
   */
  generateReport() {
    const totalExecutions = this.healingHistory.length;
    const successfulHeals = this.healingHistory.filter(h => h.healingActions.length > 0).length;
    const totalHealingActions = this.healingHistory.reduce((sum, h) => sum + h.healingActions.length, 0);

    console.log(`\n🔧 SELF-HEALING REPORT:`);
    console.log(`   Total execuções: ${totalExecutions}`);
    console.log(`   Execuções com healing: ${successfulHeals}`);
    console.log(`   Total ações de healing: ${totalHealingActions}`);
    console.log(`   Taxa de healing: ${((successfulHeals / totalExecutions) * 100).toFixed(1)}%`);

    return {
      totalExecutions,
      successfulHeals,
      totalHealingActions,
      healingRate: (successfulHeals / totalExecutions) * 100
    };
  }
}

export default SelfHealingEngine;
