/**
 * =====================================================
 * CONTROLLER: DIAGNÓSTICO DE MEDIÇÃO AXHUB
 * =====================================================
 * API endpoints para análise inteligente de equipamentos
 * com valores zerados no relatório de medição.
 * 
 * Funcionalidades:
 * - Listar equipamentos por sistema
 * - Diagnóstico completo de equipamento
 * - Análise de recursos cadastrados
 * - Geração de script de correção
 */

// Logger simples
const logger = {
  info: (msg, ...args) => console.log('[MEDICAO]', msg, ...args),
  error: (msg, ...args) => console.error('[MEDICAO]', msg, ...args)
};

/**
 * GET /api/medicao/sistemas
 * Lista todos os sistemas organizados por produto (AxHub, AxCross, AxTon)
 */
export async function listarSistemas(req, res) {
  try {
    // ===== AXHUB =====
    const axhubSistemas = [
      { id: 'derse', nome: 'DERSE', url: 'https://derse.axhub.axion.ws', estado: 'RS', produto: 'AxHub' },
      { id: 'detranma', nome: 'Detran/MA', url: 'https://detranma.axhub.axion.ws', estado: 'MA', produto: 'AxHub' },
      { id: 'detranpi', nome: 'Detran/PI', url: 'https://detranpi.axhub.axion.ws', estado: 'PI', produto: 'AxHub' },
      { id: 'goiania-axhub', nome: 'Goiânia', url: 'https://goiania.axhub.axion.ws', estado: 'GO', produto: 'AxHub' },
      { id: 'homologacao-axhub', nome: 'Homologação AxHub', url: 'https://homologacao.axhub.axion.ws', estado: '', produto: 'AxHub' },
      { id: 'ibametro', nome: 'IBAMETRO', url: 'https://ibametro.axhub.axion.ws', estado: 'PA', produto: 'AxHub' },
      { id: 'imepi', nome: 'IMEPI', url: 'https://imepi.axhub.axion.ws', estado: 'PI', produto: 'AxHub' },
      { id: 'imeqpb', nome: 'IMEQPB', url: 'https://imeqpb.axhub.axion.ws', estado: 'PB', produto: 'AxHub' },
      { id: 'imetropa', nome: 'IMETROPA', url: 'https://imetropa.axhub.axion.ws', estado: 'PA', produto: 'AxHub' },
      { id: 'imperatriz', nome: 'Imperatriz', url: 'https://imperatriz.axhub.axion.ws', estado: 'MA', produto: 'AxHub' },
      { id: 'ipemce', nome: 'IPEM/CE', url: 'https://ipemce.axhub.axion.ws', estado: 'CE', produto: 'AxHub' },
      { id: 'ipempe', nome: 'IPEMPE', url: 'https://ipempe.axhub.axion.ws', estado: 'PE', produto: 'AxHub' },
      { id: 'itps', nome: 'ITPS', url: 'https://itps.axhub.axion.ws', estado: 'SE', produto: 'AxHub' },
      { id: 'setrans', nome: 'SETRANS', url: 'https://setrans.axhub.axion.ws', estado: 'GO', produto: 'AxHub' },
      { id: 'strans', nome: 'STRANS', url: 'https://strans.axhub.axion.ws', estado: 'MA', produto: 'AxHub' },
    ];

    // ===== AXCROSS =====
    const axcrossSistemas = [
      { id: 'derse-axcross', nome: 'DERSE', url: 'https://derse.axcross.axion.ws', estado: 'RS', produto: 'AxCross' },
      { id: 'detranma-axcross', nome: 'Detran/MA', url: 'https://detranma.axcross.axion.ws', estado: 'MA', produto: 'AxCross' },
      { id: 'detranpi-axcross', nome: 'Detran/PI', url: 'https://detranpi.axcross.axion.ws', estado: 'PI', produto: 'AxCross' },
      { id: 'homologacao-axcross', nome: 'Homologação AxCross', url: 'https://homologacao.axcross.axion.ws', estado: '', produto: 'AxCross' },
      { id: 'imperatriz-axcross', nome: 'Imperatriz', url: 'https://imperatriz.axcross.axion.ws', estado: 'MA', produto: 'AxCross' },
      { id: 'ipemce-axcross', nome: 'IPEM/CE', url: 'https://ipemce.axcross.axion.ws', estado: 'CE', produto: 'AxCross' },
      { id: 'ipemmt-axcross', nome: 'IPEM/MT', url: 'https://ipemmt.axcross.axion.ws', estado: 'MT', produto: 'AxCross' },
      { id: 'ipempe-axcross', nome: 'IPEMPE', url: 'https://ipempe.axcross.axion.ws', estado: 'PE', produto: 'AxCross' },
      { id: 'sefazpi-axcross', nome: 'SEFAZ/PI', url: 'https://sefazpi.axcross.axion.ws', estado: 'PI', produto: 'AxCross' },
    ];

    // ===== AXTON =====
    const axtonSistemas = [
      { id: 'economia', nome: 'Economia', url: 'https://economia.axion.ws', estado: 'GO', produto: 'AxTon' },
      { id: 'goiania-axton', nome: 'Goiânia AxTon', url: 'https://goiania.axion.ws', estado: 'GO', produto: 'AxTon' },
    ];

    // ===== IDENTIDADE =====
    const identitySistemas = [
      { id: 'identity', nome: 'Identity Server', url: 'https://identity.axion.ws', estado: '', produto: 'Identity' },
    ];

    // Combinar todos os sistemas
    const todosSistemas = [
      ...axhubSistemas,
      ...axcrossSistemas,
      ...axtonSistemas,
      ...identitySistemas,
    ];
    
    res.json(todosSistemas);
  } catch (err) {
    logger.error('Erro ao listar sistemas:', err);
    res.status(500).json({ erro: 'Erro ao listar sistemas' });
  }
}

