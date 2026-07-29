---
sidebar_position: 3
title: Permissões de Acesso
description: Mapeamento completo de todas as permissões do AxHub — guia operacional por módulo e perfil
---

# Permissões de Acesso

Define quais funcionalidades cada perfil pode acessar no AxHub. As permissões são organizadas por **módulo** e cada ação representa uma operação específica que o usuário poderá ou não executar.

![Permissões de Acesso](../img/Controle%20de%20acessos%20-%20permissao%20de%20acesso.png)

## Como acessar

**Menu lateral** → Controle de Acesso → **Permissões de Acesso**

## Como configurar

1. Selecione o **Perfil de Acesso** no filtro superior
2. O sistema lista todos os módulos disponíveis
3. Marque ou desmarque cada permissão
4. Clique em **Salvar**

:::warning Efeito imediato
Alterações têm efeito imediato. Usuários com sessão ativa podem precisar fazer logout e login novamente para receber as novas permissões.
:::

---

## Mapeamento completo por módulo

As permissões estão organizadas em **9 grupos operacionais** para facilitar a configuração de perfis.

---

## 📊 GRUPO 1 — Dashboard

Controla quais indicadores e gráficos cada perfil visualiza na tela inicial.

| Permissão | Código | O que o usuário vê / faz |
|-----------|--------|--------------------------|
| Dashboard — Index | `dashboard.obterdefasagemprocessamento` | Indicador de defasagem no processamento de imagens |
| Dashboard — Heatmap Hora/Semana | `dashboard.heatmaphorasemana` | Mapa de calor de infrações por hora e dia da semana |
| Dashboard — Imagem Infração Diário | `dashboard.imageminfracaodiario` | Gráfico diário de imagens de infrações capturadas |
| Dashboard — Imagem Infração Mensal | `dashboard.imageminfracaomensal` | Gráfico mensal de imagens de infrações |
| Dashboard — Imagens Capturadas | `dashboard.obterimagenscapturadas` | Contador de imagens capturadas pelos equipamentos |
| Dashboard — Relatório OCR | `dashboard.relatorioocr` | Indicador de taxa de leitura OCR dos equipamentos |
| Dashboard — Status Equipamento | `dashboard.obterstatusequipamentos` | Painel de status (online/offline) de cada equipamento |
| Dashboard — Status Equipamento Mapa | `dashboard.obterstatusequipamentosmapa` | Mapa georreferenciado com status dos equipamentos |
| Dashboard — Taxa Aproveitamento | `dashboard.obtertaxaaproveitamento` | Taxa de aproveitamento das imagens capturadas |
| Dashboard — Top Motivos Descarte | `dashboard.topmotivosdescarte` | Ranking dos principais motivos de descarte de infrações |
| Dashboard — Últimos Eventos | `dashboard.obterultimoseventos` | Feed dos últimos eventos registrados nos equipamentos |

:::tip Para o Operador de Monitoramento
Configure apenas `dashboard.obterstatusequipamentos`, `dashboard.obterstatusequipamentosmapa` e `dashboard.obterultimoseventos` para focar no acompanhamento em tempo real.
:::

---

## 🏗️ GRUPO 2 — Cadastros Base

Dados fundamentais que precisam existir antes de configurar operações. Geralmente mantidos pelo **Administrador** ou **Técnico de Implantação**.

### 📷 Equipamento (`equipamento`)

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Equipamento — Consultar | `equipamento.index` | Visualizar a lista de equipamentos cadastrados |
| Equipamento — Novo | `equipamento.new` | Cadastrar um novo equipamento (radar, câmera, OCR) |
| Equipamento — Editar | `equipamento.edit` | Alterar dados de equipamento existente |
| Equipamento — Excluir | `equipamento.delete` | Remover equipamento sem operações vinculadas |

### 🏭 Fabricante (`fabricante`)

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Fabricante — Consultar | `fabricante.index` | Listar fabricantes cadastrados |
| Fabricante — Novo | `fabricante.new` | Cadastrar novo fabricante |
| Fabricante — Editar | `fabricante.edit` | Alterar dados do fabricante |
| Fabricante — Excluir | `fabricante.delete` | Remover fabricante sem equipamentos vinculados |
| Fabricante — Gerar Token | `fabricante.generatetoken` | Gerar token de integração para o fabricante |

