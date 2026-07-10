/**
 * Rotas: Automated Validation
 * Gerenciamento de configurações de validações automáticas
 */

import express from 'express';
import AutomatedValidation from '../models/automated-validation.model.js';
import OrchestratorEngine from '../../../engine/orchestrator-engine.js';

const router = express.Router();
const orchestrator = new OrchestratorEngine();

// Listar todas as configurações
router.get('/configurations', async (req, res) => {
  try {
    const configurations = await AutomatedValidation.find()
      .sort({ createdAt: -1 });
    
    res.json(configurations);
  } catch (error) {
    console.error('Erro ao listar configurações:', error);
    res.status(500).json({ 
      error: 'Erro ao listar configurações',
      message: error.message 
    });
  }
});

// Buscar configuração por ID
router.get('/configurations/:id', async (req, res) => {
  try {
    const configuration = await AutomatedValidation.findById(req.params.id);
    
    if (!configuration) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }
    
    res.json(configuration);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar configuração',
      message: error.message 
    });
  }
});

// Criar nova configuração
router.post('/configurations', async (req, res) => {
  try {
    const configuration = new AutomatedValidation(req.body);
    
    // Calcular próxima execução
    configuration.calculateNextExecution();
    
    await configuration.save();
    
    // Registrar no scheduler
    registerScheduledTask(configuration);
    
    res.status(201).json(configuration);
  } catch (error) {
    console.error('Erro ao criar configuração:', error);
    res.status(500).json({ 
      error: 'Erro ao criar configuração',
      message: error.message 
    });
  }
});

// Atualizar configuração
router.put('/configurations/:id', async (req, res) => {
  try {
    const configuration = await AutomatedValidation.findById(req.params.id);
    
    if (!configuration) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }
    
    // Atualizar campos
    Object.assign(configuration, req.body);
    
    // Recalcular próxima execução
    configuration.calculateNextExecution();
    
    await configuration.save();
    
    // Re-registrar no scheduler
    unregisterScheduledTask(configuration._id);
    if (configuration.enabled) {
      registerScheduledTask(configuration);
    }
    
    res.json(configuration);
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar configuração',
      message: error.message 
    });
  }
});

// Alternar status (ativar/desativar)
router.patch('/configurations/:id/toggle', async (req, res) => {
  try {
    const configuration = await AutomatedValidation.findById(req.params.id);
    
    if (!configuration) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }
    
    configuration.enabled = req.body.enabled;
    await configuration.save();
    
    // Atualizar scheduler
    if (configuration.enabled) {
      registerScheduledTask(configuration);
    } else {
      unregisterScheduledTask(configuration._id);
    }
    
    res.json(configuration);
  } catch (error) {
    console.error('Erro ao alternar configuração:', error);
    res.status(500).json({ 
      error: 'Erro ao alternar configuração',
      message: error.message 
    });
  }
});

// Deletar configuração
router.delete('/configurations/:id', async (req, res) => {
  try {
    const configuration = await AutomatedValidation.findById(req.params.id);
    
    if (!configuration) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }
    
    // Remover do scheduler
    unregisterScheduledTask(configuration._id);
    
    await AutomatedValidation.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Configuração excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir configuração:', error);
    res.status(500).json({ 
      error: 'Erro ao excluir configuração',
      message: error.message 
    });
  }
});

// Executar validação manualmente
router.post('/configurations/:id/run', async (req, res) => {
  try {
    const configuration = await AutomatedValidation.findById(req.params.id);
    
    if (!configuration) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }
    
    // Executar validação em background
    executeValidation(configuration).catch(error => {
      console.error('Erro ao executar validação:', error);
    });
    
    res.json({ 
      message: 'Validação iniciada',
      configurationId: configuration._id
    });
  } catch (error) {
    console.error('Erro ao iniciar validação:', error);
    res.status(500).json({ 
      error: 'Erro ao iniciar validação',
      message: error.message 
    });
  }
});

