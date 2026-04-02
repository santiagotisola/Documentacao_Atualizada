/**
 * doc-generator.js
 * Motor especializado em gerar documentação Docusaurus para AxHub/AxTon/AxCross.
 * Conhece o catálogo de imagens de cada portal e o formato exato do manual de triagem.
 */

import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ============================================================
// CATÁLOGO DE IMAGENS DISPONÍVEIS POR PRODUTO
// ============================================================
const CATALOGO_IMAGENS = {
  axhub: [
    "Login.png",
    "Dasboard.png",
    "dashboard-alertas-afericao.png",
    "dashboard-icones-atalho.png",
    "dashboard-mapa-equipamento.png",
    "dashboard-painel-sinotico.png",
    "dashboard-status-equipamento.png",
    "dashboard-triagem-mensal.png",
    "dashboard-ultimos-eventos.png",
    "triagem-menu-principal.png",
    "triagem-consultar-infracoes.png",
    "triagem-filtro-auditoria.png",
    "triagem-consultar-resultado.png",
    "triagem-excecoes.png",
    "triagem-infracoes-descartadas.png",
    "triagem-exportacao.png",
    "triagem-auditoria.png",
    "triagem-tempo-analise.png",
    "Equipamentos.png",
    "Equipamentos - Lista.png",
    "Equipamentos - Cadastro.png",
    "Operações - Faixas.png",
    "Operações - Faixas - cadatro.png",
    "Operações - operações.png",
    "Operações - operações - cadastro.png",
    "Operações - aferição.png",
    "Operações - aferição - cadastro.png",
    "Operações - consulta de placas.png",
    "Operações - Monitoramento online.png",
    "Operações - Monitoramento online - cadastro.png",
    "Operações - eventos de equipamentos.png",
    "Relatorio - Relatorio de infrações.png",
    "Relatorio - Relatorio de passagens.png",
    "Relatorio - Relatorio de discrepancias.png",
    "Relatorio - Relatorio de procesamento de imagens por usuário.png",
    "Relatorio - Relatorio de log de passagens enviadas a integração.png",
    "Relatorios - relatorio de eventos dos equipamentos.png",
    "Relatorios - relatorio de falhas sequenciais.png",
    "Relatorios - relatorio de fluxo diario de veiculos.png",
    "Relatorios - mapa de fluxo de passagens.png",
    "Relatórios BI -.relatorio de processamento.png",
    "Relatórios BI -.relatorio de disponibilidade.png",
    "Relatórios BI -.relatorio de infração.png",
    "Relatórios BI -.relatorio de boletim de medição.png",
    "Relatórios BI -.relatorio triagem por Usua.png",
    "Controle de acessos - usuario.png",
    "Controle de acessos - usuario - cadastro.png",
    "Controle de acessos - Perfil de acesso.png",
    "Controle de acessos - Perfil de acesso.- cadastro.png",
    "Controle de acessos - permissao de acesso.png",
    "Controle de acessos - acessos por ip.png",
    "Controle de acessos - logs de acesso.png",
    "Configurações - Arco.png",
    "Configurações - Arco - cadastro.png",
    "Configurações - Webhooks.png",
    "Configurações - configurações de enquadramento.png",
    "Medição - contrato.png",
    "Medição - contrato - cadastro.png",
    "Medição - nova medição - relatorio de medição de equipamento.png",
    "Medição - interrupções.png",
    "Medição - indice de performance.png",
    "Medição -Medição  finalizada.png",
    "Veículos - marcas de veículos.png",
    "Veículos - Classificações dos Veiculos.png",
    "Veículos - tipos de veículos.png",
    "Veículos - cores.png",
    "Veículos - Municípios.png",
    "Fabricantes - Lista.png",
    "Fabricantes - Cadastro.png",
    "Modelos de Equipamentos - Lista.png",
    "Tipos de Equipamentos - Lista.png",
    "Grupos de Equipamentos - Lista.png",
    "infração exportação - consultar erro de exportação.png",
    "cronotacografo-triagem-historico.png",
    "mapa online.png",
  ],
  axton: [
    "login.png",
    "dashboard.png",
    "menu.png",
    "operacoes.png",
    "operacoes - nova.png",
    "locais.png",
    "locais-cadastro.png",
    "inicar pesagem.png",
    "inicar pesagem - dados da pesagem.png",
    "iniciar pesagem - informar a placa para iniciar o processo de pesagem.png",
    "Iniciar pesagem - selecionar por classificacao.png",
    "Tickets de pesagens.png",
    "Tickets de pesagens - emitir ticket.png",
    "tela Tickets de pesagens - emitir ticket - relatorio - pdf.png",
    "layout ticket Axton.png",
    "Emitir Ticket de Pesagem.png",
    "Relatorio de pesagem.png",
    "tela tempo de analise de imagem.png",
    "Sistema - camera ip.png",
    "Sistema - dados do orgao.png",
    "Sistema - infracao.png",
    "Sistema - geral. png.png",
    "Sistema - haenni.png",
    "sequencial-infracao.png",
    "sequencial-infracao-dados.png",
    "sequencial de exportacao.png",
    "Exportacao de infracoes.png",
    "Exportacao de infracoes.- nova.png",
    "Exportacao de infracoes.- dados exportados.png",
    "usuario.png",
    "usuario-cadastro.png",
    "perfil-acesso.png",
    "perfil-acesso-cadastro.png",
    "permissao-acesso.png",
    "classificacao-veiculos.png",
    "classificacao-veiculos-cadastro.png",
    "Nova Operacao.png",
  ],
  axcross: [
    "Dashboard.png",
    "Dashboard - ocorrencias recentes.png",
    "Dashboard - ocorrência do tipo.png",
    "Equipamentos.png",
    "Equipamentos.- novo.png",
    "Equipamento - Editar.png",
    "botoes Equipamentos.png",
    "Mapa de Equipamentos.png",
    "Mapeamento de Rotas.png",
    "Grupo de Equipamentos.png",
    "Grupo de Equipamentos - novo.png",
    "Monitoramento Online.png",
    "Monitoramento Online.- fitros.png",
    "Alertas.png",
    "Alerta - novo.png",
    "Alerta - Ação.png",
    "Rastreamento de Veículos por Placa.png",
    "Relatório de Passagens.png",
    "Relatório de Ocorrências.png",
    "Relatórios.png",
    "Relatórios Gerados.png",
    "Veículos Monitorados.png",
    "Novo Veículo Monitorado.png",
    "Editar Veículo Monitorado.png",
    "Veículos Monitorados - importar.png",
    "Importação de Equipamentos.png",
    "Painel Fiscal Operacional.png",
    "Usuários.png",
    "Áreas.png",
    "Áreas novo.png",
    "Configurações.png",
    "MDF-e.png",
    "Tipo de Ocorrência.png",
    "Classificações dos Veículos.png",
  ],
};

