---
sidebar_position: 5
title: Classificação de Veículos — Integração
description: Referência técnica completa para integração e importação de dados de classificação de Veículos no AxHub e AxCross
---

# Classificação de Veículos — Integração de Dados

> **Objetivo:** Guia técnico para equipes de integração e importação de dados. Descreve as tabelas, colunas, relacionamentos e fluxo de dados da classificação de Veículos nos sistemas **AxHub** e **AxCross**.

---

## O que é a Classificação de Veículos

A classificação de Veículos é o mecanismo que categoriza cada Veículo detectado pelos Equipamentos de fiscalização com base em seu **comprimento físico** (medido em centímetros pelos sensores). Essa categorização impacta diretamente:

- Aplicação correta de **enquadramentos** de Infração
- Cálculo de **velocidade regulamentada** por porte
- Regras de **exceção** (isenção de autuação por classe)
- Restrições em **pesagem** e **cronotacógrafo**
- Fluxo de **exportação** de lotes ao DETRAN/DER/PRF
- Contagens e Relatórios de **medição contratual**

No **AxCross**, a classificação é usada para segmentar o fluxo de Veículos monitorados nos cruzamentos (Grande, Médio, Pequeno), permitindo Análises estatísticas por porte.

---

## Tabela Principal — AxHub

### `TBClassificacoesVeiculos`

Tabela mestre de classificações. Cada registro define uma categoria de Veículo com seus critérios de enquadramento físico.

| Coluna (Banco de Dados) | Tipo | Nulo | Nome no Sistema | Descrição |
|---|---|:---:|---|---|
| `Id` | `uniqueidentifier` | Não | **ID** | Chave primária (GUID) |
| código | `nvarchar(50)` | Não | **Código** | Código identificador (ex: `2`, `4`, `6`) |
| `Descricao` | `nvarchar(100)` | Não | **Descrição** | Nome da classificação (ex: `Pequeno`, `Médio`, `Grande`) |
| `LabelRedeNeural` | `nvarchar(100)` | Sim | **Label IA** | Rótulo usado pela rede neural de identificação |
| `ComprimentoMinimoVeiculo` | `float` | Sim | **Comprimento Mínimo** | Comprimento mínimo em cm para enquadramento nesta classe |
| `ComprimentoMaximoVeiculo` | `float` | Sim | **Comprimento Máximo** | Comprimento máximo em cm para enquadramento nesta classe |
| `PbtVeiculo` | `float` | Sim | **PBT** | Peso Bruto Total máximo permitido (kg) |
| `Uvp` | `float` | Sim | **UVP** | Unidade de Veículo-Padrão (coeficiente para medição) |
| `DataCriacao` | `datetime` | Sim | **Criado em** | Data/hora de criação do registro |
| `DataAtualizacao` | `datetime` | Sim | **Atualizado em** | Data/hora da última atualização |
| `CriadoPor` | `nvarchar(100)` | Sim | **Criado por** | Login do Usuário que criou |
| `AtualizadoPor` | `nvarchar(100)` | Sim | **Atualizado por** | Login do Usuário que atualizou |

**Exemplo de registros padrão:**

| Código | Descrição | Comprimento Mínimo (cm) | Comprimento Máximo (cm) |
|:---:|---|:---:|:---:|
| `2` | Pequeno | 1 | 199 |
| `4` | Médio | 200 | 599 |
| `6` | Grande | 600 | 9999 |

**Chave primária:** `Id` (GUID)
**Caminho no sistema:** Menu lateral → Veículos → **Classificações de Veículos

---

## Tabela de Exceções — AxHub

### `TBExcecoesClassificacoesVeiculos`

Tabela de relacionamento N:N entre classificações e regras de exceção. Permite isentar classes específicas de autuação.

