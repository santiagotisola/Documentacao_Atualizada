import { WhatsAppSessao } from "./models/sessao.model.js";
import { enviarMensagem } from "./connection.js";
import { gerarResposta } from "../ia-engine/engine.js";

/**
 * MÁQUINA DE ESTADOS — Processa cada mensagem de acordo com o estado atual
 * 
 * Personalize os estados e menus abaixo para seu negócio.
 * Cada estado define: o que perguntar, onde guardar a resposta, e próximo estado.
 */

// ============================================
// CONFIGURAÇÃO DO MENU (PERSONALIZE AQUI)
// ============================================
const MENU_OPCOES = [
  { numero: 1, texto: "📋 Abrir chamado", estado: "aguardando_assunto" },
  { numero: 2, texto: "🔍 Consultar status", estado: "aguardando_numero_consulta" },
  { numero: 3, texto: "💬 Tirar dúvida (IA)", estado: "faq_ia" },
  { numero: 4, texto: "👤 Falar com atendente", estado: "transferir_humano" },
  { numero: 0, texto: "❌ Encerrar", estado: "encerrado" }
];

const CATEGORIAS = ["Sistema/Software", "Hardware", "Financeiro", "Comercial", "Outro"];

// ============================================
// TEMPLATES DE MENSAGEM (PERSONALIZE AQUI)
// ============================================
const MSGS = {
  boasVindas: (nome) => `Olá ${nome}! 👋\n\nSou o assistente virtual.\n\nPara te atender, preciso que aceite nossa política de privacidade (LGPD).\n\n📋 ${process.env.LGPD_POLITICA_URL || "https://empresa.com/privacidade"}\n\nVocê concorda com o tratamento dos seus dados?\n\n1️⃣ Sim, concordo\n2️⃣ Não concordo`,
  
  menu: () => {
    let txt = "📌 *Menu Principal*\n\nEscolha uma opção:\n\n";
    MENU_OPCOES.forEach(op => txt += `${op.numero}️⃣ ${op.texto}\n`);
    return txt;
  },
  
  pedirAssunto: () => "📝 Qual o *assunto* do seu chamado?\n(Ex: Sistema não abre, Erro na impressora, etc.)",
  pedirDescricao: () => "📄 Descreva o problema com mais detalhes:",
  pedirCategoria: () => {
    let txt = "📂 Selecione a *categoria*:\n\n";
    CATEGORIAS.forEach((c, i) => txt += `${i + 1}️⃣ ${c}\n`);
    return txt;
  },
  pedirFoto: () => "📸 Deseja anexar uma foto/evidência?\n\n1️⃣ Sim (envie a imagem)\n2️⃣ Não, prosseguir",
  
  confirmarTicket: (dados) => `📋 *Resumo do chamado:*\n\n*Assunto:* ${dados.assunto}\n*Descrição:* ${dados.descricao}\n*Categoria:* ${dados.categoria}\n\nConfirma a abertura?\n\n1️⃣ Sim, confirmar\n2️⃣ Não, cancelar`,
  
  ticketCriado: (id) => `✅ Chamado *#${id}* aberto com sucesso!\n\nVocê será notificado quando houver atualização.\n\nDigite *menu* para voltar ao início.`,
  
  lgpdRecusada: () => "Entendido. Sem o consentimento, não podemos prosseguir com o atendimento. Caso mude de ideia, envie uma mensagem a qualquer momento. 👋",
  
  encerrado: () => "Atendimento encerrado. Obrigado pelo contato! 👋\nEnvie uma mensagem a qualquer momento para iniciar novo atendimento.",
  
  transferindo: () => "🔄 Transferindo para um atendente humano. Aguarde, alguém da equipe entrará em contato em breve.",
  
  naoEntendi: () => "Não entendi sua resposta. Por favor, escolha uma das opções disponíveis."
};

