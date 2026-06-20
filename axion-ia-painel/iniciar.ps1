# 🚀 Script de Inicialização Rápida - Axion IA Painel
# Unifica e inicia frontend + backend automaticamente

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🎯 AXION IA PAINEL - Intelligence Hub v3.0.0          ║" -ForegroundColor Cyan
Write-Host "║   Projeto Unificado: Frontend + Backend                 ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"

# Verificar se estamos na pasta correta
if (-not (Test-Path ".\axion-ia-painel")) {
    Write-Host "❌ Pasta axion-ia-painel não encontrada!" -ForegroundColor Red
    Write-Host "   Execute este script na pasta raiz do projeto Axion.Docs`n" -ForegroundColor Yellow
    exit 1
}

cd axion-ia-painel

# Verificar Node.js
Write-Host "🔍 Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "   ✅ Node.js $nodeVersion instalado" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js não encontrado! Instale Node.js >= 18.0.0" -ForegroundColor Red
    exit 1
}

# Verificar se já tem dependências instaladas
if (-not (Test-Path ".\node_modules")) {
    Write-Host "`n📦 Instalando dependências..." -ForegroundColor Yellow
    Write-Host "   Isso pode levar alguns minutos...`n" -ForegroundColor Gray
    
    npm install
    
    Write-Host "`n📦 Instalando dependências do client..." -ForegroundColor Yellow
    cd client
    npm install
    cd ..
    
    Write-Host "`n📦 Instalando dependências do server..." -ForegroundColor Yellow
    cd server
    npm install
    cd ..
    
    Write-Host "`n✅ Todas as dependências instaladas!" -ForegroundColor Green
} else {
    Write-Host "   ✅ Dependências já instaladas" -ForegroundColor Green
}

# Verificar .env do servidor
if (-not (Test-Path ".\server\.env")) {
    Write-Host "`n⚠️  Arquivo .env não encontrado no servidor!" -ForegroundColor Yellow
    Write-Host "   Criando .env a partir do .env.example..." -ForegroundColor Gray
    
    if (Test-Path ".\server\.env.example") {
        Copy-Item ".\server\.env.example" ".\server\.env"
        Write-Host "   ✅ .env criado! Configure suas variáveis de ambiente." -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  .env.example não encontrado. Configure manualmente." -ForegroundColor Yellow
    }
}

Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                🚀 INICIANDO SERVIÇOS                     ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📡 Frontend (React + Vite):  http://localhost:3017" -ForegroundColor Cyan
Write-Host "🔧 Backend (Express API):    http://localhost:3100" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 AxHub Docs:               http://localhost:3010/AxHub.Docs" -ForegroundColor Magenta
Write-Host "📚 AxTon Docs:               http://localhost:3011/AxTon.Docs" -ForegroundColor Magenta
Write-Host "📚 AxCross Docs:             http://localhost:3012/AxCross.Docs" -ForegroundColor Magenta
Write-Host ""
Write-Host "🎯 Principal:                http://localhost:3017/" -ForegroundColor Yellow
Write-Host "✅ Validação Visual:         http://localhost:3017/visual-validation" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚡ Pressione Ctrl+C para parar os serviços`n" -ForegroundColor Gray

# Iniciar com concurrently
npm run dev
