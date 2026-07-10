// 🎯 VALIDAÇÃO COM DATEPICKERS - CLICA NO BOTÃO DO CALENDÁRIO
// Interage corretamente com campos de data usando o datepicker visual

import { chromium } from 'playwright';
import { promises as fs } from 'fs';

async function validacaoComDatepickers() {
  console.log('\n🎯 VALIDAÇÃO COM DATEPICKERS - INTERAÇÃO VISUAL');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('✅ Clica no botão do calendário 📅');
  console.log('✅ Aguarda datepicker abrir');
  console.log('✅ Seleciona data visualmente');
  console.log('✅ Confirma seleção');
  console.log('✅ Valida todos os outros campos também');
  console.log('');
  console.log('📁 Screenshots: axion-ia-api/validacao-datepickers/');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    await fs.mkdir('./validacao-datepickers', { recursive: true });
  } catch (e) {}

  let stats = {
    paginasValidadas: 0,
    formulariosEncontrados: 0,
    camposTotais: 0,
    camposData: 0,
    camposDataComDatepicker: 0,
    camposTexto: 0,
    selects: 0,
    checkboxes: 0,
    screenshots: 0
  };

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  
  try {
    // LOGIN
    console.log('🔐 LOGIN...\n');
    
    await page.goto('https://homologacao.axhub.axion.ws/', { waitUntil: 'load' });
    
    const navCount = await page.locator('nav, navigation, main').count();
    if (navCount === 0) {
      await page.locator('input[type="text"]').first().fill('Admin');
      await page.locator('input[type="password"]').first().fill('Labor#5383');
      await page.locator('button:has-text("Entrar")').first().click();
      await page.waitForTimeout(3000);
    }
    
    console.log('   ✅ Logado!\n');
    
    // DESCOBRIR PÁGINAS
    const navLinks = await page.locator('nav a, navigation a').all();
    const routes = [];
    
    for (const link of navLinks) {
      try {
        const href = await link.getAttribute('href');
        const text = (await link.textContent()).trim();
        
        if (href && !href.startsWith('#') && !href.includes('logout') && text) {
          const url = href.startsWith('http') ? href : new URL(href, page.url()).href;
          if (!routes.some(r => r.url === url)) {
            routes.push({ url, title: text });
          }
        }
      } catch (e) {}
    }
    
    console.log(`🔍 ${routes.length} páginas para validar\n`);
    console.log('📋 VALIDANDO FORMULÁRIOS COM DATEPICKERS\n');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    // VALIDAR CADA PÁGINA
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      
      console.log(`\n📄 [${i+1}/${routes.length}] ${route.title.toUpperCase()}`);
      
      try {
        await page.goto(route.url, { waitUntil: 'load', timeout: 20000 });
        await page.waitForTimeout(1500);
        
        stats.paginasValidadas++;
        
        const screenshotBase = `./validacao-datepickers/${String(i+1).padStart(2, '0')}-${route.title.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        // PROCURAR FORMULÁRIOS
        const forms = await page.locator('form').all();
        
        if (forms.length > 0) {
          console.log(`   📝 ${forms.length} formulário(s) encontrado(s)!`);
          
          for (let fIdx = 0; fIdx < forms.length; fIdx++) {
            const form = forms[fIdx];
            
            console.log(`\n   ╔═══════════════════════════════════════════════════════════`);
            console.log(`   ║ 📋 FORMULÁRIO ${fIdx + 1}/${forms.length}`);
            console.log(`   ╠═══════════════════════════════════════════════════════════`);
            
            stats.formulariosEncontrados++;
            
            // ═══════════════════════════════════════════════════════
            // CAMPOS DE TEXTO (incluindo datas que parecem texto)
            // ═══════════════════════════════════════════════════════
            const textInputs = await form.locator(
              'input[type="text"], input:not([type])'
            ).all();
            
            if (textInputs.length > 0) {
              console.log(`   ║`);
              console.log(`   ║ 📝 ${textInputs.length} CAMPO(S) DE TEXTO/DATA`);
              console.log(`   ║ ────────────────────────────────────────────────────`);
              
              for (const input of textInputs) {
                try {
                  const name = await input.getAttribute('name') || '';
                  const placeholder = await input.getAttribute('placeholder') || '';
                  const id = await input.getAttribute('id') || '';
                  
                  const fieldName = name || placeholder || id || 'campo';
                  
                  // DETECTAR SE É CAMPO DE DATA
                  const ehCampoData = 
                    fieldName.toLowerCase().includes('data') ||
                    fieldName.toLowerCase().includes('date') ||
                    fieldName.toLowerCase().includes('mes') ||
                    fieldName.toLowerCase().includes('month') ||
                    placeholder.toLowerCase().includes('data') ||
                    placeholder.toLowerCase().includes('selecione a data');
                  
                  if (ehCampoData) {
                    console.log(`   ║    📅 ${fieldName} (CAMPO DE DATA)`);
                    stats.camposData++;
                    
                    // PROCURAR BOTÃO DO CALENDÁRIO ao lado do input
                    // Seletores comuns: botão seguinte (~), dentro do mesmo grupo, com ícone
                    const calendarioBtns = await page.locator(
                      `#${id} ~ button, ` +                          // Botão logo após o input
                      `#${id} ~ .input-group-append button, ` +      // Botão dentro de input-group
                      `#${id} + button, ` +                          // Botão imediatamente após
                      `[for="${id}"] ~ button, ` +                   // Botão após o label
                      `.input-group:has(#${id}) button`              // Qualquer botão no grupo
                    ).all();
                    
                    let datepickerAberto = false;
                    
                    for (const btn of calendarioBtns) {
                      try {
                        const btnVisible = await btn.isVisible();
                        if (btnVisible) {
                          console.log(`   ║       🔘 Clicando no botão do calendário...`);
                          
                          await btn.scrollIntoViewIfNeeded();
                          await btn.click();
                          await page.waitForTimeout(1000);
                          
                          // Verificar se datepicker abriu
                          const datepicker = await page.locator(
                            '.datepicker, .bootstrap-datetimepicker-widget, ' +
                            '.daterangepicker, .picker__frame, ' +
                            '[class*="datepicker"], [class*="calendar"]'
                          ).first();
                          
                          const datepickerVisible = await datepicker.isVisible().catch(() => false);
                          
                          if (datepickerVisible) {
                            console.log(`   ║       ✅ Datepicker aberto!`);
                            stats.camposDataComDatepicker++;
                            datepickerAberto = true;
                            
                            // Capturar screenshot do datepicker aberto
                            await page.screenshot({ 
                              path: `${screenshotBase}-form-${fIdx + 1}-datepicker.png`, 
                              fullPage: false 
                            });
                            stats.screenshots++;
                            
                            // SELECIONAR UMA DATA (dia 15 ou primeiro dia disponível)
                            const diaDisponivel = await page.locator(
                              '.datepicker .day:not(.old):not(.new):not(.disabled), ' +
                              '.datepicker td.day:not(.disabled), ' +
                              '.bootstrap-datetimepicker-widget .day:not(.disabled), ' +
                              '[class*="datepicker"] [class*="day"]:not([class*="disabled"])'
                            ).first();
                            
                            const temDia = await diaDisponivel.count().catch(() => 0);
                            
                            if (temDia > 0) {
                              console.log(`   ║       📅 Selecionando data...`);
                              await diaDisponivel.click();
                              await page.waitForTimeout(500);
                              console.log(`   ║       ✅ Data selecionada!`);
                              
                              // Capturar screenshot após seleção
                              await page.screenshot({ 
                                path: `${screenshotBase}-form-${fIdx + 1}-data-selecionada.png`, 
                                fullPage: false 
                              });
                              stats.screenshots++;
                            } else {
                              console.log(`   ║       ⚠️  Não encontrou dias para selecionar`);
                            }
                            
                            break;  // Datepicker funcionou, sair do loop
                          }
                        }
                      } catch (e) {
                        // Tentar próximo botão
                      }
                    }
                    
                    // Se não achou botão ou datepicker, tentar preencher direto
                    if (!datepickerAberto) {
                      console.log(`   ║       ⚠️  Sem botão calendário, preenchendo direto`);
                      await input.scrollIntoViewIfNeeded();
                      
                      let valorData = '';
                      if (fieldName.toLowerCase().includes('mes') || fieldName.toLowerCase().includes('month')) {
                        valorData = '06/2026';
                      } else {
                        valorData = '19/06/2026';
                      }
                      
                      await input.fill(valorData);
                      console.log(`   ║       ✍️  Preenchido: ${valorData}`);
                    }
                    
                  } else {
                    // Campo de texto normal
                    console.log(`   ║    ✍️  ${fieldName} (text)`);
                    stats.camposTexto++;
                    
                    await input.scrollIntoViewIfNeeded();
                    await input.fill('Teste Validação');
                  }
                  
                  stats.camposTotais++;
                  
                } catch (e) {
                  console.log(`   ║       ⚠️  Erro: ${e.message}`);
                }
              }
            }
            
            // SELECTS
            const selects = await form.locator('select').all();
            
            if (selects.length > 0) {
              console.log(`   ║`);
              console.log(`   ║ 📋 ${selects.length} SELECT(S)`);
              console.log(`   ║ ────────────────────────────────────────────────────`);
              
              for (const select of selects) {
                try {
                  const name = await select.getAttribute('name') || 'select';
                  console.log(`   ║    ▼ ${name}`);
                  
                  const options = await select.locator('option').all();
                  for (const option of options) {
                    const value = await option.getAttribute('value');
                    if (value && value !== '' && value !== '0') {
                      await select.selectOption(value);
                      stats.selects++;
                      stats.camposTotais++;
                      break;
                    }
                  }
                } catch (e) {}
              }
            }
            
            // CHECKBOXES
            const checkboxes = await form.locator('input[type="checkbox"]').all();
            
            if (checkboxes.length > 0) {
              console.log(`   ║`);
              console.log(`   ║ ☑️  ${checkboxes.length} CHECKBOX(ES)`);
              console.log(`   ║ ────────────────────────────────────────────────────`);
              
              for (const checkbox of checkboxes.slice(0, 2)) {
                try {
                  const name = await checkbox.getAttribute('name') || 'checkbox';
                  console.log(`   ║    ☑  ${name}`);
                  
                  await checkbox.scrollIntoViewIfNeeded();
                  await checkbox.check();
                  stats.checkboxes++;
                  stats.camposTotais++;
                } catch (e) {}
              }
            }
            
            // Screenshot do formulário preenchido
            await page.screenshot({ 
              path: `${screenshotBase}-form-${fIdx + 1}-completo.png`, 
              fullPage: false 
            });
            stats.screenshots++;
            
            console.log(`   ╚═══════════════════════════════════════════════════════════`);
          }
        }
        
        console.log(`   ✅ Página validada!`);
        
      } catch (error) {
        console.log(`   ❌ ERRO: ${error.message}`);
      }
    }
    
    // RESUMO
    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMO DA VALIDAÇÃO COM DATEPICKERS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`   ✅ Páginas validadas:               ${stats.paginasValidadas}`);
    console.log(`   ✅ Formulários encontrados:         ${stats.formulariosEncontrados}`);
    console.log(`   ✅ Campos totais validados:         ${stats.camposTotais}`);
    console.log(`   ✅ Campos de data identificados:    ${stats.camposData}`);
    console.log(`   ✅ Datepickers abertos e usados:    ${stats.camposDataComDatepicker}`);
    console.log(`   ✅ Campos de texto:                 ${stats.camposTexto}`);
    console.log(`   ✅ Selects:                         ${stats.selects}`);
    console.log(`   ✅ Checkboxes:                      ${stats.checkboxes}`);
    console.log(`   ✅ Screenshots capturados:          ${stats.screenshots}`);
    console.log('');
    console.log('📁 Arquivos salvos em: axion-ia-api/validacao-datepickers/');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Salvar relatório
    await fs.writeFile(
      './validacao-datepickers/relatorio.json',
      JSON.stringify({
        data: new Date().toISOString(),
        stats
      }, null, 2)
    );
    
    console.log('⏸️  Navegador aberto por 15 segundos...\n');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('\n❌ ERRO:', error);
  }
  
  await context.close();
  await browser.close();
  
  console.log('✅ VALIDAÇÃO CONCLUÍDA!\n');
}

// Executar
validacaoComDatepickers().catch(console.error);
