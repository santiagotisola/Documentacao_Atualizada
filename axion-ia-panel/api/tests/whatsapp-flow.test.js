/**
 * 🧪 SUITE DE TESTES AUTOMATIZADOS - LGPD GATE
 * 
 * Arquivo: whatsapp-flow.test.js
 * Framework: Jest
 * Cobertura: Cenários críticos identificados no Code Review
 * 
 * Executar:
 *   npm test -- whatsapp-flow.test.js
 *   npm test -- --coverage
 */

import { jest } from "@jest/globals";
import { processarMensagemWA } from "../src/whatsapp-flow.js";
import { WhatsAppSessao } from "../src/models/whatsapp-sessao.model.js";
import * as whatsappService from "../src/services/whatsapp.service.js";
import * as jitbit from "../src/jitbit.js";
import * as engine from "../src/engine.js";

// === MOCKS ===
jest.mock("../src/models/whatsapp-sessao.model.js");
jest.mock("../src/services/whatsapp.service.js");
jest.mock("../src/jitbit.js");
jest.mock("../src/engine.js");
jest.mock("../src/logger.js");

describe("LGPD Gate - Testes Críticos", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // TC001: FLUXO COMPLETO DE ABERTURA DE TICKET
  // ============================================================================
  
  describe("TC001: Fluxo completo de abertura de ticket com sucesso", () => {
    
    it("deve criar sessão, aceitar LGPD e abrir ticket com todos os dados corretos", async () => {
      // ARRANGE
      const telefone = "5511999999999";
      const nome = "João Silva";
      const mockSessao = {
        telefone,
        nome,
        estado: "inicio",
        lgpdAceito: false,
        dadosParciais: {},
        save: jest.fn().mockResolvedValue(true),
        markModified: jest.fn(),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn()
        .mockResolvedValueOnce(null) // Primeira chamada: sessão não existe
        .mockResolvedValueOnce(mockSessao); // Demais chamadas: sessão existente

      WhatsAppSessao.create = jest.fn().mockResolvedValue(mockSessao);

      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);
      whatsappService.enviarMensagemComBotoes = jest.fn().mockResolvedValue(true);
      whatsappService.enviarMenu = jest.fn().mockResolvedValue(true);

      jitbit.criarTicketUsuario = jest.fn().mockResolvedValue({ 
        ticketId: 12345, 
        id: 12345 
      });
      jitbit.buscarCategorias = jest.fn().mockResolvedValue([
        { CategoryID: 1, Name: "Geral" },
        { CategoryID: 2, Name: "Suporte Técnico" }
      ]);

      engine.gerarResposta = jest.fn().mockResolvedValue({
        resposta: "Verifique se o relatório está configurado corretamente.",
        score: 0.75,
        origem: "kb"
      });

      // ACT - Passo 1: Primeira mensagem
      await processarMensagemWA(telefone, nome, "Olá", null, `${telefone}@s.whatsapp.net`);

      // ASSERT - Passo 1
      expect(WhatsAppSessao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          telefone,
          nome,
          estado: "inicio"
        })
      );
      expect(whatsappService.enviarMensagem).toHaveBeenCalledWith(
        `${telefone}@s.whatsapp.net`,
        expect.stringContaining("Lei Geral de Proteção de Dados")
      );
      expect(whatsappService.enviarMensagemComBotoes).toHaveBeenCalled();

      // ACT - Passo 2: Aceitar LGPD
      mockSessao.estado = "aguardando_lgpd";
      await processarMensagemWA(telefone, nome, "1", null, `${telefone}@s.whatsapp.net`);

      // ASSERT - Passo 2
      expect(mockSessao.lgpdAceito).toBe(true);
      expect(mockSessao.estado).toBe("menu");
      expect(whatsappService.enviarMensagem).toHaveBeenCalledWith(
        `${telefone}@s.whatsapp.net`,
        expect.stringContaining("consentimento foi registrado")
      );

      // ACT - Passo 3: Selecionar "abrir novo chamado"
      mockSessao.estado = "menu";
      await processarMensagemWA(telefone, nome, "1", null, `${telefone}@s.whatsapp.net`);

      // ASSERT - Passo 3
      expect(mockSessao.estado).toBe("aguardando_assunto");
      expect(whatsappService.enviarMensagem).toHaveBeenCalledWith(
        `${telefone}@s.whatsapp.net`,
        expect.stringContaining("Qual é o assunto do chamado?")
      );

      // ACT - Passo 4: Fornecer assunto
      mockSessao.estado = "aguardando_assunto";
      await processarMensagemWA(telefone, nome, "Erro no relatório de passagens", null, `${telefone}@s.whatsapp.net`);

      // ASSERT - Passo 4
      expect(mockSessao.dadosParciais.assunto).toBe("Erro no relatório de passagens");
      expect(mockSessao.estado).toBe("aguardando_sistema");

      // ACT - Passo 5: Selecionar sistema (AxHub = opção 4)
      mockSessao.estado = "aguardando_sistema";
      await processarMensagemWA(telefone, nome, "4", null, `${telefone}@s.whatsapp.net`);

      // ASSERT - Passo 5
      expect(mockSessao.dadosParciais.sistema).toBe("AxHub");
      expect(mockSessao.estado).toBe("aguardando_descricao");

      // ACT - Passo 6: Fornecer descrição
      mockSessao.estado = "aguardando_descricao";
      const descricao = "Quando tento gerar o relatório mensal de passagens, o sistema retorna erro 500. Isso começou hoje às 14h.";
      await processarMensagemWA(telefone, nome, descricao, null, `${telefone}@s.whatsapp.net`);

      // ASSERT - Passo 6
      expect(mockSessao.dadosParciais.descricao).toBe(descricao);
      expect(mockSessao.estado).toBe("aguardando_categoria");

      // ACT - Passo 7: Selecionar categoria
      mockSessao.estado = "aguardando_categoria";
      await processarMensagemWA(telefone, nome, "2", null, `${telefone}@s.whatsapp.net`);

      // ASSERT - Passo 7
      expect(mockSessao.dadosParciais.categoriaId).toBe(2);
      expect(mockSessao.dadosParciais.categoriaNome).toBe("Suporte Técnico");
      expect(mockSessao.estado).toBe("aguardando_foto");

      // ACT - Passo 8: Pular foto
      mockSessao.estado = "aguardando_foto";
      await processarMensagemWA(telefone, nome, "0", null, `${telefone}@s.whatsapp.net`);

      // ASSERT - Passo 8
      expect(mockSessao.estado).toBe("confirmando_ticket");
      expect(whatsappService.enviarMensagem).toHaveBeenCalledWith(
        `${telefone}@s.whatsapp.net`,
        expect.stringContaining("Confirme os dados do chamado")
      );

      // ACT - Passo 9: Confirmar criação
      mockSessao.estado = "confirmando_ticket";
      mockSessao.dadosParciais = {
        assunto: "Erro no relatório de passagens",
        sistema: "AxHub",
        descricao,
        categoriaId: 2,
        categoriaNome: "Suporte Técnico",
        temFoto: false
      };
      await processarMensagemWA(telefone, nome, "1", null, `${telefone}@s.whatsapp.net`);

      // ASSERT - Passo 9
      expect(jitbit.criarTicketUsuario).toHaveBeenCalledWith(
        expect.any(String), // user
        expect.any(String), // pass
        "Erro no relatório de passagens",
        expect.stringContaining(descricao),
        2
      );
      expect(mockSessao.estado).toBe("menu");
      expect(mockSessao.ultimoTicketId).toBe(12345);
      expect(whatsappService.enviarMensagem).toHaveBeenCalledWith(
        `${telefone}@s.whatsapp.net`,
        expect.stringContaining("Chamado aberto com sucesso")
      );
      expect(whatsappService.enviarMensagem).toHaveBeenCalledWith(
        `${telefone}@s.whatsapp.net`,
        expect.stringContaining("#12345")
      );
    });
  });

  // ============================================================================
  // TC014: LGPD BYPASS VIA APROVAÇÃO DE COMPRAS (BUG CRÍTICO)
  // ============================================================================

  describe("TC014: LGPD Bypass via aprovação de compras", () => {
    
    it("NÃO deve processar aprovação sem consentimento LGPD (BUG)", async () => {
      // ARRANGE
      const telefone = "5511888888888";
      const mockSessao = {
        telefone,
        nome: "Maria Aprovadora",
        estado: "inicio",
        lgpdAceito: false, // ← SEM CONSENTIMENTO
        dadosParciais: {
          _pedidoAprovacao: { pedidoId: "P001" } // Vinculação existe
        },
        save: jest.fn().mockResolvedValue(true),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);

      // ACT
      await processarMensagemWA(telefone, "Maria Aprovadora", "APROVAR", null, `${telefone}@s.whatsapp.net`);

      // ASSERT
      // BUG ATUAL: aprovação processada SEM LGPD
      // ESPERADO APÓS CORREÇÃO: apresentar termo LGPD
      expect(whatsappService.enviarMensagem).toHaveBeenCalledWith(
        `${telefone}@s.whatsapp.net`,
        expect.stringContaining("Lei Geral de Proteção de Dados")
      );
      expect(mockSessao.lgpdAceito).toBe(false);
    });

    it("deve processar aprovação APÓS aceitar LGPD", async () => {
      // ARRANGE
      const telefone = "5511888888888";
      const mockSessao = {
        telefone,
        nome: "Maria Aprovadora",
        estado: "menu",
        lgpdAceito: true, // ← COM CONSENTIMENTO
        dadosParciais: {
          _pedidoAprovacao: { pedidoId: "P001" }
        },
        save: jest.fn().mockResolvedValue(true),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);

      const tentarProcessarAprovacao = jest.fn().mockResolvedValue(true);
      jest.unstable_mockModule("../src/compras-flow.js", () => ({
        tentarProcessarAprovacao
      }));

      // ACT
      await processarMensagemWA(telefone, "Maria Aprovadora", "APROVAR", null, `${telefone}@s.whatsapp.net`);

      // ASSERT
      expect(tentarProcessarAprovacao).toHaveBeenCalledWith(
        telefone,
        "APROVAR",
        `${telefone}@s.whatsapp.net`
      );
    });
  });

  // ============================================================================
  // TC015: SQL/XSS INJECTION
  // ============================================================================

  describe("TC015: Sanitização de inputs maliciosos", () => {
    
    it("deve remover tags HTML/script do assunto", async () => {
      // ARRANGE
      const telefone = "5511777777777";
      const mockSessao = {
        telefone,
        nome: "<script>alert('XSS')</script>Atacante",
        estado: "aguardando_assunto",
        lgpdAceito: true,
        dadosParciais: {},
        save: jest.fn().mockResolvedValue(true),
        markModified: jest.fn(),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);
      whatsappService.enviarListaSelecao = jest.fn().mockResolvedValue(true);

      // ACT
      const assuntoMalicioso = "<script>alert('XSS')</script>Assunto";
      await processarMensagemWA(telefone, mockSessao.nome, assuntoMalicioso, null, `${telefone}@s.whatsapp.net`);

      // ASSERT
      // Após correção: deve sanitizar
      expect(mockSessao.dadosParciais.assunto).not.toContain("<script>");
      expect(mockSessao.dadosParciais.assunto).not.toContain("alert");
    });

    it("deve escapar caracteres SQL perigosos na descrição", async () => {
      // ARRANGE
      const telefone = "5511777777777";
      const mockSessao = {
        telefone,
        estado: "aguardando_descricao",
        lgpdAceito: true,
        dadosParciais: { assunto: "Teste", sistema: "AxHub" },
        save: jest.fn().mockResolvedValue(true),
        markModified: jest.fn(),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);
      whatsappService.enviarListaSelecao = jest.fn().mockResolvedValue(true);
      jitbit.buscarCategorias = jest.fn().mockResolvedValue([]);

      // ACT
      const descricaoSQL = "'; DROP TABLE Tickets; --";
      await processarMensagemWA(telefone, "Atacante", descricaoSQL, null, `${telefone}@s.whatsapp.net`);

      // ASSERT
      // Após correção: caracteres perigosos devem ser removidos/escapados
      expect(mockSessao.dadosParciais.descricao).not.toContain("DROP TABLE");
    });
  });

  // ============================================================================
  // TC016: VALIDAÇÃO DE UPLOAD DE ARQUIVO
  // ============================================================================

  describe("TC016: Validação de arquivo malicioso", () => {
    
    it("deve rejeitar arquivo executável (.exe)", async () => {
      // ARRANGE
      const telefone = "5511666666666";
      const mockSessao = {
        telefone,
        estado: "aguardando_foto",
        lgpdAceito: true,
        dadosParciais: { assunto: "Teste", sistema: "AxHub", descricao: "Teste" },
        save: jest.fn().mockResolvedValue(true),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);

      const midiaFake = {
        downloadOk: true,
        buffer: Buffer.from("MZ\x90\x00"), // Magic bytes de .exe
        mimeType: "application/x-msdownload",
        filename: "malware.exe"
      };

      // ACT
      await processarMensagemWA(telefone, "Atacante", "", midiaFake, `${telefone}@s.whatsapp.net`);

      // ASSERT
      expect(whatsappService.enviarMensagem).toHaveBeenCalledWith(
        `${telefone}@s.whatsapp.net`,
        expect.stringContaining("Tipo de arquivo não permitido")
      );
      expect(mockSessao.estado).toBe("aguardando_foto"); // Não avança
    });

    it("deve rejeitar imagem muito grande (>10MB)", async () => {
      // ARRANGE
      const telefone = "5511666666666";
      const mockSessao = {
        telefone,
        estado: "aguardando_foto",
        lgpdAceito: true,
        dadosParciais: { assunto: "Teste" },
        save: jest.fn().mockResolvedValue(true),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);

      const midiaGrande = {
        downloadOk: true,
        buffer: Buffer.alloc(50 * 1024 * 1024), // 50MB
        mimeType: "image/jpeg",
        filename: "gigante.jpg"
      };

      // ACT
      await processarMensagemWA(telefone, "Usuario", "", midiaGrande, `${telefone}@s.whatsapp.net`);

      // ASSERT
      expect(whatsappService.enviarMensagem).toHaveBeenCalledWith(
        `${telefone}@s.whatsapp.net`,
        expect.stringContaining("muito grande")
      );
    });

    it("deve aceitar JPEG válido de 2MB", async () => {
      // ARRANGE
      const telefone = "5511666666666";
      const mockSessao = {
        telefone,
        estado: "aguardando_foto",
        lgpdAceito: true,
        dadosParciais: { assunto: "Teste", sistema: "AxHub", descricao: "Teste desc", categoriaId: 1, categoriaNome: "Geral" },
        save: jest.fn().mockResolvedValue(true),
        markModified: jest.fn(),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);
      whatsappService.enviarListaSelecao = jest.fn().mockResolvedValue(true);
      engine.gerarResposta = jest.fn().mockResolvedValue({ resposta: "Teste", score: 0.5 });

      // Magic bytes JPEG: FF D8 FF E0
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, ...Array(2048000).fill(0x00)]);
      const midiaValida = {
        downloadOk: true,
        buffer: jpegBuffer,
        mimeType: "image/jpeg",
        filename: "foto-valida.jpg"
      };

      // ACT
      await processarMensagemWA(telefone, "Usuario", "", midiaValida, `${telefone}@s.whatsapp.net`);

      // ASSERT
      expect(mockSessao.dadosParciais.temFoto).toBe(true);
      expect(mockSessao.estado).toBe("confirmando_ticket");
    });
  });

  // ============================================================================
  // TC018: RATE LIMITING
  // ============================================================================

  describe("TC018: Rate limiting para prevenir DoS", () => {
    
    it("deve bloquear após 20 mensagens no mesmo minuto", async () => {
      // ARRANGE
      const telefone = "5511555555555";
      const mockSessao = {
        telefone,
        estado: "menu",
        lgpdAceito: true,
        dadosParciais: {},
        save: jest.fn().mockResolvedValue(true),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);

      // ACT - Enviar 25 mensagens rapidamente
      for (let i = 1; i <= 25; i++) {
        await processarMensagemWA(telefone, "Spammer", `Mensagem ${i}`, null, `${telefone}@s.whatsapp.net`);
      }

      // ASSERT
      // Após correção: mensagens 21-25 devem ser bloqueadas
      const ultimaChamada = whatsappService.enviarMensagem.mock.calls[
        whatsappService.enviarMensagem.mock.calls.length - 1
      ];
      expect(ultimaChamada[1]).toContain("Limite de mensagens atingido");
    });
  });

  // ============================================================================
  // TC019: TIMEOUT DE API EXTERNA
  // ============================================================================

  describe("TC019: Timeout em chamadas externas", () => {
    
    it("deve timeout após 10 segundos em criarTicketUsuario", async () => {
      // ARRANGE
      const telefone = "5511444444444";
      const mockSessao = {
        telefone,
        estado: "confirmando_ticket",
        lgpdAceito: true,
        dadosParciais: {
          assunto: "Teste",
          descricao: "Descrição teste",
          categoriaId: 1,
          temFoto: false
        },
        save: jest.fn().mockResolvedValue(true),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);

      // Simular timeout
      jitbit.criarTicketUsuario = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve({ ticketId: 12345 }), 15000); // 15s
        });
      });

      // ACT
      await processarMensagemWA(telefone, "Usuario", "1", null, `${telefone}@s.whatsapp.net`);

      // ASSERT
      // Após correção: deve timeout em 10s e exibir mensagem
      expect(whatsappService.enviarMensagem).toHaveBeenCalledWith(
        `${telefone}@s.whatsapp.net`,
        expect.stringContaining("sistema de chamados está lento")
      );
    }, 12000); // Timeout do teste: 12s
  });

  // ============================================================================
  // TC031: EDGE CASE - MENSAGEM COM EMOJIS
  // ============================================================================

  describe("TC031: Mensagem com emojis e unicode", () => {
    
    it("deve processar corretamente texto com emojis", async () => {
      // ARRANGE
      const telefone = "5511333333333";
      const mockSessao = {
        telefone,
        estado: "aguardando_assunto",
        lgpdAceito: true,
        dadosParciais: {},
        save: jest.fn().mockResolvedValue(true),
        markModified: jest.fn(),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);
      whatsappService.enviarListaSelecao = jest.fn().mockResolvedValue(true);

      // ACT
      const textoComEmoji = "Erro 💥 no sistema 🚗 (crítico!!!)";
      await processarMensagemWA(telefone, "Usuario", textoComEmoji, null, `${telefone}@s.whatsapp.net`);

      // ASSERT
      expect(mockSessao.dadosParciais.assunto).toBe(textoComEmoji);
      expect(mockSessao.estado).toBe("aguardando_sistema");
    });
  });

  // ============================================================================
  // TC079: LGPD - DADOS PESSOAIS NÃO DEVEM APARECER EM LOGS
  // ============================================================================

  describe("TC079: Compliance LGPD - Pseudonimização de logs", () => {
    
    it("não deve logar telefone completo, apenas pseudonimizado", async () => {
      // ARRANGE
      const telefone = "5511999887766";
      const consoleSpy = jest.spyOn(console, "log");

      const mockSessao = {
        telefone,
        nome: "João Silva",
        estado: "menu",
        lgpdAceito: true,
        dadosParciais: {},
        save: jest.fn().mockResolvedValue(true),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);

      // ACT
      await processarMensagemWA(telefone, "João Silva", "menu", null, `${telefone}@s.whatsapp.net`);

      // ASSERT
      const logsCalls = consoleSpy.mock.calls.map(call => call.join(" "));
      const contemTelefoneCompleto = logsCalls.some(log => log.includes("5511999887766"));

      // Após correção: telefone NÃO deve aparecer completo
      expect(contemTelefoneCompleto).toBe(false);

      // Deve aparecer pseudonimizado: "5511****abc123"
      const contemPseudonimo = logsCalls.some(log => /5511\*{4}[a-f0-9]{8}/.test(log));
      expect(contemPseudonimo).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  // ============================================================================
  // TC089: INTEGRAÇÃO - JITBIT 503 COM RETRY
  // ============================================================================

  describe("TC089: Retry automático em caso de 503", () => {
    
    it("deve tentar 3 vezes antes de falhar", async () => {
      // ARRANGE
      const telefone = "5511222222222";
      const mockSessao = {
        telefone,
        estado: "confirmando_ticket",
        lgpdAceito: true,
        dadosParciais: {
          assunto: "Teste",
          descricao: "Desc",
          categoriaId: 1
        },
        save: jest.fn().mockResolvedValue(true),
        _remoteJid: `${telefone}@s.whatsapp.net`
      };

      WhatsAppSessao.findOne = jest.fn().mockResolvedValue(mockSessao);
      whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);

      let tentativas = 0;
      jitbit.criarTicketUsuario = jest.fn().mockImplementation(() => {
        tentativas++;
        if (tentativas < 3) {
          const error = new Error("Service Unavailable");
          error.code = "ECONNRESET";
          throw error;
        }
        return Promise.resolve({ ticketId: 12345 });
      });

      // ACT
      await processarMensagemWA(telefone, "Usuario", "1", null, `${telefone}@s.whatsapp.net`);

      // ASSERT
      expect(jitbit.criarTicketUsuario).toHaveBeenCalledTimes(3);
      expect(whatsappService.enviarMensagem).toHaveBeenCalledWith(
        `${telefone}@s.whatsapp.net`,
        expect.stringContaining("Chamado aberto com sucesso")
      );
    });
  });
});

// ============================================================================
// TESTES DE PERFORMANCE
// ============================================================================

describe("Performance Tests", () => {
  
  it("deve processar 100 sessões concorrentes em <5s", async () => {
    // ARRANGE
    const usuarios = Array.from({ length: 100 }, (_, i) => ({
      telefone: `55119999${String(i).padStart(5, "0")}`,
      nome: `Usuario${i}`
    }));

    WhatsAppSessao.findOne = jest.fn().mockImplementation(({ telefone }) => {
      return Promise.resolve({
        telefone,
        estado: "menu",
        lgpdAceito: true,
        dadosParciais: {},
        save: jest.fn().mockResolvedValue(true),
        _remoteJid: `${telefone}@s.whatsapp.net`
      });
    });

    whatsappService.enviarMensagem = jest.fn().mockResolvedValue(true);

    const inicio = Date.now();

    // ACT
    await Promise.all(
      usuarios.map(u => 
        processarMensagemWA(u.telefone, u.nome, "menu", null, `${u.telefone}@s.whatsapp.net`)
      )
    );

    const duracao = Date.now() - inicio;

    // ASSERT
    expect(duracao).toBeLessThan(5000); // < 5 segundos
    expect(WhatsAppSessao.findOne).toHaveBeenCalledTimes(100);
  }, 10000); // Timeout: 10s
});

// ============================================================================
// HELPER FUNCTIONS PARA TESTES
// ============================================================================

/**
 * Criar sessão mock completa
 */
function criarSessaoMock(overrides = {}) {
  return {
    telefone: "5511999999999",
    nome: "Usuario Teste",
    estado: "menu",
    lgpdAceito: true,
    lgpdAceitoEm: new Date(),
    dadosParciais: {},
    ultimaMensagem: new Date(),
    ativo: true,
    _remoteJid: "5511999999999@s.whatsapp.net",
    save: jest.fn().mockResolvedValue(true),
    markModified: jest.fn(),
    ...overrides
  };
}

/**
 * Simular fluxo completo até determinado estado
 */
async function simularFluxoAte(estado, telefone = "5511999999999") {
  const sessao = criarSessaoMock({ telefone });
  WhatsAppSessao.findOne = jest.fn().mockResolvedValue(sessao);

  const passos = {
    "aguardando_lgpd": ["Olá"],
    "menu": ["Olá", "1"], // Aceitar LGPD
    "aguardando_assunto": ["Olá", "1", "1"], // + Abrir chamado
    "aguardando_sistema": ["Olá", "1", "1", "Teste assunto"],
    // ... adicionar mais conforme necessário
  };

  const comandos = passos[estado] || [];
  
  for (const cmd of comandos) {
    await processarMensagemWA(telefone, "Usuario", cmd, null, `${telefone}@s.whatsapp.net`);
  }

  return sessao;
}
