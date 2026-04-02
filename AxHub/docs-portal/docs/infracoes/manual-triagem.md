---
sidebar_position: 3
title: "Manual de Triagem"
description: Manual completo e visual para analistas realizarem triagem de infrações no AxHub — passo a passo ilustrado com imagens de cada etapa
---

# Manual de Triagem — Guia do Analista

Este manual foi criado para **analistas de triagem**. Ele explica, passo a passo e com imagens, como revisar, validar ou descartar infrações no AxHub.

:::info Para quem é este manual?
Analistas responsáveis pela **revisão visual das infrações** capturadas pelos equipamentos de fiscalização (radares, câmeras, lombadas eletrônicas).
:::

---

## O que é a Triagem?

A triagem é a etapa onde **você, analista**, revisa cada infração capturada pelo equipamento antes que ela siga para auditoria e exportação ao órgão autuador.

Sua análise garante que:
- ✅ Apenas infrações **válidas** e com **dados corretos** sigam adiante
- ❌ Infrações com **imagem ruim**, **placa ilegível** ou **erros de captura** sejam descartadas
- 🔒 O processo atenda aos **requisitos legais** do contrato

:::warning Responsabilidade do analista
Cada infração validada poderá gerar uma **multa real** ao condutor do veículo. Revise com atenção.
:::

---

## Como Acessar a Triagem

### Passo 1 — Fazer login no sistema

Acesse o AxHub pelo navegador e faça login com seu usuário e senha.

![Tela de login do AxHub](../img/Login.png)

### Passo 2 — Navegar até a Triagem

No menu lateral esquerdo, clique em **Infrações** e depois em **Triagem**.

![Menu principal — acesso à Triagem](../img/triagem-menu-principal.png)

---

## Tela Principal de Triagem

Ao entrar na triagem, você verá a tela de **consulta de infrações**.

![Tela de consulta de infrações na Triagem](../img/triagem-consultar-infracoes.png)

### O que cada área da tela significa

| Área | O que você encontra |
|------|---------------------|
| **Filtros** (topo) | Campos para buscar infrações por período, status, tipo, operação |
| **Lista de infrações** (centro) | Todas as infrações que correspondem aos filtros aplicados |
| **Paginação** (rodapé) | Navegação entre páginas quando há muitos registros |
| **Botões de ação** | Validar, Descartar, Reabrir |

---

## Passo a Passo — Realizando a Triagem

### Passo 1 — Definir os filtros de busca

Antes de iniciar, filtre as infrações que você vai analisar.

![Filtros disponíveis na Triagem](../img/triagem-filtro-auditoria.png)

**Filtros recomendados para o trabalho diário:**

| Filtro | Valor recomendado | Por quê |
|--------|-------------------|---------|
| **Período** | Data de hoje (ou ontem) | Focar nas mais recentes |
| **Status Triagem** | `Pendente` | Ver só o que ainda não foi analisado |
| **Operação** | Sua operação responsável | Focar no seu escopo de trabalho |

:::tip Dica
Sempre comece filtrando pelo status **"Pendente"** para ver apenas o que ainda precisa ser triado.
:::

Após configurar os filtros, clique em **Pesquisar** ou pressione **Enter**.

---

### Passo 2 — Visualizar o resultado

Após a pesquisa, a lista de infrações pendentes é carregada.

![Resultado da consulta de infrações](../img/triagem-consultar-resultado.png)

Cada linha mostra:

| Coluna | O que significa |
|--------|-----------------|
| **Número Auto** | Identificador único da infração |
| **Placa** | Placa capturada pelo OCR |
| **Data/Hora** | Quando ocorreu a infração |
| **Tipo** | Tipo de infração (velocidade, sinal, etc.) |
| **Vel. Medida** | Velocidade capturada pelo equipamento |
| **Vel. Considerada** | Velocidade após aplicação da tolerância legal |
| **Vel. Regulamentada** | Limite de velocidade permitido no local |
| **Status** | `Pendente` · `Válida` · `Descartada` |
| **Operador** | Quem realizou a triagem (em branco = pendente) |

---

### Passo 3 — Abrir e analisar a infração

Clique sobre a infração para abri-la. Você verá a imagem capturada e todos os dados.

:::info O que você deve verificar obrigatoriamente em cada infração:
:::

#### ✅ Checklist de análise

