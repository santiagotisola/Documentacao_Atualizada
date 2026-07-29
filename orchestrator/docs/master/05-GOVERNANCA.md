# 05 — GOVERNANÇA
## AXIONIA KNOWLEDGE PLATFORM — Ciclo de Vida e Controle

## Status dos Objetos de Conhecimento

```
rascunho → em_revisao → publicado → arquivado → obsoleto
```

| Status | Descrição | Quem pode mudar |
|--------|-----------|----------------|
| **rascunho** | Gerado, aguardando revisão | Validator Agent |
| **em_revisao** | Em processo de aprovação | Revisor humano |
| **publicado** | Aprovado e disponível | Publisher Agent |
| **arquivado** | Substituído por versão mais nova | Project Manager |
| **obsoleto** | Não deve mais ser usado | Validator Agent |

## Versionamento

Todos os objetos seguem **Semantic Versioning**:
- **MAJOR** (1.0.0 → 2.0.0): Mudança estrutural no conteúdo
- **MINOR** (1.0.0 → 1.1.0): Adição de seções ou relacionamentos
- **PATCH** (1.0.0 → 1.0.1): Correção de erros ou atualização menor

## Rastreabilidade

Todo objeto registra:
```json
{
  "historico": [
    {
      "versao": "1.0.0",
      "data": "2026-07-29T10:00:00Z",
      "autor": "AKP-DOC",
      "alteracao": "Criação inicial via Template A",
      "tokens_utilizados": 1842,
      "modelo": "gpt-4o"
    }
  ]
}
```

## Regras de Governança

1. Nenhum objeto vai a `publicado` sem passar pelo Validator Agent
2. Todo objeto tem exatamente um `owner` responsável
3. Objetos `obsoletos` nunca são deletados — apenas marcados
4. Alterações em objetos `publicados` criam nova versão, preservando a anterior
5. O Knowledge Graph mantém todas as versões de relacionamentos