### 🔩 Modelo Equipamento (`modeloequipamento`)

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Modelo — Consultar | `modeloequipamento.index` | Listar modelos cadastrados |
| Modelo — Novo | `modeloequipamento.new` | Cadastrar novo modelo de equipamento |
| Modelo — Editar | `modeloequipamento.edit` | Alterar dados do modelo |
| Modelo — Excluir | `modeloequipamento.delete` | Remover modelo sem equipamentos vinculados |

### 📦 Grupo de Equipamentos (`grupoequipamento`)

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Grupo — Consultar | `grupoequipamento.index` | Visualizar grupos de equipamentos |
| Grupo — Novo | `grupoequipamento.new` | Criar novo grupo |
| Grupo — Editar | `grupoequipamento.edit` | Alterar nome ou composição do grupo |
| Grupo — Excluir | `grupoequipamento.delete` | Remover grupo sem equipamentos vinculados |

### 🌉 Arco e Faixa (`arco`, `faixa`)

O **Arco** representa a estrutura física de monitoramento (portal, câmera) e as **Faixas** são as pistas individuais capturadas por cada arco.

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Arco — Consultar | `arco.index` | Visualizar a lista de arcos cadastrados |
| Arco — Novo | `arco.new` | Cadastrar novo arco de fiscalização |
| Arco — Editar | `arco.edit` | Alterar dados do arco |
| Arco — Excluir | `arco.delete` | Remover arco sem faixas ativas |
| Arco — Adicionar ao Arco | `arco.addno` | Vincular equipamento/faixa ao arco |
| Faixa — Consultar | `faixa.index` | Visualizar faixas de um arco |
| Faixa — Nova | `faixa.new` | Criar nova faixa no arco |
| Faixa — Editar | `faixa.edit` | Alterar dados da faixa (sentido, código, município) |
| Faixa — Excluir | `faixa.delete` | Remover faixa sem passagens vinculadas |

:::info Relação Arco → Faixa → Operação
Um **Arco** contém múltiplas **Faixas**. Cada faixa é associada a uma **Operação** para que as passagens sejam capturadas e as infrações geradas corretamente.
:::

---

## 🚗 GRUPO 3 — Cadastros de Veículos

Tabelas de referência para classificação e identificação de veículos nas passagens.

| Módulo | Permissões disponíveis | Finalidade |
|--------|------------------------|------------|
| **Marcas de Veículos** (`marcaveiculo`) | `.index` `.new` `.edit` `.delete` | Cadastro das marcas (ex.: FIAT, VW, FORD) |
| **Marca Modelo Veículo** (`marcamodeloveiculo`) | `.index` `.new` `.edit` `.delete` | Modelos por marca (ex.: FIAT Uno, VW Gol) |
| **Categoria Veículo** (`categoriaveiculo`) | `.index` `.new` `.edit` `.delete` | Categorias (ex.: Passeio, Carga, Moto) |
| **Classificação Veículo** (`classificacaoveiculo`) | `.index` `.new` `.edit` `.delete` | Classificações para fins de enquadramento |
| **Espécie Veículo** (`especieveiculo`) | `.index` `.new` `.edit` `.delete` | Espécie (ex.: Automóvel, Caminhonete, Ônibus) |
| **Cor** (`cor`) | `.index` `.new` `.edit` `.delete` | Cores de veículos utilizadas nas autuações |

:::tip Para o usuário operador
Estes cadastros raramente precisam ser alterados. Conceda apenas `.index` (visualizar) para a maioria dos perfis operacionais.
:::

---

## ⚙️ GRUPO 4 — Configurações e Enquadramentos

Define os parâmetros legais e operacionais que regem as infrações.

### 📋 Enquadramento (`enquadramento`)

Tabela de artigos do CTB com código, gravidade, pontos e valor da multa.

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Enquadramento — Consultar | `enquadramento.index` | Visualizar enquadramentos disponíveis |
| Enquadramento — Novo | `enquadramento.new` | Adicionar novo enquadramento |
| Enquadramento — Editar | `enquadramento.edit` | Alterar valor, gravidade ou artigo |
| Enquadramento — Excluir | `enquadramento.delete` | Remover enquadramento sem infrações vinculadas |

### ⚖️ Forma de Atuação (`formaatuacao`)

Define como a autuação é lavrada (ex.: auto eletrônico, notificação).

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Forma de Atuação — Consultar | `formaatuacao.index` | Visualizar formas cadastradas |
| Forma de Atuação — Novo | `formaatuacao.new` | Cadastrar nova forma |
| Forma de Atuação — Editar | `formaatuacao.edit` | Alterar dados da forma |
| Forma de Atuação — Excluir | `formaatuacao.delete` | Remover forma sem infrações vinculadas |

