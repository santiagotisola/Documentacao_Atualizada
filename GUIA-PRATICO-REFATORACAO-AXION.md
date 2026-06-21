# 🛠️ GUIA PRÁTICO DE REFATORAÇÃO — Sistema Axion

**Complemento**: AUDITORIA-ARQUITETURA-AXION-COMPLETA.md  
**Data**: 2026-06-21

Este documento contém **exemplos práticos de código** para implementar as refatorações recomendadas.

---

## 📦 1. UNIFICAR PRODUCT CONTROLLERS (Fase 1)

### Problema Atual
```javascript
// axhub-controller.js
export async function statusConexao(req, res) {
  const status = await testarConexao(); // função específica do axhub-db
  return res.json(status);
}

// axton-controller.js
export async function statusConexao(req, res) {
  const status = await testarConexao(); // função específica do axton-db
  return res.json(status);
}

// axcross-controller.js
export async function statusConexao(req, res) {
  const status = await testarConexao(); // função específica do axcross-db
  return res.json(status);
}
```

### Solução: Generic Product Controller

```javascript
// src/controllers/products/generic-product.controller.js
export function createProductController(dbService, config) {
  return {
    statusConexao: async (req, res) => {
      try {
        const status = await dbService.testarConexao();
        return res.json(status);
      } catch (err) {
        return res.status(500).json({ erro: err.message });
      }
    },

    resumoGeral: async (req, res) => {
      try {
        const pool = await dbService.conectar();
        const queries = config.tabelas.map(tabela => 
          pool.request().query(`SELECT COUNT(*) AS total FROM ${tabela.nome}`)
        );
        
        const resultados = await Promise.all(queries);
        
        const resumo = {};
        config.tabelas.forEach((tabela, i) => {
          resumo[tabela.key] = resultados[i].recordset[0].total;
        });

        return res.json(resumo);
      } catch (err) {
        return res.status(500).json({ 
          erro: `Erro ao consultar ${config.produto}`, 
          detalhe: err.message 
        });
      }
    },

    listarEquipamentos: async (req, res) => {
      try {
        const pool = await dbService.conectar();
        const query = `
          SELECT TOP 100 
            ${config.queries.equipamentos.campos.join(', ')}
          FROM ${config.queries.equipamentos.tabela}
          ${config.queries.equipamentos.joins || ''}
          ORDER BY ${config.queries.equipamentos.orderBy}
        `;
        
        const result = await pool.request().query(query);
        return res.json({ 
          total: result.recordset.length, 
          equipamentos: result.recordset 
        });
      } catch (err) {
        return res.status(500).json({ erro: err.message });
      }
    },

    heartbeatEquipamentos: async (req, res) => {
      try {
        const pool = await dbService.conectar();
        const query = `
          SELECT TOP 50 
            ${config.queries.heartbeat.campos.join(', ')}
          FROM ${config.queries.heartbeat.tabela}
          ${config.queries.heartbeat.where || ''}
          ORDER BY ${config.queries.heartbeat.orderBy}
        `;
        
        const result = await pool.request().query(query);
        return res.json({ heartbeat: result.recordset });
      } catch (err) {
        return res.status(500).json({ erro: err.message });
      }
    },

    listarTabelas: async (req, res) => {
      try {
        const pool = await dbService.conectar();
        const result = await pool.request().query(`
          SELECT t.name AS tabela, p.rows AS registros
          FROM sys.tables t
          JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0,1)
          ORDER BY p.rows DESC
        `);
        
        return res.json({ 
          total: result.recordset.length, 
          tabelas: result.recordset 
        });
      } catch (err) {
        return res.status(500).json({ erro: err.message });
      }
    }
  };
}
```

