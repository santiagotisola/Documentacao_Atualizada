# 🔍 Guia de Validação de Contratos por Faixa - Medição Goiânia

## 📋 Objetivo
Validar se cada faixa dos equipamentos possui contrato vinculado corretamente para que os valores apareçam no Relatório de Medição.

## 🎯 Equipamentos Analisados
- **GYN1R801** (Problemático - valores zerados)
- **GYN1R803** (Referência - funcionando)
- **GYN1R804** (Referência - funcionando)
- **GYN1R805** (Referência - funcionando)

## 📂 Arquivo SQL
`VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql`

---

## 🔎 Query 1: Validação Completa de Contratos por Faixa

### O que faz
Lista cada faixa de cada equipamento mostrando:
- Se há contrato vinculado ao equipamento
- Status do contrato (Ativo/Inativo)
- Vigência do contrato
- Validação específica para Maio/2026

### Como interpretar os resultados

| Validação Maio/2026 | Significado | Ação Necessária |
|---------------------|-------------|-----------------|
| ✅ CONTRATO VÁLIDO | Contrato ativo e dentro da vigência | Nenhuma |
| ❌ SEM CONTRATO | Equipamento não possui contrato vinculado | Vincular contrato ao equipamento |
| ⚠️ CONTRATO INATIVO | Contrato existe mas está desativado | Ativar contrato em Contratos |
| ⚠️ CONTRATO AINDA NÃO INICIADO | DataInicio posterior a maio/2026 | Ajustar DataInicio do contrato |
| ⚠️ CONTRATO EXPIRADO | DataFim anterior a maio/2026 | Ajustar DataFim do contrato |
| ❌ EQUIPAMENTO NÃO VINCULADO | Sem registro em TBContratosEquipamentos | Vincular em Contratos → Equipamentos |

### Exemplo de resultado esperado

**GYN1R803 (Funcionando):**
```
Equipamento | Faixa | Num. Contrato | Status | Validação Maio/2026
------------|-------|---------------|--------|--------------------
GYN1R803    | 1     | CT-2026-001   | 1      | ✅ CONTRATO VÁLIDO
GYN1R803    | 2     | CT-2026-001   | 1      | ✅ CONTRATO VÁLIDO
```

**GYN1R801 (Problemático - Cenário A):**
```
Equipamento | Faixa | Num. Contrato | Status | Validação Maio/2026
------------|-------|---------------|--------|--------------------
GYN1R801    | 1     | NULL          | NULL   | ❌ SEM CONTRATO
GYN1R801    | 2     | NULL          | NULL   | ❌ SEM CONTRATO
```

**GYN1R801 (Problemático - Cenário B):**
```
Equipamento | Faixa | Num. Contrato | Status | Validação Maio/2026
------------|-------|---------------|--------|--------------------
GYN1R801    | 1     | CT-2026-001   | 0      | ⚠️ CONTRATO INATIVO
GYN1R801    | 2     | CT-2026-001   | 0      | ⚠️ CONTRATO INATIVO
```

---

## 🔎 Query 2: Recursos por Faixa com Validação de Contrato

### O que faz
Mostra se cada faixa possui **recursos cadastrados** E se esses recursos estão vinculados a um contrato válido.

### Diferença entre Query 1 e Query 2
- **Query 1**: Valida vínculo Equipamento ↔ Contrato (TBContratosEquipamentos)
- **Query 2**: Valida vínculo Recurso ↔ Contrato (TBRecursos.ContratoId)

**IMPORTANTE**: Para o valor aparecer na medição, é necessário que o **RECURSO** tenha contrato vinculado, não apenas o equipamento!

### Como interpretar os resultados

