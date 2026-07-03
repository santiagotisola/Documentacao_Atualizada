/**
 * CONFIGURAÇÃO CUTI - Central Unificada de Testes Inteligentes
 * Tela de configuração para validações automáticas agendadas
 */

import React, { useState, useEffect } from 'react';
import {
  Save, Clock, Play, Pause, Calendar, Bell, Mail,
  Settings, CheckCircle, AlertCircle, Trash2, Plus,
  RefreshCw, Database, Zap, MessageSquare
} from 'lucide-react';
import './ConfiguracaoCUTI.css';

const ConfiguracaoCUTI = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [configurations, setConfigurations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: true,
    schedule: {
      type: 'daily', // daily, hourly, weekly, cron
      time: '06:00',
      interval: 1,
      daysOfWeek: [],
      cronExpression: ''
    },
    execution: {
      system: 'AxHub',
      environment: 'prod-goiania',
      url: '',
      scenarios: [],
      categories: [],
      mode: 'single'
    },
    notifications: {
      enabled: true,
      onSuccess: false,
      onFailure: true,
      email: {
        enabled: false,
        recipients: []
      },
      slack: {
        enabled: false,
        webhook: ''
      },
      telegram: {
        enabled: false,
        botToken: '',
        chatId: ''
      }
    },
    retention: {
      keepResults: 30, // dias
      keepScreenshots: 7, // dias
      maxResults: 1000
    }
  });

  // Opções
  const scheduleTypes = [
    { id: 'daily', name: 'Diário', icon: <Calendar size={16} /> },
    { id: 'hourly', name: 'A cada X horas', icon: <Clock size={16} /> },
    { id: 'weekly', name: 'Semanal', icon: <Calendar size={16} /> },
    { id: 'cron', name: 'Expressão Cron', icon: <Settings size={16} /> }
  ];

  const daysOfWeek = [
    { id: 0, name: 'Domingo', short: 'Dom' },
    { id: 1, name: 'Segunda', short: 'Seg' },
    { id: 2, name: 'Terça', short: 'Ter' },
    { id: 3, name: 'Quarta', short: 'Qua' },
    { id: 4, name: 'Quinta', short: 'Qui' },
    { id: 5, name: 'Sexta', short: 'Sex' },
    { id: 6, name: 'Sábado', short: 'Sáb' }
  ];

  const testCategories = [
    { id: 'navigation', name: 'Navegação' },
    { id: 'functional', name: 'Funcional' },
    { id: 'visual', name: 'Visual' },
    { id: 'depara', name: 'DE/PARA' },
    { id: 'integration', name: 'Integrações' },
    { id: 'api', name: 'APIs' },
    { id: 'database', name: 'Banco de Dados' },
    { id: 'performance', name: 'Performance' },
    { id: 'security', name: 'Segurança' },
    { id: 'spelling', name: 'Ortografia' }
  ];

  const systems = ['AxHub', 'AxTon', 'AxCross'];

  const environments = {
    AxHub: [
      { id: 'prod-goiania', name: 'Produção - Goiânia', url: 'https://goiania.axhub.axion.ws' },
      { id: 'homolog-goiania', name: 'Homologação - Goiânia', url: 'https://homolog-goiania.axhub.axion.ws' }
    ],
    AxTon: [
      { id: 'prod-ipempe', name: 'Produção - IPEM-PE', url: 'https://ipempe.axton.axion.ws' }
    ],
    AxCross: [
      { id: 'prod-goiania', name: 'Produção - Goiânia', url: 'https://goiania.axcross.axion.ws' }
    ]
  };

  // Carrega configurações
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/automated-validation/configurations');
      const data = await response.json();
      setConfigurations(data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salva configuração
  const saveConfiguration = async () => {
    setSaving(true);
    try {
      const url = editingId 
        ? `/api/automated-validation/configurations/${editingId}`
        : '/api/automated-validation/configurations';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadConfigurations();
        resetForm();
        alert('✅ Configuração salva com sucesso!');
      } else {
        throw new Error('Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  // Deleta configuração
  const deleteConfiguration = async (id) => {
    if (!confirm('Deseja realmente excluir esta configuração?')) return;

    try {
      const response = await fetch(`/api/automated-validation/configurations/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadConfigurations();
        alert('✅ Configuração excluída!');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('❌ Erro ao excluir configuração');
    }
  };

  // Ativa/desativa configuração
  const toggleConfiguration = async (id, enabled) => {
    try {
      const response = await fetch(`/api/automated-validation/configurations/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });

      if (response.ok) {
        await loadConfigurations();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  // Executa validação manualmente
  const runNow = async (id) => {
    try {
      const response = await fetch(`/api/automated-validation/configurations/${id}/run`, {
        method: 'POST'
      });

      if (response.ok) {
        alert('✅ Validação iniciada!');
      }
    } catch (error) {
      console.error('Erro ao executar:', error);
      alert('❌ Erro ao executar validação');
    }
  };

  // Edita configuração
  const editConfiguration = (config) => {
    setFormData(config);
    setEditingId(config._id);
    setShowForm(true);
  };

  // Reseta formulário
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      enabled: true,
      schedule: {
        type: 'daily',
        time: '06:00',
        interval: 1,
        daysOfWeek: [],
        cronExpression: ''
      },
      execution: {
        system: 'AxHub',
        environment: 'prod-goiania',
        url: '',
        scenarios: [],
        categories: [],
        mode: 'single'
      },
      notifications: {
        enabled: true,
        onSuccess: false,
        onFailure: true,
        email: {
          enabled: false,
          recipients: []
        },
        slack: {
          enabled: false,
          webhook: ''
        },
        telegram: {
          enabled: false,
          botToken: '',
          chatId: ''
        }
      },
      retention: {
        keepResults: 30,
        keepScreenshots: 7,
        maxResults: 1000
      }
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Formata próxima execução
  const getNextExecution = (schedule) => {
    if (!schedule) return 'N/A';
    
    const now = new Date();
    const [hours, minutes] = (schedule.time || '06:00').split(':');
    const next = new Date(now);
    next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="configuracao-cuti">
      <div className="config-header">
        <div>
          <h1><Settings size={32} /> Configuração de Validações Automáticas</h1>
          <p>Configure agendamentos para executar validações automaticamente</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} />
          {showForm ? 'Cancelar' : 'Nova Configuração'}
        </button>
      </div>

      {/* FORMULÁRIO */}
      {showForm && (
        <div className="config-form-card">
          <h2>{editingId ? 'Editar' : 'Nova'} Configuração</h2>
          
          {/* Informações Básicas */}
          <div className="form-section">
            <h3>📝 Informações Básicas</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nome da Configuração *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Validação Diária AxHub Goiânia"
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descreva o propósito desta validação"
                />
              </div>
            </div>
          </div>

          {/* Agendamento */}
          <div className="form-section">
            <h3>⏰ Agendamento</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Agendamento *</label>
                <select
                  value={formData.schedule.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    schedule: {...formData.schedule, type: e.target.value}
                  })}
                >
                  {scheduleTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              {formData.schedule.type === 'daily' && (
                <div className="form-group">
                  <label>Horário *</label>
                  <input
                    type="time"
                    value={formData.schedule.time}
                    onChange={(e) => setFormData({
                      ...formData,
                      schedule: {...formData.schedule, time: e.target.value}
                    })}
                  />
                </div>
              )}

              {formData.schedule.type === 'hourly' && (
                <div className="form-group">
                  <label>Intervalo (horas) *</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.schedule.interval}
                    onChange={(e) => setFormData({
                      ...formData,
                      schedule: {...formData.schedule, interval: parseInt(e.target.value)}
                    })}
                  />
                </div>
              )}

              {formData.schedule.type === 'weekly' && (
                <div className="form-group full-width">
                  <label>Dias da Semana *</label>
                  <div className="days-selector">
                    {daysOfWeek.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        className={`day-btn ${formData.schedule.daysOfWeek.includes(day.id) ? 'selected' : ''}`}
                        onClick={() => {
                          const days = formData.schedule.daysOfWeek.includes(day.id)
                            ? formData.schedule.daysOfWeek.filter(d => d !== day.id)
                            : [...formData.schedule.daysOfWeek, day.id];
                          setFormData({
                            ...formData,
                            schedule: {...formData.schedule, daysOfWeek: days}
                          });
                        }}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.schedule.type === 'cron' && (
                <div className="form-group">
                  <label>Expressão Cron *</label>
                  <input
                    type="text"
                    value={formData.schedule.cronExpression}
                    onChange={(e) => setFormData({
                      ...formData,
                      schedule: {...formData.schedule, cronExpression: e.target.value}
                    })}
                    placeholder="0 6 * * *"
                  />
                  <small>Formato: minuto hora dia mês dia-da-semana</small>
                </div>
              )}
            </div>
          </div>

          {/* Configuração de Execução */}
          <div className="form-section">
            <h3>🎯 Configuração de Execução</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Sistema *</label>
                <select
                  value={formData.execution.system}
                  onChange={(e) => setFormData({
                    ...formData,
                    execution: {...formData.execution, system: e.target.value, environment: ''}
                  })}
                >
                  {systems.map(sys => (
                    <option key={sys} value={sys}>{sys}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ambiente *</label>
                <select
                  value={formData.execution.environment}
                  onChange={(e) => {
                    const env = environments[formData.execution.system].find(e => e.id === e.target.value);
                    setFormData({
                      ...formData,
                      execution: {
                        ...formData.execution,
                        environment: e.target.value,
                        url: env?.url || ''
                      }
                    });
                  }}
                >
                  <option value="">Selecione...</option>
                  {environments[formData.execution.system]?.map(env => (
                    <option key={env.id} value={env.id}>{env.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>URL</label>
                <input
                  type="url"
                  value={formData.execution.url}
                  onChange={(e) => setFormData({
                    ...formData,
                    execution: {...formData.execution, url: e.target.value}
                  })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-group">
              <label>Categorias de Teste *</label>
              <div className="categories-grid">
                {testCategories.map(cat => (
                  <label key={cat.id} className="checkbox-card">
                    <input
                      type="checkbox"
                      checked={formData.execution.categories.includes(cat.id)}
                      onChange={(e) => {
                        const categories = e.target.checked
                          ? [...formData.execution.categories, cat.id]
                          : formData.execution.categories.filter(c => c !== cat.id);
                        setFormData({
                          ...formData,
                          execution: {...formData.execution, categories}
                        });
                      }}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="form-section">
            <h3>🔔 Notificações</h3>
            
            <div className="form-row">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={formData.notifications.enabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    notifications: {...formData.notifications, enabled: e.target.checked}
                  })}
                />
                <span>Ativar notificações</span>
              </label>
            </div>

            {formData.notifications.enabled && (
              <>
                <div className="form-row">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={formData.notifications.onSuccess}
                      onChange={(e) => setFormData({
                        ...formData,
                        notifications: {...formData.notifications, onSuccess: e.target.checked}
                      })}
                    />
                    <span>Notificar em caso de sucesso</span>
                  </label>

                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={formData.notifications.onFailure}
                      onChange={(e) => setFormData({
                        ...formData,
                        notifications: {...formData.notifications, onFailure: e.target.checked}
                      })}
                    />
                    <span>Notificar em caso de falha</span>
                  </label>
                </div>

                {/* Email */}
                <div className="notification-section">
                  <label className="toggle-label">
                    <Mail size={18} />
                    <input
                      type="checkbox"
                      checked={formData.notifications.email.enabled}
                      onChange={(e) => setFormData({
                        ...formData,
                        notifications: {
                          ...formData.notifications,
                          email: {...formData.notifications.email, enabled: e.target.checked}
                        }
                      })}
                    />
                    <span>Email</span>
                  </label>
                  {formData.notifications.email.enabled && (
                    <input
                      type="text"
                      placeholder="email@exemplo.com (separar por vírgula)"
                      value={formData.notifications.email.recipients.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData,
                        notifications: {
                          ...formData.notifications,
                          email: {
                            ...formData.notifications.email,
                            recipients: e.target.value.split(',').map(s => s.trim())
                          }
                        }
                      })}
                    />
                  )}
                </div>

                {/* Slack */}
                <div className="notification-section">
                  <label className="toggle-label">
                    <MessageSquare size={18} />
                    <input
                      type="checkbox"
                      checked={formData.notifications.slack.enabled}
                      onChange={(e) => setFormData({
                        ...formData,
                        notifications: {
                          ...formData.notifications,
                          slack: {...formData.notifications.slack, enabled: e.target.checked}
                        }
                      })}
                    />
                    <span>Slack</span>
                  </label>
                  {formData.notifications.slack.enabled && (
                    <input
                      type="url"
                      placeholder="https://hooks.slack.com/services/..."
                      value={formData.notifications.slack.webhook}
                      onChange={(e) => setFormData({
                        ...formData,
                        notifications: {
                          ...formData.notifications,
                          slack: {...formData.notifications.slack, webhook: e.target.value}
                        }
                      })}
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Retenção de Dados */}
          <div className="form-section">
            <h3>💾 Retenção de Dados</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Manter resultados (dias)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.retention.keepResults}
                  onChange={(e) => setFormData({
                    ...formData,
                    retention: {...formData.retention, keepResults: parseInt(e.target.value)}
                  })}
                />
              </div>
              <div className="form-group">
                <label>Manter screenshots (dias)</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={formData.retention.keepScreenshots}
                  onChange={(e) => setFormData({
                    ...formData,
                    retention: {...formData.retention, keepScreenshots: parseInt(e.target.value)}
                  })}
                />
              </div>
              <div className="form-group">
                <label>Máximo de resultados</label>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={formData.retention.maxResults}
                  onChange={(e) => setFormData({
                    ...formData,
                    retention: {...formData.retention, maxResults: parseInt(e.target.value)}
                  })}
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="form-actions">
            <button 
              className="btn-secondary"
              onClick={resetForm}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              className="btn-primary"
              onClick={saveConfiguration}
              disabled={saving || !formData.name}
            >
              <Save size={18} />
              {saving ? 'Salvando...' : 'Salvar Configuração'}
            </button>
          </div>
        </div>
      )}

      {/* LISTA DE CONFIGURAÇÕES */}
      <div className="configurations-list">
        <h2>📋 Configurações Ativas</h2>
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : configurations.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <p>Nenhuma configuração cadastrada</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} /> Criar primeira configuração
            </button>
          </div>
        ) : (
          <div className="configs-grid">
            {configurations.map(config => (
              <div key={config._id} className={`config-card ${config.enabled ? 'enabled' : 'disabled'}`}>
                <div className="config-header">
                  <div>
                    <h3>{config.name}</h3>
                    {config.description && <p className="description">{config.description}</p>}
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => toggleConfiguration(config._id, e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="config-details">
                  <div className="detail-row">
                    <Clock size={16} />
                    <span>
                      {config.schedule.type === 'daily' && `Diário às ${config.schedule.time}`}
                      {config.schedule.type === 'hourly' && `A cada ${config.schedule.interval}h`}
                      {config.schedule.type === 'weekly' && `Semanal`}
                      {config.schedule.type === 'cron' && config.schedule.cronExpression}
                    </span>
                  </div>
                  <div className="detail-row">
                    <Database size={16} />
                    <span>{config.execution.system} - {config.execution.environment}</span>
                  </div>
                  <div className="detail-row">
                    <CheckCircle size={16} />
                    <span>{config.execution.categories.length} categorias selecionadas</span>
                  </div>
                  <div className="detail-row">
                    <Calendar size={16} />
                    <span>Próxima execução: {getNextExecution(config.schedule)}</span>
                  </div>
                </div>

                <div className="config-actions">
                  <button
                    className="btn-icon"
                    onClick={() => runNow(config._id)}
                    title="Executar agora"
                  >
                    <Play size={18} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => editConfiguration(config)}
                    title="Editar"
                  >
                    <Settings size={18} />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => deleteConfiguration(config._id)}
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {config.lastExecution && (
                  <div className="last-execution">
                    <small>
                      Última execução: {new Date(config.lastExecution.timestamp).toLocaleString('pt-BR')}
                      {' - '}
                      {config.lastExecution.success ? (
                        <span className="success">✅ Sucesso</span>
                      ) : (
                        <span className="failed">❌ Falha</span>
                      )}
                    </small>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguracaoCUTI;
