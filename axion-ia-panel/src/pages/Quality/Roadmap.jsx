import React, { useState, useEffect } from 'react';
import { GitBranch, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function QualityRoadmap() {
  const [roadmap, setRoadmap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    try {
      const token = localStorage.getItem('apiToken') || '4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3';
      const res = await fetch('http://localhost:3100/api/quality/roadmap', { headers: { 'x-api-token': token } });
      const data = await res.json();
      setRoadmap(data);
    } catch (error) {
      console.error('Erro ao carregar roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando roadmap...</p>
        </div>
      </div>
    );
  }

  const phases = [
    { id: 'phase1', ...roadmap.phase1 },
    { id: 'phase2', ...roadmap.phase2 },
    { id: 'phase3', ...roadmap.phase3 }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Roadmap PIEQ</h1>
        <p className="text-gray-600">Fases de implementação da plataforma</p>
      </div>

      <div className="space-y-6">
        {phases.map((phase, idx) => (
          <div key={phase.id} className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Fase {idx + 1}: {phase.version}
                </h3>
                <p className="text-gray-600 mt-1">Duração: {phase.duration}</p>
              </div>
              <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                Fase {idx + 1}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700 mb-3">Features:</h4>
              {(phase.features || []).map((feature, fidx) => (
                <div key={fidx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
