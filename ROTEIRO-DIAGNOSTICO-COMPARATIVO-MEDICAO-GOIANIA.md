# Roteiro de Diagnóstico Comparativo: Medição Goiânia
## Análise: GYN1R801 (Zerado) vs GYN1R803/804/805 (Funcionando)

**Data:** 18/06/2026  
**Sistema:** https://goiania.axhub.axion.ws  
**Objetivo:** Identificar diferenças de configuração que causam valores zerados

---

## 📋 Passo 1: Acessar o Relatório de Medição

### 1.1. Navegação no Sistema
```
1. Acesse: https://goiania.axhub.axion.ws
2. Faça login com suas credenciais
3. No menu lateral esquerdo, clique em: Medição → Nova Medição
```

### 1.2. Configurar Filtros
```
Mês e Ano: maio 2026
Grupo de equipamentos: LOTE 02 (ou "Selecione...")
Equipamento: Selecione GYN1R801
```

### 1.3. Gerar Relatório
```
Clique no botão "Buscar" ou "Excel" para gerar o relatório
```

### 1.4. Anotar Valores do GYN1R801
Preencha a tabela abaixo com os valores exibidos:

| Equipamento | Faixa | Veículos | Total Horas | Índice | Valor Previsto | Valor Faixa | BDI (%) | Total |
|-------------|-------|----------|-------------|--------|----------------|-------------|---------|-------|
| GYN1R801 | 1 | _______ | _______ | _______% | R$ _______ | R$ _______ | _______% | R$ _______ |
| GYN1R801 | 2 | _______ | _______ | _______% | R$ _______ | R$ _______ | _______% | R$ _______ |

---

## 📋 Passo 2: Repetir para Equipamentos de Comparação

### 2.1. GYN1R803
```
1. Volte para: Medição → Nova Medição
2. Selecione: GYN1R803
3. Clique em "Buscar"
4. Anote os valores:
```

| Equipamento | Faixa | Veículos | Total Horas | Índice | Valor Previsto | Valor Faixa | BDI (%) | Total |
|-------------|-------|----------|-------------|--------|----------------|-------------|---------|-------|
| GYN1R803 | 1 | _______ | _______ | _______% | R$ _______ | R$ _______ | _______% | R$ _______ |
| GYN1R803 | 2 | _______ | _______ | _______% | R$ _______ | R$ _______ | _______% | R$ _______ |

### 2.2. GYN1R804
| Equipamento | Faixa | Veículos | Total Horas | Índice | Valor Previsto | Valor Faixa | BDI (%) | Total |
|-------------|-------|----------|-------------|--------|----------------|-------------|---------|-------|
| GYN1R804 | 1 | _______ | _______ | _______% | R$ _______ | R$ _______ | _______% | R$ _______ |
| GYN1R804 | 2 | _______ | _______ | _______% | R$ _______ | R$ _______ | _______% | R$ _______ |

### 2.3. GYN1R805
| Equipamento | Faixa | Veículos | Total Horas | Índice | Valor Previsto | Valor Faixa | BDI (%) | Total |
|-------------|-------|----------|-------------|--------|----------------|-------------|---------|-------|
| GYN1R805 | 1 | _______ | _______ | _______% | R$ _______ | R$ _______ | _______% | R$ _______ |
| GYN1R805 | 2 | _______ | _______ | _______% | R$ _______ | R$ _______ | _______% | R$ _______ |

---

## 📋 Passo 3: Verificar Cadastro de Recursos

### 3.1. Navegação
```
1. No menu lateral, clique em: Medição → Recursos
2. Aguarde a página carregar completamente
```

### 3.2. Filtrar por Equipamento GYN1R801
```
1. Na barra de busca ou filtro, digite: GYN1R801
2. Observe quantos recursos aparecem na lista
3. Anote abaixo:
```

**Quantidade de recursos cadastrados para GYN1R801:** ___________

**Se aparecer 0 recursos, ESTA É A CAUSA RAIZ DO PROBLEMA!**

### 3.3. Se Houver Recursos, Verificar Detalhes
Para cada recurso listado, clique em "Editar" ou "Visualizar" e anote:

#### Recurso 1 - GYN1R801 Faixa 1
```
Descrição: _________________________________
Tipo: _________________________________
Contrato: _________________________________
Equipamento: GYN1R801
Faixa: _____
Valor Previsto: R$ _____________
BDI (%): _______
Data Início: ___/___/______
Data Fim: ___/___/______
Status: [ ] Ativo  [ ] Inativo
```

#### Recurso 2 - GYN1R801 Faixa 2
```
Descrição: _________________________________
Tipo: _________________________________
Contrato: _________________________________
Equipamento: GYN1R801
Faixa: _____
Valor Previsto: R$ _____________
BDI (%): _______
Data Início: ___/___/______
Data Fim: ___/___/______
Status: [ ] Ativo  [ ] Inativo
```

