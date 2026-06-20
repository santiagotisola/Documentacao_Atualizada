import { nanoid } from "nanoid";
import { chromium } from "playwright";
import axios from "axios";

// ═══════════════════════════════════════════════════
// ARMAZENAMENTO EM MEMÓRIA (validações ativas)
// ═══════════════════════════════════════════════════
const validations = new Map();

// ═══════════════════════════════════════════════════
// INICIAR VALIDAÇÃO
// ═══════════════════════════════════════════════════
export async function startValidation(req, res) {
  try {
    const { systemUrl, systemName, credentials, validationType } = req.body;

    if (!systemUrl || !systemUrl.trim()) {
      return res.status(400).json({ error: "URL do sistema é obrigatória" });
    }

    const validationId = nanoid();
    const validation = {
      id: validationId,
      systemUrl,
      systemName: systemName || systemUrl,
      credentials: credentials || null,
      validationType: validationType || "full",
      status: "iniciado",
      createdAt: new Date(),
      ui: null,
      api: null,
      duration: null
    };

    validations.set(validationId, validation);

    res.json({
      success: true,
      validationId,
      message: "Validação iniciada com sucesso"
    });
  } catch (error) {
    console.error("Erro ao iniciar validação:", error);
    res.status(500).json({ error: error.message });
  }
}

// ═══════════════════════════════════════════════════
// UI DISCOVERY (Playwright)
// ═══════════════════════════════════════════════════
export async function discoverUI(req, res) {
  try {
    const { validationId, url, credentials } = req.body;

    if (!validationId || !validations.has(validationId)) {
      return res.status(404).json({ error: "Validação não encontrada" });
    }

    const validation = validations.get(validationId);
    validation.status = "descobrindo_ui";

    // Iniciar browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: "AxionIA-ValidationBot/1.0"
    });
    const page = await context.newPage();

    // Navegar para URL
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Login se credenciais fornecidas
    if (credentials && credentials.username && credentials.password) {
      try {
        // Tentar encontrar campos de login
        const usernameInput = await page.locator('input[type="text"], input[type="email"], input[name*="user"], input[id*="user"]').first();
        const passwordInput = await page.locator('input[type="password"]').first();
        const submitButton = await page.locator('button[type="submit"], input[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();

        if (await usernameInput.count() > 0) {
          await usernameInput.fill(credentials.username);
          await passwordInput.fill(credentials.password);
          await submitButton.click();
          await page.waitForLoadState("networkidle", { timeout: 10000 });
        }
      } catch (loginError) {
        console.warn("Erro ao fazer login automaticamente:", loginError.message);
      }
    }

    // Aguardar página carregar
    await page.waitForTimeout(2000);

    // Descobrir elementos
    const elements = {
      buttons: [],
      inputs: [],
      links: [],
      forms: [],
      selects: [],
      tables: []
    };

    // Botões
    const buttons = await page.locator('button, input[type="button"], input[type="submit"], [role="button"]').all();
    for (const btn of buttons) {
      try {
        const text = await btn.textContent();
        const isVisible = await btn.isVisible();
        const isEnabled = await btn.isEnabled();
        if (isVisible) {
          elements.buttons.push({
            selector: await getSelector(btn),
            text: text?.trim() || "",
            visible: isVisible,
            enabled: isEnabled
          });
        }
      } catch (e) {
        // Elemento pode ter sido removido
      }
    }

    // Inputs
    const inputs = await page.locator('input:not([type="hidden"]), textarea').all();
    for (const input of inputs) {
      try {
        const type = await input.getAttribute("type") || "text";
        const name = await input.getAttribute("name");
        const placeholder = await input.getAttribute("placeholder");
        const isVisible = await input.isVisible();
        if (isVisible) {
          elements.inputs.push({
            selector: await getSelector(input),
            type,
            name: name || "",
            placeholder: placeholder || "",
            visible: isVisible
          });
        }
      } catch (e) {
        // Elemento pode ter sido removido
      }
    }

    // Links
    const links = await page.locator('a[href]').all();
    for (const link of links.slice(0, 50)) { // Limitar para não sobrecarregar
      try {
        const href = await link.getAttribute("href");
        const text = await link.textContent();
        const isVisible = await link.isVisible();
        if (isVisible && href) {
          elements.links.push({
            selector: await getSelector(link),
            href,
            text: text?.trim() || "",
            visible: isVisible
          });
        }
      } catch (e) {
        // Elemento pode ter sido removido
      }
    }

    // Formulários
    const forms = await page.locator('form').all();
    for (const form of forms) {
      try {
        const action = await form.getAttribute("action");
        const method = await form.getAttribute("method");
        const isVisible = await form.isVisible();
        if (isVisible) {
          elements.forms.push({
            selector: await getSelector(form),
            action: action || "",
            method: method || "get",
            visible: isVisible
          });
        }
      } catch (e) {
        // Elemento pode ter sido removido
      }
    }

    // Selects
    const selects = await page.locator('select').all();
    for (const select of selects) {
      try {
        const name = await select.getAttribute("name");
        const isVisible = await select.isVisible();
        if (isVisible) {
          elements.selects.push({
            selector: await getSelector(select),
            name: name || "",
            visible: isVisible
          });
        }
      } catch (e) {
        // Elemento pode ter sido removido
      }
    }

    // Tabelas
    const tables = await page.locator('table').all();
    for (const table of tables) {
      try {
        const isVisible = await table.isVisible();
        const rows = await table.locator('tr').count();
        if (isVisible) {
          elements.tables.push({
            selector: await getSelector(table),
            rows,
            visible: isVisible
          });
        }
      } catch (e) {
        // Elemento pode ter sido removido
      }
    }

    // Capturar screenshot
    const screenshot = await page.screenshot({ fullPage: false });

    await browser.close();

    // Atualizar validação
    validation.ui = {
      totalElements: 
        elements.buttons.length + 
        elements.inputs.length + 
        elements.links.length + 
        elements.forms.length + 
        elements.selects.length +
        elements.tables.length,
      buttons: elements.buttons.length,
      inputs: elements.inputs.length,
      links: elements.links.length,
      forms: elements.forms.length,
      selects: elements.selects.length,
      tables: elements.tables.length,
      elements,
      screenshot: screenshot.toString("base64")
    };
    validation.status = "ui_descoberto";

    res.json({
      success: true,
      elements: elements,
      totalElements: validation.ui.totalElements
    });
  } catch (error) {
    console.error("Erro no UI Discovery:", error);
    res.status(500).json({ error: error.message });
  }
}

