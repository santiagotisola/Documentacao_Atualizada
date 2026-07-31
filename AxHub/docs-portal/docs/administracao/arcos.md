---
sidebar_position: 2
title: Arcos
description: Cadastro de arcos de fiscalização
---

# Arcos

Permite cadastrar e gerenciar os arcos de fiscalização vinculados às operações.

![Lista de Arcos](../img/Configurações%20-%20Arco.png)

## Como acessar

**Menu lateral** → Configurações → **Arcos**

## Cadastro de arco

![Cadastro de Arco](../img/Configurações%20-%20Arco%20-%20cadastro.png)
## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Identificação do arco |
| **Localidade** | Sim | Local de instalação |
| **Equipamentos** | Sim | Equipamentos vinculados ao arco |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Configurações → Arcos**
2. Clique em **+ Novo**
3. Preencha o **Nome** e a **Localidade**
4. Vincule os **Equipamentos** do arco
5. Clique em **Salvar**

:::info O que é um Arco?
Um arco agrupa equipamentos instalados na mesma travessia (ex: radares das faixas 1, 2 e 3 de uma mesma pista), facilitando o gerenciamento e exportação conjunta.
:::

## Casos de uso

- **Fiscalização de avanço de sinal**: agrupamento de 3 faixas na mesma intersecção
- **Corredor de ônibus**: todos os pontos do corredor como um arco
- **Polo industrial**: agrupamento por zona fiscal

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Equipamento em 2 arcos | Dois arcos criados para mesma faixa | Remover duplicata |
| Arco sem equipamento | Vínculo não criado | Vincular antes de usar |
| Exportação sem arco | Equipamento não vinculado | Vincular ao arco correto |

## Relacionado

- [Operações](../operacoes/cadastro-operacoes)
- [Faixas](../operacoes/faixas)
- [Eventos de Equipamentos](../relatorios/eventos-equipamentos)

## Boas práticas

- Agrupe no mesmo arco todos os equipamentos instalados na mesma estrutura física (ex.: câmeras das faixas 1, 2 e 3 de uma mesma pista)
- Use nomenclatura padronizada (ex.: ARQ-001-ROD-SP330) para facilitar a identificação nos relatórios e lotes
- Vincule os equipamentos corretos — um equipamento em arco errado gera inconsistência nos lotes de exportação
- Mantenha arcos desativados como **Inativos** para preservar o histórico de infrações associadas

## Relacionado

- [Eventos de Equipamentos](../relatorios/eventos-equipamentos)
- [Operações](../operacoes/cadastro-operacoes)

:::info
Arcos permitem exportar dados de múltiplas faixas/equipamentos de uma mesma localidade em um único lote, mantendo consistência na numeração e registro.
:::
:::
| Campo | Descrição |
|-------|-----------|
| **Nome** | Identificação do arco |
| **Localização** | Endereço ou referência |
| Equipamentos | Equipamentos vinculados ao arco |
| **Status** | Ativo ou Inativo |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Equipamentos](../cadastros-basicos/equipamentos) | Equipamentos no arco |
| Relacionado | [Operacoes](../operacoes/cadastro-operacoes) | Operacao vinculada |

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Operações** | Cada operação pode ser vinculada a um arco para agrupar equipamentos da mesma estrutura física |
| **Lote de Exportação** | Infrações agrupadas por arco são exportadas em conjunto com numeração sequencial consistente |
| **Relatório de Passagens** | Permite filtrar dados por arco, exibindo o volume total de passagens da travessia |
| **Monitoramento Online** | Exibe o status de todos os equipamentos de um arco em um único painel |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Equipamento aparece em dois arcos | Vínculo duplicado no cadastro | Remover o vínculo incorreto em um dos arcos |
| Arco não aparece nos relatórios | Operação não vinculada ao arco | Vincular a operação ao arco nas configurações |
| Faixa sem associação ao arco | Equipamento não cadastrado no arco | Incluir o equipamento no arco correto |

## Perguntas frequentes

**Um equipamento pode pertencer a dois arcos ao mesmo tempo?**
Não. Cada equipamento deve estar vinculado a apenas um arco. Verifique e corrija duplicatas no cadastro para evitar inconsistências nos lotes de exportação.

**O arco precisa ser cadastrado antes da operação?**
Sim. O arco agrupa os equipamentos e deve estar configurado antes de vincular faixas à operação.

**Inativar um arco afeta infrações já geradas?**
Não. Infrações anteriores à inativação são preservadas no histórico; apenas novos registros são bloqueados.
