# 30 — DATABASE ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Análise de Banco de Dados

## Missão: Mapear. NUNCA alterar.

## Detecta

Schemas · Tabelas · Views · Procedures · Functions ·
Triggers · Relacionamentos (FK) · Índices ·
Foreign Keys · Primary Keys · Histórico de alterações

## Bancos Suportados

SQL Server · PostgreSQL · Oracle · MongoDB · MySQL

## Saída

Para cada tabela:
```json
{
  "schema": "string",
  "tabela": "string",
  "descricao": "string",
  "colunas": [{ "nome": "string", "tipo": "string", "pk": false, "fk": null, "nullable": true }],
  "relacionamentos": [{ "tabela_destino": "string", "tipo": "1:1 | 1:N | N:N" }],
  "indices": ["array"],
  "procedures": ["array"]
}
```
