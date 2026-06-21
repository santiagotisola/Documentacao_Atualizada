import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, User, Car, Shield } from 'lucide-react'
import { consultarInfracoes } from '@services/api'
import { toast } from 'react-hot-toast'
import { useRecaptcha } from '../../hooks/useRecaptcha'

// Validação com Zod
const schema = z.object({
  tipo: z.enum(['cpf', 'placa'], {
    required_error: 'Selecione o tipo de consulta',
  }),
  valor: z.string()
    .min(1, 'Campo obrigatório')
    .refine((val) => {
      // Remove caracteres não alfanuméricos para validação
      const cleaned = val.replace(/\D/g, '')
      return cleaned.length >= 7 // CPF tem 11, Placa tem 7
    }, 'Formato inválido')
})

export default function FormConsulta() {
  const [loading, setLoading] = useState(false)
  const [tipoSelecionado, setTipoSelecionado] = useState('cpf')
  const navigate = useNavigate()
  const { ready: recaptchaReady, execute: executeRecaptcha } = useRecaptcha()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: 'cpf',
      valor: ''
    }
  })

  const tipo = watch('tipo')

  // Atualiza tipo selecionado e limpa valor
  const handleTipoChange = (novoTipo) => {
    setTipoSelecionado(novoTipo)
    setValue('tipo', novoTipo)
    setValue('valor', '')
  }

  // Máscara de CPF
  const formatCPF = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return value
  }

  // Máscara de Placa
  const formatPlaca = (value) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (cleaned.length <= 7) {
      // Placa antiga: AAA-9999 ou Mercosul: AAA9A99
      if (cleaned.length <= 3) {
        return cleaned
      } else if (cleaned.length <= 7) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
      }
    }
    return value.toUpperCase()
  }

  // Handle input change com máscara
  const handleInputChange = (e) => {
    let value = e.target.value
    if (tipo === 'cpf') {
      value = formatCPF(value)
    } else {
      value = formatPlaca(value)
    }
    setValue('valor', value)
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      // Gerar token reCAPTCHA
      let recaptchaToken;
      try {
        recaptchaToken = await executeRecaptcha('consultar');
      } catch (error) {
        toast.error('Erro ao verificar reCAPTCHA. Tente novamente.');
        console.error('reCAPTCHA error:', error);
        setLoading(false);
        return;
      }
      
      const result = await consultarInfracoes({
        tipo: data.tipo,
        valor: data.valor,
        recaptchaToken
      })
      
      // Navega para resultados com os dados
      navigate('/resultados', { state: { infracoes: result, consulta: data } })
      
    } catch (error) {
      console.error('Erro na consulta:', error)
      toast.error('Erro ao consultar infrações. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card animate-slide-up">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Consultar Infrações
        </h2>

        {/* Seletor de Tipo */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => handleTipoChange('cpf')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoSelecionado === 'cpf'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <User
              size={32}
              className={`mx-auto mb-2 ${
                tipoSelecionado === 'cpf' ? 'text-primary-600' : 'text-gray-400'
              }`}
            />
            <p className={`font-medium ${
              tipoSelecionado === 'cpf' ? 'text-primary-600' : 'text-gray-600'
            }`}>
              Por CPF
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleTipoChange('placa')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tipoSelecionado === 'placa'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Car
              size={32}
              className={`mx-auto mb-2 ${
                tipoSelecionado === 'placa' ? 'text-primary-600' : 'text-gray-400'
              }`}
            />
            <p className={`font-medium ${
              tipoSelecionado === 'placa' ? 'text-primary-600' : 'text-gray-600'
            }`}>
              Por Placa
            </p>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register('tipo')} />

          <div>
            <label className="form-label">
              {tipo === 'cpf' ? 'CPF' : 'Placa do Veículo'}
            </label>
            <input
              type="text"
              {...register('valor')}
              onChange={handleInputChange}
              placeholder={tipo === 'cpf' ? '000.000.000-00' : 'ABC-1234'}
              className={`form-input text-lg ${errors.valor ? 'form-input-error' : ''}`}
              disabled={loading}
              maxLength={tipo === 'cpf' ? 14 : 8}
            />
            {errors.valor && (
              <p className="form-error">{errors.valor.message}</p>
            )}
            <p className="form-helper">
              {tipo === 'cpf' 
                ? 'Informe o CPF do proprietário ou condutor'
                : 'Informe a placa do veículo (antiga ou Mercosul)'
              }
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !recaptchaReady}
            className="btn btn-primary w-full text-lg flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="spinner w-5 h-5"></div>
                <span>Consultando...</span>
              </>
            ) : !recaptchaReady ? (
              <>
                <Shield size={20} className="animate-pulse" />
                <span>Carregando verificação de segurança...</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>Consultar Infrações</span>
              </>
            )}
          </button>

          {/* Badge reCAPTCHA */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Este site é protegido pelo reCAPTCHA e as{' '}
            <a 
              href="https://policies.google.com/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Políticas de Privacidade
            </a>
            {' '}e{' '}
            <a 
              href="https://policies.google.com/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Termos de Serviço
            </a>
            {' '}do Google se aplicam.
          </p>
        </form>

        {/* Informações */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>ℹ️ Importante:</strong> A consulta é gratuita e não requer cadastro. 
            Para contestar uma infração, será necessário criar uma conta.
          </p>
        </div>
      </div>
    </div>
  )
}
