# 📱 Guia Operacional Rápido - Configurar Medição no AxHub

**Para:** Operadores e Usuários Finais  
**Objetivo:** Passo a passo simplificado para configurar um equipamento na medição  
**Tempo estimado:** 15-20 minutos por equipamento

---

## 🎯 Quando Usar Este Guia

Use este guia quando:
- ✅ Equipamento novo precisa entrar na medição
- ✅ Relatório de medição mostra valores zerados (R$ 0,00)
- ✅ Equipamento não aparece no relatório de medição
- ✅ Erro: "Equipamento sem recursos cadastrados"

---

## 📋 Checklist Rápido (Copie e Cole)

```
EQUIPAMENTO: _______________________  DATA: ___/___/______

[ ] PASSO 1: Equipamento cadastrado e ativo
[ ] PASSO 2: Faixas cadastradas (Faixa 1, Faixa 2)
[ ] PASSO 3: Contrato criado e ativo
[ ] PASSO 4: Equipamento vinculado ao contrato
[ ] PASSO 5: Recurso criado para Faixa 1
[ ] PASSO 6: Recurso criado para Faixa 2
[ ] PASSO 7: Valores preenchidos (Valor Previsto e BDI)
[ ] PASSO 8: Recursos ativados
[ ] PASSO 9: Relatório gerado com sucesso
[ ] PASSO 10: Valores corretos no relatório

RESPONSÁVEL: ________________________
OBSERVAÇÕES: ________________________________________
```

---

## 🔢 Passo a Passo Operacional

### PASSO 1: Verificar Equipamento

**Menu:** Cadastros → Equipamentos

**Ações:**
1. Busque o equipamento pelo código (Ex: GYN1R801)
2. Verifique se está **ATIVO** (bolinha verde)
3. Anote quantas faixas ele tem (normalmente 2)

**✅ OK se:**
- Equipamento aparece na lista
- Status = Ativo
- Tem faixas cadastradas (1, 2, etc.)

**❌ Problema:**
- Equipamento não existe → Criar equipamento primeiro
- Status = Inativo → Ativar equipamento
- Sem faixas → Cadastrar faixas

---

### PASSO 2: Verificar Contrato

**Menu:** Medição → Contratos

**Ações:**
1. Busque o contrato pelo número ou órgão (Ex: CT-2026-001, DETRAN/GO)
2. Verifique se está **ATIVO**
3. Verifique a **vigência** (deve cobrir o mês da medição)

**✅ OK se:**
- Contrato aparece na lista
- Status = Ativo
- DataInicio ≤ Mês da medição ≤ DataFim

**❌ Problema:**
- Contrato não existe → Criar contrato primeiro
- Status = Inativo → Ativar contrato
- Vigência expirada → Ajustar datas ou criar novo contrato

---

### PASSO 3: Vincular Equipamento ao Contrato

**Menu:** Medição → Contratos → [Selecionar Contrato] → Editar

**Ações:**
1. Clique em "Editar" no contrato
2. Vá na aba "Equipamentos"
3. Adicione o equipamento (Ex: GYN1R801)
4. Salve

**✅ OK se:**
- Equipamento aparece na lista de equipamentos do contrato

**❌ Problema:**
- Equipamento não pode ser adicionado → Verificar se equipamento está ativo

---

### PASSO 4: Criar Recursos (⚠️ MAIS IMPORTANTE)

> **⚠️ ATENÇÃO:** Este é o passo mais importante! Você precisa criar **1 recurso para CADA faixa** do equipamento.

**Menu:** Medição → Recursos → Novo Recurso

#### Criar Recurso para Faixa 1

**Preencha os campos:**

| Campo | O que preencher | Exemplo |
|-------|-----------------|---------|
| **Descrição** | Nome descritivo | "Radar GYN1R801 - Faixa 1" |
| **Tipo** | Selecione | Equipamento |
| **Contrato** | ⚠️ Selecione o contrato | CT-2026-001 |
| **Equipamento** | ⚠️ Selecione o equipamento | GYN1R801 |
| **Faixa** | ⚠️ Selecione | 1 |
| **Valor Previsto** | ⚠️ Valor mensal em R$ | 15000.00 |
| **BDI (%)** | ⚠️ Percentual | 25.00 |
| **Data Início** | Início da vigência | 01/01/2026 |
| **Data Fim** | Fim da vigência | 31/12/2026 |
| **Status** | ⚠️ Marque | Ativo |

**Clique em:** Salvar

#### Criar Recurso para Faixa 2

**Repita o processo acima:**
- Mesmo equipamento: GYN1R801
- Mesmos valores: R$ 15.000,00 e 25%
- **Faixa: 2** (diferente!)
- Descrição: "Radar GYN1R801 - Faixa 2"

**Clique em:** Salvar

