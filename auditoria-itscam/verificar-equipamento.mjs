#!/usr/bin/env node
/**
 * Script temporário para verificar configuração de um equipamento específico
 */

const UUID = "def24641-a5f4-4673-973c-88cba3fbb571";
const BASE_URL = `https://${UUID}-80.tunnel.varco.cloud`;
const USERNAME = "admin";
const PASSWORD = "#econocr@";

async function getToken() {
  const res = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD })
  });
  
  if (!res.ok) {
    throw new Error(`Login falhou: ${res.status}`);
  }
  
  const data = await res.json();
  return data.token;
}

async function getClassifier(token) {
  const res = await fetch(`${BASE_URL}/api/equipment/classifier`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!res.ok) {
    throw new Error(`Falha ao buscar classifier: ${res.status}`);
  }
  
  return await res.json();
}

async function main() {
  try {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  VERIFICAÇÃO — GOEC6O018 - Faixa 2');
    console.log('  UUID:', UUID);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    console.log('🔐 Autenticando...');
    const token = await getToken();
    console.log('✅ Autenticado\n');
    
    console.log('📊 Consultando Classifier...');
    const data = await getClassifier(token);
    
    console.log('\n📋 Resultado:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log('processingQueue:', data.classifier?.processingQueue);
    console.log('processingThreads:', data.classifier?.processingThreads);
    console.log('sceneType:', data.classifier?.sceneType);
    console.log('minProbability:', data.classifier?.minProbability);
    console.log('─────────────────────────────────────────────────────────────\n');
    
    // Validação
    const queue = data.classifier?.processingQueue;
    const threads = data.classifier?.processingThreads;
    
    if (queue === 1 && threads === 1) {
      console.log('✅ CONFIGURAÇÃO CORRETA');
    } else {
      console.log('❌ CONFIGURAÇÃO INCORRETA');
      if (queue !== 1) console.log(`   • processingQueue: ${queue} (deveria ser 1)`);
      if (threads !== 1) console.log(`   • processingThreads: ${threads} (deveria ser 1)`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
