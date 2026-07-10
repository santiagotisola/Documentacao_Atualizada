/**
 * DATA RECONCILIATION ENGINE - COMPLETO
 * Motor de Reconciliação de Dados entre Sistemas
 * 
 * Valida consistência de dados entre:
 * - Frontend (UI) ↔ Backend (API)
 * - Backend (API) ↔ Banco de Dados
 * - Sistema A ↔ Sistema B
 * - MongoDB ↔ SQL Server
 * - Dados exibidos ↔ Dados armazenados
 * 
 * Casos de uso:
 * - Validar que multa no AxHub tem mesmo valor no banco
 * - Validar que pesagem no AxTon está correta no SQL Server
 * - Validar que cruzamento no AxCross está sincronizado
 */

import puppeteer from 'puppeteer';
import sql from 'mssql';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

class DataReconciliationEngine {
  constructor() {
    this.browser = null;
    this.page = null;
    this.mongoClient = null;
    this.sqlPool = null;
    this.reconciliationResults = [];
  }

  /**
   * Conecta ao MongoDB
   */
  async connectMongo(connectionString) {
    if (!this.mongoClient) {
      this.mongoClient = new MongoClient(connectionString);
      await this.mongoClient.connect();
      console.log('✅ Conectado ao MongoDB');
    }
    return this.mongoClient;
  }

  /**
   * Conecta ao SQL Server
   */
  async connectSQL(config) {
    if (!this.sqlPool) {
      this.sqlPool = await sql.connect(config);
      console.log('✅ Conectado ao SQL Server');
    }
    return this.sqlPool;
  }

