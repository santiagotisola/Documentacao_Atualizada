# 08 — KNOWLEDGE GRAPH
## AXIONIA KNOWLEDGE PLATFORM — O Grafo Central de Conhecimento

## O que é

O **Knowledge Graph** é o coração da AKP. É um banco de dados em grafo (Neo4j) que armazena todos os Knowledge Objects e seus relacionamentos.

## Por que Neo4j

```
SQL pergunta: "Quais tabelas existem?"
Graph pergunta: "Qual o impacto de alterar esta tabela em todo o sistema?"
```

O grafo responde instantaneamente a perguntas de relacionamento profundo que levariam joins complexos em SQL.

## Estrutura de Nós

Cada Knowledge Object é um nó com propriedades:
```cypher
(o:KnowledgeObject {
  akp_id: "AKP-AH-TRL-001",
  nome: "Triagem de Infrações",
  tipo: "Tela",
  sistema: "AxHub",
  versao: "1.2.3",
  status: "publicado",
  confiabilidade: 95
})
```

## Os 22 Tipos de Relacionamento

```cypher
(tela)-[:USES]->(api)
(api)-[:READS]->(tabela)
(tabela)-[:GENERATES]->(relatorio)
(relatorio)-[:DOCUMENTED_BY]->(manual)
(manual)-[:VIDEO_OF]->(video)
(video)-[:FAQ_OF]->(faq)
(faq)-[:QUIZ_OF]->(quiz)
```

Tipos completos:
DEPENDS_ON · USES · CALLS · READS · WRITES · GENERATES ·
DOCUMENTED_BY · VIDEO_OF · FAQ_OF · QUIZ_OF · CONFIGURES ·
IMPORTS · EXPORTS · REQUIRES · BELONGS_TO · NEXT · PREVIOUS ·
CAUSES · FIXES · VALIDATES · CAPTURED_BY · EXPLAINED_BY

## Consultas Típicas

```cypher
-- Tudo que a tela de Triagem impacta
MATCH (t:KnowledgeObject {nome: "Triagem"})-[*1..3]->(n)
RETURN n

-- Quais documentos precisam ser atualizados se a API mudar?
MATCH (api:KnowledgeObject {tipo: "API"})-[:DOCUMENTED_BY|VIDEO_OF|FAQ_OF]->(doc)
WHERE api.akp_id = "AKP-AH-API-005"
RETURN doc
```
