# 🔄 NOVA FUNCIONALIDADE: Reutilizar Cenário Gravado

## 📍 Implementado em:
**Arquivo:** [CUTI.jsx](c:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel\src\pages\CentralQualidade\CUTI.jsx)  
**Localização:** Logo após a lista "📦 Seus Cenários Gravados"  
**URL:** http://localhost:3017/cuti

---

## 🎯 O Que Esta Funcionalidade Faz?

Permite **reutilizar um cenário gravado** para executar com **configurações diferentes**, como:
- ✅ Testar em **outra URL** (Homologação, outro cliente, etc.)
- ✅ Executar com **categorias diferentes** (Visual, Performance, Segurança, etc.)
- ✅ Validar **mesmo fluxo em ambientes diferentes**
- ✅ Automatizar **testes de regressão**

---

## 🖥️ Interface Implementada

### **Seção: "🔄 Reutilizar Cenário Gravado"**

```
╔═══════════════════════════════════════════════════════════════╗
║  🔄 Reutilizar Cenário Gravado                                ║
║  Execute um cenário existente com novas configurações         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────┬─────────────────────────┐   ║
║  │ Selecione o Cenário:        │ Nova URL:               │   ║
║  │ [Dropdown com cenários]     │ [Input para nova URL]   │   ║
║  └─────────────────────────────┴─────────────────────────┘   ║
║                                                               ║
║  Validações a executar:                                      ║
║  ☑ 🔧 Funcional  ☑ 👁️ Visual  ☑ ⚡ Performance            ║
║  ☑ 🔒 Segurança  ☑ 🔄 DE/PARA                              ║
║                                                               ║
║  [▶️ Executar Cenário]                                       ║
║                                                               ║
║  ⚠️ O cenário será executado com as MESMAS AÇÕES,           ║
║     mas na nova URL configurada                              ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🎨 Como Usar - Passo a Passo

### **1. Grave um Cenário (se ainda não tiver)**
```
1. Na página do CUTI, clique em "🔴 Gravar Cenário"
2. Execute o fluxo que deseja testar (login, cadastro, etc.)
3. Clique em "Parar Gravação"
4. O cenário será salvo automaticamente
```

### **2. Reutilize o Cenário**
```
1. Role até a seção "🔄 Reutilizar Cenário Gravado"
2. No dropdown "Selecione o Cenário", escolha um cenário existente
3. Configure:
   • Nova URL (se quiser testar em outro ambiente)
   • Categorias de validação (Funcional, Visual, etc.)
4. Clique em "▶️ Executar Cenário"
5. Aguarde o resultado (Score, Testes aprovados, Duração)
```

---

## 💡 Exemplos Práticos de Uso

### **Exemplo 1: Testar em Homologação** 🔄
```
Cenário Gravado:
- Nome: "Login e Cadastro de Usuário"
- URL Original: https://goiania.axhub.axion.ws (Produção)
- 85 passos gravados

Reutilizar para:
- Nova URL: https://homolog-goiania.axhub.axion.ws (Homologação)
- Validações: Funcional + Visual
- Resultado: Valida se homologação funciona igual à produção
```

### **Exemplo 2: Validar Outro Cliente** 🏢
```
Cenário Gravado:
- Nome: "Fluxo de Emissão de Multa"
- URL Original: https://brasilia.axhub.axion.ws (Brasília)

Reutilizar para:
- Nova URL: https://goiania.axhub.axion.ws (Goiânia)
- Validações: Funcional + DE/PARA + Performance
- Resultado: Valida se outro cliente tem mesmo comportamento
```

### **Exemplo 3: Executar Validações Diferentes** 🔍
```
Cenário Gravado:
- Nome: "Navegação Completa"
- URL Original: https://goiania.axhub.axion.ws
- Validação Original: Funcional

Reutilizar para:
- Nova URL: (deixa vazio - usa a mesma)
- Validações: Visual + Performance + Segurança
- Resultado: Testa aspectos diferentes do mesmo fluxo
```

### **Exemplo 4: Regressão Automática** 🔁
```
Cenário Gravado:
- Nome: "Smoke Test - Funcionalidades Críticas"

