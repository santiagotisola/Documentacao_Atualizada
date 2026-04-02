# ============================================================
# encerrar.ps1 — Para todos os servicos do projeto Axion.Docs
# ============================================================

Write-Host ""
Write-Host "Encerrando todos os servicos..." -ForegroundColor Red

$PORTAS = @(3001, 3010, 3011, 3012, 3100)
foreach ($p in $PORTAS) {
    $pids = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess
    foreach ($pid in $pids) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "  Encerrado PID $pid (porta $p)" -ForegroundColor Yellow
    }
}

# Mata qualquer node remanescente
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "[OK] Todos os servicos encerrados." -ForegroundColor Green
Write-Host ""
pause
