# AxionIA — Visão de Futuro 2026+
## Ecossistema Integrado de Inteligência, Suporte e Documentação

> **"Da dúvida à resolução em segundos. Da ocorrência ao conhecimento automaticamente."**

---

## Manifesto

O ecossistema Axion existe para resolver uma dor real: **operadores de trânsito, gestores municipais e técnicos de campo precisam de respostas certas no momento certo** — sem depender de uma fila de atendimento, sem navegar em manuais extensos, sem esperar um técnico disponível.

O que estamos construindo não é um sistema de suporte. É um **sistema nervoso digital** que conecta:

- A **dúvida de um operador** que trava em campo
- A **ocorrência de um técnico** que não sabe o próximo passo  
- O **chamado de um gestor** que precisa de um relatório urgente
- O **ticket aberto** às 23h sem ninguém para responder
- A **documentação** que precisa refletir o que o sistema realmente faz hoje
- O **roadmap** que precisa capturar o que os clientes realmente pedem

Tudo isso **conectado, aprendendo e se auto-aperfeiçoando**.

---

## Arquitetura do Ecossistema Integrado

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SUPERFÍCIES DE ENTRADA                        │
│                                                                       │
│  Widget Docs    WhatsApp    Painel Interno    API Direta    E-mail   │
│      │              │             │               │            │     │
└──────┼──────────────┼─────────────┼───────────────┼────────────┼────┘
       │              │             │               │            │
       └──────────────┴─────────────┴───────────────┴────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │   AxionIA Engine   │
                          │  (Cérebro Central) │
                          │                   │
                          │  1. Classificar   │
                          │  2. Buscar KB     │
                          │  3. Contextualizar│
                          │  4. Responder     │
                          │  5. Aprender      │
                          └─────────┬─────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
    ┌─────────▼──────┐   ┌──────────▼──────┐   ┌──────────▼──────┐
    │  Knowledge     │   │   Sistemas       │   │  Helpdesk        │
    │  Base Vetorial │   │   Operacionais   │   │  Jitbit          │
    │  (MongoDB)     │   │  AxHub·AxTon·    │   │  (Tickets)       │
    │                │   │  AxCross         │   │                  │
    └────────────────┘   └─────────────────┘   └──────────────────┘
              │                     │                      │
              └─────────────────────┼──────────────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │  Loop de Aprendizado│
                          │  Contínuo          │
                          │                   │
                          │  ticket → KB       │
                          │  dúvida → doc      │
                          │  ocorrência → spec │
                          └─────────┬─────────┘
                                    │
              ┌─────────────────────┼──────────────────────┐
              │                     │                      │
    ┌─────────▼──────┐   ┌──────────▼──────┐   ┌──────────▼──────┐
    │   Portais de   │   │   Roadmap &      │   │   Conformidade & │
    │   Documentação │   │   Specs          │   │   PNCP           │
    │  (Docusaurus)  │   │  (Auto-gerados)  │   │  (Editais)       │
    └────────────────┘   └─────────────────┘   └──────────────────┘
```

---

## PILAR 1 — AxionIA Engine 3.0: O Cérebro que Cresce

### O que existe hoje
Pipeline linear: keywords → embeddings → GPT. Cada resposta é uma transação isolada. A IA não lembra da última pergunta, não sabe quem está perguntando, não melhora com o uso.

### O que precisa ser em 2026

#### 1.1 Agentes Autônomos com Ferramentas

Substituir o pipeline sequencial por um **agente que raciocina e escolhe ferramentas**:

```
Usuário: "quantas passagens o equipamento EQP-003 registrou essa semana?"

Agente AxionIA:
  → Identifica: precisa de dado real do banco AxHub
  → Chama ferramenta: consultarAxHub({ equipamento: "EQP-003", periodo: "semana" })
  → Recebe: 1.847 passagens, pico na quinta-feira
  → Responde com dados reais, não com texto genérico
