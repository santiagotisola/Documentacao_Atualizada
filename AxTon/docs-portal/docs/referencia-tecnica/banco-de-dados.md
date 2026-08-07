---
sidebar_position: 1
title: Banco de Dados
description: Referência técnica das collections MongoDB e API do AxTon
---

# Referência Técnica — Banco de Dados AxTon

O AxTon utiliza **MongoDB** como banco de dados NoSQL. Abaixo estão todas as collections, campos e relacionamentos.

---

## Visão Geral

| Collection | Finalidade |
|---|---|
| Use Usuário | Autenticação e Usuários do sistema |
| `AccessProfile` | Perfis de acesso |
| `AccessPermission` | Permissões individuais (hierárquicas) |
| `Classification` | Classificação de Veículos com eixos e PBT |
| `Configuration` | Configurações do dispositivo e câmera |
| `Weighing` | Pesagens registradas |
| `Operation` | Sessões de pesagem |
| `Local` | Locais de operação |
| `ExportBatch` | Lotes de exportação de Infrações |
| `SequentialInfraction` | Contador de numeração de AITs |
| `SequentialExport` | Faixas de numeração de exportação |

---

## Configuration (mais importante)

Define câmera, balança, tolerâncias e integração com AxHub.

| Campo | Tipo | Descrição |
|---|---|---|
| `CameraIp` | string | IP da câmera |
| `CameraPort` | int | Porta (padrão 554) |
| `CameraType` | enum | `Generic`, `Hikvision`, `Intelbras`, `Uniview`, `Axis`, `Custom` |
| `CameraCustomRtspUrl` | string | URL RTSP customizada (quando CameraType = Custom) |
| `UserCamera` | string | Usuário de acesso à câmera |
| `PasswordCamera` | string | Senha da câmera |
| `TolerancePercentage` | double | Tolerância % para PBT |
| `TolerancePercentageAxle` | double | Tolerância % por eixo |
| `UrlAxHub` | string | URL da API AxHub para integração |
| `ApiKey` | string | Chave de API do AxHub |
| `ExportType` | enum | `XTrafficExportInfraction`, `AxHubExportInfraction` |
| `EntityCode` | string | Código do órgão autuador |
| `StructPBT` | string | Código estrutura para Infração PBT |
| `StructAxle` | string | Código estrutura para Infração de eixo |

---

## Weighing (pesagem)

| Campo | Tipo | Descrição |
|---|---|---|
| `WeighingDate` | DateTime | Data/hora da pesagem |
| `LicensePlate` | string | Placa do Veículo |
| `Axles` | string | Configuração de eixos (ex: E1E2E3) |
| `Pbt` | string | PBT regulamentado |
| `Classification` | string | Classificação do Veículo |
| `WeighingStatus` | enum | `Started`, `Finish`, `Canceled` |
| `Infraction` | object | Dados da Infração (Ait, SequentialInfraction, InfractionType) |
| `OperationId` | ObjectId | Referência à Operation |
| `ExportBatchId` | ObjectId | Referência ao lote de exportação |
| `ImageName` | string | Nome do arquivo de imagem capturada |
| `WeighingNumber` | long | Número sequencial da pesagem |

### Tipos de Infração (InfractionType)
| Valor | Descrição |
|---|---|
| `ExcessPBT` | Excesso de Peso Bruto Total |
| `ExcessAxle` | Excesso de peso por eixo |
| `ExcessAxlePBT` | Excesso combinado (eixo + PBT) |

---

## Classification (classificação de Veículos

| Campo | Tipo | Descrição |
|---|---|---|
| `Code` | string | Código da classificação |
| `Name` | string | Nome (ex: Caminhão 2 eixos) |
| `Class` | string | Classe do Veículo |
| `Axles` | string | Configuração de eixos (ex: E1E2) |
| `Pbt` | string | PBT máximo regulamentado |
| `Type` | string | Tipo do Veículo |

---

## ExportBatch (lote de exportação)

