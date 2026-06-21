// AI Analyzer - Quality Platform
// Análise inteligente de issues usando GPT-4

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ═══════════════════════════════════════════════════════════
// ROOT CAUSE ANALYSIS
// ═══════════════════════════════════════════════════════════
async function analyzeRootCause(issues, codeContext) {
  try {
    const issuesText = issues.map(issue => 
      `[${issue.severity.toUpperCase()}] ${issue.title}
Arquivo: ${issue.location?.file}:${issue.location?.line}
Código: ${issue.code?.snippet}
Descrição: ${issue.description}`
    ).join('\n\n');
    
    const prompt = `Você é um engenheiro de software especialista em análise de código e debugging.

ISSUES ENCONTRADAS:
${issuesText}

CONTEXTO DO CÓDIGO:
${codeContext || 'Código não fornecido'}

TAREFA:
1. Identifique a CAUSA RAIZ das issues (não apenas o sintoma)
2. Explique o IMPACTO de cada issue
3. Sugira SOLUÇÕES concretas e aplicáveis
4. Priorize as issues por risco

Responda em português, de forma clara e objetiva.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em análise de segurança e qualidade de código. Seja preciso, técnico e prático.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    
    return response.choices[0].message.content;
    
  } catch (error) {
    console.error('Erro na análise de causa raiz:', error);
    return 'Erro ao analisar causa raiz com AI';
  }
}

// ═══════════════════════════════════════════════════════════
// TEST GENERATION
// ═══════════════════════════════════════════════════════════
async function generateTests(issue, framework = 'jest') {
  try {
    const prompt = `Gere testes automatizados para detectar e prevenir esta issue:

ISSUE:
${issue.title}
${issue.description}

CÓDIGO PROBLEMÁTICO:
${issue.code?.snippet}

LOCALIZAÇÃO:
${issue.location?.file}:${issue.location?.line}

FRAMEWORK: ${framework}

Gere:
1. Teste unitário que FALHA com o código atual (expõe o bug)
2. Teste que PASSA após a correção
3. Testes de borda (edge cases) relacionados

Responda APENAS com o código dos testes, sem explicações extras.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em testes automatizados. Gere código de teste pronto para uso em ${framework}.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });
    
    return response.choices[0].message.content;
    
  } catch (error) {
    console.error('Erro ao gerar testes:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// CODE FIX SUGGESTION
// ═══════════════════════════════════════════════════════════
async function suggestFix(issue) {
  try {
    const prompt = `Sugira uma correção para esta vulnerabilidade/issue:

ISSUE: ${issue.title}
SEVERIDADE: ${issue.severity}
CATEGORIA: ${issue.category}

DESCRIÇÃO:
${issue.description}

CÓDIGO ATUAL:
\`\`\`${issue.code?.language || 'javascript'}
${issue.code?.snippet}
\`\`\`

LOCALIZAÇÃO: ${issue.location?.file}:${issue.location?.line}

Forneça:
1. Explicação clara do problema
2. Código corrigido (apenas o trecho necessário)
3. Explicação da correção
4. Boas práticas relacionadas

Seja conciso e técnico.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em segurança e qualidade de código. Forneça correções práticas e seguras.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });
    
    return response.choices[0].message.content;
    
  } catch (error) {
    console.error('Erro ao sugerir correção:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════
// RISK PREDICTION
// ═══════════════════════════════════════════════════════════
async function predictRisk(scanResults, historicalData) {
  try {
    const prompt = `Com base nos resultados do scan e dados históricos, preveja riscos:

SCAN ATUAL:
- Security Score: ${scanResults.scores?.security || 'N/A'}
- Issues Críticas: ${scanResults.results?.security?.criticalCount || 0}
- Issues Altas: ${scanResults.results?.security?.highCount || 0}

HISTÓRICO:
${historicalData ? JSON.stringify(historicalData, null, 2) : 'Sem histórico disponível'}

Preveja:
1. Probabilidade de incidentes de segurança nos próximos 30 dias
2. Áreas de maior risco
3. Tendência de qualidade (melhorando/piorando/estável)
4. Recomendações de ação imediata

Responda de forma estruturada e quantificável.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em análise preditiva de riscos de segurança e qualidade de software.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1500
    });
    
    return response.choices[0].message.content;
    
  } catch (error) {
    console.error('Erro na predição de riscos:', error);
    return 'Erro ao prever riscos com AI';
  }
}