```javascript
// src/config/products-config.js
export const PRODUCTS_CONFIG = {
  axhub: {
    produto: 'AxHub',
    tabelas: [
      { nome: 'TBEquipamentos', key: 'equipamentos' },
      { nome: 'TBOperacoes', key: 'operacoes' },
      { nome: 'TBInfracoes', key: 'infracoes' },
      { nome: 'TBPassagens', key: 'passagens' },
      { nome: 'TBUsuarios', key: 'usuarios' },
      { nome: 'TBTriagens', key: 'triagens' }
    ],
    queries: {
      equipamentos: {
        tabela: 'TBEquipamentos e',
        campos: [
          'e.IdEquipamento', 'e.NumeroSerie', 'e.Descricao',
          'te.Descricao AS TipoEquipamento',
          'f.Descricao AS Fabricante',
          'me.Descricao AS Modelo'
        ],
        joins: `
          LEFT JOIN TBTipoEquipamentos te ON e.IdTipoEquipamento = te.IdTipoEquipamento
          LEFT JOIN TBFabricantes f ON e.IdFabricante = f.IdFabricante
          LEFT JOIN TBModeloEquipamentos me ON e.IdModeloEquipamento = me.IdModeloEquipamento
        `,
        orderBy: 'e.IdEquipamento'
      },
      heartbeat: {
        tabela: 'TBPassagens p',
        campos: [
          'e.Descricao AS Equipamento',
          'MAX(p.DataHora) AS UltimaPassagem',
          'COUNT(*) AS TotalPassagens'
        ],
        joins: `
          JOIN TBEquipamentos e ON p.IdEquipamento = e.IdEquipamento
          WHERE p.DataHora >= DATEADD(hour, -24, GETDATE())
          GROUP BY e.IdEquipamento, e.Descricao
        `,
        orderBy: 'UltimaPassagem DESC'
      }
    }
  },

  axton: {
    produto: 'AxTon',
    tabelas: [
      { nome: 'TBEquipamentos', key: 'equipamentos' },
      { nome: 'TBOperacoes', key: 'operacoes' },
      { nome: 'TBPesagens', key: 'pesagens' },
      { nome: 'TBInfracoes', key: 'infracoes' },
      { nome: 'TBUsuarios', key: 'usuarios' }
    ],
    queries: {
      equipamentos: {
        tabela: 'TBEquipamentos e',
        campos: [
          'e.IdEquipamento', 'e.NumeroSerie', 'e.Descricao',
          'te.Descricao AS TipoEquipamento',
          'l.Descricao AS Local'
        ],
        joins: `
          LEFT JOIN TBTipoEquipamentos te ON e.IdTipoEquipamento = te.IdTipoEquipamento
          LEFT JOIN TBLocais l ON e.IdLocal = l.IdLocal
        `,
        orderBy: 'e.IdEquipamento'
      },
      heartbeat: {
        tabela: 'TBPesagens p',
        campos: [
          'e.Descricao AS Equipamento',
          'MAX(p.DataHoraPesagem) AS UltimaPesagem',
          'COUNT(*) AS TotalPesagens'
        ],
        joins: `
          JOIN TBEquipamentos e ON p.IdEquipamento = e.IdEquipamento
          WHERE p.DataHoraPesagem >= DATEADD(hour, -24, GETDATE())
          GROUP BY e.IdEquipamento, e.Descricao
        `,
        orderBy: 'UltimaPesagem DESC'
      }
    }
  },

  axcross: {
    produto: 'AxCross',
    tabelas: [
      { nome: 'TBEquipamentos', key: 'equipamentos' },
      { nome: 'TBOperacoes', key: 'operacoes' },
      { nome: 'TBPassagens', key: 'passagens' },
      { nome: 'TBLocais', key: 'locais' },
      { nome: 'TBUsuarios', key: 'usuarios' }
    ],
    queries: {
      equipamentos: {
        tabela: 'TBEquipamentos e',
        campos: [
          'e.Id', 'e.Nome', 'e.Tipo', 'e.Fabricante', 
          'e.Modelo', 'e.IP', 'e.Ativo',
          'l.Nome AS Local'
        ],
        joins: 'LEFT JOIN TBLocais l ON e.LocalId = l.Id',
        orderBy: 'e.Nome'
      },
      heartbeat: {
        tabela: 'TBPassagens p',
        campos: [
          'e.Nome AS Equipamento',
          'MAX(p.DataPassagem) AS UltimaPassagem',
          'COUNT(*) AS TotalPassagens'
        ],
        joins: `
          JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
          WHERE p.DataPassagem >= DATEADD(hour, -24, GETDATE())
          GROUP BY e.Id, e.Nome
        `,
        orderBy: 'UltimaPassagem DESC'
      }
    }
  }
};
```

