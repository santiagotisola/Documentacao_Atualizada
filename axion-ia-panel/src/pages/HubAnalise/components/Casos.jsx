import { useState, useEffect } from 'react';

const CASOS = [
  // ─── CASO 1 ───────────────────────────────────────────────────────────────
  {
    id: 'CASO-2026-001',
    titulo: 'Inconsistência de Imagens no SGI — Lote 143 / Cronotacógrafo Fiscal 4.0',
    status: 'em_investigacao',
    prioridade: 'alta',
    dataOcorrencia: '16/07/2026',
    dataReporte: '17/07/2026',
    sistema: 'SGI / AxHub ITPS (itps.axhub.axion.ws)',
    origem: 'INMETRO-ITPS — Gerência Executiva de Metrologia e Qualidade Industrial',
    responsavel: 'TI LABOR + TI INMETRO',
    tags: ['SGI', 'Lote 143', 'Cronotacógrafo', 'CRONO VENCIDO', 'SSL', 'SignalR', 'ITPS', 'Enq. 29000'],
    resumo: 'O INMETRO-ITPS reportou que em 16/07/2026 um grande volume de imagens de anos anteriores relativas a fiscalizações 4.0 de cronotacógrafos apareceram com status INCONSISTÊNCIA no SGI. O Lote 143 (AUTOINFRACAO-2023-10-30) contém 2 infrações de cronotacógrafo com certificado vencido (Enq. 29000) capturadas em 30/10/2023, com Sequencial Infração = 0 e Data de Processamento em branco — indicando que nunca foram efetivamente processadas no SGI. Análise ao vivo do AxHub revelou falha crítica de SSL no serviço processador (itps.processor.axion.ws) e conexão SignalR inoperante.',

    lote: {
      numero: 143,
      dataGeracao: '30/10/2023 12:24:51',
      dataInicial: '30/10/2023',
      dataFinal: '30/10/2023',
      qtdRegistros: 2,
      qtdExportados: 2,
      status: 'Ok (AxHub) / INCONSISTÊNCIA (SGI)',
      tipo: 'Cronotacógrafo',
      arquivo: 'ExportacaoPdf/Cronotacografo/202310/AUTOINFRACAO-2023-10-30-2023-10-30-000143.zip',
      mensagem: 'Exportação finalizada em 30/10/2023 12:24',
    },

    infracoes: [
      {
        id: '331068',
        ait: 'CT00016534',
        datahora: '30/10/2023 10:48:06',
        placa: 'KQJ4259',
        faixa: 'SE047L-2',
        sentido: 'Simão Dias → Lagarto',
        endereco: 'SE-270 Km 89+150m — Simão Dias',
        enquadramento: '29000 — CRONOTACÓGRAFO COM CERTIFICADO VENCIDO OU NÃO VERIFICADO',
        base_legal: 'Art. 2º Portaria INMETRO Nº 481/2021 — Item 6, Subitem 6.3.1, Alínea D',
        veiculo: 'M.BENZ/MPOLO VIALE U — Ônibus Branco 2007 (46 passageiros)',
        municipio: 'Nossa Senhora da Glória — SE',
        status_processamento: 'Processada',
        data_processamento: '—— (BLANK)',
        sequencial: '0 ⚠️',
        notificacoes: '25%',
        exportado: 'Sim',
        anomalias: ['Sequencial Infração = 0', 'Data de Processamento em branco', 'Notificações apenas 25%'],
      },
      {
        id: '331062',
        ait: 'CT00016533',
        datahora: '30/10/2023 10:47:00',
        placa: 'HZS7896',
        faixa: 'SE034R-2',
        sentido: 'N/D',
        endereco: 'SE-034',
        enquadramento: '29000 — CRONOTACÓGRAFO COM CERTIFICADO VENCIDO OU NÃO VERIFICADO',
        base_legal: 'Art. 2º Portaria INMETRO Nº 481/2021 — Item 6, Subitem 6.3.1, Alínea D',
        veiculo: 'N/D',
        status_processamento: 'Processada',
        data_processamento: '—— (BLANK)',
        sequencial: '0 ⚠️',
        notificacoes: 'N/D',
        exportado: 'Sim',
        anomalias: ['Sequencial Infração = 0', 'Data de Processamento em branco'],
      },
    ],

    timeline: [
      { data: '30/10/2023 10:47–10:48', evento: 'Infrações 331062 e 331068 capturadas pelos equipamentos SE034R-2 e SE047L-2. Enquadramento 29000 — Cronotacógrafo com Certificado Vencido.', tipo: 'alerta' },
      { data: '30/10/2023 12:24:51', evento: 'Lote 143 gerado no AxHub com 2 registros. Arquivo AUTOINFRACAO-2023-10-30-2023-10-30-000143.zip criado. Status AxHub: Ok.', tipo: 'alerta' },
      { data: '30/10/2023 → 2026', evento: 'Registros ficam em estado "limbo": exportados no AxHub, mas Sequencial Infração = 0 e Data de Processamento em branco — nunca confirmados pelo SGI. Notificações travadas em 25%.', tipo: 'incidente' },
      { data: '26/06/2026', evento: 'Reunião proposta por Paulo de Tarso (ITPS): volume de imagens estava muito baixo. Possível indicativo de que o processador já estava com falha.', tipo: 'alerta' },
      { data: '~11–12/07/2026', evento: 'Queda brusca no gráfico Triagem Mensal do AxHub (Total Imagens, Total Descartes, Total Processadas chegam a zero). Coincide com possível expiração do certificado SSL do itps.processor.axion.ws.', tipo: 'incidente' },
      { data: '16/07/2026', evento: 'Equipe ITPS detecta INCONSISTÊNCIA no SGI para grande volume de imagens de anos anteriores. Lotes antigos como o 143 (Oct/2023) estão entre os afetados. INMETRO emite em lote para normalizar.', tipo: 'incidente' },
      { data: '17/07/2026', evento: 'E-mail formal ao Presidente do ITPS. Solicitação de esclarecimento à TI LABOR e TI INMETRO.', tipo: 'comunicado' },
      { data: '18/07/2026', evento: 'Análise ao vivo confirma: ERR_CERT_COMMON_NAME_INVALID em itps.processor.axion.ws, SignalR offline, dashboard com erros JavaScript. Lote 143 e infração 331068 analisados com anomalias confirmadas.', tipo: 'incidente' },
    ],

    evidenciasVivas: [
      { tipo: 'critico', icon: '🔴', titulo: 'Sequencial Infração = 0 nas infrações do Lote 143', detalhe: 'As infrações 331068 e 331062 têm Sequencial Infração = 0, indicando que o SGI nunca atribuiu número de sequencial — o registro foi enviado mas não processado com sucesso.' },
      { tipo: 'critico', icon: '🔴', titulo: 'Data de Processamento em branco', detalhe: 'Infração 331068 (e 331062) têm campo "Data de Processamento" vazio — o AxHub registrou como "Processada" mas a data de confirmação de processamento pelo SGI nunca foi recebida.' },
      { tipo: 'critico', icon: '🔴', titulo: 'SSL Inválido — itps.processor.axion.ws', detalhe: 'POST para https://itps.processor.axion.ws/hub/v1/dashboard/negotiate → ERR_CERT_COMMON_NAME_INVALID. O serviço processador tem certificado SSL com CN inválido, quebrando toda comunicação HTTPS/WSS com o SGI.' },
      { tipo: 'critico', icon: '🔴', titulo: 'SignalR completamente inoperante', detalhe: 'FailedToNegotiateWithServerError — a conexão WebSocket em tempo real entre o AxHub e o processor service está offline desde a falha de SSL.' },
      { tipo: 'alto', icon: '🟠', titulo: 'Notificações travadas em 25%', detalhe: 'Infração 331068 mostra Notificações = 25%. O processo de notificação no SGI tem 4 etapas; estar em 25% significa que apenas a 1ª etapa (Notificação de Autuação) foi concluída.' },
      { tipo: 'alto', icon: '🟠', titulo: 'Queda brusca no gráfico Triagem Mensal (~11/07/2026)', detalhe: 'O gráfico do dashboard AxHub mostra picos de volume no início de julho seguidos de queda abrupta para próximo de zero nos 3 indicadores (Total Imagens, Descartes, Processadas).' },
      { tipo: 'alto', icon: '🟠', titulo: 'TypeError no update do gráfico do Dashboard', detalhe: 'TypeError: Cannot read properties of undefined (reading "update") em itps.axhub.axion.ws/:2213 — falha na atualização dos dados visuais causada pela conexão quebrada com o processor.' },
      { tipo: 'medio', icon: '🟡', titulo: 'Google Maps API carregada duas vezes', detalhe: 'You have included the Google Maps JavaScript API multiple times — bug de carregamento duplo causando initMap is not a function e erros no mapa de equipamentos.' },
    ],

    hipoteses: [
      {
        id: 'H0',
        titulo: '⚠️ CONFIRMADO — Certificado SSL expirado no itps.processor.axion.ws',
        probabilidade: 'confirmado',
        descricao: 'O serviço processador tem certificado SSL com Common Name inválido. Isso quebra toda a comunicação HTTPS/WebSocket entre AxHub e o processor, e possivelmente a transmissão ao SGI que usa o mesmo host.',
        evidencias: ['ERR_CERT_COMMON_NAME_INVALID confirmado em 18/07/2026', 'Queda no gráfico Triagem Mensal coincide com possível expiração', 'FailedToNegotiateWithServerError em toda negociação SignalR'],
        acoes: ['🚨 URGENTE: Renovar/corrigir certificado SSL de itps.processor.axion.ws', 'Verificar se CN do cert corresponde ao domínio', 'Reiniciar serviço processor após renovação', 'Validar reconexão SignalR e retomada do pipeline'],
      },
      {
        id: 'H1',
        titulo: 'Registros em "limbo" — exportados no AxHub mas nunca confirmados pelo SGI',
        probabilidade: 'confirmado',
        descricao: 'Lote 143 e suas infrações têm Sequencial = 0 e Data de Processamento em branco. O AxHub criou o arquivo ZIP em 2023, mas o SGI nunca confirmou o recebimento. Os registros ficaram em estado ambíguo por ~3 anos.',
        evidencias: ['Sequencial Infração = 0 (deveria ter número sequencial do SGI)', 'Data de Processamento: BLANK', 'Notificações: 25% (apenas 1ª etapa)', 'Arquivo gerado em 30/10/2023 — mas sem confirmação'],
        acoes: ['Auditar todos os lotes com Sequencial = 0 desde 2022', 'Implementar verificação de confirmação obrigatória pós-envio ao SGI', 'Criar processo de reconciliação mensal AxHub × SGI', 'Corrigir status de "Processada" para diferenciar "enviada" de "confirmada"'],
      },
      {
        id: 'H2',
        titulo: 'Reenvio automático em massa em 16/07/2026 sem tratamento de data',
        probabilidade: 'alta',
        descricao: 'Em 16/07/2026, um processo de reenvio enviou registros pendentes ao SGI. O SGI recebeu registros de 2023 com data de captura de ~3 anos atrás e os marcou como INCONSISTÊNCIA pois fora da janela de validade.',
        evidencias: ['E-mail confirma: imagens enviadas ao SGI em 16/07/2026', 'Registros eram de "anos anteriores"', 'SGI marcou como INCONSISTÊNCIA — indica recepção mas rejeição de validade'],
        acoes: ['Verificar qual job/processo iniciou o reenvio em massa em 16/07/2026', 'Verificar janela de validade do SGI para aceite de registros antigos', 'Implementar filtro de data mínima antes de reenviar ao SGI'],
      },
      {
        id: 'H3',
        titulo: 'Equipamentos offline acumulando imagens sem conectividade',
        probabilidade: 'media',
        descricao: 'Equipamentos SE047L-2 e SE034R-2 podem ter passado por períodos de offline, acumulando imagens que foram transmitidas ao AxHub com atraso, criando o backlog que chegou ao SGI tarde.',
        evidencias: ['Volume baixo em jun/2026 sugerido na reunião de 26/06', 'Equipamentos SE047L e SE034R são pontos fixos de rodovia', 'Gráfico mostra picos e quedas intermitentes típicos de reconexão em lote'],
        acoes: ['Auditar logs de conectividade de SE047L e SE034R', 'Verificar se AxHub tem flag de "data captura" vs "data recebimento"', 'Criar alerta para equipamentos com gap > 72h sem envio'],
      },
    ],

    impacto: {
      operacional: 'Notificações de autuação de cronotacógrafo vencido (Enq. 29000) com INCONSISTÊNCIA no SGI significam que as autuações podem não ter sido efetivamente emitidas ao infrator — veículos pesados em situação irregular podem continuar circulando sem punição.',
      reputacional: 'INMETRO-ITPS acionou a presidência. A LABOR está sob questionamento. O sistema AxHub apresenta falhas críticas confirmadas (SSL, SignalR) indicando ausência de monitoramento proativo.',
      juridico: 'Infrações de 2023 em status INCONSISTÊNCIA podem ter prescrito — a janela legal para notificação de autuações de trânsito é de 30 dias. Registros com 3 anos sem confirmação de SGI podem ser nulos juridicamente.',
    },

    recomendacoes: [
      '🚨 IMEDIATO (0–24h): Renovar certificado SSL de itps.processor.axion.ws com CN correto',
      '🚨 IMEDIATO (0–24h): Verificar e restaurar conexão SignalR do processor service',
      '🔴 URGENTE (1–3 dias): Auditar todos os lotes com Sequencial Infração = 0 desde jan/2022',
      '🔴 URGENTE (1–3 dias): Mapear todos os registros com Data de Processamento em branco',
      '🟠 ALTA (semana 1): Implementar verificação de confirmação pós-envio SGI (Sequencial ≠ 0)',
      '🟠 ALTA (semana 1): Criar dashboard de monitoramento de lotes pendentes de confirmação',
      '🟡 NORMAL (semana 2): Corrigir bug do Google Maps API carregado duas vezes no dashboard',
      '🟡 NORMAL (semana 2): Corrigir TypeError no update do gráfico após resposta AJAX',
      '🔵 PREVENTIVO: Configurar alertas de expiração SSL com 30 dias de antecedência',
      '🔵 PREVENTIVO: Reunião técnica LABOR + INMETRO para RCA (Root Cause Analysis) formal',
    ],

    guia: [
      {
        id: 1, titulo: 'Acessar o AxHub ITPS e localizar os lotes afetados',
        descricao: 'Acesse o sistema AxHub ITPS e navegue até Infrações → Exportação. Filtre por Status = Erro e identifique os lotes com 0 registros exportados no período de julho/2026.',
        tipo: 'acesso',
        links: [{ label: '🌐 Abrir AxHub ITPS', url: 'https://itps.axhub.axion.ws/loteexportacao', destaque: true }],
        validacao: 'Confirmei que os lotes afetados estão listados com Status Erro.',
      },
      {
        id: 2, titulo: 'Verificar o certificado SSL do serviço processador',
        descricao: 'Abra o navegador e acesse https://itps.processor.axion.ws. Verifique se exibe erro de certificado SSL (ERR_CERT_COMMON_NAME_INVALID). Anote a data de expiração do certificado atual.',
        tipo: 'tecnico',
        links: [{ label: '🔐 Testar SSL', url: 'https://www.ssllabs.com/ssltest/analyze.html?d=itps.processor.axion.ws', destaque: true }],
        validacao: 'Confirmei o erro de certificado SSL no domínio itps.processor.axion.ws.',
      },
      {
        id: 3, titulo: 'Auditar lotes com Sequencial Infração = 0',
        descricao: 'No AxHub ITPS, acesse Infrações → Consulta e filtre infrações com Sequencial = 0 e status Exportado. Liste todos os registros afetados para o relatório.',
        tipo: 'auditoria',
        links: [{ label: '🔍 Consulta de Infrações', url: 'https://itps.axhub.axion.ws/consultainfracao', destaque: false }],
        validacao: 'Mapeei todos os registros com Sequencial Infração = 0.',
      },
      {
        id: 4, titulo: 'Renovar o certificado SSL de itps.processor.axion.ws',
        descricao: 'Contate o responsável pela infraestrutura (TI LABOR) para renovar o certificado SSL do domínio itps.processor.axion.ws. O CN deve corresponder EXATAMENTE ao domínio. Após renovação, reiniciar o serviço processor.',
        tipo: 'correcao',
        links: [],
        validacao: 'Certificado SSL renovado e serviço processor reiniciado com sucesso.',
      },
      {
        id: 5, titulo: 'Validar reconexão SignalR e retomada do pipeline',
        descricao: 'Após renovação do SSL, acesse o Dashboard do AxHub ITPS e verifique se o gráfico de Triagem Mensal está sendo atualizado em tempo real. O SignalR deve estar conectado sem erros no console do navegador.',
        tipo: 'validacao',
        links: [{ label: '📊 Dashboard AxHub ITPS', url: 'https://itps.axhub.axion.ws/', destaque: true }],
        validacao: 'Dashboard atualiza em tempo real. SignalR reconectado. Gráfico Triagem Mensal mostrando dados.',
      },
      {
        id: 6, titulo: 'Confirmar normalização das imagens no SGI',
        descricao: 'Confirme junto ao INMETRO-ITPS se as imagens em INCONSISTÊNCIA no SGI foram normalizadas. Solicite confirmação por e-mail e número do protocolo de resolução.',
        tipo: 'comunicacao',
        links: [],
        validacao: 'Recebi confirmação do INMETRO de que as imagens foram normalizadas no SGI.',
      },
      {
        id: 7, titulo: 'Documentar a resolução e encerrar o caso',
        descricao: 'Registre a data de resolução, número do certificado SSL renovado, responsável pela execução e lotes impactados. Altere o status do caso para "Resolvido" e envie relatório para TI INMETRO e TI LABOR.',
        tipo: 'encerramento',
        links: [],
        validacao: 'Caso documentado. Relatório enviado às partes.',
      },
    ],
  },

  // ─── CASO 2 ───────────────────────────────────────────────────────────────
  {
    id: 'CASO-2026-002',
    titulo: 'SMST/BV — Erros nos Lotes de Exportação 1578–1584 (Placa NAW0666)',
    status: 'em_investigacao',
    prioridade: 'alta',
    dataOcorrencia: '17/07/2026',
    dataReporte: '17/07/2026',
    sistema: 'AxHub SMST/Boa Vista (smstrr.axhub.axion.ws)',
    origem: 'SMST/BV — Equipe de Operações',
    responsavel: 'TI LABOR',
    tags: ['Lote Exportação', 'NAW0666', 'SERPRO', '404', 'Velocidade', 'Boa Vista', 'RENAVAM', 'Infração 962900'],
    resumo: 'Os lotes 1578 e 1580–1584 (tipo Velocidade, 200 registros cada) apresentaram Status "Erro" com 0 infrações exportadas. A causa: ao consultar dados do veículo com placa NAW0666 (Infração 962900, 01/07/2026 09:06:19, Faixa BV003R-2) via SERPRO (base serpro-smstrr), a API retorna HTTP 404 Not Found. A infração possui dados parciais do veículo (Chevrolet/Cobalt LTZ, 2017, Boa Vista) mas RENAVAM e todos os Dados do Proprietário em branco. Verificação ao vivo confirmou: Consulta de Placa → 404; Webhooks: nenhum configurado no sistema.',

    lote: {
      numero: '1578 / 1580–1584',
      dataGeracao: '17/07/2026 13:36:38',
      dataInicial: '01/07/2026',
      dataFinal: '17/07/2026',
      qtdRegistros: 200,
      qtdExportados: 0,
      status: '❌ Erro (0 registros exportados)',
      tipo: 'Velocidade',
      arquivo: '—— (exportação abortada)',
      mensagem: 'Erro ao consultar dados do veículo NAW0666 | Infração: 962900 - Placa: NAW0666 - Data/Hora: 01/07/2026 09:06:19',
    },

    infracoes: [
      {
        id: '962900',
        ait: 'RA00286903',
        datahora: '01/07/2026 09:06:19',
        placa: 'NAW0666',
        faixa: 'BV003R-2',
        sentido: 'Bairro → Centro',
        endereco: 'Av. Glaycon de Paiva, N 1027 — Bairro São Vicente — Boa Vista/RR',
        enquadramento: '74550 — TRANSITAR EM VELOCIDADE SUPERIOR À MÁXIMA PERMITIDA EM ATÉ 20%',
        base_legal: 'Velocidade Medida: 65 km/h | Regulamentada: 50 km/h | Considerada: 58 km/h',
        veiculo: 'CHEVROLET/COBALT 18M LTZ — Automóvel Branco 2017 (Particular)',
        municipio: 'Boa Vista — RR',
        status_processamento: 'Processada',
        data_processamento: '14/07/2026 15:46:59',
        sequencial: '12',
        notificacoes: '25%',
        exportado: '❌ Não Exportado',
        anomalias: [
          'RENAVAM em branco — veículo sem registro RENAVAM no sistema',
          'Dados do Proprietário 100% vazios (Nome, CPF, Endereço, CEP)',
          'SERPRO retorna HTTP 404 para NAW0666 (não encontrado na base nacional)',
          'Consulta de Placa ao vivo → "Response status code does not indicate success: 404 (Not Found)"',
          'Webhooks: NENHUM configurado no sistema (AxHub v1.1.0)',
        ],
      },
    ],

    timeline: [
      { data: '01/07/2026 09:06:19', evento: 'Câmera BV003R-2 (Av. Glaycon de Paiva, Boa Vista/RR) captura infração 962900 — placa NAW0666 a 65km/h em via de 50km/h (Enq. 74550).', tipo: 'alerta' },
      { data: '14/07/2026 15:46:59', evento: 'Triagem da infração 962900 concluída pela usuária thaynara.barros. Dados do veículo parcialmente preenchidos: Chevrolet/Cobalt, Branca, 2017. RENAVAM e dados do proprietário ficam em branco.', tipo: 'alerta' },
      { data: '17/07/2026 13:36:38', evento: 'Sistema tenta exportar Lote 1578 (200 registros, período 01/07–17/07/2026). Ao consultar SERPRO para obter dados do proprietário da placa NAW0666, recebe HTTP 404. Exportação abortada — 0 registros exportados.', tipo: 'incidente' },
      { data: '17/07/2026', evento: 'Lotes 1580, 1581, 1582, 1583 e 1584 gerados com o mesmo período e também falham pelo mesmo motivo: NAW0666 bloqueia o processo de exportação de todos os lotes que incluem esse intervalo de data.', tipo: 'incidente' },
      { data: '17/07/2026', evento: 'Equipe SMST/BV reporta o erro: "Lotes 1578/1580 ao 1584 apresentando erro ao consultar dados do veículo NAW0666 | Infração: 962900".', tipo: 'comunicado' },
      { data: '20/07/2026', evento: 'Análise ao vivo confirmada: Consulta de Placa NAW0666 → 404 SERPRO. PuxaPlaca.com.br consultado (bloqueio anti-bot — verificar manualmente). Webhooks: nenhum configurado. RENAVAM: branco. Proprietário: todos os campos vazios.', tipo: 'incidente' },
    ],

    evidenciasVivas: [
      { tipo: 'critico', icon: '🔴', titulo: 'SERPRO retorna 404 para placa NAW0666', detalhe: 'Consulta de Placa ao vivo (smstrr.axhub.axion.ws/consultaplaca): "Erro na Consulta — Response status code does not indicate success: 404 (Not Found)." Base: serpro-smstrr. A placa NAW0666 NÃO EXISTE na base nacional SERPRO/RENAVAM.' },
      { tipo: 'critico', icon: '🔴', titulo: 'PuxaPlaca.com.br — NAW0666 não retornou resultado', detalhe: 'Consulta realizada em puxaplaca.com.br/placa/NAW0666 em 20/07/2026. O site bloqueou a consulta automatizada (403/timeout), indicando proteção anti-bot. Verificação manual recomendada: acesse https://puxaplaca.com.br/placa/NAW0666 diretamente no navegador para validação independente da base SERPRO.' },
      { tipo: 'critico', icon: '🔴', titulo: 'RENAVAM em branco na infração 962900', detalhe: 'O campo RENAVAM da infração 962900 está vazio. Todo veículo brasileiro regularmente emplacado possui RENAVAM. A ausência indica que a placa nunca foi consultada com sucesso ou o veículo não está regularmente registrado.' },
      { tipo: 'critico', icon: '🔴', titulo: 'Dados do Proprietário 100% vazios', detalhe: 'Nome, CPF, CEP, Endereço, Bairro, Município, UF, Carroceria, Combustível, Data de Nascimento, CNH — todos os campos do proprietário estão em branco. Impossível emitir Auto de Infração sem esses dados.' },
      { tipo: 'critico', icon: '🔴', titulo: '0 registros exportados em 200 (lotes 1578–1584)', detalhe: 'A falha em UMA única placa bloqueia a exportação de TODOS os 200 registros do lote. O processo de exportação não tem mecanismo de skip/exclusão de placas com erro.' },
      { tipo: 'alto', icon: '🟠', titulo: 'Nenhum Webhook configurado no sistema', detalhe: 'A página Configurações → Webhooks exibe "Nenhum registro encontrado." O sistema usa integração SERPRO via Consumer Key/Secret configurada diretamente (serpro-smstrr), sem webhooks externos.' },
      { tipo: 'medio', icon: '🟡', titulo: 'Notificações travadas em 25%', detalhe: 'A infração 962900 tem Notificações em 25% — apenas a 1ª etapa processada. Como não foi exportada, as etapas seguintes (penalidade, recurso, cobrança) estão bloqueadas.' },
    ],

    hipoteses: [
      {
        id: 'H1',
        titulo: '⚠️ MAIS PROVÁVEL — Placa NAW0666 não existe no RENAVAM nacional',
        probabilidade: 'confirmado',
        descricao: 'A placa NAW0666 retorna 404 no SERPRO, RENAVAM está em branco e todos os dados do proprietário estão ausentes. A placa pode ser fraudulenta (clonada), cancelada/baixada do RENAVAM, ou nunca ter sido emitida. Formato válido (3 letras + 4 dígitos = padrão antigo brasileiro), mas sem correspondência na base SERPRO.',
        evidencias: ['HTTP 404 SERPRO confirmado ao vivo em 20/07/2026', 'RENAVAM em branco na infração', 'Dados do Proprietário 100% vazios', 'Veículo: dados básicos existem (triagem fez lookup parcial) mas sem registro nacional'],
        acoes: ['🚨 Verificar imagem original da infração 962900 — confirmar se a placa foi lida corretamente pelo OCR', 'Cruzar NAW0666 com DETRAN-RR (Roraima) localmente', 'Verificar em https://puxaplaca.com.br/placa/NAW0666 manualmente', 'Registrar placa como suspeita de fraude/clonagem se confirmada inexistente'],
      },
      {
        id: 'H2',
        titulo: 'Erro de leitura do OCR — placa mal capturada pela câmera',
        probabilidade: 'alta',
        descricao: 'A câmera BV003R-2 pode ter lido incorretamente a placa. Possíveis leituras incorretas: MAW0666, NAM0666, NAW0G66 (Mercosul), NAW0B66.',
        evidencias: ['Velocidade de 65km/h capturada — câmera pode ter dificuldade com placas em alta velocidade', 'Faixa BV003R é rodovia com incidência de placas Mercosul (veículos de Venezuela/Guiana)', 'RENAVAM em branco poderia indicar que a leitura foi inconsistente'],
        acoes: ['Acessar imagem original da infração 962900 no sistema de triagem', 'Comparar digitalmente a placa capturada com MAW0666, NAM0666, etc.', 'Se erro de OCR confirmado: corrigir a placa e reprocessar a infração', 'Consultar SERPRO com variações da placa'],
      },
      {
        id: 'H3',
        titulo: 'Veículo estrangeiro (Venezuela/Guiana)',
        probabilidade: 'media',
        descricao: 'Boa Vista/RR faz fronteira com Venezuela e Guiana. Veículos estrangeiros circulam na região e não possuem cadastro no RENAVAM brasileiro. A placa NAW0666 pode ser de um veículo venezuelano com placa similar ao formato brasileiro.',
        evidencias: ['Localização: Av. Glaycon de Paiva, Boa Vista/RR — próximo à fronteira', 'Faixas BV003R — rodovia de acesso ao centro de Boa Vista'],
        acoes: ['Verificar se a câmera BV003R tem histórico de capturar veículos estrangeiros', 'Consultar se há mecanismo no AxHub para registrar/descartar veículos estrangeiros', 'Se estrangeiro: descartar a infração com motivo específico'],
      },
    ],

    impacto: {
      operacional: '6 lotes com 200 registros cada = potencialmente 1.200 infrações de velocidade não exportadas. Todos os autos de infração do período 01/07–17/07/2026 estão pendentes, gerando atraso no processo de autuação.',
      reputacional: 'A SMST/BV reportou o problema à LABOR. Uma única placa com 404 travou a exportação completa — o sistema não tem resiliência a registros problemáticos, demonstrando fragilidade arquitetural.',
      juridico: 'Autos de infração não exportados dentro do prazo legal podem prescrever. O CTB prevê prazos específicos para notificação de autuação ao condutor. Cada dia de atraso aproxima da possibilidade de nulidade das infrações.',
    },

    recomendacoes: [
      '🚨 IMEDIATO: Verificar imagem original da infração 962900 para confirmar leitura da placa NAW0666',
      '🚨 IMEDIATO: Verificar placa manualmente em https://puxaplaca.com.br/placa/NAW0666',
      '🚨 IMEDIATO: Descartar ou corrigir a infração 962900 para desbloqueio dos lotes',
      '🚨 IMEDIATO: Reprocessar exportação dos lotes 1578, 1580, 1581, 1582, 1583 e 1584',
      '🔴 URGENTE: Implementar mecanismo de "skip" no processo de exportação para registros com erro de consulta SERPRO',
      '🔴 URGENTE: Adicionar alerta automático quando placa não encontrada no SERPRO durante a triagem',
      '🟠 ALTA: Criar fluxo de tratamento de placas com 404: verificação manual antes de incluir no lote',
      '🟠 ALTA: Configurar Webhook de fallback (ex: DETRAN-RR) para placas não encontradas no SERPRO nacional',
      '🟡 NORMAL: Revisar configuração de Webhooks — atualmente sem nenhum webhook registrado',
      '🔵 PREVENTIVO: Implementar validação de placa + RENAVAM ANTES de marcar infração como "Processada"',
      '🔵 PREVENTIVO: Criar relatório diário de infrações com RENAVAM em branco para revisão proativa',
    ],

    guia: [
      {
        id: 1, titulo: 'Localizar o lote com erro no AxHub SMST/BV',
        descricao: 'Acesse o AxHub SMST e vá até Infrações → Exportação. Filtre pelo número do lote (ex: 1578) ou use Status = Erro. Confirme: Qtd. Registros = 200, Qtd. Exportados = 0, e a mensagem de erro com a placa NAW0666.',
        tipo: 'acesso',
        links: [
          { label: '🌐 Lotes de Exportação', url: 'https://smstrr.axhub.axion.ws/loteexportacao', destaque: true },
          { label: '📄 Detalhamento Lote 1578', url: 'https://smstrr.axhub.axion.ws/loteexportacao/detalhamentoexportacao/2fda1545-6cf9-4f02-941e-ed66b26f69f6', destaque: false },
        ],
        validacao: 'Confirmei que os lotes 1578, 1580, 1581, 1582, 1583 e 1584 estão com Status Erro e 0 registros exportados.',
      },
      {
        id: 2, titulo: 'Acessar a infração 962900 e verificar os dados da placa',
        descricao: 'Acesse a infração ID 962900 diretamente. Verifique: (1) Campo RENAVAM — em branco = placa inválida. (2) Dados do Proprietário — Nome, CPF, Endereço devem estar em branco. (3) Status = Processada mas Exportado = Não Exportado. Anote as anomalias.',
        tipo: 'auditoria',
        links: [{ label: '📋 Abrir Infração 962900', url: 'https://smstrr.axhub.axion.ws/consultainfracao/detalhamentoinfracao/962900', destaque: true }],
        validacao: 'Confirmei: RENAVAM em branco, Dados do Proprietário vazios, Status = Não Exportado.',
      },
      {
        id: 3, titulo: 'Verificar a imagem original — confirmar leitura da placa pelo OCR',
        descricao: 'No sistema de triagem, localize a infração 962900 e abra a imagem original da câmera BV003R-2. Compare a placa visível na imagem com "NAW0666". Verifique se pode ser erro de OCR (M/N, W/V, 0/O, B/8). Se a placa na imagem for diferente, anote a placa correta.',
        tipo: 'verificacao',
        links: [{ label: '🖼️ Triagem Infrações', url: 'https://smstrr.axhub.axion.ws/triagem', destaque: true }],
        validacao: 'Imagem verificada. A placa na imagem é: _______',
      },
      {
        id: 4, titulo: 'Consultar a placa NAW0666 no PuxaPlaca',
        descricao: 'Acesse o PuxaPlaca no navegador e consulte a placa NAW0666. O site retorna dados gratuitos (marca, modelo, ano, cor, município, RENAVAM, chassi). Se NÃO encontrada: placa inválida/fraudulenta → DESCARTAR. Se encontrada com dados: preencher manualmente no AxHub.',
        tipo: 'consulta_externa',
        links: [
          { label: '🌐 Consultar NAW0666 no PuxaPlaca', url: 'https://puxaplaca.com.br/placa/NAW0666', destaque: true },
          { label: '🔍 Consulta de Placa no AxHub', url: 'https://smstrr.axhub.axion.ws/consultaplaca', destaque: false },
        ],
        validacao: 'Resultado PuxaPlaca: NÃO ENCONTRADA / Encontrada — dados: _______',
      },
      {
        id: 5, titulo: 'Executar a ação corretiva na infração 962900',
        descricao: 'Com base nos passos anteriores: (A) Placa inválida/inexistente → Descartar infração 962900 com motivo "Placa não localizada no RENAVAM nacional". (B) Erro de OCR → Corrigir a placa, salvar e aguardar reprocessamento da triagem.',
        tipo: 'correcao',
        links: [{ label: '⚙️ Editar/Descartar Infração 962900', url: 'https://smstrr.axhub.axion.ws/consultainfracao/detalhamentoinfracao/962900', destaque: true }],
        validacao: 'Ação executada: Infração descartada / placa corrigida para: _______',
      },
      {
        id: 6, titulo: 'Reprocessar a exportação dos lotes 1578 e 1580–1584',
        descricao: 'Com a infração 962900 descartada ou corrigida, volte à lista de Lotes de Exportação. Para cada lote com erro, clique no botão laranja 🔄 (Reprocessar). Aguarde o processamento e confirme Status = ✅ Ok e Qtd. Exportados = 200.',
        tipo: 'reprocessamento',
        links: [{ label: '🔄 Lotes de Exportação', url: 'https://smstrr.axhub.axion.ws/loteexportacao', destaque: true }],
        validacao: 'Todos os lotes reprocessados com Status Ok. Qtd. Exportados = 200 em cada lote.',
      },
      {
        id: 7, titulo: 'Confirmar exportação e notificar a equipe SMST/BV',
        descricao: 'Confirme que cada lote agora mostra Qtd. Exportados = Qtd. Registros (200). Verifique se os autos foram gerados no sistema de destino. Comunique o resultado à equipe SMST/BV e documente data, ação e responsável.',
        tipo: 'encerramento',
        links: [{ label: '📊 Relatório de Infrações', url: 'https://smstrr.axhub.axion.ws/relatorio/relatorioinfracoes', destaque: false }],
        validacao: 'Exportação confirmada. Equipe notificada.',
      },
    ],
  },
];

