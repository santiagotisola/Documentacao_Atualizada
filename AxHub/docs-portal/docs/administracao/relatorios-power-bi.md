---
sidebar_position: 5
title: Relatórios Power BI
description: Configuração de Relatórios Power BI integrados
---

# Relatórios Power BI

Permite configurar e acessar Relatórios do Power BI integrados ao AxHub.

![Menu Power BI](../img/Relatórios%20BI%20-.menu.png)

## Como acessar

**Menu lateral** → Configurações → Relatórios Power BI**

## Relatórios disponíveis

| Relatório | Descrição |
|-----------|-----------|
| **Comparativo de Placas** | Placas corrigidas e validadas no processamento |
| **Dados Descartes** | Análise de descartes de radares CEV |
| **Boletim de Medição** | Resumo de medição contratual |
| **Disponibilidade** | Índice de disponibilidade dos Equipamentos |
| **Infração - Dia x Hora** | Distribuição de Infrações por dia e hora |
| **Mapa de Calor** | Concentração geográfica de Infrações |

## Como acessar um relatório

1. Acesse **Configurações → Relatórios Power BI**
2. Selecione o relatório desejado na lista
3. O painel é exibido incorporado na tela
4. Utilize os filtros nativos do Power BI (slicers) para ajustar a visualização

## Adicionar novo relatório

1. Clique em **+ Novo**
2. Informe o **Nome** e a **URL de incorporação** do Power BI
3. Selecione os **Grupos de Acesso** que poderão visualizar
4. Clique em **Salvar**

:::info
A URL de incorporação deve ser gerada no portal Power BI com modo de acesso público ou com token de serviço configurado.
:::

## Casos de uso

- **Apresentação gerencial** — exiba KPIs consolidados ao contratante em reuniões de prestação de contas
- **Monitoramento de tendências** — acompanhe a evolução mensal de OCR e disponibilidade para antecipar problemas
- **Gestão de equipe** — analise a produtividade por usuário de triagem para embasar feedbacks e capacitações
- **Planejamento de manutenção** — use a série histórica do OCR para programar intervenções antes do vencimento do contrato

## Relacionado

- [Relatórios Power BI (AxHub)](./relatorios-power-bi)
- [Fluxo Diário de Veículos](../relatorios/fluxo-diario-veiculos)
- [Processamento por Usuário](../relatorios/processamento-por-usuario)

| **Processamento** | Análise do processamento de imagens |
| **Índice do OCR** | Performance do reconhecimento de placas |
| **Fluxo por Porte** | Médio diário de fluxo por porte de Veículo |
| **Triagem por Usuário | Produtividade na triagem por analista |

## Termos Tecnicos

| Termo | Definicao |
|-------|-----------|
| [Triagem](../glossario/triagem) | Ver definicao no glossario |

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Power BI (Relatorios)](../Relatórios/power-bi) | Visualizar Relatórios |
| Relacionado | [Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Use 'Configuração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uração'uracoes do Sistema](./configuracoes-sistema) | Config geral |

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Relatório Power BI em branco | Usuário sem permissão no grupo de acesso | Verificar e adicionar o perfil do usuário ao grupo de acesso do relatório |
| Credenciais inválidas no Power BI | Application Id, Secret ou Scope incorretos | Revisar as credenciais na aba **Integrações** das Configurações do Sistema |
| Relatório não aparece no menu | Relatório não cadastrado ou sem grupo de acesso | Cadastrar o relatório e vincular ao grupo de acesso correto |

## Perguntas frequentes

**Como adicionar um novo relatório Power BI ao menu do sistema?**
Acesse **Configurações → Relatórios Power BI**, clique em **+ Novo**, informe o **Nome** e a **URL de incorporação** gerada no portal Power BI, selecione os grupos de acesso e clique em **Salvar**. O relatório aparecerá automaticamente na lista.

**Os relatórios Power BI mostram dados em tempo real ou são atualizados periodicamente?**
Os dados são atualizados conforme o agendamento configurado no Power BI Service — por padrão, pode ser diário ou sob demanda. Para ajustar a frequência de atualização, entre em contato com o suporte técnico Axion.

**Por que um relatório Power BI aparece em branco para alguns usuários?**
Verifique se o usuário está vinculado ao grupo de acesso correto no cadastro do relatório. Sem permissão, o painel é exibido em branco ou com mensagem de acesso negado. Adicione o perfil do usuário ao grupo de acesso correspondente.

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Configurações do Sistema** | As credenciais de autenticação Power BI (Application Id, Secret, Scope) são configuradas na aba **Integrações** das Configurações do Sistema |
| **Controle de Acesso — Perfis** | O acesso a cada relatório Power BI é controlado por grupo de acesso, alinhado aos perfis do sistema |
| **Medições** | O Boletim de Medição e os índices de disponibilidade estão disponíveis como painéis Power BI para prestação de contas |
| **Relatórios Operacionais** | Complementa os relatórios nativos com análises históricas e visuais avançados (mapa de calor, tendências mensais) |
