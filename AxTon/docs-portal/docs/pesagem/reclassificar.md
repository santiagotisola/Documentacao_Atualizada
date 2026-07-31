---
sidebar_position: 4
title: Reclassificação de Veículos
description: Reclassificar Veículos durante o processo de pesagem
---

# Reclassificação de Veículos

![Selecionar Classificação](../img/Iniciar%20pesagem%20-%20selecionar%20por%20classificacao.png)

Permite alterar a classificação de um Veículo durante o processo de pesagem quando a classificação automática não corresponde ao Veículo real.

## Como acessar

**Menu lateral** → **Tickets de Pesagens** → **Reclassificar**

## Quando reclassificar

- O Veículo foi classificado incorretamente pelo sistema
- Mudança de Configuração de eixos
- Veículo com reboque não detectado

### Campos da Reclassificação

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Ticket** | Sim | Número do ticket de pesagem |
| **Classificação Atual** | — | Classificação atribuída automaticamente |
| **Nova Classificação** | Sim | Classificação correta do Veículo |
| **Motivo** | Sim | Justificativa para a reclassificação |

## Passo a passo

1. Acesse **Tickets de Pesagens → Reclassificar**
2. Informe o **Ticket**
3. Verifique a **Classificação Atual**
4. Selecione a **Nova Classificação** correta
5. Preencha o **Motivo**
6. Clique em **Confirmar**

:::warning
Reclassificar pode alterar o limite de PBT aplicável e, consequentemente, cancelar ou manter a infração.
:::

## Impacto da reclassificação

| Resultado | O que acontece |
|-----------|---------------|
| Peso continua acima do PBT | Infração mantida com nova classificação |
| Peso ficou dentro do PBT | Infração cancelada automaticamente |

## Relacionado

- [PBT](../glossario/pbt)
- [Classificações de Veículos](../veiculos/classificacoes-veiculos)
- [Motivos](./motivos)

## Erros comuns

| Situação | Causa provável | Solução |
|----------|---------------|----------|
| Reclassificação não altera a infração | Nova classificação ainda excede o PBT | Verificar o limite da nova categoria |
| Opção de reclassificar desativada | Ticket já exportado ou encerrado | Use somente em tickets em aberto |
| Classificação incorreta repetida | OCR confundindo tipo de eixo | Ajustar parâmetros do sensor |

## Tabela de referência — impacto no PBT

| Classificação original | Nova classificação | Resultado possível |
|------------------------|---------------------|-------------------|
| Caminhão toco (2E/16t) | Caminhão truck (3E/23t) | Infração cancelada se < 23t |
| Bi-truck (4E/29t) | Bitrem (5E/41,5t) | Infração cancelada se < 41,5t |
| Classificação maior | Classificação menor | Infração mantida ou agravada |

:::warning
Reclassificar pode alterar o limite de PBT aplicável e, consequentemente, cancelar ou manter a infração. A operação é registrada em log de auditoria.
:::

### Passo a passo

1. Na tela de **Tickets de Pesagens**, selecione o ticket e clique em **Reclassificar**
2. Informe o número do Ticket
3. Verifique a classificação atual
4. Selecione a Nova Classificação
5. Informe o Motivo da reclassificação
6. Clique em **Salvar**

:::warning Atenção
A reclassificação altera o PBT (Peso Bruto Total) permitido, podendo impactar o cálculo de excesso de peso.
:::

## Perguntas frequentes

**A reclassificação cancela automaticamente a infração, ou preciso fazer algo adicional?**
Se após a reclassificação o peso medido estiver dentro do PBT da nova categoria, a infração é cancelada automaticamente. Se ainda houver excesso, a infração é mantida com a nova classificação. Não é necessária nenhuma ação adicional.

**Posso reclassificar um ticket que já foi exportado ao órgão autuador?**
Não. Tickets com status **Exportado** não podem ser reclassificados. Qualquer correção em infrações já exportadas deve ser tratada diretamente com o órgão autuador por meio de procedimento administrativo.

**Por que a opção de reclassificar está desativada para alguns tickets?**
A reclassificação só está disponível para tickets em aberto (não exportados). Tickets já encerrados, exportados ou com status final não podem ser alterados para garantir a integridade do processo de autuação.

## Integração com outros módulos

| Módulo | Como se relaciona com Reclassificar |
|--------|-------------------------------------|
| **Pesagem → Iniciar Pesagem** | Erros de classificação cometidos durante a pesagem são corrigidos aqui |
| **Cadastros → Classificação de Veículos** | As classificações disponíveis para seleção na reclassificação são mantidas aqui |
| **Relatório de Infrações** | Após reclassificar, verifique se a infração foi atualizada corretamente no relatório |
| **Exportação de Infrações** | Tickets reclassificados não podem ser alterados se já foram exportados |
