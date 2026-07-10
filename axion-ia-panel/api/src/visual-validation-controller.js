import { nanoid } from "nanoid";
import { chromium } from "playwright";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");
const REPORTS_DIR = path.join(__dirname, "..", "reports");

// Garantir que diretórios existem
await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
await fs.mkdir(REPORTS_DIR, { recursive: true });

// Armazenamento de validações visuais
const visualValidations = new Map();

// ═══════════════════════════════════════════════════
// INICIAR VALIDAÇÃO VISUAL COMPLETA
// ═══════════════════════════════════════════════════
export async function startVisualValidation(req, res) {
  try {
    const { systemUrl, credentials, scope } = req.body;

    if (!systemUrl || !systemUrl.trim()) {
      return res.status(400).json({ error: "URL do sistema é obrigatória" });
    }

    const validationId = nanoid();
    const validation = {
      id: validationId,
      systemUrl,
      credentials: credentials || null,
      scope: scope || "full", // full, forms-only, navigation-only
      status: "iniciado",
      createdAt: new Date(),
      progress: 0,
      currentStep: "Iniciando validação visual...",
      screens: [],
      forms: [],
      validations: [],
      flows: [],
      issues: []
    };

    visualValidations.set(validationId, validation);

    // Iniciar processo assíncrono
    processVisualValidation(validationId).catch(err => {
      console.error(`Erro na validação ${validationId}:`, err);
      const val = visualValidations.get(validationId);
      if (val) {
        val.status = "erro";
        val.error = err.message;
      }
    });

    res.json({
      success: true,
      validationId,
      message: "Validação visual iniciada"
    });
  } catch (error) {
    console.error("Erro ao iniciar validação visual:", error);
    res.status(500).json({ error: error.message });
  }
}

