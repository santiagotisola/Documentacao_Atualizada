# 12 — EVENT BUS
## AXIONIA KNOWLEDGE PLATFORM — Barramento de Eventos

## Tecnologia: RabbitMQ

Todos os agentes comunicam-se exclusivamente via **mensagens assíncronas** no Event Bus.

## Exchanges e Filas

```
akp.knowledge.*    → Filas do Knowledge Engine
akp.video.*        → Filas do Video Engine
akp.docs.*         → Filas do Documentation Engine
akp.validation.*   → Fila do Validator Agent
akp.publish.*      → Fila do Publisher Agent
akp.dead-letter    → Mensagens que falharam após max retries
```

## Padrão de Mensagem

```json
{
  "event_id": "uuid",
  "event_type": "KNOWLEDGE_EXTRACTED",
  "source_agent": "AKP-KE",
  "target_agent": "AKP-RM",
  "payload": { "knowledge_object_id": "AKP-AH-001" },
  "timestamp": "2026-07-29T14:00:00Z",
  "correlation_id": "task-uuid",
  "priority": 2
}
```
