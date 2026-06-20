# 🎯 Teste Validação Visual Completa
# Este script testa o sistema de validação visual que valida TODAS as telas,
# formulários, CRUD, ortografia e dependências de um sistema web.

Write-Host ""
Write-Host "🎯 ====== TESTE DE VALIDAÇÃO VISUAL COMPLETA ======" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:3100/api"

# ────────────────────────────────────────────────────────────────────────────────
# ETAPA 1: Iniciar Validação Visual
# ────────────────────────────────────────────────────────────────────────────────
Write-Host "📝 [1/4] Iniciando validação visual completa..." -ForegroundColor Yellow

$body = @{
    systemUrl = "https://economia.axhub.axion.ws/"
    credentials = @{
        username = ""
        password = ""
    }
    scope = "full"
} | ConvertTo-Json

try {
    $startResponse = Invoke-RestMethod -Uri "$API_URL/visual-validation/start" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 10

    $validationId = $startResponse.validationId
    Write-Host "✅ Validação iniciada!" -ForegroundColor Green
    Write-Host "   ValidationId: $validationId" -ForegroundColor Gray
    Write-Host ""
}
catch {
    Write-Host "❌ Erro ao iniciar validação:" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Verifique se a API está rodando em http://localhost:3100" -ForegroundColor Yellow
    exit 1
}

# ────────────────────────────────────────────────────────────────────────────────
# ETAPA 2: Monitorar Progresso
# ────────────────────────────────────────────────────────────────────────────────
Write-Host "📊 [2/4] Monitorando progresso (isso pode levar alguns minutos)..." -ForegroundColor Yellow
Write-Host ""

$maxAttempts = 120  # 120 tentativas = 4 minutos
$attempt = 0
$completed = $false

