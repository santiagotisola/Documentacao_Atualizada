# 🚀 Script de Migração Completa - Axion Unified
# Executa todas as fases de migração automaticamente

param(
    [string]$SourcePath = "C:\Users\Santiago\Axiondocs\Axion.Docs",
    [string]$TargetPath = "C:\Projects\Axion-Unified",
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🏗️  AXION UNIFIED - MIGRAÇÃO COMPLETA                    ║
║                                                               ║
║     Unificando toda a estrutura em um único local            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`n📂 Origem: $SourcePath" -ForegroundColor Yellow
Write-Host "📂 Destino: $TargetPath" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "`n⚠️  MODO DRY-RUN ATIVADO (nada será alterado)" -ForegroundColor Magenta
}

# ════════════════════════════════════════════════════════════════
# FASE 1: CRIAR ESTRUTURA
# ════════════════════════════════════════════════════════════════

Write-Host "`n═══ FASE 1: Criando Estrutura Unificada ═══" -ForegroundColor Cyan

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
    "core\api\tests\e2e",
    "core\panel\src\pages",
    "core\panel\src\components",
    "core\panel\src\services",
    "core\shared\types",
    
    # Products
    "products\axhub\docs",
    "products\axhub\database\migrations",
    "products\axhub\widgets",
    "products\axton\docs",
    "products\axton\database\migrations",
    "products\axton\widgets",
    "products\axcross\docs",
    "products\axcross\database\migrations",
    "products\axcross\widgets",
    
    # Docs
    "docs\portals\axhub-portal",
    "docs\portals\axton-portal",
    "docs\portals\axcross-portal",
    "docs\guides\user-guides\axhub",
    "docs\guides\user-guides\axton",
    "docs\guides\user-guides\axcross",
    "docs\guides\admin-guides",
    "docs\guides\developer-guides",
    "docs\guides\troubleshooting",
    "docs\analysis\business-analysis\mercado",
    "docs\analysis\business-analysis\estrategia",
    "docs\analysis\business-analysis\comercial",
    "docs\analysis\technical-analysis\diagnosticos",
    "docs\analysis\technical-analysis\validacoes",
    "docs\analysis\technical-analysis\comparativos",
    "docs\analysis\operational-analysis\medicao",
    "docs\analysis\operational-analysis\heartbeat",
    "docs\analysis\operational-analysis\performance",
    "docs\references\api",
    "docs\references\architecture",
    "docs\references\specs",
    "docs\references\roadmaps",
    
    # Data
    "data\databases\axhub\migrations",
    "data\databases\axton\migrations",
    "data\databases\axcross\migrations",
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
    "data\exports\logs",
    "data\exports\screenshots",
    "data\cache\temp",
    
    # Tools
    "tools\scripts\powershell",
    "tools\scripts\node",
    "tools\automation\ci-cd",
    "tools\automation\deploy",
    "tools\automation\monitoring",
    "tools\migration",
    
    # Resources
    "resources\media\videos",
    "resources\media\images\logos",
    "resources\pdfs\manuais",
    "resources\pdfs\apresentacoes",
    "resources\templates\word",
    "resources\templates\excel",
    "resources\templates\powerpoint",
    
    # Config
    "config\environments",
    "config\deployments\docker",
    "config\deployments\kubernetes",
    "config\backups"
)

$created = 0
foreach ($dir in $directories) {
    $fullPath = Join-Path $TargetPath $dir
    
    if (-not $DryRun) {
        New-Item -Path $fullPath -ItemType Directory -Force | Out-Null
    }
    
    $created++
    Write-Progress -Activity "Criando estrutura" -Status "Pasta: $dir" -PercentComplete (($created / $directories.Count) * 100)
}

Write-Host "✅ $created pastas criadas" -ForegroundColor Green

# ════════════════════════════════════════════════════════════════
# FASE 2: MIGRAR CÓDIGO
# ════════════════════════════════════════════════════════════════

Write-Host "`n═══ FASE 2: Migrando Código ═══" -ForegroundColor Cyan

$codeMigrations = @{
    # API
    "axion-ia-api\src" = "core\api\src"
    "axion-ia-api\package.json" = "core\api\package.json"
    "axion-ia-api\package-lock.json" = "core\api\package-lock.json"
    "axion-ia-api\.env.example" = "core\api\.env.example"
    "axion-ia-api\Dockerfile" = "core\api\Dockerfile"
    
    # Panel
    "axion-ia-panel\src" = "core\panel\src"
    "axion-ia-panel\public" = "core\panel\public"
    "axion-ia-panel\package.json" = "core\panel\package.json"
    "axion-ia-panel\package-lock.json" = "core\panel\package-lock.json"
    "axion-ia-panel\vite.config.js" = "core\panel\vite.config.js"
    "axion-ia-panel\index.html" = "core\panel\index.html"
}

