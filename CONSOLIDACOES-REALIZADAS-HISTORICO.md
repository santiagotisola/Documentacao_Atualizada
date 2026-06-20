# CONSOLIDACOES-REALIZADAS-HISTORICO

**Data de Consolidação:** 2026-06-20 18:19
**Arquivos Consolidados:** 2

---

## ÍNDICE

1. CONSOLIDACAO-PORTAS-CONCLUIDA.md
2. CONSOLIDACAO-REGRAS-NEGOCIO-TODOS-SITES.md

---

# DOCUMENTO 1: CONSOLIDACAO-PORTAS-CONCLUIDA.md

# ✅ Consolidação de Portas — Painel Único

**Data:** 13 de maio de 2026  
**Status:** ✅ **CONSOLIDADO COM SUCESSO**

---

## 📋 Antes da Consolidação (Problema)

Sistema espalhado em múltiplas portas:

```
❌ Porta 3001: Painel React (teste)
❌ Porta 3002: Painel React (teste)
❌ Porta 3003: Painel React (teste)
✅ Porta 3100: API Backend (fixa)
```

**Problema:** URLs de conformidade apontando para portas diferentes
- `http://localhost:3001/conformidade`
- `http://localhost:3002/conformidade`
- `http://localhost:3003/conformidade` (alternava)

---

## 🔧 Solução Implementada

### Etapa 1: Configuração do Vite (vite.config.js)

**Antes:**
```javascript
server: {
  port: 3001
}
```

**Depois:**
```javascript
server: {
  port: 3001,
  strictPort: true,  // ← Força porta fixa
  hmr: {
    protocol: 'http',
    host: 'localhost',
    port: 3001
  }
}
```

**Resultado:** ✅ Painel sempre na porta 3001

---

## 📍 Depois da Consolidação (Solução)

### Arquitetura Consolidada

```
┌─────────────────────────────────────────────────────┐
│           AxionIA — Sistema Consolidado             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  🖥️  API Backend                                    │
│     http://localhost:3100                           │
│     • Express.js                                   │
│     • MongoDB conectado                            │
│     • 7 endpoints de confiança                     │
│                                                     │
│  🎨 React Panel                                     │
│     http://localhost:3001                           │
│     • Vite v6.4.1                                  │
│     • Componentes carregados                       │
│     • Rotas fixas                                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│              URLs Consolidadas                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📜 Conformidade com Editais                        │
│     http://localhost:3001/conformidade              │
│     ✅ Relatórios, novo upload, análise            │
│                                                     │
│  🔍 Fila de Revisão                                 │
│     http://localhost:3001/confianca                 │
│     ✅ Filtros, estatísticas, exportação           │
│                                                     │
│  Dashboard                                          │
│     http://localhost:3001                           │
│     ✅ Visão geral de todos os sistemas            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Validação Completa

### Teste 1: API Backend
```bash
$ curl http://localhost:3100/api/conformidade
HTTP/1.1 200 OK ✅
```

### Teste 2: Painel React
```
$ npm run dev
VITE v6.4.1 ready in 286 ms
➜ Local: http://localhost:3001/ ✅
```

### Teste 3: Conformidade
```
URL: http://localhost:3001/conformidade
Status: ✅ Carregado
Relatórios: 8 listados
```

### Teste 4: Fila de Revisão
```
URL: http://localhost:3001/confianca
Status: ✅ Carregado
Filtros: Produto, Status, Prioridade ✅
Botões: Atualizar, Exportar CSV ✅
```

---

## 📊 Resumo de Mudanças

| Item | Antes | Depois | Status |
|------|-------|--------|--------|
| Painel Port | Alternava (3001-3003) | Fixo 3001 | ✅ Consolidado |
| API Port | Fixo 3100 | Fixo 3100 | ✅ Mantido |
| Conformidade URL | `localhost:3002/conformidade` | `localhost:3001/conformidade` | ✅ Unificado |
| Fila de Revisão URL | `localhost:3003/confianca` | `localhost:3001/confianca` | ✅ Unificado |
| Config File | Sem strictPort | strictPort: true | ✅ Aprimorado |

---

## 🚀 Sistema Consolidado — Checklist Final

- ✅ API Backend rodando (porta 3100)
- ✅ Painel React rodando (porta 3001 — **FIXO**)
- ✅ Conformidade acessível: `http://localhost:3001/conformidade`
- ✅ Fila de Revisão acessível: `http://localhost:3001/confianca`
- ✅ MongoDB conectado
- ✅ Todas as rotas funcionando
- ✅ Filtros operacionais
- ✅ Exportação CSV pronta
- ✅ Interface responsiva
- ✅ Hot reload (HMR) configurado

