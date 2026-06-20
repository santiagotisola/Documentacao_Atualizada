# ========================================
# SCRIPT DE CONSOLIDACAO DE DOCUMENTOS
# ========================================
# Consolida documentos duplicados em Axion.Docs

param(
    [switch]$DryRun
)

$basePath = "C:\Users\Santiago\Axiondocs\Axion.Docs"
$arquivoLog = Join-Path $basePath "consolidacao-documentos.log"

function Write-Log {
    param($Message, $Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor $Color
    Add-Content -Path $arquivoLog -Value $logMessage
}

function Consolidar-Arquivos {
    param(
        [string]$ArquivoDestino,
        [string[]]$ArquivosOrigem,
        [string]$Titulo
    )
    
    Write-Log "Consolidando: $ArquivoDestino" -Color Cyan
    
    if ($DryRun) {
        Write-Log "  [DRY RUN] Criaria $ArquivoDestino com $($ArquivosOrigem.Count) arquivos" -Color Yellow
        return
    }
    
    # Criar arquivo consolidado
    $conteudo = @"
# $Titulo

**Data de Consolidacao:** $(Get-Date -Format "yyyy-MM-dd")  
**Arquivos consolidados:** $($ArquivosOrigem.Count)

---

"@
    
    # Adicionar conteúdo de cada arquivo
    foreach ($arquivo in $ArquivosOrigem) {
        $caminhoCompleto = Join-Path $basePath $arquivo
        if (Test-Path $caminhoCompleto) {
            Write-Log "  + Adicionando: $arquivo" -Color Green
            $conteudoArquivo = Get-Content $caminhoCompleto -Raw -ErrorAction SilentlyContinue
            
            # Adicionar separador e conteúdo
            $conteudo += @"

---

## ORIGEM: $arquivo

$conteudoArquivo

"@
        } else {
            Write-Log "  ! Arquivo nao encontrado: $arquivo" -Color Yellow
        }
    }
    
    # Salvar arquivo consolidado
    $caminhoDestino = Join-Path $basePath $ArquivoDestino
    Set-Content -Path $caminhoDestino -Value $conteudo -Encoding UTF8
    Write-Log "  [OK] Criado: $ArquivoDestino" -Color Green
}

function Deletar-Arquivos {
    param([string[]]$Arquivos)
    
    if ($DryRun) {
        Write-Log "  [DRY RUN] Deletaria $($Arquivos.Count) arquivos" -Color Yellow
        return
    }
    
    foreach ($arquivo in $Arquivos) {
        $caminhoCompleto = Join-Path $basePath $arquivo
        if (Test-Path $caminhoCompleto) {
            Remove-Item $caminhoCompleto -Force
            Write-Log "  [DEL] $arquivo" -Color Red
        }
    }
}

# Iniciar log
Write-Log "========================================" -Color Cyan
Write-Log "CONSOLIDACAO DE DOCUMENTOS - INICIO" -Color Cyan
Write-Log "========================================" -Color Cyan

if ($DryRun) {
    Write-Log "MODO DRY RUN - Nenhuma alteracao sera feita" -Color Yellow
}

# ========================================
# GRUPO 1: PROTECAO AZURE
# ========================================
Write-Log "`n=== GRUPO 1: Protecao Azure ===" -Color Yellow

Consolidar-Arquivos `
    -ArquivoDestino "ANALISE-PROTECAO-IMAGENS-AZURE-COMPLETO.md" `
    -ArquivosOrigem @(
        "ANALISE-PROTECAO-IMAGENS-AZURE.md",
        "ANALISE-PROTECAO-IMAGENS-AZURE-COMPLETO.md"
    ) `
    -Titulo "PROTECAO DE IMAGENS AZURE - ANALISE COMPLETA"

Deletar-Arquivos @("ANALISE-PROTECAO-IMAGENS-AZURE.md")

# ========================================
# GRUPO 3: CONSOLIDACAO
# ========================================
Write-Log "`n=== GRUPO 3: Consolidacao ===" -Color Yellow

Consolidar-Arquivos `
    -ArquivoDestino "CONSOLIDACAO-COMPLETA-PROJETOS-MASTER.md" `
    -ArquivosOrigem @(
        "ANALISE-CONSOLIDACAO-TODOS-PROJETOS.md",
        "CONSOLIDACAO-EXECUTADA-TODOS-PROJETOS.md",
        "RESUMO-EXECUTIVO-CONSOLIDACAO-COMPLETA.md",
        "COMPARATIVO-ANTES-DEPOIS-MIGRACAO.md",
        "EXECUCAO-COMPLETA-MIGRACAO.md"
    ) `
    -Titulo "CONSOLIDACAO COMPLETA DE PROJETOS - DOCUMENTO MESTRE"

Deletar-Arquivos @(
    "ANALISE-CONSOLIDACAO-TODOS-PROJETOS.md",
    "CONSOLIDACAO-EXECUTADA-TODOS-PROJETOS.md",
    "RESUMO-EXECUTIVO-CONSOLIDACAO-COMPLETA.md",
    "COMPARATIVO-ANTES-DEPOIS-MIGRACAO.md",
    "EXECUCAO-COMPLETA-MIGRACAO.md"
)

# ========================================
# GRUPO 4: UNIFIED
# ========================================
Write-Log "`n=== GRUPO 4: Unified ===" -Color Yellow

# Documento 1: Guia Completo
Consolidar-Arquivos `
    -ArquivoDestino "UNIFIED-GUIA-COMPLETO.md" `
    -ArquivosOrigem @(
        "GUIA-RAPIDO-UNIFIED.md",
        "NAVEGACAO-VISUAL-UNIFICACAO.md",
        "RESUMO-ENTREGA-UNIFICACAO.md"
    ) `
    -Titulo "UNIFIED - GUIA COMPLETO DE USO"

# Documento 2: Arquitetura
Consolidar-Arquivos `
    -ArquivoDestino "UNIFIED-ARQUITETURA-PLANEJAMENTO.md" `
    -ArquivosOrigem @(
        "PLANO-ORGANIZACIONAL-UNIFICACAO.md",
        "DIAGRAMA-ARQUITETURA-REESTRUTURACAO.md",
        "MAPEAMENTO-FUNCIONALIDADES-SISTEMA.md"
    ) `
    -Titulo "UNIFIED - ARQUITETURA E PLANEJAMENTO"

# Documento 3: README
Consolidar-Arquivos `
    -ArquivoDestino "UNIFIED-README.md" `
    -ArquivosOrigem @(
        "INDICE-MESTRE-UNIFIED.md",
        "README-UNIFICACAO.md",
        "CHECKLIST-REESTRUTURACAO.md"
    ) `
    -Titulo "UNIFIED - README E INDICE MESTRE"

Deletar-Arquivos @(
    "GUIA-RAPIDO-UNIFIED.md",
    "NAVEGACAO-VISUAL-UNIFICACAO.md",
    "RESUMO-ENTREGA-UNIFICACAO.md",
    "PLANO-ORGANIZACIONAL-UNIFICACAO.md",
    "DIAGRAMA-ARQUITETURA-REESTRUTURACAO.md",
    "MAPEAMENTO-FUNCIONALIDADES-SISTEMA.md",
    "INDICE-MESTRE-UNIFIED.md",
    "README-UNIFICACAO.md",
    "CHECKLIST-REESTRUTURACAO.md"
)

# ========================================
# GRUPO 5: HELPDESK
# ========================================
Write-Log "`n=== GRUPO 5: HelpDesk ===" -Color Yellow

Consolidar-Arquivos `
    -ArquivoDestino "HELPDESK-PROJETO-COMPLETO.md" `
    -ArquivosOrigem @(
        "CONSOLIDACAO-PROJETO-HELPDESK-COMPLETA.md",
        "GUIA-IMPLEMENTACAO-ODOO-HELPDESK.md",
        "MATRIZ-DECISAO-HELPDESK-2026.md",
        "PROJETO-HELPDESK-UNIFICADO.md",
        "PROMPT-ANALISE-HELPDESK.md",
        "RESUMO-EXECUTIVO-HELPDESK-2026.md"
    ) `
    -Titulo "HELPDESK - PROJETO COMPLETO"

Deletar-Arquivos @(
    "CONSOLIDACAO-PROJETO-HELPDESK-COMPLETA.md",
    "GUIA-IMPLEMENTACAO-ODOO-HELPDESK.md",
    "MATRIZ-DECISAO-HELPDESK-2026.md",
    "PROJETO-HELPDESK-UNIFICADO.md",
    "PROMPT-ANALISE-HELPDESK.md",
    "RESUMO-EXECUTIVO-HELPDESK-2026.md"
)

# ========================================
# GRUPO 6: VALIDACAO VISUAL
# ========================================
Write-Log "`n=== GRUPO 6: Validacao Visual ===" -Color Yellow

Consolidar-Arquivos `
    -ArquivoDestino "VALIDACAO-VISUAL-GUIA-COMPLETO.md" `
    -ArquivosOrigem @(
        "CONFIGURACAO-VALIDACAO-VISUAL.md",
        "RELATORIO-VALIDACAO-VISUAL-COMPLETA.md",
        "VALIDACAO-VISUAL-COMPLETA-GUIA.md",
        "GERENCIADOR-VALIDACAO-SISTEMAS-GUIA-COMPLETO.md"
    ) `
    -Titulo "VALIDACAO VISUAL - GUIA COMPLETO"

Deletar-Arquivos @(
    "CONFIGURACAO-VALIDACAO-VISUAL.md",
    "RELATORIO-VALIDACAO-VISUAL-COMPLETA.md",
    "VALIDACAO-VISUAL-COMPLETA-GUIA.md",
    "GERENCIADOR-VALIDACAO-SISTEMAS-GUIA-COMPLETO.md"
)

# ========================================
# GRUPO 7: TARJA/PORTARIA
# ========================================
Write-Log "`n=== GRUPO 7: Tarja/Portaria ===" -Color Yellow

# Documento 1: Analises
Consolidar-Arquivos `
    -ArquivoDestino "TARJA-PORTARIA-ANALISES-INVESTIGACOES.md" `
    -ArquivosOrigem @(
        "ANALISE-CHAMADO-100460372-PORTARIA-NAO-METROLOGICA.md",
        "ANALISE-COMPLETA-LOCAIS-PORTARIA-TARJA.md",
        "ANALISE-ERRO-PORTARIA-492-TARJA-VSIS-OCR.md",
        "PLANO-INVESTIGACAO-WEB-PORTARIA-492.md",
        "RESULTADO-INVESTIGACAO-WEB-PORTARIA-492.md"
    ) `
    -Titulo "TARJA E PORTARIA - ANALISES E INVESTIGACOES"

# Documento 2: Guia Tecnico
Consolidar-Arquivos `
    -ArquivoDestino "TARJA-PORTARIA-GUIA-TECNICO-COMPLETO.md" `
    -ArquivosOrigem @(
        "ANALISE-ORIGEM-DADOS-TEMPLATE-TARJA.md",
        "DIAGRAMA-FLUXO-DADOS-TARJA.md",
        "GUIA-CORRECAO-ERRO-PORTARIA-492-2012.md",
        "GUIA-PRATICO-ATUALIZAR-DADOS-TARJA-INFRACAO.md",
        "INTERPRETACAO-COMPLETA-CONFIGURACAO-PORTARIA-FAIXAS.md",
        "MAPEAMENTO-COMPLETO-VARIAVEIS-TARJA-AXION.md",
        "RESUMO-EXECUTIVO-VALIDACAO-TARJA.md",
        "VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md"
    ) `
    -Titulo "TARJA E PORTARIA - GUIA TECNICO COMPLETO"

Deletar-Arquivos @(
    "ANALISE-CHAMADO-100460372-PORTARIA-NAO-METROLOGICA.md",
    "ANALISE-COMPLETA-LOCAIS-PORTARIA-TARJA.md",
    "ANALISE-ERRO-PORTARIA-492-TARJA-VSIS-OCR.md",
    "PLANO-INVESTIGACAO-WEB-PORTARIA-492.md",
    "RESULTADO-INVESTIGACAO-WEB-PORTARIA-492.md",
    "ANALISE-ORIGEM-DADOS-TEMPLATE-TARJA.md",
    "DIAGRAMA-FLUXO-DADOS-TARJA.md",
    "GUIA-CORRECAO-ERRO-PORTARIA-492-2012.md",
    "GUIA-PRATICO-ATUALIZAR-DADOS-TARJA-INFRACAO.md",
    "INTERPRETACAO-COMPLETA-CONFIGURACAO-PORTARIA-FAIXAS.md",
    "MAPEAMENTO-COMPLETO-VARIAVEIS-TARJA-AXION.md",
    "RESUMO-EXECUTIVO-VALIDACAO-TARJA.md",
    "VALIDACAO-COMPLETA-TODOS-CAMPOS-TARJA.md"
)

# ========================================
# GRUPO 8: MEDICAO
# ========================================
Write-Log "`n=== GRUPO 8: Medicao/Goiania ===" -Color Yellow

# Documento 1: Analises
Consolidar-Arquivos `
    -ArquivoDestino "MEDICAO-ANALISES-DIAGNOSTICOS.md" `
    -ArquivosOrigem @(
        "ANALISE-MEDICAO-FAIXAS-VALORES-ZERADOS-GOIANIA.md",
        "COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md",
        "ENTREGA-ANALISE-DADOS-REAIS-SISTEMA.md",
        "RELATORIO-ANALISE-MEDICAO-GOIANIA-AXION-IA.md",
        "RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md",
        "ROTEIRO-DIAGNOSTICO-COMPARATIVO-MEDICAO-GOIANIA.md"
    ) `
    -Titulo "MEDICAO - ANALISES E DIAGNOSTICOS"

# Documento 2: Guia Tecnico
Consolidar-Arquivos `
    -ArquivoDestino "MEDICAO-GUIA-TECNICO-COMPLETO.md" `
    -ArquivosOrigem @(
        "CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md",
        "GUIA-OPERACIONAL-RAPIDO-MEDICAO.md",
        "GUIA-USO-FERRAMENTAS-DIAGNOSTICO.md",
        "GUIA-VALIDACAO-CONTRATOS-FAIXAS.md",
        "INDICE-DOCUMENTACAO-MEDICAO.md",
        "INSTRUCOES-EXECUCAO-SCRIPT-SQL.md",
        "INTEGRACAO-DIAGNOSTICO-MEDICAO.md",
        "RELATORIO-ABNT-CICLO-MEDICAO-AXHUB.md",
        "RESUMO-EXECUTIVO-AXION-IA-MEDICAO.md"
    ) `
    -Titulo "MEDICAO - GUIA TECNICO COMPLETO"

Deletar-Arquivos @(
    "ANALISE-MEDICAO-FAIXAS-VALORES-ZERADOS-GOIANIA.md",
    "COMPARACAO-REGRAS-VS-SISTEMA-MEDICAO.md",
    "ENTREGA-ANALISE-DADOS-REAIS-SISTEMA.md",
    "RELATORIO-ANALISE-MEDICAO-GOIANIA-AXION-IA.md",
    "RESPOSTA-CHAMADO-100676992-DADOS-ZERADOS.md",
    "ROTEIRO-DIAGNOSTICO-COMPARATIVO-MEDICAO-GOIANIA.md",
    "CICLO-COMPLETO-CADASTRO-MEDICAO-AXHUB.md",
    "GUIA-OPERACIONAL-RAPIDO-MEDICAO.md",
    "GUIA-USO-FERRAMENTAS-DIAGNOSTICO.md",
    "GUIA-VALIDACAO-CONTRATOS-FAIXAS.md",
    "INDICE-DOCUMENTACAO-MEDICAO.md",
    "INSTRUCOES-EXECUCAO-SCRIPT-SQL.md",
    "INTEGRACAO-DIAGNOSTICO-MEDICAO.md",
    "RELATORIO-ABNT-CICLO-MEDICAO-AXHUB.md",
    "RESUMO-EXECUTIVO-AXION-IA-MEDICAO.md"
)

# ========================================
# FINALIZACAO
# ========================================
Write-Log "`n========================================" -Color Cyan
Write-Log "CONSOLIDACAO CONCLUIDA" -Color Green
Write-Log "========================================" -Color Cyan
Write-Log "Verifique o log em: $arquivoLog" -Color Yellow
