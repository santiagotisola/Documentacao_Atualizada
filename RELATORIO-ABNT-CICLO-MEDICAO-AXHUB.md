# RELATÓRIO TÉCNICO

## ANÁLISE E DOCUMENTAÇÃO DO CICLO COMPLETO DE CADASTRO PARA GERAÇÃO DE MEDIÇÃO NO SISTEMA AXHUB

---

**AXION TECNOLOGIA LTDA.**  
**INTELLIGENCE HUB - AXION IA**

---

**Área:** Engenharia de Software e Suporte Técnico  
**Sistema:** AxHub - Módulo de Medição  
**Período de Análise:** 01 a 18 de junho de 2026  
**Sistemas Analisados:** IPEMPE (Referência) e Goiânia (Análise)

---

**Goiânia, 18 de junho de 2026**

---

## SUMÁRIO

1. INTRODUÇÃO ......................................... 1
   1.1 Contextualização ................................. 1
   1.2 Objetivo ......................................... 1
   1.3 Justificativa .................................... 2
   1.4 Escopo ........................................... 2

2. FUNDAMENTAÇÃO TEÓRICA .............................. 3
   2.1 Sistema AxHub .................................... 3
   2.2 Módulo de Medição ................................ 3
   2.3 Medição de Desempenho Contratual ................. 4
   2.4 Base Legal ....................................... 4

3. METODOLOGIA ........................................ 5
   3.1 Abordagem ........................................ 5
   3.2 Sistemas Analisados .............................. 5
   3.3 Ferramentas Utilizadas ........................... 6
   3.4 Processo de Análise .............................. 6

4. DIAGNÓSTICO DO PROBLEMA ............................ 7
   4.1 Descrição do Problema ............................ 7
   4.2 Manifestação ..................................... 7
   4.3 Análise Preliminar ............................... 8
   4.4 Hipóteses Levantadas ............................. 9

5. ANÁLISE COMPARATIVA ................................ 10
   5.1 Sistema IPEMPE (Referência) ...................... 10
   5.2 Sistema Goiânia (Problemático) ................... 11
   5.3 Diferenças Identificadas ......................... 12
   5.4 Causa Raiz Confirmada ............................ 13

6. ARQUITETURA DO SISTEMA DE MEDIÇÃO .................. 14
   6.1 Modelo Entidade-Relacionamento ................... 14
   6.2 Tabelas Principais ............................... 15
   6.3 Relacionamentos .................................. 16
   6.4 Fluxo de Dados ................................... 17

7. CICLO COMPLETO DE CADASTRO ......................... 18
   7.1 Visão Geral do Processo .......................... 18
   7.2 Etapa 1: Cadastros Básicos ....................... 19
   7.3 Etapa 2: Configuração Contratual ................. 21
   7.4 Etapa 3: Configuração de Recursos ................ 23
   7.5 Etapa 4: Operação do Equipamento ................. 26
   7.6 Etapa 5: Geração do Relatório .................... 27
   7.7 Etapa 6: Finalização ............................. 28

8. FÓRMULAS DE CÁLCULO ................................ 29
   8.1 Cálculo de Horas Efetivas ........................ 29
   8.2 Índice de Operação ............................... 29
   8.3 Cálculo de Descontos ............................. 30
   8.4 Cálculo do Valor Final ........................... 30
   8.5 Exemplo Prático .................................. 31

9. VALIDAÇÕES E DIAGNÓSTICO ........................... 32
   9.1 Validações Obrigatórias .......................... 32
   9.2 Scripts SQL de Diagnóstico ....................... 33
   9.3 Interpretação de Resultados ...................... 35
   9.4 Árvore de Decisão para Diagnóstico ............... 36

10. PROCEDIMENTOS OPERACIONAIS ........................ 37
    10.1 Cadastro de Novo Equipamento ................... 37
    10.2 Correção de Valores Zerados .................... 39
    10.3 Geração de Relatório de Medição ................ 40
    10.4 Validação de Configuração ...................... 41

11. RESULTADOS E DISCUSSÃO ............................ 42
    11.1 Problema Identificado .......................... 42
    11.2 Solução Implementada ........................... 43
    11.3 Validação da Solução ........................... 44
    11.4 Impacto da Correção ............................ 45

12. CONCLUSÕES ........................................ 46
    12.1 Síntese dos Resultados ......................... 46
    12.2 Recomendações .................................. 47
    12.3 Melhorias Futuras .............................. 48
    12.4 Considerações Finais ........................... 49

REFERÊNCIAS ........................................... 50

APÊNDICES ............................................. 51
A - Scripts SQL Completos
B - Exemplos de Configuração
C - Checklist de Validação
D - Glossário de Termos

---

## 1. INTRODUÇÃO

### 1.1 Contextualização

O sistema AxHub é uma plataforma de gerenciamento de fiscalização eletrônica de trânsito desenvolvida pela Axion Tecnologia Ltda. O módulo de Medição é responsável por calcular valores contratuais baseados no desempenho operacional dos equipamentos de fiscalização, gerando relatórios mensais que fundamentam os pagamentos aos prestadores de serviço.

Durante a operação do sistema na cidade de Goiânia/GO, identificou-se que o Relatório de Medição de Equipamento apresentava valores financeiros zerados (R$ 0,00) para o equipamento GYN1R801, embora os dados operacionais (passagens de veículos, horas de operação e índice de disponibilidade) estivessem corretos.

Este relatório documenta a análise completa realizada, desde a identificação do problema até a documentação da solução, incluindo a comparação com o sistema IPEMPE (Instituto de Pesos e Medidas de Pernambuco), que opera corretamente.

### 1.2 Objetivo

#### 1.2.1 Objetivo Geral

Documentar o ciclo completo de cadastro necessário para a geração correta do Relatório de Medição de Equipamento no sistema AxHub, identificando requisitos obrigatórios, dependências entre cadastros e validações necessárias.

#### 1.2.2 Objetivos Específicos

a) Identificar a causa raiz dos valores zerados no relatório de medição de Goiânia;

b) Comparar a configuração entre o sistema IPEMPE (funcionando) e Goiânia (problemático);

c) Mapear o relacionamento completo entre todas as entidades do módulo de medição;

d) Documentar o processo de cadastro em formato operacional para usuários finais;

e) Criar scripts SQL de diagnóstico automatizado para identificação rápida de problemas;

f) Estabelecer procedimentos operacionais padrão (POPs) para cadastro e manutenção.

### 1.3 Justificativa

A documentação completa do ciclo de medição é essencial por diversos motivos:

**1.3.1 Operacional**

Sem valores corretos no relatório de medição, não é possível:
- Finalizar a medição mensal do período;
- Gerar documentos de pagamento aos prestadores;
- Comprovar o cumprimento dos níveis de serviço (SLA) contratuais;
- Calcular descontos por indisponibilidade de equipamentos.

**1.3.2 Financeiro**

A ausência de valores impede:
- O faturamento mensal do contrato;
- A auditoria dos serviços prestados;
- A análise de custos operacionais;
- O planejamento financeiro.

**1.3.3 Contratual**

Configura descumprimento de obrigações contratuais:
- Entrega de medições no prazo acordado;
- Transparência nos cálculos de valores;
- Documentação dos serviços prestados.

**1.3.4 Técnico**

A falta de documentação clara resulta em:
- Dificuldade de replicação do processo em novos contratos;
- Dependência de conhecimento tácito de poucos profissionais;
- Aumento do tempo de resolução de problemas;
- Risco de erros de configuração.

### 1.4 Escopo

#### 1.4.1 Escopo do Trabalho

Este relatório abrange:

a) **Análise técnica** da estrutura de dados do módulo de medição;
b) **Mapeamento completo** das tabelas, relacionamentos e dependências;
c) **Documentação do processo** de cadastro em 6 etapas sequenciais;
d) **Scripts SQL** de diagnóstico, validação e correção;
e) **Procedimentos operacionais** para usuários finais;
f) **Comparação prática** entre configurações corretas e incorretas.

#### 1.4.2 Limitações

Este estudo não abrange:

a) Alterações no código-fonte do sistema AxHub;
b) Modificações na estrutura do banco de dados;
c) Customizações específicas de contratos;
d) Integração com sistemas externos;
e) Aspectos de performance ou otimização.

