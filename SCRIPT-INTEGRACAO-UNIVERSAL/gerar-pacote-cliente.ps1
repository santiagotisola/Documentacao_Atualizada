# ================================================
# GERAR PACOTE PARA ENVIO AO CLIENTE
# ================================================
# Executa: .\gerar-pacote-cliente.ps1
# Saida: ./entrega/AxionIA-Integracao-Universal-v1.0.zip

$ErrorActionPreference = "Stop"
$versao = "1.0.0"
$nomeArquivo = "AxionIA-Integracao-Universal-v$versao"
$pastaOrigem = "$PSScriptRoot\src"
$pastaSaida = "$PSScriptRoot\entrega"
$pastaTemp = "$pastaSaida\$nomeArquivo"

Write-Host ""
Write-Host "[BUILD] Gerando pacote para cliente..." -ForegroundColor Cyan
Write-Host "        Versao: $versao" -ForegroundColor Gray

# Limpar build anterior
if (Test-Path $pastaSaida) { Remove-Item $pastaSaida -Recurse -Force }
New-Item -ItemType Directory -Path $pastaTemp -Force | Out-Null

# Copiar codigo fonte
Write-Host "[COPY]  Copiando arquivos..." -ForegroundColor Yellow
Copy-Item "$pastaOrigem\package.json" "$pastaTemp\" -Force
Copy-Item "$pastaOrigem\.env.example" "$pastaTemp\" -Force
Copy-Item "$pastaOrigem\app.js" "$pastaTemp\" -Force
Copy-Item "$pastaOrigem\README.md" "$pastaTemp\" -Force
Copy-Item "$pastaOrigem\middlewares" "$pastaTemp\middlewares" -Recurse -Force
Copy-Item "$pastaOrigem\modules" "$pastaTemp\modules" -Recurse -Force

# Copiar arquivos raiz relevantes
Copy-Item "$PSScriptRoot\Dockerfile" $pastaTemp -ErrorAction SilentlyContinue
Copy-Item "$PSScriptRoot\docker-compose.yml" $pastaTemp -ErrorAction SilentlyContinue
Copy-Item "$PSScriptRoot\.dockerignore" $pastaTemp -ErrorAction SilentlyContinue
Copy-Item "$PSScriptRoot\.gitignore" $pastaTemp -ErrorAction SilentlyContinue

# Copia adicional do .env.example como .txt para facilitar visualizacao
if (Test-Path "$pastaTemp\.env.example") {
    Copy-Item "$pastaTemp\.env.example" "$pastaTemp\ENV-EXAMPLE.txt"
}

# Gerar ZIP
Write-Host "[ZIP]   Compactando..." -ForegroundColor Yellow
$zipPath = "$pastaSaida\$nomeArquivo.zip"
Compress-Archive -Path $pastaTemp -DestinationPath $zipPath -Force

# Gerar hash para integridade
$hash = (Get-FileHash $zipPath -Algorithm SHA256).Hash
$tamanhoBytes = (Get-Item $zipPath).Length
$tamanhoMB = [math]::Round($tamanhoBytes / 1MB, 2)

Write-Host ""
Write-Host "[OK]    Pacote gerado com sucesso!" -ForegroundColor Green
Write-Host "        Arquivo: $zipPath" -ForegroundColor White
Write-Host "        Tamanho: ${tamanhoMB}MB" -ForegroundColor White
Write-Host "        SHA256:  $hash" -ForegroundColor White
Write-Host ""

# Resumo para e-mail
$dataAtual = Get-Date -Format "dd/MM/yyyy HH:mm"
$resumo = @"
===================================================
  ENTREGA: AxionIA - Integracao Universal v$versao
===================================================

Arquivo: $nomeArquivo.zip
Tamanho: ${tamanhoMB}MB
SHA256:  $hash
Data:    $dataAtual

INSTRUCOES RAPIDAS:
  1. Extrair o ZIP
  2. Copiar .env.example para .env
  3. Preencher credenciais (MongoDB, OpenAI, etc.)
  4. Executar: docker compose up -d
     OU: npm install && npm run dev

DOCUMENTACAO: README.md incluso no pacote

===================================================
"@

$resumo | Out-File "$pastaSaida\ENTREGA-INFO.txt" -Encoding UTF8
Write-Host $resumo
Write-Host "[INFO]  Resumo salvo em: $pastaSaida\ENTREGA-INFO.txt" -ForegroundColor Cyan
Write-Host ""
