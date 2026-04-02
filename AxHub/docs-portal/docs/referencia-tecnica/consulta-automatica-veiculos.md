---
sidebar_position: 3
title: Consulta Automática de Dados de Veículos
description: Guia completo de integração — como o AxHub consulta e popula dados de veículos automaticamente via Web Service
---

# Consulta Automática de Dados de Veículos

> **Guia de Integração — Banco de Dados**
> Este documento descreve o processo de consulta automática de dados de veículos no AxHub: como funciona, quais tabelas são envolvidas, quais dados são retornados e como consultar e integrar essas informações.

---

## O que é a Consulta Automática?

A **Consulta Automática** é o processo pelo qual o AxHub envia a placa de um veículo detectado para um **Web Service externo** (DETRAN, SERPRO ou similar) e recebe de volta todos os dados cadastrais desse veículo. O resultado é armazenado automaticamente na tabela `TBVeiculos`, sem necessidade de nenhuma ação manual do operador.

### Quando acontece?

| Evento | Momento da consulta |
|---|---|
| **Importação de infrações** | Ao importar o lote de infrações do equipamento, o sistema consulta a placa de cada infração |
| **Passagem registrada** | Ao receber uma passagem, o sistema envia a placa para consulta |
| **Triagem manual** | O analista pode acionar uma reconsulta de placa na tela de triagem |
| **Cronotacógrafo** | Ao registrar passagem de cronotacógrafo, o sistema consulta dados do veículo |

---

## Fluxo Completo da Consulta Automática

```
EQUIPAMENTO (sensor/radar)
        │
        │  [captura placa + imagem + velocidade]
        ▼
IMPORTAÇÃO DE LOTE
  TBLoteImportacoes
  (NomeArquivoEntrada, StatusImportacao, Equipamento_id)
        │
        │  [para cada infração/passagem no lote]
        ▼
CONSULTA WEB SERVICE EXTERNO
  (DETRAN / SERPRO / RENAINF)
  ┌─────────────────────────────────┐
  │  Entrada:  Placa do veículo     │
  │  Saída:    Marca, Modelo, Ano,  │
  │            Tipo, Espécie, Cor,  │
  │            Proprietário, etc.   │
  └─────────────────────────────────┘
        │
        │  [resposta do WS gravada em]
        ▼
TBVeiculos (dados completos do veículo)
TBPassagemDadosVeiculos (marca/cor por passagem)
TBDadosCronotacografos (dados de jornada)
        │
        ▼
TBInfracoes / TBPassagens
  (ClassificacaoVeiculo_id vinculada ao porte medido)
```

---

## Tabela Central: `TBVeiculos`

É a tabela que armazena o resultado completo de cada consulta ao Web Service. Vinculada à infração e/ou passagem de cronotacógrafo.

