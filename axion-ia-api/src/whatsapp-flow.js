/**
 * whatsapp-flow.js
 * Máquina de estados da conversa WhatsApp ↔ Jitbit Helpdesk.
 *
 * Fluxo de abertura de chamado:
 *   menu → aguardando_assunto → aguardando_descricao
 *        → aguardando_categoria → aguardando_foto
 *        → confirmando_ticket → (cria ticket + anexa foto)
 */

import { WhatsAppSessao } from "./models/whatsapp-sessao.model.js";
import { enviarMensagem, enviarListaSelecao, enviarConfirmacao, enviarImagem, enviarMensagemComBotoes } from "./services/whatsapp.service.js";
import { criarTicketUsuario, buscarTicket, buscarComentarios, buscarCategorias, anexarArquivo, atribuirTecnico, listarUsuarios } from "./jitbit.js";
import { gerarResposta, gerarRespostaWA } from "./engine.js";
import { classificarMensagem } from "./classifier.js";
import { salvarHistorico, salvarErroWhatsApp } from "./logger.js";
import { iniciarFluxoCompras, iniciarConsultaCompras, processarCompras, tentarProcessarAprovacao } from "./compras-flow.js";

// Cache de categorias (5 min)
let _cacheCats = null;
let _cacheCatsTempo = 0;
async function obterCategorias() {
  if (_cacheCats && Date.now() - _cacheCatsTempo < 5 * 60 * 1000) return _cacheCats;
  _cacheCats = await buscarCategorias();
  _cacheCatsTempo = Date.now();
  return _cacheCats;
}

// Cache de usuários/técnicos (5 min)
let _cacheUsers = null;
let _cacheUsersTempo = 0;
async function obterUsuarios() {
  if (_cacheUsers && Date.now() - _cacheUsersTempo < 5 * 60 * 1000) return _cacheUsers;
  try {
    _cacheUsers = await listarUsuarios();
  } catch (_) { _cacheUsers = []; }
  _cacheUsersTempo = Date.now();
  return _cacheUsers;
}

// Armazenamento temporário de fotos em memória (não salvar binário no MongoDB)
const fotosTemp = new Map(); // telefone → { buffer, mimeType, filename }

// URL da política de privacidade (configurável via env)
const LGPD_POLITICA_URL = process.env.LGPD_POLITICA_URL || "http://localhost:3100/public/politica-privacidade.pdf";

const MENSAGEM_LGPD = (nome) => `Olá${nome ? ` *${nome}*` : ""} 👋

Bem-vindo(a) ao Atendimento da *Axion Tecnologia*.

Antes de continuar, informamos que este canal realiza coleta e tratamento de dados pessoais em conformidade com a *Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)*.

📄 Nossa Política de Privacidade está disponível em:
${LGPD_POLITICA_URL}

A transmissão de informações e documentos por este canal é realizada com o seu expresso consentimento, em conformidade com a LGPD.

*Podemos continuar nossa conversa?*`;

const LGPD_SECOES = [{
  titulo: "Consentimento",
  opcoes: [
    { id: "1", titulo: "Aceito os termos", descricao: "Política de Privacidade" },
    { id: "2", titulo: "Não aceito", descricao: "O atendimento será encerrado" },
  ]
}];

const MENU = `Olá! Sou o assistente da *Axion Tecnologia* 🤖\n\nComo posso ajudar?`;

const MENU_SECOES = [{
  titulo: "Atendimento",
  opcoes: [
    { id: "1", titulo: "Abrir novo chamado", descricao: "Registrar um problema ou solicitação" },
    { id: "2", titulo: "Consultar chamado", descricao: "Ver status de um chamado existente" },
    { id: "3", titulo: "Responder chamado", descricao: "Enviar informação adicional" },
    { id: "4", titulo: "Dúvidas do Sistema", descricao: "Perguntar sobre funcionalidades" },
  ]
}, {
  titulo: "Compras",
  opcoes: [
    { id: "5", titulo: "Solicitar Compras", descricao: "Abrir pedido de compra/reposição" },
    { id: "6", titulo: "Consultar Pedido", descricao: "Acompanhar pedido de compras" },
  ]
}, {
  titulo: "Outros",
  opcoes: [
    { id: "0", titulo: "Falar com atendente", descricao: "Transferir para atendimento humano" },
  ]
}];

const MENU_OPCOES = ["1", "2", "3", "4", "5", "6", "0"];

/** Envia o menu principal como Interactive List (com fallback automático) */
async function enviarMenu(jid) {
  await enviarListaSelecao(jid, MENU, "Ver opções", MENU_SECOES, {
    titulo: "Menu Principal",
    rodape: "Axion Tecnologia",
  });
}

// --------------------------------------------------------------------------

async function obterOuCriarSessao(telefone, nome, remoteJid) {
  let sessao = await WhatsAppSessao.findOne({ telefone });
  if (!sessao) {
    sessao = await WhatsAppSessao.create({ telefone, nome, estado: "inicio" });
  } else if (sessao.estado === "encerrado") {
    // Sessão encerrada — resetar para novo ciclo completo (LGPD)
    sessao.estado = "inicio";
    sessao.lgpdAceito = false;
    sessao.ativo = true;
    sessao.nome = nome || sessao.nome;
  } else {
    sessao.nome = nome || sessao.nome;
    sessao.ultimaMensagem = new Date();
    sessao.ativo = true;
  }
  // JID completo para responder — persiste no Mongo para polling de tickets fechados
  const jidFinal = remoteJid || `${telefone}@s.whatsapp.net`;
  sessao._remoteJid = jidFinal;
  sessao.remoteJid = jidFinal;
  return sessao;
}

