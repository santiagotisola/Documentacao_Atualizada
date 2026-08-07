# Análise Completa: Lógica de Descarte por Lacre Rompido

**Data:** 26/05/2026  
**Reportado por:** Nádia Peixoto  
**Módulo:** Operações → Aferições → Triagem  
**Equipamento:** GYN2L508 (Série 37173)  
**Faixa afetada:** GYN2L508-2 - QD. 29 LT. 2, 3  
**Severidade:** Funcionalidade incompleta (campo criado mas não consumido)  
**Versão do documento:** 3.0 — Validada contra regulamentação INMETRO

---

## 1. Contexto do Problema

Ao cadastrar uma aferição com status **"Lacre Rompido"** e data de rompimento **19/05/2026**, o sistema descarta **TODAS** as infrações de velocidade da faixa durante **toda a vigência da aferição** (12/02/2026 a 11/02/2027) — incluindo o período anterior ao rompimento que a operação deseja preservar.

### 1.1. Dados da Aferição

| Campo | Valor |
|-------|-------|
| Nº Série | 37173 |
| Nº Lacre | ECJ8621182 |
| Nº INMETRO | 37173 |
| Data Aferição | 12/02/2026 |
| Data Vencimento | 11/02/2027 |
| Data Emissão | 12/02/2026 |
| Equipamento | GYN2L508 |
| Tipo | AFERIÇÃO PERIÓDICA |
| Status Lacre | Lacre Rompido |
| Data Lacre Rompido | 19/05/2026 ← **informada na tela mas NÃO usada na lógica** |

### 1.2. Tabelas envolvidas (SQL Server)

| Tabela | Papel |
|--------|-------|
| `TBAfericoes` | Armazena aferição, status do lacre, `DataLacreRompido` |
| `TBFaixasAfericoes` | Vincula aferição ↔ faixa do equipamento |
| `TBInfracoes` | Infrações registradas (com `DataHora`, tipo, faixa) |
| `TBMotivosDescartes` | Cadastro de motivos (código 003 = Lacre Rompido) |
| `TBMotivoDescarteTipoInfracoes` | Vínculo motivo ↔ tipo infração (restringe velocidade) |

---

## 2. Fundamentação Regulatória — Portaria INMETRO 492/2021

### 2.1. O que diz a regulamentação

A **Portaria INMETRO nº 492/2021** aprova o Regulamento Técnico Metrológico (RTM) para instrumentos de medição de velocidade de veículos automotores. Os pontos fundamentais sobre selagem e lacre:

| Artigo/Seção | Determinação |
|--------------|-------------|
| **Selagem metrológica** | Após verificação/aferição, o instrumento DEVE ser lacrado para garantir integridade metrológica |
| **Finalidade do lacre** | Assegurar que o instrumento não foi adulterado entre verificações |
| **Lacre violado/rompido** | A integridade metrológica do instrumento NÃO pode ser garantida a partir do momento da violação |
| **Validade da verificação** | 12 meses (aferição periódica). O lacre garante integridade durante todo esse período |
| **Medições com lacre rompido** | NÃO possuem validade metrológica — instrumento pode ter sido adulterado |
| **Medições ANTES do rompimento** | O lacre estava fisicamente íntegro → medições são válidas |
| **Escopo** | Aplica-se exclusivamente a **medição de velocidade**. Outros tipos de infração (avanço de sinal, faixa exclusiva, conversão proibida) usam captura de imagem/vídeo e NÃO dependem de calibração metrológica |

### 2.2. Legislação complementar aplicável

| Norma | Aplicação |
|-------|-----------|
| **Resolução CONTRAN 798/2021** | Regulamenta o uso de instrumentos e equipamentos de fiscalização |
| **Portaria INMETRO 544/2014** | Requisitos de avaliação de conformidade para medidores de velocidade |
| **Portaria DENATRAN 100/2010** | Procedimentos de fiscalização e lavratura de autos de infração |
| **CTB Art. 280 §2º** | Auto de infração deve indicar instrumento/equipamento utilizado |

### 2.3. Interpretação regulatória consolidada

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PRINCÍPIO FUNDAMENTAL (Portaria INMETRO 492/2021):                     │
│                                                                         │
│  "A selagem metrológica GARANTE a integridade do instrumento entre      │
│   verificações. Se o lacre é rompido em data X, a garantia de           │
│   integridade CESSA em X. Medições anteriores a X foram realizadas      │
│   com lacre comprovadamente íntegro."                                   │
│                                                                         │
│  CONCLUSÃO REGULATÓRIA:                                                 │
│  ✅ Antes do rompimento → lacre íntegro → medições VÁLIDAS             │
│  ❌ A partir do rompimento → sem garantia → medições INVÁLIDAS          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.4. Veredicto: O que está CORRETO?

