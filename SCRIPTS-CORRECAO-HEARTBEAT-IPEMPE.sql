-- ========================================================================
-- SCRIPTS DE DIAGNÓSTICO E CORREÇÃO — HEARTBEAT vs PASSAGENS — IPEMPE
-- ========================================================================
-- Sistema: AxHub v1.2.1
-- Cliente: IPEMPE
-- Data: 2026-06-16
-- Problema: Equipamentos aparecem offline mas estão gerando passagens
-- ========================================================================

-- ========================================================================
-- PARTE 1: DIAGNÓSTICO
-- ========================================================================

-- 1.1 Comparar Passagens vs Heartbeat de equipamentos específicos
-- ----------------------------------------------------------------
SELECT 
    e.Codigo AS CodigoEquipamento,
    e.Descricao AS NomeEquipamento,
    e.NumeroSerie,
    
    -- Última passagem
    (SELECT MAX(DataHoraPassagem) 
     FROM TBPassagens 
     WHERE IdEquipamento = e.IdEquipamento) AS UltimaPassagem,
    
    -- Último heartbeat
    (SELECT MAX(DataHoraHeartbeat) 
     FROM TBHeartbeatEquipamentos 
     WHERE Equipamento_id = e.IdEquipamento) AS UltimoHeartbeat,
    
    -- Minutos sem passagem
    DATEDIFF(MINUTE, 
        (SELECT MAX(DataHoraPassagem) FROM TBPassagens WHERE IdEquipamento = e.IdEquipamento), 
        GETDATE()) AS MinutosSemPassagem,
    
    -- Minutos sem heartbeat
    DATEDIFF(MINUTE, 
        (SELECT MAX(DataHoraHeartbeat) FROM TBHeartbeatEquipamentos WHERE Equipamento_id = e.IdEquipamento), 
        GETDATE()) AS MinutosSemHeartbeat,
    
    -- Status de passagens
    CASE 
        WHEN (SELECT MAX(DataHoraPassagem) FROM TBPassagens WHERE IdEquipamento = e.IdEquipamento) > DATEADD(HOUR, -24, GETDATE()) 
        THEN '✅ Gerando Passagens'
        ELSE '❌ Sem Passagens'
    END AS StatusPassagens,
    
    -- Status de heartbeat
    CASE 
        WHEN (SELECT MAX(DataHoraHeartbeat) FROM TBHeartbeatEquipamentos WHERE Equipamento_id = e.IdEquipamento) > DATEADD(HOUR, -2, GETDATE()) 
        THEN '✅ Heartbeat OK'
        ELSE '❌ Heartbeat Falhou'
    END AS StatusHeartbeat,
    
    -- Diagnóstico
    CASE 
        WHEN (SELECT MAX(DataHoraPassagem) FROM TBPassagens WHERE IdEquipamento = e.IdEquipamento) > DATEADD(HOUR, -24, GETDATE())
         AND (SELECT MAX(DataHoraHeartbeat) FROM TBHeartbeatEquipamentos WHERE Equipamento_id = e.IdEquipamento) <= DATEADD(HOUR, -2, GETDATE())
        THEN '⚠️ PROBLEMA: Gera passagem mas não envia heartbeat'
        WHEN (SELECT MAX(DataHoraPassagem) FROM TBPassagens WHERE IdEquipamento = e.IdEquipamento) <= DATEADD(HOUR, -24, GETDATE())
         AND (SELECT MAX(DataHoraHeartbeat) FROM TBHeartbeatEquipamentos WHERE Equipamento_id = e.IdEquipamento) > DATEADD(HOUR, -2, GETDATE())
        THEN '⚠️ PROBLEMA: Envia heartbeat mas não gera passagem'
        WHEN (SELECT MAX(DataHoraPassagem) FROM TBPassagens WHERE IdEquipamento = e.IdEquipamento) <= DATEADD(HOUR, -24, GETDATE())
         AND (SELECT MAX(DataHoraHeartbeat) FROM TBHeartbeatEquipamentos WHERE Equipamento_id = e.IdEquipamento) <= DATEADD(HOUR, -2, GETDATE())
        THEN '🔴 CRÍTICO: Offline completo (sem passagem e sem heartbeat)'
        ELSE '✅ OK: Funcionamento normal'
    END AS Diagnostico

