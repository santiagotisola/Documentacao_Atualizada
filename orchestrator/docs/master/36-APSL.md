# 36 — APSL — AKP PROMPT SPECIFICATION LANGUAGE
## AXIONIA KNOWLEDGE PLATFORM — Linguagem de Especificação de Prompts

## Sintaxe

```apsl
@agent(AGENT_ID)          → Define o agente executor
@template(A|B|C)          → Template de conteúdo
@sistema(AxHub|AxTon|...)  → Sistema alvo
@modulo(nome)             → Módulo específico
@publico(tecnico|admin|usuario) → Audiência
@formato(json|md|pdf)     → Formato de saída
@versao(semver)           → Versão do conteúdo
@relacionar(objeto_id)    → Relacionamentos obrigatórios
@principio(1..10)         → Princípios a aplicar
```

## Exemplo Completo

```apsl
@agent(AKP-SB)
@template(B)
@sistema(AxHub)
@modulo(Triagem)
@publico(operador)
@formato(json)
@versao(1.0.0)
@relacionar(AKP-DOC-AH-TRL-001)
@principio(1,3,6,7)
```

Gera o storyboard completo para o vídeo do módulo de Triagem do AxHub.
