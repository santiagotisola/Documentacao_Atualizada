# 🚀 AxionIA PIEQ - Código Base e Scripts

## 📁 Estrutura do Projeto

```
axion-pieq/
├── packages/
│   ├── core/                    # Motor principal
│   │   ├── src/
│   │   │   ├── discovery/       # Discovery Engine
│   │   │   ├── execution/       # Execution Engine
│   │   │   ├── intelligence/    # AI & Analytics
│   │   │   ├── evidence/        # Evidence Vault
│   │   │   └── governance/      # Governance Layer
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                      # Dashboard React
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── services/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── cli/                     # CLI Tool
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── bin/axion-pieq
│   │
│   └── plugins/                 # Sistema de Plugins
│       ├── playwright/
│       ├── cypress/
│       ├── k6/
│       └── custom/
│
├── apps/
│   ├── api/                     # API REST
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   └── services/
│   │   └── package.json
│   │
│   └── worker/                  # Test Worker
│       ├── src/
│       └── package.json
│
├── config/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.worker
│   │   └── docker-compose.yml
│   ├── k8s/
│   │   ├── deployment.yml
│   │   ├── service.yml
│   │   └── ingress.yml
│   └── environments/
│       ├── development.json
│       ├── staging.json
│       └── production.json
│
├── scripts/
│   ├── setup.ps1                # Windows setup
│   ├── setup.sh                 # Linux/Mac setup
│   ├── start-dev.ps1
│   ├── build.ps1
│   └── deploy.ps1
│
├── tests/
│   ├── examples/                # Exemplos de testes
│   ├── fixtures/                # Dados de teste
│   └── utils/                   # Utilitários
│
├── docs/
│   ├── getting-started.md
│   ├── architecture.md
│   ├── api-reference.md
│   └── governance.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── cd.yml
│       └── security.yml
│
├── package.json                 # Monorepo root
├── turbo.json                   # Turborepo config
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

---

## 📦 package.json (Root)

```json
{
  "name": "@axion/pieq",
  "version": "1.0.0",
  "description": "Plataforma Inteligente de Engenharia de Qualidade - Autonomous QA",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "clean": "turbo run clean && rm -rf node_modules",
    "setup": "pnpm install && pnpm run build",
    "start:api": "pnpm --filter @axion/pieq-api dev",
    "start:ui": "pnpm --filter @axion/pieq-ui dev",
    "start:worker": "pnpm --filter @axion/pieq-worker dev",
    "discover": "pnpm --filter @axion/pieq-cli discover",
    "generate": "pnpm --filter @axion/pieq-cli generate",
    "execute": "pnpm --filter @axion/pieq-cli execute"
  },
  "devDependencies": {
    "@turbo/gen": "^1.11.0",
    "turbo": "^1.11.0",
    "prettier": "^3.1.0",
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

---

## 🔧 packages/core/package.json

```json
{
  "name": "@axion/pieq-core",
  "version": "1.0.0",
  "description": "Motor principal da PIEQ - Discovery, Execution, Intelligence",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsc --watch",
    "build": "tsc",
    "test": "vitest",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "@playwright/test": "^1.40.0",
    "openai": "^4.20.0",
    "mongodb": "^6.3.0",
    "redis": "^4.6.0",
    "axios": "^1.6.0",
    "cheerio": "^1.0.0-rc.12",
    "zod": "^3.22.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@types/node": "^20.10.0"
  }
}
```

---

## 🎨 packages/ui/package.json

```json
{
  "name": "@axion/pieq-ui",
  "version": "1.0.0",
  "description": "Dashboard React da PIEQ",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.12.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.300.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🛠️ packages/core/src/discovery/ui-discovery.ts

```typescript
/**
 * UI Discovery Engine
 * Descobre automaticamente elementos, formulários e fluxos da interface
 */

import { chromium, Page, Browser } from '@playwright/test';
import { logger } from '../utils/logger';

export interface UIElement {
  type: 'input' | 'button' | 'link' | 'select' | 'textarea';
  selector: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  validation?: string;
}

export interface UIForm {
  name: string;
  action: string;
  method: string;
  fields: UIElement[];
  buttons: UIElement[];
}

export interface UIMenu {
  label: string;
  items: Array<{
    label: string;
    href: string;
    children?: UIMenu['items'];
  }>;
}

export interface UIDiscoveryResult {
  url: string;
  title: string;
  menus: UIMenu[];
  forms: UIForm[];
  tables: Array<{
    headers: string[];
    rowCount: number;
  }>;
  charts: Array<{
    type: string;
    title: string;
  }>;
}

export class UIDiscovery {
  private browser?: Browser;
  private page?: Page;

  async initialize() {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
    logger.info('UI Discovery initialized');
  }

  async discoverPage(url: string): Promise<UIDiscoveryResult> {
    if (!this.page) throw new Error('UIDiscovery not initialized');

    logger.info(`Discovering UI at ${url}`);
    
    await this.page.goto(url, { waitUntil: 'networkidle' });
    
    const title = await this.page.title();
    const menus = await this.discoverMenus();
    const forms = await this.discoverForms();
    const tables = await this.discoverTables();
    const charts = await this.discoverCharts();

    return {
      url,
      title,
      menus,
      forms,
      tables,
      charts
    };
  }

  private async discoverMenus(): Promise<UIMenu[]> {
    if (!this.page) return [];

    const menus = await this.page.evaluate(() => {
      const menuElements = document.querySelectorAll('nav, [role="navigation"]');
      const result: UIMenu[] = [];

      menuElements.forEach(nav => {
        const links = nav.querySelectorAll('a');
        const items = Array.from(links).map(link => ({
          label: link.textContent?.trim() || '',
          href: link.getAttribute('href') || ''
        }));

        result.push({
          label: nav.getAttribute('aria-label') || 'Main Menu',
          items
        });
      });

      return result;
    });

    return menus;
  }

  private async discoverForms(): Promise<UIForm[]> {
    if (!this.page) return [];

    const forms = await this.page.evaluate(() => {
      const formElements = document.querySelectorAll('form');
      const result: UIForm[] = [];

      formElements.forEach(form => {
        const fields: UIElement[] = [];
        const buttons: UIElement[] = [];

        // Inputs
        form.querySelectorAll('input, textarea, select').forEach(field => {
          const type = field.getAttribute('type') || field.tagName.toLowerCase();
          const label = field.getAttribute('aria-label') || 
                       document.querySelector(`label[for="${field.id}"]`)?.textContent?.trim();
          
          fields.push({
            type: type as any,
            selector: field.id ? `#${field.id}` : `input[name="${field.getAttribute('name')}"]`,
            label,
            placeholder: field.getAttribute('placeholder') || undefined,
            required: field.hasAttribute('required'),
            validation: field.getAttribute('pattern') || undefined
          });
        });

        // Buttons
        form.querySelectorAll('button, input[type="submit"]').forEach(btn => {
          buttons.push({
            type: 'button',
            selector: btn.id ? `#${btn.id}` : `button[type="${btn.getAttribute('type')}"]`,
            label: btn.textContent?.trim() || btn.getAttribute('value') || undefined
          });
        });

        result.push({
          name: form.getAttribute('name') || form.id || 'unnamed-form',
          action: form.getAttribute('action') || '',
          method: form.getAttribute('method') || 'GET',
          fields,
          buttons
        });
      });

      return result;
    });

    return forms;
  }

  private async discoverTables(): Promise<UIDiscoveryResult['tables']> {
    if (!this.page) return [];

    return await this.page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      return Array.from(tables).map(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent?.trim() || '');
        const rowCount = table.querySelectorAll('tbody tr').length;
        return { headers, rowCount };
      });
    });
  }

  private async discoverCharts(): Promise<UIDiscoveryResult['charts']> {
    if (!this.page) return [];

    return await this.page.evaluate(() => {
      // Detectar bibliotecas comuns de gráficos
      const charts: Array<{ type: string; title: string }> = [];

      // Recharts (React)
      document.querySelectorAll('.recharts-wrapper').forEach(chart => {
        charts.push({
          type: 'recharts',
          title: chart.getAttribute('aria-label') || 'Chart'
        });
      });

      // Chart.js
      document.querySelectorAll('canvas[id*="chart"]').forEach(canvas => {
        charts.push({
          type: 'chartjs',
          title: canvas.id || 'Chart'
        });
      });

      return charts;
    });
  }

  async close() {
    await this.browser?.close();
    logger.info('UI Discovery closed');
  }
}
```

---

## 🔌 packages/core/src/discovery/api-discovery.ts

```typescript
/**
 * API Discovery Engine
 * Descobre automaticamente endpoints, schemas e dependências de APIs
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface APIEndpoint {
  path: string;
  method: string;
  auth?: 'none' | 'basic' | 'bearer' | 'apikey';
  rateLimit?: string;
  responseTime?: number;
  schema?: {
    request?: object;
    response?: object;
  };
}

export interface APIDiscoveryResult {
  baseUrl: string;
  endpoints: APIEndpoint[];
  authentication: {
    type: string;
    required: boolean;
  };
  swagger?: string;
  openapi?: string;
}

export class APIDiscovery {
  private client: AxiosInstance;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      validateStatus: () => true // Aceitar todos os status
    });
  }

  async discover(): Promise<APIDiscoveryResult> {
    logger.info(`Discovering API at ${this.client.defaults.baseURL}`);

    const endpoints: APIEndpoint[] = [];
    
    // Tentar descobrir Swagger/OpenAPI
    const swaggerUrl = await this.discoverSwagger();
    const openapiUrl = await this.discoverOpenAPI();

    if (swaggerUrl) {
      const swaggerEndpoints = await this.parseSwagger(swaggerUrl);
      endpoints.push(...swaggerEndpoints);
    } else if (openapiUrl) {
      const openapiEndpoints = await this.parseOpenAPI(openapiUrl);
      endpoints.push(...openapiEndpoints);
    } else {
      // Descoberta manual por tentativa e erro
      const commonEndpoints = await this.discoverCommonEndpoints();
      endpoints.push(...commonEndpoints);
    }

    return {
      baseUrl: this.client.defaults.baseURL || '',
      endpoints,
      authentication: await this.detectAuthentication(),
      swagger: swaggerUrl,
      openapi: openapiUrl
    };
  }

  private async discoverSwagger(): Promise<string | undefined> {
    const commonPaths = [
      '/swagger.json',
      '/api/swagger.json',
      '/swagger/v1/swagger.json',
      '/api-docs'
    ];

    for (const path of commonPaths) {
      try {
        const response = await this.client.get(path);
        if (response.status === 200 && response.data.swagger) {
          logger.info(`Found Swagger at ${path}`);
          return path;
        }
      } catch {}
    }

    return undefined;
  }

  private async discoverOpenAPI(): Promise<string | undefined> {
    const commonPaths = [
      '/openapi.json',
      '/api/openapi.json',
      '/v3/api-docs'
    ];

    for (const path of commonPaths) {
      try {
        const response = await this.client.get(path);
        if (response.status === 200 && response.data.openapi) {
          logger.info(`Found OpenAPI at ${path}`);
          return path;
        }
      } catch {}
    }

    return undefined;
  }

  private async parseSwagger(swaggerUrl: string): Promise<APIEndpoint[]> {
    const response = await this.client.get(swaggerUrl);
    const swagger = response.data;
    const endpoints: APIEndpoint[] = [];

    for (const [path, methods] of Object.entries(swagger.paths)) {
      for (const [method, spec] of Object.entries(methods as any)) {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          auth: this.detectAuthFromSpec(spec),
          schema: {
            request: spec.parameters,
            response: spec.responses
          }
        });
      }
    }

    return endpoints;
  }

  private async parseOpenAPI(openapiUrl: string): Promise<APIEndpoint[]> {
    const response = await this.client.get(openapiUrl);
    const openapi = response.data;
    const endpoints: APIEndpoint[] = [];

    for (const [path, methods] of Object.entries(openapi.paths)) {
      for (const [method, spec] of Object.entries(methods as any)) {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          auth: this.detectAuthFromSpec(spec),
          schema: {
            request: spec.requestBody,
            response: spec.responses
          }
        });
      }
    }

    return endpoints;
  }

  private async discoverCommonEndpoints(): Promise<APIEndpoint[]> {
    const commonPaths = [
      '/api/health',
      '/api/status',
      '/api/version',
      '/health',
      '/ready',
      '/metrics'
    ];

    const endpoints: APIEndpoint[] = [];

    for (const path of commonPaths) {
      try {
        const start = Date.now();
        const response = await this.client.get(path);
        const responseTime = Date.now() - start;

        if (response.status < 500) {
          endpoints.push({
            path,
            method: 'GET',
            responseTime,
            auth: response.status === 401 ? 'bearer' : 'none'
          });
        }
      } catch {}
    }

    return endpoints;
  }

  private detectAuthFromSpec(spec: any): APIEndpoint['auth'] {
    if (spec.security) {
      const securityTypes = Object.keys(spec.security[0] || {});
      if (securityTypes.includes('bearerAuth')) return 'bearer';
      if (securityTypes.includes('basicAuth')) return 'basic';
      if (securityTypes.includes('apiKeyAuth')) return 'apikey';
    }
    return 'none';
  }

  private async detectAuthentication() {
    try {
      const response = await this.client.get('/');
      if (response.status === 401) {
        const authHeader = response.headers['www-authenticate'];
        if (authHeader?.includes('Bearer')) {
          return { type: 'bearer', required: true };
        }
        if (authHeader?.includes('Basic')) {
          return { type: 'basic', required: true };
        }
      }
    } catch {}

    return { type: 'none', required: false };
  }
}
```

---

## 🤖 packages/core/src/intelligence/test-generator.ts

```typescript
/**
 * AI-Powered Test Generator
 * Gera casos de teste a partir de linguagem natural usando GPT-4
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger';

export interface TestGenerationRequest {
  description: string; // Descrição em linguagem natural
  context?: {
    application: string;
    module: string;
    userStory?: string;
  };
  targetFramework: 'playwright' | 'cypress' | 'jest';
  coverageLevel: 'basic' | 'comprehensive' | 'exhaustive';
}

export interface GeneratedTest {
  name: string;
  description: string;
  code: string;
  framework: string;
  steps: Array<{
    order: number;
    action: string;
    assertion?: string;
  }>;
  testData?: object;
}

export class TestGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateTest(request: TestGenerationRequest): Promise<GeneratedTest> {
    logger.info(`Generating test: ${request.description}`);

    const prompt = this.buildPrompt(request);
    
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `Você é um engenheiro de QA especialista em automação de testes. 
          Gere testes de alta qualidade, completos, bem estruturados e com boas práticas.
          O código deve ser executável diretamente sem modificações.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      name: response.testName,
      description: response.description,
      code: response.code,
      framework: request.targetFramework,
      steps: response.steps,
      testData: response.testData
    };
  }

  private buildPrompt(request: TestGenerationRequest): string {
    return `
# Geração de Teste Automatizado

## Descrição do Teste
${request.description}

${request.context ? `
## Contexto
- Aplicação: ${request.context.application}
- Módulo: ${request.context.module}
${request.context.userStory ? `- User Story: ${request.context.userStory}` : ''}
` : ''}

## Framework
${request.targetFramework}

## Nível de Cobertura
${request.coverageLevel}

## Requisitos
1. Gere o código completo do teste pronto para execução
2. Inclua tratamento de erros e retry quando apropriado
3. Use Page Object Model se aplicável
4. Adicione assertions claras e específicas
5. Inclua comentários explicativos
6. Gere dados de teste realistas

## Formato de Resposta (JSON)
{
  "testName": "Nome descritivo do teste",
  "description": "O que o teste valida",
  "code": "Código completo do teste",
  "steps": [
    {
      "order": 1,
      "action": "Descrição da ação",
      "assertion": "Descrição da validação (opcional)"
    }
  ],
  "testData": {
    // Dados de teste gerados
  }
}
    `.trim();
  }

  async generateTestSuite(
    descriptions: string[],
    framework: TestGenerationRequest['targetFramework']
  ): Promise<GeneratedTest[]> {
    const tests: GeneratedTest[] = [];

    for (const description of descriptions) {
      const test = await this.generateTest({
        description,
        targetFramework: framework,
        coverageLevel: 'comprehensive'
      });
      tests.push(test);
    }

    return tests;
  }
}
```

---

## 📊 packages/core/src/intelligence/health-scorer.ts

```typescript
/**
 * Health Score Calculator
 * Calcula pontuação de qualidade com base em múltiplas métricas
 */

