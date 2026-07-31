---
sidebar_position: 6
title: Mapa de Teste
description: Relatório de testes de captura dos Equipamentos
---

# Mapa de Teste

Relatório que exibe os resultados dos testes realizados nos Equipamentos para Validação de captura, leitura de placa e conformidade da imagem, apresentados em formato de mapa de acertos.

Relatório de Mapa de Teste de Equipamentos](../img/relatorio-mapa-teste.png)

## Como acessar

**Menu lateral** → Relatórios → **Mapa de Teste**

## Dados do Relatório

O mapa de teste exibe os resultados dos registros com `Homologacao = 1` em `TBInfracoes` e `TBOperacoes`, permitindo validar a qualidade de captura antes da homologação oficial.

### Fonte de dados: `TBPassagens` + `TBInfracoes`

| Campo usado | Origem | Descrição |
|------------|--------|-----------|
| **Placa Veículo** | `TBPassagens.PlacaVeiculo` | Placa lida no teste |
| **Data/Hora** | `TBPassagens.DataHora` | Momento da captura |
| **Resultado** | `TBInfracoes.Homologacao` | 1 = teste |
| **Faixa** | `TBPassagens.Faixa` | Faixa do equipamento |

## Como usar

1. Acesse **Relatórios → Mapa de Teste**
2. Selecione o **Período** e o **Equipamento**
3. O relatório exibe os acertos e erros de captura em formato de grade
4. Identifique faixas com baixo aproveitamento OCR

:::warning
Os registros exibidos neste mapa **não são infrações reais** — são capturas de teste. Não incluir no lote de exportação.
:::
| **Erro OCR** | `TBInfracoes.ErroOcr` | Indica se houve falha na leitura |
| **Velocidade Medida** | `TBPassagens.VelocidadeMedida` | Velocidade no momento |
| **Data Hora Passagem** | `TBPassagens.DataHoraPassagem` | Momento da passagem de teste |
| **Homologacao** | `TBInfracoes.Homologacao` | Flag que identifica registros de teste |

## Operação em modo Homologação

Quando `TBOperacoes.Homologacao = 1`, todas as Infrações geradas são marcadas como `Homologacao = 1` em `TBInfracoes`. Essas Infrações **não são exportadas** para o órgão autuador e ficam disponíveis apenas no mapa de teste.

## Integrações

| Tabela | Campo | Descrição |
|--------|-------|-----------|
| `TBOperacoes` | `Homologacao` | Operação em modo de teste |
| `TBInfracoes` | `Homologacao` | Infrações de teste isoladas das reais |
| `TBFaixas` | `Latitude`, `Longitude` | Posição geográfica no mapa |

## Relacionado

- [Processamento de Imagens](./processamento-imagens)
- [Falhas Sequenciais](./falhas-sequenciais)

## Casos de uso

- **Homologação de equipamentos**: validar a qualidade de captura antes de ativar a operação definitiva
- **Calibração de OCR**: identificar faixas com baixo aproveitamento de leitura de placa para ajuste técnico
- **Aceitação contratual**: documentar os resultados dos testes como comprovante de conformidade antes da entrada em operação
- **Diagnóstico de posicionamento**: detectar ângulos ou alturas de câmera inadequadas que prejudicam a leitura durante os testes

- [Aferições](../operacoes/afericoes)
- [Equipamentos](../cadastros-basicos/equipamentos)

## Quando usar

- Durante a **homologação inicial** de equipamentos reciém-instalados para validar a qualidade de captura
- Após **manutenção técnica** para confirmar que o equipamento voltou a operar dentro dos parâmetros
- Para **calibrar o limiar OCR** identificando faixas com leitura inconsistente
- Em **inspeções periódicas** de controle de qualidade antes de incluir o equipamento em nova operação

:::tip
Capturar dados de teste com a operação em modo `Homologacao = 1` garante que essas infrações nunca entrem no fluxo de exportação. Execute sempre os testes nessa configuração.
:::

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Mapa de teste vazio | Operação não configurada com `Homologacao = 1` | Verificar o campo Homologação na operação do equipamento |
| Registros de teste aparecem na lista de infrações reais | Operação com `Homologacao = 0` durante o teste | Recriar os testes com a operação em modo de homologação |
| Faixa sem resultado no mapa | Equipamento sem capturas no período de teste | Verificar cabeamento, posição da câmera e operação ativa |
