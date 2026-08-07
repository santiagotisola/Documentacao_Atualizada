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

- Use listas de IPs fixos corporativos — nunca adicione IPs dinâmicos de redes residenciais
- Revise os IPs autorizados ao desligar colaboradores
- Combine a restrição por IP com perfis de acesso restritivos para dupla camada

## Fluxo de configuração

1. Levantar todos os IPs fixos dos usuários
2. Cadastrar cada IP em **Controle de Acesso → Acessos por IP**
3. Ativar a restrição
4. Testar acesso de cada IP
5. Monitorar Logs de Acesso

## Erros comuns

| Erro | Causa | Solução |
|------|-------|----------|
| Usuário bloqueado | IP dinâmico mudou | Desativar, atualizar IP, reativar |
| Acesso negado para todos | Nenhum IP ao ativar | Desativar, cadastrar IPs, reativar |

## Relacionado

- [Usuários](./usuarios)
- [Logs de Acesso](./logs-acesso)

- Ambiente corporativo com IP fixo definido
- Operação em rede fechada (intranet)
- Após detectar tentativas de acesso externo suspeitas

## Fluxo de configuração

1. Levantar todos os IPs fixos dos usuários autorizados
2. Cadastrar cada IP em **Controle de Acesso → Acessos por IP**
3. Ativar a restrição
4. Testar acesso a partir de cada IP cadastrado
5. Verificar Logs de Acesso para confirmar funcionamento

:::warning
Se ativar a restrição sem cadastrar seu próprio IP, você será bloqueado imediatamente.
:::
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

## Perguntas frequentes

**O que acontece se eu ativar a restrição sem cadastrar meu próprio IP?**
Você será bloqueado imediatamente. Antes de ativar a restrição, certifique-se de que seu IP fixo está na lista de IPs autorizados.

**Usuários com IP dinâmico podem usar este recurso?**
Não é recomendado. IPs dinâmicos mudam a cada conexão e causariam bloqueios frequentes. Use restrição por IP apenas em ambientes corporativos com IPs fixos.

**Como desbloquear um usuário que foi bloqueado por IP?**
Um administrador com acesso direto ao servidor ou via IP autorizado deve remover o IP bloqueado da lista ou desativar temporariamente a restrição para reconfiguração.

## Integração com outros módulos

| Módulo | Como usa este cadastro/relatório |
|--------|----------------------------------|
| **Usuários** | As restrições de IP são aplicadas por usuário — cada conta pode ter um conjunto de IPs autorizados |
| **Perfis de Acesso** | Complementa a segurança por perfil: o acesso por IP é uma segunda camada de controle além das permissões funcionais |
| **Logs de Acesso** | Tentativas de acesso bloqueadas por IP são registradas nos logs, permitindo identificar ataques externos |
| **Configurações do Sistema** | A ativação do módulo de Acessos por IP é controlada nas Configurações globais do AxHub |

## Perfis recomendados

| Perfil | Recomendado para IP fixo? | Justificativa |
|--------|:------------------------:|---------------|
| **Administrador** | Sim | Alto privilégio exige acesso controlado |
| **Auditor externo** | Sim | Acesso temporário de IP corporativo definido |
| **Operador de campo** | Não | Pode usar redes móveis com IP dinâmico |
| **Triador** | Opcional | Se acessar sempre da mesma estação de trabalho |

:::caution
Não ative restrição por IP para usuários que acessam de redes residenciais ou móveis — causará bloqueios recorrentes.
:::