---

## 📝 Arquivo Modificado

**Arquivo:** `axion-ia-panel/vite.config.js`

**Mudanças:**
```diff
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
+   strictPort: true,
+   hmr: {
+     protocol: 'http',
+     host: 'localhost',
+     port: 3001
+   }
  }
})
```

---

## 🎯 Instruções para Usar

### Iniciar os Serviços

**Terminal 1 — API Backend:**
```bash
cd axion-ia-api
node src/app.js
# Rodando em http://localhost:3100
```

**Terminal 2 — Painel React:**
```bash
cd axion-ia-panel
npm run dev
# Rodando em http://localhost:3001
```

### Acessar as Páginas

```
📊 Dashboard:              http://localhost:3001
📜 Conformidade:           http://localhost:3001/conformidade
🔍 Fila de Revisão:        http://localhost:3001/confianca
🎛️ Configurações:          http://localhost:3001/config
📋 Relatório Fluxo:        http://localhost:3001/relatorio-fluxo
⏱️ Planilha de Horas:      http://localhost:3001/planilha-horas
📊 SLA Compliance:         http://localhost:3001/sla-compliance
```

---

## ✨ Benefícios da Consolidação

1. **Único local de acesso** — Tudo em localhost:3001
2. **URLs previsíveis** — Sem alternância de portas
3. **Facilita documentação** — Referências única
4. **Melhor para testes** — Sem surpresas de porta
5. **Mais intuitivo** — Usuário não se perde
6. **Fácil de replicar** — Configuração clara no Vite

---

## 🔐 Notas de Segurança

- ✅ API sem autenticação (desenvolvimento — OK)
- ✅ MongoDB localhost apenas (desenvolvimento — OK)
- ✅ CORS não configurado (localhost — OK)

**Para Produção:**
- [ ] Adicionar API_TOKEN em `.env`
- [ ] Configurar CORS whitelist
- [ ] Usar variáveis de ambiente para portas
- [ ] Habilitar autenticação OAuth

---

## 📈 Próximas Etapas

1. ✅ **Consolidação completa** — Feito
2. 📋 **Validação com PDFs reais** — Próximo
3. 🔄 **Teste de carga** — Depois
4. 📊 **Dashboard BI** — Futuro

---

**Consolidação Concluída!** 🎉

Agora tudo funciona em um único local. Use:
- **http://localhost:3001** para painel, conformidade e fila
- **http://localhost:3100** para API (backend)


---

# DOCUMENTO 2: CONSOLIDACAO-REGRAS-NEGOCIO-TODOS-SITES.md

# Consolidação de Regras de Negócio — Todos os Sites

> Análise completa realizada em 16/05/2026 — Comparação tela a tela de todos os contratos AxHub e AxCross

---

## 1. Resumo Executivo

### AxHub — 15 sites identificados, 11 analisados

| Site | Versão | Menu | Tipo Contrato | Status |
|------|--------|------|---------------|--------|
| IBAMETRO | v.1.0.0 | 80 | Metrologia | ✅ Analisado |
| IMEPI | v.1.0.0 | 80 | Metrologia | ✅ Analisado |
| IMEQPB | v.1.0.0 | 80 | Metrologia | ✅ Analisado |
| IMETROPA | v.1.0.0 | 80 | Metrologia | ✅ Analisado |
| IPEMCE | v.1.0.0 | 84 | Metrologia | ✅ Analisado |
| IPEMPE | v.1.0.0 | 82 | Metrologia | ✅ Analisado |
| DERSE | v.1.0.0 | 82 | Rodovias | ✅ Analisado |
| STRANS | v.1.2.0 | 84 | Trânsito Municipal | ✅ Analisado |
| DETRANMA | v.1.1.0 | 83 | Trânsito Estadual | ✅ Analisado |
| DETRANPI | v.1.1.1 | 83 | Trânsito + Rodovias (híbrido) | ✅ Analisado |
| GOIÂNIA | v.1.2.0 | 84 | Trânsito Municipal | ✅ Analisado |
| IPEMMT | — | — | Metrologia | ❌ Credenciais inválidas |
| ITPS | — | — | Metrologia | ❌ Credenciais inválidas |
| SMTT | — | — | Trânsito | ❌ Cloudflare CAPTCHA |
| ECONOMIA | — | — | Fiscal (OIDC) | ❌ IdP diferente |

