# 27 — OCR ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Reconhecimento Óptico de Caracteres

## Fontes para OCR

- Screenshots capturados pelo Playwright
- PDFs escaneados
- Imagens de manuais físicos
- Fotos de telas de sistema

## Pipeline

```
Imagem → Pré-processamento → OCR → Extração de Texto →
Knowledge Extractor → Normalização → Knowledge Graph
```

## Uso na AKP

O OCR alimenta o Knowledge Extractor Agent com texto extraído de:
- Manuais em formato de imagem
- Capturas de sistemas legados
- Documentações físicas digitalizadas