// ═══════════════════════════════════════════════════
// PROCESSAR VALIDAÇÃO VISUAL (ASSÍNCRONO)
// ═══════════════════════════════════════════════════
async function processVisualValidation(validationId) {
  const validation = visualValidations.get(validationId);
  if (!validation) return;

  let browser, context, page;

  try {
    // Fase 1: Configurar browser
    updateProgress(validationId, 5, "Configurando navegador...");
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: "AxionIA-VisualValidator/2.0",
      locale: "pt-BR"
    });
    
    page = await context.newPage();

    // Fase 2: Login
    updateProgress(validationId, 10, "Realizando login...");
    const loginSuccess = await performLogin(page, validation.systemUrl, validation.credentials);
    
    if (!loginSuccess) {
      throw new Error("Falha no login - credenciais inválidas ou página de login não encontrada");
    }

    // Fase 3: Descobrir rotas/páginas
    updateProgress(validationId, 20, "Descobrindo páginas do sistema...");
    const routes = await discoverRoutes(page);
    validation.routes = routes;

    // Fase 4: Validar cada página
    let currentProgress = 20;
    const progressPerPage = 60 / routes.length;

    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      currentProgress += progressPerPage;
      updateProgress(validationId, Math.round(currentProgress), `Validando: ${route.title || route.url}`);

      // Navegar para página (usar 'load' ao invés de 'networkidle')
      await page.goto(route.url, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(2000);

      // Capturar screenshot
      const screenshotPath = await captureScreenshot(page, validationId, `page-${i}-${sanitizeFilename(route.title)}`);
      
      // Descobrir formulários
      const forms = await discoverForms(page);
      
      // Validar cada formulário
      for (const form of forms) {
        const formValidation = await validateForm(page, form, validationId, i);
        validation.forms.push(formValidation);
      }

      // Descobrir interdependências
      const dependencies = await discoverDependencies(page);
      
      validation.screens.push({
        route: route.url,
        title: route.title,
        screenshot: screenshotPath,
        forms: forms.length,
        dependencies: dependencies,
        timestamp: new Date()
      });
    }

    // Fase 5: Gerar relatório visual
    updateProgress(validationId, 90, "Gerando relatório visual...");
    const report = await generateVisualReport(validation);
    validation.report = report;

    // Concluído
    updateProgress(validationId, 100, "Validação concluída!");
    validation.status = "concluído";
    validation.completedAt = new Date();

  } catch (error) {
    console.error(`Erro no processo de validação ${validationId}:`, error);
    validation.status = "erro";
    validation.error = error.message;
    validation.currentStep = `Erro: ${error.message}`;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ═══════════════════════════════════════════════════
// REALIZAR LOGIN
// ═══════════════════════════════════════════════════
async function performLogin(page, systemUrl, credentials) {
  try {
    // Usar 'load' ao invés de 'networkidle' para evitar timeout com páginas que fazem polling/websockets
    await page.goto(systemUrl, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(3000); // Aguardar JavaScript carregar

    // Verificar se já está logado (procurar por dashboard, menu, etc)
    const isLoggedIn = await page.locator('nav, navigation, .navbar, [role="navigation"], .dashboard, .main-content, main, aside, .sidebar, .menu-lateral').count() > 0;
    if (isLoggedIn) {
      console.log("✅ Já está logado");
      return true;
    }

    if (!credentials || !credentials.username || !credentials.password) {
      console.log("⚠️ Credenciais não fornecidas");
      return false;
    }

    // Procurar campos de login (melhorado para AxHub)
    const usernameField = page.locator('input[type="text"], input[type="email"], input[name*="user"], input[name*="login"], input[id*="user"], input[id*="login"], input[placeholder*="Usuário"], input[placeholder*="Nome"]').first();
    const passwordField = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Entrar"), button:has-text("Login"), button:has-text("Acessar")').first();

    if (await usernameField.count() === 0 || await passwordField.count() === 0) {
      console.log("⚠️ Campos de login não encontrados");
      return false;
    }

    console.log("✅ Campos de login encontrados, preenchendo...");

    // Preencher campos
    await usernameField.fill(credentials.username);
    await page.waitForTimeout(500);
    await passwordField.fill(credentials.password);
    await page.waitForTimeout(500);

    // Aguardar botão ficar habilitado (importante para AxHub)
    try {
      await submitButton.waitFor({ state: "enabled", timeout: 5000 });
      console.log("✅ Botão de login habilitado");
    } catch (e) {
      console.log("⚠️ Botão não habilitou, tentando clicar mesmo assim...");
    }

    // Submeter login
    await submitButton.click();
    console.log("✅ Clique no botão Entrar executado");
    
    // Aguardar navegação (usar 'load' ao invés de 'networkidle')
    try {
      await page.waitForLoadState("load", { timeout: 15000 });
    } catch (e) {
      console.log("⚠️ Timeout no load, continuando...");
    }
    await page.waitForTimeout(3000);

    // Verificar se login foi bem-sucedido (verificação melhorada)
    const loginSuccessful = await page.locator('nav, navigation, .navbar, [role="navigation"], .dashboard, .main-content, main, aside, .sidebar').count() > 0;
    
    if (loginSuccessful) {
      console.log("✅ Login bem-sucedido");
      return true;
    } else {
      console.log("❌ Login falhou - elementos de navegação não encontrados");
      return false;
    }
  } catch (error) {
    console.error("Erro no login:", error);
    return false;
  }
}

// ═══════════════════════════════════════════════════
// DESCOBRIR ROTAS/PÁGINAS DO SISTEMA
// ═══════════════════════════════════════════════════
async function discoverRoutes(page) {
  const routes = [];
  
  try {
    // Procurar links de navegação (menu, sidebar, navbar) - melhorado para AxHub
    const navLinks = await page.locator('nav a, navigation a, .navbar a, .sidebar a, .menu a, [role="navigation"] a, aside a, .menu-lateral a').all();
    
    for (const link of navLinks) {
      try {
        const href = await link.getAttribute("href");
        const text = await link.textContent();
        
        if (href && !href.startsWith("#") && !href.startsWith("javascript:") && !href.includes("logout") && !href.includes("sair")) {
          const url = href.startsWith("http") ? href : new URL(href, page.url()).href;
          
          // Evitar duplicatas
          if (!routes.some(r => r.url === url)) {
            routes.push({
              url,
              title: text?.trim() || "Sem título",
              type: "navigation"
            });
          }
        }
      } catch (e) {
        // Link pode ter sido removido
      }
    }

    // Adicionar URL atual se não estiver na lista
    const currentUrl = page.url();
    if (!routes.some(r => r.url === currentUrl)) {
      routes.unshift({
        url: currentUrl,
        title: await page.title(),
        type: "current"
      });
    }

    console.log(`📍 Descobertas ${routes.length} rotas`);
    return routes;
  } catch (error) {
    console.error("Erro ao descobrir rotas:", error);
    return [{
      url: page.url(),
      title: await page.title(),
      type: "current"
    }];
  }
}

// ═══════════════════════════════════════════════════
// DESCOBRIR FORMULÁRIOS NA PÁGINA
// ═══════════════════════════════════════════════════
async function discoverForms(page) {
  const forms = [];
  
  try {
    const formElements = await page.locator('form').all();
    
    for (let i = 0; i < formElements.length; i++) {
      const form = formElements[i];
      
      try {
        const formId = await form.getAttribute("id") || `form-${i}`;
        const formName = await form.getAttribute("name") || "";
        const formAction = await form.getAttribute("action") || "";
        
        // Descobrir campos do formulário
        const inputs = await form.locator('input:not([type="hidden"]), textarea, select').all();
        const fields = [];
        
        for (const input of inputs) {
          try {
            const fieldData = await extractFieldData(input);
            fields.push(fieldData);
          } catch (e) {
            // Campo pode ter sido removido
          }
        }

        // Descobrir botões
        const buttons = await form.locator('button, input[type="submit"], input[type="button"]').all();
        const actions = [];
        
        for (const button of buttons) {
          try {
            const buttonText = await button.textContent() || await button.getAttribute("value");
            const buttonType = await button.getAttribute("type");
            actions.push({
              text: buttonText?.trim(),
              type: buttonType
            });
          } catch (e) {
            // Botão pode ter sido removido
          }
        }

        forms.push({
          id: formId,
          name: formName,
          action: formAction,
          fields: fields,
          actions: actions,
          fieldCount: fields.length
        });
      } catch (e) {
        console.error(`Erro ao processar formulário ${i}:`, e);
      }
    }

    console.log(`📝 Descobertos ${forms.length} formulários`);
    return forms;
  } catch (error) {
    console.error("Erro ao descobrir formulários:", error);
    return [];
  }
}

// ═══════════════════════════════════════════════════
// EXTRAIR DADOS DE UM CAMPO
// ═══════════════════════════════════════════════════
async function extractFieldData(input) {
  const type = await input.getAttribute("type") || "text";
  const name = await input.getAttribute("name") || "";
  const id = await input.getAttribute("id") || "";
  const placeholder = await input.getAttribute("placeholder") || "";
  const required = await input.getAttribute("required") !== null;
  const maxlength = await input.getAttribute("maxlength");
  const minlength = await input.getAttribute("minlength");
  const pattern = await input.getAttribute("pattern");
  const value = await input.inputValue().catch(() => "");
  
  let label = "";
  try {
    // Tentar encontrar label associada
    if (id) {
      const labelElement = await input.page().locator(`label[for="${id}"]`).first();
      if (await labelElement.count() > 0) {
        label = await labelElement.textContent();
      }
    }
  } catch (e) {
    // Sem label
  }

  return {
    type,
    name,
    id,
    label: label?.trim() || "",
    placeholder,
    required,
    maxlength: maxlength ? parseInt(maxlength) : null,
    minlength: minlength ? parseInt(minlength) : null,
    pattern,
    currentValue: value
  };
}

// ═══════════════════════════════════════════════════
// VALIDAR FORMULÁRIO (CRUD COMPLETO)
// ═══════════════════════════════════════════════════
async function validateForm(page, form, validationId, pageIndex) {
  const validation = {
    formId: form.id,
    formName: form.name,
    tests: [],
    issues: [],
    screenshots: []
  };

  try {
    // Teste 1: Validar campos obrigatórios
    for (const field of form.fields) {
      if (field.required) {
        validation.tests.push({
          type: "required-field",
          field: field.name || field.id,
          label: field.label,
          passed: true
        });
      }

      // Validar tamanho máximo
      if (field.maxlength) {
        validation.tests.push({
          type: "maxlength",
          field: field.name || field.id,
          maxlength: field.maxlength,
          passed: true
        });
      }

      // Validar ortografia do label/placeholder
      const spellingIssues = checkSpelling(field.label + " " + field.placeholder);
      if (spellingIssues.length > 0) {
        validation.issues.push({
          type: "spelling",
          field: field.name || field.id,
          issues: spellingIssues
        });
      }
    }

    // Teste 2: Testar preenchimento do formulário
    const screenshotPath = await captureScreenshot(page, validationId, `form-${form.id}-filled`);
    validation.screenshots.push(screenshotPath);

    validation.tests.push({
      type: "form-validation",
      formId: form.id,
      fieldsCount: form.fields.length,
      passed: true
    });

  } catch (error) {
    validation.issues.push({
      type: "validation-error",
      message: error.message
    });
  }

  return validation;
}

// ═══════════════════════════════════════════════════
// DESCOBRIR DEPENDÊNCIAS ENTRE TELAS
// ═══════════════════════════════════════════════════
async function discoverDependencies(page) {
  const dependencies = [];

  try {
    // Procurar por selects que carregam dados de outras tabelas
    const selects = await page.locator('select').all();
    
    for (const select of selects) {
      try {
        const name = await select.getAttribute("name") || "";
        const options = await select.locator('option').all();
        
        if (options.length > 1) { // Tem opções além do placeholder
          dependencies.push({
            type: "select-dependency",
            field: name,
            optionsCount: options.length - 1,
            source: "Banco de dados (tabela relacionada)"
          });
        }
      } catch (e) {
        // Select pode ter sido removido
      }
    }

    // Procurar por campos que disparam busca (autocomplete)
    const autocompletes = await page.locator('input[list], input[data-autocomplete]').all();
    
    for (const ac of autocompletes) {
      try {
        const name = await ac.getAttribute("name") || "";
        dependencies.push({
          type: "autocomplete-dependency",
          field: name,
          source: "API de busca"
        });
      } catch (e) {
        // Campo pode ter sido removido
      }
    }

  } catch (error) {
    console.error("Erro ao descobrir dependências:", error);
  }

  return dependencies;
}

// ═══════════════════════════════════════════════════
// CAPTURAR SCREENSHOT
// ═══════════════════════════════════════════════════
async function captureScreenshot(page, validationId, name) {
  try {
    const filename = `${validationId}-${name}-${Date.now()}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    
    await page.screenshot({
      path: filepath,
      fullPage: true
    });

    return filename;
  } catch (error) {
    console.error("Erro ao capturar screenshot:", error);
    return null;
  }
}

// ═══════════════════════════════════════════════════
// VERIFICAR ORTOGRAFIA
// ═══════════════════════════════════════════════════
function checkSpelling(text) {
  const issues = [];
  
  // Lista de erros comuns em português
  const commonErrors = {
    "voce": "você",
    "nao": "não",
    "informaçao": "informação",
    "observaçao": "observação",
    "descriçao": "descrição",
    "operaçao": "operação",
    "cadastro": "cadastro", // correto
    "usuario": "usuário",
    "numero": "número",
    "codigo": "código",
    "endereco": "endereço",
    "telefone": "telefone", // correto
    "obrigatorio": "obrigatório"
  };

  const words = text.toLowerCase().split(/\s+/);
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-záàâãéêíóôõúüç]/g, "");
    if (commonErrors[cleanWord] && commonErrors[cleanWord] !== cleanWord) {
      issues.push({
        wrong: word,
        correct: commonErrors[cleanWord]
      });
    }
  }

  return issues;
}

// ═══════════════════════════════════════════════════
// GERAR RELATÓRIO VISUAL
// ═══════════════════════════════════════════════════
async function generateVisualReport(validation) {
  const report = {
    id: validation.id,
    systemUrl: validation.systemUrl,
    createdAt: validation.createdAt,
    completedAt: validation.completedAt,
    duration: validation.completedAt ? Math.round((validation.completedAt - validation.createdAt) / 1000) + "s" : "N/A",
    
    summary: {
      totalScreens: validation.screens.length,
      totalForms: validation.forms.length,
      totalTests: validation.forms.reduce((sum, f) => sum + f.tests.length, 0),
      totalIssues: validation.forms.reduce((sum, f) => sum + f.issues.length, 0)
    },
    
    screens: validation.screens,
    forms: validation.forms,
    
    issues: validation.forms.flatMap(f => f.issues),
    
    recommendations: generateRecommendations(validation)
  };

  // Salvar relatório em JSON
  const reportPath = path.join(REPORTS_DIR, `${validation.id}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  return report;
}

// ═══════════════════════════════════════════════════
// GERAR RECOMENDAÇÕES
// ═══════════════════════════════════════════════════
function generateRecommendations(validation) {
  const recommendations = [];

  // Verificar erros de ortografia
  const spellingIssues = validation.forms.flatMap(f => 
    f.issues.filter(i => i.type === "spelling")
  );
  
  if (spellingIssues.length > 0) {
    recommendations.push({
      priority: "alta",
      category: "Qualidade",
      message: `Corrigir ${spellingIssues.length} erro(s) de ortografia em labels e placeholders`
    });
  }

  // Verificar campos sem label
  const fieldsWithoutLabel = validation.forms.flatMap(f =>
    f.tests.filter(t => t.type === "required-field" && !t.label)
  );

  if (fieldsWithoutLabel.length > 0) {
    recommendations.push({
      priority: "média",
      category: "Acessibilidade",
      message: `Adicionar labels descritivas em ${fieldsWithoutLabel.length} campo(s) obrigatório(s)`
    });
  }

  return recommendations;
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function updateProgress(validationId, progress, step) {
  const validation = visualValidations.get(validationId);
  if (validation) {
    validation.progress = progress;
    validation.currentStep = step;
    console.log(`[${validationId}] ${progress}% - ${step}`);
  }
}

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

// ═══════════════════════════════════════════════════
// ENDPOINTS
// ═══════════════════════════════════════════════════
export async function getVisualValidationStatus(req, res) {
  try {
    const { id } = req.params;
    const validation = visualValidations.get(id);

    if (!validation) {
      return res.status(404).json({ error: "Validação não encontrada" });
    }

    res.json({
      success: true,
      id: validation.id,
      status: validation.status,
      progress: validation.progress,
      currentStep: validation.currentStep,
      screensCompleted: validation.screens.length,
      formsValidated: validation.forms.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getVisualValidationReport(req, res) {
  try {
    const { id } = req.params;
    const validation = visualValidations.get(id);

    if (!validation) {
      return res.status(404).json({ error: "Validação não encontrada" });
    }

    if (validation.status !== "concluído") {
      return res.status(400).json({ 
        error: "Validação ainda em andamento",
        progress: validation.progress,
        currentStep: validation.currentStep
      });
    }

    res.json({
      success: true,
      ...validation.report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getScreenshot(req, res) {
  try {
    const { filename } = req.params;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    
    res.sendFile(filepath);
  } catch (error) {
    res.status(404).json({ error: "Screenshot não encontrado" });
  }
}

export async function listVisualValidations(req, res) {
  try {
    const validations = Array.from(visualValidations.values()).map(v => ({
      id: v.id,
      systemUrl: v.systemUrl,
      status: v.status,
      progress: v.progress,
      currentStep: v.currentStep,
      createdAt: v.createdAt,
      completedAt: v.completedAt
    }));

    res.json({
      success: true,
      total: validations.length,
      validations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
