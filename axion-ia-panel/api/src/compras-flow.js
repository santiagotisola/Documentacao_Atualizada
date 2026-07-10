/**
 * compras-flow.js
 * Módulo conversacional de Solicitação de Compras via WhatsApp
 * 
 * Fluxo:
 *   compras_titulo → compras_motivo → compras_sistema → compras_cliente
 *   → compras_tipo → compras_itens → compras_destino → compras_prioridade
 *   → compras_confirmacao → (cria ticket + envia aprovação)
 * 
 * Integra com: Jitbit (ticket), Equipamento (substituição), Cliente (contrato)
 */

import { PedidoCompra } from "./models/pedido-compra.model.js";
import { Cliente } from "./models/cliente.model.js";
import { Equipamento } from "./models/equipamento.model.js";
import { WhatsAppSessao } from "./models/whatsapp-sessao.model.js";
import { enviarMensagem, verificarNumeroWhatsApp, enviarMensagemComBotoes, enviarListaSelecao, enviarConfirmacao } from "./services/whatsapp.service.js";
import { criarTicketUsuario, criarTicket, responderTicket } from "./jitbit.js";
import { salvarHistorico, salvarErroWhatsApp } from "./logger.js";

// ─── SISTEMAS DISPONÍVEIS ────────────────────────────────────────────────────
const SISTEMAS_COMPRAS = ["AxHub", "AxOCR", "AxRadar", "AxFlow", "AxCross", "AxTon", "Infraestrutura", "Outro"];

// ─── MATRIZ DE APROVAÇÃO ─────────────────────────────────────────────────────
// Configurável por env ou futuramente por DB
const MATRIZ_APROVACAO = [
  { limiteValor: 500,   papel: "supervisor",  telefone: process.env.APROVADOR_SUPERVISOR || null },
  { limiteValor: 5000,  papel: "gerente",     telefone: process.env.APROVADOR_GERENTE || null },
  { limiteValor: Infinity, papel: "diretoria", telefone: process.env.APROVADOR_DIRETORIA || null },
];

// Aprovador padrão (quando não há matriz específica)
const APROVADOR_PADRAO = process.env.APROVADOR_COMPRAS || null;

// ─── HANDLERS ────────────────────────────────────────────────────────────────

/**
 * Entrada: usuário selecionou opção 5 no menu
 */
export async function iniciarFluxoCompras(sessao) {
  // Verificar se o solicitante tem pedidos pendentes
  const pendentes = await PedidoCompra.find({
    "solicitante.telefone": sessao.telefone,
    status: { $in: ["aguardando_aprovacao", "rascunho"] }
  }).lean();

  let avisoPendente = "";
  if (pendentes.length > 0) {
    const lista = pendentes.map(p => `  ⏳ *${p.codigo}* — ${p.titulo} (${p.status})`).join("\n");
    avisoPendente = `\n⚠️ *Atenção:* Você tem ${pendentes.length} pedido(s) pendente(s):\n${lista}\n\n`;
  }

  sessao.estado = "compras_titulo";
  sessao.dadosParciais = { _fluxo: "compras" };
  sessao.markModified("dadosParciais");
  await sessao.save();
  await enviarMensagem(sessao._remoteJid,
    `🛒 *Solicitação de Compras*\n\n` +
    avisoPendente +
    `Vou te guiar no pedido. Você pode digitar *cancelar* a qualquer momento.\n\n` +
    `📝 *Etapa 1/7* — Qual o título/resumo da solicitação?\n` +
    `_(ex: "Troca OCR pista 02", "Compra de switches para IMEPI")_`);
}

/**
 * Consulta de pedido: usuário selecionou opção 6
 */
export async function iniciarConsultaCompras(sessao) {
  sessao.estado = "compras_consulta";
  sessao.dadosParciais = { _fluxo: "compras" };
  sessao.markModified("dadosParciais");
  await sessao.save();
  await enviarMensagem(sessao._remoteJid,
    `🔍 *Consultar Pedido de Compras*\n\n` +
    `Digite o código do pedido (ex: PC-2026-000001)\nou *meus* para ver seus últimos pedidos:`);
}

// ─── ROUTER ──────────────────────────────────────────────────────────────────

/**
 * Router principal — direciona para o handler correto baseado no estado
 */
export async function processarCompras(sessao, texto, midia = null) {
  const t = (texto || "").trim();
  const tLower = t.toLowerCase();

  // Guard de segurança — caso processarCompras seja chamado diretamente
  // "cancelar" e "sair" normalmente já são capturados pelo whatsapp-flow antes de chegar aqui
  if ((tLower === "cancelar" || tLower === "voltar") && sessao.estado !== "compras_motivo_rejeicao") {
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    await sessao.save();
    await enviarMensagem(sessao._remoteJid, "↩️ Solicitação de compras cancelada.");
    return;
  }

  switch (sessao.estado) {
    case "compras_titulo":
      await handleComprasTitulo(sessao, t);
      break;
    case "compras_motivo":
      await handleComprasMotivo(sessao, t);
      break;
    case "compras_sistema":
      await handleComprasSistema(sessao, tLower);
      break;
    case "compras_cliente":
      await handleComprasCliente(sessao, t);
      break;
    case "compras_tipo":
      await handleComprasTipo(sessao, tLower);
      break;
    case "compras_substituicao":
      await handleComprasSubstituicao(sessao, t);
      break;
    case "compras_devolucao":
      await handleComprasDevolucao(sessao, tLower);
      break;
    case "compras_motivo_nao_devolucao":
      await handleComprasMotivoNaoDevolucao(sessao, t);
      break;
    case "compras_itens":
      await handleComprasItens(sessao, t);
      break;
    case "compras_destino":
      await handleComprasDestino(sessao, t);
      break;
    case "compras_prioridade":
      await handleComprasPrioridade(sessao, tLower);
      break;
    case "compras_aprovador":
      await handleComprasAprovador(sessao, t);
      break;
    case "compras_confirmacao":
      await handleComprasConfirmacao(sessao, tLower);
      break;
    case "compras_consulta":
      await handleComprasConsulta(sessao, t);
      break;
    case "compras_motivo_rejeicao":
      await handleMotivoRejeicao(sessao, t);
      break;
    default:
      sessao.estado = "menu";
      await sessao.save();
      await enviarMensagem(sessao._remoteJid, "Estado inválido. Digite *menu* para recomeçar.");
  }
}

// ─── ETAPA 1: TÍTULO ─────────────────────────────────────────────────────────

async function handleComprasTitulo(sessao, texto) {
  if (!texto || texto.length < 5) {
    await enviarMensagem(sessao._remoteJid, "Por favor, descreva o título com pelo menos 5 caracteres.");
    return;
  }
  sessao.dadosParciais.titulo = texto;
  sessao.estado = "compras_motivo";
  sessao.markModified("dadosParciais");
  await sessao.save();
  await enviarMensagem(sessao._remoteJid,
    `✅ Título: *${texto}*\n\n` +
    `📝 *Etapa 2/7* — Qual a justificativa/motivo da necessidade?\n` +
    `_(ex: "Equipamento atual queimou após descarga elétrica")_`);
}

// ─── ETAPA 2: MOTIVO ─────────────────────────────────────────────────────────

async function handleComprasMotivo(sessao, texto) {
  if (!texto || texto.length < 10) {
    await enviarMensagem(sessao._remoteJid, "Forneça uma justificativa mais detalhada (mínimo 10 caracteres).");
    return;
  }
  sessao.dadosParciais.motivo = texto;
  sessao.estado = "compras_sistema";
  sessao.markModified("dadosParciais");
  await sessao.save();

  const opcoesSistema = SISTEMAS_COMPRAS.map((s, i) => ({ id: String(i + 1), titulo: s }));
  opcoesSistema.push({ id: "0", titulo: "Não se aplica" });
  await enviarListaSelecao(sessao._remoteJid,
    `✅ Motivo registrado.\n\n🖥️ *Etapa 3/7* — Selecione o sistema relacionado:`,
    "Ver sistemas",
    [{ titulo: "Sistemas", opcoes: opcoesSistema }],
    { rodape: "Etapa 3 de 7" }
  );
}

// ─── ETAPA 3: SISTEMA ────────────────────────────────────────────────────────