| # | O que verificar | Como verificar | Critério para VALIDAR |
|---|-----------------|----------------|-----------------------|
| 1 | **Placa legível?** | Olhar a imagem — a placa deve estar clara, sem obstrução | Todos os caracteres da placa devem ser legíveis |
| 2 | **Placa correta?** | Comparar placa na imagem com placa no sistema | A placa reconhecida deve corresponder à placa na foto |
| 3 | **Veículo na imagem é o infrator?** | Verificar que não há outro veículo obstruindo | O veículo que aparece na imagem é o que cometeu a infração |
| 4 | **Velocidade coerente?** | Ver velocidade medida vs. velocidade regulamentada | Vel. considerada deve ser MAIOR que vel. regulamentada |
| 5 | **Enquadramento correto?** | Verificar o tipo de infração e artigo | Deve corresponder ao tipo de via e comportamento detectado |
| 6 | **Qualidade da imagem?** | Verificar se a imagem está nítida, com boa iluminação | Imagem deve permitir identificação clara do veículo e placa |
| 7 | **Data e hora plausíveis?** | Conferir se a data/hora da infração faz sentido | Sem datas futuras ou muito defasadas |

---

### Passo 4 — Decidir: Validar ou Descartar

Após verificar todos os campos, tome sua decisão:

#### 🟢 Quando VALIDAR

Clique em **Validar** quando **todos** os critérios do checklist estiverem atendidos.

```
✅ Placa legível e correta
✅ Veículo correto na imagem
✅ Velocidade acima do limite
✅ Enquadramento correto
✅ Imagem nítida e clara
    ↓
  VALIDAR
```

Ao validar, a infração recebe status **"Válida"** e segue automaticamente para a fila de **Auditoria**.

---

#### 🔴 Quando DESCARTAR

Clique em **Descartar** quando qualquer um dos critérios abaixo for identificado:

| Motivo de descarte | Descrição |
|--------------------|-----------|
| **Placa ilegível** | Não é possível ler a placa na imagem |
| **Imagem escura / borrada** | Qualidade insuficiente para identificação |
| **Placa divergente** | Placa na imagem diferente da placa no sistema |
| **Veículo não identificado** | Não é possível ver o veículo claramente |
| **Velocidade incoerente** | Velocidade registrada suspeita (muito acima ou abaixo) |
| **Enquadramento incorreto** | Tipo de infração não corresponde ao ocorrido |
| **Exceção não processada** | Veículo isento que não foi descartado automaticamente |
| **Erro de captura** | Imagem de teste, erro técnico ou duplicidade |

:::danger Atenção: Motivo obrigatório
Ao descartar, você **obrigatoriamente** deve selecionar o motivo do descarte. Sem motivo, o sistema não permite prosseguir.
:::

```
❌ Placa ilegível
❌ Imagem escura
❌ Veículo errado
❌ Enquadramento errado
    ↓
  DESCARTAR
  (selecionar motivo)
    ↓
 Status: "Descartada"
```

---

#### 🔄 Quando REABRIR

Use **Reabrir** quando uma infração foi descartada por engano e precisa de nova análise.

:::warning Cuidado
Reabrir infrações altera o histórico. Sempre registre observação explicando o motivo da reabertura.
:::

---

### Passo 5 — Confirmar a decisão

Após clicar em Validar ou Descartar, o sistema solicita confirmação. Revise e confirme.

A infração muda de status imediatamente e o resultado aparece na lista atualizada.

![Resultado atualizado após triagem](../img/triagem-consultar-resultado.png)

---

## Casos Especiais — O que fazer quando...

### 🟡 A placa está parcialmente legível

Se **parte da placa está legível** mas alguns caracteres estão duvidosos:
1. Compare com a placa registrada no sistema
2. Se a discrepância for de apenas 1 caractere e o restante bate, **valide** e registre observação
3. Se a placa não pode ser confirmada com segurança, **descarte** com motivo "Placa ilegível"

---

### 🟡 A velocidade parece muito alta

Se a velocidade registrada parece anormalmente alta (ex: 200 km/h em via urbana):
1. Verifique duplo: a operação e os limites configurados para aquela faixa
2. Se a operação e os dados estiverem corretos no sistema, **valide** normalmente
3. Se houver suspeita de erro de equipamento, **descarte** com motivo "Velocidade incoerente" e **reporte ao supervisor**

---

### 🟡 O veículo é uma ambulância / viatura policial

Se o veículo reconhecido aparenta ser emergência:
1. Verifique se há placa de exceção cadastrada para este veículo
2. **Não descarte manualmente** — acione o supervisor para cadastrar a exceção corretamente
3. Enquanto aguarda, **valide temporariamente** para não perder o registro

---

### 🟡 A imagem mostra dois veículos

