# 🎯 DEMONSTRAÇÃO — Processo de Revisão de Conformidade

**Data:** 13 de maio de 2026  
**Caso:** Revisar item com baixa confiança no AxCross  
**Requisito:** "deverão ser formulados de acordo com o item '7' do edital."

---

## 📊 FLUXO COMPLETO — Passo a Passo

```
ETAPA 1: Upload de Edital
   ↓
[Painel → Conformidade → Novo Relatório]
[Cole texto do edital ou faça upload de PDF]
[Selecione produto: AxCross]
[Clique: "Gerar Análise"]
   ↓

ETAPA 2: Processamento OCR + Extração
   ↓
[Sistema processa com ocr-processor.js]
[Extrai tabelas com table-extractor.js]
[Analisa conformidade]
   ↓

ETAPA 3: Cálculo de Confiança
   ↓
[Requisito: "Item 7 do edital"]
[Confiança: 0.35 (MUITO_BAIXA)]
[Motivo: Referência encontrada, mas contexto ambíguo]
   ↓

ETAPA 4: Criação de Item em Fila
   ↓
[Item entra na Fila de Revisão]
[Status: PENDENTE]
[Prioridade: MÉDIA]
   ↓

ETAPA 5: Revisão Manual no Painel
   ↓
[Painel → 🔍 Fila de Revisão]
[Filtro: Produto=AxCross, Status=Pendente]
[Clique no item para revisar]
   ↓

ETAPA 6: Análise e Decisão
   ↓
[Escolher: ✅ Atendido | ⚠️ Parcial | ❌ Não Atendido | ❓ Dúvida]
[Adicionar observações]
[Anexar print de prova (opcional)]
   ↓

ETAPA 7: Confirmação
   ↓
[Clique: "Revisar"]
[Sistema atualiza confiança e status]
[Item sai da fila de PENDENTE → REVISADO]
```

---

## 🖼️ INTERFACE — Como Aparece no Painel

### **Tela 1: Fila de Revisão (Lista)**

```
┌─────────────────────────────────────────────────────┐
│ 🔍 Fila de Revisão — Itens com Baixa Confiança     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Filtros:  [Produto: AxCross ▼]                    │
│            [Status: Pendente ▼]                    │
│            [Prioridade: Todos ▼]                   │
│                                                     │
│  [🔄 Atualizar] [📥 Exportar CSV]                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📌 #1 — Conformidade com Item 7 do Edital        │
│     🔴 MUITO_BAIXA (0.35)                         │
│     "deverão ser formulados de acordo com..."      │
│     Prioridade: MÉDIA                              │
│     Data: 2026-05-13 ▼                            │
│                                                     │
│  📌 #2 — Validação de Specs Técnicas              │
│     🟡 BAIXA (0.45)                               │
│     "câmeras devem estar certificadas..."          │
│     Prioridade: ALTA                               │
│     Data: 2026-05-12 ▼                            │
│                                                     │
│  📌 #3 — Cronograma de Implantação                │
│     🟡 BAIXA (0.52)                               │
│     "prazo de 90 dias para implementação..."       │
│     Prioridade: NORMAL                             │
│     Data: 2026-05-11 ▼                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### **Tela 2: Detalhe do Item (Revisão)**

```
┌──────────────────────────────────────────────────────┐
│ 📌 REVISAR ITEM #1                                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│ REQUISITO:                                           │
│ "Conformidade com Item 7 do Edital"                 │
│                                                      │
│ TEXTO ORIGINAL (do edital):                         │
│ "deverão ser formulados de acordo com o item '7'   │
│  do edital."                                        │
│                                                      │
│ CONFIANÇA AUTOMÁTICA:                               │
│ Score: 0.35 (MUITO_BAIXA) 🔴                       │
│ Motivos:                                            │
│  • Referência a "item 7" encontrada                │
│  • Contexto ambíguo (qual funcionalidade?)         │
│  • Sem clareza se AxCross atende                   │
│                                                      │
│ EVIDÊNCIA (Trecho do contrato):                     │
│ "As especificações técnicas do sistema devem ser   │
│  formuladas de acordo com o item 7 do edital,      │
│  que define os requisitos mínimos de segurança    │
│  e compatibilidade."                               │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🔎 SUA REVISÃO:                                     │
│                                                      │
│ Resultado:                                          │
│  ⦿ ✅ Atendido      (AxCross já implementa)       │
│  ○ ⚠️  Parcial      (Implementa parcialmente)       │
│  ○ ❌ Não Atendido  (Precisa desenvolver)         │
│  ○ ❓ Dúvida        (Precisa pesquisar mais)      │
│                                                      │
│ Observações:                                        │
│ ┌──────────────────────────────────────────────┐   │
│ │ Item 7 refere-se a especificações técnicas.  │   │
│ │ AxCross implementa validação automática no   │   │
│ │ módulo "Equipamentos → Validação Técnica".   │   │
│ │ Vide documentação em:                        │   │
│ │ docs/axcross/especificacoes-edital.md       │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ Print de Prova (opcional):                          │
│ [Anexar arquivo...]                                 │
│                                                      │
│ Revisor:                                            │
│ seu-email@empresa.com                              │
│                                                      │
├──────────────────────────────────────────────────────┤
│ [❌ Descartar]  [📝 Revisar]  [💾 Salvar Rascunho] │
└──────────────────────────────────────────────────────┘
```

---

## ✅ APÓS REVISÃO — O QUE MUDA

### **Antes (Pendente)**
```json
{
  "id": "item_xyz",
  "requisito": "Conformidade com Item 7",
  "confianca": 0.35,
  "nivelConfianca": "MUITO_BAIXA",
  "status": "PENDENTE",
  "dataCriacao": "2026-05-13T10:00:00Z"
}
```

### **Depois (Revisado)**
```json
{
  "id": "item_xyz",
  "requisito": "Conformidade com Item 7",
  "confianca": 0.35,
  "nivelConfianca": "MUITO_BAIXA",
  "status": "REVISADO",  ← MUDOU
  "resultadoRevisao": "atendido",  ← NOVO
  "ondeCitado": "Painel → AxCross → Equipamentos → Validação Técnica",
  "documentacao": "docs/axcross/especificacoes-edital.md",
  "printEvidencia": "screenshot-validacao.png",
  "observacoes": "Item 7 refere-se a specs técnicas. AxCross valida automaticamente.",
  "revisadoPor": "seu-email@empresa.com",
  "dataRevisao": "2026-05-13T14:30:00Z"  ← NOVO
}
```

---

## 🎬 CASO PRÁTICO — Revisar "Item 7 do AxCross"

### **Passo 1: Abrir a Fila**
```
URL: http://localhost:3002/confianca
```

### **Passo 2: Filtrar por AxCross**
```
Produto dropdown: AxCross
Status dropdown: Pendente
Clique: 🔄 Atualizar
```

### **Passo 3: Ver Item**
```
Item aparece na lista com:
- Título: "Conformidade com Item 7"
- Score: 0.35 (vermelho)
- Status: PENDENTE
```

### **Passo 4: Clicar para Revisar**
```
Click no item → Abre detalhe completo
```

### **Passo 5: Analisar Contexto**
```
Você lê:
- Trecho original do edital
- Motivos por que confiança é baixa
- Contexto do requisito
```

### **Passo 6: Tomar Decisão**
```
Escolher: ✅ Atendido