### 🗃️ Layout Arquivo (`layoutarquivo`)

Define o formato dos arquivos de exportação para órgãos externos (DETRAN, SENATRAN).

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Layout — Consultar | `layoutarquivo.index` | Visualizar layouts disponíveis |
| Layout — Novo | `layoutarquivo.new` | Criar novo layout de arquivo |
| Layout — Editar | `layoutarquivo.edit` | Alterar estrutura do layout |
| Layout — Excluir | `layoutarquivo.delete` | Remover layout não utilizado |

### 📝 Infração Enquadramento (`infracaoenquadramento`)

Vincula infrações específicas a enquadramentos do CTB.

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Inf. Enquadramento — Consultar | `infracaoenquadramento.index` | Visualizar os vínculos cadastrados |
| Inf. Enquadramento — Novo | `infracaoenquadramento.new` | Criar novo vínculo infração × enquadramento |
| Inf. Enquadramento — Editar | `infracaoenquadramento.edit` | Alterar vínculo existente |
| Inf. Enquadramento — Excluir | `infracaoenquadramento.delete` | Remover vínculo |

### ⚙️ Configuração Geral (`configuracao`)

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Configuração — Index | `configuracao.index` | Acessar as configurações gerais do sistema |

---

## 🚦 GRUPO 5 — Operações de Campo

Gerenciamento das operações de fiscalização em campo.

### 📡 Monitoramento (`monitoramento`)

Acompanhamento em tempo real das passagens e status dos equipamentos.

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Monitoramento — Consultar | `monitoramento.index` | Visualizar tela de monitoramento online |
| Monitoramento — Editar | `monitoramento.edit` | Ajustar parâmetros do monitoramento |
| Monitoramento — Excluir | `monitoramento.delete` | Remover configurações de monitoramento |
| Monitoramento — Digitar Placa | `monitoramento.atualizaplaca` | Corrigir manualmente a placa de uma passagem |
| Monitoramento — Consulta Cronotacógrafo | `monitoramento.consultacronotacografo` | Consultar situação do cronotacógrafo diretamente no monitoramento |
| Monitoramento — Finalizar Monitoramento | `monitoramento.finalizarmonitoramento` | Encerrar o ciclo de monitoramento ativo |

:::tip Operador de campo
Para operadores de plantão, conceda `monitoramento.index` e `monitoramento.atualizaplaca`. A permissão `monitoramento.finalizarmonitoramento` deve ficar com o supervisor.
:::

### 🔧 Aferição (`afericao`)

Controle das aferições de precisão dos equipamentos (obrigatório pelo INMETRO).

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Aferição — Consultar | `afericao.index` | Visualizar aferições realizadas e pendentes |
| Aferição — Novo | `afericao.new` | Registrar nova aferição |
| Aferição — Editar | `afericao.edit` | Alterar dados de aferição |
| Aferição — Excluir | `afericao.delete` | Remover aferição sem infrações vinculadas |
| Aferição — Alertas Vencimento | `afericao.alertasvencimento` | Receber alertas de equipamentos com aferição próxima do vencimento |

### ⚡ Evento de Equipamento (`eventoequipamento`)

Registro de eventos técnicos nos equipamentos (falhas, retomadas, manutenções).

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Evento — Consultar | `eventoequipamento.index` | Visualizar histórico de eventos |
| Evento — Novo | `eventoequipamento.new` | Registrar novo evento técnico |
| Evento — Editar | `eventoequipamento.edit` | Alterar descrição do evento |
| Evento — Excluir | `eventoequipamento.delete` | Remover evento sem impacto em medições |

---

## 🚨 GRUPO 6 — Infrações

Fluxo central do AxHub: captura → triagem → auditoria → exportação.

### 🔍 Consulta de Infrações (`consultainfracao`)

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Infrações — Consultar | `consultainfracao.index` | Listar e filtrar infrações geradas |
| Infrações — Detalhar | `consultainfracao.datahandlerdetail` | Abrir detalhes completos de uma infração |
| Infrações — Detalhamento | `consultainfracao.detalhamentoinfracao` | Acessar a tela de detalhamento da infração |
| Infrações — Obter Imagens | `consultainfracao.obterimagensinfracaoo` | Visualizar as imagens capturadas da infração |
| Infrações — Descartar | `consultainfracao.descartarinfracao` | Descartar manualmente uma infração com motivo |

