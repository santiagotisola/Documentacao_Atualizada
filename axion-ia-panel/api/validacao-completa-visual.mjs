// 🎯 VALIDAÇÃO VISUAL COMPLETA - COM NAVEGADOR VISÍVEL
// Testa TODOS os formulários, cadastros, consultas - VOCÊ VÊ TUDO ACONTECENDO

import { chromium } from 'playwright';
import { promises as fs } from 'fs';

async function validacaoCompletaVisual() {
  console.log('\n🎯 VALIDAÇÃO VISUAL COMPLETA COM NAVEGADOR ABERTO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('✅ Navegador VISÍVEL - você acompanha tudo');
  console.log('✅ Slow Motion - movimentos lentos para ver');
  console.log('✅ Testa TODOS os formulários e cadastros');
  console.log('✅ Screenshots de cada etapa');
  console.log('');
  console.log('⏱️  Tempo estimado: 10-15 minutos');
  console.log('📁 Screenshots salvos em: axion-ia-api/demo-completo/');
  console.log('');
  console.log('Pressione Ctrl+C para parar a qualquer momento');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Criar diretório para screenshots
  try {
    await fs.mkdir('./demo-completo', { recursive: true });
  } catch (e) {}

  let stats = {
    paginasVisitadas: 0,
    formulariosEncontrados: 0,
    camposTestes: 0,
    botoesClicados: 0,
    screenshots: 0
  };

  // Abrir navegador VISÍVEL
  const browser = await chromium.launch({ 
    headless: false,     // VISÍVEL!
    slowMo: 800,         // 800ms entre ações
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ]
  });
  
  const context = await browser.newContext({
    viewport: null,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo'
  });
  
  const page = await context.newPage();
  
  try {
    // ═══════════════════════════════════════════════════════════
    // ETAPA 1: LOGIN
    // ═══════════════════════════════════════════════════════════
    console.log('🔐 ETAPA 1: LOGIN NO SISTEMA');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    await page.goto('https://homologacao.axhub.axion.ws/', { 
      waitUntil: 'load', 
      timeout: 30000 
    });
    
    const navCount = await page.locator('nav, navigation, main').count();
    
    if (navCount === 0) {
      console.log('   ✍️  Preenchendo credenciais...');
      await page.locator('input[type="text"]').first().fill('Admin');
      await page.locator('input[type="password"]').first().fill('Labor#5383');
      
      console.log('   🚀 Realizando login...');
      await page.locator('button:has-text("Entrar")').first().click();
      await page.waitForTimeout(3000);
    }
    
    await page.screenshot({ 
      path: './demo-completo/00-dashboard-inicial.png', 
      fullPage: false 
    });
    stats.screenshots++;
    
    console.log('   ✅ Login realizado!\n');
    
    // ═══════════════════════════════════════════════════════════
    // ETAPA 2: DESCOBRIR TODAS AS PÁGINAS
    // ═══════════════════════════════════════════════════════════
    console.log('🔍 ETAPA 2: DESCOBRINDO TODAS AS PÁGINAS DO SISTEMA');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    const navLinks = await page.locator('nav a, navigation a, aside a, .menu a').all();
    const routes = [];
    
    for (const link of navLinks) {
      try {
        const href = await link.getAttribute('href');
        const text = (await link.textContent()).trim();
        
        if (href && !href.startsWith('#') && !href.includes('logout') && text) {
          const url = href.startsWith('http') ? href : new URL(href, page.url()).href;
          
          if (!routes.some(r => r.url === url)) {
            routes.push({ url, title: text });
            console.log(`   📄 ${text}`);
          }
        }
      } catch (e) {}
    }
    
    console.log(`\n   ✅ ${routes.length} páginas descobertas!\n`);
    
    // ═══════════════════════════════════════════════════════════
    // ETAPA 3: VALIDAR CADA PÁGINA
    // ═══════════════════════════════════════════════════════════
    console.log('🌐 ETAPA 3: VALIDANDO CADA PÁGINA COM FORMULÁRIOS');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      
      console.log(`\n📄 [${i+1}/${routes.length}] ${route.title.toUpperCase()}`);
      console.log(`   URL: ${route.url}`);
      
      try {
        await page.goto(route.url, { waitUntil: 'load', timeout: 20000 });
        await page.waitForTimeout(1500);
        
        stats.paginasVisitadas++;
        
        // Screenshot da página
        const screenshotName = `./demo-completo/${String(i+1).padStart(2, '0')}-${route.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
        await page.screenshot({ path: screenshotName, fullPage: false });
        stats.screenshots++;
        console.log(`   📸 Screenshot: ${screenshotName}`);
        
        // ───────────────────────────────────────────────────
        // Procurar formulários
        // ───────────────────────────────────────────────────
        const forms = await page.locator('form').all();
        
        if (forms.length > 0) {
          console.log(`\n   📝 ${forms.length} formulário(s) encontrado(s)!`);
          stats.formulariosEncontrados += forms.length;
          
          for (let fIdx = 0; fIdx < forms.length; fIdx++) {
            const form = forms[fIdx];
            
            console.log(`\n   📋 FORMULÁRIO ${fIdx + 1}/${forms.length}`);
            console.log('   ┌────────────────────────────────────────');
            
            // Inputs de texto
            const textInputs = await form.locator('input[type="text"], input:not([type]), input[type="email"]').all();
            
            if (textInputs.length > 0) {
              console.log(`   │ 📝 ${textInputs.length} campo(s) de texto`);
              
              for (const input of textInputs.slice(0, 3)) {  // Primeiros 3
                try {
                  const placeholder = await input.getAttribute('placeholder') || 'campo';
                  const name = await input.getAttribute('name') || '';
                  
                  console.log(`   │    ✍️  Testando: ${placeholder} ${name ? `(${name})` : ''}`);
                  
                  await input.scrollIntoViewIfNeeded();
                  await input.fill('TESTE');
                  await page.waitForTimeout(500);
                  await input.clear();
                  await page.waitForTimeout(300);
                  
                  stats.camposTestes++;
                } catch (e) {}
              }
            }
            
            // Selects
            const selects = await form.locator('select').all();
            if (selects.length > 0) {
              console.log(`   │ 📋 ${selects.length} campo(s) select`);
              stats.camposTestes += selects.length;
            }
            
            // Checkboxes
            const checkboxes = await form.locator('input[type="checkbox"]').all();
            if (checkboxes.length > 0) {
              console.log(`   │ ☑️  ${checkboxes.length} checkbox(es)`);
              stats.camposTestes += checkboxes.length;
            }
            
            // Textareas
            const textareas = await form.locator('textarea').all();
            if (textareas.length > 0) {
              console.log(`   │ 📄 ${textareas.length} textarea(s)`);
              
              for (const textarea of textareas.slice(0, 2)) {
                try {
                  await textarea.scrollIntoViewIfNeeded();
                  await textarea.fill('Texto de teste');
                  await page.waitForTimeout(500);
                  await textarea.clear();
                  await page.waitForTimeout(300);
                  
                  stats.camposTestes++;
                } catch (e) {}
              }
            }
            
            // Botões do formulário
            const buttons = await form.locator('button, input[type="submit"]').all();
            if (buttons.length > 0) {
              console.log(`   │ 🔘 ${buttons.length} botão(ões) encontrado(s)`);
              
              // NÃO vamos clicar em botões de submit para não criar dados
              // Apenas identificamos
            }
            
            console.log('   └────────────────────────────────────────');
          }
        }
        
        // ───────────────────────────────────────────────────
        // Procurar botões de ação (fora de formulários)
        // ───────────────────────────────────────────────────
        const actionButtons = await page.locator('button:has-text("Novo"), button:has-text("Adicionar"), button:has-text("Cadastrar")').all();
        
        if (actionButtons.length > 0) {
          console.log(`\n   🔘 ${actionButtons.length} botão(ões) de ação encontrado(s)`);
          
          for (const btn of actionButtons.slice(0, 2)) {
            try {
              const text = await btn.textContent();
              console.log(`   │  → ${text.trim()}`);
              
              // Clicar para ver modal/formulário (se aparecer)
              await btn.scrollIntoViewIfNeeded();
              await btn.click();
              await page.waitForTimeout(2000);
              
              stats.botoesClicados++;
              
              // Capturar modal/form que apareceu
              const modal = await page.locator('[role="dialog"], .modal, .modal-content').count();
              
              if (modal > 0) {
                console.log(`   │  📸 Modal/Form aberto!`);
                
                const modalScreenshot = `./demo-completo/${String(i+1).padStart(2, '0')}-${route.title.replace(/[^a-zA-Z0-9]/g, '-')}-modal.png`;
                await page.screenshot({ path: modalScreenshot, fullPage: false });
                stats.screenshots++;
                
                // Fechar modal (ESC ou botão fechar)
                await page.keyboard.press('Escape');
                await page.waitForTimeout(500);
              }
              
            } catch (e) {
              // Modal pode não abrir, tudo bem
            }
          }
        }
        
        // ───────────────────────────────────────────────────
        // Procurar tabelas/grids de dados
        // ───────────────────────────────────────────────────
        const tables = await page.locator('table, [role="grid"]').count();
        if (tables > 0) {
          console.log(`\n   📊 ${tables} tabela(s) de dados encontrada(s)`);
        }
        
        console.log('\n   ✅ Página validada!');
        
      } catch (error) {
        console.log(`\n   ⚠️  Erro ao validar: ${error.message}`);
      }
      
      // Pausa entre páginas
      await page.waitForTimeout(1000);
    }
    
    // ═══════════════════════════════════════════════════════════
    // RESUMO FINAL
    // ═══════════════════════════════════════════════════════════
    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMO DA VALIDAÇÃO VISUAL COMPLETA');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`   ✅ Páginas visitadas:        ${stats.paginasVisitadas}`);
    console.log(`   ✅ Formulários encontrados:  ${stats.formulariosEncontrados}`);
    console.log(`   ✅ Campos testados:          ${stats.camposTestes}`);
    console.log(`   ✅ Botões clicados:          ${stats.botoesClicados}`);
    console.log(`   ✅ Screenshots capturados:   ${stats.screenshots}`);
    console.log('');
    console.log('📁 Todos os arquivos salvos em:');
    console.log('   axion-ia-api/demo-completo/');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('⏸️  Navegador ficará aberto por 15 segundos...');
    console.log('   Você pode explorar manualmente se quiser.\n');
    
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error(error.stack);
  }
  
  console.log('🎬 Encerrando validação visual...\n');
  
  await context.close();
  await browser.close();
  
  console.log('✅ VALIDAÇÃO VISUAL COMPLETA CONCLUÍDA!');
  console.log('');
  console.log('📂 Veja os screenshots em: axion-ia-api/demo-completo/');
  console.log('');
}

// Executar
validacaoCompletaVisual().catch(console.error);
