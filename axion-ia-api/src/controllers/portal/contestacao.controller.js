import { Contestacao } from '../../models/portal.models.js';
import { gerarProtocolo } from '../../utils/portal.utils.js';

/**
 * Cria nova contestação
 * Requer autenticação JWT
 */
export async function criarContestacao(req, res) {
  try {
    const usuarioId = req.user.id; // Vem do middleware de autenticação
    
    const {
      infracaoId,
      autoInfracao,
      placa,
      dataDaInfracao,
      localDaInfracao,
      enquadramento,
      valorMulta,
      motivo,
      descricao,
      documentos,
    } = req.body;
    
    // Validações
    if (!infracaoId || !motivo || !descricao) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios: infracaoId, motivo, descricao' 
      });
    }
    
    const motivosValidos = [
      'proprietario_diferente',
      'condutor_diferente',
      'local_incorreto',
      'data_incorreta',
      'equipamento_irregular',
      'sinalizacao_inadequada',
      'outros'
    ];
    
    if (!motivosValidos.includes(motivo)) {
      return res.status(400).json({ erro: 'Motivo inválido' });
    }
    
    if (descricao.length < 20 || descricao.length > 2000) {
      return res.status(400).json({ 
        erro: 'Descrição deve ter entre 20 e 2000 caracteres' 
      });
    }
    
    // Verifica se já existe contestação para esta infração
    const contestacaoExistente = await Contestacao.findOne({
      usuarioId,
      infracaoId,
      status: { $in: ['pendente', 'em_analise'] }
    });
    
    if (contestacaoExistente) {
      return res.status(409).json({ 
        erro: 'Já existe uma contestação pendente para esta infração',
        protocolo: contestacaoExistente.protocolo
      });
    }
    
    // Cria contestação
    const novaContestacao = new Contestacao({
      usuarioId,
      infracaoId,
      autoInfracao,
      placa,
      dataDaInfracao,
      localDaInfracao,
      enquadramento,
      valorMulta,
      motivo,
      descricao,
      documentos: documentos || [],
      ipOrigem: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
    
    await novaContestacao.save();
    
    // TODO: Enviar email de confirmação
    // TODO: Criar notificação WhatsApp
    
    res.status(201).json({
      mensagem: 'Contestação criada com sucesso',
      contestacao: {
        id: novaContestacao._id,
        protocolo: novaContestacao.protocolo,
        infracaoId: novaContestacao.infracaoId,
        motivo: novaContestacao.motivo,
        status: novaContestacao.status,
        criadoEm: novaContestacao.criadoEm,
      },
    });
    
  } catch (erro) {
    console.error('Erro ao criar contestação:', erro);
    res.status(500).json({ erro: 'Erro ao criar contestação' });
  }
}

/**
 * Lista contestações do usuário logado
 */
export async function listarContestacoes(req, res) {
  try {
    const usuarioId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = { usuarioId };
    
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [contestacoes, total] = await Promise.all([
      Contestacao.find(query)
        .sort({ criadoEm: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-ipOrigem -userAgent'),
      Contestacao.countDocuments(query)
    ]);
    
    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      contestacoes: contestacoes.map(c => ({
        id: c._id,
        protocolo: c.protocolo,
        infracaoId: c.infracaoId,
        autoInfracao: c.autoInfracao,
        placa: c.placa,
        dataDaInfracao: c.dataDaInfracao,
        localDaInfracao: c.localDaInfracao,
        motivo: c.motivo,
        status: c.status,
        criadoEm: c.criadoEm,
        atualizadoEm: c.atualizadoEm,
      })),
    });
    
  } catch (erro) {
    console.error('Erro ao listar contestações:', erro);
    res.status(500).json({ erro: 'Erro ao listar contestações' });
  }
}

/**
 * Busca detalhes de uma contestação específica
 */
export async function buscarContestacao(req, res) {
  try {
    const usuarioId = req.user.id;
    const { id } = req.params;
    
    const contestacao = await Contestacao.findOne({
      _id: id,
      usuarioId
    }).select('-ipOrigem -userAgent');
    
    if (!contestacao) {
      return res.status(404).json({ erro: 'Contestação não encontrada' });
    }
    
    res.json({
      id: contestacao._id,
      protocolo: contestacao.protocolo,
      infracaoId: contestacao.infracaoId,
      autoInfracao: contestacao.autoInfracao,
      placa: contestacao.placa,
      dataDaInfracao: contestacao.dataDaInfracao,
      localDaInfracao: contestacao.localDaInfracao,
      enquadramento: contestacao.enquadramento,
      valorMulta: contestacao.valorMulta,
      motivo: contestacao.motivo,
      descricao: contestacao.descricao,
      documentos: contestacao.documentos,
      status: contestacao.status,
      respostaAdministrativa: contestacao.respostaAdministrativa,
      respondidoEm: contestacao.respondidoEm,
      respondidoPor: contestacao.respondidoPor,
      criadoEm: contestacao.criadoEm,
      atualizadoEm: contestacao.atualizadoEm,
    });
    
  } catch (erro) {
    console.error('Erro ao buscar contestação:', erro);
    res.status(500).json({ erro: 'Erro ao buscar contestação' });
  }
}

/**
 * Cancela contestação (antes de análise)
 */
export async function cancelarContestacao(req, res) {
  try {
    const usuarioId = req.user.id;
    const { id } = req.params;
    
    const contestacao = await Contestacao.findOne({
      _id: id,
      usuarioId
    });
    
    if (!contestacao) {
      return res.status(404).json({ erro: 'Contestação não encontrada' });
    }
    
    if (contestacao.status !== 'pendente') {
      return res.status(400).json({ 
        erro: 'Apenas contestações pendentes podem ser canceladas' 
      });
    }
    
    contestacao.status = 'cancelada';
    await contestacao.save();
    
    res.json({
      mensagem: 'Contestação cancelada com sucesso',
      protocolo: contestacao.protocolo,
    });
    
  } catch (erro) {
    console.error('Erro ao cancelar contestação:', erro);
    res.status(500).json({ erro: 'Erro ao cancelar contestação' });
  }
}

/**
 * Adiciona documento a uma contestação
 */
export async function adicionarDocumento(req, res) {
  try {
    const usuarioId = req.user.id;
    const { id } = req.params;
    const { nome, url, tipo, tamanho } = req.body;
    
    if (!nome || !url || !tipo) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios: nome, url, tipo' 
      });
    }
    
    const contestacao = await Contestacao.findOne({
      _id: id,
      usuarioId
    });
    
    if (!contestacao) {
      return res.status(404).json({ erro: 'Contestação não encontrada' });
    }
    
    if (!['pendente', 'em_analise'].includes(contestacao.status)) {
      return res.status(400).json({ 
        erro: 'Não é possível adicionar documentos a esta contestação' 
      });
    }
    
    // Limita a 10 documentos por contestação
    if (contestacao.documentos.length >= 10) {
      return res.status(400).json({ 
        erro: 'Limite de 10 documentos por contestação atingido' 
      });
    }
    
    contestacao.documentos.push({
      nome,
      url,
      tipo,
      tamanho,
      uploadEm: new Date(),
    });
    
    await contestacao.save();
    
    res.json({
      mensagem: 'Documento adicionado com sucesso',
      totalDocumentos: contestacao.documentos.length,
    });
    
  } catch (erro) {
    console.error('Erro ao adicionar documento:', erro);
    res.status(500).json({ erro: 'Erro ao adicionar documento' });
  }
}