  /**
   * Reconcilia dados: UI ↔ API ↔ Database
   */
  async reconcile(scenario) {
    const {
      name,
      type, // 'ui-to-api', 'api-to-db', 'ui-to-db', 'cross-system'
      url,
      uiSelector,
      apiEndpoint,
      dbConfig,
      dbQuery,
      mongoConfig,
      mongoCollection,
      mongoQuery,
      expectedMatch = true,
      tolerance = 0.01 // Tolerância para comparações numéricas
    } = scenario;

    console.log(`\n🔄 Reconciliando: ${name}`);
    console.log(`   Tipo: ${type}`);

    const startTime = Date.now();
    let passed = true;
    const discrepancies = [];

    try {
      let uiData = null;
      let apiData = null;
      let dbData = null;

      // 1. Captura dados da UI (se aplicável)
      if (url && uiSelector) {
        console.log('   📱 Capturando dados da UI...');
        uiData = await this.captureUIData(url, uiSelector);
        console.log(`      ✓ ${Object.keys(uiData).length} campos capturados`);
      }

      // 2. Captura dados da API (se aplicável)
      if (apiEndpoint) {
        console.log('   🔌 Capturando dados da API...');
        apiData = await this.captureAPIData(apiEndpoint);
        console.log(`      ✓ Dados da API capturados`);
      }

      // 3. Captura dados do banco SQL Server (se aplicável)
      if (dbConfig && dbQuery) {
        console.log('   🗄️  Capturando dados do SQL Server...');
        await this.connectSQL(dbConfig);
        dbData = await this.captureSQLData(dbQuery);
        console.log(`      ✓ ${dbData.length} registros capturados`);
      }

      // 4. Captura dados do MongoDB (se aplicável)
      if (mongoConfig && mongoCollection && mongoQuery) {
        console.log('   🍃 Capturando dados do MongoDB...');
        await this.connectMongo(mongoConfig);
        dbData = await this.captureMongoData(mongoCollection, mongoQuery);
        console.log(`      ✓ ${dbData.length} documentos capturados`);
      }

      // 5. Compara os dados conforme o tipo
      console.log('   🔍 Comparando dados...');

      if (type === 'ui-to-api') {
        discrepancies.push(...this.compareData(uiData, apiData, 'UI', 'API', tolerance));
      } else if (type === 'api-to-db') {
        discrepancies.push(...this.compareData(apiData, dbData[0] || {}, 'API', 'Database', tolerance));
      } else if (type === 'ui-to-db') {
        discrepancies.push(...this.compareData(uiData, dbData[0] || {}, 'UI', 'Database', tolerance));
      } else if (type === 'cross-system') {
        // Comparação entre dois sistemas/bancos diferentes
        discrepancies.push(...this.compareSystems(uiData, apiData, dbData, tolerance));
      }

      passed = expectedMatch ? discrepancies.length === 0 : discrepancies.length > 0;

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      const result = {
        name,
        type,
        passed,
        duration,
        discrepancies,
        timestamp: new Date().toISOString(),
        details: {
          uiData: uiData ? Object.keys(uiData).length + ' campos' : null,
          apiData: apiData ? 'Capturado' : null,
          dbData: dbData ? dbData.length + ' registros' : null
        }
      };

      this.reconciliationResults.push(result);

      if (passed) {
        console.log(`   ✅ Reconciliação passou - Dados consistentes (${duration}s)`);
      } else {
        console.log(`   ❌ Reconciliação falhou - ${discrepancies.length} discrepâncias encontradas (${duration}s)`);
        discrepancies.forEach((disc, idx) => {
          console.log(`      ${idx + 1}. ${disc.field}: ${disc.source1Value} (${disc.source1}) ≠ ${disc.source2Value} (${disc.source2})`);
        });
      }

      return result;

    } catch (error) {
      console.error(`   ❌ Erro na reconciliação: ${error.message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Captura dados da UI
   */
  async captureUIData(url, selector) {
    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 }
    });

    this.page = await this.browser.newPage();

    await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await this.page.waitForSelector(selector, { timeout: 10000 });
    await this.page.waitForTimeout(1000);

    // Extrai dados dos elementos
    const data = await this.page.evaluate((sel) => {
      const container = document.querySelector(sel);
      if (!container) return {};

      const extracted = {};

      // Extrai de campos de formulário
      container.querySelectorAll('input, textarea, select').forEach(field => {
        const name = field.name || field.id;
        if (name) {
          extracted[name] = field.value;
        }
      });

      // Extrai de labels e textos
      container.querySelectorAll('[data-field], [data-value]').forEach(el => {
        const fieldName = el.getAttribute('data-field');
        const value = el.getAttribute('data-value') || el.innerText?.trim();
        if (fieldName) {
          extracted[fieldName] = value;
        }
      });

      // Extrai de tabelas
      const rows = container.querySelectorAll('table tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td, th');
        if (cells.length === 2) {
          const key = cells[0].innerText?.trim();
          const value = cells[1].innerText?.trim();
          if (key) {
            extracted[key] = value;
          }
        }
      });

      return extracted;
    }, selector);

    return data;
  }

  /**
   * Captura dados da API
   */
  async captureAPIData(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API retornou ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Captura dados do SQL Server
   */
  async captureSQLData(query) {
    const result = await this.sqlPool.request().query(query);
    return result.recordset;
  }

  /**
   * Captura dados do MongoDB
   */
  async captureMongoData(collectionName, query) {
    const db = this.mongoClient.db();
    const collection = db.collection(collectionName);
    return await collection.find(query).toArray();
  }

  /**
   * Compara dois objetos de dados
   */
  compareData(data1, data2, source1Name, source2Name, tolerance) {
    const discrepancies = [];

    if (!data1 || !data2) {
      discrepancies.push({
        field: 'data_availability',
        source1: source1Name,
        source2: source2Name,
        source1Value: data1 ? 'Disponível' : 'Indisponível',
        source2Value: data2 ? 'Disponível' : 'Indisponível'
      });
      return discrepancies;
    }

    // Campos comuns
    const allKeys = new Set([...Object.keys(data1), ...Object.keys(data2)]);

    allKeys.forEach(key => {
      const val1 = data1[key];
      const val2 = data2[key];

      // Ignora campos nulos/undefined em ambos
      if ((val1 === null || val1 === undefined) && (val2 === null || val2 === undefined)) {
        return;
      }

      // Compara valores
      if (!this.valuesMatch(val1, val2, tolerance)) {
        discrepancies.push({
          field: key,
          source1: source1Name,
          source2: source2Name,
          source1Value: val1,
          source2Value: val2,
          type: typeof val1 !== typeof val2 ? 'type_mismatch' : 'value_mismatch'
        });
      }
    });

    return discrepancies;
  }

  /**
   * Compara sistemas (mais complexo)
   */
  compareSystems(uiData, apiData, dbData, tolerance) {
    const discrepancies = [];

    // Compara UI ↔ API
    if (uiData && apiData) {
      discrepancies.push(...this.compareData(uiData, apiData, 'UI', 'API', tolerance));
    }

    // Compara API ↔ DB
    if (apiData && dbData && dbData.length > 0) {
      discrepancies.push(...this.compareData(apiData, dbData[0], 'API', 'Database', tolerance));
    }

    // Compara UI ↔ DB
    if (uiData && dbData && dbData.length > 0) {
      discrepancies.push(...this.compareData(uiData, dbData[0], 'UI', 'Database', tolerance));
    }

    return discrepancies;
  }

  /**
   * Verifica se dois valores são iguais (com tolerância)
   */
  valuesMatch(val1, val2, tolerance) {
    // Ambos nulos/undefined
    if ((val1 === null || val1 === undefined) && (val2 === null || val2 === undefined)) {
      return true;
    }

    // Um é nulo e outro não
    if ((val1 === null || val1 === undefined) || (val2 === null || val2 === undefined)) {
      return false;
    }

    // Tipos diferentes (exceto number vs string de número)
    const type1 = typeof val1;
    const type2 = typeof val2;

    // Converte strings numéricas
    let v1 = val1;
    let v2 = val2;

    if (type1 === 'string' && !isNaN(val1)) {
      v1 = parseFloat(val1);
    }
    if (type2 === 'string' && !isNaN(val2)) {
      v2 = parseFloat(val2);
    }

    // Comparação numérica com tolerância
    if (typeof v1 === 'number' && typeof v2 === 'number') {
      return Math.abs(v1 - v2) <= tolerance;
    }

    // Comparação de strings (case-insensitive e trim)
    if (typeof v1 === 'string' && typeof v2 === 'string') {
      return v1.trim().toLowerCase() === v2.trim().toLowerCase();
    }

    // Comparação de datas
    if (v1 instanceof Date && v2 instanceof Date) {
      return v1.getTime() === v2.getTime();
    }

    // Comparação padrão
    return v1 === v2;
  }

  /**
   * Reconciliação batch (múltiplos cenários)
   */
  async reconcileBatch(scenarios) {
    console.log(`\n🔄 Iniciando reconciliação em lote (${scenarios.length} cenários)...\n`);

    const results = [];

    for (const [idx, scenario] of scenarios.entries()) {
      console.log(`[${idx + 1}/${scenarios.length}]`);
      try {
        const result = await this.reconcile(scenario);
        results.push(result);
      } catch (error) {
        console.error(`   ❌ Erro no cenário "${scenario.name}": ${error.message}`);
        results.push({
          name: scenario.name,
          passed: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    console.log(`\n📊 RESUMO DA RECONCILIAÇÃO:`);
    console.log(`   Total: ${results.length}`);
    console.log(`   ✅ Passou: ${passed}`);
    console.log(`   ❌ Falhou: ${failed}`);

    return results;
  }

  /**
   * Valida integridade referencial entre tabelas
   */
  async validateReferentialIntegrity(config) {
    const {
      name,
      primaryTable,
      primaryKey,
      foreignTable,
      foreignKey,
      dbConfig
    } = config;

    console.log(`\n🔗 Validando integridade referencial: ${name}`);

    await this.connectSQL(dbConfig);

    // Busca registros órfãos (foreign key sem correspondente)
    const query = `
      SELECT ${foreignTable}.${foreignKey}
      FROM ${foreignTable}
      LEFT JOIN ${primaryTable} ON ${foreignTable}.${foreignKey} = ${primaryTable}.${primaryKey}
      WHERE ${primaryTable}.${primaryKey} IS NULL
    `;

    const orphans = await this.captureSQLData(query);

    const passed = orphans.length === 0;

    console.log(`   ${passed ? '✅' : '❌'} ${passed ? 'Sem registros órfãos' : `${orphans.length} registros órfãos encontrados`}`);

    if (!passed) {
      orphans.slice(0, 10).forEach(orphan => {
        console.log(`      - ${foreignKey}: ${orphan[foreignKey]}`);
      });
      if (orphans.length > 10) {
        console.log(`      ... e mais ${orphans.length - 10} registros`);
      }
    }

    return {
      name,
      passed,
      orphanCount: orphans.length,
      orphans: orphans.slice(0, 100) // Limita para não sobrecarregar
    };
  }

  /**
   * Cleanup
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Disconnect
   */
  async disconnect() {
    if (this.mongoClient) {
      await this.mongoClient.close();
      this.mongoClient = null;
    }

    if (this.sqlPool) {
      await this.sqlPool.close();
      this.sqlPool = null;
    }
  }

  /**
   * Salva resultados
   */
  async saveResults() {
    const resultsDir = path.join(process.cwd(), 'engine', 'reconciliation-results');
    await fs.promises.mkdir(resultsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `reconciliation-results-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);

    await fs.promises.writeFile(
      filepath,
      JSON.stringify(this.reconciliationResults, null, 2),
      'utf-8'
    );

    console.log(`\n💾 Resultados salvos em: ${filepath}`);

    // Gera relatório textual
    const summaryPath = filepath.replace('.json', '-summary.txt');
    const summary = this.generateTextSummary();
    await fs.promises.writeFile(summaryPath, summary, 'utf-8');

    console.log(`📄 Resumo salvo em: ${summaryPath}`);
  }

  /**
   * Gera resumo textual
   */
  generateTextSummary() {
    let summary = '🔄 DATA RECONCILIATION ENGINE - Resumo\n';
    summary += '='.repeat(60) + '\n\n';

    const total = this.reconciliationResults.length;
    const passed = this.reconciliationResults.filter(r => r.passed).length;
    const failed = total - passed;

    summary += `📊 ESTATÍSTICAS:\n`;
    summary += `   Total de reconciliações: ${total}\n`;
    summary += `   ✅ Passou: ${passed} (${((passed / total) * 100).toFixed(1)}%)\n`;
    summary += `   ❌ Falhou: ${failed} (${((failed / total) * 100).toFixed(1)}%)\n\n`;

    summary += `📋 RESULTADOS:\n\n`;

    this.reconciliationResults.forEach((result, idx) => {
      summary += `${idx + 1}. ${result.passed ? '✅' : '❌'} ${result.name}\n`;
      summary += `   Tipo: ${result.type}\n`;
      summary += `   Duração: ${result.duration}s\n`;

      if (result.discrepancies && result.discrepancies.length > 0) {
        summary += `   Discrepâncias: ${result.discrepancies.length}\n`;
        result.discrepancies.slice(0, 5).forEach(disc => {
          summary += `      - ${disc.field}: ${disc.source1Value} ≠ ${disc.source2Value}\n`;
        });
        if (result.discrepancies.length > 5) {
          summary += `      ... e mais ${result.discrepancies.length - 5}\n`;
        }
      }

      summary += `\n`;
    });

    return summary;
  }
}

export default DataReconciliationEngine;
