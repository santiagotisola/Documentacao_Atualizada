# ✅ CHECKLIST DE IMPLEMENTAÇÃO — Refatoração Axion

**Objetivo**: Guia passo a passo para implementar a refatoração  
**Uso**: Marcar ☑️ conforme completo

---

## 📋 FASE 1 — QUICK WINS (1 semana)

### 🔧 Preparação (Dia 0)

- [ ] Criar branch `refactor/fase-1`
- [ ] Fazer backup completo do código atual
- [ ] Configurar ambiente de teste local
- [ ] Comunicar ao time sobre refatoração
- [ ] Criar cards no Jira/Trello para tracking

---

### 🎯 Backend — Unificar Product Controllers (Dias 1-2)

#### Dia 1: Criar Base Genérica

- [ ] Criar `src/controllers/products/generic-product.controller.js`
- [ ] Implementar `createProductController(dbService, config)`
- [ ] Extrair funções: statusConexao, resumoGeral, listarEquipamentos, heartbeatEquipamentos, listarTabelas
- [ ] Criar `src/config/products-config.js` com configurações de AxHub, AxTon, AxCross
- [ ] Testar localmente com Postman

**Arquivos criados**: 2  
**Arquivos modificados**: 0 (ainda)  
**Tempo estimado**: 4 horas

- [ ] ✅ Commit: `feat(api): add generic product controller`

#### Dia 2: Refatorar Controllers Existentes

- [ ] Refatorar `axhub-controller.js` para usar base genérica
  - [ ] Exportar funções base: `export const statusConexao = baseController.statusConexao;`
  - [ ] Manter funções específicas: `listarOperacoes`, `statsInfracoes`, `listarMonitoramentos`, etc.
- [ ] Refatorar `axton-controller.js` para usar base genérica
  - [ ] Funções específicas: `ultimasPesagens`, `ultimasInfracoes`
- [ ] Refatorar `axcross-controller.js` para usar base genérica
  - [ ] Funções específicas: `listarLocais`, `listarOperacoes`, `statsPassagens`
- [ ] Testar TODAS as rotas `/api/axhub/*`, `/api/axton/*`, `/api/axcross/*`
- [ ] Verificar que nenhuma funcionalidade quebrou

**Arquivos modificados**: 3  
**Linhas deletadas**: ~400  
**Tempo estimado**: 4 horas

- [ ] ✅ Commit: `refactor(api): use generic controller in axhub/axton/axcross`

---

### 🎨 Frontend — Componentes UI Básicos (Dias 3-4)

#### Dia 3: KPICard e StatusBadge

- [ ] Criar `src/components/ui/KPICard.jsx`
  - [ ] Props: icon, label, value, sublabel, color, trend, size, onClick
  - [ ] CSS: `KPICard.css`
  - [ ] PropTypes para validação
- [ ] Criar `src/components/ui/StatusBadge.jsx`
  - [ ] Variantes: ativo/inativo, success/warning/error
  - [ ] CSS: `StatusBadge.css`
- [ ] Testar isoladamente (criar página de teste temporária)

**Arquivos criados**: 4 (2 JSX + 2 CSS)  
**Tempo estimado**: 3 horas

- [ ] ✅ Commit: `feat(ui): add KPICard and StatusBadge components`

#### Dia 4: LoadingSpinner e DataTable

- [ ] Criar `src/components/ui/LoadingSpinner.jsx`
  - [ ] Variantes: small, medium, large
  - [ ] Texto customizável
- [ ] Criar `src/components/ui/DataTable.jsx`
  - [ ] Props: columns, data, onRowClick, loading, emptyMessage
  - [ ] Sorting opcional
  - [ ] Paginação opcional (futuro)
- [ ] Testar isoladamente

**Arquivos criados**: 4 (2 JSX + 2 CSS)  
**Tempo estimado**: 4 horas

- [ ] ✅ Commit: `feat(ui): add LoadingSpinner and DataTable components`

---

### ⚡ Frontend — Implementar React Query (Dia 5)

- [ ] Configurar React Query Provider no `main.jsx`
  ```jsx
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  const queryClient = new QueryClient();
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
  ```