/**
 * GET /api/medicao/equipamentos?sistema=goiania
 * Lista equipamentos de um sistema específico
 * 
 * TODO: Implementar integração real com banco SQL Server de cada sistema
 * Atualmente retorna dados simulados para prototipação
 */
export async function listarEquipamentos(req, res) {
  try {
    const { sistema } = req.query;
    
    if (!sistema) {
      return res.status(400).json({ erro: 'Parâmetro "sistema" é obrigatório' });
    }
    
    // Simulação - em produção, conectar no SQL Server do sistema
    const equipamentosSimulados = {
      goiania: [
        { codigo: 'GYN1R801', descricao: 'Radar Av. T-9', grupo: 'Radares Fixos', ativo: true },
        { codigo: 'GYN1R803', descricao: 'Radar Av. T-7', grupo: 'Radares Fixos', ativo: true },
        { codigo: 'GYN1R804', descricao: 'Radar Av. T-4', grupo: 'Radares Fixos', ativo: true },
        { codigo: 'GYN1R805', descricao: 'Radar Av. Goiás', grupo: 'Radares Fixos', ativo: true },
        { codigo: 'GYN1R901', descricao: 'Lombada Setor Sul', grupo: 'Lombadas', ativo: true },
        { codigo: 'GYN1R902', descricao: 'Lombada Setor Central', grupo: 'Lombadas', ativo: true },
      ],
      ipempe: [
        { codigo: 'ITZ022R', descricao: 'Itamaracá BR 101 Direção Recife', grupo: 'Radares Fixos', ativo: true },
        { codigo: 'ITZ023L', descricao: 'Itamaracá BR 101 Direção Salvador', grupo: 'Radares Fixos', ativo: true },
        { codigo: 'ITZ024R', descricao: 'Itamaracá BR 101 Saída Norte', grupo: 'Radares Fixos', ativo: true },
      ],
      detranpi: [
        { codigo: 'THE1R001', descricao: 'Teresina Av. Frei Serafim', grupo: 'Radares Fixos', ativo: true },
        { codigo: 'THE1R002', descricao: 'Teresina Av. Jockey Club', grupo: 'Radares Fixos', ativo: true },
      ],
    };
    
    const equipamentos = equipamentosSimulados[sistema] || [];
    
    res.json({
      sistema,
      total: equipamentos.length,
      equipamentos
    });
    
  } catch (err) {
    logger.error('Erro ao listar equipamentos:', err);
    res.status(500).json({ erro: 'Erro ao listar equipamentos' });
  }
}

