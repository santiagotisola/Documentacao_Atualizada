# 📐 Documentação BPM — Axion Tecnologia

**Gestão de Processos de Negócio**  
**Business Process Management Documentation**

**Versão:** 1.0  
**Data:** 22 de junho de 2026  
**Sistema:** Axion IA - Ecossistema Completo (AxHub, AxTon, AxCross)

---

## 📋 Sumário Executivo

### Visão Geral

Este documento descreve os **7 processos de negócio principais** do ecossistema Axion, mapeados em notação BPM (Business Process Management). Cada processo está documentado com:

- **Fluxo passo-a-passo** detalhado
- **Atores envolvidos** (humanos e sistemas)
- **Pontos de integração** entre sistemas
- **KPIs e métricas** de performance
- **Locais de execução** no sistema

### Processos Documentados

| # | Processo | Sistema | Etapas | Tipo |
|---|----------|---------|--------|------|
| 1 | Processo de Infração | AxHub | 8 | End-to-End |
| 2 | Pesagem Veicular | AxHub/AxTon | 7 | End-to-End |
| 3 | Monitoramento Online | AxCross | 7 | Real-time |
| 4 | Medição Contratual | AxHub | 7 | Periódico |
| 5 | Atendimento Helpdesk | AxionIA | 8 | Assistido por IA |
| 6 | Operação de Equipamento | AxHub | 7 | Gestão |

---

## 🎯 Notação e Convenções

### Tipos de Atores

| Tipo | Descrição | Exemplos |
|------|-----------|----------|
| **Sistema** | Processo automatizado | OCR, Classificador, Cron Jobs |
| **Operador** | Usuário do sistema | Triagem, Monitoramento |
| **Gerente** | Gestor/Admin | Configurações, Medições |
| **Técnico** | Suporte técnico | Helpdesk, Manutenção |
| **Cliente** | Usuário final externo | Abertura de chamados |
| **Órgão Externo** | Entidade externa | DETRAN, Prefeitura |

### Tipos de Etapas

- **🔵 Manual:** Requer intervenção humana
- **🟢 Automático:** Executado pelo sistema
- **🟡 Semiautomático:** Sistema + validação humana
- **🔴 Externo:** Envolve sistema/ator externo

### Níveis de Prioridade

- **P1 - Crítico:** Impacta operação imediata
- **P2 - Alto:** Impacta SLA/contratos
- **P3 - Médio:** Operação normal
- **P4 - Baixo:** Melhorias/otimizações

---

## 📊 Processo 1: Infração (Início → Exportação)

### Informações Gerais

- **Sistema:** AxHub
- **Tipo:** End-to-End Workflow
- **Duração Média:** 24-72 horas
- **Volume:** 50k-500k infrações/mês por site
- **Automação:** 60% automatizado
- **Cor de Identificação:** #3b82f6 (Azul)

### Descrição

Fluxo completo desde a captura da imagem pelo equipamento até a exportação do auto de infração para o órgão autuador (DETRAN, Município). Processo crítico para contratos de fiscalização eletrônica.

### Diagrama BPM

```
[Equipamento] → [Captura] → [Recepção] → [OCR] → [Triagem] → [Exceções] → [Auditoria] → [Exportação] → [Confirmação]
     ↓              ↓           ↓          ↓         ↓            ↓             ↓              ↓              ↓
   Campo       Imagens      Banco       Placa    Operador     Sistema      Auditor      Órgão         Logs
```

### Etapas Detalhadas

#### 1️⃣ Captura (Campo)
- **Ator:** Equipamento (Radar/Câmera)
- **Tipo:** 🟢 Automático
- **Descrição:** Equipamento detecta infração (excesso de velocidade, avanço de sinal, etc.) e captura conjunto de imagens:
  - Imagem frontal (placa visível)
  - Imagem traseira
  - Imagem panorâmica (contexto)
- **Output:** 3-5 imagens JPEG + metadados (velocidade, data/hora, coordenadas)
- **Local no Sistema:** `Operações → Monitoramento Online`
- **Tecnologias:** Câmeras industriais, sensores de velocidade, sincronização GPS
- **SLA:** < 1 segundo desde detecção

#### 2️⃣ Recepção (Backend)
- **Ator:** Sistema (Background Service)
- **Tipo:** 🟢 Automático
- **Descrição:** Sistema recebe passagem via API REST ou FTP e persiste no banco de dados:
  - Tabela `Passagens`: ID, timestamp, equipamento_id, velocidade
  - Tabela `ImagensPassagem`: referências para arquivos no storage
  - Indexação para consultas rápidas
- **Output:** Registro criado com status `AGUARDANDO_OCR`
- **Local no Sistema:** Background (não visível diretamente)
- **Tecnologias:** Node.js/Express API, SQL Server, Azure Blob Storage
- **SLA:** < 5 segundos

#### 3️⃣ OCR (Processamento)
- **Ator:** Sistema (Pipeline de IA)
- **Tipo:** 🟢 Automático
- **Descrição:** Pipeline de reconhecimento óptico de caracteres (OCR) processa imagens:
  - Detecção de região da placa (YOLO/Detectron)
  - Segmentação de caracteres
  - Reconhecimento individual (CNN)
  - Validação de padrão brasileiro (AAA-0A00)
  - Cálculo de confiança (0-100%)
- **Output:** Placa reconhecida + score de confiança
- **Local no Sistema:** Automático (logs em `Relatórios → Logs OCR`)
- **Tecnologias:** Python, TensorFlow/PyTorch, OpenCV
- **SLA:** < 30 segundos por imagem
- **KPIs:** 
  - Acurácia: >95%
  - Taxa de confiança alta (>80%): >80% das placas

