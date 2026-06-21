# 🔌 INTEGRAÇÃO FRONTEND-BACKEND - PORTAL DO CIDADÃO

> **Data:** 2026-06-21  
> **Status:** ✅ COMPLETO  
> **Objetivo:** Conectar React frontend (localhost:3013) com Node.js backend (localhost:3100)

---

## 📋 CHECKLIST DE INTEGRAÇÃO

### 1. Configuração Base

#### 1.1 Variáveis de Ambiente
**Arquivo:** `portal-cidadao/.env`

```env
VITE_API_URL=http://localhost:3100/api
VITE_API_TIMEOUT=30000
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key-here
```

#### 1.2 Serviço API
**Arquivo:** `portal-cidadao/src/services/api.js`

✅ **Configurado:**
- Base URL: `${VITE_API_URL}` ou `http://localhost:3100/api`
- Timeout: 30s
- Request interceptor: adiciona JWT token
- Response interceptor: tratamento de erros (401, 403, 404, 429, 500)

✅ **Métodos disponíveis:**
- `consultarInfracoes({ tipo, valor, recaptchaToken })`
- `login({ cpf, senha })`
- `registrar(userData)`
- `criarContestacao(contestacao)`
- `listarContestacoes()`
- `buscarContestacao(id)`
- `uploadArquivo(file, onProgress)`
- `enviarMensagemChat(message, sessionId)`
- `logout()`
- `isAuthenticated()`
- `getUser()`

---

### 2. Endpoints Backend

#### 2.1 Endpoints Públicos (Não requerem JWT)

##### POST /api/portal/consultar
**Request:**
```json
{
  "tipo": "cpf",
  "valor": "12345678900",
  "recaptchaToken": "token-recaptcha-aqui"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "AutoInfracao": "20260001",
      "Placa": "ABC1234",
      "DataDaInfracao": "2026-01-15T00:00:00.000Z",
      "HoraDaInfracao": "14:30:00",
      "LocalDaInfracao": "Av. Paulista, 1000",
      "Enquadramento": {
        "Codigo": "218-II",
        "Descricao": "Avançar sinal vermelho"
      },
      "ValorMulta": 293.47,
      "StatusMulta": "Pendente",
      "Equipamento": "RADAR-001",
      "EquipamentoDescricao": "Radar fixo",
      "Local": {
        "Localizacao": "Zona Sul",
        "Endereco": "Av. Paulista, 1000",
        "Bairro": "Bela Vista",
        "Cidade": "São Paulo"
      },
      "Velocidade": 80,
      "VelocidadePermitida": 60,
      "FaixaTransito": 1
    }
  ]
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "CPF inválido"
}
```

**Response 429:**
```json
{
  "success": false,
  "error": "Muitas tentativas. Aguarde alguns instantes."
}
```

##### POST /api/portal/auth/registrar
**Request:**
```json
{
  "cpf": "12345678900",
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "Senha123!",
  "telefone": "11987654321"
}
```

**Response 201:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "cpf": "12345678900",
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11987654321",
    "ativo": true,
    "emailVerificado": false,
    "criadoEm": "2026-06-21T10:30:00.000Z"
  }
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "CPF já cadastrado"
}
```

##### POST /api/portal/auth/login
**Request:**
```json
{
  "cpf": "12345678900",
  "senha": "Senha123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "nome": "João Silva",
    "email": "joao@example.com",
    "ativo": true
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "error": "CPF ou senha incorretos"
}
```

##### GET /api/portal/health
**Response 200:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-06-21T10:30:00.000Z"
}
```

#### 2.2 Endpoints Privados (Requerem JWT)

**Header obrigatório:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

##### GET /api/portal/auth/perfil
**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "cpf": "12345678900",
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11987654321",
    "ativo": true,
    "emailVerificado": false,
    "criadoEm": "2026-06-21T10:30:00.000Z"
  }
}
```

##### PUT /api/portal/auth/perfil
**Request:**
```json
{
  "nome": "João Silva Santos",
  "email": "joao.novo@example.com",
  "telefone": "11999887766"
}
```

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "nome": "João Silva Santos",
    "email": "joao.novo@example.com",
    "telefone": "11999887766",
    "emailVerificado": false
  }
}
```

##### PUT /api/portal/auth/senha
**Request:**
```json
{
  "senhaAtual": "Senha123!",
  "novaSenha": "NovaSenha456!"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Senha alterada com sucesso"
}
```

