# iniciar.ps1 - Liga todos os servicos do projeto Axion.Docs
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== AXION DOCS - Iniciando servicos ===" -ForegroundColor Cyan

$portas = 3001, 3010, 3011, 3012, 3100
foreach ($p in $portas) {
    $conn = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if ($conn) { Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Seconds 2
Write-Host "[OK] Portas limpas" -ForegroundColor Green

$d1 = Join-Path $ROOT "axion-ia-api"
Start-Process "cmd.exe" -ArgumentList "/c title axion-ia-api :3100 & cd /d `"$d1`" & node src/app.js"
Write-Host "[..] axion-ia-api :3100" -ForegroundColor Yellow
Start-Sleep -Seconds 4

$d2 = Join-Path $ROOT "axion-ia-panel"
Start-Process "cmd.exe" -ArgumentList "/c title axion-ia-panel :3001 & cd /d `"$d2`" & npm run dev"
Write-Host "[..] axion-ia-panel :3001" -ForegroundColor Yellow

$d3 = Join-Path $ROOT "AxHub\docs-portal"
Start-Process "cmd.exe" -ArgumentList "/c title AxHub.Docs :3010 & cd /d `"$d3`" & npm run serve -- --port 3010 --host 0.0.0.0"
Write-Host "[..] AxHub.Docs :3010" -ForegroundColor Yellow

$d4 = Join-Path $ROOT "AxTon\docs-portal"
Start-Process "cmd.exe" -ArgumentList "/c title AxTon.Docs :3011 & cd /d `"$d4`" & npm run serve -- --port 3011 --host 0.0.0.0"
Write-Host "[..] AxTon.Docs :3011" -ForegroundColor Yellow

$d5 = Join-Path $ROOT "AxCross\docs-portal"
Start-Process "cmd.exe" -ArgumentList "/c title AxCross.Docs :3012 & cd /d `"$d5`" & npm run serve -- --port 3012 --host 0.0.0.0"
Write-Host "[..] AxCross.Docs :3012" -ForegroundColor Yellow

Write-Host "Aguardando 20s..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

Write-Host "--- STATUS ---" -ForegroundColor Cyan
$urls = @(
    "http://localhost:3100/api/doc/secoes/axhub|axion-ia-api  :3100",
    "http://localhost:3001/|axion-ia-panel :3001",
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
Start-Process "http://localhost:3001/helpdesk"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3010/AxHub.Docs/"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3011/AxTon.Docs/"
Start-Sleep -Seconds 1
Start-Process "http://localhost:3012/AxCross.Docs/"

Write-Host "=== Todos iniciados! Para encerrar: encerrar.ps1 ===" -ForegroundColor Green
pause
