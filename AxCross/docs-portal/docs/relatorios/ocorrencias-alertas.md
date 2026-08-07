---
sidebar_position: 5
title: Ocorrências e Alertas
description: Relatório de ocorrências e alertas no AxCross
---

# Ocorrências e Alertas

Consolida todos os alertas e ocorrências registrados no sistema, com detalhes de tratativa, responsável e resolução, permitindo Análise e prestação de contas das ações operacionais.

## Como acessar

No **menu lateral**, clique em Relatórios e selecione **Ocorrências e Alertas**.

![Relatório de Ocorrências](../img/Relatório de Ocorrências.png)
)

## Filtros

| Filtro | Obrigatório | Descrição |
|--------|:-----------:|-----------|
| **Data Início** | Sim | Data inicial do período |
| **Data Fim** | Sim | Data final do período |
| **Tipo de Ocorrência** | Não | Filtrar por categoria (ex.: Placa Monitorada, MANCHA01) |
| **Status** | Não | Aberto, Em atendimento, Resolvido, Descartado |

## Colunas

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento da ocorrência |
| **Tipo** | Categoria do alerta |
| **Placa** | Veículo envolvido |
| **Operador** | Responsável pelo atendimento |
| **Status** | Estado atual da tratativa |
| **Resolução** | Descrição da ação tomada |

:::tip Exportar
Exporte o relatório em CSV para auditorias ou prestação de contas das operações ao órgão contratante.
:::

## SLA de atendimento recomendado

| Tipo de Ocorrência | Prazo |
|--------------------|:-----:|
| Veículo roubado/furtado | Imediato |
| Alerta monitorado | 30 min |
| Ocorrência de baixa prioridade | Até 24h |

## Relacionado

- [Alertas](../operacoes/alertas)
- [Veículos Monitorados](./veiculos-monitorados)
- [Mapeamento de Rotas](./mapeamento-rotas)

| Usuário | Não | Responsável pelo atendimento |
| **Local** | Não | Cruzamento relacionado |

## Colunas do resultado

| Coluna | Descrição |
|--------|-----------|
| **Data/Hora** | Momento de geração do alerta |
| **Tipo** | Categoria da ocorrência |
| **Local** | Cruzamento associado |
| **Placa** | Veículo envolvido (quando aplicável) |
| **Status** | Estado atual da tratativa |
| **Assumido por** | Usuário que assumiu o atendimento |
| **Resolvido por** | Usuário que encerrou o alerta |
| **Observações** | Descrição da tratativa realizada |

## Passo a passo

1. Acesse **Relatórios → Ocorrências e Alertas** no menu lateral
2. Defina o **período** de consulta
3. Opcionalmente, aplique filtros por tipo, status ou responsável
4. Clique em **Consultar**
5. Para exportar, clique em **Excel**

:::tip Fiscalização e auditoria
Este Relatório é a principal ferramenta para demonstrar as atividades operacionais realizadas, incluindo alertas gerados, quem atendeu e como foram resolvidos.
:::

## Casos de uso

- **Prestação de contas ao contratante**: comprovar o volume e a qualidade do atendimento de alertas no período
- **Gestão de SLA**: verificar se os prazos de atendimento por tipo de ocorrência foram cumpridos
- **Auditoria de processo**: identificar alertas abertos sem atendimento ou resolvidos sem descrição da ação tomada
- **Análise de recorrência**: detectar placas ou locais com alta frequência de alertas para escalonamento operacional

## Relacionado

- [Alertas](../operacoes/alertas)
- [Veículos Monitorados](./veiculos-monitorados)
- [Mapeamento de Rotas](./mapeamento-rotas)
- [Painel Analítico](./painel-analitico)

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Ocorrência não aparece no relatório | Filtro de status excluindo o tipo buscado | Limpar filtros e ampliar o período |
| Alertas sem responsável | Alerta gerado mas não assumido pelo operador | Verificar SLA e reatribuir o alerta |
| Exportação incompleta | Limite de registros por exportação atingido | Dividir em períodos menores ou ajustar o limite nas Configurações |

## Perguntas frequentes

**Como exportar o relatório de ocorrências para apresentar ao contratante?**
Apli-que os filtros de período desejado e clique em **Excel** para gerar o arquivo. O CSV exportado contém todas as colunas visíveis, incluindo responsabilidades, status e descrição das tratativas, servindo como comprovante das ações operacionais realizadas.

**Por que um alerta aparece no relatório sem responsabilidade atribuída?**
Isso indica que o alerta foi gerado automaticamente mas nenhum operador clicou em **Assumir** antes de resolvê-lo. Estabeleça como procedimento padrão que todo alerta deve ser assumido antes do tratamento para garantir rastreabilidade de SLA.

**Como encontrar ocorrências de uma placa específica no relatório?**
O relatório não possui filtro direto por placa na tela principal. Para análise de uma placa específica, use o **Painel Analítico** (aba Alertas) ou exporte o relatório em Excel e aplique filtro pela coluna Placa.

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Alertas** | As ocorrências exibidas neste relatório são originadas nos alertas gerados automaticamente na tela de Alertas |
| **Veículos Monitorados** | Passagens de veículos monitorados geram alertas que aparecem consolidados neste relatório |
| **Painel Analítico** | Complementa a análise: use o Painel para investigar individualmente cada placa identificada nas ocorrências |
| **Mapeamento de Rotas** | Após identificar uma placa recorrente nas ocorrências, use o Mapeamento para visualizar o percurso do veículo |

## Exemplo prático

**Cenário**: O gestor precisa apresentar ao contratante o relatório mensal de efetividade do sistema: quantos alertas foram gerados, quantos foram atendidos dentro do SLA e quais ficaram sem responsabilidade atribuída.

**Passo a passo**:

1. Acesse **Relatórios → Ocorrências e Alertas**
2. Defina o **período** = mês anterior completo
3. Deixe os demais filtros em branco para incluir todos os tipos
4. Clique em **Consultar** e verifique o total gerado
5. Filtre por **Status = Aberto** para identificar alertas sem tratativa (SLA em risco)
6. Exporte em **Excel** e calcule a taxa de atendimento: `(resolvidos / total) × 100`
7. Identifique operadores com mais alertas resolvidos — e os sem atendimento registrado

**Resultado**: O relatório documenta 342 alertas no mês, 95,6% resolvidos dentro do SLA. Os 15 alertas abertos são priorizados na reunião semanal, e o Excel é entregue ao contratante como comprovante das atividades.
