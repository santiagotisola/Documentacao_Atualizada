# ═══════════════════════════════════════════════════════════════
# Script PowerShell — Geração do Vídeo V02: Dashboard AxHub
# Usa FFmpeg para compilar frames PNG em vídeo MP4 com legendas
# ═══════════════════════════════════════════════════════════════

$framesDir  = "C:\Users\Santiago\Axiondocs\Axion.Docs\video-v02-frames"
$outputDir  = "C:\Users\Santiago\Axiondocs\Axion.Docs"
$outputFile = "$outputDir\V02-Dashboard-AxHub.mp4"
$concatFile = "$framesDir\lista_frames.txt"
$fontPath   = "C:/Windows/Fonts/Arial.ttf"

Write-Host ">> Gerando lista de frames com durações..." -ForegroundColor Cyan

# ───────────────────────────────────────────────────────────────
# Definição dos frames: arquivo | duração em segundos | narração
# ───────────────────────────────────────────────────────────────
$frames = @(
  @{ file="001_abertura_home.png";         dur=5;  legenda="V02 — Dashboard: Lendo os Indicadores | AxHub" },
  @{ file="002_dashboard_topo.png";        dur=6;  legenda="O Dashboard e a tela inicial apos o Login" },
  @{ file="003_dashboard_visao_geral.png"; dur=6;  legenda="6 paineis principais — vamos percorrer cada um" },
  @{ file="004_icones_atalho.png";         dur=6;  legenda="Icones de Atalho: acesso rapido as funcionalidades mais usadas" },
  @{ file="005_triagem_mensal.png";        dur=7;  legenda="Triagem Mensal: evolucao do processamento de imagens mes a mes" },
  @{ file="006_triagem_tabela.png";        dur=8;  legenda="Azul = Total Capturado | Verde = Descartes | Laranja = Processadas" },
  @{ file="007_triagem_interpretar.png";   dur=8;  legenda="Dica: compare Azul x Laranja para avaliar atraso na triagem" },
  @{ file="008_painel_sinotico.png";       dur=7;  legenda="Painel Sinotico: filtre o Dashboard por Grupo de Equipamentos" },
  @{ file="009_status_equipamentos.png";   dur=7;  legenda="STATUS DOS EQUIPAMENTOS — painel mais importante do plantao" },
  @{ file="010_online_offline.png";        dur=9;  legenda="Verde (check) = Online operacional | Vermelho (X) = Offline" },
  @{ file="011_heartbeat.png";             dur=8;  legenda="Heartbeat: sinal de vida enviado a cada 5-10 min pelo equipamento" },
  @{ file="012_mapa.png";                  dur=7;  legenda="Mapa de Equipamentos: localizacao geografica e status em tempo real" },
  @{ file="013_defasagem.png";             dur=8;  legenda="Defasagem: imagens aguardando triagem alem do prazo | Meta = ZERO" },
  @{ file="014_imagens_semana.png";        dur=8;  legenda="Imagens da Semana: taxa de aprovacao esperada entre 40% e 60%" },
  @{ file="015_alertas_afericao.png";      dur=8;  legenda="Alertas INMETRO: certificado vencido = equipamento invalido!" }
)

# Gerar arquivo de concatenação para FFmpeg
$concatContent = ""
foreach ($f in $frames) {
  $filePath = "$framesDir\$($f.file)" -replace "\\", "/"
  $concatContent += "file '$filePath'`n"
  $concatContent += "duration $($f.dur)`n"
}
# Repetir último frame para evitar corte
$lastFile = "$framesDir\$($frames[-1].file)" -replace "\\", "/"
$concatContent += "file '$lastFile'`n"
Set-Content -Path $concatFile -Value $concatContent -Encoding UTF8

Write-Host ">> Lista de frames criada: $concatFile" -ForegroundColor Green