async function handleComprasSistema(sessao, opcao) {
  const idx = parseInt(opcao);
  if (opcao === "0") {
    sessao.dadosParciais.sistema = null;
  } else if (idx >= 1 && idx <= SISTEMAS_COMPRAS.length) {
    sessao.dadosParciais.sistema = SISTEMAS_COMPRAS[idx - 1];
  } else {
    await enviarMensagem(sessao._remoteJid, "Digite um número válido ou *0* para pular.");
    return;
  }

  // Buscar clientes para seleção
  sessao.estado = "compras_cliente";
  sessao.markModified("dadosParciais");
  await sessao.save();

  let listaClientes = "*0* — Não vincular a nenhum contrato";
  try {
    const clientes = await Cliente.find({ ativo: true }).sort({ nome: 1 }).limit(20).lean();
    if (clientes.length > 0) {
      listaClientes = clientes.map((c, i) => `*${i + 1}* — ${c.nome}${c.uf ? ` (${c.uf})` : ""}`).join("\n");
      sessao.dadosParciais._clientesCache = clientes.map(c => ({ slug: c.slug, nome: c.nome }));
      sessao.markModified("dadosParciais");
      await sessao.save();
      listaClientes += "\n\n*0* — Nenhum / Não se aplica";
    }
  } catch (_) { /* sem clientes cadastrados */ }

  await enviarMensagem(sessao._remoteJid,
    `📋 *Etapa 4/7* — Contrato/Cliente:\n\n${listaClientes}\n\n_Ou digite o número/nome do contrato diretamente._`);
}

// ─── ETAPA 4: CLIENTE/CONTRATO ───────────────────────────────────────────────

async function handleComprasCliente(sessao, opcao) {
  const idx = parseInt(opcao);
  const cache = sessao.dadosParciais._clientesCache || [];

  if (opcao === "0") {
    sessao.dadosParciais.clienteSlug = null;
    sessao.dadosParciais.clienteNome = null;
  } else if (!isNaN(idx) && idx >= 1 && idx <= cache.length) {
    sessao.dadosParciais.clienteSlug = cache[idx - 1].slug;
    sessao.dadosParciais.clienteNome = cache[idx - 1].nome;
  } else {
    // Aceitar texto livre como nome/número de contrato
    sessao.dadosParciais.clienteSlug = null;
    sessao.dadosParciais.clienteNome = opcao.trim() || null;
  }

  sessao.estado = "compras_tipo";
  sessao.markModified("dadosParciais");
  await sessao.save();

  await enviarListaSelecao(sessao._remoteJid,
    `📦 *Etapa 5/7* — Tipo da solicitação:`,
    "Selecionar tipo",
    [{ titulo: "Tipo", opcoes: [
      { id: "1", titulo: "Produto Novo", descricao: "Aquisição de item novo" },
      { id: "2", titulo: "Substituição", descricao: "Produto danificado / garantia" },
    ]}],
    { rodape: "Etapa 5 de 7" }
  );
}

// ─── ETAPA 5: TIPO ───────────────────────────────────────────────────────────

async function handleComprasTipo(sessao, opcao) {
  if (opcao === "1") {
    sessao.dadosParciais.tipoSolicitacao = "novo";
    sessao.estado = "compras_itens";
    sessao.markModified("dadosParciais");
    await sessao.save();
    await enviarMensagem(sessao._remoteJid,
      `🆕 *Produto Novo*\n\n` +
      `📝 *Etapa 6/7* — Liste os itens que deseja comprar.\n\n` +
      `👉 Escreva assim: *quantidade - nome do produto*\n\n` +
      `Exemplo:\n` +
      `2 - câmera OCR Hikvision\n` +
      `1 - switch 8 portas TP-Link\n` +
      `50m - cabo CAT6\n\n` +
      `⬇️ Pode enviar vários de uma vez (um por linha).\n` +
      `✅ Quando terminar de adicionar, digite *PRONTO*`);

  } else if (opcao === "2") {
    sessao.dadosParciais.tipoSolicitacao = "substituicao";
    sessao.estado = "compras_substituicao";
    sessao.markModified("dadosParciais");
    await sessao.save();
    await enviarMensagem(sessao._remoteJid,
      `🔄 *Substituição/Garantia*\n\n` +
      `Descreva o equipamento com problema.\n` +
      `Informe: descrição, número de série ou código patrimônio, e o problema.\n\n` +
      `_(ex: "Câmera OCR econ-ocr005, queimou após raio, sem imagem")_`);

  } else {
    await enviarListaSelecao(sessao._remoteJid, "Selecione o tipo:", "Selecionar tipo",
      [{ titulo: "Tipo", opcoes: [
        { id: "1", titulo: "Produto Novo", descricao: "Aquisição" },
        { id: "2", titulo: "Substituição", descricao: "Produto danificado / garantia" },
      ]}]
    );
  }
}

// ─── ETAPA 5B: SUBSTITUIÇÃO ──────────────────────────────────────────────────

async function handleComprasSubstituicao(sessao, texto) {
  if (!texto || texto.length < 10) {
    await enviarMensagem(sessao._remoteJid, "Forneça mais detalhes sobre o equipamento (mínimo 10 caracteres).");
    return;
  }

  sessao.dadosParciais.substituicaoDescricao = texto;

  // Tentar encontrar equipamento pelo alias mencionado
  let infoGarantia = "";
  try {
    const match = texto.match(/([a-z]{2,4}[\-_]?(?:ocr|[0-9])[a-z0-9\-_]*)/i);
    if (match) {
      const eq = await Equipamento.findOne({ alias: { $regex: match[1], $options: "i" } }).lean();
      if (eq) {
        sessao.dadosParciais.equipamentoAlias = eq.alias;
        sessao.dadosParciais.equipamentoInfo = `${eq.alias} | ${eq.fabricante} | IP: ${eq.zerotierIp || "N/A"} | ${eq.site}`;
        infoGarantia = `\n\n📍 Equipamento encontrado: *${eq.alias}*\n   Fabricante: ${eq.fabricante}\n   Site: ${eq.site} (${eq.uf})`;
      }
    }
  } catch (_) { /* sem match */ }

  sessao.estado = "compras_devolucao";
  sessao.markModified("dadosParciais");
  await sessao.save();

  await enviarListaSelecao(sessao._remoteJid,
    `✅ Problema registrado.${infoGarantia}\n\n📦 *Haverá devolução do equipamento danificado?*`,
    "Selecionar",
    [{ titulo: "Devolução", opcoes: [
      { id: "1", titulo: "Sim, haverá devolução" },
      { id: "2", titulo: "Não haverá devolução" },
    ]}]
  );
}

// ─── ETAPA 5C: DEVOLUÇÃO ─────────────────────────────────────────────────────

async function handleComprasDevolucao(sessao, opcao) {
  if (opcao === "1") {
    sessao.dadosParciais.haveraDevolucao = true;
    sessao.estado = "compras_itens";
    sessao.markModified("dadosParciais");
    await sessao.save();
    await enviarMensagem(sessao._remoteJid,
      `✅ Devolução confirmada.\n\n` +
      `📝 *Etapa 6/7* — Liste os itens para substituição.\n\n` +
      `👉 Escreva assim: *quantidade - nome do produto*\n` +
      `Exemplo: 1 - câmera OCR Hikvision DS-2CD\n\n` +
      `⬇️ Pode enviar vários de uma vez (um por linha).\n` +
      `✅ Quando terminar de adicionar, digite *PRONTO*`);

  } else if (opcao === "2") {
    sessao.dadosParciais.haveraDevolucao = false;
    sessao.estado = "compras_motivo_nao_devolucao";
    sessao.markModified("dadosParciais");
    await sessao.save();
    await enviarMensagem(sessao._remoteJid,
      `⚠️ *Sem devolução* — informe o motivo:\n\n` +
      `_(ex: "equipamento queimado", "perda total por vandalismo", "extravio")_`);

  } else {
    await enviarListaSelecao(sessao._remoteJid, "Selecione:", "Selecionar",
      [{ titulo: "Devolução", opcoes: [
        { id: "1", titulo: "Sim, haverá devolução" },
        { id: "2", titulo: "Não haverá devolução" },
      ]}]
    );
  }
}

async function handleComprasMotivoNaoDevolucao(sessao, texto) {
  if (!texto || texto.length < 5) {
    await enviarMensagem(sessao._remoteJid, "Informe o motivo da não-devolução (mínimo 5 caracteres).");
    return;
  }
  sessao.dadosParciais.motivoNaoDevolucao = texto;
  sessao.estado = "compras_itens";
  sessao.markModified("dadosParciais");
  await sessao.save();
  await enviarMensagem(sessao._remoteJid,
    `✅ Motivo registrado.\n\n` +
    `📝 *Etapa 6/7* — Liste os itens para substituição.\n\n` +
    `👉 Escreva assim: *quantidade - nome do produto*\n` +
    `Exemplo: 1 - câmera OCR Hikvision DS-2CD\n\n` +
    `⬇️ Pode enviar vários de uma vez (um por linha).\n` +
    `✅ Quando terminar de adicionar, digite *PRONTO*`);
}

// ─── ETAPA 6: ITENS ──────────────────────────────────────────────────────────

