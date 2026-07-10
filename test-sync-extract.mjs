import { extractFromSite } from './axion-ia-panel/api/src/services/sync-extractor.js';

// Mostra as credenciais que serão usadas
console.log('AXCROSS_LOGIN:', process.env.AXCROSS_LOGIN);
console.log('AXCROSS_SENHA:', process.env.AXCROSS_SENHA);
console.log('AXCROSS_BASE_URL:', process.env.AXCROSS_BASE_URL);
console.log('---');
console.log('Testando extração de area no AxCross...');
try {
  const result = await extractFromSite('axcross-homo', ['area'], (p) => {
    console.log(`[${p.status}] ${p.label}: ${p.message}`);
  });
  console.log('\nRESULTADO:', JSON.stringify(result?.entities?.area || result, null, 2));
} catch(e) {
  console.error('ERRO:', e.message);
  console.error(e.stack);
}
