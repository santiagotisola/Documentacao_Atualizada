---
sidebar_position: 3
title: Configurações do Sistema
description: Configurações gerais do AxHub
---

# Configurações do Sistema

A tela de Configurações do Sistema centraliza todos os parâmetros globais do AxHub. As Configurações são organizadas em **10 abas temáticas** e salvas em banco de dados como pares chave-valor na tabela `TBConfiguracoes`.

## Como acessar

**Menu lateral** → Configurações → Configurações do Sistema**

---

## Configurações por Aba

### Aba Triagem

Controla parâmetros relacionados ao processamento e triagem de Infrações

| Campo | Descrição |
|-------|-----------|
| **Prazo para Triagem** | Prazo em dias para realizar a triagem de Infrações (padrão: 20 dias) |
| **Motivo de Descarte Padrão** | Motivo pré-selecionado na tela de triagem |
| **Tipo Imagem do Lado Esquerdo** | Tipo de imagem exibida à esquerda na triagem/auditoria (P1, P2, ZF, ZT) |
| **Tipo Imagem do Lado Direito** | Tipo de imagem exibida à direita na triagem/auditoria (P1, P2, ZF, ZT) |
| **Tempo de Análise de Imagem** | Tempo em segundos para Análise de cada imagem na triagem |
| **Tempo de Infração Duplicada** | Intervalo em segundos para considerar duas Infrações como duplicata |
| **Exibir alerta para velocidades superiores a** | Valor de velocidade (km/h) que dispara alerta visual na triagem |
| **Limite Tempo Equipamento Conjugado** | Tempo máximo para associar imagens de Equipamentos conjugados |
| **Possui Auditoria?** | Habilita ou desabilita o fluxo de auditoria de Infrações |
| **Requer código do agente para auditoria de imagens válidas?** | Exige código de agente ao auditar imagens aprovadas |
| **Exigir Modelo/Marca na Triagem** | Torna obrigatório o preenchimento de modelo e marca do Veículo na triagem |

---

### Aba Orgão

Dados cadastrais do órgão autuador, utilizados em documentos e exportações.

| Campo | Descrição |
|-------|-----------|
| **Código da Entidade** | Código identificador da entidade no sistema |
| **Nome da Entidade** | Nome oficial da entidade |
| **Código do Órgão Autuador** | Código do órgão perante o DENATRAN/SENATRAN |
| **Telefone do Órgão Autuador** | Telefone de contato do órgão |
| **Nome do Órgão Autuador** | Nome completo do órgão autuador |
| **Nome Gestor Geral** | Nome do responsável pela gestão do sistema |
| **Cargo Gestor Geral** | Cargo do gestor responsável |
| **Endereço do Órgão Autuador** | Logradouro e número da sede |
| **Cidade do Órgão Autuador** | Município da sede do órgão |
| **Estado do Órgão Autuador** | UF da sede do órgão |
| **CEP do Órgão Autuador** | CEP da sede |
| **CNPJ do Órgão Autuador** | CNPJ da entidade autuadora |

---

### Aba Temporizadores

Configura timeouts e limites de tempo para processos automatizados.

| Campo | Descrição |
|-------|-----------|
| **Timeout Heartbeat** | Tempo em segundos sem sinal de um Equipamento antes de considerá-lo offline |
| **Quantidade de enquadramentos de cronotacógrafo** | Número máximo de enquadramentos por Análise de cronotacógrafo |
| **Limite Tempo Interrupção** | Duração mínima em minutos para registrar uma interrupção operacional |
| **Limite Tempo Equipamento Conjugado** | Tempo máximo para vincular imagens de Equipamentos conjugados |

---

### Aba Medição

Parâmetros utilizados no cálculo de indicadores de medição de desempenho.

| Campo | Descrição |
|-------|-----------|
| **Percentual de Discrepância** | Percentual máximo tolerado de discrepância entre contagens |
| **Fator de Medição** | Fator multiplicador aplicado nos cálculos de medição |
| **Índice de Aproveitamento de Imagens** | Meta percentual de aproveitamento de imagens capturadas |
| **Passagem** | Configuração de peso/relevância das passagens na medição |
| **Imagem de Teste** | Parâmetro para tratamento de imagens de teste na medição |
| **Índice de OCR** | Meta percentual de leitura correta pelo OCR |
| **Descrição Capa Relatório de Medição** | Texto exibido na capa dos Relatórios de medição gerados |

---

### Aba Autenticacao

Credenciais para envio de SMS (autenticação de dois fatores).

| Campo | Descrição |
|-------|-----------|
| **Conta do Envio de SMS** | Identificador da conta no provedor de SMS |
| **Token para envio do SMS** | Token de autenticação da API de SMS |

