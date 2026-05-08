# ==============================================================================
#  gerar-prompt-analise.ps1
#  Gera um arquivo de prompt completo para analise de melhorias do SaaS Axion
#  Pode ser copiado para qualquer projeto — ajuste apenas $base abaixo
# ==============================================================================

$ErrorActionPreference = "SilentlyContinue"
$base   = "C:\Users\Santiago\Axiondocs\Axion.Docs"
$output = "$base\prompt-analise-saas.md"

Set-Location $base

# ─── Coleta de arquivos ────────────────────────────────────────────────────────

$files = @()

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

$singleFiles = @(
  "AxHub\Database\AxHub.sql",
  "AxHub\Database\relatorio-fluxo-implementacao.json",
  "AxTon\Database\DATABASE_MAPPING_AXTON.md",
  "AxCross\Database\AxCross.sql",
  "AxHub\docs-portal\docusaurus.config.ts",
  "AxHub\docs-portal\sidebars.ts",
  "AxHub\base-pesquisa-suporte.md",
  "AxTon\docs-portal\docusaurus.config.ts",
  "AxTon\docs-portal\sidebars.ts",
  "AxTon\base-pesquisa-suporte.md",
  "AxCross\docs-portal\docusaurus.config.ts",
  "AxCross\docs-portal\sidebars.ts",
  "AxCross\base-pesquisa-suporte.md",
  "axion-ia-api\package.json",
  "axion-ia-panel\package.json",
  "axion-ia-panel\vite.config.js",
  "MANUAL-AXIONIA.md",
  "BASE-PROJETO-DOCS.md",
  "openapi.json",
  "gerar-knowledge-base.mjs"
)

foreach ($r in $singleFiles) {
  $full = Join-Path $base $r
  if (Test-Path $full) { $files += Get-Item $full }
}