FROM TBEquipamentos e
WHERE e.Codigo IN ('PE602C', 'PE601C', 'PE004C', 'PE005C', 'PE012C')
ORDER BY e.Codigo;


-- 1.2 Verificar últimas passagens de equipamentos "offline"
-- ----------------------------------------------------------
SELECT TOP 20
    p.DataHoraPassagem,
    e.Codigo AS CodigoEquipamento,
    e.Descricao AS NomeEquipamento,
    p.Placa,
    DATEDIFF(MINUTE, p.DataHoraPassagem, GETDATE()) AS MinutosAtras,
    CASE 
        WHEN DATEDIFF(MINUTE, p.DataHoraPassagem, GETDATE()) < 60 THEN '✅ Última hora'
        WHEN DATEDIFF(MINUTE, p.DataHoraPassagem, GETDATE()) < 1440 THEN '✅ Últimas 24h'
        ELSE '⚠️ Mais de 24h'
    END AS Periodo
FROM TBPassagens p
JOIN TBEquipamentos e ON p.IdEquipamento = e.IdEquipamento
WHERE e.Codigo IN ('PE602C', 'PE601C', 'PE004C')
ORDER BY p.DataHoraPassagem DESC;


-- 1.3 Verificar último heartbeat de TODOS os equipamentos
-- --------------------------------------------------------
SELECT 
    e.Codigo,
    e.Descricao,
    h.DataHoraHeartbeat AS UltimoHeartbeat,
    DATEDIFF(MINUTE, h.DataHoraHeartbeat, GETDATE()) AS MinutosSemSinal,
    CASE 
        WHEN h.DataHoraHeartbeat >= DATEADD(MINUTE, -30, GETDATE()) THEN '🟢 Online (< 30min)'
        WHEN h.DataHoraHeartbeat >= DATEADD(HOUR, -2, GETDATE()) THEN '🟡 Online (< 2h)'
        WHEN h.DataHoraHeartbeat >= DATEADD(HOUR, -24, GETDATE()) THEN '🟠 Atenção (< 24h)'
        ELSE '🔴 Offline (> 24h)'
    END AS StatusDetalhado
FROM TBEquipamentos e
LEFT JOIN TBHeartbeatEquipamentos h ON e.IdEquipamento = h.Equipamento_id
WHERE e.Ativo = 1
ORDER BY h.DataHoraHeartbeat DESC;


-- 1.4 Verificar estrutura da tabela TBHeartbeatEquipamentos
-- ----------------------------------------------------------
SELECT 
    COLUMN_NAME AS Coluna,
    DATA_TYPE AS TipoDado,
    IS_NULLABLE AS Nulavel,
    COLUMN_DEFAULT AS ValorPadrao
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TBHeartbeatEquipamentos'
ORDER BY ORDINAL_POSITION;


-- 1.5 Verificar se há registros recentes de ALGUM equipamento
-- ------------------------------------------------------------
SELECT TOP 20
    h.DataHoraHeartbeat,
    e.Codigo,
    e.Descricao,
    DATEDIFF(MINUTE, h.DataHoraHeartbeat, GETDATE()) AS MinutosAtras
FROM TBHeartbeatEquipamentos h
JOIN TBEquipamentos e ON h.Equipamento_id = e.IdEquipamento
ORDER BY h.DataHoraHeartbeat DESC;

-- Resultado esperado:
-- Se houver registros recentes de ALGUNS equipamentos: Problema específico de PE602C, PE601C, PE004C
-- Se NÃO houver registros recentes de NENHUM: Problema sistêmico


-- ========================================================================
-- PARTE 2: CORREÇÃO IMEDIATA (TESTE)
-- ========================================================================