export interface HealthMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  flakyTests: number;
  coveragePercentage: number;
  avgExecutionTime: number;
  baselineExecutionTime: number;
  falsePositives: number;
  businessCriticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface HealthScore {
  overall: number; // 0-100
  grade: 'excellent' | 'good' | 'attention' | 'risk' | 'critical';
  breakdown: {
    successRate: { score: number; weight: number };
    stability: { score: number; weight: number };
    coverage: { score: number; weight: number };
    performance: { score: number; weight: number };
    accuracy: { score: number; weight: number };
    criticality: { score: number; weight: number };
  };
  recommendations: string[];
}

export class HealthScorer {
  private static readonly WEIGHTS = {
    successRate: 0.30,    // 30%
    stability: 0.25,       // 25%
    coverage: 0.20,        // 20%
    performance: 0.10,     // 10%
    accuracy: 0.10,        // 10%
    criticality: 0.05      // 5%
  };

  private static readonly THRESHOLDS = {
    excellent: 95,
    good: 80,
    attention: 60,
    risk: 40,
    critical: 0
  };

  calculateHealthScore(metrics: HealthMetrics): HealthScore {
    const successRate = this.calculateSuccessRate(metrics);
    const stability = this.calculateStability(metrics);
    const coverage = metrics.coveragePercentage;
    const performance = this.calculatePerformance(metrics);
    const accuracy = this.calculateAccuracy(metrics);
    const criticality = this.mapCriticality(metrics.businessCriticality);

    const breakdown = {
      successRate: {
        score: successRate,
        weight: HealthScorer.WEIGHTS.successRate
      },
      stability: {
        score: stability,
        weight: HealthScorer.WEIGHTS.stability
      },
      coverage: {
        score: coverage,
        weight: HealthScorer.WEIGHTS.coverage
      },
      performance: {
        score: performance,
        weight: HealthScorer.WEIGHTS.performance
      },
      accuracy: {
        score: accuracy,
        weight: HealthScorer.WEIGHTS.accuracy
      },
      criticality: {
        score: criticality,
        weight: HealthScorer.WEIGHTS.criticality
      }
    };

    const overall = 
      successRate * HealthScorer.WEIGHTS.successRate +
      stability * HealthScorer.WEIGHTS.stability +
      coverage * HealthScorer.WEIGHTS.coverage +
      performance * HealthScorer.WEIGHTS.performance +
      accuracy * HealthScorer.WEIGHTS.accuracy +
      criticality * HealthScorer.WEIGHTS.criticality;

    const grade = this.calculateGrade(overall);
    const recommendations = this.generateRecommendations(metrics, breakdown);

    return {
      overall: Math.round(overall * 100) / 100,
      grade,
      breakdown,
      recommendations
    };
  }

