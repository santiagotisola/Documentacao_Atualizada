# 🛠️ GUIA PRÁTICO — Revisar Item 7 no AxCross

**Caso Real:** Requisito vago encontrado no edital  
**Requisito:** "deverão ser formulados de acordo com o item '7' do edital."  
**Sistema:** AxCross (Monitoramento de Cruzamentos)  
**Confiança Automática:** 0.35 (MUITO_BAIXA)

---

## 📍 LOCALIZAÇÃO NO PAINEL

### **Passo 1: Abrir Painel**
```
URL: http://localhost:3002
Menu Lateral → 🔍 Fila de Revisão
```

### **Passo 2: Filtrar por AxCross**
```
Dropdown "Produto": AxCross
Dropdown "Status": Pendente
Botão: 🔄 Atualizar
```

### **Passo 3: Encontrar o Item**
```
Procurar por: "Item 7" ou "formulados de acordo"

Resultado:
┌─────────────────────────────────────┐
│ 📌 Conformidade com Item 7          │
│ 🔴 MUITO_BAIXA (0.35)               │
│ "deverão ser formulados de acordo.."│
│ Prioridade: MÉDIA                   │
│ Data: 2026-05-13                    │
└─────────────────────────────────────┘
```

---

## 🔍 ANÁLISE DO REQUISITO

### **O que o Sistema Encontrou**

**Texto Original (do edital):**
```
"As especificações técnicas dos equipamentos de monitoramento 
deverão ser formulados de acordo com o item '7' do edital, 
que define as exigências mínimas de compatibilidade e segurança."
```

**Por que Confiança é Baixa (0.35)?**
1. ✗ Referência a "item 7" é genérica
2. ✗ Não fica claro qual funcionalidade afeta
3. ✗ Poderia ser: specs, processo, cronograma, etc.
4. ✓ Menção a "especificações técnicas" encontrada
5. ✓ Relação com "compatibilidade" identificada

---

## 🎯 REVISÃO MANUAL — Passo a Passo

### **Clique no Item**
```
Abre detalhe completo com:
- Texto original
- Motivos da baixa confiança
- Campo para sua decisão
```

### **Passo 1: Entender o Contexto**

**Leia o edital completo (procure "Item 7"):**

Você encontrará algo como:
```
Item 7 — ESPECIFICAÇÕES TÉCNICAS

7.1 Câmeras de Monitoramento
    - Protocolo: ONVIF obrigatório
    - Resolução mínima: 2MP
    - Compressão: H.264 ou H.265
    - Certificação: INMETRO
    - Suporte a PoE (Power over Ethernet)

7.2 Switches e Infraestrutura
    - Switches gerenciados PoE+
    - Redundância de conexão

7.3 Software de Visualização
    - Compatibilidade com NTCIP 1202
    - Suporte a alarmes em tempo real
```

### **Passo 2: Verificar se AxCross Atende**

No Painel do AxCross, navegue até:

```
Menu → AxCross → Equipamentos → Cadastro
```

**Você verá tela assim:**

```
┌─────────────────────────────────────────────┐
│ ➕ Novo Equipamento                         │
├─────────────────────────────────────────────┤
│                                             │
│ Tipo: [Câmera IP ▼]                        │
│                                             │
│ Modelo: [_________________]                 │
│                                             │
│ Protocolo:                                  │
│   ☑ ONVIF                                  │
│   ☐ RTSP                                   │
│   ☐ Outro                                  │
│                                             │
│ Certificação:                               │
│   ☑ INMETRO                                │
│   ☐ Não certificado                        │
│                                             │
│ Validação Automática: ✅ COMPATÍVEL        │
│                                             │
│ [✏️ Editar] [✅ Confirmar] [❌ Descartar]   │
└─────────────────────────────────────────────┘
```

**Conclusão:** ✅ AxCross implementa validação de specs!

---

## ✏️ PREENCHER REVISÃO

### **No Painel de Revisão, escolha:**

```
Resultado:
  ⦿ ✅ Atendido
  ○ ⚠️ Parcial
  ○ ❌ Não Atendido
  ○ ❓ Dúvida
```

**Você clica em:** ✅ Atendido

---

### **Adicionar Observações:**

```
Campo: "Observações"

Texto a escrever:
─────────────────────────────────────────────
Item 7 do edital lista especificações técnicas 
obrigatórias (ONVIF, INMETRO, etc.).

AxCross valida AUTOMATICAMENTE no módulo:
📍 Equipamentos → Cadastro → Validação Técnica

Campos validados:
  ✅ Protocolo ONVIF
  ✅ Certificação INMETRO
  ✅ Compressão H.264/H.265
  ✅ Suporte PoE

Localização: Painel → AxCross → Equipamentos
─────────────────────────────────────────────
```

---

