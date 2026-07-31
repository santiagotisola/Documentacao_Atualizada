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
Sequenciais duplicados geram rejeição do lote pelo órgão autuador. Não edite o campo **Próximo número** manualmente sem autorização.
:::

## Relacionado

- [Sequenciais de Lote](./sequenciais-lote-exportacao)
- [Falhas de Sequenciais](../relatorios/falhas-sequenciais)
- [Lote de Exportação](../glossario/lote-exportacao)

## Fluxo de gestão de sequenciais

1. Antes de iniciar operações, cadastrar séries para cada **Órgão autuador** e **Série**
2. O sistema atribui números automaticamente durante a triagem
3. Verificar mensalmente o saldo da série (atual vs. máximo)
4. Quando atingir 80% do limite: criar nova série ou ampliar o **Número máximo**
5. Comunicar ao órgão autuador ao iniciar nova série

## Tabela de referência — configuração de série

| Campo | Valor típico | Observação |
|-------|:------------:|------------|
| Próximo número | 1 (nova série) | Definir apenas no início |
| Número máximo | 99.999 | Padrão comum |
| Séries por órgão | 1 a 3 | Depende do órgão autuador |
| Reinício anual | Não recomendado | Manter numeração contínua |

## Erros comuns

| Problema | Causa | Solução |
|----------|-------|----------|
| Infração sem número atribuído | Série esgotada ou inativa | Criar nova série ou ampliar limite |
| Sequencial duplicado | Edição manual incorreta | Verificar histórico antes de editar |
| Lote rejeitado por sequencial | Série fora de ordem | Executar Falhas de Sequenciais antes |

## Impacto operacional

Sequenciais incorretos podem causar:
- Rejeição de lotes inteiros pelo órgão autuador
- Risco de prescrição das infrações (prazo de 30 dias)
- Necessidade de reprocessamento manual com prazo reduzido

:::tip
Verifique o relatório de **Falhas de Sequenciais** antes de cada geração de lote para evitar rejeições.
:::
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

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Sequencial duplicado atribuído | Campo "Próximo número" editado manualmente de forma incorreta | Nunca editar manualmente; investigar e corrigir com suporte técnico |
| Série esgotada bloqueando triagem | Número máximo atingido sem nova série criada | Criar nova série com numeração acordada com o órgão autuador |
| Infração sem número sequencial | Série inativa no momento da triagem | Ativar uma série válida antes de retomar a triagem |

## Perguntas frequentes

**O sistema pode atribuir sequenciais duplicados automaticamente?**
Não, se a configuração estiver correta. Sequenciais duplicados ocorrem quando o campo **Próximo número** é editado manualmente de forma incorreta. Nunca edite esse campo sem autorização e sem verificar o histórico.

**O que fazer quando a série de sequenciais se esgota?**
Crie uma nova série com número inicial combinado com o órgão autuador. Comunique formalmente ao órgão antes de iniciar a nova numeração para evitar rejeições.

**Com que frequência devo verificar o saldo da série?**
Mensalmente. Quando o saldo atingir 80% do número máximo, planeje a criação da próxima série com antecedência mínima de 30 dias.

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Infrações — Triagem](../infracoes/triagem)** | O sequencial é atribuído a cada infração durante a triagem; uma série esgotada ou inativa impede a numeração de novas infrações |
| **[Falhas Sequenciais](../relatorios/falhas-sequenciais)** | O relatório de Falhas Sequenciais usa a configuração dos sequenciais para verificar lacunas e duplicidades na numeração |
| **[Exportação de Infrações](../infracoes/exportacao)** | O número sequencial da infração é um campo obrigatório nos layouts de exportação; séries com lacunas podem causar rejeição |
| **[Sequenciais de Lote](./sequenciais-lote-exportacao)** | Os sequenciais de infração e de lote são configurações independentes; ambos precisam estar corretos para a exportação ser válida |
