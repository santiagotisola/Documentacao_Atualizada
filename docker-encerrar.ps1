# ═══════════════════════════════════════════════════════════════════
# Script de Encerramento do AxionIA Ecosystem via Docker
# ═══════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AXION IA ECOSYSTEM - Encerrando      " -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  ATENÇÃO: Os dados serão preservados nos volumes Docker" -ForegroundColor Yellow
Write-Host ""
Write-Host "Deseja remover também os volumes (APAGA DADOS)? [s/N]" -ForegroundColor Red
$removerVolumes = Read-Host
Write-Host ""

Write-Host "Parando e removendo containers..." -ForegroundColor Yellow

if ($removerVolumes -eq "s" -or $removerVolumes -eq "S") {
    Write-Host "   → Removendo containers E volumes (DADOS SERÃO APAGADOS)" -ForegroundColor Red
    docker compose down -v
} else {
    Write-Host "   → Removendo apenas containers (dados preservados)" -ForegroundColor Yellow
    docker compose down
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Containers removidos com sucesso!" -ForegroundColor Green
    
    if ($removerVolumes -ne "s" -and $removerVolumes -ne "S") {
        Write-Host ""
        Write-Host "NOTA: Os dados foram preservados nos volumes:" -ForegroundColor Yellow
        Write-Host "   - axion-mongodb-data" -ForegroundColor White
        Write-Host "   - axion-sqlserver-data" -ForegroundColor White
        Write-Host ""
        Write-Host "Para remover volumes: docker volume rm <nome>" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "✗ ERRO ao remover containers!" -ForegroundColor Red
}

Write-Host ""