---

## 2. FUNDAMENTAÇÃO TEÓRICA

### 2.1 Sistema AxHub

O AxHub é um sistema web desenvolvido em tecnologia ASP.NET Core com banco de dados SQL Server, destinado ao gerenciamento completo de operações de fiscalização eletrônica de trânsito. Seus principais módulos incluem:

- **Cadastros Básicos:** Equipamentos, locais, usuários, órgãos;
- **Operações:** Registro de passagens, imagens, infrações;
- **Medição:** Contratos, recursos, interrupções, relatórios;
- **Relatórios:** Diversos relatórios gerenciais e operacionais.

### 2.2 Módulo de Medição

O módulo de Medição é responsável por:

**2.2.1 Gestão Contratual**

Cadastro e acompanhamento de contratos de prestação de serviço, incluindo:
- Dados do contrato (número, órgão, vigência);
- Equipamentos vinculados;
- Valores e índices contratuais;
- Status de execução.

**2.2.2 Controle de Recursos**

Gerenciamento dos recursos alocados aos contratos:
- Recursos por equipamento e faixa de tráfego;
- Valores previstos mensais;
- Percentuais de BDI (Bonificações e Despesas Indiretas);
- Vigência dos recursos.

**2.2.3 Registro de Interrupções**

Controle de períodos de indisponibilidade:
- Data/hora de início e fim;
- Motivo da interrupção;
- Tipo de interrupção;
- Impacto nos índices de operação.

**2.2.4 Geração de Medições**

Cálculo automatizado de valores mensais baseado em:
- Dados operacionais (passagens, horas);
- Índices de disponibilidade;
- Interrupções registradas;
- Valores contratuais;
- Fórmulas de cálculo predefinidas.

### 2.3 Medição de Desempenho Contratual

A medição de desempenho consiste na avaliação quantitativa da prestação de serviços de fiscalização eletrônica, considerando:

**2.3.1 Índices de Disponibilidade**

Percentual de tempo em que o equipamento esteve operacional no período:

```
Índice = (Horas Efetivas / Horas Previstas) × 100

Onde:
- Horas Previstas = Dias do mês × 24 horas
- Horas Efetivas = Horas Previstas - Horas de Interrupção
```

**2.3.2 Volume de Registros**

Quantidade de passagens de veículos registradas, utilizada como indicador de funcionamento do equipamento.

**2.3.3 Qualidade dos Registros**

Percentual de imagens válidas em relação ao total registrado, podendo gerar multas contratuais em caso de baixa qualidade.

### 2.4 Base Legal

A medição de desempenho em contratos de fiscalização eletrônica tem fundamento em:

**2.4.1 Lei Federal nº 11.079/2004**

Institui normas gerais para licitação e contratação de parceria público-privada (PPP), estabelecendo:
- Obrigatoriedade de medição de desempenho;
- Pagamento vinculado ao cumprimento de metas;
- Penalidades por descumprimento.

**2.4.2 Lei Federal nº 8.666/1993**

Lei de Licitações e Contratos Administrativos, que regula:
- Execução contratual;
- Medição de serviços;
- Pagamentos e penalidades.

**2.4.3 Código de Trânsito Brasileiro (Lei nº 9.503/1997)**

Estabelece requisitos para equipamentos de fiscalização eletrônica:
- Certificação metrológica (quando aplicável);
- Requisitos técnicos mínimos;
- Responsabilidades dos órgãos de trânsito.

**2.4.4 Contratos Específicos**

Cada contrato estabelece:
- Índices mínimos de disponibilidade;
- Fórmulas de cálculo de pagamento;
- Penalidades e bonificações;
- Metodologia de medição.

---

## 3. METODOLOGIA

### 3.1 Abordagem

A análise foi conduzida seguindo metodologia de pesquisa aplicada com abordagem qualitativa e quantitativa, estruturada em cinco fases:

**Fase 1: Levantamento do Problema**
- Análise do relatório de medição com valores zerados;
- Coleta de evidências (capturas de tela, logs);
- Levantamento de sintomas e comportamentos anormais.

**Fase 2: Análise Comparativa**
- Seleção de sistema de referência (IPEMPE) funcionando corretamente;
- Coleta de dados de configuração de ambos os sistemas;
- Comparação estrutural entre configurações.

**Fase 3: Investigação Técnica**
- Análise da estrutura do banco de dados;
- Execução de queries SQL diagnósticas;
- Mapeamento de relacionamentos entre entidades;
- Identificação de causa raiz.

**Fase 4: Documentação**
- Elaboração de procedimentos operacionais;
- Criação de scripts SQL de diagnóstico;
- Desenvolvimento de guias para usuários;
- Estruturação de documentação técnica.

**Fase 5: Validação**
- Aplicação de correções no ambiente de teste;
- Validação de valores gerados;
- Revisão da documentação produzida.

### 3.2 Sistemas Analisados

**3.2.1 Sistema IPEMPE (Referência)**

- **URL:** https://ipempe.axhub.axion.ws
- **Órgão:** Instituto de Pesos e Medidas de Pernambuco
- **Status:** Operacional (funcionando corretamente)
- **Equipamento Analisado:** ITZ022R (2 faixas)
- **Valores Configurados:**
  - Valor Previsto: R$ 18.500,00 por faixa
  - BDI: 30%
  - Total com BDI: R$ 24.050,00 por faixa

**3.2.2 Sistema Goiânia (Análise)**

- **URL:** https://goiania.axhub.axion.ws
- **Órgão:** DETRAN/GO - Goiânia
- **Status:** Problemático (valores zerados)
- **Equipamento Analisado:** GYN1R801 (2 faixas)
- **Problema:** Valores financeiros aparecendo como R$ 0,00
- **Dados Operacionais:** Corretos (584.740 e 609.222 passagens)

### 3.3 Ferramentas Utilizadas

**3.3.1 Acesso aos Sistemas**

- Navegador: Microsoft Edge / Google Chrome
- Autenticação: OIDC (OpenID Connect)
- Acesso VPN: Não foi necessário

**3.3.2 Análise de Banco de Dados**

- SQL Server Management Studio (SSMS) 19.0
- Linguagem: Transact-SQL (T-SQL)
- Servidor: SQL Server 2019

**3.3.3 Documentação**

- Editor: Visual Studio Code
- Formato: Markdown (MD)
- Versionamento: Git / GitHub

### 3.4 Processo de Análise

**3.4.1 Coleta de Dados**

```sql
-- Exemplo de query utilizada para coleta
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.ValorPrevisto,
    r.Bdi,
    c.NumeroContrato
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
LEFT JOIN TBContratos c ON c.Id = r.ContratoId
WHERE e.CodigoEquipamento IN ('ITZ022R', 'GYN1R801');
```

**3.4.2 Análise Comparativa**

Comparação estruturada dos resultados:

| Aspecto | IPEMPE | Goiânia |
|---------|--------|---------|
| Equipamento ativo | ✅ Sim | ✅ Sim |
| Faixas cadastradas | ✅ 2 faixas | ✅ 2 faixas |
| Contrato ativo | ✅ Sim | ✅ Sim |
| Equipamento vinculado | ✅ Sim | ✅ Sim |
| Recursos cadastrados | ✅ 2 recursos | ❌ 0 recursos |
| Valores preenchidos | ✅ Sim | ❌ Não aplicável |

**Conclusão da Análise:** A diferença crítica é a ausência de recursos cadastrados em Goiânia.

---

## 4. DIAGNÓSTICO DO PROBLEMA

### 4.1 Descrição do Problema

#### 4.1.1 Sintomas Observados

O Relatório de Medição de Equipamento do sistema de Goiânia apresentava os seguintes sintomas para o equipamento GYN1R801:

**Valores Zerados:**
- VALOR PREVISTO: R$ 0,00
- VALOR FAIXA: R$ 0,00
- BDI (%): 0,00%
- TOTAL: R$ 0,00

**Valores Corretos:**
- VEÍCULOS: 584.740 (Faixa 1) e 609.222 (Faixa 2)
- TOTAL (HORAS): 744,00 horas
- ÍNDICE OPERAÇÃO: 100,00%
- INTERRUPÇÕES: 0 horas

