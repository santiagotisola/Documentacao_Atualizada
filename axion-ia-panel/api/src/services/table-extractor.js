/**
 * table-extractor.js
 * Extrai tabelas estruturadas de texto de edital.
 * Detecta padrões de tabela (linhas com | ou espaçamento uniforme) e retorna JSON estruturado.
 *
 * Útil para:
 *  - Tabelas de preços
 *  - Requisitos técnicos com múltiplas colunas
 *  - Cronogramas
 */

/**
 * Detecta e extrai tabelas do texto.
 * Retorna array de { tipo, headers, rows, texto_original }
 */
export function extrairTabelas(texto) {
  const tabelas = [];
  const linhas = texto.split("\n");
  
  let i = 0;
  while (i < linhas.length) {
    const linha = linhas[i];
    
    // Padrão 1: Tabela com separadores | (pipe)
    if (linha.includes("|")) {
      const tabelaPipe = extrairTabelaPipe(linhas, i);
      if (tabelaPipe) {
        tabelas.push(tabelaPipe);
        i = tabelaPipe.fim_indice;
        continue;
      }
    }
    
    // Padrão 2: Tabela com espaçamento uniforme (colunas alinhadas)
    if (pareceSerCabecalhoTabela(linha)) {
      const tabelaEspacada = extrairTabelaEspacada(linhas, i);
      if (tabelaEspacada && tabelaEspacada.rows.length > 0) {
        tabelas.push(tabelaEspacada);
        i = tabelaEspacada.fim_indice;
        continue;
      }
    }
    
    i++;
  }
  
  return tabelas;
}

/**
 * Extrai tabela com separador | (formato Markdown).
 */
function extrairTabelaPipe(linhas, inicio) {
  const resultado = {
    tipo: "pipe",
    headers: [],
    rows: [],
    texto_original: [],
    fim_indice: inicio,
  };
  
  let i = inicio;
  
  // Ler linha de headers
  if (i < linhas.length && linhas[i].includes("|")) {
    const headers = linhas[i]
      .split("|")
      .map(h => h.trim())
      .filter(h => h.length > 0);
    
    if (headers.length > 1) {
      resultado.headers = headers;
      resultado.texto_original.push(linhas[i]);
      i++;
    }
  }
  
  // Pular linha de separador (se existir)
  if (i < linhas.length && /^\|?[\s\-|:]+\|?$/.test(linhas[i])) {
    resultado.texto_original.push(linhas[i]);
    i++;
  }
  
  // Ler linhas de dados
  while (i < linhas.length && linhas[i].includes("|")) {
    const row = linhas[i]
      .split("|")
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0);
    
    if (row.length === resultado.headers.length || row.length > 0) {
      resultado.rows.push(row);
      resultado.texto_original.push(linhas[i]);
    } else {
      break;
    }
    
    i++;
  }
  
  resultado.fim_indice = i;
  
  return resultado.rows.length > 0 ? resultado : null;
}

/**
 * Extrai tabela com espaçamento uniforme (colunas alinhadas por posição).
 */
function extrairTabelaEspacada(linhas, inicio) {
  const resultado = {
    tipo: "espacada",
    headers: [],
    rows: [],
    texto_original: [],
    fim_indice: inicio,
  };
  
  let i = inicio;
  const linhaHeaders = linhas[i];
  
  // Detectar posições de colunas pela presença de espaços duplos ou mais
  const colunas = detectarColunasEspacadas(linhaHeaders);
  
  if (colunas.length < 2) {
    return null; // Não é tabela
  }
  
  // Extrair headers
  resultado.headers = extrairPorColunas(linhaHeaders, colunas);
  resultado.texto_original.push(linhaHeaders);
  i++;
  
  // Pular linha de separador (se tiver hífens)
  if (i < linhas.length && /^[\s\-=]+$/.test(linhas[i])) {
    resultado.texto_original.push(linhas[i]);
    i++;
  }
  
  // Ler linhas enquanto tiverem dados alinhados nas mesmas colunas
  let linhasContiguas = 0;
  while (i < linhas.length && linhasContiguas < 50) { // Limitar para evitar ler todo o arquivo
    const linha = linhas[i];
    
    // Para se encontrar linha vazia ou muito diferente
    if (linha.trim().length === 0) {
      break;
    }
    
    // Verificar se linha parece fazer parte da tabela
    if (pareceSerLinhaTabela(linha, colunas)) {
      const row = extrairPorColunas(linha, colunas);
      resultado.rows.push(row);
      resultado.texto_original.push(linha);
      linhasContiguas++;
    } else if (resultado.rows.length > 0) {
      break; // Fim da tabela
    }
    
    i++;
  }
  
  resultado.fim_indice = i;
  
  return resultado.rows.length > 0 ? resultado : null;
}

/**
 * Detecta posições de colunas procurando por gaps de espaços.
 */
function detectarColunasEspacadas(linha) {
  const colunas = [];
  let emGap = true;
  
  for (let i = 0; i < linha.length; i++) {
    const ehEspaco = /\s/.test(linha[i]);
    
    if (!ehEspaco && emGap) {
      colunas.push(i); // Início de coluna
      emGap = false;
    } else if (ehEspaco && !emGap) {
      emGap = true;
    }
  }
  
  return colunas;
}

/**
 * Extrai valores de uma linha usando as posições de colunas.
 */
function extrairPorColunas(linha, colunas) {
  const valores = [];
  
  for (let i = 0; i < colunas.length; i++) {
    const inicio = colunas[i];
    const fim = i < colunas.length - 1 ? colunas[i + 1] : linha.length;
    
    const valor = linha
      .substring(inicio, fim)
      .trim();
    
    if (valor.length > 0) {
      valores.push(valor);
    }
  }
  
  return valores;
}

/**
 * Heurística: detecta se uma linha parece ser cabeçalho de tabela.
 */
function pareceSerCabecalhoTabela(linha) {
  const palavrasChave = /^(ITEM|DESCRIÇÃO|VALOR|QUANTIDADE|UNITÁRIO|TOTAL|REQUISITO|ESPECIFICAÇÃO|CATEGORIA|TIPO|MODALIDADE|PERÍODO|DATA|STATUS)/i;
  return (
    palavrasChave.test(linha) &&
    linha.length > 15 &&
    (linha.includes("  ") || linha.includes("|"))
  );
}

/**
 * Heurística: detecta se uma linha parece ser dado de tabela.
 */
function pareceSerLinhaTabela(linha, colunas) {
  // Linhas com números, valores monetários, ou que se alinham com as colunas
  const temNumero = /\d/.test(linha);
  const temAlineamento = colunas.some(col => col < linha.length && !/\s/.test(linha[col]));
  
  return (temNumero || temAlineamento) && linha.trim().length > 5;
}

/**
 * Converte tabelas extraídas em formato legível/estruturado.
 */
export function formatarTabelasParaAnalise(tabelas) {
  return tabelas.map((tbl, idx) => {
    const header = tbl.headers.join(" | ");
    const dados = tbl.rows
      .map(row => row.join(" | "))
      .join("\n");
    
    return `\n=== TABELA ${idx + 1} (tipo: ${tbl.tipo}) ===\n${header}\n${dados}`;
  }).join("\n");
}

/**
 * API principal: extrai e formata tabelas de um texto.
 */
export function extrairEFormatarTabelas(texto) {
  const tabelas = extrairTabelas(texto);
  return {
    total: tabelas.length,
    tabelas,
    texto_formatado: formatarTabelasParaAnalise(tabelas),
  };
}
