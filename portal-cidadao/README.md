# 🏛️ Portal do Cidadão - Axion

> Consulte e conteste infrações de trânsito de forma rápida e segura.

## 📋 Sobre

Portal público para cidadãos consultarem infrações de trânsito por CPF ou placa de veículo, contestarem online e acompanharem processos. Remove blocker crítico (exigido em 80% dos editais).

## ✨ Funcionalidades

### MVP Sprint 1 (Atual)
- ✅ **Consulta de Infrações** (CPF/Placa, sem login)
- ✅ **Landing Page** completa com features
- ✅ **Design System** (Tailwind custom)
- ✅ **Header/Footer** responsivos
- 🚧 **Contestação Online** (em desenvolvimento)
- 🚧 **Chat IA** (GPT-4 - em desenvolvimento)
- 🚧 **Autenticação** (JWT - em desenvolvimento)

### Roadmap MVP (8 semanas)
- **Sprint 1** (atual): Frontend base + API consulta
- **Sprint 2**: Auth + Contestação
- **Sprint 3**: Chat IA + WhatsApp
- **Sprint 4**: Multi-tenancy + Deploy

## 🚀 Stack Tecnológico

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling (mobile-first)
- **React Router** - SPA routing
- **React Query** - Server state & cache
- **React Hook Form + Zod** - Forms & validation
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

### Backend (API)
- **Node.js + Express** (já existe em `/axion-ia-api`)
- **MongoDB** - Contestações, usuários, chat
- **SQL Server** - Infrações (base existente)
- **OpenAI GPT-4** - Chat IA
- **AWS S3** - Upload de documentos
- **Google reCAPTCHA v3** - Anti-bot
- **WhatsApp Business API** - Notifications

## 📦 Instalação

```bash
# Clone o repositório
git clone <repo>

# Entre na pasta
cd portal-cidadao

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🔧 Variáveis de Ambiente

```bash
# API Configuration
VITE_API_URL=http://localhost:3100/api
VITE_API_TIMEOUT=30000

# reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_site_key_here

# Feature Flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_WHATSAPP=true

# Environment
VITE_ENV=development
```

## 📂 Estrutura do Projeto

```
portal-cidadao/
├── src/
│   ├── components/
│   │   ├── common/           # Componentes comuns
│   │   │   ├── Layout.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── PrivateRoute.jsx
│   │   └── consulta/         # Componentes de consulta
│   │       └── FormConsulta.jsx
│   ├── pages/                # Páginas/Rotas
│   │   ├── Home.jsx
│   │   ├── Resultados.jsx
│   │   ├── Contestacao.jsx
│   │   ├── Login.jsx
│   │   ├── MeusProcessos.jsx
│   │   └── NotFound.jsx
│   ├── services/             # Integrações
│   │   └── api.js
│   ├── hooks/                # Custom hooks (futuro)
│   ├── utils/                # Utilitários (futuro)
│   ├── styles/               # Estilos globais
│   │   └── index.css
│   ├── App.jsx               # App principal
│   └── main.jsx              # Entry point
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env
```

## 🛣️ Rotas

### Públicas (sem autenticação)
- `/` - Home (landing + formulário consulta)
- `/resultados` - Lista de infrações
- `/login` - Login/Registro

### Privadas (requer JWT)
- `/contestacao/:infracaoId` - Formulário de contestação
- `/meus-processos` - Acompanhamento de contestações

## 🔐 Segurança

- **JWT Authentication** - Token em localStorage
- **reCAPTCHA v3** - Anti-bot nas consultas
- **Rate Limiting** - API limitada (10 req/min)
- **Validação Client** - Zod schemas
- **Máscaras** - CPF/Placa formatados
- **HTTPS Only** - Produção
- **LGPD Compliant** - Criptografia AES-256

## 🎨 Design System

### Cores (Paleta Axion)
- **Primary:** `#0056e0` (azul)
- **Secondary:** `#0ea5e9` (azul claro)
- **Success:** `#22c55e` (verde)
- **Warning:** `#f59e0b` (amarelo)
- **Danger:** `#ef4444` (vermelho)

### Components
- **Buttons:** `btn`, `btn-primary`, `btn-secondary`, etc.
- **Forms:** `form-input`, `form-label`, `form-error`
- **Cards:** `card`, `card-hover`
- **Badges:** `badge`, `badge-success`, etc.
- **Spinners:** `spinner` (loading)

### Responsividade
- **Mobile First:** Design otimizado para mobile
- **Breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navegação:** Menu hamburguer em mobile

## 📡 API Endpoints (Spec)

### Consulta
```javascript
POST /api/portal/consultar
Body: { tipo: 'cpf'|'placa', valor: string, recaptchaToken: string }
Response: Array<Infracao>
```

### Contestação
```javascript
POST /api/portal/contestar
Body: { infracaoId, motivo, documentos[], ... }
Response: { id, status, ... }
```

### Upload
```javascript
POST /api/portal/upload
Body: FormData (multipart/form-data)
Response: { url: string, key: string }
```

### Chat IA
```javascript
POST /api/portal/chat
Body: { message: string, sessionId?: string }
Response: { reply: string, sessionId: string }
```

### Autenticação
```javascript
POST /api/portal/auth/login
Body: { cpf: string, senha: string }
Response: { token: string, user: {...} }

POST /api/portal/auth/registrar
Body: { cpf, nome, email, senha, telefone }
Response: { token: string, user: {...} }
```

## 🧪 Testes (Futuro - Sprint 2)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚀 Build & Deploy

```bash
# Build de produção
npm run build

# Preview do build
npm run preview

# Deploy (Vercel/Netlify)
# Conectar ao GitHub e auto-deploy na branch main
```

## 📊 Métricas de Sucesso

### Técnicas
- ✅ **Load Time:** <2s (primeiro carregamento)
- ✅ **Responsividade:** Mobile, tablet, desktop
- 🎯 **Lighthouse Score:** >90 (performance)
- 🎯 **Acessibilidade:** WCAG 2.1 AA

### Negócio
- 🎯 **Conversão:** 30% consulta → contestação
- 🎯 **Satisfação:** NPS >70
- 🎯 **Adoção:** 80% de editais atendidos

## 📝 Changelog

### [0.1.0] - 2026-06-21
**Adicionado**
- Setup inicial do projeto (Vite + React + Tailwind)
- Página Home com landing page completa
- Header/Footer responsivos com navegação
- Formulário de consulta (CPF/Placa) com máscaras
- Validação client-side (Zod)
- Service API com 8 endpoints spec'd
- Sistema de rotas (6 páginas)
- Private routes com JWT
- Design system completo (Tailwind custom)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Proprietary - Axion Tecnologia © 2026

## 🆘 Suporte

- **Email:** contato@axion.com.br
- **Telefone:** (81) 99999-9999
- **Documentação:** [Ver PRD completo](../PORTAL-CIDADAO-PRD.md)

---

**Desenvolvido com ❤️ pela Axion Tecnologia**