async function salvarSessao(sessao) {
  sessao.ultimaMensagem = new Date();
  await sessao.save();
}

// --------------------------------------------------------------------------

/**
 * Ponto de entrada para cada mensagem recebida.
 * @param {string} telefone
 * @param {string} nome
 * @param {string} texto
 * @param {{ buffer: Buffer, mimeType: string, filename: string }|null} midia
 */
export async function processarMensagemWA(telefone, nome, texto, midia = null, remoteJid = null) {
  let sessao;
  try {
    sessao = await obterOuCriarSessao(telefone, nome, remoteJid || `${telefone}@s.whatsapp.net`);
  } catch (err) {
    salvarErroWhatsApp({ telefone, estado: "obterSessao", erro: err.message, contexto: { nome, texto: texto?.substring(0, 50) } });
    return;
  }
  const jid = sessao._remoteJid;
  const t = (texto || "").trim().toLowerCase();

  try {
  // Verificar se é resposta de aprovação de compras ANTES do LGPD gate
  // (aprovador pode não ter interagido antes e não ter LGPD aceito)
  const textoLimpo = (texto || "").trim().replace(/^\*+|\*+$/g, ""); // strip asteriscos WhatsApp
  const isKeywordAprovacaoForte = /^(APROVAR|REJEITAR|APROVADO|REJEITADO|REPROVAR)/i.test(textoLimpo);
  const isKeywordAprovacaoFraca = /^(SIM|NÃO|NAO)$/i.test(textoLimpo);
  const isNumericoAprovacao = /^[12]$/.test((texto || "").trim());
  const temVinculacaoAprovacao = sessao.dadosParciais?._pedidoAprovacao;
  const emFluxoCompras = sessao.estado?.startsWith("compras_");

  // Keywords fortes (APROVAR/REJEITAR) funcionam em qualquer estado EXCETO fluxos compras ativos
  // Keywords fracas (SIM/NÃO) e numérico só funcionam com vinculação direta ao pedido
  const podeTentarAprovacao = !emFluxoCompras && (
    isKeywordAprovacaoForte || 
    ((isKeywordAprovacaoFraca || isNumericoAprovacao) && temVinculacaoAprovacao)
  );
  
  if (podeTentarAprovacao && await tentarProcessarAprovacao(telefone, texto, jid)) {
    return;
  }

  // === Comandos globais: "sair"/"encerrar"/"finalizar" funcionam em QUALQUER estado ===
  if (["sair", "encerrar", "terminar", "finalizar"].includes(t)) {
    sessao.estado = "encerrado";
    sessao.lgpdAceito = false;
    sessao.ativo = false;
    sessao.dadosParciais = {};
    fotosTemp.delete(telefone);
    await salvarSessao(sessao);
    await enviarMensagem(jid, `✅ Atendimento encerrado.\n\nObrigado pelo contato! Ao enviar uma nova mensagem, o atendimento será reiniciado.`);
    return;
  }

  // === LGPD Gate: exigir consentimento antes de qualquer interação ===
  if (!sessao.lgpdAceito) {
    if (sessao.estado !== "aguardando_lgpd") {
      // Primeira interação — apresentar termos LGPD
      sessao.estado = "aguardando_lgpd";
      sessao.dadosParciais = {};
      await salvarSessao(sessao);
      await enviarMensagem(jid, MENSAGEM_LGPD(sessao.nome));
      await enviarMensagemComBotoes(jid, "Por favor, selecione uma opção para continuar:", [
        { id: "1", texto: "✅ ACEITAR" },
        { id: "2", texto: "❌ NÃO ACEITAR" }
      ], "Axion Tecnologia");
      return;
    }
    // Sessão já está aguardando resposta LGPD
    await handleLgpd(sessao, t);
    return;
  }

  // "cancelar", "voltar", "0" (fora do menu) = cancela fluxo atual e volta ao menu (mantém LGPD)
  if (["cancelar", "voltar"].includes(t) || (t === "0" && sessao.estado !== "menu")) {
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    fotosTemp.delete(telefone);
    await salvarSessao(sessao);
    await enviarMensagem(jid, `↩️ Operação cancelada.`);
    await enviarMenu(jid);
    return;
  }
  // Se estado é "atendente", o bot fica em silêncio (mensagem vai pro atendente humano)
  if (sessao.estado === "atendente") {
    // Silêncio intencional — atendente humano responde
    return;
  }
  // Se estado é "inicio" — qualquer mensagem inicia mostrando o menu
  if (sessao.estado === "inicio") {
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    fotosTemp.delete(telefone);
    await salvarSessao(sessao);
    await enviarMenu(jid);
    return;
  }
  // Se estado é "menu" e a mensagem NÃO é uma opção válida — reexibir menu
  if (sessao.estado === "menu" && !MENU_OPCOES.includes(t)) {
    await enviarMenu(jid);
    return;
  }
  // Atalho: se o usuário está no meio de um fluxo e digita "menu", volta ao início
  if (t === "menu" || t === "inicio") {
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    fotosTemp.delete(telefone);
    await salvarSessao(sessao);
    await enviarMenu(jid);
    return;
  }

  switch (sessao.estado) {
    case "inicio":
    case "menu":
      await handleMenu(sessao, t);
      break;
    case "aguardando_assunto":
      await handleAssunto(sessao, texto);
      break;
    case "aguardando_sistema":
      await handleSistema(sessao, t);
      break;
    case "aguardando_descricao":
      await handleDescricao(sessao, texto);
      break;
    case "aguardando_categoria":
      await handleCategoria(sessao, t);
      break;
    case "aguardando_foto":
      await handleFoto(sessao, t, midia);
      break;
    case "confirmando_ticket":
      await handleConfirmacao(sessao, t);
      break;
    case "consultando_numero":
      await handleConsultaNumero(sessao, texto);
      break;
    case "respondendo_numero":
      await handleRespondendoNumero(sessao, texto);
      break;
    case "respondendo_mensagem":
      await handleRespondendoMensagem(sessao, texto, midia);
      break;
    case "aguardando_modulo_duvida":
      await handleModuloDuvida(sessao, t);
      break;
    case "aguardando_duvida":
      await handleDuvida(sessao, texto);
      break;
    case "respondendo_duvida":
      await handleRespostaDuvida(sessao, t, texto);
      break;
    // ─── COMPRAS ─────────────────────────────────────────────
    case "compras_titulo":
    case "compras_motivo":
    case "compras_sistema":
    case "compras_cliente":
    case "compras_tipo":
    case "compras_substituicao":
    case "compras_devolucao":
    case "compras_motivo_nao_devolucao":
    case "compras_itens":
    case "compras_destino":
    case "compras_prioridade":
    case "compras_aprovador":
    case "compras_confirmacao":
    case "compras_consulta":
    case "compras_motivo_rejeicao":
      await processarCompras(sessao, texto, midia);
      break;
    // ─── PESQUISA DE SATISFAÇÃO ──────────────────────────────
    case "avaliacao_nota":
      await handleAvaliacaoNota(sessao, t);
      break;
    case "avaliacao_comentario":
      await handleAvaliacaoComentario(sessao, texto);
      break;
    case "atendente":
      await handleAtendente(sessao, t);
      break;
    default:
      sessao.estado = "menu";
      await salvarSessao(sessao);
      await enviarMenu(jid);
  }
  } catch (err) {
    salvarErroWhatsApp({ telefone, estado: sessao?.estado, erro: err.message, contexto: { nome, texto: texto?.substring(0, 100), stack: err.stack?.substring(0, 300) } });
    try {
      await enviarMensagem(jid, "⚠️ Ocorreu um erro interno. Digite *menu* para reiniciar.");
    } catch (_) { /* falha ao notificar */ }
  }
}

