# APRESENTACAO: Reutilizar Cenario Gravado
Clear-Host
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  APRESENTACAO: Reutilizar Cenario Gravado - CUTI" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Abrindo navegador em http://localhost:3017/cuti..." -ForegroundColor Yellow
Write-Host ""
Start-Process "http://localhost:3017/cuti"
Start-Sleep -Seconds 3
Write-Host "OK - Navegador aberto!" -ForegroundColor Green
Write-Host ""
Write-Host "DEMONSTRACAO DA FUNCIONALIDADE:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Na pagina do CUTI, role para baixo" -ForegroundColor White
Write-Host "2. Encontre a secao: Reutilizar Cenario Gravado" -ForegroundColor Yellow
Write-Host "3. Voce vera:" -ForegroundColor White
Write-Host "   - Dropdown para selecionar cenario" -ForegroundColor Gray
Write-Host "   - Input para nova URL" -ForegroundColor Gray
Write-Host "   - Checkboxes para validacoes" -ForegroundColor Gray
Write-Host "   - Botao Executar Cenario" -ForegroundColor Gray
Write-Host ""
Write-Host "4 EXEMPLOS DE USO (cards visuais):" -ForegroundColor Cyan
Write-Host "   1. Testar em Homologacao" -ForegroundColor Green
Write-Host "   2. Validar Outro Cliente" -ForegroundColor Blue
Write-Host "   3. Executar Validacoes Diferentes" -ForegroundColor Magenta
Write-Host "   4. Regressao Automatica" -ForegroundColor Yellow
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "  FUNCIONALIDADE IMPLEMENTADA E PRONTA PARA USO!" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host ""
Read-Host "Pressione ENTER para finalizar"