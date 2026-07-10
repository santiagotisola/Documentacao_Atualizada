# ============================================
# DEMONSTRAÇÃO COMPLETA - CUTI
# Como executar cenários gravados
# ============================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  CUTI - DEMONSTRAÇÃO COMPLETA DE USO                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PASSO 1: Verificar cenários disponíveis
# ============================================

Write-Host "📋 PASSO 1: Verificando cenários disponíveis..." -ForegroundColor Yellow
Write-Host ""

$cenarios = Get-ChildItem "api\engine\scenarios" -Recurse -Filter "scenario.json"

if ($cenarios.Count -eq 0) {
    Write-Host "❌ Nenhum cenário encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Para gravar um cenário:" -ForegroundColor Yellow
    Write-Host "   1. Acesse http://localhost:3017/cuti" -ForegroundColor Gray
    Write-Host "   2. Clique em 'Gravar Cenário'" -ForegroundColor Gray
    Write-Host "   3. Execute o fluxo desejado" -ForegroundColor Gray
    Write-Host "   4. Clique em 'Parar Gravação'" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Encontrados $($cenarios.Count) cenário(s):" -ForegroundColor Green
Write-Host ""

foreach ($cenario in $cenarios) {
    $content = Get-Content $cenario.FullName -Raw | ConvertFrom-Json
    Write-Host "   📁 $($cenario.Directory.Name)" -ForegroundColor Cyan
    Write-Host "      Passos: $($content.steps.Count)" -ForegroundColor Gray
    Write-Host "      Duração: $([math]::Round($content.duration, 2))s" -ForegroundColor Gray
    Write-Host "      Caminho: $($cenario.FullName)" -ForegroundColor DarkGray
    Write-Host ""
}

# ============================================
# PASSO 2: Preparar cenário para execução
# ============================================

Write-Host "📦 PASSO 2: Preparando cenário para execução..." -ForegroundColor Yellow
Write-Host ""

# Pegar o primeiro cenário encontrado
$cenarioPath = $cenarios[0].FullName
$cenarioContent = Get-Content $cenarioPath -Raw | ConvertFrom-Json

Write-Host "   Lendo: $($cenarios[0].Directory.Name)" -ForegroundColor Gray
Write-Host "   Passos: $($cenarioContent.steps.Count)" -ForegroundColor Gray
Write-Host ""

# Adicionar ID se não existir
if (-not $cenarioContent.id) {
    $cenarioContent | Add-Member -NotePropertyName "id" -NotePropertyValue "scenario-gravado-001" -Force
}

# Adicionar nome se não existir
if (-not $cenarioContent.name) {
    $cenarioContent | Add-Member -NotePropertyName "name" -NotePropertyValue "Cenário Gravado - $($cenarios[0].Directory.Name)" -Force
}

# Adicionar system se não existir
if (-not $cenarioContent.system) {
    $cenarioContent | Add-Member -NotePropertyName "system" -NotePropertyValue "AxHub" -Force
}

# Adicionar environment se não existir
if (-not $cenarioContent.environment) {
    $cenarioContent | Add-Member -NotePropertyName "environment" -NotePropertyValue "production" -Force
}

Write-Host "✅ Cenário preparado!" -ForegroundColor Green
Write-Host "   ID: $($cenarioContent.id)" -ForegroundColor Gray
Write-Host "   Nome: $($cenarioContent.name)" -ForegroundColor Gray
Write-Host "   Sistema: $($cenarioContent.system)" -ForegroundColor Gray
Write-Host ""

# ============================================
# PASSO 3: Mostrar opções de execução
# ============================================

Write-Host "🎯 PASSO 3: COMO EXECUTAR ESTE CENÁRIO" -ForegroundColor Yellow
Write-Host ""
Write-Host "Você tem 3 opções:" -ForegroundColor Cyan
Write-Host ""

# OPÇÃO 1: Via Interface CUTI
Write-Host "╭───────────────────────────────────────────────────────────────╮" -ForegroundColor DarkGray
Write-Host "│ OPÇÃO 1: Via Interface CUTI (Mais Visual) ⭐               │" -ForegroundColor Green
Write-Host "╰───────────────────────────────────────────────────────────────╯" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   1. Acesse: http://localhost:3017/cuti" -ForegroundColor Gray
Write-Host "   2. Configure:" -ForegroundColor Gray
Write-Host "      - Sistema: AxHub" -ForegroundColor DarkGray
Write-Host "      - Ambiente: Produção - Goiânia" -ForegroundColor DarkGray
Write-Host "   3. Selecione categorias (Funcional, Visual, etc.)" -ForegroundColor Gray
Write-Host "   4. Clique em 'Executar'" -ForegroundColor Gray
Write-Host ""

# OPÇÃO 2: Via PowerShell (Script pronto)
Write-Host "╭───────────────────────────────────────────────────────────────╮" -ForegroundColor DarkGray
Write-Host "│ OPÇÃO 2: Via Script PowerShell (Mais Rápido) ⚡            │" -ForegroundColor Green
Write-Host "╰───────────────────────────────────────────────────────────────╯" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Execute este comando:" -ForegroundColor Gray
Write-Host "   " -NoNewline
Write-Host ".\executar-cenario-gravado.ps1 -ScenarioPath `"$cenarioPath`"" -ForegroundColor Yellow
Write-Host ""

# OPÇÃO 3: Via API REST (Mais Técnico)
Write-Host "╭───────────────────────────────────────────────────────────────╮" -ForegroundColor DarkGray
Write-Host "│ OPÇÃO 3: Via API REST (Mais Controle) 🔧                   │" -ForegroundColor Green
Write-Host "╰───────────────────────────────────────────────────────────────╯" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Execute este comando:" -ForegroundColor Gray
Write-Host @"
   `$payload = @{
       scenario = (Get-Content "$cenarioPath" | ConvertFrom-Json)
       environment = "production"
       categories = @("functional", "visual")
   } | ConvertTo-Json -Depth 10

   Invoke-WebRequest ``
       -Uri "http://localhost:3100/api/scenarios/execute" ``
       -Method POST ``
       -ContentType "application/json" ``
       -Body `$payload ``
       -UseBasicParsing
"@ -ForegroundColor Yellow
Write-Host ""

# ============================================
# PASSO 4: Executar agora? (opcional)
# ============================================

Write-Host "╭───────────────────────────────────────────────────────────────╮" -ForegroundColor Cyan
Write-Host "│ 🚀 EXECUTAR AGORA?                                          │" -ForegroundColor Cyan
Write-Host "╰───────────────────────────────────────────────────────────────╯" -ForegroundColor Cyan
Write-Host ""

$resposta = Read-Host "Deseja executar o cenário agora? (S/N)"

if ($resposta -eq "S" -or $resposta -eq "s") {
    Write-Host ""
    Write-Host "▶️ Executando cenário..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
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
        Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║  ✅ EXECUÇÃO CONCLUÍDA COM SUCESSO!                         ║" -ForegroundColor Green
        Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Resultados:" -ForegroundColor Cyan
        Write-Host "   Score:             $($result.score)/100" -ForegroundColor Green
        Write-Host "   Passos executados: $($result.stepsExecuted)" -ForegroundColor Green
        Write-Host "   Duração:           $($result.duration)s" -ForegroundColor Green
        Write-Host "   Status:            $($result.status)" -ForegroundColor Green
        Write-Host ""
        
    } catch {
        Write-Host ""
        Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Red
        Write-Host "║  ❌ ERRO AO EXECUTAR                                        ║" -ForegroundColor Red
        Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Red
        Write-Host ""
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Possíveis causas:" -ForegroundColor Yellow
        Write-Host "   1. API não está rodando (porta 3100)" -ForegroundColor Gray
        Write-Host "   2. Cenário muito longo (timeout)" -ForegroundColor Gray
        Write-Host "   3. Sistema alvo indisponível" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📝 Tente executar via interface CUTI (Opção 1)" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "✅ OK! Use uma das 3 opções acima quando quiser executar." -ForegroundColor Green
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📚 PRÓXIMOS PASSOS                                          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ✅ Você já tem um cenário gravado ($($cenarioContent.steps.Count) passos)" -ForegroundColor Green
Write-Host "2. 🎯 Execute usando uma das 3 opções acima" -ForegroundColor Yellow
Write-Host "3. 📅 Configure agendamento em: http://localhost:3017/cuti/config" -ForegroundColor Yellow
Write-Host "4. 📊 Monitore resultados e ajuste conforme necessário" -ForegroundColor Yellow
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📖 GUIA COMPLETO: GUIA-COMPLETO-VALIDACAO-CUTI.md           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
