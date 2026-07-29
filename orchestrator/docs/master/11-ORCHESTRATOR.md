# 11 — AI ORCHESTRATOR
## AXIONIA KNOWLEDGE PLATFORM — O Orquestrador Central

## Responsabilidade

O AI Orchestrator é o **único ponto de comunicação** entre agentes.

Ele:
- Recebe solicitações externas
- Transforma em eventos tipados
- Roteia para o agente correto
- Aguarda resposta e valida
- Propaga resultados para dependentes

## Nunca faz

- Executar lógica de domínio
- Produzir conteúdo
- Acessar banco diretamente
- Modificar agentes

## Tipos de Evento

```typescript
type AKPEvent = {
  id: string;            // UUID único do evento
  tipo: EventType;       // TASK_ASSIGNED | KNOWLEDGE_READY | ...
  agente_origem: string; // Quem emitiu
  agente_destino: string;// Quem deve receber
  payload: object;       // Dados do evento
  correlacao_id: string; // Para rastreamento de cadeia
  timestamp: string;     // ISO 8601
  prioridade: 1|2|3;     // 1=alta, 2=normal, 3=baixa
  retry_count: number;   // Tentativas até agora
  max_retries: number;   // Máximo de tentativas
}
```

## Ciclo de Vida de uma Tarefa

```
RECEIVED → QUEUED → ASSIGNED → PROCESSING → VALIDATING → COMPLETED
                                    ↓
                                  FAILED → RETRY (max 3x) → DEAD_LETTER
```
