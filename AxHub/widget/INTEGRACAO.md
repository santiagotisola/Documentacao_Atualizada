# Integração do AxionIA - Assistente Inteligente AxHub

## Visão Geral

O AxionIA é um assistente inteligente embeddável que aparece como botão flutuante no canto inferior direito do sistema. Ao clicar, abre um painel com busca por texto livre, filtro por módulo e passo a passo das operações. Funciona sem dependências externas e não interfere no sistema existente.

---

## Opção 1: Via GitHub Pages (Recomendado)

Adicione **uma única linha** antes do `</body>` no HTML principal do AxHub:

```html
<script src="https://axion-tecnologia.github.io/AxHub.Docs/widget/axhub-suporte.js"></script>
```

O widget carrega automaticamente o `knowledge-base.json` do mesmo servidor.

### Onde inserir no AxHub (.NET)

No arquivo de layout principal (geralmente `_Layout.cshtml` ou `_Host.cshtml`):

```html
    <!-- ... conteúdo existente ... -->

    <script src="https://axion-tecnologia.github.io/AxHub.Docs/widget/axhub-suporte.js"></script>
</body>
</html>
```

---

## Opção 2: Hospedado Localmente

1. Copie os dois arquivos para o servidor web:
   - `axhub-suporte.js` → `/widget/axhub-suporte.js`
   - `knowledge-base.json` → `/widget/knowledge-base.json`

2. Adicione no HTML:

```html
<script src="/widget/axhub-suporte.js"></script>
```

O widget detecta automaticamente o diretório do script e carrega o JSON da mesma pasta.

---

## Opção 3: CDN Customizado

Se o `knowledge-base.json` estiver em outro local, especifique antes do script:

```html
<script>var AXHUB_KB_URL = 'https://meu-servidor.com/suporte/knowledge-base.json';</script>
<script src="/widget/axhub-suporte.js"></script>
```

---

## Instâncias Alvo

| Instância | URL | Layout |
|-----------|-----|--------|
| Goiânia | `goiania.axhub.axion.ws` | `_Layout.cshtml` |
| Strans | `strans.axhub.axion.ws` | `_Layout.cshtml` |

---

## Funcionalidades

- **Busca por texto livre** — com normalização de acentos (ex: "infraçao" encontra "infração")
- **Filtro por categoria** — Infrações, Operações, Medições, Veículos, etc.
- **Passo a passo** — cada artigo tem etapas numeradas detalhadas
- **Link para Help Desk** — abre chamado em `desk.axiontecnologia.com.br` quando não encontra resposta
- **Responsivo** — funciona em desktop e mobile
- **Zero dependências** — não requer jQuery, React ou qualquer lib

---

## Estrutura dos Arquivos

```
widget/
├── axhub-suporte.js       # Widget (15KB) — CSS + HTML + lógica de busca
├── knowledge-base.json    # Base de conhecimento (26KB) — 30 artigos + 7 glossário
├── demo.html              # Página de demonstração
└── INTEGRACAO.md          # Este documento
```

---

## Como Atualizar a Base de Conhecimento

1. Edite o arquivo `knowledge-base.json`
2. Cada entrada tem a estrutura:

```json
{
  "id": "identificador-unico",
  "module": "Nome do Módulo",
  "title": "Título do Artigo",
  "keywords": ["palavra1", "palavra2"],
  "path": "Menu > Submenu > Tela",
  "content": "Descrição resumida da funcionalidade.",
  "steps": [
    "Passo 1: Acesse o menu...",
    "Passo 2: Clique em..."
  ]
}
```

3. Faça deploy novamente (GitHub Pages ou copie para o servidor)

---

## Prioridade de Carregamento do JSON

O widget tenta carregar a base nesta ordem:

1. URL customizada (se `AXHUB_KB_URL` estiver definido)
2. Mesmo diretório do script (`<script-path>/knowledge-base.json`)
3. `/widget/knowledge-base.json` (raiz do site)
4. `https://axion-tecnologia.github.io/AxHub.Docs/widget/knowledge-base.json` (fallback)

---

## Verificação Rápida

Após adicionar o script, abra o sistema e verifique:

- [ ] Botão azul (ícone de chat) aparece no canto inferior direito
- [ ] Clicar no botão abre o painel de suporte
- [ ] Digitar uma busca (ex: "exportar") retorna resultados
- [ ] Clicar em um resultado mostra o passo a passo
- [ ] Link "Abrir chamado no Help Desk" funciona
- [ ] Funciona no celular

---

## Troubleshooting

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| Botão não aparece | Script não carregou | Verifique a URL no Console (F12) |
| "Não foi possível carregar" | JSON inacessível | Verifique CORS ou hospede localmente |
| Widget sobrepõe elementos | z-index conflitante | O widget usa `z-index: 99999` |
| Busca não encontra nada | Termo muito específico | Use palavras-chave mais gerais |
