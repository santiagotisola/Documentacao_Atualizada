---
sidebar_position: 99
title: Roteiros para Vídeos Explicativos
description: Scripts e estrutura de vídeos de treinamento para cada módulo do AxHub — guia completo para operadores, triadores, auditores e gestores
---

# Roteiros para Vídeos Explicativos — AxHub

Este documento estrutura os **roteiros de vídeo de treinamento** de cada módulo do AxHub.  
Cada vídeo segue o mesmo padrão: **contexto → onde está → o que fazer → dicas práticas**.

---

## 🎬 Padrão de estrutura de cada vídeo

```
[00:00] INTRODUÇÃO — "Neste vídeo você vai aprender a..."
[00:15] ONDE ACESSAR — Caminho no menu lateral
[00:30] O QUE É — Explicação simples do que essa tela faz
[01:00] PASSO A PASSO — Demonstração da operação principal
[02:30] DICAS E ATENÇÕES — Erros comuns e boas práticas
[03:00] RESUMO — "Neste vídeo aprendemos..."
```

**Duração média recomendada:** 3 a 5 minutos por vídeo.

---

## 📋 Mapa completo de vídeos por módulo

| # | Vídeo | Perfil alvo | Duração est. |
|---|-------|-------------|--------------|
| V01 | Login e Primeiro Acesso | Todos | 3 min |
| V02 | Dashboard — Lendo os Indicadores | Todos | 4 min |
| V03 | Monitoramento Online | Operador | 5 min |
| V04 | Triagem de Infrações | Triador | 6 min |
| V05 | Auditoria de Infrações | Auditor | 5 min |
| V06 | Lote de Exportação | Op. Exportação | 5 min |
| V07 | Exceções — Como configurar regras | Supervisor | 6 min |
| V08 | Consulta de Infrações | Todos | 4 min |
| V09 | Infrações Descartadas | Auditor | 3 min |
| V10 | Aferição de Equipamentos | Técnico | 4 min |
| V11 | Eventos de Equipamentos | Técnico | 3 min |
| V12 | Cadastro de Equipamentos | Admin | 4 min |
| V13 | Arcos e Faixas | Admin | 5 min |
| V14 | Contratos e Medições | Gestor | 6 min |
| V15 | Índices de Performance | Gestor | 4 min |
| V16 | Interrupções de Operação | Gestor | 4 min |
| V17 | Enquadramentos do CTB | Admin | 3 min |
| V18 | Exceções por Placa e Veículo | Supervisor | 5 min |
| V19 | Cronotacógrafo — Consulta e Triagem | Triador | 4 min |
| V20 | Controle de Acesso — Usuários e Perfis | Admin | 5 min |
| V21 | Permissões de Acesso — Configurando perfis | Admin | 5 min |
| V22 | Acessos por IP e Horário | Admin | 3 min |
| V23 | Log de Acesso — Auditoria de usuários | Admin | 3 min |
| V24 | Relatórios — Visão geral | Todos | 5 min |
| V25 | Lote de Importação — Relatórios | Gestor | 3 min |

---

## 🎥 V01 — Login e Primeiro Acesso

**Perfil:** Todos os usuários  
**Permissão necessária:** nenhuma (tela pública)

### Roteiro

**[00:00] INTRODUÇÃO**
> "Olá! Bem-vindo ao AxHub. Neste vídeo você vai aprender como fazer o primeiro acesso ao sistema e navegar pela tela inicial."

**[00:15] ONDE ACESSAR**
> "Abra o navegador e acesse o endereço fornecido pelo seu administrador. Você verá a tela de login."

**[00:30] O QUE FAZER**
> "Digite seu login e senha. Caso seja o primeiro acesso, você receberá um e-mail com a senha temporária — troque-a imediatamente."
- Mostrar tela de login
- Digitar usuário e senha
- Mostrar redirecionamento ao Dashboard

**[01:30] DICAS**
> "Nunca compartilhe sua senha. Cada ação no sistema fica registrada com o seu usuário no Log de Acesso."

**[02:00] RESUMO**
> "Você aprendeu a acessar o AxHub. No próximo vídeo, vamos entender o Dashboard."

---

## 🎥 V02 — Dashboard — Lendo os Indicadores

**Perfil:** Todos  
**Permissões relacionadas:** `dashboard.*`

