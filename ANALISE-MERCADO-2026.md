# Análise de Mercado & Roadmap de Melhorias — Ecossistema Axion 2026

> Gerado em: 04/05/2026  
> Escopo: axion-ia-api · axion-ia-panel · AxHub.Docs · AxTon.Docs · AxCross.Docs · Widgets · Infraestrutura

---

## Sumário Executivo

O ecossistema Axion está bem estruturado e funcional. O stack é moderno (Node.js ESM, React 18/Vite 6, Docusaurus 3.9), mas existem **lacunas relevantes em IA, segurança, observabilidade e experiência de desenvolvimento** que o mercado já resolveu em 2025-2026. Este documento mapeia cada projeto, identifica gaps e propõe o que acrescentar por ordem de impacto.

---

## 1. Motor de IA (`axion-ia-api/src/engine.js`)

### Estado Atual
| Item | Tecnologia Atual |
|------|-----------------|
| Modelo de linguagem | `gpt-4o-mini` (OpenAI) |
| Embeddings | `text-embedding-3-small` |
| Busca semântica | cosine-similarity manual (loop em todos os registros) |
| Orquestração | Sem framework (lógica direta) |
| Respostas | Prompt com formato fixo no texto |
| Memória de conversa | Sem contexto de histórico de sessão |

### Lacunas vs Mercado

#### 1.1 Roteamento Inteligente de Modelos
O mercado migrou para **model routing**: usar um modelo mais barato para queries simples e reservar o GPT-4o para perguntas complexas.

```
Query simples (KB hit >= 0.85) → resposta direta da KB (sem IA)
Query média (KB hit 0.65–0.85) → gpt-4o-mini (atual)
Query complexa (raciocínio, análise, sem contexto) → gpt-4o
```

**Pacotes:** sem novo pacote necessário — usar variável de ambiente `MODEL_COMPLEXO=gpt-4o`.

#### 1.2 Streaming de Respostas (SSE)
Toda aplicação de chat profissional em 2026 usa streaming. O usuário vê tokens chegando em tempo real — reduz percepção de latência drasticamente.

**Implementação na API:**
```js
// engine.js — adicionar função streamResposta()
const stream = await client.chat.completions.create({
  model: 'gpt-4o-mini',
  stream: true,
  messages: [...]
});
for await (const chunk of stream) {
  res.write(`data: ${JSON.stringify({ token: chunk.choices[0]?.delta?.content })}\n\n`);
}
res.end();
```

**No painel React:** usar `EventSource` ou `fetch` com `ReadableStream`.

#### 1.3 Structured Outputs (substituir prompt formatting)
Atualmente o formato de resposta (`Assunto: / Análise: / Causa:`) é controlado por instrução no prompt — frágil. A API OpenAI oferece **Structured Outputs com JSON Schema** desde 2024.

```js
const response = await client.beta.chat.completions.parse({
  model: 'gpt-4o-mini',
  messages: [...],
  response_format: zodResponseFormat(RespostaSchema, 'resposta')
});
```

**Pacote:** `zod` + `openai` (já instalado) com `zodResponseFormat`.

#### 1.4 Busca Vetorial Escalável
O `buscarRespostaSemantica` atual faz **loop em todos os registros do MongoDB** a cada query, calculando cosine similarity. Com 1.000+ registros na KB, isso fica lento.

**Melhorias disponíveis no mercado:**

| Opção | Custo | Observação |
|-------|-------|------------|
| **MongoDB Atlas Vector Search** | Grátis (tier M0) | Ideal — já usa Mongoose, zero mudança de infraestrutura |
| **pgvector (PostgreSQL)** | Grátis | Boa opção se migrar para SQL |
| **Qdrant** | Grátis self-host | Melhor performance, mais complexo |

**Recomendação:** Adicionar índice vetorial no MongoDB Atlas com `$vectorSearch` — elimina o loop manual e permite escalar para 100k+ registros.

