import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = join(__dirname, '..', 'logs');
const HISTORICO_FILE = join(LOGS_DIR, 'historico.json');
const NAO_RESPONDIDAS_FILE = join(LOGS_DIR, 'nao-respondidas.json');

// Criar pasta logs se não existir
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function carregarJSON(arquivo) {
  if (!fs.existsSync(arquivo)) return [];
  const data = fs.readFileSync(arquivo, 'utf8');
  return JSON.parse(data);
}

function salvarJSON(arquivo, dados) {
  fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2), 'utf8');
}

/**
 * Salva toda interação no histórico (log completo)
 */
export function salvarHistorico({ mensagem, origem, resposta }) {
  const historico = carregarJSON(HISTORICO_FILE);

  historico.push({
    timestamp: new Date().toISOString(),
    mensagem,
    origem,  // "kb" ou "openai"
    resposta
  });

  salvarJSON(HISTORICO_FILE, historico);
}

/**
 * Salva perguntas que NÃO foram encontradas no KB
 * Para revisão e treinamento futuro
 */
export function salvarNaoRespondida(mensagem) {
  const lista = carregarJSON(NAO_RESPONDIDAS_FILE);

  // Evita duplicatas
  const jaExiste = lista.some(item => item.mensagem.toLowerCase() === mensagem.toLowerCase());
  if (jaExiste) return;

  lista.push({
    timestamp: new Date().toISOString(),
    mensagem,
    status: "pendente"  // pendente | revisado | adicionado_ao_kb
  });

  salvarJSON(NAO_RESPONDIDAS_FILE, lista);
}

/**
 * Retorna histórico completo
 */
export function obterHistorico() {
  return carregarJSON(HISTORICO_FILE);
}

/**
 * Retorna perguntas pendentes de revisão
 */
export function obterNaoRespondidas() {
  return carregarJSON(NAO_RESPONDIDAS_FILE);
}

/**
 * Estatísticas do sistema
 */
export function obterEstatisticas() {
  const historico = carregarJSON(HISTORICO_FILE);
  const naoRespondidas = carregarJSON(NAO_RESPONDIDAS_FILE);

  const totalInteracoes = historico.length;
  const viaKB = historico.filter(h => h.origem === 'kb').length;
  const viaOpenAI = historico.filter(h => h.origem === 'openai').length;
  const pendentes = naoRespondidas.filter(n => n.status === 'pendente').length;

  return {
    totalInteracoes,
    viaKB,
    viaOpenAI,
    taxaKB: totalInteracoes > 0 ? Math.round((viaKB / totalInteracoes) * 100) + '%' : '0%',
    perguntasPendentes: pendentes,
    totalNaoRespondidas: naoRespondidas.length
  };
}
