# Script de Consolidacao Completa - Axion Master
# Migra TODOS os projetos para uma unica estrutura

param(
    [string]$TargetPath = "C:\Projects\Axion-Master",
    [switch]$DryRun = $false,
    [switch]$SkipBackup = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CONSOLIDACAO COMPLETA - AXION MASTER" -ForegroundColor Cyan
Write-Host "  Unificando 3 locais em 1 estrutura" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Destino: $TargetPath" -ForegroundColor Yellow

if ($DryRun) {
    Write-Host "MODO DRY-RUN ATIVADO (nada sera alterado)`n" -ForegroundColor Magenta
}

# Locais de origem
$origens = @{
    HelpDesk = "C:\Users\Santiago\HelpDesk"
    Documentacao = "C:\Users\Santiago\IdeaProjects\Documentacao_Atualizada"
    AxionDocs = "C:\Users\Santiago\Axiondocs\Axion.Docs"
}

# ====================================================================
# FASE 0: BACKUP DE SEGURANCA
# ====================================================================

if (-not $SkipBackup -and -not $DryRun) {
    Write-Host "`n=== FASE 0: Backup de Seguranca ===" -ForegroundColor Cyan
    
    $backupPath = "D:\Backups\Pre-Consolidacao-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
    
    Write-Host "Criando backup em: $backupPath" -ForegroundColor Yellow
    Write-Host "AVISO: Isso pode levar 30+ minutos para ~129GB..." -ForegroundColor Yellow
    
    $confirm = Read-Host "Deseja fazer backup de seguranca? (S/N)"
    if ($confirm -eq "S" -or $confirm -eq "s") {
        New-Item -Path $backupPath -ItemType Directory -Force | Out-Null
        
        foreach ($key in $origens.Keys) {
            $origem = $origens[$key]
            if (Test-Path $origem) {
                Write-Host "  Backup de $key..." -ForegroundColor Yellow
                $destBackup = Join-Path $backupPath $key
                Copy-Item -Path $origem -Destination $destBackup -Recurse -Force
                Write-Host "  [OK] $key backupeado" -ForegroundColor Green
            }
        }
        
        Write-Host "`nBackup completo: $backupPath" -ForegroundColor Green
    } else {
        Write-Host "Backup ignorado pelo usuario" -ForegroundColor Yellow
    }
}

# ====================================================================
# FASE 1: CRIAR ESTRUTURA DE DESTINO
# ====================================================================

Write-Host "`n=== FASE 1: Criando Estrutura de Destino ===" -ForegroundColor Cyan

$estrutura = @(
    # Applications
    "applications\axion-ia-api",
    "applications\axion-ia-panel",
    "applications\helpdesk-universal",
    "applications\script-integracao-universal",
    
    # Portals
    "portals\axhub-portal",
    "portals\axton-portal",
    "portals\axcross-portal",
    "portals\documentacao-atualizada",
    "portals\documentacao-helpdesk",
    
    # Projects
    "projects\auditoria-itscam",
    "projects\investigacao-duplicidade",
    
    # Documentation
    "documentation\analysis\technical",
    "documentation\analysis\business",
    "documentation\guides\user",
    "documentation\guides\developer",
    "documentation\references\architecture",
    "documentation\references\api-specs",
    
    # Data
    "data\knowledge-base\embeddings",
    "data\knowledge-base\training",
    "data\uploads\images",
    "data\uploads\documents",
    "data\exports\reports",
    "data\databases",
    
    # Media
    "media\videos",
    "media\images",
    "media\screenshots",
    
    # Resources
    "resources\pdfs",
    "resources\planilhas",
    "resources\templates",
    
    # Scripts
    "scripts\powershell",
    "scripts\node",
    "scripts\python",
    "scripts\automation",
    
    # Config
    "config\environments",
    "config\deployments",
    "config\backups",
    
    # Archive
    "archive\deprecated",
    "archive\legacy"
)

$totalDirs = $estrutura.Count
$currentDir = 0

foreach ($dir in $estrutura) {
    $currentDir++
    $fullPath = Join-Path $TargetPath $dir
    
    Write-Progress -Activity "Criando estrutura" -Status "$currentDir de $totalDirs" -PercentComplete (($currentDir / $totalDirs) * 100)
    
    if (-not $DryRun) {
        if (-not (Test-Path $fullPath)) {
            New-Item -Path $fullPath -ItemType Directory -Force | Out-Null
        }
    }
}

Write-Host "Estrutura criada: $totalDirs diretorios" -ForegroundColor Green

# ====================================================================
# FASE 2: MIGRACAO DE APLICACOES
# ====================================================================

Write-Host "`n=== FASE 2: Migrando Aplicacoes ===" -ForegroundColor Cyan

$aplicacoes = @(
    @{Origem="$($origens.AxionDocs)\axion-ia-api"; Destino="applications\axion-ia-api"},
    @{Origem="$($origens.AxionDocs)\axion-ia-panel"; Destino="applications\axion-ia-panel"},
    @{Origem="$($origens.HelpDesk)\helpdesk-universal"; Destino="applications\helpdesk-universal"},
    @{Origem="$($origens.AxionDocs)\SCRIPT-INTEGRACAO-UNIVERSAL"; Destino="applications\script-integracao-universal"}
)

foreach ($app in $aplicacoes) {
    if (Test-Path $app.Origem) {
        $destPath = Join-Path $TargetPath $app.Destino
        if (-not $DryRun) {
            Copy-Item -Path "$($app.Origem)\*" -Destination $destPath -Recurse -Force -Exclude "node_modules","dist","build",".logs"
        }
        Write-Host "  [OK] $($app.Destino)" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $($app.Origem) nao encontrado" -ForegroundColor Yellow
    }
}

# ====================================================================
# FASE 3: MIGRACAO DE PORTAIS
# ====================================================================

Write-Host "`n=== FASE 3: Migrando Portais ===" -ForegroundColor Cyan

$portais = @(
    @{Origem="$($origens.AxionDocs)\AxHub"; Destino="portals\axhub-portal"},
    @{Origem="$($origens.AxionDocs)\AxTon"; Destino="portals\axton-portal"},
    @{Origem="$($origens.AxionDocs)\AxCross"; Destino="portals\axcross-portal"},
    @{Origem="$($origens.Documentacao)"; Destino="portals\documentacao-atualizada"},
    @{Origem="$($origens.HelpDesk)\DOCUMENTACAO-HELPDESK"; Destino="portals\documentacao-helpdesk"}
)

foreach ($portal in $portais) {
    if (Test-Path $portal.Origem) {
        $destPath = Join-Path $TargetPath $portal.Destino
        if (-not $DryRun) {
            Copy-Item -Path "$($portal.Origem)\*" -Destination $destPath -Recurse -Force -Exclude "node_modules","build",".docusaurus","out"
        }
        Write-Host "  [OK] $($portal.Destino)" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $($portal.Origem) nao encontrado" -ForegroundColor Yellow
    }
}

# ====================================================================
# FASE 4: MIGRACAO DE PROJETOS ESPECIFICOS
# ====================================================================

Write-Host "`n=== FASE 4: Migrando Projetos Especificos ===" -ForegroundColor Cyan

$projetos = @(
    @{Origem="$($origens.AxionDocs)\auditoria-itscam"; Destino="projects\auditoria-itscam"},
    @{Origem="$($origens.AxionDocs)\investigacao-duplicidade-UJN9C59"; Destino="projects\investigacao-duplicidade"}
)

foreach ($projeto in $projetos) {
    if (Test-Path $projeto.Origem) {
        $destPath = Join-Path $TargetPath $projeto.Destino
        if (-not $DryRun) {
            Copy-Item -Path "$($projeto.Origem)\*" -Destination $destPath -Recurse -Force
        }
        Write-Host "  [OK] $($projeto.Destino)" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $($projeto.Origem) nao encontrado" -ForegroundColor Yellow
    }
}

# ====================================================================
# FASE 5: MIGRACAO DE DOCUMENTACAO
# ====================================================================

Write-Host "`n=== FASE 5: Migrando Documentacao ===" -ForegroundColor Cyan

$docPatterns = @(
    @{Pattern="ANALISE-*.md"; Destino="documentation\analysis\technical"},
    @{Pattern="GUIA-*.md"; Destino="documentation\guides\developer"},
    @{Pattern="PLANO-*.md"; Destino="documentation\references\architecture"},
    @{Pattern="DIAGRAMA-*.md"; Destino="documentation\references\architecture"},
    @{Pattern="MAPEAMENTO-*.md"; Destino="documentation\references\architecture"},
    @{Pattern="CHECKLIST-*.md"; Destino="documentation\references\architecture"},
    @{Pattern="RESUMO-*.md"; Destino="documentation\analysis\business"},
    @{Pattern="README*.md"; Destino="documentation\references\architecture"},
    @{Pattern="INDICE-*.md"; Destino="documentation\references\architecture"},
    @{Pattern="NAVEGACAO-*.md"; Destino="documentation\references\architecture"},
    @{Pattern="COMPARATIVO-*.md"; Destino="documentation\analysis\technical"},
    @{Pattern="EXECUCAO-*.md"; Destino="documentation\analysis\technical"}
)

$origem = $origens.AxionDocs

foreach ($pattern in $docPatterns) {
    if (Test-Path $origem) {
        $files = Get-ChildItem -Path $origem -Filter $pattern.Pattern -File
        foreach ($file in $files) {
            $destPath = Join-Path $TargetPath $pattern.Destino
            if (-not $DryRun) {
                Copy-Item -Path $file.FullName -Destination $destPath -Force
            }
            Write-Host "  [OK] $($file.Name)" -ForegroundColor Green
        }
    }
}

# ====================================================================
# FASE 6: MIGRACAO DE MIDIA
# ====================================================================

Write-Host "`n=== FASE 6: Migrando Midia ===" -ForegroundColor Cyan

$midia = @(
    @{Origem="$($origens.AxionDocs)\video-axton-frames"; Destino="media\videos\axton-frames"},
    @{Origem="$($origens.AxionDocs)\video-axton-narrado"; Destino="media\videos\axton-narrado"}
)

foreach ($item in $midia) {
    if (Test-Path $item.Origem) {
        $destPath = Join-Path $TargetPath $item.Destino
        if (-not $DryRun) {
            Write-Host "  Copiando videos (pode demorar)..." -ForegroundColor Yellow
            Copy-Item -Path "$($item.Origem)\*" -Destination $destPath -Recurse -Force
        }
        Write-Host "  [OK] $($item.Destino)" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $($item.Origem) nao encontrado" -ForegroundColor Yellow
    }
}

# ====================================================================
# FASE 7: MIGRACAO DE RECURSOS
# ====================================================================

Write-Host "`n=== FASE 7: Migrando Recursos ===" -ForegroundColor Cyan

$recursos = @(
    @{Origem="$($origens.AxionDocs)\pdfs"; Destino="resources\pdfs"},
    @{Origem="$($origens.AxionDocs)\Planilha"; Destino="resources\planilhas"}
)

foreach ($recurso in $recursos) {
    if (Test-Path $recurso.Origem) {
        $destPath = Join-Path $TargetPath $recurso.Destino
        if (-not $DryRun) {
            Copy-Item -Path "$($recurso.Origem)\*" -Destination $destPath -Recurse -Force
        }
        Write-Host "  [OK] $($recurso.Destino)" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] $($recurso.Origem) nao encontrado" -ForegroundColor Yellow
    }
}

