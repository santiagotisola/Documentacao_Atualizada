# PROPOSTA: CUTI v3.0 - Integração Inteligente com Manuais

## 📋 Resumo Executivo

Esta proposta apresenta a evolução do **CUTI (Central Unificada de Testes Inteligentes)** para a versão 3.0, integrando os manuais Docusaurus (AxHub, AxTon, AxCross) como **fonte de scripts de teste automatizados** com **feedback loop** para atualização contínua da documentação.

---

## 🎯 Objetivos

### Objetivos Primários
1. ✅ **Organizar interface CUTI** — Adicionar botões "Ocultar/Expandir" em seções explicativas
2. ✅ **Duas fontes de cenários**:
   - Cenários gravados via Puppeteer (já implementado)
   - **Scripts gerados a partir dos manuais** (NOVO)
3. ✅ **Parser de manuais** — Extrair procedimentos operacionais dos `.md` files
4. ✅ **Geração automática de cenários** — Converter instruções dos manuais em steps executáveis
5. ✅ **Formulário de dados dinâmico** — Interface para informar dados de teste antes da execução (NOVO)
6. ✅ **Preenchimento automático** — Sistema preenche campos web com dados informados pelo operador (NOVO)
7. ✅ **Feedback loop** — Atualizar manuais com resultados dos testes validados

### Objetivos Secundários
- Rastreabilidade: vincular cada teste ao tópico do manual de origem
- Versionamento: histórico de alterações nos manuais baseado em testes
- Colaboração: aprovação de atualizações antes de aplicar aos manuais
- Data-driven: reutilizar mesmo script com diferentes conjuntos de dados

---

## 🏗️ Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                      CUTI v3.0 Interface                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐│
│  │ Cenários        │  │ Scripts Manuais │  │ Execução     ││
│  │ Gravados        │  │ (NOVO)          │  │ & Resultados ││
│  └─────────────────┘  └─────────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │   Manual Parser Engine       │
              │  - Lê arquivos .md           │
              │  - Extrai procedimentos      │
              │  - Identifica passos         │
              └──────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  Scenario Generator Engine   │
              │  - Converte passos em JSON   │
              │  - Mapeia seletores          │
              │  - Valida estrutura          │
              └──────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │   Execution Engine           │
              │  - Puppeteer headless:false  │
              │  - Executa cenários          │
              │  - Captura evidências        │
              └──────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  Feedback Loop Engine        │
              │  - Compara resultado vs doc  │
              │  - Gera diff proposto        │
              │  - Aguarda aprovação         │
              └──────────────────────────────┘
                             ↓
              ┌──────────────────────────────┐
              │  Manual Update Engine        │
              │  - Aplica mudanças aprovadas │
              │  - Commita no Git            │
              │  - Gera changelog            │
              └──────────────────────────────┘
```

---

## 🎨 Sistema de Formulário de Dados Dinâmico (NOVO)

### Visão Geral

Quando o operador seleciona um tópico do manual (ex: "Cadastro de Veículo"), o sistema:

1. **Analisa o manual** e identifica todos os campos necessários
2. **Gera automaticamente um formulário** para o operador preencher
3. **Armazena os dados** fornecidos
4. **Preenche automaticamente** os campos web durante a execução

### Funcionamento

#### Passo 1: Identificação de Campos

O **Manual Parser** extrai campos do manual usando padrões:

**Exemplo de manual:**
```markdown
## Cadastro de Veículo

| Campo | Descrição |
|-------|-----------|
| **Placa** | Placa do veículo (formato AAA-9999) |
| **Marca** | Fabricante do veículo |
| **Modelo** | Modelo do veículo |
| **Ano** | Ano de fabricação (AAAA) |
| **Cor** | Cor do veículo |
| Renavam | Número do Renavam (opcional) |
```

**Sistema identifica:**
- 5 campos obrigatórios: Placa, Marca, Modelo, Ano, Cor
- 1 campo opcional: Renavam
- Validações: formato de placa, ano com 4 dígitos

#### Passo 2: Geração de Formulário

Sistema cria automaticamente:

```jsx
<DataInputForm scriptId="axhub-veiculos-cadastro">
  <FormField 
    name="placa" 
    label="Placa *" 
    type="text"
    pattern="[A-Z]{3}-[0-9]{4}"
    placeholder="ABC-1234"
    required
  />
  <FormField 
    name="marca" 
    label="Marca *" 
    type="select"
    options={marcasDisponiveis}
    required
  />
  <FormField 
    name="modelo" 
    label="Modelo *" 
    type="text"
    required
  />
  <FormField 
    name="ano" 
    label="Ano *" 
    type="number"
    min="1900"
    max={anoAtual}
    required
  />
  <FormField 
    name="cor" 
    label="Cor *" 
    type="select"
    options={coresDisponiveis}
    required
  />
  <FormField 
    name="renavam" 
    label="Renavam" 
    type="text"
  />
</DataInputForm>
```

#### Passo 3: Preenchimento Automático

Durante execução, sistema mapeia dados do formulário para campos web:

```json
{
  "dataMapping": {
    "placa": {
      "inputValue": "ABC-1234",
      "webSelector": "#Placa",
      "transformations": ["uppercase", "remove-spaces"]
    },
    "marca": {
      "inputValue": "Volkswagen",
      "webSelector": "#MarcaId",
      "type": "select",
      "matchBy": "text"
    },
    "modelo": {
      "inputValue": "Gol",
      "webSelector": "#Modelo"
    },
    "ano": {
      "inputValue": "2020",
      "webSelector": "#AnoFabricacao"
    },
    "cor": {
      "inputValue": "Preto",
      "webSelector": "#CorId",
      "type": "select",
      "matchBy": "text"
    },
    "renavam": {
      "inputValue": "12345678901",
      "webSelector": "#Renavam"
    }
  }
}
```

#### Passo 4: Reutilização de Dados

Operador pode:
- ✅ Salvar conjunto de dados como "template"
- ✅ Carregar templates salvos
- ✅ Executar mesmo script com diferentes dados
- ✅ Importar dados de CSV/Excel

**Exemplo de templates:**

```json
{
  "templates": [
    {
      "id": "veiculo-template-1",
      "name": "Veículo Teste - Carro Comum",
      "scriptId": "axhub-veiculos-cadastro",
      "data": {
        "placa": "ABC-1234",
        "marca": "Volkswagen",
        "modelo": "Gol",
        "ano": "2020",
        "cor": "Preto"
      }
    },
    {
      "id": "veiculo-template-2",
      "name": "Veículo Teste - Caminhão",
      "scriptId": "axhub-veiculos-cadastro",
      "data": {
        "placa": "DEF-5678",
        "marca": "Mercedes-Benz",
        "modelo": "Atego 1719",
        "ano": "2021",
        "cor": "Branco"
      }
    }
  ]
}
```

### Integração com Cenários Gravados

O formulário de dados também funciona com cenários gravados:

1. **Durante gravação:**
   - Sistema detecta campos preenchidos
   - Marca automaticamente como "variáveis"
   - Exemplo: ao preencher campo Placa com "ABC-1234", sistema cria variável `{{PLACA}}`

2. **Durante execução:**
   - Operador preenche formulário
   - Sistema substitui `{{PLACA}}` pelo valor informado
   - Executa cenário com novos dados

### Interface do Usuário

```jsx
<Tabs>
  <Tab label="📘 Scripts dos Manuais">
    <ManualScriptSelector onSelect={handleScriptSelection} />
    
    {selectedScript && (
      <>
        <ScriptPreview script={selectedScript} />
        
        {/* FORMULÁRIO DINÂMICO - NOVO */}
        <DataInputForm 
          script={selectedScript}
          onDataSubmit={handleDataSubmit}
          templates={savedTemplates}
          onLoadTemplate={handleLoadTemplate}
        />
        
        <ExecutionConfig baseUrl={url} />
        <Button onClick={executeScript}>⚡ Executar</Button>
      </>
    )}
  </Tab>
  
  <Tab label="📁 Cenários Gravados">
    <ScenarioList scenarios={recordedScenarios} />
    
    {selectedScenario && (
      <>
        {/* FORMULÁRIO DINÂMICO - NOVO */}
        <DataInputForm 
          scenario={selectedScenario}
          onDataSubmit={handleDataSubmit}
          templates={savedTemplates}
        />
        
        <Button onClick={executeScenario}>⚡ Executar</Button>
      </>
    )}
  </Tab>
