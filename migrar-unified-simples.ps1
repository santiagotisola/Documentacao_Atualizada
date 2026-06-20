# Script de Migracao Completa - Axion Unified
# Executa todas as fases de migracao automaticamente

param(
    [string]$SourcePath = "C:\Users\Santiago\Axiondocs\Axion.Docs",
    [string]$TargetPath = "C:\Projects\Axion-Unified",
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  AXION UNIFIED - MIGRACAO COMPLETA" -ForegroundColor Cyan
Write-Host "  Unificando toda a estrutura em um unico local" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Origem: $SourcePath" -ForegroundColor Yellow
Write-Host "Destino: $TargetPath" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "`nMODO DRY-RUN ATIVADO (nada sera alterado)`n" -ForegroundColor Magenta
}

# ============================================================
# FASE 1: CRIAR ESTRUTURA
# ============================================================

Write-Host "`n=== FASE 1: Criando Estrutura Unificada ===" -ForegroundColor Cyan

$directories = @(
    # Core
    "core\api\src\modules\investigators",
    "core\api\src\modules\analyzers",
    "core\api\src\modules\reporters",
    "core\api\src\modules\ai-processors\core",
    "core\api\src\modules\generators",
    "core\api\src\modules\connectors",
    "core\api\src\modules\repositories",
    "core\api\src\modules\system-services",
    "core\api\src\shared\middleware",
    "core\api\src\shared\utils",
    "core\api\src\shared\constants",
    "core\api\src\database\mongodb",
    "core\api\src\database\mssql",
    "core\api\tests\unit",
    "core\api\tests\integration",
    "core\panel\src\pages",
    "core\panel\src\components",
    "core\panel\public",
    "core\shared\types",
    
    # Products
    "products\axhub\database",
    "products\axhub\docs\user-guides",
    "products\axhub\docs\technical",
    "products\axhub\widgets",
    "products\axton\database",
    "products\axton\docs\user-guides",
    "products\axton\docs\technical",
    "products\axton\widgets",
    "products\axcross\database",
    "products\axcross\docs\user-guides",
    "products\axcross\docs\technical",
    "products\axcross\widgets",
    
    # Docs
    "docs\portals\axhub-portal",
    "docs\portals\axton-portal",
    "docs\portals\axcross-portal",
    "docs\guides\user-guides\axhub",
    "docs\guides\user-guides\axton",
    "docs\guides\user-guides\axcross",
    "docs\guides\developer-guides",
    "docs\guides\deployment-guides",
    "docs\analysis\technical-analysis",
    "docs\analysis\business-analysis",
    "docs\analysis\market-research",
    "docs\references\architecture",
    "docs\references\api-specs",
    "docs\references\database-schemas",
    
    # Data
    "data\databases\axhub",
    "data\databases\axton",
    "data\databases\axcross",
    "data\knowledge-base\embeddings",
    "data\knowledge-base\training-data",
    "data\uploads\images\axhub",
    "data\uploads\images\axton",
    "data\uploads\images\axcross",
    "data\uploads\documents",
    "data\uploads\contexts",
    "data\exports\reports\contracts",
    "data\exports\reports\flows",
    "data\exports\reports\hours",
    "data\exports\json",
    "data\exports\csv",
    
    # Tools
    "tools\scripts\powershell",
    "tools\scripts\node",
    "tools\scripts\python",
    "tools\automation\deployment",
    "tools\automation\backup",
    "tools\automation\monitoring",
    "tools\migration\helpers",
    
    # Resources
    "resources\media\images",
    "resources\media\videos",
    "resources\media\screenshots",
    "resources\pdfs\manuais",
    "resources\pdfs\contratos",
    "resources\pdfs\editais",
    "resources\templates\reports",
    "resources\templates\documents",
    
    # Config
    "config\environments\development",
    "config\environments\staging",
    "config\environments\production",
    "config\deployments\docker",
    "config\deployments\kubernetes",
    "config\backups\daily",
    "config\backups\weekly"
)

$totalDirs = $directories.Count
$currentDir = 0

foreach ($dir in $directories) {
    $currentDir++
    $fullPath = Join-Path $TargetPath $dir
    
    Write-Progress -Activity "Criando estrutura" -Status "$currentDir de $totalDirs" -PercentComplete (($currentDir / $totalDirs) * 100)
    
    if (-not $DryRun) {
        if (-not (Test-Path $fullPath)) {
            New-Item -Path $fullPath -ItemType Directory -Force | Out-Null
        }
    }
    
    Write-Host "  [OK] $dir" -ForegroundColor Green
}

