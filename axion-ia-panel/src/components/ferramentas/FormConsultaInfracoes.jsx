import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Car } from 'lucide-react';

export default function FormConsultaInfracoes() {
  const [loading, setLoading] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState('cpf');
  const [valor, setValor] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Máscara de CPF
  const formatCPF = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value;
  };

  // Máscara de Placa
  const formatPlaca = (value) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 7) {
      if (cleaned.length <= 3) {
        return cleaned;
      } else {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      }
    }
    return value.toUpperCase();
  };

  const handleTipoChange = (novoTipo) => {
    setTipoSelecionado(novoTipo);
    setValor('');
    setError('');
  };

  const handleInputChange = (e) => {
    let newValue = e.target.value;
    if (tipoSelecionado === 'cpf') {
      newValue = formatCPF(newValue);
    } else {
      newValue = formatPlaca(newValue);
    }
    setValor(newValue);
    setError('');
  };

  const validarCPF = (cpf) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    
    return (
      parseInt(cleaned.charAt(9)) === digit1 &&
      parseInt(cleaned.charAt(10)) === digit2
    );
  };

  const validarPlaca = (placa) => {
    const cleaned = placa.replace(/\D/g, '');
    return cleaned.length >= 7;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação
    if (!valor) {
      setError('Campo obrigatório');
      return;
    }
    
    if (tipoSelecionado === 'cpf' && !validarCPF(valor)) {
      setError('CPF inválido');
      return;
    }
    
    if (tipoSelecionado === 'placa' && !validarPlaca(valor)) {
      setError('Placa inválida');
      return;
    }
    
    try {
      setLoading(true);
      
      // Fazer consulta na API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3100'}/api/portal/consultar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tipo: tipoSelecionado,
          valor: valor.replace(/\D/g, '')
        })
      });
      
      if (!response.ok) {
        throw new Error('Erro na consulta');
      }
      
      const data = await response.json();
      
      // Navegar para resultados
      navigate('/ferramentas/resultados-infracoes', { 
        state: { 
          infracoes: data,
          consulta: { tipo: tipoSelecionado, valor }
        } 
      });
      
    } catch (error) {
      console.error('Erro na consulta:', error);
      setError('Erro ao consultar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Consultar Infrações
        </h2>

        {/* Seletor de Tipo */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => handleTipoChange('cpf')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoSelecionado === 'cpf'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <User
              size={32}
              className={`mx-auto mb-2 ${
                tipoSelecionado === 'cpf' ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
            <p className={`font-medium ${
              tipoSelecionado === 'cpf' ? 'text-blue-600' : 'text-gray-600'
            }`}>
              Por CPF
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleTipoChange('placa')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoSelecionado === 'placa'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Car
              size={32}
              className={`mx-auto mb-2 ${
                tipoSelecionado === 'placa' ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
            <p className={`font-medium ${
              tipoSelecionado === 'placa' ? 'text-blue-600' : 'text-gray-600'
            }`}>
              Por Placa
            </p>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {tipoSelecionado === 'cpf' ? 'CPF' : 'Placa do Veículo'}
            </label>
            <input
              type="text"
              value={valor}
              onChange={handleInputChange}
              placeholder={tipoSelecionado === 'cpf' ? '000.000.000-00' : 'ABC-1234'}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
              maxLength={tipoSelecionado === 'cpf' ? 14 : 8}
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {tipoSelecionado === 'cpf' 
                ? 'Informe o CPF do proprietário ou condutor'
                : 'Informe a placa do veículo (antiga ou Mercosul)'
              }
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Consultando...</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>Consultar Infrações</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
