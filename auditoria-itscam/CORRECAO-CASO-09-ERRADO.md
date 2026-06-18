# CORREÇÃO CRÍTICA — Caso 09 (OCR Incorreto)

## 📋 Problema Identificado

O **Caso 09** foi criado **INCORRETAMENTE** alterando parâmetros do **OCR (Jidosha)** quando deveria alterar apenas o **Classifier**.

### ❌ O Que o Caso 09 Fazia (ERRADO):
```javascript
// INCORRETO — alterava OCR
OCR.processingQueue: 4 → 1
OCR.processingThreads: 4 → 1
```

### ✅ Configuração CORRETA:
- **OCR (Jidosha)**: `processingQueue=4, processingThreads=4` ✅
- **Classifier**: `processingQueue=1, processingThreads=1` ✅

## 🔄 Ações Tomadas

### 1. ✅ Removido Caso 09 do corrigir-grupo.mjs
```javascript
// ANTES: const casos = ['04', '05', '06', '07', '08', '09'];
// AGORA: const casos = ['04', '05', '06', '07', '08'];
```

### 2. ✅ Caso 09 NÃO existe em corrigir.mjs
- Arquivo contém apenas casos 01-08
- Caso 09 não está presente

### 3. ✅ Revertidos 23 Equipamentos
Executado: `node auditoria-itscam/reverter-ocr.mjs`

**Equipamentos Revertidos (OCR → 4/4):**
- GOEC6O002 - Faixa 1 ✅
- GOEC6O002 - Faixa 2 ✅
- GOEC6O003 - Faixa 1 ✅
- GOEC6O003 - Faixa 2 ✅
- GOEC6O004 - Faixa 1 ✅
- GOEC6O004 - Faixa 2 ✅
- GOEC6O005 - Faixa 1 ✅
- GOEC6O005 - Faixa 2 ✅
- GOEC6O006 - Faixa 1 ✅
- GOEC6O006 - Faixa 2 ✅
- GOEC6O007 - Faixa 1 ✅
- GOEC6O007 - Faixa 2 ✅
- GOEC6O008 - Faixa 2 ✅
- GOEC6O009 - Faixa 1 ✅
- GOEC6O009 - Faixa 2 ✅
- GOEC6O010 - Faixa 1 ✅
- GOEC6O010 - Faixa 2 ✅
- GOEC6O011 - Faixa 1 ✅
- GOEC6O011 - Faixa 2 ✅
- GOEC6O013 - Faixa 1 ✅
- GOEC6O013 - Faixa 2 ✅
- GOEC6O028 - Faixa 1 ✅
- GOEC6O052 - Faixa 2 ✅

### 4. ⏳ 39 Equipamentos Offline
Estes equipamentos foram afetados pelo Caso 09 mas estavam offline durante a reversão:
- GOEC6O018-F2, GOEC6O020-F1/F2, GOEC6O021-F1, GOEC6O022-F1/F2
- GOEC6O029-F1/F2, GOEC6O033-F1/F2, GOEC6O036-F1
- GOEC6O040-F1/F2, GOEC6O043-F1/F2, GOEC6O045-F1/F2, GOEC6O046-F1/F2
- GOEC6O048-F1/F2, GOEC6O049-F1/F2, GOEC6O050-F1/F2, GOEC6O051-F1/F2
- GOEC6O052-F1, GOEC6O053-F1/F2, GOEC6O054-F1
- GOEC6O055-F1/F2, GOEC6O056-F1/F2, GOEC6O057-F1/F2, GOEC6O059-F1/F2

**⚠️ AÇÃO NECESSÁRIA:** Quando esses equipamentos voltarem online, executar novamente:
```bash
node auditoria-itscam/reverter-ocr.mjs
```

## 📊 Resumo Final

| Item | Status |
|------|--------|
| Caso 09 removido de corrigir-grupo.mjs | ✅ |
| Caso 09 não existe em corrigir.mjs | ✅ |
| Equipamentos revertidos (online) | ✅ 23/62 |
| Equipamentos aguardando reversão | ⏳ 39/62 |

## 🎯 Casos Válidos Restantes

**Caso 04: Classifier → queue=1, threads=1** ← ESTE É O CORRETO
- Corrige Classifier.processingQueue e Classifier.processingThreads
- Afeta 6 equipamentos específicos

**Caso 05-08:** Outros ajustes (Level, maxPlates, Snapshot, Gateway)

## 📝 Lição Aprendida

**SEMPRE VERIFICAR QUAL MÓDULO CORRIGIR:**
- 🟢 **Jidosha (OCR)**: deixar em 4/4
- 🟡 **Classifier**: corrigir para 1/1