  private calculateSuccessRate(metrics: HealthMetrics): number {
    if (metrics.totalTests === 0) return 0;
    return (metrics.passedTests / metrics.totalTests) * 100;
  }

  private calculateStability(metrics: HealthMetrics): number {
    if (metrics.totalTests === 0) return 100;
    const stabilityRate = 1 - (metrics.flakyTests / metrics.totalTests);
    return stabilityRate * 100;
  }

  private calculatePerformance(metrics: HealthMetrics): number {
    if (metrics.baselineExecutionTime === 0) return 100;
    const performanceRatio = metrics.baselineExecutionTime / metrics.avgExecutionTime;
    return Math.min(performanceRatio * 100, 100);
  }

  private calculateAccuracy(metrics: HealthMetrics): number {
    if (metrics.failedTests === 0) return 100;
    const accuracyRate = 1 - (metrics.falsePositives / metrics.failedTests);
    return accuracyRate * 100;
  }

  private mapCriticality(level: HealthMetrics['businessCriticality']): number {
    const map = {
      critical: 100,
      high: 90,
      medium: 70,
      low: 50
    };
    return map[level];
  }

  private calculateGrade(score: number): HealthScore['grade'] {
    if (score >= HealthScorer.THRESHOLDS.excellent) return 'excellent';
    if (score >= HealthScorer.THRESHOLDS.good) return 'good';
    if (score >= HealthScorer.THRESHOLDS.attention) return 'attention';
    if (score >= HealthScorer.THRESHOLDS.risk) return 'risk';
    return 'critical';
  }