// --------------------------------------------------------------------------
// HANDLERS
// --------------------------------------------------------------------------

async function handleLgpd(sessao, opcao) {
  if (opcao === "1" || opcao === "aceitar" || opcao === "sim" || opcao === "aceito" || opcao === "s") {
    // Usuário aceitou os termos
    sessao.lgpdAceito = true;
    sessao.lgpdAceitoEm = new Date();
    sessao.estado = "menu";
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, `✅ Obrigado! Seu consentimento foi registrado.`);
    await enviarMenu(sessao._remoteJid);
  } else if (opcao === "2" || opcao === "não aceitar" || opcao === "nao aceitar" || opcao === "nao" || opcao === "não") {
    // Usuário recusou — encerrar atendimento
    sessao.estado = "encerrado";
    sessao.ativo = false;
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid,
      `Entendido. O atendimento foi encerrado.\n\nCaso mude de ideia, envie uma mensagem a qualquer momento para reiniciar.`);
  } else {
    // Resposta inválida — repetir botões
    await enviarMensagemComBotoes(sessao._remoteJid, "Selecione uma das opções para continuar:", [
      { id: "1", texto: "✅ ACEITAR" },
      { id: "2", texto: "❌ NÃO ACEITAR" }
    ], "Axion Tecnologia");
  }
}

async function handleAtendente(sessao, texto) {
  // "sair", "encerrar", "cancelar" e "voltar" já são tratados pelos guards globais
  // Qualquer outra mensagem: silêncio intencional — atendente humano responde
}

async function handleMenu(sessao, opcao) {
  if (!MENU_OPCOES.includes(opcao)) {
    // Tenta responder como pergunta direta ao KB antes de dizer "não entendi"
    const contexto = classificarMensagem(opcao);
    if (contexto) {
      await enviarMensagem(sessao._remoteJid,
        `💡 *${contexto.assunto}*\n\n${contexto.acao}\n\n` +
        `_Digite *menu* para ver as opções ou faça outra pergunta._`);
      return;
    }
    await enviarMensagem(sessao._remoteJid, `Não entendi. Digite o número da opção:\n\n${MENU}`);
    return;
  }

  if (opcao === "1") {
    sessao.estado = "aguardando_assunto";
    sessao.dadosParciais = {};
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, "📝 *Novo Chamado*\n\nQual é o assunto do chamado?\n_(ex: Erro no relatório de passagens)_\n\n💡 _Digite *cancelar* para voltar ao menu._");

  } else if (opcao === "2") {
    sessao.estado = "consultando_numero";
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, "🔍 *Consultar Chamado*\n\nDigite o número do chamado:\n_(ex: 98765)_");

  } else if (opcao === "3") {
    sessao.estado = "respondendo_numero";
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, "💬 *Responder Chamado*\n\nDigite o número do chamado que deseja responder:");

  } else if (opcao === "4") {
    sessao.estado = "aguardando_modulo_duvida";
    sessao.dadosParciais = {};
    await salvarSessao(sessao);
    await enviarListaSelecao(sessao._remoteJid,
      `🔎 *Dúvidas do Sistema*\n\nQual sistema você tem dúvida?`,
      "Ver sistemas",
      [{ titulo: "Sistemas", opcoes: [
        { id: "1", titulo: "AxHub", descricao: "Trânsito" },
        { id: "2", titulo: "AxTon", descricao: "Pesagem" },
        { id: "3", titulo: "AxCross", descricao: "Cruzamentos" },
        { id: "0", titulo: "Qualquer / Não sei" },
      ]}]
    );

  } else if (opcao === "0") {
    sessao.estado = "atendente";
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, "👤 *Modo Atendente*\n\nVocê está em contato direto com a equipe Axion. Um atendente responderá em breve.\n\nDigite *cancelar* para voltar ao menu ou *sair* para encerrar o atendimento.");

  } else if (opcao === "5") {
    await iniciarFluxoCompras(sessao);

  } else if (opcao === "6") {
    await iniciarConsultaCompras(sessao);
  }
}

