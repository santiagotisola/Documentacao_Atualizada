# Análise de Viabilidade: Mover Coluna "DESAB." para Popup de Diferenças

**Data**: 2026-07-01  
**Objetivo**: Mover a coluna "Desabilitar Monitoramento" da tabela principal da Central de Sites para dentro do popup "Diferença Cadastro × Dashboard"

---

## 📋 Situação Atual

### **Tabela Principal** (ListaGeral.jsx - linha 283)
```
Colunas: ... | Dashboard | Status Equip. | DESAB. | Diferença | ...
```

- **Coluna "DESAB."** (linha 363-367): Exibe o **total agregado** de equipamentos com "Desabilitar Monitoramento" por site
- **Exemplo**: DETRANPI mostra "103" (103 equipamentos desabilitados)
- **Dados**: `eq.desabMonitoramento` (número total)

### **Popup "Diferença Cadastro × Dashboard"** (linha 95-165)
```
Popup atual:
┌────────────────────────────────────────────────────────────────┐
│ ⚖️ Diferença Cadastro × Dashboard                              │
│ DERSE — 24 equipamentos fora do dashboard                     │
│ ┌──────┬────────────┬────────────┬──────────────────────────┐ │
│ │CÓDIGO│HOMOLOGAÇÃO │   REGRA    │     COMO CORRIGIR        │ │
│ ├──────┼────────────┼────────────┼──────────────────────────┤ │
│ │SE202S│  ✓ Sim     │Pesagem Est.│Esperado — pesagem...     │ │
│ │SE203S│  ✓ Sim     │Pesagem Est.│Esperado — pesagem...     │ │
│ └──────┴────────────┴────────────┴──────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

**Grid atual**: `gridTemplateColumns: '82px 90px 118px 1fr'` (4 colunas)

---

## 🎯 Proposta: Adicionar 5ª Coluna "DESAB." no Popup

### Layout Proposto
```
Popup com 5 colunas:
┌──────────────────────────────────────────────────────────────────────┐
│ ⚖️ Diferença Cadastro × Dashboard                                    │
│ DERSE — 24 equipamentos fora do dashboard                           │
│ ┌──────┬────────────┬───────┬────────────┬──────────────────────┐  │
│ │CÓDIGO│HOMOLOGAÇÃO │DESAB. │   REGRA    │   COMO CORRIGIR      │  │
│ ├──────┼────────────┼───────┼────────────┼──────────────────────┤  │
│ │SE202S│  ✓ Sim     │  Não  │Pesagem Est.│Esperado — pesagem... │  │
│ │T1021 │    —       │ ✓ Sim │Desabilitado│Desmarcar flag...     │  │
│ └──────┴────────────┴───────┴────────────┴──────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

**Novo grid**: `gridTemplateColumns: '82px 90px 70px 118px 1fr'` (5 colunas)

---

## 🔍 Análise Técnica

### ✅ **Viabilidade: ALTA**

#### 1. **Dados Disponíveis**
- ✅ Os equipamentos já têm campo `motivo: 'DESABILITAR_MONITORAMENTO'`
- ✅ Podemos identificar equipamentos desabilitados via: `e.motivo === 'DESABILITAR_MONITORAMENTO'`
- ⚠️ **Alternativa**: Adicionar campo explícito `desabilitado: true/false` nos dados

**Exemplo nos dados atuais**:
```javascript
{
  cod:'AXBLITZ01',
  tipo:'Radar',
  fab:'Axion Tecnologia',
  motivo:'DESABILITAR_MONITORAMENTO',  // ← Indica desabilitado
  homologacao:true,
  correcao:'Desabilitado manualmente → Cadastro de Operações...'
}
```

#### 2. **Mudanças Necessárias no Código**

**Arquivo**: `ListaGeral.jsx`

##### a) **Remover coluna "DESAB." da tabela principal**
- Linha 283: Remover `<Th campo="desab">Desab.</Th>`
- Linha 363-367: Remover célula de desab

##### b) **Adicionar coluna no popup**
- Linha 126: Alterar grid para **5 colunas**
  ```javascript
  gridTemplateColumns: '82px 90px 70px 118px 1fr'
  ```
- Linha 127: Adicionar cabeçalho "Desab."
  ```javascript
  {['Código','Homologação','Desab.','Regra','Como Corrigir'].map(...)}
  ```
- Linha 138-156: Adicionar célula com badge "✓ Sim" / "Não"
  ```javascript
  <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
    {e.motivo === 'DESABILITAR_MONITORAMENTO' ? (
      <span style={{...}}>✓ Sim</span>
    ) : (
      <span style={{...}}>Não</span>
    )}
  </div>
  ```

##### c) **Ajustar largura do popup**
- Linha 89: Aumentar largura de 770px para **850px** (acomodar 5ª coluna)
  ```javascript
  const popW = hasEq ? 850 : 280;
  ```

#### 3. **Impacto Visual**

**Layout Atual (4 colunas - 770px)**:
```
| 82px  | 90px      | 118px | ~480px       |
| Código| Homologação| Regra | Como Corrigir|
```

