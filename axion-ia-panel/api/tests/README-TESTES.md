# 🧪 GUIA DE EXECUÇÃO DOS TESTES - LGPD GATE

## 📋 Visão Geral

Esta suíte de testes cobre **100 cenários** identificados no Code Review do LGPD Gate (whatsapp-flow.js), incluindo:

- ✅ **12 testes de sucesso** (happy path)
- ❌ **18 testes de erro** (error handling)
- 🔍 **25 testes de edge cases**
- 🔐 **15 testes de segurança**
- ⚡ **8 testes de performance**
- 📋 **10 testes de compliance LGPD**
- 🔗 **12 testes de integração**

---

## 🚀 Setup Inicial

### 1. Instalar dependências

```bash
cd axion-ia-panel/api
npm install --save-dev @jest/globals jest
```

### 2. Verificar versão do Node.js

```bash
node --version  # Deve ser >= 18.0.0
```

### 3. Configurar variáveis de ambiente de teste

Criar arquivo `.env.test`:

```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/axion-test
JITBIT_URL=http://localhost:8080/api
JITBIT_USER=test-user
JITBIT_PASS=test-pass
LGPD_POLITICA_URL=http://localhost:3100/public/politica-test.pdf
```

---

## ▶️ Executando os Testes

### Todos os testes

```bash
npm test
```

### Apenas testes LGPD Gate

```bash
npm run test:lgpd
```

### Testes críticos (mais importantes)

```bash
npm run test:critical
```

### Testes de segurança

```bash
npm run test:security
```

### Com cobertura de código

```bash
npm run test:coverage
```

Relatório gerado em: `coverage/lcov-report/index.html`

### Modo watch (desenvolvimento)

```bash
npm run test:watch
```

### Executar teste específico

```bash
npx jest -t "TC001"  # Executa apenas TC001
npx jest -t "LGPD Bypass"  # Executa testes com "LGPD Bypass" no nome
```

---

## 📊 Interpretar Resultados

### Saída de sucesso ✅

```
PASS  tests/whatsapp-flow.test.js
  LGPD Gate - Testes Críticos
    TC001: Fluxo completo de abertura de ticket com sucesso
      ✓ deve criar sessão, aceitar LGPD e abrir ticket (125ms)
    TC014: LGPD Bypass via aprovação de compras
      ✓ NÃO deve processar aprovação sem consentimento (45ms)
      ✓ deve processar aprovação APÓS aceitar LGPD (38ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Time:        3.245 s
```

### Saída de falha ❌

```
FAIL  tests/whatsapp-flow.test.js
  TC015: Sanitização de inputs maliciosos
    ✕ deve remover tags HTML/script do assunto (89ms)

  ● TC015: Sanitização de inputs maliciosos › deve remover tags HTML/script

    expect(received).not.toContain(expected)

    Expected substring: not "<script>"
    Received string:    "<script>alert('XSS')</script>Assunto"

      at Object.<anonymous> (tests/whatsapp-flow.test.js:245:52)
```

**Ação:** O código não está sanitizando HTML. Aplicar correção do Issue #3 do Code Review.

---

## 🐛 Debugging

### Ativar logs detalhados

```bash
DEBUG=* npm test
```

### Debugar com VSCode