#### 4️⃣ Triagem (Operação)
- **Ator:** Operador (Triador)
- **Tipo:** 🔵 Manual
- **Descrição:** Operador analisa infração através da interface web:
  - Valida placa reconhecida pelo OCR
  - Verifica enquadramento legal (CTB)
  - Confere qualidade das imagens
  - Corrige placa se necessário
  - **Ações possíveis:**
    - ✅ Aprovar → vai para Exceções
    - ❌ Descartar → arquiva (não gera auto)
    - ✏️ Reclassificar → muda tipo de infração
- **Output:** Infração com status `TRIADA` ou `DESCARTADA`
- **Local no Sistema:** `Infrações → Triagem`
- **Performance Esperada:** 200-300 infrações/hora por operador
- **KPIs:**
  - Taxa de aprovação: 70-85%
  - Tempo médio por infração: 15-20 segundos

#### 5️⃣ Exceções (Automação)
- **Ator:** Sistema (Regras de Negócio)
- **Tipo:** 🟢 Automático
- **Descrição:** Motor de regras descarta automaticamente infrações que se enquadram em exceções:
  - **Veículos oficiais:** Polícia, bombeiros, ambulâncias (verificado por placa)
  - **Whitelist:** Placas cadastradas em lista de exceção (ex: veículos do próprio órgão)
  - **Horários especiais:** Eventos, obras, horários de tolerância
  - **Velocidade regulamentada:** Tolerância técnica de 7 km/h + 10%
- **Output:** Infração com status `EXCECAO` (não exportada)
- **Local no Sistema:** `Infrações → Exceções`
- **Logs:** Todas exceções são registradas com justificativa
- **KPIs:** 
  - Taxa de exceções: 5-15% das triadas
  - Auditoria: 100% das exceções auditáveis

#### 6️⃣ Auditoria (Qualidade)
- **Ator:** Auditor (Supervisor)
- **Tipo:** 🔵 Manual (Amostragem)
- **Descrição:** Auditor revisa amostra de infrações triadas para garantir qualidade:
  - **Amostragem:** 10% das infrações aprovadas + 100% das descartadas críticas
  - **Verificações:**
    - Placa correta
    - Enquadramento adequado
    - Imagens com qualidade
    - Decisão do triador consistente
  - **Feedback:** Gera relatório por operador
- **Output:** Relatório de qualidade + possível reclassificação
- **Local no Sistema:** `Infrações → Auditoria`
- **KPIs:**
  - Qualidade mínima: >95% de conformidade
  - Tempo de auditoria: 2-4 horas/dia

#### 7️⃣ Exportação (Envio)
- **Ator:** Sistema + Operador (Aprovação)
- **Tipo:** 🟡 Semiautomático
- **Descrição:** Lote de infrações validadas é exportado para o órgão autuador:
  - **Agrupamento:** Por órgão, período, tipo de infração
  - **Layout:** Formato específico do órgão (XML, TXT, CSV)
  - **Conteúdo:** Dados da infração + caminho das imagens
  - **Envio:** FTP, SFTP, API REST, ou arquivo físico
  - **Comprovante:** Protocolo de envio gerado
- **Output:** Arquivo de exportação + log de envio
- **Local no Sistema:** `Infrações → Exportação`
- **Volumes:** Lotes de 100-10.000 infrações
- **SLA:** Exportação em até 48h após triagem

#### 8️⃣ Confirmação (Retorno)
- **Ator:** Órgão Externo (DETRAN/Prefeitura)
- **Tipo:** 🔴 Externo
- **Descrição:** Órgão confirma recebimento do lote:
  - **Protocolo de retorno:** Confirmação por e-mail, arquivo de retorno, ou API
  - **Validações:** Órgão valida dados e pode rejeitar infrações
  - **Registro:** Sistema marca infrações como `EXPORTADAS_CONFIRMADAS`
- **Output:** Log de confirmação
- **Local no Sistema:** `Relatórios → Logs de Envios`
- **Follow-up:** Infrações rejeitadas retornam para revisão

### KPIs do Processo

| Métrica | Meta | Cálculo |
|---------|------|---------|
| **Tempo Total (Captura → Exportação)** | < 72h | Timestamp_Exportação - Timestamp_Captura |
| **Taxa de Aprovação** | 70-85% | (Aprovadas / Total_Triadas) × 100 |
| **Taxa de Exceções** | 5-15% | (Exceções / Total_Triadas) × 100 |
| **Acurácia OCR** | > 95% | (Placas_Corretas / Total_OCR) × 100 |
| **Qualidade Auditoria** | > 95% | (Conformes / Auditadas) × 100 |
| **Taxa de Rejeição (Órgão)** | < 5% | (Rejeitadas_Órgão / Exportadas) × 100 |

### Pontos de Atenção

⚠️ **Gargalos Comuns:**
- OCR com confiança baixa → aumenta tempo de triagem
- Fila de triagem acumulada → atrasa exportação
- Rejeições do órgão → retrabalho

✅ **Melhores Práticas:**
- Monitorar fila de triagem em tempo real
- Treinar operadores com feedback da auditoria
- Manter calibração dos equipamentos (OCR >95%)
- Automatizar regras de exceção sempre que possível

---

## ⚖️ Processo 2: Pesagem Veicular (Balança)

### Informações Gerais

- **Sistema:** AxHub + AxTon (Desktop)
- **Tipo:** Transactional Workflow
- **Duração Média:** 5-15 minutos por veículo
- **Volume:** 50-200 veículos/dia por posto
- **Automação:** 40% automatizado
- **Cor de Identificação:** #10b981 (Verde)

### Descrição

Fluxo de pesagem em postos rodoviários - do momento que o veículo entra na balança até o fechamento do ticket. Processo crítico para controle de peso em rodovias e geração de receita (multas por excesso).

### Diagrama BPM