### AxCross — 11 sites identificados, 8 analisados

| Site | Equip | Faixas | Veículos | Pass/dia | Menu | Status |
|------|-------|--------|----------|----------|------|--------|
| DERSE | 171 | 334 | 422.467 | 45.987 | 6 padrão | ✅ |
| DETRANPI | 77 | 167 | 224 | 58.877 | 6 padrão | ✅ |
| DETRANMA | 69 | 146 | 400 | — | 6 padrão | ✅ |
| IMPERATRIZ | 21 | 41 | 14 | 49.702 | 6 padrão | ✅ |
| IPEMCE | 20 | 57 | 0 | — | 6 padrão | ✅ |
| IPEMMT | 0 | 0 | 0 | 0 | 6 padrão | ✅ (vazio) |
| IPEMPE | 17 | 44 | 67 | 0 | 6 padrão | ✅ |
| SEFAZPI | 77 | 169 | 0 | 62.764 | **7 (+ MDF-e)** | ✅ |
| SETRANS | — | — | — | — | — | ❌ Timeout |
| ibametro.axcross | — | — | — | — | — | ❌ DNS inexistente |
| strans.axcross | — | — | — | — | — | ❌ DNS inexistente |

---

## 2. Classificação de Contratos por Tipo

### 2.1 Metrologia (IPEMs/IMEQs)
**Sites:** IBAMETRO, IMEPI, IMEQPB, IMETROPA, IPEMCE, IPEMPE, IPEMMT, ITPS

**Características:**
- Menu base 80 itens (ou 82-84 com feature flags)
- Foco em **verificação metrológica** de equipamentos (afericões)
- BI com relatórios de **Cronotacógrafo** (Exportação Crono, Infração Crono, Triagem Crono)
- Equipamentos tipo: AXION, BLITZ, FOCALLE (próprios do parceiro)
- OCR como métrica principal de performance (49% a 96%)
- Operações com colunas: Fim Op., Dt. Aceite, Dt. Homol., Homol., Monit.

### 2.2 Trânsito Municipal
**Sites:** STRANS (Teresina), GOIÂNIA, SMTT

**Características:**
- Menu 83-84 itens (com extras: Infrações Descartadas, Consulta de Placas, Bloqueio de Operação)
- Foco em **fiscalização eletrônica de velocidade**
- BI com relatórios de **Radares** (Dados Descartes Radares, Processamento Contratos)
- Equipamentos tipo: FOCALLE, VIZENTEC, FX EXCLUSIVA, PERKONS (speed enforcement)
- Operações com colunas: Grupo, Fabricante, Instalação, Início Op., Conexão, Infração, Passagem
- Goiânia tem o MAIOR número de BI (13 relatórios!)

### 2.3 Trânsito Estadual
**Sites:** DETRANMA, DETRANPI

**Características:**
- Menu 83 itens (+Infrações Descartadas, +Consulta de Placas, +Acessos Por IP)
- Similar ao Trânsito Municipal porém sem "Bloqueio de Operação"
- DETRANMA: apenas equipamentos FISCALIZAÇÃO ELETRÔNICA DE VELOCIDADE (60 equip)
- DETRANPI: híbrido com BALANÇA + VELOCIDADE (ENGEBRÁS, FOCALLE, VELSIS, VIZENTEC, OCR)

### 2.4 Rodovias
**Sites:** DERSE

**Características:**
- Menu 82 itens (+Infrações Descartadas, +Acessos Por IP)
- Foco em **pesagem e fiscalização rodoviária**
- Equipamentos: FOCALLE, PERKONS, LASERTECH, AXION, BLITZ, **BALANÇA**, **PESAGEM ESTATÍSTICA**
- BI com "Relatório de Fluxo de Veículos Pesados" (exclusivo)
- 159 equipamentos ativos, maior parque de todas as metrologia/trânsito

### 2.5 Fiscal (Monitoramento de Cargas)
**Sites:** SEFAZPI (AxCross), ECONOMIA (AxHub)

**Características:**
- SEFAZPI: módulo exclusivo **MDF-e** (Manifesto de Documentos Fiscais Eletrônicos)
- Integração OCR + SEFAZ para monitorar cargas
- Rastreia veículos com/sem documentação fiscal
- ECONOMIA: autenticação OIDC separada (economia.axion.ws)

