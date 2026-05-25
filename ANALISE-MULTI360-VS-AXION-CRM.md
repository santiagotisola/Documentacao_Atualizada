# 📊 ANÁLISE ESTRATÉGICA: Multi360 vs Axion — CRM + Helpdesk + SaaS + IA

**Data:** 19/05/2026  
**Fonte:** Extração direta do painel Multi360 (painel.multi360.com.br)  
**Objetivo:** Mapear regras de negócio, identificar oportunidades e propor ecossistema integrado  

---

## PARTE 1 — REGRAS DE NEGÓCIO EXTRAÍDAS DO MULTI360

### 1.1 Visão Geral da Plataforma

| Métrica | Valor (Mai/2026) | Total Histórico |
|---------|-----------------|-----------------|
| Atendentes Online | 10 | 20 |
| Atendentes Ativos | 20 | Limite: 20 |
| Novos Leads (mês) | 2.045 | 52.032 |
| Mensagens (mês) | 205.247 | 9.345.215 |
| Avaliações (mês) | 1.885 | 125.744 |
| Atendimentos Pendentes | 25 | Ativos: 456 |
| Atendimentos (mês) | 8.400 | 423.981 |
| Tempo Médio Atendimento | 13:37 min | Geral: 27:50 |
| Média de Avaliação | 9,2 | Geral: 9,5 |
| Recados Enviados | 0 | 22.992 |

### 1.2 Módulos do Sistema (Menu Completo)

| # | Módulo | Função | Aplicável ao Axion? |
|---|--------|--------|---------------------|
| 1 | **Atendimentos** | Chat em tempo real multi-canal | ✅ SIM — Principal |
| 2 | **Dashboard** | KPIs, rankings, avaliações | ✅ SIM — Já temos base |
| 3 | **Usuários** | Gestão de usuários do sistema | ✅ SIM |
| 4 | **Departamentos** | Setores de atendimento | ✅ SIM — Mapeia para AxHub/AxTon/AxCross |
| 5 | **Atendentes** | Cadastro e gestão de atendentes | ✅ SIM |
| 6 | **Agenda de Contatos** | Base de contatos com filtros | ✅ SIM — CRM básico |
| 7 | **Tags** | Classificação de atendimentos | ✅ SIM — Já temos no Jitbit |
| 8 | **Mensagens Rápidas** | Macros/templates de resposta | ✅ SIM |
| 9 | **Bots** | Chatbots com URA visual | ✅ SIM — Com IA superior |
| 10 | **Enquetes** | Pesquisas de satisfação | ✅ SIM |
| 11 | **Recados** | Mensagens em massa (broadcast) | ✅ SIM |
| 12 | **Banco de Arquivos** | Storage de mídias/docs | ✅ SIM |
| 13 | **Blacklist** | Bloqueio de contatos | ✅ SIM |
| 14 | **Retornos** | Follow-up scheduling | ✅ SIM |
| 15 | **Mensagens Programadas** | Agendamento de envios | ✅ SIM |
| 16 | **Integrações** | Webhooks e APIs externas | ✅ SIM |
| 17 | **Relatórios** | Atendimentos, Contatos, Potenciais | ✅ SIM |
| 18 | **Campos Customizados** | Formulários dinâmicos no bot | ✅ SIM |
| 19 | **Clientes Potenciais** | Lead scoring/pipeline | ✅ SIM — CRM |

### 1.3 Canais Configurados

| Canal | Identificador | Status |
|-------|--------------|--------|
| WhatsApp | 556296943770 | ✅ Online (Cloud Server) |
| WhatsApp | 556294357076 | ⚠️ Offline |
| WhatsApp | 556232408700 | ❌ Removido |
| WhatsApp | 556292991849 | ❌ Removido |
| Facebook | Euajudoaciencia | ✅ Online |
| Instagram | euajudoaciencia | ✅ Online |
| Site (WebChat) | euajudoaciencia.com.br | ✅ Online |

### 1.4 Estrutura de Departamentos

