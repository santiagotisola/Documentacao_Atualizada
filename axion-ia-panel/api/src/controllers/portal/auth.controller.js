import { Usuario, Contestacao, ChatSessao } from '../../models/portal.models.js';
import { 
  hashCPF, 
  hashPassword, 
  verifyPassword, 
  generateToken,
  validarCPF,
  validarEmail 
} from '../../utils/portal.utils.js';

/**
 * Registra novo usuário
 */
export async function registrar(req, res) {
  try {
    const { cpf, nome, email, senha, telefone } = req.body;
    
    // Validações
    if (!cpf || !nome || !email || !senha) {
      return res.status(400).json({ 
        erro: 'Campos obrigatórios: cpf, nome, email, senha' 
      });
    }
    
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (!validarCPF(cpfLimpo)) {
      return res.status(400).json({ erro: 'CPF inválido' });
    }
    
    if (!validarEmail(email)) {
      return res.status(400).json({ erro: 'Email inválido' });
    }
    
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres' });
    }
    
    // Verifica se CPF já existe
    const cpfHashValue = hashCPF(cpfLimpo);
    const usuarioExistente = await Usuario.findOne({ cpfHash: cpfHashValue });
    
    if (usuarioExistente) {
      return res.status(409).json({ erro: 'CPF já cadastrado' });
    }
    
    // Verifica se email já existe
    const emailExistente = await Usuario.findOne({ email: email.toLowerCase() });
    if (emailExistente) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }
    
    // Cria usuário
    const senhaHash = await hashPassword(senha);
    
    const novoUsuario = new Usuario({
      cpf: cpfLimpo, // Armazenado em texto plano (MongoDB criptografado at-rest)
      cpfHash: cpfHashValue,
      nome,
      email: email.toLowerCase(),
      telefone,
      senhaHash,
      ultimoAcesso: new Date(),
    });
    
    await novoUsuario.save();
    
    // Gera token JWT
    const token = generateToken({
      id: novoUsuario._id,
      cpfHash: cpfHashValue,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
    });
    
    res.status(201).json({
      mensagem: 'Usuário registrado com sucesso',
      token,
      user: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        telefone: novoUsuario.telefone,
        criadoEm: novoUsuario.criadoEm,
      },
    });
    
  } catch (erro) {
    console.error('Erro ao registrar usuário:', erro);
    res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
}

/**
 * Realiza login
 */
export async function login(req, res) {
  try {
    const { cpf, senha } = req.body;
    
    if (!cpf || !senha) {
      return res.status(400).json({ erro: 'CPF e senha são obrigatórios' });
    }
    
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    if (!validarCPF(cpfLimpo)) {
      return res.status(400).json({ erro: 'CPF inválido' });
    }
    
    // Busca usuário por CPF hash
    const cpfHashValue = hashCPF(cpfLimpo);
    const usuario = await Usuario.findOne({ cpfHash: cpfHashValue });
    
    if (!usuario) {
      return res.status(401).json({ erro: 'CPF ou senha incorretos' });
    }
    
    if (!usuario.ativo) {
      return res.status(403).json({ erro: 'Usuário inativo' });
    }
    
    // Verifica senha
    const senhaValida = await verifyPassword(senha, usuario.senhaHash);
    
    if (!senhaValida) {
      return res.status(401).json({ erro: 'CPF ou senha incorretos' });
    }
    
    // Atualiza último acesso
    usuario.ultimoAcesso = new Date();
    await usuario.save();
    
    // Gera token JWT
    const token = generateToken({
      id: usuario._id,
      cpfHash: cpfHashValue,
      nome: usuario.nome,
      email: usuario.email,
    });
    
    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      user: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        emailVerificado: usuario.emailVerificado,
        criadoEm: usuario.criadoEm,
      },
    });
    
  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
}

/**
 * Retorna dados do usuário logado
 */
export async function perfil(req, res) {
  try {
    const usuarioId = req.user.id; // Vem do middleware de autenticação
    
    const usuario = await Usuario.findById(usuarioId).select('-senhaHash -cpf -cpfHash');
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    res.json({
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      emailVerificado: usuario.emailVerificado,
      ultimoAcesso: usuario.ultimoAcesso,
      criadoEm: usuario.criadoEm,
    });
    
  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro);
    res.status(500).json({ erro: 'Erro ao buscar perfil' });
  }
}

/**
 * Atualiza dados do usuário
 */
export async function atualizarPerfil(req, res) {
  try {
    const usuarioId = req.user.id;
    const { nome, email, telefone } = req.body;
    
    const usuario = await Usuario.findById(usuarioId);
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    // Atualiza campos permitidos
    if (nome) usuario.nome = nome;
    if (telefone) usuario.telefone = telefone;
    
    if (email && email !== usuario.email) {
      if (!validarEmail(email)) {
        return res.status(400).json({ erro: 'Email inválido' });
      }
      
      // Verifica se email já existe
      const emailExistente = await Usuario.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: usuarioId }
      });
      
      if (emailExistente) {
        return res.status(409).json({ erro: 'Email já cadastrado' });
      }
      
      usuario.email = email.toLowerCase();
      usuario.emailVerificado = false; // Requer nova verificação
    }
    
    await usuario.save();
    
    res.json({
      mensagem: 'Perfil atualizado com sucesso',
      user: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        emailVerificado: usuario.emailVerificado,
      },
    });
    
  } catch (erro) {
    console.error('Erro ao atualizar perfil:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
}

/**
 * Altera senha do usuário
 */
export async function alterarSenha(req, res) {
  try {
    const usuarioId = req.user.id;
    const { senhaAtual, novaSenha } = req.body;
    
    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias' });
    }
    
    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: 'Nova senha deve ter no mínimo 6 caracteres' });
    }
    
    const usuario = await Usuario.findById(usuarioId);
    
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    // Verifica senha atual
    const senhaValida = await verifyPassword(senhaAtual, usuario.senhaHash);
    
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha atual incorreta' });
    }
    
    // Atualiza senha
    usuario.senhaHash = await hashPassword(novaSenha);
    await usuario.save();
    
    res.json({ mensagem: 'Senha alterada com sucesso' });
    
  } catch (erro) {
    console.error('Erro ao alterar senha:', erro);
    res.status(500).json({ erro: 'Erro ao alterar senha' });
  }
}
