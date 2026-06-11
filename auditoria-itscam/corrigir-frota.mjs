/**
 * Correção em massa da frota ITScam 450 — SETRANS-GO
 *
 * Modos:
 *   --plano     Gera plano de correção (JSON) sem aplicar nada
 *   --aplicar   Aplica todas as correções aprovadas
 *   --caso=N    Aplica apenas o caso N
 *   --equip=X   Filtra por nome do equipamento
 *
 * Saída: auditoria-itscam/plano-correcao.json
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INVENTARIO = JSON.parse(readFileSync(resolve(__dirname, "config-padrao/padrao-faixa-1.json"), "utf8"));
const INVENTARIO_F2 = JSON.parse(readFileSync(resolve(__dirname, "config-padrao/padrao-faixa-2.json"), "utf8"));

// ═══ DISPOSITIVOS ═══
const DEVICES_FILE = resolve(__dirname, "../axion-ia-api/src/varco-devices.json");
let ALL_DEVICES = [];
if (existsSync(DEVICES_FILE)) {
  ALL_DEVICES = JSON.parse(readFileSync(DEVICES_FILE, "utf8"));
} else {
  // Fallback: ler do validacao-config.json
  const valFile = resolve(__dirname, "validacao-config.json");
  if (existsSync(valFile)) {
    const val = JSON.parse(readFileSync(valFile, "utf8"));
    const extract = (arr) => arr?.map(d => ({ nome: d.nome, uuid: d.uuid || d.dispositivo?.uuid, faixa: d.faixa })) || [];
    ALL_DEVICES = [...extract(val.conformes), ...extract(val.grupos?.flatMap(g => g.dispositivos || [])), ...extract(val.offline)];
  }
}

const CREDENTIALS = { username: "admin", password: "#econocr@" };
const TIMEOUT = 15000;
const MODE = process.argv.includes("--aplicar") ? "aplicar" : "plano";
const CASO_FILTER = process.argv.find(a => a.startsWith("--caso="))?.split("=")[1];
const EQUIP_FILTER = process.argv.find(a => a.startsWith("--equip="))?.split("=")[1]?.toLowerCase();

// ═══ DEFINIÇÃO DE CASOS DE CORREÇÃO ═══
const CASOS = [
  {
    id: 1,
    titulo: "Vídeo Qualidade = 10 (imagens ilegíveis)",
    severidade: "critico",
    parametro: "Video.quality",
    descricao: "O parâmetro 'quality' controla a compressão JPEG da imagem capturada (escala de 1 a 100). Valor 10 significa compressão EXTREMA — a imagem vira um borrão pixelado.",
    problema: "Com quality=10, os caracteres da placa ficam ilegíveis para o motor OCR Jidosha. A taxa de leitura cai drasticamente e as evidências fotográficas enviadas ao AxHub são inutilizáveis para autuação.",
    correcao: "Acessar: Interface Web da câmera › menu 'Vídeo' › 'Streams' › selecionar Stream 1 › campo 'Qualidade' › alterar de 10 para 85. Via API: PUT /api/video/streams/0 com body { quality: 85 }",
    menu: "Interface Web › Vídeo › Streams › Stream 1 › campo 'Qualidade'",
    endpoint: "/api/video/streams/0",
    method: "PUT",
    payload: { quality: 85 },
    detectar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/video/streams`, { headers });
      const stream = Array.isArray(r) ? r[0] : r;
      if (stream?.quality !== undefined && stream.quality < 50) return { atual: stream.quality, correto: 85 };
      return null;
    },
    aplicar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/video/streams`, { headers });
      const stream = Array.isArray(r) ? r[0] : r;
      const id = stream?.id ?? 0;
      return fetchJSON(`${base}/api/video/streams/${id}`, { method: "PUT", headers, body: JSON.stringify({ quality: 85 }) });
    },
  },
  {
    id: 2,
    titulo: "Vídeo Framerate = 1-5 fps (OCR quase inoperante)",
    severidade: "critico",
    parametro: "Video.framerate",
    descricao: "O 'framerate' define quantos quadros por segundo a câmera gera para o motor de OCR. Com 1-5 fps, a câmera captura pouquíssimos frames — insuficiente para veículos em movimento.",
    problema: "Um veículo a 60km/h percorre ~17 metros por segundo. Com apenas 1 fps, existe no máximo 1 frame com o veículo na zona de captura. Se esse frame estiver borrado ou mal posicionado, a placa é perdida. Com 12 fps há 12 oportunidades de leitura.",
    correcao: "Acessar: Interface Web da câmera › menu 'Vídeo' › 'Streams' › selecionar Stream 1 › campo 'Taxa de frames (fps)' › alterar para 12. Via API: PUT /api/video/streams/0 com body { framerate: 12 }",
    menu: "Interface Web › Vídeo › Streams › Stream 1 › campo 'Taxa de frames'",
    endpoint: "/api/video/streams/0",
    method: "PUT",
    payload: { framerate: 12 },
    detectar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/video/streams`, { headers });
      const stream = Array.isArray(r) ? r[0] : r;
      if (stream?.framerate !== undefined && stream.framerate < 10) return { atual: stream.framerate, correto: 12 };
      return null;
    },
    aplicar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/video/streams`, { headers });
      const stream = Array.isArray(r) ? r[0] : r;
      const id = stream?.id ?? 0;
      return fetchJSON(`${base}/api/video/streams/${id}`, { method: "PUT", headers, body: JSON.stringify({ framerate: 12 }) });
    },
  },
  {
    id: 3,
    titulo: "OCR Vehicle Type = 1 (só carros, perde motos/caminhões)",
    severidade: "critico",
    parametro: "OCR.vehicleType",
    descricao: "O campo 'vehicleType' filtra quais tipos de veículo o OCR tenta ler. Valor 1 = somente carros de passeio. Valor 3 = todos (carro + moto + caminhão + ônibus).",
    problema: "Com vehicleType=1, qualquer moto, caminhão ou ônibus que passar é IGNORADO pelo OCR — a placa nem é tentada. Isso causa perda total de leitura para esses tipos, gerando subnotificação grave.",
    correcao: "Acessar: Interface Web da câmera › menu 'Equipamento' › 'Reconhecimento' › aba 'Jidosha' › campo 'Tipo de Veículo' › selecionar 'Todos (3)'. Via API: PUT /api/equipment/ocr com body { ocr: { vehicleType: 3 } }",
    menu: "Interface Web › Equipamento › Reconhecimento › aba 'Jidosha' › campo 'Tipo de Veículo'",
    endpoint: "/api/equipment/ocr",
    method: "PUT",
    payload: { ocr: { vehicleType: 3 } },
    detectar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/equipment/ocr`, { headers });
      if (r?.ocr?.vehicleType !== undefined && r.ocr.vehicleType !== 3) return { atual: r.ocr.vehicleType, correto: 3 };
      return null;
    },
    aplicar: async (headers, base) => {
      return fetchJSON(`${base}/api/equipment/ocr`, { method: "PUT", headers, body: JSON.stringify({ ocr: { vehicleType: 3 } }) });
    },
  },
  {
    id: 4,
    titulo: "Transição Lower Level = 30 (P&B durante o dia)",
    severidade: "critico",
    parametro: "Diurno.lower.level",
    descricao: "O 'Lower Level' (Nível Inferior) é o sensor que decide quando a câmera ENTRA no modo Noturno (preto e branco / infravermelho). Funciona assim: a câmera mede a luminosidade ambiente de 0 a 100. Quando a luz cai ABAIXO do 'Lower Level', ela troca para modo Noturno.",
    problema: "Com lower.level=30, a câmera acha que está 'escuro' quando a luminosidade cai para 30 (uma nuvem passando ou sombra já é suficiente). Resultado: imagens ficam em preto e branco em pleno dia, prejudicando o OCR e a qualidade de evidências. Com lower.level=10, ela só troca para Noturno quando realmente está escurecendo (nível 10 é quase breu).",
    correcao: "Na interface web: menu lateral 'Imagem' → 'Transições' → na Agenda de Transições, clique no lápis (✏️) da linha 'Diurno (inferior)' → altere o campo 'Nível' de 30 para 10 → Salvar. O 'Nível < 10' na barra azul confirma que está correto. Via API: PUT /api/image/profiles/{id} com body { transitions: { lower: { level: 10 } } }",
    menu: "Interface Web › Imagem › Transições › Agenda de Transições › lápis (✏️) em 'Diurno (inferior)' › campo 'Nível' → 10",
    endpoint: "/api/image/profiles/{id}",
    method: "PUT",
    detectar: async (headers, base) => {
      const profiles = await fetchJSON(`${base}/api/image/profiles`, { headers });
      for (const p of profiles) {
        if (p.transitions?.lower?.level > 10) return { atual: p.transitions.lower.level, correto: 10, profileId: p.id, profileName: p.name };
      }
      return null;
    },
    aplicar: async (headers, base, ctx) => {
      const profiles = await fetchJSON(`${base}/api/image/profiles`, { headers });
      for (const p of profiles) {
        if (p.transitions?.lower?.level > 10) {
          const t = { ...p.transitions, lower: { ...p.transitions.lower, level: 10 } };
          await fetchJSON(`${base}/api/image/profiles/${p.id}`, { method: "PUT", headers, body: JSON.stringify({ transitions: t }) });
        }
      }
    },
  },
  {
    id: 5,
    titulo: "Transição Upper Level ≠ 35 (transição dia/noite errada)",
    severidade: "alto",
    parametro: "Diurno.upper.level / Noturno.upper.level",
    descricao: "O 'Upper Level' (Nível Superior) é o sensor que decide quando a câmera SAI do modo Noturno e VOLTA para o Diurno (colorido). Funciona ao contrário do Lower: quando a luminosidade SOBE ACIMA do 'Upper Level', a câmera troca para Diurno. Ou seja: Lower Level = 'quando escurece, vá para P&B', Upper Level = 'quando clarear, volte para colorido'.",
    problema: "Com upper.level=40 → demora demais para voltar ao colorido (fica P&B às 7h quando já está claro). Com upper.level=30 → volta ao colorido cedo demais (5h30 ainda sem luz suficiente, imagem escura). O padrão 35 é o equilíbrio testado para a latitude de Goiânia-GO.",
    correcao: "Na interface web: menu lateral 'Imagem' → 'Transições' → na Agenda de Transições, repare nas barras azuis que mostram 'para Diurno (35)' e 'para Noturno (35)'. Para corrigir: clique no lápis (✏️) nas linhas 'Diurno (superior)' e 'Noturno (superior)' → altere o campo 'Nível' para 35. Via API: PUT /api/image/profiles/{id} com body { transitions: { upper: { level: 35 } } }",
    menu: "Interface Web › Imagem › Transições › Agenda de Transições › lápis (✏️) em linhas '(superior)' › campo 'Nível' → 35",
    endpoint: "/api/image/profiles/{id}",
    method: "PUT",
    detectar: async (headers, base) => {
      const profiles = await fetchJSON(`${base}/api/image/profiles`, { headers });
      for (const p of profiles) {
        if (p.transitions?.upper?.level !== undefined && p.transitions.upper.level !== 35) {
          return { atual: p.transitions.upper.level, correto: 35, profileId: p.id, profileName: p.name };
        }
      }
      return null;
    },
    aplicar: async (headers, base) => {
      const profiles = await fetchJSON(`${base}/api/image/profiles`, { headers });
      for (const p of profiles) {
        if (p.transitions?.upper?.level !== undefined && p.transitions.upper.level !== 35) {
          const t = { ...p.transitions, upper: { ...p.transitions.upper, level: 35 } };
          await fetchJSON(`${base}/api/image/profiles/${p.id}`, { method: "PUT", headers, body: JSON.stringify({ transitions: t }) });
        }
      }
    },
  },
  {
    id: 6,
    titulo: "Transições startTime/endTime ≠ 00:00:00 (janela restrita)",
    severidade: "alto",
    parametro: "Transitions.startTime/endTime",
    descricao: "A câmera usa sensores de luz para alternar entre modo Diurno (colorido) e Noturno (infravermelho). Os campos startTime/endTime definem EM QUAL HORÁRIO ela tem permissão para fazer essa troca. Quando está '00:00:00 - 00:00:00' significa 'monitorar 24h' — pode trocar a qualquer momento. Quando está '06:00:00 - 18:00:00' significa que a troca SÓ pode ocorrer nesse intervalo.",
    problema: "Se a câmera está com janela restrita (ex: startTime=06:00, endTime=18:00), e anoitecer depois das 18h, ela NÃO vai trocar para modo Noturno — fica presa no modo Diurno e as imagens ficam completamente escuras/ilegíveis. O mesmo vale se amanhecer antes das 06h. O correto é 00:00:00 em todos os campos = transição liberada 24h, baseada apenas na luminosidade real.",
    correcao: "Na interface web da câmera: menu lateral 'Imagem' › clicar em 'Transições' › na 'Agenda de Transições' clicar no ícone de lápis (✏️) ao lado de cada uma das 4 linhas (Diurno superior, Diurno inferior, Noturno superior, Noturno inferior) › alterar os campos de horário para 00:00:00 - 00:00:00 › clicar Salvar. Via API: PUT /api/image/profiles/{id} com body { transitions: { lower: { startTime: '00:00:00', endTime: '00:00:00' }, upper: { startTime: '00:00:00', endTime: '00:00:00' } } }",
    menu: "Interface Web › Imagem › Transições › Agenda de Transições › ícone lápis (✏️) em cada linha › campos de horário → 00:00:00",
    endpoint: "/api/image/profiles/{id}",
    method: "PUT",
    detectar: async (headers, base) => {
      const profiles = await fetchJSON(`${base}/api/image/profiles`, { headers });
      const erros = [];
      for (const p of profiles) {
        const t = p.transitions;
        if (!t) continue;
        if (t.lower?.startTime !== "00:00:00") erros.push(`${p.name}.lower.startTime=${t.lower.startTime}`);
        if (t.lower?.endTime !== "00:00:00") erros.push(`${p.name}.lower.endTime=${t.lower.endTime}`);
        if (t.upper?.startTime !== "00:00:00") erros.push(`${p.name}.upper.startTime=${t.upper.startTime}`);
        if (t.upper?.endTime !== "00:00:00") erros.push(`${p.name}.upper.endTime=${t.upper.endTime}`);
      }
      if (erros.length > 0) return { atual: erros.join(", "), correto: "00:00:00 (todos)" };
      return null;
    },
    aplicar: async (headers, base) => {
      const profiles = await fetchJSON(`${base}/api/image/profiles`, { headers });
      for (const p of profiles) {
        const t = p.transitions;
        if (!t) continue;
        let mudou = false;
        const fix = JSON.parse(JSON.stringify(t));
        if (fix.lower?.startTime !== "00:00:00") { fix.lower.startTime = "00:00:00"; mudou = true; }
        if (fix.lower?.endTime !== "00:00:00") { fix.lower.endTime = "00:00:00"; mudou = true; }
        if (fix.upper?.startTime !== "00:00:00") { fix.upper.startTime = "00:00:00"; mudou = true; }
        if (fix.upper?.endTime !== "00:00:00") { fix.upper.endTime = "00:00:00"; mudou = true; }
        if (mudou) await fetchJSON(`${base}/api/image/profiles/${p.id}`, { method: "PUT", headers, body: JSON.stringify({ transitions: fix }) });
      }
    },
  },
  {
    id: 7,
    titulo: "OCR Processing Mode = triggered (depende do laço)",
    severidade: "alto",
    parametro: "OCR.processingMode",
    descricao: "O 'processingMode' define QUANDO o OCR tenta ler placas. Valor 2 (triggered) = só processa quando recebe sinal do laço indutivo no asfalto. Valor 3 (freeflow) = processa todos os frames continuamente.",
    problema: "No modo triggered, se o laço indutivo falhar (problema físico, curto, delay), o OCR simplesmente PARA — não lê nenhuma placa até o laço voltar. No freeflow, o OCR funciona independente do laço, muito mais robusto.",
    correcao: "Acessar: Interface Web da câmera › menu 'Equipamento' › 'Reconhecimento' › aba 'Jidosha' › campo 'Modo de processamento' › selecionar 'Freeflow (3)'. Via API: PUT /api/equipment/ocr com body { ocr: { processingMode: 3 } }",
    menu: "Interface Web › Equipamento › Reconhecimento › aba 'Jidosha' › campo 'Modo de processamento'",
    endpoint: "/api/equipment/ocr",
    method: "PUT",
    detectar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/equipment/ocr`, { headers });
      if (r?.ocr?.processingMode !== undefined && r.ocr.processingMode !== 3) return { atual: r.ocr.processingMode, correto: 3 };
      return null;
    },
    aplicar: async (headers, base) => {
      return fetchJSON(`${base}/api/equipment/ocr`, { method: "PUT", headers, body: JSON.stringify({ ocr: { processingMode: 3 } }) });
    },
  },
  {
    id: 8,
    titulo: "OCR Processing Threads = 1-2 (hit rate reduzido)",
    severidade: "alto",
    parametro: "OCR.processingThreads",
    descricao: "O 'processingThreads' define quantas threads do processador são dedicadas exclusivamente ao motor OCR Jidosha. Mais threads = mais frames processados em paralelo.",
    problema: "Com 1-2 threads, em horários de pico (7h-9h, 17h-19h) o OCR não dá conta de processar todos os frames a tempo — veículos passam sem ter a placa lida. Com 4 threads, a câmera tem capacidade de processar até 4 frames simultaneamente.",
    correcao: "Acessar: Interface Web da câmera › menu 'Equipamento' › 'Reconhecimento' › aba 'Jidosha' › campo 'Threads de processamento' › alterar para 4. Via API: PUT /api/equipment/ocr com body { ocr: { processingThreads: 4 } }",
    menu: "Interface Web › Equipamento › Reconhecimento › aba 'Jidosha' › campo 'Threads de processamento'",
    endpoint: "/api/equipment/ocr",
    method: "PUT",
    detectar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/equipment/ocr`, { headers });
      if (r?.ocr?.processingThreads !== undefined && r.ocr.processingThreads < 4) return { atual: r.ocr.processingThreads, correto: 4 };
      return null;
    },
    aplicar: async (headers, base) => {
      return fetchJSON(`${base}/api/equipment/ocr`, { method: "PUT", headers, body: JSON.stringify({ ocr: { processingThreads: 4 } }) });
    },
  },
  {
    id: 9,
    titulo: "OCR Max Plates = 1 (perde 2º veículo)",
    severidade: "medio",
    parametro: "OCR.maxPlates",
    descricao: "O 'maxPlates' define quantas placas diferentes o OCR tenta detectar em um mesmo frame. Valor 1 = se aparecerem 2 veículos juntos, só 1 é lido.",
    problema: "Em situações de ultrapassagem, fila ou mudança de faixa, 2 veículos podem estar no campo de visão ao mesmo tempo. Com maxPlates=1, o segundo veículo é completamente ignorado — perda de leitura.",
    correcao: "Acessar: Interface Web da câmera › menu 'Equipamento' › 'Reconhecimento' › aba 'Jidosha' › campo 'Máx. placas por frame' › alterar para 2. Via API: PUT /api/equipment/ocr com body { ocr: { maxPlates: 2 } }",
    menu: "Interface Web › Equipamento › Reconhecimento › aba 'Jidosha' › campo 'Máx. placas por frame'",
    endpoint: "/api/equipment/ocr",
    method: "PUT",
    detectar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/equipment/ocr`, { headers });
      if (r?.ocr?.maxPlates !== undefined && r.ocr.maxPlates < 2) return { atual: r.ocr.maxPlates, correto: 2 };
      return null;
    },
    aplicar: async (headers, base) => {
      return fetchJSON(`${base}/api/equipment/ocr`, { method: "PUT", headers, body: JSON.stringify({ ocr: { maxPlates: 2 } }) });
    },
  },
  {
    id: 10,
    titulo: "OCR Processing Queue = 2 (fila curta)",
    severidade: "medio",
    parametro: "OCR.processingQueue",
    descricao: "O 'processingQueue' é o buffer de frames esperando para ser processados pelo OCR. Funciona como uma fila: se o OCR está ocupado, os frames ficam na fila até serem processados.",
    problema: "Com fila=2, se o OCR estiver ocupado processando, apenas 2 frames ficam em espera — os demais são descartados. Com fila=4, há mais margem para picos de tráfego sem perder frames.",
    correcao: "Acessar: Interface Web da câmera › menu 'Equipamento' › 'Reconhecimento' › aba 'Jidosha' › campo 'Fila de processamento' › alterar para 4. Via API: PUT /api/equipment/ocr com body { ocr: { processingQueue: 4 } }",
    menu: "Interface Web › Equipamento › Reconhecimento › aba 'Jidosha' › campo 'Fila de processamento'",
    endpoint: "/api/equipment/ocr",
    method: "PUT",
    detectar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/equipment/ocr`, { headers });
      if (r?.ocr?.processingQueue !== undefined && r.ocr.processingQueue < 4) return { atual: r.ocr.processingQueue, correto: 4 };
      return null;
    },
    aplicar: async (headers, base) => {
      return fetchJSON(`${base}/api/equipment/ocr`, { method: "PUT", headers, body: JSON.stringify({ ocr: { processingQueue: 4 } }) });
    },
  },
  {
    id: 11,
    titulo: "Classificador Queue = 4 (desperdício de memória)",
    severidade: "baixo",
    parametro: "Classificador.processingQueue",
    descricao: "O classificador identifica o TIPO do veículo (carro/moto/caminhão). Sua 'processingQueue' define quantos veículos ficam em fila esperando classificação. Cada slot consome memória RAM.",
    problema: "Estes equipamentos monitoram faixa única. Com fila=4, a câmera reserva memória para 4 classificações simultâneas que nunca acontecem (1 veículo por vez na faixa). Essa RAM desperdiçada pode atrasar o OCR.",
    correcao: "Acessar: Interface Web da câmera › menu 'Equipamento' › 'Reconhecimento' › aba 'Classifier' › campo 'Fila de processamento' › alterar para 1. Via API: PUT /api/equipment/classifier com body { classifier: { processingQueue: 1 } }",
    menu: "Interface Web › Equipamento › Reconhecimento › aba 'Classifier' › campo 'Fila de processamento'",
    endpoint: "/api/equipment/classifier",
    method: "PUT",
    detectar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/equipment/classifier`, { headers });
      if (r?.classifier?.processingQueue !== undefined && r.classifier.processingQueue > 1) return { atual: r.classifier.processingQueue, correto: 1 };
      return null;
    },
    aplicar: async (headers, base) => {
      return fetchJSON(`${base}/api/equipment/classifier`, { method: "PUT", headers, body: JSON.stringify({ classifier: { processingQueue: 1 } }) });
    },
  },
  {
    id: 12,
    titulo: "Classificador Threads = 2-4 (desperdício de CPU)",
    severidade: "baixo",
    parametro: "Classificador.processingThreads",
    descricao: "O 'processingThreads' do classificador define quantos núcleos de CPU são dedicados para classificar veículos. Cada thread extra é CPU que NÃO está disponível para o OCR.",
    problema: "Em faixa única, passa 1 veículo por vez — 1 thread classifica perfeitamente. Com 2-4 threads no classificador, a CPU fica sobrecarregada desnecessariamente, tirando recursos do OCR (que é mais importante).",
    correcao: "Acessar: Interface Web da câmera › menu 'Equipamento' › 'Reconhecimento' › aba 'Classifier' › campo 'Threads de processamento' › alterar para 1. Via API: PUT /api/equipment/classifier com body { classifier: { processingThreads: 1 } }",
    menu: "Interface Web › Equipamento › Reconhecimento › aba 'Classifier' › campo 'Threads de processamento'",
    endpoint: "/api/equipment/classifier",
    method: "PUT",
    detectar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/equipment/classifier`, { headers });
      if (r?.classifier?.processingThreads !== undefined && r.classifier.processingThreads > 1) return { atual: r.classifier.processingThreads, correto: 1 };
      return null;
    },
    aplicar: async (headers, base) => {
      return fetchJSON(`${base}/api/equipment/classifier`, { method: "PUT", headers, body: JSON.stringify({ classifier: { processingThreads: 1 } }) });
    },
  },
  {
    id: 13,
    titulo: "NTP Server divergente",
    severidade: "baixo",
    parametro: "NTP.server",
    descricao: "O servidor NTP sincroniza o relógio da câmera com a hora real. Se o relógio estiver errado, timestamps das infrações ficam incorretos e podem ser contestados judicialmente.",
    problema: "Alguns equipamentos usam '200.160.0.8' (NTP.br) ao invés de 'time.google.com'. Ambos funcionam, mas a padronização em time.google.com (CDN global, mais confiável) facilita diagnóstico quando há problema de horário.",
    correcao: "Acessar: Interface Web da câmera › menu 'Sistema' › 'Geral' › 'Data e Hora' › seção NTP › campo 'Servidor' › alterar para time.google.com. Via API: PUT /api/equipment/dateAndTime com body { ntp: { server: 'time.google.com' } }",
    menu: "Interface Web › Sistema › Geral › Data e Hora › seção NTP › campo 'Servidor'",
    endpoint: "/api/equipment/dateAndTime",
    method: "PUT",
    detectar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/equipment/dateAndTime`, { headers });
      if (r?.ntp?.server && r.ntp.server !== "time.google.com") return { atual: r.ntp.server, correto: "time.google.com" };
      return null;
    },
    aplicar: async (headers, base) => {
      return fetchJSON(`${base}/api/equipment/dateAndTime`, { method: "PUT", headers, body: JSON.stringify({ ntp: { server: "time.google.com" } }) });
    },
  },
  {
    id: 14,
    titulo: "SNMP habilitado (superfície de ataque)",
    severidade: "baixo",
    parametro: "SNMP.enabled",
    descricao: "O SNMP é um protocolo de monitoramento de rede (usado para verificar status de equipamentos remotos). Nesta frota, NÃO é utilizado — toda comunicação é via VARCO/REST.",
    problema: "SNMP ativo sem necessidade consome CPU/memória e expõe a câmera a consultas não autorizadas (versões SNMPv1/v2c não têm criptografia). É uma porta de entrada desnecessária.",
    correcao: "Acessar: Interface Web da câmera › menu 'Sistema' › 'Monitoramento' › seção 'SNMP' › desmarcar 'Habilitado'. Via API: PUT /api/system/monitoring/snmp com body { enabled: false }",
    menu: "Interface Web › Sistema › Monitoramento › seção 'SNMP' › checkbox 'Habilitado'",
    endpoint: "/api/system/monitoring/snmp",
    method: "PUT",
    detectar: async (headers, base) => {
      const r = await fetchJSON(`${base}/api/system/monitoring/snmp`, { headers });
      if (r?.enabled === true) return { atual: true, correto: false };
      return null;
    },
    aplicar: async (headers, base) => {
      return fetchJSON(`${base}/api/system/monitoring/snmp`, { method: "PUT", headers, body: JSON.stringify({ enabled: false }) });
    },
  },
];

// ═══ UTILS ═══
async function fetchJSON(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(timer); }
}

async function authenticate(baseUrl) {
  const data = await fetchJSON(`${baseUrl}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ params: CREDENTIALS }),
  });
  return data.token || data.accessToken;
}

// ═══ CARREGAR INVENTÁRIO DE DISPOSITIVOS ═══
function loadInventario() {
  // Ler inventário de devices (com UUIDs) e cruzar com validação
  const devFile = resolve(__dirname, "devices-inventory.json");
  if (!existsSync(devFile)) {
    console.error("❌ Arquivo devices-inventory.json não encontrado.");
    process.exit(1);
  }
  const devList = JSON.parse(readFileSync(devFile, "utf8"));
  // Criar mapa nome→uuid
  const uuidMap = {};
  for (const d of devList) {
    uuidMap[d.name] = d.uuid;
  }

  // Ler validacao-config.json para saber quais estão online
  const valFile = resolve(__dirname, "validacao-config.json");
  if (!existsSync(valFile)) {
    // Se não existir, usar devices-inventory direto
    return devList.map(d => ({ nome: d.name, uuid: d.uuid, faixa: d.name.includes("Faixa 2") ? 2 : 1 }));
  }
  const val = JSON.parse(readFileSync(valFile, "utf8"));
  const devices = [];
  const addDevices = (arr) => {
    if (!arr) return;
    for (const d of arr) {
      const nome = d.nome || d.name;
      const uuid = d.uuid || uuidMap[nome];
      if (uuid) devices.push({ nome, uuid, faixa: d.faixa || (nome.includes("Faixa 2") ? 2 : 1) });
    }
  };
  addDevices(val.conformes);
  if (val.grupos) {
    for (const g of val.grupos) {
      addDevices(g.dispositivos);
    }
  }
  // Se não pegou nada das validações, usa inventário completo
  if (devices.length === 0) {
    return devList.map(d => ({ nome: d.name, uuid: d.uuid, faixa: d.name.includes("Faixa 2") ? 2 : 1 }));
  }
  return devices;
}

// ═══ MAIN ═══
async function main() {
  const devices = loadInventario();
  const filteredDevices = EQUIP_FILTER ? devices.filter(d => d.nome.toLowerCase().includes(EQUIP_FILTER)) : devices;

  console.log("╔═══════════════════════════════════════════════════════════════╗");
  console.log(`║  PLANO DE CORREÇÃO — Frota ITScam 450 SETRANS-GO             ║`);
  console.log(`║  Modo: ${MODE === "aplicar" ? "APLICAÇÃO REAL ⚡" : "ANÁLISE (plano)  📋"}                                  ║`);
  console.log(`║  Dispositivos: ${filteredDevices.length.toString().padEnd(3)} | Casos de correção: ${CASOS.length}            ║`);
  console.log("╚═══════════════════════════════════════════════════════════════╝\n");

  const plano = {
    geradoEm: new Date().toISOString(),
    modo: MODE,
    totalDispositivos: filteredDevices.length,
    totalCasos: CASOS.length,
    casos: [],
  };

  const casosToRun = CASO_FILTER ? CASOS.filter(c => c.id === parseInt(CASO_FILTER)) : CASOS;

  for (const caso of casosToRun) {
    const casoResult = {
      id: caso.id,
      titulo: caso.titulo,
      severidade: caso.severidade,
      parametro: caso.parametro,
      descricao: caso.descricao,
      problema: caso.problema,
      correcao: caso.correcao,
      menu: caso.menu,
      endpoint: caso.endpoint,
      afetados: [],
      conformes: [], // equipamentos que JÁ estão corretos (2 exemplos aleatórios)
      totalAfetados: 0,
    };

    process.stdout.write(`\n  [Caso ${caso.id}/${CASOS.length}] ${caso.titulo}\n`);
    process.stdout.write(`  Verificando ${filteredDevices.length} equipamentos... `);

    let checados = 0;
    const todosConformes = []; // coleta todos que estão OK para sortear exemplos
    for (const dev of filteredDevices) {
      try {
        const baseUrl = `https://${dev.uuid}-80.tunnel.varco.cloud`;
        const token = await authenticate(baseUrl);
        const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

        const resultado = await caso.detectar(headers, baseUrl);
        if (resultado) {
          casoResult.afetados.push({
            nome: dev.nome,
            uuid: dev.uuid,
            faixa: dev.faixa,
            ...resultado,
          });

          if (MODE === "aplicar") {
            try {
              await caso.aplicar(headers, baseUrl, resultado);
              casoResult.afetados[casoResult.afetados.length - 1].corrigido = true;
            } catch (e) {
              casoResult.afetados[casoResult.afetados.length - 1].corrigido = false;
              casoResult.afetados[casoResult.afetados.length - 1].erro = e.message;
            }
          }
        } else {
          // Equipamento CONFORME — valor correto
          todosConformes.push({ nome: dev.nome, uuid: dev.uuid, faixa: dev.faixa, valor: caso.payload ? Object.values(caso.payload).flat?.()?.[0] ?? Object.values(caso.payload)[0] : "correto" });
        }
      } catch (e) {
        // Offline ou erro de rede - skip
      }
      checados++;
      if (checados % 10 === 0) process.stdout.write(".");
    }

    // Sortear 2 exemplos aleatórios de conformes como referência
    if (todosConformes.length > 0) {
      const shuffled = todosConformes.sort(() => Math.random() - 0.5);
      casoResult.conformes = shuffled.slice(0, 2).map(c => ({ nome: c.nome, faixa: c.faixa }));
    }

    casoResult.totalAfetados = casoResult.afetados.length;
    plano.casos.push(casoResult);

    if (casoResult.totalAfetados === 0) {
      console.log(`✅ Nenhum afetado`);
    } else {
      const icon = MODE === "aplicar" ? "🔧" : "⚠️";
      console.log(`${icon} ${casoResult.totalAfetados} equipamento(s) afetado(s)`);
      for (const a of casoResult.afetados) {
        const status = MODE === "aplicar" ? (a.corrigido ? "✅ corrigido" : `❌ ${a.erro}`) : `${a.atual} → ${a.correto}`;
        console.log(`     ${a.nome.padEnd(25)} ${status}`);
      }
    }
  }

  // Resumo
  const totalAfetados = plano.casos.reduce((s, c) => s + c.totalAfetados, 0);
  const criticos = plano.casos.filter(c => c.severidade === "critico" && c.totalAfetados > 0);

  plano.resumo = {
    totalErrosEncontrados: totalAfetados,
    casosComAfetados: plano.casos.filter(c => c.totalAfetados > 0).length,
    criticos: criticos.length,
    equipamentosUnicos: [...new Set(plano.casos.flatMap(c => c.afetados.map(a => a.nome)))].length,
  };

  console.log(`\n═══════════════════════════════════════════════════════════════`);
  console.log(`  📊 RESUMO DO PLANO`);
  console.log(`  Erros encontrados: ${totalAfetados}`);
  console.log(`  Casos com afetados: ${plano.resumo.casosComAfetados}/${CASOS.length}`);
  console.log(`  Equipamentos únicos afetados: ${plano.resumo.equipamentosUnicos}`);
  console.log(`  Casos CRÍTICOS pendentes: ${criticos.length}`);
  console.log(`═══════════════════════════════════════════════════════════════`);

  // Salvar plano
  const outFile = resolve(__dirname, "plano-correcao.json");
  writeFileSync(outFile, JSON.stringify(plano, null, 2));
  console.log(`\n💾 Plano salvo: ${outFile} (${Math.round(JSON.stringify(plano).length / 1024)}KB)`);
}

main().catch(e => { console.error("❌ Erro fatal:", e.message); process.exit(1); });
