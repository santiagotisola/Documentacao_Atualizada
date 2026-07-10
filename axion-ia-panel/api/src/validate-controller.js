import axios from "axios";
import { conectar as conectarAxCross } from "./services/axcross-db.js";
import { conectar as conectarAxHub } from "./services/axhub-db.js";

// ─── helpers ─────────────────────────────────────────────────────────────────

function status(ok, detalhes = {}) {
  return { ok, ...detalhes };
}

function segundosAtras(data) {
  if (!data) return null;
  return Math.round((Date.now() - new Date(data).getTime()) / 1000);
}

// ─── ETAPA 1 — Dados de origem (AxCross) ─────────────────────────────────────

async function validarAxCross({ placa, equipamento, faixa }) {
  try {
    const pool = await conectarAxCross();

    // Passagens recentes da placa (últimas 24 h)
    const passagensResult = await pool
      .request()
      .input("placa", placa)
      .query(`
        SELECT TOP 5
          p.Id, p.Placa, p.DataPassagem, p.Velocidade,
          e.Nome  AS Equipamento, e.Id AS EquipamentoId,
          f.Nome  AS Faixa, f.Sentido,
          l.Nome  AS Local
        FROM TBPassagens p
        LEFT JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
        LEFT JOIN TBFaixas       f ON p.FaixaId       = f.Id
        LEFT JOIN TBLocais       l ON p.LocalId       = l.Id
        WHERE p.Placa = @placa
          AND p.DataPassagem >= DATEADD(HOUR, -24, GETDATE())
        ORDER BY p.DataPassagem DESC
      `);

    const passagens = passagensResult.recordset;

    // Validar equipamento informado
    let equipamentoInfo = null;
    if (equipamento) {
      const eqResult = await pool
        .request()
        .input("nome", equipamento)
        .query(`
          SELECT TOP 1
            e.Id, e.Nome, e.IP, e.Ativo,
            h.Status       AS HeartbeatStatus,
            h.UltimoSinal
          FROM TBEquipamentos e
          LEFT JOIN TBHeartbeatEquipamentos h ON h.EquipamentoId = e.Id
          WHERE e.Nome = @nome
        `);
      equipamentoInfo = eqResult.recordset[0] || null;
    }

    // Validar faixa informada
    let faixaInfo = null;
    if (faixa) {
      const fxResult = await pool
        .request()
        .input("nome", faixa)
        .query(`
          SELECT TOP 1 Id, Nome, Sentido, Ativa
          FROM TBFaixas
          WHERE Nome = @nome OR Sentido = @nome
        `);
      faixaInfo = fxResult.recordset[0] || null;
    }

    const encontrou = passagens.length > 0;
    const ultimaPassagem = passagens[0] || null;
    const idadeSegundos = ultimaPassagem ? segundosAtras(ultimaPassagem.DataPassagem) : null;
    const timestampValido = idadeSegundos !== null && idadeSegundos < 86400;

    let diagnostico = null;
    if (!encontrou) {
      diagnostico = "Nenhuma passagem encontrada nas últimas 24h para esta placa.";
    } else if (equipamentoInfo && !equipamentoInfo.Ativo) {
      diagnostico = "Equipamento encontrado mas está INATIVO no cadastro.";
    } else if (equipamentoInfo && equipamentoInfo.HeartbeatStatus === "Offline") {
      diagnostico = `Equipamento offline desde ${equipamentoInfo.UltimoSinal}.`;
    }

    return status(encontrou && timestampValido, {
      passagens_encontradas: passagens.length,
      ultima_passagem: ultimaPassagem,
      idade_segundos: idadeSegundos,
      timestamp_valido: timestampValido,
      equipamento: equipamentoInfo,
      faixa: faixaInfo,
      diagnostico
    });
  } catch (err) {
    return status(false, { erro: err.message });
  }
}

// ─── ETAPA 2 — AxHub: consumo do evento ──────────────────────────────────────

