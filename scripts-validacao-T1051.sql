-- ============================================================================
-- SCRIPT DE VALIDAÇÃO — Divergência T1051 (STRANS)
-- Analista: [preencher]
-- Data: 27/05/2026
-- Objetivo: Validar pipeline Fluxo → Infração → Triagem para equipamento T1051
-- Executar no banco: STRANS (SQL Server)
-- ============================================================================

-- ============================================================================
-- PARTE 1: IDENTIFICAR O EQUIPAMENTO T1051
-- ============================================================================

-- 1.1 Buscar ID do equipamento T1051
SELECT 
    e.Id AS Equipamento_Id,
    e.Codigo,
    e.Descricao,
    ge.Nome AS GrupoEquipamento,
    e.GrupoEquipamento_id
FROM TBEquipamentos e
LEFT JOIN TBGrupoEquipamentos ge ON e.GrupoEquipamento_id = ge.Id
WHERE e.Codigo = 'T1051';

-- 1.2 Buscar outro equipamento VIZENTEC para comparação (T1022)
SELECT 
    e.Id AS Equipamento_Id,
    e.Codigo,
    e.Descricao,
    ge.Nome AS GrupoEquipamento
FROM TBEquipamentos e
LEFT JOIN TBGrupoEquipamentos ge ON e.GrupoEquipamento_id = ge.Id
WHERE e.Codigo IN ('T1051', 'T1022')
ORDER BY e.Codigo;


-- ============================================================================
-- PARTE 2: FLUXO DE PASSAGENS (TBPassagens) — O que o equipamento registrou
-- ============================================================================

-- 2.1 Total de passagens por dia (23-27/05) — T1051
SELECT 
    CAST(p.DataHoraPassagem AS DATE) AS Data,
    COUNT(*) AS TotalPassagens,
    COUNT(p.Infracao_id) AS PassagensComInfracao
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = 'T1051'
  AND p.DataHoraPassagem >= '2026-05-23 00:00:00'
  AND p.DataHoraPassagem < '2026-05-28 00:00:00'
GROUP BY CAST(p.DataHoraPassagem AS DATE)
ORDER BY Data;

-- 2.2 Mesmo para T1022 (comparação)
SELECT 
    CAST(p.DataHoraPassagem AS DATE) AS Data,
    COUNT(*) AS TotalPassagens,
    COUNT(p.Infracao_id) AS PassagensComInfracao
FROM TBPassagens p
JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
WHERE e.Codigo = 'T1022'
  AND p.DataHoraPassagem >= '2026-05-23 00:00:00'
  AND p.DataHoraPassagem < '2026-05-28 00:00:00'
GROUP BY CAST(p.DataHoraPassagem AS DATE)
ORDER BY Data;


-- ============================================================================
-- PARTE 3: PASSAGENS CONJUGADAS (TBPassagensConjugadas) — Imagens capturadas
-- ============================================================================

-- 3.1 Passagens conjugadas e se geraram infração — T1051
SELECT 
    CAST(pc.DataHoraPassagem AS DATE) AS Data,
    COUNT(*) AS TotalImagens,
    SUM(CASE WHEN pc.FoiGeradaInfracao = 1 THEN 1 ELSE 0 END) AS GeraramInfracao,
    SUM(CASE WHEN pc.FoiGeradaInfracao = 0 THEN 1 ELSE 0 END) AS NaoGeraramInfracao
FROM TBPassagensConjugadas pc
JOIN TBEquipamentos e ON pc.Equipamento_id = e.Id
WHERE e.Codigo = 'T1051'
  AND pc.DataHoraPassagem >= '2026-05-23 00:00:00'
  AND pc.DataHoraPassagem < '2026-05-28 00:00:00'
GROUP BY CAST(pc.DataHoraPassagem AS DATE)
ORDER BY Data;

-- 3.2 Mesmo para T1022
SELECT 
    CAST(pc.DataHoraPassagem AS DATE) AS Data,
    COUNT(*) AS TotalImagens,
    SUM(CASE WHEN pc.FoiGeradaInfracao = 1 THEN 1 ELSE 0 END) AS GeraramInfracao,
    SUM(CASE WHEN pc.FoiGeradaInfracao = 0 THEN 1 ELSE 0 END) AS NaoGeraramInfracao
FROM TBPassagensConjugadas pc
JOIN TBEquipamentos e ON pc.Equipamento_id = e.Id
WHERE e.Codigo = 'T1022'
  AND pc.DataHoraPassagem >= '2026-05-23 00:00:00'
  AND pc.DataHoraPassagem < '2026-05-28 00:00:00'
