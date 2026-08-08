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

- [Usuários](../administracao/usuarios)
- [Perfis de Acesso](../administracao/perfis-acesso)
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

## Exemplo prático

**Cenário:** Suspeita de acesso indevido após desligamento de funcionário.

1. Acesse **Controle de Acesso → Logs de Acesso**
2. Filtre por **Usuário** (login do ex-funcionário) com período iniciando na data do desligamento
3. Se houver registros com **Status = Sucesso**, o usuário ainda tinha acesso ativo
4. Inative imediatamente o usuário em **Usuários** e redefina senhas compartilhadas
5. Exporte o log filtrado em Excel para documentar o incidente e encaminhe ao gestor responsável

:::warning Ação imediata
Ao desligar um colaborador, inative o usuário no mesmo dia. Acesso após o desligamento configura violação de segurança e pode gerar responsabilidade jurídica.
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

## Erros comuns

| Situação | Causa | Solução |
|----------|-------|----------|
| Logs não aparecem no período esperado | Filtro de data incorreto | Verifique as datas de início e fim no filtro |
| Acessos de usuário não aparecem | Usuário nunca acessou no período | Amplie o período de busca ou verifique o login correto |
| Não consigo exportar os logs | Sem permissão de exportação | Solicite ao administrador a permissão `export.pdf` no perfil |
| Log mostra muitas falhas seguidas | Possível ataque de força bruta | Bloqueie o IP em **Controle de Acesso → Acessos por IP** |

## Integração com outros módulos

| Módulo | Como se relaciona com Logs de Acesso |
|--------|--------------------------------------|
| **Usuários** | Cada log registra o usuário que tentou acessar, facilitando a rastreabilidade de incidentes |
| **Acessos por IP** | IPs bloqueados geram entradas no log como falhas de acesso |
| **Perfis de Acesso** | Logs com muitas falhas podem indicar perfil sem permissão adequada ou credenciais indevidas |
| **Dashboard** | Anomalias nos logs (muitas falhas) devem ser monitoradas periodicamente pela administração |
