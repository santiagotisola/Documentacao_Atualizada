$outputPath = "C:\Users\Santiago\Axiondocs\Axion.Docs\pdfs\Diagnostico-Tecnico-IMEPI-2026-05-08.docx"
$null = New-Item -ItemType Directory -Path "C:\Users\Santiago\Axiondocs\Axion.Docs\pdfs" -Force

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()
$sel = $word.Selection

function AddH1($text) {
    $sel.Style = $doc.Styles["Heading 1"]
    $sel.TypeText($text); $sel.TypeParagraph()
}
function AddH2($text) {
    $sel.Style = $doc.Styles["Heading 2"]
    $sel.TypeText($text); $sel.TypeParagraph()
}
function AddH3($text) {
    $sel.Style = $doc.Styles["Heading 3"]
    $sel.TypeText($text); $sel.TypeParagraph()
}
function AddP($text) {
    $sel.Style = $doc.Styles["Normal"]
    $sel.TypeText($text); $sel.TypeParagraph()
}
function AddTable($headers, $rows, $widths) {
    $nr = $rows.Count + 1; $nc = $headers.Count
    $range = $sel.Range
    $tbl = $doc.Tables.Add($range, $nr, $nc)
    $tbl.Borders.Enable = $true
    for ($c = 0; $c -lt $nc; $c++) {
        $cell = $tbl.Cell(1, $c+1)
        $cell.Range.Text = $headers[$c]
        $cell.Range.Font.Bold = $true
        $cell.Range.Font.Size = 9
        $cell.Range.ParagraphFormat.Alignment = 1
        $cell.Shading.BackgroundPatternColor = 4210752
    }
    for ($r = 0; $r -lt $rows.Count; $r++) {
        for ($c = 0; $c -lt $nc; $c++) {
            $cell = $tbl.Cell($r+2, $c+1)
            $cell.Range.Text = $rows[$r][$c]
            $cell.Range.Font.Size = 9
        }
    }
    if ($widths) {
        for ($c = 0; $c -lt $nc; $c++) {
            $tbl.Columns($c+1).Width = $word.CentimetersToPoints($widths[$c])
        }
    }
    $sel.Start = $tbl.Range.End
    $sel.TypeParagraph()
}

# -- Margens
$doc.PageSetup.TopMargin    = $word.CentimetersToPoints(2.5)
$doc.PageSetup.BottomMargin = $word.CentimetersToPoints(2.0)
$doc.PageSetup.LeftMargin   = $word.CentimetersToPoints(2.5)
$doc.PageSetup.RightMargin  = $word.CentimetersToPoints(2.0)

# -- Titulo
AddH1 "Diagnostico Tecnico - Divergencia de Dados de Proprietario"
AddP "Sistema: AxHub - IMEPI"
AddP "Data: 08 de maio de 2026"
AddP "Elaborado por: Axion Tecnologia"
AddP ""

# -- 1. Contexto
AddH2 "1. Contexto"
AddP "O IMEPI identificou mais de 120 autos de infracoes com inconsistencias nos dados de proprietario dos veiculos. Foi realizada analise tecnica completa das configuracoes do sistema em producao em 08/05/2026 (https://imepi.axhub.axion.ws/configuracao)."
AddP ""

# -- 2. Configuracao
AddH2 "2. Configuracao Atual do Sistema"

AddH3 "2.1 Orgao e Entidade"
$h = @("Campo","Valor Configurado")
$r = @(
    @("Nome do Orgao Autuador","INSTITUTO DE METROLOGIA DO ESTADO DO PIAUI - IMEPI"),
    @("Codigo do Orgao (SNT)","127200"),
    @("Nome da Entidade","LABOR ENGENHARIA E TECNOLOGIA LTDA"),
    @("Codigo da Entidade","001"),
    @("CNPJ","41.522.079/0001-06"),
    @("Endereco","Av. Barao de Gurgueia, 3336 - Bairro Tabuleta, Teresina/PI"),
    @("CEP","64.018-450"),
    @("Telefone","(86) 3229-2612"),
    @("Gestor Geral","(nao preenchido)"),
    @("Cargo do Gestor","(nao preenchido)")
)
AddTable $h $r @(6,11)

AddH3 "2.2 Integracoes - Foco do Problema"
$h = @("Campo","Valor Configurado","Status")
$r = @(
    @("Tipo de Exportacao","ExportacaoInfracaoInmetro","OK"),
    @("Limite por lote","200 infracoes","OK"),
    @("Base Consulta de Veiculo","serpro-imperatriz","ATENCAO - Verificar"),
    @("Base Consulta Exportacao","serpro-imperatriz","ATENCAO - Verificar"),
    @("Consumer Key SerproRadar","(VAZIO)","CRITICO"),
    @("Consumer Secret SerproRadar","(VAZIO)","CRITICO"),
    @("Escopo SerproRadar","(VAZIO)","CRITICO"),
    @("BH PRO Usuario/Senha","(nao utilizado)","N/A"),
    @("BH PRO Homologacao","Desmarcado - Producao","OK"),
    @("Client Id Inmetro","61","OK"),
    @("Client Secret Inmetro","Preenchido","OK"),
    @("Inmetro Homologacao","Desmarcado - Producao","OK")
)
AddTable $h $r @(5.5,7.5,4)