async function handleComprasItens(sessao, texto) {
  const tLower = texto.toLowerCase();

  if (tLower === "pronto" || tLower === "finalizar" || tLower === "fim" || tLower === "ok") {
    const itens = sessao.dadosParciais.itens || [];
    if (itens.length === 0) {
      await enviarMensagem(sessao._remoteJid, "⚠️ Você ainda não adicionou nenhum item.\n\n👉 Primeiro adicione os itens (ex: *2 - câmera OCR*)\n✅ Depois digite *PRONTO* para continuar.");
      return;
    }

    sessao.estado = "compras_destino";
    sessao.markModified("dadosParciais");
    await sessao.save();

    const resumoItens = itens.map((it, i) => `  ${i + 1}. ${it.quantidade}${it.unidade !== "un" ? it.unidade : "x"} ${it.descricao}`).join("\n");
    
    // Se tem cliente, sugerir endereço com lista
    if (sessao.dadosParciais.clienteSlug) {
      await enviarMensagem(sessao._remoteJid, `📦 *${itens.length} item(ns) registrado(s):*\n${resumoItens}`);
      await enviarListaSelecao(sessao._remoteJid,
        `📍 *Etapa 7/7* — Destino da entrega:`,
        "Selecionar destino",
        [{ titulo: "Destino", opcoes: [
          { id: "1", titulo: "Endereço do contrato", descricao: sessao.dadosParciais.clienteNome },
          { id: "2", titulo: "Digitar outro endereço" },
        ]}],
        { rodape: "Etapa 7 de 7" }
      );
    } else {
      await enviarMensagem(sessao._remoteJid,
        `📦 *${itens.length} item(ns) registrado(s):*\n${resumoItens}\n\n` +
        `📍 *Etapa 7/7* — Digite o endereço/unidade de destino:`);
    }
    return;
  }

  // Suporte a múltiplos itens (uma linha por item)
  const linhas = texto.split(/\n/).map(l => l.trim()).filter(l => l.length > 0);
  let itensAdicionados = [];
  let linhasNaoReconhecidas = [];

  for (const linha of linhas) {
    // Formato: "quantidade - descrição" ou "quantidadeUNIDADE - descrição"
    const match = linha.match(/^(\d+)\s*(un|m|kg|cx|pç|pc|l|und|metros?)?\s*[-–—]\s*(.+)/i);
    if (match) {
      adicionarItem(sessao, parseInt(match[1]), match[2] || "un", match[3].trim());
      itensAdicionados.push(`${match[1]}x ${match[3].trim()}`);
      continue;
    }
    // Formato sem separador: "2 câmeras OCR"
    const match2 = linha.match(/^(\d+)\s*(un|m|kg|cx|pç|pc|l|und|metros?)?\s+(.+)/i);
    if (match2) {
      adicionarItem(sessao, parseInt(match2[1]), match2[2] || "un", match2[3].trim());
      itensAdicionados.push(`${match2[1]}x ${match2[3].trim()}`);
      continue;
    }
    linhasNaoReconhecidas.push(linha);
  }

  if (itensAdicionados.length === 0) {
    await enviarMensagem(sessao._remoteJid,
      `⚠️ Não consegui entender o formato.\n\n` +
      `👉 Escreva assim: *quantidade - nome do produto*\n` +
      `Exemplo: 2 - câmera OCR Hikvision\n\n` +
      `Pode enviar vários itens, um por linha.\n` +
      `✅ Quando terminar, digite *PRONTO*`);
    return;
  }

  sessao.markModified("dadosParciais");
  await sessao.save();

  const itens = sessao.dadosParciais.itens;
  const resumo = itensAdicionados.map(it => `  ✅ ${it}`).join("\n");
  let msg = `${resumo}\n\nTotal: ${itens.length} item(ns)\n\n📌 *Envie mais itens* (um por linha) ou digite *PRONTO* para continuar.`;
  if (linhasNaoReconhecidas.length > 0) {
    msg += `\n\n⚠️ Não reconhecido (reenvie no formato *qtd - descrição*):\n${linhasNaoReconhecidas.map(l => `  • ${l}`).join("\n")}`;
  }
  await enviarMensagem(sessao._remoteJid, msg);
}

function adicionarItem(sessao, quantidade, unidade, descricao) {
  if (!sessao.dadosParciais.itens) sessao.dadosParciais.itens = [];
  
  // IA simples: detectar categoria e criticidade pelo texto
  const descLower = descricao.toLowerCase();
  let categoria = "geral";
  let criticidade = "media";
  let fabricante = null;

  // Categorização automática
  if (/ocr|câmera|camera|hikvision|intelbras|cftv/i.test(descLower)) { categoria = "CFTV/OCR"; criticidade = "alta"; }
  else if (/switch|roteador|router|ap |access point|rede/i.test(descLower)) { categoria = "Rede"; criticidade = "media"; }
  else if (/cabo|cat[56]|fibra|conector|patch/i.test(descLower)) { categoria = "Cabeamento"; criticidade = "baixa"; }
  else if (/nobreak|ups|bateria|fonte/i.test(descLower)) { categoria = "Energia"; criticidade = "alta"; }
  else if (/hd |ssd|disco|memória|ram|processador/i.test(descLower)) { categoria = "Hardware"; criticidade = "media"; }
  else if (/painel|placa solar|solar|poste|suporte/i.test(descLower)) { categoria = "Infraestrutura"; criticidade = "media"; }
  else if (/radar|sensor|laço|loop/i.test(descLower)) { categoria = "Metrologia"; criticidade = "alta"; }

  // Detectar fabricante
  if (/hikvision/i.test(descLower)) fabricante = "Hikvision";
  else if (/intelbras/i.test(descLower)) fabricante = "Intelbras";
  else if (/tp-?link/i.test(descLower)) fabricante = "TP-Link";
  else if (/pumatronix/i.test(descLower)) fabricante = "Pumatronix";
  else if (/axion/i.test(descLower)) fabricante = "Axion";

  // Normalizar unidade
  const unidadeNorm = (unidade || "un").toLowerCase().replace(/metros?/, "m").replace(/und/, "un");

  sessao.dadosParciais.itens.push({
    quantidade,
    unidade: unidadeNorm,
    descricao,
    categoria,
    criticidade,
    fabricante,
  });
}

// ─── ETAPA 7: DESTINO ────────────────────────────────────────────────────────

async function handleComprasDestino(sessao, texto) {
  const tLower = texto.toLowerCase();

  if (tLower === "1" && sessao.dadosParciais.clienteSlug) {
    sessao.dadosParciais.destino = `Endereço contrato: ${sessao.dadosParciais.clienteNome}`;
  } else if (tLower === "2" || !sessao.dadosParciais.clienteSlug) {
    if (texto.length < 5 && tLower !== "2") {
      await enviarMensagem(sessao._remoteJid, "Digite o endereço de destino ou unidade operacional:");
      return;
    }
    if (tLower === "2") {
      await enviarMensagem(sessao._remoteJid, "Digite o endereço de destino:");
      sessao.dadosParciais._aguardandoEndereco = true;
      sessao.markModified("dadosParciais");
      await sessao.save();
      return;
    }
    sessao.dadosParciais.destino = texto;
  } else if (sessao.dadosParciais._aguardandoEndereco) {
    sessao.dadosParciais.destino = texto;
    delete sessao.dadosParciais._aguardandoEndereco;
  } else {
    sessao.dadosParciais.destino = texto;
  }

  sessao.estado = "compras_prioridade";
  sessao.markModified("dadosParciais");
  await sessao.save();

  await enviarListaSelecao(sessao._remoteJid,
    `📍 Destino: *${sessao.dadosParciais.destino}*\n\n⚡ Selecione a prioridade:`,
    "Ver prioridades",
    [{ titulo: "Prioridade", opcoes: [
      { id: "1", titulo: "Baixa", descricao: "Pode aguardar" },
      { id: "2", titulo: "Média", descricao: "Necessário em dias" },
      { id: "3", titulo: "Alta", descricao: "Urgente, impacta operação" },
      { id: "4", titulo: "Emergencial", descricao: "Parada total" },
    ]}],
    { rodape: "Etapa 7 de 7" }
  );
}

// ─── ETAPA: PRIORIDADE ───────────────────────────────────────────────────────

async function handleComprasPrioridade(sessao, opcao) {
  const mapa = { "1": "baixa", "2": "media", "3": "alta", "4": "emergencial" };
  if (!mapa[opcao]) {
    await enviarListaSelecao(sessao._remoteJid, "Selecione a prioridade:", "Ver prioridades",
      [{ titulo: "Prioridade", opcoes: [
        { id: "1", titulo: "Baixa", descricao: "Pode aguardar" },
        { id: "2", titulo: "Média", descricao: "Necessário em dias" },
        { id: "3", titulo: "Alta", descricao: "Urgente" },
        { id: "4", titulo: "Emergencial", descricao: "Parada total" },
      ]}]
    );
    return;
  }
  sessao.dadosParciais.prioridade = mapa[opcao];
  sessao.estado = "compras_aprovador";
  sessao.markModified("dadosParciais");
  await sessao.save();

  // Mostrar aprovador padrão com opção de alterar
  const aprovadorPadrao = process.env.APROVADOR_COMPRAS || "(não configurado)";
  const aprovadorFormatado = aprovadorPadrao !== "(não configurado)" ? formatarTelefone(aprovadorPadrao) : aprovadorPadrao;
  await enviarListaSelecao(sessao._remoteJid,
    `👤 *Aprovador da solicitação:*\n\n📱 WhatsApp: *${aprovadorFormatado}*\n\n_O aprovador receberá a notificação via WhatsApp para aprovar/rejeitar._`,
    "Selecionar ação",
    [{ titulo: "Aprovador", opcoes: [
      { id: "1", titulo: "Manter este aprovador" },
      { id: "2", titulo: "Alterar aprovador", descricao: "Digitar outro número" },
    ]}]
  );
  return;
}