async function handleAssunto(sessao, texto) {
  if (!texto || texto.length < 5) {
    await enviarMensagem(sessao._remoteJid, "Por favor, descreva o assunto com pelo menos 5 caracteres.");
    return;
  }
  sessao.dadosParciais.assunto = texto;
  sessao.estado = "aguardando_sistema";
  sessao.markModified("dadosParciais");
  await salvarSessao(sessao);

  const SISTEMAS = [
    "AxBlitz", "AxCross", "AxFlow", "AxHub", "AxionAPI",
    "AxOCR", "AxRadar", "AxSync", "AxTon", "Azure", "Codtran"
  ];
  const opcoesSistemas = SISTEMAS.map((s, i) => ({ id: String(i + 1), titulo: s }));
  opcoesSistemas.push({ id: "0", titulo: "Não se aplica / Pular" });
  await enviarListaSelecao(sessao._remoteJid,
    `✅ Assunto registrado: *${texto}*\n\n🖥️ Selecione o sistema relacionado:`,
    "Ver sistemas",
    [{ titulo: "Sistemas", opcoes: opcoesSistemas }]
  );
}

async function handleSistema(sessao, opcao) {
  const SISTEMAS = [
    "AxBlitz", "AxCross", "AxFlow", "AxHub", "AxionAPI",
    "AxOCR", "AxRadar", "AxSync", "AxTon", "Azure", "Codtran"
  ];
  const idx = parseInt(opcao);

  if (opcao === "0" || isNaN(idx)) {
    sessao.dadosParciais.sistema = null;
  } else if (idx >= 1 && idx <= SISTEMAS.length) {
    sessao.dadosParciais.sistema = SISTEMAS[idx - 1];
  } else {
    const lista = SISTEMAS.map((s, i) => `*${i + 1}* — ${s}`).join("\n");
    await enviarMensagem(sessao._remoteJid, `Digite um número válido ou *0* para pular.\n\n${lista}`);
    return;
  }

  sessao.estado = "aguardando_descricao";
  sessao.markModified("dadosParciais");
  await salvarSessao(sessao);

  const sistemaStr = sessao.dadosParciais.sistema
    ? `Sistema: *${sessao.dadosParciais.sistema}*\n\n`
    : "";
  await enviarMensagem(sessao._remoteJid,
    `${sistemaStr}Agora descreva o problema em detalhes:\n_(Quanto mais detalhes, mais rápido o atendimento)_`);
}

async function handleDescricao(sessao, texto) {
  if (!texto || texto.length < 10) {
    await enviarMensagem(sessao._remoteJid, "Por favor, forneça mais detalhes sobre o problema (mínimo 10 caracteres).");
    return;
  }
  sessao.dadosParciais.descricao = texto;
  sessao.estado = "aguardando_categoria";
  sessao.markModified("dadosParciais");
  await salvarSessao(sessao);

  // Montar lista de categorias
  let opcoesCats = [{ id: "0", titulo: "Geral (padrão)" }];
  try {
    const cats = await obterCategorias();
    if (cats?.length) {
      opcoesCats = cats.map((c, i) => ({ id: String(i + 1), titulo: c.Name }));
      opcoesCats.push({ id: "0", titulo: "Pular (Geral)" });
      sessao._catsCache = cats;
    }
  } catch (_) { /* usar padrão */ }

  await enviarListaSelecao(sessao._remoteJid,
    `📂 Selecione a categoria do chamado:`,
    "Ver categorias",
    [{ titulo: "Categorias", opcoes: opcoesCats }]
  );
}

async function handleCategoria(sessao, opcao) {
  const cats = await obterCategorias().catch(() => []);
  const idx = parseInt(opcao);

  if (opcao === "0" || isNaN(idx)) {
    sessao.dadosParciais.categoriaId = cats?.[0]?.CategoryID || 0;
    sessao.dadosParciais.categoriaNome = cats?.[0]?.Name || "Geral";
  } else if (idx >= 1 && idx <= cats.length) {
    const cat = cats[idx - 1];
    sessao.dadosParciais.categoriaId = cat.CategoryID;
    sessao.dadosParciais.categoriaNome = cat.Name;
  } else {
    await enviarMensagem(sessao._remoteJid, `Digite um número válido da lista ou *0* para pular.`);
    return;
  }

  sessao.estado = "aguardando_foto";
  sessao.markModified("dadosParciais");
  await salvarSessao(sessao);

  await enviarMensagem(sessao._remoteJid,
    `📸 *Foto do problema*\n\nEnvie uma imagem relacionada ao chamado (opcional).\n\nDigite *0* ou *pular* para continuar sem foto.`);
}