```
[Entrada] → [Leitura Peso] → [Classificação] → [Abertura Ticket] → [Verificação] → [Liberação/Retenção] → [Fechamento]
    ↓            ↓                 ↓                  ↓                  ↓                   ↓                    ↓
  Posto       Balança          Sistema              Sistema           Operador           Operador              Sistema
```

### Etapas Detalhadas

#### 1️⃣ Entrada no Posto
- **Ator:** Operador + Sistema
- **Tipo:** 🟡 Semiautomático
- **Descrição:** Veículo é direcionado pelo operador para a balança:
  - Registro de entrada (placa capturada ou digitada)
  - Câmera frontal captura imagem do veículo
  - Sistema inicia leitura de peso
- **Output:** Registro inicial de pesagem
- **Local no Sistema:** `AxTon → Postos` ou `AxHub → Pesagem → Postos`
- **Tempo:** ~30 segundos

#### 2️⃣ Leitura de Peso
- **Ator:** Sistema (Sensor de Balança)
- **Tipo:** 🟢 Automático
- **Descrição:** Balança registra peso do veículo:
  - Peso bruto total (PBT)
  - Peso por eixo (se balança multieixo)
  - Estabilização do peso (aguarda veículo parar)
  - Sistema compara com PBT máximo permitido
- **Output:** Peso registrado + flag de excesso
- **Tecnologias:** Células de carga, protocolo serial RS232/485
- **Precisão:** ±50kg (INMETRO)
- **SLA:** < 10 segundos

#### 3️⃣ Classificação
- **Ator:** Sistema + Operador (Validação)
- **Tipo:** 🟡 Semiautomático
- **Descrição:** Veículo é classificado por tipo/categoria:
  - **Automático:** Sistema sugere com base no peso e eixos
  - **Categorias:** Leve, Médio, Pesado, Extrapesado
  - **Subtipos:** Caminhão truck, carreta, bitrem, etc.
  - **Operador:** Valida ou reclassifica manualmente
- **Output:** Veículo classificado + PBT permitido
- **Local no Sistema:** `Pesagem → Reclassificação`
- **Base de Dados:** Tabela de tipos de veículo com PBTs CONTRAN

#### 4️⃣ Abertura de Ticket
- **Ator:** Sistema
- **Tipo:** 🟢 Automático
- **Descrição:** Ticket de pesagem é criado com todos os dados:
  - ID do ticket
  - Placa, proprietário (se consultado RENAVAM)
  - Peso bruto, peso por eixo
  - Classificação
  - Fotos (frontal, traseira, lateral)
  - Horário de entrada
  - Status: `ABERTO`
- **Output:** Ticket em aberto
- **Local no Sistema:** `Pesagem → Tickets em Aberto`

#### 5️⃣ Verificação
- **Ator:** Operador
- **Tipo:** 🔵 Manual
- **Descrição:** Operador verifica situação do veículo:
  - **Peso dentro do permitido:** Liberar imediatamente
  - **Excesso de peso:** Calcular percentual de excesso
    - Excesso < 5%: Multa leve
    - Excesso 5-10%: Multa média
    - Excesso > 10%: Multa grave + possível apreensão
  - Verificar documentação (CRLV, nota fiscal da carga)
- **Output:** Decisão: liberar ou reter
- **Local no Sistema:** `Pesagem → Tickets em Aberto`
- **Tempo:** 2-5 minutos

#### 6️⃣ Liberação/Retenção
- **Ator:** Operador
- **Tipo:** 🔵 Manual
- **Descrição:** Ação tomada conforme verificação:
  - **Veículo regular:** Liberado imediatamente
  - **Excesso leve:** Autuado e liberado
  - **Excesso grave:** Retido para transbordo obrigatório
  - **Transbordo:** Veículo retira parte da carga, repe sa, e é liberado
- **Output:** Ticket atualizado com ação
- **Local no Sistema:** `Pesagem → Liberar Pesagem`
- **Documentos:** Auto de infração (se aplicável)

#### 7️⃣ Fechamento
- **Ator:** Operador
- **Tipo:** 🔵 Manual
- **Descrição:** Ticket é fechado com resultado final:
  - Status final: `LIBERADO`, `AUTUADO`, `TRANSBORDO`, `APREENDIDO`
  - Horário de saída
  - Observações relevantes
  - Valores de multa (se aplicável)
- **Output:** Ticket fechado
- **Local no Sistema:** `Pesagem → Tickets Fechados`
- **Arquivamento:** Dados salvos para relatórios estatísticos

### KPIs do Processo

| Métrica | Meta | Cálculo |
|---------|------|---------|
| **Tempo Médio de Atendimento** | < 10 min | Média(Horário_Saída - Horário_Entrada) |
| **Taxa de Excesso** | 15-25% | (Veículos_Com_Excesso / Total_Pesados) × 100 |
| **Taxa de Transbordo** | 5-10% | (Transbordos / Veículos_Com_Excesso) × 100 |
| **Veículos Atendidos/Dia** | 100-200 | Count(Tickets por dia) |
| **Precisão da Balança** | ±50kg | Aferição INMETRO semestral |

### Integração entre Sistemas

- **AxTon (Desktop):** Interface de pesagem em tempo real no posto
- **AxHub (Web):** Relatórios, consultas, gestão de contratos
- **Sincronização:** AxTon envia tickets para AxHub a cada 5 minutos

---

## 🚦 Processo 3: Monitoramento Online (AxCross)

### Informações Gerais

- **Sistema:** AxCross
- **Tipo:** Real-time Event Processing
- **Duração Média:** < 5 segundos (passagem → alerta)
- **Volume:** 10k-100k passagens/dia
- **Automação:** 95% automatizado
- **Cor de Identificação:** #f97316 (Laranja)

### Descrição

Fluxo de cruzamento de placas em tempo real - da passagem do veículo monitorado até o disparo de alertas para operadores. Sistema crítico para segurança pública (veículos roubados, mandados de prisão, etc.).