const STATUS_CONFIG = {
  em_investigacao: { label: 'Em Investigação', color: '#f59e0b', bg: '#fffbeb' },
  resolvido: { label: 'Resolvido', color: '#10b981', bg: '#ecfdf5' },
  pendente: { label: 'Pendente', color: '#6b7280', bg: '#f9fafb' },
  critico: { label: 'Crítico', color: '#ef4444', bg: '#fef2f2' },
};

const PRIORIDADE_CONFIG = {
  alta: { label: 'Alta', color: '#ef4444' },
  media: { label: 'Média', color: '#f59e0b' },
  baixa: { label: 'Baixa', color: '#10b981' },
};

const TIMELINE_CONFIG = {
  alerta: { icon: '⚠️', color: '#f59e0b' },
  incidente: { icon: '🚨', color: '#ef4444' },
  resolucao: { icon: '✅', color: '#10b981' },
  comunicado: { icon: '📧', color: '#667eea' },
};

const PROB_CONFIG = {
  confirmado: { label: '🔴 Confirmado', color: '#dc2626', width: '100%' },
  alta: { label: 'Alta', color: '#ef4444', width: '85%' },
  media: { label: 'Média', color: '#f59e0b', width: '55%' },
  baixa: { label: 'Baixa', color: '#10b981', width: '25%' },
};

