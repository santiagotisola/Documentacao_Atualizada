---
sidebar_position: 3
title: Sequencial de Infração
description: Configuração do sequencial de numeração de Infrações no AxTon
---

# Sequencial de Infração

![Tela de Sequenciais de Infração](../img/axton-sequenciais-infracoes.png)

O sequencial de Infração define a **numeração dos autos de Infração gerados pelo sistema. Há um sequencial independente para cada **tipo de Infração (Excesso de PBT, Excesso de Eixo, Excesso de Eixo/PBT).

## Como acessar

**Menu lateral** → **Sequênciais de Infração

## Listagem

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Sequêncial Inicial** | Número de início da contagem |
| **Prefixo** | Número máximo até onde o sequêncial vai (limite superior) |
| **Tipo de Infração | Qual tipo de Infração esse sequêncial controla |
| **Ações** | Editar e Excluir |

### Sequênciais cadastrados no sistema

| Sequêncial Inicial | Até | Tipo de Infração |
|--------------------|-----|------------------|
| **212** | 99.999 | Excesso de PBT |
| **1.060** | 99.999 | Excesso de Eixo |
| **1.098** | 99.999 | Excesso de Eixo/PBT |

## Tipos de Infração

| Tipo | Quando ocorre |
|------|---------------|
| **Excesso de PBT** | Peso Bruto Total medido supera o PBT Regulamentado + tolerância |
| **Excesso de Eixo** | Peso em um ou mais eixos supera o limite por eixo + tolerância |
| **Excesso de Eixo/PBT** | Excesso simultâneo tanto no PBT quanto em eixo |

## Cadastro

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Sequêncial Inicial** | Sim | Número de início da contagem de Infrações |
| **Prefixo (Até)** | Sim | Limite superior da numeração |
| **Tipo de Infração | Sim | Excesso de PBT, Excesso de Eixo ou Excesso de Eixo/PBT |

### Passo a passo — Configurar sequêncial

1. No menu lateral, clique em **Sequênciais de Infração
2. Clique em **+ Novo**
3. Informe o **Sequêncial Inicial** (próximo número a ser usado)
4. Informe o valor **Até** (normalmente 99999)
5. Selecione o **Tipo de Infração
6. Clique em **Salvar**

:::warning Atenção
Configure um sequêncial para **cada tipo de Infração Se algum tipo não tiver sequêncial configurado, Infrações daquele tipo não poderão ser numeradas corretamente.
:::

:::tip Dica
Quando o número atingir o limite, edite o sequêncial com um novo número inicial ou amplie o valor máximo.
:::

## Veja também

| Funcionalidade | Descrição |
|---|---|
| [**Sequênciais de Exportação**](../infracoes/exportacao) | Números dos lotes de exportação |
| [**Configurações**](../sistema/configuracoes) | Tolerâncias e enquadramentos de Infração |

## Fluxo de gestão de sequenciais

1. Antes de iniciar as operações, configurar um sequencial para **cada tipo de infração**
2. Durante as operações, o sistema atribui números automaticamente
3. Monitorar o valor atual vs. o limite máximo mensalmente
4. Ao atingir 80% do limite: criar nova série ou ampliar o **Prefixo (Até)**
5. Comunicar ao órgão autuador antes de reiniciar a numeração

## Tabela de referência — tipos de infração e sequenciais

| Tipo de Infração | Quando ocorre | Sequencial obrigatório |
|-----------------|---------------|:---------------------:|
| Excesso de PBT | PBT medido > PBT regulamentado + tolerância | Sim |
| Excesso de Eixo | Peso por eixo excede o limite | Sim |
| Excesso de Eixo/PBT | Excesso simultâneo no eixo e no PBT | Sim |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Infração sem número atribuído | Sequencial não cadastrado para o tipo | Criar sequencial do tipo correspondente |
| Número duplicado gerado | Sequencial editado manualmente | Nunca editar sem verificar histórico |
| Lote rejeitado por sequencial | Série esgotada | Verificar e ampliar o limite superior |

### Ações disponíveis na listagem

| Ação | Descrição |
|------|-----------|
| **+ Novo** | Cadastrar um novo sequencial |
| **Pesquisa** | Buscar sequenciais por qualquer campo |
| **Editar** | Alterar os dados de um sequencial existente (ícone lápis) |
| **Excluir** | Remover um sequencial do sistema (ícone X) |

## Perguntas frequentes

**O número do sequencial de infração é o mesmo número do auto?**
Sim. O sequencial define a numeração do auto de infração. Configure os números de início alinhados com o órgão autuador para evitar duplicidades na base.

**O que acontece quando o sequencial é esgotado?**
Novas infrações do tipo correspondente não receberão numeração e ficarão bloqueadas. Monitore o valor atual mensalmente e amplie o limite antes do esgotamento.

**Posso editar o sequencial inicial manualmente?**
Não recomendado. Editar manualmente sem verificar o histórico pode gerar números duplicados. Qualquer alteração deve ser comunicada ao órgão autuador.

## Cadastro

![Tela de Sequencial de Infração — Dados](../img/sequencial-infracao-dados.png)

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Código** | Sim | Código único de identificação do sequencial |
| **Descrição** | Sim | Identificação do sequencial para fins de controle interno |
| **Número Inicial** | Sim | Número a partir do qual a contagem será iniciada |
| **Número Atual** | Sim | Número atual do sequencial (atualizado automaticamente a cada Infração gerada) |
| **Prefixo** | Não | Prefixo alfanumérico incluído antes do número no auto de Infração |
| **Ativo** | Sim | Define se o sequencial estará disponível para geração de Infrações |

### Passo a passo — Cadastrar sequencial de Infração

1. Na listagem, clique em **+ Novo**
2. Informe o **Código** e a **Descrição** do sequencial
3. Defina o **Número Inicial** a partir do qual a contagem começará
4. Informe o **Prefixo**, se aplicável
5. Confirme que o campo **Ativo** está marcado
6. Clique em **Salvar**

:::warning Alteração do número atual
A alteração do **Número Atual** de um sequencial em uso deve ser realizada com cautela. Modificações incorretas podem gerar duplicidade ou lacunas na numeração dos autos de Infração comprometendo a rastreabilidade dos registros.
:::

---

## Fluxo de Exportação

O sequencial de Infração é utilizado na exportação de Infrações para o órgão autuador. Após o registro da Infração a exportação utiliza o próximo número sequencial disponível.

| Processo | Descrição |
|---|---|
| [**Exportação**](../infracoes/exportacao) | Envio de Infrações aprovadas em lotes para o órgão autuador |

## Boas práticas

- Configure um sequencial para **cada tipo de infração** (PBT, Eixo, Eixo/PBT) antes de iniciar a operação
- Defina o número inicial de acordo com o contrato — alguns órgãos exigem faixas específicas de numeração
- Nunca altere o **Número Atual** de um sequencial em produção sem alinhar com o órgão autuador

## Relacionado

- [Sequencial de Exportação](./sequencial-exportacao) — Numeração dos lotes de exportação
- [Configurações do Sistema](../sistema/configuracoes) — Tolerâncias e enquadramentos de infração