// ============================================
// PROCESSADOR PRINCIPAL
// ============================================
export async function processarMensagem(telefone, nome, texto, { tipo, msg, remoteJid } = {}) {
  // Buscar ou criar sessão
  let sessao = await WhatsAppSessao.findOne({ telefone });
  
  if (!sessao) {
    sessao = await WhatsAppSessao.create({ telefone, nome, remoteJid, estado: "inicio" });
  }

  // Atualizar timestamp
  sessao.ultimaMensagem = new Date();
  if (remoteJid) sessao.remoteJid = remoteJid;

  // Comando universal: "menu" volta ao menu
  if (texto.toLowerCase().trim() === "menu" && sessao.lgpdAceito) {
    sessao.estado = "menu";
    sessao.dadosParciais = {};
    await sessao.save();
    await enviarMensagem(telefone, MSGS.menu());
    return;
  }

  // Roteamento por estado
  switch (sessao.estado) {
    case "inicio":
      await enviarMensagem(telefone, MSGS.boasVindas(nome));
      sessao.estado = "aguardando_lgpd";
      break;

    case "aguardando_lgpd":
      if (texto.trim() === "1") {
        sessao.lgpdAceito = true;
        sessao.estado = "menu";
        await enviarMensagem(telefone, "✅ Consentimento registrado!\n\n" + MSGS.menu());
      } else if (texto.trim() === "2") {
        sessao.estado = "encerrado";
        sessao.ativo = false;
        await enviarMensagem(telefone, MSGS.lgpdRecusada());
      } else {
        await enviarMensagem(telefone, MSGS.naoEntendi());
      }
      break;

    case "menu":
      const opcao = parseInt(texto.trim());
      const escolha = MENU_OPCOES.find(op => op.numero === opcao);
      
      if (escolha) {
        sessao.estado = escolha.estado;
        await executarEntradaEstado(telefone, sessao);
      } else {
        await enviarMensagem(telefone, MSGS.naoEntendi());
      }
      break;

    case "aguardando_assunto":
      if (texto.length < 3) {
        await enviarMensagem(telefone, "⚠️ O assunto precisa ter pelo menos 3 caracteres.");
        break;
      }
      sessao.dadosParciais = { ...sessao.dadosParciais, assunto: texto };
      sessao.estado = "aguardando_descricao";
      await enviarMensagem(telefone, MSGS.pedirDescricao());
      break;

    case "aguardando_descricao":
      if (texto.length < 5) {
        await enviarMensagem(telefone, "⚠️ A descrição precisa ter pelo menos 5 caracteres.");
        break;
      }
      sessao.dadosParciais = { ...sessao.dadosParciais, descricao: texto };
      sessao.estado = "aguardando_categoria";
      await enviarMensagem(telefone, MSGS.pedirCategoria());
      break;

    case "aguardando_categoria":
      const catIdx = parseInt(texto.trim()) - 1;
      if (catIdx >= 0 && catIdx < CATEGORIAS.length) {
        sessao.dadosParciais = { ...sessao.dadosParciais, categoria: CATEGORIAS[catIdx] };
        sessao.estado = "aguardando_foto";
        await enviarMensagem(telefone, MSGS.pedirFoto());
      } else {
        await enviarMensagem(telefone, MSGS.naoEntendi());
      }
      break;

    case "aguardando_foto":
      if (texto.trim() === "2" || texto.toLowerCase().includes("não") || texto.toLowerCase().includes("nao")) {
        sessao.estado = "confirmando_ticket";
        await enviarMensagem(telefone, MSGS.confirmarTicket(sessao.dadosParciais));
      } else if (tipo === "image") {
        sessao.dadosParciais = { ...sessao.dadosParciais, temFoto: true };
        sessao.estado = "confirmando_ticket";
        await enviarMensagem(telefone, "📸 Foto recebida!\n\n" + MSGS.confirmarTicket(sessao.dadosParciais));
      } else if (texto.trim() === "1") {
        await enviarMensagem(telefone, "📸 Envie a imagem agora:");
      } else {
        await enviarMensagem(telefone, MSGS.naoEntendi());
      }
      break;

    case "confirmando_ticket":
      if (texto.trim() === "1") {
        // Criar ticket via helpdesk
        const ticketId = await criarTicketViaHelpdesk(sessao);
        sessao.ultimoTicketId = ticketId;
        sessao.estado = "menu";
        sessao.dadosParciais = {};
        await enviarMensagem(telefone, MSGS.ticketCriado(ticketId));
      } else if (texto.trim() === "2") {
        sessao.estado = "menu";
        sessao.dadosParciais = {};
        await enviarMensagem(telefone, "❌ Chamado cancelado.\n\n" + MSGS.menu());
      } else {
        await enviarMensagem(telefone, MSGS.naoEntendi());
      }
      break;

    case "aguardando_numero_consulta":
      // Consultar ticket pelo número
      await enviarMensagem(telefone, `🔍 Buscando chamado #${texto.trim()}...\n\n(Integre com seu helpdesk no módulo 03)\n\nDigite *menu* para voltar.`);
      sessao.estado = "menu";
      break;

    case "faq_ia":
      // Modo FAQ — usa o motor IA
      const resultado = await gerarResposta(texto, { sessionId: `wa_${telefone}` });
      await enviarMensagem(telefone, resultado.resposta + "\n\n---\nDigite *menu* para voltar ao menu principal.");
      break;

    case "transferir_humano":
      await enviarMensagem(telefone, MSGS.transferindo());
      sessao.estado = "aguardando_humano";
      // TODO: Notificar equipe via Telegram/Slack
      break;

    case "encerrado":
      // Reiniciar atendimento
      sessao.estado = "inicio";
      await processarMensagem(telefone, nome, texto, { tipo, msg, remoteJid });
      return;

    default:
      sessao.estado = "menu";
      await enviarMensagem(telefone, MSGS.menu());
  }

  await sessao.save();
}

/**
 * Executa ação de entrada em um estado (mensagem inicial)
 */
async function executarEntradaEstado(telefone, sessao) {
  switch (sessao.estado) {
    case "aguardando_assunto":
      await enviarMensagem(telefone, MSGS.pedirAssunto());
      break;
    case "aguardando_numero_consulta":
      await enviarMensagem(telefone, "🔍 Informe o *número* do chamado:");
      break;
    case "faq_ia":
      await enviarMensagem(telefone, "💬 Modo FAQ ativado!\n\nPergunte o que quiser. Digite *menu* para voltar.");
      break;
    case "transferir_humano":
      await enviarMensagem(telefone, MSGS.transferindo());
      break;
    case "encerrado":
      await enviarMensagem(telefone, MSGS.encerrado());
      sessao.ativo = false;
      break;
  }
}

/**
 * Cria ticket no helpdesk (integração com módulo 03)
 */
async function criarTicketViaHelpdesk(sessao) {
  // Importa dinamicamente para evitar dependência circular
  try {
    const { criarTicket } = await import("../helpdesk/service.js");
    const ticket = await criarTicket({
      assunto: sessao.dadosParciais.assunto,
      descricao: sessao.dadosParciais.descricao,
      categoria: sessao.dadosParciais.categoria,
      criado_por_nome: sessao.nome,
      criado_por_telefone: sessao.telefone,
      origem: "whatsapp"
    });
    return ticket.numero || ticket.id || Date.now();
  } catch (err) {
    console.error("⚠️ Erro ao criar ticket:", err.message);
    // Fallback: retorna timestamp como ID temporário
    return Date.now();
  }
}