```

**Ferramentas do agente:**
| Ferramenta | Descrição |
|------------|-----------|
| `buscarKB` | Busca semântica na knowledge base |
| `consultarAxHub` | Dados reais do banco SQL Server |
| `consultarAxTon` | Pesagens e infrações em tempo real |
| `consultarAxCross` | Passagens e alertas em tempo real |
| `abrirChamado` | Cria ticket no Jitbit |
| `buscarTickets` | Lista chamados abertos do usuário |
| `buscarDocumentacao` | Navega nos portais Docusaurus |
| `gerarRelatorio` | Compila e formata relatório |
| `agendarRevisao` | Agenda follow-up |

**Implementação:** OpenAI Responses API (lançada 2025) com `tool_choice: "auto"`.

#### 1.2 Memória de Sessão + Memória Longa

Dois tipos de memória simultâneos:

```
Memória de Sessão (conversa atual):
  → Últimas 10 trocas da conversa atual
  → Contexto: qual sistema, qual problema, qual usuário
  → Descartada ao fechar a sessão

Memória Longa (por usuário/telefone):
  → Perfil: "Felipe da Prefeitura de São Paulo — usa AxHub — frequentemente pergunta sobre relatórios"
  → Preferências: nível técnico alto, prefere resposta direta
  → Histórico de problemas recorrentes
  → Armazenada no MongoDB por user_id/telefone
```

#### 1.3 Modo Proativo — IA que Antecipa

A IA não apenas responde. Ela **monitora e alerta** antes que o problema vire chamado:

```
Scheduler (node-cron) executa a cada hora:
  → Verifica equipamentos offline há > 30min → alerta no WhatsApp do responsável
  → Detecta queda brusca de passagens em faixa → notifica técnico
  → Identifica ticket sem resposta há > 4h → escalona para gestor
  → Detecta veículo monitorado prestes a expirar → avisa o operador
```

**Canaliza para:** WhatsApp (via Meta Cloud API) + Painel (notificação push) + E-mail.

#### 1.4 Resposta Multimodal

Além de texto, o agente gera e interpreta:

```
Entrada:
  → Foto de erro de tela enviada pelo operador no WhatsApp
  → Screenshot de relatório com dado incorreto
  → Imagem de equipamento com problema visual

Processamento:
  → GPT-4o Vision analisa a imagem
  → Identifica: "Erro de conexão com câmera, LED vermelho no rack"
  → Busca na KB: causa + solução para esse erro visual
  → Responde com diagnóstico preciso + passos de resolução
```

Já existe `analise-imagem-controller.js` — ampliar para o fluxo WhatsApp.

---

## PILAR 2 — Helpdesk Inteligente: Do Ticket ao Conhecimento

### O Ciclo Completo que Precisa Existir

```
[OCORRÊNCIA]                    [RESOLUÇÃO]                [CONHECIMENTO]
     │                               │                           │
Operador envia                  IA classifica              Solução vai para
mensagem WhatsApp  ──────────▶  e resolve                  KB automaticamente
     │                          ou sugere        ─────────▶ sem trabalho manual
     │                               │                           │
     │                          Se não resolve                  │
     │                          cria ticket     ──▶ Técnico     │
     │                          no Jitbit           resolve ────┘
     │                               │
     │                          Ticket fechado
     │                          → candidata à KB ────▶ Revisão ──▶ KB ativa
     │
