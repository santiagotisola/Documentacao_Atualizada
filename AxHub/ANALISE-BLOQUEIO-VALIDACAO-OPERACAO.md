# Análise Completa: Bloqueio Automático por Falhas de Validação — Operação THE128M

**Data:** 26/05/2026  
**Equipamento:** THE128M  
**Localização:** AV. PROF. CAMILO FILHO X RUA FLÔR DO TEMPO, -, -  
**Módulo:** Operações → Aba BLOQUEIO  
**Versão AxHub:** v.1.2.0  
**Severidade:** Bloqueio recorrente — desbloqueio manual não resolve (rebloqueia em 2 minutos)  
**Versão do documento:** 2.0 — Baseada na imagem real do erro

---

## 1. O Que Está Acontecendo (dados da tela)

### 1.1. Mensagem de erro

```
Bloqueio automatico apos 10 falhas consecutivas de validacao.
Ultimo erro: A data e hora (26/04/2026 14:40:55) ocorrem antes o início
da operação do equipamento 27/04/2026 00:00:00
```

### 1.2. Dados do bloqueio

| Campo | Valor |
|-------|-------|
| Equipamento | THE128M |
| Status | 🔴 Bloqueada |
| Bloqueada em | 26/05/2026 13:32 |
| Falhas consecutivas | 10 |
| Última passagem rejeitada | 26/04/2026 14:40:55 |
| Início da operação | 27/04/2026 00:00:00 |
| Diferença | Passagem é **9h19min ANTES** do início da operação |

### 1.3. Histórico de bloqueios

| Data/Hora | Ação | Motivo | Usuário |
|-----------|------|--------|---------|
| 26/05/2026 13:32:48 | 🔴 Bloqueio Automático | 10 falhas - data 26/04 antes de 27/04 | Sistema |
| 26/05/2026 13:30:59 | 🟢 Desbloqueio | "Equipamento estava com problema na api" | Francisco Mauricio de Sousa |
| 23/05/2026 09:52:37 | 🔴 Bloqueio Automático | 10 falhas - mesma mensagem | Sistema |

**⚠️ PADRÃO:** Desbloqueio manual → rebloqueia 2 minutos depois. Desbloquear não resolve porque os dados antigos continuam chegando.

---

## 2. Análise da Causa Raiz

### 2.1. O mecanismo de validação

O AxHub valida CADA passagem/infração recebida via API do fabricante:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PASSAGEM RECEBIDA: DataHoraPassagem = 26/04/2026 14:40:55              │
│                                                                         │
│  VERIFICAÇÃO: DataHoraPassagem >= Operação.DataInicial ?                │
│                                                                         │
│  Operação.DataInicial = 27/04/2026 00:00:00                             │
│                                                                         │
│  26/04/2026 14:40:55 >= 27/04/2026 00:00:00 ?                          │
│  ❌ NÃO → FALHA DE VALIDAÇÃO                                           │
│                                                                         │
│  Falha #1, #2, #3 ... #10 → 🔴 BLOQUEIO AUTOMÁTICO                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Por que a passagem é de 26/04 se a operação começa em 27/04?

| # | Hipótese | Probabilidade | Evidência |
|---|----------|---------------|-----------|
| H1 | **Equipamento já estava operando antes da oficialização** — capturou dados no dia 26/04 mas a operação só foi registrada formalmente a partir de 27/04 | **ALTA** | Passagem tem data real (14:40:55 = horário normal de operação) |
| H2 | **Data de início da operação incorreta** — deveria ser 26/04 e não 27/04 | **MÉDIA** | Operação pode ter sido cadastrada com 1 dia de atraso |
| H3 | **Fabricante reenviando lote antigo** — passagens do dia 26/04 que ficaram presas e agora estão sendo retransmitidas | **MÉDIA** | Bloqueio acontece 30 dias depois (26/05) — dados antigos acumulados |
| H4 | **Relógio do equipamento desconfigurado** — equipamento marcou 26/04 quando na verdade era 27/04 | **BAIXA** | Diferença de apenas 9h19min (não é fuso horário) |
| H5 | **Buffer do fabricante** — API do fabricante envia dados em fila, incluindo dados anteriores ao início formal | **MÉDIA** | Normal em equipamentos que transitam entre operações |

### 2.3. Diagnóstico mais provável