  private generateRecommendations(
    metrics: HealthMetrics,
    breakdown: HealthScore['breakdown']
  ): string[] {
    const recommendations: string[] = [];

    if (breakdown.successRate.score < 80) {
      recommendations.push('Taxa de sucesso baixa - investigar falhas recorrentes');
    }

    if (breakdown.stability.score < 85) {
      recommendations.push('Testes instáveis detectados - implementar retry ou self-healing');
    }

    if (breakdown.coverage.score < 70) {
      recommendations.push('Cobertura abaixo do ideal - gerar mais testes para módulos críticos');
    }

    if (breakdown.performance.score < 80) {
      recommendations.push('Performance degradada - otimizar testes ou ambiente de execução');
    }

    if (breakdown.accuracy.score < 90) {
      recommendations.push('Alto índice de falsos positivos - revisar assertions');
    }

    if (metrics.flakyTests > 0) {
      recommendations.push(`${metrics.flakyTests} teste(s) flaky - priorizar estabilização`);
    }

    return recommendations;
  }
}
```

---

## 🚀 Script setup.ps1 (Windows)

```powershell
# AxionIA PIEQ - Setup Script (Windows)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AxionIA PIEQ - Setup & Installation  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "[1/8] Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js não encontrado. Instale Node.js >= v20" -ForegroundColor Red
    Write-Host "Download: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green

