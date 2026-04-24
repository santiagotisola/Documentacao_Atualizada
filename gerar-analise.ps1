$ErrorActionPreference = "SilentlyContinue"
$base = "C:\Users\Santiago\Axiondocs\Axion.Docs"
$output = "$base\all-projects-analysis.txt"

Set-Location $base

$files = @()

# ─── Diretorios completos (recursivos) ────────────────────────────────────────
$dirs = @(
  "axion-ia-api\src",
  "axion-ia-panel\src",
  "AxHub\widget",
  "AxTon\widget",
  "AxCross\widget",
  "AxHub\docs-portal\docs",
  "AxTon\docs-portal\docs",
  "AxCross\docs-portal\docs",
  "AxHub\docs-portal\src",
  "AxTon\docs-portal\src",
  "AxCross\docs-portal\src"
)

foreach ($d in $dirs) {
  $full = Join-Path $base $d
  if (Test-Path $full) {
    $files += Get-ChildItem $full -Recurse -File | Where-Object {
      $_.Extension -match '\.(js|jsx|ts|css|json|md|html|sql)$' -and
      $_.FullName -notmatch 'node_modules|\\build\\|\.docusaurus'
    }
  }
}

# ─── Arquivos de banco de dados ───────────────────────────────────────────────
$dbFiles = @(
  "AxHub\Database\AxHub.sql",
  "AxHub\Database\relatorio-fluxo-implementacao.json",
  "AxTon\Database\DATABASE_MAPPING_AXTON.md",
  "AxCross\Database\AxCross.sql"
)

# ─── Arquivos de configuracao raiz dos portais ────────────────────────────────
$configFiles = @(
  "AxHub\docs-portal\docusaurus.config.ts",
  "AxHub\docs-portal\package.json",
  "AxHub\docs-portal\sidebars.ts",
  "AxHub\docs-portal\tsconfig.json",
  "AxHub\base-pesquisa-suporte.md",
  "AxTon\docs-portal\docusaurus.config.ts",
  "AxTon\docs-portal\package.json",
  "AxTon\docs-portal\sidebars.ts",
  "AxTon\docs-portal\tsconfig.json",
  "AxTon\base-pesquisa-suporte.md",
  "AxCross\docs-portal\docusaurus.config.ts",
  "AxCross\docs-portal\package.json",
  "AxCross\docs-portal\sidebars.ts",
  "AxCross\docs-portal\tsconfig.json",
  "AxCross\base-pesquisa-suporte.md",
  "axion-ia-api\package.json",
  "axion-ia-api\.env",
  "axion-ia-panel\package.json",
  "axion-ia-panel\index.html",
  "axion-ia-panel\vite.config.js"
)

# ─── Documentacao geral do projeto ────────────────────────────────────────────
$projectDocs = @(
  "MANUAL-AXIONIA.md",
  "BASE-PROJETO-DOCS.md",
  "openapi.json",
  "package.json"
)

$allSingleFiles = $dbFiles + $configFiles + $projectDocs

foreach ($r in $allSingleFiles) {
  $full = Join-Path $base $r
  if (Test-Path $full) { $files += Get-Item $full }
}

# ─── Deduplicar e ordenar ─────────────────────────────────────────────────────
$files = $files | Sort-Object FullName -Unique | Sort-Object { $_.FullName.Replace("$base\","") }

# ─── Montar output ────────────────────────────────────────────────────────────
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine(("=" * 80))
[void]$sb.AppendLine("  ANALISE COMPLETA - TODOS OS PROJETOS AXION DOCS")
[void]$sb.AppendLine("  Gerado em: $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
[void]$sb.AppendLine("  Total de arquivos: $($files.Count)")
[void]$sb.AppendLine(("=" * 80))
[void]$sb.AppendLine("")

$currentProject = ""

foreach ($f in $files) {
  $rel = $f.FullName.Replace("$base\","")
  $proj = $rel.Split("\")[0]

  if ($proj -ne $currentProject) {
    $currentProject = $proj
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine(("#" * 80))
    [void]$sb.AppendLine("##  PROJETO: $proj")
    [void]$sb.AppendLine(("#" * 80))
    [void]$sb.AppendLine("")
  }

  [void]$sb.AppendLine(("=" * 80))
  [void]$sb.AppendLine("ARQUIVO: $rel")
  [void]$sb.AppendLine(("=" * 80))

  try {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    [void]$sb.AppendLine($content)
  } catch {
    [void]$sb.AppendLine("[ERRO AO LER ARQUIVO]")
  }
  [void]$sb.AppendLine("")
}

[System.IO.File]::WriteAllText($output, $sb.ToString(), [System.Text.Encoding]::UTF8)
$info = Get-Item $output
Write-Host "OK - $($files.Count) arquivos - $([math]::Round($info.Length / 1KB)) KB -> $output"
