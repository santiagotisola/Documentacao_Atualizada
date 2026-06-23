// Quality Platform - MongoDB Models
const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════
// QUALITY PROJECT MODEL
// ═══════════════════════════════════════════════════════════
const QualityProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['frontend', 'backend', 'fullstack', 'api', 'database', 'documentation'],
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  repository: {
    url: String,
    branch: { type: String, default: 'main' },
    path: String // Caminho relativo dentro do repo
  },
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    default: 'development'
  },
  frameworks: [{
    name: String,
    version: String
  }],
  languages: [String],
  config: {
    enabledEngines: [{
      type: String,
      enum: ['security', 'performance', 'functional', 'architecture', 'database', 'api']
    }],
    thresholds: {
      security: { type: Number, default: 80 },
      performance: { type: Number, default: 75 },
      functional: { type: Number, default: 85 },
      architecture: { type: Number, default: 70 },
      database: { type: Number, default: 80 },
      api: { type: Number, default: 85 }
    },
    schedule: {
      enabled: { type: Boolean, default: false },
      cron: String, // ex: '0 2 * * *' (2 AM diariamente)
      timezone: { type: String, default: 'America/Sao_Paulo' }
    }
  },
  team: [{
    userId: String,
    name: String,
    role: { type: String, enum: ['owner', 'developer', 'viewer'] }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'paused'],
    default: 'active'
  },
  lastScanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QualityScan'
  },
  statistics: {
    totalScans: { type: Number, default: 0 },
    totalIssues: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    trend: { type: String, enum: ['improving', 'stable', 'degrading'], default: 'stable' }
  },
  createdBy: String,
  updatedBy: String
}, {
  timestamps: true
});

QualityProjectSchema.index({ name: 1 });
QualityProjectSchema.index({ type: 1 });
QualityProjectSchema.index({ status: 1 });
QualityProjectSchema.index({ createdAt: -1 });

// ═══════════════════════════════════════════════════════════
// QUALITY SCAN MODEL
// ═══════════════════════════════════════════════════════════
const QualityScanSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QualityProject',
    required: true
  },
  scanType: {
    type: String,
    enum: ['full', 'incremental', 'targeted', 'scheduled'],
    default: 'full'
  },
  status: {
    type: String,
    enum: ['queued', 'running', 'completed', 'failed', 'cancelled'],
    default: 'queued'
  },
  startedAt: Date,
  completedAt: Date,
  duration: Number, // em segundos
  
  // Scores por categoria (0-100)
  scores: {
    overall: { type: Number, min: 0, max: 100 },
    security: { type: Number, min: 0, max: 100 },
    performance: { type: Number, min: 0, max: 100 },
    functional: { type: Number, min: 0, max: 100 },
    architecture: { type: Number, min: 0, max: 100 },
    database: { type: Number, min: 0, max: 100 },
    api: { type: Number, min: 0, max: 100 }
  },
  
  // Resultados detalhados por engine
  results: {
    security: {
      vulnerabilities: Number,
      criticalCount: Number,
      highCount: Number,
      mediumCount: Number,
      lowCount: Number,
      findings: [String] // IDs dos QualityIssues
    },
    performance: {
      loadTime: Number,
      responseTime: Number,
      throughput: Number,
      errorRate: Number,
      findings: [String]
    },
    functional: {
      testsPassed: Number,
      testsFailed: Number,
      testsSkipped: Number,
      coverage: Number,
      findings: [String]
    },
    architecture: {
      complexity: Number,
      coupling: Number,
      cohesion: Number,
      findings: [String]
    },
    database: {
      slowQueries: Number,
      missingIndexes: Number,
      findings: [String]
    },
    api: {
      endpoints: Number,
      broken: Number,
      slow: Number,
      findings: [String]
    }
  },
  
  // Análise AI
  aiAnalysis: {
    rootCauses: [String],
    recommendations: [String],
    riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    predictedImpact: String,
    generatedTests: [String]
  },
  
  // Estatísticas
  statistics: {
    totalIssues: { type: Number, default: 0 },
    newIssues: { type: Number, default: 0 },
    resolvedIssues: { type: Number, default: 0 },
    filesAnalyzed: { type: Number, default: 0 },
    linesAnalyzed: { type: Number, default: 0 }
  },
  
  // Metadados
  metadata: {
    gitCommit: String,
    gitBranch: String,
    gitAuthor: String,
    environment: String,
    triggeredBy: { type: String, enum: ['manual', 'scheduled', 'webhook', 'ci'] },
    ciProvider: String,
    ciJobId: String
  },
  
  error: {
    message: String,
    stack: String,
    code: String
  },
  
  createdBy: String
}, {
  timestamps: true
});

QualityScanSchema.index({ projectId: 1, createdAt: -1 });
QualityScanSchema.index({ status: 1 });
QualityScanSchema.index({ 'scores.overall': -1 });
QualityScanSchema.index({ createdAt: -1 });

// ═══════════════════════════════════════════════════════════
// QUALITY ISSUE MODEL
// ═══════════════════════════════════════════════════════════
const QualityIssueSchema = new mongoose.Schema({
  scanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QualityScan',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QualityProject',
    required: true
  },
  category: {
    type: String,
    enum: ['security', 'performance', 'functional', 'architecture', 'database', 'api'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000
  },
  
  // Localização
  location: {
    file: String,
    line: Number,
    column: Number,
    function: String,
    endLine: Number,
    endColumn: Number
  },
  
  // Código afetado
  code: {
    snippet: String,
    language: String,
    context: String // Contexto ao redor do código
  },
  
  // Sugestão de correção
  suggestion: {
    description: String,
    fixCode: String, // Código corrigido sugerido
    automated: { type: Boolean, default: false }, // Se pode ser aplicado automaticamente
    estimatedEffort: { type: String, enum: ['trivial', 'easy', 'medium', 'hard', 'complex'] }
  },
  
  // Referências e compliance
  references: [{
    type: { type: String, enum: ['CWE', 'OWASP', 'CVE', 'NIST', 'ISO', 'documentation', 'stackoverflow'] },
    id: String,
    url: String,
    description: String
  }],
  
  // Status e resolução
  status: {
    type: String,
    enum: ['open', 'inprogress', 'resolved', 'wontfix', 'false_positive'],
    default: 'open'
  },
  resolvedAt: Date,
  resolvedBy: String,
  resolution: {
    type: { type: String, enum: ['fixed', 'wontfix', 'duplicate', 'false_positive'] },
    notes: String,
    commit: String
  },
  
  // Recorrência
  firstSeenAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
  occurrences: { type: Number, default: 1 },
  hash: String, // Hash para detectar issues duplicadas
  
  // Assignee
  assignedTo: String,
  priority: { type: Number, min: 1, max: 5 }, // 1 = mais alta
  
  // Análise AI
  aiInsights: {
    rootCause: String,
    impact: String,
    suggestedFix: String,
    similarIssues: [String] // IDs de issues similares
  }
}, {
  timestamps: true
});

QualityIssueSchema.index({ scanId: 1 });
QualityIssueSchema.index({ projectId: 1, status: 1 });
QualityIssueSchema.index({ category: 1, severity: 1 });
QualityIssueSchema.index({ status: 1 });
QualityIssueSchema.index({ hash: 1 });
QualityIssueSchema.index({ createdAt: -1 });

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════
const QualityProject = mongoose.model('QualityProject', QualityProjectSchema);
const QualityScan = mongoose.model('QualityScan', QualityScanSchema);
const QualityIssue = mongoose.model('QualityIssue', QualityIssueSchema);

module.exports = {
  QualityProject,
  QualityScan,
  QualityIssue
};
