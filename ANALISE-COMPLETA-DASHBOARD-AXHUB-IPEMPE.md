# Análise Completa do Dashboard AxHub — IPEMPE

## 📋 Sumário Executivo

Este documento detalha **todos os componentes do dashboard** do sistema AxHub utilizado pelo IPEMPE (Instituto de Pesos e Medidas do Estado de Pernambuco), explicando:

- **O que significa** cada informação exibida
- **Como é gerado** cada dado (processo técnico)
- **Onde estão armazenados** (tabelas do banco de dados)
- **Para que serve** cada componente do ponto de vista operacional

---

## 🎯 Visão Geral do Dashboard

O **Dashboard** é a **tela inicial do AxHub** após o login. Apresenta uma visão consolidada e em tempo real das operações de fiscalização de trânsito, incluindo:

1. **Triagem Mensal** — Estatísticas de processamento de imagens
2. **Mapa de Equipamentos** — Localização geográfica dos equipamentos
3. **Painel Sinótico** — Grupos de equipamentos e filtros
4. **Status dos Equipamentos** — Situação operacional de cada equipamento
5. **Defasagem de Processamento** — Atraso no processamento de imagens
6. **Imagens Capturadas na Semana** — Volume de capturas e análises

---

## 📊 1. Triagem Mensal

### O que é?

Gráfico de linhas mostrando a **evolução mensal do processamento de imagens** capturadas pelos equipamentos de fiscalização.

### Informações exibidas

| Linha | Descrição | Cor |
|-------|-----------|-----|
| **Total de Imagens** | Total de imagens capturadas pelos equipamentos no mês | Azul |
| **Total Descartes** | Imagens descartadas (não geraram infração) | Verde |
| **Total Processadas** | Imagens que passaram pela triagem e foram validadas | Laranja |

### Como é gerado

#### Fonte de dados

```sql
-- Consulta simplificada do backend
SELECT 
    MONTH(DataHoraPassagem) AS Mes,
    COUNT(*) AS TotalImagens,
    SUM(CASE WHEN Status = 'Descartada' THEN 1 ELSE 0 END) AS TotalDescartes,
    SUM(CASE WHEN Status = 'Validada' THEN 1 ELSE 0 END) AS TotalProcessadas
FROM TBPassagens p
LEFT JOIN TBTriagens t ON p.IdPassagem = t.IdPassagem
WHERE YEAR(DataHoraPassagem) = YEAR(GETDATE())
GROUP BY MONTH(DataHoraPassagem)
ORDER BY Mes
```

#### Tabelas envolvidas

- **TBPassagens** — Registro de cada veículo detectado
- **TBTriagens** — Status da triagem (Pendente, Aprovada, Descartada)
- **TBImagemPassagens** — Imagens capturadas

#### Processo técnico

1. **Captura**: Equipamento detecta veículo e envia imagem para o servidor
2. **Registro**: Sistema cria registro em `TBPassagens` com data/hora, placa (OCR), velocidade
3. **Triagem**: Operador/IA valida ou descarta a passagem em `TBTriagens`
4. **Agregação**: Dashboard consulta registros agrupados por mês

### Para que serve?

- **Monitorar volume operacional**: Quantidade de imagens processadas mensalmente
- **Identificar tendências**: Aumento/redução de capturas ao longo do ano
- **Avaliar qualidade**: Taxa de descarte vs. validação
- **Planejamento**: Dimensionar equipe de triagem conforme demanda

---

## 🗺️ 2. Mapa de Equipamentos

### O que é?

Mapa geográfico interativo exibindo a **localização em tempo real de todos os equipamentos** cadastrados no sistema.

### Informações exibidas

| Elemento | Descrição |
|----------|-----------|
| **Marcadores coloridos** | Cada cor representa um **Grupo de Equipamentos** diferente |
| **Ícone azul (câmera)** | Equipamento online e operacional |
| **Ícone vermelho** | Equipamento offline ou com problemas |
| **Contador no ícone** | Número de equipamentos naquele ponto (quando agrupados) |
| **Legenda inferior** | "9 Grupos de Equipamentos" com filtros por grupo |