AddH3 "2.3 Triagem"
$h = @("Campo","Valor","Status")
$r = @(
    @("Prazo para Triagem","20 dias","OK"),
    @("Tempo de Analise de Imagem","5 minutos","OK"),
    @("Tempo de Infracao Duplicada","1 minuto","OK"),
    @("Alerta velocidade acima de","100 km/h","OK"),
    @("Tipo Imagem Lado Esquerdo","ZT","OK"),
    @("Tipo Imagem Lado Direito","P1","OK"),
    @("Motivo de Descarte Padrao","001 - OK","OK"),
    @("Possui Auditoria","Desabilitado","ATENCAO"),
    @("Exigir Modelo/Marca na triagem","Habilitado","OK"),
    @("Exigir Codigo Externo Marca/Modelo","Desabilitado","--"),
    @("Exibir Imagem de Perfil","Desabilitado","--"),
    @("Classificacao por I.A.","Habilitada","OK")
)
AddTable $h $r @(7,5,5)

AddH3 "2.4 Importacao e Temporizadores"
$h = @("Campo","Valor")
$r = @(
    @("Limite horas importar Infracoes","720h (30 dias)"),
    @("Limite horas importar Passagens","720h (30 dias)"),
    @("Timeout Heartbeat","10 minutos"),
    @("Enquadramentos Cronotacografo","2"),
    @("Limite Tempo Interrupcao","1 hora"),
    @("Limite Tempo Equipamento Conjugado","3 minutos")
)
AddTable $h $r @(9,8)

AddH3 "2.5 Medicao"
$h = @("Campo","Valor")
$r = @(
    @("Percentual de Discrepancia","30%"),
    @("Fator de Medicao - Infracao","Desabilitado (ATENCAO)"),
    @("Fator de Medicao - Passagem","Habilitado"),
    @("Fator de Medicao - Imagem Teste","Desabilitado"),
    @("Fator de Medicao - OCR","Habilitado")
)
AddTable $h $r @(9,8)

# -- 3. Origem dos dados
AddH2 "3. Origem dos Dados de Proprietario"
AddP "O AxHub NAO gera, calcula nem interpreta dados de proprietario. O fluxo completo e:"
AddP "  1. O equipamento captura a placa do veiculo"
AddP "  2. No processamento do lote, o sistema envia a placa ao webservice configurado (SERPRO)"
AddP "  3. O retorno e gravado integralmente na tabela TBVeiculos"
AddP "  4. Os campos NomeProprietario, CpfCnpj e endereco sao lidos diretamente desse registro"
AddP ""
$h = @("Campo no banco","Descricao")
$r = @(
    @("TBVeiculos.NomeProprietario","Nome retornado pelo webservice"),
    @("TBVeiculos.CpfCnpj","CPF/CNPJ retornado pelo webservice"),
    @("TBVeiculos.WebServiceConsultado","Identificacao do webservice (SERPRO, XTRAFIC, etc.)"),
    @("TBVeiculos.DataHoraConsulta","Timestamp exato da consulta ao webservice")
)
AddTable $h $r @(7,10)

# -- 4. Causa raiz
AddH2 "4. Causa Raiz Identificada"
AddP "A analise da aba Integracoes revelou que as credenciais de autenticacao para a API do SERPRO estao completamente ausentes:"
AddP ""
$h = @("Credencial","Estado Atual","Efeito")
$r = @(
    @("Consumer Key SerproRadar","NAO PREENCHIDO","Autenticacao na API do SERPRO falha"),
    @("Consumer Secret SerproRadar","NAO PREENCHIDO","Token de acesso nao pode ser gerado"),
    @("Escopo SerproRadar","NAO PREENCHIDO","Permissoes de consulta nao definidas")
)
AddTable $h $r @(5.5,4,7.5)
AddP "Sem credenciais validas, cada requisicao ao SERPRO retorna erro de autenticacao. O sistema entao nao atualiza o registro do proprietario, mantendo o dado anterior - que pode ser de uma consulta realizada antes de uma transferencia de propriedade, ou simplesmente nulo."
AddP ""
AddP "Adicionalmente, a base configurada 'serpro-imperatriz' e regional e deve ter sua atividade confirmada junto ao SERPRO."

