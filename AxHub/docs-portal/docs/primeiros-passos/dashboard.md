---
sidebar_position: 2
title: Dashboard
description: Painel principal do sistema AxHub com monitoramento em tempo real
---

# Dashboard

O Dashboard e a tela inicial do AxHub apos o login. Apresenta indicadores, mapa de equipamentos e alertas em **tempo real**.

## Como acessar

O Dashboard e exibido automaticamente apos o Login. Clique no logo do AxHub para retornar.

## Visao Geral

![Dashboard](../img/Dasboard.png)

O dashboard é composto por seis componentes principais:

1. **Triagem Mensal** — Estatísticas de processamento de imagens
2. **Mapa de Equipamentos** — Localização geográfica e status
3. **Painel Sinótico** — Filtros por grupo de equipamentos
4. **Status dos Equipamentos** — Situação operacional em tempo real
5. **Defasagem de Processamento** — Atraso no processamento
6. **Imagens Capturadas na Semana** — Volume de capturas e análises

---

## Icones de Atalho

![Icones de Atalho](../img/dashboard-icones-atalho.png)

Atalhos rápidos para as funcionalidades mais utilizadas do sistema.

---

## Triagem Mensal

Gráfico de linhas mostrando a **evolução mensal do processamento de imagens** capturadas pelos equipamentos de fiscalização.

### Informações exibidas

| Linha | Descrição | Cor |
|-------|-----------|-----|
| **Total de Imagens** | Total de imagens capturadas pelos equipamentos no mês | Azul |
| **Total Descartes** | Imagens descartadas (não geraram infração) | Verde |
| **Total Processadas** | Imagens que passaram pela triagem e foram validadas | Laranja |

### Como interpretar

- **Picos de processamento**: Indicam períodos de maior fiscalização
- **Taxa de descarte**: Compare verde vs azul para avaliar qualidade de captura
- **Tendências**: Identifique aumento ou redução de volume ao longo do ano

:::tip Uso gerencial
Use este gráfico para:
- Dimensionar equipe de triagem conforme demanda
- Identificar sazonalidade nas capturas
- Avaliar efetividade operacional
:::

---

## Painel Sinotico

![Painel Sinotico](../img/dashboard-painel-sinotico.png)

![Painel Sinotico Tela Cheia](../img/dashboard-painel-sinotico-tela-cheia.png)

Interface de **seleção e filtragem por Grupos de Equipamentos**. Permite visualizar apenas os dados de um grupo específico (projeto, cliente ou região).

### Funcionalidades

| Controle | Função |
|----------|--------|
| **Dropdown Grupos** | Seleciona grupo específico para filtrar dashboard |
| **Tela cheia** | Expande o painel sinótico em tela cheia |
| **Atualizar** | Recarrega os dados do painel |

:::info Grupos de Equipamentos
Grupos são configurados em **Equipamentos → Grupos de Equipamentos**. Cada grupo possui uma cor que identifica seus equipamentos no mapa.
:::

---

## Status dos Equipamentos

![Status dos Equipamentos](../img/dashboard-status-equipamento.png)

![Status dos Equipamentos Tela Cheia](../img/dashboard-status-equipamento-tela-cheia.png)

Lista exibindo a **situação operacional atual de cada equipamento** em tempo real.

### Informações exibidas

| Campo | Descrição | Origem dos dados |
|-------|-----------|------------------|
| **Código** | Identificador único do equipamento (Ex: PE005C) | Cadastro do equipamento |
| **Local** | Cidade/rodovia onde está instalado | Descrição do equipamento ou operação |
| **Número de Faixas** | Quantidade de faixas monitoradas | Contagem de faixas cadastradas |
| **Data/Hora** | Última comunicação recebida (heartbeat) | Registro de heartbeat |
| **Status** | ✅ Verde = Online<br/>❌ Vermelho = Offline | Calculado em tempo real |

### Como funciona o Status

O status é determinado pelo **heartbeat** (pulso de vida) do equipamento:

#### ✅ Online
- Última comunicação **há menos de 2 horas**
- Equipamento está funcionando e enviando dados
- Ícone verde com check (✓)

#### ❌ Offline
- Última comunicação **há mais de 2 horas**
- Equipamento pode estar:
  - Desligado ou danificado
  - Com problema de comunicação (rede, modem)
  - Em manutenção sem registro
- Ícone vermelho com X (✗)

:::warning Equipamentos Offline
Equipamentos offline por longos períodos (dias/semanas) indicam falha crítica. Entre em contato com o suporte técnico imediatamente.
:::

### O que é Heartbeat?

**Heartbeat** (pulso de vida) é um sinal periódico enviado pelo equipamento para o servidor, confirmando que está operacional.

