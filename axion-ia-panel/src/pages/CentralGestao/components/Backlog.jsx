import React, { useState } from 'react';
import { CheckCircle, Circle, AlertTriangle, Clock, Zap } from 'lucide-react';

export default function Backlog() {
  const [selectedModules, setSelectedModules] = useState([]);

  const modules = [
    {
      id: 'quality-platform',
      name: 'Quality Platform',
      priority: 'CRÍTICA',
      status: 0,
      impact: '🔥 ALTÍSSIMO',
      time: '3-5 dias',
      tasks: [
        'Ler AXION-PIEQ-SPECIFICATION.json',
        'Criar service quality-platform.service.js',
        'Criar controller quality-platform.controller.js',
        'Atualizar Quality/Dashboard.jsx',
        'Criar páginas adicionais (Modules, Roadmap, Reports)'
      ]
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Completo',
      priority: 'CRÍTICA',
      status: 40,
      impact: '🔥 ALTO',
      time: '2-3 dias',
      tasks: [
        'Criar whatsapp-flow.js (máquina de estados)',
        'Criar whatsapp-sessao.model.js',
        'Integrar com Jitbit',
        'Integrar com scheduler',
        'Melhorar WhatsApp.jsx'
      ]
    },
    {
      id: 'validation-hub',
      name: 'Validation Hub',
      priority: 'CRÍTICA',
      status: 50,
      impact: '🔥 ALTO',
      time: '2-3 dias',
      tasks: [
        'Consolidar 3 validadores existentes',
        'Criar validation-orchestrator.service.js',
        'Melhorar ValidationHub.jsx',
        'Integrar com PIEQ specification'
      ]
    },
    {
      id: 'roadmap',
      name: 'Roadmap Sistema',
      priority: 'ALTA',
      status: 0,
      impact: '🟡 MÉDIO-ALTO',
      time: '2 dias',
      tasks: [
        'Criar roadmap.model.js',
        'Criar roadmap.service.js',
        'Criar roadmap.controller.js',
        'Transformar Roadmap.jsx (Kanban + Timeline)'
      ]
    },
    {
      id: 'specs',
      name: 'Specs Sistema',
      priority: 'ALTA',
      status: 0,
      impact: '🟡 MÉDIO-ALTO',
      time: '2 dias',
      tasks: [
        'Criar spec.model.js',
        'Criar spec.service.js',
        'Expandir spec.controller.js',
        'Melhorar Specs.jsx (Editor MDX)'
      ]
    },
    {
      id: 'axhub-dashboard',
      name: 'AxHub Dashboard',
      priority: 'ALTA',
      status: 70,
      impact: '🟡 MÉDIO',
      time: '1 dia',
      tasks: [
        'Implementar useAxHubTabelas',
        'Adicionar aba Tabelas',
        'Queries avançadas',
        'Exportação Excel'
      ]
    }
  ];

  const toggleModule = (id) => {
    setSelectedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const getStatusColor = (status) => {
    if (status >= 90) return 'bg-green-100 border-green-500';
    if (status >= 50) return 'bg-yellow-100 border-yellow-500';
    if (status > 0) return 'bg-orange-100 border-orange-500';
    return 'bg-red-100 border-red-500';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'CRÍTICA') return 'bg-red-500 text-white';
    if (priority === 'ALTA') return 'bg-orange-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const totalTime = modules
    .filter(m => selectedModules.includes(m.id))
    .reduce((acc, m) => {
      const [min, max] = m.time.split('-').map(t => parseInt(t));
      return acc + (min + (max || min)) / 2;
    }, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📋 Plano de Implementação (19-21 Jun)
        </h1>
        <p className="text-gray-600">
          Selecione os módulos que deseja implementar. Total selecionado: <strong>{totalTime.toFixed(1)} dias</strong>
        </p>
      </div>

      {/* Resumo */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total de Módulos</div>
          <div className="text-3xl font-bold text-gray-900">{modules.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Selecionados</div>
          <div className="text-3xl font-bold text-blue-600">{selectedModules.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Tempo Total</div>
          <div className="text-3xl font-bold text-orange-600">{totalTime.toFixed(1)}d</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Status Médio</div>
          <div className="text-3xl font-bold text-green-600">
            {Math.round(modules.reduce((acc, m) => acc + m.status, 0) / modules.length)}%
          </div>
        </div>
      </div>

      {/* Lista de Módulos */}
      <div className="space-y-4">
        {modules.map(module => (
          <div
            key={module.id}
            className={`bg-white rounded-lg shadow hover:shadow-lg transition border-l-4 ${
              selectedModules.includes(module.id) ? 'ring-2 ring-blue-500' : ''
            } ${getStatusColor(module.status)}`}
          >
            <div className="p-6">
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="mt-1"
                  >
                    {selectedModules.includes(module.id) ? (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{module.name}</h3>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(module.priority)}`}>
                        {module.priority}
                      </span>
                      <span className="text-sm text-gray-600">{module.impact}</span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {module.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{
                    color: module.status >= 70 ? '#10b981' : module.status >= 40 ? '#f59e0b' : '#ef4444'
                  }}>
                    {module.status}%
                  </div>
                  <div className="text-xs text-gray-500">implementado</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${module.status}%`,
                      backgroundColor: module.status >= 70 ? '#10b981' : module.status >= 40 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 text-sm">Tarefas:</h4>
                {module.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <Zap className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Action */}
      {selectedModules.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-8 py-4 rounded-lg shadow-lg">
          <div className="text-sm font-semibold mb-1">Pronto para implementar?</div>
          <div className="text-2xl font-bold">{selectedModules.length} módulo(s) selecionado(s)</div>
          <div className="text-sm opacity-90">Tempo estimado: {totalTime.toFixed(1)} dias</div>
          <button
            onClick={() => alert(`Implementar: ${selectedModules.join(', ')}`)}
            className="mt-3 w-full bg-white text-blue-600 px-4 py-2 rounded font-bold hover:bg-blue-50 transition"
          >
            🚀 Começar Implementação
          </button>
        </div>
      )}
    </div>
  );
}