#### 4.1.2 Impacto Operacional

O problema impedia:
- Finalização da medição mensal de maio/2026;
- Geração de documentos de pagamento;
- Cálculo de valores do contrato;
- Auditoria dos serviços prestados.

#### 4.1.3 Contexto Temporal

- **Período da Medição:** Maio de 2026 (01/05/2026 a 31/05/2026)
- **Data de Identificação:** 17 de junho de 2026
- **Data de Análise:** 18 de junho de 2026
- **Equipamentos Afetados:** GYN1R801 (Faixa 1 e Faixa 2)
- **Equipamentos Funcionando:** GYN1R803, GYN1R804, GYN1R805

### 4.2 Manifestação

#### 4.2.1 Tela do Relatório

O relatório apresentava a seguinte estrutura:

```
EQUIPAMENTO: GYN1R801
PERÍODO: Maio/2026

Faixa | Veículos | Total (H) | Índice | Valor Prev. | BDI % | Total
------|----------|-----------|--------|-------------|-------|-------
  1   | 584.740  |   744,00  | 100,00 | R$ 0,00     | 0,00  | R$ 0,00
  2   | 609.222  |   744,00  | 100,00 | R$ 0,00     | 0,00  | R$ 0,00
```

#### 4.2.2 Comportamento Esperado

O relatório deveria apresentar (baseado no padrão IPEMPE):

```
EQUIPAMENTO: GYN1R801
PERÍODO: Maio/2026

Faixa | Veículos | Total (H) | Índice | Valor Prev.  | BDI % | Total
------|----------|-----------|--------|--------------|-------|-------------
  1   | 584.740  |   744,00  | 100,00 | R$ 15.000,00 | 25,00 | R$ 18.750,00
  2   | 609.222  |   744,00  | 100,00 | R$ 15.000,00 | 25,00 | R$ 18.750,00

TOTAL GERAL: R$ 37.500,00
```

#### 4.2.3 Diferença entre Esperado e Observado

| Campo | Esperado | Observado | Status |
|-------|----------|-----------|--------|
| Valor Previsto | R$ 15.000,00 | R$ 0,00 | ❌ Erro |
| BDI (%) | 25,00% | 0,00% | ❌ Erro |
| Total | R$ 18.750,00 | R$ 0,00 | ❌ Erro |
| Veículos | 584.740 | 584.740 | ✅ Correto |
| Índice | 100,00% | 100,00% | ✅ Correto |

### 4.3 Análise Preliminar

#### 4.3.1 Verificações Iniciais

**Verificação 1: Status do Equipamento**

```sql
SELECT Id, CodigoEquipamento, Status 
FROM TBEquipamentos 
WHERE CodigoEquipamento = 'GYN1R801';
```

**Resultado:** ✅ Equipamento ativo (Status = 1)

**Verificação 2: Faixas Cadastradas**

```sql
SELECT f.Id, f.NumeroFaixa, e.CodigoEquipamento
FROM TBFaixas f
JOIN TBEquipamentos e ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801';
```

**Resultado:** ✅ 2 faixas cadastradas (Faixa 1 e Faixa 2)

**Verificação 3: Passagens Registradas**

```sql
SELECT f.NumeroFaixa, COUNT(*) AS TotalPassagens
FROM TBPassagens p
JOIN TBEquipamentos e ON p.EquipamentoId = e.Id
JOIN TBFaixas f ON p.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
  AND p.DataHora >= '2026-05-01'
  AND p.DataHora < '2026-06-01'
GROUP BY f.NumeroFaixa;
```

**Resultado:** ✅ Passagens registradas (584.740 e 609.222)

**Verificação 4: Contrato Vinculado**

```sql
SELECT c.NumeroContrato, c.Status, ce.Id AS VinculoId
FROM TBEquipamentos e
JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
JOIN TBContratos c ON c.Id = ce.ContratoId
WHERE e.CodigoEquipamento = 'GYN1R801';
```

**Resultado:** ✅ Contrato vinculado e ativo

#### 4.3.2 Ponto Crítico Identificado

**Verificação 5: Recursos Cadastrados** ⚠️

```sql
SELECT r.Id, r.ValorPrevisto, r.Bdi
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801';
```

**Resultado:** ❌ 0 recursos cadastrados (r.Id = NULL)

### 4.4 Hipóteses Levantadas

#### 4.4.1 Hipótese 1: Problema no Código do Sistema

**Descrição:** O código do relatório poderia estar com erro ao buscar os valores.

**Teste:** Comparação com sistema IPEMPE (mesmo código)

**Resultado:** ❌ Descartada - IPEMPE funciona corretamente com o mesmo código

#### 4.4.2 Hipótese 2: Problema de Permissão de Acesso

**Descrição:** O usuário poderia não ter permissão para ver os valores.

**Teste:** Verificação de perfil do usuário e valores de outros equipamentos

**Resultado:** ❌ Descartada - GYN1R803/804/805 mostram valores corretamente

#### 4.4.3 Hipótese 3: Valores Configurados como Zero

**Descrição:** Os recursos poderiam estar cadastrados mas com ValorPrevisto = 0.

**Teste:** Query SQL verificando valores dos recursos

**Resultado:** ❌ Descartada - Não há recursos cadastrados (NULL, não zero)

#### 4.4.4 Hipótese 4: Recursos Não Cadastrados ✅ CONFIRMADA

**Descrição:** As faixas do equipamento não possuem recursos cadastrados na tabela TBRecursos.

**Teste:** Query comparativa entre GYN1R801 e GYN1R803

```sql
-- Comparação de recursos
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    CASE WHEN r.Id IS NULL THEN 'NÃO CADASTRADO' 
         ELSE 'CADASTRADO' END AS Status
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803');
```

**Resultado:**

| Equipamento | Faixa | Status |
|-------------|-------|--------|
| GYN1R801 | 1 | NÃO CADASTRADO |
| GYN1R801 | 2 | NÃO CADASTRADO |
| GYN1R803 | 1 | CADASTRADO |
| GYN1R803 | 2 | CADASTRADO |

**Conclusão:** ✅ CAUSA RAIZ IDENTIFICADA

---

## 5. ANÁLISE COMPARATIVA

### 5.1 Sistema IPEMPE (Referência)

#### 5.1.1 Configuração Completa

**Equipamento Analisado:** ITZ022R

**Cadastros Básicos:**
```sql
-- Equipamento
Id: 523
CodigoEquipamento: ITZ022R
Local: Avenida Recife, Km 12
Status: Ativo (1)

-- Faixas
FaixaId: 1045 | NumeroFaixa: 1 | Sentido: Norte
FaixaId: 1046 | NumeroFaixa: 2 | Sentido: Sul
```

**Contrato:**
```sql
ContratoId: 42
NumeroContrato: CT-IPEM-2026
Orgao: IPEM/PE
DataInicio: 2026-01-01
DataFim: 2026-12-31
Status: Ativo (1)
```

**Recursos (⚠️ PONTO CRÍTICO):**
```sql
-- Recurso Faixa 1
RecursoId: 523
Descricao: Radar ITZ022R - Faixa 1
EquipamentoId: 523
FaixaId: 1045
ContratoId: 42
ValorPrevisto: 18500.00
Bdi: 30.00
Status: Ativo (1)
DataInicio: 2026-01-01
DataFim: 2026-12-31

-- Recurso Faixa 2
RecursoId: 524
Descricao: Radar ITZ022R - Faixa 2
EquipamentoId: 523
FaixaId: 1046
ContratoId: 42
ValorPrevisto: 18500.00
Bdi: 30.00
Status: Ativo (1)
DataInicio: 2026-01-01
DataFim: 2026-12-31
```

**Resultado no Relatório:**
```
Faixa | Valor Previsto | BDI % | Total
------|----------------|-------|-------------
  1   | R$ 18.500,00   | 30,00 | R$ 24.050,00
  2   | R$ 18.500,00   | 30,00 | R$ 24.050,00
```

#### 5.1.2 Características da Configuração Correta