# ====================================================================
# FASE 8: MIGRACAO DE SCRIPTS
# ====================================================================

Write-Host "`n=== FASE 8: Migrando Scripts ===" -ForegroundColor Cyan

# Scripts do Axion.Docs
$origem = $origens.AxionDocs
if (Test-Path $origem) {
    # PowerShell
    $psScripts = Get-ChildItem -Path $origem -Filter "*.ps1" -File
    foreach ($script in $psScripts) {
        $destPath = Join-Path $TargetPath "scripts\powershell"
        if (-not $DryRun) {
            Copy-Item -Path $script.FullName -Destination $destPath -Force
        }
        Write-Host "  [OK] $($script.Name) -> scripts\powershell" -ForegroundColor Green
    }
    
    # Node.js
    $nodeScripts = Get-ChildItem -Path $origem -Filter "*.mjs" -File
    foreach ($script in $nodeScripts) {
        $destPath = Join-Path $TargetPath "scripts\node"
        if (-not $DryRun) {
            Copy-Item -Path $script.FullName -Destination $destPath -Force
        }
        Write-Host "  [OK] $($script.Name) -> scripts\node" -ForegroundColor Green
    }
}

# Scripts do HelpDesk
$scriptsHelpDesk = "$($origens.HelpDesk)\SCRIPTS"
if (Test-Path $scriptsHelpDesk) {
    $destPath = Join-Path $TargetPath "scripts\helpdesk"
    if (-not $DryRun) {
        Copy-Item -Path "$scriptsHelpDesk\*" -Destination $destPath -Recurse -Force
    }
    Write-Host "  [OK] Scripts HelpDesk migrados" -ForegroundColor Green
}

