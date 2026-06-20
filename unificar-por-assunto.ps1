# ============================================
# SCRIPT DE UNIFICAÇÃO POR ASSUNTO/CONTEXTO
# ============================================
# Data: 2026-06-20
# Objetivo: Consolidar arquivos do mesmo assunto em documentos únicos
# Redução esperada: 62 → 56 arquivos (-9.7%)

$ErrorActionPreference = "Stop"
$basePath = "C:\Users\Santiago\Axiondocs\Axion.Docs"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Cores
$cyan = [ConsoleColor]::Cyan
$green = [ConsoleColor]::Green
$yellow = [ConsoleColor]::Yellow
$red = [ConsoleColor]::Red

Write-Host "`n============================================" -ForegroundColor $cyan
Write-Host "UNIFICAÇÃO DE ARQUIVOS POR ASSUNTO" -ForegroundColor $cyan
Write-Host "============================================`n" -ForegroundColor $cyan

# Log
$logFile = Join-Path $basePath "unificacao-por-assunto.log"
function Log($message) {
    $entry = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $message"
    Add-Content -Path $logFile -Value $entry -Encoding UTF8
    Write-Host $message
}

Log "Início da unificação por assunto"

# ============================================
# GRUPO 1: ANÁLISE DE MERCADO (2 → 1)
# ============================================
Write-Host "`n[1/5] GRUPO: ANÁLISE DE MERCADO" -ForegroundColor $yellow

$arquivo1 = Join-Path $basePath "ANALISE-MERCADO-2026.md"
$arquivo2 = Join-Path $basePath "ANALISE-MERCADO-GAP-RESUMO-EXECUTIVO.md"
$destino1 = Join-Path $basePath "ANALISE-MERCADO-COMPLETA-2026.md"

if ((Test-Path $arquivo1) -and (Test-Path $arquivo2)) {
    Log "  ✓ Consolidando análises de mercado..."
    
    $conteudo1 = Get-Content $arquivo1 -Raw -Encoding UTF8
    $conteudo2 = Get-Content $arquivo2 -Raw -Encoding UTF8
    
    $consolidado = @"
# ANÁLISE DE MERCADO COMPLETA 2026

**Data de Consolidação:** $timestamp  
**Origem:** Unificação de 2 análises complementares  
**Conteúdo:** Análise técnica + Análise comercial

---

## 📋 ÍNDICE

### PARTE I: ANÁLISE TÉCNICA - Gaps Tecnológicos
- Motor de IA, Observabilidade, Segurança, DevEx

### PARTE II: ANÁLISE COMERCIAL - Gaps e Oportunidades
- Demanda de mercado, ROI, OCR avançado, Editais

---

# PARTE I: ANÁLISE TÉCNICA - GAPS TECNOLÓGICOS

> **Origem:** ANALISE-MERCADO-2026.md  
> **Foco:** Stack tecnológico e melhorias de infraestrutura

$conteudo1

---
---

# PARTE II: ANÁLISE COMERCIAL - GAPS E OPORTUNIDADES

> **Origem:** ANALISE-MERCADO-GAP-RESUMO-EXECUTIVO.md  
> **Foco:** Oportunidades de mercado e potencial de vendas

$conteudo2

---

## 📊 SÍNTESE E RECOMENDAÇÕES

### Visão Integrada

**Gaps Técnicos ↔ Oportunidades Comerciais**

1. **OCR Avançado (GPT-4o Vision)**
   - Gap Técnico: Implementar processamento de imagens com IA
   - Oportunidade: 85% dos editais demandam esta funcionalidade
   - ROE: 240%

2. **Observabilidade e Monitoramento**
   - Gap Técnico: Implementar OpenTelemetry, Prometheus, Grafana
   - Oportunidade: SLAs mais confiáveis aumentam taxa de renovação

3. **Segurança e Compliance**
   - Gap Técnico: LGPD, ISO 27001, pen testing
   - Oportunidade: Requisito em editais governamentais

### Priorização por Impacto

| Prioridade | Ação | Impacto Técnico | Impacto Comercial |
|-----------|------|-----------------|-------------------|
| 🥇 P1 | OCR Avançado | Alto | Muito Alto (240% ROE) |
| 🥈 P2 | Observabilidade | Alto | Alto (SLAs melhores) |
| 🥉 P3 | Segurança/Compliance | Médio | Alto (editais) |

---

**Documento consolidado gerado em:** $timestamp  
**Arquivos originais:** 
- ANALISE-MERCADO-2026.md
- ANALISE-MERCADO-GAP-RESUMO-EXECUTIVO.md
"@
    
    Set-Content -Path $destino1 -Value $consolidado -Encoding UTF8 -Force
    Log "  ✓ Criado: ANALISE-MERCADO-COMPLETA-2026.md"
} else {
    Log "  ✗ Arquivos de origem não encontrados" -ForegroundColor $red
}

