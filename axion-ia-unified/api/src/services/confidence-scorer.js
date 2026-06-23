/**
 * confidence-scorer.js
 * Calcula score de confiança para cada requisito extraído.
 *
 * Score: 0-1 (0 = sem confiança, 1 = total confiança)
 * Baseado em: presença de keywords, estrutura, contexto, verificação cruzada.
 */

/**
 * Avalia confiança de um requisito dado a documentação do sistema.
 *
 * @param {Object} requisito — { texto, origem, secao }
 * @param {Array<string>} docsTexto — textos de documentação do sistema
 * @returns {Object} { confianca: 0-1, motivos: [], evidencias: [] }
 */
export function avaliarConfiancaRequisito(requisito, docsTexto = []) {
  const { texto, origem = "heuristica", secao = "" } = requisito;

  const motivos = [];
  const evidencias = [];
  let score = 0.5; // Score base

  // ─── 1. Fator: origem (IA vs heurística) ───────────────────────
  if (origem === "ia") {
    score += 0.15;
    motivos.push("Extraído por IA (mais contexto)");
  } else if (origem === "heuristica") {
    score += 0.05;
    motivos.push("Extraído por heurística (menos contexto)");
  }

  // ─── 2. Fator: estrutura do texto ───────────────────────────────
  const estrutura = analisarEstrutura(texto);
  score += estrutura.score;
  motivos.push(...estrutura.motivos);

  // ─── 3. Fator: presença em documentação do sistema ──────────────
  if (docsTexto && docsTexto.length > 0) {
    const docScore = calcularSimilaridade(texto, docsTexto);
    score += docScore * 0.2; // Peso 20%
    if (docScore > 0.6) {
      evidencias.push("Termos encontrados na documentação do sistema");
    }
  }

  // ─── 4. Fator: tipo de requisito (cláusula jurídica? hardware? feature?) ──
  const tipo = classificarTipoRequisito(texto);
  if (tipo === "JURIDICO") {
    score -= 0.1;
    motivos.push("Contém linguagem jurídica (menor confiança técnica)");
  } else if (tipo === "HARDWARE") {
    score += 0.1;
    motivos.push("Requisito técnico de hardware (alta especificidade)");
  } else if (tipo === "INTEGRACAO") {
    score += 0.1;
    motivos.push("Requisito de integração (testável)");
  }

  // ─── 5. Fator: comprimento e clareza ──────────────────────────
  const palavras = texto.split(/\s+/).length;
  if (palavras < 5) {
    score -= 0.1;
    motivos.push("Texto muito curto (ambíguo)");
  } else if (palavras > 50) {
    score -= 0.05;
    motivos.push("Texto muito longo (pode incluir contexto irrelevante)");
  } else {
    score += 0.05;
    motivos.push("Comprimento apropriado");
  }

  // ─── 6. Fator: verbos de obrigação ─────────────────────────────
  const temVerboDever = /\b(dever|deve|deverá|deverão|precisa|é obrigatório|é necessário|deve possuir|deve ter|deve incluir|deve suportar|deve permitir|deve garantir|deve realizar|deve integrar|deve exportar|deve importar|deve gerar|deve validar|deve controlar|deve monitorar|deve gerenciar|deve processar|deve registrar|deve emitir|deve calcular|possibilita|disponibiliza)\b/i;

  if (temVerboDever.test(texto)) {
    score += 0.1;
    evidencias.push("Contém verbo de obrigação (verbo claro)");
  } else {
    score -= 0.05;
    motivos.push("Sem verbo claro de obrigação");
  }

  // ─── Normalizar para 0-1 ──────────────────────────────────────
  score = Math.max(0, Math.min(1, score));

  // ─── Classificação final ──────────────────────────────────────
  let nivelConfianca = "BAIXA";
  if (score >= 0.8) nivelConfianca = "MUITO_ALTA";
  else if (score >= 0.65) nivelConfianca = "ALTA";
  else if (score >= 0.45) nivelConfianca = "MEDIA";
  else if (score >= 0.25) nivelConfianca = "BAIXA";
  else nivelConfianca = "MUITO_BAIXA";

  return {
    confianca: score,
    nivel: nivelConfianca,
    tipo_requisito: tipo,
    motivos,
    evidencias,
  };
}

/**
 * Analisa estrutura do texto do requisito.
 */
