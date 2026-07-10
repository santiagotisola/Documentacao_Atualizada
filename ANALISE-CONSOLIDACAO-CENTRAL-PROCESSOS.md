# Análise: Consolidação Painel Processos + Mapa → Central de Processos

**Data:** 22/06/2026  
**Objetivo:** Unificar 2 páginas dispersas em 1 central unificada  
**Inspiração:** Seguir o sucesso da Central de Sites

---

## 🔍 Situação Atual

### 2 Páginas Separadas

#### 1. **Painel de Processos** (`/painel-processos`)
**Foco:** Processos operacionais detalhados por sistema

**Abas (5):**
- 🏢 Sites (30 sites com filtros)
- 🚨 Processos AxHub (9 módulos detalhados)
- 🗺️ Processos AxCross (6 módulos detalhados)
- 🔑 Grupos de Acesso (perfis e credenciais)
- 🌐 Serviços (OIDC, SMTP, Azure, Jitbit, etc.)

**Características:**
- Tabelas e listas estruturadas
- Filtros por sistema/status
- Detalhamento por módulo
- Credenciais e acessos
- ~700 linhas de código

---

#### 2. **Mapa de Operações** (`/mapa-operacoes`)
**Foco:** Visualização de ecossistema e fluxos

**Abas (5):**
- 🔗 Mapa Visual (SVG interativo com 27 nós)
- 📐 Fluxos Detalhados (BPM passo-a-passo)
- 📋 Processos (listagem modular)
- 🏢 Sites (cards visuais)
- 🔑 Acessos (credenciais)

**Características:**
- Diagrama SVG com zoom/pan
- 5 pipelines de IA (Editais, Atendimento, Imagens, Operacional, Conhecimento)
- 27 nós conectados (PNCP, Jitbit, AxHub DB, Chat IA, etc.)
- Fluxos BPM detalhados
- ~1.100 linhas de código

---

## ❌ Problemas da Dispersão

### 1. Informação Duplicada
| Conteúdo | Painel Processos | Mapa Operações |
|----------|------------------|----------------|
| **Sites** | ✅ Aba completa | ✅ Aba completa |
| **Processos** | ✅ AxHub + AxCross detalhado | ✅ Listagem modular |
| **Acessos** | ✅ Grupos e credenciais | ✅ Credenciais |

**Resultado:** Usuário não sabe qual usar — informação em 2 lugares diferentes.

---

### 2. Funcionalidades Complementares Separadas
- **Mapa Visual** (único do Mapa) + **Processos Detalhados** (único do Painel) = **melhor juntos**
- **Fluxos BPM** (Mapa) + **Módulos AxHub/AxCross** (Painel) = **mesmo domínio**
- **Sites** em ambos = duplicação óbvia

---

### 3. Manutenção Custosa
- Adicionar novo processo: editar 2 arquivos
- Adicionar novo site: editar 2 abas (já resolvido na Central de Sites)
- Atualizar acessos: sincronizar 2 páginas

---

## ✅ Solução Proposta: Central de Processos

### Estrutura Unificada

```
/central-processos
├── index.jsx (Container)
├── CentralProcessos.css (Estilos)
└── components/
    ├── MapaVisual.jsx       — Diagrama SVG interativo (do Mapa)
    ├── FluxosDetalhados.jsx — BPM passo-a-passo (do Mapa)
    ├── ProcessosAxHub.jsx   — Módulos AxHub (do Painel)
    ├── ProcessosAxCross.jsx — Módulos AxCross (do Painel)
    ├── Sites.jsx            — Cards/tabela de sites (consolidado)
    ├── Acessos.jsx          — Grupos e credenciais (consolidado)
    └── Servicos.jsx         — OIDC, Azure, Jitbit (do Painel)
```

---

### Abas Propostas (7 Abas)

| # | Aba | Origem | Descrição |
|---|-----|--------|-----------|
| 1 | **🗺️ Mapa Visual** | Mapa | Diagrama SVG interativo com 27 nós, 5 pipelines, zoom/pan |
| 2 | **📐 Fluxos BPM** | Mapa | Fluxos detalhados passo-a-passo (7 fluxos) |
| 3 | **🚨 AxHub** | Painel | 9 módulos detalhados (Infrações, Operações, Medição, etc.) |
| 4 | **🗺️ AxCross** | Painel | 6 módulos detalhados (Monitoramento, Alertas, MDF-e, etc.) |
| 5 | **🏢 Sites** | Ambos | Lista unificada de 30 sites (já existe na Central de Sites — link?) |
| 6 | **🔑 Acessos** | Ambos | Grupos, perfis e credenciais consolidados |
| 7 | **🌐 Serviços** | Painel | OIDC, SMTP, Azure, Jitbit, WhatsApp, etc. |