### Roteiro

**[00:00] INTRODUÇÃO**
> "O Dashboard é a primeira tela que você vê após o login. Aqui você encontra os principais indicadores da operação em tempo real."

**[00:20] ONDE ACESSAR**
> "Menu lateral → Dashboard. Esta tela é atualizada automaticamente."

**[00:40] O QUE É CADA INDICADOR**
> "Vamos ver cada painel:"
- 📊 **Status dos Equipamentos:** mostra quais câmeras estão online e offline agora
- 📷 **Imagens Capturadas:** quantas fotos foram tiradas pelos equipamentos hoje
- ✅ **Taxa de Aproveitamento:** percentual de imagens com leitura OCR válida
- 🗑️ **Top Motivos de Descarte:** por que infrações estão sendo descartadas
- 📅 **Heatmap Hora/Semana:** em quais dias e horários há mais infrações
- ⚠️ **Últimos Eventos:** falhas recentes nos equipamentos

**[02:30] DICAS**
> "O indicador de Status dos Equipamentos é o primeiro que você deve verificar ao iniciar o turno. Se uma câmera estiver offline, nenhuma infração será capturada por ela."

**[03:00] RESUMO**
> "Você aprendeu a ler o Dashboard. Agora vamos ver como monitorar as passagens em tempo real."

---

## 🎥 V03 — Monitoramento Online

**Perfil:** Operador de Monitoramento  
**Permissões:** `monitoramento.index`, `monitoramento.atualizaplaca`

### Roteiro

**[00:00] INTRODUÇÃO**
> "O Monitoramento Online permite acompanhar as passagens dos veículos em tempo real e corrigir leituras de placa quando necessário."

**[00:20] ONDE ACESSAR**
> "Menu lateral → Operações → Monitoramento Online"

**[00:40] O QUE VOCÊ VÊ**
> "Esta tela exibe cada passagem registrada pelos equipamentos:"
- Data e hora da passagem
- Faixa e equipamento
- Imagem do veículo
- Placa lida pelo OCR

**[01:30] COMO CORRIGIR UMA PLACA**
> "Se o OCR leu a placa errada, você pode corrigir:"
1. Clique na passagem
2. Clique em **Digitar Placa**
3. Informe a placa correta
4. Confirme

**[02:30] DICAS**
> "Corrija apenas quando tiver certeza visual — compare com a imagem capturada. Toda correção fica registrada com seu usuário."

**[03:30] RESUMO**
> "Você aprendeu a monitorar passagens e corrigir placas. No próximo vídeo: triagem de infrações."

---

## 🎥 V04 — Triagem de Infrações

**Perfil:** Agente de Triagem  
**Permissões:** `consultainfracao.index`, `.datahandlerdetail`, `.obterimagensinfracaoo`, `.descartarinfracao`

### Roteiro

**[00:00] INTRODUÇÃO**
> "A triagem é o processo de revisar cada infração capturada e decidir se ela é válida ou deve ser descartada. É a primeira linha de qualidade do processo."

**[00:20] ONDE ACESSAR**
> "Menu lateral → Infrações → Triagem"

**[00:45] O QUE É UMA INFRAÇÃO**
> "Uma infração é gerada automaticamente quando um veículo passa por um equipamento configurado. O sistema captura a imagem e lê a placa. Cabe ao triador verificar se tudo está correto."

**[01:30] O QUE VERIFICAR EM CADA INFRAÇÃO**
> "Ao abrir uma infração, confira:"
- ✅ A **placa** está legível e correta?
- ✅ A **imagem** mostra claramente o veículo?
- ✅ O **enquadramento** (tipo de infração) está correto?
- ✅ A **data e hora** são coerentes?
- ✅ O **equipamento e faixa** estão corretos?

**[02:30] COMO DESCARTAR**
> "Se algo estiver errado:"
1. Clique em **Descartar**
2. Selecione o **Motivo do Descarte**
3. Confirme

**[03:00] DICAS**
> "Nunca descarte uma infração sem selecionar o motivo correto. O sistema usa esses dados para o relatório de Top Motivos de Descarte do Dashboard."

**[04:00] RESUMO**
> "Você aprendeu a triar infrações. O próximo passo é a auditoria — que verifica o trabalho da triagem."

---

## 🎥 V05 — Auditoria de Infrações

