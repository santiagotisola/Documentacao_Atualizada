$ErrorActionPreference = "Stop"

Write-Host "=== TESTANDO GERENCIADOR DE VALIDACAO ===" -ForegroundColor Cyan

# Teste 1: Iniciar validação
Write-Host "`n[1] Iniciando validação..." -ForegroundColor Yellow
$body1 = @{
    systemUrl = "https://economia.axhub.axion.ws/"
    systemName = "AxHub - IPEM-PE Economia"
    validationType = "ui"
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:3100/api/validation/start" -Method POST -Body $body1 -ContentType "application/json"
    Write-Host "[OK] Validacao iniciada!" -ForegroundColor Green
    Write-Host "ValidationId: $($response1.validationId)" -ForegroundColor White
    $validationId = $response1.validationId
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Teste 2: Listar validações
Write-Host "`n[2] Listando validacoes..." -ForegroundColor Yellow
try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:3100/api/validation/list" -Method GET
    Write-Host "[OK] Total de validacoes: $($response2.total)" -ForegroundColor Green
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Obter relatório (se tiver ID)
if ($validationId) {
    Write-Host "`n[3] Obtendo relatorio..." -ForegroundColor Yellow
    try {
        $response3 = Invoke-RestMethod -Uri "http://localhost:3100/api/validation/report/$validationId" -Method GET
        Write-Host "[OK] Status: $($response3.status)" -ForegroundColor Green
        Write-Host "System URL: $($response3.systemUrl)" -ForegroundColor White
        Write-Host "System Name: $($response3.systemName)" -ForegroundColor White
        Write-Host "Type: $($response3.validationType)" -ForegroundColor White
    } catch {
        Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== TESTES CONCLUIDOS ===" -ForegroundColor Cyan