- [ ] Criar `src/services/hooks/useHelpdesk.js`
  - [ ] Keys: helpdeskKeys
  - [ ] Hooks: useSitesOverview, useSLACompliance, useTickets, useTicket
  - [ ] Mutations: useClassificarTicket, useResponderTicket

- [ ] Criar `src/services/hooks/useAxHub.js`
  - [ ] Hooks: useAxHubStatus, useAxHubResumo, useAxHubEquipamentos

- [ ] Criar `src/services/hooks/useAxTon.js`
  - [ ] Similar ao AxHub

- [ ] Refatorar 3 páginas piloto para usar React Query:
  - [ ] `Helpdesk.jsx`
  - [ ] `IntelligenceHub.jsx`
  - [ ] `Dashboard.jsx`

- [ ] Testar navegação entre páginas (verificar cache funcionando)

**Arquivos criados**: 3  
**Arquivos modificados**: 3  
**Tempo estimado**: 5 horas

- [ ] ✅ Commit: `feat(hooks): implement React Query in 3 pilot pages`

---

### 🧹 Utilitários (Dia 5, continuação)

- [ ] Criar `src/services/utils/scoreCalculators.js`
  - [ ] Funções: calcHealthScore, scoreColor, scoreLabel, formatNumber, formatPercent
  - [ ] Extrair de IntelligenceHub.jsx e OperationsHub.jsx
- [ ] Atualizar páginas para usar utils
- [ ] Deletar código duplicado

**Arquivos criados**: 1  
**Arquivos modificados**: 2+  
**Linhas deletadas**: ~50  
**Tempo estimado**: 2 horas

- [ ] ✅ Commit: `refactor(utils): extract score calculators`

---

### 📦 Reorganizar Backend Services (Dia 5, fim)

- [ ] Criar subpastas em `src/services/`:
  - [ ] `database/` - mover axhub-db.js, axton-db.js, axcross-db.js
  - [ ] `ai/` - mover openai, classifier, embedding
  - [ ] `validation/` - mover confidence-scorer, conformidade
  - [ ] `scraping/` - mover pncp-scraper, pncp.service
  - [ ] `analysis/` - mover image-analysis, document-analysis, ocr-processor
  - [ ] `utils/` - mover parser, normalizador, comparador, extrator

- [ ] Atualizar imports em controllers

**Arquivos movidos**: 30+  
**Tempo estimado**: 1 hora

- [ ] ✅ Commit: `refactor(api): reorganize services into subfolders`

---

### 🧪 Testes e Code Review (Dia 5, fim)

- [ ] Testar TODOS os endpoints da API
- [ ] Testar TODAS as páginas do frontend
- [ ] Criar Pull Request
- [ ] Code review com pelo menos 1 dev sênior
- [ ] Merge para `main`

**Tempo estimado**: 2 horas

- [ ] ✅ PR: `Fase 1 - Quick Wins: Unificar controllers, criar componentes UI, React Query`

---

## 📋 FASE 2 — CONSOLIDAÇÃO (2 semanas)

### 🗂️ Backend — Dividir routes.js (Semana 2, Dia 1)

- [ ] Criar `src/routes/index.js` (agregador)
- [ ] Criar `src/routes/helpdesk.routes.js`
  - [ ] Mover rotas `/helpdesk/*`
- [ ] Criar `src/routes/products.routes.js`
  - [ ] Mover rotas `/axhub/*`, `/axton/*`, `/axcross/*`
- [ ] Criar `src/routes/validation.routes.js`
  - [ ] Mover rotas `/validation/*`, `/visual-validation/*`
- [ ] Criar `src/routes/editais.routes.js`
  - [ ] Mover rotas `/edital/*`, `/sites/*`
- [ ] Criar `src/routes/crm.routes.js`
  - [ ] Mover rotas `/crm/*`
- [ ] Criar `src/routes/analysis.routes.js`
  - [ ] Mover rotas `/analise-imagem/*`, `/duplicidade/*`, `/medicao/*`, `/varco/*`
- [ ] Criar `src/routes/reports.routes.js`
  - [ ] Mover rotas `/relatorio/*`, `/jobs/*`