**✅ OK se:**
- 2 recursos criados (1 para cada faixa)
- Ambos com Status = Ativo
- Valores > 0
- Contratos e equipamentos vinculados

**❌ Problema:**
- Esqueceu de criar para uma das faixas → Valores zerados no relatório!
- Valor Previsto = 0 → Valores zerados no relatório!
- Status = Inativo → Não entra no cálculo!

---

### PASSO 5: Validar Configuração

**Menu:** Medição → Recursos

**Ações:**
1. Filtre pelo equipamento (Ex: GYN1R801)
2. Verifique se aparecem **2 recursos** (1 por faixa)
3. Confirme se ambos estão **ATIVOS**

**✅ Lista deve mostrar:**
```
Descrição                    | Contrato     | Valor Previsto | BDI   | Status
----------------------------|--------------|----------------|-------|--------
Radar GYN1R801 - Faixa 1    | CT-2026-001  | R$ 15.000,00   | 25,00 | Ativo
Radar GYN1R801 - Faixa 2    | CT-2026-001  | R$ 15.000,00   | 25,00 | Ativo
```

**❌ Problema:**
- Aparece só 1 recurso → Falta criar para a outra faixa!
- Aparece 0 recursos → Nada foi cadastrado!
- Valores = R$ 0,00 → Edite e preencha os valores!

---

### PASSO 6: Gerar Relatório de Medição

**Menu:** Medição → Nova Medição → Relatório de Medição de Equipamento

**Ou acesse direto:** `https://[sistema].axhub.axion.ws/medicao/relatoriomedicaoequipamento`

**Ações:**
1. **Contrato:** Selecione o contrato (Ex: CT-2026-001)
2. **Período:** Selecione o mês (Ex: Maio/2026)
3. **Equipamentos:** Marque o equipamento (Ex: GYN1R801)
4. Clique em: **Gerar Relatório** ou **Buscar**

---

### PASSO 7: Validar Relatório

**O relatório deve mostrar:**

| Equipamento | Faixa | Veículos | Índice | Valor Previsto | BDI % | Total |
|-------------|-------|----------|--------|----------------|-------|-------|
| GYN1R801 | 1 | 584740 | 100,00% | R$ 15.000,00 | 25,00 | R$ 18.750,00 |
| GYN1R801 | 2 | 609222 | 100,00% | R$ 15.000,00 | 25,00 | R$ 18.750,00 |

**✅ Relatório OK se:**
- Valor Previsto > R$ 0,00
- BDI > 0,00%
- Total > R$ 0,00
- Valores fazem sentido (Total ≈ Valor × 1,25)

**❌ Relatório COM PROBLEMA:**
```
Equipamento | Faixa | Valor Previsto | BDI % | Total
------------|-------|----------------|-------|-------
GYN1R801    | 1     | R$ 0,00        | 0,00  | R$ 0,00
GYN1R801    | 2     | R$ 0,00        | 0,00  | R$ 0,00
```

**Se aparecer valores zerados:**
- Volte no PASSO 5 e verifique os recursos
- Certifique-se que criou 1 recurso para CADA faixa
- Certifique-se que os valores estão preenchidos

---

## 🔧 Problemas Comuns e Soluções Rápidas

### 🔴 Problema: Valores Zerados no Relatório

**Causa:** Recursos não cadastrados ou sem valores

**Solução:**
1. Menu: Medição → Recursos
2. Filtre pelo equipamento
3. Verifique se tem recursos cadastrados
4. Se não tem → Siga PASSO 4 acima
5. Se tem mas valores = 0 → Edite e preencha

---

### 🔴 Problema: Equipamento Não Aparece no Relatório

**Causa:** Equipamento não vinculado ao contrato

**Solução:**
1. Menu: Medição → Contratos
2. Edite o contrato
3. Aba "Equipamentos"
4. Adicione o equipamento
5. Salve

---

### 🔴 Problema: "Sem Dados para o Período"

**Causa:** Equipamento não operou no período selecionado

**Solução:**
1. Verifique se o equipamento está funcionando
2. Verifique se há passagens registradas
3. Tente outro período que tem passagens

---

### 🔴 Problema: Índice de Operação Baixo

**Causa:** Muitas interrupções registradas

**Solução:**
1. Menu: Medição → Interrupções
2. Verifique interrupções do equipamento no período
3. Corrija interrupções incorretas
4. Gere o relatório novamente

---

## 📊 Exemplo Prático: Configurar GYN1R801

### Situação Inicial
- Equipamento: GYN1R801
- Faixas: 1 e 2
- Contrato: CT-2026-001 (DETRAN/GO)
- Período: Maio/2026
- Problema: Valores zerados no relatório

### Passo a Passo da Solução

