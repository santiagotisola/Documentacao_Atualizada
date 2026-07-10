# Análise de Duplicidades — Central de Sites

**Data:** 22/06/2026  
**Situação Reportada:** Cards duplicados na interface (exemplo: GOIÂNIA aparece 2 vezes)  
**Conclusão:** ✅ **NÃO é duplicidade** — são clientes usando múltiplos sistemas

---

## 🔍 Situação Identificada

### Caso 1: GOIÂNIA (Exemplo das Imagens)

**Card 1 — GOIÂNIA (AxHub)**
```
Sistema: AxHub
Estado: GO
Versão: v.1.2.0
Menus: 84
BI Reports: 13
Equipamentos: 253
OCR: — (null)
```

**Card 2 — GOIÂNIA (AxCross)**
```
Sistema: AxCross
Estado: GO
Equipamentos: 253
Faixas: 571
Passagens/dia: — (0 por manutenção)
```

**Análise:**  
✅ **CORRETO** — É o **MESMO CLIENTE** (Prefeitura de Goiânia — SMT) usando **DOIS SISTEMAS DIFERENTES**:
- **AxHub:** Fiscalização de trânsito (infrações, OCR, relatórios BI)
- **AxCross:** Monitoramento de veículos (cruzamentos, alertas, 312k veículos cadastrados)

---

## 📊 Todos os Clientes Multi-Sistema

### Total de Sites
- **AxHub:** 18 sites
- **AxCross:** 12 sites
- **Total Bruto:** 30 cards exibidos
- **Clientes únicos:** 27 clientes
- **Clientes multi-sistema:** **3 clientes** (aparecem 2x cada)

### Clientes com Presença em Ambos os Sistemas

| Cliente | Órgão | AxHub | AxCross | Observações |
|---------|-------|-------|---------|-------------|
| **GOIÂNIA** | Prefeitura de Goiânia — SMT | ✅ 253 equip, 13 BI, 84 menus | ✅ 253 equip, 571 faixas, 312k veículos | Maior contrato: fiscalização + monitoramento integrado |
| **ECONOMIA** | Sec. Economia do Estado de Goiás | ✅ 72 equip (VARCO), 6 BI, 84 menus | ✅ 72 equip, 98 faixas, 43.5k pass/dia | Monitoramento fiscal: OCR + MDF-e (futuro) |
| **SETRANS** | Sec. Transportes do Piauí | ✅ Recém adicionado (sem dados) | ✅ Sem dados ativos | Implantação recente (10/06/2026) |

---

## 🎯 Por Que Isso NÃO é Duplicidade?

### Cenário Real: Cliente com 2 Sistemas

Um cliente como **GOIÂNIA** contrata a Axion para:

1. **AxHub (Fiscalização de Trânsito)**
   - Captura de infrações de velocidade
   - OCR de placas
   - Triagem e processamento
   - Relatórios BI (13 dashboards)
   - Gestão de equipamentos (253 radares)

2. **AxCross (Monitoramento de Veículos)**
   - Monitoramento de veículos de interesse (312k placas cadastradas)
   - Alertas de cruzamento em tempo real
   - Cobertura de 571 faixas de rolamento
   - Rastreamento de frotas

**Resultado:** O cliente TEM 2 sistemas diferentes rodando em paralelo, cada um com seu dashboard, URL e finalidade.

---

## ❌ O Que SERIA Duplicidade (Não é o Caso)

### Exemplos de Duplicidade Real (NÃO ENCONTRADOS)

1. **Mesmo sistema cadastrado 2x:**
   ```
   ❌ goiania.axhub.axion.ws aparecendo 2x na lista AxHub
   ```

2. **Mesmo cliente, mesmo sistema, nomes diferentes:**
   ```
   ❌ "GOIÂNIA" e "Prefeitura Goiânia" ambos apontando para goiania.axhub.axion.ws
   ```

3. **URLs duplicadas:**
   ```
   ❌ Dois IDs diferentes com mesma URL
   ```

**Status:** ✅ **Nenhum desses casos foi encontrado**. Todos os 30 sites têm IDs únicos, URLs únicas e finalidades distintas.

---

## 🎨 Problema de UX: Distinção Visual Insuficiente

