import axios from 'axios'
import { toast } from 'react-hot-toast'

// Configuração base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3100/api',
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - adiciona token JWT se existir
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erro com resposta do servidor
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Token inválido ou expirado
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          toast.error('Sessão expirada. Faça login novamente.')
          window.location.href = '/login'
          break
          
        case 403:
          toast.error('Você não tem permissão para acessar este recurso.')
          break
          
        case 404:
          toast.error('Recurso não encontrado.')
          break
          
        case 429:
          toast.error('Muitas tentativas. Aguarde alguns instantes.')
          break
          
        case 500:
        case 502:
        case 503:
          toast.error('Erro no servidor. Tente novamente mais tarde.')
          break
          
        default:
          toast.error(data?.message || 'Erro ao processar solicitação.')
      }
    } else if (error.request) {
      // Erro de rede
      toast.error('Erro de conexão. Verifique sua internet.')
    } else {
      // Erro desconhecido
      toast.error('Erro inesperado. Tente novamente.')
    }
    
    return Promise.reject(error)
  }
)

// === ENDPOINTS DO PORTAL ===

/**
 * Consulta infrações por CPF ou Placa
 * @param {Object} params - { tipo: 'cpf'|'placa', valor: string, recaptchaToken: string }
 * @returns {Promise<Array>} Lista de infrações
 */
export const consultarInfracoes = async ({ tipo, valor, recaptchaToken }) => {
  const { data } = await api.post('/portal/consultar', {
    tipo,
    valor,
    recaptchaToken
  })
  return data
}

/**
 * Registra uma contestação
 * @param {Object} contestacao - Dados da contestação
 * @returns {Promise<Object>} Contestação criada
 */
export const criarContestacao = async (contestacao) => {
  const { data } = await api.post('/portal/contestar', contestacao)
  return data
}

/**
 * Upload de arquivo para S3
 * @param {File} file - Arquivo a ser enviado
 * @param {Function} onProgress - Callback de progresso
 * @returns {Promise<Object>} URL do arquivo
 */
export const uploadArquivo = async (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const { data } = await api.post('/portal/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      )
      if (onProgress) {
        onProgress(percentCompleted)
      }
    },
  })
  
  return data
}

/**
 * Envia mensagem para o chat IA
 * @param {string} message - Mensagem do usuário
 * @param {string} sessionId - ID da sessão (opcional)
 * @returns {Promise<Object>} Resposta da IA
 */
export const enviarMensagemChat = async (message, sessionId = null) => {
  const { data } = await api.post('/portal/chat', {
    message,
    sessionId
  })
  return data
}

/**
 * Lista contestações do usuário logado
 * @returns {Promise<Array>} Lista de contestações
 */
export const listarContestacoes = async () => {
  const { data } = await api.get('/portal/contestacoes')
  return data
}

/**
 * Busca detalhes de uma contestação
 * @param {string} id - ID da contestação
 * @returns {Promise<Object>} Detalhes da contestação
 */
export const buscarContestacao = async (id) => {
  const { data } = await api.get(`/portal/contestacoes/${id}`)
  return data
}

// === AUTENTICAÇÃO ===

/**
 * Realiza login
 * @param {Object} credentials - { cpf: string, senha: string }
 * @returns {Promise<Object>} Dados do usuário e token
 */
export const login = async ({ cpf, senha }) => {
  const { data } = await api.post('/portal/auth/login', { cpf, senha })
  
  // Salva token e usuário no localStorage
  if (data.token) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }
  
  return data
}

/**
 * Registra novo usuário
 * @param {Object} userData - Dados do usuário
 * @returns {Promise<Object>} Usuário criado
 */
export const registrar = async (userData) => {
  const { data } = await api.post('/portal/auth/registrar', userData)
  
  // Salva token e usuário no localStorage
  if (data.token) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
  }
  
  return data
}

/**
 * Realiza logout
 */
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

/**
 * Verifica se usuário está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  return !!token
}

/**
 * Retorna usuário logado
 * @returns {Object|null}
 */
export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export default api
