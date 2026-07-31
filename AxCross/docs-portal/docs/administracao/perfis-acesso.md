---
sidebar_position: 3
title: Perfis de Acesso
description: Gestão de perfis de acesso no AxCross — criação, configuração e perfis operacionais recomendados
---

# Perfis de Acesso

Cadastro dos perfis de acesso que agrupam conjuntos de permissões para atribuição a usuários. Um perfil define **exatamente o que cada tipo de usuário pode ver e fazer** dentro do sistema.

## Como acessar

No **menu lateral**, expanda **Configurações** e clique em **Perfis de acesso**.

![Perfis de Acesso](../img/Perfis de Acesso.png)

:::info Permissão necessária
Para **visualizar**: `accessprofile.index`  
Para **criar**: `accessprofile.create`  
Para **editar**: `accessprofile.edit`  
Para **excluir**: `accessprofile.delete`
:::

---

## Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome do Perfil** | Sim | Nome identificador do perfil (ex.: Operador de Turno, Analista) |
| **Descrição** | Não | Descrição das responsabilidades e escopo do perfil |
| **Status** | Sim | Ativo ou Inativo |

---

## Passo a passo — Criar novo perfil

1. Acesse **Configurações → Perfis de acesso** no menu lateral
2. Clique em **Novo Perfil**
3. Informe o **Nome do Perfil** e opcionalmente uma **Descrição**
4. Clique em **Salvar**
5. Acesse **Configurações → Permissões de Acesso** para configurar as permissões do novo perfil

:::tip Ordem recomendada
Sempre crie e configure o perfil **antes** de cadastrar os usuários. Assim, ao criar o usuário já é possível vinculá-lo ao perfil correto. Consulte [Usuários](usuarios.md) e [Permissões de Acesso](permissoes.md).
:::

---

## Perfis operacionais recomendados

Os perfis abaixo são sugeridos com base nas permissões disponíveis no sistema, organizados por função operacional.

---

### 👑 Administrador — Acesso total

Responsável pela gestão completa do sistema, usuários e configurações.

**Permissões exclusivas deste perfil:**

| Módulo | Permissões |
|--------|-----------|
| Configurações do Sistema | `systemsettings.index`, `systemsettings.indexsettings` |
| Permissões de Acesso | `accesspermission.*` (todas) |
| Perfis de Acesso | `accessprofile.*` (todas) |
| Usuários | `user.*` (todas) |
| Log de Acesso | `logaccess.index` |
| Sincronização | `sync.index`, `sync.syncpassagecassandratoelastic` |
| Importar Equipamentos | `equipmentimport.index` |
| Classificações de Veículos | `vehicleclassification.*` (todas) |
| Tipos de Ocorrência | `occurrencetype.*` (todas) |

---

### 🖥️ Operador de Monitoramento — Turno

Responsável pelo acompanhamento em tempo real durante o plantão. Não realiza cadastros nem acessa configurações.

| Módulo | Permissões |
|--------|-----------|
| Monitoramento Online | `monitoring.index`, `monitoring.monitoringonline`, `monitoring.equipmentmap`, `monitoring.monitoringwall`, `monitoring.listlayouts`, `monitoring.getlayout`, `monitoring.markasused`, `monitoring.getlayoutalerts` |
| Painel de Alertas | `alertsummary.index` |
| Mapa de Bolhas | `irregularitybubblemap.index`, `irregularitybubblemap.data` |
| Monitoramento de Grafo | `monitoringgraph.index` |
| Painel Analítico | `vehicleanalytics.index`, `vehicleanalytics.quick`, `vehicleanalytics.summary`, `vehicleanalytics.timeline`, `vehicleanalytics.passages`, `vehicleanalytics.alerts` |
| Rastreamento por Placa | `platetracking.index` |
| Alertas | `alert.index`, `alert.create` |

---

### 🔎 Analista / Investigador

Realiza pesquisas históricas, gera relatórios e analisa deslocamentos de veículos.

