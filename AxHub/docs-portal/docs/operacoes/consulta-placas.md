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

## Fluxo de consulta

1. Receber solicitação ou identificar placa de interesse
2. Acessar **Operações → Consulta de Placas**
3. Informar a **Placa** e o **Período** de análise
4. Verificar passagens e confirmar imagens
5. Exportar em **Excel** para registro ou encaminhar à equipe competente

## Exemplos de uso

**Cidadão contesta auto de infração**
1. Consultar a placa pelo número do auto
2. Localizar a passagem pela data/hora do auto
3. Confirmar velocidade e imagem
4. Exportar como comprovante

**Veículo suspeito denunciado**
1. Consultar a placa no período denunciado
2. Verificar todos os equipamentos que a detectaram
3. Combinar com [Monitoramento Online](./monitoramento-online) para situação atual

## Tabela de referência — interpretação dos resultados

| Coluna | Como interpretar |
|--------|------------------|
| **Confiança OCR** | Abaixo de 80%: confirmar visualmente pela imagem |
| **Velocidade** | Comparar com o limite da faixa para avaliar infração |
| **Infração** | Se vazio: passagem regular; se preenchido: auto gerado |

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

## Perguntas frequentes

**A consulta de placas mostra passagens de todos os equipamentos?**
Sim, se você não filtrar por equipamento específico. O resultado agrupa passagens de todos os pontos de monitoramento do sistema no período selecionado.

**Por que uma passagem não aparece na consulta?**
As causas mais comuns são: placa lida incorretamente pelo OCR, equipamento offline no período, ou placa digitada com formato diferente (Mercosul x antigo). Tente variantes da placa.

**A consulta de placas pode ser usada como prova em recurso de infração?**
O dado bruto da consulta não tem valor probatório isolado. O documento oficial é o **Auto de Infração** gerado no fluxo completo com imagem, enquadramento e tarja.