GROUP BY CAST(pc.DataHoraPassagem AS DATE)
ORDER BY Data;


-- ============================================================================
-- PARTE 4: INFRAÇÕES (TBInfracoes) — O que entrou no pipeline
-- ============================================================================

-- 4.1 Infrações por dia e status — T1051
SELECT 
    CAST(i.DataHoraPassagem AS DATE) AS Data,
    i.StatusProcessamento,
    COUNT(*) AS Quantidade
FROM TBInfracoes i
JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
WHERE e.Codigo = 'T1051'
  AND i.DataHoraPassagem >= '2026-05-23 00:00:00'
  AND i.DataHoraPassagem < '2026-05-28 00:00:00'
  AND (i.IsDeleted IS NULL OR i.IsDeleted = 0)
GROUP BY CAST(i.DataHoraPassagem AS DATE), i.StatusProcessamento
ORDER BY Data, StatusProcessamento;

-- 4.2 Mesmo para T1022
SELECT 
    CAST(i.DataHoraPassagem AS DATE) AS Data,
    i.StatusProcessamento,
    COUNT(*) AS Quantidade
FROM TBInfracoes i
JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
WHERE e.Codigo = 'T1022'
  AND i.DataHoraPassagem >= '2026-05-23 00:00:00'
  AND i.DataHoraPassagem < '2026-05-28 00:00:00'
  AND (i.IsDeleted IS NULL OR i.IsDeleted = 0)
GROUP BY CAST(i.DataHoraPassagem AS DATE), i.StatusProcessamento
ORDER BY Data, StatusProcessamento;

-- 4.3 Resumo PIVOT de status por dia — T1051
SELECT 
    CAST(i.DataHoraPassagem AS DATE) AS Data,
    COUNT(*) AS Total,
    SUM(CASE WHEN i.StatusProcessamento = 'Triagem' THEN 1 ELSE 0 END) AS Triagem,
    SUM(CASE WHEN i.StatusProcessamento = 'Auditada' THEN 1 ELSE 0 END) AS Auditada,
    SUM(CASE WHEN i.StatusProcessamento = 'Exportada' THEN 1 ELSE 0 END) AS Exportada,
    SUM(CASE WHEN i.StatusProcessamento = 'Descartada' THEN 1 ELSE 0 END) AS Descartada,
    SUM(CASE WHEN i.StatusProcessamento NOT IN ('Triagem','Auditada','Exportada','Descartada') THEN 1 ELSE 0 END) AS OutroStatus
FROM TBInfracoes i
JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
WHERE e.Codigo = 'T1051'
  AND i.DataHoraPassagem >= '2026-05-23 00:00:00'
  AND i.DataHoraPassagem < '2026-05-28 00:00:00'
  AND (i.IsDeleted IS NULL OR i.IsDeleted = 0)
GROUP BY CAST(i.DataHoraPassagem AS DATE)
ORDER BY Data;


-- ============================================================================
-- PARTE 5: TRIAGEM (TBTriagens) — Decisões tomadas
-- ============================================================================

-- 5.1 Triagens realizadas no período — T1051
SELECT 
    CAST(i.DataHoraPassagem AS DATE) AS DataInfracao,
    COUNT(*) AS TotalTriagens,
    SUM(CASE WHEN t.MotivoDescarte_id IS NOT NULL THEN 1 ELSE 0 END) AS Descartadas,
    SUM(CASE WHEN t.MotivoDescarte_id IS NULL AND t.InicioTriagem IS NOT NULL THEN 1 ELSE 0 END) AS Validadas,
    SUM(CASE WHEN t.DescarteAutomatico = 1 THEN 1 ELSE 0 END) AS DescarteAutomatico
FROM TBInfracoes i
JOIN TBTriagens t ON i.Id = t.Id
JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
WHERE e.Codigo = 'T1051'
  AND i.DataHoraPassagem >= '2026-05-23 00:00:00'
  AND i.DataHoraPassagem < '2026-05-28 00:00:00'
GROUP BY CAST(i.DataHoraPassagem AS DATE)
ORDER BY DataInfracao;

-- 5.2 Infrações SEM registro em TBTriagens (nunca triadas) — T1051
SELECT 
    CAST(i.DataHoraPassagem AS DATE) AS Data,
    COUNT(*) AS InfracoesSemTriagem
FROM TBInfracoes i
JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
LEFT JOIN TBTriagens t ON i.Id = t.Id
WHERE e.Codigo = 'T1051'
  AND i.DataHoraPassagem >= '2026-05-23 00:00:00'
  AND i.DataHoraPassagem < '2026-05-28 00:00:00'
  AND t.Id IS NULL
  AND (i.IsDeleted IS NULL OR i.IsDeleted = 0)