Se mais de um veículo aparece na imagem:
1. Identifique qual veículo ativou o sensor (geralmente o mais próximo do equipamento)
2. Verifique se a placa do sistema corresponde ao veículo correto
3. Se não for possível determinar com certeza, **descarte** com motivo "Veículo não identificado"

---

### 🟡 A data/hora parece errada

Se a data da infração é uma data futura ou muito defasada do esperado:
1. Compare com a data de importação do lote
2. Se parecer erro de relógio do equipamento, **descarte** e **reporte ao supervisor técnico**

---

## Acompanhando seu Desempenho

O AxHub registra o trabalho de cada analista. Você pode verificar seu desempenho nos relatórios:

**Menu** → **Relatórios** → **Relatório de Processamento de Imagens por Usuário**

![Relatório de processamento de imagens por usuário](../img/Relatorio%20-%20Relatorio%20de%20procesamento%20de%20imagens%20por%20usu%C3%A1rio.png)

Este relatório mostra:
- Total de infrações analisadas por você
- Quantas foram validadas vs. descartadas
- Taxa de validação / descarte
- Comparativo entre analistas

:::info Metas de qualidade
Contratos com requisitos de qualidade podem ter metas de taxa de validação. Consulte seu supervisor sobre os indicadores do seu contrato.
:::

---

## Infrações Descartadas — Consulta

Para ver todas as infrações que foram descartadas (por você ou por outros analistas):

**Menu** → **Infrações** → **Descartadas**

![Consulta de Infrações Descartadas](../img/triagem-infracoes-descartadas.png)

Use esta tela para:
- Verificar o motivo do descarte de uma infração específica
- Reabrir uma infração descartada por engano
- Auditar descartes suspeitos

---

## Exceções Automáticas

O sistema pode descartar infrações **automaticamente**, antes mesmo de chegarem à sua fila, quando regras de exceção estão configuradas.

**Menu** → **Infrações** → **Exceções**

![Tela de Exceções automáticas](../img/triagem-excecoes.png)

Se uma infração de um veículo isento chegou até você, **acione o supervisor** — a regra de exceção pode não estar cadastrada.

---

## Atalhos e Dicas de Produtividade

| Situação | O que fazer |
|----------|-------------|
| Muitas infrações pendentes | Filtre por **tipo de infração** e work em lotes homogêneos |
| Dúvida sobre enquadramento | Consulte **Administração → Enquadramentos** para ver a descrição |
| Placa divergente recorrente de um equipamento | Reporte ao suporte — pode ser calibração do OCR |
| Sistema lento ao carregar imagens | Recarregue a página e verifique conexão de rede |
| Infração reaberta pelo auditor | Ela volta ao status "Pendente" e reaparece na sua fila |

---

## Resumo Visual do Processo

```
  Infração capturada pelo equipamento
             ↓
  Importada para o AxHub (status: Aguardando Triagem)
             ↓
  Exceção automática? ──SIM──→ Descartada automaticamente
             ↓ NÃO
  Analista abre a infração
             ↓
  ┌──────────────────────────────────┐
  │  Verifica:                       │
  │  □ Placa legível e correta?      │
  │  □ Veículo correto na imagem?    │
  │  □ Velocidade coerente?          │
  │  □ Enquadramento correto?        │
  │  □ Imagem com boa qualidade?     │
  └──────────────────────────────────┘
             ↓
     Tudo OK?
    ╱         ╲
  SIM          NÃO
   ↓             ↓
VALIDAR       DESCARTAR
   ↓          (motivo obrigatório)
Status:            ↓
"Válida"       Status:
   ↓          "Descartada"
   ↓
Auditoria
   ↓
Exportação ao órgão autuador
```

---

## Próximas Etapas Após a Triagem

Após validar uma infração, ela segue automaticamente para:

| Etapa | O que acontece |
|-------|----------------|
| [**Auditoria**](./auditoria) | Um auditor confere sua análise |
| [**Exportação**](./exportacao) | O sistema gera o lote para o órgão autuador |

---

## Navegação Relacionada

| Página | Descrição |
|--------|-----------|
| [Auditoria](./auditoria) | Next step — como o auditor revisa as infrações validadas |
| [Exceções](./excecoes) | Regras de descarte automático antes da triagem |
| [Infrações Descartadas](./infracoes-descartadas) | Consultar e reabrir infrações descartadas |
| [Exportação](./exportacao) | Como as infrações são enviadas ao órgão |
| [Motivos de Descarte](../administracao/motivos-descartes) | Configurar os motivos disponíveis |
| [Guia Completo do Processo](./guia-completo-infracoes) | Visão geral de todas as etapas |
