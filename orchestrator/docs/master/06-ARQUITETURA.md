# 06 — ARQUITETURA
## AXIONIA KNOWLEDGE PLATFORM — Visão Completa de 80+ Componentes

## Camadas da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO                    │
│  PresentationCenter (React) · CLI (axionia.js) · API REST   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE ORQUESTRAÇÃO                    │
│              AI Orchestrator · Event Bus · Workflow          │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE AGENTES                         │
│  Knowledge · Engineering · Documentation · Video · Learning  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE DADOS                           │
│  Knowledge Graph (Neo4j) · MongoDB · PostgreSQL · MinIO      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE INFRAESTRUTURA                  │
│         Docker · Kubernetes · Redis · RabbitMQ               │
└─────────────────────────────────────────────────────────────┘
```

## Stack Tecnológica

| Camada | Tecnologia | Uso |
|--------|-----------|-----|
| Frontend | React 18 + Vite | PresentationCenter |
| Backend API | Node.js + Express | axion-ia-api |
| IA | GPT-4o + Embeddings | Todos os agentes |
| Grafo | Neo4j | Knowledge Graph |
| Documentos | MongoDB | Knowledge Objects |
| Relacional | PostgreSQL | Dados estruturados |
| Cache | Redis | Sessões e cache de prompts |
| Filas | RabbitMQ | Event Bus assíncrono |
| Arquivos | MinIO | Screenshots, vídeos, PDFs |
| Vídeo | FFmpeg | Renderização |
| Automação | Playwright | Capture Agent |
| Container | Docker + K8s | Deploy e escala |
| CLI | Node.js ESM | axionia.js |
