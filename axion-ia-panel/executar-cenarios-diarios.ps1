# Script para executar cenários de validação automaticamente
# Pode ser agendado no Task Scheduler do Windows

$API_URL = "http://localhost:3100"
$SCENARIOS = @("scenario-001") # IDs dos cenários a executar
$CATEGORIES = @("functional", "visual", "performance")

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EXECUÇÃO AUTOMÁTICA DE CENÁRIOS" -ForegroundColor Cyan
Write-Host "  Data: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($scenarioId in $SCENARIOS) {
    Write-Host "Executando cenário: $scenarioId..." -ForegroundColor Yellow
    
    try {
        $body = @{
            categories = $CATEGORIES
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest `
            -Uri "$API_URL/api/scenarios/$scenarioId/execute" `
            -Method POST `
            -ContentType "application/json" `
            -Body $body `
            -UseBasicParsing
        
        $result = $response.Content | ConvertFrom-Json
        
        if ($result.status -eq "success") {
            Write-Host "✅ Cenário executado com sucesso!" -ForegroundColor Green
            Write-Host "   Score: $($result.score)/100" -ForegroundColor Green
            Write-Host "   Testes aprovados: $($result.testsPassed)/$($result.testsExecuted)" -ForegroundColor Green
        } else {
            Write-Host "❌ Cenário falhou!" -ForegroundColor Red
            Write-Host "   Erros: $($result.errors.Count)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Erro ao executar cenário: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EXECUÇÃO CONCLUÍDA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Enviar notificação (opcional)
# Send-MailMessage -To "equipe@axiontecnologia.com.br" -Subject "Relatório de Testes Automáticos" -Body "Testes concluídos. Veja o log anexo."
