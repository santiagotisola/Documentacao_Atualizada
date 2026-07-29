# 08 — VIDEO ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Motor de Vídeo v1.0

---

## Visão Geral

O **Video Engine** é composto por 4 agentes em pipeline sequencial. Nenhum agente produz vídeo sozinho — cada um tem uma responsabilidade única e bem definida.

---

## Pipeline Completo

```
Storyboard Agent → Narrator Agent → Capture Agent → Video Renderer
```

---

## Schema de Cena (obrigatório por cena)

Toda cena de vídeo deve conter **todos os campos** abaixo:

```json
{
  "capitulo": 1,
  "cena": 1,
  "objetivo": "O que o usuário aprende nesta cena específica",
  "narrativa": "Texto completo para narração — narrativa corporativa",
  "imagem": "Descrição do visual ou referência ao screenshot",
  "zoom": {
    "ativo": true,
    "regiao": "canto superior direito — botão Exportar",
    "fator": 1.5
  },
  "cursor": {
    "visivel": true,
    "destacado": true,
    "trilha": false
  },
  "callout": {
    "ativo": true,
    "texto": "Atenção: verificar permissão antes de exportar",
    "posicao": "bottom-right"
  },
  "legenda": "Clique em Exportar para gerar o arquivo",
  "transicao": "fade",
  "audio": {
    "narracao": true,
    "musica_fundo": false,
    "efeito_sonoro": null
  },
  "tempo_segundos": 8,
  "validacao": {
    "aprovado": false,
    "revisor": null,
    "comentario": null
  }
}
```

---

## Estrutura do Storyboard

### Nível 1 — Capítulo
```
Capítulo = Agrupamento lógico de cenas com um tema central
├── ID
├── Número
├── Título
├── Objetivo geral
├── Duração total estimada
└── Cenas (array)
```

### Nível 2 — Cena
```
Cena = Unidade mínima de conteúdo (5-30 segundos)
├── Objetivo específico
├── Narrativa (texto para TTS)
├── Visual (screenshot + zoom + cursor)
├── Callout (opcional)
├── Legenda
├── Transição
├── Áudio
└── Tempo
```

---

## Tipos de Transição

| Transição | Uso recomendado |
|-----------|----------------|
| `fade` | Entre capítulos |
| `cut` | Entre cenas do mesmo módulo |
| `slide` | Ao avançar para próxima tela |
| `zoom_out` | Ao mostrar contexto amplo |
| `dissolve` | Cenas lentas/reflexivas |

---

## Tipos de Visual

| Tipo | Descrição |
|------|-----------|
| `screencast` | Gravação da tela em tempo real |
| `screenshot` | Imagem estática da tela |
| `zoom` | Destaque em elemento específico |
| `highlight` | Marcação sobre elemento |
| `slide` | Slide de apresentação |
| `animacao` | Animação de conceito |

---

## Eventos a Capturar (Capture Agent)

| Evento | Capturar? | Schema |
|--------|-----------|--------|
| Loading/Spinner | Sim | `{ loading: true, duracao_ms: number }` |
| Toast/Notificação | Sim | `{ toast: "texto da mensagem" }` |
| Modal/Dialog | Sim | `{ modal: "titulo do modal" }` |
| Tooltip | Sim | `{ tooltip: "texto do tooltip" }` |
| Erro | Sim | `{ erro: "mensagem de erro" }` |
| Breadcrumb | Sim | `{ breadcrumb: ["Home", "Módulo", "Tela"] }` |
| Grid com dados | Sim | `{ grid_dados: true }` |
| Filtro aplicado | Sim | `{ filtro_aplicado: "critério" }` |
| Exportação | Sim | `{ exportacao: true }` |
| Download | Sim | `{ download: true }` |
| Upload | Sim | `{ upload: true }` |

---

## Padrões de Qualidade

### Resolução e Formato
- Resolução: **1280×720 (HD)**
- Frame rate: **25fps**
- Codec vídeo: **H.264 (libx264)**
- Codec áudio: **AAC 96kbps**
- Container: **MP4**

### Narração
- Voz: **Microsoft Maria PT-BR**
- Velocidade: -1 (ligeiramente lenta para treinamento)
- Sem música de fundo no treinamento operacional

### Legenda
- Formato: **SRT sincronizado**
- Máximo 2 linhas por legenda
- Máximo 40 caracteres por linha

---

## Regras do Video Engine

1. O Storyboard Agent planeja — o Video Renderer executa. **Nunca inverter.**
2. Todo vídeo deve ter narração corporativa — **nunca "clique aqui"**
3. Todo vídeo deve ter seção de Relacionamentos nos metadados
4. Todo vídeo passa pelo Validator Agent antes da entrega final
5. Cenas sem objetivo definido são **inválidas**
6. Callouts em erros e alertas são **obrigatórios**
