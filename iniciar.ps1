# iniciar.ps1 - Liga todos os servicos do projeto Axion.Docs
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== AXION DOCS - Iniciando servicos ===" -ForegroundColor Cyan

# Encerra processos nas portas antes de iniciar
$portas = 3017, 3010, 3011, 3012, 3100
foreach ($p in $portas) {
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($conn) { Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Seconds 2
Write-Host "[OK] Portas limpas" -ForegroundColor Green

# Função auxiliar: inicia processo em nova janela PowerShell visível
function Start-Servico {
    param([string]$Titulo, [string]$Diretorio, [string]$Comando)
    Start-Process "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location '$Diretorio'; `$host.UI.RawUI.WindowTitle = '$Titulo'; $Comando" -WorkingDirectory $Diretorio
}

$d1 = Join-Path $ROOT "axion-ia-api"
Start-Servico -Titulo "axion-ia-api :3100" -Diretorio $d1 -Comando "node --env-file=.env src/app.js"
Write-Host "[..] axion-ia-api :3100 — aguardando resposta..." -ForegroundColor Yellow

# Aguarda a API responder de verdade (até 30 tentativas de 1s = 30s)
$apiOk = $false
for ($i = 1; $i -le 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3100/" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $apiOk = $true; break }
    } catch { }
    Write-Host "   $i/30..." -ForegroundColor DarkGray -NoNewline
}
Write-Host ""
if ($apiOk) {
    Write-Host "[OK] axion-ia-api :3100 respondendo" -ForegroundColor Green
} else {
    Write-Host "[!!] axion-ia-api nao respondeu em 30s — continuando mesmo assim" -ForegroundColor Red
}

$d2 = Join-Path $ROOT "axion-ia-panel"
Start-Servico -Titulo "axion-ia-panel :3017" -Diretorio $d2 -Comando "npm run dev"
Write-Host "[..] axion-ia-panel :3017" -ForegroundColor Yellow

$d3 = Join-Path $ROOT "AxHub\docs-portal"
Start-Servico -Titulo "AxHub.Docs :3010" -Diretorio $d3 -Comando "npm run serve -- --port 3010"
Write-Host "[..] AxHub.Docs :3010" -ForegroundColor Yellow

$d4 = Join-Path $ROOT "AxTon\docs-portal"
Start-Servico -Titulo "AxTon.Docs :3011" -Diretorio $d4 -Comando "npm run serve -- --port 3011"
Write-Host "[..] AxTon.Docs :3011" -ForegroundColor Yellow

$d5 = Join-Path $ROOT "AxCross\docs-portal"
Start-Servico -Titulo "AxCross.Docs :3012" -Diretorio $d5 -Comando "npm run serve -- --port 3012"
Write-Host "[..] AxCross.Docs :3012" -ForegroundColor Yellow

Write-Host "Aguardando 20s..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

Write-Host "--- STATUS ---" -ForegroundColor Cyan
$urls = @(
    "http://localhost:3100/api/doc/secoes/axhub|axion-ia-api  :3100",
    "http://localhost:3017/|axion-ia-panel :3017",
    "http://localhost:3010/AxHub.Docs/|AxHub.Docs     :3010",
    "http://localhost:3011/AxTon.Docs/|AxTon.Docs     :3011",
    "http://localhost:3012/AxCross.Docs/|AxCross.Docs   :3012"
)
foreach ($item in $urls) {
    $parts = $item.Split("|")
    $url = $parts[0]; $nome = $parts[1]
    try {
        $code = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop).StatusCode
        if ($code -eq 200) { Write-Host "  [OK] $nome" -ForegroundColor Green }
        else { Write-Host "  [??] $nome HTTP $code" -ForegroundColor Yellow }
    } catch {
        Write-Host "  [--] $nome ainda iniciando..." -ForegroundColor Red
    }
}

Write-Host "Abrindo no navegador..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:3017/helpdesk"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3010/AxHub.Docs/"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3011/AxTon.Docs/"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3012/AxCross.Docs/"

Write-Host "=== Todos iniciados! Para encerrar: encerrar.ps1 ===" -ForegroundColor Green
pause