function formatarTelefone(numero) {
  if (!numero) return "";
  // Formato: +55 (62) 91092-135
  const n = numero.replace(/\D/g, "");
  if (n.length === 13) return `+${n.slice(0,2)} (${n.slice(2,4)}) ${n.slice(4,9)}-${n.slice(9)}`;
  if (n.length === 12) return `+${n.slice(0,2)} (${n.slice(2,4)}) ${n.slice(4,8)}-${n.slice(8)}`;
  return `+${n}`;
}

async function handleComprasAprovador(sessao, texto) {
  const tLower = texto.toLowerCase().trim();

  // Se está aguardando confirmação do número validado
  if (sessao.dadosParciais._confirmarAprovador) {
    if (tLower === "1" || tLower === "sim") {
      // Confirmou o número
      sessao.dadosParciais.aprovadorTelefone = sessao.dadosParciais._confirmarAprovador;
      delete sessao.dadosParciais._confirmarAprovador;
      delete sessao.dadosParciais._aguardandoAprovador;
      sessao.estado = "compras_confirmacao";
      sessao.markModified("dadosParciais");
      await sessao.save();
      await montarResumoConfirmacao(sessao);
      return;
    } else if (tLower === "2" || tLower === "nao" || tLower === "não") {
      // Quer digitar outro número
      delete sessao.dadosParciais._confirmarAprovador;
      sessao.dadosParciais._aguardandoAprovador = true;
      sessao.markModified("dadosParciais");
      await sessao.save();
      await enviarMensagem(sessao._remoteJid, "📱 Digite o número correto do aprovador (com DDD):\n\n_Exemplo: 62984085383_");
      return;
    } else {
      await enviarListaSelecao(sessao._remoteJid, "Confirme o aprovador:", "Confirmar",
        [{ titulo: "Confirmação", opcoes: [
          { id: "1", titulo: "✅ Sim, confirmar" },
          { id: "2", titulo: "❌ Não, digitar outro" },
        ]}]
      );
      return;
    }
  }

  // Se está aguardando digitação de número
  if (sessao.dadosParciais._aguardandoAprovador) {
    // Limpar apenas dígitos
    let numero = texto.replace(/\D/g, "");
    // Remover zero à esquerda do DDD (ex: 062 → 62)
    if (numero.startsWith("0")) numero = numero.slice(1);
    if (numero.length < 10 || numero.length > 13) {
      await enviarMensagem(sessao._remoteJid,
        `⚠️ Número inválido.\n\n` +
        `👉 Digite apenas o DDD + número (sem zero na frente).\n` +
        `📌 Formato correto: *62984085383*\n` +
        `❌ Formato errado: 062984085383, +55(62)98408-5383`);
      return;
    }
    // Garantir que começa com 55
    const tel = numero.startsWith("55") ? numero : `55${numero}`;
    // Validar comprimento final (deve ser 12 ou 13)
    if (tel.length < 12 || tel.length > 13) {
      await enviarMensagem(sessao._remoteJid,
        `⚠️ Número inválido.\n\n` +
        `👉 Digite apenas o DDD + número (sem zero na frente).\n` +
        `📌 Formato correto: *62984085383*`);
      return;
    }

    // Verificar se o número está no WhatsApp e buscar nome
    const verificacao = await verificarNumeroWhatsApp(tel);
    if (!verificacao.exists) {
      await enviarMensagem(sessao._remoteJid,
        `❌ O número *${formatarTelefone(tel)}* NÃO está no WhatsApp.\n\n` +
        `Verifique se digitou corretamente e tente novamente.\n` +
        `📌 Formato: *DDD + número* (ex: 62984085383)`);
      return;
    }

    // Número válido — pedir confirmação ao operador
    const nomeContato = verificacao.nome ? `\n👤 Contato: *${verificacao.nome}*` : "";
    sessao.dadosParciais._confirmarAprovador = tel;
    sessao.markModified("dadosParciais");
    await sessao.save();

    await enviarListaSelecao(sessao._remoteJid,
      `✅ Número encontrado no WhatsApp!\n\n📱 Número: *${formatarTelefone(tel)}*${nomeContato}\n\nEste é o aprovador correto?`,
      "Confirmar",
      [{ titulo: "Confirmação", opcoes: [
        { id: "1", titulo: "✅ Sim, confirmar" },
        { id: "2", titulo: "❌ Não, digitar outro" },
      ]}]
    );
    return;
  }

  if (tLower === "1") {
    // Manter aprovador padrão — também validar e confirmar
    const aprovadorPadrao = process.env.APROVADOR_COMPRAS || null;
    if (aprovadorPadrao) {
      const verificacao = await verificarNumeroWhatsApp(aprovadorPadrao);
      if (!verificacao.exists) {
        await enviarMensagem(sessao._remoteJid,
          `⚠️ O aprovador padrão *${formatarTelefone(aprovadorPadrao)}* não está no WhatsApp.\n\n` +
          `Digite o número do aprovador manualmente:`);
        sessao.dadosParciais._aguardandoAprovador = true;
        sessao.markModified("dadosParciais");
        await sessao.save();
        return;
      }
      const nomeContato = verificacao.nome ? ` (${verificacao.nome})` : "";
      sessao.dadosParciais.aprovadorTelefone = aprovadorPadrao;
      sessao.estado = "compras_confirmacao";
      sessao.markModified("dadosParciais");
      await sessao.save();
      await montarResumoConfirmacao(sessao);
    } else {
      await enviarMensagem(sessao._remoteJid, "⚠️ Nenhum aprovador padrão configurado. Digite o número:");
      sessao.dadosParciais._aguardandoAprovador = true;
      sessao.markModified("dadosParciais");
      await sessao.save();
    }
  } else if (tLower === "2") {
    // Alterar aprovador
    sessao.dadosParciais._aguardandoAprovador = true;
    sessao.markModified("dadosParciais");
    await sessao.save();
    await enviarMensagem(sessao._remoteJid,
      `📱 Digite o número do WhatsApp do aprovador.\n\n` +
      `👉 Use apenas números: *DDD + número*\n` +
      `📌 Exemplo: *62984085383*`);
  } else {
    await enviarListaSelecao(sessao._remoteJid, "Selecione:", "Selecionar ação",
      [{ titulo: "Aprovador", opcoes: [
        { id: "1", titulo: "Manter este aprovador" },
        { id: "2", titulo: "Alterar aprovador", descricao: "Digitar outro número" },
      ]}]
    );
  }
}

// ─── MONTAR RESUMO PARA CONFIRMAÇÃO ─────────────────────────────────────────

