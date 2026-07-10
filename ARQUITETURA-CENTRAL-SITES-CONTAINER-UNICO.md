# 🏗️ ARQUITETURA — Central de Sites (Container Único)

**Data**: 2026-06-22  
**Objetivo**: Todas as 9 abas em um único formulário/container com layout centralizado

---

## 🎯 CONCEITO — Container Único

### **Problema Atual (Múltiplas Telas)**

```
❌ HOJE — 4 componentes separados:

src/pages/
├── AnalisesSites.jsx     (800 linhas, estilos próprios)
├── GuiaSites.jsx          (400 linhas, estilos próprios)
├── ChamadosSites.jsx      (500 linhas, estilos próprios)
└── PainelProcessos.jsx    (800 linhas, estilos próprios)

= 4 ARQUIVOS, 4 LAYOUTS, 4 CSS, 4 RESPONSIVIDADES
= Redimensionar = alterar 4 lugares diferentes
```

### **Solução Proposta (Container Único)**

```
✅ PROPOSTA — 1 container, 9 abas:

src/pages/CentralSites/
├── index.jsx              ← CONTAINER ÚNICO (150 linhas)
├── CentralSites.css       ← ESTILOS GLOBAIS (300 linhas)
└── components/
    ├── VisaoGeral.jsx     (200 linhas)
    ├── ListaGeral.jsx     (150 linhas)
    ├── Comparativo.jsx    (200 linhas)
    ├── GuiaDetalhado.jsx  (250 linhas)
    ├── Chamados.jsx       (300 linhas)
    ├── Intelligence.jsx   (250 linhas)
    ├── Credenciais.jsx    (150 linhas)
    ├── StatusOperacional.jsx (200 linhas)
    └── Metodologia.jsx    (100 linhas)

= 1 CONTAINER, 1 LAYOUT GLOBAL, 1 CSS, 1 RESPONSIVIDADE
= Redimensionar = alterar 1 arquivo (CentralSites.css)
```

---

## 📐 ESTRUTURA — Hierarquia de Componentes

### **Árvore de Componentes**

```jsx
<CentralSites>                          ← CONTAINER PRINCIPAL
  │
  ├── <Header>                          ← FIXO (não muda entre abas)
  │   ├── Título: "🏢 Central de Sites"
  │   ├── Breadcrumb: Home > Operações > Central de Sites
  │   └── Botões Globais: [📥 Exportar] [⚙️ Configurações] [? Ajuda]
  │
  ├── <NavegacaoAbas>                   ← NAVEGAÇÃO (fixa no topo)
  │   ├── [📊 Visão Geral]
  │   ├── [📋 Lista]
  │   ├── [⚖️ Comparar]
  │   ├── [🔍 Guia]
  │   ├── [🎫 Chamados]
  │   ├── [🧠 Intelligence]
  │   ├── [🔐 Credenciais]
  │   ├── [🏥 Status]
  │   └── [📚 Metodologia]
  │
  ├── <ConteudoAba>                     ← ÁREA DE CONTEÚDO (muda por aba)
  │   │
  │   ├─ Se aba === 'visao-geral':
  │   │   └── <VisaoGeral />            ← Componente específico
  │   │
  │   ├─ Se aba === 'lista':
  │   │   └── <ListaGeral />
  │   │
  │   ├─ Se aba === 'comparativo':
  │   │   └── <Comparativo />
  │   │
  │   └─ ... (outros 6)
  │
  └── <Footer>                          ← FIXO (não muda entre abas)
      ├── Status: "24 sites ativos"
      ├── Última atualização: "22/06/2026 14:30"
      └── Versão: "v2.0.0"
```

---