-- 2.1 Forçar heartbeat manual para equipamentos offline (TESTE)
-- --------------------------------------------------------------
-- ⚠️ IMPORTANTE: Isso é apenas um TESTE para ver se o dashboard responde
-- Após executar, aguarde 1 minuto e verifique o dashboard

-- Para PE602C
DECLARE @IdPE602C UNIQUEIDENTIFIER
SELECT @IdPE602C = IdEquipamento FROM TBEquipamentos WHERE Codigo = 'PE602C'

IF EXISTS (SELECT 1 FROM TBHeartbeatEquipamentos WHERE Equipamento_id = @IdPE602C)
    UPDATE TBHeartbeatEquipamentos SET DataHoraHeartbeat = GETDATE() WHERE Equipamento_id = @IdPE602C
ELSE
    INSERT INTO TBHeartbeatEquipamentos (Equipamento_id, DataHoraHeartbeat) VALUES (@IdPE602C, GETDATE())

PRINT 'Heartbeat manual registrado para PE602C: ' + CONVERT(VARCHAR, GETDATE(), 120)

-- Para PE601C
DECLARE @IdPE601C UNIQUEIDENTIFIER
SELECT @IdPE601C = IdEquipamento FROM TBEquipamentos WHERE Codigo = 'PE601C'

IF EXISTS (SELECT 1 FROM TBHeartbeatEquipamentos WHERE Equipamento_id = @IdPE601C)
    UPDATE TBHeartbeatEquipamentos SET DataHoraHeartbeat = GETDATE() WHERE Equipamento_id = @IdPE601C
ELSE
    INSERT INTO TBHeartbeatEquipamentos (Equipamento_id, DataHoraHeartbeat) VALUES (@IdPE601C, GETDATE())

PRINT 'Heartbeat manual registrado para PE601C: ' + CONVERT(VARCHAR, GETDATE(), 120)

-- Para PE004C
DECLARE @IdPE004C UNIQUEIDENTIFIER
SELECT @IdPE004C = IdEquipamento FROM TBEquipamentos WHERE Codigo = 'PE004C'

IF EXISTS (SELECT 1 FROM TBHeartbeatEquipamentos WHERE Equipamento_id = @IdPE004C)
    UPDATE TBHeartbeatEquipamentos SET DataHoraHeartbeat = GETDATE() WHERE Equipamento_id = @IdPE004C
ELSE
    INSERT INTO TBHeartbeatEquipamentos (Equipamento_id, DataHoraHeartbeat) VALUES (@IdPE004C, GETDATE())

PRINT 'Heartbeat manual registrado para PE004C: ' + CONVERT(VARCHAR, GETDATE(), 120)

GO

-- Verificar se funcionou
SELECT 
    e.Codigo,
    h.DataHoraHeartbeat,
    DATEDIFF(SECOND, h.DataHoraHeartbeat, GETDATE()) AS SegundosAtras
FROM TBEquipamentos e
JOIN TBHeartbeatEquipamentos h ON e.IdEquipamento = h.Equipamento_id
WHERE e.Codigo IN ('PE602C', 'PE601C', 'PE004C')
ORDER BY e.Codigo;

-- Se "SegundosAtras" for < 60, o teste funcionou!
-- Agora verifique o dashboard: https://ipempe.axhub.axion.ws/


-- ========================================================================
-- PARTE 3: SOLUÇÃO DEFINITIVA — TRIGGER AUTOMÁTICO
-- ========================================================================

-- 3.1 Criar trigger para sincronizar heartbeat com passagens
-- -----------------------------------------------------------
-- ⚠️ Esta é a SOLUÇÃO RECOMENDADA para correção automática

