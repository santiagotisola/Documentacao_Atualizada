import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function QualityReports() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const token = localStorage.getItem('apiToken') || '4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3';
      const res = await fetch('http://localhost:3100/api/quality/scans', { headers: { 'x-api-token': token } });
      const data = await res.json();
      setScans(data.scans || []);
    } catch (error) {
      console.error('Erro ao carregar scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'failed') return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Relatórios</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios de Scans</h1>
        <p className="text-gray-600">Histórico completo de Validações</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projeto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duração</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Testes</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{scan.projectName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-2xl font-bold ${getScoreColor(scan.score)}`}>
                    {scan.score}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {new Date(scan.date).toLocaleString('pt-BR')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(scan.status)}
                    <span className="text-sm capitalize">{scan.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {scan.duration}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {scan.testsPassed}/{scan.testsRun}
                  </div>
                  <div className="text-xs text-gray-500">
                    {scan.testsFailed} falhas
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="text-gray-600 hover:text-gray-900">
                    <Download className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
