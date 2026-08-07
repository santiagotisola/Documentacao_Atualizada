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
| `TBFaixas` | Faixas de pista por Equipamento | Nome, Sentido, EquipamentoId |
| `TBOperacoes` | Sessões de monitoramento ativas | DataInicio, DataFim, Status |
| `TBPassagens` | Detecções de Veículos | Placa, DataPassagem, Velocidade |
| `TBHeartbeatEquipamentos` | Status de comunicação das câmeras | Status, UltimoSinal |
| `TBUsuarios` | Usuários do sistema | Nome, Login PerfilId |
| `TBPerfis` | Perfis de acesso | Nome, Descricao |
| `TBConfiguracoes` | Configurações chave-valor do sistema | Chave, Valor, Grupo |

---

## TBLocais

Armazena os cruzamentos e pontos monitorados, com geolocalização.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `Id` | INT (PK) | Sim | Identificador único |
| `Nome` | NVARCHAR(200) | Sim | Nome do cruzamento/local |
| endereço | NVARCHAR(500) | Não | Endereço completo |
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
| `Nome` | NVARCHAR(200) | Sim | Nome do Equipamento |
| `Tipo` | NVARCHAR(100) | Não | Tipo (Câmera, Sensor, Radar) |
| `Fabricante` | NVARCHAR(100) | Não | Fabricante do Equipamento |
| `Modelo` | NVARCHAR(100) | Não | Modelo do Equipamento |
| `NumeroSerie` | NVARCHAR(100) | Não | Número de série |
| `IP` | NVARCHAR(50) | Não | Endereço IP na rede |
| `LocalId` | INT (FK) | Não | Referência a TBLocais |
| `Ativo` | BIT | Sim | 1 = Ativo, 0 = Inativo |
| `CriadoEm` | DATETIME | Sim | Data de cadastro |

---

## TBFaixas

Faixas de pista monitoradas por cada Equipamento

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

Registro de cada Veículo detectado pelos Equipamentos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|:---:|---|
| `Id` | INT (PK) | Sim | Identificador único |
| `Placa` | NVARCHAR(20) | Não | Placa do Veículo (OCR) |
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
| `Chave` | NVARCHAR(200) | Sim | Nome da Configuração |
| `Valor` | NVARCHAR(MAX) | Não | Valor da Configuração |
| `Grupo` | NVARCHAR(100) | Não | Grupo de agrupamentos (ex: Email, API, Sistema) |

---

## Diagrama de relacionamentos

```
TBLocais ──────────────────┬──> TBEquipamentos ──> TBFaixas
    │ │ │
    │ │ ▼
 │ │ TBHeartbeatEquipamentos
    │ │
    ▼ ▼
TBOperacoes TBPassagens
```

---

## API — Endpoints disponíveis

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/axcross/status` | Testa conexão com banco |
| GET | `/api/axcross/resumo` | Contagem de todos os registros |
| GET | `/api/axcross/locais` | Lista locais com total de Equipamentos |
| GET | `/api/axcross/Equipamentos` | Lista Equipamentos por local |
| GET | `/api/axcross/passagens` | Estatísticas e últimas passagens |
| GET | `/api/axcross/operacoes` | Últimas 50 operações |
| GET | `/api/axcross/heartbeat` | Status das câmeras |
| GET | `/api/axcross/tabelas` | Todas as tabelas com contagem |

---

## Exemplos práticos

### Testar conexão

```bash
curl http://localhost:3100/api/axcross/status
```

```json
{ "conectado": true, "banco": "AxCross", "latencia": "8ms" }
```

---

### Resumo geral dos dados

```bash
curl http://localhost:3100/api/axcross/resumo
```

```json
{
  Equipamentos 12,
  "operacoes": 340,
  "passagens": 185000,
  "locais": 8,
  Usuários 5
}
```

---

### Listar locais de cruzamento

```bash
curl http://localhost:3100/api/axcross/locais
```

```json
{
  "total": 8,
  "locais": [
    {
      "Id": 1,
      "Nome": "Cruzamento Av. Brasil x Rua XV",
      "Cidade": "Curitiba",
      "UF": "PR",
      "Ativo": true,
      "TotalEquipamentos": 3
    }
  ]
}
```

---

### Últimas passagens com placa e local

```bash
curl http://localhost:3100/api/axcross/passagens
```

```json
{
  "total": 185000,
  "porLocal": [
    { "Nome": "Cruzamento Av. Brasil x Rua XV", "total": 42000 },
    { "Nome": "Viaduto Central Sul", "total": 31500 }
  ],
  "ultimas": [
    {
      "Id": 185000,
      "Placa": "ABC1D23",
      "DataPassagem": "2026-03-31T22:05:00",
      "Velocidade": 48.5,
      "Local": "Cruzamento Av. Brasil x Rua XV",
      "Faixa": "Faixa 1"
    }
  ]
}
```

---

### Heartbeat — câmeras online/offline

```bash
curl http://localhost:3100/api/axcross/heartbeat
```

```json
{
  "total": 12,
  "heartbeat": [
 { Equipamento "Câmera Norte - F1", "IP": "192.168.1.101", "Status": "Online", "UltimoSinal": "2026-03-31T22:08:00" },
  { Equipamento "Câmera Sul - F2", "IP": "192.168.1.102", "Status": "Offline", "UltimoSinal": "2026-03-31T19:30:00" }
  ]
}
```

---

### Query SQL — passagens por hora hoje

```sql
SELECT
  DATEPART(HOUR, DataPassagem) AS Hora,
  COUNT(*) AS Total
FROM TBPassagens
WHERE CAST(DataPassagem AS DATE) = CAST(GETDATE() AS DATE)
GROUP BY DATEPART(HOUR, DataPassagem)
ORDER BY Hora;
```

---

### Query SQL — câmeras offline há mais de 1 hora

```sql
SELECT
  e.Nome AS Equipamento
  e.IP,
  h.Status,
  h.UltimoSinal,
  DATEDIFF(MINUTE, h.UltimoSinal, GETDATE()) AS MinutosSemSinal
FROM TBHeartbeatEquipamentos h
JOIN TBEquipamentos e ON h.EquipamentoId = e.Id
WHERE h.UltimoSinal < DATEADD(HOUR, -1, GETDATE())
   OR h.Status = 'Offline'
ORDER BY h.UltimoSinal ASC;
```

---

### Integração no axion-ia-panel (React)

```jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function HeartbeatAxCross() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    api.get('/axcross/heartbeat').then(r => setDados(r.data.heartbeat));
  }, []);

  return (
    <table>
      <thead><tr><th>Equipamento</th><th>Status</th><th>Último Sinal</th></tr></thead>
      <tbody>
        {dados.map(h => (
          <tr key={h.Equipamento} style={{ color: h.Status === 'Offline' ? 'red' : 'green' }}>
            <td>{h.Equipamento}</td>
            <td>{h.Status}</td>
            <td>{new Date(h.UltimoSinal).toLocaleString('pt-BR')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```