async function validarAxHub({ placa }) {
  try {
    const pool = await conectarAxHub();

    // Passagens recebidas pelo AxHub para esta placa (últimas 24 h)
    const passResult = await pool
      .request()
      .input("placa", placa)
      .query(`
        SELECT TOP 5
          p.IdPassagem, p.DataHoraPassagem, p.Placa, p.Velocidade,
          e.Descricao AS Equipamento,
          l.Descricao AS Local
        FROM TBPassagens p
        LEFT JOIN TBEquipamentos e ON p.IdEquipamento = e.IdEquipamento
        LEFT JOIN TBLocais       l ON p.IdLocal       = l.IdLocal
        WHERE p.Placa = @placa
          AND p.DataHoraPassagem >= DATEADD(HOUR, -24, GETDATE())
        ORDER BY p.DataHoraPassagem DESC
      `);

    // Detecções de monitoramento para esta placa (últimas 24 h)
    const monResult = await pool
      .request()
      .input("placa", placa)
      .query(`
        SELECT TOP 5
          pm.IdPassagemMonitoramento, pm.DataHora, pm.Placa,
          e.Descricao AS Equipamento,
          l.Descricao AS Local
        FROM TBPassagensMonitoramentos pm
        LEFT JOIN TBEquipamentos e ON pm.IdEquipamento = e.IdEquipamento
        LEFT JOIN TBLocais       l ON pm.IdLocal       = l.IdLocal
        WHERE pm.Placa = @placa
          AND pm.DataHora >= DATEADD(HOUR, -24, GETDATE())
        ORDER BY pm.DataHora DESC
      `);

    const passagens = passResult.recordset;
    const deteccoes  = monResult.recordset;
    const recebeu    = passagens.length > 0;
    const gerou      = deteccoes.length > 0;

    let delay_ms = null;
    if (recebeu && gerou) {
      const tPass = new Date(passagens[0].DataHoraPassagem).getTime();
      const tDet  = new Date(deteccoes[0].DataHora).getTime();
      delay_ms = tDet - tPass;
    }

    let problema = null;
    if (!recebeu) {
      problema = "AxHub não registrou passagem desta placa — possível perda de evento na integração.";
    } else if (recebeu && !gerou) {
      problema = "AxHub recebeu a passagem mas não gerou detecção de monitoramento — veículo pode não estar na lista de monitorados.";
    } else if (delay_ms !== null && delay_ms > 30000) {
      problema = `Delay excessivo de ${Math.round(delay_ms / 1000)}s entre passagem e detecção.`;
    }

    return status(recebeu, {
      passagens_axhub: passagens.length,
      ultima_passagem: passagens[0] || null,
      deteccoes_monitoramento: deteccoes.length,
      ultima_deteccao: deteccoes[0] || null,
      delay_ms,
      problema
    });
  } catch (err) {
    return status(false, { erro: err.message });
  }
}

// ─── ETAPA 3 — Regras de alerta (AxHub) ──────────────────────────────────────

async function validarRegrasAlerta({ placa }) {
  try {
    const pool = await conectarAxHub();

    // Total de monitoramentos ativos
    const ativosResult = await pool.request().query(`
      SELECT COUNT(*) AS total FROM TBMonitoramentos WHERE Ativo = 1
    `);

    // Monitoramento específico desta placa
    const placaResult = await pool
      .request()
      .input("placa", placa)
      .query(`
        SELECT TOP 5
          m.IdMonitoramento,
          m.Placa,
          m.Ativo,
          m.DataInicio,
          m.DataFim,
          m.Observacao
        FROM TBMonitoramentos m
        WHERE m.Placa = @placa
      `);

    const monitoramentos = placaResult.recordset;
    const ativo = monitoramentos.find(m => m.Ativo === true || m.Ativo === 1);
    const expirado = monitoramentos.find(m => {
      if (!m.DataFim) return false;
      return new Date(m.DataFim) < new Date();
    });

    let inconsistencia = null;
    if (monitoramentos.length === 0) {
      inconsistencia = "Placa não está cadastrada na lista de monitorados do AxHub.";
    } else if (!ativo) {
      inconsistencia = "Placa cadastrada nos monitoramentos, mas todos estão INATIVOS.";
    } else if (expirado && !ativo) {
      inconsistencia = "Monitoramento expirado — DataFim no passado.";
    }

    return status(!!ativo, {
      total_monitoramentos_ativos_sistema: ativosResult.recordset[0].total,
      monitoramentos_placa: monitoramentos,
      monitoramento_ativo: ativo || null,
      expirado: !!expirado,
      inconsistencia
    });
  } catch (err) {
    return status(false, { erro: err.message });
  }
}

