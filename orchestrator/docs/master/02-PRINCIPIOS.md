# 02 — OS 10 PRINCÍPIOS FUNDAMENTAIS
## AXIONIA KNOWLEDGE PLATFORM — Princípios Inegociáveis v1.0

> Estes princípios se sobrepõem a qualquer instrução específica. São a lei máxima da plataforma.

---

## Princípio #01 — KNOWLEDGE FIRST

> *"Nunca gere um resultado diretamente. Sempre construa primeiro um modelo de conhecimento interno."*

**Fluxo obrigatório (9 etapas — nenhuma pode ser pulada):**

```
Entrada → Análise → Extração → Normalização →
Relacionamentos → Knowledge Graph →
Planejamento → Validação → Resultado
```

**Implementação:** Qualquer chamada ao sistema deve iniciar pelo Knowledge Extractor Agent antes de qualquer geração de conteúdo.

---

## Princípio #02 — DIGITAL TWIN

> *"Todo sistema analisado deverá possuir um Digital Twin Cognitivo."*

O Digital Twin conhece completamente:
Arquitetura · Banco · APIs · Regras · Menus · Campos · Usuários · Permissões · Fluxos · Documentação · Vídeos · FAQ · Quizzes · Integrações · Dependências · Código · Eventos · Logs · Versões

**Regra:** Todo novo conhecimento atualiza o Digital Twin automaticamente.

---

## Princípio #03 — RELACIONAMENTO TOTAL

> *"Nenhuma informação poderá existir isoladamente."*

**Exemplo de cadeia obrigatória:**
```
Tela → Campos → APIs → Banco → Relatórios → Dashboard
```

**Tipos de relacionamento (22 no total):**
`DEPENDS_ON` `USES` `CALLS` `READS` `WRITES` `GENERATES` `DOCUMENTED_BY` `VIDEO_OF` `FAQ_OF` `QUIZ_OF` `CONFIGURES` `IMPORTS` `EXPORTS` `REQUIRES` `BELONGS_TO` `NEXT` `PREVIOUS` `CAUSES` `FIXES` `VALIDATES` `CAPTURED_BY` `EXPLAINED_BY`

**Regra:** Todo objeto deve ter no mínimo **3 relacionamentos** preenchidos.

---

## Princípio #04 — SEMÂNTICA

> *"A IA nunca deverá armazenar apenas texto. Ela deverá compreender."*

**10 perguntas obrigatórias para cada informação:**

| # | Pergunta |
|---|----------|
| 1 | O que é? |
| 2 | Para que serve? |
| 3 | Quem utiliza? |
| 4 | Quando utiliza? |
| 5 | Como funciona? |
| 6 | Quais dependências? |
| 7 | Quais impactos? |
| 8 | Quais riscos? |
| 9 | Quais integrações? |
| 10 | Quais resultados? |

---

## Princípio #05 — ANÁLISE MULTICAMADAS

> *"Toda análise deve ocorrer simultaneamente em 10 camadas."*

| Camada | Agente Responsável |
|--------|--------------------|
| Funcional | Documentation Agent |
| Técnica | Code Agent |
| Visual | Screen Analyzer + Capture Agent |
| Banco de Dados | Database Agent |
| APIs | API Agent |
| Segurança | Validator Agent |
| Integrações | Relationship Mapper |
| UX | Screen Analyzer |
| Performance | Analytics Agent |
| Conhecimento | Knowledge Extractor |

---

## Princípio #06 — NARRATIVA CORPORATIVA

> *"Todo conteúdo deverá utilizar linguagem profissional."*

| ❌ Evitar | ✅ Preferir |
|-----------|------------|
| "clique aqui" | "O usuário deverá selecionar..." |
| "aperte o botão" | "O sistema disponibilizará o botão..." |
| "vai aparecer" | "O sistema apresentará..." |
| "é simples" | "O procedimento consiste em..." |

**Sempre explicar:** Objetivo · Motivação · Resultado Esperado · Boas Práticas · Erros Comuns · Consequências

---

## Princípio #07 — MICROLEARNING

> *"Todo conhecimento deverá ser fragmentado automaticamente."*

| Duração | Tipo |
|---------|------|
| 15s | Cápsula Rápida |
| 30s | Dica |
| 45s | Conceito |
| 60s | Procedimento Básico |
| 90s | Fluxo Simples |
| 5min | Módulo Básico |
| 15min | Módulo Intermediário |
| 30min | Módulo Avançado |
| Completo | Curso Completo |

**Regra:** Toda documentação deve gerar automaticamente **todos os 9 níveis**.

---

## Princípio #08 — REUTILIZAÇÃO

> *"Nunca recriar conhecimento."*

**Antes de gerar qualquer conteúdo, pesquisar:**
Knowledge Graph · FAQ · Storyboards · Vídeos · Glossário · Templates · Exemplos · Releases

**Se existir conteúdo semelhante:** Atualizar. **Nunca duplicar.**

---

## Princípio #09 — APRENDIZADO CONTÍNUO

> *"Toda execução deve produzir aprendizado."*

**Registrar após cada tarefa:**
Tempo · Modelo utilizado · Prompt · Tokens · Resultado · Qualidade · Falhas · Feedback · Relacionamentos · Versão

---

## Princípio #10 — MULTIMODALIDADE

> *"Toda informação deve ser compreendida independentemente da origem."*

**19 origens válidas:** Texto · Imagem · Áudio · Vídeo · OCR · Banco · Código · Swagger · OpenAPI · JSON · XML · CSV · Excel · PowerPoint · PDF · Playwright · URL · GitHub · Sistema em execução

**Campos obrigatórios de todo objeto:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| owner | string | Responsável pelo conteúdo |
| data_criacao | ISO 8601 | Quando foi criado |
| ultima_atualizacao | ISO 8601 | Última modificação |
| versao | string | Versão semântica |
| sistema | enum | Produto Axion relacionado |
| cliente | string | Cliente final |
| projeto | string | Projeto específico |
| criticidade | enum | baixa/média/alta/crítica |
| confiabilidade | 0-100 | Score de confiança |
| origem | enum | Fonte original |
| responsavel_tecnico | string | Tech owner |
| status | enum | rascunho/publicado/arquivado/obsoleto |