GROUP BY CAST(i.DataHoraPassagem AS DATE)
ORDER BY Data;


-- ============================================================================
-- PARTE 6: DE-PARA COMPLETO — Comparação Fluxo × Infrações × Triagem
-- ============================================================================

-- 6.1 Consolidação T1051 — Todas as camadas por dia
SELECT 
    datas.Data,
    ISNULL(pass.TotalPassagens, 0) AS Passagens_TBPassagens,
    ISNULL(conj.TotalImagens, 0) AS Imagens_TBPassagensConjugadas,
    ISNULL(conj.GeraramInfracao, 0) AS Imagens_ComInfracao,
    ISNULL(infr.TotalInfracoes, 0) AS Total_TBInfracoes,
    ISNULL(infr.StatusTriagem, 0) AS Infracoes_EmTriagem,
    ISNULL(infr.StatusDescartada, 0) AS Infracoes_Descartadas,
    ISNULL(infr.StatusExportada, 0) AS Infracoes_Exportadas,
    ISNULL(tria.TotalTriadas, 0) AS Registros_TBTriagens
FROM (
    SELECT CAST('2026-05-23' AS DATE) AS Data
    UNION SELECT '2026-05-24'
    UNION SELECT '2026-05-25'
    UNION SELECT '2026-05-26'
    UNION SELECT '2026-05-27'
) datas
LEFT JOIN (
    SELECT CAST(p.DataHoraPassagem AS DATE) AS Data, COUNT(*) AS TotalPassagens
    FROM TBPassagens p
    JOIN TBEquipamentos e ON p.Equipamento_id = e.Id
    WHERE e.Codigo = 'T1051'
      AND p.DataHoraPassagem >= '2026-05-23' AND p.DataHoraPassagem < '2026-05-28'
    GROUP BY CAST(p.DataHoraPassagem AS DATE)
) pass ON datas.Data = pass.Data
LEFT JOIN (
    SELECT CAST(pc.DataHoraPassagem AS DATE) AS Data, 
           COUNT(*) AS TotalImagens,
           SUM(CASE WHEN pc.FoiGeradaInfracao = 1 THEN 1 ELSE 0 END) AS GeraramInfracao
    FROM TBPassagensConjugadas pc
    JOIN TBEquipamentos e ON pc.Equipamento_id = e.Id
    WHERE e.Codigo = 'T1051'
      AND pc.DataHoraPassagem >= '2026-05-23' AND pc.DataHoraPassagem < '2026-05-28'
    GROUP BY CAST(pc.DataHoraPassagem AS DATE)
) conj ON datas.Data = conj.Data
LEFT JOIN (
    SELECT CAST(i.DataHoraPassagem AS DATE) AS Data,
           COUNT(*) AS TotalInfracoes,
           SUM(CASE WHEN i.StatusProcessamento = 'Triagem' THEN 1 ELSE 0 END) AS StatusTriagem,
           SUM(CASE WHEN i.StatusProcessamento = 'Descartada' THEN 1 ELSE 0 END) AS StatusDescartada,
           SUM(CASE WHEN i.StatusProcessamento = 'Exportada' THEN 1 ELSE 0 END) AS StatusExportada
    FROM TBInfracoes i
    JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
    WHERE e.Codigo = 'T1051'
      AND i.DataHoraPassagem >= '2026-05-23' AND i.DataHoraPassagem < '2026-05-28'
      AND (i.IsDeleted IS NULL OR i.IsDeleted = 0)
    GROUP BY CAST(i.DataHoraPassagem AS DATE)
) infr ON datas.Data = infr.Data
LEFT JOIN (
    SELECT CAST(i.DataHoraPassagem AS DATE) AS Data, COUNT(*) AS TotalTriadas
    FROM TBInfracoes i
    JOIN TBTriagens t ON i.Id = t.Id
    JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
    WHERE e.Codigo = 'T1051'
      AND i.DataHoraPassagem >= '2026-05-23' AND i.DataHoraPassagem < '2026-05-28'
    GROUP BY CAST(i.DataHoraPassagem AS DATE)
) tria ON datas.Data = tria.Data
ORDER BY datas.Data;


-- ============================================================================
-- PARTE 7: VALIDAR BUG DO FILTRO DE EQUIPAMENTO NA TRIAGEM
-- ============================================================================

-- 7.1 Verificar a query que a tela de Triagem usa
-- Rodar no backend: interceptar a query SQL enviada ao filtrar por equipamento
-- Possível causa: o parâmetro equipamentoIds NÃO está no WHERE

