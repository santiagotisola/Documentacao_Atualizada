---
sidebar_position: 6
title: Motivos de Pesagem
description: Cadastro de motivos utilizados nos processos de pesagem
---

# Motivos de Pesagem

![Iniciar Pesagem — Selecionar PBT](../img/Iniciar%20pesagem%20-%20selecionar%20PBT%20-%20%20cadastro%20na%20classificacao.png)

Cadastro dos motivos padronizados utilizados nas operações de pesagem, como motivos de liberação, reclassificação e descarte.

## Como acessar

**Menu lateral** → **Iniciar Pesagem** → **Motivos**

## Listagem

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Nome** | Motivo configurado |
| **Tipo** | Liberação, Reclassificação ou Descarte |
| **Status** | Ativo ou Inativo |

## Motivos comuns

| Motivo | Tipo |
|--------|------|
| Liberação por pagamento | Liberação |
| Liberação por recurso | Liberação |
| Liberação por descarga | Liberação |
| Reclassificação de categoria | Reclassificação |
| Imagem inválida | Descarte |

:::tip
Motivos bem definidos facilitam a análise gerencial e a rastreabilidade das liberações nos postos de pesagem.
:::

| Reclassificação de categoria | Reclassificação |
| Imagem inválida | Descarte |

:::tip
Motivos detalhados facilitam a análise gerencial e a rastreabilidade de liberações nos postos de pesagem.
:::| **Código** | Identificador do motivo |
| **Descrição** | Texto descritivo do motivo |
| **Tipo** | Liberação, Reclassificação ou Descarte |
| **Ativo** | Status do motivo |

### Passo a passo — Cadastrar Motivo

1. Na tela de **Iniciar Pesagem**, acesse **Motivos**
2. Clique em **+ Novo**
3. Informe a Descrição do motivo
4. Selecione o Tipo
5. Marque como Ativo
6. Clique em **Salvar**

## Relacionado

- [Liberar Pesagem](./liberar-pesagem)
- [Reclassificar](./reclassificar)
- [Tickets Abertos](./ticket-aberto)
- [Processamento por Usuário](../relatorios/processamento-por-usuario)

## Fluxo de uso dos motivos

1. Veículo autuado ou retido no posto
2. Operador avalia a situação (descarga parcial, recurso, pagamento)
3. Seleciona o **Motivo** correspondente na tela de pesagem
4. Sistema registra o motivo vinculado ao ticket
5. Gestores consultam os motivos nos relatórios gerenciais

## Tabela de referência — motivos e tipos

| Motivo | Tipo | Quando usar |
|--------|------|-------------|
| Liberação por pagamento | Liberação | Veículo pagou a multa no local |
| Liberação por recurso | Liberação | Motorista apresentou defesa formal |
| Liberação por descarga | Liberação | Parte da carga foi descarregada |
| Reclassificação de categoria | Reclassificação | Categoria atribuída incorretamente |
| Imagem inválida | Descarte | Foto sem qualidade para identificação |
| Placa ilegível | Descarte | OCR não reconheceu a placa |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Motivo genérico aplicado sempre | Falta de orientação à equipe | Treinamento e revisão de descartadas |
| Motivo inativo no sistema | Cadastro desatualizado | Reativar ou criar novo motivo |
| Motivo errado para o tipo | Liberação usado como descarte | Auditar registros e corrigir |

## Boas práticas

- Mantenha motivos específicos e descritivos — motivos genéricos dificultam a análise gerencial
- Crie motivos distintos para **liberação**, **reclassificação** e **descarte** para segmentar corretamente os relatórios
- Inative motivos obsoletos em vez de excluí-los para preservar o histórico operacional
- Revise periodicamente os motivos mais usados no Dashboard para identificar padrões de liberação indevida

## Perguntas frequentes

**Por que é importante usar motivos específicos ao invés de um motivo genérico como "Outros"?**
Motivos genéricos inviabilizam a análise gerencial dos padrões de liberação e descarte. Com motivos bem definidos, o gestor consegue identificar se muitos veículos estão sendo liberados por descarga (indica sobrecarga frequente) ou por recurso (indica contestabilidade das autenções).

**Posso excluir um motivo que não é mais utilizado?**
Não exclua motivos vinculados a tickets existentes. Inative o motivo — ele sairá das seleções ativas mas permanecerá nos registros históricos, garantindo a rastreabilidade das operações passadas.

**Como o tipo do motivo (Liberação, Reclassificação ou Descarte) impacta os relatórios?**
O tipo define em qual métrica o registro será contabilizado. Motivos do tipo **Liberação** aparecem nos relatórios de liberações; **Descarte** nos de infrações descartadas; e **Reclassificação** nos de correções de categoria. Usar o tipo errado distorce as estatísticas operacionais.

:::tip
Motivos bem configurados alimentam os relatórios gerenciais e permitem identificar padrões como excessívas liberações por "erro de classificação" que podem indicar necessidade de treinamento da equipe.
:::
