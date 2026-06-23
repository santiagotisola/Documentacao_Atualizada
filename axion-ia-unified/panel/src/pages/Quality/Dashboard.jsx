import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Zap, TestTube, GitBranch, Database, Radio,
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  CheckCircle, XCircle, Clock, Play, Plus
} from 'lucide-react';

export default function QualityDashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalScans: 0,
    totalIssues: 0,
    averageScore: 0,
    criticalIssues: 0,
    highIssues: 0
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // TODO: Integrar com API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data
      setStats({
        totalProjects: 12,
        totalScans: 156,
        totalIssues: 342,
        averageScore: 78,
        criticalIssues: 8,
        highIssues: 24
      });
      
      setProjects([
        { id: 1, name: 'AxionIA Panel', type: 'frontend', score: 85, trend: 'improving', issues: 12 },
        { id: 2, name: 'AxionIA API', type: 'backend', score: 82, trend: 'stable', issues: 18 },
        { id: 3, name: 'Portal Cidadão', type: 'fullstack', score: 91, trend: 'improving', issues: 5 }
      ]);
      
      setRecentScans([
        { id: 1, projectName: 'AxionIA Panel', score: 85, date: new Date(), status: 'completed' },
        { id: 2, projectName: 'AxionIA API', score: 82, date: new Date(Date.now() - 3600000), status: 'completed' }
      ]);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 75) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'degrading') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'failed') return <XCircle className="w-5 h-5 text-red-500" />;
    if (status === 'running') return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Quality Engineering Platform
            </h1>
          </div>
          <Link
            to="/quality/new-project"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Projeto
          </Link>
        </div>
        <p className="text-gray-600">
          Plataforma de análise automatizada de qualidade, segurança e performance
        </p>
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projetos Ativos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
            <GitBranch className="w-10 h-10 text-purple-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score Médio</p>
              <p className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}>
                {stats.averageScore}%
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Issues Abertas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalIssues}</p>
              <p className="text-xs text-red-600 mt-1">
                {stats.criticalIssues} críticas, {stats.highIssues} altas
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scans Realizados</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalScans}</p>
            </div>
            <Play className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Engines Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Validation Engines</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Security</p>
              <p className="text-sm text-gray-600">SQL Injection, XSS, CSRF, Secrets</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <Zap className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-semibold text-gray-900">Performance</p>
              <p className="text-sm text-gray-600">Load, Stress, Response Time</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <TestTube className="w-8 h-8 text-purple-600" />
            <div>
              <p className="font-semibold text-gray-900">Functional</p>
              <p className="text-sm text-gray-600">Coverage, Unit Tests, E2E</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <GitBranch className="w-8 h-8 text-orange-600" />
            <div>
              <p className="font-semibold text-gray-900">Architecture</p>
              <p className="text-sm text-gray-600">Complexity, Coupling, Cohesion</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <Database className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="font-semibold text-gray-900">Database</p>
              <p className="text-sm text-gray-600">Slow Queries, Indexes, Integrity</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg border border-pink-200">
            <Radio className="w-8 h-8 text-pink-600" />
            <div>
              <p className="font-semibold text-gray-900">API</p>
              <p className="text-sm text-gray-600">Contract, Latency, Errors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Projetos Monitorados</h2>
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/quality/projects/${project.id}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-3 rounded-lg border ${getScoreBgColor(project.score)}`}>
                    <p className="text-xs text-gray-600">Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(project.score)}`}>
                      {project.score}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900">{project.name}</p>
                      {getTrendIcon(project.trend)}
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{project.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {project.issues} issues abertas
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Scans Recentes</h2>
        <div className="space-y-3">
          {recentScans.map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(scan.status)}
                <div>
                  <p className="font-semibold text-gray-900">{scan.projectName}</p>
                  <p className="text-sm text-gray-600">
                    {scan.date.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full ${getScoreBgColor(scan.score)}`}>
                <p className={`font-semibold ${getScoreColor(scan.score)}`}>
                  {scan.score}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