const TIPO_GUIA_CONFIG = {
  acesso:           { icon: '🌐', label: 'Acesso ao Sistema', cor: '#667eea', bg: '#eff6ff' },
  tecnico:          { icon: '🔧', label: 'Verificação Técnica', cor: '#8b5cf6', bg: '#f5f3ff' },
  auditoria:        { icon: '🔍', label: 'Auditoria',          cor: '#0891b2', bg: '#ecfeff' },
  verificacao:      { icon: '🖼️', label: 'Verificação Visual', cor: '#0284c7', bg: '#e0f2fe' },
  consulta_externa: { icon: '🌐', label: 'Consulta Externa',   cor: '#059669', bg: '#ecfdf5' },
  correcao:         { icon: '⚙️', label: 'Correção',           cor: '#dc2626', bg: '#fef2f2' },
  reprocessamento:  { icon: '🔄', label: 'Reprocessamento',    cor: '#f97316', bg: '#fff7ed' },
  validacao:        { icon: '✅', label: 'Validação',          cor: '#16a34a', bg: '#f0fdf4' },
  comunicacao:      { icon: '📧', label: 'Comunicação',        cor: '#9333ea', bg: '#faf5ff' },
  encerramento:     { icon: '🏁', label: 'Encerramento',       cor: '#374151', bg: '#f9fafb' },
};

