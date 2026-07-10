# ============================================
# EXECUTAR CENÁRIO GRAVADO
# ============================================

param(
    [string]$ScenarioPath = "engine\scenarios\AxHub - production\scenario.json",
    [string]$ApiUrl = "http://localhost:3100"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EXECUTAR CENÁRIO GRAVADO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ler cenário do disco
if (-not (Test-Path $ScenarioPath)) {
    Write-Host "❌ Cenário não encontrado: $ScenarioPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Cenários disponíveis:" -ForegroundColor Yellow
    Get-ChildItem -Path "engine\scenarios" -Recurse -Filter "scenario.json" | ForEach-Object {
        Write-Host "  - $($_.FullName)" -ForegroundColor Gray
    }
    exit 1
}

$scenario = Get-Content $ScenarioPath -Raw | ConvertFrom-Json

Write-Host "📋 Cenário encontrado:" -ForegroundColor Green
Write-Host "   Passos: $($scenario.steps.Count)" -ForegroundColor Yellow
Write-Host "   Duração gravada: $([math]::Round($scenario.duration, 2))s" -ForegroundColor Yellow
Write-Host ""

# Preparar payload
$payload = @{
    scenario = $scenario
    environment = "production"
    categories = @("functional", "visual")
} | ConvertTo-Json -Depth 10

# Executar via API
try {
    Write-Host "▶️ Executando cenário..." -ForegroundColor Yellow
    Write-Host ""
    
    $response = Invoke-WebRequest `
        -Uri "$ApiUrl/api/scenarios/execute" `
        -Method POST `
        -ContentType "application/json" `
        -Body $payload `
        -UseBasicParsing -TimeoutSec 300
    
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ EXECUÇÃO CONCLUÍDA" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Score:             $($result.score)/100" -ForegroundColor Green
    Write-Host "Passos executados: $($result.stepsExecuted)" -ForegroundColor Green
    Write-Host "Duração:           $($result.duration)s" -ForegroundColor Green
    Write-Host "Status:            $($result.status)" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ ERRO AO EXECUTAR" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    # Tentar endpoint alternativo
    Write-Host "Tentando endpoint alternativo..." -ForegroundColor Yellow
    
    try {
        # Criar cenário simplificado com ID
        $scenarioSimple = @{
            id = "temp-scenario-001"
            name = "Cenário Temporário"
            system = "AxHub"
            environment = "production"
            steps = $scenario.steps
        } | ConvertTo-Json -Depth 10
        
        # Salvar temporariamente
        $tempFile = "engine\scenarios\temp-scenario-001.json"
        $scenarioSimple | Out-File -FilePath $tempFile -Encoding UTF8
        
        Write-Host "✅ Cenário salvo como: $tempFile" -ForegroundColor Green
        Write-Host ""
        Write-Host "Para executar via API, use:" -ForegroundColor Yellow
        Write-Host "POST $ApiUrl/api/scenarios/temp-scenario-001/execute" -ForegroundColor Gray
        
    } catch {
        Write-Host "Erro ao salvar cenário temporário: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIM DA EXECUÇÃO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