### Diagrama BPM

```
[Passagem] → [OCR] → [Cruzamento] → [Match/Alerta] → [Notificação] → [Ação] → [Registro]
     ↓         ↓           ↓              ↓               ↓            ↓          ↓
  Câmera    Engine    SignalR         Sistema         Dashboard    Campo       BD
```

### Etapas Detalhadas

#### 1️⃣ Passagem (Captura)
- **Ator:** Equipamento (Câmera OCR)
- **Tipo:** 🟢 Automático
- **Descrição:** Veículo passa por ponto de monitoramento:
  - Câmera captura imagem da placa
  - Metadados: data/hora, local (coordenadas), sentido (entrada/saída)
  - Imagem de contexto (veículo completo)
- **Output:** Imagem + metadados
- **Latência:** < 500ms
- **Local:** Campo (ponto de monitoramento)

#### 2️⃣ Reconhecimento OCR
- **Ator:** Sistema (Engine OCR)
- **Tipo:** 🟢 Automático
- **Descrição:** Placa é processada:
  - Detecção da região da placa
  - Reconhecimento dos caracteres
  - Validação do padrão (AAA-0000 ou AAA-0A00)
  - Score de confiança (0-100%)
- **Output:** Placa reconhecida + confiança
- **Tempo:** < 2 segundos
- **Tecnologia:** TensorFlow Lite (edge) ou Cloud API

#### 3️⃣ Cruzamento (Matching)
- **Ator:** Sistema (SignalR + Database)
- **Tipo:** 🟢 Automático (Real-time)
- **Descrição:** Placa é comparada em tempo real com bases:
  - **Base de Veículos Monitorados:** Veículos sob vigilância
  - **Tipos de ocorrência:**
    - 🚗 Furto/Roubo
    - 👮 Mandado de Prisão
    - 💰 Dívidas (IPVA, multas)
    - 🚨 Alerta personalizado
  - Query SQL otimizada (índice em placa)
- **Output:** Match (sim/não) + detalhes da ocorrência
- **Latência:** < 1 segundo
- **Local no Sistema:** Backend (SignalR Hub)

#### 4️⃣ Match/Alerta (Disparo)
- **Ator:** Sistema
- **Tipo:** 🟢 Automático
- **Descrição:** Se placa consta na base, alerta é disparado:
  - Tipo de alerta (cor: vermelho crítico, laranja médio, amarelo baixo)
  - Dados do veículo (proprietário, modelo, cor)
  - Detalhes da ocorrência (número do BO, data do furto)
  - Localização atual (mapa)
  - Imagens capturadas
- **Output:** Alerta em tempo real
- **Priorização:** Alertas críticos (roubo, mandado) têm prioridade

#### 5️⃣ Notificação (Dashboard)
- **Ator:** Sistema → Operador
- **Tipo:** 🟡 Semiautomático
- **Descrição:** Operador recebe alerta no painel de monitoramento:
  - **Visual:** Card vermelho pulsante
  - **Sonoro:** Beep de alerta (configurável)
  - **Informações exibidas:**
    - Placa + foto do veículo
    - Tipo de ocorrência
    - Local de detecção (mapa)
    - Histórico de passagens recentes
  - Operador **deve acknowledg**e o alerta (marcar como visualizado)
- **Output:** Alerta visualizado
- **Local no Sistema:** `Monitoramento Online → Mapa`
- **SLA:** Operador deve visualizar em < 30 segundos

#### 6️⃣ Ação (Campo)
- **Ator:** Operador + Equipe de Campo
- **Tipo:** 🔵 Manual
- **Descrição:** Operador aciona equipe de campo:
  - **Radio/Telefone:** Contato com viatura mais próxima
  - **Coordenadas:** Envia localização exata do veículo
  - **Briefing:** Tipo de ocorrência, cuidados (veículo pode estar armado)
  - **Abordagem:** Equipe de campo aborda o veículo
  - **Resultado:**
    - ✅ Veículo recuperado → registrar ocorrência
    - ❌ Não localizado → registrar tentativa
- **Output:** Resultado da ação
- **Local:** Campo (rua, rodovia)

#### 7️⃣ Registro (Auditoria)
- **Ator:** Sistema + Operador
- **Tipo:** 🟡 Semiautomático
- **Descrição:** Passagem e ação são registradas:
  - **No sistema AxCross:** 
    - Passagem com flag de alerta
    - Resultado da ação (recuperado, não localizado, falso positivo)
  - **No B.O. (se aplicável):** Número do Boletim de Ocorrência
  - **Estatísticas:**
    - Taxa de recuperação
    - Tempo resposta (alerta → abordagem)
- **Output:** Registro completo para auditoria
- **Local no Sistema:** `Relatórios → Ocorrências e Alertas`

### KPIs do Processo

| Métrica | Meta | Cálculo |
|---------|------|---------|
| **Latência (Passagem → Alerta)** | < 5s | Timestamp_Alerta - Timestamp_Passagem |
| **Taxa de Recuperação** | > 30% | (Veículos_Recuperados / Alertas_Críticos) × 100 |
| **Tempo de Resposta (Campo)** | < 15 min | Timestamp_Abordagem - Timestamp_Alerta |
| **Taxa de Falsos Positivos** | < 5% | (Falsos_Positivos / Total_Alertas) × 100 |
| **Uptime do Sistema** | > 99.5% | (Tempo_Online / Tempo_Total) × 100 |

### Arquitetura Técnica

**Backend:**
- **SignalR Hub:** Comunicação real-time entre backend e frontend
- **SQL Server:** Banco otimizado com índices em placa
- **Redis Cache:** Cache de veículos monitorados (acesso rápido)

**Frontend:**
- **React + SignalR Client:** Recebe push de alertas
- **Mapa Interativo:** Leaflet/Google Maps com camadas de alertas

