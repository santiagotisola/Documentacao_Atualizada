# Análise Completa: Bloqueio por Limite de Horas na Importação de Passagens

**Data:** 26/05/2026  
**Módulo:** Importação de Dados / API de Recebimento  
**Recurso:** Limite de Horas para Importação de Passagens  
**Severidade:** Recurso desabilitado que continua apresentando bloqueio  
**Versão do documento:** 1.0 — Análise para investigação e desenvolvimento

---

## 1. Contexto do Problema

O sistema possui uma funcionalidade de **Limite de Horas para Importação** que rejeita dados (passagens e/ou infrações) quando a defasagem entre a data da captura e o momento do envio excede um limite configurado. O recurso estava **desabilitado** mas passou a apresentar bloqueio novamente.

### 1.1. Mecanismo de Controle (3 Níveis)

O sistema verifica o limite de horas em **3 níveis hierárquicos**, do mais específico ao mais geral:

```
┌─────────────────────────────────────────────────────────────────┐
│  NÍVEL 1 — EQUIPAMENTO (mais específico)                         │
│  Tabela: TBEquipamentos                                          │
│  Campo: [DesabilitarLimiteHorasImportacao] bit NOT NULL           │
│  Se = 1 → Limite desabilitado para ESTE equipamento              │
├─────────────────────────────────────────────────────────────────┤
│  NÍVEL 2 — GRUPO DE EQUIPAMENTOS                                │
│  Tabela: TBGrupoEquipamentos                                     │
│  Campo: [DesabilitarLimiteHorasImportacao] bit NOT NULL           │
│  Se = 1 → Limite desabilitado para TODO o grupo                  │
├─────────────────────────────────────────────────────────────────┤
│  NÍVEL 3 — CONFIGURAÇÃO GLOBAL DO SISTEMA                       │
│  Tabela: TBConfiguracoes                                          │
│  Campos: TipoConfiguracao / ValorConfiguracao                     │
│  - "LimiteHorasImportacaoInfracao" → horas máx para infrações    │
│  - "LimiteHorasImportacaoPassagem" → horas máx para passagens    │
│  Se valor = 0 ou vazio → sem limite global                       │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2. Tabelas Envolvidas (SQL Server)

| Tabela | Papel | Campos relevantes |
|--------|-------|-------------------|
| `TBConfiguracoes` | Config global do sistema | `TipoConfiguracao`, `ValorConfiguracao` |
| `TBEquipamentos` | Cadastro de equipamentos | `DesabilitarLimiteHorasImportacao`, `GrupoEquipamento_id` |
| `TBGrupoEquipamentos` | Grupos de equipamentos | `DesabilitarLimiteHorasImportacao` |
| `TBPassagens` | Passagens importadas | `DataHoraPassagem`, `DataCriacao`, `Equipamento_id` |
| `TBFabricantes` | Fabricantes | `Client_Id`, `ApiKey`, `Nome` |
| `TBModeloEquipamentos` | Modelos | `Fabricante_id`, `Marca`, `Modelo` |
| `TBDiscrepancias` | Registro de discrepâncias | `QuantidadePassagem`, `MediaPassagem` |

---

## 2. Hipóteses de Causa do Bloqueio

### 2.1. Hipótese A — Nível de desabilitação incorreto

O sistema verifica em 3 níveis. Se o operador desabilitou no **grupo** mas o equipamento individual tem o flag = 0, ou vice-versa, a lógica de verificação pode não respeitar a hierarquia esperada.

```sql
-- VERIFICAR: O equipamento TEM o flag desabilitado?
SELECT 
    e.Codigo,
    e.DesabilitarLimiteHorasImportacao AS EquipDesabilitado,
    g.Nome AS NomeGrupo,
    g.DesabilitarLimiteHorasImportacao AS GrupoDesabilitado
FROM TBEquipamentos e
LEFT JOIN TBGrupoEquipamentos g ON e.GrupoEquipamento_id = g.Id
WHERE e.Codigo = '<CODIGO_EQUIPAMENTO>'
```

**Cenário provável:** O operador marcou "Desabilitar" no Grupo, mas a lógica do sistema verifica **apenas o campo do equipamento individual** (prioridade ao mais específico). Se o equipamento individual está com 0, o limite permanece ativo independente do grupo.

### 2.2. Hipótese B — Configuração global re-ativada

Alguém alterou a configuração global (`TBConfiguracoes`) definindo um valor de horas, e a lógica aplica o limite global ANTES de verificar o flag individual.

```sql
-- VERIFICAR: Qual o limite global configurado?
SELECT TipoConfiguracao, ValorConfiguracao
FROM TBConfiguracoes
WHERE TipoConfiguracao LIKE '%Limite%Hora%'
   OR TipoConfiguracao LIKE '%Importacao%'
