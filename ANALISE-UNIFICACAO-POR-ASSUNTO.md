# ANÁLISE DE UNIFICAÇÃO POR ASSUNTO/CONTEXTO

**Data:** 2026-06-20 17:40  
**Critério:** Arquivos do mesmo assunto/status que devem ser unificados  
**Objetivo:** Consolidar por tema, não apenas por duplicação literal

---

## 🎯 GRUPOS PARA UNIFICAÇÃO

### 📊 GRUPO 1: ANÁLISE DE MERCADO (2 arquivos → 1)

**Arquivos:**
- `ANALISE-MERCADO-2026.md` (21.7 KB) - Gaps tecnológicos
- `ANALISE-MERCADO-GAP-RESUMO-EXECUTIVO.md` (8.7 KB) - Gaps comerciais

**Por que unificar?**
- ✅ Ambos são sobre **análise de mercado**
- ✅ Ambos identificam **gaps** (tecnológicos e comerciais)
- ✅ Um complementa o outro (técnico + comercial)
- ✅ Usuário busca "análise de mercado" → deveria encontrar tudo em um lugar

**Arquivo consolidado:**
`ANALISE-MERCADO-COMPLETA-2026.md` (≈30 KB)

**Estrutura:**
```markdown
# ANÁLISE DE MERCADO COMPLETA 2026

## PARTE I: ANÁLISE TÉCNICA - Gaps Tecnológicos
[Conteúdo de ANALISE-MERCADO-2026.md]

## PARTE II: ANÁLISE COMERCIAL - Gaps e Oportunidades
[Conteúdo de ANALISE-MERCADO-GAP-RESUMO-EXECUTIVO.md]

## PARTE III: SÍNTESE E RECOMENDAÇÕES
[Integração dos dois]
```

---

### 📋 GRUPO 2: RESUMOS EXECUTIVOS (3 arquivos → 1)

**Arquivos:**
- `RESUMO-EXECUTIVO.md` (8.4 KB) - Pipeline OCR + Confiança
- `ANALISE-FUNCIONALIDADES-RESUMO-EXECUTIVO.md` (12.2 KB) - Arquitetura flat
- `ANALISE-MERCADO-GAP-RESUMO-EXECUTIVO.md` (8.7 KB) - Mercado/GAP

**Por que unificar?**
- ✅ Todos são **resumos executivos**
- ✅ Formato similar (one-pagers para C-Level)
- ✅ Usuário busca "resumos executivos" → deveria encontrar todos juntos
- ✅ Facilita comparação entre projetos

**Arquivo consolidado:**
`RESUMOS-EXECUTIVOS-CONSOLIDADO.md` (≈30 KB)

**Estrutura:**
```markdown
# RESUMOS EXECUTIVOS - PROJETOS AXION

## ÍNDICE
1. Pipeline OCR + Confiança
2. Arquitetura e Funcionalidades
3. Análise de Mercado e Gaps

---

## 1. PIPELINE OCR + CONFIANÇA
**Status:** ✅ Entregue 13/05/2026  
[Conteúdo de RESUMO-EXECUTIVO.md]

## 2. ARQUITETURA E FUNCIONALIDADES  
**Foco:** Refatoração arquitetural  
[Conteúdo de ANALISE-FUNCIONALIDADES-RESUMO-EXECUTIVO.md]

## 3. ANÁLISE DE MERCADO E GAPS
**Foco:** Oportunidades comerciais  
[Conteúdo de ANALISE-MERCADO-GAP-RESUMO-EXECUTIVO.md]
```

---

### 📊 GRUPO 3: DASHBOARDS (2 arquivos → 1)

**Arquivos:**
- `ANALISE-COMPLETA-DASHBOARD-AXHUB-IPEMPE.md` (22.7 KB) - Dashboard técnico
- `DASHBOARD-POTENCIAL-COMERCIAL.md` (9.3 KB) - Dashboard comercial

**Por que unificar?**
- ✅ Ambos são sobre **dashboards**
- ✅ Um é técnico, outro comercial → complementares
- ✅ Usuário busca "dashboard" → deveria ver ambas análises
- ✅ Facilita visão 360° (operacional + estratégico)

