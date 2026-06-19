# 🌐 Expansão: Ecossistema Inteligente Multi-Contrato

## 🎯 Visão do Usuário

> "quero que tudo fique dentro do AxionIa painel...configurar para acesso de dentro do painel, validar com tudo que tem no painel todas as ideias para criar um unico ecossistema inteligente de atendimento, **onde posso analisar qualquer url ou seja qualquer contrato**"

---

## 📋 Roadmap de Expansão

### ✅ **Fase 1: Base Implementada**
- [x] Página de Diagnóstico de Medição integrada ao painel
- [x] Seleção de sistema AxHub
- [x] Análise de equipamento individual
- [x] API com endpoints de diagnóstico
- [x] Solução visual passo a passo

### 🚧 **Fase 2: Multi-Contrato (Próximo Passo)**
Expandir para análise de QUALQUER contrato em QUALQUER sistema:

#### **2.1. Adicionar Seleção de Contrato**
```jsx
// DiagnosticoMedicao.jsx - Novo estado
const [contratos, setContratos] = useState([]);
const [contratoSelecionado, setContratoSelecionado] = useState('');

// Novo fluxo:
// ETAPA 1: Selecionar Sistema (já existe)
// ETAPA 1.5: Selecionar Contrato ← NOVO
// ETAPA 2: Selecionar Equipamento (filtrado por contrato)
// ETAPA 3: Diagnóstico
```

**Endpoint necessário:**
```javascript
// GET /api/medicao/contratos?sistema=goiania
// Resposta:
{
  "sistema": "goiania",
  "contratos": [
    {
      "id": 1,
      "nome": "SMT - Secretaria Municipal de Trânsito",
      "codigo": "2024/001",
      "orgao": "Prefeitura de Goiânia",
      "vigencia": "2024-01-01 a 2026-12-31",
      "equipamentos": 25,
      "status": "Ativo"
    },
    ...
  ]
}
```

#### **2.2. Análise em Lote por Contrato**
Dashboard mostrando TODOS os equipamentos de um contrato:

```jsx
// Nova página: AnaliseContrato.jsx
<div className="analise-contrato">
  <h2>Análise do Contrato: SMT 2024/001</h2>
  
  <div className="kpis-contrato">
    <div className="kpi">Total de Equipamentos: 25</div>
    <div className="kpi sucesso">Operacionais: 22 (88%)</div>
    <div className="kpi erro">Com Problema: 3 (12%)</div>
  </div>
  
  <table className="equipamentos-contrato">
    <thead>
      <tr>
        <th>Código</th>
        <th>Descrição</th>
        <th>Faixas</th>
        <th>Recursos</th>
        <th>Status</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr className="problema">
        <td>GYN1R801</td>
        <td>Radar Av. T-9</td>
        <td>2</td>
        <td className="erro">0</td>
        <td>🔴 Problema</td>
        <td><button>Diagnosticar</button></td>
      </tr>
      ...
    </tbody>
  </table>
</div>
```

**Endpoint necessário:**
```javascript
// GET /api/medicao/analise-contrato?sistema=goiania&contrato=1
// Resposta:
{
  "contrato": {...},
  "estatisticas": {
    "total": 25,
    "operacionais": 22,
    "comProblema": 3
  },
  "equipamentos": [
    {
      "codigo": "GYN1R801",
      "descricao": "Radar Av. T-9",
      "faixas": 2,
      "recursos": 0,
      "status": "erro",
      "problema": "Recursos não cadastrados"
    },
    ...
  ]
}
```

#### **2.3. Análise de URL Customizada**
Permitir análise de QUALQUER URL (sistemas não cadastrados):

```jsx
// Adicionar modo "Análise Avançada"
const [modoAvancado, setModoAvancado] = useState(false);

{modoAvancado && (
  <div className="analise-avancada">
    <h3>🔧 Análise de URL Customizada</h3>
    <input 
      type="text"
      placeholder="https://cliente.axhub.axion.ws"
      value={urlCustom}
      onChange={(e) => setUrlCustom(e.target.value)}
    />
    <input 
      type="text"
      placeholder="Nome do banco de dados"
      value={databaseCustom}
      onChange={(e) => setDatabaseCustom(e.target.value)}
    />
    <button onClick={conectarUrlCustomizada}>
      Conectar Sistema Externo
    </button>
  </div>
)}
```

