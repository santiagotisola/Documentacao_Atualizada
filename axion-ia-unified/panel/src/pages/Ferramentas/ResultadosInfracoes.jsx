import React, { useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import TabelaInfracoes from '../../components/ferramentas/TabelaInfracoes';

export default function ResultadosInfracoes() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { infracoes = [], consulta = {} } = location.state || {};

  // Estatísticas
  const estatisticas = useMemo(() => {
    if (!infracoes.length) return null;

    return {
      total: infracoes.length,
      valorTotal: infracoes.reduce((acc, inf) => acc + (inf.ValorMulta || 0), 0),
      media: infracoes.reduce((acc, inf) => acc + (inf.ValorMulta || 0), 0) / infracoes.length,
      pendentes: infracoes.filter(inf => inf.StatusMulta === 'Pendente').length,
      pagas: infracoes.filter(inf => inf.StatusMulta === 'Pago').length,
      vencidas: infracoes.filter(inf => inf.StatusMulta === 'Vencido').length
    };
  }, [infracoes]);

  // Se não houver infrações, redirecionar
  if (!infracoes.length) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhuma infração encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            Não foram encontradas infrações para {consulta.tipo === 'cpf' ? 'o CPF' : 'a placa'}: {consulta.valor}
          </p>
          <Link
            to="/ferramentas/consulta-infracoes"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Nova Consulta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/ferramentas/consulta-infracoes"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nova Consulta
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Resultados da Consulta
        </h1>
        <p className="text-gray-600">
          {consulta.tipo === 'cpf' ? 'CPF' : 'Placa'}: <span className="font-semibold">{consulta.valor}</span>
        </p>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Infrações</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
              </div>
              <FileSpreadsheet className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estatisticas.valorTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estatisticas.media.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {estatisticas.pendentes} Pend.
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {estatisticas.pagas} Pago
                  </span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    {estatisticas.vencidas} Venc.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela */}
      <TabelaInfracoes infracoes={infracoes} />
    </div>
  );
}
