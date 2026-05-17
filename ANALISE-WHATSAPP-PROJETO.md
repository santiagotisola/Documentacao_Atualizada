# 📱 Análise do Projeto WhatsApp — AxionIA

**Data:** 15 de maio de 2026  
**Status:** Em desenvolvimento (Fase 2)  
**Responsável:** AxionIA

---

## 1. Visão Geral

O projeto WhatsApp integra atendimento ao cliente via **WhatsApp com IA automática**, permitindo:

✅ Clientes abrem chamados no Helpdesk via WhatsApp  
✅ Consultar status do chamado em tempo real  
✅ Responder chamados diretamente no chat  
✅ IA classifica e responde automaticamente (quando confiante)  
✅ Escalação humana para casos complexos  

---

## 2. Arquitetura Técnica

### Stack de Tecnologias

```
Frontend (React)
  └─ axion-ia-panel/src/pages/WhatsApp.jsx
     └─ Dashboard de sessões, QR code, envio manual

Backend (Node.js Express)
  ├─ axion-ia-api/src/whatsapp-controller.js
  │  ├─ POST /api/whatsapp/iniciar
  │  ├─ GET  /api/whatsapp/status
  │  ├─ GET  /api/whatsapp/sessoes
  │  ├─ POST /api/whatsapp/send (manual)
  │  └─ DELETE /api/whatsapp/sessao/:telefone
  │
  ├─ axion-ia-api/src/services/whatsapp.service.js
  │  ├─ iniciarWhatsApp()      → Baileys (client WhatsApp)
  │  ├─ enviarMensagem()       → send messages
  │  ├─ obterEstado()          → connection status
  │  └─ obterQR()              → QR code (base64)
  │
  ├─ axion-ia-api/src/whatsapp-flow.js
  │  └─ processarMensagemWA()  → state machine (não encontrado ainda)
  │
  └─ axion-ia-api/src/models/whatsapp-sessao.model.js
     └─ Schema Mongoose (não encontrado ainda)

Database (MongoDB)
  └─ Collection: whatsapp_sessoes
     ├─ telefone
     ├─ nome
     ├─ estado (state machine)
     ├─ dadosParciais (assunto, descrição, categoria)
     ├─ ticketAberto (ID Jitbit)
     └─ ultimaMensagem
```

---

## 3. Status Atual (13 mai 2026)

### ✅ Implementado

- **Controller API** `whatsapp-controller.js` — 65 linhas, endpoints básicos
- **Serviço Baileys** `whatsapp.service.js` — 240+ linhas
  - Conexão via QR code (Baileys library)
  - Recepção de mensagens (texto + imagens)
  - Envio de mensagens
  - Estado da conexão
  - Persistência de autenticação em `src/whatsapp-auth/`

- **Painel React** `WhatsApp.jsx` — 380+ linhas
  - Dashboard com status da conexão
  - Exibição do QR code em base64
  - Lista de sessões ativas
  - Botão para conectar/desconectar
  - Envio manual de mensagens

- **Rotas API** registradas em `routes.js`
  - 6 endpoints operacionais

### ❌ Ainda não implementado

- **whatsapp-flow.js** — Máquina de estados da conversa (ausente)
- **whatsapp-sessao.model.js** — Schema Mongoose (ausente)
- **Webhook para Meta API** — Não há suporte a webhook externo ainda
- **Integração com Jitbit** — Função `processarMensagemWA()` existe mas não tem lógica
- **Fila de Revisão** — Não integrado ao `scheduler.js`
- **Autenticação de Mensagens** — Sem validação de assinatura HMAC

---

## 4. Componentes Principais

### 4.1 Serviço WhatsApp (`whatsapp.service.js`)

**Tecnologia:** Baileys (unofficial WhatsApp Web API)

**Prós:**
- 100% gratuito
- Não requer conta Meta Business
- Funciona com qualquer número de WhatsApp

