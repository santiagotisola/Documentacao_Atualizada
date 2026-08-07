# Análise de Viabilidade — Integração RAP/ONE (SEFAZ/SE)

**Documento:** Resposta ao Ofício nº 1026/2026-SEFAZ  
**Data:** 27/05/2026  
**De:** Axion Tecnologia (equipe técnica)  
**Para:** DER/SE — Departamento Estadual de Infraestrutura Rodoviária de Sergipe  
**Referência:** ACT nº 06/2023 (SEFAZ/SE × DER/SE)

---

## 1. Contexto

A SEFAZ/SE, por meio do Ofício nº 1026/2026, solicita ao DER/SE a disponibilização de dados de passagens veiculares captados pelos equipamentos de monitoramento instalados na malha rodoviária estadual. O objetivo é alimentar o sistema **RAP/ONE** (Registro Automático de Passagens / Operador Nacional dos Estados) para fins de fiscalização tributária.

A Axion Tecnologia opera o sistema **AxHub** para o DER/SE, responsável pela gestão completa dos equipamentos de monitoramento, processamento de passagens e geração de dados operacionais.

---

## 2. Campos Exigidos pelo RAP/ONE (Anexo Único)

| # | Campo | Tipo | Obrigatoriedade | Descrição |
|---|-------|------|-----------------|-----------|
| 1 | `placa` | String(7) | Obrigatório | Placa do veículo (Mercosul ou formato antigo) |
| 2 | `data_hora_passagem` | DateTime | Obrigatório | Data/hora com fuso horário |
| 3 | `uf_captura` | String(2) | Obrigatório | Código numérico da UF (28 = SE) |
| 4 | `id_equipamento` | Numérico(15) | Obrigatório | Identificador único do equipamento |
| 5 | `tipo_transmissao` | String(1) | Obrigatório | N=Normal, R=Retransmissão, A=Atraso |
| 6 | `latitude` | Decimal | Condicional | Obrigatório se longitude e sentido presentes |
| 7 | `longitude` | Decimal | Condicional | Obrigatório se latitude e sentido presentes |
| 8 | `sentido` | String(1) | Condicional | E=Entrada, S=Saída, I=Indeterminado |

---

## 3. Mapeamento — AxHub × RAP/ONE

| Campo RAP/ONE | Fonte AxHub | Tabela | Join | Status |
|---|---|---|---|---|
| `placa` | `PlacaVeiculo` (nvarchar 10) | TBPassagens | Direto | ✅ Disponível |
| `data_hora_passagem` | `DataHoraPassagem` (datetime) | TBPassagens | Direto | ⚠️ Sem fuso explícito |
| `uf_captura` | `Uf` (nvarchar 2) | TBFaixas | Via Faixa_id | ✅ Disponível (fixo "SE") |
| `id_equipamento` | `Codigo` (nvarchar 100) | TBEquipamentos | Via Equipamento_id | ✅ Disponível |
| `tipo_transmissao` | **NÃO EXISTE** | — | — | ❌ Gap |
| `latitude` | `Latitude` (real) | TBFaixas | Via Faixa_id | ✅ Disponível |
| `longitude` | `Longitude` (real) | TBFaixas | Via Faixa_id | ✅ Disponível |
| `sentido` | `Sentido` (nvarchar 150) | TBFaixas | Via Faixa_id | ⚠️ Precisa mapeamento |

### Cobertura: **6/8 campos disponíveis** (75%)

---

## 4. Análise de Gaps

### 4.1 Gap Crítico: `tipo_transmissao`

O schema do AxHub não armazena informação sobre o tipo de transmissão (Normal vs Retransmissão vs Atraso). 

**Proposta de derivação por regra de negócio:**

```sql
CASE
  WHEN DATEDIFF(HOUR, p.DataHoraPassagem, p.DataCriacao) > 24 THEN 'A'  -- Atraso (>24h)
  WHEN p.LoteImportacao_id IN (SELECT Id FROM TBLotesImportacao WHERE Reprocessamento = 1) THEN 'R'  -- Retransmissão
  ELSE 'N'  -- Normal
END AS tipo_transmissao
```

> **Nota:** A regra acima é uma aproximação. O ideal seria confirmar com a SEFAZ/SE o critério exato para "Atraso" e "Retransmissão".

### 4.2 Gap Menor: `sentido`

TBFaixas.Sentido armazena texto livre (ex: "Crescente", "Decrescente", "Ambos sentidos").

**Proposta de mapeamento:**

