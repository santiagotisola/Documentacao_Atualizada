/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PROPOSTA DE CORREÇÃO — VALIDAÇÃO DE DUPLICIDADE NA IMPORTAÇÃO
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Este script implementa a lógica que DEVERIA existir no AxHub para prevenir
 * infrações duplicadas. Pode ser adaptado para:
 *   1. Stored Procedure no SQL Server
 *   2. Trigger INSTEAD OF INSERT
 *   3. Middleware na API de integração
 *   4. Endpoint de validação no AxionIA
 * 
 * Referência: Ticket #100423690 (SMTT - Karla Ramira)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── CONFIGURAÇÃO DE DEDUPLICAÇÃO ────────────────────────────────────────────
export const DEDUP_CONFIG = {
  // Janela temporal em segundos — se mesma placa/equip/faixa dentro desta janela, é duplicidade
  tolerancia_temporal_seg: 60,
  
  // Campos obrigatórios para considerar duplicidade (todos devem coincidir)
  campos_chave: ["placa", "equipamento", "faixa"],
  
  // Campos opcionais de reforço (se coincidirem, aumenta confiança)
  campos_reforco: ["velocidade_medida", "enquadramento"],
  
  // Ação ao detectar duplicidade
  acao_duplicidade: "BLOQUEAR_E_LOGAR", // BLOQUEAR_E_LOGAR | PERMITIR_E_ALERTAR | SOMENTE_LOGAR
  
  // Notificar operador
  notificar: true,
  canal_notificacao: "sistema" // sistema | email | telegram
};

// ─── SQL: STORED PROCEDURE PARA VALIDAÇÃO ────────────────────────────────────
export const SQL_STORED_PROCEDURE = `
-- ═══════════════════════════════════════════════════════════════════════════
-- SP_ValidarDuplicidadeInfracao
-- Verifica se já existe infração similar antes de permitir nova inserção
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR ALTER PROCEDURE SP_ValidarDuplicidadeInfracao
  @Placa              VARCHAR(10),
  @IdEquipamento      INT,
  @IdFaixa            INT,
  @DataHoraInfracao   DATETIME,
  @VelocidadeMedida   DECIMAL(10,2) = NULL,
  @ToleranciaSegundos INT = 60,
  @EhDuplicidade      BIT OUTPUT,
  @IdInfracaoExistente INT OUTPUT
AS
BEGIN
  SET NOCOUNT ON;
  
  SET @EhDuplicidade = 0;
  SET @IdInfracaoExistente = NULL;

  -- Buscar infração existente com mesma placa, equipamento e faixa
  -- dentro da janela de tolerância temporal
  SELECT TOP 1 @IdInfracaoExistente = IdInfracao
  FROM TBInfracoes
  WHERE Placa = @Placa
    AND IdEquipamento = @IdEquipamento
    AND IdFaixa = @IdFaixa
    AND ABS(DATEDIFF(SECOND, DataHoraInfracao, @DataHoraInfracao)) <= @ToleranciaSegundos
  ORDER BY DataHoraInfracao DESC;

  IF @IdInfracaoExistente IS NOT NULL
  BEGIN
    SET @EhDuplicidade = 1;
    
    -- Registrar tentativa de duplicidade no log
    INSERT INTO TBLogsDuplicidade (
      DataHora, Placa, IdEquipamento, IdFaixa, 
      DataHoraInfracaoNova, IdInfracaoExistente, 
      VelocidadeMedida, Acao
    ) VALUES (
      GETDATE(), @Placa, @IdEquipamento, @IdFaixa,
      @DataHoraInfracao, @IdInfracaoExistente,
      @VelocidadeMedida, 'BLOQUEADO'
    );
  END
END;
GO
`;