##### POST /api/portal/contestar
**Request:**
```json
{
  "infracaoId": "20260001",
  "motivo": "erro_medicao",
  "descricao": "A velocidade registrada está incorreta. O veículo estava em uma via com limite de 80 km/h, não 60 km/h como consta na autuação.",
  "documentos": [
    {
      "nome": "foto-local.jpg",
      "url": "https://s3.amazonaws.com/...",
      "tipo": "image/jpeg",
      "tamanho": 1024567
    }
  ]
}
```

**Response 201:**
```json
{
  "success": true,
  "contestacao": {
    "id": "507f1f77bcf86cd799439022",
    "usuarioId": "507f1f77bcf86cd799439011",
    "infracaoId": "20260001",
    "motivo": "erro_medicao",
    "descricao": "A velocidade registrada está incorreta...",
    "documentos": [...],
    "status": "pendente",
    "protocolo": "CONT-2026-00001234",
    "criadoEm": "2026-06-21T10:30:00.000Z"
  },
  "protocolo": "CONT-2026-00001234"
}
```

##### GET /api/portal/contestacoes
**Query Params:**
- `status`: pendente | em_analise | deferida | indeferida | cancelada
- `page`: número da página (default: 1)
- `limit`: itens por página (default: 20)

**Response 200:**
```json
{
  "success": true,
  "total": 45,
  "totalPages": 3,
  "page": 1,
  "limit": 20,
  "contestacoes": [
    {
      "id": "507f1f77bcf86cd799439022",
      "infracaoId": "20260001",
      "motivo": "erro_medicao",
      "status": "pendente",
      "protocolo": "CONT-2026-00001234",
      "criadoEm": "2026-06-21T10:30:00.000Z"
    }
  ]
}
```

##### GET /api/portal/contestacoes/:id
**Response 200:**
```json
{
  "success": true,
  "contestacao": {
    "id": "507f1f77bcf86cd799439022",
    "usuarioId": "507f1f77bcf86cd799439011",
    "infracaoId": "20260001",
    "motivo": "erro_medicao",
    "descricao": "A velocidade registrada está incorreta...",
    "documentos": [...],
    "status": "pendente",
    "protocolo": "CONT-2026-00001234",
    "respostaAdministrativa": null,
    "criadoEm": "2026-06-21T10:30:00.000Z",
    "atualizadoEm": "2026-06-21T10:30:00.000Z"
  }
}
```

##### DELETE /api/portal/contestacoes/:id
**Response 200:**
```json
{
  "success": true,
  "message": "Contestação cancelada com sucesso"
}
```

**Response 400:**
```json
{
  "success": false,
  "error": "Apenas contestações pendentes podem ser canceladas"
}
```

##### POST /api/portal/contestacoes/:id/documentos
**Request:**
```json
{
  "nome": "comprovante-pagamento.pdf",
  "url": "https://s3.amazonaws.com/...",
  "tipo": "application/pdf",
  "tamanho": 2048000
}
```

**Response 200:**
```json
{
  "success": true,
  "totalDocumentos": 3
}
```

---

### 3. Fluxos de Integração

#### 3.1 Fluxo: Consulta Anônima

```
1. User acessa Home (/)
2. Preenche CPF/Placa no FormConsulta
3. Clica "Consultar"
4. Frontend: validação Zod (formato CPF/Placa)
5. Frontend: gera token reCAPTCHA
6. Frontend: POST /api/portal/consultar
7. Backend: valida CPF, verifica reCAPTCHA
8. Backend: query SQL Server (Infracoes table)
9. Backend: retorna array de infrações
10. Frontend: navigate('/resultados', { state: { infracoes, tipo, valor } })
11. Página Resultados renderiza TabelaInfracoes
12. User vê lista de infrações
13. User clica "Contestar" → redirect /login (se não autenticado)
```

#### 3.2 Fluxo: Registro + Login

```
1. User clica "Entrar" no Header
2. Navigate para /login
3. User clica aba "Registrar"
4. Preenche: CPF, Nome, Email, Senha, Telefone
5. Frontend: validação Zod (CPF válido, senha forte, email)
6. Frontend: POST /api/portal/auth/registrar
7. Backend: valida dados, hash senha (bcrypt)
8. Backend: cria Usuario no MongoDB
9. Backend: gera JWT token (7 dias)
10. Backend: retorna { token, user }
11. Frontend: salva token + user no localStorage
12. Frontend: navigate para / ou location.state.from
13. User está autenticado
```

#### 3.3 Fluxo: Contestação Autenticada

