/**
 * VISUAL VALIDATION ENGINE - COMPLETO
 * Motor de Validação Visual Automática
 * 
 * Funcionalidades:
 * - Captura screenshots de páginas/componentes
 * - Compara screenshots (baseline vs atual)
 * - Detecta diferenças visuais (pixel-diff)
 * - Valida layout responsivo
 * - Detecta elementos quebrados/sobrepostos
 * - Valida cores, fontes, espaçamento
 * - Gera relatórios visuais com diff destacado
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

class VisualValidationEngine {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baselineDir = path.join(process.cwd(), 'engine', 'visual-baselines');
    this.resultsDir = path.join(process.cwd(), 'engine', 'visual-results');
    this.validationResults = [];
  }

  /**
   * Inicializa diretórios
   */
  async initialize() {
    await fs.promises.mkdir(this.baselineDir, { recursive: true });
    await fs.promises.mkdir(this.resultsDir, { recursive: true });
  }

  /**
   * Cria baseline (imagem de referência)
   */
  async createBaseline(url, options = {}) {
    const {
      name = 'page',
      selector = null,
      viewport = { width: 1920, height: 1080 },
      fullPage = true,
      waitForSelector = null
    } = options;

    console.log(`\n📸 Criando baseline: ${name}`);

    await this.initialize();

    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: viewport
    });

    this.page = await this.browser.newPage();

    try {
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      if (waitForSelector) {
        await this.page.waitForSelector(waitForSelector, { timeout: 10000 });
      }

      await this.page.waitForTimeout(1000);

      const screenshotPath = path.join(this.baselineDir, `${name}.png`);

      if (selector) {
        const element = await this.page.$(selector);
        if (!element) {
          throw new Error(`Seletor não encontrado: ${selector}`);
        }
        await element.screenshot({ path: screenshotPath });
      } else {
        await this.page.screenshot({ 
          path: screenshotPath, 
          fullPage 
        });
      }

      console.log(`✅ Baseline criada: ${screenshotPath}`);

      return screenshotPath;

    } catch (error) {
      console.error(`❌ Erro ao criar baseline: ${error.message}`);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * Valida visualmente comparando com baseline
   */
  async validate(url, baselineName, options = {}) {
    const {
      threshold = 0.1, // 10% de diferença tolerada
      selector = null,
      viewport = { width: 1920, height: 1080 },
      fullPage = true,
      waitForSelector = null,
      saveDiff = true
    } = options;

    console.log(`\n🔍 Validando visualmente: ${baselineName}`);

    await this.initialize();

    const baselinePath = path.join(this.baselineDir, `${baselineName}.png`);

    if (!fs.existsSync(baselinePath)) {
      throw new Error(`Baseline não encontrada: ${baselinePath}`);
    }

    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: viewport
    });

    this.page = await this.browser.newPage();

    const startTime = Date.now();

    try {
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      if (waitForSelector) {
        await this.page.waitForSelector(waitForSelector, { timeout: 10000 });
      }

      await this.page.waitForTimeout(1000);

      // Captura screenshot atual
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const currentPath = path.join(this.resultsDir, `${baselineName}-current-${timestamp}.png`);

      if (selector) {
        const element = await this.page.$(selector);
        if (!element) {
          throw new Error(`Seletor não encontrado: ${selector}`);
        }
        await element.screenshot({ path: currentPath });
      } else {
        await this.page.screenshot({ 
          path: currentPath, 
          fullPage 
        });
      }

      // Compara imagens
      const comparison = await this.compareImages(baselinePath, currentPath);

      const diffPercentage = (comparison.diffPixels / comparison.totalPixels) * 100;
      const passed = diffPercentage <= threshold;

      // Salva imagem de diferença se houver
      if (saveDiff && !passed) {
        const diffPath = path.join(this.resultsDir, `${baselineName}-diff-${timestamp}.png`);
        await fs.promises.writeFile(diffPath, PNG.sync.write(comparison.diffImage));
        console.log(`   📊 Diff salvo: ${diffPath}`);
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      const result = {
        baselineName,
        url,
        passed,
        diffPercentage: diffPercentage.toFixed(2),
        threshold,
        diffPixels: comparison.diffPixels,
        totalPixels: comparison.totalPixels,
        baselinePath,
        currentPath,
        duration,
        timestamp: new Date().toISOString()
      };

      this.validationResults.push(result);

      if (passed) {
        console.log(`   ✅ Validação visual passou (${diffPercentage.toFixed(2)}% diff) em ${duration}s`);
      } else {
        console.log(`   ❌ Validação visual falhou (${diffPercentage.toFixed(2)}% diff > ${threshold}% threshold) em ${duration}s`);
      }

      return result;

    } catch (error) {
      console.error(`   ❌ Erro na validação visual: ${error.message}`);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * Compara duas imagens
   */
  async compareImages(baselinePath, currentPath) {
    const baselineData = PNG.sync.read(fs.readFileSync(baselinePath));
    const currentData = PNG.sync.read(fs.readFileSync(currentPath));

    const { width, height } = baselineData;

    // Redimensiona imagem atual se necessário
    if (currentData.width !== width || currentData.height !== height) {
      console.log(`   ⚠️ Dimensões diferentes: baseline ${width}x${height} vs atual ${currentData.width}x${currentData.height}`);
      // Para simplificar, vamos apenas alertar. Em produção, poderia redimensionar.
    }

    const diff = new PNG({ width, height });

    const diffPixels = pixelmatch(
      baselineData.data,
      currentData.data,
      diff.data,
      width,
      height,
      {
        threshold: 0.1,
        alpha: 0.1,
        diffColor: [255, 0, 0], // Vermelho para diferenças
        diffColorAlt: [0, 255, 0] // Verde para semelhantes
      }
    );

    return {
      diffPixels,
      totalPixels: width * height,
      diffImage: diff
    };
  }

  /**
   * Valida layout responsivo (múltiplos viewports)
   */
  async validateResponsive(url, baselineName, viewports = []) {
    const defaultViewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    const vps = viewports.length > 0 ? viewports : defaultViewports;

    console.log(`\n📱 Validando layout responsivo: ${baselineName}`);

    const results = [];

    for (const vp of vps) {
      console.log(`   Testando viewport: ${vp.name} (${vp.width}x${vp.height})`);

      try {
        const result = await this.validate(url, `${baselineName}-${vp.name}`, {
          viewport: { width: vp.width, height: vp.height },
          fullPage: false
        });

        results.push({
          viewport: vp.name,
          ...result
        });

      } catch (error) {
        console.error(`      ❌ Erro no viewport ${vp.name}: ${error.message}`);
        results.push({
          viewport: vp.name,
          passed: false,
          error: error.message
        });
      }
    }

    const allPassed = results.every(r => r.passed);

    console.log(`\n${allPassed ? '✅' : '❌'} Validação responsiva: ${allPassed ? 'PASSOU' : 'FALHOU'}`);
    results.forEach(r => {
      console.log(`   ${r.passed ? '✅' : '❌'} ${r.viewport}: ${r.diffPercentage || 'N/A'}% diff`);
    });

    return results;
  }

  /**
   * Detecta elementos quebrados/sobrepostos
   */
  async detectBrokenLayout(url) {
    console.log(`\n🔎 Detectando elementos quebrados em: ${url}`);

    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 }
    });

    this.page = await this.browser.newPage();

    try {
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await this.page.waitForTimeout(1000);

      const issues = await this.page.evaluate(() => {
        const problems = [];

        // Detecta elementos fora da tela
        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          
          // Elemento muito largo (overflow horizontal)
          if (rect.width > window.innerWidth + 100) {
            problems.push({
              type: 'overflow_horizontal',
              element: el.tagName,
              id: el.id,
              className: el.className,
              width: rect.width,
              viewportWidth: window.innerWidth
            });
          }

          // Elemento com height negativo ou zero em elementos visíveis
          if (rect.height <= 0 && window.getComputedStyle(el).display !== 'none') {
            problems.push({
              type: 'zero_height',
              element: el.tagName,
              id: el.id,
              className: el.className
            });
          }

          // Elemento posicionado fora da viewport
          if (rect.left < -100 || rect.top < -100) {
            problems.push({
              type: 'off_screen',
              element: el.tagName,
              id: el.id,
              className: el.className,
              position: { left: rect.left, top: rect.top }
            });
          }
        });

        // Detecta imagens quebradas
        document.querySelectorAll('img').forEach(img => {
          if (!img.complete || img.naturalWidth === 0) {
            problems.push({
              type: 'broken_image',
              src: img.src,
              alt: img.alt
            });
          }
        });

        // Detecta textos sobrepostos
        const textNodes = [];
        document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div').forEach(el => {
          if (el.innerText && el.innerText.trim().length > 0) {
            textNodes.push({
              element: el,
              rect: el.getBoundingClientRect()
            });
          }
        });

        // Verifica sobreposição
        for (let i = 0; i < textNodes.length; i++) {
          for (let j = i + 1; j < textNodes.length; j++) {
            const a = textNodes[i].rect;
            const b = textNodes[j].rect;

            const overlap = !(
              a.right < b.left ||
              a.left > b.right ||
              a.bottom < b.top ||
              a.top > b.bottom
            );

            if (overlap) {
              problems.push({
                type: 'overlapping_text',
                element1: textNodes[i].element.tagName,
                element2: textNodes[j].element.tagName
              });
            }
          }
        }

        return problems;
      });

      console.log(`\n📊 Problemas encontrados: ${issues.length}`);

      const grouped = issues.reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      }, {});

      Object.entries(grouped).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

      return {
        passed: issues.length === 0,
        issues,
        summary: grouped
      };

    } catch (error) {
      console.error(`❌ Erro ao detectar problemas: ${error.message}`);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * Valida cores e fontes
   */
  async validateStyling(url) {
    console.log(`\n🎨 Validando estilos: ${url}`);

    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 }
    });

    this.page = await this.browser.newPage();

    try {
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

      const styleAnalysis = await this.page.evaluate(() => {
        const fonts = new Set();
        const colors = new Set();
        const fontSizes = new Set();

        document.querySelectorAll('*').forEach(el => {
          const styles = window.getComputedStyle(el);
          
          if (styles.fontFamily) fonts.add(styles.fontFamily);
          if (styles.color) colors.add(styles.color);
          if (styles.fontSize) fontSizes.add(styles.fontSize);
        });

        return {
          fonts: Array.from(fonts),
          colors: Array.from(colors),
          fontSizes: Array.from(fontSizes),
          totalFonts: fonts.size,
          totalColors: colors.size,
          totalFontSizes: fontSizes.size
        };
      });

      console.log(`   Fontes únicas: ${styleAnalysis.totalFonts}`);
      console.log(`   Cores únicas: ${styleAnalysis.totalColors}`);
      console.log(`   Tamanhos de fonte: ${styleAnalysis.totalFontSizes}`);

      // Alertas de consistência
      if (styleAnalysis.totalFonts > 5) {
        console.log(`   ⚠️ Muitas fontes diferentes (${styleAnalysis.totalFonts}) - considere padronizar`);
      }

      if (styleAnalysis.totalColors > 20) {
        console.log(`   ⚠️ Muitas cores diferentes (${styleAnalysis.totalColors}) - considere paleta limitada`);
      }

      return styleAnalysis;

    } catch (error) {
      console.error(`❌ Erro ao validar estilos: ${error.message}`);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * Salva resultados das validações
   */
  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `visual-validation-results-${timestamp}.json`;
    const filepath = path.join(this.resultsDir, filename);

    await fs.promises.writeFile(
      filepath,
      JSON.stringify(this.validationResults, null, 2),
      'utf-8'
    );

    console.log(`\n💾 Resultados salvos em: ${filepath}`);

    // Gera relatório HTML
    await this.generateHTMLReport(timestamp);
  }

  /**
   * Gera relatório HTML visual
   */
  async generateHTMLReport(timestamp) {
    const htmlPath = path.join(this.resultsDir, `visual-report-${timestamp}.html`);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Visual Validation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    h1 { color: #333; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .test { background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
    .passed { border-left: 5px solid #4caf50; }
    .failed { border-left: 5px solid #f44336; }
    .images { display: flex; gap: 10px; margin-top: 10px; }
    .images img { max-width: 300px; border: 1px solid #ddd; }
    .stats { display: flex; gap: 20px; }
    .stat { text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; }
    .stat-label { color: #666; }
  </style>
</head>
<body>
  <h1>🔍 Visual Validation Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${this.validationResults.length}</div>
        <div class="stat-label">Total Tests</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #4caf50">${this.validationResults.filter(r => r.passed).length}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: #f44336">${this.validationResults.filter(r => !r.passed).length}</div>
        <div class="stat-label">Failed</div>
      </div>
    </div>
  </div>

  <h2>Test Results</h2>
  ${this.validationResults.map(result => `
    <div class="test ${result.passed ? 'passed' : 'failed'}">
      <h3>${result.passed ? '✅' : '❌'} ${result.baselineName}</h3>
      <p><strong>URL:</strong> ${result.url}</p>
      <p><strong>Diff:</strong> ${result.diffPercentage}% (threshold: ${result.threshold}%)</p>
      <p><strong>Duration:</strong> ${result.duration}s</p>
      <p><strong>Timestamp:</strong> ${result.timestamp}</p>
      <div class="images">
        <div>
          <p><strong>Baseline</strong></p>
          <img src="${path.relative(this.resultsDir, result.baselinePath)}" alt="Baseline">
        </div>
        <div>
          <p><strong>Current</strong></p>
          <img src="${path.basename(result.currentPath)}" alt="Current">
        </div>
      </div>
    </div>
  `).join('')}

  <footer style="margin-top: 40px; text-align: center; color: #666;">
    <p>Generated by AxionIA Visual Validation Engine</p>
    <p>${new Date().toLocaleString('pt-BR')}</p>
  </footer>
</body>
</html>
    `;

    await fs.promises.writeFile(htmlPath, html, 'utf-8');
    console.log(`📄 Relatório HTML: ${htmlPath}`);
  }
}

export default VisualValidationEngine;
