# 📲 Instalação e Configuração — Chat WhatsApp AxionIA

> Script de implantação do módulo de atendimento via WhatsApp integrado ao Jitbit Helpdesk.
> Permite que clientes abram, consultem e respondam chamados direto pelo WhatsApp.

---

## 1. Pré-requisitos

### Sistema Operacional
- Windows 10+, Ubuntu 20.04+ ou macOS 12+

### Software obrigatório

| Software | Versão mínima | Comando de verificação |
|----------|--------------|----------------------|
| Node.js | 18.x | `node -v` |
| npm | 9.x | `npm -v` |
| MongoDB | 6.x | `mongosh --version` |
| Git | 2.x | `git --version` |

### Serviços externos

| Serviço | Descrição | Obrigatório |
|---------|-----------|-------------|
| Jitbit Helpdesk | Plataforma de tickets (self-hosted ou cloud) | ✅ Sim |
| OpenAI API | Chave de API para respostas inteligentes | ✅ Sim |
| WhatsApp | Número de telefone dedicado para o bot | ✅ Sim |

> ⚠️ **IMPORTANTE**: O número WhatsApp usado no bot será desconectado de qualquer outro WhatsApp Web/Desktop. Use um número dedicado exclusivo para atendimento.

---

## 2. Estrutura de Arquivos

```
seu-projeto/
├── .env                                    # Configurações (criar a partir do .env.example)
├── .env.example                            # Template de configurações
├── package.json                            # Dependências Node.js
├── src/
│   ├── app.js                              # Servidor Express principal
│   ├── routes.js                           # Registro de rotas
│   ├── auth.js                             # Middleware de autenticação (opcional)
│   ├── jitbit.js                           # Integração Jitbit API (REST)
│   ├── engine.js                           # Motor IA (classificação + OpenAI)
│   ├── classifier.js                       # Classificador por keywords (kb.json)
│   ├── prompt.js                           # System prompts para OpenAI
│   ├── kb.json                             # Knowledge base (pares pergunta/resposta)
│   ├── whatsapp-controller.js              # Endpoints REST do WhatsApp
│   ├── whatsapp-flow.js                    # Máquina de estados da conversa
│   ├── helpdesk-controller.js              # Endpoints do Helpdesk
│   ├── config-controller.js                # Gerenciamento de .env via API
│   ├── scheduler.js                        # Polling automático Jitbit
│   ├── logger.js                           # Logger de interações (MongoDB)
│   ├── services/
│   │   ├── whatsapp.service.js             # Cliente Baileys (conexão WA)
│   │   └── search.js                       # Busca semântica por embeddings
│   ├── models/
│   │   ├── whatsapp-sessao.model.js        # Schema MongoDB sessões WA
│   │   └── log.model.js                    # Schema MongoDB logs de interação
│   └── whatsapp-auth/                      # Sessão persistente (auto-criado)
└── painel/                                 # (Opcional) Frontend React
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── services/api.js
        └── pages/WhatsApp.jsx
```

> **Dependências entre arquivos:**
> ```
> whatsapp-controller.js
>   └── whatsapp.service.js (conexão Baileys)
>   └── whatsapp-flow.js (processa cada mensagem)
>         ├── jitbit.js (cria/consulta tickets)
>         ├── engine.js → classifier.js → kb.json
>         │              → prompt.js
>         │              → services/search.js
>         ├── logger.js → models/log.model.js
>         └── models/whatsapp-sessao.model.js
> ```

---

## 3. Instalação — Backend (API)

### 3.1 Clonar/Copiar o projeto

```bash
# Se repositório Git:
git clone <url-do-repositorio> meu-whatsapp-bot
cd meu-whatsapp-bot

# Ou copiar os arquivos manualmente para a pasta
```

### 3.2 Instalar dependências

```bash
npm install
```

**Dependências essenciais** (referência para `package.json`):

