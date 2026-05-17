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