### Como é gerado

#### Fonte de dados

```sql
-- Consulta backend para alimentar o mapa
SELECT 
    e.IdEquipamento,
    e.Descricao AS NomeEquipamento,
    e.Latitude,
    e.Longitude,
    g.NomeGrupo,
    g.Cor AS CorGrupo,
    h.DataHora AS UltimoHeartbeat,
    CASE 
        WHEN h.DataHora > DATEADD(HOUR, -2, GETDATE()) THEN 'Online'
        ELSE 'Offline'
    END AS StatusConexao
FROM TBEquipamentos e
INNER JOIN TBGrupoEquipamentos g ON e.IdGrupo = g.IdGrupo
LEFT JOIN TBHeartbeatEquipamentos h ON e.IdEquipamento = h.IdEquipamento
WHERE e.Ativo = 1
```

#### Tabelas envolvidas

- **TBEquipamentos** — Cadastro dos equipamentos (coordenadas geográficas)
- **TBGrupoEquipamentos** — Agrupamento lógico (projeto, cliente, região)
- **TBHeartbeatEquipamentos** — Último sinal de comunicação recebido

#### Processo técnico

1. **Cadastro**: Equipamento é cadastrado com Latitude/Longitude
2. **Heartbeat**: Equipamento envia sinal periódico (a cada X minutos)
3. **Registro**: Sistema atualiza `TBHeartbeatEquipamentos` com data/hora atual
4. **Plotagem**: Dashboard lê coordenadas e plota no mapa usando biblioteca (Google Maps / Leaflet)
5. **Coloração**: Aplica cor do Grupo de Equipamentos ao marcador
6. **Status**: Se última comunicação > 2 horas, marca como offline (vermelho)

### Para que serve?

- **Monitoramento geográfico**: Visualizar distribuição territorial dos equipamentos
- **Detecção rápida de falhas**: Identificar equipamentos offline por região
- **Planejamento de manutenção**: Roteirizar visitas técnicas
- **Análise de cobertura**: Identificar gaps de fiscalização

---

## 🎛️ 3. Painel Sinótico

### O que é?

Interface de **seleção e filtragem por Grupos de Equipamentos**. Permite visualizar apenas os dados de um grupo específico.

### Informações exibidas

- **Dropdown "Grupos de Equipamentos"**: Lista de grupos cadastrados
- **Botão "Tela cheia"**: Expande o painel sinótico em tela cheia
- **Botão "Atualizar"**: Recarrega os dados do painel

### Como é gerado

#### Fonte de dados

```sql
-- Listar grupos disponíveis
SELECT 
    IdGrupo,
    NomeGrupo,
    Cor,
    DesabilitarMonitoramento,
    COUNT(e.IdEquipamento) AS TotalEquipamentos
FROM TBGrupoEquipamentos g
LEFT JOIN TBEquipamentos e ON g.IdGrupo = e.IdGrupo
WHERE e.Ativo = 1
GROUP BY IdGrupo, NomeGrupo, Cor, DesabilitarMonitoramento
```

#### Tabelas envolvidas

- **TBGrupoEquipamentos** — Grupos cadastrados
- **TBEquipamentos** — Equipamentos vinculados ao grupo

#### Processo técnico

1. **Cadastro de grupos**: Administrador cria grupos (Ex: "BLITZ", "AXION")
2. **Vinculação**: Cada equipamento é associado a um grupo no cadastro
3. **Filtro dinâmico**: Ao selecionar um grupo, dashboard filtra apenas dados daquele grupo
4. **Aplicação de cor**: Grupo define cor dos marcadores no mapa

### Para que serve?

- **Organização lógica**: Separar equipamentos por projeto, cliente ou região
- **Filtragem rápida**: Visualizar apenas dados de um grupo específico
- **Gestão por contrato**: Isolar operações de diferentes clientes
- **Controle de monitoramento**: Desabilitar alertas de grupos inativos

---

## ✅ 4. Status dos Equipamentos

### O que é?

Lista exibindo a **situação operacional atual de cada equipamento**, mostrando se está online, offline, e quando foi a última comunicação.