function analisarEstrutura(texto) {
  const score_base = 0.1;
  const motivos = [];
  let score = score_base;

  // Presença de numeração/pontuação clara
  if (/^(\d+(\.\d+)*|[a-z]\)|\-|•)/.test(texto.trim())) {
    score += 0.1;
    motivos.push("Começa com numeração/marcação (bem estruturado)");
  }

  // Presença de termos técnicos/específicos
  if (/\b(API|REST|SOAP|JSON|XML|HTTP|HTTPS|SFTP|FTP|TCP|UDP|SQL|banco de dados|database|integração|comunicação|protocolo|padrão|formato|codificação|validação|criptografia|certificado|SSL|TLS|autenticação|autorização)\b/i.test(texto)) {
    score += 0.1;
    motivos.push("Contém terminologia técnica (específico)");
  }

  // Presença de unidades/métricas
  if (/\b(MB|GB|TB|ms|ms|s|min|h|°C|kg|km|m|cm|bps|Mbps|Gbps|Hz|kHz|MHz|GHz|V|A|W|kW)\b/.test(texto)) {
    score += 0.1;
    motivos.push("Inclui unidades de medida (testável)");
  }

  // Presença de números/valores específicos
  if (/\d+/.test(texto)) {
    score += 0.05;
    motivos.push("Contém valores numéricos específicos");
  }

  return { score, motivos };
}

/**
 * Classifica o tipo de requisito.
 */
function classificarTipoRequisito(texto) {
  const textoLower = texto.toLowerCase();

  // Jurídico/contratual
  if (/\b(cláusula|artigo|caução|garantia|seguro|multa|penalidade|sanção|rescisão|rescisão|vigência|foro|reajuste|equilíbrio econômico|penalidade|juros|mora|indenização)\b/.test(textoLower)) {
    return "JURIDICO";
  }

  // Hardware
  if (/\b(equipamento|hardware|dispositivo|sensor|câmera|radar|balança|leitor|terminal|servidor|computador|processador|memória|processamento|GB|MHz|GHz|processador|placa|interface|conector|voltagem|potência|watts|ampere|fonte|alimentação)\b/.test(textoLower)) {
    return "HARDWARE";
  }

  // Integração/comunicação
  if (/\b(integração|comunicação|protocolo|API|REST|SOAP|JSON|XML|HTTP|FTP|SFTP|banco de dados|conexão|interface|compatibilidade|padrão|formato|dados|importação|exportação|sincronização)\b/.test(textoLower)) {
    return "INTEGRACAO";
  }

  // Funcionalidade/feature
  if (/\b(funcionalidade|recurso|feature|módulo|sistema|aplicação|software|tela|formulário|relatório|gerar|criar|editar|deletar|visualizar|pesquisar|filtrar|ordenar|exportar|importar)\b/.test(textoLower)) {
    return "FEATURE";
  }

  // Performance/SLA
  if (/\b(performance|latência|tempo de resposta|throughput|disponibilidade|uptime|SLA|tempo de processamento|ms|segundos|garantia de serviço|backup|recuperação)\b/.test(textoLower)) {
    return "PERFORMANCE";
  }

  return "OUTRO";
}

/**
 * Calcula similaridade entre um requisito e a documentação usando bag-of-words.
 */
function calcularSimilaridade(texto, docsTexto) {
  if (!docsTexto || docsTexto.length === 0) return 0;

  // Extrair termos-chave do requisito (palavras > 4 caracteres)
  const termosRequisito = new Set(
    texto
      .toLowerCase()
      .match(/\b\w{4,}\b/g) || []
  );

  if (termosRequisito.size === 0) return 0;

  // Contar quantos docs contêm esses termos
  let matches = 0;
  docsTexto.forEach(doc => {
    const docTextoLower = doc.toLowerCase();
    const termosEncontrados = Array.from(termosRequisito).filter(termo =>
      docTextoLower.includes(termo)
    );
    matches += termosEncontrados.length;
  });

  // Score: quantidade de matches / quantidade total de termos
  return Math.min(1, matches / (termosRequisito.size * docsTexto.length));
}

/**
 * Calcula confiança agregada de um relatório de conformidade.
 */
export function calcularConfiancaAgregada(itens) {
  if (!itens || itens.length === 0) return 0.5;

  const confiancas = itens
    .map(item => item.confianca || 0)
    .filter(c => typeof c === "number");

  if (confiancas.length === 0) return 0.5;

  const media = confiancas.reduce((a, b) => a + b, 0) / confiancas.length;
  const desvio = Math.sqrt(
    confiancas.reduce((sum, c) => sum + Math.pow(c - media, 2), 0) /
    confiancas.length
  );

  // Penalizar se há muita variação (itens inconsistentes)
  const ajuste = desvio > 0.3 ? 0.9 : 1;

  return Math.min(1, media * ajuste);
}

/**
 * Identifica itens que precisam de revisão (confiança baixa).
 */
export function identificarItensParaRevisao(itens, limiarConfianca = 0.6) {
  return itens.filter(item => 
    (item.confianca || 0) < limiarConfianca
  ).sort((a, b) => (a.confianca || 0) - (b.confianca || 0));
}