async function montarResumoConfirmacao(sessao) {
  const d = sessao.dadosParciais;

  // ★ SALVAR PEDIDO COMO RASCUNHO (persistência imediata)
  if (!d._pedidoCodigo) {
    try {
      const codigo = await PedidoCompra.gerarCodigo();
      const pedido = await PedidoCompra.create({
        codigo,
        solicitante: { telefone: sessao.telefone, nome: sessao.nome },
        titulo: d.titulo,
        motivo: d.motivo,
        sistema: d.sistema || null,
        clienteSlug: d.clienteSlug || null,
        clienteNome: d.clienteNome || null,
        tipoSolicitacao: d.tipoSolicitacao,
        itens: (d.itens || []).map(it => ({
          quantidade: it.quantidade,
          unidade: it.unidade,
          descricao: it.descricao,
          categoria: it.categoria,
          criticidade: it.criticidade,
          fabricante: it.fabricante,
        })),
        destino: {
          endereco: d.destino,
          unidade: d.clienteNome || null,
        },
        prioridade: d.prioridade,
        status: "rascunho",
        substituicao: d.tipoSolicitacao === "substituicao" ? {
          equipamentoAlias: d.equipamentoAlias || null,
          problemaDescrito: d.substituicaoDescricao || null,
          haveraDevolucao: d.haveraDevolucao !== false,
          motivoNaoDevolucao: d.motivoNaoDevolucao || null,
        } : undefined,
        historico: [{ acao: "Pedido criado via WhatsApp (rascunho)", usuario: sessao.telefone }],
      });

      d._pedidoCodigo = codigo;
      d._pedidoId = pedido._id.toString();
      sessao.markModified("dadosParciais");
      await sessao.save();
      console.log(`📝 [Compras] Rascunho ${codigo} salvo no MongoDB`);
    } catch (err) {
      console.error("❌ [Compras] Erro ao salvar rascunho:", err.message);
      await enviarMensagem(sessao._remoteJid, `❌ Erro ao registrar pedido: ${err.message}\n\nDigite *menu* para tentar novamente.`);
      sessao.estado = "menu";
      sessao.dadosParciais = {};
      await sessao.save();
      return;
    }
  }

  const itens = (d.itens || []).map((it, i) => `  ${i + 1}. ${it.quantidade}${it.unidade !== "un" ? it.unidade : "x"} ${it.descricao} [${it.categoria}]`).join("\n");
  const prioridadeEmoji = { baixa: "🟢", media: "🟡", alta: "🟠", emergencial: "🔴" };

  let resumo = `📋 *RESUMO DO PEDIDO DE COMPRAS*\n\n`;
  resumo += `🏷️ *Código: ${d._pedidoCodigo}*\n`;
  resumo += `*Título:* ${d.titulo}\n`;
  resumo += `*Motivo:* ${d.motivo}\n`;
  if (d.sistema) resumo += `*Sistema:* ${d.sistema}\n`;
  if (d.clienteNome) resumo += `*Cliente/Contrato:* ${d.clienteNome}\n`;
  resumo += `*Tipo:* ${d.tipoSolicitacao === "novo" ? "Produto Novo" : "Substituição"}\n`;
  if (d.substituicaoDescricao) resumo += `*Problema:* ${d.substituicaoDescricao.substring(0, 100)}\n`;
  if (d.haveraDevolucao === false) resumo += `*Devolução:* Não (${d.motivoNaoDevolucao || "-"})\n`;
  resumo += `\n*Itens (${(d.itens || []).length}):*\n${itens}\n`;
  resumo += `\n*Destino:* ${d.destino}\n`;
  resumo += `*Prioridade:* ${prioridadeEmoji[d.prioridade]} ${d.prioridade.toUpperCase()}\n`;
  resumo += `*Aprovador:* ${formatarTelefone(d.aprovadorTelefone)}\n`;

  await enviarMensagem(sessao._remoteJid, resumo);
  await enviarListaSelecao(sessao._remoteJid,
    `O que deseja fazer?`,
    "Confirmar ou cancelar",
    [{ titulo: "Ação", opcoes: [
      { id: "1", titulo: "✅ Confirmar", descricao: "Enviar para aprovação" },
      { id: "2", titulo: "❌ Cancelar", descricao: "Descartar este pedido" },
    ]}]
  );
}

// ─── CONFIRMAÇÃO FINAL ───────────────────────────────────────────────────────