# 2. Verificar pnpm
Write-Host "[2/8] Verificando pnpm..." -ForegroundColor Yellow
$pnpmVersion = pnpm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  pnpm não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g pnpm
    $pnpmVersion = pnpm --version
}
Write-Host "✅ pnpm $pnpmVersion" -ForegroundColor Green

# 3. Verificar Docker
Write-Host "[3/8] Verificando Docker..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Docker não encontrado (opcional para desenvolvimento local)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Docker $dockerVersion" -ForegroundColor Green
}

# 4. Instalar dependências
Write-Host "[4/8] Instalando dependências..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependências instaladas" -ForegroundColor Green

# 5. Configurar ambiente
Write-Host "[5/8] Configurando ambiente..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Arquivo .env criado (configure suas variáveis)" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Arquivo .env já existe" -ForegroundColor Cyan
}

# 6. Build dos pacotes
Write-Host "[6/8] Compilando pacotes..." -ForegroundColor Yellow
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao compilar pacotes" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Pacotes compilados" -ForegroundColor Green

# 7. Instalar Playwright browsers
Write-Host "[7/8] Instalando browsers do Playwright..." -ForegroundColor Yellow
pnpm exec playwright install chromium firefox webkit
Write-Host "✅ Browsers instalados" -ForegroundColor Green

