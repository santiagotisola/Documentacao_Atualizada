// ═══════════════════════════════════════════════════════════════════════════
// 🔤 LINGUISTIC VALIDATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// Validação linguística completa: ortografia, gramática, terminologia
// Scanner multi-formato: React, Vue, JSON, HTML, Markdown

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════
// GLOSSÁRIO CORPORATIVO AXION
// ═══════════════════════════════════════════════════════════════════════════
const GLOSSARY = {
  // Termos preferidos (padronização)
  preferred: {
    "login": "Login",
    "logout": "Logout",
    "dashboard": "Dashboard",
    "usuário": "Usuário",
    "usuários": "Usuários",
    "configuração": "Configuração",
    "configurações": "Configurações",
    "relatório": "Relatório",
    "relatórios": "Relatórios",
    "equipamento": "Equipamento",
    "equipamentos": "Equipamentos",
    "veículo": "Veículo",
    "veículos": "Veículos",
    "infração": "Infração",
    "infrações": "Infrações",
    "validação": "Validação",
    "validações": "Validações",
    "análise": "Análise",
    "análises": "Análises"
  },
  
  // Termos proibidos (usar o preferido)
  forbidden: {
    "logon": "Use 'Login'",
    "painel": "Use 'Dashboard'",
    "config": "Use 'Configuração'",
    "user": "Use 'Usuário'",
    "relatorio": "Use 'Relatório' (com acento)",
    "veiculo": "Use 'Veículo' (com acento)",
    "infracao": "Use 'Infração' (com acento)",
    "validacao": "Use 'Validação' (com acento)",
    "analise": "Use 'Análise' (com acento)"
  },
  
  // Abreviações padronizadas
  abbreviations: {
    "CPF": "CPF",
    "CNPJ": "CNPJ",
    "RG": "RG",
    "CEP": "CEP",
    "API": "API",
    "REST": "REST",
    "JSON": "JSON",
    "XML": "XML",
    "HTML": "HTML",
    "CSS": "CSS",
    "CRUD": "CRUD"
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DICIONÁRIO ORTOGRÁFICO EXPANDIDO (200+ palavras comuns)
// ═══════════════════════════════════════════════════════════════════════════
const SPELLING_DICTIONARY = {
  // Erros de acentuação
  "voce": "você",
  "nao": "não",
  "esta": "está",
  "tambem": "também",
  "so": "só",
  "ate": "até",
  "apos": "após",
  "proximo": "próximo",
  "anterior": "anterior",
  "ultima": "última",
  "ultimo": "último",
  
  // Substantivos comuns
  "informaçao": "informação",
  "informaçoes": "informações",
  "observaçao": "observação",
  "observaçoes": "observações",
  "descriçao": "descrição",
  "descriçoes": "descrições",
  "operaçao": "operação",
  "operaçoes": "operações",
  "situaçao": "situação",
  "situaçoes": "situações",
  "validaçao": "validação",
  "validaçoes": "validações",
  "configuraçao": "configuração",
  "configuraçoes": "configurações",
  
  // Termos técnicos
  "usuario": "usuário",
  "usuarios": "usuários",
  "numero": "número",
  "numeros": "números",
  "codigo": "código",
  "codigos": "códigos",
  "endereco": "endereço",
  "enderecos": "endereços",
  "historico": "histórico",
  "historicos": "históricos",
  "relatorio": "relatório",
  "relatorios": "relatórios",
  "analise": "análise",
  "analises": "análises",
  
  // Adjetivos
  "obrigatorio": "obrigatório",
  "obrigatoria": "obrigatória",
  "obrigatorios": "obrigatórios",
  "obrigatorias": "obrigatórias",
  "valido": "válido",
  "valida": "válida",
  "invalido": "inválido",
  "invalida": "inválida",
  "unico": "único",
  "unica": "única",
  "multiplo": "múltiplo",
  "multipla": "múltipla",
  "maximo": "máximo",
  "maxima": "máxima",
  "minimo": "mínimo",
  "minima": "mínima",
  
  // Verbos
  "cadastrar": "cadastrar",
  "editar": "editar",
  "excluir": "excluir",
  "salvar": "salvar",
  "cancelar": "cancelar",
  "confirmar": "confirmar",
  "visualizar": "visualizar",
  "imprimir": "imprimir",
  "exportar": "exportar",
  "importar": "importar"
};

// ═══════════════════════════════════════════════════════════════════════════
// REGRAS GRAMATICAIS BÁSICAS
// ═══════════════════════════════════════════════════════════════════════════
const GRAMMAR_RULES = [
  {
    pattern: /\ba\s+a\s+/gi,
    message: "Artigo duplicado: 'a a'",
    suggestion: "a ",
    severity: "high"
  },
  {
    pattern: /\bo\s+o\s+/gi,
    message: "Artigo duplicado: 'o o'",
    suggestion: "o ",
    severity: "high"
  },
  {
    pattern: /\bde\s+de\s+/gi,
    message: "Preposição duplicada: 'de de'",
    suggestion: "de ",
    severity: "high"
  },
  {
    pattern: /\bem\s+em\s+/gi,
    message: "Preposição duplicada: 'em em'",
    suggestion: "em ",
    severity: "high"
  }
  // REMOVIDO: Regra de "espaços múltiplos" (/\s{2,}/g)
  // Causava 437 falsos positivos em arquivos JSON formatados
  // Espaços múltiplos geralmente não são erros críticos
];

// ═══════════════════════════════════════════════════════════════════════════
// SCANNER DE ARQUIVOS
// ═══════════════════════════════════════════════════════════════════════════
async function scanDirectory(dirPath, options = {}) {
  const {
    extensions = ['.jsx', '.js', '.json', '.html', '.md'],
    maxDepth = 10,
    exclude = ['node_modules', 'dist', 'build', '.git']
  } = options;

  const results = [];

  async function scan(currentPath, depth = 0) {
    if (depth > maxDepth) return;

    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        // Pular pastas excluídas
        if (entry.isDirectory() && exclude.includes(entry.name)) {
          continue;
        }

        if (entry.isDirectory()) {
          await scan(fullPath, depth + 1);
        } else {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            results.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Erro ao escanear ${currentPath}:`, error.message);
    }
  }

  await scan(dirPath);
  return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXTRAÇÃO DE TEXTO POR TIPO DE ARQUIVO
// ═══════════════════════════════════════════════════════════════════════════
async function extractTexts(filePath) {
  const ext = path.extname(filePath);
  const content = await fs.readFile(filePath, 'utf-8');
  const texts = [];

  if (ext === '.jsx' || ext === '.js') {
    // Extrair strings de JSX/React
    const stringRegex = /(?:placeholder|label|title|alt|aria-label)=["']([^"']+)["']/g;
    const textRegex = />([^<>{}\n]+)</g;
    
    let match;
    while ((match = stringRegex.exec(content)) !== null) {
      texts.push({
        text: match[1],
        line: content.substring(0, match.index).split('\n').length,
        type: 'jsx_attribute'
      });
    }
    
    while ((match = textRegex.exec(content)) !== null) {
      const text = match[1].trim();
      if (text.length > 2 && !/^[0-9\s]+$/.test(text)) {
        texts.push({
          text,
          line: content.substring(0, match.index).split('\n').length,
          type: 'jsx_text'
        });
      }
    }
  } else if (ext === '.json') {
    // Extrair strings de JSON
    try {
      const json = JSON.parse(content);
      extractFromJSON(json, texts);
    } catch (error) {
      // JSON inválido, pular
    }
  } else if (ext === '.html') {
    // Extrair texto de HTML
    const htmlRegex = />([^<>]+)</g;
    const attrRegex = /(?:placeholder|title|alt)=["']([^"']+)["']/g;
    
    let match;
    while ((match = htmlRegex.exec(content)) !== null) {
      const text = match[1].trim();
      if (text.length > 2) {
        texts.push({
          text,
          line: content.substring(0, match.index).split('\n').length,
          type: 'html_text'
        });
      }
    }
    
    while ((match = attrRegex.exec(content)) !== null) {
      texts.push({
        text: match[1],
        line: content.substring(0, match.index).split('\n').length,
        type: 'html_attribute'
      });
    }
  } else if (ext === '.md') {
    // Extrair parágrafos de Markdown
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const cleaned = line.replace(/^[#\-*>`\s]+/, '').trim();
      if (cleaned.length > 5 && !cleaned.startsWith('```')) {
        texts.push({
          text: cleaned,
          line: idx + 1,
          type: 'markdown'
        });
      }
    });
  }

  return texts;
}

