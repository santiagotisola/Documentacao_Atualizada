# AxionIA — Script de Integração Universal

## O que é este pacote?

Este é o **blueprint modular** extraído do ecossistema AxionIA, transformado em JSONs independentes que podem ser importados em qualquer sistema, plataforma ou software proprietário.

## Estrutura dos Módulos

| Arquivo | Módulo | Obrigatório? |
|---------|--------|--------------|
| `01-nucleo-ia-engine.json` | Motor IA (classificação + embeddings + LLM) | Sim |
| `02-whatsapp-completo.json` | WhatsApp (conexão, fluxo, estados, mensagens) | Opcional |
| `03-helpdesk-integrador.json` | Helpdesk genérico (Jitbit, Zendesk, Freshdesk, etc.) | Opcional |
| `04-erp-conector.json` | ERP genérico (qualquer sistema de gestão) | Opcional |
| `05-gerador-relatorios.json` | Gerador de relatórios e manuais | Opcional |
| `06-banco-dados-adaptador.json` | Adaptador multi-banco (SQL, NoSQL, APIs) | Sim |
| `07-tabela-relacionamento-sistemas.json` | Tabela de links — onde informar acessos | Sim |
| `08-scheduler-automacao.json` | Automação e agendamento de tarefas | Opcional |
| `09-crm-contatos.json` | CRM e gestão de contatos | Opcional |
| `10-conformidade-analise.json` | Análise de conformidade e compliance | Opcional |
| `11-documentacao-gerador.json` | Gerador de documentação/manuais | Opcional |
| `12-exemplo-farmacia-tekfarma.json` | Exemplo prático: integração com sistema de farmácia | Referência |

## Como usar

1. **Escolha os módulos** que precisa para seu cenário
2. **Preencha a tabela de relacionamento** (`07-tabela-relacionamento-sistemas.json`) com os dados de acesso dos seus sistemas
3. **Importe os JSONs** no seu sistema/banco de dados
4. **Adapte os endpoints** conforme sua infraestrutura
5. **Configure as variáveis** de ambiente conforme cada módulo

## Princípio de Funcionamento

```
[Seu Sistema] ←→ [Módulo de Integração] ←→ [Sistemas Externos]
                        ↕
              [Motor IA + Knowledge Base]
                        ↕
              [WhatsApp / Chat / API]
```

Cada módulo é **auto-contido** e pode funcionar independentemente dos outros.