```

### 2.3. Hipótese C — Limite no fabricante (API)

O fabricante do equipamento pode ter imposto um **rate limit** ou **volume máximo** de dados por requisição na API de envio. Isso não é controlado pelo AxHub — é uma restrição da API do fabricante.

```sql
-- VERIFICAR: Qual fabricante e volume de passagens?
SELECT 
    f.Nome AS Fabricante,
    e.Codigo AS Equipamento,
    CAST(p.DataHoraPassagem AS DATE) AS Dia,
    COUNT(*) AS TotalPassagens
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
JOIN TBFabricantes f ON m.Fabricante_id = f.Id
WHERE p.DataCriacao >= DATEADD(DAY, -7, GETDATE())
GROUP BY f.Nome, e.Codigo, CAST(p.DataHoraPassagem AS DATE)
ORDER BY TotalPassagens DESC
```

### 2.4. Hipótese D — Defasagem temporal (equipamento offline acumulou dados)

O equipamento ficou **offline por vários dias** e ao reconectar tentou enviar dados antigos. Se o limite de horas está ativo (ex: 48h), todas as passagens com mais de 48h de defasagem são rejeitadas.

```sql
-- VERIFICAR: Passagens com grande defasagem
SELECT TOP 100
    e.Codigo,
    p.DataHoraPassagem,
    p.DataCriacao AS DataImportacao,
    DATEDIFF(HOUR, p.DataHoraPassagem, p.DataCriacao) AS DefasagemHoras
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE p.DataCriacao >= DATEADD(DAY, -7, GETDATE())
ORDER BY DefasagemHoras DESC
```

---

## 3. Lógica de Verificação — Fluxo Esperado

```
┌─────────────────────────────────────────────────────────────────────────┐
│  IMPORTAÇÃO DE PASSAGEM/INFRAÇÃO RECEBIDA VIA API DO FABRICANTE         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. Calcular DEFASAGEM = AGORA() - DataHoraPassagem                     │
│                                                                         │
│  2. Verificar flag do EQUIPAMENTO individual:                           │
│     → DesabilitarLimiteHorasImportacao = 1? → ACEITA (ignora limite)    │
│     → = 0? → continua...                                               │
│                                                                         │
│  3. Verificar flag do GRUPO do equipamento:                             │
│     → DesabilitarLimiteHorasImportacao = 1? → ACEITA (ignora limite)    │
│     → = 0? → continua...                                               │
│                                                                         │
│  4. Buscar LIMITE GLOBAL (TBConfiguracoes):                             │
│     → LimiteHorasImportacaoPassagem = N                                 │
│                                                                         │
│  5. DEFASAGEM > N horas?                                                │
│     → SIM: ❌ REJEITA (erro de limite)                                  │
│     → NÃO: ✅ ACEITA                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Possíveis falhas na lógica

| # | Falha | Resultado |
|---|-------|-----------|
| F1 | Sistema verifica APENAS equipamento, ignora grupo | Flag do grupo não tem efeito |
| F2 | Sistema verifica GRUPO antes de equipamento | Flag do equipamento pode ser sobreposto |
| F3 | Lógica usa AND ao invés de OR | Ambos precisam estar desabilitados |
| F4 | Config global aplicada ANTES dos flags individuais | Limite global tem prioridade sobre flag |
| F5 | Atualização de código reintroduziu a verificação | Deploy recente quebrou o bypass |

---

## 4. Limite de Dados no Fabricante — Pesquisa Necessária

### 4.1. Fabricantes comuns no AxHub e limites conhecidos

| Fabricante | Protocolo | Limite conhecido | Observação |
|-----------|-----------|-----------------|------------|
| **Velsis** | API REST (JSON) | Sem limite documentado de passagens/dia | Limite pode ser por tamanho de payload (body) |
| **Perkons** | API REST + SFTP | Rate limit de API: verificar contrato | Pode ter limite de requisições/minuto |
| **Pumatronix** | API REST | Verificar documentação do fabricante | Limite de imagens por lote |
| **Getnet/Autotrac** | Proprietário | Verificar especificação técnica | Depende do modelo do equipamento |
| **Axion (interno)** | Próprio (webhook AxHub) | Sem limite | Equipamentos próprios |