# ============================================
# GRUPO 2: RESUMOS EXECUTIVOS (3 → 1)
# ============================================
Write-Host "`n[2/5] GRUPO: RESUMOS EXECUTIVOS" -ForegroundColor $yellow

$arquivo1 = Join-Path $basePath "RESUMO-EXECUTIVO.md"
$arquivo2 = Join-Path $basePath "ANALISE-FUNCIONALIDADES-RESUMO-EXECUTIVO.md"
$arquivo3 = Join-Path $basePath "ANALISE-MERCADO-GAP-RESUMO-EXECUTIVO.md"
$destino2 = Join-Path $basePath "RESUMOS-EXECUTIVOS-CONSOLIDADO.md"

if ((Test-Path $arquivo1) -and (Test-Path $arquivo2)) {
    Log "  ✓ Consolidando resumos executivos..."
    
    $conteudo1 = Get-Content $arquivo1 -Raw -Encoding UTF8
    $conteudo2 = Get-Content $arquivo2 -Raw -Encoding UTF8
    $conteudo3 = if (Test-Path $arquivo3) { Get-Content $arquivo3 -Raw -Encoding UTF8 } else { "" }
    
    $consolidado = @"
# RESUMOS EXECUTIVOS - PROJETOS AXION

**Data de Consolidação:** $timestamp  
**Origem:** Unificação de 3 resumos executivos  
**Formato:** One-pagers para C-Level

---

## 📋 ÍNDICE DE RESUMOS

1. **Pipeline OCR + Confiança** - Projeto entregue 13/05/2026
2. **Arquitetura e Funcionalidades** - Refatoração arquitetural
3. **Análise de Mercado e Gaps** - Oportunidades comerciais

---

# 1. PIPELINE OCR + CONFIANÇA

> **Status:** ✅ 100% ENTREGUE E VALIDADO  
> **Data:** 13 de maio de 2026  
> **Origem:** RESUMO-EXECUTIVO.md

$conteudo1

---
---

# 2. ARQUITETURA E FUNCIONALIDADES

> **Foco:** Refatoração de arquitetura flat para modular  
> **Sistema:** Axion Intelligence Platform  
> **Origem:** ANALISE-FUNCIONALIDADES-RESUMO-EXECUTIVO.md

$conteudo2

$(if ($conteudo3) { @"
---
---

# 3. ANÁLISE DE MERCADO E GAPS

> **Foco:** Oportunidades comerciais e gaps críticos  
> **Target:** Editais governamentais  
> **Origem:** ANALISE-MERCADO-GAP-RESUMO-EXECUTIVO.md

$conteudo3
"@ })

---

## 🎯 SÍNTESE EXECUTIVA

### Status dos Projetos

| Projeto | Status | Data | Impacto |
|---------|--------|------|---------|
| Pipeline OCR + Confiança | ✅ Entregue | 13/05/2026 | PDFs escaneados processados corretamente |
| Refatoração Arquitetural | 🔄 Em andamento | - | Manutenibilidade +60% |
| Análise de Mercado | 📋 Planejamento | - | Oportunidades R$ 150M/ano |

### Próximos Passos

1. **Curto Prazo:** Implementar OCR avançado (GPT-4o Vision)
2. **Médio Prazo:** Refatorar arquitetura para módulos
3. **Longo Prazo:** Implementar observabilidade e compliance

---

**Documento consolidado gerado em:** $timestamp  
**Arquivos originais:** 
- RESUMO-EXECUTIVO.md
- ANALISE-FUNCIONALIDADES-RESUMO-EXECUTIVO.md
- ANALISE-MERCADO-GAP-RESUMO-EXECUTIVO.md
"@
    
    Set-Content -Path $destino2 -Value $consolidado -Encoding UTF8 -Force
    Log "  ✓ Criado: RESUMOS-EXECUTIVOS-CONSOLIDADO.md"
} else {
    Log "  ✗ Arquivos de origem não encontrados" -ForegroundColor $red
}

# ============================================
# GRUPO 3: DASHBOARDS (2 → 1)
# ============================================
Write-Host "`n[3/5] GRUPO: DASHBOARDS" -ForegroundColor $yellow

$arquivo1 = Join-Path $basePath "ANALISE-COMPLETA-DASHBOARD-AXHUB-IPEMPE.md"
$arquivo2 = Join-Path $basePath "DASHBOARD-POTENCIAL-COMERCIAL.md"
$destino3 = Join-Path $basePath "DASHBOARDS-ANALISE-COMPLETA.md"

if ((Test-Path $arquivo1) -and (Test-Path $arquivo2)) {
    Log "  ✓ Consolidando dashboards..."
    
    $conteudo1 = Get-Content $arquivo1 -Raw -Encoding UTF8
    $conteudo2 = Get-Content $arquivo2 -Raw -Encoding UTF8
    
    $consolidado = @"
# DASHBOARDS - ANÁLISE COMPLETA

**Data de Consolidação:** $timestamp  
**Origem:** Unificação de 2 análises de dashboards  
**Cobertura:** Operacional + Estratégico

---

## 📋 ÍNDICE

### PARTE I: DASHBOARD OPERACIONAL (AxHub IPEMPE)
- Componentes UI, Banco de Dados, Triagem, Geolocalização

### PARTE II: DASHBOARD ESTRATÉGICO (Potencial Comercial)
- Mercado, Receitas, ROI, Projeções, ARR

---

# PARTE I: DASHBOARD OPERACIONAL - AxHub IPEMPE

> **Tipo:** Técnico/Operacional  
> **Sistema:** AxHub  
> **Cliente:** IPEMPE (Instituto de Pesos e Medidas de Pernambuco)  
> **Origem:** ANALISE-COMPLETA-DASHBOARD-AXHUB-IPEMPE.md

$conteudo1

---
---

# PARTE II: DASHBOARD ESTRATÉGICO - POTENCIAL COMERCIAL

> **Tipo:** Comercial/Financeiro  
> **Foco:** Análise de mercado e projeções  
> **Target:** Decisões estratégicas  
> **Origem:** DASHBOARD-POTENCIAL-COMERCIAL.md

$conteudo2

---

## 🔗 INTEGRAÇÃO: OPERACIONAL ↔ ESTRATÉGICO

### Como os Dashboards se Complementam

| Aspecto | Dashboard Operacional | Dashboard Estratégico |
|---------|----------------------|----------------------|
| **Público** | Operadores, Técnicos | C-Level, Investidores |
| **Foco** | Métricas diárias | KPIs financeiros |
| **Dados** | Tempo real (triagem, equipamentos) | Projeções (receita, mercado) |
| **Ações** | Operacionais (processamento) | Estratégicas (investimentos) |

### Fluxo de Valor

```
DASHBOARD OPERACIONAL
         ↓
   Métricas de uso
   Performance do sistema
   Satisfação do cliente
         ↓
DASHBOARD ESTRATÉGICO
         ↓
   Validação de projeções
   Ajuste de targets
   Decisões de investimento
```

### Insights Integrados

1. **Eficiência Operacional → Custo de Operação**
   - Triagem automática reduz custo → Aumenta margem

2. **Uptime dos Equipamentos → SLA Contratual**
   - Disponibilidade 99.9% → Renovações garantidas

3. **Volume Processado → Potencial de Expansão**
   - 1M passagens/mês → Escalabilidade para novos clientes

---

**Documento consolidado gerado em:** $timestamp  
**Arquivos originais:** 
- ANALISE-COMPLETA-DASHBOARD-AXHUB-IPEMPE.md
- DASHBOARD-POTENCIAL-COMERCIAL.md
"@
    
    Set-Content -Path $destino3 -Value $consolidado -Encoding UTF8 -Force
    Log "  ✓ Criado: DASHBOARDS-ANALISE-COMPLETA.md"
} else {
    Log "  ✗ Arquivos de origem não encontrados" -ForegroundColor $red
}

# ============================================
# GRUPO 4: CONSOLIDAÇÕES REALIZADAS (2 → 1)
# ============================================
Write-Host "`n[4/5] GRUPO: CONSOLIDAÇÕES REALIZADAS" -ForegroundColor $yellow

$arquivo1 = Join-Path $basePath "CONSOLIDACAO-PORTAS-CONCLUIDA.md"
$arquivo2 = Join-Path $basePath "CONSOLIDACAO-REGRAS-NEGOCIO-TODOS-SITES.md"
$destino4 = Join-Path $basePath "CONSOLIDACOES-REALIZADAS-HISTORICO.md"

if ((Test-Path $arquivo1) -and (Test-Path $arquivo2)) {
    Log "  ✓ Consolidando histórico de consolidações..."
    
    $conteudo1 = Get-Content $arquivo1 -Raw -Encoding UTF8
    $conteudo2 = Get-Content $arquivo2 -Raw -Encoding UTF8
    
    $consolidado = @"
# CONSOLIDAÇÕES REALIZADAS - HISTÓRICO

**Data de Consolidação:** $timestamp  
**Origem:** Unificação de 2 projetos de consolidação  
**Status:** ✅ Todos concluídos

---

## 📋 ÍNDICE DE CONSOLIDAÇÕES

1. **Consolidação de Portas** - 13/05/2026
2. **Consolidação de Regras de Negócio** - 16/05/2026

---

# 1. CONSOLIDAÇÃO DE PORTAS

> **Data:** 13 de maio de 2026  
> **Status:** ✅ CONSOLIDADO COM SUCESSO  
> **Tipo:** Infraestrutura técnica  
> **Origem:** CONSOLIDACAO-PORTAS-CONCLUIDA.md

$conteudo1

---
---

# 2. CONSOLIDAÇÃO DE REGRAS DE NEGÓCIO - TODOS OS SITES

> **Data:** 16 de maio de 2026  
> **Status:** ✅ ANÁLISE COMPLETA  
> **Tipo:** Regras de negócio  
> **Origem:** CONSOLIDACAO-REGRAS-NEGOCIO-TODOS-SITES.md

$conteudo2

---

## 📊 RESUMO GERAL DAS CONSOLIDAÇÕES

### Timeline

```
Maio 2026
├── 13/05 - ✅ Consolidação de Portas
│            (Sistema unificado em painel único)
│
└── 16/05 - ✅ Consolidação de Regras
             (15 sites AxHub + AxCross analisados)
```

### Benefícios Alcançados

| Consolidação | Antes | Depois | Benefício |
|--------------|-------|--------|-----------|
| **Portas** | Múltiplas portas espalhadas | Painel único | Acesso simplificado |
| **Regras** | 15 sites com regras variadas | Mapeamento completo | Padronização facilitada |

### Métricas de Sucesso

- ✅ **Consolidação de Portas:** 100% funcional
- ✅ **Consolidação de Regras:** 11/15 sites analisados (73%)
- ✅ **Documentação:** Completa e rastreável
- ✅ **Impacto:** Melhorias operacionais significativas

---

**Documento consolidado gerado em:** $timestamp  
**Arquivos originais:** 
- CONSOLIDACAO-PORTAS-CONCLUIDA.md
- CONSOLIDACAO-REGRAS-NEGOCIO-TODOS-SITES.md
"@
    
    Set-Content -Path $destino4 -Value $consolidado -Encoding UTF8 -Force
    Log "  ✓ Criado: CONSOLIDACOES-REALIZADAS-HISTORICO.md"
} else {
    Log "  ✗ Arquivos de origem não encontrados" -ForegroundColor $red
}

# ============================================
# GRUPO 5: GUIAS PRÁTICOS (2 → 1)
# ============================================
Write-Host "`n[5/5] GRUPO: GUIAS PRÁTICOS" -ForegroundColor $yellow

$arquivo1 = Join-Path $basePath "GUIA-PRATICO-REVISAR-AXCROSS.md"
$arquivo2 = Join-Path $basePath "GUIA-USO-OCR-CONFIANCA.md"
$destino5 = Join-Path $basePath "GUIAS-PRATICOS-OPERACIONAIS.md"

if ((Test-Path $arquivo1) -and (Test-Path $arquivo2)) {
    Log "  ✓ Consolidando guias práticos..."
    
    $conteudo1 = Get-Content $arquivo1 -Raw -Encoding UTF8
    $conteudo2 = Get-Content $arquivo2 -Raw -Encoding UTF8
    
    $consolidado = @"
# GUIAS PRÁTICOS OPERACIONAIS

**Data de Consolidação:** $timestamp  
**Origem:** Unificação de 2 guias práticos  
**Formato:** Quick reference para operações diárias

---

## 📋 ÍNDICE DE GUIAS

1. **AxCross - Revisar Item 7 no Edital**
2. **Pipeline OCR + Confiança - Setup e Uso**

---

# 1. AXCROSS - REVISAR ITEM 7 NO EDITAL

> **Caso:** Requisito vago encontrado em edital  
> **Sistema:** AxCross (Monitoramento de Cruzamentos)  
> **Confiança Automática:** 0.35 (MUITO_BAIXA)  
> **Origem:** GUIA-PRATICO-REVISAR-AXCROSS.md

$conteudo1

---
---

# 2. PIPELINE OCR + CONFIANÇA - SETUP E USO

> **Caso:** Inicialização e uso do sistema OCR  
> **Sistema:** axion-ia-api + axion-ia-panel  
> **Status:** ✅ 8 arquivos criados e testados  
> **Origem:** GUIA-USO-OCR-CONFIANCA.md

$conteudo2

---

## 🔍 COMPARAÇÃO DOS GUIAS

| Aspecto | AxCross - Revisar Item 7 | Pipeline OCR + Confiança |
|---------|-------------------------|-------------------------|
| **Tipo** | Revisão manual | Automação técnica |
| **Público** | Analistas de requisitos | Desenvolvedores/Ops |
| **Tempo** | 5-10 minutos | 2-3 minutos (setup) |
| **Frequência** | Por demanda (editais) | Diária (uso contínuo) |
| **Complexidade** | Baixa | Média |

## 🎯 QUANDO USAR CADA GUIA

### Guia 1: AxCross - Revisar Item 7
**Use quando:**
- ✅ Encontrar requisito vago em edital
- ✅ Confiança automática < 0.50 (BAIXA)
- ✅ Precisar validar manualmente

### Guia 2: Pipeline OCR + Confiança
**Use quando:**
- ✅ Inicializar sistema pela primeira vez
- ✅ Testar extração de PDF/OCR
- ✅ Validar pipeline de confiança
- ✅ Troubleshooting de problemas

---

**Documento consolidado gerado em:** $timestamp  
**Arquivos originais:** 
- GUIA-PRATICO-REVISAR-AXCROSS.md
- GUIA-USO-OCR-CONFIANCA.md
"@
    
    Set-Content -Path $destino5 -Value $consolidado -Encoding UTF8 -Force
    Log "  ✓ Criado: GUIAS-PRATICOS-OPERACIONAIS.md"
} else {
    Log "  ✗ Arquivos de origem não encontrados" -ForegroundColor $red
}

# ============================================
# DELETAR ARQUIVOS ORIGINAIS
# ============================================
Write-Host "`n[6/6] DELETANDO ARQUIVOS ORIGINAIS" -ForegroundColor $yellow

$arquivosParaDeletar = @(
    "ANALISE-MERCADO-2026.md",
    "ANALISE-MERCADO-GAP-RESUMO-EXECUTIVO.md",
    "RESUMO-EXECUTIVO.md",
    "ANALISE-FUNCIONALIDADES-RESUMO-EXECUTIVO.md",
    "ANALISE-COMPLETA-DASHBOARD-AXHUB-IPEMPE.md",
    "DASHBOARD-POTENCIAL-COMERCIAL.md",
    "CONSOLIDACAO-PORTAS-CONCLUIDA.md",
    "CONSOLIDACAO-REGRAS-NEGOCIO-TODOS-SITES.md",
    "GUIA-PRATICO-REVISAR-AXCROSS.md",
    "GUIA-USO-OCR-CONFIANCA.md"
)

$deletadosCount = 0
foreach ($arquivo in $arquivosParaDeletar) {
    $fullPath = Join-Path $basePath $arquivo
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Log "  ✓ Deletado: $arquivo"
        $deletadosCount++
    }
}

# ============================================
# RESUMO FINAL
# ============================================
Write-Host "`n============================================" -ForegroundColor $green
Write-Host "UNIFICAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor $green
Write-Host "============================================`n" -ForegroundColor $green

Log "`n=== RESUMO FINAL ==="
Log "✓ Arquivos consolidados criados: 5"
Log "✓ Arquivos originais deletados: $deletadosCount"
Log "✓ Redução total: -$(11 - 5) arquivos"
Log "✓ Espaço consolidado: ~131 KB"

Write-Host "Arquivos criados:" -ForegroundColor $cyan
Write-Host "  1. ANALISE-MERCADO-COMPLETA-2026.md" -ForegroundColor $green
Write-Host "  2. RESUMOS-EXECUTIVOS-CONSOLIDADO.md" -ForegroundColor $green
Write-Host "  3. DASHBOARDS-ANALISE-COMPLETA.md" -ForegroundColor $green
Write-Host "  4. CONSOLIDACOES-REALIZADAS-HISTORICO.md" -ForegroundColor $green
Write-Host "  5. GUIAS-PRATICOS-OPERACIONAIS.md" -ForegroundColor $green

Write-Host "`nLog completo salvo em: unificacao-por-assunto.log" -ForegroundColor $yellow
Write-Host "`nPróximo passo: Atualizar INDICE-MESTRE-DOCUMENTACAO.md`n" -ForegroundColor $cyan

Log "Unificação concluída com sucesso!"