**Perfil:** Auditor  
**Permissões:** `auditoria.index`, `auditoria.auditar`, `auditoria.processarlote`

### Roteiro

**[00:00] INTRODUÇÃO**
> "A auditoria é a segunda verificação das infrações. Após a triagem, o auditor revisa e aprova as infrações antes delas serem exportadas para o órgão de trânsito."

**[00:25] ONDE ACESSAR**
> "Menu lateral → Infrações → Auditoria"

**[00:45] DIFERENÇA ENTRE TRIAGEM E AUDITORIA**
> "A triagem descarta infrações com problemas técnicos. A auditoria confirma que as infrações restantes têm base legal para serem lavradas."

**[01:30] AUDITAR UMA INFRAÇÃO INDIVIDUAL**
1. Abra a infração
2. Verifique imagem, placa, enquadramento
3. Clique em **Aprovar** ou **Rejeitar**

**[02:30] PROCESSAR LOTE**
> "Para aprovar várias infrações de uma vez:"
1. Filtre as infrações do período
2. Verifique uma amostra
3. Clique em **Processar Lote**
4. Confirme a operação

**[03:00] ⚠️ ATENÇÃO**
> "Processar um lote afeta centenas de infrações simultaneamente. Certifique-se de que a amostra verificada é representativa antes de confirmar."

**[04:00] RESUMO**
> "Você aprendeu a auditar infrações. Após a auditoria, as infrações ficam prontas para exportação."

---

## 🎥 V06 — Lote de Exportação

**Perfil:** Operador de Exportação  
**Permissões:** `loteexportacao.*`

### Roteiro

**[00:00] INTRODUÇÃO**
> "O Lote de Exportação é o processo de enviar as infrações auditadas para o órgão de trânsito (DETRAN, SENATRAN, etc.)."

**[00:25] ONDE ACESSAR**
> "Menu lateral → Infrações → Lote de Exportação"

**[00:45] ENTENDENDO OS STATUS DO LOTE**
> "Cada lote tem um status que indica em que etapa está:"

| Status | Significado |
|--------|-------------|
| **Criado** | Lote gerado, ainda não enviado |
| **Processando** | Envio em andamento |
| **Enviado** | Lote enviado com sucesso |
| **Erro** | Falha no envio — ação necessária |
| **Cancelado** | Lote cancelado antes do envio |

**[01:30] CRIAR NOVO LOTE**
1. Clique em **Novo Lote**
2. Selecione o período e tipo de infração
3. Confirme a criação
4. Aguarde o processamento

**[02:30] O QUE FAZER SE HOUVER ERRO**
> "Se o lote ficou com status 'Erro':"
1. Clique em **Tentar Novamente** para reenviar
2. Se o problema persistir, use **Finalizar e Reenviar Novo Lote**
3. Em último caso, chame o administrador para **Forçar Encerramento**

**[03:30] RESUMO**
> "Você aprendeu a gerenciar lotes de exportação. Este é o último passo do ciclo de infrações."

---

## 🎥 V07 — Exceções — Como configurar regras

**Perfil:** Supervisor / Administrador  
**Permissões:** `excecao.*`

### Roteiro

**[00:00] INTRODUÇÃO**
> "Exceções são regras que impedem a geração de infrações para situações específicas — por placa, horário, faixa ou enquadramento. Use com responsabilidade."

**[00:25] ONDE ACESSAR**
> "Menu lateral → Infrações → Exceções"

**[00:45] TIPOS DE EXCEÇÃO DISPONÍVEIS**
> "O sistema permite criar exceções por:"

| Tipo | Exemplo de uso |
|------|----------------|
| **Por Placa** | Viatura policial, veículo de emergência |
| **Por Veículo** | Categoria específica isenta |
| **Por Faixa** | Faixa em manutenção |
| **Por Horário** | Isento em horário noturno |
| **Por Data** | Feriado nacional |
| **Por Enquadramento** | Tipo de infração suspensa por decisão judicial |

**[01:30] COMO CRIAR EXCEÇÃO POR PLACA**
1. Clique em **Novo**
2. Selecione o tipo **Por Placa**
3. Informe a placa
4. Defina o período de vigência
5. Salve

**[02:30] ⚠️ ATENÇÃO CRÍTICA**
> "Uma exceção ativa impede a geração de multas. Documente sempre o motivo e defina uma data de fim para a regra. Nunca use **Excluir Todas as Placas** sem autorização expressa da supervisão."

