# GUIAS-PRATICOS-OPERACIONAIS

**Data de Consolidação:** 2026-06-20 18:19
**Arquivos Consolidados:** 2

---

## ÍNDICE

1. GUIA-PRATICO-REVISAR-AXCROSS.md
2. GUIA-USO-OCR-CONFIANCA.md

---

# DOCUMENTO 1: GUIA-PRATICO-REVISAR-AXCROSS.md

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


---

# DOCUMENTO 2: GUIA-USO-OCR-CONFIANCA.md

# 🚀 GUIA DE USO — Pipeline OCR + Confiança

## Checklist — Tudo Pronto

- [x] **8 arquivos** criados e testados ✅
- [x] **Sintaxe JavaScript** validada ✅
- [x] **Rotas REST** integradas ✅
- [x] **Componente React** adicionado ✅
- [x] **Documentação** completa ✅

---

## 1. Como Iniciar o Sistema

### 1.1 Abrir Terminal e Executar Inicialização

```bash
# Na raiz do workspace (c:\Users\Santiago\Axiondocs\Axion.Docs)
.\iniciar.ps1
```

**Resultado esperado:**

```text
✅ axion-ia-api running on port 3100
✅ axion-ia-panel running on port 3001  
✅ AxHub.Docs running on port 3010
✅ AxTon.Docs running on port 3011
✅ AxCross.Docs running on port 3012
```

### 1.2 Abrir Painéis