</Tabs>
```

### Exemplo Completo: Cadastro de Veículo

#### 1. Operador Seleciona Script

```
Produto: AxHub
Módulo: Cadastros Básicos
Feature: Veículos → Cadastro
```

#### 2. Sistema Gera Formulário

```
📝 Dados do Veículo

Placa *          [ABC-1234        ]
Marca *          [Volkswagen ▼    ]
Modelo *         [Gol             ]
Ano *            [2020            ]
Cor *            [Preto      ▼    ]
Renavam          [               ]

💾 Salvar como template  📂 Carregar template  📥 Importar CSV

[⚡ Executar Script]
```

#### 3. Operador Preenche

```
Placa:    XYZ-9876
Marca:    Toyota
Modelo:   Corolla
Ano:      2022
Cor:      Prata
```

#### 4. Sistema Executa

```javascript
// Step 1: Navegar para /veiculo
await page.goto('https://homologacao.axhub.axion.ws/veiculo');

// Step 2: Clicar em Novo
await page.click('a[href="/veiculo/new"]');

// Step 3: Preencher dados
await page.fill('#Placa', 'XYZ-9876');          // ← Valor do formulário
await page.fill('#Marca', 'Toyota');             // ← Valor do formulário
await page.fill('#Modelo', 'Corolla');           // ← Valor do formulário
await page.fill('#AnoFabricacao', '2022');       // ← Valor do formulário
await page.selectOption('#Cor', {label: 'Prata'}); // ← Valor do formulário

// Step 4: Salvar
await page.click('button:has-text("Salvar")');

// Step 5: Verificar
await expect(page).toHaveURL(/.*\/veiculo$/);
```

#### 5. Resultado

```
✅ SUCCESS - Veículo XYZ-9876 cadastrado com sucesso
📸 5 screenshots capturados
⏱️ Tempo: 15.2s
```

### Validações Automáticas

Sistema valida dados antes de executar:

```javascript
class DataValidator {
  validatePlaca(placa) {
    const regex = /^[A-Z]{3}-[0-9]{4}$/;
    if (!regex.test(placa)) {
      throw new Error('Placa inválida. Use formato ABC-1234');
    }
  }
  
  validateAno(ano) {
    const anoNum = parseInt(ano);
    const anoAtual = new Date().getFullYear();
    if (anoNum < 1900 || anoNum > anoAtual) {
      throw new Error(`Ano deve estar entre 1900 e ${anoAtual}`);
    }
  }
  
  validateRequired(data, requiredFields) {
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`Campo obrigatório: ${field}`);
      }
    }
  }
}
```

### Templates Predefinidos

Sistema vem com templates úteis:

```json
{
  "predefinedTemplates": {
    "veiculo-teste-basico": {
      "placa": "TST-0001",
      "marca": "Volkswagen",
      "modelo": "Gol",
      "ano": "2020",
      "cor": "Branco"
    },
    "veiculo-teste-caminhao": {
      "placa": "TST-0002",
      "marca": "Mercedes-Benz",
      "modelo": "Atego",
      "ano": "2021",
      "cor": "Branco"
    },
    "veiculo-teste-moto": {
      "placa": "TST-0003",
      "marca": "Honda",
      "modelo": "CG 160",
      "ano": "2022",
      "cor": "Vermelho"
    }
  }
}
```

### Importação em Massa

Para testes de regressão com múltiplos registros:

**1. Operador carrega CSV:**

```csv
placa,marca,modelo,ano,cor
ABC-1234,Volkswagen,Gol,2020,Preto
DEF-5678,Fiat,Uno,2019,Branco
GHI-9012,Chevrolet,Onix,2021,Prata
```

**2. Sistema executa script 3 vezes:**

```
Execução 1/3: ABC-1234 ✅
Execução 2/3: DEF-5678 ✅
Execução 3/3: GHI-9012 ✅

