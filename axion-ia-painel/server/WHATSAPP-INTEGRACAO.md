# Integração WhatsApp ↔ Jitbit Helpdesk — Levantamento Técnico

**Projeto:** AxionIA — Módulo WhatsApp  
**Data:** 23/04/2026  
**Versão:** 1.0 — Draft  

---

## 1. Objetivo

Permitir que clientes abram, acompanhem e respondam chamados no Jitbit Helpdesk diretamente via WhatsApp, com suporte da IA AxionIA para triagem, resposta automática e escalamento humano.

---

## 2. Arquitetura Atual (base existente)

```
[Cliente] → [Jitbit Helpdesk] ← polling → [AxionIA API :3100]
                                                   ↕
                                         [AxionIA Painel :3001]
```

Módulos já prontos que serão reaproveitados:

| Módulo | Arquivo | Reaproveitamento |
|---|---|---|
| Abertura de chamado | `jitbit.js → criarTicketUsuario()` | Direto |
| Resposta em chamado | `jitbit.js → responderTicket()` | Direto |
| Classificação IA | `engine.js → gerarResposta()` | Direto |
| Fila de revisão humana | `scheduler.js → fila_revisao` | Expandir |
| Polling automático | `scheduler.js → executarCiclo()` | Expandir |
| Logger histórico | `logger.js` | Direto |

---

## 3. Arquitetura Proposta

```
[WhatsApp Usuário]
        ↕  (HTTPS Webhook)
[Meta Cloud API / Evolution API]
        ↕
[axion-ia-api :3100]
  ├── POST /api/whatsapp/webhook    ← recebe mensagens
  ├── POST /api/whatsapp/send       ← envia mensagens
  └── GET  /api/whatsapp/sessoes    ← lista sessões ativas
        ↕
[whatsapp-service.js]    ← gerencia estado da conversa (MongoDB)
        ↕
[jitbit.js]              ← cria/responde chamados
        ↕
[engine.js]              ← IA para triagem e resposta
```

---

## 4. Opções de Gateway WhatsApp

### Opção A — Meta Cloud API (oficial) ✅ Recomendado
- **Conta:** Meta Business Manager
- **Custo:** Grátis até 1.000 conversas/mês (2026), depois por conversa
- **Tipo:** API REST oficial
- **Webhook:** HTTPS com verificação via token
- **Envio:** `POST https://graph.facebook.com/v19.0/{phone_number_id}/messages`
- **Requisitos:** Número de telefone dedicado, conta Meta Business verificada

### Opção B — Evolution API (open source)
- **Repositório:** `EvolutionAPI/evolution-api`
- **Custo:** Gratuito (self-hosted)
- **Protocolo:** Baileys (unofficial WhatsApp Web API)
- **Risco:** Pode sofrer ban do número pelo WhatsApp
- **Ideal para:** testes e ambientes internos

---

## 5. Fluxo de Conversa (Estado da Máquina)

```
INICIO
  │
  ├── Usuário envia primeira mensagem
  │     → Saudação + menu principal
  │
  ├── [1] Abrir chamado
  │     → Solicitar assunto
  │     → Solicitar descrição
  │     → IA classifica e sugere categoria
  │     → Confirmar e criar no Jitbit
  │     → Enviar número do ticket
  │
  ├── [2] Consultar chamado
  │     → Solicitar número do ticket ou listar os últimos
  │     → Retornar status, técnico e última atualização
  │
  ├── [3] Responder chamado
  │     → Solicitar número do ticket
  │     → Solicitar mensagem
  │     → Postar comentário no Jitbit
  │
  └── [4] Falar com atendente
        → Notificar técnico via Jitbit (tag/atribuição)
        → Colocar na fila humana
```

---

## 6. Modelo de Dados — Sessão WhatsApp (MongoDB)

```js
// Collection: whatsapp_sessoes
{
  _id: ObjectId,
  telefone: "5511999999999",          // número E.164
  nome: "João Silva",                  // nome do contato
  estado: "aguardando_assunto",        // estado atual da conversa
  dadosParciais: {
    assunto: "Erro no relatório",
    descricao: null,
    categoriaId: null,
  },
  ticketAberto: 98765,                 // id do último ticket criado
  ultimaMensagem: ISODate,
  criadoEm: ISODate,
  ativo: true
}
```

**Estados possíveis:**
```
inicio → menu → aguardando_assunto → aguardando_descricao 
       → confirmando_ticket → ticket_criado → consultando → respondendo
```

---

## 7. Arquivos a Criar

| Arquivo | Responsabilidade |
|---|---|
| `src/services/whatsapp.service.js` | Envio de mensagens via Meta API / Evolution |
| `src/whatsapp-controller.js` | Webhook receber, processar e responder |
| `src/models/whatsapp-sessao.model.js` | Schema Mongoose da sessão |
| `src/whatsapp-flow.js` | Máquina de estados da conversa |

**Arquivos a modificar:**

| Arquivo | Alteração |
|---|---|
| `src/routes.js` | Adicionar rotas `/api/whatsapp/*` |
| `src/app.js` | Registrar middleware raw body para validação do webhook Meta |
| `.env` | Adicionar variáveis do WhatsApp |

---

## 8. Variáveis de Ambiente Necessárias