1. ✅ **Completude:** Todos os cadastros necessários estão presentes
2. ✅ **Relacionamentos:** Todas as entidades estão corretamente vinculadas
3. ✅ **Valores:** Campos obrigatórios preenchidos com valores > 0
4. ✅ **Status:** Todos os registros estão ativos
5. ✅ **Vigência:** Datas cobrem o período da medição

### 5.2 Sistema Goiânia (Problemático)

#### 5.2.1 Configuração Identificada (ANTES DA CORREÇÃO)

**Equipamento Analisado:** GYN1R801

**Cadastros Básicos:**
```sql
-- Equipamento
Id: 801
CodigoEquipamento: GYN1R801
Local: Avenida Goiás, Km 5
Status: Ativo (1)

-- Faixas
FaixaId: 1601 | NumeroFaixa: 1 | Sentido: Leste
FaixaId: 1602 | NumeroFaixa: 2 | Sentido: Oeste
```

**Contrato:**
```sql
ContratoId: 12
NumeroContrato: CT-2026-001
Orgao: DETRAN/GO
DataInicio: 2026-01-01
DataFim: 2026-12-31
Status: Ativo (1)
```

**Recursos (⚠️ PROBLEMA IDENTIFICADO):**
```sql
-- Query retorna 0 linhas
SELECT * FROM TBRecursos 
WHERE EquipamentoId = 801;
```

**Resultado:** ❌ NENHUM RECURSO CADASTRADO

**Resultado no Relatório:**
```
Faixa | Valor Previsto | BDI % | Total
------|----------------|-------|--------
  1   | R$ 0,00        | 0,00  | R$ 0,00
  2   | R$ 0,00        | 0,00  | R$ 0,00
```

#### 5.2.2 Comparação com Equipamentos Funcionando no Mesmo Sistema

**Equipamento GYN1R803 (Mesmo Sistema, Funcionando):**

```sql
-- Recursos cadastrados
RecursoId: 1803 | ValorPrevisto: 15000.00 | Bdi: 25.00
RecursoId: 1804 | ValorPrevisto: 15000.00 | Bdi: 25.00

-- Resultado no relatório
Faixa | Valor Previsto | BDI % | Total
------|----------------|-------|-------------
  1   | R$ 15.000,00   | 25,00 | R$ 18.750,00
  2   | R$ 15.000,00   | 25,00 | R$ 18.750,00
```

**Conclusão:** GYN1R803 funciona porque tem recursos cadastrados.

### 5.3 Diferenças Identificadas

#### 5.3.1 Tabela Comparativa

| Aspecto | IPEMPE (✅) | GYN1R801 (❌) | GYN1R803 (✅) |
|---------|-------------|---------------|---------------|
| **Equipamento ativo** | Sim | Sim | Sim |
| **Faixas cadastradas** | 2 | 2 | 2 |
| **Contrato ativo** | Sim | Sim | Sim |
| **Vinculação equip-contrato** | Sim | Sim | Sim |
| **Recursos cadastrados** | 2 | 0 ❌ | 2 |
| **ValorPrevisto** | R$ 18.500 | NULL ❌ | R$ 15.000 |
| **BDI** | 30% | NULL ❌ | 25% |
| **Status recurso** | Ativo | N/A ❌ | Ativo |
| **Relatório** | ✅ OK | ❌ Zerado | ✅ OK |

#### 5.3.2 Análise das Diferenças

**Diferença Crítica:**

A única diferença relevante entre as configurações é a **ausência de registros na tabela TBRecursos** para o equipamento GYN1R801.

**Evidências:**

1. Todos os outros cadastros estão corretos;
2. O equipamento está operando normalmente (passagens registradas);
3. Equipamentos com recursos cadastrados (GYN1R803) funcionam corretamente;
4. A ausência de recursos resulta em valores NULL no cálculo;
5. Valores NULL são exibidos como R$ 0,00 no relatório.

**Cadeia de Causalidade:**

```
Recurso não cadastrado
         ↓
TBRecursos.ValorPrevisto = NULL
         ↓
Cálculo retorna NULL
         ↓
Relatório exibe R$ 0,00
```

### 5.4 Causa Raiz Confirmada

#### 5.4.1 Afirmação da Causa Raiz

**CAUSA RAIZ CONFIRMADA:**

"O equipamento GYN1R801 não possui recursos cadastrados na tabela TBRecursos para as faixas 1 e 2, resultando em valores NULL para ValorPrevisto e BDI, que são exibidos como R$ 0,00 no Relatório de Medição de Equipamento."

#### 5.4.2 Evidências Conclusivas

**Evidência 1: Query Diagnóstica**

```sql
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    CASE WHEN r.Id IS NULL 
         THEN '🔴 RECURSO NÃO CADASTRADO'
         ELSE '✅ OK' 
    END AS Diagnostico
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
WHERE e.CodigoEquipamento = 'GYN1R801';
```

**Resultado:**

| CodigoEquipamento | NumeroFaixa | RecursoId | Diagnostico |
|-------------------|-------------|-----------|-------------|
| GYN1R801 | 1 | NULL | 🔴 RECURSO NÃO CADASTRADO |
| GYN1R801 | 2 | NULL | 🔴 RECURSO NÃO CADASTRADO |

**Evidência 2: Comparação Direta**

Executando a mesma query para GYN1R803:

| CodigoEquipamento | NumeroFaixa | RecursoId | Diagnostico |
|-------------------|-------------|-----------|-------------|
| GYN1R803 | 1 | 1803 | ✅ OK |
| GYN1R803 | 2 | 1804 | ✅ OK |

**Evidência 3: Simulação de Correção**

Após cadastrar recursos para GYN1R801 em ambiente de teste:

```sql
-- Inserir recursos (teste)
INSERT INTO TBRecursos (...) VALUES (...);

-- Executar query diagnóstica novamente
-- Resultado:
| GYN1R801 | 1 | 9001 | ✅ OK |
| GYN1R801 | 2 | 9002 | ✅ OK |

-- Gerar relatório novamente
-- Resultado: Valores aparecem corretamente (R$ 15.000,00)
```

#### 5.4.3 Conclusão da Análise Comparativa

A análise comparativa entre os sistemas IPEMPE, GYN1R803 e GYN1R801 confirma inequivocamente que:

1. **A causa do problema não é de código:** O mesmo sistema funciona corretamente no IPEMPE e em outros equipamentos de Goiânia;

2. **A causa do problema não é de dados operacionais:** Passagens, horas e índices estão corretos;

3. **A causa do problema é de configuração:** Especificamente, a falta de cadastro de recursos;

4. **A solução é clara:** Cadastrar recursos para as faixas 1 e 2 do equipamento GYN1R801.

---

## 6. ARQUITETURA DO SISTEMA DE MEDIÇÃO

### 6.1 Modelo Entidade-Relacionamento

#### 6.1.1 Diagrama ER Simplificado

```
┌─────────────────┐         ┌─────────────────┐
│  TBEquipamentos │─────────│    TBFaixas     │
│                 │ 1     * │                 │
│ Id              │         │ Id              │
│ CodigoEquipamen │         │ NumeroFaixa     │
│ Local           │         │ EquipamentoId   │
│ Status          │         │ Sentido         │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │ *                         │ *
         │                           │
         │        ┌──────────────────┴────────┐
         │        │                            │
         │        │       TBRecursos           │
         │        │                            │
         │        │ Id                         │
         └────────┤ EquipamentoId              │
         *        │ FaixaId                    │
┌────────┴──────┐ │ ContratoId                │
│ TBContratos   │ │ ValorPrevisto  ⚠️         │
│               │─┤ Bdi            ⚠️         │
│ Id            │ │ Status                    │
│ NumeroContrato│ │ DataInicio                │
│ Orgao         │ │ DataFim                   │
│ DataInicio    │ └───────────────────────────┘
│ DataFim       │
│ Status        │
└───────┬───────┘
        │
        │ *
        │
┌───────┴───────────────────┐
│ TBContratosEquipamentos   │
│                           │
│ Id                        │
│ ContratoId                │
│ EquipamentoId             │
└───────────────────────────┘

┌─────────────────┐
│  TBPassagens    │ (Dados Operacionais)
│                 │
│ Id              │
│ EquipamentoId   │
│ FaixaId         │
│ DataHora        │
│ Placa           │
└─────────────────┘

┌─────────────────┐
│ TBInterrupcoes  │ (Controle de Paradas)
│                 │
│ Id              │
│ EquipamentoId   │
│ DataHoraInicio  │
│ DataHoraFim     │
│ Motivo          │
└─────────────────┘
```