```json
{
  "name": "whatsapp-helpdesk-bot",
  "version": "1.0.0",
  "type": "module",
  "main": "src/app.js",
  "scripts": {
    "start": "node --env-file=.env src/app.js"
  },
  "dependencies": {
    "@whiskeysockets/baileys": "^7.0.0-rc.9",
    "axios": "^1.14.0",
    "cosine-similarity": "^1.0.1",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "express-rate-limit": "^8.4.1",
    "helmet": "^8.1.0",
    "mongoose": "^9.3.3",
    "multer": "^2.1.1",
    "node-cron": "^4.2.1",
    "openai": "^4.0.0",
    "qrcode": "^1.5.4",
    "qrcode-terminal": "^0.12.0",
    "sharp": "^0.34.5"
  }
}
```

### 3.3 Criar arquivo `.env`

```bash
# Copiar template e editar:
cp .env.example .env
```

**Conteúdo do `.env`:**

```env
# ═══════════════════════════════════════════
# API Server
# ═══════════════════════════════════════════
PORT=3100
CORS_ORIGIN=http://localhost:3001

# ═══════════════════════════════════════════
# MongoDB (obrigatório — armazena sessões)
# ═══════════════════════════════════════════
MONGO_URI=mongodb://localhost:27017/whatsapp-helpdesk

# ═══════════════════════════════════════════
# OpenAI (obrigatório — respostas inteligentes)
# ═══════════════════════════════════════════
OPENAI_API_KEY=sk-proj-SUA_CHAVE_AQUI

# ═══════════════════════════════════════════
# Jitbit Helpdesk (obrigatório — gestão de tickets)
# ═══════════════════════════════════════════
# URL base inclui /helpdesk (NÃO a página de login!)
# Exemplo: https://meuhelpdesk.com.br/helpdesk
JITBIT_URL=https://SEU-DOMINIO.com.br/helpdesk
JITBIT_USER=admin@empresa.com.br
# ⚠️ Se a senha contém # use aspas: "Senha#123"
JITBIT_PASS="SuaSenha#Segura"

# ═══════════════════════════════════════════
# Autenticação API (opcional — protege endpoints)
# ═══════════════════════════════════════════
# API_TOKEN=token-seguro-aleatorio

# ═══════════════════════════════════════════
# Polling Jitbit (opcional)
# ═══════════════════════════════════════════
# POLLING_INTERVAL=2
```

> ### ⚠️ CUIDADOS CRÍTICOS no `.env`
>
> | Problema | Causa | Solução |
> |----------|-------|---------|
> | Senha truncada | Caractere `#` tratado como comentário | Usar aspas: `JITBIT_PASS="Senha#123"` |
> | 401 Unauthorized | URL errada (sem `/helpdesk`) | `JITBIT_URL=https://dominio.com.br/helpdesk` |
> | Rate-limit (400) | Muitas tentativas com senha errada | Aguardar 5 minutos |

### 3.4 Verificar MongoDB

```bash
# Verificar se MongoDB está rodando:
mongosh --eval "db.runCommand({ping:1})"

# Caso não esteja rodando (Windows):
net start MongoDB

# Linux/macOS:
sudo systemctl start mongod
```

### 3.5 Iniciar a API

```bash
# Opção 1 — Usando npm:
npm start

# Opção 2 — Diretamente:
cd src && node app.js

# Opção 3 — Entrar na pasta e rodar:
node --env-file=.env src/app.js
```

**Saída esperada:**
```
📦 MongoDB conectado: mongodb://localhost:27017/whatsapp-helpdesk
🚀 API rodando na porta 3100
⏱️  Polling Jitbit ativado — intervalo: 2min
🔑 Jitbit auth: Basic Auth
```

---

## 4. Instalação — Frontend (Painel) — Opcional

O painel React permite gerenciar o WhatsApp visualmente (conectar, ver sessões, enviar mensagens).

### 4.1 Instalar dependências do painel

```bash
cd painel
npm install
```