-- 7.2 Simular o que a tela DEVERIA retornar (T1051 apenas)
SELECT 
    CAST(i.DataHoraPassagem AS DATE) AS DataInfracao,
    SUM(CASE WHEN i.StatusProcessamento = 'Triagem' THEN 1 ELSE 0 END) AS Triagem,
    SUM(CASE WHEN i.StatusProcessamento IN ('Triagem') 
             AND t.MotivoDescarte_id IS NOT NULL THEN 1 ELSE 0 END) AS Reavaliar,
    SUM(CASE WHEN i.StatusProcessamento = 'Descartada' THEN 1 ELSE 0 END) AS Descartadas,
    SUM(CASE WHEN i.StatusProcessamento IN ('Auditada','Exportada') THEN 1 ELSE 0 END) AS Processadas
FROM TBInfracoes i
LEFT JOIN TBTriagens t ON i.Id = t.Id
JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
WHERE e.Codigo = 'T1051'
  AND i.DataHoraPassagem >= '2026-05-23 00:00:00'
  AND i.DataHoraPassagem < '2026-05-28 00:00:00'
  AND (i.IsDeleted IS NULL OR i.IsDeleted = 0)
GROUP BY CAST(i.DataHoraPassagem AS DATE)
ORDER BY DataInfracao;

-- 7.3 Comparar com TODOS os equipamentos (simula tela sem filtro)
SELECT 
    CAST(i.DataHoraPassagem AS DATE) AS DataInfracao,
    SUM(CASE WHEN i.StatusProcessamento = 'Triagem' THEN 1 ELSE 0 END) AS Triagem,
    SUM(CASE WHEN i.StatusProcessamento = 'Descartada' THEN 1 ELSE 0 END) AS Descartadas,
    SUM(CASE WHEN i.StatusProcessamento IN ('Auditada','Exportada') THEN 1 ELSE 0 END) AS Processadas,
    COUNT(*) AS Total
FROM TBInfracoes i
WHERE i.DataHoraPassagem >= '2026-05-23 00:00:00'
  AND i.DataHoraPassagem < '2026-05-28 00:00:00'
  AND (i.IsDeleted IS NULL OR i.IsDeleted = 0)
GROUP BY CAST(i.DataHoraPassagem AS DATE)
ORDER BY DataInfracao;

-- 7.4 Se 7.2 ≠ 7.3, então filtro por equipamento FUNCIONA no SQL
--     O BUG está no frontend (select2 não envia o parâmetro)
-- Se 7.2 = 7.3, há outro problema (todas infrações com mesmo equipamento?)


-- ============================================================================
-- PARTE 8: VALIDAR COLUNA "INFRAÇÕES" DO RELATÓRIO DE FLUXO DIÁRIO
-- ============================================================================

-- 8.1 O que o Fluxo Diário conta como "Infrações"?
-- Hipótese A: Conta de TBPassagensConjugadas WHERE FoiGeradaInfracao = 1
SELECT 
    CAST(pc.DataHoraPassagem AS DATE) AS Data,
    f.NumeroFaixa AS Faixa,
    SUM(CASE WHEN pc.FoiGeradaInfracao = 1 THEN 1 ELSE 0 END) AS Infracoes_Hipotese_A
FROM TBPassagensConjugadas pc
JOIN TBEquipamentos e ON pc.Equipamento_id = e.Id
JOIN TBFaixas fx ON pc.Faixa_id = fx.Id
CROSS APPLY (SELECT NumeroFaixa = CAST(fx.NumeroFaixa AS VARCHAR)) f
WHERE e.Codigo = 'T1051'
  AND pc.DataHoraPassagem >= '2026-05-23' AND pc.DataHoraPassagem < '2026-05-28'
GROUP BY CAST(pc.DataHoraPassagem AS DATE), f.NumeroFaixa
ORDER BY Data, Faixa;

-- 8.2 Hipótese B: Conta de TBInfracoes (apenas velocidade?)
SELECT 
    CAST(i.DataHoraPassagem AS DATE) AS Data,
    i.TipoInfracao,
    COUNT(*) AS Quantidade
FROM TBInfracoes i
JOIN TBEquipamentos e ON i.Equipamento_id = e.Id
WHERE e.Codigo = 'T1051'
  AND i.DataHoraPassagem >= '2026-05-23' AND i.DataHoraPassagem < '2026-05-28'
  AND (i.IsDeleted IS NULL OR i.IsDeleted = 0)
GROUP BY CAST(i.DataHoraPassagem AS DATE), i.TipoInfracao
ORDER BY Data, TipoInfracao;

