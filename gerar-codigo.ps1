$ErrorActionPreference = "SilentlyContinue"
$base = "C:\Users\Santiago\Axiondocs\Axion.Docs"
$output = "$base\all-projects-code.txt"

Set-Location $base

$files = @()
$dirs = @("axion-ia-api\src","axion-ia-panel\src","AxHub\widget","AxTon\widget","AxCross\widget","AxHub\docs-portal\docs","AxTon\docs-portal\docs","AxCross\docs-portal\docs","AxHub\docs-portal\src","AxTon\docs-portal\src","AxCross\docs-portal\src")

foreach ($d in $dirs) {
  $full = Join-Path $base $d
  if (Test-Path $full) {
    $files += Get-ChildItem $full -Recurse -File | Where-Object {
      $_.Extension -match '\.(js|jsx|ts|css|json|md|html)$' -and
      $_.FullName -notmatch 'node_modules|\\build\\|\.docusaurus'
    }
  }
}

$roots = @(
  "axion-ia-api\package.json","axion-ia-api\.env",
  "axion-ia-panel\package.json","axion-ia-panel\index.html","axion-ia-panel\vite.config.js",
  "AxHub\docs-portal\docusaurus.config.ts","AxHub\docs-portal\package.json","AxHub\docs-portal\sidebars.ts","AxHub\docs-portal\tsconfig.json","AxHub\base-pesquisa-suporte.md",
  "AxTon\docs-portal\docusaurus.config.ts","AxTon\docs-portal\package.json","AxTon\docs-portal\sidebars.ts","AxTon\docs-portal\tsconfig.json","AxTon\base-pesquisa-suporte.md",
  "AxCross\docs-portal\docusaurus.config.ts","AxCross\docs-portal\package.json","AxCross\docs-portal\sidebars.ts","AxCross\docs-portal\tsconfig.json","AxCross\base-pesquisa-suporte.md",
  "gerar-knowledge-base.mjs","MANUAL-AXIONIA.md","BASE-PROJETO-DOCS.md"
)

foreach ($r in $roots) {
  $full = Join-Path $base $r
  if (Test-Path $full) { $files += Get-Item $full }
}

$files = $files | Sort-Object { $_.FullName.Replace("$base\","") }

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine(("=" * 80))
[void]$sb.AppendLine("  CODIGO COMPLETO - TODOS OS PROJETOS AXION DOCS")
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
    [void]$sb.AppendLine("[ERRO AO LER]")
  }
  [void]$sb.AppendLine("")
}

[System.IO.File]::WriteAllText($output, $sb.ToString(), [System.Text.Encoding]::UTF8)
$info = Get-Item $output
Write-Host "OK - $($files.Count) arquivos - $([math]::Round($info.Length / 1KB)) KB"
