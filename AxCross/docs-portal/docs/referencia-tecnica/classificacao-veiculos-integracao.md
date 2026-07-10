---
sidebar_position: 2
title: Classificação de Veículos — Integração
description: Referência técnica para integração e importação de dados de classificação de Veículos no AxCross e AxHub
---

# Classificação de Veículos — Integração de Dados

> **Objetivo:** Guia técnico para equipes de integração. Descreve as tabelas, colunas, relacionamentos e scripts de importação de classificação de Veículos no **AxCross**, com comparativo para integração com o **AxHub**.

---

## O que é a Classificação de Veículos no AxCross?

O AxCross classifica automaticamente os Veículos detectados nos cruzamentos monitorados com base em seu porte (comprimento físico). A classificação permite:

- Segmentar o **fluxo de Veículos por porte no cruzamento
- Gerar Relatórios estatísticos** por tipo de Veículo
- Identificar **padrões de comportamento** por categoria (Pequeno, Médio, Grande)
- Apoiar **integrações** com sistemas de gestão de tráfego

A tela de gestão está disponível em: Dashboard → Classificações dos Veículos (`/occurrences/vehicleclassification`)

---

## Classificações Padrão

| Nome | Descrição |
|:---:|---|
| **Pequeno** | Veículos de passeio, motos, utilitários leves |
| **Médio** | Vans, ônibus, caminhões leves |
| **Grande** | Caminhões pesados, carretas, treminhões |

---

## Tabelas — AxCross

### `TBPassagens` — Tabela Principal

Registra todas as passagens detectadas pelos Equipamentos A classificação de Veículo é um atributo de cada passagem.

| Coluna (Banco de Dados) | Tipo | Nulo | Nome no Sistema | Descrição |
|---|---|:---:|---|---|
| `Id` | `INT IDENTITY(1,1)` | Não | **ID** | Chave primária auto-incremento |
| `Placa` | `nvarchar(20)` | Sim | **Placa** | Placa do Veículo (OCR) |
| `DataPassagem` | `datetime` | Não | **Data/Hora** | Data e hora da detecção |
| `Velocidade` | `decimal(10,2)` | Sim | **Velocidade** | Velocidade medida (km/h) |
| `FaixaId` | `INT` | Sim | **Faixa** | FK → `TBFaixas.Id` |
| `EquipamentoId` | `INT` | Sim | Equipamento | FK → `TBEquipamentos.Id` |
| `LocalId` | `INT` | Sim | **Local/Cruzamento** | FK → `TBLocais.Id` |
| `ImagemPath` | `nvarchar(500)` | Sim | **Imagem** | Caminho do arquivo de imagem |
| `CriadoEm` | `datetime` | Sim | **Criado em** | Timestamp de inserção |

### `TBLocais` — Locais de Cruzamento

| Coluna (Banco de Dados) | Tipo | Nulo | Nome no Sistema | Descrição |
|---|---|:---:|---|---|
| `Id` | `INT IDENTITY(1,1)` | Não | **ID** | Chave primária |
| `Nome` | `nvarchar(200)` | Não | **Nome** | Nome do cruzamento/ponto |
| endereço | `nvarchar(500)` | Sim | **Endereço** | Endereço completo |
| `Latitude` | `float` | Sim | **Latitude** | Coordenada geográfica |
| `Longitude` | `float` | Sim | **Longitude** | Coordenada geográfica |
| `Cidade` | `nvarchar(100)` | Sim | **Cidade** | Cidade |
| `UF` | `char(2)` | Sim | **UF** | Estado |
| `Ativo` | `bit` | Sim | **Ativo** | Status (padrão: 1) |
| `CriadoEm` | `datetime` | Sim | **Criado em** | Timestamp |

### `TBEquipamentos` — Equipamentos

| Coluna (Banco de Dados) | Tipo | Nulo | Nome no Sistema | Descrição |
|---|---|:---:|---|---|
| `Id` | `INT IDENTITY(1,1)` | Não | **ID** | Chave primária |
| `Nome` | `nvarchar(200)` | Não | **Nome** | Nome do Equipamento |
| `Tipo` | `nvarchar(100)` | Sim | **Tipo** | Tipo (câmera, sensor, radar) |
| `Fabricante` | `nvarchar(100)` | Sim | **Fabricante** | Fabricante do Equipamento |
| `Modelo` | `nvarchar(100)` | Sim | **Modelo** | Modelo do Equipamento |
| `NumeroSerie` | `nvarchar(100)` | Sim | **N° Série** | Número de série |
| `IP` | `nvarchar(50)` | Sim | **IP** | Endereço IP de comunicação |
| `LocalId` | `INT` | Sim | **Local** | FK → `TBLocais.Id` |
| `Ativo` | `bit` | Sim | **Ativo** | Status (padrão: 1) |