| Campo | Tipo | Descrição |
|---|---|---|
| `DateHourGeneration` | DateTime | Data/hora de geração |
| `ExportStatus` | enum | `Processing`, `Ok`, `Error` |
| `Message` | string | Mensagem de erro (quando Error) |
| `InitialDateInfractions` | DateTime | Data inicial do lote |
| `FinalDateInfractions` | DateTime | Data final do lote |
| `InfractionType` | enum | Tipo de Infração do lote |
| `ExportType` | enum | Destino da exportação |
| `Sequential` | int | Número sequencial do lote |
| `UrlFile` | string | URL do arquivo gerado |

:::tip Diagnóstico de lote com erro
Quando `ExportStatus = Error`, leia o campo `Message` para identificar a causa. Verifique também a collection `SequentialInfraction` para garantir que o sequencial está correto.
:::

---

## Diagrama de relacionamentos

```
Use Usuário ──────────> AccessProfile ──> AccessPermission (hierárquico)

Operation ──────> Local (embeddado)
    ▼
Weighing ──────> ExportBatch
    ├──> WeighingAxleGroup ──> WeighingAxle
    └──> Infraction (embeddado)

SequentialInfraction (contador independente)
SequentialExport (faixa independente)
```

---

## API — Endpoints disponíveis

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/axton/status` | Testa conexão com banco |
| GET | `/api/axton/resumo` | Contagem de registros |
| GET | `/api/axton/pesagens` | Últimas 20 pesagens |
| GET | `/api/axton/infracoes` | Últimas 20 Infrações |
| GET | `/api/axton/heartbeat` | Status dos Equipamentos |
| GET | `/api/axton/tabelas` | Todas as tabelas com contagem |

---

## Exemplos práticos

### Testar conexão

```bash
curl http://localhost:3100/api/axton/status
```

```json
{ "conectado": true, "banco": "AxTon", "latencia": "10ms" }
```

---

### Resumo geral

```bash
curl http://localhost:3100/api/axton/resumo
```

```json
{
  Equipamentos 3,
  "operacoes": 520,
  "pesagens": 148000,
  "infracoes": 12400,
  Usuários 8
}
```

---

### Últimas pesagens

```bash
curl http://localhost:3100/api/axton/pesagens
```

```json
{
  "total": 20,
  "pesagens": [
    {
      "IdPesagem": 148000,
      "DataHoraPesagem": "2026-03-31T21:55:00",
      "Placa": "ABC1D23",
      "PBT": 14500,
      "Status": "Finish",
      Equipamento "Balança Posto Norte"
    }
  ]
}
```

---

### Últimas Infrações

```bash
curl http://localhost:3100/api/axton/infracoes
```

```json
{
  "total": 20,
  "infracoes": [
    {
      "IdInfracao": 12400,
      "DataHoraInfracao": "2026-03-31T21:50:00",
      "Placa": "XYZ9A10",
      "TipoInfracao": "ExcessPBT",
      "PBTRegulamentado": 23000,
      "PBTMedido": 28450,
      "Status": "Pendente",
      Equipamento "Balança Posto Norte"
    }
  ]
}
```

---

### Heartbeat de Equipamentos

```bash
curl http://localhost:3100/api/axton/heartbeat
```

```json
{
  "total": 3,
  "heartbeats": [
    { Equipamento "Balança Posto Norte", "NumeroSerie": "HN-001", "UltimoHeartbeat": "2026-03-31T22:07:00", "Status": "Online" },
  { Equipamento "Balança Posto Sul", "NumeroSerie": "HN-002", "UltimoHeartbeat": "2026-03-31T22:07:30", "Status": "Online" }
  ]
}
```

---

### Query MongoDB — pesagens com excesso de PBT hoje

```javascript
// MongoDB Driver (Node.js)
const hoje = new Date();
hoje.setHours(0, 0, 0, 0);
const amanha = new Date(hoje);
amanha.setDate(amanha.getDate() + 1);