**Performance:**
- **Consultas/segundo:** Suporta até 1000 consultas/s
- **Concurrent Users:** 50+ operadores simultâneos

---

## 📏 Processo 4: Medição Contratual

### Informações Gerais

- **Sistema:** AxHub
- **Tipo:** Periodic Business Process
- **Frequência:** Mensal
- **Duração:** 2-5 dias (preparação + revisão)
- **Automação:** 70% automatizado
- **Cor de Identificação:** #8b5cf6 (Roxo)

### Descrição

Fluxo de medição de performance dos equipamentos para faturamento - do contrato até a medição final aprovada. Processo crítico para receita da empresa e contratos de longo prazo.

### Diagrama BPM

```
[Contrato] → [Índices] → [Coleta Automática] → [Interrupções] → [Criar Medição] → [Revisão] → [Finalização]
    ↓           ↓               ↓                    ↓                 ↓              ↓             ↓
  Setup      Config          Cron               Operador          Sistema        Gerente      Financeiro
```

### Etapas Detalhadas

#### 1️⃣ Contrato (Setup Inicial)
- **Ator:** Gerente de Contratos
- **Tipo:** 🔵 Manual (One-time)
- **Descrição:** Cadastro do contrato de medição:
  - Cliente/Órgão
  - Vigência (data início/fim)
  - Equipamentos vinculados (lista)
  - Valor mensal base
  - Cláusulas de desconto (por indisponibilidade)
- **Output:** Contrato ativo
- **Local no Sistema:** `Medição → Contratos`
- **Frequência:** 1x por contrato

#### 2️⃣ Índices de Performance (KPIs)
- **Ator:** Gerente de Contratos
- **Tipo:** 🔵 Manual (Configuração)
- **Descrição:** Definição dos KPIs contratuais:
  - **Disponibilidade mínima:** Ex: 95% do tempo
  - **OCR mínimo:** Ex: 90% de acurácia
  - **Uptime esperado:** Ex: 22h/dia (2h para manutenção)
  - **Tolerâncias:** Eventos justificados não descontam
  - **Penalidades:** % de desconto por faixa de indisponibilidade
- **Output:** KPIs configurados
- **Local no Sistema:** `Medição → Índices de Performance`
- **Exemplo de Penalidade:**
  - Disponibilidade 90-95%: 5% desconto
  - Disponibilidade 85-90%: 10% desconto
  - Disponibilidade < 85%: 20% desconto

#### 3️⃣ Coleta Automática (Monitoramento)
- **Ator:** Sistema (Cron Job Diário)
- **Tipo:** 🟢 Automático
- **Descrição:** Sistema calcula métricas diárias para cada equipamento:
  - **Heartbeats:** Sinais de vida do equipamento (a cada 5 min)
  - **Passagens:** Quantidade de registros capturados
  - **Falhas:** Eventos de offline, sem comunicação, sem imagem
  - **Disponibilidade:** (Tempo_Online / Tempo_Total) × 100
  - **OCR:** (Placas_Corretas / Placas_Lidas) × 100
- **Output:** Métricas diárias por equipamento
- **Frequência:** Diária (23:59)
- **Storage:** Tabela `MetricasDiarias`

#### 4️⃣ Registrar Interrupções (Justificativas)
- **Ator:** Operador/Técnico
- **Tipo:** 🔵 Manual
- **Descrição:** Registro de eventos que justificam indisponibilidade:
  - **Tipos de interrupção:**
    - 🔧 Manutenção preventiva (agendada)
    - ⚡ Queda de energia (força maior)
    - 🔨 Vandalismo/Roubo
    - 🌩️ Eventos climáticos extremos
    - 🛠️ Manutenção corretiva (emergência)
  - **Dados necessários:**
    - Equipamento
    - Data/hora início e fim
    - Tipo de interrupção
    - Descrição detalhada
    - Evidências (fotos, B.O., relatório técnico)
- **Output:** Interrupção registrada (desconta da indisponibilidade)
- **Local no Sistema:** `Medição → Interrupções`
- **Validação:** Gerente deve aprovar interrupções

#### 5️⃣ Criar Medição (Geração)
- **Ator:** Gerente + Sistema
- **Tipo:** 🟡 Semiautomático
- **Descrição:** Gera medição do período (mês):
  1. **Sistema calcula automaticamente:**
     - Total de dias no período
     - Disponibilidade média de cada equipamento
     - Disponibilidade consolidada do contrato
     - Interrupções justificadas (desconsideradas)
     - Interrupções não justificadas (contam como indisponibilidade)
     - Penalidades aplicáveis
  2. **Gerente revisa:**
     - Valida se todas interrupções foram registradas
     - Ajusta manualmente se necessário (com justificativa)
     - Adiciona observações
  3. **Cálculo final:**
     ```
     Valor_Final = Valor_Base × (1 - Desconto_Indisponibilidade)
     ```
- **Output:** Medição em rascunho
- **Local no Sistema:** `Medição → Criar Medição`

#### 6️⃣ Revisão (Aprovação Interna)
- **Ator:** Gerente de Contratos
- **Tipo:** 🔵 Manual
- **Descrição:** Conferência detalhada dos valores:
  - Disponibilidade real vs mínima contratual
  - Penalidades aplicadas
  - Interrupções justificadas
  - Valor final calculado
  - Comparação com mês anterior (tendência)
  - **Ações possíveis:**
    - ✅ Aprovar → finaliza medição
    - 🔄 Revisar → volta para ajustes
    - ❌ Rejeitar → refaz do zero
- **Output:** Medição aprovada
- **Local no Sistema:** `Medição → Medições Finalizadas`
- **SLA:** Medição deve ser finalizada até dia 5 do mês seguinte

