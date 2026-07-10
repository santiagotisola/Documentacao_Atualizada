/**
 * SCENARIO GENERATION ENGINE
 * Motor de Geração Automática de Cenários de Teste
 * 
 * Transforma a descoberta automática (Discovery Engine) em:
 * - Casos de teste funcionais
 * - Boundary cases (limites)
 * - Negative cases (entradas inválidas)
 * - Random cases (exploratório)
 * - Suite de regressão
 * 
 * ENTRADA: Discovery map (output do Discovery Engine)
 * SAÍDA: 500-1000 cenários de teste prontos para execução
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

class ScenarioGenerationEngine {
  constructor() {
    this.scenarios = [];
    this.scenarioCounter = 1;
  }

  /**
   * Gera cenários automaticamente a partir da descoberta
   */
  async generate(discovery, options = {}) {
    const {
      generateBoundary = true,
      generateNegative = true,
      generateRandom = true,
      generateRegression = true,
      maxScenariosPerForm = 20,
      maxScenariosPerTable = 10
    } = options;

    console.log('\n🎯 SCENARIO GENERATION ENGINE - Iniciando geração automática...\n');

    const startTime = Date.now();
    this.scenarios = [];

    // 1. Gera cenários de navegação (uma página = um cenário)
    console.log('📍 Gerando cenários de navegação...');
    this.generateNavigationScenarios(discovery);

    // 2. Gera cenários de formulários
    console.log('📝 Gerando cenários de formulários...');
    discovery.forms.forEach(form => {
      this.generateFormScenarios(form, {
        boundary: generateBoundary,
        negative: generateNegative,
        maxScenarios: maxScenariosPerForm
      });
    });

    // 3. Gera cenários de tabelas/listagens
    console.log('📊 Gerando cenários de tabelas...');
    discovery.tables.forEach(table => {
      this.generateTableScenarios(table, maxScenariosPerTable);
    });

    // 4. Gera cenários de APIs
    if (discovery.apis && discovery.apis.length > 0) {
      console.log('🔌 Gerando cenários de APIs...');
      this.generateAPIScenarios(discovery.apis);
    }

    // 5. Gera cenários exploratórios (random)
    if (generateRandom) {
      console.log('🎲 Gerando cenários exploratórios...');
      this.generateRandomScenarios(discovery);
    }

    // 6. Gera suite de regressão
    if (generateRegression) {
      console.log('🔄 Gerando suite de regressão...');
      this.generateRegressionSuite(discovery);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\n✅ Geração concluída em ${duration}s`);
    console.log(`📊 Total de cenários gerados: ${this.scenarios.length}`);
    console.log(`   • Navegação: ${this.scenarios.filter(s => s.type === 'navigation').length}`);
    console.log(`   • Formulários: ${this.scenarios.filter(s => s.type === 'form').length}`);
    console.log(`   • Tabelas: ${this.scenarios.filter(s => s.type === 'table').length}`);
    console.log(`   • APIs: ${this.scenarios.filter(s => s.type === 'api').length}`);
    console.log(`   • Exploratórios: ${this.scenarios.filter(s => s.type === 'exploratory').length}`);
    console.log(`   • Regressão: ${this.scenarios.filter(s => s.type === 'regression').length}`);

    // Salva cenários
    await this.saveScenarios(discovery.metadata.baseURL);

    return {
      scenarios: this.scenarios,
      stats: this.getStats()
    };
  }

  /**
   * Gera cenários de navegação (um por página descoberta)
   */
  generateNavigationScenarios(discovery) {
    discovery.pages.forEach(page => {
      this.scenarios.push({
        scenarioId: `SCN-${String(this.scenarioCounter++).padStart(6, '0')}`,
        type: 'navigation',
        category: 'Navigation',
        name: `Navegar para: ${page.title || 'Página'}`,
        description: `Acessa a página "${page.title}" e valida carregamento`,
        priority: 'medium',
        steps: [
          {
            action: 'navigate',
            url: page.url,
            expectedTitle: page.title,
            validations: [
              { type: 'title', expected: page.title },
              { type: 'status', expected: 200 },
              { type: 'loadTime', expected: '< 3s' }
            ]
          }
        ],
        metadata: {
          pageURL: page.url,
          pageTitle: page.title,
          generated: new Date().toISOString()
        }
      });
    });
  }

  /**
   * Gera cenários para um formulário específico
   */
  generateFormScenarios(form, options) {
    const { boundary, negative, maxScenarios } = options;
    let scenariosGenerated = 0;

    // Cenário 1: Happy path (preenchimento válido completo)
    this.scenarios.push({
      scenarioId: `SCN-${String(this.scenarioCounter++).padStart(6, '0')}`,
      type: 'form',
      category: 'Form Validation',
      name: `[${form.id}] Happy Path - Preenchimento completo válido`,
      description: `Preenche todos os campos do formulário "${form.id}" com dados válidos e submete`,
      priority: 'high',
      steps: [
        {
          action: 'navigate',
          url: form.pageURL
        },
        ...form.fields.map(field => ({
          action: 'fill',
          selector: field.id ? `#${field.id}` : `[name="${field.name}"]`,
          value: this.generateValidValue(field),
          field: field.name || field.id
        })),
        {
          action: 'submit',
          expectedResult: 'success'
        }
      ],
      metadata: {
        formId: form.id,
        formAction: form.action,
        pageURL: form.pageURL
      }
    });
    scenariosGenerated++;

    // Cenário 2: Campos obrigatórios vazios (se houver)
    const requiredFields = form.fields.filter(f => f.required);
    if (requiredFields.length > 0 && negative) {
      requiredFields.forEach(field => {
        if (scenariosGenerated >= maxScenarios) return;

        this.scenarios.push({
          scenarioId: `SCN-${String(this.scenarioCounter++).padStart(6, '0')}`,
          type: 'form',
          category: 'Form Validation - Negative',
          name: `[${form.id}] Campo obrigatório vazio: ${field.name}`,
          description: `Submete formulário sem preencher o campo obrigatório "${field.name}"`,
          priority: 'medium',
          steps: [
            {
              action: 'navigate',
              url: form.pageURL
            },
            ...form.fields
              .filter(f => f !== field)
              .map(f => ({
                action: 'fill',
                selector: f.id ? `#${f.id}` : `[name="${f.name}"]`,
                value: this.generateValidValue(f),
                field: f.name || f.id
              })),
            {
              action: 'submit',
              expectedResult: 'error',
              expectedMessage: `Campo "${field.name}" é obrigatório`
            }
          ],
          metadata: {
            formId: form.id,
            testType: 'required_field',
            fieldTested: field.name
          }
        });
        scenariosGenerated++;
      });
    }

    // Cenário 3: Boundary cases (valores limite)
    if (boundary) {
      form.fields.forEach(field => {
        if (scenariosGenerated >= maxScenarios) return;

        const boundaryCases = this.generateBoundaryCases(field);
        boundaryCases.forEach(testCase => {
          this.scenarios.push({
            scenarioId: `SCN-${String(this.scenarioCounter++).padStart(6, '0')}`,
            type: 'form',
            category: 'Form Validation - Boundary',
            name: `[${form.id}] ${field.name}: ${testCase.description}`,
            description: `Testa valor limite "${testCase.value}" no campo "${field.name}"`,
            priority: 'medium',
            steps: [
              {
                action: 'navigate',
                url: form.pageURL
              },
              ...form.fields.map(f => ({
                action: 'fill',
                selector: f.id ? `#${f.id}` : `[name="${f.name}"]`,
                value: f === field ? testCase.value : this.generateValidValue(f),
                field: f.name || f.id
              })),
              {
                action: 'submit',
                expectedResult: testCase.shouldFail ? 'error' : 'success'
              }
            ],
            metadata: {
              formId: form.id,
              testType: 'boundary',
              fieldTested: field.name,
              boundaryValue: testCase.value
            }
          });
          scenariosGenerated++;
        });
      });
    }

    // Cenário 4: Negative cases (entradas inválidas)
    if (negative) {
      form.fields.forEach(field => {
        if (scenariosGenerated >= maxScenarios) return;

        const invalidValues = this.generateInvalidValues(field);
        invalidValues.slice(0, 2).forEach(testCase => {
          this.scenarios.push({
            scenarioId: `SCN-${String(this.scenarioCounter++).padStart(6, '0')}`,
            type: 'form',
            category: 'Form Validation - Negative',
            name: `[${form.id}] ${field.name}: ${testCase.description}`,
            description: `Testa valor inválido "${testCase.value}" no campo "${field.name}"`,
            priority: 'low',
            steps: [
              {
                action: 'navigate',
                url: form.pageURL
              },
              ...form.fields.map(f => ({
                action: 'fill',
                selector: f.id ? `#${f.id}` : `[name="${f.name}"]`,
                value: f === field ? testCase.value : this.generateValidValue(f),
                field: f.name || f.id
              })),
              {
                action: 'submit',
                expectedResult: 'error',
                expectedMessage: testCase.expectedError
              }
            ],
            metadata: {
              formId: form.id,
              testType: 'invalid_input',
              fieldTested: field.name,
              invalidValue: testCase.value
            }
          });
          scenariosGenerated++;
        });
      });
    }
  }

  /**
   * Gera cenários para tabelas/listagens
   */
  generateTableScenarios(table, maxScenarios) {
    let generated = 0;

    // Cenário: Verificar colunas da tabela
    this.scenarios.push({
      scenarioId: `SCN-${String(this.scenarioCounter++).padStart(6, '0')}`,
      type: 'table',
      category: 'Table Validation',
      name: `[${table.id}] Verificar estrutura da tabela`,
      description: `Valida que a tabela "${table.id}" possui as colunas corretas`,
      priority: 'medium',
      steps: [
        {
          action: 'navigate',
          url: table.pageURL
        },
        {
          action: 'validate_table_headers',
          tableId: table.id,
          expectedHeaders: table.headers
        }
      ],
      metadata: {
        tableId: table.id,
        pageURL: table.pageURL
      }
    });
    generated++;

    // Se a tabela tem ações (editar, excluir, etc.)
    if (table.hasActions && generated < maxScenarios) {
      this.scenarios.push({
        scenarioId: `SCN-${String(this.scenarioCounter++).padStart(6, '0')}`,
        type: 'table',
        category: 'Table Actions',
        name: `[${table.id}] Verificar ações disponíveis`,
        description: `Valida que os botões de ação estão presentes na tabela`,
        priority: 'medium',
        steps: [
          {
            action: 'navigate',
            url: table.pageURL
          },
          {
            action: 'validate_table_actions',
            tableId: table.id
          }
        ],
        metadata: {
          tableId: table.id,
          pageURL: table.pageURL
        }
      });
      generated++;
    }
  }

  /**
   * Gera cenários de API
   */
  generateAPIScenarios(apis) {
    const uniqueAPIs = [...new Map(apis.map(api => [api.url, api])).values()];

    uniqueAPIs.forEach(api => {
      this.scenarios.push({
        scenarioId: `SCN-${String(this.scenarioCounter++).padStart(6, '0')}`,
        type: 'api',
        category: 'API Validation',
        name: `[API] ${api.method} ${api.url.substring(0, 60)}...`,
        description: `Valida endpoint ${api.method} ${api.url}`,
        priority: 'high',
        steps: [
          {
            action: 'api_call',
            method: api.method,
            url: api.url,
            headers: api.headers,
            body: api.postData,
            validations: [
              { type: 'status', expected: [200, 201, 204] },
              { type: 'responseTime', expected: '< 2s' },
              { type: 'contentType', expected: 'application/json' }
            ]
          }
        ],
        metadata: {
          apiURL: api.url,
          method: api.method
        }
      });
    });
  }

  /**
   * Gera cenários exploratórios (random)
   */
  generateRandomScenarios(discovery) {
    // Gera 20 cenários explorando combinações aleatórias
    for (let i = 0; i < 20; i++) {
      const randomPage = discovery.pages[Math.floor(Math.random() * discovery.pages.length)];
      
      this.scenarios.push({
        scenarioId: `SCN-${String(this.scenarioCounter++).padStart(6, '0')}`,
        type: 'exploratory',
        category: 'Exploratory Testing',
        name: `Exploração aleatória #${i + 1}`,
        description: `Navega e interage aleatoriamente com a página ${randomPage.title}`,
        priority: 'low',
        steps: [
          {
            action: 'navigate',
            url: randomPage.url
          },
          {
            action: 'random_clicks',
            count: 5,
            avoidDestructive: true
          },
          {
            action: 'random_inputs',
            count: 3
          }
        ],
        metadata: {
          exploratory: true,
          pageURL: randomPage.url
        }
      });
    }
  }

  /**
   * Gera suite de regressão
   */
  generateRegressionSuite(discovery) {
    // Suite de regressão = cenários críticos de cada tipo
    const criticalScenarios = this.scenarios.filter(s => s.priority === 'high');
    
    criticalScenarios.forEach(scenario => {
      this.scenarios.push({
        ...scenario,
        scenarioId: `SCN-${String(this.scenarioCounter++).padStart(6, '0')}`,
        type: 'regression',
        category: 'Regression Suite',
        name: `[REGRESSION] ${scenario.name}`,
        metadata: {
          ...scenario.metadata,
          regressionTest: true,
          originalScenario: scenario.scenarioId
        }
      });
    });
  }

  /**
   * Gera valor válido para um campo
   */
  generateValidValue(field) {
    const type = field.type?.toLowerCase();

    switch (type) {
      case 'text':
      case 'textarea':
        return field.name?.toLowerCase().includes('email') ? 'teste@axiontecnologia.com.br' :
               field.name?.toLowerCase().includes('nome') ? 'João Silva' :
               'Valor de teste válido';
      
      case 'email':
        return 'teste@axiontecnologia.com.br';
      
      case 'password':
        return 'Senha@123';
      
      case 'number':
        return '100';
      
      case 'date':
        return '2026-01-15';
      
      case 'tel':
      case 'phone':
        return '(62) 98765-4321';
      
      case 'url':
        return 'https://axiontecnologia.com.br';
      
      case 'checkbox':
        return true;
      
      case 'radio':
        return field.value || 'option1';
      
      case 'select':
        return field.options && field.options.length > 0 ? field.options[0].value : '';
      
      default:
        return 'Teste';
    }
  }

  /**
   * Gera boundary cases para um campo
   */
  generateBoundaryCases(field) {
    const type = field.type?.toLowerCase();
    const cases = [];

    if (type === 'text' || type === 'textarea') {
      cases.push(
        { value: '', description: 'String vazia', shouldFail: field.required },
        { value: 'A', description: 'String mínima (1 char)', shouldFail: false },
        { value: 'A'.repeat(255), description: 'String limite (255 chars)', shouldFail: false },
        { value: 'A'.repeat(256), description: 'String acima do limite (256 chars)', shouldFail: true }
      );
    }

    if (type === 'number') {
      cases.push(
        { value: '0', description: 'Valor zero', shouldFail: false },
        { value: '-1', description: 'Valor negativo', shouldFail: false },
        { value: '999999', description: 'Valor muito grande', shouldFail: false }
      );
    }

    return cases;
  }

  /**
   * Gera valores inválidos para um campo
   */
  generateInvalidValues(field) {
    const type = field.type?.toLowerCase();
    const cases = [];

    if (type === 'email') {
      cases.push(
        { value: 'invalido', description: 'Email sem @', expectedError: 'Email inválido' },
        { value: 'invalido@', description: 'Email sem domínio', expectedError: 'Email inválido' },
        { value: '@dominio.com', description: 'Email sem usuário', expectedError: 'Email inválido' }
      );
    }

    if (type === 'number') {
      cases.push(
        { value: 'abc', description: 'Texto em campo numérico', expectedError: 'Valor deve ser numérico' },
        { value: '1.2.3', description: 'Número mal formatado', expectedError: 'Número inválido' }
      );
    }

    if (type === 'date') {
      cases.push(
        { value: '32/13/2026', description: 'Data inválida', expectedError: 'Data inválida' },
        { value: 'abc', description: 'Texto em campo de data', expectedError: 'Data inválida' }
      );
    }

    if (type === 'url') {
      cases.push(
        { value: 'invalido', description: 'URL sem protocolo', expectedError: 'URL inválida' },
        { value: 'http://', description: 'URL incompleta', expectedError: 'URL inválida' }
      );
    }

    return cases;
  }

  /**
   * Obtém estatísticas dos cenários gerados
   */
  getStats() {
    return {
      total: this.scenarios.length,
      byType: {
        navigation: this.scenarios.filter(s => s.type === 'navigation').length,
        form: this.scenarios.filter(s => s.type === 'form').length,
        table: this.scenarios.filter(s => s.type === 'table').length,
        api: this.scenarios.filter(s => s.type === 'api').length,
        exploratory: this.scenarios.filter(s => s.type === 'exploratory').length,
        regression: this.scenarios.filter(s => s.type === 'regression').length
      },
      byPriority: {
        high: this.scenarios.filter(s => s.priority === 'high').length,
        medium: this.scenarios.filter(s => s.priority === 'medium').length,
        low: this.scenarios.filter(s => s.priority === 'low').length
      },
      byCategory: this.scenarios.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
      }, {})
    };
  }

  /**
   * Salva cenários em arquivo
   */
  async saveScenarios(baseURL) {
    const scenariosDir = path.join(process.cwd(), 'engine', 'generated-scenarios');
    await fs.promises.mkdir(scenariosDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = baseURL.replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `scenarios-${safeName}-${timestamp}.json`;
    const filepath = path.join(scenariosDir, filename);

    await fs.promises.writeFile(
      filepath,
      JSON.stringify({ scenarios: this.scenarios, stats: this.getStats() }, null, 2),
      'utf-8'
    );

    console.log(`\n💾 Cenários salvos em: ${filepath}`);

    // Salva também resumo textual
    const summaryPath = filepath.replace('.json', '-summary.txt');
    const summary = this.generateTextSummary();
    await fs.promises.writeFile(summaryPath, summary, 'utf-8');

    console.log(`📄 Resumo salvo em: ${summaryPath}`);
  }

  /**
   * Gera resumo textual dos cenários
   */
  generateTextSummary() {
    const stats = this.getStats();
    let summary = '🎯 SCENARIO GENERATION ENGINE - Cenários Gerados\n';
    summary += '='.repeat(60) + '\n\n';

    summary += `📊 TOTAL: ${stats.total} cenários\n\n`;

    summary += '📋 POR TIPO:\n';
    Object.entries(stats.byType).forEach(([type, count]) => {
      summary += `   ${type}: ${count}\n`;
    });
    summary += '\n';

    summary += '🎯 POR PRIORIDADE:\n';
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      summary += `   ${priority}: ${count}\n`;
    });
    summary += '\n';

    summary += '📁 POR CATEGORIA:\n';
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      summary += `   ${category}: ${count}\n`;
    });
    summary += '\n';

    summary += '📝 CENÁRIOS (primeiros 30):\n';
    this.scenarios.slice(0, 30).forEach((scenario, idx) => {
      summary += `\n${idx + 1}. [${scenario.scenarioId}] ${scenario.name}\n`;
      summary += `   Tipo: ${scenario.type} | Prioridade: ${scenario.priority}\n`;
      summary += `   Passos: ${scenario.steps.length}\n`;
    });

    if (this.scenarios.length > 30) {
      summary += `\n... e mais ${this.scenarios.length - 30} cenários\n`;
    }

    return summary;
  }
}

export default ScenarioGenerationEngine;