| Departamento | Função |
|-------------|--------|
| Pesquisa Clínica | Atendimento principal |
| Pesquisa Clínica - Cabelo | Segmento específico |
| Pesquisa Clínica - Gripe | Segmento específico |
| Pós Estudo | Acompanhamento |
| Recrutamento | Captação de participantes |

### 1.5 Campos Customizados (Formulário Bot)

O sistema coleta via chatbot:
- Nome, CPF, Data de nascimento, Sexo, Idade, Cidade
- Telefone de contato, E-mail
- Assistiu nosso vídeo? (S/N)
- Concorda com Consentimento? (S/N)
- Deseja assistir nossa palestra? (S/N)
- Possui alguma dúvida? (S/N)
- Possui grau de parentesco no ICF? (S/N)
- Como nos conheceu? (13 opções)
- Data agendamento consulta
- Horário/Período da consulta

### 1.6 Ranking de Produtividade (Top 5)

| Atendente | Atend./Mês | Total |
|-----------|-----------|-------|
| Danielly Barreto de Souza Neves | 1.623 | 35.034 |
| Atendente 1 ICF | 1.123 | 140.504 |
| Lúcia Cleide Leao Pontes | 638 | 19.010 |
| Melyssa Gomes Pereira | 612 | 7.904 |
| Gabrielly Batista Alencar | 592 | 21.324 |

### 1.7 Tipos de Atendimento

| Origem | Descrição |
|--------|-----------|
| **Reativo** | Cliente inicia contato |
| **Ativo** | Atendente inicia contato |
| **Potencial** | Lead capturado pelo bot |
| **Integração** | Via webhook/API externa |

### 1.8 Status do Atendimento

```
Aguardando → Ativo (atendente assume) → Finalizado
```

---

## PARTE 2 — COMPARAÇÃO: Multi360 vs NOSSO ECOSSISTEMA

### 2.1 O Que o Multi360 TEM e Nós NÃO TEMOS

| Feature Multi360 | Status Axion | Esforço p/ Implementar |
|------------------|-------------|----------------------|
| Chat em tempo real multi-canal | ❌ Não temos | 🟡 Médio (WebSocket) |
| Bot visual (URA com fluxo) | ❌ Não temos | 🔴 Alto |
| Mensagens em massa (broadcast) | ❌ Não temos | 🟢 Baixo |
| Enquetes/CSAT no canal | ❌ Não temos | 🟢 Baixo |
| Mensagens programadas | ❌ Não temos | 🟢 Baixo |
| Blacklist de contatos | ❌ Não temos | 🟢 Baixo |
| Agenda de contatos (CRM) | ❌ Não temos | 🟡 Médio |
| Retornos/Follow-up | ❌ Não temos | 🟢 Baixo |
| Relatório de contatos/leads | ❌ Parcial | 🟡 Médio |
| Campos customizados por bot | ❌ Não temos | 🟡 Médio |
| Dashboard tempo real | ⚠️ Parcial | 🟡 Médio |
| Multi-canal (Instagram/FB/Telegram) | ❌ Não temos | 🔴 Alto |

### 2.2 O Que NÓS TEMOS e o Multi360 NÃO TEM

| Feature Axion | Multi360 | Nosso Diferencial |
|---------------|----------|-------------------|
| **IA com RAG/Embeddings** | ❌ Não tem | Motor de IA com cosine similarity, KB |
| **Classificação inteligente** | ❌ Básico | Engine.js com OpenAI + embeddings |
| **Knowledge Base com RAG** | ❌ Não tem | Busca semântica na base de conhecimento |
| **Análise de duplicados** | ❌ Não tem | Detecção automática de tickets duplicados |
| **Integração Jitbit (ITSM)** | ❌ Não tem | Abertura e gestão de tickets via IA |
| **Intelligence Hub** | ❌ Não tem | Análise cruzada multi-site |
| **Análise preditiva** | ❌ Não tem | IA sugere resoluções e prevê escalação |
| **Multi-produto (AxHub/AxTon/AxCross)** | ❌ Genérico | Especializado por produto |
| **Auto-resposta confiável** | ❌ Script fixo | IA decide quando pode responder vs escalar |
| **Docs Portal integrado** | ❌ Não tem | Docusaurus com 3 portais |