**Legenda:**
- ⚠️ : Campos críticos para o relatório de medição
- 1 : Um
- * : Muitos

#### 6.1.2 Cardinalidades

| Relacionamento | Cardinalidade | Descrição |
|----------------|---------------|-----------|
| Equipamento → Faixa | 1:N | Um equipamento tem várias faixas |
| Equipamento → Recurso | 1:N | Um equipamento tem vários recursos |
| Faixa → Recurso | 1:1 | Cada faixa tem um recurso |
| Contrato → Recurso | 1:N | Um contrato tem vários recursos |
| Contrato → Equipamento | N:M | Relação muitos-para-muitos (via TBContratosEquipamentos) |
| Equipamento → Passagem | 1:N | Um equipamento registra várias passagens |
| Equipamento → Interrupção | 1:N | Um equipamento pode ter várias interrupções |

### 6.2 Tabelas Principais

#### 6.2.1 TBEquipamentos

**Finalidade:** Cadastro dos equipamentos de fiscalização.

**Campos Principais:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primária |
| CodigoEquipamento | VARCHAR(50) | Sim | Código único (ex: GYN1R801) |
| Local | VARCHAR(500) | Sim | Localização do equipamento |
| Status | BIT | Sim | Ativo (1) ou Inativo (0) |
| Tipo | VARCHAR(50) | Não | Radar, OCR, Barreira, etc. |

**Dependências:**
- Não depende de outras tabelas
- É referenciado por: TBFaixas, TBRecursos, TBPassagens, TBInterrupcoes

#### 6.2.2 TBFaixas

**Finalidade:** Cadastro das faixas de tráfego de cada equipamento.

**Campos Principais:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primária |
| EquipamentoId | INT | Sim | FK para TBEquipamentos |
| NumeroFaixa | INT | Sim | 1, 2, 3, etc. |
| Sentido | VARCHAR(50) | Não | Norte, Sul, Leste, Oeste |

**Dependências:**
- Depende de: TBEquipamentos
- É referenciado por: TBRecursos, TBPassagens

#### 6.2.3 TBContratos

**Finalidade:** Cadastro dos contratos de prestação de serviço.

**Campos Principais:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primária |
| NumeroContrato | VARCHAR(100) | Sim | Número do contrato |
| Orgao | VARCHAR(200) | Sim | Órgão contratante |
| DataInicio | DATE | Sim | Início da vigência |
| DataFim | DATE | Sim | Fim da vigência |
| Status | BIT | Sim | Ativo (1) ou Inativo (0) |

**Dependências:**
- Não depende de outras tabelas
- É referenciado por: TBRecursos, TBContratosEquipamentos

#### 6.2.4 TBRecursos ⚠️ TABELA CRÍTICA

**Finalidade:** Definição dos valores financeiros por equipamento e faixa.

**Campos Principais:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primária |
| Descricao | VARCHAR(500) | Sim | Nome do recurso |
| EquipamentoId | INT | Sim | FK para TBEquipamentos |
| FaixaId | INT | Sim | FK para TBFaixas |
| ContratoId | INT | Sim | FK para TBContratos |
| **ValorPrevisto** | DECIMAL(18,2) | **Sim** ⚠️ | Valor mensal da faixa |
| **Bdi** | DECIMAL(5,2) | **Sim** ⚠️ | Percentual de BDI |
| Status | BIT | Sim | Ativo (1) ou Inativo (0) |
| DataInicio | DATE | Sim | Início da vigência |
| DataFim | DATE | Sim | Fim da vigência |

**Dependências:**
- Depende de: TBEquipamentos, TBFaixas, TBContratos
- **É ESSENCIAL para o relatório de medição**

**Regras de Negócio:**
1. Deve haver 1 recurso para cada faixa do equipamento
2. ValorPrevisto deve ser > 0
3. Bdi deve ser > 0
4. Status deve ser Ativo (1)
5. DataInicio <= data da medição <= DataFim

#### 6.2.5 TBContratosEquipamentos

**Finalidade:** Relacionamento muitos-para-muitos entre contratos e equipamentos.

**Campos Principais:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primária |
| ContratoId | INT | Sim | FK para TBContratos |
| EquipamentoId | INT | Sim | FK para TBEquipamentos |

**Dependências:**
- Depende de: TBContratos, TBEquipamentos

#### 6.2.6 TBPassagens

**Finalidade:** Registro de passagens de veículos detectadas pelos equipamentos.

**Campos Principais:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Id | BIGINT | Sim | Chave primária |
| EquipamentoId | INT | Sim | FK para TBEquipamentos |
| FaixaId | INT | Sim | FK para TBFaixas |
| DataHora | DATETIME | Sim | Data/hora da passagem |
| Placa | VARCHAR(10) | Não | Placa do veículo |
| Velocidade | INT | Não | Velocidade registrada |

**Dependências:**
- Depende de: TBEquipamentos, TBFaixas
- Usado para calcular: Volume de registros no relatório

#### 6.2.7 TBInterrupcoes

**Finalidade:** Registro de períodos de indisponibilidade dos equipamentos.

**Campos Principais:**

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Id | INT | Sim | Chave primária |
| EquipamentoId | INT | Sim | FK para TBEquipamentos |
| DataHoraInicio | DATETIME | Sim | Início da interrupção |
| DataHoraFim | DATETIME | Sim | Fim da interrupção |
| Motivo | VARCHAR(500) | Sim | Descrição do problema |
| Tipo | VARCHAR(50) | Não | Manutenção, Falha, etc. |

**Dependências:**
- Depende de: TBEquipamentos
- Usado para calcular: Índice de operação no relatório

### 6.3 Relacionamentos

#### 6.3.1 Relacionamentos Obrigatórios

**Para um equipamento aparecer no relatório de medição com valores:**

```
TBEquipamentos (Status = 1)
      ↓ (1:N)
TBFaixas
      ↓ (N:M via TBContratosEquipamentos)
TBContratos (Status = 1, vigência válida)
      ↓ (1:N)
TBRecursos ⚠️ (Status = 1, valores > 0)
      ↑ (N:1)
TBFaixas (mesma faixa)
```

**Sequência de Dependências:**

1. Equipamento deve existir e estar ativo
2. Equipamento deve ter faixas cadastradas
3. Equipamento deve estar vinculado a um contrato ativo
4. **Cada faixa deve ter um recurso cadastrado** ⚠️
5. Recursos devem ter valores > 0 e estar ativos

#### 6.3.2 Relacionamentos Opcionais

**Dados operacionais (não bloqueiam o relatório):**

- TBPassagens: Registros de veículos (afeta volume, não bloqueia)
- TBInterrupcoes: Períodos de parada (afeta índice, não bloqueia)
- TBHeartbeatEquipamentos: Status de comunicação (monitoramento)

#### 6.3.3 Diagrama de Dependências

```
                  OBRIGATÓRIOS
┌─────────────────────────────────────────┐
│                                         │
│  1. TBEquipamentos (Status = 1)        │
│              ↓                          │
│  2. TBFaixas (NumeroFaixa)             │
│              ↓                          │
│  3. TBContratos (Status = 1)           │
│              ↓                          │
│  4. TBContratosEquipamentos (vínculo)  │
│              ↓                          │
│  5. TBRecursos ⚠️ (CRÍTICO)            │
│     - EquipamentoId                    │
│     - FaixaId                          │
│     - ContratoId                       │
│     - ValorPrevisto > 0                │
│     - Bdi > 0                          │
│     - Status = 1                       │
│     - Vigência válida                  │
│                                         │
└─────────────────────────────────────────┘

                   OPCIONAIS
┌─────────────────────────────────────────┐
│                                         │
│  • TBPassagens (volume de registros)   │
│  • TBInterrupcoes (disponibilidade)    │
│  • TBHeartbeatEquipamentos (status)    │
│                                         │
└─────────────────────────────────────────┘
```

### 6.4 Fluxo de Dados

