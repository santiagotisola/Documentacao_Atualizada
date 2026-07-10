$mapeamento = @{
    "axion-ia-panel\src\pages\CentralQualidade\components\Auditoria.jsx" = @{Antigo="DuplicidadeInfracoes"; Novo="Auditoria"}
    "axion-ia-panel\src\pages\CentralQualidade\components\Dashboard.jsx" = @{Antigo="Dashboard"; Novo="Dashboard"}
    "axion-ia-panel\src\pages\CentralRelatorios\components\Medicao.jsx" = @{Antigo="DiagnosticoMedicao"; Novo="Medicao"}
    "axion-ia-panel\src\pages\CentralRelatorios\components\Operacionais.jsx" = @{Antigo="RelatorioContrato"; Novo="Operacionais"}
    "axion-ia-panel\src\pages\CentralRelatorios\components\SLA.jsx" = @{Antigo="SlaCompliance"; Novo="SLA"}
    "axion-ia-panel\src\pages\CentralGestao\components\Backlog.jsx" = @{Antigo="ImplementationPlanner"; Novo="Backlog"}
    "axion-ia-panel\src\pages\CentralGestao\components\Roadmap.jsx" = @{Antigo="Roadmap"; Novo="Roadmap"}
    "axion-ia-panel\src\pages\CentralGestao\components\Specs.jsx" = @{Antigo="Specs"; Novo="Specs"}
    "axion-ia-panel\src\pages\CentralInteligencia\components\Analise.jsx" = @{Antigo="AnaliseEditalAvancada"; Novo="Analise"}
    "axion-ia-panel\src\pages\CentralInteligencia\components\Conformidade.jsx" = @{Antigo="Conformidade"; Novo="Conformidade"}
    "axion-ia-panel\src\pages\CentralInteligencia\components\Busca.jsx" = @{Antigo="BuscaEditaisGov"; Novo="Busca"}
    "axion-ia-panel\src\pages\CentralInteligencia\components\MultiProduto.jsx" = @{Antigo="AnalisaMultiProduto"; Novo="MultiProduto"}
}

foreach($arquivo in $mapeamento.Keys) {
    $info = $mapeamento[$arquivo]
    $conteudo = Get-Content $arquivo -Raw -Encoding UTF8
    
    # Substituir const/function nome
    $conteudo = $conteudo -replace "const $($info.Antigo) =", "const $($info.Novo) ="
    $conteudo = $conteudo -replace "function $($info.Antigo)\(", "function $($info.Novo)("
    $conteudo = $conteudo -replace "export default function $($info.Antigo)\(", "export default function $($info.Novo)("
    
    # Substituir export default
    $conteudo = $conteudo -replace "export default $($info.Antigo);", "export default $($info.Novo);"
    
    Set-Content $arquivo -Value $conteudo -NoNewline -Encoding UTF8
    Write-Host "✅ $($info.Novo) ajustado" -ForegroundColor Green
}

Write-Host "`n🎉 Todos os componentes ajustados!" -ForegroundColor Cyan