### 2.3 Matriz de Decisão

```
┌─────────────────────────────────────────────────────────┐
│              MULTI360         │        AXION            │
├──────────────────────────────┼─────────────────────────┤
│ ✅ Multi-canal robusto       │ ✅ IA Superior (RAG)    │
│ ✅ Chat tempo real           │ ✅ ITSM/Helpdesk (Jitbit)│
│ ✅ Bot visual (URA)          │ ✅ Classificação intelig.│
│ ✅ Broadcast/massa           │ ✅ Knowledge Base       │
│ ✅ CSAT integrado            │ ✅ Multi-produto        │
│ ✅ Agenda de contatos        │ ✅ Análise preditiva    │
│ ❌ Sem IA real               │ ❌ Sem chat tempo real  │
│ ❌ Sem ITSM                  │ ❌ Sem multi-canal      │
│ ❌ Sem knowledge base        │ ❌ Sem CRM             │
│ ❌ Scripts fixos (não aprende)│ ❌ Sem broadcast       │
└──────────────────────────────┴─────────────────────────┘
```

---

## PARTE 3 — IMPACTO DE CRIAR O ECOSSISTEMA COMPLETO

### 3.1 Arquitetura Proposta: Axion CRM + Helpdesk + SaaS

```
                    ┌─────────────────────────────────┐
                    │     AXION OMNICHANNEL HUB       │
                    │    (SaaS + CRM + Helpdesk)      │
                    └────────────────┬────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
    ┌────▼────┐               ┌─────▼─────┐              ┌─────▼─────┐
    │ CANAIS  │               │  ENGINE   │              │   DADOS   │
    │         │               │    IA     │              │           │
    ├─────────┤               ├───────────┤              ├───────────┤
    │WhatsApp │               │Classifier │              │ MongoDB   │
    │Instagram│               │Embeddings │              │ (Contatos)│
    │Facebook │               │RAG/KB     │              │ (Tickets) │
    │Telegram │               │OpenAI     │              │ (CRM)     │
    │WebChat  │               │NLP        │              │ (Analytics│
    │Email    │               │Sentiment  │              │           │
    │SMS      │               │Prediction │              │ Jitbit    │
    └────┬────┘               └─────┬─────┘              └─────┬─────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │
                    ┌───────────────▼───────────────────┐
                    │        MÓDULOS DO SISTEMA         │
                    ├──────────────────────────────────-┤
                    │ 1. Atendimento (Chat + Bot + IA)  │
                    │ 2. CRM (Contatos + Pipeline)      │
                    │ 3. Helpdesk (Tickets + SLA)       │
                    │ 4. Broadcast (Campanhas + Mass)   │
                    │ 5. Analytics (BI + Preditivo)     │
                    │ 6. Automação (Workflows + Cron)   │
                    │ 7. Knowledge Base (Self-service)   │
                    │ 8. Portal Cliente (Widget)         │
                    └───────────────────────────────────┘
```

### 3.2 Esforço Estimado por Módulo

| Módulo | Complexidade | Depende de | Já Temos Base? |
|--------|-------------|-----------|----------------|
| 1. Chat Real-time | 🟡 Média | WebSocket, UI | WhatsApp.jsx parcial |
| 2. Multi-canal | 🔴 Alta | APIs externas | Baileys pronto |
| 3. Bot Builder | 🔴 Alta | Editor visual | Nada |
| 4. CRM/Contatos | 🟡 Média | MongoDB | Nada |
| 5. Broadcast | 🟢 Baixa | Canal + template | whatsapp.service.js |
| 6. CSAT/Enquetes | 🟢 Baixa | MongoDB + canal | Nada |
| 7. Msg Programadas | 🟢 Baixa | Scheduler | scheduler.js pronto |
| 8. Analytics/BI | 🟡 Média | Dados + UI | Intelligence Hub |
| 9. Workflows | 🟡 Média | Editor + engine | Nada |
| 10. Portal Cliente | 🟢 Baixa | React + API | Widget parcial |