**Dependências do painel** (`painel/package.json`):

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "axios": "^1.7.9"
  },
  "devDependencies": {
    "vite": "^6.4.1",
    "@vitejs/plugin-react": "^4.5.2"
  }
}
```

### 4.2 Configurar URL da API

No arquivo `painel/src/services/api.js`:

```javascript
const DEFAULT_API_URL = "http://localhost:3100/api";
```

Se a API rodar em outro servidor/porta, alterar essa constante.

### 4.3 Iniciar o painel

```bash
npm run dev
```

Acesse: **http://localhost:3001/whatsapp**

---

## 5. Configuração WhatsApp — Primeira Conexão

### 5.1 Via Painel (recomendado)

1. Acesse `http://localhost:3001/whatsapp`
2. Clique no botão **"Conectar WhatsApp"**
3. O QR code aparecerá na tela (e no terminal da API)
4. Abra o WhatsApp no celular → **Dispositivos conectados** → **Conectar dispositivo**
5. Escaneie o QR code
6. Status mudará para ✅ **Conectado**

### 5.2 Via API (sem painel)

```bash
# Iniciar conexão:
curl -X POST http://localhost:3100/api/whatsapp/iniciar

# Verificar status (aguardar QR):
curl http://localhost:3100/api/whatsapp/status

# O QR code será exibido no terminal onde a API está rodando
# Escaneie com o celular
```

### 5.3 Sessão Persistente

Após a primeira conexão, a sessão é salva em `src/whatsapp-auth/`. Na próxima vez que a API iniciar e o `POST /whatsapp/iniciar` for chamado, a reconexão é automática (sem novo QR).

> ⚠️ Se trocar de número ou a sessão expirar, delete a pasta `src/whatsapp-auth/` e reconecte.

---

## 6. Fluxo de Atendimento

### Máquina de Estados

```
[Cliente envia mensagem]
         │
         ▼
    ┌─────────┐
    │  INÍCIO  │ → Saudação + Menu principal
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │   MENU   │ ← O cliente digita 1, 2, 3, 4 ou 0
    └────┬────┘
         │
    ┌────┼────────────┬──────────────┬──────────────┐
    ▼    ▼            ▼              ▼              ▼
   [1]  [2]          [3]            [4]            [0]
 ABRIR  CONSULTAR    RESPONDER     FAQ/DÚVIDA    ATENDENTE
CHAMADO  STATUS      CHAMADO                     HUMANO
    │
    ▼
 Assunto → Sistema → Descrição → Categoria → Foto? → Confirmação
    │                                                      │
    ▼                                                      ▼
 Ticket criado no Jitbit ← ──────────────────────── IA classifica
```

### 16 Estados da Conversa

| Estado | Descrição |
|--------|-----------|
| `inicio` | Primeiro contato — exibe saudação |
| `menu` | Menu principal (5 opções) |
| `aguardando_assunto` | Abertura: pede assunto do chamado |
| `aguardando_sistema` | Abertura: pede sistema (AxHub/AxTon/AxCross) |
| `aguardando_descricao` | Abertura: pede descrição detalhada |
| `aguardando_categoria` | Abertura: pede categoria do ticket |
| `aguardando_foto` | Abertura: pergunta se quer anexar foto |
| `confirmando_ticket` | Abertura: confirma dados antes de criar |
| `ticket_criado` | Ticket criado com sucesso |
| `consultando_numero` | Consulta: pede nº do ticket |
| `respondendo_numero` | Resposta: pede nº do ticket |
| `respondendo_mensagem` | Resposta: pede texto da resposta |
| `aguardando_modulo_duvida` | FAQ: pede módulo (AxHub/AxTon/AxCross) |
| `aguardando_duvida` | FAQ: pede a pergunta |
| `respondendo_duvida` | FAQ: IA respondendo |
| `encerrado` | Sessão finalizada |

### Sessões no MongoDB

As sessões são salvas automaticamente e expiram em **24 horas** (TTL index). Schema:

