/**
 * x AXCROSS CONTROLLER
 * 
 * Controller para AxCross (sistema de cruzamento e monitoramento veicular)
 * Refatorado para usar generic-product-controller
 * 
 * @refactor Fase 1 - Quick Wins (2026-06-21)
 */

import { conectar } from "./services/axcross-db.js";
import * as dbService from "./services/axcross-db.js";
import { reconfigurar, getConfig } from "./services/axcross-db.js";
import { investigarViaSite, investigarPublico, compararViaUrl } from "./services/axcross-url-investigator.js";
import { createProductController } from "./controllers/products/generic-product.controller.js";
import { AXCROSS_CONFIG } from "./config/products-config.js";

// """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
// FUN!"ES GEN0RICAS (via generic-product-controller)
// """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

const baseController = createProductController(dbService, AXCROSS_CONFIG);

// Exporta funções genéricas diretamente do base controller
export const statusConexao = baseController.statusConexao;
export const resumoGeral = baseController.resumoGeral;
export const listarEquipamentos = baseController.listarEquipamentos;
export const heartbeatEquipamentos = baseController.heartbeatEquipamentos;
export const listarTabelas = baseController.listarTabelas;

// """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
// FUN!"ES ESPECÍFICAS DO AXCROSS

// POST /api/axcross/configurar  reconfigura a conexão em runtime
export async function configurarConexao(req, res) {
  let { host, port, database, user, password, encrypt } = req.body || {};
  if (!host || !database || !user) {
    return res.status(400).json({ erro: "Campos obrigatrios: host, database, user" });
  }

  // Sanitizar host: remover protocolo, path e query strings
  // Ex: "https://servidor.com:1433/banco"   "servidor.com"
  host = host.trim();
  if (/^https?:\/\//i.test(host)) {
    try {
      const u = new URL(host);
      host = u.hostname; // s o hostname, sem protocolo/path/porta
    } catch {
      host = host.replace(/^https?:\/\//i, "").split("/")[0].split(":")[0];
    }
  } else {
    // Remover path se presente (ex: "servidor.com/banco")
    host = host.split("/")[0];
  }

  if (!host) {
    return res.status(400).json({ erro: "Host invlido. Use apenas o endereço do servidor SQL (ex: servidor.empresa.com.br)" });
  }

  try {
    await reconfigurar({ host, port, database, user, password, encrypt });
    const pool = await conectar();
    await pool.request().query("SELECT 1 AS ok");
    const cfg = getConfig();
    return res.json({ ok: true, mensagem: "Conexo configurada e testada com sucesso", config: cfg });
  } catch (err) {
    return res.status(500).json({ ok: false, erro: err.message, dica: "Verifique host, porta, banco, usurio e senha", hostUsado: host });
  }
}

// GET /api/axcross/config  retorna configuração atual (sem senha)
export async function obterConfig(req, res) {
  const cfg = getConfig();
  return res.json({ config: cfg });
}

// POST /api/axcross/investigar  investigaço via URL de produço (com login)
export async function investigarUrl(req, res) {
  const { siteUrl, login, senha } = req.body || {};
  if (!siteUrl) return res.status(400).json({ erro: "Parmetro obrigatrio: siteUrl" });
  if (!login || !senha) return res.status(400).json({ erro: "Parmetros obrigatrios: login, senha" });
  try {
    const resultado = await investigarViaSite(siteUrl, login, senha);
    return res.json(resultado);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// POST /api/axcross/comparar-via-url  compara mltiplos equipamentos via URL de produço
export async function compararViaUrlEndpoint(req, res) {
  const { siteUrl, login, senha, equipamentos = [], filtros = {} } = req.body || {};
  if (!siteUrl) return res.status(400).json({ erro: "Parmetro obrigatrio: siteUrl" });
  if (!login || !senha) return res.status(400).json({ erro: "Parmetros obrigatrios: login, senha" });
  if (!equipamentos.length) return res.status(400).json({ erro: "Informe ao menos um equipamento em 'equipamentos'" });
  try {
    const resultado = await compararViaUrl(siteUrl, login, senha, equipamentos, filtros);
    return res.json(resultado);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// POST /api/axcross/investigar-publico  investigaço pblica (Swagger, sem login)
export async function investigarPublicoEndpoint(req, res) {
  const { siteUrl } = req.body || {};
  if (!siteUrl) return res.status(400).json({ erro: "Parmetro obrigatrio: siteUrl" });
  try {
    const resultado = await investigarPublico(siteUrl);
    return res.json(resultado);
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// 
// POST /api/axcross/comparar-equipamentos
// Comparaço multi-equipamento com todos os campos disponãoveis
// Body: { equipamentos: string[], dataInicio?, dataFim?, faixa?, sentido?, classificacao?, pageSize? }
// 
export async function compararEquipamentos(req, res) {
  try {
    const pool = await conectar();
    const { equipamentos = [], dataInicio, dataFim, faixa, sentido, classificacao, pageSize = 50 } = req.body || {};

    if (!equipamentos.length) {
      return res.status(400).json({ erro: "Informe ao menos um equipamento em 'equipamentos'" });
    }

    // 1. Descobrir coluna de classificação
    const colResult = await pool.request().query(`
      SELECT TOP 1 COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'TBPassagens'
        AND (COLUMN_NAME LIKE '%classif%' OR COLUMN_NAME LIKE '%TipoVeiculo%' OR COLUMN_NAME LIKE '%VehicleType%')
      ORDER BY ORDINAL_POSITION
    `);
    const colClassif = colResult.recordset[0]?.COLUMN_NAME || "ClassificacaoVeiculo";

    // 2. Descobrir colunas opcionais (Sentido, Cor, Modelo)
    const colsResult = await pool.request().query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'TBPassagens' ORDER BY ORDINAL_POSITION
    `);
    const allCols = colsResult.recordset.map(c => c.COLUMN_NAME.toLowerCase());
    const hasSentido = allCols.includes("sentido");
    const hasCor     = allCols.includes("cor");
    const hasModelo  = allCols.includes("modelo");

    const resultados = {};

    for (const equip of equipamentos) {
      const equipKey = equip.replace(/\W/g, "_");
      const rq = pool.request();
      const where = [`e.Descricao = @equip_${equipKey}`];
      rq.input(`equip_${equipKey}`, equip);

      if (dataInicio) { where.push("p.DataPassagem >= @dtIni"); rq.input("dtIni", new Date(dataInicio)); }
      if (dataFim)    { where.push("p.DataPassagem <= @dtFim"); rq.input("dtFim",  new Date(dataFim)); }
      if (faixa)      { where.push("f.Nome = @faixa");          rq.input("faixa", faixa); }
      if (sentido && hasSentido) { where.push("p.Sentido LIKE @sentido"); rq.input("sentido", `%${sentido}%`); }
      if (classificacao && classificacao !== "todos") {
        where.push(`p.${colClassif} = @classif`);
        rq.input("classif", classificacao);
      }
      const whereClause = `WHERE ${where.join(" AND ")}`;

      // SELECT limpo  sem vrgulas condicionais problemticas
      const optionalCols = [
        hasSentido ? "p.Sentido" : "NULL AS Sentido",
        hasCor     ? "p.Cor"     : "NULL AS Cor",
        hasModelo  ? "p.Modelo"  : "NULL AS Modelo",
      ].join(",\n          ");

      const passagens = await rq.query(`
        SELECT TOP ${parseInt(pageSize) || 50}
          p.Id,
          p.Placa,
          p.DataPassagem,
          p.Velocidade,
          p.${colClassif} AS ClassificacaoVeiculo,
          ${optionalCols},
          f.Nome          AS Faixa,
          l.Nome          AS Local,
          e.Descricao     AS Equipamento
        FROM TBPassagens p
        LEFT JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
        LEFT JOIN TBFaixas f ON p.FaixaId = f.Id
        LEFT JOIN TBLocais l ON p.LocalId = l.Id
        ${whereClause}
        ORDER BY p.DataPassagem DESC
      `);

      // Stats por faixa
      const rq2 = pool.request();
      rq2.input(`equip_${equipKey}`, equip);
      if (dataInicio) rq2.input("dtIni", new Date(dataInicio));
      if (dataFim)    rq2.input("dtFim",  new Date(dataFim));
      const statsFaixa = await rq2.query(`
        SELECT
          COALESCE(f.Nome, '(sem faixa)') AS Faixa,
          COUNT(*) AS Total,
          SUM(CASE WHEN p.${colClassif} IS NOT NULL AND LEN(CAST(p.${colClassif} AS VARCHAR(50))) > 0 THEN 1 ELSE 0 END) AS ComClassif,
          SUM(CASE WHEN p.${colClassif} IS NULL OR LEN(CAST(p.${colClassif} AS VARCHAR(50))) = 0 THEN 1 ELSE 0 END) AS SemClassif
        FROM TBPassagens p
        LEFT JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
        LEFT JOIN TBFaixas f ON p.FaixaId = f.Id
        WHERE e.Descricao = @equip_${equipKey}
          ${dataInicio ? "AND p.DataPassagem >= @dtIni" : ""}
          ${dataFim    ? "AND p.DataPassagem <= @dtFim"  : ""}
        GROUP BY f.Nome ORDER BY Total DESC
      `);

      // Stats por tipo de classificação
      const rq3 = pool.request();
      rq3.input(`equip_${equipKey}`, equip);
      if (dataInicio) rq3.input("dtIni", new Date(dataInicio));
      if (dataFim)    rq3.input("dtFim",  new Date(dataFim));
      const statsClassif = await rq3.query(`
        SELECT
          COALESCE(NULLIF(CAST(p.${colClassif} AS VARCHAR(100)), ''), '(sem classif.)') AS Tipo,
          COUNT(*) AS Total
        FROM TBPassagens p
        LEFT JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
        WHERE e.Descricao = @equip_${equipKey}
          ${dataInicio ? "AND p.DataPassagem >= @dtIni" : ""}
          ${dataFim    ? "AND p.DataPassagem <= @dtFim"  : ""}
        GROUP BY NULLIF(CAST(p.${colClassif} AS VARCHAR(100)), '')
        ORDER BY Total DESC
      `);

      // Stats gerais
      const rq4 = pool.request();
      rq4.input(`equip_${equipKey}`, equip);
      if (dataInicio) rq4.input("dtIni", new Date(dataInicio));
      if (dataFim)    rq4.input("dtFim",  new Date(dataFim));
      const statsGeral = await rq4.query(`
        SELECT
          COUNT(*)  AS Total,
          SUM(CASE WHEN p.${colClassif} IS NOT NULL AND LEN(CAST(p.${colClassif} AS VARCHAR(50))) > 0 THEN 1 ELSE 0 END) AS ComClassif,
          MIN(p.DataPassagem)  AS PrimeiraPassagem,
          MAX(p.DataPassagem)  AS UltimaPassagem,
          AVG(CAST(p.Velocidade AS FLOAT)) AS VelocidadeMedia
        FROM TBPassagens p
        LEFT JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
        WHERE e.Descricao = @equip_${equipKey}
          ${dataInicio ? "AND p.DataPassagem >= @dtIni" : ""}
          ${dataFim    ? "AND p.DataPassagem <= @dtFim"  : ""}
      `);

      resultados[equip] = {
        passagens:    passagens.recordset,
        statsFaixa:   statsFaixa.recordset,
        statsClassif: statsClassif.recordset,
        statsGeral:   statsGeral.recordset[0],
      };
    }

    return res.json({
      ok: true,
      colClassif,
      equipamentos,
      resultados,
      filtrosAplicados: { dataInicio, dataFim, faixa, sentido, classificacao },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, erro: err.message,
      dica: err.message.includes("1433") ? "Banco AxCross offline  configure a conexão na aba Dashboard" : "Erro na query SQL  verifique a estrutura do banco" });
  }
}


// 
// GET /api/axcross/ecosistema
// Cruza dados VARCO (configuração do equipamento) + AxCross (dados de passagem)
// Identifica contradições e causa raiz automtica
// Query params: equipamento (ex: GOEC60003), dias (padro 30)
// 
export async function ecosistema(req, res) {
  try {
    const { equipamento, dias = 30 } = req.query;
    if (!equipamento) return res.status(400).json({ erro: "Parmetro 'equipamento' obrigatrio" });

    //  1. VARCO: buscar dados do equipamento (tenta nome com 'O' e com '0')
    const varcoRes = await fetch(
      `http://localhost:3100/api/varco/auditoria`,
      { headers: { "x-api-token": process.env.API_TOKEN || "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3" } }
    ).then(r => r.json()).catch(() => null);

    // Normalizar cdigo: GOEC60003   GOEC6O003 (trocar dgito 0 por letra O na posiço 5)
    const equipNorm0 = equipamento.toUpperCase(); // com zero
    const equipNormO = equipNorm0.replace(/(?<=GOEC\d)0/i, "O"); // com letra O
    const equipNormNumbers = equipNorm0.replace(/O/gi, "0"); // tudo zero

    const varcoDevices = (varcoRes?.devices || []).filter(d => {
      const n = (d.nome || "").toUpperCase().replace(/\s.*/,""); // s cdigo
      return n === equipNorm0 || n === equipNormO || n === equipNormNumbers ||
             n.startsWith(equipNorm0) || n.startsWith(equipNormO);
    });

    // Extrair configuração do primeiro dispositivo (faixa 1 geralmente)
    const varcoBase = varcoDevices[0] || null;
    const raw = varcoBase?.raw || {};
    const varcoConfig = varcoBase ? {
      encontrado: true,
      nomes: varcoDevices.map(d => d.nome),
      ip: varcoBase.ip,
      uuid: varcoBase.uuid,
      tunnelUrl: varcoBase.uuid ? `https://${varcoBase.uuid}-80.tunnel.varco.cloud` : null,
      online: varcoBase.connected,
      faixas: varcoDevices.length,
      // Mdulo Classificador  COMPLETO
      classificador: {
        enabled:              raw.classifier?.classifier?.enabled ?? null,
        licensed:             raw.classifier?.classifier?.licensed ?? null,
        minProbability:       raw.classifier?.classifier?.minProbability ?? null,
        processingQueue:      raw.classifier?.classifier?.processingQueue ?? null,
        processingThreads:    raw.classifier?.classifier?.processingThreads ?? null,
        sceneType:            raw.classifier?.classifier?.sceneType ?? null,
        modelType:            raw.classifier?.classifier?.modelType ?? null,
        firstOnly:            raw.classifier?.classifier?.firstOnly ?? null,
        enableCharacteristics:raw.classifier?.classifier?.enableCharacteristics ?? null,
        enableSpeed:          raw.classifier?.classifier?.enableSpeed ?? null,
        triggerEnabled:       raw.classifier?.classifier?.triggerEnabled ?? null,
      },
      // OCR  relaço com classificador
      ocr: {
        enabled:              raw.ocr?.ocr?.enabled ?? null,
        countryCode:          raw.ocr?.ocr?.countryCode ?? null,
        maxPlates:            raw.ocr?.ocr?.maxPlates ?? null,
        vehicleType:          raw.ocr?.ocr?.vehicleType ?? null,
        useClassifierResult:  raw.ocr?.ocr?.useClassifierResult ?? null,  // CRÍTICO
        processingMode:       raw.ocr?.ocr?.processingMode ?? null,
        minProbPerChar:       raw.ocr?.ocr?.minProbPerChar ?? null,
        processingQueue:      raw.ocr?.ocr?.processingQueue ?? null,
        processingThreads:    raw.ocr?.ocr?.processingThreads ?? null,
        roiEnabled:           raw.ocr?.ocr?.roi?.enabled ?? null,
      },
      // Integraço VARCO cloud (caminho dos dados)
      varco: {
        enabled:    raw.varco?.remoteAccess?.varco?.enabled ?? null,
        edgeServer: raw.varco?.remoteAccess?.varco?.edgeServer ?? null,
        deviceName: raw.varco?.remoteAccess?.varco?.deviceName ?? null,
      },
      // FTP (alternativa de envio)
      ftp: {
        enabled:  raw.ftp?.ftp?.enable ?? raw.ftp?.enable ?? null,
        address:  raw.ftp?.ftp?.address ?? raw.ftp?.address ?? null,
      },
      // Servidores HTTP (integração direta)
      servers: raw.servers || {},
      serversConfigured: Object.keys(raw.servers || {}).length > 0,
      // IO Ports
      ioPorts: (raw.ioPorts || []).map(p => ({
        port: p.port, type: p.type, group: p.group,
        canTrigger: p.canTrigger, isReserved: p.isReserved,
      })),
      firmware: raw.firmware?.version ?? null,
      ntp:      raw.dateTime?.ntp?.server ?? null,
      heartbeat: varcoBase.lastSeen || null,
    } : { encontrado: false, nomes: [], ip: null };

    //  2. AxCross: buscar timeline de classificação (se banco disponãovel)
    let axcrossData = null;
    try {
      const pool = await conectar();
      const colResult = await pool.request().query(`
        SELECT TOP 1 COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'TBPassagens'
          AND (COLUMN_NAME LIKE '%classif%' OR COLUMN_NAME LIKE '%TipoVeiculo%')
        ORDER BY ORDINAL_POSITION
      `);
      const colClassif = colResult.recordset[0]?.COLUMN_NAME;

      if (colClassif) {
        const rq = pool.request();
        rq.input("equip", equipamento);
        rq.input("dtIni", new Date(Date.now() - parseInt(dias) * 24 * 60 * 60 * 1000));

        const stats = await rq.query(`
          SELECT
            COUNT(*) AS Total,
            SUM(CASE WHEN p.${colClassif} IS NOT NULL AND LEN(CAST(p.${colClassif} AS VARCHAR(100))) > 0 THEN 1 ELSE 0 END) AS ComClassif,
            MAX(p.DataPassagem) AS UltimaPassagem,
            MIN(p.DataPassagem) AS PrimeiraPassagem,
            AVG(CAST(p.Velocidade AS FLOAT)) AS VelocMedia
          FROM TBPassagens p
          LEFT JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
          WHERE e.Descricao = @equip AND p.DataPassagem >= @dtIni
        `);

        const distrib = await pool.request().input("equip", equipamento).input("dtIni", new Date(Date.now() - parseInt(dias) * 24 * 60 * 60 * 1000)).query(`
          SELECT COALESCE(NULLIF(CAST(p.${colClassif} AS VARCHAR(100)),''),'(sem classif.)') AS Tipo, COUNT(*) AS Total
          FROM TBPassagens p LEFT JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
          WHERE e.Descricao = @equip AND p.DataPassagem >= @dtIni
          GROUP BY NULLIF(CAST(p.${colClassif} AS VARCHAR(100)),'')
          ORDER BY Total DESC
        `);

        axcrossData = {
          conectado: true, colClassif,
          stats: stats.recordset[0],
          distribuicao: distrib.recordset,
          pctClassificado: stats.recordset[0]?.Total > 0
            ? Math.round((stats.recordset[0].ComClassif / stats.recordset[0].Total) * 100) : 0,
        };
      }
    } catch (_) {
      axcrossData = { conectado: false };
    }

    //  3. Anãolise cruzada automtica
    const analise = [];
    const causaRaiz = [];

    if (varcoConfig.encontrado) {
      const cls = varcoConfig.classificador;
      const ocr = varcoConfig.ocr;

      // CR-01: minProbability = 100
      if (cls.minProbability === 100) {
        causaRaiz.push({
          prioridade: "CRITICA", codigo: "CR-01",
          titulo: "MinProbability = 100% — apenas 100% confiança classifica",
          descricao: "Com minProbability=100, somente detecções com 100% de confiança recebem classificação. Na prática, quase nenhum veículo atinge isso  — ClassificacaoVeiculo sempre vazio.",
          valor_atual: `minProbability = ${cls.minProbability}`,
          valor_recomendado: "minProbability = 60 (recomendado: 60-75)",
          caminho_correcao: "Túnel VARCO → Equipamento → Reconhecimento → aba Classifier → slider Confiabilidade mínima",
          caminho_passos: [
            { icone: "1.", label: "Abrir Túnel VARCO", detalhe: "Clicar no botão [Abrir Túnel] — abre a interface do ITSCAM", url_path: "/equipment/recognition" },
            { icone: "2.", label: "Menu lateral: Equipamento", detalhe: "Clicar em 'Equipamento' no menu lateral esquerdo" },
            { icone: "3.", label: "Subitem: Reconhecimento", detalhe: "Clicar em 'Reconhecimento' dentro de Equipamento" },
            { icone: "4.", label: "Aba: Classifier", detalhe: "Na página Reconhecimento, clicar na aba 'Classifier' (segunda aba após Jidosha)" },
            { icone: "5.", label: "Slider: Confiabilidade mínima", detalhe: "Mover o slider ou digitar 60 no campo numérico ao lado do slider (era 100%)" },
            { icone: "OK", label: "Botão Aplicar", detalhe: "Clicar no botão 'Aplicar' no topo da página para salvar a configuração" },
          ],
          impacto: "100% das passagens sem classificação",
          tunnelUrl: varcoConfig.tunnelUrl,
          tunnelPath: "/equipment/recognition",
          api_endpoint: "PUT /api/equipment/classifier",
          api_payload: JSON.stringify({ classifier: { minProbability: 60 } }),
        });
      } else if (cls.minProbability > 80) {
        causaRaiz.push({
          prioridade: "ALTA", codigo: "CR-01B",
          titulo: `MinProbability alto (${cls.minProbability}%) — reduzir para 60-70`,
          descricao: `Threshold acima de 80% é muito restritivo. Muitos veículos não serão classificados.`,
          valor_atual: `minProbability = ${cls.minProbability}`,
          valor_recomendado: "minProbability = 60",
          caminho_correcao: "Túnel VARCO → Equipamento → Reconhecimento → Classifier → Confiabilidade mínima",
          caminho_passos: [
            { icone: "1.", label: "Abrir Túnel VARCO", detalhe: "Clicar no botão [Abrir Túnel]", url_path: "/equipment/recognition" },
            { icone: "2.", label: "Aba: Classifier", detalhe: "Equipamento → Reconhecimento → aba Classifier" },
            { icone: "3.", label: "Confiabilidade mínima", detalhe: "Alterar para 60%" },
            { icone: "OK", label: "Salvar + Reiniciar", detalhe: "Salvar e reiniciar o dispositivo" },
          ],
          tunnelUrl: varcoConfig.tunnelUrl,
          tunnelPath: "/equipment/recognition",
          api_endpoint: "PUT /api/equipment/classifier",
          api_payload: JSON.stringify({ classifier: { minProbability: 60 } }),
        });
      }

      // CR-02: useClassifierResult = false no OCR
      if (ocr.useClassifierResult === false) {
        causaRaiz.push({
          prioridade: "ALTA", codigo: "CR-02",
          titulo: "OCR não usa resultado do classificador (useClassifierResult = false)",
          descricao: "O módulo OCR está configurado para NÃO usar o resultado do classificador de veículos. A classificação detectada não é associada à placa no payload enviado ao AxCross.",
          valor_atual: "useClassifierResult = false",
          valor_recomendado: "useClassifierResult = true",
          caminho_correcao: "Aplicação via API apenas (⚠ campo não está visível na interface ITSCAM)",
          caminho_passos: [
            { icone: "!", label: "Campo invisível na UI do ITSCAM", detalhe: "O campo useClassifierResult NÃO aparece na interface gráfica do ITSCAM. Ele existe apenas na API REST do dispositivo." },
            { icone: "API", label: "Correção via Axion Manager", detalhe: "Use o botão 'Aplicar CR-02' neste painel. O sistema fará login automático no ITSCAM e enviará: PUT /api/equipment/ocr {ocr:{useClassifierResult:true}}" },
            { icone: "OK", label: "Validação", detalhe: "Após aplicar, o próximo veículo detectado deverá ter a classificação incluída no payload enviado ao AxCross" },
          ],
          impacto: "Classificação não é associada à detecção de placa no payload enviado ao AxCross",
          tunnelUrl: varcoConfig.tunnelUrl,
          tunnelPath: "/equipment/recognition",
          api_endpoint: "PUT /api/equipment/ocr",
          api_payload: JSON.stringify({ ocr: { useClassifierResult: true } }),
        });
      }

      // CR-03: Sem servidor HTTP configurado
      if (!varcoConfig.serversConfigured) {
        causaRaiz.push({
          prioridade: "MEDIA", codigo: "CR-03",
          titulo: "Sem servidor HTTP configurado — dados vão via VARCO cloud",
          descricao: "O campo 'servers' está vazio. Os dados são enviados via VARCO cloud (edge.varco.io) para o AxCross. Verificar se o mapeamento do campo ClassificacaoVeiculo está correto no receptor.",
          valor_atual: "servers = {} (vazio)",
          valor_recomendado: "Verificar configuração do receptor no servidor AxCross",
          caminho_correcao: "Túnel VARCO → Equipamento → Servidores → verificar integração",
          caminho_passos: [
            { icone: "1.", label: "Abrir Túnel VARCO", detalhe: "Clicar no botão [Abrir Túnel]", url_path: "/equipment/servers" },
            { icone: "2.", label: "Menu: Equipamento", detalhe: "Menu lateral esquerdo" },
            { icone: "3.", label: "Servidores", detalhe: "Verificar configuração dos servidores de destino" },
            { icone: "OK", label: "Validar mapeamento", detalhe: "Confirmar que ClassificacaoVeiculo está mapeado no AxCross" },
          ],
          impacto: "Classificação depende do mapeamento VARCO cloud → AxCross",
          tunnelUrl: varcoConfig.tunnelUrl,
          tunnelPath: "/equipment/servers",
          api_endpoint: null,
        });
      }

      // CR-04: sceneType = 0
      if (cls.sceneType === 0) {
        causaRaiz.push({
          prioridade: "MEDIA", codigo: "CR-04",
          titulo: "SceneType = 0 — cena não otimizada para o tipo de instalação",
          descricao: "sceneType=0 indica cena 'genérica'. Para rodovias/fiscalização, recomenda-se configurar o tipo de cena adequado ao cenário (highway, urban, etc.) para melhorar a acurácia do classificador.",
          valor_atual: `sceneType = ${cls.sceneType}`,
          valor_recomendado: "sceneType = 1 (highway) ou 2 (urban)",
          caminho_correcao: "Interface ITSCAM → Equipamento → Reconhecimento → Classifier → Scene Type",
          tunnelUrl: varcoConfig.tunnelUrl,
          api_endpoint: "PUT /api/equipment/classifier",
          api_payload: JSON.stringify({ classifier: { sceneType: 1 } }),
        });
      }

      // CR-05: Classificador desabilitado
      if (cls.enabled === false) {
        causaRaiz.push({
          prioridade: "CRITICA", codigo: "CR-05",
          titulo: "Classificador DESABILITADO",
          descricao: "O classificador está completamente desativado.",
          valor_atual: "enabled = false",
          valor_recomendado: "enabled = true",
          tunnelUrl: varcoConfig.tunnelUrl,
          api_endpoint: "PUT /api/equipment/classifier",
          api_payload: JSON.stringify({ classifier: { enabled: true } }),
        });
      }

      // ANÁLISE DE CONFORMIDADE
      if (axcrossData?.conectado && axcrossData.pctClassificado === 0 && cls.enabled === true) {
        analise.push({
          tipo: "confirmacao",
          titulo: "Cruzamento VARCO  AxCross confirma causa raiz",
          detalhe: `VARCO: enabled=true, minProbability=${cls.minProbability}, useClassifierResult=${ocr.useClassifierResult} | AxCross: ${axcrossData.pctClassificado}% classificado. As configurações explicam a ausncia de classificação.`,
        });
      }
    }

    return res.json({
      ok: true,
      equipamento,
      varco: varcoConfig,
      axcross: axcrossData,
      causaRaiz,
      analise,
      resumo: {
        varcoEncontrado: varcoConfig.encontrado,
        axcrossConectado: axcrossData?.conectado || false,
        classificadorEnabled: varcoConfig.classificador?.enabled,
        minProbability: varcoConfig.classificador?.minProbability,
        pctClassificado: axcrossData?.pctClassificado ?? null,
        severidade: causaRaiz.find(c => c.prioridade === "CRITICA") ? "CRITICA"
          : causaRaiz.find(c => c.prioridade === "ALTA") ? "ALTA" : "OK",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, erro: err.message });
  }
}


// 
// GET /api/axcross/frota-analise  Anãolise completa da frota VARCO  AxCross
// 
export async function frotaAnalise(req, res) {
  try {
    const { minProbMax, firmware, sceneType, semClassifOnly, selecionados } = req.query;
    const varcoRes = await fetch(
      `http://localhost:3100/api/varco/auditoria`,
      { headers: { "x-api-token": process.env.API_TOKEN || "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3" } }
    ).then(r => r.json()).catch(() => null);
    if (!varcoRes?.devices?.length) return res.status(503).json({ ok: false, erro: "VARCO API indisponãovel" });

    const equipMap = {};
    for (const d of varcoRes.devices) {
      const key = d.nome?.split(" - ")[0]?.trim(); if (!key) continue;
      if (!equipMap[key]) equipMap[key] = { nome: key, nomeAxCross: key.replace(/O/g,"0"), ip: d.ip, uuid: d.uuid, tunnelUrl: d.uuid?`https://${d.uuid}-80.tunnel.varco.cloud`:null, online: d.connected, faixas: 0, raw: d.raw };
      equipMap[key].faixas++;
    }

    const equipamentos = Object.values(equipMap).map(eq => {
      const raw = eq.raw || {}, cls = raw.classifier?.classifier || {}, ocr = raw.ocr?.ocr || {}, varcoInt = raw.varco?.remoteAccess?.varco || {};
      const problemas = [];
      if (cls.minProbability === 100)          problemas.push({ codigo:"CR-01", prioridade:"CRITICA", campo:"minProbability", atual:cls.minProbability, recomendado:60, api:"PUT /api/equipment/classifier", payload:JSON.stringify({classifier:{minProbability:60}}) });
      if (cls.minProbability>80&&cls.minProbability<100) problemas.push({ codigo:"CR-01B", prioridade:"ALTA", campo:"minProbability", atual:cls.minProbability, recomendado:70, api:"PUT /api/equipment/classifier", payload:JSON.stringify({classifier:{minProbability:70}}) });
      if (ocr.useClassifierResult===false)     problemas.push({ codigo:"CR-02", prioridade:"ALTA", campo:"useClassifierResult", atual:false, recomendado:true, api:"PUT /api/equipment/ocr", payload:JSON.stringify({ocr:{useClassifierResult:true}}) });
      if (cls.sceneType===0)                   problemas.push({ codigo:"CR-04", prioridade:"MEDIA", campo:"sceneType", atual:0, recomendado:1, api:"PUT /api/equipment/classifier", payload:JSON.stringify({classifier:{sceneType:1}}) });
      if (cls.enabled===false)                 problemas.push({ codigo:"CR-05", prioridade:"CRITICA", campo:"enabled", atual:false, recomendado:true, api:"PUT /api/equipment/classifier", payload:JSON.stringify({classifier:{enabled:true}}) });
      const sev = problemas.find(p=>p.prioridade==="CRITICA")?"CRITICA":problemas.find(p=>p.prioridade==="ALTA")?"ALTA":problemas.length>0?"MEDIA":"OK";
      return { ...eq, firmware:raw.firmware?.version, classificador:{ enabled:cls.enabled, licensed:cls.licensed, minProbability:cls.minProbability, sceneType:cls.sceneType, processingThreads:cls.processingThreads, modelType:cls.modelType, enableCharacteristics:cls.enableCharacteristics, firstOnly:cls.firstOnly }, ocr:{ enabled:ocr.enabled, useClassifierResult:ocr.useClassifierResult, vehicleType:ocr.vehicleType }, integracao:{ varcoCloud:varcoInt.enabled, edgeServer:varcoInt.edgeServer, ftpEnabled:raw.ftp?.ftp?.enable??raw.ftp?.enable, serversHttp:Object.keys(raw.servers||{}).length>0, serversCount:Object.keys(raw.servers||{}).length, serversDetalhe:Object.keys(raw.servers||{}) }, problemas, severidade:sev };
    });

    let filtrados = equipamentos;
    if (minProbMax)           filtrados = filtrados.filter(e => e.classificador.minProbability <= parseInt(minProbMax));
    if (firmware)             filtrados = filtrados.filter(e => e.firmware === firmware);
    if (sceneType!==undefined) filtrados = filtrados.filter(e => String(e.classificador.sceneType) === sceneType);
    if (semClassifOnly==="true") filtrados = filtrados.filter(e => e.problemas.length > 0);
    if (selecionados)         filtrados = filtrados.filter(e => selecionados.split(",").includes(e.nomeAxCross) || selecionados.split(",").includes(e.nome));

    const stats = { total:equipamentos.length, criticos:equipamentos.filter(e=>e.severidade==="CRITICA").length, altos:equipamentos.filter(e=>e.severidade==="ALTA").length, ok:equipamentos.filter(e=>e.severidade==="OK").length, online:equipamentos.filter(e=>e.online).length, minProb100:equipamentos.filter(e=>e.classificador.minProbability===100).length, useClassifFalse:equipamentos.filter(e=>e.ocr.useClassifierResult===false).length, firmwares:[...new Set(equipamentos.map(e=>e.firmware).filter(Boolean))], filtrados:filtrados.length };
    return res.json({ ok:true, equipamentos:filtrados, stats, filtrosAplicados:{minProbMax,firmware,sceneType,semClassifOnly,selecionados}, timestamp:new Date().toISOString() });
  } catch(err) { return res.status(500).json({ ok:false, erro:err.message }); }
}

// Timeline diria de classificação: por equipamento, agrupa por DIA

// GET /api/axcross/mapa-dados
// Cruza TODOS os equipamentos AxCross (SQL) com o VARCO e retorna
// a tabela completa: fonte de dados, caminho, onde configurar, classifica?
export async function mapaDados(req, res) {
  try {
    // 1. Buscar todos os dispositivos VARCO
    const varcoRes = await fetch(
      `http://localhost:3100/api/varco/auditoria`,
      { headers: { "x-api-token": process.env.API_TOKEN || "4ca85296b69704ff408e570501c2480af8457da858defbced704ba4ad20d8bf3" } }
    ).then(r => r.json()).catch(() => null);

    const varcoMap = {}; // VARCO ID → config
    if (varcoRes?.devices?.length) {
      for (const d of varcoRes.devices) {
        const key = d.nome?.split(" - ")[0]?.trim(); if (!key) continue;
        const axKey = key.replace(/O/g, "0");
        if (!varcoMap[axKey]) {
          const cls = d.raw?.classifier?.classifier || {};
          const ocr = d.raw?.ocr?.ocr || {};
          varcoMap[axKey] = {
            noVarco: true,
            tunnelUrl: d.uuid ? `https://${d.uuid}-80.tunnel.varco.cloud` : null,
            minProbability: cls.minProbability,
            useClassifierResult: ocr.useClassifierResult,
            classifEnabled: cls.enabled,
            varcoCloud: d.raw?.varco?.remoteAccess?.varco?.enabled ?? true,
            ftpEnabled: d.raw?.ftp?.ftp?.enable ?? d.raw?.ftp?.enable ?? null,
            serversHttp: Object.keys(d.raw?.servers || {}).length > 0,
            firmware: d.raw?.firmware?.version,
            ip: d.ip,
            online: d.connected,
          };
        }
      }
    }

    // 2. Buscar equipamentos do banco AxCross (SQL)
    let axEquipamentos = [];
    try {
      const pool = await conectar();
      const result = await pool.request().query(`
        SELECT DISTINCT
          e.Descricao         AS nome,
          e.Local             AS local,
          COUNT(p.Id)         AS totalPassagens,
          SUM(CASE WHEN p.ClassificacaoVeiculo IS NOT NULL AND LEN(CAST(p.ClassificacaoVeiculo AS VARCHAR(100))) > 0 THEN 1 ELSE 0 END) AS comClassif,
          MAX(p.DataPassagem) AS ultimaPassagem
        FROM TBEquipamentos e
        LEFT JOIN TBPassagens p ON p.EquipamentoId = e.Id
          AND p.DataPassagem >= DATEADD(day, -7, GETDATE())
        GROUP BY e.Descricao, e.Local
        ORDER BY e.Descricao
      `);
      axEquipamentos = result.recordset;
    } catch (_) { /* SQL offline — usar só VARCO */ }

    // 3. Cruzar
    const tabela = [];

    // Adicionar todos da SQL, enriquecidos com VARCO
    const jaAdicionados = new Set();
    for (const eq of axEquipamentos) {
      const nome = eq.nome?.trim();
      if (!nome) continue;
      jaAdicionados.add(nome);
      const v = varcoMap[nome];
      const pctClassif = eq.totalPassagens > 0 ? Math.round((eq.comClassif / eq.totalPassagens) * 100) : null;
      const classifica = pctClassif !== null ? pctClassif > 5 : null;

      const row = {
        nome,
        local: eq.local || "—",
        totalPassagens: eq.totalPassagens,
        comClassif: eq.comClassif,
        pctClassif,
        ultimaPassagem: eq.ultimaPassagem,
        noVarco: !!v,
        fonte: v ? "VARCO Cloud" : "HTTP Direto",
        classifica,
        tunnelUrl: v?.tunnelUrl || null,
        ip: v?.ip || null,
        online: v?.online ?? null,
        firmware: v?.firmware || null,
        minProbability: v?.minProbability ?? null,
        useClassifierResult: v?.useClassifierResult ?? null,
        classifEnabled: v?.classifEnabled ?? null,
        varcoCloud: v?.varcoCloud ?? null,
        ftpEnabled: v?.ftpEnabled ?? null,
        serversHttp: v?.serversHttp ?? null,
        problemas: [],
        ondeConfigurar: null,
      };

      // Detectar problemas e onde configurar
      if (v) {
        if (v.minProbability === 100) row.problemas.push("minProbability=100");
        if (v.useClassifierResult === false) row.problemas.push("useClassifierResult=false");
        if (v.classifEnabled === false) row.problemas.push("Classificador desabilitado");
        row.ondeConfigurar = v.tunnelUrl
          ? `${v.tunnelUrl}/equipment/recognition`
          : "Túnel VARCO → Equipamento → Reconhecimento → Classifier";
        row.caminhoCorrecao = "Túnel VARCO → Equipamento → Reconhecimento → Classifier → Confiabilidade mínima = 60%\n+ OCR → Usar resultado do Classificador = true";
      } else {
        row.ondeConfigurar = "ITSCAM → Servidores → verificar servidor AxCross";
        row.caminhoCorrecao = "ITSCAM → Servidores → confirmar que AxCross está como destino HTTP";
      }

      tabela.push(row);
    }

    // Adicionar VARCO que não estão no SQL (edge case)
    for (const [nome, v] of Object.entries(varcoMap)) {
      if (jaAdicionados.has(nome)) continue;
      tabela.push({
        nome,
        local: "—",
        totalPassagens: 0,
        comClassif: 0,
        pctClassif: null,
        ultimaPassagem: null,
        noVarco: true,
        fonte: "VARCO Cloud",
        classifica: null,
        tunnelUrl: v.tunnelUrl,
        ip: v.ip,
        online: v.online,
        firmware: v.firmware,
        minProbability: v.minProbability,
        useClassifierResult: v.useClassifierResult,
        classifEnabled: v.classifEnabled,
        varcoCloud: v.varcoCloud,
        ftpEnabled: v.ftpEnabled,
        serversHttp: v.serversHttp,
        problemas: [
          ...(v.minProbability === 100 ? ["minProbability=100"] : []),
          ...(v.useClassifierResult === false ? ["useClassifierResult=false"] : []),
        ],
        ondeConfigurar: v.tunnelUrl ? `${v.tunnelUrl}/equipment/recognition` : "Túnel VARCO → Equipamento → Reconhecimento",
        caminhoCorrecao: "Túnel VARCO → Equipamento → Reconhecimento → Classifier → Confiabilidade mínima = 60%",
      });
    }

    tabela.sort((a, b) => a.nome.localeCompare(b.nome));

    const stats = {
      total: tabela.length,
      noVarco: tabela.filter(e => e.noVarco).length,
      httpDireto: tabela.filter(e => !e.noVarco).length,
      classificam: tabela.filter(e => e.classifica === true).length,
      naoClassificam: tabela.filter(e => e.classifica === false).length,
      semDados: tabela.filter(e => e.classifica === null).length,
    };

    return res.json({ ok: true, tabela, stats, timestamp: new Date().toISOString() });
  } catch (err) {
    return res.status(500).json({ ok: false, erro: err.message });
  }
}

// Timeline diria de classificação: por equipamento, agrupa por DIA
// Identifica se o problema é intermitente (alguns dias funcionam) ou permanente
// Query params: equipamento (obrigatrio), dias (padro 60), dataInicio, dataFim
// 
export async function classificacaoTimeline(req, res) {
  try {
    const pool = await conectar();
    const { equipamento, dias = 60, dataInicio, dataFim } = req.query;

    if (!equipamento) return res.status(400).json({ erro: "Parmetro 'equipamento' obrigatrio" });

    // Descobrir coluna de classificação
    const colResult = await pool.request().query(`
      SELECT TOP 1 COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'TBPassagens'
        AND (COLUMN_NAME LIKE '%classif%' OR COLUMN_NAME LIKE '%TipoVeiculo%' OR COLUMN_NAME LIKE '%VehicleType%')
      ORDER BY ORDINAL_POSITION
    `);
    const colClassif = colResult.recordset[0]?.COLUMN_NAME;
    if (!colClassif) return res.status(200).json({ ok: false, mensagem: "Coluna de classificação não encontrada", colClassif: null, timeline: [] });

    const rq = pool.request();
    rq.input("equip", equipamento);

    if (dataInicio) rq.input("dtIni", new Date(dataInicio));
    else { rq.input("dtIni", new Date(Date.now() - parseInt(dias) * 24 * 60 * 60 * 1000)); }
    if (dataFim) rq.input("dtFim", new Date(dataFim));
    else rq.input("dtFim", new Date());

    // Timeline por dia
    const timelineResult = await rq.query(`
      SELECT
        CAST(p.DataPassagem AS DATE)  AS Dia,
        COUNT(*)                      AS Total,
        SUM(CASE WHEN p.${colClassif} IS NOT NULL AND LEN(CAST(p.${colClassif} AS VARCHAR(100))) > 0 THEN 1 ELSE 0 END) AS ComClassif,
        SUM(CASE WHEN p.${colClassif} IS NULL OR LEN(CAST(p.${colClassif} AS VARCHAR(100))) = 0 THEN 1 ELSE 0 END)     AS SemClassif,
        -- Tipos de classificação encontrados neste dia (top 3)
        STRING_AGG(DISTINCT CAST(p.${colClassif} AS VARCHAR(50)), ', ')
          WITHIN GROUP (ORDER BY CAST(p.${colClassif} AS VARCHAR(50))) AS TiposNoDia
      FROM TBPassagens p
      LEFT JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
      WHERE e.Descricao = @equip
        AND p.DataPassagem >= @dtIni
        AND p.DataPassagem <= @dtFim
      GROUP BY CAST(p.DataPassagem AS DATE)
      ORDER BY Dia DESC
    `);

    // Timeline por hora do dia (para identificar horrios problemticos)
    const rq2 = pool.request();
    rq2.input("equip", equipamento);
    rq2.input("dtIni", dataInicio ? new Date(dataInicio) : new Date(Date.now() - parseInt(dias) * 24 * 60 * 60 * 1000));
    rq2.input("dtFim", dataFim ? new Date(dataFim) : new Date());
    const porHoraResult = await rq2.query(`
      SELECT
        DATEPART(HOUR, p.DataPassagem) AS Hora,
        COUNT(*)                       AS Total,
        SUM(CASE WHEN p.${colClassif} IS NOT NULL AND LEN(CAST(p.${colClassif} AS VARCHAR(100))) > 0 THEN 1 ELSE 0 END) AS ComClassif
      FROM TBPassagens p
      LEFT JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
      WHERE e.Descricao = @equip
        AND p.DataPassagem >= @dtIni
        AND p.DataPassagem <= @dtFim
      GROUP BY DATEPART(HOUR, p.DataPassagem)
      ORDER BY Hora
    `);

    // altima passagem COM classificação
    const rq3 = pool.request();
    rq3.input("equip", equipamento);
    const ultimaComClassif = await rq3.query(`
      SELECT TOP 1 p.DataPassagem, p.Placa, p.${colClassif} AS ClassificacaoVeiculo
      FROM TBPassagens p
      LEFT JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
      WHERE e.Descricao = @equip
        AND p.${colClassif} IS NOT NULL
        AND LEN(CAST(p.${colClassif} AS VARCHAR(100))) > 0
      ORDER BY p.DataPassagem DESC
    `);

    // Diagnãostico automtico
    const timeline = timelineResult.recordset;
    const diasComClassif  = timeline.filter(d => d.ComClassif > 0).length;
    const diasSemClassif  = timeline.filter(d => d.ComClassif === 0).length;
    const diasParcial     = timeline.filter(d => d.ComClassif > 0 && d.SemClassif > 0).length;

    let diagnostico = "sem_dados";
    let diagnosticoDetalhe = "";
    if (timeline.length === 0) {
      diagnostico = "sem_dados";
      diagnosticoDetalhe = "Nenhum dado encontrado para este equipamento no perodo";
    } else if (diasComClassif === 0) {
      diagnostico = "nunca_classifica";
      diagnosticoDetalhe = "Equipamento NUNCA classificou no perodo  possvel Classificador.enabled=false ou problema estrutural";
    } else if (diasSemClassif === 0) {
      diagnostico = "sempre_classifica";
      diagnosticoDetalhe = "Equipamento SEMPRE classifica  funcionando corretamente";
    } else if (diasComClassif > 0 && diasSemClassif > 0 && diasParcial === 0) {
      diagnostico = "intermitente_dia";
      diagnosticoDetalhe = `Problema INTERMITENTE por dia: ${diasComClassif} dia(s) com classificação / ${diasSemClassif} dia(s) sem  possvel reinicialização do classificador ou problema de firmware`;
    } else {
      diagnostico = "misto";
      diagnosticoDetalhe = `${diasParcial} dia(s) com classificação parcial  equipamento oscila dentro do mesmo dia`;
    }

    return res.json({
      ok: true,
      equipamento,
      colClassif,
      periodo: { dias: parseInt(dias), inicio: dataInicio, fim: dataFim },
      timeline,
      porHora: porHoraResult.recordset,
      ultimaComClassif: ultimaComClassif.recordset[0] || null,
      resumo: { diasComClassif, diasSemClassif, diasParcial, totalDias: timeline.length },
      diagnostico,
      diagnosticoDetalhe,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ ok: false, erro: err.message });
  }
}

// Estatsticas de classificação por equipamento + distribuiço por tipo
// Query params: classificacao (filtro), equipamento, dataInicio, dataFim
// 
export async function classificacaoStats(req, res) {
  try {
    const pool = await conectar();
    const { classificacao, equipamento, dataInicio, dataFim } = req.query;

    // 1. Descobrir nome real da coluna de classificação em TBPassagens
    const colResult = await pool.request().query(`
      SELECT TOP 1 COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'TBPassagens'
        AND (COLUMN_NAME LIKE '%classif%' OR COLUMN_NAME LIKE '%ClassificacaoVeiculo%'
             OR COLUMN_NAME LIKE '%TipoVeiculo%' OR COLUMN_NAME LIKE '%VehicleType%')
      ORDER BY ORDINAL_POSITION
    `);
    const colClassif = colResult.recordset[0]?.COLUMN_NAME || null;

    if (!colClassif) {
      return res.json({
        ok: false,
        mensagem: "Coluna de classificação não encontrada em TBPassagens",
        colClassif: null,
        porEquipamento: [],
        distribuicao: [],
        totais: { total: 0, comClassif: 0, semClassif: 0 }
      });
    }

    // Montar filtros dinãomicos
    const where = [];
    const req2 = pool.request();
    if (classificacao && classificacao !== "todos") {
      where.push(`p.${colClassif} = @classif`);
      req2.input("classif", classificacao);
    }
    if (equipamento) {
      where.push(`e.Descricao LIKE @equip`);
      req2.input("equip", `%${equipamento}%`);
    }
    if (dataInicio) {
      where.push(`p.DataPassagem >= @dtIni`);
      req2.input("dtIni", new Date(dataInicio));
    }
    if (dataFim) {
      where.push(`p.DataPassagem <= @dtFim`);
      req2.input("dtFim", new Date(dataFim));
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    // 2. Estatsticas por equipamento
    const porEquip = await req2.query(`
      SELECT
        e.Descricao AS Equipamento,
        e.Id AS IdEquipamento,
        COUNT(*) AS Total,
        SUM(CASE WHEN p.${colClassif} IS NOT NULL AND CAST(p.${colClassif} AS VARCHAR(100)) != '' THEN 1 ELSE 0 END) AS ComClassificacao,
        SUM(CASE WHEN p.${colClassif} IS NULL OR CAST(p.${colClassif} AS VARCHAR(100)) = '' THEN 1 ELSE 0 END) AS SemClassificacao,
        MAX(p.DataPassagem) AS UltimaPassagem,
        MIN(CASE WHEN p.${colClassif} IS NOT NULL AND CAST(p.${colClassif} AS VARCHAR(100)) != '' THEN p.DataPassagem ELSE NULL END) AS PrimeiraComClassif
      FROM TBPassagens p
      LEFT JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
      ${whereClause}
      GROUP BY e.Descricao, e.Id
      ORDER BY Total DESC
    `);

    // 3. Distribuiço por tipo de classificação
    const req3 = pool.request();
    if (dataInicio) req3.input("dtIni", new Date(dataInicio));
    if (dataFim)    req3.input("dtFim", new Date(dataFim));
    const distWhere = [];
    if (dataInicio) distWhere.push("p.DataPassagem >= @dtIni");
    if (dataFim)    distWhere.push("p.DataPassagem <= @dtFim");
    const distClause = distWhere.length > 0 ? `WHERE ${distWhere.join(" AND ")}` : "";

    const distrib = await req3.query(`
      SELECT
        COALESCE(CAST(p.${colClassif} AS VARCHAR(100)), '(sem classificação)') AS Classificacao,
        COUNT(*) AS Total,
        CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() AS DECIMAL(5,1)) AS Percentual
      FROM TBPassagens p
      ${distClause}
      GROUP BY CAST(p.${colClassif} AS VARCHAR(100))
      ORDER BY Total DESC
    `);

    // 4. Totais gerais
    const req4 = pool.request();
    if (dataInicio) req4.input("dtIni", new Date(dataInicio));
    if (dataFim)    req4.input("dtFim", new Date(dataFim));
    const totaisWhere = distWhere.length > 0 ? `WHERE ${distWhere.join(" AND ")}` : "";
    const totais = await req4.query(`
      SELECT
        COUNT(*) AS Total,
        SUM(CASE WHEN ${colClassif} IS NOT NULL AND CAST(${colClassif} AS VARCHAR(100)) != '' THEN 1 ELSE 0 END) AS ComClassificacao,
        SUM(CASE WHEN ${colClassif} IS NULL OR CAST(${colClassif} AS VARCHAR(100)) = '' THEN 1 ELSE 0 END) AS SemClassificacao
      FROM TBPassagens p
      ${totaisWhere}
    `);

    return res.json({
      ok: true,
      colClassif,
      porEquipamento: porEquip.recordset,
      distribuicao: distrib.recordset,
      totais: totais.recordset[0],
      filtrosAplicados: { classificacao, equipamento, dataInicio, dataFim },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ ok: false, erro: err.message });
  }
}

// """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

// GET /api/axcross/passagens
export async function statsPassagens(req, res) {
  try {
    const pool = await conectar();

    const total = await pool.request().query("SELECT COUNT(*) AS total FROM TBPassagens");

    const porLocal = await pool.request().query(`
      SELECT TOP 10 l.Nome, COUNT(*) AS total
      FROM TBPassagens p
      JOIN TBLocais l ON p.LocalId = l.Id
      GROUP BY l.Nome
      ORDER BY total DESC
    `);

    const ultimas = await pool.request().query(`
      SELECT TOP 10
        p.Id, p.Placa, p.DataPassagem, p.Velocidade,
        l.Nome AS Local, f.Nome AS Faixa
      FROM TBPassagens p
      LEFT JOIN TBLocais l ON p.LocalId = l.Id
      LEFT JOIN TBFaixas f ON p.FaixaId = f.Id
      ORDER BY p.DataPassagem DESC
    `);

    return res.json({
      total: total.recordset[0].total,
      porLocal: porLocal.recordset,
      ultimas: ultimas.recordset
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axcross/locais  locais de cruzamento cadastrados
export async function listarLocais(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT
        l.Id, l.Nome, l.Endereco, l.Cidade, l.UF, l.Ativo,
        l.Latitude, l.Longitude,
        COUNT(e.Id) AS TotalEquipamentos
      FROM TBLocais l
      LEFT JOIN TBEquipamentos e ON e.LocalId = l.Id
      GROUP BY l.Id, l.Nome, l.Endereco, l.Cidade, l.UF, l.Ativo, l.Latitude, l.Longitude
      ORDER BY l.Nome
    `);

    return res.json({ total: result.recordset.length, locais: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axcross/diagnostico-classificacao  diagnãostico do campo Classificação nas faixas
export async function diagnosticoClassificacao(req, res) {
  try {
    const pool = await conectar();
    const resultado = {};

    // 1. Colunas da tabela TBPassagens
    try {
      const colunas = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'TBPassagens'
        ORDER BY ORDINAL_POSITION
      `);
      resultado.colunas_tbpassagens = colunas.recordset;
      resultado.tem_classificacao = colunas.recordset.some(c =>
        c.COLUMN_NAME.toLowerCase().includes('classif')
      );
      resultado.colunas_classificacao = colunas.recordset.filter(c =>
        c.COLUMN_NAME.toLowerCase().includes('classif')
      );
    } catch (e) {
      resultado.colunas_tbpassagens = null;
      resultado.erro_colunas = e.message;
    }

    // 2. Colunas da tabela TBFaixas
    try {
      const colunasFaixas = await pool.request().query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'TBFaixas'
        ORDER BY ORDINAL_POSITION
      `);
      resultado.colunas_tbfaixas = colunasFaixas.recordset;
    } catch (e) {
      resultado.colunas_tbfaixas = null;
      resultado.erro_faixas = e.message;
    }

    // 3. Amostra de passagens com classificação (TOP 10)
    try {
      const colunasResult = resultado.colunas_tbpassagens || [];
      const colClassif = colunasResult.find(c => c.COLUMN_NAME.toLowerCase().includes('classif'));
      if (colClassif) {
        const amostra = await pool.request().query(`
          SELECT TOP 10
            p.Id, p.Placa, p.DataPassagem,
            p.${colClassif.COLUMN_NAME} AS ClassificacaoVeiculo,
            f.Nome AS Faixa,
            l.Nome AS Local
          FROM TBPassagens p
          LEFT JOIN TBFaixas f ON p.FaixaId = f.Id
          LEFT JOIN TBLocais l ON p.LocalId = l.Id
          ORDER BY p.DataPassagem DESC
        `);
        resultado.amostra_passagens = amostra.recordset;

        // 4. Contagem de nulos vs preenchidos
        const stats = await pool.request().query(`
          SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN ${colClassif.COLUMN_NAME} IS NULL OR CAST(${colClassif.COLUMN_NAME} AS VARCHAR(50)) = '' THEN 1 ELSE 0 END) AS nulos,
            SUM(CASE WHEN ${colClassif.COLUMN_NAME} IS NOT NULL AND CAST(${colClassif.COLUMN_NAME} AS VARCHAR(50)) != '' THEN 1 ELSE 0 END) AS preenchidos
          FROM TBPassagens
        `);
        resultado.stats_classificacao = stats.recordset[0];
      } else {
        resultado.amostra_passagens = null;
        resultado.campo_ausente = true;
      }
    } catch (e) {
      resultado.amostra_passagens = null;
      resultado.erro_amostra = e.message;
    }

    // 5. Verificar a query atual do endpoint /passagens (documentado)
    resultado.query_atual_passagens = {
      descricao: "A query atual em statsPassagens retorna apenas: Id, Placa, DataPassagem, Velocidade, Local (JOIN TBLocais), Faixa (JOIN TBFaixas)",
      tem_classificacao: false,
      problema_identificado: !resultado.tem_classificacao
        ? "A coluna Classificacao NÒO EXISTE em TBPassagens"
        : "A coluna existe mas NÒO está sendo includa na query do endpoint /passagens"
    };

    // 6. Verificar tabelas relacionadas com classificação de veculos
    try {
      const tabRelac = await pool.request().query(`
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
          AND (TABLE_NAME LIKE '%Classif%' OR TABLE_NAME LIKE '%Veiculo%' OR TABLE_NAME LIKE '%Tipo%')
        ORDER BY TABLE_NAME
      `);
      resultado.tabelas_classificacao = tabRelac.recordset;
    } catch (e) {
      resultado.tabelas_classificacao = [];
    }

    return res.json({
      ok: true,
      diagnostico: resultado,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}

// GET /api/axcross/operacoes  operações de monitoramento recentes
export async function listarOperacoes(req, res) {
  try {
    const pool = await conectar();
    const result = await pool.request().query(`
      SELECT TOP 50
        o.Id, o.Descricao, o.DataInicio, o.DataFim, o.Status,
        l.Nome AS Local,
        e.Nome AS Equipamento
      FROM TBOperacoes o
      LEFT JOIN TBLocais      l ON o.LocalId       = l.Id
      LEFT JOIN TBEquipamentos e ON o.EquipamentoId = e.Id
      ORDER BY o.DataInicio DESC
    `);

    return res.json({ total: result.recordset.length, operacoes: result.recordset });
  } catch (err) {
    return res.status(500).json({ erro: err.message });
  }
}


