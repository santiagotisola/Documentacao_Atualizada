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
console.log('Logado:', page.url());

// Explorar /equipments/equipment/lane
await page.goto('https://homologacao.axcross.axion.ws/equipments/equipment/lane', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 2000));
console.log('URL:', page.url());

const laneListData = await page.evaluate(() => {
  const headers = Array.from(document.querySelectorAll('th')).map(th => th.textContent.trim());
  const rows = Array.from(document.querySelectorAll('tbody tr')).slice(0, 5).map(r => ({
    text: r.textContent.replace(/\s+/g, ' ').trim().slice(0, 150),
    links: Array.from(r.querySelectorAll('a')).map(a => ({ href: a.href, text: a.textContent.trim() })),
    btns: Array.from(r.querySelectorAll('button,[onclick]')).map(b => ({ text: b.textContent.trim(), onclick: b.getAttribute('onclick') || '' })),
  }));
  const allLinks = Array.from(document.querySelectorAll('a[href]'))
    .map(a => ({ href: a.href, text: a.textContent.trim() }))
    .filter(a => a.href.includes('axcross') && a.text);
  const html = document.body?.innerHTML?.slice(0, 5000) || '';
  return { headers, rows, allLinks, html };
});

console.log('Headers:', laneListData.headers);
console.log('Rows:', JSON.stringify(laneListData.rows, null, 2));
console.log('Links:', JSON.stringify(laneListData.allLinks));
console.log('HTML (3000):\n', laneListData.html.slice(0, 3000));

// Testar URL de criação de faixa
const createUrls = [
  '/equipments/equipment/lane/create',
  '/equipments/equipment/lane/new',
  '/equipments/lane/create',
];
for (const path of createUrls) {
  try {
    await page.goto('https://homologacao.axcross.axion.ws' + path, { waitUntil: 'domcontentloaded', timeout: 8000 });
    const finalUrl = page.url();
    if (!finalUrl.includes('chrome-error')) {
      const form = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input,select,textarea')).map(el => ({
          tag: el.tagName, id: el.id, name: el.name, type: el.type || '',
          options: el.tagName === 'SELECT' ? Array.from(el.options).slice(0,10).map(o => ({ val: o.value, text: o.text })) : undefined,
        }));
        return { inputs, title: document.querySelector('h1,h2,.card-title')?.textContent?.trim() };
      });
      console.log(`\n=== ${path} ===`);
      console.log('URL final:', finalUrl);
      console.log('Inputs:', JSON.stringify(form.inputs, null, 2));
    } else {
      console.log(`${path} → chrome-error`);
    }
  } catch (e) {
    console.log(`${path} → ERRO: ${e.message.slice(0, 80)}`);
  }
}

// Também olhar o formulário de edição de equipamento para ver se tem lanes lá
// Pegar primeiro ID real
await page.goto('https://homologacao.axcross.axion.ws/equipments/equipment/equipment', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 2000));

// Clicar no botão edit do primeiro equipamento
const editClicked = await page.evaluate(() => {
  const btn = document.querySelector('button[onclick*="equipment.edit"]');
  if (btn) {
    const onclick = btn.getAttribute('onclick');
    const match = onclick?.match(/id:'([^']+)'/);
    return match?.[1];
  }
  return null;
});
console.log('\nEquipamento ID para editar:', editClicked);

if (editClicked) {
  // Tentar editar/detalhe diretamente via URL
  const editUrls = [
    `/equipments/equipment/edit/${editClicked}`,
    `/equipments/equipment/${editClicked}/edit`,
    `/equipments/equipment/${editClicked}`,
    `/equipments/equipment/detail/${editClicked}`,
  ];
  for (const path of editUrls) {
    try {
      await page.goto('https://homologacao.axcross.axion.ws' + path, { waitUntil: 'domcontentloaded', timeout: 8000 });
      const finalUrl = page.url();
      if (!finalUrl.includes('chrome-error') && !finalUrl.includes('equipment/equipment')) {
        const info = await page.evaluate(() => ({
          title: document.title,
          h1: document.querySelector('h1,h2')?.textContent?.trim(),
          inputs: Array.from(document.querySelectorAll('input,select')).map(el => ({ id: el.id, name: el.name })),
          tabs: Array.from(document.querySelectorAll('[role=tab],.nav-link')).map(t => t.textContent.trim()),
        }));
        console.log(`${path} → ${finalUrl}`);
        console.log('  Info:', JSON.stringify(info));
      } else {
        console.log(`${path} → mesma página ou chrome-error`);
      }
    } catch (e) {
      console.log(`${path} → ERRO: ${e.message.slice(0, 60)}`);
    }
  }

  // Tentar via JavaScript API
  await page.goto('https://homologacao.axcross.axion.ws/equipments/equipment/equipment', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  const editBtn = await page.$('button[onclick*="equipment.edit"]');
  if (editBtn) {
    await editBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    const modal = await page.evaluate(() => {
      const modal = document.querySelector('.modal.show, .modal[style*="display: block"], [role="dialog"]');
      if (!modal) return null;
      const inputs = Array.from(modal.querySelectorAll('input,select,textarea')).map(el => ({
        tag: el.tagName, id: el.id, name: el.name, type: el.type || '',
        options: el.tagName === 'SELECT' ? Array.from(el.options).slice(0,10).map(o => ({ val: o.value, text: o.text })) : undefined,
      }));
      const tabs = Array.from(modal.querySelectorAll('[role=tab],.nav-link,.tab-link')).map(t => ({
        text: t.textContent.trim(), href: t.href || t.getAttribute('data-target') || t.getAttribute('aria-controls') || ''
      }));
      return { inputs, tabs };
    });
    console.log('\n=== MODAL EDIÇÃO EQUIPAMENTO ===');
    console.log(JSON.stringify(modal, null, 2));
  }
}

await browser.close();