```sql
CASE
  WHEN f.Sentido LIKE '%crescente%' OR f.Sentido LIKE '%entrada%' THEN 'E'
  WHEN f.Sentido LIKE '%decrescente%' OR f.Sentido LIKE '%saída%' OR f.Sentido LIKE '%saida%' THEN 'S'
  ELSE 'I'  -- Indeterminado
END AS sentido
```

> **Nota:** Recomenda-se revisar os valores distintos de `TBFaixas.Sentido` no banco do DER/SE para confirmar mapeamento.

### 4.3 Gap Menor: Fuso Horário

O campo `datetime` do SQL Server não armazena timezone. Sergipe opera em UTC-3 (sem horário de verão desde 2019).

**Solução:** Adicionar offset na serialização:
```sql
FORMAT(p.DataHoraPassagem, 'yyyy-MM-ddTHH:mm:ss-03:00') AS data_hora_passagem
```

---

## 5. Query SQL Proposta (VIEW)

```sql
CREATE VIEW vw_RAP_ONE_Passagens AS
SELECT
  LEFT(REPLACE(p.PlacaVeiculo, '-', ''), 7) AS placa,
  FORMAT(p.DataHoraPassagem, 'yyyy-MM-ddTHH:mm:ss-03:00') AS data_hora_passagem,
  '28' AS uf_captura,  -- Sergipe
  CAST(e.Codigo AS BIGINT) AS id_equipamento,
  CASE
    WHEN DATEDIFF(HOUR, p.DataHoraPassagem, p.DataCriacao) > 24 THEN 'A'
    ELSE 'N'
  END AS tipo_transmissao,
  f.Latitude AS latitude,
  f.Longitude AS longitude,
  CASE
    WHEN f.Sentido LIKE '%crescente%' THEN 'E'
    WHEN f.Sentido LIKE '%decrescente%' THEN 'S'
    ELSE 'I'
  END AS sentido
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
JOIN TBFaixas f ON p.Faixa_id = f.Id
WHERE p.PlacaVeiculo IS NOT NULL
  AND LEN(p.PlacaVeiculo) >= 7;
```

---

## 6. Opções de Entrega ao ONE

| Opção | Esforço | Latência | Descrição |
|---|---|---|---|
| **A) VIEW + Export Batch** | Baixo | Diário | VIEW SQL + procedimento agendado que gera arquivo CSV/JSON e envia via SFTP ou API batch |
| **B) Endpoint REST no AxHub** | Médio | Sob demanda | Controller .NET expondo `/api/rap-one/passagens` com paginação e autenticação |
| **C) AxCross Dedicado** | Médio-Alto | Tempo real | Deploy AxCross para SEFAZ/SE (modelo SEFAZPI já validado com MDF-e) |
| **D) Push Real-time** | Alto | Real-time | Webhook ou fila (RabbitMQ/Azure Service Bus) enviando cada passagem ao ONE |

---

## 7. Precedente: SEFAZPI AxCross

O site **SEFAZPI** no AxCross já opera integração similar:
- 77 equipamentos, 169 faixas
- 62.764 passagens/dia
- Módulo MDF-e integrado (OCR + SEFAZ)
- Menus: Dashboard, Relatórios, Monitoramento

Esse modelo é diretamente replicável para SEFAZ/SE usando a infraestrutura do DER/SE.

---

## 8. Recomendação

### Curto Prazo (atender o ofício rapidamente)
→ **Opção A**: Criar a VIEW SQL no banco do DER/SE e configurar exportação diária em formato compatível com RAP/ONE.

### Médio Prazo (integração robusta)
→ **Opção C**: Provisionar instância AxCross dedicada para SEFAZ/SE, alimentada pelos dados do DER/SE, replicando o modelo SEFAZPI com módulo MDF-e.

---

## 9. Próximos Passos

1. [ ] Confirmar com DER/SE: o Codigo do equipamento é numérico? (necessário para `id_equipamento`)
2. [ ] Levantar valores distintos de `TBFaixas.Sentido` no banco de SE
3. [ ] Definir com SEFAZ/SE: formato de entrega preferido (arquivo batch vs API)
4. [ ] Confirmar critério de "Atraso" vs "Retransmissão" para `tipo_transmissao`
5. [ ] Decidir: endpoint no AxHub (.NET) ou serviço separado?
6. [ ] Verificar se DER/SE já possui AxCross ou se é apenas AxHub

---

*Documento gerado pela AxionIA — Análise de Viabilidade Técnica*