$files = $files | Sort-Object FullName -Unique | Sort-Object { $_.FullName.Replace("$base\","") }

# ─── Montar prompt ─────────────────────────────────────────────────────────────

$sb = New-Object System.Text.StringBuilder

# ══ CABECALHO / ROLE ══════════════════════════════════════════════════════════
[void]$sb.AppendLine(@"
# PROMPT DE ANALISE COMPLETA — SAAS AXION TECNOLOGIA
> Gerado automaticamente em: $(Get-Date -Format 'dd/MM/yyyy HH:mm')
> Total de arquivos incluidos: $($files.Count)

---

## PAPEL E CONTEXTO

Voce e um arquiteto de software senior especializado em SaaS B2B, APIs Node.js,
React, SQL Server, inteligencia artificial e plataformas de documentacao.

Analise o codigo-fonte completo do **SaaS Axion Tecnologia** descrito abaixo e
produza um relatorio estruturado cobrindo todos os pontos listados na secao
**SOLICITACOES DE ANALISE**.

---

## DESCRICAO DO SISTEMA

O ecossistema Axion e composto pelos seguintes componentes:

| Componente        | Tecnologia          | Funcao                                                        |
|-------------------|---------------------|---------------------------------------------------------------|
| **axion-ia-api**  | Node.js + Express   | API central: IA, helpdesk, geracao de docs, roadmap, specs    |
| **axion-ia-panel**| React + Vite        | Painel administrativo da plataforma AxionIA                   |
| **AxHub**         | Docusaurus + Widget | Portal de docs + widget de suporte do sistema de fiscalizacao |
| **AxTon**         | Docusaurus + Widget | Portal de docs + widget de suporte do sistema de pesagem      |
| **AxCross**       | Docusaurus + Widget | Portal de docs + widget de suporte do sistema de cruzamentos  |

Banco de dados: **SQL Server** (um banco por produto).
IA: **OpenAI GPT** (embeddings + chat completion) + sistema de keywords.
Helpdesk integrado: **Jitbit**.

---

## SOLICITACOES DE ANALISE

Responda cada topico separadamente com subtitulos claros.

### 1. ARQUITETURA GERAL
- Avalie o design atual (separacao de responsabilidades, coesao, acoplamento)
- Identifique anti-patterns ou decisoes de design que podem gerar problemas de escala
- Sugira melhorias arquiteturais concretas

### 2. QUALIDADE DE CODIGO
- Aponte funcoes/modulos com alta complexidade ciclomatica ou responsabilidades demais
- Identifique codigo duplicado ou que deveria ser abstraido
- Aponte nomenclaturas confusas ou inconsistentes

### 3. SEGURANCA (OWASP Top 10)
- Verifique autenticacao e autorizacao (JWT, middleware de token)
- Aponte riscos de injecao (SQL injection, prompt injection na IA)
- Verifique exposicao de dados sensiveis (logs, respostas de API, .env)
- Identifique qualquer outro risco de seguranca relevante

### 4. PERFORMANCE E ESCALABILIDADE
- Identifique consultas SQL ineficientes ou sem indice
- Aponte chamadas bloqueantes ou ausencia de cache onde seria util
- Avalie o uso de embeddings e chamadas OpenAI — ha otimizacoes possiveis?
- O scheduler (cron) esta bem configurado?

### 5. CONFIABILIDADE E TRATAMENTO DE ERROS
- Avalie o tratamento de erros e logging (logger.js)
- Existem falhas silenciosas que podem causar bugs dificeis de depurar?
- O sistema se recupera bem de falhas na OpenAI API ou no SQL Server?

### 6. EXPERIENCIA DO USUARIO (PAINEL E WIDGET)
- Avalie a UX do painel React (axion-ia-panel)
- Avalie a experiencia dos widgets de suporte (AxHub, AxTon, AxCross)
- Quais fluxos sao confusos ou poderiam ser simplificados?

### 7. INTEGRACAO COM IA (ENGINE + PROMPT)
- Avalie a qualidade dos prompts (prompt.js) — sao claros, precisos, com Few-Shot?
- O classificador (classifier.js) e robusto? Quais casos de borda podem falhar?
- O motor de busca por similaridade (engine.js / search.js) esta eficiente?
- Sugestoes para melhorar a precisao das respostas da IA

### 8. DOCUMENTACAO TECNICA
- A documentacao Docusaurus dos tres portais esta completa e consistente?
- Quais topicos criticos estao faltando ou desatualizados?
- O openapi.json cobre todos os endpoints relevantes?

### 9. MELHORIAS PRIORITARIAS
Liste as **10 melhorias mais impactantes** em ordem de prioridade, com:
- Titulo curto
- Problema que resolve
- Esforco estimado (P/M/G)
- Impacto (Alto/Medio/Baixo)

### 10. ROADMAP SUGERIDO
Proponha um roadmap de melhorias em 3 fases (curto / medio / longo prazo) com
os itens mais criticos para transformar este SaaS em um produto mais robusto,
seguro e escalavel.

---

## CODIGO-FONTE COMPLETO

A seguir esta o codigo-fonte de todos os $($files.Count) arquivos do sistema,
organizados por projeto. Use este material como base para toda a analise acima.

"@)

# ══ CODIGO POR PROJETO ═══════════════════════════════════════════════════════
$currentProject = ""

foreach ($f in $files) {
  $rel  = $f.FullName.Replace("$base\","")
  $proj = $rel.Split("\")[0]
  $ext  = $f.Extension.TrimStart(".")

  if ($proj -ne $currentProject) {
    $currentProject = $proj
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("---")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## PROJETO: $proj")
    [void]$sb.AppendLine("")
  }

  [void]$sb.AppendLine("### ``$rel``")
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("``````$ext")

  try {
    $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    [void]$sb.AppendLine($content.TrimEnd())
  } catch {
    [void]$sb.AppendLine("[ERRO AO LER ARQUIVO]")
  }

  [void]$sb.AppendLine("``````")
  [void]$sb.AppendLine("")
}

# ══ RODAPE ════════════════════════════════════════════════════════════════════
[void]$sb.AppendLine("---")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("*Fim do prompt. Aguardo a analise completa estruturada conforme os 10 topicos acima.*")

# ══ SALVAR ════════════════════════════════════════════════════════════════════
[System.IO.File]::WriteAllText($output, $sb.ToString(), [System.Text.Encoding]::UTF8)
$info = Get-Item $output
Write-Host "OK - $($files.Count) arquivos - $([math]::Round($info.Length / 1KB)) KB -> $output"