📊 Resultado: 3/3 cadastros concluídos com sucesso
```

---

## 📂 Estrutura de Dados

### 1. Manual Scripts (ATUALIZADO)

```json
{
  "id": "axhub-veiculos-cadastro",
  "manualSource": "AxHub/docs-portal/docs/cadastros-basicos/veiculos.md",
  "section": "## Cadastro de Veículo",
  "product": "AxHub",
  "module": "Cadastros Básicos",
  "feature": "Veículos",
  "baseUrl": "https://homologacao.axhub.axion.ws",
  
  "dataSchema": {
    "fields": [
      {
        "name": "placa",
        "label": "Placa",
        "type": "text",
        "required": true,
        "pattern": "^[A-Z]{3}-[0-9]{4}$",
        "placeholder": "ABC-1234",
        "description": "Placa do veículo (formato AAA-9999)",
        "webSelector": "#Placa",
        "transformations": ["uppercase", "remove-spaces"]
      },
      {
        "name": "marca",
        "label": "Marca",
        "type": "select",
        "required": true,
        "webSelector": "#MarcaId",
        "matchBy": "text",
        "options": "dynamic" // carregado do sistema
      },
      {
        "name": "modelo",
        "label": "Modelo",
        "type": "text",
        "required": true,
        "maxLength": 100,
        "webSelector": "#Modelo"
      },
      {
        "name": "ano",
        "label": "Ano",
        "type": "number",
        "required": true,
        "min": 1900,
        "max": 2026,
        "webSelector": "#AnoFabricacao"
      },
      {
        "name": "cor",
        "label": "Cor",
        "type": "select",
        "required": true,
        "webSelector": "#CorId",
        "matchBy": "text",
        "options": ["Branco", "Preto", "Prata", "Vermelho", "Azul", "Outro"]
      },
      {
        "name": "renavam",
        "label": "Renavam",
        "type": "text",
        "required": false,
        "pattern": "^[0-9]{11}$",
        "webSelector": "#Renavam"
      }
    ]
  },
  
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Acessar Menu lateral → Cadastros Básicos → Veículos",
      "actions": [
        { "type": "navigate", "url": "/veiculo" }
      ]
    },
    {
      "stepNumber": 2,
      "instruction": "Clicar em Novo",
      "actions": [
        { "type": "click", "selector": "a[href='/veiculo/new']" }
      ]
    },
    {
      "stepNumber": 3,
      "instruction": "Preencher campos obrigatórios",
      "actions": [
        { 
          "type": "input", 
          "selector": "#Placa", 
          "value": "{{DATA.placa}}",  // ← Vinculado ao formulário
          "dataField": "placa" 
        },
        { 
          "type": "select", 
          "selector": "#MarcaId", 
          "value": "{{DATA.marca}}",
          "dataField": "marca",
          "matchBy": "text"
        },
        { 
          "type": "input", 
          "selector": "#Modelo", 
          "value": "{{DATA.modelo}}",
          "dataField": "modelo"
        },
        { 
          "type": "input", 
          "selector": "#AnoFabricacao", 
          "value": "{{DATA.ano}}",
          "dataField": "ano"
        },
        { 
          "type": "select", 
          "selector": "#CorId", 
          "value": "{{DATA.cor}}",
          "dataField": "cor",
          "matchBy": "text"
        }
      ]
    },
    {
      "stepNumber": 4,
      "instruction": "Preencher campos opcionais",
      "actions": [
        { 
          "type": "input", 
          "selector": "#Renavam", 
          "value": "{{DATA.renavam}}",
          "dataField": "renavam",
          "optional": true
        }
      ]
    },
    {
      "stepNumber": 5,
      "instruction": "Salvar registro",
      "actions": [
        { "type": "click", "selector": "button:has-text('Salvar')" }
      ]
    },
    {
      "stepNumber": 6,
      "instruction": "Verificar criação",
      "actions": [
        { 
          "type": "verify", 
          "condition": "url contains /veiculo", 
          "expected": true 
        },
        {
          "type": "verify",
          "condition": "table contains {{DATA.placa}}",
          "expected": true
        }
      ]
    }
  ],
  
  "expectedResult": "Veículo {{DATA.placa}} criado com sucesso e listado na tabela",
  "createdAt": "2026-06-25T12:00:00Z",
  "lastValidated": null,
  "validationCount": 0,
  "successRate": null
}
```

### 2. Data Templates (NOVO)

```json
{
  "id": "template-veiculo-basico",
  "scriptId": "axhub-veiculos-cadastro",
  "name": "Veículo Teste - Carro Comum",
  "description": "Template padrão para testes de cadastro de veículos",
  "category": "Veículos",
  "data": {
    "placa": "TST-0001",
    "marca": "Volkswagen",
    "modelo": "Gol",
    "ano": "2020",
    "cor": "Branco",
    "renavam": "12345678901"
  },
  "createdBy": "operador@axion.com",
  "createdAt": "2026-06-25T10:00:00Z",
  "usageCount": 15
}
```

### 3. Execution with Data (ATUALIZADO)

### 3. Execution with Data (ATUALIZADO)

```json
{
  "executionId": "exec-20260625-120530",
  "scriptId": "axhub-veiculos-cadastro",
  "templateId": "template-veiculo-basico",
  "url": "https://homologacao.axhub.axion.ws",
  
  "inputData": {
    "placa": "XYZ-9876",
    "marca": "Toyota",
    "modelo": "Corolla",
    "ano": "2022",
    "cor": "Prata",
    "renavam": "98765432100"
  },
  
  "status": "SUCCESS",
  "testsExecuted": 6,
  "testsPassed": 6,
  "testsFailed": 0,
  "duration": 15.2,
  "timestamp": "2026-06-25T12:05:30Z",
  
  "evidences": [
    {
      "step": 1,
      "screenshot": "data:image/png;base64,...",
      "status": "passed"
    },
    {
      "step": 3,
      "screenshot": "data:image/png;base64,...",
      "status": "passed",
      "dataFilled": {
        "placa": "XYZ-9876",
        "marca": "Toyota",
        "modelo": "Corolla",
        "ano": "2022",
        "cor": "Prata"
      }
    }
  ],
  
  "feedback": {
    "suggestedChanges": [
      {
        "type": "ADD_NOTE",
        "section": "## Cadastro de Veículo",
        "content": ":::tip Tempo de Execução\nO cadastro de veículo leva em média 15.2 segundos.\n:::",
        "reason": "Informação útil baseada em 10 execuções"
      }
    ],
    "approvalRequired": true,
    "approvedBy": null,
    "approvedAt": null
  }
}
```

---

## 🎨 Interface CUTI v3.0

### Nova estrutura de abas:

```jsx
<Tabs>
  <Tab label="🔴 Gravar Cenário">
    {/* Mantém funcionalidade atual */}
  </Tab>
  
  <Tab label="📁 Cenários Gravados">
    {/* Mantém funcionalidade atual */}
    <ScenarioList scenarios={recordedScenarios} />
  </Tab>
  
  <Tab label="📘 Scripts dos Manuais"> {/* NOVO */}
    <ManualScriptSelector
      manuals={['AxHub', 'AxTon', 'AxCross']}
      onSelectScript={handleScriptSelection}
    />
    <ScriptPreview script={selectedScript} />
    <ExecutionConfig baseUrl={url} />
  </Tab>
  
  <Tab label="⚡ Executar Testes">
    {/* Mantém funcionalidade atual + nova opção */}
    <ExecutionMode>
      <Radio value="recorded">Cenário Gravado</Radio>
      <Radio value="manual-script">Script do Manual</Radio> {/* NOVO */}
    </ExecutionMode>
  </Tab>
  
  <Tab label="📊 Resultados">
    {/* Mantém funcionalidade atual + feedback */}
    <ResultsPanel results={executionResults} />
    {executionResults?.feedback && (
      <FeedbackApproval feedback={executionResults.feedback} />
    )}
  </Tab>
  
  <Tab label="✅ Aprovar Atualizações"> {/* NOVO */}
    <PendingUpdates updates={pendingManualUpdates} />
  </Tab>
</Tabs>
```

### Componentes Colapsáveis (Todos):

Adicionar `<Collapsible>` em:
- Explicações de categorias de teste
- Modos de execução
- Exemplos de reutilização
- Logs de execução

**Exemplo:**
```jsx
<Collapsible title="💡 O que são Scripts dos Manuais?" defaultOpen={false}>
  <p>Scripts extraídos automaticamente dos manuais Docusaurus...</p>
</Collapsible>
```

---

## 🔧 Implementação Técnica

### 1. Manual Parser Engine (`axion-ia-panel/api/engine/manual-parser.js`)

```javascript
class ManualParser {
  constructor(docsBasePath) {
    this.docsBasePath = docsBasePath; // e.g., 'AxHub/docs-portal/docs'
  }

  /**
   * Escaneia todos os .md files e extrai procedimentos
   */
  async scanManuals(product) {
    const docsPath = path.join(this.docsBasePath, product);
    const mdFiles = await this.findMarkdownFiles(docsPath);
    
    const scripts = [];
    for (const file of mdFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const extracted = this.extractProcedures(content, file, product);
      scripts.push(...extracted);
    }
    
    return scripts;
  }

  /**
   * Extrai seções "Procedimentos Operacionais" ou "Como Fazer"
   */
  extractProcedures(content, filePath, product) {
    const sections = this.findProcedureSections(content);
    
    return sections.map((section, index) => ({
      id: this.generateId(filePath, index),
      manualSource: filePath,
      product,
      module: this.extractModule(filePath),
      feature: this.extractFeature(content),
      section: section.title,
      rawSteps: section.steps, // lista numerada extraída
      parsedSteps: this.parseSteps(section.steps),
      createdAt: new Date().toISOString()
    }));
  }

  /**
   * Converte lista numerada do markdown em steps estruturados
   */
  parseSteps(rawSteps) {
    return rawSteps.map((step, i) => {
      const instruction = step.text;
      const actions = this.inferActions(instruction);
      
      return {
        stepNumber: i + 1,
        instruction,
        actions,
        selectors: this.suggestSelectors(instruction)
      };
    });
  }

