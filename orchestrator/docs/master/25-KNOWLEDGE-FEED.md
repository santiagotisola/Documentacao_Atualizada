# 25 — KNOWLEDGE FEED
## AXIONIA KNOWLEDGE PLATFORM — Feed Contínuo de Conhecimento

## O que é

O Knowledge Feed é o canal de distribuição das cápsulas de microlearning — um feed de cards que mantém os usuários atualizados sobre o sistema.

## Card do Feed

```json
{
  "id": "AKP-FEED-001",
  "tipo": "Alerta Crítico | Novidade | Você Sabia | Dica | Meta Atingida",
  "icone": "🔴 | ✨ | 💡 | 🔧 | 🎯",
  "titulo": "string — max 80 chars",
  "conteudo": "string — max 80 palavras",
  "tags": ["array"],
  "prioridade": "alta | normal | baixa",
  "data": "relativa — Hoje, Ontem, Há X dias",
  "call_to_action": "Texto do botão →",
  "relacionamentos": {
    "manual_id": "string | null",
    "video_id": "string | null",
    "microlearning_id": "string | null"
  }
}
```

## Prioridades

| Prioridade | Cor | Exemplos |
|-----------|-----|---------|
| Alta | 🔴 | Equipamento offline, erro crítico, prazo vencendo |
| Normal | 🔵 | Novidades, atualizações, novas funcionalidades |
| Baixa | ⚫ | Dicas, boas práticas, insights |