---

### Aba Integrações

Configurações de todas as integrações externas do AxHub.

| Campo | Descrição |
|-------|-----------|
| **Tipo de integração para Exportação** | Define o formato de exportação de Infrações (ex: `ExportacaoInfracaoInmetro`) |
| **Limite de Infrações por Lote de Exportação** | Número máximo de Infrações por lote exportado |
| **Base De Dados Consulta de Veículo | Nome da base SERPRO para consulta de dados de Veículos (ex: `serpro-imperatriz`) |
| **Base de Dados Consulta Exportação** | Base utilizada nas consultas durante a exportação |
| **Consumer Key SerproRadar** | Chave de acesso à API SERPRO Radar |
| **Consumer Secret SerproRadar** | Segredo da chave de acesso SERPRO Radar |
| **Escopo SerproRadar** | Escopo de permissões da integração SERPRO Radar |
| Usuário BHPro** | Usuário para integração com a plataforma BHPro |
| **Senha BHPro** | Senha para integração BHPro |
| **Ambiente de Homologação? (SERPRO)** | Indica se a integração SERPRO está em ambiente de homologação |
| **Client Id Inmetro** | ID do cliente na API do Inmetro |
| **Client Secret Inmetro** | Segredo do cliente na API do Inmetro |
| **Ambiente de Homologação do Inmetro?** | Indica se a integração Inmetro está em ambiente de homologação |

:::warning Atenção — Credenciais SERPRO
Se os campos **Consumer Key**, **Consumer Secret** e **Escopo SerproRadar** estiverem vazios, a consulta automática de proprietário de Veículo via SERPRO ficará inativa. Os dados de proprietário não serão atualizados nas Infrações
:::

---

### Aba Certificados

Certificado digital utilizado para assinar exportações e integrações que exigem autenticação mútua.

| Campo | Descrição |
|-------|-----------|
| **Certificado** | Arquivo do certificado digital (.pfx ou .p12) |
| **Senha Certificado** | Senha de proteção do certificado |

---

### Aba Importação

Limites de tempo para importação de dados de campo.

| Campo | Descrição |
|-------|-----------|
| **Limite de Horas para Importação de Infração | Horas máximas de defasagem aceitas para importar uma Infração |
| **Limite Horas para Importação de Passagens** | Horas máximas de defasagem aceitas para importar passagens de Veículos |

---

### Aba I.A

Configurações do módulo de Inteligência Artificial integrado ao AxHub.

| Campo | Descrição |
|-------|-----------|
| **Habilita Classificação por IA** | Ativa ou desativa a classificação automática de Infrações por IA |

:::info
Quando habilitada, a IA analisa as imagens das Infrações e sugere automaticamente o enquadramento e o descarte, auxiliando os agentes na triagem.
:::

---

### Aba Power BI

Credenciais de conexão com o serviço Power BI para exibição de Relatórios embutidos.

| Campo | Descrição |
|-------|-----------|
| **Authentication Type** | Tipo de autenticação (padrão: `ServicePrincipal`) |
| **Authority Url** | URL da autoridade de autenticação Microsoft |
| **Scope** | Escopo de permissões do Power BI API |
| **Url PowerBiServiceApiRoot** | URL raiz da API do Power BI |
| **Pbi UserName** | E-mail do Usuário Power BI (quando não usar ServicePrincipal) |
| **Pbi Password** | Senha do Usuário Power BI |
| **Application Id** | ID do aplicativo registrado no Azure AD |
| **Application Secret** | Segredo do aplicativo Azure AD |
| **Tenant** | ID do tenant (diretório) no Azure Active Directory |

---

## Armazenamento

Todas as Configurações são persistidas em `TBConfiguracoes` como pares chave-valor:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **TipoConfiguracao** | varchar(100) | Chave identificadora (ex: `PrazoDiasTriagem`, `TempoAnaliseImagem`) |
| **ValorConfiguracao** | texto | Valor serializado em texto (número, JSON, string) |

Essa arquitetura permite adicionar novas Configurações sem alteração de schema do banco de dados.

---

## Navegacao Relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Relacionado | [Webhooks](./webhooks) | Integracoes via webhook configuradas |
| Relacionado | Relatórios Power BI](./relatorios-power-bi) | Configuracao de dashboards |
| Relacionado | [Enquadramentos](./enquadramentos) | códigos de Use Infração (com acento) cadastrados |
| Referência | [Consulta Automática de Veículos](../referencia-tecnica/consulta-automatica-veiculos) | Diagnóstico SERPRO |
