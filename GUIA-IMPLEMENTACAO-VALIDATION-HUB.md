# 🚀 Guia de Implementação - ValidationHub.jsx

## 📋 Checklist de Implementação

### 1. Preparação
- [ ] Ler a proposta completa em `PROPOSTA-VALIDATION-HUB.md`
- [ ] Revisar os arquivos existentes:
  - `ValidationManager.jsx` (lógica UI/API)
  - `VisualValidationManager.jsx` (lógica Visual)
  - `sitesData.js` (fonte de dados de sites)

### 2. Criar Arquivos Base
```bash
# No diretório: axion-ia-panel/src/pages/

# Copiar skeleton
cp ../../VALIDATION-HUB-SKELETON.jsx ./ValidationHub.jsx

# Copiar estilos
cp ../../VALIDATION-HUB-STYLES.css ./ValidationHub.css
```

### 3. Ajustar Imports e Paths
- [ ] Verificar caminho de `sitesData.js`: `../data/sitesData.js`
- [ ] Verificar `API_URL` de `.env`: `VITE_API_URL`
- [ ] Confirmar todos os ícones do Lucide React estão disponíveis

### 4. Integrar ao Router
Adicionar rota no arquivo de rotas (ex: `App.jsx` ou `router.jsx`):

```javascript
import ValidationHub from './pages/ValidationHub';

// Na configuração de rotas:
{
  path: '/validation-hub',
  element: <ValidationHub />
}
```

### 5. Adicionar ao Menu Lateral
No arquivo do sidebar/menu:

```javascript
{
  icon: <Activity size={20} />,
  label: "Validation Hub",
  path: "/validation-hub"
}
```

---

## 🔧 Modificações Necessárias

### sitesData.js - Adicionar Credenciais (Opcional)
Se quiser pré-preencher credenciais de alguns sites:

```javascript
// Em AXHUB_SITES ou AXCROSS_SITES
{
  id: 'economia-ipempe',
  nome: 'IPEM-PE Economia',
  url: 'https://economia.axhub.axion.ws',
  // ...outros campos
  credentials: {
    username: 'admin',
    password: 'admin123' // ⚠️ Apenas para dev/demo
  }
}
```

### API Backend - Endpoints Necessários

#### UI/API Validation
```
POST /api/validation/start
POST /api/validation/discover-ui
POST /api/validation/discover-api
GET  /api/validation/report/:id
```

#### Visual Validation
```
POST /api/visual-validation/start
GET  /api/visual-validation/status/:id
GET  /api/visual-validation/report/:id
```

---

## 🎨 Customizações de Estilo

### Ajustar Cores do Tema
No `ValidationHub.css`, procure por:

```css
/* Gradiente principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cor primária */
color: #667eea;

/* Botão de sucesso */
background: #28a745;
```

Substitua pelas cores do seu design system se necessário.

### Ícones Alternativos
Se quiser trocar os ícones, substitua no JSX:

```javascript
// De:
<Code size={20} />

// Para:
<Settings size={20} />
```

---

## 🧪 Teste Manual

### Fluxo 1: Validação UI/API com Site Selecionado
1. Abrir `/validation-hub`
2. Clicar em aba "Validação UI/API"
3. Selecionar "IPEM-PE Economia" no dropdown
4. Clicar em "Selecionar Site"
5. Verificar se URL foi preenchida
6. Preencher credenciais (se necessário)
7. Escolher tipo de validação (ex: "Completa")
8. Clicar em "Iniciar Validação UI/API"
9. Aguardar conclusão
10. Verificar logs e resultados

### Fluxo 2: Validação Visual com Modo Manual
1. Clicar em aba "Validação Visual"
2. Marcar "Modo Manual"
3. Digitar URL customizada
4. Preencher credenciais
5. Escolher escopo (ex: "Completa")
6. Clicar em "Iniciar Validação Visual"
7. Aguardar conclusão (sem poder cancelar)
8. Verificar screenshots e issues