**[03:30] RESUMO**
> "Você aprendeu a criar exceções. Lembre-se: cada exceção deve ser justificada e monitorada."

---

## 🎥 V08 — Consulta de Infrações

**Perfil:** Todos  
**Permissões:** `consultainfracao.index`, `.datahandlerdetail`, `.obterimagensinfracaoo`

### Roteiro

**[00:00] INTRODUÇÃO**
> "A Consulta de Infrações permite pesquisar qualquer infração gerada pelo sistema, com imagem e todos os detalhes."

**[00:20] ONDE ACESSAR**
> "Menu lateral → Infrações → Consultar Infrações"

**[00:40] FILTROS DISPONÍVEIS**
- Data e hora
- Placa do veículo
- Equipamento e faixa
- Status (triada, auditada, exportada, descartada)
- Número da infração

**[01:30] ABRINDO UMA INFRAÇÃO**
> "Clique na infração para ver:"
- Imagens capturadas (frente, traseira, zoom da placa)
- Dados do veículo
- Enquadramento e artigo do CTB
- Histórico de ações (quem triou, auditou, exportou)

**[02:30] DICAS**
> "Use os filtros de data + placa para localizar rapidamente uma infração específica quando receber questionamentos do órgão de trânsito."

---

## 🎥 V10 — Aferição de Equipamentos

**Perfil:** Técnico de Campo  
**Permissões:** `afericao.index`, `afericao.new`, `afericao.edit`, `afericao.alertasvencimento`

### Roteiro

**[00:00] INTRODUÇÃO**
> "A aferição é a certificação de que o equipamento está medindo corretamente. É exigência legal do INMETRO para equipamentos de fiscalização de trânsito."

**[00:20] ONDE ACESSAR**
> "Menu lateral → Operações → Aferições"

**[00:40] O QUE É UMA AFERIÇÃO**
> "Periodicamente, cada equipamento precisa ser testado por um laboratório credenciado. O resultado é registrado no sistema."

**[01:00] REGISTRAR NOVA AFERIÇÃO**
1. Clique em **+ Novo**
2. Selecione o equipamento
3. Informe a data de aferição
4. Informe a data de vencimento
5. Anexe o certificado
6. Salve

**[02:00] ALERTAS DE VENCIMENTO**
> "O sistema avisa automaticamente quando um equipamento está próximo do vencimento. Fique atento ao ícone de alerta no Dashboard."

**[02:30] ⚠️ ATENÇÃO LEGAL**
> "Equipamento com aferição vencida não pode gerar infrações com validade legal. Mantenha sempre os certificados atualizados."

---

## 🎥 V12 — Cadastro de Equipamentos

**Perfil:** Administrador / Técnico de Implantação  
**Permissões:** `equipamento.*`

### Roteiro

**[00:00] INTRODUÇÃO**
> "O cadastro de equipamentos é a base do sistema. Sem equipamentos cadastrados corretamente, nenhuma infração pode ser gerada."

**[00:20] ONDE ACESSAR**
> "Menu lateral → Equipamentos → Equipamentos"

**[01:00] CAMPOS OBRIGATÓRIOS**
> "Para cadastrar um equipamento, você precisará de:"
- Número de série (fornecido pelo fabricante)
- Código do equipamento (definido pela operação)
- Número do certificado INMETRO
- Modelo e tipo (previamente cadastrados)
- Grupo de equipamentos

**[02:00] DICA DE SEQUÊNCIA DE IMPLANTAÇÃO**
> "Na ordem correta:"
```
1. Cadastrar Fabricante
2. Cadastrar Modelo de Equipamento
3. Cadastrar Grupo de Equipamentos
4. Cadastrar o Equipamento
5. Cadastrar o Arco
6. Cadastrar as Faixas do Arco
7. Criar a Operação vinculando Faixa + Equipamento
```

---

## 🎥 V13 — Arcos e Faixas

**Perfil:** Administrador / Técnico de Implantação  
**Permissões:** `arco.*`, `faixa.*`

### Roteiro

**[00:00] INTRODUÇÃO**
> "Arcos e Faixas definem os pontos físicos de captura. Um Arco é o portal onde a câmera está instalada. As Faixas são as pistas que esse portal monitora."

