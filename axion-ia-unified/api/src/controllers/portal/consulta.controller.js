import { conectar as conectarAxHub } from '../../services/axhub-db.js';
import { hashCPF, validarCPF, validarPlaca, sanitizeSQLString } from '../../utils/portal.utils.js';
import { verifyRecaptcha, isValidScore, getThreshold } from '../../utils/recaptcha.js';

/**
 * Consulta infrações por CPF ou Placa
 * Rate limit: 10 consultas por minuto (middleware separado)
 */
export async function consultarInfracoes(req, res) {
  try {
    const { tipo, valor, recaptchaToken } = req.body;
    
    // Validações básicas
    if (!tipo || !valor) {
      return res.status(400).json({ erro: 'Tipo e valor são obrigatórios' });
    }
    
    if (!['cpf', 'placa'].includes(tipo)) {
      return res.status(400).json({ erro: 'Tipo inválido. Use "cpf" ou "placa"' });
    }
    
    // Verificação reCAPTCHA v3
    if (!recaptchaToken) {
      return res.status(400).json({ erro: 'Token reCAPTCHA obrigatório' });
    }
    
    // Verificar token com Google API
    const remoteIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, remoteIp);
    
    if (!recaptchaResult.success) {
      console.warn('reCAPTCHA verification failed:', recaptchaResult['error-codes']);
      return res.status(400).json({ 
        erro: 'Validação reCAPTCHA falhou. Tente novamente.',
        errorCodes: recaptchaResult['error-codes']
      });
    }
    
    // Validar score (threshold configurável via ENV)
    const threshold = getThreshold();
    if (!isValidScore(recaptchaResult.score, threshold)) {
      console.warn(`reCAPTCHA score too low: ${recaptchaResult.score} (threshold: ${threshold})`);
      return res.status(403).json({ 
        erro: 'Comportamento suspeito detectado. Tente novamente mais tarde.',
        score: recaptchaResult.score
      });
    }
    
    // Log para análise (remover ou enviar para analytics em produção)
    console.log(`✅ reCAPTCHA: score=${recaptchaResult.score}, action=${recaptchaResult.action}, hostname=${recaptchaResult.hostname}`);
    
    let valorLimpo = valor.replace(/\D/g, '');
    
    if (tipo === 'cpf') {
      // Valida CPF
      if (!validarCPF(valorLimpo)) {
        return res.status(400).json({ erro: 'CPF inválido' });
      }
    } else if (tipo === 'placa') {
      // Valida placa
      valorLimpo = valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      if (!validarPlaca(valorLimpo)) {
        return res.status(400).json({ erro: 'Placa inválida' });
      }
    }
    
    // Sanitiza para prevenir SQL Injection
    const valorSanitizado = sanitizeSQLString(valorLimpo);
    
    // Consulta no banco de dados AxHub
    const pool = await conectarAxHub();
    
    let query, params;
    
    if (tipo === 'cpf') {
      // Consulta por CPF (proprietário ou condutor)
      query = `
        SELECT TOP 100
          i.AutoInfracao,
          i.Placa,
          i.DataDaInfracao,
          i.HoraDaInfracao,
          i.LocalDaInfracao,
          e.Enquadramento,
          e.Descricao AS EnquadramentoDescricao,
          i.ValorMulta,
          i.StatusMulta,
          eq.Equipamento,
          eq.Descricao AS EquipamentoDescricao,
          l.Localizacao,
          l.Endereco,
          l.Bairro,
          l.Cidade,
          i.Velocidade,
          i.VelocidadePermitida,
          i.FaixaTransito
        FROM Infracoes i WITH (NOLOCK)
        LEFT JOIN Enquadramentos e WITH (NOLOCK) ON i.Enquadramento = e.Enquadramento
        LEFT JOIN Equipamentos eq WITH (NOLOCK) ON i.Equipamento = eq.Equipamento
        LEFT JOIN Locais l WITH (NOLOCK) ON i.Local = l.Local
        WHERE (i.CPFProprietario = @valor OR i.CPFCondutor = @valor)
          AND i.DataDaInfracao >= DATEADD(YEAR, -5, GETDATE())
        ORDER BY i.DataDaInfracao DESC
      `;
      params = [{ name: 'valor', value: valorSanitizado }];
    } else {
      // Consulta por placa
      query = `
        SELECT TOP 100
          i.AutoInfracao,
          i.Placa,
          i.DataDaInfracao,
          i.HoraDaInfracao,
          i.LocalDaInfracao,
          e.Enquadramento,
          e.Descricao AS EnquadramentoDescricao,
          i.ValorMulta,
          i.StatusMulta,
          eq.Equipamento,
          eq.Descricao AS EquipamentoDescricao,
          l.Localizacao,
          l.Endereco,
          l.Bairro,
          l.Cidade,
          i.Velocidade,
          i.VelocidadePermitida,
          i.FaixaTransito
        FROM Infracoes i WITH (NOLOCK)
        LEFT JOIN Enquadramentos e WITH (NOLOCK) ON i.Enquadramento = e.Enquadramento
        LEFT JOIN Equipamentos eq WITH (NOLOCK) ON i.Equipamento = eq.Equipamento
        LEFT JOIN Locais l WITH (NOLOCK) ON i.Local = l.Local
        WHERE i.Placa = @valor
          AND i.DataDaInfracao >= DATEADD(YEAR, -5, GETDATE())
        ORDER BY i.DataDaInfracao DESC
      `;
      params = [{ name: 'valor', value: valorSanitizado }];
    }
    
    const request = pool.request();
    params.forEach(param => {
      request.input(param.name, param.value);
    });
    
    const result = await request.query(query);
    
    // Formata resultado
    const infracoes = result.recordset.map(row => ({
      id: row.AutoInfracao,
      autoInfracao: row.AutoInfracao,
      placa: row.Placa,
      data: row.DataDaInfracao,
      hora: row.HoraDaInfracao,
      local: {
        descricao: row.LocalDaInfracao,
        localizacao: row.Localizacao,
        endereco: row.Endereco,
        bairro: row.Bairro,
        cidade: row.Cidade,
      },
      enquadramento: {
        codigo: row.Enquadramento,
        descricao: row.EnquadramentoDescricao,
      },
      equipamento: {
        codigo: row.Equipamento,
        descricao: row.EquipamentoDescricao,
      },
      valores: {
        multa: parseFloat(row.ValorMulta) || 0,
      },
      velocidade: {
        medida: row.Velocidade,
        permitida: row.VelocidadePermitida,
      },
      faixa: row.FaixaTransito,
      status: row.StatusMulta,
    }));
    
    res.json({
      tipo,
      valor: valorLimpo,
      total: infracoes.length,
      infracoes,
      consultadoEm: new Date(),
    });
    
  } catch (erro) {
    console.error('Erro ao consultar infrações:', erro);
    res.status(500).json({ erro: 'Erro ao consultar infrações' });
  }
}

