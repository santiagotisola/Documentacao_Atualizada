---
sidebar_position: 2
title: Perfis de Acesso
description: Gestão de perfis de acesso ao AxHub — criação e perfis operacionais recomendados
---

# Perfis de Acesso

Agrupa conjuntos de permissões para atribuição a usuários. Um perfil define **o que cada tipo de colaborador pode ver e fazer** no AxHub.

![Lista de Perfis](../img/Controle%20de%20acessos%20-%20Perfil%20de%20acesso.png)

## Como acessar

**Menu lateral** → Controle de Acesso → **Perfis de Acesso**

## Cadastro de perfil

![Cadastro de Perfil](../img/Controle%20de%20acessos%20-%20Perfil%20de%20acesso.-%20cadastro.png)

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Nome do Perfil** | Sim | Identificação do perfil (ex.: Triador, Auditor, Gestor) |
| **Descrição** | Não | Responsabilidades e escopo do perfil |

## Passo a passo — Criar novo perfil

1. Acesse **Controle de Acesso → Perfis de Acesso**
2. Clique em **+ Novo**
3. Preencha **Nome** e **Descrição**
4. Clique em **Salvar**
5. Acesse [Permissões de Acesso](./permissoes) para configurar o que este perfil pode fazer

:::tip Ordem correta
Crie e configure o perfil **antes** de criar os usuários. Assim, ao criar o usuário já é possível vinculá-lo ao perfil correto.
:::

---

## Perfis operacionais recomendados

### 👑 Administrador — Acesso total

Responsável pela implantação, configuração e gestão completa do sistema.

**Permissões exclusivas:**
- `configuracao.index` — Configurações do sistema
- `acessoporip.*`, `horarioacesso.*` — Segurança de acesso por IP e horário
- `logacesso.index` — Auditoria de acessos
- `fabricante.generatetoken` — Geração de tokens de integração
- `layoutarquivo.*` — Formatos de arquivo de exportação
- `loteexportacao.forcarencerrarlote` — Encerramento forçado de lote
- Todos os cadastros base (equipamento, arco, faixa, modelo, fabricante)

---

### 🖥️ Operador de Monitoramento — Turno

Acompanha passagens em tempo real durante o plantão.

| Módulo | Permissões |
|--------|-----------|
| Dashboard | Status equipamentos, últimos eventos, imagens capturadas |
| Monitoramento | `monitoramento.index`, `monitoramento.atualizaplaca` |
| Infrações | `consultainfracao.index`, `.datahandlerdetail`, `.obterimagensinfracaoo` |
| Aferição | `afericao.alertasvencimento` |

---

### 📝 Agente de Triagem

Primeira linha de revisão das infrações capturadas.

| Módulo | Permissões |
|--------|-----------|
| Dashboard | Todos os widgets |
| Monitoramento | `monitoramento.index`, `monitoramento.atualizaplaca` |
| Infrações | `consultainfracao.index`, `.datahandlerdetail`, `.obterimagensinfracaoo`, `.descartarinfracao` |
| Infrações Descartadas | `consultainfracoesdescartadas.index`, `.datahandlerdiscarded` |
| Enquadramento | `enquadramento.index` |

---

### 🔍 Auditor

Revisa e aprova infrações triadas antes da exportação.

| Módulo | Permissões |
|--------|-----------|
| Dashboard | Todos os widgets |
| Infrações | `consultainfracao.index`, `.detalhamentoinfracao`, `.obterimagensinfracaoo` |
| Auditoria | `auditoria.index`, `auditoria.auditar`, `auditoria.processarlote` |
| Infrações Descartadas | Todas |
| Lote Exportação | `loteexportacao.index`, `.datahandlerdetail`, `.detalhamentoexportacao` |

---

### 📤 Operador de Exportação

Gerencia o envio das infrações para órgãos externos.

| Módulo | Permissões |
|--------|-----------|
| Lote Exportação | Todas exceto `loteexportacao.forcarencerrarlote` |
| Infrações | `consultainfracao.index`, `.detalhamentoinfracao` |
| Dashboard | `dashboard.obterultimoseventos` |

---

### 📏 Gestor de Medição

Gerencia contratos, medições e indicadores de desempenho operacional.

| Módulo | Permissões |
|--------|-----------|
| Contrato | Todas (`contrato.*`) |
| Índice de Performance | Todas (`indiceperformance.*`) |
| Interrupções | Todas (`operacaointerrupcao.*`) |
| Medição | Todas (`medicao.*`) |
| Eventos Equipamento | `eventoequipamento.index` |
| Dashboard | Todos os widgets |

---

### 👁️ Consulta — Somente leitura

Acesso mínimo para visualização sem risco de alterações.

| Módulo | Permissões |
|--------|-----------|
| Infrações | `consultainfracao.index`, `.datahandlerdetail` |
| Dashboard | `dashboard.obterstatusequipamentos`, `dashboard.obterultimoseventos` |
| Monitoramento | `monitoramento.index` |

---

:::info Perfis vinculados a usuários ativos não podem ser excluídos.
Inative o perfil para bloquear o acesso de todos os usuários vinculados sem perder o histórico.
:::

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Usuários](./usuarios) | Usuários com este perfil |
| Relacionado | [Permissões de Acesso](./permissoes) | Configuração detalhada das permissões |
| Relacionado | [Logs de Acesso](./logs-acesso) | Auditoria de ações dos usuários |

## Integração com outros módulos

| Módulo | Como se relaciona |
|--------|------------------|
| **[Usuários](./usuarios)** | Cada usuário é vinculado a um perfil de acesso; o perfil determina o nível de acesso ao sistema |
| **[Permissões](./permissoes)** | O perfil agrupa permissões; a configuração granular de cada permissão é gerenciada no módulo de Permissões |
| **[Logs de Acesso](./logs-acesso)** | Os logs registram as ações de todos os usuários de cada perfil, permitindo auditoria por grupo |
| **[Acessos por IP](./acessos-por-ip)** | Restrições de IP podem ser combinadas com perfis específicos para aumentar a segurança de acessos sensíveis |
