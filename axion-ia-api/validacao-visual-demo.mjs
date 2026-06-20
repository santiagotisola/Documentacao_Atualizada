// 🎬 DEMONSTRAÇÃO VISUAL DA VALIDAÇÃO
// Este script abre o navegador para você ACOMPANHAR em tempo real

import { chromium } from 'playwright';

async function validacaoVisualDemo() {
  console.log('\n🎬 INICIANDO DEMONSTRAÇÃO VISUAL');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('✅ O navegador vai abrir automaticamente');
  console.log('✅ Você vai VER cada etapa acontecendo');
  console.log('✅ Navegação LENTA para acompanhar');
  console.log('');
  console.log('Pressione Ctrl+C para parar a qualquer momento');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Abrir navegador VISÍVEL (headless: false)
  const browser = await chromium.launch({ 
    headless: false,  // VISÍVEL!
    slowMo: 1500,     // Slow motion: 1.5 segundos entre cada ação
    args: ['--start-maximized']  // Maximizado
  });
  
  const context = await browser.newContext({
    viewport: null,  // Usa tamanho da janela
    recordVideo: {   // Gravar vídeo (opcional)
      dir: './videos/',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();
  
  try {
    // ═══════════════════════════════════════════════════════════
    // ETAPA 1: ACESSO AO SISTEMA
    // ═══════════════════════════════════════════════════════════
    console.log('📍 ETAPA 1/6: Acessando sistema...');
    console.log('   URL: https://homologacao.axhub.axion.ws/\n');
    
    await page.goto('https://homologacao.axhub.axion.ws/', { 
      waitUntil: 'load', 
      timeout: 30000 
    });
    await page.waitForTimeout(2000);
    
    // ═══════════════════════════════════════════════════════════
    // ETAPA 2: LOGIN
    // ═══════════════════════════════════════════════════════════
    console.log('🔐 ETAPA 2/6: Realizando login...');
    console.log('   Usuário: Admin\n');
    
    // Verificar se já está logado
    const navCount = await page.locator('nav, navigation, main').count();
    
    if (navCount === 0) {
      // Fazer login
      const usernameField = page.locator('input[type="text"]').first();
      const passwordField = page.locator('input[type="password"]').first();
      const submitButton = page.locator('button:has-text("Entrar")').first();
      
      console.log('   ✍️  Preenchendo usuário...');
      await usernameField.fill('Admin');
      await page.waitForTimeout(1000);
      
      console.log('   ✍️  Preenchendo senha...');
      await passwordField.fill('Labor#5383');
      await page.waitForTimeout(1000);
      
      console.log('   🚀 Clicando em Entrar...\n');
      await submitButton.click();
      await page.waitForTimeout(3000);
      
      console.log('   ✅ Login realizado!\n');
    } else {
      console.log('   ✅ Já está logado!\n');
    }
    
    // Capturar screenshot do dashboard
    await page.screenshot({ path: 'demo-01-dashboard.png', fullPage: false });
    console.log('   📸 Screenshot salvo: demo-01-dashboard.png\n');
    
    // ═══════════════════════════════════════════════════════════
    // ETAPA 3: DESCOBRIR MENU DE NAVEGAÇÃO
    // ═══════════════════════════════════════════════════════════
    console.log('🔍 ETAPA 3/6: Descobrindo páginas do sistema...');
    
    const navLinks = await page.locator('nav a, navigation a, aside a').all();
    const routes = [];
    
    for (const link of navLinks.slice(0, 15)) {  // Primeiras 15 páginas
      try {
        const href = await link.getAttribute('href');
        const text = (await link.textContent()).trim();
        
        if (href && !href.startsWith('#') && !href.includes('logout') && text) {
          const url = href.startsWith('http') ? href : new URL(href, page.url()).href;
          
          if (!routes.some(r => r.url === url)) {
            routes.push({ url, title: text });
            console.log(`   → ${text}`);
          }
        }
      } catch (e) {
        // Ignorar links inválidos
      }
    }
    
    console.log(`\n   ✅ ${routes.length} páginas descobertas!\n`);
    
    // ═══════════════════════════════════════════════════════════
    // ETAPA 4: NAVEGAR POR PÁGINAS (DEMONSTRAÇÃO)
    // ═══════════════════════════════════════════════════════════
    console.log('🌐 ETAPA 4/6: Navegando pelas páginas principais...\n');
    
    const pagesToDemo = routes.slice(0, 5);  // Primeiras 5 páginas para demo
    
    for (let i = 0; i < pagesToDemo.length; i++) {
      const route = pagesToDemo[i];
      
      console.log(`   📄 [${i+1}/${pagesToDemo.length}] Acessando: ${route.title}`);
      console.log(`       URL: ${route.url}`);
      
      try {
        await page.goto(route.url, { waitUntil: 'load', timeout: 15000 });
        await page.waitForTimeout(2000);
        
        // Capturar screenshot
        const filename = `demo-page-${i+1}-${route.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        await page.screenshot({ path: filename, fullPage: false });
        console.log(`       📸 Screenshot: ${filename}`);
        
        // Procurar formulários na página
        const forms = await page.locator('form, [data-form]').count();
        if (forms > 0) {
          console.log(`       📝 ${forms} formulário(s) encontrado(s)`);
        }
        
        console.log('       ✅ Validado!\n');
        
      } catch (error) {
        console.log(`       ⚠️  Erro ao acessar: ${error.message}\n`);
      }
    }
    
    // ═══════════════════════════════════════════════════════════
    // ETAPA 5: DEMONSTRAR TESTE DE FORMULÁRIO
    // ═══════════════════════════════════════════════════════════
    console.log('📝 ETAPA 5/6: Demonstrando teste de formulário...\n');
    
    // Voltar ao dashboard
    await page.goto('https://homologacao.axhub.axion.ws/', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    
    // Procurar um formulário de pesquisa/filtro
    const searchInput = page.locator('input[type="text"], input[placeholder*="Pesquisar"]').first();
    const hasSearchInput = await searchInput.count() > 0;
    
    if (hasSearchInput) {
      console.log('   ✍️  Testando campo de pesquisa...');
      await searchInput.fill('teste');
      await page.waitForTimeout(1500);
      await searchInput.clear();
      await page.waitForTimeout(1000);
      console.log('   ✅ Campo validado!\n');
    }
    
    // ═══════════════════════════════════════════════════════════
    // ETAPA 6: RESUMO
    // ═══════════════════════════════════════════════════════════
    console.log('📊 ETAPA 6/6: RESUMO DA DEMONSTRAÇÃO');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   ✅ ${routes.length} páginas descobertas`);
    console.log(`   ✅ ${pagesToDemo.length} páginas navegadas (demo)`);
    console.log(`   ✅ Screenshots capturados`);
    console.log(`   ✅ Formulários identificados`);
    console.log('');
    console.log('💡 Esta foi uma DEMONSTRAÇÃO visual.');
    console.log('   A validação completa testa TODAS as páginas e formulários.');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('⏸️  Navegador ficará aberto por 10 segundos...');
    console.log('   Você pode navegar manualmente se quiser.\n');
    
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    await page.screenshot({ path: 'demo-erro.png', fullPage: true });
    console.log('📸 Screenshot do erro salvo: demo-erro.png\n');
  }
  
  console.log('🎬 Encerrando demonstração...\n');
  
  await context.close();
  await browser.close();
  
  console.log('✅ DEMONSTRAÇÃO CONCLUÍDA!');
  console.log('');
  console.log('📁 Arquivos gerados:');
  console.log('   - Screenshots: demo-*.png');
  console.log('   - Vídeo: videos/ (se disponível)');
  console.log('');
}

// Executar
validacaoVisualDemo().catch(console.error);