| Coluna (Banco de Dados) | Tipo | Nulo | Nome no Sistema | Descrição |
|---|---|:---:|---|---|
| `Id` | `uniqueidentifier` | Não | **ID** | Chave primária (GUID) |
| `ClassificacaoVeiculo_id` | `uniqueidentifier` | Não | **Classificação** | FK → `TBClassificacoesVeiculos.Id` |
| `Excecao_id` | `uniqueidentifier` | Não | **Exceção** | FK → `TBExcecoes.Id` |
| `DataCriacao` | `datetime` | Sim | **Criado em** | Data/hora de criação |
| `DataAtualizacao` | `datetime` | Sim | **Atualizado em** | Data/hora de atualização |
| `CriadoPor` | `nvarchar(100)` | Sim | **Criado por** | Login do Usuário |
| `AtualizadoPor` | `nvarchar(100)` | Sim | **Atualizado por** | Login do Usuário |

---

## Tabela de View Consolidada — AxHub

### `TBVeiculosClassificacao`

View/tabela de apoio para Relatórios — consolida placa, descrição da classificação e contagem de passagens.

| Coluna (Banco de Dados) | Tipo | Nome no Sistema | Descrição |
|---|---|---|---|
| `PlacaVeiculo` | `nvarchar(10)` | **Placa** | Placa do Veículo |
| `Descricao` | `nvarchar(100)` | **Classificação** | Descrição da classificação |
| `Qtde` | `int` | **Quantidade** | Número de passagens |

---

## Tabelas que Referenciam `ClassificacaoVeiculo_id` — AxHub

A classificação é aplicada automaticamente pelo Equipamento no momento da captura e persistida em todas as tabelas transacionais:

| Tabela | Módulo | Contexto de Uso |
|---|---|---|
| `TBInfracoes` | Infrações | Classe do Veículo no momento da Infração — impacta enquadramento e velocidade permitida |
| `TBPassagens` | Passagens | Classe detectada na passagem — base para contagens e Relatórios de fluxo |
| `TBPassagensConjugadas` | Operações | Passagens combinadas (radar + câmera) — classe usada para correlação |
| `TBPassagensCronotacografos` | Cronotacógrafo | Passagens com verificação de jornada — classifica porte do Veículo |
| `TBPassagensMonitoramentos` | Monitoramento | Passagens em modo de monitoramento de alerta — registra classe |
| `TBTicketPesagens` | Balança/Pesagem | Ticket de pesagem — classe do Veículo no posto balança |
| `TBExcecoesClassificacoesVeiculos` | Exceções | Regra de isenção por classe de Veículo |

---

## Relacionamentos — Diagrama

```
TBClassificacoesVeiculos (mestre)
│
│ Id ──────────────────────────────────────────────────────────────────────┐
│ │
├─── FK ──► TBInfracoes.ClassificacaoVeiculo_id │
├─── FK ──► TBPassagens.ClassificacaoVeiculo_id │
├─── FK ──► TBPassagensConjugadas.ClassificacaoVeiculo_id │
├─── FK ──► TBPassagensCronotacografos.ClassificacaoVeiculo_id │
├─── FK ──► TBPassagensMonitoramentos.ClassificacaoVeiculo_id │
├─── FK ──► TBTicketPesagens.ClassificacaoVeiculo_id │
└─── FK ──► TBExcecoesClassificacoesVeiculos.ClassificacaoVeiculo_id ──────┘
                          │
                          └─── FK ──► TBExcecoes.Id
```

---

## Como a Classificação é Atribuída

### Automática (pelo Equipamento
O sensor mede o comprimento físico do Veículo (em cm) durante a passagem. O sistema consulta `TBClassificacoesVeiculos` e aplica a classificação cujo intervalo `[ComprimentoMinimoVeiculo, ComprimentoMaximoVeiculo]` contempla o valor medido.

O campo `TamanhoVeiculo` (presente em todas as tabelas transacionais) armazena o valor bruto em cm medido pelo sensor.

### Reclassificação Manual
Na tela de triagem ou consulta de Infrações um analista pode reclassificar o Veículo Quando isso ocorre, o campo `ReClassificado = true` é marcado na `TBInfracoes`.

