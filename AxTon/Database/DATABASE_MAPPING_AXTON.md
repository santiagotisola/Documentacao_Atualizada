# Mapeamento do Banco de Dados - AxTon

## Visao Geral

- **Banco de Dados**: MongoDB
- **ORM**: Codout.Framework.Mongo (wrapper customizado)
- **Framework**: .NET 8.0/10.0
- **Nome do Banco**: `AxTon`

---

## Collections

### 1. User

**Arquivo**: `Axion.AxTon.Core/Domain/User.cs`
**Repository**: `Axion.AxTon.Dal/Repository/UserRepository.cs`

| Campo | Tipo | Obrigatorio | Default | Descricao |
|-------|------|:-----------:|---------|-----------|
| _id | ObjectId | Sim | Auto | Identificador unico |
| AgentCode | string | Nao | null | Codigo do agente |
| Name | string | Sim | - | Nome completo |
| Email | string | Nao | null | Email |
| Phone | string | Nao | null | Telefone |
| Username | string | Sim | - | Login do usuario |
| Password | string | Sim | - | Senha (hash MD5) |
| AccessProfileId | string | Nao | null | Referencia ao AccessProfile |


**Relacionamentos**:
- `AccessProfileId` -> `AccessProfile._id` (muitos-para-um)

---

### 2. AccessProfile

**Arquivo**: `Axion.AxTon.Core/Domain/AccessProfile.cs`
**Repository**: `Axion.AxTon.Dal/Repository/AccessProfileRepository.cs`

| Campo | Tipo | Obrigatorio | Default | Descricao |
|-------|------|:-----------:|---------|-----------|
| _id | ObjectId | Sim | Auto | Identificador unico |
| Name | string | Sim | - | Nome do perfil |
| AccessPermissions | List\<AccessPermission\> | Nao | [] | Lista de permissoes atribuidas |

**Relacionamentos**:
- `AccessPermissions` -> Lista de `AccessPermission` (um-para-muitos, embeddado)

---

### 3. AccessPermission

**Arquivo**: `Axion.AxTon.Core/Domain/AccessPermission.cs`
**Repository**: `Axion.AxTon.Dal/Repository/AccessPermissionRepository.cs`

| Campo | Tipo | Obrigatorio | Default | Descricao |
|-------|------|:-----------:|---------|-----------|
| _id | ObjectId | Sim | Auto | Identificador unico |
| Name | string | Sim | - | Nome da permissao |
| Action | string | Sim | - | Codigo da acao |
| Parent | AccessPermission | Nao | null | Permissao pai (hierarquica) |
| Childs | List\<AccessPermission\> | Nao | [] | Permissoes filhas |

**Observacoes**:
- Estrutura hierarquica (auto-referencial pai/filho)

---

### 4. Classification

**Arquivo**: `Axion.AxTon.Core/Domain/Classification.cs`
**Repository**: `Axion.AxTon.Dal/Repository/ClassificationRepository.cs`

| Campo | Tipo | Obrigatorio | Default | Descricao |
|-------|------|:-----------:|---------|-----------|
| _id | ObjectId | Sim | Auto | Identificador unico |
| Characterization | List\<string\> | Nao | - | Lista de descricoes de caracterizacao |
| Class | string | Sim | - | Classe do veiculo |
| Code | string | Sim | - | Codigo da classificacao |
| Name | string | Sim | - | Nome da classificacao |
| Comments | string | Nao | null | Comentarios adicionais |
| Axles | string | Sim | - | Configuracao de eixos (ex: "E1E2E3") |
| Pbt | string | Sim | - | Peso Bruto Total regulamentado |
| Type | string | Sim | - | Tipo do veiculo |

**Metodos relevantes**:
- `GetAxleGroups()`: Faz o parse do campo Characterization e retorna lista de `AxleGroup`

---

### 5. Configuration

**Arquivo**: `Axion.AxTon.Core/Domain/Configuration.cs`
**Repository**: `Axion.AxTon.Dal/Repository/ConfigurationRepository.cs`

