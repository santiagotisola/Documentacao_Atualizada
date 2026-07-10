# 🏢 ANÁLISE COMPLETA — Consolidação de Gerenciamento de Sites

**Data**: 2026-06-22  
**Objetivo**: Consolidar TODAS as telas relacionadas a sites em uma única Central de Gerenciamento

---

## 📊 SITUAÇÃO ATUAL — Páginas Dispersas

### **Telas Existentes com Informações de Sites**

| # | Componente | Rota | Funcionalidade Principal | Localização Menu | Linhas |
|---|------------|------|--------------------------|------------------|--------|
| **1** | **AnalisesSites.jsx** | `/analise` | Análise comparativa com 4 abas internas | 🎯 Operações | ~800 |
| **2** | **GuiaSites.jsx** | `/guia-sites` | Guia detalhado por site (fichas) | 📚 Recursos | ~400 |
| **3** | **ChamadosSites.jsx** | `/chamados-sites` | Gestão de chamados por site | 📋 Helpdesk | ~500 |
| **4** | **PainelProcessos.jsx** | `/painel-processos` | Aba "Sites" com tabela consolidada | 🎯 Operações | ~200 (aba) |
| **5** | **MapaOperacoes.jsx** | `/mapa-operacoes` | Sites vinculados a processos | 🎯 Operações | ~50 (sites) |
| **6** | **ValidationHub.jsx** | `/validacao` | Seletor de sites para validação | 🔍 Validação | ~30 (seletor) |
| **7** | **IntelligenceHub.jsx** | (importado) | Dashboard de análise cruzada | Interno | ~600 |

**Total**: 7 locais diferentes com informações de sites  
**Problema**: Usuário precisa navegar entre múltiplas telas para ter visão completa

---

## 🔍 ANÁLISE DETALHADA POR COMPONENTE

### **1️⃣ AnalisesSites.jsx** — `/analise`

**Funcionalidades**:
- ✅ **4 Abas Internas** (Visão Geral, Comparar, Detalhe, Por Módulo)
- ✅ Painel metodologia explicativo (expandível)
- ✅ Cards de sites clicáveis com seleção múltipla
- ✅ Tabela comparativa de funcionalidades/BI/métricas
- ✅ Ficha detalhada individual por site
- ✅ Visualização por módulos do sistema
- ✅ Filtros por sistema (AxHub/AxCross)
- ✅ Já importa GuiaSites e IntelligenceDashboard

**Dados Exibidos**:
- Nome, estado, tipo, versão, menus
- Funcionalidades ativas (extras)
- Relatórios BI (lista completa + exclusivos)
- Equipamentos (total, grupos, fabricantes)
- OCR %, Passagens/dia
- Colunas de operações
- Observações

**Pontos Fortes**:
- Interface mais completa e profissional
- Metodologia documentada
- Comparação lado a lado
- Já tem estrutura de abas
- Fácil seleção de sites

**Gaps**:
- ❌ Não mostra chamados/tickets
- ❌ Não tem dashboard operacional em tempo real
- ❌ Não permite edição de credenciais
- ❌ Falta aba de "Lista Geral" com tabela completa

---

### **2️⃣ GuiaSites.jsx** — `/guia-sites`

**Funcionalidades**:
- ✅ Dropdown selector de sites
- ✅ Ficha AxHub detalhada (funcionalidades, BI, equipamentos)
- ✅ Ficha AxCross detalhada (equipamentos, faixas, alertas)
- ✅ Layout de 2 colunas (grupos + fabricantes)
- ✅ Badges coloridos por tipo de contrato
- ✅ BI exclusivos vs padrão separados
- ✅ Links diretos para URLs dos sites

**Dados Exibidos**:
- Funcionalidades ativas (checkboxes visuais)
- Layout de operações (colunas)
- Grupos operacionais
- Fabricantes
- Relatórios BI (exclusivos destacados)
- Observações

**Pontos Fortes**:
- Foco em particularidades de cada site
- Visual limpo e bem organizado
- Bom para consulta rápida
- Separa BI exclusivos vs padrão