| Diagnóstico | Causa Raiz | Solução |
|-------------|------------|---------|
| 🔴 RECURSO NÃO CADASTRADO | Faixa não possui registro em TBRecursos | Cadastrar recurso via Medição → Recursos |
| 🔴 RECURSO SEM CONTRATO VINCULADO | TBRecursos.ContratoId é NULL | Editar recurso e vincular ao contrato |
| 🔴 CONTRATO NÃO ENCONTRADO | ContratoId aponta para contrato inexistente | Corrigir ContratoId do recurso |
| 🔴 CONTRATO INATIVO | TBContratos.Status = 0 | Ativar contrato |
| 🔴 RECURSO INATIVO | TBRecursos.Status = 0 | Ativar recurso |
| 🔴 VALOR PREVISTO ZERADO | TBRecursos.ValorPrevisto = 0 ou NULL | Preencher ValorPrevisto |
| 🟡 BDI ZERADO | TBRecursos.Bdi = 0 ou NULL | Preencher Bdi (opcional) |
| 🔴 VIGÊNCIA RECURSO INVÁLIDA | Maio/2026 fora do período do recurso | Ajustar DataInicio/DataFim do recurso |
| 🔴 VIGÊNCIA CONTRATO INVÁLIDA | Maio/2026 fora do período do contrato | Ajustar DataInicio/DataFim do contrato |
| ✅ CONFIGURAÇÃO OK | Tudo correto | Nenhuma ação necessária |

### Exemplo de resultado esperado

**GYN1R803 (Funcionando):**
```
Equipamento | Faixa | RecursoId | Valor Previsto | BDI % | Num. Contrato | Diagnóstico
------------|-------|-----------|----------------|-------|---------------|-------------
GYN1R803    | 1     | 1523      | 15000.00       | 25.00 | CT-2026-001   | ✅ CONFIGURAÇÃO OK
GYN1R803    | 2     | 1524      | 15000.00       | 25.00 | CT-2026-001   | ✅ CONFIGURAÇÃO OK
```

**GYN1R801 (Problemático - Cenário mais comum):**
```
Equipamento | Faixa | RecursoId | Valor Previsto | BDI % | Num. Contrato | Diagnóstico
------------|-------|-----------|----------------|-------|---------------|-------------
GYN1R801    | 1     | NULL      | NULL           | NULL  | NULL          | 🔴 RECURSO NÃO CADASTRADO
GYN1R801    | 2     | NULL      | NULL           | NULL  | NULL          | 🔴 RECURSO NÃO CADASTRADO
```

---

## 🔎 Query 3: Comparativo Resumido

### O que faz
Mostra um resumo quantitativo comparando os 4 equipamentos.

### Como interpretar

**Exemplo de resultado esperado:**

```
Equipamento | Total Faixas | Faixas com Recurso | Recursos com Contrato | Recursos com Contrato Ativo | Status Geral
------------|--------------|--------------------|-----------------------|-----------------------------|-------------
GYN1R801    | 2            | 0                  | 0                     | 0                           | ❌ PROBLEMA DETECTADO
GYN1R803    | 2            | 2                  | 2                     | 2                           | ✅ TODAS FAIXAS OK
GYN1R804    | 2            | 2                  | 2                     | 2                           | ✅ TODAS FAIXAS OK
GYN1R805    | 2            | 2                  | 2                     | 2                           | ✅ TODAS FAIXAS OK
```

**Interpretação:**
- GYN1R801 tem 2 faixas mas **NENHUMA** possui recurso cadastrado
- GYN1R803/804/805 têm todas as faixas com recursos cadastrados e vinculados a contratos ativos

---

## 🔎 Query 4: Contratos Ativos no Período

### O que faz
Lista todos os contratos que **deveriam** estar ativos em Maio/2026 e mostra quais equipamentos estão vinculados.

### Para que serve
Identificar qual contrato deve ser usado para vincular aos recursos do GYN1R801.

### Exemplo de resultado

```
ContratoId | Num. Contrato | Status | Início     | Fim        | Equipamentos Vinculados        | Validação Maio/2026
-----------|---------------|--------|------------|------------|--------------------------------|--------------------
12         | CT-2026-001   | 1      | 01/01/2026 | 31/12/2026 | GYN1R803, GYN1R804, GYN1R805   | ✅ VÁLIDO
```

**Use este ContratoId (12) para vincular aos recursos do GYN1R801!**

---

## 🔎 Query 5: Script de Correção

