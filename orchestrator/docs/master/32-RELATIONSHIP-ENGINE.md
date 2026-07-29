# 32 — RELATIONSHIP ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Mapeamento de Relacionamentos

## Os 22 Tipos de Relacionamento

| Tipo | Direção | Exemplo |
|------|---------|---------|
| DEPENDS_ON | → | Tela depende de API |
| USES | → | API usa Tabela |
| CALLS | → | Controller chama Service |
| READS | → | Relatório lê View |
| WRITES | → | Formulário escreve Tabela |
| GENERATES | → | Processo gera Relatório |
| DOCUMENTED_BY | ← | Módulo documentado por Manual |
| VIDEO_OF | ← | Cena é vídeo de Tela |
| FAQ_OF | ← | FAQ responde sobre Módulo |
| QUIZ_OF | ← | Quiz testa conhecimento sobre Módulo |
| CONFIGURES | → | Configuração afeta Comportamento |
| IMPORTS | → | Módulo importa Biblioteca |
| EXPORTS | → | Sistema exporta para DETRAN |
| REQUIRES | → | Funcionalidade requer Permissão |
| BELONGS_TO | → | Tela pertence a Módulo |
| NEXT | → | Passo 1 precede Passo 2 |
| PREVIOUS | ← | Passo 2 sucede Passo 1 |
| CAUSES | → | Ação causa Evento |
| FIXES | → | Solução resolve Erro |
| VALIDATES | → | Regra valida Campo |
| CAPTURED_BY | ← | Tela capturada por Playwright |
| EXPLAINED_BY | ← | Conceito explicado por Microlearning |

## Regra

Todo objeto no Knowledge Graph deve ter **mínimo 3 relacionamentos**. Objetos isolados são inválidos.