- [ ] Criar `src/routes/admin.routes.js`
  - [ ] Mover rotas `/admin/*`, `/config/*`, `/credenciais/*`

- [ ] Atualizar `app.js` para usar novo roteador
- [ ] Testar TODAS as rotas

**Arquivos criados**: 9  
**Arquivos modificados**: 2 (routes.js vira index.js + app.js)  
**Linhas em routes.js**: 300 → 20  
**Tempo estimado**: 4 horas

- [ ] ✅ Commit: `refactor(api): split routes.js into domain-based files`

---

### 🔨 Backend — Quebrar helpdesk-controller.js (Semana 2, Dia 2)

- [ ] Criar `src/controllers/helpdesk/tickets.controller.js`
  - [ ] Funções: listar, obterDetalhe, classificar, responder, processarPendentes, criar, listarCategorias
  - [ ] Funções de sites: sitesOverview, obterMapa, associarSite, desassociarSite, ticketsPorSite
- [ ] Criar `src/controllers/helpdesk/polling.controller.js`
  - [ ] Funções: getStatus, iniciar, pausar, retomar, limpar
- [ ] Criar `src/controllers/helpdesk/queue.controller.js`
  - [ ] Funções: obterFila, setModoRevisao, aprovar, rejeitar
- [ ] Criar `src/controllers/helpdesk/sla.controller.js`
  - [ ] Funções: relatarCompliance, gerarPlanilhaHoras, listarTecnicos

- [ ] Atualizar `helpdesk.routes.js` para usar novos controllers
- [ ] Deletar `helpdesk-controller.js` antigo
- [ ] Testar todas as rotas `/helpdesk/*`

**Arquivos criados**: 4  
**Arquivos deletados**: 1  
**Linhas de helpdesk-controller.js**: 700 → 0 (distribuído em 4 arquivos)  
**Tempo estimado**: 5 horas

- [ ] ✅ Commit: `refactor(api): split helpdesk-controller into 4 files`

---

### 🏠 Frontend — Unificar Dashboards (Semana 2, Dias 3-5)

#### Criar DashboardHub

- [ ] Criar `src/pages/home/DashboardHub.jsx`
  - [ ] TabContainer com 3 abas: Overview, Operations, Intelligence
- [ ] Criar `src/pages/home/tabs/OverviewTab.jsx`
  - [ ] Migrar conteúdo de `Dashboard.jsx`
- [ ] Criar `src/pages/home/tabs/OperationsTab.jsx`
  - [ ] Migrar conteúdo de `OperationsHub.jsx`
- [ ] Criar `src/pages/home/tabs/IntelligenceTab.jsx`
  - [ ] Migrar conteúdo de `IntelligenceHub.jsx`

- [ ] Atualizar `App.jsx`:
  - [ ] Rota `/dashboard` → `/dashboard-hub` ou manter `/dashboard` apontando para novo componente
  - [ ] Deletar rotas `/intelligence-hub` e `/operations-hub` (ou redirecionar)

- [ ] Deletar arquivos antigos:
  - [ ] `IntelligenceHub.jsx` + `.css`
  - [ ] `OperationsHub.jsx` + `.css`
  - [ ] `IntelligenceDashboard.jsx` (se existir)
  - [ ] `DashboardWidgets.jsx` (ou converter em componente genérico)

- [ ] Testar navegação

**Arquivos criados**: 4  
**Arquivos deletados**: 4-5  
**Linhas deletadas**: ~1.200  
**Tempo estimado**: 12 horas (3 dias)

- [ ] ✅ Commit: `refactor(ui): unify dashboards into DashboardHub with tabs`

---

### 🧹 Frontend — Limpar Páginas Órfãs (Semana 3, Dia 1)

- [ ] Listar TODAS as páginas em `src/pages/`
- [ ] Verificar quais NÃO estão em `App.jsx` rotas:
  - [ ] `ConfidencaRevisao.jsx`
  - [ ] `Conformidade.jsx`
  - [ ] `SlaCompliance.jsx`
  - [ ] `Roadmap.jsx`
  - [ ] `Specs.jsx`
  - [ ] `BuscaEditaisGov.jsx`
  - [ ] `AnaliseEditalAvancada.jsx`
  - [ ] `ChamadosSites.jsx`
  - [ ] `GuiaSites.jsx`