#### 6.4.1 Fluxo de Geração do Relatório

**Passo 1: Seleção de Dados**

Usuário seleciona:
- Contrato
- Período (Mês/Ano)
- Equipamentos

**Passo 2: Consulta Principal**

```sql
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.ValorPrevisto, -- ⚠️ Se NULL, exibe R$ 0,00
    r.Bdi,           -- ⚠️ Se NULL, exibe 0,00%
    -- ... outros campos
FROM TBEquipamentos e
JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
    AND r.Status = 1
WHERE ...
```

**Passo 3: Cálculo de Dados Operacionais**

- Passagens: COUNT de TBPassagens no período
- Interrupções: SUM de horas em TBInterrupcoes
- Índice: Cálculo baseado em horas

**Passo 4: Cálculo de Valores Financeiros**

```
SE TBRecursos.ValorPrevisto É NULL ENTÃO
    Valor Previsto = R$ 0,00  ← ❌ PROBLEMA!
    BDI = 0,00%
    Total = R$ 0,00
SENÃO
    Valor Previsto = TBRecursos.ValorPrevisto
    Desconto = Valor Previsto × (1 - Índice)
    Valor Faixa = Valor Previsto - Desconto
    Valor BDI = Valor Faixa × (BDI / 100)
    Total = Valor Faixa + Valor BDI
FIM SE
```

**Passo 5: Apresentação**

Dados são formatados e exibidos no relatório.

#### 6.4.2 Pontos de Falha

| Ponto | Problema | Sintoma | Solução |
|-------|----------|---------|---------|
| TBEquipamentos.Status = 0 | Equipamento inativo | Não aparece no relatório | Ativar equipamento |
| TBFaixas não cadastradas | Sem faixas | Não aparece no relatório | Cadastrar faixas |
| TBContratos.Status = 0 | Contrato inativo | Não aparece no relatório | Ativar contrato |
| TBContratosEquipamentos vazio | Sem vínculo | Não aparece no relatório | Vincular equipamento |
| **TBRecursos vazio** ⚠️ | **Sem recursos** | **Valores zerados** | **Cadastrar recursos** |
| TBRecursos.ValorPrevisto = 0 | Valor zerado | Valores zerados | Preencher valor |
| TBRecursos.Status = 0 | Recurso inativo | Valores zerados | Ativar recurso |

---

## 7. CICLO COMPLETO DE CADASTRO

### 7.1 Visão Geral do Processo

#### 7.1.1 Fluxograma de Cadastro

```
INÍCIO
  ↓
┌─────────────────────────────┐
│ ETAPA 1: CADASTROS BÁSICOS  │
│ • Cadastrar Equipamento     │
│ • Cadastrar Faixas          │
│ • Ativar Equipamento        │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ ETAPA 2: CONFIGURAÇÃO       │
│          CONTRATUAL         │
│ • Cadastrar Contrato        │
│ • Definir Vigência          │
│ • Vincular Equipamentos     │
│ • Ativar Contrato           │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ ETAPA 3: CONFIGURAÇÃO DE    │
│          RECURSOS ⚠️        │
│ • Cadastrar Recurso/Faixa   │
│ • Vincular ao Contrato      │
│ • Vincular ao Equipamento   │
│ • Vincular à Faixa          │
│ • Definir Valor Previsto    │
│ • Definir BDI               │
│ • Definir Vigência          │
│ • Ativar Recurso            │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ ETAPA 4: OPERAÇÃO DO        │
│          EQUIPAMENTO        │
│ • Passagens (automático)    │
│ • Heartbeat (automático)    │
│ • Interrupções (manual)     │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ ETAPA 5: GERAÇÃO DO         │
│          RELATÓRIO          │
│ • Acessar Nova Medição      │
│ • Selecionar Contrato       │
│ • Selecionar Período        │
│ • Selecionar Equipamentos   │
│ • Gerar Relatório           │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│ ETAPA 6: FINALIZAÇÃO        │
│ • Revisar Medição           │
│ • Ajustar Interrupções      │
│ • Finalizar Medição         │
└──────────┬──────────────────┘
           ↓
         FIM
```

#### 7.1.2 Tempo Estimado por Etapa

| Etapa | Tempo (min) | Frequência |
|-------|-------------|------------|
| 1 - Cadastros Básicos | 5-10 | Por equipamento novo |
| 2 - Configuração Contratual | 10-15 | Por contrato novo |
| 3 - Configuração de Recursos ⚠️ | 10-15 | Por equipamento novo |
| 4 - Operação | Contínuo | Automático |
| 5 - Geração de Relatório | 2-5 | Mensal |
| 6 - Finalização | 10-30 | Mensal |

**Tempo total para novo equipamento:** 25-40 minutos  
**Tempo para medição mensal:** 12-35 minutos

### 7.2 Etapa 1: Cadastros Básicos

#### 7.2.1 Objetivo

Cadastrar o equipamento e suas faixas de tráfego no sistema.

#### 7.2.2 Pré-requisitos

- Acesso ao sistema AxHub
- Perfil de usuário com permissão de cadastro
- Dados do equipamento (código, localização)

#### 7.2.3 Procedimento 1.1: Cadastrar Equipamento

**Menu:** Cadastros → Equipamentos → Novo Equipamento

**Campos Obrigatórios:**

| Campo | Exemplo | Validação |
|-------|---------|-----------|
| Código do Equipamento | GYN1R801 | Único no sistema |
| Local | Av. Goiás, Km 5 | Texto descritivo |
| Tipo | Radar | Lista predefinida |
| Status | Ativo | Checkbox marcado |

**Campos Opcionais:**

- Latitude/Longitude (para mapa)
- Limite de Velocidade
- Observações

**Exemplo de Cadastro:**

```
Código: GYN1R801
Local: Avenida Goiás, Km 5 - Sentido Centro
Tipo: Radar Fixo
Fabricante: (opcional)
Modelo: (opcional)
Status: ☑ Ativo
```

**Validação SQL:**

```sql
-- Verificar se equipamento foi cadastrado
SELECT 
    Id,
    CodigoEquipamento,
    Local,
    Status,
    CASE WHEN Status = 1 THEN '✅ ATIVO' 
         ELSE '❌ INATIVO' END AS StatusDesc
FROM TBEquipamentos
WHERE CodigoEquipamento = 'GYN1R801';
```

**Resultado Esperado:**

| Id | CodigoEquipamento | StatusDesc |
|----|-------------------|------------|
| 801 | GYN1R801 | ✅ ATIVO |

#### 7.2.4 Procedimento 1.2: Cadastrar Faixas

**Menu:** Cadastros → Equipamentos → [Selecionar Equipamento] → Editar → Aba "Faixas"

**Processo:**

Para cada faixa de tráfego do equipamento:

1. Clicar em "Adicionar Faixa"
2. Preencher dados
3. Salvar

**Campos por Faixa:**

| Campo | Faixa 1 | Faixa 2 |
|-------|---------|---------|
| Número da Faixa | 1 | 2 |
| Sentido | Leste | Oeste |
| Limite Velocidade | 60 km/h | 60 km/h |

**Validação SQL:**

```sql
-- Verificar faixas cadastradas
SELECT 
    f.Id AS FaixaId,
    e.CodigoEquipamento,
    f.NumeroFaixa,
    f.Sentido,
    COUNT(f.Id) OVER (PARTITION BY e.Id) AS TotalFaixas
FROM TBFaixas f
JOIN TBEquipamentos e ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
ORDER BY f.NumeroFaixa;
```

**Resultado Esperado:**

| FaixaId | CodigoEquipamento | NumeroFaixa | Sentido | TotalFaixas |
|---------|-------------------|-------------|---------|-------------|
| 1601 | GYN1R801 | 1 | Leste | 2 |
| 1602 | GYN1R801 | 2 | Oeste | 2 |

#### 7.2.5 Checklist Etapa 1

```
ETAPA 1: CADASTROS BÁSICOS
Data: ___/___/______  Equipamento: ______________

[ ] Equipamento cadastrado em TBEquipamentos
[ ] Código único e correto
[ ] Local descritivo preenchido
[ ] Status = Ativo (checkbox marcado)
[ ] Faixa 1 cadastrada
[ ] Faixa 2 cadastrada (se aplicável)
[ ] Faixa 3 cadastrada (se aplicável)
[ ] Sentidos preenchidos
[ ] Validação SQL executada
[ ] Equipamento aparece na listagem

Responsável: _________________ Visto: _______
```

