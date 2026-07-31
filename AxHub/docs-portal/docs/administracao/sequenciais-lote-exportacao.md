---
sidebar_position: 12
title: Sequenciais de Lote de Exportação
description: Controle dos sequenciais numéricos dos lotes de exportação no AxHub
---

# Sequenciais de Lote de Exportação

Configura e monitora os **sequenciais dos lotes de exportação** de infrações. Cada lote recebe um número sequencial que deve ser único e continuo para validação pelo órgão autuador.

## Como acessar

**Menu lateral** → Configurações → **Sequenciais de Lote de Exportação**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Órgão** | Sim | Órgão destinatário do lote |
| **Sequencial Atual** | Sim | Número do último lote exportado |
| **Próximo** | Automático | Calculado pelo sistema |

## Diferença entre sequenciais de infração e de lote

| Tipo | O que numera |
|------|--------------|
| **Sequencial de Infração** | Cada auto de infração individualmente |
| **Sequencial de Lote** | Cada envio (lote) ao órgão |

## Boas práticas

- Registre no sistema o sequencial após cada envio manual
- Não reutilize sequenciais de períodos anteriores
- Comunique ao órgão autuador ao reiniciar a numeração

:::warning
Lotes com sequencial duplicado ou fora de ordem são rejeitados pelo órgão. Verifique o Relatório de Falhas de Sequenciais antes de cada exportação.
:::

## Impacto operacional

Sequenciais incorretos geram rejeição de lotes inteiros, exigindo reenvio. O impacto pode incluir:
- Atraso no processamento de multas
- Risco de prescrição (prazo de 30 dias)
- Relação contratual comprometida

## Relacionado

- [Sequenciais de Infrações](./sequenciais-infracoes)
- [Falhas de Sequenciais](../relatorios/falhas-sequenciais)

## Fluxo de gestão de lotes

1. Antes de cada exportação, verificar o sequencial atual em Configurações → Sequenciais de Lote
2. Gerar o lote — sistema atribui o próximo número automaticamente
3. Transmitir ao órgão autuador e confirmar o protocolo de recebimento
4. Guardar o protocolo por no mínimo 5 anos como comprovante legal
5. Em caso de reenvio, usar o mesmo número de lote; NUNCA gerar novo número

## Tabela de referência — numeração de lotes

| Situação | Ação |
|----------|------|
| Primeiro lote da série | Iniciar com o número acordado com o órgão |
| Lote rejeitado pelo órgão | Corrigir e reenviar com o **mesmo** número |
| Série esgotada | Comunicar o órgão e iniciar nova série combinada |
| Inconsistência detectada | Executar Falhas de Sequenciais antes de nova exportação |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Lote rejeitado por número duplicado | Dois lotes com o mesmo sequencial | Verificar registros anteriores antes de gerar |
| Lote fora de ordem | Exportação manual com número errado | Usar sempre o próximo número automático |
| Série sem configuração | Sequencial não cadastrado | Criar configuração para o órgão |

- Verificar seqüencial antes de cada nova exportação

## Navegação Relacionada

| Tipo | Página |
|------|--------|
| Relacionado | [Lote de Exportação](../infracoes/exportacao) |
| Relacionado | [Sequenciais de Infrações](./sequenciais-infracoes) |

| **Formato** | Layout do arquivo de exportação |
| **Status** | Ativo, Esgotado |

:::note Sem screenshot
está tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Exportacao](../infracoes/exportacao) | Controle de lote |
| Glossario | [Lote de Exportacao](../glossario/lote-exportacao) | Definicao |

## Perguntas frequentes

**O que fazer quando o órgão rejeita um lote por sequencial duplicado?**
Não gere um novo número. Corrija o conteúdo do lote, reenvie com o **mesmo** número de lote e confirme o protocolo de recebimento.

**Com que frequência devo verificar os sequenciais de lote?**
Antes de cada exportação. Execute o relatório de **Falhas de Sequenciais** para garantir que não há lacunas na numeração antes de gerar o próximo lote.

**Posso reiniciar a numeração de lote a cada ano?**
Não é recomendável. O órgão autuador pode recusar lotes com número já usado na série histórica. Mantenha a numeração contínua e combine qualquer reinicialização com o contratante.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Exportação de Infrações](../infracoes/exportacao)** | O sequencial do lote é atribuído automaticamente ao gerar um novo lote de exportação |
| **[Falhas Sequenciais](../relatorios/falhas-sequenciais)** | Verifique o relatório de Falhas Sequenciais antes de exportar para garantir que não há lacunas na numeração de lotes |
| **[Sequenciais de Infrações](./sequenciais-infracoes)** | Os sequenciais de lote e de infrações são configurações separadas, mas ambos devem estar corretos para a exportação ser aceita |
| **[Lote de Exportação](../glossario/lote-exportacao)** | O glossario explica o conceito de lote e sua importância legal na transmissão de infrações ao órgão autuador |
