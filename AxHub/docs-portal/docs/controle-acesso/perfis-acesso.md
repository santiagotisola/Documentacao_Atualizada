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

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Usuário não consegue acessar módulo | Perfil sem a permissão necessária | Revisar as permissões do perfil em **Controle de Acesso → Permissões** |
| Perfil não aparece na lista de usuários | Perfil inativo | Ativar o perfil no cadastro de Perfis de Acesso |
| Acesso concedido indevidamente | Perfil com permissões muito amplas | Revisar e restringir as permissões do perfil |

## Perguntas frequentes

**Posso ter um usuário com dois perfis de acesso?**
Não. Cada usuário é vinculado a um único perfil. Crie perfis específicos para combinar as permissões necessárias.

**Como duplicar um perfil existente para criar um similar?**
Não existe função de duplicação nativa. Crie um novo perfil e adicione manualmente as permissões desejadas.

**O que acontece com os usuários quando um perfil é alterado?**
A alteração é imediata. Todos os usuários vinculados ao perfil passam a ter as novas permissões na próxima ação no sistema (sem necessidade de relogin).

## Exemplo prático

**Cenário**: Um órgão de trânsito implantando o AxHub precisa configurar 4 perfis distintos para equipes diferentes: triadores do turno diurno, auditores, gestor de medição e operador de exportação.

| Perfil | Responsável | Permissões críticas |
|--------|------------|----------------------|
| Triador Diurno | Analistas de imagem | Triagem + Dashboard |
| Auditor | Supervisor de qualidade | Auditoria + Infrações Desc. |
| Gestor Medição | Coordenador de contrato | Contrato + Medição + Índices |
| Op. Exportação | Técnico de TI | Lote Exportação |

**Passo a passo**:
1. Acesse **Controle de Acesso → Perfis de Acesso** e clique em **+ Novo**
2. Crie o perfil `Triador Diurno` com descrição `Analista de imagens — triagem de infrações`
3. Clique em **Salvar**
4. Acesse **Controle de Acesso → Permissões** e configure as permissões para este perfil
5. Repita para os outros 3 perfis
6. Ao criar usuários, vincule cada um ao perfil correspondente à sua função

**Resultado**: Cada equipe acessa apenas os módulos necessários. O triador não exporta lotes; o auditor não altera configurações; o gestor não faz triagem. Rastreabilidade garantida por perfil nos Logs de Acesso.