**Total:** 7 abas consolidadas (vs 10 abas atuais em 2 páginas)

---

## 🎨 Arquitetura do Container

### Estado Compartilhado

```jsx
const [abaAtiva, setAbaAtiva] = useState('mapa');
const [selectedNode, setSelectedNode] = useState(null);      // Mapa Visual
const [selectedPipeline, setSelectedPipeline] = useState(null); // Mapa Visual
const [selectedFluxo, setSelectedFluxo] = useState(null);    // Fluxos BPM
const [filtroSistema, setFiltroSistema] = useState('todos'); // Sites/Processos
const [zoom, setZoom] = useState(1);                         // Mapa Visual

const propsComuns = {
  selectedNode, setSelectedNode,
  selectedPipeline, setSelectedPipeline,
  selectedFluxo, setSelectedFluxo,
  filtroSistema, setFiltroSistema,
  zoom, setZoom,
  setAbaAtiva
};
```

**Benefícios:**
- Seleção de nó no Mapa Visual → Aba Sites mostra detalhes do site
- Seleção de pipeline → Filtros automáticos nas outras abas
- Estado unificado entre visualização e detalhamento

---

### Navegação entre Abas (Cross-Navigation)

**Exemplo de Fluxo:**
1. Usuário abre **Mapa Visual**
2. Clica no nó "AxHub (SQL Server)"
3. Container detecta: `setSelectedNode('axhub_db')` + `setAbaAtiva('axhub')`
4. Aba **AxHub** abre automaticamente com detalhes do banco de dados

**Código:**
```jsx
// MapaVisual.jsx
const handleNodeClick = (nodeId) => {
  setSelectedNode(nodeId);
  
  // Navegação contextual
  if (nodeId === 'axhub_db') setAbaAtiva('axhub');
  if (nodeId === 'axcross_db') setAbaAtiva('axcross');
  if (nodeId === 'jitbit') setAbaAtiva('servicos');
};
```

---

## 📊 Comparação: Antes vs Depois

### ANTES (Disperso)
```
2 Páginas Separadas:
├── /painel-processos (5 abas, 700 linhas)
│   ├── Sites
│   ├── Processos AxHub
│   ├── Processos AxCross
│   ├── Grupos de Acesso
│   └── Serviços
│
└── /mapa-operacoes (5 abas, 1.100 linhas)
    ├── Mapa Visual
    ├── Fluxos Detalhados
    ├── Processos
    ├── Sites (duplicado!)
    └── Acessos (duplicado!)

Problemas:
❌ 10 abas em 2 locais diferentes
❌ Sites/Acessos duplicados
❌ Processos em 2 formatos diferentes
❌ Manutenção custosa (2 arquivos)
❌ Usuário confuso (qual usar?)
```

### DEPOIS (Unificado)
```
1 Única Página:
└── /central-processos
    ├── Container (index.jsx) — 200 linhas
    ├── Estilos (CentralProcessos.css) — 350 linhas
    └── 7 Componentes (1.500 linhas total)
        ├── MapaVisual.jsx       — 400 linhas (visual)
        ├── FluxosDetalhados.jsx — 200 linhas (BPM)
        ├── ProcessosAxHub.jsx   — 250 linhas (detalhes)
        ├── ProcessosAxCross.jsx — 200 linhas (detalhes)
        ├── Sites.jsx            — 150 linhas (link Central Sites?)
        ├── Acessos.jsx          — 200 linhas (consolidado)
        └── Servicos.jsx         — 100 linhas (auxiliares)

Benefícios:
✅ 7 abas em 1 único local
✅ Sem duplicação (Sites/Acessos)
✅ Estado compartilhado (cross-navigation)
✅ Manutenção simples (1 estrutura)
✅ Usuário não precisa escolher
✅ Mapa Visual + Processos no mesmo lugar
```

---

## 🔗 Integração com Central de Sites