- **Frequência**: Geralmente a cada 5-10 minutos
- **Dados enviados**: ID do equipamento, data/hora, status operacional
- **Registro**: Sistema atualiza tabela `TBHeartbeatEquipamentos`

:::tip Monitoramento Proativo
Configure alertas automáticos (email/WhatsApp) quando um equipamento ficar offline por mais de 30 minutos. Entre em contato com o suporte Axion para ativar.
:::

### Para que serve

#### Operacional
- ✅ Monitorar quais equipamentos estão funcionando
- ⚠️ Identificar falhas imediatamente
- 📞 Priorizar atendimento técnico

#### Gerencial
- 📊 Calcular % de disponibilidade (uptime)
- 📉 Verificar SLA de contratos de manutenção
- 💰 Validar pagamento por equipamento ativo

---

---

## Mapa de Equipamentos

![Mapa de Equipamentos](../img/dashboard-mapa-equipamento.png)

Mapa geográfico interativo exibindo a **localização em tempo real de todos os equipamentos** cadastrados no sistema.

### Informações exibidas

| Elemento | Descrição |
|----------|-----------|
| **Marcadores coloridos** | Cada cor representa um **Grupo de Equipamentos** diferente |
| **Ícone azul (câmera)** | Equipamento online e operacional |
| **Ícone vermelho** | Equipamento offline ou com problemas |
| **Contador no ícone** | Número de equipamentos naquele ponto (quando agrupados) |
| **Legenda inferior** | "X Grupos de Equipamentos" com filtros por grupo |

### Cores dos marcadores

A cor de cada marcador é definida pelo **Grupo de Equipamentos** ao qual ele pertence:

- Configure cores em: **Equipamentos → Grupos de Equipamentos**
- Escolha cores distintas para facilitar identificação visual
- Mesmas cores aparecem no mapa e na legenda

### Para que serve

- **Monitoramento geográfico**: Visualizar distribuição territorial
- **Detecção rápida de falhas**: Identificar equipamentos offline por região
- **Planejamento de manutenção**: Roteirizar visitas técnicas
- **Análise de cobertura**: Identificar gaps de fiscalização

:::tip Navegação no mapa
- **Zoom**: Use a roda do mouse ou os controles +/- no canto
- **Mover**: Clique e arraste o mapa
- **Detalhes**: Clique em um marcador para ver informações do equipamento
:::

---

## Defasagem de Processamento

Indicador de **atraso no processamento de imagens** capturadas. Mostra quantas imagens estão aguardando triagem/análise além do prazo estabelecido.

### Informações exibidas

| Campo | Descrição |
|-------|-----------|
| **Defasagem** | Nome/tipo do atraso |
| **Quantidade** | Número de imagens em atraso |

### Como é calculado

- **SLA de processamento**: Geralmente 24 horas para triar uma imagem
- **Defasagem**: Imagens capturadas há mais de 24h sem triagem
- **Cálculo**: Conta registros em `TBPassagens` sem registro em `TBTriagens`

:::warning Alerta de SLA
Defasagem alta indica:
- ⚠️ Volume de capturas maior que capacidade de triagem
- ⚠️ Necessidade de ampliar equipe de analistas
- ⚠️ Risco de estouro de prazos contratuais
:::

:::tip Meta operacional
**Meta ideal: 0 imagens em defasagem**

Se a defasagem estiver alta:
1. Priorize imagens mais antigas
2. Aloque mais analistas temporariamente
3. Avalie ajuste de configurações de captura
:::

---

## Imagens Capturadas na Semana

Estatísticas de **processamento de imagens nos últimos 7 dias**.

### Informações exibidas

| Indicador | Descrição |
|-----------|-----------|
| **Total** | Total de imagens capturadas na semana |
| **Não Analisadas** | Imagens aguardando triagem (pendentes) |
| **Analisadas** | Imagens que passaram por triagem |
| **Válidas** | Imagens aprovadas (geraram infração) |

### Como interpretar

#### Taxa de Análise
```
Taxa = (Analisadas / Total) × 100%
Meta: > 95%
```

Se < 95%: Há atraso no processamento, verificar defasagem.

#### Taxa de Aprovação
```
Taxa = (Válidas / Analisadas) × 100%
Faixa esperada: 40-60%
```

- **< 40%**: Capturas com baixa qualidade ou filtros muito restritivos
- **40-60%**: Taxa normal e saudável
- **> 60%**: Possível subfiltragem, revisar critérios de descarte

:::tip Análise Semanal
Use esses indicadores para:
- **Produtividade**: Avaliar volume de triagens realizadas
- **Qualidade**: Verificar taxa de aprovação
- **SLA**: Garantir que Não Analisadas esteja próximo de 0
:::

---

## Alertas de Afericao

