# ========================================================================
# AXION IA UNIFIED - Script de Encerramento
# ========================================================================
# Encerra todos os servicos do monorepo unificado de forma segura
# ========================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  AXION IA UNIFIED - Encerrando Servicos" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

# ========================================================================
# 1. ENCERRAR JOBS DO POWERSHELL
# ========================================================================

Write-Host "Encerrando jobs..." -ForegroundColor Yellow

$jobs = Get-Job | Where-Object { $_.Name -like "Axion*" -or $_.Name -like "Ax*Docs" }

if ($jobs) {
    foreach ($job in $jobs) {
        Write-Host "   OK: Encerrando job: $($job.Name) (ID: $($job.Id))" -ForegroundColor Gray
        Stop-Job -Id $job.Id
        Remove-Job -Id $job.Id
    }
    Write-Host "   [OK] Jobs encerrados" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "   INFO: Nenhum job Axion encontrado" -ForegroundColor Gray
    Write-Host ""
}

# ========================================================================
# 2. LIBERAR PORTAS FORCADAMENTE
# ========================================================================

Write-Host "Liberando portas..." -ForegroundColor Yellow

$portas = @(3010, 3011, 3012, 3017, 3100)

foreach ($porta in $portas) {
    $processos = Get-NetTCPConnection -LocalPort $porta -ErrorAction SilentlyContinue | 
                 Select-Object -ExpandProperty OwningProcess -Unique
    
    foreach ($processId in $processos) {
        if ($processId) {
            try {
                $processo = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($processo) {
                    $nomeProcesso = $processo.ProcessName
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "   OK: Porta $porta liberada ($nomeProcesso PID: $processId)" -ForegroundColor Green
                }
            } catch {
                Write-Host "   AVISO: Erro ao liberar porta $porta" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "   [OK] Portas liberadas" -ForegroundColor Green
Write-Host ""

# ========================================================================
# 3. VERIFICACAO FINAL
# ========================================================================

Write-Host "Verificando status..." -ForegroundColor Cyan
Write-Host ""

foreach ($porta in $portas) {
    $status = Get-NetTCPConnection -LocalPort $porta -ErrorAction SilentlyContinue
    if ($status) {
        Write-Host "   AVISO: Porta $porta ainda em uso" -ForegroundColor Yellow
    } else {
        Write-Host "   OK: Porta $porta livre" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Gray
Write-Host ""
Write-Host "TODOS OS SERVICOS ENCERRADOS!" -ForegroundColor Green
Write-Host ""
Write-Host "   Para reiniciar: .\iniciar.ps1" -ForegroundColor Cyan
Write-Host ""