# ───────────────────────────────────────────────────────────────
# Construir filtro de legendas (drawtext) para cada segmento
# Calcula o tempo de início de cada frame com base nas durações
# ───────────────────────────────────────────────────────────────
$drawTextFilters = @()
$t = 0
foreach ($f in $frames) {
  $tStart = $t
  $tEnd   = $t + $f.dur - 0.3   # 0.3s de fade out antes de mudar
  
  # Sanitizar texto para FFmpeg (remover apóstrofes e barras)
  $txt = $f.legenda -replace "'", "" -replace "\\", "/" -replace ":", " -"
  
  $drawTextFilters += "drawtext=fontfile='$fontPath':text='$txt':fontcolor=white:fontsize=26:box=1:boxcolor=black@0.75:boxborderw=10:x=(w-text_w)/2:y=h-80:enable='between(t,$tStart,$tEnd)'"
  
  $t += $f.dur
}

$totalDur = $t
$filterStr = $drawTextFilters -join ","

Write-Host ">> Duracao total do video: ${totalDur}s (~$([math]::Round($totalDur/60,1)) min)" -ForegroundColor Cyan

# ───────────────────────────────────────────────────────────────
# ETAPA 1: Compilar frames em vídeo base (sem legendas)
# ───────────────────────────────────────────────────────────────
$tempVideo = "$framesDir\temp_base.mp4"

Write-Host ">> Etapa 1/2 — Compilando frames em video base..." -ForegroundColor Yellow

$args1 = @(
  "-y",
  "-f", "concat",
  "-safe", "0",
  "-i", $concatFile,
  "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,fps=25",
  "-c:v", "libx264",
  "-preset", "fast",
  "-crf", "22",
  "-pix_fmt", "yuv420p",
  $tempVideo
)

$proc1 = Start-Process -FilePath "ffmpeg" -ArgumentList $args1 -Wait -PassThru -NoNewWindow -RedirectStandardError "$framesDir\ffmpeg_etapa1.log"
if ($proc1.ExitCode -ne 0) {
  Write-Host "ERRO na Etapa 1. Verifique: $framesDir\ffmpeg_etapa1.log" -ForegroundColor Red
  Get-Content "$framesDir\ffmpeg_etapa1.log" | Select-Object -Last 20
  exit 1
}
Write-Host ">> Video base gerado: $tempVideo" -ForegroundColor Green

# ───────────────────────────────────────────────────────────────
# ETAPA 2: Adicionar legendas ao vídeo base
# ───────────────────────────────────────────────────────────────
Write-Host ">> Etapa 2/2 — Adicionando legendas..." -ForegroundColor Yellow

$args2 = @(
  "-y",
  "-i", $tempVideo,
  "-vf", $filterStr,
  "-c:v", "libx264",
  "-preset", "fast",
  "-crf", "22",
  "-pix_fmt", "yuv420p",
  $outputFile
)

$proc2 = Start-Process -FilePath "ffmpeg" -ArgumentList $args2 -Wait -PassThru -NoNewWindow -RedirectStandardError "$framesDir\ffmpeg_etapa2.log"
if ($proc2.ExitCode -ne 0) {
  Write-Host "ERRO na Etapa 2. Verifique: $framesDir\ffmpeg_etapa2.log" -ForegroundColor Red
  Get-Content "$framesDir\ffmpeg_etapa2.log" | Select-Object -Last 20
  exit 1
}

# Limpeza
Remove-Item $tempVideo -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  VIDEO GERADO COM SUCESSO!" -ForegroundColor Green
Write-Host "  Arquivo: $outputFile" -ForegroundColor Green
$size = [math]::Round((Get-Item $outputFile).Length / 1MB, 1)
Write-Host "  Tamanho: ${size} MB" -ForegroundColor Green
Write-Host "  Duracao: ${totalDur}s (~$([math]::Round($totalDur/60,1)) min)" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Abrir vídeo no player padrão
Start-Process $outputFile
