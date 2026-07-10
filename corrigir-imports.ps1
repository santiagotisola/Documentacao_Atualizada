$arquivos = @(
    "axion-ia-panel\src\pages\HubAnalise\components\Imagens.jsx",
    "axion-ia-panel\src\pages\CentralAtendimento\components\WhatsApp.jsx",
    "axion-ia-panel\src\pages\CentralGestao\components\Specs.jsx",
    "axion-ia-panel\src\pages\CentralGestao\components\Roadmap.jsx",
    "axion-ia-panel\src\pages\CentralValidacao\components\RevisaoIA.jsx",
    "axion-ia-panel\src\pages\CentralAtendimento\components\Helpdesk.jsx",
    "axion-ia-panel\src\pages\CentralRelatorios\components\SLA.jsx",
    "axion-ia-panel\src\pages\CentralRelatorios\components\Operacionais.jsx",
    "axion-ia-panel\src\pages\CentralInteligencia\components\MultiProduto.jsx",
    "axion-ia-panel\src\pages\CentralInteligencia\components\Conformidade.jsx",
    "axion-ia-panel\src\pages\CentralInteligencia\components\Busca.jsx",
    "axion-ia-panel\src\pages\CentralInteligencia\components\Analise.jsx"
)

$contador = 0
foreach($arquivo in $arquivos) {
    if (Test-Path $arquivo) {
        $conteudo = Get-Content $arquivo -Raw -Encoding UTF8
        $conteudo = $conteudo -replace 'from "../services', 'from "../../services'
        $conteudo = $conteudo -replace "from '../services", "from '../../services"
        Set-Content $arquivo -Value $conteudo -NoNewline -Encoding UTF8
        $contador++
        Write-Host "✅ $(Split-Path $arquivo -Leaf)" -ForegroundColor Green
    }
}

Write-Host "`n🎉 $contador arquivos corrigidos!" -ForegroundColor Cyan