---

## 📋 Passo 4: Verificar Recursos dos Equipamentos que Funcionam

### 4.1. Filtrar por GYN1R803
```
1. Na página Medição → Recursos
2. Limpe o filtro anterior
3. Digite: GYN1R803
```

**Quantidade de recursos cadastrados:** ___________

#### Recurso GYN1R803 - Faixa 1
```
Valor Previsto: R$ _____________
BDI (%): _______
Status: [ ] Ativo  [ ] Inativo
```

#### Recurso GYN1R803 - Faixa 2
```
Valor Previsto: R$ _____________
BDI (%): _______
Status: [ ] Ativo  [ ] Inativo
```

### 4.2. Repetir para GYN1R804 e GYN1R805

#### GYN1R804
```
Quantidade de recursos: _____
Valor Previsto Faixa 1: R$ _____________
Valor Previsto Faixa 2: R$ _____________
BDI: _______%
```

#### GYN1R805
```
Quantidade de recursos: _____
Valor Previsto Faixa 1: R$ _____________
Valor Previsto Faixa 2: R$ _____________
BDI: _______%
```

---

## 📋 Passo 5: Verificar Vinculação ao Contrato

### 5.1. Acessar Contratos
```
1. No menu lateral: Medição → Contratos
2. Localize o contrato de Goiânia (pode ser "SMT Goiânia" ou similar)
3. Clique em "Editar" ou "Visualizar"
```

### 5.2. Verificar Equipamentos Vinculados
```
1. Na tela do contrato, procure pela aba ou seção "Equipamentos"
2. Verifique se GYN1R801, GYN1R803, GYN1R804 e GYN1R805 estão na lista
3. Marque abaixo:
```

**Equipamentos vinculados ao contrato:**
- [ ] GYN1R801 está vinculado
- [ ] GYN1R803 está vinculado
- [ ] GYN1R804 está vinculado
- [ ] GYN1R805 está vinculado

### 5.3. Dados do Contrato
```
Número do Contrato: _________________________________
Órgão: _________________________________
Vigência Início: ___/___/______
Vigência Fim: ___/___/______
Status: _________________________________
Tipo de Medição: _________________________________
```

---

## 📋 Passo 6: Consultas SQL no Banco de Dados

### 6.1. Conectar ao SQL Server Management Studio
```
Servidor: [servidor do AxHub Goiânia]
Banco de Dados: [nome do banco - provavelmente AxHub_Goiania ou similar]
```

### 6.2. Query 1 - Verificar Equipamentos
```sql
-- Verificar se os 4 equipamentos existem no banco
SELECT 
    Id,
    CodigoEquipamento,
    Descricao,
    GrupoId,
    Status
FROM TBEquipamentos
WHERE CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
ORDER BY CodigoEquipamento
```

**Cole o resultado aqui:**
```
Id | CodigoEquipamento | Descricao | GrupoId | Status
---|-------------------|-----------|---------|-------



```

### 6.3. Query 2 - Verificar Faixas
```sql
-- Verificar quantas faixas cada equipamento possui
SELECT 
    e.CodigoEquipamento,
    f.Id AS FaixaId,
    f.NumeroFaixa,
    f.Status
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
ORDER BY e.CodigoEquipamento, f.NumeroFaixa
```

**Cole o resultado aqui:**
```
CodigoEquipamento | FaixaId | NumeroFaixa | Status
------------------|---------|-------------|-------




```

### 6.4. Query 3 - Verificar Recursos (CHAVE!)
```sql
-- QUERY PRINCIPAL: Verificar se existem recursos cadastrados
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    r.Descricao AS RecursoDescricao,
    r.ValorPrevisto,
    r.Bdi,
    r.DataInicio,
    r.DataFim,
    r.Status,
    c.NumeroContrato,
    c.Orgao
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON (r.EquipamentoId = e.Id AND r.FaixaId = f.Id)
LEFT JOIN TBContratos c ON r.ContratoId = c.Id
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
ORDER BY e.CodigoEquipamento, f.NumeroFaixa
```

**Cole o resultado completo aqui:**
```
CodigoEquipamento | NumeroFaixa | RecursoId | ValorPrevisto | Bdi | Status | NumeroContrato
------------------|-------------|-----------|---------------|-----|--------|---------------









```