```
┌──────────────────────────────────────────────────────────────────────┐
│  CAUSA MAIS PROVÁVEL: Hipótese H1 + H3 combinadas                    │
│                                                                      │
│  O equipamento THE128M foi instalado/ativado em 26/04/2026, mas a   │
│  operação no AxHub foi registrada com DataInicial = 27/04/2026.       │
│  As passagens capturadas no dia 26/04 ficaram no buffer do           │
│  fabricante. Ao tentar transmiti-las agora (30 dias depois), o        │
│  sistema rejeita porque são ANTERIORES ao início formal da operação.  │
│                                                                      │
│  Como o fabricante continua reenviando (retry automático), o         │
│  desbloqueio manual é inútil — bloqueia novamente em minutos.        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Dados para Validação (SQL Server)

### 3.1. Confirmar a data de início da operação

```sql
-- Verificar a operação do equipamento THE128M
SELECT 
    op.Id,
    e.Codigo AS Equipamento,
    op.DataInicial,
    op.DataFinal,
    op.DataInstalacao,
    op.DataAceite,
    op.DataCriacao,
    op.CriadoPor
FROM TBOperacoes op
JOIN TBEquipamentos e ON op.Equipamento_id = e.Id
WHERE e.Codigo = 'THE128M'
ORDER BY op.DataInicial DESC
```

### 3.2. Verificar passagens que estão sendo rejeitadas

```sql
-- Passagens com data ANTES do início da operação
SELECT TOP 50
    p.Id,
    p.DataHoraPassagem,
    p.DataCriacao AS DataRecebimento,
    e.Codigo AS Equipamento
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = 'THE128M'
  AND p.DataHoraPassagem < '2026-04-27 00:00:00'
ORDER BY p.DataHoraPassagem DESC
```

### 3.3. Verificar quantas passagens estão na "fila" do fabricante

```sql
-- Volume de passagens por dia do equipamento
SELECT 
    CAST(p.DataHoraPassagem AS DATE) AS Dia,
    COUNT(*) AS TotalPassagens,
    MIN(p.DataHoraPassagem) AS Primeira,
    MAX(p.DataHoraPassagem) AS Ultima
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = 'THE128M'
  AND p.DataHoraPassagem >= '2026-04-25'
  AND p.DataHoraPassagem <= '2026-04-28'
GROUP BY CAST(p.DataHoraPassagem AS DATE)
ORDER BY Dia
```

### 3.4. Verificar fabricante e modelo

```sql
SELECT 
    e.Codigo, e.NumeroSerie,
    f.Nome AS Fabricante,
    m.Marca, m.Modelo, m.NumeroPortaria,
    e.DesabilitarLimiteHorasImportacao
FROM TBEquipamentos e
JOIN TBModeloEquipamentos m ON e.ModeloEquipamento_id = m.Id
JOIN TBFabricantes f ON m.Fabricante_id = f.Id
WHERE e.Codigo = 'THE128M'
```

---

## 4. Soluções Possíveis

### 4.1. Opção A — Ajustar a data de início da operação (mais rápida)

**Ação:** Alterar `DataInicial` da operação de `27/04/2026 00:00:00` para `26/04/2026 00:00:00` (ou 26/04/2026 14:00:00)

```sql
-- CUIDADO: Verificar impacto antes de executar
UPDATE TBOperacoes
SET DataInicial = '2026-04-26 00:00:00',
    DataAtualizacao = GETDATE(),
    AtualizadoPor = 'Suporte - Ajuste data bloqueio THE128M'
WHERE Id = '<ID_DA_OPERACAO>'
  AND Equipamento_id = (SELECT Id FROM TBEquipamentos WHERE Codigo = 'THE128M')
```

| Prós | Contras |
|------|---------|
| Resolve imediatamente | Muda a data oficial da operação |
| Passagens do dia 26/04 serão aceitas | Pode afetar medição contratual |
| Desbloqueio natural | Precisa confirmar com gestão que operação realmente iniciou em 26/04 |

### 4.2. Opção B — Fazer o fabricante parar de reenviar dados antigos

**Ação:** Contatar o fabricante e solicitar que descarte os dados de 26/04/2026 do buffer de retry.

| Prós | Contras |
|------|---------|
| Não altera nada no AxHub | Depende do fabricante |
| Dados antigos são descartados | Pode demorar |
| Operação mantém data original | Perda de passagens legítimas do dia 26/04 |

### 4.3. Opção C — Desbloquear e ignorar passagens antigas (workaround)

**Ação:** Desbloquear a operação E solicitar ao fabricante que descarte o lote pendente, OU aguardar o fabricante esgotar as retentativas.

### 4.4. Opção D — Implementar tolerância na validação (desenvolvimento)

**Ação:** Alterar a lógica de validação para aceitar passagens com X horas de margem antes da DataInicial.

```csharp
// ANTES (atual):
if (passagem.DataHora < operacao.DataInicial)
    throw new ValidationException("Data antes do início da operação");