-- 8.3 Comparar resultado de 8.1 com dados do relatório PDF:
-- Esperado (conforme relatório visual):
-- 23/05: Fx2=5, Fx3=15 (total 20)
-- 24/05: Fx2=3, Fx3=13 (total 16)
-- 25/05: Fx2=7, Fx3=12 (total 19)
-- 26/05: Fx2=6, Fx3=13 (total 19)
-- 27/05: Fx2=2, Fx3=0  (total 2)
-- TOTAL: 76


-- ============================================================================
-- PARTE 9: VERIFICAR PERMISSÕES / HasAccessEquipment
-- ============================================================================

-- 9.1 Verificar se o usuário logado tem restrição de grupo
DECLARE @userId UNIQUEIDENTIFIER = NULL; -- Preencher com ID do usuário Administrador

SELECT 
    u.Nome,
    u.Login,
    uge.GrupoEquipamento_id,
    ge.Nome AS NomeGrupo
FROM TBUsuarios u
LEFT JOIN TBUsuariosGrupoEquipamentos uge ON u.Id = uge.Usuario_id
LEFT JOIN TBGrupoEquipamentos ge ON uge.GrupoEquipamento_id = ge.Id
WHERE u.Login = 'Administrador'; -- ou o login usado no teste

-- 9.2 Se retornar VAZIO em GrupoEquipamento_id → usuário tem acesso a TUDO
-- Se retornar grupo(s) → só vê equipamentos desses grupos


-- ============================================================================
-- PARTE 10: VERIFICAR CONTROLLER/API DA TRIAGEM
-- ============================================================================

/*
AÇÃO PARA O DESENVOLVEDOR:

1. Localizar o Controller de Triagem no código-fonte (.NET/C#):
   - Provável: TriagemController.cs ou InfracoesController.cs
   - Endpoint: GET/POST /triagem ou /api/triagem/listar

2. Verificar se o parâmetro "equipamentoIds" é recebido e usado:
   
   [HttpPost]
   public async Task<IActionResult> Filtrar(TriagemFiltroViewModel filtro)
   {
       // VERIFICAR: filtro.EquipamentoIds está preenchido?
       // VERIFICAR: O WHERE inclui filtro por equipamento?
       
       var query = _context.TBInfracoes.AsQueryable();
       
       // BUG PROVÁVEL: esta linha pode estar comentada ou ausente:
       if (filtro.EquipamentoIds != null && filtro.EquipamentoIds.Any())
           query = query.Where(i => filtro.EquipamentoIds.Contains(i.Equipamento_id));
   }

3. Verificar o JavaScript/View da tela de Triagem:
   - O select2 de equipamentos está no form que faz POST?
   - O name do select2 bate com o ViewModel (equipamentoIds)?
   - O atributo "multiple" está presente no <select>?

4. Verificar no DevTools (F12 → Network):
   - Ao clicar "Filtrar", qual payload é enviado?
   - O campo equipamentoIds está presente no body?
   - Se sim com valor correto → bug é no backend
   - Se não → bug é no frontend (select2 binding)
*/


-- ============================================================================
-- PARTE 11: CHECKLIST DE VALIDAÇÃO FINAL
-- ============================================================================

/*
CHECKLIST — Executar queries e preencher:

□ Query 2.1: TBPassagens T1051 23-27/05 
  Total passagens: _______
  Com Infracao_id: _______

□ Query 3.1: TBPassagensConjugadas T1051
  Total imagens: _______
  FoiGeradaInfracao=1: _______

□ Query 4.3: TBInfracoes T1051 (pivot)
  Total infrações: _______
  Em Triagem: _______
  Descartadas: _______
  Exportadas: _______

□ Query 7.2: Simulação filtro T1051
  Triagem: _______
  Descartadas: _______
  Processadas: _______

□ Query 7.3: Sem filtro (todos equipamentos)
  Triagem: _______
  Descartadas: _______
  Processadas: _______

□ 7.2 = 7.3? 
  Se SIM → Bug: todas infrações tem mesmo Equipamento_id (dados)
  Se NÃO → Bug: frontend não envia filtro (código)

□ Query 8.1 vs dados do relatório PDF:
  Bate com 76 infrações? ____
  Se SIM → coluna "Infrações" = FoiGeradaInfracao de TBPassagensConjugadas
  Se NÃO → outra fonte

CONCLUSÃO:
- [ ] Pipeline OK, bug é apenas visual (filtro frontend)
- [ ] Pipeline com falha: infrações não entram na TBInfracoes
- [ ] Pipeline OK mas backlog operacional (analistas não triando)
*/