Próxima vez que alguém perguntar a mesma coisa:
→ IA já sabe responder com a solução do ticket anterior
```

### 2.1 Fluxo de Atendimento Redesenhado

**Nível 0 — Auto-resolução Imediata** (0–3 segundos)
```
Pergunta → KB hit >= 0.85 → Responde diretamente
Exemplos: como exportar relatório, como cadastrar usuário, como liberar pesagem
```

**Nível 1 — Resolução com Contexto** (3–15 segundos)
```
Pergunta → KB parcial → Agente busca dado real no sistema → Responde com contexto
Exemplos: "meu equipamento EQP-003 está offline" → IA consulta status real + última comunicação
```

**Nível 2 — Sugestão com Revisão** (imediato + humano valida)
```
Pergunta → IA formula resposta → Score 0.65–0.84 → Entra na fila de revisão
Atendente vê sugestão pronta → Aprova com 1 clique ou edita → Envia ao cliente
```

**Nível 3 — Escalona com Contexto** (imediato)
```
Pergunta complexa → Score < 0.65 → Abre ticket automaticamente
Ticket já vem com: categoria inferida, sistema identificado, urgência estimada, histórico do usuário
Técnico não começa do zero — começa com diagnóstico
```

**Nível 4 — Proativo** (não esperou o usuário perguntar)
```
Sistema detecta problema → IA notifica responsável → Resolve antes do chamado
Exemplos: equipamento offline, passagem zerada, certificado expirando
```

### 2.2 Tela de Revisão no Painel (nova funcionalidade)

Uma tela exclusiva para gerenciar a fila de sugestões da IA:

```
┌─────────────────────────────────────────────────────────────┐
│  FILA DE REVISÃO — 8 itens aguardando                      │
│                                                             │
│  [#1847] João Silva — AxHub — 14min atrás                  │
│  Pergunta: "Equipamento não envia imagem desde ontem"      │
│  Score IA: 0.73 | Sugestão automática gerada               │
│                                                             │
│  Resposta sugerida:                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Assunto: Falha de transmissão de imagem             │  │
│  │ Causa: Possível problema de rede ou configuração... │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [✅ Aprovar e Enviar]  [✏️ Editar]  [🔄 Re-gerar]  [⏩ Escalar] │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  [#1846] Maria Souza — AxCross — 32min atrás — Score 0.71  │
│  ...                                                        │
└─────────────────────────────────────────────────────────────┘
```

**Quando o atendente clica "Aprovar":**
1. Resposta vai direto para o Jitbit como resposta oficial
2. Par pergunta+resposta é candidatado à KB com status "aprovado"
3. Score de acerto do atendente é registrado (feedback loop)

### 2.3 Auto-Aprendizado com Tickets Resolvidos

Ao fechar um ticket no Jitbit com status "Resolvido":

```js
// scheduler.js — novo ciclo de aprendizado
async function cicloAprendizado() {
  const ticketsFechados = await buscarTickets({ mode: 'resolved', diasAtras: 1 });
  
  for (const ticket of ticketsFechados) {
    const jaExisteNaKB = await verificarDuplicata(ticket.textoOriginal);
    if (jaExisteNaKB) continue; // evita duplicata
    
    await candidatarParaKB({
      pergunta:  ticket.textoOriginal,
      resposta:  ticket.respostaFinal,
      modulo:    ticket.categoria,
      fonte:     'ticket_resolvido',
      ticketId:  ticket.id,
      score_inicial: calcularScoreQualidade(ticket),
      status:    'pendente_revisao' // entra na fila antes de virar KB ativa
    });
  }
}
```

**Na tela KnowledgeBase do painel** → aba "Candidatos" → atendente revisa em lote e aprova.

---

## PILAR 3 — Documentação Viva: Que Se Atualiza Sozinha

### O Problema Real

A documentação envelhece. Um operador encontra uma tela diferente do manual, perde confiança e abre um chamado. **Cada chamado de "isso não está na documentação" é uma falha do sistema, não do usuário.**

### 3.1 Documentação Gerada por Mudança de Sistema

Quando uma funcionalidade nova é desenvolvida em AxHub/AxTon/AxCross:

```
Desenvolver → Commit → Webhook → AxionIA detecta mudança
→ Gera rascunho da doc automaticamente
→ Entra na fila "Docs Pendentes" do painel
→ Redator revisa e publica com 1 clique
→ Docusaurus faz build e publica
```

**Fluxo atual:** `POST /api/doc/gerar` → gera markdown → salva no portal  
**Fluxo futuro:** automático, disparado por webhooks do repositório dos sistemas.

### 3.2 Docs Dinâmicas com Dados Reais

Páginas de documentação que mostram dados reais do sistema:

```mdx
## Status dos Equipamentos

<EquipamentosStatus sistema="axhub" />
<!-- Busca em tempo real via /api/axhub/status -->
```

```mdx
## Últimas Passagens — AxCross

<TabelaPassagens limite={10} />
<!-- Atualizada automaticamente -->
```

Componentes React embutidos no Docusaurus (já suporta MDX) que buscam dados da API.

### 3.3 Busca Conversacional na Documentação

Substituir a busca simples por uma busca que entende intenção:

```
Usuário digita no portal: "como faço para ver as pesagens do mês passado"

Sistema atual: busca por texto "pesagens mês passado" → lista de páginas

Sistema futuro:
→ AxionIA interpreta a intenção
→ Responde diretamente: "Acesse Relatórios → Pesagem Mensal → selecione o mês"
→ Mostra o trecho relevante da página
→ Oferece link direto para a seção exata
→ Opção: "Abrir chamado se precisar de ajuda"
```

**Implementação:** Widget no Docusaurus + `POST /api/chat` com contexto `fonte: 'documentacao'`.

### 3.4 Documentação como Fonte Viva para a IA

Os portais Docusaurus alimentam a KB automaticamente:

```
Build do Docusaurus → extrai texto de todas as páginas → gera embeddings → salva no MongoDB
→ IA pode responder com base na documentação oficial
→ Resposta sempre cita a fonte: "Conforme documentado em: [Pesagem Mensal](link)"
```

**Resultado:** A KB nunca fica desatualizada em relação à documentação.

---

## PILAR 4 — WhatsApp como Canal Principal de Suporte

### 4.1 Migração para Meta Cloud API

| Aspecto | Baileys (atual) | Meta Cloud API (futuro) |
|---------|----------------|------------------------|
| Risco de ban | Alto | Zero |
| Confiabilidade | ~95% | 99.9% |
| Manutenção | QR code manual | Webhook permanente |
| Mensagens ativas | Não suportado | Templates HSM aprovados |
| Botões/listas | Simulados | Nativos |
| Custo | Grátis | Grátis até 1.000 conv/mês |

### 4.2 Fluxo WhatsApp Redesenhado

```
Usuário: "oi"
  → Menu interativo com BOTÕES (não texto)
     [🔧 Suporte Técnico]  [📋 Meu Chamado]  [📖 Manual]

Usuário toca: [🔧 Suporte Técnico]
  → "Qual sistema?" → [AxHub] [AxTon] [AxCross]

Usuário toca: [AxHub]
  → "Descreva seu problema" (campo livre)

Usuário: "equipamento não está enviando imagem"
  → IA processa em paralelo:
     a) Busca na KB → encontra solução com score 0.91
     b) Consulta AxHub: "EQP-003 está offline desde 14h32"
  → Responde: "Vejo que o equipamento EQP-003 está offline desde 14h32.
               Causa provável: perda de sinal da operadora.
               Solução: [botão: Ver Passo a Passo] [botão: Abrir Chamado]"

