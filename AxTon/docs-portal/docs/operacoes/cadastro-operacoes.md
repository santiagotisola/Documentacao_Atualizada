---
sidebar_position: 1
title: Cadastro de Operações
description: Cadastrar e gerenciar operações de pesagem veicular no AxTon
---

# Cadastro de Operações

![Tela de Operações](../img/axton-operacoes.png)

Operações representam as atividades de fiscalização de pesagem veicular realizadas em campo. Cada operação é vinculada a um **local de pesagem**, possui período de vigência e um Usuário responsável**.

## Como acessar

**Menu lateral** → **Operações**

## Listagem

### Colunas

| Coluna | Descrição |
|--------|-----------|
| **Início** | Data e hora de abertura da operação |
| **Fim** | Data e hora de encerramento |
| **Local** | Código e descrição do local de pesagem |
| Usuário | Usuário que criou/gerencia a operação |
| **Status** | Em Andamento ou Concluído |
| **Ações** | Editar e Excluir |

### Exemplos de operações reais

| Início | Fim | Local | Usuário | Status |
|--------|-----|-------|---------|--------|
| 06/03/2026 10:07 | *em andamento* | 1 | Operador | **Em Andamento** |
| 27/02/2026 13:01 | 02/03/2026 12:35 | PI504B — PI 247 Divisa PI/MA | Operador | Concluído |
| 27/02/2026 06:03 | 27/02/2026 12:00 | PI503B — PI 247 KM 115 | LABORUMO06 | Concluído |
| 26/02/2026 06:00 | 26/02/2026 12:00 | PI504B | LABORUMO05 | Concluído |

### Status das Operações

| Status | Descrição |
|--------|-----------|
| **Em Andamento** | Operação ativa — pesagens podem ser registradas |
| **Concluído** | Operação encerrada — apenas consulta |

## Cadastro de Nova Operação

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Local** | Sim | Local de pesagem (ex: PI503B, PI504B) |
| **Data Início** | Sim | Abertura da operação |
| **Data Fim** | Não | Encerramento (vazio = operação aberta) |
| Usuário | Sim | Responsável pela operação |

### Passo a passo

1. No menu lateral, clique em **Operações**
2. Clique em **+ Novo**
3. Selecione o **Local** de pesagem
4. Defina a **Data de Início**
5. Selecione o Usuário responsável
6. Clique em **Salvar**

:::tip Encerrar uma operação
Para encerrar uma operação em andamento, clique em **Editar** e preencha a **Data de Fim**. O status será alterado automaticamente para **Concluído**.
:::

:::warning Atenção
Somente operações com status **Em Andamento** permitem registrar novas pesagens. Verifique sempre se há uma operação ativa antes de iniciar uma pesagem.
:::

## Relacionado

- [Iniciar Pesagem](../pesagem/ticket-aberto)
- [Locais](../cadastros/locais)
- [Monitoramento Online](../operacoes/monitoramento-online)
- [Alertas](../operacoes/alertas)

## Boas práticas

- Verifique se há uma operação **Em Andamento** antes de iniciar qualquer pesagem — pesagens sem operação ativa não são vinculadas a um contexto fiscalário correto
- Encerre a operação ao final do turno ou da atividade para não misturar dados de períodos diferentes
- Registre o Usuário responsável corretamente para rastreabilidade das pesagens realizadas
- Para operações de longo prazo, monitore o status em **Monitoramento Online** para identificar equipamentos com problema

## Veja também

| Funcionalidade | Descrição |
|---|---|
| [**Iniciar Pesagem**](../pesagem/ticket-aberto) | Registrar uma nova pesagem na operação |
| [**Locais**](../cadastros/locais) | Gerenciar os locais de pesagem |
| [**Usuários**](../administracao/usuarios) | Gerenciar Usuários do sistema |

---

## Funcionalidades de Operações

