#!/usr/bin/env node

/**
 * Script de Teste - AxionIA v4.0
 * Valida instalação dos engines e executa teste básico
 */

import SpellingValidationEngine from './spelling-validation-engine.js';
import ScenarioLearningEngine from './scenario-learning-engine.js';
import ScenarioExecutionEngine from './scenario-execution-engine.js';
import fs from 'fs';
import path from 'path';

console.log('\n🚀 AxionIA v4.0 - Teste de Engines\n');
console.log('═'.repeat(60));

async function testarSpellingEngine() {
  console.log('\n📝 TESTE 1: Spelling Validation Engine');
  console.log('─'.repeat(60));

  try {
    const engine = new SpellingValidationEngine();
    console.log('✅ Engine instanciado com sucesso');

    // Carrega dicionários
    await engine.loadDictionaries();
    console.log(`✅ Dicionários carregados: ${engine.getTotalWords()} palavras`);

    // Testa palavras
    const testWords = [
      'sistema',      // ✅ válida
      'tecnologia',   // ✅ válida
      'Axion',        // ✅ válida (customizado)
      'xxyyzz',       // ❌ inválida
      'cadastro',     // ✅ válida
    ];

    console.log('\n📋 Testando palavras:');
    testWords.forEach(word => {
      const valid = engine.isWordValid(word);
      console.log(`   ${valid ? '✅' : '❌'} "${word}"`);
    });

    console.log('\n✅ Spelling Validation Engine: OK\n');
    return true;

  } catch (error) {
    console.error('❌ Erro no Spelling Engine:', error.message);
    return false;
  }
}

async function testarScenarioLearningEngine() {
  console.log('\n🎓 TESTE 2: Scenario Learning Engine');
  console.log('─'.repeat(60));

  try {
    const learning = new ScenarioLearningEngine();
    console.log('✅ Engine instanciado com sucesso');

    // Carrega cenários existentes
    await learning.loadAllScenarios();
    console.log(`✅ Cenários carregados: ${learning.scenarios.size}`);

    // Estatísticas da biblioteca
    const stats = learning.getLibraryStats();
    console.log('\n📊 Estatísticas da Biblioteca:');
    console.log(`   Total de cenários: ${stats.total}`);
    console.log(`   Cenários reutilizáveis: ${stats.reusable}`);
    console.log(`   Cenários parametrizáveis: ${stats.parameterizable}`);
    console.log(`   Total de passos: ${stats.totalSteps}`);
    console.log(`   Média de passos: ${stats.avgStepsPerScenario}`);
    console.log(`   Duração total: ${stats.totalDuration}s`);

    // Lista categorias
    if (Object.keys(stats.categories).length > 0) {
      console.log('\n📂 Categorias:');
      Object.entries(stats.categories).forEach(([cat, data]) => {
        console.log(`   • ${cat}: ${data.count} cenários`);
      });
    }

    console.log('\n✅ Scenario Learning Engine: OK\n');
    return true;

  } catch (error) {
    console.error('❌ Erro no Scenario Learning Engine:', error.message);
    return false;
  }
}

async function testarScenarioExecutionEngine() {
  console.log('\n▶️ TESTE 3: Scenario Execution Engine');
  console.log('─'.repeat(60));

  try {
    const execution = new ScenarioExecutionEngine();
    console.log('✅ Engine instanciado com sucesso');

    // Histórico de execuções
    const history = execution.getExecutionHistory();
    console.log(`✅ Histórico de execuções: ${history.length}`);

    console.log('\n✅ Scenario Execution Engine: OK\n');
    return true;

  } catch (error) {
    console.error('❌ Erro no Scenario Execution Engine:', error.message);
    return false;
  }
}

async function verificarDependencias() {
  console.log('\n📦 TESTE 4: Verificação de Dependências');
  console.log('─'.repeat(60));

  const deps = [
    { name: 'puppeteer', pkg: 'puppeteer' },
    { name: 'fs', pkg: 'fs' },
    { name: 'path', pkg: 'path' },
  ];

  let allOk = true;

  for (const dep of deps) {
    try {
      await import(dep.pkg);
      console.log(`   ✅ ${dep.name}`);
    } catch (error) {
      console.log(`   ❌ ${dep.name} - NÃO INSTALADO`);
      allOk = false;
    }
  }

  if (allOk) {
    console.log('\n✅ Todas as dependências instaladas\n');
  } else {
    console.log('\n⚠️ Instale as dependências faltantes com: npm install\n');
  }

  return allOk;
}

async function verificarEstrutura() {
  console.log('\n📁 TESTE 5: Verificação de Estrutura');
  console.log('─'.repeat(60));

  const dirs = [
    'scenarios',
    '../api/src/routes',
    '../src/pages/CentralQualidade',
  ];

  let allOk = true;

  for (const dir of dirs) {
    const fullPath = path.join(process.cwd(), dir);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${dir}`);
    if (!exists) allOk = false;
  }

  if (allOk) {
    console.log('\n✅ Estrutura de diretórios OK\n');
  } else {
    console.log('\n⚠️ Alguns diretórios estão faltando\n');
  }

  return allOk;
}

async function executarTestes() {
  console.log('Iniciando bateria de testes...\n');

  const resultados = {
    spelling: await testarSpellingEngine(),
    learning: await testarScenarioLearningEngine(),
    execution: await testarScenarioExecutionEngine(),
    deps: await verificarDependencias(),
    estrutura: await verificarEstrutura(),
  };

  console.log('═'.repeat(60));
  console.log('\n📊 RESUMO DOS TESTES\n');
  console.log('─'.repeat(60));
  console.log(`   Spelling Validation Engine:    ${resultados.spelling ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`   Scenario Learning Engine:       ${resultados.learning ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`   Scenario Execution Engine:      ${resultados.execution ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`   Dependências:                   ${resultados.deps ? '✅ OK' : '❌ FALTANDO'}`);
  console.log(`   Estrutura de Diretórios:        ${resultados.estrutura ? '✅ OK' : '❌ INCOMPLETA'}`);
  console.log('─'.repeat(60));

  const todosOk = Object.values(resultados).every(r => r);

  if (todosOk) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! AxionIA v4.0 está operacional.\n');
    console.log('📝 Próximos passos:');
    console.log('   1. Iniciar o sistema: cd .. && .\\iniciar.ps1');
    console.log('   2. Acessar CUTI: http://localhost:3017/cuti');
    console.log('   3. Gravar primeiro cenário\n');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verifique os erros acima.\n');
  }

  console.log('═'.repeat(60));
  console.log('\nAxionIA v4.0 - Teste de Engines concluído');
  console.log(`Data: ${new Date().toLocaleString('pt-BR')}\n`);
}

// Executa
executarTestes().catch(error => {
  console.error('\n❌ Erro fatal:', error.message);
  process.exit(1);
});