#### 1.5 Contexto de Conversa (Memória de Sessão)
A IA atual responde cada mensagem de forma isolada. O mercado já consolidou **janela de contexto** com últimas N trocas.

```js
// Armazenar últimas 5 trocas por sessionId
const historico = await Log.find({ sessionId }).sort({ _id: -1 }).limit(5);
const messages = [
  { role: 'system', content: systemPrompt },
  ...historico.reverse().flatMap(h => [
    { role: 'user', content: h.mensagem },
    { role: 'assistant', content: h.resposta }
  ]),
  { role: 'user', content: mensagemAtual }
];
```

#### 1.6 Modelo GPT-4o (Respostas API — novo em 2025)
A OpenAI lançou a **Responses API** em 2025 — substitui o `chat.completions` para agentes com ferramentas. Permite criar **agentes com tool use nativo** (busca na KB, consulta SQL Server, geração de relatório) em uma única chamada.

```js
// Novo paradigma com Responses API
const response = await client.responses.create({
  model: 'gpt-4o',
  tools: [buscarKBTool, consultarAxHubTool, gerarRelatorioTool],
  input: mensagem
});
```

---

## 2. Backend API (`axion-ia-api`)

### Estado Atual
| Item | Estado |
|------|--------|
| Framework | Express 4.18 |
| Autenticação | Token estático em `token.txt` |
| Validação de entrada | Sem validação estruturada |
| Rate limiting | Sem limitação de requisições |
| Headers de segurança | Sem `helmet` |
| Logging | Console + logger.js customizado |
| Observabilidade | Sem métricas/tracing |

### Lacunas vs Mercado

#### 2.1 Segurança — Crítico

**Problema:** Sem rate limiting + sem validação de entrada = vulnerável a DDoS e injeção de dados.

```bash
npm install helmet express-rate-limit zod
```

**Helmet** (headers HTTP de segurança):
```js
// app.js
import helmet from 'helmet';
app.use(helmet());
```

**Rate Limiting:**
```js
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({ windowMs: 60_000, max: 60 });
app.use('/api', limiter);
```

**Zod para validação:**
```js
// Exemplo no controller.js
const schema = z.object({ mensagem: z.string().min(1).max(2000) });
const { mensagem } = schema.parse(req.body);
```

#### 2.2 Autenticação JWT
O `token.txt` estático não expira. Migrar para **JWT com expiração**:

```bash
npm install jsonwebtoken
```

```js
// Middleware de auth
const token = req.headers.authorization?.split(' ')[1];
const payload = jwt.verify(token, process.env.JWT_SECRET);
```

#### 2.3 Logging Estruturado (Pino)
O logger atual é customizado e escreve em JSON simples. **Pino** é o padrão de mercado para Node.js — 5x mais rápido que Winston, JSON estruturado nativo.

```bash
npm install pino pino-pretty
```

#### 2.4 Observabilidade — OpenTelemetry
Para produção, rastrear latências por endpoint, erros e taxa de acerto da KB.

```bash
npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

Integra com Grafana, Datadog, ou **Jaeger** (self-hosted grátis).

#### 2.5 Validação de Variáveis de Ambiente
Sem o `.env`, a API quebra silenciosamente. Adicionar validação na inicialização:

```bash
npm install envalid
```

```js
// app.js
import { cleanEnv, str, port } from 'envalid';
const env = cleanEnv(process.env, {
  OPENAI_API_KEY: str(),
  MONGO_URI: str(),
  PORT: port({ default: 3100 })
});
```

---

## 3. Painel React (`axion-ia-panel`)

### Estado Atual
| Item | Estado |
|------|--------|
| Framework | React 18 + Vite 6 |
| State management | Sem (useState/props apenas) |
| Data fetching | Axios manual (sem cache) |
| UI/Componentes | CSS customizado (sem biblioteca) |
| Formulários | HTML nativo |
| Gráficos | Sem visualizações no dashboard |
| Notificações | Sem sistema de toast |
| Tempo real | Sem WebSocket/SSE |

### Lacunas vs Mercado

#### 3.1 TanStack Query (React Query v5) — Alto Impacto
Substitui chamadas Axios manuais com **cache automático, refetch, loading/error states e invalidação**.

```bash
npm install @tanstack/react-query
```

```jsx
// Antes (manual)
const [tickets, setTickets] = useState([]);
useEffect(() => { axios.get('/api/helpdesk/tickets').then(r => setTickets(r.data)); }, []);