## 🎨 LAYOUT — Container Único (Wireframe)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🏢 Central de Sites                  [📥 Exportar] [⚙️] [?]         │ ← Header (80px fixo)
├─────────────────────────────────────────────────────────────────────┤
│ [📊 Visão Geral] [📋 Lista] [⚖️ Comparar] [🔍 Guia] [🎫 Chamados]  │
│ [🧠 Intelligence] [🔐 Credenciais] [🏥 Status] [📚 Metodologia]    │ ← Navegação (60px fixo)
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ╔═════════════════════════════════════════════════════════════╗  │
│   ║                                                             ║  │
│   ║                                                             ║  │
│   ║                  CONTEÚDO DA ABA ATIVA                     ║  │
│   ║            (Muda conforme aba selecionada)                 ║  │ ← Conteúdo (altura flexível)
│   ║                                                             ║  │
│   ║                                                             ║  │
│   ║                                                             ║  │
│   ╚═════════════════════════════════════════════════════════════╝  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ 24 sites ativos | Última atualização: 22/06/2026 14:30 | v2.0.0   │ ← Footer (40px fixo)
└─────────────────────────────────────────────────────────────────────┘

ALTURA TOTAL = 80px (header) + 60px (nav) + calc(100vh - 180px) + 40px (footer)
             = 100vh (tela inteira)
```

---

## 🔧 CÓDIGO — Container Principal (index.jsx)

### **Estrutura Simplificada**

```jsx
// src/pages/CentralSites/index.jsx
import React, { useState } from 'react';
import './CentralSites.css';

// Importar componentes das abas
import VisaoGeral from './components/VisaoGeral';
import ListaGeral from './components/ListaGeral';
import Comparativo from './components/Comparativo';
import GuiaDetalhado from './components/GuiaDetalhado';
import Chamados from './components/Chamados';
import Intelligence from './components/Intelligence';
import Credenciais from './components/Credenciais';
import StatusOperacional from './components/StatusOperacional';
import Metodologia from './components/Metodologia';

/* ═══════════════════════════════════════════════════════════════════
   CONTAINER ÚNICO — Central de Sites
   ═══════════════════════════════════════════════════════════════════ */

function CentralSites() {
  // ─── Estado da aba ativa ───────────────────────────────────────
  const [abaAtiva, setAbaAtiva] = useState('visao-geral');
  
  // ─── Estado compartilhado entre abas ──────────────────────────
  const [sitesSelecionados, setSitesSelecionados] = useState([]);
  const [filtros, setFiltros] = useState({
    sistema: 'todos',   // AxHub, AxCross, AxTon, todos
    status: 'todos',    // ativo, inativo, todos
    busca: ''           // texto de busca
  });

  // ─── Configuração das abas ────────────────────────────────────
  const ABAS = [
    { id: 'visao-geral', label: '📊 Visão Geral', badge: null },
    { id: 'lista', label: '📋 Lista', badge: '24' },
    { id: 'comparativo', label: '⚖️ Comparar', badge: sitesSelecionados.length || null },
    { id: 'guia', label: '🔍 Guia', badge: null },
    { id: 'chamados', label: '🎫 Chamados', badge: '12' },
    { id: 'intelligence', label: '🧠 Intelligence', badge: null },
    { id: 'credenciais', label: '🔐 Credenciais', badge: null },
    { id: 'status', label: '🏥 Status', badge: null },
    { id: 'metodologia', label: '📚 Metodologia', badge: null }
  ];

  // ─── Renderizar componente da aba ativa ───────────────────────
  const renderizarConteudo = () => {
    // Props comuns para todas as abas
    const propsComuns = {
      sitesSelecionados,
      setSitesSelecionados,
      filtros,
      setFiltros,
      navegarParaAba: setAbaAtiva  // Permite navegação entre abas
    };

    switch (abaAtiva) {
      case 'visao-geral':
        return <VisaoGeral {...propsComuns} />;
      case 'lista':
        return <ListaGeral {...propsComuns} />;
      case 'comparativo':
        return <Comparativo {...propsComuns} />;
      case 'guia':
        return <GuiaDetalhado {...propsComuns} />;
      case 'chamados':
        return <Chamados {...propsComuns} />;
      case 'intelligence':
        return <Intelligence {...propsComuns} />;
      case 'credenciais':
        return <Credenciais {...propsComuns} />;
      case 'status':
        return <StatusOperacional {...propsComuns} />;
      case 'metodologia':
        return <Metodologia {...propsComuns} />;
      default:
        return <VisaoGeral {...propsComuns} />;
    }
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="central-sites-container">
      
      {/* ═══ HEADER ═══ */}
      <header className="cs-header">
        <div className="cs-header-left">
          <h1 className="cs-titulo">🏢 Central de Sites</h1>
          <nav className="cs-breadcrumb">
            <span>Home</span> › <span>Operações</span> › <span className="active">Central de Sites</span>
          </nav>
        </div>
        <div className="cs-header-right">
          <button className="cs-btn-exportar">📥 Exportar</button>
          <button className="cs-btn-config">⚙️</button>
          <button className="cs-btn-ajuda">?</button>
        </div>
      </header>

      {/* ═══ NAVEGAÇÃO DE ABAS ═══ */}
      <nav className="cs-navegacao-abas">
        {ABAS.map(aba => (
          <button
            key={aba.id}
            className={`cs-aba ${abaAtiva === aba.id ? 'active' : ''}`}
            onClick={() => setAbaAtiva(aba.id)}
          >
            {aba.label}
            {aba.badge && <span className="cs-aba-badge">{aba.badge}</span>}
          </button>
        ))}
      </nav>

      {/* ═══ CONTEÚDO DA ABA ═══ */}
      <main className="cs-conteudo">
        {renderizarConteudo()}
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="cs-footer">
        <span>24 sites ativos</span>
        <span>Última atualização: 22/06/2026 14:30</span>
        <span>v2.0.0</span>
      </footer>

    </div>
  );
}