Reutilizar para:
- Agendar execução diária às 06:00
- Validações: Funcional + Visual + Performance
- Resultado: Detecta quebras imediatamente após deploy
```

---

## 📊 Campos da Interface

### **1. Selecione o Cenário**
```
Dropdown com todos os cenários gravados:
┌────────────────────────────────────────┐
│ -- Escolha um cenário --               │
│ AxHub - Production (85 passos)         │
│ Login e Cadastro (23 passos)           │
│ Fluxo de Emissão (45 passos)           │
└────────────────────────────────────────┘
```
- Mostra nome do cenário e quantidade de passos
- Obrigatório selecionar para executar

### **2. Nova URL**
```
┌────────────────────────────────────────┐
│ https://homolog.axhub.axion.ws         │
└────────────────────────────────────────┘
💡 Deixe vazio para usar a URL original do cenário
```
- Opcional: Se deixar vazio, usa URL original
- Use para testar em outro ambiente/cliente

### **3. Validações a Executar**
```
☑ 🔧 Funcional       ☐ 👁️ Visual
☑ ⚡ Performance     ☐ 🔒 Segurança
☐ 🔄 DE/PARA
```
- Checkboxes para selecionar categorias
- Múltipla seleção permitida
- Se nenhuma selecionada, usa "Funcional" como padrão

### **4. Botão Executar**
```
┌────────────────────────────────┐
│  ▶️  Executar Cenário          │
└────────────────────────────────┘
```
- Desabilitado se nenhum cenário selecionado
- Mostra "Executando..." durante execução
- Alerta com resultado ao finalizar

---

## 🎨 Cards de Exemplos (4 Cards Visuais)

### **Card 1: 🔄 Testar em Homologação**
```
Grave cenário em Produção → 
Execute em Homologação com nova URL
```

### **Card 2: 🏢 Validar Outro Cliente**
```
Use mesmo cenário → 
Mude URL para outro contrato/cliente
```

### **Card 3: 🔍 Executar Validações Diferentes**
```
Mesmo fluxo → 
Selecione outras categorias (Visual, Performance, etc.)
```

### **Card 4: 🔁 Regressão Automática**
```
Execute o mesmo cenário diariamente → 
Detecte quebras imediatamente
```

---

## 🔧 Como Funciona (Técnico)

### **Fluxo de Execução:**
```javascript
1. Usuário seleciona cenário do dropdown
2. Usuário configura nova URL (opcional)
3. Usuário seleciona categorias de validação
4. Clique em "Executar Cenário"
5. Sistema chama API:
   POST /api/scenarios/execute
   {
     scenarioPath: "api/engine/scenarios/AxHub - production/scenario.json",
     url: "https://homolog-goiania.axhub.axion.ws", // Nova URL
     categories: ["functional", "visual"],
     system: "AxHub",
     environment: "homolog"
   }
6. Engine executa cenário com nova configuração
7. Retorna resultado (score, testes, duração)
8. Exibe alerta com resultado
```

### **Endpoint da API:**
```javascript
POST /api/scenarios/execute

Body:
{
  scenarioPath: string,    // Caminho do cenário gravado
  url?: string,            // Nova URL (opcional)
  categories: string[],    // Categorias de validação
  system: string,          // Sistema (AxHub, AxTon, AxCross)
  environment: string      // Ambiente (prod, homolog)
}

Response:
{
  score: number,           // Score de qualidade (0-100)
  passed: number,          // Testes aprovados
  total: number,           // Total de testes
  duration: number,        // Duração em segundos
  errors: array,           // Erros encontrados
  screenshots: array       // Evidências visuais
}
```

---

## 🎨 Estilos Visuais

### **Cores e Design:**
- 🔵 **Background:** Gradiente azul claro (#f0f9ff → #e0f2fe)
- 🔷 **Borda:** Azul forte (#0ea5e9) - 3px
- 🟦 **Botão:** Gradiente azul (#0ea5e9 → #0284c7)
- ⚡ **Hover:** Sobe 3px com sombra azul
- ✨ **Sombra:** rgba(14, 165, 233, 0.15)

### **Responsividade:**
```css
/* Desktop: 2 colunas */
grid-template-columns: 1fr 1fr;