### Por Rede Neural (IA)
Se o sistema possuir módulo de IA configurado, o campo `LabelRedeNeural` da classificação é usado para correlação com o resultado da predição.

---

## AxCross — Classificação de Veículos

No AxCross (sistema de monitoramento de cruzamentos), a classificação usa uma estrutura simplificada, gerenciada pela tela **Classificações dos Veículos (`/occurrences/vehicleclassification`).

### Tabela equivalente no AxCross

A classificação no AxCross é armazenada como atributo da passagem na tabela `TBPassagens`:

| Coluna (Banco de Dados) | Tipo | Nome no Sistema | Descrição |
|---|---|---|---|
| `Id` | `INT IDENTITY` | **ID** | Chave primária auto-incremento |
| `Placa` | `nvarchar(20)` | **Placa** | Placa do Veículo |
| `DataPassagem` | `datetime` | **Data/Hora** | Data e hora da passagem |
| `Velocidade` | `decimal(10,2)` | **Velocidade** | Velocidade medida (km/h) |
| `FaixaId` | `INT` | **Faixa** | FK → `TBFaixas.Id` |
| `EquipamentoId` | `INT` | Equipamento | FK → `TBEquipamentos.Id` |
| `LocalId` | `INT` | **Local** | FK → `TBLocais.Id` |
| `ImagemPath` | `nvarchar(500)` | **Imagem** | Caminho da imagem capturada |

> **Nota:** No AxCross, as classificações (Grande/Médio/Pequeno) são cadastradas via interface e associadas às passagens com base nas mesmas faixas de comprimento. O campo de classificação é gerenciado pela tabela configurada no módulo de ocorrências.

---

## Guia de Importação — AxHub

### Pré-requisitos
Antes de importar dados transacionais que referenciam classificações, garanta que a tabela `TBClassificacoesVeiculos` esteja populada com os registros corretos.

### Script de Verificação

```sql
-- Verificar classificações cadastradas
SELECT
    código AS [Código],
    Descricao AS [Descrição],
    ComprimentoMinimoVeiculo AS [Comp. Mínimo (cm)],
    ComprimentoMaximoVeiculo AS [Comp. Máximo (cm)],
    PbtVeiculo AS [PBT (kg)],
    Uvp AS [UVP],
  LabelRedeNeural AS [Label IA]
FROM TBClassificacoesVeiculos
ORDER BY ComprimentoMinimoVeiculo;
```

### Script de Importação das Classificações

```sql
-- Inserir classificações padrão (se não existirem)
IF NOT EXISTS (SELECT 1 FROM TBClassificacoesVeiculos WHERE código = '2')
INSERT INTO TBClassificacoesVeiculos (
    Id, DataCriacao, CriadoPor,
    código Descricao, ComprimentoMinimoVeiculo, ComprimentoMaximoVeiculo
)
VALUES (
    NEWID(), GETDATE(), 'importacao',
    '2', 'Pequeno', 1, 199
);

IF NOT EXISTS (SELECT 1 FROM TBClassificacoesVeiculos WHERE código = '4')
INSERT INTO TBClassificacoesVeiculos (
    Id, DataCriacao, CriadoPor,
    código Descricao, ComprimentoMinimoVeiculo, ComprimentoMaximoVeiculo
)
VALUES (
    NEWID(), GETDATE(), 'importacao',
    '4', 'Médio', 200, 599
);

IF NOT EXISTS (SELECT 1 FROM TBClassificacoesVeiculos WHERE código = '6')
INSERT INTO TBClassificacoesVeiculos (
    Id, DataCriacao, CriadoPor,
    código Descricao, ComprimentoMinimoVeiculo, ComprimentoMaximoVeiculo
)
VALUES (
    NEWID(), GETDATE(), 'importacao',
    '6', 'Grande', 600, 9999
);
```

### Resolução de ClassificacaoVeiculo_id na Importação de Passagens