export default CentralSites;
```

---

## 🎨 CSS — Estilos Globais (CentralSites.css)

### **Sistema de Layout Centralizado**

```css
/* ═══════════════════════════════════════════════════════════════════
   CENTRAL DE SITES — ESTILOS GLOBAIS
   Todos os estilos de layout, tamanho e responsividade em 1 arquivo
   ═══════════════════════════════════════════════════════════════════ */

/* ─── VARIÁVEIS GLOBAIS ───────────────────────────────────────────── */
:root {
  /* Altura dos elementos fixos */
  --cs-header-height: 80px;
  --cs-nav-height: 60px;
  --cs-footer-height: 40px;
  
  /* Larguras */
  --cs-max-width: 1400px;
  --cs-padding: 24px;
  
  /* Cores do tema */
  --cs-primary: #3b82f6;
  --cs-secondary: #6b7280;
  --cs-success: #22c55e;
  --cs-warning: #f59e0b;
  --cs-danger: #dc2626;
  --cs-background: #ffffff;
  --cs-surface: #f9fafb;
  --cs-border: #e5e7eb;
  --cs-text-primary: #111827;
  --cs-text-secondary: #6b7280;
  
  /* Sombras */
  --cs-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --cs-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --cs-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Transições */
  --cs-transition: all 0.2s ease;
}

/* ─── CONTAINER PRINCIPAL ─────────────────────────────────────────── */
.central-sites-container {
  /* Layout de altura total */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--cs-background);
  
  /* Limitar largura máxima */
  max-width: var(--cs-max-width);
  margin: 0 auto;
  
  /* Sombra lateral suave */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

/* ─── HEADER ──────────────────────────────────────────────────────── */
.cs-header {
  height: var(--cs-header-height);
  padding: 0 var(--cs-padding);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--cs-background);
  border-bottom: 2px solid var(--cs-border);
  box-shadow: var(--cs-shadow-sm);
  
  /* Fixar no topo ao rolar */
  position: sticky;
  top: 0;
  z-index: 100;
}

.cs-titulo {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--cs-text-primary);
  margin: 0;
}

.cs-breadcrumb {
  font-size: 0.875rem;
  color: var(--cs-text-secondary);
  margin-top: 4px;
}

.cs-header-right {
  display: flex;
  gap: 12px;
}

/* ─── NAVEGAÇÃO DE ABAS ───────────────────────────────────────────── */
.cs-navegacao-abas {
  height: var(--cs-nav-height);
  padding: 0 var(--cs-padding);
  display: flex;
  gap: 8px;
  background: var(--cs-surface);
  border-bottom: 1px solid var(--cs-border);
  overflow-x: auto;
  
  /* Fixar abaixo do header */
  position: sticky;
  top: var(--cs-header-height);
  z-index: 90;
}