// ============================================================
// SEÇÕES DISPONÍVEIS POR PRODUTO
// ============================================================
export const SECOES = {
  axhub: [
    "primeiros-passos",
    "infracoes",
    "operacoes",
    "administracao",
    "relatorios",
    "controle-acesso",
    "veiculos",
    "cadastros-basicos",
    "medicoes",
    "referencia-tecnica",
    "glossario",
  ],
  axton: [
    "primeiros-passos",
    "pesagem",
    "infracoes",
    "operacoes",
    "administracao",
    "relatorios",
    "veiculos",
    "cadastros-basicos",
    "controle-acesso",
    "sistema",
  ],
  axcross: [
    "primeiros-passos",
    "operacoes",
    "relatorios",
    "administracao",
    "sistema",
    "glossario",
  ],
};

// ============================================================
// CAMINHOS BASE DOS PORTAIS (relativo a src/)
// ============================================================
const PORTAIS_PATH = {
  axhub: path.resolve(__dirname, "../../AxHub/docs-portal/docs"),
  axton: path.resolve(__dirname, "../../AxTon/docs-portal/docs"),
  axcross: path.resolve(__dirname, "../../AxCross/docs-portal/docs"),
};

// ============================================================
// PROMPT DO SISTEMA — ESPECIALISTA EM DOCUMENTAÇÃO
// ============================================================
function buildPromptDocGen(produto, imagens) {
  const produtoNome = { axhub: "AxHub", axton: "AxTon", axcross: "AxCross" }[produto] || produto;

  return `Você é um especialista em documentação técnica da Axion Tecnologia.
Sua tarefa é criar documentação no padrão Docusaurus (markdown) para o sistema ${produtoNome}, seguindo exatamente o estilo e estrutura dos guias analíticos do portal.

==================================================
EXEMPLO DE REFERÊNCIA — ESTILO ESPERADO
==================================================
O documento abaixo é o modelo de qualidade que você deve seguir como referência de estilo, estrutura e tom:

---
sidebar_position: 3
title: "Manual de Triagem"
description: Manual completo e visual para analistas realizarem triagem de infrações no AxHub — passo a passo ilustrado com imagens
---

# Manual de Triagem — Guia do Analista

Este manual foi criado para **analistas de triagem**. Ele explica, passo a passo e com imagens, como revisar, validar ou descartar infrações no AxHub.

:::info Para quem é este manual?
Analistas responsáveis pela **revisão visual das infrações** capturadas pelos equipamentos de fiscalização.
:::

---

## O que é a Triagem?

A triagem é a etapa onde **você, analista**, revisa cada infração capturada pelo equipamento antes que ela siga para auditoria e exportação.

Sua análise garante que:
- ✅ Apenas infrações **válidas** e com **dados corretos** sigam adiante
- ❌ Infrações com **imagem ruim**, **placa ilegível** ou **erros de captura** sejam descartadas
- 🔒 O processo atenda aos **requisitos legais** do contrato

:::warning Responsabilidade do analista
Cada infração validada poderá gerar uma **multa real** ao condutor. Revise com atenção.
:::

---

## Como Acessar

### Passo 1 — Fazer login no sistema

Acesse o ${produtoNome} pelo navegador e faça login.

![Tela de login](../img/Login.png)

### Passo 2 — Navegar até a funcionalidade

No menu lateral esquerdo, clique em **[Módulo]** e depois em **[Submódulo]**.

![Menu principal](../img/triagem-menu-principal.png)

---

## Checklist de Análise

Antes de validar qualquer registro, verifique todos os itens:

- [ ] **Imagem legível** — a foto está nítida e sem obstruções?
- [ ] **Placa visível** — os caracteres estão completamente legíveis?
- [ ] **Data e hora corretas** — batem com o horário do equipamento?
- [ ] **Velocidade/peso compatível** — o valor registrado faz sentido?
- [ ] **Faixa correta** — o registro está na faixa de medição certa?

---

## Critérios de Validação

| Situação | Ação | Motivo |
|---|---|---|
| Imagem nítida, placa legível | ✅ Validar | Infração correta |
| Placa parcialmente visível | ❌ Descartar | Dado insuficiente |
| Alta velocidade sem imagem de qualidade | ❌ Descartar | Risco jurídico |
| Veículo de emergência | ❌ Descartar | Isento por lei |

---

## Casos Especiais

:::tip Placa Parcialmente Visível
Se menos de 5 caracteres da placa estiverem legíveis, descarte a infração.
:::

:::danger Velocidade Muito Alta (ex: acima de 200 km/h)
Provavelmente erro de equipamento. Escale para supervisão antes de qualquer ação.
:::

---

## Fluxo do Processo

\`\`\`
[Infração Capturada]
        ↓
  [Triagem: Validar ou Descartar?]
    ↙           ↘
[Validar]    [Descartar]
    ↓              ↓
[Auditoria]  [Arquivo de Descartados]
    ↓
[Exportação ao Órgão]
\`\`\`

---

> **Próximos passos:** [Auditoria de Infrações →](./auditoria)

---
[FIM DO EXEMPLO DE REFERÊNCIA]

==================================================
IMAGENS DISPONÍVEIS para ${produtoNome}
==================================================
Use APENAS imagens desta lista (caminho relativo: ../img/[nome-da-imagem]):
${imagens.map((img) => `- ${img}`).join("\n")}

==================================================
FORMATO OBRIGATÓRIO
==================================================

1. Inicie com frontmatter YAML completo:
   ---
   sidebar_position: [número 1-10]
   title: "[título direto]"
   description: [descrição de 1 linha, sem aspas]
   ---

2. Use admonitions do Docusaurus:
   - :::info — informações úteis e contexto
   - :::warning — alertas importantes
   - :::tip — dicas práticas e casos especiais
   - :::danger — riscos e situações críticas

3. Estrutura obrigatória de um guia analítico:
   - Parágrafo introdutório (quem deve ler, objetivo)
   - :::info (público-alvo)
   - O que é [processo]? (explicação conceitual)
   - Lista com ✅ ❌ 🔒 dos benefícios/restrições
   - :::warning (responsabilidade)
   - Passo a passo com imagens (quando disponíveis)
   - Checklist de análise (se aplicável)
   - Tabela de critérios (situação → ação → motivo)
   - Casos especiais (:::tip e :::danger)
   - Fluxo do processo (diagrama ASCII)
   - Links de navegação no final

==================================================
REGRAS DE QUALIDADE
==================================================
1. Escreva em português brasileiro, tom profissional e direto
2. Use **negrito** para termos importantes e nomes de menus
3. NUNCA use nomes de imagens que não estão na lista acima
4. Cada imagem deve ter texto ALT descritivo
5. O documento deve ser imediatamente utilizável no Docusaurus
6. Não adicione seções vazias ou genéricas demais
7. Se uma imagem da lista for relevante ao passo descrito, inclua-a
8. Gere um documento completo, não um rascunho
`;
}