// DEPOIS (com tolerância):
var toleranciaHoras = config.ToleranciaHorasInicioOperacao ?? 24;
if (passagem.DataHora < operacao.DataInicial.AddHours(-toleranciaHoras))
    throw new ValidationException("Data antes do início da operação (com tolerância)");
```

| Prós | Contras |
|------|---------|
| Resolve casos de data de instalação vs operação | Precisa de desenvolvimento |
| Configurável por sistema | Pode aceitar dados indesejados |
| Não precisa ajustar operação | Precisa definir margem padrão |

### 4.5. Opção E — Descartar passagens anteriores ao início (melhor longo prazo)

**Ação:** Em vez de BLOQUEAR a operação por dados antigos, simplesmente DESCARTAR as passagens que são anteriores ao início e continuar processando as válidas.

```csharp
// ANTES: Bloqueia tudo após 10 falhas
// DEPOIS: Descarta o que é anterior e continua

if (passagem.DataHora < operacao.DataInicial) {
    // Log + descarta silenciosamente
    logger.Warn($"Passagem {passagem.DataHora} anterior ao início da operação. Descartada.");
    return; // Não conta como falha, não bloqueia
}
```

| Prós | Contras |
|------|---------|
| ✅ Resolve definitivamente | Precisa de deploy |
| ✅ Não bloqueia operação por dados antigos | Perde passagens do período anterior |
| ✅ Passagens válidas continuam entrando | Precisa de log para auditoria |
| ✅ Fabricante pode continuar reenviando | - |

---

## 5. Análise de Riscos

### 5.1. Riscos de manter bloqueado

| # | Risco | Impacto | Probabilidade |
|---|-------|---------|---------------|
| R1 | **Passagens NOVAS não entram** — bloqueio impede TODAS as importações | Crítico | Certa |
| R2 | **Perda de infrações** — nenhuma infração é gerada enquanto bloqueado | Alto | Certa |
| R3 | **Gap no relatório de fluxo** — dias sem dados aparecem como "offline" | Médio | Certa |
| R4 | **Descumprimento contratual** — equipamento não produz durante bloqueio | Alto | Alta |
| R5 | **Desbloqueio manual vira rotina** — suporte precisa intervir repetidamente | Médio | Certa (já acontecendo) |

### 5.2. Riscos de ajustar a data (Opção A)

| # | Risco | Impacto | Mitigação |
|---|-------|---------|-----------|
| R6 | **Medição contratual afetada** — se o contrato começa em 27/04, alterar para 26/04 inclui 1 dia extra | Baixo | Confirmar com gestão que a operação real iniciou em 26/04 |
| R7 | **Auditoria questiona** — data diferente do documento oficial | Baixo | Registrar justificativa no campo AtualizadoPor |
| R8 | **Precedente para outros ajustes** | Baixo | Documentar como exceção |

### 5.3. Riscos para o motorista

| Cenário | Impacto | Análise |
|---------|---------|---------|
| Infração registrada em 26/04 (antes da operação oficial) | Pode ser contestada juridicamente | **A operação precisa estar vigente na data da infração** — CTB Art. 280 |
| Infração registrada em 27/04+ (após início) | Sem impacto | Normal — dentro da vigência |

**⚠️ ATENÇÃO JURÍDICA:** Se a DataInicial for alterada para 26/04, infrações desse dia passam a ser válidas no sistema. Mas se a **Portaria de operação** do órgão autuador só autoriza a partir de 27/04, essas infrações NÃO têm validade legal mesmo estando no sistema.

---

## 6. Informações a Solicitar ao Fabricante

| # | Pergunta | Motivo |
|---|----------|--------|
| 1 | **Qual o volume de passagens pendentes de THE128M?** | Saber quanto dado antigo está na fila |
| 2 | **Há passagens de 26/04/2026 no buffer de retry?** | Confirmar se é isso que está causando as falhas |
| 3 | **É possível descartar o buffer de dados anteriores a 27/04?** | Resolver sem alterar o AxHub |
| 4 | **Quantas tentativas de reenvio o fabricante faz?** | Saber quando vai parar sozinho |
| 5 | **Qual o intervalo entre retentativas?** | Explica por que bloqueia 2 min após desbloqueio |
| 6 | **É possível configurar um "start date" no equipamento?** | Evitar que o equipamento envie dados anteriores |

---

## 7. Validação de Quantidade de Passagens

### 7.1. O que verificar

O erro mostra passagem de **26/04/2026 14:40:55**. Precisamos saber:

```sql
-- Quantas passagens do dia 26/04 existem no buffer do fabricante?
-- (Esta informação precisa vir do fabricante)