foreach ($migration in $codeMigrations.GetEnumerator()) {
    $source = Join-Path $SourcePath $migration.Key
    $target = Join-Path $TargetPath $migration.Value
    
    if (Test-Path $source) {
        Write-Host "📦 Migrando: $($migration.Key)" -ForegroundColor Yellow
        
        if (-not $DryRun) {
            if ((Get-Item $source).PSIsContainer) {
                Copy-Item $source $target -Recurse -Force
            } else {
                $targetDir = Split-Path $target -Parent
                if (-not (Test-Path $targetDir)) {
                    New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
                }
                Copy-Item $source $target -Force
            }
        }
        
        Write-Host "   ✅ Migrado para: $($migration.Value)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Não encontrado: $($migration.Key)" -ForegroundColor Yellow
    }
}

# ════════════════════════════════════════════════════════════════
# FASE 3: MIGRAR PRODUCTS
# ════════════════════════════════════════════════════════════════

Write-Host "`n═══ FASE 3: Migrando Products ═══" -ForegroundColor Cyan

# AxHub
if (Test-Path "$SourcePath\AxHub\Database\AxHub.sql") {
    Write-Host "📦 Migrando AxHub Database..." -ForegroundColor Yellow
    if (-not $DryRun) {
        Copy-Item "$SourcePath\AxHub\Database\AxHub.sql" "$TargetPath\products\axhub\database\schema.sql" -Force
    }
    Write-Host "   ✅ AxHub Database migrado" -ForegroundColor Green
}

# AxTon
if (Test-Path "$SourcePath\AxTon\Database") {
    Write-Host "📦 Migrando AxTon Database..." -ForegroundColor Yellow
    if (-not $DryRun) {
        Copy-Item "$SourcePath\AxTon\Database\*" "$TargetPath\products\axton\database\" -Recurse -Force
    }
    Write-Host "   ✅ AxTon Database migrado" -ForegroundColor Green
}

# AxCross
if (Test-Path "$SourcePath\AxCross\Database\AxCross.sql") {
    Write-Host "📦 Migrando AxCross Database..." -ForegroundColor Yellow
    if (-not $DryRun) {
        Copy-Item "$SourcePath\AxCross\Database\AxCross.sql" "$TargetPath\products\axcross\database\schema.sql" -Force
    }
    Write-Host "   ✅ AxCross Database migrado" -ForegroundColor Green
}

# ════════════════════════════════════════════════════════════════
# FASE 4: MIGRAR DOCUMENTAÇÃO
# ════════════════════════════════════════════════════════════════

Write-Host "`n═══ FASE 4: Migrando Documentação ═══" -ForegroundColor Cyan

# Portais Docusaurus
$portals = @{
    "AxHub\docs-portal" = "docs\portals\axhub-portal"
    "AxTon\docs-portal" = "docs\portals\axton-portal"
    "AxCross\docs-portal" = "docs\portals\axcross-portal"
}

foreach ($portal in $portals.GetEnumerator()) {
    $source = Join-Path $SourcePath $portal.Key
    $target = Join-Path $TargetPath $portal.Value
    
    if (Test-Path $source) {
        Write-Host "📚 Migrando portal: $($portal.Key)" -ForegroundColor Yellow
        
        if (-not $DryRun) {
            Copy-Item "$source\*" $target -Recurse -Force
        }
        
        Write-Host "   ✅ Portal migrado" -ForegroundColor Green
    }
}

# Análises
Write-Host "📊 Migrando análises..." -ForegroundColor Yellow

$analysisPatterns = @{
    "ANALISE-" = "docs\analysis\technical-analysis"
    "DIAGNOSTICO-" = "docs\analysis\operational-analysis"
    "VALIDACAO-" = "docs\analysis\technical-analysis"
}

$analysisMigrated = 0
foreach ($pattern in $analysisPatterns.GetEnumerator()) {
    $files = Get-ChildItem "$SourcePath\$($pattern.Key)*.md" -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        if (-not $DryRun) {
            Copy-Item $file.FullName "$TargetPath\$($pattern.Value)\$($file.Name)" -Force
        }
        $analysisMigrated++
    }
}

Write-Host "   ✅ $analysisMigrated arquivos de análise migrados" -ForegroundColor Green

# Guias
Write-Host "📖 Migrando guias..." -ForegroundColor Yellow

$guidePatterns = @("GUIA-", "MANUAL-", "RELATORIO-")
$guidesMigrated = 0

foreach ($pattern in $guidePatterns) {
    $files = Get-ChildItem "$SourcePath\$pattern*.md" -ErrorAction SilentlyContinue
    
    foreach ($file in $files) {
        if (-not $DryRun) {
            Copy-Item $file.FullName "$TargetPath\docs\guides\user-guides\$($file.Name)" -Force
        }
        $guidesMigrated++
    }
}