![Alertas de Afericao](../img/dashboard-alertas-afericao.png)

Lista de equipamentos com **certificados INMETRO próximos do vencimento** ou já vencidos.

### Informações exibidas

| Coluna | Descrição |
|--------|-----------|
| **Equipamento** | Código e descrição do equipamento |
| **Certificado** | Número do certificado INMETRO |
| **Vencimento** | Data de vencimento do certificado |
| **Status** | Dias restantes ou "Vencido" |

### Prazos de alerta

| Status | Prazo | Ação |
|--------|-------|------|
| 🟢 **OK** | > 30 dias | Sem ação necessária |
| 🟡 **Atenção** | 15-30 dias | Agendar aferição |
| 🟠 **Urgente** | 1-14 dias | Priorizar aferição |
| 🔴 **Vencido** | 0 dias | Equipamento inválido para gerar infrações |

:::danger Certificado Vencido
Infrações capturadas por equipamentos com certificado INMETRO vencido são **automaticamente invalidadas** pelo sistema e não podem ser exportadas.

**Ação obrigatória**: Realizar aferição imediatamente.
:::

:::info Gerenciamento de Aferições
- Registre aferições em: **Operações → Aferições**
- Sistema alerta automaticamente quando próximo do vencimento
- Configure email/WhatsApp para receber alertas antecipados
:::

---

## Triagem Mensal

---

## Triagem Mensal (Gráfico)

![Triagem Mensal](../img/dashboard-triagem-mensal.png)

Gráfico visual da evolução mensal — veja seção "Triagem Mensal" no início deste documento para detalhes.

---

## OCR Ultimas 48 Horas

Exibe o aproveitamento de leitura de placas pelo OCR nas últimas 48 horas.

| Indicador | Descrição |
|-----------|-----------|
| **Aproveitamento OCR (%)** | Percentual de placas lidas corretamente pelo OCR |
| **Passagens** | Total de passagens de veículos registradas no período |
| **Leituras** | Total de leituras de placa realizadas com sucesso |

### Como interpretar

#### Aproveitamento OCR
```
Aproveitamento = (Leituras / Passagens) × 100%
Meta: > 85%
```

- **> 85%**: Excelente qualidade de captura
- **70-85%**: Qualidade aceitável, possível melhoria
- **< 70%**: Problema crítico, verificar:
  - Câmeras desalinhadas
  - Iluminação inadequada
  - Lentes sujas
  - Configuração OCR

:::tip Otimização do OCR
Para melhorar o aproveitamento:
- ✅ Ajustar ângulo das câmeras
- ✅ Instalar iluminação infravermelha
- ✅ Limpar lentes periodicamente
- ✅ Calibrar região de interesse (ROI)
- ✅ Atualizar algoritmo de OCR
:::

---

## Ultimos Eventos

![Ultimos Eventos](../img/dashboard-ultimos-eventos.png)

Registro cronológico dos **últimos eventos e ocorrências** dos equipamentos.

### Tipos de eventos

| Tipo | Descrição | Ícone |
|------|-----------|-------|
| **Online** | Equipamento retornou ao funcionamento | 🟢 |
| **Offline** | Equipamento parou de comunicar | 🔴 |
| **Manutenção** | Registro manual de manutenção | 🔧 |
| **Falha** | Problema detectado automaticamente | ⚠️ |
| **Aferição** | Certificado atualizado | 📋 |

### Para que serve

- **Auditoria**: Rastrear histórico de problemas
- **Manutenção preditiva**: Identificar equipamentos com falhas recorrentes
- **SLA**: Comprovar tempo de indisponibilidade

:::info Eventos Completos
Para visualizar o histórico completo de eventos, acesse:  
**Operações → [Eventos de Equipamentos](../operacoes/eventos-equipamentos)**
:::

---

## Indicadores

| Indicador | Descricao | Como é calculado |
|-----------|-----------|------------------|
| **Passagens hoje** | Total de passagens capturadas no dia | Conta registros em `TBPassagens` com data de hoje |
| **Infracoes pendentes** | Infracoes aguardando triagem | Conta registros em `TBInfracoes` com status "Pendente" |
| **Equipamentos offline** | Equipamentos sem comunicacao | Conta equipamentos sem heartbeat há > 2 horas |
| **Certificados vencendo** | Certificados INMETRO proximo do vencimento | Conta equipamentos com vencimento < 30 dias |

:::tip Interpretação dos Indicadores
- **Passagens hoje**: Indica volume operacional diário. Compare com média histórica.
- **Infrações pendentes**: Meta ideal < 100. Se > 500, há gargalo na triagem.
- **Equipamentos offline**: Meta ideal = 0. Qualquer valor > 0 requer atenção imediata.
- **Certificados vencendo**: Meta ideal = 0. Agende aferições com antecedência.
:::

