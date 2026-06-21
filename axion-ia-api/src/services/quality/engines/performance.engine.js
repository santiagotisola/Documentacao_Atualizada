// Performance Validation Engine
// Analisa performance, tempos de resposta, e gargalos

const fs = require('fs').promises;
const path = require('path');

// ═══════════════════════════════════════════════════════════
// PERFORMANCE ANTI-PATTERNS
// ═══════════════════════════════════════════════════════════
const PERFORMANCE_PATTERNS = [
  {
    pattern: /for\s*\([^)]+\)\s*\{[^}]*for\s*\([^)]+\)\s*\{[^}]*for\s*\(/gi,
    severity: 'high',
    title: 'Triple Nested Loop (O(n³))',
    description: 'Loop triplamente aninhado pode causar problemas de performance graves',
    category: 'complexity',
    suggestion: 'Considere usar Map/Set para lookups O(1) ou refatorar o algoritmo'
  },
  {
    pattern: /\.forEach\s*\([^)]+\)\s*\{[^}]*\.forEach\s*\(/gi,
    severity: 'medium',
    title: 'Nested forEach',
    description: 'forEach aninhado pode ser ineficiente para grandes datasets',
    category: 'complexity',
    suggestion: 'Use reduce, map, ou flat para evitar iterações aninhadas'
  },
  {
    pattern: /\.filter\s*\([^)]+\)\.map\s*\(/gi,
    severity: 'low',
    title: 'Filter followed by Map',
    description: 'filter().map() itera o array duas vezes',
    category: 'optimization',
    suggestion: 'Combine em reduce() para única iteração'
  },
  {
    pattern: /\.map\s*\([^)]+\)\.filter\s*\(/gi,
    severity: 'low',
    title: 'Map followed by Filter',
    description: 'map().filter() processa elementos que serão descartados',
    category: 'optimization',
    suggestion: 'Inverta a ordem para filter().map() ou use reduce()'
  }
];

// ═══════════════════════════════════════════════════════════
// MEMORY LEAKS PATTERNS
// ═══════════════════════════════════════════════════════════
const MEMORY_LEAK_PATTERNS = [
  {
    pattern: /setInterval\s*\([^)]+\)(?![^{]*clearInterval)/gi,
    severity: 'high',
    title: 'Uncleaned setInterval',
    description: 'setInterval sem clearInterval correspondente pode causar memory leak',
    category: 'memory',
    suggestion: 'Sempre limpe intervals com clearInterval no cleanup/unmount'
  },
  {
    pattern: /setTimeout\s*\([^)]+\)(?![^{]*clearTimeout)/gi,
    severity: 'medium',
    title: 'Uncleaned setTimeout',
    description: 'setTimeout sem clearTimeout pode manter referências desnecessárias',
    category: 'memory',
    suggestion: 'Limpe timeouts com clearTimeout quando componente desmontar'
  },
  {
    pattern: /addEventListener\s*\([^)]+\)(?![^{]*removeEventListener)/gi,
    severity: 'high',
    title: 'Event Listener Not Removed',
    description: 'Event listeners não removidos podem causar memory leaks',
    category: 'memory',
    suggestion: 'Sempre remova listeners com removeEventListener no cleanup'
  }
];

// ═══════════════════════════════════════════════════════════
// INEFFICIENT DATABASE PATTERNS
// ═══════════════════════════════════════════════════════════
const DATABASE_PATTERNS = [
  {
    pattern: /for\s*\([^)]+\)\s*\{[^}]*await[^}]*find|await[^}]*save/gi,
    severity: 'critical',
    title: 'N+1 Query Problem',
    description: 'Queries dentro de loop causam problema N+1',
    category: 'database',
    suggestion: 'Use .populate() ou bulk operations para reduzir queries'
  },
  {
    pattern: /\.find\s*\(\s*\)\s*(?!.*\.limit)/gi,
    severity: 'high',
    title: 'Unbounded Query',
    description: 'Query sem limit pode retornar todos os documentos',
    category: 'database',
    suggestion: 'Sempre use .limit() para prevenir sobrecarga'
  },
  {
    pattern: /\.find\s*\([^)]+\)(?!.*\.lean\(\))/gi,
    severity: 'medium',
    title: 'Mongoose Without Lean',
    description: 'Queries sem .lean() retornam objetos Mongoose pesados',
    category: 'database',
    suggestion: 'Use .lean() quando não precisar de métodos do Mongoose'
  }
];

// ═══════════════════════════════════════════════════════════
// REACT SPECIFIC PATTERNS
// ═══════════════════════════════════════════════════════════
const REACT_PATTERNS = [
  {
    pattern: /useEffect\s*\(\s*\(\)\s*=>\s*\{[^}]*\}\s*\)/gi,
    severity: 'medium',
    title: 'useEffect Without Dependencies',
    description: 'useEffect sem array de dependências executa a cada render',
    category: 'react',
    suggestion: 'Adicione array de dependências para otimizar re-renders'
  },
  {
    pattern: /onClick\s*=\s*\{\s*\([^)]*\)\s*=>/gi,
    severity: 'low',
    title: 'Inline Arrow Function in JSX',
    description: 'Arrow functions inline criam nova função a cada render',
    category: 'react',
    suggestion: 'Use useCallback ou defina função fora do JSX'
  },
  {
    pattern: /key\s*=\s*\{\s*index\s*\}/gi,
    severity: 'medium',
    title: 'Array Index as Key',
    description: 'Usar index como key pode causar bugs e performance issues',
    category: 'react',
    suggestion: 'Use ID único e estável como key'
  }
];