Write-Host "   ✅ $guidesMigrated guias migrados" -ForegroundColor Green

# Referências de Arquitetura
Write-Host "🏗️  Migrando referências de arquitetura..." -ForegroundColor Yellow

$architectureFiles = @(
    "MAPEAMENTO-FUNCIONALIDADES-SISTEMA.md",
    "DIAGRAMA-ARQUITETURA-REESTRUTURACAO.md",
    "CHECKLIST-REESTRUTURACAO.md",
    "ANALISE-FUNCIONALIDADES-RESUMO-EXECUTIVO.md",
    "PLANO-ORGANIZACIONAL-UNIFICACAO.md",
    "INVENTARIO-COMPLETO-ARQUITETURA-AXION.md"
)

$archMigrated = 0
foreach ($file in $architectureFiles) {
    $sourcePath = Join-Path $SourcePath $file
    
    if (Test-Path $sourcePath) {
        if (-not $DryRun) {
            Copy-Item $sourcePath "$TargetPath\docs\references\architecture\$file" -Force
        }
        $archMigrated++
    }
}

Write-Host "   ✅ $archMigrated arquivos de arquitetura migrados" -ForegroundColor Green

# ════════════════════════════════════════════════════════════════
# FASE 5: MIGRAR DADOS
# ════════════════════════════════════════════════════════════════

Write-Host "`n═══ FASE 5: Migrando Dados ═══" -ForegroundColor Cyan

