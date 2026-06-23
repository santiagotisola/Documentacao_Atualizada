import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Navigation, Search, MapPin, AlertCircle } from 'lucide-react';

export default function ConsultaCruzamentos() {
  const [placa, setPlaca] = useState('');
  const [loading, setLoading] = useState(false);
  const [cruzamentos, setCruzamentos] = useState([]);

  const handleConsultar = async () => {
    setLoading(true);
    // TODO: Integrar com API AxCross
    setTimeout(() => {
      setLoading(false);
      setCruzamentos([]);
    }, 1000);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link 
          to="/operations-hub"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Operations Hub
        </Link>
        
        <div className="flex items-center space-x-3 mb-2">
          <Navigation className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Monitoramento de Cruzamentos AxCross
          </h1>
        </div>
        <p className="text-gray-600">
          Ferramenta de suporte - Consulte cruzamentos e alertas por placa
        </p>
      </div>

      {/* Form de Consulta */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="max-w-2xl">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Placa do Veículo
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={placa}
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
              placeholder="ABC-1234 ou ABC1D23"
              maxLength={8}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={handleConsultar}
              disabled={!placa || loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2 flex items-center">
            <Navigation className="w-5 h-5 mr-2" />
            AxCross
          </h3>
          <p className="text-sm text-green-700">
            Consulta direta no banco AxCross para análise de chamados de monitoramento
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Equipamentos
          </h3>
          <p className="text-sm text-blue-700">
            Visualização de equipamentos de monitoramento e pontos de cruzamento
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="font-semibold text-red-900 mb-2 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Alertas
          </h3>
          <p className="text-sm text-red-700">
            Histórico de alertas e vigência de veículos monitorados
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          ⚙️ <strong>Em Desenvolvimento:</strong> Integração com banco de dados AxCross em andamento. 
          Funcionalidade completa será liberada em breve.
        </p>
      </div>
    </div>
  );
}