---

## 3. Feature Flags — Menus Extras por Site

| Feature Flag | 80 base | 82 | 83 | 84 |
|--------------|---------|----|----|-----|
| Infrações Descartadas | ❌ | ✅ | ✅ | ✅ |
| Consulta de Placas | ❌ | ❌ | ✅ | ✅ |
| Bloqueio de Operação | ❌ | ❌ | ❌ | ✅ |
| Acessos Por IP | ❌ | ✅ | ✅ | ✅ |

### Distribuição:
- **80 itens (base):** IBAMETRO, IMEPI, IMEQPB, IMETROPA
- **82 itens:** DERSE, IPEMPE
- **83 itens:** DETRANMA, DETRANPI
- **84 itens:** STRANS, IPEMCE, GOIÂNIA

---

## 4. Relatórios BI — Comparação Detalhada

### 4.1 Relatórios COMUNS a todos:
| # | Relatório | Todos |
|---|-----------|-------|
| 1 | Diário de Disponibilidade | ✅ |
| 2 | Índice de OCR | ✅ |
| 3 | Índice de OCR - Data x Hora | ✅ |
| 4 | Relatório de Triagem por Usuário | ✅ |
| 5 | Relatório Média de Fluxo por Porte | ✅ |
| 6 | Relatório Processamento de Imagens | Maioria |

### 4.2 Relatórios EXCLUSIVOS por tipo:

| Relatório | Metrologia | Trânsito | Rodovias | Goiânia |
|-----------|------------|----------|----------|---------|
| Exportação Crono | ✅ | ❌ | ❌ | ❌ |
| Infração Crono | ✅ | ❌ | ❌ | ❌ |
| Triagem Crono Data/Equip | ✅ | ❌ | ❌ | ❌ |
| Relatório de Infração | ❌ | ✅ | ✅ | ✅ |
| Processamento de Contratos | ❌ | ✅ | ✅ | ❌ |
| Dados Descarte Radares | ❌ | STRANS | ❌ | ✅ |
| Fluxo de Veículos Pesados | ❌ | DETRANPI | ✅ | ❌ |
| Comparativo Placas Corrigidas | ❌ | ❌ | ❌ | ✅ |
| Boletim de Medição | ❌ | ❌ | ❌ | ✅ |
| Infração Dia x Hora | ❌ | ❌ | ❌ | ✅ |
| Processamento Por Motivos | ❌ | ❌ | ❌ | ✅ |
| Processamento Por Motivos 2 | ❌ | ❌ | ❌ | ✅ |

### 4.3 Quantidade de BI por site:
| Site | Qtd BI | Observação |
|------|--------|------------|
| GOIÂNIA | **13** | Máximo — contrato mais completo |
| IBAMETRO | 9 | 3 de Cronotacógrafo |
| IMEPI | 9 | 3 de Cronotacógrafo |
| IMEQPB | 9 | 3 de Cronotacógrafo |
| IMETROPA | 9 | 3 de Cronotacógrafo |
| IPEMCE | 9 | 3 de Cronotacógrafo |
| IPEMPE | 9 | 3 de Cronotacógrafo |
| STRANS | 8 | Radares + Contratos |
| DERSE | 8 | Pesados + Contratos |
| DETRANPI | 8 | Pesados + Contratos |
| DETRANMA | **6** | Mínimo — mais simples |

---

## 5. Operações — Grupos de Equipamentos

### 5.1 Por tipo de contrato:

| Site | Grupos | Fabricantes |
|------|--------|-------------|
| **Metrologia** |
| IBAMETRO | FOCALLE, BLITZ | FOCALLE |
| IMEPI | AXBLITZ01, BLZ001 | AXION |
| IMEQPB | PB-series | AXION |
| IMETROPA | PA-series | AXION |
| IPEMCE | AXION(17), BLITZ(4) | AXION |
| IPEMPE | AXION(15), BLITZ(2) | AXION |
| **Trânsito** |
| STRANS | FOCALLE, VIZENTEC, FX EXCLUSIVA | FOCALLE, VIZENTEC |
| DETRANMA | FISCALIZAÇÃO ELETRÔNICA DE VELOCIDADE (60) | — |
| DETRANPI | BALANÇA, ENGEBRÁS, FISC.ELET.VEL, FOCALLE, OCR, TESTE, VELSIS, VIZENTEC | Múltiplos |
| GOIÂNIA | LOTE 01, LOTE 02 | PERKONS |
| **Rodovias** |
| DERSE | FOCALLE, PERKONS, LASERTECH, AXION, BLITZ, BALANÇA, PESAGEM ESTATÍSTICA | Múltiplos |

