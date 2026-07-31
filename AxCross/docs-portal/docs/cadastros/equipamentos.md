---
sidebar_position: 2
title: Equipamentos
description: Cadastro, gestão de faixas, grupos e áreas de Equipamentos no AxCross
---

# Equipamentos

Cadastro e gestão dos equipamentos de fiscalização instalados nos cruzamentos monitorados. Cada equipamento pode ter múltiplas **faixas** de captura, ser organizado em **grupos** e vinculado a **áreas** de monitoramento.

## Como acessar

No **menu lateral**, expanda **Cadastros** e clique em **Equipamentos**.

![Lista de Equipamentos](../img/Equipamentos.png)

:::info Permissões necessárias
Para **visualizar**: `equipment.index`  
Para **criar**: `equipment.create`  
Para **editar**: `equipment.edit`  
Para **excluir**: `equipment.delete`  
Para **gerenciar faixas**: `equipment.lane` (criar) e `equipment.deletelane` (excluir)
:::

---

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Nome identificador do equipamento |
| **Tipo** | Sim | Câmera, Detector, Sensor, Radar |
| **Modelo** | Sim | Modelo do equipamento |
| **Fabricante** | Sim | Fabricante do equipamento |
| **Número de Série** | Sim | Número de série para controle patrimonial |
| **Local** | Sim | Cruzamento onde está instalado |
| **IP** | Não | Endereço IP para comunicação e diagnóstico |
| **Status** | Sim | Online, Offline ou Manutenção |

---

## Passo a passo — Cadastrar novo equipamento

![Novo Equipamento](../img/Equipamentos.- novo.png)

1. Acesse **Cadastros → Equipamentos** no menu lateral
2. Clique em **Novo Equipamento**
3. Preencha **Nome**, **Tipo**, **Modelo** e **Fabricante**
4. Informe o **Número de Série**
5. Selecione o **Local** (cruzamento) de instalação
6. Opcionalmente, informe o **IP** do equipamento
7. Clique em **Salvar**
8. Após salvar, adicione as **Faixas** de captura (ver seção abaixo)

![Editar Equipamento](../img/Equipamento - Editar.png)

![Botões de Ação - Equipamentos](../img/botoes Equipamentos.png)

:::warning Atenção
Equipamentos vinculados a operações ativas não podem ser desativados sem encerrar a operação.
:::

---

## Faixas de Captura

Cada equipamento pode monitorar múltiplas faixas de pista simultaneamente. As faixas são utilizadas como filtro no Monitoramento Online, Relatórios e Rastreamento de Placas.

### Campos da faixa

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Número da Faixa** | Sim | Identificação numérica (ex.: Faixa 1, Faixa 2) |
| **Descrição** | Não | Sentido ou denominação da faixa (ex.: Centro/Bairro) |
| **Status** | Sim | Ativa ou Inativa |

### Como adicionar uma faixa

1. Na lista de equipamentos, clique no equipamento desejado
2. Na seção **Faixas**, clique em **+ Nova Faixa**
3. Informe o **Número** e opcionalmente a **Descrição**
4. Clique em **Salvar**

:::caution
Apenas uma faixa pode estar ativa por vez em cada equipamento durante uma operação. Verifique os status antes de iniciar o monitoramento.
:::

---

## Importação em lote

Para implantações com múltiplos equipamentos, utilize a importação em massa via arquivo.

![Importação de Equipamentos](../img/Importação de Equipamentos.png)

![Importação de Equipamentos - Selecionar Arquivo](../img/Importação de Equipamentos - importar.png)

1. Acesse **Cadastros → Equipamentos** no menu lateral
2. Clique em **Importar**
3. Selecione o arquivo CSV com os dados dos equipamentos
4. Confirme a importação

:::info Permissão necessária
`equipmentimport.index` — acesso ao processo de importação de equipamentos.
:::

---

## Grupos de Equipamentos

