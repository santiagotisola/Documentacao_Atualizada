---
sidebar_position: 4
title: Relatório de Veículos Monitorados
description: Relatório de detecções de Veículos monitorados no AxCross
---

# Relatório de Veículos Monitorados

Consolida as detecções de Veículos cadastrados na lista de monitorados, exibindo cada ocorrência com dados de local, data/hora e imagem da passagem.

## Como acessar

No **menu lateral**, clique em **Relatórios** e selecione **Veículos Monitorados**.

![Relatório Veículos Monitorados](../img/Relatório Veículos Monitorados.png)
)

## Filtros

| Filtro | Obrigatório | Descrição |
|--------|:-----------:|-----------|
| **Data Início** | Sim | Data inicial do período |
| **Data Fim** | Sim | Data final do período |
| **Placa** | Não | Filtrar por placa específica |
| **Classificação** | Não | Filtrar por classificação do Veículo (ex.: Roubado, VIP) |

## Colunas

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento da detecção |
| **Placa** | Placa identificada |
| **Equipamento** | Câmera que registrou |
| **Classificação** | Categoria de monitoramento |
| **Imagem** | Foto da passagem |

:::warning
As detecções de veículos monitorados geram alertas automáticos. O operador deve verificar e tratar cada alerta dentro do prazo definido pela operação.
:::

## Relacionado

- [Alertas](../operacoes/alertas)
- [Mapeamento de Rotas](./mapeamento-rotas)
- [Ocorrências e Alertas](./ocorrencias-alertas)


## Colunas do resultado

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento da detecção |
| **Placa** | Placa detectada |
| **Classificação** | Categoria do Veículo monitorado |
| **Local** | Cruzamento onde ocorreu a detecção |
| Equipamento | Câmera que registrou a passagem |
| **Status Alerta** | Status da tratativa do alerta gerado |
| **Imagem** | Foto da passagem |

## Passo a passo

1. Acesse **Relatórios → Veículos Monitorados** no menu lateral
2. Defina o **período** de consulta
3. Opcionalmente, aplique filtros adicionais
4. Clique em **Consultar**
5. Para exportar, clique em **Excel** ou **PDF**

:::tip Acompanhamento de alertas
Use este Relatório em conjunto com a tela de **Alertas** para acompanhar o status das tratativas de cada detecção.
:::

## Fluxo de atendimento

1. Detecção automática do veículo monitorado pelo equipamento
2. Alerta gerado na tela de **Alertas** e no **Monitoramento Online**
3. Operador assume o alerta e registra observações
4. Acionar equipe de campo ou autoridades conforme protocolo
5. Encerrar o alerta com **Resolução** descrita
6. Consultar este relatório para auditoria e prestação de contas

## Tabela de referência — SLA de atendimento

| Classificação | Prazo máximo | Canal de acionamento |
|---------------|:------------:|----------------------|
| Veículo roubado/furtado | Imediato | Central de operações |
| Veículo com restrição judicial | 15 min | Coordenador de turno |
| Veículo suspeito (categoria VIP) | 30 min | Operador responsável |
| Monitoramento preventivo | Até 1h | Registro no sistema |

## Erros comuns

| Situação | Causa provável | Solução |
|----------|---------------|----------|
| Alerta não gerado para placa monitorada | Veículo com status Inativo | Reativar cadastro |
| Detecção ausente no relatório | OCR com baixa confiança | Verificar imagem |
| Período sem retorno | Veículo não circulou na área | Normal — ampliar período |

## Casos de uso

- **Prestação de contas operacional**: demonstrar ao órgão contratante todas as detecções de veículos monitorados realizadas no período
- **Auditoria de alertas**: verificar se todos os alertas gerados foram devidamente tratados e registrados
- **Análise de padrões**: identificar veículos com alta frequência de detecção para priorizar investigações
- **Comprovação de monitoramento**: documentar que um veículo específico foi ou não detectado durante determinado período

## Perguntas frequentes

**Por que um veículo monitorado passou pelo equipamento mas não aparece no relatório?**
Verifique se o cadastro do veículo está com status Ativo e se a placa está corretamente formatada. Também pode ser que o OCR não reconheceu a placa com confiança suficiente — verifique a imagem da passagem.

**O relatório exibe apenas detecções com alerta gerado ou todas as passagens?**
Apenas as passagens que geraram ocorrência por corresponder a um veículo monitorado ativo. Passagens normais de outros veículos aparecem no Relatório de Passagens.

**Como exportar o relatório para comprovação ao órgão contratante?**
Use os botões **Excel** ou **PDF** na tela do relatório após aplicar os filtros do período desejado. O arquivo gerado contém todas as detecções com dados de local, data/hora e placa.

## Integração com outros módulos

| Módulo | Como se relaciona com Relatório de Veículos Monitorados |
|--------|----------------------------------------------------------|
| **Operações → Veículos Monitorados** | Os veículos com alertas ativos são a fonte dos dados deste relatório |
| **Relatórios → Ocorrências e Alertas** | Complementa este relatório com o histórico de alertas tratados |
| **Relatório de Passagens** | Para verificar passagens de um veículo monitorado além das ocorrências |
| **PDFs Gerados** | Os PDFs gerados por este relatório ficam listados aqui para redownload |