db.collection('Weighing').find({
  WeighingDate: { $gte: hoje, $lt: amanha },
  'Infraction.InfractionType': { $in: ['ExcessPBT', 'ExcessAxlePBT'] }
}).sort({ 'Infraction.InfractionType': 1 }).toArray();
```

---

### Query MongoDB — Infrações ainda não exportadas

```javascript
// MongoDB Driver (Node.js)
db.collection('Weighing').find({
  StatusExport: false,
  Infraction: { $ne: null }
}).sort({ WeighingDate: 1 }).toArray();
```

---

### Configurar câmera via MongoDB (exemplo de documento)

```json
// Collection: Configuration
{
  "DeviceCode": "POSTO-NORTE-01",
  "CameraIp": "192.168.10.50",
  "CameraPort": 554,
  "CameraType": "Hikvision",
  "UserCamera": "admin",
  "PasswordCamera": "senha123",
  "TolerancePercentage": 5.0,
  "TolerancePercentageAxle": 5.0,
  "UrlAxHub": "https://axhub.empresa.com.br/api",
  "ApiKey": "chave-api-aqui",
  "ExportType": "AxHubExportInfraction",
  "EntityCode": "PRF-001",
  "StructPBT": "60503",
  "StructAxle": "60503"
}
```

---

### Integração no axion-ia-panel (React)

```jsx
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function InfracoesAxTon() {
  const [infracoes, setInfracoes] = useState([]);

  useEffect(() => {
    api.get('/axton/infracoes').then(r => setInfracoes(r.data.infracoes));
  }, []);

  return (
    <table>
      <thead>
        <tr><th>Placa</th><th>Tipo</th><th>PBT Reg.</th><th>PBT Medido</th><th>Excesso</th></tr>
      </thead>
      <tbody>
        {infracoes.map(i => (
          <tr key={i.IdInfracao}>
            <td>{i.Placa}</td>
            <td>{i.TipoInfracao}</td>
            <td>{i.PBTRegulamentado?.toLocaleString()} kg</td>
            <td>{i.PBTMedido?.toLocaleString()} kg</td>
            <td style={{ color: 'red', fontWeight: 'bold' }}>
              +{(i.PBTMedido - i.PBTRegulamentado)?.toLocaleString()} kg
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Erros comuns

| Situação | Causa | Solução |
|----------|-------|----------|
| API retorna 500 | MongoDB offline ou URI incorreta | Verifique a string de conexão no `config.json` do servidor |
| Collection vazia | Banco de dados zerado ou ambiente incorreto | Confirme o nome do banco em `use AxTon` |
| Heartbeat não atualiza | Balança offline ou HAENNI desconectado | Verifique a URL em **Sistema → Configurações → Aba HAENNI** |
| Exportação com Error | Sequencial incorreto na collection | Verifique `SequentialInfraction.CurrentNumber` via MongoDB Compass |

## Perguntas frequentes

**Como verificar a versão do banco de dados do AxTon?**
Esta informação está disponível via `GET /api/axton/status`, que retorna o nome do banco e a latência da conexão.

**Como acessar os dados diretamente para auditoria interna?**
Use o **MongoDB Compass** com a string de conexão do servidor para navegar nas collections `Weighing` e `ExportBatch`. Nunca faça alterações manuais sem orientar o suporte técnico.

**A API do AxTon exposta na porta 3100 é segura para acesso externo?**
Não. A API foi projetada para consumo interno (painel de gestão na mesma rede). Para exposição externa, é necessário configurar proxy reverso com autenticação e HTTPS.

## Integração com outros módulos

| Módulo | Como se relaciona com a Referência Técnica |
|--------|----------------------------------------------|
| **Sistema → Configurações** | Os valores salvos nas configurações são armazenados na collection `Configuration` |
| **Pesagem → Iniciar Pesagem** | Cada pesagem cria um documento na collection `Weighing` com os dados completos |
| **Exportação de Infrações** | Os lotes gerados são persistidos na collection `ExportBatch` com status e URL do arquivo |
| **Medições → Contratos** | Dados de volume de pesagem calculados a partir das collections `Weighing` e `Operation` |
