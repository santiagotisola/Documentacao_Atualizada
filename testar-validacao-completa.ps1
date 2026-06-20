$ErrorActionPreference = "Stop"

Write-Host "=== VALIDACAO COMPLETA: AxHub Economia ===" -ForegroundColor Cyan

# Passo 1: Iniciar validação
Write-Host "`n[PASSO 1] Iniciando validacao..." -ForegroundColor Yellow
$body1 = @{
    systemUrl = "https://economia.axhub.axion.ws/"
    systemName = "AxHub - IPEM-PE Economia"
    validationType = "full"
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri "http://localhost:3100/api/validation/start" -Method POST -Body $body1 -ContentType "application/json"
$validationId = $response1.validationId
Write-Host "[OK] ValidationId: $validationId" -ForegroundColor Green

# Passo 2: UI Discovery (Playwright)
Write-Host "`n[PASSO 2] Descobrindo UI com Playwright..." -ForegroundColor Yellow
Write-Host "Isso pode levar 30-60 segundos..." -ForegroundColor Gray
$body2 = @{
    validationId = $validationId
    url = "https://economia.axhub.axion.ws/"
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:3100/api/validation/discover-ui" -Method POST -Body $body2 -ContentType "application/json" -TimeoutSec 120
    Write-Host "[OK] Elementos descobertos: $($response2.totalElements)" -ForegroundColor Green
    Write-Host "  - Botoes: $($response2.elements.buttons.Count)" -ForegroundColor White
    Write-Host "  - Inputs: $($response2.elements.inputs.Count)" -ForegroundColor White
    Write-Host "  - Links: $($response2.elements.links.Count)" -ForegroundColor White
    Write-Host "  - Forms: $($response2.elements.forms.Count)" -ForegroundColor White
    Write-Host "  - Selects: $($response2.elements.selects.Count)" -ForegroundColor White
    Write-Host "  - Tabelas: $($response2.elements.tables.Count)" -ForegroundColor White
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Detalhes: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Passo 3: API Discovery
Write-Host "`n[PASSO 3] Descobrindo APIs..." -ForegroundColor Yellow
$body3 = @{
    validationId = $validationId
    url = "https://economia.axhub.axion.ws/"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:3100/api/validation/discover-api" -Method POST -Body $body3 -ContentType "application/json" -TimeoutSec 60
    Write-Host "[OK] Endpoints descobertos: $($response3.totalEndpoints)" -ForegroundColor Green
    Write-Host "  - GET: $($response3.getCount)" -ForegroundColor White
    Write-Host "  - POST: $($response3.postCount)" -ForegroundColor White
    Write-Host "  - PUT: $($response3.putCount)" -ForegroundColor White
    Write-Host "  - DELETE: $($response3.deleteCount)" -ForegroundColor White
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
}

# Passo 4: Relatório Final
Write-Host "`n[PASSO 4] Gerando relatorio final..." -ForegroundColor Yellow
$response4 = Invoke-RestMethod -Uri "http://localhost:3100/api/validation/report/$validationId" -Method GET
Write-Host "[OK] Relatorio gerado!" -ForegroundColor Green
Write-Host "`nRESUMO:" -ForegroundColor Cyan
Write-Host "  Sistema: $($response4.systemName)" -ForegroundColor White
Write-Host "  URL: $($response4.systemUrl)" -ForegroundColor White
Write-Host "  Status: $($response4.status)" -ForegroundColor White
Write-Host "  Duracao: $($response4.duration)" -ForegroundColor White
if ($response4.ui) {
    Write-Host "`n  UI Discovery:" -ForegroundColor Cyan
    Write-Host "    Total Elementos: $($response4.ui.totalElements)" -ForegroundColor White
    Write-Host "    Botoes: $($response4.ui.buttons)" -ForegroundColor White
    Write-Host "    Inputs: $($response4.ui.inputs)" -ForegroundColor White
    Write-Host "    Links: $($response4.ui.links)" -ForegroundColor White
    Write-Host "    Forms: $($response4.ui.forms)" -ForegroundColor White
}
if ($response4.api) {
    Write-Host "`n  API Discovery:" -ForegroundColor Cyan
    Write-Host "    Total Endpoints: $($response4.api.totalEndpoints)" -ForegroundColor White
    Write-Host "    GET: $($response4.api.getCount)" -ForegroundColor White
    Write-Host "    POST: $($response4.api.postCount)" -ForegroundColor White
}

Write-Host "`n=== VALIDACAO COMPLETA! ===" -ForegroundColor Green
Write-Host "ValidationId: $validationId" -ForegroundColor White
