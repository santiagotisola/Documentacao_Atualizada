import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: false,
  args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
});
const page = await browser.newPage();
page.setDefaultTimeout(20000);
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
});

// Login
await page.goto('https://homologacao.axcross.axion.ws/account/login', { waitUntil: 'networkidle2' });
await page.type('#Email', 'suporte@axiontecnologia.com.br');
await page.type('#Password', 'Axion#2023');
await page.click('button[type=submit]');
await page.waitForNavigation({ waitUntil: 'networkidle2' });

// Ir para lista de equipamentos
await page.goto('https://homologacao.axcross.axion.ws/equipments/equipment/equipment', { waitUntil: 'networkidle2' });
await page.waitForSelector('tbody tr', { timeout: 8000 }).catch(() => {});
await new Promise(r => setTimeout(r, 2500));

// Buscar TODOS os elementos com onclick (não só button)
const allOnclick = await page.evaluate(() => {
  const els = Array.from(document.querySelectorAll('[onclick]'));
  return els.map(el => ({ tag: el.tagName, class: el.className, onclick: el.getAttribute('onclick') }));
});
console.log('TODOS os elementos com onclick:');
allOnclick.forEach(el => console.log(`  <${el.tag}> class="${el.class}" onclick="${el.onclick}"`));

// Verificar estrutura da linha "Ação"
const acaoCol = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('tbody tr')).slice(0, 3);
  return rows.map(r => {
    const tds = Array.from(r.querySelectorAll('td'));
    const lastTd = tds[tds.length - 1];
    return {
      rowText: r.textContent.replace(/\s+/g,' ').trim().slice(0,100),
      lastTdHtml: lastTd?.innerHTML || 'N/A',
    };
  });
});
console.log('\nColunas Ação das primeiras linhas:');
acaoCol.forEach(r => {
  console.log(`  Row: ${r.rowText}`);
  console.log(`  Ação HTML: ${r.lastTdHtml.slice(0, 300)}`);
  console.log('');
});

// Verificar o que acontece ao submeter um novo equipamento
// Criar equipamento de teste e ver URL de redirect
const testCode = `EQ-TEST-DEBUG-${Date.now()}`;
await page.goto('https://homologacao.axcross.axion.ws/equipments/equipment/create', { waitUntil: 'networkidle2' });
await page.type('#EquipmentCode', testCode);
await page.type('#SerialNumber', `SN-DEBUG-${Date.now()}`);
console.log('\nSubmetendo equipamento de teste:', testCode);
await page.click('button[type="submit"]');
await Promise.race([
  page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
  new Promise(r => setTimeout(r, 4000))
]);
const urlAfterCreate = page.url();
console.log('URL após criar equipamento:', urlAfterCreate);

// Verificar se tem GUID na URL ou no DOM
const postCreateInfo = await page.evaluate(() => {
  const hiddenId = document.querySelector('#equipmentId, #Id, input[name="Id"]')?.value;
  const editLinks = Array.from(document.querySelectorAll('[onclick*="equipment.edit"], a[href*="edit"], a[href*="detail"]'))
    .slice(0, 3).map(el => ({ tag: el.tagName, onclick: el.getAttribute('onclick'), href: el.href }));
  return { hiddenId, editLinks, url: window.location.href };
});
console.log('Info após criação:', JSON.stringify(postCreateInfo, null, 2));

await browser.close();