Usuário toca: [Abrir Chamado]
  → Ticket criado no Jitbit automaticamente
  → Número do chamado enviado: "#1847 aberto com sucesso"
  → Promessa de retorno em até 2h
```

### 4.3 Notificações Proativas via WhatsApp

```
Templates HSM aprovados para envio ativo:

1. Alerta de Equipamento:
   "⚠️ AXION: O equipamento {{1}} está offline há {{2}} minutos.
    Chamado #{{3}} aberto automaticamente. [Ver Detalhes]"

2. Chamado Resolvido:
   "✅ AXION: Seu chamado #{{1}} foi resolvido.
    Resumo: {{2}}. [Confirmar Resolução] [Reabrir]"

3. Atualização de Chamado:
   "📋 AXION: Atualização no chamado #{{1}}: {{2}}. [Ver Chamado]"

4. Alerta de Vencimento:
   "⏰ AXION: O veículo {{1}} monitorado no AxCross expira em {{2}} horas.
    [Renovar Agora]"
```

---

## PILAR 5 — Painel AxionIA 3.0: Centro de Controle da Inteligência

### 5.1 Dashboard Executivo — O que a IA está fazendo agora

```
┌────────────────────────────────────────────────────────────────┐
│  AXION IA — DASHBOARD EXECUTIVO                    Hoje: 04/05  │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│  Resolvidos  │  Em Revisão  │  Escalados   │  Taxa Auto-Resolv │
│    147       │      8       │     3        │      93.6%        │
│  ▲ +12%      │   ▼ -2       │  ▼ -1        │    ▲ +1.2%        │
├──────────────┴──────────────┴──────────────┴───────────────────┤
│                                                                 │
│  [Gráfico] Chamados por Sistema (últimos 7 dias)               │
│  ████████ AxHub    62%                                         │
│  ████     AxTon    23%                                         │
│  ██       AxCross  15%                                         │
│                                                                 │
│  [Gráfico] Origem das Respostas                                │
│  ██████████ KB Vetorial  78%  (sem custo OpenAI)               │
│  ████       GPT-4o-mini  18%                                   │
│  █          Escalado      4%                                   │
│                                                                 │
│  [Gráfico] Score médio por módulo                              │
│  Pesagem: 0.91 | Equipamentos: 0.87 | Relatórios: 0.83        │
├─────────────────────────────────────────────────────────────────┤
│  🔴 ALERTAS ATIVOS                                              │
│  • EQP-007 offline há 47min — Responsável notificado WhatsApp  │
│  • Ticket #1844 sem resposta há 3h28 — Escalando em 32min      │
│  • 3 veículos monitorados expiram hoje                          │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Telas Novas (além das 15 existentes)

