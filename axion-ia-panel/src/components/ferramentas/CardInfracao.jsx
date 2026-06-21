import React from 'react';
import { Calendar, MapPin, Camera, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CardInfracao({ infracao }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Vencido':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-gray-500 mr-2" />
          <span className="text-sm font-semibold text-gray-900">
            Auto: {infracao.AutoInfracao}
          </span>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(infracao.StatusMulta)}`}>
          {infracao.StatusMulta || 'N/A'}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold mb-1">PLACA</p>
          <p className="text-2xl font-bold text-blue-900 tracking-wider">
            {infracao.Placa}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Data e Hora</p>
            <p className="text-sm font-semibold text-gray-900">
              {format(new Date(infracao.DataDaInfracao), "dd/MM/yyyy 'às' ", { locale: ptBR })}
              {infracao.HoraDaInfracao}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Local da Infração</p>
            <p className="text-sm text-gray-900 font-medium">
              {infracao.LocalDaInfracao}
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-gray-500">Enquadramento</p>
            <p className="text-sm font-semibold text-gray-900">
              {infracao.Enquadramento?.Codigo || '-'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {infracao.Enquadramento?.Descricao || 'Sem descrição'}
            </p>
          </div>
        </div>

        {infracao.Equipamento && (
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Equipamento</p>
              <p className="text-sm text-gray-900">
                {infracao.Equipamento} {infracao.EquipamentoDescricao && `- ${infracao.EquipamentoDescricao}`}
              </p>
            </div>
          </div>
        )}

        {infracao.Velocidade && infracao.VelocidadePermitida && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 font-semibold">VELOCIDADE REGISTRADA</p>
                <p className="text-2xl font-bold text-red-700">
                  {infracao.Velocidade} km/h
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-red-600">Permitido</p>
                <p className="text-lg font-semibold text-red-700">
                  {infracao.VelocidadePermitida} km/h
                </p>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs font-semibold text-red-700">
                Excesso: {infracao.Velocidade - infracao.VelocidadePermitida} km/h
              </span>
            </div>
          </div>
        )}

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="w-6 h-6 text-green-600 mr-2" />
              <div>
                <p className="text-xs text-green-600 font-semibold">VALOR DA MULTA</p>
                <p className="text-2xl font-bold text-green-700">
                  {(infracao.ValorMulta || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