// ═══════════════════════════════════════════════════════════
// BLOCKING OPERATIONS
// ═══════════════════════════════════════════════════════════
const BLOCKING_PATTERNS = [
  {
    pattern: /fs\.readFileSync/gi,
    severity: 'critical',
    title: 'Synchronous File Read',
    description: 'readFileSync bloqueia o event loop',
    category: 'blocking',
    suggestion: 'Use fs.promises.readFile ou fs.readFile com callback'
  },
  {
    pattern: /fs\.writeFileSync/gi,
    severity: 'critical',
    title: 'Synchronous File Write',
    description: 'writeFileSync bloqueia o event loop',
    category: 'blocking',
    suggestion: 'Use fs.promises.writeFile ou fs.writeFile com callback'
  },
  {
    pattern: /crypto\.pbkdf2Sync/gi,
    severity: 'critical',
    title: 'Synchronous Crypto Operation',
    description: 'pbkdf2Sync é computacionalmente intensivo e bloqueia o event loop',
    category: 'blocking',
    suggestion: 'Use crypto.pbkdf2 assíncrono'
  }
];

// ═══════════════════════════════════════════════════════════
// EXPENSIVE OPERATIONS
// ═══════════════════════════════════════════════════════════
const EXPENSIVE_PATTERNS = [
  {
    pattern: /JSON\.parse\s*\(\s*JSON\.stringify/gi,
    severity: 'medium',
    title: 'Deep Clone via JSON',
    description: 'JSON.parse(JSON.stringify()) é ineficiente para cloning',
    category: 'optimization',
    suggestion: 'Use structuredClone() ou biblioteca como lodash.cloneDeep'
  },
  {
    pattern: /new Date\s*\(\s*\)(?=[^}]*map|forEach)/gi,
    severity: 'low',
    title: 'Date Creation in Loop',
    description: 'Criar Date objects repetidamente é lento',
    category: 'optimization',
    suggestion: 'Crie Date uma vez fora do loop e reutilize'
  }
];

// ═══════════════════════════════════════════════════════════
// MAIN SCANNER
// ═══════════════════════════════════════════════════════════
async function scanFile(filePath, fileContent) {
  const issues = [];
  const lines = fileContent.split('\n');
  
  const allPatterns = [
    ...PERFORMANCE_PATTERNS.map(p => ({ ...p, category: 'performance' })),
    ...MEMORY_LEAK_PATTERNS.map(p => ({ ...p, category: 'memory' })),
    ...DATABASE_PATTERNS.map(p => ({ ...p, category: 'database' })),
    ...REACT_PATTERNS.map(p => ({ ...p, category: 'react' })),
    ...BLOCKING_PATTERNS.map(p => ({ ...p, category: 'blocking' })),
    ...EXPENSIVE_PATTERNS.map(p => ({ ...p, category: 'expensive' }))
  ];
  
  lines.forEach((line, index) => {
    allPatterns.forEach(({ pattern, severity, title, description, category, suggestion }) => {
      if (pattern.test(line)) {
        issues.push({
          category: 'performance',
          subcategory: category,
          severity,
          title,
          description,
          location: {
            file: filePath,
            line: index + 1,
            column: 1
          },
          code: {
            snippet: line.trim(),
            language: path.extname(filePath).slice(1)
          },
          suggestion: {
            description: suggestion,
            estimatedEffort: severity === 'critical' ? 'easy' : 'trivial'
          }
        });
      }
    });
  });
  
  return issues;
}

async function scanProject(projectPath) {
  const issues = [];
  
  try {
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];
    
    async function scanDirectory(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!['node_modules', 'dist', 'build', '.git', 'coverage'].includes(entry.name)) {
            await scanDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            const content = await fs.readFile(fullPath, 'utf8');
            const fileIssues = await scanFile(fullPath.replace(projectPath, ''), content);
            issues.push(...fileIssues);
          }
        }
      }
    }
    
    await scanDirectory(projectPath);
    
    return {
      totalIssues: issues.length,
      criticalCount: issues.filter(i => i.severity === 'critical').length,
      highCount: issues.filter(i => i.severity === 'high').length,
      mediumCount: issues.filter(i => i.severity === 'medium').length,
      lowCount: issues.filter(i => i.severity === 'low').length,
      issues,
      // Métricas adicionais
      metrics: {
        blockingOperations: issues.filter(i => i.subcategory === 'blocking').length,
        memoryLeaks: issues.filter(i => i.subcategory === 'memory').length,
        databaseIssues: issues.filter(i => i.subcategory === 'database').length,
        complexityIssues: issues.filter(i => i.subcategory === 'complexity').length
      }
    };
    
  } catch (error) {
    console.error('Erro no scan de performance:', error);
    throw error;
  }
}

module.exports = {
  scanProject,
  scanFile
};