async function handleFoto(sessao, opcao, midia) {
  // Usuário enviou imagem com download OK
  if (midia?.downloadOk && midia?.buffer) {
    fotosTemp.set(sessao.telefone, midia);
    sessao.dadosParciais.temFoto = true;
    sessao.markModified("dadosParciais");
    console.log(`📎 [WhatsApp] Foto salva em memória para ${sessao.telefone} (${midia.buffer.length} bytes)`);
    // não salva aqui — salva depois de setar estado

  // Usuário enviou imagem mas download falhou — pedir reenvio
  } else if (midia && !midia.downloadOk) {
    await enviarMensagem(sessao._remoteJid,
      "⚠️ Não consegui processar a imagem. Por favor, tente enviar novamente.\n\nOu digite *0* para continuar sem foto.");
    return;

  // Usuário digitou "0" / "pular" para continuar sem foto
  } else if (opcao === "0" || opcao === "pular" || opcao === "nao" || opcao === "não") {
    sessao.dadosParciais.temFoto = false;
    fotosTemp.delete(sessao.telefone);

  } else {
    await enviarMensagem(sessao._remoteJid, "📸 Envie uma imagem ou digite *0* para pular.");
    return;
  }

  sessao.estado = "confirmando_ticket";
  await salvarSessao(sessao);

  // Sugestão IA
  let sugestaoIA = "";
  try {
    const resultado = await gerarResposta(`${sessao.dadosParciais.assunto} ${sessao.dadosParciais.descricao}`);
    if (resultado.score >= 0.65) {
      sugestaoIA = `\n\n💡 *Sugestão da IA (${(resultado.score * 100).toFixed(0)}% confiança):*\n${resultado.resposta.substring(0, 300)}...`;
    }
  } catch (_) { /* IA indisponível */ }

  const fotoStr = sessao.dadosParciais.temFoto ? "✅ Com foto" : "❌ Sem foto";

  await enviarMensagem(sessao._remoteJid,
    `📋 *Confirme os dados do chamado:*\n\n` +
    `*Assunto:* ${sessao.dadosParciais.assunto}\n` +
    (sessao.dadosParciais.sistema ? `*Sistema:* ${sessao.dadosParciais.sistema}\n` : "") +
    `*Descrição:* ${sessao.dadosParciais.descricao?.substring(0, 200) || ""}${(sessao.dadosParciais.descricao?.length || 0) > 200 ? "..." : ""}\n` +
    `*Categoria:* ${sessao.dadosParciais.categoriaNome || "Geral"}\n` +
    `*Foto:* ${fotoStr}` +
    sugestaoIA
  );
  await enviarListaSelecao(sessao._remoteJid,
    `O que deseja fazer?`,
    "Confirmar ou cancelar",
    [{ titulo: "Ação", opcoes: [
      { id: "1", titulo: "✅ Confirmar", descricao: "Abrir chamado" },
      { id: "2", titulo: "❌ Cancelar", descricao: "Descartar e voltar ao menu" },
    ]}]
  );
}

async function handleConfirmacao(sessao, opcao) {
  if (opcao === "2" || opcao === "cancelar") {
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    fotosTemp.delete(sessao.telefone);
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, "↩️ Chamado cancelado.");
    await enviarMenu(sessao._remoteJid);
    return;
  }

  if (opcao !== "1" && opcao !== "confirmar" && opcao !== "sim" && opcao !== "s") {
    await enviarListaSelecao(sessao._remoteJid,
      "Selecione uma opção:",
      "Confirmar ou cancelar",
      [{ titulo: "Ação", opcoes: [
        { id: "1", titulo: "✅ Confirmar", descricao: "Abrir chamado" },
        { id: "2", titulo: "❌ Cancelar", descricao: "Descartar" },
      ]}]
    );
    return;
  }

  await enviarMensagem(sessao._remoteJid, "⏳ Criando chamado, aguarde...");

  try {
    const resultado = await criarTicketUsuario(
      process.env.JITBIT_USER,
      process.env.JITBIT_PASS,
      sessao.dadosParciais.assunto,
      `${sessao.dadosParciais.descricao}\n\n${sessao.dadosParciais.sistema ? `Sistema: ${sessao.dadosParciais.sistema}\n` : ""}_Chamado aberto via WhatsApp por ${sessao.nome} (${sessao.telefone})_`,
      sessao.dadosParciais.categoriaId || 0
    );

    const ticketId = resultado.ticketId || resultado.id;

    // Anexar foto se houver
    if (sessao.dadosParciais.temFoto) {
      const foto = fotosTemp.get(sessao.telefone);
      if (foto?.buffer) {
        try {
          await anexarArquivo(ticketId, foto.filename, foto.buffer, foto.mimeType);
        } catch (err) {
          console.error("⚠️  [WhatsApp] Erro ao anexar foto ao ticket:", err.message);
        }
        fotosTemp.delete(sessao.telefone);
      }
    }

    sessao.ultimoTicketId = ticketId;
    sessao.pesquisaEnviada = false;
    sessao.estado = "menu";
    const assuntoFinal = sessao.dadosParciais.assunto;
    sessao.dadosParciais = { ticketId, assuntoFinal };
    sessao.markModified("dadosParciais");
    await salvarSessao(sessao);

    salvarHistorico({
      mensagem: `[WHATSAPP] ${assuntoFinal} — ${sessao.telefone}`,
      origem: "helpdesk-widget",
      resposta: `Ticket #${ticketId} criado via WhatsApp`
    });

    await enviarMensagem(sessao._remoteJid,
      `✅ *Chamado aberto com sucesso!*\n\n` +
      `🎫 Número: *#${ticketId}*\n` +
      `📌 Assunto: ${assuntoFinal}\n` +
      `📊 Status: Aguardando atendimento\n\n` +
      `Você receberá atualizações aqui mesmo.\n` +
      `🔗 Acompanhe: https://desk.axiontecnologia.com.br/Ticket/${ticketId}`
    );

    // Pesquisa de satisfação será enviada quando o ticket for fechado no helpdesk
    // (monitorado pelo cron ticketClosedPoller)
    await enviarMenu(sessao._remoteJid);
  } catch (err) {
    salvarErroWhatsApp({ telefone: sessao.telefone, estado: "confirmando_ticket", erro: err.message, contexto: { assunto: sessao.dadosParciais?.assunto, categoriaId: sessao.dadosParciais?.categoriaId } });
    sessao.estado = "menu";
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid,
      `❌ Erro ao abrir chamado: ${err.message === "AUTH_FAILED" ? "Credenciais inválidas no sistema." : err.message}\n\nDigite *menu* para tentar novamente.`
    );
  }
}

