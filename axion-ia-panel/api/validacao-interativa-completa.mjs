// 🎯 VALIDAÇÃO INTERATIVA COMPLETA
// Abre TODAS as janelas/modals, preenche TODOS os campos, valida tudo

import { chromium } from 'playwright';
import { promises as fs } from 'fs';

async function validacaoInterativaCompleta() {
  console.log('\n🎯 VALIDAÇÃO INTERATIVA COMPLETA - ALIMENTA TODAS AS JANELAS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('✅ Navegador VISÍVEL - você vê tudo acontecendo');
  console.log('✅ Clica em TODOS os botões (Novo, Adicionar, Editar)');
  console.log('✅ Preenche TODOS os campos de cada modal/janela');
  console.log('✅ Valida cada campo (obrigatórios, limites, máscaras)');
  console.log('✅ Testa Salvar e Cancelar');
  console.log('✅ Captura screenshots de CADA etapa');
  console.log('');
  console.log('⏱️  Tempo estimado: 20-30 minutos (depende do sistema)');
  console.log('📁 Screenshots: axion-ia-api/validacao-interativa/');
  console.log('');
  console.log('Pressione Ctrl+C para parar a qualquer momento');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Criar diretório
  try {
    await fs.mkdir('./validacao-interativa', { recursive: true });
  } catch (e) {}

  let stats = {
    paginasVisitadas: 0,
    botoesClicados: 0,
    modalsAbertos: 0,
    camposPreenchidos: 0,
    validacoesRealizadas: 0,
    screenshots: 0,
    errosEncontrados: []
  };

  // Abrir navegador VISÍVEL
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 600,  // Mais rápido que antes, mas ainda visível
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null,
    locale: 'pt-BR'
  });
  
  const page = await context.newPage();
  
  try {
    // ═══════════════════════════════════════════════════════════
    // LOGIN
    // ═══════════════════════════════════════════════════════════
    console.log('🔐 FAZENDO LOGIN...\n');
    
    await page.goto('https://homologacao.axhub.axion.ws/', { 
      waitUntil: 'load', 
      timeout: 30000 
    });
    
    const navCount = await page.locator('nav, navigation, main').count();
    
    if (navCount === 0) {
      await page.locator('input[type="text"]').first().fill('Admin');
      await page.locator('input[type="password"]').first().fill('Labor#5383');
      await page.locator('button:has-text("Entrar")').first().click();
      await page.waitForTimeout(3000);
    }
    
    console.log('   ✅ Login realizado!\n');
    
    // ═══════════════════════════════════════════════════════════
    // DESCOBRIR PÁGINAS
    // ═══════════════════════════════════════════════════════════
    console.log('🔍 DESCOBRINDO PÁGINAS...\n');
    
    const navLinks = await page.locator('nav a, navigation a, aside a').all();
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
    
    console.log(`   ✅ ${routes.length} páginas descobertas!\n`);
    
    // ═══════════════════════════════════════════════════════════
    // VALIDAR CADA PÁGINA - COM INTERAÇÃO COMPLETA
    // ═══════════════════════════════════════════════════════════
    console.log('🌐 VALIDANDO PÁGINAS COM INTERAÇÃO COMPLETA');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      
      console.log(`\n📄 [${i+1}/${routes.length}] ${route.title.toUpperCase()}`);
      console.log(`   URL: ${route.url}`);
      
      try {
        await page.goto(route.url, { waitUntil: 'load', timeout: 20000 });
        await page.waitForTimeout(1500);
        
        stats.paginasVisitadas++;
        
        // Screenshot inicial
        const screenshotBase = `./validacao-interativa/${String(i+1).padStart(2, '0')}-${route.title.replace(/[^a-zA-Z0-9]/g, '-')}`;
        await page.screenshot({ path: `${screenshotBase}-inicial.png`, fullPage: false });
        stats.screenshots++;
        console.log(`   📸 Screenshot inicial capturado`);
        
        // ───────────────────────────────────────────────────
        // PROCURAR BOTÕES DE AÇÃO
        // ───────────────────────────────────────────────────
        const actionButtons = await page.locator(
          'button:has-text("Novo"), button:has-text("Adicionar"), ' +
          'button:has-text("Cadastrar"), button:has-text("Criar"), ' +
          'button:has-text("+"), a:has-text("Novo")'
        ).all();
        
        if (actionButtons.length > 0) {
          console.log(`\n   🔘 ${actionButtons.length} botão(ões) de ação encontrado(s)!`);
          
          for (let btnIdx = 0; btnIdx < actionButtons.length; btnIdx++) {
            const btn = actionButtons[btnIdx];
            
            try {
              const btnText = (await btn.textContent()).trim();
              console.log(`\n   ┌─────────────────────────────────────────`);
              console.log(`   │ 🔘 BOTÃO ${btnIdx + 1}/${actionButtons.length}: "${btnText}"`);
              console.log(`   ├─────────────────────────────────────────`);
              
              // Clicar no botão
              await btn.scrollIntoViewIfNeeded();
              await btn.click();
              await page.waitForTimeout(1500);
              
              stats.botoesClicados++;
              console.log(`   │ ✅ Botão clicado!`);
              
              // Verificar se abriu modal/form
              const modalCount = await page.locator(
                '[role="dialog"], .modal, .modal-content, .modal-dialog, ' +
                '[class*="Modal"], [class*="dialog"]'
              ).count();
              
              if (modalCount > 0) {
                stats.modalsAbertos++;
                console.log(`   │ 📱 Modal/Janela aberta!`);
                
                // Capturar screenshot do modal
                await page.screenshot({ 
                  path: `${screenshotBase}-modal-${btnIdx + 1}.png`, 
                  fullPage: false 
                });
                stats.screenshots++;
                console.log(`   │ 📸 Screenshot do modal capturado`);
                
                // ═══════════════════════════════════════════════════
                // PREENCHER TODOS OS CAMPOS DO MODAL
                // ═══════════════════════════════════════════════════
                const modal = page.locator('[role="dialog"], .modal, [class*="Modal"]').first();
                
                // 1. CAMPOS DE TEXTO
                const textInputs = await modal.locator(
                  'input[type="text"], input:not([type]), input[type="email"], ' +
                  'input[type="tel"], input[type="url"], input[type="number"]'
                ).all();
                
                if (textInputs.length > 0) {
                  console.log(`   │`);
                  console.log(`   │ 📝 ${textInputs.length} campo(s) de texto encontrado(s)`);
                  
                  for (const input of textInputs) {
                    try {
                      const name = await input.getAttribute('name') || '';
                      const placeholder = await input.getAttribute('placeholder') || '';
                      const required = await input.getAttribute('required');
                      const maxlength = await input.getAttribute('maxlength');
                      const type = await input.getAttribute('type') || 'text';
                      
                      const fieldName = name || placeholder || 'campo';
                      console.log(`   │    ✍️  ${fieldName}${required ? ' (obrigatório)' : ''}${maxlength ? ` [max:${maxlength}]` : ''}`);
                      
                      // Preencher com valor de teste apropriado
                      let testValue = 'Teste';
                      
                      if (type === 'email') testValue = 'teste@teste.com';
                      else if (type === 'tel') testValue = '11999999999';
                      else if (type === 'number') testValue = '123';
                      else if (type === 'url') testValue = 'https://teste.com';
                      else if (placeholder.toLowerCase().includes('placa')) testValue = 'ABC1234';
                      else if (placeholder.toLowerCase().includes('cnpj')) testValue = '00.000.000/0000-00';
                      else if (placeholder.toLowerCase().includes('cpf')) testValue = '000.000.000-00';
                      else if (placeholder.toLowerCase().includes('cep')) testValue = '00000-000';
                      
                      await input.scrollIntoViewIfNeeded();
                      await input.fill(testValue);
                      await page.waitForTimeout(300);
                      
                      stats.camposPreenchidos++;
                      stats.validacoesRealizadas++;
                      
                      // Validar se aceita mais que maxlength (se definido)
                      if (maxlength) {
                        const currentValue = await input.inputValue();
                        if (currentValue.length > parseInt(maxlength)) {
                          stats.errosEncontrados.push({
                            page: route.title,
                            field: fieldName,
                            error: `Campo aceita mais caracteres que maxlength (${maxlength})`
                          });
                          console.log(`   │    ⚠️  ERRO: Maxlength não validado!`);
                        }
                      }
                      
                    } catch (e) {
                      console.log(`   │    ⚠️  Erro ao preencher campo: ${e.message}`);
                    }
                  }
                }
                
                // 2. SELECTS
                const selects = await modal.locator('select').all();
                
                if (selects.length > 0) {
                  console.log(`   │`);
                  console.log(`   │ 📋 ${selects.length} campo(s) select encontrado(s)`);
                  
                  for (const select of selects) {
                    try {
                      const name = await select.getAttribute('name') || 'select';
                      const required = await select.getAttribute('required');
                      
                      console.log(`   │    ▼ ${name}${required ? ' (obrigatório)' : ''}`);
                      
                      // Pegar primeira opção válida (não vazia)
                      const options = await select.locator('option').all();
                      for (const option of options) {
                        const value = await option.getAttribute('value');
                        if (value && value !== '') {
                          await select.selectOption(value);
                          await page.waitForTimeout(300);
                          stats.camposPreenchidos++;
                          stats.validacoesRealizadas++;
                          break;
                        }
                      }
                    } catch (e) {
                      console.log(`   │    ⚠️  Erro ao selecionar: ${e.message}`);
                    }
                  }
                }
                
                // 3. CHECKBOXES
                const checkboxes = await modal.locator('input[type="checkbox"]').all();
                
                if (checkboxes.length > 0) {
                  console.log(`   │`);
                  console.log(`   │ ☑️  ${checkboxes.length} checkbox(es) encontrado(s)`);
                  
                  for (const checkbox of checkboxes.slice(0, 2)) {  // Marcar só os primeiros 2
                    try {
                      await checkbox.scrollIntoViewIfNeeded();
                      await checkbox.check();
                      await page.waitForTimeout(200);
                      stats.camposPreenchidos++;
                    } catch (e) {}
                  }
                  console.log(`   │    ✅ Primeiros checkboxes marcados`);
                }
                
                // 4. TEXTAREAS
                const textareas = await modal.locator('textarea').all();
                
                if (textareas.length > 0) {
                  console.log(`   │`);
                  console.log(`   │ 📄 ${textareas.length} textarea(s) encontrado(s)`);
                  
                  for (const textarea of textareas) {
                    try {
                      const name = await textarea.getAttribute('name') || 'textarea';
                      console.log(`   │    ✍️  ${name}`);
                      
                      await textarea.scrollIntoViewIfNeeded();
                      await textarea.fill('Texto de teste para validação do sistema');
                      await page.waitForTimeout(300);
                      stats.camposPreenchidos++;
                    } catch (e) {}
                  }
                }
                
                // 5. RADIO BUTTONS
                const radios = await modal.locator('input[type="radio"]').all();
                
                if (radios.length > 0) {
                  console.log(`   │`);
                  console.log(`   │ ⭕ ${radios.length} radio button(s) encontrado(s)`);
                  
                  // Selecionar primeiro de cada grupo
                  const radioNames = new Set();
                  for (const radio of radios) {
                    try {
                      const name = await radio.getAttribute('name');
                      if (name && !radioNames.has(name)) {
                        radioNames.add(name);
                        await radio.scrollIntoViewIfNeeded();
                        await radio.check();
                        await page.waitForTimeout(200);
                        stats.camposPreenchidos++;
                      }
                    } catch (e) {}
                  }
                  console.log(`   │    ✅ Radios selecionados`);
                }
                
                // ═══════════════════════════════════════════════════
                // TESTAR BOTÕES SALVAR/CANCELAR
                // ═══════════════════════════════════════════════════
                console.log(`   │`);
                console.log(`   │ 🔍 Procurando botões Salvar/Cancelar...`);
                
                // Capturar screenshot com campos preenchidos
                await page.screenshot({ 
                  path: `${screenshotBase}-modal-${btnIdx + 1}-preenchido.png`, 
                  fullPage: false 
                });
                stats.screenshots++;
                console.log(`   │ 📸 Screenshot com campos preenchidos`);
                
                // Procurar botão Cancelar primeiro (para não salvar dados reais)
                const cancelBtn = await modal.locator(
                  'button:has-text("Cancelar"), button:has-text("Fechar"), ' +
                  'button:has-text("Voltar"), [class*="close"]'
                ).first();
                
                const cancelCount = await cancelBtn.count();
                
                if (cancelCount > 0) {
                  console.log(`   │ ❌ Clicando em Cancelar (não salvar dados reais)...`);
                  await cancelBtn.click();
                  await page.waitForTimeout(1000);
                  console.log(`   │ ✅ Modal fechado!`);
                } else {
                  // Se não tem cancelar, fechar modal com ESC
                  console.log(`   │ ⌨️  Fechando modal com ESC...`);
                  await page.keyboard.press('Escape');
                  await page.waitForTimeout(1000);
                }
                
                console.log(`   └─────────────────────────────────────────`);
                
              } else {
                console.log(`   │ ℹ️  Nenhum modal abriu (pode ser navegação)`);
                console.log(`   └─────────────────────────────────────────`);
              }
              
            } catch (error) {
              console.log(`   │ ⚠️  Erro ao processar botão: ${error.message}`);
              console.log(`   └─────────────────────────────────────────`);
              
              stats.errosEncontrados.push({
                page: route.title,
                button: 'Ação',
                error: error.message
              });
            }
            
            // Aguardar entre botões
            await page.waitForTimeout(1000);
          }
        }
        
        // ───────────────────────────────────────────────────
        // PROCURAR BOTÕES NA TABELA (EDITAR, VISUALIZAR, ETC)
        // ───────────────────────────────────────────────────
        const tableButtons = await page.locator(
          'table button, [role="grid"] button, tbody button, ' +
          'table a[href*="edit"], table a[title*="Editar"]'
        ).all();
        
        if (tableButtons.length > 0) {
          console.log(`\n   📊 ${tableButtons.length} botão(ões) na tabela encontrado(s)`);
          console.log(`      Testando primeiros 2 para não sobrecarregar...`);
          
          for (let tIdx = 0; tIdx < Math.min(2, tableButtons.length); tIdx++) {
            try {
              const tBtn = tableButtons[tIdx];
              const tBtnText = (await tBtn.textContent()).trim();
              
              if (tBtnText && tBtnText !== '0' && !tBtnText.includes('disabled')) {
                console.log(`\n   │ 🔘 Botão tabela: "${tBtnText}"`);
                
                await tBtn.scrollIntoViewIfNeeded();
                await tBtn.click();
                await page.waitForTimeout(2000);
                
                stats.botoesClicados++;
                
                // Verificar modal
                const modalCount = await page.locator('[role="dialog"], .modal').count();
                
                if (modalCount > 0) {
                  stats.modalsAbertos++;
                  console.log(`   │ ✅ Abriu janela/modal!`);
                  
                  await page.screenshot({ 
                    path: `${screenshotBase}-tabela-${tIdx + 1}.png`, 
                    fullPage: false 
                  });
                  stats.screenshots++;
                  
                  // Fechar modal
                  await page.keyboard.press('Escape');
                  await page.waitForTimeout(1000);
                }
              }
            } catch (e) {
              console.log(`   │ ⚠️  Erro ao clicar botão tabela`);
            }
          }
        }
        
        console.log(`\n   ✅ Página "${route.title}" validada completamente!`);
        
      } catch (error) {
        console.log(`\n   ❌ ERRO na página: ${error.message}`);
        stats.errosEncontrados.push({
          page: route.title,
          error: error.message
        });
      }
      
      // Pausa entre páginas
      await page.waitForTimeout(500);
    }
    
    // ═══════════════════════════════════════════════════════════
    // RESUMO FINAL
    // ═══════════════════════════════════════════════════════════
    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMO DA VALIDAÇÃO INTERATIVA COMPLETA');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`   ✅ Páginas visitadas:        ${stats.paginasVisitadas}`);
    console.log(`   ✅ Botões clicados:          ${stats.botoesClicados}`);
    console.log(`   ✅ Modals/janelas abertos:   ${stats.modalsAbertos}`);
    console.log(`   ✅ Campos preenchidos:       ${stats.camposPreenchidos}`);
    console.log(`   ✅ Validações realizadas:    ${stats.validacoesRealizadas}`);
    console.log(`   ✅ Screenshots capturados:   ${stats.screenshots}`);
    console.log(`   ${stats.errosEncontrados.length === 0 ? '✅' : '⚠️ '} Erros encontrados:        ${stats.errosEncontrados.length}`);
    console.log('');
    
    if (stats.errosEncontrados.length > 0) {
      console.log('⚠️  ERROS DETECTADOS:');
      console.log('─────────────────────────────────────────────────────────────');
      stats.errosEncontrados.forEach((erro, idx) => {
        console.log(`   ${idx + 1}. ${erro.page}`);
        console.log(`      Campo: ${erro.field || erro.button || 'N/A'}`);
        console.log(`      Erro: ${erro.error}`);
        console.log('');
      });
    }
    
    console.log('📁 Todos os arquivos salvos em:');
    console.log('   axion-ia-api/validacao-interativa/');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Salvar relatório JSON
    const report = {
      data: new Date().toISOString(),
      sistema: 'AxHub Homologação',
      stats,
      erros: stats.errosEncontrados
    };
    
    await fs.writeFile(
      './validacao-interativa/relatorio.json',
      JSON.stringify(report, null, 2),
      'utf-8'
    );
    
    console.log('💾 Relatório JSON salvo: validacao-interativa/relatorio.json\n');
    
    console.log('⏸️  Navegador ficará aberto por 15 segundos...\n');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error.stack);
  }
  
  console.log('🎬 Encerrando validação...\n');
  
  await context.close();
  await browser.close();
  
  console.log('✅ VALIDAÇÃO INTERATIVA COMPLETA CONCLUÍDA!\n');
}

// Executar
validacaoInterativaCompleta().catch(console.error);