#### 7️⃣ Finalização (Faturamento)
- **Ator:** Gerente + Sistema
- **Tipo:** 🟡 Semiautomático
- **Descrição:** Medição aprovada gera outputs para faturamento:
  - **Relatório PDF:** Resumo executivo com gráficos
  - **Planilha Excel:** Detalhamento por equipamento/dia
  - **Exportação Financeira:** Integração com ERP (se aplicável)
  - **E-mail ao Cliente:** Envio automático da medição
  - **Status:** `FINALIZADA` (não editável)
- **Output:** Documentos de faturamento
- **Local no Sistema:** `Medição → Medições Finalizadas`
- **Arquivamento:** 5 anos (requisito contratual/fiscal)

### KPIs do Processo

| Métrica | Meta | Cálculo |
|---------|------|---------|
| **Prazo de Entrega** | Até dia 5 | Data_Finalização <= Dia_5_Mes_Seguinte |
| **Disponibilidade Média (Contratos)** | > 95% | Média(Disponibilidade_Equipamentos) |
| **Taxa de Penalidade** | < 5% | (Contratos_Com_Desconto / Total_Contratos) × 100 |
| **Interrupções Justificadas** | 80-90% | (Justificadas / Total_Interrupções) × 100 |

### Documentos Gerados

1. **Relatório Executivo (PDF):**
   - Resumo do contrato
   - Disponibilidade consolidada
   - Gráficos de tendência
   - Penalidades aplicadas
   - Assinatura digital

2. **Planilha Detalhada (Excel):**
   - Tabela por equipamento
   - Coluna por dia do mês
   - Métricas: disponibilidade, passagens, falhas
   - Interrupções destacadas

3. **Arquivo de Integração (JSON/XML):**
   - Para ERP da empresa
   - Valor a faturar
   - Centro de custo
   - Dados fiscais

---

## 💬 Processo 5: Atendimento Helpdesk (com IA)

### Informações Gerais

- **Sistema:** AxionIA + Jitbit
- **Tipo:** AI-Assisted Service Workflow
- **Duração Média:** 2-48 horas (dependendo da complexidade)
- **Volume:** 100-500 tickets/mês
- **Automação:** 80% (IA sugere resposta)
- **Cor de Identificação:** #ec4899 (Rosa)

### Descrição

Fluxo completo de atendimento ao cliente - do chamado até a resolução com assistência de IA. Sistema integra Jitbit (helpdesk externo) com engine de IA para classificação automática e sugestão de respostas baseada em Knowledge Base.

### Diagrama BPM

```
[Abertura] → [Polling] → [Classificação IA] → [Busca KB] → [Gerar Resposta] → [Fila Revisão] → [Envio] → [SLA]
     ↓          ↓              ↓                   ↓              ↓                  ↓             ↓         ↓
  Cliente    Cron           Engine            Embeddings        GPT-4o           Técnico       Jitbit    Dashboard
```

### Etapas Detalhadas

#### 1️⃣ Abertura (Cliente)
- **Ator:** Cliente
- **Tipo:** 🔴 Externo
- **Descrição:** Cliente abre chamado via múltiplos canais:
  - **E-mail:** Envia para suporte@axiontecnologia.com.br → Jitbit cria ticket
  - **Portal Jitbit:** Cliente acessa portal web e cria ticket manual
  - **WhatsApp:** Mensagem no bot WhatsApp → cria ticket automático
  - **Telefone:** Atendente cria ticket manualmente
- **Informações obrigatórias:**
  - Assunto (título do problema)
  - Descrição detalhada
  - Contato (e-mail, telefone)
- **Informações opcionais:**
  - Site afetado
  - Anexos (prints, logs)
  - Urgência
- **Output:** Ticket criado no Jitbit com ID único
- **Local:** Jitbit Helpdesk
- **Notificação:** E-mail de confirmação ao cliente

#### 2️⃣ Polling (Sincronização)
- **Ator:** Sistema (Cron Job)
- **Tipo:** 🟢 Automático
- **Descrição:** AxionIA faz polling no Jitbit a cada 2 minutos:
  - **API Jitbit:** GET `/api/Tickets?mode=0&count=50` (não respondidos)
  - **Filtros:**
    - Status: "Novo" ou "Aguardando resposta"
    - Sem resposta da Axion nos últimos 30 minutos
  - **Sincronização:** Tickets novos são importados para banco local
- **Output:** Tickets não respondidos no sistema
- **Frequência:** A cada 2 minutos
- **Logs:** `Logs → Polling Helpdesk`

#### 3️⃣ Classificação IA (Engine)
- **Ator:** IA (Classifier)
- **Tipo:** 🟢 Automático
- **Descrição:** Engine classifica o ticket:
  - **Produto:** AxHub, AxTon, AxCross, ou Geral
  - **Categoria:** Dúvida, Problema Técnico, Solicitação, Bug, Feature Request
  - **Prioridade:** Baixa, Normal, Alta, Crítica
  - **Site:** Se mencionado, identifica qual contrato
  - **Módulo:** Infrações, Medição, Pesagem, Monitoramento, etc.
- **Tecnologia:**
  - Modelo: Fine-tuned GPT-3.5 ou classificador custom
  - Input: Assunto + Descrição do ticket
  - Output: Labels de classificação + confiança (0-1)
- **Tempo:** < 5 segundos
- **Local no Sistema:** `Helpdesk → Classificar`

#### 4️⃣ Busca na Knowledge Base (Embeddings)
- **Ator:** IA (Semantic Search)
- **Tipo:** 🟢 Automático
- **Descrição:** IA busca resposta similar na Knowledge Base:
  - **Método:** Cosine similarity entre embeddings
  - **Base:** 200+ perguntas e respostas pré-cadastradas
  - **Threshold:** Score > 0.7 para considerar match
  - **Resultado:**
    - ✅ Match encontrado → usa resposta da KB
    - ❌ Sem match → gera resposta nova com GPT
