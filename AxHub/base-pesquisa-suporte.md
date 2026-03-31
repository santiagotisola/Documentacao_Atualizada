# BASE DE PESQUISA — SUPORTE AXHUB
> Consolidação de toda a documentação do sistema AxHub para atendimento de chamados de help desk.
> Atualizado em: 2026-03-27

---

## ÍNDICE RÁPIDO

| # | Módulo | Seção | Palavras-chave |
|---|--------|-------|----------------|
| 1 | [Acesso](#1-acesso-e-login) | Login, Dashboard, Navegação | senha, login, acesso, painel, menu |
| 2 | [Infrações](#2-infrações) | Triagem, Auditoria, Consulta, Exportação, Exceções, Descartadas | triagem, infração, descarte, exportar, lote, auditor |
| 3 | [Operações](#3-operações) | Operações, Aferições, Faixas, Monitoramento, Eventos, Placas | operação, aferição, INMETRO, monitorar, evento, placa |
| 4 | [Equipamentos](#4-equipamentos) | Fabricantes, Tipos, Modelos, Grupos, Equipamentos | equipamento, fabricante, modelo, tipo, grupo, token |
| 5 | [Veículos](#5-veículos) | Tipos, Espécies, Marcas, Modelos, Cores, Municípios | veículo, placa, marca, cor, município |
| 6 | [Balança](#6-balançapesagem) | Postos, Tickets, Reclassificar, Motivos | balança, pesagem, ticket, peso, posto |
| 7 | [Cronotacógrafo](#7-cronotacógrafo) | Triagem, Consulta | cronotacógrafo, jornada, certificado |
| 8 | [Medição](#8-medição) | Contratos, Índices, Interrupções, Medições | contrato, medição, performance, interrupção |
| 9 | [Relatórios](#9-relatórios) | Infrações, Equipamentos, Passagens, Power BI | relatório, Power BI, fluxo, discrepância |
| 10 | [Controle de Acesso](#10-controle-de-acesso) | Usuários, Perfis, Permissões, Logs, IP | usuário, perfil, permissão, log, IP |
| 11 | [Administração](#11-administração) | Configurações, Arcos, Webhooks, Layouts, Enquadramentos | config, arco, webhook, layout, enquadramento |
| 12 | [Glossário](#12-glossário) | Termos técnicos | CTB, INMETRO, CONTRAN |

---

## 1. ACESSO E LOGIN

### Login
- **Caminho:** Tela inicial do sistema (URL do AxHub)
- **Campos:** Login (nome de acesso), Senha
- **Ações:**
  - Informar login e senha → clicar **Entrar**
  - **Esqueci minha senha** → informar e-mail cadastrado → link de redefinição enviado por e-mail
- **Problemas comuns:**
  - "Não consigo acessar" → Verificar: usuário Ativo? Perfil atribuído? IP bloqueado?
  - "Senha não funciona" → Usar "Esqueci minha senha" ou admin redefine em Controle de Acesso → Usuários

### Dashboard
- **Caminho:** Exibido automaticamente após login. Clicar no logo retorna ao Dashboard.
- **Componentes:**
  - **Ícones de Atalho** — acesso rápido aos módulos
  - **Painel Sinótico** — visão geral dos equipamentos (pode ser tela cheia)
  - **Status dos Equipamentos** — online/offline (pode ser tela cheia)
  - **Mapa de Equipamentos** — localização geográfica
  - **Alertas de Aferição** — certificados INMETRO próximos do vencimento
  - **Triagem Mensal** — volume de infrações triadas no mês
  - **Últimos Eventos** — eventos recentes dos equipamentos
- **Indicadores:**
  - Passagens hoje | Infrações pendentes | Equipamentos offline | Certificados vencendo

### Navegação
- **Menu Lateral:** Acesso a todos os módulos
- **Módulos:** Dashboard, Infrações, Operações, Equipamentos, Veículos, Balança, Cronotacógrafo, Relatórios, Administração, Controle de Acesso

---

## 2. INFRAÇÕES

### ⭐ GUIA COMPLETO — Processo de Infração (Passo a Passo)
- **Caminho:** Menu lateral → Infrações (todas as telas)
- **Documentação:** infracoes/guia-completo-infracoes
- **Resumo:** Explicação completa do fluxo de infração ponta a ponta, da captura ao envio ao órgão
- **Palavras-chave:** processo infração, fluxo infração, como funciona, passo a passo, etapas, ciclo completo, guia, manual, captura triagem auditoria exportação
- **Fluxo completo em 5 etapas:**
  1. **CAPTURA** — O equipamento (radar, câmera, lombada) registra automaticamente: imagem, placa (OCR), data/hora, velocidade, local (faixa)
  2. **IMPORTAÇÃO** — Dados entram no AxHub em lotes automáticos. Exceções configuradas descartam infrações automaticamente nesta fase (ex: placas emergência, horários especiais)
  3. **TRIAGEM (Analista)** — Menu → Infrações → Triagem. O analista verifica cada infração:
     - Placa legível? Veículo correto? Velocidade coerente? Enquadramento correto? Imagem boa qualidade?
     - Decisão: ✅ Validar (segue p/ auditoria) | ❌ Descartar (motivo obrigatório) | 🔄 Reabrir (descartada por engano)
  4. **AUDITORIA (Auditor)** — Menu → Infrações → Auditoria. Segundo profissional confere o trabalho do analista:
     - Filtros: Data, Equipamento, Tipo, Analista, Amostragem %
     - Decisão: ✅ Confirmar (segue p/ exportação) | ❌ Rejeitar (volta p/ triagem com observação)
  5. **EXPORTAÇÃO** — Menu → Infrações → Exportação. Sistema gera arquivo com assinatura digital:
     - Configurar: Órgão destino (DETRAN/DER/PRF), Período, Layout (RENAINF/XML/TXT/CSV)
     - 7 validações automáticas: placa, imagens, dados, enquadramento, assinaturas, duplicatas, prazo legal
     - Enviar via: SFTP (automático), API (integração) ou Download (manual)
- **Status possíveis:** 🟡 Aguardando Triagem → 🔵 Em Triagem → 🟢 Válida → 🟣 Auditada → ✅ Exportada (ou 🔴 Descartada)
- **Tabelas BD:** TBInfracoes, TBHistoricoTriagens, TBMotivosDescartes, TBLoteExportacoes, TBExcecoes, TBEnquadramentos
- **Perguntas frequentes:**
  - "Como sei em qual etapa está uma infração?" → Consulta de Infrações → coluna Status
  - "Infração descartada pode ser recuperada?" → Sim, use Reabrir na Triagem
  - "O que são exceções?" → Regras automáticas de descarte (placas emergência, horários, etc.)
  - "Onde vejo erros de exportação?" → Infrações → Exportação → aba Erros

### Triagem
- **Caminho:** Menu lateral → Infrações → **Triagem**
- **O que faz:** Revisar, validar ou descartar infrações pendentes antes da exportação
- **Campos exibidos:** Número Auto, Placa Veículo, Data/Hora, Imagem, Velocidade Medida/Considerada/Regulamentada, Tipo Infração, Status Triagem, Motivo Descarte, Operador
- **Filtros:** Período, Status Triagem, Tipo Infração, Operação
- **Ações:**
  - **Validar** — confirma infração para exportação
  - **Descartar** — rejeita com motivo obrigatório
  - **Reabrir** — reabre infração descartada para nova análise
- **Problemas comuns:**
  - "Infração não aparece" → Verificar filtros (período, status), equipamento cadastrado, operação ativa, aferição válida
  - "Descartei por engano" → Filtrar Status=Descartada → selecionar → **Reabrir**

### Auditoria
- **Caminho:** Menu lateral → Infrações → **Auditoria**
- **O que faz:** Revisar infrações validadas/descartadas na triagem antes da exportação
- **Tipos:** Auditoria de Válidas, Auditoria de Descartadas
- **Filtros:** Faixa de data, Equipamento, Tipo de infração, Analista responsável, Amostragem (%)
- **Ações:**
  - **Confirma** → segue para exportação
  - **Rejeita** → devolve para triagem com observação
  - **Adiciona observações** → comentários sem alterar status
- **Tempo de análise:** Controlado em Configurações do Sistema → aba Triagem

### Consulta de Infrações
- **Caminho:** Menu lateral → Infrações → **Consulta**
- **Filtros:** Período, Equipamento, Placa, Status, Operação, Usuário
- **Status possíveis:** Aguardando Triagem → Em Triagem → Válida → Auditoria → Exportada (ou Descartada em qualquer etapa)
- **Resultado:** Data/Hora, Equipamento, Placa, Velocidade, Enquadramento, Status, Analista, Auditor
- **Exportar:** Botão Excel para exportar resultados

### Exportação
- **Caminho:** Menu lateral → Infrações → **Exportação**
- **O que faz:** Enviar infrações validadas para órgãos autuadores (DETRAN, DER, PRF)
- **Fluxo:**
  1. Configurar: Órgão destino, Período, Status (apenas auditadas/válidas), Layout
  2. Clicar **Gerar lote** → sistema valida dados, gera arquivo, cria hash de assinatura
  3. Clicar **Enviar lote** via SFTP/API ou download manual
- **Formatos:** RENAINF, XML, TXT, CSV
- **Validações automáticas:** Placa válida, imagens ok, dados completos, enquadramento correto, assinaturas presentes, sem duplicatas, dentro do prazo legal
- **Layout:** Configurado em Administração → Layouts Arquivos

### Exceções
- **Caminho:** Menu lateral → Infrações → **Exceções**
- **O que faz:** Regras que isentam veículos/situações do auto de infração (aplicadas automaticamente)
- **Tipos de filtro:** Placas, Horários, Faixas, Classificações, Enquadramentos, Datas
- **Tipos de exceção:** Permanentes (emergência), Temporárias (prazo definido), Por equipamento, Por tipo de infração
- **ATENÇÃO:** Exceções ativas descartam infrações automaticamente durante a importação

### Infrações Descartadas
- **Caminho:** Menu lateral → Infrações → **Infrações Descartadas**
- **Filtros:** Motivo, Analista, Período, Equipamento
- **Ações:** Consultar, visualizar motivo, encaminhar para revisão de auditoria, exportar Excel
- **Inclui:** Descartes manuais (triagem) + automáticos (exceções)

---

## 3. OPERAÇÕES

### Cadastro de Operações
- **Caminho:** Menu lateral → Operações → **Cadastro de Operações**
- **O que faz:** Registrar formalmente uma ação de fiscalização de trânsito
- **Campos obrigatórios:** Equipamento, Arco, Data Início, Data Fim, Enquadramentos, Velocidade Regulamentada (condicional)
- **Relacionados:** Arcos (Administração), Aferições

### Aferições
- **Caminho:** Menu lateral → Operações → **Aferições**
- **O que faz:** Controle de aferições e certificados INMETRO dos equipamentos
- **Campos:** Equipamento, Nº Certificado, Data Emissão, Data Vencimento, Status (Válido/Vencendo/Vencido)
- **IMPORTANTE:** Equipamento com aferição vencida não gera infrações válidas

### Faixas
- **Caminho:** Menu lateral → Operações → **Faixas**
- **O que faz:** Configurar faixas de monitoramento por operação
- **Campos:** Operação, Número da Faixa, Sentido, Tipo

### Monitoramento Online
- **Caminho:** Menu lateral → Operações → **Monitoramento Online**
- **O que faz:** Acompanhar em tempo real o status dos equipamentos
- **Colunas:** Equipamento, Status (Online/Offline/Manutenção), Última Comunicação, Passagens (dia)
- **Problemas comuns:**
  - "Equipamento offline" → Verificar última comunicação, pode ser problema de rede ou falha do equipamento

### Eventos de Equipamentos
- **Caminho:** Menu lateral → Operações → **Eventos de Equipamentos**
- **O que faz:** Consultar e registrar eventos/ocorrências
- **Campos:** Equipamento, Tipo de Evento (falha, manutenção, vandalismo), Data/Hora, Descrição, Responsável

### Consulta de Placas
- **Caminho:** Menu lateral → Operações → **Consulta de Placas**
- **O que faz:** Consultar histórico de passagens por placa
- **Filtros:** Placa, Período, Equipamento
- **Resultado:** Data/Hora, Equipamento, Faixa, Velocidade, Imagem

---

## 4. EQUIPAMENTOS

### Hierarquia de Cadastro (ordem obrigatória)
1. **Fabricantes** → 2. **Tipos** → 3. **Modelos** → 4. **Grupos** → 5. **Equipamentos**

### Fabricantes
- **Caminho:** Menu lateral → Equipamentos → **Fabricantes**
- **Campos:** Nome, Slug (identificador URL), Agrupador Sequencial, Código do Fabricante, Token (API), Certificado, Imagem Criptografada
- **Token de API:** Gerado automaticamente. Usado pelo fabricante para enviar dados via API. **Gerar Novo Token invalida o anterior.**
- **ATENÇÃO:** Sem token válido, o fabricante não consegue enviar passagens/imagens ao sistema

### Tipos de Equipamentos
- **Caminho:** Menu lateral → Equipamentos → **Tipos de Equipamentos**
- **Tipos padrão:** LOMBADA ELETRÔNICA, OCR, RADAR FIXO, RADAR MISTO, RADAR PORTÁTIL
- **Campos:** Nome, Desabilitar Monitoramento, Ícone
- **Forma de Atuação:** Define quais infrações o tipo pode detectar. **Sem esta configuração, o equipamento não gera infrações automaticamente.**

### Modelos de Equipamentos
- **Caminho:** Menu lateral → Equipamentos → **Modelos de Equipamentos**
- **Campos:** Nome, Fabricante (vínculo), Tipo (vínculo)

### Grupos de Equipamentos
- **Caminho:** Menu lateral → Equipamentos → **Grupos de Equipamentos**
- **O que faz:** Agrupar equipamentos para organização e filtragem

### Equipamentos
- **Caminho:** Menu lateral → Equipamentos → **Equipamentos**
- **Campos obrigatórios:** Nº Série, Código, Número Certificado INMETRO, Modelo, Tipo, Grupo
- **Campos opcionais:** Emissão/Vencimento Certificado INMETRO, Tipo da Operação (Fixo/Móvel), Desabilitar Limite Horas Importação
- **IMPORTANTE:** Certificado INMETRO obrigatório para validade legal das infrações
- **Passo a passo:** + Novo → preencher campos → selecionar Modelo/Tipo/Grupo → Salvar
- **Ações da lista:** + Novo, Excel (exportar), Pesquisa, Editar, Excluir

---

## 5. VEÍCULOS

### Tipos de Veículos
- **Caminho:** Menu lateral → Veículos → **Tipos de Veículos**
- **Campos:** Nome, Código (ex: Automóvel, Caminhão, Motocicleta)

### Espécies de Veículos
- **Caminho:** Menu lateral → Veículos → **Espécies de Veículos**
- **Campos:** Nome, Código (ex: Passageiros, Carga, Mista)

### Marcas de Veículos
- **Caminho:** Menu lateral → Veículos → **Marcas de Veículos**
- **Campos:** Nome, Código

### Modelos de Veículos
- **Caminho:** Menu lateral → Veículos → **Modelos de Veículos**
- **Campos:** Nome, Marca (vínculo)

### Cores
- **Caminho:** Menu lateral → Veículos → **Cores**
- **Campos:** Nome

### Categorias de Veículos
- **Caminho:** Menu lateral → Veículos → **Categorias de Veículos**
- **Campos:** Nome, Código

### Classificações de Veículos
- **Caminho:** Menu lateral → Veículos → **Classificações de Veículos**
- **Campos:** Nome, Código

### Municípios
- **Caminho:** Menu lateral → Veículos → **Municípios**
- **Campos:** Nome, UF, Código IBGE

---

## 6. BALANÇA/PESAGEM

### Postos
- **Caminho:** Menu lateral → Balança → **Postos**
- **O que faz:** Cadastro dos postos de pesagem

### Tickets Abertos
- **Caminho:** Menu lateral → Balança → **Tickets Abertos**
- **O que faz:** Tickets de pesagem em aberto (não finalizados)
- **Colunas:** Número, Placa, Data/Hora, Peso Bruto, Status
- **Problemas comuns:**
  - "Ticket preso/aberto" → Verificar status → Liberar Pesagem se necessário

### Tickets Fechados
- **Caminho:** Menu lateral → Balança → **Tickets Fechados**
- **O que faz:** Consultar tickets finalizados

### Liberar Pesagem
- **Caminho:** Menu lateral → Balança → **Liberar Pesagem**
- **O que faz:** Liberar tickets pendentes para pesagem

### Reclassificar
- **Caminho:** Menu lateral → Balança → **Reclassificar**
- **O que faz:** Alterar a classificação de um veículo em ticket de pesagem

### Motivos
- **Caminho:** Menu lateral → Balança → **Motivos**
- **O que faz:** Cadastro de motivos para ações na pesagem

---

## 7. CRONOTACÓGRAFO

### Triagem
- **Caminho:** Menu lateral → Cronotacógrafo → **Triagem**
- **O que faz:** Revisar infrações de excesso de jornada e violações de cronotacógrafo de veículos pesados
- **Etapa adicional:** Consulta ao sistema de registros de cronotacógrafo antes de confirmar
- **Status da consulta:** Pendente, Consultado, Erro, NãoAplicável
- **Status do cronotacógrafo:** Regular, Irregular, Vencido, NãoEncontrado
- **Campos verificados:** Data Documento, Data Vencimento, Tipo Certificado, Número Certificado

### Consulta
- **Caminho:** Menu lateral → Cronotacógrafo → **Consulta**
- **O que faz:** Consultar registros de cronotacógrafo já processados

---

## 8. MEDIÇÃO

### Contratos
- **Caminho:** Menu lateral → Medição → **Contratos**
- **O que faz:** Cadastrar contratos de medição vinculados a operações
- **Campos:** Número do Contrato, Órgão, Vigência Início/Fim, Equipamentos, Status (Ativo/Encerrado/Suspenso)

### Índices de Performance
- **Caminho:** Menu lateral → Medição → **Índices de Performance**
- **O que faz:** Configurar índices exigidos por contrato
- **Campos:** Contrato, Indicador (Disponibilidade, Uptime), Meta (%), Fórmula

### Criar Medição
- **Caminho:** Menu lateral → Medição → **Nova Medição**
- **Fluxo:**
  1. Selecionar contrato e período
  2. Sistema calcula índices automaticamente
  3. Revisar valores e interrupções
  4. Finalizar medição para aprovação
- **Campos:** Contrato, Período, Equipamentos

### Interrupções
- **Caminho:** Menu lateral → Medição → **Interrupções**
- **O que faz:** Registrar interrupções que impactam a medição contratual
- **Campos:** Equipamento, Data/Hora Início/Fim, Motivo, Justificativa
- **Ação:** Processar interrupções para abatimento na medição
- **Problemas comuns:**
  - "Interrupção não contabilizada" → Verificar se foi registrada com datas corretas → Processar interrupções

### Medições Finalizadas
- **Caminho:** Menu lateral → Medição → **Medições Finalizadas**
- **O que faz:** Consultar histórico de medições concluídas

### Recursos
- **Caminho:** Menu lateral → Medição → **Recursos**
- **O que faz:** Gerenciar recursos alocados ao contrato

---

## 9. RELATÓRIOS

### Relatório de Infrações
- **Caminho:** Menu lateral → Relatórios → **Relatório de Infrações**
- **Filtros:** Período, Equipamento, Enquadramento, Status

### Eventos de Equipamentos
- **Caminho:** Menu lateral → Relatórios → **Eventos de Equipamentos**
- **Filtros:** Período, Equipamento, Tipo de evento

### Relatório de Passagens
- **Caminho:** Menu lateral → Relatórios → **Relatório de Passagens**
- **Filtros:** Período, Equipamento, Faixa

### Fluxo Diário de Veículos
- **Caminho:** Menu lateral → Relatórios → **Fluxo Diário de Veículos**
- **O que faz:** Volume de passagens por dia/hora

### Falhas Sequenciais
- **Caminho:** Menu lateral → Relatórios → **Falhas Sequenciais**
- **O que faz:** Detectar falhas na sequência numérica de infrações

### Mapa de Fluxo de Passagens
- **Caminho:** Menu lateral → Relatórios → **Mapa de Fluxo de Passagens**
- **O que faz:** Visualização geográfica do fluxo

### Processamento de Imagens
- **Caminho:** Menu lateral → Relatórios → **Processamento de Imagens**

### Processamento por Usuário
- **Caminho:** Menu lateral → Relatórios → **Processamento por Usuário**
- **O que faz:** Produtividade de cada analista/auditor

### Relatório de Discrepâncias
- **Caminho:** Menu lateral → Relatórios → **Relatório de Discrepâncias**

### Relatório de Logs de Envios
- **Caminho:** Menu lateral → Relatórios → **Relatório de Logs de Envios**
- **O que faz:** Histórico de envios de lotes para órgãos

### Lote de Importação
- **Caminho:** Menu lateral → Relatórios → **Lote de Importação**

### Power BI
- **Caminho:** Menu lateral → Relatórios → **Power BI**
- **Dashboards disponíveis:** Comparativo de Placas, Dados Descartes Radares, Boletim de Medição, Disponibilidade, Infração (dia x hora), Infração, Processamento por Motivos, Processamento, Índice OCR (dia x hora), Índice OCR, Fluxo por Porte, Triagem por Usuário
- **Problemas comuns:**
  - "Relatório não carrega" → Verificar filtros (período grande demora), verificar permissões
  - "Power BI não atualiza" → Verificar Administração → Relatórios Power BI, verificar webhooks

---

## 10. CONTROLE DE ACESSO

### Usuários
- **Caminho:** Menu lateral → Controle de Acesso → **Usuários**
- **Campos:** Nome, Login, E-mail, Perfil de Acesso, Ativo
- **Passo a passo criar usuário:**
  1. Controle de Acesso → Usuários → + Novo
  2. Preencher Nome, Login, E-mail
  3. Selecionar Perfil de Acesso
  4. Marcar Ativo = Sim
  5. Definir senha temporária → Salvar
- **Recomendação:** Revisar periodicamente e desativar contas em desuso

### Perfis de Acesso
- **Caminho:** Menu lateral → Controle de Acesso → **Perfis de Acesso**
- **Campos:** Nome do Perfil (Administrador, Analista, Auditor), Descrição, Permissões
- **Passo a passo:** + Novo → Nome → Descrição → Salvar

### Permissões de Acesso
- **Caminho:** Menu lateral → Controle de Acesso → **Permissões de Acesso**
- **O que faz:** Configurar permissões granulares por perfil
- **Tipos de permissão por módulo:** Visualizar, Criar, Editar, Excluir
- **Dicas:**
  - Consulta apenas → marcar só "Visualizar"
  - Operador de triagem → "Visualizar" + "Criar" + "Editar" em Infrações e Operações

### Logs de Acesso
- **Caminho:** Menu lateral → Controle de Acesso → **Logs de Acesso**
- **Colunas:** Data/Hora, Usuário, IP, Ação, Módulo

### Acessos por IP
- **Caminho:** Menu lateral → Controle de Acesso → **Acessos por IP**
- **Campos:** Endereço IP, Tipo (Permitir/Bloquear), Usuário, Observação
- **ATENÇÃO:** Configuração incorreta pode bloquear usuários legítimos

### Fluxo completo: Criar Usuário com Permissões
```
Perfis de Acesso (criar perfil) → Permissões (configurar) → Usuários (criar e vincular perfil)
```

---

## 11. ADMINISTRAÇÃO

### Configurações do Sistema
- **Caminho:** Menu lateral → Configurações
- **Abas:**
  - **Triagem:** Prazo para triagem (dias), Tempo de análise (minutos), Motivo descarte, Meta diária
  - **Órgão:** Configurações do órgão autuador
  - **Enquadramentos:** Gestão de códigos de infração
  - **Equipamentos:** Parâmetros técnicos
  - **Sistema:** Configurações globais

### Arcos
- **Caminho:** Menu lateral → Administração → **Arcos**
- **Campos:** Nome, Localização, Equipamentos vinculados, Status (Ativo/Inativo)

### Enquadramentos
- **Caminho:** Menu lateral → Administração → **Enquadramentos**
- **O que faz:** Gestão dos enquadramentos legais (artigos do CTB)

### Configurações de Enquadramento
- **Caminho:** Menu lateral → Administração → **Configurações de Enquadramento**
- **O que faz:** Configuração detalhada dos enquadramentos por órgão

### Formas de Autuação
- **Caminho:** Menu lateral → Administração → **Formas de Autuação**

### Layouts de Arquivos
- **Caminho:** Menu lateral → Administração → **Layouts de Arquivos**
- **O que faz:** Configurar campos e delimitadores dos arquivos de exportação por órgão

### Motivos de Descarte
- **Caminho:** Menu lateral → Administração → **Motivos de Descarte**
- **O que faz:** Lista de motivos usados ao descartar infrações

### Regiões
- **Caminho:** Menu lateral → Administração → **Regiões**

### Sequenciais de Infrações
- **Caminho:** Menu lateral → Administração → **Sequenciais de Infrações**
- **O que faz:** Controle de numeração sequencial dos autos

### Sequenciais de Lote de Exportação
- **Caminho:** Menu lateral → Administração → **Sequenciais de Lote de Exportação**

### Tarjas
- **Caminho:** Menu lateral → Administração → **Tarjas**
- **O que faz:** Configurar overlays de informações nas imagens de infração

### Tipos de Aferições
- **Caminho:** Menu lateral → Administração → **Tipos de Aferições**

### Tipos de Imagens
- **Caminho:** Menu lateral → Administração → **Tipos de Imagens**

### Webhooks
- **Caminho:** Menu lateral → Administração → **Webhooks**
- **Campos:** URL, Evento, Método (POST/PUT), Headers, Ativo
- **O que faz:** Notificar sistemas externos sobre eventos do AxHub (integrações com DETRAN, ERPs)

### Relatórios Power BI (Configuração)
- **Caminho:** Menu lateral → Administração → **Relatórios Power BI**
- **O que faz:** Configurar os dashboards Power BI exibidos no módulo Relatórios

---

## 12. GLOSSÁRIO

### Aferição
Procedimento técnico de verificação metrológica que atesta conformidade de instrumento de medição (radar, balança) com padrões do INMETRO. Base legal: Resolução CONTRAN 798/2021 e Portaria INMETRO 544/2014. Validade geralmente 12 meses. Infrações com equipamento de aferição vencida são automaticamente invalidadas.

### Autuação
Ato administrativo formal de lavratura do auto de infração de trânsito. Base legal: Art. 280 do CTB. Inclui identificação do veículo, local, data/hora, enquadramento legal e assinatura do agente.

### Cronotacógrafo
Dispositivo obrigatório em veículos de carga e transporte coletivo que registra velocidade, tempo de condução e descanso do motorista. Base legal: Art. 105 do CTB e Resolução CONTRAN 92/1999.

### Enquadramento
Classificação legal de uma infração de trânsito conforme artigos do CTB. Cada enquadramento possui tipo de infração (leve, média, grave, gravíssima), pontos na CNH e valor da multa.

### Infração de Trânsito
Desobediência a qualquer preceito da legislação de trânsito. Base legal: Art. 161 do CTB. No AxHub, infrações são detectadas automaticamente pelos equipamentos e passam pelo fluxo: Detecção → Triagem → Auditoria → Exportação.

### Lote de Exportação
Conjunto de infrações validadas agrupadas para envio ao órgão autuador. Inclui: arquivo de dados (RENAINF/XML/TXT/CSV), imagens das infrações e hash de assinatura digital.

### Medição de Desempenho
Processo de aferição contratual da performance dos equipamentos com base em índices definidos no contrato (disponibilidade, uptime). Interrupções são descontadas.

### Triagem
Processo de análise humana das infrações detectadas automaticamente. O triador valida ou descarta cada infração antes da auditoria e exportação.

---

## 13. PERGUNTAS FREQUENTES (FAQ)

### Acesso
**P: Esqueci minha senha, o que faço?**
R: Na tela de login, clique em "Esqueci minha senha", informe o e-mail cadastrado e siga o link de redefinição enviado por e-mail.

**P: Meu acesso foi bloqueado.**
R: Pode ser restrição de IP. Peça ao administrador verificar em Controle de Acesso → Acessos por IP. Também verificar se o usuário está marcado como "Ativo".

**P: Como criar um novo usuário?**
R: Perfis de Acesso (criar perfil) → Permissões (configurar) → Usuários (criar usuário e vincular perfil). Guia completo disponível.

### Infrações
**P: Uma infração não aparece na triagem.**
R: Verificar: (1) filtros de período e status, (2) a operação está ativa, (3) o equipamento está cadastrado e com aferição INMETRO válida.

**P: Descartei uma infração por engano.**
R: Em Infrações → Triagem, filtrar por Status=Descartada, selecionar a infração e clicar em "Reabrir".

**P: Como exportar infrações para o DETRAN?**
R: Infrações → Exportação → selecionar Órgão, Período e Layout → Gerar lote → Enviar lote.

**P: O que significa cada status de infração?**
R: Aguardando Triagem → Em Triagem → Válida → Auditoria → Exportada. Pode ser "Descartada" em qualquer etapa.

### Equipamentos
**P: Como cadastrar um novo equipamento?**
R: Primeiro cadastre na ordem: Fabricantes → Tipos → Modelos → Grupos. Depois Equipamentos → + Novo, preenchendo Nº Série, Código e Certificado INMETRO.

**P: Equipamento aparece como offline.**
R: Verificar em Operações → Monitoramento Online a última comunicação. Pode ser problema de rede no local ou falha física do equipamento.

**P: O certificado INMETRO está vencendo.**
R: O Dashboard mostra alertas. Para atualizar: Equipamentos → editar → campo "Vencimento Certificado INMETRO".

### Balança
**P: Ticket de pesagem preso/aberto.**
R: Balança → Tickets Abertos → verificar status → usar "Liberar Pesagem" se necessário.

### Medição
**P: Como gerar uma nova medição?**
R: Medição → Nova Medição → selecionar contrato e período → sistema calcula índices → revisar → finalizar.

**P: Interrupção não está sendo descontada.**
R: Verificar em Medição → Interrupções se foi registrada com datas corretas. Clicar em "Processar Interrupções".

### Relatórios
**P: Relatório demora muito para carregar.**
R: Reduzir o período nos filtros. Períodos muito grandes aumentam o tempo de processamento.

**P: Não consigo acessar um relatório.**
R: Verificar se o perfil do usuário tem permissão "Visualizar" no módulo Relatórios (Controle de Acesso → Permissões).