### 5.2 Colunas da tabela de Operações:

| Tipo | Colunas |
|------|---------|
| Metrologia | Fim Op., Dt. Aceite, Dt. Homol., Homol., Monit. |
| Trânsito/Rodovias | Grupo, Fabricante, Instalação, Início Op., Conexão, Infração, Passagem |

---

## 6. Versões do Sistema

| Versão | Sites | Lançamento aprox. |
|--------|-------|-------------------|
| v.1.0.0 | IBAMETRO, DERSE, IMEPI, IMEQPB, IMETROPA, IPEMCE, IPEMPE | Original |
| v.1.1.0 | DETRANMA | + Infrações Descartadas + Consulta Placas |
| v.1.1.1 | DETRANPI | Patch do v.1.1.0 |
| v.1.2.0 | STRANS, GOIÂNIA | + Bloqueio Operação, melhorias BI |

---

## 7. AxCross — Análise Detalhada

### 7.1 Menu Padrão (6 itens — todos os sites exceto SEFAZPI):
1. Dashboard
2. Veículos Monitorados (Veículos, Tipos Ocorrências, Alertas, Classificações, Importação)
3. Equipamentos (Equipamentos, Grupos, Áreas, Importação)
4. Monitoramento Online (Monitoramento, Mapa de Equipamentos)
5. Relatórios (Passagens, Mapeamento de Rotas, Rastreamento de Placas, Veículos Monitorados, Ocorrências/Alertas, PDF Gerados)
6. Configurações (Config Sistema, Usuários, Perfis, Permissões, Logs, Sincronização de Passagens)

### 7.2 SEFAZPI — Menu Exclusivo (7 itens):
Adiciona: **MDF-e** (/MDFE)

#### Módulo MDF-e — Painel Fiscal/Operacional:
- **Título:** "OCR + SEFAZ (MDF-e / NF-e)"
- **Sub-navegação própria:** Dashboard, Relatórios, Monitoramento
- **Métricas:**
  - Veículos Monitorados
  - MDF-e Obtidos
  - Alertas Ativos
  - Passagens
- **Gráficos:**
  - Alertas por Tipo (últimas 72h)
  - Fluxo de Passagens (por hora, 24h)
  - Origem das Cargas (distribuição por UF)
- **Tabelas:**
  - Alertas Recentes (Placa, Local, Data/Hora, Tipo, Ações)
  - Últimos MDF-e (Chave MDF-e, Placa, Origem, Destino, Data/Hora)

**Propósito:** Monitoramento fiscal de cargas — integra leitura OCR de placas com base de dados SEFAZ para verificar documentação fiscal (MDF-e/NF-e) dos veículos que transitam pelos pontos monitorados.

### 7.3 Volumetria dos sites:

| Site | Equip | Faixas | Veículos Mon. | Pass/dia | Perfil |
|------|-------|--------|--------------|----------|--------|
| DERSE | 171 | 334 | 422.467 | 45.987 | Grande (rodovias) |
| SEFAZPI | 77 | 169 | 0 | 62.764 | Grande (fiscal) |
| DETRANPI | 77 | 167 | 224 | 58.877 | Grande (trânsito) |
| DETRANMA | 69 | 146 | 400 | — | Médio |
| IMPERATRIZ | 21 | 41 | 14 | 49.702 | Pequeno (muitas passagens) |
| IPEMCE | 20 | 57 | 0 | — | Pequeno |
| IPEMPE | 17 | 44 | 67 | 0 | Pequeno (sem passagens) |
| IPEMMT | 0 | 0 | 0 | 0 | Provisionado (vazio) |

---

## 8. Configurações do Sistema — Abas (idênticas em todos AxHub)

| Aba | Função |
|-----|--------|
| Triagem | Config de triagem automática |
| Orgão | Dados do órgão contratante |
| Temporizadores | Timeouts e agendamentos |
| Medição | Parâmetros de medição |
| Autenticação | OIDC/Form, timeout sessão |
| Integrações | APIs externas (SINESP, etc.) |
| Certificados | Certificados digitais |
| Importação | Config de importação de dados |
| I.A | Configurações de IA/OCR |
| Power BI | Credenciais e URLs dos relatórios |

---

