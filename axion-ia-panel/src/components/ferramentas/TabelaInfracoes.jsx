import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Calendar, MapPin, DollarSign, FileText, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TabelaInfracoes({ infracoes }) {
  const [ordenacao, setOrdenacao] = useState({ campo: 'DataDaInfracao', direcao: 'desc' });

  const infracoesOrdenadas = useMemo(() => {
    return [...infracoes].sort((a, b) => {
      const { campo, direcao } = ordenacao;
      let valorA = a[campo];
      let valorB = b[campo];

      if (campo === 'Enquadramento') {
        valorA = a.Enquadramento?.Codigo || '';
        valorB = b.Enquadramento?.Codigo || '';
      }

      if (campo === 'DataDaInfracao') {
        valorA = new Date(valorA);
        valorB = new Date(valorB);
      }

      if (valorA < valorB) return direcao === 'asc' ? -1 : 1;
      if (valorA > valorB) return direcao === 'asc' ? 1 : -1;
      return 0;
    });
  }, [infracoes, ordenacao]);

  const alternarOrdenacao = (campo) => {
    setOrdenacao((prev) => ({
      campo,
      direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
    }));
  };

  const CabecalhoOrdenavel = ({ campo, label }) => (
    <th
      onClick={() => alternarOrdenacao(campo)}
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <ArrowUpDown className="w-4 h-4" />
        {ordenacao.campo === campo && (
          ordenacao.direcao === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <CabecalhoOrdenavel campo="AutoInfracao" label="Auto" />
              <CabecalhoOrdenavel campo="Placa" label="Placa" />
              <CabecalhoOrdenavel campo="DataDaInfracao" label="Data/Hora" />
              <CabecalhoOrdenavel campo="LocalDaInfracao" label="Local" />
              <CabecalhoOrdenavel campo="Enquadramento" label="Enquadramento" />
              <CabecalhoOrdenavel campo="ValorMulta" label="Valor" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {infracoesOrdenadas.map((infracao) => (
              <tr key={infracao.AutoInfracao} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {infracao.AutoInfracao}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900 font-semibold">
                    {infracao.Placa}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm text-gray-900">
                        {format(new Date(infracao.DataDaInfracao), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {infracao.HoraDaInfracao}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {infracao.LocalDaInfracao}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {infracao.Enquadramento?.Codigo || '-'}
                    </div>
                    <div className="text-xs text-gray-500 max-w-xs truncate">
                      {infracao.Enquadramento?.Descricao || '-'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-semibold text-gray-900">
                      {(infracao.ValorMulta || 0).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      infracao.StatusMulta === 'Pendente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : infracao.StatusMulta === 'Pago'
                        ? 'bg-green-100 text-green-800'
                        : infracao.StatusMulta === 'Vencido'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {infracao.StatusMulta || 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Exibindo <span className="font-semibold">{infracoes.length}</span> infrações
          </p>
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Total: </span>
            {infracoes.reduce((acc, inf) => acc + (inf.ValorMulta || 0), 0).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