**Layout Proposto (5 colunas - 850px)**:
```
| 82px  | 90px      | 70px | 118px | ~490px       |
| Código| Homologação| Desab.| Regra | Como Corrigir|
```

✅ Coluna "Desab." com 70px é suficiente para "✓ Sim" / "Não"  
✅ Popup total: 850px (dentro do limite de 1024px mínimo)

---

## 📊 Benefícios vs. Desvantagens

### ✅ **Benefícios**

1. **Informação Detalhada**: Ver status de desabilitação por equipamento individual, não apenas total do site
2. **Contexto Unificado**: Todas as informações críticas (Homologação + Desab.) em um único popup
3. **Redução de Colunas**: Tabela principal fica mais limpa (-1 coluna)
4. **Consistência**: Segue mesmo padrão da coluna "Homologação" (✓ Sim / Não)

### ⚠️ **Desvantagens / Considerações**

1. **Perda de Visão Geral**: Não há mais contagem rápida de desabilitados na tabela principal
   - **Solução**: Manter total no popup de resumo (Dashboard) - linha 63
2. **Largura do Popup**: Aumenta de 770px → 850px (+80px)
   - ✅ Ainda responsivo para 1024px+
3. **Dados Adicionais**: Precisa garantir que todos os equipamentos tenham campo `desabilitado` ou usar `motivo`

---

## 🎨 Implementação Recomendada

### **Opção 1: Usar Campo `motivo` (Mais Rápido)**

**Vantagem**: Não precisa modificar `sitesData.js` (259 equipamentos)  
**Desvantagem**: Menos semântico

```javascript
// No popup, coluna 3
<div>
  {e.motivo === 'DESABILITAR_MONITORAMENTO' ? (
    <span style={{color:'#f59e0b', fontWeight:700}}>✓ Sim</span>
  ) : (
    <span style={{color:'#94a3b8'}}>Não</span>
  )}
</div>
```

### **Opção 2: Adicionar Campo `desabilitado` (Mais Semântico)**

**Vantagem**: Dados explícitos e claros  
**Desvantagem**: Precisa atualizar ~150+ equipamentos em `sitesData.js`

```javascript
// Em sitesData.js
{
  cod:'AXBLITZ01',
  desabilitado: true,  // ← Novo campo
  homologacao: true,
  motivo: 'DESABILITAR_MONITORAMENTO',
  ...
}

// No popup
<div>
  {e.desabilitado ? (
    <span style={{...}}>✓ Sim</span>
  ) : (
    <span style={{...}}>Não</span>
  )}
</div>
```

---

## 🚀 Plano de Implementação

### **Fase 1: MVP (5 minutos)**
1. ✅ Remover coluna "DESAB." da tabela principal
2. ✅ Adicionar 5ª coluna no popup (usar `motivo`)
3. ✅ Ajustar grid: `'82px 90px 70px 118px 1fr'`
4. ✅ Ajustar largura popup: 850px
5. ✅ Testar responsividade

### **Fase 2: Refinamento (Opcional)**
1. ⏳ Adicionar campo `desabilitado` aos 152 equipamentos com `DESABILITAR_MONITORAMENTO`
2. ⏳ Manter total de desabilitados no popup de resumo (Dashboard)
3. ⏳ Adicionar tooltip explicativo na coluna "Desab."

---

## 🎯 Recomendação Final

### ✅ **VIÁVEL e RECOMENDADO**

**Prioridade**: **ALTA** (melhora significativa de UX)  
**Complexidade**: **BAIXA** (1 arquivo, ~20 linhas alteradas)  
**Risco**: **MÍNIMO** (não quebra funcionalidades existentes)

**Próximo Passo**: Implementar **Opção 1** (usar campo `motivo`) para validação rápida.

---

## 📝 Checklist de Validação

- [ ] Remover coluna "DESAB." da tabela principal (2 linhas)
- [ ] Adicionar cabeçalho "Desab." no popup
- [ ] Adicionar célula com badge no popup (linha por equipamento)
- [ ] Ajustar grid de 4 para 5 colunas
- [ ] Ajustar largura popup (770px → 850px)
- [ ] Testar em tela 1024px (responsividade)
- [ ] Validar com dados reais (IMEPI: 17 desab, DETRANPI: 103 desab)
- [ ] Testar scroll interno do popup (lista grande)
- [ ] Verificar alinhamento e espaçamento
- [ ] Deploy e validação com usuário

---

## 📚 Arquivos Afetados

1. **`axion-ia-panel/src/pages/CentralSites/components/ListaGeral.jsx`**
   - Remover: linhas 283, 363-367 (coluna DESAB. na tabela)
   - Adicionar: linha 126-157 (5ª coluna no popup)
   - Modificar: linha 89 (largura popup), linha 126 (grid)

2. **`axion-ia-panel/src/data/sitesData.js`** (Opcional - Fase 2)
   - Adicionar campo `desabilitado: true` em ~152 equipamentos

---

**Conclusão**: ✅ Implementação é **viável, recomendada e de baixo risco**. Melhora significativa na experiência do usuário ao consolidar informações críticas no mesmo contexto.