Agrupamento lógico de equipamentos para facilitar a gestão e o monitoramento de conjuntos relacionados (por exemplo, equipamentos de uma mesma região ou tipo de fiscalização).

![Lista de Grupos de Equipamentos](../img/Grupo de Equipamentos.png)

### Campos

| Campo | Obrigatório | Descrição |
|---|:---:|---|
| **Nome** | Sim | Nome identificador do grupo |
| **Descrição** | Não | Descrição do propósito do grupo |
| **Equipamentos** | Sim | Lista de equipamentos vinculados ao grupo |
| **Status** | Sim | Ativo ou Inativo |

### Criar novo grupo

![Novo Grupo de Equipamentos](../img/Grupo de Equipamentos - novo.png)

1. Na tela de **Grupos de Equipamentos**, clique em **Novo Grupo**
2. Informe o **Nome** e opcionalmente a **Descrição**
3. Adicione os **Equipamentos** ao grupo
4. Clique em **Salvar**

:::info Permissões necessárias
Para **visualizar**: `equipmentgroup.index`  
Para **criar**: `equipmentgroup.create`  
Para **editar**: `equipmentgroup.edit`  
Para **excluir grupo**: `equipmentgroup.delete`  
Para **remover equipamento do grupo**: `equipmentgroup.deleteequipmentfromequipmentgroup`
:::

## Erros comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Equipamento não captura passagens | Sem faixas ativas ou equipamento offline | Verificar faixas no cadastro e status de conexão de rede |
| Coordenadas incorretas no mapa | Latitude/Longitude trocadas | Verificar e corrigir as coordenadas geográficas no cadastro |
| Importação em lote falha | Formato do CSV incorreto ou campos obrigatórios ausentes | Verificar o modelo de CSV e preencher todos os campos obrigatórios |

## Perguntas frequentes

**O que fazer quando um equipamento cadastrado não aparece nas passagens do monitoramento?**
Verifique se o equipamento está com **Status = Online** e se tem faixas ativas vinculadas. Equipamentos sem faixas configuradas não capturam passagens. Acesse o cadastro do equipamento, adicione a faixa e verifique a conexão de rede.

**Posso ter múltiplas faixas ativas simultaneamente em um mesmo equipamento?**
Sim, um equipamento pode monitorar várias faixas de pista ao mesmo tempo. Cada faixa é configurada de forma independente e pode ser filtrada individualmente nos relatórios e no monitoramento.

**Como usar a importação em lote para cadastrar muitos equipamentos de uma vez?**
Acesse **Cadastros → Equipamentos → Importar** e selecione o arquivo CSV com os dados dos equipamentos. O sistema exige a permissão `equipmentimport.index`. Após a importação, verifique cada equipamento para adicionar as faixas manualmente, pois elas não são importadas no arquivo CSV.

---

## Áreas de Monitoramento

As **Áreas** agrupam equipamentos por localização geográfica ou corredor viário, permitindo monitoramento segmentado por região.

![Lista de Áreas](<../img/Áreas.png>)

### Diferença entre Grupo e Área

| Conceito | Finalidade |
|----------|------------|
| **Grupo de Equipamentos** | Agrupamento lógico para filtros e relatórios |
| **Área** | Agrupamento geográfico para monitoramento de manchas e comboios |

### Criar nova área

1. Acesse **Cadastros → Áreas** no menu lateral
2. Clique em **Nova Área**
3. Informe o **Nome da Área**
4. Adicione os equipamentos manualmente ou use **Adicionar Automaticamente**
5. Defina a **Sequência** de exibição dos equipamentos
6. Clique em **Salvar**

:::info Permissões necessárias
`area.index` — visualizar | `area.create` — criar | `area.edit` — editar  
`area.delete` — excluir | `area.addequipmentstoareaautomatically` — adicionar automático  
`area.clearareaequipments` — limpar todos os equipamentos | `area.reordersequence` — reordenar
:::