#### Tela: Monitor em Tempo Real
```
Fluxo ao vivo de mensagens chegando, sendo processadas e respondidas.
Status de cada conversa ativa (WhatsApp, widget, painel).
Intervenção humana instantânea: "assumir conversa" com 1 clique.
```

#### Tela: Knowledge Base 2.0
```
Aba "Ativa" → KB atual com score de acerto por entrada
Aba "Candidatos" → entradas aguardando revisão (de tickets fechados)
Aba "Descartadas" → entradas que não performaram bem
Filtro por módulo, por score, por data, por origem
Deduplicação automática: alertas quando entrada similar já existe
Editar embedding inline sem precisar re-treinar tudo
```

#### Tela: Mapa de Dores
```
Visualização do que os clientes mais perguntam e onde travam.
Nuvem de termos das perguntas não resolvidas.
"Top 10 dores sem solução na KB" → botão direto para criar entrada
Calor por sistema (AxHub/AxTon/AxCross) e por módulo
Tendência: o que cresceu nas últimas 2 semanas?
```

#### Tela: Pipeline de Documentação
```
Lista de docs geradas aguardando publicação
Status: Rascunho → Em Revisão → Aprovado → Publicado
Vinculação: qual ticket/dúvida originou a necessidade da doc
Preview inline sem sair do painel
Publicação direta no portal Docusaurus com 1 clique
```

#### Tela: Inteligência de Editais (PNCP)
```
Editais coletados com análise de conformidade automática
Score de aderência AxHub/AxTon/AxCross vs requisitos do edital
Pontos de atenção: o que o edital exige que ainda não temos
Histórico de editais ganhos vs perdidos e por quê
Geração automática de proposta técnica em Markdown
```

---

## PILAR 6 — Loop de Aprendizado Contínuo

### O Ciclo de Inteligência que Nunca Para

```
                    ┌─────────────────────┐
                    │  NOVA DÚVIDA/TICKET  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Engine processa    │
                    │  Score: 0.72        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │ Score >= 0.85  │ Score 0.65-0.84  │ Score < 0.65
              ▼                ▼                  ▼
         Responde         Fila Revisão       Escalona +
         direto           Atendente          Ticket Jitbit
              │                │                  │
              │           Atendente          Técnico
              │           edita/aprova       resolve
              │                │                  │
              └────────────────┴──────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │  Par Pergunta+       │
                         │  Resposta Validada   │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
           ┌────────▼───────┐ ┌─────▼──────┐ ┌────▼───────────┐
           │ KB recebe      │ │ Doc portal │ │ Score do modelo│
           │ novo embedding │ │ atualizada │ │ melhora        │
           └────────────────┘ └────────────┘ └────────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │  Próxima vez que    │
                         │  alguém perguntar   │
                         │  igual → Score 0.93 │
                         └─────────────────────┘
```

### 6.1 Métricas do Loop

```
KPIs do aprendizado contínuo (visíveis no dashboard):

Taxa de KB hits (mês): deve crescer todo mês
Custo OpenAI por ticket: deve cair todo mês
Tempo médio até resolução: deve cair todo mês
% tickets sem intervenção humana: meta 90% até dez/2026
Entradas novas na KB por semana: KPI de saúde do ecossistema
```

---

## PILAR 7 — Ecossistema de Produtos: AxHub · AxTon · AxCross

### 7.1 Cada Sistema com Inteligência Contextual Própria

A IA atual conhece todos os 3 sistemas de forma genérica. A evolução é ter **contexto operacional profundo**:

#### AxHub — Gestão de Equipamentos de Trânsito
```
IA conhece:
→ Histórico de cada equipamento (tempo online, falhas recorrentes)
→ Padrões de uso por município/órgão
→ Sazonalidade (feriados, eventos locais afetam o tráfego)
→ Manutenções agendadas vs não planejadas
→ Correlação: "quando chove, 23% dos radares perdem sinal"

Nova capacidade: diagnóstico preditivo
→ "EQP-003 tem padrão de falha toda 3ª semana — agendar manutenção preventiva"
```

#### AxTon — Pesagem Veicular
```
IA conhece:
→ Padrões de pesagem por rodovia, por horário
→ Tipos de veículos mais frequentes em cada posto
→ Histórico de infrações por categoria
→ Sazonalidade de safras (peso médio muda em agosto)

Nova capacidade: análise de anomalias
→ "Peso médio na balança B aumentou 8% esta semana — possível calibração necessária"
→ "Queda de 40% em pesagens na quarta-feira — verificar se balança ficou offline"
```

#### AxCross — Monitoramento de Cruzamentos
```
IA conhece:
→ Volumes de passagem por cruzamento/horário
→ Veículos monitorados mais frequentes
→ Alertas gerados vs confirmados (taxa de falso positivo)
→ Correlação entre alertas e ações tomadas

Nova capacidade: inteligência de padrões
→ "Veículo XYZ-1234 passou em 7 cruzamentos diferentes em 2h — padrão atípico"
→ "Taxa de alertas expirados em Rio de Janeiro cresceu 60% — revisar prazo do tipo de ocorrência"
```

### 7.2 Interoperabilidade entre Sistemas

Os 3 sistemas hoje são silos separados. A IA pode ser a **camada de correlação**:

```
Consulta cruzada: "me mostra os caminhões que foram pesados no AxTon hoje e 
                   depois passaram no cruzamento monitorado pelo AxCross"

→ AxionIA consulta AxTon (pesagens do dia)
→ Cruza com AxCross (passagens em cruzamentos)
→ Retorna lista de placas + horários + peso + cruzamento
→ Identifica anomalias: caminhão pesado acima do limite passou em corredor restrito
```

---

## PILAR 8 — Infraestrutura para Escalar

### 8.1 Arquitetura Atual vs Futura

| Componente | Atual | 2026 |
|-----------|-------|------|
| Processo | `node src/app.js` manual | PM2 cluster mode |
| Deploy | Cópia manual | GitHub Actions → Docker |
| Escalabilidade | Single process | Horizontal com load balancer |
| Banco vetorial | Loop manual MongoDB | MongoDB Atlas Vector Search |
| Cache | Sem cache | Redis para queries frequentes |
| Monitoramento | Console logs | OpenTelemetry + Grafana |
| Uptime | Manual | Alertas automáticos + auto-restart |

### 8.2 Configuração PM2 (Imediato)

```js
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'axion-ia-api',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    env_production: {
      NODE_ENV: 'production',
      PORT: 3100
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    restart_delay: 3000,
    max_restarts: 10
  }]
};
```

### 8.3 Docker para Ambientes Consistentes

```yaml
# docker-compose.yml
services:
  axion-ia-api:
    build: ./axion-ia-api
    restart: always
    ports: ["3100:3100"]
    env_file: .env
    depends_on: [mongo, redis]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3100/"]
      interval: 30s

  axion-ia-panel:
    build: ./axion-ia-panel
    restart: always
    ports: ["3001:80"]

  mongo:
    image: mongo:7
    restart: always
    volumes: [mongo_data:/data/db]

  redis:
    image: redis:7-alpine
    restart: always

volumes:
  mongo_data:
```

### 8.4 Pipeline CI/CD

```yaml
# .github/workflows/main.yml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build e push Docker
        run: docker-compose build
      - name: Deploy
        run: |
          docker-compose down
          docker-compose up -d
          docker-compose ps
```

---

## Roteiro de Implementação — 2026

### Fase 1 — Fundação Sólida (Maio–Junho 2026)
**Meta: Sistema estável, seguro e observável**

- [ ] **Segurança:** Helmet + rate limiting + validação Zod nos endpoints críticos
- [ ] **PM2:** Substituir iniciar.ps1 por ecosystem PM2 para a API
- [ ] **Logging:** Migrar para Pino estruturado com log rotation
- [ ] **Monitoramento:** Dashboard simples com métricas de uso da KB
- [ ] **Variáveis de ambiente:** envalid para validação na inicialização
- [ ] **Contexto de sessão:** Últimas 5 trocas por sessionId no engine