CREATE OR ALTER TRIGGER TR_AtualizaHeartbeatNaPassagem
ON TBPassagens
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Atualizar ou inserir heartbeat para equipamentos que enviaram passagem
    MERGE INTO TBHeartbeatEquipamentos AS target
    USING (
        SELECT DISTINCT 
            i.IdEquipamento,
            GETDATE() AS DataHora
        FROM inserted i
    ) AS source
    ON target.Equipamento_id = source.IdEquipamento
    
    WHEN MATCHED THEN
        -- Atualizar apenas se passagem for mais recente que heartbeat atual
        UPDATE SET DataHoraHeartbeat = CASE 
            WHEN source.DataHora > target.DataHoraHeartbeat 
            THEN source.DataHora 
            ELSE target.DataHoraHeartbeat 
        END
    
    WHEN NOT MATCHED THEN
        -- Inserir novo registro se equipamento não tem heartbeat
        INSERT (Equipamento_id, DataHoraHeartbeat)
        VALUES (source.IdEquipamento, source.DataHora);
    
    -- Log opcional
    IF @@ROWCOUNT > 0
    BEGIN
        DECLARE @msg VARCHAR(200)
        SET @msg = 'Heartbeat sincronizado para ' + CAST(@@ROWCOUNT AS VARCHAR) + ' equipamento(s)'
        PRINT @msg
    END
END
GO

PRINT 'Trigger TR_AtualizaHeartbeatNaPassagem criado com sucesso!'
PRINT 'A partir de agora, heartbeat será atualizado automaticamente quando chegar passagem.'


-- 3.2 Verificar se trigger foi criado
-- ------------------------------------
SELECT 
    name AS NomeTrigger,
    OBJECT_NAME(parent_id) AS TabelaAssociada,
    create_date AS DataCriacao,
    modify_date AS DataModificacao,
    is_disabled AS Desabilitado
FROM sys.triggers
WHERE name = 'TR_AtualizaHeartbeatNaPassagem';


-- 3.3 Desabilitar trigger (se necessário)
-- ----------------------------------------
-- DISABLE TRIGGER TR_AtualizaHeartbeatNaPassagem ON TBPassagens;

-- 3.4 Reabilitar trigger (se necessário)
-- ---------------------------------------
-- ENABLE TRIGGER TR_AtualizaHeartbeatNaPassagem ON TBPassagens;

-- 3.5 Remover trigger (se necessário)
-- ------------------------------------
-- DROP TRIGGER IF EXISTS TR_AtualizaHeartbeatNaPassagem;


-- ========================================================================
-- PARTE 4: SOLUÇÃO ALTERNATIVA — JOB PERIÓDICO
-- ========================================================================

-- 4.1 Stored Procedure para sincronização periódica
-- --------------------------------------------------
CREATE OR ALTER PROCEDURE SP_SincronizarHeartbeatComPassagens
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @InicioExecucao DATETIME = GETDATE()
    DECLARE @EquipamentosAtualizados INT = 0
    
    -- Atualizar heartbeat de equipamentos que tiveram passagens nas últimas 2 horas
    MERGE INTO TBHeartbeatEquipamentos AS target
    USING (
        SELECT 
            p.IdEquipamento,
            MAX(p.DataHoraPassagem) AS UltimaPassagem
        FROM TBPassagens p
        WHERE p.DataHoraPassagem >= DATEADD(HOUR, -2, GETDATE())
        GROUP BY p.IdEquipamento
    ) AS source
    ON target.Equipamento_id = source.IdEquipamento
    
    WHEN MATCHED AND (target.DataHoraHeartbeat IS NULL OR target.DataHoraHeartbeat < source.UltimaPassagem) THEN
        UPDATE SET DataHoraHeartbeat = source.UltimaPassagem
    
    WHEN NOT MATCHED THEN
        INSERT (Equipamento_id, DataHoraHeartbeat)
        VALUES (source.IdEquipamento, source.UltimaPassagem);
    
    SET @EquipamentosAtualizados = @@ROWCOUNT
    
    -- Registrar execução (opcional - criar tabela de log se necessário)
    DECLARE @msg VARCHAR(500)
    SET @msg = 'SP_SincronizarHeartbeatComPassagens executada em ' + CONVERT(VARCHAR, @InicioExecucao, 120) 
             + ' - ' + CAST(@EquipamentosAtualizados AS VARCHAR) + ' equipamento(s) sincronizado(s)'
    PRINT @msg
    
    RETURN @EquipamentosAtualizados
