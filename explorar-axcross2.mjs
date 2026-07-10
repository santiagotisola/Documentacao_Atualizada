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

// Abrir página de equipamentos e aguardar carregamento completo da tabela
await page.goto('https://homologacao.axcross.axion.ws/equipments/equipment/equipment', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 3000));

const pageData = await page.evaluate(() => {
  const headers = Array.from(document.querySelectorAll('th')).map(th => th.textContent.trim());
  const rows = Array.from(document.querySelectorAll('tbody tr')).slice(0, 5).map(r => ({
    text: r.textContent.replace(/\s+/g, ' ').trim().slice(0, 120),
    links: Array.from(r.querySelectorAll('a')).map(a => ({ href: a.href, text: a.textContent.trim() })),
    btns: Array.from(r.querySelectorAll('button,[onclick],[data-href]')).map(b => ({
      text: b.textContent.trim(), onclick: b.getAttribute('onclick') || '', datahref: b.getAttribute('data-href') || ''
    })),
  }));
  const allLinks = Array.from(document.querySelectorAll('a[href]'))
    .map(a => a.href).filter(h => h.includes('axcross')).filter((h,i,arr) => arr.indexOf(h) === i);
  return { headers, rows, allLinks };
});

console.log('Headers:', pageData.headers);
console.log('Rows:', JSON.stringify(pageData.rows, null, 2));
console.log('All links on page:', pageData.allLinks);

// Tentar URLs alternativas para lane
console.log('\n=== TESTANDO URLs DE FAIXA ===');
const testUrls = [
  '/equipments/lane',
  '/equipments/lane/create',
  '/lane',
  '/lanes',
  '/equipments/camera/lane',
  '/equipments/equipment/lane',
];
for (const path of testUrls) {
  try {
    await page.goto('https://homologacao.axcross.axion.ws' + path, { waitUntil: 'domcontentloaded', timeout: 8000 });
    const finalUrl = page.url();
    if (finalUrl.includes('chrome-error')) {
      console.log(path, '→ chrome-error (SSL ou DNS)');
    } else if (finalUrl.includes('Login')) {
      console.log(path, '→ redirect para login');
    } else {
      const title = await page.title();
      const h1 = await page.$eval('h1,h2', el => el.textContent.trim()).catch(() => 'n/a');
      console.log(path, '→', finalUrl, '|', title, '|', h1);
    }
  } catch(e) {
    console.log(path, '→ EXCEPTION:', e.message.slice(0, 80));
  }
}

// Verificar o menu completo expandido
await page.goto('https://homologacao.axcross.axion.ws', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1000));

// Expandir menus clicando em cada item de nav
const menuItems = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('nav a, .sidebar a, .menu a, .navbar a, .nav-item a'))
    .map(a => ({ href: a.href, text: a.textContent.trim() }))
    .filter(a => a.text && a.href)
    .filter((a, i, arr) => arr.findIndex(x => x.href === a.href) === i);
});
console.log('\n=== MENU COMPLETO ===');
menuItems.forEach(m => console.log(`  ${m.text} → ${m.href}`));

// Verificar se Equipamentos tem submenu
const equipMenu = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('[href*="equipment"], [data-href*="equipment"]'));
  return links.map(el => ({ tag: el.tagName, href: el.href || el.getAttribute('data-href'), text: el.textContent.trim(), parent: el.parentElement?.className }));
});
console.log('\nMenu Equipamentos:', JSON.stringify(equipMenu, null, 2));

await browser.close();