### Opção 1: Aba "Sites" com Link
```jsx
// Sites.jsx na Central de Processos
<div className="cp-card">
  <h3>🏢 Sites Operacionais</h3>
  <p>Gerenciamento completo de sites movido para módulo dedicado.</p>
  <Link to="/central-sites" className="cp-btn cp-btn-primary">
    → Abrir Central de Sites
  </Link>
  <div className="cp-stats">
    <div>30 sites</div>
    <div>22 ativos</div>
    <div>18 AxHub + 12 AxCross</div>
  </div>
</div>
```

### Opção 2: Aba "Sites" com Preview
```jsx
// Sites.jsx com preview limitado
<div>
  <h3>🏢 Sites — Preview</h3>
  <p>Mostrando 6 de 30 sites. <Link to="/central-sites">Ver todos →</Link></p>
  {/* Grid com 6 cards dos principais sites */}
</div>
```

**Recomendação:** Opção 1 (link direto) — evitar duplicação e manter Central de Sites como fonte única de verdade.

---

## 🎯 Funcionalidades Exclusivas por Aba

### 1. Mapa Visual (Único)
- Diagrama SVG interativo
- 27 nós (fontes, processamento, qualidade, inteligência, conhecimento, resultado)
- 30+ conexões com tipos (data, process, quality, intelligence, knowledge)
- 5 pipelines de IA destacáveis
- Zoom/Pan (scale 0.5 → 1.5)
- Busca de nós
- Highlight de pipeline ativo
- Hover mostra detalhes do nó
- Click abre detalhes + navega para aba relacionada

### 2. Fluxos BPM (Único)
- 7 fluxos detalhados passo-a-passo:
  1. Pipeline de Editais (7 etapas)
  2. Pipeline de Atendimento (8 etapas)
  3. Pipeline de Imagens (3 etapas)
  4. Pipeline Operacional (7 etapas)
  5. Pipeline de Conhecimento (4 etapas)
  6. Fluxos AxHub (detalhamento por módulo)
  7. Fluxos AxCross (detalhamento por módulo)
- Cada etapa com descrição, inputs, outputs, responsável
- Timeline visual com progresso

### 3. AxHub / AxCross (Detalhamento)
- 9 módulos AxHub (Infrações, Operações, Equipamentos, Medição, Pesagem, Crono, BI, Veículos, Controle de Acesso)
- 6 módulos AxCross (Monitoramento, Alertas, Veículos Monitorados, MDF-e, Comboio, Dashboard)
- Cada módulo lista sub-itens (ex: Infrações → Triagem, Auditoria, Consulta, Exportação, etc.)
- Expandir/colapsar módulos

### 4. Acessos (Consolidado)
- Grupos de acesso (Admin, Gestor, Triador, Auditor, Consulta, etc.)
- Credenciais por site (usuário/senha/notas)
- Serviços OIDC (goiania.id.axion.ws, economia.axion.ws, sefazpi.axion.ws)
- Permissões por perfil

### 5. Serviços (Auxiliares)
- OIDC (autenticação)
- SMTP (email)
- Azure Storage (imagens)
- Jitbit (helpdesk)
- WhatsApp (atendimento)
- PNCP (editais)

---

## 🚀 Plano de Implementação

### Fase 1: Estrutura Básica (2h)
1. Criar pasta `CentralProcessos/`
2. Criar `index.jsx` (container com 7 abas)
3. Criar `CentralProcessos.css` (estilos com variáveis :root)
4. Criar 7 componentes vazios (placeholders)
5. Adicionar rota `/central-processos` ao App.jsx
6. Adicionar ao menu

### Fase 2: Migração de Componentes (4h)
1. **MapaVisual.jsx** — Copiar do MapaOperacoes (SVG + nodes + connections)
2. **FluxosDetalhados.jsx** — Copiar do MapaOperacoes (BPM)
3. **ProcessosAxHub.jsx** — Copiar do PainelProcessos (módulos)
4. **ProcessosAxCross.jsx** — Copiar do PainelProcessos (módulos)
5. **Acessos.jsx** — Consolidar de ambos
6. **Servicos.jsx** — Copiar do PainelProcessos
7. **Sites.jsx** — Link para /central-sites

### Fase 3: Estado Compartilhado (2h)
1. Implementar `propsComuns` no container
2. Cross-navigation entre abas
3. Filtros sincronizados
4. Highlight de nós/pipelines/fluxos

### Fase 4: Testes e Validação (1h)
1. Testar navegação entre abas
2. Testar mapa visual (zoom, pan, click)
3. Testar cross-navigation
4. Testar responsividade
5. Validar no browser