**Gaps**:
- ❌ Não tem comparação entre sites
- ❌ Não mostra chamados
- ❌ Não tem métricas operacionais em tempo real
- ❌ **REDUNDANTE** com AnalisesSites aba "Detalhe"

---

### **3️⃣ ChamadosSites.jsx** — `/chamados-sites`

**Funcionalidades**:
- ✅ **KPI Cards** (Total, Abertos, Fechados, Críticos, Sem Resposta)
- ✅ **Ranking de demandas** por site (tabela ordenada)
- ✅ **Detalhes de chamados** por site selecionado
- ✅ **Duplicados** (tickets com assuntos similares)
- ✅ **Categorias não associadas** (com opção de associação manual)
- ✅ Integração com API do helpdesk
- ✅ Badges de prioridade coloridos
- ✅ Links diretos para Jitbit
- ✅ Tempo relativo ("2h atrás", "5d atrás")

**Dados Exibidos**:
- Total de tickets por site
- Tickets abertos/fechados
- Prioridade (Crítica, Alta, Normal)
- Status, Técnico responsável
- Data de atualização
- Métricas consolidadas

**Pontos Fortes**:
- **ÚNICO** local com dados de helpdesk
- KPIs visuais e intuitivos
- Ranking facilita priorização
- Detecção de duplicados economiza tempo
- Integração com 3 sistemas (AxHub, AxCross, AxTon)

**Gaps**:
- ❌ Não mostra dados operacionais dos sites
- ❌ Não tem análise comparativa
- ❌ Não permite visualizar histórico de tickets

---

### **4️⃣ PainelProcessos.jsx** — Aba "Sites"

**Funcionalidades**:
- ✅ Tabela consolidada de TODOS os sites (AxHub + AxCross + extras)
- ✅ Filtros (sistema, busca por nome)
- ✅ Contador de sites filtrados
- ✅ Detalhes expandidos ao clicar na linha
- ✅ Colunas: Nome, Sistema, UF, URL, Versão, Equip., Faixas, Veículos, Pass./Dia, Status
- ✅ Links clicáveis para URLs
- ✅ Badges coloridos (AxHub/AxCross, Ativo/Inativo)

**Dados Exibidos**:
- Dados tabulares de todos os sites
- Informações básicas consolidadas
- Status operacional

**Pontos Fortes**:
- Tabela completa e pesquisável
- Boa para visão de lista
- Filtros funcionais

**Gaps**:
- ❌ **REDUNDANTE** com AnalisesSites e GuiaSites
- ❌ Não tem análise comparativa
- ❌ Não mostra chamados
- ❌ Contexto misturado (sites + processos + acessos)

---

### **5️⃣ MapaOperacoes.jsx** — Sites vinculados

**Funcionalidades**:
- ✅ Lista de sites vinculados a processos
- ✅ Contexto operacional (qual processo usa qual site)
- ✅ Consolidação de sites AxHub + AxCross

**Dados Exibidos**:
- Sites relacionados a fluxos de processo
- Contexto de uso

**Pontos Fortes**:
- Contextual (sites no contexto de processos)
- Faz sentido permanecer aqui

**Decisão**:
- ✅ **MANTER** - Faz sentido no contexto de processos
- Não precisa ser movido para Central de Sites

---

### **6️⃣ ValidationHub.jsx** — Seletor de sites

**Funcionalidades**:
- ✅ Dropdown com todos os sites (AxHub + AxCross)
- ✅ Auto-preenchimento de URL e credenciais
- ✅ Botão "Selecionar Site"
- ✅ Modo manual vs seleção de site

**Dados Exibidos**:
- Lista de sites para validação

**Pontos Fortes**:
- Funcional (não informativo)
- Contexto específico de validação

**Decisão**:
- ✅ **MANTER** - É um seletor funcional, não uma tela de informação
- Não precisa ser movido para Central de Sites

---

### **7️⃣ IntelligenceHub.jsx** — Dashboard de análise