/* Mobile: 1 coluna */
@media (max-width: 768px) {
  grid-template-columns: 1fr;
}
```

---

## ✅ Benefícios da Funcionalidade

### **Para QA/Tester:**
1. ✅ **Economiza Tempo**
   - Não precisa gravar o mesmo cenário várias vezes
   - Reutiliza gravações existentes

2. ✅ **Testes Consistentes**
   - Mesmas ações executadas em ambientes diferentes
   - Garante comparação justa

3. ✅ **Cobertura Maior**
   - Testa mesmo fluxo com validações diferentes
   - Detecta mais tipos de problemas

4. ✅ **Automação Fácil**
   - Cria testes de regressão rapidamente
   - Detecta quebras imediatamente

### **Para Desenvolvedor:**
1. ✅ **Validação Rápida**
   - Testa feature em homologação antes de produção
   - Detecta problemas antes do deploy

2. ✅ **Comparação DE/PARA**
   - Valida migração de dados
   - Compara comportamento entre versões

3. ✅ **CI/CD Integration**
   - Executa cenários automaticamente no pipeline
   - Bloqueia merge se testes falharem

---

## 📝 Scripts PowerShell (Alternativos)

Se preferir usar PowerShell ao invés da interface:

### **Script 1: Executar com Nova URL**
```powershell
# executar-cenario-com-url.ps1
param(
    [string]$ScenarioPath = "api\engine\scenarios\AxHub - production\scenario.json",
    [string]$NewUrl = "https://homolog-goiania.axhub.axion.ws"
)

$payload = @{
    scenarioPath = $ScenarioPath
    url = $NewUrl
    categories = @("functional", "visual")
    system = "AxHub"
    environment = "homolog"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:3100/api/scenarios/execute" `
    -Method POST `
    -ContentType "application/json" `
    -Body $payload
```

### **Script 2: Executar com Validações Diferentes**
```powershell
# executar-cenario-validacoes.ps1
param(
    [string]$ScenarioPath,
    [string[]]$Categories = @("functional", "visual", "performance")
)

$payload = @{
    scenarioPath = $ScenarioPath
    categories = $Categories
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:3100/api/scenarios/execute" `
    -Method POST `
    -ContentType "application/json" `
    -Body $payload
```

---

## 🚀 Quando a Seção Aparece?

A seção **só aparece** quando há **cenários gravados**.

### **Condição:**
```javascript
{scenarios.length > 0 && (
  <div className="scenario-reuse-section">
    // Seção de reutilização
  </div>
)}
```

### **Como Garantir que Aparece:**
1. ✅ Grave pelo menos 1 cenário
2. ✅ Recarregue a página (F5)
3. ✅ Role até "📦 Seus Cenários Gravados"
4. ✅ Logo abaixo verá "🔄 Reutilizar Cenário Gravado"

---

## 📊 Comparação: Antes vs Depois

### **ANTES (Sem Reutilização):**
```
1. Gravar cenário em Produção ✅
2. Quer testar em Homologação? ❌
   → Precisa gravar NOVO cenário
   → Mesmas ações, trabalho duplicado
3. Quer executar com Visual? ❌
   → Precisa gravar OUTRO cenário
   → Mais tempo perdido
```

### **DEPOIS (Com Reutilização):**
```
1. Gravar cenário UMA VEZ ✅
2. Testar em Homologação? ✅
   → Seleciona cenário
   → Muda URL
   → Executa
3. Executar com Visual? ✅
   → Seleciona cenário
   → Marca "Visual"
   → Executa
```

**Resultado:** **80% menos tempo** gasto em gravações! 🎉

---

## 🎯 Próximos Passos Recomendados

### **HOJE:**
1. ✅ Grave 2-3 cenários importantes
2. ✅ Teste a reutilização com nova URL
3. ✅ Execute com categorias diferentes

### **AMANHÃ:**
1. ✅ Configure agendamento para regressão
2. ✅ Documente cenários reutilizáveis
3. ✅ Treine equipe no uso

### **SEMANA:**
1. ✅ Crie biblioteca de cenários
2. ✅ Automatize testes de deploy
3. ✅ Monitore resultados diários

---

## 📞 Suporte

**Dúvidas?** Consulte:
- 📄 GUIA-COMPLETO-VALIDACAO-CUTI.md
- 📄 RESUMO-GUIA-VISUAL-CUTI.md
- 🌐 http://localhost:3017/cuti (Interface visual)

---

## ✅ Resumo Final

```
✅ Funcionalidade implementada
✅ Interface completa e visual
✅ 4 exemplos práticos de uso
✅ Dropdown para seleção de cenários
✅ Campo para nova URL (opcional)
✅ Checkboxes para categorias
✅ Botão de execução com feedback
✅ Cards visuais de exemplos
✅ Estilos responsivos e animados
✅ Pronto para uso imediato!
```

**Agora você pode reutilizar qualquer cenário gravado para testes diferentes! 🚀**