### ⚠️ ATENÇÃO
Este script está **COMENTADO** por segurança. Execute somente após:
1. Identificar o problema através das Queries 1-4
2. Confirmar o ContratoId correto na Query 4
3. Validar os valores de ValorPrevisto e Bdi com a equipe de contratos

### Como usar

1. **Identifique o ContratoId** na Query 4
2. **Descomente o script** da Query 5
3. **Preencha as variáveis:**
   ```sql
   DECLARE @ContratoId INT = 12; -- ID encontrado na Query 4
   DECLARE @ValorPrevisto DECIMAL(18,2) = 15000.00; -- Conforme contrato
   DECLARE @Bdi DECIMAL(5,2) = 25.00; -- Conforme contrato
   DECLARE @DataInicio DATE = '2026-01-01'; -- Conforme contrato
   DECLARE @DataFim DATE = '2026-12-31'; -- Conforme contrato
   ```
4. **Execute o script**
5. **Valide** rodando as Queries 1-3 novamente

---

## 📊 Fluxo de Validação Recomendado

```
1. Execute Query 2 (Diagnóstico detalhado)
   ↓
2. Se Diagnóstico = "RECURSO NÃO CADASTRADO"
   ↓
3. Execute Query 4 (Identificar ContratoId)
   ↓
4. Execute Query 5 (Inserir recursos - descomentado e preenchido)
   ↓
5. Execute Query 2 novamente (Validar correção)
   ↓
6. Execute Query 3 (Confirmar "TODAS FAIXAS OK")
   ↓
7. Gerar Relatório de Medição novamente no AxHub
```

---

## 🎯 Cenários Comuns e Soluções

### Cenário A: Recursos não cadastrados
**Sintoma:** Query 2 mostra "RECURSO NÃO CADASTRADO"  
**Solução:** Execute Query 5 após preencher corretamente

### Cenário B: Recursos sem contrato vinculado
**Sintoma:** Query 2 mostra "RECURSO SEM CONTRATO VINCULADO"  
**Solução:** 
```sql
UPDATE TBRecursos 
SET ContratoId = 12 -- ID do contrato correto
WHERE EquipamentoId = (SELECT Id FROM TBEquipamentos WHERE CodigoEquipamento = 'GYN1R801')
```

### Cenário C: Valores zerados
**Sintoma:** Query 2 mostra "VALOR PREVISTO ZERADO"  
**Solução:**
```sql
UPDATE TBRecursos 
SET ValorPrevisto = 15000.00, 
    Bdi = 25.00
WHERE EquipamentoId = (SELECT Id FROM TBEquipamentos WHERE CodigoEquipamento = 'GYN1R801')
```

### Cenário D: Contrato inativo
**Sintoma:** Query 1 mostra "CONTRATO INATIVO"  
**Solução:**
```sql
UPDATE TBContratos 
SET Status = 1 
WHERE Id = 12 -- ID do contrato
```

---

## ✅ Validação Final

Após aplicar correções, execute:

1. **Query 3** deve mostrar:
   ```
   GYN1R801 | 2 | 2 | 2 | 2 | ✅ TODAS FAIXAS OK
   ```

2. **No AxHub**, acesse:
   - Medição → Nova Medição → Relatório de Medição de Equipamento
   - Selecione: GYN1R801, Maio/2026
   - Verifique se os valores aparecem:
     - VALOR PREVISTO: R$ 15.000,00
     - VALOR FAIXA: ≈ R$ 15.000,00 (depende do índice de operação)
     - BDI %: 25,00%
     - TOTAL: ≈ R$ 18.750,00

---

## 📚 Arquivos Relacionados

- `SCRIPT-DIAGNOSTICO-MEDICAO-GOIANIA.sql` - Diagnóstico completo (9 queries)
- `VALIDACAO-CONTRATOS-POR-FAIXA-GOIANIA.sql` - **Este arquivo** (5 queries)
- `COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md` - Regras documentadas vs SQL
- `INSTRUCOES-EXECUCAO-SCRIPT-SQL.md` - Como executar no SSMS

---

## 🆘 Suporte

Se após executar as queries o problema persistir, cole os resultados das **Queries 2 e 4** para análise detalhada.