| Campo | Tipo | Obrigatorio | Default | Descricao |
|-------|------|:-----------:|---------|-----------|
| _id | ObjectId | Sim | Auto | Identificador unico |
| DeviceCode | string | Nao | null | Codigo do equipamento |
| TolerancePercentage | double? | Nao | null | Tolerancia percentual para PBT |
| TolerancePercentageAxle | double? | Nao | null | Tolerancia percentual para eixo |
| TolerancePercentageTranshipment | double? | Nao | null | Tolerancia percentual para transbordo |
| EntityCode | string | Nao | null | Codigo da entidade |
| EntityName | string | Nao | null | Nome da entidade |
| EntityTitle | string | Nao | null | Titulo da entidade |
| EntityLogo | string | Nao | null | URL do logo da entidade |
| UrlAxHub | string | Nao | null | URL da API AxHub |
| ApiKey | string | Nao | null | Chave de API do AxHub |
| HaenniScales | HaenniScales | Nao | null | Configuracao das balancas Haenni |
| StructPBT | string | Nao | null | Codigo de estrutura para infracao PBT |
| StructAxle | string | Nao | null | Codigo de estrutura para infracao de eixo |
| StructAxlePBT | string | Nao | null | Codigo de estrutura para infracao eixo+PBT |
| InfractionLimitAxlePBT | double | Nao | 0 | Limite para infracao eixo+PBT |
| InfractionMinAllInfraction | double | Nao | 0 | Limite minimo geral de infracao |
| IsImageRequired | bool | Nao | false | Se captura de imagem e obrigatoria |
| ExportType | ExportType | Nao | - | Tipo de exportacao |
| CameraIp | string | Sim | - | IP da camera |
| CameraPort | int | Nao | 554 | Porta da camera |
| CameraType | CameraType | Nao | Generic | Tipo da camera |
| CameraCustomRtspUrl | string | Nao | null | URL RTSP customizada |
| WidthCamera | int | Nao | 1080 | Largura da imagem |
| HeightCamera | int | Nao | 1920 | Altura da imagem |
| UserCamera | string | Sim | - | Usuario da camera |
| PasswordCamera | string | Sim | - | Senha da camera |

#### Objeto Embeddado: HaenniScales

| Campo | Tipo | Default | Descricao |
|-------|------|---------|-----------|
| BaseUrl | string | "http://localhost:8888" | URL base das balancas Haenni |
| Devices | List\<DeviceScales\> | - | Lista de balancas configuradas |

#### Objeto Embeddado: DeviceScales

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Hnuid | string | Identificador unico Haenni |
| ClassName | string | Nome da classe do dispositivo |
| ModelName | string | Nome do modelo |
| Serial | int? | Numero serial |
| Load | int? | Valor de carga atual |
| Error | int? | Codigo de erro |
| SerialNumber | string? | Numero serial (texto) |
| InmetroNumber | string? | Numero de certificacao INMETRO |
| SealNumber | string? | Numero do lacre |
| VerifiedDate | DateTime? | Data de verificacao |
| ValidateDate | DateTime? | Data de validade |
| AferitionDate | DateTime? | Data de afericao |
| AferitionValideDate | DateTime? | Data de validade da afericao |

---

### 6. Weighing

**Arquivo**: `Axion.AxTon.Core/Domain/Weighing.cs`
**Repository**: `Axion.AxTon.Dal/Repository/WeighingRepository.cs`

| Campo | Tipo | Obrigatorio | Default | Descricao |
|-------|------|:-----------:|---------|-----------|
| _id | ObjectId | Sim | Auto | Identificador unico |
| WeighingDate | DateTime | Sim | - | Data/hora da pesagem |
| LicensePlate | string | Sim | - | Placa do veiculo |
| Axles | string | Sim | - | Configuracao de eixos |
| Pbt | string | Sim | - | PBT regulamentado (texto) |
| Classification | string | Sim | - | Classificacao do veiculo |
| WeighingStatus | WeighingStatus | Sim | - | Status da pesagem |
| ExportType | ExportType | Sim | - | Tipo de exportacao |
| OperationId | string | Sim | - | Referencia a Operation |
| ExportId | string | Nao | null | Referencia a Export |
| Device1 | string | Nao | null | Balanca primaria |
| Device2 | string | Nao | null | Balanca secundaria |
| WeighingAxleGroups | List\<WeighingAxleGroup\> | Nao | [] | Grupos de eixo medidos |
| RegulatedPBT | double | Sim | - | PBT regulamentado (numerico) |
| Infraction | Infraction | Nao | null | Dados da infracao |
| ExportBatchId | ObjectId? | Nao | null | Referencia ao ExportBatch |
| StatusExport | bool | Nao | false | Flag de exportacao |
| UserRegistration | string | Nao | null | Usuario que registrou |
| Observation | string | Nao | null | Observacoes |
| ImageName | string | Nao | null | Nome do arquivo de imagem |
| WeighingNumber | long? | Nao | null | Numero sequencial da pesagem |

