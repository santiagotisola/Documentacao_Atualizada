import puppeteer from 'puppeteer';

const BASE = 'https://homologacao.axhub.axion.ws';

const FORMS_TO_MAP = [
  'via', 'trecho', 'localidade', 'pontofiscalizacao',
  'fabricante', 'tipoequipamento', 'modeloequipamento',
  'grupoequipamento', 'equipamento', 'faixa'
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  // Login
  await page.goto(`${BASE}/Home/Login`, { waitUntil: 'networkidle0', timeout: 25000 });
  await page.type('#Username', 'suporte@axiontecnologia.com.br');
  await page.type('#Password', 'Axion#2023');
  await page.click('button[type=submit]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 25000 }).catch(() => {});
  console.log('Logado:', page.url());

  const resultado = {};

  for (const form of FORMS_TO_MAP) {
    try {
      const url = `${BASE}/${form}/new`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
      const finalUrl = page.url();

      if (finalUrl.includes('Login')) {
        console.log(`${form} -> REDIRECIONOU PARA LOGIN`);
        continue;
      }

      const fields = await page.evaluate(() => {
        const results = [];
        const seen = new Set();

        document.querySelectorAll('input, select, textarea').forEach(el => {
          if (!el.id || seen.has(el.id)) return;
          seen.add(el.id);

          // Pular campos de sistema
          if (el.id.startsWith('__') || el.type === 'hidden') return;

          // Tentar encontrar label
          let labelText = '';
          const labelEl = document.querySelector(`label[for="${el.id}"]`);
          if (labelEl) {
            labelText = labelEl.textContent.trim();
          } else {
            // Kendo: label é o span irmão anterior no .k-form-field ou div pai
            const parent = el.closest('.k-form-field, .form-group, .col, [class*="form"]');
            if (parent) {
              const span = parent.querySelector('span.k-label, label, .form-label');
              if (span) labelText = span.textContent.trim();
            }
          }

          const isRequired = el.required || el.getAttribute('data-val-required') ||
            el.closest('[class]')?.className?.includes('required');

          // Detectar se é FK (select ou combobox kendo)
          const isSelect = el.tagName === 'SELECT';
          const isKendo = el.closest('.k-combobox, .k-dropdownlist') !== null;
          const options = isSelect
            ? Array.from(el.options).slice(0, 8).map(o => o.text).filter(t => t && !t.includes('Selecione'))
            : [];

          results.push({
            id: el.id,
            name: el.name || el.id,
            type: el.tagName === 'SELECT' ? 'select' : (el.type || 'text'),
            label: labelText || el.placeholder || el.id,
            required: !!isRequired,
            isFK: isSelect || isKendo,
            options: options.slice(0, 5),
          });
        });
        return results;
      });

      resultado[form] = { url: finalUrl, fields };
      console.log(`\n=== ${form.toUpperCase()} (${finalUrl}) ===`);
      fields.forEach(f => {
        const fk = f.isFK ? ' [FK]' : '';
        const req = f.required ? ' *' : '';
        console.log(`  ${f.id} | ${f.label}${req}${fk} | type=${f.type} | opts=[${f.options.join(', ')}]`);
      });

    } catch (e) {
      console.log(`ERRO ${form}:`, e.message.slice(0, 100));
    }
  }

  console.log('\n\n=== JSON COMPLETO ===');
  console.log(JSON.stringify(resultado, null, 2));

  await browser.close();
})();