### 🗑️ Infrações Descartadas (`consultainfracoesdescartadas`)

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Desc. — Consultar | `consultainfracoesdescartadas.index` | Visualizar infrações descartadas |
| Desc. — Detalhar | `consultainfracoesdescartadas.datahandlerdiscarded` | Abrir detalhes de infração descartada |
| Desc. — Obter Imagens | `consultainfracoesdescartadas.obterimagensinfracaoo` | Ver imagens das infrações descartadas |

### 🔎 Auditoria (`auditoria`)

Processo de revisão e aprovação de infrações antes da exportação.

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Auditoria — Consultar | `auditoria.index` | Visualizar infrações na fila de auditoria |
| Auditoria — Auditar | `auditoria.auditar` | Aprovar ou rejeitar infrações individualmente |
| Auditoria — Processar Lote | `auditoria.processarlote` | Aprovar ou rejeitar um lote inteiro de infrações |

:::caution Permissão crítica
`auditoria.processarlote` deve ser restrito ao **Auditor Sênior** ou **Supervisor**. Uma operação indevida afeta centenas de infrações simultaneamente.
:::

### 📤 Lote de Exportação (`loteexportacao`)

Gerencia os lotes de infrações enviados para órgãos externos (DETRAN, SENATRAN, etc.).

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Lote — Consultar | `loteexportacao.index` | Visualizar lotes gerados e seus status |
| Lote — Novo | `loteexportacao.new` | Criar novo lote de exportação |
| Lote — Editar | `loteexportacao.edit` | Alterar dados do lote antes do envio |
| Lote — Excluir | `loteexportacao.delete` | Remover lote não enviado |
| Lote — Detalhar | `loteexportacao.datahandlerdetail` | Ver infrações dentro do lote |
| Lote — Detalhamento Exportação | `loteexportacao.detalhamentoexportacao` | Acessar tela de detalhes da exportação |
| Lote — Cancelar | `loteexportacao.cancelarlote` | Cancelar envio de um lote em processamento |
| Lote — Forçar Encerramento | `loteexportacao.forcarencerrarlote` | Forçar encerramento de lote travado |
| Lote — Finalizar e Reenviar | `loteexportacao.finalizarreenviarnovolote` | Finalizar lote e criar novo para reenvio |
| Lote — Tentar Novamente | `loteexportacao.tryagain` | Retentar envio de lote com falha |

### 🚫 Exceções (`excecao`)

Regras que excluem automaticamente determinadas placas, faixas, horários ou enquadramentos da geração de infrações.

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Exceção — Index | `excecao.index` | Visualizar todas as regras de exceção ativas |
| Exceção — Novo | `excecao.new` | Criar nova regra de exceção |
| Exceção — Editar | `excecao.edit` | Alterar regra de exceção existente |
| **Salvar por Placa** | `excecao.saveexcecaoplaca` | Criar exceção para uma placa específica |
| **Salvar por Faixa** | `excecao.saveexcecaofaixa` | Criar exceção para uma faixa específica |
| **Salvar por Data** | `excecao.saveexcecaodata` | Criar exceção para um período/data |
| **Salvar por Horário** | `excecao.saveexcecaohorario` | Criar exceção por faixa de horário |
| **Salvar por Enquadramento** | `excecao.saveexcecaoenquadramento` | Criar exceção por tipo de enquadramento |
| **Salvar por Veículo** | `excecao.saveexcecaoveiculo` | Criar exceção para um veículo específico |
| **Excluir por Placa** | `excecao.deleteexcecaoplaca` | Remover exceção de placa |
| **Excluir por Faixa** | `excecao.deleteexcecaofaixa` | Remover exceção de faixa |
| **Excluir por Data** | `excecao.deleteexcecaodata` | Remover exceção de data |
| **Excluir por Horário** | `excecao.deleteexcecaohorario` | Remover exceção de horário |
| **Excluir por Enquadramento** | `excecao.deleteexcecaoenquadramento` | Remover exceção de enquadramento |
| **Excluir por Veículo** | `excecao.deleteexcecaoveiculo` | Remover exceção de veículo |
| **Excluir Todas as Placas** | `excecao.deleteallplacas` | Remover TODAS as exceções de placa de uma vez |

