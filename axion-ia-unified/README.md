# 🚀 Axion IA Unified - Monorepo

**Versão:** 4.0.0  
**Data Unificação:** 21/06/2026  
**Status:** ✅ ATIVO

---

## 📋 Visão Geral

Monorepo unificado da plataforma Axion IA, integrando:

- **🎨 Panel** - Interface React (Vite)
- **⚙️ API** - Backend Node.js/Express  
- **🧠 Engine** - Motor de IA (Embeddings, Classificação)

---

## 📁 Estrutura

```
axion-ia-unified/
├── panel/              🎨 Frontend React/Vite
│   ├── src/
│   │   ├── pages/      (40+ páginas)
│   │   ├── components/ (UI components)
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── api/                ⚙️ Backend API
│   ├── src/
│   │   ├── routes.js
│   │   ├── app.js
│   │   └── controllers/
│   ├── .env
│   └── package.json
│
├── engine/             🧠 Motor de IA
│   ├── app.js
│   ├── engine.js
│   ├── classifier.js
│   ├── prompt.js
│   └── kb.json
│
├── package.json        (root - scripts unificados)
├── iniciar.ps1         (inicia todos os serviços)
├── encerrar.ps1        (para todos os serviços)
└── README.md           (este arquivo)
```

---

## 🚀 Início Rápido

### **Windows (PowerShell):**

```powershell
# Instalar todas as dependências
npm run install:all

# Iniciar todos os serviços (Panel + API + Engine)
.\iniciar.ps1

# OU usar npm:
npm run dev
```

### **Serviços Iniciados:**

| Serviço | URL | Porta |
|---------|-----|-------|
| 🎨 Panel | http://localhost:3017 | 3017 |
| ⚙️ API | http://localhost:3100 | 3100 |
| 🧠 Engine | http://localhost:3200 | 3200 |

---

## 📜 Scripts Disponíveis

### **Root (Todos os Serviços):**

```bash
npm run dev              # Inicia panel + API + engine simultaneamente
npm run dev:panel        # Apenas panel
npm run dev:api          # Apenas API
npm run dev:engine       # Apenas engine
npm run build            # Build do panel
npm run install:all      # Instala dependências de todos
npm run clean            # Remove node_modules de todos
```

### **Panel (Frontend):**

```bash
cd panel
npm run dev              # Dev server (Vite)
npm run build            # Build produção
npm run preview          # Preview build
```

### **API (Backend):**

```bash
cd api
node --env-file=.env src/app.js    # Inicia API
```

### **Engine (Motor IA):**

```bash
cd engine
node app.js              # Inicia engine
```

---

## 🛠️ Tecnologias

### **Panel:**
- React 18
- React Router 6.28
- Vite 6
- Lucide React (ícones)
- Axios
- Recharts

### **API:**
- Node.js 18+
- Express
- MongoDB / SQL Server
- JWT Auth
- Multer (uploads)
- Jitbit Integration

### **Engine:**
- OpenAI API
- Embeddings (text-embedding-3-small)
- Classificador semântico
- Knowledge Base (JSON)

---

## ⚙️ Configuração

### **API (.env):**

Copie `.env.example` para `.env` e configure:

```env
PORT=3100
MONGODB_URI=mongodb://localhost:27017/axion
JITBIT_URL=https://your-jitbit.com/helpdesk/api
JITBIT_USER=email@example.com
JITBIT_PASSWORD=password
OPENAI_API_KEY=sk-...
```

---

## 🔄 Migração (O Que Mudou)

### **Antes (3 Projetos Separados):**

```
❌ axion-ia-panel/    (frontend isolado)
❌ axion-ia-api/      (backend isolado)
❌ axion-ia/          (engine isolado)
❌ axion-ia-painel/   (versão antiga não utilizada)
```

**Problemas:**
- 4 pastas para gerenciar
- Comandos separados para cada serviço
- Duplicação (axion-ia-panel vs axion-ia-painel)
- Difícil de versionar

### **Depois (Monorepo Unificado):**

```
✅ axion-ia-unified/
   ├── panel/    (frontend)
   ├── api/      (backend)
   └── engine/   (motor IA)
```

**Vantagens:**
- ✅ Um único comando inicia tudo (`npm run dev`)
- ✅ Estrutura organizada e clara
- ✅ Versionamento unificado
- ✅ Workspaces npm (compartilha dependências)
- ✅ Mais fácil de manter

---

## 🎯 Roadmap

### **v4.1 (Próxima):**
- [ ] Adicionar testes E2E
- [ ] CI/CD pipeline
- [ ] Docker Compose

### **v4.2 (Futura):**
- [ ] Shared components library
- [ ] TypeScript migration
- [ ] Storybook

---

## 🐛 Troubleshooting

### **Panel não carrega (tela branca):**
```bash
cd panel
rm -rf node_modules dist
npm install
npm run dev
```

### **API não conecta ao MongoDB:**
- Verifique se o MongoDB está rodando
- Confirme a `MONGODB_URI` no `.env`

### **Engine não responde:**
- Verifique a `OPENAI_API_KEY` no `.env`
- Confirme que `kb.json` existe

---

## 📞 Suporte

**Documentação:** [AxHub.Docs](http://localhost:3010/AxHub.Docs)  
**Issues:** GitHub Issues  
**Email:** suporte@axiontecnologia.com.br

---

## 📝 Licença

MIT © 2026 Axion Tecnologia

---

## 🎉 Status

**✅ PRONTO PARA USO**

Monorepo 100% funcional com todos os serviços integrados!