async function handleComprasConfirmacao(sessao, opcao) {
  const d = sessao.dadosParciais;
  const codigo = d._pedidoCodigo;

  if (opcao === "2" || opcao === "cancelar") {
    // Cancelar pedido rascunho
    if (codigo) {
      try {
        await PedidoCompra.findOneAndUpdate(
          { codigo },
          { status: "cancelado", $push: { historico: { acao: "Cancelado pelo solicitante", usuario: sessao.telefone } } }
        );
      } catch (_) {}
    }
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    await sessao.save();
    await enviarMensagem(sessao._remoteJid, `↩️ Pedido${codigo ? ` ${codigo}` : ""} cancelado.`);
    return;
  }

  if (opcao !== "1" && opcao !== "confirmar" && opcao !== "sim") {
    await enviarListaSelecao(sessao._remoteJid, "Selecione:", "Confirmar ou cancelar",
      [{ titulo: "Ação", opcoes: [
        { id: "1", titulo: "✅ Confirmar", descricao: "Enviar para aprovação" },
        { id: "2", titulo: "❌ Cancelar", descricao: "Descartar pedido" },
      ]}]
    );
    return;
  }

  await enviarMensagem(sessao._remoteJid, "⏳ Enviando para aprovação...");

  try {
    // Buscar pedido rascunho
    const pedido = await PedidoCompra.findOne({ codigo });
    if (!pedido) {
      throw new Error(`Pedido ${codigo} não encontrado no banco.`);
    }

    // Atualizar status para aguardando_aprovacao
    pedido.status = "aguardando_aprovacao";
    pedido.historico.push({ acao: "Confirmado e enviado para aprovação", usuario: sessao.telefone });
    await pedido.save();

    // Criar ticket no Jitbit
    let ticketId = null;
    try {
      const itensTexto = (d.itens || []).map(it => `• ${it.quantidade}${it.unidade !== "un" ? it.unidade : "x"} ${it.descricao}`).join("\n");
      const corpo = [
        `PEDIDO DE COMPRAS: ${codigo}`,
        `Tipo: ${d.tipoSolicitacao === "novo" ? "Produto Novo" : "Substituição"}`,
        `Motivo: ${d.motivo}`,
        d.sistema ? `Sistema: ${d.sistema}` : "",
        d.clienteNome ? `Cliente: ${d.clienteNome}` : "",
        `Prioridade: ${d.prioridade.toUpperCase()}`,
        `\nItens:\n${itensTexto}`,
        `\nDestino: ${d.destino}`,
        d.substituicaoDescricao ? `\nProblema: ${d.substituicaoDescricao}` : "",
        `\n---\nSolicitante: ${sessao.nome} (${sessao.telefone})`,
        `Criado via WhatsApp em ${new Date().toLocaleString("pt-BR")}`,
      ].filter(Boolean).join("\n");

      const resultado = await criarTicket(
        `[COMPRAS] ${codigo} - ${d.titulo}`,
        corpo,
        0
      );
      ticketId = resultado.ticketId;
      pedido.ticketJitbitId = ticketId;
      await pedido.save();
      console.log(`🎫 [Compras] Ticket Jitbit #${ticketId} criado para ${codigo}`);
    } catch (err) {
      console.error("⚠️ [Compras] Erro ao criar ticket Jitbit:", err.message);
    }

    // Enviar para aprovação via WhatsApp
    await enviarAprovacao(pedido, d.aprovadorTelefone);

    // Limpar sessão
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    await sessao.save();

    salvarHistorico({
      mensagem: `[COMPRAS] ${codigo} - ${d.titulo} — ${sessao.telefone}`,
      origem: "whatsapp-compras",
      resposta: `Pedido ${codigo} confirmado${ticketId ? ` (Ticket #${ticketId})` : ""}`
    });

    await enviarMensagem(sessao._remoteJid,
      `✅ *Pedido de Compras enviado para aprovação!*\n\n` +
      `🏷️ Código: *${codigo}*\n` +
      (ticketId ? `🎫 Ticket: *#${ticketId}*\n🔗 Acompanhe: https://desk.axiontecnologia.com.br/Ticket/${ticketId}\n` : "") +
      `📊 Status: Aguardando aprovação\n` +
      `⚡ Prioridade: ${d.prioridade.toUpperCase()}\n\n` +
      `O gestor responsável será notificado para aprovação.\n` +
      `Consulte a qualquer momento com a opção *6* do menu.\n\n` +
      `Digite *menu* para voltar.`);

  } catch (err) {
    salvarErroWhatsApp({ telefone: sessao.telefone, estado: "compras_confirmacao", erro: err.message });
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    await sessao.save();
    await enviarMensagem(sessao._remoteJid, `❌ Erro ao enviar para aprovação: ${err.message}\n\nDigite *menu* para tentar novamente.`);
  }
}

// ─── APROVAÇÃO VIA WHATSAPP ──────────────────────────────────────────────────

async function enviarAprovacao(pedido, aprovadorEscolhido) {
  const aprovador = aprovadorEscolhido || APROVADOR_PADRAO;
  if (!aprovador) {
    console.log(`⚠️ [Compras] Sem aprovador configurado para ${pedido.codigo}`);
    return;
  }

  // Verificar se o número existe no WhatsApp e obter JID real
  const verificacao = await verificarNumeroWhatsApp(aprovador);
  const jidAprovador = verificacao.jid || `${aprovador}@s.whatsapp.net`;
  
  if (!verificacao.exists) {
    console.error(`❌ [Compras] Aprovador ${aprovador} NÃO está no WhatsApp — ${pedido.codigo}`);
    // Notificar solicitante (usa JID da sessão para suportar LIDs)
    try {
      const sessaoSol = await WhatsAppSessao.findOne({ telefone: pedido.solicitante.telefone });
      const solJid = sessaoSol?._remoteJid || `${pedido.solicitante.telefone}@s.whatsapp.net`;
      await enviarMensagem(solJid, `⚠️ *Atenção:* O número do aprovador *${formatarTelefone(aprovador)}* não está registrado no WhatsApp.\n\nO pedido *${pedido.codigo}* foi criado, mas a aprovação não foi enviada. Contate o gestor manualmente ou abra um novo pedido com outro número.`);
    } catch (err) {
      console.error(`⚠️ [Compras] Erro ao notificar solicitante (${pedido.solicitante.telefone}):`, err.message);
    }
    return;
  }

  const itensResumo = pedido.itens.map(it => `  • ${it.quantidade}${it.unidade !== "un" ? it.unidade : "x"} ${it.descricao}`).join("\n");

  const msg = `🔔 *APROVAÇÃO NECESSÁRIA*\n\n` +
    `📋 Pedido: *${pedido.codigo}*\n` +
    `👤 Solicitante: ${pedido.solicitante.nome} (${pedido.solicitante.telefone})\n` +
    (pedido.clienteNome ? `🏢 Cliente: ${pedido.clienteNome}\n` : "") +
    `📌 Título: ${pedido.titulo}\n` +
    `💬 Motivo: ${pedido.motivo}\n` +
    (pedido.sistema ? `🖥️ Sistema: ${pedido.sistema}\n` : "") +
    `⚡ Prioridade: ${pedido.prioridade.toUpperCase()}\n` +
    `\n📦 *Itens:*\n${itensResumo}`;

  try {
    // Enviar resumo como texto, e depois a lista de ação
    await enviarMensagem(jidAprovador, msg);
    await enviarListaSelecao(jidAprovador,
      `Responda para o pedido *${pedido.codigo}*:\n\n_Digite APROVAR ou REJEITAR_`,
      "Aprovar ou Rejeitar",
      [{ titulo: "Decisão", opcoes: [
        { id: "aprovar", titulo: "✅ Aprovar pedido" },
        { id: "rejeitar", titulo: "❌ Rejeitar pedido" },
      ]}],
      { rodape: `Pedido ${pedido.codigo}` }
    );
    
    // Registrar aprovação pendente
    pedido.aprovacoes.push({
      aprovador,
      nome: "Gestor",
      papel: "gestor",
      decisao: "pendente",
    });
    await pedido.save();

    // Vincular pedido na sessão do aprovador para evitar aprovação acidental
    // Salva vinculação tanto pelo telefone quanto pelo identificador do JID
    // (resolve o problema de LID: mensagem vai para phone-JID mas resposta vem de LID)
    const telefoneAprovador = aprovador.replace(/\D/g, "");
    const telefonePeloJid = jidAprovador.replace(/@.*$/, "");
    
    // Sessões a vincular: telefone do aprovador + telefone extraído do JID (pode ser LID)
    const telefonesVincular = [telefoneAprovador];
    if (telefonePeloJid !== telefoneAprovador) {
      telefonesVincular.push(telefonePeloJid);
    }

    for (const tel of telefonesVincular) {
      let sessaoAprov = await WhatsAppSessao.findOne({ telefone: tel });
      if (!sessaoAprov) {
        sessaoAprov = await WhatsAppSessao.create({
          telefone: tel,
          nome: "Aprovador",
          estado: "inicio",
          lgpdAceito: true,
          dadosParciais: { _pedidoAprovacao: pedido.codigo },
        });
      } else {
        sessaoAprov.dadosParciais = sessaoAprov.dadosParciais || {};
        sessaoAprov.dadosParciais._pedidoAprovacao = pedido.codigo;
        sessaoAprov.markModified("dadosParciais");
        await sessaoAprov.save();
      }
    }

    console.log(`✅ [Compras] Aprovação enviada para ${aprovador} (JID: ${jidAprovador}) — ${pedido.codigo} (vinculado)`);
  } catch (err) {
    console.error(`❌ [Compras] Falha ao enviar aprovação para ${aprovador}:`, err.message);
  }
}

// ─── PROCESSAR RESPOSTA DE APROVAÇÃO ─────────────────────────────────────────

/**
 * Quando há múltiplos pedidos pendentes e o aprovador não especificou qual,
 * lista os pedidos para que ele escolha com "APROVAR PC-XXXX" ou "REJEITAR PC-XXXX".
 */
async function listarPedidosPendentesParaAprovador(jid, pendentes, telefone) {
  const lista = pendentes.map((p, i) => {
    const solicitante = p.solicitante?.nome || "—";
    const ticket = p.ticketJitbitId ? ` | 🎫 #${p.ticketJitbitId}` : "";
    return `  ${i + 1}. *${p.codigo}* — ${p.titulo}\n     👤 ${solicitante} | ⚡ ${p.prioridade || "normal"}${ticket}`;
  }).join("\n\n");

  // Salvar o pedido mais recente como vinculação na sessão
  // para que "1"/"2" funcione na próxima mensagem
  if (telefone) {
    const sessao = await WhatsAppSessao.findOne({ telefone });
    if (sessao) {
      sessao.dadosParciais = sessao.dadosParciais || {};
      sessao.dadosParciais._pedidoAprovacao = pendentes[0].codigo;
      sessao.markModified("dadosParciais");
      await sessao.save();
    }
  }

  await enviarMensagem(jid,
    `⚠️ *Existem ${pendentes.length} pedidos aguardando aprovação:*\n\n` +
    `${lista}\n\n` +
    `─────────────────\n` +
    `Para aprovar ou rejeitar, especifique o código:\n` +
    `  *APROVAR PC-XXXX-XXXXXX*\n` +
    `  *REJEITAR PC-XXXX-XXXXXX*\n` +
    `  ou pelo ticket: *APROVAR #12345*\n\n` +
    `_Ou responda com 1/2 para o mais recente (*${pendentes[0].codigo}*)_`);
}

/**
 * Verifica se uma mensagem é uma resposta de aprovação
 * Retorna true se processou, false se não é aprovação
 * 
 * Lida com LIDs do WhatsApp: a aprovação é enviada para um número (ex: 5562984085383)
 * mas a resposta vem de um LID (ex: 189365275902068@lid). Por isso, aceita
 * keywords APROVAR/REJEITAR que fazem busca ampla por qualquer pedido pendente.
 */
export async function tentarProcessarAprovacao(telefone, texto, remoteJid) {
  // Strip formatação WhatsApp (* _ ~) e normalizar
  const t = (texto || "").trim().replace(/^\*+|\*+$/g, "").replace(/^_+|_+$/g, "").trim().toUpperCase();
  
  console.log(`🔍 [Compras] tentarProcessarAprovacao: tel=${telefone}, texto="${t}", jid=${remoteJid}`);
  
  // Formatos aceitos (texto digitado, botão clicado ou buttonId):
  // "APROVAR" / "REJEITAR" — busca vinculada ou ampla
  // "✅ APROVAR" / "❌ REJEITAR" — clique em botão (displayText)
  // "APROVAR PC-XXXX" / "REJEITAR PC-XXXX" — busca por código do pedido
  // "APROVAR #12345" / "REJEITAR #12345" — busca por ticket Jitbit
  // "1" / "2" — busca pelo pedido vinculado na sessão
  const matchAprovarCodigo = t.match(/^APROVAR\s+(PC-\d{4}-\d{6})$/);
  const matchRejeitarCodigo = t.match(/^REJEITAR\s+(PC-\d{4}-\d{6})$/);
  const matchAprovarTicket = t.match(/^APROVAR\s+#?(\d{4,})$/);
  const matchRejeitarTicket = t.match(/^REJEITAR\s+#?(\d{4,})$/);
  const isAprovarSimples = (t === "APROVAR" || t === "SIM" || t === "APROVADO" || t === "✅ APROVAR" || t === "✅APROVAR");
  const isRejeitarSimples = (t === "REJEITAR" || t === "NAO" || t === "NÃO" || t === "REJEITADO" || t === "REPROVAR" || t === "❌ REJEITAR" || t === "❌REJEITAR");
  const isNumerico = (t === "1" || t === "2");

  // Se não é nenhum formato de aprovação, sai
  if (!matchAprovarCodigo && !matchRejeitarCodigo && !matchAprovarTicket && !matchRejeitarTicket && !isAprovarSimples && !isRejeitarSimples && !isNumerico) return false;

  let pedido = null;
  let codigo = matchAprovarCodigo?.[1] || matchRejeitarCodigo?.[1];
  const ticketIdBusca = matchAprovarTicket?.[1] || matchRejeitarTicket?.[1];
  let aprovadorReal = telefone; // pode ser LID, será ajustado

  // Tentar buscar pedido vinculado na sessão do usuário (prioridade)
  const sessaoAtual = await WhatsAppSessao.findOne({ telefone });
  const pedidoVinculado = sessaoAtual?.dadosParciais?._pedidoAprovacao;

  if (codigo) {
    // Busca por código específico (usuário digitou "APROVAR PC-XXXX")
    pedido = await PedidoCompra.findOne({ codigo, status: "aguardando_aprovacao" });
  } else if (ticketIdBusca) {
    // Busca por ticket Jitbit (usuário digitou "APROVAR #12345")
    pedido = await PedidoCompra.findOne({ ticketJitbitId: parseInt(ticketIdBusca), status: "aguardando_aprovacao" });
    if (pedido) codigo = pedido.codigo;
  } else if (pedidoVinculado) {
    // Tem pedido vinculado na sessão — usar esse (seguro)
    pedido = await PedidoCompra.findOne({ codigo: pedidoVinculado, status: "aguardando_aprovacao", "aprovacoes.decisao": "pendente" });
    if (pedido) {
      codigo = pedido.codigo;
    } else {
      // Pedido vinculado já não está pendente — limpar e verificar se há outros
      if (sessaoAtual) {
        delete sessaoAtual.dadosParciais._pedidoAprovacao;
        sessaoAtual.markModified("dadosParciais");
        await sessaoAtual.save();
      }
      // Se foi numérico e não há vínculo válido, NÃO fazer busca ampla
      if (isNumerico) return false;
      // Para keywords explícitas, verificar se há outros pendentes
      const pendentes = await PedidoCompra.find({ status: "aguardando_aprovacao", "aprovacoes.decisao": "pendente" }).sort({ criadoEm: -1 }).limit(5).lean();
      if (pendentes.length === 0) return false;
      if (pendentes.length === 1) {
        pedido = await PedidoCompra.findOne({ _id: pendentes[0]._id });
        codigo = pedido.codigo;
      } else {
        // Múltiplos pendentes — listar para o aprovador escolher
        await listarPedidosPendentesParaAprovador(remoteJid, pendentes, telefone);
        return true;
      }
    }
  } else if (isNumerico) {
    // Sem vínculo na sessão e é numérico — NÃO fazer busca ampla (evita aprovação acidental)
    // Verificar se há exatamente 1 pendente (caso seguro)
    const pendentes = await PedidoCompra.find({ status: "aguardando_aprovacao", "aprovacoes.decisao": "pendente" }).sort({ criadoEm: -1 }).limit(5).lean();
    if (pendentes.length === 0) return false;
    if (pendentes.length === 1) {
      pedido = await PedidoCompra.findOne({ _id: pendentes[0]._id });
      codigo = pedido.codigo;
    } else {
      // Múltiplos pendentes sem vínculo — listar para escolher
      await listarPedidosPendentesParaAprovador(remoteJid, pendentes, telefone);
      return true;
    }
  } else {
    // APROVAR/REJEITAR simples sem vínculo — buscar pendentes
    const pendentes = await PedidoCompra.find({ status: "aguardando_aprovacao", "aprovacoes.decisao": "pendente" }).sort({ criadoEm: -1 }).limit(5).lean();
    if (pendentes.length === 0) return false;
    if (pendentes.length === 1) {
      pedido = await PedidoCompra.findOne({ _id: pendentes[0]._id });
      codigo = pedido.codigo;
    } else {
      // Múltiplos pendentes — listar
      await listarPedidosPendentesParaAprovador(remoteJid, pendentes, telefone);
      return true;
    }
  }

  if (!pedido) {
    await enviarMensagem(remoteJid, `❌ Pedido ${codigo} não encontrado.`);
    return true;
  }

  if (pedido.status !== "aguardando_aprovacao") {
    await enviarMensagem(remoteJid, `ℹ️ Pedido ${codigo} já está com status: *${pedido.status}*`);
    return true;
  }

  // Identificar o aprovador real (do pedido, não o LID)
  const aprovacaoPendente = pedido.aprovacoes.find(a => a.decisao === "pendente");
  if (aprovacaoPendente) {
    aprovadorReal = aprovacaoPendente.aprovador;
  }

  const jid = remoteJid || `${telefone}@s.whatsapp.net`;
  const aprovou = matchAprovarCodigo || matchAprovarTicket || isAprovarSimples || t === "1";
  const rejeitou = matchRejeitarCodigo || matchRejeitarTicket || isRejeitarSimples || t === "2";

  if (aprovou) {
    pedido.status = "aprovado";
    pedido.aprovacoes.forEach(a => {
      if (a.aprovador === aprovadorReal && a.decisao === "pendente") {
        a.decisao = "aprovado";
        a.dataDecisao = new Date();
      }
    });
    pedido.historico.push({ acao: "Aprovado", usuario: aprovadorReal, detalhes: "Aprovação via WhatsApp" });
    pedido.markModified("aprovacoes");
    await pedido.save();

    // Salvar reply no ticket Jitbit (ou criar ticket se não existir)
    if (!pedido.ticketJitbitId) {
      // Ticket não foi criado na confirmação — criar agora
      try {
        const itensTexto = pedido.itens.map(it => `• ${it.quantidade}${it.unidade !== "un" ? it.unidade : "x"} ${it.descricao}`).join("\n");
        const corpo = [
          `PEDIDO DE COMPRAS: ${pedido.codigo}`,
          `Tipo: ${pedido.tipoSolicitacao === "novo" ? "Produto Novo" : "Substituição"}`,
          `Motivo: ${pedido.motivo}`,
          pedido.sistema ? `Sistema: ${pedido.sistema}` : "",
          pedido.clienteNome ? `Cliente: ${pedido.clienteNome}` : "",
          `Prioridade: ${pedido.prioridade.toUpperCase()}`,
          `\nItens:\n${itensTexto}`,
          pedido.destino?.endereco ? `\nDestino: ${pedido.destino.endereco}` : "",
          `\n---\nSolicitante: ${pedido.solicitante?.nome} (${pedido.solicitante?.telefone})`,
          `Criado via WhatsApp — Ticket criado após aprovação`,
        ].filter(Boolean).join("\n");
        const resultado = await criarTicket(`[COMPRAS] ${pedido.codigo} - ${pedido.titulo}`, corpo, 0);
        pedido.ticketJitbitId = resultado.ticketId;
        await pedido.save();
        console.log(`🎫 [Compras] Ticket Jitbit #${resultado.ticketId} criado na aprovação para ${pedido.codigo}`);
      } catch (err) {
        console.error(`⚠️ [Compras] Erro ao criar ticket na aprovação (${pedido.codigo}):`, err.message);
      }
    }

    if (pedido.ticketJitbitId) {
      try {
        const replyBody = [
          `✅ PEDIDO APROVADO`,
          ``,
          `Aprovador: ${formatarTelefone(aprovadorReal)} (via WhatsApp)`,
          `Data: ${new Date().toLocaleString("pt-BR")}`,
          ``,
          `O pedido ${pedido.codigo} foi APROVADO e encaminhado para o setor de compras.`,
        ].join("\n");
        await responderTicket(pedido.ticketJitbitId, replyBody);
        console.log(`✅ [Compras] Reply salvo no Jitbit ticket #${pedido.ticketJitbitId} — ${pedido.codigo} APROVADO`);
      } catch (err) {
        console.error(`⚠️ [Compras] Erro ao salvar reply no Jitbit (ticket #${pedido.ticketJitbitId}):`, err.message);
      }
    }

    await enviarMensagem(jid, `✅ Pedido *${codigo}* *APROVADO* com sucesso!\n\nO setor de compras foi notificado. Atendimento encerrado. Obrigado!`);
    
    // Encerrar sessão do aprovador
    await encerrarSessaoAprovador(telefone);
    
    // Notificar solicitante (usa JID da sessão para suportar LIDs)
    if (pedido.solicitante?.telefone) {
      try {
        const sessaoSolicitante = await WhatsAppSessao.findOne({ telefone: pedido.solicitante.telefone });
        const jidSolicitante = sessaoSolicitante?._remoteJid || `${pedido.solicitante.telefone}@s.whatsapp.net`;
        await enviarMensagem(jidSolicitante,
          `✅ *Pedido aprovado!*\n\n🏷️ Código: *${codigo}*\n📌 ${pedido.titulo}\n👤 Aprovado por: ${formatarTelefone(aprovadorReal)}\n\nSeu pedido foi aprovado e encaminhado para compras.`);
      } catch (err) {
        console.error(`⚠️ [Compras] Erro ao notificar solicitante (${pedido.solicitante.telefone}):`, err.message);
      }
    }

    console.log(`✅ [Compras] Pedido ${codigo} APROVADO por ${aprovadorReal} (sessão: ${telefone})`);

  } else if (rejeitou) {
    // Guardar na sessão do aprovador para pedir motivo
    const sessaoAprov = await WhatsAppSessao.findOne({ telefone });
    if (sessaoAprov) {
      sessaoAprov.estado = "compras_motivo_rejeicao";
      sessaoAprov.dadosParciais = { _pedidoCodigo: codigo, _pedidoId: pedido._id.toString(), _aprovadorReal: aprovadorReal };
      sessaoAprov.lgpdAceito = true;
      sessaoAprov.ativo = true;
      sessaoAprov.markModified("dadosParciais");
      await sessaoAprov.save();
    }

    await enviarMensagem(jid, `❌ Pedido *${codigo}* será *REJEITADO*.\n\n📝 Por favor, informe o *motivo da rejeição*:\n\n_Digite o motivo abaixo:_`);
  }

  return true;
}

// ─── CONSULTA DE PEDIDOS ─────────────────────────────────────────────────────

async function handleComprasConsulta(sessao, texto) {
  const tLower = texto.toLowerCase();

  if (tLower === "meus" || tLower === "meu" || tLower === "todos") {
    const pedidos = await PedidoCompra.find({ "solicitante.telefone": sessao.telefone })
      .sort({ criadoEm: -1 }).limit(5).lean();

    if (pedidos.length === 0) {
      sessao.estado = "menu";
      await sessao.save();
      await enviarMensagem(sessao._remoteJid, "📭 Você não tem pedidos de compras registrados.\n\nDigite *menu* para voltar.");
      return;
    }

    const lista = pedidos.map(p => {
      const emoji = { aguardando_aprovacao: "⏳", aprovado: "✅", reprovado: "❌", em_cotacao: "💰", entregue: "📦", finalizado: "🏁", cancelado: "🚫" };
      return `${emoji[p.status] || "📋"} *${p.codigo}* — ${p.titulo}\n   Status: ${p.status} | ${new Date(p.criadoEm).toLocaleDateString("pt-BR")}`;
    }).join("\n\n");

    sessao.estado = "menu";
    await sessao.save();
    await enviarMensagem(sessao._remoteJid, `📋 *Seus últimos pedidos:*\n\n${lista}\n\nDigite *menu* para voltar.`);

  } else if (texto.match(/^PC-\d{4}-\d{6}$/i)) {
    const pedido = await PedidoCompra.findOne({ codigo: texto.toUpperCase() }).lean();
    if (!pedido) {
      await enviarMensagem(sessao._remoteJid, `❌ Pedido ${texto.toUpperCase()} não encontrado.\n\nDigite outro código ou *meus* para listar seus pedidos.`);
      return;
    }

    await exibirDetalhesPedido(sessao, pedido);

  } else if (texto.match(/^#?\d{4,}$/)) {
    // Busca por ticket Jitbit (ex: #12345 ou 12345)
    const ticketId = parseInt(texto.replace("#", ""), 10);
    const pedido = await PedidoCompra.findOne({ ticketJitbitId: ticketId }).lean();
    if (!pedido) {
      await enviarMensagem(sessao._remoteJid, `❌ Nenhum pedido encontrado com ticket #${ticketId}.\n\nDigite o código *PC-XXXX-XXXXXX* ou *meus* para listar seus pedidos.`);
      return;
    }

    await exibirDetalhesPedido(sessao, pedido);

  } else {
    await enviarMensagem(sessao._remoteJid, `Digite o código do pedido (ex: *PC-2026-000001*)\nou o ticket (ex: *#12345*)\nou *meus* para ver seus pedidos.`);
  }
}

// ─── EXIBIR DETALHES DO PEDIDO ───────────────────────────────────────────────

async function exibirDetalhesPedido(sessao, pedido) {
  const itens = pedido.itens.map(it => `  • ${it.quantidade}${it.unidade !== "un" ? it.unidade : "x"} ${it.descricao}`).join("\n");
  const hist = (pedido.historico || []).slice(-3).map(h => `  ${new Date(h.data).toLocaleDateString("pt-BR")} — ${h.acao}`).join("\n");

  sessao.estado = "menu";
  await sessao.save();
  await enviarMensagem(sessao._remoteJid,
    `📋 *Pedido ${pedido.codigo}*\n\n` +
    `📌 ${pedido.titulo}\n` +
    `📊 Status: *${pedido.status}*\n` +
    `⚡ Prioridade: ${pedido.prioridade}\n` +
    (pedido.clienteNome ? `🏢 Cliente: ${pedido.clienteNome}\n` : "") +
    (pedido.ticketJitbitId ? `🎫 Ticket: *#${pedido.ticketJitbitId}*\n🔗 https://desk.axiontecnologia.com.br/Ticket/${pedido.ticketJitbitId}\n` : "") +
    `\n📦 *Itens:*\n${itens}\n` +
    `\n📜 *Histórico:*\n${hist}\n\n` +
    `Digite *menu* para voltar.`);
}

// ─── ENCERRAR SESSÃO DO APROVADOR ────────────────────────────────────────────

async function encerrarSessaoAprovador(telefone) {
  const sessao = await WhatsAppSessao.findOne({ telefone });
  if (sessao) {
    sessao.estado = "encerrado";
    sessao.lgpdAceito = false;
    sessao.ativo = false;
    sessao.dadosParciais = {};
    await sessao.save();
  }
}

// ─── HANDLER: MOTIVO DA REJEIÇÃO ─────────────────────────────────────────────

async function handleMotivoRejeicao(sessao, texto) {
  if (!texto || texto.trim().length < 3) {
    await enviarMensagem(sessao._remoteJid, "⚠️ Por favor, informe o motivo da rejeição (mínimo 3 caracteres):");
    return;
  }

  const motivo = texto.trim();
  const codigo = sessao.dadosParciais._pedidoCodigo;
  const pedidoId = sessao.dadosParciais._pedidoId;
  const aprovadorReal = sessao.dadosParciais._aprovadorReal || sessao.telefone;
  const telefone = sessao.telefone;
  const jid = sessao._remoteJid;

  const pedido = await PedidoCompra.findById(pedidoId);
  if (!pedido) {
    await enviarMensagem(jid, `❌ Pedido ${codigo} não encontrado.`);
    await encerrarSessaoAprovador(telefone);
    return;
  }

  // Efetivar rejeição com motivo
  pedido.status = "reprovado";
  pedido.aprovacoes.forEach(a => {
    if (a.aprovador === aprovadorReal && a.decisao === "pendente") {
      a.decisao = "rejeitado";
      a.dataDecisao = new Date();
      a.motivo = motivo;
    }
  });
  pedido.historico.push({ acao: "Rejeitado", usuario: aprovadorReal, detalhes: `Motivo: ${motivo}` });
  pedido.markModified("aprovacoes");
  await pedido.save();

  // Salvar reply no ticket Jitbit com motivo (ou criar ticket se não existir)
  if (!pedido.ticketJitbitId) {
    try {
      const itensTexto = pedido.itens.map(it => `• ${it.quantidade}${it.unidade !== "un" ? it.unidade : "x"} ${it.descricao}`).join("\n");
      const corpo = [
        `PEDIDO DE COMPRAS: ${pedido.codigo}`,
        `Tipo: ${pedido.tipoSolicitacao === "novo" ? "Produto Novo" : "Substituição"}`,
        `Motivo: ${pedido.motivo}`,
        pedido.sistema ? `Sistema: ${pedido.sistema}` : "",
        pedido.clienteNome ? `Cliente: ${pedido.clienteNome}` : "",
        `Prioridade: ${pedido.prioridade.toUpperCase()}`,
        `\nItens:\n${itensTexto}`,
        pedido.destino?.endereco ? `\nDestino: ${pedido.destino.endereco}` : "",
        `\n---\nSolicitante: ${pedido.solicitante?.nome} (${pedido.solicitante?.telefone})`,
        `Criado via WhatsApp — Ticket criado após rejeição`,
      ].filter(Boolean).join("\n");
      const resultado = await criarTicket(`[COMPRAS] ${pedido.codigo} - ${pedido.titulo}`, corpo, 0);
      pedido.ticketJitbitId = resultado.ticketId;
      await pedido.save();
      console.log(`🎫 [Compras] Ticket Jitbit #${resultado.ticketId} criado na rejeição para ${pedido.codigo}`);
    } catch (err) {
      console.error(`⚠️ [Compras] Erro ao criar ticket na rejeição (${pedido.codigo}):`, err.message);
    }
  }

  if (pedido.ticketJitbitId) {
    try {
      const replyBody = [
        `❌ PEDIDO REJEITADO`,
        ``,
        `Aprovador: ${formatarTelefone(aprovadorReal)} (via WhatsApp)`,
        `Data: ${new Date().toLocaleString("pt-BR")}`,
        `Motivo: ${motivo}`,
        ``,
        `O pedido ${pedido.codigo} foi REJEITADO.`,
      ].join("\n");
      await responderTicket(pedido.ticketJitbitId, replyBody);
    } catch (err) {
      console.error(`⚠️ [Compras] Erro ao salvar reply no Jitbit:`, err.message);
    }
  }

  await enviarMensagem(jid, `❌ Pedido *${codigo}* *REJEITADO*.\n\n📝 Motivo: _${motivo}_\n\nAtendimento encerrado. Obrigado!`);

  // Encerrar sessão do aprovador
  await encerrarSessaoAprovador(telefone);

  console.log(`❌ [Compras] Pedido ${codigo} REJEITADO por ${aprovadorReal} — Motivo: ${motivo}`);

  // Notificar solicitante com motivo (usa JID da sessão para suportar LIDs)
  if (pedido.solicitante?.telefone) {
    try {
      const sessaoSolicitante = await WhatsAppSessao.findOne({ telefone: pedido.solicitante.telefone });
      const jidSolicitante = sessaoSolicitante?._remoteJid || `${pedido.solicitante.telefone}@s.whatsapp.net`;
      await enviarMensagem(jidSolicitante,
        `❌ *Pedido rejeitado*\n\n🏷️ Código: *${codigo}*\n📌 ${pedido.titulo}\n👤 Rejeitado por: ${formatarTelefone(aprovadorReal)}\n📝 Motivo: _${motivo}_\n\nSeu pedido foi rejeitado. Entre em contato com o gestor para mais detalhes.`);
    } catch (err) {
      console.error(`⚠️ [Compras] Erro ao notificar solicitante rejeição (${pedido.solicitante.telefone}):`, err.message);
    }
  }
}