### 4.2. Informações a solicitar ao fabricante

1. **Rate limit da API:** Quantas requisições por minuto/hora são aceitas?
2. **Tamanho máximo de payload:** Limite de KB/MB por requisição
3. **Quantidade máxima de registros por lote:** Passagens por envio
4. **Volume máximo diário:** Existe cap de passagens/dia por equipamento?
5. **Timeout de conexão:** Tempo máximo de resposta antes de considerar falha
6. **Backlog máximo:** Quantos dias de dados offline podem ser enviados de uma vez?
7. **Código de erro retornado:** Qual HTTP status/mensagem quando limite é excedido?

### 4.3. Volume de referência por tipo de equipamento

| Tipo | Volume médio diário | Pico estimado | Obs |
|------|--------------------:|:-------------:|-----|
| Radar Fixo (via urbana) | 5.000–15.000 pass/dia | 25.000 | Depende do fluxo |
| Radar Fixo (rodovia) | 10.000–50.000 pass/dia | 80.000 | Alto fluxo |
| OCR (leitura de placas) | 8.000–30.000 pass/dia | 60.000 | Cada veículo = 1 registro |
| Radar Móvel (blitz) | 500–3.000 pass/dia | 5.000 | Operação temporária |
| Lombada eletrônica | 3.000–10.000 pass/dia | 20.000 | Depende da localização |

---

## 5. Análise de Riscos

### 5.1. Riscos de o limite estar ativo indevidamente

| # | Risco | Impacto | Probabilidade | Afetado |
|---|-------|---------|---------------|---------|
| R1 | **Perda de passagens legítimas** — dados rejeitados não entram no sistema | Alto | Alta (se equipamento acumulou offline) | Operação/Medição |
| R2 | **Perda de infrações** — infrações com defasagem são descartadas | Alto | Média | Receita do cliente |
| R3 | **Dados perdidos permanentemente** — fabricante pode não reenviar dados antigos | Crítico | Média | Irrecuperável |
| R4 | **Inconsistência no relatório de fluxo** — dias sem passagens (falso "offline") | Médio | Alta | Relatórios/Medição |
| R5 | **Descumprimento contratual** — contrato de medição exige volume mínimo | Médio | Baixa | Financeiro |

### 5.2. Riscos de desabilitar o limite completamente

| # | Risco | Impacto | Probabilidade | Mitigação |
|---|-------|---------|---------------|-----------|
| R6 | **Dados muito antigos importados** — passagens de meses atrás entram como novas | Baixo | Baixa | Validação de data máxima separada |
| R7 | **Sobrecarga do banco** — envio massivo de dados acumulados | Médio | Média | Queue/throttle na API de recebimento |
| R8 | **Discrepância estatística** — pico artificial no dia da importação | Baixo | Média | Usar `DataHoraPassagem` ao invés de `DataCriacao` nos relatórios |
| R9 | **Duplicatas** — reenvio de dados já importados | Médio | Baixa | Constraint de unicidade (Equipamento + Faixa + DataHora) |

### 5.3. Riscos para o CLIENTE (operação)

| Cenário | Com limite ativo | Com limite desabilitado | Análise |
|---------|-----------------|------------------------|---------|
| Equipamento offline 3 dias, reconecta | ❌ Dados rejeitados (> limite) | ✅ Dados aceitos (acumulado importado) | **Desabilitar é correto** para equipamentos que operam offline |
| Fabricante reenvia lote antigo | ❌ Rejeitado | ✅ Aceito | **Desabilitar é correto** se dados são legítimos |
| Equipamento com data/hora desconfigurada | ❌ Rejeitado (proteção) | ⚠️ Aceito com data errada | **Limite protege** contra dados inválidos |
| Ataque/spam na API | ❌ Rejeitado se dados "antigos" | ⚠️ Aceito sem filtro temporal | **Limite protege** contra envio malicioso |

---

## 6. Queries de Diagnóstico

### 6.1. Verificar configuração atual do limite

