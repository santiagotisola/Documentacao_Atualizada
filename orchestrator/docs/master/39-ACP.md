# 39 — ACP — AKP COMMUNICATION PROTOCOL
## AXIONIA KNOWLEDGE PLATFORM — Protocolo de Comunicação

## Regras do Protocolo

1. **Toda comunicação via eventos** — sem chamadas diretas entre agentes
2. **Todo evento é tipado** — sem mensagens genéricas
3. **Todo evento tem correlation_id** — para rastreabilidade end-to-end
4. **Todo evento tem TTL** — mensagens não processadas expiram
5. **Toda falha gera dead-letter** — nenhuma mensagem é perdida

## Ciclo de Vida da Mensagem

```
PUBLISHED → DELIVERED → ACKNOWLEDGED → PROCESSED
                              ↓
                         NACK → RETRY (3x) → DEAD_LETTER
```

## Garantias

- **At-least-once delivery** — toda mensagem é entregue ao menos uma vez
- **Idempotência** — processadores devem ser idempotentes
- **Ordering** — filas por agente garantem ordem de processamento