### Informações exibidas (baseado na imagem)

| Equipamento | Informações | Status |
|-------------|-------------|--------|
| **PE005C** | Serra Talhada-PE<br/>Número de Faixas 2<br/>16/06 15:50 | ✅ Online (verde) |
| **PE012C** | São José da Egito-PE<br/>Número de Faixas 2<br/>16/06 15:55 | ✅ Online (verde) |
| **PE602C** | Igarassu-PE<br/>Número de Faixas 7<br/>13/12 21:00 | ❌ Offline (vermelho) |
| **PE601C** | Igarassu-PE<br/>Número de Faixas 7<br/>13/01 15:18 | ❌ Offline (vermelho) |
| **PE004C** | Belo Jardim-PE<br/>Número de Faixas 2<br/>28/02 09:51 | ❌ Offline (vermelho) |

### Detalhamento dos campos

| Campo | Descrição | Origem |
|-------|-----------|--------|
| **Código do equipamento** | Identificador único (Ex: PE005C) | `TBEquipamentos.Codigo` |
| **Local** | Cidade/rodovia onde está instalado | `TBEquipamentos.Descricao` ou operação vinculada |
| **Número de Faixas** | Quantidade de faixas monitoradas | `COUNT(*)` em `TBFaixas` onde `IdEquipamento` |
| **Data/Hora** | Última comunicação recebida | `TBHeartbeatEquipamentos.DataHora` |
| **Status (ícone)** | ✅ Verde = Online<br/>❌ Vermelho = Offline | Calculado: se `DataHora` < 2h = Online |

### Como é gerado

#### Fonte de dados

```sql
-- Query completa para Status dos Equipamentos
SELECT 
    e.Codigo AS CodigoEquipamento,
    e.Descricao AS LocalEquipamento,
    COUNT(DISTINCT f.IdFaixa) AS NumeroFaixas,
    h.DataHora AS UltimaComunicacao,
    CASE 
        WHEN h.DataHora >= DATEADD(HOUR, -2, GETDATE()) THEN 'Online'
        ELSE 'Offline'
    END AS Status,
    DATEDIFF(MINUTE, h.DataHora, GETDATE()) AS MinutosSemSinal
FROM TBEquipamentos e
LEFT JOIN TBFaixas f ON e.IdEquipamento = f.IdEquipamento
LEFT JOIN TBHeartbeatEquipamentos h ON e.IdEquipamento = h.IdEquipamento
WHERE e.Ativo = 1
GROUP BY e.Codigo, e.Descricao, h.DataHora
ORDER BY Status DESC, h.DataHora DESC
```

#### Tabelas envolvidas

- **TBEquipamentos** — Cadastro dos equipamentos
- **TBFaixas** — Faixas de rodagem monitoradas por cada equipamento
- **TBHeartbeatEquipamentos** — Pulso de comunicação (heartbeat)
- **TBOperacoes** — Vincula equipamento a operação (local específico)

#### Processo técnico detalhado

##### 1. Cadastro inicial
- Equipamento é cadastrado em `TBEquipamentos` com código único (PE005C)
- Faixas são cadastradas em `TBFaixas` vinculadas ao equipamento

##### 2. Heartbeat (pulso de vida)
- **O que é**: Sinal periódico enviado pelo equipamento para o servidor
- **Frequência**: Geralmente a cada 5-10 minutos
- **Dados enviados**: 
  - ID do equipamento
  - Data/hora atual
  - Status operacional
  - Opcionalmente: temperatura, espaço em disco, etc.
- **Registro**: Sistema atualiza/insere em `TBHeartbeatEquipamentos`

```sql
-- Exemplo de INSERT/UPDATE do heartbeat
MERGE TBHeartbeatEquipamentos AS target
USING (SELECT @IdEquipamento AS IdEquipamento, GETDATE() AS DataHora) AS source
ON target.IdEquipamento = source.IdEquipamento
WHEN MATCHED THEN 
    UPDATE SET DataHora = source.DataHora
WHEN NOT MATCHED THEN
    INSERT (IdEquipamento, DataHora) VALUES (source.IdEquipamento, source.DataHora);
```

