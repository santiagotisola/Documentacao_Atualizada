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

## Relacionado

- [Exceções](../infracoes/excecoes)
- [Processamento por Usuário](../relatorios/processamento-por-usuario)


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
