# DEMONSTRACAO COMPLETA - CUTI
# Como executar cenarios gravados

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CUTI - DEMONSTRACAO COMPLETA" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar cenarios disponiveis
Write-Host "PASSO 1: Verificando cenarios disponiveis..." -ForegroundColor Yellow
Write-Host ""

$cenarios = Get-ChildItem "api\engine\scenarios" -Recurse -Filter "scenario.json"

if ($cenarios.Count -eq 0) {
    Write-Host "Nenhum cenario encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "Encontrados $($cenarios.Count) cenario(s):" -ForegroundColor Green
Write-Host ""

foreach ($cenario in $cenarios) {
    $content = Get-Content $cenario.FullName -Raw | ConvertFrom-Json
    Write-Host "   Pasta: $($cenario.Directory.Name)" -ForegroundColor Cyan
    Write-Host "   Passos: $($content.steps.Count)" -ForegroundColor Gray
    Write-Host "   Duracao: $([math]::Round($content.duration, 2))s" -ForegroundColor Gray
    Write-Host "   Caminho: $($cenario.FullName)" -ForegroundColor DarkGray
    Write-Host ""
}

# Preparar cenario
Write-Host "PASSO 2: Preparando cenario para execucao..." -ForegroundColor Yellow
Write-Host ""

$cenarioPath = $cenarios[0].FullName
$cenarioContent = Get-Content $cenarioPath -Raw | ConvertFrom-Json

Write-Host "   Lendo: $($cenarios[0].Directory.Name)" -ForegroundColor Gray
Write-Host "   Passos: $($cenarioContent.steps.Count)" -ForegroundColor Gray
Write-Host ""

# Mostrar opcoes
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMO EXECUTAR ESTE CENARIO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "OPCAO 1: Via Interface CUTI" -ForegroundColor Green
Write-Host ""
Write-Host "   1. Acesse: http://localhost:3017/cuti" -ForegroundColor Gray
Write-Host "   2. Configure Sistema: AxHub" -ForegroundColor Gray
Write-Host "   3. Selecione categorias" -ForegroundColor Gray
Write-Host "   4. Clique em Executar" -ForegroundColor Gray
Write-Host ""

Write-Host "OPCAO 2: Via Script PowerShell" -ForegroundColor Green
Write-Host ""
$comando = ".\executar-cenario-gravado.ps1 -ScenarioPath '$cenarioPath'"
Write-Host "   $comando" -ForegroundColor Yellow
Write-Host ""

Write-Host "OPCAO 3: Via API REST" -ForegroundColor Green
Write-Host ""
Write-Host "   POST http://localhost:3100/api/scenarios/execute" -ForegroundColor Yellow
Write-Host "   Body: scenario JSON + categories" -ForegroundColor Gray
Write-Host ""

# Executar agora?
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$resposta = Read-Host "Deseja executar o cenario agora? (S/N)"

if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host ""
    Write-Host "Executando cenario..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Adicionar campos necessarios
        if (-not $cenarioContent.id) {
            $cenarioContent | Add-Member -NotePropertyName "id" -NotePropertyValue "scenario-001" -Force
        }
        if (-not $cenarioContent.name) {
            $cenarioContent | Add-Member -NotePropertyName "name" -NotePropertyValue "Cenario Gravado" -Force
        }
        if (-not $cenarioContent.system) {
            $cenarioContent | Add-Member -NotePropertyName "system" -NotePropertyValue "AxHub" -Force
        }
        
        $payload = @{
            scenario = $cenarioContent
            environment = "production"
            categories = @("functional", "visual")
        } | ConvertTo-Json -Depth 10
        
        $response = Invoke-WebRequest `
            -Uri "http://localhost:3100/api/scenarios/execute" `
            -Method POST `
            -ContentType "application/json" `
            -Body $payload `
            -UseBasicParsing -TimeoutSec 300
        
        $result = $response.Content | ConvertFrom-Json
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  EXECUCAO CONCLUIDA!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Score:             $($result.score)/100" -ForegroundColor Green
        Write-Host "Passos executados: $($result.stepsExecuted)" -ForegroundColor Green
        Write-Host "Duracao:           $($result.duration)s" -ForegroundColor Green
        Write-Host "Status:            $($result.status)" -ForegroundColor Green
        Write-Host ""
        
    } catch {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "  ERRO AO EXECUTAR" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Possiveis causas:" -ForegroundColor Yellow
        Write-Host "   1. API nao esta rodando (porta 3100)" -ForegroundColor Gray
        Write-Host "   2. Cenario muito longo (timeout)" -ForegroundColor Gray
        Write-Host "   3. Sistema alvo indisponivel" -ForegroundColor Gray
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "OK! Use uma das 3 opcoes acima quando quiser executar." -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PROXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Voce ja tem um cenario gravado ($($cenarioContent.steps.Count) passos)" -ForegroundColor Green
Write-Host "2. Execute usando uma das 3 opcoes acima" -ForegroundColor Yellow
Write-Host "3. Configure agendamento em: http://localhost:3017/cuti/config" -ForegroundColor Yellow
Write-Host "4. Monitore resultados e ajuste" -ForegroundColor Yellow
Write-Host ""
Write-Host "Guia completo: GUIA-COMPLETO-VALIDACAO-CUTI.md" -ForegroundColor Cyan
Write-Host ""
