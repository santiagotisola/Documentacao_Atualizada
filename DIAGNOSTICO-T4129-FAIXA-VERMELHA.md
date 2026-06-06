# Diagnóstico Técnico — Equipamento T4129 (STRANS)
## Registro Indevido de Imagens com Sinal Verde

**Chamado:** [Ticket #99803729](https://desk.axiontecnologia.com.br/Ticket/99803729)  
**Sistema:** [STRANS AxHub](https://strans.axhub.axion.ws/)  
**Equipamento:** T4129 (Vizentec)  
**Data do Relato:** 02/06/2026  
**Volume reportado:** 2.494 imagens em um único dia — todas com sinal VERDE  
**Severidade:** 🔴 Alta — equipamento potencialmente inoperante para fiscalização

---

## 1. O Que São "Faixas Vermelhas" (Contexto Técnico)

### 1.1. Definição

"Faixa vermelha" ou "sinal vermelho" refere-se ao **enquadramento de infração por avanço de sinal semafórico** — Art. 208 do CTB (Código de Trânsito Brasileiro):

> **"Avançar o sinal vermelho do semáforo"** — Infração gravíssima (7 pontos, multa de R$ 293,47)

### 1.2. Como Funciona a Fiscalização Eletrônica de Sinal Vermelho

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUXO DE DETECÇÃO — SINAL VERMELHO                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐     ┌─────────────────┐     ┌──────────────────┐    │
│  │   CONTROLADOR    │     │   DETECTOR DE   │     │     CÂMERA       │    │
│  │   SEMAFÓRICO     │────▶│   LAÇO INDUTIVO │────▶│   OCR (T4129)    │    │
│  │  (estado: R/G/Y) │     │   (presença)    │     │  (captura imagem)│    │
│  └──────────────────┘     └─────────────────┘     └──────────────────┘    │
│                                                                             │
│  LÓGICA DE DISPARO:                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │  SE (sinal == VERMELHO) E (veículo_detectado == TRUE)            │       │
│  │  ENTÃO → Capturar imagem (Zoom + Panorâmica)                     │       │
│  │  SENÃO → Ignorar (passagem normal em verde/amarelo)              │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  DADOS CAPTURADOS:                                                          │
│  • Imagem ZOOM (Z) — placa do veículo                                      │
│  • Imagem PANORÂMICA (P) — contexto do cruzamento + semáforo visível       │
│  • Data/hora da passagem                                                    │
│  • Estado do sinal no momento (deve ser VERMELHO)                           │
│  • Tempo de vermelho decorrido (importante para validade legal)             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3. Requisitos Legais (Portaria DENATRAN 16/2004 + Resolução CONTRAN 985/2022)

| Requisito | Descrição |
|-----------|-----------|
| **Estado do sinal** | Imagem deve mostrar semáforo VERMELHO visível |
| **Tempo mínimo** | Captura só pode ocorrer após tempo mínimo de vermelho (geralmente 1-3s) |
| **Duas imagens** | Obrigatório registrar posição do veículo (antes e depois da linha de retenção) |
| **Certificação** | Equipamento deve ter aferição INMETRO válida |
| **Controlador** | Câmera deve estar conectada ao controlador semafórico |

---

## 2. Diagnóstico do Problema — T4129 Registrando em Sinal Verde

### 2.1. Dados do Equipamento

| Campo | Valor |
|-------|-------|
| **Código** | T4129 |
| **Fabricante** | Vizentec |
| **Tipos de imagem** | Z (Zoom) + P (Panorâmica) |
| **Tipo de equipamento** | OCR (câmera de fiscalização semafórica) |
| **Sistema** | STRANS (Teresina/PI) |
| **Outros Vizentec no site** | T1120, T1114, T1115, T4114 |

### 2.2. Hipóteses de Causa (ordenadas por probabilidade)

| # | Hipótese | Probabilidade | Impacto | Verificação |
|---|----------|:---:|---------|-------------|
| **H1** | **Perda de comunicação com controlador semafórico** — Cabo de sinal rompido ou desconectado. Sem sinal do controlador, equipamento entra em "modo contínuo" e registra TODAS as passagens | 🔴 **ALTA** | Crítico | Verificar status do cabo/comunicação com controlador |
| **H2** | **Parametrização incorreta no equipamento** — Trigger de captura configurado para "qualquer passagem" em vez de "somente sinal vermelho" | 🟡 **MÉDIA** | Crítico | Verificar configuração do trigger no equipamento |
| **H3** | **Falha no detector de laço indutivo** — Detector disparando continuamente (curto-circuito ou falha de hardware) | 🟡 **MÉDIA** | Crítico | Verificar detector de presença veicular |
| **H4** | **Firmware/software desatualizado ou corrompido** — Bug no firmware da Vizentec causando registro contínuo | 🟡 **MÉDIA** | Crítico | Verificar versão do firmware vs outros Vizentec |
| **H5** | **Controlador semafórico informando estado incorreto** — Controlador com defeito reportando "vermelho" quando está "verde" | 🟠 **BAIXA-MÉDIA** | Crítico | Verificar sincronismo controlador × semáforo real |
| **H6** | **Configuração de "faixa invertida"** — Faixa monitorada está com mapeamento invertido (via oposta) | 🟠 **BAIXA** | Moderado | Verificar sentido da faixa no cadastro |
| **H7** | **Exceção/regra de operação incorreta** — Operação configurada como "fluxo" em vez de "semáforo" | 🟠 **BAIXA** | Moderado | Verificar enquadramento da operação no AxHub |

### 2.3. Cenário Mais Provável: H1 (Perda de Comunicação com Controlador)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  COMPORTAMENTO NORMAL (equipamento conectado ao controlador):               │
│                                                                             │
│  Controlador → VERDE → Câmera INATIVA (não captura)                        │
│  Controlador → AMARELO → Câmera INATIVA (não captura)                      │
│  Controlador → VERMELHO → Câmera ATIVA (captura veículos que passam)       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  COMPORTAMENTO COM FALHA (comunicação perdida):                             │
│                                                                             │
│  Controlador → ??? (sem sinal) → Equipamento interpreta como:              │
│                                                                             │
│  MODO 1 (fail-open): Registra TUDO → 🔴 Este é o cenário relatado         │
│  MODO 2 (fail-closed): Não registra nada → equipamento "morto"             │
│                                                                             │
│  A Vizentec tipicamente opera em MODO 1 (fail-open), explicando as         │
│  2.494 imagens em um único dia com sinal verde.                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Evidência que suporta H1:**
- Volume MUITO alto (2.494/dia) — compatível com fluxo contínuo de veículos
- TODAS as imagens com sinal verde — se fosse problema intermitente, haveria mistura
- Equipamentos Vizentec similares (T1120, T1114, T1115, T4114) provavelmente não apresentam o mesmo problema

---

## 3. Como Configurar / Verificar no AxHub

### 3.1. Verificar Operação do Equipamento

```
Menu lateral → Operações → Cadastro de Operações
→ Filtrar por equipamento T4129
→ Verificar:
   • Data Início / Data Fim (operação ativa?)
   • Enquadramentos vinculados (deve ter "Avanço de sinal" / código 7633 ou similar)
   • Status da operação (Ativa / Bloqueada?)
```

### 3.2. Verificar Tipo de Equipamento

```
Menu lateral → Equipamentos → Tipos de Equipamentos
→ Localizar o tipo vinculado ao T4129
→ Verificar "Forma de Atuação":
   • Deve incluir tipo de infração "Semáforo" ou "Avanço de Sinal"
   • Se estiver configurado como "Velocidade" ou "Fluxo", não valida corretamente
```

### 3.3. Verificar Faixas

```
Menu lateral → Operações → Faixas
→ Filtrar por T4129
→ Verificar:
   • Número da Faixa
   • Sentido (N, S, L, O) — deve corresponder ao sentido real do trânsito
   • Se está ativa
```

### 3.4. Monitoramento Online

```
Menu lateral → Operações → Monitoramento Online
→ Verificar T4129:
   • Status (Online/Offline)
   • Última comunicação
   • Volume de passagens/dia (2.494 é anormalmente alto para semáforo)
```

---

## 4. Scripts SQL de Diagnóstico

> ⚠️ **Executar no banco STRANS (SQL Server)**

### 4.1. Identificar Equipamento T4129 e Configuração

```sql
-- ═══════════════════════════════════════════════════════════
-- PARTE 1: IDENTIFICAÇÃO COMPLETA DO T4129
-- ═══════════════════════════════════════════════════════════

-- 1.1 Dados do equipamento
SELECT 
    e.Id AS Equipamento_Id,
    e.Codigo,
    e.NumeroSerie,
    e.NumeroCertificadoInmetro,
    e.EmissaoCertificadoInmetro,
    e.VencimentoCertificadoInmetro,
    e.ModoOperacao,
    e.DesabilitarLimiteHorasImportacao,
    f.Nome AS Fabricante,
    te.Nome AS TipoEquipamento,
    me.Marca AS ModeloMarca,
    me.Modelo AS ModeloNome,
    ge.Nome AS GrupoEquipamento
FROM TBEquipamentos e
LEFT JOIN TBModeloEquipamentos me ON e.ModeloEquipamento_id = me.Id
LEFT JOIN TBFabricantes f ON me.Fabricante_id = f.Id
LEFT JOIN TBTipoEquipamentos te ON e.TipoEquipamento_id = te.Id
LEFT JOIN TBGrupoEquipamentos ge ON e.GrupoEquipamento_id = ge.Id
WHERE e.Codigo = 'T4129';

-- 1.2 Operação ativa do equipamento
SELECT 
    op.Id AS Operacao_Id,
    op.DataInicial,
    op.DataFinal,
    op.Status,
    e.Codigo AS Equipamento,
    op.DataCriacao,
    op.DataAtualizacao
FROM TBOperacoes op
JOIN TBEquipamentos e ON op.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
ORDER BY op.DataInicial DESC;

-- 1.3 Enquadramentos vinculados à operação
SELECT 
    e.Codigo AS Equipamento,
    enq.Codigo AS CodigoEnquadramento,
    enq.Descricao,
    enq.TipoInfracao,
    enq.ArtigoCtb,
    enq.GravidadeInfracao
FROM TBOperacoes op
JOIN TBEquipamentos eq ON op.Equipamento_id = eq.Id
JOIN TBOperacoesEnquadramentos oe ON op.Id = oe.Operacao_id
JOIN TBEnquadramentos enq ON oe.Enquadramento_id = enq.Id
JOIN TBEquipamentos e ON op.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
  AND (op.DataFinal IS NULL OR op.DataFinal >= GETDATE())
ORDER BY enq.Codigo;

-- 1.4 Faixas vinculadas
SELECT 
    f.Id AS Faixa_Id,
    f.NumeroFaixa,
    f.Sentido,
    f.Codigo AS CodigoFaixa,
    f.Logradouro,
    f.Bairro,
    f.Municipio
FROM TBFaixas f
JOIN TBInfracoes i ON f.Id = i.Faixa_id
JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
GROUP BY f.Id, f.NumeroFaixa, f.Sentido, f.Codigo, f.Logradouro, f.Bairro, f.Municipio;
```

### 4.2. Análise do Volume de Registros (Confirmar Anomalia)

```sql
-- ═══════════════════════════════════════════════════════════
-- PARTE 2: VOLUME DE PASSAGENS — Últimos 30 dias
-- ═══════════════════════════════════════════════════════════

-- 2.1 Passagens por dia — T4129 (últimos 30 dias)
SELECT 
    CAST(p.DataHoraPassagem AS DATE) AS Data,
    COUNT(*) AS TotalPassagens,
    COUNT(p.Infracao_id) AS PassagensComInfracao,
    MIN(p.DataHoraPassagem) AS PrimeiraPassagem,
    MAX(p.DataHoraPassagem) AS UltimaPassagem
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
  AND p.DataHoraPassagem >= DATEADD(DAY, -30, GETDATE())
GROUP BY CAST(p.DataHoraPassagem AS DATE)
ORDER BY Data;

-- 2.2 Passagens conjugadas por dia (imagens capturadas)
SELECT 
    CAST(pc.DataHoraPassagem AS DATE) AS Data,
    COUNT(*) AS TotalImagens,
    SUM(CASE WHEN pc.FoiGeradaInfracao = 1 THEN 1 ELSE 0 END) AS GeraramInfracao,
    SUM(CASE WHEN pc.FoiGeradaInfracao = 0 THEN 1 ELSE 0 END) AS NaoGeraramInfracao
FROM TBPassagensConjugadas pc
JOIN TBEquipamentos e ON pc.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
  AND pc.DataHoraPassagem >= DATEADD(DAY, -30, GETDATE())
GROUP BY CAST(pc.DataHoraPassagem AS DATE)
ORDER BY Data;

-- 2.3 Infrações por dia e status
SELECT 
    CAST(i.DataHoraPassagem AS DATE) AS Data,
    COUNT(*) AS TotalInfracoes,
    SUM(CASE WHEN i.StatusProcessamento = 'Triagem' THEN 1 ELSE 0 END) AS EmTriagem,
    SUM(CASE WHEN i.StatusProcessamento = 'Descartada' THEN 1 ELSE 0 END) AS Descartadas,
    SUM(CASE WHEN i.StatusProcessamento = 'Auditada' THEN 1 ELSE 0 END) AS Auditadas,
    SUM(CASE WHEN i.StatusProcessamento = 'Exportada' THEN 1 ELSE 0 END) AS Exportadas
FROM TBInfracoes i
JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
  AND i.DataHoraPassagem >= DATEADD(DAY, -30, GETDATE())
  AND (i.IsDeleted IS NULL OR i.IsDeleted = 0)
GROUP BY CAST(i.DataHoraPassagem AS DATE)
ORDER BY Data;
```

### 4.3. Detectar QUANDO o Problema Começou

```sql
-- ═══════════════════════════════════════════════════════════
-- PARTE 3: IDENTIFICAR INÍCIO DO PROBLEMA
-- ═══════════════════════════════════════════════════════════

-- 3.1 Média diária de passagens nos últimos 90 dias (para baseline)
SELECT 
    DATEPART(WEEK, p.DataHoraPassagem) AS Semana,
    MIN(CAST(p.DataHoraPassagem AS DATE)) AS InicioSemana,
    MAX(CAST(p.DataHoraPassagem AS DATE)) AS FimSemana,
    COUNT(*) AS TotalPassagens,
    COUNT(*) / NULLIF(COUNT(DISTINCT CAST(p.DataHoraPassagem AS DATE)), 0) AS MediaDiaria
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
  AND p.DataHoraPassagem >= DATEADD(DAY, -90, GETDATE())
GROUP BY DATEPART(WEEK, p.DataHoraPassagem)
ORDER BY Semana;

-- 3.2 Detectar pico anômalo (dia com mais de 1000 passagens = possível falha)
SELECT 
    CAST(p.DataHoraPassagem AS DATE) AS Data,
    COUNT(*) AS TotalPassagens,
    CASE 
        WHEN COUNT(*) > 1500 THEN '🔴 ANOMALIA GRAVE (>1500)'
        WHEN COUNT(*) > 800 THEN '🟡 ACIMA DO ESPERADO (>800)'
        WHEN COUNT(*) > 300 THEN '🟢 NORMAL PARA SEMÁFORO'
        ELSE '⚪ ABAIXO DO ESPERADO'
    END AS Classificacao
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
  AND p.DataHoraPassagem >= DATEADD(DAY, -60, GETDATE())
GROUP BY CAST(p.DataHoraPassagem AS DATE)
HAVING COUNT(*) > 500  -- Mostrar apenas dias anômalos
ORDER BY Data;

-- 3.3 Primeiro dia com volume anômalo (início provável da falha)
SELECT TOP 1
    CAST(p.DataHoraPassagem AS DATE) AS DataInicioProblema,
    COUNT(*) AS TotalPassagens,
    'PRIMEIRO DIA COM VOLUME ANÔMALO (>1500)' AS Observacao
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
  AND p.DataHoraPassagem >= DATEADD(DAY, -90, GETDATE())
GROUP BY CAST(p.DataHoraPassagem AS DATE)
HAVING COUNT(*) > 1500
ORDER BY CAST(p.DataHoraPassagem AS DATE) ASC;
```

### 4.4. Verificar se o Problema é Histórico (Sempre Existiu)

```sql
-- ═══════════════════════════════════════════════════════════
-- PARTE 4: HISTÓRICO COMPLETO DO EQUIPAMENTO
-- ═══════════════════════════════════════════════════════════

-- 4.1 Volume MENSAL desde o início (verificar se sempre foi alto)
SELECT 
    YEAR(p.DataHoraPassagem) AS Ano,
    MONTH(p.DataHoraPassagem) AS Mes,
    FORMAT(p.DataHoraPassagem, 'yyyy-MM') AS Periodo,
    COUNT(*) AS TotalPassagens,
    COUNT(DISTINCT CAST(p.DataHoraPassagem AS DATE)) AS DiasComRegistro,
    COUNT(*) / NULLIF(COUNT(DISTINCT CAST(p.DataHoraPassagem AS DATE)), 0) AS MediaDiaria
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
GROUP BY YEAR(p.DataHoraPassagem), MONTH(p.DataHoraPassagem), FORMAT(p.DataHoraPassagem, 'yyyy-MM')
ORDER BY Ano, Mes;

-- 4.2 Eventos registrados para o equipamento (manutenção, falhas)
SELECT 
    ev.DataHora,
    ev.TipoEvento,
    ev.Descricao,
    ev.Responsavel
FROM TBEventosEquipamentos ev
JOIN TBEquipamentos e ON ev.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
ORDER BY ev.DataHora DESC;

-- 4.3 Status de heartbeat (última comunicação)
SELECT 
    hb.DataHora AS UltimoHeartbeat,
    hb.Status,
    e.Codigo
FROM TBHeartbeatEquipamentos hb
JOIN TBEquipamentos e ON hb.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
ORDER BY hb.DataHora DESC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;

-- 4.4 Aferição vigente
SELECT 
    a.DataAfericao,
    a.DataVencimento,
    a.NumeroLacre,
    a.NumeroInmetro,
    a.NumeroSerie,
    a.StatusLacre,
    a.DataLacreRompido,
    CASE 
        WHEN a.DataVencimento < GETDATE() THEN '🔴 VENCIDA'
        WHEN a.DataVencimento < DATEADD(DAY, 30, GETDATE()) THEN '🟡 VENCENDO EM 30 DIAS'
        ELSE '🟢 VÁLIDA'
    END AS StatusAfericao
FROM TBAfericoes a
JOIN TBEquipamentos e ON a.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
ORDER BY a.DataAfericao DESC;
```

### 4.5. DE-PARA: Comparar com Outros Equipamentos Vizentec

```sql
-- ═══════════════════════════════════════════════════════════
-- PARTE 5: COMPARAÇÃO COM OUTROS VIZENTEC (DE-PARA)
-- ═══════════════════════════════════════════════════════════

-- 5.1 Volume diário dos últimos 7 dias — TODOS os Vizentec
SELECT 
    e.Codigo AS Equipamento,
    CAST(p.DataHoraPassagem AS DATE) AS Data,
    COUNT(*) AS TotalPassagens,
    COUNT(p.Infracao_id) AS ComInfracao
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
JOIN TBModeloEquipamentos me ON e.ModeloEquipamento_id = me.Id
JOIN TBFabricantes f ON me.Fabricante_id = f.Id
WHERE f.Nome LIKE '%Vizentec%'
  AND p.DataHoraPassagem >= DATEADD(DAY, -7, GETDATE())
GROUP BY e.Codigo, CAST(p.DataHoraPassagem AS DATE)
ORDER BY e.Codigo, Data;

-- 5.2 Resumo comparativo: T4129 vs demais Vizentec (média diária últimos 7 dias)
SELECT 
    e.Codigo AS Equipamento,
    COUNT(*) AS TotalPassagens7Dias,
    COUNT(*) / 7.0 AS MediaDiaria,
    CASE 
        WHEN COUNT(*) / 7.0 > 1500 THEN '🔴 ANÔMALO'
        WHEN COUNT(*) / 7.0 > 500 THEN '🟡 ELEVADO'
        ELSE '🟢 NORMAL'
    END AS Status,
    COUNT(p.Infracao_id) AS TotalInfracoes,
    CAST(COUNT(p.Infracao_id) AS FLOAT) / NULLIF(COUNT(*), 0) * 100 AS PctInfracao
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
JOIN TBModeloEquipamentos me ON e.ModeloEquipamento_id = me.Id
JOIN TBFabricantes f ON me.Fabricante_id = f.Id
WHERE f.Nome LIKE '%Vizentec%'
  AND p.DataHoraPassagem >= DATEADD(DAY, -7, GETDATE())
GROUP BY e.Codigo
ORDER BY MediaDiaria DESC;

-- 5.3 Comparar taxa de infração (passagem → infração gerada)
-- Se T4129 tem taxa muito BAIXA ou 0%, confirma que registra sem critério
SELECT 
    e.Codigo AS Equipamento,
    COUNT(*) AS TotalPassagensConjugadas,
    SUM(CASE WHEN pc.FoiGeradaInfracao = 1 THEN 1 ELSE 0 END) AS GeraramInfracao,
    CAST(SUM(CASE WHEN pc.FoiGeradaInfracao = 1 THEN 1 ELSE 0 END) AS FLOAT) 
        / NULLIF(COUNT(*), 0) * 100 AS TaxaInfracao_Pct,
    CASE 
        WHEN CAST(SUM(CASE WHEN pc.FoiGeradaInfracao = 1 THEN 1 ELSE 0 END) AS FLOAT) 
             / NULLIF(COUNT(*), 0) * 100 < 5 THEN '🔴 TAXA MUITO BAIXA (<5%)'
        WHEN CAST(SUM(CASE WHEN pc.FoiGeradaInfracao = 1 THEN 1 ELSE 0 END) AS FLOAT) 
             / NULLIF(COUNT(*), 0) * 100 < 20 THEN '🟡 TAXA ABAIXO DO ESPERADO'
        ELSE '🟢 TAXA NORMAL'
    END AS DiagnosticoTaxa
FROM TBPassagensConjugadas pc
JOIN TBEquipamentos e ON pc.Equipamento_id = e.Id
JOIN TBModeloEquipamentos me ON e.ModeloEquipamento_id = me.Id
JOIN TBFabricantes f ON me.Fabricante_id = f.Id
WHERE f.Nome LIKE '%Vizentec%'
  AND pc.DataHoraPassagem >= DATEADD(DAY, -7, GETDATE())
GROUP BY e.Codigo
ORDER BY TaxaInfracao_Pct ASC;
```

### 4.6. Verificar Distribuição Horária (Confirmar Padrão de Falha)

```sql
-- ═══════════════════════════════════════════════════════════
-- PARTE 6: DISTRIBUIÇÃO HORÁRIA (confirma se registra 24h = falha)
-- ═══════════════════════════════════════════════════════════

-- Se registra de forma UNIFORME 24h/dia = falha no trigger
-- Se concentra em horários de pico = comportamento normal (mas volume alto)
SELECT 
    DATEPART(HOUR, p.DataHoraPassagem) AS Hora,
    COUNT(*) AS TotalPassagens,
    REPLICATE('█', COUNT(*) / 50) AS Grafico  -- Barra visual
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
  AND CAST(p.DataHoraPassagem AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE) -- Ontem
GROUP BY DATEPART(HOUR, p.DataHoraPassagem)
ORDER BY Hora;
```

### 4.7. Verificar se há Bloqueio ou Evento Recente

```sql
-- ═══════════════════════════════════════════════════════════
-- PARTE 7: STATUS DA OPERAÇÃO E BLOQUEIOS
-- ═══════════════════════════════════════════════════════════

-- 7.1 Verificar se operação está bloqueada
SELECT 
    op.Id,
    op.Status,
    op.DataInicial,
    op.DataFinal,
    op.DataAtualizacao,
    e.Codigo
FROM TBOperacoes op
JOIN TBEquipamentos e ON op.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
  AND (op.DataFinal IS NULL OR op.DataFinal >= GETDATE())
ORDER BY op.DataInicial DESC;

-- 7.2 Logs de importação recentes (verificar se fabricante está enviando corretamente)
SELECT TOP 20
    li.Id,
    li.DataImportacao,
    li.TotalRegistros,
    li.RegistrosImportados,
    li.RegistrosRejeitados,
    li.Status,
    li.MensagemErro,
    e.Codigo
FROM TBLoteImportacoes li
JOIN TBEquipamentos e ON li.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
ORDER BY li.DataImportacao DESC;
```

---

## 5. Cenários de Resolução (Do Melhor ao Mais Rústico)

### 5.1. 🟢 Cenário IDEAL — Reconexão do Controlador Semafórico

**Quando aplicar:** Confirmado que cabo/comunicação com controlador está interrompido

| Passo | Ação | Responsável |
|-------|------|-------------|
| 1 | Verificar fisicamente o cabo entre câmera T4129 e controlador semafórico | Técnico de campo |
| 2 | Reconectar/substituir cabo danificado | Técnico de campo |
| 3 | Validar que equipamento para de registrar em verde | Operador STRANS |
| 4 | Descartar em lote as infrações inválidas do período de falha | Analista AxHub |
| 5 | Registrar evento de manutenção no AxHub | Operador |

**Resultado:** Equipamento volta a funcionar corretamente. Zero impacto futuro.

### 5.2. 🟡 Cenário ALTERNATIVO — Reconfiguração Remota

**Quando aplicar:** Fabricante (Vizentec) pode acessar remotamente o equipamento

| Passo | Ação | Responsável |
|-------|------|-------------|
| 1 | Contatar Vizentec para acesso remoto ao T4129 | Suporte Axion |
| 2 | Vizentec verifica parâmetro de trigger (modo de captura) | Vizentec |
| 3 | Reconfigurar para capturar SOMENTE em sinal vermelho | Vizentec |
| 4 | Monitorar por 24h se volume normaliza | Operador STRANS |
| 5 | Descartar infrações inválidas | Analista AxHub |

**Resultado:** Resolve sem visita técnica. Mais rápido se for parametrização.

### 5.3. 🟠 Cenário PALIATIVO — Bloqueio da Operação + Descarte em Lote

**Quando aplicar:** Enquanto aguarda visita técnica/manutenção

| Passo | Ação | Responsável |
|-------|------|-------------|
| 1 | Bloquear operação do T4129 no AxHub (impedir novas infrações) | Operador STRANS |
| 2 | Identificar período da falha (scripts SQL acima) | Suporte Axion |
| 3 | Descartar em lote todas infrações do período com motivo "Falha equipamento" | Analista AxHub |
| 4 | Registrar evento "Falha — Equipamento fora de sinal" | Operador |
| 5 | Agendar manutenção preventiva | Gerente operações |

**Resultado:** Para a geração de infrações inválidas. Não corrige a causa raiz.

### 5.4. 🔴 Cenário RÚSTICO — Exceção Automática por Horário

**Quando aplicar:** Último recurso, sem previsão de manutenção

| Passo | Ação | Responsável |
|-------|------|-------------|
| 1 | Criar exceção automática no AxHub para T4129 | Administrador |
| 2 | Configurar: Equipamento = T4129, Tipo = Descarte automático | Administrador |
| 3 | Todas as passagens do T4129 serão descartadas automaticamente | Sistema |
| 4 | **⚠️ ATENÇÃO:** Isso desabilita completamente a fiscalização nesse equipamento | — |

**Resultado:** Estanca o problema, mas equipamento fica 100% inoperante.

---

## 6. Como Descartar Infrações Inválidas no AxHub

```
Menu lateral → Infrações → Triagem
→ Filtros:
   • Equipamento: T4129
   • Período: [data início da falha] até [hoje]
   • Status: Triagem (pendentes)
→ Selecionar todas (checkbox "Marcar todos")
→ Ação: Descartar
→ Motivo: "Falha no equipamento — registro em sinal verde"
→ Confirmar
```

**Ou via SQL (para volume muito grande):**

```sql
-- ⚠️ CUIDADO: Executar somente após confirmar o período da falha!
-- Primeiro em SELECT para conferir:
SELECT COUNT(*) AS InfracoesParaDescartar
FROM TBInfracoes i
JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
WHERE e.Codigo = 'T4129'
  AND i.DataHoraPassagem >= '2026-06-01 00:00:00'  -- Ajustar data início da falha
  AND i.DataHoraPassagem < '2026-06-03 00:00:00'   -- Ajustar data fim
  AND i.StatusProcessamento = 'Triagem'
  AND (i.IsDeleted IS NULL OR i.IsDeleted = 0);
```

---

## 7. Validação Final — O Comportamento Está Correto?

### Resposta: ❌ NÃO está correto.

| Aspecto | Esperado | Realidade (T4129) | Veredito |
|---------|----------|-------------------|----------|
| Registrar apenas em sinal VERMELHO | Sim | Registra em VERDE | ❌ FALHA |
| Volume diário (semáforo típico) | 100-500 passagens/dia | 2.494 passagens/dia | ❌ ANÔMALO |
| Imagem deve mostrar semáforo vermelho | Sim | Mostra semáforo verde | ❌ INVÁLIDO |
| Infração válida juridicamente | Sim | Não — sem sinal vermelho na imagem | ❌ NULA |

### Regras Legais Violadas

| Norma | Exigência | Situação T4129 |
|-------|-----------|----------------|
| Resolução CONTRAN 985/2022 | Imagem deve comprovar sinal vermelho | ❌ Sinal verde na imagem |
| Portaria DENATRAN 16/2004 | Equipamento deve estar sincronizado com controlador semafórico | ❌ Provável desconexão |
| Art. 280 CTB | Auto de infração deve ser lavrado com provas válidas | ❌ Prova inconsistente |
| Portaria INMETRO 492/2021 | Equipamento certificado e operando dentro das especificações | ⚠️ Verificar |

### Conclusão Operacional

> **Todas as 2.494 infrações registradas em sinal verde são JURIDICAMENTE NULAS e devem ser descartadas.**  
> O equipamento T4129 NÃO deve gerar autuações até que a falha seja corrigida e validada.

---

## 8. Ação Recomendada Imediata

| # | Ação | Prioridade | Prazo |
|---|------|:---:|-------|
| 1 | **Bloquear operação** do T4129 no AxHub para cessar novas infrações inválidas | 🔴 URGENTE | Imediato |
| 2 | **Executar scripts SQL** (Seção 4) para identificar período completo da falha | 🔴 URGENTE | Hoje |
| 3 | **Descartar em lote** todas infrações do período de falha | 🔴 URGENTE | Hoje |
| 4 | **Contatar Vizentec** para diagnóstico remoto/presencial | 🟡 ALTA | 24-48h |
| 5 | **Verificar outros Vizentec** (T1120, T1114, T1115, T4114) com script 5.2 | 🟡 ALTA | Hoje |
| 6 | **Registrar evento** de manutenção no AxHub com descrição da falha | 🟡 ALTA | Hoje |
| 7 | **Responder ticket** #99803729 com diagnóstico e ações tomadas | 🟡 ALTA | Hoje |

---

## 9. Resposta Sugerida para o Ticket #99803729

> **Assunto:** Re: Falha no equipamento T4129
>
> Prezado(a),
>
> Confirmamos a falha reportada no equipamento T4129. Segue diagnóstico:
>
> **Causa provável:** Perda de comunicação entre o equipamento (câmera OCR Vizentec) e o controlador semafórico. Sem receber o estado do sinal, o equipamento entrou em modo de captura contínua, registrando todas as passagens independentemente da fase semafórica.
>
> **Ações em andamento:**
> 1. ✅ Operação do T4129 bloqueada para cessar registro indevido
> 2. ✅ Infrações inválidas identificadas e em processo de descarte
> 3. 🔄 Contato com fabricante (Vizentec) para diagnóstico e correção
> 4. 🔄 Verificação dos demais equipamentos do mesmo fabricante
>
> **Prazo estimado para normalização:** Dependente da intervenção do fabricante (acesso remoto ou visita técnica).
>
> Manteremos atualização do chamado conforme evolução.
>
> Atenciosamente,  
> Suporte Axion Tecnologia

---

*Documento gerado em: 02/06/2026*  
*Referência: Ticket #99803729 — STRANS/Teresina*