**Contras:**
- Risco de ban pela Meta (não é oficial)
- Menos confiável que Meta Cloud API
- Ideal apenas para testes/ambiente interno

**Métodos Principais:**

```javascript
iniciarWhatsApp(callback)      // Inicia conexão, exibe QR
enviarMensagem(telefone, texto)  // Envia mensagem
obterEstado()                  // Retorna { status, qr, numero }
obterQR()                      // Retorna QR em base64
```

**Estado da Conexão:**
- `desconectado` → `conectando` → `qr_pendente` → `conectado`

### 4.2 Controller (`whatsapp-controller.js`)

**Endpoints:**

| Método | Rota | Função |
|--------|------|--------|
| POST | `/api/whatsapp/iniciar` | Inicia conexão WhatsApp |
| GET | `/api/whatsapp/status` | Status atual |
| GET | `/api/whatsapp/sessoes` | Lista sessões ativas |
| GET | `/api/whatsapp/sessao/:telefone` | Detalhe de uma sessão |
| DELETE | `/api/whatsapp/sessao/:telefone` | Encerra sessão |
| POST | `/api/whatsapp/send` | Envia mensagem manual |

### 4.3 Painel React (`WhatsApp.jsx`)

**Funcionalidades:**
- Exibe QR code quando em estado `qr_pendente`
- Lista de sessões ativas com últimas mensagens
- Botão "Conectar WhatsApp"
- Envio manual de mensagens
- Status em tempo real
- Tutorial para os 4 passos de uso

**UI/UX:**
- Cards com estilo consistente
- Animação de carregamento
- Feedback visual claro
- Tutoriais integrados

---

## 5. Fluxo de Dados

### Recebimento de Mensagem

```
[Cliente WhatsApp]
  ↓ (mensagem de texto/imagem)
[Baileys (whatsapp.service.js)]
  ↓ messages.upsert event
[eventos detectados]
  ├─ remoteJid: "5511999999999@s.whatsapp.net"
  ├─ msg.message.conversation: "Olá, preciso abrir um chamado"
  └─ msg.pushName: "João Silva"
  ↓
[onMensagem callback] → processarMensagemWA()
  ├─ telefone: "5511999999999"
  ├─ nome: "João Silva"
  └─ texto: "Olá, preciso abrir um chamado"
  ↓
[State Machine — NÃO IMPLEMENTADO]
  └─ TODO: Decidir próximo estado e resposta
```

### Envio de Mensagem

```
[POST /api/whatsapp/send]
  ├─ telefone: "5511999999999"
  └─ mensagem: "✅ Chamado #123 criado"
  ↓
[enviarMensagem(telefone, mensagem)]
  ↓
[Baileys]
  ↓
[WhatsApp] → Cliente
```

---

## 6. Máquina de Estados (PROPOSTA)

Segundo a documentação, o fluxo deveria ser:

```
INICIO
  │
  └─→ Usuário envia primeira mensagem
      └─→ [Estado] "menu_principal"
          └─→ Enviar: "Olá João! O que você precisa?"
              ├─ [1] Abrir chamado
              ├─ [2] Consultar chamado
              ├─ [3] Responder chamado
              └─ [4] Falar com atendente

Abrir Chamado:
  └─→ [Estado] "aguardando_assunto"
      └─→ "Qual é o assunto do seu chamado?"
          └─→ [Estado] "aguardando_descricao"
              └─→ "Descreva o problema"
                  └─→ [Estado] "confirmando"
                      ├─ engine.gerarResposta()
                      ├─ score >= 0.85 → responder automático
                      ├─ score >= 0.65 → sugerir resposta
                      └─ score < 0.65 → escalar para humano
```

---

## 7. Modelos de Dados

### WhatsAppSessao (MongoDB)