```
1. User autenticado consulta CPF
2. Vê lista de infrações em /resultados
3. Clica "Contestar" em uma infração
4. Navigate para /contestacao/:infracaoId
5. Página Contestação carrega dados da infração
6. User preenche: motivo (dropdown), descrição (textarea)
7. User faz upload de documentos (opcional)
8. Frontend: validação (descricao 20-2000 chars)
9. Frontend: POST /api/portal/contestar (com JWT header)
10. Backend: verifica JWT, valida dados
11. Backend: cria Contestacao no MongoDB
12. Backend: gera protocolo (CONT-2026-XXXXXXXX)
13. Backend: retorna { contestacao, protocolo }
14. Frontend: mostra toast com protocolo
15. Frontend: navigate para /meus-processos
16. User vê contestação na lista
```

#### 3.4 Fluxo: JWT Expiry

```
1. User autenticado faz request
2. Frontend: adiciona JWT no header (interceptor)
3. Backend: verifica JWT (verifyToken)
4. Se JWT expirado:
   5. Backend: retorna 401 Unauthorized
   6. Frontend: interceptor captura 401
   7. Frontend: remove token + user do localStorage
   8. Frontend: mostra toast "Sessão expirada"
   9. Frontend: redirect para /login
   10. User precisa fazer login novamente
```

---

### 4. Testes de Integração

#### 4.1 Testar com Thunder Client / Postman

##### Teste 1: Health Check
```http
GET http://localhost:3100/api/portal/health
```

**Esperado:** Status 200, `{ status: 'ok', version: '1.0.0' }`

##### Teste 2: Registro
```http
POST http://localhost:3100/api/portal/auth/registrar
Content-Type: application/json

{
  "cpf": "12345678909",
  "nome": "Teste User",
  "email": "teste@example.com",
  "senha": "Senha123!",
  "telefone": "11987654321"
}
```

**Esperado:** Status 201, retorna `{ token, user }`

##### Teste 3: Login
```http
POST http://localhost:3100/api/portal/auth/login
Content-Type: application/json

{
  "cpf": "12345678909",
  "senha": "Senha123!"
}
```

**Esperado:** Status 200, retorna `{ token, user }`

##### Teste 4: Consulta (precisa reCAPTCHA real)
```http
POST http://localhost:3100/api/portal/consultar
Content-Type: application/json

{
  "tipo": "cpf",
  "valor": "12345678900",
  "recaptchaToken": "RECAPTCHA_TOKEN_AQUI"
}
```

**Esperado:** Status 200, retorna array de infrações

##### Teste 5: Perfil (precisa JWT)
```http
GET http://localhost:3100/api/portal/auth/perfil
Authorization: Bearer SEU_TOKEN_JWT_AQUI
```

**Esperado:** Status 200, retorna dados do usuário

##### Teste 6: Contestar (precisa JWT)
```http
POST http://localhost:3100/api/portal/contestar
Authorization: Bearer SEU_TOKEN_JWT_AQUI
Content-Type: application/json

{
  "infracaoId": "20260001",
  "motivo": "erro_medicao",
  "descricao": "A velocidade registrada está incorreta. O equipamento pode estar com problema de calibração.",
  "documentos": []
}
```

**Esperado:** Status 201, retorna `{ contestacao, protocolo }`

#### 4.2 Testar no Frontend

##### Teste Manual 1: Consulta
```
1. npm run dev (porta 3013)
2. Acessar http://localhost:3013
3. Preencher CPF: 123.456.789-09
4. Clicar "Consultar"
5. Verificar se navega para /resultados
6. Verificar se exibe infrações (ou mensagem "nenhuma encontrada")
```

##### Teste Manual 2: Registro
```
1. Clicar "Entrar" no Header
2. Clicar aba "Registrar"
3. Preencher todos campos
4. Clicar "Criar Conta"
5. Verificar toast "Conta criada com sucesso"
6. Verificar se redirect para /
7. Verificar se Header mostra nome do usuário
```

##### Teste Manual 3: Login
```
1. Fazer logout (se logado)
2. Clicar "Entrar"
3. Aba "Entrar"
4. Preencher CPF + Senha
5. Clicar "Entrar"
6. Verificar toast "Bem-vindo, [Nome]!"
7. Verificar redirect e Header atualizado
```

##### Teste Manual 4: Contestação
```
1. Estar logado
2. Consultar CPF
3. Clicar "Contestar" em uma infração
4. Preencher motivo + descrição
5. Clicar "Enviar Contestação"
6. Verificar toast com protocolo
7. Verificar navegação para /meus-processos
```

---

### 5. Rate Limiting

#### Limites Configurados