### 6.5. Query 4 - Contagem de Recursos por Equipamento
```sql
-- Resumo: quantos recursos cada equipamento tem
SELECT 
    e.CodigoEquipamento,
    COUNT(DISTINCT r.Id) AS QtdRecursos,
    COUNT(DISTINCT CASE WHEN r.Status = 'Ativo' THEN r.Id END) AS QtdAtivos,
    SUM(CASE WHEN r.ValorPrevisto > 0 THEN 1 ELSE 0 END) AS QtdComValor,
    AVG(r.Bdi) AS BdiMedio
FROM TBEquipamentos e
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
GROUP BY e.CodigoEquipamento
ORDER BY e.CodigoEquipamento
```

**Cole o resultado aqui:**
```
CodigoEquipamento | QtdRecursos | QtdAtivos | QtdComValor | BdiMedio
------------------|-------------|-----------|-------------|----------




```

### 6.6. Query 5 - Verificar Passagens em Maio/2026
```sql
-- Confirmar que há dados operacionais (passagens)
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    COUNT(*) AS TotalPassagens,
    MIN(p.DataHora) AS PrimeiraPassagem,
    MAX(p.DataHora) AS UltimaPassagem
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
JOIN TBPassagens p ON p.FaixaId = f.Id
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803', 'GYN1R804', 'GYN1R805')
  AND p.DataHora >= '2026-05-01 00:00:00'
  AND p.DataHora < '2026-06-01 00:00:00'
GROUP BY e.CodigoEquipamento, f.NumeroFaixa
ORDER BY e.CodigoEquipamento, f.NumeroFaixa
```

**Cole o resultado aqui:**
```
CodigoEquipamento | NumeroFaixa | TotalPassagens | PrimeiraPassagem | UltimaPassagem
------------------|-------------|----------------|------------------|---------------




```

---

## 📋 Passo 7: Análise Comparativa

### 7.1. Completar a Tabela de Comparação
Com base nos dados coletados, preencha:

| Critério | GYN1R801 | GYN1R803 | GYN1R804 | GYN1R805 |
|----------|----------|----------|----------|----------|
| **Equipamento existe no BD?** | ⬜ Sim ⬜ Não | ⬜ Sim ⬜ Não | ⬜ Sim ⬜ Não | ⬜ Sim ⬜ Não |
| **Quantidade de Faixas** | _____ | _____ | _____ | _____ |
| **Quantidade de Recursos** | _____ | _____ | _____ | _____ |
| **Recursos Ativos** | _____ | _____ | _____ | _____ |
| **Valor Previsto Faixa 1** | R$ _____ | R$ _____ | R$ _____ | R$ _____ |
| **Valor Previsto Faixa 2** | R$ _____ | R$ _____ | R$ _____ | R$ _____ |
| **BDI (%)** | _____% | _____% | _____% | _____% |
| **Vinculado ao Contrato?** | ⬜ Sim ⬜ Não | ⬜ Sim ⬜ Não | ⬜ Sim ⬜ Não | ⬜ Sim ⬜ Não |
| **Passagens em Maio/2026** | _____ | _____ | _____ | _____ |

### 7.2. Identificar Diferenças
Marque as diferenças encontradas:

⬜ **GYN1R801 não possui recursos cadastrados** (outros equipamentos possuem)  
⬜ **GYN1R801 possui recursos, mas com ValorPrevisto = 0 ou NULL**  
⬜ **GYN1R801 possui recursos, mas com BDI = 0 ou NULL**  
⬜ **GYN1R801 possui recursos, mas com Status = Inativo**  
⬜ **GYN1R801 não está vinculado ao contrato** (outros estão)  
⬜ **GYN1R801 possui recursos com período de vigência fora de maio/2026**  
⬜ **Outros equipamentos também estão com valores zerados** (problema geral)

---

## 📋 Passo 8: Resolução Baseada no Diagnóstico

### Cenário A: GYN1R801 NÃO possui recursos cadastrados

**✅ SOLUÇÃO:**
```
1. Acesse: Medição → Recursos → Novo Recurso
2. Preencha:
   - Descrição: "Faixa 1 - GYN1R801"
   - Tipo: Equipamento
   - Contrato: [Selecione o contrato de Goiânia]
   - Equipamento: GYN1R801
   - Faixa: 1
   - Valor Previsto: [Copie o valor do GYN1R803 Faixa 1]
   - BDI (%): [Copie o BDI do GYN1R803]
   - Data Início: 01/05/2026 (ou início da vigência)
   - Status: Ativo
3. Clique em "Salvar"
4. Repita para Faixa 2
```

### Cenário B: GYN1R801 possui recursos, mas com valores zerados

**✅ SOLUÇÃO:**
```
1. Acesse: Medição → Recursos
2. Filtre por: GYN1R801
3. Clique em "Editar" no recurso da Faixa 1
4. Altere:
   - Valor Previsto: [mesmo valor do GYN1R803]
   - BDI (%): [mesmo BDI do GYN1R803]
5. Verifique:
   - Status = Ativo
   - Data Início <= 01/05/2026
   - Data Fim >= 31/05/2026 (ou deixe em branco)
6. Clique em "Salvar"
7. Repita para Faixa 2
```