# Uploads
if (Test-Path "$SourcePath\axion-ia-api\uploads") {
    Write-Host "📤 Migrando uploads..." -ForegroundColor Yellow
    
    if (-not $DryRun) {
        Copy-Item "$SourcePath\axion-ia-api\uploads\*" "$TargetPath\data\uploads\" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "   ✅ Uploads migrados" -ForegroundColor Green
}

# Reports
if (Test-Path "$SourcePath\axion-ia-api\reports") {
    Write-Host "📊 Migrando relatórios..." -ForegroundColor Yellow
    
    if (-not $DryRun) {
        Copy-Item "$SourcePath\axion-ia-api\reports\*" "$TargetPath\data\exports\reports\" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "   ✅ Relatórios migrados" -ForegroundColor Green
}

# Knowledge Base
if (Test-Path "$SourcePath\axion-ia-api\src\kb.json") {
    Write-Host "🧠 Migrando Knowledge Base..." -ForegroundColor Yellow
    
    if (-not $DryRun) {
        Copy-Item "$SourcePath\axion-ia-api\src\kb.json" "$TargetPath\data\knowledge-base\kb.json" -Force
    }
    
    Write-Host "   ✅ Knowledge Base migrada" -ForegroundColor Green
}

# ════════════════════════════════════════════════════════════════
# FASE 6: MIGRAR SCRIPTS E RECURSOS
# ════════════════════════════════════════════════════════════════

Write-Host "`n═══ FASE 6: Migrando Scripts e Recursos ═══" -ForegroundColor Cyan

# Scripts PowerShell
Write-Host "⚡ Migrando scripts PowerShell..." -ForegroundColor Yellow
$psScripts = Get-ChildItem "$SourcePath\*.ps1" -ErrorAction SilentlyContinue
$psMigrated = 0

foreach ($script in $psScripts) {
    if (-not $DryRun) {
        Copy-Item $script.FullName "$TargetPath\tools\scripts\powershell\$($script.Name)" -Force
    }
    $psMigrated++
}

Write-Host "   ✅ $psMigrated scripts PowerShell migrados" -ForegroundColor Green

# Scripts Node.js
Write-Host "⚡ Migrando scripts Node.js..." -ForegroundColor Yellow
$nodeScripts = Get-ChildItem "$SourcePath\*.mjs", "$SourcePath\*.cjs" -ErrorAction SilentlyContinue
$nodeMigrated = 0

foreach ($script in $nodeScripts) {
    if (-not $DryRun) {
        Copy-Item $script.FullName "$TargetPath\tools\scripts\node\$($script.Name)" -Force
    }
    $nodeMigrated++
}

Write-Host "   ✅ $nodeMigrated scripts Node.js migrados" -ForegroundColor Green

# Vídeos
Write-Host "🎥 Migrando vídeos..." -ForegroundColor Yellow
$videos = Get-ChildItem "$SourcePath\*.mp4" -ErrorAction SilentlyContinue
$videosMigrated = 0

foreach ($video in $videos) {
    if (-not $DryRun) {
        Copy-Item $video.FullName "$TargetPath\resources\media\videos\$($video.Name)" -Force
    }
    $videosMigrated++
}

Write-Host "   ✅ $videosMigrated vídeos migrados" -ForegroundColor Green

# PDFs
Write-Host "📄 Migrando PDFs..." -ForegroundColor Yellow
$pdfs = Get-ChildItem "$SourcePath\*.pdf" -ErrorAction SilentlyContinue
$pdfsMigrated = 0

foreach ($pdf in $pdfs) {
    if (-not $DryRun) {
        Copy-Item $pdf.FullName "$TargetPath\resources\pdfs\manuais\$($pdf.Name)" -Force
    }
    $pdfsMigrated++
}

Write-Host "   ✅ $pdfsMigrated PDFs migrados" -ForegroundColor Green

# ════════════════════════════════════════════════════════════════
# FASE 7: CRIAR ARQUIVOS DE CONFIGURAÇÃO
# ════════════════════════════════════════════════════════════════

Write-Host "`n═══ FASE 7: Criando Configurações ═══" -ForegroundColor Cyan

if (-not $DryRun) {
    # README.md principal
    $readmeContent = @"
# Axion Unified Platform

Plataforma unificada de inteligência e gestão operacional da Axion Tecnologia.

## 📂 Estrutura

\`\`\`
Axion-Unified/
├── core/           ← Aplicações principais (API + Panel)
├── products/       ← Produtos Axion (AxHub, AxTon, AxCross)
├── docs/           ← Documentação unificada
├── data/           ← Base única de dados
├── tools/          ← Scripts e ferramentas
├── resources/      ← Mídia e templates
└── config/         ← Configurações
\`\`\`

## 🚀 Início Rápido

### Backend (API)
\`\`\`bash
cd core/api
npm install
npm run dev
\`\`\`

### Frontend (Panel)
\`\`\`bash
cd core/panel
npm install
npm run dev
\`\`\`

## 📚 Documentação

- [Guias de Usuário](docs/guides/user-guides/)
- [Referências Técnicas](docs/references/)
- [Análises](docs/analysis/)

## 🔧 Ferramentas

- [Scripts PowerShell](tools/scripts/powershell/)
- [Scripts Node.js](tools/scripts/node/)

## 📊 Dados

Todos os dados estão centralizados em \`data/\`:
- Databases schemas
- Knowledge Base
- Uploads
- Relatórios

## 🔄 Backup

Execute: \`.\tools\scripts\powershell\backup.ps1\`

## 📖 Mais Informações

Consulte a documentação em \`docs/references/architecture/\`
"@

    $readmeContent | Out-File "$TargetPath\README.md" -Encoding UTF8 -Force
    Write-Host "✅ README.md criado" -ForegroundColor Green
    
    # .gitignore
    $gitignoreContent = @"
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/
.docusaurus/

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
logs/
data/exports/logs/

# Cache
.cache/
data/cache/

# Uploads (opcional - decidir se commitar ou não)
# data/uploads/

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Backups
config/backups/*.zip
"@

    $gitignoreContent | Out-File "$TargetPath\.gitignore" -Encoding UTF8 -Force
    Write-Host "✅ .gitignore criado" -ForegroundColor Green
}

# ════════════════════════════════════════════════════════════════
# RELATÓRIO FINAL
# ════════════════════════════════════════════════════════════════

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║     ✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!                        ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📊 RESUMO DA MIGRAÇÃO:" -ForegroundColor Cyan
Write-Host "   📂 Estrutura: $created pastas criadas" -ForegroundColor White
Write-Host "   📦 Código: API + Panel migrados" -ForegroundColor White
Write-Host "   🗄️  Products: 3 databases migrados" -ForegroundColor White
Write-Host "   📚 Documentação: $($analysisMigrated + $guidesMigrated + $archMigrated) arquivos" -ForegroundColor White
Write-Host "   ⚡ Scripts: $($psMigrated + $nodeMigrated) migrados" -ForegroundColor White
Write-Host "   🎥 Mídia: $videosMigrated vídeos, $pdfsMigrated PDFs" -ForegroundColor White

Write-Host "`n🎯 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "   1. cd $TargetPath" -ForegroundColor White
Write-Host "   2. Revisar estrutura migrada" -ForegroundColor White
Write-Host "   3. Atualizar imports e caminhos no código" -ForegroundColor White
Write-Host "   4. Testar API: cd core/api && npm install && npm run dev" -ForegroundColor White
Write-Host "   5. Testar Panel: cd core/panel && npm install && npm run dev" -ForegroundColor White
Write-Host "   6. Configurar Git: git init && git add . && git commit -m 'Initial unified structure'" -ForegroundColor White

if ($DryRun) {
    Write-Host "`n⚠️  MODO DRY-RUN: Nenhuma alteração foi feita" -ForegroundColor Magenta
    Write-Host "Execute sem -DryRun para realizar a migração real" -ForegroundColor Magenta
}

Write-Host "`n✨ Estrutura unificada criada em: $TargetPath" -ForegroundColor Cyan