**[00:30] ENTENDENDO A ESTRUTURA**
```
ARCO (portal físico)
  └── Faixa 1 (pista da direita)
  └── Faixa 2 (pista do meio)
  └── Faixa 3 (pista da esquerda)
```

**[01:00] CADASTRAR ARCO**
1. Menu → Configurações → Arcos → **+ Novo**
2. Informe o nome e localização
3. Salve

**[01:30] CADASTRAR FAIXA**
1. Acesse o arco cadastrado
2. Clique em **Adicionar Faixa**
3. Informe código, sentido, município
4. Salve

**[02:30] DICA IMPORTANTE**
> "O código da faixa deve ser exatamente igual ao configurado no equipamento físico. Qualquer divergência causa erros na geração de infrações."

---

## 🎥 V14 — Contratos e Medições

**Perfil:** Gestor de Medição  
**Permissões:** `contrato.*`, `medicao.*`, `indiceperformance.*`, `operacaointerrupcao.*`

### Roteiro

**[00:00] INTRODUÇÃO**
> "O módulo de Medições avalia o desempenho dos equipamentos conforme o contrato. Gera o boletim de medição mensal com base nos índices de performance acordados."

**[00:30] FLUXO COMPLETO DE MEDIÇÃO**
```
1. Contrato define os equipamentos e índices
2. Interrupções registram períodos offline
3. Medição consolida os dados
4. Relatório PDF é gerado para prestação de contas
```

**[01:00] CRIAR NOVA MEDIÇÃO**
1. Menu → Medições → **Criar Medição**
2. Selecione o contrato e período
3. O sistema calcula automaticamente com base nos dados coletados
4. Adicione informações complementares se necessário
5. Finalizar Medição (bloqueia para edição)
6. Gerar PDF

**[02:30] REGISTRAR INTERRUPÇÃO**
> "Se um equipamento ficou fora do ar por motivo justificado:"
1. Menu → Medições → Interrupções → **+ Novo**
2. Selecione o equipamento e período
3. Informe o motivo
4. Após registrar todas as interrupções → **Processar Interrupções**

**[03:30] DICA**
> "Processe as interrupções ANTES de finalizar a medição. Depois de finalizada, a medição fica travada."

---

## 🎥 V19 — Cronotacógrafo — Consulta e Triagem

**Perfil:** Triador / Operador  
**Permissões:** `cronotacografo.index`, `cronotacografo.passagemcronotacografo`, `consultacronotacografo.index`

### Roteiro

**[00:00] INTRODUÇÃO**
> "O módulo de Cronotacógrafo consulta a situação dos tacógrafos dos veículos de carga detectados nas passagens. Veículos com tacógrafo vencido ou ausente podem ser autuados."

**[00:30] ONDE ACESSAR**
> "Menu lateral → Cronotacógrafo"

**[00:50] TRIAGEM DE CRONOTACÓGRAFO**
> "As passagens de veículos pesados são automaticamente verificadas:"
- ✅ Tacógrafo válido → passagem liberada
- ⚠️ Tacógrafo vencido → gera alerta para triagem
- ❌ Sem tacógrafo → gera infração automática

**[01:30] CONSULTAR SITUAÇÃO**
1. Acesse **Consulta de Cronotacógrafo**
2. Informe a placa do veículo
3. O sistema retorna a situação atual do registro

---

## 🎥 V20 — Controle de Acesso — Usuários e Perfis

**Perfil:** Administrador  
**Permissões:** Módulos de controle de acesso

### Roteiro

**[00:00] INTRODUÇÃO**
> "O controle de acesso define quem pode acessar o sistema e o que cada pessoa pode fazer. É a principal camada de segurança do AxHub."

**[00:30] FLUXO DE CRIAÇÃO DE ACESSO**
```
1. Definir a função do novo usuário
2. Verificar se existe um Perfil adequado
   → Se não: criar perfil em Perfis de Acesso
3. Configurar Permissões do perfil
4. Criar o Usuário e vincular ao perfil
5. Informar login e senha ao usuário
```

**[01:30] CRIAR PERFIL**
> "Menu → Controle de Acesso → Perfis de Acesso → + Novo"

**[02:00] CONFIGURAR PERMISSÕES**
> "Após criar o perfil, acesse Permissões de Acesso, selecione o perfil e marque cada funcionalidade que o perfil pode usar."