// ─── ETAPA 4 — Validação de disparo ──────────────────────────────────────────

async function validarDisparo({ placa }) {
  try {
    const pool = await conectarAxHub();

    const result = await pool
      .request()
      .input("placa", placa)
      .query(`
        SELECT TOP 10
          pm.IdPassagemMonitoramento,
          pm.DataHora,
          pm.Placa,
          e.Descricao AS Equipamento
        FROM TBPassagensMonitoramentos pm
        LEFT JOIN TBEquipamentos e ON pm.IdEquipamento = e.IdEquipamento
        WHERE pm.Placa = @placa
        ORDER BY pm.DataHora DESC
      `);

    const disparos = result.recordset;
    const gerou     = disparos.length > 0;
    const ultimo    = disparos[0] || null;

    return status(gerou, {
      total_disparos_historico: disparos.length,
      ultimo_disparo: ultimo,
      diagnostico: gerou
        ? `${disparos.length} disparo(s) encontrado(s) no histórico.`
        : "Nenhum disparo registrado para esta placa em TBPassagensMonitoramentos."
    });
  } catch (err) {
    return status(false, { erro: err.message });
  }
}

// ─── ETAPA 5 — Validação Telegram ────────────────────────────────────────────

async function validarTelegram() {
  const token   = process.env.TELEGRAM_TOKEN;
  const chat_id = process.env.TELEGRAM_CHAT_ID;

  if (!token) {
    return status(false, {
      token_configurado: false,
      chat_id_configurado: !!chat_id,
      diagnostico: "TELEGRAM_TOKEN não configurado no .env"
    });
  }

  if (!chat_id) {
    return status(false, {
      token_configurado: true,
      chat_id_configurado: false,
      diagnostico: "TELEGRAM_CHAT_ID não configurado no .env"
    });
  }

  try {
    // Validar token via getMe
    const getMeRes = await axios.get(
      `https://api.telegram.org/bot${token}/getMe`,
      { timeout: 8000 }
    );

    const bot = getMeRes.data?.result;

    // Simular envio (sendMessage de diagnóstico)
    const msgRes = await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id,
        text: `🔍 *AxionIA — Teste de Integração*\nValidação de fluxo de alertas executada em ${new Date().toLocaleString("pt-BR")}`,
        parse_mode: "Markdown"
      },
      { timeout: 8000 }
    );

    return status(true, {
      token_configurado: true,
      chat_id_configurado: true,
      bot_username: bot?.username || null,
      bot_name: bot?.first_name || null,
      message_id_enviado: msgRes.data?.result?.message_id || null,
      http_status: msgRes.status,
      diagnostico: "Token válido e mensagem enviada com sucesso."
    });
  } catch (err) {
    const httpStatus = err.response?.status || null;
    const telegramErr = err.response?.data?.description || null;
    return status(false, {
      token_configurado: true,
      chat_id_configurado: true,
      http_status: httpStatus,
      erro_telegram: telegramErr,
      diagnostico: telegramErr || err.message
    });
  }
}

// ─── ETAPA 6 — Diagnóstico inteligente ───────────────────────────────────────

function diagnosticarFluxo(etapa1, etapa2, etapa3, etapa4, etapa5) {
  // Determina onde quebrou e classifica
  if (!etapa1.ok) {
    return {
      tipo: "integracao",
      causa_raiz: "Dados não gerados no AxCross",
      descricao: etapa1.diagnostico || etapa1.erro || "Passagem não encontrada no AxCross nas últimas 24h.",
      onde_quebrou: "etapa1_axcross"
    };
  }

  if (!etapa2.ok) {
    return {
      tipo: "integracao",
      causa_raiz: "Evento não consumido pelo AxHub",
      descricao: etapa2.problema || etapa2.erro || "AxHub não recebeu ou não processou o evento.",
      onde_quebrou: "etapa2_axhub"
    };
  }

  if (!etapa3.ok) {
    return {
      tipo: "regra_de_negocio",
      causa_raiz: "Placa não monitorada ou regra inativa",
      descricao: etapa3.inconsistencia || etapa3.erro || "Regra de alerta ausente ou inativa para esta placa.",
      onde_quebrou: "etapa3_regras_alerta"
    };
  }

  if (!etapa4.ok) {
    return {
      tipo: "bug_sistemico",
      causa_raiz: "Disparo não gerado apesar da regra ativa",
      descricao: etapa4.diagnostico || etapa4.erro || "Regra ativa porém sem registro em TBPassagensMonitoramentos.",
      onde_quebrou: "etapa4_disparo"
    };
  }

  if (!etapa5.ok) {
    return {
      tipo: "configuracao",
      causa_raiz: "Falha na entrega via Telegram",
      descricao: etapa5.diagnostico || etapa5.erro || "Disparo gerado mas Telegram não configurado ou com erro.",
      onde_quebrou: "etapa5_telegram"
    };
  }

  return {
    tipo: null,
    causa_raiz: null,
    descricao: "Fluxo completo validado com sucesso. Todas as etapas OK.",
    onde_quebrou: null
  };
}