/**
 * GET /api/medicao/diagnostico?sistema=goiania&equipamento=GYN1R801
 * Gera diagnóstico completo de um equipamento
 * 
 * Analisa:
 * 1. Existência do equipamento (TBEquipamentos)
 * 2. Status ativo
 * 3. Faixas cadastradas (TBFaixas)
 * 4. Contrato vinculado (TBContratosEquipamentos)
 * 5. Recursos cadastrados (TBRecursos) ⚠️ CRÍTICO
 * 
 * TODO: Implementar queries SQL reais no banco de cada sistema
 */
export async function gerarDiagnostico(req, res) {
  try {
    const { sistema, equipamento } = req.query;
    
    if (!sistema || !equipamento) {
      return res.status(400).json({ 
        erro: 'Parâmetros "sistema" e "equipamento" são obrigatórios' 
      });
    }
    
    // Simulação de diagnóstico
    // TODO: Substituir por queries SQL reais
    
    // Lista de equipamentos com problemas conhecidos
    const equipamentosComProblema = ['GYN1R801', 'ITZ024R'];
    const temProblema = equipamentosComProblema.includes(equipamento);
    
    const diagnostico = {
      sistema,
      equipamento,
      timestamp: new Date().toISOString(),
      status: temProblema ? 'erro' : 'ok',
      problema: temProblema ? 'Recursos não cadastrados' : null,
      
      // Análise quantitativa
      faixas: 2,
      recursos: temProblema ? 0 : 2,
      faltando: temProblema ? 2 : 0,
      
      // Análise detalhada
      detalhes: {
        equipamentoExiste: true,
        equipamentoAtivo: true,
        faixasCadastradas: true,
        contratoVinculado: true,
        recursosCadastrados: !temProblema,
      },
      
      // Dados do equipamento
      dadosEquipamento: {
        id: 123,
        codigo: equipamento,
        descricao: 'Radar Exemplo',
        status: 1, // Ativo
        grupoId: 1
      },
      
      // Faixas encontradas
      faixas_lista: [
        { id: 1, nome: 'Faixa 1', numero: 1, ativa: true },
        { id: 2, nome: 'Faixa 2', numero: 2, ativa: true },
      ],
      
      // Recursos encontrados (vazio se tem problema)
      recursos_lista: temProblema ? [] : [
        { 
          id: 10, 
          faixaId: 1, 
          contratoId: 5, 
          valorPrevisto: 15000.00, 
          bdi: 25.00, 
          status: 1,
          dataInicio: '2026-01-01',
          dataFim: '2026-12-31'
        },
        { 
          id: 11, 
          faixaId: 2, 
          contratoId: 5, 
          valorPrevisto: 15000.00, 
          bdi: 25.00, 
          status: 1,
          dataInicio: '2026-01-01',
          dataFim: '2026-12-31'
        },
      ],
      
      // Script de correção (se houver problema)
      script: temProblema ? gerarScriptCorrecao(equipamento) : null,
      
      // Sugestão de solução
      solucao: temProblema ? {
        tipo: 'cadastrar_recursos',
        caminho: 'Medição → Recursos → Novo Recurso',
        passos: [
          'Acessar módulo Medição no sistema',
          'Clicar em Recursos',
          'Clicar em Novo Recurso',
          'Selecionar o equipamento',
          'Selecionar a Faixa 1',
          'Selecionar o contrato',
          'Preencher Valor Previsto (ex: R$ 15.000,00)',
          'Preencher BDI (ex: 25%)',
          'Informar datas de início e fim',
          'Marcar Status como Ativo',
          'Salvar',
          'REPETIR para Faixa 2'
        ]
      } : null
    };
    
    logger.info(`Diagnóstico gerado: ${sistema} - ${equipamento} - Status: ${diagnostico.status}`);
    
    res.json(diagnostico);
    
  } catch (err) {
    logger.error('Erro ao gerar diagnóstico:', err);
    res.status(500).json({ erro: 'Erro ao gerar diagnóstico: ' + err.message });
  }
}