# ====================================================================
# FASE 9: MIGRACAO DE DADOS
# ====================================================================

Write-Host "`n=== FASE 9: Migrando Dados ===" -ForegroundColor Cyan

$origemData = "$($origens.AxionDocs)\axion-ia-api\src\data"
$origemUploads = "$($origens.AxionDocs)\axion-ia-api\src\uploads"

if (Test-Path $origemData) {
    $destPath = Join-Path $TargetPath "data\knowledge-base"
    if (-not $DryRun) {
        Copy-Item -Path "$origemData\*" -Destination $destPath -Recurse -Force
    }
    Write-Host "  [OK] Knowledge Base migrado" -ForegroundColor Green
}

if (Test-Path $origemUploads) {
    $destPath = Join-Path $TargetPath "data\uploads"
    if (-not $DryRun) {
        Copy-Item -Path "$origemUploads\*" -Destination $destPath -Recurse -Force
    }
    Write-Host "  [OK] Uploads migrados" -ForegroundColor Green
}

# ====================================================================
# FASE 10: CRIAR ARQUIVOS DE CONFIGURACAO
# ====================================================================

Write-Host "`n=== FASE 10: Criando Arquivos de Configuracao ===" -ForegroundColor Cyan

# .gitignore
$gitignoreContent = @"
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/
.docusaurus/
.vite/
out/

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
*.iml