| Questão | Resposta |
|---------|----------|
| O sistema atual está correto? | **NÃO** — descartar TODA a vigência é mais restritivo que a regulamentação exige |
| O que a operação solicita está correto? | **SIM** — preservar período anterior ao rompimento é respaldado pela Portaria 492/2021 |
| Existe risco jurídico em implementar? | **NÃO** — implementar o ponto de corte ALINHA o sistema com a regulamentação |
| O motorista é prejudicado pela correção? | **NÃO** — a correção beneficia o autuado de período válido (infração mantida) e protege o de período inválido (infração descartada) |

---

## 3. Comportamento REAL do Sistema (Lógica Atual)

### 3.1. Fluxo de decisão na triagem

O sistema executa 3 verificações em sequência:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. QUAL AFERIÇÃO USAR?                                          │
│    → Busca a aferição da faixa com MAIOR DataVencimento         │
│    → NÃO verifica se era a vigente na data da infração          │
├─────────────────────────────────────────────────────────────────┤
│ 2. É INFRAÇÃO DE VELOCIDADE?                                    │
│    → NÃO (avanço sinal, faixa, conversão): válida sempre       │
│    → SIM: continua para verificação 3                           │
│    → Base: Portaria INMETRO 492/2021 (escopo: velocidade)       │
├─────────────────────────────────────────────────────────────────┤
│ 3. QUAL O STATUS DO LACRE?                                      │
│    → "Lacrado": válida se DataVencimento > DataPassagem         │
│    → "Lacre Rompido": INVÁLIDA SEMPRE (motivo 003)              │
│      ⚠️  NÃO consulta DataLacreRompido                          │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2. O campo `DataLacreRompido` NÃO É USADO

| Aspecto | Status |
|---------|--------|
| Migration criada | ✅ `_20250721143500_Alter_Table_TBAfericoes_Add_Column_DataLacreRompido` |
| Tela obriga preenchimento | ✅ Campo obrigatório quando Status = Rompido |
| Banco armazena | ✅ Coluna `[DataLacreRompido] [datetime] NULL` em `TBAfericoes` |
| Controller persiste | ✅ SaveAsync funciona |
| **Triagem consome o dado** | ❌ **NUNCA IMPLEMENTADO** |

**O campo serve apenas como registro documental.** A lógica de descarte ignora completamente essa data.

### 3.3. Resultado prático (cenário GYN2L508)

```
Aferição: 12/02/2026 ──────────────────────────── 11/02/2027
          │            TUDO DESCARTADO (003)            │
          │  (toda infração de velocidade da faixa)    │
          └────────────────────────────────────────────┘
                         ↑
              DataLacreRompido = 19/05/2026
              (informada mas IGNORADA pelo sistema)
```

**Toda infração de velocidade da faixa GYN2L508-2 entre 12/02/2026 e 11/02/2027 entra para descarte — incluindo 3 meses de infrações válidas (12/02 a 19/05).**

---

## 4. Comportamento Esperado (Conforme Regulamentação)

```
Aferição: 12/02/2026 ────────── 19/05/2026 ──────── 11/02/2027
          │      VÁLIDO ✅      │    DESCARTE ❌    │
          │  (lacre íntegro)   │  (motivo 003)     │
          └────────────────────┴───────────────────────┘
```

**Fundamentação:** Portaria INMETRO 492/2021 — o lacre estava fisicamente íntegro entre 12/02 e 19/05, portanto as medições de velocidade nesse período têm validade metrológica.

---

## 5. Análise de Riscos Completa

### 5.1. Riscos de MANTER o sistema como está (descarte total)

| # | Risco | Impacto | Probabilidade | Afetado |
|---|-------|---------|---------------|---------|
| R1 | **Perda financeira para o cliente** — infrações válidas descartadas desnecessariamente | Alto | Certa (ocorre sempre) | Cliente/Operação |
| R2 | **Retrabalho operacional** — suporte recebe chamados recorrentes sobre o problema | Médio | Alta | Operação/Suporte |
| R3 | **Workaround perigoso** — operação cria "aferição eventual" artificial para contornar | Médio | Alta | Integridade dos dados |
| R4 | **Desgaste comercial** — cliente percebe que paga por funcionalidade que não funciona | Médio | Média | Comercial |
| R5 | **Motorista NÃO é prejudicado** — infrações descartadas beneficiam o autuado | Nulo | - | Motorista |

