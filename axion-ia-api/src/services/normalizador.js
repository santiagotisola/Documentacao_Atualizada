/**
 * normalizador.js
 * Normaliza termos equivalentes para melhorar a precisão da comparação.
 * Mantido separado para facilitar expansão do dicionário.
 */

// Dicionário: chave = termo canônico, valores = variantes a substituir
const DICIONARIO = {
  // Licitação
  "pregao eletronico":   ["pregão eletrônico", "pregão eletronico", "pe ", "preg\\.eltr", "licitação online", "licitacao online"],
  "concorrencia publica":["concorrência pública", "concorrencia publica", "concorrência"],
  "dispensa licitacao":  ["dispensa de licitação", "dispensa licitação", "dispensa eletronica", "dispensa eletrônica"],
  "chamada publica":     ["chamada pública", "edital público", "aviso de licitação"],
  // Contrato / Edital
  "contrato administrativo": ["contrato de prestação", "contrato de serviço", "contratação pública", "instrumento contratual"],
  "edital":              ["aviso edital", "edital de licitação", "publicação edital"],
  // Sistemas e cadastro
  "cadastro fornecedor": ["sicaf", "registro fornecedor", "cadastramento fornecedor", "habilitação fornecedor"],
  "nota fiscal":         ["nf-e", "nfe", "nota fiscal eletrônica", "danfe"],
  // AxHub — pesagem e controle
  "pesagem":             ["pesagem veicular", "controle de peso", "balança veicular", "peso bruto total", "pbt"],
  "infracao":            ["infração", "auto de infração", "autuação", "multa", "penalidade"],
  "equipamento":         ["equipamento medidor", "radar", "sensor de velocidade", "leitor de placa", "detector"],
  "aferição":            ["aferimento", "calibração", "certificado de aferição", "metrologia"],
  "monitoramento":       ["monitoramento viário", "controle de tráfego", "fiscalização eletrônica", "fiscalização de trânsito"],
  // AxTon — balança
  "balança veicular":    ["posto de pesagem", "balança rodoviária", "ponto de pesagem", "via balança"],
  "cronotacografo":      ["cronotacógrafo", "tacógrafo", "jornada motorista", "tacografia"],
  // AxCross — cruzamentos
  "controle cruzamento": ["cruzamento semaforizado", "interseção viária", "semáforo inteligente"],
  "passagem":            ["passagem de veículo", "detecção de passagem", "leitura de placa", "occp"],
  // Integração / Dados
  "integracao sistema":  ["api de integração", "webservice", "web service", "integração de dados", "importação banco"],
  "relatorio":           ["relatório gerencial", "extrato", "exportação pdf", "dashboard relatório"],
  // Veículos
  "veiculo":             ["veículo pesado", "caminhão", "ônibus", "automóvel", "motocicleta", "veículo de carga"],
  "placa veicular":      ["placa do veículo", "identificação veicular", "leitura de placa", "ocr placa"],
};

/**
 * Remove acentos e normaliza para string comparável.
 */
export function removerAcentos(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Aplica o dicionário substituindo variantes pelo termo canônico.
 * @param {string} texto
 * @returns {string} texto normalizado
 */
export function normalizarTexto(texto) {
  let t = removerAcentos(texto);

  for (const [canonico, variantes] of Object.entries(DICIONARIO)) {
    for (const variante of variantes) {
      try {
        const regex = new RegExp("\\b" + removerAcentos(variante).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
        t = t.replace(regex, canonico);
      } catch { /* ignora regex inválida */ }
    }
  }

  return t;
}

/**
 * Retorna o dicionário atual (para exibição no painel).
 */
export function obterDicionario() {
  return Object.entries(DICIONARIO).map(([canonico, variantes]) => ({
    canonico,
    variantes,
    total: variantes.length,
  }));
}
