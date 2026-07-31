---
sidebar_position: 3
title: Tickets Fechados
description: Histórico de tickets de pesagem finalizados no AxTon
---

# Tickets Fechados

![Layout do Ticket](../img/layout%20ticket%20Axton.png)

Registros de pesagem **já finalizados**. Permitem consulta histórica, geração de relatórios e comprovação de fiscalizações realizadas.

## Como acessar

**Menu lateral** → **Tickets de Pesagens** → **Fechados**

## Colunas

| Coluna | Descrição |
|--------|-----------|
| **Número** | Identificador do ticket |
| **Placa** | Veículo pesado |
| **Data** | Data da pesagem |
| **Posto** | Local da pesagem |
| **Peso aferido** | Peso registrado |
| **Resultado** | Regular / Infrator |
| **Status** | Liberado / Autuado |

## Ações disponíveis

| Ação | Descrição |
|------|-----------|
| **Visualizar** | Exibe detalhes completos do ticket |
| **Imprimir** | Gera o layout do ticket em PDF |
| **Exportar** | Inclui no CSV do relatório |

:::tip
Use o filtro **Infrator** para revisar tickets com infração gerada e verificar o status de exportação ao órgão autuador.
:::

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| **Placa** | Busca parcial ou completa |
| **Posto** | Filtrar por localidade |
| **Resultado** | Regular ou Infrator |

## Quando usar

| Situação | Quando consultar |
|-----------|------------------|
| **Auditoria de infrator** | Verificar se pesagem de um veículo gerou infração e se foi encerrada corretamente |
| **Comprovante de regularidade** | Pesquisa de veículos que passaram sem infração para registro operacional |
| **Relatório gerencial** | Exporte os dados fechados para compor boletim diário ou mensal de produção |
| **Conciliação contratual** | Validar volume de pesagens do posto no período de medição |

## Fluxo de consulta de ticket fechado

1. Acessar **Tickets de Pesagens → Fechados** no menu lateral
2. Definir o **Período** de consulta
3. Opcionalmente filtrar por **Placa**, **Posto** ou **Resultado** (Infrator)
4. Clicar em **Pesquisar**
5. Clicar sobre o ticket para ver detalhes completos com pesos por eixo
6. Para exportar: clicar em **Excel** ou selecionar para compor relatório

## Tabela de referência — campos do ticket

| Campo | Descrição | Quando verificar |
|-------|-----------|:-----------------:|
| **Resultado** | Regular ou Infrator | Sempre |
| **PBT Medido** | Peso bruto total aferido (kg) | Quando resultado = Infrator |
| **Eixos Medidos** | Peso por eixo | Quando excesso é por eixo |
| **Operação** | Operação vinculada | Para conciliação contratual |
| **Status** | Liberado / Autuado / Aguardando | Para acompanhamento da autuação |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Ticket não aparece na consulta | Filtro de data fora do período | Ampliar o período de busca |
| Peso exibido como zero | Falha na leitura da balança | Verificar log da pesagem e recalibrar |
| Infrator sem infração gerada | Triagem pendente ou sequencial esgotado | Verificar sequenciais de infração |
| Ticket sem imagem | Câmera IP não configurada | Configurar câmera em Sistema → Câmera IP |

## Relacionado

- [Tickets Abertos](./ticket-aberto)
- [Liberar Pesagem](./liberar-pesagem)
- [Relatório de Infrações](../relatorios/relatorio-infracoes)

## Filtros

- **Período**: data início e fim
- **Posto**: filtrar por localidade
- **Resultado**: regular ou infrator
- **Placa**: busca direta


| Coluna | Descrição |
|--------|-----------|
| **Nº Ticket** | Número sequencial do ticket |
| **Placa** | Placa do Veículo |
| **Data/Hora** | Data e hora da pesagem |
| **Peso Bruto** | Peso total registrado |
| **Peso Líquido** | Peso da carga (bruto - tara) |
| **Excesso** | Peso excedente ao PBT, se houver |
| **Posto** | Posto de pesagem |

### Filtros disponíveis

- Período (data inicial e final)
- Placa do Veículo
- Posto de pesagem
- Com/sem excesso de peso

### Passo a passo — Consultar Ticket

1. No menu lateral, clique em **Tickets de Pesagens** e filtre por Fechados
2. Defina os filtros de período
3. Opcionalmente, filtre por placa ou posto
4. Clique em **Pesquisar**
5. Clique sobre o ticket para ver os detalhes

## Perguntas frequentes

**Como verificar se um veículo que passou pelo posto gerou infração e qual foi o excesso de peso?**
Localize o ticket do veículo usando o filtro **Placa** combinado com o período da passagem. Nos detalhes do ticket, o campo **Resultado** indica se foi Regular ou Infrator, e o campo **Excesso** exibe o peso acima do PBT permitido.

**Posso imprimir o comprovante de pesagem de um ticket fechado?**
Sim. Clique em **Visualizar** para abrir o ticket e, em seguida, clique em **Imprimir** para gerar o PDF do comprovante. Esse documento pode ser entregue ao motorista como comprovante de regularidade ou de autuação.

**Por que um ticket fechado com resultado Infrator não tem infração gerada no Relatório de Infrações?**
Isso indica que o sequencial de infração pode estar esgotado ou não configurado. Acesse **Cadastros → Sequenciais de Infração** e verifique se há numereiros disponíveis e um sequencial ativo.