### Fase 2 — UX de Suporte (Junho–Julho 2026)
**Meta: Atendente produz 3x mais com a IA**

- [ ] **Fila de Revisão:** Nova tela no painel com aprovação em 1 clique
- [ ] **Streaming SSE:** Chat responde em tempo real (tokens chegando)
- [ ] **Auto-aprendizado:** Pipeline ticket fechado → KB candidato → revisão
- [ ] **TanStack Query:** Cache automático nas consultas do painel
- [ ] **Toast/Sonner:** Feedback visual de todas as ações
- [ ] **Recharts:** Gráficos no Dashboard (origem, score, volume)

### Fase 3 — IA Avançada (Julho–Agosto 2026)
**Meta: IA que raciocina, não só busca**

- [ ] **Agentes com ferramentas:** Responses API com tool_use
- [ ] **Dados reais no chat:** Ferramentas consultarAxHub/AxTon/AxCross
- [ ] **MongoDB Vector Search:** Substituir loop cosine por índice vetorial
- [ ] **Structured Outputs:** Respostas com Zod schema (sem formatação por prompt)
- [ ] **Model routing:** gpt-4o para queries complexas, mini para simples
- [ ] **Memória longa:** Perfil de usuário por telefone/userId

### Fase 4 — Documentação Viva (Agosto–Setembro 2026)
**Meta: Docs que se auto-atualizam**

- [ ] **Algolia DocSearch:** Busca full-text nos 3 portais
- [ ] **Busca conversacional:** Widget com chat IA nos portais Docusaurus
- [ ] **Docs → KB:** Portais alimentam embeddings automaticamente no build
- [ ] **Pipeline de publicação:** Aprovação → deploy Docusaurus em 1 clique
- [ ] **Mapa de Dores:** Tela nova no painel com análise de gaps documentais
- [ ] **Mermaid:** Diagramas inline nas docs técnicas

### Fase 5 — WhatsApp Oficial (Setembro–Outubro 2026)
**Meta: Canal confiável e escalável**

- [ ] **Meta Cloud API:** Migrar de Baileys para API oficial
- [ ] **Templates HSM:** Aprovação de modelos proativos (alerta, resolução)
- [ ] **Botões e listas:** Menu WhatsApp com elementos interativos nativos
- [ ] **Multimodal:** Análise de imagem no fluxo WhatsApp
- [ ] **Notificações proativas:** Alertas automáticos de equipamento/expiração

### Fase 6 — Escala e Interoperabilidade (Out–Dez 2026)
**Meta: Ecossistema autônomo**

- [ ] **Docker + CI/CD:** Deploy automático via GitHub Actions
- [ ] **Redis cache:** Queries frequentes do SQL Server em cache
- [ ] **Monitor em tempo real:** Tela de conversas ativas no painel
- [ ] **Correlação entre sistemas:** Consultas cruzadas AxHub × AxTon × AxCross
- [ ] **Diagnóstico preditivo:** Padrões de falha por equipamento
- [ ] **Dashboard executivo:** KPIs de negócio para gestores

---

## Indicadores de Sucesso — Dez 2026

| Indicador | Hoje (estimado) | Meta Dez/2026 |
|-----------|----------------|---------------|
| Taxa de auto-resolução | ~75% | 92% |
| Tempo médio de resposta | 8–15s | < 3s (streaming) |
| Tickets com intervenção humana | ~25% | < 8% |
| Custo OpenAI por 1000 perguntas | R$ 12 | R$ 3 |
| Entradas na KB | ~200 | 2.000+ |
| NPS do suporte | não medido | > 80 |
| Docs desatualizadas | frequente | zero (auto-atualização) |
| Uptime da API | ~97% | 99.9% |

---

## A Visão em Uma Frase

**AxionIA em 2026 é um sistema que aprende com cada pergunta, se documenta com cada resolução, previne problemas antes que virem chamados, e faz o operador em campo sentir que tem um especialista disponível 24 horas — sem fila, sem espera, sem resposta errada.**

---

*Documento elaborado em 04/05/2026 | Próxima revisão: 01/08/2026*