**Funcionalidades**:
- ✅ Análise cruzada multi-site
- ✅ Padrões e anomalias
- ✅ Métricas agregadas
- ✅ Gráficos e visualizações

**Dados Exibidos**:
- OCR médio geral
- Sites ativos vs inativos
- Equipamentos totais
- Análises comparativas

**Pontos Fortes**:
- Visão estratégica
- Analytics avançado

**Decisão**:
- ✅ **INTEGRAR** - Deve ser uma aba na Central de Sites

---

## ✅ DECISÃO DE CONSOLIDAÇÃO

### **O QUE CONSOLIDAR**

| Componente | Decisão | Justificativa |
|------------|---------|---------------|
| **AnalisesSites.jsx** | 🔄 **BASE** | Usar como base, tem melhor estrutura |
| **GuiaSites.jsx** | ❌ **INTEGRAR** | Redundante, virar aba "Guia Detalhado" |
| **ChamadosSites.jsx** | ➕ **INTEGRAR** | Virar aba "Chamados & Suporte" |
| **PainelProcessos (aba Sites)** | ❌ **INTEGRAR** | Virar aba "Lista Geral" |
| **MapaOperacoes (sites)** | ✅ **MANTER** | Contexto de processos, faz sentido lá |
| **ValidationHub (seletor)** | ✅ **MANTER** | Funcional, não informativo |
| **IntelligenceHub** | ➕ **INTEGRAR** | Virar aba "Intelligence & Analytics" |

---

## 🎯 PROPOSTA — Central de Sites (Módulo Único)

### **📁 Estrutura de Arquivos**

```
src/pages/CentralSites/
├── index.jsx                      # Componente principal com tabs
├── CentralSites.css               # Estilos consolidados
├── components/
│   ├── VisaoGeral.jsx             # Cards de sites (de AnalisesSites)
│   ├── ListaGeral.jsx             # Tabela completa (de PainelProcessos)
│   ├── Comparativo.jsx            # Comparação lado a lado (de AnalisesSites)
│   ├── GuiaDetalhado.jsx          # Ficha individual (de GuiaSites)
│   ├── Chamados.jsx               # Gestão de tickets (de ChamadosSites)
│   ├── Intelligence.jsx           # Dashboard analytics (IntelligenceHub)
│   ├── Credenciais.jsx            # Gerenciamento de credenciais
│   ├── StatusOperacional.jsx     # Health check em tempo real
│   └── Metodologia.jsx            # Painel explicativo (de AnalisesSites)
└── hooks/
    ├── useSites.js                # Hook consolidado para dados de sites
    └── useTickets.js              # Hook para dados de helpdesk
```

---

## 📑 ESTRUTURA DE ABAS — Central de Sites

### **Aba 1: 📊 Visão Geral** (Cards)
**Origem**: AnalisesSites aba "Visão Geral"

- Cards clicáveis de todos os sites
- Filtros: Sistema (AxHub/AxCross), Status (Ativo/Inativo)
- Seleção múltipla para comparação
- Métricas rápidas em cada card:
  - AxHub: BI Reports, Equipamentos, OCR%
  - AxCross: Equipamentos, Faixas, Pass/dia
- Status visual (● verde/vermelho)
- Badges de tipo de contrato

**Interação**: Clicar seleciona, botão "Comparar Selecionados" navega para aba 3

---

### **Aba 2: 📋 Lista Geral** (Tabela)
**Origem**: PainelProcessos aba "Sites"

- Tabela completa de TODOS os sites
- **Colunas**:
  - Nome | Sistema | UF | URL | Versão | Equip. | Faixas | Veículos | Pass/Dia | Status
- Filtros: Sistema, Status, Busca por nome/estado
- Ordenação por qualquer coluna
- Link direto para URL do site
- Clique na linha expande detalhes inline
- Exportar CSV/Excel
- Contador: "Mostrando X de Y sites"

**Interação**: Clicar na linha mostra detalhes expandidos abaixo da tabela

---

### **Aba 3: ⚖️ Comparativo** (Lado a Lado)
**Origem**: AnalisesSites aba "Comparar"

