# 28 — SCREEN ANALYZER
## AXIONIA KNOWLEDGE PLATFORM — Análise de Interfaces

## Missão

Compreender completamente uma interface e criar um modelo estruturado da tela com todos os elementos, permissões e fluxos.

## Detecta

Botões · Campos · Menus · Cards · Ícones · Widgets ·
Gráficos · Permissões necessárias · Alertas · Breadcrumb ·
Sidebar · Header · Footer · Modais · Tooltips ·
Grids/Tabelas · Filtros · Exportações · Uploads · Downloads

## Schema de Saída

```json
{
  "tela": "string",
  "objetivo": "string",
  "usuarios": ["array de perfis"],
  "elementos": [{
    "tipo": "button | input | select | table | ...",
    "id_css": "string",
    "xpath": "string",
    "label": "string",
    "acao": "string",
    "permissao": "string | null"
  }],
  "apis_chamadas": ["array de endpoints"],
  "permissoes_necessarias": ["array"]
}
```