/**
 * Gera script SQL para correção automática
 */
function gerarScriptCorrecao(equipamento) {
  return `-- =====================================================
-- SCRIPT DE CORREÇÃO AUTOMÁTICA
-- Equipamento: ${equipamento}
-- Gerado em: ${new Date().toISOString()}
-- =====================================================

-- Variáveis de configuração
DECLARE @CodigoEquipamento VARCHAR(50) = '${equipamento}';
DECLARE @ContratoId INT = 1; -- AJUSTAR: ID do contrato correto
DECLARE @ValorPrevisto DECIMAL(18,2) = 15000.00; -- AJUSTAR
DECLARE @BDI DECIMAL(5,2) = 25.00; -- AJUSTAR
DECLARE @DataInicio DATE = '2026-01-01'; -- AJUSTAR
DECLARE @DataFim DATE = '2026-12-31'; -- AJUSTAR

-- Buscar ID do equipamento
DECLARE @EquipamentoId INT;
SELECT @EquipamentoId = Id 
FROM TBEquipamentos 
WHERE CodigoEquipamento = @CodigoEquipamento;

-- Buscar IDs das faixas
DECLARE @Faixa1Id INT, @Faixa2Id INT;
SELECT TOP 1 @Faixa1Id = Id FROM TBFaixas WHERE EquipamentoId = @EquipamentoId ORDER BY Numero;
SELECT TOP 1 @Faixa2Id = Id FROM TBFaixas WHERE EquipamentoId = @EquipamentoId AND Id <> @Faixa1Id ORDER BY Numero;

-- Inserir recurso para Faixa 1
INSERT INTO TBRecursos (
    EquipamentoId, FaixaId, ContratoId,
    Descricao, ValorPrevisto, Bdi,
    DataInicio, DataFim, Status
) VALUES (
    @EquipamentoId, @Faixa1Id, @ContratoId,
    'Recurso Medição ' + @CodigoEquipamento + ' - Faixa 1',
    @ValorPrevisto, @BDI,
    @DataInicio, @DataFim, 1
);

-- Inserir recurso para Faixa 2
INSERT INTO TBRecursos (
    EquipamentoId, FaixaId, ContratoId,
    Descricao, ValorPrevisto, Bdi,
    DataInicio, DataFim, Status
) VALUES (
    @EquipamentoId, @Faixa2Id, @ContratoId,
    'Recurso Medição ' + @CodigoEquipamento + ' - Faixa 2',
    @ValorPrevisto, @BDI,
    @DataInicio, @DataFim, 1
);

-- Validar
SELECT 
    E.CodigoEquipamento,
    F.Numero AS Faixa,
    R.Descricao,
    R.ValorPrevisto,
    R.Bdi,
    R.Status
FROM TBRecursos R
INNER JOIN TBEquipamentos E ON R.EquipamentoId = E.Id
INNER JOIN TBFaixas F ON R.FaixaId = F.Id
WHERE E.CodigoEquipamento = @CodigoEquipamento;
`;
}

/**
 * GET /api/medicao/analise-sistema?sistema=goiania
 * Analisa TODOS os equipamentos de um sistema
 * Retorna lista de equipamentos com problemas
 */
export async function analisarSistema(req, res) {
  try {
    const { sistema } = req.query;
    
    if (!sistema) {
      return res.status(400).json({ erro: 'Parâmetro "sistema" é obrigatório' });
    }
    
    // TODO: Implementar análise em lote
    // Query SQL que retorna equipamentos com faixas mas sem recursos
    
    const resultado = {
      sistema,
      timestamp: new Date().toISOString(),
      totalEquipamentos: 6,
      equipamentosComProblema: 1,
      problemas: [
        {
          equipamento: 'GYN1R801',
          descricao: 'Radar Av. T-9',
          problema: 'Recursos não cadastrados',
          faixas: 2,
          recursos: 0,
          faltando: 2
        }
      ]
    };
    
    res.json(resultado);
    
  } catch (err) {
    logger.error('Erro ao analisar sistema:', err);
    res.status(500).json({ erro: 'Erro ao analisar sistema' });
  }
}