:::warning Exceções têm impacto direto na geração de infrações
Adicionar uma exceção indevida impede a geração de multas. Use com critério e conceda apenas a perfis de supervisão.
:::

---

## 📏 GRUPO 7 — Medições e Contratos

Módulo de gestão contratual e medição de desempenho dos equipamentos.

### 📄 Contrato (`contrato`)

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Contrato — Consultar | `contrato.index` | Visualizar contratos cadastrados |
| Contrato — Novo | `contrato.new` | Cadastrar novo contrato |
| Contrato — Editar | `contrato.edit` | Alterar dados do contrato |
| Contrato — Excluir | `contrato.delete` | Remover contrato sem medições vinculadas |

### 📊 Índice de Performance (`indiceperformance`)

Metas e indicadores de desempenho avaliados nas medições.

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Índice — Consultar | `indiceperformance.index` | Visualizar índices cadastrados |
| Índice — Novo | `indiceperformance.new` | Criar novo índice de performance |
| Índice — Editar | `indiceperformance.edit` | Alterar metas ou critérios |
| Índice — Excluir | `indiceperformance.delete` | Remover índice não vinculado a medições |

### ⏸️ Interrupções (`operacaointerrupcao`)

Registra períodos em que os equipamentos ficaram fora de operação, descontados da medição.

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Interrupção — Consultar | `operacaointerrupcao.index` | Visualizar interrupções registradas |
| Interrupção — Novo | `operacaointerrupcao.new` | Registrar nova interrupção |
| Interrupção — Editar | `operacaointerrupcao.edit` | Alterar dados da interrupção |
| Interrupção — Excluir | `operacaointerrupcao.delete` | Remover interrupção |
| Interrupção — Processar | `operacaointerrupcao.processarinterrupcoes` | Aplicar as interrupções ao cálculo da medição |

### 📐 Medição (`medicao`)

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Medição — Consultar | `medicao.index` | Visualizar medições em andamento e finalizadas |
| Medição — Adicionar Informações | `medicao.criarmedicaoinformacao` | Inserir dados adicionais na medição |
| Medição — Excluir Informações | `medicao.excluirmedicaoinformacao` | Remover informações adicionais |
| Medição — Finalizar | `medicao.finalizarmedicao` | Concluir e bloquear a medição para edição |
| Medição — PDF Finalizada | `medicao.relatoriomedicaofinalizada` | Gerar PDF do boletim de medição finalizado |
| Medição — Relatório por Equipamento | `medicao.relatoriomedicaoequipamento` | Gerar relatório de medição por equipamento |

---

## 🖨️ GRUPO 8 — Cronotacógrafo

Módulo para consulta e triagem de registros de cronotacógrafos de veículos de carga.

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Cronotacógrafo — Consultar | `cronotacografo.index` | Listar registros de cronotacógrafos |
| Cronotacógrafo — Triagem | `cronotacografo.passagemcronotacografo` | Realizar triagem de passagens com dados do cronotacógrafo |
| Consulta Crono — Consultar | `consultacronotacografo.index` | Consultar situação do cronotacógrafo de um veículo |

---

## 🔐 GRUPO 9 — Controle de Acesso e Segurança

### 🌐 Acessos Por IP (`acessoporip`)

Restringe o acesso ao sistema a endereços IP específicos, aumentando a segurança.

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Acesso Por IP — Consultar | `acessoporip.index` | Visualizar restrições de IP cadastradas |
| Acesso Por IP — Novo | `acessoporip.new` | Criar nova restrição de IP |
| Acesso Por IP — Editar | `acessoporip.edit` | Alterar faixa de IP permitida |
| Acesso Por IP — Excluir | `acessoporip.delete` | Remover restrição de IP |
| Acesso Por IP — Adicionar Usuário | `acessoporip.addusuarios` | Vincular usuário a uma restrição de IP |
| Acesso Por IP — Excluir Usuário | `acessoporip.deleteusuario` | Remover usuário da restrição de IP |

### 🕐 Horário de Acesso (`horarioacesso`)

Define os horários permitidos para acesso ao sistema por perfil.

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Horário — Consultar | `horarioacesso.index` | Visualizar regras de horário cadastradas |
| Horário — Novo | `horarioacesso.new` | Criar nova regra de horário de acesso |
| Horário — Editar | `horarioacesso.edit` | Alterar janelas de horário |
| Horário — Excluir | `horarioacesso.delete` | Remover regra de horário |

