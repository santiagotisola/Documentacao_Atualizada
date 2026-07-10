import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function QualityModules() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const token = localStorage.getItem('apiToken') || '4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3';
      const res = await fetch('http://localhost:3100/api/quality/modules', { headers: { 'x-api-token': token } });
      const data = await res.json();
      setModules(data.modules || []);
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando módulos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Módulos PIEQ</h1>
        <p className="text-gray-600">Capabilities da plataforma de qualidade</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div key={module.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{module.name}</h3>
              {module.enabled ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
            </div>
            <p className="text-gray-600 text-sm mb-4">{module.description}</p>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase">Componentes:</div>
              {(module.components || module.methods || module.capabilities || module.modes || module.metrics || []).map((item, idx) => (
                <div key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-gray-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