// ═══════════════════════════════════════════════════════════
// PATTERN DETECTION
// ═══════════════════════════════════════════════════════════
async function detectPatterns(issues) {
  try {
    const categorized = issues.reduce((acc, issue) => {
      const key = `${issue.category}-${issue.subcategory || 'general'}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(issue);
      return acc;
    }, {});
    
    const patterns = [];
    
    for (const [category, categoryIssues] of Object.entries(categorized)) {
      if (categoryIssues.length >= 3) {
        // Padrão detectado: muitas issues da mesma categoria
        patterns.push({
          type: 'repeated_issue',
          category,
          count: categoryIssues.length,
          severity: 'high',
          description: `Múltiplas ocorrências de ${category} (${categoryIssues.length} vezes)`,
          recommendation: `Revisar arquitetura para eliminar padrão recorrente de ${category}`
        });
      }
    }
    
    // Detectar arquivos problemáticos
    const fileIssues = issues.reduce((acc, issue) => {
      const file = issue.location?.file;
      if (file) {
        if (!acc[file]) acc[file] = 0;
        acc[file]++;
      }
      return acc;
    }, {});
    
    for (const [file, count] of Object.entries(fileIssues)) {
      if (count >= 5) {
        patterns.push({
          type: 'problematic_file',
          file,
          count,
          severity: 'medium',
          description: `Arquivo ${file} tem ${count} issues`,
          recommendation: `Refatorar ou revisar completamente ${file}`
        });
      }
    }
    
    return patterns;
    
  } catch (error) {
    console.error('Erro ao detectar padrões:', error);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════
// COMPREHENSIVE ANALYSIS
// ═══════════════════════════════════════════════════════════
async function comprehensiveAnalysis(scan, issues, historicalScans = []) {
  try {
    console.log(`Iniciando análise AI para scan ${scan._id}...`);
    
    const analysis = {
      rootCauses: [],
      recommendations: [],
      riskLevel: 'low',
      predictedImpact: '',
      generatedTests: [],
      patterns: []
    };
    
    // Detectar padrões
    analysis.patterns = await detectPatterns(issues);
    
    // Análise de causa raiz (apenas para critical/high)
    const criticalIssues = issues.filter(i => ['critical', 'high'].includes(i.severity));
    if (criticalIssues.length > 0) {
      const rootCauseAnalysis = await analyzeRootCause(
        criticalIssues.slice(0, 5), // Limite para não estourar token
        '' // TODO: passar contexto do código
      );
      analysis.rootCauses.push(rootCauseAnalysis);
    }
    
    // Predição de riscos
    const historicalData = historicalScans.map(s => ({
      date: s.createdAt,
      score: s.scores?.overall,
      issues: s.statistics?.totalIssues
    }));
    
    analysis.predictedImpact = await predictRisk(scan, historicalData);
    
    // Determinar nível de risco
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    
    if (criticalCount >= 5 || highCount >= 15) {
      analysis.riskLevel = 'critical';
    } else if (criticalCount >= 2 || highCount >= 8) {
      analysis.riskLevel = 'high';
    } else if (highCount >= 3) {
      analysis.riskLevel = 'medium';
    }
    
    // Recomendações gerais
    analysis.recommendations = [
      `Resolver ${criticalCount} issues críticas imediatamente`,
      `Priorizar ${highCount} issues de alta severidade`,
      `Estabelecer gates de qualidade no CI/CD`,
      `Agendar scans automáticos diários`
    ];
    
    console.log(`Análise AI concluída. Risco: ${analysis.riskLevel}`);
    
    return analysis;
    
  } catch (error) {
    console.error('Erro na análise comprehensiva:', error);
    return {
      rootCauses: ['Erro ao executar análise AI'],
      recommendations: ['Verificar logs do sistema'],
      riskLevel: 'unknown',
      predictedImpact: 'Não foi possível determinar',
      generatedTests: [],
      patterns: []
    };
  }
}

module.exports = {
  analyzeRootCause,
  generateTests,
  suggestFix,
  predictRisk,
  detectPatterns,
  comprehensiveAnalysis
};
