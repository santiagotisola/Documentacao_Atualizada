# Análise de Viabilidade: Coluna "Homologação" na Diferença Cadastro × Dashboard

**Data**: 2026-07-01  
**Solicitante**: Santiago  
**Sistema**: Central de Sites - Axion IA Panel  
**Objetivo**: Adicionar coluna "Homologação" após o campo "Código" na aba "Diferença Cadastro × Dashboard"

---

## 📋 Resumo Executivo

**Viabilidade**: ✅ **TOTALMENTE VIÁVEL**  
**Complexidade**: 🟡 **MÉDIA**  
**Tempo Estimado**: 2-4 horas  
**Impacto**: Baixo (mudança localizada, sem breaking changes)

---

## 🎯 Objetivo da Funcionalidade

Adicionar uma nova coluna "Homologação" no popup de detalhes de diferença entre Cadastro de Operações e Dashboard, permitindo visualizar rapidamente quais equipamentos estão marcados como "Homologação" no Cadastro de Operações.

### Layout Atual:
```
┌─────────┬─────────┬──────────────────┐
│ Código  │  Regra  │ Como Corrigir    │
├─────────┼─────────┼──────────────────┤
│ BA010C  │ Op.Exp. │ Renovar DataFinal│
└─────────┴─────────┴──────────────────┘
```

### Layout Proposto:
```
┌─────────┬──────────────┬─────────┬──────────────────┐
│ Código  │ Homologação  │  Regra  │ Como Corrigir    │
├─────────┼──────────────┼─────────┼──────────────────┤
│ BA010C  │     Sim      │ Op.Exp. │ Renovar DataFinal│
└─────────┴──────────────┴─────────┴──────────────────┘
```

---

## 🔍 Análise Técnica

### 1. Localização dos Componentes

#### Frontend:
- **Arquivo**: `axion-ia-panel/src/pages/CentralSites/components/ListaGeral.jsx`
- **Componente**: `PopupAuditoria` (linhas ~18-162)
- **Seção Específica**: Renderização da grid de equipamentos (linhas ~130-153)

#### Dados Estáticos:
- **Arquivo**: `axion-ia-panel/src/data/sitesData.js`
- **Campo**: `diferenca_equipamentos[]` dentro de cada site
- **Estrutura Atual**:
  ```javascript
  {
    cod: 'BA010C',
    tipo: 'OCR',
    fab: 'FOCALLE',
    motivo: 'OPERAÇÃO_EXPIRADA',
    correcao: 'DataFinal expirou...'
  }
  ```

#### Backend (Fonte de Dados Real):
- **Tabela**: `TBOperacoes` (SQL Server)
- **Campos Relevantes**:
  - `IdOperacao`
  - `EquipamentoId` (FK para TBEquipamentos)
  - `DataHomologacao` (existe no schema do AxHub)
  - `ConfiguracoesAdicionais` (campo que pode conter flag "Homologação")

---

## 🛠️ Implementação Necessária

### Fase 1: Adicionar Campo nos Dados Estáticos (Mock)

**Arquivo**: `axion-ia-panel/src/data/sitesData.js`

Adicionar campo `homologacao` em cada equipamento:

```javascript
diferenca_equipamentos: [
  {
    cod: 'BA010C',
    tipo: 'OCR',
    fab: 'FOCALLE',
    motivo: 'OPERAÇÃO_EXPIRADA',
    homologacao: true,  // ← NOVO CAMPO
    correcao: 'DataFinal expirou em 2024-10-31 → Cadastro de Operações → renovar Data Final'
  },
  // ... demais equipamentos
]
```

**Valores Possíveis**:
- `true` / `false` (booleano)
- Ou `"Sim"` / `"Não"` / `null` (string para casos sem informação)

---

### Fase 2: Modificar Layout do Popup

**Arquivo**: `axion-ia-panel/src/pages/CentralSites/components/ListaGeral.jsx`

#### 2.1. Atualizar Grid Layout (linha ~134)

