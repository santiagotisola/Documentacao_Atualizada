# ═══════════════════════════════════════════════════════════════════
# Script de Parada do AxionIA Ecosystem via Docker (mantém dados)
# ═══════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AXION IA ECOSYSTEM - Parando         " -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Parando containers Docker..." -ForegroundColor Yellow
docker compose stop

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Containers parados com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "NOTA: Os dados foram preservados" -ForegroundColor Yellow
    Write-Host "Para reiniciar: docker compose start" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ ERRO ao parar containers!" -ForegroundColor Red
}

Write-Host ""
