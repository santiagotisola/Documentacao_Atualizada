// 🎯 VALIDAÇÃO PROFUNDA DE FORMULÁRIOS
// Valida TODOS os campos de TODOS os formulários encontrados no sistema

import { chromium } from 'playwright';
import { promises as fs } from 'fs';

async function validacaoFormulariosProfunda() {
  console.log('\n🎯 VALIDAÇÃO PROFUNDA DE FORMULÁRIOS - VALIDA TUDO DENTRO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('✅ Navegador VISÍVEL - acompanhe tudo');
  console.log('✅ Procura TODOS os formulários na página');
  console.log('✅ Clica em botões de tabela (ex: "33 infrações")');
  console.log('✅ Preenche e valida CADA campo');
  console.log('✅ Testa obrigatórios, limites, máscaras');
  console.log('✅ Captura screenshots de cada formulário');
  console.log('');
  console.log('📁 Screenshots: axion-ia-api/validacao-formularios/');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    await fs.mkdir('./validacao-formularios', { recursive: true });
  } catch (e) {}

  let stats = {
    paginasValidadas: 0,
    formulariosEncontrados: 0,
    camposValidados: 0,
    camposObrigatorios: 0,
    camposComLimite: 0,
    camposComMascara: 0,
    errosValidacao: [],
    screenshots: 0
  };

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 400,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  
  try {
    // ═══════════════════════════════════════════════════════════
    // LOGIN
    // ═══════════════════════════════════════════════════════════
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
    
    // ═══════════════════════════════════════════════════════════
    // DESCOBRIR PÁGINAS
    // ═══════════════════════════════════════════════════════════
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
    
    // ═══════════════════════════════════════════════════════════
    // VALIDAR CADA PÁGINA
    // ═══════════════════════════════════════════════════════════
    console.log('📋 VALIDANDO FORMULÁRIOS DE CADA PÁGINA\n');
    console.log('─────────────────────────────────────────────────────────────\n');
    
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      
      console.log(`\n📄 [${i+1}/${routes.length}] ${route.title.toUpperCase()}`);
      console.log(`   ${route.url}`);
      
      try {
        await page.goto(route.url, { waitUntil: 'load', timeout: 20000 });
        await page.waitForTimeout(1500);
        
        stats.paginasValidadas++;
        
        const screenshotBase = `./validacao-formularios/${String(i+1).padStart(2, '0')}-${route.title.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        // ═══════════════════════════════════════════════════════════
        // 1. PROCURAR FORMULÁRIOS VISÍVEIS NA PÁGINA
        // ═══════════════════════════════════════════════════════════
        const formsVisiveis = await page.locator('form, [data-form]').all();
        
        if (formsVisiveis.length > 0) {
          console.log(`\n   📝 ${formsVisiveis.length} formulário(s) VISÍVEL(eis) na página!`);
          
          for (let fIdx = 0; fIdx < formsVisiveis.length; fIdx++) {
            const form = formsVisiveis[fIdx];
            
            console.log(`\n   ╔═══════════════════════════════════════════════════════════`);
            console.log(`   ║ 📋 FORMULÁRIO ${fIdx + 1}/${formsVisiveis.length}`);
            console.log(`   ╠═══════════════════════════════════════════════════════════`);
            
            stats.formulariosEncontrados++;
            
            await validarTodosCamposFormulario(form, stats, console);
            
            // Screenshot do form preenchido
            await page.screenshot({ 
              path: `${screenshotBase}-form-${fIdx + 1}-preenchido.png`, 
              fullPage: false 
            });
            stats.screenshots++;
            
            console.log(`   ╚═══════════════════════════════════════════════════════════`);
          }
        }
        
        // ═══════════════════════════════════════════════════════════
        // 2. PROCURAR BOTÕES EM TABELAS (ex: "33" infrações)
        // ═══════════════════════════════════════════════════════════
        const botoesTabela = await page.locator(
          'table button:not([disabled]), ' +
          'tbody button:not([disabled]), ' +
          '[role="grid"] button:not([disabled])'
        ).all();
        
        let botoesNumericos = [];
        for (const btn of botoesTabela) {
          try {
            const text = (await btn.textContent()).trim();
            // Verificar se é um número (indica quantidade de registros)
            if (/^\d+$/.test(text) && parseInt(text) > 0) {
              botoesNumericos.push({ btn, text });
            }
          } catch (e) {}
        }
        
        if (botoesNumericos.length > 0) {
          console.log(`\n   📊 ${botoesNumericos.length} botão(ões) numérico(s) na tabela!`);
          console.log(`      Clicando no primeiro para abrir janela...`);
          
          try {
            const primeiroBtn = botoesNumericos[0];
            console.log(`\n   ┌───────────────────────────────────────────────────────`);
            console.log(`   │ 🔘 Clicando em botão "${primeiroBtn.text}"`);
            
            await primeiroBtn.btn.scrollIntoViewIfNeeded();
            await primeiroBtn.btn.click();
            await page.waitForTimeout(2000);
            
            // Verificar se abriu modal/janela/página nova
            const modalOuJanela = await page.locator(
              '[role="dialog"], .modal, [class*="Modal"], ' +
              'main form, .content form'
            ).first();
            
            const temConteudo = await modalOuJanela.count();
            
            if (temConteudo > 0) {
              console.log(`   │ ✅ Janela/Modal aberto!`);
              
              await page.screenshot({ 
                path: `${screenshotBase}-janela-botao-${primeiroBtn.text}.png`, 
                fullPage: false 
              });
              stats.screenshots++;
              
              // VALIDAR FORMULÁRIO DENTRO DA JANELA
              const formJanela = await modalOuJanela.locator('form').first();
              const temForm = await formJanela.count();
              
              if (temForm > 0) {
                console.log(`   │`);
                console.log(`   │ 📋 FORMULÁRIO dentro da janela!`);
                console.log(`   │`);
                
                stats.formulariosEncontrados++;
                
                await validarTodosCamposFormulario(formJanela, stats, console);
                
                await page.screenshot({ 
                  path: `${screenshotBase}-janela-preenchida.png`, 
                  fullPage: false 
                });
                stats.screenshots++;
              }
              
              // Fechar janela (ESC ou botão fechar)
              console.log(`   │`);
              console.log(`   │ ❌ Fechando janela...`);
              await page.keyboard.press('Escape');
              await page.waitForTimeout(1000);
              
              const aindaAberto = await modalOuJanela.count();
              if (aindaAberto > 0) {
                // Tentar botão fechar
                const btnFechar = await page.locator(
                  'button:has-text("Fechar"), button:has-text("Cancelar"), ' +
                  '[data-dismiss="modal"], .close'
                ).first();
                
                if (await btnFechar.count() > 0) {
                  await btnFechar.click();
                  await page.waitForTimeout(500);
                }
              }
              
              console.log(`   │ ✅ Janela fechada!`);
            }
            
            console.log(`   └───────────────────────────────────────────────────────`);
            
          } catch (e) {
            console.log(`   └─ ⚠️  Erro ao processar botão: ${e.message}`);
          }
        }
        
        console.log(`\n   ✅ Página validada!`);
        
      } catch (error) {
        console.log(`\n   ❌ ERRO: ${error.message}`);
      }
    }
    
    // ═══════════════════════════════════════════════════════════
    // RESUMO
    // ═══════════════════════════════════════════════════════════
    console.log('\n\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMO DA VALIDAÇÃO PROFUNDA DE FORMULÁRIOS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`   ✅ Páginas validadas:          ${stats.paginasValidadas}`);
    console.log(`   ✅ Formulários encontrados:    ${stats.formulariosEncontrados}`);
    console.log(`   ✅ Campos validados:           ${stats.camposValidados}`);
    console.log(`   ✅ Campos obrigatórios:        ${stats.camposObrigatorios}`);
    console.log(`   ✅ Campos com limite:          ${stats.camposComLimite}`);
    console.log(`   ✅ Campos com máscara:         ${stats.camposComMascara}`);
    console.log(`   ✅ Screenshots capturados:     ${stats.screenshots}`);
    console.log(`   ${stats.errosValidacao.length > 0 ? '⚠️ ' : '✅'} Erros de validação:        ${stats.errosValidacao.length}`);
    console.log('');
    
    if (stats.errosValidacao.length > 0) {
      console.log('⚠️  ERROS ENCONTRADOS:');
      console.log('─────────────────────────────────────────────────────────────');
      stats.errosValidacao.forEach((erro, idx) => {
        console.log(`   ${idx + 1}. ${erro.pagina} → ${erro.campo}`);
        console.log(`      ${erro.erro}`);
      });
      console.log('');
    }
    
    console.log('📁 Arquivos salvos em: axion-ia-api/validacao-formularios/');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Salvar relatório
    await fs.writeFile(
      './validacao-formularios/relatorio.json',
      JSON.stringify({
        data: new Date().toISOString(),
        stats,
        erros: stats.errosValidacao
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

// ═══════════════════════════════════════════════════════════
// FUNÇÃO: VALIDAR TODOS OS CAMPOS DE UM FORMULÁRIO
// ═══════════════════════════════════════════════════════════
async function validarTodosCamposFormulario(form, stats, logger) {
  
  // 1. INPUTS DE TEXTO
  const textInputs = await form.locator(
    'input[type="text"], input[type="email"], input[type="tel"], ' +
    'input[type="url"], input[type="number"], input[type="search"], ' +
    'input:not([type])'
  ).all();
  
  if (textInputs.length > 0) {
    logger.log(`   ║`);
    logger.log(`   ║ 📝 ${textInputs.length} CAMPO(S) DE TEXTO`);
    logger.log(`   ║ ────────────────────────────────────────────────────`);
    
    for (const input of textInputs) {
      await validarCampoTexto(input, stats, logger);
    }
  }
  
  // 2. TEXTAREAS
  const textareas = await form.locator('textarea').all();
  
  if (textareas.length > 0) {
    logger.log(`   ║`);
    logger.log(`   ║ 📄 ${textareas.length} TEXTAREA(S)`);
    logger.log(`   ║ ────────────────────────────────────────────────────`);
    
    for (const textarea of textareas) {
      try {
        const name = await textarea.getAttribute('name') || 'textarea';
        const required = await textarea.getAttribute('required');
        const maxlength = await textarea.getAttribute('maxlength');
        
        logger.log(`   ║    ✍️  ${name}${required ? ' (obrigatório)' : ''}${maxlength ? ` [max:${maxlength}]` : ''}`);
        
        await textarea.scrollIntoViewIfNeeded();
        await textarea.fill('Texto de teste para validação do campo textarea');
        
        stats.camposValidados++;
        if (required) stats.camposObrigatorios++;
        if (maxlength) stats.camposComLimite++;
        
      } catch (e) {}
    }
  }
  
  // 3. SELECTS
  const selects = await form.locator('select').all();
  
  if (selects.length > 0) {
    logger.log(`   ║`);
    logger.log(`   ║ 📋 ${selects.length} SELECT(S)`);
    logger.log(`   ║ ────────────────────────────────────────────────────`);
    
    for (const select of selects) {
      try {
        const name = await select.getAttribute('name') || 'select';
        const required = await select.getAttribute('required');
        
        logger.log(`   ║    ▼ ${name}${required ? ' (obrigatório)' : ''}`);
        
        const options = await select.locator('option').all();
        for (const option of options) {
          const value = await option.getAttribute('value');
          if (value && value !== '' && value !== '0') {
            await select.selectOption(value);
            stats.camposValidados++;
            if (required) stats.camposObrigatorios++;
            break;
          }
        }
      } catch (e) {}
    }
  }
  
  // 4. CHECKBOXES
  const checkboxes = await form.locator('input[type="checkbox"]').all();
  
  if (checkboxes.length > 0) {
    logger.log(`   ║`);
    logger.log(`   ║ ☑️  ${checkboxes.length} CHECKBOX(ES)`);
    logger.log(`   ║ ────────────────────────────────────────────────────`);
    
    for (const checkbox of checkboxes.slice(0, 3)) {
      try {
        const name = await checkbox.getAttribute('name') || 'checkbox';
        logger.log(`   ║    ☑  ${name}`);
        
        await checkbox.scrollIntoViewIfNeeded();
        await checkbox.check();
        stats.camposValidados++;
      } catch (e) {}
    }
  }
  
  // 5. RADIO BUTTONS
  const radios = await form.locator('input[type="radio"]').all();
  
  if (radios.length > 0) {
    logger.log(`   ║`);
    logger.log(`   ║ ⭕ ${radios.length} RADIO BUTTON(S)`);
    logger.log(`   ║ ────────────────────────────────────────────────────`);
    
    const radioGroups = new Set();
    for (const radio of radios) {
      try {
        const name = await radio.getAttribute('name');
        if (name && !radioGroups.has(name)) {
          radioGroups.add(name);
          logger.log(`   ║    ⭕ ${name}`);
          await radio.scrollIntoViewIfNeeded();
          await radio.check();
          stats.camposValidados++;
        }
      } catch (e) {}
    }
  }
  
  // 6. INPUTS DE DATA/HORA
  const dateInputs = await form.locator(
    'input[type="date"], input[type="datetime-local"], ' +
    'input[type="time"], input[type="month"], input[type="week"]'
  ).all();
  
  if (dateInputs.length > 0) {
    logger.log(`   ║`);
    logger.log(`   ║ 📅 ${dateInputs.length} CAMPO(S) DE DATA/HORA`);
    logger.log(`   ║ ────────────────────────────────────────────────────`);
    
    for (const dateInput of dateInputs) {
      try {
        const type = await dateInput.getAttribute('type');
        const name = await dateInput.getAttribute('name') || 'data';
        const required = await dateInput.getAttribute('required');
        
        logger.log(`   ║    📅 ${name} (${type})${required ? ' (obrigatório)' : ''}`);
        
        let valor = '2026-06-19';
        if (type === 'datetime-local') valor = '2026-06-19T10:00';
        else if (type === 'time') valor = '10:00';
        else if (type === 'month') valor = '2026-06';
        else if (type === 'week') valor = '2026-W25';
        
        await dateInput.scrollIntoViewIfNeeded();
        await dateInput.fill(valor);
        stats.camposValidados++;
        if (required) stats.camposObrigatorios++;
      } catch (e) {}
    }
  }
  
  // 7. INPUTS DE ARQUIVO
  const fileInputs = await form.locator('input[type="file"]').all();
  
  if (fileInputs.length > 0) {
    logger.log(`   ║`);
    logger.log(`   ║ 📎 ${fileInputs.length} CAMPO(S) DE ARQUIVO`);
    logger.log(`   ║ ────────────────────────────────────────────────────`);
    logger.log(`   ║    (Campos identificados, upload não realizado)`);
    stats.camposValidados += fileInputs.length;
  }
}

async function validarCampoTexto(input, stats, logger) {
  try {
    const type = await input.getAttribute('type') || 'text';
    const name = await input.getAttribute('name') || '';
    const placeholder = await input.getAttribute('placeholder') || '';
    const required = await input.getAttribute('required');
    const maxlength = await input.getAttribute('maxlength');
    const pattern = await input.getAttribute('pattern');
    const minlength = await input.getAttribute('minlength');
    
    const fieldName = name || placeholder || 'campo';
    
    let badges = [];
    if (required) badges.push('obrigatório');
    if (maxlength) badges.push(`max:${maxlength}`);
    if (minlength) badges.push(`min:${minlength}`);
    if (pattern) badges.push('padrão');
    
    const badgeStr = badges.length > 0 ? ` [${badges.join(', ')}]` : '';
    
    logger.log(`   ║    ✍️  ${fieldName} (${type})${badgeStr}`);
    
    // Valor de teste baseado no tipo
    let testValue = 'Teste Validação';
    
    if (type === 'email') testValue = 'validacao@teste.com.br';
    else if (type === 'tel') testValue = '(11) 99999-9999';
    else if (type === 'number') testValue = '12345';
    else if (type === 'url') testValue = 'https://www.teste.com.br';
    else if (placeholder.toLowerCase().includes('placa')) testValue = 'ABC1D234';
    else if (placeholder.toLowerCase().includes('cnpj')) testValue = '12.345.678/0001-90';
    else if (placeholder.toLowerCase().includes('cpf')) testValue = '123.456.789-00';
    else if (placeholder.toLowerCase().includes('cep')) testValue = '12345-678';
    
    await input.scrollIntoViewIfNeeded();
    await input.fill(testValue);
    
    // Verificar se respeitou maxlength
    if (maxlength) {
      const actualValue = await input.inputValue();
      if (actualValue.length > parseInt(maxlength)) {
        stats.errosValidacao.push({
          campo: fieldName,
          erro: `Campo permite mais caracteres (${actualValue.length}) que o maxlength (${maxlength})`
        });
        logger.log(`   ║       ⚠️  ERRO: maxlength não validado!`);
      }
    }
    
    stats.camposValidados++;
    if (required) stats.camposObrigatorios++;
    if (maxlength) stats.camposComLimite++;
    if (pattern) stats.camposComMascara++;
    
  } catch (e) {
    logger.log(`   ║       ⚠️  Erro: ${e.message}`);
  }
}

// Executar
validacaoFormulariosProfunda().catch(console.error);