Adicionar em `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "--runInBand",
    "--no-cache",
    "--watchAll=false",
    "whatsapp-flow.test.js"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

Colocar breakpoints e pressionar F5.

### Ver mocks chamados

```javascript
console.log(jitbit.criarTicketUsuario.mock.calls);
console.log(whatsappService.enviarMensagem.mock.calls);
```

---

## 📈 Cobertura de Código

### Meta de cobertura

| Métrica | Alvo | Crítico |
|---------|------|---------|
| Statements | 85% | 80% |
| Branches | 80% | 75% |
| Functions | 90% | 85% |
| Lines | 85% | 80% |

### Ver relatório HTML

```bash
npm run test:coverage
start coverage/lcov-report/index.html  # Windows
open coverage/lcov-report/index.html   # Mac
xdg-open coverage/lcov-report/index.html  # Linux
```

### Identificar código não testado

Abrir `coverage/lcov-report/whatsapp-flow.js.html`

- 🟢 Verde: Coberto
- 🟡 Amarelo: Parcialmente coberto
- 🔴 Vermelho: Não coberto

---

## 🔧 Problemas Comuns

### Erro: "Cannot find module"

```bash
npm install
```

### Erro: "Timeout of 5000ms exceeded"

Aumentar timeout no teste:

```javascript
it("meu teste lento", async () => {
  // ...
}, 30000); // 30 segundos
```

### Erro: "MongoDB connection failed"

Iniciar MongoDB:

```bash
docker run -d -p 27017:27017 --name mongo-test mongo:latest
```

### Testes passam localmente mas falham no CI

Verificar:
- Variáveis de ambiente no CI
- Timeout do CI (pode ser mais lento)
- Portas ocupadas

---

## 🎯 Roadmap de Testes

### Sprint 1 (Implementados ✅)

- [x] TC001: Fluxo completo sucesso
- [x] TC014: LGPD Bypass
- [x] TC015: SQL/XSS Injection
- [x] TC016: Upload malicioso
- [x] TC018: Rate limiting
- [x] TC019: Timeout API
- [x] TC031: Emojis unicode
- [x] TC079: Logs LGPD
- [x] TC089: Retry 503

### Sprint 2 (Próximos)

- [ ] TC020: MongoDB desconectado
- [ ] TC021: Jitbit AUTH_FAILED
- [ ] TC022: Sessão corrompida
- [ ] TC036: Sessão expira
- [ ] TC039: Race condition
- [ ] TC072: Query lenta
- [ ] TC073: Cache hit/miss
- [ ] TC074: Memory leak

### Sprint 3 (Futuros)

- [ ] TC056-TC070: Todos testes de segurança
- [ ] TC080-TC088: Todos testes LGPD
- [ ] TC071: Carga 1000 usuários
- [ ] TC078: Stress test

---

## 📝 Boas Práticas

### 1. Nomear testes claramente

```javascript
// ✅ BOM
it("deve rejeitar arquivo executável (.exe)", async () => {

// ❌ RUIM
it("test upload", async () => {
```

### 2. Arrange-Act-Assert

```javascript
it("teste", async () => {
  // ARRANGE (preparar)
  const telefone = "5511999999999";
  const mockSessao = { ... };

  // ACT (executar)
  await processarMensagemWA(telefone, "Nome", "texto");

  // ASSERT (verificar)
  expect(mockSessao.estado).toBe("menu");
});
```

### 3. Limpar mocks

```javascript
beforeEach(() => {
  jest.clearAllMocks();  // Limpa contadores
  jest.resetModules();   // Reseta cache de módulos
});

afterEach(() => {
  jest.restoreAllMocks(); // Restaura implementações originais
});
```

### 4. Testar comportamento, não implementação

```javascript
// ✅ BOM - Testa o resultado
expect(mockSessao.estado).toBe("menu");

// ❌ RUIM - Testa implementação interna
expect(mockSessao.save).toHaveBeenCalledTimes(1);
```

### 5. Um assert principal por teste

```javascript
// ✅ BOM
it("deve criar ticket", async () => {
  await processarMensagemWA(...);
  expect(jitbit.criarTicketUsuario).toHaveBeenCalled();
});

it("deve salvar sessão", async () => {
  await processarMensagemWA(...);
  expect(mockSessao.save).toHaveBeenCalled();
});

// ❌ RUIM - Teste faz muitas coisas
it("deve criar ticket e salvar sessão e enviar mensagem", async () => {
  expect(...);
  expect(...);
  expect(...);
});
```

---

## 🔗 Referências

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [REVIEW-LGPD-GATE-PARTE-1.md](../REVIEW-LGPD-GATE-PARTE-1.md) - Code Review completo
- [REVIEW-LGPD-GATE-PARTE-2.md](../REVIEW-LGPD-GATE-PARTE-2.md) - 100 cenários de teste
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

---

## 📞 Suporte

**Problemas com os testes?**

1. Verificar logs: `npm test -- --verbose`
2. Limpar cache: `npm test -- --clearCache`
3. Atualizar dependências: `npm update`
4. Abrir issue no GitHub com:
   - Output completo do erro
   - Versão do Node.js
   - Sistema operacional
   - Comando executado

---

**Última atualização:** 2026-06-24  
**Versão:** 1.0.0  
**Autor:** QA Engineer Sênior