**Arquivo consolidado:**
`DASHBOARDS-ANALISE-COMPLETA.md` (≈32 KB)

**Estrutura:**
```markdown
# DASHBOARDS - ANÁLISE COMPLETA

## PARTE I: DASHBOARD OPERACIONAL (AxHub IPEMPE)
**Tipo:** Técnico/Operacional  
**Foco:** Componentes UI, Banco de Dados, Triagem  
[Conteúdo de ANALISE-COMPLETA-DASHBOARD-AXHUB-IPEMPE.md]

## PARTE II: DASHBOARD ESTRATÉGICO (Potencial Comercial)
**Tipo:** Comercial/Financeiro  
**Foco:** Mercado, Receitas, ROI, Projeções  
[Conteúdo de DASHBOARD-POTENCIAL-COMERCIAL.md]

## PARTE III: INTEGRAÇÃO E INSIGHTS
[Como os dois dashboards se complementam]
```

---

### 🏗️ GRUPO 4: CONSOLIDAÇÕES (2 arquivos → 1)

**Arquivos:**
- `CONSOLIDACAO-PORTAS-CONCLUIDA.md` (7.3 KB) - Portas de rede
- `CONSOLIDACAO-REGRAS-NEGOCIO-TODOS-SITES.md` (14.6 KB) - Regras de negócio

**Por que unificar?**
- ✅ Ambos são **projetos de consolidação**
- ✅ Ambos já foram **concluídos** (histórico)
- ✅ Usuário busca "consolidações realizadas" → deveria ver todas
- ✅ Facilita rastreamento de melhorias implementadas

**Arquivo consolidado:**
`CONSOLIDACOES-REALIZADAS-HISTORICO.md` (≈22 KB)

**Estrutura:**
```markdown
# CONSOLIDAÇÕES REALIZADAS - HISTÓRICO

## ÍNDICE DE CONSOLIDAÇÕES
1. Consolidação de Portas (Maio 2026)
2. Consolidação de Regras de Negócio (Maio 2026)

---

## 1. CONSOLIDAÇÃO DE PORTAS
**Data:** 13/05/2026  
**Status:** ✅ Concluída  
[Conteúdo de CONSOLIDACAO-PORTAS-CONCLUIDA.md]

## 2. CONSOLIDAÇÃO DE REGRAS DE NEGÓCIO
**Data:** 16/05/2026  
**Status:** ✅ Concluída  
[Conteúdo de CONSOLIDACAO-REGRAS-NEGOCIO-TODOS-SITES.md]
```

---

### 📚 GRUPO 5: GUIAS PRÁTICOS AXCROSS/OCR (2 arquivos → 1)

**Arquivos:**
- `GUIA-PRATICO-REVISAR-AXCROSS.md` (9.0 KB) - Revisar item 7 AxCross
- `GUIA-USO-OCR-CONFIANCA.md` (8.1 KB) - Pipeline OCR + Confiança

**Por que unificar?**
- ✅ Ambos são **guias práticos operacionais**
- ✅ Formato similar (quick reference)
- ✅ Tamanho similar (8-9 KB cada)
- ✅ Usuário busca "guias práticos" → deveria ver todos

**Arquivo consolidado:**
`GUIAS-PRATICOS-OPERACIONAIS.md` (≈18 KB)

**Estrutura:**
```markdown
# GUIAS PRÁTICOS OPERACIONAIS

## ÍNDICE
1. AxCross - Revisar Item 7 no Edital
2. Pipeline OCR + Confiança - Setup e Uso

---

## 1. AXCROSS - REVISAR ITEM 7
**Caso:** Requisito vago no edital  
**Sistema:** AxCross (Monitoramento)  
[Conteúdo de GUIA-PRATICO-REVISAR-AXCROSS.md]

## 2. PIPELINE OCR + CONFIANÇA
**Caso:** Inicializar sistema OCR  
**Sistema:** axion-ia (API + Panel)  
[Conteúdo de GUIA-USO-OCR-CONFIANCA.md]
```

---

### 🔍 GRUPO 6: COMPARAÇÕES (2 arquivos → 1)

**Arquivos:**
- `COMPARACAO-IPEMPE-VS-GOIANIA-MEDICAO.sql` (17.4 KB) - SQL de comparação
- Verificar se existe `COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md`