```sql
-- 1. Configuração GLOBAL
SELECT Id, TipoConfiguracao, ValorConfiguracao, DataAtualizacao, AtualizadoPor
FROM TBConfiguracoes
WHERE TipoConfiguracao LIKE '%Limite%'
   OR TipoConfiguracao LIKE '%Importacao%'
ORDER BY TipoConfiguracao

-- 2. Equipamentos com flag DESABILITADO
SELECT e.Codigo, e.NumeroSerie, e.DesabilitarLimiteHorasImportacao,
       g.Nome AS Grupo, g.DesabilitarLimiteHorasImportacao AS GrupoDesabilitado
FROM TBEquipamentos e
LEFT JOIN TBGrupoEquipamentos g ON e.GrupoEquipamento_id = g.Id
WHERE e.DesabilitarLimiteHorasImportacao = 1
   OR g.DesabilitarLimiteHorasImportacao = 1

-- 3. Equipamentos que DEVERIAM ter limite desabilitado mas NÃO TÊM
SELECT e.Codigo, e.NumeroSerie, 
       e.DesabilitarLimiteHorasImportacao AS EquipFlag,
       g.Nome AS Grupo, 
       g.DesabilitarLimiteHorasImportacao AS GrupoFlag
FROM TBEquipamentos e
LEFT JOIN TBGrupoEquipamentos g ON e.GrupoEquipamento_id = g.Id
WHERE e.DesabilitarLimiteHorasImportacao = 0
  AND (g.DesabilitarLimiteHorasImportacao = 0 OR g.Id IS NULL)
ORDER BY e.Codigo
```

### 6.2. Verificar passagens recentes e defasagem

```sql
-- Passagens importadas nos últimos 7 dias com defasagem > 24h
SELECT TOP 50
    e.Codigo AS Equipamento,
    f2.Nome AS Fabricante,
    p.DataHoraPassagem,
    p.DataCriacao AS DataImportacao,
    DATEDIFF(HOUR, p.DataHoraPassagem, p.DataCriacao) AS DefasagemHoras,
    DATEDIFF(DAY, p.DataHoraPassagem, p.DataCriacao) AS DefasagemDias
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
JOIN TBFabricantes f2 ON m.Fabricante_id = f2.Id
WHERE p.DataCriacao >= DATEADD(DAY, -7, GETDATE())
  AND DATEDIFF(HOUR, p.DataHoraPassagem, p.DataCriacao) > 24
ORDER BY DefasagemHoras DESC
```

### 6.3. Verificar se há passagens faltando (gap)

```sql
-- Comparar volume de passagens por dia dos últimos 30 dias
SELECT 
    e.Codigo,
    CAST(p.DataHoraPassagem AS DATE) AS Dia,
    COUNT(*) AS TotalPassagens
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = '<CODIGO_EQUIPAMENTO>'
  AND p.DataHoraPassagem >= DATEADD(DAY, -30, GETDATE())
GROUP BY e.Codigo, CAST(p.DataHoraPassagem AS DATE)
ORDER BY Dia DESC
```

### 6.4. Verificar log de alterações na configuração

```sql
-- Quem alterou as configurações recentemente?
SELECT TipoConfiguracao, ValorConfiguracao, DataAtualizacao, AtualizadoPor
FROM TBConfiguracoes
WHERE DataAtualizacao >= DATEADD(DAY, -30, GETDATE())
ORDER BY DataAtualizacao DESC
```

---

## 7. Cenários de Teste

| # | Cenário | Entrada | Resultado esperado |
|---|---------|---------|-------------------|
| T1 | Equipamento com flag desabilitado, defasagem 72h | DataHora = 3 dias atrás | ✅ Aceita (flag desabilitado) |
| T2 | Grupo com flag desabilitado, equipamento sem flag | DataHora = 3 dias atrás | ✅ Aceita (se lógica respeita grupo) |
| T3 | Ambos com flag = 0, limite global = 48h, defasagem 24h | DataHora = 24h atrás | ✅ Aceita (dentro do limite) |
| T4 | Ambos com flag = 0, limite global = 48h, defasagem 72h | DataHora = 72h atrás | ❌ Rejeitada (excede limite) |
| T5 | Limite global = 0 (sem limite), equipamento flag = 0 | DataHora = 30 dias atrás | ✅ Aceita (sem limite global) |
| T6 | Limite global = 48h, equipamento flag = 1 | DataHora = 72h atrás | ✅ Aceita (flag individual sobrescreve) |
| T7 | Equipamento offline 7 dias, reconecta e envia tudo | Volume alto, defasagem alta | ✅ Aceita (flag desabilitado) |
| T8 | Fabricante reenvia lote de 5 dias atrás | Defasagem = 120h | Depende da configuração |
| T9 | Passagem com data futura (relógio errado) | DataHora = amanhã | ⚠️ Deveria rejeitar por validação |
| T10 | 50.000 passagens em 1 lote | Volume extremo | Verificar se há limite de payload |

