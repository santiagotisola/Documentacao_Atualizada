import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// Schemas de validação Zod
const loginSchema = z.object({
  cpf: z
    .string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(14, 'CPF inválido')
    .refine((cpf) => validarCPF(cpf.replace(/\D/g, '')), {
      message: 'CPF inválido'
    }),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

const registroSchema = z.object({
  cpf: z
    .string()
    .min(11, 'CPF deve ter 11 dígitos')
    .refine((cpf) => validarCPF(cpf.replace(/\D/g, '')), {
      message: 'CPF inválido'
    }),
  nome: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string().email('E-mail inválido'),
  telefone: z
    .string()
    .min(10, 'Telefone deve ter 10 ou 11 dígitos')
    .optional(),
  senha: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
  confirmarSenha: z.string()
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha']
});

// Validação de CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto >= 10 ? 0 : resto;

  if (digito1 !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto >= 10 ? 0 : resto;

  return digito2 === parseInt(cpf.charAt(10));
}

// Máscara de CPF
function mascaraCPF(valor) {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Máscara de Telefone
function mascaraTelefone(valor) {
  return valor
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

// Calcular força da senha
function calcularForcaSenha(senha) {
  if (!senha) return 0;
  let forca = 0;
  if (senha.length >= 8) forca += 25;
  if (senha.length >= 12) forca += 25;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) forca += 25;
  if (/[0-9]/.test(senha)) forca += 25;
  if (/[^A-Za-z0-9]/.test(senha)) forca += 25;
  return Math.min(forca, 100);
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [aba, setAba] = useState('login'); // 'login' ou 'registro'
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [forcaSenha, setForcaSenha] = useState(0);

  const { message, from } = location.state || {};

  // Form Login
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin },
    setValue: setValueLogin,
    watch: watchLogin
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  // Form Registro
  const {
    register: registerRegistro,
    handleSubmit: handleSubmitRegistro,
    formState: { errors: errorsRegistro },
    setValue: setValueRegistro,
    watch: watchRegistro
  } = useForm({
    resolver: zodResolver(registroSchema)
  });

  const senhaRegistro = watchRegistro('senha');

  // Calcular força da senha em tempo real
  useEffect(() => {
    if (senhaRegistro) {
      setForcaSenha(calcularForcaSenha(senhaRegistro));
    } else {
      setForcaSenha(0);
    }
  }, [senhaRegistro]);

  // Mostrar mensagem de redirecionamento
  useEffect(() => {
    if (message) {
      toast(message, { icon: '🔒' });
    }
  }, [message]);

  // Submit Login
  const onLoginSubmit = async (data) => {
    setCarregando(true);
    try {
      const cpfLimpo = data.cpf.replace(/\D/g, '');
      const response = await api.login(cpfLimpo, data.senha);

      // Salvar token e dados do usuário
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast.success(`Bem-vindo, ${response.user.nome}!`);

      // Redirecionar para a página original ou home
      navigate(from || '/', { replace: true });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error(error.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  // Submit Registro
  const onRegistroSubmit = async (data) => {
    setCarregando(true);
    try {
      const cpfLimpo = data.cpf.replace(/\D/g, '');
      const telefoneLimpo = data.telefone?.replace(/\D/g, '') || '';

      const response = await api.registrar({
        cpf: cpfLimpo,
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        telefone: telefoneLimpo
      });

      // Salvar token e dados do usuário
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      toast.success('Conta criada com sucesso!');

      // Redirecionar
      navigate(from || '/', { replace: true });
    } catch (error) {
      console.error('Erro ao registrar:', error);
      toast.error(error.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  // Indicador de força da senha
  const IndicadorForcaSenha = () => {
    const getColor = () => {
      if (forcaSenha < 40) return 'bg-red-500';
      if (forcaSenha < 70) return 'bg-yellow-500';
      return 'bg-green-500';
    };

    const getLabel = () => {
      if (forcaSenha < 40) return 'Fraca';
      if (forcaSenha < 70) return 'Média';
      return 'Forte';
    };

    if (!senhaRegistro) return null;

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Força da senha:</span>
          <span className={`text-xs font-semibold ${
            forcaSenha < 40 ? 'text-red-600' : forcaSenha < 70 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {getLabel()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getColor()}`}
            style={{ width: `${forcaSenha}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Portal do Cidadão
          </h1>
          <p className="text-gray-600">
            Gerencie suas infrações de trânsito
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setAba('login')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                aba === 'login'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LogIn className="w-5 h-5 inline mr-2" />
              Entrar
            </button>
            <button
              onClick={() => setAba('registro')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition ${
                aba === 'registro'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              Registrar
            </button>
          </div>

          {/* Formulários */}
          <div className="p-6">
            {/* Form Login */}
            {aba === 'login' && (
              <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
                {/* CPF */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF
                  </label>
                  <input
                    {...registerLogin('cpf')}
                    type="text"
                    maxLength={14}
                    placeholder="000.000.000-00"
                    onChange={(e) => {
                      const masked = mascaraCPF(e.target.value);
                      setValueLogin('cpf', masked);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errorsLogin.cpf ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errorsLogin.cpf && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errorsLogin.cpf.message}
                    </p>
                  )}
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      {...registerLogin('senha')}
                      type={mostrarSenha ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errorsLogin.senha ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errorsLogin.senha && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errorsLogin.senha.message}
                    </p>
                  )}
                </div>

                {/* Botão Submit */}
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {carregando ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-2" />
                      Entrar
                    </>
                  )}
                </button>

                {/* Link Esqueceu Senha */}
                <div className="text-center">
                  <Link to="#" className="text-sm text-blue-600 hover:text-blue-700">
                    Esqueceu sua senha?
                  </Link>
                </div>
              </form>
            )}

            {/* Form Registro */}
            {aba === 'registro' && (
              <form onSubmit={handleSubmitRegistro(onRegistroSubmit)} className="space-y-4">
                {/* CPF */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    {...registerRegistro('cpf')}
                    type="text"
                    maxLength={14}
                    placeholder="000.000.000-00"
                    onChange={(e) => {
                      const masked = mascaraCPF(e.target.value);
                      setValueRegistro('cpf', masked);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errorsRegistro.cpf ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errorsRegistro.cpf && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errorsRegistro.cpf.message}
                    </p>
                  )}
                </div>

                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    {...registerRegistro('nome')}
                    type="text"
                    placeholder="Seu nome completo"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errorsRegistro.nome ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errorsRegistro.nome && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errorsRegistro.nome.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <input
                    {...registerRegistro('email')}
                    type="email"
                    placeholder="seu@email.com"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errorsRegistro.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errorsRegistro.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errorsRegistro.email.message}
                    </p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone (Opcional)
                  </label>
                  <input
                    {...registerRegistro('telefone')}
                    type="tel"
                    maxLength={15}
                    placeholder="(11) 98765-4321"
                    onChange={(e) => {
                      const masked = mascaraTelefone(e.target.value);
                      setValueRegistro('telefone', masked);
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errorsRegistro.telefone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errorsRegistro.telefone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errorsRegistro.telefone.message}
                    </p>
                  )}
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      {...registerRegistro('senha')}
                      type={mostrarSenha ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errorsRegistro.senha ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <IndicadorForcaSenha />
                  {errorsRegistro.senha && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errorsRegistro.senha.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número
                  </p>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <input
                      {...registerRegistro('confirmarSenha')}
                      type={mostrarConfirmarSenha ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errorsRegistro.confirmarSenha ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {mostrarConfirmarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errorsRegistro.confirmarSenha && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errorsRegistro.confirmarSenha.message}
                    </p>
                  )}
                </div>

                {/* Botão Submit */}
                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {carregando ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Criar Conta
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">
            ← Voltar para home
          </Link>
        </div>
      </div>
    </div>
  );
}
