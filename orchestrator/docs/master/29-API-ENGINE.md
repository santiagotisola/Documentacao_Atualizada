# 29 — API ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Análise de APIs

## Detecta

Swagger · OpenAPI · REST · GraphQL · WebSocket ·
Endpoints · Controllers · DTOs · Responses ·
HTTP Status · Segurança/Auth · Rate Limit · Documentação

## Saída

Para cada endpoint:
```json
{
  "metodo": "GET | POST | PUT | DELETE | PATCH",
  "rota": "/api/endpoint",
  "descricao": "string",
  "parametros": [{ "nome": "string", "tipo": "string", "obrigatorio": true }],
  "dto_entrada": {},
  "dto_saida": {},
  "status_codes": [200, 400, 401, 500],
  "autenticacao": "JWT | API-Key | None",
  "rate_limit": "string | null"
}
```