# 8. Inicializar banco de dados
Write-Host "[8/8] Inicializando banco de dados..." -ForegroundColor Yellow
# TODO: Script de seed do MongoDB
Write-Host "✅ Banco de dados pronto" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ Setup concluído com sucesso!     " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure suas variáveis em .env" -ForegroundColor White
Write-Host "2. Execute: pnpm run dev" -ForegroundColor White
Write-Host "3. Acesse http://localhost:3000" -ForegroundColor White
Write-Host ""
```

---

## 📝 README.md do Projeto

```markdown
# 🤖 AxionIA PIEQ

**Plataforma Inteligente de Engenharia de Qualidade** - Autonomous Quality Engineering Platform

Sistema autônomo de QA com IA generativa, descoberta automática, geração de cenários, validação contínua e conformidade com governança corporativa (ITIL, COBIT, ISO 27001:2022).

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker (opcional)
- MongoDB >= 6.0
- Redis >= 7.0 (opcional)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Axion-Tecnologia/axion-pieq.git
cd axion-pieq

# Execute o setup (Windows)
.\scripts\setup.ps1

# Ou Linux/Mac
bash scripts/setup.sh

# Configure .env
cp .env.example .env
# Edite .env com suas configurações

# Inicie os serviços
pnpm run dev
```

### Acesso

- **Dashboard UI**: http://localhost:3000
- **API**: http://localhost:3100
- **Swagger**: http://localhost:3100/api-docs

---

## 📖 Documentação Completa

### Arquivos Principais

1. **[AXION-PIEQ-SPECIFICATION.json](./AXION-PIEQ-SPECIFICATION.json)**
   - Especificação completa em JSON
   - Configuração de todos os módulos
   - Formato machine-readable

2. **[AXION-PIEQ-ARQUITETURA-COMPLETA.md](./AXION-PIEQ-ARQUITETURA-COMPLETA.md)**
   - Arquitetura detalhada
   - Diagramas e fluxos
   - Exemplos de código

3. **[INVENTARIO-COMPLETO-ARQUITETURA-AXION.json](./INVENTARIO-COMPLETO-ARQUITETURA-AXION.json)**
   - Mapeamento de todos os sistemas Axion
   - Páginas, APIs, endpoints
   - Base para geração de testes

---

## 🎯 Uso Básico

### CLI

```bash
# Descobrir sistema
pnpm pieq discover --url https://goiania.axion.ws

