import React from 'react';
import { X, Calendar, DollarSign, Camera } from 'lucide-react';

const FiltrosInfracoes = ({ filtros, onChange, onLimpar }) => {
  const handleChange = (campo, valor) => {
    onChange({ ...filtros, [campo]: valor });
  };

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Pago', label: 'Pago' },
    { value: 'Vencido', label: 'Vencido' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🔍</span>
          Filtros Avançados
        </h3>
        <button
          onClick={onLimpar}
          className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
        >
          <X className="w-4 h-4 mr-1" />
          Limpar tudo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filtro por Data Início */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data Início
          </label>
          <input
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => handleChange('dataInicio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por Data Fim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data Fim
          </label>
          <input
            type="date"
            value={filtros.dataFim}
            onChange={(e) => handleChange('dataFim', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📋 Status
          </label>
          <select
            value={filtros.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Valor Mínimo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Valor Mínimo (R$)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filtros.valorMin}
            onChange={(e) => handleChange('valorMin', e.target.value)}
            placeholder="0,00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por Valor Máximo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Valor Máximo (R$)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={filtros.valorMax}
            onChange={(e) => handleChange('valorMax', e.target.value)}
            placeholder="1000,00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por Equipamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Camera className="w-4 h-4 inline mr-1" />
            Equipamento
          </label>
          <input
            type="text"
            value={filtros.equipamento}
            onChange={(e) => handleChange('equipamento', e.target.value)}
            placeholder="Ex: Radar 001"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Indicador de filtros ativos */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {Object.values(filtros).filter(Boolean).length > 0 ? (
              <>
                <span className="font-semibold text-blue-600">
                  {Object.values(filtros).filter(Boolean).length}
                </span>{' '}
                filtro(s) ativo(s)
              </>
            ) : (
              'Nenhum filtro ativo'
            )}
          </p>

          {Object.values(filtros).filter(Boolean).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filtros.dataInicio && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Data início: {new Date(filtros.dataInicio).toLocaleDateString('pt-BR')}
                </span>
              )}
              {filtros.dataFim && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Data fim: {new Date(filtros.dataFim).toLocaleDateString('pt-BR')}
                </span>
              )}
              {filtros.valorMin && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Min: R$ {filtros.valorMin}
                </span>
              )}
              {filtros.valorMax && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Max: R$ {filtros.valorMax}
                </span>
              )}
              {filtros.equipamento && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Equipamento: {filtros.equipamento}
                </span>
              )}
              {filtros.status && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  Status: {filtros.status}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiltrosInfracoes;
