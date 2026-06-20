# 🎯 Axion IA Painel

**Intelligence Hub** - Plataforma unificada de automação inteligente

---

## 📋 Sobre o Projeto

**Axion IA Painel** é uma plataforma completa que integra:

- ✅ **Frontend React** (Vite + React Router)
- ✅ **Backend Node.js** (Express + MongoDB + SQL Server)
- ✅ **Validação Visual** de sistemas web
- ✅ **Knowledge Base** com IA
- ✅ **Integração WhatsApp**
- ✅ **Portais de Documentação** (AxHub, AxTon, AxCross)

---

## 🏗️ Estrutura do Projeto

```
axion-ia-painel/
├── client/              # Frontend React + Vite
│   ├── src/
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── App.jsx      # App principal
│   │   └── main.jsx     # Entry point
│   ├── public/          # Assets estáticos
│   ├── package.json     # Dependências frontend
│   └── vite.config.js   # Configuração Vite
│
├── server/              # Backend Node.js + Express
│   ├── src/
│   │   ├── app.js       # Servidor Express
│   │   ├── routes.js    # Rotas da API
│   │   ├── auth.js      # Autenticação
│   │   ├── visual-validation-controller.js  # Validação com Playwright
│   │   └── scripts/     # Scripts auxiliares
│   ├── screenshots/     # Screenshots de validação
│   ├── reports/         # Relatórios JSON
│   ├── uploads/         # Uploads de arquivos
│   ├── .env             # Variáveis de ambiente
│   └── package.json     # Dependências backend
│
├── package.json         # Root package (scripts unificados)
└── README.md           # Este arquivo
```

---

## 🚀 Instalação

### **Pré-requisitos**
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (local ou Atlas)
- SQL Server (opcional)

### **1. Instalar dependências**
```bash
# Na raiz do projeto
npm run install:all
```

Isso instala:
- Dependências raiz (concurrently, rimraf)
- Dependências do client (React, Vite, etc)
- Dependências do server (Express, Playwright, etc)

### **2. Configurar variáveis de ambiente**
```bash
cd server
cp .env.example .env
# Edite .env com suas configurações
```

Variáveis principais:
```env
PORT=3100
MONGO_URI=mongodb://localhost:27017/axion-ia
SQL_SERVER=seu-servidor
SQL_DATABASE=AxHub
SQL_USER=usuario
SQL_PASSWORD=senha
OPENAI_API_KEY=sk-...
BEARER_TOKEN=seu-token-secreto
```

---

## 🎬 Como Usar

### **Desenvolvimento (Frontend + Backend simultâneos)**
```bash
npm run dev
```

Isso inicia:
- ✅ Frontend em `http://localhost:3017`
- ✅ Backend em `http://localhost:3100`

### **Apenas Frontend**
```bash
npm run dev:client
```

### **Apenas Backend**
```bash
npm run dev:server
```

### **Build para Produção**
```bash
npm run build
```

### **Iniciar em Produção**
```bash
npm start
```

---

## 🌐 Portas

| Serviço | Porta | URL |
|---------|-------|-----|
| **Frontend (Panel)** | 3017 | http://localhost:3017 |
| **Backend (API)** | 3100 | http://localhost:3100 |
| **AxHub Docs** | 3010 | http://localhost:3010/AxHub.Docs |
| **AxTon Docs** | 3011 | http://localhost:3011/AxTon.Docs |
| **AxCross Docs** | 3012 | http://localhost:3012/AxCross.Docs |

---

## 📦 Funcionalidades

### **1. Gerenciador de Validação Visual**

Sistema automatizado de testes que valida:
- ✅ Navegação completa (todas as rotas)
- ✅ Formulários (campos, validações, limites)
- ✅ CRUD (Create, Read, Update, Delete)
- ✅ Screenshots de cada tela
- ✅ Ortografia (português)
- ✅ Dependências entre formulários

**Acesso:** http://localhost:3017/visual-validation

### **2. Intelligence Hub**

Dashboard principal com:
- 📊 Estatísticas em tempo real
- 🤖 Chat IA integrado
- 📚 Knowledge Base
- 📋 Helpdesk Jitbit
- 🎓 Treinamentos

**Acesso:** http://localhost:3017/

### **3. API RESTful**

Endpoints disponíveis:

#### **Validação Visual**
```http
POST   /api/visual-validation/start
GET    /api/visual-validation/status/:id
GET    /api/visual-validation/report/:id
GET    /api/visual-validation/screenshot/:filename
GET    /api/visual-validation/list
```