```javascript
{
  _id: ObjectId,
  
  // Informações do cliente
  telefone: "5511999999999",        // E.164 format
  nome: "João Silva",                // nome extraído de contactos
  
  // Estado da conversa
  estado: "menu_principal",          // estado atual
  dadosParciais: {
    assunto: "Erro no relatório",   // coletado na conversa
    descricao: null,                // será preenchido depois
    categoriaId: null,              // categoria Jitbit selecionada
    imagemBuffer: null              // se enviou imagem
  },
  
  // Referências
  ticketAberto: 98765,              // ID Jitbit mais recente
  ultimaMensagem: ISODate,          // timestamp última interação
  criadoEm: ISODate,
  
  // Status
  ativo: true                       // false = conversa encerrada
}
```

---

## 8. Problemas Identificados

### ⚠️ Críticos

1. **State Machine Ausente**
   - `whatsapp-flow.js` não existe
   - `processarMensagemWA()` importado mas não implementado
   - Qualquer mensagem recebida é ignorada

2. **Schema Mongoose Ausente**
   - `whatsapp-sessao.model.js` não criado
   - Sessões não são persistidas no MongoDB
   - Sem histórico de conversas

3. **Integração Jitbit Não Existe**
   - Ao receber "preciso abrir um chamado", a API não faz nada
   - Não chama `criarTicketUsuario()` do `jitbit.js`
   - Não responde ao usuário

### 🟡 Melhorias

1. **Sem Validação de Autenticidade**
   - Qualquer pessoa pode enviar mensagem fake para a API
   - Falta validação de assinatura (se usar webhook Meta)

2. **Sem Rate Limiting**
   - Um usuário pode enviar 1000 mensagens e sobrecarregar

3. **Sem Tratamento de Erro**
   - Se Jitbit cair, usuário não é avisado

4. **QR Code Expirado**
   - Se QR expirar, não há reconexão automática (há retry mas pode falhar)

---

## 9. Próximos Passos (Recomendação)

### Fase 1 — Implementação Básica (6-8h)

1. **Criar `whatsapp-sessao.model.js`** ← CRÍTICO
   - Schema com campos: telefone, nome, estado, dadosParciais, ticketAberto, ativo

2. **Criar `whatsapp-flow.js`** ← CRÍTICO
   - Máquina de estados
   - Estados: `inicio`, `menu_principal`, `aguardando_assunto`, `aguardando_descricao`, `confirmando`, `ticket_criado`, `consultando`, `respondendo`
   - Transições entre estados

3. **Conectar Jitbit**
   - `processarMensagemWA()` deve:
     - Salvar mensagem na sessão
     - Avançar estado
     - Chamar `criarTicketUsuario()` quando confirmar
     - Enviar resposta ao usuário

4. **Testar fluxo completo**
   - Abrir chamado do zero
   - Consultar chamado
   - Responder chamado

### Fase 2 — Integração IA (4-5h)

1. Conectar `engine.gerarResposta()` ao fluxo
2. Implementar lógica de score (0.85 / 0.65 / <0.65)
3. Enviar sugestões para fila de revisão

### Fase 3 — Production Readiness (2-3h)

1. Implementar validação de assinatura (HMAC-SHA256)
2. Rate limiting
3. Tratamento de erros robusto
4. Logging detalhado

### Fase 4 — Alternativa (Meta API)

Se quiser migrar de Baileys para Meta Cloud API:
- Requer conta Meta Business verificada
- Webhook externo (HTTPS)
- Mais confiável, menos risco de ban
- ~2-3h de refactoring

---

## 10. Recomendação Final

**Status:** 40% completo

**Próxima ação prioritária:** Implementar `whatsapp-flow.js` + `whatsapp-sessao.model.js`

Uma vez feito, o sistema estará **funcional end-to-end** para abrir chamados via WhatsApp.

Tempo estimado: **8-10 horas** para fase 1 completa.

---

**Gerado por:** GitHub Copilot  
**Arquivo:** ANALISE-WHATSAPP-PROJETO.md
