---
sidebar_position: 2
title: Motivos
description: Cadastro de motivos de pesagem e liberação de veículos no AxHub
---

# Motivos

Cadastro dos **motivos utilizados nos processos de pesagem e liberação** de veículos. Registrar o motivo correto garante rastreabilidade e base para relatórios gerenciais.

![Lista de Motivos](../img/Balança%20-%20Motivos.png)

## Como acessar

**Menu lateral** → Balança → **Motivos**

## Cadastro de motivo

![Cadastro de Motivo](../img/Balança%20-%20Motivos%20-%20cadastro.png)

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Descrição do motivo |
| **Tipo** | Sim | Pesagem ou Liberação |
| **Status** | Sim | Ativo ou Inativo |

## Motivos de pesagem (exemplos)

| Motivo | Tipo |
|--------|------|
| Pesagem Aleatória | Pesagem |
| Suspeita de Excesso | Pesagem |
| Triagem Dinâmica | Pesagem |
| Liberação por Pagamento | Liberação |
| Liberação por Recurso | Liberação |
| Liberação por Descarga | Liberação |

:::tip
Configurar motivos detalhados facilita a análise gerencial e a identificação de padrões de retenção nos postos.
:::

## Impacto nos relatórios

Os motivos alimentam o **Dashboard gerencial** com:
- Top 5 motivos de liberação sem autuação
- Taxa de liberação por posto
- Evolução mensal por tipo

## Relacionado

- [Liberar Pesagem](./liberar-pesagem)
- [Reclassificar](./reclassificar)
- [Processamento por Usuário](../relatorios/processamento-por-usuario)

## Fluxo de uso dos motivos

1. Veículo pesado e resultado gerado (regular ou infrator)
2. Operador avalia a situação (descarga parcial, recurso, pagamento)
3. Seleciona o **Motivo** correspondente na tela de liberação
4. Sistema registra o motivo vinculado ao ticket
5. Gestores consultam os motivos nos relatórios de produção

## Tabela de referência — motivos e tipos

| Motivo | Tipo | Quando usar |
|--------|------|-------------|
| Pesagem Aleatória | Pesagem | Fiscalização rotineira |
| Su b  Suspeita de Excesso | Pesagem | Veículo com aspecto de sobrecarga |
| Liberação por Pagamento | Liberação | Multa paga no local |
| Liberação por Recurso | Liberação | Motorista apresentou defesa formal |
| Liberação por Descarga | Liberação | Carga removida do veículo |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Motivo genérico aplicado sempre | Falta de orientação à equipe | Treinamento e revisão de tickets |
| Motivo inativo no sistema | Cadastro desatualizado | Reativar ou criar novo motivo |
| Tipo errado selecionado | Pesagem em vez de Liberação | Auditar tickets e corrigir |


## Motivos comuns

| Tipo | Exemplos |
|------|---------|
| **Pesagem** | Peso excessivo confirmado, Veículo suspeito, Fiscalização aleatória |
| **Liberação** | Peso dentro do limite, Erro de captura, Veículo isento |

## Passo a passo

1. Acesse **Balança → Motivos**
2. Clique em **+ Novo**
3. Informe o **Nome** e o **Tipo**
4. Clique em **Salvar**


| Campo | Descrição |
|-------|-----------|
| **Descrição** | Nome do motivo |
| **Tipo** | Liberação, retenção, reclassificação |
| **Ativo** | Se o motivo está disponível para uso |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Reclassificar](./reclassificar) | Usar motivo na reclassificacao |
| Relacionado | [Postos](./postos) | Postos de pesagem |

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Liberar Pesagem** | O operador seleciona um motivo de liberação ao encerrar um ticket; sem motivos ativos, a liberação é bloqueada |
| **Reclassificar** | Cada reclassificação exige o preenchimento de um motivo para registro no log de auditoria |
| **Tickets Fechados** | O motivo usado fica registrado no histórico do ticket para consulta e exportação |
| **Dashboard** | Os motivos mais usados são exibidos no ranking gerencial para análise de padrões |

## Perguntas frequentes

**A liberação de um ticket fica bloqueada se não houver motivos cadastrados?**
Sim. O campo Motivo é obrigatório na tela de liberação. Se nenhum motivo estiver ativo, o operador não conseguirá encerrar o ticket. Cadastre ao menos um motivo de cada tipo (Pesagem e Liberação) antes de iniciar as operações.

**Posso excluir um motivo que não é mais utilizado?**
Não exclua motivos vinculados a tickets existentes. Inative o motivo para que ele não apareça mais nas seleções, mas os registros históricos que usaram esse motivo serão preservados para auditoria.

**Como identificar quais motivos estão sendo usados com mais frequência?**
Acesse o **Dashboard** e consulte o ranking de motivos de liberação e descarte. Motivos genéricos com alta frequência indicam necessidade de treinamento da equipe ou criação de motivos mais específicos.

## Perguntas frequentes

**O que fazer quando o operador seleciona sempre o mesmo motivo genérico?**
Revise o treinamento da equipe e verifique se os motivos disponíveis são específicos o suficiente. Motivos genéricos comprometem a análise gerencial.

**Posso inativar um motivo que ainda está vinculado a tickets abertos?**
Sim. A inativação impede o uso em novos tickets, mas não afeta tickets que já usam o motivo. O histórico é preservado.

**Preciso criar motivos separados para pesagem e liberação?**
Sim. O campo **Tipo** separa os motivos em categorias (Pesagem e Liberação). Manter a separação correta garante relatórios gerenciais precisos.

## Fluxo decisório

```
Pesagem concluída — resultado definido
        │
        ▼
Veículo dentro do limite de PBT?
   ├── SIM → Encerrar ticket como Regular
   └── NÃO (excesso detectado)
              │
              ▼
        Motorista fará o quê?
          ├── Pagar multa no local → Liberar pesagem (motivo: Pagamento)
          ├── Descarregar excesso → Liberar pesagem (motivo: Descarga parcial)
          ├── Apresentar defesa → Liberar pesagem (motivo: Recurso)
          └── Reclassificar veículo → Reclassificar e recalcular PBT
```

:::tip
Configurar motivos específicos para cada situação permite ao gestor analisar padrões de liberação e identificar a necessidade de treinamento da equipe.
:::