##### 3. Determinação do status
- **Online**: Última comunicação há menos de 2 horas
- **Offline**: Última comunicação há mais de 2 horas
- **Cálculo em tempo real**: Dashboard consulta `TBHeartbeatEquipamentos` e compara `DataHora` com `GETDATE()`

##### 4. Contagem de faixas
```sql
-- Contar faixas do equipamento
SELECT COUNT(*) AS NumeroFaixas
FROM TBFaixas
WHERE IdEquipamento = @IdEquipamento
  AND Ativa = 1
```

##### 5. Renderização no dashboard
- **Backend (API)**: Endpoint `/api/dashboard/status-equipamentos`
- **Frontend (React)**: Componente `StatusEquipamentos.jsx`
- **Atualização**: Automática a cada 30-60 segundos (polling ou WebSocket)

### Para que serve?

#### Operacional
- ✅ **Monitoramento em tempo real**: Saber quais equipamentos estão operacionais
- ⚠️ **Alertas de falha**: Identificar offline imediatamente
- 📞 **Suporte técnico**: Priorizar atendimento a equipamentos offline críticos

#### Gerencial
- 📊 **Disponibilidade**: Calcular % uptime dos equipamentos
- 📉 **SLA**: Verificar cumprimento de contratos de manutenção
- 💰 **Medições**: Validar pagamento por equipamento ativo

#### Análise de dados
- **PE602C e PE601C offline desde dezembro/janeiro**: Possíveis problemas:
  - Equipamento desligado/danificado
  - Problema de comunicação (rede, modem)
  - Manutenção pendente
- **PE005C e PE012C online recentemente**: Funcionamento normal

---

## 📉 5. Defasagem de Processamento

### O que é?

Indicador de **atraso no processamento de imagens** capturadas. Mostra quantas imagens estão aguardando triagem/análise.

### Informações exibidas

| Campo | Descrição |
|-------|-----------|
| **Defasagem** | Nome/tipo do atraso |
| **Quantidade** | Número de imagens em atraso |

### Como é gerado

#### Fonte de dados

```sql
-- Calcular defasagem de processamento
SELECT 
    'Imagens Pendentes' AS Defasagem,
    COUNT(*) AS Quantidade
FROM TBPassagens p
LEFT JOIN TBTriagens t ON p.IdPassagem = t.IdPassagem
WHERE t.IdTriagem IS NULL -- Sem triagem
  AND p.DataHoraPassagem < DATEADD(HOUR, -24, GETDATE()) -- Mais de 24h
```

#### Tabelas envolvidas

- **TBPassagens** — Imagens capturadas
- **TBTriagens** — Triagens realizadas

#### Processo técnico

1. **Captura**: Equipamento envia imagem
2. **Fila de processamento**: Sistema adiciona à fila de triagem
3. **SLA de processamento**: Exemplo - 24h para triar imagem
4. **Cálculo de defasagem**: Imagens com mais de 24h sem triagem

### Para que serve?

- **Gestão de equipe**: Dimensionar analistas de triagem
- **Alertas de SLA**: Evitar estouro de prazos contratuais
- **Priorização**: Processar imagens mais antigas primeiro

---

## 📷 6. Imagens Capturadas na Semana

### O que é?

Estatísticas de **processamento de imagens nos últimos 7 dias**.

### Informações exibidas (baseado na imagem)

| Indicador | Valor | Descrição |
|-----------|-------|-----------|
| **Total** | 273 | Total de imagens capturadas na semana |
| **Não Analisadas** | 0 | Imagens aguardando triagem |
| **Analisadas** | 269 | Imagens que passaram por triagem |
| **Válidas** | 135 | Imagens aprovadas (geraram infração) |

### Como é gerado

#### Fonte de dados