### 5.2. Riscos de IMPLEMENTAR a correção (descarte parcial a partir da data)

| # | Risco | Impacto | Probabilidade | Mitigação |
|---|-------|---------|---------------|-----------|
| R6 | **Contestação judicial do motorista** — "o lacre já estava rompido antes" | Baixo | Baixa | Certificado de aferição comprova lacre íntegro na data da verificação + BO/registro do rompimento com data |
| R7 | **Data de rompimento incorreta** — operação informa data errada | Médio | Baixa | Validação: `DataLacreRompido >= DataAfericao` e `<= DataVencimento`. Auditoria com campo `CriadoPor`/`DataCriacao` |
| R8 | **Dados históricos sem data** — `DataLacreRompido IS NULL` em registros antigos | Baixo | Média | Fallback: NULL → descarta tudo (comportamento atual preservado) |
| R9 | **Reprocessamento de infrações já descartadas** — retroatividade | Médio | Baixa | Correção aplica-se apenas a novas triagens. Infrações já descartadas mantêm status (exceto reprocessamento manual) |
| R10 | **Autuado que já pagou multa do período anterior** — infração mantida era do período válido | Nulo | - | Infração válida = corretamente aplicada. Não há prejuízo |

### 5.3. Riscos para o MOTORISTA (autuado)

| Cenário | Com sistema atual | Com correção implementada | Análise |
|---------|-------------------|---------------------------|---------|
| Infração de velocidade ANTES do rompimento (12/02 a 19/05) | ❌ Descartada (beneficia motorista indevidamente) | ✅ Mantida (infração legítima, lacre íntegro) | **Correto manter** — motorista cometeu infração com instrumento válido |
| Infração de velocidade DEPOIS do rompimento (19/05 a 11/02) | ❌ Descartada | ❌ Descartada | **Ambos corretos** — sem garantia metrológica |
| Infração de avanço de sinal (qualquer data) | ✅ Mantida | ✅ Mantida | **Sem impacto** — não depende de lacre |
| Motorista contesta "instrumento irregular" | Descartam tudo — pode parecer irregular | Descartam só após data — demonstra controle | **Correção gera maior segurança jurídica** |

### 5.4. Matriz de Decisão Final

```
┌──────────────────────────────────────────────────────────────────────┐
│  PERGUNTA: O motorista é prejudicado pela correção?                  │
│                                                                      │
│  NÃO. O motorista que cometeu infração com instrumento              │
│  comprovadamente válido (lacre íntegro) não tem fundamento           │
│  para contestação. A Portaria 492/2021 valida a medição.             │
│                                                                      │
│  O motorista que infringiu APÓS o rompimento continua                │
│  protegido — infração será descartada por falta de                   │
│  garantia metrológica.                                               │
│                                                                      │
│  RISCO REAL: Manter o sistema como está é que gera risco —           │
│  descartar infrações válidas pode ser questionado pelo               │
│  órgão de trânsito em auditoria (por que descartaram algo válido?)   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 6. Problemas Identificados

### Problema 1 — Campo não consumido (principal)
O `DataLacreRompido` foi entregue na parte de **cadastro** (tela + banco + controller) mas a parte de **consumo na triagem** nunca foi implementada. É uma feature incompleta.

### Problema 2 — Seleção de aferição incorreta
O sistema busca a aferição com **maior DataVencimento**, não a que estava vigente na data da infração. Se houver uma aferição nova (Lacrada), ela assume para frente mas as infrações antigas permanecem descartadas pela referência errada.

### Problema 3 — Frustração operacional sem solução na tela
A operação pode informar 19/05, 25/05, qualquer data — o comportamento não muda. Gera frustração, chamados repetidos e perda de confiança no sistema.

### Problema 4 — Escopo limitado a velocidade (correto)
Infrações que NÃO são velocidade não são afetadas pelo lacre rompido. Isso está **correto** por regulamentação — avanço de sinal, faixa exclusiva, conversão proibida usam registro de imagem/vídeo e NÃO dependem de calibração metrológica.

### Problema 5 — Risco de auditoria do órgão de trânsito
Descartar infrações do período em que o lacre estava comprovadamente íntegro pode ser questionado em auditoria do DETRAN/CONTRAN — "por que infrações válidas foram descartadas?"

---

## 7. Proposta de Correção

### 7.1. Lógica corrigida (pseudocódigo)

```sql
-- CORREÇÃO: Usar DataLacreRompido como ponto de corte
-- Infrações a DESCARTAR (motivo 003):
SELECT i.*
FROM TBInfracoes i
JOIN TBFaixasAfericoes fa ON fa.Faixa_id = i.Faixa_id
JOIN TBAfericoes a ON a.Id = fa.Afericao_id
WHERE a.StatusLacre = 'Rompido'
  AND a.DataLacreRompido IS NOT NULL
  AND i.DataHora >= a.DataLacreRompido           -- ← A PARTIR do rompimento
  AND i.DataHora <= a.DataVencimento             -- ← até o vencimento
  AND i.TipoInfracao = 'VELOCIDADE'             -- ← apenas velocidade (Portaria 492/2021)
  -- Motivo: 003 - Lacre Rompido
