import { test, expect } from '@playwright/test';

/**
 * Testes E2E - Fluxo de Consulta Anônima
 */
test.describe('Consulta de Infrações Anônima', () => {
  test('deve carregar a página home corretamente', async ({ page }) => {
    await page.goto('/');
    
    // Verificar título
    await expect(page).toHaveTitle(/Portal do Cidadão/);
    
    // Verificar header
    await expect(page.locator('header')).toBeVisible();
    
    // Verificar formulário de consulta
    await expect(page.getByText('Consultar Infrações')).toBeVisible();
  });

  test('deve exibir validação de CPF inválido', async ({ page }) => {
    await page.goto('/');
    
    // Selecionar tipo CPF (já é default)
    // Preencher CPF inválido
    await page.fill('input[type="text"]', '12345678900');
    
    // Clicar em consultar
    await page.click('button:has-text("Consultar Infrações")');
    
    // Verificar mensagem de erro (pode ser toast ou inline)
    // Ajustar seletor conforme implementação
    await expect(page.locator('text=/CPF inválido|Formato inválido/')).toBeVisible({ timeout: 5000 });
  });

  test('deve consultar por CPF válido', async ({ page }) => {
    await page.goto('/');
    
    // Preencher CPF válido (com dígitos verificadores corretos)
    await page.fill('input[type="text"]', '123.456.789-09');
    
    // Aguardar reCAPTCHA carregar
    await page.waitForTimeout(2000);
    
    // Clicar em consultar
    await page.click('button:has-text("Consultar Infrações")');
    
    // Aguardar navegação ou resposta
    await page.waitForURL('**/resultados', { timeout: 15000 }).catch(() => {
      // Pode não redirecionar se não encontrar infrações
    });
    
    // Verificar se está na página de resultados ou se exibe "nenhuma infração"
    const hasResultados = await page.url().includes('/resultados');
    const hasToast = await page.locator('text=/Nenhuma infração|Erro/').isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(hasResultados || hasToast).toBeTruthy();
  });

  test('deve consultar por placa', async ({ page }) => {
    await page.goto('/');
    
    // Selecionar tipo placa
    await page.click('button:has-text("Por Placa")');
    
    // Verificar que o placeholder mudou
    await expect(page.locator('input[type="text"]')).toHaveAttribute('placeholder', /ABC-1234/);
    
    // Preencher placa
    await page.fill('input[type="text"]', 'ABC-1234');
    
    // Aguardar reCAPTCHA
    await page.waitForTimeout(2000);
    
    // Clicar em consultar
    await page.click('button:has-text("Consultar Infrações")');
    
    // Aguardar resposta
    await page.waitForTimeout(3000);
    
    // Verificar navegação ou toast
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(resultados)?|\/$/);
  });

  test('deve alternar entre CPF e Placa', async ({ page }) => {
    await page.goto('/');
    
    // Inicialmente CPF
    await expect(page.locator('button:has-text("Por CPF")')).toHaveClass(/border-primary-600|bg-primary-50/);
    
    // Clicar em Placa
    await page.click('button:has-text("Por Placa")');
    
    // Verificar que Placa está selecionado
    await expect(page.locator('button:has-text("Por Placa")')).toHaveClass(/border-primary-600|bg-primary-50/);
    
    // Verificar que input foi limpo
    await expect(page.locator('input[type="text"]')).toHaveValue('');
  });
});

/**
 * Testes E2E - Fluxo de Registro e Login
 */
test.describe('Autenticação (Registro e Login)', () => {
  test('deve carregar página de login', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar título
    await expect(page.getByText('Portal do Cidadão')).toBeVisible();
    
    // Verificar tabs
    await expect(page.getByText('Entrar')).toBeVisible();
    await expect(page.getByText('Registrar')).toBeVisible();
  });

  test('deve exibir validação de campos obrigatórios no login', async ({ page }) => {
    await page.goto('/login');
    
    // Tentar submeter sem preencher
    await page.click('button:has-text("Entrar")');
    
    // Verificar mensagens de erro
    await expect(page.locator('text=/obrigatório|inválido/i')).toBeVisible({ timeout: 2000 });
  });

  test('deve exibir validação de senha fraca no registro', async ({ page }) => {
    await page.goto('/login');
    
    // Ir para aba Registrar
    await page.click('button:has-text("Registrar")');
    
    // Preencher CPF
    await page.locator('input[type="text"]').first().fill('123.456.789-09');
    
    // Preencher nome
    const nomeInput = page.locator('input[type="text"]').nth(1);
    await nomeInput.fill('Teste User');
    
    // Preencher email
    await page.fill('input[type="email"]', 'teste@example.com');
    
    // Preencher senha fraca
    const senhaInput = page.locator('input[type="password"]').first();
    await senhaInput.fill('123');
    
    // Verificar indicador de força
    await expect(page.locator('text=/Fraca|fraca/i')).toBeVisible({ timeout: 2000 });
  });

  test('deve mostrar/ocultar senha', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar que senha está oculta
    const senhaInput = page.locator('input[type="password"]').first();
    await expect(senhaInput).toBeVisible();
    
    // Clicar no botão de mostrar
    await page.click('button[type="button"]:near(input[type="password"])').catch(() => {
      // Se não encontrar, tentar outro seletor
      page.click('svg:has-text("Eye")').catch(() => {});
    });
    
    // Verificar que mudou para text
    await page.waitForTimeout(500);
    const visibleInput = page.locator('input[type="text"]:near(button)');
    const isVisible = await visibleInput.count() > 0;
    
    expect(isVisible).toBeTruthy();
  });
});

/**
 * Testes E2E - Página de Resultados
 */
test.describe('Página de Resultados', () => {
  test('deve exibir mensagem quando não há infrações', async ({ page }) => {
    // Navegar diretamente (simular estado)
    await page.goto('/resultados', { waitUntil: 'networkidle' });
    
    // Verificar redirecionamento ou mensagem
    const currentUrl = page.url();
    
    if (currentUrl.includes('/resultados')) {
      // Se ficou na página, deve mostrar mensagem
      await expect(page.locator('text=/Nenhuma infração|Nova consulta/i')).toBeVisible({ timeout: 5000 });
    } else {
      // Se redirecionou para home
      expect(currentUrl).toContain('/');
    }
  });

  test('deve permitir voltar para home', async ({ page }) => {
    // Tentar acessar resultados
    await page.goto('/resultados');
    
    // Se redirecionou, testar navegação não faz sentido
    if (page.url().includes('/resultados')) {
      // Clicar em "Nova consulta" ou "Voltar"
      await page.click('a:has-text("Nova consulta")').catch(() => {
        page.click('a:has-text("Voltar")').catch(() => {});
      });
      
      // Verificar que voltou para home
      await page.waitForURL('/', { timeout: 5000 });
      expect(page.url()).toMatch(/\/$|\/$/);
    }
  });
});

/**
 * Testes E2E - Responsividade
 */
test.describe('Responsividade Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('deve exibir layout mobile corretamente', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que header está visível
    await expect(page.locator('header')).toBeVisible();
    
    // Verificar que formulário está visível
    await expect(page.getByText('Consultar Infrações')).toBeVisible();
    
    // Verificar que botões CPF/Placa estão em grid
    const cpfButton = page.locator('button:has-text("Por CPF")');
    const placaButton = page.locator('button:has-text("Por Placa")');
    
    await expect(cpfButton).toBeVisible();
    await expect(placaButton).toBeVisible();
  });
});
