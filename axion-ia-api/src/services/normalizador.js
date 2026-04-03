/**
 * normalizador.js
 * Normaliza termos equivalentes para melhorar a precisão da comparação.
 */

const DICIONARIO = {
  "pregao eletronico":        ["pregão eletrônico", "pregão eletronico", "licitação online", "licitacao online"],
  "concorrencia publica":     ["concorrência pública", "concorrencia publica", "concorrência"],
  "dispensa licitacao":       ["dispensa de licitação", "dispensa eletronica", "dispensa eletrônica"],
  "chamada publica":          ["chamada pública", "aviso de licitação", "edital público"],
  "contrato administrativo":  ["contrato de prestação", "contrato de serviço", "contratação pública"],
  "edital":                   ["aviso edital", "edital de licitação", "publicação edital"],
  "cadastro fornecedor":      ["sicaf", "registro fornecedor", "habilitação fornecedor"],
  "nota fiscal":              ["nf-e", "nfe", "nota fiscal eletrônica"],
  "pesagem":                  ["pesagem veicular", "controle de peso", "peso bruto total", "pbt"],
  "infracao":                 ["infração", "auto de infração", "autuação", "multa", "penalidade"],
  "equipamento":              ["equipamento medidor", "radar", "sensor de velocidade", "leitor de placa", "detector"],
  "afericao":                 ["aferição", "aferimento", "calibração", "certificado de aferição", "metrologia"],
  "monitoramento":            ["monitoramento viário", "controle de tráfego", "fiscalização eletrônica", "fiscalização de trânsito"],
  "balanca veicular":         ["posto de pesagem", "balança rodoviária", "ponto de pesagem"],
  "cronotacografo":           ["cronotacógrafo", "tacógrafo", "jornada motorista"],
  "controle cruzamento":      ["cruzamento semaforizado", "interseção viária", "semáforo inteligente"],
  "passagem":                 ["passagem de veículo", "detecção de passagem", "leitura de placa"],
  "integracao sistema":       ["api de integração", "webservice", "web service", "importação banco"],
  "relatorio":                ["relatório gerencial", "extrato", "exportação pdf"],
  "veiculo":                  ["veículo pesado", "caminhão", "ônibus", "automóvel", "veículo de carga"],
  "placa veicular":           ["placa do veículo", "identificação veicular", "leitura de placa", "ocr placa"],
};

export function removerAcentos(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

export function obterDicionario() {
  return Object.entries(DICIONARIO).map(([canonico, variantes]) => ({
    canonico,
    variantes,
    total: variantes.length,
  }));
}