**Endpoint necessário:**
```javascript
// POST /api/medicao/conectar-custom
// Body:
{
  "url": "https://cliente.axhub.axion.ws",
  "database": "AxHub_Cliente",
  "user": "sa", // opcional, usar padrão
  "password": "***" // opcional, usar padrão
}
// Resposta:
{
  "sucesso": true,
  "sistema": {
    "id": "custom_123",
    "nome": "Sistema Cliente",
    "url": "https://cliente.axhub.axion.ws"
  },
  "equipamentos": [...]
}
```

### 🔮 **Fase 3: Integração com Outros Módulos do Painel**

#### **3.1. Intelligence Hub**
Adicionar card de Diagnóstico de Medição:

```jsx
// IntelligenceHub.jsx
<div className="hub-card">
  <h3>🩺 Diagnóstico de Medição</h3>
  <div className="hub-stats">
    <div>
      <span className="stat-label">Sistemas Analisados</span>
      <span className="stat-value">6</span>
    </div>
    <div>
      <span className="stat-label">Equipamentos com Problema</span>
      <span className="stat-value erro">12</span>
    </div>
    <div>
      <span className="stat-label">Taxa de Sucesso</span>
      <span className="stat-value">94%</span>
    </div>
  </div>
  <Link to="/diagnostico-medicao" className="hub-link">
    Ver Detalhes →
  </Link>
</div>
```

#### **3.2. Helpdesk**
Integração direta com tickets:

```jsx
// Helpdesk.jsx - Adicionar botão de diagnóstico
<div className="ticket-actions">
  <button onClick={() => diagnosticarTicket(ticket)}>
    🩺 Diagnosticar Equipamento
  </button>
</div>

// Função que extrai código do equipamento do texto do ticket
function diagnosticarTicket(ticket) {
  const codigo = extrairCodigoEquipamento(ticket.texto);
  const sistema = detectarSistema(ticket.categoria);
  
  navigate(`/diagnostico-medicao?sistema=${sistema}&equipamento=${codigo}`);
}
```

#### **3.3. Dashboard**
Widget com resumo de problemas:

```jsx
// Dashboard.jsx
<div className="dashboard-widget">
  <h3>⚠️ Alertas de Medição</h3>
  <ul className="alertas-lista">
    <li className="alerta-item">
      <span className="alerta-icon">🔴</span>
      <div>
        <strong>Goiânia</strong> - GYN1R801
        <small>Recursos não cadastrados</small>
      </div>
      <button onClick={() => navigate('/diagnostico-medicao?...')}>
        Resolver
      </button>
    </li>
    ...
  </ul>
</div>
```

#### **3.4. Knowledge Base**
Documentação dinâmica:

```jsx
// KnowledgeBase.jsx - Adicionar seção
<div className="kb-section">
  <h3>📖 Diagnóstico de Medição</h3>
  <p>Como resolver equipamentos com valores zerados</p>
  <button onClick={() => navigate('/diagnostico-medicao')}>
    Abrir Ferramenta
  </button>
  
  <div className="kb-related">
    <h4>Artigos Relacionados:</h4>
    <ul>
      <li><a href="#cadastro-recursos">Como cadastrar recursos</a></li>
      <li><a href="#relatorio-medicao">Entendendo o relatório de medição</a></li>
      <li><a href="#calculo-bdi">Como calcular BDI</a></li>
    </ul>
  </div>
</div>
```

### 🤖 **Fase 4: Automação Inteligente**

#### **4.1. Monitoramento Proativo**
Job scheduler que escaneia sistemas automaticamente:

```javascript
// scheduler.js
cron.schedule('0 8 * * *', async () => { // Diariamente às 8h
  const sistemas = await getSistemas();
  
  for (const sistema of sistemas) {
    const problemas = await analisarSistemaCompleto(sistema.id);
    
    if (problemas.length > 0) {
      // Criar ticket automaticamente
      await criarTicketJitbit({
        categoria: 'Medição',
        prioridade: 'Média',
        assunto: `[AUTO] ${problemas.length} equipamentos com problema em ${sistema.nome}`,
        descricao: gerarRelatorioProblemas(problemas)
      });
      
      // Enviar WhatsApp (se configurado)
      if (sistema.notificarWhatsApp) {
        await enviarWhatsApp(sistema.telefone, `🔴 ${problemas.length} equipamentos precisam de atenção!`);
      }
    }
  }
});
```

