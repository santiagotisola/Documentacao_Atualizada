# 26 — PLAYWRIGHT ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Automação e Captura

## Missão

Navegar automaticamente em sistemas e capturar **evidências visuais precisas** para alimentar o pipeline de vídeo e o Screen Analyzer.

## Nunca faz

- Interpretar regras de negócio
- Modificar dados no sistema
- Tomar decisões de navegação não definidas no fluxo

## 21 Campos de Captura

Tela · Elemento · XPath · CSS · Tempo · Screenshot · Vídeo ·
Evento · Resposta · Erro · Loading · Toast · Modal · Tooltip ·
Breadcrumb · Menu Ativo · Grid com Dados · Filtro Aplicado ·
Exportação · Download · Upload

## Eventos Especiais

| Evento | Ação Obrigatória |
|--------|-----------------|
| Loading/Spinner | Screenshot antes + aguardar + screenshot depois |
| Toast | Capturar imediatamente (desaparece em 3-5s) |
| Modal | Capturar aberto + registrar título e botões |
| Erro | Screenshot + texto completo do erro |
| Breadcrumb | Registrar em toda navegação |
