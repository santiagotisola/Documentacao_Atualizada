import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import FormConsultaInfracoes from '../../components/ferramentas/FormConsultaInfracoes';

export default function ConsultaInfracoes() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/operations-hub"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Operations Hub
        </Link>
        
        <div className="flex items-center space-x-3 mb-2">
          <Search className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Consultar Infrações
          </h1>
        </div>
        <p className="text-gray-600">
          Ferrament de análise e suporte - Consulte infrações por CPF ou Placa
        </p>
      </div>

      {/* Form de Consulta */}
      <FormConsultaInfracoes />

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">AxHub</h3>
          <p className="text-sm text-blue-700">
            Consulta direta no banco AxHub para análise de chamados
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Validação</h3>
          <p className="text-sm text-green-700">
            Validação completa com dígitos verificadores de CPF
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">Análise</h3>
          <p className="text-sm text-purple-700">
            Filtros avançados e exportação de relatórios
          </p>
        </div>
      </div>
    </div>
  );
}