```javascript
// src/controllers/products/axhub.controller.js
import * as axhubDB from '../../services/database/axhub-db.js';
import { PRODUCTS_CONFIG } from '../../config/products-config.js';
import { createProductController } from './generic-product.controller.js';

// Funções genéricas
const baseController = createProductController(axhubDB, PRODUCTS_CONFIG.axhub);

// Exporta funções base
export const statusConexao = baseController.statusConexao;
export const resumoGeral = baseController.resumoGeral;
export const listarEquipamentos = baseController.listarEquipamentos;
export const heartbeatEquipamentos = baseController.heartbeatEquipamentos;
export const listarTabelas = baseController.listarTabelas;

// Funções específicas do AxHub
export async function listarOperacoes(req, res) {
  try {
    const pool = await axhubDB.conectar();
    const result = await pool.request().query(`
      SELECT TOP 50
        o.IdOperacao, o.DataHoraInicio, o.DataHoraFim,
        e.Descricao AS Equipamento, l.Descricao AS Local
      FROM TBOperacoes o
      LEFT JOIN TBEquipamentos e ON o.IdEquipamento = e.IdEquipamento
      LEFT JOIN TBLocais l ON o.IdLocal = l.IdLocal
      ORDER BY o.DataHoraInicio DESC
    `);
    return res.json({ total: result.recordset.length, operacoes: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

export async function statsInfracoes(req, res) {
  // Específico do AxHub...
}

export async function listarMonitoramentos(req, res) {
  // Específico do AxHub...
}

export async function ultimasPassagens(req, res) {
  // Específico do AxHub...
}

export async function statsTriagens(req, res) {
  // Específico do AxHub...
}
```

**Resultado**:
- ✅ Código duplicado reduzido de ~550 linhas para ~150 linhas
- ✅ Bug em uma função corrigido automaticamente nos 3 produtos
- ✅ Fácil adicionar novo produto (ex: AxScale) sem copiar código

---

## 🧩 2. CRIAR COMPONENTES UI REUTILIZÁVEIS (Fase 1)

### Problema Atual
```jsx
// IntelligenceHub.jsx
function KPICard({ icon, label, value, sublabel, color }) {
  return (
    <div className="ih-kpi-card" style={{ borderTopColor: color }}>
      <span className="ih-kpi-icon">{icon}</span>
      <span className="ih-kpi-value">{value}</span>
      <span className="ih-kpi-label">{label}</span>
      {sublabel && <span className="ih-kpi-sub">{sublabel}</span>}
    </div>
  );
}

// OperationsHub.jsx (DUPLICADO)
function KPICard({ icon, label, value, sublabel, color }) {
  return (
    <div className="ops-kpi-card" style={{ borderTopColor: color }}>
      <span className="ops-kpi-icon">{icon}</span>
      <span className="ops-kpi-value">{value}</span>
      <span className="ops-kpi-label">{label}</span>
      {sublabel && <span className="ops-kpi-sub">{sublabel}</span>}
    </div>
  );
}

// Dashboard.jsx (DUPLICADO NOVAMENTE)
// ... mesma coisa
```

### Solução: Componente Genérico

```jsx
// src/components/ui/KPICard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './KPICard.css';

export function KPICard({ 
  icon, 
  label, 
  value, 
  sublabel, 
  color = '#3b82f6',
  trend,
  size = 'medium',
  onClick,
  className = ''
}) {
  const isClickable = !!onClick;
  
  return (
    <div 
      className={`kpi-card kpi-card--${size} ${isClickable ? 'kpi-card--clickable' : ''} ${className}`}
      style={{ borderTopColor: color }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {icon && <span className="kpi-card__icon">{icon}</span>}
      
      <div className="kpi-card__value">
        {value}
        {trend && (
          <span className={`kpi-card__trend kpi-card__trend--${trend.direction}`}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      
      <div className="kpi-card__label">{label}</div>
      
      {sublabel && <div className="kpi-card__sublabel">{sublabel}</div>}
    </div>
  );
}

KPICard.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sublabel: PropTypes.string,
  color: PropTypes.string,
  trend: PropTypes.shape({
    direction: PropTypes.oneOf(['up', 'down']),
    value: PropTypes.string
  }),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  className: PropTypes.string
};
```