### `TBFaixas` — Faixas de Monitoramento

| Coluna (Banco de Dados) | Tipo | Nulo | Nome no Sistema | Descrição |
|---|---|:---:|---|---|
| `Id` | `INT IDENTITY(1,1)` | Não | **ID** | Chave primária |
| `Nome` | `nvarchar(100)` | Não | **Nome** | Nome da faixa |
| `Sentido` | `nvarchar(50)` | Sim | **Sentido** | Sentido do fluxo |
| `LocalId` | `INT` | Sim | **Local** | FK → `TBLocais.Id` |
| `EquipamentoId` | `INT` | Sim | Equipamento | FK → `TBEquipamentos.Id` |
| `Ativa` | `bit` | Sim | **Ativa** | Status (padrão: 1) |

---

## Relacionamentos — Diagrama

```
TBLocais ──────────────────────────────────────────┐
   │ Id │
   ├─── FK ◄── TBEquipamentos.LocalId │
   ├─── FK ◄── TBFaixas.LocalId │
   ├─── FK ◄── TBOperacoes.LocalId │
   └─── FK ◄── TBPassagens.LocalId │
                                                    │
TBEquipamentos ──────────────────────────┐ │
   │ Id │ │
 ├─── FK ◄── TBFaixas.EquipamentoId │ │
   └─── FK ◄── TBPassagens.EquipamentoId│ │
     │ │
TBFaixas ────────────────────────────────┘ │
   │ Id │
   └─── FK ◄── TBPassagens.FaixaId │
                                                    │
TBPassagens ◄───────────────────────────────────────┘
   (Placa, DataPassagem, Velocidade, Imagem, Classificação por porte)
```

---

## Integração AxCross ↔ AxHub

Os dois sistemas são bancosindependentes. Para integração entre eles, use o mapeamento abaixo:

### Mapeamento de Classificações

| AxCross (Nome) | AxHub (Código) | AxHub (Descrição) | Comprimento (cm) |
|:---:|:---:|:---:|:---:|
| `Pequeno` | `2` | Pequeno | 1 – 199 |
| `Médio` | `4` | Médio | 200 – 599 |
| `Grande` | `6` | Grande | 600 – 9999 |

### Mapeamento de Tabelas

| Entidade | Tabela AxCross | Tabela AxHub | Coluna de Join |
|---|---|---|---|
| Passagens | `TBPassagens` | `TBPassagens` | `Placa` + `DataPassagem` |
| Equipamentos | `TBEquipamentos` | `TBEquipamentos` | `NumeroSerie` ou código |
| Locais | `TBLocais` | — (usar `TBOperacoes`/`TBFaixas`) | Latitude/Longitude |
| Faixas | `TBFaixas` | `TBFaixas` | Nome da faixa |

---

## Scripts de Integração

### Verificar passagens por período e local — AxCross

```sql
SELECT
    p.Id,
    p.Placa,
    p.DataPassagem,
    p.Velocidade,
    f.Nome AS Faixa,
    f.Sentido AS Sentido,
    e.Nome AS Equipamento
    l.Nome AS Local,
    l.Cidade,
    l.UF
FROM TBPassagens p
INNER JOIN TBFaixas f ON p.FaixaId = f.Id
INNER JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
INNER JOIN TBLocais l ON p.LocalId = l.Id
WHERE p.DataPassagem BETWEEN '2026-04-01' AND '2026-04-30'
ORDER BY p.DataPassagem DESC;
```

### Contagem de passagens por classificação — AxCross

```sql
-- Como no AxCross a classificação é gerenciada pela interface,
-- o agrupamento pode ser feito por velocidade ou Equipamento
SELECT
    l.Nome AS Local,
    COUNT(*) AS TotalPassagens,
    AVG(p.Velocidade) AS VelocidadeMedia,
    CAST(p.DataPassagem AS DATE) AS Data
FROM TBPassagens p
INNER JOIN TBLocais l ON p.LocalId = l.Id
GROUP BY l.Nome, CAST(p.DataPassagem AS DATE)
ORDER BY Data DESC, TotalPassagens DESC;
```