1. Acesse **Cadastros → Grupos de Equipamentos** no menu lateral
2. Clique em **Novo Grupo**
3. Informe o **Nome** do grupo
4. Opcionalmente, adicione uma **Descrição**
5. Selecione os Equipamentos a vincular ao grupo
6. Clique em **Salvar**

:::tip Dica
Grupos de Equipamentos facilitam o monitoramento simultâneo de vários pontos de fiscalização, permitindo visualizar o status de todos os Equipamentos de um conjunto de uma só vez.
:::

---

## Áreas

As **Áreas** permitem delimitar regiões geográficas no mapa e associar automaticamente os Equipamentos que estão dentro do perímetro desenhado. É útil para organizar o monitoramento por zonas, setores ou regiões da cidade.

![Área](<../img/Área - nome da areas.png>)

### Campos

| Campo | Obrigatório | Descrição |
|---|:---:|---|
| **Nome** | Sim | Nome identificador da área (ex.: CENTRAL, NORTE, SUL) |
| **Código da Área** | Sim | Código numérico único da área |
| **Cor** | Sim | Cor de identificação visual da área no mapa |

### Como funciona

A tela de Área é dividida em duas partes:

- **Mapa (esquerda)** — permite desenhar o perímetro da área diretamente sobre o mapa. Os Equipamentos localizados dentro da região selecionada são identificados automaticamente.
- **Equipamento das Áreas (direita)** — tabela que exibe todos os Equipamentos pertencentes à área selecionada no mapa, com o **Código**, quantidade de **Faixas** e o **Endereço** de cada Equipamento.

### Cadastrar nova área

1. Acesse **Cadastros → Áreas** no menu lateral
2. Clique em **Nova Área**
3. Informe o **Nome** e o **Código da Área**
4. Selecione a **Cor** de identificação
5. No mapa, clique em **Editar** para entrar no modo de desenho
6. Delimite o perímetro da área clicando no mapa para definir os vértices da região
7. O sistema preenche automaticamente a grade **Equipamento das Áreas** com os Equipamentos dentro do perímetro
8. Clique em **Salvar**

### Editar área existente

1. Localize a área na lista e clique no ícone de edição ✏️
2. Clique em **Editar** no mapa para reconfigurar o perímetro
3. Para limpar o desenho atual, clique em **Limpar**
4. Redesenhe o perímetro conforme necessário
5. Clique em **Salvar**

### Equipamento das Áreas

A grade lateral exibe em tempo real os Equipamentos contidos no perímetro desenhado:

| Coluna | Descrição |
|---|---|
| **Código** | Código do Equipamento (ex.: GYN7M719) |
| **Faixas** | Número de faixas monitoradas pelo Equipamento |
| **Endereço** | Localização do Equipamento (via/avenida) |

:::info Atualização automática
Ao editar o perímetro no mapa, a lista de **Equipamento das Áreas** é atualizada automaticamente para refletir os Equipamentos que entram ou saem da região delimitada.
:::

---

## Importação via AxHub

O AxCross permite importar automaticamente os dados de configuração dos Equipamentos já cadastrados no **AxHub**, eliminando a necessidade de recadastro manual. Esse processo aproveita as informações que já existem no cadastro de operações do AxHub, como nome, local, faixas e tipo de Equipamento.

![Importação](<../img/Importação.png>)

### Cadastro de Operações no AxHub

Os dados importados pelo AxCross têm origem no **Cadastro de Operações** do AxHub, acessível pelo caminho:

**Menu Operações → Cadastro de Operações**

![Cadastro de Operações](<../img/Cadastro de Operações.png>)

O Cadastro de Operações do AxHub reúne todos os Equipamentos e suas configurações operacionais (locais, faixas, velocidade máxima, modelo, etc.). Ao importar esses dados para o AxCross, o operador garante que ambos os sistemas trabalham com as mesmas referências de infraestrutura.

