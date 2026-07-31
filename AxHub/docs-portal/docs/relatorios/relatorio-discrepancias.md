---
sidebar_position: 3
title: Relatório de Discrepâncias
description: Relatório de discrepâncias identificadas no processamento
---

# Relatório de Discrepâncias

Identifica e exibe discrepâncias entre os dados registrados pelos Equipamentos e os dados esperados pelo sistema. Utilizado pela equipe técnica para auditar a qualidade dos registros e detectar problemas operacionais.

Relatório de Discrepâncias](../img/Relatorio%20-%20Relatorio%20de%20discrepancias.png)

## Como acessar

**Menu lateral** → Relatórios → Relatório de Discrepâncias**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| Equipamento | Filtrar por Equipamento |
| **Tipo de Discrepância** | Velocidade, placa, imagem, data/hora |
| **Operação** | Filtrar por operação vinculada |

## Tipos de Discrepância

| Tipo | Descrição |
|------|-----------|
| **Velocidade** | Velocidade registrada fora do intervalo esperado para o local |
| **Placa ilegível** | OCR não identificou a placa com confiança mínima |
| **Imagem ausente** | Infração sem imagem associada no prazo configurado |
| **Data/Hora inconsistente** | Registro com timestamp incoerente com o período da operação |
| **Sequencial duplicado** | Dois registros com o mesmo número sequencial |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento do registro |
| **Tipo** | Categoria da discrepancia |
| **Equipamento** | Equipamento envolvido |
| **Valor registrado** | Dado inconsistente capturado |
| **Acao recomendada** | Sugestão do sistema |

:::warning
Discrepancias não tratadas comprometem a qualidade dos lotes exportados. Revise diariamente antes de gerar novos lotes.
:::

## Relacionado

- [Falhas Sequenciais](./falhas-sequenciais)
- [Processamento de Imagens](./processamento-imagens)

## Casos de uso

- **Controle de qualidade diário**: revisar discrepâncias antes de gerar novos lotes de exportação, evitando infrações inválidas
- **Auditoria técnica**: apresentar ao gestor do contrato a lista de registros pendentes de resolução e as ações tomadas
- **Diagnóstico de equipamentos**: identificar equipamentos com alta taxa de discrepâncias como indicativo de necessidade de calibração ou manutenção
- **Prevenção de contestações**: resolver discrepâncias de OCR antes da exportação para reduzir recursos administrativos no órgão autuador
 a discrepância |
| **Tipo** | Categoria da discrepância |
| **Descrição** | Detalhamento do problema identificado |
| **Auto de Infração | Número do auto relacionado (quando aplicável) |
| **Status** | Pendente de revisão ou Resolvida |

## Exportação

Exportável em **Excel** para acompanhamento de pendências técnicas e registro em planos de ação.

## Fluxo de revisão de discrepancias

1. Acessar **Relatórios → Relatório de Discrepancias** diariamente antes de gerar lotes
2. Filtrar por **Status = Pendente** e o **período** do dia anterior
3. Classificar por **Tipo** para priorizar: duplicados e data/hora inconsistente primeiro
4. Para cada discrepancia: identificar a causa e tomar a ação corretiva
5. Marcar como **Resolvida** após a correção
6. Exportar o relatório como evidência de que o lote foi verificado antes do envio

## Tabela de referência — tipos e ações

| Tipo de Discrepancia | Causa provável | Ação |
|---------------------|---------------|------|
| **Velocidade fora do intervalo** | Radar descalibrado | Manutenção preventiva |
| **Placa ilegível** | OCR sem confiança | Descartar ou reconsultar RENAVAM |
| **Imagem ausente** | Falha no armazenamento | Verificar integridade do arquivo |
| **Data/Hora inconsistente** | Relógio do equipamento desajustado | Sincronizar NTP do equipamento |
| **Sequencial duplicado** | Reenvio duplicado do lote | Verificar configuração de seqüenciais |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Discrepancias não aparecem | Nenhuma no período ou filtro errado | Ampliar período e remover filtros |
| Tipo não reconhecido | Configuração do layout | Revisar Administração → Layouts de Arquivos |
| Discrepancia resolvida reaparece | Causa raiz não corrigida | Investigar o equipamento antes de fechar |

## Relacionado

- [Falhas Sequenciais](./falhas-sequenciais)
- [Processamento de Imagens](./processamento-imagens)
- [Auditoria](../infracoes/auditoria)

## Perguntas frequentes

**Devo resolver todas as discrepâncias antes de exportar um lote?**
Sim. Discrepâncias não resolvidas, especialmente sequenciais duplicados e dados inconsistentes, podem causar rejeição do lote pelo órgão autuador.

**Discrepâncias de OCR sempre exigem descarte da infração?**
Não necessariamente. Se a placa puder ser identificada visualmente na imagem, é possível corrigir a leitura manualmente na triagem antes de descartar.

**Com que frequência devo consultar este relatório?**
Diariamente, antes de gerar novos lotes de exportação. Acumulação de discrepâncias não tratadas pode comprometer o volume contratual.
