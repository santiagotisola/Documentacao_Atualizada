@echo off
cd /d "C:\Users\Santiago\Axiondocs\Axion.Docs\video-v02-frames"

echo [1/2] Compilando frames em video base...
ffmpeg -y -f concat -safe 0 -i lista_frames.txt ^
  -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,fps=25" ^
  -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p ^
  temp_base.mp4

if errorlevel 1 (
  echo ERRO na etapa 1
  pause
  exit /b 1
)

echo [2/2] Adicionando legendas...
ffmpeg -y -i temp_base.mp4 ^
  -vf "drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='V02 - Dashboard - Lendo os Indicadores':fontcolor=white:fontsize=30:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,0,4.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='O Dashboard e a tela inicial apos o Login':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,5,10.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Dashboard possui 6 paineis principais':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,11,17.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Icones de Atalho - acesso rapido as funcionalidades':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,18,23.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Triagem Mensal - evolucao do processamento mes a mes':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,24,30.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Azul=Capturado  Verde=Descartado  Laranja=Processado':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,31,38.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Compare Azul e Laranja para medir atraso na triagem':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,39,46.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Painel Sinotico - filtre por Grupo de Equipamentos':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,47,53.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='STATUS DOS EQUIPAMENTOS - painel essencial no plantao':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,54,60.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Verde com check = Online    Vermelho com X = Offline':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,61,69.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Heartbeat - sinal de vida enviado a cada 5-10 minutos':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,70,77.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Mapa de Equipamentos - localizacao e status geografico':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,78,84.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Defasagem de Processamento - meta sempre ZERO':fontcolor=white:fontsize=28:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,85,92.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Imagens da Semana - taxa de aprovacao ideal 40 a 60 porcento':fontcolor=white:fontsize=26:box=1:boxcolor=black@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,93,100.5)',drawtext=fontfile='C\:/Windows/Fonts/Arial.ttf':text='Alertas INMETRO - certificado vencido invalida infracoes!':fontcolor=yellow:fontsize=28:box=1:boxcolor=red@0.8:boxborderw=12:x=(w-text_w)/2:y=h-70:enable='between(t,101,108.5)'" ^
  -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p ^
  "..\V02-Dashboard-AxHub.mp4"

if errorlevel 1 (
  echo ERRO na etapa 2
  pause
  exit /b 1
)

del temp_base.mp4 2>nul
echo.
echo ==========================================
echo  VIDEO GERADO COM SUCESSO!
echo  C:\Users\Santiago\Axiondocs\Axion.Docs\V02-Dashboard-AxHub.mp4
echo ==========================================
start "" "..\V02-Dashboard-AxHub.mp4"
