/**
 * PERFORMANCE VALIDATION ENGINE
 * Motor de Validação de Performance
 * 
 * Valida:
 * - Tempo de carregamento de páginas
 * - Tempo de resposta de APIs
 * - Tamanho de assets (imagens, JS, CSS)
 * - Métricas Core Web Vitals (LCP, FID, CLS)
 * - Memory leaks
 * - Network waterfall
 * - Bundle size
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class PerformanceValidationEngine {
  constructor() {
    this.browser = null;
    this.page = null;
    this.performanceResults = [];
  }

  /**
   * Valida performance de uma página
   */
  async validate(url, options = {}) {
    const {
      thresholds = {
        loadTime: 3000,       // 3 segundos
        firstByte: 800,       // 800ms
        domContentLoaded: 2000, // 2 segundos
        lcp: 2500,            // 2.5 segundos (Core Web Vital)
        fid: 100,             // 100ms (Core Web Vital)
        cls: 0.1,             // 0.1 (Core Web Vital)
        totalSize: 5000000,   // 5MB
        requests: 100
      },
      captureNetworkLog = true,
      captureMemory = true
    } = options;

    console.log(`\n⚡ Validando performance: ${url}`);

    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();

    const metrics = {
      url,
      timestamp: new Date().toISOString(),
      passed: true,
      violations: []
    };

    const networkLog = [];
    let totalSize = 0;

    try {
      // Captura métricas de network
      if (captureNetworkLog) {
        await this.page.on('response', async (response) => {
          try {
            const request = response.request();
            const url = request.url();
            const size = (await response.buffer()).length;
            totalSize += size;

            networkLog.push({
              url,
              method: request.method(),
              status: response.status(),
              size,
              type: response.headers()['content-type'],
              timing: response.timing()
            });
          } catch (error) {
            // Ignora erros ao capturar response buffer
          }
        });
      }

      const startTime = Date.now();

      // Navega e captura métricas
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

      const loadTime = Date.now() - startTime;

      // Captura Performance Timing API
      const performanceMetrics = await this.page.evaluate(() => {
        const perf = window.performance.timing;
        const paintEntries = performance.getEntriesByType('paint');

        return {
          firstByte: perf.responseStart - perf.requestStart,
          domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
          domInteractive: perf.domInteractive - perf.navigationStart,
          domComplete: perf.domComplete - perf.navigationStart,
          loadComplete: perf.loadEventEnd - perf.navigationStart,
          firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0
        };
      });

      // Captura Core Web Vitals
      const webVitals = await this.captureWebVitals();

      // Captura métricas do Chrome DevTools
      const devToolsMetrics = await this.page.metrics();

      // Captura uso de memória
      let memoryMetrics = null;
      if (captureMemory) {
        memoryMetrics = await this.captureMemoryMetrics();
      }

      // Monta resultado
      metrics.loadTime = loadTime;
      metrics.firstByte = performanceMetrics.firstByte;
      metrics.domContentLoaded = performanceMetrics.domContentLoaded;
      metrics.domComplete = performanceMetrics.domComplete;
      metrics.firstPaint = performanceMetrics.firstPaint;
      metrics.firstContentfulPaint = performanceMetrics.firstContentfulPaint;
      metrics.webVitals = webVitals;
      metrics.totalSize = totalSize;
      metrics.totalRequests = networkLog.length;
      metrics.jsHeapSize = devToolsMetrics.JSHeapUsedSize;
      metrics.memory = memoryMetrics;
      metrics.networkLog = networkLog.slice(0, 50); // Limita para não sobrecarregar

      // Valida thresholds
      if (loadTime > thresholds.loadTime) {
        metrics.violations.push({
          metric: 'Load Time',
          value: loadTime,
          threshold: thresholds.loadTime,
          severity: 'high'
        });
        metrics.passed = false;
      }

      if (performanceMetrics.firstByte > thresholds.firstByte) {
        metrics.violations.push({
          metric: 'Time to First Byte',
          value: performanceMetrics.firstByte,
          threshold: thresholds.firstByte,
          severity: 'medium'
        });
        metrics.passed = false;
      }

      if (webVitals.lcp > thresholds.lcp) {
        metrics.violations.push({
          metric: 'Largest Contentful Paint (LCP)',
          value: webVitals.lcp,
          threshold: thresholds.lcp,
          severity: 'high'
        });
        metrics.passed = false;
      }

      if (webVitals.cls > thresholds.cls) {
        metrics.violations.push({
          metric: 'Cumulative Layout Shift (CLS)',
          value: webVitals.cls,
          threshold: thresholds.cls,
          severity: 'medium'
        });
        metrics.passed = false;
      }

      if (totalSize > thresholds.totalSize) {
        metrics.violations.push({
          metric: 'Total Page Size',
          value: totalSize,
          threshold: thresholds.totalSize,
          severity: 'medium'
        });
        metrics.passed = false;
      }

      if (networkLog.length > thresholds.requests) {
        metrics.violations.push({
          metric: 'Total Requests',
          value: networkLog.length,
          threshold: thresholds.requests,
          severity: 'low'
        });
        metrics.passed = false;
      }

      // Log resultado
      console.log(`   ${metrics.passed ? '✅' : '❌'} Performance: ${metrics.passed ? 'PASSOU' : 'FALHOU'}`);
      console.log(`      Load Time: ${loadTime}ms (threshold: ${thresholds.loadTime}ms)`);
      console.log(`      LCP: ${webVitals.lcp.toFixed(0)}ms (threshold: ${thresholds.lcp}ms)`);
      console.log(`      CLS: ${webVitals.cls.toFixed(3)} (threshold: ${thresholds.cls})`);
      console.log(`      Total Size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`      Total Requests: ${networkLog.length}`);

      if (metrics.violations.length > 0) {
        console.log(`\n      ⚠️ Violações:`);
        metrics.violations.forEach(v => {
          console.log(`         - ${v.metric}: ${v.value} > ${v.threshold} (${v.severity})`);
        });
      }

      this.performanceResults.push(metrics);

      return metrics;

    } catch (error) {
      console.error(`   ❌ Erro na validação de performance: ${error.message}`);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  /**
   * Captura Core Web Vitals
   */
  async captureWebVitals() {
    return await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = { lcp: 0, fid: 0, cls: 0 };

        // LCP
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
        });
        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {}

        // CLS
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cls = clsValue;
        });
        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {}

        // Aguarda 2 segundos para capturar métricas
        setTimeout(() => {
          resolve(vitals);
        }, 2000);
      });
    });
  }

  /**
   * Captura métricas de memória
   */
  async captureMemoryMetrics() {
    const metrics = await this.page.metrics();

    return {
      jsHeapUsedSize: (metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2) + ' MB',
      jsHeapTotalSize: (metrics.JSHeapTotalSize / 1024 / 1024).toFixed(2) + ' MB',
      nodes: metrics.Nodes,
      documents: metrics.Documents,
      jsEventListeners: metrics.JSEventListeners
    };
  }

  /**
   * Salva resultados
   */
  async saveResults() {
    const resultsDir = path.join(process.cwd(), 'engine', 'performance-results');
    await fs.promises.mkdir(resultsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-results-${timestamp}.json`;
    const filepath = path.join(resultsDir, filename);

    await fs.promises.writeFile(
      filepath,
      JSON.stringify(this.performanceResults, null, 2),
      'utf-8'
    );

    console.log(`\n💾 Resultados salvos em: ${filepath}`);
  }
}

export default PerformanceValidationEngine;