- Comparação tabular lado a lado
- **3 sub-seções**:
  1. **Funcionalidades Ativas** (checkmarks)
  2. **Relatórios BI** (quais sites têm cada relatório)
  3. **Métricas Gerais** (Versão, Menus, Equipamentos, OCR, Fabricantes)
- Sites comparados: selecionados na aba 1 OU todos ativos
- Botão "Limpar Seleção" / "Selecionar Todos"
- Exportar comparação como PDF/Excel

**Interação**: Usa seleção da aba 1, ou compara todos ativos por padrão

---

### **Aba 4: 🔍 Guia Detalhado** (Ficha Individual)
**Origem**: GuiaSites + AnalisesSites aba "Detalhe"

- **Dropdown**: Selecionar site
- **Ficha Completa** (2 colunas):
  - **Coluna 1**:
    - 📋 Informações Gerais (URL, Estado, Versão, Menus, Tipo, Status)
    - 🔧 Funcionalidades Ativas (lista com checkmarks)
    - 📈 Relatórios BI (separado: Exclusivos vs Padrão)
  - **Coluna 2**:
    - 📡 Equipamentos & Fabricantes (Grupos, Fabricantes, Total)
    - 🔧 Tela de Operações (Colunas configuradas)
    - 💡 Observações
- Link direto "🔗 Acessar Site"
- Botão "Comparar com Outro Site"

**Interação**: Seletor dropdown, visualização de ficha completa

---

### **Aba 5: 🎫 Chamados & Suporte** (Tickets)
**Origem**: ChamadosSites

- **KPI Cards** (linha superior):
  - Total Chamados | Abertos | Fechados | Críticos | Sem Resposta | Sites c/ Demanda | Não Associados
- **Ranking de Demandas** (tabela):
  - Site | Sistema | Estado | Abertos | Total | Críticos | Proporção (barra visual)
  - Ordenado por chamados abertos (descendente)
- **Seleção de Site** (dropdown ou clique no ranking):
  - Mostra tabela de tickets do site:
    - ID | Assunto | Prioridade | Status | Técnico | Atualizado
    - Links diretos para Jitbit
- **Duplicados** (seção expandível):
  - Lista de possíveis tickets duplicados
  - Agrupados por assunto normalizado
- **Categorias Não Associadas** (seção expandível):
  - Permite associação manual de categorias

**Interação**: Clique no ranking abre detalhes do site, links externos para Jitbit

---

### **Aba 6: 🧠 Intelligence & Analytics**
**Origem**: IntelligenceHub

- **Dashboard de Análise Cruzada**:
  - Gráficos de OCR por site
  - Equipamentos por fabricante
  - Passagens por estado/região
  - Evolução temporal de métricas
- **Análise de Padrões**:
  - Sites com melhor performance
  - Sites com anomalias
  - Correlações (OCR vs Equipamentos, etc.)
- **Recomendações**:
  - Sites que precisam atenção
  - Oportunidades de melhoria
- **Exportar Relatório** (PDF/PowerPoint)

**Interação**: Visualizações interativas, filtros por período/sistema

---

### **Aba 7: 🔐 Credenciais** (Gerenciamento)
**Origem**: CredenciaisManager (já existe em AnalisesSites)

- Tabela de credenciais de acesso
- CRUD completo:
  - Adicionar nova credencial
  - Editar existente
  - Deletar (com confirmação)
  - Testar conexão
- Campos: Site, URL, Username, Password (masked), Notas
- Botão "Testar Todos" (verifica acesso em batch)
- Status de última validação

**Interação**: CRUD completo, teste de conexão

---

### **Aba 8: 🏥 Status Operacional** (Health Check)
**Origem**: Nova funcionalidade

- **Dashboard em Tempo Real**:
  - Status de disponibilidade de cada site (ping/health check)
  - Tempo de resposta (ms)
  - Última verificação
  - Uptime (%)
- **Alertas**:
  - Sites fora do ar (vermelho)
  - Sites lentos (amarelo)
  - Sites OK (verde)
- **Histórico de Disponibilidade** (gráfico últimas 24h)
- Botão "Verificar Agora" (força check em todos)