| Coluna (Banco de Dados) | Tipo | Nulo | Nome no Sistema | Descrição |
|---|---|:---:|---|---|
| `Id` | `uniqueidentifier` | Não | **ID** | Chave primária (GUID) |
| `Infracao_id` | `bigint` | Sim | **Infração** | FK → `TBInfracoes.Id` — vínculo com a infração gerada |
| `PassagemCronotacografo_id` | `bigint` | Sim | **Passagem Crono.** | FK → `TBPassagensCronotacografos.Id` |
| `MarcaVeiculo` | `nvarchar(60)` | Sim | **Marca** | Ex: `VOLKSWAGEN`, `TOYOTA`, `HONDA` |
| `ModeloVeiculo` | `nvarchar(60)` | Sim | **Modelo** | Ex: `GOL`, `COROLLA`, `CIVIC` |
| `MarcaModeloVeiculo` | `nvarchar(100)` | Sim | **Marca/Modelo** | Descrição combinada retornada pelo WS |
| `CodigoMarcaModelo` | `nvarchar(100)` | Sim | **Cód. Marca/Modelo** | Código da tabela DETRAN |
| `AnoVeiculo` | `int` | Sim | **Ano de Fabricação** | Ex: `2022` |
| `AnoModelo` | `int` | Sim | **Ano do Modelo** | Ex: `2023` |
| `TipoVeiculo` | `nvarchar(100)` | Sim | **Tipo** | Ex: `AUTOMOVEL`, `CAMINHAO`, `ONIBUS`, `MOTOCICLETA` |
| `CodigoTipoVeiculo` | `nvarchar(100)` | Sim | **Cód. Tipo** | Código DETRAN do tipo |
| `Especie` | `nvarchar(100)` | Sim | **Espécie** | Ex: `PASSAGEIRO`, `CARGA`, `MISTO`, `CORRIDA` |
| `CodigoEspecie` | `nvarchar(100)` | Sim | **Cód. Espécie** | Código DETRAN da espécie |
| `Categoria` | `nvarchar(100)` | Sim | **Categoria** | Ex: `PARTICULAR`, `ALUGUEL`, `OFICIAL` |
| `CodigoCategoria` | `nvarchar(100)` | Sim | **Cód. Categoria** | Código DETRAN da categoria |
| `Cor` | `nvarchar(100)` | Sim | **Cor** | Ex: `PRATA`, `BRANCO`, `PRETO` |
| `CodigoCor` | `nvarchar(100)` | Sim | **Cód. Cor** | Código DETRAN da cor |
| `QuantidadePassageiros` | `int` | Sim | **Qtd. Passageiros** | Capacidade de passageiros |
| `CapacidadeCarga` | `int` | Sim | **Capacidade de Carga** | Capacidade em kg |
| `Chassi` | `nvarchar(50)` | Sim | **Chassi** | Número do chassi (VIN) |
| `Motor` | `nvarchar(255)` | Sim | **Motor** | Descrição do motor |
| `Carroceria` | `nvarchar(255)` | Sim | **Carroceria** | Tipo de carroceria |
| `CaixaCambio` | `nvarchar(255)` | Sim | **Câmbio** | Manual, Automático, etc. |
| `Renavam` | `nvarchar(11)` | Sim | **RENAVAM** | Registro Nacional de Veículo |
| `UfPlaca` | `nvarchar(2)` | Sim | **UF da Placa** | Ex: `GO`, `SP`, `RJ` |
| `NomeProprietario` | `nvarchar(200)` | Sim | **Proprietário** | Nome do proprietário do veículo |
| `CpfCnpj` | `nvarchar(14)` | Sim | **CPF/CNPJ** | Documento do proprietário |
| `MunicipioProprietario` | `nvarchar(255)` | Sim | **Município** | Cidade do proprietário |
| `UfProprietario` | `nvarchar(2)` | Sim | **UF** | Estado do proprietário |
| `BairroProprietario` | `nvarchar(255)` | Sim | **Bairro** | Bairro do proprietário |
| `LogradouroProprietario` | `nvarchar(255)` | Sim | **Logradouro** | Rua/Av. do proprietário |
| `CepProprietario` | `nvarchar(9)` | Sim | **CEP** | CEP do proprietário |
| `CodigoMunicipio` | `nvarchar(100)` | Sim | **Cód. Município** | Código IBGE do município |
| `Restricao` | `nvarchar(255)` | Sim | **Restrição** | Alienação, roubo, judicial, etc. |
| `Debitos` | `nvarchar(255)` | Sim | **Débitos** | Multas e débitos em aberto |
| `NumeroCnh` | `nvarchar(255)` | Sim | **CNH** | Número da CNH do proprietário |
| `CategoriaCnh` | `nvarchar(255)` | Sim | **Categoria CNH** | A, B, AB, C, D, E |
| `DataValidadeCnh` | `int` | Sim | **Validade CNH** | Data de validade no formato int |
| `WebServiceConsultado` | `nvarchar(255)` | Sim | **Web Service** | Nome/URL do WS consultado |
| `DataHoraConsulta` | `datetime` | Sim | **Data da Consulta** | Timestamp da consulta ao WS |
| `NumeroRegistro` | `nvarchar(255)` | Sim | **Nº Registro** | Número de registro no DETRAN |
| `Observacoes` | `nvarchar(255)` | Sim | **Observações** | Observações adicionais |

---

## Tabela: `TBPassagemDadosVeiculos`

Armazena os dados de marca e cor retornados pelo sistema de OCR/IA para cada passagem individual.

| Coluna (Banco de Dados) | Tipo | Nome no Sistema | Descrição |
|---|---|---|---|
| `Passagem_id` | `bigint` | **Passagem** | FK → `TBPassagens.Id` (chave primária) |
| `CodigoMarca` | `nvarchar(100)` | **Cód. Marca** | Código da marca identificado |
| `Marca` | `nvarchar(100)` | **Marca** | Nome da marca |
| `CodigoMarcaModelo` | `nvarchar(100)` | **Cód. Modelo** | Código do modelo |
| `MarcaModelo` | `nvarchar(100)` | **Modelo** | Descrição marca + modelo |
| `CodigoCor` | `nvarchar(100)` | **Cód. Cor** | Código da cor identificada |
| `Cor` | `nvarchar(100)` | **Cor** | Nome da cor |