**[03:00] CRIAR USUÁRIO**
> "Menu → Controle de Acesso → Usuários → + Novo"
> "Informe nome, login, e-mail e selecione o perfil criado."

**[03:30] DICA DE SEGURANÇA**
> "Nunca crie um usuário sem um perfil bem definido. O princípio do menor privilégio diz: dê apenas o acesso que a pessoa precisa para sua função — nada além disso."

---

## 🎥 V21 — Permissões de Acesso — Configurando perfis

**Perfil:** Administrador  
**Permissões:** `accesspermission.*` (nomenclatura do sistema)

### Roteiro

**[00:00] INTRODUÇÃO**
> "As permissões definem, em detalhe, o que cada perfil pode ver e fazer. Neste vídeo, você vai aprender a configurar permissões para um novo perfil."

**[00:30] A LÓGICA DAS PERMISSÕES**
> "Cada módulo tem ações independentes:"
- **.index** = visualizar/consultar
- **.new** = criar novo registro
- **.edit** = alterar registro existente
- **.delete** = excluir registro

**[01:00] CONFIGURANDO O PERFIL DO TRIADOR**
> "Um triador precisa apenas de:"
- `consultainfracao.index` — ver infrações
- `consultainfracao.datahandlerdetail` — abrir detalhes
- `consultainfracao.obterimagensinfracaoo` — ver imagens
- `consultainfracao.descartarinfracao` — descartar

**[02:30] CONFIGURANDO O PERFIL DO AUDITOR**
> "Um auditor precisa, além das permissões do triador:"
- `auditoria.index` — ver fila de auditoria
- `auditoria.auditar` — aprovar/rejeitar individualmente
- `auditoria.processarlote` — aprovar em lote (com cuidado)

**[03:30] DICAS FINAIS**
> "Após salvar as permissões, peça ao usuário fazer logout e login novamente para carregar as novas configurações."

---

## 🎥 V24 — Relatórios — Visão Geral

**Perfil:** Todos (conforme permissões)  
**Permissões:** módulo `relatorios`

### Roteiro

**[00:00] INTRODUÇÃO**
> "O AxHub oferece múltiplos relatórios para análise da operação. Neste vídeo, apresentamos cada relatório e para que serve."

**[00:30] RELATÓRIOS DISPONÍVEIS**

| Relatório | Para que serve |
|-----------|---------------|
| **Passagens** | Histórico de todas as passagens registradas |
| **Infrações** | Infrações geradas por período e equipamento |
| **Discrepâncias** | Divergências entre dados capturados e processados |
| **Fluxo Diário de Veículos** | Volume de passagens por hora/dia |
| **Mapa de Fluxo de Passagens** | Distribuição geográfica das passagens |
| **Eventos dos Equipamentos** | Histórico de falhas e eventos técnicos |
| **Falhas Sequenciais** | Equipamentos com falhas recorrentes |
| **Processamento de Imagens** | Taxa de aproveitamento por equipamento |
| **Lotes de Importação** | Dados importados por lote |
| **Logs de Envios** | Histórico de envios à integração |
| **Power BI** | Relatórios analíticos avançados |

**[02:00] COMO EXPORTAR**
> "Todo relatório pode ser exportado em Excel ou PDF. Clique em **Exportar** após aplicar os filtros desejados."

---

## 📌 Sequência sugerida de treinamento por perfil

### Operador de Monitoramento
1. V01 — Login
2. V02 — Dashboard
3. V03 — Monitoramento Online
4. V08 — Consulta de Infrações

### Agente de Triagem
1. V01 — Login
2. V02 — Dashboard
3. V04 — Triagem de Infrações ⭐
4. V08 — Consulta de Infrações
5. V09 — Infrações Descartadas

### Auditor
1. V01 — Login
2. V02 — Dashboard
3. V04 — Triagem (entender o fluxo)
4. V05 — Auditoria ⭐
5. V06 — Lote de Exportação

### Gestor de Medição
1. V01 — Login
2. V02 — Dashboard
3. V14 — Contratos e Medições ⭐
4. V15 — Índices de Performance
5. V16 — Interrupções
6. V24 — Relatórios

### Administrador
1. V01 → V24 (todos)
2. Ênfase em: V12, V13, V20, V21, V22
