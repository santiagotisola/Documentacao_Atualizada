# ========================================================================
# AXION IA UNIFIED - Script de Inicializacao
# ========================================================================
# Inicia todos os servicos do monorepo unificado:
# - Panel (React/Vite) na porta 3017
# - API (Node.js/Express) na porta 3100
# - Engine (Motor IA) em background
# ========================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AXION IA UNIFIED - Iniciando Servicos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ========================================================================
# 1. LIMPEZA DE PORTAS
# ========================================================================

Write-Host "Limpando portas..." -ForegroundColor Yellow

$portas = @(3010, 3011, 3012, 3017, 3100)

foreach ($porta in $portas) {
    $processos = Get-NetTCPConnection -LocalPort $porta -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($processId in $processos) {
        if ($processId) {
            try {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "   OK: Porta $porta liberada (PID: $processId)" -ForegroundColor Green
            } catch {
                Write-Host "   AVISO: Nao foi possivel liberar porta $porta" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "   [OK] Portas limpas" -ForegroundColor Green
Write-Host ""

# ========================================================================
# 2. INICIANDO JOBS
# ========================================================================

Write-Host "Iniciando servicos..." -ForegroundColor Cyan
Write-Host ""

# Job 1: Panel (React/Vite)
$job1 = Start-Job -ScriptBlock {
    Set-Location "c:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel"
    $env:PATH = "c:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel\node_modules\.bin;" + $env:PATH
    npm run dev
} -Name "AxionPanel"

Write-Host "   [Job $($job1.Id)] Panel (Vite) - Porta 3017" -ForegroundColor Cyan

# Job 2: API (Node.js/Express)
$job2 = Start-Job -ScriptBlock {
    Set-Location "c:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel\api"
    $env:PATH = "c:\Users\Santiago\Axiondocs\Axion.Docs\axion-ia-panel\api\node_modules\.bin;" + $env:PATH
    node --env-file=.env src/app.js
} -Name "AxionAPI"

Write-Host "   [Job $($job2.Id)] API (Node.js) - Porta 3100" -ForegroundColor Green

# Job 3: AxHub.Docs (Docusaurus) - Porta 3010
$job3 = Start-Job -ScriptBlock {
    Set-Location "c:\Users\Santiago\Axiondocs\Axion.Docs\AxHub\docs-portal"
    $env:PATH = "c:\Users\Santiago\Axiondocs\Axion.Docs\AxHub\docs-portal\node_modules\.bin;" + $env:PATH
    npx docusaurus start --port 3010 --host localhost
} -Name "AxHubDocs"
Write-Host "   [Job $($job3.Id)] AxHub.Docs (Docusaurus) - Porta 3010" -ForegroundColor Magenta

# Job 4: AxTon.Docs (Docusaurus) - Porta 3011
$job4 = Start-Job -ScriptBlock {
    Set-Location "c:\Users\Santiago\Axiondocs\Axion.Docs\AxTon\docs-portal"
    $env:PATH = "c:\Users\Santiago\Axiondocs\Axion.Docs\AxTon\docs-portal\node_modules\.bin;" + $env:PATH
    npx docusaurus start --port 3011 --host localhost
} -Name "AxTonDocs"
Write-Host "   [Job $($job4.Id)] AxTon.Docs (Docusaurus) - Porta 3011" -ForegroundColor Magenta

# Job 5: AxCross.Docs (Docusaurus) - Porta 3012
$job5 = Start-Job -ScriptBlock {
    Set-Location "c:\Users\Santiago\Axiondocs\Axion.Docs\AxCross\docs-portal"
    $env:PATH = "c:\Users\Santiago\Axiondocs\Axion.Docs\AxCross\docs-portal\node_modules\.bin;" + $env:PATH
    npx docusaurus start --port 3012 --host localhost
} -Name "AxCrossDocs"
Write-Host "   [Job $($job5.Id)] AxCross.Docs (Docusaurus) - Porta 3012" -ForegroundColor Magenta

Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

# ========================================================================
# 3. AGUARDANDO INICIALIZACAO
# ========================================================================

Write-Host "Aguardando inicializacao (15s)..." -ForegroundColor Yellow

Start-Sleep -Seconds 15

# ========================================================================
# 4. VERIFICANDO STATUS
# ========================================================================

Write-Host ""
Write-Host "SERVICOS INICIADOS:" -ForegroundColor Green
Write-Host ""

# Verificar Panel
$panelStatus = Test-NetConnection -ComputerName localhost -Port 3017 -WarningAction SilentlyContinue -InformationLevel Quiet
if ($panelStatus) {
    Write-Host "   Panel:  http://localhost:3017  [ONLINE]" -ForegroundColor Green
} else {
    Write-Host "   Panel:  http://localhost:3017  [OFFLINE]" -ForegroundColor Red
}

# Verificar API
$apiStatus = Test-NetConnection -ComputerName localhost -Port 3100 -WarningAction SilentlyContinue -InformationLevel Quiet
if ($apiStatus) {
    Write-Host "   API:    http://localhost:3100  [ONLINE]" -ForegroundColor Green
} else {
    Write-Host "   API:    http://localhost:3100  [OFFLINE]" -ForegroundColor Red
}

# Verificar Docs
foreach ($docInfo in @(
    @{port=3010; name="AxHub.Docs"; url="http://localhost:3010/AxHub.Docs"},
    @{port=3011; name="AxTon.Docs"; url="http://localhost:3011/AxTon.Docs"},
    @{port=3012; name="AxCross.Docs"; url="http://localhost:3012/AxCross.Docs"}
)) {
    $ok = Test-NetConnection -ComputerName localhost -Port $docInfo.port -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($ok) {
        Write-Host "   $($docInfo.name): $($docInfo.url)  [ONLINE]" -ForegroundColor Magenta
    } else {
        Write-Host "   $($docInfo.name): $($docInfo.url)  [iniciando...]" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""

# ========================================================================
# 5. INSTRUCOES
# ========================================================================

Write-Host "COMANDOS UTEIS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Ver logs do Panel:  Receive-Job -Name AxionPanel -Keep" -ForegroundColor White
Write-Host "   Ver logs da API:    Receive-Job -Name AxionAPI -Keep" -ForegroundColor White
Write-Host "   Listar jobs:        Get-Job" -ForegroundColor White
Write-Host "   Encerrar tudo:      .\encerrar.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""
Write-Host "SISTEMA PRONTO!" -ForegroundColor Green
Write-Host ""
Write-Host "   Acesse: http://localhost:3017" -ForegroundColor Cyan
Write-Host ""