---

## Tabela: `TBLoteImportacoes`

Registra cada arquivo de importação recebido dos equipamentos. Ponto de entrada do fluxo.

| Coluna (Banco de Dados) | Tipo | Nome no Sistema | Descrição |
|---|---|---|---|
| `Id` | `uniqueidentifier` | **ID** | Chave primária |
| `NomeArquivoEntrada` | `nvarchar(40)` | **Arquivo** | Nome do arquivo gerado pelo equipamento |
| `CodigoFabricante` | `nvarchar(50)` | **Fabricante** | Código do fabricante do equipamento |
| `NumeroFaixa` | `tinyint` | **Faixa** | Número da faixa de captura |
| `TipoImportacao` | `nvarchar(20)` | **Tipo** | Tipo do lote: INFRACAO, PASSAGEM, etc. |
| `StatusImportacao` | `nvarchar(20)` | **Status** | PENDENTE, PROCESSANDO, CONCLUIDO, ERRO |
| `CodigoEquipamento` | `nvarchar(12)` | **Equipamento** | Código do equipamento que gerou o arquivo |
| `DataRemessa` | `date` | **Data** | Data de envio do arquivo |
| `HoraInicio` | `nvarchar(6)` | **Hora Início** | Período do lote |
| `HoraFim` | `nvarchar(6)` | **Hora Fim** | Período do lote |
| `UrlArquivoEntrada` | `nvarchar(255)` | **URL Arquivo** | Caminho de armazenamento |
| `CodigoErro` | `nvarchar(255)` | **Código de Erro** | Código do erro caso falhe |
| `Excecao` | `nvarchar(255)` | **Exceção** | Mensagem de exceção |
| `Equipamento_id` | `uniqueidentifier` | **Equipamento FK** | FK → `TBEquipamentos.Id` |

---

## Tabela: `TBLoteImportacaoErros`

Registra erros de importação por linha/sequência.

| Coluna (Banco de Dados) | Tipo | Nome no Sistema | Descrição |
|---|---|---|---|
| `Id` | `uniqueidentifier` | **ID** | Chave primária |
| `LoteImportacao_id` | `uniqueidentifier` | **Lote** | FK → `TBLoteImportacoes.Id` |
| `CodigoErro` | `nvarchar(5)` | **Código** | Código do erro |
| `DescicaoErro` | `nvarchar(255)` | **Descrição** | Descrição detalhada do erro |
| `Sequencia` | `nvarchar(5)` | **Sequência** | Número da linha/sequência com erro |

---

## Tabela: `TBLoteExportacoes`

Registra os lotes de exportação enviados ao órgão autuador (DETRAN/DER/PRF).

| Coluna (Banco de Dados) | Tipo | Nome no Sistema | Descrição |
|---|---|---|---|
| `Id` | `uniqueidentifier` | **ID** | Chave primária |
| `DataHoraGeracao` | `datetime` | **Gerado em** | Data/hora de geração do lote |
| `Sequencial` | `bigint` | **Sequencial** | Sequencial do lote de exportação |
| `UrlArquivo` | `nvarchar(2000)` | **URL Arquivo** | Caminho do arquivo gerado |
| `StatusExportacao` | `nvarchar(50)` | **Status** | GERADO, ENVIADO, ACEITO, REJEITADO |
| `Mensagem` | `nvarchar(max)` | **Mensagem** | Retorno do órgão autuador |
| `DataIncialInfracoes` | `datetime` | **Data Inicial** | Período das infrações no lote |
| `DataFinalInfracoes` | `datetime` | **Data Final** | Período das infrações no lote |
| `TipoInfracao` | `nvarchar(50)` | **Tipo Infração** | VELOCIDADE, PESO, SEMAFORO, etc. |
| `Prefixo` | `nvarchar(10)` | **Prefixo** | Prefixo do órgão no arquivo |

---

## Tabela: `TBWebHooks`

Permite integração em tempo real via notificação HTTP quando eventos ocorrem no sistema.