**Interação**: Auto-refresh a cada 5 minutos, forçar verificação manual

---

### **Aba 9: 📚 Metodologia** (Explicativo)
**Origem**: AnalisesSites painel metodologia

- Painel expandível/contraível
- **Seções**:
  - 🔬 Como a análise foi feita
  - 📑 Explicação de cada aba
  - 📋 Campos analisados (AxHub e AxCross)
  - 📐 Critérios de classificação
  - 🏷️ Tipos de contrato (glossário)
- Sempre acessível (botão flutuante "?" no canto)

**Interação**: Modal ou painel lateral, sempre disponível

---

## 🎨 WIREFRAME — Layout da Central de Sites

```
┌───────────────────────────────────────────────────────────────────┐
│ 🏢 Central de Sites — Gerenciamento Completo                      │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│ [📊 Visão Geral] [📋 Lista] [⚖️ Comparar] [🔍 Guia] [🎫 Chamados] │
│ [🧠 Intelligence] [🔐 Credenciais] [🏥 Status] [📚 Metodologia]   │
│                                                                    │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│   [Filtros] AxHub ▼  Ativo ▼  [🔍 Buscar...]  📥 Exportar        │
│                                                                    │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│   │ IBAMETRO │  │  IMEPI   │  │ IMEQPB   │  │ IMETROPA │        │
│   │ Metrologia│  │Metrologia│  │Metrologia│  │Metrologia│        │
│   │ ● BA     │  │ ● PI     │  │ ● PB     │  │ ● PA     │        │
│   │ 9 BI     │  │ 9 BI     │  │ 9 BI     │  │ 9 BI     │        │
│   │ 30 Eq.   │  │ 2 Eq.    │  │ ? Eq.    │  │ ? Eq.    │        │
│   │ 96.76% ▲ │  │ 80.25%   │  │ 49.96% ▼ │  │ ?        │        │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                    │
│   [ 4 sites selecionados ] [Comparar Selecionados →]             │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
                    [?] ← Botão Metodologia (flutuante)
```

---

## 🔄 MIGRAÇÃO — Passo a Passo

### **Fase 1: Criar Estrutura Base** (2-3h)

1. ✅ Criar pasta `src/pages/CentralSites/`
2. ✅ Criar `index.jsx` com estrutura de 9 tabs
3. ✅ Criar `CentralSites.css` consolidado
4. ✅ Criar pasta `components/` com arquivos vazios

### **Fase 2: Migrar Componentes** (5-6h)

1. ✅ **VisaoGeral.jsx**: Copiar de AnalisesSites aba "Visão Geral"
2. ✅ **ListaGeral.jsx**: Copiar de PainelProcessos aba "Sites"
3. ✅ **Comparativo.jsx**: Copiar de AnalisesSites aba "Comparar"
4. ✅ **GuiaDetalhado.jsx**: Fundir GuiaSites + AnalisesSites aba "Detalhe"
5. ✅ **Chamados.jsx**: Copiar de ChamadosSites (completo)
6. ✅ **Intelligence.jsx**: Copiar IntelligenceHub
7. ✅ **Credenciais.jsx**: Copiar de CredenciaisManager
8. ✅ **Metodologia.jsx**: Copiar de AnalisesSites painel metodologia

### **Fase 3: Criar Novos Componentes** (2-3h)

1. ✅ **StatusOperacional.jsx**: Criar do zero (health check)
2. ✅ **useSites.js**: Hook consolidado para dados
3. ✅ **useTickets.js**: Hook para helpdesk

### **Fase 4: Integração** (2-3h)

1. ✅ Adicionar rota no `App.jsx`: `/central-sites`
2. ✅ Atualizar menu: 🎯 Operações → "Central de Sites"
3. ✅ Testar navegação entre abas
4. ✅ Testar seleção de sites
5. ✅ Testar exportação

### **Fase 5: Deprecar Páginas Antigas** (1h)

