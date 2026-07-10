# 📊 Análise: Linguistic Validation Engine — Status Atual vs. Especificação

**Data:** 22/06/2026  
**Módulo:** AxionIA - Linguistic Validation Engine v1.0.0  
**Responsável:** Análise Técnica  

---

## ✅ **STATUS GERAL**

| Categoria | Status | Implementação |
|-----------|--------|---------------|
| **Infraestrutura Base** | 🟡 Parcial | 30% |
| **Validação Ortográfica** | 🟡 Básica | 20% |
| **Validação Gramatical** | 🔴 Não implementado | 0% |
| **Terminologia Corporativa** | 🔴 Não implementado | 0% |
| **Scan Multi-formato** | 🔴 Não implementado | 0% |
| **Relatórios Avançados** | 🔴 Não implementado | 0% |
| **Auto-fix** | 🔴 Não implementado | 0% |

**Implementação Total: ~12%**

---

## 📋 **O QUE EXISTE ATUALMENTE**

### 1. **Central de Validação** ✅
- **Localização:** `http://localhost:3017/central-validacao`
- **Status:** Interface completa com 6 abas:
  - 📊 Dashboard (métricas mockadas)
  - 📋 Fila de Trabalho
  - 🖼️ **Validação Visual** (implementada)
  - 🤖 Revisão IA
  - 🔍 Auditoria
  - ⚙️ Configurações

### 2. **Validação Visual** 🟡
- **Arquivo:** `axion-ia-api/src/visual-validation-controller.js`
- **Funcionalidade:**
  - ✅ Screenshot de páginas
  - ✅ Validação de formulários (campos, tipos, validações)
  - ✅ Testes de CRUD
  - 🟡 **Ortografia básica** (15 palavras hardcoded)

**Código atual:**
```javascript
function checkSpelling(text) {
  const commonErrors = {
    "voce": "você",
    "nao": "não",
    "informaçao": "informação",
    "usuario": "usuário",
    "numero": "número",
    "codigo": "código",
    // ... apenas 15 palavras
  };
  // Busca simples por palavras conhecidas
}
```

### 3. **Limitações Críticas**
❌ **Não detecta:**
- Erros de acentuação complexos
- Erros gramaticais (concordância, regência)
- Capitalização incorreta
- Pontuação inadequada
- Pluralização incorreta
- Abreviaturas não padronizadas
- Terminologia inconsistente entre projetos
- Textos duplicados ou divergentes

❌ **Não suporta:**
- Múltiplos formatos de arquivo (JSON, YAML, XML, MD, etc.)
- Scan recursivo de projetos
- Glossário corporativo
- Referências a dicionários oficiais (VOLP)
- Análise por projeto/módulo/componente
- Relatórios em múltiplos formatos
- Correção automática

---

## 🎯 **O QUE PRECISA SER IMPLEMENTADO**

### **FASE 1: Validação Linguística Robusta** 🔴

#### 1.1 **Dicionário Português Completo**
```javascript
// Integrar biblioteca de dicionário PT-BR
import { LanguageToolAPI } from 'languagetool-api';
import { VOLPDictionary } from './dictionaries/volp';

async function validateSpelling(text) {
  // Validar contra VOLP + dicionário completo
  const errors = await LanguageToolAPI.check(text, 'pt-BR');
  return errors.filter(e => e.rule.category === 'TYPOS');
}
```

#### 1.2 **Validação Gramatical**
```javascript
async function validateGrammar(text) {
  const errors = await LanguageToolAPI.check(text, 'pt-BR');
  return errors.filter(e => 
    ['GRAMMAR', 'AGREEMENT', 'VERB_FORM'].includes(e.rule.category)
  );
}
```

#### 1.3 **Glossário Corporativo**
```json
{
  "glossary": {
    "preferred_terms": {
      "login": "Login",
      "dashboard": "Dashboard",
      "usuário": "Usuário",
      "configuração": "Configuração",
      "relatório": "Relatório"
    },
    "forbidden_terms": {
      "logon": "Use 'Login'",
      "painel": "Use 'Dashboard'",
      "config": "Use 'Configuração'"
    },
    "abbreviations": {
      "CPF": "CPF",
      "CNPJ": "CNPJ",
      "RG": "RG"
    }
  }
}
```

---

### **FASE 2: Scanner Multi-formato** 🔴

#### 2.1 **Arquitetura de Scan**
```javascript
class LinguisticScanner {
  constructor() {
    this.parsers = {
      '.jsx': new ReactParser(),
      '.vue': new VueParser(),
      '.html': new HTMLParser(),
      '.json': new JSONParser(),
      '.yaml': new YAMLParser(),
      '.md': new MarkdownParser(),
      '.cs': new CSharpParser(),
      '.resx': new ResxParser()
    };
  }

  async scanProject(projectPath, options) {
    const files = await this.discoverFiles(projectPath, options.include);
    const results = [];

    for (const file of files) {
      const parser = this.getParser(file);
      const texts = await parser.extractTexts(file);
      
      for (const text of texts) {
        const issues = await this.validateText(text);
        results.push({
          file: file.path,
          project: file.project,
          module: file.module,
          component: file.component,
          line: text.line,
          column: text.column,
          original: text.value,
          issues
        });
      }
    }

    return results;
  }
}
```