```

### 7.2. Período anterior ao rompimento (MANTER VÁLIDA)

```sql
-- Infrações ANTES do rompimento: permanecem VÁLIDAS
-- Fundamentação: lacre comprovadamente íntegro (Portaria INMETRO 492/2021)
WHERE i.DataHora >= a.DataAfericao
  AND i.DataHora < a.DataLacreRompido
  AND a.StatusLacre = 'Rompido'
  -- Status: Válida (NÃO aplicar motivo 003)
```

### 7.3. Fallback — DataLacreRompido NULL (dados antigos)

```sql
-- Dados anteriores à migration (sem data preenchida):
-- Comportamento legado preservado — descarta toda a vigência
WHERE a.StatusLacre = 'Rompido'
  AND a.DataLacreRompido IS NULL
  -- Descarta tudo (compatibilidade retroativa)
```

### 7.4. Validações obrigatórias na gravação

| Validação | Regra | Motivo |
|-----------|-------|--------|
| Data mínima | `DataLacreRompido >= DataAfericao` | Rompimento não pode ser anterior à aferição |
| Data máxima | `DataLacreRompido <= GETDATE()` | Não pode ser data futura |
| Data coerente | `DataLacreRompido <= DataVencimento` | Não pode ser após vencimento |
| Campo obrigatório | `NOT NULL` quando StatusLacre = 'Rompido' | Já implementado na tela |

---

## 8. Cenários de Teste Obrigatórios

| # | Cenário | Entrada | Resultado esperado |
|---|---------|---------|-------------------|
| T1 | Velocidade antes do rompimento | DataHora=15/03/2026, Rompimento=19/05 | ✅ Válida |
| T2 | Velocidade no dia do rompimento | DataHora=19/05/2026, Rompimento=19/05 | ❌ Descartada (003) |
| T3 | Velocidade após rompimento | DataHora=25/05/2026, Rompimento=19/05 | ❌ Descartada (003) |
| T4 | Avanço sinal antes rompimento | DataHora=15/03/2026, Rompimento=19/05 | ✅ Válida (não é velocidade) |
| T5 | Avanço sinal após rompimento | DataHora=25/05/2026, Rompimento=19/05 | ✅ Válida (não depende de lacre) |
| T6 | DataLacreRompido NULL | StatusLacre='Rompido', DataLacreRompido=NULL | ❌ Descartada TODA vigência (legado) |
| T7 | Lacre "Lacrado" normal | StatusLacre='Lacrado' | ✅ Válida se DataVencimento > DataPassagem |
| T8 | Múltiplas aferições mesma faixa | Aferição1=Rompida, Aferição2=Lacrada (posterior) | Usa aferição vigente na data da infração |
| T9 | Data rompimento = Data aferição | DataLacreRompido = DataAfericao | ❌ Descartada TODA vigência (limite mínimo) |
| T10 | Infração na fronteira (23:59:59) | DataHora=18/05/2026 23:59:59, Rompimento=19/05 | ✅ Válida (antes do rompimento) |

---

## 9. Decisão e Recomendação

| # | Opção | Regulamentação | Risco cliente | Risco motorista | Risco jurídico |
|---|-------|---------------|---------------|-----------------|----------------|
| 1 | **Implementar consumo de DataLacreRompido** | ✅ Alinhada com Portaria 492/2021 | ✅ Preserva receita legítima | ✅ Não prejudica — infração era válida | ✅ Respaldada |
| 2 | Manter atual (descarta tudo) | ⚠️ Mais restritivo que exigido | ❌ Perde receita | ✅ Beneficia motorista indevidamente | ⚠️ Questionável em auditoria |
| 3 | Configurável por contrato | ✅ Flexível | ✅ Adapta por cliente | ⚠️ Complexo de auditar | ⚠️ Depende da configuração |

### ✅ Recomendação: **Opção 1 — Implementar consumo de DataLacreRompido**

**Justificativas:**
1. **Regulamentação** — Portaria INMETRO 492/2021 valida medições com lacre íntegro. Descartar o período válido não tem base legal
2. **Motorista** — NÃO é prejudicado. Infração no período válido foi cometida com instrumento comprovadamente correto
3. **Cliente** — Recupera receita legítima. Infrações válidas não são mais descartadas sem necessidade
4. **Órgão de trânsito** — Em auditoria, descartar infrações válidas pode gerar questionamento. A correção alinha com o regulamento
5. **Campo já existe** — A migration de Jul/2025 criou `DataLacreRompido` com essa intenção. Só falta usar na query
6. **Fallback seguro** — `NULL` → comportamento atual. Nenhum dado histórico é afetado sem intervenção manual

---

## 10. Impacto da Correção

| Item | Detalhe |
|------|---------|
| Tabelas | `TBAfericoes` (leitura de `DataLacreRompido`) |
| Módulo afetado | Triagem / Motor de validação de infrações |
| Query a alterar | Consulta que verifica status do lacre na triagem |
| Testes necessários | 10 cenários (seção 8) |
| Retrocompatibilidade | `DataLacreRompido IS NULL` → descarta tudo (comportamento atual) |
| Risco jurídico | **Nulo** — a correção ALINHA com a regulamentação |
| Impacto no motorista | **Nulo** — infração válida = instrumento era íntegro |
| Reprocessamento | Infrações já descartadas no período 12/02–19/05: reprocessamento manual opcional |

---

## 11. Reprodução do Cenário

1. Acessar **Operações → Aferições**
2. Abrir aferição do equipamento **GYN2L508** (série 37173)
3. Alterar **Status do Lacre** para "Lacre Rompido"
4. Informar **Data que o Lacre foi Rompido:** 19/05/2026
5. Salvar
6. Ir para **Triagem** → filtrar faixa GYN2L508-2
7. **Observar (atual):** sistema solicita descarte de TODAS as infrações de velocidade (12/02 a 11/02/2027)
8. **Esperado (após correção):** descartar apenas de 19/05/2026 em diante

---

## 12. Pontos de Atenção para o Suporte (enquanto não corrigido)

1. **Não adianta corrigir a data na tela** — o campo não é consumido pela triagem
2. **Motivo 003** vem de `Configuração → MotivoDescarteAfericao` — trocar o motivo não muda a regra
3. **Infrações não-velocidade** não são afetadas por lacre (correto, não é bug)
4. **Workaround temporário:** registrar uma **nova aferição eventual** (Lacrada) com data = DataLacreRompido. A nova aferição assume como referência e infrações anteriores a ela ficam vinculadas à aferição original (ainda Lacrada naquele ponto)
5. **⚠️ CUIDADO com o workaround:** a nova aferição eventual precisa ter DataAfericao = 19/05/2026 e DataVencimento futura, e o Status Lacre = "Lacrado". Isso "separa" os períodos para a triagem
6. **Infrações já descartadas:** só recuperáveis via reprocessamento manual (Triagem → filtrar Status=Descartada → Reabrir)

---

## 13. Conclusão Executiva

| Aspecto | Conclusão |
|---------|-----------|
| **O sistema atual está errado?** | Não é um bug — é feature incompleta. A implementação parou no cadastro |
| **O que a operação pede está correto?** | SIM — respaldado pela Portaria INMETRO 492/2021 |
| **O motorista é prejudicado?** | NÃO — infração no período válido tinha instrumento íntegro comprovado |
| **O cliente é prejudicado pelo sistema atual?** | SIM — perde receita legítima de infrações válidas |
| **Risco de surpresa futura?** | Correção elimina riscos de auditoria e reclamação do cliente |
| **Implementação é complexa?** | NÃO — campo já existe, só falta adicionar `WHERE DataHora >= DataLacreRompido` na query |

**A correção é regulatoriamente correta, operacionalmente necessária, juridicamente segura e tecnicamente simples.**