.cs-aba {
  flex-shrink: 0;
  padding: 12px 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cs-text-secondary);
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: var(--cs-transition);
  white-space: nowrap;
  
  /* Remover estilos de botão */
  outline: none;
}

.cs-aba:hover {
  color: var(--cs-primary);
  background: rgba(59, 130, 246, 0.05);
}

.cs-aba.active {
  color: var(--cs-primary);
  border-bottom-color: var(--cs-primary);
  font-weight: 600;
}

.cs-aba-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: var(--cs-primary);
  border-radius: 12px;
}

/* ─── CONTEÚDO ────────────────────────────────────────────────────── */
.cs-conteudo {
  /* Altura flexível (ocupa espaço restante) */
  flex: 1;
  
  /* Padding interno */
  padding: var(--cs-padding);
  
  /* Cor de fundo */
  background: var(--cs-surface);
  
  /* Scroll vertical se necessário */
  overflow-y: auto;
  
  /* Altura mínima para não colapsar */
  min-height: 400px;
}

/* ─── FOOTER ──────────────────────────────────────────────────────── */
.cs-footer {
  height: var(--cs-footer-height);
  padding: 0 var(--cs-padding);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--cs-surface);
  border-top: 1px solid var(--cs-border);
  font-size: 0.75rem;
  color: var(--cs-text-secondary);
  
  /* Fixar no bottom */
  position: sticky;
  bottom: 0;
  z-index: 100;
}

/* ─── COMPONENTES COMUNS (usados por todas as abas) ──────────────── */

/* Filtros */
.cs-filtros {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.cs-filtro-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cs-filtro-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cs-text-primary);
}

.cs-filtro-item select,
.cs-filtro-item input {
  padding: 8px 12px;
  border: 1px solid var(--cs-border);
  border-radius: 6px;
  font-size: 0.875rem;
  transition: var(--cs-transition);
}

.cs-filtro-item select:focus,
.cs-filtro-item input:focus {
  outline: none;
  border-color: var(--cs-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Botões */
.cs-btn {
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: var(--cs-transition);
}

.cs-btn-primary {
  color: white;
  background: var(--cs-primary);
}

.cs-btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: var(--cs-shadow-md);
}

.cs-btn-secondary {
  color: var(--cs-text-primary);
  background: var(--cs-surface);
  border: 1px solid var(--cs-border);
}

.cs-btn-secondary:hover {
  background: var(--cs-border);
}

/* Cards */
.cs-card {
  background: var(--cs-background);
  border: 1px solid var(--cs-border);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--cs-shadow-sm);
  transition: var(--cs-transition);
}

.cs-card:hover {
  box-shadow: var(--cs-shadow-md);
  transform: translateY(-2px);
}

/* Tabelas */
.cs-tabela {
  width: 100%;
  border-collapse: collapse;
  background: var(--cs-background);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--cs-shadow-sm);
}

.cs-tabela thead {
  background: var(--cs-surface);
  border-bottom: 2px solid var(--cs-border);
}

.cs-tabela th {
  padding: 12px 16px;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--cs-text-secondary);
  text-transform: uppercase;
}

.cs-tabela td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--cs-border);
  font-size: 0.875rem;
  color: var(--cs-text-primary);
}

.cs-tabela tbody tr:hover {
  background: var(--cs-surface);
}

/* ─── RESPONSIVIDADE ──────────────────────────────────────────────── */

/* Tablet (≤ 1024px) */
@media (max-width: 1024px) {
  :root {
    --cs-max-width: 100%;
    --cs-padding: 16px;
  }
  
  .cs-header {
    height: 70px;
    --cs-header-height: 70px;
  }
  
  .cs-titulo {
    font-size: 1.5rem;
  }
  
  .cs-navegacao-abas {
    height: 50px;
    --cs-nav-height: 50px;
  }
  
  .cs-aba {
    padding: 8px 16px;
    font-size: 0.8125rem;
  }
}