// Depois (React Query)
const { data: tickets, isLoading } = useQuery({
  queryKey: ['tickets'],
  queryFn: () => api.get('/api/helpdesk/tickets').then(r => r.data)
});
```

Benefícios: cache entre páginas, invalidação automática após mutações, retry automático.

#### 3.2 Zustand para Estado Global
Com 15+ páginas, compartilhar estado via props se torna difícil. **Zustand** é o padrão mais adotado em 2025 (mais simples que Redux).

```bash
npm install zustand
```

```js
// store/useAuthStore.js
const useAuthStore = create((set) => ({
  token: localStorage.getItem('token'),
  setToken: (t) => set({ token: t }),
}));
```

#### 3.3 Shadcn/ui + Tailwind CSS
O CSS customizado atual resulta em inconsistência visual. **Shadcn/ui** é a biblioteca mais adotada em 2025 — componentes acessíveis, copiáveis, sem lock-in.

```bash
npx shadcn@latest init
npx shadcn@latest add button card table badge input
```

**Tailwind CSS** junto com Shadcn/ui já é o stack dominante para painéis admin.

#### 3.4 Recharts para Dashboard
O Dashboard atual não tem gráficos. Métricas visuais são essenciais para um painel de IA.

```bash
npm install recharts
```

Gráficos sugeridos:
- Linha: tickets respondidos por dia
- Pizza: distribuição de origens (kb / embedding / gpt)
- Barra: score médio das respostas por módulo
- Gauge: taxa de auto-resolução hoje vs meta

#### 3.5 React Hook Form + Zod
Formulários do painel (treinamento, configurações) são HTML puro. **React Hook Form** com validação Zod é o padrão atual.

```bash
npm install react-hook-form zod @hookform/resolvers
```

#### 3.6 Notificações Toast (Sonner)
Sem feedback visual após ações. **Sonner** é a biblioteca de toast mais popular em 2025.

```bash
npm install sonner
```

#### 3.7 React 19 Migration
O painel ainda usa React 18. Docusaurus já usa React 19 (mesma instalação do npm). Migrar para React 19 traz:
- Compiler (otimização automática de re-renders)
- `use()` hook para promises
- Actions (mutações sem boilerplate)

---

## 4. Portais Docusaurus (AxHub · AxTon · AxCross)

### Estado Atual
| Item | Estado |
|------|--------|
| Versão | Docusaurus 3.9.2 (mais recente) |
| Busca | Apenas busca local nativa |
| Versionamento | Sem versões de docs |
| Analytics | Sem rastreamento |
| PDF | Gerado via Puppeteer (script externo) |
| Imagens | PNG/JPG sem otimização |

### Lacunas vs Mercado

#### 4.1 Algolia DocSearch — Alto Impacto
A busca nativa do Docusaurus é limitada. **Algolia DocSearch** é gratuito para projetos de documentação e entrega busca full-text com relevância, typo tolerance e analytics de buscas.

```bash
npm install @docusaurus/theme-search-algolia
```

```ts
// docusaurus.config.ts
themeConfig: {
  algolia: {
    appId: 'SEU_APP_ID',
    apiKey: 'SUA_SEARCH_KEY',
    indexName: 'axhub',
  }
}
```

#### 4.2 Plugin OpenAPI (`docusaurus-plugin-openapi-docs`)
O workspace já tem `openapi.json`. Publicar a spec da API diretamente nos portais como documentação interativa (Swagger-like, mas integrado ao Docusaurus).

```bash
npm install docusaurus-plugin-openapi-docs docusaurus-theme-openapi-docs
```

#### 4.3 Versionamento de Documentação
Para quando os sistemas têm releases com mudanças significativas, manter histórico de docs:

```bash
npx docusaurus docs:version 2.1.0
```

#### 4.4 Analytics com Plausible (LGPD-friendly)
Saber quais páginas os usuários mais acessam, onde buscam e onde param.

```ts
// docusaurus.config.ts
scripts: [{ src: 'https://plausible.io/js/script.js', 'data-domain': 'docs.axion.com.br', defer: true }]
```

Alternativa auto-hospedada: **Umami** (dashboard de analytics, LGPD nativo, grátis).

#### 4.5 `docusaurus-plugin-image-zoom`
Imagens de manual (screenshots de sistemas) são pequenas no contexto mas o usuário precisa ampliar. Este plugin permite zoom em clique.

```bash
npm install docusaurus-plugin-image-zoom
```

#### 4.6 Mermaid para Diagramas
Documentação técnica com diagramas de fluxo inline (sem exportar imagem):

```ts
// docusaurus.config.ts
markdown: { mermaid: true },
themes: ['@docusaurus/theme-mermaid']
```

---

## 5. Widgets de Suporte (AxHub · AxTon · AxCross)

### Estado Atual
Os widgets são arquivos JS vanilla únicos (~2.000 linhas cada) com KB local embutida. Funcionam offline mas têm limitações.

### Lacunas vs Mercado

#### 5.1 Conexão com API em Tempo Real
Os widgets atuais respondem pela KB local. Integrar com `POST /api/chat` da axion-ia-api permitiria respostas com contexto completo (embeddings + GPT).

```js
// No widget — substituir resposta local por chamada API
async function responderViaAPI(pergunta) {
  const res = await fetch('https://api.axion.com.br/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensagem: pergunta })
  });
  return res.json();
}
```

#### 5.2 Streaming no Widget
Com a API suportando streaming (item 1.2), o widget poderia exibir tokens chegando em tempo real, igual ao ChatGPT.

#### 5.3 Widget como Web Component
Transformar de IIFE global para **Web Component** (`<axionia-chat>`):
- Sem conflito com CSS da página host
- Reutilizável em qualquer stack (Vue, Angular, plain HTML)

```js
class AxioniaWidget extends HTMLElement {
  connectedCallback() { this.render(); }
}
customElements.define('axionia-chat', AxioniaWidget);
```

---

## 6. Integração WhatsApp (`@whiskeysockets/baileys`)

### Estado Atual
Usa **Baileys** — biblioteca não-oficial que simula WhatsApp Web via WebSocket. Funciona mas viola os ToS do WhatsApp e pode ser banida.

### Lacunas vs Mercado

#### 6.1 WhatsApp Cloud API (Meta Oficial)
A Meta abriu a **WhatsApp Business Cloud API** — gratuita até 1.000 conversas/mês, sem risco de ban, com webhook oficial.

**Vantagens:**
- Webhooks confiáveis (sem polling)
- Templates HSM aprovados para proativas
- Sem risco de bloqueio de número
- Suporte a botões, listas, imagens, documentos nativos

**Integração:**
```js
// Receber mensagens via webhook POST /webhook/whatsapp
app.post('/webhook/whatsapp', async (req, res) => {
  const mensagem = req.body.entry[0].changes[0].value.messages[0];
  const resposta = await gerarResposta(mensagem.text.body);
  await enviarMensagemMeta(mensagem.from, resposta);
  res.sendStatus(200);
});
```

**Pacote de referência:** `whatsapp-web.js` não precisa mais — usar `axios` direto na Cloud API.

---

## 7. Infraestrutura & DevOps

### Estado Atual
| Item | Estado |
|------|--------|
| Orquestração | PowerShell scripts manuais |
| Processo manager | `node src/app.js` direto |
| Containerização | Sem Docker |
| CI/CD | Sem pipeline |
| Deploy | Manual |

### Lacunas vs Mercado

#### 7.1 PM2 para Gerenciamento de Processos
**PM2** é o padrão Node.js para produção. Zero-downtime restarts, cluster mode, log rotation.

```bash
npm install -g pm2
pm2 start src/app.js --name axion-ia-api --watch
pm2 startup   # inicia com o sistema
pm2 save
```

Substituiria o `iniciar.ps1` para o processo de API em produção.

#### 7.2 Docker + docker-compose
Containerizar para eliminar problemas de ambiente:

```yaml
# docker-compose.yml
services:
  api:
    build: ./axion-ia-api
    ports: ["3100:3100"]
    env_file: .env
    depends_on: [mongo]
  mongo:
    image: mongo:7
    volumes: [mongo_data:/data/db]
  panel:
    build: ./axion-ia-panel
    ports: ["3001:80"]