---

## 8. Proposta de Investigação

### 8.1. Verificações imediatas (banco de dados)

1. **Confirmar flag do equipamento:** `SELECT DesabilitarLimiteHorasImportacao FROM TBEquipamentos WHERE Codigo = '<X>'`
2. **Confirmar flag do grupo:** `SELECT DesabilitarLimiteHorasImportacao FROM TBGrupoEquipamentos WHERE Id = '<GrupoId>'`
3. **Verificar config global:** `SELECT * FROM TBConfiguracoes WHERE TipoConfiguracao LIKE '%Limite%'`
4. **Verificar quem alterou:** `SELECT DataAtualizacao, AtualizadoPor FROM TBConfiguracoes WHERE TipoConfiguracao LIKE '%Limite%'`

### 8.2. Verificações no código (.NET)

1. **Localizar o serviço de importação** que valida o limite de horas
2. **Verificar a ordem de precedência:** equipamento → grupo → global
3. **Verificar se há cache** da configuração que não atualizou após a desabilitação
4. **Verificar logs da API** — qual mensagem de erro retorna quando rejeita

### 8.3. Verificações com o fabricante

1. **Solicitar documentação de limites** da API do fabricante
2. **Verificar código de erro HTTP** retornado — se é 429 (Too Many Requests) é rate limit do fabricante
3. **Se é 400/422** com mensagem sobre "limite" — é o AxHub rejeitando
4. **Verificar volume de envio** — quantas passagens o fabricante está enviando por requisição

---

## 9. Possíveis Causas Raiz

| # | Causa | Evidência para confirmar | Ação |
|---|-------|------------------------|------|
| 1 | **Flag não está realmente marcado** (visual vs banco) | Query mostra `DesabilitarLimiteHorasImportacao = 0` | Marcar o flag no banco/tela |
| 2 | **Grupo sobrescreve equipamento** (ou vice-versa) | Lógica no código usa AND ao invés de OR | Corrigir para OR (qualquer nível desabilita) |
| 3 | **Config global reativada** | `TBConfiguracoes` tem valor > 0 recente | Verificar quem alterou, zerar ou desabilitar |
| 4 | **Cache de configuração** | Flag alterado mas sistema não recarregou | Reiniciar aplicação / limpar cache |
| 5 | **Deploy recente alterou lógica** | Código novo tem verificação diferente | Comparar commits recentes |
| 6 | **Limite no fabricante (não no AxHub)** | Erro vem da API do fabricante, não do sistema | Contatar fabricante |
| 7 | **Exceção (TBExcecoes) habilitada** | Exceção automática descartando por outro motivo | Verificar exceções ativas |

---

## 10. Validação de Volume de Passagens

### 10.1. Como calcular se o volume está dentro do esperado

```sql
-- Média diária dos últimos 30 dias (referência)
SELECT 
    e.Codigo,
    AVG(sub.TotalDia) AS MediaDiaria,
    MAX(sub.TotalDia) AS PicoDiario,
    MIN(sub.TotalDia) AS MinimoDiario
FROM (
    SELECT 
        p.Equipamento_id,
        CAST(p.DataHoraPassagem AS DATE) AS Dia,
        COUNT(*) AS TotalDia
    FROM TBPassagens p
    WHERE p.DataHoraPassagem >= DATEADD(DAY, -30, GETDATE())
    GROUP BY p.Equipamento_id, CAST(p.DataHoraPassagem AS DATE)
) sub
JOIN TBEquipamentos e ON sub.Equipamento_id = e.Id
GROUP BY e.Codigo
ORDER BY MediaDiaria DESC
```

### 10.2. Detectar anomalias (dias sem dados)