- [ ] Para cada arquivo órfão:
  - [ ] Verificar se é usado em outro lugar
  - [ ] Se SIM: adicionar rota em `App.jsx`
  - [ ] Se NÃO: mover para `/archive/` ou deletar

**Arquivos movidos/deletados**: 5-10  
**Tempo estimado**: 3 horas

- [ ] ✅ Commit: `chore(ui): cleanup orphan pages`

---

### ⚡ Frontend — React Query em TODAS as Páginas (Semana 3, Dias 2-4)

- [ ] Criar hooks para todos os domínios restantes:
  - [ ] `useValidation.js`
  - [ ] `useEditais.js`
  - [ ] `useCRM.js`
  - [ ] `useAnalysis.js`
  - [ ] `useReports.js`

- [ ] Refatorar páginas restantes para usar React Query:
  - [ ] ValidationManager.jsx
  - [ ] VisualValidationManager.jsx
  - [ ] PipelineEditais.jsx
  - [ ] RelatorioFluxo.jsx
  - [ ] RelatorioContrato.jsx
  - [ ] AnaliseImagens.jsx
  - [ ] FontesPesquisa.jsx
  - [ ] VarcoMonitor.jsx
  - [ ] DuplicidadeInfracoes.jsx
  - [ ] DiagnosticoMedicao.jsx
  - [ ] (20+ páginas restantes)

- [ ] Deletar código antigo de `useState` + `useEffect` + fetch manual

**Arquivos criados**: 5  
**Arquivos modificados**: 20+  
**Linhas deletadas**: ~1.000 (loading/error boilerplate)  
**Tempo estimado**: 12 horas (3 dias)

- [ ] ✅ Commit: `feat(hooks): implement React Query across all pages`

---

### 🧪 Testes e Code Review Fase 2 (Semana 3, Dia 5)

- [ ] Testar TODAS as rotas da API
- [ ] Testar TODAS as páginas do frontend
- [ ] Verificar cache do React Query funcionando
- [ ] Criar Pull Request
- [ ] Code review com time completo
- [ ] Merge para `main`

**Tempo estimado**: 4 horas

- [ ] ✅ PR: `Fase 2 - Consolidação: Dividir routes, quebrar controllers, unificar dashboards, React Query`

---

## 📋 FASE 3 — COMPONENTIZAÇÃO (3 semanas)

### 🎨 Frontend — Biblioteca Completa de UI (Semana 4)

- [ ] Criar `src/components/ui/PageHeader.jsx`
- [ ] Criar `src/components/ui/TabContainer.jsx`
- [ ] Criar `src/components/ui/ErrorMessage.jsx`
- [ ] Criar `src/components/ui/EmptyState.jsx`
- [ ] Criar `src/components/ui/DateRangeFilter.jsx`
- [ ] Criar `src/components/ui/SearchInput.jsx`
- [ ] Criar `src/components/ui/Button.jsx` (variantes)
- [ ] Criar `src/components/ui/Card.jsx`
- [ ] Criar `src/components/ui/Modal.jsx`
- [ ] Criar `src/components/ui/Toast.jsx` (ou usar Sonner que já está instalado)

**Arquivos criados**: 10+  
**Tempo estimado**: 20 horas (1 semana)

- [ ] ✅ Commit: `feat(ui): add complete UI component library`

---

### 🏗️ Frontend — Layouts Reutilizáveis (Semana 5, Dias 1-2)

- [ ] Criar `src/components/layouts/DashboardLayout.jsx`
  - [ ] Header + Sidebar + Content
- [ ] Criar `src/components/layouts/CRUDLayout.jsx`
  - [ ] Lista + Formulário + Detalhes
- [ ] Criar `src/components/layouts/ReportLayout.jsx`
  - [ ] Filtros + Gráficos + Tabela

**Arquivos criados**: 3  
**Tempo estimado**: 8 horas