```

#### 7.3 GitHub Actions — CI/CD
```yaml
# .github/workflows/deploy.yml
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: docker-compose up -d --build
```

#### 7.4 `.env` Validation na Inicialização
Já mencionado na seção 2.5 — crucial para não ter a API subindo silenciosamente sem API key.

---

## 8. Knowledge Base & Treinamento

### Estado Atual
- KB armazenada no MongoDB com embeddings manuais
- Treinamento via `POST /api/treinar`
- Sem versionamento de KB
- Sem métricas de qualidade por entrada

### Lacunas vs Mercado

#### 8.1 Auto-aprendizado com Tickets Resolvidos
Quando um atendente resolve um ticket (no Jitbit), a pergunta + solução devem automaticamente entrar na KB como candidatas a treinamento.

```js
// helpdesk-controller.js — após fechar ticket
if (ticket.fechado && ticket.resolvido) {
  await candidatarParaKB({
    pergunta: ticket.texto_original,
    resposta: ticket.resposta_final,
    modulo: ticket.categoria,
    fonte: 'ticket_resolvido',
    status: 'pendente_revisao'
  });
}
```

#### 8.2 Score de Qualidade por Entrada KB
Rastrear quais entradas da KB geram mais acertos e quais são "miss" (usuário insatisfeito).

```js
// Modelo novo: kb-feedback.model.js
{ kbId, sessionId, util: Boolean, score_original: Number, data: Date }
```

#### 8.3 Deduplicação de Embeddings
Antes de inserir nova entrada na KB, verificar se já existe similar (score >= 0.95) para evitar duplicatas.

---

## 9. OpenAPI / Documentação da API

### Estado Atual
Existe `openapi.json` na raiz mas não está publicado nem integrado.

### Melhorias

#### 9.1 Swagger UI na Própria API
```bash
npm install swagger-ui-express
```

```js
// app.js
import swaggerUi from 'swagger-ui-express';
import openapi from '../openapi.json' assert { type: 'json' };
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
```

Disponível em: `http://localhost:3100/api/docs`