**Antes**:
```javascript
<div style={{ 
  display:'grid', 
  gridTemplateColumns:'82px 118px 1fr',  // 3 colunas
  gap:'0 8px', 
  padding:'0 2px 4px', 
  // ...
}}>
```

**Depois**:
```javascript
<div style={{ 
  display:'grid', 
  gridTemplateColumns:'82px 95px 118px 1fr',  // 4 colunas: Código + Homologação + Regra + Corrigir
  gap:'0 8px', 
  padding:'0 2px 4px', 
  // ...
}}>
```

#### 2.2. Atualizar Cabeçalho da Tabela (linha ~135)

**Antes**:
```javascript
{['Código','Regra','Como Corrigir'].map(h => (
  <span key={h} style={{ /* ... */ }}>{h}</span>
))}
```

**Depois**:
```javascript
{['Código','Homologação','Regra','Como Corrigir'].map(h => (
  <span key={h} style={{ /* ... */ }}>{h}</span>
))}
```

#### 2.3. Adicionar Coluna na Renderização dos Equipamentos (linha ~140-154)

**Antes**:
```javascript
<div style={{ 
  display:'grid', 
  gridTemplateColumns:'82px 118px 1fr',  // 3 colunas
  gap:'0 8px', 
  // ...
}}>
  <div>  {/* Código + Fabricante */}
    <div>{e.cod}</div>
    <div>{e.fab}</div>
  </div>
  <span>{/* Regra */}</span>
  <div>{/* Como Corrigir */}</div>
</div>
```

**Depois**:
```javascript
<div style={{ 
  display:'grid', 
  gridTemplateColumns:'82px 95px 118px 1fr',  // 4 colunas
  gap:'0 8px', 
  // ...
}}>
  <div>  {/* Código + Fabricante */}
    <div>{e.cod}</div>
    <div>{e.fab}</div>
  </div>
  
  {/* NOVA COLUNA: Homologação */}
  <div style={{ 
    display:'flex', 
    alignItems:'center', 
    justifyContent:'center',
    marginTop:2 
  }}>
    {e.homologacao ? (
      <span style={{ 
        color: '#3b82f6', 
        fontWeight: 700, 
        fontSize: '0.75rem',
        background: 'rgba(59,130,246,0.1)',
        padding: '2px 8px',
        borderRadius: 4,
        border: '1px solid rgba(59,130,246,0.3)'
      }}>
        ✓ Sim
      </span>
    ) : (
      <span style={{ 
        color: '#94a3b8', 
        fontSize: '0.75rem' 
      }}>
        —
      </span>
    )}
  </div>
  
  <span>{/* Regra */}</span>
  <div>{/* Como Corrigir */}</div>
</div>
```

#### 2.4. Ajustar Largura do Popup (linha ~94)

**Antes**:
```javascript
const popW = hasEq ? 660 : 280;
```

**Depois**:
```javascript
const popW = hasEq ? 760 : 280;  // +100px para acomodar nova coluna
```

---

### Fase 3: Buscar Dados Reais da API (Backend)

Para popular o campo `homologacao` com dados reais do banco de dados:

#### 3.1. Criar Endpoint na API

**Arquivo**: `axion-ia-panel/api/src/sites-stats-controller.js`

Adicionar nova função para buscar status de homologação:

```javascript
/**
 * GET /api/sites/equipamentos-homologacao/:siteId
 * Retorna lista de equipamentos com status de homologação
 */
export async function getEquipamentosHomologacao(req, res) {
  const { siteId } = req.params;
  
  try {
    // Conectar ao banco do site específico
    const pool = await conectarSite(siteId);
    
    const result = await pool.request().query(`
      SELECT 
        e.Codigo AS cod,
        CASE 
          WHEN o.ConfiguracoesAdicionais LIKE '%Homologacao%' THEN 1
          WHEN o.DataHomologacao IS NOT NULL THEN 1
          ELSE 0
        END AS homologacao,
        o.DataHomologacao,
        o.DataFinal
      FROM TBEquipamentos e
      LEFT JOIN TBOperacoes o ON e.IdEquipamento = o.IdEquipamento
      WHERE o.DataFinal >= GETDATE() OR o.DataFinal IS NULL
      ORDER BY e.Codigo
    `);
    
    return res.json({
      siteId,
      equipamentos: result.recordset
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
```