- [ ] ✅ Commit: `feat(layouts): add reusable page layouts`

---

### 🔨 Frontend — Refatorar Todas as Páginas (Semana 5, Dias 3-5)

- [ ] Refatorar páginas para usar componentes UI e layouts
  - [ ] Substituir cards customizados por `<KPICard>`
  - [ ] Substituir tabelas customizadas por `<DataTable>`
  - [ ] Substituir loading customizado por `<LoadingSpinner>`
  - [ ] Usar layouts apropriados

- [ ] Deletar CSS específico de página (mover para componentes)

**Arquivos modificados**: 30+  
**Linhas deletadas**: ~2.000  
**Tempo estimado**: 12 horas (3 dias)

- [ ] ✅ Commit: `refactor(pages): use UI components and layouts everywhere`

---

### 🗂️ Frontend — Reorganizar em Subpastas (Semana 6, Dia 1)

- [ ] Criar estrutura de subpastas:
  ```
  src/pages/
    home/
    atendimento/
    analise/
    qualidade/
    inteligencia/
    relatorios/
    operacoes/
    recursos/
    sistema/
  ```

- [ ] Mover páginas para subpastas apropriadas
- [ ] Atualizar imports em `App.jsx`

**Arquivos movidos**: 30+  
**Tempo estimado**: 2 horas

- [ ] ✅ Commit: `refactor(pages): organize into domain-based subfolders`

---

### 🔧 Backend — Camada de Serviços (Semana 6, Dias 2-3)

- [ ] Criar `src/services/helpdesk/HelpdeskService.js`
  - [ ] Mover lógica de negócio de controllers
- [ ] Criar `src/services/validation/ValidationService.js`
- [ ] Criar `src/services/editais/EditalService.js`

- [ ] Refatorar controllers para usar services:
  ```javascript
  // Controller (thin)
  export async function listarTickets(req, res) {
    try {
      const tickets = await HelpdeskService.listarTickets(req.query);
      res.json(tickets);
    } catch (err) {
      next(err);
    }
  }

  // Service (business logic)
  class HelpdeskService {
    static async listarTickets(filters) {
      // Lógica complexa aqui
    }
  }
  ```

**Arquivos criados**: 3  
**Arquivos modificados**: 10+  
**Tempo estimado**: 8 horas

- [ ] ✅ Commit: `refactor(api): introduce service layer`

---

### ✅ Backend — Zod Validation (Semana 6, Dias 4-5)

- [ ] Criar `src/middleware/validation.middleware.js`
  ```javascript
  export function validateBody(schema) {
    return (req, res, next) => {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ errors: result.error.errors });
      }
      req.body = result.data;
      next();
    };
  }
  ```

- [ ] Criar `src/schemas/helpdesk.schemas.js`
  ```javascript
  import { z } from 'zod';
  
  export const criarTicketSchema = z.object({
    titulo: z.string().min(5).max(200),
    descricao: z.string().min(10),
    prioridade: z.enum(['baixa', 'media', 'alta', 'critica']),
    categoriaId: z.number().int().positive(),
  });
  ```

- [ ] Adicionar validation em rotas críticas:
  ```javascript
  router.post('/tickets', validateBody(criarTicketSchema), tickets.criar);
  ```

- [ ] Criar schemas para:
  - [ ] Helpdesk
  - [ ] Validation
  - [ ] Editais
  - [ ] CRM

**Arquivos criados**: 5+  
**Arquivos modificados**: 10+  
**Tempo estimado**: 8 horas

- [ ] ✅ Commit: `feat(api): add Zod validation to all routes`

---

### 🧪 Testes e Code Review Fase 3

- [ ] Testar tudo novamente
- [ ] Code review
- [ ] Merge para `main`

- [ ] ✅ PR: `Fase 3 - Componentização completa + camada de serviços + validation`

---

## 📋 FASE 4 — TYPESCRIPT & TESTES (4 semanas)

### 🔷 Backend — Migrar para TypeScript (Semanas 7-8)

- [ ] Configurar TypeScript no backend
  - [ ] `npm install -D typescript @types/node @types/express`
  - [ ] Criar `tsconfig.json`