**1. Verificar Equipamento**
- Menu: Cadastros → Equipamentos
- Buscar: GYN1R801
- Status: Ativo ✅
- Faixas: 2 (Faixa 1 e Faixa 2) ✅

**2. Verificar Contrato**
- Menu: Medição → Contratos
- Contrato: CT-2026-001
- Status: Ativo ✅
- Vigência: 01/01/2026 a 31/12/2026 ✅

**3. Vincular ao Contrato**
- Menu: Medição → Contratos → Editar CT-2026-001
- Aba: Equipamentos
- Adicionar: GYN1R801 ✅
- Salvar ✅

**4. Criar Recursos**

**Recurso 1:**
```
Descrição: Radar GYN1R801 - Faixa 1
Tipo: Equipamento
Contrato: CT-2026-001
Equipamento: GYN1R801
Faixa: 1
Valor Previsto: 15000.00
BDI: 25.00
Data Início: 01/01/2026
Data Fim: 31/12/2026
Status: Ativo
```
Salvar ✅

**Recurso 2:**
```
Descrição: Radar GYN1R801 - Faixa 2
Tipo: Equipamento
Contrato: CT-2026-001
Equipamento: GYN1R801
Faixa: 2
Valor Previsto: 15000.00
BDI: 25.00
Data Início: 01/01/2026
Data Fim: 31/12/2026
Status: Ativo
```
Salvar ✅

**5. Validar Recursos**
- Menu: Medição → Recursos
- Filtrar: GYN1R801
- Resultado: 2 recursos aparecendo ✅
- Ambos ativos ✅
- Valores preenchidos ✅

**6. Gerar Relatório**
- Menu: Medição → Nova Medição
- Contrato: CT-2026-001
- Período: Maio/2026
- Equipamento: GYN1R801
- Gerar Relatório ✅

**7. Resultado Esperado**
```
Equipamento | Faixa | Valor Previsto | BDI % | Total
------------|-------|----------------|-------|-------------
GYN1R801    | 1     | R$ 15.000,00   | 25,00 | R$ 18.750,00
GYN1R801    | 2     | R$ 15.000,00   | 25,00 | R$ 18.750,00
```
✅ **SUCESSO!** Valores aparecem corretamente!

---

## 🎓 Dicas Importantes

### ✅ Sempre Lembre:

1. **1 Recurso por Faixa**
   - Equipamento com 2 faixas = 2 recursos
   - Equipamento com 3 faixas = 3 recursos
   - Nunca esqueça nenhuma faixa!

2. **Valores Obrigatórios**
   - Valor Previsto > 0
   - BDI > 0
   - Status = Ativo

3. **Vigência Correta**
   - Data Início antes ou igual ao mês da medição
   - Data Fim depois ou igual ao mês da medição

4. **Vínculos Corretos**
   - Recurso vinculado ao Contrato
   - Recurso vinculado ao Equipamento
   - Recurso vinculado à Faixa específica

---

## 📞 Precisa de Ajuda?

### Para Suporte Técnico, informe:

1. **Equipamento:** Código (Ex: GYN1R801)
2. **Contrato:** Número (Ex: CT-2026-001)
3. **Período:** Mês/Ano (Ex: Maio/2026)
4. **Problema:** Descreva o que está errado
5. **Prints:** Tire print do relatório zerado

### Arquivos Técnicos (Para TI)

Se o problema persistir, peça ao TI para executar:
- `SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql`
- `VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql`

Esses scripts identificam automaticamente o problema no banco de dados.

---

## 📚 Glossário Rápido

| Termo | Significado |
|-------|-------------|
| **Faixa** | Pista de tráfego monitorada (Faixa 1, Faixa 2, etc.) |
| **Recurso** | Configuração financeira por faixa (valor mensal) |
| **Valor Previsto** | Valor mensal em R$ que o equipamento deve receber |
| **BDI** | Bonificação e Despesas Indiretas (percentual sobre o valor) |
| **Índice de Operação** | % de disponibilidade do equipamento (0-100%) |
| **Interrupção** | Período em que o equipamento ficou parado |
| **Vigência** | Período de validade (Data Início até Data Fim) |
| **Medição** | Relatório mensal com valores calculados |

---

## ✅ Resumo dos Menus

| Para fazer | Acesse |
|------------|--------|
| Ver equipamentos | Cadastros → Equipamentos |
| Ver contratos | Medição → Contratos |
| Criar/editar recursos | Medição → Recursos |
| Ver interrupções | Medição → Interrupções |
| Gerar relatório | Medição → Nova Medição |
| Ver medições antigas | Medição → Medições Finalizadas |

---

**Criado em:** 18/06/2026  
**Versão:** 1.0 (Operacional)  
**Baseado em:** Análise IPEMPE (funcionando) vs Goiânia (corrigido)