  /**
   * Infere ações com base no texto da instrução
   */
  inferActions(instruction) {
    const lower = instruction.toLowerCase();
    
    // Padrões comuns
    if (lower.includes('acessar') || lower.includes('navegar')) {
      return [{ type: 'navigate', url: this.extractUrl(instruction) }];
    }
    
    if (lower.includes('clicar') || lower.includes('pressionar')) {
      return [{ type: 'click', selector: this.suggestSelector(instruction) }];
    }
    
    if (lower.includes('preencher') || lower.includes('digitar')) {
      return [{ type: 'input', selector: this.suggestSelector(instruction) }];
    }
    
    if (lower.includes('verificar') || lower.includes('confirmar')) {
      return [{ type: 'verify', condition: this.extractCondition(instruction) }];
    }
    
    return [{ type: 'manual', instruction }];
  }
}
```

### 2. Scenario Generator Engine (`axion-ia-panel/api/engine/scenario-generator.js`)

```javascript
class ScenarioGenerator {
  /**
   * Converte manual script em scenario.json compatível com Puppeteer
   * Agora com suporte a dataSchema para formulário dinâmico
   */
  generateScenario(manualScript, baseUrl, userData = {}) {
    const steps = manualScript.parsedSteps.map((step, index) => {
      return step.actions.map(action => {
        switch (action.type) {
          case 'navigate':
            return {
              type: 'navigation',
              url: this.resolveUrl(baseUrl, action.url),
              waitUntil: 'networkidle'
            };
          
          case 'click':
            return {
              type: 'click',
              selector: action.selector,
              description: step.instruction
            };
          
          case 'input':
            return {
              type: 'input',
              selector: action.selector,
              value: this.resolveDataVariable(action.value, userData),
              dataField: action.dataField, // ← vinculado ao formulário
              description: step.instruction
            };
          
          case 'select':
            return {
              type: 'select',
              selector: action.selector,
              value: this.resolveDataVariable(action.value, userData),
              dataField: action.dataField,
              matchBy: action.matchBy || 'value',
              description: step.instruction
            };
          
          case 'verify':
            return {
              type: 'verify',
              condition: this.resolveDataVariable(action.condition, userData),
              expected: action.expected,
              description: step.instruction
            };
          
          default:
            return {
              type: 'manual',
              instruction: step.instruction
            };
        }
      });
    }).flat();
    
    return {
      scenarioId: manualScript.id,
      name: `${manualScript.product} - ${manualScript.feature}`,
      description: `Teste gerado do manual: ${manualScript.manualSource}`,
      category: manualScript.product,
      baseUrl,
      dataSchema: manualScript.dataSchema, // ← schema do formulário
      steps,
      metadata: {
        source: 'manual',
        manualPath: manualScript.manualSource,
        manualSection: manualScript.section,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Resolve variável de dados do formulário
   * {{DATA.placa}} → valor fornecido pelo operador
   */
  resolveDataVariable(value, userData) {
    if (typeof value !== 'string') return value;
    
    // {{DATA.campo}} → substitui pelo valor do formulário
    const dataPattern = /\{\{DATA\.([a-zA-Z0-9_]+)\}\}/g;
    return value.replace(dataPattern, (match, fieldName) => {
      return userData[fieldName] || this.generateDefaultValue(fieldName);
    });
  }

  generateDefaultValue(varName) {
    const defaults = {
      placa: `TST-${Date.now().toString().slice(-4)}`,
      marca: 'Volkswagen',
      modelo: 'Gol',
      ano: new Date().getFullYear().toString(),
      cor: 'Branco',
      nome: 'Teste CUTI',
      usuario: `teste.cuti.${Date.now()}`,
      email: `teste${Date.now()}@cuti.test`,
      senha: 'Teste@2026!',
      telefone: '11999990000'
    };
    return defaults[varName] || 'valor_teste';
  }
}
```

### 3. Data Input Form Engine (`axion-ia-panel/api/engine/data-form.js`) ← NOVO

```javascript
class DataFormEngine {
  /**
   * Gera schema de formulário a partir do dataSchema do script
   */
  generateFormSchema(script) {
    if (!script.dataSchema || !script.dataSchema.fields) {
      // Fallback: detecta variáveis no script e cria schema básico
      return this.detectVariablesAndCreateSchema(script);
    }
    
    return {
      scriptId: script.id,
      title: `Dados ${script.feature}`,
      fields: script.dataSchema.fields.map(field => ({
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder,
        pattern: field.pattern,
        min: field.min,
        max: field.max,
        maxLength: field.maxLength,
        options: field.options,
        description: field.description
      })),
      validation: this.buildValidationRules(script.dataSchema.fields)
    };
  }

  /**
   * Detecta variáveis {{CAMPO}} no script e cria schema automático
   */
  detectVariablesAndCreateSchema(script) {
    const variables = new Set();
    
    // Busca variáveis {{CAMPO}} em todos os steps
    script.steps.forEach(step => {
      step.actions.forEach(action => {
        if (action.value) {
          const matches = action.value.match(/\{\{([A-Z_]+)\}\}/g);
          if (matches) {
            matches.forEach(match => {
              const varName = match.replace(/\{\{|\}\}/g, '');
              variables.add(varName);
            });
          }
        }
      });
    });
    
    // Cria fields automáticos
    const fields = Array.from(variables).map(varName => ({
      name: varName.toLowerCase(),
      label: this.formatLabel(varName),
      type: this.inferType(varName),
      required: true,
      placeholder: this.generatePlaceholder(varName)
    }));
    
    return {
      scriptId: script.id,
      title: `Dados ${script.feature || script.name}`,
      fields,
      validation: this.buildValidationRules(fields)
    };
  }

  inferType(varName) {
    const lower = varName.toLowerCase();
    if (lower.includes('ano') || lower.includes('year')) return 'number';
    if (lower.includes('data') || lower.includes('date')) return 'date';
    if (lower.includes('email')) return 'email';
    if (lower.includes('senha') || lower.includes('password')) return 'password';
    if (lower.includes('telefone') || lower.includes('phone')) return 'tel';
    return 'text';
  }

  formatLabel(varName) {
    return varName
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  buildValidationRules(fields) {
    const rules = {};
    
    fields.forEach(field => {
      rules[field.name] = [];
      
      if (field.required) {
        rules[field.name].push({
          type: 'required',
          message: `${field.label} é obrigatório`
        });
      }
      
      if (field.pattern) {
        rules[field.name].push({
          type: 'pattern',
          pattern: field.pattern,
          message: `${field.label} em formato inválido`
        });
      }
      
      if (field.min !== undefined) {
        rules[field.name].push({
          type: 'min',
          value: field.min,
          message: `${field.label} deve ser maior ou igual a ${field.min}`
        });
      }
      
      if (field.max !== undefined) {
        rules[field.name].push({
          type: 'max',
          value: field.max,
          message: `${field.label} deve ser menor ou igual a ${field.max}`
        });
      }
    });
    
    return rules;
  }

  /**
   * Valida dados do formulário antes de executar
   */
  validateData(formSchema, userData) {
    const errors = {};
    
    formSchema.fields.forEach(field => {
      const value = userData[field.name];
      const rules = formSchema.validation[field.name] || [];
      
      rules.forEach(rule => {
        switch (rule.type) {
          case 'required':
            if (!value || value.trim() === '') {
              errors[field.name] = rule.message;
            }
            break;
          
          case 'pattern':
            if (value && !new RegExp(rule.pattern).test(value)) {
              errors[field.name] = rule.message;
            }
            break;
          
          case 'min':
            if (value && Number(value) < rule.value) {
              errors[field.name] = rule.message;
            }
            break;
          
          case 'max':
            if (value && Number(value) > rule.value) {
              errors[field.name] = rule.message;
            }
            break;
        }
      });
    });
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}
```

### 4. Feedback Loop Engine (`axion-ia-panel/api/engine/feedback-loop.js`)

```javascript
class FeedbackLoop {
  /**
   * Analisa resultado da execução e sugere atualizações no manual
   */
  async analyzeFeedback(executionResult, manualScript) {
    const suggestions = [];
    
    // 1. Adiciona nota de performance se execução bem-sucedida
    if (executionResult.status === 'SUCCESS' && executionResult.duration) {
      suggestions.push({
        type: 'ADD_NOTE',
        section: manualScript.section,
        content: this.generatePerformanceNote(executionResult),
        reason: `Baseado em ${manualScript.validationCount + 1} execuções`
      });
    }
    
    // 2. Detecta divergências entre manual e realidade
    const divergences = this.detectDivergences(executionResult, manualScript);
    suggestions.push(...divergences);
    
    // 3. Captura validações não documentadas
    const undocumented = this.detectUndocumentedValidations(executionResult);
    suggestions.push(...undocumented);
    
    return {
      suggestedChanges: suggestions,
      approvalRequired: suggestions.length > 0,
      approvedBy: null,
      approvedAt: null
    };
  }

  detectDivergences(result, script) {
    const divergences = [];
    
    // Exemplo: Campo esperado não existe mais
    const failedSteps = result.evidences.filter(e => e.status === 'failed');
    for (const failed of failedSteps) {
      if (failed.error?.includes('selector not found')) {
        divergences.push({
          type: 'UPDATE_WARNING',
          section: script.section,
          content: `:::caution Atenção\nO seletor \`${failed.selector}\` pode estar desatualizado.\n:::`,
          reason: `Falha detectada em ${failed.timestamp}`
        });
      }
    }
    
    return divergences;
  }

  generatePerformanceNote(result) {
    return `:::tip Tempo de Execução\nEsta operação leva em média ${result.duration.toFixed(1)}s.\n:::`;
  }
}
```

### 4. Manual Update Engine (`axion-ia-panel/api/engine/manual-updater.js`)

```javascript
class ManualUpdater {
  /**
   * Aplica mudanças aprovadas no arquivo .md do manual
   */
  async applyApprovedChanges(feedback, manualPath) {
    if (!feedback.approvedBy) {
      throw new Error('Feedback não aprovado');
    }
    
    let content = await fs.readFile(manualPath, 'utf-8');
    const originalContent = content;
    
    for (const change of feedback.suggestedChanges) {
      content = this.applyChange(content, change);
    }
    
    // Salva arquivo atualizado
    await fs.writeFile(manualPath, content, 'utf-8');
    
    // Commita no Git
    await this.commitToGit(manualPath, feedback);
    
    // Gera changelog
    await this.updateChangelog(manualPath, feedback);
    
    return {
      updated: true,
      diff: this.generateDiff(originalContent, content),
      commitHash: await this.getLastCommitHash()
    };
  }

  applyChange(content, change) {
    switch (change.type) {
      case 'ADD_NOTE':
        return this.insertAfterSection(content, change.section, change.content);
      
      case 'UPDATE_FIELD':
        return content.replace(change.oldValue, change.newValue);
      
      case 'UPDATE_WARNING':
        return this.insertAfterSection(content, change.section, change.content);
      
      default:
        return content;
    }
  }

  async commitToGit(filePath, feedback) {
    const message = `docs: atualização automática via CUTI
    
Aprovado por: ${feedback.approvedBy}
Razão: Feedback de testes automatizados
Mudanças: ${feedback.suggestedChanges.length} atualizações`;
    
    await exec(`git add "${filePath}"`);
    await exec(`git commit -m "${message}"`);
  }
}
```

---

## 📊 Fluxo de Trabalho Completo

### Fluxo 1: Criar e Executar Script do Manual (ATUALIZADO)

```
1. Operador acessa CUTI → aba "📘 Scripts dos Manuais"
2. Seleciona produto (AxHub) e módulo (Cadastros Básicos)
3. Sistema exibe lista de features disponíveis no manual
4. Operador escolhe "Cadastro de Veículo"
5. Sistema mostra preview do script:
   - 6 passos identificados
   - Seletores sugeridos
   - 6 campos detectados (5 obrigatórios, 1 opcional)
   
6. ✨ NOVO: Sistema gera formulário de dados automaticamente:
   ┌─────────────────────────────────────────┐
   │ 📝 Dados do Veículo                     │
   │                                         │
   │ Placa *      [XYZ-9876        ]         │
   │ Marca *      [Toyota      ▼   ]         │
   │ Modelo *     [Corolla          ]         │
   │ Ano *        [2022            ]         │
   │ Cor *        [Prata       ▼   ]         │
   │ Renavam      [98765432100     ]         │
   │                                         │
   │ 💾 Salvar template  📂 Carregar         │
   └─────────────────────────────────────────┘

7. Operador preenche dados no formulário ou carrega template salvo
8. Sistema valida dados (formato de placa, ano válido, etc.)
9. Operador define URL de homologação
10. Clica "⚡ Executar Script"
11. Puppeteer executa os 6 passos em headless:false
    - Passo 3: Sistema preenche automaticamente campos com dados do formulário
12. Sistema captura screenshots de cada passo
13. Resultados exibidos na aba "📊 Resultados"
    - Mostra dados utilizados na execução
    - Evidência de preenchimento nos screenshots
```

### Fluxo 2: Executar Cenário Gravado com Novos Dados (NOVO)

```
1. Operador acessa CUTI → aba "📁 Cenários Gravados"
2. Seleciona cenário "cadastro-usuario" (previamente gravado)
3. Sistema detecta variáveis no cenário:
   - {{NOME}}, {{USUARIO}}, {{EMAIL}}, {{SENHA}}, {{TELEFONE}}
   
4. ✨ Sistema gera formulário automaticamente:
   ┌─────────────────────────────────────────┐
   │ 📝 Dados do Usuário                     │
   │                                         │
   │ Nome *       [Pedro Santos      ]       │
   │ Usuário *    [pedro.santos      ]       │
   │ Email *      [pedro@teste.com   ]       │
   │ Senha *      [Pedro@2026!       ]       │
   │ Telefone     [11988887777       ]       │
   │                                         │
   │ 💾 Salvar template  📂 Carregar         │
   └─────────────────────────────────────────┘

5. Operador preenche novos dados
6. Define URL de homologação
7. Clica "⚡ Executar Cenário"
8. Sistema substitui variáveis pelos valores do formulário
9. Executa cenário com os novos dados
10. Resultado: usuário criado com dados fornecidos
```

### Fluxo 3: Gravar Cenário e Detectar Campos (NOVO)

```
1. Operador acessa CUTI → aba "🔴 Gravar Cenário"
2. Define nome e URL
3. Clica "🔴 Iniciar Gravação"
4. Puppeteer abre browser e começa a gravar
5. Operador realiza ações manualmente:
   - Navega para cadastro de veículo
   - Preenche Placa: "ABC-1234"
   - Preenche Marca: "Volkswagen"
   - Preenche Modelo: "Gol"
   - Clica Salvar
6. Sistema detecta preenchimento de campos
7. ✨ Ao encerrar gravação, sistema pergunta:
   ┌─────────────────────────────────────────┐
   │ 🤖 Campos Detectados                    │
   │                                         │
   │ Detectamos que você preencheu:          │
   │ ☑️ Placa (ABC-1234)                     │
   │ ☑️ Marca (Volkswagen)                   │
   │ ☑️ Modelo (Gol)                         │
   │                                         │
   │ Deseja torná-los variáveis?             │
   │ [✓] Sim, criar formulário de dados      │
   │ [ ] Não, manter valores fixos           │
   └─────────────────────────────────────────┘

8. Se operador marcar "Sim":
   - Sistema cria variáveis {{PLACA}}, {{MARCA}}, {{MODELO}}
   - Cenário salvo com dataSchema
   - Próximas execuções exibirão formulário
```

### Fluxo 4: Aprovar Atualização do Manual

```
1. Após execução bem-sucedida, sistema gera feedback
2. Operador acessa aba "✅ Aprovar Atualizações"
3. Sistema exibe lista de mudanças sugeridas:
   - ✏️ Adicionar nota de performance (12s)
   - ✏️ Atualizar descrição do campo Nome (máx 100 chars)
4. Operador revisa cada mudança:
   - Preview antes/depois
   - Razão da sugestão
   - Evidências (screenshots)
5. Operador aprova ou rejeita cada mudança
6. Sistema aplica mudanças aprovadas:
   - Edita arquivo .md
   - Commita no Git
   - Gera changelog
7. Confirmação exibida: "✅ Manual atualizado com sucesso"
```

---

## 🗂️ Estrutura de Arquivos

```
axion-ia-panel/
├── api/
│   ├── engine/
│   │   ├── manual-parser.js          ← NOVO
│   │   ├── scenario-generator.js     ← ATUALIZADO (suporte a dataSchema)
│   │   ├── data-form.js              ← NOVO (geração de formulários)
│   │   ├── feedback-loop.js          ← NOVO
│   │   ├── manual-updater.js         ← NOVO
│   │   └── scenario-learning-engine.js (existente, atualizado)
│   ├── routes/
│   │   ├── manual-scripts.routes.js  ← NOVO
│   │   ├── data-templates.routes.js  ← NOVO
│   │   └── scenarios.routes.js       (existente, atualizado)
│   └── data/
│       ├── manual-scripts/           ← NOVO
│       │   ├── axhub/
│       │   ├── axton/
│       │   └── axcross/
│       ├── data-templates/           ← NOVO
│       │   ├── veiculos/
│       │   ├── usuarios/
│       │   └── equipamentos/
│       └── pending-feedback/         ← NOVO
│           └── {executionId}.json
├── src/
│   ├── pages/
│   │   └── CentralQualidade/
│   │       ├── CUTI.jsx              (atualizado)
│   │       ├── ManualScriptSelector.jsx  ← NOVO
│   │       ├── ScriptPreview.jsx          ← NOVO
│   │       ├── DataInputForm.jsx          ← NOVO (componente principal)
│   │       ├── DataTemplateManager.jsx    ← NOVO
│   │       ├── FeedbackApproval.jsx       ← NOVO
│   │       └── PendingUpdates.jsx         ← NOVO
│   └── components/
│       ├── Collapsible.jsx           ← NOVO
│       ├── FormField.jsx             ← NOVO
│       └── DataImporter.jsx          ← NOVO (importação CSV/Excel)
```

---

## 🧪 Exemplo Prático: Cadastro de Veículo (ATUALIZADO)

### Manual Original (`AxHub/docs-portal/docs/cadastros-basicos/veiculos.md`):

```markdown
## Cadastro de Veículo

| Campo | Descrição |
|-------|-----------|
| **Placa** | Placa do veículo (formato AAA-9999) |
| **Marca** | Fabricante do veículo |
| **Modelo** | Modelo do veículo |
| **Ano** | Ano de fabricação (AAAA) |
| **Cor** | Cor do veículo |
| Renavam | Número do Renavam (opcional) |

### Como Cadastrar

1. Acessar Menu lateral → Cadastros Básicos → Veículos
2. Clicar no botão "Novo"
3. Preencher os campos obrigatórios
4. Preencher campos opcionais se necessário
5. Clicar em "Salvar"
6. Verificar que o veículo aparece na listagem
```

### Script Gerado Automaticamente (com dataSchema):

```json
{
  "id": "axhub-veiculos-cadastro",
  "dataSchema": {
    "fields": [
      {
        "name": "placa",
        "label": "Placa",
        "type": "text",
        "required": true,
        "pattern": "^[A-Z]{3}-[0-9]{4}$",
        "placeholder": "ABC-1234",
        "webSelector": "#Placa"
      },
      {
        "name": "marca",
        "label": "Marca",
        "type": "select",
        "required": true,
        "webSelector": "#MarcaId",
        "options": "dynamic"
      },
      {
        "name": "modelo",
        "label": "Modelo",
        "type": "text",
        "required": true,
        "webSelector": "#Modelo"
      },
      {
        "name": "ano",
        "label": "Ano",
        "type": "number",
        "required": true,
        "min": 1900,
        "max": 2026,
        "webSelector": "#AnoFabricacao"
      },
      {
        "name": "cor",
        "label": "Cor",
        "type": "select",
        "required": true,
        "webSelector": "#CorId",
        "options": ["Branco", "Preto", "Prata", "Vermelho", "Azul"]
      },
      {
        "name": "renavam",
        "label": "Renavam",
        "type": "text",
        "required": false,
        "pattern": "^[0-9]{11}$",
        "webSelector": "#Renavam"
      }
    ]
  },
  "steps": [
    { "type": "navigate", "url": "/veiculo" },
    { "type": "click", "selector": "a[href='/veiculo/new']" },
    { 
      "type": "input", 
      "selector": "#Placa", 
      "value": "{{DATA.placa}}",
      "dataField": "placa"
    },
    {
      "type": "select",
      "selector": "#MarcaId",
      "value": "{{DATA.marca}}",
      "dataField": "marca"
    },
    { 
      "type": "input", 
      "selector": "#Modelo", 
      "value": "{{DATA.modelo}}",
      "dataField": "modelo"
    },
    { 
      "type": "input", 
      "selector": "#AnoFabricacao", 
      "value": "{{DATA.ano}}",
      "dataField": "ano"
    },
    {
      "type": "select",
      "selector": "#CorId",
      "value": "{{DATA.cor}}",
      "dataField": "cor"
    },
    { 
      "type": "input", 
      "selector": "#Renavam", 
      "value": "{{DATA.renavam}}",
      "dataField": "renavam",
      "optional": true
    },
    { "type": "click", "selector": "button:has-text('Salvar')" },
    { "type": "verify", "condition": "url contains /veiculo" },
    { "type": "verify", "condition": "table contains {{DATA.placa}}" }
  ]
}
```

### Interface do Formulário Gerado:

```
┌───────────────────────────────────────────────────┐
│ 📝 Dados do Veículo                               │
│                                                   │
│ Placa * ⓘ Formato AAA-9999                       │
│ [XYZ-9876                      ]                  │
│                                                   │
│ Marca *                                           │
│ [Toyota                    ▼   ]                  │
│                                                   │
│ Modelo *                                          │
│ [Corolla                        ]                  │
│                                                   │
│ Ano * ⓘ Entre 1900 e 2026                        │
│ [2022                          ]                  │
│                                                   │
│ Cor *                                             │
│ [Prata                     ▼   ]                  │
│                                                   │
│ Renavam ⓘ Opcional - 11 dígitos                  │
│ [98765432100                    ]                  │
│                                                   │
│ ┌─────────────────────────────────────┐           │
│ │ 💾 Templates Salvos                 │           │
│ │ • Veículo Teste - Carro Comum       │           │
│ │ • Veículo Teste - Caminhão          │           │
│ │ • Veículo Teste - Moto              │           │
│ └─────────────────────────────────────┘           │
│                                                   │
│ [💾 Salvar Template]  [📂 Carregar]  [📥 CSV]     │
└───────────────────────────────────────────────────┘
```

### Execução com Dados do Formulário:

**Operador preenche:**
```
Placa:   XYZ-9876
Marca:   Toyota
Modelo:  Corolla
Ano:     2022
Cor:     Prata
Renavam: 98765432100
```

**Sistema valida:**
```
✅ Placa: formato válido (AAA-9999)
✅ Ano: válido (entre 1900 e 2026)
✅ Renavam: formato válido (11 dígitos)
```

**Puppeteer executa:**
```javascript
await page.goto('https://homologacao.axhub.axion.ws/veiculo');
await page.click('a[href="/veiculo/new"]');
await page.fill('#Placa', 'XYZ-9876');          // ← Do formulário
await page.selectOption('#MarcaId', {label: 'Toyota'});  // ← Do formulário
await page.fill('#Modelo', 'Corolla');           // ← Do formulário
await page.fill('#AnoFabricacao', '2022');       // ← Do formulário
await page.selectOption('#CorId', {label: 'Prata'}); // ← Do formulário
await page.fill('#Renavam', '98765432100');      // ← Do formulário
await page.click('button:has-text("Salvar")');
```

### Resultado da Execução:

```
✅ SUCCESS - Veículo XYZ-9876 cadastrado com sucesso
📸 10 screenshots capturados
⏱️ Tempo: 15.2s

📋 Dados Utilizados:
   Placa:   XYZ-9876
   Marca:   Toyota
   Modelo:  Corolla
   Ano:     2022
   Cor:     Prata
   Renavam: 98765432100
```

---

## 📈 Benefícios (ATUALIZADOS)

### Imediatos
- ✅ Interface CUTI mais limpa e organizada
- ✅ Redução de 80% no tempo de criação de scripts de teste
- ✅ **Redução de 90% no tempo de configuração de dados de teste** ← NOVO
- ✅ **Formulários gerados automaticamente eliminam necessidade de editar JSON** ← NOVO
- ✅ Documentação sempre atualizada automaticamente
- ✅ Rastreabilidade completa: manual → teste → resultado
- ✅ **Templates reutilizáveis para casos de teste comuns** ← NOVO

### Médio Prazo
- ✅ Manuais enriquecidos com informações práticas (tempos, validações)
- ✅ Detecção precoce de divergências entre doc e sistema
- ✅ Base de conhecimento: histórico de testes por feature
- ✅ Redução de chamados de suporte (docs mais precisos)
- ✅ **Data-driven testing: mesmo script, múltiplos conjuntos de dados** ← NOVO
- ✅ **Testes de regressão em massa via importação CSV** ← NOVO
- ✅ **Detecção automática de campos durante gravação** ← NOVO

### Longo Prazo
- ✅ Cultura de qualidade: testes validam manuais, manuais guiam testes
- ✅ Compliance: evidências de testes para auditorias
- ✅ Onboarding: novos operadores treinam com scripts validados
- ✅ Regressão automatizada: re-executar scripts após cada deploy
- ✅ **Biblioteca de templates de dados para todos os módulos** ← NOVO
- ✅ **Automação completa: script → formulário → execução → feedback → doc** ← NOVO

---

## 🎯 Diferenciais da Funcionalidade de Formulário Dinâmico (NOVO)

### 1. **Zero Configuração Manual**
   - Sistema gera formulário automaticamente do manual
   - Operador não precisa saber JSON ou seletores CSS
   - Interface visual intuitiva

### 2. **Validações Inteligentes**
   - Formato de placa validado automaticamente
   - Ano validado (entre 1900 e ano atual)
   - Email verificado
   - CNPJ/CPF com validação de dígito verificador

### 3. **Reutilização Eficiente**
   - Templates salvos
   - Templates compartilhados entre operadores
   - Templates predefinidos por tipo de cadastro
   - Importação de planilhas para testes em massa

### 4. **Integração Completa**
   - Funciona com scripts gerados dos manuais
   - Funciona com cenários gravados
   - Detecta campos automaticamente durante gravação
   - Mesma interface para ambos os fluxos

### 5. **Evidências Detalhadas**
   - Screenshots mostram campos preenchidos
   - Relatório exibe dados utilizados
   - Rastreabilidade completa do teste
   - Histórico de execuções com diferentes dados

---

## 📊 Comparativo: Antes vs Depois (NOVO)

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Criar script** | 30min editando JSON | 5min selecionando do manual |
| **Configurar dados** | Editar JSON manualmente | Preencher formulário visual (1min) |
| **Validar dados** | Manualmente após erro | Automático antes de executar |
| **Reutilizar dados** | Copiar/colar JSON | Carregar template salvo |
| **Múltiplos testes** | Criar N scripts iguais | 1 script + N templates |
| **Testes em massa** | Impossível | Importar CSV com N registros |
| **Detecção de campos** | Manual durante gravação | Automática |
| **Aprendizado** | Curva alta (JSON, seletores) | Curva baixa (formulário visual) |

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Seletores extraídos incorretos | Média | Alto | Revisão manual obrigatória antes da 1ª execução |
| Mudanças não aprovadas alterarem docs | Baixa | Alto | Sistema exige aprovação explícita + Git log |
| Manuais com procedimentos ambíguos | Alta | Médio | Parser identifica ambiguidades e sinaliza |
| Conflitos Git ao atualizar manuais | Baixa | Médio | Sistema faz pull antes de commitar + resolve conflitos |

---

## 📅 Plano de Implementação (ATUALIZADO)

### Fase 1: UI/UX (Semana 1)
- [ ] Criar componente `Collapsible.jsx`
- [ ] Refatorar CUTI.jsx com abas
- [ ] Adicionar botões "Ocultar/Expandir" em todas as seções explicativas
- [ ] Criar `ManualScriptSelector.jsx`
- [ ] Criar `ScriptPreview.jsx`
- [ ] **Criar `DataInputForm.jsx` (componente principal do formulário dinâmico)** ← NOVO
- [ ] **Criar `FormField.jsx` (campo customizável)** ← NOVO
- [ ] **Criar `DataTemplateManager.jsx` (gerenciar templates salvos)** ← NOVO
- [ ] **Criar `DataImporter.jsx` (importação CSV/Excel)** ← NOVO
- [ ] Criar `FeedbackApproval.jsx`
- [ ] Criar `PendingUpdates.jsx`

### Fase 2: Backend - Parser e DataSchema (Semana 2)
- [ ] Implementar `manual-parser.js`
- [ ] **Estender parser para extrair dataSchema dos manuais** ← NOVO
- [ ] Implementar `scenario-generator.js`
- [ ] **Adicionar suporte a {{DATA.campo}} no generator** ← NOVO
- [ ] **Implementar `data-form.js` (geração automática de formulários)** ← NOVO
- [ ] **Implementar validação de dados antes da execução** ← NOVO
- [ ] Criar rota `GET /api/manual-scripts`
- [ ] Criar rota `GET /api/manual-scripts/:product`
- [ ] Criar rota `POST /api/manual-scripts/generate-scenario`
- [ ] **Criar rota `POST /api/manual-scripts/validate-data`** ← NOVO
- [ ] Testar com 3 manuais (AxHub Veículos, AxHub Usuários, AxTon Pesagem)

### Fase 3: Backend - Templates e Execução (Semana 3)
- [ ] **Implementar sistema de templates de dados** ← NOVO
- [ ] **Criar rota `POST /api/data-templates`** ← NOVO
- [ ] **Criar rota `GET /api/data-templates/:scriptId`** ← NOVO
- [ ] **Criar rota `DELETE /api/data-templates/:id`** ← NOVO
- [ ] **Implementar importação de CSV/Excel** ← NOVO
- [ ] **Criar rota `POST /api/data-templates/import-csv`** ← NOVO
- [ ] **Atualizar rota `POST /api/scenarios/execute` para aceitar userData** ← NOVO
- [ ] **Implementar substituição {{DATA.campo}} durante execução** ← NOVO
- [ ] **Atualizar ScenarioLearningEngine para detectar campos preenchidos** ← NOVO
- [ ] Implementar `feedback-loop.js`
- [ ] Implementar `manual-updater.js`

### Fase 4: Testes e Validação (Semana 4)
- [ ] **Testar formulário dinâmico com script Cadastro de Veículo** ← NOVO
- [ ] **Preencher formulário e validar preenchimento automático** ← NOVO
- [ ] **Salvar template e reutilizar em nova execução** ← NOVO
- [ ] **Testar importação CSV com 10 registros** ← NOVO
- [ ] **Testar detecção de campos durante gravação** ← NOVO
- [ ] Executar script de Cadastro de Usuário (AxHub)
- [ ] Validar feedback gerado
- [ ] Aprovar atualização do manual
- [ ] Verificar commit no Git
- [ ] **Repetir para 5 features diferentes com formulário de dados** ← ATUALIZADO
- [ ] Documentar processo completo

### Fase 5: Refinamento (Semana 5)
- [ ] **Adicionar templates predefinidos (veículo-teste, usuario-teste, etc.)** ← NOVO
- [ ] **Implementar validações customizadas por tipo de campo** ← NOVO
- [ ] **Adicionar suporte a listas dinâmicas (ex: marcas de veículo)** ← NOVO
- [ ] **Implementar preview dos dados antes da execução** ← NOVO
- [ ] Implementar histórico de validações por script
- [ ] Criar dashboard de cobertura (% features testadas)
- [ ] Melhorar inferência de seletores
- [ ] Adicionar suporte a screenshots comparativos
- [ ] **Implementar execução em lote (batch) com múltiplos conjuntos de dados** ← NOVO

---

## 🎬 Demo Proposto (ATUALIZADO)

**Cenário:** Cadastro de Veículo no AxHub Homologação

1. **Preparação:**
   - Operador acessa CUTI v3.0
   - Seleciona aba "📘 Scripts dos Manuais"
   - Escolhe AxHub → Cadastros Básicos → Veículos

2. **Visualização do Script:**
   - Sistema exibe script com 10 passos extraídos do manual
   - Sistema detecta 6 campos de dados (5 obrigatórios, 1 opcional)

3. **Preenchimento do Formulário (NOVO):**
   - Sistema gera formulário dinâmico automaticamente
   - Operador escolhe entre:
     * Preencher manualmente
     * Carregar template "Veículo Teste - Carro Comum"
     * Importar CSV com múltiplos registros
   - Operador opta por preencher manualmente:
     ```
     Placa:   XYZ-9876
     Marca:   Toyota (seleciona do dropdown)
     Modelo:  Corolla
     Ano:     2022
     Cor:     Prata (seleciona do dropdown)
     Renavam: 98765432100
     ```
   - Sistema valida automaticamente (✅ todos os campos válidos)

4. **Configuração de Execução:**
   - URL: `https://homologacao.axhub.axion.ws`
   - Clica "⚡ Executar Script"

5. **Execução:**
   - Puppeteer executa em 15.2s (headless:false, visível)
   - Passo 1: Navega para /veiculo
   - Passo 2: Clica em "Novo"
   - **Passo 3-8: Sistema preenche automaticamente os campos com os dados do formulário**
   - Passo 9: Clica em "Salvar"
   - Passo 10: Verifica que veículo XYZ-9876 aparece na tabela

6. **Resultado:**
   - ✅ SUCCESS - 10/10 passos concluídos
   - 📸 10 screenshots capturados
   - **📋 Dados utilizados exibidos no relatório**
   - ⏱️ Tempo: 15.2s

7. **Salvar Template (NOVO):**
   - Operador clica "💾 Salvar Template"
   - Define nome: "Veículo Toyota Corolla 2022"
   - Template salvo para reutilização futura

8. **Feedback:**
   - Sistema gera 2 sugestões de atualização no manual
   - Operador revisa na aba "✅ Aprovar Atualizações"
   - Aprova ambas as sugestões
   - Sistema atualiza o manual e commita no Git

9. **Reutilização (NOVO):**
   - Operador volta à aba "📘 Scripts dos Manuais"
   - Seleciona o mesmo script novamente
   - Carrega template "Veículo Toyota Corolla 2022"
   - Altera apenas a Placa para "ABC-5432"
   - Executa novamente
   - ✅ Novo veículo cadastrado em 14.8s

10. **Verificação:**
    - Operador abre `AxHub/docs-portal/docs/cadastros-basicos/veiculos.md`
    - Verifica que as mudanças foram aplicadas
    - Vê no histórico do Git o commit automático

---

## ❓ Perguntas para Aprovação (ATUALIZADAS)

1. **Escopo:** Começar com os 3 produtos (AxHub, AxTon, AxCross) ou apenas AxHub inicialmente?

2. **Aprovação:** Quem pode aprovar atualizações nos manuais? Apenas admin ou todos os operadores?

3. **Git:** Commitar automaticamente ou criar Pull Request para revisão?

4. **Seletores:** Aceita sugestões automáticas ou exige revisão manual na 1ª execução de cada script?

5. **Frequência:** Executar scripts sob demanda ou agendar execução diária/semanal?

6. **Templates de Dados (NOVO):** Criar templates predefinidos para cada tipo de cadastro (veículo-teste, usuario-teste, equipamento-teste, etc.)?

7. **Importação CSV (NOVO):** Permitir importação em massa de dados para execução em lote? Se sim, limitar quantos registros por execução?

8. **Validações (NOVO):** Implementar validações customizadas por produto (ex: validação de placa do Detran, validação de CNPJ, etc.)?

9. **Detecção Automática (NOVO):** Durante gravação de cenário, sempre perguntar se campos preenchidos devem virar variáveis ou fazer isso automaticamente?

10. **Reutilização (NOVO):** Permitir que um template de dados seja compartilhado entre diferentes operadores ou manter privado por usuário?

---

## ✅ Critérios de Sucesso (ATUALIZADOS)

- [ ] Interface CUTI mais limpa (50% menos texto visível por padrão)
- [ ] 100% dos procedimentos do manual AxHub/Veículos convertidos em scripts
- [ ] **Formulário de dados gerado automaticamente para cada script** ← NOVO
- [ ] **Template de dados salvo e reutilizado com sucesso** ← NOVO
- [ ] **Validação de dados funcionando (formato de placa, ano, etc.)** ← NOVO
- [ ] 1º script executado com sucesso em homologação **com dados do formulário**
- [ ] **Mesmo script executado 2x com diferentes conjuntos de dados** ← NOVO
- [ ] **Importação CSV com 10 registros executada com sucesso** ← NOVO
- [ ] 1ª atualização de manual aprovada e commitada no Git
- [ ] Tempo de criação de script reduzido de 30min para 5min
- [ ] **Tempo de preenchimento de dados: < 1min (via formulário ou template)** ← NOVO
- [ ] 0 erros de commit (conflitos Git resolvidos automaticamente)
- [ ] **Cenário gravado detecta campos e oferece criação de formulário** ← NOVO

---

## 📞 Próximos Passos

Após aprovação desta proposta:

1. **Kickoff Meeting** - Alinhamento da equipe
2. **Setup Ambiente** - Configurar acesso ao Git para commits automáticos
3. **Sprint 1** - Implementar Fase 1 (UI/UX)
4. **Demo Checkpoint 1** - Validar nova interface
5. **Sprint 2** - Implementar Fase 2 (Parser)
6. **Demo Checkpoint 2** - Validar geração de scripts
7. **Sprint 3** - Implementar Fase 3 (Feedback Loop)
8. **Demo Final** - Executar cenário completo

---

**Data:** 2026-06-25  
**Versão:** 1.0  
**Status:** 🟡 Aguardando Aprovação