#### **4.2. Correção Automática (com aprovação)**
```jsx
// DiagnosticoMedicao.jsx - Adicionar botão
{diagnostico.status === 'erro' && (
  <div className="correcao-automatica">
    <h3>🤖 Correção Automática</h3>
    <p>O sistema pode corrigir este problema automaticamente.</p>
    
    <div className="preview-sql">
      <code>{diagnostico.script}</code>
    </div>
    
    <div className="confirmacao">
      <label>
        <input type="checkbox" checked={confirmoCorrecao} onChange={...} />
        Confirmo que revisei o script e autorizo a execução
      </label>
    </div>
    
    <button 
      className="btn-corrigir"
      disabled={!confirmoCorrecao}
      onClick={executarCorrecaoAutomatica}
    >
      ⚡ Executar Correção
    </button>
  </div>
)}
```

**Endpoint necessário:**
```javascript
// POST /api/medicao/corrigir-automatico
// Body:
{
  "sistema": "goiania",
  "equipamento": "GYN1R801",
  "script": "...", // script SQL validado
  "confirmar": true
}
// Resposta:
{
  "sucesso": true,
  "linhasAfetadas": 2,
  "log": "Inseridos 2 recursos para equipamento GYN1R801",
  "validacao": {
    "antes": { recursos: 0 },
    "depois": { recursos: 2 }
  }
}
```

### 📊 **Fase 5: Analytics e Relatórios**

#### **5.1. Dashboard Executivo**
```jsx
// Nova página: DashboardMedicao.jsx
<div className="dashboard-executivo">
  <h1>📊 Analytics de Medição</h1>
  
  <div className="filtros">
    <select>Período: Últimos 30 dias</select>
    <select>Sistema: Todos</select>
  </div>
  
  <div className="kpis-grid">
    <div className="kpi-card">
      <h3>Total de Diagnósticos</h3>
      <span className="kpi-value">147</span>
      <span className="kpi-trend up">+12% vs mês anterior</span>
    </div>
    
    <div className="kpi-card">
      <h3>Problemas Identificados</h3>
      <span className="kpi-value erro">23</span>
      <span className="kpi-trend down">-8% vs mês anterior</span>
    </div>
    
    <div className="kpi-card">
      <h3>Taxa de Resolução</h3>
      <span className="kpi-value">96%</span>
      <span className="kpi-trend up">+3% vs mês anterior</span>
    </div>
    
    <div className="kpi-card">
      <h3>Tempo Médio de Resolução</h3>
      <span className="kpi-value">2.3h</span>
      <span className="kpi-trend down">-45min vs mês anterior</span>
    </div>
  </div>
  
  <div className="graficos">
    <div className="grafico">
      <h3>Evolução de Problemas</h3>
      <LineChart data={...} />
    </div>
    
    <div className="grafico">
      <h3>Problemas por Sistema</h3>
      <BarChart data={...} />
    </div>
    
    <div className="grafico">
      <h3>Tipos de Problema</h3>
      <PieChart data={...} />
    </div>
  </div>
  
  <div className="ranking">
    <h3>🏆 Ranking de Sistemas</h3>
    <table>
      <thead>
        <tr>
          <th>Posição</th>
          <th>Sistema</th>
          <th>Taxa de Saúde</th>
          <th>Equipamentos OK</th>
          <th>Problemas</th>
        </tr>
      </thead>
      <tbody>
        <tr className="top-performer">
          <td>1º 🥇</td>
          <td>IPEMPE</td>
          <td>98%</td>
          <td>47/48</td>
          <td>1</td>
        </tr>
        ...
      </tbody>
    </table>
  </div>
</div>
```

#### **5.2. Exportação de Relatórios**
```jsx
<div className="exportacao">
  <h3>📄 Exportar Relatório</h3>
  <button onClick={() => exportarPDF()}>
    📕 PDF
  </button>
  <button onClick={() => exportarExcel()}>
    📊 Excel
  </button>
  <button onClick={() => exportarCSV()}>
    📋 CSV
  </button>
</div>
```

**Endpoints necessários:**
```javascript
// GET /api/medicao/relatorio?formato=pdf&sistema=goiania&periodo=30
// Resposta: Arquivo PDF/Excel/CSV para download
```

---

## 🔧 Implementação Técnica Detalhada

### **Banco de Dados: Armazenar Histórico**

```sql
-- Nova tabela no MongoDB
db.diagnosticos_medicao.insertOne({
  _id: ObjectId(),
  timestamp: ISODate("2026-01-17T10:30:00Z"),
  sistema: "goiania",
  equipamento: "GYN1R801",
  usuario: "suporte@axion.com.br",
  status: "erro",
  problema: "Recursos não cadastrados",
  faixas: 2,
  recursos: 0,
  faltando: 2,
  corrigido: false,
  dataCorrecao: null,
  tempoResolucao: null, // em minutos
  tags: ["medição", "recursos", "goiânia"]
});
```