**Análise:**
- ⚠️ Um é SQL script, outro seria MD
- Verificar existência do segundo arquivo
- Se existir → unificar em "COMPARACOES-MEDICAO.md"

---

## 📊 RESUMO DE UNIFICAÇÕES

### Arquivos a Consolidar

| Grupo | Arquivos Origem | Arquivo Destino | Redução |
|-------|----------------|-----------------|---------|
| 1. Mercado | 2 arquivos (30.4 KB) | ANALISE-MERCADO-COMPLETA-2026.md | -1 arquivo |
| 2. Resumos | 3 arquivos (29.3 KB) | RESUMOS-EXECUTIVOS-CONSOLIDADO.md | -2 arquivos |
| 3. Dashboards | 2 arquivos (32.0 KB) | DASHBOARDS-ANALISE-COMPLETA.md | -1 arquivo |
| 4. Consolidações | 2 arquivos (21.9 KB) | CONSOLIDACOES-REALIZADAS-HISTORICO.md | -1 arquivo |
| 5. Guias Práticos | 2 arquivos (17.1 KB) | GUIAS-PRATICOS-OPERACIONAIS.md | -1 arquivo |

**TOTAL:**
- **Arquivos antes:** 62
- **Arquivos a deletar:** 11
- **Arquivos a criar:** 5
- **Arquivos após:** 56 (-6 arquivos, -9.7%)
- **Espaço consolidado:** 130.7 KB → 130.7 KB (mesmo tamanho, melhor organização)

---

## ✅ BENEFÍCIOS DA UNIFICAÇÃO

### 🎯 Organização
- ✅ Um arquivo por assunto principal
- ✅ Facilita busca (palavra-chave única)
- ✅ Reduz decisão de "onde procurar?"
- ✅ Estrutura mais clara

### 📚 Navegação
- ✅ Índice interno em cada consolidado
- ✅ Visão completa do tema
- ✅ Comparação facilitada
- ✅ Menos arquivos para navegar

### 🔄 Manutenção
- ✅ Um lugar para atualizar cada tema
- ✅ Menos risco de informação desatualizada
- ✅ Histórico centralizado
- ✅ Versionamento mais claro

---

## 🚫 ARQUIVOS QUE NÃO DEVEM SER UNIFICADOS

### AXION-PIEQ (7 arquivos)
**Motivo:** Estrutura modular intencional, cada doc serve público diferente

### Diagnósticos (4 arquivos)
**Motivo:** Casos específicos únicos, valor histórico individual

### Guias Técnicos Grandes (4 arquivos)
**Motivo:** Já consolidados, tamanho adequado (48-187 KB)

### Análises Técnicas Específicas (múltiplos)
**Motivo:** Cada uma sobre caso/equipamento único

---

## 📋 PRÓXIMO PASSO: CRIAR SCRIPT

Criar script PowerShell que:
1. Lê arquivos de origem
2. Cria estrutura consolidada
3. Move conteúdo com cabeçalhos
4. Deleta originais
5. Atualiza índice mestre
6. Commit no Git

---

## ⚠️ ATENÇÃO ESPECIAL

### Arquivo Gigante (ainda pendente)
`prompt-analise-saas.md` (2.2 MB) → Mover para `.prompts/` após consolidação

### Validar Referências
- Verificar se outros docs referenciam os arquivos a deletar
- Atualizar links se necessário

---

## 🎓 CRITÉRIO DE UNIFICAÇÃO

Unificar quando:
- ✅ Mesmo **assunto/domínio** (mercado, dashboards, guias práticos)
- ✅ Mesmo **tipo de documento** (resumos executivos, consolidações)
- ✅ Mesmo **status/contexto** (projetos concluídos, análises atuais)
- ✅ **Complementares** (técnico + comercial do mesmo tema)
- ✅ **Formato similar** (quick reference, one-pagers)

NÃO unificar quando:
- ❌ Estrutura modular intencional
- ❌ Públicos completamente diferentes
- ❌ Casos únicos com valor histórico individual
- ❌ Já consolidados em operação anterior
- ❌ Tamanhos muito grandes (>100 KB)

---

**Aguardando aprovação para gerar script de consolidação.**