/**
 * Busca detalhes de uma infração específica
 */
export async function buscarInfracao(req, res) {
  try {
    const { autoInfracao } = req.params;
    
    if (!autoInfracao) {
      return res.status(400).json({ erro: 'Auto de infração obrigatório' });
    }
    
    const pool = await conectarAxHub();
    
    const query = `
      SELECT TOP 1
        i.*,
        e.Descricao AS EnquadramentoDescricao,
        eq.Descricao AS EquipamentoDescricao,
        l.Endereco,
        l.Bairro,
        l.Cidade,
        l.Latitude,
        l.Longitude
      FROM Infracoes i WITH (NOLOCK)
      LEFT JOIN Enquadramentos e WITH (NOLOCK) ON i.Enquadramento = e.Enquadramento
      LEFT JOIN Equipamentos eq WITH (NOLOCK) ON i.Equipamento = eq.Equipamento
      LEFT JOIN Locais l WITH (NOLOCK) ON i.Local = l.Local
      WHERE i.AutoInfracao = @autoInfracao
    `;
    
    const result = await pool.request()
      .input('autoInfracao', sanitizeSQLString(autoInfracao))
      .query(query);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ erro: 'Infração não encontrada' });
    }
    
    const infracao = result.recordset[0];
    
    res.json({
      id: infracao.AutoInfracao,
      autoInfracao: infracao.AutoInfracao,
      placa: infracao.Placa,
      data: infracao.DataDaInfracao,
      hora: infracao.HoraDaInfracao,
      local: {
        descricao: infracao.LocalDaInfracao,
        endereco: infracao.Endereco,
        bairro: infracao.Bairro,
        cidade: infracao.Cidade,
        latitude: infracao.Latitude,
        longitude: infracao.Longitude,
      },
      enquadramento: {
        codigo: infracao.Enquadramento,
        descricao: infracao.EnquadramentoDescricao,
      },
      equipamento: {
        codigo: infracao.Equipamento,
        descricao: infracao.EquipamentoDescricao,
      },
      valores: {
        multa: parseFloat(infracao.ValorMulta) || 0,
      },
      velocidade: {
        medida: infracao.Velocidade,
        permitida: infracao.VelocidadePermitida,
      },
      faixa: infracao.FaixaTransito,
      status: infracao.StatusMulta,
      // Dados adicionais se disponíveis
      cpfProprietario: infracao.CPFProprietario ? '***.' + infracao.CPFProprietario.slice(-6, -3) + '.' + infracao.CPFProprietario.slice(-3) + '-**' : null,
      renavam: infracao.Renavam,
      marca: infracao.Marca,
      modelo: infracao.Modelo,
      cor: infracao.Cor,
    });
    
  } catch (erro) {
    console.error('Erro ao buscar infração:', erro);
    res.status(500).json({ erro: 'Erro ao buscar infração' });
  }
}
