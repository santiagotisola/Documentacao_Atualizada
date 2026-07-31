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
Filtre por **Status = Falha** e analise os IPs de origem. Múltiplas falhas do mesmo IP podem indicar ataque de força bruta — bloqueie o IP em Controle de Acesso → Acessos por IP.
:::

## Relacionado

- [Usuários](./usuarios)
- [Perfis de Acesso](./perfis-acesso)
- [Acessos por IP](./acessos-por-ip)

## Fluxo de auditoria de segurança

1. Detectar comportamento suspeito (denúncia, anomalia ou incident)
2. Filtrar logs por **Usuário** ou **IP** no período de interesse
3. Identificar acessos com **Status = Falha** repetidos ou em horários atípicos
4. Verificar ações realizadas pelo usuário (edições, exportações, exclusões)
5. Exportar os logs em Excel para documentar o incidente
6. Tomar ação: bloquear IP, revogar acesso, redefinir senha

## Tabela de referência — alertas de segurança

| Padrão identificado | Risco | Ação recomendada |
|--------------------|:-----:|------------------|
| 5+ falhas consecutivas do mesmo IP | Alto | Bloquear IP em Acessos por IP |
| Login de madrugada não habitual | Médio | Confirmar com o usuário |
| Export em massa de dados | Alto | Verificar autorização |
| Acesso de IP fora da rede corporativa | Médio | Verificar uso de VPN |
| Usuário inativo com acessos recentes | Alto | Revogar acesso imediatamente |

## Segurança

- Revise os logs de acesso **semanalmente** para detectar padrões anormais de autenticação
- Mais de 5 falhas consecutivas do mesmo IP ou usuário podem indicar ataque de força bruta — bloqueie o IP em **Acessos por IP**
- Acessos em horários incomuns (madrugada, fins de semana) devem ser verificados junto ao responsável da conta
- Contas com múltiplas falhas de login devem ser suspensas até confirmação de uso legítimo
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

## Perguntas frequentes

**Por quanto tempo os logs de acesso são retidos?**
Depende da política de retenção configurada no servidor. Exporte mensalmente para armazenamento externo como evidência de conformidade.

**Como detectar tentativa de acesso não autorizado pelos logs?**
Filtre por **Resultado = Falha** e observe múltiplas tentativas do mesmo IP em curto intervalo. Combine com **Acessos por IP** para bloquear o endereço suspeito.

**Logs de acesso mostram o que o usuário fez dentro do sistema?**
Os logs registram autenticações (login/logout). Para rastreabilidade de operações dentro do sistema, consulte os registros de auditoria nos módulos específicos.

---

## Controle de Acesso

| Funcionalidade | Descrição |
|---|---|
| [**Restrição por IP**](../controle-acesso/acessos-por-ip) | Configurar restrição de acesso por endereço IP |
| [**Permissões Detalhadas**](../controle-acesso/configurar-permissoes) | Configurar permissões granulares por módulo |