### 3.3 Grupo WhatsApp de Atendimento — Estratégia

**Número disponível:** 556294357076 (Bot sem URA — atualmente Offline no Multi360)

**Proposta:**
1. Ativar este número no nosso sistema (Evolution API/Baileys)
2. Criar grupo "Atendimento Axion" com equipe interna
3. Integrar com o bot de triagem para notificações de novos chamados
4. Fluxo: Cliente → Bot → Classifica → Notifica grupo → Atendente assume

---

## PARTE 4 — PROPOSTA: TRANSFORMAÇÃO SaaS + CRM

### 4.1 O Que a IA Pode Acrescentar (Diferencial Competitivo)

| Funcionalidade IA | Impacto | O Multi360 NÃO TEM |
|-------------------|---------|---------------------|
| **Auto-triagem inteligente** | Classifica 100% dos tickets sem intervenção humana | ✅ Nosso diferencial |
| **Resposta autônoma Tier-1** | Resolve 30-50% dos chamados automaticamente | ✅ Nosso diferencial |
| **Sentiment Analysis** | Detecta frustração e escala proativamente | ✅ Nosso diferencial |
| **Predição de churn** | Identifica clientes em risco antes de cancelar | ✅ Nosso diferencial |
| **Auto-KB Generation** | Cria artigos na base a partir de tickets resolvidos | ✅ Nosso diferencial |
| **Smart Routing** | Roteia para o atendente com melhor skill match | ✅ Nosso diferencial |
| **Sugestão de resposta** | IA sugere texto ao atendente em tempo real | ✅ Nosso diferencial |
| **Detecção de duplicados** | Identifica e mergeia conversas sobre mesmo assunto | ✅ Nosso diferencial |
| **Análise de tendências** | Detecta picos de problema e alerta proativamente | ✅ Nosso diferencial |
| **Onboarding automatizado** | Bot guia novos clientes pelo setup | ✅ Nosso diferencial |

### 4.2 Modelo SaaS + CRM: Proposta de Produto

```
┌──────────────────────────────────────────────────────────┐
│                    AXION CONNECT                          │
│           SaaS de Atendimento Inteligente                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  TIER 1 — STARTER (R$ 197/mês)                          │
│  • 1 canal (WhatsApp)                                    │
│  • 3 atendentes                                          │
│  • Bot básico (URA)                                      │
│  • 500 atendimentos/mês                                  │
│  • Dashboard básico                                      │
│                                                          │
│  TIER 2 — PROFESSIONAL (R$ 497/mês)                      │
│  • 3 canais (WhatsApp + Instagram + WebChat)             │
│  • 10 atendentes                                         │
│  • Bot com IA (classificação automática)                 │
│  • 2.000 atendimentos/mês                                │
│  • CRM completo + Pipeline                               │
│  • Relatórios avançados                                  │
│  • SLA Management                                        │
│                                                          │
│  TIER 3 — ENTERPRISE (R$ 997/mês)                        │
│  • Todos os canais                                       │
│  • Atendentes ilimitados                                 │
│  • IA completa (RAG, auto-resposta, preditivo)           │
│  • Atendimentos ilimitados                               │
│  • CRM + Helpdesk + Knowledge Base                       │
│  • Workflows customizados                                │
│  • API aberta + Webhooks                                 │
│  • White-label                                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 4.3 Roadmap de Implementação

```
FASE 1 — MVP (4-6 semanas)
├── WhatsApp com bot de triagem (TEMOS BASE)
├── Chat em tempo real (WebSocket)
├── CRM básico (contatos + histórico)
├── Dashboard com métricas
└── Integração Jitbit mantida

FASE 2 — CRESCIMENTO (6-8 semanas)
├── Multi-canal (Instagram, Facebook)
├── Bot builder visual
├── Broadcast/Campanhas
├── CSAT/Enquetes
├── Mensagens programadas
└── Relatórios completos

