/**
 * Modelo: Automated Validation Configuration
 * Configurações de validações automáticas agendadas
 */

import mongoose from 'mongoose';

const AutomatedValidationSchema = new mongoose.Schema({
  // Informações básicas
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  enabled: {
    type: Boolean,
    default: true
  },

  // Agendamento
  schedule: {
    type: {
      type: String,
      enum: ['daily', 'hourly', 'weekly', 'cron'],
      default: 'daily'
    },
    time: {
      type: String, // HH:MM format
      default: '06:00'
    },
    interval: {
      type: Number, // para hourly
      default: 1
    },
    daysOfWeek: {
      type: [Number], // 0-6 (Dom-Sáb)
      default: []
    },
    cronExpression: {
      type: String
    }
  },

  // Configuração de execução
  execution: {
    system: {
      type: String,
      enum: ['AxHub', 'AxTon', 'AxCross'],
      required: true
    },
    environment: {
      type: String,
      required: true
    },
    url: {
      type: String,
      trim: true
    },
    scenarios: {
      type: [String], // IDs de cenários
      default: []
    },
    categories: {
      type: [String],
      default: []
    },
    mode: {
      type: String,
      enum: ['single', 'suite', 'sequential', 'parallel'],
      default: 'single'
    }
  },

  // Notificações
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    onSuccess: {
      type: Boolean,
      default: false
    },
    onFailure: {
      type: Boolean,
      default: true
    },
    email: {
      enabled: {
        type: Boolean,
        default: false
      },
      recipients: {
        type: [String],
        default: []
      }
    },
    slack: {
      enabled: {
        type: Boolean,
        default: false
      },
      webhook: {
        type: String,
        trim: true
      }
    },
    telegram: {
      enabled: {
        type: Boolean,
        default: false
      },
      botToken: {
        type: String,
        trim: true
      },
      chatId: {
        type: String,
        trim: true
      }
    }
  },

  // Retenção de dados
  retention: {
    keepResults: {
      type: Number,
      default: 30 // dias
    },
    keepScreenshots: {
      type: Number,
      default: 7 // dias
    },
    maxResults: {
      type: Number,
      default: 1000
    }
  },

  // Última execução
  lastExecution: {
    timestamp: Date,
    success: Boolean,
    score: Number,
    testsExecuted: Number,
    testsPassed: Number,
    testsFailed: Number,
    duration: Number,
    error: String
  },

  // Próxima execução
  nextExecution: Date,

  // Estatísticas
  stats: {
    totalExecutions: {
      type: Number,
      default: 0
    },
    successCount: {
      type: Number,
      default: 0
    },
    failureCount: {
      type: Number,
      default: 0
    },
    avgScore: {
      type: Number,
      default: 0
    },
    avgDuration: {
      type: Number,
      default: 0
    }
  },

  // Metadados
  createdBy: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Atualizar updatedAt antes de salvar
AutomatedValidationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calcular próxima execução
AutomatedValidationSchema.methods.calculateNextExecution = function() {
  const now = new Date();
  let next = new Date(now);

  switch (this.schedule.type) {
    case 'daily':
      const [hours, minutes] = this.schedule.time.split(':');
      next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      break;

    case 'hourly':
      next.setHours(now.getHours() + this.schedule.interval);
      next.setMinutes(0);
      next.setSeconds(0);
      break;

    case 'weekly':
      // Implementar lógica semanal
      break;

    case 'cron':
      // Parser cron expression (simplificado)
      break;
  }

  this.nextExecution = next;
  return next;
};

// Atualizar estatísticas após execução
AutomatedValidationSchema.methods.updateStats = function(result) {
  this.stats.totalExecutions += 1;
  
  if (result.success) {
    this.stats.successCount += 1;
  } else {
    this.stats.failureCount += 1;
  }

  // Calcular médias
  const totalExecutions = this.stats.totalExecutions;
  this.stats.avgScore = ((this.stats.avgScore * (totalExecutions - 1)) + result.score) / totalExecutions;
  this.stats.avgDuration = ((this.stats.avgDuration * (totalExecutions - 1)) + result.duration) / totalExecutions;

  this.lastExecution = {
    timestamp: new Date(),
    success: result.success,
    score: result.score,
    testsExecuted: result.testsExecuted,
    testsPassed: result.testsPassed,
    testsFailed: result.testsFailed,
    duration: result.duration,
    error: result.error
  };

  // Calcular próxima execução
  this.calculateNextExecution();
};

const AutomatedValidation = mongoose.model('AutomatedValidation', AutomatedValidationSchema);

export default AutomatedValidation;
