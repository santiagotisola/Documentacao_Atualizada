---
sidebar_position: 11
title: Sequenciais de Infrações
description: Controle da numeração sequencial de autos de infração no AxHub
---

# Sequenciais de Infrações

Configura e monitora os **sequenciais numéricos** utilizados na numeração dos autos de infração. A numeração correta é exigência legal do órgão autuador.

## Como acessar

**Menu lateral** → Configurações → **Sequenciais de Infrações**

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Órgão** | Sim | Órgão autuador |
| **Série** | Sim | Série da numeração (ex.: AXH, MTC) |
| **Próximo número** | Sim | Número a ser atribuído na próxima infração |
| **Número máximo** | Não | Limite superior da série |

## Boas práticas

- Nunca reutilize sequenciais de uma série já encerrada
- Configure o **Número máximo** para evitar estouro automático da série
- Comunique ao órgão autuador antes de iniciar uma nova série

:::warning
Sequenciais duplicados geram rejeicao do lote pelo órgão autuador. Não edite o campo **Próximo número** manualmente sem autorização.
:::

- Nunca reiniciar a numeração sem autorização do órgão autuador
- Verificar o relatório de [Falhas de Sequenciais](../relatorios/relatorio-logs-envios) antes de cada lote de exportação
- Manter registro de todas as séries utilizadas por período

:::caution
A alteração indevida do sequencial pode invalidar infrações e gerar rejeição pelo órgão autuador.
:::

|-------|-----------|
| **Órgão** | Órgão autuador |
| **Sequencial Atual** | Último número utilizado |
| **Faixa Início** | Número inicial da faixa |
| **Faixa Fim** | Número final da faixa |
| **Status** | Ativo, Esgotado |

:::note Sem screenshot
está tela ainda não possui screenshot cadastrada. Será adicionada em breve.
:::

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Triagem](../infracoes/triagem) | Sequencial atribuido |
| Relacionado | [Consulta de Infracoes](../infracoes/consulta-infracoes) | Buscar por sequencial |