**Campos Computados (BsonIgnore - nao armazenados)**:
- `PBT` (double): Soma de todos os PBTs dos grupos de eixo

#### Objeto Embeddado: Infraction

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Ait | string | Numero do Auto de Infracao |
| SequentialInfraction | int | Numero sequencial |
| InfractionType | InfractionType | Tipo de infracao |
| InfractionCode | string | Codigo da infracao |

#### Objeto Embeddado: WeighingAxleGroup

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Code | string | Codigo do grupo de eixo (ex: "E1E2") |
| Sequence | int | Numero de sequencia |
| RegulatedPBT | double | Peso regulamentado para este grupo |
| WeighingAxles | List\<WeighingAxle\> | Medicoes dos eixos |
| PBT | double | **Computado** - soma dos pesos dos eixos |

#### Objeto Embeddado: WeighingAxle

| Campo | Tipo | Descricao |
|-------|------|-----------|
| Sequence | int | Sequencia do eixo |
| Weight | int | Peso medido |

**Relacionamentos**:
- `OperationId` -> `Operation._id` (muitos-para-um)
- `ExportBatchId` -> `ExportBatch._id` (muitos-para-um)

---

### 7. Operation

**Arquivo**: `Axion.AxTon.Core/Domain/Operation.cs`
**Repository**: `Axion.AxTon.Dal/Repository/OperationRepository.cs`

| Campo | Tipo | Obrigatorio | Default | Descricao |
|-------|------|:-----------:|---------|-----------|
| _id | ObjectId | Sim | Auto | Identificador unico |
| StartDate | DateTime | Sim | - | Data/hora de inicio da operacao |
| FinishDate | DateTime? | Nao | null | Data/hora de fim da operacao |
| Local | Local | Nao | null | Local da operacao (embeddado) |
| User | User | Nao | null | Usuario responsavel (embeddado) |

**Observacoes**:
- `StartDate` e `FinishDate` armazenados com `DateTimeKind.Local` (preserva timezone local)
- `Local` e `User` sao objetos embeddados (nao referenciados)

---

### 8. Local

**Arquivo**: `Axion.AxTon.Core/Domain/Local.cs`
**Repository**: `Axion.AxTon.Dal/Repository/LocalRepository.cs`

| Campo | Tipo | Obrigatorio | Default | Descricao |
|-------|------|:-----------:|---------|-----------|
| _id | ObjectId | Sim | Auto | Identificador unico |
| Code | string | Nao | null | Codigo do local |
| Address | string | Nao | null | Endereco |
| AddressNumber | string | Nao | null | Numero |
| PostalCode | string | Nao | null | CEP |
| District | string | Nao | null | Bairro |
| State | string | Nao | null | Estado |
| CityCode | string | Nao | null | Codigo IBGE da cidade |
| City | string | Nao | null | Nome da cidade |
| Complement | string | Nao | null | Complemento |
| Latitude | double? | Nao | null | Latitude |
| Longitude | double? | Nao | null | Longitude |

---

### 9. ExportBatch

**Arquivo**: `Axion.AxTon.Core/Domain/ExportBatch.cs`
**Repository**: `Axion.AxTon.Dal/Repository/ExportBatchRepository.cs`

| Campo | Tipo | Obrigatorio | Default | Descricao |
|-------|------|:-----------:|---------|-----------|
| _id | ObjectId | Sim | Auto | Identificador unico |
| DateHourGeneration | DateTime | Sim | - | Data/hora de geracao do lote |
| UrlFile | string | Sim | - | URL do arquivo de exportacao |
| ExportStatus | ExportStatus | Sim | - | Status da exportacao |
| Message | string | Nao | null | Mensagem de status/erro |
| InitialDateInfractions | DateTime | Sim | - | Data inicial das infracoes |
| FinalDateInfractions | DateTime | Sim | - | Data final das infracoes |
| Prefix | string | Nao | null | Prefixo para numeracao |
| InitialSequential | long? | Nao | null | Primeiro sequencial do lote |
| FinalSequential | long | Sim | - | Ultimo sequencial do lote |
| Sequential | int | Sim | - | Numero sequencial do lote |
| InfractionType | InfractionType | Sim | - | Tipo de infracao do lote |
| ExportType | ExportType | Sim | - | Tipo de destino da exportacao |

