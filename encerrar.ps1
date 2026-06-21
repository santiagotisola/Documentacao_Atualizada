# ============================================================
# encerrar.ps1 — Para todos os servicos do projeto Axion.Docs
# ============================================================

Write-Host ""
Write-Host "Encerrando todos os servicos..." -ForegroundColor Red

# Encerra jobs do PowerShell (se existirem)
$jobs = Get-Job -ErrorAction SilentlyContinue
if ($jobs) {
    Write-Host "  Encerrando jobs PowerShell..." -ForegroundColor Yellow
    $jobs | Stop-Job
    $jobs | Remove-Job -Force
}

# Encerra processos nas portas
$PORTAS = @(3017, 3010, 3011, 3012, 3100)
foreach ($p in $PORTAS) {
    $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess
    foreach ($pid in $pids) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  Encerrado PID $pid (porta $p)" -ForegroundColor Yellow
    }
}

# Remove arquivo de PIDs se existir
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $ROOT ".pids.txt"
if (Test-Path $pidFile) { Remove-Item $pidFile -Force }

Write-Host ""
Write-Host "[OK] Todos os servicos encerrados." -ForegroundColor Green
Write-Host ""
pause
