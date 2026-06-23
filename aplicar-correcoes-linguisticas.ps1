# Script para aplicar TODAS as correções linguísticas via API
$baseUrl = "http://localhost:3100"

Write-Host "`n=== APLICANDO CORREÇÕES LINGUÍSTICAS ===" -ForegroundColor Cyan

# Passo 1: Scan
Write-Host "`n[1/4] Fazendo scan..." -ForegroundColor Yellow
$scanBody = '{"projects":["axion-ia-panel","axion-ia-api","AxHub.Docs","AxTon.Docs","AxCross.Docs"],"scope":"complete"}'
$scan = Invoke-RestMethod -Uri "$baseUrl/api/linguistic/scan" -Method POST -Body $scanBody -ContentType "application/json"

Write-Host "Issues encontrados: $($scan.stats.total_issues)" -ForegroundColor Green

if ($scan.stats.total_issues -eq 0) {
    Write-Host "Nenhum issue! Sistema perfeito!" -ForegroundColor Green
    exit
}

# Passo 2: Extrair fixes
Write-Host "`n[2/4] Extraindo fixes..." -ForegroundColor Yellow
$fixes = @()
foreach ($proj in $scan.projects) {
    foreach ($f in $proj.files) {
        foreach ($iss in $f.issues) {
            $fixes += @{
                project = $proj.name
                file = $f.file
                line = $iss.line
                original = $iss.text
                fixed = $iss.suggestion
                type = $iss.type
            }
        }
    }
}
Write-Host "Total de fixes: $($fixes.Count)" -ForegroundColor Green

# Passo 3: Aplicar
Write-Host "`n[3/4] Aplicando correções..." -ForegroundColor Yellow
$fixBodyObj = @{ fixes = $fixes }
$fixBody = $fixBodyObj | ConvertTo-Json -Depth 10
$result = Invoke-RestMethod -Uri "$baseUrl/api/linguistic/fix-batch" -Method POST -Body $fixBody -ContentType "application/json"

Write-Host "Sucesso: $($result.success) | Falhas: $($result.failed)" -ForegroundColor Green

# Passo 4: Verificar
Write-Host "`n[4/4] Verificando resultado..." -ForegroundColor Yellow
$verify = Invoke-RestMethod -Uri "$baseUrl/api/linguistic/scan" -Method POST -Body $scanBody -ContentType "application/json"

Write-Host "`n=== RESULTADO FINAL ===" -ForegroundColor Cyan
Write-Host "Issues restantes: $($verify.stats.total_issues)" -ForegroundColor $(if ($verify.stats.total_issues -eq 0) {"Green"} else {"Yellow"})
Write-Host "Qualidade: $($verify.stats.quality_score)%" -ForegroundColor Green

if ($verify.stats.total_issues -eq 0) {
    Write-Host "`nSUCESSO TOTAL!" -ForegroundColor Green
}
Write-Host ""
