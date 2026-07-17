---
sidebar_position: 1
title: Configurações
description: Configurações do sistema AxCross — Sistema, Usuários, Perfis de Acesso, Permissões, Logs de Acesso e Sincronização de Passagens
---

# Configurações

O módulo de **Configurações** centraliza todos os parâmetros operacionais, controle de acesso e sincronização do AxCross. Acesse pelo **menu lateral** clicando em **Configurações**.

![Menu Configurações](<../img/Menu Configurações.png>)

O módulo é organizado em seis seções acessíveis diretamente pela tela principal:

| # | Seção | Descrição |
|---|---|---|
| 1 | [**Sistema**](#sistema) | Parâmetros gerais, limites, alertas MDF-e e integração Neo4j |
| 2 | [**Usuários**](#usuários) | Cadastro e gestão dos usuários do sistema |
| 3 | [**Perfis de Acesso**](#perfis-de-acesso) | Criação e edição de perfis com conjuntos de permissões |
| 4 | [**Permissões**](#permissões) | Controle granular de acesso por funcionalidade |
| 5 | [**Logs de Acesso**](#logs-de-acesso) | Histórico de ações realizadas no sistema por usuário |
| 6 | [**Sincronização de Passagens**](#sincronização-de-passagens) | Reindexação de passagens no Elasticsearch |

:::caution Permissão necessária
Apenas usuários com perfil de **Administrador** têm acesso ao módulo de Configurações.
:::

---

## Sistema

Define os parâmetros operacionais globais do AxCross, organizados em quatro grupos de configuração.

![Configurações do Sistema](<../img/Sistema.png>)

### Configurações do Sistema

| Campo | Descrição |
|---|---|
| **Logo** | Logo do órgão exibida no sistema. Use os botões **Mudar Logo** e **Remover Logo** para atualizar. |
| **Habilitar Relatório de Veículos Monitorados** | Quando ativo, o relatório de veículos monitorados fica disponível no módulo de Relatórios. |
| **Limite de Passagens na Exportação** | Quantidade máxima de registros por exportação de relatório. Se não definido, o padrão é 100 passagens. |

### Salvar Passagem

| Campo | Descrição |
|---|---|
| **Salvar Passagem** | Quando ativo, passagens com duração superior ao limite definido não são consideradas alertas. |
| **Quantidade de horas** | Define o tempo limite (em horas) para uma passagem ser considerada como alerta. |

### Configurações MDF-e

Define o comportamento dos alertas relacionados ao módulo MDF-e (Manifesto Eletrônico de Documentos Fiscais).

| Campo | Descrição |
|---|---|
| **Quantidade de horas (MDF-e)** | Passagens com duração superior ao valor definido não são consideradas alertas no módulo MDF-e. |
| **Habilitar Alertas de Tempo na Mancha** | Quando ativo, monitora veículos em áreas e gera alertas **MANCHA01** quando o tempo de permanência exceder o limite configurado. |
| **Habilitar Detecção de Comboio** | Quando ativo, executa o ciclo de identificação de comboios a cada 6 horas, atualiza o grafo Neo4j e dispara alertas **COMBOIO01** para o Dashboard e o Monitoramento Online. Requer Neo4j configurado. |
| **Habilitar Alertas Recorrentes** | Quando ativo, gera alertas para veículos sem MDF-e detectados em múltiplos radares dentro da janela de tempo configurada. |

:::info Alertas automáticos
Os alertas **MANCHA01** e **COMBOIO01** são gerados automaticamente pelo sistema com base nas configurações acima. Configure os Tipos de Ocorrência correspondentes em **Veículos Monitorados → Tipos de Ocorrências**.
:::

---

## Usuários

Cadastro e gestão dos usuários com acesso ao AxCross. Cada usuário é vinculado a um perfil de acesso que define suas permissões no sistema.

![Usuários](<../img/Usuários.png>)

### Campos

| Campo | Obrigatório | Descrição |
|---|:---:|---|
| **Nome** | Sim | Nome completo do usuário |
| **Login** | Sim | Nome de usuário para autenticação no sistema |
| **E-mail** | Sim | E-mail para recuperação de senha e notificações |
| **Senha** | Sim | Senha de acesso (mínimo 6 caracteres) |
| **Perfil de Acesso** | Sim | Perfil que define as permissões do usuário |
| **Status** | Sim | Ativo ou Inativo |

### Cadastrar novo usuário

![Novo Usuário](<../img/Novo Usuário.png>)

1. Acesse **Configurações → Usuários** no menu lateral
2. Clique em **Novo Usuário**
3. Preencha **Nome**, **Login** e **E-mail**
4. Defina a **Senha** de acesso
5. Selecione o **Perfil de Acesso**
6. Clique em **Salvar**

:::warning Atenção
Ao inativar um usuário, ele perde imediatamente o acesso ao sistema. A operação pode ser revertida reativando o cadastro.
:::

---

## Perfis de Acesso

Cadastro dos perfis que agrupam conjuntos de permissões para atribuição aos usuários. Cada perfil define quais módulos e ações o usuário vinculado poderá acessar.

![Perfis de Acesso](<../img/Perfis de Acesso.png>)

### Campos

| Campo | Obrigatório | Descrição |
|---|:---:|---|
| **Nome do Perfil** | Sim | Nome identificador do perfil (ex.: Operador, Supervisor, Administrador) |
| **Descrição** | Não | Descrição das responsabilidades do perfil |
| **Status** | Sim | Ativo ou Inativo |

### Perfis padrão do sistema

| Perfil | Descrição |
|---|---|
| **Administrador** | Acesso total a todos os módulos e configurações |
| **Operador** | Acesso a monitoramento, operações e relatórios |
| **Consulta** | Acesso somente leitura aos relatórios |

### Criar novo perfil

1. Acesse **Configurações → Perfis de Acesso** no menu lateral
2. Clique em **Novo Perfil**
3. Informe o **Nome do Perfil** e opcionalmente a **Descrição**
4. Clique em **Salvar**
5. Após salvar, configure as **Permissões** do perfil na seção seguinte

:::info Importante
Perfis vinculados a usuários ativos não podem ser excluídos. Inative o perfil para bloquear o acesso de todos os usuários vinculados.
:::

---

## Permissões

Controle granular de acesso por funcionalidade do sistema. As permissões são atribuídas aos **Perfis de Acesso** e definem o que cada perfil pode visualizar, criar, editar ou excluir.

![Permissões](<../img/Permissões.png>)

### Como funciona

Cada funcionalidade do sistema possui permissões individuais que podem ser habilitadas ou desabilitadas por perfil:

| Tipo de Permissão | Descrição |
|---|---|
| **Visualizar** | Permite acessar e consultar a funcionalidade |
| **Criar** | Permite cadastrar novos registros |
| **Editar** | Permite alterar registros existentes |
| **Excluir** | Permite remover registros |

### Atribuir permissões

1. Acesse **Configurações → Permissões** no menu lateral
2. Selecione o **Perfil de Acesso** a configurar
3. Ative ou desative as permissões desejadas por módulo
4. Clique em **Salvar**

---

## Logs de Acesso

Registra todas as ações realizadas pelos usuários no sistema, permitindo auditoria completa de quem fez o quê e quando.

![Logs de Acesso](<../img/Logs de Acesso.png>)

### Informações registradas

| Coluna | Descrição |
|---|---|
| **Usuário** | Nome do usuário que realizou a ação |
| **Data/Hora** | Momento exato do evento |
| **Ação** | Tipo de operação realizada (Login, Criação, Edição, Exclusão) |
| **Módulo** | Área do sistema onde a ação ocorreu |
| **Detalhe** | Descrição complementar da ação realizada |
| **IP** | Endereço IP de onde partiu o acesso |

### Tipos de ação registrados

| Ação | Descrição |
|---|---|
| **Login** | Entrada no sistema |
| **Logout** | Saída do sistema |
| **Criar** | Inclusão de novo registro |
| **Editar** | Alteração de registro existente |
| **Excluir** | Remoção de registro |
| **Exportar** | Geração de relatório ou exportação de dados |
| **Sincronizar** | Execução de sincronização de dados |

### Filtros disponíveis

| Filtro | Descrição |
|---|---|
| **Usuário** | Filtrar por usuário específico |
| **Data Início / Data Fim** | Período de consulta |
| **Ação** | Tipo de operação realizada |
| **Módulo** | Área do sistema |

### Como consultar

1. Acesse **Configurações → Logs de Acesso** no menu lateral
2. Defina o **período** de consulta
3. Opcionalmente, aplique filtros por usuário, ação ou módulo
4. Clique em **Pesquisar**
5. Para exportar, clique em **Excel**

:::tip Segurança
Os logs de acesso não podem ser editados ou excluídos por nenhum usuário, garantindo a integridade da trilha de auditoria.
:::

:::caution Retenção
Verifique a política de retenção de logs configurada em **Configurações → Sistema** para saber o período disponível para consulta.
:::

---

## Sincronização de Passagens

Reindexação dos registros de passagens no mecanismo de busca **Elasticsearch**, garantindo que relatórios e consultas utilizem dados atualizados.

![Sincronização de Passagens](<../img/Sincronização de Passagens.png>)

### Campos

| Campo | Obrigatório | Descrição |
|---|:---:|---|
| **Data de Início** | Sim | Data a partir da qual os dados serão reindexados no Elasticsearch |

### Passo a passo

1. Acesse **Configurações → Sincronização de Passagens** no menu lateral
2. Informe a **Data de Início** da sincronização
3. Clique em **Sincronizar passagens com Elastic Search**
4. Aguarde a conclusão do processo

### Quando utilizar

| Situação | Descrição |
|---|---|
| **Após importação em lote** | Quando registros são importados para o sistema e precisam aparecer nos relatórios |
| **Dados desatualizados nos relatórios** | Quando os relatórios não refletem as passagens mais recentes |
| **Após falha de sincronização** | Para reprocessar dados que não foram indexados corretamente |
| **Manutenção programada** | Como parte de rotinas periódicas de manutenção |

:::warning Impacto no desempenho
A sincronização pode consumir recursos significativos do servidor. Recomenda-se executar em horários de baixo tráfego, preferencialmente fora do horário operacional.
:::