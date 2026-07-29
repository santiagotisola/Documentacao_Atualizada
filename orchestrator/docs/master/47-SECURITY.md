# 47 — SEGURANÇA
## AXIONIA KNOWLEDGE PLATFORM — Padrões de Segurança

## Autenticação
- JWT obrigatório em todos os endpoints da API
- Rate limiting por IP e por usuário
- Tokens com expiração de 8h (sessão de trabalho)

## Autorização
- RBAC (Role-Based Access Control) por módulo
- Permissões granulares por tipo de conteúdo
- Logs de acesso auditáveis

## Dados Sensíveis
- Credenciais nunca em código — apenas variáveis de ambiente
- Senhas com hash bcrypt
- Conexões DB com TLS
- Dados de clientes isolados por tenant

## Segurança do Knowledge Graph
- Queries Cypher parametrizadas (sem injection)
- Leitura somente para agentes não-escritores
- Escrita apenas via Orchestrator
