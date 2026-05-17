$MarkdownFile = "ANALISE-PROTECAO-IMAGENS-AZURE-COMPLETO.md"
$OutputWord = "ANALISE-PROTECAO-IMAGENS-AZURE-COMPLETO.docx"

if (-not (Test-Path $MarkdownFile)) {
    Write-Host "Erro: Arquivo $MarkdownFile não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando conversão de Markdown para Word..."

$mdContent = Get-Content $MarkdownFile -Raw -Encoding UTF8

try {
    $Word = New-Object -ComObject Word.Application
    $Word.Visible = $false
    $doc = $Word.Documents.Add()
    Write-Host "Word iniciado com sucesso"
} catch {
    Write-Host "Erro ao abrir Word: $_" -ForegroundColor Red
    exit 1
}

$lines = $mdContent -split "`n"
$wdStyleHeading1 = 1
$wdStyleHeading2 = 2
$wdStyleHeading3 = 3
$wdStyleNormal = 0

foreach ($line in $lines) {
    $trimmed = $line.Trim()
    
    if ($trimmed -eq "") {
        $range = $doc.Range.End
        [void]$range.InsertAfter("`n")
    }
    elseif ($trimmed -match "^# ") {
        $title = $trimmed -replace "^# ", ""
        $range = $doc.Range.End
        $para = [void]$range.InsertAfter($title)
        $range.InsertParagraph()
        $range.Style = "Heading 1"
    }
    elseif ($trimmed -match "^## ") {
        $title = $trimmed -replace "^## ", ""
        $range = $doc.Range.End
        [void]$range.InsertAfter($title)
        $range.InsertParagraph()
        $range.Style = "Heading 2"
    }
    elseif ($trimmed -match "^### ") {
        $title = $trimmed -replace "^### ", ""
        $range = $doc.Range.End
        [void]$range.InsertAfter($title)
        $range.InsertParagraph()
        $range.Style = "Heading 3"
    }
    else {
        $range = $doc.Range.End
        [void]$range.InsertAfter($trimmed)
        $range.InsertParagraph()
    }
}

try {
    $fullPath = (Resolve-Path $OutputWord -ErrorAction SilentlyContinue).Path
    if ($null -eq $fullPath) {
        $fullPath = Join-Path (Get-Location) $OutputWord
    }
    
    $doc.SaveAs($fullPath, 12)  # 12 = wdFormatDocx
    Write-Host "Documento salvo com sucesso!" -ForegroundColor Green
    Write-Host "Arquivo: $fullPath" -ForegroundColor Cyan
    Write-Host "Tamanho: $((Get-Item $fullPath).Length / 1KB) KB" -ForegroundColor Gray
} catch {
    Write-Host "Erro ao salvar: $_" -ForegroundColor Red
    $Word.Quit()
    exit 1
}

$Word.Quit()
Write-Host "Conversao concluida!" -ForegroundColor Green