---

### 10. SequentialInfraction

**Arquivo**: `Axion.AxTon.Core/Domain/SequentialInfraction.cs`
**Repository**: `Axion.AxTon.Dal/Repository/SequentialInfractionRepository.cs`

| Campo | Tipo | Obrigatorio | Default | Descricao |
|-------|------|:-----------:|---------|-----------|
| _id | ObjectId | Sim | Auto | Identificador unico |
| InfractionType | InfractionType? | Nao | null | Tipo de infracao |
| Sequential | long | Sim | - | Contador sequencial |
| Prefix | string | Nao | null | Prefixo do codigo de infracao |

---

### 11. SequentialExport

**Arquivo**: `Axion.AxTon.Core/Domain/SequentialExport.cs`
**Repository**: `Axion.AxTon.Dal/Repository/SequentialExportRepository.cs`

| Campo | Tipo | Obrigatorio | Default | Descricao |
|-------|------|:-----------:|---------|-----------|
| _id | ObjectId | Sim | Auto | Identificador unico |
| InitialSequential | long | Sim | - | Sequencial inicial |
| FinalSequential | long | Sim | - | Sequencial final |
| InfractionType | InfractionType? | Nao | null | Tipo de infracao associado |

---

## Enums

### WeighingStatus
| Valor | Descricao |
|-------|-----------|
| Started | Pesagem iniciada |
| Finish | Pesagem finalizada |
| Canceled | Pesagem cancelada |

### ExportType
| Valor | Descricao |
|-------|-----------|
| XTrafficExportInfraction | Exportacao para sistema XTraffic |
| AxHubExportInfraction | Exportacao para sistema AxHub |

### InfractionType
| Valor | Descricao |
|-------|-----------|
| ExcessPBT | Excesso de Peso Bruto Total |
| ExcessAxle | Excesso de peso por eixo |
| ExcessAxlePBT | Excesso combinado (eixo + PBT) |

### ExportStatus
| Valor | Descricao |
|-------|-----------|
| Processing | Lote em processamento |
| Ok | Exportacao concluida com sucesso |
| Error | Exportacao com erro |

### CameraType
| Valor | Descricao |
|-------|-----------|
| Generic | Generica (compativel Dahua) |
| Hikvision | Camera Hikvision |
| Intelbras | Camera Intelbras |
| Uniview | Camera Uniview (UNV) |
| Axis | Camera Axis |
| Custom | URL RTSP customizada |

---

## Diagrama de Relacionamentos

```
User ──────────────> AccessProfile ──────> AccessPermission (hierarquico)
  |                                              |
  v                                              v
Operation ──> Local                    AccessPermission (pai/filho)
  |
  v
Weighing ──────────> ExportBatch
  |
  |──> WeighingAxleGroup ──> WeighingAxle
  |──> Infraction (embeddado)
  |
  v
SequentialInfraction
SequentialExport
```

---

## Resumo das Collections

| Collection | Finalidade | Campos Chave | Relacionamentos |
|-----------|-----------|-------------|-----------------|
| User | Autenticacao e gerenciamento de usuarios | Username, Password, Name | AccessProfileId -> AccessProfile |
| AccessProfile | Perfis de acesso | Name, AccessPermissions | Contem lista de AccessPermission |
| AccessPermission | Permissoes granulares | Name, Action | Parent (auto-referencial) |
| Classification | Classificacao de veiculos | Code, Name, Axles, Pbt | - |
| Configuration | Configuracoes do sistema | DeviceCode, Tolerancias, Camera | - |
| Weighing | Registro de pesagens | LicensePlate, WeighingDate, Infraction | OperationId, ExportBatchId |
| Operation | Sessoes operacionais | StartDate, FinishDate | User (embed), Local (embed) |
| Local | Locais de operacao | Address, City, Coordenadas | - |
| ExportBatch | Lotes de exportacao de infracoes | DateHourGeneration, ExportStatus | - |
| SequentialInfraction | Contador de numeracao de infracoes | Sequential, Prefix | - |
| SequentialExport | Faixa de numeracao de exportacao | InitialSequential, FinalSequential | - |
