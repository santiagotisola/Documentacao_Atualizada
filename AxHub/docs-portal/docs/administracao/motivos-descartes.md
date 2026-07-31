---
sidebar_position: 9
title: Motivos de Descarte
description: Cadastro dos motivos para descarte de infrações durante a triagem no AxHub
---

# Motivos de Descarte

Cadastro dos **motivos que justificam o descarte** de infrações durante a triagem. Motivos padronizados garantem análise estatística confiável e treinamento da equipe.

## Como acessar

**Menu lateral** → Configurações → **Motivos de Descarte**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome** | Sim | Descrição do motivo |
| **Descrição** | Não | Detalhamento para o triador |
| **Status** | Sim | Ativo ou Inativo |

## Motivos comuns

| Motivo | Quando usar |
|--------|-------------|
| **Imagem ilegível** | Placa não visível por sujeira, chuva ou ângulo |
| **Placa incorreta** | OCR leu placa errada |
| **Veículo isento** | Cate oria isenta de fiscalização |
| **Falha de equipamento** | Problemas técnicos na captura |
| **Enquadramento incorreto** | Artigo CTB não aplicável à situação |

:::tip Análise de qualidade
O Dashboard exibe o **Top Motivos de Descarte**. Use essa informação para identificar problemas recorrentes nos equipamentos e treinar a equipe.
:::

## Análise de padrões

| Motivo dominante | Possível causa | Ação |
|------------------|----------------|------|
| Imagem ilegível | Câmera suja ou desalinhada | Manutenção preventiva |
| Placa incorreta | OCR descalibrado | Recalibração |
| Enquadramento incorreto | Velocidade mal configurada | Revisar faixas |
| Veículo isento | Regra de exceção ausente | Criar exceção |

## Boas práticas

- Crie motivos claros e específicos para cada tipo de descarte — termos genéricos dificultam a análise de causa-raiz
- Revise os motivos mais usados periodicamente; alta frequência de "Imagem ilegível" indica problema técnico no equipamento
- Documente o embasamento de cada motivo para facilitar auditorias e contestações do órgão autuador
- Não exclua motivos com histórico de uso — inative-os para preservar a rastreabilidade das infrações descartadas

## Relacionado

- [Exceções](../infracoes/excecoes)
- [Processamento por Usuário](../relatorios/processamento-por-usuario)

## Fluxo de análise de descartes

1. Acessar **Relatórios → Processamento por Usuário** após cada semana
2. Identificar o **motivo mais usado** por equipamento e por analista
3. Se "Imagem ilegível" > 10%: programar limpeza ou calibração do equipamento
4. Se motivo genérico > 5%: revisar treinamento da equipe
5. Documentar ações corretivas tomadas

## Tabela de referência — taxas aceitáveis

| Motivo | Taxa normal | Alerta | Ação recomendada |
|--------|:-----------:|:------:|------------------|
| Imagem ilegível | < 10% | > 15% | Manutenção de câmera |
| Placa incorreta | < 8% | > 12% | Calibrar OCR |
| Enquadramento incorreto | < 5% | > 8% | Revisar configuração de faixa |
| Motivo genérico | < 5% | > 10% | Treinamento da equipe |
| Exceção automática | Conforme regras | Qualquer aumento | Auditar regras de exceção |


|-------|-----------|
| **Código** | Código identificador |
| **Descrição** | Descrição do motivo (ex: Imagem ilegível, Placa não identificada) |
| **Ativo** | Status do registro |

:::note Sem screenshot
está tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Triagem](../glossario/triagem) | Ver definicao no glossario |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Triagem](../infracoes/triagem) | Uso na triagem |
| Relacionado | [Infracoes Descartadas](../infracoes/infracoes-descartadas) | Resultado |

## Integração com outros módulos

| Módulo | Como usa este cadastro |
|--------|----------------------|
| **Triagem** | O analista seleciona um motivo de descarte ao rejeitar uma infração; sem motivos cadastrados, a triagem fica bloqueada |
| **Infrações Descartadas** | Exibe as infrações rejeitadas agrupadas por motivo, permitindo análise de padrões |
| **Processamento por Usuário** | Cruza motivos de descarte com o analista responsável para avaliar consistência na triagem |
| **Dashboard** | Exibe o ranking dos Top Motivos de Descarte como indicador de qualidade operacional |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Triagem bloqueada sem motivos de descarte | Nenhum motivo ativo cadastrado | Cadastrar ao menos um motivo de descarte ativo |
| Alta taxa de descarte por motivo genérico | Motivos pouco descritivos na lista | Criar motivos específicos e desativar genéricos |
| Motivo não aparece para o analista | Motivo inativo | Ativar o motivo nas configurações de Administração |

## Perguntas frequentes

**Posso excluir um motivo que não é mais utilizado?**
Não recomendado. Inative-o para preservar o histórico de infrações descartadas com esse motivo.

**A alta taxa de descarte por ‘Imagem ilegível’ indica problema no equipamento?**
Sim. Taxa acima de 10% desse motivo geralmente indica câmera suja, desalinhada ou com defeito. Agende manutenção preventiva.

**Posso personalizar motivos além dos padrão?**
Sim. Crie motivos específicos para o contexto da operação, desde que sejam claros e documentados para facilitar auditorias.