function GuiaValidacao({ caso }) {
  const storageKey = `guia_${caso.id}`;
  const [passos, setPassos] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return caso.guia?.map(p => ({ ...p, concluido: false, nota: '', expandido: false })) || [];
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(passos));
  }, [passos, storageKey]);

  const total = passos.length;
  const concluidos = passos.filter(p => p.concluido).length;
  const progresso = total > 0 ? Math.round((concluidos / total) * 100) : 0;
  const passoAtual = passos.findIndex(p => !p.concluido);

  const toggle = (idx) => setPassos(prev => prev.map((p, i) => i === idx ? { ...p, expandido: !p.expandido } : p));
  const marcar = (idx) => setPassos(prev => prev.map((p, i) => i === idx ? { ...p, concluido: !p.concluido, expandido: p.concluido ? p.expandido : false } : p));
  const setNota = (idx, val) => setPassos(prev => prev.map((p, i) => i === idx ? { ...p, nota: val } : p));
  const resetar = () => { if (window.confirm('Resetar todo o progresso deste caso?')) setPassos(caso.guia?.map(p => ({ ...p, concluido: false, nota: '', expandido: false })) || []); };

  const corProgresso = progresso === 100 ? '#10b981' : progresso >= 50 ? '#f59e0b' : '#667eea';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Cabeçalho do Guia */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', color: '#1a202c' }}>🗺️ Guia de Validação Interativo</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#6b7280' }}>
              Siga os passos abaixo para validar e resolver este caso. Marque cada etapa ao concluí-la.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: corProgresso, lineHeight: 1 }}>{progresso}%</div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{concluidos}/{total} passos</div>
            </div>
            <button onClick={resetar} title="Resetar progresso" style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#6b7280', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
              ↺ Resetar
            </button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ marginTop: '1rem', background: '#f1f5f9', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progresso}%`, background: `linear-gradient(90deg, ${corProgresso}, ${corProgresso}cc)`, borderRadius: '8px', transition: 'width 0.5s ease' }} />
        </div>

        {/* Resumo visual dos passos */}
        <div style={{ display: 'flex', gap: '4px', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {passos.map((p, i) => (
            <div key={i} title={p.titulo} style={{
              width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
              background: p.concluido ? '#10b981' : i === passoAtual ? '#667eea' : '#e2e8f0',
              color: p.concluido || i === passoAtual ? 'white' : '#9ca3af',
              border: i === passoAtual && !p.concluido ? '2px solid #667eea' : '2px solid transparent',
              transition: 'all 0.2s',
            }} onClick={() => toggle(i)}>
              {p.concluido ? '✓' : i + 1}
            </div>
          ))}
        </div>

        {progresso === 100 && (
          <div style={{ marginTop: '1rem', padding: '0.875rem 1.25rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #6ee7b7', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎉</span>
            <div>
              <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.9rem' }}>Todos os passos concluídos!</div>
              <div style={{ color: '#047857', fontSize: '0.8rem' }}>Este caso está pronto para ser encerrado. Altere o status para "Resolvido".</div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de passos */}
      {passos.map((passo, idx) => {
        const cfg = TIPO_GUIA_CONFIG[passo.tipo] || TIPO_GUIA_CONFIG.acesso;
        const isAtual = idx === passoAtual && !passo.concluido;
        const isFuturo = !passo.concluido && idx > passoAtual;

        return (
          <div key={passo.id} style={{
            background: 'white', borderRadius: '12px',
            border: passo.concluido ? '2px solid #6ee7b7' : isAtual ? '2px solid #667eea' : '1px solid #e2e8f0',
            overflow: 'hidden', opacity: isFuturo ? 0.65 : 1, transition: 'all 0.2s',
          }}>
            {/* Cabeçalho do passo */}
            <div
              onClick={() => !isFuturo && toggle(idx)}
              style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: isFuturo ? 'default' : 'pointer', userSelect: 'none' }}
            >
              {/* Número/Check */}
              <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: passo.concluido ? '#10b981' : isAtual ? '#667eea' : '#f1f5f9',
                color: passo.concluido || isAtual ? 'white' : '#9ca3af', fontWeight: 700, fontSize: passo.concluido ? '1.2rem' : '0.9rem',
              }}>
                {passo.concluido ? '✓' : passo.id}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: cfg.bg, color: cfg.cor, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {cfg.icon} {cfg.label}
                  </span>
                  {isAtual && <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700 }}>← PRÓXIMO PASSO</span>}
                  {passo.concluido && passo.nota && <span style={{ fontSize: '0.7rem', color: '#10b981' }}>📝 Com nota</span>}
                </div>
                <div style={{ fontWeight: 600, color: passo.concluido ? '#6b7280' : '#1a202c', fontSize: '0.9rem', marginTop: '0.25rem', textDecoration: passo.concluido ? 'line-through' : 'none' }}>
                  {passo.titulo}
                </div>
              </div>

              {/* Expandir */}
              {!isFuturo && (
                <span style={{ color: '#9ca3af', fontSize: '1.2rem', flexShrink: 0 }}>{passo.expandido ? '▲' : '▼'}</span>
              )}
            </div>

            {/* Conteúdo expandido */}
            {passo.expandido && !isFuturo && (
              <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
                {/* Descrição */}
                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', margin: '1rem 0', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase' }}>📌 O que fazer</div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: 1.7 }}>{passo.descricao}</p>
                </div>

                {/* Links de ação */}
                {passo.links?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase' }}>🔗 Ações Diretas</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {passo.links.map((link, li) => (
                        <a key={li} href={link.url} target="_blank" rel="noreferrer" style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px',
                          background: link.destaque ? cfg.cor : '#f1f5f9', color: link.destaque ? 'white' : '#374151',
                          fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none', border: `1px solid ${link.destaque ? cfg.cor : '#e2e8f0'}`,
                          transition: 'all 0.15s',
                        }}>
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Campo de nota */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase' }}>📝 Sua Observação (opcional)</div>
                  <textarea
                    value={passo.nota}
                    onChange={e => setNota(idx, e.target.value)}
                    placeholder={passo.validacao}
                    rows={2}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#374151', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, background: '#fafafa', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Botão de conclusão */}
                <button
                  onClick={() => marcar(idx)}
                  style={{
                    padding: '0.625rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
                    background: passo.concluido ? '#fee2e2' : '#10b981', color: passo.concluido ? '#dc2626' : 'white',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}
                >
                  {passo.concluido ? '↩ Desfazer Conclusão' : '✓ Marcar como Concluído'}
                </button>
              </div>
            )}

            {/* Nota resumida quando fechado e concluído */}
            {!passo.expandido && passo.concluido && passo.nota && (
              <div style={{ padding: '0 1.25rem 0.75rem', marginTop: '-0.25rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', background: '#f0fdf4', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0', fontStyle: 'italic' }}>
                  📝 {passo.nota}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Casos() {
  const [casoSelecionado, setCasoSelecionado] = useState(CASOS[0]);
  const [secaoAberta, setSecaoAberta] = useState('guia');

  const cfg = STATUS_CONFIG[casoSelecionado.status] || STATUS_CONFIG.pendente;
  const pri = PRIORIDADE_CONFIG[casoSelecionado.prioridade] || PRIORIDADE_CONFIG.media;

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: '100%', minHeight: 0 }}>
      {/* Sidebar */}
      <div style={{ width: '280px', flexShrink: 0, background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #667eea11, #764ba211)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.1rem' }}>🚗</span>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#1a202c' }}>Diagnóstico de Exportação</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.4 }}>Valide placas e corrija erros em lotes de exportação</p>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: '#fee2e2', color: '#dc2626', fontWeight: 600 }}>{CASOS.filter(c => c.status === 'em_investigacao').length} em investigação</span>
            <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '20px', background: '#dcfce7', color: '#16a34a', fontWeight: 600 }}>{CASOS.filter(c => c.status === 'resolvido').length} resolvidos</span>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {CASOS.map(caso => {
            const s = STATUS_CONFIG[caso.status] || STATUS_CONFIG.pendente;
            const p = PRIORIDADE_CONFIG[caso.prioridade] || PRIORIDADE_CONFIG.media;
            return (
              <div key={caso.id} onClick={() => { setCasoSelecionado(caso); setSecaoAberta('lote'); }} style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: casoSelecionado?.id === caso.id ? '#f0f4ff' : 'transparent', borderLeft: casoSelecionado?.id === caso.id ? '3px solid #667eea' : '3px solid transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace' }}>{caso.id}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: p.color }}>● {p.label}</span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a202c', lineHeight: 1.4, marginBottom: '0.5rem' }}>{caso.titulo}</div>
                <span style={{ display: 'inline-block', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #e2e8f0' }}>
          <button style={{ width: '100%', padding: '0.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>+ Novo Caso</button>
        </div>
      </div>

      {/* Detalhe */}
      {casoSelecionado && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', minHeight: 0 }}>
          {/* Cabeçalho */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#6b7280', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{casoSelecionado.id}</span>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '20px', background: cfg.bg, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pri.color }}>● Prioridade {pri.label}</span>
            </div>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: '#1a202c', fontWeight: 700 }}>🚨 {casoSelecionado.titulo}</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>{casoSelecionado.resumo}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              {[
                { label: '📅 Ocorrência', value: casoSelecionado.dataOcorrencia },
                { label: '📩 Reporte', value: casoSelecionado.dataReporte },
                { label: '🖥️ Sistema', value: casoSelecionado.sistema },
                { label: '📌 Origem', value: casoSelecionado.origem },
                { label: '👥 Responsável', value: casoSelecionado.responsavel },
              ].map(m => (
                <div key={m.label} style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: '#9ca3af', display: 'block' }}>{m.label}</span>
                  <span style={{ color: '#1a202c', fontWeight: 500 }}>{m.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              {casoSelecionado.tags.map(t => (
                <span key={t} style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '20px', background: '#e0e7ff', color: '#4f46e5', fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Navegação interna */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'guia', label: '🗺️ Guia' },
              { id: 'lote', label: '📦 Lote' },
              { id: 'timeline', label: '⏱️ Timeline' },
              { id: 'evidencias', label: '🔴 Evidências Vivas' },
              { id: 'hipoteses', label: '🔬 Hipóteses' },
              { id: 'impacto', label: '💥 Impacto' },
              { id: 'recomendacoes', label: '✅ Recomendações' },
            ].map(s => (
              <button key={s.id} onClick={() => setSecaoAberta(s.id)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, borderColor: secaoAberta === s.id ? '#667eea' : '#e2e8f0', background: secaoAberta === s.id ? '#667eea' : 'white', color: secaoAberta === s.id ? 'white' : '#374151', transition: 'all 0.15s' }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Seção: Guia de Validação */}
          {secaoAberta === 'guia' && (
            casoSelecionado.guia
              ? <GuiaValidacao caso={casoSelecionado} />
              : (
                <div style={{ background: 'white', borderRadius: '12px', border: '1px dashed #e2e8f0', padding: '3rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#374151' }}>Guia não disponível</h3>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.875rem' }}>Este caso ainda não possui um guia de validação configurado.</p>
                </div>
              )
          )}

          {/* Seção: Lote */}
          {secaoAberta === 'lote' && casoSelecionado.lote && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#1a202c' }}>📦 Detalhamento — Lote de Exportação</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { label: '# Número', value: casoSelecionado.lote.numero, destaque: true },
                    { label: '📅 Data/Hora Geração', value: casoSelecionado.lote.dataGeracao },
                    { label: '📆 Data Inicial', value: casoSelecionado.lote.dataInicial },
                    { label: '📆 Data Final', value: casoSelecionado.lote.dataFinal },
                    { label: '📊 Qtd. Registros', value: casoSelecionado.lote.qtdRegistros },
                    { label: '✅ Qtd. Exportados', value: casoSelecionado.lote.qtdExportados },
                    { label: '🏷️ Tipo', value: casoSelecionado.lote.tipo },
                    { label: '⚠️ Status', value: casoSelecionado.lote.status, alerta: true },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: m.alerta ? '#fef2f2' : m.destaque ? '#eff6ff' : '#f8fafc', border: `1px solid ${m.alerta ? '#fca5a5' : m.destaque ? '#bfdbfe' : '#e2e8f0'}` }}>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem' }}>{m.label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: m.alerta ? '#dc2626' : m.destaque ? '#1d4ed8' : '#1a202c' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem' }}>💬 Mensagem</div>
                  <code style={{ fontSize: '0.75rem', color: '#374151', wordBreak: 'break-all' }}>{casoSelecionado.lote.mensagem}</code>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#1a202c' }}>🚦 Infrações no Lote</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {casoSelecionado.infracoes?.map(inf => (
                    <div key={inf.id} style={{ border: '2px solid #fca5a5', borderRadius: '12px', padding: '1.25rem', background: '#fef9f9' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#991b1b', fontWeight: 700 }}>ID {inf.id}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#92400e', fontWeight: 700 }}>AIT: {inf.ait}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#166534', fontWeight: 700 }}>🚗 {inf.placa}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#6b7280' }}>{inf.datahora}</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: '#fee2e2', borderRadius: '6px' }}>⚖️ {inf.enquadramento}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem' }}>{inf.base_legal}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[
                          { label: '📍 Faixa/Sentido', value: `${inf.faixa} / ${inf.sentido}` },
                          { label: '📌 Endereço', value: inf.endereco },
                          { label: '🚌 Veículo', value: inf.veiculo },
                          { label: '🏙️ Município', value: inf.municipio },
                          { label: '⚙️ Status', value: inf.status_processamento },
                          { label: '📅 Dt. Processamento', value: inf.data_processamento, alerta: inf.data_processamento?.includes('BLANK') },
                          { label: '🔢 Sequencial SGI', value: inf.sequencial, alerta: inf.sequencial?.includes('0') },
                          { label: '📢 Notificações', value: inf.notificacoes },
                          { label: '📤 Exportado', value: inf.exportado, alerta: inf.exportado?.includes('❌') },
                        ].map(f => (
                          <div key={f.label} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: f.alerta ? '#fff7ed' : '#f8fafc', border: `1px solid ${f.alerta ? '#fed7aa' : '#e2e8f0'}` }}>
                            <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>{f.label}</div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: f.alerta ? '#c2410c' : '#374151' }}>{f.value}</div>
                          </div>
                        ))}
                      </div>
                      {inf.anomalias?.length > 0 && (
                        <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.4rem' }}>🚨 ANOMALIAS DETECTADAS</div>
                          {inf.anomalias.map((a, i) => <div key={i} style={{ fontSize: '0.78rem', color: '#991b1b', padding: '0.2rem 0' }}>• {a}</div>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Seção: Timeline */}
          {secaoAberta === 'timeline' && (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', color: '#1a202c' }}>⏱️ Timeline do Incidente</h3>
              <div style={{ position: 'relative' }}>
                {casoSelecionado.timeline.map((t, i) => {
                  const tc = TIMELINE_CONFIG[t.tipo] || TIMELINE_CONFIG.comunicado;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: i < casoSelecionado.timeline.length - 1 ? '1.5rem' : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: tc.color + '22', border: `2px solid ${tc.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>{tc.icon}</div>
                        {i < casoSelecionado.timeline.length - 1 && <div style={{ width: '2px', flex: 1, background: '#e2e8f0', marginTop: '4px' }} />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, marginBottom: '0.25rem' }}>{t.data}</div>
                        <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{t.evento}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seção: Evidências Vivas */}
          {secaoAberta === 'evidencias' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 100%)', borderRadius: '12px', border: '2px solid #fca5a5', padding: '1.25rem 1.5rem' }}>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: '#dc2626' }}>🔴 Evidências Coletadas em Tempo Real</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f1d1d' }}>Erros e anomalias observados diretamente no sistema em produção</p>
              </div>
              {casoSelecionado.evidenciasVivas?.map((ev, i) => {
                const borderColor = ev.tipo === 'critico' ? '#ef4444' : ev.tipo === 'alto' ? '#f97316' : '#f59e0b';
                const bgColor = ev.tipo === 'critico' ? '#fef2f2' : ev.tipo === 'alto' ? '#fff7ed' : '#fffbeb';
                return (
                  <div key={i} style={{ background: bgColor, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '1.25rem 1.5rem', borderLeft: `5px solid ${borderColor}` }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{ev.icon}</span>
                      <strong style={{ fontSize: '0.9rem', color: '#1a202c' }}>{ev.titulo}</strong>
                      <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, color: borderColor, background: 'white', padding: '0.15rem 0.5rem', borderRadius: '20px', border: `1px solid ${borderColor}`, textTransform: 'uppercase' }}>
                        {ev.tipo === 'critico' ? '🔴 Crítico' : ev.tipo === 'alto' ? '🟠 Alto' : '🟡 Médio'}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#374151', lineHeight: 1.6 }}>{ev.detalhe}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Seção: Hipóteses */}
          {secaoAberta === 'hipoteses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#1a202c' }}>🔬 Hipóteses de Causa Raiz</h3>
              </div>
              {casoSelecionado.hipoteses.map(h => {
                const pc = PROB_CONFIG[h.probabilidade] || PROB_CONFIG.media;
                return (
                  <div key={h.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#6b7280' }}>{h.id}</span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1a202c', fontWeight: 600 }}>{h.titulo}</h4>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pc.color, flexShrink: 0 }}>Prob. {pc.label}</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '6px', marginBottom: '1rem', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: pc.width, background: pc.color, borderRadius: '4px' }} />
                    </div>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>{h.descricao}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase' }}>🔎 Evidências</div>
                        <ul style={{ margin: 0, padding: '0 0 0 1.1rem' }}>
                          {h.evidencias.map((e, i) => <li key={i} style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem', lineHeight: 1.5 }}>{e}</li>)}
                        </ul>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase' }}>⚙️ Ações Investigativas</div>
                        <ul style={{ margin: 0, padding: '0 0 0 1.1rem' }}>
                          {h.acoes.map((a, i) => <li key={i} style={{ fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem', lineHeight: 1.5 }}>{a}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Seção: Impacto */}
          {secaoAberta === 'impacto' && (
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', color: '#1a202c' }}>💥 Análise de Impacto</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: '⚙️ Operacional', value: casoSelecionado.impacto.operacional, color: '#f59e0b', bg: '#fffbeb' },
                  { label: '🏛️ Reputacional', value: casoSelecionado.impacto.reputacional, color: '#ef4444', bg: '#fef2f2' },
                  { label: '⚖️ Jurídico', value: casoSelecionado.impacto.juridico, color: '#8b5cf6', bg: '#f5f3ff' },
                ].map(imp => (
                  <div key={imp.label} style={{ padding: '1rem 1.25rem', borderRadius: '8px', background: imp.bg, borderLeft: `4px solid ${imp.color}` }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: imp.color, marginBottom: '0.5rem' }}>{imp.label}</div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{imp.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seção: Recomendações */}
          {secaoAberta === 'recomendacoes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', color: '#1a202c' }}>✅ Recomendações</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {casoSelecionado.recomendacoes.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.875rem 1rem', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#667eea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.6 }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ferramentas de Consulta de Placa */}
              {casoSelecionado.infracoes?.length > 0 && (
                <div style={{ background: 'white', borderRadius: '12px', border: '2px solid #667eea', padding: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#4f46e5' }}>🔎 Ferramentas de Consulta de Placa</h3>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#6b7280' }}>Consulte as placas das infrações neste caso em bases externas para validação independente</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {casoSelecionado.infracoes.map(inf => (
                      <div key={inf.id} style={{ background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', color: '#1a202c', background: '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #fcd34d' }}>🚗 {inf.placa}</span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>— {inf.veiculo}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {[
                            { label: '🌐 PuxaPlaca', url: `https://puxaplaca.com.br/placa/${inf.placa}`, cor: '#667eea', desc: 'Consulta gratuita — marca, modelo, ano, cor, FIPE, chassi, município' },
                            { label: '🔍 DETRAN/SERPRO', url: 'https://portalservicos.senatran.serpro.gov.br/#/', cor: '#10b981', desc: 'Base oficial nacional SERPRO/SENATRAN' },
                            { label: '📋 Tabela FIPE', url: 'https://veiculos.fipe.org.br/', cor: '#f59e0b', desc: 'Tabela FIPE — valor e dados do modelo' },
                          ].map(tool => (
                            <a key={tool.label} href={tool.url} target="_blank" rel="noreferrer" title={tool.desc} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', background: tool.cor, color: 'white', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
                              {tool.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#1e40af', lineHeight: 1.6 }}>
                      💡 <strong>Dica:</strong> O <strong>PuxaPlaca</strong> (puxaplaca.com.br) é a ferramenta preferencial para validação rápida — consulta gratuita, retorna marca, modelo, ano, cor, município de registro, chassi, número de motor e valor FIPE. Em casos onde o SERPRO retorna 404, o PuxaPlaca pode confirmar se a placa realmente não existe ou se há dados disponíveis em outra fonte.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