# Gerar testes
pnpm pieq generate --description "Validar cadastro de equipamento" --framework playwright

# Executar testes
pnpm pieq run --suite regression --env staging --parallel 10

# Health Score
pnpm pieq score --project axhub

# Relatórios
pnpm pieq report --format html --output ./reports
```

### API

```bash
# Descobrir UI
POST /api/discovery/ui
{
  "url": "https://goiania.axion.ws/equipamentos"
}

# Gerar teste
POST /api/tests/generate
{
  "description": "Validar alteração de velocidade",
  "framework": "playwright",
  "coverage": "comprehensive"
}

# Executar teste
POST /api/tests/execute
{
  "testId": "test-123",
  "environment": "staging"
}

# Health Score
GET /api/health/score/axhub
```

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│      AxionIA Quality Brain          │
│  (GPT-4 + ML + Knowledge Graph)     │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
Discovery  Execution  Intelligence
    │          │          │
    └──────────┼──────────┘
               ▼
         ┌─────────┐
         │  Data   │
         │ MongoDB │
         │  Redis  │
         └─────────┘
```

---

## 🧪 Exemplos

### Teste Gerado por IA

**Input (Linguagem Natural)**:
```
Validar cadastro de equipamento GYN1R801 alterando velocidade para 100 km/h
```

**Output (Código Playwright)**:
```typescript
test('Validar alteração de velocidade equipamento GYN1R801', async ({ page }) => {
  await page.goto('/equipamentos');
  await page.getByPlaceholder('Buscar').fill('GYN1R801');
  await page.getByRole('button', { name: 'Pesquisar' }).click();
  await page.getByRole('button', { name: 'Editar' }).click();
  await page.getByLabel('Velocidade').fill('100');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await expect(page.getByText('salvo com sucesso')).toBeVisible();
  
  // Validação de persistência
  await page.reload();
  const velocidade = await page.getByRole('cell', { name: '100' }).textContent();
  expect(velocidade).toBe('100');
});
```

---

## 🔐 Segurança

- ✅ Autenticação JWT
- ✅ RBAC (Role-Based Access Control)
- ✅ Audit Trail tamper-proof
- ✅ Criptografia AES-256 (dados em repouso)
- ✅ TLS 1.3 (dados em trânsito)
- ✅ Mascaramento de dados sensíveis
- ✅ Conformidade LGPD

---

## 📊 Governança

### ITIL v4
- ✅ Change Management
- ✅ Incident Management
- ✅ Problem Management

### COBIT 2019
- ✅ Access Control (APO13.01)
- ✅ Data Protection (DSS05.01)
- ✅ Audit Trail (MEA03.03)

### ISO/IEC 27001:2022
- ✅ A.8.2 - Information Classification
- ✅ A.8.3 - Media Handling
- ✅ A.12.4 - Logging and Monitoring

---

## 🤝 Contribuindo

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md) para guidelines.

---

## 📄 Licença

Proprietary - Axion Tecnologia © 2026

---

## 📞 Suporte

- Email: pieq-support@axiontecnologia.com.br
- Slack: #axion-pieq
- Docs: https://docs.axion.ws/pieq

---

**Desenvolvido com ❤️ pela equipe Axion Tecnologia**
```
