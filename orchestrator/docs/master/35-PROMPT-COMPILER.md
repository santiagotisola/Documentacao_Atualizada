# 35 — PROMPT COMPILER
## AXIONIA KNOWLEDGE PLATFORM — Compilador de Prompts

## O que é

O Prompt Compiler transforma as especificações APSL em prompts otimizados para cada modelo de IA.

## Processo

```
APSL Spec → Parser → AST → Otimizador → Prompt Final
```

## Otimizações Aplicadas

- Remoção de redundâncias
- Compressão de contexto
- Injeção de exemplos relevantes do Knowledge Graph
- Adaptação ao modelo (gpt-4o vs gpt-4o-mini)
- Cache de prompts compilados (Redis TTL 24h)

## Exemplo

```
Input APSL:
@agent(AKP-DOC)
@template(A)
@sistema(AxHub)
@modulo(Triagem)
@publico(operador)

Output Compilado:
"Você é o AKP Documentation Agent. Gere o Manual do Usuário
para o módulo de Triagem do AxHub seguindo o Template A (16 seções).
Público: operadores leigos. Use narrativa corporativa..."
```
