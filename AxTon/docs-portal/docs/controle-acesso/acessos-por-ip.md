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

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Usuário bloqueado | IP dinâmico mudou | Desativar restrição, atualizar IP |
| Acesso negado para todos | Nenhum IP cadastrado ao ativar | Desativar, cadastrar IPs, reativar |
| IP externo bloqueado | Configurado corretamente | Verificar se o bloqueio é intencional |

## Relacionado

- [Usuários](../administracao/usuarios)
- [Perfis de Acesso](../administracao/perfis-acesso)
- [Logs de Acesso](./logs-acesso)

## Segurança

- Sempre adicione o IP da sua rede **antes** de ativar a restrição para evitar bloqueio acidental do administrador
- Utilize faixas CIDR (`192.168.1.0/24`) para redes corporativas em vez de cadastrar IPs individuais de cada estação
- Revise a lista de IPs periodicamente e remova entradas obsoletas (equipamentos descontinuados, VPNs antigas)
- Combine a restrição por IP com **Perfis de Acesso** bem configurados para uma defesa em camadas

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

## Perguntas frequentes

**Como desbloqueio um usuário que foi bloqueado por IP?**
Um administrador com acesso direto ao servidor ou via IP autorizado deve adicionar o novo IP à lista ou desativar temporariamente a restrição para reconfigurar.

**Posso usar faixas CIDR para autorizar uma rede inteira?**
Sim. Use o formato CIDR como `192.168.1.0/24` para autorizar todos os IPs de uma sub-rede corporativa sem cadastrar cada endereço individualmente.

**A restrição por IP funciona junto com autenticacao por senha?**
Sim. A restrição por IP é uma camada adicional: o usuário precisa estar no IP autorizado E ter credenciais válidas para acessar o sistema.

## Integração com outros módulos

| Módulo | Como se relaciona com Acessos por IP |
|--------|--------------------------------------|
| **Usuários** | A restrição por IP complementa as credenciais dos usuários — o login só funciona se o IP também estiver autorizado |
| **Login** | O sistema valida o IP do dispositivo antes de permitir a autenticação |
| **Logs de Acesso** | Tentativas bloqueadas por IP são registradas como falhas de acesso para auditoria |
| **Perfis de Acesso** | Combine restrição por IP com perfis bem configurados para segurança em camadas |

## Exemplo prático

**Cenário**: A empresa contratante exige que o AxTon seja acessado apenas a partir da rede local do posto de pesagem e do escritório central, impedindo logins remotos não autorizados.

| Configuração | Valor |
|-------------|-------|
| IP do posto BR-050 (Uberlândia) | `192.168.10.0/24` |
| IP do escritório central (Belo Horizonte) | `200.201.50.15` |
| IP da VPN corporativa | `10.0.0.0/8` |
| Status da restrição | Ativo |

**Passo a passo**:
1. Cadastre o IP da rede do posto usando CIDR: `192.168.10.0/24`
2. Cadastre o IP fixo do escritório: `200.201.50.15`
3. Se houver VPN, cadastre a faixa VPN: `10.0.0.0/8`
4. Confirme que o IP atual do administrador está na lista
5. Ative a restrição

**Resultado**: Somente dispositivos nos IPs autorizados conseguem realizar login. Tentativas de acesso de redes externas são bloqueadas e registradas nos Logs de Acesso para auditoria.