async function handleConsultaNumero(sessao, texto) {
  const numero = parseInt(texto.replace(/\D/g, ""));
  if (!numero) {
    await enviarMensagem(sessao._remoteJid, "Por favor, envie apenas o número do chamado (ex: 98765).");
    return;
  }

  await enviarMensagem(sessao._remoteJid, `🔍 Buscando chamado #${numero}...`);

  try {
    const ticket = await buscarTicket(numero);
    const comentarios = await buscarComentarios(numero);
    const ultimoComentario = comentarios?.length
      ? `\n\n💬 *Último comentário:*\n${comentarios[comentarios.length - 1]?.Body?.replace(/<[^>]+>/g, "").substring(0, 200) || "-"}`
      : "";

    sessao.estado = "menu";
    await salvarSessao(sessao);

    await enviarMensagem(sessao._remoteJid,
      `📋 *Chamado #${numero}*\n\n` +
      `*Assunto:* ${ticket.Subject || "-"}\n` +
      `*Status:* ${ticket.StatusName || ticket.Status || "-"}\n` +
      `*Prioridade:* ${ticket.PriorityName || "-"}\n` +
      `*Técnico:* ${ticket.TechFirstName ? `${ticket.TechFirstName} ${ticket.TechLastName || ""}`.trim() : "Não atribuído"}\n` +
      `*Aberto em:* ${ticket.Date ? new Date(ticket.Date).toLocaleDateString("pt-BR") : "-"}` +
      ultimoComentario
    );
    await enviarMenu(sessao._remoteJid);
  } catch (err) {
    sessao.estado = "menu";
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, `❌ Chamado #${numero} não encontrado ou você não tem acesso.`);
    await enviarMenu(sessao._remoteJid);
  }
}

async function handleRespondendoNumero(sessao, texto) {
  const numero = parseInt(texto.replace(/\D/g, ""));
  if (!numero) {
    await enviarMensagem(sessao._remoteJid, "Por favor, envie apenas o número do chamado (ex: 98765).");
    return;
  }
  sessao.dadosParciais.ticketId = numero;
  sessao.estado = "respondendo_mensagem";
  await salvarSessao(sessao);
  await enviarMensagem(sessao._remoteJid, `💬 Chamado *#${numero}*\n\nDigite a mensagem que deseja enviar ao técnico:\n_(Você também pode enviar uma foto)_`);
}

async function handleRespondendoMensagem(sessao, texto, midia = null) {
  if ((!texto || texto.length < 3) && !midia) {
    await enviarMensagem(sessao._remoteJid, "Mensagem muito curta. Digite uma resposta mais detalhada ou envie uma imagem.");
    return;
  }

  const ticketId = sessao.dadosParciais.ticketId;
  await enviarMensagem(sessao._remoteJid, "⏳ Enviando resposta...");

  try {
    const { responderTicket } = await import("./jitbit.js");
    const corpoTexto = texto
      ? `${texto}\n\n_Enviado via WhatsApp por ${sessao.nome} (${sessao.telefone})_`
      : `_Imagem enviada via WhatsApp por ${sessao.nome} (${sessao.telefone})_`;

    await responderTicket(ticketId, corpoTexto);

    // Anexar foto se enviada junto com a resposta
    if (midia?.buffer) {
      try {
        await anexarArquivo(ticketId, midia.filename, midia.buffer, midia.mimeType);
      } catch (err) {
        console.error("⚠️  [WhatsApp] Erro ao anexar foto na resposta:", err.message);
      }
    }

    sessao.estado = "menu";
    sessao.dadosParciais = {};
    await salvarSessao(sessao);

    await enviarMensagem(sessao._remoteJid,
      `✅ Resposta enviada com sucesso ao chamado *#${ticketId}*!`
    );
    await enviarMenu(sessao._remoteJid);
  } catch (err) {
    sessao.estado = "menu";
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, `❌ Erro ao enviar resposta: ${err.message}\n\nDigite *menu* para tentar novamente.`);
  }
}

// --------------------------------------------------------------------------
// HANDLERS — DÚVIDAS DO SISTEMA
// --------------------------------------------------------------------------

const MODULOS_DUVIDA = { "1": "axhub", "2": "axton", "3": "axcross", "0": null };
const MODULOS_NOME = { "axhub": "AxHub", "axton": "AxTon", "axcross": "AxCross" };