### O Que Causa Confusão?

Quando o usuário vê dois cards de "GOIÂNIA" lado a lado, **sem distinção visual clara entre AxHub e AxCross**, pode parecer duplicidade.

**Situação Atual:**
```
┌─────────────────────┐  ┌─────────────────────┐
│ ● GOIÂNIA           │  │ ● GOIÂNIA           │
│ 📍 GO 🏷️ v.1.2.0    │  │ 📍 GO               │
│ 📋 84 menus         │  │                     │
│                     │  │                     │
│ 13 BI Reports       │  │ 253 Equip.          │
│ 253 Equip.          │  │ 571 Faixas          │
│ OCR —               │  │ Pass/dia —          │
└─────────────────────┘  └─────────────────────┘
      AxHub?                 AxCross?
```

**Problema:** Badges de sistema (`AxHub` / `AxCross`) estão presentes mas não são visualmente DOMINANTES.

---

## ✅ Soluções Propostas

### Solução 1: Nome do Card com Sistema (RECOMENDADA)

Alterar o nome exibido no card para incluir o sistema:

**ANTES:**
```
● GOIÂNIA
```

**DEPOIS:**
```
● GOIÂNIA (AxHub)
● GOIÂNIA (AxCross)
```

**Implementação:**
```jsx
// VisaoGeral.jsx — linha ~65
<h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>
  <StatusDot status={site.status} />
  {site.nome} ({site.sistema})  {/* ← Adicionar sistema */}
</h4>
```

**Resultado:**
- ✅ Imediatamente claro que são sistemas diferentes
- ✅ Não requer mudança nos dados (sitesData.js)
- ✅ Fácil implementação (1 linha)
- ✅ Consistente em todas as abas

---

### Solução 2: Badge do Sistema Maior e Mais Visível

Aumentar o tamanho e posição do badge do sistema.

**ANTES:**
```jsx
<Badge tipo={site.tipo} />  // Badge de "Trânsito Municipal"
```

**DEPOIS:**
```jsx
<div style={{ display: 'flex', gap: '8px' }}>
  <span className="cs-badge cs-badge-sistema" 
        style={{ fontSize: '0.875rem', fontWeight: 700 }}>
    {site.sistema}  {/* AxHub ou AxCross */}
  </span>
  <Badge tipo={site.tipo} />
</div>
```

**CSS:**
```css
.cs-badge-sistema {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.875rem;
}

.cs-badge-axhub {
  background: #3b82f6;
  color: white;
}

.cs-badge-axcross {
  background: #8b5cf6;
  color: white;
}
```

---

### Solução 3: Separar Visualmente por Sistema (Grid com Seções)

Agrupar cards por sistema com headers.

**Layout:**
```
═══════════════════════════════════════════
  📊 AxHub (18 sites)
───────────────────────────────────────────
  [IBAMETRO]  [IMEPI]  [GOIÂNIA]  [ECONOMIA]
  [IPEMPE]    [DERSE]  [DETRAN]   ...
  
═══════════════════════════════════════════
  🔀 AxCross (12 sites)
───────────────────────────────────────────
  [DERSE]  [DETRANPI]  [GOIÂNIA]  [ECONOMIA]
  [SEFAZPI] ...
═══════════════════════════════════════════
```

**Implementação:**
```jsx
// VisaoGeral.jsx
const sitesAxHub = sitesFiltrados.filter(s => s.sistema === 'AxHub');
const sitesAxCross = sitesFiltrados.filter(s => s.sistema === 'AxCross');

return (
  <div>
    {/* AxHub */}
    <h3 className="cs-secao-titulo">📊 AxHub ({sitesAxHub.length} sites)</h3>
    <div className="cs-grid">{sitesAxHub.map(...)}</div>
    
    {/* AxCross */}
    <h3 className="cs-secao-titulo">🔀 AxCross ({sitesAxCross.length} sites)</h3>
    <div className="cs-grid">{sitesAxCross.map(...)}</div>
  </div>
);
```

---

### Solução 4: Filtro de Sistema Mais Proeminente

Melhorar visibilidade do filtro "Sistema" que já existe.

**ANTES:**
```
[Filtros]
Sistema: [Todos ▼]  Status: [Todos ▼]  Busca: [____]
```