#### **Knowledge Base**
```http
POST   /api/kb/search        # Buscar na KB
POST   /api/kb/add           # Adicionar documento
GET    /api/kb/list          # Listar documentos
DELETE /api/kb/delete/:id    # Remover documento
```

#### **Chat IA**
```http
POST   /api/chat             # Enviar mensagem para IA
GET    /api/chat/logs        # Histórico de conversas
```

#### **WhatsApp**
```http
POST   /api/whatsapp/send    # Enviar mensagem
GET    /api/whatsapp/status  # Status da conexão
GET    /api/whatsapp/qr      # QR Code para autenticar
```

---

## 🔧 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia frontend + backend simultâneos |
| `npm run dev:client` | Apenas frontend (React) |
| `npm run dev:server` | Apenas backend (API) |
| `npm run build` | Build do frontend para produção |
| `npm start` | Inicia servidor em produção |
| `npm run install:all` | Instala todas as dependências |
| `npm run clean` | Remove node_modules e dist |

---

## 🛠️ Tecnologias

### **Frontend**
- ⚛️ React 18.3
- ⚡ Vite 6.0
- 🎨 Lucide React (ícones)
- 📊 Recharts (gráficos)
- 🔗 React Router Dom
- 📡 Axios
- 🎭 React Hook Form

### **Backend**
- 🟢 Node.js 25.8
- 🚂 Express 4.18
- 🗄️ MongoDB (Mongoose)
- 💾 SQL Server (mssql)
- 🤖 OpenAI API
- 🎭 Playwright (automação)
- 📱 WhatsApp (Baileys)
- 📄 PDF/Word parsing
- 🔐 Helmet + Rate Limiting

---

## 📝 Desenvolvimento

### **Estrutura de Arquivos Frontend**
```
client/src/
├── pages/
│   ├── Home.jsx                       # Dashboard principal
│   ├── ValidationManager.jsx          # Gerenciador simples
│   ├── VisualValidationManager.jsx    # Validação visual completa
│   ├── KnowledgeBase.jsx              # Base de conhecimento
│   └── Training.jsx                   # Treinamentos
├── App.jsx                            # Rotas e layout
├── main.jsx                           # Entry point
└── index.css                          # Estilos globais
```

### **Estrutura de Arquivos Backend**
```
server/src/
├── app.js                             # Servidor Express
├── routes.js                          # Definição de rotas
├── auth.js                            # Middleware de autenticação
├── chat-controller.js                 # Controlador de chat IA
├── visual-validation-controller.js    # Controlador de validação
├── whatsapp-service.js                # Serviço WhatsApp
└── scripts/
    └── seed-kb.js                     # Popular KB inicial
```

---

## 🔐 Segurança

- ✅ **Bearer Token** para autenticação de API
- ✅ **Helmet** para headers de segurança
- ✅ **Rate Limiting** contra DDoS
- ✅ **CORS** configurado
- ✅ **Validação** de inputs com Zod
- ✅ **Sanitização** de dados

---

## 📊 Monitoramento

### **Logs**
```bash
# Logs do servidor
tail -f server/logs/app.log

# Logs do chat
tail -f server/logs/chat.log
```

### **Status da API**
```bash
curl http://localhost:3100/api/health
```

---

## 🚀 Deploy

### **Produção**
1. Build do frontend:
```bash
npm run build
```

2. Configurar variáveis de ambiente no servidor

3. Iniciar servidor:
```bash
npm start
```

### **Docker** (Opcional)
```bash
docker-compose up -d
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

MIT License - Axion Tecnologia © 2026

---

## 📞 Suporte

- 📧 Email: contato@axiontecnologia.com.br
- 🌐 Site: https://axiontecnologia.com.br
- 🎫 Helpdesk: https://desk.axiontecnologia.com.br/helpdesk

---

## ✨ Changelog

### **v3.0.0** (2026-06-20) - Projeto Unificado
- ✅ Unificação de frontend e backend em um único repositório
- ✅ Estrutura client/server organizada
- ✅ Scripts unificados com concurrently
- ✅ Documentação completa atualizada

### **v2.0.0** (2026-06-19) - Validação Visual
- ✅ Gerenciador de Validação Visual completo
- ✅ Interface limpa sem dados zerados
- ✅ Validação com Playwright
- ✅ Screenshots automáticos

### **v1.0.0** (2026-06) - Lançamento Inicial
- ✅ Frontend React com Vite
- ✅ Backend Express com MongoDB
- ✅ Knowledge Base com IA
- ✅ Integração WhatsApp

---

**Status:** ✅ PRONTO PARA USO

🚀 **Axion IA Painel** - Intelligence Hub unificado!
