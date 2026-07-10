/**
 * CASO 9: Scenario Learning Engine
 * Motor de Aprendizagem de Cenários
 * 
 * Observa usuários executando processos e transforma automaticamente em:
 * - Casos de teste
 * - Fluxos automatizados
 * - Procedimentos operacionais
 * - Cenários de validação
 * - Documentação BPM
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Caminho absoluto fixo para cenários — independente do cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// engine/ está em axion-ia-panel/engine/, cenários em axion-ia-panel/api/engine/scenarios/
const SCENARIOS_BASE_DIR = path.resolve(__dirname, '../api/engine/scenarios');

class ScenarioLearningEngine {
  constructor() {
    this.recording = false;
    this.browser = null;
    this.page = null;
    this.scenario = null;
    this.scenarios = new Map();
    this.scenarioCounter = 1;
  }

  /**
   * Inicia gravação de cenário
   */
  async startRecording(options = {}) {
    const {
      url = '',
      name = `CNR-${String(this.scenarioCounter).padStart(6, '0')}`,
      description = '',
      category = 'Geral',
      user = 'sistema@axiontecnologia.com.br'
    } = options;

    console.log('🔴 INICIANDO APRENDIZADO...');
    console.log(`📋 Cenário: ${name}`);
    console.log(`📂 Categoria: ${category}`);

    // Inicializa browser
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--start-maximized']
    });

    this.page = await this.browser.newPage();

    // Configura captura de eventos
    await this.setupEventCapture();

    // Inicializa estrutura do cenário
    this.scenario = {
      scenarioId: name,
      name: description || name,
      description: '',
      category,
      createdBy: user,
      createdAt: new Date().toISOString(),
      startTime: Date.now(),
      duration: 0,
      steps: [],
      evidences: {
        screenshots: [],
        network: [],
        console: [],
        errors: []
      },
      parameters: {},
      reusable: true,
      parameterizable: true
    };

    // Navega para URL inicial se fornecida
    if (url) {
      await this.captureStep({
        action: 'navigate',
        type: 'initial',
        url,
        description: 'Navegação inicial'
      });
    }

    this.recording = true;
    console.log('✅ Gravação iniciada!');
    console.log('💡 Execute o fluxo normalmente. Pressione ⏹️ para encerrar.');

    return this.scenario.scenarioId;
  }

  /**
   * Configura captura de eventos
   */
  async setupEventCapture() {
    // Captura navegação
    this.page.on('framenavigated', async (frame) => {
      if (frame === this.page.mainFrame() && this.recording) {
        await this.captureNavigation(frame.url());
      }
    });

    // Captura console
    this.page.on('console', (msg) => {
      if (this.recording) {
        this.scenario.evidences.console.push({
          type: msg.type(),
          text: msg.text(),
          timestamp: Date.now()
        });
      }
    });

    // Captura erros
    this.page.on('pageerror', (error) => {
      if (this.recording) {
        this.scenario.evidences.errors.push({
          message: error.message,
          stack: error.stack,
          timestamp: Date.now()
        });
      }
    });

    // Captura requests/responses
    this.page.on('response', (response) => {
      if (this.recording) {
        this.scenario.evidences.network.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          timestamp: Date.now()
        });
      }
    });

    // Captura clicks
    await this.page.evaluateOnNewDocument(() => {
      document.addEventListener('click', (e) => {
        const target = e.target;
        window.__axionClickEvent = {
          selector: target.id ? `#${target.id}` : 
                   target.className ? `.${target.className.split(' ')[0]}` :
                   target.tagName.toLowerCase(),
          text: target.innerText?.substring(0, 50) || '',
          href: target.href || '',
          timestamp: Date.now()
        };
      }, true);
    });

    // Captura inputs
    await this.page.evaluateOnNewDocument(() => {
      document.addEventListener('input', (e) => {
        const target = e.target;
        window.__axionInputEvent = {
          selector: target.id ? `#${target.id}` : target.name ? `[name="${target.name}"]` : '',
          value: target.value,
          type: target.type,
          timestamp: Date.now()
        };
      }, true);
    });
  }

  /**
   * Captura navegação
   */
  async captureNavigation(url) {
    await this.captureStep({
      action: 'navigate',
      type: 'navigation',
      url,
      description: `Navegou para ${url}`
    });
  }

  /**
   * Captura um passo do fluxo
   */
  async captureStep(stepData) {
    if (!this.recording) return;

    const stepNumber = this.scenario.steps.length + 1;
    const startTime = Date.now();

    const step = {
      step: stepNumber,
      action: stepData.action || 'unknown',
      type: stepData.type || 'manual',
      description: stepData.description || '',
      timestamp: new Date().toISOString(),
      duration: 0,
      ...stepData
    };

    // Captura screenshot
    try {
      const screenshotPath = `screenshots/step-${String(stepNumber).padStart(3, '0')}.png`;
      const fullPath = path.join(SCENARIOS_BASE_DIR, this.scenario.scenarioId, screenshotPath);
      
      await mkdir(path.dirname(fullPath), { recursive: true });
      await this.page.screenshot({ path: fullPath, fullPage: false });
      
      step.screenshot = screenshotPath;
      this.scenario.evidences.screenshots.push(screenshotPath);
    } catch (error) {
      console.error('Erro ao capturar screenshot:', error);
    }

    // Captura validação (elementos esperados na tela)
    try {
      const validation = await this.page.evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          visibleElements: Array.from(document.querySelectorAll('[class*="btn"], [class*="menu"], h1, h2')).length
        };
      });
      step.validation = validation;
    } catch (error) {
      // Ignore
    }

    step.duration = (Date.now() - startTime) / 1000;
    this.scenario.steps.push(step);

    console.log(`📍 Step ${stepNumber}: ${step.action} - ${step.description} (${step.duration.toFixed(2)}s)`);
  }

  /**
   * Monitora ações do usuário
   */
  async monitorUserActions(intervalMs = 500) {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        if (!this.recording || !this.page) {
          clearInterval(interval);
          resolve();
          return;
        }

        try {
          // Verifica click events
          const clickEvent = await this.page.evaluate(() => {
            const event = window.__axionClickEvent;
            window.__axionClickEvent = null;
            return event;
          });

          if (clickEvent) {
            await this.captureStep({
              action: 'click',
              type: 'interaction',
              selector: clickEvent.selector,
              text: clickEvent.text,
              description: `Clicou em "${clickEvent.text || clickEvent.selector}"`
            });
          }

          // Verifica input events
          const inputEvent = await this.page.evaluate(() => {
            const event = window.__axionInputEvent;
            window.__axionInputEvent = null;
            return event;
          });

          if (inputEvent) {
            await this.captureStep({
              action: 'input',
              type: 'interaction',
              selector: inputEvent.selector,
              value: inputEvent.type === 'password' ? '{{PASSWORD}}' : inputEvent.value,
              description: `Preencheu campo ${inputEvent.selector}`
            });

            // Adiciona aos parâmetros parametrizáveis
            if (inputEvent.type !== 'password') {
              const paramName = inputEvent.selector.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
              this.scenario.parameters[paramName] = inputEvent.value;
            }
          }
        } catch (error) {
          // Página pode ter sido fechada
          if (error.message.includes('Target closed')) {
            clearInterval(interval);
            resolve();
          }
        }
      }, intervalMs);
    });
  }

  /**
   * Encerra gravação
   */
  async stopRecording() {
    if (!this.recording) {
      console.log('⚠️ Nenhuma gravação ativa');
      return null;
    }

    console.log('⏹️ ENCERRANDO APRENDIZADO...');
    this.recording = false;

    // Finaliza cenário
    this.scenario.duration = ((Date.now() - this.scenario.startTime) / 1000).toFixed(2);
    delete this.scenario.startTime;

    // Fecha browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }

    // Salva cenário
    await this.saveScenario(this.scenario);

    // Adiciona à biblioteca
    this.scenarios.set(this.scenario.scenarioId, this.scenario);
    this.scenarioCounter++;

    console.log('✅ Gravação encerrada!');
    console.log(`📊 ${this.scenario.steps.length} passos gravados`);
    console.log(`⏱️ Duração: ${this.scenario.duration}s`);

    // Gera outputs automáticos
    await this.generateOutputs(this.scenario);

    const scenarioId = this.scenario.scenarioId;
    this.scenario = null;

    return scenarioId;
  }

  /**
   * Salva cenário
   */
  async saveScenario(scenario) {
    const scenarioDir = path.join(SCENARIOS_BASE_DIR, scenario.scenarioId);
    await mkdir(scenarioDir, { recursive: true });

    const scenarioPath = path.join(scenarioDir, 'scenario.json');
    await writeFile(scenarioPath, JSON.stringify(scenario, null, 2), 'utf-8');

    console.log(`💾 Cenário salvo: ${scenarioPath}`);
  }

  /**
   * Gera outputs automáticos (caso de teste, workflow, BPM, etc.)
   */
  async generateOutputs(scenario) {
    const scenarioDir = path.join(SCENARIOS_BASE_DIR, scenario.scenarioId);

    // 1. Workflow (JSON)
    const workflow = {
      workflowId: `WF-${scenario.scenarioId}`,
      name: scenario.name,
      steps: scenario.steps.map(s => ({
        step: s.step,
        action: s.action,
        selector: s.selector,
        value: s.value,
        validation: s.validation
      }))
    };
    await writeFile(
      path.join(scenarioDir, 'workflow.json'),
      JSON.stringify(workflow, null, 2),
      'utf-8'
    );

    // 2. Caso de Teste (Markdown)
    const testCase = this.generateTestCase(scenario);
    await writeFile(
      path.join(scenarioDir, 'test-case.md'),
      testCase,
      'utf-8'
    );

    // 3. Documentação BPM (Mermaid)
    const bpmDiagram = this.generateBPMDiagram(scenario);
    await writeFile(
      path.join(scenarioDir, 'bpm-diagram.mmd'),
      bpmDiagram,
      'utf-8'
    );

    // 4. Procedimento Operacional (Markdown)
    const sop = this.generateSOP(scenario);
    await writeFile(
      path.join(scenarioDir, 'procedimento-operacional.md'),
      sop,
      'utf-8'
    );

    console.log('📄 Outputs gerados: workflow.json, test-case.md, bpm-diagram.mmd, procedimento-operacional.md');
  }

  /**
   * Gera caso de teste
   */
  generateTestCase(scenario) {
    return `# Caso de Teste: ${scenario.scenarioId}

## Identificação
- **ID:** CT-${scenario.scenarioId.replace('CNR', '')}
- **Nome:** ${scenario.name}
- **Categoria:** ${scenario.category}
- **Criado:** ${new Date(scenario.createdAt).toLocaleString('pt-BR')} por ${scenario.createdBy}
- **Origem:** Gravação de workflow real

## Objetivo
Validar o fluxo: ${scenario.name}

## Pré-condições
- Sistema acessível
- Usuário com permissões adequadas
${Object.keys(scenario.parameters).length > 0 ? '- Dados de teste disponíveis' : ''}

${Object.keys(scenario.parameters).length > 0 ? `## Dados de Entrada
${Object.entries(scenario.parameters).map(([key, value]) => `- **${key}:** ${value}`).join('\n')}
` : ''}

## Passos de Execução
${scenario.steps.map((step, idx) => `${idx + 1}. ${step.description || step.action}`).join('\n')}

## Resultados Esperados
${scenario.steps.map((step, idx) => `${idx + 1}. ✅ ${step.validation?.title || 'Passo executado com sucesso'}`).join('\n')}

## Evidências
- Screenshots: ${scenario.evidences.screenshots.length} imagens
- Duração total: ${scenario.duration} segundos
- Status: ✅ Aprovado

## Observações
- Cenário parametrizável: ${scenario.parameterizable ? 'Sim' : 'Não'}
- Cenário reutilizável: ${scenario.reusable ? 'Sim' : 'Não'}
- Pode ser executado em múltiplos ambientes
`;
  }

  /**
   * Gera diagrama BPM (Mermaid)
   */
  generateBPMDiagram(scenario) {
    let diagram = `flowchart TD
    Start([Início])
`;

    scenario.steps.forEach((step, idx) => {
      const currentNode = `Step${idx + 1}`;
      const nextNode = idx < scenario.steps.length - 1 ? `Step${idx + 2}` : 'End';
      
      diagram += `    ${currentNode}[${step.description || step.action}]\n`;
      diagram += `    ${idx === 0 ? 'Start' : `Step${idx}`} --> ${currentNode}\n`;
      
      if (idx === scenario.steps.length - 1) {
        diagram += `    ${currentNode} --> End([Fim])\n`;
      }
    });

    return diagram;
  }

  /**
   * Gera procedimento operacional (SOP)
   */
  generateSOP(scenario) {
    return `# Procedimento Operacional: ${scenario.name}

**Código:** PO-${scenario.scenarioId}  
**Versão:** 1.0  
**Data:** ${new Date(scenario.createdAt).toLocaleDateString('pt-BR')}  
**Responsável:** ${scenario.createdBy}

## Objetivo
Este procedimento descreve o passo-a-passo para executar: ${scenario.name}

## Aplicação
Categoria: ${scenario.category}

## Responsabilidades
- **Operador:** Executar o procedimento
- **Supervisor:** Validar execução
- **Qualidade:** Auditar conformidade

## Procedimento

${scenario.steps.map((step, idx) => `
### ${idx + 1}. ${step.description || step.action}

**Ação:** ${step.action}  
**Tipo:** ${step.type}  
${step.selector ? `**Elemento:** ${step.selector}  ` : ''}
${step.value ? `**Valor:** ${step.value}  ` : ''}
**Tempo estimado:** ${step.duration}s

**Validação:**
- ${step.validation?.title || 'Verificar execução bem-sucedida'}

`).join('\n')}

## Tempo Total
**Duração estimada:** ${scenario.duration} segundos (${(scenario.duration / 60).toFixed(1)} minutos)

## Registros
- Screenshots: Ver pasta ${scenario.scenarioId}/screenshots/
- Logs: Ver pasta ${scenario.scenarioId}/logs/

## Histórico de Revisões
| Versão | Data | Alteração | Responsável |
|--------|------|-----------|-------------|
| 1.0 | ${new Date(scenario.createdAt).toLocaleDateString('pt-BR')} | Criação inicial (gerado automaticamente) | ${scenario.createdBy} |
`;
  }

  /**
   * Lista todos os cenários da biblioteca
   */
  listScenarios(filter = {}) {
    const { category, createdBy, reusable } = filter;
    
    let scenarios = Array.from(this.scenarios.values());

    if (category) {
      scenarios = scenarios.filter(s => s.category === category);
    }
    if (createdBy) {
      scenarios = scenarios.filter(s => s.createdBy === createdBy);
    }
    if (reusable !== undefined) {
      scenarios = scenarios.filter(s => s.reusable === reusable);
    }

    return scenarios.map(s => ({
      scenarioId: s.scenarioId,
      name: s.name,
      category: s.category,
      steps: s.steps.length,
      duration: s.duration,
      createdAt: s.createdAt,
      createdBy: s.createdBy
    }));
  }

  /**
   * Carrega cenário da biblioteca
   */
  async loadScenario(scenarioId) {
    const scenarioPath = path.join(SCENARIOS_BASE_DIR, scenarioId, 'scenario.json');
    
    if (!fs.existsSync(scenarioPath)) {
      throw new Error(`Cenário não encontrado: ${scenarioId}`);
    }

    const content = fs.readFileSync(scenarioPath, 'utf-8');
    const scenario = JSON.parse(content);
    
    this.scenarios.set(scenarioId, scenario);
    return scenario;
  }

  /**
   * Carrega todos os cenários da biblioteca
   */
  async loadAllScenarios() {
    const scenariosDir = SCENARIOS_BASE_DIR;
    
    if (!fs.existsSync(scenariosDir)) {
      await mkdir(scenariosDir, { recursive: true });
      return;
    }

    const dirs = fs.readdirSync(scenariosDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const dir of dirs) {
      try {
        await this.loadScenario(dir);
      } catch (error) {
        console.error(`Erro ao carregar cenário ${dir}:`, error.message);
      }
    }

    console.log(`📚 ${this.scenarios.size} cenários carregados da biblioteca`);
  }

  /**
   * Exporta estatísticas da biblioteca
   */
  getLibraryStats() {
    const scenarios = Array.from(this.scenarios.values());
    const categories = {};
    
    scenarios.forEach(s => {
      if (!categories[s.category]) {
        categories[s.category] = { count: 0, scenarios: [] };
      }
      categories[s.category].count++;
      categories[s.category].scenarios.push(s.scenarioId);
    });

    return {
      total: scenarios.length,
      categories,
      reusable: scenarios.filter(s => s.reusable).length,
      parameterizable: scenarios.filter(s => s.parameterizable).length,
      totalSteps: scenarios.reduce((sum, s) => sum + s.steps.length, 0),
      avgStepsPerScenario: (scenarios.reduce((sum, s) => sum + s.steps.length, 0) / scenarios.length || 0).toFixed(1),
      totalDuration: scenarios.reduce((sum, s) => sum + parseFloat(s.duration), 0).toFixed(2)
    };
  }
}

export default ScenarioLearningEngine;
