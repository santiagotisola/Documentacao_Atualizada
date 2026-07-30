---
sidebar_position: 4
title: Acessos por IP
description: Restrição de acesso por endereço IP no AxHub
---

# Acessos por IP

:::caution Recurso não disponível na versão padrão
Esta funcionalidade **não está disponível** na versão atual do AxHub. Se sua instalação requer controle de acesso por IP, entre em contato com a **Axion Tecnologia**.
:::

## Descrição

O recurso de **Acessos por IP** permite restringir o acesso ao sistema apenas a determinados endereços de rede, aumentando a segurança em ambientes corporativos.

## Funcionalidades planejadas

| Funcionalidade | Descrição |
|----------------|-----------|
| **Lista branca (whitelist)** | IPs/faixas autorizadas |
| **Bloqueio por IP** | Bloquear IPs específicos |
| **Log de tentativas** | Registro de acessos bloqueados |
| **Alertas** | Notificação de tentativas de acesso não autorizado |

## Alternativa atual

Para controle de acesso, utilize:
1. **Perfis de Acesso** — configuração granular de permissões
2. **Firewall de rede** — restrição no nível da infraestrutura

:::info
A restrição por IP é uma camada adicional de segurança. Recomendada para ambientes corporativos com IP fixo. Não utilize se os usuários acessam com IPs dinâmicos.
:::

## Segurança

- Use listas de IPs fixos corporativos — nunca adicione IPs dinâmicos de redes residenciais ou móveis na whitelist
- Revise periodicamente os IPs autorizados e remova entradas obsoletas de colaboradores desligados
- Combine a restrição por IP com **perfis de acesso** restritivos para dupla camada de proteção

## Quando ativar

- Ambiente corporativo com IP fixo definido
- Operação em rede fechada (intranet)
- Após detectar tentativas de acesso externo suspeitas

## Relacionado

- [Usuários](./usuarios)
- [Perfis de Acesso](./perfis-acesso)
- [Logs de Acesso](./logs-acesso)

- Monitore os **Logs de Acesso** para detectar tentativas de acesso bloqueadas e investigue IPs desconhecidos

## Relacionado

- [Usuários](./usuarios)
- [Perfis de Acesso](./perfis-acesso)
- [Logs de Acesso](./logs-acesso)


## Como acessar

**Menu lateral** → Controle de Acesso → **Acessos por IP**

*(Disponível apenas em instalações com este módulo habilitado)*

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Usuarios](./Usuários) | Gerenciamento de Usuários do sistema |
| Relacionado | [Logs de Acesso](./logs-acesso) | Verificar registros de acesso |
| Relacionado | [Perfis de Acesso](./perfis-acesso) | Controle de permissoes por perfil |