# Backups
*.bak
*.backup

# Archive
archive/
"@

if (-not $DryRun) {
    $gitignorePath = Join-Path $TargetPath ".gitignore"
    Set-Content -Path $gitignorePath -Value $gitignoreContent -Encoding UTF8
}
Write-Host "  [OK] .gitignore criado" -ForegroundColor Green

# README.md
$readmeContent = @"
# Axion Master - Estrutura Consolidada

Estrutura unificada de TODOS os projetos Axion.

## Estrutura

- **applications/** - Aplicacoes executaveis (APIs, frontends, sistemas)
- **portals/** - Portais de documentacao (Docusaurus, Writerside)
- **projects/** - Projetos especificos (auditorias, investigacoes)
- **documentation/** - Documentacao geral (analises, guias, referencias)
- **data/** - Base de dados e conhecimento
- **media/** - Videos, imagens, screenshots
- **resources/** - PDFs, planilhas, templates
- **scripts/** - Scripts e ferramentas
- **config/** - Configuracoes
- **archive/** - Arquivos antigos/deprecados

## Aplicacoes

### API
``````powershell
cd applications\axion-ia-api
npm install
npm run dev
``````

### Panel
``````powershell
cd applications\axion-ia-panel
npm install
npm run dev
``````

### HelpDesk Universal
``````powershell
cd applications\helpdesk-universal
npm install
npm run dev
``````

## Portais

### AxHub
``````powershell
cd portals\axhub-portal
npm install
npm start
``````

### AxTon
``````powershell
cd portals\axton-portal
npm install
npm start
``````

### AxCross
``````powershell
cd portals\axcross-portal
npm install
npm start
``````

## Documentacao

Consulte `documentation/` para analises, guias e referencias.

---

**Consolidado em:** $(Get-Date -Format 'yyyy-MM-dd')  
**Origem:** 3 locais unificados em 1 estrutura
"@

if (-not $DryRun) {
    $readmePath = Join-Path $TargetPath "README.md"
    Set-Content -Path $readmePath -Value $readmeContent -Encoding UTF8
}
Write-Host "  [OK] README.md criado" -ForegroundColor Green

# ====================================================================
# RESUMO FINAL
# ====================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  CONSOLIDACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Estrutura consolidada criada em:" -ForegroundColor Yellow
Write-Host "  $TargetPath`n" -ForegroundColor White

Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  1. cd $TargetPath" -ForegroundColor White
Write-Host "  2. git init" -ForegroundColor White
Write-Host "  3. Instalar dependencias:" -ForegroundColor White
Write-Host "     cd applications\axion-ia-api && npm install" -ForegroundColor White
Write-Host "     cd applications\axion-ia-panel && npm install" -ForegroundColor White
Write-Host "     cd applications\helpdesk-universal && npm install" -ForegroundColor White
Write-Host "  4. Atualizar paths nos arquivos .env" -ForegroundColor White
Write-Host "  5. Testar aplicacoes" -ForegroundColor White
Write-Host "  6. APOS VALIDACAO: remover locais antigos`n" -ForegroundColor White

if ($DryRun) {
    Write-Host "MODO DRY-RUN: Nenhuma alteracao foi feita." -ForegroundColor Magenta
    Write-Host "Execute sem -DryRun para realizar a consolidacao real.`n" -ForegroundColor Magenta
}

Write-Host "IMPORTANTE: Valide tudo antes de remover os locais antigos!" -ForegroundColor Red