async function handleModuloDuvida(sessao, opcao) {
  if (!MODULOS_DUVIDA.hasOwnProperty(opcao)) {
    // Usuário digitou a pergunta diretamente em vez de escolher o módulo
    // → trata como se tivesse escolhido "qualquer" e já faz a busca
    const contexto = classificarMensagem(opcao);
    if (contexto) {
    await enviarMensagem(sessao._remoteJid, `💡 *${contexto.assunto}*\n\n${contexto.acao}`);
    await enviarListaSelecao(sessao._remoteJid,
      `Esta resposta ajudou?`,
      "Responder",
      [{ titulo: "Feedback", opcoes: [
        { id: "1", titulo: "Sim, ajudou!" },
        { id: "2", titulo: "Não, abrir chamado" },
        { id: "3", titulo: "Tenho outra dúvida" },
      ]}]
    );
      sessao.dadosParciais.moduloDuvida = null;
      sessao.dadosParciais.ultimaDuvida = opcao;
      sessao.dadosParciais.ultimaResposta = contexto.acao.substring(0, 500);
      sessao.markModified("dadosParciais");
      sessao.estado = "respondendo_duvida";
      await salvarSessao(sessao);
      return;
    }
    await enviarListaSelecao(sessao._remoteJid, "Selecione o sistema:", "Ver sistemas",
      [{ titulo: "Sistemas", opcoes: [
        { id: "1", titulo: "AxHub", descricao: "Trânsito" },
        { id: "2", titulo: "AxTon", descricao: "Pesagem" },
        { id: "3", titulo: "AxCross", descricao: "Cruzamentos" },
        { id: "0", titulo: "Qualquer / Não sei" },
      ]}]
    );
    return;
  }
  sessao.dadosParciais.moduloDuvida = MODULOS_DUVIDA[opcao];
  sessao.markModified("dadosParciais");
  sessao.estado = "aguardando_duvida";
  await salvarSessao(sessao);

  const moduloNome = MODULOS_NOME[MODULOS_DUVIDA[opcao]] || "todos os sistemas";
  await enviarMensagem(sessao._remoteJid,
    `💬 *Dúvida — ${moduloNome}*\n\nDigite sua dúvida ou problema:\n_(ex: como cadastrar usuário, como gerar relatório...)_\n\nDigite *0* para voltar ao menu.`);
}

async function handleDuvida(sessao, texto) {
  if (!texto || texto.trim().length < 5) {
    await enviarMensagem(sessao._remoteJid, "Por favor, descreva sua dúvida com mais detalhes.");
    return;
  }
  if (texto.trim() === "0") {
    sessao.estado = "menu";
    await salvarSessao(sessao);
    await enviarMenu(sessao._remoteJid);
    return;
  }

  await enviarMensagem(sessao._remoteJid, "🔍 Buscando resposta...");

  const modulo = sessao.dadosParciais.moduloDuvida;
  const pergunta = modulo ? `[${modulo.toUpperCase()}] ${texto}` : texto;

  try {
    const resultado = await gerarRespostaWA(pergunta);
    const resposta = resultado.resposta ||
      "Não encontrei uma resposta específica sobre isso na base de conhecimento. " +
      "Recomendo abrir um chamado para que nossa equipe possa te ajudar.";

    sessao.dadosParciais.ultimaDuvida = texto;
    sessao.dadosParciais.ultimaResposta = resposta.substring(0, 500);
    sessao.markModified("dadosParciais");
    sessao.estado = "respondendo_duvida";
    await salvarSessao(sessao);

    const moduloNome = MODULOS_NOME[modulo] || "Sistema";
    const origemTag = resultado.origem === "kb" ? "📚 Base de conhecimento" :
                      resultado.origem === "embedding" ? "🔎 Busca semântica" : "🤖 IA";

    await enviarMensagem(sessao._remoteJid, `💡 *${moduloNome}* — ${origemTag}\n\n${resposta}`);
    await enviarListaSelecao(sessao._remoteJid,
      `Esta resposta ajudou?`,
      "Responder",
      [{ titulo: "Feedback", opcoes: [
        { id: "1", titulo: "Sim, obrigado!" },
        { id: "2", titulo: "Não, abrir chamado" },
        { id: "3", titulo: "Tenho outra dúvida" },
      ]}]
    );

  } catch (err) {
    sessao.estado = "menu";
    await salvarSessao(sessao);
    await enviarListaSelecao(sessao._remoteJid,
      `⚠️ Não consegui buscar uma resposta agora. Deseja abrir um chamado?`,
      "Selecionar",
      [{ titulo: "Opções", opcoes: [
        { id: "1", titulo: "Sim, abrir chamado" },
        { id: "0", titulo: "Voltar ao menu" },
      ]}]
    );
  }
}

async function handleRespostaDuvida(sessao, opcao, textoCompleto) {
  if (opcao === "1") {
    // Satisfeito
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, `✅ Que bom que ajudou! 😊`);
    await enviarMenu(sessao._remoteJid);

  } else if (opcao === "2") {
    // Abrir chamado com a dúvida como contexto
    const duvida = sessao.dadosParciais.ultimaDuvida || "Dúvida via WhatsApp";
    sessao.estado = "aguardando_descricao";
    sessao.dadosParciais = {
      assunto: `Dúvida: ${duvida.substring(0, 80)}`,
    };
    sessao.markModified("dadosParciais");
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid,
      `📝 Vamos abrir um chamado.\n\nAssunto já preenchido: *${sessao.dadosParciais.assunto}*\n\nForneça mais detalhes sobre o problema:\n_(Quanto mais detalhes, mais rápido o atendimento)_`);

  } else if (opcao === "3") {
    // Nova dúvida — volta para aguardando_duvida
    sessao.estado = "aguardando_duvida";
    await salvarSessao(sessao);
    const moduloNome = MODULOS_NOME[sessao.dadosParciais.moduloDuvida] || "Sistema";
    await enviarMensagem(sessao._remoteJid, `💬 *${moduloNome}* — Digite sua próxima dúvida:\n\nOu *0* para voltar ao menu.`);

  } else {
    await enviarListaSelecao(sessao._remoteJid,
      "Selecione uma opção:",
      "Responder",
      [{ titulo: "Feedback", opcoes: [
        { id: "1", titulo: "Sim, ajudou!" },
        { id: "2", titulo: "Abrir chamado" },
        { id: "3", titulo: "Outra dúvida" },
      ]}]
    );
  }
}