### **Adicionar Documentação (Opcional)**

**Anexar arquivo:** `docs/axcross/validacao-especificacoes-tecnicas.md`

```markdown
# Validação de Especificações Técnicas — Item 7 do Edital

## Como o AxCross Atende

1. **Câmeras de Monitoramento**
   - Tela: Equipamentos → Cadastro
   - Validação: Protocolo ONVIF + Certificação INMETRO
   - Campo: `protocolo` (dropdown) e `certificacao` (checkbox)
   - Status: ✅ IMPLEMENTADO

2. **Switches e Infraestrutura**
   - Tela: Infraestrutura → Configurar Rede
   - Validação: PoE+ automático
   - Status: ✅ IMPLEMENTADO

3. **Software NTCIP**
   - API: `/api/axcross/ntcip-compatibility`
   - Status: ✅ IMPLEMENTADO

## Print de Prova
[screenshot-validacao-tecnica.png]

## Versão
AxCross v2.5+ (atende Item 7 completamente)
```

---

### **Adicionar Print de Prova**

Tire screenshot mostrando:

**Exemplo 1: Tela de Equipamentos com Validação**
```
[Screenshot mostrando campos preenchidos]
Nome: "Câmera Monitora Cruzamento Centro"
Protocolo: ✅ ONVIF
Certificação: ✅ INMETRO
Status: ✅ COMPATÍVEL
```

**Exemplo 2: Relatório de Validação**
```
[Screenshot mostrando]
"Equipamentos validados contra Item 7: 12/12 ✅"
```

---

## 💾 SALVAR REVISÃO

### **Campos Preenchidos**

```
Resultado:              ✅ Atendido
Observações:            [preenchido]
Documentação:           docs/axcross/...md
Print de Prova:         screenshot.png
Revisor:                seu-email@empresa.com
Data:                   2026-05-13 14:30:00
```

### **Clique em: 📝 Revisar**

---

## ✅ RESULTADO

### **Sistema Atualiza**

**Antes:**
```json
{
  "status": "PENDENTE",
  "confianca": 0.35,
  "nivelConfianca": "MUITO_BAIXA"
}
```

**Depois:**
```json
{
  "status": "REVISADO",
  "confianca": 0.35,
  "nivelConfianca": "MUITO_BAIXA",
  "resultadoRevisao": "atendido",
  "ondeCitado": "AxCross → Equipamentos → Validação Técnica",
  "documentacao": "docs/axcross/validacao-especificacoes-tecnicas.md",
  "revisadoPor": "seu-email@empresa.com",
  "dataRevisao": "2026-05-13T14:30:00Z"
}
```

### **Relatório Atualizado**

**Conformidade para AxCross:**
```
De: 50% (sem decisão manual)
Para: 57% (com decisão documentada)

Item 7: ✅ ATENDIDO
Revisor: seu-email@empresa.com
Data: 2026-05-13
Evidência: Tela de Equipamentos + Documentação
```

---

## 📊 VALIDAÇÃO FINAL

### **Checklist de Conformidade**

```
✅ Item 7 (Especificações Técnicas)
├─ ✅ ONVIF — validado em Equipamentos
├─ ✅ INMETRO — campo obrigatório
├─ ✅ H.264/H.265 — suportado
├─ ✅ PoE — requisito incluído
├─ ✅ Documentação — adicionada
├─ ✅ Print de Prova — anexado
└─ ✅ Decisão — Registrada e Rastreável

Status Final: ✅ CONFORMIDADE COMPROVADA
```

---

## 🎯 RESUMO — Como Demonstrar

| Etapa | Ação | Resultado |
|-------|------|-----------|
| 1 | Abrir Painel → Fila de Revisão | Item visível |
| 2 | Filtrar por AxCross → Clicar item | Detalhe abre |
| 3 | Ler contexto do edital | Entender requisito |
| 4 | Verificar AxCross → Equipamentos | Confirmar que atende |
| 5 | Preencher: ✅ Atendido | Decisão registrada |
| 6 | Adicionar observações + docs | Contexto documentado |
| 7 | Anexar print de prova | Evidência visual |
| 8 | Clique: Revisar | Status → REVISADO |
| 9 | Relatório atualizado | Conformidade comprovada |

---

## 🚀 RESULTADO PRÁTICO

**Quando você termina:**

✅ Item sai da fila de PENDENTE  
✅ Conformidade sobe de 50% → 57%  
✅ Decisão fica rastreável (quem, quando, por quê)  
✅ Documentação centralizada (onde atende)  
✅ Print de prova salvo (como validar)  
✅ Próximo auditor vê tudo pronto  

---

**Isso é o processo completo e demonstrável!** 🎉

Agora você sabe exatamente como revisar, documentar e validar qualquer requisito no AxCross.