```sql
-- Estatísticas da semana
SELECT 
    COUNT(*) AS Total,
    SUM(CASE WHEN t.IdTriagem IS NULL THEN 1 ELSE 0 END) AS NaoAnalisadas,
    SUM(CASE WHEN t.IdTriagem IS NOT NULL THEN 1 ELSE 0 END) AS Analisadas,
    SUM(CASE WHEN t.Status = 'Aprovada' THEN 1 ELSE 0 END) AS Validas
FROM TBPassagens p
LEFT JOIN TBTriagens t ON p.IdPassagem = t.IdPassagem
WHERE p.DataHoraPassagem >= DATEADD(DAY, -7, GETDATE())
```

#### Tabelas envolvidas

- **TBPassagens** — Imagens capturadas
- **TBTriagens** — Status da triagem

#### Processo técnico

1. **Período**: Últimos 7 dias corridos (rolling window)
2. **Agregação**: Conta registros por status
3. **Atualização**: A cada consulta (tempo real)

### Para que serve?

- **Produtividade**: Avaliar volume de triagens realizadas
- **Qualidade**: Taxa de aprovação (135/269 = 50,2%)
- **Operação**: Verificar se há atraso no processamento

---

## 🔄 Fluxo Completo de Geração de Dados

### 1. Captura no Equipamento

```
┌─────────────────────┐
│  EQUIPAMENTO CAMPO  │
│  (Radar/OCR)        │
└──────────┬──────────┘
           │
           │ 1. Detecta veículo
           │ 2. Captura imagem
           │ 3. OCR lê placa
           │ 4. Mede velocidade
           │
           ▼
┌─────────────────────┐
│  Envia para         │
│  Servidor AxHub     │
└─────────────────────┘
```

### 2. Processamento no Servidor

```
┌─────────────────────────────────────────────┐
│             SERVIDOR AXHUB                  │
├─────────────────────────────────────────────┤
│                                             │
│  1. Recebe dados do equipamento             │
│  2. Registra em TBPassagens                 │
│  3. Salva imagem em TBImagemPassagens       │
│  4. Atualiza TBHeartbeatEquipamentos        │
│  5. Verifica regras de infração             │
│  6. Cria registro em TBInfracoes (se válido)│
│  7. Envia para fila de triagem              │
│                                             │
└─────────────────────────────────────────────┘
           │
           │
           ▼
┌─────────────────────────────────────────────┐
│          TRIAGEM (Operador/IA)              │
├─────────────────────────────────────────────┤
│                                             │
│  1. Operador acessa tela de Triagem         │
│  2. Visualiza imagem e dados                │
│  3. Valida ou Descarta                      │
│  4. Sistema registra em TBTriagens          │
│                                             │
└─────────────────────────────────────────────┘
           │
           │
           ▼
┌─────────────────────────────────────────────┐
│          AUDITORIA/EXPORTAÇÃO               │
├─────────────────────────────────────────────┤
│                                             │
│  1. Infrações validadas vão para Auditoria  │
│  2. Auditor faz revisão final               │
│  3. Sistema gera lote de exportação         │
│  4. Envia para órgão autuador (DETRAN)      │
│                                             │
└─────────────────────────────────────────────┘
```

### 3. Atualização do Dashboard

