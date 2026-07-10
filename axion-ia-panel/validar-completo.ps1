# ========================================
# VALIDACAO COMPLETA DO CUTI
# Teste pratico de todas as funcionalidades
# ========================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VALIDACAO COMPLETA - CUTI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ========================================
# TESTE 1: API Respondendo
# ========================================

Write-Host "[1/5] Testando API..." -ForegroundColor Yellow

try {
    $api = Invoke-WebRequest -Uri "http://localhost:3100" -UseBasicParsing | ConvertFrom-Json
    Write-Host "   OK - API v$($api.versao)" -ForegroundColor Green
    Write-Host "   Engines: $($api.engines)" -ForegroundColor Gray
    Write-Host "   Modos: $($api.modesAutonomous.Count)" -ForegroundColor Gray
} catch {
    Write-Host "   ERRO - API nao esta rodando!" -ForegroundColor Red
    Write-Host "   Execute: cd api; node --env-file=.env src/app.js" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# ========================================
# TESTE 2: Cenarios Gravados
# ========================================

Write-Host "[2/5] Verificando cenarios gravados..." -ForegroundColor Yellow

$cenarios = Get-ChildItem "api\engine\scenarios" -Recurse -Filter "scenario.json"

if ($cenarios.Count -eq 0) {
    Write-Host "   AVISO - Nenhum cenario gravado ainda" -ForegroundColor Yellow
    Write-Host "   Grave um em: http://localhost:3017/cuti" -ForegroundColor Gray
} else {
    Write-Host "   OK - $($cenarios.Count) cenario(s) encontrado(s)" -ForegroundColor Green
    foreach ($c in $cenarios) {
        $content = Get-Content $c.FullName -Raw | ConvertFrom-Json
        Write-Host "   - $($c.Directory.Name): $($content.steps.Count) passos" -ForegroundColor Gray
    }
}

Write-Host ""

# ========================================
# TESTE 3: Validacao Simples (Smoke Test)
# ========================================

Write-Host "[3/5] Executando validacao simples..." -ForegroundColor Yellow

try {
    $body = '{"system":"AxHub","environment":"production","categories":["functional"],"mode":"single"}'
    $result = Invoke-WebRequest `
        -Uri "http://localhost:3100/api/cuti/execute" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing | ConvertFrom-Json
    
    Write-Host "   OK - Score: $($result.score)/100" -ForegroundColor Green
    Write-Host "   Testes: $($result.testsPassed)/$($result.testsExecuted)" -ForegroundColor Gray
} catch {
    Write-Host "   ERRO - Validacao falhou" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# ========================================
# TESTE 4: Interface Acessivel
# ========================================

Write-Host "[4/5] Verificando interface..." -ForegroundColor Yellow

try {
    $panel = Invoke-WebRequest -Uri "http://localhost:3017" -UseBasicParsing
    Write-Host "   OK - Panel acessivel" -ForegroundColor Green
    Write-Host "   CUTI: http://localhost:3017/cuti" -ForegroundColor Gray
    Write-Host "   Config: http://localhost:3017/cuti/config" -ForegroundColor Gray
} catch {
    Write-Host "   ERRO - Panel nao esta rodando!" -ForegroundColor Red
    Write-Host "   Execute: npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# TESTE 5: Execucao de Cenario (se existir)
# ========================================

Write-Host "[5/5] Testando execucao de cenario..." -ForegroundColor Yellow

if ($cenarios.Count -gt 0) {
    Write-Host "   Cenario disponivel: $($cenarios[0].Directory.Name)" -ForegroundColor Gray
    Write-Host "   Passos: $((Get-Content $cenarios[0].FullName -Raw | ConvertFrom-Json).steps.Count)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Para executar agora:" -ForegroundColor Yellow
    Write-Host "   .\executar-cenario-gravado.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Ou via interface:" -ForegroundColor Yellow
    Write-Host "   1. Acesse http://localhost:3017/cuti" -ForegroundColor Gray
    Write-Host "   2. Clique em 'Executar'" -ForegroundColor Gray
} else {
    Write-Host "   PULAR - Nenhum cenario para testar" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# RESUMO FINAL
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO DA VALIDACAO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$tudo_ok = $api -and ($cenarios.Count -gt 0) -and $result -and $panel

if ($tudo_ok) {
    Write-Host "STATUS: TUDO FUNCIONANDO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:" -ForegroundColor Cyan
    Write-Host "1. Execute seu cenario gravado" -ForegroundColor Gray
    Write-Host "2. Configure validacoes automaticas" -ForegroundColor Gray
    Write-Host "3. Agende execucoes diarias" -ForegroundColor Gray
} else {
    Write-Host "STATUS: ATENCAO - Alguns componentes precisam ser iniciados" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifique:" -ForegroundColor Cyan
    if (-not $api) { Write-Host "- API nao esta rodando" -ForegroundColor Red }
    if ($cenarios.Count -eq 0) { Write-Host "- Nenhum cenario gravado ainda" -ForegroundColor Yellow }
    if (-not $panel) { Write-Host "- Panel nao esta rodando" -ForegroundColor Red }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