/* Mobile (≤ 640px) */
@media (max-width: 640px) {
  :root {
    --cs-padding: 12px;
  }
  
  .cs-header {
    flex-direction: column;
    height: auto;
    padding: 12px;
    gap: 8px;
  }
  
  .cs-header-left,
  .cs-header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .cs-titulo {
    font-size: 1.25rem;
  }
  
  .cs-breadcrumb {
    font-size: 0.75rem;
  }
  
  .cs-navegacao-abas {
    height: auto;
    padding: 8px;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .cs-aba {
    padding: 6px 12px;
    font-size: 0.75rem;
  }
  
  .cs-footer {
    flex-direction: column;
    height: auto;
    padding: 8px;
    gap: 4px;
    text-align: center;
  }
  
  .cs-filtros {
    flex-direction: column;
    gap: 12px;
  }
}

/* ─── PRINT (para exportar PDF) ───────────────────────────────────── */
@media print {
  .cs-header-right,
  .cs-navegacao-abas,
  .cs-footer {
    display: none !important;
  }
  
  .cs-conteudo {
    padding: 0;
  }
  
  .cs-card {
    break-inside: avoid;
  }
}
```

---

## 📊 GERENCIAMENTO DE ESTADO — Centralizado

### **Estado Global (Compartilhado entre Abas)**

```jsx
// Estado no componente pai (CentralSites/index.jsx)
const [estadoGlobal, setEstadoGlobal] = useState({
  // Navegação
  abaAtiva: 'visao-geral',
  
  // Seleção
  sitesSelecionados: [],       // ['ibametro', 'imepi']
  siteParaDetalhe: null,        // 'ibametro'
  
  // Filtros
  filtros: {
    sistema: 'todos',           // AxHub | AxCross | AxTon | todos
    status: 'todos',            // ativo | inativo | todos
    tipo: 'todos',              // Metrologia | Trânsito | ...
    busca: '',                  // texto livre
    estado: 'todos'             // BA | PI | PB | ...
  },
  
  // Dados
  sites: [],                    // Lista de todos os sites (carregada na montagem)
  tickets: [],                  // Chamados (carregados lazy na aba 5)
  credentials: [],              // Credenciais (carregadas lazy na aba 7)
  healthStatus: {},             // Status operacional (carregado lazy na aba 8)
  
  // UI
  loading: false,
  error: null
});

// Props passadas para TODAS as abas:
const propsComuns = {
  // Estado
  ...estadoGlobal,
  
  // Setters
  setAbaAtiva: (aba) => setEstadoGlobal(prev => ({ ...prev, abaAtiva: aba })),
  setSitesSelecionados: (sites) => setEstadoGlobal(prev => ({ ...prev, sitesSelecionados: sites })),
  setFiltros: (filtros) => setEstadoGlobal(prev => ({ ...prev, filtros })),
  
  // Ações
  selecionarSite: (id) => {
    setEstadoGlobal(prev => ({
      ...prev,
      sitesSelecionados: prev.sitesSelecionados.includes(id)
        ? prev.sitesSelecionados.filter(s => s !== id)
        : [...prev.sitesSelecionados, id]
    }));
  },
  
  navegarParaDetalhe: (id) => {
    setEstadoGlobal(prev => ({
      ...prev,
      abaAtiva: 'guia',
      siteParaDetalhe: id
    }));
  }
};
```

---

## 🔄 NAVEGAÇÃO ENTRE ABAS — Casos de Uso

### **Fluxo 1: Seleção e Comparação**

```
USUÁRIO:
1. Entra na aba "📊 Visão Geral"
2. Clica em 3 sites (IBAMETRO, IMEPI, IMEQPB)
3. Clica no botão "Comparar Selecionados"

SISTEMA:
├─ Atualiza sitesSelecionados: ['ibametro', 'imepi', 'imeqpb']
├─ Navega para aba "⚖️ Comparar"
└─ Componente Comparativo recebe sitesSelecionados via props
    └─ Renderiza tabela lado a lado dos 3 sites
```

**Código**:
```jsx
// Em VisaoGeral.jsx
<button 
  onClick={() => navegarParaAba('comparativo')}
  disabled={sitesSelecionados.length < 2}
>
  Comparar Selecionados ({sitesSelecionados.length})
</button>

// Em Comparativo.jsx (recebe props)
const Comparativo = ({ sitesSelecionados }) => {
  const sites = AXHUB_SITES.filter(s => sitesSelecionados.includes(s.id));
  return <TabelaComparativa sites={sites} />;
};
```

---

### **Fluxo 2: Ver Detalhes de um Site**

```
USUÁRIO:
1. Está na aba "📋 Lista"
2. Clica na linha do "IBAMETRO"

SISTEMA:
├─ Atualiza siteParaDetalhe: 'ibametro'
├─ Navega para aba "🔍 Guia"
└─ Componente GuiaDetalhado recebe siteParaDetalhe via props
    └─ Renderiza ficha completa do IBAMETRO
```

**Código**:
```jsx
// Em ListaGeral.jsx
<tr onClick={() => navegarParaDetalhe('ibametro')}>
  <td>IBAMETRO</td>
  ...
</tr>

// Em GuiaDetalhado.jsx (recebe props)
const GuiaDetalhado = ({ siteParaDetalhe }) => {
  const site = AXHUB_SITES.find(s => s.id === siteParaDetalhe);
  return <FichaCompleta site={site} />;
};
```

---

### **Fluxo 3: Ver Chamados de um Site Específico**

```
USUÁRIO:
1. Está na aba "🔍 Guia" vendo IBAMETRO
2. Clica no botão "Ver Chamados"

SISTEMA:
├─ Mantém siteParaDetalhe: 'ibametro'
├─ Navega para aba "🎫 Chamados"
└─ Componente Chamados recebe siteParaDetalhe via props
    └─ Filtra tickets automaticamente por IBAMETRO
```

**Código**:
```jsx
// Em GuiaDetalhado.jsx
<button onClick={() => navegarParaAba('chamados')}>
  🎫 Ver Chamados (5 abertos)
</button>

// Em Chamados.jsx (recebe props)
const Chamados = ({ siteParaDetalhe, navegarParaAba }) => {
  useEffect(() => {
    if (siteParaDetalhe) {
      setFiltroSite(siteParaDetalhe);  // Filtrar automaticamente
    }
  }, [siteParaDetalhe]);
  
  return (
    <>
      <FiltroSites value={filtroSite} onChange={setFiltroSite} />
      <TabelaTickets site={filtroSite} />
      
      {/* Botão para voltar ao guia */}
      <button onClick={() => navegarParaAba('guia')}>
        ← Voltar para Guia do Site
      </button>
    </>
  );
};
```

---

## 🎯 REDIMENSIONAMENTO — Único Ponto de Controle

### **Problema Atual**

```css
/* ❌ ANTES — Alterar em 4 arquivos diferentes */

/* AnalisesSites.css */
.site-card { width: 300px; }

/* GuiaSites.css */
.gs-ficha { width: 350px; }

/* ChamadosSites.css */
.ch-kpi-card { width: 200px; }

/* PainelProcessos.css */
.pp-table { width: 100%; }
```

### **Solução Proposta**

```css
/* ✅ DEPOIS — Alterar em 1 arquivo único */

/* CentralSites.css */
:root {
  /* Larguras de componentes */
  --cs-card-width: 320px;           ← ALTERAR AQUI
  --cs-card-width-mobile: 100%;
  
  /* Tabelas */
  --cs-table-max-width: 1200px;     ← ALTERAR AQUI
  
  /* Modais */
  --cs-modal-width: 600px;          ← ALTERAR AQUI
  
  /* Sidebar */
  --cs-sidebar-width: 280px;        ← ALTERAR AQUI
}

/* Aplicar em TODOS os componentes */
.cs-card { width: var(--cs-card-width); }
.cs-tabela { max-width: var(--cs-table-max-width); }
.cs-modal { width: var(--cs-modal-width); }
.cs-sidebar { width: var(--cs-sidebar-width); }

/* Responsividade automática */
@media (max-width: 640px) {
  :root {
    --cs-card-width: 100%;          ← MOBILE: 100%
    --cs-table-max-width: 100%;
    --cs-modal-width: 100%;
    --cs-sidebar-width: 100%;
  }
}
```

**Resultado**:
- ✅ Alterar 1 variável → Afeta TODAS as 9 abas
- ✅ Responsividade automática em todos os componentes
- ✅ Consistência visual garantida

---

## 📱 RESPONSIVIDADE — Breakpoints Globais

### **Sistema de Breakpoints**

```css
/* CentralSites.css */
:root {
  /* Breakpoints padronizados */
  --cs-breakpoint-xs: 480px;
  --cs-breakpoint-sm: 640px;
  --cs-breakpoint-md: 768px;
  --cs-breakpoint-lg: 1024px;
  --cs-breakpoint-xl: 1280px;
}

/* Mobile First — Base para mobile */
.cs-grid {
  display: grid;
  grid-template-columns: 1fr;        /* 1 coluna */
  gap: 16px;
}

/* Tablet — 2 colunas */
@media (min-width: 640px) {
  .cs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop — 3 colunas */
@media (min-width: 1024px) {
  .cs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop Large — 4 colunas */
@media (min-width: 1280px) {
  .cs-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

**Aplicação Automática**:
```jsx
// TODAS as abas que usam grid herdam automaticamente
<div className="cs-grid">
  <div className="cs-card">Site 1</div>
  <div className="cs-card">Site 2</div>
  <div className="cs-card">Site 3</div>
  <div className="cs-card">Site 4</div>
</div>

// Resultado:
// Mobile (< 640px):     1 coluna
// Tablet (640-1024px):  2 colunas
// Desktop (> 1024px):   3-4 colunas
```

---

## 🎨 TEMAS — Sistema de Cores Centralizado

### **Variáveis de Tema**

```css
/* CentralSites.css */
:root {
  /* Tema Claro (padrão) */
  --cs-background: #ffffff;
  --cs-surface: #f9fafb;
  --cs-border: #e5e7eb;
  --cs-text-primary: #111827;
  --cs-text-secondary: #6b7280;
}

/* Tema Escuro (opcional) */
[data-theme="dark"] {
  --cs-background: #1f2937;
  --cs-surface: #111827;
  --cs-border: #374151;
  --cs-text-primary: #f9fafb;
  --cs-text-secondary: #9ca3af;
}

/* Aplicação automática */
.cs-card {
  background: var(--cs-background);    ← Usa variável
  color: var(--cs-text-primary);
  border: 1px solid var(--cs-border);
}
```

**Toggle de Tema**:
```jsx
// No Header
<button onClick={() => toggleTema()}>
  {tema === 'light' ? '🌙' : '☀️'}
</button>

// Função
const toggleTema = () => {
  const novoTema = tema === 'light' ? 'dark' : 'light';
  setTema(novoTema);
  document.documentElement.setAttribute('data-theme', novoTema);
};
```

---

## 📦 ESTRUTURA FINAL — Pasta e Arquivos

```
src/pages/CentralSites/
│
├── index.jsx                      (150 linhas) ← CONTAINER ÚNICO
│   ├─ Estado global
│   ├─ Navegação de abas
│   ├─ Header/Footer
│   └─ Render condicional
│
├── CentralSites.css               (300 linhas) ← ESTILOS GLOBAIS
│   ├─ Variáveis CSS
│   ├─ Layout (header, nav, footer)
│   ├─ Componentes comuns
│   ├─ Responsividade
│   └─ Temas
│
├── hooks/
│   ├── useSites.js                ← Hook para dados de sites
│   ├── useTickets.js              ← Hook para chamados
│   └── useHealthCheck.js          ← Hook para status
│
└── components/
    ├── VisaoGeral.jsx             (200 linhas)
    ├── ListaGeral.jsx             (150 linhas)
    ├── Comparativo.jsx            (200 linhas)
    ├── GuiaDetalhado.jsx          (250 linhas)
    ├── Chamados.jsx               (300 linhas)
    ├── Intelligence.jsx           (250 linhas)
    ├── Credenciais.jsx            (150 linhas)
    ├── StatusOperacional.jsx      (200 linhas)
    └── Metodologia.jsx            (100 linhas)

TOTAL: ~2,000 linhas (vs 2,500 linhas dispersas hoje)
```

---

## ✅ BENEFÍCIOS — Container Único

| Aspecto | Antes (Disperso) | Depois (Container Único) | Melhoria |
|---------|------------------|--------------------------|----------|
| **Arquivos CSS** | 4 arquivos | 1 arquivo | 🟢 -75% |
| **Redimensionar** | Alterar 4 lugares | Alterar 1 variável | 🟢 -300% |
| **Responsividade** | Duplicar código 4x | Código único | 🟢 -400% |
| **Tema** | Não existe | Toggle claro/escuro | 🟢 +100% |
| **Navegação** | Links/rotas | Estado local | 🟢 +50% |
| **Estado** | Isolado por tela | Compartilhado | 🟢 +100% |
| **Manutenção** | 4 arquivos | 1 container | 🟢 -75% |
| **Consistência** | Visual varia | Visual único | 🟢 +100% |

---

## 🎯 RESUMO EXECUTIVO

### **Container Único = Controle Centralizado**

```
✅ TUDO EM 1 LUGAR:
├─ Layout         → CentralSites.css (variáveis CSS)
├─ Tamanhos       → CentralSites.css (:root)
├─ Responsividade → CentralSites.css (@media)
├─ Tema           → CentralSites.css (data-theme)
├─ Navegação      → index.jsx (estado abaAtiva)
├─ Estado global  → index.jsx (sitesSelecionados, filtros)
└─ Componentes    → components/ (9 abas isoladas)

= REDIMENSIONAR = ALTERAR 1 VARIÁVEL CSS
= MUDAR TEMA = TOGGLE 1 ATRIBUTO
= NAVEGAR = ALTERAR 1 ESTADO
```

---

## 🚀 IMPLEMENTAÇÃO — Passo a Passo

### **FASE 1: Criar Container (3h)**

1. ✅ Criar `src/pages/CentralSites/index.jsx` (container)
2. ✅ Criar `src/pages/CentralSites/CentralSites.css` (estilos globais)
3. ✅ Definir variáveis CSS (tamanhos, cores, breakpoints)
4. ✅ Implementar navegação de abas
5. ✅ Testar layout responsivo

### **FASE 2: Migrar Componentes (6h)**

1. ✅ Migrar VisaoGeral (de AnalisesSites)
2. ✅ Migrar ListaGeral (de PainelProcessos)
3. ✅ Migrar Comparativo (de AnalisesSites)
4. ✅ Migrar GuiaDetalhado (fundir GuiaSites)
5. ✅ Migrar Chamados (de ChamadosSites)
6. ✅ Migrar Intelligence (IntelligenceHub)
7. ✅ Migrar Credenciais (CredenciaisManager)
8. ✅ Criar StatusOperacional (novo)
9. ✅ Migrar Metodologia (de AnalisesSites)

### **FASE 3: Integração (2h)**

1. ✅ Conectar estado global
2. ✅ Implementar navegação entre abas
3. ✅ Testar seleção e filtros
4. ✅ Validar responsividade

### **FASE 4: Polimento (1h)**

1. ✅ Ajustar espaçamentos
2. ✅ Adicionar transições suaves
3. ✅ Testar em mobile
4. ✅ Deploy

**TOTAL: 12 horas** (1.5 dias de trabalho)

---

## ✅ CONCLUSÃO

**Container Único = Gerenciamento Simplificado**

| Benefício | Impacto |
|-----------|---------|
| **Redimensionar em 1 lugar** | ✅ Variáveis CSS globais |
| **Responsividade automática** | ✅ Breakpoints centralizados |
| **Tema claro/escuro** | ✅ Toggle simples |
| **Navegação fluida** | ✅ Estado local (sem rotas) |
| **Estado compartilhado** | ✅ Props comuns para todas as abas |
| **Manutenção reduzida** | ✅ 1 arquivo CSS vs 4 |
| **Consistência visual** | ✅ Garantida por design |

**Recomendação**: ✅ **IMPLEMENTAR CONTAINER ÚNICO**

---

**Arquivo criado**: `ARQUITETURA-CENTRAL-SITES-CONTAINER-UNICO.md`  
**Próxima ação**: Iniciar implementação do container base