### Fluxo 3: Troca de Abas Durante Validação
1. Iniciar validação na aba UI/API
2. Tentar trocar para aba Visual (deve estar desabilitado)
3. Aguardar conclusão
4. Trocar de aba (agora deve funcionar)

---

## 🐛 Troubleshooting

### Problema: Sites não aparecem no dropdown
**Causa**: Import de `AXHUB_SITES` ou `AXCROSS_SITES` falhou  
**Solução**: 
```javascript
// Verificar se o export existe em sitesData.js
export const AXHUB_SITES = [...];
export const AXCROSS_SITES = [...];

// Verificar import
import { AXHUB_SITES, AXCROSS_SITES } from "../data/sitesData";
console.log(AXHUB_SITES.length, AXCROSS_SITES.length);
```

### Problema: Erro ao iniciar validação
**Causa**: Backend não está rodando ou endpoint incorreto  
**Solução**:
1. Verificar se `axion-ia-api` está rodando em `localhost:3100`
2. Testar endpoint manualmente:
```bash
curl -X POST http://localhost:3100/api/validation/start \
  -H "Content-Type: application/json" \
  -d '{"systemUrl":"https://economia.axhub.axion.ws"}'
```

### Problema: Estilos não aplicados
**Causa**: CSS não foi importado ou caminho errado  
**Solução**:
```javascript
// No ValidationHub.jsx
import "./ValidationHub.css"; // ✅ Caminho relativo correto
```

### Problema: Validação visual não mostra screenshots
**Causa**: Backend retornou relatório sem campo `screens`  
**Solução**: Verificar estrutura do response de `/api/visual-validation/report/:id`

---

## 📦 Estrutura de Dados Esperada

### Response de `/api/validation/report/:id` (UI/API)
```json
{
  "validationId": "abc123",
  "status": "Concluído",
  "duration": "45s",
  "ui": {
    "totalElements": 120,
    "buttons": 30,
    "inputs": 45,
    "forms": 10
  },
  "api": {
    "totalEndpoints": 25,
    "getCount": 15,
    "postCount": 10
  }
}
```

### Response de `/api/visual-validation/report/:id` (Visual)
```json
{
  "validationId": "xyz789",
  "status": "Concluído",
  "screens": [
    { "name": "Login", "screenshot": "data:image/png;base64,..." },
    { "name": "Dashboard", "screenshot": "data:image/png;base64,..." }
  ],
  "issues": [
    {
      "title": "Botão sem label",
      "description": "Botão 'Salvar' não tem atributo aria-label",
      "severity": "medium",
      "location": "/dashboard - linha 42"
    }
  ]
}
```

---

## 🚀 Deploy

### Build de Produção
```bash
cd axion-ia-panel
npm run build
```

### Variáveis de Ambiente
Criar `.env.production`:
```env
VITE_API_URL=https://api.axion.ws
```

---

## 📚 Referências Rápidas

| Arquivo | Descrição |
|---------|-----------|
| `PROPOSTA-VALIDATION-HUB.md` | Documentação completa da arquitetura |
| `VALIDATION-HUB-SKELETON.jsx` | Código base do componente |
| `VALIDATION-HUB-STYLES.css` | Estilos completos |
| `ValidationManager.jsx` | Referência para lógica UI/API |
| `VisualValidationManager.jsx` | Referência para lógica Visual |
| `sitesData.js` | Fonte de dados de sites |

---

## ✅ Pós-Implementação

- [ ] Testar em Chrome, Firefox, Edge
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Validar acessibilidade (keyboard navigation, screen readers)
- [ ] Adicionar tracking/analytics (opcional)
- [ ] Documentar no README do projeto
- [ ] Criar tutorial em vídeo (opcional)
- [ ] Treinar usuários finais
- [ ] Deprecar `ValidationManager.jsx` e `VisualValidationManager.jsx` após migração completa

---

**Última atualização**: 2026-06-20  
**Status**: ✅ Pronto para implementação