- **Painel Principal:** [http://localhost:3001](http://localhost:3001)
- **API:** [http://localhost:3100](http://localhost:3100)
- **Docs AxHub:** [http://localhost:3010/AxHub.Docs](http://localhost:3010/AxHub.Docs)

---

## 2. Usar o Pipeline

### 2.1 Análise Simples (Compatível com Sistema Existente)

```bash
curl -X POST http://localhost:3100/api/conformidade/gerar \
  -H "Content-Type: application/json" \
  -d '{
    "produto": "axhub",
    "tituloEdital": "Edital 123/2025",
    "textoEdital": "[copiar/colar texto do edital aqui]"
  }'
```

**Retorno:**

```json
{
  "relatorio": {
    "veredicto": "APTO",
    "percentualConformidade": 85,
    "itens": [...]
  }
}
```

### 2.2 Análise COMPLETA (Com OCR + Confiança + Fila)

```bash
curl -X POST http://localhost:3100/api/conformidade/gerar \
  -H "Content-Type: application/json" \
  -d '{
    "produto": "axhub",
    "tituloEdital": "Edital 123/2025",
    "textoEdital": "[texto do edital]",
    "comConfianca": true,
    "comTabelas": true,
    "comFilaRevisao": true,
    "limiarAutoResolve": 0.8
  }'
```

**Retorno Estendido:**
```json
{
  "relatorio": {
    "veredicto": "APTO",
    "percentualConformidade": 85,
    "confiancaAgregada": 0.76,
    "metadadosTabelas": {
      "total": 3,
      "tabelas": [...]
    },
    "itens": [
      {
        "requisito": "...",
        "status": "atendido",
        "confianca": {
          "confianca": 0.88,
          "nivel": "MUITO_ALTA",
          "motivos": [...]
        }
      }
    ]
  },
  "stats": {
    "atendidos": 32,
    "parciais": 8,
    "naoAtendidos": 2,
    "tabelas_encontradas": 3,
    "itens_para_revisao": 5
  }
}
```

### 2.3 Acessar Fila de Revisão (Painel)

1. Abrir: [http://localhost:3001](http://localhost:3001)
2. Clique em menu: **🔍 Confiança & Revisão**
3. Verá itens pendentes com score baixo/médio
4. Para cada item:
   - ✅ **Confirmar** — marca como atendido
   - ⚠️ **Parcial** — marca como parcialmente atendido
   - ❌ **Rejeitar** — marca como não atendido
5. Clique **Revisar** para salvar

### 2.4 API de Fila de Revisão

#### Listar itens pendentes

```bash
GET http://localhost:3100/api/confianca/fila?produto=axhub&status=PENDENTE
```

#### Revisar um item

```bash
POST http://localhost:3100/api/confianca/{id}/revisar
{
  "resultado_revisao": "atendido",
  "observacoes": "Confirmado em documentação"
}
```

#### Obter estatísticas

```bash
GET http://localhost:3100/api/confianca/estatisticas
```

#### Exportar para CSV

```bash
GET http://localhost:3100/api/confianca/exportar/csv
```

---

## 3. Validação de Implementação

### 3.1 Verificar Arquivos

```bash
# Na raiz do workspace
node validate-pipeline.js
```

**Resultado esperado:**

```text
✅ Implementação Completa!
• 8 novos arquivos
• 4 novos serviços
• 7 novas rotas REST
• 1 novo componente React
```

### 3.2 Verificar Sintaxe

```bash
node -c "axion-ia-api/src/services/ocr-processor.js"
node -c "axion-ia-api/src/services/table-extractor.js"
node -c "axion-ia-api/src/services/confidence-scorer.js"
node -c "axion-ia-api/src/services/confidence-queue.js"
node -c "axion-ia-api/src/models/confianca-revisao.model.js"
node -c "axion-ia-api/src/confidence-controller.js"
node -c "axion-ia-api/src/services/conformidade-enhanced.js"
```

**Resultado esperado:** Sem erros (exit code 0)

---

## 4. Fluxo Completo — Passo a Passo

```texttext
📄 Edital (PDF/TXT)
    ↓
🔍 OCR Inteligente
    ├─ PDF nativo? Extrai texto
    ├─ PDF escaneado? GPT-4o Vision
    └─ Retorna: texto + qualidade
    ↓
📊 Extração de Tabelas
    ├─ Detecta padrões
    └─ Retorna: tabelas em JSON
    ↓
✅ Análise de Conformidade
    ├─ Requisitos IA
    ├─ Matching com documentação
    └─ Status: atendido/parcial/não_atendido
    ↓
📈 Cálculo de Confiança
    ├─ Score 0-1 por requisito
    ├─ Classificação: MUITO_BAIXA...MUITO_ALTA
    └─ Itens score < 0.6 → Fila
    ↓
👤 Revisão Humana
    ├─ Painel mostra itens incertos
    ├─ Usuário confirma/corrige
    └─ Resultado final salvo
    ↓
📋 Relatório Final
    └─ Veredicto + Confiança + Tabelas
```

---

## 5. Exemplo Prático — Testar Agora

### 5.1 Criar Edital de Teste

Arquivo: `edital-teste.txt`

```text
EDITAL PARA FORNECIMENTO DE RADARES DE VELOCIDADE

1. REQUISITOS TÉCNICOS
   - Radar tipo Doppler
   - Resolução: 1 km/h
   - Alcance: até 400m
   - Comunicação: NTCIP via Ethernet
   - Certificação INMETRO

2. ESPECIFICAÇÕES
   Equipamento          | Quantidade | Preço Unit.
   ─────────────────────────────────────────────
   Radar Doppler       | 15         | R$ 45.000
   Câmera IP ONVIF     | 30         | R$ 8.500
   Switch PoE          | 4          | R$ 12.000

3. CONFORMIDADE
   - Projeto deve ser implantado em 90 dias
   - Incluir documentação técnica em PDF
```

### 5.2 Executar Análise

```bash
curl -X POST http://localhost:3100/api/conformidade/gerar \
  -H "Content-Type: application/json" \
  -d '{
    "produto": "axhub",
    "tituloEdital": "Edital Teste - Radares",
    "textoEdital": "[copiar conteúdo acima]",
    "comConfianca": true,
    "comTabelas": true,
    "comFilaRevisao": true
  }'
```

### 5.3 Ver Fila

```bash
curl -X GET http://localhost:3100/api/confianca/fila
```

---

## 6. Troubleshooting

### Problema: "Connection refused port 3100"

**Solução:**

```bash
cd axion-ia-api
node src/app.js
```

### Problema: "MongoDB connection error"

**Verificar:**

- MongoDB está rodando? `mongod`
- Variável `MONGO_URI` está definida?
- Banco de dados `axion_ia` existe?

### Problema: "GPT-4o Vision falha"

**Verificar:**
- Variável `OPENAI_API_KEY` está definida?
- Chave é válida e tem créditos?
- OpenAI API está acessível?

### Problema: "Fila vazia mas há itens com score baixo"

**Verificar:**
- Parâmetro `comFilaRevisao: true` foi enviado?
- Limiar `limiarAutoResolve` está < score dos itens?
- MongoDB coleção `confianca_revisao` existe?

---

## 7. Referência Rápida — Arquivos Chave

| Arquivo | Função |
| --- | --- |
| --- | --- |
| `ocr-processor.js` | OCR automático com fallback GPT-4o Vision |
| `table-extractor.js` | Extração estruturada de tabelas |
| `confidence-scorer.js` | Cálculo de confiança 0-1 |
| `confidence-queue.js` | Gerenciador MongoDB da fila |
| `confianca-revisao.model.js` | Schema Mongoose para persistência |
| `confidence-controller.js` | REST endpoints da fila |
| `conformidade-enhanced.js` | Orquestrador do pipeline |
| `ConfidencaRevisao.jsx` | Interface React de revisão |
| `routes.js` | Rotas REST registradas |
| `App.jsx` | Navegação e routing React |

---

## 8. Próximos Passos (Opcional)

- [ ] Testar com PDF escaneado real (90.021_edital ou similar)
- [ ] Integrar base de dados de equipamentos (INMETRO, CONTRAN)
- [ ] Adicionar análise multi-produto simultânea
- [ ] Criar dashboard BI de histórico ganho/perda
- [ ] Implementar auto-geração de proposta técnica
- [ ] Configurar alertas WhatsApp para novos editais relevantes

---

**Versão:** 1.0 | **Data:** 13/05/2026 | **Status:** ✅ PRONTO PARA USO


---