```javascript
{
  telefone:      "5562991092135",     // E.164 sem +
  nome:          "João Silva",        // Nome do contato WA
  estado:        "menu",              // Estado atual
  dadosParciais: {
    assunto:      "Problema no radar",
    sistema:      "AxHub",
    descricao:    null,
    categoriaId:  123,
    categoriaNome:"Suporte Técnico",
    ticketId:     98705,
    temFoto:      false
  },
  ultimoTicketId: 98705,
  ultimaMensagem: "2026-05-15T18:00:00Z",
  ativo:          true
}
```

---

## 7. Endpoints da API

### WhatsApp

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/whatsapp/iniciar` | Inicia conexão WhatsApp (QR code) |
| `GET` | `/api/whatsapp/status` | Status da conexão (`desconectado\|conectando\|qr_pendente\|conectado`) |
| `GET` | `/api/whatsapp/sessoes` | Lista sessões ativas (max 100) |
| `GET` | `/api/whatsapp/sessao/:telefone` | Detalhes de uma sessão |
| `DELETE` | `/api/whatsapp/sessao/:telefone` | Encerra/reseta sessão |
| `POST` | `/api/whatsapp/send` | Envia mensagem manual `{ telefone, mensagem }` |

### Helpdesk (Jitbit)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/helpdesk/tickets` | Lista tickets (`?mode=0&count=50`) |
| `GET` | `/api/helpdesk/ticket/:id` | Detalhes de um ticket |
| `GET` | `/api/helpdesk/categorias` | Lista categorias disponíveis |
| `POST` | `/api/helpdesk/ticket/:id/responder` | Responde um ticket |

### Configuração

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/config` | Lista configurações atuais |
| `PUT` | `/api/config` | Atualiza configurações |

---

## 8. Integração em Outro Sistema

### 8.1 Apenas Backend (sem painel)

Se você quer integrar o WhatsApp em um sistema existente, precisa apenas:

**Arquivos obrigatórios a copiar:**

```
# Core WhatsApp
src/services/whatsapp.service.js     # Conexão Baileys
src/whatsapp-flow.js                 # Máquina de estados
src/whatsapp-controller.js           # Endpoints REST
src/models/whatsapp-sessao.model.js  # Schema MongoDB sessões

# Integração Jitbit
src/jitbit.js                        # API REST Jitbit

# Motor IA (todas necessárias)
src/engine.js                        # Orquestrador IA
src/classifier.js                    # Classificador por keywords
src/prompt.js                        # System prompts OpenAI
src/kb.json                          # Knowledge base
src/services/search.js               # Busca semântica

# Suporte
src/logger.js                        # Logger de interações
src/models/log.model.js              # Schema MongoDB logs
```

**Registrar rotas no seu Express:**

```javascript
import {
  iniciarConexao,
  statusConexao as waStatus,
  listarSessoes,
  detalhesSessao,
  encerrarSessao,
  enviarManual
} from "./whatsapp-controller.js";

// Adicionar ao seu router Express:
router.post("/whatsapp/iniciar", iniciarConexao);
router.get("/whatsapp/status", waStatus);
router.get("/whatsapp/sessoes", listarSessoes);
router.get("/whatsapp/sessao/:telefone", detalhesSessao);
router.delete("/whatsapp/sessao/:telefone", encerrarSessao);
router.post("/whatsapp/send", enviarManual);
```

**Dependências adicionais no seu `package.json`:**

```bash
npm install @whiskeysockets/baileys qrcode qrcode-terminal mongoose openai cosine-similarity dotenv sharp
```

### 8.2 Com Painel (React)

**Arquivo a copiar:**

```
painel/src/pages/WhatsApp.jsx    # Componente completo
```

**Registrar rota no seu React Router:**

```jsx
import WhatsApp from "./pages/WhatsApp";

// No seu <Routes>:
<Route path="/whatsapp" element={<WhatsApp />} />
```

**Adicionar link na navegação:**

```jsx
<NavLink to="/whatsapp">💬 WhatsApp</NavLink>
```

O componente usa apenas `axios` e espera um client configurado em `../services/api.js`:

```javascript
import axios from "axios";
export const api = axios.create({
  baseURL: "http://SEU-SERVIDOR:3100/api"
});
```

### 8.3 Via Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY src/ ./src/
COPY .env .env
EXPOSE 3100
CMD ["node", "src/app.js"]
```