| Funcionalidade | Descrição |
|---|---|
| [**Monitoramento Online**](../operacoes/monitoramento-online) | Acompanhamento em tempo real dos Equipamentos e operações |
| [**Eventos de Equipamentos**](./eventos-equipamentos) | Registro de eventos operacionais dos Equipamentos |
| [**Consulta de Placas**](../operacoes/consulta-placas) | Pesquisar passagens de Veículos por placa |
| [**Alertas**](../operacoes/alertas) | Gestão de alertas operacionais e notificações |

## Perguntas frequentes

**O que acontece se uma pesagem for registrada sem uma operação ativa no posto?**
O sistema exige uma operação ativa para registrar pesagens. Sem operação em andamento, o ticket não será vinculado a nenhum contexto fiscalizário, o que compromete relatórios e medições contratuais. Sempre verifique se há operação **Em Andamento** antes de iniciar qualquer pesagem.

**Como encerrar uma operação que foi deixada em andamento por engano após o turno?**
Acesse **Operações**, localize a operação aberta, clique em **Editar** e preencha a **Data de Fim** com o horário correto de encerramento. O status será atualizado automaticamente para **Concluldido**.

**Posso ter múltiplas operações em andamento simultaneamente para o mesmo posto?**
O sistema permite abertura de múltiplas operações, mas é uma prática que deve ser evitada. Operações sobrepostas dificultam a rastreabilidade das pesagens e podem distorcer os índices de medição contratual. Encerre sempre a operação anterior antes de abrir uma nova.

## Erros comuns

| Situação | Causa | Solução |
|----------|-------|----------|
| Pesagem não vinculada à operação | Operação não estava **Em Andamento** | Verifique o status e reinicie a operação antes de registrar pesagens |
| Operação não pode ser encerrada | Há tickets em aberto vinculados | Feche ou descarte os tickets em aberto antes de encerrar |
| Local não aparece na listagem | Local inativo ou não cadastrado | Verifique em **Cadastros → Locais** se o local está ativo |
| Data de fim anterior à de início | Erro de preenchimento | Corrija as datas — o sistema não aceita períodos inválidos |

## Integração com outros módulos

| Módulo | Como se relaciona com Operações |
|--------|----------------------------------|
| **Pesagem → Iniciar Pesagem** | Exige operação **Em Andamento** para vincular tickets de pesagem ao contexto fiscalizatório correto |
| **Medições** | Operações são a base dos contratos de medição — período e local definem o escopo do boletim |
| **Monitoramento Online** | Exibe o status em tempo real das operações e equipamentos ativos |
| **Relatório de Passagens** | Pesagens registradas na operação aparecem nos relatórios filtrados por local e período |

## Exemplo prático

**Cenário**: Uma equipe de fiscalização inicia um turno de 6h no Posto PI503B (BR-316/PI, km 115). O supervisor precisa abrir uma operação para que as pesagens do turno sejam corretamente vinculadas ao contexto contratual.

| Configuração | Valor |
|-------------|-------|
| Local | PI503B — BR-316 KM 115 |
| Data Início | 27/06/2026 06:00 |
| Data Fim | 27/06/2026 12:00 |
| Usuário responsável | Operador Fiscal |

**Passo a passo**:
1. Acesse **Operações** e clique em **+ Novo**
2. Selecione o local **PI503B** na lista
3. Preencha **Data Início**: `27/06/2026 06:00`
4. Deixe **Data Fim** em branco (encerramento ao final do turno)
5. Selecione o usuário responsável e clique em **Salvar**
6. Acesse **Iniciar Pesagem** — o posto PI503B agora está habilitado para registro
7. Ao encerrar o turno: editar a operação e preencher **Data Fim**: `27/06/2026 12:00`

**Resultado**: Todas as pesagens do turno ficam vinculadas à operação PI503B do dia 27/06. O boletim de medição deste período reflete corretamente as 6 horas de operação e o volume de veículos pesados no posto.