- **Tecnologia:**
  - Embeddings: text-embedding-ada-002 (OpenAI)
  - Vector database: Array local ou Pinecone
  - Busca: Numpy/FAISS para cosine similarity
- **Tempo:** < 2 segundos
- **Acurácia:** ~70% dos tickets tem match na KB

#### 5️⃣ Geração de Resposta (GPT)
- **Ator:** IA (GPT-4o)
- **Tipo:** 🟢 Automático
- **Descrição:** Sistema gera resposta:
  - **Se KB match:**
    - Usa resposta existente
    - Personaliza com dados do ticket (nome do cliente, site)
  - **Se sem match:**
    - GPT-4o gera resposta nova
    - Context: Documentação do produto, FAQs, manuais
    - Tom: Profissional, cordial, objetivo
  - **Validações:**
    - Resposta > 50 caracteres
    - Não contém informações sensíveis (senhas, chaves API)
    - Formato adequado (com saudação e despedida)
- **Output:** Resposta sugerida
- **Tempo:** 5-15 segundos (GPT)
- **Custo:** ~$0.02 por resposta (GPT-4o)

#### 6️⃣ Fila de Revisão (Humano-in-the-loop)
- **Ator:** Técnico de Suporte
- **Tipo:** 🔵 Manual
- **Descrição:** Resposta sugerida vai para aprovação:
  - **Interface:** Painel com ticket original + resposta sugerida
  - **Ações possíveis:**
    - ✅ **Aprovar:** Envia resposta como está
    - ✏️ **Editar:** Técnico ajusta resposta e aprova
    - ❌ **Rejeitar:** Descarta e escreve resposta manual
    - 🔄 **Regenerar:** Pede nova sugestão à IA
  - **Feedback para IA:** Edições são logadas para retreinar modelo
- **Output:** Resposta aprovada
- **Local no Sistema:** `Helpdesk → Fila de Revisão`
- **SLA Interno:** Revisar em até 4 horas

#### 7️⃣ Envio (Publicação)
- **Ator:** Sistema
- **Tipo:** 🟢 Automático
- **Descrição:** Após aprovação, resposta é enviada:
  - **API Jitbit:** POST `/api/Comment` com texto da resposta
  - **Comentário público:** Cliente vê a resposta
  - **Atualização status:** Ticket marcado como "Respondido"
  - **Notificação:** Cliente recebe e-mail automático do Jitbit
  - **Registro:** Log de envio salvo (timestamp, técnico, resposta)
- **Output:** Ticket respondido
- **Tempo:** < 2 segundos
- **Confirmação:** API retorna status 200

#### 8️⃣ SLA (Monitoramento)
- **Ator:** Sistema
- **Tipo:** 🟢 Automático (Dashboard)
- **Descrição:** Métricas de SLA são calculadas:
  - **Tempo de primeira resposta:** Abertura → Primeira resposta
  - **Tempo de resolução:** Abertura → Fechamento
  - **SLAs por prioridade:**
    - Crítica: 4 horas (primeira resposta), 24 horas (resolução)
    - Alta: 8 horas, 48 horas
    - Normal: 24 horas, 5 dias
    - Baixa: 48 horas, 10 dias
  - **Compliance:** % de tickets dentro do SLA
- **Output:** Dashboard de métricas
- **Local no Sistema:** `SLA Compliance`
- **Relatórios:** Semanais para gerência

### KPIs do Processo

| Métrica | Meta | Cálculo |
|---------|------|---------|
| **Taxa de Aprovação IA** | > 70% | (Respostas_Aprovadas / Total_Sugeridas) × 100 |
| **Tempo Médio de Resposta** | < 4h | Média(Timestamp_Resposta - Timestamp_Abertura) |
| **SLA Compliance** | > 90% | (Tickets_Dentro_SLA / Total_Tickets) × 100 |
| **Taxa de Retrabalho** | < 10% | (Tickets_Reabertos / Total_Fechados) × 100 |
| **Satisfação do Cliente** | > 4.5/5 | Média(Avaliações_Clientes) |

### Benefícios da IA

- **Velocidade:** Resposta sugerida em < 20 segundos vs. 10-30 minutos manual
- **Consistência:** Respostas padronizadas e profissionais
- **Escalabilidade:** Suporta 10x mais tickets sem aumentar equipe
- **Aprendizado:** Modelo melhora com feedback dos técnicos
- **Custo:** Reduz ~60% do tempo de técnicos

---

## 🔧 Processo 6: Operação de Equipamento

### Informações Gerais

- **Sistema:** AxHub
- **Tipo:** Equipment Lifecycle Management
- **Duração:** Contínua (ciclo de vida do equipamento)
- **Automação:** 50% automatizado
- **Cor de Identificação:** #f59e0b (Amarelo)

### Descrição

Fluxo de cadastro e gestão de operações de equipamentos de campo - da instalação até monitoramento contínuo e manutenção.

### Etapas Detalhadas

#### 1️⃣ Cadastro de Equipamento
- **Descrição:** Registro inicial com dados técnicos
- **Output:** Equipamento cadastrado no sistema

#### 2️⃣ Aferição
- **Descrição:** Certificação INMETRO
- **Output:** Certificado válido registrado

#### 3️⃣ Cadastro de Operação
- **Descrição:** Vincular equipamento a local específico
- **Output:** Operação configurada

#### 4️⃣ Ativação
- **Descrição:** Equipamento começa a operar
- **Output:** Status ATIVO

#### 5️⃣ Monitoramento
- **Descrição:** Acompanhamento em tempo real
- **Output:** Heartbeats e métricas

#### 6️⃣ Eventos
- **Descrição:** Registro de falhas e incidentes
- **Output:** Log de eventos

#### 7️⃣ Manutenção
- **Descrição:** Ação corretiva ou preventiva
- **Output:** Equipamento normalizado

