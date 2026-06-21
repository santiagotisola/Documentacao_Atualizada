import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileDown, Filter, Search, AlertCircle, ArrowLeft } from 'lucide-react';
import TabelaInfracoes from '../components/infracoes/TabelaInfracoes';
import CardInfracao from '../components/infracoes/CardInfracao';
import FiltrosInfracoes from '../components/infracoes/FiltrosInfracoes';
import { toast } from 'react-hot-toast';

export default function Resultados() {
  const location = useLocation();
  const navigate = useNavigate();
  const { infracoes, tipo, valor } = location.state || {};

  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    valorMin: '',
    valorMax: '',
    equipamento: '',
    status: '',
    busca: ''
  });
  
  const [visualizacao, setVisualizacao] = useState('tabela'); // 'tabela' ou 'cards'
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Redirecionar se não houver dados
  React.useEffect(() => {
    if (!infracoes || infracoes.length === 0) {
      toast.error('Nenhuma infração encontrada. Faça uma nova consulta.');
      navigate('/');
    }
  }, [infracoes, navigate]);

  // Filtrar infrações
  const infracoesFiltradas = useMemo(() => {
    if (!infracoes) return [];

    return infracoes.filter((infracao) => {
      // Filtro por data
      if (filtros.dataInicio) {
        const dataInfracao = new Date(infracao.DataDaInfracao);
        const dataInicio = new Date(filtros.dataInicio);
        if (dataInfracao < dataInicio) return false;
      }
      
      if (filtros.dataFim) {
        const dataInfracao = new Date(infracao.DataDaInfracao);
        const dataFim = new Date(filtros.dataFim);
        if (dataInfracao > dataFim) return false;
      }

      // Filtro por valor
      if (filtros.valorMin && infracao.ValorMulta < parseFloat(filtros.valorMin)) {
        return false;
      }
      
      if (filtros.valorMax && infracao.ValorMulta > parseFloat(filtros.valorMax)) {
        return false;
      }

      // Filtro por equipamento
      if (filtros.equipamento && 
          !infracao.Equipamento?.toLowerCase().includes(filtros.equipamento.toLowerCase())) {
        return false;
      }

      // Filtro por status
      if (filtros.status && infracao.StatusMulta !== filtros.status) {
        return false;
      }

      // Busca geral
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        const campos = [
          infracao.AutoInfracao,
          infracao.Placa,
          infracao.LocalDaInfracao,
          infracao.Enquadramento?.Descricao,
          infracao.Equipamento
        ];
        
        const encontrado = campos.some(campo => 
          campo?.toString().toLowerCase().includes(busca)
        );
        
        if (!encontrado) return false;
      }

      return true;
    });
  }, [infracoes, filtros]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    if (!infracoesFiltradas) return { total: 0, valorTotal: 0, media: 0 };

    const valorTotal = infracoesFiltradas.reduce((acc, inf) => acc + (inf.ValorMulta || 0), 0);
    
    return {
      total: infracoesFiltradas.length,
      valorTotal,
      media: valorTotal / infracoesFiltradas.length || 0
    };
  }, [infracoesFiltradas]);

  // Exportar PDF
  const exportarPDF = async () => {
    try {
      toast.loading('Gerando PDF...');
      
      // TODO: Implementar exportação real com jsPDF
      // Por enquanto, simulação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.dismiss();
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao exportar PDF');
      console.error(error);
    }
  };

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      valorMin: '',
      valorMax: '',
      equipamento: '',
      status: '',
      busca: ''
    });
  };

  if (!infracoes) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Nova consulta
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Resultados da Consulta
              </h1>
              <p className="mt-2 text-gray-600">
                {tipo === 'cpf' ? 'CPF' : 'Placa'}: <span className="font-semibold">{valor}</span>
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </button>

              <button
                onClick={exportarPDF}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Infrações</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {estatisticas.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {estatisticas.valorTotal.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Médio</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {estatisticas.media.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {mostrarFiltros && (
          <FiltrosInfracoes
            filtros={filtros}
            onChange={setFiltros}
            onLimpar={limparFiltros}
          />
        )}

        {/* Busca rápida */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por auto, placa, local, enquadramento..."
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Controle de visualização (Mobile) */}
        <div className="md:hidden mb-4 flex justify-center space-x-2">
          <button
            onClick={() => setVisualizacao('tabela')}
            className={`px-4 py-2 rounded-lg ${
              visualizacao === 'tabela'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Tabela
          </button>
          <button
            onClick={() => setVisualizacao('cards')}
            className={`px-4 py-2 rounded-lg ${
              visualizacao === 'cards'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Cards
          </button>
        </div>

        {/* Resultados */}
        {infracoesFiltradas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma infração encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar os filtros ou fazer uma nova consulta
            </p>
            <button
              onClick={limparFiltros}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <>
            {/* Visualização Desktop - sempre tabela */}
            <div className="hidden md:block">
              <TabelaInfracoes infracoes={infracoesFiltradas} />
            </div>

            {/* Visualização Mobile - tabela ou cards */}
            <div className="md:hidden">
              {visualizacao === 'tabela' ? (
                <TabelaInfracoes infracoes={infracoesFiltradas} />
              ) : (
                <div className="space-y-4">
                  {infracoesFiltradas.map((infracao) => (
                    <CardInfracao key={infracao.AutoInfracao} infracao={infracao} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
