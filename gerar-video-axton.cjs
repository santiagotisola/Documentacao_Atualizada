/**
 * Gerar Vídeo de Apresentação - Manual AxTon
 * Captura screenshots com Puppeteer + compõe vídeo com ffmpeg
 * Cada slide: 6s duração + scroll automático em páginas longas
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE = 'http://localhost:3099/AxTon.Docs';
const OUTPUT_DIR = path.join(__dirname, 'video-axton-frames');
const VIDEO_OUTPUT = path.join(__dirname, 'Apresentacao-Manual-AxTon.mp4');

// Cenas do vídeo — título, URL, scroll behavior
const cenas = [
  { titulo: 'AxTon — Plataforma de Pesagem Veicular', url: '/', tipo: 'hero', duracao: 8 },
  { titulo: 'Visão Geral do Sistema', url: '/docs/', tipo: 'scroll', duracao: 10 },
  { titulo: 'Login e Acesso', url: '/docs/primeiros-passos/login', tipo: 'page', duracao: 6 },
  { titulo: 'Navegação do Sistema', url: '/docs/primeiros-passos/navegacao', tipo: 'page', duracao: 6 },
  { titulo: 'Dashboard — Indicadores', url: '/docs/primeiros-passos/dashboard', tipo: 'scroll', duracao: 8 },
  { titulo: 'Iniciar Pesagem', url: '/docs/pesagem/iniciar-pesagem', tipo: 'scroll', duracao: 10 },
  { titulo: 'Postos de Pesagem', url: '/docs/pesagem/postos', tipo: 'page', duracao: 6 },
  { titulo: 'Tickets Abertos', url: '/docs/pesagem/ticket-aberto', tipo: 'scroll', duracao: 8 },
  { titulo: 'Tickets Fechados', url: '/docs/pesagem/ticket-fechado', tipo: 'page', duracao: 6 },
  { titulo: 'Reclassificação de Veículos', url: '/docs/pesagem/reclassificar', tipo: 'scroll', duracao: 8 },
  { titulo: 'Liberar Pesagem', url: '/docs/pesagem/liberar-pesagem', tipo: 'page', duracao: 6 },
  { titulo: 'Motivos de Pesagem', url: '/docs/pesagem/motivos', tipo: 'page', duracao: 6 },
  { titulo: 'Cadastro de Operações', url: '/docs/operacoes/cadastro-operacoes', tipo: 'page', duracao: 6 },
  { titulo: 'Monitoramento Online', url: '/docs/operacoes/monitoramento-online', tipo: 'scroll', duracao: 8 },
  { titulo: 'Exportação de Infrações', url: '/docs/infracoes/exportacao', tipo: 'scroll', duracao: 8 },
  { titulo: 'Cadastro de Locais', url: '/docs/cadastros/locais', tipo: 'page', duracao: 6 },
  { titulo: 'Classificação de Veículos', url: '/docs/cadastros/classificacao-veiculos', tipo: 'scroll', duracao: 8 },
  { titulo: 'Configurações do Sistema', url: '/docs/sistema/configuracoes', tipo: 'scroll', duracao: 10 },
  { titulo: 'Gestão de Usuários', url: '/docs/administracao/usuarios', tipo: 'page', duracao: 6 },
  { titulo: 'Perfis de Acesso', url: '/docs/administracao/perfis-acesso', tipo: 'page', duracao: 6 },
  { titulo: 'Relatórios de Pesagem', url: '/docs/relatorios/relatorio-passagens', tipo: 'scroll', duracao: 8 },
  { titulo: 'Obrigado — Axion Tecnologia', url: '/', tipo: 'hero', duracao: 6 },
];

// FPS para o vídeo
const FPS = 2; // 2 frames por segundo (suficiente para apresentação)

async function capturarFrames() {
  if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  let frameCount = 0;

  for (let i = 0; i < cenas.length; i++) {
    const cena = cenas[i];
    const url = `${BASE}${cena.url}`;
    console.log(`\n🎬 Cena ${i + 1}/${cenas.length}: ${cena.titulo}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

      // Remover elementos desnecessários para vídeo limpo
      await page.evaluate(() => {
        document.querySelectorAll('.theme-doc-toc-desktop, .pagination-nav').forEach(el => el.remove());
        // Adicionar overlay de título
        const overlay = document.createElement('div');
        overlay.id = 'video-overlay';
        overlay.style.cssText = 'position:fixed;bottom:0;left:0;right:0;padding:20px 40px;background:linear-gradient(transparent,rgba(0,0,0,0.85));z-index:99999;pointer-events:none;';
        document.body.appendChild(overlay);
      });

      // Adicionar título da cena como overlay
      await page.evaluate((titulo, num, total) => {
        const overlay = document.getElementById('video-overlay');
        overlay.innerHTML = `
          <div style="color:#fff;font-family:'Segoe UI Variable Display',sans-serif;">
            <div style="font-size:28px;font-weight:700;margin-bottom:4px;text-shadow:0 2px 8px rgba(0,0,0,0.5);">${titulo}</div>
            <div style="font-size:14px;color:rgba(255,255,255,0.6);">AxTon v1.0.0 — Axion Tecnologia | ${num}/${total}</div>
          </div>
        `;
      }, cena.titulo, i + 1, cenas.length);

      const totalFrames = cena.duracao * FPS;

      if (cena.tipo === 'scroll') {
        // Scroll progressivo durante a duração
        const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
        for (let f = 0; f < totalFrames; f++) {
          const scrollPos = Math.floor((f / totalFrames) * scrollHeight);
          await page.evaluate((pos) => window.scrollTo(0, pos), scrollPos);
          await new Promise(r => setTimeout(r, 50));
          const framePath = path.join(OUTPUT_DIR, `frame_${String(frameCount).padStart(5, '0')}.jpg`);
          await page.screenshot({ path: framePath, type: 'jpeg', quality: 85 });
          frameCount++;
        }
      } else {
        // Frames estáticos
        for (let f = 0; f < totalFrames; f++) {
          const framePath = path.join(OUTPUT_DIR, `frame_${String(frameCount).padStart(5, '0')}.jpg`);
          await page.screenshot({ path: framePath, type: 'jpeg', quality: 85 });
          frameCount++;
        }
      }

      console.log(`  ✓ ${totalFrames} frames capturados`);
    } catch (err) {
      console.log(`  ✗ Erro: ${err.message.substring(0, 60)}`);
      // Frames em branco para manter timing
      const totalFrames = cena.duracao * FPS;
      for (let f = 0; f < totalFrames; f++) {
        frameCount++;
      }
    }
  }

  await browser.close();
  console.log(`\n📸 Total: ${frameCount} frames capturados`);
  return frameCount;
}

function gerarVideo() {
  console.log('\n🎥 Compondo vídeo com ffmpeg...');
  
  const cmd = [
    'ffmpeg', '-y',
    '-framerate', String(FPS),
    '-i', `"${OUTPUT_DIR}/frame_%05d.jpg"`,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-vf', '"scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"',
    `"${VIDEO_OUTPUT}"`
  ].join(' ');

  console.log(`  Comando: ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit' });

  const stats = fs.statSync(VIDEO_OUTPUT);
  console.log(`\n✅ Vídeo gerado: ${VIDEO_OUTPUT}`);
  console.log(`   Tamanho: ${(stats.size / 1024 / 1024).toFixed(1)} MB`);
  console.log(`   Duração estimada: ${cenas.reduce((s, c) => s + c.duracao, 0)}s (~${Math.round(cenas.reduce((s, c) => s + c.duracao, 0) / 60)} min)`);
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  🎬 GERADOR DE VÍDEO — Manual AxTon v1.0.0');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Cenas: ${cenas.length}`);
  console.log(`  Duração total: ~${Math.round(cenas.reduce((s, c) => s + c.duracao, 0) / 60)} minutos`);
  console.log(`  Resolução: 1920x1080 (Full HD)`);
  console.log('═══════════════════════════════════════════════\n');

  await capturarFrames();
  gerarVideo();
}

main().catch(err => { console.error('ERRO FATAL:', err); process.exit(1); });
