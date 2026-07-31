---
sidebar_position: 2
title: Tickets de Pesagens
description: Gerenciamento de tickets de pesagem no AxTon
---

# Tickets de Pesagens

![Tela de Tickets de Pesagens](../img/axton-tickets.png)

Os Tickets de Pesagens registram todas as pesagens realizadas nas operações. Cada ticket contém os dados do Veículo peso medido, classificação e status da pesagem.

## Como acessar

**Menu lateral** → **Tickets de Pesagens**

## Listagem

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Data** | Data e hora da pesagem |
| **Placa** | Placa do Veículo pesado |
| **PBT** | Peso Bruto Total regulamentado da classificação (em toneladas) |
| **Eixos** | Configuração de eixos (dianteiros/traseiros) |
| **Classe** | Classe do Veículo (ex: 3S3, 3T6, 3C) |
| **Status** | Finalizado ou Em andamento |
| **Ações** | Visualizar |

### Exemplos de registros reais

| Data | Placa | PBT (t) | Eixos | Classe | Status |
|------|-------|---------|-------|--------|--------|
| 27/02/2026 13:42 | **SGD5E44** | 48,5 | 3/6 | 3S3 | Finalizado |
| 27/02/2026 09:06 | **RSC7D78** | 74 | 5/9 | 3T6 | Finalizado |
| 27/02/2026 08:58 | **RXQ0F30** | 74 | 5/9 | 3T6 | Finalizado |
| 26/02/2026 17:06 | **SXG5E80** | 74 | 5/9 | 3T6 | Finalizado |
| 26/02/2026 14:17 | **ROM5J10** | 23 | 2/3 | 3C | Finalizado |
| 26/02/2026 08:04 | **GZV8I81** | 48,5 | 3/6 | 3S3 | Finalizado |

### Status dos Tickets

| Status | Descrição |
|--------|-----------|
| **Finalizado** | Pesagem concluída e registrada |
| **Em andamento** | Pesagem iniciada, aguardando finalização |

## Iniciar Nova Pesagem

Clique em **+ Nova Pesagem** para iniciar o processo de pesagem. Isso redireciona para a tela de **Iniciar Pesagem**.

### Passo a passo

1. Clique em **+ Nova Pesagem**
2. **Seleção do Tipo do Veículo busque pela classificação ou PBT e selecione o tipo
3. **Informe a Placa** do Veículo
4. Clique em **Continuar**
5. O sistema conecta com a balança e registra o peso
6. Confirme os dados e clique em **Finalizar**

## Visualizar Ticket

Clique em **Visualizar** para ver os detalhes completos de um ticket:

| Informação | Descrição |
|-------------|-----------|
| **Placa** | Placa do Veículo |
| **Classe** | Classificação do Veículo |
| **PBT Regulamentado** | Peso máximo permitido (t) |
| **PBT Medido** | Peso efetivamente medido (kg) |
| **Eixos Medidos** | Peso individual por eixo |
| **Resultado** | Regular ou Infração (com tipo) |
| **Operador** | Usuário que registrou a pesagem |
| **Operação** | Operação vinculada |

## Veja também

| Funcionalidade | Descrição |
|---|---|
| [**Iniciar Pesagem**](../pesagem/ticket-aberto) | Fluxo completo de pesagem |
| [**Reclassificar**](../pesagem/reclassificar) | Corrigir a classificação de um ticket |
| [**Exportação**](../infracoes/exportacao) | Enviar Infrações ao órgão autuador |

---

## Veja também

| Funcionalidade | Descrição |
|---|---|
| [**Tickets Fechados**](../pesagem/ticket-fechado) | Consulta de tickets de pesagem já finalizados |

## Perguntas frequentes

**O que fazer quando a balança não está conectada e o ticket fica em andamento indefinidamente?**
Verifique a conexão de rede entre o computador e a balança HAENNI, confirme a URL configurada em **Sistema → HAENNI** e verifique se o número de balanças ativas exibido no menu lateral está acima de 0. Após restabelecer a conexão, inicie um novo ticket.

**Por que a classificação selecionada na Etapa 1 é tão importante para o resultado da pesagem?**
A classificação define o PBT máximo permitido para o veículo. Uma classificação errada pode gerar infração indevida (classificação com PBT menor que o real) ou não gerar infração quando deveria (classificação com PBT maior). Caso perceba o erro após finalizar, use a função **Reclassificar**.

**É possível cancelar um ticket que já foi iniciado mas não finalizado?**
Sim. Enquanto o ticket estiver com status **Em Andamento**, ele pode ser cancelado pelo operador. Tickets cancelados não geram infração e ficam registrados no histórico de **Tickets Fechados** com status correspondente.

## Integração com outros módulos

| Módulo | Como se relaciona com Tickets Abertos |
|--------|---------------------------------------|
| **Iniciar Pesagem** | Cria o ticket em andamento que é listado aqui até a finalização |
| **Reclassificar** | Permite corrigir a classificação de um ticket após a pesagem |
| **Tickets Fechados** | Destino dos tickets após finalização — mantém o histórico completo |
| **Operações** | O ticket é vinculado à operação ativa no momento da pesagem |