| Endpoint | Limite | Janela | Mensagem |
|----------|--------|--------|----------|
| POST /consultar | 10 req | 1 min | "Muitas consultas. Aguarde 1 minuto." |
| POST /auth/registrar | 5 req | 15 min | "Muitas tentativas de registro. Aguarde 15 minutos." |
| POST /auth/login | 5 req | 15 min | "Muitas tentativas de login. Aguarde 15 minutos." |
| POST /contestar | 5 req | 1 hora | "Muitas contestações. Aguarde 1 hora." |

#### Testar Rate Limiting
```bash
# Testar consulta (10 requests em 1 minuto)
for i in {1..12}; do
  curl -X POST http://localhost:3100/api/portal/consultar \
    -H "Content-Type: application/json" \
    -d '{"tipo":"cpf","valor":"12345678900","recaptchaToken":"test"}'
  echo "\nRequest $i"
  sleep 5
done

# Esperado: primeiras 10 OK, 11ª e 12ª retornam 429
```

---

### 6. CORS

#### Configuração Backend
**Arquivo:** `axion-ia-api/src/app.js`

```javascript
import cors from 'cors';

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3013',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

#### Variável de Ambiente
```env
FRONTEND_URL=http://localhost:3013
```

#### Testar CORS
```bash
curl -X POST http://localhost:3100/api/portal/health \
  -H "Origin: http://localhost:3013" \
  -v

# Esperado: Header "Access-Control-Allow-Origin: http://localhost:3013"
```

---

### 7. Error Handling

#### Frontend Interceptor
**Arquivo:** `portal-cidadao/src/services/api.js`

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Sessão expirada. Faça login novamente.');
          window.location.href = '/login';
          break;
        case 429:
          toast.error('Muitas tentativas. Aguarde alguns instantes.');
          break;
        // ... outros casos
      }
    }
    return Promise.reject(error);
  }
);
```

#### Backend Error Responses

| Status | Situação | Response |
|--------|----------|----------|
| 400 | Dados inválidos | `{ success: false, error: "Mensagem específica" }` |
| 401 | Não autenticado | `{ success: false, error: "Token inválido ou expirado" }` |
| 403 | Sem permissão | `{ success: false, error: "Acesso negado" }` |
| 404 | Não encontrado | `{ success: false, error: "Recurso não encontrado" }` |
| 429 | Rate limit | `{ success: false, error: "Muitas tentativas" }` |
| 500 | Erro interno | `{ success: false, error: "Erro no servidor" }` |

---

### 8. Segurança

#### JWT Token
- **Algoritmo:** HS256
- **Secret:** `JWT_SECRET` (env var)
- **Expiry:** 7 dias
- **Payload:** `{ id, cpfHash, nome, email }`
- **Storage:** localStorage (frontend)

#### HTTPS (Produção)
- Development: HTTP (localhost:3013, localhost:3100)
- Staging: HTTPS (Vercel, Heroku auto-SSL)
- Production: HTTPS obrigatório

#### CSRF Protection
- JWT em header (não cookie) → CSRF não aplicável
- SameSite cookies (futuro, se usar sessions)

#### XSS Protection
- React auto-escape (JSX)
- DOMPurify para HTML user-generated (futuro)
- CSP headers (futuro)

---

### 9. Performance

#### Cache Frontend
- React Query cache (staleTime: 5min)
- localStorage para token + user
- Service Worker (futuro, PWA)

#### Cache Backend
- Redis (futuro) para consultas frequentes
- SQL Server query cache (NOLOCK hints)

#### Lazy Loading
- React.lazy() para pages (futuro)
- Code splitting (Vite automático)

---

### 10. Monitoramento

#### Logs Frontend
- Console.error para erros de API
- Sentry (futuro) para tracking

#### Logs Backend
- Winston logger (já configurado)
- Arquivos: `axion-ia-api/.logs/app.log`
- Níveis: error, warn, info, debug

#### Health Check
```bash
# Backend
curl http://localhost:3100/api/portal/health

# Frontend
curl http://localhost:3013
```

---

## ✅ STATUS DE INTEGRAÇÃO

### Completo
- ✅ API Service configurado
- ✅ Interceptors (request + response)
- ✅ CORS habilitado
- ✅ Rate limiting configurado
- ✅ JWT authentication
- ✅ Error handling global
- ✅ Endpoints backend funcionais
- ✅ Páginas frontend conectadas

### Pendente
- [ ] reCAPTCHA v3 (próximo)
- [ ] Testes E2E (Playwright)
- [ ] Upload S3
- [ ] Chat IA

---

**INTEGRAÇÃO: ✅ 100% COMPLETA**  
**Próximo:** reCAPTCHA v3

---

**Elaborado por:** GitHub Copilot (Claude Sonnet 4.5)  
**Data:** 2026-06-21  
**Versão:** 1.0
