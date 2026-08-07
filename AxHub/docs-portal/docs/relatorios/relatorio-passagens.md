---
sidebar_position: 2
title: Relatório de Passagens
description: Relatório de passagens de Veículos registradas
---

# Relatório de Passagens

Permite consultar e exportar o histórico detalhado de passagens de Veículos registradas pelos Equipamentos Cada linha representa um evento de passagem com dados de placa, velocidade, imagem e status de leitura OCR.

Relatório de Passagens](../img/Relatorio%20-%20Relatorio%20de%20passagens.png)

## Como acessar

**Menu lateral** → Relatórios → Relatório de Passagens**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas e horas |
| Equipamento | Filtrar por Equipamento |
| **Faixa** | Faixa de tráfego monitorada |
| **Placa** | Buscar passagem de placa específica |
| **Tipo de Veículo | Filtrar por categoria de Veículo |
| **Com Infração | Exibir apenas passagens que geraram Infração |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento exato da passagem |
| **Placa** | Placa lida pelo OCR |
| Equipamento | Equipamento que registrou a passagem |
| **Faixa** | Faixa de tráfego |
| **Velocidade Medida** | Velocidade capturada pelo radar |
| **Velocidade Regulamentada** | Limite de velocidade no local |
| **Confiança OCR (%)** | Percentual de confiança na leitura da placa |
| Infração | Número do auto gerado (se houver) |
| **Imagem** | Miniatura da imagem (clique para ampliar) |

:::tip
Use o filtro **Com Infração = Sim** para revisar apenas passagens que geraram auto. Combine com filtro por período para exportar dados para auditoria.
:::

## Casos de uso

- **Auditoria de placa suspeita** — filtre por placa + período para obter o histórico completo de passagens de um veículo
- **Conferência com o órgão autuador** — exporte os dados em Excel para cruzamento com os registros do contratante
- **Análise de aproveitamento** — combine com o Relatório de Processamento de Imagens para identificar equipamentos com baixa captura
- **Acompanhamento de autuações** — use o filtro **Com Infração = Sim** para revisar apenas passagens que geraram auto

## Relacionado

- [Processamento por Usuário](./processamento-por-usuario)
- [Lotes de Importação](./lote-importacao)


## Exportação

Exportável em **Excel** com todos os campos ou apenas os selecionados.

:::tip Dica
Para localizar passagens de uma placa suspeita, use o filtro **Placa** em combinação com **Período** para histórico completo de passagens daquele Veículo
:::

## Fluxo de consulta de passagens

1. Acessar **Relatórios → Relatório de Passagens**
2. Definir o **Período** e os filtros necessários (placa, equipamento, faixa)
3. Clicar em **Buscar** para carregar os registros
4. Para auditoria por placa: filtrar pela placa e verificar as imagens
5. Exportar em **Excel** para cruzamento com dados do órgão autuador

## Tabela de referência — campos e interpretação

| Campo | Como interpretar |
|-------|------------------|
| **Confiança OCR (%)** | Abaixo de 80%: confirmar pela imagem antes de exportar |
| **Velocidade Medida** | Comparar com o limite da faixa para verificar infração |
| **Infração** | Se vazio: passagem regular; se preenchido: auto gerado |
| **Imagem** | Clicar para ampliar e verificar placa e velocidade |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Passagem sem imagem | Falha na captura ou armazenamento | Verificar Relatório de Processamento de Imagens |
| Placa em branco | OCR com confiança abaixo do limiar | Ajustar configuração de confiança mínima |
| Velocidade zerada | Sensor de velocidade offline | Verificar equipamento e eventos |
| Relatório lento com muitos registros | Volume muito alto | Aplicar filtros adicionais ou exportar direto |

## Relacionado

- [Processamento por Usuário](./processamento-por-usuario)
- [Consulta de Placas](../operacoes/consulta-placas)
- [Fluxo Diário de Veículos](./fluxo-diario-veiculos)

## Perguntas frequentes

**Qual a diferença entre o Relatório de Passagens e a Consulta de Placas?**
A Consulta de Placas busca passagens de uma placa específica em todos os equipamentos. O Relatório de Passagens mostra todas as passagens de um período com filtros mútiplos e exportação em massa.

**Passagem com confiança OCR abaixo de 80% gerou uma infração. É válida?**
A validade depende da verificação visual. Se a placa for legível na imagem, a infração pode ser mantida. Caso contrário, descarte na triagem.

**O relatório inclui passagens de todos os equipamentos ou apenas os vinculados à operação?**
Por padrão inclui todos. Use o filtro **Equipamento** ou **Operação** para restringir ao escopo desejado.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Infrações — Consulta](../infracoes/consulta-infracoes)** | Passagens que geraram infração podem ser detalhadas a partir deste relatório clicando no número do auto |
| **[Consulta de Placas](../operacoes/consulta-placas)** | A Consulta de Placas complementa este relatório ao buscar todo o histórico de uma placa específica em todos os equipamentos |
| **[Processamento de Imagens](./processamento-imagens)** | Passagens sem imagem aparecem neste relatório; o Processamento de Imagens auxilia na investigação da causa |
| **[Equipamentos](../cadastros-basicos/equipamentos)** | Os equipamentos cadastrados são a fonte de dados do relatório; equipamentos inativos não geram registros novos |

## Exemplo prático

**Cenário**: Um motorista contesta uma infração alegando que não estava no local indicado. O operador usa o Relatório de Passagens para verificar o histórico completo da placa naquele dia.

**Passo a passo**:

1. Acesse **Relatórios → Relatório de Passagens**
2. Informe a **Placa** do veículo contestante
3. Defina o **Período** = dia e horário da infração (±2 horas)
4. Filtre por **Equipamento** = radar do local
5. Clique em **Buscar** — o sistema lista todas as passagens da placa no período
6. Clique na imagem da passagem para ampliar e verificar a placa visualmente
7. Exporte em **Excel** e gere também o **PDF com imagens** para o processo de defesa

**Resultado**: O relatório confirma a passagem da placa às 14h32 com velocidade de 97 km/h (limite 60) e imagem nítida. A contestação é indeferida com base nas evidências documentadas no sistema.