// Buscar histórico de execuções
router.get('/configurations/:id/history', async (req, res) => {
  try {
    const configuration = await AutomatedValidation.findById(req.params.id);
    
    if (!configuration) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }
    
    // Retornar estatísticas e última execução
    res.json({
      stats: configuration.stats,
      lastExecution: configuration.lastExecution,
      nextExecution: configuration.nextExecution
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar histórico',
      message: error.message 
    });
  }
});

// Status do scheduler
router.get('/scheduler/status', async (req, res) => {
  try {
    const activeConfigurations = await AutomatedValidation.find({ enabled: true });
    
    res.json({
      totalConfigurations: activeConfigurations.length,
      scheduledTasks: scheduledTasks.size,
      configurations: activeConfigurations.map(config => ({
        id: config._id,
        name: config.name,
        nextExecution: config.nextExecution,
        lastExecution: config.lastExecution
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar status do scheduler:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar status',
      message: error.message 
    });
  }
});

// ============================================================================
// SCHEDULER - Gerenciamento de tarefas agendadas
// ============================================================================

// Armazena as tarefas agendadas (em produção, use Redis ou similar)
const scheduledTasks = new Map();

// Registrar tarefa agendada
function registerScheduledTask(configuration) {
  if (!configuration.enabled) return;
  
  const taskId = configuration._id.toString();
  
  // Remover tarefa existente se houver
  if (scheduledTasks.has(taskId)) {
    clearInterval(scheduledTasks.get(taskId));
  }
  
  // Calcular intervalo em milissegundos
  let interval;
  
  switch (configuration.schedule.type) {
    case 'daily':
      interval = 24 * 60 * 60 * 1000; // 24 horas
      break;
    case 'hourly':
      interval = configuration.schedule.interval * 60 * 60 * 1000;
      break;
    case 'weekly':
      interval = 7 * 24 * 60 * 60 * 1000; // 7 dias
      break;
    default:
      interval = 24 * 60 * 60 * 1000; // default: 24 horas
  }
  
  // Agendar primeira execução
  const now = new Date();
  const nextExecution = configuration.nextExecution || now;
  const timeUntilNext = nextExecution.getTime() - now.getTime();
  
  if (timeUntilNext > 0) {
    // Agendar primeira execução
    setTimeout(() => {
      executeValidation(configuration);
      
      // Agendar execuções recorrentes
      const intervalId = setInterval(() => {
        executeValidation(configuration);
      }, interval);
      
      scheduledTasks.set(taskId, intervalId);
    }, timeUntilNext);
  } else {
    // Executar imediatamente e agendar recorrência
    executeValidation(configuration);
    
    const intervalId = setInterval(() => {
      executeValidation(configuration);
    }, interval);
    
    scheduledTasks.set(taskId, intervalId);
  }
  
  console.log(`[SCHEDULER] Tarefa registrada: ${configuration.name} (ID: ${taskId})`);
}

// Remover tarefa agendada
function unregisterScheduledTask(configurationId) {
  const taskId = configurationId.toString();
  
  if (scheduledTasks.has(taskId)) {
    clearInterval(scheduledTasks.get(taskId));
    scheduledTasks.delete(taskId);
    console.log(`[SCHEDULER] Tarefa removida: ${taskId}`);
  }
}

// Executar validação
async function executeValidation(configuration) {
  console.log(`[SCHEDULER] Executando validação: ${configuration.name}`);
  
  try {
    const startTime = Date.now();
    
    // Preparar payload para o orchestrator
    const payload = {
      system: configuration.execution.system,
      environment: configuration.execution.environment,
      url: configuration.execution.url,
      categories: configuration.execution.categories,
      mode: configuration.execution.mode
    };
    
    // Executar através do Orchestrator Engine
    const result = await orchestrator.execute('full-validation', payload);
    
    const duration = (Date.now() - startTime) / 1000; // segundos
    
    // Atualizar configuração com resultado
    const updatedConfig = await AutomatedValidation.findById(configuration._id);
    if (updatedConfig) {
      updatedConfig.updateStats({
        success: result.status === 'success',
        score: result.overallScore || 0,
        testsExecuted: result.totalTests || 0,
        testsPassed: result.testsPassed || 0,
        testsFailed: result.testsFailed || 0,
        duration
      });
      
      await updatedConfig.save();
      
      // Enviar notificações
      if (updatedConfig.notifications.enabled) {
        const shouldNotify = 
          (result.status === 'success' && updatedConfig.notifications.onSuccess) ||
          (result.status === 'error' && updatedConfig.notifications.onFailure);
        
        if (shouldNotify) {
          await sendNotifications(updatedConfig, result);
        }
      }
    }
    
    console.log(`[SCHEDULER] Validação concluída: ${configuration.name} - Score: ${result.overallScore}`);
    
  } catch (error) {
    console.error(`[SCHEDULER] Erro ao executar validação: ${configuration.name}`, error);
    
    // Atualizar com erro
    const updatedConfig = await AutomatedValidation.findById(configuration._id);
    if (updatedConfig) {
      updatedConfig.updateStats({
        success: false,
        score: 0,
        testsExecuted: 0,
        testsPassed: 0,
        testsFailed: 0,
        duration: 0,
        error: error.message
      });
      
      await updatedConfig.save();
      
      // Notificar erro
      if (updatedConfig.notifications.enabled && updatedConfig.notifications.onFailure) {
        await sendNotifications(updatedConfig, { status: 'error', error: error.message });
      }
    }
  }
}

// Enviar notificações
async function sendNotifications(configuration, result) {
  const notifications = configuration.notifications;
  
  // Email
  if (notifications.email.enabled && notifications.email.recipients.length > 0) {
    // Implementar envio de email
    console.log(`[NOTIFICATION] Email para: ${notifications.email.recipients.join(', ')}`);
  }
  
  // Slack
  if (notifications.slack.enabled && notifications.slack.webhook) {
    try {
      const message = {
        text: result.status === 'success' 
          ? `✅ Validação concluída: ${configuration.name}` 
          : `❌ Validação falhou: ${configuration.name}`,
        attachments: [{
          color: result.status === 'success' ? 'good' : 'danger',
          fields: [
            { title: 'Score', value: `${result.overallScore || 0}/100`, short: true },
            { title: 'Testes', value: `${result.testsPassed || 0}/${result.totalTests || 0}`, short: true },
            { title: 'Sistema', value: configuration.execution.system, short: true },
            { title: 'Ambiente', value: configuration.execution.environment, short: true }
          ]
        }]
      };
      
      await fetch(notifications.slack.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      
      console.log('[NOTIFICATION] Slack enviado');
    } catch (error) {
      console.error('[NOTIFICATION] Erro ao enviar Slack:', error);
    }
  }
  
  // Telegram
  if (notifications.telegram.enabled && notifications.telegram.botToken && notifications.telegram.chatId) {
    try {
      const text = result.status === 'success'
        ? `✅ *Validação Concluída*\n\n${configuration.name}\nScore: ${result.overallScore || 0}/100\nTestes: ${result.testsPassed || 0}/${result.totalTests || 0}`
        : `❌ *Validação Falhou*\n\n${configuration.name}\n${result.error || 'Erro desconhecido'}`;
      
      await fetch(`https://api.telegram.org/bot${notifications.telegram.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: notifications.telegram.chatId,
          text,
          parse_mode: 'Markdown'
        })
      });
      
      console.log('[NOTIFICATION] Telegram enviado');
    } catch (error) {
      console.error('[NOTIFICATION] Erro ao enviar Telegram:', error);
    }
  }
}

// Inicializar scheduler ao iniciar a aplicação
export async function initializeScheduler() {
  try {
    const activeConfigurations = await AutomatedValidation.find({ enabled: true });
    
    console.log(`[SCHEDULER] Inicializando ${activeConfigurations.length} configurações ativas`);
    
    for (const config of activeConfigurations) {
      // Calcular próxima execução se não existir
      if (!config.nextExecution) {
        config.calculateNextExecution();
        await config.save();
      }
      
      registerScheduledTask(config);
    }
    
    console.log('[SCHEDULER] Scheduler inicializado com sucesso');
  } catch (error) {
    console.error('[SCHEDULER] Erro ao inicializar scheduler:', error);
  }
}

export default router;
