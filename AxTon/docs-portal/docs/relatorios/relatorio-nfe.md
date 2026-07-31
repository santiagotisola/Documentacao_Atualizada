---
sidebar_position: 5
title: Relatório de Notas Fiscais
description: NF-e capturadas e vinculadas às passagens no AxTon
---

# Relatório de Notas Fiscais

Lista as **notas fiscais eletrônicas (NF-e)** vinculadas às passagens de veículos, com dados de origem, destino, chave de acesso e status de validação.

## Como acessar

**Menu lateral** → Relatórios → **Relatório de Notas Fiscais**

## Filtros

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim |
| **Chave NF-e** | Busca por chave específica |
| **CNPJ Emitente** | Filtrar por empresa emissora |
| **Status** | Válida, Vencida, Cancelada, Ausente |

## Colunas

| Coluna | Descrição |
|--------|-----------|
| **Chave** | 44 dígitos da NF-e |
| **Emitente** | CNPJ do remetente |
| **Destinatário** | CNPJ do destinatário |
| **Valor total** | Valor declarado na nota |
| **Status** | Válida / Vencida / Cancelada |

:::tip
Use o filtro **Status = Ausente** para identificar veículos de carga que circularam sem nota fiscal, possível irregularidade fiscal a ser reportada.
:::

## Relacionado

- [NF-e](../glossario/nfe) — Glossário
- [MDF-e](../glossario/mdfe)
- [Relatório de Discrepancias](./relatorio-discrepancias)

## Fluxo de validação NF-e

1. Veículo de carga passa pelo equipamento de pesagem
2. OCR captura a placa e consulta o SEFAZ/MDF-e vinculado
3. Sistema verifica se há NF-e válida associada à placa no momento da passagem
4. Se ausente ou inválida → registro gerado com status **Ausente** ou **Cancelada**
5. Operador acessa este relatório e filtra por **Status = Ausente**
6. Exporta a lista e encaminha à Secretaria de Fazenda estadual

## Tabela de referência — status de NF-e

| Status | Significado | Ação recomendada |
|--------|-------------|------------------|
| **Válida** | NF-e ativa e dentro do prazo | Nenhuma |
| **Vencida** | NF-e expirada no momento da passagem | Registrar irregularidade |
| **Cancelada** | NF-e cancelada após emissão | Autuação por transporte irregular |
| **Ausente** | Nenhuma NF-e encontrada para a placa | Reportar à SEFAZ |

## Base legal

**Ajuste SINIEF 07/2005** — obrigatoriedade da NF-e para veículos de carga em trânsito. Fiscalização sancionada pela **Lei 8.137/90** (crimes contra a ordem tributária).

:::tip Auditoria fiscal
Exporte o relatório de NF-e ausente e compartilhe com a Secretaria de Fazenda estadual para notificação dos emitentes irregulares.
:::
| **Valor** | Valor total da nota |
| **Peso declarado** | Peso informado na NF-e |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Relatório sem NF-e | Veículos sem consulta SEFAZ configurada | Verificar integração SEFAZ/MDF-e nas Configurações do Sistema |
| Status sempre "Ausente" | Integração SEFAZ inativa | Contatar suporte técnico para revisar a integração |
| NF-e com peso declarado zerado | NF-e emitida sem campo de peso | Orientar o emitente a corrigir o manifesto |
| **Status** | Válida / Vencida / Cancelada |
| **Placa** | Veículo transportador |

## Uso

- Identificar NF-e canceladas em trânsito
- Detectar sub-declaração de peso (comparar com pesagem real)
- Subsidiar autuações por irregularidade fiscal

## Relacionado

- [NF-e](../glossario/nfe) — Definição e base legal
- [MDF-e](../glossario/mdfe) — Manifesto vinculado


### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Chave NFe** | Identificador único da nota |
| **Placa** | Veículo associado |
| **Origem** | UF/cidade de origem |

## Perguntas frequentes

**Por que o status de uma NF-e aparece como "Ausente" mesmo que o veículo tenha nota fiscal?**
Isso ocorre quando a NF-e não foi encontrada pelo sistema no momento da passagem via consulta SEFAZ/MDF-e. Pode ser que a nota foi emitida após a passagem ou que a integração SEFAZ estava com falha. Verifique os logs de integração e, se o problema for recorrente, acione o suporte técnico.

**Como identificar rapidamente veículos que transitaram com NF-e cancelada ou vencida?**
Filtre o relatório com **Status = Cancelada** ou **Status = Vencida** no período desejado. Exporte em CSV para encaminhar à Secretaria de Fazenda estadual para notificação dos emitentes irregulares, conforme obrigação legal.

**Existe obrigação legal de reportar NF-e ausentes detectadas pelo AxTon à SEFAZ?**
Sim. O transporte de cargas sem NF-e é irregularidade prevista no **Ajuste SINIEF 07/2005** e sancionada pela **Lei 8.137/90**. O operador deve exportar o relatório de NF-e ausentes periodicamente e encaminhar à Secretaria de Fazenda estadual para os procedimentos cabíveis.

## Integração com outros módulos

| Módulo | Como se relaciona com Relatório de NF-e |
|--------|------------------------------------------|
| **Pesagem → Tickets Fechados** | Cada pesagem registra a NF-e capturada no momento — o relatório consolida essas informações |
| **Relatório de Passagens** | Cruza dados de pesagem com documentação fiscal para análise de regularidade |
| **Relatório de Infrações** | Veículos com NF-e ausente ou cancelada podem gerar infração documental |
| **Glossário → NF-e** | Base legal e definição do documento fiscal eletrônico capturado pelo sistema |
| **Destino** | UF/cidade de destino |
| **Data/Hora** | Registro da passagem |

### Filtros disponíveis

- Período (data inicial e final)
- Posto de pesagem
- Exportar para Excel/PDF

## Exemplo prático

**Cenário**: A Secretaria de Fazenda solicita um relatório de veículos de carga que transitaram pelo posto de pesagem sem nota fiscal válida durante o mês de junho.

**Passo a passo**:

1. Acesse **Relatórios → Relatório de Notas Fiscais**
2. Defina o **Período**: 01/06 a 30/06
3. Selecione o **Posto** correspondente
4. Filtre **Status = Ausente**
5. Clique em **Gerar** — o sistema lista todos os veículos sem NF-e válida
6. Exporte em **Excel**
7. Adicione uma coluna com a observação de obrigação legal (Ajuste SINIEF 07/2005)
8. Encaminhe o relatório à SEFAZ estadual para notificação dos emitentes

**Resultado**: 47 veículos identificados com NF-e ausente em junho. O relatório entregue à SEFAZ gerou 12 notificações de penalidade por transporte irregular, reduzindo reincidência nos meses seguintes.
