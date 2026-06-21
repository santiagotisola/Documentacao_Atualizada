// Security Validation Engine
// Detecta vulnerabilidades de segurança no código

const fs = require('fs').promises;
const path = require('path');

// ═══════════════════════════════════════════════════════════
// SQL INJECTION PATTERNS
// ═══════════════════════════════════════════════════════════
const SQL_INJECTION_PATTERNS = [
  {
    pattern: /execute\s*\(\s*["'`].*\$\{.*\}/gi,
    severity: 'critical',
    title: 'SQL Injection via Template String',
    description: 'Query SQL usando template string com variáveis não sanitizadas',
    cwe: 'CWE-89'
  },
  {
    pattern: /query\s*\(\s*["'`][^"'`]*\+[^"'`]*["'`]/gi,
    severity: 'critical',
    title: 'SQL Injection via String Concatenation',
    description: 'Query SQL construída com concatenação de strings',
    cwe: 'CWE-89'
  },
  {
    pattern: /\.raw\s*\(/gi,
    severity: 'high',
    title: 'Raw SQL Query',
    description: 'Query SQL raw sem proteção contra injection',
    cwe: 'CWE-89'
  }
];

// ═══════════════════════════════════════════════════════════
// XSS PATTERNS
// ═══════════════════════════════════════════════════════════
const XSS_PATTERNS = [
  {
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\{/gi,
    severity: 'high',
    title: 'XSS via dangerouslySetInnerHTML',
    description: 'Uso de dangerouslySetInnerHTML com conteúdo não sanitizado',
    cwe: 'CWE-79'
  },
  {
    pattern: /innerHTML\s*=\s*[^"'`]*\+/gi,
    severity: 'high',
    title: 'XSS via innerHTML',
    description: 'Atribuição direta a innerHTML com concatenação',
    cwe: 'CWE-79'
  },
  {
    pattern: /eval\s*\(/gi,
    severity: 'critical',
    title: 'Code Injection via eval()',
    description: 'Uso de eval() pode permitir execução de código arbitrário',
    cwe: 'CWE-95'
  },
  {
    pattern: /document\.write\s*\(/gi,
    severity: 'medium',
    title: 'XSS via document.write',
    description: 'Uso de document.write pode introduzir XSS',
    cwe: 'CWE-79'
  }
];

// ═══════════════════════════════════════════════════════════
// SECRETS PATTERNS
// ═══════════════════════════════════════════════════════════
const SECRET_PATTERNS = [
  {
    pattern: /['"]?api[_-]?key['"]?\s*[:=]\s*['"][a-zA-Z0-9-_]{20,}['"]/gi,
    severity: 'critical',
    title: 'Hardcoded API Key',
    description: 'API key exposta no código fonte',
    cwe: 'CWE-798'
  },
  {
    pattern: /['"]?password['"]?\s*[:=]\s*['"][^'"]{3,}['"]/gi,
    severity: 'critical',
    title: 'Hardcoded Password',
    description: 'Senha hardcoded no código',
    cwe: 'CWE-798'
  },
  {
    pattern: /['"]?secret['"]?\s*[:=]\s*['"][a-zA-Z0-9-_]{16,}['"]/gi,
    severity: 'critical',
    title: 'Hardcoded Secret',
    description: 'Secret exposto no código fonte',
    cwe: 'CWE-798'
  },
  {
    pattern: /mongodb:\/\/[a-zA-Z0-9-_]+:[a-zA-Z0-9-_]+@/gi,
    severity: 'critical',
    title: 'MongoDB Credentials in Code',
    description: 'Credenciais do MongoDB expostas na connection string',
    cwe: 'CWE-798'
  },
  {
    pattern: /postgres:\/\/[a-zA-Z0-9-_]+:[a-zA-Z0-9-_]+@/gi,
    severity: 'critical',
    title: 'PostgreSQL Credentials in Code',
    description: 'Credenciais do PostgreSQL expostas na connection string',
    cwe: 'CWE-798'
  },
  {
    pattern: /Bearer\s+[a-zA-Z0-9-_]{20,}/gi,
    severity: 'high',
    title: 'Hardcoded Bearer Token',
    description: 'Token de autenticação exposto no código',
    cwe: 'CWE-798'
  }
];

// ═══════════════════════════════════════════════════════════
// CSRF PATTERNS
// ═══════════════════════════════════════════════════════════
const CSRF_PATTERNS = [
  {
    pattern: /app\.use\s*\(\s*cors\s*\(\s*\)\s*\)/gi,
    severity: 'medium',
    title: 'CORS Wildcard Enabled',
    description: 'CORS configurado para aceitar qualquer origem',
    cwe: 'CWE-352'
  },
  {
    pattern: /credentials\s*:\s*['"]include['"]/gi,
    severity: 'low',
    title: 'Credentials Included in Request',
    description: 'Credenciais incluídas em requisições cross-origin',
    cwe: 'CWE-352'
  }
];

// ═══════════════════════════════════════════════════════════
// INSECURE CRYPTO PATTERNS
// ═══════════════════════════════════════════════════════════
const CRYPTO_PATTERNS = [
  {
    pattern: /createCipher\s*\(\s*['"]des['"]/gi,
    severity: 'high',
    title: 'Weak Encryption Algorithm (DES)',
    description: 'Uso de algoritmo de criptografia fraco (DES)',
    cwe: 'CWE-327'
  },
  {
    pattern: /createHash\s*\(\s*['"]md5['"]/gi,
    severity: 'medium',
    title: 'Weak Hash Algorithm (MD5)',
    description: 'Uso de algoritmo de hash fraco (MD5)',
    cwe: 'CWE-328'
  },
  {
    pattern: /createHash\s*\(\s*['"]sha1['"]/gi,
    severity: 'medium',
    title: 'Weak Hash Algorithm (SHA1)',
    description: 'Uso de algoritmo de hash fraco (SHA1)',
    cwe: 'CWE-328'
  }
];

// ═══════════════════════════════════════════════════════════
// INSECURE DEPENDENCIES
// ═══════════════════════════════════════════════════════════
async function checkDependencyVulnerabilities(projectPath) {
  const issues = [];
  
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    // TODO: Integrar com npm audit ou Snyk API
    // Por enquanto, apenas lista pacotes
    const allDeps = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {}
    };
    
    // Verificar versões desatualizadas (simplificado)
    for (const [pkg, version] of Object.entries(allDeps)) {
      if (version.includes('^') || version.includes('~') || version === '*') {
        // Versão flexível - pode ter vulnerabilidades
        // Em produção, fazer check real com npm audit
      }
    }
    
  } catch (error) {
    console.error('Erro ao verificar dependências:', error.message);
  }
  
  return issues;
}

// ═══════════════════════════════════════════════════════════
// MAIN SCANNER
// ═══════════════════════════════════════════════════════════
async function scanFile(filePath, fileContent) {
  const issues = [];
  const lines = fileContent.split('\n');
  
  // Todas as categorias de patterns
  const allPatterns = [
    ...SQL_INJECTION_PATTERNS.map(p => ({ ...p, category: 'sql_injection' })),
    ...XSS_PATTERNS.map(p => ({ ...p, category: 'xss' })),
    ...SECRET_PATTERNS.map(p => ({ ...p, category: 'secrets' })),
    ...CSRF_PATTERNS.map(p => ({ ...p, category: 'csrf' })),
    ...CRYPTO_PATTERNS.map(p => ({ ...p, category: 'crypto' }))
  ];
  
  // Escanear cada linha
  lines.forEach((line, index) => {
    allPatterns.forEach(({ pattern, severity, title, description, cwe, category }) => {
      if (pattern.test(line)) {
        issues.push({
          category: 'security',
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
          references: [
            {
              type: 'CWE',
              id: cwe,
              url: `https://cwe.mitre.org/data/definitions/${cwe.replace('CWE-', '')}.html`
            }
          ]
        });
      }
    });
  });
  
  return issues;
}

async function scanProject(projectPath) {
  const issues = [];
  
  try {
    // Arquivos a escanear
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];
    
    async function scanDirectory(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Ignorar node_modules, dist, build, etc
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
    
    // Verificar dependências
    const depIssues = await checkDependencyVulnerabilities(projectPath);
    issues.push(...depIssues);
    
    return {
      totalIssues: issues.length,
      criticalCount: issues.filter(i => i.severity === 'critical').length,
      highCount: issues.filter(i => i.severity === 'high').length,
      mediumCount: issues.filter(i => i.severity === 'medium').length,
      lowCount: issues.filter(i => i.severity === 'low').length,
      issues
    };
    
  } catch (error) {
    console.error('Erro no scan de segurança:', error);
    throw error;
  }
}

module.exports = {
  scanProject,
  scanFile
};