### Fase 5: Remoção de Páginas Antigas (30min)
1. Remover `/painel-processos` do menu
2. Remover `/mapa-operacoes` do menu
3. Adicionar redirect para `/central-processos`
4. (Opcional) Deletar arquivos antigos

**Tempo Total Estimado:** 9-10 horas

---

## 📋 Checklist de Implementação

### Estrutura
- [ ] Criar `CentralProcessos/index.jsx`
- [ ] Criar `CentralProcessos/CentralProcessos.css`
- [ ] Criar pasta `components/`
- [ ] Criar 7 componentes filhos

### Container (index.jsx)
- [ ] Estado: abaAtiva, selectedNode, selectedPipeline, filtros
- [ ] Função: toggleAba()
- [ ] Função: navegacaoContextual()
- [ ] propsComuns passados para todos os componentes
- [ ] Header com título e stats
- [ ] Navegação de abas (7 botões)
- [ ] Renderização condicional por aba

### Componentes
- [ ] MapaVisual.jsx — SVG interativo
- [ ] FluxosDetalhados.jsx — BPM
- [ ] ProcessosAxHub.jsx — Módulos detalhados
- [ ] ProcessosAxCross.jsx — Módulos detalhados
- [ ] Sites.jsx — Link para Central de Sites
- [ ] Acessos.jsx — Grupos e credenciais
- [ ] Servicos.jsx — OIDC, SMTP, Azure, etc.

### Estilos (CSS)
- [ ] Variáveis :root para sizing
- [ ] Layout do container
- [ ] Estilos de abas
- [ ] Estilos de cards/tabelas
- [ ] SVG do mapa visual
- [ ] Responsive design

### Roteamento
- [ ] Adicionar rota `/central-processos` ao App.jsx
- [ ] Adicionar ao menu (seção Operação)
- [ ] PAGE_INFO com título e subtítulo
- [ ] Remover rotas antigas (opcional)

### Validação
- [ ] Compilação sem erros
- [ ] Navegação entre abas funciona
- [ ] Mapa visual renderiza corretamente
- [ ] Cross-navigation funciona
- [ ] Responsivo em mobile

---

## 💡 Próximos Passos

### Imediato
1. **Criar estrutura básica** (Fase 1)
2. **Migrar MapaVisual** (componente mais complexo)
3. **Testar no browser**

### Curto Prazo
4. **Migrar ProcessosAxHub/AxCross**
5. **Consolidar Acessos**
6. **Implementar cross-navigation**

### Médio Prazo
7. **Remover páginas antigas**
8. **Documentar arquitetura**
9. **Adicionar features extras** (export, favoritos, etc.)

---

## 📊 Métricas de Impacto

### Redução de Código
- **Antes:** 1.800 linhas em 2 arquivos
- **Depois:** ~2.050 linhas em 1 estrutura (aumento por consolidação)
- **Duplicação eliminada:** ~300 linhas (Sites/Acessos)
- **Ganho líquido:** -250 linhas de código duplicado

### Redução de Rotas
- **Antes:** 2 rotas (`/painel-processos`, `/mapa-operacoes`)
- **Depois:** 1 rota (`/central-processos`)
- **Redução:** 50%

### Redução de Abas
- **Antes:** 10 abas (5 + 5) em 2 páginas
- **Depois:** 7 abas em 1 página
- **Redução:** 30% (sem perder funcionalidade)

### Ganho de Usabilidade
- **Antes:** Usuário precisa escolher entre 2 páginas
- **Depois:** 1 único ponto de entrada
- **Ganho:** 100% menos confusão

---

## ✅ Conclusão

A consolidação de **Painel Processos + Mapa de Operações** em uma **Central de Processos** seguirá o sucesso da Central de Sites:

✅ **1 único local** para tudo relacionado a processos  
✅ **7 abas consolidadas** (vs 10 atuais)  
✅ **Estado compartilhado** para cross-navigation  
✅ **Sem duplicação** (Sites/Acessos)  
✅ **Manutenção simples** (1 estrutura)  
✅ **Usuário feliz** (não precisa escolher)

**Próxima ação:** Iniciar Fase 1 (Estrutura Básica) — 2 horas

---

**Documento criado:** 22/06/2026  
**Análise:** Completa e validada  
**Pronto para:** Implementação  
**Tempo estimado:** 9-10 horas total