```css
/* src/components/ui/KPICard.css */
.kpi-card {
  background: white;
  border-radius: 12px;
  border-top: 4px solid;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.kpi-card--small {
  padding: 12px;
  gap: 4px;
}

.kpi-card--large {
  padding: 28px;
  gap: 12px;
}

.kpi-card--clickable {
  cursor: pointer;
}

.kpi-card--clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.kpi-card__icon {
  font-size: 28px;
  line-height: 1;
}

.kpi-card--small .kpi-card__icon {
  font-size: 20px;
}

.kpi-card__value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.kpi-card--small .kpi-card__value {
  font-size: 24px;
}

.kpi-card__trend {
  font-size: 14px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.kpi-card__trend--up {
  color: #16a34a;
  background: #dcfce7;
}

.kpi-card__trend--down {
  color: #dc2626;
  background: #fee2e2;
}

.kpi-card__label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.kpi-card__sublabel {
  font-size: 12px;
  color: #94a3b8;
}
```

```jsx
// Uso em qualquer página
import { KPICard } from '../components/ui/KPICard';

function Dashboard() {
  return (
    <div className="kpi-grid">
      <KPICard
        icon="🎫"
        label="Tickets Abertos"
        value={127}
        sublabel="23 críticos"
        color="#ef4444"
        trend={{ direction: 'up', value: '+12%' }}
      />
      
      <KPICard
        icon="📊"
        label="OCR Médio"
        value="94.5%"
        sublabel="Últimas 24h"
        color="#10b981"
        trend={{ direction: 'down', value: '-2%' }}
        size="large"
      />
      
      <KPICard
        icon="⚡"
        label="Equipamentos"
        value={45}
        sublabel="42 online"
        color="#3b82f6"
        onClick={() => navigate('/equipamentos')}
      />
    </div>
  );
}
```

**Resultado**:
- ✅ Componente usado em 8+ páginas
- ✅ Estilos consistentes em todo o app
- ✅ Fácil adicionar novas variantes (loading, error, etc.)

---

## ⚡ 3. IMPLEMENTAR REACT QUERY (Fase 1)

### Problema Atual
```jsx
// IntelligenceHub.jsx
export default function IntelligenceHub() {
  const [chamadosData, setChamadosData] = useState(null);
  const [slaData, setSlaData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [chamRes, slaRes] = await Promise.all([
          api.get('/helpdesk/sites-overview').then(r => r.data).catch(() => null),
          api.get('/helpdesk/sla-compliance', { params: {...}, timeout: 15000 }).then(r => r.data).catch(() => null),
        ]);
        
        if (mounted) {
          setChamadosData(chamRes);
          setSlaData(slaRes);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setLoading(false);
      }
    })();
    
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Carregando...</div>;
  
  // ... resto do componente
}
```

**Problemas**:
- Sem cache: refetch completo ao navegar de volta
- Loading states manuais
- Error handling inconsistente
- Lógica repetida em cada componente

### Solução: React Query Hooks

```javascript
// src/services/hooks/useHelpdesk.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

// Keys para cache
export const helpdeskKeys = {
  all: ['helpdesk'],
  tickets: () => [...helpdeskKeys.all, 'tickets'],
  ticket: (id) => [...helpdeskKeys.all, 'ticket', id],
  sitesOverview: () => [...helpdeskKeys.all, 'sites-overview'],
  slaCompliance: (params) => [...helpdeskKeys.all, 'sla-compliance', params],
};

// Hook: Sites Overview
export function useSitesOverview() {
  return useQuery({
    queryKey: helpdeskKeys.sitesOverview(),
    queryFn: async () => {
      const { data } = await api.get('/helpdesk/sites-overview');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  });
}

// Hook: SLA Compliance
export function useSLACompliance({ dateFrom, dateTo }) {
  return useQuery({
    queryKey: helpdeskKeys.slaCompliance({ dateFrom, dateTo }),
    queryFn: async () => {
      const { data } = await api.get('/helpdesk/sla-compliance', {
        params: { dateFrom, dateTo },
        timeout: 15000,
      });
      return data;
    },
    enabled: !!dateFrom && !!dateTo, // Só executa se tiver datas
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 1,
  });
}

// Hook: Lista de Tickets
export function useTickets(filters = {}) {
  return useQuery({
    queryKey: [...helpdeskKeys.tickets(), filters],
    queryFn: async () => {
      const { data } = await api.get('/helpdesk/tickets', { params: filters });
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

// Hook: Detalhe de Ticket
export function useTicket(id) {
  return useQuery({
    queryKey: helpdeskKeys.ticket(id),
    queryFn: async () => {
      const { data } = await api.get(`/helpdesk/ticket/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 30 * 1000, // 30 segundos
  });
}

