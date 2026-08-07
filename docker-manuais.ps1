param(
    [Parameter(Position = 0)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "rebuild", "check", "down", "help")]
    [string]$Action = "status",

    [Parameter(Position = 1)]
    [string]$Service = ""
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$composeFile = Join-Path $scriptRoot "docker-compose.yml"

function Write-Info([string]$Message) {
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
    Write-Host "[OK]   $Message" -ForegroundColor Green
}

function Write-WarnMsg([string]$Message) {
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-ErrMsg([string]$Message) {
    Write-Host "[ERRO] $Message" -ForegroundColor Red
}

function Ensure-Prerequisites {
    if (-not (Test-Path $composeFile)) {
        throw "Arquivo docker-compose.yml nao encontrado em: $composeFile"
    }

    $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $dockerCmd) {
        throw "Docker CLI nao encontrado no PATH. Instale o Docker Desktop."
    }

    try {
        docker info | Out-Null
    }
    catch {
        throw "Docker daemon indisponivel. Inicie o Docker Desktop e tente novamente."
    }
}

function Run-Compose([string[]]$ComposeArgs) {
    Push-Location $scriptRoot
    try {
        & docker compose -f $composeFile @ComposeArgs
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao executar: docker compose -f docker-compose.yml $($ComposeArgs -join ' ')"
        }
    }
    finally {
        Pop-Location
    }
}

function Show-Help {
@"
Uso:
  .\\docker-manuais.ps1 <acao> [servico]

Acoes:
  start      Sobe todos os manuais (build + detach)
  stop       Para todos os containers
  restart    Reinicia todos os containers
  status     Mostra status dos containers
  logs       Mostra logs (todos ou de um servico)
  rebuild    Rebuild completo e sobe novamente
  check      Testa HTTP dos 3 endpoints
  down       Remove containers e rede do compose
  help       Mostra esta ajuda

Servicos validos para 'logs':
  axcross-docs | axhub-docs | axton-docs

Exemplos:
  .\\docker-manuais.ps1 start
  .\\docker-manuais.ps1 logs axhub-docs
  .\\docker-manuais.ps1 check
"@ | Write-Host
}

function Check-Endpoints {
    $targets = @(
        @{ Name = "AxCross"; Url = "http://localhost:8081/AxCross.Docs/" },
        @{ Name = "AxHub";   Url = "http://localhost:8082/AxHub.Docs/" },
        @{ Name = "AxTon";   Url = "http://localhost:8083/AxTon.Docs/" }
    )

    $allOk = $true

    foreach ($t in $targets) {
        try {
            $resp = Invoke-WebRequest -Uri $t.Url -UseBasicParsing -TimeoutSec 15
            Write-Ok "$($t.Name): HTTP $($resp.StatusCode) - $($t.Url)"
        }
        catch {
            $allOk = $false
            Write-ErrMsg "$($t.Name): indisponivel - $($t.Url)"
        }
    }

    if (-not $allOk) {
        exit 1
    }
}

try {
    if ($Action -eq "help") {
        Show-Help
        exit 0
    }

    Ensure-Prerequisites

    switch ($Action) {
        "start" {
            Write-Info "Subindo manuais com build..."
            Run-Compose -ComposeArgs @("up", "-d", "--build")
            Run-Compose -ComposeArgs @("ps")
            Check-Endpoints
        }

        "stop" {
            Write-Info "Parando containers..."
            Run-Compose -ComposeArgs @("stop")
            Run-Compose -ComposeArgs @("ps")
        }

        "restart" {
            Write-Info "Reiniciando containers..."
            Run-Compose -ComposeArgs @("restart")
            Run-Compose -ComposeArgs @("ps")
            Check-Endpoints
        }

        "status" {
            Run-Compose -ComposeArgs @("ps")
        }

        "logs" {
            if ([string]::IsNullOrWhiteSpace($Service)) {
                Run-Compose -ComposeArgs @("logs", "--tail", "150")
            }
            else {
                Run-Compose -ComposeArgs @("logs", "--tail", "150", $Service)
            }
        }

        "rebuild" {
            Write-Info "Rebuild completo sem cache..."
            Run-Compose -ComposeArgs @("build", "--no-cache")
            Run-Compose -ComposeArgs @("up", "-d")
            Run-Compose -ComposeArgs @("ps")
            Check-Endpoints
        }

        "check" {
            Check-Endpoints
        }

        "down" {
            Write-Info "Derrubando ambiente (containers + rede)..."
            Run-Compose -ComposeArgs @("down")
        }
    }
}
catch {
    Write-ErrMsg $_.Exception.Message
    exit 1
}
