---
sidebar_position: 6
title: Reclassificar
description: Reclassificação de Veículos pesados
---

# Reclassificar

Permite reclassificar Veículos que foram pesados com classificação incorreta. Necessário quando o sistema OCR ou o operador atribuiu uma categoria equivocada ao Veículo durante a pesagem.

![Reclassificar](../img/Balança%20-%20Reclassificar.png)

## Como acessar

**Menu lateral** → Balança → **Reclassificar**

## Campos da reclassificação

| Campo | Descrição |
|-------|-----------|
| **Ticket** | Ticket da pesagem original |
| **Classificação Atual** | Tipo de Veículo registrado na pesagem |
| **Nova Classificação** | Classificação correta do Veículo |
| **Motivo** | Justificativa da reclassificação (obrigatório) |
| **Operador** | Usuário responsável pela correção |

## Passo a passo

1. Acesse **Balança → Reclassificar**
2. Informe o **Ticket** da pesagem original
3. Verifique a **Classificação Atual**
4. Selecione a **Nova Classificação** correta
5. Preencha o **Motivo** da reclassificação
6. Clique em **Confirmar**

## Impactos da reclassificação

- O **peso aferido** permanece inalterado
- O **limite de PBT** passa a considerar a nova categoria
- Se o excesso se mantiver, a infração é mantida com nova classificação
- Se o peso estiver dentro do limite com a nova categoria, a infração é cancelada

:::warning Auditoria
Todas as reclassificações são registradas em log com o operador responsável e a justificativa. Reclassificações sem motivo coerente podem ser revistas pela supervisão.
:::

## Impacto da reclassificação

A reclassificação recalcula automaticamente os limites de peso aplicáveis ao Veículo

| Impacto | Descrição |
|---------|-----------|
| **Limite de peso** | Ajustado conforme a nova categoria |
| Infração | Pode ser gerada, cancelada ou alterada conforme o novo limite |
| **Ticket** | Atualizado com a nova classificação e resultado |

:::warning Atenção
Ao reclassificar um Veículo o sistema recalcula o enquadramento da Infração Uma Infração já exportada **não** pode ser reclassificada sem autorização do administrador.
:::

## Relacionado

- [Tickets Fechados](./ticket-fechado)
- [Tickets Abertos](./ticket-aberto)
- [Motivos](./motivos)

## Erros comuns

| Situação | Causa provável | Solução |
|----------|---------------|----------|
| Reclassificação não cancela a infração | Nova classificação ainda excede o PBT | Verificar o limite da nova categoria |
| Opção de reclassificar desativada | Ticket já exportado | Use somente em tickets abertos |
| Motivo obrigatório não preenchido | Validação do sistema | Preencher o campo Motivo |
| Infração exportada não pode ser alterada | Lote já transmitido | Contatar administrador para reabrir |

## Tabela de referência — impacto por classificação

| Classificação original | Nova classificação | Resultado possível |
|------------------------|---------------------|-------------------|
| Caminhão toco (16t) | Caminhão truck (23t) | Infração cancelada se < 23t |
| Bi-truck (29t) | Bitrem (41,5t) | Infração cancelada se < 41,5t |
| Classificação maior | Classificação menor | Infração mantida ou agravada |
- [Postos de Pesagem](./postos)

## Boas práticas

- Reclassifique **antes** de liberar o veículo — a liberação sem reclassificar mantém a classificação incorreta no histórico
- Selecione sempre o motivo correto para que a gestão identifique padrões de classificação equivocada pelos operadores
- Infrações já exportadas não podem ser reclassificadas sem autorização do administrador — verifique o status antes de agir
- Registre na observação por que a classificação original estava incorreta para embasar revisões de processo

## Perguntas frequentes

**Posso reclassificar um ticket já exportado?**
Não. Tickets já incluídos em lote exportado não podem ser reclassificados sem autorização do administrador. Verifique sempre o status antes de agir.

**A reclassificação altera o peso aferido?**
Não. O peso registrado na balança é imutável. A reclassificação apenas altera a categoria do veículo e recalcula o limite de PBT aplicável, podendo cancelar ou manter a infração.

**Qual o prazo máximo para reclassificar um ticket aberto?**
Não há prazo fixo no sistema, mas recomenda-se reclassificar **antes** de liberar o veículo para evitar inconsistência entre o ticket e a infração gerada.

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Ticket Fechado](./ticket-fechado) | Ticket a reclassificar |
| Relacionado | [Motivos](./motivos) | Motivos disponíveis |

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Tickets Fechados](./ticket-fechado)** | A reclassificação deve ser realizada antes do fechamento do ticket; tickets já fechados exigem autorização do administrador |
| **[Motivos de Pesagem](./motivos)** | O motivo de reclassificação é obrigatório e fica registrado no histórico do ticket para fins de auditoria |
| **[Tipos de Veículos](../veiculos/tipos-veiculos)** | A reclassificação seleciona uma nova categoria de veículo; as categorias disponíveis são definidas no cadastro de tipos de veículos |
| **[Infrações — Consulta](../infracoes/consulta-infracoes)** | Após reclassificação, a infração gerada (ou cancelada) reflete a nova categoria e pode ser verificada na consulta de infrações |
| Relacionado | [Postos](./postos) | Posto de pesagem de origem |

## Fluxo decisório

```
Resultado da pesagem = Excesso detectado
        │
        ▼
Classificação automática está correta?
   ├── SIM → Manter classificação e prosseguir
   └── NÃO (ex: eixo extra não detectado)
              │
              ▼
        Acessar Balança → Reclassificar
              │
              ▼
        Com a nova categoria, o peso excede o PBT?
          ├── SIM → Infração mantida com nova classificação
          └── NÃO → Infração cancelada automaticamente
```

:::warning
Reclassifique **antes** de liberar o veículo. Após o encerramento do ticket, somente o administrador pode reabrir.
:::
