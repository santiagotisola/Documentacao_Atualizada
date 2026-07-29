# 10 — MICROLEARNING ENGINE
## AXIONIA KNOWLEDGE PLATFORM — Motor de Microlearning v1.0

---

## Os 9 Níveis de Aprendizagem AKP

| # | Duração | Tipo | Template | Descrição |
|---|---------|------|----------|-----------|
| 1 | **15s** | Cápsula Rápida | Template C | Uma única frase com impacto imediato |
| 2 | **30s** | Dica | Template C | Dica aplicável imediatamente |
| 3 | **45s** | Conceito | Template C | Explicação de um conceito fundamental |
| 4 | **60s** | Procedimento | Template C | Passo a passo básico |
| 5 | **90s** | Fluxo | Template C | Fluxo simples com contexto |
| 6 | **5min** | Módulo Básico | Template B abreviado | Introdução a um módulo |
| 7 | **15min** | Módulo Intermediário | Template B | Módulo completo com demonstração |
| 8 | **30min** | Módulo Avançado | Template B | Módulo avançado com casos de uso |
| 9 | **Completo** | Curso | Template A + B | Curso completo com certificação |

---

## Template C — Cápsula (15-40 segundos)

### Os 10 campos obrigatórios:

| # | Campo | Obrigatório | Máximo |
|---|-------|:-----------:|--------|
| 1 | **Título** | ✅ | 8 palavras / 60 chars |
| 2 | **Tempo** | ✅ | Exato: 15, 20, 25, 30, 35 ou 40s |
| 3 | **Imagem Principal** | ✅ | Descrição para captura |
| 4 | **Mensagem Curta** | ✅ | 25 palavras |
| 5 | **Benefício** | ✅ | 10 palavras (infinitivo) |
| 6 | **Exemplo** | ✅ | Situação real do sistema |
| 7 | **Convite para Saber Mais** | ✅ | 80 chars |
| 8 | **Relacionamento com Manual** | ✅ | `{ doc_id, titulo, secao }` |
| 9 | **Relacionamento com Treinamento** | ✅ | `{ quiz_id, titulo, nivel }` |
| 10 | **Relacionamento com FAQ** | ✅ | `{ faq_id, pergunta }` |

### Exemplo de Cápsula Preenchida (30s):

```json
{
  "akp_id": "AKP-ML-AH-030-001",
  "titulo": "Equipamento offline? Verifique o heartbeat primeiro",
  "tempo": 30,
  "imagem_principal": "Screenshot do Dashboard com equipamento vermelho destacado e timestamp do último heartbeat visível",
  "mensagem_curta": "Quando um equipamento aparece offline, o usuário deverá verificar o horário do último heartbeat antes de acionar o suporte técnico.",
  "beneficio": "Evitar acionamentos desnecessários e resolver problemas mais rapidamente",
  "exemplo": "Equipamento PE005C offline às 14h. Heartbeat parou às 13h52. Causa: queda de energia local. Retorno previsto: automático em 30min.",
  "convite_saber_mais": "Acesse o Manual de Equipamentos — seção Status e Heartbeat →",
  "relacionamento_manual": {
    "doc_id": "AKP-DOC-AH-EQ-001",
    "titulo": "Manual do Usuário — Equipamentos",
    "secao": "Status dos Equipamentos"
  },
  "relacionamento_treinamento": {
    "quiz_id": "AKP-QUIZ-AH-EQ-001",
    "titulo": "Quiz — Operação de Equipamentos",
    "nivel": "basico"
  },
  "relacionamento_faq": {
    "faq_id": "AKP-FAQ-AH-015",
    "pergunta": "O equipamento ficou offline, o que devo fazer?"
  }
}
```

---

## Tipos de Cápsulas

| Tipo | Ícone | Quando usar |
|------|-------|-------------|
| **Você Sabia** | 💡 | Fatos relevantes que o usuário provavelmente não conhece |
| **Dica Rápida** | 🔧 | Ações que melhoram produtividade imediatamente |
| **Erro Comum** | ⚠️ | Erros frequentes e como evitá-los |
| **Novidade** | ✨ | Novas funcionalidades ou atualizações |
| **Nova Funcionalidade** | 🚀 | Detalhamento de feature nova |
| **Atalho** | ⌨️ | Atalhos de teclado e navegação rápida |
| **Boas Práticas** | ⭐ | Recomendações da equipe especialista |
| **Configuração** | ⚙️ | Configurações importantes do sistema |
| **Integração** | 🔗 | Como funciona uma integração específica |

---

## Regras do Microlearning Engine

1. Uma única ideia por cápsula — sem exceções
2. Mensagem máximo 25 palavras
3. Todo relacionamento DEVE ser preenchido (Princípio #3)
4. Cápsulas isoladas (sem relacionamentos) são **inválidas**
5. Usar narrativa corporativa — nunca linguagem informal
6. Benefício sempre começa com verbo no infinitivo
7. Exemplo sempre usa situação real do sistema (não fictícia)
8. Toda documentação nova gera automaticamente os 9 níveis

---

## Knowledge Feed

O **Knowledge Feed** é o canal de distribuição das cápsulas geradas pelo Microlearning Engine:

- Feed em tempo real de novas cápsulas
- Filtrável por: duração, tipo, sistema, módulo
- Cards com: tipo, título, conteúdo, call-to-action
- Prioridades: alta (alertas), normal (novidades), baixa (dicas)
- Integrado ao PresentationCenter → aba **Feed** (ícone 📡)
