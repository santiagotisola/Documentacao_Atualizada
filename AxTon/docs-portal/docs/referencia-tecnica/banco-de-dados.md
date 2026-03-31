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
| `User` | Autenticação e usuários do sistema |
| `AccessProfile` | Perfis de acesso |
| `AccessPermission` | Permissões individuais (hierárquicas) |
| `Classification` | Classificação de veículos com eixos e PBT |
| `Configuration` | Configurações do dispositivo e câmera |
| `Weighing` | Pesagens registradas |
| `Operation` | Sessões de pesagem |
| `Local` | Locais de operação |
| `ExportBatch` | Lotes de exportação de infrações |
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
| `StructPBT` | string | Código estrutura para infração PBT |
| `StructAxle` | string | Código estrutura para infração de eixo |

---

## Weighing (pesagem)

| Campo | Tipo | Descrição |
|---|---|---|
| `WeighingDate` | DateTime | Data/hora da pesagem |
| `LicensePlate` | string | Placa do veículo |
| `Axles` | string | Configuração de eixos (ex: E1E2E3) |
| `Pbt` | string | PBT regulamentado |
| `Classification` | string | Classificação do veículo |
| `WeighingStatus` | enum | `Started`, `Finish`, `Canceled` |
| `Infraction` | object | Dados da infração (Ait, SequentialInfraction, InfractionType) |
| `OperationId` | ObjectId | Referência à Operation |
| `ExportBatchId` | ObjectId | Referência ao lote de exportação |
| `ImageName` | string | Nome do arquivo de imagem capturada |
| `WeighingNumber` | long | Número sequencial da pesagem |

### Tipos de infração (InfractionType)
| Valor | Descrição |
|---|---|
| `ExcessPBT` | Excesso de Peso Bruto Total |
| `ExcessAxle` | Excesso de peso por eixo |
| `ExcessAxlePBT` | Excesso combinado (eixo + PBT) |

---

## Classification (classificação de veículos)

| Campo | Tipo | Descrição |
|---|---|---|
| `Code` | string | Código da classificação |
| `Name` | string | Nome (ex: Caminhão 2 eixos) |
| `Class` | string | Classe do veículo |
| `Axles` | string | Configuração de eixos (ex: E1E2) |
| `Pbt` | string | PBT máximo regulamentado |
| `Type` | string | Tipo do veículo |

---

## ExportBatch (lote de exportação)

| Campo | Tipo | Descrição |
|---|---|---|
| `DateHourGeneration` | DateTime | Data/hora de geração |
| `ExportStatus` | enum | `Processing`, `Ok`, `Error` |
| `Message` | string | Mensagem de erro (quando Error) |
| `InitialDateInfractions` | DateTime | Data inicial do lote |
| `FinalDateInfractions` | DateTime | Data final do lote |
| `InfractionType` | enum | Tipo de infração do lote |
| `ExportType` | enum | Destino da exportação |
| `Sequential` | int | Número sequencial do lote |
| `UrlFile` | string | URL do arquivo gerado |

:::tip Diagnóstico de lote com erro
Quando `ExportStatus = Error`, leia o campo `Message` para identificar a causa. Verifique também a collection `SequentialInfraction` para garantir que o sequencial está correto.
:::

---

## Diagrama de relacionamentos

```
User ──────────> AccessProfile ──> AccessPermission (hierárquico)

Operation ──────> Local (embeddado)
    ▼
Weighing ──────> ExportBatch
    ├──> WeighingAxleGroup ──> WeighingAxle
    └──> Infraction (embeddado)

SequentialInfraction  (contador independente)
SequentialExport      (faixa independente)
```

---

## API — Endpoints disponíveis

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/axton/status` | Testa conexão com banco |
| GET | `/api/axton/resumo` | Contagem de registros |
| GET | `/api/axton/pesagens` | Últimas 20 pesagens |
| GET | `/api/axton/infracoes` | Últimas 20 infrações |
| GET | `/api/axton/heartbeat` | Status dos equipamentos |
| GET | `/api/axton/tabelas` | Todas as tabelas com contagem |