// Helper para obter seletor único
async function getSelector(element) {
  try {
    // Tentar obter ID
    const id = await element.getAttribute("id");
    if (id) return `#${id}`;

    // Tentar obter data-testid
    const testId = await element.getAttribute("data-testid");
    if (testId) return `[data-testid="${testId}"]`;

    // Tentar obter name
    const name = await element.getAttribute("name");
    if (name) {
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      return `${tagName}[name="${name}"]`;
    }

    // Fallback: usar classe
    const className = await element.getAttribute("class");
    if (className) {
      const firstClass = className.split(" ")[0];
      return `.${firstClass}`;
    }

    return "unknown";
  } catch (e) {
    return "unknown";
  }
}

// ═══════════════════════════════════════════════════
// API DISCOVERY (Analisador de rede)
// ═══════════════════════════════════════════════════
export async function discoverAPI(req, res) {
  try {
    const { validationId, url } = req.body;

    if (!validationId || !validations.has(validationId)) {
      return res.status(404).json({ error: "Validação não encontrada" });
    }

    const validation = validations.get(validationId);
    validation.status = "descobrindo_api";

    // Iniciar browser com captura de rede
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const endpoints = [];
    const apiCalls = new Map();

    // Escutar requisições de rede
    page.on("request", (request) => {
      const url = request.url();
      const method = request.method();
      
      // Filtrar apenas APIs (JSON, XMLHttpRequest, Fetch)
      if (
        url.includes("/api/") || 
        request.resourceType() === "xhr" || 
        request.resourceType() === "fetch"
      ) {
        const key = `${method}:${url}`;
        if (!apiCalls.has(key)) {
          apiCalls.set(key, {
            method,
            url,
            headers: request.headers(),
            postData: request.postData() || null
          });
        }
      }
    });

    // Navegar e aguardar rede
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(5000); // Aguardar possíveis lazy loads

    // Converter Map para Array
    apiCalls.forEach((call) => {
      endpoints.push(call);
    });

    await browser.close();

    // Classificar endpoints
    const getCount = endpoints.filter(e => e.method === "GET").length;
    const postCount = endpoints.filter(e => e.method === "POST").length;
    const putCount = endpoints.filter(e => e.method === "PUT").length;
    const deleteCount = endpoints.filter(e => e.method === "DELETE").length;

    // Atualizar validação
    validation.api = {
      totalEndpoints: endpoints.length,
      getCount,
      postCount,
      putCount,
      deleteCount,
      endpoints: endpoints.slice(0, 100) // Limitar resposta
    };
    validation.status = "api_descoberto";

    res.json({
      success: true,
      totalEndpoints: endpoints.length,
      getCount,
      postCount,
      endpoints: validation.api.endpoints
    });
  } catch (error) {
    console.error("Erro no API Discovery:", error);
    res.status(500).json({ error: error.message });
  }
}

// ═══════════════════════════════════════════════════
// GERAR RELATÓRIO
// ═══════════════════════════════════════════════════
export async function getReport(req, res) {
  try {
    const { id } = req.params;

    if (!validations.has(id)) {
      return res.status(404).json({ error: "Validação não encontrada" });
    }

    const validation = validations.get(id);
    
    // Calcular duração
    const duration = Math.round((Date.now() - validation.createdAt.getTime()) / 1000);
    validation.duration = `${duration}s`;
    validation.status = "concluído";

    res.json({
      success: true,
      ...validation
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    res.status(500).json({ error: error.message });
  }
}

// ═══════════════════════════════════════════════════
// LISTAR VALIDAÇÕES
// ═══════════════════════════════════════════════════
export async function listValidations(req, res) {
  try {
    const allValidations = Array.from(validations.values()).map(v => ({
      id: v.id,
      systemName: v.systemName,
      systemUrl: v.systemUrl,
      status: v.status,
      createdAt: v.createdAt,
      duration: v.duration
    }));

    res.json({
      success: true,
      total: allValidations.length,
      validations: allValidations
    });
  } catch (error) {
    console.error("Erro ao listar validações:", error);
    res.status(500).json({ error: error.message });
  }
}
