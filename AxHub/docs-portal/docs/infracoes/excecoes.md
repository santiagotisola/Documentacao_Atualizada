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

## Fluxo de configuração de excessão

1. Identificar a necessidade (veículo oficial, período de evento, faixa exclusiva)
2. Reunir o embasamento legal (decreto, portaria, ato autorizador)
3. Acessar **Infrações → Exceções** e clicar em **+ Nova**
4. Selecionar o **Tipo de filtro** e configurar os critérios
5. Definir a **Vigência** com data de início e fim
6. Vincular ao **Motivo de descarte** correspondente
7. Salvar e monitorar as infrações descartadas pela regra

## Tabela de referência — tipos de exceção

| Tipo | Exemplo prático | Observação |
|------|----------------|------------|
| **Placa** | Ambulância, viatura policial | Sempre com embasamento legal |
| **Horário** | Isento entre 00h e 05h em feriados | Cuidado com períodos amplos |
| **Faixa** | Corredor exclusivo de ônibus | Configurar apenas a faixa correta |
| **Classificação** | Trator agrícola isento de velocidade | Verificar enquadramento aplicado |
| **Data** | Período eleitoral, carnaval | Definir data fim obrigatória |

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

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Veículo isento continua gerando infrações | Regra de exceção inativa ou vencida | Verificar **Data Fim** e status da regra de exceção |
| Infração descartada por exceção indevidamente | Placa com formato diferente (Mercosul/antigo) | Cadastrar ambos os formatos da placa na regra |
| Regra não aplica na triagem | Exceção configurada após a importação das infrações | Regras só se aplicam a infrações importadas após a criação da regra |

## Perguntas frequentes

**Que tipo de veículo pode ser configurado como exceção?**
Qualquer veículo com embasamento legal: viaturas de emergência, veículos oficiais por ato administrativo, ou placas em testes de homologação. Nunca configure exceções sem documento formal de autorização.

**Exceções são permanentes ou têm prazo?**
Pode ser dos dois tipos. Recomenda-se sempre definir uma **Data Fim** mesmo para exceções de veículos oficiais, vinculada à vigência do ato autorizador. Exceções sem prazo são risco de cobertura indevida.

**Como auditar quais infrações foram descartadas por exceção?**
Acesse **Infrações → Consulta** com filtro **Status = Descartada** e filtre pelo **Motivo de Descarte** configurado na regra de exceção. Exporte para Excel para análise detalhada.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Infrações — Triagem](./triagem)** | As regras de exceção são aplicadas durante a importação, antes da triagem; infrações isentas nunca chegam à fila do analista |
| **[Motivos de Descarte](../administracao/motivos-descartes)** | O motivo de descarte aplicado pelas exceções é configurado no módulo de Motivos de Descarte da Administração |
| **[Infrações Descartadas](./infracoes-descartadas)** | Infrações descartadas por exceção ficam acessíveis nesta tela para consulta e auditoria |
| **[Enquadramentos](../administracao/enquadramentos)** | Exceções por classificação de veículo dependem dos enquadramentos configurados para o equipamento |
