---
sidebar_position: 1
title: Logs de Acesso
description: Histórico de acessos e auditoria do sistema AxTon
---

# Logs de Acesso

Registra **todas as autenticações** realizadas no sistema, incluindo acessos bem-sucedidos e tentativas falhas. Ferramenta de segurança e auditoria.

## Como acessar

**Menu lateral** → Controle de Acesso → **Logs de Acesso**

## Informações exibidas

| Coluna | Descrição |
|--------|-----------|
| **Usuário** | Quem tentou acessar |
| **Data/Hora** | Momento do acesso |
| **IP** | Endereço de origem |
| **Status** | Sucesso ou Falha |
| **Motivo da falha** | Senha incorreta, usuário inativo, etc. |

## Filtros

| Filtro | Descrição |
|--------|-----------|
| **Período** | Data início e fim |
| **Usuário** | Filtrar por conta |
| **Status** | Sucesso ou Falha |

## Uso na segurança

- Detectar tentativas de acesso não autorizado
- Verificar o que um usuário fez antes de um incidente
- Auditar acessos em horários fora do expediente

:::tip
Filtre por **Status = Falha** e analise os IPs de origem. Múltiplas falhas do mesmo IP podem indicar ataque de força bruta.
:::
- Identificar contas comprometidas
- Verificar horários de acesso suspeitos
- Auditar ações de usuários críticos

:::tip
Revisie os logs de acesso semanalmente. Mais de 5 falhas consecutivas do mesmo IP ou usuário indicam possível ataque.
:::


### Colunas

| Coluna | Descrição |
|--------|-----------|
| Usuário | Login do Usuário |
| **Data/Hora** | Momento do acesso |
| **IP** | Endereço IP de origem |
| **Resultado** | Sucesso ou Falha |
| **Navegador** | Browser utilizado |

### Filtros

- Período
- Usuário específico
- Resultado (Sucesso/Falha)

:::info Segurança
Múltiplas tentativas falhas consecutivas podem indicar tentativa de acesso indevido. Monitore regularmente.
:::

---

## Controle de Acesso

| Funcionalidade | Descrição |
|---|---|
| [**Restrição por IP**](../controle-acesso/acessos-por-ip) | Configurar restrição de acesso por endereço IP |
| [**Permissões Detalhadas**](../controle-acesso/configurar-permissoes) | Configurar permissões granulares por módulo |
