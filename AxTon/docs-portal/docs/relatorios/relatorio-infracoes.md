---
sidebar_position: 2
title: Relatório de Infrações
description: Infrações de excesso de peso registradas por período, posto e status no AxTon
---

# Relatório de Infrações

Exibe as **infrações de excesso de peso** registradas pelo AxTon, agrupadas por período, posto e status de processamento. Essencial para auditoria e preparação de lotes de exportação.

## Como acessar

**Menu lateral** → Relatórios → **Relatório de Infrações**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e data fim |
| **Posto de pesagem** | Filtrar por localidade |
| **Status** | Triada, Auditada, Exportada, Descartada |
| **Placa** | Busca por placa específica |
| **Enquadramento** | Artigo do CTB |

## Colunas do resultado

| Coluna | Descrição |
|--------|-----------|
| **Nº Infração** | Identificador único |
| **Data/Hora** | Momento da pesagem |
| **Placa** | Placa do veículo infrator |
| **Peso aferido** | Peso real registrado |
| **Excesso (t)** | Quantidade acima do PBT |
| **Status** | Triada / Auditada / Exportada |
| **Posto** | Local da pesagem |

:::tip
Exporte o relatório em CSV para preparar o lote de envio ao órgão autuador.
:::

## Interpretação dos status

| Status | Significado | Próxima etapa |
|--------|-------------|---------------|
| Triada | Validada pelo operador | Auditoria |
| Auditada | Aprovada pelo supervisor | Exportação |
| Exportada | Enviada ao órgão | Concluído |
| Descartada | Rejeitada | Sem ação |

## Relacionado

- [Triagem](../glossario/triagem)
- [Processamento de Imagens](./processamento-imagens)

- **Fechamento de lote** — exporte infrações com status **Auditada** para compor o lote de envio ao órgão autuador
- **Auditoria de excesso de peso** — filtre por excesso percentual para identificar reincidentes e planejar operações de fiscalização
- **Acompanhamento do fluxo** — monitore o pipeline triagem → auditoria → exportação por posto e período
- **Preparo de CSV** — exporte em Excel para montar o arquivo de envio ao órgão autuador com os campos exigidos

## Relacionado

- [Infração](../glossario/infracao)
- [Triagem](../glossario/triagem)
- [Processamento de Imagens](./processamento-imagens)

## Fluxo pós-exportação

Após exportar o CSV:
1. Verificar **Falhas de Sequenciais** antes do envio
2. Gerar lote de exportação
3. Transmitir ao DENATRAN/SENATRAN
4. Confirmar recebimento e guardar protocolo por no mínimo 5 anos
- [Triagem](../glossario/triagem)
- [Processamento por Usuário](./processamento-por-usuario)

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Infração não aparece no relatório | Status ou período incorreto no filtro | Ampliar período e limpar filtros |
| Número de infração em branco | Sequêncial não configurado | Criar sequêncial em Cadastros → Sequênciais de Infração |
| Excesso zerado | Classificação com PBT incorreto | Revisar PBT da classificação do veículo |
| CSV exportado vazio | Nenhuma infração com status Auditada | Verificar pipeline de auditoria no período |

## Relacionado

- [Infração](../glossario/infracao)
- [Triagem](../glossario/triagem)
- [Processamento de Imagens](./processamento-imagens)
- [Exportação de Infrações](../infracoes/exportacao)
