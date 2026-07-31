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

## Perguntas frequentes

**Como localizar uma infração específica de um veículo e verificar se já foi exportada?**
Use o filtro **Placa** combinado com o **Período** da ocorrência e selecione o status **Exportada**. Se a infração aparecer com esse status, ela já foi incluída em um lote e enviada ao órgão autuador.

**O que fazer quando uma infração aparece no relatório com excesso zerado?**
Isso indica que a classificação do veículo tem PBT incorreto ou que a leitura da balança falhou. Acesse o ticket de pesagem correspondente, verifique a classificação e reclassifique se necessário antes de exportar o lote.

**Como exportar apenas as infrações prontas para envio ao órgão autuador?**
Filtre o relatório pelo status **Auditada** e pelo período desejado. Exporte em CSV e use esse arquivo como base para gerar o lote em **Exportação de Infrações → + Novo**. Antes de exportar, execute o relatório de **Falhas de Sequenciais** para garantir a integridade numérica.

## Integração com outros módulos

| Módulo | Como se relaciona com Relatório de Infrações |
|--------|--------------------------------------------------|
| **Exportação de Infrações** | As infrações auditadas neste relatório são enviadas ao órgão autuador via exportação |
| **Pesagem → Reclassificar** | Infrações com excesso zerado devem ser reclassificadas antes de exportar |
| **Processamento de Imagens** | Taxa OCR baixa gera mais infrações com placa não identificada, visíveis neste relatório |
| **Falhas Sequenciais** | Verificar integridade da numeração antes de gerar o lote de exportação |

## Exemplo prático

**Cenário**: O supervisor precisa gerar o lote mensal de infrações para envio ao órgão autuador. Antes de exportar, ele verifica o pipeline de infrações com status **Auditada**.

**Passo a passo**:

1. Acesse **Relatórios → Relatório de Infrações**
2. Filtre por **Período** = mês anterior, **Status = Auditada**
3. Verifique o total de infrações aptas para exportação
4. Revise rapidamente infrações com **Excesso = 0** — podem indicar classificação incorreta
5. Corrija as infrações com excesso zerado reclassificando o veículo
6. Execute **Relatórios → Falhas de Sequenciais** para confirmar integridade numérica
7. Exporte em **CSV** e gere o lote em **Exportação de Infrações**

**Resultado**: 187 infrações auditadas exportadas com sucesso. 3 infrações com excesso zerado foram identificadas e corrigidas antes do envio, evitando rejeição parcial do lote pelo SENATRAN.
