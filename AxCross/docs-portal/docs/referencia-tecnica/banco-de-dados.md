---
sidebar_position: 1
title: Banco de Dados
description: Referência técnica das tabelas do banco SQL Server do AxCross
---

# Referência Técnica — Banco de Dados AxCross

O AxCross utiliza **SQL Server** como banco de dados relacional. Abaixo estão todas as tabelas, seus campos e relacionamentos.

---

## Visão Geral

| Tabela | Finalidade | Registros-chave |
|---|---|---|
| `TBLocais` | Cruzamentos e pontos de monitoramento | Nome, Latitude, Longitude |
| `TBEquipamentos` | Câmeras e sensores | Nome, IP, LocalId |
| `TBFaixas` | Faixas de pista por equipamento | Nome, Sentido, EquipamentoId |
| `TBOperacoes` | Sessões de monitoramento ativas | DataInicio, DataFim, Status |
| `TBPassagens` | Detecções de veículos | Placa, DataPassagem, Velocidade |
| `TBHeartbeatEquipamentos` | Status de comunicação das câmeras | Status, UltimoSinal |
| `TBUsuarios` | Usuários do sistema | Nome, Login, PerfilId |
| `TBPerfis` | Perfis de acesso | Nome, Descricao |
| `TBConfiguracoes` | Configurações chave-valor do sistema | Chave, Valor, Grupo |

---

## TBLocais

Armazena os cruzamentos e pontos monitorados, com geolocalização.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `Id` | INT (PK) | Sim | Identificador único |
| `Nome` | NVARCHAR(200) | Sim | Nome do cruzamento/local |
| `Endereco` | NVARCHAR(500) | Não | Endereço completo |
| `Latitude` | FLOAT | Não | Coordenada de latitude |
| `Longitude` | FLOAT | Não | Coordenada de longitude |
| `Cidade` | NVARCHAR(100) | Não | Cidade |
| `UF` | CHAR(2) | Não | Estado (ex: SP, MG) |
| `Ativo` | BIT | Sim | 1 = Ativo, 0 = Inativo |
| `CriadoEm` | DATETIME | Sim | Data de cadastro |

---

## TBEquipamentos

Câmeras e sensores instalados nos cruzamentos.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `Id` | INT (PK) | Sim | Identificador único |
| `Nome` | NVARCHAR(200) | Sim | Nome do equipamento |
| `Tipo` | NVARCHAR(100) | Não | Tipo (Câmera, Sensor, Radar) |
| `Fabricante` | NVARCHAR(100) | Não | Fabricante do equipamento |
| `Modelo` | NVARCHAR(100) | Não | Modelo do equipamento |
| `NumeroSerie` | NVARCHAR(100) | Não | Número de série |
| `IP` | NVARCHAR(50) | Não | Endereço IP na rede |
| `LocalId` | INT (FK) | Não | Referência a TBLocais |
| `Ativo` | BIT | Sim | 1 = Ativo, 0 = Inativo |
| `CriadoEm` | DATETIME | Sim | Data de cadastro |

---

## TBFaixas

Faixas de pista monitoradas por cada equipamento.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `Id` | INT (PK) | Sim | Identificador único |
| `Nome` | NVARCHAR(100) | Sim | Nome da faixa (ex: Faixa 1) |
| `Sentido` | NVARCHAR(50) | Não | Sentido do tráfego (Norte/Sul, etc.) |
| `LocalId` | INT (FK) | Não | Referência a TBLocais |
| `EquipamentoId` | INT (FK) | Não | Referência a TBEquipamentos |
| `Ativa` | BIT | Sim | 1 = Ativa, 0 = Inativa |
| `CriadoEm` | DATETIME | Sim | Data de cadastro |

---

## TBOperacoes

Sessões de monitoramento com início e fim.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `Id` | INT (PK) | Sim | Identificador único |
| `Descricao` | NVARCHAR(500) | Não | Descrição da operação |
| `DataInicio` | DATETIME | Sim | Data/hora de início |
| `DataFim` | DATETIME | Não | Data/hora de encerramento (NULL = ativa) |
| `LocalId` | INT (FK) | Não | Referência a TBLocais |
| `EquipamentoId` | INT (FK) | Não | Referência a TBEquipamentos |
| `Status` | NVARCHAR(50) | Sim | `Ativa`, `Encerrada`, `Cancelada` |
| `CriadoEm` | DATETIME | Sim | Data de criação |

:::warning Operação em aberto
Operações com `DataFim = NULL` e `Status = 'Ativa'` estão em execução. Verifique se há operações paradas indevidamente.
:::

---

## TBPassagens

Registro de cada veículo detectado pelos equipamentos.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `Id` | INT (PK) | Sim | Identificador único |
| `Placa` | NVARCHAR(20) | Não | Placa do veículo (OCR) |
| `DataPassagem` | DATETIME | Sim | Data/hora da detecção |
| `Velocidade` | DECIMAL(10,2) | Não | Velocidade medida (km/h) |
| `FaixaId` | INT (FK) | Não | Referência a TBFaixas |
| `EquipamentoId` | INT (FK) | Não | Referência a TBEquipamentos |
| `LocalId` | INT (FK) | Não | Referência a TBLocais |
| `ImagemPath` | NVARCHAR(500) | Não | Caminho da imagem capturada |
| `CriadoEm` | DATETIME | Sim | Data de registro |

**Índices criados:**
- `IX_Passagens_Data` — busca por data
- `IX_Passagens_Placa` — busca por placa

---

## TBHeartbeatEquipamentos

Monitora se cada câmera está comunicando com o servidor.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `Id` | INT (PK) | Sim | Identificador único |
| `EquipamentoId` | INT (FK) | Sim | Referência a TBEquipamentos |
| `Status` | NVARCHAR(50) | Não | `Online`, `Offline`, `Manutenção` |
| `UltimoSinal` | DATETIME | Sim | Data/hora do último ping recebido |

---

## TBConfiguracoes

Configurações gerais do sistema em formato chave-valor.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `Id` | INT (PK) | Sim | Identificador único |
| `Chave` | NVARCHAR(200) | Sim | Nome da configuração |
| `Valor` | NVARCHAR(MAX) | Não | Valor da configuração |
| `Grupo` | NVARCHAR(100) | Não | Grupo de agrupamentos (ex: Email, API, Sistema) |

---

## Diagrama de relacionamentos

```
TBLocais ──────────────────┬──> TBEquipamentos ──> TBFaixas
    │                      │         │
    │                      │         ▼
    │                      │    TBHeartbeatEquipamentos
    │                      │
    ▼                      ▼
TBOperacoes           TBPassagens
```

---

## API — Endpoints disponíveis

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/axcross/status` | Testa conexão com banco |
| GET | `/api/axcross/resumo` | Contagem de todos os registros |
| GET | `/api/axcross/locais` | Lista locais com total de equipamentos |
| GET | `/api/axcross/equipamentos` | Lista equipamentos por local |
| GET | `/api/axcross/passagens` | Estatísticas e últimas passagens |
| GET | `/api/axcross/operacoes` | Últimas 50 operações |
| GET | `/api/axcross/heartbeat` | Status das câmeras |
| GET | `/api/axcross/tabelas` | Todas as tabelas com contagem |
