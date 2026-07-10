# ═══════════════════════════════════════════════════════════════════
# Script de Inicialização do AxionIA Ecosystem via Docker
# ═══════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AXION IA ECOSYSTEM - Docker Mode     " -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está instalado e rodando
Write-Host "Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    if ($LASTEXITCODE -ne 0) {
        throw "Docker não está instalado"
    }
    Write-Host "   ✓ Docker instalado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ ERRO: Docker não encontrado!" -ForegroundColor Red
    Write-Host "   Instale o Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar se Docker está rodando
Write-Host "Verificando se Docker está rodando..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker não está rodando"
    }
    Write-Host "   ✓ Docker está rodando" -ForegroundColor Green
} catch {
    Write-Host "   ✗ ERRO: Docker não está rodando!" -ForegroundColor Red
    Write-Host "   Inicie o Docker Desktop e tente novamente" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Modo de inicialização:" -ForegroundColor Cyan
Write-Host "  1) Serviços principais (Panel + API + Bancos)" -ForegroundColor White
Write-Host "  2) Todos os serviços (incluindo portais de documentação)" -ForegroundColor White
Write-Host ""
$modo = Read-Host "Escolha [1/2] (padrão: 1)"
if ([string]::IsNullOrWhiteSpace($modo)) {
    $modo = "1"
}

Write-Host ""
Write-Host "Iniciando serviços Docker..." -ForegroundColor Yellow
Write-Host ""

if ($modo -eq "2") {
    Write-Host "   → Modo: COMPLETO (com documentações)" -ForegroundColor Cyan
    docker compose --profile docs up -d --build
} else {
    Write-Host "   → Modo: PRINCIPAL (sem documentações)" -ForegroundColor Cyan
    docker compose up -d --build
}

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "✗ ERRO ao iniciar containers!" -ForegroundColor Red
    Write-Host "Verifique os logs: docker compose logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Aguardando inicialização dos serviços..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SERVIÇOS INICIADOS                   " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar status dos containers
$containers = docker compose ps --format json | ConvertFrom-Json

foreach ($container in $containers) {
    $name = $container.Name
    $status = $container.State
    $ports = $container.Publishers | ForEach-Object { "$($_.PublishedPort):$($_.TargetPort)" }
    
    if ($status -eq "running") {
        Write-Host "   ✓ $name" -ForegroundColor Green -NoNewline
        if ($ports) {
            Write-Host " → Porta $ports" -ForegroundColor White
        } else {
            Write-Host ""
        }
    } else {
        Write-Host "   ✗ $name → $status" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs DISPONÍVEIS:" -ForegroundColor White
Write-Host ""
Write-Host "   Panel:    http://localhost:3017" -ForegroundColor Cyan
Write-Host "   API:      http://localhost:3100" -ForegroundColor Cyan
Write-Host "   MongoDB:  localhost:27017" -ForegroundColor Cyan
Write-Host "   SQL:      localhost:1433" -ForegroundColor Cyan

if ($modo -eq "2") {
    Write-Host ""
    Write-Host "   AxHub.Docs:   http://localhost:3010/AxHub.Docs" -ForegroundColor Cyan
    Write-Host "   AxTon.Docs:   http://localhost:3011/AxTon.Docs" -ForegroundColor Cyan
    Write-Host "   AxCross.Docs: http://localhost:3012/AxCross.Docs" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "COMANDOS ÚTEIS:" -ForegroundColor White
Write-Host ""
Write-Host "   Ver logs:          docker compose logs -f" -ForegroundColor Yellow
Write-Host "   Ver status:        docker compose ps" -ForegroundColor Yellow
Write-Host "   Reiniciar:         docker compose restart" -ForegroundColor Yellow
Write-Host "   Parar:             .\docker-parar.ps1" -ForegroundColor Yellow
Write-Host "   Encerrar:          .\docker-encerrar.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SISTEMA PRONTO!" -ForegroundColor Green
Write-Host ""
Write-Host "   Acesse: http://localhost:3017" -ForegroundColor White
Write-Host ""
