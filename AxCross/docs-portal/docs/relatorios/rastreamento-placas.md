---
sidebar_position: 3
title: Rastreamento de Placas
description: Rastreamento completo de veículos por placa no AxCross
---

# Rastreamento de Placas

Permite **rastrear todas as passagens** de um veículo específico em todos os cruzamentos monitorados, exibindo o histórico completo com imagens e dados de cada detecção.

## Como acessar

No **menu lateral**, clique em **Relatórios** e selecione **Rastreamento de Placas**.

![Rastreamento de Veículos por Placa](<../img/Rastreamento de Veículos por Placa.png>)

## Filtros

| Filtro | Obrigatório | Descrição |
|--------|:-----------:|-----------|
| **Placa** | Sim | Número da placa (Mercosul ou antigo) |
| **Período** | Sim | Data início e data fim |
| **Equipamento** | Não | Filtrar por câmera específica |
| **Local** | Não | Filtrar por cruzamento |

## Resultado

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento da detecção |
| **Local** | Cruzamento monitorado |
| **Equipamento** | Câmera que registrou |
| **Faixa** | Faixa da pista |
| **Velocidade** | Se disponível |
| **Imagem** | Foto da passagem |
| **Alerta** | Indica se havia monitoramento ativo |

## Passo a passo

1. Acesse **Relatórios → Rastreamento de Placas**
2. Informe a **Placa**
3. Defina o **Período**
4. Clique em **Consultar**
5. Clique em qualquer passagem para ver a imagem

:::tip Uso investigativo
Use o rastreamento para reconstruir a rota de um veículo suspeito. Combine com o [Painel Analítico](./painel-analitico) para análise profunda.
:::
| **Placa** | Sim | Placa do Veículo (formato Mercosul ou antigo) |
| **Data Início** | Sim | Data inicial do período |
| **Data Fim** | Sim | Data final do período |
| Equipamento | Não | Filtrar por câmera específica |
| **Faixa** | Não | Filtrar por faixa de pista |

## Colunas do resultado

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento da detecção |
| **Local** | Cruzamento onde o Veículo foi detectado |
| Equipamento | Câmera que registrou a passagem |
| **Faixa** | Faixa onde passou o Veículo |
| **Placa** | Placa detectada (pode haver OCR parcial) |
| **Velocidade** | Velocidade registrada (quando disponível) |
| **Imagem** | Foto da passagem |

## Passo a passo

1. Acesse **Relatórios → Rastreamento de Placas** no menu lateral
2. Informe a **Placa** do Veículo
3. Defina o **período** de consulta
4. Clique em **Consultar**
5. Para exportar, clique em **Excel**

:::tip Veículos Monitorados
Se a placa consultada estiver cadastrada na lista de Veículos monitorados, um ícone de alerta será exibido ao lado dos registros.
:::

:::info OCR e precisão de leitura
Em condições adversas (chuva, sujeira, ângulo), a leitura da placa pode ser parcial. Utilize a imagem capturada para confirmação visual.
:::

## Relacionado

- [Painel Analítico](./painel-analitico)
- [Passagens](../relatorios/relatorio-passagens)
- [Veículos Monitorados](./veiculos-monitorados)
- [Mapeamento de Rotas](./mapeamento-rotas)

## Casos de uso

- **Investigação de incidentes**: reconstruir o percurso de um veículo suspeito antes e depois de um crime
- **Verificação de ausência**: confirmar se um veículo circulou na área durante determinado período
- **Suporte à juízo**: fornecer histórico de passagens como evidência em processos judiciais ou administrativos
- **Auditoria de alertas**: verificar a frequência de passagens de veícúlos que geraram alertas recorrentes

:::tip
Combine o Rastreamento de Placas com o [Painel Analítico](./painel-analitico) para uma visão mais completa: use o rastreamento para o histórico de passagens e o painel para gráficos de frequência e heatmap de localização.
:::