| Coluna (Banco de Dados) | Tipo | Nome no Sistema | Descrição |
|---|---|---|---|
| `Id` | `uniqueidentifier` | **ID** | Chave primária |
| `UniformResourceIdentifier` | `nvarchar(250)` | **URL** | Endpoint de destino da notificação |
| `Evento` | `nvarchar(100)` | **Evento** | Tipo de evento que dispara o webhook |
| `Ativo` | `bit` | **Ativo** | Se o webhook está habilitado |
| `Codigo` | `bigint` | **Código** | Código identificador |
| `Nome` | `nvarchar(50)` | **Nome** | Nome descritivo do webhook |
| `Transacional` | `bit` | **Transacional** | Se garante entrega transacional |

---

## Relacionamento Completo — Consulta Automática

```
TBLoteImportacoes ──────── TBEquipamentos
   │ Id                          │ Id
   │                             │
   └──────────────────────────── FK
   │
   │ [cada linha do lote gera]
   ▼
TBInfracoes / TBPassagens
   │ Id
   │ ClassificacaoVeiculo_id ──► TBClassificacoesVeiculos
   │ LoteImportacao_id       ──► TBLoteImportacoes
   │
   │ [consulta automática ao WS externo]
   ▼
TBVeiculos
   │ Infracao_id ──────────────► TBInfracoes
   │ PassagemCronotacografo_id ► TBPassagensCronotacografos
   │ (MarcaVeiculo, ModeloVeiculo, AnoVeiculo,
   │  TipoVeiculo, Especie, Categoria, Cor,
   │  NomeProprietario, Renavam, Chassi,
   │  WebServiceConsultado, DataHoraConsulta)
   │
TBPassagemDadosVeiculos
   │ Passagem_id ──────────────► TBPassagens
   │ (Marca, MarcaModelo, Cor — identificados por IA/OCR)
```

---

## Tabelas de Domínio para Cadastro Manual

Estas tabelas são populadas uma vez (pela equipe de configuração) e servem de referência para classificar os dados retornados pela consulta automática.

| Tabela | Tela no Sistema | Campos | Uso |
|---|---|---|---|
| `TBTipoVeiculos` | Veículos → Tipos | `Codigo`, `Nome` | Automóvel, Caminhão, Ônibus, Motocicleta |
| `TBEspecieVeiculos` | Veículos → Espécies | `Codigo`, `Nome` | Passageiro, Carga, Misto |
| `TBCategoriaVeiculos` | Veículos → Categorias | `Codigo`, `Nome` | Particular, Aluguel, Oficial |
| `TBMarcaVeiculos` | Veículos → Marcas | `Codigo`, `Nome`, `Keywords` | Toyota, VW, Honda |
| `TBMarcaModeloVeiculos` | Veículos → Modelos | `Modelo`, `Codigo`, `Marca`, `Keywords` | Corolla, Gol, Civic |
| `TBCores` | Veículos → Cores | `Codigo`, `Nome` | Prata, Branco, Preto |
| `TBClassificacoesVeiculos` | Veículos → Classificações | `Codigo`, `Descricao`, `ComprMin`, `ComprMax` | Pequeno, Médio, Grande |

---

## Scripts SQL para Consulta de Dados

### Consultar histórico de consultas ao Web Service

```sql
SELECT TOP 100
    v.DataHoraConsulta      AS [Data Consulta],
    v.WebServiceConsultado  AS [Web Service],
    i.PlacaVeiculo          AS [Placa],
    v.MarcaVeiculo          AS [Marca],
    v.ModeloVeiculo         AS [Modelo],
    v.AnoVeiculo            AS [Ano Fab.],
    v.AnoModelo             AS [Ano Modelo],
    v.TipoVeiculo           AS [Tipo],
    v.Especie               AS [Espécie],
    v.Categoria             AS [Categoria],
    v.Cor                   AS [Cor],
    v.NomeProprietario      AS [Proprietário],
    v.UfPlaca               AS [UF],
    v.Restricao             AS [Restrição],
    v.Debitos               AS [Débitos]
FROM TBVeiculos v
INNER JOIN TBInfracoes i ON v.Infracao_id = i.Id
WHERE v.DataHoraConsulta >= DATEADD(day, -7, GETDATE())
ORDER BY v.DataHoraConsulta DESC;
```

### Identificar infrações sem consulta realizada