// ============================================================
// FUNÇÃO PRINCIPAL — GERAR DOCUMENTO
// ============================================================
export async function gerarDocumento({ produto, tema, secao, tipo, detalhes, sidebar_position = 1 }) {
  const imagens = CATALOGO_IMAGENS[produto] || [];
  const systemPrompt = buildPromptDocGen(produto, imagens);

  const tipoLabel = tipo || "Guia Analítico";
  const produtoNome = { axhub: "AxHub", axton: "AxTon", axcross: "AxCross" }[produto] || produto;

  const userMessage = `Crie um ${tipoLabel} completo sobre: "${tema}"

Produto: ${produtoNome}
Seção no portal (pasta): ${secao}
Tipo de material: ${tipoLabel}
sidebar_position sugerido: ${sidebar_position}
${detalhes ? `\nContexto adicional fornecido pelo usuário:\n${detalhes}` : ""}

Gere o documento completo em markdown, pronto para ser salvo no portal Docusaurus.
Use as imagens disponíveis que forem relevantes ao tema e ao passo a passo.
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.25,
    max_tokens: 4000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const conteudo = response.choices[0].message.content;

  // Gera nome de arquivo slug a partir do tema
  const nomeArquivo =
    tema
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim() + ".md";

  const caminho = `${secao}/${nomeArquivo}`;

  return { conteudo, nomeArquivo, caminho, produto, secao };
}

// ============================================================
// SALVAR DOCUMENTO NO PORTAL
// ============================================================
export async function salvarDocumentoNoPortal({ conteudo, produto, secao, nomeArquivo }) {
  const basePath = PORTAIS_PATH[produto];
  if (!basePath) throw new Error(`Produto desconhecido: ${produto}`);

  const secaoPath = path.join(basePath, secao);

  // Cria o diretório da seção se não existir
  await fs.mkdir(secaoPath, { recursive: true });

  const filePath = path.join(secaoPath, nomeArquivo);
  await fs.writeFile(filePath, conteudo, "utf-8");

  return { filePath, sucesso: true };
}

// ============================================================
// LISTAR IMAGENS DISPONÍVEIS
// ============================================================
export function listarImagensProduto(produto) {
  return CATALOGO_IMAGENS[produto] || [];
}
