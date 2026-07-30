---
sidebar_position: 6
title: Consulta de Placas
description: Consulta de passagens de veículos por placa no AxHub
---

# Consulta de Placas

Permite **consultar o histórico completo de passagens** de um veículo específico por número de placa em todos os equipamentos monitorados.

## Como acessar

**Acesso direto**: menu lateral → Operações → **Consulta de Placas**

:::info
Pode ser acessado também diretamente via URL: `/consultaplacas`
:::

## Filtros disponíveis

| Filtro | Obrigatório | Descrição |
|--------|:-----------:|-----------|
| **Placa** | Sim | Número da placa (formato Mercosul ou antigo) |
| **Período** | Sim | Data início e fim |
| **Equipamento** | Não | Filtrar por câmera específica |

## Resultados

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento da passagem |
| **Equipamento** | Equipamento que capturou |
| **Faixa** | Faixa da pista |
| **Velocidade** | Velocidade registrada |
| **Imagem** | Foto da passagem |
| **Infração** | Se gerou infração |

## Exportação

Clique em **Excel** para exportar o histórico de passagens.

:::tip
Use esta função para confirmar passagens denunciadas por cidadãos ou verificar histórico de veículos suspeitos.
:::

## Casos de uso

- **Verificação antes de liberar**: confirmar se o veículo tem histórico de irregularidades
- **Acompanhamento de auditoria**: verificar todas as passagens em período específico
- **Suporte ao cidadão**: esclarecer dúvidas sobre registros de infração

## Relacionado

- [Passagens](../relatorios/relatorio-passagens)
- [Triagem de Infrações](../infracoes/triagem)

A **Consulta de Placas** pode não aparecer no menu lateral dependendo das permissões do perfil de acesso. Nesse caso, acesse diretamente pela URL `/consultaplacas` ou verifique as permissões em [Controle de Acesso → Perfis](../controle-acesso/perfis-acesso).
:::

| Filtro | Descrição |
|--------|-----------|
| **Placa** | Número da placa do Veículo |
| **Período** | Faixa de data para a consulta |
| Equipamento | Filtrar por Equipamento específico |

| Coluna do Resultado | Descrição |
|---------------------|-----------|
| **Data/Hora** | Momento da passagem |
| Equipamento | Onde o Veículo foi registrado |
| **Faixa** | Faixa de tráfego |
| **Velocidade** | Velocidade registrada (quando aplicável) |
| **Imagem** | Foto da passagem |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Consulta de Infracoes](../infracoes/consulta-infracoes) | Infracoes do Use Veículo (com acento) |
| Relacionado | [Monitoramento Online](./monitoramento-online) | Passagens em tempo real |
