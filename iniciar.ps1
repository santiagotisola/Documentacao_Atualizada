# iniciar.ps1 - Liga todos os servicos do projeto Axion.Docs em um ÚNICO terminal
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== AXION DOCS - Iniciando servicos ===" -ForegroundColor Cyan

# Encerra processos nas portas antes de iniciar
$portas = 3017, 3010, 3011, 3012, 3100
foreach ($p in $portas) {
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($conn) { Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Seconds 2
Write-Host "[OK] Portas limpas" -ForegroundColor Green

# Salva PIDs em arquivo para o encerrar.ps1
$pidFile = Join-Path $ROOT ".pids.txt"
if (Test-Path $pidFile) { Remove-Item $pidFile }

# Inicia cada serviço como Job
Write-Host "`nIniciando jobs..." -ForegroundColor Cyan

$job1 = Start-Job -ScriptBlock {
    Set-Location $using:ROOT\axion-ia-api
    node --env-file=.env src/app.js
} -Name "axion-ia-api"
Write-Host "[Job $($job1.Id)] axion-ia-api :3100" -ForegroundColor Yellow

$job2 = Start-Job -ScriptBlock {
    Set-Location $using:ROOT\axion-ia-panel
    npm run dev
} -Name "axion-ia-panel"
Write-Host "[Job $($job2.Id)] axion-ia-panel :3017" -ForegroundColor Yellow

$job3 = Start-Job -ScriptBlock {
    Set-Location "$using:ROOT\AxHub\docs-portal"
    npm run serve -- --port 3010
} -Name "AxHub.Docs"
Write-Host "[Job $($job3.Id)] AxHub.Docs :3010" -ForegroundColor Yellow

$job4 = Start-Job -ScriptBlock {
    Set-Location "$using:ROOT\AxTon\docs-portal"
    npm run serve -- --port 3011 2>&1 | Out-Null  # Silencia erros conhecidos
} -Name "AxTon.Docs"
Write-Host "[Job $($job4.Id)] AxTon.Docs :3011" -ForegroundColor Yellow

$job5 = Start-Job -ScriptBlock {
    Set-Location "$using:ROOT\AxCross\docs-portal"
    npm run serve -- --port 3012
} -Name "AxCross.Docs"
Write-Host "[Job $($job5.Id)] AxCross.Docs :3012" -ForegroundColor Yellow

# Salva IDs dos jobs
"$($job1.Id),$($job2.Id),$($job3.Id),$($job4.Id),$($job5.Id)" | Out-File $pidFile

Write-Host "`nAguardando inicializacao..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

Write-Host "`n--- STATUS ---" -ForegroundColor Cyan
$urls = @(
    "http://localhost:3100/api/doc/secoes/axhub|axion-ia-api  :3100",
    "http://localhost:3017/|axion-ia-panel :3017",
    "http://localhost:3010/AxHub.Docs/|AxHub.Docs     :3010",
    "http://localhost:3011/AxTon.Docs/|AxTon.Docs     :3011",
    "http://localhost:3012/AxCross.Docs/|AxCross.Docs   :3012"
)
foreach ($item in $urls) {
    $parts = $item.Split("|")
    $url = $parts[0]; $nome = $parts[1]
    try {
        $code = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop).StatusCode
        if ($code -eq 200) { Write-Host "  [OK] $nome" -ForegroundColor Green }
        else { Write-Host "  [??] $nome HTTP $code" -ForegroundColor Yellow }
    } catch {
        Write-Host "  [--] $nome ainda iniciando..." -ForegroundColor Red
    }
}

Write-Host "`nAbrindo no navegador..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:3017/helpdesk"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3010/AxHub.Docs/"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3012/AxCross.Docs/"

Write-Host "`n=== Servicos rodando em background ===" -ForegroundColor Green
Write-Host "Para ver logs: Get-Job | Receive-Job" -ForegroundColor Cyan
Write-Host "Para encerrar: .\encerrar.ps1 ou Ctrl+C" -ForegroundColor Cyan
Write-Host "`nJobs ativos:" -ForegroundColor Yellow
Get-Job | Format-Table Id, Name, State -AutoSize

Write-Host "`nPressione Ctrl+C para encerrar ou feche esta janela..." -ForegroundColor White
# Mantém o script rodando
try {
    while ($true) {
        Start-Sleep -Seconds 5
        # Verifica se algum job morreu
        $deadJobs = Get-Job | Where-Object { $_.State -eq 'Failed' -or $_.State -eq 'Stopped' }
        if ($deadJobs) {
            Write-Host "`n[ALERTA] Jobs com problema:" -ForegroundColor Red
            $deadJobs | Format-Table Id, Name, State -AutoSize
        }
    }
} finally {
    Write-Host "`nEncerrando jobs..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    if (Test-Path $pidFile) { Remove-Item $pidFile }
    Write-Host "[OK] Encerrado" -ForegroundColor Green
}