- [ ] Renomear arquivos `.js` → `.ts`
- [ ] Adicionar tipos:
  - [ ] Services primeiro
  - [ ] Controllers depois
  - [ ] Routes por último
- [ ] Resolver todos os erros de tipo
- [ ] Atualizar build script

**Arquivos modificados**: 100+  
**Tempo estimado**: 40 horas (2 semanas)

- [ ] ✅ Commit: `feat(api): migrate to TypeScript`

---

### 🔷 Frontend — Migrar para TypeScript (Semanas 9-10)

- [ ] Configurar TypeScript no frontend
  - [ ] Já vem com Vite, só ativar
- [ ] Renomear arquivos `.jsx` → `.tsx`
- [ ] Adicionar tipos:
  - [ ] Components UI primeiro
  - [ ] Layouts depois
  - [ ] Pages por último
- [ ] Resolver todos os erros de tipo

**Arquivos modificados**: 60+  
**Tempo estimado**: 40 horas (2 semanas)

- [ ] ✅ Commit: `feat(ui): migrate to TypeScript`

---

### 🧪 Testes Unitários (Semanas 9-10, paralelo)

- [ ] Configurar Jest (backend) + Vitest (frontend)
- [ ] Escrever testes para:
  - [ ] Services (backend): 60% coverage
  - [ ] Utils (ambos): 80% coverage
  - [ ] Components UI (frontend): 70% coverage
- [ ] Configurar CI para rodar testes

**Arquivos criados**: 50+  
**Tempo estimado**: 20 horas (paralelo ao TypeScript)

- [ ] ✅ Commit: `test: add unit tests with 60% coverage`

---

### 🎭 Testes E2E (Semana 10, fim)

- [ ] Configurar Playwright
- [ ] Escrever testes E2E para fluxos críticos:
  - [ ] Login
  - [ ] Criar ticket
  - [ ] Classificar ticket
  - [ ] Gerar relatório
  - [ ] Validar sistema

**Arquivos criados**: 10  
**Tempo estimado**: 16 horas

- [ ] ✅ Commit: `test: add E2E tests for critical flows`

---

### 🎉 Code Review Final e Deploy

- [ ] Code review com time completo
- [ ] Merge para `main`
- [ ] Deploy em staging
- [ ] QA completo
- [ ] Deploy em produção (gradual com feature flags)

- [ ] ✅ PR: `Fase 4 - TypeScript + Testes (60% coverage)`

---

## 🎯 CHECKLIST DE VALIDAÇÃO FINAL

### Métricas Atingidas?

- [ ] Linhas de código: 15.000 → 10.000 ✅
- [ ] Código duplicado: 40% → <10% ✅
- [ ] Componentes reutilizáveis: 2 → 15+ ✅
- [ ] Coverage de testes: 0% → 60% ✅
- [ ] TypeScript: 0% → 90% ✅

### Funcionalidades Funcionando?

- [ ] Chat IA ✅
- [ ] WhatsApp ✅
- [ ] Helpdesk ✅
- [ ] AxHub queries ✅
- [ ] AxTon queries ✅
- [ ] AxCross queries ✅
- [ ] Validation Manager ✅
- [ ] Visual Validation ✅
- [ ] Pipeline Editais ✅
- [ ] Relatórios ✅

### Performance Melhorou?

- [ ] Tempo de carregamento: -30% ✅
- [ ] Navegação entre páginas: -50% (cache) ✅
- [ ] Build time: <30s ✅

### Documentação Atualizada?

- [ ] README com nova arquitetura ✅
- [ ] Guia de componentes UI ✅
- [ ] Guia de hooks React Query ✅
- [ ] Documentação de APIs com Swagger ✅

---

## 🎉 CELEBRAÇÃO!

**Parabéns! Refatoração completa!**

**Conquistas**:
- ✅ -33% linhas de código
- ✅ -70% tempo para features
- ✅ -80% bugs
- ✅ +100% satisfação dos devs 😊

**Próximos passos**:
1. Monitorar métricas por 1 mês
2. Iterar com base em feedback
3. Planejar melhorias contínuas

---

**Fim do Checklist de Implementação**
