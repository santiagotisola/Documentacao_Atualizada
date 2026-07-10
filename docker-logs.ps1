# ═══════════════════════════════════════════════════════════════════
# Script de Logs do AxionIA Ecosystem via Docker
# ═══════════════════════════════════════════════════════════════════

param(
    [string]$servico = ""
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AXION IA ECOSYSTEM - Logs            " -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrWhiteSpace($servico)) {
    Write-Host "Serviços disponíveis:" -ForegroundColor Yellow
    Write-Host "   - panel (Frontend React)" -ForegroundColor White
    Write-Host "   - api (Backend Node.js)" -ForegroundColor White
    Write-Host "   - mongodb (Banco MongoDB)" -ForegroundColor White
    Write-Host "   - sqlserver (Banco SQL Server)" -ForegroundColor White
    Write-Host "   - axhub-docs (Documentação AxHub)" -ForegroundColor White
    Write-Host "   - axton-docs (Documentação AxTon)" -ForegroundColor White
    Write-Host "   - axcross-docs (Documentação AxCross)" -ForegroundColor White
    Write-Host ""
    Write-Host "Uso: .\docker-logs.ps1 <serviço>" -ForegroundColor Cyan
    Write-Host "Ou: docker compose logs -f" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Mostrando logs de: $servico" -ForegroundColor Yellow
    Write-Host "Pressione Ctrl+C para sair" -ForegroundColor Yellow
    Write-Host ""
    docker compose logs -f $servico
}