## 9. Regras de Negócio por Tipo de Contrato

### 9.1 Metrologia (IPEMs/IMEQs)

| Regra | Descrição |
|-------|-----------|
| Verificação metrológica | Equipamentos devem ter Dt. Aceite e Dt. Homologação |
| Cronotacógrafo | Módulo ativo para triagem e exportação |
| OCR como KPI | % de reconhecimento de placas é indicador contratual |
| Aferições | Controle de aferições por tipo (velocidade, avanço sinal, etc.) |
| Monitoramento passivo | Foco em passagens/fluxo, sem geração de infrações diretas |

### 9.2 Trânsito (DETRANs/STRANs)

| Regra | Descrição |
|-------|-----------|
| Geração de infrações | Equipamentos geram infrações de velocidade |
| Exportação de lotes | Lotes de infrações para processamento |
| Radares | Específico para equipamentos de radar |
| Bloqueio de Operação | Feature flag ativa em v.1.2.0 — bloqueia operação por período |
| Consulta de Placas | Busca direta de histórico por placa |
| Processamento de Contratos | BI exclusivo para acompanhamento contratual |

### 9.3 Rodovias (DERSE)

| Regra | Descrição |
|-------|-----------|
| Pesagem | Módulo de balança ativo (Liberar, Ticket, Reclassificar) |
| Veículos pesados | Relatório exclusivo de fluxo de pesados |
| Multi-fabricante | Diversos fabricantes num mesmo contrato |
| Pesagem estatística | Grupo especial para pesagem sem infração |

### 9.4 Fiscal (SEFAZPI)

| Regra | Descrição |
|-------|-----------|
| Integração SEFAZ | Consulta MDF-e/NF-e por placa |
| Monitoramento de cargas | Rastreia origem/destino de cargas |
| Alertas fiscais | Gera alertas quando veículo sem documentação fiscal |
| Distribuição por UF | Mapeia fluxo de cargas entre estados |

---

## 10. Dashboard — Componentes por Site

| Componente | Todos | Observação |
|------------|-------|------------|
| Triagem Mensal (gráfico barras) | ✅ | Total Imagens, Descartes, Processadas |
| Mapa de Equipamentos (Google Maps) | ✅ | Online/Offline -1h/Offline +1h |
| Painel Sinótico | ✅ | Lista eventos em tempo real |
| Status Equipamentos | ✅ | Contadores Online/Offline |
| Últimos Eventos | ✅ | Feed de atividades recentes |

---

## 11. Sites Inacessíveis — Informações Parciais

| Site | Motivo | Informações conhecidas |
|------|--------|----------------------|
| IPEMMT AxHub | Credencial inválida | Metrologia, deve ter menu 80 |
| ITPS AxHub | Credencial inválida | Metrologia (Sergipe) |
| SMTT AxHub | Cloudflare Turnstile | Trânsito municipal |
| ECONOMIA AxHub | OIDC diferente (economia.axion.ws) | Provavelmente fiscal |
| SETRANS AxCross | Timeout persistente | — |
| ibametro.axcross | DNS inexistente | Não existe |
| strans.axcross | DNS inexistente | Não existe |

---

## 12. Conclusões

### Diferenças Arquiteturais:
1. **O sistema é UM ÚNICO código-fonte** com feature flags que habilitam/desabilitam módulos
2. **Versão do sistema** determina features avançadas (v.1.2.0 = mais completo)
3. **Relatórios BI** são a principal diferenciação — configurados por contrato
4. **Grupos de equipamentos** refletem os parceiros/fabricantes de cada contrato

### Padrão de Evolução:
```
v.1.0.0 → Base (Metrologia, 80 menus)
v.1.1.0 → +Infrações Descartadas, +Consulta Placas (DETRANs)
v.1.1.1 → Patch
v.1.2.0 → +Bloqueio Operação, +BI expandido (Municípios)
```

### AxCross é uniforme (exceto SEFAZPI):
- Todos os sites têm exatamente as mesmas telas
- Diferença está apenas em **dados** (volumes, configurações)
- **SEFAZPI** é a única exceção com módulo MDF-e fiscal

### Recomendações:
1. Documentar feature flags como configuração por tenant/contrato
2. Padronizar quantidade de BI reports (Goiânia como referência máxima)
3. Documentar MDF-e como módulo opcional do AxCross
4. Criar documentação específica por tipo de contrato (Metrologia vs Trânsito vs Rodovias vs Fiscal)


---