while ($attempt -lt $maxAttempts) {
    Start-Sleep -Seconds 2
    $attempt++

    try {
        $statusResponse = Invoke-RestMethod -Uri "$API_URL/visual-validation/status/$validationId" `
            -Method GET `
            -TimeoutSec 5

        $progress = [int]$statusResponse.progress
        $currentStep = $statusResponse.currentStep
        $status = $statusResponse.status

        # Exibir progresso
        $progressBar = "[" + ("█" * [Math]::Floor($progress / 5)) + ("░" * (20 - [Math]::Floor($progress / 5))) + "]"
        Write-Host "`r   $progressBar $progress% - $currentStep" -NoNewline

        # Verificar se concluído
        if ($status -eq "concluído") {
            Write-Host ""
            Write-Host "✅ Validação concluída!" -ForegroundColor Green
            Write-Host ""
            $completed = $true
            break
        }
        elseif ($status -eq "erro") {
            Write-Host ""
            Write-Host "❌ Erro durante validação: $($statusResponse.error)" -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host ""
        Write-Host "⚠️  Erro ao verificar status (tentativa $attempt/$maxAttempts)" -ForegroundColor Yellow
        continue
    }
}

if (-not $completed) {
    Write-Host ""
    Write-Host "⏱️  Timeout: Validação ainda em andamento após 4 minutos" -ForegroundColor Yellow
    Write-Host "   Você pode verificar o status manualmente:" -ForegroundColor Gray
    Write-Host "   GET $API_URL/visual-validation/status/$validationId" -ForegroundColor Gray
    exit 1
}

# ────────────────────────────────────────────────────────────────────────────────
# ETAPA 3: Obter Relatório Completo
# ────────────────────────────────────────────────────────────────────────────────
Write-Host "📄 [3/4] Obtendo relatório completo..." -ForegroundColor Yellow

try {
    $reportResponse = Invoke-RestMethod -Uri "$API_URL/visual-validation/report/$validationId" `
        -Method GET `
        -TimeoutSec 10

    Write-Host "✅ Relatório obtido!" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "❌ Erro ao obter relatório:" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
    exit 1
}

# ────────────────────────────────────────────────────────────────────────────────
# ETAPA 4: Exibir Resultados
# ────────────────────────────────────────────────────────────────────────────────
Write-Host "📊 [4/4] Resultados da Validação Visual:" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Resumo
$summary = $reportResponse.summary
if ($summary) {
    Write-Host "✅ RESUMO:" -ForegroundColor Green
    Write-Host "   📸 Telas Validadas:      $($summary.totalScreens)" -ForegroundColor White
    Write-Host "   📝 Formulários:           $($summary.totalForms)" -ForegroundColor White
    Write-Host "   ✅ Testes Executados:    $($summary.totalTests)" -ForegroundColor White
    Write-Host "   ⚠️  Issues Encontradas:   $($summary.totalIssues)" -ForegroundColor $(if ($summary.totalIssues -gt 0) { "Yellow" } else { "White" })
    Write-Host "   ⏱️  Duração:              $($summary.duration)" -ForegroundColor White
    Write-Host ""
}

# Screenshots
$screens = $reportResponse.screens
if ($screens -and $screens.Count -gt 0) {
    Write-Host "📸 SCREENSHOTS CAPTURADOS:" -ForegroundColor Cyan
    foreach ($screen in $screens | Select-Object -First 5) {
        Write-Host "   → $($screen.title)" -ForegroundColor White
        Write-Host "     URL: $($screen.url)" -ForegroundColor Gray
        Write-Host "     Screenshot: $($screen.screenshot)" -ForegroundColor Gray
        Write-Host "     Formulários: $($screen.forms) | Testes: $($screen.tests)" -ForegroundColor Gray
        Write-Host ""
    }
    if ($screens.Count -gt 5) {
        Write-Host "   ... e mais $($screens.Count - 5) telas" -ForegroundColor Gray
        Write-Host ""
    }
}

# Issues
$issues = $reportResponse.issues
if ($issues -and $issues.Count -gt 0) {
    Write-Host "⚠️  ISSUES ENCONTRADAS:" -ForegroundColor Yellow
    foreach ($issue in $issues | Select-Object -First 5) {
        Write-Host "   → $($issue.type.ToUpper())" -ForegroundColor Yellow
        Write-Host "     Página: $($issue.page)" -ForegroundColor Gray
        Write-Host "     Campo: $($issue.field)" -ForegroundColor Gray
        if ($issue.issues) {
            foreach ($i in $issue.issues) {
                Write-Host "     `"$($i.wrong)`" → `"$($i.correct)`"" -ForegroundColor Red
            }
        }
        Write-Host ""
    }
    if ($issues.Count -gt 5) {
        Write-Host "   ... e mais $($issues.Count - 5) issues" -ForegroundColor Gray
        Write-Host ""
    }
}
else {
    Write-Host "✅ Nenhuma issue encontrada!" -ForegroundColor Green
    Write-Host ""
}

# Recomendações
$recommendations = $reportResponse.recommendations
if ($recommendations -and $recommendations.Count -gt 0) {
    Write-Host "💡 RECOMENDAÇÕES:" -ForegroundColor Cyan
    foreach ($rec in $recommendations | Select-Object -First 5) {
        $prioColor = switch ($rec.priority) {
            "alta" { "Red" }
            "média" { "Yellow" }
            default { "White" }
        }
        Write-Host "   → [$($rec.priority.ToUpper())] $($rec.category)" -ForegroundColor $prioColor
        Write-Host "     $($rec.message)" -ForegroundColor Gray
        Write-Host ""
    }
    if ($recommendations.Count -gt 5) {
        Write-Host "   ... e mais $($recommendations.Count - 5) recomendações" -ForegroundColor Gray
        Write-Host ""
    }
}

# ────────────────────────────────────────────────────────────────────────────────
# Instruções Finais
# ────────────────────────────────────────────────────────────────────────────────
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Arquivos Gerados:" -ForegroundColor Cyan
Write-Host "   Screenshots: axion-ia-api/screenshots/$validationId/" -ForegroundColor White
Write-Host "   Relatório JSON: axion-ia-api/reports/visual-validation-$validationId.json" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Visualizar no Painel:" -ForegroundColor Cyan
Write-Host "   http://localhost:3017/visual-validation" -ForegroundColor White
Write-Host ""
Write-Host "📄 Baixar Relatório:" -ForegroundColor Cyan
Write-Host "   GET $API_URL/visual-validation/report/$validationId" -ForegroundColor White
Write-Host ""
Write-Host "✅ TESTE CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host ""