```sql
-- Dias SEM passagens nos últimos 30 dias (equipamento específico)
;WITH Dias AS (
    SELECT CAST(DATEADD(DAY, -n, GETDATE()) AS DATE) AS Dia
    FROM (SELECT TOP 30 ROW_NUMBER() OVER(ORDER BY (SELECT NULL))-1 AS n FROM sys.objects) x
),
PassagensDia AS (
    SELECT CAST(p.DataHoraPassagem AS DATE) AS Dia, COUNT(*) AS Total
    FROM TBPassagens p
    WHERE p.Equipamento_id = '<EQUIPAMENTO_ID>'
      AND p.DataHoraPassagem >= DATEADD(DAY, -30, GETDATE())
    GROUP BY CAST(p.DataHoraPassagem AS DATE)
)
SELECT d.Dia, ISNULL(pd.Total, 0) AS Passagens,
       CASE WHEN pd.Total IS NULL THEN '❌ SEM DADOS' ELSE '✅ OK' END AS Status
FROM Dias d
LEFT JOIN PassagensDia pd ON d.Dia = pd.Dia
ORDER BY d.Dia DESC
```

---

## 11. Limites Conhecidos por Fabricante (Pesquisa Necessária)

> ⚠️ **AÇÃO PENDENTE:** Solicitar documentação técnica ao fabricante do equipamento afetado.

### 11.1. Informações a coletar

| Dado | Pergunta | Por que é importante |
|------|----------|---------------------|
| Rate limit | Quantas req/min aceita a API? | Se excede, fabricante rejeita (HTTP 429) |
| Batch size | Máx passagens por requisição? | Lotes grandes podem ser rejeitados |
| Payload size | Máx KB/MB por request? | Imagens + dados podem exceder |
| Daily cap | Limite diário de envio? | Equipamentos de alto fluxo podem bater |
| Retry policy | Fabricante reenvia dados rejeitados? | Se não, dados são perdidos |
| Offline buffer | Máx dias de acúmulo offline? | Tablet/MiniPC tem limite de storage |
| Error codes | Quais códigos retorna ao AxHub? | Para diferenciar erro do fabricante vs AxHub |

### 11.2. Fabricantes com documentação a solicitar

| Fabricante | Contato | Status |
|-----------|---------|--------|
| *(identificar pelo equipamento afetado)* | | ⏳ Pendente |

---

## 12. Decisão e Recomendação

| # | Opção | Risco | Esforço |
|---|-------|-------|---------|
| 1 | **Investigar e corrigir o flag** (verificar banco/cache/lógica) | Baixo | Baixo |
| 2 | **Desabilitar limite global** (TBConfiguracoes valor = 0) | Médio (sem proteção temporal) | Imediato |
| 3 | **Corrigir hierarquia de verificação** (OR entre níveis) | Baixo | Médio |
| 4 | **Implementar alerta ao invés de bloqueio** | Baixo | Médio |
| 5 | **Contatar fabricante sobre limites de API** | - | Depende do fabricante |

### ✅ Recomendação: Abordagem em 3 passos

**PASSO 1 (imediato):** Executar queries de diagnóstico (seção 6) para identificar a causa exata. Verificar se o flag está realmente marcado no banco e se a config global foi alterada.

**PASSO 2 (correção):** Se o flag está marcado mas não está sendo respeitado → é bug no código (cache ou lógica de precedência). Se o flag NÃO está marcado → é erro operacional (marcar novamente).

**PASSO 3 (fabricante):** Se o bloqueio NÃO vem do AxHub (código HTTP do fabricante), contatar fabricante para entender limites de volume da API.

---

## 13. Conclusão

| Aspecto | Conclusão |
|---------|-----------|
| **O recurso estava desabilitado?** | Verificar no banco — pode ser discrepância visual vs dado real |
| **Por que voltou a bloquear?** | 3 possibilidades: config global alterada, cache não atualizado, ou é limite do fabricante (não do AxHub) |
| **Risco de perda de dados?** | **SIM** — passagens rejeitadas podem ser irrecuperáveis se fabricante não reenvia |
| **Próximo passo?** | Executar queries de diagnóstico e identificar se bloqueio vem do AxHub ou do fabricante |

---

## 14. Pontos de Atenção para o Suporte

1. **Diferenciar erro do AxHub vs erro do fabricante** — verificar código HTTP no log
2. **Se flag está marcado mas não funciona** — pode ser cache (reiniciar o application pool / serviço IIS)
3. **Equipamentos que operam offline** (tablets de blitz) → DEVEM ter o flag desabilitado
4. **Volume alto após reconexão é NORMAL** — não é ataque, é backlog acumulado
5. **Se o fabricante tem rate limit** — implementar queue no AxHub para envio gradual