---

## ⚡ Atualização em Tempo Real

O dashboard é **automaticamente atualizado** para exibir dados em tempo real.

### Frequência de atualização

| Componente | Atualização |
|------------|-------------|
| **Status Equipamentos** | A cada 30 segundos |
| **Mapa de Equipamentos** | A cada 60 segundos |
| **Indicadores** | A cada 30 segundos |
| **Gráfico Triagem Mensal** | A cada 5 minutos |
| **Imagens da Semana** | A cada 60 segundos |

:::info Atualização Manual
Para forçar atualização imediata:
1. Clique no botão **"Atualizar"** no Painel Sinótico
2. Ou recarregue a página (F5)
:::

---

## 🎯 Melhores Práticas

### Para Operadores

1. **Monitore equipamentos offline diariamente**
   - ✅ Equipamentos offline > 30 min → Verificar no local
   - ✅ Equipamentos offline > 2h → Abrir chamado técnico

2. **Mantenha triagem em dia**
   - ✅ Meta: 0 imagens não analisadas
   - ✅ Priorize imagens mais antigas

3. **Acompanhe taxa de aprovação**
   - ✅ Se < 40%, revisar qualidade de capturas
   - ✅ Se > 70%, revisar critérios de descarte

### Para Gestores

1. **Revise dashboard semanalmente**
   - 📊 Analisar tendências do gráfico de triagem mensal
   - 📊 Verificar uptime dos equipamentos
   - 📊 Avaliar produtividade da equipe

2. **Configure alertas proativos**
   - ⚠️ Email/WhatsApp quando equipamento ficar offline
   - ⚠️ Notificação de certificados vencendo
   - ⚠️ Alerta de defasagem > 100 imagens

3. **Documente ocorrências**
   - 📝 Registre eventos em **Operações → Eventos de Equipamentos**
   - 📝 Mantenha histórico de manutenções
   - 📝 Rastreie falhas recorrentes

---

## 🔧 Solução de Problemas

### Dashboard não carrega

**Possíveis causas:**
- ❌ Sessão expirada → Faça login novamente
- ❌ Problema de rede → Verifique conexão com internet
- ❌ Servidor fora do ar → Entre em contato com suporte

**Ação:** Recarregue a página (F5) ou limpe cache do navegador (Ctrl+Shift+Del)

### Equipamento aparece offline mas está funcionando

**Possíveis causas:**
- ❌ Heartbeat não está sendo enviado
- ❌ Problema na rede do equipamento
- ❌ Configuração incorreta do IP/porta

**Ação:** 
1. Verifique se o equipamento está realmente enviando dados
2. Consulte **Operações → Monitoramento Online** para mais detalhes
3. Entre em contato com suporte técnico Axion

### Dados não atualizam automaticamente

**Possíveis causas:**
- ❌ JavaScript desabilitado no navegador
- ❌ Extensões de bloqueio interferindo
- ❌ Problema de conexão

**Ação:** 
1. Verifique se JavaScript está habilitado
2. Desabilite temporariamente bloqueadores de anúncio
3. Use Chrome ou Edge para melhor compatibilidade

---

## 📚 Termos Técnicos

| Termo | Significado |
|-------|-------------|
| **Online** | Equipamento está funcionando e enviando dados |
| **Offline** | Equipamento sem comunicação há mais de 2 horas |
| **Heartbeat** | "Pulso de vida" — sinal periódico do equipamento |
| **Triagem** | Revisão manual/automática das imagens capturadas |
| **Defasagem** | Atraso no processamento de imagens |
| **OCR** | Tecnologia de leitura automática de placas |
| **Uptime** | Percentual de tempo que equipamento está online |
| **SLA** | Acordo de Nível de Serviço (prazos contratuais) |

---

## Navegacao relacionada

| Tipo | Pagina | Descricao |
|------|--------|-----------|
| Anterior | [Login](./login) | Autenticacao do sistema |
| Proximo | [Navegacao](./navegacao) | Como navegar pelo sistema |
| Relacionado | [Monitoramento Online](../operacoes/monitoramento-online) | Detalhes dos equipamentos |
| Relacionado | [Eventos de Equipamentos](../operacoes/eventos-equipamentos) | Historico de eventos |
| Relacionado | [Triagem](../infracoes/triagem) | Processo de triagem de infracoes |
| Relacionado | [Grupos de Equipamentos](../cadastros-basicos/grupos-equipamentos) | Configurar grupos e cores |
| Glossario | [Afericao](../glossario/afericao) | Certificado de afericao INMETRO |
| Tecnico | [Banco de Dados](../referencia-tecnica/banco-de-dados) | Referencia tecnica das tabelas SQL |