#### 3.2. Adicionar Rota

**Arquivo**: `axion-ia-panel/api/src/routes/index.js`

```javascript
router.get('/sites/equipamentos-homologacao/:siteId', sitesStatsController.getEquipamentosHomologacao);
```

#### 3.3. Integrar no Frontend

**Arquivo**: `axion-ia-panel/src/pages/CentralSites/index.jsx`

Adicionar chamada para buscar dados de homologação ao carregar os sites:

```javascript
const [homologacaoData, setHomologacaoData] = useState({});

useEffect(() => {
  async function fetchHomologacao() {
    try {
      const promises = AXHUB_SITES.map(site => 
        api.get(`/sites/equipamentos-homologacao/${site.id}`)
          .then(r => ({ siteId: site.id, data: r.data.equipamentos }))
          .catch(() => ({ siteId: site.id, data: [] }))
      );
      
      const results = await Promise.all(promises);
      const dataMap = {};
      
      results.forEach(r => {
        dataMap[r.siteId] = r.data.reduce((acc, eq) => {
          acc[eq.cod] = eq.homologacao;
          return acc;
        }, {});
      });
      
      setHomologacaoData(dataMap);
    } catch (err) {
      console.error('Erro ao buscar dados de homologação:', err);
    }
  }
  
  fetchHomologacao();
}, []);
```

#### 3.4. Mesclar Dados no Popup

No componente `ListaGeral.jsx`, ao renderizar os equipamentos:

```javascript
{equipamentos.map((e, i) => {
  const homologacao = homologacaoData?.[site.id]?.[e.cod] ?? null;
  // ... usar valor real de `homologacao` ao invés do mock
})}
```

---

## ⚠️ Pontos de Atenção

### 1. Variação de Dados
- Nem todos os sites podem ter o campo `ConfiguracoesAdicionais` ou `DataHomologacao` populado
- Precisa tratar casos onde o valor é `null` ou indefinido

### 2. Performance
- Se houver muitos sites, fazer cache dos dados de homologação
- Considerar lazy loading (buscar apenas quando o popup for aberto)

### 3. Responsividade
- O popup pode ficar estreito demais em telas pequenas com a 4ª coluna
- Considerar tornar a coluna "Como Corrigir" colapsável ou usar scroll horizontal

### 4. Consistência de Dados
- O campo "Homologação" nas Configurações Adicionais (imagem 1) é um checkbox
- Precisa confirmar se o valor é armazenado como:
  - Campo booleano separado
  - Parte do campo texto `ConfiguracoesAdicionais`
  - Ou se `DataHomologacao != NULL` indica homologação

---

## 📦 Estrutura de Commits Sugerida

### Commit 1: Mock de Dados
```
feat(central-sites): adicionar campo homologacao em diferenca_equipamentos

- Adiciona campo booleano 'homologacao' em sitesData.js
- Popula valores de exemplo para equipamentos de teste
```

### Commit 2: Interface
```
feat(central-sites): adicionar coluna Homologação no popup de diferença

- Modifica grid CSS para 4 colunas
- Adiciona renderização condicional do status de homologação
- Ajusta largura do popup para acomodar nova coluna
```

### Commit 3: Integração com API (Opcional)
```
feat(api): endpoint para buscar status de homologação de equipamentos

- Cria GET /api/sites/equipamentos-homologacao/:siteId
- Consulta TBOperacoes e TBEquipamentos
- Retorna mapa de equipamentos com flag de homologação
```

### Commit 4: Mesclar Dados Reais
```
feat(central-sites): integrar dados reais de homologação

- Busca dados de homologação via API ao carregar sites
- Mescla dados reais com mock no popup
- Adiciona tratamento de erros e fallback
```

---