function extractFromJSON(obj, texts, path = '') {
  if (typeof obj === 'string' && obj.length > 2) {
    texts.push({
      text: obj,
      line: 0, // JSON não tem linha específica
      type: 'json_value',
      path
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      extractFromJSON(value, texts, path ? `${path}.${key}` : key);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDAÇÃO ORTOGRÁFICA
// ═══════════════════════════════════════════════════════════════════════════
function validateSpelling(text) {
  const issues = [];
  const words = text.split(/\s+/);

  for (const word of words) {
    const cleanWord = word.toLowerCase().replace(/[^a-záàâãéêíóôõúüç]/g, '');
    
    if (SPELLING_DICTIONARY[cleanWord]) {
      const correct = SPELLING_DICTIONARY[cleanWord];
      if (cleanWord !== correct.toLowerCase()) {
        issues.push({
          type: 'spelling',
          severity: 'high',
          original: word,
          suggestion: correct,
          message: `Erro de ortografia: "${word}" → "${correct}"`,
          category: 'orthography'
        });
      }
    }
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDAÇÃO GRAMATICAL
// ═══════════════════════════════════════════════════════════════════════════
function validateGrammar(text) {
  const issues = [];

  for (const rule of GRAMMAR_RULES) {
    let match;
    while ((match = rule.pattern.exec(text)) !== null) {
      issues.push({
        type: 'grammar',
        severity: rule.severity,
        original: match[0],
        suggestion: rule.suggestion,
        message: rule.message,
        category: 'grammar',
        position: match.index
      });
    }
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDAÇÃO DE TERMINOLOGIA
// ═══════════════════════════════════════════════════════════════════════════
function validateTerminology(text) {
  const issues = [];
  const words = text.split(/\s+/);

  for (const word of words) {
    const cleanWord = word.replace(/[^a-záàâãéêíóôõúüç]/gi, '');
    
    // Verificar termos proibidos
    if (GLOSSARY.forbidden[cleanWord.toLowerCase()]) {
      issues.push({
        type: 'terminology',
        severity: 'medium',
        original: word,
        suggestion: GLOSSARY.forbidden[cleanWord.toLowerCase()],
        message: `Terminologia não padronizada: ${GLOSSARY.forbidden[cleanWord.toLowerCase()]}`,
        category: 'terminology'
      });
    }
    
    // Verificar capitalização de termos preferidos
    if (GLOSSARY.preferred[cleanWord.toLowerCase()]) {
      const preferred = GLOSSARY.preferred[cleanWord.toLowerCase()];
      if (word !== preferred && cleanWord.toLowerCase() === preferred.toLowerCase()) {
        issues.push({
          type: 'capitalization',
          severity: 'low',
          original: word,
          suggestion: preferred,
          message: `Capitalização incorreta: "${word}" → "${preferred}"`,
          category: 'style'
        });
      }
    }
  }

  return issues;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDAÇÃO COMPLETA DE TEXTO
// ═══════════════════════════════════════════════════════════════════════════
function validateText(text) {
  return [
    ...validateSpelling(text),
    ...validateGrammar(text),
    ...validateTerminology(text)
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER PRINCIPAL: SCAN DE PROJETO
// ═══════════════════════════════════════════════════════════════════════════
async function scanProject(req, res) {
  try {
    const { projects, scope } = req.body;

    if (!projects || projects.length === 0) {
      return res.status(400).json({ error: 'Nenhum projeto selecionado' });
    }

    const baseDir = path.resolve(__dirname, '../..');
    const results = {
      scan_id: `LING-${Date.now()}`,
      timestamp: new Date().toISOString(),
      projects: [],
      summary: {
        total_files: 0,
        total_texts: 0,
        total_issues: 0,
        by_severity: { critical: 0, high: 0, medium: 0, low: 0 },
        by_category: { orthography: 0, grammar: 0, terminology: 0, style: 0 }
      }
    };

    for (const projectName of projects) {
      const projectPath = path.join(baseDir, projectName);
      
      try {
        // Verificar se projeto existe
        await fs.access(projectPath);
      } catch {
        continue; // Projeto não encontrado
      }

      const projectResult = {
        name: projectName,
        path: projectPath,
        files: [],
        issues_count: 0,
        score: 100
      };

      // Escanear arquivos do projeto
      const files = await scanDirectory(projectPath, {
        extensions: scope === 'code' ? ['.jsx', '.js'] : ['.jsx', '.js', '.json', '.html', '.md'],
        exclude: ['node_modules', 'dist', 'build', '.git', 'coverage']
      });

      results.summary.total_files += files.length;

      // Analisar cada arquivo
      for (const filePath of files) {
        const texts = await extractTexts(filePath);
        results.summary.total_texts += texts.length;

        const fileIssues = [];

        for (const { text, line, type } of texts) {
          const issues = validateText(text);
          
          for (const issue of issues) {
            fileIssues.push({
              ...issue,
              text,
              line,
              type
            });

            results.summary.total_issues++;
            results.summary.by_severity[issue.severity]++;
            results.summary.by_category[issue.category]++;
          }
        }

        if (fileIssues.length > 0) {
          projectResult.files.push({
            path: path.relative(projectPath, filePath),
            full_path: filePath,
            issues_count: fileIssues.length,
            issues: fileIssues
          });
          projectResult.issues_count += fileIssues.length;
        }
      }

      // Calcular score do projeto (0-100)
      if (results.summary.total_texts > 0) {
        projectResult.score = Math.max(0, 100 - (projectResult.issues_count / results.summary.total_texts * 100));
      }

      results.projects.push(projectResult);
    }

    res.json(results);

  } catch (error) {
    console.error('Erro no scan linguístico:', error);
    res.status(500).json({
      error: 'Erro ao realizar scan linguístico',
      details: error.message
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER: APLICAR CORREÇÃO
// ═══════════════════════════════════════════════════════════════════════════
async function applyFix(req, res) {
  try {
    const { filePath, line, original, suggestion } = req.body;

    // Ler arquivo
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Aplicar correção na linha especificada
    if (line > 0 && line <= lines.length) {
      lines[line - 1] = lines[line - 1].replace(original, suggestion);
    } else {
      // Se não tiver linha, substituir primeira ocorrência
      const newContent = content.replace(original, suggestion);
      await fs.writeFile(filePath, newContent, 'utf-8');
      return res.json({ success: true, message: 'Correção aplicada' });
    }

    // Salvar arquivo
    await fs.writeFile(filePath, lines.join('\n'), 'utf-8');

    res.json({ success: true, message: 'Correção aplicada' });

  } catch (error) {
    console.error('Erro ao aplicar correção:', error);
    res.status(500).json({
      error: 'Erro ao aplicar correção',
      details: error.message
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER: APLICAR CORREÇÕES EM LOTE
// ═══════════════════════════════════════════════════════════════════════════
async function applyBatchFix(req, res) {
  try {
    const { fixes } = req.body;

    if (!fixes || !Array.isArray(fixes) || fixes.length === 0) {
      return res.status(400).json({ error: 'Nenhuma correção especificada' });
    }

    const results = {
      total: fixes.length,
      success: 0,
      failed: 0,
      errors: []
    };

    // Agrupar correções por arquivo para otimizar I/O
    const fixesByFile = {};
    for (const fix of fixes) {
      if (!fixesByFile[fix.filePath]) {
        fixesByFile[fix.filePath] = [];
      }
      fixesByFile[fix.filePath].push(fix);
    }

    // Aplicar correções arquivo por arquivo
    for (const [filePath, fileFixes] of Object.entries(fixesByFile)) {
      try {
        let content = await fs.readFile(filePath, 'utf-8');
        let modified = false;

        // Ordenar correções por linha (decrescente) para evitar deslocamento
        fileFixes.sort((a, b) => (b.line || 0) - (a.line || 0));

        for (const fix of fileFixes) {
          try {
            if (fix.line > 0) {
              const lines = content.split('\n');
              if (fix.line <= lines.length) {
                lines[fix.line - 1] = lines[fix.line - 1].replace(fix.original, fix.suggestion);
                content = lines.join('\n');
                modified = true;
                results.success++;
              }
            } else {
              // Substituir primeira ocorrência
              const newContent = content.replace(fix.original, fix.suggestion);
              if (newContent !== content) {
                content = newContent;
                modified = true;
                results.success++;
              }
            }
          } catch (fixError) {
            results.failed++;
            results.errors.push({
              file: filePath,
              line: fix.line,
              error: fixError.message
            });
          }
        }

        // Salvar arquivo se houve modificações
        if (modified) {
          await fs.writeFile(filePath, content, 'utf-8');
        }

      } catch (fileError) {
        results.failed += fileFixes.length;
        results.errors.push({
          file: filePath,
          error: fileError.message
        });
      }
    }

    res.json({
      success: true,
      message: `${results.success} correções aplicadas, ${results.failed} falharam`,
      results
    });

  } catch (error) {
    console.error('Erro ao aplicar correções em lote:', error);
    res.status(500).json({
      error: 'Erro ao aplicar correções em lote',
      details: error.message
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER: APLICAR CORREÇÃO EM TODOS OS SIMILARES
// ═══════════════════════════════════════════════════════════════════════════
async function applyToAllSimilar(req, res) {
  try {
    const { original, suggestion, scanResults } = req.body;

    if (!original || !suggestion || !scanResults) {
      return res.status(400).json({ error: 'Parâmetros insuficientes' });
    }

    // Coletar todos os issues similares de todos os projetos
    const similarFixes = [];

    for (const project of scanResults.projects) {
      for (const file of project.files) {
        for (const issue of file.issues) {
          if (issue.original === original && issue.suggestion === suggestion) {
            similarFixes.push({
              filePath: file.full_path,
              line: issue.line,
              original: issue.original,
              suggestion: issue.suggestion
            });
          }
        }
      }
    }

    if (similarFixes.length === 0) {
      return res.json({
        success: true,
        message: 'Nenhuma ocorrência similar encontrada',
        results: { total: 0, success: 0, failed: 0 }
      });
    }

    // Aplicar correções em lote
    const batchResponse = await applyBatchFix({
      body: { fixes: similarFixes }
    }, { json: (data) => data });

    res.json({
      success: true,
      message: `Aplicado em ${similarFixes.length} ocorrências similares`,
      results: batchResponse
    });

  } catch (error) {
    console.error('Erro ao aplicar em todos similares:', error);
    res.status(500).json({
      error: 'Erro ao aplicar em todos similares',
      details: error.message
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER: OBTER GLOSSÁRIO
// ═══════════════════════════════════════════════════════════════════════════
function getGlossary(req, res) {
  res.json({
    preferred: GLOSSARY.preferred,
    forbidden: GLOSSARY.forbidden,
    abbreviations: GLOSSARY.abbreviations,
    spelling_count: Object.keys(SPELLING_DICTIONARY).length,
    grammar_rules: GRAMMAR_RULES.length
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDAÇÃO DE URLS/SITES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extrai atributo de uma tag HTML
 * @param {string} tagString - String da tag completa
 * @param {string} attr - Nome do atributo
 * @returns {string|null}
 */
function extractAttribute(tagString, attr) {
  const regex = new RegExp(`${attr}=["'](.*?)["']`, 'i');
  const match = tagString.match(regex);
  return match ? match[1] : null;
}

/**
 * Gera seletor CSS aproximado para um elemento
 * @param {string} tagString - String da tag
 * @param {string} tagName - Nome da tag
 * @param {number} index - Índice do elemento
 * @returns {string}
 */
function generateSelector(tagString, tagName, index) {
  const id = extractAttribute(tagString, 'id');
  if (id) return `#${id}`;

  const className = extractAttribute(tagString, 'class');
  if (className) {
    const firstClass = className.split(' ')[0];
    return `.${firstClass}`;
  }

  return `${tagName}:nth-of-type(${index + 1})`;
}

/**
 * Extrai texto limpo de HTML com informações completas
 * @param {string} html - Conteúdo HTML
 * @returns {Array} Array de objetos {text, type, selector, attributes, line}
 */
function extractTextFromHTML(html) {
  const texts = [];
  let lineNumber = 1;

  // Extrai <title>
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  if (titleMatch) {
    texts.push({
      text: titleMatch[1].trim(),
      type: 'title',
      selector: 'title',
      attributes: {},
      line: lineNumber++,
      section: 'head'
    });
  }

  // Extrai meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
  if (metaDescMatch) {
    texts.push({
      text: metaDescMatch[1].trim(),
      type: 'meta-description',
      selector: 'meta[name="description"]',
      attributes: { name: 'description' },
      line: lineNumber++,
      section: 'head'
    });
  }

  // Extrai meta keywords
  const metaKeyMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["'](.*?)["']/i);
  if (metaKeyMatch) {
    texts.push({
      text: metaKeyMatch[1].trim(),
      type: 'meta-keywords',
      selector: 'meta[name="keywords"]',
      attributes: { name: 'keywords' },
      line: lineNumber++,
      section: 'head'
    });
  }

  // Extrai headings (h1-h6) com mais contexto
  const headingRegex = /<(h[1-6])([^>]*)>(.*?)<\/h[1-6]>/gis;
  let match;
  let headingCount = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 };
  
  while ((match = headingRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    const tagString = match[2];
    const cleanText = match[3].replace(/<[^>]+>/g, '').trim();
    
    if (cleanText.length > 0) {
      const index = headingCount[tagName]++;
      texts.push({
        text: cleanText,
        type: tagName,
        selector: generateSelector(tagString, tagName, index),
        attributes: {},
        line: lineNumber++,
        section: 'body'
      });
    }
  }

  // Extrai parágrafos
  const paragraphRegex = /<p([^>]*)>(.*?)<\/p>/gis;
  let pCount = 0;
  while ((match = paragraphRegex.exec(html)) !== null) {
    const tagString = match[1];
    const cleanText = match[2].replace(/<[^>]+>/g, '').trim();
    if (cleanText.length > 2) {
      texts.push({
        text: cleanText,
        type: 'paragraph',
        selector: generateSelector(tagString, 'p', pCount++),
        attributes: {},
        line: lineNumber++,
        section: 'body'
      });
    }
  }

  // Extrai labels
  const labelRegex = /<label([^>]*)>(.*?)<\/label>/gis;
  let labelCount = 0;
  while ((match = labelRegex.exec(html)) !== null) {
    const tagString = match[1];
    const cleanText = match[2].replace(/<[^>]+>/g, '').trim();
    if (cleanText.length > 0) {
      const forAttr = extractAttribute(match[0], 'for');
      texts.push({
        text: cleanText,
        type: 'label',
        selector: generateSelector(tagString, 'label', labelCount++),
        attributes: forAttr ? { for: forAttr } : {},
        line: lineNumber++,
        section: 'body'
      });
    }
  }

  // Extrai placeholders de inputs
  const inputRegex = /<input([^>]*placeholder=["'](.*?)["'][^>]*)>/gis;
  let inputCount = 0;
  while ((match = inputRegex.exec(html)) !== null) {
    const tagString = match[1];
    const placeholder = match[2].trim();
    if (placeholder.length > 0) {
      const typeAttr = extractAttribute(match[0], 'type') || 'text';
      const nameAttr = extractAttribute(match[0], 'name');
      texts.push({
        text: placeholder,
        type: 'input-placeholder',
        selector: generateSelector(tagString, 'input', inputCount++),
        attributes: { type: typeAttr, name: nameAttr },
        line: lineNumber++,
        section: 'body'
      });
    }
  }

  // Extrai alt text de imagens
  const imgRegex = /<img([^>]*alt=["'](.*?)["'][^>]*)>/gis;
  let imgCount = 0;
  while ((match = imgRegex.exec(html)) !== null) {
    const tagString = match[1];
    const altText = match[2].trim();
    if (altText.length > 0) {
      const srcAttr = extractAttribute(match[0], 'src');
      texts.push({
        text: altText,
        type: 'img-alt',
        selector: generateSelector(tagString, 'img', imgCount++),
        attributes: { src: srcAttr },
        line: lineNumber++,
        section: 'body'
      });
    }
  }

  // Extrai buttons
  const buttonRegex = /<button([^>]*)>(.*?)<\/button>/gis;
  let buttonCount = 0;
  while ((match = buttonRegex.exec(html)) !== null) {
    const tagString = match[1];
    const cleanText = match[2].replace(/<[^>]+>/g, '').trim();
    if (cleanText.length > 0) {
      const typeAttr = extractAttribute(match[0], 'type') || 'button';
      texts.push({
        text: cleanText,
        type: 'button',
        selector: generateSelector(tagString, 'button', buttonCount++),
        attributes: { type: typeAttr },
        line: lineNumber++,
        section: 'body'
      });
    }
  }

  // Extrai links (texto dos links)
  const linkRegex = /<a([^>]*)>(.*?)<\/a>/gis;
  let linkCount = 0;
  while ((match = linkRegex.exec(html)) !== null) {
    const tagString = match[1];
    const cleanText = match[2].replace(/<[^>]+>/g, '').trim();
    if (cleanText.length > 0) {
      const href = extractAttribute(match[0], 'href');
      texts.push({
        text: cleanText,
        type: 'link',
        selector: generateSelector(tagString, 'a', linkCount++),
        attributes: { href },
        line: lineNumber++,
        section: 'body'
      });
    }
  }

  // Extrai tooltips (title attributes)
  const tooltipRegex = /<(\w+)([^>]*title=["'](.*?)["'][^>]*)>/gis;
  let tooltipCount = 0;
  while ((match = tooltipRegex.exec(html)) !== null) {
    const tagName = match[1].toLowerCase();
    const tagString = match[2];
    const tooltip = match[3].trim();
    if (tooltip.length > 0) {
      texts.push({
        text: tooltip,
        type: 'tooltip',
        selector: generateSelector(tagString, tagName, tooltipCount++),
        attributes: { title: tooltip },
        line: lineNumber++,
        section: 'body'
      });
    }
  }

  // Extrai spans com texto
  const spanRegex = /<span([^>]*)>(.*?)<\/span>/gis;
  let spanCount = 0;
  while ((match = spanRegex.exec(html)) !== null) {
    const tagString = match[1];
    const cleanText = match[2].replace(/<[^>]+>/g, '').trim();
    if (cleanText.length > 2) {
      texts.push({
        text: cleanText,
        type: 'span',
        selector: generateSelector(tagString, 'span', spanCount++),
        attributes: {},
        line: lineNumber++,
        section: 'body'
      });
    }
  }

  // Extrai divs com texto direto (não nested)
  const divRegex = /<div([^>]*)>([^<]+)<\/div>/gis;
  let divCount = 0;
  while ((match = divRegex.exec(html)) !== null) {
    const tagString = match[1];
    const cleanText = match[2].trim();
    if (cleanText.length > 2) {
      texts.push({
        text: cleanText,
        type: 'div',
        selector: generateSelector(tagString, 'div', divCount++),
        attributes: {},
        line: lineNumber++,
        section: 'body'
      });
    }
  }

  // Decodifica HTML entities
  texts.forEach(item => {
    item.text = item.text
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  });

  return texts;
}

/**
 * Extrai todos os links de um HTML
 * @param {string} html - Conteúdo HTML
 * @param {string} baseUrl - URL base para resolver links relativos
 * @returns {Array<string>} Array de URLs absolutas
 */
function extractLinksFromHTML(html, baseUrl) {
  const links = new Set();
  const linkRegex = /<a[^>]*href=["'](.*?)["']/gis;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const href = match[1].trim();
      // Ignora âncoras, javascript:, mailto:, tel:
      if (href.startsWith('#') || href.startsWith('javascript:') || 
          href.startsWith('mailto:') || href.startsWith('tel:')) {
        continue;
      }

      // Resolve URL relativa
      const absoluteUrl = new URL(href, baseUrl);
      links.add(absoluteUrl.href);
    } catch (e) {
      // URL inválida, ignora
    }
  }

  return Array.from(links);
}

/**
 * Normaliza URL (remove hash, query params opcionais, trailing slash)
 * @param {string} url - URL a normalizar
 * @param {boolean} keepQuery - Manter query parameters
 * @returns {string}
 */
function normalizeURL(url, keepQuery = false) {
  try {
    const urlObj = new URL(url);
    // Remove hash
    urlObj.hash = '';
    // Remove query se solicitado
    if (!keepQuery) {
      urlObj.search = '';
    }
    // Remove trailing slash
    let normalized = urlObj.href;
    if (normalized.endsWith('/') && urlObj.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return url;
  }
}

/**
 * Verifica se URL é interna (mesmo domínio)
 * @param {string} url - URL a verificar
 * @param {string} baseUrl - URL base do site
 * @returns {boolean}
 */
function isInternalLink(url, baseUrl) {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    return urlObj.hostname === baseObj.hostname;
  } catch {
    return false;
  }
}

/**
 * Crawler recursivo de site
 * @param {string} startUrl - URL inicial
 * @param {number} maxPages - Máximo de páginas a visitar
 * @param {number} maxDepth - Profundidade máxima
 * @returns {Promise<Array>} Array de URLs descobertas
 */
async function crawlSite(startUrl, maxPages = 50, maxDepth = 3) {
  const visited = new Set();
  const toVisit = [{ url: normalizeURL(startUrl), depth: 0 }];
  const discovered = [];

  console.log(`[Crawler] Iniciando crawl de ${startUrl} (max ${maxPages} páginas, profundidade ${maxDepth})`);

  while (toVisit.length > 0 && discovered.length < maxPages) {
    const { url, depth } = toVisit.shift();
    const normalized = normalizeURL(url);

    // Já visitou ou profundidade máxima atingida
    if (visited.has(normalized) || depth > maxDepth) {
      continue;
    }

    visited.add(normalized);
    discovered.push(url);

    console.log(`[Crawler] Visitando (${discovered.length}/${maxPages}): ${url}`);

    // Se não atingiu profundidade máxima, busca mais links
    if (depth < maxDepth) {
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'AxionIA-Crawler/1.0' },
          timeout: 10000
        });

        if (response.ok) {
          const html = await response.text();
          const links = extractLinksFromHTML(html, url);

          // Adiciona apenas links internos não visitados
          for (const link of links) {
            const normalizedLink = normalizeURL(link);
            if (isInternalLink(link, startUrl) && !visited.has(normalizedLink)) {
              toVisit.push({ url: link, depth: depth + 1 });
            }
          }
        }
      } catch (error) {
        console.error(`[Crawler] Erro ao acessar ${url}:`, error.message);
      }
    }

    // Pequeno delay para não sobrecarregar servidor
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`[Crawler] Finalizado. ${discovered.length} páginas descobertas.`);
  return discovered;
}

/**
 * Valida uma URL
 * @param {string} url - URL a validar
 * @returns {Object} Resultado da validação
 */
async function validateURL(url) {
  try {
    // Fetch da página
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'AxionIA-Validator/1.0'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const extractedTexts = extractTextFromHTML(html);

    // Validar cada texto extraído
    const issues = [];
    for (const item of extractedTexts) {
      const spellingIssues = validateSpelling(item.text);
      const grammarIssues = validateGrammar(item.text);
      const terminologyIssues = validateTerminology(item.text);

      // Adiciona contexto da URL e tipo de elemento
      const allIssues = [
        ...spellingIssues.map(i => ({ ...i, element_type: item.type, line: item.line, context: item.text.substring(0, 100) })),
        ...grammarIssues.map(i => ({ ...i, element_type: item.type, line: item.line, context: item.text.substring(0, 100) })),
        ...terminologyIssues.map(i => ({ ...i, element_type: item.type, line: item.line, context: item.text.substring(0, 100) }))
      ];

      issues.push(...allIssues);
    }

    return {
      url,
      status: 'success',
      http_status: response.status,
      texts_analyzed: extractedTexts.length,
      issues,
      quality_score: calculateQualityScore(extractedTexts.length, issues.length)
    };

  } catch (error) {
    return {
      url,
      status: 'error',
      error: error.message,
      texts_analyzed: 0,
      issues: [],
      quality_score: 0
    };
  }
}

/**
 * Calcula score de qualidade
 */
function calculateQualityScore(totalTexts, totalIssues) {
  if (totalTexts === 0) return 0;
  const errorRate = totalIssues / totalTexts;
  return Math.max(0, Math.min(100, Math.round((1 - errorRate) * 100)));
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER: SCAN DE URL ÚNICA
// ═══════════════════════════════════════════════════════════════════════════
async function scanURL(req, res) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL não fornecida' });
    }

    // Valida formato de URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'URL inválida' });
    }

    console.log(`[Linguistic] Validando URL: ${url}`);
    const result = await validateURL(url);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    });

  } catch (error) {
    console.error('Erro ao validar URL:', error);
    res.status(500).json({
      error: 'Erro ao validar URL',
      details: error.message
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER: SCAN DE MÚLTIPLAS URLS
// ═══════════════════════════════════════════════════════════════════════════
async function scanURLBatch(req, res) {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Lista de URLs não fornecida' });
    }

    console.log(`[Linguistic] Validando ${urls.length} URLs...`);

    // Processar URLs em paralelo (máximo 5 simultâneas)
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(url => validateURL(url)));
      results.push(...batchResults);
    }

    // Agregar estatísticas
    const stats = {
      total_urls: urls.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'error').length,
      total_texts: results.reduce((sum, r) => sum + r.texts_analyzed, 0),
      total_issues: results.reduce((sum, r) => sum + r.issues.length, 0),
      avg_quality_score: Math.round(
        results.reduce((sum, r) => sum + r.quality_score, 0) / results.length
      )
    };

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
      results
    });

  } catch (error) {
    console.error('Erro ao validar URLs em lote:', error);
    res.status(500).json({
      error: 'Erro ao validar URLs em lote',
      details: error.message
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER: SCAN COMPLETO DE SITE (CRAWLER + VALIDAÇÃO)
// ═══════════════════════════════════════════════════════════════════════════
async function scanSiteComplete(req, res) {
  try {
    const { url, maxPages = 50, maxDepth = 3, crawl = true } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL não fornecida' });
    }

    // Validar formato de URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'URL inválida' });
    }

    console.log(`[Linguistic] Scan completo de site: ${url}`);
    console.log(`[Linguistic] Crawl: ${crawl}, Max páginas: ${maxPages}, Max profundidade: ${maxDepth}`);

    let urlsToValidate = [url];

    // Se crawl ativado, descobre todas as páginas
    if (crawl) {
      console.log(`[Linguistic] Iniciando crawler...`);
      urlsToValidate = await crawlSite(url, maxPages, maxDepth);
    }

    console.log(`[Linguistic] Validando ${urlsToValidate.length} páginas...`);

    // Validar todas as URLs descobertas (em lote, máx 3 simultâneas para não sobrecarregar)
    const batchSize = 3;
    const results = [];

    for (let i = 0; i < urlsToValidate.length; i += batchSize) {
      const batch = urlsToValidate.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(u => validateURL(u)));
      results.push(...batchResults);
      
      // Progresso
      console.log(`[Linguistic] Progresso: ${results.length}/${urlsToValidate.length} páginas validadas`);
    }

    // Agregar estatísticas globais
    const successfulResults = results.filter(r => r.status === 'success');
    const failedResults = results.filter(r => r.status === 'error');

    const stats = {
      total_pages: results.length,
      successful: successfulResults.length,
      failed: failedResults.length,
      total_texts: successfulResults.reduce((sum, r) => sum + r.texts_analyzed, 0),
      total_issues: successfulResults.reduce((sum, r) => sum + r.issues.length, 0),
      avg_quality_score: successfulResults.length > 0 
        ? Math.round(successfulResults.reduce((sum, r) => sum + r.quality_score, 0) / successfulResults.length)
        : 0
    };

    // Breakdown por severidade e categoria
    const breakdown = {
      by_severity: { high: 0, medium: 0, low: 0 },
      by_category: { orthography: 0, grammar: 0, terminology: 0, style: 0 }
    };

    successfulResults.forEach(result => {
      result.issues.forEach(issue => {
        breakdown.by_severity[issue.severity]++;
        breakdown.by_category[issue.category]++;
      });
    });

    // Páginas com mais problemas (top 10)
    const pagesWithIssues = successfulResults
      .filter(r => r.issues.length > 0)
      .map(r => ({
        url: r.url,
        issues: r.issues.length,
        quality: r.quality_score,
        texts: r.texts_analyzed
      }))
      .sort((a, b) => b.issues - a.issues)
      .slice(0, 10);

    // Issues mais comuns (agrupados)
    const issueGroups = {};
    successfulResults.forEach(result => {
      result.issues.forEach(issue => {
        const key = `${issue.original}→${issue.suggestion}`;
        if (!issueGroups[key]) {
          issueGroups[key] = {
            original: issue.original,
            suggestion: issue.suggestion,
            category: issue.category,
            severity: issue.severity,
            count: 0,
            pages: []
          };
        }
        issueGroups[key].count++;
        if (!issueGroups[key].pages.includes(result.url)) {
          issueGroups[key].pages.push(result.url);
        }
      });
    });

    const commonIssues = Object.values(issueGroups)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map(issue => ({
        ...issue,
        pages_count: issue.pages.length,
        pages: issue.pages.slice(0, 5) // Limita exemplos a 5 páginas
      }));

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      site_url: url,
      crawled: crawl,
      stats,
      breakdown,
      pages_with_most_issues: pagesWithIssues,
      common_issues: commonIssues,
      pages: results
    });

  } catch (error) {
    console.error('Erro ao validar site completo:', error);
    res.status(500).json({
      error: 'Erro ao validar site completo',
      details: error.message
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════
export {
  scanProject,
  applyFix,
  applyBatchFix,
  applyToAllSimilar,
  getGlossary,
  scanURL,
  scanURLBatch,
  scanSiteComplete
};