### Importar passagens no AxCross (estrutura mínima)

```sql
-- Pré-requisito: garantir que Local, Equipamento e Faixa existam
DECLARE @localId INT = (SELECT Id FROM TBLocais WHERE Nome = 'Cruzamento Centro');
DECLARE @equip INT = (SELECT Id FROM TBEquipamentos WHERE NumeroSerie = 'EQ-001');
DECLARE @faixaId INT = (SELECT Id FROM TBFaixas WHERE Nome = 'Faixa 1' AND EquipamentoId = @equip);

INSERT INTO TBPassagens (Placa, DataPassagem, Velocidade, FaixaId, EquipamentoId, LocalId, ImagemPath)
VALUES
    ('ABC1234', '2026-04-01 08:00:00', 45.5, @faixaId, @equip, @localId, '/imagens/2026/04/01/abc1234.jpg'),
    ('XYZ9876', '2026-04-01 08:01:30', 62.0, @faixaId, @equip, @localId, '/imagens/2026/04/01/xyz9876.jpg');
```

### Sincronizar passagens AxCross → AxHub

```sql
-- ETL: Lê passagens do AxCross e insere no AxHub
-- Execute no contexto do banco AxHub com linked server ou via aplicação ETL

INSERT INTO [AxHub].[dbo].[TBPassagens] (
    Id, DataCriacao, DataHoraPassagem,
    PlacaVeiculo, VelocidadeMedida, VelocidadeConsiderada,
    ClassificacaoVeiculo_id, LoteImportacao_id
)
SELECT
    NEWID() AS Id,
    GETDATE() AS DataCriacao,
    ax.DataPassagem AS DataHoraPassagem,
    ax.Placa AS PlacaVeiculo,
    CAST(ax.Velocidade AS smallint) AS VelocidadeMedida,
    CAST(ax.Velocidade AS smallint) AS VelocidadeConsiderada,
    -- Resolver classificação pelo nome mapeado:
    c.Id AS ClassificacaoVeiculo_id,
    NULL AS LoteImportacao_id
FROM [AxCross].[dbo].[TBPassagens] ax
-- Mapear classificação AxCross → AxHub por faixa de velocidade/comprimento:
LEFT JOIN [AxHub].[dbo].[TBClassificacoesVeiculos] c
 ON c.Codigo = '4' -- Substitua pela lógica de classificação adequada
WHERE ax.DataPassagem >= DATEADD(hour, -1, GETDATE()); -- Última hora
```

---

## Considerações para Importação em Lote

| Item | AxHub | AxCross |
|---|---|---|
| **Chave primária** | GUID (`NEWID()`) | `INT IDENTITY` (auto) |
| **Data obrigatória** | `DataHoraPassagem` (NOT NULL) | `DataPassagem` (NOT NULL) |
| **FK obrigatória** | Nenhuma (nullable) | `FaixaId`, `EquipamentoId`, `LocalId` recomendados |
| **Índices disponíveis** | `TBPassagens` sem índice explícito no SQL | `IX_Passagens_Data`, `IX_Passagens_Placa` |
| **Volume típico** | Milhões de registros/mês | Volume menor (cruzamentos) |

---

## Perguntas Frequentes — Integração

**P: O AxCross tem uma tabela dedicada de classificações (como o AxHub tem `TBClassificacoesVeiculos`)?**
R: Não como tabela SQL explícita no schema exportado. A classificação é gerenciada pela interface e vinculada às passagens. Para implementar uma tabela de classificação dedicada no AxCross, crie-a e faça FK dela em `TBPassagens`.

**P: Como garantir consistência entre AxHub e AxCross para a mesma placa?**
R: Use `Placa` + `DataPassagem` (com tolerância de ±30s) como chave de correlação entre os bancos.

**P: Os índices `IX_Passagens_Data` e `IX_Passagens_Placa` do AxCross melhoram a importação?**
R: Sim para consultas. Para importações grandes, desative temporariamente os índices e recrie-os após a carga.

---

## Navegação Relacionada

- [Banco de Dados — Referência Completa](./banco-de-dados.md)
- [Equipamentos](../cadastros/equipamentos.md)
- [Locais](../cadastros/locais.md)
- [Faixas](../cadastros/faixas.md)
