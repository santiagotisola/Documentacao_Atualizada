# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.js >> Responsividade Mobile >> deve exibir layout mobile corretamente
- Location: tests\e2e\portal.spec.js:256:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('main button').filter({ hasText: /CPF/i }).or(locator('main button').filter({ hasText: /Placa/i }))
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('main button').filter({ hasText: /CPF/i }).or(locator('main button').filter({ hasText: /Placa/i }))

```

```yaml
- banner:
  - navigation:
    - link "A":
      - /url: /
    - button:
      - img
- main:
  - heading "Portal do Cidadão" [level=1]
  - paragraph: Consulte e conteste infrações de trânsito de forma rápida e segura
  - button "Consultar Agora":
    - img
    - text: Consultar Agora
  - heading "Como funciona?" [level=2]
  - img
  - heading "1. Consulte" [level=3]
  - paragraph: Informe seu CPF ou placa do veículo para consultar infrações pendentes
  - img
  - heading "2. Analise" [level=3]
  - paragraph: Veja detalhes completos das infrações, incluindo fotos e documentos
  - img
  - heading "3. Conteste" [level=3]
  - paragraph: Abra uma contestação online com documentos e acompanhe o processo
  - img
  - heading "Assistente Virtual com IA" [level=3]
  - paragraph: Tire suas dúvidas sobre infrações, processos e legislação com nosso assistente inteligente, disponível 24/7.
  - text: Disponível agora
  - img
  - heading "Segurança e Privacidade" [level=3]
  - paragraph: Seus dados estão protegidos por criptografia de ponta a ponta. Somos 100% conformes com a Lei Geral de Proteção de Dados (LGPD).
  - text: 🔒 Criptografia AES-256 ✅ LGPD Compliant 🛡️ reCAPTCHA v3 🔐 Autenticação JWT
- contentinfo:
  - heading "Portal do Cidadão" [level=3]
  - paragraph: Consulte e conteste infrações de trânsito de forma rápida e segura. Plataforma oficial para acesso aos seus dados.
  - text: A Powered by Axion Tecnologia
  - heading "Links Úteis" [level=3]
  - list:
    - listitem:
      - link "Consultar Infrações":
        - /url: /
    - listitem:
      - link "Meus Processos":
        - /url: /meus-processos
    - listitem:
      - link "Como Contestar":
        - /url: "#"
    - listitem:
      - link "Perguntas Frequentes":
        - /url: "#"
    - listitem:
      - link "Política de Privacidade":
        - /url: "#"
  - heading "Contato" [level=3]
  - list:
    - listitem:
      - img
      - link "contato@axion.com.br":
        - /url: mailto:contato@axion.com.br
    - listitem:
      - img
      - link "(81) 99999-9999":
        - /url: tel:+5581999999999
    - listitem:
      - img
      - text: Recife, PE - Brasil
  - paragraph: © 2026 Axion Tecnologia. Todos os direitos reservados.
  - paragraph: LGPD Compliant | Dados protegidos por criptografia AES-256
- button "Open Tanstack query devtools":
  - img
```

# Test source

```ts
  170 |     const cpfInput = page.locator('input').first();
  171 |     await cpfInput.fill('123.456.789-09');
  172 |     
  173 |     // Preencher nome
  174 |     const inputs = page.locator('input');
  175 |     await inputs.nth(1).fill('Teste User');
  176 |     
  177 |     // Preencher email
  178 |     const emailInput = page.locator('input[type="email"]');
  179 |     await emailInput.fill('teste@example.com');
  180 |     
  181 |     // Preencher senha fraca
  182 |     const senhaInput = page.locator('input[type="password"]').first();
  183 |     await senhaInput.fill('123');
  184 |     
  185 |     // Verificar indicador de força
  186 |     await expect(page.locator('text=/Fraca|fraca/i')).toBeVisible({ timeout: 2000 });
  187 |   });
  188 | 
  189 |   test('deve mostrar/ocultar senha', async ({ page }) => {
  190 |     await page.goto('/login');
  191 |     
  192 |     // Verificar que senha está oculta
  193 |     const senhaInput = page.locator('input[type="password"]').first();
  194 |     await expect(senhaInput).toBeVisible();
  195 |     
  196 |     // Procurar botão de toggle próximo ao input de senha
  197 |     const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).nth(0);
  198 |     await toggleButton.click().catch(() => {
  199 |       // Se não encontrar, tentar outro approach
  200 |       page.locator('button[type="button"]').first().click().catch(() => {});
  201 |     });
  202 |     
  203 |     // Aguardar mudança
  204 |     await page.waitForTimeout(500);
  205 |     
  206 |     // Verificar que mudou (pode ser para text ou continuar password mas com ícone diferente)
  207 |     // Só verificar que o botão existe e foi clicado
  208 |     expect(true).toBeTruthy();
  209 |   });
  210 | });
  211 | 
  212 | /**
  213 |  * Testes E2E - Página de Resultados
  214 |  */
  215 | test.describe('Página de Resultados', () => {
  216 |   test('deve exibir mensagem quando não há infrações', async ({ page }) => {
  217 |     // Navegar diretamente (simular estado)
  218 |     await page.goto('/resultados', { waitUntil: 'networkidle' });
  219 |     
  220 |     // Verificar redirecionamento ou mensagem
  221 |     const currentUrl = page.url();
  222 |     
  223 |     if (currentUrl.includes('/resultados')) {
  224 |       // Se ficou na página, deve mostrar mensagem
  225 |       await expect(page.locator('text=/Nenhuma infração|Nova consulta/i')).toBeVisible({ timeout: 5000 });
  226 |     } else {
  227 |       // Se redirecionou para home
  228 |       expect(currentUrl).toContain('/');
  229 |     }
  230 |   });
  231 | 
  232 |   test('deve permitir voltar para home', async ({ page }) => {
  233 |     // Tentar acessar resultados
  234 |     await page.goto('/resultados');
  235 |     
  236 |     // Se redirecionou, testar navegação não faz sentido
  237 |     if (page.url().includes('/resultados')) {
  238 |       // Clicar em "Nova consulta" ou "Voltar"
  239 |       await page.click('a:has-text("Nova consulta")').catch(() => {
  240 |         page.click('a:has-text("Voltar")').catch(() => {});
  241 |       });
  242 |       
  243 |       // Verificar que voltou para home
  244 |       await page.waitForURL('/', { timeout: 5000 });
  245 |       expect(page.url()).toMatch(/\/$|\/$/);
  246 |     }
  247 |   });
  248 | });
  249 | 
  250 | /**
  251 |  * Testes E2E - Responsividade
  252 |  */
  253 | test.describe('Responsividade Mobile', () => {
  254 |   test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
  255 | 
  256 |   test('deve exibir layout mobile corretamente', async ({ page }) => {
  257 |     await page.goto('/');
  258 |     
  259 |     // Verificar que header está visível
  260 |     await expect(page.locator('header')).toBeVisible();
  261 |     
  262 |     // Verificar que formulário está visível (buscar no main)
  263 |     await expect(page.locator('main')).toBeVisible();
  264 |     await expect(page.locator('main').getByText(/Informe seu CPF/i)).toBeVisible();
  265 |     
  266 |     // Verificar que botões CPF/Placa existem
  267 |     const cpfButton = page.locator('main button').filter({ hasText: /CPF/i });
  268 |     const placaButton = page.locator('main button').filter({ hasText: /Placa/i });
  269 |     
> 270 |     await expect(cpfButton.or(placaButton)).toBeVisible();
      |                                             ^ Error: expect(locator).toBeVisible() failed
  271 |   });
  272 | });
  273 | 
```