```yaml
# docker-compose.yml
services:
  whatsapp-bot:
    build: .
    ports:
      - "3100:3100"
    env_file: .env
    depends_on:
      - mongo
    volumes:
      - wa-auth:/app/src/whatsapp-auth
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  wa-auth:
  mongo-data:
```

---

## 9. Testes de Validação

### 9.1 Checklist pós-instalação

```bash
# 1. API respondendo?
curl http://localhost:3100/
# Esperado: JSON com versão e endpoints

# 2. MongoDB conectado?
# Verificar log: "📦 MongoDB conectado: mongodb://..."

# 3. Jitbit autenticando?
curl http://localhost:3100/api/helpdesk/categorias
# Esperado: JSON array com categorias (NÃO 401)

# 4. Iniciar WhatsApp:
curl -X POST http://localhost:3100/api/whatsapp/iniciar
# Esperado: { "ok": true, "mensagem": "Iniciando WhatsApp..." }

# 5. Verificar QR:
curl http://localhost:3100/api/whatsapp/status
# Esperado: { "status": "qr_pendente", "qr_base64": "data:image/..." }

# 6. Após escanear QR:
curl http://localhost:3100/api/whatsapp/status
# Esperado: { "status": "conectado", "numero": "55..." }

# 7. Enviar mensagem teste:
curl -X POST http://localhost:3100/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"telefone":"5511999999999","mensagem":"Teste de integração"}'
# Esperado: { "ok": true }
```

### 9.2 Teste de fluxo completo

1. Envie qualquer mensagem para o número do bot
2. Bot responde com saudação + menu
3. Digite `1` (Abrir chamado)
4. Informe assunto, sistema, descrição
5. Escolha categoria, opte por foto ou não
6. Confirme com `S`
7. Verifique no Jitbit se o ticket foi criado

---

## 10. Troubleshooting

| Sintoma | Causa provável | Solução |
|---------|---------------|---------|
| `401 Unauthorized` no Jitbit | URL sem `/helpdesk` ou senha truncada | Verificar `.env`: URL deve ter `/helpdesk`, senha com `#` precisa de aspas |
| `Too many invalid logins` | Rate-limit por tentativas erradas | Aguardar 5 minutos, corrigir credenciais, reiniciar |
| `EADDRINUSE: port 3100` | Processo anterior ainda rodando | `taskkill /F /PID <pid>` (Win) ou `kill -9 <pid>` (Linux) |
| QR code não aparece | WhatsApp já autenticado | Verificar `status` — pode já estar `conectado` |
| QR code expira | Demorou para escanear | Chamar `POST /whatsapp/iniciar` novamente |
| Sessão perdida após reiniciar | Pasta `whatsapp-auth/` foi deletada | Reconectar escaneando novo QR |
| Mensagens não processadas | `whatsapp-flow.js` não conectado | Verificar import de `processarMensagemWA` no controller |
| Bot não responde | Número bloqueado pelo WhatsApp | Usar número comercial verificado; evitar spam |
| `MODULE_NOT_FOUND` | Dependências não instaladas | `npm install` na raiz do projeto |
| MongoDB não conecta | Serviço não está rodando | Iniciar MongoDB antes da API |

---

## 11. Segurança — Recomendações

- [ ] Definir `API_TOKEN` no `.env` para proteger endpoints administrativos
- [ ] Usar HTTPS (Nginx reverse proxy) em produção
- [ ] Não expor porta 3100 diretamente na internet
- [ ] Rotacionar credenciais Jitbit periodicamente
- [ ] Limitar CORS_ORIGIN ao domínio do painel
- [ ] Fazer backup da pasta `whatsapp-auth/` (contém sessão do WhatsApp)
- [ ] Monitorar logs para detectar uso abusivo
- [ ] Considerar migração para Meta Cloud API (mais estável que Baileys) para produção

---

## 12. Comandos Rápidos