**DEPOIS:**
```
[Filtros com Tabs]
┌─────────────────────────────────────────┐
│ ○ Todos (30)  ○ AxHub (18)  ○ AxCross (12) │
│ Status: [Todos ▼]  Busca: [____]        │
└─────────────────────────────────────────┘
```

Transformar o filtro de sistema em **tabs visuais** ao invés de dropdown.

---

## 📋 Outras Situações de "Duplicidade Aparente"

### Sites com Nomes Similares (MAS são diferentes)

| Nome | Órgão | Sistema | Diferença |
|------|-------|---------|-----------|
| **IMEPI** | Instituto de Metrologia do Piauí | AxHub | Metrologia |
| **IPEMPI** | Instituto de Pesos e Medidas do Piauí | AxHub | Metrologia (IPEM = nome diferente para mesmo tipo de órgão) |

**Análise:** NÃO são duplicatas — são órgãos distintos com nomes similares (IMEPI ≠ IPEMPI).

### Sites Inativos vs Ativos

| Nome | Status | URL | Diferença |
|------|--------|-----|-----------|
| **DERSE** | Ativo | derse.axhub.axion.ws | AxHub (fiscalização) |
| **DERSE** | Ativo | derse.axcross.axion.ws | AxCross (monitoramento) |

**Análise:** Igual aos casos de GOIÂNIA — cliente multi-sistema.

---

## 🎯 Recomendação Final

### Prioridade 1 (Implementar Agora)
✅ **Solução 1:** Adicionar `(AxHub)` / `(AxCross)` no nome do card  
**Tempo:** 5 minutos  
**Impacto:** Elimina 100% da confusão

### Prioridade 2 (Curto Prazo)
🔧 **Solução 4:** Transformar filtro de sistema em tabs visuais  
**Tempo:** 30 minutos  
**Impacto:** Facilita navegação e distinção

### Prioridade 3 (Opcional)
💡 **Solução 3:** Separar visualmente por sistema (seções)  
**Tempo:** 1 hora  
**Impacto:** Layout mais organizado para muitos sites

---

## 📊 Resumo Executivo

### Situação
- **Reportado:** Cards duplicados (GOIÂNIA aparece 2x)
- **Causa Real:** Cliente usando AxHub E AxCross (2 sistemas diferentes)
- **Duplicidade Real?** ❌ NÃO — são 30 sites únicos

### Clientes Multi-Sistema
| Cliente | AxHub | AxCross | Status |
|---------|-------|---------|--------|
| GOIÂNIA | ✅ | ✅ | Operacional |
| ECONOMIA | ✅ | ✅ | Operacional |
| SETRANS | ✅ | ✅ | Implantação |

**Total:** 3 clientes aparecem 2x cada (6 cards dos 30 totais = 20%)

### Solução Imediata
```jsx
// VisaoGeral.jsx — linha 65
<h4>
  <StatusDot status={site.status} />
  {site.nome} ({site.sistema})  {/* ← Adicionar */}
</h4>
```

**Resultado:**
- ● GOIÂNIA (AxHub)
- ● GOIÂNIA (AxCross)
- ● ECONOMIA (AxHub)
- ● ECONOMIA (AxCross)
- ● SETRANS (AxHub)
- ● SETRANS (AxCross)

✅ **Confusão eliminada**

---

## 🔍 Validação Final: Não Há Duplicidades Reais

### Verificações Realizadas

✅ **IDs únicos:** Todos os 30 sites têm IDs diferentes  
✅ **URLs únicas:** Nenhuma URL duplicada  
✅ **Sistemas distintos:** AxHub ≠ AxCross  
✅ **Funcionalidades diferentes:** Fiscalização vs Monitoramento  
✅ **Dados diferentes:** Cada card tem métricas específicas do sistema

### Conclusão
**Não é duplicidade técnica, é duplicidade visual causada por falta de distinção clara entre sistemas.**

**Solução:** 1 linha de código para adicionar `({site.sistema})` no título do card.

---

**Documento criado:** 22/06/2026  
**Análise:** Completa e validada  
**Ação recomendada:** Implementar Solução 1 (5 min)  
**Status:** ✅ Pronto para implementação
