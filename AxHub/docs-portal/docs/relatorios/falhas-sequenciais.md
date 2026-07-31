---
sidebar_position: 5
title: Relatório de Falhas Sequenciais
description: Relatório de falhas sequenciais nos Equipamentos
---

# Relatório de Falhas Sequenciais

Identifica Equipamentos que registraram falhas em sequência, o que pode indicar problemas técnicos persistentes, vandalismo ou defeito no hardware. Utilizado pela equipe de manutenção e pelo gestor do contrato para acompanhamento de SLA.

Relatório de Falhas](../img/Relatorios%20-%20relatorio%20de%20falhas%20sequenciais.png)

## Como acessar

**Menu lateral** → Relatórios → **Falhas Sequenciais**

## Filtros disponíveis

| Filtro | Descrição |
|--------|-----------|
| **Período** | Faixa de datas |
| Equipamento | Filtrar por Equipamento |
| **Quantidade mínima** | Número mínimo de falhas consecutivas para exibir |
| **Tipo de Falha** | Comunicação, imagem, energia, sensor |

## Campos exibidos

| Coluna | Descrição |
|--------|-----------|
| Equipamento | Nome e código do Equipamento |
| **Período da Falha** | Início e fim da sequência de falhas |
| **Quantidade de Falhas** | Número de ocorrências consecutivas |
| **Tipo** | Categoria da falha registrada |
| **Duração Total** | Tempo total de indisponibilidade |
| **Impacto no SLA** | Indica se afeta o cálculo de disponibilidade contratual |

## O que são falhas sequenciais

Uma **falha sequencial** ocorre quando o mesmo Equipamento apresenta o mesmo tipo de problema em registros consecutivos, sem nenhum registro bem-sucedido entre eles. O threshold (útico mínimo) é configurado em [Sequenciais de Infrações](../administracao/sequenciais-infracoes).

## Relacionado

- [Sequenciais de Infrações](../administracao/sequenciais-infracoes)
- [Eventos de Equipamentos](./eventos-equipamentos)
- [Aferições](../operacoes/afericoes)

## Casos de uso

- **Manutenção preventiva**: identificar equipamentos com falhas recorrentes para agendar inspeção técnica antes da próxima ocorrência
- **Comprovação de SLA**: apresentar ao contratante os períodos de indisponibilidade com tipologia detalhada para clculo do desconto contratual
- **Auditoria de qualidade**: detectar equipamentos com baixo aproveitamento de imagens causado por falhas técnicas recorrentes
- **Priorização de recursos**: direcionar equipe de campo para os pontos com maior frequência de falhas sequenciais


Exportável em **Excel** para uso em Relatórios técnicos e comprovantes de manutenção.

## Fluxo de verificação pré-exportação

1. Acessar **Relatórios → Falhas Sequenciais** antes de cada geração de lote
2. Definir o **Período** do lote a ser exportado
3. Clicar em **Verificar** e aguardar o processamento
4. Se há falhas: identificar a causa (descarte não documentado, falha técnica)
5. Corrigir as falhas antes de prosseguir com a exportação
6. Reexecutar a verificação após as correções para confirmar integridade

## Tabela de referência — tipos de falha e ações

| Tipo de Falha | Causa comum | Ação |
|---------------|-------------|------|
| **Lac una na sequência** | Infração descartada sem motivo | Verificar motivos de descarte no período |
| **Número duplicado** | Reenvio duplicado de lote | Auditar os registros com o mesmo número |
| **Salto inesperado** | Falha de comunicação do equipamento | Verificar eventos de equipamentos no período |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Relatório não encontra falhas | Sequênciais sem configuração | Configurar em Configurações → Sequênciais |
| Lac unas persistentes após correção | Causa raiz não resolvida | Investigar a origem das infrações no período |
| Lote rejeitado após exportação | Falha não corrigida | Não exportar sem verificar este relatório antes |

## Relacionado

- [Sequênciais de Infrações](../administracao/sequenciais-infracoes)
- [Eventos dos Equipamentos](./eventos-equipamentos)
- [Interrupções](../medicoes/interrupcoes)

## Perguntas frequentes

**Qual a diferença entre falhas sequenciais e eventos de equipamentos?**
O Relatório de Falhas Sequenciais identifica padrões de repetição na numeração de infrações. O Relatório de Eventos de Equipamentos registra interrupções físicas do hardware. São complementares.

**Devo verificar este relatório antes de exportar um lote?**
Sim. Lacunas sequenciais não resolvidas podem causar rejeição do lote pelo órgão autuador. Verifique e corrija antes de exportar.

**Como interpretar um salto inesperado na sequência?**
Saltos geralmente indicam infrações descartadas sem motivo documentado ou falha de comunicação do equipamento. Investigue os eventos do período para identificar a causa.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Sequenciais de Infrações](../administracao/sequenciais-infracoes)** | A configuração dos sequenciais define o intervalo esperado; sem configuração correta este relatório não funciona |
| **[Eventos de Equipamentos](./eventos-equipamentos)** | Saltos na sequência por falha de equipamento aparecem correlacionados nos eventos daquele período |
| **[Relatório de Discrepancias](./relatorio-discrepancias)** | Sequenciais duplicados identificados aqui também aparecem como discrepancias e devem ser tratados em conjunto |
| **[Exportação de Infrações](../infracoes/exportacao)** | Lacunas não resolvidas podem causar rejeição do lote de exportação pelo órgão autuador |

## Exemplo prático

**Cenário**: O operador tenta exportar o lote de segunda-feira mas recebe rejeicao do órgão por "numeração sequencial inválida". O relatório de Falhas Sequenciais é usado para diagnosticar o problema.

**Passo a passo**:

1. Acesse **Relatórios → Falhas Sequenciais**
2. Defina o **Período** = segunda-feira em questão
3. Configure **Quantidade mínima = 1** para mostrar qualquer falha
4. Clique em **Verificar** — o sistema exibe 2 lac unas: números 1201 e 1202 faltando
5. Acesse **Infrações → Triagem** e filtre pelo horário do gap: descarte não documentado
6. Documente a justificativa do descarte retroativamente
7. Volte ao relatório e confirme que as lacunas foram resolvidas
8. Gere novamente o lote de exportação

**Resultado**: O lote corrigido é aceito pelo órgão autuador. O incidente motiva a equipe a executar o relatório de falhas ANTES de toda exportação.