Write-Host "`nEstrutura criada: $totalDirs diretorios" -ForegroundColor Green

# ============================================================
# FASE 2: MIGRAR API
# ============================================================

Write-Host "`n=== FASE 2: Migrando API ===" -ForegroundColor Cyan

$apiSource = Join-Path $SourcePath "axion-ia-api"
$apiDest = Join-Path $TargetPath "core\api"

if (Test-Path $apiSource) {
    if (-not $DryRun) {
        Copy-Item -Path "$apiSource\*" -Destination $apiDest -Recurse -Force -Exclude "node_modules",".logs","*.log"
    }
    Write-Host "  [OK] API migrada" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] API nao encontrada" -ForegroundColor Yellow
}

# ============================================================
# FASE 3: MIGRAR PANEL
# ============================================================

Write-Host "`n=== FASE 3: Migrando Panel ===" -ForegroundColor Cyan

$panelSource = Join-Path $SourcePath "axion-ia-panel"
$panelDest = Join-Path $TargetPath "core\panel"

if (Test-Path $panelSource) {
    if (-not $DryRun) {
        Copy-Item -Path "$panelSource\*" -Destination $panelDest -Recurse -Force -Exclude "node_modules","dist",".vite"
    }
    Write-Host "  [OK] Panel migrado" -ForegroundColor Green
} else {
    Write-Host "  [SKIP] Panel nao encontrado" -ForegroundColor Yellow
}

# ============================================================
# FASE 4: MIGRAR PORTAIS DOCUSAURUS
# ============================================================

Write-Host "`n=== FASE 4: Migrando Portais Docusaurus ===" -ForegroundColor Cyan

$portals = @(
    @{Name="AxHub.Docs"; Dest="axhub-portal"},
    @{Name="AxTon.Docs"; Dest="axton-portal"},
    @{Name="AxCross.Docs"; Dest="axcross-portal"}
)

foreach ($portal in $portals) {
    $portalSource = Join-Path $SourcePath $portal.Name
    $portalDest = Join-Path $TargetPath "docs\portals\$($portal.Dest)"
    
    if (Test-Path $portalSource) {
        if (-not $DryRun) {
            Copy-Item -Path "$portalSource\*" -Destination $portalDest -Recurse -Force -Exclude "node_modules","build",".docusaurus"
        }
        Write-Host "  [OK] $($portal.Name) migrado" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $($portal.Name) nao encontrado" -ForegroundColor Yellow
    }
}

# ============================================================
# FASE 5: MIGRAR DOCUMENTACAO
# ============================================================

Write-Host "`n=== FASE 5: Migrando Documentacao ===" -ForegroundColor Cyan

$docPatterns = @(
    @{Pattern="ANALISE-*.md"; Dest="docs\analysis\technical-analysis"},
    @{Pattern="MAPEAMENTO-*.md"; Dest="docs\references\architecture"},
    @{Pattern="DIAGRAMA-*.md"; Dest="docs\references\architecture"},
    @{Pattern="PLANO-*.md"; Dest="docs\references\architecture"},
    @{Pattern="CHECKLIST-*.md"; Dest="docs\references\architecture"},
    @{Pattern="GUIA-*.md"; Dest="docs\guides\developer-guides"},
    @{Pattern="README*.md"; Dest="docs\references\architecture"},
    @{Pattern="RESUMO-*.md"; Dest="docs\analysis\business-analysis"},
    @{Pattern="INDICE-*.md"; Dest="docs\references\architecture"},
    @{Pattern="NAVEGACAO-*.md"; Dest="docs\references\architecture"}
)

foreach ($pattern in $docPatterns) {
    $files = Get-ChildItem -Path $SourcePath -Filter $pattern.Pattern -File
    foreach ($file in $files) {
        $destPath = Join-Path $TargetPath $pattern.Dest
        if (-not $DryRun) {
            Copy-Item -Path $file.FullName -Destination $destPath -Force
        }
        Write-Host "  [OK] $($file.Name) -> $($pattern.Dest)" -ForegroundColor Green
    }
}

# ============================================================
# FASE 6: MIGRAR DADOS
# ============================================================

Write-Host "`n=== FASE 6: Migrando Dados ===" -ForegroundColor Cyan

# Knowledge Base
$kbSource = Join-Path $SourcePath "axion-ia-api\src\data"
$kbDest = Join-Path $TargetPath "data\knowledge-base"

