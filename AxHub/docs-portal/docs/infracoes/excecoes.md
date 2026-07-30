---
sidebar_position: 3
title: Exceções
description: Gerenciamento de regras de exceção para Infrações
---

# Exceções

A tela de Exceções permite configurar regras que isentam determinados Veículos ou situações do auto de Infração Exceções são aplicadas automaticamente durante o processamento.

![Tela de Exceções](../img/triagem-excecoes.png)

## Como acessar

**Menu lateral** → Infrações → **Exceções**

## Tipos de filtro

| Filtro | Descrição |
|--------|-----------|
| **Placas** | Inverte Infrações para placas específicas (ex: Veículos oficiais) |
| **Horários** | Exceção por dia da semana e faixa de horário |
| **Faixas** | Exceção para faixas de trânsito específicas |
| **Classificações** | Exceção por classificação do Veículo |
| **Enquadramentos** | Exceção por tipo de infração/enquadramento legal |
| **Datas** | Exceção para períodos específicos (feríados, eventos) |

## Tipos de exceção

| Tipo | Descrição |
|------|-----------|
| **Permanentes** | Veículos de emergência (ambulância, polícia, bombeiros) |
| **Temporárias** | Autoridades em visita, eventos especiais com prazo definido |
| **Por Equipamento | Exceção válida apenas em determinado ponto de fiscalização |
| **Por tipo de Infração | Ex: isento de velocidade mas não de sinal |

## Funcionalidades

- Criar regras com múltiplos filtros combinados
- Definir motivo de descarte automático para cada regra

:::caution
Exceções mal configuradas podem isentar veículos que deveriam ser autuados. Revise periodicamente as regras ativas e documente cada exceção com o embasamento legal.
:::

## Quando usar

| Situação | Cuidado ao configurar |
|----------|------------------------|
| **Veículo oficial com placa conhecida** | Exige embasamento legal documentado; registre o número do ato autorizador |
| **Veículo isento por lei municipal** | Vincule a vigência da exceção ao prazo do decreto/portaria |
| **Placa de teste / calibração** | Sempre com vigência temporária — nunca deixe a exceção sem data de término |
| **Campanha temporária** | Configure a data de expiração e monitore ativamente o encerramento |

## Relacionado

- [Enquadramentos](../administracao/enquadramentos)
- [Motivos de Descarte](../administracao/motivos-descartes)
- [Infrações Descartadas](./infracoes-descartadas)

- Configurar período de vigência da exceção
- Ativar/desativar exceções sem excluí-las
- Consultar histórico de aplicações da exceção

:::warning
Exceções ativas descartam Infrações automaticamente durante a importação. Revise periodicamente as regras cadastradas para evitar cobertura indevida de Infrações
:::

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Enquadramento](../glossario/enquadramento) | Ver definicao no glossario |
| [Triagem](../glossario/triagem) | Ver definicao no glossario |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Etapa anterior | [Triagem](./triagem) | Processo de Use Validação (com acento) inicial |
| Proxima etapa | [Auditoria](./auditoria) | Revisao pos-excecao |
| Glossario | [Enquadramento](../glossario/enquadramento) | Classificacao legal |
