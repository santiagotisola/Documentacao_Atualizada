/**
 * Gerar Vídeo Narrado — Manual AxTon
 * 1. Gera áudio de narração para cada cena via Microsoft Edge TTS (pt-BR neural)
 * 2. Captura screenshots com Puppeteer (sincronizando com duração do áudio)
 * 3. Compõe vídeo final com ffmpeg (vídeo + áudio)
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

const BASE = 'http://localhost:3099/AxTon.Docs';
const OUTPUT_DIR = path.join(__dirname, 'video-axton-narrado');
const AUDIO_DIR = path.join(OUTPUT_DIR, 'audio');
const FRAMES_DIR = path.join(OUTPUT_DIR, 'frames');
const VIDEO_OUTPUT = path.join(__dirname, 'Apresentacao-AxTon-Narrada.mp4');

// Voz Microsoft Neural pt-BR (masculina profissional)
const VOZ = 'pt-BR-AntonioNeural';
const FPS = 2;

// Cenas com narração completa
const cenas = [
  {
    titulo: 'Abertura',
    url: '/',
    tipo: 'hero',
    narracao: 'Bem-vindo à apresentação do AxTon, a plataforma de gestão de pesagem veicular da Axion Tecnologia. Neste vídeo, vamos percorrer todas as funcionalidades do sistema, versão 1.0.0.'
  },
  {
    titulo: 'Visão Geral',
    url: '/docs/',
    tipo: 'scroll',
    narracao: 'O AxTon é um sistema web para controle e monitoramento de pesagem de veículos em rodovias. Ele integra postos de pesagem, balanças HAENNI, classificação automática de veículos e geração de infrações por excesso de peso. O ciclo completo vai desde a chegada do veículo até a exportação da infração para o órgão autuador.'
  },
  {
    titulo: 'Login',
    url: '/docs/primeiros-passos/login',
    tipo: 'page',
    narracao: 'Para acessar o sistema, o operador utiliza suas credenciais na tela de login. O acesso é controlado por perfis de permissão, garantindo que cada usuário veja apenas os módulos permitidos.'
  },
  {
    titulo: 'Navegação',
    url: '/docs/primeiros-passos/navegacao',
    tipo: 'page',
    narracao: 'A interface do AxTon possui um menu lateral com todos os módulos organizados por categoria. A navegação é intuitiva, com ícones e agrupamentos lógicos que facilitam o acesso rápido a qualquer funcionalidade.'
  },
  {
    titulo: 'Dashboard',
    url: '/docs/primeiros-passos/dashboard',
    tipo: 'scroll',
    narracao: 'O dashboard apresenta os indicadores operacionais em tempo real: total de pesagens do dia, veículos com excesso, percentual de conformidade e tickets pendentes. Os gráficos mostram a evolução diária e permitem identificar tendências rapidamente.'
  },
  {
    titulo: 'Iniciar Pesagem',
    url: '/docs/pesagem/iniciar-pesagem',
    tipo: 'scroll',
    narracao: 'Este é o módulo principal do sistema. O fluxo de pesagem segue quatro etapas: primeiro, seleção do posto e classificação do veículo. Segundo, informar a placa. Terceiro, a balança HAENNI realiza a medição automática. Quarto, o sistema calcula se há excesso de peso e gera a infração quando necessário. O cálculo segue as regras do CONTRAN com tolerância de 5% sobre o PBT.'
  },
  {
    titulo: 'Postos de Pesagem',
    url: '/docs/pesagem/postos',
    tipo: 'page',
    narracao: 'Os postos de pesagem são cadastrados com localização, rodovia e equipamentos associados. Cada posto pode ter múltiplas balanças e o sistema controla qual está ativa em cada momento.'
  },
  {
    titulo: 'Tickets Abertos',
    url: '/docs/pesagem/ticket-aberto',
    tipo: 'scroll',
    narracao: 'Os tickets abertos são pesagens em andamento que ainda não foram finalizadas. O operador pode visualizar todos os tickets pendentes, com informações de placa, classificação, peso medido e status atual.'
  },
  {
    titulo: 'Tickets Fechados',
    url: '/docs/pesagem/ticket-fechado',
    tipo: 'page',
    narracao: 'Os tickets fechados representam pesagens concluídas. Aqui ficam registradas todas as informações finais: peso bruto total, excesso calculado, se gerou infração e a data de finalização.'
  },
  {
    titulo: 'Reclassificação',
    url: '/docs/pesagem/reclassificar',
    tipo: 'scroll',
    narracao: 'O módulo de reclassificação permite corrigir a classificação de um veículo após a pesagem. Isso é necessário quando o operador identifica que o tipo de veículo foi registrado incorretamente. A reclassificação recalcula automaticamente os limites de peso e o excesso.'
  },
  {
    titulo: 'Liberar Pesagem',
    url: '/docs/pesagem/liberar-pesagem',
    tipo: 'page',
    narracao: 'A liberação de pesagem permite que um supervisor autorize a liberação de um veículo que estava retido. É necessário informar o motivo da liberação, que fica registrado para auditoria.'
  },
  {
    titulo: 'Motivos',
    url: '/docs/pesagem/motivos',
    tipo: 'page',
    narracao: 'Os motivos de pesagem são cadastros que justificam ações especiais, como liberações, cancelamentos ou reclassificações. Cada motivo possui um código e descrição padronizada.'
  },
  {
    titulo: 'Operações',
    url: '/docs/operacoes/cadastro-operacoes',
    tipo: 'page',
    narracao: 'As operações representam as jornadas de fiscalização em campo. Cada operação registra o posto, a equipe, o período de atuação e os veículos fiscalizados durante aquele turno.'
  },
  {
    titulo: 'Monitoramento Online',
    url: '/docs/operacoes/monitoramento-online',
    tipo: 'scroll',
    narracao: 'O monitoramento online permite acompanhar em tempo real o status de todos os postos de pesagem. O painel mostra quais postos estão ativos, quantas pesagens estão em andamento e alertas de operação.'
  },
  {
    titulo: 'Exportação de Infrações',
    url: '/docs/infracoes/exportacao',
    tipo: 'scroll',
    narracao: 'As infrações geradas automaticamente são agrupadas em lotes para exportação. O sistema gera os arquivos no formato exigido pelo órgão autuador, incluindo dados do veículo, peso medido, excesso e as imagens capturadas. Os lotes podem ser exportados para o XTraffic ou diretamente para o AxHub.'
  },
  {
    titulo: 'Locais',
    url: '/docs/cadastros/locais',
    tipo: 'page',
    narracao: 'O cadastro de locais armazena todas as informações geográficas dos postos: endereço, coordenadas, rodovia, quilômetro e sentido da via.'
  },
  {
    titulo: 'Classificação de Veículos',
    url: '/docs/cadastros/classificacao-veiculos',
    tipo: 'scroll',
    narracao: 'A classificação de veículos define os tipos permitidos e seus respectivos limites de peso por eixo. O sistema utiliza a tabela do CONTRAN com todas as categorias: desde veículos leves até combinações de veículos de carga com múltiplos eixos.'
  },
  {
    titulo: 'Configurações',
    url: '/docs/sistema/configuracoes',
    tipo: 'scroll',
    narracao: 'As configurações do sistema estão organizadas em cinco abas: Gerais, Dados do Órgão, HAENNI, Infração e Câmera IP. Aqui são definidos parâmetros como tolerância de peso, formato de exportação, integração com a balança e configuração das câmeras de captura de imagem.'
  },
  {
    titulo: 'Usuários',
    url: '/docs/administracao/usuarios',
    tipo: 'page',
    narracao: 'A gestão de usuários permite criar, editar e desativar contas de acesso ao sistema. Cada usuário é associado a um perfil de permissões que define quais módulos e ações estão disponíveis.'
  },
  {
    titulo: 'Perfis de Acesso',
    url: '/docs/administracao/perfis-acesso',
    tipo: 'page',
    narracao: 'Os perfis de acesso definem as permissões de cada grupo de usuários. O sistema possui perfis pré-configurados como Administrador, Supervisor e Operador, além de permitir a criação de perfis personalizados.'
  },
  {
    titulo: 'Relatórios',
    url: '/docs/relatorios/relatorio-passagens',
    tipo: 'scroll',
    narracao: 'Os relatórios de pesagem oferecem visão consolidada de todas as operações. É possível filtrar por período, posto, operador e resultado. Os dados podem ser exportados em Excel ou visualizados em dashboards Power BI integrados.'
  },
  {
    titulo: 'Encerramento',
    url: '/',
    tipo: 'hero',
    narracao: 'Este foi o tour completo pelo sistema AxTon. Para mais informações, consulte a documentação online ou entre em contato com o suporte da Axion Tecnologia. Obrigado por assistir!'
  },
];

async function gerarAudios() {
  console.log('\n🎙️  Gerando áudios de narração...\n');
  const duracoes = [];

  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOZ, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  for (let i = 0; i < cenas.length; i++) {
    const cena = cenas[i];
    const audioPath = path.join(AUDIO_DIR, `cena_${String(i).padStart(2, '0')}.mp3`);
    
    console.log(`  [${i + 1}/${cenas.length}] ${cena.titulo}...`);
    
    const { audioStream } = tts.toStream(cena.narracao);
    const chunks = [];
    await new Promise((resolve, reject) => {
      audioStream.on('data', (chunk) => chunks.push(chunk));
      audioStream.on('end', resolve);
      audioStream.on('error', reject);
    });
    fs.writeFileSync(audioPath, Buffer.concat(chunks));

    // Obter duração do áudio
    const probe = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${audioPath}"`,
      { encoding: 'utf8' }
    ).trim();
    const duracao = parseFloat(probe);
    duracoes.push(duracao);
    console.log(`    ✓ ${duracao.toFixed(1)}s`);
  }

  return duracoes;
}

async function capturarFrames(duracoes) {
  console.log('\n📸 Capturando frames sincronizados com áudio...\n');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let frameCount = 0;

  for (let i = 0; i < cenas.length; i++) {
    const cena = cenas[i];
    const duracao = duracoes[i] + 0.5; // +0.5s margem
    const totalFrames = Math.ceil(duracao * FPS);
    const url = `${BASE}${cena.url}`;

    console.log(`  [${i + 1}/${cenas.length}] ${cena.titulo} (${duracao.toFixed(1)}s → ${totalFrames} frames)`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

      // Limpar UI para vídeo
      await page.evaluate((titulo, num, total) => {
        document.querySelectorAll('.theme-doc-toc-desktop, .pagination-nav').forEach(el => el.remove());
        // Overlay de título
        let overlay = document.getElementById('video-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'video-overlay';
          document.body.appendChild(overlay);
        }
        overlay.style.cssText = 'position:fixed;bottom:0;left:0;right:0;padding:24px 48px;background:linear-gradient(transparent,rgba(0,0,0,0.9));z-index:99999;pointer-events:none;display:flex;justify-content:space-between;align-items:flex-end;';
        overlay.innerHTML = `
          <div style="color:#fff;font-family:'Segoe UI Variable Display','Segoe UI',sans-serif;">
            <div style="font-size:32px;font-weight:700;margin-bottom:6px;text-shadow:0 2px 12px rgba(0,0,0,0.6);">${titulo}</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.5);">AxTon v1.0.0 — Axion Tecnologia</div>
          </div>
          <div style="font-size:13px;color:rgba(255,255,255,0.4);font-family:'Segoe UI',sans-serif;">${num} / ${total}</div>
        `;
      }, cena.titulo, i + 1, cenas.length);

      if (cena.tipo === 'scroll') {
        const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
        for (let f = 0; f < totalFrames; f++) {
          const scrollPos = Math.floor((f / totalFrames) * scrollHeight);
          await page.evaluate((pos) => window.scrollTo(0, pos), scrollPos);
          await new Promise(r => setTimeout(r, 30));
          const framePath = path.join(FRAMES_DIR, `frame_${String(frameCount).padStart(5, '0')}.jpg`);
          await page.screenshot({ path: framePath, type: 'jpeg', quality: 88 });
          frameCount++;
        }
      } else {
        for (let f = 0; f < totalFrames; f++) {
          const framePath = path.join(FRAMES_DIR, `frame_${String(frameCount).padStart(5, '0')}.jpg`);
          await page.screenshot({ path: framePath, type: 'jpeg', quality: 88 });
          frameCount++;
        }
      }
    } catch (err) {
      console.log(`    ✗ Erro: ${err.message.substring(0, 50)}`);
      for (let f = 0; f < totalFrames; f++) frameCount++;
    }
  }

  await browser.close();
  console.log(`\n  Total: ${frameCount} frames`);
  return frameCount;
}

function concatenarAudios(duracoes) {
  console.log('\n🔊 Concatenando áudios...');
  
  // Criar arquivo de lista para ffmpeg concat
  const listPath = path.join(OUTPUT_DIR, 'audio_list.txt');
  let listContent = '';
  for (let i = 0; i < cenas.length; i++) {
    const audioFile = path.join(AUDIO_DIR, `cena_${String(i).padStart(2, '0')}.mp3`);
    listContent += `file '${audioFile.replace(/\\/g, '/')}'\n`;
  }
  fs.writeFileSync(listPath, listContent);

  const audioFinal = path.join(OUTPUT_DIR, 'narracao_completa.mp3');
  execSync(`ffmpeg -y -f concat -safe 0 -i "${listPath}" -c:a libmp3lame -q:a 2 "${audioFinal}"`, { stdio: 'pipe' });
  
  const stats = fs.statSync(audioFinal);
  console.log(`  ✓ ${audioFinal} (${(stats.size / 1024 / 1024).toFixed(1)} MB)`);
  return audioFinal;
}

function comporVideoFinal(audioFinal) {
  console.log('\n🎥 Compondo vídeo final com narração...');

  const cmd = [
    'ffmpeg', '-y',
    '-framerate', String(FPS),
    '-i', `"${FRAMES_DIR}/frame_%05d.jpg"`,
    '-i', `"${audioFinal}"`,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '22',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-vf', '"scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"',
    `"${VIDEO_OUTPUT}"`
  ].join(' ');

  execSync(cmd, { stdio: 'inherit' });

  const stats = fs.statSync(VIDEO_OUTPUT);
  const duracaoTotal = cenas.length > 0 ? execSync(
    `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${VIDEO_OUTPUT}"`,
    { encoding: 'utf8' }
  ).trim() : '0';

  console.log(`\n✅ Vídeo narrado gerado com sucesso!`);
  console.log(`   📁 Arquivo: ${VIDEO_OUTPUT}`);
  console.log(`   📐 Resolução: 1920x1080 (Full HD)`);
  console.log(`   ⏱️  Duração: ${parseFloat(duracaoTotal).toFixed(0)} segundos (~${Math.round(parseFloat(duracaoTotal) / 60)} min)`);
  console.log(`   💾 Tamanho: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   🎙️  Voz: Microsoft ${VOZ}`);
}

async function main() {
  console.log('══════════════════════════════════════════════════════');
  console.log('  🎬 VÍDEO NARRADO — Manual AxTon v1.0.0');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Cenas: ${cenas.length}`);
  console.log(`  Voz: ${VOZ} (Microsoft Neural)`);
  console.log(`  Resolução: 1920x1080`);
  console.log('══════════════════════════════════════════════════════');

  // Preparar diretórios
  if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  // Passo 1: Gerar áudios
  const duracoes = await gerarAudios();

  // Passo 2: Capturar frames sincronizados
  await capturarFrames(duracoes);

  // Passo 3: Concatenar áudios
  const audioFinal = concatenarAudios(duracoes);

  // Passo 4: Compor vídeo final
  comporVideoFinal(audioFinal);
}

main().catch(err => { console.error('ERRO FATAL:', err); process.exit(1); });