#### 2.2 **Parsers Específicos**
- **ReactParser**: Extrai texto de JSX (labels, placeholders, messages)
- **JSONParser**: Extrai strings de i18n, tradução, config
- **HTMLParser**: Extrai texto de elementos, atributos, aria-labels
- **MarkdownParser**: Extrai parágrafos, headings, listas
- **ResxParser**: Extrai recursos .NET (RESX)

---

### **FASE 3: Relatórios Avançados** 🔴

#### 3.1 **Estrutura do Relatório**
```json
{
  "report_id": "LING-2026-06-22-001",
  "timestamp": "2026-06-22T20:30:00Z",
  "projects_scanned": ["AxHub", "AxTon", "AxCross"],
  "summary": {
    "total_files": 1247,
    "total_texts": 5892,
    "total_issues": 342,
    "severity_breakdown": {
      "critical": 12,
      "high": 45,
      "medium": 128,
      "low": 157
    }
  },
  "issues_by_category": {
    "orthography": 156,
    "grammar": 78,
    "terminology": 54,
    "capitalization": 34,
    "duplication": 20
  },
  "issues_by_project": {
    "AxHub": {
      "score": 87.2,
      "issues": 142
    },
    "AxTon": {
      "score": 91.5,
      "issues": 89
    },
    "AxCross": {
      "score": 95.1,
      "issues": 51
    }
  },
  "top_10_issues": [
    {
      "text": "usuario",
      "suggestion": "usuário",
      "occurrences": 23,
      "files": ["src/pages/Login.jsx", "..."]
    }
  ],
  "details": [...]
}
```

#### 3.2 **Visualizações**
- **Dashboard HTML**: Gráficos interativos (Chart.js)
- **Relatório PDF**: Executivo com métricas principais
- **CSV**: Dados tabulares para análise
- **JSON**: Integração com CI/CD

---

### **FASE 4: Auto-fix Inteligente** 🔴

#### 4.1 **Motor de Correção**
```javascript
class AutoFixer {
  async fixIssue(issue, options = {}) {
    if (!options.previewBeforeApply) {
      return await this.applyFix(issue);
    }

    // Preview com diff
    const preview = this.generatePreview(issue);
    const confirmation = await this.requestConfirmation(preview);
    
    if (confirmation.approved) {
      return await this.applyFix(issue);
    }
  }

  async applyFix(issue) {
    const file = await this.readFile(issue.file);
    
    // Aplicar correção preservando variáveis, placeholders, tags HTML
    const fixed = this.safeReplace(
      file.content,
      issue.original,
      issue.suggested,
      {
        preserveVariables: true,
        preservePlaceholders: true,
        preserveHTMLTags: true
      }
    );

    // Se apply_same_fix_to_identical_occurrences = true
    if (this.options.applyToIdentical) {
      await this.fixAllOccurrences(issue);
    }

    await this.writeFile(issue.file, fixed);
  }
}
```

---

## 📊 **ROADMAP DE IMPLEMENTAÇÃO**

### **Sprint 1 (5 dias)** 
- ✅ Integrar LanguageTool API (ortografia + gramática)
- ✅ Criar glossário corporativo inicial (100 termos)
- ✅ Implementar scan básico (React/Vue/HTML)

### **Sprint 2 (5 dias)**
- ✅ Parsers para JSON, YAML, Markdown
- ✅ Relatório HTML com visualizações
- ✅ Sistema de severidade (Critical/High/Medium/Low)

### **Sprint 3 (3 dias)**
- ✅ Auto-fix com preview
- ✅ Detecção de duplicação
- ✅ Análise de terminologia inconsistente

### **Sprint 4 (2 dias)**
- ✅ Integração CI/CD (gate de qualidade)
- ✅ Exportação PDF/CSV
- ✅ API REST para consultas

**Total: 15 dias úteis**

---

## 🔧 **ARQUITETURA PROPOSTA**