```sql
-- Ao importar TBPassagens, resolver o GUID da classificação pelo tamanho medido
-- Exemplo: linking por ComprimentoMinimo/Maximo
SELECT
    p.Id AS PassagemId,
    p.TamanhoVeiculo AS TamanhoMedido_cm,
    c.Id AS ClassificacaoVeiculo_id,
    c.Descricao AS Classificacao
FROM TBPassagens p
LEFT JOIN TBClassificacoesVeiculos c
    ON p.TamanhoVeiculo BETWEEN c.ComprimentoMinimoVeiculo AND c.ComprimentoMaximoVeiculo
WHERE p.ClassificacaoVeiculo_id IS NULL -- passagens sem classificação
ORDER BY p.DataHoraPassagem DESC;

-- Atualizar passagens sem classificação
UPDATE p
SET p.ClassificacaoVeiculo_id = c.Id
FROM TBPassagens p
INNER JOIN TBClassificacoesVeiculos c
    ON p.TamanhoVeiculo BETWEEN c.ComprimentoMinimoVeiculo AND c.ComprimentoMaximoVeiculo
WHERE p.ClassificacaoVeiculo_id IS NULL;
```

---

## Guia de Importação — AxCross

### Script de Verificação

```sql
-- No AxCross, verificar passagens e Equipamentos
SELECT
    p.Id,
    p.Placa,
    p.DataPassagem,
    p.Velocidade,
    f.Nome AS Faixa,
    e.Nome AS Equipamento
    l.Nome AS Local
FROM TBPassagens p
INNER JOIN TBFaixas f ON p.FaixaId = f.Id
INNER JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
INNER JOIN TBLocais l ON p.LocalId = l.Id
ORDER BY p.DataPassagem DESC;
```

---

## Diferenças entre AxHub e AxCross

| Aspecto | AxHub | AxCross |
|---|---|---|
| **Tabela mestre** | `TBClassificacoesVeiculos` | Gerenciado via interface `/vehicleclassification` |
| **Chave primária** | `uniqueidentifier` (GUID) | `INT IDENTITY` (auto-incremento) |
| **Campos técnicos** | ComprimentoMin, ComprimentoMax, PBT, UVP, LabelIA | Nome da classe |
| **Tabelas filhas** | 7 tabelas transacionais | `TBPassagens` (campo de classificação) |
| **Reclassificação** | Campo `ReClassificado` em `TBInfracoes` | Não aplicável |
| **Impacto em Infração | Sim — altera enquadramento e velocidade permitida | Não (sistema de monitoramento) |
| **Impacto em pesagem** | Sim — `TBTicketPesagens` | Não aplicável |
| **Uso pela IA** | Campo `LabelRedeNeural` para correlação | Não aplicável |

---

## Perguntas Frequentes — Integração

**P: Ao importar Infrações o campo `ClassificacaoVeiculo_id` é obrigatório?**
R: Não — é `NULL`, mas recomenda-se popular para garantir enquadramento correto. Use o script de resolução acima.

**P: Posso usar o código da classificação em vez do `Id` (GUID) na importação?**
R: Não diretamente — as FKs usam o `Id` (GUID). Faça um lookup: `SELECT Id FROM TBClassificacoesVeiculos WHERE código = '4'`.

**P: Os dados de AxCross e AxHub são sincronizados?**
R: Não automaticamente. São bancos independentes. A integração deve ser feita via ETL ou API, mapeando as classificações por nome (ex: `Grande`, `Médio`, `Pequeno`).

**P: O campo `TamanhoVeiculo` (int) é suficiente para reclassificar?**
R: Sim — ele armazena o comprimento em cm medido pelo sensor. Use o JOIN com `ComprimentoMinimoVeiculo` e `ComprimentoMaximoVeiculo` para obter a classificação correta.

---

## Navegação Relacionada

- [Classificações de Veículos — Cadastro](../veiculos/classificacoes-veiculos.md)
- [Exceções](../infracoes/excecoes.md)
- [Triagem de Infrações](../infracoes/triagem.md)