```
┌─────────────────────────────────────────────┐
│          DASHBOARD (Frontend React)          │
├─────────────────────────────────────────────┤
│                                             │
│  1. A cada 30-60 segundos faz polling       │
│  2. Chama API: /api/dashboard/resumo        │
│  3. Recebe JSON com estatísticas            │
│  4. Atualiza componentes:                   │
│     - Triagem Mensal (gráfico)              │
│     - Status Equipamentos (lista)           │
│     - Mapa (marcadores)                     │
│     - Imagens da Semana (cards)             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📊 Tabelas do Banco de Dados — Resumo

| Tabela | Função | Usada em |
|--------|--------|----------|
| **TBEquipamentos** | Cadastro de equipamentos | Mapa, Status Equipamentos |
| **TBGrupoEquipamentos** | Agrupamento de equipamentos | Mapa (cores), Painel Sinótico |
| **TBFaixas** | Faixas de rodagem monitoradas | Status Equipamentos (contagem) |
| **TBHeartbeatEquipamentos** | Pulso de comunicação | Status Equipamentos (online/offline) |
| **TBPassagens** | Detecções de veículos | Triagem Mensal, Imagens da Semana |
| **TBTriagens** | Triagem de passagens | Triagem Mensal, Imagens da Semana |
| **TBInfracoes** | Infrações geradas | Dashboard (indicadores) |
| **TBImagemPassagens** | Imagens capturadas | Triagem Mensal |
| **TBOperacoes** | Operações de fiscalização | Status Equipamentos (local) |

---

## 🎯 Análise da Imagem Fornecida (IPEMPE)

### Observações

1. **Data do dashboard**: 06/2026 (junho de 2026)

2. **Triagem Mensal**: 
   - Pico de processamento em fevereiro/março
   - Redução significativa em junho
   - Total Descartes acompanha Total de Imagens (padrão esperado)

3. **Status dos Equipamentos**:
   - ✅ **2 equipamentos online**: PE005C (Serra Talhada), PE012C (São José da Egito)
   - ❌ **3 equipamentos offline**: PE602C, PE601C, PE004C
   - **Problema crítico**: PE602C offline desde 13/12 (6 meses!)
   - **Problema crítico**: PE601C offline desde 13/01 (5 meses!)
   - **Problema crítico**: PE004C offline desde 28/02 (4 meses!)
   
   **Ação recomendada**: Verificar urgentemente esses 3 equipamentos

4. **Mapa de Equipamentos**:
   - 9 Grupos cadastrados (BLITZ e AXION visíveis)
   - Distribuição geográfica em Pernambuco
   - Cluster de equipamentos em algumas regiões

5. **Imagens da Semana**:
   - 273 imagens capturadas
   - 0 não analisadas (excelente! SLA cumprido)
   - 269 analisadas (98,5%)
   - 135 válidas (50,2% de aprovação)
   
   **Taxa de aprovação de 50%** é razoável, indica:
   - ✅ Boa qualidade de captura
   - ✅ Filtros bem calibrados
   - ⚠️ Possível otimização: reduzir capturas desnecessárias

6. **Defasagem de Processamento**: Vazio (ótimo!)

---

## 📚 Glossário para o Usuário Final

| Termo | Significado |
|-------|-------------|
| **Online** | Equipamento está funcionando e enviando dados |
| **Offline** | Equipamento sem comunicação há mais de 2 horas |
| **Heartbeat** | "Pulso de vida" — sinal periódico do equipamento |
| **Triagem** | Revisão manual/automática das imagens capturadas |
| **Validar** | Aprovar uma imagem (gera infração) |
| **Descartar** | Rejeitar uma imagem (não gera infração) |
| **Faixas** | Número de faixas de rodagem monitoradas |
| **Grupo de Equipamentos** | Organização lógica (projeto, cliente, região) |
| **Painel Sinótico** | Interface de controle e filtragem |
| **Defasagem** | Atraso no processamento de imagens |
| **OCR** | Tecnologia de leitura automática de placas |

---

## ✅ Recomendações

### Operacionais

1. **Equipamentos offline**: Investigar urgentemente PE602C, PE601C, PE004C
2. **Heartbeat**: Configurar alertas automáticos quando equipamento ficar > 2h offline
3. **SLA de triagem**: Manter 0 imagens não analisadas (meta atual cumprida)

### Técnicas

1. **Monitoramento proativo**: Implementar alertas via WhatsApp/e-mail
2. **Dashboard mobile**: Criar versão mobile para gestores
3. **Histórico de uptime**: Adicionar gráfico de disponibilidade mensal

### Documentação

1. **Atualizar doc do dashboard**: Incluir esta análise na documentação oficial
2. **Criar guia para operadores**: "Como interpretar o dashboard"
3. **Vídeo tutorial**: Gravar explicação dos componentes

---

## 📞 Contato

Para dúvidas sobre este documento:
- **Equipe**: Axion Tecnologia
- **Sistema**: AxHub v3.x
- **Cliente**: IPEMPE — Instituto de Pesos e Medidas de Pernambuco

---

**Documento gerado em**: 2026-06-16  
**Versão**: 1.0  
**Status**: ✅ Completo