| Módulo | Permissões |
|--------|-----------|
| Painel Analítico | todas (`vehicleanalytics.*`) |
| Rastreamento por Placa | `platetracking.index` |
| Relatórios | todas (`reports.*`) |
| Mapa de Bolhas | `irregularitybubblemap.index`, `irregularitybubblemap.data` |
| Monitoramento de Grafo | `monitoringgraph.index` |
| Monitoramento Online | `monitoring.index`, `monitoring.monitoringonline` |
| Veículo Monitorado | `monitoredvehicle.index`, `monitoredvehicle.create`, `monitoredvehicle.edit`, `monitoredvehicle.importvehicles` |
| Alertas | `alert.index`, `alert.create`, `alert.edit` |
| Importação Veículos | `vehiclemonitoredimport.*` (todas) |

---

### 🔧 Técnico de Campo

Realiza cadastros e manutenção de equipamentos. Sem acesso a dados operacionais sensíveis.

| Módulo | Permissões |
|--------|-----------|
| Equipamentos | `equipment.index`, `equipment.create`, `equipment.edit`, `equipment.lane`, `equipment.deletelane` |
| Grupo de Equipamentos | `equipmentgroup.index`, `equipmentgroup.create`, `equipmentgroup.edit` |
| Área | `area.index`, `area.edit`, `area.addequipmentstoareaautomatically`, `area.reordersequence` |
| Importar Equipamentos | `equipmentimport.index` |
| Monitoramento Online | `monitoring.index`, `monitoring.equipmentmap` |

---

### 📖 Consulta — Somente leitura

Usuário com acesso mínimo para visualizar dados sem risco de alterações.

| Módulo | Permissões |
|--------|-----------|
| Relatórios | `reports.passages`, `reports.occurrences`, `reports.reportsgenerated` |
| Monitoramento | `monitoring.index`, `monitoring.monitoringonline` |
| Rastreamento | `platetracking.index` |
| Painel Analítico | `vehicleanalytics.index`, `vehicleanalytics.summary` |

---

:::info Importante
Perfis vinculados a usuários ativos **não podem ser excluídos**. Inative o perfil para bloquear o acesso de todos os usuários vinculados.
:::

:::tip Importar permissões de outro perfil
Use a permissão `accesspermission.importaccesspermissions` para copiar as configurações de permissões de um perfil existente para um novo, agilizando a configuração de perfis similares.
:::

## Erros comuns

| Situação | Causa | Solução |
|----------|-------|----------|
| Perfil não pode ser excluído | Usuários vinculados ao perfil | Inative o perfil em vez de excluir |
| Usuário não vê módulo após vinculação | Permissões do perfil não configuradas | Configure as permissões em **Configurações → Permissões** |
| Perfil ativo não aparece para seleção | Cache do navegador | Recarregue a página (`F5`) |

## Perguntas frequentes

**Como copiar as permissões de um perfil existente para um novo?**
Use a permissão `accesspermission.importaccesspermissions` disponível em **Permissões de Acesso**. Isso copia toda a configuração do perfil origem para o novo perfil, que pode ser ajustado conforme necessidade.

**Com que frequência devo revisar os perfis de acesso?**
Revise sempre que houver troca de colaboradores, mudanças de função ou atualizações do sistema. Perfis obsoletos com permissões excessivas são riscos de segurança.

**Quantos perfis posso criar no sistema?**
Não há limite de perfis. Recomenda-se criar perfis específicos por função operacional em vez de um único perfil genérico para facilitar a rastreabilidade.

## Integração com outros módulos

| Módulo | Como se relaciona com Perfis de Acesso |
|--------|----------------------------------------|
| **Configurações → Usuários** | Cada usuário deve ter um perfil vinculado — sem perfil, as permissões ficam indefinidas |
| **Configurações → Permissões** | As permissões granulares são configuradas por perfil nesta tela |
| **Logs de Acesso** | Acessos e ações dos usuários são registrados com o perfil correspondente |
| **Login** | O menu exibido após autenticar é gerado conforme as permissões do perfil do usuário |