END
GO

PRINT 'Stored Procedure SP_SincronizarHeartbeatComPassagens criada com sucesso!'


-- 4.2 Testar execução da Stored Procedure
-- ----------------------------------------
EXEC SP_SincronizarHeartbeatComPassagens;


-- 4.3 Criar SQL Agent Job para executar a cada 10 minutos
-- --------------------------------------------------------
-- ⚠️ Este código deve ser executado no SQL Server Management Studio
-- ⚠️ Requer permissões de SQL Agent

USE msdb;
GO

-- Verificar se job já existe e remover
IF EXISTS (SELECT 1 FROM msdb.dbo.sysjobs WHERE name = 'Job_SincronizarHeartbeatAxHub')
BEGIN
    EXEC msdb.dbo.sp_delete_job @job_name = 'Job_SincronizarHeartbeatAxHub';
END
GO

-- Criar novo job
EXEC msdb.dbo.sp_add_job
    @job_name = N'Job_SincronizarHeartbeatAxHub',
    @enabled = 1,
    @description = N'Sincroniza heartbeat de equipamentos baseado em passagens recentes';

-- Adicionar step ao job
EXEC msdb.dbo.sp_add_jobstep
    @job_name = N'Job_SincronizarHeartbeatAxHub',
    @step_name = N'Executar SP_SincronizarHeartbeatComPassagens',
    @subsystem = N'TSQL',
    @database_name = N'AxHub',  -- ⚠️ AJUSTAR NOME DO BANCO SE NECESSÁRIO
    @command = N'EXEC SP_SincronizarHeartbeatComPassagens;',
    @retry_attempts = 3,
    @retry_interval = 1;

-- Criar schedule para executar a cada 10 minutos
EXEC msdb.dbo.sp_add_schedule
    @schedule_name = N'ACada10Minutos',
    @freq_type = 4,  -- Daily
    @freq_interval = 1,  -- Every 1 day
    @freq_subday_type = 4,  -- Minutes
    @freq_subday_interval = 10,  -- Every 10 minutes
    @active_start_time = 000000,  -- 00:00:00
    @active_end_time = 235959;  -- 23:59:59

-- Vincular schedule ao job
EXEC msdb.dbo.sp_attach_schedule
    @job_name = N'Job_SincronizarHeartbeatAxHub',
    @schedule_name = N'ACada10Minutos';

-- Adicionar job ao servidor local
EXEC msdb.dbo.sp_add_jobserver
    @job_name = N'Job_SincronizarHeartbeatAxHub',
    @server_name = N'(local)';

PRINT 'SQL Agent Job criado com sucesso!'
PRINT 'Job será executado automaticamente a cada 10 minutos.'


-- 4.4 Verificar status do job
-- ----------------------------
SELECT 
    j.name AS NomeJob,
    j.enabled AS Habilitado,
    j.date_created AS DataCriacao,
    s.name AS NomeSchedule,
    CASE s.enabled 
        WHEN 1 THEN 'Ativo' 
        ELSE 'Inativo' 
    END AS StatusSchedule
FROM msdb.dbo.sysjobs j
LEFT JOIN msdb.dbo.sysjobschedules js ON j.job_id = js.job_id
LEFT JOIN msdb.dbo.sysschedules s ON js.schedule_id = s.schedule_id
WHERE j.name = 'Job_SincronizarHeartbeatAxHub';


-- 4.5 Executar job manualmente (teste)
-- -------------------------------------
EXEC msdb.dbo.sp_start_job @job_name = 'Job_SincronizarHeartbeatAxHub';


-- 4.6 Verificar histórico de execuções do job
-- --------------------------------------------
SELECT TOP 10
    jh.run_date AS DataExecucao,
    jh.run_time AS HoraExecucao,
    CASE jh.run_status
        WHEN 0 THEN 'Falhou'
        WHEN 1 THEN 'Sucesso'
        WHEN 2 THEN 'Cancelado'
        WHEN 3 THEN 'Em Execução'
        WHEN 4 THEN 'Idle'
    END AS Status,
    jh.run_duration AS DuracaoSegundos,
    jh.message AS Mensagem