```bash
# Iniciar tudo (API + Painel):
cd api && node src/app.js &
cd painel && npm run dev &

# Parar tudo:
pkill -f "node src/app.js"    # Linux/macOS
taskkill /FI "WINDOWTITLE eq node*" /F   # Windows

# Ver sessões ativas:
curl -s http://localhost:3100/api/whatsapp/sessoes | jq '.total'

# Encerrar sessão específica:
curl -X DELETE http://localhost:3100/api/whatsapp/sessao/5511999999999

# Reconectar WhatsApp (novo QR):
rm -rf src/whatsapp-auth/
curl -X POST http://localhost:3100/api/whatsapp/iniciar

# Testar Jitbit:
curl -s http://localhost:3100/api/helpdesk/categorias | jq '.[0]'
```

---

## 13. Personalização

### 13.1 Alterar menu do bot

Edite a constante `MENU` em `src/whatsapp-flow.js`:

```javascript
const MENU = `Olá! Sou o assistente da *SUA EMPRESA* 🤖

Como posso ajudar?

*1* — Abrir novo chamado
*2* — Consultar chamado
*3* — Responder chamado
*4* — Dúvidas do Sistema
*0* — Falar com atendente`;
```

### 13.2 Alterar knowledge base

Edite `src/kb.json` com pares de pergunta/resposta do seu domínio:

```json
[
  {
    "pergunta": "como resetar senha",
    "resposta": "Acesse Configurações > Usuários > Redefinir Senha.",
    "modulo": "Geral",
    "tags": ["senha", "reset", "acesso"]
  }
]
```

### 13.3 Alterar sistemas disponíveis

No `whatsapp-flow.js`, busque a mensagem enviada no estado `aguardando_sistema` e edite as opções (ex: trocar AxHub/AxTon/AxCross pelos sistemas do seu cliente).

### 13.4 Alterar prompts de IA

Edite `src/prompt.js` para ajustar tom, contexto e instruções do GPT:

```javascript
export const systemPrompt = `Você é o assistente de suporte da EMPRESA X.
Responda de forma técnica e objetiva sobre os sistemas: ...
`;

export const whatsappPrompt = `Responda em no máximo 3 frases.
Seja direto e use linguagem informal.
`;
```

---

## 14. Exemplo de Conversa

```
👤 Cliente: Oi
🤖 Bot:    Olá! Sou o assistente da Axion Tecnologia 🤖
           Como posso ajudar?
           1 — Abrir novo chamado
           2 — Consultar chamado
           3 — Responder chamado
           4 — Dúvidas do Sistema
           0 — Falar com atendente

👤 Cliente: 1
🤖 Bot:    Qual o *assunto* do chamado? (ex: "Radar não transmite imagens")

👤 Cliente: Câmera offline no ponto T1001
🤖 Bot:    Qual o *sistema*?
           1 — AxHub
           2 — AxTon
           3 — AxCross
           4 — Outro

👤 Cliente: 1
🤖 Bot:    Descreva o problema com detalhes:

👤 Cliente: A câmera do ponto T1001 parou de enviar imagens desde ontem.
           Já reiniciei o equipamento mas não voltou.
🤖 Bot:    Escolha a *categoria*:
           1 — Suporte Técnico
           2 — Manutenção
           3 — Dúvida
           ...

👤 Cliente: 1
🤖 Bot:    Deseja anexar uma *foto*? (S/N)

👤 Cliente: N
🤖 Bot:    📋 Confirme os dados do chamado:
           *Assunto:* Câmera offline no ponto T1001
           *Sistema:* AxHub
           *Descrição:* A câmera do ponto T1001 parou...
           *Categoria:* Suporte Técnico

           Confirma? (S/N)

👤 Cliente: S
🤖 Bot:    ✅ Chamado #98712 criado com sucesso!
           Acompanhe pelo Jitbit ou envie "2" para consultar.
```

---

**Versão:** 1.0 — Maio 2026
**Stack:** Node.js 18+ · Express · Baileys · MongoDB · React 18 · Jitbit Helpdesk
