# ========================================
# GUIA PRATICO - COMO USAR O CUTI
# Validacao completa e uso diario
# ========================================

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  CUTI - GUIA PRATICO DE USO                                 ║" -ForegroundColor Cyan
Write-Host "║  Seu cenario esta pronto! Vamos usar!                       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ========================================
# CENARIO DISPONIVEL
# ========================================

Write-Host "📦 CENARIO GRAVADO:" -ForegroundColor Yellow
Write-Host ""

$cenario = Get-Content "api\engine\scenarios\AxHub - production\scenario.json" -Raw | ConvertFrom-Json

Write-Host "   Nome: AxHub - Production" -ForegroundColor Green
Write-Host "   Passos: $($cenario.steps.Count)" -ForegroundColor Green
Write-Host "   Duracao: $([math]::Round($cenario.duration, 2))s ($(([math]::Round($cenario.duration / 60, 1))) minutos)" -ForegroundColor Green
Write-Host "   Categoria: $($cenario.category)" -ForegroundColor Green
Write-Host ""

Write-Host "   Primeiros passos gravados:" -ForegroundColor Gray
$cenario.steps | Select-Object -First 3 | ForEach-Object {
    Write-Host "   - $($_.description)" -ForegroundColor DarkGray
}
Write-Host "   ... e mais $($cenario.steps.Count - 3) passos" -ForegroundColor DarkGray
Write-Host ""

# ========================================
# OPCAO 1: INTERFACE WEB
# ========================================

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  OPCAO 1: VIA INTERFACE WEB (MAIS FACIL)                   ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "1. Acesse: http://localhost:3017/cuti" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Configure o sistema:" -ForegroundColor Cyan
Write-Host "   Sistema:     [AxHub]" -ForegroundColor Gray
Write-Host "   Ambiente:    [Producao - Goiania]" -ForegroundColor Gray
Write-Host "   URL:         https://goiania.axhub.axion.ws" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Selecione categorias (clique nos cards):" -ForegroundColor Cyan
Write-Host "   [✓] Funcional" -ForegroundColor Gray
Write-Host "   [✓] Visual" -ForegroundColor Gray
Write-Host "   [✓] Performance" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Clique no botao verde 'Executar'" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Aguarde o resultado (Score, Testes aprovados, etc.)" -ForegroundColor Cyan
Write-Host ""

# ========================================
# OPCAO 2: SCRIPT POWERSHELL
# ========================================

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  OPCAO 2: VIA POWERSHELL (MAIS RAPIDO)                     ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Execute este comando:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   .\executar-cenario-gravado.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ou especifique o caminho:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   .\executar-cenario-gravado.ps1 -ScenarioPath 'api\engine\scenarios\AxHub - production\scenario.json'" -ForegroundColor Yellow
Write-Host ""

# ========================================
# OPCAO 3: AGENDAMENTO AUTOMATICO
# ========================================

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  OPCAO 3: AGENDAMENTO AUTOMATICO (VALIDACAO 24/7)          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "1. Acesse: http://localhost:3017/cuti/config" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Clique em 'Nova Configuracao'" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Preencha:" -ForegroundColor Cyan
Write-Host "   Nome:        Validacao Diaria AxHub" -ForegroundColor Gray
Write-Host "   Agendamento: Diario as 06:00" -ForegroundColor Gray
Write-Host "   Sistema:     AxHub - Producao Goiania" -ForegroundColor Gray
Write-Host "   Categorias:  Funcional, Visual, Performance" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configure notificacoes (opcional):" -ForegroundColor Cyan
Write-Host "   [✓] Notificar em caso de falha" -ForegroundColor Gray
Write-Host "   Email: equipe@axiontecnologia.com.br" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Clique em 'Salvar Configuracao'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pronto! O sistema vai executar automaticamente todos os dias!" -ForegroundColor Green
Write-Host ""

# ========================================
# TESTE RAPIDO AGORA
# ========================================

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  QUER TESTAR AGORA?                                         ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

$resposta = Read-Host "Abrir interface CUTI no navegador? (S/N)"

if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host ""
    Write-Host "Abrindo http://localhost:3017/cuti ..." -ForegroundColor Green
    Start-Process "http://localhost:3017/cuti"
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  NAVEGADOR ABERTO!                                          ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Agora voce pode:" -ForegroundColor Yellow
    Write-Host "1. Selecionar categorias (clique nos cards coloridos)" -ForegroundColor Gray
    Write-Host "2. Clicar em 'Executar' (botao verde)" -ForegroundColor Gray
    Write-Host "3. Ver o resultado (Score, Testes, Duracao)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Para gravar NOVO cenario:" -ForegroundColor Yellow
    Write-Host "1. Clique em 'Gravar Cenario' (botao vermelho)" -ForegroundColor Gray
    Write-Host "2. Execute o fluxo no sistema" -ForegroundColor Gray
    Write-Host "3. Clique em 'Parar Gravacao'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RESUMO - O QUE VOCE TEM                                    ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Sistema rodando (Panel + API)" -ForegroundColor Green
Write-Host "✅ 1 cenario gravado (85 passos)" -ForegroundColor Green
Write-Host "✅ 3 formas de executar" -ForegroundColor Green
Write-Host "✅ Tela de configuracao pronta" -ForegroundColor Green
Write-Host "✅ Agendamento automatico disponivel" -ForegroundColor Green
Write-Host ""

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PROXIMOS PASSOS                                            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "DIA 1 (HOJE):" -ForegroundColor Yellow
Write-Host "1. Teste a execucao manual (via interface)" -ForegroundColor Gray
Write-Host "2. Veja o resultado e score" -ForegroundColor Gray
Write-Host "3. Grave 2-3 cenarios adicionais" -ForegroundColor Gray
Write-Host ""
Write-Host "DIA 2:" -ForegroundColor Yellow
Write-Host "1. Configure validacao automatica diaria" -ForegroundColor Gray
Write-Host "2. Configure notificacoes por email" -ForegroundColor Gray
Write-Host "3. Deixe rodando 24/7" -ForegroundColor Gray
Write-Host ""
Write-Host "DIA 3 EM DIANTE:" -ForegroundColor Yellow
Write-Host "1. Monitore resultados diarios" -ForegroundColor Gray
Write-Host "2. Ajuste cenarios conforme necessario" -ForegroundColor Gray
Write-Host "3. Expanda para outros sistemas (AxTon, AxCross)" -ForegroundColor Gray
Write-Host ""

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  DOCUMENTACAO COMPLETA                                      ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Guia completo: GUIA-COMPLETO-VALIDACAO-CUTI.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Scripts disponiveis:" -ForegroundColor Cyan
Write-Host "- .\demo-cuti.ps1               (demonstracao interativa)" -ForegroundColor Gray
Write-Host "- .\executar-cenario-gravado.ps1 (executa cenario especifico)" -ForegroundColor Gray
Write-Host "- .\validar-completo.ps1        (valida sistema completo)" -ForegroundColor Gray
Write-Host ""