1. ✅ Remover rotas:
   - `/analise` (AnalisesSites)
   - `/guia-sites` (GuiaSites)
   - `/chamados-sites` (ChamadosSites)
2. ✅ Remover aba "Sites" do PainelProcessos
3. ✅ Adicionar redirects para `/central-sites`
4. ✅ Atualizar todos os links internos

### **Fase 6: Documentação** (1h)

1. ✅ Atualizar README
2. ✅ Documentar estrutura de abas
3. ✅ Criar guia de uso
4. ✅ Atualizar análise de consolidação

**Total Estimado**: 13-17 horas de desenvolvimento

---

## 📊 BENEFÍCIOS DA CONSOLIDAÇÃO

### **Para o Usuário**

| Benefício | Antes | Depois |
|-----------|-------|--------|
| **Navegação** | 4+ telas diferentes | 1 tela, 9 abas |
| **Contexto** | Disperso, precisa lembrar onde está cada coisa | Tudo em um só lugar |
| **Comparação** | Abrir múltiplas abas do navegador | Tudo lado a lado |
| **Chamados** | Tela separada do resto | Integrado com dados do site |
| **Eficiência** | 5-10 cliques para ver tudo | 1-2 cliques |

### **Para o Desenvolvedor**

| Benefício | Antes | Depois |
|-----------|-------|--------|
| **Manutenção** | 4 arquivos grandes | 9 componentes pequenos |
| **Reuso** | Código duplicado | Componentes reutilizáveis |
| **Testes** | Testar 4 páginas | Testar 1 módulo |
| **Bugs** | Difícil rastrear | Isolado por aba |

### **Métricas de Redução**

- **Rotas**: 4 → 1 (redução de 75%)
- **Menus**: 3 itens → 1 item (redução de 67%)
- **Código duplicado**: ~40% de redundância eliminada
- **Navegação do usuário**: ~60% menos cliques

---

## ⚠️ RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Performance** (muitos dados em 1 página) | Média | Alto | Lazy loading de abas, paginação |
| **UX complexa** (muitas abas) | Baixa | Médio | Organização lógica, tooltips |
| **Migração de dados** | Baixa | Alto | Testar em ambiente dev primeiro |
| **Usuários habituados** às telas antigas | Alta | Baixo | Redirects automáticos, tutorial |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Preparação**
- [ ] Revisar análise com stakeholders
- [ ] Aprovar estrutura de 9 abas
- [ ] Definir prioridade de implementação
- [ ] Criar branch `feature/central-sites`

### **Desenvolvimento**
- [ ] Criar estrutura de pastas
- [ ] Migrar componente por componente
- [ ] Implementar navegação entre abas
- [ ] Criar StatusOperacional (novo)
- [ ] Testar integrações

### **Validação**
- [ ] Testar cada aba individualmente
- [ ] Testar navegação entre abas
- [ ] Testar filtros e buscas
- [ ] Testar seleção de sites
- [ ] Testar exportação de dados
- [ ] Testar responsividade mobile

### **Deploy**
- [ ] Remover páginas antigas
- [ ] Adicionar redirects
- [ ] Atualizar menus
- [ ] Documentar mudanças
- [ ] Notificar usuários

---

## 🎯 PRÓXIMOS PASSOS

1. **Aprovar esta análise** ✋ (usuário decide)
2. **Priorizar abas** (quais implementar primeiro)
3. **Iniciar implementação** (Fase 1)
4. **Testar incremental** (aba por aba)
5. **Deploy gradual** (beta test)

---

## 📝 CONCLUSÃO

A consolidação de **7 locais diferentes** em **1 Central de Sites** com **9 abas** trará:

✅ **Simplicidade** para o usuário  
✅ **Manutenibilidade** para o desenvolvedor  
✅ **Eficiência** operacional  
✅ **Consistência** de interface  
✅ **Escalabilidade** futura  

**Recomendação**: ✅ **APROVAR E IMPLEMENTAR**

---

**Arquivo criado**: `ANALISE-CONSOLIDACAO-SITES-COMPLETA.md`  
**Próxima ação**: Aguardar aprovação do usuário para iniciar implementação