```env
# WhatsApp — Meta Cloud API
WA_PHONE_NUMBER_ID=      # ID do número no Meta
WA_ACCESS_TOKEN=          # Token permanente do app Meta
WA_WEBHOOK_VERIFY_TOKEN=  # Token para verificação do webhook (você define)
WA_BUSINESS_ACCOUNT_ID=   # ID da conta Business

# WhatsApp — Evolution API (alternativa)
# EVOLUTION_API_URL=http://localhost:8080
# EVOLUTION_API_KEY=seu-token
# EVOLUTION_INSTANCE=axion
```

---

## 9. Endpoints da API a Criar

```
GET  /api/whatsapp/webhook           ← verificação do webhook (Meta)
POST /api/whatsapp/webhook           ← receber mensagens
POST /api/whatsapp/send              ← enviar mensagem manual
GET  /api/whatsapp/sessoes           ← listar sessões ativas
GET  /api/whatsapp/sessao/:telefone  ← detalhe de uma sessão
DELETE /api/whatsapp/sessao/:telefone ← encerrar sessão
```

---

## 10. Exemplo de Payload — Webhook Meta (entrada)

```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "5511999999999",
          "text": { "body": "Quero abrir um chamado" },
          "type": "text",
          "timestamp": "1713900000"
        }],
        "contacts": [{ "profile": { "name": "João Silva" } }]
      }
    }]
  }]
}
```

---

## 11. Exemplo de Resposta — Envio via Meta API

```json
POST https://graph.facebook.com/v19.0/{WA_PHONE_NUMBER_ID}/messages
Authorization: Bearer {WA_ACCESS_TOKEN}

{
  "messaging_product": "whatsapp",
  "to": "5511999999999",
  "type": "text",
  "text": { "body": "✅ Chamado #98765 aberto com sucesso!\n\nAssunto: Erro no relatório\nStatus: Aguardando atendimento" }
}
```

---

## 12. Integração com a IA Existente

Ao receber a descrição do chamado, antes de criar no Jitbit:

```
1. engine.gerarResposta(texto) → score, resposta
2. Se score >= 0.85 → responder automaticamente via WhatsApp E criar ticket já com resposta
3. Se score >= 0.65 → criar ticket e enviar sugestão para revisar no painel
4. Se score < 0.65  → criar ticket e colocar na fila de escalamento
```

---

## 13. Painel (axion-ia-panel) — Novas Telas

| Tela | Conteúdo |
|---|---|
| `/whatsapp` | Dashboard: sessões ativas, mensagens recentes, status do webhook |
| `/whatsapp/sessoes` | Lista de conversas com status e telefone |
| `/whatsapp/config` | Configurar tokens Meta API / Evolution |

---

## 14. Checklist de Implementação

### Fase 1 — Infraestrutura (2-3h)
- [ ] Criar conta Meta Business e obter `PHONE_NUMBER_ID` + `ACCESS_TOKEN`
- [ ] Configurar URL do webhook no Meta Dashboard (`/api/whatsapp/webhook`)
- [ ] Criar modelo Mongoose `whatsapp-sessao.model.js`
- [ ] Criar `whatsapp.service.js` com funções `enviarMensagem()` e `enviarMenu()`

### Fase 2 — Lógica de Conversa (3-4h)
- [ ] Criar `whatsapp-flow.js` com máquina de estados
- [ ] Criar `whatsapp-controller.js` com handler do webhook
- [ ] Registrar rotas em `routes.js`
- [ ] Testar abertura de chamado end-to-end

### Fase 3 — IA + Fila (2h)
- [ ] Conectar `engine.gerarResposta()` ao fluxo
- [ ] Adicionar canal `whatsapp` na fila de revisão do `scheduler.js`
- [ ] Notificar técnico via WhatsApp quando escalado

### Fase 4 — Painel (3h)
- [ ] Criar página `/whatsapp` no `axion-ia-panel`
- [ ] Dashboard de sessões e mensagens
- [ ] Tela de configuração dos tokens

---

## 15. Dependências NPM a Instalar

```bash
# Nenhuma dependência adicional necessária para Meta Cloud API
# (usa fetch nativo do Node 18+)

# Opcional: Para Evolution API
npm install @evolution-api/client

# Para validação de assinatura HMAC do webhook Meta
# (já coberto pelo módulo 'crypto' nativo do Node)
```

---

## 16. Segurança

| Ponto | Solução |
|---|---|
| Verificação do webhook | Validar `hub.verify_token` no GET |
| Autenticidade das mensagens | Validar assinatura HMAC-SHA256 no header `X-Hub-Signature-256` |
| Tokens no .env | Nunca expor no frontend; lidos apenas pela API |
| Rate limit | Controlar envios: máximo 80 msg/seg pela Meta API |
| LGPD | Não armazenar conteúdo das mensagens além do necessário para o ticket |

---

## 17. Próximos Passos Imediatos

1. **Confirmar gateway:** Meta Cloud API (oficial) ou Evolution API (open source)?
2. **Número WhatsApp:** definir o número de atendimento da Axion
3. **Criar app no Meta for Developers** em https://developers.facebook.com
4. **Gerar o código** dos 4 arquivos principais após confirmar o gateway escolhido