### Como realizar a importação

1. Acesse **Cadastros → Equipamentos** no menu lateral
2. Clique em **Importar**
3. Selecione o arquivo de configuração exportado pelo AxHub (formato CSV)
4. Confirme a importação

:::info Integração AxHub → AxCross
A importação sincroniza os dados cadastrais dos Equipamentos. Após a importação, revise os registros e ajuste configurações específicas do AxCross (como alertas e áreas) conforme necessário.
:::

---

## Locais

Cadastro dos cruzamentos e pontos monitorados pelo sistema AxCross. Um **Local** representa o endereço físico onde os Equipamentos estão instalados.

![Lista de Locais](<../img/Áreas.png>)

### Campos

| Campo | Obrigatório | Descrição |
|---|:---:|---|
| **Nome** | Sim | Nome identificador do local |
| **Endereço** | Sim | Endereço completo do cruzamento |
| **Latitude** | Não | Coordenada geográfica (latitude) |
| **Longitude** | Não | Coordenada geográfica (longitude) |
| **Município** | Sim | Município onde o local está situado |
| **UF** | Sim | Unidade Federativa |
| **Status** | Sim | Ativo ou Inativo |

### Cadastrar novo local

![Novo Local](<../img/Áreas novo.png>)

1. Acesse **Cadastros → Locais** no menu lateral
2. Clique em **Novo Local**
3. Preencha o **Nome** e **Endereço**
4. Informe **Município** e **UF**
5. Opcionalmente, informe **Latitude** e **Longitude** para geolocalização
6. Clique em **Salvar**

:::tip Dica
Com as coordenadas geográficas preenchidas, o local será exibido no mapa do monitoramento online.
:::

---

## Faixas

Configuração das faixas de monitoramento em cada cruzamento. Cada faixa representa uma via monitorada por Equipamentos de fiscalização.

### Campos

| Campo | Obrigatório | Descrição |
|---|:---:|---|
| **Local** | Sim | Cruzamento onde a faixa está localizada |
| **Número da Faixa** | Sim | Identificador numérico da faixa |
| **Sentido** | Sim | Sentido do fluxo (Norte, Sul, Leste, Oeste) |
| **Equipamento** | Sim | Equipamento vinculado à faixa |
| **Velocidade Máxima** | Não | Velocidade máxima regulamentada (km/h) |
| **Status** | Sim | Ativa ou Inativa |

### Cadastrar nova faixa

1. Acesse **Cadastros → Faixas** no menu lateral
2. Clique em **Nova Faixa**
3. Selecione o **Local** (cruzamento)
4. Informe o **Número da Faixa** e **Sentido**
5. Vincule o Equipamento responsável pelo monitoramento
6. Opcionalmente, defina a **Velocidade Máxima**
7. Clique em **Salvar**

:::info Dependência
Para cadastrar uma faixa, é necessário que o **Local** e o **Equipamento** já estejam cadastrados no sistema.
:::

## Integração VARCO

Os equipamentos de câmera **VARCO** se comunicam com o AxCross enviando dados de passagem via HTTP. As principais variáveis enviadas pelo VARCO:

| Variável VARCO | Mapeamento no AxCross |
|----------------|----------------------|
| `{{cameraId}}` | Nome do Equipamento |
| `{{equipmentId}}` | MAC Address (campo IP) |
| `{{lane}}` | Faixa de captura |
| `{{plate}}` | Placa detectada |
| `{{image}}` | Imagem base64 da passagem |
| `{{vehicleType}}` | Tipo do veículo |
| `{{vehicleBrand}}` | Marca do veículo |
| `{{vehicleColor}}` | Cor do veículo |
| `{{latitude}}` + `{{longitude}}` | Posição do equipamento |

→ Veja a [referência completa das variáveis VARCO](../referencia-tecnica/integracao-varco)
