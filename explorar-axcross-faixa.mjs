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

// Mapear toda a navegação disponível após login
await page.goto('https://homologacao.axcross.axion.ws', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1500));

const navLinks = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('a[href]'))
    .map(a => ({ href: a.href, text: a.textContent.trim() }))
    .filter(a => a.href.includes('axcross') && a.text && a.text.length > 1)
    .filter((a, i, arr) => arr.findIndex(x => x.href === a.href) === i)
    .sort((a, b) => a.href.localeCompare(b.href));
});
console.log('\n=== NAVEGAÇÃO COMPLETA ===');
navLinks.forEach(l => console.log(`  ${l.href}  |  ${l.text}`));

// Pegar um equipamento real da listagem
await page.goto('https://homologacao.axcross.axion.ws/equipments/equipment/equipment', { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1500));

const equipData = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('tr')).slice(1, 6);
  const links = Array.from(document.querySelectorAll('a[href*="equipment"]'))
    .map(a => ({ href: a.href, text: a.textContent.trim() }))
    .filter(a => a.href.match(/\/\d+/) || a.href.includes('edit') || a.href.includes('detail'));
  const allLinks = Array.from(document.querySelectorAll('a[href]'))
    .map(a => a.href)
    .filter(h => h.includes('axcross') && !h.includes('account'))
    .filter((h, i, arr) => arr.indexOf(h) === i)
    .sort();
  return { links, allLinks: allLinks.slice(0, 30) };
});
console.log('\n=== EQUIPAMENTOS PAGE LINKS ===');
equipData.links.forEach(l => console.log(`  ${l.href}  |  ${l.text}`));
console.log('\n=== ALL LINKS NESSA PÁGINA ===');
equipData.allLinks.forEach(h => console.log('  ' + h));

// Tentar acessar um equipamento específico para ver tabs/faixas
const firstEquipLink = equipData.allLinks.find(h => h.match(/equipment\/\d+/));
if (firstEquipLink) {
  console.log('\nAcessando equipamento:', firstEquipLink);
  await page.goto(firstEquipLink, { waitUntil: 'networkidle2' });
  const detail = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'))
      .map(a => ({ href: a.href, text: a.textContent.trim() }))
      .filter(a => a.href.includes('axcross') && a.text);
    const tabs = Array.from(document.querySelectorAll('[role=tab], .nav-tab, .nav-link'))
      .map(t => ({ text: t.textContent.trim(), href: t.href || t.getAttribute('data-href') || '' }));
    return { links: links.slice(0, 20), tabs };
  });
  console.log('Links no detalhe:', JSON.stringify(detail.links.slice(0, 10)));
  console.log('Tabs:', JSON.stringify(detail.tabs));
}

await browser.close();