// --------------------------------------------------------------------------
// HANDLERS — PESQUISA DE SATISFAÇÃO
// --------------------------------------------------------------------------

// Caminho da imagem de pesquisa de satisfação
import { fileURLToPath as __futp } from "url";
import { dirname as __dn, resolve as __rslv } from "path";
const __pesquisaDir = __dn(__futp(import.meta.url));
const PESQUISA_IMG_PATH = __rslv(__pesquisaDir, "..", "uploads", "pesquisa-satisfacao-axion.png");

const PESQUISA_PERGUNTAS = [
  {
    id: "nota_atendimento",
    texto: `Seu atendimento foi concluído e registrado com sucesso! 🕗\n\n` +
      `Avalie nosso atendimento e caso seja necessário entre em contato novamente, será um prazer atender você! 🤩\n\n` +
      `🎯 *Participe da nossa pesquisa de satisfação*\n\n` +
      `Digite a nota de atendimento:\n\n` +
      `*5* — 😄 Meu problema foi resolvido e o atendimento foi excelente.\n` +
      `*4* — ☺️ Minha solicitação foi atendida e o atendimento foi bom.\n` +
      `*3* — 😐 Bom atendimento, mas poderia melhorar.\n` +
      `*2* — 😕 Demorou muito para atender e o atendimento foi ruim.\n` +
      `*1* — 😟 Péssimo atendimento. Não atendeu minha solicitação.\n\n` +
      `_Digite *0* para pular a avaliação._`,
    tipo: "nota" // aceita 1-5 ou 0 para pular
  },
  {
    id: "comentario",
    texto: `💬 Gostaria de deixar algum comentário ou sugestão para melhorarmos?\n\n_Digite *0* ou *pular* para finalizar sem comentário._`,
    tipo: "texto" // aceita qualquer texto
  }
];

/**
 * Inicia a pesquisa de satisfação — envia imagem + primeira pergunta.
 */
export async function iniciarPesquisaSatisfacao(jid) {
  // Tentar enviar imagem de pesquisa
  try {
    const fs = await import("fs/promises");
    const imgBuffer = await fs.readFile(PESQUISA_IMG_PATH);
    await enviarImagem(jid, imgBuffer, "A SUA OPINIÃO É FUNDAMENTAL — Axion Tecnologia", "image/png");
  } catch (err) {
    // Imagem não disponível — seguir sem ela
    console.log(`⚠️  [Pesquisa] Imagem não encontrada: ${err.message}`);
  }

  // Enviar primeira pergunta (nota)
  await enviarMensagem(jid, PESQUISA_PERGUNTAS[0].texto);
}

/**
 * Handler: recebe a nota (1–5) ou 0 para pular.
 */
async function handleAvaliacaoNota(sessao, opcao) {
  const jid = sessao._remoteJid;

  // Pular avaliação
  if (opcao === "0" || opcao === "pular") {
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    await salvarSessao(sessao);
    await enviarMensagem(jid, `✅ Obrigado! O seu atendimento foi finalizado com sucesso.`);
    await enviarMenu(jid);
    return;
  }

  const nota = parseInt(opcao);
  if (isNaN(nota) || nota < 1 || nota > 5) {
    await enviarMensagem(jid, `Por favor, digite uma nota de *1* a *5*, ou *0* para pular.`);
    return;
  }

  // Salvar nota e avançar para comentário
  sessao.dadosParciais.avaliacao_nota = nota;
  sessao.estado = "avaliacao_comentario";
  sessao.markModified("dadosParciais");
  await salvarSessao(sessao);

  const emojis = { 5: "😄", 4: "☺️", 3: "😐", 2: "😕", 1: "😟" };
  await enviarMensagem(jid, `${emojis[nota]} Nota *${nota}* registrada!\n\n${PESQUISA_PERGUNTAS[1].texto}`);
}

/**
 * Handler: recebe o comentário opcional ou 0 para pular.
 */
async function handleAvaliacaoComentario(sessao, texto) {
  const jid = sessao._remoteJid;
  const t = (texto || "").trim().toLowerCase();

  const comentario = (t === "0" || t === "pular") ? null : texto.trim();

  // Salvar resultado final
  sessao.dadosParciais.avaliacao_comentario = comentario;
  sessao.markModified("dadosParciais");

  // Registrar avaliação no histórico
  const nota = sessao.dadosParciais.avaliacao_nota;
  const ticketId = sessao.dadosParciais.ticketId || sessao.ultimoTicketId;

  salvarHistorico({
    mensagem: `[PESQUISA] Ticket #${ticketId} — Nota ${nota}/5${comentario ? ` — "${comentario}"` : ""}`,
    origem: "pesquisa-satisfacao",
    resposta: `Avaliação registrada: ${nota}/5 | Tel: ${sessao.telefone} | ${sessao.nome}`
  });

  // Finalizar
  sessao.estado = "menu";
  sessao.dadosParciais = {};
  await salvarSessao(sessao);

  await enviarMensagem(jid,
    `✅ *Obrigado pela avaliação!*\n\n` +
    `O seu atendimento foi finalizado com sucesso.\n` +
    `Caso precise de algo mais, é só nos chamar! 😊`
  );
  await enviarMenu(jid);
}