-- No AxHub, verificar o que já entrou:
SELECT 
    CAST(p.DataHoraPassagem AS DATE) AS Dia,
    COUNT(*) AS Importadas,
    MIN(p.DataHoraPassagem) AS Primeira,
    MAX(p.DataHoraPassagem) AS Ultima
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = 'THE128M'
  AND p.DataHoraPassagem >= '2026-04-26'
  AND p.DataHoraPassagem < '2026-04-28'
GROUP BY CAST(p.DataHoraPassagem AS DATE)
```

### 7.2. Volume esperado vs observado

Comparar com a média do equipamento:

```sql
-- Média diária de THE128M nos últimos 30 dias (após o início)
SELECT 
    AVG(sub.Total) AS MediaDiaria,
    MAX(sub.Total) AS Pico,
    MIN(sub.Total) AS Minimo
FROM (
    SELECT CAST(p.DataHoraPassagem AS DATE) AS Dia, COUNT(*) AS Total
    FROM TBPassagens p
    JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
    WHERE e.Codigo = 'THE128M'
      AND p.DataHoraPassagem >= '2026-04-27'
    GROUP BY CAST(p.DataHoraPassagem AS DATE)
) sub
```

---

## 8. Decisão e Recomendação

| # | Opção | Prazo | Risco | Resolve definitivamente? |
|---|-------|-------|-------|--------------------------|
| A | Ajustar DataInicial para 26/04 | Imediato (1 UPDATE) | Baixo | ✅ Se dados são só do dia 26/04 |
| B | Fabricante descarta buffer antigo | 1-3 dias (depende deles) | Nulo | ✅ Se fabricante aceitar |
| C | Aguardar retries esgotarem | Indefinido | Alto (produção parada) | ❌ Pode demorar muito |
| D | Tolerância na validação (dev) | 1-2 sprints | Baixo | ✅ Sistêmico |
| E | Descartar ao invés de bloquear (dev) | 1-2 sprints | Baixo | ✅ **MELHOR solução longo prazo** |

### ✅ Recomendação em 2 Etapas:

**IMEDIATO (resolver agora):**
- **Opção A** — Ajustar DataInicial para 26/04/2026 (se confirmado que equipamento operou nesse dia)
- **OU Opção B** — Contatar fabricante para limpar o buffer

**DESENVOLVIMENTO (resolver de forma sistêmica):**
- **Opção E** — Alterar lógica para DESCARTAR passagens anteriores ao início da operação ao invés de BLOQUEAR. Passagens fora do período não devem travar toda a operação — devem ser silenciosamente descartadas com log.

---

## 9. Conclusão

| Aspecto | Conclusão |
|---------|-----------|
| **Qual o erro?** | Fabricante envia passagens de 26/04/2026, operação começa em 27/04/2026 |
| **Por que não resolve desbloqueando?** | Fabricante continua reenviando os mesmos dados → rebloqueia em minutos |
| **O recurso estava "desabilitado"?** | Não é o "Limite de Horas" — é a validação de período da operação (sempre ativa) |
| **Risco para o motorista?** | Se ajustar a data: infrações de 26/04 só são válidas se Portaria do órgão cobre esse dia |
| **Solução definitiva?** | Sistema deve DESCARTAR (não bloquear) passagens fora do período |
| **Ação imediata?** | Ajustar DataInicial OU contatar fabricante para limpar buffer |

---

## 10. Pontos de Atenção para o Suporte

1. **DESBLOQUEAR MANUALMENTE NÃO RESOLVE** — o fabricante vai reenviar e bloquear novamente
2. **O erro NÃO é sobre "Limite de Horas"** — é sobre data ANTES do início da operação
3. **O dado de 26/04 pode estar em loop de retry no fabricante** — precisa ser descartado na origem
4. **Verificar a Portaria do órgão autuador** antes de ajustar a data da operação — infração só é válida se a operação estiver autorizada oficialmente
5. **Se o equipamento foi instalado antes da formalização** — situação comum em implantações novas (equipamento fica "em teste" antes da operação oficial)
