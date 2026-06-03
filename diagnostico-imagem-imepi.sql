-- ═══════════════════════════════════════════════════════════════════════════════
-- DIAGNÓSTICO: Imagem Quebrada na Triagem Cronotacógrafos — IMEPI
-- Site: imepi.axhub.axion.ws
-- Placa: PF1SE14 | Endereço: PO0075-2 - BR-316 Km 294+600
-- Data: 29/05/2026
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══ PASSO 1: Localizar a passagem pelo filtro da tela ═══
-- (A URL mostra datasHorasPassagens=26/05/2026 00:00 e dataHoraFim=29/05/2026 12:00)
SELECT TOP 10
    p.Id,
    p.PlacaVeiculo,
    p.DataHoraPassagem,
    p.StatusProcessamento,
    p.VelocidadeMedida,
    p.VelocidadeConsiderada,
    p.Equipamento_id,
    p.LoteImportacao_id
FROM TBPassagensCronotacografos p
WHERE p.PlacaVeiculo = 'PF1SE14'
  AND p.DataHoraPassagem >= '2026-05-26'
  AND p.DataHoraPassagem <= '2026-05-29 12:00'
ORDER BY p.DataHoraPassagem DESC;

-- ═══ PASSO 2: Verificar se existem imagens vinculadas à passagem ═══
SELECT 
    img.Id AS ImagemId,
    img.PassagemCronotacografo_id,
    img.NomeImagem,
    img.Caminho,
    img.TipoImagem_id,
    img.AssinaturaHash,
    img.DataCriacao
FROM TBImagemPassagensCronotacografos img
INNER JOIN TBPassagensCronotacografos p 
    ON img.PassagemCronotacografo_id = p.Id
WHERE p.PlacaVeiculo = 'PF1SE14'
  AND p.DataHoraPassagem >= '2026-05-26'
  AND p.DataHoraPassagem <= '2026-05-29 12:00';

-- ═══ PASSO 3: Verificar se o fabricante usa imagem criptografada ═══
SELECT 
    f.Id,
    f.Nome AS Fabricante,
    f.ImagemCriptografada,
    f.CodigoFabricante,
    f.Certificado IS NOT NULL AS TemCertificado
FROM TBFabricantes f
INNER JOIN TBEquipamentos e ON e.Fabricante_id = f.Id
INNER JOIN TBPassagensCronotacografos p ON p.Equipamento_id = e.Id
WHERE p.PlacaVeiculo = 'PF1SE14'
  AND p.DataHoraPassagem >= '2026-05-26';

-- ═══ PASSO 4: Estatísticas gerais — quantas passagens SEM imagem? ═══
SELECT 
    'Total Passagens (período)' AS Metrica,
    COUNT(*) AS Valor
FROM TBPassagensCronotacografos p
WHERE p.DataHoraPassagem >= '2026-05-26'
  AND p.DataHoraPassagem <= '2026-05-29 12:00'
UNION ALL
SELECT 
    'Passagens COM imagem' AS Metrica,
    COUNT(DISTINCT img.PassagemCronotacografo_id) AS Valor
FROM TBImagemPassagensCronotacografos img
INNER JOIN TBPassagensCronotacografos p 
    ON img.PassagemCronotacografo_id = p.Id
WHERE p.DataHoraPassagem >= '2026-05-26'
  AND p.DataHoraPassagem <= '2026-05-29 12:00'
UNION ALL
SELECT 
    'Passagens SEM imagem' AS Metrica,
    COUNT(*) AS Valor
FROM TBPassagensCronotacografos p
WHERE p.DataHoraPassagem >= '2026-05-26'
  AND p.DataHoraPassagem <= '2026-05-29 12:00'
  AND NOT EXISTS (
      SELECT 1 FROM TBImagemPassagensCronotacografos img 
      WHERE img.PassagemCronotacografo_id = p.Id
  );

-- ═══ PASSO 5: Verificar caminhos de imagem — padrões de path ═══
SELECT TOP 20
    img.Caminho,
    img.NomeImagem,
    LEN(img.Caminho) AS TamanhoCaminho,
    img.DataCriacao
FROM TBImagemPassagensCronotacografos img
ORDER BY img.DataCriacao DESC;

-- ═══ PASSO 6: Verificar lote de importação (pode indicar falha no upload) ═══
SELECT 
    li.Id,
    li.DataCriacao,
    li.CriadoPor,
    li.DataAtualizacao
FROM TBLoteImportacoes li
INNER JOIN TBPassagensCronotacografos p ON p.LoteImportacao_id = li.Id
WHERE p.PlacaVeiculo = 'PF1SE14'
  AND p.DataHoraPassagem >= '2026-05-26';

-- ═══ PASSO 7: Verificar se imagens recentes (de outras placas) carregam ═══
-- Se TODAS estão sem imagem, é problema sistêmico (disco/rede/upload)
-- Se SOMENTE esta placa está sem, é pontual
SELECT TOP 5
    p.PlacaVeiculo,
    p.DataHoraPassagem,
    img.Caminho,
    img.NomeImagem
FROM TBPassagensCronotacografos p
INNER JOIN TBImagemPassagensCronotacografos img 
    ON img.PassagemCronotacografo_id = p.Id
WHERE p.DataHoraPassagem >= '2026-05-26'
ORDER BY p.DataHoraPassagem DESC;
