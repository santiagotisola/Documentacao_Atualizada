# ════════════════════════════════════════════════════════════════════════════════
# Script: Análise e Exportação da Documentação Helpdesk 2026
# Versão: 1.0
# Data: 14/06/2026
# Autor: Santiago Neto + GitHub Copilot
# ════════════════════════════════════════════════════════════════════════════════

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("Analisar", "Exportar", "Validar", "Estatisticas", "GerarPDF", "Completo")]
    [string]$Acao = "Completo",
    
    [Parameter(Mandatory=$false)]
    [string]$Destino = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$ComZip,
    
    [Parameter(Mandatory=$false)]
    [switch]$AbrirRelatorio
)

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURAÇÕES
# ═══════════════════════════════════════════════════════════════════════════════

$arquivosDocumentacao = @{
    "Principal" = "CONSOLIDACAO-PROJETO-HELPDESK-COMPLETA.md"
    "Resumo" = "RESUMO-EXECUTIVO-HELPDESK-2026.md"
    "Matriz" = "MATRIZ-DECISAO-HELPDESK-2026.md"
    "Guia" = "GUIA-IMPLEMENTACAO-ODOO-HELPDESK.md"
}

$plataformas = @("Odoo", "Axion IA", "Jitbit", "Milvus", "Zendesk")

# ═══════════════════════════════════════════════════════════════════════════════
# FUNÇÕES
# ═══════════════════════════════════════════════════════════════════════════════

