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
import { enviarMensagem } from "./services/whatsapp.service.js";
import { criarTicketUsuario, buscarTicket, buscarComentarios, buscarCategorias, anexarArquivo, atribuirTecnico, listarUsuarios } from "./jitbit.js";
import { gerarResposta, gerarRespostaWA } from "./engine.js";
import { classificarMensagem } from "./classifier.js";
import { salvarHistorico } from "./logger.js";

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

const MENU = `Olá! Sou o assistente da *Axion Tecnologia* 🤖

Como posso ajudar?

*1* — Abrir novo chamado
*2* — Consultar chamado
*3* — Responder chamado
*4* — Dúvidas do Sistema
*0* — Falar com atendente`;

const MENU_OPCOES = ["1", "2", "3", "4", "0"];

// --------------------------------------------------------------------------

async function obterOuCriarSessao(telefone, nome, remoteJid) {
  let sessao = await WhatsAppSessao.findOne({ telefone });
  if (!sessao) {
    sessao = await WhatsAppSessao.create({ telefone, nome, estado: "inicio" });
  } else {
    sessao.nome = nome || sessao.nome;
    sessao.ultimaMensagem = new Date();
    sessao.ativo = true;
  }
  // JID completo para responder (não persiste no Mongo)
  sessao._remoteJid = remoteJid || `${telefone}@s.whatsapp.net`;
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
  const sessao = await obterOuCriarSessao(telefone, nome, remoteJid || `${telefone}@s.whatsapp.net`);
  const jid = sessao._remoteJid;
  const t = (texto || "").trim().toLowerCase();

  // Comandos globais
  if (t === "menu" || t === "inicio" || t === "oi" || t === "olá" || t === "ola") {
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    fotosTemp.delete(telefone);
    await salvarSessao(sessao);
    await enviarMensagem(jid, MENU);
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
    default:
      sessao.estado = "menu";
      await salvarSessao(sessao);
      await enviarMensagem(jid, MENU);
  }
}

// --------------------------------------------------------------------------
// HANDLERS
// --------------------------------------------------------------------------

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
    await enviarMensagem(sessao._remoteJid, "📝 *Novo Chamado*\n\nQual é o assunto do chamado?\n_(ex: Erro no relatório de passagens)_");

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
    await enviarMensagem(sessao._remoteJid,
      `🔎 *Dúvidas do Sistema*\n\nQual sistema você tem dúvida?\n\n*1* — AxHub (Trânsito)\n*2* — AxTon (Pesagem)\n*3* — AxCross (Cruzamentos)\n*0* — Qualquer / Não sei`);

  } else if (opcao === "0") {
    sessao.estado = "menu";
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, "👤 Um atendente será notificado em breve. Você também pode acessar diretamente:\nhttps://desk.axiontecnologia.com.br\n\nDigite *menu* a qualquer momento para voltar.");
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
  const lista = SISTEMAS.map((s, i) => `*${i + 1}* — ${s}`).join("\n");
  await enviarMensagem(sessao._remoteJid,
    `✅ Assunto registrado: *${texto}*\n\n🖥️ *Selecione o sistema relacionado:*\n\n${lista}\n\n*0* — Não se aplica / Pular`);
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
  let listaCats = "0 — Geral (padrão)";
  try {
    const cats = await obterCategorias();
    if (cats?.length) {
      listaCats = cats.map((c, i) => `*${i + 1}* — ${c.Name}`).join("\n");
      // Salva mapa índice→id no cache de sessão (não no mongo)
      sessao._catsCache = cats;
    }
  } catch (_) { /* usar padrão */ }

  await enviarMensagem(sessao._remoteJid,
    `📂 *Selecione a categoria do chamado:*\n\n${listaCats}\n\n*0* — Pular (Geral)`);
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
    sugestaoIA +
    `\n\n*1* — Confirmar e abrir chamado\n*2* — Cancelar`
  );
}

async function handleConfirmacao(sessao, opcao) {
  if (opcao === "2" || opcao === "cancelar") {
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    fotosTemp.delete(sessao.telefone);
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, "❌ Chamado cancelado.\n\nDigite *menu* para voltar ao início.");
    return;
  }

  if (opcao !== "1" && opcao !== "confirmar" && opcao !== "sim" && opcao !== "s") {
    await enviarMensagem(sessao._remoteJid, "Digite *1* para confirmar ou *2* para cancelar.");
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
    sessao.estado = "menu";
    const assuntoFinal = sessao.dadosParciais.assunto;
    sessao.dadosParciais = {};
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
      `Acesse também: https://desk.axiontecnologia.com.br\n\n` +
      `Digite *menu* para voltar ao início.`
    );
  } catch (err) {
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
      ultimoComentario +
      `\n\nDigite *menu* para voltar ao início.`
    );
  } catch (err) {
    sessao.estado = "menu";
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, `❌ Chamado #${numero} não encontrado ou você não tem acesso.\n\nDigite *menu* para voltar.`);
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
      `✅ Resposta enviada com sucesso ao chamado *#${ticketId}*!\n\nDigite *menu* para voltar ao início.`
    );
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
      await enviarMensagem(sessao._remoteJid,
        `💡 *${contexto.assunto}*\n\n${contexto.acao}\n\n` +
        `Esta resposta ajudou?\n*1* — Sim!\n*2* — Não, quero abrir um chamado\n*3* — Tenho outra dúvida`);
      sessao.dadosParciais.moduloDuvida = null;
      sessao.dadosParciais.ultimaDuvida = opcao;
      sessao.dadosParciais.ultimaResposta = contexto.acao.substring(0, 500);
      sessao.markModified("dadosParciais");
      sessao.estado = "respondendo_duvida";
      await salvarSessao(sessao);
      return;
    }
    await enviarMensagem(sessao._remoteJid, "Digite *1* AxHub, *2* AxTon, *3* AxCross ou *0* para qualquer.");
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
    await enviarMensagem(sessao._remoteJid, MENU);
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

    await enviarMensagem(sessao._remoteJid,
      `💡 *${moduloNome}* — ${origemTag}\n\n${resposta}\n\n` +
      `Esta resposta ajudou?\n*1* — Sim, obrigado!\n*2* — Não, quero abrir um chamado\n*3* — Tenho outra dúvida`);

  } catch (err) {
    sessao.estado = "menu";
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid,
      `⚠️ Não consegui buscar uma resposta agora. Deseja abrir um chamado para o suporte?\n\n*1* — Sim, abrir chamado\n*0* — Voltar ao menu`);
  }
}

async function handleRespostaDuvida(sessao, opcao, textoCompleto) {
  if (opcao === "1") {
    // Satisfeito
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    await salvarSessao(sessao);
    await enviarMensagem(sessao._remoteJid, `✅ Que bom que ajudou! 😊\n\nDigite *menu* para voltar ao início ou faça outra pergunta a qualquer momento.`);

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
    await enviarMensagem(sessao._remoteJid, "Digite *1* (ajudou), *2* (abrir chamado) ou *3* (nova dúvida).");
  }
}

