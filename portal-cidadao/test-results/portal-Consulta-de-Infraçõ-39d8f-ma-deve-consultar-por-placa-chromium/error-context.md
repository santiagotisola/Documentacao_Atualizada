# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: portal.spec.js >> Consulta de Infrações Anônima >> deve consultar por placa
- Location: tests\e2e\portal.spec.js:68:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('main button').filter({ hasText: /Placa/i })

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
      - generic [ref=e20]:
        - generic [ref=e23]:
          - heading "Portal do Cidadão" [level=1] [ref=e24]
          - paragraph [ref=e25]: Consulte e conteste infrações de trânsito de forma rápida e segura
          - button "Consultar Agora" [ref=e26] [cursor=pointer]:
            - img [ref=e27]
            - generic [ref=e30]: Consultar Agora
        - generic [ref=e32]:
          - heading "Como funciona?" [level=2] [ref=e33]
          - generic [ref=e34]:
            - generic [ref=e35]:
              - img [ref=e37]
              - heading "1. Consulte" [level=3] [ref=e40]
              - paragraph [ref=e41]: Informe seu CPF ou placa do veículo para consultar infrações pendentes
            - generic [ref=e42]:
              - img [ref=e44]
              - heading "2. Analise" [level=3] [ref=e47]
              - paragraph [ref=e48]: Veja detalhes completos das infrações, incluindo fotos e documentos
            - generic [ref=e49]:
              - img [ref=e51]
              - heading "3. Conteste" [level=3] [ref=e53]
              - paragraph [ref=e54]: Abra uma contestação online com documentos e acompanhe o processo
        - generic [ref=e59]:
          - img [ref=e61]
          - generic [ref=e63]:
            - heading "Assistente Virtual com IA" [level=3] [ref=e64]
            - paragraph [ref=e65]: Tire suas dúvidas sobre infrações, processos e legislação com nosso assistente inteligente, disponível 24/7.
            - generic [ref=e66]: Disponível agora
        - generic [ref=e70]:
          - img [ref=e71]
          - heading "Segurança e Privacidade" [level=3] [ref=e73]
          - paragraph [ref=e74]: Seus dados estão protegidos por criptografia de ponta a ponta. Somos 100% conformes com a Lei Geral de Proteção de Dados (LGPD).
          - generic [ref=e75]:
            - generic [ref=e76]: 🔒 Criptografia AES-256
            - generic [ref=e77]: ✅ LGPD Compliant
            - generic [ref=e78]: 🛡️ reCAPTCHA v3
            - generic [ref=e79]: 🔐 Autenticação JWT
    - contentinfo [ref=e80]:
      - generic [ref=e81]:
        - generic [ref=e82]:
          - generic [ref=e83]:
            - heading "Portal do Cidadão" [level=3] [ref=e84]
            - paragraph [ref=e85]: Consulte e conteste infrações de trânsito de forma rápida e segura. Plataforma oficial para acesso aos seus dados.
            - generic [ref=e86]:
              - generic [ref=e88]: A
              - generic [ref=e89]: Powered by Axion Tecnologia
          - generic [ref=e90]:
            - heading "Links Úteis" [level=3] [ref=e91]
            - list [ref=e92]:
              - listitem [ref=e93]:
                - link "Consultar Infrações" [ref=e94] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e95]:
                - link "Meus Processos" [ref=e96] [cursor=pointer]:
                  - /url: /meus-processos
              - listitem [ref=e97]:
                - link "Como Contestar" [ref=e98] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e99]:
                - link "Perguntas Frequentes" [ref=e100] [cursor=pointer]:
                  - /url: "#"
              - listitem [ref=e101]:
                - link "Política de Privacidade" [ref=e102] [cursor=pointer]:
                  - /url: "#"
          - generic [ref=e103]:
            - heading "Contato" [level=3] [ref=e104]
            - list [ref=e105]:
              - listitem [ref=e106]:
                - img [ref=e107]
                - link "contato@axion.com.br" [ref=e110] [cursor=pointer]:
                  - /url: mailto:contato@axion.com.br
              - listitem [ref=e111]:
                - img [ref=e112]
                - link "(81) 99999-9999" [ref=e114] [cursor=pointer]:
                  - /url: tel:+5581999999999
              - listitem [ref=e115]:
                - img [ref=e116]
                - generic [ref=e119]: Recife, PE - Brasil
        - generic [ref=e120]:
          - paragraph [ref=e121]: © 2026 Axion Tecnologia. Todos os direitos reservados.
          - paragraph [ref=e122]: LGPD Compliant | Dados protegidos por criptografia AES-256
  - generic [ref=e123]:
    - img [ref=e125]
    - button "Open Tanstack query devtools" [ref=e173] [cursor=pointer]:
      - img [ref=e174]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Testes E2E - Portal do Cidadão
  5   |  * Fluxos: Consulta Anônima, Autenticação, Resultados, Mobile
  6   |  */
  7   | 
  8   | test.describe('Consulta de Infrações Anônima', () => {
  9   |   test('deve carregar a página home corretamente', async ({ page }) => {
  10  |     await page.goto('/');
  11  |     
  12  |     // Verificar título
  13  |     await expect(page).toHaveTitle(/Portal do Cidadão/);
  14  |     
  15  |     // Verificar header
  16  |     await expect(page.locator('header')).toBeVisible();
  17  |     
  18  |     // Verificar formulário de consulta (buscar dentro do main, não header/footer)
  19  |     await expect(page.locator('main').getByText(/Informe seu CPF ou placa/)).toBeVisible();
  20  |   });
  21  | 
  22  |   test('deve exibir validação de CPF inválido', async ({ page }) => {
  23  |     await page.goto('/');
  24  |     
  25  |     // Aguardar formulário carregar
  26  |     await page.waitForSelector('main', { timeout: 5000 });
  27  |     
  28  |     // Selecionar tipo CPF (já é default)
  29  |     // Preencher CPF inválido no input do formulário
  30  |     const input = page.locator('main input[placeholder*="CPF"]').or(page.locator('main input').first());
  31  |     await input.fill('12345678900');
  32  |     
  33  |     // Clicar em consultar (botão principal, não do header)
  34  |     await page.locator('main button:has-text("Consultar")').click();
  35  |     
  36  |     // Verificar mensagem de erro (toast)
  37  |     await expect(page.locator('text=/CPF inválido|Formato inválido/i')).toBeVisible({ timeout: 5000 });
  38  |   });
  39  | 
  40  |   test('deve consultar por CPF válido', async ({ page }) => {
  41  |     await page.goto('/');
  42  |     
  43  |     // Aguardar formulário
  44  |     await page.waitForSelector('main', { timeout: 5000 });
  45  |     
  46  |     // Preencher CPF válido (com dígitos verificadores corretos)
  47  |     const input = page.locator('main input[placeholder*="CPF"]').or(page.locator('main input').first());
  48  |     await input.fill('123.456.789-09');
  49  |     
  50  |     // Aguardar reCAPTCHA carregar
  51  |     await page.waitForTimeout(2000);
  52  |     
  53  |     // Clicar em consultar
  54  |     await page.locator('main button:has-text("Consultar")').click();
  55  |     
  56  |     // Aguardar navegação ou resposta
  57  |     await page.waitForURL('**/resultados', { timeout: 15000 }).catch(() => {
  58  |       // Pode não redirecionar se não encontrar infrações
  59  |     });
  60  |     
  61  |     // Verificar se está na página de resultados ou se exibe "nenhuma infração"
  62  |     const hasResultados = await page.url().includes('/resultados');
  63  |     const hasToast = await page.locator('text=/Nenhuma infração|Erro/i').isVisible({ timeout: 5000 }).catch(() => false);
  64  |     
  65  |     expect(hasResultados || hasToast).toBeTruthy();
  66  |   });
  67  | 
  68  |   test('deve consultar por placa', async ({ page }) => {
  69  |     await page.goto('/');
  70  |     
  71  |     // Aguardar formulário
  72  |     await page.waitForSelector('main', { timeout: 5000 });
  73  |     
  74  |     // Selecionar tipo placa (buscar botão dentro do formulário)
  75  |     const placaButton = page.locator('main button').filter({ hasText: /Placa/i });
> 76  |     await placaButton.click();
      |                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  77  |     
  78  |     // Verificar que o placeholder mudou
  79  |     const input = page.locator('main input').first();
  80  |     await expect(input).toHaveAttribute('placeholder', /ABC|placa/i);
  81  |     
  82  |     // Preencher placa
  83  |     await input.fill('ABC-1234');
  84  |     
  85  |     // Aguardar reCAPTCHA
  86  |     await page.waitForTimeout(2000);
  87  |     
  88  |     // Clicar em consultar
  89  |     await page.locator('main button:has-text("Consultar")').click();
  90  |     
  91  |     // Aguardar resposta
  92  |     await page.waitForTimeout(3000);
  93  |     
  94  |     // Verificar navegação ou toast
  95  |     const currentUrl = page.url();
  96  |     expect(currentUrl).toMatch(/\/(resultados)?|\/$/);
  97  |   });
  98  | 
  99  |   test('deve alternar entre CPF e Placa', async ({ page }) => {
  100 |     await page.goto('/');
  101 |     
  102 |     // Aguardar formulário
  103 |     await page.waitForSelector('main', { timeout: 5000 });
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
```