### 7.3 Etapa 2: Configuração Contratual

#### 7.3.1 Objetivo

Criar o contrato e vincular os equipamentos que farão parte dele.

#### 7.3.2 Pré-requisitos

- Equipamento(s) cadastrado(s) na Etapa 1
- Dados do contrato (número, órgão, vigência)
- Valores contratuais definidos

#### 7.3.3 Procedimento 2.1: Cadastrar Contrato

**Menu:** Medição → Contratos → Novo Contrato

**Campos Obrigatórios:**

| Campo | Exemplo | Formato |
|-------|---------|---------|
| Número do Contrato | CT-2026-001 | Texto |
| Órgão | DETRAN/GO | Texto |
| Data Início | 01/01/2026 | Data |
| Data Fim | 31/12/2026 | Data |
| Status | Ativo | Checkbox |

**Exemplo de Cadastro:**

```
Número do Contrato: CT-2026-001
Órgão: DETRAN/GO - Goiânia
Objeto: Fiscalização Eletrônica de Trânsito
Data Início: 01/01/2026
Data Fim: 31/12/2026
Status: ☑ Ativo
```

**Validação SQL:**

```sql
-- Verificar contrato cadastrado
SELECT 
    Id AS ContratoId,
    NumeroContrato,
    Orgao,
    CONVERT(VARCHAR(10), DataInicio, 103) AS Inicio,
    CONVERT(VARCHAR(10), DataFim, 103) AS Fim,
    CASE WHEN Status = 1 THEN 'Ativo' ELSE 'Inativo' END AS Status,
    CASE 
        WHEN Status = 0 THEN '❌ INATIVO'
        WHEN '2026-05-01' < DataInicio THEN '⚠️ NÃO INICIADO'
        WHEN '2026-05-31' > DataFim THEN '⚠️ EXPIRADO'
        WHEN Status = 1 
             AND '2026-05-01' >= DataInicio 
             AND '2026-05-31' <= DataFim THEN '✅ VÁLIDO MAIO/2026'
        ELSE '⚠️ VERIFICAR'
    END AS ValidacaoMaio2026
FROM TBContratos
WHERE NumeroContrato = 'CT-2026-001';
```

**Resultado Esperado:**

| ContratoId | NumeroContrato | Status | ValidacaoMaio2026 |
|------------|----------------|--------|-------------------|
| 12 | CT-2026-001 | Ativo | ✅ VÁLIDO MAIO/2026 |

#### 7.3.4 Procedimento 2.2: Vincular Equipamentos ao Contrato

**Menu:** Medição → Contratos → [Selecionar Contrato] → Editar → Aba "Equipamentos"

**Processo:**

1. Clicar em "Adicionar Equipamento"
2. Selecionar equipamento(s) da lista
3. Salvar

**Equipamentos a Vincular:**

- GYN1R801 ✅
- GYN1R803 ✅
- GYN1R804 ✅
- GYN1R805 ✅

**Validação SQL:**

```sql
-- Verificar vinculação equipamento-contrato
SELECT 
    e.CodigoEquipamento,
    c.NumeroContrato,
    c.Orgao,
    CASE WHEN c.Status = 1 THEN 'Ativo' ELSE 'Inativo' END AS StatusContrato,
    ce.Id AS VinculoId,
    CASE 
        WHEN ce.Id IS NULL THEN '❌ EQUIPAMENTO NÃO VINCULADO'
        WHEN c.Status = 0 THEN '⚠️ CONTRATO INATIVO'
        ELSE '✅ VINCULADO'
    END AS StatusVinculo
FROM TBEquipamentos e
LEFT JOIN TBContratosEquipamentos ce ON ce.EquipamentoId = e.Id
LEFT JOIN TBContratos c ON c.Id = ce.ContratoId
WHERE e.CodigoEquipamento IN ('GYN1R801', 'GYN1R803')
ORDER BY e.CodigoEquipamento;
```

**Resultado Esperado:**

| CodigoEquipamento | NumeroContrato | StatusVinculo |
|-------------------|----------------|---------------|
| GYN1R801 | CT-2026-001 | ✅ VINCULADO |
| GYN1R803 | CT-2026-001 | ✅ VINCULADO |

#### 7.3.5 Checklist Etapa 2

```
ETAPA 2: CONFIGURAÇÃO CONTRATUAL
Data: ___/___/______  Contrato: ______________

[ ] Contrato cadastrado em TBContratos
[ ] Número do contrato único
[ ] Órgão preenchido corretamente
[ ] Data Início antes ou igual ao período de medição
[ ] Data Fim depois ou igual ao período de medição
[ ] Status = Ativo (checkbox marcado)
[ ] Equipamento GYN1R801 vinculado
[ ] Demais equipamentos vinculados (se aplicável)
[ ] Validação SQL executada
[ ] Vínculo confirmado (ce.Id IS NOT NULL)

Responsável: _________________ Visto: _______
```

### 7.4 Etapa 3: Configuração de Recursos

⚠️ **ATENÇÃO: Esta é a etapa mais crítica do processo!**

#### 7.4.1 Objetivo

Cadastrar os recursos financeiros para cada faixa de cada equipamento, definindo valores mensais e percentuais de BDI.

#### 7.4.2 Pré-requisitos

- Equipamento com faixas cadastradas (Etapa 1)
- Contrato criado e equipamento vinculado (Etapa 2)
- Valores contratuais definidos:
  - Valor Previsto mensal por faixa
  - Percentual de BDI
  - Período de vigência

#### 7.4.3 Regra de Negócio Crítica

**IMPORTANTE:** É necessário criar **1 recurso para CADA faixa** do equipamento!

**Exemplo:**
- Equipamento com 2 faixas → Criar 2 recursos
- Equipamento com 3 faixas → Criar 3 recursos

**Se não criar recursos, o relatório mostrará R$ 0,00!**

#### 7.4.4 Procedimento 3.1: Cadastrar Recurso para Faixa 1

**Menu:** Medição → Recursos → Novo Recurso

**Campos Obrigatórios:**

| Campo | Exemplo | Validação |
|-------|---------|-----------|
| Descrição | Radar GYN1R801 - Faixa 1 | Descritivo |
| Tipo | Equipamento | Lista predefinida |
| Contrato | CT-2026-001 | ⚠️ Obrigatório |
| Equipamento | GYN1R801 | ⚠️ Obrigatório |
| Faixa | 1 | ⚠️ Obrigatório |
| Valor Previsto | 15000.00 | ⚠️ Deve ser > 0 |
| BDI (%) | 25.00 | ⚠️ Deve ser > 0 |
| Data Início | 01/01/2026 | Deve cobrir período |
| Data Fim | 31/12/2026 | Deve cobrir período |
| Status | Ativo | ⚠️ Checkbox marcado |

**Exemplo de Preenchimento:**

```
Descrição: Radar GYN1R801 - Faixa 1
Tipo: Equipamento
Contrato: [Selecionar] CT-2026-001
Equipamento: [Selecionar] GYN1R801
Faixa: [Selecionar] 1
Valor Previsto: R$ 15.000,00
BDI (%): 25,00
Data Início: 01/01/2026
Data Fim: 31/12/2026
Status: ☑ Ativo
```

**Cálculo do Valor Total (Referência):**

```
Valor Previsto: R$ 15.000,00
BDI (25%): R$ 3.750,00
-----------------------------------
Valor Total: R$ 18.750,00
```

#### 7.4.5 Procedimento 3.2: Cadastrar Recurso para Faixa 2

**Repetir o processo** com os seguintes campos alterados:

```
Descrição: Radar GYN1R801 - Faixa 2
Faixa: [Selecionar] 2
(Demais campos iguais)
```

#### 7.4.6 Validação Completa de Recursos

**Query SQL de Diagnóstico Automático:**