### Cenário C: Recursos existem e estão corretos, mas não aparecem no relatório

**✅ SOLUÇÃO:**
```
1. Verifique se o equipamento está vinculado ao contrato:
   - Medição → Contratos → Editar contrato de Goiânia
   - Aba "Equipamentos"
   - Se GYN1R801 não estiver, clique em "Adicionar Equipamento"
   - Selecione GYN1R801
   - Salve
   
2. Limpe o cache/sessão:
   - Saia do sistema (logout)
   - Feche o navegador
   - Abra novamente e faça login
   - Gere o relatório novamente
```

---

## 📋 Passo 9: Validar a Correção

### 9.1. Após Fazer as Alterações
```
1. Aguarde 5 minutos (para o sistema processar)
2. Acesse: Medição → Nova Medição
3. Selecione:
   - Mês: maio 2026
   - Equipamento: GYN1R801
4. Clique em "Buscar"
```

### 9.2. Verificar se os Valores Apareceram
```
VALOR PREVISTO: R$ __________ (deve ser > 0)
VALOR FAIXA: R$ __________ (deve ser > 0)
BDI (%): __________% (deve ser > 0)
TOTAL: R$ __________ (deve ser > 0)
```

**Se os valores continuam zerados:**
- Revise o passo 8
- Execute novamente a Query 3 do Passo 6.4
- Verifique se o Status do recurso está "Ativo"
- Confirme que ContratoId não está NULL

---

## 📋 Passo 10: Documentação Final

### 10.1. Tirar Screenshots
Capture telas de:
1. **Relatório de Medição do GYN1R801** (com valores zerados - antes da correção)
2. **Tela de Recursos - filtro GYN1R801** (mostrando 0 recursos ou recursos zerados)
3. **Tela de Recursos - filtro GYN1R803** (mostrando recursos configurados corretamente)
4. **Tela de edição/criação do Recurso** (formulário preenchido)
5. **Relatório de Medição do GYN1R801** (com valores corretos - depois da correção)

### 10.2. Salvar os Resultados SQL
```
Salve todos os resultados das queries (Passo 6) em um arquivo TXT:
Nome: "resultados-sql-diagnostico-medicao-goiania-[data].txt"
```

### 10.3. Resumo Executivo
Preencha:

```
DATA DO DIAGNÓSTICO: ___/___/______
EXECUTADO POR: _________________________________

CAUSA RAIZ IDENTIFICADA:
⬜ Recursos não cadastrados para GYN1R801
⬜ Recursos cadastrados mas com ValorPrevisto = 0
⬜ Recursos cadastrados mas com BDI = 0
⬜ Recursos cadastrados mas com Status = Inativo
⬜ Equipamento não vinculado ao contrato
⬜ Outro: _________________________________

AÇÃO TOMADA:
_________________________________
_________________________________
_________________________________

RESULTADO:
⬜ SUCESSO - Valores apareceram corretamente no relatório
⬜ PARCIAL - Alguns valores ainda zerados
⬜ SEM SUCESSO - Problema persiste

VALORES APÓS CORREÇÃO:
GYN1R801 Faixa 1 - Valor Total: R$ ___________
GYN1R801 Faixa 2 - Valor Total: R$ ___________
```

---

## 🎯 Checklist Final

Antes de considerar concluído, verifique:

- [ ] Executei todas as queries SQL do Passo 6
- [ ] Anotei os resultados das 4 equipamentos (801, 803, 804, 805)
- [ ] Identifiquei a diferença entre GYN1R801 e os demais
- [ ] Cadastrei ou corrigi os recursos de GYN1R801
- [ ] Vinculei GYN1R801 ao contrato (se necessário)
- [ ] Aguardei 5 minutos após a alteração
- [ ] Gerei novamente o relatório de medição
- [ ] Os valores financeiros apareceram corretamente
- [ ] Tirei screenshots de antes e depois
- [ ] Salvei os resultados SQL
- [ ] Documentei a solução aplicada

---

## 📞 Suporte

Se após seguir todos os passos o problema persistir:

1. Anexe os screenshots capturados
2. Anexe o arquivo com os resultados SQL
3. Informe qual cenário (A, B ou C) foi aplicado
4. Abra chamado com o título: "Medição Goiânia - Valores Zerados GYN1R801 - Não Resolvido"

---

**Documento gerado por:** AxionIA Engine  
**Versão:** 1.0 - Roteiro Diagnóstico Comparativo  
**Data:** 18/06/2026