### **API: Endpoints Completos**

```javascript
// medicao-controller.js - Adicionar funções

// Histórico de diagnósticos
async function obterHistorico(req, res) {
  const { sistema, equipamento, periodo } = req.query;
  
  const filtro = {};
  if (sistema) filtro.sistema = sistema;
  if (equipamento) filtro.equipamento = equipamento;
  if (periodo) {
    const dias = parseInt(periodo) || 30;
    filtro.timestamp = { 
      $gte: new Date(Date.now() - dias * 24 * 60 * 60 * 1000) 
    };
  }
  
  const historico = await db.collection('diagnosticos_medicao')
    .find(filtro)
    .sort({ timestamp: -1 })
    .limit(100)
    .toArray();
  
  res.json(historico);
}

// Estatísticas agregadas
async function obterEstatisticas(req, res) {
  const stats = await db.collection('diagnosticos_medicao').aggregate([
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 },
        sistemas: { $addToSet: "$sistema" }
      }
    }
  ]).toArray();
  
  res.json(stats);
}

// Marcar como corrigido
async function marcarCorrigido(req, res) {
  const { id } = req.params;
  
  await db.collection('diagnosticos_medicao').updateOne(
    { _id: ObjectId(id) },
    {
      $set: {
        corrigido: true,
        dataCorrecao: new Date(),
        tempoResolucao: calcularTempoResolucao(...)
      }
    }
  );
  
  res.json({ sucesso: true });
}
```

---

## 🎯 Objetivo Final: Ecossistema Unificado

```
┌─────────────────────────────────────────────────────────────┐
│                    AXION IA PAINEL                          │
│                  Ecossistema Inteligente                    │
└─────────────────────────────────────────────────────────────┘
                              │
      ┌───────────────────────┼───────────────────────┐
      │                       │                       │
┌─────▼─────┐       ┌────────▼────────┐      ┌──────▼──────┐
│Intelligence│       │   Diagnóstico   │      │  Helpdesk   │
│    Hub     │◄─────►│    Medição      │◄────►│   Jitbit    │
│  (Central) │       │  (Análise URL)  │      │  (Tickets)  │
└─────┬─────┘       └────────┬────────┘      └──────┬──────┘
      │                      │                       │
      │             ┌────────▼────────┐              │
      │             │   Knowledge     │              │
      └────────────►│      Base       │◄─────────────┘
                    │  (Documentação) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   WhatsApp +    │
                    │   Notificações  │
                    └─────────────────┘
```

### **Fluxo Integrado Completo:**

1. **Cliente abre ticket:** "Relatório de medição zerado no equipamento GYN1R801"

2. **Helpdesk detecta automaticamente:**
   - Keyword "medição" + código equipamento
   - Sugere usar ferramenta de diagnóstico

3. **Técnico clica em "Diagnosticar":**
   - Painel abre diagnóstico já preenchido
   - Análise automática executada

4. **Sistema identifica problema:**
   - Recursos não cadastrados
   - Gera solução passo a passo

5. **Técnico escolhe:**
   - ✅ Corrigir automaticamente (executa SQL via API)
   - OU 📧 Enviar orientação para cliente

6. **Validação automática:**
   - Aguarda 5 minutos
   - Re-executa diagnóstico
   - Se OK: Fecha ticket automaticamente
   - Se ainda com problema: Escala para supervisor

7. **Armazenamento no KB:**
   - Problema e solução indexados
   - IA aprende para próximas respostas

8. **Analytics:**
   - Atualiza dashboard
   - Contabiliza resolução
   - Envia relatório mensal

---

## 🚀 Como Começar a Expansão

### **Prioridade 1: Multi-Contrato**
1. Criar endpoint `/api/medicao/contratos`
2. Adicionar dropdown de contrato no componente
3. Implementar `/api/medicao/analise-contrato`

### **Prioridade 2: Integração Helpdesk**
1. Adicionar botão "Diagnosticar" nos tickets
2. Implementar função `extrairCodigoEquipamento()`
3. Criar deep link: `/diagnostico-medicao?sistema=X&equipamento=Y`

### **Prioridade 3: Histórico e Analytics**
1. Criar collection MongoDB `diagnosticos_medicao`
2. Salvar todos os diagnósticos realizados
3. Criar página `/analytics-medicao` com gráficos

---

**Próxima Ação Sugerida:** Implementar Prioridade 1 (Multi-Contrato) para permitir análise de qualquer contrato, não apenas equipamento individual.
