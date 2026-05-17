# Script para converter Markdown para Word (.docx)
# Usa Microsoft Word COM object para criar documento formatado

param(
    [string]$MarkdownFile = "ANALISE-PROTECAO-IMAGENS-AZURE-COMPLETO.md",
    [string]$OutputWord = "ANALISE-PROTECAO-IMAGENS-AZURE-COMPLETO.docx"
)

# Verificar se arquivo existe
if (-not (Test-Path $MarkdownFile)) {
    Write-Host "❌ Erro: Arquivo $MarkdownFile não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Iniciando conversão de Markdown para Word..." -ForegroundColor Cyan
Write-Host "   Entrada: $MarkdownFile" -ForegroundColor Gray
Write-Host "   Saída: $OutputWord" -ForegroundColor Gray

# Ler conteúdo do Markdown
$mdContent = Get-Content $MarkdownFile -Raw -Encoding UTF8

# Criar instância Word
try {
    $Word = New-Object -ComObject Word.Application
    $Word.Visible = $false
    Write-Host "✅ Word iniciado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao abrir Word. Instale Microsoft Office ou use formato alternativo." -ForegroundColor Red
    exit 1
}

# Criar documento
$doc = $Word.Documents.Add()
$selection = $Word.Selection

# Função para limpar quebras de linha extras
function Clean-Text {
    param([string]$text)
    return $text -replace "^\s+", "" -replace "\s+$", ""
}

# Função para processar linhas do Markdown
function Add-Markdown-Content {
    param([string]$content)
    
    $lines = $content -split "`n"
    
    foreach ($line in $lines) {
        $trimmed = Clean-Text $line
        
        if ($trimmed -eq "") {
            # Linha vazia
            $para = $doc.Range.Paragraphs.Add()
            $para.Range.Font.Size = 11
        }
        elseif ($trimmed -match "^# ") {
            # Título H1
            $title = $trimmed -replace "^# ", ""
            $para = $doc.Range.Paragraphs.Add()
            $para.Range.Text = $title
            $para.Range.Font.Size = 24
            $para.Range.Font.Bold = $true
            $para.Style = "Heading 1"
        }
        elseif ($trimmed -match "^## ") {
            # Título H2
            $title = $trimmed -replace "^## ", ""
            $para = $doc.Range.Paragraphs.Add()
            $para.Range.Text = $title
            $para.Range.Font.Size = 18
            $para.Range.Font.Bold = $true
            $para.Style = "Heading 2"
        }
        elseif ($trimmed -match "^### ") {
            # Título H3
            $title = $trimmed -replace "^### ", ""
            $para = $doc.Range.Paragraphs.Add()
            $para.Range.Text = $title
            $para.Range.Font.Size = 14
            $para.Range.Font.Bold = $true
            $para.Style = "Heading 3"
        }
        elseif ($trimmed -match "^- " -or $trimmed -match "^\* ") {
            # Bullet point
            $para = $doc.Range.Paragraphs.Add()
            $para.Range.Text = $trimmed
            $para.Range.Font.Size = 11
        }
        else {
            # Parágrafo normal
            $para = $doc.Range.Paragraphs.Add()
            $para.Range.Text = $trimmed
            $para.Range.Font.Size = 11
            $para.Range.Font.Name = "Calibri"
        }
    }
}

# Adicionar conteúdo
try {
    Add-Markdown-Content -content $mdContent
    Write-Host "Conteudo adicionado ao documento" -ForegroundColor Green
} catch {
    Write-Host "Erro ao adicionar conteudo: $_" -ForegroundColor Red
    $Word.Quit()
    exit 1
}

# Salvar documento
$fullPath = (Get-Item $OutputWord -ErrorAction SilentlyContinue).FullName
if ($null -eq $fullPath) {
    $fullPath = Join-Path (Get-Location) $OutputWord
}

try {
    # Salvar em formato DOCX (Word 2007+)
    $doc.SaveAs($fullPath, 12)  # 12 = wdFormatDocx
    Write-Host "Documento salvo com sucesso!" -ForegroundColor Green
    Write-Host "   Arquivo: $fullPath" -ForegroundColor Cyan
    Write-Host "   Tamanho: $((Get-Item $fullPath).Length / 1KB) KB" -ForegroundColor Gray
} catch {
    Write-Host "Erro ao salvar documento: $_" -ForegroundColor Red
    $Word.Quit()
    exit 1
}

# Fechar Word
$Word.Quit()
Write-Host "Conversao concluida!" -ForegroundColor Green