FASE 3 — ENTERPRISE (8-12 semanas)
├── IA completa (RAG, preditivo, sentiment)
├── Workflows automáticos
├── White-label para revenda
├── Portal self-service
├── Knowledge Base pública
└── API marketplace
```

---

## PARTE 5 — AÇÕES IMEDIATAS RECOMENDADAS

### 5.1 Próximos Passos Prioritários

| # | Ação | Prioridade | Impacto |
|---|------|-----------|---------|
| 1 | Ativar WhatsApp (556294357076) no nosso Baileys | 🔴 Alta | Base do ecossistema |
| 2 | Implementar modelo de Contatos (CRM) no MongoDB | 🔴 Alta | Base para CRM |
| 3 | Chat em tempo real com WebSocket | 🔴 Alta | Atendimento live |
| 4 | Módulo de Broadcast (envio em massa) | 🟡 Média | Engajamento |
| 5 | CSAT automático pós-atendimento | 🟡 Média | Qualidade |
| 6 | Migrar dados do Multi360 (52k contatos) | 🟡 Média | Base de dados |
| 7 | Bot builder visual (MVP) | 🟡 Média | Self-service |
| 8 | Pipeline de leads (CRM) | 🟡 Média | Vendas |

### 5.2 Dados para Extrair do Multi360

O script `exportar-contatos-multi360.mjs` já está preparado para:
- Extrair todos os 52.032 contatos via API (paginado por mês)
- Converter para formato Google Contacts CSV
- Campos: Nome, Telefone, Origem, Canal, Data

**API descoberta:** `GET /api/relatorios/telefones?pagina=0&quantidade=100&dataCriacaoDe=DD/MM/YYYY&dataCriacaoAte=DD/MM/YYYY`
- Requer token JWT (Bearer)
- Máximo 1 mês por requisição
- Retorna: id, origem, cliente, telefoneCliente, telefoneUsuario, usuario, dataCriacao

### 5.3 Recursos do Multi360 para Replicar com IA Superior

| Recurso Multi360 | Nossa Versão (com IA) |
|------------------|----------------------|
| Bot com URA fixa | Bot com IA conversacional + fallback URA |
| Roteamento por departamento | Roteamento por IA (skill + sentiment + carga) |
| Tags manuais | Tags automáticas por classificação IA |
| Relatórios estáticos | Analytics preditivo + alertas proativos |
| Campos customizados fixos | Formulários adaptativos (IA decide o que perguntar) |
| Broadcast genérico | Campanhas segmentadas por comportamento |
| CSAT pós-atendimento | CSAT + Sentiment em tempo real |

---

## PARTE 6 — CONCLUSÃO E RECOMENDAÇÃO

### O Multi360 é um sistema de atendimento multi-canal sólido, MAS:

1. **Não tem IA real** — só bots com scripts fixos (URA)
2. **Não tem ITSM/Helpdesk** — não gerencia tickets com SLA
3. **Não tem Knowledge Base** — sem deflection ou self-service
4. **Não aprende** — não melhora com o tempo
5. **Scripts genéricos** — não adaptáveis por contexto

### Nossa oportunidade:

> **Combinar o melhor do Multi360 (multi-canal + UX de chat) com o melhor do Axion (IA + ITSM + KB) para criar um produto único no mercado: ATENDIMENTO INTELIGENTE END-TO-END.**

### ROI Esperado:

| Métrica | Multi360 Atual | Com Axion Connect |
|---------|---------------|-------------------|
| % Atendimentos resolvidos por IA | 0% | 30-50% |
| Tempo médio de resposta | 13:37 min | < 2 min (IA) |
| Custo por atendimento | R$ 3-5 | R$ 0,50-1 (com IA) |
| Satisfação (CSAT) | 9,2 | 9,5+ (resolução rápida) |
| Leads qualificados | Manual | Automático (scoring IA) |

---

*Documento gerado por análise automatizada do painel Multi360 + base de código Axion.*