## ✅ Checklist de Implementação

### Frontend (Obrigatório)
- [ ] Adicionar campo `homologacao` em `sitesData.js` (pelo menos 3 sites de exemplo)
- [ ] Modificar grid CSS para 4 colunas em `ListaGeral.jsx`
- [ ] Adicionar cabeçalho "Homologação" na tabela
- [ ] Renderizar coluna com badge visual (✓ Sim / —)
- [ ] Ajustar largura do popup (`popW`)
- [ ] Testar responsividade em diferentes resoluções
- [ ] Validar cores e contraste (acessibilidade)

### Backend (Opcional - Fase 2)
- [ ] Criar função `getEquipamentosHomologacao` em `sites-stats-controller.js`
- [ ] Adicionar rota em `routes/index.js`
- [ ] Testar query SQL em ambiente de homologação
- [ ] Validar campos `DataHomologacao` e `ConfiguracoesAdicionais` no banco
- [ ] Adicionar tratamento de erro para sites sem acesso

### Integração (Opcional - Fase 2)
- [ ] Adicionar estado `homologacaoData` em `CentralSites/index.jsx`
- [ ] Criar `useEffect` para buscar dados na montagem
- [ ] Mesclar dados reais no popup
- [ ] Adicionar loading state
- [ ] Adicionar retry em caso de erro

### Testes
- [ ] Testar popup com 0, 1, 5, 20+ equipamentos
- [ ] Testar com valores `true`, `false`, `null`
- [ ] Testar responsividade em mobile (scroll horizontal se necessário)
- [ ] Validar acessibilidade (contrast ratio, keyboard navigation)
- [ ] Testar em diferentes navegadores (Chrome, Firefox, Edge)

---

## 🎨 Referências de Design

### Cores Propostas para Status de Homologação:

```css
/* Homologação Ativa (Sim) */
background: rgba(59, 130, 246, 0.1);  /* azul claro */
color: #3b82f6;                        /* azul médio */
border: 1px solid rgba(59, 130, 246, 0.3);

/* Sem Homologação (Não) */
color: #94a3b8;                        /* cinza */
```

### Exemplos Visuais:

**Badge de Homologação Ativa**:
```
┌─────────┐
│ ✓ Sim   │  (fundo azul claro, texto azul)
└─────────┘
```

**Sem Homologação**:
```
  —  (texto cinza simples)
```

---

## 📊 Impacto e Riscos

### Impacto:
- ✅ **Baixo**: Mudança localizada no popup, sem afetar outras funcionalidades
- ✅ **Reversível**: Fácil de remover se necessário
- ✅ **Performance**: Impacto mínimo (apenas renderização de uma coluna extra)

### Riscos:
- 🟡 **Dados Incompletos**: Nem todos os equipamentos podem ter informação de homologação
  - **Mitigação**: Mostrar "—" para casos sem informação
- 🟡 **Layout Mobile**: Pode ficar apertado em telas pequenas
  - **Mitigação**: Usar scroll horizontal ou colapsar colunas menos importantes
- 🟢 **Breaking Changes**: Nenhum (adiciona funcionalidade sem remover existente)

---

## 🚀 Recomendação Final

**Implementar em 2 fases**:

### Fase 1 (Rápida - 2h):
1. Adicionar campo mock em `sitesData.js`
2. Modificar interface do popup
3. Testar e validar visualmente
4. Deploy para usuários validarem o layout

### Fase 2 (Completa - 4h adicional):
1. Criar endpoint na API
2. Buscar dados reais do banco
3. Integrar no frontend
4. Testes de integração

---

## 📝 Observações Finais

- A coluna "Homologação" pode ser útil para auditoria e rastreabilidade
- Considerar adicionar tooltip com `DataHomologacao` (data exata) ao passar o mouse
- Futuramente, pode-se adicionar filtro por equipamentos em homologação
- Documentar no guia do usuário como usar essa informação para análise

---

**Análise realizada por**: GitHub Copilot  
**Contato para dúvidas**: [Link para documentação interna]