FROM msdb.dbo.sysjobhistory jh
JOIN msdb.dbo.sysjobs j ON jh.job_id = j.job_id
WHERE j.name = 'Job_SincronizarHeartbeatAxHub'
ORDER BY jh.run_date DESC, jh.run_time DESC;


-- ========================================================================
-- PARTE 5: VALIDAÇÃO FINAL
-- ========================================================================

-- 5.1 Verificar se trigger está ativo
-- ------------------------------------
SELECT 
    CASE 
        WHEN is_disabled = 0 THEN '✅ Trigger ATIVO'
        ELSE '❌ Trigger DESABILITADO'
    END AS StatusTrigger,
    name AS NomeTrigger,
    OBJECT_NAME(parent_id) AS Tabela,
    create_date AS Criado,
    modify_date AS Modificado
FROM sys.triggers
WHERE name = 'TR_AtualizaHeartbeatNaPassagem';


-- 5.2 Verificar se job está ativo
-- --------------------------------
SELECT 
    CASE 
        WHEN j.enabled = 1 THEN '✅ Job ATIVO'
        ELSE '❌ Job DESABILITADO'
    END AS StatusJob,
    j.name AS NomeJob,
    j.date_created AS DataCriacao,
    CASE s.enabled 
        WHEN 1 THEN '✅ Schedule Ativo' 
        ELSE '❌ Schedule Inativo' 
    END AS StatusSchedule
FROM msdb.dbo.sysjobs j
LEFT JOIN msdb.dbo.sysjobschedules js ON j.job_id = js.job_id
LEFT JOIN msdb.dbo.sysschedules s ON js.schedule_id = s.schedule_id
WHERE j.name = 'Job_SincronizarHeartbeatAxHub';


-- 5.3 Testar query do dashboard (como é calculado o status)
-- ----------------------------------------------------------
SELECT 
    e.Codigo AS CodigoEquipamento,
    e.Descricao AS LocalEquipamento,
    COUNT(DISTINCT f.IdFaixa) AS NumeroFaixas,
    h.DataHoraHeartbeat AS UltimaComunicacao,
    CASE 
        WHEN h.DataHoraHeartbeat >= DATEADD(HOUR, -2, GETDATE()) THEN '🟢 Online'
        ELSE '🔴 Offline'
    END AS Status,
    DATEDIFF(MINUTE, h.DataHoraHeartbeat, GETDATE()) AS MinutosSemSinal
FROM TBEquipamentos e
LEFT JOIN TBFaixas f ON e.IdEquipamento = f.IdEquipamento
LEFT JOIN TBHeartbeatEquipamentos h ON e.IdEquipamento = h.Equipamento_id
WHERE e.Codigo IN ('PE602C', 'PE601C', 'PE004C', 'PE005C', 'PE012C')
  AND e.Ativo = 1
GROUP BY e.Codigo, e.Descricao, h.DataHoraHeartbeat
ORDER BY Status DESC, h.DataHoraHeartbeat DESC;


-- ========================================================================
-- FIM DOS SCRIPTS
-- ========================================================================

PRINT ''
PRINT '========================================================================='
PRINT 'Scripts executados com sucesso!'
PRINT '========================================================================='
PRINT ''
PRINT 'Próximos passos:'
PRINT '1. Aguarde 1 minuto'
PRINT '2. Verifique o dashboard: https://ipempe.axhub.axion.ws/'
PRINT '3. Equipamentos PE602C, PE601C, PE004C devem aparecer como ONLINE'
PRINT ''
PRINT 'Se equipamentos continuarem offline:'
PRINT '- Execute PARTE 2 (Correção Imediata) para testar'
PRINT '- Verifique se trigger está ativo (PARTE 5.1)'
PRINT '- Verifique se job está ativo (PARTE 5.2)'
PRINT ''
PRINT 'Suporte: suporte@axiontecnologia.com.br'
PRINT '========================================================================='