Porque: "Item 7 = Specs Técnicas
         AxCross tem validação em Equipamentos → Validação Técnica
         Vide: docs/axcross/especificacoes-edital.md"
```

### **Passo 7: Adicionar Prova**
```
Print: Tirar screenshot mostrando
  - Painel do AxCross
  - Tela de Validação Técnica
  - Campo INMETRO/ONVIF preenchido
```

### **Passo 8: Salvar Revisão**
```
Clique: 📝 Revisar

Status muda:
  De: PENDENTE → REVISADO
  Confiança: 0.35 (não muda, mas agora tem decisão humana)
  Item some da fila
```

---

## 📈 RESULTADO FINAL

### **Antes**
```
Conformidade: 50% (8/14 atendidos)
Itens pendentes de revisão: 14
Score médio: 0.42 (MÉDIA)
```

### **Depois**
```
Conformidade: 57% (8/14 atendidos + decisão manual)
Itens pendentes de revisão: 13
Score médio: 0.52 (MÉDIA → melhorou)
Itens revisados: 1
Status: ✅ Documentado
```

---

## 🔍 VALIDAÇÃO NO AXCROSS

Para confirmar que Item 7 realmente é atendido:

1. **No Painel do AxCross**
   ```
   Equipamentos → + Novo Equipamento
   Preencher: Câmera IP
   Campo: Certificação INMETRO ✓
   Campo: Protocolo ONVIF ✓
   Validar: Sistema aceita ✓
   ```

2. **Na Documentação**
   ```
   docs/axcross/
   ├─ especificacoes-edital-item7.md (criar se não existir)
   ├─ conformidade.md
   └─ guia-validacao-tecnica.md
   ```

3. **No Relatório Final**
   ```
   Conformidade → [Relatório]
   Item 7: ✅ ATENDIDO (revisado manualmente)
   Evidência: Print + Documentação
   Revisor: seu-email@empresa.com
   ```

---

## 📋 RESUMO — Como Demonstrar

| Elemento | Como Demonstrar |
|----------|-----------------|
| **Fila de Revisão** | Painel → 🔍 Fila de Revisão |
| **Item com Baixa Confiança** | Score 0.35 (MUITO_BAIXA) |
| **Revisão Manual** | Clique no item, escolha resultado |
| **Documentação** | Adicionar arquivo/link |
| **Print de Prova** | Anexar screenshot |
| **Decisão Registrada** | Status muda para REVISADO |
| **Histórico** | Tabela: quem revisor, quando |

---

**Status: ✅ PROCESSO COMPLETO E VALIDÁVEL**

Agora você sabe como revisar, demonstrar e validar qualquer requisito no AxCross! 🚀
