import mongoose from 'mongoose';

// Schema para usuários do Portal do Cidadão
const usuarioSchema = new mongoose.Schema({
  cpf: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  cpfHash: {
    type: String,
    required: true,
    index: true,
  },
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  telefone: String,
  senhaHash: {
    type: String,
    required: true,
  },
  ativo: {
    type: Boolean,
    default: true,
  },
  emailVerificado: {
    type: Boolean,
    default: false,
  },
  ultimoAcesso: Date,
  criadoEm: {
    type: Date,
    default: Date.now,
  },
  atualizadoEm: {
    type: Date,
    default: Date.now,
  },
});

// Middleware para atualizar atualizadoEm
usuarioSchema.pre('save', function(next) {
  this.atualizadoEm = new Date();
  next();
});

// Schema para contestações
const contestacaoSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    index: true,
  },
  infracaoId: {
    type: String,
    required: true,
    index: true,
  },
  // Dados da infração (cópia para histórico)
  autoInfracao: String,
  placa: String,
  dataDaInfracao: Date,
  localDaInfracao: String,
  enquadramento: String,
  valorMulta: Number,
  
  // Dados da contestação
  motivo: {
    type: String,
    enum: [
      'proprietario_diferente',
      'condutor_diferente',
      'local_incorreto',
      'data_incorreta',
      'equipamento_irregular',
      'sinalizacao_inadequada',
      'outros'
    ],
    required: true,
  },
  descricao: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  documentos: [{
    nome: String,
    url: String,
    tipo: String, // pdf, jpg, png
    tamanho: Number,
    uploadEm: Date,
  }],
  
  // Acompanhamento
  status: {
    type: String,
    enum: ['pendente', 'em_analise', 'deferida', 'indeferida', 'cancelada'],
    default: 'pendente',
    index: true,
  },
  protocolo: {
    type: String,
    unique: true,
    index: true,
  },
  respostaAdministrativa: String,
  respondidoEm: Date,
  respondidoPor: String,
  
  // Metadados
  ipOrigem: String,
  userAgent: String,
  criadoEm: {
    type: Date,
    default: Date.now,
    index: true,
  },
  atualizadoEm: {
    type: Date,
    default: Date.now,
  },
});

// Gera protocolo automático antes de salvar
contestacaoSchema.pre('save', function(next) {
  this.atualizadoEm = new Date();
  
  if (!this.protocolo && this.isNew) {
    const ano = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-8);
    this.protocolo = `CONT-${ano}-${timestamp}`;
  }
  
  next();
});

// Schema para sessões de chat IA
const chatSessaoSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    index: true,
  },
  cpfHash: String, // para usuários não logados
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  metadata: {
    ip: String,
    userAgent: String,
    assunto: String,
  },
  ativa: {
    type: Boolean,
    default: true,
  },
  criadoEm: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ultimaMensagemEm: {
    type: Date,
    default: Date.now,
  },
});

// Atualiza timestamp da última mensagem
chatSessaoSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    this.ultimaMensagemEm = this.messages[this.messages.length - 1].timestamp;
  }
  next();
});

// Exporta modelos
export const Usuario = mongoose.model('PortalUsuario', usuarioSchema);
export const Contestacao = mongoose.model('PortalContestacao', contestacaoSchema);
export const ChatSessao = mongoose.model('PortalChatSessao', chatSessaoSchema);
