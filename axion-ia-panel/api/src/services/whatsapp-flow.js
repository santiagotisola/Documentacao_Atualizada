/**
 * WhatsApp Flow - Máquina de Estados
 * Gerencia o fluxo de conversação do bot
 */

export const ESTADOS = {
  MENU: 'MENU',
  ABRINDO_CHAMADO: 'ABRINDO_CHAMADO',
  AGUARDANDO_ASSUNTO: 'AGUARDANDO_ASSUNTO',
  AGUARDANDO_DESCRICAO: 'AGUARDANDO_DESCRICAO',
  CONSULTANDO: 'CONSULTANDO',
  RESPONDENDO: 'RESPONDENDO',
  FINALIZADO: 'FINALIZADO'
};

const MENU_TEXT = `
🤖 *Olá! Sou o assistente AxionIA*

Como posso ajudar?

1️⃣ Abrir novo chamado
2️⃣ Consultar chamado existente
3️⃣ Falar com atendente

Digite o número da opção desejada.
`;

export async function processarMensagem(telefone, mensagem, sessao, jitbitService) {
  const estado = sessao.estado || ESTADOS.MENU;
  
  switch (estado) {
    case ESTADOS.MENU:
      return await handleMenu(telefone, mensagem, sessao);
      
    case ESTADOS.AGUARDANDO_ASSUNTO:
      return await handleAssunto(telefone, mensagem, sessao);
      
    case ESTADOS.AGUARDANDO_DESCRICAO:
      return await handleDescricao(telefone, mensagem, sessao, jitbitService);
      
    case ESTADOS.CONSULTANDO:
      return await handleConsulta(telefone, mensagem, sessao, jitbitService);
      
    default:
      return { resposta: MENU_TEXT, proximoEstado: ESTADOS.MENU };
  }
}

async function handleMenu(telefone, mensagem, sessao) {
  const opcao = mensagem.trim();
  
  if (opcao === '1') {
    return {
      resposta: '📝 *Novo Chamado*\n\nPor favor, informe o *assunto* do chamado:',
      proximoEstado: ESTADOS.AGUARDANDO_ASSUNTO
    };
  }
  
  if (opcao === '2') {
    return {
      resposta: '🔍 *Consultar Chamado*\n\nInforme o *número do chamado* (ex: #12345):',
      proximoEstado: ESTADOS.CONSULTANDO
    };
  }
  
  if (opcao === '3') {
    return {
      resposta: '👤 *Atendente Humano*\n\nVocê será transferido para um atendente em breve.',
      proximoEstado: ESTADOS.FINALIZADO,
      notificarAtendente: true
    };
  }
  
  return { resposta: MENU_TEXT, proximoEstado: ESTADOS.MENU };
}

async function handleAssunto(telefone, mensagem, sessao) {
  return {
    resposta: '✍️ Assunto registrado!\n\nAgora, descreva o *problema* com detalhes:',
    proximoEstado: ESTADOS.AGUARDANDO_DESCRICAO,
    dadosParciais: { assunto: mensagem }
  };
}

async function handleDescricao(telefone, mensagem, sessao, jitbitService) {
  // Criar ticket no Jitbit
  const ticket = await jitbitService.criarTicket({
    subject: sessao.dadosParciais?.assunto || 'Chamado via WhatsApp',
    body: mensagem,
    categoryId: 1, // TODO: Classificar com IA
    priorityId: 2,
    tags: 'whatsapp'
  });
  
  return {
    resposta: `✅ *Chamado criado com sucesso!*\n\nNúmero: #${ticket.IssueID}\nStatus: ${ticket.Status}\n\nVocê receberá atualizações por aqui.`,
    proximoEstado: ESTADOS.FINALIZADO,
    ticketId: ticket.IssueID
  };
}

async function handleConsulta(telefone, mensagem, sessao, jitbitService) {
  const ticketId = mensagem.replace('#', '').trim();
  
  try {
    const ticket = await jitbitService.getTicket(ticketId);
    
    return {
      resposta: `📋 *Chamado #${ticket.IssueID}*\n\n*Assunto:* ${ticket.Subject}\n*Status:* ${ticket.Status}\n*Última atualização:* ${ticket.Updated}`,
      proximoEstado: ESTADOS.MENU
    };
  } catch (error) {
    return {
      resposta: '❌ Chamado não encontrado. Verifique o número e tente novamente.',
      proximoEstado: ESTADOS.MENU
    };
  }
}