```sql
SELECT
    i.Id                AS InfracaoId,
    i.PlacaVeiculo      AS Placa,
    i.DataHoraPassagem  AS DataPassagem,
    i.StatusProcessamento
FROM TBInfracoes i
LEFT JOIN TBVeiculos v ON v.Infracao_id = i.Id
WHERE v.Id IS NULL
  AND i.PlacaVeiculo IS NOT NULL
  AND i.PlacaVeiculo != ''
ORDER BY i.DataHoraPassagem DESC;
```

### Consultar erros de importação de lote

```sql
SELECT
    l.NomeArquivoEntrada    AS [Arquivo],
    l.CodigoEquipamento     AS [Equipamento],
    l.StatusImportacao      AS [Status],
    l.DataRemessa           AS [Data],
    e.CodigoErro            AS [Cód. Erro],
    e.DescicaoErro          AS [Descrição do Erro],
    e.Sequencia             AS [Linha]
FROM TBLoteImportacoes l
INNER JOIN TBLoteImportacaoErros e ON e.LoteImportacao_id = l.Id
ORDER BY l.DataRemessa DESC;
```

### Verificar status dos lotes de exportação

```sql
SELECT
    x.DataHoraGeracao       AS [Gerado em],
    x.StatusExportacao      AS [Status],
    x.TipoInfracao          AS [Tipo],
    x.DataIncialInfracoes   AS [Período início],
    x.DataFinalInfracoes    AS [Período fim],
    x.Sequencial            AS [Sequencial],
    x.Mensagem              AS [Retorno órgão]
FROM TBLoteExportacoes x
ORDER BY x.DataHoraGeracao DESC;
```

### Consultar passagens com dados de veículo (OCR/IA)

```sql
SELECT
    p.DataHoraPassagem          AS [Data/Hora],
    p.PlacaVeiculo              AS [Placa],
    d.Marca                     AS [Marca],
    d.MarcaModelo               AS [Marca/Modelo],
    d.Cor                       AS [Cor],
    c.Descricao                 AS [Classificação],
    p.TamanhoVeiculo            AS [Tamanho (cm)],
    p.VelocidadeMedida          AS [Velocidade],
    e.Codigo                    AS [Equipamento]
FROM TBPassagens p
LEFT JOIN TBPassagemDadosVeiculos d     ON d.Passagem_id = p.Id
LEFT JOIN TBClassificacoesVeiculos c    ON c.Id = p.ClassificacaoVeiculo_id
LEFT JOIN TBEquipamentos e              ON e.Id = p.Equipamento_id
WHERE p.DataHoraPassagem >= DATEADD(day, -1, GETDATE())
ORDER BY p.DataHoraPassagem DESC;
```

### Integração: verificar webhooks configurados

```sql
SELECT
    Nome                        AS [Nome],
    UniformResourceIdentifier   AS [URL destino],
    Evento                      AS [Evento],
    Ativo                       AS [Ativo],
    Transacional                AS [Transacional]
FROM TBWebHooks
ORDER BY Ativo DESC, Nome;
```

---

## Pontos de Atenção na Integração

| Item | Descrição |
|---|---|
| **Placa nula** | Se `PlacaVeiculo IS NULL`, a consulta não é realizada. Verificar OCR do equipamento. |
| **WS indisponível** | Se o Web Service estiver offline, `TBVeiculos` não é populado. `DataHoraConsulta` ficará nulo. |
| **Consulta por infração** | `TBVeiculos.Infracao_id` é FK para `TBInfracoes` — uma infração pode ter no máximo 1 registro em `TBVeiculos`. |
| **Dados de OCR vs WS** | `TBPassagemDadosVeiculos` usa OCR/IA (identificação visual). `TBVeiculos` usa o WS externo (cadastro oficial). São fontes diferentes. |
| **Ano como inteiro** | `AnoVeiculo` e `AnoModelo` são `int`, não `date`. Use diretamente como número: `WHERE AnoVeiculo = 2022`. |
| **CPF/CNPJ sem máscara** | O campo `CpfCnpj` armazena apenas números (11 ou 14 dígitos), sem pontos ou traços. |
| **Débitos e restrições** | Os campos `Debitos` e `Restricao` são texto livre retornado pelo WS — não há estrutura padronizada. |

---

## Navegação Relacionada

- [Classificação de Veículos — Integração](./classificacao-veiculos-integracao.md)
- [Banco de Dados — Referência](./banco-de-dados.md)
- [Tipos de Veículos](../veiculos/tipos-veiculos.md)
- [Espécies de Veículos](../veiculos/especie-veiculo.md)
- [Marcas de Veículos](../veiculos/marcas-veiculos.md)