### 📋 Log de Acesso (`logacesso`)

| Permissão | Código | O que o usuário pode fazer |
|-----------|--------|---------------------------|
| Log de Acesso — Index | `logacesso.index` | Consultar histórico completo de acessos de todos os usuários |

---

## 👤 Perfis operacionais sugeridos

Com base no mapeamento completo, estes perfis atendem a maioria das operações:

---

### 👑 Administrador — Acesso total
Responsável pela implantação, configuração e gestão do sistema.

**Permissões exclusivas:**
- Todos os módulos de Cadastros Base e Veículos
- `configuracao.index` — Configurações do sistema
- `acessoporip.*`, `horarioacesso.*` — Segurança de acesso
- `logacesso.index` — Auditoria
- `fabricante.generatetoken` — Integrações
- `layoutarquivo.*` — Formatos de exportação
- `loteexportacao.forcarencerrarlote` — Operações críticas de lote

---

### 🖥️ Operador de Monitoramento — Turno
Acompanha passagens e status em tempo real.

| Módulo | Permissões |
|--------|-----------|
| Dashboard | `dashboard.obterstatusequipamentos`, `dashboard.obterstatusequipamentosmapa`, `dashboard.obterultimoseventos` |
| Monitoramento | `monitoramento.index`, `monitoramento.atualizaplaca` |
| Infrações | `consultainfracao.index`, `consultainfracao.datahandlerdetail`, `consultainfracao.obterimagensinfracaoo` |
| Aferição | `afericao.alertasvencimento` |

---

### 📝 Agente de Triagem
Realiza a triagem das infrações capturadas.

| Módulo | Permissões |
|--------|-----------|
| Dashboard | Todos os widgets |
| Infrações | `consultainfracao.index`, `consultainfracao.datahandlerdetail`, `consultainfracao.obterimagensinfracaoo`, `consultainfracao.descartarinfracao` |
| Infrações Descartadas | `consultainfracoesdescartadas.index`, `consultainfracoesdescartadas.datahandlerdiscarded` |
| Monitoramento | `monitoramento.index`, `monitoramento.atualizaplaca` |
| Enquadramento | `enquadramento.index` |

---

### 🔍 Auditor
Revisa e aprova infrações triadas antes da exportação.

| Módulo | Permissões |
|--------|-----------|
| Auditoria | `auditoria.index`, `auditoria.auditar`, `auditoria.processarlote` |
| Infrações | `consultainfracao.index`, `consultainfracao.detalhamentoinfracao`, `consultainfracao.obterimagensinfracaoo` |
| Infrações Descartadas | Todas |
| Lote Exportação | `loteexportacao.index`, `loteexportacao.datahandlerdetail` |
| Dashboard | Todos os widgets |

---

### 📤 Operador de Exportação
Gerencia o envio das infrações para órgãos externos.

| Módulo | Permissões |
|--------|-----------|
| Lote Exportação | Todas exceto `loteexportacao.forcarencerrarlote` |
| Infrações | `consultainfracao.index`, `consultainfracao.detalhamentoinfracao` |
| Dashboard | `dashboard.obterultimoseventos` |

---

### 📏 Gestor de Medição
Gerencia contratos, medições e indicadores de desempenho.

| Módulo | Permissões |
|--------|-----------|
| Contrato | Todas |
| Índice de Performance | Todas |
| Interrupções | Todas |
| Medição | Todas |
| Eventos Equipamento | `eventoequipamento.index` |
| Dashboard | Todos os widgets |

---

### 👁️ Consulta — Somente leitura
Acesso mínimo para visualização sem alterações.

| Módulo | Permissões |
|--------|-----------|
| Infrações | `consultainfracao.index`, `consultainfracao.datahandlerdetail` |
| Dashboard | `dashboard.obterstatusequipamentos`, `dashboard.obterultimoseventos` |
| Monitoramento | `monitoramento.index` |

---

## Navegação Relacionada

| Tipo | Página | Descrição |
|------|--------|-----------|
| Relacionado | [Perfis de Acesso](./perfis-acesso) | Perfis que usam estas permissões |
| Relacionado | [Usuários](./usuarios) | Usuários afetados pelas permissões |
| Relacionado | [Logs de Acesso](./logs-acesso) | Auditoria de ações realizadas |
| Relacionado | [Acessos Por IP](./acessos-por-ip) | Restrição de acesso por IP |
