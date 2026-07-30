---
sidebar_position: 2
title: Restrição por IP
description: Configurar restrição de acesso por endereço IP
---

# Restrição por IP

![Configurar Usuário Acesso](../img/configurar-usuario-acesso.png)

Permite configurar quais endereços IP podem acessar o sistema, adicionando uma camada extra de segurança.

## Como acessar

**Menu lateral** → Controle de Acesso → **Acessos por IP**

## Configuração

### Campos

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| **Endereço IP** | Sim | IPv4 ou IPv6 liberado |
| **Descrição** | Não | Local ou propósito |
| **Status** | Sim | Ativo ou Inativo |

## Passo a passo

1. Acesse **Controle de Acesso → Acessos por IP**
2. Clique em **+ Novo**
3. Informe o **Endereço IP** e opcionalmente uma **Descrição**
4. Clique em **Salvar**

## Formatos aceitos

| Formato | Exemplo |
|---------|----------|
| IP fixo | `192.168.1.100` |
| Faixa CIDR | `192.168.1.0/24` |
| IPv6 | `2001:db8::1` |

:::warning
Quando a restrição está ativada, **somente os IPs cadastrados** conseguem acessar. Inclua o IP da sua rede antes de ativar para evitar bloqueio acidental.
:::

## Relacionado

- [Usuários](./usuarios)
- [Perfis de Acesso](./perfis-acesso)
- [Logs de Acesso](./logs-acesso)


:::warning
Quando a restrição por IP está ativada, **somente os IPs cadastrados** conseguem acessar. Inclua o IP da sua rede antes de ativar para evitar bloqueio acidental.
:::

:::warning Restrição ativa
Quando a restrição por IP está ativada, **somente os IPs cadastrados** conseguem acessar o sistema. Certifique-se de incluir o IP da sua rede antes de ativar.
:::
Quando a restrição por IP está ativada, **somente os IPs cadastrados** conseguem acessar o sistema. Certifique-se de incluir o IP da sua rede antes de ativar.
:::| **Endereço IP** | Sim | IP autorizado (ex: 192.168.1.100) |
| **Descrição** | Não | Identificação do local/rede |
| **Ativo** | Sim | Status da restrição |

### Passo a passo

1. Acesse **Controle de Acesso** → **Acessos por IP**
2. Clique em **+ Novo**
3. Informe o Endereço IP
4. Adicione uma Descrição (ex: "Escritório Central")
5. Marque como Ativo
6. Clique em **Salvar**

:::warning Atenção
Se ativar a restrição por IP com uma lista vazia, ninguém conseguirá acessar o sistema. Sempre adicione pelo menos um IP antes de ativar.
:::
