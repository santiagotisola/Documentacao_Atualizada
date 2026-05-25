/**
 * Script: Exportar Contatos do Multi360 (Atendimentos) → CSV Google Contacts
 * 
 * Uso: node exportar-contatos-multi360.mjs
 * 
 * Extrai contatos únicos do relatório de atendimentos do Multi360
 * e gera CSV no formato Google Contacts para importação.
 */

import { writeFileSync } from 'fs';

const BASE_URL = 'https://painel.multi360.com.br';
const ATENDIMENTOS_PARAMS = 'atendenteId=-1&botId=0&camposSegmentacao=%5B%5D&cliente=-1&departamentoId=-1&localizacao=&mes=-1&motivoId=-1&orderByFieldName=CREATE_DATE&orderByFieldOrdenation=DESC&origem=TODOS&status=Todos';

async function login() {
  const resp = await fetch(`${BASE_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario: 'ana.cacula', senha: 'Recrutamento2025' })
  });
  if (!resp.ok) throw new Error(`Login falhou: ${resp.status}`);
  const data = await resp.json();
  return data.token || data.access_token || `Bearer ${data.jwt}`;
}

async function fetchAllContacts(token) {
  const contacts = new Map();
  let offset = 0;
  let totalFetched = 0;

  console.log('Extraindo contatos do relatório de atendimentos...');

  while (true) {
    const url = `${BASE_URL}/api/relatorios/atendimentos?${ATENDIMENTOS_PARAMS}&offset=${offset}`;
    const resp = await fetch(url, { headers: { 'Authorization': token } });

    if (!resp.ok) {
      console.log(`  Erro HTTP ${resp.status} no offset ${offset}. Parando.`);
      break;
    }

    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) break;

    for (const rec of data) {
      if (rec.numero && !rec.grupo) {
        const key = rec.numero.trim();
        if (!contacts.has(key)) {
          contacts.set(key, {
            nome: rec.nome?.trim() || '',
            numero: key,
            canal: rec.botDisplayName || '',
            origem: rec.origem || ''
          });
        }
      }
    }

    totalFetched += data.length;
    offset += data.length;

    if (totalFetched % 1000 === 0) {
      process.stdout.write(`\r  Processados: ${totalFetched} | Únicos: ${contacts.size}`);
    }

    if (data.length < 20) break;
  }

  console.log(`\n  Total registros: ${totalFetched} | Contatos únicos: ${contacts.size}`);
  return Array.from(contacts.values());
}

function generateGoogleCSV(contacts) {
  const header = 'Name,Given Name,Additional Name,Family Name,Phone 1 - Type,Phone 1 - Value,Organization 1 - Name,Group Membership';
  const lines = [header];

  for (const c of contacts) {
    let name = c.nome || c.numero;
    name = name.replace(/"/g, '""');

    let phone = c.numero;
    if (phone && !phone.startsWith('+')) phone = '+' + phone;

    const parts = name.trim().split(/\s+/);
    const givenName = (parts[0] || '').replace(/"/g, '""');
    const familyName = parts.length > 1 ? parts[parts.length - 1].replace(/"/g, '""') : '';
    const additionalName = parts.length > 2 ? parts.slice(1, -1).join(' ').replace(/"/g, '""') : '';

    const group = `Multi360 - ${c.origem} ${c.canal}`;

    lines.push(`"${name}","${givenName}","${additionalName}","${familyName}",Mobile,"${phone}","Multi360","${group} ::: * myContacts"`);
  }

  return lines.join('\r\n');
}

async function main() {
  console.log('Exportando contatos do Multi360...\n');

  let token;
  try {
    token = await login();
    console.log('  Login OK\n');
  } catch (e) {
    console.error('Falha no login:', e.message);
    process.exit(1);
  }

  const contacts = await fetchAllContacts(token);
  const csv = generateGoogleCSV(contacts);

  const filename = `contatos-multi360-google-${new Date().toISOString().slice(0, 10)}.csv`;
  writeFileSync(filename, '\uFEFF' + csv, 'utf-8');

  console.log(`\nArquivo salvo: ${filename}`);
  console.log(`Tamanho: ${(Buffer.byteLength(csv) / 1024).toFixed(1)} KB`);
  console.log(`\nPara importar no Google Contacts:`);
  console.log(`  1. Acesse contacts.google.com`);
  console.log(`  2. Clique em "Importar"`);
  console.log(`  3. Selecione o arquivo CSV gerado`);
}

main().catch(console.error);
