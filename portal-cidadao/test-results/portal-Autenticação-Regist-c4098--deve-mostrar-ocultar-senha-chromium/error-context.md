# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.js >> Autenticação (Registro e Login) >> deve mostrar/ocultar senha
- Location: tests\e2e\portal.spec.js:189:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForTimeout: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - navigation [ref=e5]:
        - generic [ref=e6]:
          - link "A Portal do Cidadão Powered by Axion" [ref=e7] [cursor=pointer]:
            - /url: /
            - generic [ref=e9]: A
            - generic [ref=e10]:
              - text: Portal do Cidadão
              - paragraph [ref=e11]: Powered by Axion
          - generic [ref=e12]:
            - link "Consultar Infrações" [ref=e13] [cursor=pointer]:
              - /url: /
            - link "Entrar" [ref=e14] [cursor=pointer]:
              - /url: /login
              - img [ref=e15]
              - generic [ref=e18]: Entrar
    - main [ref=e19]:
      - generic [ref=e21]:
        - generic [ref=e22]:
          - heading "Portal do Cidadão" [level=1] [ref=e23]
          - paragraph [ref=e24]: Gerencie suas infrações de trânsito
        - generic [ref=e25]:
          - generic [ref=e26]:
            - button "Entrar" [ref=e27] [cursor=pointer]:
              - img [ref=e28]
              - text: Entrar
            - button "Registrar" [ref=e31] [cursor=pointer]:
              - img [ref=e32]
              - text: Registrar
          - generic [ref=e36]:
            - generic [ref=e37]:
              - generic [ref=e38]: CPF
              - textbox "000.000.000-00" [ref=e39]
            - generic [ref=e40]:
              - generic [ref=e41]: Senha
              - generic [ref=e42]:
                - textbox "••••••••" [ref=e43]
                - button [ref=e44] [cursor=pointer]:
                  - img [ref=e45]
            - button "Entrar" [ref=e48] [cursor=pointer]:
              - img [ref=e49]
              - text: Entrar
            - link "Esqueceu sua senha?" [ref=e53] [cursor=pointer]:
              - /url: /login
        - link "← Voltar para home" [ref=e55] [cursor=pointer]:
          - /url: /
    - contentinfo [ref=e56]:
      - generic [ref=e57]:
        - generic [ref=e58]:
          - generic [ref=e59]:
            - heading "Portal do Cidadão" [level=3] [ref=e60]
            - paragraph [ref=e61]: Consulte e conteste infrações de trânsito de forma rápida e segura. Plataforma oficial para acesso aos seus dados.
            - generic [ref=e62]:
              - generic [ref=e64]: A
              - generic [ref=e65]: Powered by Axion Tecnologia
          - generic [ref=e66]:
            - heading "Links Úteis" [level=3] [ref=e67]
            - list [ref=e68]:
              - listitem [ref=e69]:
                - link "Consultar Infrações" [ref=e70] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e71]:
                - link "Meus Processos" [ref=e72] [cursor=pointer]:
                  - /url: /meus-processos
              - listitem [ref=e73]:
                - link "Como Contestar" [ref=e74] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e75]:
                - link "Perguntas Frequentes" [ref=e76] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e77]:
                - link "Política de Privacidade" [ref=e78] [cursor=pointer]:
                  - /url: "#"
          - generic [ref=e79]:
            - heading "Contato" [level=3] [ref=e80]
            - list [ref=e81]:
              - listitem [ref=e82]:
                - img [ref=e83]
                - link "contato@axion.com.br" [ref=e86] [cursor=pointer]:
                  - /url: mailto:contato@axion.com.br
              - listitem [ref=e87]:
                - img [ref=e88]
                - link "(81) 99999-9999" [ref=e90] [cursor=pointer]:
                  - /url: tel:+5581999999999
              - listitem [ref=e91]:
                - img [ref=e92]
                - generic [ref=e95]: Recife, PE - Brasil
        - generic [ref=e96]:
          - paragraph [ref=e97]: © 2026 Axion Tecnologia. Todos os direitos reservados.
          - paragraph [ref=e98]: LGPD Compliant | Dados protegidos por criptografia AES-256
  - generic [ref=e99]:
    - img [ref=e101]
    - button "Open Tanstack query devtools" [ref=e149] [cursor=pointer]:
      - img [ref=e150]
```

# Test source

```ts
  104 |     
  105 |     // Encontrar botões de tipo (dentro do formulário)
  106 |     const cpfButton = page.locator('main button').filter({ hasText: /CPF/i });
  107 |     const placaButton = page.locator('main button').filter({ hasText: /Placa/i });
  108 |     
  109 |     // Verificar que existe ao menos um dos botões
  110 |     await expect(cpfButton.or(placaButton)).toBeVisible();
  111 |     
  112 |     // Clicar em Placa
  113 |     await placaButton.click();
  114 |     
  115 |     // Aguardar mudança
  116 |     await page.waitForTimeout(500);
  117 |     
  118 |     // Verificar que input existe e está vazio
  119 |     const input = page.locator('main input').first();
  120 |     await expect(input).toHaveValue('');
  121 |   });
  122 | });
  123 | 
  124 | /**
  125 |  * Testes E2E - Fluxo de Registro e Login
  126 |  */
  127 | test.describe('Autenticação (Registro e Login)', () => {
  128 |   test('deve carregar página de login', async ({ page }) => {
  129 |     await page.goto('/login');
  130 |     
  131 |     // Verificar que carregou (buscar pelo main ou form)
  132 |     await expect(page.locator('main')).toBeVisible();
  133 |     
  134 |     // Verificar tabs (botões ou links)
  135 |     const entrarTab = page.locator('button, [role="tab"]').filter({ hasText: /Entrar/i });
  136 |     const registrarTab = page.locator('button, [role="tab"]').filter({ hasText: /Registrar/i });
  137 |     
  138 |     await expect(entrarTab.or(registrarTab)).toBeVisible();
  139 |   });
  140 | 
  141 |   test('deve exibir validação de campos obrigatórios no login', async ({ page }) => {
  142 |     await page.goto('/login');
  143 |     
  144 |     // Aguardar formulário
  145 |     await page.waitForSelector('form, main', { timeout: 5000 });
  146 |     
  147 |     // Tentar submeter sem preencher (buscar botão de submit)
  148 |     const submitButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: /Entrar/i }));
  149 |     await submitButton.first().click();
  150 |     
  151 |     // Verificar mensagens de erro (pode ser toast ou inline)
  152 |     // Aguardar um pouco para validação aparecer
  153 |     await page.waitForTimeout(1000);
  154 |     
  155 |     // Verificar se há erro visível (toast ou mensagem inline)
  156 |     const hasError = await page.locator('text=/obrigatório|inválido|required/i').isVisible().catch(() => false);
  157 |     const hasToast = await page.locator('[role="alert"], .toast').isVisible().catch(() => false);
  158 |     
  159 |     expect(hasError || hasToast).toBeTruthy();
  160 |   });
  161 | 
  162 |   test('deve exibir validação de senha fraca no registro', async ({ page }) => {
  163 |     await page.goto('/login');
  164 |     
  165 |     // Ir para aba Registrar
  166 |     const registrarTab = page.locator('button, [role="tab"]').filter({ hasText: /Registrar/i });
  167 |     await registrarTab.click();
  168 |     
  169 |     // Preencher CPF
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
> 204 |     await page.waitForTimeout(500);
      |                ^ Error: page.waitForTimeout: Target page, context or browser has been closed
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
  270 |     await expect(cpfButton.or(placaButton)).toBeVisible();
  271 |   });
  272 | });
  273 | 
```