function Write-Header {
    param([string]$Titulo)
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $($Titulo.PadRight(65))║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Section {
    param([string]$Titulo)
    Write-Host ""
    Write-Host "━━━ $Titulo " -NoNewline -ForegroundColor Yellow
    Write-Host ("━" * (60 - $Titulo.Length)) -ForegroundColor Yellow
}

function Test-ArquivoExiste {
    param([string]$Arquivo)
    
    if (Test-Path $Arquivo) {
        $tamanho = (Get-Item $Arquivo).Length
        $tamanhoKB = [math]::Round($tamanho / 1KB, 2)
        Write-Host "✓ " -NoNewline -ForegroundColor Green
        Write-Host "$Arquivo " -NoNewline -ForegroundColor White
        Write-Host "($tamanhoKB KB)" -ForegroundColor DarkGray
        return $true
    } else {
        Write-Host "✗ " -NoNewline -ForegroundColor Red
        Write-Host "$Arquivo " -NoNewline -ForegroundColor White
        Write-Host "(NÃO ENCONTRADO)" -ForegroundColor Red
        return $false
    }
}

function Get-EstatisticasArquivo {
    param([string]$Arquivo)
    
    if (-not (Test-Path $Arquivo)) {
        return $null
    }
    
    $conteudo = Get-Content $Arquivo -Raw
    
    return @{
        Linhas = ($conteudo -split "`n").Count
        Palavras = ($conteudo -split "\s+").Count
        Caracteres = $conteudo.Length
        Tamanho = (Get-Item $Arquivo).Length
        Secoes = ([regex]::Matches($conteudo, "^#{1,3}\s+", [System.Text.RegularExpressions.RegexOptions]::Multiline)).Count
        Tabelas = ([regex]::Matches($conteudo, "^\|.*\|$", [System.Text.RegularExpressions.RegexOptions]::Multiline)).Count / 3
        Links = ([regex]::Matches($conteudo, "\[.*?\]\(.*?\)")).Count
        CodeBlocks = ([regex]::Matches($conteudo, "```")).Count / 2
    }
}

function Get-PlataformasMencionadas {
    param([string]$Arquivo)
    
    if (-not (Test-Path $Arquivo)) {
        return @{}
    }
    
    $conteudo = Get-Content $Arquivo -Raw
    $mencoes = @{}
    
    foreach ($plataforma in $plataformas) {
        $count = ([regex]::Matches($conteudo, [regex]::Escape($plataforma), [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)).Count
        $mencoes[$plataforma] = $count
    }
    
    return $mencoes
}

function Show-Analise {
    Write-Header "ANÁLISE DA DOCUMENTAÇÃO HELPDESK 2026"
    
    Write-Section "Verificação de Arquivos"
    
    $arquivosValidos = 0
    $arquivosTotal = $arquivosDocumentacao.Count
    
    foreach ($item in $arquivosDocumentacao.GetEnumerator()) {
        if (Test-ArquivoExiste $item.Value) {
            $arquivosValidos++
        }
    }
    
    Write-Host ""
    Write-Host "Status: " -NoNewline
    if ($arquivosValidos -eq $arquivosTotal) {
        Write-Host "✓ TODOS OS ARQUIVOS ENCONTRADOS" -ForegroundColor Green
    } else {
        Write-Host "⚠ FALTAM $($arquivosTotal - $arquivosValidos) ARQUIVO(S)" -ForegroundColor Yellow
    }
    
    # ═══════════════════════════════════════════════════════════════════════════
    Write-Section "Estatísticas por Documento"
    
    $estatisticasGerais = @{
        TotalLinhas = 0
        TotalPalavras = 0
        TotalCaracteres = 0
        TotalTabelas = 0
        TotalLinks = 0
        TotalCodeBlocks = 0
    }
    
    foreach ($item in $arquivosDocumentacao.GetEnumerator()) {
        if (Test-Path $item.Value) {
            $stats = Get-EstatisticasArquivo $item.Value
            
            Write-Host ""
            Write-Host "📄 $($item.Key): " -NoNewline -ForegroundColor Cyan
            Write-Host $item.Value -ForegroundColor White
            Write-Host "   Linhas: " -NoNewline -ForegroundColor DarkGray
            Write-Host $stats.Linhas -NoNewline
            Write-Host " | Palavras: " -NoNewline -ForegroundColor DarkGray
            Write-Host $stats.Palavras -NoNewline
            Write-Host " | Seções: " -NoNewline -ForegroundColor DarkGray
            Write-Host $stats.Secoes
            Write-Host "   Tabelas: " -NoNewline -ForegroundColor DarkGray
            Write-Host $stats.Tabelas -NoNewline
            Write-Host " | Links: " -NoNewline -ForegroundColor DarkGray
            Write-Host $stats.Links -NoNewline
            Write-Host " | Code Blocks: " -NoNewline -ForegroundColor DarkGray
            Write-Host $stats.CodeBlocks
            
            $estatisticasGerais.TotalLinhas += $stats.Linhas
            $estatisticasGerais.TotalPalavras += $stats.Palavras
            $estatisticasGerais.TotalCaracteres += $stats.Caracteres
            $estatisticasGerais.TotalTabelas += $stats.Tabelas
            $estatisticasGerais.TotalLinks += $stats.Links
            $estatisticasGerais.TotalCodeBlocks += $stats.CodeBlocks
        }
    }
    
    # ═══════════════════════════════════════════════════════════════════════════
    Write-Section "Totais Consolidados"
    Write-Host ""
    Write-Host "📊 Total de linhas: " -NoNewline -ForegroundColor Cyan
    Write-Host "$($estatisticasGerais.TotalLinhas.ToString('N0'))" -ForegroundColor White
    Write-Host "📝 Total de palavras: " -NoNewline -ForegroundColor Cyan
    Write-Host "$($estatisticasGerais.TotalPalavras.ToString('N0'))" -ForegroundColor White
    Write-Host "📋 Total de tabelas: " -NoNewline -ForegroundColor Cyan
    Write-Host "$([math]::Round($estatisticasGerais.TotalTabelas))" -ForegroundColor White
    Write-Host "🔗 Total de links: " -NoNewline -ForegroundColor Cyan
    Write-Host "$($estatisticasGerais.TotalLinks)" -ForegroundColor White
    Write-Host "💻 Total de code blocks: " -NoNewline -ForegroundColor Cyan
    Write-Host "$($estatisticasGerais.TotalCodeBlocks)" -ForegroundColor White
    
    $tempoLeitura = [math]::Round($estatisticasGerais.TotalPalavras / 200)
    Write-Host "⏱️  Tempo de leitura estimado: " -NoNewline -ForegroundColor Cyan
    Write-Host "$tempoLeitura minutos" -ForegroundColor White
    
    # ═══════════════════════════════════════════════════════════════════════════
    Write-Section "Análise de Plataformas Mencionadas"
    Write-Host ""
    
    $mencoesPorPlataforma = @{}
    foreach ($plataforma in $plataformas) {
        $mencoesPorPlataforma[$plataforma] = 0
    }
    
    foreach ($item in $arquivosDocumentacao.GetEnumerator()) {
        if (Test-Path $item.Value) {
            $mencoes = Get-PlataformasMencionadas $item.Value
            foreach ($plat in $mencoes.Keys) {
                $mencoesPorPlataforma[$plat] += $mencoes[$plat]
            }
        }
    }
    
    $mencoesOrdenadas = $mencoesPorPlataforma.GetEnumerator() | Sort-Object Value -Descending
    
    foreach ($mencao in $mencoesOrdenadas) {
        $barra = "█" * ([math]::Min($mencao.Value / 10, 50))
        Write-Host "$($mencao.Key.PadRight(15)): " -NoNewline -ForegroundColor Yellow
        Write-Host $barra -NoNewline -ForegroundColor Green
        Write-Host " $($mencao.Value) menções" -ForegroundColor DarkGray
    }
    
    # ═══════════════════════════════════════════════════════════════════════════
    Write-Section "Recomendação Identificada"
    Write-Host ""
    
    $vencedor = $mencoesOrdenadas | Select-Object -First 1
    Write-Host "🏆 Plataforma mais citada: " -NoNewline -ForegroundColor Cyan
    Write-Host $vencedor.Name -ForegroundColor Green
    Write-Host ""
    
    # Verificar se Odoo está presente
    if ($mencoesPorPlataforma["Odoo"] -gt 0) {
        Write-Host "✅ Odoo detectado na análise" -ForegroundColor Green
        Write-Host "   • Open Source" -ForegroundColor DarkGray
        Write-Host "   • R$0 (grátis)" -ForegroundColor DarkGray
        Write-Host "   • 50.000+ apps" -ForegroundColor DarkGray
    }
    
    Write-Host ""
}

function Show-Validacao {
    Write-Header "VALIDAÇÃO DE CONTEÚDO"
    
    $erros = 0
    $avisos = 0
    
    Write-Section "Checklist de Qualidade"
    Write-Host ""
    
    # Verificar se todos os arquivos existem
    foreach ($item in $arquivosDocumentacao.GetEnumerator()) {
        if (-not (Test-Path $item.Value)) {
            Write-Host "✗ Arquivo faltando: $($item.Value)" -ForegroundColor Red
            $erros++
        } else {
            Write-Host "✓ $($item.Key) encontrado" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    
    # Verificar conteúdo mínimo
    Write-Section "Validação de Conteúdo Mínimo"
    Write-Host ""
    
    $arquivoPrincipal = $arquivosDocumentacao["Principal"]
    if (Test-Path $arquivoPrincipal) {
        $conteudo = Get-Content $arquivoPrincipal -Raw
        
        # Verificar se tem PARTE H
        if ($conteudo -match "PARTE H") {
            Write-Host "✓ PARTE H encontrada no documento principal" -ForegroundColor Green
        } else {
            Write-Host "✗ PARTE H NÃO encontrada" -ForegroundColor Red
            $erros++
        }
        
        # Verificar se menciona as 5 plataformas
        $plataformasFaltando = @()
        foreach ($plat in $plataformas) {
            if ($conteudo -notmatch [regex]::Escape($plat)) {
                $plataformasFaltando += $plat
            }
        }
        
        if ($plataformasFaltando.Count -eq 0) {
            Write-Host "✓ Todas as 5 plataformas mencionadas" -ForegroundColor Green
        } else {
            Write-Host "⚠ Plataformas não encontradas: $($plataformasFaltando -join ', ')" -ForegroundColor Yellow
            $avisos++
        }
        
        # Verificar tendências 2026
        if ($conteudo -match "2026|Tendências|Gartner") {
            Write-Host "✓ Tendências 2026 presentes" -ForegroundColor Green
        } else {
            Write-Host "⚠ Referências a 2026 limitadas" -ForegroundColor Yellow
            $avisos++
        }
    }
    
    Write-Host ""
    Write-Section "Resumo da Validação"
    Write-Host ""
    
    if ($erros -eq 0 -and $avisos -eq 0) {
        Write-Host "✅ VALIDAÇÃO COMPLETA - SEM PROBLEMAS" -ForegroundColor Green
    } elseif ($erros -eq 0) {
        Write-Host "⚠ VALIDAÇÃO OK - $avisos AVISO(S)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ VALIDAÇÃO FALHOU - $erros ERRO(S), $avisos AVISO(S)" -ForegroundColor Red
    }
    
    Write-Host ""
}

function Export-Documentacao {
    param([string]$CaminhoDestino)
    
    Write-Header "EXPORTAÇÃO DE DOCUMENTAÇÃO"
    
    if ([string]::IsNullOrEmpty($CaminhoDestino)) {
        $CaminhoDestino = Read-Host "Digite o caminho de destino"
    }
    
    # Criar pasta destino
    if (-not (Test-Path $CaminhoDestino)) {
        New-Item -ItemType Directory -Path $CaminhoDestino -Force | Out-Null
        Write-Host "✓ Pasta criada: $CaminhoDestino" -ForegroundColor Green
    }
    
    Write-Section "Copiando Arquivos"
    Write-Host ""
    
    $copiados = 0
    $tamanhoTotal = 0
    
    foreach ($item in $arquivosDocumentacao.GetEnumerator()) {
        if (Test-Path $item.Value) {
            $origem = $item.Value
            $destino = Join-Path $CaminhoDestino $item.Value
            
            try {
                Copy-Item $origem $destino -Force
                $tamanho = (Get-Item $origem).Length
                $tamanhoTotal += $tamanho
                Write-Host "✓ Copiado: " -NoNewline -ForegroundColor Green
                Write-Host "$($item.Value) " -NoNewline -ForegroundColor White
                Write-Host "($([math]::Round($tamanho/1KB, 2)) KB)" -ForegroundColor DarkGray
                $copiados++
            } catch {
                Write-Host "✗ Erro: $($item.Value)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "📦 Arquivos copiados: $copiados" -ForegroundColor Green
    Write-Host "💾 Tamanho total: $([math]::Round($tamanhoTotal/1KB, 2)) KB" -ForegroundColor Cyan
    Write-Host "📁 Destino: $CaminhoDestino" -ForegroundColor Yellow
    
    # Criar ZIP se solicitado
    if ($ComZip) {
        Write-Host ""
        Write-Section "Criando Arquivo ZIP"
        Write-Host ""
        
        $zipPath = Join-Path $CaminhoDestino "Analise-Helpdesk-2026.zip"
        $arquivosParaZip = Get-ChildItem -Path $CaminhoDestino -Filter "*.md" | Select-Object -ExpandProperty FullName
        
        try {
            Compress-Archive -Path $arquivosParaZip -DestinationPath $zipPath -Force
            $zipSize = (Get-Item $zipPath).Length
            Write-Host "✓ ZIP criado: " -NoNewline -ForegroundColor Green
            Write-Host "Analise-Helpdesk-2026.zip " -NoNewline -ForegroundColor White
            Write-Host "($([math]::Round($zipSize/1MB, 2)) MB)" -ForegroundColor DarkGray
        } catch {
            Write-Host "✗ Erro ao criar ZIP: $_" -ForegroundColor Red
        }
    }
    
    Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Estatisticas {
    Write-Header "ESTATÍSTICAS DETALHADAS"
    
    Write-Section "Comparativo de Documentos"
    Write-Host ""
    
    $dadosComparacao = @()
    
    foreach ($item in $arquivosDocumentacao.GetEnumerator()) {
        if (Test-Path $item.Value) {
            $stats = Get-EstatisticasArquivo $item.Value
            $dadosComparacao += [PSCustomObject]@{
                Documento = $item.Key
                Linhas = $stats.Linhas
                Palavras = $stats.Palavras
                Tabelas = [math]::Round($stats.Tabelas)
                Links = $stats.Links
                'Code Blocks' = $stats.CodeBlocks
                'Tamanho (KB)' = [math]::Round($stats.Tamanho / 1KB, 2)
            }
        }
    }
    
    $dadosComparacao | Format-Table -AutoSize | Out-String | Write-Host
    
    Write-Section "Densidade de Informação"
    Write-Host ""
    
    foreach ($item in $arquivosDocumentacao.GetEnumerator()) {
        if (Test-Path $item.Value) {
            $stats = Get-EstatisticasArquivo $item.Value
            $densidade = [math]::Round($stats.Palavras / $stats.Linhas, 1)
            
            Write-Host "$($item.Key.PadRight(20)): " -NoNewline -ForegroundColor Yellow
            Write-Host "$densidade palavras/linha" -ForegroundColor White
        }
    }
    
    Write-Host ""
}

function New-RelatorioHTML {
    Write-Header "GERANDO RELATÓRIO HTML"
    
    $html = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análise Helpdesk 2026 - Relatório</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: #333;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 40px; 
            text-align: center; 
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .content { padding: 40px; }
        .section { margin-bottom: 40px; }
        .section h2 { 
            color: #667eea; 
            border-bottom: 3px solid #667eea; 
            padding-bottom: 10px; 
            margin-bottom: 20px; 
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin: 20px 0; 
        }
        .stat-card { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 25px; 
            border-radius: 8px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-card h3 { font-size: 2.5em; margin-bottom: 10px; }
        .stat-card p { font-size: 1.1em; opacity: 0.9; }
        .platform-item { 
            background: #f8f9fa; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 8px; 
            border-left: 4px solid #667eea;
        }
        .platform-item strong { color: #667eea; font-size: 1.2em; }
        .recommendation { 
            background: #d4edda; 
            border: 2px solid #28a745; 
            border-radius: 8px; 
            padding: 25px; 
            margin: 20px 0; 
        }
        .recommendation h3 { color: #155724; margin-bottom: 15px; }
        .recommendation ul { list-style: none; padding-left: 0; }
        .recommendation li { 
            padding: 8px 0; 
            padding-left: 30px; 
            position: relative; 
        }
        .recommendation li:before { 
            content: "✓"; 
            position: absolute; 
            left: 0; 
            color: #28a745; 
            font-weight: bold; 
            font-size: 1.2em; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #ddd; 
        }
        th { 
            background: #667eea; 
            color: white; 
            font-weight: bold; 
        }
        tr:hover { background: #f8f9fa; }
        .footer { 
            background: #2d3436; 
            color: white; 
            text-align: center; 
            padding: 20px; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Análise Comparativa Helpdesk 2026</h1>
            <p>Relatório Completo de Análise e Recomendações</p>
            <p style="font-size: 0.9em; margin-top: 10px;">Gerado em: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📈 Estatísticas Gerais</h2>
                <div class="stats-grid">
"@
    
    # Adicionar estatísticas
    $totalLinhas = 0
    $totalPalavras = 0
    $totalTabelas = 0
    
    foreach ($item in $arquivosDocumentacao.GetEnumerator()) {
        if (Test-Path $item.Value) {
            $stats = Get-EstatisticasArquivo $item.Value
            $totalLinhas += $stats.Linhas
            $totalPalavras += $stats.Palavras
            $totalTabelas += $stats.Tabelas
        }
    }
    
    $html += @"
                    <div class="stat-card">
                        <h3>$($totalLinhas.ToString('N0'))</h3>
                        <p>Linhas Totais</p>
                    </div>
                    <div class="stat-card">
                        <h3>$($totalPalavras.ToString('N0'))</h3>
                        <p>Palavras</p>
                    </div>
                    <div class="stat-card">
                        <h3>$([math]::Round($totalTabelas))</h3>
                        <p>Tabelas</p>
                    </div>
                    <div class="stat-card">
                        <h3>$([math]::Round($totalPalavras / 200))</h3>
                        <p>Minutos de Leitura</p>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🏆 Plataformas Analisadas</h2>
"@
    
    foreach ($plat in $plataformas) {
        $html += "<div class='platform-item'><strong>$plat</strong></div>`n"
    }
    
    $html += @"
            </div>
            
            <div class="section">
                <h2>✅ Recomendação Final</h2>
                <div class="recommendation">
                    <h3>Solução Híbrida: Odoo Community + Módulos Axion IA</h3>
                    <ul>
                        <li><strong>R$ 0</strong> de custo base (vs R$ 20.700/ano Zendesk)</li>
                        <li><strong>Open Source</strong> - Controle total do código</li>
                        <li><strong>50.000+ apps</strong> disponíveis no ecossistema</li>
                        <li><strong>ERP integrado</strong> - CRM, Vendas, RH inclusos</li>
                        <li><strong>MVP em 6-8 semanas</strong></li>
                        <li><strong>Economia de R$ 103.500</strong> em 5 anos</li>
                    </ul>
                </div>
            </div>
            
            <div class="section">
                <h2>📋 Documentos Gerados</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Tamanho</th>
                            <th>Finalidade</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>CONSOLIDACAO-PROJETO-HELPDESK-COMPLETA.md</td>
                            <td>~80 KB</td>
                            <td>Documento master completo</td>
                        </tr>
                        <tr>
                            <td>RESUMO-EXECUTIVO-HELPDESK-2026.md</td>
                            <td>~8 KB</td>
                            <td>Apresentação executiva</td>
                        </tr>
                        <tr>
                            <td>MATRIZ-DECISAO-HELPDESK-2026.md</td>
                            <td>~6 KB</td>
                            <td>Comparação visual</td>
                        </tr>
                        <tr>
                            <td>GUIA-IMPLEMENTACAO-ODOO-HELPDESK.md</td>
                            <td>~15 KB</td>
                            <td>Implementação passo a passo</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2>🚀 Próximos Passos</h2>
                <ol style="line-height: 2em; padding-left: 20px;">
                    <li><strong>Semana 1:</strong> Deploy Odoo Community</li>
                    <li><strong>Semana 2:</strong> Migrar tickets Jitbit → Odoo</li>
                    <li><strong>Semanas 3-4:</strong> Integrar Motor IA Axion</li>
                    <li><strong>Semana 5:</strong> WhatsApp Meta Cloud API</li>
                    <li><strong>Semanas 6-7:</strong> Portal Self-Service</li>
                    <li><strong>Semana 8:</strong> Go-Live ✨</li>
                </ol>
            </div>
        </div>
        
        <div class="footer">
            <p>Análise Completa de Helpdesk 2026 | Axion Tecnologia</p>
            <p style="font-size: 0.9em; margin-top: 10px;">Gerado automaticamente por analisar-documentacao-helpdesk.ps1</p>
        </div>
    </div>
</body>
</html>
"@
    
    $htmlPath = "Relatorio-Analise-Helpdesk-2026.html"
    $html | Out-File -FilePath $htmlPath -Encoding UTF8
    
    Write-Host "✓ Relatório HTML gerado: " -NoNewline -ForegroundColor Green
    Write-Host $htmlPath -ForegroundColor White
    Write-Host ""
    
    if ($AbrirRelatorio) {
        Start-Process $htmlPath
        Write-Host "✓ Relatório aberto no navegador" -ForegroundColor Green
    }
    
    Write-Host ""
    return $htmlPath
}

# ═══════════════════════════════════════════════════════════════════════════════
# EXECUÇÃO PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════════

Clear-Host

Write-Host ""
Write-Host "  █████╗ ███╗   ██╗ █████╗ ██╗     ██╗███████╗███████╗" -ForegroundColor Cyan
Write-Host " ██╔══██╗████╗  ██║██╔══██╗██║     ██║██╔════╝██╔════╝" -ForegroundColor Cyan
Write-Host " ███████║██╔██╗ ██║███████║██║     ██║███████╗█████╗  " -ForegroundColor Cyan
Write-Host " ██╔══██║██║╚██╗██║██╔══██║██║     ██║╚════██║██╔══╝  " -ForegroundColor Cyan
Write-Host " ██║  ██║██║ ╚████║██║  ██║███████╗██║███████║███████╗" -ForegroundColor Cyan
Write-Host " ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝╚══════╝" -ForegroundColor Cyan
Write-Host ""

switch ($Acao) {
    "Analisar" {
        Show-Analise
    }
    "Validar" {
        Show-Validacao
    }
    "Estatisticas" {
        Show-Estatisticas
    }
    "Exportar" {
        Export-Documentacao -CaminhoDestino $Destino
    }
    "GerarPDF" {
        $htmlPath = New-RelatorioHTML
        Write-Host "📄 Para gerar PDF, use:" -ForegroundColor Yellow
        Write-Host "   wkhtmltopdf $htmlPath Relatorio-Helpdesk-2026.pdf" -ForegroundColor White
        Write-Host "   ou abra no navegador e use Ctrl+P → Salvar como PDF" -ForegroundColor White
    }
    "Completo" {
        Show-Analise
        Show-Validacao
        Show-Estatisticas
        
        Write-Host ""
        $pergunta = Read-Host "Deseja gerar relatório HTML? (S/N)"
        if ($pergunta -eq "S" -or $pergunta -eq "s") {
            New-RelatorioHTML
        }
        
        Write-Host ""
        $pergunta = Read-Host "Deseja exportar documentação? (S/N)"
        if ($pergunta -eq "S" -or $pergunta -eq "s") {
            Export-Documentacao -CaminhoDestino $Destino
        }
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Script finalizado! ✨" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
