// Script de teste para debugar login do AxHub com Playwright
import { chromium } from 'playwright';

async function testLogin() {
  console.log('🎯 Iniciando teste de login...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Visível para debug
    slowMo: 1000 // Slow motion para ver o que acontece
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. Navegar para o sistema
    console.log('📍 Navegando para https://homologacao.axhub.axion.ws/');
    await page.goto('https://homologacao.axhub.axion.ws/', { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    console.log('✅ Página carregada');
    console.log(`   Título: ${await page.title()}`);
    console.log(`   URL: ${page.url()}\n`);
    
    // 2. Verificar se já está logado
    console.log('🔍 Verificando se já está logado...');
    const navCount = await page.locator('nav, navigation, .navbar, main, aside').count();
    console.log(`   Elementos de navegação encontrados: ${navCount}`);
    
    if (navCount > 0) {
      console.log('✅ JÁ ESTÁ LOGADO!\n');
      
      // Capturar screenshot
      await page.screenshot({ path: 'test-login-logged-in.png', fullPage: false });
      console.log('📸 Screenshot salvo: test-login-logged-in.png\n');
      
      await browser.close();
      return;
    }
    
    // 3. Procurar campos de login
    console.log('🔍 Procurando campos de login...');
    
    const usernameSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[name*="user"]',
      'input[name*="login"]',
      'input[id*="user"]',
      'input[id*="login"]',
      'input[placeholder*="Usuário"]',
      'input[placeholder*="Nome"]'
    ];
    
    let usernameField = null;
    for (const selector of usernameSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        usernameField = page.locator(selector).first();
        console.log(`   ✅ Campo usuário encontrado: ${selector}`);
        break;
      }
    }
    
    const passwordField = page.locator('input[type="password"]').first();
    const passwordCount = await passwordField.count();
    console.log(`   ${passwordCount > 0 ? '✅' : '❌'} Campo senha encontrado: ${passwordCount} campo(s)`);
    
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Entrar")').first();
    const buttonCount = await submitButton.count();
    console.log(`   ${buttonCount > 0 ? '✅' : '❌'} Botão submit encontrado: ${buttonCount} botão(ões)\n`);
    
    if (!usernameField || passwordCount === 0 || buttonCount === 0) {
      console.log('❌ Campos de login não encontrados!\n');
      await page.screenshot({ path: 'test-login-fields-not-found.png', fullPage: true });
      console.log('📸 Screenshot salvo: test-login-fields-not-found.png\n');
      await browser.close();
      return;
    }
    
    // 4. Preencher campos
    console.log('✍️  Preenchendo credenciais...');
    console.log('   Usuário: Admin');
    await usernameField.fill('Admin');
    await page.waitForTimeout(1000);
    
    console.log('   Senha: Labor#5383');
    await passwordField.fill('Labor#5383');
    await page.waitForTimeout(1000);
    
    // Capturar screenshot antes de clicar
    await page.screenshot({ path: 'test-login-before-submit.png', fullPage: false });
    console.log('📸 Screenshot salvo: test-login-before-submit.png\n');
    
    // 5. Verificar se botão está habilitado
    console.log('🔍 Verificando estado do botão...');
    const isDisabled = await submitButton.isDisabled();
    console.log(`   Botão desabilitado: ${isDisabled}`);
    
    if (isDisabled) {
      console.log('   ⏳ Aguardando botão habilitar...');
      try {
        await submitButton.waitFor({ state: 'enabled', timeout: 5000 });
        console.log('   ✅ Botão habilitado!');
      } catch (e) {
        console.log('   ⚠️  Botão não habilitou, tentando clicar mesmo assim...');
      }
    }
    
    // 6. Submeter login
    console.log('\n🚀 Clicando no botão Entrar...');
    await submitButton.click();
    console.log('   ✅ Clique executado');
    
    // 7. Aguardar navegação
    console.log('\n⏳ Aguardando navegação...');
    try {
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      console.log('   ✅ Navegação completa');
    } catch (e) {
      console.log('   ⚠️  Timeout no networkidle, continuando...');
    }
    
    await page.waitForTimeout(3000);
    
    // 8. Verificar resultado
    console.log('\n🔍 Verificando resultado do login...');
    console.log(`   URL atual: ${page.url()}`);
    console.log(`   Título: ${await page.title()}`);
    
    const navCountAfter = await page.locator('nav, navigation, .navbar, main, aside').count();
    console.log(`   Elementos de navegação: ${navCountAfter}`);
    
    const errorMessages = await page.locator('.alert-danger, .error, [role="alert"]').count();
    console.log(`   Mensagens de erro: ${errorMessages}`);
    
    if (navCountAfter > 0 && errorMessages === 0) {
      console.log('\n✅ LOGIN BEM-SUCEDIDO!\n');
      await page.screenshot({ path: 'test-login-success.png', fullPage: false });
      console.log('📸 Screenshot salvo: test-login-success.png\n');
    } else {
      console.log('\n❌ LOGIN FALHOU!\n');
      
      // Capturar texto de erro se houver
      if (errorMessages > 0) {
        const errorText = await page.locator('.alert-danger, .error, [role="alert"]').first().textContent();
        console.log(`   Erro: ${errorText.trim()}\n`);
      }
      
      await page.screenshot({ path: 'test-login-failed.png', fullPage: true });
      console.log('📸 Screenshot salvo: test-login-failed.png\n');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    await page.screenshot({ path: 'test-login-error.png', fullPage: true });
    console.log('📸 Screenshot de erro salvo: test-login-error.png\n');
  }
  
  console.log('⏱️  Aguardando 5 segundos antes de fechar...');
  await page.waitForTimeout(5000);
  
  await browser.close();
  console.log('✅ Teste concluído!');
}

testLogin();