// ─── ETAPA 7 — Sugestão de correção ──────────────────────────────────────────

function sugerirCorrecao(diagnostico) {
  const mapa = {
    etapa1_axcross: {
      acao: "Verificar se o equipamento está online (heartbeat), se a câmera está capturando e se a placa está legível. Conferir logs do serviço AxCross.",
      criticidade: "ALTO",
      prioridade: "1 — Imediata"
    },
    etapa2_axhub: {
      acao: "Verificar serviço de integração AxCross→AxHub: conexão de banco, fila de eventos ou job de sincronização. Checar se TBPassagens do AxHub está recebendo inserts.",
      criticidade: "CRÍTICO",
      prioridade: "1 — Imediata"
    },
    etapa3_regras_alerta: {
      acao: "Cadastrar a placa em Veículos Monitorados no AxHub, ativar o monitoramento e definir vigência válida.",
      criticidade: "MÉDIO",
      prioridade: "2 — Alta"
    },
    etapa4_disparo: {
      acao: "Revisar a lógica de geração de TBPassagensMonitoramentos. Verificar se há filtro de equipamento ou faixa impedindo o disparo. Checar seleção automática indevida na configuração de alertas.",
      criticidade: "ALTO",
      prioridade: "2 — Alta"
    },
    etapa5_telegram: {
      acao: "Configurar TELEGRAM_TOKEN e TELEGRAM_CHAT_ID no .env da API (via /api/config). Verificar se o bot está no grupo/canal correto.",
      criticidade: "MÉDIO",
      prioridade: "3 — Média"
    }
  };

  if (!diagnostico.onde_quebrou) {
    return {
      acao: "Nenhuma ação necessária. Fluxo funcionando corretamente.",
      criticidade: "BAIXO",
      prioridade: "Sem prioridade"
    };
  }

  return mapa[diagnostico.onde_quebrou] || {
    acao: "Investigar manualmente o ponto de falha identificado.",
    criticidade: "ALTO",
    prioridade: "2 — Alta"
  };
}

// ─── Handler principal ────────────────────────────────────────────────────────

// POST /api/validate-alert-flow
export async function validarFluxoAlerta(req, res) {
  const { placa, equipamento, faixa, contrato, origem } = req.body || {};

  if (!placa) {
    return res.status(400).json({ erro: "Campo 'placa' é obrigatório." });
  }

  const input = {
    placa: placa.toUpperCase().replace(/[^A-Z0-9]/g, ""),
    equipamento: equipamento || null,
    faixa: faixa || null,
    contrato: contrato || null,
    origem: origem || "axcross"
  };

  // Executa etapas 1–4 e 5 em paralelo onde possível
  const [etapa1, etapa2, etapa3, etapa4, etapa5] = await Promise.all([
    validarAxCross(input),
    validarAxHub(input),
    validarRegrasAlerta(input),
    validarDisparo(input),
    validarTelegram()
  ]);

  const diagnostico = diagnosticarFluxo(etapa1, etapa2, etapa3, etapa4, etapa5);
  const correcao    = sugerirCorrecao(diagnostico);

  const todasOk = etapa1.ok && etapa2.ok && etapa3.ok && etapa4.ok && etapa5.ok;

  return res.json({
    status_geral: todasOk ? "OK" : "ERRO",
    input,
    origem_dados:    etapa1,
    axhub:           etapa2,
    regras_alerta:   etapa3,
    disparo:         etapa4,
    telegram:        etapa5,
    diagnostico,
    correcao,
    executado_em: new Date().toISOString()
  });
}