---

## 🔗 Integrações entre Processos

### Mapa de Integração

```
Infração -----(gera)-----> Medição
   ↓
   └--(usa)--> Operação Equipamento

Pesagem -----(gera)-----> Medição

Monitoramento -----(usa)--> Equipamento

Helpdesk -----(suporta)--> TODOS

Medição -----(usa)--> Equipamento
```

### Dados Compartilhados

| Dado | Origem | Destino | Uso |
|------|--------|---------|-----|
| **Passagens** | Infração | Medição | Calcular disponibilidade |
| **Heartbeats** | Equipamento | Medição | Verificar uptime |
| **Eventos** | Equipamento | Medição | Justificar interrupções |
| **Tickets** | Helpdesk | Medição | Incidentes reportados |
| **Alertas** | Monitoramento | Helpdesk | Problemas em equipamentos |

---

## 📊 KPIs Consolidados do Ecossistema

### Performance Operacional

| KPI | Meta | Frequência | Sistema |
|-----|------|------------|---------|
| **Disponibilidade Equipamentos** | > 95% | Diária | AxHub |
| **Acurácia OCR** | > 95% | Diária | AxHub/AxCross |
| **Tempo Médio Triagem** | < 20s/infração | Diária | AxHub |
| **SLA Helpdesk** | > 90% compliance | Semanal | AxionIA |
| **Taxa Recuperação (AxCross)** | > 30% | Mensal | AxCross |
| **Tempo Pesagem** | < 10 min/veículo | Diária | AxTon |

### Qualidade

| KPI | Meta | Frequência |
|-----|------|------------|
| **Auditoria Infrações** | > 95% conformidade | Mensal |
| **Taxa Falsos Positivos** | < 5% | Semanal |
| **Retrabalho Tickets** | < 10% | Mensal |

### Financeiro

| KPI | Meta | Frequência |
|-----|------|------------|
| **Medições no Prazo** | 100% até dia 5 | Mensal |
| **Taxa de Penalidade** | < 5% contratos | Mensal |
| **Custo por Ticket (IA)** | < $0.10 | Mensal |

---

## 🎓 Glossário BPM

### Termos Técnicos

**BPM (Business Process Management):** Gestão de processos de negócio - disciplina que usa métodos para descobrir, modelar, analisar, medir, melhorar e otimizar processos.

**BPMN (Business Process Model and Notation):** Notação gráfica padronizada para modelar processos de negócio.

**SLA (Service Level Agreement):** Acordo de nível de serviço - compromisso contratual de tempo/qualidade.

**KPI (Key Performance Indicator):** Indicador-chave de desempenho - métrica quantificável de sucesso.

**OCR (Optical Character Recognition):** Reconhecimento óptico de caracteres - tecnologia que extrai texto de imagens.

**Heartbeat:** Sinal periódico enviado por equipamento para indicar que está operacional.

**Throughput:** Taxa de processamento - quantidade de itens processados por unidade de tempo.

**Latência:** Tempo de resposta entre um evento e sua reação.

### Termos de Negócio

**Triagem:** Processo de análise e validação manual de infrações.

**Auditoria:** Revisão por amostragem para garantir qualidade.

**Medição:** Processo de cálculo de disponibilidade para faturamento.

**Exceção:** Infração que não deve gerar auto (whitelist, tolerâncias).

**Transbordo:** Retirada de parte da carga para adequar peso ao permitido.

**Match:** Quando placa monitorada é identificada em passagem.

**Polling:** Busca periódica por atualizações em sistema externo.

---

## 📚 Referências e Documentação Complementar

### Documentos Relacionados

1. **Manual do Usuário AxHub** → `http://localhost:3010/AxHub.Docs`
2. **Manual do Usuário AxTon** → `http://localhost:3011/AxTon.Docs`
3. **Manual do Usuário AxCross** → `http://localhost:3012/AxCross.Docs`
4. **Arquitetura do Sistema** → Ver documentação técnica
5. **API Reference** → Ver Swagger em cada sistema

### Contratos e SLAs

- **Template de Contrato de Medição** → Departamento Comercial
- **SLAs Padrão por Tipo de Contrato** → `Medição → Índices de Performance`
- **Política de Helpdesk** → Knowledge Base

### Treinamentos

- **Operador de Triagem:** 8 horas (presencial)
- **Auditor de Qualidade:** 16 horas (presencial + online)
- **Gerente de Medição:** 24 horas (presencial + prático)
- **Técnico de Suporte:** 40 horas (completo)

---

## 🔄 Controle de Versões

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | 2026-06-22 | GitHub Copilot | Versão inicial completa |

---

## 📞 Contatos

**Documentação Técnica:**  
- E-mail: docs@axiontecnologia.com.br  
- Portal: https://docs.axiontecnologia.com.br

**Suporte Técnico:**  
- E-mail: suporte@axiontecnologia.com.br  
- Telefone: (62) 3XXX-XXXX  
- WhatsApp: (62) 9XXXX-XXXX

**Comercial (Contratos):**  
- E-mail: comercial@axiontecnologia.com.br

---

**© 2026 Axion Tecnologia — Todos os direitos reservados**

**Documento:** DOCUMENTACAO-BPM-COMPLETA.md  
**Sistema:** Axion IA - Ecossistema  
**Classificação:** Uso Interno / Confidencial

---

## ✅ Checklist de Uso

Este documento serve para:

- [x] Treinamento de novos colaboradores
- [x] Auditoria de processos
- [x] Melhoria contínua (identificar gargalos)
- [x] Padronização de operações
- [x] Base para automações futuras
- [x] Documentação para certificações (ISO 9001)
- [x] Alinhamento com clientes (transparência operacional)

**FIM DA DOCUMENTAÇÃO BPM** 📐✅