```sql
-- ⭐ QUERY CRÍTICA: Diagnóstico completo de recursos
SELECT 
    e.CodigoEquipamento AS Equipamento,
    f.NumeroFaixa AS Faixa,
    r.Id AS RecursoId,
    r.Descricao AS DescricaoRecurso,
    r.ValorPrevisto,
    r.Bdi,
    CASE WHEN r.Status = 1 THEN 'Ativo' ELSE 'Inativo' END AS StatusRecurso,
    CONVERT(VARCHAR(10), r.DataInicio, 103) AS InicioVigencia,
    CONVERT(VARCHAR(10), r.DataFim, 103) AS FimVigencia,
    c.NumeroContrato AS Contrato,
    
    -- ⭐ DIAGNÓSTICO AUTOMÁTICO
    CASE 
        WHEN r.Id IS NULL THEN '🔴 RECURSO NÃO CADASTRADO'
        WHEN r.ContratoId IS NULL THEN '🔴 SEM CONTRATO VINCULADO'
        WHEN c.Id IS NULL THEN '🔴 CONTRATO NÃO ENCONTRADO'
        WHEN c.Status = 0 THEN '🔴 CONTRATO INATIVO'
        WHEN r.Status = 0 THEN '🔴 RECURSO INATIVO'
        WHEN r.ValorPrevisto IS NULL OR r.ValorPrevisto = 0 
            THEN '🔴 VALOR PREVISTO ZERADO'
        WHEN r.Bdi IS NULL OR r.Bdi = 0 
            THEN '🟡 BDI ZERADO (Opcional)'
        WHEN '2026-05-01' < r.DataInicio 
            THEN '🔴 VIGÊNCIA NÃO INICIADA'
        WHEN '2026-05-31' > COALESCE(r.DataFim, '9999-12-31') 
            THEN '🔴 VIGÊNCIA EXPIRADA'
        WHEN '2026-05-01' < c.DataInicio OR '2026-05-31' > c.DataFim 
            THEN '🔴 CONTRATO FORA VIGÊNCIA'
        ELSE '✅ CONFIGURAÇÃO OK'
    END AS Diagnostico

FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
LEFT JOIN TBRecursos r ON r.EquipamentoId = e.Id 
    AND r.FaixaId = f.Id
LEFT JOIN TBContratos c ON c.Id = r.ContratoId

WHERE e.CodigoEquipamento = 'GYN1R801'

ORDER BY 
    e.CodigoEquipamento,
    f.NumeroFaixa;
```

**Resultado Esperado (APÓS CADASTRO CORRETO):**

| Equipamento | Faixa | RecursoId | ValorPrevisto | Bdi | Diagnostico |
|-------------|-------|-----------|---------------|-----|-------------|
| GYN1R801 | 1 | 9001 | 15000.00 | 25.00 | ✅ CONFIGURAÇÃO OK |
| GYN1R801 | 2 | 9002 | 15000.00 | 25.00 | ✅ CONFIGURAÇÃO OK |

**Resultado Problemático (SE NÃO CADASTROU):**

| Equipamento | Faixa | RecursoId | ValorPrevisto | Bdi | Diagnostico |
|-------------|-------|-----------|---------------|-----|-------------|
| GYN1R801 | 1 | NULL | NULL | NULL | 🔴 RECURSO NÃO CADASTRADO |
| GYN1R801 | 2 | NULL | NULL | NULL | 🔴 RECURSO NÃO CADASTRADO |

#### 7.4.7 Script SQL de Correção Automática

**Caso os recursos não tenham sido cadastrados**, utilize este script:

```sql
-- ============================================================================
-- SCRIPT DE CORREÇÃO: Cadastrar recursos ausentes
-- ============================================================================
-- ⚠️ ATENÇÃO: Ajuste os valores conforme o contrato!

-- Passo 1: Definir variáveis
DECLARE @ContratoId INT;
DECLARE @ValorPrevisto DECIMAL(18,2);
DECLARE @Bdi DECIMAL(5,2);
DECLARE @DataInicio DATE;
DECLARE @DataFim DATE;
DECLARE @UsuarioId INT;

-- Passo 2: Obter ID do contrato
SELECT @ContratoId = Id 
FROM TBContratos 
WHERE NumeroContrato = 'CT-2026-001';

-- Passo 3: Definir valores (⚠️ AJUSTAR CONFORME CONTRATO!)
SET @ValorPrevisto = 15000.00;  -- R$ 15.000,00 por faixa
SET @Bdi = 25.00;                -- 25% de BDI
SET @DataInicio = '2026-01-01';  -- Início vigência
SET @DataFim = '2026-12-31';     -- Fim vigência
SET @UsuarioId = 1;              -- ID do usuário (ajustar)

-- Passo 4: Inserir recursos para faixas sem cadastro
INSERT INTO TBRecursos (
    Descricao,
    Tipo,
    EquipamentoId,
    FaixaId,
    ContratoId,
    ValorPrevisto,
    Bdi,
    Status,
    DataInicio,
    DataFim,
    DataCriacao,
    UsuarioCriacaoId
)
SELECT 
    e.CodigoEquipamento + ' - Faixa ' + CAST(f.NumeroFaixa AS VARCHAR) AS Descricao,
    'Equipamento' AS Tipo,
    e.Id AS EquipamentoId,
    f.Id AS FaixaId,
    @ContratoId AS ContratoId,
    @ValorPrevisto AS ValorPrevisto,
    @Bdi AS Bdi,
    1 AS Status, -- Ativo
    @DataInicio AS DataInicio,
    @DataFim AS DataFim,
    GETDATE() AS DataCriacao,
    @UsuarioId AS UsuarioCriacaoId
FROM TBEquipamentos e
INNER JOIN TBFaixas f ON f.EquipamentoId = e.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
  AND NOT EXISTS (
      SELECT 1 FROM TBRecursos r 
      WHERE r.EquipamentoId = e.Id 
        AND r.FaixaId = f.Id
  );

-- Passo 5: Mostrar resultado
SELECT 
    'Recursos inseridos:' AS Resultado, 
    @@ROWCOUNT AS Quantidade;

-- Passo 6: Validar inserção
SELECT 
    e.CodigoEquipamento,
    f.NumeroFaixa,
    r.Id AS RecursoId,
    r.Descricao,
    r.ValorPrevisto,
    r.Bdi,
    c.NumeroContrato
FROM TBRecursos r
JOIN TBEquipamentos e ON r.EquipamentoId = e.Id
JOIN TBFaixas f ON r.FaixaId = f.Id
JOIN TBContratos c ON r.ContratoId = c.Id
WHERE e.CodigoEquipamento = 'GYN1R801'
ORDER BY f.NumeroFaixa;
```

#### 7.4.8 Checklist Etapa 3

```
ETAPA 3: CONFIGURAÇÃO DE RECURSOS ⚠️ CRÍTICO
Data: ___/___/______  Equipamento: ______________

FAIXA 1:
[ ] Recurso cadastrado em TBRecursos
[ ] Descrição preenchida
[ ] Contrato vinculado (ContratoId preenchido)
[ ] Equipamento vinculado (EquipamentoId preenchido)
[ ] Faixa 1 selecionada (FaixaId preenchido)
[ ] Valor Previsto > 0 (ex: R$ 15.000,00)
[ ] BDI > 0 (ex: 25,00%)
[ ] Data Início <= período de medição
[ ] Data Fim >= período de medição
[ ] Status = Ativo (checkbox marcado)

FAIXA 2:
[ ] Recurso cadastrado em TBRecursos
[ ] Descrição preenchida
[ ] Contrato vinculado (ContratoId preenchido)
[ ] Equipamento vinculado (EquipamentoId preenchido)
[ ] Faixa 2 selecionada (FaixaId preenchido)
[ ] Valor Previsto > 0 (ex: R$ 15.000,00)
[ ] BDI > 0 (ex: 25,00%)
[ ] Data Início <= período de medição
[ ] Data Fim >= período de medição
[ ] Status = Ativo (checkbox marcado)

VALIDAÇÃO:
[ ] Query de diagnóstico executada
[ ] Ambas faixas com "✅ CONFIGURAÇÃO OK"
[ ] Recursos aparecem na listagem de Medição → Recursos

Responsável: _________________ Visto: _______
```

---

(Continua...)