# -- 5. Pontos de atencao
AddH2 "5. Pontos de Atencao"
$h = @("#","Prioridade","Ponto","Impacto")
$r = @(
    @("1","CRITICO","Consumer Key, Secret e Escopo do SerproRadar vazios","Causa direta dos 120+ autos com proprietario divergente"),
    @("2","ATENCAO","Base serpro-imperatriz - verificar atividade","Se descontinuada, consultas falham mesmo com credenciais"),
    @("3","ATENCAO","Auditoria desabilitada","Infracoes nao passam por segunda revisao - risco de erros nao detectados"),
    @("4","ATENCAO","Fator de Medicao para Infracao desabilitado","Infracoes nao entram no calculo de fator de medicao contratual"),
    @("5","INFO","Gestor Geral nao cadastrado","Pode afetar geracao de documentos oficiais")
)
AddTable $h $r @(1.2,2.5,6.5,6.5)

# -- 6. Query SQL
AddH2 "6. Query SQL para Diagnostico dos Autos Divergentes"
AddP "Executar no SQL Server de producao do IMEPI, substituindo os numeros dos autos na clausula IN:"
AddP ""
$sel.Style = $doc.Styles["Normal"]
$sel.Font.Name = "Courier New"
$sel.Font.Size = 8
$sql = "SELECT`r`n    i.NumeroAuto AS [Auto],`r`n    i.PlacaVeiculo AS [Placa],`r`n    i.DataHoraPassagem AS [Data da Infracao],`r`n    v.NomeProprietario AS [Proprietario no Auto],`r`n    v.CpfCnpj AS [CPF/CNPJ],`r`n    v.WebServiceConsultado AS [WebService Utilizado],`r`n    v.DataHoraConsulta AS [Data da Consulta ao WS]`r`nFROM TBInfracoes i`r`nINNER JOIN TBVeiculos v ON v.Infracao_id = i.Id`r`nWHERE i.NumeroAuto IN (`r`n    /* inserir aqui os numeros dos autos */<`r`n)`r`nORDER BY i.DataHoraPassagem;"
$sel.TypeText($sql)
$sel.Font.Name = "Calibri"
$sel.Font.Size = 11
$sel.TypeParagraph()

# -- 7. Plano de acao
AddH2 "7. Plano de Acao"
$h = @("#","Responsavel","Acao","Prazo")
$r = @(
    @("1","LABOR","Solicitar ao SERPRO as credenciais validas (Consumer Key, Secret, Escopo) para a base serpro-imperatriz","Imediato"),
    @("2","LABOR","Confirmar com SERPRO se base serpro-imperatriz esta ativa para PI","Imediato"),
    @("3","Axion","Inserir credenciais em Configuracoes > Integracoes > Serpro e salvar","Apos receber credenciais"),
    @("4","Axion","Validar com consulta de teste que as queries ao SERPRO estao retornando com sucesso","Apos configuracao"),
    @("5","Axion","Executar reconsulta dos 120+ autos identificados pelo IMEPI","Apos validacao"),
    @("6","IMEPI","Validar amostra dos autos reprocessados e confirmar correcao dos dados","Apos reprocessamento"),
    @("7","Axion/LABOR","Avaliar reabilitacao da Auditoria e Fator de Medicao para Infracao","Alinhamento conjunto")
)
AddTable $h $r @(0.8,2.5,9.5,3.5)

# -- 8. Responsabilidades
AddH2 "8. Definicao de Responsabilidades"
$h = @("Responsavel","Escopo")
$r = @(
    @("Axion Tecnologia","Garantir armazenamento fiel do retorno do webservice. Configurar credenciais. Reprocessar autos apos configuracao."),
    @("LABOR Engenharia","Providenciar credenciais do SERPRO. Confirmar atividade da base regional serpro-imperatriz."),
    @("SERPRO","Qualidade, atualizacao e SLA da base de dados de proprietarios. Disponibilizar credenciais validas."),
    @("DETRAN/RENAINF","Base de origem dos dados cadastrais. Atualizacoes de transferencias de propriedade."),
    @("IMEPI","Validar resultados apos reprocessamento. Definir prazo de regularizacao.")
)
AddTable $h $r @(4,13)

# -- 9. Conclusao
AddH2 "9. Conclusao"
AddP "A causa raiz das divergencias de proprietario nos 120+ autos do IMEPI e a ausencia das credenciais de autenticacao do SERPRO (Consumer Key, Consumer Secret e Escopo) nas configuracoes do sistema AxHub em producao."
AddP ""
AddP "O sistema Axion opera corretamente: armazena exatamente o que o webservice retorna. Sem credenciais validas, as consultas falham e o dado de proprietario nao e atualizado. A responsabilidade pela regularizacao e compartilhada entre LABOR (providenciar credenciais) e Axion (aplicar configuracao e reprocessar os autos)."
AddP ""
AddP "Apos configuracao e reprocessamento, os autos passarao a refletir os dados atuais da base SERPRO, resolvendo as inconsistencias reportadas."

# -- Salvar
$doc.SaveAs([ref]$outputPath, [ref]16)
$doc.Close()
$word.Quit()
Write-Host "[OK] Documento gerado: $outputPath"
Start-Process $outputPath