// ─── SQL: TABELA DE LOG DE DUPLICIDADES ──────────────────────────────────────
export const SQL_TABELA_LOG = `
-- Tabela para registrar tentativas de inserção duplicada
CREATE TABLE TBLogsDuplicidade (
  IdLog               INT IDENTITY(1,1) PRIMARY KEY,
  DataHora            DATETIME NOT NULL DEFAULT GETDATE(),
  Placa               VARCHAR(10) NOT NULL,
  IdEquipamento       INT NOT NULL,
  IdFaixa             INT NOT NULL,
  DataHoraInfracaoNova DATETIME NOT NULL,
  IdInfracaoExistente INT NOT NULL,
  VelocidadeMedida    DECIMAL(10,2) NULL,
  Acao                VARCHAR(20) NOT NULL DEFAULT 'BLOQUEADO', -- BLOQUEADO | ALERTADO | PERMITIDO
  Revisado            BIT DEFAULT 0,
  RevisadoPor         INT NULL,
  DataRevisao         DATETIME NULL,
  CONSTRAINT FK_LogDup_Infracao FOREIGN KEY (IdInfracaoExistente) REFERENCES TBInfracoes(IdInfracao)
);

CREATE INDEX IX_LogDup_DataHora ON TBLogsDuplicidade(DataHora DESC);
CREATE INDEX IX_LogDup_Placa ON TBLogsDuplicidade(Placa);
`;

// ─── SQL: TRIGGER PARA DETECÇÃO AUTOMÁTICA ───────────────────────────────────
export const SQL_TRIGGER = `
-- Trigger que detecta e bloqueia inserções duplicadas
CREATE OR ALTER TRIGGER TR_Infracoes_ValidarDuplicidade
ON TBInfracoes
INSTEAD OF INSERT
AS
BEGIN
  SET NOCOUNT ON;
  
  DECLARE @ToleranciaSegundos INT = 60;

  -- Inserir apenas registros que NÃO são duplicados
  INSERT INTO TBInfracoes (
    Placa, DataHoraInfracao, IdEquipamento, IdFaixa, IdLocal,
    VelocidadeMedida, VelocidadeConsiderada, VelocidadeRegulamentada,
    DataHoraImportacao, Status
    -- ... demais campos conforme schema real
  )
  SELECT 
    i.Placa, i.DataHoraInfracao, i.IdEquipamento, i.IdFaixa, i.IdLocal,
    i.VelocidadeMedida, i.VelocidadeConsiderada, i.VelocidadeRegulamentada,
    i.DataHoraImportacao, i.Status
  FROM inserted i
  WHERE NOT EXISTS (
    SELECT 1 FROM TBInfracoes existing
    WHERE existing.Placa = i.Placa
      AND existing.IdEquipamento = i.IdEquipamento
      AND existing.IdFaixa = i.IdFaixa
      AND ABS(DATEDIFF(SECOND, existing.DataHoraInfracao, i.DataHoraInfracao)) <= @ToleranciaSegundos
  );

  -- Registrar os que foram bloqueados
  INSERT INTO TBLogsDuplicidade (Placa, IdEquipamento, IdFaixa, DataHoraInfracaoNova, IdInfracaoExistente, VelocidadeMedida, Acao)
  SELECT 
    i.Placa, i.IdEquipamento, i.IdFaixa, i.DataHoraInfracao,
    (SELECT TOP 1 IdInfracao FROM TBInfracoes e 
     WHERE e.Placa = i.Placa AND e.IdEquipamento = i.IdEquipamento AND e.IdFaixa = i.IdFaixa
       AND ABS(DATEDIFF(SECOND, e.DataHoraInfracao, i.DataHoraInfracao)) <= @ToleranciaSegundos),
    i.VelocidadeMedida,
    'BLOQUEADO'
  FROM inserted i
  WHERE EXISTS (
    SELECT 1 FROM TBInfracoes existing
    WHERE existing.Placa = i.Placa
      AND existing.IdEquipamento = i.IdEquipamento
      AND existing.IdFaixa = i.IdFaixa
      AND ABS(DATEDIFF(SECOND, existing.DataHoraInfracao, i.DataHoraInfracao)) <= @ToleranciaSegundos
  );
END;
GO
`;