```
axion-ia-api/
├── src/
│   ├── linguistic/
│   │   ├── engine.js           # Motor principal
│   │   ├── validators/
│   │   │   ├── spelling.js     # Ortografia (LanguageTool)
│   │   │   ├── grammar.js      # Gramática
│   │   │   ├── terminology.js  # Glossário corporativo
│   │   │   ├── duplication.js  # Detecção de duplicados
│   │   │   └── style.js        # Capitalização, pontuação
│   │   ├── parsers/
│   │   │   ├── react.parser.js
│   │   │   ├── vue.parser.js
│   │   │   ├── json.parser.js
│   │   │   ├── html.parser.js
│   │   │   └── markdown.parser.js
│   │   ├── dictionaries/
│   │   │   ├── volp.json       # VOLP oficial
│   │   │   ├── glossary.json   # Glossário Axion
│   │   │   └── abbreviations.json
│   │   ├── reporters/
│   │   │   ├── html.reporter.js
│   │   │   ├── pdf.reporter.js
│   │   │   ├── csv.reporter.js
│   │   │   └── json.reporter.js
│   │   └── fixer/
│   │       ├── auto-fixer.js   # Motor de correção
│   │       └── preview.js      # Geração de preview
│   └── routes/
│       └── linguistic.routes.js

axion-ia-panel/
└── src/
    └── pages/
        └── CentralValidacao/
            └── components/
                ├── ValidacaoLinguistica.jsx  # Nova aba
                └── LinguisticReport.jsx      # Visualização
```

---

## 🎯 **MÉTRICAS DE SUCESSO**

| Métrica | Meta | Como Medir |
|---------|------|------------|
| **Cobertura de Arquivos** | 100% dos projetos | Scan completo AxHub/AxTon/AxCross |
| **Precisão de Detecção** | >95% | Verdadeiros positivos / Total detectado |
| **Falsos Positivos** | <5% | Issues incorretos / Total issues |
| **Tempo de Scan** | <5min | Para codebase completo (todos projetos) |
| **Taxa de Correção Automática** | >80% | Issues corrigidos / Total issues |
| **Qualidade Textual Geral** | >90 pontos | Score médio de todos os projetos |

---

## 💡 **BENEFÍCIOS ESPERADOS**

1. **Eliminação de erros de interface**: 100% de ortografia correta
2. **Padronização terminológica**: Glossário único em todos os projetos
3. **Redução de trabalho manual**: Auto-fix elimina 80% das correções
4. **Melhoria de UX**: Usuários não veem textos com erros
5. **Auditorias contínuas**: Gate de qualidade no CI/CD
6. **Documentação viva**: Glossário centralizado e atualizado
7. **Compliance**: Atende normas ABNT de redação técnica

---

## 🚀 **PRÓXIMOS PASSOS RECOMENDADOS**

### **Passo 1: Decisão de Stack**
- ✅ **LanguageTool**: API REST (gratuita ou paga?)
- ✅ **Dicionário VOLP**: JSON estático ou API?
- ✅ **Glossário**: Arquivo JSON ou banco de dados?

### **Passo 2: Criar Branch**
```bash
git checkout -b feature/linguistic-validation-engine
```

### **Passo 3: Implementar FASE 1 (Sprint 1)**
1. Instalar dependências:
```bash
npm install languagetool-api natural compromise
```

2. Criar estrutura de pastas

3. Implementar `spelling.js` com LanguageTool

4. Criar glossário inicial (`glossary.json`)

5. Criar endpoint REST: `POST /api/linguistic/scan`

### **Passo 4: Criar Interface no Painel**
- Nova aba na Central de Validação
- Formulário: selecionar projetos, módulos
- Botão "Escanear Linguagem"
- Visualização de resultados

### **Passo 5: Testes**
- Testar com AxHub primeiro (projeto piloto)
- Validar precisão de detecção
- Ajustar glossário conforme necessário

---

## ⚠️ **OBSERVAÇÕES IMPORTANTES**

### **Sobre o Vade Mecum**
❌ **Não usar como referência linguística**  
O Vade Mecum é uma compilação de leis e normas jurídicas. Não é adequado para validação de ortografia ou gramática em interfaces de software.

✅ **Usar em contextos legais específicos**  
Se houver módulos jurídicos (contratos, termos de uso, compliance), o Vade Mecum pode ser referência para terminologia legal específica.

### **Referências Válidas**
- ✅ VOLP (Vocabulário Ortográfico da Língua Portuguesa)
- ✅ Dicionários Houaiss, Aurélio, Michaelis
- ✅ ABNT NBR 6023 (Referências bibliográficas)
- ✅ ABNT NBR 15287 (Trabalhos acadêmicos)
- ✅ Manual de Redação da Presidência da República

---

## 📝 **CONCLUSÃO**

**Status Atual:** A infraestrutura base existe (Central de Validação), mas a validação linguística está apenas **12% implementada**.

**Gap Principal:** Falta integração com dicionários completos, gramática, terminologia corporativa, scan multi-formato e relatórios avançados.

**Recomendação:** Implementar o Linguistic Validation Engine completo conforme roadmap de 15 dias úteis (3 semanas).

**Prioridade:** 🔴 **ALTA** — Qualidade textual impacta diretamente a experiência do usuário e a percepção de profissionalismo do produto.

---

**Aprovação necessária:**
- [ ] Equipe de Desenvolvimento
- [ ] Product Owner
- [ ] Equipe de Qualidade
- [ ] Stakeholders

**Data da próxima revisão:** ___/___/___