// Hook: Classificar Ticket (Mutation)
export function useClassificarTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, classificacao }) => {
      const { data } = await api.post(`/helpdesk/classificar/${id}`, classificacao);
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalida cache do ticket específico
      queryClient.invalidateQueries(helpdeskKeys.ticket(variables.id));
      // Invalida lista de tickets
      queryClient.invalidateQueries(helpdeskKeys.tickets());
    },
  });
}

// Hook: Responder Ticket (Mutation)
export function useResponderTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, resposta }) => {
      const { data } = await api.post(`/helpdesk/responder/${id}`, { resposta });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(helpdeskKeys.ticket(variables.id));
    },
  });
}
```

```jsx
// src/pages/atendimento/Helpdesk.jsx (REFATORADO)
import React, { useState } from 'react';
import { useTickets, useClassificarTicket } from '../../services/hooks/useHelpdesk';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export default function Helpdesk() {
  const [filtros, setFiltros] = useState({});
  
  // Fetch automático com cache
  const { 
    data: tickets, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useTickets(filtros);
  
  // Mutation com invalidação automática
  const classificarMutation = useClassificarTicket();

  const handleClassificar = async (ticketId, classificacao) => {
    try {
      await classificarMutation.mutateAsync({ id: ticketId, classificacao });
      toast.success('Ticket classificado com sucesso!');
    } catch (err) {
      toast.error('Erro ao classificar ticket');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} onRetry={refetch} />;

  return (
    <div className="helpdesk-container">
      <h1>Tickets ({tickets?.length || 0})</h1>
      
      {/* Filtros */}
      <div className="filters">
        {/* ... */}
      </div>

      {/* Lista de Tickets */}
      <div className="tickets-list">
        {tickets?.map(ticket => (
          <TicketCard 
            key={ticket.id} 
            ticket={ticket}
            onClassificar={handleClassificar}
            isClassifying={classificarMutation.isLoading}
          />
        ))}
      </div>
    </div>
  );
}
```

```jsx
// src/pages/home/IntelligenceHub.jsx (REFATORADO)
import React, { useMemo } from 'react';
import { useSitesOverview, useSLACompliance } from '../../services/hooks/useHelpdesk';
import { KPICard } from '../../components/ui/KPICard';

export default function IntelligenceHub() {
  const dateRange = useMemo(() => ({
    dateFrom: new Date(Date.now() - 30*86400000).toISOString().slice(0,10),
    dateTo: new Date().toISOString().slice(0,10)
  }), []);

  // Queries paralelas com cache automático
  const { data: sitesData, isLoading: loadingSites } = useSitesOverview();
  const { data: slaData, isLoading: loadingSLA } = useSLACompliance(dateRange);

  const isLoading = loadingSites || loadingSLA;

  if (isLoading) return <LoadingSpinner />;

  const kpis = {
    totalSites: sitesData?.sites?.length || 0,
    sitesAtivos: sitesData?.sites?.filter(s => s.status === 'ativo').length || 0,
    chamadosAbertos: sitesData?.totalTickets || 0,
    slaMet: slaData?.summary?.met || 0,
  };

  return (
    <div className="intelligence-hub">
      <div className="kpi-grid">
        <KPICard icon="🏢" label="Sites Ativos" value={kpis.sitesAtivos} color="#10b981" />
        <KPICard icon="🎫" label="Chamados" value={kpis.chamadosAbertos} color="#ef4444" />
        <KPICard icon="🎯" label="SLA Met" value={`${kpis.slaMet}%`} color="#3b82f6" />
      </div>
      
      {/* Resto do componente */}
    </div>
  );
}
```

**Resultado**:
- ✅ Cache automático: navegar entre páginas não refaz fetch
- ✅ Loading states consistentes
- ✅ Refetch inteligente (polling, window focus, etc.)
- ✅ Invalidação coordenada após mutations

---

## 🏠 4. UNIFICAR DASHBOARDS EM DashboardHub (Fase 2)

### Estrutura Proposta

```jsx
// src/pages/home/DashboardHub.jsx
import React, { useState } from 'react';
import { TabContainer } from '../../components/ui/TabContainer';
import OverviewTab from './tabs/OverviewTab';
import OperationsTab from './tabs/OperationsTab';
import IntelligenceTab from './tabs/IntelligenceTab';

const TABS = [
  { id: 'overview', label: 'Visão Geral', icon: '📊', component: OverviewTab },
  { id: 'operations', label: 'Operações', icon: '⚙️', component: OperationsTab },
  { id: 'intelligence', label: 'Inteligência', icon: '🧠', component: IntelligenceTab },
];

export default function DashboardHub() {
  const [activeTab, setActiveTab] = useState('overview');

  const ActiveComponent = TABS.find(t => t.id === activeTab).component;

  return (
    <div className="dashboard-hub">
      <TabContainer 
        tabs={TABS} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />
      
      <div className="tab-content">
        <ActiveComponent />
      </div>
    </div>
  );
}
```

```jsx
// src/pages/home/tabs/OverviewTab.jsx
import React from 'react';
import { KPICard } from '../../../components/ui/KPICard';
import { useSitesOverview } from '../../../services/hooks/useHelpdesk';
import { useAxHubStats } from '../../../services/hooks/useAxHub';

export default function OverviewTab() {
  const { data: sitesData } = useSitesOverview();
  const { data: axhubData } = useAxHubStats();

  return (
    <div className="overview-tab">
      <section className="kpi-section">
        <h2>Indicadores Gerais</h2>
        <div className="kpi-grid">
          <KPICard icon="🏢" label="Sites Ativos" value={sitesData?.sites?.length || 0} />
          <KPICard icon="📡" label="Equipamentos" value={axhubData?.equipamentos || 0} />
          <KPICard icon="🎫" label="Tickets" value={sitesData?.totalTickets || 0} />
        </div>
      </section>

      <section className="charts-section">
        {/* Gráficos gerais */}
      </section>
    </div>
  );
}
```

```jsx
// src/pages/home/tabs/OperationsTab.jsx
import React from 'react';
import { useSitesOverview } from '../../../services/hooks/useHelpdesk';
import { ALL_SITES } from '../../../data/sitesData';

export default function OperationsTab() {
  const { data: chamadosData } = useSitesOverview();

  return (
    <div className="operations-tab">
      <section className="sites-section">
        <h2>Sites por Sistema</h2>
        
        {/* Grid de sites */}
        <div className="sites-grid">
          {ALL_SITES.map(site => (
            <SiteCard 
              key={site.id} 
              site={site}
              chamados={chamadosData?.ranking?.find(r => r.siteId === site.id)}
            />
          ))}
        </div>
      </section>

      <section className="pipelines-section">
        <h2>Pipelines Operacionais</h2>
        {/* Visualização de pipelines */}
      </section>
    </div>
  );
}
```

```jsx
// src/pages/home/tabs/IntelligenceTab.jsx
import React, { useState } from 'react';
import { useSLACompliance } from '../../../services/hooks/useHelpdesk';
import { DateRangeFilter } from '../../../components/ui/DateRangeFilter';

export default function IntelligenceTab() {
  const [dateRange, setDateRange] = useState({
    dateFrom: new Date(Date.now() - 30*86400000).toISOString().slice(0,10),
    dateTo: new Date().toISOString().slice(0,10)
  });

  const { data: slaData } = useSLACompliance(dateRange);

  return (
    <div className="intelligence-tab">
      <section className="performance-section">
        <h2>Performance e SLA</h2>
        
        <DateRangeFilter 
          value={dateRange}
          onChange={setDateRange}
        />

        <div className="kpi-grid">
          <KPICard 
            icon="🎯" 
            label="SLA Met" 
            value={`${slaData?.summary?.met || 0}%`}
            trend={{ direction: 'up', value: '+3%' }}
          />
          <KPICard 
            icon="⚠️" 
            label="SLA Breached" 
            value={slaData?.summary?.breached || 0}
            trend={{ direction: 'down', value: '-5%' }}
          />
        </div>
      </section>

      <section className="trends-section">
        <h2>Tendências</h2>
        {/* Gráficos de tendências */}
      </section>
    </div>
  );
}
```

**Resultado**:
- ✅ Unifica IntelligenceHub + OperationsHub + Dashboard
- ✅ Código modular e reutilizável
- ✅ Navegação por abas (melhor UX)
- ✅ Reduz de 3 páginas para 1

---

## 🗂️ 5. DIVIDIR ROUTES.JS EM MÚLTIPLOS ARQUIVOS (Fase 2)

### Estrutura Proposta

```javascript
// src/routes/index.js
import express from 'express';
import helpdeskRoutes from './helpdesk.routes.js';
import productsRoutes from './products.routes.js';
import validationRoutes from './validation.routes.js';
import editaisRoutes from './editais.routes.js';
import crmRoutes from './crm.routes.js';
import analysisRoutes from './analysis.routes.js';
import reportsRoutes from './reports.routes.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

// Monta sub-rotas
router.use('/helpdesk', helpdeskRoutes);
router.use('/products', productsRoutes);
router.use('/validation', validationRoutes);
router.use('/editais', editaisRoutes);
router.use('/crm', crmRoutes);
router.use('/analysis', analysisRoutes);
router.use('/reports', reportsRoutes);
router.use('/admin', adminRoutes);

export default router;
```

```javascript
// src/routes/helpdesk.routes.js
import express from 'express';
import * as tickets from '../controllers/helpdesk/tickets.controller.js';
import * as polling from '../controllers/helpdesk/polling.controller.js';
import * as queue from '../controllers/helpdesk/queue.controller.js';
import * as sla from '../controllers/helpdesk/sla.controller.js';

const router = express.Router();

// Tickets
router.get('/tickets', tickets.listar);
router.get('/tickets/:id', tickets.obterDetalhe);
router.post('/tickets/:id/classificar', tickets.classificar);
router.post('/tickets/:id/responder', tickets.responder);
router.post('/tickets/processar', tickets.processarPendentes);
router.post('/tickets', tickets.criar);
router.get('/categorias', tickets.listarCategorias);

// Polling
router.get('/polling', polling.getStatus);
router.post('/polling/iniciar', polling.iniciar);
router.post('/polling/pausar', polling.pausar);
router.post('/polling/retomar', polling.retomar);
router.post('/polling/limpar', polling.limpar);

// Fila de Revisão
router.get('/fila', queue.obterFila);
router.post('/fila/modo', queue.setModoRevisao);
router.post('/fila/:id/aprovar', queue.aprovar);
router.post('/fila/:id/rejeitar', queue.rejeitar);

// SLA
router.get('/sla-compliance', sla.relatarCompliance);
router.get('/planilha-horas', sla.gerarPlanilhaHoras);
router.get('/tecnicos', sla.listarTecnicos);

// Sites
router.get('/sites-overview', tickets.sitesOverview);
router.get('/mapa-sites', tickets.obterMapa);
router.post('/mapa-sites', tickets.associarSite);
router.delete('/mapa-sites/:categoriaId', tickets.desassociarSite);
router.get('/site/:siteId/tickets', tickets.ticketsPorSite);

export default router;
```

```javascript
// src/routes/products.routes.js
import express from 'express';
import * as axhub from '../controllers/products/axhub.controller.js';
import * as axton from '../controllers/products/axton.controller.js';
import * as axcross from '../controllers/products/axcross.controller.js';

const router = express.Router();

// AxHub
router.get('/axhub/status', axhub.statusConexao);
router.get('/axhub/resumo', axhub.resumoGeral);
router.get('/axhub/equipamentos', axhub.listarEquipamentos);
router.get('/axhub/operacoes', axhub.listarOperacoes);
router.get('/axhub/infracoes', axhub.statsInfracoes);
router.get('/axhub/heartbeat', axhub.heartbeatEquipamentos);
router.get('/axhub/monitoramentos', axhub.listarMonitoramentos);
router.get('/axhub/passagens', axhub.ultimasPassagens);
router.get('/axhub/triagens', axhub.statsTriagens);
router.get('/axhub/tabelas', axhub.listarTabelas);

// AxTon
router.get('/axton/status', axton.statusConexao);
router.get('/axton/resumo', axton.resumoGeral);
router.get('/axton/pesagens', axton.ultimasPesagens);
router.get('/axton/infracoes', axton.ultimasInfracoes);
router.get('/axton/heartbeat', axton.heartbeatEquipamentos);
router.get('/axton/tabelas', axton.listarTabelas);

// AxCross
router.get('/axcross/status', axcross.statusConexao);
router.get('/axcross/resumo', axcross.resumoGeral);
router.get('/axcross/equipamentos', axcross.listarEquipamentos);
router.get('/axcross/locais', axcross.listarLocais);
router.get('/axcross/operacoes', axcross.listarOperacoes);
router.get('/axcross/passagens', axcross.statsPassagens);
router.get('/axcross/heartbeat', axcross.heartbeatEquipamentos);
router.get('/axcross/tabelas', axcross.listarTabelas);

export default router;
```

**Resultado**:
- ✅ Arquivo routes.js com 300 linhas vira 20 linhas
- ✅ Fácil encontrar rota específica (agrupamento lógico)
- ✅ Cada domínio tem seu próprio arquivo

---

## 📦 6. EXTRAIR UTILS/SCORE-CALCULATORS (Fase 1)

### Problema Atual
Função `calcHealthScore` duplicada em 3 arquivos.

### Solução

```javascript
// src/services/utils/scoreCalculators.js

/**
 * Calcula score de saúde de um site baseado em OCR, versão e chamados
 */
export function calcHealthScore(site, chamadosData = null) {
  let score = 100;

  // OCR contribui 30%
  if (site.ocr) {
    score -= Math.max(0, (95 - site.ocr)) * 0.5;
  } else {
    score -= 10; // Sem OCR
  }

  // Versão desatualizada: -10
  if (site.versao && compareVersions(site.versao, 'v.1.2.0') < 0) {
    score -= 10;
  }

  // Chamados abertos: cada um reduz 2pts (até 30pts)
  if (chamadosData?.ranking) {
    const siteChamados = chamadosData.ranking.find(r => r.siteId === site.id);
    if (siteChamados) {
      score -= Math.min(30, siteChamados.abertos * 2);
      // Críticos pesam mais: 5pts cada (até 20pts)
      score -= Math.min(20, (siteChamados.criticos || 0) * 5);
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Retorna cor baseada no score
 */
export function scoreColor(score) {
  if (score >= 80) return '#22c55e'; // Verde
  if (score >= 60) return '#f59e0b'; // Amarelo
  if (score >= 40) return '#f97316'; // Laranja
  return '#ef4444'; // Vermelho
}

/**
 * Retorna label baseado no score
 */
export function scoreLabel(score) {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Regular';
  return 'Crítico';
}

/**
 * Compara duas versões semver simplificadas
 */
function compareVersions(v1, v2) {
  const parts1 = v1.replace(/^v\.?/, '').split('.').map(Number);
  const parts2 = v2.replace(/^v\.?/, '').split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}

/**
 * Formata números grandes (1234 → 1.2k)
 */
export function formatNumber(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

/**
 * Formata porcentagem com cor
 */
export function formatPercent(value, total) {
  if (!total) return '0%';
  const pct = Math.round((value / total) * 100);
  return {
    value: `${pct}%`,
    color: scoreColor(pct)
  };
}
```

**Uso**:
```javascript
// IntelligenceHub.jsx, OperationsTab.jsx, etc.
import { calcHealthScore, scoreColor, scoreLabel } from '../../../services/utils/scoreCalculators';

const healthScore = calcHealthScore(site, chamadosData);
const color = scoreColor(healthScore);
const label = scoreLabel(healthScore);
```

---

## 🎯 CONCLUSÃO

Estes exemplos práticos mostram **como implementar** as refatorações recomendadas no relatório de auditoria.

**Próximos Passos**:
1. Implementar Fase 1 (Quick Wins) primeiro
2. Testar cada refatoração isoladamente
3. Fazer merge incremental (não big bang)
4. Documentar padrões no README

---

**Fim do Guia Prático de Refatoração**