if (Test-Path $kbSource) {
    if (-not $DryRun) {
        Copy-Item -Path "$kbSource\*" -Destination $kbDest -Recurse -Force
    }
    Write-Host "  [OK] Knowledge Base migrada" -ForegroundColor Green
}

# Uploads
$uploadsSource = Join-Path $SourcePath "axion-ia-api\src\uploads"
$uploadsDest = Join-Path $TargetPath "data\uploads"

if (Test-Path $uploadsSource) {
    if (-not $DryRun) {
        Copy-Item -Path "$uploadsSource\*" -Destination $uploadsDest -Recurse -Force
    }
    Write-Host "  [OK] Uploads migrados" -ForegroundColor Green
}

# ============================================================
# FASE 7: MIGRAR SCRIPTS
# ============================================================

Write-Host "`n=== FASE 7: Migrando Scripts ===" -ForegroundColor Cyan

$scriptPatterns = @(
    @{Pattern="*.ps1"; Dest="tools\scripts\powershell"},
    @{Pattern="*.mjs"; Dest="tools\scripts\node"},
    @{Pattern="*.js"; Dest="tools\scripts\node"; Filter="analisar*,comparar*,converter*"},
    @{Pattern="*.py"; Dest="tools\scripts\python"}
)

foreach ($pattern in $scriptPatterns) {
    $files = Get-ChildItem -Path $SourcePath -Filter $pattern.Pattern -File
    foreach ($file in $files) {
        # Filtrar alguns arquivos especificos
        if ($pattern.Filter) {
            $shouldInclude = $false
            foreach ($filterWord in $pattern.Filter.Split(',')) {
                if ($file.Name -like "*$filterWord*") {
                    $shouldInclude = $true
                    break
                }
            }
            if (-not $shouldInclude) { continue }
        }
        
        $destPath = Join-Path $TargetPath $pattern.Dest
        if (-not $DryRun) {
            Copy-Item -Path $file.FullName -Destination $destPath -Force
        }
        Write-Host "  [OK] $($file.Name) -> $($pattern.Dest)" -ForegroundColor Green
    }
}

# ============================================================
# FASE 8: CRIAR ARQUIVOS DE CONFIGURACAO
# ============================================================

Write-Host "`n=== FASE 8: Criando Configuracoes ===" -ForegroundColor Cyan

# Criar .gitignore
$gitignoreContent = @"
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/
.docusaurus/
.vite/

# Logs
*.log
.logs/

# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Backups
*.bak
*.backup
"@

if (-not $DryRun) {
    $gitignorePath = Join-Path $TargetPath ".gitignore"
    Set-Content -Path $gitignorePath -Value $gitignoreContent -Encoding UTF8
}
Write-Host "  [OK] .gitignore criado" -ForegroundColor Green

# Criar README.md
$readmeContent = @"
# Axion Unified Platform

Estrutura unificada do ecossistema Axion Intelligence Platform.

## Estrutura

- **core/** - Aplicacoes principais (API + Panel)
- **products/** - Produtos (AxHub, AxTon, AxCross)
- **docs/** - Documentacao completa
- **data/** - Base de dados unificada
- **tools/** - Scripts e ferramentas
- **resources/** - Recursos multimidia
- **config/** - Configuracoes

## Inicio Rapido

### API
``````powershell
cd core\api
npm install
npm run dev
``````

### Panel
``````powershell
cd core\panel
npm install
npm run dev
``````

## Documentacao

Consulte os guias em ``docs/`` para mais informacoes.
"@

if (-not $DryRun) {
    $readmePath = Join-Path $TargetPath "README.md"
    Set-Content -Path $readmePath -Value $readmeContent -Encoding UTF8
}
Write-Host "  [OK] README.md criado" -ForegroundColor Green

# ============================================================
# RESUMO FINAL
# ============================================================

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  MIGRACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "Estrutura unificada criada em:" -ForegroundColor Yellow
Write-Host "  $TargetPath`n" -ForegroundColor White

Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  1. cd $TargetPath" -ForegroundColor White
Write-Host "  2. git init" -ForegroundColor White
Write-Host "  3. cd core\api && npm install" -ForegroundColor White
Write-Host "  4. cd core\panel && npm install" -ForegroundColor White
Write-Host "  5. Atualizar paths nos arquivos .env`n" -ForegroundColor White

if ($DryRun) {
    Write-Host "MODO DRY-RUN: Nenhuma alteracao foi feita." -ForegroundColor Magenta
    Write-Host "Execute sem -DryRun para realizar a migracao real.`n" -ForegroundColor Magenta
}