#### 9.2 Geração Automática com `swagger-jsdoc`
Gerar o `openapi.json` automaticamente a partir de comentários JSDoc nos controllers:

```bash
npm install swagger-jsdoc
```

---

## 10. Banco de Dados SQL Server (AxHub · AxTon · AxCross)

### Estado Atual
Consultas SQL diretas via `mssql` em cada controller. Sem ORM, sem query builder.

### Melhorias

#### 10.1 Kysely — Query Builder Type-safe
**Kysely** permite queries SQL type-safe sem ser um ORM pesado. Garante que mudanças de schema quebrem em compile-time (com TypeScript) e não em runtime.

```bash
npm install kysely mssql
```

#### 10.2 Cache de Queries Frequentes (Redis)
Queries de status (`/api/axhub/status`) são chamadas com frequência. Cache Redis de 60s reduziria carga no SQL Server.

```bash
npm install ioredis
```

---

## Matriz de Priorização

| # | Melhoria | Impacto | Esforço | Prioridade |
|---|----------|---------|---------|------------|
| 1 | Streaming de respostas no chat | Alto | Médio | 🔴 Alta |
| 2 | Helmet + Rate Limiting (segurança) | Alto | Baixo | 🔴 Alta |
| 3 | Validação Zod nos controllers | Alto | Baixo | 🔴 Alta |
| 4 | TanStack Query no painel | Alto | Médio | 🔴 Alta |
| 5 | Contexto de conversa (memória de sessão) | Alto | Médio | 🔴 Alta |
| 6 | Structured Outputs (Zod + OpenAI) | Médio | Baixo | 🟡 Média |
| 7 | MongoDB Atlas Vector Search | Alto | Médio | 🟡 Média |
| 8 | Recharts no Dashboard | Médio | Médio | 🟡 Média |
| 9 | Auto-aprendizado com tickets | Alto | Alto | 🟡 Média |
| 10 | PM2 para gerenciamento de processo | Alto | Baixo | 🟡 Média |
| 11 | WhatsApp Cloud API (Meta oficial) | Alto | Alto | 🟡 Média |
| 12 | Algolia DocSearch | Médio | Baixo | 🟡 Média |
| 13 | Shadcn/ui + Tailwind no painel | Médio | Alto | 🟢 Baixa |
| 14 | Docker + docker-compose | Alto | Alto | 🟢 Baixa |
| 15 | Plugin OpenAPI nos portais Docusaurus | Baixo | Baixo | 🟢 Baixa |
| 16 | Model routing (gpt-4o para complexos) | Médio | Baixo | 🟢 Baixa |
| 17 | Web Component para widgets | Médio | Alto | 🟢 Baixa |
| 18 | Swagger UI integrado | Baixo | Baixo | 🟢 Baixa |

