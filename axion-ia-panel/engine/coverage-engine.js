/**
 * COVERAGE ENGINE
 * Motor de Análise de Cobertura de Testes
 * 
 * Analisa:
 * - Cobertura de páginas (quais páginas foram testadas)
 * - Cobertura de funcionalidades
 * - Cobertura de formulários
 * - Cobertura de fluxos de usuário
 * - Cobertura de APIs
 * - Gaps de teste (o que NÃO foi testado)
 */

import fs from 'fs';
import path from 'path';

class CoverageEngine {
  constructor() {
    this.coverage = {
      pages: new Map(),
      forms: new Map(),
      apis: new Map(),
      flows: new Map(),
      scenarios: []
    };
  }

  /**
   * Analisa cobertura baseado em descoberta e execuções
   */
  analyze(discovery, executionResults) {
    console.log('\n📊 Analisando cobertura de testes...\n');

    // Páginas
    const totalPages = discovery.pages.length;
    const testedPages = new Set();

    executionResults.forEach(result => {
      if (result.metadata?.pageURL) {
        testedPages.add(result.metadata.pageURL);
      }
    });

    const pageCoverage = (testedPages.size / totalPages) * 100;

    console.log(`📄 PÁGINAS:`);
    console.log(`   Total descobertas: ${totalPages}`);
    console.log(`   Testadas: ${testedPages.size}`);
    console.log(`   Cobertura: ${pageCoverage.toFixed(1)}%`);
    console.log(`   Não testadas: ${totalPages - testedPages.size}`);

    // Formulários
    const totalForms = discovery.forms.length;
    const testedForms = new Set();

    executionResults.forEach(result => {
      if (result.metadata?.formId) {
        testedForms.add(result.metadata.formId);
      }
    });

    const formCoverage = totalForms > 0 ? (testedForms.size / totalForms) * 100 : 0;

    console.log(`\n📝 FORMULÁRIOS:`);
    console.log(`   Total descobertos: ${totalForms}`);
    console.log(`   Testados: ${testedForms.size}`);
    console.log(`   Cobertura: ${formCoverage.toFixed(1)}%`);
    console.log(`   Não testados: ${totalForms - testedForms.size}`);

    // APIs
    const uniqueAPIs = [...new Set(discovery.apis.map(a => a.url))];
    const totalAPIs = uniqueAPIs.length;
    const testedAPIs = new Set();

    executionResults.forEach(result => {
      if (result.metadata?.apiURL) {
        testedAPIs.add(result.metadata.apiURL);
      }
    });

    const apiCoverage = totalAPIs > 0 ? (testedAPIs.size / totalAPIs) * 100 : 0;

    console.log(`\n🔌 APIs:`);
    console.log(`   Total descobertas: ${totalAPIs}`);
    console.log(`   Testadas: ${testedAPIs.size}`);
    console.log(`   Cobertura: ${apiCoverage.toFixed(1)}%`);
    console.log(`   Não testadas: ${totalAPIs - testedAPIs.size}`);

    // Cenários por tipo
    const scenariosByType = executionResults.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    console.log(`\n🎯 CENÁRIOS EXECUTADOS:`);
    Object.entries(scenariosByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    // Gaps (o que NÃO foi testado)
    const gaps = this.identifyGaps(discovery, testedPages, testedForms, testedAPIs);

    console.log(`\n❌ GAPS IDENTIFICADOS: ${gaps.length}`);
    gaps.slice(0, 10).forEach((gap, idx) => {
      console.log(`   ${idx + 1}. ${gap.type}: ${gap.description}`);
    });

    if (gaps.length > 10) {
      console.log(`   ... e mais ${gaps.length - 10} gaps`);
    }

    // Score geral de cobertura
    const overallCoverage = (pageCoverage + formCoverage + apiCoverage) / 3;

    console.log(`\n📈 SCORE GERAL DE COBERTURA: ${overallCoverage.toFixed(1)}%`);

    const result = {
      timestamp: new Date().toISOString(),
      overallCoverage: overallCoverage.toFixed(1),
      pages: {
        total: totalPages,
        tested: testedPages.size,
        coverage: pageCoverage.toFixed(1),
        untested: totalPages - testedPages.size
      },
      forms: {
        total: totalForms,
        tested: testedForms.size,
        coverage: formCoverage.toFixed(1),
        untested: totalForms - testedForms.size
      },
      apis: {
        total: totalAPIs,
        tested: testedAPIs.size,
        coverage: apiCoverage.toFixed(1),
        untested: totalAPIs - testedAPIs.size
      },
      scenariosByType,
      gaps
    };

    return result;
  }

  /**
   * Identifica gaps de cobertura
   */
  identifyGaps(discovery, testedPages, testedForms, testedAPIs) {
    const gaps = [];

    // Páginas não testadas
    discovery.pages.forEach(page => {
      if (!testedPages.has(page.url)) {
        gaps.push({
          type: 'Página não testada',
          description: `${page.title || 'Sem título'} (${page.url})`,
          priority: 'medium',
          pageURL: page.url
        });
      }
    });

    // Formulários não testados
    discovery.forms.forEach(form => {
      const formId = form.id;
      if (!testedForms.has(formId)) {
        gaps.push({
          type: 'Formulário não testado',
          description: `${formId} na página ${form.pageURL}`,
          priority: 'high',
          formId: form.id,
          pageURL: form.pageURL
        });
      }
    });

    // APIs não testadas
    const uniqueAPIs = [...new Set(discovery.apis.map(a => a.url))];
    uniqueAPIs.forEach(api => {
      if (!testedAPIs.has(api)) {
        gaps.push({
          type: 'API não testada',
          description: api.substring(0, 80) + '...',
          priority: 'medium',
          apiURL: api
        });
      }
    });

    // Ordena por prioridade
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return gaps;
  }

  /**
   * Gera recomendações para aumentar cobertura
   */
  generateRecommendations(coverageAnalysis) {
    const recommendations = [];

    const { pages, forms, apis, overallCoverage } = coverageAnalysis;

    console.log(`\n💡 RECOMENDAÇÕES:\n`);

    // Cobertura geral baixa
    if (overallCoverage < 50) {
      const rec = {
        priority: 'critical',
        title: 'Cobertura geral muito baixa',
        description: `Apenas ${overallCoverage}% do sistema está coberto por testes`,
        action: 'Executar modo discover_only e full_validation para aumentar cobertura'
      };
      recommendations.push(rec);
      console.log(`   🔴 [CRÍTICO] ${rec.title}`);
      console.log(`      ${rec.description}`);
      console.log(`      Ação: ${rec.action}\n`);
    }

    // Formulários não testados
    if (forms.untested > 0) {
      const rec = {
        priority: 'high',
        title: `${forms.untested} formulários sem testes`,
        description: 'Formulários são pontos críticos e devem ser testados',
        action: 'Gerar cenários de teste para formulários não cobertos'
      };
      recommendations.push(rec);
      console.log(`   🟠 [ALTA] ${rec.title}`);
      console.log(`      ${rec.description}`);
      console.log(`      Ação: ${rec.action}\n`);
    }

    // Páginas não testadas
    if (pages.untested > 5) {
      const rec = {
        priority: 'medium',
        title: `${pages.untested} páginas sem testes de navegação`,
        description: 'Muitas páginas não foram acessadas durante os testes',
        action: 'Executar cenários de navegação para todas as páginas'
      };
      recommendations.push(rec);
      console.log(`   🟡 [MÉDIA] ${rec.title}`);
      console.log(`      ${rec.description}`);
      console.log(`      Ação: ${rec.action}\n`);
    }

    // APIs não testadas
    if (apis.untested > 10) {
      const rec = {
        priority: 'medium',
        title: `${apis.untested} APIs sem validação`,
        description: 'Endpoints de API não foram testados',
        action: 'Gerar cenários de teste de API automaticamente'
      };
      recommendations.push(rec);
      console.log(`   🟡 [MÉDIA] ${rec.title}`);
      console.log(`      ${rec.description}`);
      console.log(`      Ação: ${rec.action}\n`);
    }

    // Cobertura boa
    if (overallCoverage >= 80) {
      const rec = {
        priority: 'low',
        title: 'Cobertura excelente!',
        description: `${overallCoverage}% de cobertura alcançada`,
        action: 'Manter suite de regressão e adicionar testes exploratórios'
      };
      recommendations.push(rec);
      console.log(`   🟢 [INFO] ${rec.title}`);
      console.log(`      ${rec.description}`);
      console.log(`      Ação: ${rec.action}\n`);
    }

    return recommendations;
  }

  /**
   * Salva análise de cobertura
   */
  async saveAnalysis(analysis, recommendations) {
    const coverageDir = path.join(process.cwd(), 'engine', 'coverage-analysis');
    await fs.promises.mkdir(coverageDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `coverage-analysis-${timestamp}.json`;
    const filepath = path.join(coverageDir, filename);

    await fs.promises.writeFile(
      filepath,
      JSON.stringify({ analysis, recommendations }, null, 2),
      'utf-8'
    );

    console.log(`💾 Análise de cobertura salva em: ${filepath}`);

    // Gera relatório HTML
    await this.generateHTMLReport(analysis, recommendations, timestamp);
  }

  /**
   * Gera relatório HTML de cobertura
   */
  async generateHTMLReport(analysis, recommendations, timestamp) {
    const htmlPath = path.join(process.cwd(), 'engine', 'coverage-analysis', `coverage-report-${timestamp}.html`);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Coverage Analysis Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #333; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .metric { display: inline-block; margin: 10px; padding: 15px; background: #f9f9f9; border-radius: 5px; min-width: 150px; }
    .metric-value { font-size: 32px; font-weight: bold; }
    .metric-label { color: #666; font-size: 14px; }
    .coverage-bar { height: 30px; background: #e0e0e0; border-radius: 5px; overflow: hidden; margin: 10px 0; }
    .coverage-fill { height: 100%; background: linear-gradient(90deg, #4caf50, #8bc34a); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
    .recommendation { background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
    .critical { border-left: 5px solid #f44336; }
    .high { border-left: 5px solid #ff9800; }
    .medium { border-left: 5px solid #ffc107; }
    .low { border-left: 5px solid #4caf50; }
    .gaps { background: white; padding: 15px; border-radius: 8px; margin-top: 20px; }
    .gap { padding: 5px; border-bottom: 1px solid #eee; }
  </style>
</head>
<body>
  <h1>📊 Coverage Analysis Report</h1>
  
  <div class="summary">
    <h2>Overall Coverage: ${analysis.overallCoverage}%</h2>
    <div class="coverage-bar">
      <div class="coverage-fill" style="width: ${analysis.overallCoverage}%">${analysis.overallCoverage}%</div>
    </div>

    <div class="metric">
      <div class="metric-value">${analysis.pages.coverage}%</div>
      <div class="metric-label">Pages Coverage</div>
      <div>${analysis.pages.tested}/${analysis.pages.total}</div>
    </div>

    <div class="metric">
      <div class="metric-value">${analysis.forms.coverage}%</div>
      <div class="metric-label">Forms Coverage</div>
      <div>${analysis.forms.tested}/${analysis.forms.total}</div>
    </div>

    <div class="metric">
      <div class="metric-value">${analysis.apis.coverage}%</div>
      <div class="metric-label">APIs Coverage</div>
      <div>${analysis.apis.tested}/${analysis.apis.total}</div>
    </div>
  </div>

  <h2>💡 Recommendations</h2>
  ${recommendations.map(rec => `
    <div class="recommendation ${rec.priority}">
      <h3>${rec.title}</h3>
      <p>${rec.description}</p>
      <p><strong>Action:</strong> ${rec.action}</p>
    </div>
  `).join('')}

  <div class="gaps">
    <h2>❌ Gaps (${analysis.gaps.length})</h2>
    ${analysis.gaps.slice(0, 20).map(gap => `
      <div class="gap">
        <strong>${gap.type}:</strong> ${gap.description}
      </div>
    `).join('')}
    ${analysis.gaps.length > 20 ? `<p>... and ${analysis.gaps.length - 20} more gaps</p>` : ''}
  </div>

  <footer style="margin-top: 40px; text-align: center; color: #666;">
    <p>Generated by AxionIA Coverage Engine</p>
    <p>${new Date().toLocaleString('pt-BR')}</p>
  </footer>
</body>
</html>
    `;

    await fs.promises.writeFile(htmlPath, html, 'utf-8');
    console.log(`📄 Relatório HTML: ${htmlPath}`);
  }
}

export default CoverageEngine;
