---
sidebar_position: 6
title: Infrações Descartadas
description: Consulta e revisão de Infrações descartadas no processamento
---

# Infrações Descartadas

As Infrações descartadas são consultadas diretamente pela tela de **Consulta de Infrações utilizando o filtro de **Status de Processamento = Descartada**. Não existe uma tela exclusiva para Infrações descartadas — o fluxo é unificado na consulta.

## Como acessar

**Menu lateral** → Infrações → **Consulta** → filtrar por **Status Processamento: Descartada**

Ou acesse diretamente: `/consultainfracao`

## Filtros disponíveis na Consulta

| Filtro | Descrição |
|--------|-----------|
| **Status Processamento** | Selecione **Descartada** para ver apenas as descartadas |
| **Motivo Descarte** | Filtrar pelo motivo do descarte |
| **Grupo de Equipamentos | Filtrar por grupo (ex: IMEPI-OCR) |
| Equipamento | Ponto de fiscalização específico |
| **Período** | Faixa de datas |

## Status de Processamento disponíveis

| Status | Descrição |
|--------|-----------|
| Triagem | Aguardando triagem manual |
| Classificação | Em processo de classificação |
| Reavaliar | Marcada para reavaliação |
| Consultar | Em consulta ao SERPRO/webservice |
| Processada | Processamento concluído |
| **Descartada** | Descartada na triagem, auditoria ou por exceção automática |
| Auditar | Aguardando auditoria |
| Homologada | Auditada e homologada |

## Funcionalidades

- Consultar Infrações descartadas por analista, Equipamento e período
- Verificar o motivo de descarte por analista
- Identificar padrões de qualidade por equipamento

:::tip
Use este relatório regularmente para avaliar a qualidade de captura dos equipamentos. Alta taxa de descarte em um equipamento pode indicar necessidade de calibração ou limpeza.
:::

## Casos de uso

- **Análise de qualidade** — identifique equipamentos com alta taxa de descarte para direcionar manutenção preventiva
- **Auditoria de motivos** — verifique se os operadores estão usando os motivos corretos e não genéricos
- **Conformidade de exceções** — confirme que descartes automáticos por exceção estão aplicando a regra correta
- **Capacitação de equipe** — use os dados de descarte por operador para identificar necessidades de treinamento

## Relacionado

- [Triagem](./triagem)
- [Motivos de Descarte](../administracao/motivos-descartes)
- [Processamento por Usuário](../relatorios/processamento-por-usuario)

## Fluxo de revisão de descartadas

1. Acessar **Infrações → Consulta** com filtro **Status = Descartada**
2. Filtrar por **período** e **equipamento** para reduzir o volume
3. Analisar os **Motivos de Descarte** mais frequentes
4. Identificar se há padrão (equipamento específico, analista específico)
5. Acionar ação corretiva: manutenção, calibração ou treinamento
6. Registrar ações no sistema para comprovante ao contratante

## Tabela de referência — motivos de descarte e atenção

| Motivo | Taxa aceitável | Alerta se |
|--------|:-------------:|----------|
| Imagem ruim / OCR | < 10% | > 15%: verificar câmera |
| Placa ilegível | < 8% | > 12%: calibrar equipamento |
| Motivo genérico | < 5% | > 10%: rever treinamento |
| Exceção automática | Conforme regras | Verificar regras de exceção |
| Dupla contagem | 0% | Qualquer ocorrência — investigar |
- Visualizar motivo do descarte e observações
- Exportar Relatório de descartadas

:::info
Infrações descartadas por **exceção automática** também aparecem com status "Descartada", identificadas pelo motivo configurado na regra de exceção. Veja [Exceções](./excecoes) para configurar regras de descarte automático.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Origem | [Consulta de Infrações](./consulta-infracoes) | Tela principal de consulta |
| Origem | [Triagem](./triagem) | Infrações descartadas durante a triagem |
| Relacionado | [Exceções](./excecoes) | Regras de descarte automático |
| Configuracao | [Motivos de Descarte](../administracao/motivos-descartes) | Lista de motivos disponíveis |

## Perguntas frequentes

**É possível reverter uma infração descartada?**
Sim, até a etapa de auditoria. Acesse **Infrações → Infrações Descartadas**, localize a infração e solicite a reversão ao auditor responsavél. Infrações descartadas após a exportação não podem ser recuperadas.

**O que significa motivo genérico e por que é problema?**
Motivo genérico (ex.: “Outros”) não permite rastrear a causa real do descarte. Isso prejudica a análise de qualidade, impede melhorias nos equipamentos e pode ser questinado em auditoria contratual.

**Alta taxa de descarte em um equipamento indica o que?**
Geralmente problemas técnicos: câmera suja, ângulo errado, OCR descalibrado ou iluminação insuficiente. Use o relatório de **Processamento de Imagens** para cruzar a taxa de descarte com o aproveitamento OCR.
## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Infrações — Triagem](./triagem)** | As infrações descartadas são originadas da ação de descarte na triagem; esta tela permite revisar e reverter os descartes |
| **[Motivos de Descarte](../administracao/motivos-descartes)** | Os motivos de descarte exibidos nesta tela são configurados no módulo de Administração |
| **[Exceções](./excecoes)** | Infrações descartadas automaticamente por regras de exceção também aparecem aqui com o motivo configurado na regra |
| **[Processamento de Imagens](../relatorios/processamento-imagens)** | Cruzar este relatório com o de Processamento de Imagens ajuda a identificar equipamentos com alta taxa de descarte por qualidade |