---

## Roadmap Sugerido (por Sprint)

### Sprint 1 — Fundação de Segurança (1 semana)
- [ ] Instalar e configurar `helmet` no `app.js`
- [ ] Instalar `express-rate-limit` (60 req/min por IP)
- [ ] Instalar `zod` e validar entrada dos 3 endpoints principais (`/chat`, `/treinar`, `/helpdesk/responder`)
- [ ] Instalar `envalid` para validar `.env` na inicialização

### Sprint 2 — UX de Chat (1 semana)
- [ ] Implementar streaming SSE em `POST /api/chat`
- [ ] Implementar `EventSource` no `Chat.jsx` do painel
- [ ] Adicionar contexto de histórico de sessão ao engine (últimas 5 trocas)

### Sprint 3 — Painel Admin (1–2 semanas)
- [ ] Instalar TanStack Query, substituir calls Axios manuais
- [ ] Instalar `sonner` para notificações toast
- [ ] Adicionar Recharts ao Dashboard (3–4 gráficos: tickets/dia, origem, score médio)
- [ ] Instalar React Hook Form + Zod nas telas de Treinamento e Configurações

### Sprint 4 — IA Upgrade (1 semana)
- [ ] Implementar Structured Outputs no engine com `zodResponseFormat`
- [ ] Migrar busca semântica para MongoDB Atlas Vector Search
- [ ] Implementar model routing (gpt-4o para queries sem KB hit)

### Sprint 5 — Docs & Infraestrutura
- [ ] Integrar Algolia DocSearch nos 3 portais
- [ ] Habilitar Mermaid nos portais Docusaurus
- [ ] Configurar PM2 com `ecosystem.config.js`
- [ ] Publicar Swagger UI em `/api/docs`

### Sprint 6 — WhatsApp & Auto-aprendizado
- [ ] Avaliar migração para WhatsApp Cloud API
- [ ] Implementar candidatura automática de tickets resolvidos para KB
- [ ] Adicionar score de qualidade por entrada KB

---

## Referências

- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)
- [MongoDB Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [TanStack Query v5](https://tanstack.com/query/latest)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Docusaurus Plugin OpenAPI](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs)
- [PM2 Docs](https://pm2.keymetrics.io/)
- [Helmet.js](https://helmetjs.github.io/)
- [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Algolia DocSearch](https://docsearch.algolia.com/)
- [Pino Logger](https://getpino.io/)