// ─── SQL: QUERY DE VARREDURA DE DUPLICIDADES EXISTENTES ──────────────────────
export const SQL_VARREDURA = `
-- Encontrar TODAS as duplicidades existentes nos últimos N dias
-- Ajustar @DiasRetroativos conforme necessidade
DECLARE @DiasRetroativos INT = 30;
DECLARE @ToleranciaSegundos INT = 60;

SELECT 
  a.IdInfracao AS IdInfracao_A,
  b.IdInfracao AS IdInfracao_B,
  a.Placa,
  a.DataHoraInfracao AS DataHora_A,
  b.DataHoraInfracao AS DataHora_B,
  DATEDIFF(SECOND, a.DataHoraInfracao, b.DataHoraInfracao) AS DiferencaSegundos,
  a.VelocidadeMedida AS VelMedida_A,
  b.VelocidadeMedida AS VelMedida_B,
  a.VelocidadeConsiderada AS VelConsiderada_A,
  b.VelocidadeConsiderada AS VelConsiderada_B,
  e.Descricao AS Equipamento,
  f.Descricao AS Faixa,
  l.Descricao AS Local,
  CASE 
    WHEN a.VelocidadeMedida = b.VelocidadeMedida THEN 'IDENTICAS'
    ELSE 'DIVERGENTES'
  END AS StatusVelocidade
FROM TBInfracoes a
INNER JOIN TBInfracoes b 
  ON a.Placa = b.Placa
  AND a.IdEquipamento = b.IdEquipamento
  AND a.IdFaixa = b.IdFaixa
  AND a.IdInfracao < b.IdInfracao
  AND DATEDIFF(SECOND, a.DataHoraInfracao, b.DataHoraInfracao) BETWEEN 0 AND @ToleranciaSegundos
LEFT JOIN TBEquipamentos e ON a.IdEquipamento = e.IdEquipamento
LEFT JOIN TBFaixas f ON a.IdFaixa = f.IdFaixa
LEFT JOIN TBLocais l ON a.IdLocal = l.IdLocal
WHERE a.DataHoraInfracao >= DATEADD(DAY, -@DiasRetroativos, GETDATE())
ORDER BY a.DataHoraInfracao DESC;
`;

// ─── ENDPOINT PARA O AXION-IA-API ───────────────────────────────────────────
export const ENDPOINT_DEDUP_AUDIT = `
/**
 * GET /api/axhub/duplicidades
 * Retorna infrações potencialmente duplicadas
 * Query params: dias (default 30), tolerancia (default 60)
 */
export async function listarDuplicidades(req, res) {
  const dias = parseInt(req.query.dias) || 30;
  const tolerancia = parseInt(req.query.tolerancia) || 60;
  
  try {
    const pool = await conectar();
    const result = await pool.request()
      .input("dias", dias)
      .input("tolerancia", tolerancia)
      .query(\`
        SELECT 
          a.IdInfracao AS IdA, b.IdInfracao AS IdB,
          a.Placa,
          a.DataHoraInfracao AS DataA, b.DataHoraInfracao AS DataB,
          DATEDIFF(SECOND, a.DataHoraInfracao, b.DataHoraInfracao) AS DiffSeg,
          a.VelocidadeMedida AS VelA, b.VelocidadeMedida AS VelB,
          e.Descricao AS Equipamento
        FROM TBInfracoes a
        INNER JOIN TBInfracoes b 
          ON a.Placa = b.Placa AND a.IdEquipamento = b.IdEquipamento
          AND a.IdFaixa = b.IdFaixa AND a.IdInfracao < b.IdInfracao
          AND DATEDIFF(SECOND, a.DataHoraInfracao, b.DataHoraInfracao) BETWEEN 0 AND @tolerancia
        LEFT JOIN TBEquipamentos e ON a.IdEquipamento = e.IdEquipamento
        WHERE a.DataHoraInfracao >= DATEADD(DAY, -@dias, GETDATE())
        ORDER BY a.DataHoraInfracao DESC
      \`);
    
    return res.json({
      total: result.recordset.length,
      parametros: { dias, tolerancia_seg: tolerancia },
      duplicidades: result.recordset
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}
`;

console.log("═══════════════════════════════════════════════════════════════");
console.log("  PROPOSTA DE CORREÇÃO CARREGADA");
console.log("  Exportações disponíveis:");
console.log("    - DEDUP_CONFIG:           Configuração de parâmetros");
console.log("    - SQL_STORED_PROCEDURE:   SP para validação pré-insert");
console.log("    - SQL_TABELA_LOG:         DDL da tabela de logs");
console.log("    - SQL_TRIGGER:            Trigger INSTEAD OF INSERT");
console.log("    - SQL_VARREDURA:          Query para encontrar duplicidades");
console.log("    - ENDPOINT_DEDUP_AUDIT:   Código para endpoint no AxionIA API");
console.log("═══════════════════════════════════════════════════════════════");
