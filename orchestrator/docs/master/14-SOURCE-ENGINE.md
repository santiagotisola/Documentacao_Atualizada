# 14 — SOURCE ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Motor de Coleta de Fontes

## 19 Fontes Suportadas

| Categoria | Fontes |
|-----------|--------|
| Documentos | PDF, Word, PowerPoint, Excel, Markdown, HTML |
| Web | URL, GitHub |
| Código | React, Angular, Vue, .NET, Java, Node, Python, Go, Rust |
| Dados | SQL Server, PostgreSQL, Oracle, MongoDB |
| APIs | Swagger, OpenAPI, REST, GraphQL, WebSocket |
| Estruturados | JSON, XML, CSV |
| Mídia | Imagens (OCR), Vídeos, Áudios |
| Automação | Playwright (sistema em execução) |

## Fluxo de Coleta

```
Fonte → Detector de Tipo → Extrator Específico → 
Normalizador → Knowledge Extractor Agent → Knowledge Graph
```

## Prioridade de Fontes

1. **Sistema em execução** (Playwright) — mais preciso, zero defasagem
2. **Swagger/OpenAPI** — fonte autoritativa para APIs
3. **Código-fonte** — fonte autoritativa para lógica
4. **Banco de dados** — fonte autoritativa para dados
5. **Documentação existente** — complementar, pode estar desatualizada
