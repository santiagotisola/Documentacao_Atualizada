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
console.log('Logado');

// Ir para lista de equipamentos
await page.goto('https://homologacao.axcross.axion.ws/equipments/equipment/equipment', { waitUntil: 'networkidle2' });
await page.waitForSelector('tbody tr', { timeout: 8000 }).catch(() => {});
await new Promise(r => setTimeout(r, 2500));

// Verificar o que tem na tabela
const debug = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('tbody tr'));
  const editBtns = Array.from(document.querySelectorAll('button[onclick*="equipment.edit"]'));
  const allBtns = Array.from(document.querySelectorAll('button[onclick]')).map(b => ({
    onclick: b.getAttribute('onclick'), text: b.textContent.trim()
  }));
  return {
    rowCount: rows.length,
    editBtnCount: editBtns.length,
    allBtns: allBtns.slice(0, 10),
    firstRow: rows[0]?.textContent.replace(/\s+/g,' ').trim().slice(0,200),
    editBtnOnclicks: editBtns.slice(0, 5).map(b => b.getAttribute('onclick')),
    // Search specifically for EQ-AXC-ALL-001
    target: (() => {
      const btns = Array.from(document.querySelectorAll('button[onclick*="equipment.edit"]'));
      for (const btn of btns) {
        const row = btn.closest('tr');
        const text = row?.textContent || '';
        if (text.includes('EQ-AXC-ALL-001')) {
          const match = btn.getAttribute('onclick')?.match(/id:'([^']+)'/);
          return { found: true, guid: match?.[1], rowText: text.trim().slice(0,100) };
        }
      }
      return { found: false };
    })()
  };
});

console.log('Debug equipamentos list:');
console.log(JSON.stringify(debug, null, 2));

// Agora tentar o mesmo no URL sem /equipment no final
await page.goto('https://homologacao.axcross.axion.ws/equipments/equipment', { waitUntil: 'networkidle2' });
await page.waitForSelector('tbody tr', { timeout: 8000 }).catch(() => {});
await new Promise(r => setTimeout(r, 2500));
console.log('URL:', page.url());

const debug2 = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('tbody tr'));
  const editBtns = Array.from(document.querySelectorAll('button[onclick*="equipment.edit"]'));
  return {
    rowCount: rows.length,
    editBtnCount: editBtns.length,
    url: window.location.href,
  };
});
console.log('Via /equipments/equipment:', debug2);

// Também verificar o formulário de criação - para ver o que acontece após submit
await page.goto('https://homologacao.axcross.axion.ws/equipments/equipment/create', { waitUntil: 'networkidle2' });
const createPageInfo = await page.evaluate(() => ({
  url: window.location.href,
  formAction: document.querySelector('form')?.action,
  submitBtn: document.querySelector('button[type=submit]')?.textContent?.trim(),
  inputs: Array.from(document.querySelectorAll('input')).map(i => ({ id: i.id, name: i.name, type: i.type })),
}));
console.log('\nCreate page:', JSON.stringify(createPageInfo, null, 2));

await browser.close();
